import type { Slide } from "@/redux/slider/types";
import styles from "./ProductList.module.scss";
import type { FC } from "react";
import Spiner from "../Spiner/Spiner";
import ProductCard from "../ProductCard/ProductCard";
import Pagination from "../Pagination/Pagination";

interface ProductListProps {
  products: Omit<Slide, "description" | "link">[]; // берем все поля кроме описания и ссылки (она будет на детальной странице)
  loading: boolean; // флаг загрузки
  extraClassName?: string; // дополнительный класс
  currentPage: number;
  totalProducts: number;
  onPageChange: (page: number) => void;
}

const ProductList: FC<ProductListProps> = ({
  products,
  loading,
  extraClassName,
  currentPage,
  totalProducts,
  onPageChange,
}) => {
  const ITEMS_PER_RAGE = 12; // количество товаров на странице (заглавными буквами - потому что не должно меняться)
  const totalPages = Math.ceil(totalProducts / ITEMS_PER_RAGE);
  const showPagination = totalPages > 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_RAGE;
  const visibleProducts = products.slice(
    startIndex,
    startIndex + ITEMS_PER_RAGE
  );

  if (loading) {
    return (
      <div
        className={styles.productList__loading}
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <div aria-hidden="true">
          <Spiner />
        </div>
        <p className={styles.productList__loading_text}>Загрузка товаров...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div
        className={styles.productList__empty}
        role="region"
        aria-live="polite"
      >
        <p className={styles.productList__empty_title}>Товары не найдены</p>
        <p className={styles.productList__empty_text}>
          Попробуйте изменить фильтры
        </p>
      </div>
    );
  }

  return (
    <div
      className={styles.productList}
      role="region"
      aria-label="Список товаров"
    >
      <ul className={`${styles.productList__grid} ${extraClassName || ""}`}>
        {visibleProducts.map((product) => (
          <li key={product.id} className={styles.productList__item}>
            <ProductCard product={product} />
          </li>
        ))}
      </ul>

      {showPagination && (
        <Pagination
          currentPage={currentPage}
          totalPage={totalPages}
          onPageChange={(page) => onPageChange(page)}
        />
      )}
    </div>
  );
};

export default ProductList;
