import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i); // Last 5 years, current year, next 4 years

  const months = [
    { value: 0, label: "Janeiro" },
    { value: 1, label: "Fevereiro" },
    { value: 2, label: "Março" },
    { value: 3, label: "Abril" },
    { value: 4, label: "Maio" },
    { value: 5, label: "Junho" },
    { value: 6, label: "Julho" },
    { value: 7, label: "Agosto" },
    { value: 8, label: "Setembro" },
    { value: 9, label: "Outubro" },
    { value: 10, label: "Novembro" },
    { value: 11, label: "Dezembro" },
  ];

  return (
    <div className="flex gap-4 mb-6">
      <Select
        onValueChange={(value) => onDateChange(parseInt(value), selectedYear)}
        value={selectedMonth.toString()}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Mês" />
        </SelectTrigger>
        <SelectContent>
          {months.map((month) => (
            <SelectItem key={month.value} value={month.value.toString()}>
              {month.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        onValueChange={(value) => onDateChange(selectedMonth, parseInt(value))}
        value={selectedYear.toString()}
      >
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="Ano" />
        </SelectTrigger>
        <SelectContent>
          {years.map((year) => (
            <SelectItem key={year} value={year.toString()}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default MonthYearPicker;