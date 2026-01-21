import { type FC } from "react";
import styles from './ChildrenPage.module.scss'


const ChildrenPage: FC = () => {
  return (
    <div className={styles.container}> 
      <h1 className={styles.children__title}>Страница в разработке</h1>
    </div>
  );
};

export default ChildrenPage;