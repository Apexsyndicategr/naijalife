/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const OWNER_EMAIL = 'kchiboy50@gmail.com';
export const OWNER_USERNAME = 'chiboy_52';

export const USERNAME_REGEX = /^[a-zA-Z0-9_.-]{3,24}$/;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const DOB_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export function validateEmailInput(email: string): { valid: boolean; normalized: string; error?: string } {
  const trimmed = String(email || '').trim();
  const normalized = trimmed.toLowerCase();
  if (!trimmed) {
    return { valid: false, normalized, error: 'Email address is required.' };
  }
  if (trimmed.length > 120 || !EMAIL_REGEX.test(normalized)) {
    return { valid: false, normalized, error: 'Please enter a valid email address (e.g. player@example.com).' };
  }
  return { valid: true, normalized };
}

export function validateUsernameInput(username: string): {
  valid: boolean;
  trimmed: string;
  normalized: string;
  error?: string;
} {
  const trimmed = String(username || '').trim();
  const normalized = trimmed.toLowerCase();
  if (!trimmed) {
    return { valid: false, trimmed, normalized, error: 'Username is required.' };
  }
  if (trimmed.length < 3 || trimmed.length > 24) {
    return { valid: false, trimmed, normalized, error: 'Username must be between 3 and 24 characters.' };
  }
  if (!USERNAME_REGEX.test(trimmed)) {
    return {
      valid: false,
      trimmed,
      normalized,
      error: 'Username may only use letters (A-Z, a-z), numbers (0-9), underscores (_), periods (.), and hyphens (-).',
    };
  }
  return { valid: true, trimmed, normalized };
}

export function validateBirthdayInput(dob: string): { valid: boolean; error?: string } {
  const trimmed = String(dob || '').trim();
  if (!trimmed || !DOB_REGEX.test(trimmed)) {
    return { valid: false, error: 'Please select a valid Date of Birth.' };
  }
  const [yStr, mStr, dStr] = trimmed.split('-');
  const year = Number(yStr);
  const month = Number(mStr);
  const day = Number(dStr);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    return { valid: false, error: 'Date of Birth is not a valid calendar date.' };
  }

  const now = new Date();
  const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  if (parsed.getTime() > todayUTC.getTime()) {
    return { valid: false, error: 'Date of Birth cannot be in the future.' };
  }
  if (year < 1900) {
    return { valid: false, error: 'Please enter a valid Date of Birth (year 1900 or later).' };
  }

  // Age check: minimum 13 years old for online account privacy compliance
  const minAgeDate = new Date(Date.UTC(now.getUTCFullYear() - 13, now.getUTCMonth(), now.getUTCDate()));
  if (parsed.getTime() > minAgeDate.getTime()) {
    return { valid: false, error: 'Players must be at least 13 years old to create an online Naija Life account.' };
  }

  return { valid: true };
}

export function validatePasswordStrength(password: string): {
  valid: boolean;
  score: number;
  checks: {
    minLength: boolean;
    hasUpper: boolean;
    hasLower: boolean;
    hasNumberOrSymbol: boolean;
  };
  error?: string;
} {
  const pwd = String(password || '');
  const checks = {
    minLength: pwd.length >= 8,
    hasUpper: /[A-Z]/.test(pwd),
    hasLower: /[a-z]/.test(pwd),
    hasNumberOrSymbol: /[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(pwd),
  };
  const score = Object.values(checks).filter(Boolean).length;
  if (!checks.minLength) {
    return { valid: false, score, checks, error: 'Password must be at least 8 characters long.' };
  }
  if (!checks.hasUpper || !checks.hasLower || !checks.hasNumberOrSymbol) {
    return {
      valid: false,
      score,
      checks,
      error: 'Password must include uppercase letters, lowercase letters, and at least one number or symbol.',
    };
  }
  if (pwd.length > 128) {
    return { valid: false, score, checks, error: 'Password cannot exceed 128 characters.' };
  }
  return { valid: true, score, checks };
}

/**
 * Strict Apex Syndicate Owner Check:
 * Never grants owner from username alone!
 * Requires BOTH verified email === kchiboy50@gmail.com AND username === chiboy_52.
 */
export function isStrictOwnerIdentity(params: {
  email?: string | null;
  emailVerified?: boolean | null;
  username?: string | null;
  role?: string | null;
}): boolean {
  const em = String(params.email || '').trim().toLowerCase();
  const uname = String(params.username || '').trim().toLowerCase();
  const verified = params.emailVerified === true;
  if (!verified || em !== OWNER_EMAIL || uname !== OWNER_USERNAME) {
    return false;
  }
  return true;
}

export function mapFirebaseAuthError(error: unknown): string {
  const code = typeof error === 'object' && error !== null && 'code' in error
    ? String((error as { code?: unknown }).code || '')
    : '';
  const msg = error instanceof Error ? error.message : String(error || 'Authentication failed');

  switch (code) {
    case 'auth/email-already-in-use':
      return 'An account with this email address already exists. Please log in or reset your password.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/weak-password':
      return 'Password is too weak. Use at least 8 characters with uppercase, lowercase, and a number or symbol.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
    case 'auth/invalid-login-credentials':
      return 'Incorrect email or password. Please check your credentials and try again.';
    case 'auth/user-not-found':
      return 'No Naija Life account found for this email address.';
    case 'auth/user-disabled':
      return 'This account has been disabled by administration.';
    case 'auth/too-many-requests':
      return 'Too many attempts detected. Please wait a moment before trying again.';
    case 'auth/network-request-failed':
      return 'Network error while reaching Naija Life authentication servers. Check your connection and retry.';
    case 'auth/requires-recent-login':
      return 'For security, please re-enter your current password before making this change.';
    case 'auth/expired-action-code':
      return 'That verification or password reset link has expired. Please request a new one.';
    case 'auth/invalid-action-code':
      return 'That verification or password reset link is invalid or has already been used.';
    case 'auth/operation-not-allowed':
      return 'Email/Password sign-in is not yet enabled in the Firebase Console for this project. Enable Authentication -> Sign-in method -> Email/Password in Firebase Console.';
    default:
      if (msg.includes('PASSWORD_LOGIN_DISABLED') || msg.includes('OPERATION_NOT_ALLOWED')) {
        return 'Email/Password sign-in is not yet enabled in Firebase Console -> Authentication -> Sign-in method.';
      }
      return msg || 'An unexpected authentication error occurred.';
  }
}
