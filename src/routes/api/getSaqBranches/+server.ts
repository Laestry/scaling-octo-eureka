import { PortausApi } from '$lib/server/portaus';

export async function GET({ locals }) {
    const tokens = await PortausApi.getTokens();

    const res = await PortausApi.getSaqBranches(tokens);
    console.log(res);
}
