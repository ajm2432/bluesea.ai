'use client';

import React, { useState, useEffect } from 'react';
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
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    
    const cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider({ region: 'us-east-1' });

    useEffect(() => {
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');
        if (accessToken && !isTokenExpired(accessToken)) {
            setIsAuthenticated(true);
        } else if (refreshToken) {
            refreshAccessToken(refreshToken);
        }
        setLoading(false);
    }, []);

    const isTokenExpired = (token: string): boolean => {
        if (!token) return true;
        const decoded = JSON.parse(atob(token.split('.')[1]));
        const expirationTime = decoded.exp * 1000; // convert to milliseconds
        return Date.now() > expirationTime;
    };

    const refreshAccessToken = async (refreshToken: string) => {
      const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;
      
      if (!clientId) {
          throw new Error("Client ID is not defined");
      }
  
      const params = {
          AuthFlow: 'REFRESH_TOKEN_AUTH',
          ClientId: clientId,
          AuthParameters: {
              REFRESH_TOKEN: refreshToken,
          },
      };
  
      try {
          const data = await cognitoidentityserviceprovider.initiateAuth(params).promise();
          if (data.AuthenticationResult) {
              const { AccessToken, IdToken, RefreshToken } = data.AuthenticationResult;
  
              // Check if the tokens are defined before storing them
              if (AccessToken && IdToken && RefreshToken) {
                  localStorage.setItem('accessToken', AccessToken);
                  localStorage.setItem('idToken', IdToken);
                  localStorage.setItem('refreshToken', RefreshToken);
                  setIsAuthenticated(true);
              } else {
                  console.error('One or more tokens are missing:', { AccessToken, IdToken, RefreshToken });
              }
          } else {
              console.error('No authentication result returned during token refresh');
          }
      } catch (error) {
          console.error('Error refreshing access token', error);
      }
  };
  

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
        } else if (data.AuthenticationResult) {
            console.log(data);
            const { AccessToken, IdToken, RefreshToken } = data.AuthenticationResult;

            // Check if the tokens are defined before storing them
            if (AccessToken && IdToken && RefreshToken) {
                localStorage.setItem('accessToken', AccessToken);
                localStorage.setItem('idToken', IdToken);
                localStorage.setItem('refreshToken', RefreshToken);
                setIsAuthenticated(true);
            } else {
                setError("Login failed: one or more tokens are missing.");
                console.error('One or more tokens are missing:', { AccessToken, IdToken, RefreshToken });
            }
        } else {
            setError("Login failed: no authentication result returned.");
        }
    } catch (err) {
        const error = err as AWSError;
        const errorMessage = error.message || "An unknown error occurred";
        setError(errorMessage);
        console.log(error, error.stack);
    }
};


    const handleLogout = () => {
        setIsAuthenticated(false);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('idToken');
        localStorage.removeItem('refreshToken');
        setError(null); // Clear any errors on logout
    };

    const handleNewPassword = async (newPassword: string) => {
      if (!challengeSession) {
          console.error("No challenge session available.");
          return;
      }
  
      const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;
      if (!clientId) {
          setError("Client ID is not defined");
          return;
      }
  
      const params = {
          ChallengeName: 'NEW_PASSWORD_REQUIRED',
          ClientId: clientId,
          Session: challengeSession,
          ChallengeResponses: {
              USERNAME: challengeParameters?.USER_ID_FOR_SRP || '',
              NEW_PASSWORD: newPassword,
          },
      };
  
      try {
          const data = await cognitoidentityserviceprovider.respondToAuthChallenge(params).promise();
          if (data.AuthenticationResult) {
              console.log("Password reset successful", data);
              const { AccessToken, IdToken, RefreshToken } = data.AuthenticationResult;
  
              if (AccessToken && IdToken && RefreshToken) {
                  localStorage.setItem('accessToken', AccessToken);
                  localStorage.setItem('idToken', IdToken);
                  localStorage.setItem('refreshToken', RefreshToken);
                  setIsAuthenticated(true);
              } else {
                  setError("Login failed: one or more tokens are missing.");
                  console.error('One or more tokens are missing:', { AccessToken, IdToken, RefreshToken });
              }
          } else {
              console.error("Password reset successful but no authentication result returned.");
              setError("Password reset successful but no authentication result returned.");
          }
      } catch (err) {
          if (err instanceof Error) { // Type guard to ensure err is of type Error
              console.error("Error resetting password:", err);
              setError(err.message || "An error occurred while resetting the password.");
          } else {
              console.error("Unexpected error resetting password:", err);
              setError("An unexpected error occurred while resetting the password.");
          }
      }
  };
  
  

  if (loading) {
    return (
        <div style={styles.loadingContainer}>
            <img src="/wave.png" alt="Loading logo" style={styles.logo} />
        </div>
    );
}

    return (
        <div>
            {isAuthenticated ? (
                <div>
                    <TopNavBar onLogout={handleLogout} />
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
  loadingContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#f0f0f0',
  },
  logo: {
      width: '100px',
      animation: 'spin 2s linear infinite',
  },
  '@keyframes spin': {
      '0%': {
          transform: 'rotate(0deg)',
      },
      '100%': {
          transform: 'rotate(360deg)',
      },
  },
};
