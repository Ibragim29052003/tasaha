
import { useState, type FC } from "react";
import styles from "./CatalogLayout.module.scss";
import FilterPanel from "@/components/FilterPanel/FilterPanel";
import ProductList from "@/components/ProductList/ProductList";
import SortPanel from "@/components/SortPanel/SortPanel";
import type { Slide } from "@/redux/slider/types";


type Category = "children" | "women" | "men";

type CatalogLayoutProps = {
    category: Category,
    products: Omit<Slide, "link" | "description">[],
    loading: boolean
}


const CatalogLayout: FC<CatalogLayoutProps> = ({ products, loading, category }) => {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  return (
    <div className={styles.catalog} role="region" aria-label={`${category} catalog`}>
      <div className={styles.catalog__mobileBar}>
        <SortPanel />
        <button
          className={styles.catalog__filterButton}
          onClick={() => setMobileFiltersOpen(true)}
          aria-expanded={mobileFiltersOpen}
          aria-controls="filter-drawer"
        >
          Фильтры
        </button>
      </div>

      <div className={styles.catalog__body}>
        <aside className={styles.catalog__sidebar}>
          <FilterPanel category={category} />
        </aside>

        <div className={styles.catalog__content}>
          <SortPanel />
          <ProductList products={products} loading={loading} />
        </div>
      </div>

      <div
        id="filter-drawer"
        className={`${styles.catalog__drawer} ${
          mobileFiltersOpen ? styles.catalog__drawer_open : ""
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Фильтры"
      >
        <div className={styles.catalog__drawerHeader}>
          <span>Фильтры</span>
          <button
            onClick={() => setMobileFiltersOpen(false)}
            aria-label="Закрыть фильтры"
          >
            ✕
          </button>
        </div>

        <FilterPanel category={category} />
      </div>
    </div>
  );
};

export default CatalogLayout;
