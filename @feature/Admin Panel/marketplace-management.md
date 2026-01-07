# Feature: Marketplace Operations Manager

## 📝 The Journey
This is the interface for Managing the "Storefront" of XUM AI. Admins use this to list new datasets, manage authorizations, and oversee data asset sales.

### Engineering Decisions
- **Asset Authorization Handshake**: Admins can grant "Access Tokens" to specific companies for specific datasets, bypassing the standard purchase flow if needed.
- **Exclusive Pricing Controls**: allows admins to set custom "Spot Prices" for companies based on their volume or strategic partnership.
- **Marketplace Health Status**: Monitors the "Sales Velocity" and "Request Queue" for different data types (e.g., is Pidgin data selling faster than Swahili data?).
- **Security Audit Log**: Every time an access token is generated or a price is changed, an immutable log is created in the `marketplace_audit_log`.

## 💻 Implementation Details
- **File**: `admin-panel/src/components/MarketplaceManager.tsx`
- **Component**: `MarketplaceManager()`.

### Core Operations
- **Publish/Unpublish**: Toggling visibility of datasets in the Company Portal.
- **Token Generation**: creating secure, expiring download links.
- **NDA Verification**: tagging assets that require legal vetting.

## 🧪 Verification
- [x] Revoking an authorization instantly kills the company's access to the dataset.
- [x] Pricing changes reflect immediately in the `DataMarketplace` view for companies.
- [x] Audit logs record both the "Before" and "After" values of changed parameters.
