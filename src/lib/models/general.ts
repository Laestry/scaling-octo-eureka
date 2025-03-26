export interface TFilters {
    producer: string | undefined;
    region: string | undefined;
    color: string | undefined;
    uvc: number | undefined;
    format: string | undefined;
    vintage: string | undefined;
    priceRange: 'low' | 'mid' | 'high' | undefined;
    sorting: 'Prix' | 'Alphabétique' | undefined;
    nameSearch: string | undefined;
}
