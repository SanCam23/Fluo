-- ==============================================================================
-- FLUO - Esquema Oficial de Base de Datos y Row Level Security (RLS) en Supabase
-- Tablas verificadas en producción: transactions, investments, source_accounts
-- ==============================================================================

-- 1. Tabla de Transacciones (transactions)
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL DEFAULT auth.uid(),
    type TEXT NOT NULL CHECK (type = ANY (ARRAY['income'::text, 'expense'::text])),
    amount NUMERIC NOT NULL,
    category TEXT NOT NULL,
    brand TEXT,
    date TIMESTAMPTZ NOT NULL DEFAULT now(),
    is_recurring BOOLEAN DEFAULT false,
    recurring_period TEXT CHECK (recurring_period = ANY (ARRAY['weekly'::text, 'biweekly'::text, 'monthly'::text, 'yearly'::text])),
    created_at TIMESTAMPTZ DEFAULT now(),
    source_id TEXT,
    CONSTRAINT transactions_pkey PRIMARY KEY (id),
    CONSTRAINT transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Índices de consulta rápida
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON public.transactions (user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_user_type ON public.transactions (user_id, type);

-- Permisos y Row Level Security (RLS)
GRANT ALL ON public.transactions TO authenticated;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own transactions" ON public.transactions;
CREATE POLICY "Users can view their own transactions"
    ON public.transactions FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own transactions" ON public.transactions;
CREATE POLICY "Users can insert their own transactions"
    ON public.transactions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own transactions" ON public.transactions;
CREATE POLICY "Users can update their own transactions"
    ON public.transactions FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own transactions" ON public.transactions;
CREATE POLICY "Users can delete their own transactions"
    ON public.transactions FOR DELETE
    USING (auth.uid() = user_id);


-- 2. Tabla de Inversiones y Activos (investments)
CREATE TABLE IF NOT EXISTS public.investments (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL DEFAULT auth.uid(),
    asset_type TEXT NOT NULL,
    name TEXT NOT NULL,
    symbol_or_isin TEXT NOT NULL,
    shares NUMERIC NOT NULL,
    average_buy_price NUMERIC NOT NULL,
    quote_ticker TEXT,
    last_price_update TIMESTAMPTZ DEFAULT now(),
    current_price NUMERIC,
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT investments_pkey PRIMARY KEY (id),
    CONSTRAINT investments_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Índices de consulta rápida
CREATE INDEX IF NOT EXISTS idx_investments_user_name ON public.investments (user_id, name ASC);
CREATE INDEX IF NOT EXISTS idx_investments_symbol ON public.investments (user_id, symbol_or_isin);

-- Permisos y Row Level Security (RLS)
GRANT ALL ON public.investments TO authenticated;
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own investments" ON public.investments;
CREATE POLICY "Users can view their own investments"
    ON public.investments FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own investments" ON public.investments;
CREATE POLICY "Users can insert their own investments"
    ON public.investments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own investments" ON public.investments;
CREATE POLICY "Users can update their own investments"
    ON public.investments FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own investments" ON public.investments;
CREATE POLICY "Users can delete their own investments"
    ON public.investments FOR DELETE
    USING (auth.uid() = user_id);


-- 3. Tabla de Fuentes y Cuentas Financieras (source_accounts)
CREATE TABLE IF NOT EXISTS public.source_accounts (
    id TEXT NOT NULL,
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type = ANY (ARRAY['bank'::text, 'cash'::text])),
    institution TEXT,
    brand_id TEXT,
    initial_balance NUMERIC DEFAULT 0.00,
    order_index INTEGER NOT NULL DEFAULT 0,
    color TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT source_accounts_pkey PRIMARY KEY (id),
    CONSTRAINT source_accounts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Índices de consulta rápida
CREATE INDEX IF NOT EXISTS idx_source_accounts_user_order ON public.source_accounts (user_id, order_index ASC);

-- Permisos y Row Level Security (RLS)
GRANT ALL ON public.source_accounts TO authenticated;
ALTER TABLE public.source_accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own source accounts" ON public.source_accounts;
CREATE POLICY "Users can view their own source accounts"
    ON public.source_accounts FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own source accounts" ON public.source_accounts;
CREATE POLICY "Users can insert their own source accounts"
    ON public.source_accounts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own source accounts" ON public.source_accounts;
CREATE POLICY "Users can update their own source accounts"
    ON public.source_accounts FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own source accounts" ON public.source_accounts;
CREATE POLICY "Users can delete their own source accounts"
    ON public.source_accounts FOR DELETE
    USING (auth.uid() = user_id);


-- 4. Función RPC para Eliminación Definitiva de Cuenta (GDPR / Derecho al Olvido)
CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    DELETE FROM public.transactions WHERE user_id = auth.uid();
    DELETE FROM public.investments WHERE user_id = auth.uid();
    DELETE FROM public.source_accounts WHERE user_id = auth.uid();
    DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;
