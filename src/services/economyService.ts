/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { auth } from '../firebase';
import { BankReceipt, UserDocument, UserProfile } from '../types/game';

export function createRequestId(prefix = 'req'): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export async function getAuthBearerHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  try {
    const token = await auth.currentUser?.getIdToken?.();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  } catch {}
  return headers;
}

export interface ServerEconomySyncResult {
  success: boolean;
  restoredToNigeria?: boolean;
  watBizSettlements?: Array<{
    businessId: string;
    businessName: string;
    country: 'nigeria' | 'canada';
    watDate: string;
    netMinor: string;
  }>;
  account?: {
    uid: string;
    walletAccountNumber: string;
    ngnKobo: string;
    cadCents: string;
    savingsNgnKobo: string;
    savingsCadCents: string;
    bankNaira: number;
    cashNaira: number;
    bankCAD: number;
    savingsBalanceNGN: number;
    savingsCAD: number;
    lastLocationStateId: string;
    currentCountry: string;
    migratedToNigeriaOriginalStateV1: boolean;
    immigrationStatus: string;
    ownedClothing: string[];
    ownedHairstyles: string[];
    furnitureBought: string[];
    ownedDocuments: UserDocument[];
    ownedLaptops: string[];
    activeLaptopId: string;
    codingXp: number;
    codingLevel: number;
    completedCodingChallenges: string[];
    completedCyberMissions: string[];
    snapPlusExpiresAt?: number;
    predictionPoints: number;
    receipts: BankReceipt[];
    alerts: UserProfile['alerts'];
  };
  error?: string;
}

export async function syncEconomyAccount(profile: Partial<UserProfile>): Promise<ServerEconomySyncResult> {
  try {
    const headers = await getAuthBearerHeaders();
    if (!headers.Authorization) {
      return { success: false, error: 'Offline / unauthenticated session' };
    }
    const resp = await fetch('/api/economy/sync-account', {
      method: 'POST',
      headers,
      body: JSON.stringify({ profile }),
    });
    const data = await resp.json();
    if (!resp.ok) {
      return { success: false, error: data.error || 'Economy sync failed' };
    }
    return data as ServerEconomySyncResult;
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Network error' };
  }
}

export async function executeServerTransfer(params: {
  senderUsername: string;
  recipientIdentifier: string;
  amount: number | string;
  currency: 'NGN' | 'CAD';
  note?: string;
}): Promise<{
  success: boolean;
  message?: string;
  referenceNo?: string;
  receipt?: BankReceipt;
  senderProfile?: any;
  error?: string;
}> {
  try {
    const headers = await getAuthBearerHeaders();
    if (!headers.Authorization) return { success: false, error: 'Authentication required to transfer funds.' };
    const resp = await fetch('/api/bank/transfer', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        requestId: createRequestId('tx'),
        ...params,
      }),
    });
    const data = await resp.json();
    if (!resp.ok) {
      return { success: false, error: data.error || 'Transfer rejected by server.' };
    }
    return data;
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Transfer network error' };
  }
}

export async function executeServerFxExchange(params: {
  direction: 'NGN_TO_CAD' | 'CAD_TO_NGN';
  amount: number | string;
}): Promise<{
  success: boolean;
  converted?: number;
  convertedMinor?: string;
  sourceMinor?: string;
  message?: string;
  account?: any;
  referenceNo?: string;
  error?: string;
}> {
  try {
    const headers = await getAuthBearerHeaders();
    if (!headers.Authorization) return { success: false, error: 'Auth required' };
    const resp = await fetch('/api/economy/fx-exchange', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        requestId: createRequestId('fx'),
        ...params,
      }),
    });
    const data = await resp.json();
    if (!resp.ok) return { success: false, error: data.error || 'FX conversion failed' };
    return data;
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'FX network error' };
  }
}

