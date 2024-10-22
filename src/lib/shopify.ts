import { PUBLIC_SHOPIFY_API_VERSION, PUBLIC_SHOPIFY_BASE_URL, PUBLIC_SHOPIFY_STOREFRONT } from '$env/static/public';
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
                        variants(first: 1) {
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
                    images(first: 1) {
                        edges {
                          node {
                            originalSrc
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
            console.log(`Failed to fetch recommendations. Status: ${response.status}`);
        }

        const responseData = await response.json();

        return responseData.products; // Assuming you want to return the 'products' array from the response
    } catch (error) {
        console.error(error);
        throw error; // Re-throw the error for further handling
    }
}

export async function getCollectionsWithProducts() {
    const query = `
    {
      collections(first: 5) {
        edges {
          node {
            id
            title
            products(first: 10) {
              edges {
                node {
                  id
                  title
                  ... on Product {
                        variants(first: 1) {
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
        }
      }
    }
    `;

    const response = await fetch(SHOPIFY_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Storefront-Access-Token': PUBLIC_SHOPIFY_STOREFRONT
        },
        body: JSON.stringify({ query })
    });

    const jsonResponse = await response.json();
    return jsonResponse.data.collections;
}
export async function getCollectionWithProducts(collectionId: string) {
    const query = `
{
  collection(id: "gid://shopify/Collection/${collectionId}") {
    id
    title
    descriptionHtml
    products(first: 20) {
      edges {
        node {
          id
          title
          variants(first: 1) {
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
          images(first: 1) {
            edges {
              node {
                originalSrc
              }
            }
          }
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
        }
      }
    }
  }
}
`;
    const response = await fetch(SHOPIFY_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Storefront-Access-Token': PUBLIC_SHOPIFY_STOREFRONT
        },
        body: JSON.stringify({ query })
    });

    console.log(SHOPIFY_ENDPOINT, PUBLIC_SHOPIFY_STOREFRONT, '*********', query, response);
    const jsonResponse = await response.json();
    console.log(jsonResponse.data.products);
    return jsonResponse.data.collection;
}

export async function createCart(items) {
    const lines = items
        .map((item) => {
            return `{ quantity: ${item.quantity}, merchandiseId: "${item.variantId}" }`;
        })
        .join(',');

    const query = `
     mutation {
      cartCreate(
        input: {
          lines: [${lines}],
        }
      ) {
        cart {
          id
          checkoutUrl
        }
      }
    }
    `;

    const response = await fetch(SHOPIFY_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Storefront-Access-Token': PUBLIC_SHOPIFY_STOREFRONT
        },
        body: JSON.stringify({ query })
    });

    const jsonResponse = await response.json();
    return jsonResponse.data.cartCreate.cart;
}

export async function updateCartItem(cartId, merchandiseId, quantity) {
    const query = `
    mutation {
      cartLinesAdd(cartId: "${cartId}", lines: [{ quantity: ${quantity}, merchandiseId: "${merchandiseId}" }]) {
        cart {
          id
          lines(first: 99) {
            edges {
              node {
                id
                merchandise {
                  ... on ProductVariant {
                    id
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

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

export async function getCartItems(cartId) {
    const query = `
        query {
            cart(id: "${cartId}") {
                id
                lines(first: 10) {
                    edges {
                        node {
                            id
                            quantity
                            merchandise {
                                ... on ProductVariant {
                                    id
                                    product {
                                        title
                                    }
                                    priceV2 {
                                        amount
                                        currencyCode
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    `;

    const response = await fetch(SHOPIFY_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Storefront-Access-Token': PUBLIC_SHOPIFY_STOREFRONT
        },
        body: JSON.stringify({ query })
    });

    const jsonResponse = await response.json();
    return jsonResponse.data.cart;
}
