/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import path from 'path';
import { EconomyEngine } from './economyEngine.ts';
import { majorToMinor, minorToMajorNumber } from '../utils/bigMoney.ts';
import { getWatClock, shiftWatDate } from './watTime.ts';
import { realtimeHub } from './realtimeHub.ts';

// =========================================================================
// 1. SIMULATED MARKET & FOREX TRADING SIMULATOR (NGN & CAD)
// =========================================================================
export interface SimAssetQuote {
  symbol: string;
  name: string;
  market: 'NGX' | 'TSX' | 'FX';
  currency: 'NGN' | 'CAD';
  basePrice: number;
  volatility: number;
  desc: string;
}

export const SIM_MARKET_ASSETS: SimAssetQuote[] = [
  { symbol: 'DANGCEM', name: 'Dangote Cement PLC', market: 'NGX', currency: 'NGN', basePrice: 485.0, volatility: 0.032, desc: 'Simulated NGX Industrial Materials equity.' },
  { symbol: 'MTNN', name: 'MTN Nigeria Telecom', market: 'NGX', currency: 'NGN', basePrice: 238.5, volatility: 0.038, desc: 'Simulated NGX Telecommunications blue-chip.' },
  { symbol: 'GTCO', name: 'Guaranty Trust HoldCo', market: 'NGX', currency: 'NGN', basePrice: 61.2, volatility: 0.042, desc: 'Simulated NGX tier-1 banking stock.' },
  { symbol: 'SEPLAT', name: 'Seplat Energy PLC', market: 'NGX', currency: 'NGN', basePrice: 3920.0, volatility: 0.045, desc: 'Simulated NGX upstream oil & gas equity.' },
  { symbol: 'ZENITH', name: 'Zenith Bank PLC', market: 'NGX', currency: 'NGN', basePrice: 46.8, volatility: 0.036, desc: 'Simulated NGX commercial banking stock.' },
  { symbol: 'RY.TO', name: 'Royal Bank of Canada', market: 'TSX', currency: 'CAD', basePrice: 174.5, volatility: 0.024, desc: 'Simulated TSX financial services leader.' },
  { symbol: 'SHOP.TO', name: 'Shopify Canada Inc.', market: 'TSX', currency: 'CAD', basePrice: 142.8, volatility: 0.055, desc: 'Simulated TSX e-commerce technology equity.' },
  { symbol: 'ENB.TO', name: 'Enbridge Pipelines', market: 'TSX', currency: 'CAD', basePrice: 59.4, volatility: 0.022, desc: 'Simulated TSX energy infrastructure equity.' },
  { symbol: 'XIU.TO', name: 'S&P/TSX 60 Index ETF', market: 'TSX', currency: 'CAD', basePrice: 38.9, volatility: 0.018, desc: 'Simulated broad Canadian index fund.' },
  { symbol: 'USD/NGN', name: 'FX Simulator: USD/NGN', market: 'FX', currency: 'NGN', basePrice: 1485.0, volatility: 0.028, desc: 'Simulated FX practice pair quoted in Naira.' },
  { symbol: 'GBP/NGN', name: 'FX Simulator: GBP/NGN', market: 'FX', currency: 'NGN', basePrice: 1890.0, volatility: 0.03, desc: 'Simulated FX practice pair quoted in Naira.' },
  { symbol: 'USD/CAD', name: 'FX Simulator: USD/CAD', market: 'FX', currency: 'CAD', basePrice: 1.38, volatility: 0.015, desc: 'Simulated FX practice pair quoted in CAD.' },
];

export interface MarketHolding {
  symbol: string;
  currency: 'NGN' | 'CAD';
  quantity: number;
  avgCost: number;
  realizedPnl: number;
}

export interface MarketOrder {
  id: string;
  uid: string;
  symbol: string;
  side: 'buy' | 'sell';
  currency: 'NGN' | 'CAD';
  quantity: number;
  unitPrice: number;
  totalMajor: number;
  pnlMajor?: number;
  timestamp: number;
}

