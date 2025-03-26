export async function load({ locals }) {
    const productsPromise = locals.pb.collection('alcohol_products').getList(1, 20);
    const categoriesPromise = locals.pb.collection('categories').getFullList();

    const [products, categories] = await Promise.all([productsPromise, categoriesPromise]);

    return { products, categories };
}
