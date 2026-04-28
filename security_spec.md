# Security Specification - OD Workroom Registrations

## Data Invariants
- A registration must have a program name, name, contact, reason, and date.
- `createdAt` must be set to the server timestamp.
- No one can delete registrations from the client.
- Only admins (defined in /admins/{uid}) can read registrations.

## The "Dirty Dozen" Payloads (All should be DENIED)
1. Missing `name` field on create.
2. `createdAt` not matching server time.
3. Modification of an existing registration (updates NOT allowed).
4. Deletion of a registration by a non-admin.
5. Reading the list of registrations without being signed in.
6. Reading the list of registrations as a signed-in user who is NOT an admin.
7. Injecting a massive string into document ID.
8. Injection of a field not in the schema during create.
9. Setting a future `createdAt` timestamp.
10. Anonymous user trying to create a registration (if auth is required).
11. Spoofing admin status by writing to `/admins`.
12. Listing all registrations without a valid query.

## Test Runner (Simplified for Rules Review)
- `create` allows if schema matches and timestamp is server time.
- `get/list` allows only if user exists in `/admins`.
- `update/delete` always false.
