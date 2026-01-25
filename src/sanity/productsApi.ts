import { createApi } from "@reduxjs/toolkit/query/react";
import { client, urlFor, type SanityImage } from "./sanityClient";
import type { Slide } from "@/redux/slider/types";
import type { Filters } from "@/redux/filter/types";

// тип продукта из Sanity - это наша база данных товаров, где хранятся основные данные о продуктах
type SanityProduct = {
  _id: string;
  title: string;
  description: string;
  image: SanityImage | null;
  price: number;
  oldPrice?: number;
  wbLink: string;
  nmId?: string;
};

// тип карточки из Wildberries - это данные, которые мы получаем из внешнего API маркетплейса
type WbCard = {
  nmID: number;
  title: string;
  description: string;
  brand?: string;
  photos?: {
    big: string;
  }[];
};

// создаем API для работы с продуктами с использованием RTK Query
// RTK Query - это мощный инструмент для управления кэшированием и синхронизацией данных
export const productsApi = createApi({
  // уникальный ключ для редюсера в Redux store
  reducerPath: "productsApi",

  // заглушка для baseQuery, так как мы используем кастомную логику запросов
  // baseQuery требуется RTK Query для типизации, но мы не используем стандартный fetchBaseQuery
  baseQuery: async () => ({ data: null }),

  // определяем конечные точки API - методы для получения данных
  endpoints: (builder) => ({
    // получение всех продуктов для главной страницы (слайдер) 
    getProducts: builder.query<Slide[], void>({
      // queryFn определяет как выполнять запрос и обрабатывать результат
      queryFn: async () => {
        try {
          // Шаг 1: запрашиваем активные продукты из Sanity CMS
          // Sanity - это headless CMS, где мы храним информацию о наших товарах
          const sanityProducts: SanityProduct[] = await client.fetch(
            `*[_type == "product" && active == true]{
              _id,
              title,
              description,
              image,
              price,
              oldPrice,
              wbLink,
              nmId
            }`
          );

          // Шаг 2: получаем актуальные данные из Wildberries через наш backend
          // Backend нужен для безопасного хранения токенов и кэширования данных
          const wbResponse = await fetch(
            ""
          );
          const wbCards: WbCard[] = await wbResponse.json();

          // Шаг 3: объединяем данные из двух источников
          // приоритет отдается данным из Wildberries как более актуальным
          const slides: Slide[] = sanityProducts.map((product) => {
            // ищем соответствующий товар в данных Wildberries по идентификатору
            const wbCard = wbCards.find(
              (card) => card.nmID === Number(product.nmId)
            );

            // создаем объект слайда с объединенными данными
            return {
              id: product._id,
              // используем название из Wildberries если есть, иначе из Sanity
              title: wbCard?.title || product.title,
              // используем описание из Wildberries если есть, иначе из Sanity
              description: wbCard?.description || product.description,
              // используем фото из Wildberries если есть, иначе конвертируем изображение из Sanity
              imageUrl: wbCard?.photos?.[0]?.big || urlFor(product.image),
              //////////////////////// ПОСМОТРЮ ПОТОМ СТРУКТУРУ ОТВЕТА
              //  цены пока берем только из Sanity, так как Wildberries может иметь другую структуру цен
              newPrice: product.price,
              oldPrice: product.oldPrice,
              // ссылка на товар в Wildberries
              link: product.wbLink,
            };
          });

          // возвращаем успешный результат с данными
          return { data: slides };
        } catch (e) {
          // обрабатываем ошибки и возвращаем их в формате RTK Query
          return {
            error: {
              message: e instanceof Error ? e.message : "Unknown error",
            },
          };
        }
      },
    }),

    // получение отфильтрованных продуктов для каталога
    // фильтры передаются как параметры запроса
    getFilteredProducts: builder.query<Slide[], Filters>({
      queryFn: async (filters) => {
        try {
          // Шаг 1: строим динамический GROQ-запрос к Sanity на основе переданных фильтров
          // GROQ - это язык запросов Sanity, похожий на GraphQL
          let query = `*[_type == "product" && active == true`;

          // добавляем условия фильтрации в запрос
          if (filters.categories.length)
            query += ` && count(categories[@ in $categories]) > 0`;

          if (filters.fabrics.length)
            query += ` && count(fabrics[@ in $fabrics]) > 0`;

          if (filters.colors.length)
            query += ` && count(colors[@ in $colors]) > 0`;

          if (filters.sizes.length)
            query += ` && count(sizes[@ in $sizes]) > 0`;

          if (filters.isNew)
            query += ` && isNew == true`;

          if (filters.minPrice !== undefined)
            query += ` && price >= $minPrice`;

          if (filters.maxPrice !== undefined)
            query += ` && price <= $maxPrice`;

          // завершаем базовую часть запроса и указываем какие поля возвращать
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

          // добавляем сортировку в зависимости от выбранного параметра
          if (filters.sortBy === "price_asc")
            query += ` | order(price asc)`;
          else if (filters.sortBy === "price_desc")
            query += ` | order(price desc)`;
          else if (filters.sortBy === "new")
            query += ` | order(_createdAt desc)`;

          // Шаг 2: выполняем запрос к Sanity с фильтрами
          const sanityProducts: SanityProduct[] = await client.fetch(query, filters);

          // Шаг 3: получаем актуальные данные из Wildberries
          const wbResponse = await fetch(
            ""
          );
          const wbCards: WbCard[] = await wbResponse.json();

          // Шаг 4: объединяем данные из Sanity и Wildberries
          const products: Slide[] = sanityProducts.map((product) => {
            const wbCard = wbCards.find(
              (card) => card.nmID === Number(product.nmId)
            );

            return {
              id: product._id,
              title: wbCard?.title || product.title,
              description: wbCard?.description || product.description,
              imageUrl: wbCard?.photos?.[0]?.big || urlFor(product.image),
              newPrice: product.price,
              oldPrice: product.oldPrice,
              link: product.wbLink,
            };
          });

          // возвращаем отфильтрованные и обогащенные продукты
          return { data: products };
        } catch (e) {
          // обработка ошибок
          return {
            error: {
              message: e instanceof Error ? e.message : "Unknown error",
            },
          };
        }
      },
    }),
  }),
});

// экспортируем хуки для использования в React-компонентах
// эти хуки автоматически генерируются RTK Query
export const {
  useGetProductsQuery, // хук для получения всех продуктов
  useGetFilteredProductsQuery, // хук для получения отфильтрованных продуктов
} = productsApi;