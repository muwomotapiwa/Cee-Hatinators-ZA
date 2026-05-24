# Data Model

## Purpose

This document defines proposed future data models for Cee Hatinators. These models are documentation only. They do not change TypeScript, Firestore rules, Firestore collections, or runtime code in Sprint 002.

## Modeling Principles

- Store money in minor units where possible, for example pence or cents, with a currency code.
- Product display data may be public, but write operations should be admin-only.
- Cart totals shown in the browser are for display only.
- Backend/server functions must validate prices, discounts, stock, inventory, and payment state.
- Orders should preserve historical snapshots of purchased items so later product edits do not alter old orders.
- Soft archive products instead of deleting them when orders may reference them.

## Product

Purpose:

- Represents a sellable product family or base item.

Key fields:

- `id`
- `slug`
- `name`
- `description`
- `status`
- `categoryIds`
- `collectionIds`
- `basePriceMinor`
- `currency`
- `images`
- `variantIds`
- `createdAt`
- `updatedAt`
- `archivedAt`

Required fields:

- `slug`
- `name`
- `status`
- `basePriceMinor`
- `currency`
- `categoryIds`

Optional fields:

- `description`
- `shortDescription`
- `careInstructions`
- `materials`
- `tags`
- `collectionIds`
- `seoTitle`
- `seoDescription`
- `featured`

Relationships:

- Belongs to one or more categories.
- May belong to collections.
- Has zero or more variants.
- Has one or more product images before publication.
- May appear in order item snapshots.

Validation notes:

- `slug` must be unique.
- `status` should be `draft`, `active`, or `archived`.
- Price must be a non-negative integer in minor units.
- Product cannot be active without at least one image and category.
- Product cannot be hard-deleted if referenced by an order.

Open questions:

- Should all launch products require variants?
- Products are priced in ZAR for the South African launch.
- Should fabric products be priced per yard, per meter, or fixed cut length?

## Category

Purpose:

- Groups products for navigation and filtering.

Key fields:

- `id`
- `slug`
- `name`
- `description`
- `parentCategoryId`
- `sortOrder`
- `status`
- `image`

Required fields:

- `slug`
- `name`
- `status`

Optional fields:

- `description`
- `parentCategoryId`
- `sortOrder`
- `image`
- `seoTitle`
- `seoDescription`

Relationships:

- Products can reference multiple categories.
- Categories may be nested through `parentCategoryId`.

Validation notes:

- `slug` must be unique.
- Do not delete a category while products reference it; archive instead.

Open questions:

- What exact categories are required at launch?
- Is nested category navigation required?

## Collection

Purpose:

- Represents curated product groupings such as seasonal edits or campaign collections.

Key fields:

- `id`
- `slug`
- `name`
- `description`
- `status`
- `productIds`
- `heroImage`
- `sortOrder`

Required fields:

- `slug`
- `name`
- `status`

Optional fields:

- `description`
- `productIds`
- `heroImage`
- `startsAt`
- `endsAt`
- `seoTitle`
- `seoDescription`

Relationships:

- Contains many products.
- Products may belong to many collections.

Validation notes:

- `slug` must be unique.
- Scheduled collections should only display when active and inside date range.

Open questions:

- Are collections editorial only or also used for discount campaigns?

## ProductVariant

Purpose:

- Represents a purchasable option under a product, such as size, color, fabric length, or made-to-order option.

Key fields:

- `id`
- `productId`
- `sku`
- `name`
- `optionValues`
- `priceMinor`
- `currency`
- `stockTracked`
- `stockAvailable`
- `status`
- `imageIds`

Required fields:

- `productId`
- `sku`
- `priceMinor`
- `currency`
- `status`

Optional fields:

- `name`
- `optionValues`
- `compareAtPriceMinor`
- `stockTracked`
- `stockAvailable`
- `lowStockThreshold`
- `imageIds`
- `weight`
- `dimensions`

Relationships:

- Belongs to one product.
- May reference product images.
- Referenced by cart items and order item snapshots.

Validation notes:

- `sku` must be unique if used operationally.
- Variant price must be validated server-side at checkout.
- Stock must be validated server-side at checkout.
- Variants should be archived, not deleted, if previously ordered.

Open questions:

- Is stock tracked per product or per variant?
- Are sizes, colors, fabric lengths, and measurements required at launch?
- How should custom/made-to-order variants be represented?

