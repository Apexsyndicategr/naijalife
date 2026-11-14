# Naija Life Security Specification & Threat Model

## 1. Data Invariants
1. **Identity Integrity**: Every document under `/users/{uid}`, `/users_private/{uid}`, `/profiles/{uid}`, and `/game_saves/{uid}` belongs strictly to the Firebase Auth user matching `{uid}` (`request.auth.uid == uid`).
2. **Username Uniqueness & Format**: Usernames must be 3–24 characters matching `^[a-zA-Z0-9_.-]+$` and canonically unique via `/usernames/{usernameLower}` (`^[a-z0-9_.-]+$`). Duplicate usernames are atomically rejected.
3. **PII Isolation**: Emails and Dates of Birth are stored exclusively in `/users_private/{uid}`. Public or cross-player reads never expose `email` or `dateOfBirth`. Only `{uid}` itself or the verified Apex Syndicate Owner may read `/users_private/{uid}`.
4. **Password & Token Protection**: Passwords are never stored in Firestore or JSON files. Authentication relies strictly on Firebase Auth password hashing. Auth tokens and reset links are never persisted in Firestore.
5. **Apex Syndicate Owner Gate**: Owner privileges require BOTH:
   - `request.auth.token.email_verified == true` AND `request.auth.token.email == 'kchiboy50@gmail.com'`
   - Registered `usernameLower == 'chiboy_52'` in `/users/{uid}` and corresponding `/owner_roles/{uid}`.
   - Username `chiboy_52` alone with any other email MUST NOT grant owner access.
   - `kchiboy50@gmail.com` with `email_verified == false` MUST NOT grant owner access.
6. **Privilege Escalation Prevention**: Ordinary citizens cannot create `/users/{uid}` with `role: 'owner'` or `accountStatus: 'suspended'`, and cannot modify `role`, `accountStatus`, `uid`, or `createdAt` on updates.
7. **Suspension Enforcement**: Once `/users/{uid}.accountStatus == 'suspended'`, the affected user cannot update `/users/{uid}`, `/profiles/{uid}`, or `/game_saves/{uid}`.
8. **Cloud Save Monotonicity**: Updating `/game_saves/{uid}` requires `incoming().version >= existing().version` so an older local save cannot overwrite a newer cloud save.
9. **Audit Immutability**: `/owner_audit_logs/{logId}` is append-only by the verified Owner; updates and deletes are unconditionally denied.

## 2. The "Dirty Dozen" Attack Payloads
1. **Owner Username Spoof (Email Mismatch)**: User with `email: "attacker@gmail.com", email_verified: true` attempts to create `/owner_roles/{uid}` with `usernameLower: "chiboy_52"`. -> **DENIED**.
2. **Unverified Owner Email Spoof**: User with `email: "kchiboy50@gmail.com", email_verified: false` attempts to create `/owner_roles/{uid}` or read `/users_private/{otherUid}`. -> **DENIED**.
3. **Self-Assigned Owner Role on Registration**: Attacker registers and sends `{ role: "owner", accountStatus: "active" }` to `/users/{attackerUid}`. -> **DENIED**.
4. **Self-Privilege Escalation via Update**: Citizen attempts `updateDoc(/users/{uid}, { role: "owner" })`. -> **DENIED**.
5. **Shadow Update / Ghost Field Injection**: Citizen includes unexpected field `{ isAdmin: true }` in `/users/{uid}` or `/profiles/{uid}` update. -> **DENIED**.
6. **Cross-User PII Scraping (Get)**: Citizen A attempts `getDoc(/users_private/{citizenB})`. -> **DENIED**.
7. **Cross-User PII Scraping (List)**: Citizen A attempts `getDocs(/users_private)`. -> **DENIED**.
8. **Suspended User Write Bypass**: Citizen with `accountStatus: "suspended"` attempts to update `/profiles/{uid}` or `/game_saves/{uid}`. -> **DENIED**.
9. **Username Hijack / Overwrite**: Attacker attempts to overwrite or delete `/usernames/chiboy_52` owned by another `uid`. -> **DENIED**.
10. **Stale Cloud Save Overwrite**: Device with `version: 2` attempts to overwrite `/game_saves/{uid}` currently at `version: 5`. -> **DENIED**.
11. **Oversized ID / Resource Poisoning**: Attacker sends a 500-character document ID or invalid regex characters to `/users/{badId}` or `/usernames/{badId}`. -> **DENIED**.
12. **Audit Log Tampering**: Even a user or attacker attempts `updateDoc` or `deleteDoc` on `/owner_audit_logs/{logId}`, or a non-owner attempts `create`. -> **DENIED**.
