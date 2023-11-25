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
	color: Metafield | null;
	ml: Metafield | null;
	producer: Metafield | null;
	region: Metafield | null;
	year: Metafield | null;
	varietal: Metafield | null;
	variants: Variants;
	images: Images;
	descriptionHtml?: string;
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

export interface CollectionNode {
	id: string;
	title: string;
	products: Products;
}

export interface Collections {
	edges: {
		node: CollectionNode;
	}[];
}

export interface ProductVariant {
	id: string;
	priceV2: PriceV2;
	product: {
		title: string;
		color: Metafield | null;
		ml: Metafield | null;
		producer: Metafield | null;
		year: Metafield | null;
		region: Metafield | null;
		varietal: Metafield | null;
	};
}

export interface CartLineNode {
	id: string;
	quantity: number;
	merchandise: ProductVariant;
}

export interface CartLines {
	edges: {
		node: CartLineNode;
	}[];
}

export interface Cart {
	id: string;
	lines: CartLines;
}
