import { prisma } from '$lib/server/prisma';

export async function load() {
    const products = await prisma.product.findMany({});
    return {
        products
    };
}
