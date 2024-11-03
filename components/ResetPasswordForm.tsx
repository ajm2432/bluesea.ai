'use client';

import React from 'react';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import { useTheme } from 'next-themes';

export default function ResetPasswordForm({ onSubmit }) {
    const { theme } = useTheme();
    const isDarkMode = theme === 'dark';

    return (
        <div style={styles.container}>
            <Formik
                initialValues={{
                    newPassword: '',
                    confirmPassword: '',
                }}
                validate={(values) => {
                    const errors = {}; // Initialize errors object
                    if (!values.newPassword) {
                        errors.newPassword = 'Required';
                    } else if (values.newPassword.length < 8) {
                        errors.newPassword = 'Password must be at least 8 characters';
                    }
                    if (!values.confirmPassword) {
                        errors.confirmPassword = 'Required';
                    } else if (values.confirmPassword !== values.newPassword) {
                        errors.confirmPassword = 'Passwords must match';
                    }
                    return errors;
                }}
                onSubmit={(values) => {
                    // Pass only the new password to onSubmit
                    onSubmit(values.newPassword);
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
                        <div style={styles.inputGroup}>
                            <Field
                                type="password"
                                id="newPassword"
                                name="newPassword"
                                placeholder="New Password"
                                style={styles.input}
                            />
                            <ErrorMessage name="newPassword" component="div" style={styles.error} />
                        </div>
                        <div style={styles.inputGroup}>
                            <Field
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                placeholder="Confirm Password"
                                style={styles.input}
                            />
                            <ErrorMessage name="confirmPassword" component="div" style={styles.error} />
                        </div>
                        <button type="submit" style={styles.button}>
                            Set New Password
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
        flexDirection: 'column',
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
};
