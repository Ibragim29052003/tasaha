import { useParams } from "react-router-dom";
import { useGetProductByIdQuery } from "@/sanity/productsApi";
import Spiner from "@/components/Spiner/Spiner";
import styles from "./ProductDetailPage.module.scss";

const ProductDetailPage = () => {
  // Получаем id товара из URL параметров
  const { id } = useParams<{ id: string }>();
  
  // Запрашиваем данные товара
  const { data: product, isLoading, error } = useGetProductByIdQuery(id!);

  if (isLoading) return <Spiner />;
  if (error || !product) return <div>Ошибка загрузки товара</div>;

  return (
    <div className={styles.container}>
      <div className={styles.product}>
        {/* ГАЛЕРЕЯ ФОТО */}
        <div className={styles.gallery}>
          {product.images.map((image, index) => (
            <img key={index} src={image} alt={product.title} />
          ))}
        </div>

        {/* ВИДЕО (если есть) */}
        {product.video && (
          <div className={styles.video}>
            <video controls>
              <source src={product.video} type="video/mp4" />
            </video>
          </div>
        )}

        {/* ИНФОРМАЦИЯ О ТОВАРЕ */}
        <div className={styles.info}>
          <h1>{product.title}</h1>
          
          {/* ЦЕНЫ */}
          <div className={styles.prices}>
            <span className={styles.newPrice}>{product.newPrice} ₽</span>
            {product.oldPrice && (
              <span className={styles.oldPrice}>{product.oldPrice} ₽</span>
            )}
          </div>

          {/* КРАТКОЕ ОПИСАНИЕ */}
          {product.shortDescription && (
            <p className={styles.shortDescription}>{product.shortDescription}</p>
          )}

          {/* РАЗМЕРЫ */}
          {product.sizes && product.sizes.length > 0 && (
            <div className={styles.sizes}>
              <h3>Размеры:</h3>
              <div className={styles.sizeList}>
                {product.sizes.map((size) => (
                  <span key={size} className={styles.size}>{size}</span>
                ))}
              </div>
            </div>
          )}

          {/* ССЫЛКА НА WB */}
          <a href={product.link} target="_blank" rel="noopener noreferrer" className={styles.wbLink}>
            Купить на Wildberries
          </a>
        </div>

        {/* ПОЛНОЕ ОПИСАНИЕ */}
        <div className={styles.fullDescription}>
          <h2>Описание</h2>
          <p>{product.fullDescription || product.description}</p>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
