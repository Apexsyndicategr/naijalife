/**
 * Firestore Security Rules Test Suite — "Dirty Dozen" Invariant Verification
 * Verifies Identity, PII Isolation, Apex Syndicate Owner Gate, Suspension Enforcement,
 * Username Uniqueness, Cloud Save Version Guard, and Audit Log Immutability.
 */

export interface SimulatedAuth {
  uid: string;
  email: string;
  email_verified: boolean;
}

export interface DirtyPayloadCase {
  id: number;
  name: string;
  collectionPath: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  auth: SimulatedAuth | null;
  payload?: Record<string, unknown>;
  expected: 'PERMISSION_DENIED' | 'ALLOW';
}

export const DIRTY_DOZEN_PAYLOADS: DirtyPayloadCase[] = [
  {
    id: 1,
    name: 'Owner Username Spoof (Wrong Email)',
    collectionPath: '/owner_roles/attacker_uid',
    operation: 'create',
    auth: { uid: 'attacker_uid', email: 'attacker@gmail.com', email_verified: true },
    payload: { uid: 'attacker_uid', email: 'kchiboy50@gmail.com', usernameLower: 'chiboy_52', role: 'owner', grantedBy: 'spoof' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 2,
    name: 'Unverified Owner Email Spoof',
    collectionPath: '/owner_roles/unverified_uid',
    operation: 'create',
    auth: { uid: 'unverified_uid', email: 'kchiboy50@gmail.com', email_verified: false },
    payload: { uid: 'unverified_uid', email: 'kchiboy50@gmail.com', usernameLower: 'chiboy_52', role: 'owner', grantedBy: 'unverified' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 3,
    name: 'Self-Assigned Owner Role on User Create',
    collectionPath: '/users/citizen_uid',
    operation: 'create',
    auth: { uid: 'citizen_uid', email: 'citizen@example.com', email_verified: true },
    payload: { uid: 'citizen_uid', username: 'player123', usernameLower: 'player123', role: 'owner', accountStatus: 'active', emailVerified: true },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 4,
    name: 'Privilege Escalation Update on Users Role',
    collectionPath: '/users/citizen_uid',
    operation: 'update',
    auth: { uid: 'citizen_uid', email: 'citizen@example.com', email_verified: true },
    payload: { role: 'owner' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 5,
    name: 'Shadow Update Ghost Field Injection',
    collectionPath: '/users/citizen_uid',
    operation: 'update',
    auth: { uid: 'citizen_uid', email: 'citizen@example.com', email_verified: true },
    payload: { isAdmin: true, username: 'citizen_one', usernameLower: 'citizen_one' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 6,
    name: 'Cross-User PII Get on users_private',
    collectionPath: '/users_private/victim_uid',
    operation: 'get',
    auth: { uid: 'citizen_uid', email: 'citizen@example.com', email_verified: true },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 7,
    name: 'Cross-User PII List on users_private',
    collectionPath: '/users_private',
    operation: 'list',
    auth: { uid: 'citizen_uid', email: 'citizen@example.com', email_verified: true },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 8,
    name: 'Suspended Account Save Bypass Attempt',
    collectionPath: '/game_saves/suspended_uid',
    operation: 'update',
    auth: { uid: 'suspended_uid', email: 'bad@example.com', email_verified: true },
    payload: { uid: 'suspended_uid', version: 10, clientUpdatedAtMs: Date.now(), deviceId: 'dev1', saveData: {} },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 9,
    name: 'Username Hijack Overwrite',
    collectionPath: '/usernames/chiboy_52',
    operation: 'delete',
    auth: { uid: 'attacker_uid', email: 'attacker@example.com', email_verified: true },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 10,
    name: 'Stale Cloud Save Overwrite (Lower Version)',
    collectionPath: '/game_saves/citizen_uid',
    operation: 'update',
    auth: { uid: 'citizen_uid', email: 'citizen@example.com', email_verified: true },
    payload: { uid: 'citizen_uid', version: 1, clientUpdatedAtMs: 1000, deviceId: 'old_pc', saveData: {} },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 11,
    name: 'Oversized / Invalid Document ID Poisoning',
    collectionPath: `/usernames/${'a'.repeat(300)}`,
    operation: 'create',
    auth: { uid: 'citizen_uid', email: 'citizen@example.com', email_verified: true },
    payload: { uid: 'citizen_uid', username: 'a'.repeat(300), usernameLower: 'a'.repeat(300) },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 12,
    name: 'Owner Audit Log Non-Owner Create & Delete Tampering',
    collectionPath: '/owner_audit_logs/log_1',
    operation: 'delete',
    auth: { uid: 'owner_uid', email: 'kchiboy50@gmail.com', email_verified: true },
    expected: 'PERMISSION_DENIED',
  },
];
