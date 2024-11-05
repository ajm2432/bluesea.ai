'use client';

import React from 'react';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import { useTheme } from 'next-themes';

interface LoginFormProps {
  onLogin?: (username: string, password: string) => void;
  onToggle?: () => void;
  error?: string | null;
}

export default function LoginForm({ 
  onLogin = () => {}, 
  onToggle = () => {}, 
  error = null 
}: LoginFormProps) {
    const { theme } = useTheme();
    const isDarkMode = theme === 'dark';

    return (
        <div style={styles.container}>
            <Formik
                initialValues={{
                    username: '',
                    password: '',
                }}
                onSubmit={(values) => {
                    // Pass username and password to onLogin
                    if (values.username && values.password) {
                        onLogin(values.username, values.password);
                    }
                }}
            >
                {() => (
                    <Form style={styles.form}>
                        <div style={styles.titleContainer}>
                            <img src="/wave.png" alt="Wave" style={styles.logo} />
                            <h2
                                style={{
                                    ...styles.title,
                                    color: isDarkMode ? '#000' : '#333',
                                }}
                            >
                                WavyLogic.ai
                            </h2>
                        </div>
                        {error && <div style={styles.error}>{error}</div>}
                        <div style={styles.inputGroup}>
                            <Field id="username" name="username" placeholder="Username" style={styles.input} />
                       
                            {/* Wrap ErrorMessage in a div for styling */}
                            <div style={styles.error}>
                                <ErrorMessage name="username" component="span" />
                            </div>
                        </div>
                        <div style={styles.inputGroup}>
                            <Field type="password" id="password" name="password" placeholder="Password" style={styles.input} />
                            {/* Wrap ErrorMessage in a div for styling */}
                            <div style={styles.error}>
                                <ErrorMessage name="password" component="span" />
                            </div>
                        </div>
                        <button type="submit" style={styles.button}>Login</button> 
                        <div>
                        <button type="submit" style={styles.button}>Forgot Password?</button> 
                        </div>

                       
                    
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
        width: '300px',
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
        marginBottom: '1rem',
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
        backgroundColor: '#007bff',
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
