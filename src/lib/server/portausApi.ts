import { PORTAUS_BASE, PORTAUS_API_KEY, PORTAUS_JWT_SECRET } from '$env/static/private';
import jwt from 'jsonwebtoken'; // JWT library

// Helper function to generate a JWT wrapping the API key
function generateApiKeyJWT(): string {
    const payload = { API_KEY: PORTAUS_API_KEY.trim() };
    const secret = PORTAUS_JWT_SECRET;
    return jwt.sign(payload, secret); // defaults to HS256
}

/**
 * Creates a payment intent.
 * This function sends a POST request to the '/api/v1/payments/intents' endpoint,
 * attaching the JWT-wrapped API key in the 'apikey' header.
 */
export async function createPaymentIntent(payload: any): Promise<any> {
    const jwtToken = generateApiKeyJWT();
    const url = `${PORTAUS_BASE}/api/v1/payments/intents`;
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            apikey: jwtToken
        },
        body: JSON.stringify(payload)
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Error: ${res.status} ${text}`);
    }
    return await res.json();
}

/**
 * Retrieves SAQ branches.
 * This function sends a GET request to the '/api/v1/saq-branches' endpoint,
 * attaching the JWT-wrapped API key in the 'apikey' header.
 */
export async function getSaqBranches(): Promise<any> {
    const jwtToken = generateApiKeyJWT();
    const url = `${PORTAUS_BASE}/api/v1/saq-branches`;
    const res = await fetch(url, {
        method: 'GET',
        headers: {
            apikey: jwtToken
        }
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Error: ${res.status} ${text}`);
    }
    return await res.json();
}
