export interface Product {
  code: string;
  name: string;
  price: number;
  unit?: "un" | "kg";
}

export interface CartItem extends Product {
  qty: number;
  id: number;
  weight?: number;
  itemDiscount?: number; // percentage 0-100
}

export interface Purchase {
  date: string; // ISO string
  time: string;
  total: number;
  itemCount: number;
  paymentMethod: string | string[];
  discount?: number;
  refunded?: boolean;
  refundedAmount?: number;
}

export interface Operator {
  id: number;
  name: string;
  initials: string;
  pin: string;
  fundoCaixa: number;
  history: Purchase[];
}
