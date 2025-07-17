// src/components/ProductCard.tsx
import React, { useState } from "react";
import fallback from "../assets/fallback.png";
import { useTranslation } from "react-i18next";
import type { Product } from "@/types/Product";


interface ProductCardProps {
  product: Product;
  onSelect?: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const { t } = useTranslation();

  const [imgSrc, setImgSrc] = useState<string>(product.imageUrl || fallback);
  return (
    <div
      className="bg-white dark:bg-gray-800 
      border border-gray-200 dark:border-gray-700 
      rounded-lg p-4 flex flex-col items-center cursor-pointer 
      hover:shadow-xl 
      dark:hover:shadow-[0_20px_25px_-5px_rgba(255,255,255,0.2)] 
      transition-shadow"
      onClick={() => onSelect && onSelect(product)}
    >
      <img
        src={imgSrc}
        alt={t(product.nameKey)}
        className="h-64 w-full object-cover rounded-md mb-4"
        onError={() => setImgSrc(fallback)}
      />
      <p className="text-lg text-nowrap font-medium text-gray-900 dark:text-gray-100 mb-2">
        {t(product.nameKey)}
      </p>
      <p className="text-blue-600 font-semibold">
        {product.price.toLocaleString()} {t("common.soums")}
      </p>
    </div>
  );
};

export default ProductCard;
