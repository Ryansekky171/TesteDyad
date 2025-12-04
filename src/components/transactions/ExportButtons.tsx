import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download } from "lucide-react";
import { Transaction } from "@/types";
import { formatCurrency, exportToCsv } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ExportButtonsProps {
  allTransactions: Transaction[]; // Necessário para exportação anual
  filteredTransactions: Transaction[]; // Já filtrado por mês
  totalIncome: number;
  totalExpense: number;
  balance: number;
  selectedMonth: number;
  selectedYear: number;
  selectedCurrency: string;
}

const ExportButtons: React.FC<ExportButtonsProps> = ({
  allTransactions,
  filteredTransactions,
  totalIncome,
  totalExpense,
  balance,
  selectedMonth,
  selectedYear,
  selectedCurrency,
}) => {

  const handleExportMonthly = () => {
    const monthName = format(new Date(selectedYear, selectedMonth, 1), "MMMM", { locale: ptBR });
    const filename = `resumo_mensal_${monthName}_${selectedYear}.csv`;

    const headers = [
      "Data", "Descrição", "Categoria", "Método de Pagamento", "Tipo", "Valor"
    ];

    const dataRows = filteredTransactions.map(t => [
      format(new Date(t.date), "dd/MM/yyyy", { locale: ptBR }),
      t.description,
      t.category,
      t.paymentMethod,
      t.type === "income" ? "Receita" : "Despesa",
      formatCurrency(t.amount, selectedCurrency),
    ]);

    const summaryRows = [
      [], // Linha vazia para separação
      ["Resumo Mensal", "", "", "", "", ""],
      ["Total Receitas", "", "", "", "", formatCurrency(totalIncome, selectedCurrency)],
      ["Total Despesas", "", "", "", "", formatCurrency(totalExpense, selectedCurrency)],
      ["Saldo", "", "", "", "", formatCurrency(balance, selectedCurrency)],
    ];

    exportToCsv(filename, headers, [...dataRows, ...summaryRows]);
  };

  const handleExportAnnual = () => {
    const annualTransactions = allTransactions.filter(t =>
      new Date(t.date).getFullYear() === selectedYear
    );

    const annualIncome = annualTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const annualExpense = annualTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    const annualBalance = annualIncome - annualExpense;

    const filename = `resumo_anual_${selectedYear}.csv`;

    const headers = [
      "Data", "Descrição", "Categoria", "Método de Pagamento", "Tipo", "Valor"
    ];

    const dataRows = annualTransactions.map(t => [
      format(new Date(t.date), "dd/MM/yyyy", { locale: ptBR }),
      t.description,
      t.category,
      t.paymentMethod,
      t.type === "income" ? "Receita" : "Despesa",
      formatCurrency(t.amount, selectedCurrency),
    ]);

    const summaryRows = [
      [], // Linha vazia para separação
      ["Resumo Anual", "", "", "", "", ""],
      ["Total Receitas", "", "", "", "", formatCurrency(annualIncome, selectedCurrency)],
      ["Total Despesas", "", "", "", "", formatCurrency(annualExpense, selectedCurrency)],
      ["Saldo", "", "", "", "", formatCurrency(annualBalance, selectedCurrency)],
    ];

    exportToCsv(filename, headers, [...dataRows, ...summaryRows]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Exportar Dados</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col sm:flex-row gap-4">
        <Button onClick={handleExportMonthly} className="w-full sm:w-auto">
          <Download className="mr-2 h-4 w-4" /> Exportar Mês
        </Button>
        <Button onClick={handleExportAnnual} className="w-full sm:w-auto">
          <Download className="mr-2 h-4 w-4" /> Exportar Ano
        </Button>
      </CardContent>
    </Card>
  );
};

export default ExportButtons;