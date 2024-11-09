'use client';

import React, { useState, useEffect } from 'react';
import TopNavBar from '../components/TopNavBar';
import MainContent from '../components/app';
import LoginForm from '../components/LoginForm';
import NewPasswordForm from '../components/NewPasswordForm';
import ResetPasswordForm from '../components/ResetPasswordForm';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import AWS, { CognitoIdentityServiceProvider, AWSError } from 'aws-sdk';

export default function Home() {
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [successMessage, setSuccessMessage] = useState<string>("");
    const [challengeSession, setChallengeSession] = useState<string | null>(null);
    const [challengeParameters, setChallengeParameters] = useState<any>(null);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showResetPassword, setShowResetPassword] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    
    const cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider({ region: 'us-east-1' });

    useEffect(() => {
        const accessToken = getCookie('accessToken');
        const refreshToken = getCookie('refreshToken');
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
        const expirationTime = decoded.exp * 1000;
        return Date.now() > expirationTime;
    };

    const refreshAccessToken = async (refreshToken: string) => {
        const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;
        
        if (!clientId) {
            setErrorMessage("Client ID is not defined");
            setShowErrorModal(true);
            return;
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
    
                if (AccessToken && IdToken && RefreshToken) {
                    setCookie('accessToken', AccessToken);
                    setCookie('idToken', IdToken);
                    setCookie('refreshToken', RefreshToken);
                    setIsAuthenticated(true);
                } else {
                    setErrorMessage('One or more tokens are missing from the authentication result');
                    setShowErrorModal(true);
                }
            } else {
                setErrorMessage('No authentication result returned during token refresh');
                setShowErrorModal(true);
            }
        } catch (error) {
            setErrorMessage('Error refreshing access token');
            setShowErrorModal(true);
        }
    };

    const handleLogin = async (username: string, password: string) => {
      setLoading(true);  // Set loading to true when login starts
      try {
          const response = await fetch('/api/login', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({ username, password }),
          });
  
          const data = await response.json();
  
          if (response.ok) {
              const { accessToken, idToken } = data;
  
              // Store access token and ID token in cookies
              setCookie('accessToken', accessToken);
              setCookie('idToken', idToken);
              setIsAuthenticated(true);
          } else {
              setErrorMessage(data.error || 'Login failed');
              setShowErrorModal(true);
          }
      } catch (error) {
        setErrorMessage('An unknown error occurred during login');
        setShowErrorModal(true);
    } finally {
        setLoading(false); // Set loading to false after the login request finishes
    }
  };

    const handleLogout = () => {
        setIsAuthenticated(false);
        setShowResetPassword(false);
        setShowNewPassword(false);
        removeCookie('accessToken');
        removeCookie('idToken');
        removeCookie('refreshToken');
    };

    const handleNewPassword = async (newPassword: string) => {
        if (!challengeSession) {
            setErrorMessage("No challenge session available.");
            setShowErrorModal(true);
            return;
        }
    
        const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;
        if (!clientId) {
            setErrorMessage("Client ID is not defined");
            setShowErrorModal(true);
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
                const { AccessToken, IdToken, RefreshToken } = data.AuthenticationResult;
    
                if (AccessToken && IdToken && RefreshToken) {
                    setCookie('accessToken', AccessToken);
                    setCookie('idToken', IdToken);
                    setCookie('refreshToken', RefreshToken);
                    setIsAuthenticated(true);
                } else {
                    setErrorMessage("Login failed: one or more tokens are missing.");
                    setShowErrorModal(true);
                }
            } else {
                setErrorMessage("Password reset successful but no authentication result returned.");
                setShowErrorModal(true);
            }
        } catch (err) {
            if (err instanceof Error) {
                setErrorMessage(err.message || "An error occurred while resetting the password.");
            } else {
                setErrorMessage("An unexpected error occurred while resetting the password.");
            }
            setShowErrorModal(true);
        }
    };

    const switchForgotPassword = async (username: string) => {
        setShowResetPassword(true);
        const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;
        if (!clientId) {
            setErrorMessage("Client ID is not defined");
            setShowErrorModal(true);
            return;
        }

        const params = {
            ClientId: clientId,
            Username: username
        };
        
        try {
            const data = await cognitoidentityserviceprovider.forgotPassword(params).promise();
            setSuccessMessage("Please check your email for a verification code");
            setShowSuccessModal(true);
        } catch (err) {
            if (err instanceof Error) {
                setErrorMessage(err.message || "An error occurred while resetting the password.");
            } else {
                setErrorMessage("An unexpected error occurred while resetting the password.");
            }
            setShowErrorModal(true);
        }
    };
    
    const handleForgotPassword = async (newPassword: string, username: string, code: string) => {
        const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;
        if (!clientId) {
            setErrorMessage("Client ID is not defined");
            setShowErrorModal(true);
            return;
        }

        const resetparams = {
            ClientId: clientId,
            ConfirmationCode: code,
            Password: newPassword,
            Username: username,
        };
 
        try {
            const data = await cognitoidentityserviceprovider.confirmForgotPassword(resetparams).promise();
            if (data) {
                setIsAuthenticated(true);
            }
        } catch (err) {
            if (err instanceof Error) {
                setErrorMessage(err.message || "An error occurred while resetting the password.");
            } else {
                setErrorMessage("An unexpected error occurred while resetting the password.");
            }
            setShowErrorModal(true);
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
                <ResetPasswordForm onSubmit={handleForgotPassword} />
            ) : showNewPassword ? (
                <NewPasswordForm onSubmit={handleNewPassword} />
            ) : (
                <div>
                    <LoginForm onLogin={handleLogin} onToggle={switchForgotPassword} />
                </div>
            )}

            <Dialog open={showErrorModal} onOpenChange={setShowErrorModal}>
                <DialogContent style={styles.modal}>
                    <DialogHeader>
                        <DialogTitle style={styles.modalTitle}>Error</DialogTitle>
                    </DialogHeader>
                    <div style={styles.modalContent}>
                        {errorMessage}
                    </div>
                    <DialogFooter>
                        <button 
                            onClick={() => setShowErrorModal(false)}
                            style={styles.button}
                        >
                            Close
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
                <DialogContent style={styles.modal}>
                    <DialogHeader>
                        <DialogTitle style={styles.modalTitle}>Check Your Inbox 📧</DialogTitle>
                    </DialogHeader>
                    <div style={styles.modalContent}>
                        {successMessage}
                    </div>
                    <DialogFooter>
                        <button 
                            onClick={() => setShowSuccessModal(false)}
                            style={styles.button}
                        >
                            Close
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
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

  modal: {
    background: 'white',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    width: '300px',
    border: 'none',
},
modalTitle: {
    margin: 0,
    fontSize: '1.25rem',
    fontWeight: 600,
    color: '#333',
    textAlign: 'center' as const,
},
modalContent: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '1rem',
    textAlign: 'center' as const,
    padding: '1rem 0',
},
button: {
    width: '100%',
    padding: '0.5rem',
    borderRadius: '4px',
    border: 'none',
    backgroundColor: '#007bff',
    marginBottom: '16px',
    color: 'white',
    fontSize: '16px',
    cursor: 'pointer',
},
};

// Helper functions to manage cookies
const setCookie = (name: string, value: string) => {
    document.cookie = `${name}=${value}; path=/; max-age=${60 * 60 * 24 * 365}`;
};

const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
};

const removeCookie = (name: string) => {
    document.cookie = `${name}=; path=/; max-age=0`;
};
