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
    const [showSignUp, setShowSignUp] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true); // Add loading state
    const cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider({ region: 'us-east-1' });

    // Use useEffect to check local storage for authentication status on mount
    useEffect(() => {
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');
        if (accessToken && !isTokenExpired(accessToken)) {
            setIsAuthenticated(true);
        } else if (refreshToken) {
            // Try to refresh token if access token is expired
            refreshAccessToken(refreshToken);
        }
        setLoading(false); // Stop loading after checking authentication
    }, []);

    const isTokenExpired = (token: string): boolean => {
        if (!token) return true;
        const decoded = JSON.parse(atob(token.split('.')[1]));
        const expirationTime = decoded.exp * 1000; // convert to milliseconds
        return Date.now() > expirationTime;
    };

    const refreshAccessToken = async (refreshToken: string) => {
        const params = {
            AuthFlow: 'REFRESH_TOKEN_AUTH',
            ClientId: process.env.NEXT_PUBLIC_CLIENT_ID,
            AuthParameters: {
                REFRESH_TOKEN: refreshToken,
            },
        };

        try {
            const data = await cognitoidentityserviceprovider.initiateAuth(params).promise();
            const { AccessToken, IdToken, RefreshToken } = data.AuthenticationResult;

            // Store new tokens
            localStorage.setItem('accessToken', AccessToken);
            localStorage.setItem('idToken', IdToken);
            localStorage.setItem('refreshToken', RefreshToken);
            setIsAuthenticated(true);
        } catch (error) {
            console.error('Error refreshing access token', error);
            // Optionally handle logout or other recovery steps
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
            } else {
                console.log(data);
                const { AccessToken, IdToken, RefreshToken } = data.AuthenticationResult;

                // Store tokens
                localStorage.setItem('accessToken', AccessToken);
                localStorage.setItem('idToken', IdToken);
                localStorage.setItem('refreshToken', RefreshToken);
                setIsAuthenticated(true);
            }
        } catch (err) {
            const error = err as AWSError; // Type assertion
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
        localStorage.removeItem('isAuthenticated'); // Remove authentication status
    };

    const handleNewPassword = (newPassword: string) => {
        if (!challengeSession) {
            console.error("No challenge session available.");
            return;
        }

        const params = {
            ChallengeName: 'NEW_PASSWORD_REQUIRED',
            ClientId: process.env.NEXT_PUBLIC_CLIENT_ID as string,
            Session: challengeSession,
            ChallengeResponses: {
                USERNAME: challengeParameters?.USER_ID_FOR_SRP,
                NEW_PASSWORD: newPassword,
            }
        };

        cognitoidentityserviceprovider.respondToAuthChallenge(params, function(err, data) {
            if (err) {
                console.log(err, err.stack);
            } else {
                console.log("Password reset successful", data);
                const { AccessToken, IdToken, RefreshToken } = data.AuthenticationResult;

                // Store tokens
                localStorage.setItem('accessToken', AccessToken);
                localStorage.setItem('idToken', IdToken);
                localStorage.setItem('refreshToken', RefreshToken);
                setIsAuthenticated(true);
                setShowResetPassword(false);
            }
        });
    };

    if (loading) {
        // Render a loading state while checking authentication
        return <div>Loading...</div>;
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
