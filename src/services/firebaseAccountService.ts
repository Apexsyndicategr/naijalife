/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  deleteUser,
  EmailAuthProvider,
  GoogleAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  sendEmailVerification,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updatePassword,
  User,
  verifyBeforeUpdateEmail,
} from 'firebase/auth';
import {
  collection,
  deleteField,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { auth, db, firebaseConfig, handleFirestoreError, OperationType } from '../firebase';
import { InvestmentAsset, PropertyAsset, UserProfile, VehicleAsset } from '../types/game';
import { SavedGameState } from '../types/saveGame';
import {
  isStrictOwnerIdentity,
  mapFirebaseAuthError,
  OWNER_EMAIL,
  OWNER_USERNAME,
  validateBirthdayInput,
  validateEmailInput,
  validatePasswordStrength,
  validateUsernameInput,
} from '../utils/authValidation';

export interface CloudUserAccount {
  uid: string;
  username: string;
  usernameLower: string;
  role: 'citizen' | 'owner';
  accountStatus: 'active' | 'suspended';
  emailVerified: boolean;
  suspensionReason?: string;
  suspendedBy?: string;
  suspendedAt?: unknown;
  createdAt?: unknown;
  updatedAt?: unknown;
  lastLoginAt?: unknown;
}

export interface CloudPrivateInfo {
  uid: string;
  email: string;
  emailLower: string;
  dateOfBirth: string;
  lastDevice?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
  lastLoginAt?: unknown;
}

export interface CloudGameSaveDoc {
  uid: string;
  version: number;
  clientUpdatedAtMs: number;
  deviceId: string;
  saveData: SavedGameState & {
    ownedProperties?: PropertyAsset[];
    activeHome?: PropertyAsset | null;
    ownedVehicles?: VehicleAsset[];
    activeVehicle?: VehicleAsset | null;
    investments?: InvestmentAsset[];
  };
  updatedAt?: unknown;
}

export interface RegistryCitizenEntry {
  uid: string;
  username: string;
  usernameLower: string;
  email: string;
  role: 'citizen' | 'owner';
  accountStatus: 'active' | 'suspended';
  emailVerified: boolean;
  suspensionReason?: string;
  createdAtIso: string;
  lastLoginIso: string;
  stateOfOrigin?: string;
  socialClass?: string;
  phoneModel?: string;
  bankNaira?: number;
  bankCAD?: number;
  gender?: string;
}

export interface OwnerAuditLogEntry {
  id: string;
  actorUid: string;
  actorEmail: string;
  action: string;
  targetUid?: string;
  targetUsername?: string;
  details: string;
  createdAtIso: string;
}

const DEVICE_ID_KEY = 'naija_life_device_id_v1';

export function getOrCreateDeviceId(): string {
  try {
    const existing = localStorage.getItem(DEVICE_ID_KEY);
    if (existing) return existing;
    const generated = `dev_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    localStorage.setItem(DEVICE_ID_KEY, generated);
    return generated;
  } catch {
    return `dev_${Date.now().toString(36)}`;
  }
}

export function getDeviceSummary(): string {
  if (typeof navigator === 'undefined') return 'Unknown Device';
  const ua = navigator.userAgent || '';
  if (/iPhone|iPad/i.test(ua)) return 'iOS Mobile';
  if (/Android/i.test(ua)) return 'Android Mobile';
  if (/Mac/i.test(ua)) return 'macOS Desktop';
  if (/Windows/i.test(ua)) return 'Windows Desktop';
  if (/Linux/i.test(ua)) return 'Linux Desktop';
  return 'Web Browser';
}

export function timestampToIso(ts: unknown): string {
  if (!ts) return '';
  if (typeof ts === 'string') return ts;
  if (typeof ts === 'number') return new Date(ts).toISOString();
  if (typeof ts === 'object' && ts !== null) {
    const rec = ts as { toDate?: () => Date; seconds?: number };
    if (typeof rec.toDate === 'function') return rec.toDate().toISOString();
    if (typeof rec.seconds === 'number') return new Date(rec.seconds * 1000).toISOString();
  }
  return '';
}

const ALLOWED_PROFILE_CLOUD_KEYS = new Set([
  'uid',
  'username',
  'usernameLower',
  'citizenName',
  'firstName',
  'lastName',
  'spawnStateId',
  'lastLocationStateId',
  'currentCountry',
  'socialClass',
  'phoneModel',
  'cashNaira',
  'bankNaira',
  'loanBalanceNGN',
  'savingsBalanceNGN',
  'cashUSD',
  'cashGBP',
  'cashEUR',
  'bankCAD',
  'savingsCAD',
  'energy',
  'hunger',
  'health',
  'happiness',
  'fatherRentSubsidyPct',
  'avatar',
  'inventory',
  'completedCourses',
  'furnitureBought',
  'receipts',
  'alerts',
  'ownedBusinesses',
  'ownedDocuments',
  'phoneWallpaper',
  'savedNotes',
  'academyProgress',
  'activeJobId',
  'jobTitle',
  'jobLevel',
  'jobRank',
  'jobShiftsWorked',
  'jobWeeklySalaryNGN',
  'jobAutoAttend',
  'snapUsername',
  'isSnapPlus',
]);

/**
 * Strips sensitive PII (email, gmail, dateOfBirth, password) and owner privilege flags
 * before persisting game profile fields to /profiles/{uid}.
 */
export function buildFirestoreProfilePayload(
  profile: Partial<UserProfile>,
  uid: string,
  includeCreatedAt = false
): Record<string, unknown> {
  const clean: Record<string, unknown> = {
    uid,
    updatedAt: serverTimestamp(),
  };

  if (includeCreatedAt) {
    clean.createdAt = serverTimestamp();
  }

  for (const [k, v] of Object.entries(profile)) {
    if (!ALLOWED_PROFILE_CLOUD_KEYS.has(k) || v === undefined) continue;
    if (k === 'uid') continue;
    try {
      clean[k] = typeof v === 'object' && v !== null ? JSON.parse(JSON.stringify(v)) : v;
    } catch {
      clean[k] = v;
    }
  }

  const uname = String(profile.username || '').trim();
  if (uname) {
    clean.username = uname;
    clean.usernameLower = uname.toLowerCase();
  }

  if (Array.isArray(clean.inventory)) clean.inventory = clean.inventory.slice(0, 200);
  if (Array.isArray(clean.completedCourses)) clean.completedCourses = clean.completedCourses.slice(0, 200);
  if (Array.isArray(clean.furnitureBought)) clean.furnitureBought = clean.furnitureBought.slice(0, 200);
  if (Array.isArray(clean.receipts)) clean.receipts = clean.receipts.slice(0, 500);
  if (Array.isArray(clean.alerts)) clean.alerts = clean.alerts.slice(0, 200);
  if (Array.isArray(clean.ownedBusinesses)) clean.ownedBusinesses = clean.ownedBusinesses.slice(0, 100);
  if (Array.isArray(clean.ownedDocuments)) clean.ownedDocuments = clean.ownedDocuments.slice(0, 100);

  return clean;
}

export function hydrateUserProfile(
  uid: string,
  account: CloudUserAccount,
  privateInfo: CloudPrivateInfo | null,
  cloudProfile: Record<string, unknown> | null,
  ownerVerified: boolean
): UserProfile {
  const email = privateInfo?.email || auth.currentUser?.email || '';
  const SEXTILLION_999 = 9.99e23;

  const baseProfile: UserProfile = {
    uid,
    username: account.username,
    citizenName: String(cloudProfile?.citizenName || account.username),
    firstName: String(cloudProfile?.firstName || account.username),
    lastName: String(cloudProfile?.lastName || 'Citizen'),
    email,
    gmail: email,
    dateOfBirth: privateInfo?.dateOfBirth || '',
    createdAt: timestampToIso(account.createdAt) || new Date().toISOString(),
    role: ownerVerified ? 'owner' : 'citizen',
    accountStatus: account.accountStatus || 'active',
    isOwner: ownerVerified,
    isOwnerAccount: ownerVerified,
    isVerified: account.emailVerified,
    avatar: (cloudProfile?.avatar as UserProfile['avatar']) || {
      gender: 'male',
      skinTone: '#8d5524',
      hairstyle: 'fade',
      hairColor: '#18181b',
      outfit: 'streetwear',
      pants: 'jeans',
      shoes: 'sneakers',
      accessory: 'none',
    },
    spawnStateId: String(cloudProfile?.spawnStateId || 'lagos'),
    lastLocationStateId: String(cloudProfile?.lastLocationStateId || cloudProfile?.spawnStateId || 'lagos'),
    currentCountry: (cloudProfile?.currentCountry as 'nigeria' | 'canada') || 'nigeria',
    socialClass: ownerVerified ? 'nepo' : ((cloudProfile?.socialClass as UserProfile['socialClass']) || 'mapo'),
    phoneModel: ownerVerified ? 'iphone_18_pm' : String(cloudProfile?.phoneModel || 'samsung_s24_base'),
    cashNaira: ownerVerified ? SEXTILLION_999 : Number(cloudProfile?.cashNaira ?? 50000),
    bankNaira: ownerVerified ? SEXTILLION_999 : Number(cloudProfile?.bankNaira ?? 100000),
    loanBalanceNGN: ownerVerified ? 0 : Number(cloudProfile?.loanBalanceNGN ?? 0),
    savingsBalanceNGN: Number(cloudProfile?.savingsBalanceNGN ?? 0),
    cashUSD: ownerVerified ? 1000000000 : Number(cloudProfile?.cashUSD ?? 0),
    cashGBP: ownerVerified ? 1000000000 : Number(cloudProfile?.cashGBP ?? 0),
    cashEUR: ownerVerified ? 1000000000 : Number(cloudProfile?.cashEUR ?? 0),
    bankCAD: ownerVerified ? SEXTILLION_999 : Number(cloudProfile?.bankCAD ?? 0),
    savingsCAD: ownerVerified ? SEXTILLION_999 : Number(cloudProfile?.savingsCAD ?? 0),
    energy: Number(cloudProfile?.energy ?? 100),
    hunger: Number(cloudProfile?.hunger ?? 95),
    health: Number(cloudProfile?.health ?? 100),
    happiness: Number(cloudProfile?.happiness ?? 90),
    inventory: Array.isArray(cloudProfile?.inventory) ? (cloudProfile.inventory as string[]) : [],
    fatherRentSubsidyPct: ownerVerified ? 100 : Number(cloudProfile?.fatherRentSubsidyPct ?? 35),
    completedCourses: Array.isArray(cloudProfile?.completedCourses) ? (cloudProfile.completedCourses as string[]) : [],
    academyProgress: (cloudProfile?.academyProgress as Record<string, unknown>) || undefined,
    activeJobId: cloudProfile?.activeJobId ? String(cloudProfile.activeJobId) : undefined,
    jobTitle: cloudProfile?.jobTitle ? String(cloudProfile.jobTitle) : undefined,
    jobLevel: cloudProfile?.jobLevel !== undefined ? Number(cloudProfile.jobLevel) : undefined,
    jobRank: cloudProfile?.jobRank ? String(cloudProfile.jobRank) : undefined,
    jobShiftsWorked: cloudProfile?.jobShiftsWorked !== undefined ? Number(cloudProfile.jobShiftsWorked) : undefined,
    jobWeeklySalaryNGN: cloudProfile?.jobWeeklySalaryNGN !== undefined ? Number(cloudProfile.jobWeeklySalaryNGN) : undefined,
    jobAutoAttend: cloudProfile?.jobAutoAttend !== undefined ? Boolean(cloudProfile.jobAutoAttend) : undefined,
    furnitureBought: Array.isArray(cloudProfile?.furnitureBought) ? (cloudProfile.furnitureBought as string[]) : [],
    receipts: Array.isArray(cloudProfile?.receipts) ? (cloudProfile.receipts as UserProfile['receipts']) : [],
    alerts: Array.isArray(cloudProfile?.alerts) ? (cloudProfile.alerts as UserProfile['alerts']) : [],
    savedNotes: Array.isArray(cloudProfile?.savedNotes) ? (cloudProfile.savedNotes as string[]) : undefined,
    phoneWallpaper: cloudProfile?.phoneWallpaper ? String(cloudProfile.phoneWallpaper) : undefined,
    ownedBusinesses: Array.isArray(cloudProfile?.ownedBusinesses) ? (cloudProfile.ownedBusinesses as UserProfile['ownedBusinesses']) : [],
    ownedDocuments: Array.isArray(cloudProfile?.ownedDocuments) ? (cloudProfile.ownedDocuments as UserProfile['ownedDocuments']) : [],
    snapUsername: cloudProfile?.snapUsername ? String(cloudProfile.snapUsername) : undefined,
    isSnapPlus: ownerVerified || Boolean(cloudProfile?.isSnapPlus),
  };

  return baseProfile;
}

/**
 * Checks whether a username is available on the online Firestore registry.
 */
export async function checkUsernameAvailable(username: string): Promise<{
  available: boolean;
  normalized: string;
  error?: string;
}> {
  const validation = validateUsernameInput(username);
  if (!validation.valid) {
    return { available: false, normalized: validation.normalized, error: validation.error };
  }
  const path = `usernames/${validation.normalized}`;
  try {
    const snap = await getDoc(doc(db, 'usernames', validation.normalized));
    if (snap.exists()) {
      return {
        available: false,
        normalized: validation.normalized,
        error: `Username "${validation.trimmed}" is already taken. Please choose another.`,
      };
    }
    return { available: true, normalized: validation.normalized };
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }
}

/**
 * Calls server-side owner verification & provisioning endpoint.
 * Strictly requires Firebase ID Token where verified email === kchiboy50@gmail.com AND username === chiboy_52.
 */
export async function verifyAndProvisionOwnerServerSide(user: User, username: string): Promise<boolean> {
  const idToken = await user.getIdToken(true);
  const emailLower = String(user.email || '').trim().toLowerCase();
  const unameLower = String(username || '').trim().toLowerCase();

  try {
    const res = await fetch('/api/auth/verify-owner', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ username: unameLower }),
    });

    if (!res.ok) {
      return false;
    }

    const data = await res.json();
    const serverConfirmedOwner = data?.isOwner === true && data?.role === 'owner';

    if (
      serverConfirmedOwner &&
      user.emailVerified &&
      emailLower === OWNER_EMAIL &&
      unameLower === OWNER_USERNAME
    ) {
      // Ensure Firestore owner_roles/{uid} and users/{uid}.role = 'owner' are synced under security rules
      const ownerRoleRef = doc(db, 'owner_roles', user.uid);
      const ownerRoleSnap = await getDoc(ownerRoleRef);
      if (!ownerRoleSnap.exists()) {
        await setDoc(ownerRoleRef, {
          uid: user.uid,
          email: OWNER_EMAIL,
          usernameLower: OWNER_USERNAME,
          role: 'owner',
          grantedBy: 'apex-syndicate-server',
          grantedAt: serverTimestamp(),
        });
      }
      await updateDoc(doc(db, 'users', user.uid), {
        role: 'owner',
        emailVerified: true,
        lastLoginAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      const logId = `audit_prov_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      await setDoc(doc(db, 'owner_audit_logs', logId), {
        id: logId,
        actorUid: user.uid,
        actorEmail: OWNER_EMAIL,
        action: 'PROVISION_OWNER',
        targetUid: user.uid,
        targetUsername: OWNER_USERNAME,
        details: 'Verified Apex Syndicate owner identity provisioned via server-side verification.',
        createdAt: serverTimestamp(),
      }).catch(() => {});

      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export async function registerCitizenAccount(params: {
  email: string;
  username: string;
  dateOfBirth: string;
  password: string;
  confirmPassword: string;
  starterProfile: UserProfile;
}): Promise<{ user: User; account: CloudUserAccount; privateInfo: CloudPrivateInfo }> {
  const emailCheck = validateEmailInput(params.email);
  if (!emailCheck.valid) throw new Error(emailCheck.error);

  const usernameCheck = validateUsernameInput(params.username);
  if (!usernameCheck.valid) throw new Error(usernameCheck.error);

  const dobCheck = validateBirthdayInput(params.dateOfBirth);
  if (!dobCheck.valid) throw new Error(dobCheck.error);

  const pwdCheck = validatePasswordStrength(params.password);
  if (!pwdCheck.valid) throw new Error(pwdCheck.error);

  if (params.password !== params.confirmPassword) {
    throw new Error('Passwords do not match.');
  }

  // Backend pre-validation (enforces identical validation rules on server)
  try {
    const valRes = await fetch('/api/auth/validate-registration', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: emailCheck.normalized,
        username: usernameCheck.trimmed,
        dateOfBirth: params.dateOfBirth,
        password: params.password,
      }),
    });
    if (!valRes.ok) {
      const errBody = await valRes.json().catch(() => ({}));
      if (errBody?.error) throw new Error(errBody.error);
    }
  } catch (err) {
    if (err instanceof Error && !err.message.includes('Failed to fetch')) {
      throw err;
    }
  }

  // Pre-check username availability before creating Firebase Auth account
  const availability = await checkUsernameAvailable(usernameCheck.trimmed);
  if (!availability.available) {
    throw new Error(availability.error || 'Username is already taken.');
  }

  let createdUser: User | null = null;
  try {
    await setPersistence(auth, browserLocalPersistence);
    const cred = await createUserWithEmailAndPassword(auth, emailCheck.normalized, params.password);
    createdUser = cred.user;

    // Send real Firebase email verification immediately
    await sendEmailVerification(createdUser);

    const uid = createdUser.uid;
    const usernameRef = doc(db, 'usernames', usernameCheck.normalized);
    const userRef = doc(db, 'users', uid);
    const privateRef = doc(db, 'users_private', uid);
    const profileRef = doc(db, 'profiles', uid);

    const accountDoc: CloudUserAccount = {
      uid,
      username: usernameCheck.trimmed,
      usernameLower: usernameCheck.normalized,
      role: 'citizen', // Never assign owner at registration!
      accountStatus: 'active',
      emailVerified: false,
    };

    const privateDoc: CloudPrivateInfo = {
      uid,
      email: emailCheck.normalized,
      emailLower: emailCheck.normalized,
      dateOfBirth: params.dateOfBirth,
      lastDevice: getDeviceSummary(),
    };

    const profilePayload = buildFirestoreProfilePayload(
      {
        ...params.starterProfile,
        username: usernameCheck.trimmed,
        isOwner: false,
        isOwnerAccount: false,
        isVerified: false,
      },
      uid,
      true
    );

    await runTransaction(db, async (tx) => {
      const existingUname = await tx.get(usernameRef);
      if (existingUname.exists()) {
        throw new Error(`USERNAME_TAKEN:${usernameCheck.trimmed}`);
      }

      tx.set(usernameRef, {
        uid,
        username: usernameCheck.trimmed,
        usernameLower: usernameCheck.normalized,
        createdAt: serverTimestamp(),
      });

      tx.set(userRef, {
        ...accountDoc,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
      });

      tx.set(privateRef, {
        ...privateDoc,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
      });

      tx.set(profileRef, profilePayload);
    });

    return { user: createdUser, account: accountDoc, privateInfo: privateDoc };
  } catch (err) {
    // Roll back orphan Firebase Auth user if username was claimed concurrently
    if (createdUser && err instanceof Error && err.message.startsWith('USERNAME_TAKEN:')) {
      try {
        await deleteUser(createdUser);
      } catch {}
      throw new Error(`Username "${usernameCheck.trimmed}" is already taken! Please choose another.`);
    }
    throw new Error(mapFirebaseAuthError(err));
  }
}

