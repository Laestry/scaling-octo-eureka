import {
	PUBLIC_SHOPIFY_API_VERSION,
	PUBLIC_SHOPIFY_BASE_URL,
	PUBLIC_SHOPIFY_STOREFRONT
} from '$env/static/public';
import type { GraphQLResponse, ProductData } from '$lib/models/shopifyTypes';

const SHOPIFY_ENDPOINT = `${PUBLIC_SHOPIFY_BASE_URL}api/${PUBLIC_SHOPIFY_API_VERSION}/graphql.json`;

export async function queryShopify(query: string): Promise<GraphQLResponse<ProductData>> {
	const response = await fetch(SHOPIFY_ENDPOINT, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-Shopify-Storefront-Access-Token': PUBLIC_SHOPIFY_STOREFRONT
		},
		body: JSON.stringify({ query })
	});
	return response.json();
}

export async function getProducts() {
	const query = `
    {
	  products(first: 10) {
		edges {
		  node {
			id
			... on Product {
			  variants(first: 2) {
				edges {
				  node {
					id
					title
					priceV2 {
					  amount
					  currencyCode
					}
				  }
				}
			  }
			}
			title
			tags
			color: metafield(namespace: "custom", key: "color") {
			  value
			}
			ml: metafield(namespace: "custom", key: "mll") {
			  value
			}
			brand: metafield(namespace: "custom", key: "brand") {
			  value
			}
			images(first: 1) {
			  edges {
				node {
				  originalSrc
				}
			  }
			}
		  }
		}
	  }
	}

  `;
	const response = await queryShopify(query);
	return response.data.products;
}

export async function exposeMetafields() {
	const response = await fetch('/api/expose-metafiels');
	console.log(response);
}
