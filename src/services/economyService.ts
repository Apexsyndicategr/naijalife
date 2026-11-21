/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { auth } from '../firebase';
import { BankReceipt, UserDocument, UserProfile } from '../types/game';

function createRequestId(prefix = 'req'): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

async function getBearerHeaders(): Promise<Record<string, string>> {
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
  account?: {
    uid: string;
    walletAccountNumber: string;
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
    receipts: BankReceipt[];
    alerts: UserProfile['alerts'];
  };
  error?: string;
}

export async function syncEconomyAccount(profile: Partial<UserProfile>): Promise<ServerEconomySyncResult> {
  try {
    const headers = await getBearerHeaders();
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
  amount: number;
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
    const headers = await getBearerHeaders();
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
  amount: number;
}): Promise<{
  success: boolean;
  converted?: number;
  message?: string;
  account?: any;
  referenceNo?: string;
  error?: string;
}> {
  try {
    const headers = await getBearerHeaders();
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
    const headers = await getBearerHeaders();
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
}): Promise<{
  success: boolean;
  payout?: number;
  receipt?: BankReceipt;
  account?: any;
  collectedDate?: string;
  error?: string;
}> {
  try {
    const headers = await getBearerHeaders();
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
    const headers = await getBearerHeaders();
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
