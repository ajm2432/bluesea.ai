'use client';

import React from 'react';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import { useTheme } from 'next-themes';

export default function SignUpForm({ onSignUp, onConfirmSignUp, onBackToLogin }) { // Accept onBackToLogin as a prop
    const { theme } = useTheme();
    const isDarkMode = theme === 'dark';

    return (
        <div style={styles.container}>
            <Formik
                initialValues={{
                    username: '',
                    password: '',
                    email: '', // Include email field for sign-up
                }}
                onSubmit={(values) => {
                    // Pass username, password, and email to onSignUp
                    if (values.username && values.password && values.email) {
                        onSignUp(values.username, values.password, values.email);
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
                                BlueSea.ai
                            </h2>
                        </div>
                        <div style={styles.inputGroup}>
                            <Field type="email" id="email" name="email" placeholder="Email" style={styles.input} />
                            <ErrorMessage name="email" component="div" style={styles.error} />
                        </div>
                        <div style={styles.inputGroup}>
                            <Field type="password" id="password" name="password" placeholder="Password" style={styles.input} />
                            <ErrorMessage name="password" component="div" style={styles.error} />
                        </div>
                        
                        <button type="submit" style={styles.button}>Sign Up</button>
                        <button onClick={onBackToLogin} style={styles.toggleButton}>
                Back to Login
            </button>
                    </Form>
                )}
            </Formik>
            
        </div>
    );
}

const styles = {
    container: {
        display: 'flex',
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
        color: 'white',
        fontSize: '16px',
        cursor: 'pointer',
    },
    error: {
        color: 'red',
        fontSize: '12px',
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