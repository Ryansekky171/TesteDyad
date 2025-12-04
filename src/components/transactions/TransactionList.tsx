import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Transaction, TransactionType, PaymentMethod } from "@/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatCurrency } from "@/lib/utils";

interface TransactionListProps {
  transactions: Transaction[];
  selectedCurrency: string;
  onDeleteTransaction: (id: string, scope: 'single' | 'all_future', recurringId?: string, transactionDate?: string) => void;
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions, selectedCurrency, onDeleteTransaction }) => {
  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Pagamento</TableHead>
            <TableHead className="text-right">Valor</TableHead>
            <TableHead className="text-center">Tipo</TableHead>
            <TableHead className="text-center">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                Nenhuma transação encontrada.
              </TableCell>
            </TableRow>
          ) : (
            transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell className="font-medium">
                  {format(new Date(transaction.date), "dd/MM/yyyy", { locale: ptBR })}
                </TableCell>
                <TableCell>{transaction.description}</TableCell>
                <TableCell>{transaction.category}</TableCell>
                <TableCell>{transaction.paymentMethod}</TableCell>
                <TableCell
                  className={`text-right font-semibold ${
                    transaction.type === "income" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {formatCurrency(transaction.amount, selectedCurrency)}
                </TableCell>
                <TableCell className="text-center">
                  <Badge
                    variant={transaction.type === "income" ? "default" : "destructive"}
                    className="capitalize"
                  >
                    {transaction.type === "income" ? "Receita" : "Despesa"}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Excluir Transação</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                        {transaction.is_recurring && transaction.recurring_id ? (
                          <AlertDialogDescription>
                            Esta é uma transação recorrente. Deseja excluir apenas esta instância ou todas as futuras transações desta série?
                          </AlertDialogDescription>
                        ) : (
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita. Isso excluirá permanentemente esta transação.
                          </AlertDialogDescription>
                        )}
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        {transaction.is_recurring && transaction.recurring_id ? (
                          <>
                            <AlertDialogAction onClick={() => onDeleteTransaction(transaction.id, 'single')}>
                              Excluir apenas esta
                            </AlertDialogAction>
                            <AlertDialogAction onClick={() => onDeleteTransaction(transaction.id, 'all_future', transaction.recurring_id, transaction.date)}>
                              Excluir todas as futuras
                            </AlertDialogAction>
                          </>
                        ) : (
                          <AlertDialogAction onClick={() => onDeleteTransaction(transaction.id, 'single')}>
                            Excluir
                          </AlertDialogAction>
                        )}
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default TransactionList;