export async function executeServerSavings(params: {
  currency: 'NGN' | 'CAD';
  action: 'deposit' | 'withdraw';
  amount: number | string;
}): Promise<{
  success: boolean;
  message?: string;
  account?: any;
  error?: string;
}> {
  try {
    const headers = await getAuthBearerHeaders();
    if (!headers.Authorization) return { success: false, error: 'Auth required' };
    const resp = await fetch('/api/economy/savings', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        requestId: createRequestId('sav'),
        ...params,
      }),
    });
    const data = await resp.json();
    if (!resp.ok) return { success: false, error: data.error || 'Savings operation failed' };
    return data;
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Network error' };
  }
}

export async function executeServerSpend(params: {
  currency: 'NGN' | 'CAD';
  amount: number | string;
  title: string;
  category?: BankReceipt['category'];
}): Promise<{
  success: boolean;
  receipt?: BankReceipt;
  account?: any;
  error?: string;
}> {
  try {
    const headers = await getAuthBearerHeaders();
    if (!headers.Authorization) return { success: false, error: 'Auth required' };
    const resp = await fetch('/api/economy/spend', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        requestId: createRequestId('spn'),
        ...params,
      }),
    });
    const data = await resp.json();
    if (!resp.ok) return { success: false, error: data.error || 'Purchase rejected' };
    return data;
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Network error' };
  }
}

export async function executeServerPurchase(params: {
  itemId: string;
  title: string;
  category: BankReceipt['category'];
  amountNGN: number;
  unlockType?: 'clothing' | 'hairstyle' | 'furniture';
  unlockKey?: string;
}): Promise<{
  success: boolean;
  receipt?: BankReceipt;
  account?: any;
  error?: string;
}> {
  try {
    const headers = await getAuthBearerHeaders();
    if (!headers.Authorization) return { success: false, error: 'Auth required' };
    const resp = await fetch('/api/economy/purchase', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        requestId: createRequestId('buy'),
        ...params,
      }),
    });
    const data = await resp.json();
    if (!resp.ok) return { success: false, error: data.error || 'Purchase rejected' };
    return data;
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Network error' };
  }
}

export async function collectServerBusinessRevenue(params: {
  businessId: string;
  businessName: string;
  dailyRevenueNGN: number;
  currency?: 'NGN' | 'CAD';
}): Promise<{
  success: boolean;
  payout?: number;
  receipt?: BankReceipt;
  account?: any;
  collectedDate?: string;
  error?: string;
}> {
  try {
    const headers = await getAuthBearerHeaders();
    if (!headers.Authorization) return { success: false, error: 'Auth required' };
    const resp = await fetch('/api/economy/business-collect', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        requestId: createRequestId('biz'),
        ...params,
      }),
    });
    const data = await resp.json();
    if (!resp.ok) return { success: false, error: data.error || 'Payout rejected' };
    return data;
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Network error' };
  }
}

export interface CanadaVisaApplicationPayload {
  fullName: string;
  age: number;
  currentNigerianState: string;
  travelPurpose: 'Work' | 'Study' | 'Tourism' | 'Permanent Relocation';
  intendedDuration: string;
  employmentStatus: string;
  financialInfo: string;
}

export async function applyCanadaVisaServer(payload: CanadaVisaApplicationPayload): Promise<{
  success: boolean;
  approved?: boolean;
  issuedDocuments?: UserDocument[];
  receipt?: BankReceipt;
  account?: any;
  message?: string;
  error?: string;
}> {
  try {
    const headers = await getAuthBearerHeaders();
    if (!headers.Authorization) return { success: false, error: 'Sign in with a verified account to submit your Canada Visa application.' };
    const resp = await fetch('/api/immigration/apply-canada', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        requestId: createRequestId('ircc'),
        ...payload,
      }),
    });
    const data = await resp.json();
    if (!resp.ok) return { success: false, error: data.error || 'Application validation failed' };
    return data;
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Network error submitting application' };
  }
}
