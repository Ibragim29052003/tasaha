import { useCallback, useEffect, useState, type FC } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/store";

import styles from "./Slider.module.scss";
import ArrowButton from "@/components/ArrowButton/ArrowButton";
import Price from "@/components/Price/Price";

import {
  selectAutoPlay,
  selectCurrentIndex,
  selectShowArrows,
} from "@/redux/slider/selectors";
import { setCurrentIndex, toggleAutoPlay } from "@/redux/slider/slice";
import { useSwipeable } from "react-swipeable";
import { useGetSliderProductsQuery } from "@/sanity/productsApi"; // RTK Query хук

const Slider: FC = () => {
  const dispatch = useAppDispatch();
  const [isHovered, setIsHovered] = useState(false);

  const currentIndex = useAppSelector(selectCurrentIndex);
  const autoPlay = useAppSelector(selectAutoPlay);
  const showArrows = useAppSelector(selectShowArrows);

  // **RTK Query**: получаем слайды с сервера
  const { data: slides = [], isLoading } = useGetSliderProductsQuery();

  // функция перехода к следующему слайду
  const goToNextSlide = useCallback(() => {
    const nextIndex = (currentIndex + 1) % slides.length;
    dispatch(setCurrentIndex(nextIndex));
  }, [currentIndex, slides.length, dispatch]);

  // функция перехода к предыдущему слайду
  const goToPrevSlide = useCallback(() => {
    const prevIndex = (currentIndex - 1 + slides.length) % slides.length;
    dispatch(setCurrentIndex(prevIndex));
  }, [currentIndex, slides.length, dispatch]);

  // автопрокрутка
  useEffect(() => {
    if (!autoPlay || slides.length === 0) return;

    const interval = setInterval(goToNextSlide, 5000);
    return () => clearInterval(interval);
  }, [autoPlay, goToNextSlide, slides.length]);

  const handleMouseEnter = () => {
    dispatch(toggleAutoPlay());
    setIsHovered(true);
  };
  const handleMouseLeave = () => {
    dispatch(toggleAutoPlay());
    setIsHovered(false);
  };

  const handlers = useSwipeable({
    onSwipedLeft: goToNextSlide,
    onSwipedRight: goToPrevSlide,
    preventScrollOnSwipe: true,
    trackMouse: true,
  });



  if (isLoading) return <div>Загрузка слайдов...</div>;
  if (slides.length === 0) return <div>Слайды не найдены</div>;

  return (
    <div
      className={styles.slider}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...handlers}
      role="region"
      aria-label="Слайдер"
    >
      <div
        className={styles.slider__slidesContainer}
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {slides.map((slide) => (
          <div key={slide.id} className={styles.slider__slide}>
            <img
              className={styles.slider__img}
              src={slide.imageUrl}
              alt={slide.title}
            />
            <div className={styles.slider__info}>
              <div className={styles.slider__info_text}>
                <h1 className={styles.slider__title}>{slide.title}</h1>
                <p className={styles.slider__description}>
                  {slide.description}
                </p>
                <Price newPrice={slide.newPrice} oldPrice={slide.oldPrice} />
              </div>
              <a
                className={styles.slider__link}
                href={slide.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                Купить на WB
              </a>
            </div>
          </div>
        ))}
      </div>

      {showArrows && (
        <>
          <ArrowButton
            direction="left"
            onClick={goToPrevSlide}
            ariaLabel="Предыдущий слайд"
            isVisible={isHovered}
          />
          <ArrowButton
            direction="right"
            onClick={goToNextSlide}
            ariaLabel="Следующий слайд"
            isVisible={isHovered}
          />
        </>
      )}

      <div className={styles.slider__dots}>
        {slides.map((_, index) => (
          <button
            key={index}
            className={`${styles.slider__dot} ${
              index === currentIndex ? styles.slider__dot_active : ""
            }`}
            onClick={() => dispatch(setCurrentIndex(index))}
            aria-label={`Слайд ${index + 1}`}
            aria-current={index === currentIndex ? "true" : undefined}
          />
        ))}
      </div>
    </div>
  );
};

export default Slider;
