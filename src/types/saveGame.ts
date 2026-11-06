/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { GeopoliticalZone } from '../App';

export interface MultiWallet {
  NGN: number;
  USD: number;
  GBP: number;
  EUR: number;
  CAD: number;
}

export interface ForexRates {
  USD: number;
  GBP: number;
  EUR: number;
  CAD: number;
}

export type LegalStatus =
  | 'CITIZEN_NIGERIA'
  | 'LEGAL_RESIDENT'
  | 'UNDOCUMENTED'
  | 'LEGALIZED_PERMANENT_RESIDENT';

export interface VisaDoc {
  countryId: string;
  status: 'NONE' | 'APPROVED' | 'REJECTED';
  expiryDay?: number;
  rejectionNotice?: string;
}

export type TerminalCategory =
  | 'immigration'
  | 'career'
  | 'finance'
  | 'lifestyle'
  | 'health'
  | 'deportation'
  | 'remittance'
  | 'travel'
  | 'save';

export interface TerminalEvent {
  id: string;
  timestamp: string;
  category: TerminalCategory;
  text: string;
}

export interface SavedGameState {
  version: number;
  savedAt: string;
  savedAtFormatted: string;
  playerName: string;
  birthStateId: string;
  currentStateId: string;
  locationMode: 'NIGERIA' | 'INTERNATIONAL';
  internationalCountryId: string | null;
  legalStatus: LegalStatus;
  undocumentedDaysAbroad: number;
  gameDay: number;
  gameHour: number;
  energy: number;
  hunger: number;
  health: number;
  happiness: number;
  familyHappiness: number;
  wallet: MultiWallet;
  fxRates: ForexRates;
  fxTrends: Record<keyof ForexRates, 'up' | 'down' | 'stable'>;
  ownedLandAssets: string[];
  passportStatus: 'NOT_APPLIED' | 'APPLYING' | 'FILE_LOST_DELAY' | 'READY_FOR_COLLECTION' | 'OWNED';
  passportChecksDone: number;
  passportApplicationDay: number;
  passportBookletNo: string;
  visas: Record<string, VisaDoc>;
  skills: string[];
  travelHistory: string[];
  terminalLogs: TerminalEvent[];
}
