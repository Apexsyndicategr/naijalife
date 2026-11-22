/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Authoritative Server Economy Engine using exact BigInt minor-unit integer strings
 * (`ngnKobo`, `cadCents`, `savingsNgnKobo`, `savingsCadCents`).
 * Supports atomic transfers, FX exchange, purchases, savings, and business dividends
 * for BOTH regular citizens and the verified Owner account without resetting balances.
 */

import fs from 'fs';
import path from 'path';
import {
  OWNER_INITIAL_CAD_CENTS,
  OWNER_INITIAL_NGN_KOBO,
  addMinorUnits,
  computeFxCadToNgn,
  computeFxNgnToCad,
  formatCompactCurrencyFromMinor,
  majorToMinor,
  minorToMajorNumber,
  parseMinorString,
  subtractMinorUnits,
} from '../utils/bigMoney.ts';
import { getEligibleWatSettlementDates, getWatClock } from './watTime.ts';
import { realtimeHub } from './realtimeHub.ts';

export const CAD_TO_NGN_RATE = 960.54;
export const NGN_TO_CAD_SPREAD = 0.992;
export const CANADA_VISA_FEE_NGN = 2500000;

export interface ServerBusinessVenture {
  id: string;
  name: string;
  typeId: string;
  typeName: string;
  country: 'nigeria' | 'canada';
  registeredDate: string; // YYYY-MM-DD (Africa/Lagos)
  level: number;
  dailyRevenueMinor: string; // BigInt minor string in currency of `country`
  dailyExpensesMinor: string;
  employeesCount: number;
  upgrades: string[];
  lastSettledWatDate?: string;
  totalCollectedMinor: string;
}

export interface ServerEconomyAccount {
  uid: string;
  username: string;
  usernameLower: string;
  walletAccountNumber: string;
  isOwner: boolean;
  ngnKobo: string;
  cadCents: string;
  savingsNgnKobo: string;
  savingsCadCents: string;
  // Numeric shadow mirrors for backward compatibility (derived cleanly from minor strings)
  bankNaira: number;
  cashNaira: number;
  bankCAD: number;
  savingsBalanceNGN: number;
  savingsCAD: number;
  loanBalanceNGN: number;
  spawnStateId: string;
  lastLocationStateId: string;
  currentCountry: string;
  migratedToNigeriaOriginalStateV1: boolean;
  immigrationStatus: string;
  ownedClothing: string[];
  ownedHairstyles: string[];
  furnitureBought: string[];
  ownedDocuments: any[];
  ownedLaptops: string[];
  activeLaptopId: string;
  codingXp: number;
  codingLevel: number;
  completedCodingChallenges: string[];
  completedCyberMissions: string[];
  businesses: ServerBusinessVenture[];
  receipts: any[];
  alerts: any[];
  lastBusinessCollectByDate: Record<string, string>;
  snapPlusExpiresAt?: number;
  predictionPoints: number;
  updatedAt: string;
}

export interface EconomyStore {
  accountsByUid: Record<string, ServerEconomyAccount>;
  uidByUsername: Record<string, string>;
  uidByAccountNumber: Record<string, string>;
  processedRequestIds: Record<string, { createdAt: number; response: any }>;
}

const DIGIT_ONLY_RE = /^-?\d+$/;

export function syncNumericMirrors(acc: ServerEconomyAccount): void {
  const ngnKobo = parseMinorString(acc.ngnKobo);
  const cadCents = parseMinorString(acc.cadCents);
  const savNgnKobo = parseMinorString(acc.savingsNgnKobo);
  const savCadCents = parseMinorString(acc.savingsCadCents);

  // Store total liquid NGN in bankNaira and cashNaira = 0 so (cashNaira + bankNaira) === bankNaira without double-counting
  acc.bankNaira = minorToMajorNumber(ngnKobo);
  acc.cashNaira = 0;
  acc.bankCAD = minorToMajorNumber(cadCents);
  acc.savingsBalanceNGN = minorToMajorNumber(savNgnKobo);
  acc.savingsCAD = minorToMajorNumber(savCadCents);
}

/**
 * Ensures account has BigInt minor-unit strings initialized ONCE.
 * NEVER overwrites existing `ngnKobo` / `cadCents` so real spending/transfers/FX always persist accurately.
 */
