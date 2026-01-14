import { useEffect, useRef, useState, type FC } from "react";
import styles from "./Header.module.scss";
import Arrow from "@/shared/assets/icons/header/arrow-down.svg?react";
import Search from "@/shared/assets/icons/header/search.svg?react";
import TransitionWB from "@/shared/assets/icons/header/transition-wb.svg?react";
import Logo from "@/shared/assets/icons/Logo.svg?react";
import { Link } from "react-router-dom";
import DropdownMenu from "./DropdownMenu";

const Header: FC = () => {
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);

  const listRef = useRef<HTMLUListElement>(null);
  const divRef = useRef<HTMLDivElement>(null);

  type NavItem = {
    link: string;
    text: string;
  };

  const categories: NavItem[] = [
    { link: "/women", text: "Женщинам" },
    { link: "/men", text: "Мужчинам" },
    { link: "/children", text: "Детям" },
  ];

  const navItems: NavItem[] = [
    { link: "/", text: "Главная" },
    { link: "/about", text: "О нас" },
  ];

  useEffect(() => {
    if (!isCategoriesOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsCategoriesOpen(false);
      }
    };
    const handleClickOutside = (event: MouseEvent) => {
      if (
        listRef.current &&
        !listRef.current.contains(event.target as Node) && // если был клик вне списка
        divRef.current &&
        !divRef.current.contains(event.target as Node) // если был клик вне кнопки
      ) {
        setIsCategoriesOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside); // слушаем клики по всему документу
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside); // функция очистки, выполнится при размонтировании или изменении isCategoriesOpen
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isCategoriesOpen]);

  useEffect(() => {
    if (isCategoriesOpen) {
      // когда dropdown открывается, фокусируемся на первой категории
      const firstLink = listRef.current?.querySelector(
        "a"
      ) as HTMLAnchorElement;
      if (firstLink) {
        firstLink.focus();
      }
    }
  }, [isCategoriesOpen]);

  return (
    <header className={`${styles.header} container`}>
      <nav className={styles.header__nav}  role="navigation">
        <div className={styles.header__logo_wrapper}>
          <Link to="/" aria-label="Вернуться на главную страницу">
            <Logo className={styles.header__logo_logo} />
            <p className={styles.header__logo_text}>TaSaHa</p>
          </Link>
        </div>
        <ul className={styles.header__list}>
          {navItems.map((item, index) => (
            <li key={index} className={styles.header__list_item}>
              <Link
                to={item.link}
                className={styles.header__list_link}
                aria-label={`Перейти к странице ${item.text}`}
                onClick={(e) => {
                  if (item.text === "Главная") e.preventDefault();
                }} // для предотвращения навигации при toggle
              >
                {item.text === "Главная" ? (
                  <div
                    className={styles.header__expandable_wrapper}
                    ref={divRef}
                  >
                    <button
                      className={styles.header__expandable}
                      onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                      aria-expanded={isCategoriesOpen}
                      aria-controls="categories-list"
                      aria-haspopup="menu" // указывает, что кнопка открывает меню
                    >
                      {item.text}
                      <Arrow
                        className={`${styles.header__expandable_icon} ${
                          isCategoriesOpen
                            ? styles.header__expandable_icon_open
                            : ""
                        } `}
                      />
                    </button>
                    <DropdownMenu ref={listRef} isOpen={isCategoriesOpen} categories={categories}/>
                  </div>
                ) : (
                  item.text
                )}
              </Link>
            </li>
          ))}
        </ul>
        <div className={styles.header__wb_search_wrapper}>
          <Search
            className={styles.header__search}
            aria-label="Иконка поиска"
          />
          <a
            href="https://www.wildberries.ru/brands/310895408-tasaha"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.header__wb}
          >
            <TransitionWB
              className={styles.header__wb_icon}
              aria-label="Иконка перехода на Wildberries"
            />
            <p className={styles.header__wb_text}>Перейти на WB</p>
          </a>
        </div>
      </nav>
    </header>
  );
};

export default Header;
