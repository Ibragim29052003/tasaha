import { useEffect, useRef, useState, type FC } from "react";
import styles from "./Header.module.scss";
import { Link } from "react-router-dom";
import Logo from "@/shared/assets/icons/Logo.svg?react";
import Burger from "@/shared/assets/icons/Burger.svg?react";

type NavItem = {
  link: string;
  text: string;
};

// Внутренний компонент для рендеринга списка навигации
const NavList: FC<{
  items: NavItem[];
  className: string;
  itemClassName: string;
  ref: React.RefObject<HTMLUListElement | null>;
  onItemClick: () => void;
  menuOpen: boolean;
}> = ({ items, className, itemClassName, ref, onItemClick, menuOpen }) => (
  <ul
    className={`${styles.header__list} ${className} ${menuOpen ? styles.header__list_open : ""}`}
    ref={ref}
    role="menu"
    aria-hidden={!menuOpen}
  >
    {items.map((item, index) => (
      <li key={index} className={`${styles.header__item} ${itemClassName}`} role="none">
        <Link
          to={item.link}
          className={styles.header__link}
          onClick={onItemClick}
          role="menuitem"
        >
          {item.text}
        </Link>
      </li>
    ))}
  </ul>
);

const Header: FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const categoriesRef = useRef<HTMLUListElement>(null);
  const servicesRef = useRef<HTMLUListElement>(null);

  const categories: NavItem[] = [
    { link: "/contact", text: "Мужчинам" },
    { link: "/contact", text: "Женщинам" },
    { link: "/contact", text: "Детям" },
  ];

  const servicesNavigation: NavItem[] = [
    { link: "/", text: "Главная" },
    { link: "/about", text: "О нас" },
  ];

  useEffect(() => {
    if (!menuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        burgerRef.current &&
        !burgerRef.current.contains(event.target as Node) &&
        categoriesRef.current &&
        !categoriesRef.current.contains(event.target as Node) &&
        servicesRef.current &&
        !servicesRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        burgerRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    // выполнится при размонтировании компонента или изменении menuOpen
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  useEffect(() => {
    if (menuOpen && categoriesRef.current) {
      const firstLink = categoriesRef.current.querySelector("a");
      firstLink?.focus();
    }
  }, [menuOpen]);

  return (
    <header className={styles.header}>
      <nav className={styles.header__nav} role="navigation" aria-label="Основная навигация">
        <Link to="/" aria-label="Вернуться на главную страницу">
          <Logo className={styles.header__logo} />
        </Link>
        <button
          className={styles.header__burger}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
          aria-expanded={menuOpen}
          ref={burgerRef}
        >
          <Burger />
        </button>

        <NavList
          items={categories}
          className={styles.header__list_categories}
          itemClassName={styles.header__item_categories}
          ref={categoriesRef}
          onItemClick={() => setMenuOpen(false)}
          menuOpen={menuOpen}
        />
        <NavList
          items={servicesNavigation}
          className={styles.header__list_services}
          itemClassName={styles.header__item_services}
          ref={servicesRef}
          onItemClick={() => setMenuOpen(false)}
          menuOpen={menuOpen}
        />
      </nav>
    </header>
  );
};

export default Header;
