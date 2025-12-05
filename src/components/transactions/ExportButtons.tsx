import React, { useRef } from "react";
import ReactDOM from 'react-dom/client'; // Importar ReactDOM
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileSpreadsheet, FileText, FileDown, ChevronDown } from "lucide-react"; // Adicionado ChevronDown
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // Importar componentes do DropdownMenu
import { Transaction } from "@/types";
import { formatCurrency, exportToCsv } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import ReportGenerator from "@/components/reports/ReportGenerator";

interface ExportButtonsProps {
  allTransactions: Transaction[];
  filteredTransactions: Transaction[];
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
  const getExpenseByCategoryData = (transactions: Transaction[]) => {
    const expenseByCategory = transactions
      .filter((t) => t.type === "expense")
      .reduce((acc, transaction) => {
        acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount;
        return acc;
      }, {} as Record<string, number>);

    return Object.entries(expenseByCategory).map(([name, value]) => ({
      name,
      value,
    }));
  };

  const getIncomeVsExpenseData = (income: number, expense: number) => {
    return [
      {
        name: "Resumo",
        Receitas: income,
        Despesas: expense,
      },
    ];
  };

  const handleExportCsv = (transactionsToExport: Transaction[], income: number, expense: number, bal: number, filenamePrefix: string, periodDesc: string) => {
    const filename = `${filenamePrefix}.csv`;

    const headers = [
      "Data", "Descrição", "Categoria", "Método de Pagamento", "Tipo", "Valor"
    ];

    const dataRows = transactionsToExport.map(t => [
      format(new Date(t.date), "dd/MM/yyyy", { locale: ptBR }),
      t.description,
      t.category,
      t.paymentMethod,
      t.type === "income" ? "Receita" : "Despesa",
      formatCurrency(t.amount, selectedCurrency),
    ]);

    const summaryRows = [
      [], // Linha vazia para separação
      [`Resumo ${periodDesc}`, "", "", "", "", ""],
      ["Total Receitas", "", "", "", "", formatCurrency(income, selectedCurrency)],
      ["Total Despesas", "", "", "", "", formatCurrency(expense, selectedCurrency)],
      ["Saldo", "", "", "", "", formatCurrency(bal, selectedCurrency)],
    ];

    exportToCsv(filename, headers, [...dataRows, ...summaryRows]);
  };

  const handleExportMonthlyCsv = () => {
    const monthName = format(new Date(selectedYear, selectedMonth, 1), "MMMM", { locale: ptBR });
    handleExportCsv(filteredTransactions, totalIncome, totalExpense, balance, `resumo_mensal_${monthName}_${selectedYear}`, `Mensal (${monthName} de ${selectedYear})`);
  };

  const handleExportAnnualCsv = () => {
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

    handleExportCsv(annualTransactions, annualIncome, annualExpense, annualBalance, `resumo_anual_${selectedYear}`, `Anual (${selectedYear})`);
  };

  const generateReportContent = (transactions: Transaction[], income: number, expense: number, bal: number, reportTitle: string, periodDescription: string) => {
    const expenseByCategoryData = getExpenseByCategoryData(transactions);
    const incomeVsExpenseData = getIncomeVsExpenseData(income, expense);

    return (
      <ReportGenerator
        transactions={transactions}
        totalIncome={income}
        totalExpense={expense}
        balance={bal}
        reportTitle={reportTitle}
        selectedCurrency={selectedCurrency}
        periodDescription={periodDescription}
        expenseByCategoryData={expenseByCategoryData}
        incomeVsExpenseData={incomeVsExpenseData}
      />
    );
  };

