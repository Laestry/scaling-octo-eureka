export interface ImageNode {
	originalSrc: string;
}

export interface Images {
	edges: {
		node: ImageNode;
	}[];
}

export interface Metafield {
	value: string;
}

export interface MoneyValue {
	amount: string;
	currency_code: string;
}

export interface Money {
	value: string; // Original JSON string value
	parsedValue?: MoneyValue; // Parsed object value
}

export interface ProductNode {
	id: string;
	title: string;
	tags: string[];
	color: Metafield;
	ml: Metafield;
	brand: Metafield;
	images: Images;
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
