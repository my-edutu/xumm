-- Seed Data for Advanced Infrastructure
-- Version: 1.0

-- 1. Sample Budgets
INSERT INTO public.project_budgets (name, company_id, total_budget, remaining_balance)
SELECT 'Vision AI Dataset', id, 2500.00, 1840.50 
FROM public.users WHERE role = 'company' LIMIT 1;

INSERT INTO public.project_budgets (name, company_id, total_budget, remaining_balance)
SELECT 'Linguasense Dialects', id, 5000.00, 5000.00 
FROM public.users WHERE role = 'company' LIMIT 1;

-- 2. Sample Appeals
INSERT INTO public.appeals (submission_id, user_id, reason, status)
SELECT s.id, s.user_id, 'The image was clear but it was rejected for poor lighting. I believe it meets the criteria.', 'pending'
FROM public.submissions s
JOIN public.users u ON s.user_id = u.id
WHERE u.role = 'contributor' LIMIT 2;

-- 3. Sample Audit Logs
INSERT INTO public.audit_logs (action, entity_type, entity_id, new_data)
VALUES ('update', 'setting', NULL, '{"maintenance_mode": "false"}');

-- 4. Sample Support Tickets
INSERT INTO public.support_tickets (user_id, subject, status, priority)
SELECT id, 'Withdrawal delay - PayPal', 'open', 'high'
FROM public.users WHERE role = 'contributor' LIMIT 1;

INSERT INTO public.support_tickets (user_id, subject, status, priority)
SELECT id, 'API Access Request', 'open', 'medium'
FROM public.users WHERE role = 'company' LIMIT 1;
