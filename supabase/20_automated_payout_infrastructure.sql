-- XUM AI Automated Payout Infrastructure
-- Migration: 20_automated_payout_infrastructure.sql

-- ============================================
-- 1. PAYOUT BATCHES
-- ============================================

CREATE TABLE IF NOT EXISTS public.payout_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'processing', 'completed', 'failed')),
    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    payout_count INTEGER NOT NULL DEFAULT 0,
    provider TEXT NOT NULL,           -- 'paystack', 'stripe', 'base'
    provider_batch_id TEXT,           -- Remote reference from payout API
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID REFERENCES public.users(id)
);

-- ============================================
-- 2. BATCH CREATION logic
-- ============================================

CREATE OR REPLACE FUNCTION public.create_payout_batch(
    p_payout_ids UUID[],
    p_provider TEXT
)
RETURNS UUID AS $$
DECLARE
    v_batch_id UUID;
    v_total DECIMAL;
    v_count INTEGER;
BEGIN
    -- 1. Create batch record
    INSERT INTO public.payout_batches (provider, created_by)
    VALUES (p_provider, auth.uid())
    RETURNING id INTO v_batch_id;

    -- 2. Assign payouts to batch and calculate totals
    UPDATE public.worker_payout_queue
    SET payout_batch_id = v_batch_id, status = 'approved'
    WHERE id = ANY(p_payout_ids) AND status = 'pending';

    SELECT SUM(amount), COUNT(*) INTO v_total, v_count
    FROM public.worker_payout_queue
    WHERE payout_batch_id = v_batch_id;

    UPDATE public.payout_batches
    SET total_amount = v_total, payout_count = v_count
    WHERE id = v_batch_id;

    RETURN v_batch_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 3. BATCH SETTLEMENT Logic
-- ============================================

CREATE OR REPLACE FUNCTION public.finalize_payout_batch(
    p_batch_id UUID,
    p_success BOOLEAN,
    p_provider_ref TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_batch RECORD;
    v_payout RECORD;
BEGIN
    SELECT * INTO v_batch FROM public.payout_batches WHERE id = p_batch_id FOR UPDATE;
    
    IF v_batch.status = 'completed' THEN
        RETURN json_build_object('error', 'Batch already finalized');
    END IF;

    IF NOT p_success THEN
        UPDATE public.payout_batches SET status = 'failed' WHERE id = p_batch_id;
        UPDATE public.worker_payout_queue SET status = 'failed' WHERE payout_batch_id = p_batch_id;
        RETURN json_build_object('success', false, 'status', 'failed');
    END IF;

    -- SUCCESS FLOW
    -- 1. Mark batch as completed
    UPDATE public.payout_batches 
    SET status = 'completed', 
        processed_at = now(),
        provider_batch_id = p_provider_ref
    WHERE id = p_batch_id;

    -- 2. Process each payout in the batch
    FOR v_payout IN (SELECT * FROM public.worker_payout_queue WHERE payout_batch_id = p_batch_id) LOOP
        -- Increment user balance (workers get their money)
        UPDATE public.users 
        SET balance = balance + v_payout.amount,
            total_earned = total_earned + v_payout.amount
        WHERE id = v_payout.user_id;

        -- Record in Ledger
        INSERT INTO public.financial_ledger (
            company_id, -- NULL for worker payouts (or use a platform system ID)
            user_id,
            amount,
            type,
            reference,
            description
        ) VALUES (
            NULL,
            v_payout.user_id,
            v_payout.amount,
            'revenue_share',
            'PAY-' || v_payout.id,
            'Payout share from dataset sale'
        );

        -- Mark payout as paid
        UPDATE public.worker_payout_queue 
        SET status = 'paid', paid_at = now() 
        WHERE id = v_payout.id;
    END LOOP;

    RETURN json_build_object('success', true, 'status', 'completed', 'total_paid', v_batch.total_amount);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 4. RLS
-- ============================================

ALTER TABLE public.payout_batches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins full access to payout batches" ON public.payout_batches 
    FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

COMMENT ON TABLE public.payout_batches IS 'Batches for bulk worker payouts via provider APIs';
