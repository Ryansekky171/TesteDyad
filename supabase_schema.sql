CREATE TABLE public.transactions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  description text NULL,
  amount numeric NOT NULL,
  type text NOT NULL,
  category text NOT NULL,
  date timestamp with time zone NOT NULL,
  "paymentMethod" text NOT NULL,
  is_recurring boolean NULL DEFAULT false,
  recurring_id uuid NULL,
  CONSTRAINT transactions_pkey PRIMARY KEY (id),
  CONSTRAINT transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions."
ON public.transactions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions."
ON public.transactions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions."
ON public.transactions FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions."
ON public.transactions FOR DELETE
USING (auth.uid() = user_id);

-- New table for user-specific categories
CREATE TABLE public.categories (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  type text NOT NULL, -- 'income' or 'expense'
  CONSTRAINT categories_pkey PRIMARY KEY (id),
  CONSTRAINT categories_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT unique_category_per_user_type UNIQUE (user_id, name, type) -- Ensure unique category name per user and type
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own categories."
ON public.categories FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own categories."
ON public.categories FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories."
ON public.categories FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categories."
ON public.categories FOR DELETE
USING (auth.uid() = user_id);