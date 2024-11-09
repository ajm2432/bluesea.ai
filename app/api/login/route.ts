import { NextRequest, NextResponse } from 'next/server';
import AWS from 'aws-sdk';

const cognito = new AWS.CognitoIdentityServiceProvider({ region: 'us-east-1' });

export async function POST(req: NextRequest) {
    const { username, password } = await req.json(); // Parsing JSON from the request body
    const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;

    if (!clientId || !username || !password) {
        return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const params = {
        AuthFlow: "USER_PASSWORD_AUTH",
        ClientId: clientId,
        AuthParameters: {
            "USERNAME": username,
            "PASSWORD": password,
        },
    };

    try {
        const data = await cognito.initiateAuth(params).promise();

        if (data.AuthenticationResult) {
            const { AccessToken, IdToken, RefreshToken } = data.AuthenticationResult;

            if (RefreshToken) {
                // Set the Refresh Token as an HttpOnly, Secure cookie
                const cookie = `refreshToken=${RefreshToken}; HttpOnly; Secure; Path=/; SameSite=Strict`;
                return NextResponse.json(
                    { accessToken: AccessToken, idToken: IdToken },
                    {
                        status: 200,
                        headers: {
                            'Set-Cookie': cookie,
                        },
                    }
                );
            }

            return NextResponse.json({
                accessToken: AccessToken,
                idToken: IdToken,
            }, { status: 200 });
        } else {
            return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
        }
    } catch (error) {
        return NextResponse.json({ error: 'Login failed' }, { status: 500 });
    }
}
