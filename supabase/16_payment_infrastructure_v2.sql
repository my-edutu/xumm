-- XUM AI Payment Infrastructure v2
-- Migration: 16_payment_infrastructure_v2.sql
-- Fixes critical gaps in company billing and payment idempotency

-- ============================================
-- 1. COMPANY WALLETS
-- ============================================

CREATE TABLE IF NOT EXISTS public.company_wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Balances
    available_balance DECIMAL(14,2) NOT NULL DEFAULT 0.00,
    pending_balance DECIMAL(14,2) NOT NULL DEFAULT 0.00,   -- Funds awaiting confirmation
    reserved_balance DECIMAL(14,2) NOT NULL DEFAULT 0.00,  -- Funds locked for active tasks
    
    -- Totals tracking
    total_deposited DECIMAL(14,2) NOT NULL DEFAULT 0.00,
    total_spent DECIMAL(14,2) NOT NULL DEFAULT 0.00,
    
    -- Config
    currency TEXT DEFAULT 'USD',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_company_wallets_id ON public.company_wallets(company_id);

-- ============================================
-- 2. PAYMENT IDEMPOTENCY (Events)
-- ============================================

CREATE TABLE IF NOT EXISTS public.payment_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Provider Info
    provider TEXT NOT NULL,                    -- 'stripe', 'paystack', 'flutterwave'
    provider_event_id TEXT NOT NULL,           -- The unique ID from the provider
    event_type TEXT NOT NULL,                  -- 'charge.success', 'checkout.completed'
    
    -- Processing Status
    status TEXT NOT NULL DEFAULT 'received',   -- 'received', 'processed', 'failed', 'skipped'
    processed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    
    -- Data
    raw_payload JSONB NOT NULL,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- Prevent duplicate processing of the same event
    UNIQUE(provider, provider_event_id)
);

-- ============================================
-- 3. FINANCIAL LEDGER (Consolidated)
-- ============================================

CREATE TABLE IF NOT EXISTS public.financial_ledger (
    id BIGSERIAL PRIMARY KEY,
    
    -- Party
    user_id UUID REFERENCES public.users(id), -- Nullable for platform-wide events
    
    -- Entry Details
    type TEXT NOT NULL,                        -- 'deposit', 'withdrawal', 'payout', 'fee', 'bonus'
    amount DECIMAL(14,2) NOT NULL,
    balance_after DECIMAL(14,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    
    -- References
    source_id UUID,                            -- ID of the related billing/withdrawal/task
    reference_idx TEXT,                        -- External ref
    
    description TEXT,
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================
-- 4. ATOMIC DEPOSIT FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_company_deposit(
    p_company_id UUID,
    p_amount DECIMAL,
    p_reference TEXT,
    p_provider TEXT DEFAULT 'manual'
)
RETURNS JSON AS $$
DECLARE
    v_new_balance DECIMAL;
    v_wallet_id UUID;
BEGIN
    -- 1. Ensure wallet exists (UPSERT)
    INSERT INTO public.company_wallets (company_id)
    VALUES (p_company_id)
    ON CONFLICT (company_id) DO NOTHING;

    -- 2. Update wallet balance with lock
    UPDATE public.company_wallets
    SET available_balance = available_balance + p_amount,
        total_deposited = total_deposited + p_amount,
        updated_at = now()
    WHERE company_id = p_company_id
    RETURNING available_balance, id INTO v_new_balance, v_wallet_id;

    -- 3. Record in ledger
    INSERT INTO public.financial_ledger (user_id, type, amount, balance_after, reference_idx, description)
    VALUES (p_company_id, 'deposit', p_amount, v_new_balance, p_reference, 'Deposit via ' || p_provider);

    -- 4. Update billing_requests if exists
    UPDATE public.billing_requests
    SET status = 'approved',
        updated_at = now(),
        reference_id = p_reference
    WHERE company_id = p_company_id AND amount = p_amount AND status = 'pending';

    RETURN json_build_object(
        'success', true,
        'new_balance', v_new_balance,
        'wallet_id', v_wallet_id
    );

EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
        'success', false,
        'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 5. RLS POLICIES
-- ============================================

ALTER TABLE public.company_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_ledger ENABLE ROW LEVEL SECURITY;

-- Admins: Full Access
CREATE POLICY "Admins full access to wallets" ON public.company_wallets FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins full access to events" ON public.payment_events FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins full access to ledger" ON public.financial_ledger FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- Companies: View Own Wallet/Ledger
CREATE POLICY "Companies view own wallet" ON public.company_wallets FOR SELECT USING (auth.uid() = company_id);
CREATE POLICY "Companies view own ledger" ON public.financial_ledger FOR SELECT USING (auth.uid() = user_id);

-- ============================================
-- 6. INITIALIZATION TRIGGERS
-- ============================================

-- Automatically create a wallet when a company user is created
CREATE OR REPLACE FUNCTION public.auto_create_company_wallet()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.role = 'company' THEN
        INSERT INTO public.company_wallets (company_id)
        VALUES (NEW.id)
        ON CONFLICT (company_id) DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_company_created
    AFTER INSERT ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.auto_create_company_wallet();

COMMENT ON TABLE public.company_wallets IS 'Stores balance and financial totals for company accounts';
COMMENT ON TABLE public.payment_events IS 'Prevents duplicate processing of payment gateway webhooks';
COMMENT ON TABLE public.financial_ledger IS 'Immutable record of all financial movements on the platform';
