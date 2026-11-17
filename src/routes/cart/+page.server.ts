// SAQ pickup branches for the cart's "Pour la cueillette" picker.
//
// cms_saq.saq_branches only lets signed-in CMS users read it (RLS), so the browser's anonymous
// Supabase client gets an empty list. Read it here with the service client instead; only the
// columns the picker shows leave the server.

import type { PageServerLoad } from './$types';
import { createServiceClient } from '$lib/server/supabase';

export const load: PageServerLoad = async () => {
    const { data, error } = await createServiceClient()
        .schema('cms_saq')
        .from('saq_branches')
        .select('id, city, address')
        .order('city')
        .order('address');

    if (error) console.error('cart: could not read saq_branches', error);

    return {
        branches: (data ?? []).map((b) => ({ value: b.id as number, label: `${b.city}, ${b.address}` }))
    };
};
