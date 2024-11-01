'use client';

import React, { useState } from 'react';
import TopNavBar from '../components/TopNavBar'; 
import LoginForm from '../components/LoginForm'; 
import MainContent from '../components/app'; 

export default function Home() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const handleLogin = () => {
        setIsAuthenticated(true);
        console.log("User authenticated");
    };

    const handleLogout = () => {
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
