-- XUM AI Worker Revenue Distribution
-- Migration: 17_worker_revenue_distribution.sql
-- Implements the logic to pay workers when datasets are sold

-- ============================================
-- 1. WORKER PAYOUT QUEUE
-- ============================================

CREATE TABLE IF NOT EXISTS public.worker_payout_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Source of funds
    revenue_split_id UUID REFERENCES public.dataset_revenue_splits(id) ON DELETE CASCADE,
    
    -- Recipient
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Financials
    amount DECIMAL(12,2) NOT NULL,
    contribution_count INTEGER NOT NULL,        -- Number of verified samples by this worker in this batch
    contribution_weight DECIMAL(5,4) NOT NULL,    -- Their % share of the worker pool
    
    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'failed')),
    payout_batch_id UUID,                         -- Link to automated payout batch
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    paid_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_worker_payout_user ON public.worker_payout_queue(user_id, status);
CREATE INDEX IF NOT EXISTS idx_worker_payout_split ON public.worker_payout_queue(revenue_split_id);

-- ============================================
-- 2. DISTRIBUTION LOGIC
-- ============================================

CREATE OR REPLACE FUNCTION public.distribute_dataset_revenue(p_split_id UUID)
RETURNS JSON AS $$
DECLARE
    v_worker_pool DECIMAL;
    v_assignment_id UUID;
    v_batch_id UUID;
    v_project_id UUID;
    v_total_samples INTEGER;
    v_worker_record RECORD;
    v_payout_count INTEGER := 0;
BEGIN
    -- 1. Get split details
    SELECT rs.worker_pool_amount, rs.assignment_id, da.batch_id, db.source_project_id
    INTO v_worker_pool, v_assignment_id, v_batch_id, v_project_id
    FROM public.dataset_revenue_splits rs
    JOIN public.dataset_assignments da ON da.id = rs.assignment_id
    JOIN public.dataset_batches db ON db.id = da.batch_id
    WHERE rs.id = p_split_id;

    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Revenue split record not found');
    END IF;

    -- 2. Count total verified samples for this project (that were included in the batch)
    -- For now we assume the batch includes ALL verified samples for the project at time of creation
    SELECT COUNT(*) INTO v_total_samples
    FROM public.linguasence_responses r
    JOIN public.linguasence_tasks t ON t.id = r.task_id
    WHERE t.project_id = v_project_id 
      AND r.consensus_status = 'verified';

    IF v_total_samples = 0 THEN
        RETURN json_build_object('success', false, 'error', 'No verified samples found for distribution');
    END IF;

    -- 3. Loop through contributors and create payout queue entries
    FOR v_worker_record IN (
        SELECT 
            r.user_id, 
            COUNT(*) as worker_samples
        FROM public.linguasence_responses r
        JOIN public.linguasence_tasks t ON t.id = r.task_id
        WHERE t.project_id = v_project_id 
          AND r.consensus_status = 'verified'
        GROUP BY r.user_id
    ) LOOP
        INSERT INTO public.worker_payout_queue (
            revenue_split_id,
            user_id,
            amount,
            contribution_count,
            contribution_weight
        ) VALUES (
            p_split_id,
            v_worker_record.user_id,
            (v_worker_record.worker_samples::decimal / v_total_samples) * v_worker_pool,
            v_worker_record.worker_samples,
            (v_worker_record.worker_samples::decimal / v_total_samples)
        );
        
        v_payout_count := v_payout_count + 1;
    END LOOP;

    -- 4. Mark split as distributed
    UPDATE public.dataset_revenue_splits 
    SET is_distributed = true 
    WHERE id = p_split_id;

    RETURN json_build_object(
        'success', true, 
        'workers_queued', v_payout_count, 
        'total_distributed', v_worker_pool
    );

EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 3. RLS & PERMISSIONS
-- ============================================

ALTER TABLE public.worker_payout_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins full access to payout queue" ON public.worker_payout_queue 
    FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users view own pending payouts" ON public.worker_payout_queue
    FOR SELECT USING (auth.uid() = user_id);

-- ============================================
-- 4. AUTOMATION TRIGGER
-- ============================================

-- Automatically queue distribution when a split is created
CREATE OR REPLACE FUNCTION public.trigger_revenue_distribution()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM public.distribute_dataset_revenue(NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_revenue_split_created
    AFTER INSERT ON public.dataset_revenue_splits
    FOR EACH ROW EXECUTE FUNCTION public.trigger_revenue_distribution();

COMMENT ON TABLE public.worker_payout_queue IS 'Queue of pending payments to workers from dataset sales';
COMMENT ON FUNCTION distribute_dataset_revenue IS 'Calculates and queues payments for all contributors of a sold dataset';
