export interface PriceV2 {
	amount: string;
	currencyCode: string;
}

export interface VariantNode {
	id: string;
	title: string;
	priceV2: PriceV2;
}

export interface Variants {
	edges: {
		node: VariantNode;
	}[];
}

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

export interface ProductNode {
	id: string;
	title: string;
	tags: string[];
	color: Metafield | null; // Updated to accommodate null values
	ml: Metafield | null; // Updated to accommodate null values
	brand: Metafield | null; // Updated to accommodate null values
	variants: Variants; // New field for variants
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
