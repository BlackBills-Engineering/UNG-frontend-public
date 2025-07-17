// src/components/CartSheet.tsx
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "../ui/sheet";
import { useCart } from "../hooks/useCart";
import { useTranslation } from "react-i18next";
import { ShoppingBag, ShoppingBasket, Trash2 } from "lucide-react";
import PumpIcon from "../ui/PumpIcon";
import { useEffect, useState } from "react";
import PaymentMethodSelector from "./PaymentSelector";
import { v4 as uuidv4 } from "uuid";
import { postCheck } from "../actions/postCheck";
import { getCheck } from "../actions/getCheck";
import type { Good } from "@/types/goods";
import type { PaymentInfo } from "@/types/paymentInfo";
import Alert from "@mui/material/Alert";


export const CartSheet: React.FC = () => {
  const {
    products,
    pumps,
    isCartOpen,
    toggleCart,
    closeCart,
    updateProductQty,
    removeProduct,
    removePump,
  } = useCart();
  const { t } = useTranslation();

  const [isCheckout, setIsCheckout] = useState(false);

  //новый вариант с выделением ТРК и товаров

  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo[]>([]);
  const [alertInfo, setAlertInfo] = useState<{
    severity: "success" | "error";
    message: string;
  } | null>(null);

  // общий toggle: если в Set — удаляем, иначе — добавляем
  const toggleItemSelection = (key: string) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // отфильтруем только те ТРК, у которых есть ключ в selectedItems
  const selectedPumpItems = pumps.filter((cp) =>
    selectedItems.has(cp.uuid)
  );

  // отфильтруем только те продукты, у которых есть ключ в selectedItems
  const selectedProductItems = products.filter((p) => {
    const key = `prod-${p.id}`;
    return selectedItems.has(key);
  });

  // хотя бы одна позиция выбрана?
  const anySelected = selectedItems.size > 0;

  // чистим selectedItems при удалении товаров/пампов
  useEffect(() => {
    setSelectedItems((prev) => {
      const next = new Set<string>();
      prev.forEach((key) => {
        // если в новой корзине ещё есть такой uuid — оставляем его
        if (pumps.some((cp) => cp.uuid === key)) {
          next.add(key);
        }
        // а для продуктов аналогично по prod-<id>
        else if (key.startsWith("prod-")) {
          const id = key.slice(5);
          if (products.some((p) => String(p.id) === id)) {
            next.add(key);
          }
        }
      });
      return next;
    });
  }, [pumps, products]);

  // считаем итог только по выбранным
  const productTotal = selectedProductItems.reduce(
    (sum, p) => sum + p.unitPrice * p.quantity,
    0
  );
  const pumpsTotal = selectedPumpItems.reduce(
    (sum, p) => sum + (p.totalAmount ?? p.pricePerL * p.liters),
    0
  );
  const overall = productTotal + pumpsTotal;

  const handlePayment = async () => {
    const id = uuidv4();
    console.log(id);

    // 1. build goods array
    const goods: Good[] = [
      ...selectedPumpItems.map((cp) => ({
        sku: cp.grade,
        quantity: cp.liters,
        amount: cp.totalAmount ?? Math.floor(cp.pricePerL * cp.liters),
      })),
      ...selectedProductItems.map((p) => ({
        sku: p.id,
        quantity: p.quantity,
        amount: p.unitPrice * p.quantity,
      })),
    ];

    try {
      // 2) POST — создаём оплату
      await postCheck(id, goods, paymentInfo);

      // 3) Запускаем опрос статуса
      const interval = setInterval(async () => {
        try {
          const res = await getCheck(id);
          const status = res.status; // ожидаем { status: "pending" | "success" | "canceled", ... }
          console.log(status);
          
          if (status !== "Pending") {
            clearInterval(interval);

            if (status === "Success") {
              setAlertInfo({
                severity: "success",
                message: t("payment_status.success"),
              });
              // Удаляем из корзины всё, что оплатили
              selectedPumpItems.forEach((cp) => removePump(cp.uuid));
              selectedProductItems.forEach((p) => removeProduct(p.id));
              // Сбрасываем выделение (чтобы ничего не осталось "выделенным")
              setSelectedItems(new Set());
              setIsCheckout(false);

              // И только после этого закрываем корзину
              // closeCart();
            } else {
              // статус canceled или иной
              // показать пользователю ошибку / отмену
              setAlertInfo({
                severity: "error",
                message: t("payment_status.canceled"),
              });
              console.warn("Оплата отменена или не удалась");
            }
          }
        } catch (err) {
          console.error("Ошибка при проверке статуса:", err);
        }
      }, 2000);
    } catch (err) {
      console.error("Ошибка при отправке оплаты:", err);
      setAlertInfo({ severity: "error", message: t("payment_status.canceled") });
      // показать пользователю ошибку
    }
  };
  useEffect(() => {
    if (!alertInfo) return;
    const timer = setTimeout(() => {
      setAlertInfo(null);
    }, 3000); 
    return () => clearTimeout(timer);
  }, [alertInfo]);
  return (
    <Sheet open={isCartOpen} onOpenChange={toggleCart}>
      <SheetTrigger asChild>
        <button className="flex items-center p-2 rounded-lg text-xs border border-gray-300 dark:border-gray-700  dark:bg-gray-800 text-gray-900 dark:text-gray-200 transition-all duration-200">
          <ShoppingBasket className="mr-2 h-4 w-4" /> {t("cart.title")} (
          {products.length + pumps.length})
        </button>
      </SheetTrigger>

      <SheetContent className="h-full flex flex-col border-l-[2px] border-gray-400 dark:border-gray-700 w-full sm:min-w-[600px] lg:min-w-[500px] bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4">
        {alertInfo && (
          <Alert
            variant="filled"
            severity={alertInfo.severity}
            onClose={() => setAlertInfo(null)}
            className="mb-4"
          >
            {alertInfo.message}
          </Alert>
        )}

        <SheetHeader className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
          <SheetTitle>
            {isCheckout ? t("cart.payment") : t("cart.title")}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          {products.length + pumps.length === 0 ? (
            <div className="flex items-center justify-center h-full w-full">
              {t("cart.empty", "Ваша корзина пуста")}
            </div>
          ) : isCheckout ? (
            <>
              <div className="flex items-center justify-center mb-4">
                <div className="border-y border-l p-4 rounded-l-xl border-green-500 dark:border-green-500/50 bg-green-500/10 dark:bg-green-500/30 shadow-lg">
                  <ShoppingBag className="h-4 w-4 " />
                </div>
                <div className="flex flex-col justify-evenly items-center mb-4 mr-1 border dark:bg-gray-800 dark:border-gray-600 p-4 rounded-xl shadow-lg dark:shadow-[0_4px_10px_rgba(255,255,255,0.15)]">
                  <div className="h-20 sm:h-auto font-bold text-lg">
                    {t("cart.productsTotal")}
                  </div>
                  <div className="text-lg text-nowrap">
                    {productTotal.toLocaleString()} {t("common.soums")}
                  </div>
                </div>
                <div className="flex flex-col justify-between items-center mb-4 ml-1 border dark:bg-gray-800 dark:border-gray-600 p-4 rounded-xl shadow-lg dark:shadow-[0_4px_10px_rgba(255,255,255,0.15)]">
                  <div className="h-20 sm:h-auto font-bold text-lg">
                    {t("cart.fuelTotal")}
                  </div>
                  <div className="text-lg text-nowrap">
                    {pumpsTotal.toLocaleString()} {t("common.soums")}
                  </div>
                </div>
                <div className="border-y border-r p-3 rounded-r-xl border-blue-500 dark:border-blue-500/50 bg-blue-500/10 dark:bg-blue-500/30 shadow-lg">
                  <PumpIcon
                    className="h-6 w-6"
                    style={{ fill: "currentColor" }}
                  />
                </div>
              </div>
              <div className="flex justify-between items-center mb-4">
                <div className="font-bold text-lg">{t("cart.total")}</div>
                <div className="font-semibold text-lg">
                  {overall.toLocaleString()} {t("common.soums")}
                </div>
              </div>
              <PaymentMethodSelector
                totalAmount={overall}
                onChange={(info) => setPaymentInfo(info)}
              />
            </>
          ) : (
            <>
              {/* ТРК */}
              {pumps.map((cp, i) => {
                const key = cp.uuid;
                return (
                  <div
                    key={key}
                    className="flex justify-between items-center py-6 border-b border-gray-200 dark:border-gray-700"
                  >
                    <label className="flex items-center w-full justify-between">
                      {/* чекбокс для выбора */}
                      <input
                        type="checkbox"
                        checked={selectedItems.has(key)}
                        onChange={() => toggleItemSelection(key)}
                        className="
                      h-4 w-4 mr-4 
                      focus:outline-none focus:ring-0 
                      appearance-none   
                      border border-gray-500 rounded-full 
                      bg-transparent
                    checked:bg-blue-500          
                    checked:border-blue-500            
                      "
                      />

                      {/* инфо по ТРК */}
                      <div className="w-[250px]">
                        {t("cart.trk", { number: cp.pumpId, grade: cp.grade })}
                        <br />
                        {cp.liters.toFixed(2)} л ×{" "}
                        {cp.pricePerL.toLocaleString()} {t("buttons.unit")}
                      </div>

                      {/* итоговая сумма (берем totalAmount, если он передан) */}
                      <div className="w-[150px] text-right">
                        {(
                          cp.totalAmount ?? Math.floor(cp.pricePerL * cp.liters)
                        ).toLocaleString()}{" "}
                        {t("common.soums")}
                      </div>

                      {/* кнопка удаления */}
                      <button
                        onClick={() => removePump(cp.uuid)}
                        className="text-red-500 p-2 rounded-full bg-red-500/20 ml-4"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </label>
                  </div>
                );
              })}

              {/* Товары */}
              {products.map((p) => {
                const key = `prod-${p.id}`;
                return (
                  <div
                    key={key}
                    className="flex justify-between items-center py-6 border-b border-gray-200 dark:border-gray-700"
                  >
                    <label className="flex items-center w-full justify-between">
                      <input
                        type="checkbox"
                        checked={selectedItems.has(key)}
                        onChange={() => toggleItemSelection(key)}
                        className="h-4 w-4 mr-4 
                      focus:outline-none focus:ring-0 
                      appearance-none   
                      border border-gray-500 rounded-full 
                      bg-transparent
                    checked:bg-blue-500          
                    checked:border-blue-500  "
                      />
                      <div className="w-[100px]">{t(p.name)}</div>
                      <div className="flex items-center space-x-4 ">
                        <div className="flex items-center space-x-2">
                          <button
                            className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-full hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800 transition"
                            onClick={() => updateProductQty(p.id, -1)}
                          >
                            -
                          </button>
                          <span className="w-6 text-center">{p.quantity}</span>
                          <button
                            className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-full hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800 transition"
                            onClick={() => updateProductQty(p.id, +1)}
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <span>
                        {(p.unitPrice * p.quantity).toLocaleString()}{" "}
                        {t("common.soums")}
                      </span>
                      <button
                        onClick={() => removeProduct(p.id)}
                        className="text-red-500 p-2 rounded-full bg-red-500/20 mr-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </label>
                  </div>
                );
              })}
            </>
          )}
        </div>

        <SheetFooter>
          {isCheckout ? (
            <div className="flex w-full space-x-2">
              <button
                onClick={() => setIsCheckout(false)}
                className="w-full h-12 bg-gray-200 text-gray-800 rounded-lg  sm:mt-0 mb-2"
              >
                {t("cart.returnCart")}
              </button>
              <button
                onClick={() => handlePayment()}
                className="w-full h-12 bg-blue-500 text-gray-200 rounded-lg sm:mt-0 mb-2"
              >
                {t("cart.payment")}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsCheckout(true)}
              disabled={!anySelected}
              className={`w-full h-12 ${
                !anySelected ? "bg-gray-600 cursor-not-allowed" : "bg-blue-500"
              } text-white py-2 rounded-lg`}
            >
              {t("cart.checkout")}
            </button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
