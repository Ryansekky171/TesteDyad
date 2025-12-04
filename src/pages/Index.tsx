import React, { useState, useEffect } from "react";
import { MadeWithDyad } from "@/components/made-with-dyad";
import Header from "@/components/layout/Header";
import TransactionList from "@/components/transactions/TransactionList";
import AddTransactionForm from "@/components/transactions/AddTransactionForm";
import MonthYearPicker from "@/components/transactions/MonthYearPicker";
import TransactionCharts from "@/components/transactions/TransactionCharts";
import { Transaction } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils"; // Importar a nova utilidade

const Index = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedCurrency, setSelectedCurrency] = useState<string>(() => {
    // Inicializa do localStorage ou padrão para BRL
    if (typeof window !== 'undefined') {
      return localStorage.getItem("selectedCurrency") || "BRL";
    }
    return "BRL";
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem("selectedCurrency", selectedCurrency);
    }
  }, [selectedCurrency]);

  const handleAddTransaction = (newTransactionData: Omit<Transaction, "id" | "date">) => {
    const newTransaction: Transaction = {
      ...newTransactionData,
      id: uuidv4(),
      date: new Date().toISOString(),
    };
    setTransactions((prevTransactions) => [...prevTransactions, newTransaction]);
  };

  const handleDateChange = (month: number, year: number) => {
    setSelectedMonth(month);
    setSelectedYear(year);
  };

  const filteredTransactions = transactions.filter((transaction) => {
    const transactionDate = new Date(transaction.date);
    return (
      transactionDate.getMonth() === selectedMonth &&
      transactionDate.getFullYear() === selectedYear
    );
  });

  const totalIncome = filteredTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header selectedCurrency={selectedCurrency} onCurrencyChange={setSelectedCurrency} /> {/* Passa props de moeda */}
      <main className="flex-grow container mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <MonthYearPicker
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            onDateChange={handleDateChange}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Receitas</CardTitle>
                <span className="text-green-500">▲</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(totalIncome, selectedCurrency)} {/* Usa formatCurrency */}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Despesas</CardTitle>
                <span className="text-red-500">▼</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(totalExpense, selectedCurrency)} {/* Usa formatCurrency */}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Saldo</CardTitle>
                <span>📊</span>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${balance >= 0 ? "text-blue-600" : "text-red-600"}`}>
                  {formatCurrency(balance, selectedCurrency)} {/* Usa formatCurrency */}
                </div>
              </CardContent>
            </Card>
          </div>

          <TransactionCharts transactions={filteredTransactions} totalIncome={totalIncome} totalExpense={totalExpense} selectedCurrency={selectedCurrency} /> {/* Passa prop de moeda */}

          <Card>
            <CardHeader>
              <CardTitle>Minhas Transações</CardTitle>
            </CardHeader>
            <CardContent className="max-h-[400px] overflow-y-auto">
              <TransactionList transactions={filteredTransactions} selectedCurrency={selectedCurrency} /> {/* Passa prop de moeda */}
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Adicionar Nova Transação</CardTitle>
            </CardHeader>
            <CardContent>
              <AddTransactionForm onAddTransaction={handleAddTransaction} />
            </CardContent>
          </Card>
        </div>
      </main>
      <MadeWithDyad />
    </div>
  );
};

export default Index;