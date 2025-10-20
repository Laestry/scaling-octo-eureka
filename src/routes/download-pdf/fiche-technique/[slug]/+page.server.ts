import { error } from '@sveltejs/kit';

export async function load({ locals, params }) {
    let { data, error: serror } = await locals.supabase
        .schema('cms_saq')
        .from('alcohol')
        .select(
            `*,alcohol_batches(*),
            alcohol_website!inner(
                *,
                alcohol_images(
                    files(uuid,file_name)
                )
            ),parties(*)`
        )
        .eq('alcohol_website.slug', params.slug)
        .single();

    if (serror) {
        error(404);
    } else {
        return {
            product: data
        };
    }
}
