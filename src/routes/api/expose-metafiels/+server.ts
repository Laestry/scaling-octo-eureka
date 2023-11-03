import { PUBLIC_SHOPIFY_API_VERSION, PUBLIC_SHOPIFY_BASE_URL } from '$env/static/public';

export async function GET() {
	const SHOPIFY_ENDPOINT = `${PUBLIC_SHOPIFY_BASE_URL}/admin/api/${PUBLIC_SHOPIFY_API_VERSION}/graphql.json`;

	const mutation = `
        mutation {
            metafieldStorefrontVisibilityCreate(
                input: {
                    namespace: "custom",
                    key: "mll",
                    ownerType: PRODUCT
                }
            ) {
                metafieldStorefrontVisibility {
                    id
                }
                userErrors {
                    field
                    message
                }
            }
        }
    `;

	const response = await fetch(SHOPIFY_ENDPOINT, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			// This header may need to be an admin access token for the Admin API
			'X-Shopify-Access-Token': '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'
		},
		body: JSON.stringify({ query: mutation })
	});

	// Check if the response is ok (status code 200-299)
	if (!response.ok) {
		console.error('Network response was not ok ' + response.statusText);
		return;
	}

	// Convert the response to JSON
	const responseData = await response.json();

	// Log the response data to the console
	console.log(responseData);

	return responseData;
}
