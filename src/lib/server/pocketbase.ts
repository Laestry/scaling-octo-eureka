import PocketBase from 'pocketbase';

export async function upsertBatch(pbAdmin: PocketBase, products) {
    const batch = pbAdmin.createBatch();

    for (const product of products) {
        batch.collection('alcohol_products').upsert(product);
    }

    try {
        const result = await batch.send();
        console.log('Batch upsert result:', result);
        return result;
    } catch (error) {
        console.error('Error during batch upsert:', error);
        return error;
    }
}