export type LoginResult =
  | { status: 'NEEDS_VERIFICATION'; user: User; email: string }
  | { status: 'NEEDS_PROFILE_COMPLETION'; user: User; email: string }
  | { status: 'SUSPENDED'; user: User; reason: string }
  | {
      status: 'AUTHENTICATED';
      user: User;
      account: CloudUserAccount;
      privateInfo: CloudPrivateInfo | null;
      profile: UserProfile;
      cloudSave: CloudGameSaveDoc | null;
      isOwner: boolean;
    };

export async function checkEmailPasswordProviderEnabled(): Promise<boolean> {
  if (!firebaseConfig.apiKey) return true;
  try {
    const resp = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseConfig.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'provider-check@invalid.local',
          password: 'CheckOnly123!',
          returnSecureToken: false,
        }),
      }
    );
    const data = (await resp.json().catch(() => ({}))) as { error?: { message?: string } };
    const msg = String(data?.error?.message || '');
    if (msg.includes('PASSWORD_LOGIN_DISABLED') || msg.includes('OPERATION_NOT_ALLOWED')) {
      return false;
    }
    return true;
  } catch {
    return true;
  }
}

export async function signInWithGooglePopup(rememberMe = true): Promise<LoginResult> {
  try {
    await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const cred = await signInWithPopup(auth, provider);
    await cred.user.reload();
    return await loadAuthenticatedCitizenSession(cred.user);
  } catch (err) {
    throw new Error(mapFirebaseAuthError(err));
  }
}

