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
  FormDescription,
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
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn, formatAmountDisplay } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { format, addMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Transaction, TransactionType, PaymentMethod } from "@/types";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/lib/supabase"; // Importar supabase

const formSchema = z.object({
  category: z.string().min(1, "A categoria é obrigatória."),
  amount: z.coerce.number().min(0.01, "O valor total deve ser positivo."),
  installmentAmount: z.coerce.number().optional(),
  date: z.date({ required_error: "A data é obrigatória." }),
  paymentMethod: z.enum(["Débito", "Crédito", "Boleto", "Pix", "Dinheiro"], {
    required_error: "O método de pagamento é obrigatório.",
  }),
  isInstallment: z.boolean().optional(),
  numberOfInstallments: z.coerce.number().min(2, "Mínimo de 2 parcelas.").optional(),
  description: z.string().optional().default(""),
  isRecurring: z.boolean().optional(),
}).superRefine((data, ctx) => {
  if (data.paymentMethod === "Crédito" && data.isInstallment && data.isInstallment !== undefined) {
    if (!data.numberOfInstallments || data.numberOfInstallments < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Número de parcelas é obrigatório e deve ser no mínimo 2 para parcelamento.",
        path: ["numberOfInstallments"],
      });
    }
    if (data.installmentAmount !== undefined && data.installmentAmount !== null) {
      if (data.installmentAmount <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "O valor da parcela deve ser positivo se informado.",
          path: ["installmentAmount"],
        });
      }
      if (data.installmentAmount > data.amount) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "O valor da parcela não pode ser maior que o valor total.",
          path: ["installmentAmount"],
        });
      }
    }
  }
});

interface AddTransactionFormProps {
  onAddTransaction: (transaction: Omit<Transaction, "id"> | Omit<Transaction, "id">[]) => void;
  transactionType: TransactionType;
  userId: string;
}

