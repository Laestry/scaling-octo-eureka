// models/shopifyTypes.ts
export interface ProductNode {
	title: string;
	description?: string;
}

export interface Products {
	edges: {
		node: ProductNode;
	}[];
}

export interface ProductData {
	products: Products;
}

export interface GraphQLResponse<T> {
	data: T;
}
