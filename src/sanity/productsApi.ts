// импортируем нужные зависимости
import { createApi } from "@reduxjs/toolkit/query/react";
import { client, urlFor, type SanityImage } from "./sanityClient";
import type { Slide } from "@/redux/slider/types";

// базовый тип продукта
type BaseProduct = {
  _id: string;
  title: string;
  image: SanityImage | null;
  price: number;
  oldPrice?: number;
  category: string;
  active: boolean;
};

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
  category?: string;
};

// тип для подсчета количества товаров по фильтрам
type ProductCounts = {
  fabrics: Record<string, number>;
  colors: Record<string, number>;
  sizes: Record<string, number>;
};

// хелпер для построения условий фильтрации
const buildFilterQuery = (
  filters: Filters,
  baseType: "sliderProduct" | "catalogProduct" | "detailProduct"
) => {
  const conditions: string[] = [`_type == "${baseType}"`, "active == true"];
  const params: Record<string, unknown> = {};

  // добавляем фильтр по категории
  if (filters.category) {
    conditions.push("category == $category");
    params.category = filters.category;
  }
  // добавляем фильтры по цене
  if (filters.minPrice !== undefined) {
    conditions.push("price >= $minPrice");
    params.minPrice = filters.minPrice;
  }
  if (filters.maxPrice !== undefined) {
    conditions.push("price <= $maxPrice");
    params.maxPrice = filters.maxPrice;
  }
  // добавляем фильтр по новинкам
  if (filters.isNew !== undefined) {
    conditions.push("isNew == $isNew");
    params.isNew = filters.isNew;
  }

  // добавляем фильтры по массивам (fabrics, sizes, colors)
  const arrayFilters: Record<string, keyof Filters> = {
    fabricsLower: "fabrics",
    sizesLower: "sizes",
    colorsLower: "colors",
  };

  for (const [paramKey, filterKey] of Object.entries(arrayFilters)) {
    const arr = filters[filterKey as keyof Filters] as string[] | undefined;
    if (arr && arr.length > 0) {
      conditions.push(`count(${filterKey}[lower(@) in $${paramKey}]) > 0`);
      params[paramKey] = arr.map((v) => v.toLowerCase());
    }
  }

  return { conditions, params };
};

// хелпер для построения сортировки
const buildSortClause = (sortBy?: string) => {
  if (!sortBy) return "";
  const sortMap: Record<string, string> = {
    price_asc: "order(price asc)",
    price_desc: "order(price desc)",
    new: "order(isNew desc, _createdAt desc)",
  };
  return ` | ${sortMap[sortBy] ?? ""}`;
};