export async function completeGoogleCitizenRegistration(params: {
  user: User;
  username: string;
  dateOfBirth: string;
  starterProfile: UserProfile;
}): Promise<LoginResult> {
  const { user } = params;
  const emailCheck = validateEmailInput(user.email || '');
  if (!emailCheck.valid) {
    throw new Error(emailCheck.error || 'Your Google account did not provide a valid email address.');
  }

  const usernameCheck = validateUsernameInput(params.username);
  if (!usernameCheck.valid) throw new Error(usernameCheck.error);

  const dobCheck = validateBirthdayInput(params.dateOfBirth);
  if (!dobCheck.valid) throw new Error(dobCheck.error);

  const availability = await checkUsernameAvailable(usernameCheck.trimmed);
  if (!availability.available) {
    throw new Error(availability.error || 'Username is already taken.');
  }

  const uid = user.uid;
  const usernameRef = doc(db, 'usernames', usernameCheck.normalized);
  const userRef = doc(db, 'users', uid);
  const privateRef = doc(db, 'users_private', uid);
  const profileRef = doc(db, 'profiles', uid);
  const verifiedNow = user.emailVerified === true;

  const accountDoc: CloudUserAccount = {
    uid,
    username: usernameCheck.trimmed,
    usernameLower: usernameCheck.normalized,
    role: 'citizen', // Owner role is ONLY granted server-side via verifyAndProvisionOwnerServerSide
    accountStatus: 'active',
    emailVerified: verifiedNow,
  };

  const privateDoc: CloudPrivateInfo = {
    uid,
    email: emailCheck.normalized,
    emailLower: emailCheck.normalized,
    dateOfBirth: params.dateOfBirth,
    lastDevice: getDeviceSummary(),
  };

  const profilePayload = buildFirestoreProfilePayload(
    {
      ...params.starterProfile,
      username: usernameCheck.trimmed,
      isOwner: false,
      isOwnerAccount: false,
      isVerified: verifiedNow,
    },
    uid,
    true
  );

  try {
    await runTransaction(db, async (tx) => {
      const existingUname = await tx.get(usernameRef);
      if (existingUname.exists()) {
        throw new Error(`USERNAME_TAKEN:${usernameCheck.trimmed}`);
      }

      tx.set(usernameRef, {
        uid,
        username: usernameCheck.trimmed,
        usernameLower: usernameCheck.normalized,
        createdAt: serverTimestamp(),
      });

      tx.set(userRef, {
        ...accountDoc,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
      });

      tx.set(privateRef, {
        ...privateDoc,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
      });

      tx.set(profileRef, profilePayload);
    });

    return await loadAuthenticatedCitizenSession(user);
  } catch (err) {
    if (err instanceof Error && err.message.startsWith('USERNAME_TAKEN:')) {
      throw new Error(`Username "${usernameCheck.trimmed}" is already taken! Please choose another.`);
    }
    throw new Error(mapFirebaseAuthError(err));
  }
}

