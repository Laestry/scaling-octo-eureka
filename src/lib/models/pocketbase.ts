import type { RecordModel } from 'pocketbase';

export type AlcoholProduct = {
    id: string;
    name: string;
    sku: string;
    slug: string;
    shortDescription: string;
    fullDescription: string;
    providerName: string;
    alcohol: number;
    lblFormat: string;
    quantity: number;
    uvc: number;
    vintage: number;
    price: number;
    originCity: string;
    originRegion: string;
    originCountry: string;
    originCountryCode: string;
    category: string;
    specificCategory: string;
    tags: string[];
};

export function mapToAlcoholProducts(items: RecordModel[]): AlcoholProduct[] {
    return items.map(
        (item: RecordModel) =>
            ({
                id: item.id,
                name: item['name'],
                sku: item['sku'],
                slug: item['slug'],
                shortDescription: item['shortDescription'],
                fullDescription: item['fullDescription'],
                providerName: item['providerName'],
                alcohol: item['alcohol'],
                lblFormat: item['lblFormat'],
                quantity: item['quantity'],
                uvc: item['uvc'],
                vintage: item['vintage'],
                price: item['price'],
                originCity: item['originCity'],
                originRegion: item['originRegion'],
                originCountry: item['originCountry'],
                originCountryCode: item['originCountryCode'],
                category: item['category'],
                specificCategory: item['specificCategory'],
                tags: item['tags']
            }) as AlcoholProduct
    );
}
