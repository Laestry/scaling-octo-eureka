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
			color: metafield(namespace: "custom", key: "color") {
			  value
			}
			ml: metafield(namespace: "custom", key: "mll") {
			  value
			}
			producer: metafield(namespace: "custom", key: "producer") {
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

export async function getProduct(id: string) {
	const query = `
    {
	  product(id: "gid:\\/\\/shopify\\/Product\\/${id.toString()}") {
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
			descriptionHtml
			color: metafield(namespace: "custom", key: "color") {
			  value
			}
			ml: metafield(namespace: "custom", key: "mll") {
			  value
			}
			producer: metafield(namespace: "custom", key: "producer") {
			  value
			}
			year: metafield(namespace: "custom", key: "year") {
			  value
			}
			region: metafield(namespace: "custom", key: "region") {
			  value
			}
			varietal: metafield(namespace: "custom", key: "varietal") {
			  value
			}
			producer: metafield(namespace: "custom", key: "producer") {
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
  `;

	const response = await queryShopify(query);
	return response.data;
}

export async function searchProducts(searchQuery: string) {
	const query = `
	{
		products(first: 10, query: "${searchQuery}") {
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
					color: metafield(namespace: "custom", key: "color") {
						value
					}
					ml: metafield(namespace: "custom", key: "ml") {
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

export async function getProductRecommendations(productId: string) {
	const recommendationsUrl = `${PUBLIC_SHOPIFY_BASE_URL}recommendations/products.json?product_id=${productId}&limit=5&section_id=product-recommendations&intent=related`;
	try {
		const response = await fetch(recommendationsUrl, {
			method: 'GET'
		});

		if (!response.ok) {
			throw new Error(`Failed to fetch recommendations. Status: ${response.status}`);
		}

		const responseData = await response.json();

		return responseData.products; // Assuming you want to return the 'products' array from the response
	} catch (error) {
		console.error(error);
		throw error; // Re-throw the error for further handling
	}
}
