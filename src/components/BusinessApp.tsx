/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Building,
  Users,
  TrendingUp,
  Clock,
  ArrowUpCircle,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { UserProfile } from '../types/game';
import { formatNaira, formatCAD } from '../utils/formatNaira';
import { parseMinorString, minorToMajorNumber } from '../utils/bigMoney';
import { getAuthBearerHeaders } from '../services/economyService';

export interface BusinessAppProps {
  userProfile?: UserProfile;
  currentStateId?: string;
  onUpdateProfile?: (updatedProfile: UserProfile) => void;
  onShowToast?: (msg: string) => void;
  triggerSound?: (type: 'coin' | 'stamp' | 'alert' | 'success') => void;
}

interface ServerBiz {
  id: string;
  name: string;
  typeId: string;
  typeName: string;
  country: 'nigeria' | 'canada';
  registeredDate: string;
  level: number;
  dailyRevenueMinor: string;
  dailyExpensesMinor: string;
  employeesCount: number;
  upgrades: string[];
  lastSettledWatDate?: string;
  totalCollectedMinor: string;
}

const NIGERIA_CATALOG = [
  { typeId: 'coffee_bar', name: 'Lekki Specialty Coffee & Pastry Bar', category: 'Food & Hospitality', cost: 450000, gross: 55000, expense: 18000 },
  { typeId: 'logistics_hub', name: 'Victoria Island Cloud Logistics Hub', category: 'Logistics', cost: 1200000, gross: 145000, expense: 48000 },
  { typeId: 'solar_grid', name: 'Abuja Clean Solar Mini-Grid', category: 'Energy', cost: 2800000, gross: 310000, expense: 90000 },
  { typeId: 'tech_studio', name: 'Yaba SaaS Engineering Studio', category: 'Technology', cost: 1850000, gross: 240000, expense: 72000 },
  { typeId: 'supermart', name: 'Wuse Retail Supermart', category: 'Retail', cost: 950000, gross: 112000, expense: 36000 },
];

const CANADA_CATALOG = [
  { typeId: 'ca_roastery', name: 'Toronto Downtown Artisan Roastery', category: 'Food & Hospitality', cost: 1800, gross: 240, expense: 85 },
  { typeId: 'ca_freight', name: 'Mississauga Cold-Chain Freight', category: 'Logistics', cost: 4500, gross: 560, expense: 190 },
  { typeId: 'ca_ai_sec', name: 'Waterloo AI Security Consultancy', category: 'Technology', cost: 6200, gross: 790, expense: 230 },
  { typeId: 'ca_grocery', name: 'Brampton Afro-Caribbean Grocery', category: 'Retail', cost: 3400, gross: 430, expense: 145 },
];

function getWatCountdownText(): { watTimeStr: string; countdownStr: string } {
  const now = new Date();
  const watMs = now.getTime() + 3600 * 1000;
  const watDate = new Date(watMs);
  const hh = String(watDate.getUTCHours()).padStart(2, '0');
  const mm = String(watDate.getUTCMinutes()).padStart(2, '0');

  let target = Date.UTC(
    watDate.getUTCFullYear(),
    watDate.getUTCMonth(),
    watDate.getUTCDate(),
    20,
    30,
    0
  );
  if (watMs >= target) {
    target += 86400 * 1000;
  }
  const diffSec = Math.max(0, Math.floor((target - watMs) / 1000));
  const remH = Math.floor(diffSec / 3600);
  const remM = Math.floor((diffSec % 3600) / 60);
  return {
    watTimeStr: `${hh}:${mm} WAT`,
    countdownStr: `${remH}h ${remM}m until 8:30 PM WAT`,
  };
}

