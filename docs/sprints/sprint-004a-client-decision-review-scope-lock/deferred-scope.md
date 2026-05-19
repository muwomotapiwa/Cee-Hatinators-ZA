# Deferred Post-Launch Scope - Sprint 004A

These items should remain out of MVP unless the client explicitly approves moving them into launch scope.

| Deferred Item | Reason Deferred | Dependency | Future Sprint Candidate |
|---|---|---|---|
| Wishlist persistence | Not required for core purchase flow. | Customer account model and Firestore rules. | Post-launch customer experience sprint |
| Returns portal | Requires returns policy, order status rules, and refund workflow. | Payment provider, refund rules, admin workflow. | Post-launch returns/refunds sprint |
| Saved addresses | Adds profile data and privacy/security work. | Customer profile model and account scope. | Post-launch account sprint |
| Newsletter automation | Requires consent, provider, and email automation decisions. | Email provider and marketing process. | Post-launch marketing sprint |
| Advanced inventory ledger | Adds operational complexity beyond basic stock tracking. | Approved stock model and admin workflow. | Inventory hardening sprint |
| Advanced admin roles | Needs role hierarchy and custom claims strategy. | Admin permissions approval. | Admin permissions expansion sprint |
| Product import/export | Useful later but not needed for first controlled catalogue setup. | Final product schema. | Catalogue tooling sprint |
| Image approval workflow | Adds editorial workflow beyond basic upload. | Image storage provider and admin roles. | Media workflow sprint |
| Analytics dashboard | Not needed for core commerce functionality. | Analytics provider and reporting requirements. | Reporting sprint |
| Advanced discounts | Requires backend promo rules, usage limits, and admin tooling. | Discount strategy and backend validation. | Promotions sprint |
| Partial refunds | Requires payment provider refund support and admin controls. | Payment provider and returns/refunds policy. | Refunds sprint |
| Multi-country shipping | Adds country-specific fees, tax, customs, and validation complexity. | Approved launch countries and shipping provider. | Shipping expansion sprint |