const AddTransactionForm: React.FC<AddTransactionFormProps> = ({
  onAddTransaction,
  transactionType,
  userId,
}) => {
  const [categories, setCategories] = useState<string[]>([]); // Gerenciar categorias no estado
  const [showNewCategoryDialog, setShowNewCategoryDialog] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: "",
      amount: 0,
      installmentAmount: undefined,
      description: "",
      date: new Date(),
      paymentMethod: "Débito",
      isInstallment: false,
      numberOfInstallments: 2,
      isRecurring: false,
    },
  });

  // Fetch categories from Supabase
  useEffect(() => {
    const fetchCategories = async () => {
      if (!userId) {
        setCategories([]);
        return;
      }
      const { data, error } = await supabase
        .from("categories")
        .select("name")
        .eq("user_id", userId)
        .eq("type", transactionType);

      if (error) {
        toast.error("Erro ao carregar categorias: " + error.message);
        console.error("Erro ao carregar categorias:", error);
      } else if (data) {
        setCategories(data.map((cat) => cat.name));
      }
    };

    fetchCategories();
  }, [userId, transactionType]); // Recarrega quando o usuário ou tipo de transação muda

  const paymentMethod = form.watch("paymentMethod");
  const isInstallmentChecked = form.watch("isInstallment");
  const isRecurringChecked = form.watch("isRecurring");
  const totalAmount = form.watch("amount");
  const numberOfInstallments = form.watch("numberOfInstallments");

  useEffect(() => {
    if (transactionType === "income") {
      form.setValue("isInstallment", false);
      form.setValue("numberOfInstallments", 2);
      form.setValue("installmentAmount", undefined);
    }
    if (paymentMethod !== "Crédito") {
      form.setValue("isInstallment", false);
      form.setValue("numberOfInstallments", 2);
      form.setValue("installmentAmount", undefined);
    }
  }, [transactionType, paymentMethod, form]);

  const handleAddNewCategory = async () => {
    if (newCategoryName.trim() === "") {
      toast.error("O nome da categoria não pode ser vazio.");
      return;
    }
    const categoryToAdd = newCategoryName.trim();
    if (categories.includes(categoryToAdd)) {
      toast.error("Esta categoria já existe.");
      return;
    }

    if (!userId) {
      toast.error("Usuário não autenticado. Não foi possível adicionar a categoria.");
      return;
    }

    const { data, error } = await supabase
      .from("categories")
      .insert({ user_id: userId, name: categoryToAdd, type: transactionType })
      .select();

    if (error) {
      toast.error("Erro ao adicionar categoria: " + error.message);
      console.error("Erro ao adicionar categoria:", error);
    } else if (data) {
      setCategories((prev) => [...prev, categoryToAdd]);
      form.setValue("category", categoryToAdd);
      setNewCategoryName("");
      setShowNewCategoryDialog(false);
      toast.success(`Categoria '${categoryToAdd}' adicionada!`);
    }
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const transactionsToCreate: Omit<Transaction, "id">[] = [];
    const baseTransaction: Omit<Transaction, "id"> = {
      user_id: userId,
      description: values.description || '',
      amount: values.amount,
      type: transactionType,
      category: values.category,
      date: values.date.toISOString(),
      paymentMethod: values.paymentMethod,
    };

    if (transactionType === "expense" && values.paymentMethod === "Crédito" && values.isInstallment && values.numberOfInstallments) {
      let finalInstallmentAmount = (values.installmentAmount && values.installmentAmount > 0)
        ? values.installmentAmount
        : (values.amount / values.numberOfInstallments);

      finalInstallmentAmount = Math.round(finalInstallmentAmount * 100) / 100;

      if (finalInstallmentAmount <= 0) {
        toast.error("O valor da parcela calculado é inválido. Verifique o valor total e o número de parcelas.");
        return;
      }

      const recurringId = uuidv4();
      for (let i = 0; i < values.numberOfInstallments; i++) {
        const installmentDate = addMonths(values.date, i);
        const installmentDescription = `${values.description || ''} (Parcela ${i + 1}/${values.numberOfInstallments})`;
        transactionsToCreate.push({
          ...baseTransaction,
          description: installmentDescription,
          amount: finalInstallmentAmount,
          date: installmentDate.toISOString(),
          is_recurring: true,
          recurring_id: recurringId,
        });
      }
      toast.success(`${values.numberOfInstallments} parcelas adicionadas com sucesso!`);
    } else if (values.isRecurring) {
      const recurringId = uuidv4();
      for (let i = 0; i < 12; i++) {
        const recurringDate = addMonths(values.date, i);
        transactionsToCreate.push({
          ...baseTransaction,
          date: recurringDate.toISOString(),
          is_recurring: true,
          recurring_id: recurringId,
        });
      }
      toast.success(`Transação adicionada e repetida para os próximos 12 meses!`);
    } else {
      transactionsToCreate.push(baseTransaction);
      toast.success("Transação adicionada com sucesso!");
    }

    onAddTransaction(transactionsToCreate);
    form.reset({
      category: "",
      amount: 0,
      installmentAmount: undefined,
      description: "",
      date: new Date(),
      paymentMethod: "Débito",
      isInstallment: false,
      numberOfInstallments: 2,
      isRecurring: false,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Category Field */}
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
                  {categories.map((category) => (
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

        {/* Total Amount Field */}
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor Total da Compra</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  value={field.value === 0 ? "" : formatAmountDisplay(field.value)}
                  onChange={(e) => {
                    const rawValue = e.target.value;
                    const cleanedValue = rawValue.replace(/\D/g, '');
                    
                    if (cleanedValue === '') {
                      field.onChange(0);
                    } else {
                      const cents = parseInt(cleanedValue, 10);
                      field.onChange(cents / 100);
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Payment Method Field */}
        <FormField
          control={form.control}
          name="paymentMethod"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Método de Pagamento</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o método de pagamento" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Débito">Débito</SelectItem>
                  <SelectItem value="Crédito">Crédito</SelectItem>
                  <SelectItem value="Boleto">Boleto</SelectItem>
                  <SelectItem value="Pix">Pix</SelectItem>
                  <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Installment Checkbox (conditionally rendered for expense and Credit) */}
        {transactionType === "expense" && paymentMethod === "Crédito" && (
          <FormField
            control={form.control}
            name="isInstallment"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Parcelar</FormLabel>
                  <FormDescription>
                    Marque para adicionar esta transação em parcelas.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        )}

        {/* Number of Installments Field (conditionally rendered) */}
        {transactionType === "expense" && paymentMethod === "Crédito" && isInstallmentChecked && (
          <FormField
            control={form.control}
            name="numberOfInstallments"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número de Parcelas</FormLabel>
                <FormControl>
                  <Input type="number" min="2" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Installment Amount Field (NEW, conditionally rendered) */}
        {transactionType === "expense" && paymentMethod === "Crédito" && isInstallmentChecked && numberOfInstallments && (
          <FormField
            control={form.control}
            name="installmentAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor da Parcela (opcional)</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder={formatAmountDisplay(totalAmount / numberOfInstallments)}
                    value={field.value === undefined || field.value === 0 ? "" : formatAmountDisplay(field.value)}
                    onChange={(e) => {
                      const rawValue = e.target.value;
                      const cleanedValue = rawValue.replace(/\D/g, '');
                      
                      if (cleanedValue === '') {
                        field.onChange(undefined);
                      } else {
                        const cents = parseInt(cleanedValue, 10);
                        field.onChange(cents / 100);
                      }
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Se vazio, será calculado: {formatAmountDisplay(Math.round((totalAmount / numberOfInstallments) * 100) / 100)}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Recurring Checkbox (conditionally rendered if not installment) */}
        {!(transactionType === "expense" && paymentMethod === "Crédito" && isInstallmentChecked) && (
          <FormField
            control={form.control}
            name="isRecurring"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Repetir todo mês</FormLabel>
                  <FormDescription>
                    Marque para adicionar esta transação para os próximos 12 meses.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        )}

        {/* Date Field */}
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Data</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP", { locale: ptBR })
                      ) : (
                        <span>Selecione uma data</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description Field (last) */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição (opcional)</FormLabel>
              <FormControl>
                <Input placeholder="Aluguel, Salário, Compras..." {...field} />
              </FormControl>
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