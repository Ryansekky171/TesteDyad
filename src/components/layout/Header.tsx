"use client";

import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Menu, PlusCircle, FileText, BarChart2, ListChecks } from "lucide-react";
import { useTheme } from "next-themes";
import UserMenu from "./UserMenu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from '@/hooks/use-mobile';

interface HeaderProps {
  selectedCurrency: string;
  onCurrencyChange: (currency: string) => void;
  userEmail?: string;
  onNavigateToSection: (id: string) => void;
}

const Header: React.FC<HeaderProps> = ({ selectedCurrency, onCurrencyChange, userEmail, onNavigateToSection }) => {
  const { theme, setTheme } = useTheme();
  const isMobile = useIsMobile();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const currencies = [
    { value: "BRL", label: "R$ (BRL)" },
    { value: "USD", label: "$ (USD)" },
    { value: "EUR", label: "€ (EUR)" },
    { value: "GBP", label: "£ (GBP)" },
  ];

  const currencySelector = (
    <Select onValueChange={onCurrencyChange} value={selectedCurrency}>
      <SelectTrigger className="w-[120px] bg-primary-foreground text-primary">
        <SelectValue placeholder="Moeda" />
      </SelectTrigger>
      <SelectContent>
        {currencies.map((c) => (
          <SelectItem key={c.value} value={c.value}>
            {c.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  const themeToggle = (
    <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
      {theme === "dark" ? <Sun className="h-[1.2rem] w-[1.2rem]" /> : <Moon className="h-[1.2rem] w-[1.2rem]" />}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );

  const handleNavigationClick = (id: string) => {
    onNavigateToSection(id);
    // Aumenta o atraso para dar mais tempo para a rolagem antes de fechar o menu
    setTimeout(() => {
      setIsSheetOpen(false);
    }, 300); 
  };

  return (
    <header className="bg-primary text-primary-foreground p-4 shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        {isMobile && (
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Abrir Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[200px] sm:w-[240px] flex flex-col">
              {/* Removido p-4 do div principal e adicionado px-4 aos elementos internos */}
              <div className="flex flex-col gap-4 flex-grow">
                <h2 className="text-lg font-bold px-4">Opções</h2>
                <div className="flex flex-col gap-2 px-4">
                  {currencySelector}
                  {themeToggle}
                </div>
                <div className="flex flex-col gap-2 mt-4 border-t pt-4 px-4"> {/* Adicionado px-4 aqui também */}
                  <h2 className="text-lg font-bold">Navegação</h2>
                  <Button variant="ghost" className="w-full justify-start text-left" onClick={() => handleNavigationClick('add-transaction-section')}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Dashboard
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-left" onClick={() => handleNavigationClick('reports-section')}>
                    <FileText className="mr-2 h-4 w-4" /> Relatórios
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-left" onClick={() => handleNavigationClick('charts-section')}>
                    <BarChart2 className="mr-2 h-4 w-4" /> Gráficos
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-left" onClick={() => handleNavigationClick('transactions-list-section')}>
                    <ListChecks className="mr-2 h-4 w-4" /> Transações
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        )}

        <h1 className={`text-2xl font-bold ${isMobile ? 'flex-grow text-center' : ''}`}>Controle de Finanças</h1>

        <div className="flex items-center space-x-4">
          {!isMobile && (
            <>
              {currencySelector}
              {themeToggle}
            </>
          )}
          <UserMenu userEmail={userEmail} />
        </div>
      </div>
    </header>
  );
};

export default Header;