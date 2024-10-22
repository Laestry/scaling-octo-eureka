import { prisma } from '$lib/server/prisma';

export async function load(event) {
    const products = await prisma.product.findMany({});
    return {
        products
    };
}
