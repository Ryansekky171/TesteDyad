import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Transaction, TransactionType } from "@/types";
import { toast } from "sonner";

const formSchema = z.object({
  description: z.string().min(1, "A descrição é obrigatória."),
  amount: z.coerce.number().min(0.01, "O valor deve ser positivo."),
  category: z.string().min(1, "A categoria é obrigatória."),
});

interface AddTransactionFormProps {
  onAddTransaction: (transaction: Omit<Transaction, "id" | "date">) => void;
  transactionType: TransactionType; // Nova prop para o tipo de transação
}

const AddTransactionForm: React.FC<AddTransactionFormProps> = ({
  onAddTransaction,
  transactionType, // Desestrutura a nova prop
}) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      amount: 0,
      category: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // Combina os valores do formulário com a prop transactionType
    onAddTransaction({ ...values, type: transactionType });
    form.reset();
    toast.success("Transação adicionada com sucesso!");
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Input placeholder="Aluguel, Salário, Compras..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* O campo de seleção de tipo foi removido daqui */}
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoria</FormLabel>
              <FormControl>
                <Input placeholder="Casa, Alimentação, Lazer..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          Adicionar Transação
        </Button>
      </form>
    </Form>
  );
};

export default AddTransactionForm;