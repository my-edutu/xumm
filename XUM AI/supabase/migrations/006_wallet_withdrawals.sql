-- ============================================================================
-- WALLET & WITHDRAWAL SYSTEM
-- Transaction history and withdrawal requests with admin approval
-- Created: 2026-01-10
-- ============================================================================

-- Transaction type enum
CREATE TYPE public.transaction_type AS ENUM ('earn', 'bonus', 'withdraw', 'refund', 'adjustment');

-- Transaction status enum
CREATE TYPE public.withdrawal_status AS ENUM ('pending', 'approved', 'rejected', 'processing', 'completed', 'failed');

-- ============================================================================
-- TRANSACTIONS TABLE (History)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- User Reference
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Transaction Details
    type public.transaction_type NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    description VARCHAR(255) NOT NULL,
    
    -- Reference to source (e.g., task submission)
    reference_type VARCHAR(50),  -- 'task_submission', 'withdrawal', 'bonus'
    reference_id UUID,
    
    -- Balance tracking
    balance_before DECIMAL(10, 2),
    balance_after DECIMAL(10, 2),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_transactions_user 
ON public.transactions(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_transactions_type 
ON public.transactions(type);

-- Enable RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Users can view their own transactions
CREATE POLICY "Users can view own transactions"
ON public.transactions
FOR SELECT
USING (auth.uid() = user_id);

-- System/Admin can insert transactions
CREATE POLICY "System can create transactions"
ON public.transactions
FOR INSERT
WITH CHECK (true);  -- Controlled by backend/functions

-- Admins can view all
CREATE POLICY "Admins can view all transactions"
ON public.transactions
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- ============================================================================
-- WITHDRAWALS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.withdrawals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- User Reference
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Withdrawal Amount
    amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
    
    -- Payment Details
    payment_method VARCHAR(50) NOT NULL,  -- 'paypal', 'bank_transfer', 'crypto', etc.
    payment_details JSONB NOT NULL,       -- Encrypted/hashed payment info
    
    -- Status Tracking
    status public.withdrawal_status NOT NULL DEFAULT 'pending',
    
    -- Admin Review
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    
    -- Processing Info
    transaction_ref VARCHAR(100),  -- External payment reference
    processed_at TIMESTAMP WITH TIME ZONE,
    
    -- Admin Notes (internal)
    admin_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_withdrawals_user 
ON public.withdrawals(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_withdrawals_status 
ON public.withdrawals(status) WHERE status IN ('pending', 'processing');

-- Enable RLS
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;

-- Users can view their own withdrawals
CREATE POLICY "Users can view own withdrawals"
ON public.withdrawals
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create withdrawal requests
CREATE POLICY "Users can request withdrawals"
ON public.withdrawals
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users cannot update/delete withdrawals (only admin)
-- Admins can view and update all withdrawals
CREATE POLICY "Admins can manage withdrawals"
ON public.withdrawals
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- Update trigger
CREATE TRIGGER trigger_withdrawals_updated_at
    BEFORE UPDATE ON public.withdrawals
    FOR EACH ROW
    EXECUTE FUNCTION update_featured_tasks_updated_at();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Get user's current balance
CREATE OR REPLACE FUNCTION get_user_balance(p_user_id UUID)
RETURNS DECIMAL(10, 2) AS $$
DECLARE
    v_earned DECIMAL(10, 2);
    v_withdrawn DECIMAL(10, 2);
    v_pending_withdrawal DECIMAL(10, 2);
BEGIN
    -- Total earned (approved tasks)
    SELECT COALESCE(SUM(total_reward), 0) INTO v_earned
    FROM public.task_submissions
    WHERE user_id = p_user_id AND status = 'approved';
    
    -- Total withdrawn (completed withdrawals)
    SELECT COALESCE(SUM(amount), 0) INTO v_withdrawn
    FROM public.withdrawals
    WHERE user_id = p_user_id AND status = 'completed';
    
    -- Pending withdrawals (not yet completed but approved/processing)
    SELECT COALESCE(SUM(amount), 0) INTO v_pending_withdrawal
    FROM public.withdrawals
    WHERE user_id = p_user_id AND status IN ('pending', 'approved', 'processing');
    
    RETURN v_earned - v_withdrawn - v_pending_withdrawal;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Request withdrawal (with validation)
CREATE OR REPLACE FUNCTION request_withdrawal(
    p_user_id UUID,
    p_amount DECIMAL(10, 2),
    p_payment_method VARCHAR(50),
    p_payment_details JSONB
)
RETURNS UUID AS $$
DECLARE
    v_balance DECIMAL(10, 2);
    v_min_withdrawal DECIMAL(10, 2) := 5.00;  -- Minimum $5 withdrawal
    v_withdrawal_id UUID;
BEGIN
    -- Check balance
    v_balance := get_user_balance(p_user_id);
    
    IF p_amount > v_balance THEN
        RAISE EXCEPTION 'Insufficient balance. Available: $%, Requested: $%', v_balance, p_amount;
    END IF;
    
    IF p_amount < v_min_withdrawal THEN
        RAISE EXCEPTION 'Minimum withdrawal amount is $%', v_min_withdrawal;
    END IF;
    
    -- Create withdrawal request
    INSERT INTO public.withdrawals (user_id, amount, payment_method, payment_details)
    VALUES (p_user_id, p_amount, p_payment_method, p_payment_details)
    RETURNING id INTO v_withdrawal_id;
    
    -- Create transaction record
    INSERT INTO public.transactions (user_id, type, amount, description, reference_type, reference_id)
    VALUES (p_user_id, 'withdraw', -p_amount, 'Withdrawal request', 'withdrawal', v_withdrawal_id);
    
    RETURN v_withdrawal_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin: Approve withdrawal
CREATE OR REPLACE FUNCTION approve_withdrawal(
    p_withdrawal_id UUID,
    p_admin_id UUID,
    p_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE public.withdrawals
    SET 
        status = 'approved',
        reviewed_by = p_admin_id,
        reviewed_at = NOW(),
        admin_notes = p_notes
    WHERE id = p_withdrawal_id AND status = 'pending';
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin: Reject withdrawal
CREATE OR REPLACE FUNCTION reject_withdrawal(
    p_withdrawal_id UUID,
    p_admin_id UUID,
    p_reason TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    v_user_id UUID;
    v_amount DECIMAL(10, 2);
BEGIN
    -- Get withdrawal info
    SELECT user_id, amount INTO v_user_id, v_amount
    FROM public.withdrawals
    WHERE id = p_withdrawal_id AND status = 'pending';
    
    IF v_user_id IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Update withdrawal status
    UPDATE public.withdrawals
    SET 
        status = 'rejected',
        reviewed_by = p_admin_id,
        reviewed_at = NOW(),
        rejection_reason = p_reason
    WHERE id = p_withdrawal_id;
    
    -- Refund the amount (create reverse transaction)
    INSERT INTO public.transactions (user_id, type, amount, description, reference_type, reference_id)
    VALUES (v_user_id, 'refund', v_amount, 'Withdrawal rejected: ' || p_reason, 'withdrawal', p_withdrawal_id);
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get transaction history for user
CREATE OR REPLACE FUNCTION get_transaction_history(
    p_user_id UUID,
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
)
RETURNS SETOF public.transactions AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM public.transactions
    WHERE user_id = p_user_id
    ORDER BY created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- ADMIN VIEWS
-- ============================================================================

-- Pending withdrawals for admin review
CREATE OR REPLACE VIEW public.admin_pending_withdrawals AS
SELECT 
    w.*,
    p.full_name,
    p.email,
    get_user_balance(w.user_id) as current_balance,
    (SELECT COUNT(*) FROM public.task_submissions WHERE user_id = w.user_id AND status = 'approved') as total_approved_tasks
FROM public.withdrawals w
JOIN public.profiles p ON p.id = w.user_id
WHERE w.status = 'pending'
ORDER BY w.created_at;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE public.transactions IS 'All user financial transactions (earnings, withdrawals, bonuses)';
COMMENT ON TABLE public.withdrawals IS 'Withdrawal requests requiring admin approval';
COMMENT ON FUNCTION get_user_balance IS 'Calculate user available balance (earned - withdrawn - pending)';
COMMENT ON FUNCTION request_withdrawal IS 'Create withdrawal request with balance validation';
COMMENT ON FUNCTION approve_withdrawal IS 'Admin: Approve a pending withdrawal';
COMMENT ON FUNCTION reject_withdrawal IS 'Admin: Reject withdrawal and refund balance';
