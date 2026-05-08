import { error } from '@sveltejs/kit';

export async function load({ locals, params }) {
    const { data, error: serror } = await locals.supabase
        .schema('cms_saq')
        .from('alcohol')
        .select(
            `*,
            alcohol_batches(*),
            parties(*),
            alcohol_website!inner(
                *,
                alcohol_images(id, alcohol_id, file_uuid, order, is_archived)
            )
            `
        )
        .eq('alcohol_website.slug', params.slug)
        .eq('organization_id', 2)
        .eq('is_archived', false)
        .single();

    if (serror) error(404);

    const allImages: any[] = (data.alcohol_website[0]?.alcohol_images ?? [])
        .filter((i: any) => !i.is_archived)
        .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));

    const fileUuids = [...new Set(allImages.map((i: any) => i.file_uuid).filter(Boolean))];

    let fileMap: Record<string, string> = {};
    if (fileUuids.length) {
        const { data: files } = await locals.supabase
            .schema('cms_saq')
            .from('files')
            .select('uuid, file_name')
            .in('uuid', fileUuids);

        fileMap = Object.fromEntries((files ?? []).map((f: any) => [f.uuid, f.file_name]));
    }

    data.image_paths = allImages
        .map((i: any) => (i.file_uuid && fileMap[i.file_uuid] ? `${i.file_uuid}/${fileMap[i.file_uuid]}` : null))
        .filter(Boolean);

    // fallback: если files недоступна через anon — берём из view
    if (!data.image_paths.length) {
        const { data: viewData } = await locals.supabase
            .schema('cms_saq')
            .from('alcohol_view')
            .select('main_image_file')
            .eq('website_slug', params.slug)
            .single();

        if (viewData?.main_image_file) {
            data.image_paths = [viewData.main_image_file];
        }
    }

    return { product: data };
}