export function ensureAccountMinorUnits(acc: ServerEconomyAccount, isOwnerAccount: boolean): void {
  acc.isOwner = isOwnerAccount;
  if (typeof acc.ngnKobo !== 'string' || !DIGIT_ONLY_RE.test(acc.ngnKobo.trim())) {
    if (isOwnerAccount) {
      acc.ngnKobo = OWNER_INITIAL_NGN_KOBO;
    } else if (acc.bankNaira !== undefined || acc.cashNaira !== undefined) {
      const legacyTotal = majorToMinor(acc.bankNaira || 0) + majorToMinor(acc.cashNaira || 0);
      acc.ngnKobo = (legacyTotal >= 0n ? legacyTotal : 0n).toString();
    } else {
      acc.ngnKobo = majorToMinor(150000).toString();
    }
  }
  if (typeof acc.cadCents !== 'string' || !DIGIT_ONLY_RE.test(acc.cadCents.trim())) {
    if (isOwnerAccount) {
      acc.cadCents = OWNER_INITIAL_CAD_CENTS;
    } else {
      acc.cadCents = majorToMinor(acc.bankCAD || 0).toString();
    }
  }
  if (typeof acc.savingsNgnKobo !== 'string' || !DIGIT_ONLY_RE.test(acc.savingsNgnKobo.trim())) {
    acc.savingsNgnKobo = majorToMinor(acc.savingsBalanceNGN || 0).toString();
  }
  if (typeof acc.savingsCadCents !== 'string' || !DIGIT_ONLY_RE.test(acc.savingsCadCents.trim())) {
    acc.savingsCadCents = majorToMinor(acc.savingsCAD || 0).toString();
  }
  if (!Array.isArray(acc.ownedLaptops)) acc.ownedLaptops = [];
  if (typeof acc.activeLaptopId !== 'string') acc.activeLaptopId = '';
  if (typeof acc.codingXp !== 'number') acc.codingXp = 0;
  if (typeof acc.codingLevel !== 'number') acc.codingLevel = 1;
  if (!Array.isArray(acc.completedCodingChallenges)) acc.completedCodingChallenges = [];
  if (!Array.isArray(acc.completedCyberMissions)) acc.completedCyberMissions = [];
  if (!Array.isArray(acc.businesses)) acc.businesses = [];
  if (!Array.isArray(acc.receipts)) acc.receipts = [];
  if (!Array.isArray(acc.alerts)) acc.alerts = [];
  if (!acc.lastBusinessCollectByDate) acc.lastBusinessCollectByDate = {};
  if (typeof acc.predictionPoints !== 'number') acc.predictionPoints = 0;
  syncNumericMirrors(acc);
}

export class EconomyEngine {
  private filePath: string;
  public store: EconomyStore;

  constructor(dbDir: string) {
    this.filePath = path.resolve(dbDir, 'economy_state.json');
    this.store = this.load();
  }

