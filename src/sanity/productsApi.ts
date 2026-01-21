import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { client, urlFor, type SanityImage } from "./sanityClient";
import type { Slide } from "@/redux/slider/types";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

// Тип данных, который приходит с Sanity
type SanityProduct = {
  _id: string;
  title: string;
  description: string;
  image: SanityImage | null;
  price: number;
  oldPrice?: number;
  wbLink: string;
};

export const productsApi = createApi({
  reducerPath: "productsApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/" }),
  endpoints: (builder) => ({
    getProducts: builder.query<Slide[], void>({
      queryFn: async (): Promise<
        { data: Slide[] } | { error: FetchBaseQueryError }
      > => {
        try {
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

export const { useGetProductsQuery } = productsApi;
