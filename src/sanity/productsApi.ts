import { createApi } from "@reduxjs/toolkit/query/react";
import { client, urlFor, type SanityImage } from "./sanityClient";
import type { Slide } from "@/redux/slider/types";

// ОБНОВЛЕННЫЙ тип продукта из Sanity с новыми полями
type SanityProduct = {
  _id: string;
  title: string;
  description: string;
  image: SanityImage | null;
  price: number;
  oldPrice?: number;
  wbLink: string;
  //////////////
  nmId: number; // артикул WB для связи с API
  category: string; // категория для фильтрации по страницам
  shortDescription?: string; // краткое описание для детальной страницы
  fullDescription?: string;
  fabrics?: string[];
  colors?: string[];
  sizes?: string[];
  isNew?: boolean; // флаг новинки
};

// тип фильтров с категорией
type Filters = {
  categories: string[]; // мб fabrics (оставил для совместимости, но fabrics отдельно)
  fabrics: string[]; // ткани
  sizes: string[];
  colors: string[];
  minPrice?: number;
  maxPrice?: number;
  isNew?: boolean; // только новинки
  sortBy?: "price_asc" | "price_desc" | "new"; // сортировка
  category?: string; // категория страницы (women/men/children)
};

// тип данных из WB API (карточка товара)
type WbCard = {
  nmId: number;
  title: string;
  description: string;
  images: string[]; // массив фото
  video: string[]; // массив видео
  price: number;
  oldPrice?: number;
  availability: number; // остаток
  sizes?: string[];
  colors?: string[];
  categories?: string[]; // категории
};

