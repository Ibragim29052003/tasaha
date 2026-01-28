import styles from "./FilterCheckboxGroup.module.scss";

interface FilterCheckboxGroupProps<T extends string> {
  legend: string; // заголовок группы
  options: readonly T[]; // все возможные варианты
  selected: T[]; // выбранные значения
  onChange: (values: T[]) => void; // колбэк при изменении
  name: string; // для генерации уникальных id
}

const FilterCheckboxGroup = <T extends string>({
  legend,
  options,
  selected,
  onChange,
  name,
}: FilterCheckboxGroupProps<T>) => {

  // если значение есть — удаляем, если значения нет — добавляем (такая логика типична для чекбоксов)
  const toggleValue = (value: T) => {
    return selected.includes(value)
      ? // filter для иммутабельного изменения, то есть наша функция всегда возвращает новый массив не изменяя исходный
        selected.filter((item) => item !== value)
      : [...selected, value];
  };

  return (
        <fieldset className={styles.filterCheckbox__group}>
            <legend className={styles.filterCheckbox__legend}>{legend}</legend>
            <ul className={styles.filterCheckbox__list}>
              {options.map((option) => {
                const inputId = `${name}-${option}`;
    
                return (
                  <li className={styles.filterCheckbox__item} key={option}>
                    <input
                      type="checkbox"
                      id={inputId}
                      checked={selected.includes(option)} // чекбокс отмечен если категория есть в редаксе
                      onChange={() => { onChange(toggleValue(option))}}
                      className={styles.filterCheckbox__checkbox}
                    />
                    <label htmlFor={inputId} className={styles.filterCheckbox__label}>
                      {option}
                    </label>
                  </li>
                );
              })}
            </ul>
          </fieldset>
  )
};

export default FilterCheckboxGroup;
