// src/types/Cart.ts
export interface CartProduct {
  id: number; // id товара
  name: string; // название
  unitPrice: number; // цена за единицу
  quantity: number; // сколько штук в корзине
}

export interface CartPump {
  uuid: string;
  pumpId: number; // номер ТРК
  grade: number; // выбранная марка АИ-80/92/…
  pricePerL: number; // цена за литр
  liters: number; // сколько литров в корзине
  totalAmount?: number;
}