export async function loginCitizenAccount(params: {
  email: string;
  password: string;
  rememberMe: boolean;
}): Promise<LoginResult> {
  const emailCheck = validateEmailInput(params.email);
  if (!emailCheck.valid) throw new Error(emailCheck.error);
  if (!params.password) throw new Error('Password is required.');

  try {
    await setPersistence(auth, params.rememberMe ? browserLocalPersistence : browserSessionPersistence);
    const cred = await signInWithEmailAndPassword(auth, emailCheck.normalized, params.password);
    await cred.user.reload();

    if (!cred.user.emailVerified) {
      return {
        status: 'NEEDS_VERIFICATION',
        user: cred.user,
        email: cred.user.email || emailCheck.normalized,
      };
    }

    return await loadAuthenticatedCitizenSession(cred.user);
  } catch (err) {
    throw new Error(mapFirebaseAuthError(err));
  }
}

export async function loadAuthenticatedCitizenSession(user: User): Promise<LoginResult> {
  await user.reload();
  if (!user.emailVerified) {
    return {
      status: 'NEEDS_VERIFICATION',
      user,
      email: user.email || '',
    };
  }

  const uid = user.uid;
  const userDocRef = doc(db, 'users', uid);
  const privateDocRef = doc(db, 'users_private', uid);
  const profileDocRef = doc(db, 'profiles', uid);
  const saveDocRef = doc(db, 'game_saves', uid);

  let accountSnap;
  try {
    accountSnap = await getDoc(userDocRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `users/${uid}`);
  }

  if (!accountSnap.exists()) {
    return {
      status: 'NEEDS_PROFILE_COMPLETION',
      user,
      email: user.email || '',
    };
  }

  let account = accountSnap.data() as CloudUserAccount;

  // Enforce suspension block immediately
  if (account.accountStatus === 'suspended') {
    return {
      status: 'SUSPENDED',
      user,
      reason: account.suspensionReason || 'Your account has been suspended by Naija Life administration.',
    };
  }

  // Sync emailVerified and lastLoginAt (and keep email synced in users_private if updated)
  const currentEmail = String(user.email || '').trim();
  const currentEmailLower = currentEmail.toLowerCase();

  try {
    await updateDoc(userDocRef, {
      emailVerified: true,
      lastLoginAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch {}

  let privateInfo: CloudPrivateInfo | null = null;
  try {
    const privSnap = await getDoc(privateDocRef);
    if (privSnap.exists()) {
      privateInfo = privSnap.data() as CloudPrivateInfo;
      await updateDoc(privateDocRef, {
        email: currentEmail,
        emailLower: currentEmailLower,
        lastDevice: getDeviceSummary(),
        lastLoginAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }).catch(() => {});
      privateInfo = { ...privateInfo, email: currentEmail, emailLower: currentEmailLower };
    }
  } catch {}

  // Server-side owner role provisioning & strict check
  let ownerVerified = false;
  if (
    isStrictOwnerIdentity({
      email: user.email,
      emailVerified: user.emailVerified,
      username: account.usernameLower,
    })
  ) {
    ownerVerified = await verifyAndProvisionOwnerServerSide(user, account.usernameLower);
    if (ownerVerified) {
      const refreshed = await getDoc(userDocRef);
      if (refreshed.exists()) account = refreshed.data() as CloudUserAccount;
    }
  }

  let cloudProfileData: Record<string, unknown> | null = null;
  try {
    const profSnap = await getDoc(profileDocRef);
    if (profSnap.exists()) {
      cloudProfileData = profSnap.data() as Record<string, unknown>;
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `profiles/${uid}`);
  }

  let cloudSave: CloudGameSaveDoc | null = null;
  try {
    const saveSnap = await getDoc(saveDocRef);
    if (saveSnap.exists()) {
      cloudSave = saveSnap.data() as CloudGameSaveDoc;
    }
  } catch {}

  const hydratedProfile = hydrateUserProfile(uid, account, privateInfo, cloudProfileData, ownerVerified);

  return {
    status: 'AUTHENTICATED',
    user,
    account,
    privateInfo,
    profile: hydratedProfile,
    cloudSave,
    isOwner: ownerVerified,
  };
}

export async function resendCurrentUserVerification(): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('No active user session to send verification email.');
  try {
    await sendEmailVerification(user);
  } catch (err) {
    throw new Error(mapFirebaseAuthError(err));
  }
}

export async function checkEmailVerificationStatus(): Promise<{ verified: boolean }> {
  const user = auth.currentUser;
  if (!user) throw new Error('Session expired. Please log in again.');
  await user.reload();
  if (user.emailVerified) {
    await user.getIdToken(true);
    return { verified: true };
  }
  return { verified: false };
}

export async function sendPasswordReset(email: string): Promise<void> {
  const check = validateEmailInput(email);
  if (!check.valid) throw new Error(check.error);
  try {
    await sendPasswordResetEmail(auth, check.normalized);
  } catch (err) {
    throw new Error(mapFirebaseAuthError(err));
  }
}

export async function changeCitizenUsername(params: {
  oldUsername: string;
  newUsername: string;
}): Promise<{ newUsername: string }> {
  const user = auth.currentUser;
  if (!user || !user.emailVerified) {
    throw new Error('You must have a verified session to change your username.');
  }

  const check = validateUsernameInput(params.newUsername);
  if (!check.valid) throw new Error(check.error);

  const oldLower = params.oldUsername.trim().toLowerCase();
  const newLower = check.normalized;
  if (oldLower === newLower) {
    throw new Error('Please enter a different username.');
  }

  // Prevent non-owner from claiming reserved owner username or owner accidentally losing chiboy_52
  if (oldLower === OWNER_USERNAME && String(user.email || '').toLowerCase() === OWNER_EMAIL) {
    throw new Error('The Apex Syndicate Owner account must keep username "chiboy_52".');
  }

  const uid = user.uid;
  const oldRef = doc(db, 'usernames', oldLower);
  const newRef = doc(db, 'usernames', newLower);
  const userRef = doc(db, 'users', uid);
  const profileRef = doc(db, 'profiles', uid);

  try {
    await runTransaction(db, async (tx) => {
      const existingNew = await tx.get(newRef);
      if (existingNew.exists()) {
        throw new Error(`Username "${check.trimmed}" is already taken.`);
      }

      const oldSnap = await tx.get(oldRef);
      tx.set(newRef, {
        uid,
        username: check.trimmed,
        usernameLower: newLower,
        createdAt: serverTimestamp(),
      });

      if (oldSnap.exists() && oldSnap.data().uid === uid) {
        tx.delete(oldRef);
      }

      tx.update(userRef, {
        username: check.trimmed,
        usernameLower: newLower,
        updatedAt: serverTimestamp(),
      });

      tx.update(profileRef, {
        username: check.trimmed,
        usernameLower: newLower,
        updatedAt: serverTimestamp(),
      });
    });

    return { newUsername: check.trimmed };
  } catch (err) {
    if (err instanceof Error && err.message.includes('already taken')) {
      throw err;
    }
    handleFirestoreError(err, OperationType.UPDATE, `usernames/${newLower}`);
  }
}

export async function updateCitizenPassword(currentPassword: string, newPassword: string, confirmPassword: string): Promise<void> {
  const user = auth.currentUser;
  if (!user || !user.email) throw new Error('No active authenticated user.');

  const pwdCheck = validatePasswordStrength(newPassword);
  if (!pwdCheck.valid) throw new Error(pwdCheck.error);
  if (newPassword !== confirmPassword) throw new Error('New passwords do not match.');

  try {
    const cred = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, cred);
    await updatePassword(user, newPassword);
  } catch (err) {
    throw new Error(mapFirebaseAuthError(err));
  }
}

export async function requestCitizenEmailUpdate(currentPassword: string, newEmail: string): Promise<void> {
  const user = auth.currentUser;
  if (!user || !user.email) throw new Error('No active authenticated user.');

  const check = validateEmailInput(newEmail);
  if (!check.valid) throw new Error(check.error);
  if (check.normalized === user.email.toLowerCase()) {
    throw new Error('Please enter a different email address.');
  }

  try {
    const cred = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, cred);
    await verifyBeforeUpdateEmail(user, check.normalized);
  } catch (err) {
    throw new Error(mapFirebaseAuthError(err));
  }
}

