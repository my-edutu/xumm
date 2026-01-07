-- XUM Dataset Monetization System
-- This migration handles the packaging, sale, and distribution of collected data.

-- 1. Dataset Batches (The product)
CREATE TABLE IF NOT EXISTS public.dataset_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_name TEXT NOT NULL,
    data_type TEXT CHECK (data_type IN ('text', 'voice', 'image', 'video')),
    sample_count INTEGER DEFAULT 0,
    source_project_id UUID REFERENCES public.linguasence_projects(id),
    base_price DECIMAL(12,2) NOT NULL,
    status TEXT DEFAULT 'ready', -- 'ready', 'in_review', 'sold', 'archived'
    metadata JSONB DEFAULT '{}', -- { "languages": ["sw"], "total_duration": "..." }
    manifest_url TEXT, -- Link to the actual file (S3/Hetzner)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Company Access/Assignments
CREATE TABLE IF NOT EXISTS public.dataset_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID REFERENCES public.dataset_batches(id) ON DELETE CASCADE,
    company_id UUID REFERENCES public.users(id), -- The buyer
    purchase_price DECIMAL(12,2) NOT NULL,
    access_token TEXT UNIQUE, -- For API-based access to the dataset
    expiration_date TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'active', -- 'active', 'revoked'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Revenue Distribution
-- Tracks how much of the sale goes to workers vs platform
CREATE TABLE IF NOT EXISTS public.dataset_revenue_splits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID REFERENCES public.dataset_assignments(id) ON DELETE CASCADE,
    total_amount DECIMAL(12,2) NOT NULL,
    platform_fee DECIMAL(12,2) NOT NULL,
    worker_pool_amount DECIMAL(12,2) NOT NULL,
    is_distributed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.dataset_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dataset_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dataset_revenue_splits ENABLE ROW LEVEL SECURITY;

-- Admins see everything
CREATE POLICY "Admins full access to batches" ON public.dataset_batches 
    FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- Companies see batches they've bought
CREATE POLICY "Companies view bought batches" ON public.dataset_batches
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.dataset_assignments 
            WHERE batch_id = dataset_batches.id AND company_id = auth.uid()
        )
    );

-- Companies view their own assignments
CREATE POLICY "Companies view own assignments" ON public.dataset_assignments
    FOR SELECT USING (company_id = auth.uid());

-- Functions

-- 1. Create a batch from verified responses
CREATE OR REPLACE FUNCTION public.create_dataset_batch(
    p_name TEXT,
    p_project_id UUID,
    p_price DECIMAL
) RETURNS UUID AS $$
DECLARE
    v_batch_id UUID;
    v_count INTEGER;
    v_type TEXT;
BEGIN
    -- Get project info
    SELECT data_type INTO v_type FROM public.linguasence_projects WHERE id = p_project_id;
    
    -- Count verified responses for this project not already batched
    -- (Actually for now we just count them, in a real system we'd mark them as batched)
    SELECT COUNT(*) INTO v_count 
    FROM public.linguasence_responses 
    WHERE task_id IN (SELECT id FROM public.linguasence_tasks WHERE project_id = p_project_id)
      AND consensus_status = 'verified';

    INSERT INTO public.dataset_batches (batch_name, data_type, sample_count, source_project_id, base_price)
    VALUES (p_name, v_type, v_count, p_project_id, p_price)
    RETURNING id INTO v_batch_id;

    RETURN v_batch_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Assign batch to company (The Sale)
CREATE OR REPLACE FUNCTION public.assign_dataset_to_company(
    p_batch_id UUID,
    p_company_id UUID,
    p_price DECIMAL
) RETURNS UUID AS $$
DECLARE
    v_assign_id UUID;
    v_platform_fee DECIMAL := p_price * 0.20; -- 20% platform fee
BEGIN
    -- 1. Create assignment
    INSERT INTO public.dataset_assignments (batch_id, company_id, purchase_price)
    VALUES (p_batch_id, p_company_id, p_price)
    RETURNING id INTO v_assign_id;

    -- 2. Create revenue split record
    INSERT INTO public.dataset_revenue_splits (assignment_id, total_amount, platform_fee, worker_pool_amount)
    VALUES (v_assign_id, p_price, v_platform_fee, p_price - v_platform_fee);

    -- 3. Update batch status
    UPDATE public.dataset_batches SET status = 'sold' WHERE id = p_batch_id;

    RETURN v_assign_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