// СОЗДАЕМ API для работы с продуктами
export const productsApi = createApi({
  // уникальный ключ для редюсера в Redux store
  reducerPath: "productsApi",

  // заглушка для baseQuery (не используем стандартный fetch)
  baseQuery: async () => ({ data: null }),

  // ОПРЕДЕЛЯЕМ КОНЕЧНЫЕ ТОЧКИ API
  endpoints: (builder) => ({
    // ПОЛУЧЕНИЕ ПРОДУКТОВ ДЛЯ СЛАЙДЕРА
    // принимает категорию (women/men/children) и возвращает слайды
    getProducts: builder.query<Slide[], string>({
      queryFn: async (category) => {
        try {
          // ШАГ 1: запрашиваем активные продукты из Sanity ПО КАТЕГОРИИ
          // GROQ запрос фильтрует по типу, активности и категории
          const sanityProducts: SanityProduct[] = await client.fetch(
            `*[_type == "product" && active == true && category == $category]{
              _id,
              title,
              description,
              image,
              price,
              oldPrice,
              wbLink,
              nmId
            }`,
            { category } // передаем категорию как параметр
          );

          // ШАГ 2: получаем актуальные данные из WB API по артикулам
          // собираем все nmId из продуктов Sanity
          const nmIds = sanityProducts.map((p) => p.nmId);

          if (nmIds.length === 0) {
            return { data: [] };
          }

          // запрос к нашему backend, который проксирует WB API
          // URL: http://localhost:3001/api/wb/cards?nmIds=123,456,789
          const wbResponse = await fetch(
            `http://localhost:3000/api/wb/cards?nmIds=${nmIds.join(",")}`
          );
          const wbCards: WbCard[] = await wbResponse.json();

          // ШАГ 3: ОБЪЕДИНЯЕМ ДАННЫЕ ИЗ ДВУХ ИСТОЧНИКОВ
          // для слайдера: фото из WB, текст/цены/ссылки из Sanity // цены из Sanity потому что WB API не учитывает скидку от себя, а только скидку от продавца
          const slides: Slide[] = sanityProducts.map((product) => {
            // ищем соответствующий товар в данных WB по nmId
            const wbCard = wbCards.find((card) => card.nmId === product.nmId);

            // создаем объект слайда с объединенными данными
            return {
              id: product._id, // ID из Sanity
              title: product.title, // ЗАГОЛОВОК ИЗ SANITY
              description: product.description, // ОПИСАНИЕ ИЗ SANITY
              imageUrl: wbCard?.images?.[0] || urlFor(product.image), // ФОТО ИЗ WB (или fallback из Sanity)
              newPrice: product.price, // ЦЕНА ИЗ SANITY
              oldPrice: product.oldPrice,
              link: product.wbLink, // ССЫЛКА ИЗ SANITY
            };
          });

          // возвращаем успешный результат
          return { data: slides };
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

    // ПОЛУЧЕНИЕ ОТФИЛЬТРОВАННЫХ ПРОДУКТОВ ДЛЯ КАТАЛОГА
    // принимает объект фильтров и возвращает отфильтрованные товары
    getFilteredProducts: builder.query<Slide[], Filters>({
      queryFn: async (filters) => {
        try {
          // ШАГ 1: СТРОИМ ДИНАМИЧЕСКИЙ GROQ ЗАПРОС К SANITY
          // начинаем с базовых условий
          let query = `*[_type == "product" && active == true`;

          // ДОБАВЛЯЕМ УСЛОВИЯ ФИЛЬТРАЦИИ

          // фильтр по категории страницы (women/men/children)
          if (filters.category) {
            query += ` && category == $category`;
          }

          // фильтр по тканям (проверяем вхождение в массив)
          if (filters.fabrics.length) {
            query += ` && count(fabrics[@ in $fabrics]) > 0`;
          }

          // фильтр по цветам
          if (filters.colors.length) {
            query += ` && count(colors[@ in $colors]) > 0`;
          }

          // фильтр по размерам
          if (filters.sizes.length) {
            query += ` && count(sizes[@ in $sizes]) > 0`;
          }

          // фильтр по новинкам
          if (filters.isNew) {
            query += ` && isNew == true`;
          }

          // фильтр по минимальной цене
          if (filters.minPrice !== undefined) {
            query += ` && price >= $minPrice`;
          }

          // фильтр по максимальной цене
          if (filters.maxPrice !== undefined) {
            query += ` && price <= $maxPrice`;
          }

          // ЗАВЕРШАЕМ БАЗОВУЮ ЧАСТЬ ЗАПРОСА И УКАЗЫВАЕМ ПОЛЯ
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

          // ДОБАВЛЯЕМ СОРТИРОВКУ
          if (filters.sortBy === "price_asc") {
            query += ` | order(price asc)`;
          } else if (filters.sortBy === "price_desc") {
            query += ` | order(price desc)`;
          } else if (filters.sortBy === "new") {
            query += ` | order(_createdAt desc)`;
          }

          // ВЫПОЛНЯЕМ ЗАПРОС К SANITY С ПАРАМЕТРАМИ ФИЛЬТРОВ
          const sanityProducts: SanityProduct[] = await client.fetch(
            query,
            filters
          );

          // ШАГ 2: ПОЛУЧАЕМ ДАННЫЕ ИЗ WB API
          const nmIds = sanityProducts.map((p) => p.nmId);
          const wbResponse = await fetch(
            `http://localhost:3000/api/wb/cards?nmIds=${nmIds.join(",")}`
          );
          const wbCards: WbCard[] = await wbResponse.json();

          // ШАГ 3: ОБЪЕДИНЯЕМ ДАННЫЕ ДЛЯ КАРТОЧЕК
          // для карточек: title и фото из WB, цены и описания из Sanity
          const products: Slide[] = sanityProducts.map((product) => {
            const wbCard = wbCards.find((card) => card.nmId === product.nmId);

            return {
              id: product._id,
              title: wbCard?.title || product.title, // ЗАГОЛОВОК ИЗ WB (fallback из Sanity)
              description: product.description, // ОПИСАНИЕ ИЗ SANITY
              imageUrl: wbCard?.images?.[0] || urlFor(product.image), // ФОТО ИЗ WB
              newPrice: product.price, // ЦЕНА ИЗ SANITY
              oldPrice: product.oldPrice, // СТАРАЯ ЦЕНА ИЗ SANITY
              link: product.wbLink, // ССЫЛКА ИЗ SANITY
            };
          });

          // возвращаем отфильтрованные продукты
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

    // ЭНДПОИНТ: ПОЛУЧЕНИЕ ДЕТАЛЬНОЙ ИНФОРМАЦИИ О ТОВАРЕ
    // принимает _id товара из Sanity и возвращает полные данные для детальной страницы
    getProductById: builder.query<
      {
        id: string;
        title: string;
        description: string;
        shortDescription?: string;
        fullDescription?: string;
        images: string[];
        video?: string;
        sizes: string[];
        newPrice: number;
        oldPrice?: number;
        link: string;
      },
      string
    >({
      // параметр - _id товара
      queryFn: async (id) => {
        try {
          // ШАГ 1: ПОЛУЧАЕМ ПРОДУКТ ИЗ SANITY ПО _id
          const sanityProduct: SanityProduct = await client.fetch(
            `*[_type == "product" && _id == $id][0]{
              _id,
              title,
              description,
              shortDescription,
              fullDescription,
              price,
              oldPrice,
              wbLink,
              nmId
            }`,
            { id }
          );

          // проверяем, найден ли товар
          if (!sanityProduct) {
            return { error: { message: "Product not found" } };
          }

          // ШАГ 2: ПОЛУЧАЕМ ДАННЫЕ ИЗ WB API ПО nmId
          const wbResponse = await fetch(
            `http://localhost:3000/api/wb/cards?nmIds=${sanityProduct.nmId}`
          );
          const wbCards: WbCard[] = await wbResponse.json();
          const wbCard = wbCards[0]; // берем первый (единственный) результат

          // ШАГ 3: ОБЪЕДИНЯЕМ ДАННЫЕ ДЛЯ ДЕТАЛЬНОЙ СТРАНИЦЫ
          const product = {
            id: sanityProduct._id,
            title: wbCard?.title || sanityProduct.title, // ЗАГОЛОВОК ИЗ WB
            description: sanityProduct.description, // ОПИСАНИЕ ИЗ SANITY
            shortDescription: sanityProduct.shortDescription, // КРАТКОЕ ОПИСАНИЕ ИЗ SANITY
            fullDescription: sanityProduct.fullDescription, // ПОЛНОЕ ОПИСАНИЕ ИЗ SANITY
            images: wbCard?.images || [urlFor(sanityProduct.image)], // ФОТО ИЗ WB
            video: wbCard?.video?.[0], // ВИДЕО ИЗ WB
            sizes: wbCard?.sizes || [], // РАЗМЕРЫ ИЗ WB
            newPrice: sanityProduct.price, // ЦЕНА ИЗ SANITY
            oldPrice: sanityProduct.oldPrice, // СТАРАЯ ЦЕНА ИЗ SANITY
            link: sanityProduct.wbLink, // ССЫЛКА ИЗ SANITY
          };

          return { data: product };
        } catch (e) {
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

// ЭКСПОРТИРУЕМ ХУКИ ДЛЯ ИСПОЛЬЗОВАНИЯ В КОМПОНЕНТАХ
export const {
  useGetProductsQuery, // для слайдера
  useGetFilteredProductsQuery, // для каталога с фильтрами
  useGetProductByIdQuery, // для детальной страницы
} = productsApi;
