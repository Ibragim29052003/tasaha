import { useAppDispatch, useAppSelector } from "@/redux/store";
import styles from "./FilterPanel.module.scss";
import { selectFilters } from "@/redux/filter/selectors";
import { updateFilters, clearFilters } from "@/redux/filter/slice";
import FilterCheckboxGroup from "./FilterCheckboxGroup/FilterCheckboxGroup";
import { useGetFilterConfigsQuery, useGetFilterCountsQuery } from "@/sanity/productsApi";

// category определяет, какие именно фильтры будут показаны
interface FilterPanelProps {
  category: "women" | "men" | "children";
  onApply?: () => void;
}

const FilterPanel = ({ category, onApply }: FilterPanelProps) => {
  const dispatch = useAppDispatch(); // для обновления состояния фильтров

  // получаем данные из редакса
  const filters = useAppSelector(selectFilters);

  // получаем конфиги фильтров из Sanity
  const { data: configs } = useGetFilterConfigsQuery();

  // получаем конфиг для текущей категории, или пустой объект если нет данных
  const config = configs?.[category] || { fabrics: [], colors: [], sizes: [] };

  // получаем статистику по фильтрам
  const { data: counts } = useGetFilterCountsQuery(
    { category, filters },
    { skip: !configs } // пропускаем запрос, пока не загрузились конфиги
  );

  // универсальная функция обновления фильтра
  // key - имя поля в сторе (colors, sizes, minPrice и так далее)
  // value - новое значение
  const updateFilter = (
    key: keyof typeof filters,
    value: string[] | number | boolean | undefined
  ) => {
    dispatch(updateFilters({ [key]: value }));
  };

  return (
    <div className={styles.filterPanel} aria-labelledby="filters-title">
      <h2 className={styles.filterPanel__title} id="filters-title">
        Фильтры
      </h2>

      <FilterCheckboxGroup
        legend="Категории товаров"
        options={config.fabrics}
        selected={filters.fabrics}
        onChange={(values) => updateFilter("fabrics", values)}
        counts={counts?.fabrics}
      />

      <FilterCheckboxGroup
        legend="Цвета"
        options={config.colors}
        selected={filters.colors}
        onChange={(values) => updateFilter("colors", values)}
        counts={counts?.colors}
      />

      <FilterCheckboxGroup
        legend="Размеры"
        options={config.sizes}
        selected={filters.sizes}
        onChange={(values) => updateFilter("sizes", values)}
        counts={counts?.sizes}
      />

      <div className={styles.filterPanel__buttons}>
        <button
        className={styles.filterPanel__clear}
        onClick={() => dispatch(clearFilters())}
        type="button"
      >
        Очистить фильтры
      </button>
         <button
        className={styles.filterPanel__apply}
        onClick={() => onApply?.()}
        type="button"
      >
        Применить фильтры
      </button>
      </div>
    </div>
  );
};

export default FilterPanel;