// =========================================================================
// 2. GOVERNMENT ELECTIONS (STRICTLY SEPARATED NIGERIA & CANADA)
// =========================================================================
export const NIGERIA_STATES_GOV = [
  'Federal Republic of Nigeria (Presidency)',
  'Lagos', 'FCT Abuja', 'Rivers', 'Kano', 'Oyo', 'Imo', 'Enugu', 'Anambra', 'Delta', 'Ogun',
  'Edo', 'Kaduna', 'Katsina', 'Abia', 'Akwa Ibom', 'Plateau', 'Cross River', 'Borno', 'Sokoto',
  'Benue', 'Kwara', 'Ondo', 'Osun', 'Ekiti', 'Ebonyi', 'Kogi', 'Nasarawa', 'Niger', 'Adamawa',
  'Bauchi', 'Gombe', 'Taraba', 'Yobe', 'Jigawa', 'Kebbi', 'Zamfara', 'Bayelsa',
];

export const CANADA_PROVINCES_TERRITORIES_GOV = [
  'Canada Federal Government (Prime Minister)',
  'Ontario', 'Quebec', 'British Columbia', 'Alberta', 'Manitoba', 'Saskatchewan',
  'Nova Scotia', 'New Brunswick', 'Newfoundland and Labrador', 'Prince Edward Island',
  'Yukon', 'Northwest Territories', 'Nunavut',
];

export interface ElectionCandidate {
  id: string;
  uid: string;
  username: string;
  displayName: string;
  party: string;
  manifesto: string;
  announcements: Array<{ id: string; text: string; createdAt: number }>;
  votes: number;
  filedAt: number;
}

export interface CivicElection {
  id: string;
  country: 'nigeria' | 'canada';
  jurisdiction: string;
  officeTitle: string;
  cycleName: string;
  status: 'UPCOMING' | 'ACTIVE' | 'CONCLUDED';
  opensAt: number;
  closesAt: number;
  filingFeeMajor: number;
  currency: 'NGN' | 'CAD';
  candidates: ElectionCandidate[];
  votersByUid: Record<string, string>; // uid -> candidateId (strictly 1 vote per election per account)
  winnerUsername?: string;
  winnerDisplayName?: string;
}

// =========================================================================
// 3. NAIJA BET FREE SPORTS PREDICTIONS (NO PAID WAGERING · 8:00 PM WAT)
// =========================================================================
export interface SportsFixture {
  id: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  kickoffLabel: string;
  watMatchDate: string; // YYYY-MM-DD (Africa/Lagos)
  status: 'UPCOMING' | 'SETTLED';
  result?: 'HOME_WIN' | 'DRAW' | 'AWAY_WIN';
  finalScore?: string;
}

export interface UserPrediction {
  id: string;
  uid: string;
  username: string;
  fixtureId: string;
  watMatchDate: string;
  pick: 'HOME_WIN' | 'DRAW' | 'AWAY_WIN';
  status: 'PENDING' | 'WON' | 'LOST';
  pointsAwarded: number;
  createdAt: number;
  settledAt?: number;
}

export interface CivicMarketState {
  portfoliosByUid: Record<string, Record<string, MarketHolding>>;
  marketOrders: MarketOrder[];
  elections: CivicElection[];
  fixtures: SportsFixture[];
  predictions: UserPrediction[];
  leaderboardPoints: Record<string, { username: string; points: number; streak: number; correct: number; total: number }>;
  lastSettledPredictionWatDate?: string;
}

