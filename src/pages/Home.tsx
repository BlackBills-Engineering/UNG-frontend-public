// src/pages/Home.tsx
import React, { useState, useContext } from "react";
import Header from "../components/Header";
import Button from "../components/Buttons";
import Modal from "../components/Modal";
import NozzleIcon from "../ui/NozzleIcon";
import ScrollableCarousel from "../ui/ScrollableCarousel";
import { useTranslation } from "react-i18next";
import { products } from "./Shop";
import { useCart } from "../hooks/useCart";
import { PumpContext } from "../context/PumpContext";

const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const frames = useContext(PumpContext);
  const pumpIds = Object.keys(frames)
    .map((id) => Number(id))
    .sort((a, b) => a - b);

  const lgColsClass = (() => {
    switch (pumpIds.length) {
      case 6:
        return "lg:grid-cols-3";
      case 8:
        return "lg:grid-cols-4";
      case 10:
        return "lg:grid-cols-5";
      default:
        return "lg:grid-cols-3"; // фоллбек
    }
  })();
  // const [pumps, setPumps] = useState<PumpInfo[]>([]);
  const [selectedPump, setSelectedPump] = useState<{
    id: number;
    grade: number;
    price: number;
  } | null>(null);
  const [lastInput, setLastInput] = useState<"volume" | "money" | null>(null);
  const [liters, setLiters] = useState<number>();
  const [total, setTotal] = useState<number>();
  const { addPump } = useCart();

  // Открываем модалку с выбранной ТРК и маркой
  const openModal = (pumpId: number, grade: number, price: number) => {
    setSelectedPump({ id: pumpId, grade, price });
  };

  const closeModal = () => {
    setSelectedPump(null);
    setLiters(undefined);
    setTotal(undefined);
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPump) return closeModal();
    const { id, grade } = selectedPump;
    // карта марки→индекс для API
    const gradeIndexMap: Record<number, number> = {
      80: 0,
      100: 1,
      92: 2,
      95: 3,
    };
    const gradeIndex = gradeIndexMap[grade] ?? grade;
    try {
      if (lastInput === "volume" && liters != null) {
        await fetch(`http://localhost:3000/api/pumps/${id}/preset/volume`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ grade: gradeIndex, volume: liters }),
        });
      } else if (lastInput === "money" && total != null) {
        await fetch(`http://localhost:3000/api/pumps/${id}/preset/money`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ grade: gradeIndex, money_amount: total }),
        });
      }
    } catch (error) {
      console.error("Preset request failed", error);
    }
    closeModal();
    if (selectedPump && liters != null) {
      addPump({
        pumpId: selectedPump.id,
        grade: selectedPump.grade,
        pricePerL: selectedPump.price,
        liters,
        ...(lastInput === "money" ? { totalAmount: total } : {}),
      });
    }
  };
  // console.log(selectedPump);
  
  return (
    <>
      <Header />
      <div className="min-h-screen flex flex-col items-center bg-gray-50 dark:bg-gray-900 p-4">
        <div
          className={`max-w-[1280px] w-full grid md:grid-cols-2 ${lgColsClass} gap-4`}
        >
          {pumpIds.length === 0
            ? // если ещё нет ни одного ID — рисуем skeleton-ы
              Array(6) // если нет ID, то рисуем 6 skeleton-ов
                .fill(0)
                .map((_, idx) => (
                  <div
                    key={idx}
                    className="w-full p-4 border dark:border-gray-700 rounded-xl animate-pulse"
                  >
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 mb-4 rounded w-2/5" />
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 mb-2 rounded w-1/3" />
                    <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                  </div>
                ))
            : // как только WebSocket вернул данные — рисуем настоящие кнопки
              pumpIds.map((pumpId) => {
                const text = t("buttons.trk", { number: pumpId });
                return (
                  <Button
                    key={pumpId}
                    pumpId={pumpId}
                    badgeText={text}
                    unit={t("buttons.unit")}
                    onSelect={(grade, price) => openModal(pumpId, grade, price)}
                  />
                );
              })}
        </div>

        {/* <div className="max-w-[1280px] w-full p-4">
          <PumpDashboard />
        </div> */}

        {/* разделитель */}
        <div className="mt-12 max-w-[1280px] w-full border-b border-gray-200 dark:border-gray-700" />

        {/* Products carousel */}
        <div className="mt-12 max-w-[1280px] w-full">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {t("categories.products")}
          </h2>
          <ScrollableCarousel items={products} />
        </div>

        {/* Модалка с пресетом */}
        <Modal isOpen={!!selectedPump} onClose={closeModal}>
          {selectedPump && (
            <form onSubmit={handleConfirm} className="space-y-4 text-white">
              <h2 className="text-2xl font-bold">
                {t("modal.title", {
                  number: selectedPump.id,
                  grade: selectedPump.grade,
                })}
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex flex-col">
                  {t("modal.liters")}
                  <input
                    type="number"
                    step="any"
                    min={0.1}
                    max={100}
                    value={liters ?? ""}
                    onChange={(e) => {
                      setLastInput("volume");
                      const v = parseFloat(e.target.value);
                      setLiters(v);
                      setTotal(Math.floor(v * selectedPump.price));
                    }}
                    className="mt-1 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  />
                </label>
                <label className="flex flex-col">
                  {t("modal.price")}
                  <input
                    type="number"
                    step="any"
                    value={total ?? ""}
                    onChange={(e) => {
                      setLastInput("money");
                      const v = parseFloat(e.target.value);
                      setTotal(v);
                      setLiters(
                        Math.round((v / selectedPump.price) * 100) / 100
                      );
                    }}
                    className="mt-1 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  />
                </label>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="submit"
                  className="flex items-center px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition"
                >
                  <NozzleIcon
                    width={20}
                    height={20}
                    fill="currentColor"
                    className="mr-2"
                  />
                  {t("modal.confirm")}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-3 bg-white text-gray-900 rounded-xl hover:bg-gray-200 transition"
                >
                  {t("modal.cancel")}
                </button>
              </div>
            </form>
          )}
        </Modal>
      </div>
    </>
  );
};

export default HomePage;
