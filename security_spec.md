# Firebase Security Specification - Cee Hatinators

## 1. Data Invariants

1.  **Products**: Any user can read product data. Only admins can create, update, or delete products.
    *   Price must be a positive number.
    *   Stock must be a non-negative number.
2.  **Users**: A user can only read and write their own profile data.
    *   `role` field is immutable for the user; only system/admin can change it.
3.  **Orders**: A user can only create an order for themselves.
    *   A user can only read their own orders.
    *   Once an order is placed, its `createdAt` and `userId` are immutable.
    *   `status` can only be updated by admins, or transitioned from 'pending' to 'cancelled' by the owner if applicable.

## 2. The "Dirty Dozen" Payloads

1.  **Product Spoofing**: Attempt to update product price to £0.01 as a non-admin.
2.  **Product Creation**: Attempt to create a new product as a customer.
3.  **Identity Theft**: Attempt to read user `B`'s profile signed in as user `A`.
4.  **Role Escalation**: Attempt to update own `role` to 'admin'.
5.  **Order Hijacking**: Attempt to read user `B`'s order list as user `A`.
6.  **Fake Order**: Attempt to create an order with `userId` of another user.
7.  **Status Tampering**: Attempt to mark an order as 'delivered' as a customer.
8.  **Immutable Mutation**: Attempt to change `createdAt` on an existing order.
9.  **Recursive Cost**: Attempt to list all products without being signed in (if forbidden, else check for resource exhaustion).
10. **Huge Payload**: Attempt to write a 1MB string into a product name field.
11. **Shadow Update**: Attempt to add a `isVerified: true` field to a user profile.
12. **Orphaned Write**: Attempt to create an order for a non-existent user ID.

## 3. Test Runner Definition

*(Simplified test cases for firestore.rules)*
