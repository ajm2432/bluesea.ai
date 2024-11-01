"use client";

import React, { useEffect, useState } from 'react';
import TopNavBar from '../components/TopNavBar'; // Adjust the import path as needed
import LoginForm from '../components/LoginForm'; // Adjust the import path as needed
import MainContent from '../components/app'; // Your main content component
import { CognitoUserPool } from 'amazon-cognito-identity-js'; // Import from Cognito SDK
import { login, logout } from '../services/authService'; // Adjust the import path

const poolData = {
    UserPoolId: 'your_user_pool_id',
    ClientId: 'your_client_id',
};

const userPool = new CognitoUserPool(poolData);

export default function Home() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const user = userPool.getCurrentUser();
        if (user) {
            setIsAuthenticated(true);
        }
    }, []);

    const handleLogin = async (username, password) => {
        try {
            await login(username, password);
            setIsAuthenticated(true);
            console.log("User authenticated");
        } catch (error) {
            console.error("Login error:", error);
        }
    };

    const handleLogout = () => {
        logout();
        setIsAuthenticated(false);
        console.log("User logged out");
    };

    return (
        <div>
            {isAuthenticated ? (
                <div>
                    <TopNavBar onLogout={handleLogout} />
                    <MainContent />
                </div>
            ) : (
                <LoginForm onLogin={handleLogin} />
            )}
        </div>
    );
}

