-- XUM AI Column Repair Script
-- Run this ONCE to add missing columns to existing tables

-- Add missing columns to tasks table
DO $$ 
BEGIN 
    -- target_submissions (replaces old max_submissions)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='tasks' AND column_name='target_submissions') THEN
        ALTER TABLE public.tasks ADD COLUMN target_submissions INTEGER DEFAULT 1000;
    END IF;
    
    -- reward_per_submission
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='tasks' AND column_name='reward_per_submission') THEN
        ALTER TABLE public.tasks ADD COLUMN reward_per_submission DECIMAL(10,4) DEFAULT 0.05;
    END IF;
    
    -- total_budget
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='tasks' AND column_name='total_budget') THEN
        ALTER TABLE public.tasks ADD COLUMN total_budget DECIMAL(12,2) DEFAULT 0;
    END IF;
    
    -- platform_fee_percent
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='tasks' AND column_name='platform_fee_percent') THEN
        ALTER TABLE public.tasks ADD COLUMN platform_fee_percent DECIMAL(5,2) DEFAULT 15.00;
    END IF;
    
    -- company_id (link to companies table)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='tasks' AND column_name='company_id') THEN
        ALTER TABLE public.tasks ADD COLUMN company_id UUID;
    END IF;
END $$;

-- Verify columns were added
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'tasks';
