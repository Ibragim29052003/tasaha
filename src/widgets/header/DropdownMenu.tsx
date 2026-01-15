import { forwardRef } from "react";
import styles from "./Header.module.scss";
import { Link } from "react-router-dom";

type NavItem = {
  link?: string;
  text: string;
};

interface DropdownMenuProps {
  isOpen: boolean;
  categories: NavItem[];
  //   listRef: RefObject<HTMLUListElement>; // RefObject - пишется когда мы принимаем реф в пропсы
  onClose: () => void
}

// forwardRef - позволяет родительскому компоненту передать ref этому компоненту
// первый параметр - тип рефа (HTMLUListElement (тип элемента, на который ссылается ref) ),
// второй - тип пропсов (DropdownMenuProps)
const DropdownMenu = forwardRef<HTMLUListElement, DropdownMenuProps>(
  // деструктурируем пропсы, listRef - второй параметр forwardRef, который приходит от родителя
  ({ isOpen, categories, onClose }, listRef) => {
    // если dropdown закрыт, не рендерим ничего
    if (!isOpen) return null;

    return (
      <ul
        className={styles.header__categories_list}
        ref={listRef}
        id="categories-list"
      >
        {categories.map((category, categoryIndex) => (
          <li key={categoryIndex} className={styles.header__categories_item} >
            <Link
              to={category.link || '#'}
              className={styles.header__categories_link}
              aria-label={`Перейти к странице ${category.text}`}
              onClick={onClose}
            >
              {category.text}
            </Link>
          </li>
        ))}
      </ul>
    );
  }
);

export default DropdownMenu;
