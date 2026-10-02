import { json } from '@sveltejs/kit';
import { PortausApi } from '$lib/server/portaus';
import { rejectUnlessInternal } from '$lib/server/internalAuth';

export async function GET({ request }) {
    const denied = rejectUnlessInternal(request);
    if (denied) return denied;

    const tokens = await PortausApi.getTokens();
    return json(await PortausApi.getSaqBranches(tokens));
}
