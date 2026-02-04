import type { Slide } from "@/redux/slider/types";
import styles from "./ProductGrid.module.scss";
import ProductCard from "@/components/ProductCard/ProductCard";
import { forwardRef, memo, type FC, type Ref } from "react";

interface ProductGridProps {
  extraClassName?: string;
  visibleProducts: Omit<Slide, "description" | "link">[];
  isFilterVisible: boolean;
}

const ProductGrid: FC<ProductGridProps & { ref?: Ref<HTMLUListElement> }> =
  forwardRef(({ extraClassName, visibleProducts, isFilterVisible }, ref) => {
    return (
      <ul
        className={`${styles.productGrid__grid} ${extraClassName || ""} ${
          !isFilterVisible ? styles.productGrid__grid_filterInvisible : ""
        }`}
        ref={ref}
      >
        {visibleProducts.map((product) => (
          <li key={product.id} className={styles.productGrid__item}>
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
    );
  });

export default memo(ProductGrid);
