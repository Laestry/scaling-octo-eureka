import { json } from '@sveltejs/kit';
import { getSaqBranches } from '$lib/server/portausApi';
import { rejectUnlessInternal } from '$lib/server/internalAuth';

export async function GET({ request }) {
    const denied = rejectUnlessInternal(request);
    if (denied) return denied;

    return json(await getSaqBranches());
}
