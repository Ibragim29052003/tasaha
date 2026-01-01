import { useEffect, useRef, useState, type FC } from "react";
import styles from "./Header.module.scss";
import { Link, NavLink, useLocation } from "react-router-dom";
// import Logo from './Logo.svg?react';
import Arrow from "../../shared/assets/icons/header/arrow-down.svg?react";


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
  pathname: string;
  isCategory: boolean;
  lineStyle?: React.CSSProperties;
}> = ({
  items,
  className,
  itemClassName,
  ref,
  onItemClick,
  menuOpen,
  pathname,
  isCategory,
  lineStyle,
}) => (
  <ul
    className={`${styles.header__list} ${className} ${
      menuOpen ? styles.header__list_open : ""
    }`}
    ref={ref}
    role="menu"
    aria-hidden={!menuOpen}
  >
    {items.map((item, index) => {
      let isActive = false;
      if (isCategory) {
        isActive = pathname === item.link;
      } else {
        if (item.link === "/women") {
          isActive = ["/women", "/men", "/children"].includes(pathname);
        } else if (item.link === "/about") {
          isActive = pathname === "/about";
        }
      }
      return (
        <li
          key={index}
          className={`${styles.header__item} ${itemClassName}`}
          role="none"
        >
          <NavLink
            to={item.link}
            className={`${styles.header__link} ${
              isActive ? styles.header__link_active : ""
            }`}
            onClick={onItemClick}
            role="menuitem"
          >
            {item.text}
          </NavLink>
        </li>
      );
    })}
    {lineStyle && <div className={styles.header__line} style={lineStyle}></div>}
  </ul>
);

const Header: FC = () => {
  const [menuOpen, setMenuOpen] = useState(false); // контролирует, открыто ли мобильное меню
  const [categoriesExpanded, setCategoriesExpanded] = useState(false); // контролирует, развернуты ли категории в мобильном меню
  const [lineStyle, setLineStyle] = useState({ 
    transform: "translateX(0px)",
    width: "0px",
  });
  const burgerRef = useRef<HTMLButtonElement>(null);
  const categoriesRef = useRef<HTMLUListElement>(null);
  const servicesRef = useRef<HTMLUListElement>(null);
  const mobileCategoriesRef = useRef<HTMLUListElement>(null);
  const { pathname } = useLocation();

  const categories: NavItem[] = [
    { link: "/women", text: "Женщинам" },
    { link: "/men", text: "Мужчинам" },
    { link: "/children", text: "Детям" },
  ];

  useEffect(() => {
    if (menuOpen) {
      document.body.classList.add("menu-open");
    } else {
      document.body.classList.remove("menu-open");
    }

    return () => {
      document.body.classList.remove("menu-open");
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        burgerRef.current &&
        !burgerRef.current.contains(event.target as Node) &&
        categoriesRef.current &&
        !categoriesRef.current.contains(event.target as Node) &&
        servicesRef.current &&
        !servicesRef.current.contains(event.target as Node) &&
        mobileCategoriesRef.current &&
        !mobileCategoriesRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
        setCategoriesExpanded(false);
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

  const updateLinePosition = () => {
    if (categoriesRef.current && window.innerWidth > 768) {
      const activeLink = categoriesRef.current.querySelector(
        `.${styles.header__link_active}`
      ) as HTMLElement;
      if (activeLink) {
        const rect = activeLink.getBoundingClientRect();
        const listRect = categoriesRef.current.getBoundingClientRect();
        const left = rect.left - listRect.left;
        const width = rect.width;
        setLineStyle({
          transform: `translateX(${left}px)`,
          width: `${width}px`,
        });
      } else {
        setLineStyle({
          transform: "translateX(0px)",
          width: "0px",
        });
      }
    }
  };

  useEffect(() => {
    updateLinePosition();
  }, [pathname]);

  useEffect(() => {
    const handleResize = () => updateLinePosition();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <header className={styles.header}>
      <nav
        className={`${styles.header__nav} container`}
        role="navigation"
        aria-label="Основная навигация"
      >
        <Link
          to="/women"
          aria-label="Вернуться на главную страницу"
          className={styles.header__logo_link}
        >
          <p className={styles.header__logo_text}>TaSaHa</p>
        </Link>
        <button
          className={`${styles.header__burger} ${
            menuOpen ? styles.header__burger_active : ""
          }`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
          aria-expanded={menuOpen}
          ref={burgerRef}
        >
          <span className={styles.header__burger_lines}></span>
          <span className={styles.header__burger_lines}></span>
          <span className={styles.header__burger_lines}></span>
        </button>

        <NavList
          items={categories}
          className={styles.header__list_categories}
          itemClassName={styles.header__item_categories}
          ref={categoriesRef}
          onItemClick={() => setMenuOpen(false)}
          menuOpen={menuOpen}
          pathname={pathname}
          isCategory={true}
          lineStyle={lineStyle}
        />
        <ul
          className={`${styles.header__list} ${styles.header__list_services} ${
            menuOpen ? styles.header__list_open : ""
          }`}
          ref={servicesRef}
          role="menu"
          aria-hidden={!menuOpen}
        >
          <li
            className={`${styles.header__item} ${styles.header__item_services}`}
            role="none"
          >
            {menuOpen ? (
              <button
                className={`${styles.header__link} ${
                  styles.header__link_expandable
                } ${categoriesExpanded ? styles.header__link_expanded : ""} ${
                  ["/women", "/men", "/children"].includes(pathname) ? styles.header__link_active : ""
                }`}
                onClick={() => setCategoriesExpanded(!categoriesExpanded)}
                aria-expanded={categoriesExpanded}
              >
                <p className={styles.header__arrow_text}>Главная</p>
                <Arrow className={`${styles.header__arrow_down} ${categoriesExpanded ? styles.header__arrow_down_expanded : ""}`}/>
              </button>
            ) : (
              <NavLink
                to="/women"
                className={`${styles.header__link} ${
                  ["/women", "/men", "/children"].includes(pathname) ? styles.header__link_active : ""
                }`}
                onClick={() => setMenuOpen(false)}
                role="menuitem"
              >
                Главная
              </NavLink>
            )}
            {menuOpen && (
              <NavList
                items={categories}
                className={`${styles.header__list_categories_mobile} ${
                  categoriesExpanded
                    ? styles.header__list_categories_mobile_open
                    : ""
                }`}
                itemClassName={styles.header__item_categories_mobile}
                ref={mobileCategoriesRef}
                onItemClick={() => {
                  setMenuOpen(false);
                  setCategoriesExpanded(false);
                }}
                menuOpen={true}
                pathname={pathname}
                isCategory={true}
              />
            )}
          </li>
          <li
            className={`${styles.header__item} ${styles.header__item_services}`}
            role="none"
          >
            <NavLink
              to="/about"
              className={`${styles.header__link} ${
                pathname === "/about" ? styles.header__link_active : ""
              }`}
              onClick={() => setMenuOpen(false)}
              role="menuitem"
            >
              О нас
            </NavLink>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
