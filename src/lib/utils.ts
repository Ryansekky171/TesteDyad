import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = "BRL", locale: string = "pt-BR"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatAmountDisplay(amount: number, locale: string = "pt-BR"): string {
  if (isNaN(amount) || amount === 0) return "";
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true,
  }).format(amount);
}

export function exportToCsv(filename: string, headers: string[], data: (string | number)[][]) {
  const csvRows = [];
  csvRows.push(headers.join(',')); // Add headers

  for (const row of data) {
    csvRows.push(row.map(item => {
      // Basic CSV escaping: double quotes and wrap if contains comma or double quote
      const stringItem = String(item);
      if (stringItem.includes(',') || stringItem.includes('"') || stringItem.includes('\n')) {
        return `"${stringItem.replace(/"/g, '""')}"`;
      }
      return stringItem;
    }).join(','));
  }

  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) { // Feature detection for download attribute
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}