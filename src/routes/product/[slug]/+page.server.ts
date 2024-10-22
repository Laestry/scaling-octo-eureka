import { prisma } from '$lib/server/prisma';
import { error } from '@sveltejs/kit';

export async function load(event) {
    const product = await prisma.product.findUnique({
        where: {
            slug: event.params.slug
        }
    });
    if (!product) {
        error(404);
    } else {
        return {
            product
        };
    }
}
