// authService.js
import { CognitoUserPool, CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js';

const poolData = {
    UserPoolId: 'your_user_pool_id',
    ClientId: 'your_client_id',
};

const userPool = new CognitoUserPool(poolData);

export const login = (username, password) => {
    const authenticationDetails = new AuthenticationDetails({
        Username: username,
        Password: password,
    });

    const user = new CognitoUser({
        Username: username,
        Pool: userPool,
    });

    return new Promise((resolve, reject) => {
        user.authenticateUser(authenticationDetails, {
            onSuccess: (result) => {
                resolve(result);
            },
            onFailure: (err) => {
                reject(err);
            },
        });
    });
};

export const logout = () => {
    const user = userPool.getCurrentUser();
    if (user) {
        user.signOut();
    }
};
