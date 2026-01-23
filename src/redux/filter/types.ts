export type Filters = {
    categories: string[];
    sizes: string[];
    colors: string[];
    minPrice?: number;
    maxPrice?: number;
    sortBy?: 'price_asc' | 'price_desc';
}

export interface FiltersState {
    filters: Filters;
}