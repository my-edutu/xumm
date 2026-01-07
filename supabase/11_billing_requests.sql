-- Company Billing & Payment Requests
-- Version: 1.0

CREATE TABLE IF NOT EXISTS public.billing_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.users(id),
    amount DECIMAL(12,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    type TEXT DEFAULT 'deposit', -- 'deposit', 'subscription', 'data_purchase'
    status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'declined', 'processing'
    payment_method TEXT, -- 'stripe', 'bank_transfer', 'crypto'
    reference_id TEXT, -- External transaction ID
    invoice_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS
ALTER TABLE public.billing_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage all billing" ON public.billing_requests FOR ALL USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Companies view own billing" ON public.billing_requests FOR SELECT USING (auth.uid() = company_id);

-- Add to Audit Logs logic
CREATE TRIGGER on_billing_request_change
    AFTER UPDATE ON public.billing_requests
    FOR EACH ROW EXECUTE FUNCTION public.log_setting_change(); -- Reusing the logic logging function
