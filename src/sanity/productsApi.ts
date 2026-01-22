import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { client, urlFor, type SanityImage } from "./sanityClient";
import type { Slide } from "@/redux/slider/types";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

// тип данных, который приходит с Sanity для продуктов
type SanityProduct = {
  _id: string;
  title: string;
  description: string;
  image: SanityImage | null;
  price: number;
  oldPrice?: number;
  wbLink: string;
};

// API для получения продуктов из Sanity CMS
export const productsApi = createApi({
  reducerPath: "productsApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/" }),
  endpoints: (builder) => ({
    getProducts: builder.query<Slide[], void>({
      queryFn: async (): Promise<
        { data: Slide[] } | { error: FetchBaseQueryError }
      > => {
        try {
          // получение активных продуктов из Sanity
          const data: SanityProduct[] = await client.fetch(
            `*[_type == "product" && active==true]{
              _id,
              title,
              description,
              image,
              price,
              oldPrice,
              wbLink
            }`
          );

          // преобразование данных в формат слайдов
          const slides: Slide[] = data.map((p) => ({
            id: p._id,
            title: p.title,
            description: p.description,
            imageUrl: urlFor(p.image),
            newPrice: p.price,
            oldPrice: p.oldPrice,
            link: p.wbLink,
          }));

          return { data: slides };
        } catch (err: unknown) {
          // обработка ошибок при запросе к Sanity
          const error: FetchBaseQueryError = {
            status: "FETCH_ERROR",
            error: err instanceof Error ? err.message : JSON.stringify(err) || "Unknown error",
          };
          return { error };
        }
      },
    }),
  }),
});

// экспорт хука для использования в компонентах
export const { useGetProductsQuery } = productsApi;
