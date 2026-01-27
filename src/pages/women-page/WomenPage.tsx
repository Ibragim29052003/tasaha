import { useEffect, type FC } from "react";
import styles from "./WomenPage.module.scss";
import { useAppDispatch } from "@/redux/store";
import { setSlides } from "@/redux/slider/slice";
import Slider from "@/features/slider/Slider";
import { useGetProductsQuery } from "@/sanity/productsApi";
import Spiner from "@/components/Spiner/Spiner";

const WomenPage: FC = () => {
  const dispatch = useAppDispatch();

  // получаем продукты с Sanity
  const { data: slides, isLoading, error } = useGetProductsQuery("women");

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
<p>.</p>
<p>.</p>
<p>.</p>
<p>.</p>
<p>.</p>
      <p>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Sit ad omnis voluptatem dignissimos modi. Accusamus doloribus quisquam nostrum facere eveniet consectetur obcaecati quas iusto reprehenderit culpa quae aspernatur, inventore architecto.</p>
      <p>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Sit ad omnis voluptatem dignissimos modi. Accusamus doloribus quisquam nostrum facere eveniet consectetur obcaecati quas iusto reprehenderit culpa quae aspernatur, inventore architecto.</p>
      <p>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Sit ad omnis voluptatem dignissimos modi. Accusamus doloribus quisquam nostrum facere eveniet consectetur obcaecati quas iusto reprehenderit culpa quae aspernatur, inventore architecto.</p>
      <p>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Sit ad omnis voluptatem dignissimos modi. Accusamus doloribus quisquam nostrum facere eveniet consectetur obcaecati quas iusto reprehenderit culpa quae aspernatur, inventore architecto.</p>
      <p>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Sit ad omnis voluptatem dignissimos modi. Accusamus doloribus quisquam nostrum facere eveniet consectetur obcaecati quas iusto reprehenderit culpa quae aspernatur, inventore architecto.</p>
    </div>
  );
};

export default WomenPage;
