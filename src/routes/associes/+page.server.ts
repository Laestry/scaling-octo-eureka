import { error } from '@sveltejs/kit';

export async function load({ locals, params }) {
    let { data: suppliers, error: serror } = await locals.supabase
        .schema('cms_saq')
        .from('companies_suppliers_view')
        .select(' usual_name, country_id, region_name, country_fr:country_name->>fr, flag')
        .eq('organization_id', 2);

    if (serror) {
        error(404);
    } else {
        return {
            suppliers
        };
    }
}
