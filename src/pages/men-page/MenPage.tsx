import { useEffect, type FC } from "react";
import styles from "./MenPage.module.scss";
import { useAppDispatch } from "@/redux/store";
import { setSlides } from "@/redux/slider/slice";
import { menSlides } from "@/shared/config/sliderConfig";
import Slider from "@/features/slider/Slider";

const MenPage: FC = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setSlides(menSlides));
  }, [dispatch]);

  return (
    <div className={styles.container}>
      <Slider />
    </div>
  );
};

export default MenPage;
