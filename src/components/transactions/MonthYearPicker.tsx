import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

interface MonthYearPickerProps {
  selectedMonth: number; // 0-indexed (0 for January, 11 for December)
  selectedYear: number;
  onDateChange: (month: number, year: number) => void;
}

const MonthYearPicker: React.FC<MonthYearPickerProps> = ({
  selectedMonth,
  selectedYear,
  onDateChange,
}) => {
  const currentDate = new Date(selectedYear, selectedMonth, 1);

  const handlePreviousMonth = () => {
    const newDate = subMonths(currentDate, 1);
    onDateChange(newDate.getMonth(), newDate.getFullYear());
  };

  const handleNextMonth = () => {
    const newDate = addMonths(currentDate, 1);
    onDateChange(newDate.getMonth(), newDate.getFullYear());
  };

  return (
    <div className="flex items-center justify-between gap-4 mb-6 p-2 rounded-md border bg-card text-card-foreground">
      <Button variant="ghost" size="icon" onClick={handlePreviousMonth}>
        <ChevronLeft className="h-5 w-5" />
        <span className="sr-only">Mês Anterior</span>
      </Button>
      <div className="text-lg font-semibold">
        {format(currentDate, "MMMM 'de' yyyy", { locale: ptBR })}
      </div>
      <Button variant="ghost" size="icon" onClick={handleNextMonth}>
        <ChevronRight className="h-5 w-5" />
        <span className="sr-only">Próximo Mês</span>
      </Button>
    </div>
  );
};

export default MonthYearPicker;