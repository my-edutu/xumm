-- XUM AI Wallet & Budget Integration
-- Migration: 21_wallet_budget_integration.sql

-- ============================================
-- 1. ALLOCATE BUDGET FROM WALLET
-- ============================================

CREATE OR REPLACE FUNCTION public.allocate_budget_from_wallet(
    p_name TEXT,
    p_amount DECIMAL
)
RETURNS UUID AS $$
DECLARE
    v_company_id UUID;
    v_budget_id UUID;
    v_wallet RECORD;
BEGIN
    v_company_id := auth.uid();

    -- 1. Check wallet liquidity
    SELECT * INTO v_wallet FROM public.company_wallets 
    WHERE company_id = v_company_id FOR UPDATE;

    IF v_wallet.available_balance < p_amount THEN
        RAISE EXCEPTION 'Insufficient wallet balance. Available: $%, Requested: $%', v_wallet.available_balance, p_amount;
    END IF;

    -- 2. Create the budget
    INSERT INTO public.project_budgets (company_id, name, total_budget, remaining_balance)
    VALUES (v_company_id, p_name, p_amount, p_amount)
    RETURNING id INTO v_budget_id;

    -- 3. Move funds in wallet (Available -> Pending/Escrow)
    UPDATE public.company_wallets
    SET available_balance = available_balance - p_amount,
        pending_balance = pending_balance + p_amount
    WHERE company_id = v_company_id;

    -- 4. Log to Ledger
    INSERT INTO public.financial_ledger (
        company_id,
        amount,
        type,
        reference,
        description
    ) VALUES (
        v_company_id,
        -p_amount,
        'escrow_lock',
        'BUDGET-' || v_budget_id,
        'Budget allocation for: ' || p_name
    );

    RETURN v_budget_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 2. RECONCILE SPENDING (Trigger on Task Approval)
-- ============================================

-- When a submission is approved, we should theoretically deduct from budget
-- Currently process_task_reward increments user balance.
-- We need a corresponding deduction from the task's budget and the company's pending wallet.

CREATE OR REPLACE FUNCTION public.sync_task_payout_with_budget()
RETURNS TRIGGER AS $$
DECLARE
    v_task RECORD;
    v_budget RECORD;
BEGIN
    -- Only act on auto-approval or manual approval transitions to 'approved'
    IF NEW.status = 'approved' AND OLD.status = 'pending' THEN
        
        -- 1. Get Task and Budget
        SELECT t.id, t.reward, t.budget_id, t.company_id 
        INTO v_task 
        FROM public.tasks t 
        WHERE t.id = NEW.task_id;

        IF v_task.budget_id IS NOT NULL THEN
            -- 2. Deduct from Project Budget
            UPDATE public.project_budgets
            SET remaining_balance = remaining_balance - v_task.reward
            WHERE id = v_task.budget_id;

            -- 3. Release from Wallet (Pending -> Gone)
            UPDATE public.company_wallets
            SET pending_balance = pending_balance - v_task.reward,
                total_spent = total_spent + v_task.reward
            WHERE company_id = v_task.company_id;

            -- 4. Record Ledger Entry
            INSERT INTO public.financial_ledger (
                company_id,
                amount,
                type,
                reference,
                description
            ) VALUES (
                v_task.company_id,
                -v_task.reward,
                'escrow_release',
                'TX-' || NEW.id,
                'Task reward payout for submission: ' || NEW.id
            );
        END IF;

    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach to submissions table
DROP TRIGGER IF EXISTS tr_sync_budget_payout ON public.submissions;
CREATE TRIGGER tr_sync_budget_payout
    AFTER UPDATE ON public.submissions
    FOR EACH ROW
    WHEN (NEW.status = 'approved' AND OLD.status = 'pending')
    EXECUTE FUNCTION public.sync_task_payout_with_budget();

COMMENT ON FUNCTION allocate_budget_from_wallet IS 'Securely locks wallet funds into a specific project budget';
COMMENT ON TRIGGER tr_sync_budget_payout ON public.submissions IS 'Automatically synchronizes company escrow and budget when workers are paid';
