-- XUM AI Core Schema
-- Version: 2.1 (Robust Edition)

-- Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'contributor',
  level INTEGER DEFAULT 1,
  current_xp INTEGER DEFAULT 0,
  target_xp INTEGER DEFAULT 100,
  trust_score DECIMAL(3,1) DEFAULT 5.0, 
  balance DECIMAL(12,2) DEFAULT 0.00,
  total_earned DECIMAL(12,2) DEFAULT 0.00,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT valid_role CHECK (role IN ('contributor', 'company', 'admin'))
);

-- 2. Companies Table
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    industry TEXT,
    website TEXT,
    logo_url TEXT,
    timezone TEXT DEFAULT 'UTC',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Company Wallets
CREATE TABLE IF NOT EXISTS public.company_wallets (
    company_id UUID PRIMARY KEY REFERENCES public.companies(id) ON DELETE CASCADE,
    available_balance DECIMAL(15,2) DEFAULT 0.00,
    pending_balance DECIMAL(15,2) DEFAULT 0.00,
    total_deposited DECIMAL(15,2) DEFAULT 0.00,
    total_spent DECIMAL(15,2) DEFAULT 0.00,
    currency VARCHAR(10) DEFAULT 'USD',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tasks (Projects) - With migration logic
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  created_by UUID REFERENCES public.users(id),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  task_type VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending_review',
  current_submissions INTEGER DEFAULT 0,
  reward_per_submission DECIMAL(10,4) NOT NULL DEFAULT 0.01,
  platform_fee_percent DECIMAL(5,2) DEFAULT 15.00,
  total_budget DECIMAL(12,2),
  min_trust_score DECIMAL(3,1) DEFAULT 5.0,
  min_level INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Migration: Ensure 'target_submissions' exists (Renaming from max_submissions if found)
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tasks' AND column_name='max_submissions') THEN
        ALTER TABLE public.tasks RENAME COLUMN max_submissions TO target_submissions;
    ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tasks' AND column_name='target_submissions') THEN
        ALTER TABLE public.tasks ADD COLUMN target_submissions INTEGER DEFAULT 1000;
    END IF;
END $$;

-- 5. Submissions
CREATE TABLE IF NOT EXISTS public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  submission_data JSONB NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  quality_score DECIMAL(3,2),
  reviewed_by UUID REFERENCES public.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 6. Financial Ledger
CREATE TABLE IF NOT EXISTS public.financial_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    amount DECIMAL(15,2) NOT NULL,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'completed',
    description TEXT,
    reference_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Billing Requests
CREATE TABLE IF NOT EXISTS public.billing_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    type VARCHAR(20) DEFAULT 'deposit',
    status VARCHAR(20) DEFAULT 'pending',
    payment_method VARCHAR(50),
    reference_id TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50), 
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

