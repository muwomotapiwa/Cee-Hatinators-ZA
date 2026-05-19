# Client Decision Pack - Sprint 003

This document lists the business decisions needed before implementation starts. Recommended defaults are suggestions only and are not approved until the client confirms them.

## 1. Products and Categories

| Question | Why It Matters | Options | Recommended Default | Client Decision |
|---|---|---|---|---|
| What product categories are required at launch? | Categories shape the store navigation and product setup. | Dresses, sets, accessories, custom orders, sale, new arrivals. | Start with a small approved launch category list - Proposed, not approved. | Pending |
| Should collections be separate from categories? | Collections can support campaigns like seasonal edits without changing core categories. | Categories only, categories plus collections. | Use categories plus optional collections - Proposed, not approved. | Pending |
| Who approves product names, descriptions, and prices? | Product data must be controlled before products move into Firestore. | Business owner only, admin users, shared review process. | Business owner approves first launch catalogue - Proposed, not approved. | Pending |

## 2. Product Variants and Custom Orders

| Question | Why It Matters | Options | Recommended Default | Client Decision |
|---|---|---|---|---|
| Are sizes required at launch? | Sizes affect product variants, stock, cart items, and orders. | No sizes, standard sizes, custom measurements. | Support standard sizes where needed - Proposed, not approved. | Pending |
| Are color variants required at launch? | Colors affect images, variants, stock, and customer choices. | No colors, color names only, color-specific stock and images. | Support color names first - Proposed, not approved. | Pending |
| Are made-to-order measurements required? | Measurements add custom fields, validation, and order review work. | Not at launch, simple notes, structured measurement form. | Defer structured measurements after launch - Proposed, not approved. | Pending |
| Are custom orders paid upfront or quoted first? | This affects checkout, order status, and payment timing. | Paid upfront, quote first, deposit. | Quote first for custom orders - Proposed, not approved. | Pending |

## 3. Stock and Inventory

| Question | Why It Matters | Options | Recommended Default | Client Decision |
|---|---|---|---|---|
| Should stock be tracked per product or per variant? | Stock rules affect overselling protection and product setup. | Per product, per variant, not tracked at launch. | Track per variant when variants exist, otherwise per product - Proposed, not approved. | Pending |
| Should made-to-order items show stock? | Made-to-order products may not behave like ready-made inventory. | No stock, capacity limit, manual availability. | Use manual availability for made-to-order items - Proposed, not approved. | Pending |
| Who updates stock? | Stock changes must be controlled to avoid wrong availability. | Admin only, automated after orders, manual review. | Admin controls stock until backend automation exists - Proposed, not approved. | Pending |

## 4. Product Images

| Question | Why It Matters | Options | Recommended Default | Client Decision |
|---|---|---|---|---|
| Where should product images be stored? | Image storage affects upload tools, costs, and delivery quality. | Firebase Storage, Cloudinary. | Firebase Storage - Proposed, not approved. | Pending |
| Who uploads product images? | Upload ownership affects admin permissions and content workflow. | Business owner, assigned admin, developer during launch. | Assigned admin uploads after dashboard exists - Proposed, not approved. | Pending |
| Are variant-specific images required? | Variant images affect the product model and admin workflow. | Not required, optional per variant, required per variant. | Optional per variant after launch - Proposed, not approved. | Pending |

## 5. Payments

| Question | Why It Matters | Options | Recommended Default | Client Decision |
|---|---|---|---|---|
| Which payment provider is approved? | The backend and checkout flow depend on this decision. | Stripe, PayFast, PayPal, manual EFT. | Stripe - Proposed, not approved. | Pending |
| Should checkout use a hosted payment page? | Hosted checkout reduces payment handling risk. | Hosted checkout, embedded checkout, manual payment. | Hosted checkout - Proposed, not approved. | Pending |
| Should unpaid custom orders be supported? | Quote-first orders may need a different payment lifecycle. | No, yes with quote status, deposit flow later. | Yes with quote status later - Proposed, not approved. | Pending |

## 6. Checkout

| Question | Why It Matters | Options | Recommended Default | Client Decision |
|---|---|---|---|---|
| Should guest checkout be supported? | Guest checkout affects account requirements and order lookup. | Guest only, account required, both. | Support both guest and customer accounts - Proposed, not approved. | Pending |
| What customer details are required at checkout? | Required fields affect validation and order records. | Name, email, phone, shipping address, notes. | Name, email, phone, shipping address for delivery orders - Proposed, not approved. | Pending |
| Should checkout support local pickup? | Pickup changes shipping fields and fulfillment workflow. | No, yes at one location, yes at multiple locations. | Support one local pickup option if business confirms - Proposed, not approved. | Pending |

## 7. Shipping and Pickup

