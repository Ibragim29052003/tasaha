import type { Slide } from "@/redux/slider/types";
import styles from "./ProductList.module.scss";
import type { FC } from "react";
import Spiner from "../Spiner/Spiner";
import ProductCard from "../ProductCard/ProductCard";

interface ProductListProps {
  products: Omit<Slide, "description" | "link">[]; // берем все поля кроме описания и ссылки (она будет на детальной странице)
  loading: boolean; // флаг загрузки
  extraClassName?: string; // дополнительный класс
}

const ProductList: FC<ProductListProps> = ({ products, loading, extraClassName }) => {
  if (loading) {
    return(
    <div
        className={styles.productList__loading}
        role="status"    
        aria-live="polite"
        aria-busy="true"
        >
        <div aria-hidden='true'>
            <Spiner />
        </div>
        <p className={styles.productList__loading_text}>
          Загрузка товаров...
        </p>
    </div>
    ) 
  }

  if (products.length === 0) {
    return (
      <div className={styles.productList__empty} role="region" aria-live="polite">
        <p className={styles.productList__empty_title}>Товары не найдены</p>
        <p className={styles.productList__empty_text}>Попробуйте изменить фильтры</p>
      </div>
    )
  }

  return (
    <div 
    className={styles.productList}
    role="region"
    aria-label="Список товаров"
    >
      <ul
        className={`${styles.productList__grid} ${extraClassName || ''}`}
      >
         {products.map((product) => (
          <li
            key={product.id}
            className={styles.productList__item}
          >
            <ProductCard product={product} />
          </li>
        ))}

      </ul>

    </div>
  )

};

export default ProductList;
