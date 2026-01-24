import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { client, urlFor, type SanityImage } from "./sanityClient";
import type { Slide } from "@/redux/slider/types";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { Filters } from "@/redux/filter/types";

// тип данных, который приходит с Sanity для слайдов
type SanityProduct = {
  _id: string;
  title: string;
  description: string;
  image: SanityImage | null;
  price: number;
  oldPrice?: number;
  wbLink: string;

  // для фильтров
  categories: string[];
  fabrics: string[];
  colors: string[];
  sizes: string[];
  isNew: boolean;
  nmId: string; // для WB API
};

// API для получения продуктов из Sanity CMS
export const productsApi = createApi({
  reducerPath: "productsApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/" }),
  endpoints: (builder) => ({
    // для слайдера
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
            error:
              err instanceof Error
                ? err.message
                : JSON.stringify(err) || "Unknown error",
          };
          return { error };
        }
      },
    }),
    // для фильтрованных продуктов
    getFilteredProducts: builder.query<Slide[], Filters>({
      queryFn: async (filters: Filters) => {
        try {
          // базовый GROQ-запрос:
          // выбираем только активные продукты типа "product"
          let query = `*[_type == "product" && active == true`;

          // фильтр по категориям (если выбраны)
          // проверяем, что хотя бы одна категория продукта есть в filters.categories
          if (filters.categories.length > 0) {
            query += ` && count((categories[])[@ in $categories]) > 0`;
          }

          if (filters.fabrics.length > 0) {
            query += ` && count((fabrics[])[@ in $fabrics]) > 0`;
          }

          // фильтр по цветам
          if (filters.colors.length > 0) {
            query += ` && count((colors[])[@ in $colors]) > 0`;
          }

          // фильтр по размерам
          if (filters.sizes.length > 0) {
            query += ` && count((sizes[])[@ in $sizes]) > 0`;
          }

          if (filters.isNew) {
            query += ` && isNew == true`;
          }

          if (filters.minPrice !== undefined) {
            query += ` && price >= $minPrice`;
          }

          if (filters.maxPrice !== undefined) {
            query += ` && price <= $maxPrice`;
          }

          // закрываем условия и выбираем нужные поля
          query += `]{
        _id,
        title,
        description,
        image,
        price,
        oldPrice,
        wbLink,
        nmId
      }`;

          // по возрастанию цены
          if (filters.sortBy === "price_asc") {
            query += ` | order(price asc)`;
          }
          // по убыванию цены
          else if (filters.sortBy === "price_desc") {
            query += ` | order(price desc)`;
          }
          //
          else if (filters.sortBy === "new") {
            query += ` | order(_createdAt desc)`;
          }

          // ЗАПРОС В SANITY
          // передаём параметры фильтров как GROQ-переменные
          const sanityData: SanityProduct[] = await client.fetch(query, {
            categories: filters.categories,
            fabrics: filters.fabrics,
            colors: filters.colors,
            sizes: filters.sizes,
            minPrice: filters.minPrice,
            maxPrice: filters.maxPrice,
          });

          // ОБОГАЩЕНИЕ ДАННЫХ ЧЕРЕЗ WB API
          // для каждого продукта пытаемся подтянуть актуальные данные из Wildberries
          const products: Slide[] = await Promise.all(
            sanityData.map(async (p) => {
              // если есть nmId — можно запросить WB API
              if (p.nmId) {
                try {
                  // запрос к WB API по nmId
                  const wbResponse = await fetch(
                    `https://card.wb.ru/cards/v2/detail?nm=${p.nmId}`
                  );

                  const wbData = await wbResponse.json();
                  const product = wbData.data.products[0]; // предполагаем такую структуру ответа

                  // возвращаем данные с приоритетом WB
                  return {
                    id: p._id,
                    title: product.name || p.title, // название из WB или fallback
                    description: p.description, // описание всегда из Sanity
                    imageUrl: product.image || urlFor(p.image), // изображение WB или Sanity
                    newPrice: product.price || p.price, // цена WB или Sanity
                    oldPrice: product.oldPrice || p.oldPrice,
                    link: p.wbLink,
                  };
                } catch (wbErr) {
                  // если WB API упал — логируем и используем данные из Sanity
                  console.warn(`WB API error for nmId ${p.nmId}:`, wbErr);

                  return {
                    id: p._id,
                    title: p.title,
                    description: p.description,
                    imageUrl: urlFor(p.image),
                    newPrice: p.price,
                    oldPrice: p.oldPrice,
                    link: p.wbLink,
                  };
                }
              }

              // FALLBACK
              // если nmId нет — используем только Sanity
              return {
                id: p._id,
                title: p.title,
                description: p.description,
                imageUrl: urlFor(p.image),
                newPrice: p.price,
                oldPrice: p.oldPrice,
                link: p.wbLink,
              };
            })
          );

          // успешный ответ RTK Query
          return { data: products };
        } catch (err: unknown) {
          //  ОБРАБОТКА ОШИБОК
          const error: FetchBaseQueryError = {
            status: "FETCH_ERROR",
            error:
              err instanceof Error
                ? err.message
                : JSON.stringify(err) || "Unknown error",
          };

          return { error };
        }
      },
    }),
  }),
});

// экспорт хука для использования в компонентах
export const { useGetProductsQuery, useGetFilteredProductsQuery } = productsApi;
