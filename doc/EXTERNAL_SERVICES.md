# XUM AI - External Services & Scalability Guide
**Implementation Guide for Third-Party Integrations**

---

## 1. Context Management (Global State)
**Recommendation**: Shift from prop-drilling to a `UserContext` for managing balance, XP, and roles globally.

### Implementation Pattern
```tsx
// src/contexts/UserContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const UserContext = createContext<any>(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({ balance: 0, level: 1, xp: 0 });

  useEffect(() => {
    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
    });
  }, []);

  const fetchProfile = async (id) => {
    const { data } = await supabase.from('users').select('*').eq('id', id).single();
    if (data) setProfile(data);
  };

  return (
    <UserContext.Provider value={{ user, profile, refreshProfile: () => fetchProfile(user?.id) }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
```

---

## 2. Edge Functions (Serverless Logic)
**Recommendation**: Deploy serverless functions for third-party payment integrations and AI-driven quality checks.

### Use Cases
- **Payment Processing**: Securely communicate with Stripe/PayPal/Paystack API keys (hidden from client).
- **AI Validation**: Send task data to Gemini/OpenAI APIs for automated quality grading.
- **Bulk Payouts**: Process many transactions in a single background job.

### Deployment Guide
```bash
# Deploy a function to Supabase
supabase functions deploy process-payout --project-ref your-project-id
```

---

## 3. Real-time Updates (Supabase Realtime)
**Recommendation**: Enable Supabase Realtime for instant "Task Approved" notifications.

### Implementation Pattern
```tsx
const channel = supabase
  .channel('public:notifications')
  .on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
    (payload) => {
      showToast(payload.new.message);
      refreshBalance();
    }
  )
  .subscribe();
```

---

## 4. External Payment Gateways
**Provider**: PayPal / Stripe / Paystack

### Integration Steps
1. **Webhook Listener**: Create an Edge Function to listen for `payment_success` events from the provider.
2. **Ledger Update**: On success, call the `process_task_reward` function to update the user's balance.
3. **Receipt Storage**: Store external transaction IDs in the `withdrawals` table for audit trails.

---

## 5. Media Content Delivery (CDN)
**Provider**: Supabase Storage + Cloudflare / CloudFront

### Optimization
- **Transformation**: Use Supabase Image Transformation to serve optimized WebP thumbnails.
- **Access Control**: Use Signed URLs for sensitive task assets (e.g., medical data) to prevent unauthorized access.

---

**Version**: 1.0  
**Last Updated**: December 30, 2025
