import type { PaymentTypes } from "@/enums/payment.types.enum";

export type PaymentInfo = {
  amount: number;
  paymentTypes: PaymentTypes;
};