  private load(): EconomyStore {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      if (fs.existsSync(this.filePath)) {
        const parsed = JSON.parse(fs.readFileSync(this.filePath, 'utf-8'));
        const loaded: EconomyStore = {
          accountsByUid: parsed.accountsByUid || {},
          uidByUsername: parsed.uidByUsername || {},
          uidByAccountNumber: parsed.uidByAccountNumber || {},
          processedRequestIds: parsed.processedRequestIds || {},
        };
        for (const acc of Object.values(loaded.accountsByUid)) {
          ensureAccountMinorUnits(acc, Boolean(acc.isOwner));
        }
        return loaded;
      }
    } catch (err) {
      console.error('Error loading economy store:', err);
    }
    return {
      accountsByUid: {},
      uidByUsername: {},
      uidByAccountNumber: {},
      processedRequestIds: {},
    };
  }

  public save(): void {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      const reqKeys = Object.keys(this.store.processedRequestIds);
      if (reqKeys.length > 2500) {
        reqKeys.sort(
          (a, b) =>
            (this.store.processedRequestIds[a]?.createdAt || 0) -
            (this.store.processedRequestIds[b]?.createdAt || 0)
        );
        for (const k of reqKeys.slice(0, reqKeys.length - 1500)) {
          delete this.store.processedRequestIds[k];
        }
      }
      const tmp = `${this.filePath}.tmp`;
      fs.writeFileSync(tmp, JSON.stringify(this.store, null, 2), 'utf-8');
      fs.renameSync(tmp, this.filePath);
    } catch (err) {
      console.error('Error saving economy store:', err);
    }
  }

  public generateAccountNumber(seed: string): string {
    let hash = 2166136261;
    for (let i = 0; i < seed.length; i++) {
      hash ^= seed.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    let attempt = 0;
    while (attempt < 50) {
      const val = (Math.abs(hash + attempt * 7919) % 90000000) + 10000000;
      const candidate = `30${val}`;
      if (!this.store.uidByAccountNumber[candidate]) return candidate;
      attempt++;
    }
    return `30${Math.floor(10000000 + Math.random() * 89999999)}`;
  }

  public getIdempotent(requestId?: string): any | null {
    const k = requestId ? String(requestId).trim() : '';
    if (!k) return null;
    return this.store.processedRequestIds[k]?.response || null;
  }

  public saveIdempotent(requestId: string | undefined, response: any): void {
    const k = requestId ? String(requestId).trim() : '';
    if (!k) return;
    this.store.processedRequestIds[k] = { createdAt: Date.now(), response };
  }

  public resolveAccount(identifier: string): ServerEconomyAccount | undefined {
    const clean = String(identifier || '').replace(/^@/, '').trim();
    if (!clean) return undefined;
    const uid =
      this.store.accountsByUid[clean]?.uid ||
      this.store.uidByAccountNumber[clean] ||
      this.store.uidByUsername[clean.toLowerCase()];
    return uid ? this.store.accountsByUid[uid] : undefined;
  }

  public debitMinor(params: {
    uid: string;
    currency: 'NGN' | 'CAD';
    amountMinor: bigint;
    title: string;
    category: string;
    recipientOrSender?: string;
    requestId?: string;
    persist?: boolean;
  }): { ok: boolean; error?: string; receipt?: any; account?: ServerEconomyAccount; duplicate?: boolean } {
    const cached = this.getIdempotent(params.requestId);
    if (cached) return { ...cached, duplicate: true };

    const acc = this.store.accountsByUid[params.uid];
    if (!acc) return { ok: false, error: 'Account not initialized.' };
    ensureAccountMinorUnits(acc, acc.isOwner);

    if (params.amountMinor < 0n) {
      return { ok: false, error: 'Amount must be positive.' };
    }

    if (params.amountMinor > 0n) {
      if (params.currency === 'CAD') {
        const cur = parseMinorString(acc.cadCents);
        if (cur < params.amountMinor) {
          return {
            ok: false,
            error: `Insufficient CAD funds (${formatCompactCurrencyFromMinor(cur, 'CAD')} available).`,
          };
        }
        acc.cadCents = subtractMinorUnits(cur, params.amountMinor);
      } else {
        const cur = parseMinorString(acc.ngnKobo);
        if (cur < params.amountMinor) {
          return {
            ok: false,
            error: `Insufficient NGN funds (${formatCompactCurrencyFromMinor(cur, 'NGN')} available).`,
          };
        }
        acc.ngnKobo = subtractMinorUnits(cur, params.amountMinor);
      }
    }

    const refId = `NLD_${Date.now()}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const nowStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const receipt = {
      id: refId,
      title: params.title,
      category: params.category || 'general',
      amount: minorToMajorNumber(params.amountMinor),
      amountMinor: params.amountMinor.toString(),
      date: nowStr,
      type: 'debit',
      currency: params.currency,
      recipientOrSender: params.recipientOrSender || 'Naija Life Ecosystem',
      referenceNo: refId,
    };

    if (params.amountMinor > 0n) {
      acc.receipts = [receipt, ...acc.receipts].slice(0, 200);
    }
    syncNumericMirrors(acc);
    acc.updatedAt = new Date().toISOString();

    const resp = { ok: true, receipt, account: acc };
    this.saveIdempotent(params.requestId, resp);
    if (params.persist !== false) {
      this.save();
    }
    realtimeHub.sendToUser(acc.usernameLower, {
      type: 'economy:balance_updated',
      ngnKobo: acc.ngnKobo,
      cadCents: acc.cadCents,
      receipt,
    });
    return resp;
  }

  public creditMinor(params: {
    uid: string;
    currency: 'NGN' | 'CAD';
    amountMinor: bigint;
    title: string;
    category: string;
    recipientOrSender?: string;
    requestId?: string;
    persist?: boolean;
  }): { ok: boolean; error?: string; receipt?: any; account?: ServerEconomyAccount; duplicate?: boolean } {
    const cached = this.getIdempotent(params.requestId);
    if (cached) return { ...cached, duplicate: true };

    const acc = this.store.accountsByUid[params.uid];
    if (!acc) return { ok: false, error: 'Account not initialized.' };
    ensureAccountMinorUnits(acc, acc.isOwner);

    if (params.amountMinor <= 0n) {
      return { ok: false, error: 'Credit amount must be positive.' };
    }

    if (params.currency === 'CAD') {
      acc.cadCents = addMinorUnits(acc.cadCents, params.amountMinor);
    } else {
      acc.ngnKobo = addMinorUnits(acc.ngnKobo, params.amountMinor);
    }

    const refId = `NLC_${Date.now()}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const nowStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const receipt = {
      id: refId,
      title: params.title,
      category: params.category || 'general',
      amount: minorToMajorNumber(params.amountMinor),
      amountMinor: params.amountMinor.toString(),
      date: nowStr,
      type: 'credit',
      currency: params.currency,
      recipientOrSender: params.recipientOrSender || 'Naija Life Ecosystem',
      referenceNo: refId,
    };

    acc.receipts = [receipt, ...acc.receipts].slice(0, 200);
    syncNumericMirrors(acc);
    acc.updatedAt = new Date().toISOString();

    const resp = { ok: true, receipt, account: acc };
    this.saveIdempotent(params.requestId, resp);
    if (params.persist !== false) {
      this.save();
    }
    realtimeHub.sendToUser(acc.usernameLower, {
      type: 'economy:balance_updated',
      ngnKobo: acc.ngnKobo,
      cadCents: acc.cadCents,
      receipt,
    });
    return resp;
  }

  public atomicTransfer(params: {
    senderUid: string;
    recipientUid: string;
    currency: 'NGN' | 'CAD';
    amountMinor: bigint;
    note?: string;
    requestId?: string;
    simulatePostDebitFailure?: boolean;
  }): {
    success: boolean;
    error?: string;
    status?: number;
    referenceNo?: string;
    message?: string;
    receipt?: any;
    senderProfile?: ServerEconomyAccount;
    recipientProfile?: ServerEconomyAccount;
    duplicate?: boolean;
  } {
    const cached = this.getIdempotent(params.requestId);
    if (cached) return { ...cached, duplicate: true };

    const senderAcc = this.store.accountsByUid[params.senderUid];
    const recipientAcc = this.store.accountsByUid[params.recipientUid];
    if (!senderAcc) {
      return { success: false, status: 401, error: 'Authenticated sender account not initialized yet.' };
    }
    if (!recipientAcc) {
      return { success: false, status: 404, error: 'Recipient account not found on Naija Life Banking Network.' };
    }
    if (senderAcc.uid === recipientAcc.uid) {
      return { success: false, status: 400, error: 'Cannot transfer funds to your own account.' };
    }
    if (params.amountMinor <= 0n) {
      return { success: false, status: 400, error: 'Transfer amount must be positive.' };
    }

    ensureAccountMinorUnits(senderAcc, senderAcc.isOwner);
    ensureAccountMinorUnits(recipientAcc, recipientAcc.isOwner);

    const senderSnapshot = {
      ngnKobo: senderAcc.ngnKobo,
      cadCents: senderAcc.cadCents,
      receipts: [...senderAcc.receipts],
      updatedAt: senderAcc.updatedAt,
    };
    const recipientSnapshot = {
      ngnKobo: recipientAcc.ngnKobo,
      cadCents: recipientAcc.cadCents,
      receipts: [...recipientAcc.receipts],
      alerts: [...recipientAcc.alerts],
      updatedAt: recipientAcc.updatedAt,
    };

    try {
      if (params.currency === 'CAD') {
        const cur = parseMinorString(senderAcc.cadCents);
        if (cur < params.amountMinor) {
          return {
            success: false,
            status: 400,
            error: `Insufficient CAD balance (${formatCompactCurrencyFromMinor(cur, 'CAD')} available).`,
          };
        }
        senderAcc.cadCents = subtractMinorUnits(cur, params.amountMinor);
        if (params.simulatePostDebitFailure) {
          throw new Error('Simulated ledger persistence failure during credit stage.');
        }
        recipientAcc.cadCents = addMinorUnits(recipientAcc.cadCents, params.amountMinor);
      } else {
        const cur = parseMinorString(senderAcc.ngnKobo);
        if (cur < params.amountMinor) {
          return {
            success: false,
            status: 400,
            error: `Insufficient NGN balance (${formatCompactCurrencyFromMinor(cur, 'NGN')} available).`,
          };
        }
        senderAcc.ngnKobo = subtractMinorUnits(cur, params.amountMinor);
        if (params.simulatePostDebitFailure) {
          throw new Error('Simulated ledger persistence failure during credit stage.');
        }
        recipientAcc.ngnKobo = addMinorUnits(recipientAcc.ngnKobo, params.amountMinor);
      }

      const txId = `NLTX_${Date.now()}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      const nowStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      const majorNum = minorToMajorNumber(params.amountMinor);
      const formattedDisplay = formatCompactCurrencyFromMinor(params.amountMinor, params.currency);

      const debitReceipt = {
        id: txId,
        title: `Transfer to @${recipientAcc.username} (${recipientAcc.walletAccountNumber})`,
        category: 'transfer',
        amount: majorNum,
        amountMinor: params.amountMinor.toString(),
        date: nowStr,
        type: 'debit',
        currency: params.currency,
        recipientOrSender: `${recipientAcc.username} • ${recipientAcc.walletAccountNumber}`,
        referenceNo: txId,
      };
      const creditReceipt = {
        id: `NLRX_${Date.now()}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
        title: `Transfer from @${senderAcc.username} (${params.note || 'Naija Pay'})`,
        category: 'transfer',
        amount: majorNum,
        amountMinor: params.amountMinor.toString(),
        date: nowStr,
        type: 'credit',
        currency: params.currency,
        recipientOrSender: `${senderAcc.username} • ${senderAcc.walletAccountNumber}`,
        referenceNo: txId,
      };

      senderAcc.receipts = [debitReceipt, ...senderAcc.receipts].slice(0, 200);
      recipientAcc.receipts = [creditReceipt, ...recipientAcc.receipts].slice(0, 200);
      recipientAcc.alerts = [
        {
          id: `ALT_${Date.now()}`,
          text: `CREDIT ALERT: Received ${formattedDisplay} from @${senderAcc.username}. Ref: ${txId}`,
          amount: majorNum,
          date: nowStr,
          type: 'credit',
          senderOrRecipient: senderAcc.username,
        },
        ...recipientAcc.alerts,
      ].slice(0, 100);

      syncNumericMirrors(senderAcc);
      syncNumericMirrors(recipientAcc);
      senderAcc.updatedAt = new Date().toISOString();
      recipientAcc.updatedAt = new Date().toISOString();

      const resp = {
        success: true,
        referenceNo: txId,
        message: `Transferred ${formattedDisplay} to @${recipientAcc.username} (${recipientAcc.walletAccountNumber}).`,
        receipt: debitReceipt,
        senderProfile: senderAcc,
        recipientProfile: recipientAcc,
      };
      this.saveIdempotent(params.requestId, resp);
      this.save();

      realtimeHub.sendToUser(senderAcc.usernameLower, {
        type: 'economy:balance_updated',
        ngnKobo: senderAcc.ngnKobo,
        cadCents: senderAcc.cadCents,
        receipt: debitReceipt,
      });
      realtimeHub.sendToUser(recipientAcc.usernameLower, {
        type: 'transfer:received',
        ngnKobo: recipientAcc.ngnKobo,
        cadCents: recipientAcc.cadCents,
        receipt: creditReceipt,
        fromUsername: senderAcc.username,
        formattedAmount: formattedDisplay,
      });

      return resp;
    } catch (err) {
      // Full atomic rollback
      senderAcc.ngnKobo = senderSnapshot.ngnKobo;
      senderAcc.cadCents = senderSnapshot.cadCents;
      senderAcc.receipts = senderSnapshot.receipts;
      senderAcc.updatedAt = senderSnapshot.updatedAt;
      recipientAcc.ngnKobo = recipientSnapshot.ngnKobo;
      recipientAcc.cadCents = recipientSnapshot.cadCents;
      recipientAcc.receipts = recipientSnapshot.receipts;
      recipientAcc.alerts = recipientSnapshot.alerts;
      recipientAcc.updatedAt = recipientSnapshot.updatedAt;
      syncNumericMirrors(senderAcc);
      syncNumericMirrors(recipientAcc);
      return {
        success: false,
        status: 500,
        error: err instanceof Error ? err.message : 'Atomic transfer rolled back due to error.',
      };
    }
  }

  public atomicFxExchange(params: {
    uid: string;
    direction: 'NGN_TO_CAD' | 'CAD_TO_NGN';
    amountMinor: bigint;
    requestId?: string;
  }): {
    success: boolean;
    error?: string;
    status?: number;
    converted?: number;
    convertedMinor?: string;
    sourceMinor?: string;
    message?: string;
    account?: ServerEconomyAccount;
    referenceNo?: string;
    duplicate?: boolean;
  } {
    const cached = this.getIdempotent(params.requestId);
    if (cached) return { ...cached, duplicate: true };

    const acc = this.store.accountsByUid[params.uid];
    if (!acc) return { success: false, status: 404, error: 'Account not initialized.' };
    ensureAccountMinorUnits(acc, acc.isOwner);

    if (params.direction !== 'NGN_TO_CAD' && params.direction !== 'CAD_TO_NGN') {
      return { success: false, status: 400, error: 'FX direction must be NGN_TO_CAD or CAD_TO_NGN.' };
    }
    if (params.amountMinor <= 0n) {
      return { success: false, status: 400, error: 'Positive exchange amount is required.' };
    }

    const nowStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const refId = `FX_${Date.now()}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    if (params.direction === 'CAD_TO_NGN') {
      const currentCad = parseMinorString(acc.cadCents);
      if (currentCad < params.amountMinor) {
        return {
          success: false,
          status: 400,
          error: `Insufficient CAD funds (${formatCompactCurrencyFromMinor(currentCad, 'CAD')} available).`,
        };
      }
      const { creditNgnKobo } = computeFxCadToNgn(params.amountMinor, CAD_TO_NGN_RATE);
      if (creditNgnKobo <= 0n) {
        return { success: false, status: 400, error: 'Exchange amount too small to settle at current FX rate.' };
      }

      acc.cadCents = subtractMinorUnits(currentCad, params.amountMinor);
      acc.ngnKobo = addMinorUnits(acc.ngnKobo, creditNgnKobo);

      const srcFormatted = formatCompactCurrencyFromMinor(params.amountMinor, 'CAD');
      const dstFormatted = formatCompactCurrencyFromMinor(creditNgnKobo, 'NGN');

      acc.receipts = [
        {
          id: `${refId}_CR`,
          title: `FX Deposit from CAD (${srcFormatted} @ ₦${CAD_TO_NGN_RATE})`,
          category: 'transfer',
          amount: minorToMajorNumber(creditNgnKobo),
          amountMinor: creditNgnKobo.toString(),
          date: nowStr,
          type: 'credit',
          currency: 'NGN',
          recipientOrSender: 'CBN / Royal Bank FX Desk',
          referenceNo: refId,
        },
        {
          id: `${refId}_DR`,
          title: `FX Conversion CAD -> NGN (${dstFormatted})`,
          category: 'transfer',
          amount: minorToMajorNumber(params.amountMinor),
          amountMinor: params.amountMinor.toString(),
          date: nowStr,
          type: 'debit',
          currency: 'CAD',
          recipientOrSender: 'CBN / Royal Bank FX Desk',
          referenceNo: refId,
        },
        ...acc.receipts,
      ].slice(0, 200);

      syncNumericMirrors(acc);
      acc.updatedAt = new Date().toISOString();

      const resp = {
        success: true,
        converted: minorToMajorNumber(creditNgnKobo),
        convertedMinor: creditNgnKobo.toString(),
        sourceMinor: params.amountMinor.toString(),
        message: `Exchanged ${srcFormatted} -> ${dstFormatted}`,
        account: acc,
        referenceNo: refId,
      };
      this.saveIdempotent(params.requestId, resp);
      this.save();
      return resp;
    } else {
      const currentNgn = parseMinorString(acc.ngnKobo);
      if (currentNgn < params.amountMinor) {
        return {
          success: false,
          status: 400,
          error: `Insufficient NGN funds (${formatCompactCurrencyFromMinor(currentNgn, 'NGN')} available).`,
        };
      }
      const { creditCadCents } = computeFxNgnToCad(params.amountMinor, CAD_TO_NGN_RATE, NGN_TO_CAD_SPREAD);
      if (creditCadCents <= 0n) {
        return {
          success: false,
          status: 400,
          error: 'Minimum NGN exchange is ₦10 to receive at least $0.01 CAD.',
        };
      }

      acc.ngnKobo = subtractMinorUnits(currentNgn, params.amountMinor);
      acc.cadCents = addMinorUnits(acc.cadCents, creditCadCents);

      const srcFormatted = formatCompactCurrencyFromMinor(params.amountMinor, 'NGN');
      const dstFormatted = formatCompactCurrencyFromMinor(creditCadCents, 'CAD');

      acc.receipts = [
        {
          id: `${refId}_CR`,
          title: `FX Deposit from NGN (${srcFormatted})`,
          category: 'transfer',
          amount: minorToMajorNumber(creditCadCents),
          amountMinor: creditCadCents.toString(),
          date: nowStr,
          type: 'credit',
          currency: 'CAD',
          recipientOrSender: 'CBN / Royal Bank FX Desk',
          referenceNo: refId,
        },
        {
          id: `${refId}_DR`,
          title: `FX Conversion NGN -> CAD (${dstFormatted})`,
          category: 'transfer',
          amount: minorToMajorNumber(params.amountMinor),
          amountMinor: params.amountMinor.toString(),
          date: nowStr,
          type: 'debit',
          currency: 'NGN',
          recipientOrSender: 'CBN / Royal Bank FX Desk',
          referenceNo: refId,
        },
        ...acc.receipts,
      ].slice(0, 200);

      syncNumericMirrors(acc);
      acc.updatedAt = new Date().toISOString();

      const resp = {
        success: true,
        converted: minorToMajorNumber(creditCadCents),
        convertedMinor: creditCadCents.toString(),
        sourceMinor: params.amountMinor.toString(),
        message: `Exchanged ${srcFormatted} -> ${dstFormatted}`,
        account: acc,
        referenceNo: refId,
      };
      this.saveIdempotent(params.requestId, resp);
      this.save();
      return resp;
    }
  }

  public atomicSavingsTransfer(params: {
    uid: string;
    currency: 'NGN' | 'CAD';
    action: 'deposit' | 'withdraw';
    amountMinor: bigint;
    requestId?: string;
  }): { success: boolean; error?: string; status?: number; message?: string; account?: ServerEconomyAccount } {
    const cached = this.getIdempotent(params.requestId);
    if (cached) return { ...cached, duplicate: true };

    const acc = this.store.accountsByUid[params.uid];
    if (!acc) return { success: false, status: 404, error: 'Account not initialized.' };
    ensureAccountMinorUnits(acc, acc.isOwner);
    if (params.amountMinor <= 0n) return { success: false, status: 400, error: 'Positive amount required.' };

    const nowStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const refId = `SAV_${Date.now()}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    if (params.currency === 'CAD') {
      if (params.action === 'deposit') {
        const cur = parseMinorString(acc.cadCents);
        if (cur < params.amountMinor) return { success: false, status: 400, error: 'Insufficient CAD funds.' };
        acc.cadCents = subtractMinorUnits(cur, params.amountMinor);
        acc.savingsCadCents = addMinorUnits(acc.savingsCadCents, params.amountMinor);
      } else {
        const curSav = parseMinorString(acc.savingsCadCents);
        if (curSav < params.amountMinor) return { success: false, status: 400, error: 'Insufficient CAD savings balance.' };
        acc.savingsCadCents = subtractMinorUnits(curSav, params.amountMinor);
        acc.cadCents = addMinorUnits(acc.cadCents, params.amountMinor);
      }
    } else {
      if (params.action === 'deposit') {
        const cur = parseMinorString(acc.ngnKobo);
        if (cur < params.amountMinor) return { success: false, status: 400, error: 'Insufficient NGN funds.' };
        acc.ngnKobo = subtractMinorUnits(cur, params.amountMinor);
        acc.savingsNgnKobo = addMinorUnits(acc.savingsNgnKobo, params.amountMinor);
      } else {
        const curSav = parseMinorString(acc.savingsNgnKobo);
        if (curSav < params.amountMinor) return { success: false, status: 400, error: 'Insufficient NGN savings balance.' };
        acc.savingsNgnKobo = subtractMinorUnits(curSav, params.amountMinor);
        acc.ngnKobo = addMinorUnits(acc.ngnKobo, params.amountMinor);
      }
    }

    const fmt = formatCompactCurrencyFromMinor(params.amountMinor, params.currency);
    acc.receipts = [
      {
        id: refId,
        title: `${params.action === 'deposit' ? 'Savings Deposit' : 'Savings Withdrawal'} (${params.currency})`,
        category: 'transfer',
        amount: minorToMajorNumber(params.amountMinor),
        amountMinor: params.amountMinor.toString(),
        date: nowStr,
        type: params.action === 'deposit' ? 'debit' : 'credit',
        currency: params.currency,
        recipientOrSender: params.currency === 'CAD' ? 'TFSA Vault' : 'Naija Pay Target Vault',
        referenceNo: refId,
      },
      ...acc.receipts,
    ].slice(0, 200);

    syncNumericMirrors(acc);
    acc.updatedAt = new Date().toISOString();

    const resp = {
      success: true,
      message: `${params.action === 'deposit' ? 'Locked' : 'Withdrew'} ${fmt} ${params.action === 'deposit' ? 'into' : 'from'} savings vault.`,
      account: acc,
    };
    this.saveIdempotent(params.requestId, resp);
    this.save();
    return resp;
  }

  /**
   * Authoritative 8:30 PM WAT (20:30 Africa/Lagos) Empire Biz Daily Settlement.
   * Settles at most once per Nigeria WAT calendar day per venture and processes missed offline days.
   */
  public settleAllBusinessesAt830Wat(nowMs: number = Date.now()): Array<{
    uid: string;
    usernameLower: string;
    settlements: Array<{
      businessId: string;
      businessName: string;
      country: 'nigeria' | 'canada';
      watDate: string;
      netMinor: string;
    }>;
  }> {
    const results: Array<{
      uid: string;
      usernameLower: string;
      settlements: Array<{
        businessId: string;
        businessName: string;
        country: 'nigeria' | 'canada';
        watDate: string;
        netMinor: string;
      }>;
    }> = [];

    let changed = false;

    for (const acc of Object.values(this.store.accountsByUid)) {
      if (!Array.isArray(acc.businesses) || acc.businesses.length === 0) continue;
      ensureAccountMinorUnits(acc, acc.isOwner);
      const userSettlements: Array<{
        businessId: string;
        businessName: string;
        country: 'nigeria' | 'canada';
        watDate: string;
        netMinor: string;
      }> = [];

      for (const biz of acc.businesses) {
        const eligibleDates = getEligibleWatSettlementDates({
          lastSettledDate: biz.lastSettledWatDate,
          createdDate: biz.registeredDate || getWatClock(nowMs).dateStr,
          cutoffHour: 20,
          cutoffMinute: 30,
          nowMs,
          maxBackfillDays: 14,
        });

        for (const watDate of eligibleDates) {
          const rev = parseMinorString(biz.dailyRevenueMinor);
          const exp = parseMinorString(biz.dailyExpensesMinor || '0');
          const net = rev > exp ? rev - exp : 0n;
          const currency: 'NGN' | 'CAD' = biz.country === 'canada' ? 'CAD' : 'NGN';
          if (net > 0n) {
            if (currency === 'CAD') {
              acc.cadCents = addMinorUnits(acc.cadCents, net);
            } else {
              acc.ngnKobo = addMinorUnits(acc.ngnKobo, net);
            }
            biz.totalCollectedMinor = addMinorUnits(biz.totalCollectedMinor || '0', net);

            const refId = `BIZ830_${watDate.replace(/-/g, '')}_${biz.id.slice(-5)}_${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
            acc.receipts = [
              {
                id: refId,
                title: `8:30 PM WAT Biz Settlement (${watDate}): ${biz.name}`,
                category: 'business',
                amount: minorToMajorNumber(net),
                amountMinor: net.toString(),
                date: watDate,
                type: 'credit',
                currency,
                recipientOrSender: 'Empire Biz Treasury (20:30 WAT)',
                referenceNo: refId,
              },
              ...acc.receipts,
            ].slice(0, 200);
          }
          biz.lastSettledWatDate = watDate;
          userSettlements.push({
            businessId: biz.id,
            businessName: biz.name,
            country: biz.country,
            watDate,
            netMinor: net.toString(),
          });
          changed = true;
        }
      }

      if (userSettlements.length > 0) {
        syncNumericMirrors(acc);
        acc.updatedAt = new Date().toISOString();
        results.push({ uid: acc.uid, usernameLower: acc.usernameLower, settlements: userSettlements });
        realtimeHub.sendToUser(acc.usernameLower, {
          type: 'business:wat_settlement',
          settlements: userSettlements,
          ngnKobo: acc.ngnKobo,
          cadCents: acc.cadCents,
        });
      }
    }

    if (changed) {
      this.save();
    }
    return results;
  }
}
