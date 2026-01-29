import { useAppDispatch, useAppSelector } from "@/redux/store";
import styles from "./FilterPanel.module.scss";
import { selectFilters } from "@/redux/filter/selectors";
import { updateFilters, clearFilters } from "@/redux/filter/slice";
import FilterCheckboxGroup from "./FilterCheckboxGroup/FilterCheckboxGroup";
import { useGetFilterConfigsQuery } from "@/sanity/productsApi";

// category определяет, какие именно фильтры будут показаны
interface FilterPanelProps {
  category: "women" | "men" | "children";
}

const FilterPanel = ({ category }: FilterPanelProps) => {
  const dispatch = useAppDispatch(); // для обновления состояния фильтров

  // получаем данные из редакса
  const filters = useAppSelector(selectFilters);

  // получаем конфиги фильтров из Sanity
  const { data: configs } = useGetFilterConfigsQuery();

  // получаем конфиг для текущей категории, или пустой объект если нет данных
  const config = configs?.[category] || { fabrics: [], colors: [], sizes: [] };

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
        name="fabric"
        onChange={(values) => updateFilter("fabrics", values)}
      />

      <FilterCheckboxGroup
        legend="Цвета"
        options={config.colors}
        selected={filters.colors}
        name="color"
        onChange={(values) => updateFilter("colors", values)}
      />

      <FilterCheckboxGroup
        legend="Размеры"
        options={config.sizes}
        selected={filters.sizes}
        name="size"
        onChange={(values) => updateFilter("sizes", values)}
      />

      <button
        className={styles.filterPanel__clear}
        onClick={() => dispatch(clearFilters())}
        type="button"
      >
        Очистить фильтры
      </button>
    </div>
  );
};

export default FilterPanel;
