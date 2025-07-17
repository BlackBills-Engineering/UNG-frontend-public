// src/components/FuelSelector.tsx
import React from "react";
import type { FuelOption } from "../types/Pump";
import { useTranslation } from "react-i18next";

interface FuelSelectorProps {
  options: FuelOption[];
  selectedGrade: number;
  unit?: string; // optional, default is "сум/литр"
  dispensing?: boolean; // optional, to disable selection during dispensing
  onChange: (grade: number) => void;
}

const FuelSelector: React.FC<FuelSelectorProps> = ({
  options,
  selectedGrade,
  unit = "сум/литр",
  dispensing,
  onChange,
}) => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-2 gap-4">
      {options.map(({ grade, price }) => (
        <label
          key={grade}
          onClick={() => onChange(grade)}
          className={`cursor-pointer p-3 border rounded-lg  transition ${
            selectedGrade === grade
              ? "border-blue-500 dark:text-gray-200 bg-blue-50 dark:bg-blue-500/30"
              : "border-gray-200 hover:border-gray-400 hover:dark:border-blue-500 dark:text-gray-200 dark:border-gray-700"
          }${
              dispensing ? " pointer-events-none opacity-30 dark:opacity-50" : ""
          }`}
        >
          <input
            type="radio"
            name="fuelGrade"
            value={grade}
            checked={selectedGrade === grade}
            onChange={() => onChange(grade)}
            className="sr-only"
          />
          <div className="font-medium">
            {t("buttons.fuelType", { grade: grade })}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {price.toLocaleString()} {unit}
          </div>
        </label>
      ))}
    </div>
  );
};

export default FuelSelector;
