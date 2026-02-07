// импортируем нужные зависимости
import { createApi } from "@reduxjs/toolkit/query/react";
import { client, urlFor, type SanityImage } from "./sanityClient";
import type { Slide } from "@/redux/slider/types";

type BaseProduct = {
  _id: string;
  title: string;
  image: SanityImage | null;
  price: number;
  oldPrice?: number;
  category: string;
  active: boolean;
};

// типы для разных схем
// тип для конфига фильтров
type FilterConfig = {
  category: string;
  fabrics?: string[];
  colors?: string[];
  sizes?: string[];
};

// тип для продукта слайдера
type SliderProduct = BaseProduct & {
  description: string;
  wbLink: string;
};

// тип для продукта каталога
type CatalogProduct = BaseProduct & {
  fabrics?: string[];
  sizes?: string[];
  colors?: string[];
  isNew?: boolean;
};

// тип для детальной страницы товара
type DetailProduct = BaseProduct & {
  shortDescription?: string;
  fullDescription?: string;
  gallery?: SanityImage[];
  videoUrl?: string;
  videoThumbnail?: SanityImage;
  sizes?: string[];
  wbLink: string;
};

// тип фильтров для каталога
type Filters = {
  fabrics: string[];
  sizes: string[];
  colors: string[];
  minPrice?: number;
  maxPrice?: number;
  isNew?: boolean;
  sortBy?: "price_asc" | "price_desc" | "new";
  category?: string; // добавляем категорию для фильтрации
};

