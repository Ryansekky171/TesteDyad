export type TransactionType = "income" | "expense";
export type PaymentMethod = "Débito" | "Crédito" | "Boleto" | "Pix" | "Dinheiro";

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
  paymentMethod: PaymentMethod;
}