## ProductImage

Purpose:

- Represents product media metadata independent of storage provider.

Key fields:

- `id`
- `productId`
- `variantIds`
- `url`
- `storageProvider`
- `storagePath`
- `alt`
- `sortOrder`
- `isPrimary`

Required fields:

- `productId`
- `url`
- `storageProvider`
- `alt`

Optional fields:

- `variantIds`
- `storagePath`
- `width`
- `height`
- `sortOrder`
- `isPrimary`

Relationships:

- Belongs to a product.
- May be associated with variants.

Validation notes:

- Active products should have at least one primary image.
- Alt text should be required for accessibility and SEO.

Open questions:

- Firebase Storage or Cloudinary?
- Who uploads and approves product images?

## Cart

Purpose:

- Represents a temporary set of items a customer intends to purchase.

Key fields:

- `id`
- `userId`
- `anonymousId`
- `items`
- `currency`
- `promoCode`
- `createdAt`
- `updatedAt`
- `expiresAt`

Required fields:

- `items`
- `currency`
- `createdAt`
- `updatedAt`

Optional fields:

- `userId`
- `anonymousId`
- `promoCode`
- `deliveryEstimate`

Relationships:

- May belong to a user.
- Contains many cart items.

Validation notes:

- Browser cart state is not authoritative.
- Backend `validateCart` must re-price and validate all items before checkout.

Open questions:

- Should carts be persisted in Firestore or remain local until checkout?
- Should guest checkout be supported?

## CartItem

Purpose:

- Represents one intended purchasable variant and quantity in a cart.

Key fields:

- `id`
- `productId`
- `variantId`
- `quantity`
- `selectedOptions`
- `displaySnapshot`

Required fields:

- `productId`
- `quantity`

Optional fields:

- `variantId`
- `selectedOptions`
- `displaySnapshot`
- `customization`

Relationships:

- References product and optionally variant.
- Converts into an order item after checkout.

Validation notes:

- Quantity must be positive.
- Backend must validate product status, variant status, price, stock, and custom option rules.
- Cart item identity should include selected variant/options, not only product ID.

Open questions:

- Which custom options affect price?
- Can the same product appear multiple times with different custom options?

## Order

Purpose:

- Represents a customer purchase workflow and fulfillment record.

Key fields:

- `id`
- `orderNumber`
- `userId`
- `customerEmail`
- `items`
- `currency`
- `subtotalMinor`
- `discountMinor`
- `shippingMinor`
- `taxMinor`
- `totalMinor`
- `status`
- `paymentStatus`
- `fulfillmentStatus`
- `shippingAddress`
- `billingAddress`
- `paymentId`
- `createdAt`
- `updatedAt`

Required fields:

- `orderNumber`
- `items`
- `currency`
- `subtotalMinor`
- `totalMinor`
- `status`
- `paymentStatus`
- `createdAt`

Optional fields:

- `userId`
- `customerEmail`
- `discountMinor`
- `shippingMinor`
- `taxMinor`
- `fulfillmentStatus`
- `shippingAddress`
- `billingAddress`
- `paymentId`
- `notes`
- `cancelledAt`

Relationships:

- Belongs to a customer profile if authenticated.
- Contains order item snapshots.
- May reference one payment record.

Validation notes:

- Order totals must be created or verified by backend.
- Payment status must only change from trusted backend/webhook events.
- Order item snapshots must preserve product and price at time of purchase.

Open questions:

- Should guest orders be allowed?
- What order statuses should be visible to customers?

## OrderItem

Purpose:

- Captures an immutable snapshot of a purchased item.

Key fields:

- `productId`
- `variantId`
- `sku`
- `name`
- `selectedOptions`
- `quantity`
- `unitPriceMinor`
- `lineTotalMinor`
- `imageUrl`

Required fields:

- `productId`
- `name`
- `quantity`
- `unitPriceMinor`
- `lineTotalMinor`

Optional fields:

- `variantId`
- `sku`
- `selectedOptions`
- `customization`
- `imageUrl`

Relationships:

- Embedded in orders.
- References historical product/variant IDs for admin lookup.

Validation notes:

- Must be generated from backend-validated cart data.
- Do not recalculate old orders from current product records.

Open questions:

- Should custom measurement details be included in order items or a separate custom order record?

