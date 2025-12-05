"use client";

import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Menu } from "lucide-react"; // Adicionado Menu icon
import { useTheme } from "next-themes";
import UserMenu from "./UserMenu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"; // Adicionado Sheet components
import { useIsMobile } from '@/hooks/use-mobile'; // Import useIsMobile

interface HeaderProps {
  selectedCurrency: string;
  onCurrencyChange: (currency: string) => void;
  userEmail?: string;
}

const Header: React.FC<HeaderProps> = ({ selectedCurrency, onCurrencyChange, userEmail }) => {
  const { theme, setTheme } = useTheme();
  const isMobile = useIsMobile(); // Use o hook para detectar mobile

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

  return (
    <header className="bg-primary text-primary-foreground p-4 shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        {isMobile && (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Abrir Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[200px] sm:w-[240px]">
              <div className="flex flex-col gap-4 p-4">
                <h2 className="text-lg font-bold">Opções</h2>
                <div className="flex flex-col gap-2">
                  {currencySelector}
                  {themeToggle}
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