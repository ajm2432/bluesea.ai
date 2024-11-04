'use client';

import React, { useState } from 'react';
import TopNavBar from '../components/TopNavBar';
import MainContent from '../components/app';
import LoginForm from '../components/LoginForm';
import ResetPasswordForm from '../components/ResetPasswordForm';
import AWS, { CognitoIdentityServiceProvider, AWSError } from 'aws-sdk';

export default function Home() {
    const [challengeSession, setChallengeSession] = useState<string | null>(null);
    const [challengeParameters, setChallengeParameters] = useState<any>(null);
    const [showResetPassword, setShowResetPassword] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [showSignUp, setShowSignUp] = useState(false);
    const [error, setError] = useState<string | null>(null); 
    const cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider({ region: 'us-east-1' });

    const handleLogin = async (username: string, password: string) => {
      console.log('Attempting login with', { username });
  
      const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;
      if (!clientId) {
          setError("Client ID is not defined");
          return;
      }
  
      const params = { 
          AuthFlow: "USER_PASSWORD_AUTH", 
          AuthParameters: {
              "PASSWORD": password, 
              "USERNAME": username
          }, 
          ClientId: clientId
      };
      
      try {
          const data = await cognitoidentityserviceprovider.initiateAuth(params).promise();
          if (data.ChallengeName === "NEW_PASSWORD_REQUIRED") {
              console.log("New password required.");
              setChallengeSession(data.Session || null);
              setChallengeParameters(data.ChallengeParameters);
              setShowResetPassword(true);
          } else {
              console.log(data);
              setIsAuthenticated(true);
          }
      } catch (err) {
          const error = err as AWSError; // Type assertion
          const errorMessage = error.message || "An unknown error occurred";
          setError(errorMessage);
          console.log(error, error.stack);
      }
  };
  
  

    const handleSignUp = async (username: string, password: string, email: string) => {
        console.log('Attempting sign-up with', { username, email });
        // Implement sign-up logic here
        console.log('Sign-up successful for:', { username, email });
    };

    const handleConfirmSignUp = async (username: string, code: string) => {
        console.log('Confirming sign-up for', { username });
        // Implement confirmation logic here
        console.log('Confirmation successful for:', { username });
        setShowSignUp(false);
    };

    const toggleSignUp = () => {
        setShowSignUp(!showSignUp);
        setError(null); // Clear error when toggling
    };

    const handleNewPassword = (newPassword: string,) => {
      if (!challengeSession) {
          console.error("No challenge session available.");
          return;
      }
  
      const params = {
          ChallengeName: 'NEW_PASSWORD_REQUIRED',
          ClientId: process.env.NEXT_PUBLIC_CLIENT_ID as string, // Ensure ClientId is a string
          Session: challengeSession, // Ensure this is a string
          ChallengeResponses: {
              USERNAME: challengeParameters?.USER_ID_FOR_SRP, // Use optional chaining
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
            <div>
                <LoginForm onLogin={handleLogin} error={error} />
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
