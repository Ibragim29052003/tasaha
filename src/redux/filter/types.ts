export type Filters = {
    categories: string[];
    fabrics: string[];
    sizes: string[];
    colors: string[];
    minPrice?: number;
    maxPrice?: number;
    isNew?: boolean;
    sortBy?: 'price_asc' | 'price_desc' | 'new';
}

export interface FiltersState {
    filters: Filters;
}