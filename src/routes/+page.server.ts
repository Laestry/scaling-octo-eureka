export async function load({ locals }) {
    let products = await locals.supabase
        .schema('cms_saq')
        .from('alcohol')
        .select('*, alcohol_batches(*), parties!inner(display_name)', { count: 'exact', head: false })
        .gt('alcohol_batches.quantity', 0)
        .order('sell_before_date', { referencedTable: 'alcohol_batches', ascending: false })
        .range(0, 19);

    return { products };
}
