'use client';

import React, { useState } from 'react';
import TopNavBar from '../components/TopNavBar';
import MainContent from '../components/app';
import LoginForm from '../components/LoginForm';
import SignUpForm from '../components/SignUpForm';
import ResetPasswordForm from '../components/ResetPasswordForm';
import AWS from 'aws-sdk';

export default function Home() {
    const [challengeSession, setChallengeSession] = useState(null);
    const [challengeParameters, setChallengeParameters] = useState(null);
    const [showResetPassword, setShowResetPassword] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [showSignUp, setShowSignUp] = useState(false);
    var cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider({ region: 'us-east-1' });
    const handleLogin = (username, password) => {
      console.log('Attempting login with', { username});
      var params = { 
          AuthFlow: "USER_PASSWORD_AUTH", 
          AuthParameters: {
              "PASSWORD": password, 
              "USERNAME": username
          }, 
          ClientId: process.env.NEXT_PUBLIC_CLIENT_ID
      };
      
      cognitoidentityserviceprovider.initiateAuth(params, function(err, data) {
          if (err) {
              console.log(err, err.stack); // an error occurred
          } else {
              if (data.ChallengeName === "NEW_PASSWORD_REQUIRED") {
                  console.log("New password required.");
                  setChallengeSession(data.Session); // store session for later
                  setChallengeParameters(data.ChallengeParameters);
                  setShowResetPassword(true); // Show reset password form
              } else {
                  console.log(data);
                  setIsAuthenticated(true);
              }
          }
      });
  };
  

    const handleSignUp = (username, password, email) => {
        console.log('Attempting sign-up with', { username, email });
        // Simulate a sign-up process (for demo, just log the info)
        console.log('Sign-up successful for:', { username, email });
    };

    const handleConfirmSignUp = (username, code) => {
        console.log('Confirming sign-up for', { username });
        // For demo purposes, just log confirmation
        console.log('Confirmation successful for:', { username });
        setShowSignUp(false); // Switch to login after confirmation
    };

    const toggleSignUp = () => {
        setShowSignUp(!showSignUp); // Toggle between sign-up and login
    };

    const handleNewPassword = (newPassword, givenName) => {
      const params = {
          ChallengeName: 'NEW_PASSWORD_REQUIRED',
          ClientId: process.env.NEXT_PUBLIC_CLIENT_ID,
          Session: challengeSession,
          ChallengeResponses: {
              USERNAME: challengeParameters.USER_ID_FOR_SRP,
              NEW_PASSWORD: newPassword,
          }
      };
  
      cognitoidentityserviceprovider.respondToAuthChallenge(params, function(err, data) {
          if (err) {
              console.log(err, err.stack);
          } else {
              console.log("Password reset successful", data);
              setIsAuthenticated(true); // Log the user in after password reset
              setShowResetPassword(false); // Hide reset form
          }
      });
  };
  
  return (
      <div>
          {isAuthenticated ? (
              <div>
                  <TopNavBar onLogout={() => setIsAuthenticated(false)} />
                  <MainContent />
              </div>
          ) : showResetPassword ? (
              <ResetPasswordForm onSubmit={handleNewPassword} />
          ) : (
              <div style={styles.container}>
                  {showSignUp ? (
                      <SignUpForm 
                          onSignUp={handleSignUp} 
                          onConfirmSignUp={handleConfirmSignUp} 
                          onBackToLogin={() => setShowSignUp(false)} 
                      />
                  ) : (
                      <LoginForm onLogin={handleLogin} onToggle={toggleSignUp} />
                  )}
              </div>
          )}
      </div>
  );
}

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f0f0f0',
    },
    toggleButton: {
        marginTop: '1rem',
        backgroundColor: '#007bff',
        color: 'white',
        padding: '0.5rem 1rem',
        borderRadius: '4px',
        cursor: 'pointer',
        border: 'none',
        fontSize: '16px'
    }
};
