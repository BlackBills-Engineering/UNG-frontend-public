// src/components/Buttons.tsx
import React, { useContext, useState } from "react";
import NozzleIcon from "../ui/NozzleIcon";
import PumpIcon from "../ui/PumpIcon";
import FuelSelector from "./FuelSelector";
import type { FuelOption } from "../types/Pump";
import { PumpContext, type PumpFrame } from "../context/PumpContext";
import { useTranslation } from "react-i18next";

export interface ButtonProps {
  pumpId: number;
  badgeText: string;
  unit?: string;
  /** вызывается при выборе марки, чтобы открыть модалку */
  onSelect?: (grade: number, price: number) => void;
  className?: string;
}

// Мапа: индекс в WS → реальная марка
const gradeMap: Record<number, number> = {
  0: 80,
  1: 100,
  2: 92,
  3: 95,
};
// Цены за литр по реальным маркам
const priceMap: Record<number, number> = {
  80: 8150,
  100: 15200,
  92: 10700,
  95: 12800,
};
// Статус → цвет бейджа
const statusBadgeMap: Record<string, "blue" | "yellow" | "green" | "red"> = {
  IDLE: "blue",
  CALLING: "yellow",
  AUTHORIZED: "yellow",
  DISPENSING: "green",
  COMPLETE: "green",
  STOPPED: "red",
  ERROR: "red",
};
// Tailwind-классы для цветов
const colorMap = {
  blue: { bg: "bg-blue-500/10", text: "text-[#03A3DF]" },
  yellow: { bg: "bg-yellow-500/10", text: "text-[#F69B4C]" },
  green: { bg: "bg-green-500/10", text: "text-[#39A885]" },
  red: { bg: "bg-red-500/10", text: "text-[#FF5C5C]" },
  gray: { bg: "bg-gray-200/10", text: "text-gray-800 dark:text-gray-400" },
} as const;

const Buttons: React.FC<ButtonProps> = ({
  pumpId,
  badgeText,
  unit = "сум/литр",
  onSelect,
  className = "",
}) => {
  const { t } = useTranslation();

  const frames = useContext(PumpContext);
  const frame: PumpFrame | undefined = frames[pumpId];

  const badgeColor = frame ? statusBadgeMap[frame.status] : "gray";
  const Icon = frame?.status === "DISPENSING" ? NozzleIcon : PumpIcon;
  const { bg, text } = colorMap[badgeColor] ?? colorMap.gray;

  // Собираем static options для FuelSelector
  const options: FuelOption[] = Object.entries(gradeMap)
    .map(([idx, realGrade]) => ({
      grade: realGrade,
      price: priceMap[realGrade],
      idx: Number(idx),
    }))
    .sort((a, b) => a.idx - b.idx)
    .map(({ grade, price }) => ({ grade, price }));

  const [selectedGrade, setSelectedGrade] = useState(options[0].grade);

  // Когда пользователь выбирает марку — сохраняем и вызываем onSelect
  const handleChange = (grade: number) => {
    setSelectedGrade(grade);
    onSelect?.(grade, priceMap[grade]);
  };

  // Выбираем, что показывать: realtime / transaction / last_transaction
  let metrics: { volume: number; total_amount: number; grade: number } | null =
    null;
  let title = "";

  // Выбираем, что показывать: realtime / transaction / last_transaction
  if (frame) {
    if (frame.status === "DISPENSING" && frame.realtime) {
      metrics = frame.realtime;
      title = t("pumpTransaction.real_time");
    } else if (frame.transaction) {
      metrics = frame.transaction;
      title = t("pumpTransaction.transaction");
    } 
  }
  // if (frame) {
  //   if (frame.status === "DISPENSING" && frame.realtime) {
  //     metrics = frame.realtime;
  //     title = t("pumpTransaction.real_time");
  //   } else if (frame.status === "COMPLETE" && frame.transaction) {
  //     metrics = frame.transaction;
  //     title = t("pumpTransaction.transaction");
  //   } else if (frame.last_transaction) {
  //     // показываем последнюю транзакцию для всех остальных статусов
  //     metrics = frame.last_transaction;
  //     title = t("pumpTransaction.last_transaction");
  //   }
  // }
// console.log(frame)
  return (
    <div className={`relative ${className}`}>
      <div
        className={`w-full bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl p-4 hover:shadow-lg transition ${
          frame.status === "DISPENSING" ? "pb-2" : "pb-6"
        }`}
      >
        {/* Заголовок с бейджем и текстовым статусом */}
        <div className="flex items-center justify-between mb-4">
          <span
            className={`inline-flex items-center px-2 py-1 ${bg} ${text} rounded-lg text-sm font-medium`}
          >
            <Icon width={18} height={18} fill="currentColor" className="mr-1" />
            {badgeText}
          </span>
          <span
            className={`px-2 py-1 ${bg} ${text} rounded-lg text-xs font-medium`}
          >
            {frame ? t(`status.${frame.status}`) : "—"}
          </span>
        </div>

        {/* Селектор марок */}
        <FuelSelector
          options={options}
          selectedGrade={selectedGrade}
          unit={unit}
          dispensing={frame?.status === "DISPENSING"}
          onChange={handleChange}
        />

        {/* Динамические метрики */}
        {metrics ? (
          <div className="mt-4 border-t pt-2 text-sm text-gray-900 dark:border-gray-700 dark:text-gray-200">
            <div className="flex w-full justify-between font-bold text-lg">
              {title}
              <p className="mr-2 font-medium">
                {t("pumpTransaction.grade")}{" "}
                <span className={`font-semibold ${text}`}>
                  {gradeMap[metrics.grade] ?? metrics.grade}
                </span>
              </p>
            </div>
            <div className="flex flex-col space-y-2 border dark:border-gray-700 rounded-lg p-4">
              <p className="w-full flex justify-between dark:border-gray-500 border-b pb-2">
                {t("pumpTransaction.liters")}{" "}
                <span className="font-semibold">
                  {metrics.volume.toFixed(2)}
                </span>
              </p>
              <p className="w-full flex justify-between">
                {t("pumpTransaction.sum")}{" "}
                <span className="font-semibold">
                  {metrics.total_amount.toLocaleString()}
                </span>
              </p>
            </div>

            {frame.status === "DISPENSING" && (
              <progress
                value={metrics.volume}
                max={50}
                className="w-full h-2"
              />
            )}
          </div>
        ) : (
          <div className="mt-4 border-t pt-2 text-sm text-gray-900 dark:border-gray-700 dark:text-gray-200 space-y-1">
            <div className="flex w-full justify-between font-bold text-lg">
              {t("pumpTransaction.transaction")}
              <p className="mr-2 font-medium">
                <span className={`font-semibold ${text}`}>00</span>
              </p>
            </div>
            <div className="flex flex-col space-y-2 border dark:border-gray-700 rounded-lg p-4 ">
              <p className="w-full flex justify-between dark:border-gray-500 border-b pb-2">
                {t("pumpTransaction.liters")}{" "}
                <span className="font-semibold">---</span>
              </p>
              <p className="w-full flex justify-between">
                {t("pumpTransaction.sum")}
                <span className="font-semibold">---</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Buttons;
