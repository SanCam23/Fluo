-- ==============================================================================
-- FLUO - Esquema Oficial de Base de Datos y Row Level Security (RLS) en Supabase
-- ==============================================================================

-- 1. Tabla de Transacciones (transactions)
CREATE TABLE IF NOT EXISTS public.transactions (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL,
    pillar TEXT NOT NULL CHECK (pillar IN ('income', 'expense', 'invest')),
    category_id TEXT NOT NULL,
    brand_id TEXT,
    concept TEXT NOT NULL,
    date TIMESTAMPTZ NOT NULL,
    is_recurring BOOLEAN DEFAULT FALSE,
    is_recurring_generated BOOLEAN DEFAULT FALSE,
    recurrence_id TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices de consulta rápida
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON public.transactions (user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_user_pillar ON public.transactions (user_id, pillar);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para Transactions
CREATE POLICY "Users can view their own transactions"
    ON public.transactions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions"
    ON public.transactions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions"
    ON public.transactions FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions"
    ON public.transactions FOR DELETE
    USING (auth.uid() = user_id);


-- 2. Tabla de Inversiones y Activos (investments)
CREATE TABLE IF NOT EXISTS public.investments (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    identifier TEXT NOT NULL,
    ticker TEXT,
    isin TEXT,
    asset_type TEXT NOT NULL CHECK (asset_type IN ('stock', 'index_fund', 'etf', 'crypto', 'fixed_income', 'deposit')),
    shares NUMERIC(16, 8) NOT NULL,
    average_buy_price NUMERIC(12, 4) NOT NULL,
    current_price NUMERIC(12, 4) NOT NULL,
    currency TEXT DEFAULT 'EUR' CHECK (currency IN ('EUR', 'USD')),
    platform TEXT,
    brand_id TEXT,
    last_updated TEXT DEFAULT 'Ahora mismo',
    change_24h NUMERIC(8, 4),
    initial_fee NUMERIC(10, 2),
    acquisition_date TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices de consulta rápida
CREATE INDEX IF NOT EXISTS idx_investments_user_name ON public.investments (user_id, name ASC);
CREATE INDEX IF NOT EXISTS idx_investments_identifier ON public.investments (user_id, identifier);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para Investments
CREATE POLICY "Users can view their own investments"
    ON public.investments FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own investments"
    ON public.investments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own investments"
    ON public.investments FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own investments"
    ON public.investments FOR DELETE
    USING (auth.uid() = user_id);