// хелпер для подсчета элементов в массивах
const countItems = (arrs: (string[] | undefined)[]) => {
  const counts: Record<string, number> = {};
  for (const arr of arrs) {
    if (arr) {
      for (const item of arr) {
        const key = item.toLowerCase();
        counts[key] = (counts[key] ?? 0) + 1;
      }
    }
  }
  return counts;
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
    getProducts: builder.query<Slide[], string>({
      queryFn: async (category) => {
        try {
          // запрашиваем продукты типа sliderProduct с фильтром по категории
          const sanityProducts: SliderProduct[] = await client.fetch(
            `*[_type == "sliderProduct" && active == true && category == $category]{
              _id, title, description, image, price, oldPrice, wbLink
            }`,
            { category }
          );

          // преобразуем полученные данные в формат слайдов
          const slides: Slide[] = sanityProducts.map((product) => ({
            id: product._id,
            title: product.title,
            description: product.description,
            imageUrl: urlFor(product.image) ?? "",
            newPrice: product.price,
            oldPrice: product.oldPrice,
            link: product.wbLink,
          }));

          return { data: slides };
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

    // получение отфильтрованных продуктов для каталога
    getFilteredProducts: builder.query<Omit<Slide, "description" | "link">[], Filters>({
      queryFn: async (filters) => {
        try {
          // строим условия фильтрации
          const { conditions, params } = buildFilterQuery(filters, "catalogProduct");
          // формируем итоговый запрос
          const query = `*[${conditions.join(" && ")}]{
            _id, title, image, price, oldPrice, fabrics, sizes, colors, isNew
          }${buildSortClause(filters.sortBy)}`;

          // выполняем запрос к sanity
          const sanityProducts: CatalogProduct[] = await client.fetch(query, params);

          // преобразуем данные в формат карточек товаров
          const products: Omit<Slide, "description" | "link">[] = sanityProducts.map(
            (product) => ({
              id: product._id,
              title: product.title,
              imageUrl: urlFor(product.image) ?? "",
              newPrice: product.price,
              oldPrice: product.oldPrice,
            })
          );

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
    getFilterConfigs: builder.query<
      Record<string, { fabrics: string[]; colors: string[]; sizes: string[] }>,
      void
    >({
      queryFn: async () => {
        try {
          // запрашиваем все конфиги фильтров
          const configs: FilterConfig[] = await client.fetch(
            `*[_type == "filterConfig"]{ category, fabrics, colors, sizes }`
          );

          // преобразуем в объект с категориями как ключами
          const result = configs.reduce(
            (acc, config) => {
              acc[config.category] = {
                fabrics: config.fabrics ?? [],
                colors: config.colors ?? [],
                sizes: config.sizes ?? [],
              };
              return acc;
            },
            {} as Record<string, { fabrics: string[]; colors: string[]; sizes: string[] }>
          );

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

    // получение количества товаров для каждого фильтра
    getFilterCounts: builder.query<ProductCounts, { category: string; filters: Filters }>({
      queryFn: async ({ category, filters }) => {
        try {
          // строим условия фильтрации с учетом категории
          const { conditions, params } = buildFilterQuery(
            { ...filters, category },
            "catalogProduct"
          );
          const query = `*[${conditions.join(" && ")}]{ fabrics, colors, sizes }`;

          // выполняем запрос к sanity
          const products = await client.fetch(query, params);

          // считаем количество для каждого фильтра
          const fabricCounts = countItems(
            products.map((p: { fabrics?: string[] }) => p.fabrics)
          );
          const colorCounts = countItems(
            products.map((p: { colors?: string[] }) => p.colors)
          );
          const sizeCounts = countItems(
            products.map((p: { sizes?: string[] }) => p.sizes)
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
          const sanityProduct: DetailProduct = await client.fetch(
            `*[_type == "detailProduct" && _id == $id][0]{
              _id, title, shortDescription, fullDescription, image,
              gallery, videoUrl, videoThumbnail, price, oldPrice, sizes, wbLink
            }`,
            { id }
          );

          // проверяем, найден ли товар
          if (!sanityProduct) {
            return { error: { message: "Product not found" } };
          }

          // формируем данные для детальной страницы
          const product = {
            id: sanityProduct._id,
            title: sanityProduct.title,
            description:
              sanityProduct.shortDescription ??
              sanityProduct.fullDescription ??
              "",
            shortDescription: sanityProduct.shortDescription,
            fullDescription: sanityProduct.fullDescription,
            images: sanityProduct.gallery?.map((img) => urlFor(img) ?? "") ?? [
              urlFor(sanityProduct.image) ?? "",
            ],
            videoUrl: sanityProduct.videoUrl,
            videoThumbnail: sanityProduct.videoThumbnail
              ? urlFor(sanityProduct.videoThumbnail)
              : "",
            sizes: sanityProduct.sizes ?? [],
            newPrice: sanityProduct.price,
            oldPrice: sanityProduct.oldPrice,
            link: sanityProduct.wbLink,
          };

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
            `*[_type == "catalogProduct" && active == true && category == $category] | {
              "min": min(price),
              "max": max(price)
            }`,
            { category }
          );

          // если результат пустой, возвращаем стандартный диапазон
          const min = result.min ?? 0;
          const max = result.max ?? 30000;

          return { data: { min, max } };
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

// тип для диапазона цен
export type PriceRange = {
  min: number;
  max: number;
};
