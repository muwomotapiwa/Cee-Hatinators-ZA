# Proposed MVP Scope Lock - Sprint 004A

This is a proposed MVP scope lock. It is not approved until the client/business owner confirms it.

## Proposed MVP Scope

### Storefront

| Feature | MVP Included? | Status | Notes |
|---|---:|---|---|
| Existing Vite React storefront shell | Yes | Included - Proposed, not approved | Retain the current prototype foundation. |
| Home, shop, product listing, and navigation polish | Yes | Included - Proposed, not approved | No redesign implied; stabilize existing experience. |
| Wishlist persistence | No | Deferred - Proposed, not approved | Keep out of MVP unless client explicitly approves. |

### Product catalogue

| Feature | MVP Included? | Status | Notes |
|---|---:|---|---|
| Firestore-backed launch product catalogue | Yes | Pending client approval | Requires approved product model and launch product set. |
| Category records | Yes | Pending client approval | Requires approved category list. |
| Collections | Maybe | Pending client approval | Include only if business needs campaign/seasonal grouping at launch. |

### Product details

| Feature | MVP Included? | Status | Notes |
|---|---:|---|---|
| Product detail pages by slug | Yes | Included - Proposed, not approved | Requires slug decision. |
| Multiple product images | Yes | Included - Proposed, not approved | Requires image storage provider. |
| Variant-specific images | No | Deferred - Proposed, not approved | Defer unless variants require it for launch. |

### Cart

| Feature | MVP Included? | Status | Notes |
|---|---:|---|---|
| Local cart UI | Yes | Included - Proposed, not approved | Browser cart remains display-only. |
| Backend cart validation before checkout | Yes | Included - Proposed, not approved | Required for trusted prices, stock, discounts, and totals. |
| Persisted carts | No | Deferred - Proposed, not approved | Can wait until after core checkout. |

### Checkout

| Feature | MVP Included? | Status | Notes |
|---|---:|---|---|
| Checkout form | Yes | Included - Proposed, not approved | Existing scaffold can be refined later. |
| Guest checkout | Maybe | Pending client approval | Client must decide guest, account, or both. |
| Backend checkout session creation | Yes | Included - Proposed, not approved | Browser must not create trusted payment state. |

### Payments

| Feature | MVP Included? | Status | Notes |
|---|---:|---|---|
| Approved payment provider checkout | Yes | Pending client approval | Stripe is proposed, not approved. |
| Payment webhook | Yes | Included - Proposed, not approved | Required before production payment status. |
| Manual EFT | No | Excluded - Proposed, not approved | Include only if client chooses manual payment. |

### Orders

| Feature | MVP Included? | Status | Notes |
|---|---:|---|---|
| Order creation from backend-validated cart | Yes | Included - Proposed, not approved | Must snapshot product and price data. |
| Customer order confirmation page | Yes | Included - Proposed, not approved | Requires safe order lookup rules. |
| Customer returns portal | No | Deferred - Proposed, not approved | Post-launch unless approved. |

### Customer accounts

| Feature | MVP Included? | Status | Notes |
|---|---:|---|---|
| Firebase Auth login/register | Yes | Included - Proposed, not approved | Already scaffolded. |
| Account order history | Maybe | Pending client approval | Depends on guest/account checkout decision. |
| Saved addresses | No | Deferred - Proposed, not approved | Post-launch feature. |

### Admin

| Feature | MVP Included? | Status | Notes |
|---|---:|---|---|
| Admin authorization model | Yes | Pending client approval | Must be approved before dashboard work. |
| Basic product management | Maybe | Pending client approval | Requires schema and permissions approval. |
| Basic order management | Maybe | Pending client approval | Requires order lifecycle approval. |
| Advanced admin roles | No | Deferred - Proposed, not approved | Post-launch. |

### Images

| Feature | MVP Included? | Status | Notes |
|---|---:|---|---|
| Product image storage | Yes | Pending client approval | Firebase Storage is proposed, not approved. |
| Admin image upload | Maybe | Pending client approval | Depends on admin MVP scope. |
| Image approval workflow | No | Deferred - Proposed, not approved | Post-launch. |

### Shipping

| Feature | MVP Included? | Status | Notes |
|---|---:|---|---|
| Launch shipping methods | Yes | Pending client approval | Methods and countries must be approved. |
| Shipping fee calculation | Yes | Pending client approval | Flat fee is proposed, not approved. |
| Multi-country shipping | No | Deferred - Proposed, not approved | Include only if client approves for launch. |

### Notifications

| Feature | MVP Included? | Status | Notes |
|---|---:|---|---|
| Customer order confirmation email | Yes | Included - Proposed, not approved | Requires email provider/backend decision. |
| Admin new-order email | Yes | Included - Proposed, not approved | Useful for fulfillment. |
| Newsletter automation | No | Deferred - Proposed, not approved | Post-launch. |

### Testing/deployment

| Feature | MVP Included? | Status | Notes |
|---|---:|---|---|
| Focused tests for checkout/cart/backend boundaries | Yes | Included - Proposed, not approved | Current project has no tests. |
| Production deployment plan | Yes | Included - Proposed, not approved | Requires env, Firebase, and payment decisions. |
| Advanced analytics dashboard | No | Deferred - Proposed, not approved | Post-launch. |
