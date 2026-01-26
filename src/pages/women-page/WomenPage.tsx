import { useEffect, type FC } from "react";
import styles from "./WomenPage.module.scss";
import { useAppDispatch } from "@/redux/store";
import { setSlides } from "@/redux/slider/slice";
import Slider from "@/features/slider/Slider";

import Spiner from "@/components/Spiner/Spiner";
import { useGetSliderProductsQuery } from "@/sanity/productsApi";

const WomenPage: FC = () => {
  const dispatch = useAppDispatch();

  // Получаем слайды через RTK Query (Sanity + WB фото)
  const { data: slides, isLoading, error } = useGetSliderProductsQuery();

  // Сохраняем слайды в Redux для Slider
  useEffect(() => {
    if (!isLoading && slides) {
      dispatch(setSlides(slides));
    }
  }, [dispatch, slides, isLoading]);

  if (isLoading) return <Spiner />;
  if (error) return <div>Ошибка загрузки товаров</div>;


  return (
    <div className={styles.container}>
      <Slider />


    </div>
  );
};

export default WomenPage;
