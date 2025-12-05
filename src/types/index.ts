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
  is_recurring?: boolean; // Novo campo para indicar se é uma transação recorrente
  recurring_id?: string; // Novo campo para agrupar transações recorrentes
}