export const BusinessApp: React.FC<BusinessAppProps> = ({
  userProfile,
  currentStateId = 'lagos',
  onUpdateProfile,
  onShowToast,
  triggerSound,
}) => {
  const defaultCountry: 'nigeria' | 'canada' =
    currentStateId === 'canada' || userProfile?.currentCountry === 'canada' ? 'canada' : 'nigeria';

  const [tab, setTab] = useState<'owned' | 'launch' | 'ledger'>('owned');
  const [countryFilter, setCountryFilter] = useState<'nigeria' | 'canada'>(defaultCountry);
  const [businesses, setBusinesses] = useState<ServerBiz[]>([]);
  const [watStatus, setWatStatus] = useState(getWatCountdownText());
  const [customNames, setCustomNames] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadBusinesses = useCallback(async () => {
    try {
      const headers = await getAuthBearerHeaders();
      const resp = await fetch('/api/business/state', { headers });
      const data = await resp.json();
      if (resp.ok && data.success) {
        setBusinesses(data.businesses || []);
        if (data.watSettlements && data.watSettlements.length > 0 && userProfile && onUpdateProfile && data.account) {
          onUpdateProfile({
            ...userProfile,
            ngnKobo: data.account.ngnKobo,
            cadCents: data.account.cadCents,
            bankNaira: data.account.bankNaira,
            cashNaira: data.account.cashNaira ?? 0,
            bankCAD: data.account.bankCAD,
            receipts: data.account.receipts,
          });
          onShowToast?.(`Settled ${data.watSettlements.length} missed 8:30 PM WAT business payout(s)!`);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [onShowToast, onUpdateProfile, userProfile]);

  useEffect(() => {
    loadBusinesses();
    const timer = window.setInterval(() => setWatStatus(getWatCountdownText()), 15000);
    return () => window.clearInterval(timer);
  }, [loadBusinesses]);

  const handleLaunchBusiness = async (
    item: (typeof NIGERIA_CATALOG)[number],
    country: 'nigeria' | 'canada',
    idx: number
  ) => {
    setBusyId(`launch_${idx}`);
    try {
      const headers = await getAuthBearerHeaders();
      const resp = await fetch('/api/business/create', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: (customNames[idx] || '').trim() || item.name,
          typeId: item.typeId,
          typeName: item.category,
          country,
          startupCost: item.cost,
          dailyRevenue: item.gross,
          dailyExpenses: item.expense,
          requestId: `biz_create_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        onShowToast?.(data.error || 'Could not launch business.');
        triggerSound?.('alert');
        return;
      }
      if (data.account && userProfile && onUpdateProfile) {
        onUpdateProfile({
          ...userProfile,
          ngnKobo: data.account.ngnKobo,
          cadCents: data.account.cadCents,
          bankNaira: data.account.bankNaira,
          cashNaira: data.account.cashNaira ?? 0,
          bankCAD: data.account.bankCAD,
          receipts: data.account.receipts,
        });
      }
      onShowToast?.(`Launched ${data.business.name}!`);
      triggerSound?.('success');
      setTab('owned');
      loadBusinesses();
    } finally {
      setBusyId(null);
    }
  };

  const handleManage = async (businessId: string, action: 'hire' | 'upgrade') => {
    setBusyId(`${businessId}_${action}`);
    try {
      const headers = await getAuthBearerHeaders();
      const resp = await fetch('/api/business/action', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          businessId,
          action,
          upgradeName: action === 'upgrade' ? 'Automation & Capacity Expansion' : undefined,
          requestId: `biz_act_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        onShowToast?.(data.error || 'Action failed.');
        triggerSound?.('alert');
        return;
      }
      if (data.account && userProfile && onUpdateProfile) {
        onUpdateProfile({
          ...userProfile,
          ngnKobo: data.account.ngnKobo,
          cadCents: data.account.cadCents,
          bankNaira: data.account.bankNaira,
          cashNaira: data.account.cashNaira ?? 0,
          bankCAD: data.account.bankCAD,
          receipts: data.account.receipts,
        });
      }
      onShowToast?.(action === 'hire' ? 'Hired +1 Employee (+18% daily output)!' : 'Business tier upgraded (+32% daily output)!');
      triggerSound?.('coin');
      loadBusinesses();
    } finally {
      setBusyId(null);
    }
  };

  const catalog = countryFilter === 'canada' ? CANADA_CATALOG : NIGERIA_CATALOG;
  const bizReceipts = (userProfile?.receipts || []).filter((r) => r.category === 'business').slice(0, 12);

  return (
    <div className="space-y-3">
      {/* Header + 8:30 PM WAT Banner */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-950/90 via-zinc-950 to-black border border-amber-500/40 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-xs font-black text-white">Empire Biz Ventures</h3>
              <p className="text-[10px] text-amber-300 font-mono">
                {businesses.length} Active Enterprise{businesses.length === 1 ? '' : 's'}
              </p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-[9px] font-mono font-bold">
            {watStatus.watTimeStr}
          </span>
        </div>
        <div className="p-2 rounded-xl bg-black/50 border border-amber-500/20 flex items-center justify-between text-[10px]">
          <span className="text-zinc-300 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-400" /> Daily Net Settlement (8:30 PM WAT):
          </span>
          <span className="font-mono font-black text-amber-300">{watStatus.countdownStr}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-[10px] font-bold">
        {[
          { id: 'owned', label: `My Ventures (${businesses.length})` },
          { id: 'launch', label: 'Start Business' },
          { id: 'ledger', label: 'Payout Ledger' },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id as any)}
            className={`py-1.5 rounded-lg cursor-pointer ${
              tab === t.id ? 'bg-amber-500 text-black font-black' : 'text-zinc-400 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="py-10 text-center text-xs text-zinc-400 flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-amber-400" /> Syncing Empire Biz ledger...
        </div>
      )}

      {/* TAB 1: OWNED BUSINESSES */}
      {!loading && tab === 'owned' && (
        <div className="space-y-2.5">
          {businesses.length === 0 ? (
            <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 text-center space-y-2">
              <p className="text-xs text-zinc-300 font-bold">No active businesses yet.</p>
              <p className="text-[11px] text-zinc-400">
                Launch a Nigerian (NGN) or Canadian (CAD) enterprise to earn automated daily profits at 8:30 PM WAT — even while offline.
              </p>
              <button
                type="button"
                onClick={() => setTab('launch')}
                className="px-4 py-2 rounded-xl bg-amber-500 text-black font-black text-xs cursor-pointer"
              >
                Browse Business Catalog
              </button>
            </div>
          ) : (
            businesses.map((biz) => {
              const isCad = biz.country === 'canada';
              const gross = minorToMajorNumber(parseMinorString(biz.dailyRevenueMinor));
              const exp = minorToMajorNumber(parseMinorString(biz.dailyExpensesMinor));
              const net = Math.max(0, gross - exp);
              const fmt = (n: number) => (isCad ? formatCAD(n) : formatNaira(n));
              const staffCost = isCad ? 600 : 120000;
              const upgCost = isCad ? 1400 : 300000;

              return (
                <div key={biz.id} className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs font-black text-white flex items-center gap-1.5">
                        <span>{isCad ? '[CA]' : '[NG]'}</span>
                        <span>{biz.name}</span>
                      </div>
                      <div className="text-[10px] text-zinc-400 font-mono">
                        {biz.typeName} · Tier {biz.level} · {biz.employeesCount} Staff
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">
                      +{fmt(net)}/day
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 p-2 rounded-xl bg-zinc-900/70 text-[10px] font-mono">
                    <div>
                      <span className="text-zinc-500 block">Gross</span>
                      <strong className="text-zinc-200">{fmt(gross)}</strong>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">Upkeep</span>
                      <strong className="text-rose-300">-{fmt(exp)}</strong>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">Net Profit</span>
                      <strong className="text-emerald-400">{fmt(net)}</strong>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      disabled={busyId !== null}
                      onClick={() => handleManage(biz.id, 'hire')}
                      className="py-1.5 px-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-[10px] font-bold cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Users className="w-3 h-3 text-amber-400" />
                      <span>Hire ({fmt(staffCost)})</span>
                    </button>
                    <button
                      type="button"
                      disabled={busyId !== null}
                      onClick={() => handleManage(biz.id, 'upgrade')}
                      className="py-1.5 px-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-[10px] font-bold cursor-pointer flex items-center justify-center gap-1"
                    >
                      <ArrowUpCircle className="w-3 h-3" />
                      <span>Upgrade ({fmt(upgCost)})</span>
                    </button>
                  </div>

                  <div className="text-[9px] text-zinc-500 font-mono flex justify-between">
                    <span>Auto-settles daily at 8:30 PM WAT</span>
                    <span>Last settled: {biz.lastSettledWatDate || 'Pending 20:30 WAT'}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: LAUNCH CATALOG */}
      {!loading && tab === 'launch' && (
        <div className="space-y-2.5">
          <div className="grid grid-cols-2 gap-1.5">
            {(['nigeria', 'canada'] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCountryFilter(c)}
                className={`py-1.5 rounded-xl text-[10px] font-black border cursor-pointer ${
                  countryFilter === c
                    ? c === 'canada'
                      ? 'bg-red-600 text-white border-red-400'
                      : 'bg-emerald-500 text-black border-emerald-400'
                    : 'bg-zinc-950 text-zinc-400 border-zinc-800'
                }`}
              >
                {c === 'canada' ? 'Canada (CAD $)' : 'Nigeria (NGN ₦)'}
              </button>
            ))}
          </div>

          {catalog.map((item, idx) => {
            const isCad = countryFilter === 'canada';
            const fmt = (n: number) => (isCad ? formatCAD(n) : formatNaira(n));
            return (
              <div key={item.typeId} className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs font-black text-white">{item.name}</div>
                    <div className="text-[10px] text-zinc-400 font-mono">
                      {item.category} · Est. Net +{fmt(item.gross - item.expense)}/day at 8:30 PM WAT
                    </div>
                  </div>
                  <span className="text-xs font-mono font-black text-amber-300">{fmt(item.cost)}</span>
                </div>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={customNames[idx] || ''}
                    onChange={(e) => setCustomNames((prev) => ({ ...prev, [idx]: e.target.value }))}
                    placeholder="Optional custom company name..."
                    className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-2.5 py-1.5 text-[11px] text-white"
                  />
                  <button
                    type="button"
                    disabled={busyId !== null}
                    onClick={() => handleLaunchBusiness(item, countryFilter, idx)}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-[10px] cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Launch
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 3: PAYOUT LEDGER */}
      {!loading && tab === 'ledger' && (
        <div className="space-y-2">
          {bizReceipts.length === 0 ? (
            <div className="p-6 text-center text-xs text-zinc-500 rounded-2xl bg-zinc-950 border border-zinc-800">
              No Empire Biz settlements recorded yet.
            </div>
          ) : (
            bizReceipts.map((r) => (
              <div key={r.id} className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                    <span>{r.title}</span>
                  </div>
                  <div className="text-[10px] text-zinc-500 font-mono">{r.date}</div>
                </div>
                <span className={`font-mono font-black ${r.type === 'credit' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {r.type === 'credit' ? '+' : '-'}
                  {r.currency === 'CAD' ? `$${r.amount.toLocaleString()}` : `₦${r.amount.toLocaleString()}`}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
