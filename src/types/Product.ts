

// src/types/Product.ts

/** 
 * Represents a single product in the shop 
 */
export interface Product {
  /** Unique identifier */
  id: number;
  /** Category name, e.g. "Напитки" */
  category: string;
  /** Product display name */
  nameKey: string;
  /** Price in сум */
  price: number;
  /** URL or path to the product image */
  imageUrl: string;
}