function deterministicHash(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export function getSimulatedQuotePrice(asset: SimAssetQuote, bucketMs: number = Math.floor(Date.now() / 60000)): number {
  let factor = 1;
  for (let i = 4; i >= 0; i--) {
    const h = deterministicHash(`${asset.symbol}_${bucketMs - i}`);
    const pct = ((h % 1000) / 1000 - 0.495) * 2 * asset.volatility * 0.45;
    factor *= 1 + pct;
  }
  const price = asset.basePrice * factor;
  return asset.symbol === 'USD/CAD' ? Number(price.toFixed(4)) : Number(price.toFixed(2));
}

export function getSimulatedPriceSeries(asset: SimAssetQuote, points = 16): Array<{ t: string; price: number }> {
  const nowBucket = Math.floor(Date.now() / 60000);
  const out: Array<{ t: string; price: number }> = [];
  for (let i = points - 1; i >= 0; i--) {
    const b = nowBucket - i;
    out.push({
      t: i === 0 ? 'Now' : `-${i}m`,
      price: getSimulatedQuotePrice(asset, b),
    });
  }
  return out;
}

export class CivicAndMarketEngine {
  private filePath: string;
  public state: CivicMarketState;

  constructor(dbDir: string) {
    this.filePath = path.resolve(dbDir, 'civic_market_state.json');
    this.state = this.load();
    this.ensureFixturesForToday();
  }

  private createDefaultElections(): CivicElection[] {
    const now = Date.now();
    const weekMs = 7 * 24 * 60 * 60 * 1000;
    return [
      {
        id: 'elec_ng_presidency_2027',
        country: 'nigeria',
        jurisdiction: 'Federal Republic of Nigeria (Presidency)',
        officeTitle: 'President of Nigeria',
        cycleName: 'General Election',
        status: 'ACTIVE',
        opensAt: now - 3600000,
        closesAt: now + weekMs,
        filingFeeMajor: 50000,
        currency: 'NGN',
        candidates: [],
        votersByUid: {},
      },
      {
        id: 'elec_ng_lagos_gov',
        country: 'nigeria',
        jurisdiction: 'Lagos',
        officeTitle: 'Governor of Lagos State',
        cycleName: 'State Governorship',
        status: 'ACTIVE',
        opensAt: now - 3600000,
        closesAt: now + weekMs,
        filingFeeMajor: 25000,
        currency: 'NGN',
        candidates: [],
        votersByUid: {},
      },
      {
        id: 'elec_ng_fct_mayor',
        country: 'nigeria',
        jurisdiction: 'FCT Abuja',
        officeTitle: 'FCT Minister / Mayor Council',
        cycleName: 'Municipal Council',
        status: 'ACTIVE',
        opensAt: now - 3600000,
        closesAt: now + weekMs,
        filingFeeMajor: 25000,
        currency: 'NGN',
        candidates: [],
        votersByUid: {},
      },
      {
        id: 'elec_ca_federal_pm',
        country: 'canada',
        jurisdiction: 'Canada Federal Government (Prime Minister)',
        officeTitle: 'Prime Minister of Canada',
        cycleName: 'Federal Parliament',
        status: 'ACTIVE',
        opensAt: now - 3600000,
        closesAt: now + weekMs,
        filingFeeMajor: 100,
        currency: 'CAD',
        candidates: [],
        votersByUid: {},
      },
      {
        id: 'elec_ca_ontario_premier',
        country: 'canada',
        jurisdiction: 'Ontario',
        officeTitle: 'Premier of Ontario',
        cycleName: 'Provincial Election',
        status: 'ACTIVE',
        opensAt: now - 3600000,
        closesAt: now + weekMs,
        filingFeeMajor: 50,
        currency: 'CAD',
        candidates: [],
        votersByUid: {},
      },
      {
        id: 'elec_ca_bc_premier',
        country: 'canada',
        jurisdiction: 'British Columbia',
        officeTitle: 'Premier of British Columbia',
        cycleName: 'Provincial Election',
        status: 'UPCOMING',
        opensAt: now + 86400000,
        closesAt: now + weekMs * 2,
        filingFeeMajor: 50,
        currency: 'CAD',
        candidates: [],
        votersByUid: {},
      },
    ];
  }

  private load(): CivicMarketState {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      if (fs.existsSync(this.filePath)) {
        const parsed = JSON.parse(fs.readFileSync(this.filePath, 'utf-8'));
        return {
          portfoliosByUid: parsed.portfoliosByUid || {},
          marketOrders: Array.isArray(parsed.marketOrders) ? parsed.marketOrders : [],
          elections: Array.isArray(parsed.elections) && parsed.elections.length > 0 ? parsed.elections : this.createDefaultElections(),
          fixtures: Array.isArray(parsed.fixtures) ? parsed.fixtures : [],
          predictions: Array.isArray(parsed.predictions) ? parsed.predictions : [],
          leaderboardPoints: parsed.leaderboardPoints || {},
          lastSettledPredictionWatDate: parsed.lastSettledPredictionWatDate,
        };
      }
    } catch (err) {
      console.error('Error loading civic market state:', err);
    }
    return {
      portfoliosByUid: {},
      marketOrders: [],
      elections: this.createDefaultElections(),
      fixtures: [],
      predictions: [],
      leaderboardPoints: {},
    };
  }

  public save(): void {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      const tmp = `${this.filePath}.tmp`;
      fs.writeFileSync(tmp, JSON.stringify(this.state, null, 2), 'utf-8');
      fs.renameSync(tmp, this.filePath);
    } catch (err) {
      console.error('Error saving civic market state:', err);
    }
  }

  // ---- SIMULATED MARKET & FOREX TRADING ----
  public getMarketSnapshot(uid: string) {
    const quotes = SIM_MARKET_ASSETS.map((a) => ({
      ...a,
      currentPrice: getSimulatedQuotePrice(a),
      series: getSimulatedPriceSeries(a, 14),
    }));
    const holdings = Object.values(this.state.portfoliosByUid[uid] || {});
    let unrealizedPnlNGN = 0;
    let unrealizedPnlCAD = 0;
    let realizedPnlNGN = 0;
    let realizedPnlCAD = 0;
    const enrichedHoldings = holdings.map((h) => {
      const q = quotes.find((item) => item.symbol === h.symbol);
      const currentPrice = q?.currentPrice || h.avgCost;
      const marketVal = h.quantity * currentPrice;
      const costBasis = h.quantity * h.avgCost;
      const unrealized = marketVal - costBasis;
      if (h.currency === 'CAD') {
        unrealizedPnlCAD += unrealized;
        realizedPnlCAD += h.realizedPnl;
      } else {
        unrealizedPnlNGN += unrealized;
        realizedPnlNGN += h.realizedPnl;
      }
      return {
        ...h,
        currentPrice,
        marketValue: Number(marketVal.toFixed(2)),
        unrealizedPnl: Number(unrealized.toFixed(2)),
      };
    });
    const orders = this.state.marketOrders.filter((o) => o.uid === uid).slice(0, 60);
    return {
      disclaimer: 'Simulated Virtual Market & Forex Simulator — Practice & In-Game Virtual Economy Only.',
      quotes,
      holdings: enrichedHoldings,
      summary: {
        unrealizedPnlNGN: Number(unrealizedPnlNGN.toFixed(2)),
        unrealizedPnlCAD: Number(unrealizedPnlCAD.toFixed(2)),
        realizedPnlNGN: Number(realizedPnlNGN.toFixed(2)),
        realizedPnlCAD: Number(realizedPnlCAD.toFixed(2)),
      },
      orders,
    };
  }

  public executeTrade(params: {
    uid: string;
    symbol: string;
    side: 'buy' | 'sell';
    quantity: number;
    economy: EconomyEngine;
    requestId?: string;
  }): { ok: boolean; error?: string; account?: any; order?: MarketOrder } {
    const asset = SIM_MARKET_ASSETS.find((a) => a.symbol === params.symbol);
    if (!asset) return { ok: false, error: 'Simulated market asset not found.' };
    const qty = Number(params.quantity);
    if (!Number.isFinite(qty) || qty <= 0) return { ok: false, error: 'Quantity must be greater than zero.' };

    const unitPrice = getSimulatedQuotePrice(asset);
    const totalMajor = Number((unitPrice * qty).toFixed(2));
    if (totalMajor <= 0) return { ok: false, error: 'Trade value too small.' };

    if (!this.state.portfoliosByUid[params.uid]) {
      this.state.portfoliosByUid[params.uid] = {};
    }
    const userHoldings = this.state.portfoliosByUid[params.uid];
    const existing = userHoldings[asset.symbol] || {
      symbol: asset.symbol,
      currency: asset.currency,
      quantity: 0,
      avgCost: 0,
      realizedPnl: 0,
    };

    if (params.side === 'buy') {
      const debitRes = params.economy.debitMinor({
        uid: params.uid,
        currency: asset.currency,
        amountMinor: majorToMinor(totalMajor),
        title: `Invest Sim BUY ${qty} ${asset.symbol} @ ${unitPrice}`,
        category: 'business',
        recipientOrSender: `${asset.market} Market Simulator`,
        requestId: params.requestId,
      });
      if (!debitRes.ok) return { ok: false, error: debitRes.error };

      const prevCost = existing.quantity * existing.avgCost;
      const newQty = Number((existing.quantity + qty).toFixed(4));
      existing.avgCost = Number(((prevCost + totalMajor) / newQty).toFixed(4));
      existing.quantity = newQty;
      userHoldings[asset.symbol] = existing;

      const order: MarketOrder = {
        id: `ord_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        uid: params.uid,
        symbol: asset.symbol,
        side: 'buy',
        currency: asset.currency,
        quantity: qty,
        unitPrice,
        totalMajor,
        timestamp: Date.now(),
      };
      this.state.marketOrders.unshift(order);
      this.save();
      return { ok: true, account: debitRes.account, order };
    } else {
      if (existing.quantity < qty) {
        return { ok: false, error: `Insufficient ${asset.symbol} holdings (${existing.quantity} available).` };
      }
      const creditRes = params.economy.creditMinor({
        uid: params.uid,
        currency: asset.currency,
        amountMinor: majorToMinor(totalMajor),
        title: `Invest Sim SELL ${qty} ${asset.symbol} @ ${unitPrice}`,
        category: 'business',
        recipientOrSender: `${asset.market} Market Simulator`,
        requestId: params.requestId,
      });
      if (!creditRes.ok) return { ok: false, error: creditRes.error };

      const realized = Number(((unitPrice - existing.avgCost) * qty).toFixed(2));
      existing.realizedPnl = Number((existing.realizedPnl + realized).toFixed(2));
      existing.quantity = Number((existing.quantity - qty).toFixed(4));
      if (existing.quantity <= 0.0001) {
        existing.quantity = 0;
      }
      userHoldings[asset.symbol] = existing;

      const order: MarketOrder = {
        id: `ord_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        uid: params.uid,
        symbol: asset.symbol,
        side: 'sell',
        currency: asset.currency,
        quantity: qty,
        unitPrice,
        totalMajor,
        pnlMajor: realized,
        timestamp: Date.now(),
      };
      this.state.marketOrders.unshift(order);
      this.save();
      return { ok: true, account: creditRes.account, order };
    }
  }

  // ---- GOVERNMENT & ELECTIONS (NIGERIA & CANADA SEPARATED) ----
  public createOrEnsureJurisdictionElection(country: 'nigeria' | 'canada', jurisdiction: string): CivicElection {
    const validList = country === 'canada' ? CANADA_PROVINCES_TERRITORIES_GOV : NIGERIA_STATES_GOV;
    const matched = validList.find((j) => j.toLowerCase() === jurisdiction.toLowerCase().trim());
    if (!matched) {
      throw new Error(`Invalid jurisdiction "${jurisdiction}" for ${country}.`);
    }
    let elec = this.state.elections.find((e) => e.country === country && e.jurisdiction === matched && e.status !== 'CONCLUDED');
    if (!elec) {
      const now = Date.now();
      elec = {
        id: `elec_${country}_${matched.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${now}`,
        country,
        jurisdiction: matched,
        officeTitle:
          country === 'canada'
            ? matched.includes('Federal')
              ? 'Prime Minister of Canada'
              : `Premier of ${matched}`
            : matched.includes('Federal')
            ? 'President of Nigeria'
            : matched === 'FCT Abuja'
            ? 'FCT Abuja Council Chairperson'
            : `Governor of ${matched} State`,
        cycleName: '2026–2030 Mandate',
        status: 'ACTIVE',
        opensAt: now - 1000,
        closesAt: now + 7 * 24 * 60 * 60 * 1000,
        filingFeeMajor: country === 'canada' ? 50 : 25000,
        currency: country === 'canada' ? 'CAD' : 'NGN',
        candidates: [],
        votersByUid: {},
      };
      this.state.elections.unshift(elec);
      this.save();
    }
    return elec;
  }

  public declareCandidacy(params: {
    uid: string;
    username: string;
    displayName: string;
    country: 'nigeria' | 'canada';
    jurisdiction: string;
    party: string;
    manifesto: string;
    economy: EconomyEngine;
    requestId?: string;
  }): { ok: boolean; error?: string; election?: CivicElection; account?: any } {
    let elec: CivicElection;
    try {
      elec = this.createOrEnsureJurisdictionElection(params.country, params.jurisdiction);
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : 'Invalid jurisdiction.' };
    }
    if (elec.status === 'CONCLUDED') return { ok: false, error: 'Election has already concluded.' };
    if (elec.candidates.some((c) => c.uid === params.uid)) {
      return { ok: false, error: 'You are already registered as a candidate in this election.' };
    }

    const debit = params.economy.debitMinor({
      uid: params.uid,
      currency: elec.currency,
      amountMinor: majorToMinor(elec.filingFeeMajor),
      title: `Election Filing Fee (${elec.jurisdiction})`,
      category: 'general',
      recipientOrSender: elec.country === 'canada' ? 'Elections Canada / Provincial Registry' : 'INEC Electoral Commission',
      requestId: params.requestId,
    });
    if (!debit.ok) return { ok: false, error: debit.error };

    const candidate: ElectionCandidate = {
      id: `cand_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
      uid: params.uid,
      username: params.username,
      displayName: params.displayName || params.username,
      party: String(params.party || 'Independent Coalition').trim().slice(0, 48),
      manifesto: String(params.manifesto || 'Prosperity, accountability and infrastructure.').trim().slice(0, 320),
      announcements: [],
      votes: 0,
      filedAt: Date.now(),
    };
    elec.candidates.push(candidate);
    elec.status = 'ACTIVE';
    this.save();
    realtimeHub.broadcastAll({ type: 'gov:election_updated', electionId: elec.id });
    return { ok: true, election: elec, account: debit.account };
  }

  public publishCampaignAnnouncement(uid: string, electionId: string, text: string): { ok: boolean; error?: string; election?: CivicElection } {
    const elec = this.state.elections.find((e) => e.id === electionId);
    if (!elec) return { ok: false, error: 'Election not found.' };
    const cand = elec.candidates.find((c) => c.uid === uid);
    if (!cand) return { ok: false, error: 'Only registered candidates in this election can post campaign statements.' };
    cand.announcements.unshift({
      id: `ann_${Date.now()}`,
      text: String(text || '').trim().slice(0, 240),
      createdAt: Date.now(),
    });
    this.save();
    return { ok: true, election: elec };
  }

  public castVote(uid: string, electionId: string, candidateId: string): { ok: boolean; error?: string; election?: CivicElection } {
    const elec = this.state.elections.find((e) => e.id === electionId);
    if (!elec) return { ok: false, error: 'Election not found.' };
    if (elec.status !== 'ACTIVE') return { ok: false, error: `Voting is not active (status: ${elec.status}).` };
    if (elec.votersByUid[uid]) {
      return { ok: false, error: 'Duplicate vote rejected: Your account has already voted in this election.' };
    }
    const cand = elec.candidates.find((c) => c.id === candidateId);
    if (!cand) return { ok: false, error: 'Candidate not found in this election.' };
    cand.votes += 1;
    elec.votersByUid[uid] = candidateId;
    this.save();
    realtimeHub.broadcastAll({ type: 'gov:election_updated', electionId: elec.id });
    return { ok: true, election: elec };
  }

  public concludeElection(electionId: string): { ok: boolean; error?: string; election?: CivicElection } {
    const elec = this.state.elections.find((e) => e.id === electionId);
    if (!elec) return { ok: false, error: 'Election not found.' };
    if (elec.status === 'CONCLUDED') return { ok: true, election: elec };
    elec.status = 'CONCLUDED';
    elec.closesAt = Date.now();
    if (elec.candidates.length > 0) {
      const sorted = [...elec.candidates].sort((a, b) => b.votes - a.votes);
      elec.winnerUsername = sorted[0].username;
      elec.winnerDisplayName = sorted[0].displayName;
    }
    this.save();
    return { ok: true, election: elec };
  }

  // ---- NAIJA BET FREE SPORTS PREDICTIONS (NO PAID WAGERING · 8:00 PM WAT) ----
  public ensureFixturesForToday(nowMs: number = Date.now()): void {
    const wat = getWatClock(nowMs);
    const todayStr = wat.dateStr;
    const hasToday = this.state.fixtures.some((f) => f.watMatchDate === todayStr);
    if (hasToday) return;

    const pairs = [
      { league: 'NPFL Premier', home: 'Enyimba FC', away: 'Kano Pillars', time: '4:00 PM WAT' },
      { league: 'NPFL Premier', home: 'Remo Stars', away: 'Shooting Stars (3SC)', time: '5:30 PM WAT' },
      { league: 'English Premier League', home: 'Arsenal', away: 'Chelsea', time: '6:30 PM WAT' },
      { league: 'UEFA Champions League', home: 'Real Madrid', away: 'Bayern Munich', time: '7:45 PM WAT' },
      { league: 'Canadian MLS', home: 'Toronto FC', away: 'CF Montreal', time: '7:30 PM WAT' },
    ];
    pairs.forEach((p, idx) => {
      this.state.fixtures.unshift({
        id: `fix_${todayStr}_${idx}`,
        league: p.league,
        homeTeam: p.home,
        awayTeam: p.away,
        kickoffLabel: `${todayStr} · ${p.time}`,
        watMatchDate: todayStr,
        status: 'UPCOMING',
      });
    });
    this.state.fixtures = this.state.fixtures.slice(0, 60);
    this.save();
  }

  public submitFreePrediction(params: {
    uid: string;
    username: string;
    fixtureId: string;
    pick: 'HOME_WIN' | 'DRAW' | 'AWAY_WIN';
  }): { ok: boolean; error?: string; prediction?: UserPrediction } {
    this.ensureFixturesForToday();
    const fix = this.state.fixtures.find((f) => f.id === params.fixtureId);
    if (!fix) return { ok: false, error: 'Fixture not found.' };
    if (fix.status !== 'UPCOMING') return { ok: false, error: 'Match predictions have already locked/settled.' };
    if (!['HOME_WIN', 'DRAW', 'AWAY_WIN'].includes(params.pick)) {
      return { ok: false, error: 'Pick must be HOME_WIN, DRAW, or AWAY_WIN.' };
    }
    const dup = this.state.predictions.find((p) => p.uid === params.uid && p.fixtureId === params.fixtureId);
    if (dup) {
      return { ok: false, error: 'You have already submitted your free prediction for this match.' };
    }
    const pred: UserPrediction = {
      id: `pred_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
      uid: params.uid,
      username: params.username,
      fixtureId: fix.id,
      watMatchDate: fix.watMatchDate,
      pick: params.pick,
      status: 'PENDING',
      pointsAwarded: 0,
      createdAt: Date.now(),
    };
    this.state.predictions.unshift(pred);
    this.save();
    return { ok: true, prediction: pred };
  }

  /**
   * Authoritative 8:00 PM WAT (20:00 Africa/Lagos) daily prediction settlement.
   * Zero real-money wagering; scores virtual prediction points & leaderboard streaks.
   */
  public settlePredictionsAt800Wat(nowMs: number = Date.now(), economy?: EconomyEngine): {
    settledFixturesCount: number;
    settledPredictionsCount: number;
  } {
    const clock = getWatClock(nowMs);
    const cutoffWatDate = clock.totalMinutes >= 20 * 60 ? clock.dateStr : shiftWatDate(clock.dateStr, -1);

    let settledFixturesCount = 0;
    let settledPredictionsCount = 0;

    for (const fix of this.state.fixtures) {
      if (fix.status === 'UPCOMING' && fix.watMatchDate <= cutoffWatDate) {
        const h = deterministicHash(fix.id);
        const mod = h % 10;
        const result: 'HOME_WIN' | 'DRAW' | 'AWAY_WIN' = mod < 5 ? 'HOME_WIN' : mod < 8 ? 'AWAY_WIN' : 'DRAW';
        const scoreStr =
          result === 'HOME_WIN'
            ? `${2 + (h % 2)} - ${h % 2}`
            : result === 'AWAY_WIN'
            ? `${h % 2} - ${2 + (h % 2)}`
            : `${1 + (h % 2)} - ${1 + (h % 2)}`;
        fix.status = 'SETTLED';
        fix.result = result;
        fix.finalScore = scoreStr;
        settledFixturesCount++;
      }
    }

    for (const pred of this.state.predictions) {
      if (pred.status !== 'PENDING') continue;
      const fix = this.state.fixtures.find((f) => f.id === pred.fixtureId);
      if (!fix || fix.status !== 'SETTLED' || !fix.result) continue;

      const won = pred.pick === fix.result;
      const cleanUser = pred.username.toLowerCase();
      if (!this.state.leaderboardPoints[cleanUser]) {
        this.state.leaderboardPoints[cleanUser] = {
          username: pred.username,
          points: 0,
          streak: 0,
          correct: 0,
          total: 0,
        };
      }
      const lb = this.state.leaderboardPoints[cleanUser];
      lb.total += 1;

      if (won) {
        lb.streak += 1;
        lb.correct += 1;
        const streakBonus = lb.streak >= 3 ? 5 : 0;
        const pts = 10 + streakBonus;
        pred.status = 'WON';
        pred.pointsAwarded = pts;
        lb.points += pts;
        const acc = economy?.store.accountsByUid[pred.uid];
        if (acc) {
          acc.predictionPoints = (acc.predictionPoints || 0) + pts;
        }
      } else {
        lb.streak = 0;
        pred.status = 'LOST';
        pred.pointsAwarded = 0;
      }
      pred.settledAt = nowMs;
      settledPredictionsCount++;
    }

    if (settledFixturesCount > 0 || settledPredictionsCount > 0) {
      this.state.lastSettledPredictionWatDate = cutoffWatDate;
      this.save();
      economy?.save();
      realtimeHub.broadcastAll({
        type: 'predictions:wat_settled',
        watDate: cutoffWatDate,
        settledFixturesCount,
      });
    }

    return { settledFixturesCount, settledPredictionsCount };
  }
}
