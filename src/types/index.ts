export type TransactionType = "income" | "expense";
export type PaymentMethod = "Débito" | "Crédito" | "Boleto" | "Pix" | "Dinheiro";

export interface Transaction {
  id: string;
  user_id: string; // Adicionado para associar a transação a um usuário
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
  paymentMethod: PaymentMethod;
}