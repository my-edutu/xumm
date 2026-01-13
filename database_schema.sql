-- XUM AI Enterprise Database Schema
-- Run this in your Supabase SQL Editor to set up the data structure

-- 1. COMPANIES TABLE
-- Stores profile data for each business entity
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    industry TEXT,
    timezone TEXT DEFAULT 'UTC',
    balance DECIMAL(12,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. DATASETS (PROJECTS) TABLE
-- Stores submissions from companies for review by admin
CREATE TABLE IF NOT EXISTS public.datasets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    data_type TEXT NOT NULL, -- e.g., 'NLP', 'Image', 'Audio'
    target_amount INTEGER NOT NULL,
    bid_per_item DECIMAL(10,4) NOT NULL,
    total_cost DECIMAL(12,2), -- Calculated field (bid * amount + fees)
    status TEXT DEFAULT 'pending_review', -- 'pending_review', 'approved', 'active', 'completed', 'rejected'
    admin_notes TEXT,
    final_price_per_item DECIMAL(10,4), -- Set by admin during review
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TRANSACTIONS TABLE
-- Tracks money movement (deposits, project payments)
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL,
    type TEXT NOT NULL, -- 'deposit', 'payment', 'refund'
    status TEXT DEFAULT 'completed', -- 'pending', 'completed', 'failed'
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. NOTIFICATIONS TABLE
-- System messages from Admin to Company
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create Policies (Companies can only see their own data)
CREATE POLICY "Users can view their own company" ON public.companies FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can edit their own company" ON public.companies FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own datasets" ON public.datasets FOR SELECT USING (company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid()));
CREATE POLICY "Users can create their own datasets" ON public.datasets FOR INSERT WITH CHECK (company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid()));

CREATE POLICY "Users can view their own transactions" ON public.transactions FOR SELECT USING (company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid()));

CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING (company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid()));
