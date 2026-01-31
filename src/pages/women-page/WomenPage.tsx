import { useEffect, type FC } from "react";
import styles from "./WomenPage.module.scss";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { setSlides } from "@/redux/slider/slice";
import Slider from "@/features/slider/Slider";
import {
  useGetFilteredProductsQuery,
  useGetProductsQuery,
} from "@/sanity/productsApi";
import Spiner from "@/components/Spiner/Spiner";
import CatalogLayout from "@/components/CatalogLayout/CatalogLayout";
import { selectFilters } from "@/redux/filter/selectors";

const WomenPage: FC = () => {
  const dispatch = useAppDispatch();

  // получаем данные из редакса
  const filters = useAppSelector(selectFilters);

  const {
    data: products,
    isLoading: productsLoading,
    error: productsError,
  } = useGetFilteredProductsQuery({ ...filters, category: "women" });

  // получаем продукты с Sanity
  const {
    data: slides,
    isLoading: slidesLoading,
    error: slidesError,
  } = useGetProductsQuery("women");

  useEffect(() => {
    if (!slidesLoading && slides) {
      dispatch(setSlides(slides));
    }
  }, [dispatch, slides, slidesLoading]);

  if (slidesLoading) return <Spiner />;
  if (slidesError || productsError) return <div>Ошибка загрузки товаров</div>;

  return (
    <div className={styles.container}>
      <Slider />
      <CatalogLayout
        category="women"
        products={products || []}
        loading={productsLoading}
      />
    </div>
  );
};

export default WomenPage;