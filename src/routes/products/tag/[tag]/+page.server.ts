import { prisma } from '$lib/server/prisma';
import { error } from '@sveltejs/kit';

export async function load(event) {
	const products = await prisma.product.findMany({
		where: {
			tags: {
				has: event.params.tag
			}
		}
	});

	return {
		products
	};
}
