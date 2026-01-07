-- XUM AI Multi-Currency Support
-- Migration: 19_multi_currency_support.sql

-- ============================================
-- 1. EXCHANGE RATES TRACKING
-- ============================================

CREATE TABLE IF NOT EXISTS public.exchange_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    base_currency TEXT NOT NULL DEFAULT 'USD',
    target_currency TEXT NOT NULL,          -- e.g., 'NGN', 'GHS', 'KES', 'ZAR'
    rate DECIMAL(18,6) NOT NULL,            -- How much target currency per 1 unit of base
    provider TEXT DEFAULT 'manual',        -- 'fixer.io', 'openexchangerates', etc.
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_currency_pair ON public.exchange_rates(base_currency, target_currency);

-- Seed some initial rates (approximate)
INSERT INTO public.exchange_rates (target_currency, rate) VALUES 
('NGN', 1500.00),
('GHS', 14.50),
('KES', 130.00),
('ZAR', 18.20),
('EUR', 0.92),
('GBP', 0.79)
ON CONFLICT (base_currency, target_currency) DO UPDATE SET rate = EXCLUDED.rate, updated_at = now();

-- ============================================
-- 2. CONVERSION FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION public.convert_currency(
    p_amount DECIMAL,
    p_from TEXT,
    p_to TEXT
)
RETURNS DECIMAL AS $$
DECLARE
    v_rate_from DECIMAL;
    v_rate_to DECIMAL;
BEGIN
    IF p_from = p_to THEN
        RETURN p_amount;
    END IF;

    -- Get rate relative to USD
    IF p_from = 'USD' THEN
        SELECT rate INTO v_rate_to FROM public.exchange_rates WHERE target_currency = p_to;
        RETURN p_amount * v_rate_to;
    ELSIF p_to = 'USD' THEN
        SELECT rate INTO v_rate_from FROM public.exchange_rates WHERE target_currency = p_from;
        RETURN p_amount / v_rate_from;
    ELSE
        -- Indirect conversion (A -> USD -> B)
        SELECT rate INTO v_rate_from FROM public.exchange_rates WHERE target_currency = p_from;
        SELECT rate INTO v_rate_to FROM public.exchange_rates WHERE target_currency = p_to;
        RETURN (p_amount / v_rate_from) * v_rate_to;
    END IF;

EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- 3. AUDITABLE RATE UPDATES
-- ============================================

CREATE OR REPLACE FUNCTION public.admin_update_exchange_rate(
    p_currency TEXT,
    p_new_rate DECIMAL
)
RETURNS VOID AS $$
BEGIN
    -- Verify Admin
    IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin') THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    INSERT INTO public.exchange_rates (target_currency, rate)
    VALUES (p_currency, p_new_rate)
    ON CONFLICT (base_currency, target_currency) 
    DO UPDATE SET rate = EXCLUDED.rate, updated_at = now();

    -- Log action
    INSERT INTO public.admin_action_log (admin_id, action_type, entity_type, entity_id, description)
    VALUES (auth.uid(), 'UPDATE_RATE', 'exchange_rate', p_currency, 'Updated ' || p_currency || ' rate to ' || p_new_rate);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 4. RLS
-- ============================================

ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to exchange rates" 
ON public.exchange_rates FOR SELECT TO authenticated USING (true);

COMMENT ON TABLE public.exchange_rates IS 'Global exchange rates for multi-currency UI support and withdrawal calculations';
