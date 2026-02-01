import { useEffect, type FC } from "react";
import styles from "./CategoryPage.module.scss";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { selectFilters } from "@/redux/filter/selectors";
import { useGetFilteredProductsQuery, useGetProductsQuery } from "@/sanity/productsApi";
import Slider from "@/features/slider/Slider";
import CatalogLayout from "../CatalogLayout";
import { setSlides } from "@/redux/slider/slice";
import Spiner from "../Spiner/Spiner";
import useDebounce from "@/hooks/useDebounce";

interface CategoryPageProps {
  category: "women" | "men" | "children";
}

const CategoryPage: FC<CategoryPageProps> = ({ category }) => {
  const dispatch = useAppDispatch();
  const filters = useAppSelector(selectFilters);
const debouncedFilters = useDebounce(filters, 500)

  const {
    data: products,
    isLoading: productsLoading,
    error: productsError,
  } = useGetFilteredProductsQuery({ ...debouncedFilters, category });

  const {
    data: slides,
    isLoading: slidesLoading,
    error: slidesError,
  } = useGetProductsQuery(category);

  useEffect(() => {
    if (!slidesLoading && slides) {
      dispatch(setSlides(slides));
    }
  }, [dispatch, slides, slidesLoading]);

  if (slidesLoading) return <Spiner />;
  if (slidesError || productsError) return <div>Ошибка загрузки товаров</div>;

  return (
    <div className={styles.categoryPage}>
      <Slider />
      <CatalogLayout
        category={category}
        products={products || []}
        loading={productsLoading}
      />
    </div>
  );
};

export default CategoryPage;
