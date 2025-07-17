
export interface FuelOption {
  grade: number; // 80, 92, 95, 100 и т.д.
  price: number; // числовая цена за литр
}

export interface Pump {
  id: number; // 1, 2, 3...
  badgeColor: "blue" | "green" | "yellow" | "red";
  iconType: "nozzle" | "pump";
  options: FuelOption[]; // все варианты топлива на этой ТРК
}
