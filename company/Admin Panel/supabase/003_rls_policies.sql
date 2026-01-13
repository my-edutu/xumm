-- Row Level Security Policies for XUM AI
-- Version: 2.3 (Universal Type Casting)

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first to avoid conflicts
DO $$ 
DECLARE pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
    END LOOP;
END $$;

-- 1. Users Policies
CREATE POLICY "Users can view own profile" ON public.users 
  FOR SELECT USING (id::text = auth.uid()::text);

CREATE POLICY "Users can update own profile" ON public.users 
  FOR UPDATE USING (id::text = auth.uid()::text);

CREATE POLICY "Admins can view all users" ON public.users 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id::text = auth.uid()::text AND role = 'admin')
  );

-- 2. Companies Policies
CREATE POLICY "Owners can view their companies" ON public.companies 
  FOR SELECT USING (owner_id::text = auth.uid()::text);

CREATE POLICY "Owners can update their companies" ON public.companies 
  FOR UPDATE USING (owner_id::text = auth.uid()::text);

CREATE POLICY "Admins can view all companies" ON public.companies 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id::text = auth.uid()::text AND role = 'admin')
  );

-- 3. Company Wallets Policies
CREATE POLICY "Owners can view their wallets" ON public.company_wallets 
  FOR SELECT USING (
    company_id::text IN (SELECT id::text FROM public.companies WHERE owner_id::text = auth.uid()::text)
  );

-- 4. Tasks Policies
CREATE POLICY "Anyone can view active tasks" ON public.tasks 
  FOR SELECT USING (status = 'active');

CREATE POLICY "Companies can view own tasks" ON public.tasks 
  FOR SELECT USING (
    company_id::text IN (SELECT id::text FROM public.companies WHERE owner_id::text = auth.uid()::text)
  );

CREATE POLICY "Companies can create tasks" ON public.tasks 
  FOR INSERT WITH CHECK (
    company_id::text IN (SELECT id::text FROM public.companies WHERE owner_id::text = auth.uid()::text)
  );

-- 5. Submissions Policies
CREATE POLICY "Workers can view own submissions" ON public.submissions 
  FOR SELECT USING (user_id::text = auth.uid()::text);

CREATE POLICY "Companies can view submissions to their tasks" ON public.submissions 
  FOR SELECT USING (
    task_id::text IN (
      SELECT id::text FROM public.tasks 
      WHERE company_id::text IN (SELECT id::text FROM public.companies WHERE owner_id::text = auth.uid()::text)
    )
  );

CREATE POLICY "Workers can create submissions" ON public.submissions 
  FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);

-- 6. Financial Ledger & Billing Policies
CREATE POLICY "Companies can view own ledger" ON public.financial_ledger 
  FOR SELECT USING (
    company_id::text IN (SELECT id::text FROM public.companies WHERE owner_id::text = auth.uid()::text)
  );

CREATE POLICY "Companies can view own billing requests" ON public.billing_requests 
  FOR SELECT USING (
    company_id::text IN (SELECT id::text FROM public.companies WHERE owner_id::text = auth.uid()::text)
  );

-- 7. Notifications Policies
CREATE POLICY "Users can view own notifications" ON public.notifications 
  FOR SELECT USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can update own notifications" ON public.notifications 
  FOR UPDATE USING (user_id::text = auth.uid()::text);