## CustomerProfile

Purpose:

- Stores customer account data not already covered by Firebase Auth.

Key fields:

- `userId`
- `email`
- `displayName`
- `phone`
- `defaultShippingAddressId`
- `defaultBillingAddressId`
- `marketingOptIn`
- `createdAt`
- `updatedAt`

Required fields:

- `userId`
- `email`
- `createdAt`

Optional fields:

- `displayName`
- `phone`
- `defaultShippingAddressId`
- `defaultBillingAddressId`
- `marketingOptIn`

Relationships:

- Belongs to a Firebase Auth user.
- Has many addresses.
- Has many orders.

Validation notes:

- Users can update only their own allowed profile fields.
- Admin-only fields must not be user-writable.

Open questions:

- Are customer accounts required for checkout?
- Is phone required for delivery?

## Address

Purpose:

- Represents a reusable shipping or billing address.

Key fields:

- `id`
- `userId`
- `type`
- `name`
- `line1`
- `line2`
- `city`
- `region`
- `postalCode`
- `country`
- `phone`
- `isDefault`

Required fields:

- `userId`
- `name`
- `line1`
- `city`
- `postalCode`
- `country`

Optional fields:

- `type`
- `line2`
- `region`
- `phone`
- `isDefault`

Relationships:

- Belongs to a customer profile.
- May be copied into orders as a snapshot.

Validation notes:

- Validate country and postal requirements by supported shipping region.
- Order addresses should be snapshots, not live references.

Open questions:

- Which countries are supported at launch?
- Is local pickup required?

## AdminUser

Purpose:

- Represents a user authorized to manage commerce data.

Key fields:

- `uid`
- `email`
- `role`
- `permissions`
- `createdAt`
- `createdBy`
- `disabledAt`

Required fields:

- `uid`
- `email`
- `role`

Optional fields:

- `permissions`
- `createdBy`
- `disabledAt`

Relationships:

- Maps to Firebase Auth user.
- May be stored in `admins/{uid}` initially.
- May later be mirrored into custom claims.

Validation notes:

- Users must not be able to grant themselves admin access.
- Admin writes should be auditable.

Open questions:

- Who are launch admins?
- Is one admin role enough, or are manager/support roles needed?

## Payment

Purpose:

- Records payment provider state associated with an order.

Key fields:

- `id`
- `orderId`
- `provider`
- `providerSessionId`
- `providerPaymentIntentId`
- `amountMinor`
- `currency`
- `status`
- `createdAt`
- `updatedAt`
- `rawEventIds`

Required fields:

- `orderId`
- `provider`
- `amountMinor`
- `currency`
- `status`

Optional fields:

- `providerSessionId`
- `providerPaymentIntentId`
- `failureReason`
- `refundedAmountMinor`
- `rawEventIds`

Relationships:

- Belongs to an order.
- Updated by backend webhook processing.

Validation notes:

- Payment records must not be client-writable.
- Status changes must come from verified provider events or trusted backend admin actions.

Open questions:

- Which payment provider is approved?
- Are refunds required at launch?

## InventoryMovement

Purpose:

- Optional future model for auditable stock changes.

Key fields:

- `id`
- `productId`
- `variantId`
- `type`
- `quantityDelta`
- `reason`
- `orderId`
- `adminUid`
- `createdAt`

Required fields:

- `variantId`
- `type`
- `quantityDelta`
- `createdAt`

Optional fields:

- `productId`
- `reason`
- `orderId`
- `adminUid`
- `notes`

Relationships:

- References a product variant.
- May reference an order or admin user.

Validation notes:

- Inventory movements should be backend-created.
- Negative stock should be explicitly allowed or forbidden by business rule.

Open questions:

- Is inventory tracking needed at launch?
- Should stock reserve during checkout, or only after payment confirmation?

## Order Status Proposal

Order status should describe order workflow:

- `draft`
- `pending_payment`
- `paid`
- `processing`
- `fulfilled`
- `cancelled`
- `refunded`

Payment status should be separate:

- `unpaid`
- `requires_action`
- `paid`
- `failed`
- `refunded`
- `partially_refunded`

Fulfillment status should be separate:

- `unfulfilled`
- `packed`
- `shipped`
- `delivered`
- `returned`

Open question: confirm whether these separate status dimensions are acceptable for admin workflow.
