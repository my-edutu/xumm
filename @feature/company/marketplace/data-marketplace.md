# Feature: Data Asset Marketplace (Secondary Exchange)

## 📝 The Journey
Sometimes companies don't want to collect data from scratch—they want to buy it. I built the `DataMarketplace` as a secure repository for high-fidelity datasets collected by XUM AI and vetted by our admins.

### Engineering Decisions
- **Authorization-First Shopping**: Assets aren't just "Buy Now." Most require a "Request Access" handshake or an NDA verification. I used a `Lock` and `Shield` icon system to signify protected assets.
- **Dynamic Pricing Engine**: Prices aren't static; they adapt based on `license_type` (Exclusive vs. Non-Exclusive) and company-specific discounts.
- **Sample Previews**: implemented a secure preview mechanism where companies can see a 5% "snapshot" of the data before committing capital.
- **Delivery Status Tracking**: Post-purchase, companies get a "Delivery" dashboard to track download links, access tokens, and expiration dates.

## 💻 Implementation Details
- **File**: `company/src/pages/DataMarketplace.tsx`
- **Component**: `DataMarketplace()`.
- **Logic**: Uses `DataAsset` and `Purchase` interfaces to track the lifecycle of a dataset acquisition.

### Asset Metadata
- **Quality Tier**: Standard vs. Premium.
- **Target Languages**: e.g., "en", "sw", "yo".
- **Sample Count**: Number of unique nodes in the set.

## 🧪 Verification
- [x] "Effective Price" calculation handles discounts correctly.
- [x] NDA badge appears only for assets requiring legal handshakes.
- [x] Download button remains locked until `payment_status` is 'paid'.