  const exportToPdf = async (content: JSX.Element, filename: string) => {
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '-9999px';
    document.body.appendChild(tempDiv);

    const root = ReactDOM.createRoot(tempDiv);
    root.render(content);

    await new Promise(resolve => setTimeout(resolve, 100));

    if (tempDiv) {
      const canvas = await html2canvas(tempDiv, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      pdf.save(filename);
    }

    root.unmount();
    document.body.removeChild(tempDiv);
  };

  const handleExportMonthlyPdf = async () => {
    const monthName = format(new Date(selectedYear, selectedMonth, 1), "MMMM", { locale: ptBR });
    const reportTitle = "Resumo Financeiro Mensal";
    const periodDescription = `Período: ${monthName} de ${selectedYear}`;
    const filename = `resumo_mensal_${monthName}_${selectedYear}.pdf`;

    const content = generateReportContent(filteredTransactions, totalIncome, totalExpense, balance, reportTitle, periodDescription);
    await exportToPdf(content, filename);
  };

  const handleExportAnnualPdf = async () => {
    const annualTransactions = allTransactions.filter(t =>
      new Date(t.date).getFullYear() === selectedYear
    );
    const annualIncome = annualTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
    const annualExpense = annualTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
    const annualBalance = annualIncome - annualExpense;

    const reportTitle = "Resumo Financeiro Anual";
    const periodDescription = `Período: Ano de ${selectedYear}`;
    const filename = `resumo_anual_${selectedYear}.pdf`;

    const content = generateReportContent(annualTransactions, annualIncome, annualExpense, annualBalance, reportTitle, periodDescription);
    await exportToPdf(content, filename);
  };

  const exportToHtml = (content: JSX.Element, filename: string) => {
    const tempDiv = document.createElement('div');
    document.body.appendChild(tempDiv);

    const root = ReactDOM.createRoot(tempDiv);
    root.render(content);

    setTimeout(() => {
      const htmlContent = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${filename.replace('.html', '')}</title>
    <style>
        /* Inclua aqui o CSS do Tailwind ou um CSS customizado para o relatório */
        body { font-family: sans-serif; margin: 0; padding: 20px; background-color: #f8f8f8; color: #333; }
        .dark body { background-color: #1a1a1a; color: #eee; }
        .p-6 { padding: 1.5rem; }
        .bg-white { background-color: #fff; }
        .dark:bg-gray-900 { background-color: #1a1a1a; }
        .text-gray-900 { color: #1a1a1a; }
        .dark:text-gray-100 { color: #f1f1f1; }
        .font-sans { font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"; }
        .text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
        .font-bold { font-weight: 700; }
        .mb-6 { margin-bottom: 1.5rem; }
        .text-center { text-align: center; }
        .text-lg { font-size: 1.125rem; line-height: 1.75rem; }
        .mb-8 { margin-bottom: 2rem; }
        .grid { display: grid; }
        .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        .gap-4 { gap: 1rem; }
        .p-4 { padding: 1rem; }
        .border { border-width: 1px; border-style: solid; border-color: #e5e7eb; }
        .rounded-lg { border-radius: 0.5rem; }
        .shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
        .bg-green-50 { background-color: #f0fdf4; }
        .dark:bg-green-900 { background-color: #064e3b; }
        .text-green-700 { color: #047857; }
        .dark:text-green-300 { color: #6ee7b7; }
        .text-2xl { font-size: 1.5rem; line-height: 2rem; }
        .text-green-600 { color: #16a34a; }
        .dark:text-green-400 { color: #4ade80; }
        .bg-red-50 { background-color: #fef2f2; }
        .dark:bg-red-900 { background-color: #7f1d1d; }
        .text-red-700 { color: #b91c1c; }
        .dark:text-red-300 { color: #fca5a5; }
        .text-red-600 { color: #dc2626; }
        .dark:text-red-400 { color: #f87171; }
        .bg-blue-50 { background-color: #eff6ff; }
        .dark:bg-blue-900 { background-color: #1e3a8a; }
        .text-blue-700 { color: #1d4ed8; }
        .dark:text-blue-300 { color: #93c5fd; }
        .text-blue-600 { color: #2563eb; }
        .dark:text-blue-400 { color: #60a5fa; }
        .text-md { font-size: 1rem; line-height: 1.5rem; }
        .mb-4 { margin-bottom: 1rem; }
        .w-full { width: 100%; }
        .border-collapse { border-collapse: collapse; }
        .bg-gray-100 { background-color: #f3f4f6; }
        .dark:bg-gray-800 { background-color: #1f2937; }
        .border { border-width: 1px; border-style: solid; border-color: #e5e7eb; }
        .p-2 { padding: 0.5rem; }
        .text-left { text-align: left; }
        .text-right { text-align: right; }
        .even:bg-gray-50:nth-child(even) { background-color: #f9fafb; }
        .dark:even:bg-gray-800\/50:nth-child(even) { background-color: rgba(31, 41, 55, 0.5); }
        .text-gray-500 { color: #6b7280; }
        .dark:text-gray-400 { color: #9ca3af; }
        .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
        .md:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .gap-6 { gap: 1.5rem; }
        .bg-gray-50 { background-color: #f9fafb; }
        .dark:bg-gray-800 { background-color: #1f2937; }
        .text-xl { font-size: 1.25rem; line-height: 1.75rem; }
        .mb-3 { margin-bottom: 0.75rem; }
        .dark:bg-gray-700 { background-color: #374151; }
    </style>
</head>
<body>
    ${tempDiv.innerHTML}
</body>
</html>`;

      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
      const link = document.createElement('a');
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }, 100);

    root.unmount();
    document.body.removeChild(tempDiv);
  };

  const handleExportMonthlyHtml = () => {
    const monthName = format(new Date(selectedYear, selectedMonth, 1), "MMMM", { locale: ptBR });
    const reportTitle = "Resumo Financeiro Mensal";
    const periodDescription = `Período: ${monthName} de ${selectedYear}`;
    const filename = `resumo_mensal_${monthName}_${selectedYear}.html`;

    const content = generateReportContent(filteredTransactions, totalIncome, totalExpense, balance, reportTitle, periodDescription);
    exportToHtml(content, filename);
  };

  const handleExportAnnualHtml = () => {
    const annualTransactions = allTransactions.filter(t =>
      new Date(t.date).getFullYear() === selectedYear
    );
    const annualIncome = annualTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
    const annualExpense = annualTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
    const annualBalance = annualIncome - annualExpense;

    const reportTitle = "Resumo Financeiro Anual";
    const periodDescription = `Período: Ano de ${selectedYear}`;
    const filename = `resumo_anual_${selectedYear}.html`;

    const content = generateReportContent(annualTransactions, annualIncome, annualExpense, annualBalance, reportTitle, periodDescription);
    exportToHtml(content, filename);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumo Financeiro</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-4">
        {/* Dropdown para Resumo do Mês */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              <FileDown className="mr-2 h-4 w-4" /> Resumo Mês <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>Exportar Resumo Mensal</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleExportMonthlyCsv}>
              <FileSpreadsheet className="mr-2 h-4 w-4" /> CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportMonthlyPdf}>
              <FileDown className="mr-2 h-4 w-4" /> PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportMonthlyHtml}>
              <FileText className="mr-2 h-4 w-4" /> HTML
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Dropdown para Resumo do Ano */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              <FileDown className="mr-2 h-4 w-4" /> Resumo Ano <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>Exportar Resumo Anual</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleExportAnnualCsv}>
              <FileSpreadsheet className="mr-2 h-4 w-4" /> CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportAnnualPdf}>
              <FileDown className="mr-2 h-4 w-4" /> PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportAnnualHtml}>
              <FileText className="mr-2 h-4 w-4" /> HTML
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardContent>
    </Card>
  );
};

export default ExportButtons;