// создаем api для работы с продуктами
export const productsApi = createApi({
  // уникальный ключ для редюсера в redux store
  reducerPath: "productsApi",

  // заглушка для baseQuery (не используем стандартный fetch)
  baseQuery: async () => ({ data: null }),

  // определяем конечные точки api
  endpoints: (builder) => ({
    // получение продуктов для слайдера
    // используем тип sliderProduct для получения данных
    getProducts: builder.query<Slide[], string>({
      queryFn: async (category) => {
        try {
          // запрашиваем продукты типа sliderProduct с фильтром по категории
          // это позволяет получать разные слайдеры для разных страниц
          const sanityProducts: SliderProduct[] = await client.fetch(
            `*[_type == "sliderProduct" && active == true && category == $category]{
          _id,
          title,
          description,
          image,
          price,
          oldPrice,
          wbLink
        }`,
            { category } // передаем категорию как параметр
          );

          // преобразуем полученные данные в формат слайдов
          // слайды используются в компоненте слайдера для каждой страницы
          const slides: Slide[] = sanityProducts.map((product) => {
            return {
              id: product._id,
              title: product.title,
              description: product.description,
              imageUrl: urlFor(product.image) || "",
              newPrice: product.price,
              oldPrice: product.oldPrice,
              link: product.wbLink,
            };
          });

          // возвращаем успешный результат
          // данные будут использоваться в слайдере для конкретной категории
          return { data: slides };
        } catch (e) {
          // обработка ошибок при получении данных
          // если произошла ошибка, возвращаем сообщение об ошибке
          return {
            error: {
              message: e instanceof Error ? e.message : "Unknown error",
            },
          };
        }
      },
    }),

    // получение отфильтрованных продуктов для каталога
    // используем тип catalogProduct для получения данных
    getFilteredProducts: builder.query<
      Omit<Slide, "description" | "link">[],
      Filters
    >({
      queryFn: async (filters) => {
        try {
          // запрашиваем продукты типа catalogProduct
          // в этом запросе мы получаем данные для карточек товаров
          let query = `*[_type == "catalogProduct" && active == true`;

          // добавляем фильтр по категории если он задан
          if (filters.category) {
            query += ` && category == $category`;
          }

          // добавляем фильтры по цене если они заданы
          if (filters.minPrice !== undefined) {
            query += ` && price >= $minPrice`;
          }

          if (filters.maxPrice !== undefined) {
            query += ` && price <= $maxPrice`;
          }

          // добавляем фильтры по fabrics если заданы
          if (filters.fabrics && filters.fabrics.length > 0) {
            query += ` && count(fabrics[lower(@) in $fabricsLower]) > 0`;
          }

          // добавляем фильтры по sizes если заданы
          if (filters.sizes && filters.sizes.length > 0) {
            query += ` && count(sizes[lower(@) in $sizesLower]) > 0`;
          }

          // добавляем фильтры по colors если заданы
          if (filters.colors && filters.colors.length > 0) {
            query += ` && count(colors[lower(@) in $colorsLower]) > 0`;
          }

          // добавляем фильтр по isNew если задан
          if (filters.isNew !== undefined) {
            query += ` && isNew == $isNew`;
          }

          // указываем поля для возврата
          query += `]{
        _id,
        title,
        image,
        price,
        oldPrice,
        fabrics,
        sizes,
        colors,
        isNew
      }`;

          // добавляем сортировку
          if (filters.sortBy === "price_asc") {
            query += ` | order(price asc)`;
          } else if (filters.sortBy === "price_desc") {
            query += ` | order(price desc)`;
          } else if (filters.sortBy === "new") {
            // Для сортировки по новинкам, сначала сортируем по isNew=true, потом по дате создания
            query += ` | order(isNew desc, _createdAt desc)`;
          }

          // выполняем запрос к sanity
          const sanityProducts: CatalogProduct[] = await client.fetch(query, {
            category: filters.category,
            minPrice: filters.minPrice,
            maxPrice: filters.maxPrice,
            fabricsLower: filters.fabrics?.map((f) => f.toLowerCase()),
            sizesLower: filters.sizes?.map((s) => s.toLowerCase()),
            colorsLower: filters.colors?.map((c) => c.toLowerCase()),
            isNew: filters.isNew,
          });

          // преобразуем данные в формат карточек товаров
          // карточки используются в каталоге товаров
          const products: Omit<Slide, "description" | "link">[] =
            sanityProducts.map((product) => {
              return {
                id: product._id,
                title: product.title,
                imageUrl: urlFor(product.image) || "",
                newPrice: product.price,
                oldPrice: product.oldPrice,
              };
            });

          // возвращаем отфильтрованные продукты
          // данные будут использоваться в каталоге с фильтрами
          return { data: products };
        } catch (e) {
          // обработка ошибок при получении данных
          return {
            error: {
              message: e instanceof Error ? e.message : "Unknown error",
            },
          };
        }
      },
    }),

    // получение конфигов фильтров
    // получаем настройки фильтров для каждой категории
    getFilterConfigs: builder.query<
      {
        [key: string]: { fabrics: string[]; colors: string[]; sizes: string[] };
      },
      void
    >({
      queryFn: async () => {
        try {
          // запрашиваем все конфиги фильтров
          const configs: FilterConfig[] = await client.fetch(
            `*[_type == "filterConfig"]{ category, fabrics, colors, sizes }`
          );

          // преобразуем в объект с категориями как ключами
          const result: {
            [key: string]: {
              fabrics: string[];
              colors: string[];
              sizes: string[];
            };
          } = {};
          configs.forEach((config: FilterConfig) => {
            result[config.category] = {
              fabrics: config.fabrics || [],
              colors: config.colors || [],
              sizes: config.sizes || [],
            };
          });

          // возвращаем успешный результат
          return { data: result };
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

    getFilterCounts: builder.query<
      {
        fabrics: Record<string, number>;
        colors: Record<string, number>;
        sizes: Record<string, number>;
      },
      {
        category: string;
        filters: Filters;
      }
    >({
      queryFn: async ({ category, filters }) => {
        try {
          let query = `*[_type == "catalogProduct" && active == true && category == $category`;

          if (filters.minPrice !== undefined) {
            query += ` && price >= $minPrice`;
          }
          if (filters.maxPrice !== undefined) {
            query += ` && price <= $maxPrice`;
          }
          if (filters.isNew !== undefined) {
            query += ` && isNew == $isNew`;
          }
          // добавляем фильтры по текущим выбранным значениям
          if (filters.fabrics && filters.fabrics.length > 0) {
            query += ` && count(fabrics[lower(@) in $fabricsLower]) > 0`;
          }
          if (filters.sizes && filters.sizes.length > 0) {
            query += ` && count(sizes[lower(@) in $sizesLower]) > 0`;
          }
          if (filters.colors && filters.colors.length > 0) {
            query += ` && count(colors[lower(@) in $colorsLower]) > 0`;
          }
          query += `]{ fabrics, colors, sizes }`;

          const products = await client.fetch(query, {
            category,
            minPrice: filters.minPrice,
            maxPrice: filters.maxPrice,
            isNew: filters.isNew,
            fabricsLower: filters.fabrics?.map((f) => f.toLowerCase()),
            sizesLower: filters.sizes?.map((s) => s.toLowerCase()),
            colorsLower: filters.colors?.map((c) => c.toLowerCase()),
          });

          const fabricCounts: Record<string, number> = {};
          const colorCounts: Record<string, number> = {};
          const sizeCounts: Record<string, number> = {};

          products.forEach(
            (product: {
              fabrics?: string[];
              colors?: string[];
              sizes?: string[];
            }) => {
              if (product.fabrics && Array.isArray(product.fabrics)) {
                product.fabrics.forEach((fabric: string) => {
                  const key = fabric.toLowerCase();
                  fabricCounts[key] = (fabricCounts[key] || 0) + 1;
                });
              }
              if (product.colors && Array.isArray(product.colors)) {
                product.colors.forEach((color: string) => {
                  const key = color.toLowerCase();
                  colorCounts[key] = (colorCounts[key] || 0) + 1;
                });
              }
              if (product.sizes && Array.isArray(product.sizes)) {
                product.sizes.forEach((size: string) => {
                  const key = size.toLowerCase();
                  sizeCounts[key] = (sizeCounts[key] || 0) + 1;
                });
              }
            }
          );

          return {
            data: {
              fabrics: fabricCounts,
              colors: colorCounts,
              sizes: sizeCounts,
            },
          };
        } catch (e) {
          return {
            error: {
              message: e instanceof Error ? e.message : "Unknown error",
            },
          };
        }
      },
    }),

    // детальная страница товара
    // используем тип detailProduct для получения всех данных
    getProductById: builder.query<
      {
        id: string;
        title: string;
        description: string;
        shortDescription?: string;
        fullDescription?: string;
        images: string[];
        videoUrl?: string;
        videoThumbnail?: string;
        sizes: string[];
        newPrice: number;
        oldPrice?: number;
        link: string;
      },
      string
    >({
      queryFn: async (id) => {
        try {
          // запрашиваем продукт типа detailProduct
          // получаем все данные для детальной страницы
          const sanityProduct: DetailProduct = await client.fetch(
            `*[_type == "detailProduct" && _id == $id][0]{
          _id,
          title,
          shortDescription,
          fullDescription,
          image,
          gallery,
          videoUrl,
          videoThumbnail,
          price,
          oldPrice,
          sizes,
          wbLink,
          category // добавляем категорию для проверки
        }`,
            { id }
          );

          // проверяем, найден ли товар
          // если товар не найден, возвращаем ошибку
          if (!sanityProduct) {
            return { error: { message: "Product not found" } };
          }

          // объединяем данные для детальной страницы
          // собираем все необходимые поля для отображения
          const product = {
            id: sanityProduct._id,
            title: sanityProduct.title,
            description:
              sanityProduct.shortDescription ||
              sanityProduct.fullDescription ||
              "",
            shortDescription: sanityProduct.shortDescription,
            fullDescription: sanityProduct.fullDescription,
            images: sanityProduct.gallery
              ? sanityProduct.gallery.map((img) => urlFor(img) || "")
              : [urlFor(sanityProduct.image) || ""],
            videoUrl: sanityProduct.videoUrl,
            videoThumbnail: sanityProduct.videoThumbnail
              ? urlFor(sanityProduct.videoThumbnail)
              : "",
            sizes: sanityProduct.sizes || [],
            newPrice: sanityProduct.price,
            oldPrice: sanityProduct.oldPrice,
            link: sanityProduct.wbLink,
          };

          // возвращаем данные для детальной страницы
          return { data: product };
        } catch (e) {
          // обработка ошибок при получении данных
          return {
            error: {
              message: e instanceof Error ? e.message : "Unknown error",
            },
          };
        }
      },
    }),

    // получение диапазона цен для фильтрации
    getPriceRange: builder.query<{ min: number; max: number }, string>({
      queryFn: async (category) => {
        try {
          // запрашиваем минимальную и максимальную цену для заданной категории
          const result = await client.fetch(
            `{
              "min": *[_type == "catalogProduct" && active == true && category == $category] | order(price asc)[0].price,
              "max": *[_type == "catalogProduct" && active == true && category == $category] | order(price desc)[0].price
            }`,
            { category }
          );

          // если результат пустой (нет товаров), возвращаем стандартный диапазон
          if (result.min === null || result.max === null) {
            return { data: { min: 0, max: 30000 } };
          }

          return { data: { min: result.min, max: result.max } };
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

// экспортируем хуки для использования в компонентах
export const {
  useGetProductsQuery, // для слайдера
  useGetFilteredProductsQuery, // для каталога с фильтрами
  useGetFilterConfigsQuery, // для конфигов фильтров
  useGetFilterCountsQuery, // для подсчета товаров по фильтрам
  useGetProductByIdQuery, // для детальной страницы
  useGetPriceRangeQuery, // для получения диапазона цен
} = productsApi;

// Тип для диапазона цен
export type PriceRange = {
  min: number;
  max: number;
};
