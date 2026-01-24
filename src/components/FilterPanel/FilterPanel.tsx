import { useAppDispatch, useAppSelector } from "@/redux/store";
import styles from "./FilterPanel.module.scss";
import { selectFilters } from "@/redux/filter/selectors";
import { updateFilters } from "@/redux/filter/slice";

type Category =
  | "платья"
  | "костюмы"
  | "рубашки"
  | "жилетки"
  | "платье-халат"
  | "платье со штанами";

const CATEGORIES: Category[] = [
  "платья",
  "костюмы",
  "рубашки",
  "жилетки",
  "платье-халат",
  "платье со штанами",
];

const FilterPanel = () => {
  const dispatch = useAppDispatch();

  // получаем данные из редакса
  const filters = useAppSelector(selectFilters);

  // если значение есть — удаляем, если значения нет — добавляем (такая логика типична для чекбоксов)
  const toggleValue = <T,>(list: T[], value: T): T[] => {
    return list.includes(value)
      ? // filter для иммутабельного изменения, то есть наша функция всегда возвращает новый массив не изменяя исходный
        list.filter((item) => item !== value)
      : [...list, value];
  };

  /**
   * @param category - категория по которой кликнули
   */
  const handleCategoryChange = (category: Category) => {
    const newCategories = toggleValue(filters.categories, category);

    // отправляем обновление фильтров в редакс
    dispatch(
      updateFilters({
        categories: newCategories,
      })
    );
  };

  return (
    <div className={styles.filterPanel} aria-labelledby="filters-title">
      <h2 className={styles.filterPanel__title} id="filters-title">
        Фильтры
      </h2>
      <fieldset className={styles.filterPanel__group}>
        <legend className={styles.filterPanel__legend}>Категории</legend>
        <ul className={styles.filterPanel__list}>
          {CATEGORIES.map((category, categoryId) => {
            const inputId = `category-${category}`;

            return (
              <li className={styles.filterPanel__item} key={categoryId}>
                <input
                  type="checkbox"
                  id={inputId}
                  checked={filters.categories.includes(category)} // чекбокс отмечен если категория есть в редаксе
                  onChange={() => handleCategoryChange(category)}
                  className={styles.filterPanel__checkbox}
                />
                <label htmlFor={inputId} className={styles.filterPanel__label}>
                  {category}
                </label>
              </li>
            );
          })}
        </ul>
      </fieldset>
    </div>
  );
};

export default FilterPanel;
