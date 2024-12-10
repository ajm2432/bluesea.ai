'use client';

import React, { useState } from 'react';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import { useTheme } from 'next-themes';

interface LoginFormProps {
  onLogin?: (username: string, password: string) => void;
  onToggle?: (username: string) => void; // Callback for Forgot Password
  error?: string | null;
}

export default function LoginForm({ 
  onLogin = () => {}, 
  onToggle = () => {}, 
  error = null 
}: LoginFormProps) {
    const { theme } = useTheme();
    const isDarkMode = theme === 'dark';
    const [forgotPasswordError, setForgotPasswordError] = useState<string | null>(null);
    const [noEmailError, setNoEmailError] = useState<string | null>(null);
    return (
        <div style={styles.container}>
            <Formik
                initialValues={{
                    username: '',
                    password: '',
                }}
                validate={(values) => {
                    const errors: { username?: string; password?: string } = {};
                    if (!values.username) {
                        errors.username = 'Username is required';
                    }
                    if (!values.password) {
                        errors.password = 'Password is required';
                    }
                    return errors;
                }}
                onSubmit={(values) => {
                    // Pass username and password to onLogin
                    if (values.username && values.password) {
                        onLogin(values.username, values.password);
                    
                    }
                    else {
                        setNoEmailError("Error: Please enter your username to login.");
                    }
                }}
            >
                {({ values }) => (
                    <Form style={styles.form}>
                        <div style={styles.titleContainer}>
                            
                            <img src="/wave.png" alt="Wave" style={styles.logo} />
                            <div className="flex items-center space-x-2">
                        <div className="text-xl font-bold text-blue-500 tracking-tight">
                            Seaside
                        </div>
                        <div className="text-xl font-light text-gray-900 tracking-tight">
                            Software Solutions
                        </div>
                        </div>
                        </div>
                        {error && <div style={styles.error}>{error}</div>}
                        <div style={styles.inputGroup}> 
                            <Field id="username" name="username" placeholder="Username" style={styles.input} />
                            <div style={styles.error}>
                                <ErrorMessage name="username" component="span" />
                            </div>
                        </div>
                        <div style={styles.inputGroup}>
                            <Field type="password" id="password" name="password" placeholder="Password" style={styles.input} />
                            <div style={styles.error}>
                                <ErrorMessage name="password" component="span" />
                            </div>
                        </div>
                        
                        <button type="submit" style={styles.button}
            
                        >Login
                
                            </button> 
                        
                        <button
                            type="button"
                            onClick={() => {
                                if (values.username) {
                                    setForgotPasswordError(null);
                                    onToggle(values.username);
                                }
                                 else {
                                    setForgotPasswordError("Error: Please enter your username to reset your password.");
                                }
                            }}
                            style={styles.button}
                        >
                            Forgot Password?
                        </button>
                        {forgotPasswordError && (
                            <div style={styles.error}>{forgotPasswordError}</div>
                        )}
                    </Form>
                )}
            </Formik>
        </div>
    );
}

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column' as const,
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f0f0f0',
    },
    form: {
        background: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        width: '375px',
    },
    titleContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '1rem',
    },
    logo: {
        width: '30px',
        height: '30px',
        marginRight: '10px',
    },
    title: {
        margin: 0,
    },
    inputGroup: {
        marginBottom: 'rem',
    },
    input: {
        width: '100%',
        padding: '0.5rem',
        borderRadius: '4px',
        border: '1px solid #ccc',
    },
    button: {
        width: '100%',
        padding: '0.5rem',
        borderRadius: '4px',
        border: 'none',
        backgroundColor: '#3b82f6',
        marginBottom: '16px',
        color: 'white',
        fontSize: '16px',
        cursor: 'pointer',
    },
    error: {
        color: 'red',
        fontSize: '12px',
        marginBottom: '1rem',
        textAlign: 'center' as const,
    },
    toggleButton: {
        marginTop: '1rem',
        backgroundColor: '#007bff',
        color: 'white',
        padding: '0.5rem 1rem',
        borderRadius: '4px',
        cursor: 'pointer',
        border: 'none',
        fontSize: '16px',
        width: '100%',
    }
};
