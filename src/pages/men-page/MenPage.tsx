import { useEffect, type FC } from "react";
import styles from "./MenPage.module.scss";
import { useAppDispatch } from "@/redux/store";
import { setSlides } from "@/redux/slider/slice";
import Slider from "@/features/slider/Slider";
import { useGetProductsQuery } from "@/sanity/productsApi";
import Spiner from "@/components/Spiner/Spiner";

const MenPage: FC = () => {
  const dispatch = useAppDispatch();

  // получаем продукты с Sanity для категории "men"
  const { data: slides, isLoading, error } = useGetProductsQuery("men");

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
      <p>Страница мужских товаров</p>
    </div>
  );
};

export default MenPage;
