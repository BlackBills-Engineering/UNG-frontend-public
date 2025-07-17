import React, { useEffect, useState } from "react";
import classNames from "classnames";
import CashIcon from "../ui/CashIcon"; // Иконка для наличных
import CardIcon from "../ui/CardIcon"; // Иконка для карты
import ClickIcon from "../ui/ClickIcon"; // Иконка для Click
import UzumIcon from "../ui/UzumIcon"; // Иконка для Uzum
import PaymeIcon from "../ui/PaymeIcon"; // Иконка для Payme
import { PaymentTypes } from "../enums/payment.types.enum";
import type { PaymentInfo } from "@/types/paymentInfo";
import { useTranslation } from "react-i18next";

interface Props {
  totalAmount: number; // общий счёт
  onChange: (info: PaymentInfo[]) => void;
}

const PaymentMethodSelector: React.FC<Props> = ({ totalAmount, onChange }) => {
  const { t } = useTranslation();

  const [selected, setSelected] = useState<PaymentTypes[]>([]);
  const [amounts, setAmounts] = useState<Partial<Record<PaymentTypes, number>>>(
    {}
  );
  const [lastChanged, setLastChanged] = useState<PaymentTypes | null>(null);

  const toggle = (m: PaymentTypes) => {
    setSelected((prev) => {
      if (prev.includes(m)) {
        const next = prev.filter((x) => x !== m);
        setAmounts((prevAmt) => {
          const { [m]: _, ...rest } = prevAmt;
          return rest;
        });
        return next;
      }
      if (prev.length < 2) return [...prev, m];
      return prev;
    });
    setLastChanged(null);
  };

  const onAmountChange = (m: PaymentTypes, v: string) => {
    // если поле полностью очищено — удаляем ключ, не ставим NaN
    if (v === "") {
      setAmounts((prevAmt) => {
        const { [m]: _, ...rest } = prevAmt;
        return rest;
      });
      setLastChanged(null);
      return;
    }

    const raw = parseFloat(v);
    const clamped = isNaN(raw) ? 0 : Math.min(raw, totalAmount);
    setLastChanged(m);
    setAmounts((prevAmt) => ({ ...prevAmt, [m]: clamped }));
  };

  // если выбран один метод — сразу ставим ему весь totalAmount
  useEffect(() => {
    if (selected.length === 1) {
      const only = selected[0];
      setAmounts((prev) => ({ ...prev, [only]: totalAmount }));
      setLastChanged(null);
    }
  }, [selected, totalAmount]);

  // как только стало два — **сбрасываем** все суммы, чтобы поля были пустыми
  useEffect(() => {
    if (selected.length === 2) {
      setAmounts({} as Record<PaymentTypes, number>);
      setLastChanged(null);
    }
  }, [selected]);

  // при двух способах — автоматически считаем второе поле
  useEffect(() => {
    if (selected.length === 2 && lastChanged && amounts[lastChanged] != null) {
      const [m1, m2] = selected;
      const other = lastChanged === m1 ? m2 : m1;
      const keep = amounts[lastChanged]!;
      const calc = Math.max(totalAmount - keep, 0);
      // пишем только если реально отличается
      if (amounts[other] !== calc) {
        setAmounts((prev) => ({ ...prev, [other]: calc }));
      }
    }
  }, [amounts, selected, totalAmount, lastChanged]);

  // отдаем наружу PaymentInfo[]
  useEffect(() => {
    const info: PaymentInfo[] = selected.map((m) => ({
      paymentTypes: m,
      amount: amounts[m] ?? 0,
    }));
    onChange(info);
  }, [selected, amounts]);

  const paymentMethods = [
    {
      name: PaymentTypes.CASH,
      label: t("payment_types.cash"),
      color: "green",
      icon: <CashIcon className="w-6 h-6" style={{ fill: "currentColor" }} />,
    },
    {
      name: PaymentTypes.CARD,
      label: t("payment_types.card"),
      color: "yellow",
      icon: <CardIcon className="w-6 h-6" style={{ fill: "currentColor" }} />,
    },
    // {
    //   name: PaymentTypes.CLICK,
    //   label: t("payment_types.click"),
    //   color: "blue",
    //   icon: <ClickIcon className="w-6 h-6" style={{ fill: "currentColor" }} />,
    // },
    // {
    //   name: PaymentTypes.UZUM,
    //   label: t("payment_types.uzum"),
    //   color: "purple",
    //   icon: <UzumIcon className="w-6 h-6" style={{ fill: "currentColor" }} />,
    // },
    // {
    //   name: PaymentTypes.PAYME,
    //   label: t("payment_types.payme"),
    //   color: "cyan",
    //   icon: <PaymeIcon className="w-6 h-6" style={{ fill: "currentColor" }} />,
    // },
    {
      name: PaymentTypes.CORPORATE,
      label: t("payment_types.corporate"),
      color: "gray",
      icon: <PaymeIcon className="w-6 h-6" style={{ fill: "currentColor" }} />,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="font-semibold text-lg">{t("payment_types.select")}</div>
      <div className="grid grid-cols-2 gap-4">
        {paymentMethods.map(({ name, label, icon }) => (
          <div
            key={name}
            className={classNames(
              "w-full h-[100px] p-4 rounded-xl cursor-pointer transition-colors border flex items-center space-x-3",
              {
                // Стили для кнопки, если она выбрана
                "bg-green-500 text-white border-transparent":
                  selected.includes(name) && name === PaymentTypes.CASH,
                "bg-yellow-500 text-white border-transparent":
                  selected.includes(name) && name === PaymentTypes.CARD,
                // "bg-blue-500 text-white border-transparent":
                //   selected.includes(name) && name === PaymentTypes.CLICK,
                // "bg-purple-500 text-white border-transparent":
                //   selected.includes(name) && name === PaymentTypes.UZUM,
                // "bg-cyan-500 text-white border-transparent":
                //   selected.includes(name) && name === PaymentTypes.PAYME,
                "bg-gray-500 text-white border-transparent":
                  selected.includes(name) && name === PaymentTypes.CORPORATE,

                // Стили для кнопки, если она не выбрана
                "bg-green-500/30 border-green-500 text-green-500":
                  !selected.includes(name) && name === PaymentTypes.CASH,
                "bg-yellow-500/30 border-yellow-500 text-yellow-500":
                  !selected.includes(name) && name === PaymentTypes.CARD,
                // "bg-blue-500/30 border-blue-500 text-blue-500":
                //   !selected.includes(name) && name === PaymentTypes.CLICK,
                // "bg-purple-500/30 border-purple-500 text-purple-500":
                //   !selected.includes(name) && name === PaymentTypes.UZUM,
                // "bg-cyan-500/30 border-cyan-500 text-cyan-500":
                //   !selected.includes(name) && name === PaymentTypes.PAYME,
                "bg-gray-500/30 border-gray-500 text-gray-500":
                  !selected.includes(name) && name === PaymentTypes.CORPORATE,
              }
            )}
            onClick={() => toggle(name)}
          >
            {icon}
            <span>{label}</span>
          </div>
        ))}
      </div>
      {selected.length > 1 && (
        <div className="space-y-4">
          {selected.map((m) => {
            // находим объект, чтобы взять человекочитаемый label
            const method = paymentMethods.find((pm) => pm.name === m);
            return (
              <div key={m} className="flex flex-col">
                <label className="font-medium mb-1">
                  Сумма для{" "}
                  <span className="font-semibold">{method?.label}</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max={totalAmount}
                  step="0.01"
                  value={amounts[m] ?? ""}
                  onChange={(e) => onAmountChange(m, e.target.value)}
                  className="m-1 p-2 bg-transparent border dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Введите сумму"
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PaymentMethodSelector;