export async function logoutFirebaseUser(): Promise<void> {
  await signOut(auth);
}

export function subscribeToAuthState(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

export async function syncProfileToCloud(uid: string, profile: Partial<UserProfile>): Promise<void> {
  if (!auth.currentUser || auth.currentUser.uid !== uid) return;
  const path = `profiles/${uid}`;
  try {
    const payload = buildFirestoreProfilePayload(profile, uid, false);
    await updateDoc(doc(db, 'profiles', uid), payload);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function syncGameSaveToCloud(params: {
  uid: string;
  saveState: CloudGameSaveDoc['saveData'];
  knownVersion: number;
  clientUpdatedAtMs: number;
}): Promise<{
  status: 'SYNCED' | 'CONFLICT_CLOUD_NEWER' | 'OFFLINE_ERROR';
  version: number;
  newerCloudSave?: CloudGameSaveDoc;
  error?: string;
}> {
  const { uid, saveState, knownVersion, clientUpdatedAtMs } = params;
  if (!auth.currentUser || auth.currentUser.uid !== uid || !auth.currentUser.emailVerified) {
    return { status: 'OFFLINE_ERROR', version: knownVersion, error: 'Verified session required.' };
  }

  const saveRef = doc(db, 'game_saves', uid);
  try {
    const existingSnap = await getDoc(saveRef);
    const deviceId = getOrCreateDeviceId();

    if (existingSnap.exists()) {
      const remote = existingSnap.data() as CloudGameSaveDoc;
      if (
        remote.version > knownVersion &&
        remote.clientUpdatedAtMs > clientUpdatedAtMs &&
        remote.deviceId !== deviceId
      ) {
        return {
          status: 'CONFLICT_CLOUD_NEWER',
          version: remote.version,
          newerCloudSave: remote,
        };
      }
      const nextVersion = Math.max(knownVersion, remote.version || 0) + 1;
      await setDoc(saveRef, {
        uid,
        version: nextVersion,
        clientUpdatedAtMs,
        deviceId,
        saveData: JSON.parse(JSON.stringify(saveState)),
        updatedAt: serverTimestamp(),
      });
      return { status: 'SYNCED', version: nextVersion };
    } else {
      const nextVersion = Math.max(1, knownVersion + 1);
      await setDoc(saveRef, {
        uid,
        version: nextVersion,
        clientUpdatedAtMs,
        deviceId,
        saveData: JSON.parse(JSON.stringify(saveState)),
        updatedAt: serverTimestamp(),
      });
      return { status: 'SYNCED', version: nextVersion };
    }
  } catch (err) {
    return {
      status: 'OFFLINE_ERROR',
      version: knownVersion,
      error: err instanceof Error ? err.message : 'Network error syncing save',
    };
  }
}

// =========================================================================
// OWNER REGISTRY, ACCOUNT MANAGEMENT & AUDIT LOGS (STRICTLY VERIFIED OWNER)
// =========================================================================

export async function fetchOwnerCitizenRegistry(): Promise<{
  citizens: RegistryCitizenEntry[];
  metrics: {
    total: number;
    verified: number;
    unverified: number;
    recent: number;
    suspended: number;
    active: number;
  };
}> {
  const user = auth.currentUser;
  if (!user) throw new Error('Authentication required.');
  const idToken = await user.getIdToken(true);

  // Backend authorization check first
  const authCheck = await fetch('/api/owner/verify-access', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ action: 'VIEW_REGISTRY' }),
  });

  if (!authCheck.ok) {
    const body = await authCheck.json().catch(() => ({}));
    throw new Error(body?.error || 'Unauthorized: Apex Syndicate Owner verification failed.');
  }

  const [usersSnap, privSnap, profilesSnap] = await Promise.all([
    getDocs(collection(db, 'users')),
    getDocs(collection(db, 'users_private')),
    getDocs(collection(db, 'profiles')),
  ]);

  const privMap = new Map<string, CloudPrivateInfo>();
  privSnap.forEach((d) => privMap.set(d.id, d.data() as CloudPrivateInfo));

  const profMap = new Map<string, Record<string, unknown>>();
  profilesSnap.forEach((d) => profMap.set(d.id, d.data() as Record<string, unknown>));

  const nowMs = Date.now();
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

  const citizens: RegistryCitizenEntry[] = [];
  usersSnap.forEach((d) => {
    const acc = d.data() as CloudUserAccount;
    const priv = privMap.get(d.id);
    const prof = profMap.get(d.id);
    const createdIso = timestampToIso(acc.createdAt);
    const lastLoginIso = timestampToIso(acc.lastLoginAt);

    citizens.push({
      uid: acc.uid || d.id,
      username: acc.username,
      usernameLower: acc.usernameLower,
      email: priv?.email || '(private)',
      role: acc.role || 'citizen',
      accountStatus: acc.accountStatus || 'active',
      emailVerified: Boolean(acc.emailVerified),
      suspensionReason: acc.suspensionReason,
      createdAtIso: createdIso,
      lastLoginIso,
      stateOfOrigin: prof?.spawnStateId ? String(prof.spawnStateId) : 'lagos',
      socialClass: prof?.socialClass ? String(prof.socialClass) : 'mapo',
      phoneModel: prof?.phoneModel ? String(prof.phoneModel) : 'samsung_s24_base',
      bankNaira: prof?.bankNaira !== undefined ? Number(prof.bankNaira) : 0,
      bankCAD: prof?.bankCAD !== undefined ? Number(prof.bankCAD) : 0,
      gender: (prof?.avatar as { gender?: string } | undefined)?.gender || 'male',
    });
  });

  const metrics = {
    total: citizens.length,
    verified: citizens.filter((c) => c.emailVerified).length,
    unverified: citizens.filter((c) => !c.emailVerified).length,
    recent: citizens.filter((c) => c.createdAtIso && nowMs - new Date(c.createdAtIso).getTime() <= sevenDaysMs).length,
    suspended: citizens.filter((c) => c.accountStatus === 'suspended').length,
    active: citizens.filter((c) => c.accountStatus === 'active').length,
  };

  // Record audited owner inspection
  const logId = `audit_view_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  setDoc(doc(db, 'owner_audit_logs', logId), {
    id: logId,
    actorUid: user.uid,
    actorEmail: OWNER_EMAIL,
    action: 'VIEW_REGISTRY',
    details: `Inspected Citizen Account Registry (${metrics.total} accounts).`,
    createdAt: serverTimestamp(),
  }).catch(() => {});

  return { citizens, metrics };
}

export async function setCitizenSuspensionStatus(params: {
  targetUid: string;
  targetUsername: string;
  suspend: boolean;
  reason?: string;
}): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('Authentication required.');
  if (params.targetUid === user.uid) {
    throw new Error('Owner cannot suspend their own master account.');
  }

  const idToken = await user.getIdToken(true);
  const res = await fetch(params.suspend ? '/api/owner/suspend-check' : '/api/owner/restore-check', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ targetUid: params.targetUid, targetUsername: params.targetUsername }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error || 'Unauthorized owner action.');
  }

  const targetRef = doc(db, 'users', params.targetUid);
  await updateDoc(targetRef, {
    accountStatus: params.suspend ? 'suspended' : 'active',
    suspensionReason: params.suspend
      ? String(params.reason || 'Suspended by Owner Administration').slice(0, 300)
      : deleteField(),
    suspendedBy: params.suspend ? user.uid : deleteField(),
    suspendedAt: params.suspend ? serverTimestamp() : deleteField(),
    updatedAt: serverTimestamp(),
  });

  const logId = `audit_${params.suspend ? 'susp' : 'rest'}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  await setDoc(doc(db, 'owner_audit_logs', logId), {
    id: logId,
    actorUid: user.uid,
    actorEmail: OWNER_EMAIL,
    action: params.suspend ? 'SUSPEND_ACCOUNT' : 'RESTORE_ACCOUNT',
    targetUid: params.targetUid,
    targetUsername: params.targetUsername,
    details: params.suspend
      ? `Suspended @${params.targetUsername}: ${params.reason || 'Administrative review'}`
      : `Restored @${params.targetUsername} to active status.`,
    createdAt: serverTimestamp(),
  });
}

export async function fetchOwnerAuditLogs(): Promise<OwnerAuditLogEntry[]> {
  const user = auth.currentUser;
  if (!user) throw new Error('Authentication required.');
  const q = query(collection(db, 'owner_audit_logs'), orderBy('createdAt', 'desc'), limit(50));
  const snap = await getDocs(q);
  const logs: OwnerAuditLogEntry[] = [];
  snap.forEach((d) => {
    const data = d.data();
    logs.push({
      id: String(data.id || d.id),
      actorUid: String(data.actorUid || ''),
      actorEmail: String(data.actorEmail || ''),
      action: String(data.action || ''),
      targetUid: data.targetUid ? String(data.targetUid) : undefined,
      targetUsername: data.targetUsername ? String(data.targetUsername) : undefined,
      details: String(data.details || ''),
      createdAtIso: timestampToIso(data.createdAt),
    });
  });
  return logs;
}
