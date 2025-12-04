import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes"; // Import useTheme

interface HeaderProps {
  selectedCurrency: string;
  onCurrencyChange: (currency: string) => void;
}

const Header: React.FC<HeaderProps> = ({ selectedCurrency, onCurrencyChange }) => {
  const { theme, setTheme } = useTheme();

  const currencies = [
    { value: "BRL", label: "R$ (BRL)" },
    { value: "USD", label: "$ (USD)" },
    { value: "EUR", label: "€ (EUR)" },
    { value: "GBP", label: "£ (GBP)" },
  ];

  return (
    <header className="bg-primary text-primary-foreground p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">Controle de Finanças</h1>
        <div className="flex items-center space-x-4">
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
          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {theme === "dark" ? <Sun className="h-[1.2rem] w-[1.2rem]" /> : <Moon className="h-[1.2rem] w-[1.2rem]" />}
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;