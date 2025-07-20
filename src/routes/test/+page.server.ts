export async function load({ locals, url }) {
    const { data, error } = await locals.supabase
        .schema('cms_saq')
        .from('alcohol')
        .select('*, alcohol_batches(*)')
        .gt('alcohol_batches.quantity', 0)
        .order('sell_before_date', { referencedTable: 'alcohol_batches', ascending: false });

    console.log('data');
    return { data };
}
