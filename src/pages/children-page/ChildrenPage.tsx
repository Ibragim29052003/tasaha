import { type FC } from "react";
import styles from './ChildrenPage.module.scss'


const ChildrenPage: FC = () => {
  return (
    <div className={styles.container}>
        <p>     </p>
      <p>.   </p>
      <p>.  </p>
      <h1>Главная страница для детей</h1>
      <p>Контент для категории "Детям"</p>
    </div>
  );
};

export default ChildrenPage;