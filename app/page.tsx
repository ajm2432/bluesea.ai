'use client';

import React, { useState } from 'react';
import TopNavBar from '../components/TopNavBar';
import MainContent from '../components/app';
import LoginForm from '../components/LoginForm';
import SignUpForm from '../components/SignUpForm';

export default function Home() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [showSignUp, setShowSignUp] = useState(false);

    // Mock credentials for demonstration
    const mockCredentials = {
        username: 'user123',
        password: 'password123',
    };

    const handleLogin = (username, password) => {
        console.log('Attempting login with', { username, password });

        // Simulate a login check
        if (username === mockCredentials.username && password === mockCredentials.password) {
            console.log('Login successful');
            setIsAuthenticated(true);
        } else {
            console.error('Login failed: Incorrect username or password');
        }
    };

    const handleSignUp = (username, password, email) => {
        console.log('Attempting sign-up with', { username, email });
        // Simulate a sign-up process (for demo, just log the info)
        console.log('Sign-up successful for:', { username, email });
        // Here you might want to reset showSignUp after signing up or confirming
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

    return (
        <div>
            {isAuthenticated ? (
                <div>
                    <TopNavBar onLogout={() => setIsAuthenticated(false)} />
                    <MainContent />
                </div>
            ) : (
                <div style={styles.container}>
                    {showSignUp ? (
                        <SignUpForm 
                            onSignUp={handleSignUp} 
                            onConfirmSignUp={handleConfirmSignUp} 
                            onBackToLogin={() => setShowSignUp(false)} // Pass the toggle function
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
