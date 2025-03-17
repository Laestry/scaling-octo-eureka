import PocketBase from 'pocketbase';
import { PUBLIC_DB_URL } from '$env/static/public';

export async function handle({ event, resolve }) {
	event.locals.pb = new PocketBase(PUBLIC_DB_URL);
	event.locals.pbAdmin = new PocketBase(PUBLIC_DB_URL);

	const cookie = event.request.headers.get('cookie') || '';
	event.locals.pb.authStore.loadFromCookie(cookie);
	const hostname = event.url.hostname;
	event.locals.isTest = hostname.includes('localhost') || hostname.includes('cadmean');
	console.log('event.locals.isTest', event.locals.isTest);
	// A threshold in seconds before expiration when we'll try to refresh the token.
	// For example, 30 minutes:
	const REFRESH_THRESHOLD = 60 * 30;

	try {
		if (event.locals.pb.authStore.isValid) {
			const token = event.locals.pb.authStore.token;

			// Only refresh if the token is nearing expiry
			if (isTokenNearExpiry(token, REFRESH_THRESHOLD)) {
				await event.locals.pb.collection('users').authRefresh();
			}

			event.locals.user = event.locals.pb.authStore.model;
		} else {
			event.locals.user = undefined;
		}
	} catch (error) {
		console.error('authRefresh failed:', error);
		event.locals.pb.authStore.clear(); // Clear invalid token
		event.locals.user = undefined; // Reset user
	}

	const response = await resolve(event);

	response.headers.set(
		'set-cookie',
		event.locals.pb.authStore.exportToCookie({
			httpOnly: true,
			secure: true,
			sameSite: 'lax', // Allows cookies to be sent after external redirect (like from Stripe)
			path: '/'
		})
	);

	return response;
}

// Helper function to determine if the token is near expiry
function isTokenNearExpiry(token, threshold) {
	const payload = getTokenPayload(token);
	if (!payload || !payload.exp) return false;

	const now = Math.floor(Date.now() / 1000);
	return payload.exp - now < threshold;
}

function getTokenPayload(token) {
	try {
		const [, payloadBase64] = token.split('.');
		return JSON.parse(atob(payloadBase64));
	} catch (err) {
		return null;
	}
}
