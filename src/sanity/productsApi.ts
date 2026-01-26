// redux/productsApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Slide } from "@/redux/slider/types";

export const productsApi = createApi({
  reducerPath: "productsApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }), // теперь локальный API
  endpoints: (builder) => ({
    getSliderProducts: builder.query<Slide[], void>({
      query: () => "products", // путь /api/products
      transformResponse: (response: { slides: Slide[] }) => response.slides, // достаем массив слайдов
    }),
  }),
});

export const { useGetSliderProductsQuery } = productsApi;
