// src/actions/postCheck.ts
import type { Good } from "@/types/goods";
import type { PaymentInfo } from "@/types/paymentInfo";

export const postCheck = async (
  id: string,
  goods: Good[],
  paymentInfo: PaymentInfo[]
): Promise<void> => {
  const url = "http://localhost:80/ung/hs/billsqueque/billpost/";

  const body = JSON.stringify({ id, goods, paymentInfo });

  const resp = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Basic dmVua29uOm92ZXJsb3Jk",
    },
    body,
    credentials: "include",  
    mode: "cors",
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`postCheck failed ${resp.status}: ${text}`);
  }

  // const data = await resp.json();
  // return data;
};