| Question | Why It Matters | Options | Recommended Default | Client Decision |
|---|---|---|---|---|
| What shipping methods are required? | Shipping methods affect checkout, pricing, and fulfillment. | Local pickup, local courier, national courier, manual quote. | Local pickup plus courier delivery - Proposed, not approved. | Pending |
| How should shipping fees be calculated? | Shipping fees must be calculated by backend authority later. | Flat fee, area-based fee, manual quote, provider integration. | Flat fee for MVP - Proposed, not approved. | Pending |
| Is international shipping required? | International shipping adds tax, customs, and cost complexity. | No, later, yes at launch. | Defer international shipping - Proposed, not approved. | Pending |

## 8. Discounts and Promo Codes

| Question | Why It Matters | Options | Recommended Default | Client Decision |
|---|---|---|---|---|
| Are promo codes required at launch? | Discounts need backend validation and cannot be trusted to the browser. | No, yes simple codes, later. | Defer promo codes until after launch - Proposed, not approved. | Pending |
| Should sale pricing be supported? | Sale prices affect product records and price authority. | No sales, manual sale price, scheduled sale. | Manual sale price later - Proposed, not approved. | Pending |

## 9. Returns and Refunds

| Question | Why It Matters | Options | Recommended Default | Client Decision |
|---|---|---|---|---|
| Are returns required at launch? | Returns affect policies, order statuses, and admin workflow. | No, policy only, customer return request flow. | Publish policy only for MVP - Proposed, not approved. | Pending |
| How are refunds handled? | Refunds must match the payment provider and admin process. | Manual review, provider refund, no online refunds. | Manual review first - Proposed, not approved. | Pending |

## 10. Customer Accounts

| Question | Why It Matters | Options | Recommended Default | Client Decision |
|---|---|---|---|---|
| Are customer accounts required for checkout? | Account rules affect authentication and order history. | Required, optional, no accounts. | Optional accounts - Proposed, not approved. | Pending |
| Should customers save addresses? | Saved addresses add profile and privacy requirements. | No, yes at launch, later. | Defer saved addresses - Proposed, not approved. | Pending |
| Should customers see order history? | Order history affects customer profile and security rules. | No, yes for account orders, later. | Support account order history after backend is ready - Proposed, not approved. | Pending |

## 11. Admin Users

| Question | Why It Matters | Options | Recommended Default | Client Decision |
|---|---|---|---|---|
| Who should be admin users? | Admin access controls products, orders, and business data. | Business owner only, owner plus staff, developer temporary access. | Business owner plus explicitly approved staff - Proposed, not approved. | Pending |
| How should admin access be controlled first? | Admin permissions must not be too broad. | `admins/{uid}`, custom claims, phased approach. | `admins/{uid}` first, custom claims later - Proposed, not approved. | Pending |
| What should admins be able to change at launch? | Admin scope affects dashboard design and security. | Products only, orders only, products and orders. | Products and order status after permissions are approved - Proposed, not approved. | Pending |

## 12. Emails and Notifications

| Question | Why It Matters | Options | Recommended Default | Client Decision |
|---|---|---|---|---|
| Are order emails required? | Emails affect customer communication and backend functions. | No, customer confirmation, customer and admin emails. | Customer confirmation plus admin new-order email - Proposed, not approved. | Pending |
| Should newsletter automation be included? | Newsletter tools add consent, data, and third-party integration decisions. | No, manual list, automated provider later. | Defer newsletter automation - Proposed, not approved. | Pending |
| Should order status updates send emails? | Status emails affect order lifecycle and customer expectations. | No, key statuses only, every status. | Key statuses only later - Proposed, not approved. | Pending |

## 13. Launch MVP Scope

| Question | Why It Matters | Options | Recommended Default | Client Decision |
|---|---|---|---|---|
| What must be included for launch? | MVP scope controls sprint sequencing and prevents feature sprawl. | Storefront only, storefront plus checkout, storefront plus admin. | Storefront, approved catalogue, backend checkout, basic admin orders/products - Proposed, not approved. | Pending |
| What product count is required for launch? | Product count affects migration and content readiness. | Small launch set, full catalogue, phased release. | Small approved launch set - Proposed, not approved. | Pending |
| What payment and fulfillment flow is acceptable for MVP? | This decides what backend work must happen before launch. | Online payment, manual payment, quote-first. | Online payment for standard products, quote-first for custom orders later - Proposed, not approved. | Pending |

## 14. Post-Launch Scope

| Question | Why It Matters | Options | Recommended Default | Client Decision |
|---|---|---|---|---|
| Which features should wait until after launch? | Deferred scope protects MVP delivery. | Wishlist persistence, returns portal, saved addresses, newsletter automation, advanced variants. | Defer all non-essential features - Proposed, not approved. | Pending |
| Should advanced analytics be included later? | Analytics can affect privacy, tracking, and reporting tools. | No, basic analytics, advanced dashboards. | Basic analytics later - Proposed, not approved. | Pending |
| Should custom order workflows be expanded later? | Custom workflows can become complex and should be designed deliberately. | No, simple quote requests, full custom order portal. | Simple quote requests later - Proposed, not approved. | Pending |
