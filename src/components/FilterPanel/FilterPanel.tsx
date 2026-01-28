import { useAppDispatch, useAppSelector } from "@/redux/store";
import styles from "./FilterPanel.module.scss";
import { selectFilters } from "@/redux/filter/selectors";
import { updateFilters } from "@/redux/filter/slice";
import FilterCheckboxGroup from "./FilterCheckboxGroup/FilterCheckboxGroup";

const FILTER_CONFIGS = {
  women: {
    fabrics: [
      "платья",
      "костюмы",
      "блузки",
      "юбки",
      "платье-халат",
      "платье со штанами",
    ] as const,
    colors: ["красный", "розовый", "черный", "белый", "синий", "бежевый"] as const,
    sizes: ["XS", "S", "M", "L", "XL", "42", "44", "46", "48"] as const,
  },
  men: {
    fabrics: ["рубашки", "брюки", "костюмы", "пиджаки", "джинсы", "поло"] as const,
    colors: ["синий", "серый", "черный", "белый", "коричневый", "зеленый"] as const,
    sizes: ["S", "M", "L", "XL", "48", "50", "52", "54"] as const,
  },
  children: {
    fabrics: ["платья", "шорты", "футболки", "джинсы", "пижамы", "комбинезоны"] as const,
    colors: [
      "розовый",
      "голубой",
      "желтый",
      "зеленый",
      "красный",
      "фиолетовый",
    ] as const,
    sizes: ["98", "104", "110", "116", "122", "128", "134"] as const,
  },
} as const;

// category определяет, какие именно фильтры будут показаны
interface FilterPanelProps {
  category: "women" | "men" | "children";
}

const FilterPanel = ({ category }: FilterPanelProps) => {
  const dispatch = useAppDispatch(); // для обновления состояния фильтров

  // получаем данные из редакса
  const filters = useAppSelector(selectFilters);

  const config = FILTER_CONFIGS[category];

  // универсальная функция обновления фильтра
  // key - имя поля в сторе (colors, sizes, minPrice и так далее)
  // value - новое значение
  const updateFilter = (key: keyof typeof filters, value: string[] | number | boolean | undefined) => {
    dispatch(updateFilters({ [key]: value, category }));
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
    </div>
  );
};

export default FilterPanel;
