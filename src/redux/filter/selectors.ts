import type { RootState } from "../store";

export const selectFilters = (state: RootState) => state.filters.filters
export const selectCurrentPage = (state: RootState) => state.filters.currentPage