import React, { useState, useEffect, useCallback } from "react"; // Adicionado useCallback
import { MadeWithDyad } from "@/components/made-with-dyad";
import Header from "@/components/layout/Header";
import TransactionList from "@/components/transactions/TransactionList";
import AddTransactionForm from "@/components/transactions/AddTransactionForm";
import MonthYearPicker from "@/components/transactions/MonthYearPicker";
import TransactionCharts from "@/components/transactions/TransactionCharts";
import TransactionTypeSwitcher from "@/components/transactions/TransactionTypeSwitcher";
import ExportButtons from "@/components/transactions/ExportButtons";
import { Transaction, TransactionType, PaymentMethod } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner"; // Importar toast para notificações

const Index = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedCurrency, setSelectedCurrency] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem("selectedCurrency") || "BRL";
    }
    return "BRL";
  });
  const [selectedTransactionType, setSelectedTransactionType] = useState<TransactionType>("expense");
  const [userEmail, setUserEmail] = useState<string | undefined>(undefined);
  const [userId, setUserId] = useState<string | undefined>(undefined); // Novo estado para o ID do usuário

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem("selectedCurrency", selectedCurrency);
    }
  }, [selectedCurrency]);

  // Efeito para buscar o email e o ID do usuário logado
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email);
        setUserId(user.id);
      } else {
        setUserEmail(undefined);
        setUserId(undefined);
      }
    };
    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUserEmail(session.user.email);
        setUserId(session.user.id);
      } else {
        setUserEmail(undefined);
        setUserId(undefined);
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // Função para buscar transações do Supabase
  const fetchTransactions = useCallback(async () => {
    if (!userId) {
      setTransactions([]);
      return;
    }
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false });

    if (error) {
      toast.error("Erro ao carregar transações: " + error.message);
      console.error("Erro ao carregar transações:", error);
    } else {
      setTransactions(data as Transaction[]);
    }
  }, [userId]);

  // Carregar transações quando o userId mudar
  useEffect(() => {
    fetchTransactions();
  }, [userId, fetchTransactions]);

  const handleAddTransaction = async (newTransactionData: Omit<Transaction, "id"> | Omit<Transaction, "id">[]) => {
    if (!userId) {
      toast.error("Usuário não autenticado. Não foi possível adicionar a transação.");
      return;
    }

    const transactionsToAdd = Array.isArray(newTransactionData) ? newTransactionData : [newTransactionData];
    const transactionsWithIds = transactionsToAdd.map(t => ({ ...t, id: uuidv4(), user_id: userId }));

    const { data, error } = await supabase
      .from("transactions")
      .insert(transactionsWithIds)
      .select();

    if (error) {
      toast.error("Erro ao adicionar transação: " + error.message);
      console.error("Erro ao adicionar transação:", error);
    } else if (data) {
      setTransactions((prevTransactions) => [...data as Transaction[], ...prevTransactions]);
      toast.success("Transação(ões) adicionada(s) com sucesso!");
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!userId) {
      toast.error("Usuário não autenticado. Não foi possível excluir a transação.");
      return;
    }

    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", id)
      .eq("user_id", userId); // Garantir que o usuário só pode excluir suas próprias transações

    if (error) {
      toast.error("Erro ao excluir transação: " + error.message);
      console.error("Erro ao excluir transação:", error);
    } else {
      setTransactions((prevTransactions) => prevTransactions.filter((t) => t.id !== id));
      toast.success("Transação excluída com sucesso!");
    }
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
      <Header selectedCurrency={selectedCurrency} onCurrencyChange={setSelectedCurrency} userEmail={userEmail} />
      <main className="flex-grow container mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <MonthYearPicker
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            onDateChange={handleDateChange}
          />

          <ExportButtons
            allTransactions={transactions}
            filteredTransactions={filteredTransactions}
            totalIncome={totalIncome}
            totalExpense={totalExpense}
            balance={balance}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            selectedCurrency={selectedCurrency}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Receitas</CardTitle>
                <span className="text-green-500">▲</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(totalIncome, selectedCurrency)}
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
                  {formatCurrency(totalExpense, selectedCurrency)}
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
                  {formatCurrency(balance, selectedCurrency)}
                </div>
              </CardContent>
            </Card>
          </div>

          <TransactionCharts transactions={filteredTransactions} totalIncome={totalIncome} totalExpense={totalExpense} selectedCurrency={selectedCurrency} />

          <Card>
            <CardHeader>
              <CardTitle>Minhas Transações</CardTitle>
            </CardHeader>
            <CardContent className="max-h-[400px] overflow-y-auto">
              <TransactionList transactions={filteredTransactions} selectedCurrency={selectedCurrency} onDeleteTransaction={handleDeleteTransaction} />
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1 space-y-6">
          <TransactionTypeSwitcher
            currentType={selectedTransactionType}
            onTypeChange={setSelectedTransactionType}
          />
          <Card>
            <CardHeader>
              <CardTitle>Adicionar Nova Transação</CardTitle>
            </CardHeader>
            <CardContent>
              {userId ? (
                <AddTransactionForm onAddTransaction={handleAddTransaction} transactionType={selectedTransactionType} userId={userId} />
              ) : (
                <p className="text-center text-muted-foreground">Faça login para adicionar transações.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <MadeWithDyad />
    </div>
  );
};

export default Index;