-- Master SQL file to apply all XUM AI Enterprise modules in order
-- Run these one by one in the Supabase SQL Editor

-- 1. Tables and Core Constraints
-- RUN: 001_core_schema.sql

-- 2. Automation Triggers
-- RUN: 002_auth_triggers.sql

-- 3. Security Policies (Multi-tenancy)
-- RUN: 003_rls_policies.sql

-- 4. RPCs and Core Business Logic
-- RUN: 004_business_logic.sql

-- 5. Analytics Views
-- RUN: 005_views.sql
