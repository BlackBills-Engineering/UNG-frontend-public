import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";
import { ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { CartSheet } from "./CartSheet";

const navItems = [
  { key: "header.home", path: "/home" },
  { key: "header.shop", path: "/shop" },
];

interface HeaderProps {
  search?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
}

const Header: React.FC<HeaderProps> = ({
  search = false,
  searchValue = "",
  onSearchChange = () => {},
}) => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("appLang");
    if (saved && saved !== i18n.language) {
      i18n.changeLanguage(saved);
    }
  }, [i18n]);

  const switchLang = (lng: "ru" | "uz") => {
    i18n.changeLanguage(lng);
    localStorage.setItem("appLang", lng);
    setLangOpen(false);
  };

  const controls = (
    <div className="flex items-center w-full space-x-4">
      {search && (
        <input
          type="text"
          placeholder={t("header.searchPlaceholder")}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="px-3 py-1 border rounded-md text-sm w-full md:w-48 focus:outline-none focus:ring focus:border-blue-300 dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 dark:text-gray-100"
        />
      )}
      <div className="relative">
        <button
          type="button"
          className="flex items-center px-2 py-1 text-gray-900 dark:text-gray-200 text-sm border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 focus:outline-none"
          onClick={() => setLangOpen((v) => !v)}
        >
          {i18n.language.toUpperCase()}
          <ChevronDown
            className={`ml-1 h-4 w-4 transition-transform duration-200 ${
              langOpen ? "rotate-180" : ""
            }`}
          />
        </button>
        {langOpen && (
          <ul className="absolute right-0 mt-2 w-20 rounded-md shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 z-20">
            <li>
              <button
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-200"
                onClick={() => switchLang("ru")}
              >
                RU
              </button>
            </li>
            <li>
              <button
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-200"
                onClick={() => switchLang("uz")}
              >
                UZ
              </button>
            </li>
          </ul>
        )}
      </div>
      <CartSheet />
      <ThemeToggle />
    </div>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3">
      <div className="flex flex-col text-nowrap md:flex-row md:items-center justify-between w-full">
        <div className="flex items-center justify-between w-full md:w-auto">
          <Link to="/" className="text-2xl font-bold md:mr-4 text-gray-800 dark:text-gray-100">
            CARVON
          </Link>
          <nav className="flex space-x-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-1 rounded-md text-sm font-medium transition ${
                  location.pathname === item.path
                    ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                {t(item.key)}
              </Link>
            ))}
          </nav>
          <button
            className="md:hidden flex items-center"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <ChevronDown className="h-5 w-5 text-gray-800 dark:text-gray-100 transform transition-transform duration-200"
                         style={{ transform: isMenuOpen ? "rotate(180deg)" : "rotate(0deg)" }} />
          </button>
        </div>
        {/* Desktop controls */}
        <div className="hidden md:flex md:ml-4">{controls}</div>
        {/* Mobile dropdown */}
        {isMenuOpen && (
          <div className="md:hidden mt-2 space-y-2">{controls}</div>
        )}
      </div>
    </header>
  );
};

export default Header;
