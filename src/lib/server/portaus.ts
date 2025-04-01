import {
    PORTAUS_LOGIN,
    PORTAUS_PASSWORD,
    PORTAUS_BASE,
    PORTAUS_API_KEY,
    PORTAUS_JWT_SECRET
} from '$env/static/private';
import type { ApiTypes } from '$lib/server/portausModels';
import jwt from 'jsonwebtoken'; // added import for JWT

type Tokens = {
    accessToken: string;
    contextToken: string;
};

const methods: Record<keyof ApiTypes.ResMap, 'GET' | 'POST'> = {
    '/auth/login': 'POST',
    '/API/latest/admin/inventories/1/products': 'GET',
    '/api/v1/payments/intents': 'POST',
    '/api/v1/saq-branches': 'GET' // new endpoint added here
};

// Helper function to generate JWT for the API key
function generateApiKeyJWT(): string {
    const payload = { API_KEY: PORTAUS_API_KEY.trim() };
    // A JWT secret is required to sign the token.
    const secret = PORTAUS_JWT_SECRET;
    return jwt.sign(payload, secret);
}

async function request<P extends keyof ApiTypes.ResMap>({
    path,
    body,
    tokens
}: {
    path: P;
    body?: ApiTypes.ResMap[P]['body'];
    tokens?: Tokens;
}) {
    const method = methods[path];
    const query = method === 'GET' && body ? '?' + new URLSearchParams(body as Record<string, string>) : '';
    console.log('request', { path, body });

    // Build headers without token values initially
    const headers: Record<string, string> = {
        accept: 'application/json, text/plain, */*',
        'accept-language': 'fr-CA',
        'content-type': method === 'POST' ? 'application/json' : ''
    };

    // For endpoints other than payment intents, add token-based headers if provided
    if (tokens && path !== '/api/v1/payments/intents') {
        headers['authorization'] = tokens.accessToken;
        headers['x-portaus-context'] = tokens.contextToken;
    }

    // For the payment intents and SAQ branches endpoints, generate a JWT containing the API key
    // Note: getSaqBranches uses '/API/latest/admin/saq-branches' which is different from the method record key.
    if (path === '/api/v1/payments/intents' || path === '/API/latest/admin/saq-branches') {
        headers['apikey'] = generateApiKeyJWT();
    }

    const res = await fetch(`${PORTAUS_BASE}${path}${query}`, {
        method,
        body: method === 'POST' ? JSON.stringify(body) : undefined,
        headers
    }).catch(() => {});
    console.log('request res', res);
    if (!res) {
        throw new Error('No response');
    }
    if (res.ok) {
        const data = await res.json().catch((e) => {
            console.error('data parse error', e);
        });
        console.log('request data', data);
        if (data) {
            return data as ApiTypes.ResMap[P]['res'];
        } else {
            throw new Error('No data');
        }
    } else {
        const text = await res.text().catch(() => '');
        let error = '';
        try {
            const parsed = JSON.parse(text);
            error = parsed.message || parsed.error || '';
        } catch (e) {
            error = text || res.statusText;
        }
        throw new Error(error);
    }
}

function processString(input: string | null | undefined) {
    return input?.trim() || undefined;
}

export const PortausApi = {
    async getTokens() {
        const res = await request({
            path: '/auth/login',
            body: {
                username: PORTAUS_LOGIN,
                password: PORTAUS_PASSWORD
            }
        });
        return {
            accessToken: res.accessToken,
            contextToken: res.portausContextToken
        } satisfies Tokens;
    },

    async getProducts(page = 1, tokens: Tokens) {
        const res = await request({
            tokens,
            path: '/API/latest/admin/inventories/1/products',
            body: {
                limit: '50',
                orderBy: 'age',
                page: String(page)
            }
        });
        console.log('res', res);
        return res;
    },

    processProduct(obj: ApiTypes.List) {
        const alcohol = (parseFloat(obj.item?.extraInfo?.alcohol || '') || 0) / 100;
        const quantity = Math.max(obj.quantity['packaged'] || 0, 0);
        const unit = obj.unit === 0 ? 'unit' : obj.unit === 1 ? 'box' : undefined;
        if (!unit) {
            console.warn('no unit', obj);
        }
        const uvc = obj.uvc;
        const format = obj.format === 1 ? 'ml' : obj.format === 2 ? 'l' : undefined;
        if (!format) {
            console.warn('no format', obj);
        }
        const vintage =
            Math.min(Math.max(parseInt(obj.currentVintage) || 0, 0), new Date().getFullYear() + 1) || undefined;

        return {
            id: obj.puid,
            id2: obj.id,
            sku: obj.sku,
            slug: obj.slug,
            name: processString(obj.name) || processString(obj.cmsName) || '',
            shortDescription: processString(obj.shortDescription) || '',
            fullDescription: processString(obj.description) || processString(obj.content) || '',
            providerName:
                processString(obj.provider?.displayName) ||
                processString(obj.provider?.usualName) ||
                processString(obj.provider?.name) ||
                '',
            alcohol,
            lblFormat: obj.lblFormat,
            vintage,
            uvc,
            quantity,
            price: Math.max(obj.pricing.price, 0),
            priceTaxIn: Math.max(obj.pricing.price, 0),
            pricing: obj.pricing,
            originCity: processString(obj.originCity) || '',
            originRegion: processString(obj.originRegion) || '',
            originCountry: processString(obj.originCountry) || '',
            originCountryCode: processString(obj.origins?.[0]?.country.code) || '',
            category: processString(obj.category?.name) || '',
            specificCategory: processString(obj.specificCategory?.name) || '',
            tags: obj.tags
                .map((x) => processString(x.code))
                .filter(Boolean)
                .map((x) => x!)
        } as const;
    },

    async createPaymentIntent(payload: ApiTypes.PaymentIntentPayload, tokens?: Tokens) {
        const res = await request({
            tokens,
            path: '/api/v1/payments/intents',
            body: payload
        });
        console.log('createPaymentIntent response', res);
        return res as ApiTypes.PaymentIntentResponse;
    },

    // New function for retrieving SAQ branches.
    async getSaqBranches(tokens?: Tokens) {
        const res = await request({
            tokens,
            path: '/API/latest/admin/saq-branches'
        });
        console.log('getSaqBranches response', res);
        return res;
    }
};

(async () => {
    console.log('start');
    try {
        // await migrate();
    } catch (error) {
        console.error(error);
    }
    console.log('end');
})();
