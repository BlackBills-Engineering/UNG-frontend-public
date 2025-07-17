import React, { useState } from "react";
import ScrollableCarousel from "../ui/ScrollableCarousel";
import type { Product } from "../types/Product";
import Header from "../components/Header";
import { useTranslation } from "react-i18next";

export const products: Product[] = [
  {
    id: 1,
    category: "fruits",
    nameKey: "products.oranges",
    price: 12000,
    imageUrl: new URL("../assets/oranges.png", import.meta.url).href,
  },
  {
    id: 2,
    category: "drinks",
    nameKey: "products.milk",
    price: 23000,
    imageUrl: new URL("../assets/milk.png", import.meta.url).href,
  },
  {
    id: 3,
    category: "fruits",
    nameKey: "products.apples",
    price: 8000,
    imageUrl: new URL("../assets/apple.png", import.meta.url).href,
  },
  {
    id: 4,
    category: "fruits",
    nameKey: "products.bananas",
    price: 15000,
    imageUrl: new URL("../assets/banana.png", import.meta.url).href,
  },
  {
    id: 5,
    category: "drinks",
    nameKey: "products.coffee",
    price: 18000,
    imageUrl: new URL("../assets/coffee.png", import.meta.url).href,
  },
  {
    id: 6,
    category: "snacks",
    nameKey: "products.chips",
    price: 12000,
    imageUrl: new URL("../assets/chips.png", import.meta.url).href,
  },
  {
    id: 7,
    category: "snacks",
    nameKey: "products.chocolate",
    price: 8000,
    imageUrl: new URL("../assets/chockolate.png", import.meta.url).href,
  },
  {
    id: 8,
    category: "snacks",
    nameKey: "products.nuts",
    price: 15000,
    imageUrl: new URL("../assets/nut.png", import.meta.url).href,
  },
  {
    id: 9,
    category: "snacks",
    nameKey: "products.kurt",
    price: 15000,
    imageUrl: "",
  },
];

const categories = ["fruits", "drinks", "snacks"];

const Shop: React.FC = () => {
  const { t } = useTranslation();

  const [searchTerm, setSearchTerm] = useState("");
  const normalized = searchTerm.trim().toLowerCase();
  // Filter products by name or price substring
  const filteredProducts = products.filter((p) => {
    const nameMatch = t(p.nameKey).toLowerCase().includes(normalized);
    const priceMatch = p.price.toString().includes(normalized);
    return normalized === "" || nameMatch || priceMatch;
  });
  const hasSearch = normalized !== "";

  return (
    <>
      <Header
        search={true}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
      />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-[1280px] mx-auto">
          {/* <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Магазин
          </h1> */}

          {hasSearch ? (
            filteredProducts.length > 0 ? (
              <div className="">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Результаты поиска
                </h2>
                <ScrollableCarousel items={filteredProducts} />
              </div>
            ) : (
              <div className="mt-8 flex justify-center text-gray-900 dark:text-gray-100">
                Ничего не найдено
              </div>
            )
          ) : (
            categories.map((cat) => (
              <div key={cat} className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  {t(`categories.${cat}`)}
                </h2>
                <ScrollableCarousel
                  items={products.filter((p) => p.category === cat)}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default Shop;
