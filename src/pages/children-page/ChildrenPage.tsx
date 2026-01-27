import { useEffect, type FC } from "react";
import styles from './ChildrenPage.module.scss'
import { useAppDispatch } from "@/redux/store";
import { setSlides } from "@/redux/slider/slice";
import Slider from "@/features/slider/Slider";
import { useGetProductsQuery } from "@/sanity/productsApi";
import Spiner from "@/components/Spiner/Spiner";

const ChildrenPage: FC = () => {
  const dispatch = useAppDispatch();

  // получаем продукты с Sanity для категории "children"
  const { data: slides, isLoading, error } = useGetProductsQuery("children");

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
      <p>Страница детских товаров</p>
    </div>
  );
};

export default ChildrenPage;
