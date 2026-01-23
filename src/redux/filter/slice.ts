import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Filters, FiltersState } from "./types";

const initialFilters: Filters = {
  categories: [],
  sizes: [],
  colors: [],
  minPrice: undefined,
  maxPrice: undefined,
  sortBy: undefined,
};

const initialState: FiltersState = {
  filters: initialFilters,
};

const filtersSlice = createSlice({
  name: "filters",
  initialState,
  reducers: {
    setCategories: (state, action: PayloadAction<string[]>) => {
      state.filters.categories = action.payload;
    },

    setSizes: (state, action: PayloadAction<string[]>) => {
      state.filters.sizes = action.payload;
    },

    setColors: (state, action: PayloadAction<string[]>) => {
      state.filters.colors = action.payload;
    },

    setMinPrice: (state, action: PayloadAction<number | undefined>) => {
      state.filters.minPrice = action.payload;
    },

    setMaxPrice: (state, action: PayloadAction<number | undefined>) => {
      state.filters.maxPrice = action.payload;
    },

    setSortBy: (state, action: PayloadAction<Filters['sortBy']>) => {
        state.filters.sortBy = action.payload
    },

    // Partial делает все поля опциональными, чтобы при изменении одного фильтра, не приходилось передавать и остальные неопциональные параметры
    updateFilters: (state, action: PayloadAction<Partial<Filters>>) => {
        // берем старые фильтры -  ...state.filters
        // накладываем новые значения сверху -  ...action.payload
        state.filters = {...state.filters, ...action.payload}
    },

    clearFilters: (state) => {
        state.filters = initialFilters
    }
  },
});


export const {
    setCategories,
    setSizes,
    setColors,
    setMinPrice,
    setMaxPrice,
    setSortBy,
    updateFilters,
    clearFilters
} = filtersSlice.actions

export default filtersSlice.reducer // для подключения к стору
