-- Create waitlist table
CREATE TABLE IF NOT EXISTS public.waitlist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    country TEXT,
    company TEXT, -- Optional
    interest TEXT NOT NULL,
    consent BOOLEAN DEFAULT FALSE,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Allow public anonymous inserts for the waitlist form
CREATE POLICY "Allow public inserts for waitlist"
ON public.waitlist
FOR INSERT
WITH CHECK (true);

-- Allow admins to view waitlist entries
CREATE POLICY "Allow admins to view waitlist"
ON public.waitlist
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE public.users.email = auth.jwt()->>'email'
    AND public.users.role = 'admin'
  )
);
