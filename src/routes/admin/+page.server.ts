import { PortausApi } from '$lib/server/portaus';

export async function load({ locals }) {
    const tokens = await PortausApi.getTokens();

    return { tokens };
}
