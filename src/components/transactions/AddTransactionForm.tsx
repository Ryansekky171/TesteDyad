import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Transaction, TransactionType } from "@/types";
import { toast } from "sonner";

const formSchema = z.object({
  description: z.string().min(1, "A descrição é obrigatória."),
  amount: z.coerce.number().min(0.01, "O valor deve ser positivo."),
  category: z.string().min(1, "A categoria é obrigatória."),
});

interface AddTransactionFormProps {
  onAddTransaction: (transaction: Omit<Transaction, "id" | "date">) => void;
  transactionType: TransactionType;
}

const AddTransactionForm: React.FC<AddTransactionFormProps> = ({
  onAddTransaction,
  transactionType,
}) => {
  const [incomeCategories, setIncomeCategories] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem("incomeCategories");
      return stored ? JSON.parse(stored) : ["Salário", "Freela"];
    }
    return ["Salário", "Freela"];
  });
  const [expenseCategories, setExpenseCategories] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem("expenseCategories");
      return stored ? JSON.parse(stored) : ["Dívidas", "Conta", "Aluguel", "Compra", "Lazer", "Viagem"];
    }
    return ["Dívidas", "Conta", "Aluguel", "Compra", "Lazer", "Viagem"];
  });
  const [showNewCategoryDialog, setShowNewCategoryDialog] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem("incomeCategories", JSON.stringify(incomeCategories));
    }
  }, [incomeCategories]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem("expenseCategories", JSON.stringify(expenseCategories));
    }
  }, [expenseCategories]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      amount: 0,
      category: "",
    },
  });

  const currentCategories = transactionType === "income" ? incomeCategories : expenseCategories;

  const handleAddNewCategory = () => {
    if (newCategoryName.trim() === "") {
      toast.error("O nome da categoria não pode ser vazio.");
      return;
    }
    const categoryToAdd = newCategoryName.trim();
    if (currentCategories.includes(categoryToAdd)) {
      toast.error("Esta categoria já existe.");
      return;
    }

    if (transactionType === "income") {
      setIncomeCategories((prev) => [...prev, categoryToAdd]);
    } else {
      setExpenseCategories((prev) => [...prev, categoryToAdd]);
    }
    form.setValue("category", categoryToAdd);
    setNewCategoryName("");
    setShowNewCategoryDialog(false);
    toast.success(`Categoria '${categoryToAdd}' adicionada!`);
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
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
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoria</FormLabel>
              <Select
                onValueChange={(value) => {
                  if (value === "new-category") {
                    setShowNewCategoryDialog(true);
                  } else {
                    field.onChange(value);
                  }
                }}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {currentCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                  <SelectItem value="new-category">
                    <span className="font-semibold text-blue-500">Novo...</span>
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          Adicionar Transação
        </Button>
      </form>

      <Dialog open={showNewCategoryDialog} onOpenChange={setShowNewCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Nova Categoria</DialogTitle>
            <DialogDescription>
              Digite o nome da nova categoria para {transactionType === "income" ? "receitas" : "despesas"}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              id="new-category-name"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Nome da categoria"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewCategoryDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddNewCategory}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Form>
  );
};

export default AddTransactionForm;