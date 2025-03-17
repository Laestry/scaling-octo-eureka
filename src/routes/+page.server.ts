export async function load({ locals }) {
    let products = await locals.pb.collection('alcohol_products').getList(1, 20);

    return { products };
}
