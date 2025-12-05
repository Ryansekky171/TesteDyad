import React from "react";
import { Transaction } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ReportGeneratorProps {
  transactions: Transaction[];
  totalIncome: number;
  totalExpense: number;
  balance: number;
  reportTitle: string;
  selectedCurrency: string;
  periodDescription: string;
  expenseByCategoryData?: { name: string; value: number }[];
  incomeVsExpenseData?: { name: string; Receitas: number; Despesas: number }[];
}

const ReportGenerator: React.FC<ReportGeneratorProps> = ({
  transactions,
  totalIncome,
  totalExpense,
  balance,
  reportTitle,
  selectedCurrency,
  periodDescription,
  expenseByCategoryData,
  incomeVsExpenseData,
}) => {
  return (
    <div className="p-6 bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 font-sans" style={{ width: '800px', margin: '0 auto' }}>
      <h1 className="text-3xl font-bold mb-6 text-center">{reportTitle}</h1>
      <p className="text-lg mb-8 text-center">{periodDescription}</p>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="p-4 border rounded-lg shadow-sm bg-green-50 dark:bg-green-900">
          <h2 className="text-md font-semibold text-green-700 dark:text-green-300">Total Receitas</h2>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(totalIncome, selectedCurrency)}</p>
        </div>
        <div className="p-4 border rounded-lg shadow-sm bg-red-50 dark:bg-red-900">
          <h2 className="text-md font-semibold text-red-700 dark:text-red-300">Total Despesas</h2>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{formatCurrency(totalExpense, selectedCurrency)}</p>
        </div>
        <div className="p-4 border rounded-lg shadow-sm bg-blue-50 dark:bg-blue-900">
          <h2 className="text-md font-semibold text-blue-700 dark:text-blue-300">Saldo</h2>
          <p className={`text-2xl font-bold ${balance >= 0 ? "text-blue-600 dark:text-blue-400" : "text-red-600 dark:text-red-400"}`}>
            {formatCurrency(balance, selectedCurrency)}
          </p>
        </div>
      </div>

      {/* Transaction List */}
      <h2 className="text-2xl font-bold mb-4">Detalhes das Transações</h2>
      {transactions.length > 0 ? (
        <table className="w-full border-collapse mb-8">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800">
              <th className="border p-2 text-left">Data</th>
              <th className="border p-2 text-left">Descrição</th>
              <th className="border p-2 text-left">Categoria</th>
              <th className="border p-2 text-left">Pagamento</th>
              <th className="border p-2 text-right">Tipo</th>
              <th className="border p-2 text-right">Valor</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.id} className="even:bg-gray-50 dark:even:bg-gray-800/50">
                <td className="border p-2">{format(new Date(t.date), "dd/MM/yyyy", { locale: ptBR })}</td>
                <td className="border p-2">{t.description}</td>
                <td className="border p-2">{t.category}</td>
                <td className="border p-2">{t.paymentMethod}</td>
                <td className={`border p-2 text-right ${t.type === "income" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                  {t.type === "income" ? "Receita" : "Despesa"}
                </td>
                <td className="border p-2 text-right">{formatCurrency(t.amount, selectedCurrency)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-center text-gray-500 dark:text-gray-400 mb-8">Nenhuma transação para exibir neste período.</p>
      )}

      {/* Chart Data (as tables for PDF/HTML) */}
      <h2 className="text-2xl font-bold mb-4">Resumo Gráfico (Dados)</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {expenseByCategoryData && expenseByCategoryData.length > 0 && (
          <div className="p-4 border rounded-lg shadow-sm bg-gray-50 dark:bg-gray-800">
            <h3 className="text-xl font-semibold mb-3">Despesas por Categoria</h3>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700">
                  <th className="border p-2 text-left">Categoria</th>
                  <th className="border p-2 text-right">Valor</th>
                </tr>
              </thead>
              <tbody>
                {expenseByCategoryData.map((item, index) => (
                  <tr key={index} className="even:bg-gray-50 dark:even:bg-gray-800/50">
                    <td className="border p-2">{item.name}</td>
                    <td className="border p-2 text-right">{formatCurrency(item.value, selectedCurrency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {incomeVsExpenseData && incomeVsExpenseData.length > 0 && (
          <div className="p-4 border rounded-lg shadow-sm bg-gray-50 dark:bg-gray-800">
            <h3 className="text-xl font-semibold mb-3">Receitas vs. Despesas</h3>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700">
                  <th className="border p-2 text-left">Período</th>
                  <th className="border p-2 text-right">Receitas</th>
                  <th className="border p-2 text-right">Despesas</th>
                </tr>
              </thead>
              <tbody>
                {incomeVsExpenseData.map((item, index) => (
                  <tr key={index} className="even:bg-gray-50 dark:even:bg-gray-800/50">
                    <td className="border p-2">{item.name}</td>
                    <td className="border p-2 text-right">{formatCurrency(item.Receitas, selectedCurrency)}</td>
                    <td className="border p-2 text-right">{formatCurrency(item.Despesas, selectedCurrency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportGenerator;