/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ShieldCheck, FileCheck2, AlertTriangle, RefreshCw } from 'lucide-react';
import { UserProfile } from '../types/game';
import { formatNaira, formatCAD } from '../utils/formatNaira';
import { getAuthBearerHeaders } from '../services/economyService';

export interface InsuranceAppProps {
  userProfile?: UserProfile;
  ownedProperties?: { id: string; name?: string }[];
  ownedVehicles?: { id: string; name?: string }[];
  currentStateId?: string;
  onUpdateProfile?: (updatedProfile: UserProfile) => void;
  onShowToast?: (msg: string) => void;
  triggerSound?: (type: 'coin' | 'stamp' | 'alert' | 'success') => void;
}

export const InsuranceApp: React.FC<InsuranceAppProps> = ({
  userProfile,
  ownedProperties = [],
  ownedVehicles = [],
  currentStateId = 'lagos',
  onUpdateProfile,
  onShowToast,
  triggerSound,
}) => {
  const isCanada = currentStateId === 'canada' || userProfile?.currentCountry === 'canada';

  const [tab, setTab] = useState<'plans' | 'policies' | 'claims'>('plans');
  const [plans, setPlans] = useState<any[]>([]);
  const [policies, setPolicies] = useState<any[]>([]);
  const [claimPolicyId, setClaimPolicyId] = useState('');
  const [claimIncidentKey, setClaimIncidentKey] = useState('inc_' + new Date().toISOString().slice(0, 10));
  const [claimAmount, setClaimAmount] = useState(50000);
  const [claimDesc, setClaimDesc] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const loadInsurance = useCallback(async () => {
    try {
      const headers = await getAuthBearerHeaders();
      const resp = await fetch('/api/insurance/state', { headers });
      const data = await resp.json();
      if (resp.ok && data.success) {
        const polList = Array.isArray(data.policies) ? data.policies : [];
        setPlans(Array.isArray(data.plans) ? data.plans : []);
        setPolicies(polList);
        if (polList.length > 0 && !claimPolicyId) {
          setClaimPolicyId(polList[0].id);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [claimPolicyId]);

  useEffect(() => {
    loadInsurance();
  }, [loadInsurance]);

  const allClaims = useMemo(() => {
    const items: Array<any> = [];
    for (const pol of policies) {
      for (const cl of pol.claimsHistory || []) {
        items.push({ ...cl, currency: pol.currency, policyName: pol.name });
      }
    }
    return items.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }, [policies]);

  const handleBuyPolicy = async (planId: string) => {
    setBusy(true);
    try {
      const headers = await getAuthBearerHeaders();
      const resp = await fetch('/api/insurance/buy', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          planId,
          currency: isCanada ? 'CAD' : 'NGN',
          requestId: `ins_buy_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        onShowToast?.(data.error || 'Policy purchase failed.');
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
      onShowToast?.('Insurance policy activated!');
      triggerSound?.('stamp');
      setTab('policies');
      loadInsurance();
    } finally {
      setBusy(false);
    }
  };

  const handleSubmitClaim = async () => {
    if (!claimPolicyId || !claimDesc.trim()) {
      onShowToast?.('Select an active policy and describe the incident.');
      return;
    }
    setBusy(true);
    try {
      const selectedPol = policies.find((p) => p.id === claimPolicyId);
      const hasHomeOrProperty = Boolean(
        ownedProperties.length > 0 ||
          Object.keys(userProfile?.houseLayouts || {}).length > 0 ||
          (userProfile?.ownedBusinesses && userProfile.ownedBusinesses.length > 0)
      );
      const hasVehicle = Boolean(ownedVehicles.length > 0);
      const hasMatchingAsset =
        selectedPol?.category === 'vehicle'
          ? hasVehicle
          : selectedPol?.category === 'business' || selectedPol?.category === 'property'
          ? hasHomeOrProperty
          : true;

      const headers = await getAuthBearerHeaders();
      const resp = await fetch('/api/insurance/claim', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          policyId: claimPolicyId,
          incidentKey: claimIncidentKey.trim() || `inc_${Date.now()}`,
          reason: claimDesc.trim(),
          requestedMajor: claimAmount,
          hasMatchingAsset,
        }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        onShowToast?.(data.error || 'Claim denied.');
        triggerSound?.('alert');
        loadInsurance();
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
      setClaimDesc('');
      onShowToast?.('Insurance claim settled and credited!');
      triggerSound?.('coin');
      loadInsurance();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="p-3 rounded-2xl bg-gradient-to-r from-sky-950/90 via-zinc-950 to-black border border-sky-500/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-sky-400" />
          <div>
            <h3 className="text-xs font-black text-white">ShieldSure Insurance</h3>
            <p className="text-[10px] text-sky-300 font-mono">
              {policies.length} Active Policies · {isCanada ? 'Canada CAD' : 'Nigeria NGN'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-[10px] font-bold">
        {[
          { id: 'plans', label: 'Plans' },
          { id: 'policies', label: `Active (${policies.length})` },
          { id: 'claims', label: 'File Claim' },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id as any)}
            className={`py-1.5 rounded-lg cursor-pointer ${
              tab === t.id ? 'bg-sky-500 text-black font-black' : 'text-zinc-400 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-10 text-center text-xs text-zinc-400 flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-sky-400" /> Syncing underwriters...
        </div>
      ) : tab === 'plans' ? (
        <div className="space-y-2">
          {plans.map((p) => {
            const prem = isCanada ? formatCAD(p.premiumCAD) : formatNaira(p.premiumNGN);
            const cov = isCanada ? formatCAD(p.coverageCapCAD) : formatNaira(p.coverageCapNGN);
            return (
              <div key={p.id} className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-black text-white">{p.name}</div>
                  <div className="text-[10px] text-zinc-400 font-mono">
                    Covers up to {cov} · {p.durationDays} days · {p.provider}
                  </div>
                </div>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => handleBuyPolicy(p.id)}
                  className="px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-black font-black text-[10px] cursor-pointer shrink-0"
                >
                  {prem}
                </button>
              </div>
            );
          })}
        </div>
      ) : tab === 'policies' ? (
        <div className="space-y-2">
          {policies.length === 0 ? (
            <div className="p-6 text-center text-xs text-zinc-500 rounded-2xl bg-zinc-950 border border-zinc-800">
              No active insurance policies yet.
            </div>
          ) : (
            policies.map((pol) => (
              <div key={pol.id} className="p-3 rounded-2xl bg-zinc-950 border border-emerald-500/30 space-y-1">
                <div className="flex justify-between items-center text-xs font-black text-white">
                  <span className="flex items-center gap-1.5">
                    <FileCheck2 className="w-4 h-4 text-emerald-400" /> {pol.name}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-300 uppercase">{pol.category}</span>
                </div>
                <div className="text-[10px] text-zinc-400 font-mono">
                  Coverage Cap: {pol.currency === 'CAD' ? formatCAD(pol.coverageCapMajor) : formatNaira(pol.coverageCapMajor)} · Expires{' '}
                  {new Date(pol.expiresAt).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
            <select
              value={claimPolicyId}
              onChange={(e) => setClaimPolicyId(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white"
            >
              <option value="">Select active policy...</option>
              {policies.map((pol) => (
                <option key={pol.id} value={pol.id}>
                  {pol.name} ({pol.currency})
                </option>
              ))}
            </select>
            <input
              type="text"
              value={claimIncidentKey}
              onChange={(e) => setClaimIncidentKey(e.target.value)}
              placeholder="Incident reference ID"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
            />
            <input
              type="number"
              value={claimAmount}
              onChange={(e) => setClaimAmount(Number(e.target.value))}
              placeholder="Claim amount"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
            />
            <textarea
              rows={2}
              value={claimDesc}
              onChange={(e) => setClaimDesc(e.target.value)}
              placeholder="Describe the covered incident..."
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-2 text-xs text-white"
            />
            <button
              type="button"
              disabled={busy}
              onClick={handleSubmitClaim}
              className="w-full py-2 rounded-xl bg-sky-500 text-black font-black text-xs cursor-pointer"
            >
              Submit Validated Claim
            </button>
          </div>

          {allClaims.map((cl) => (
            <div key={cl.id} className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 flex justify-between items-center text-xs">
              <div>
                <div className="font-bold text-white flex items-center gap-1">
                  <AlertTriangle className={`w-3.5 h-3.5 ${cl.status === 'APPROVED' ? 'text-emerald-400' : 'text-rose-400'}`} />
                  <span>{cl.reason}</span>
                </div>
                <div className="text-[10px] text-zinc-500 font-mono">
                  {cl.status} · {cl.incidentKey} · {cl.note}
                </div>
              </div>
              <span className={`font-mono font-bold ${cl.status === 'APPROVED' ? 'text-emerald-400' : 'text-rose-400'}`}>
                {cl.status === 'APPROVED'
                  ? `+${cl.currency === 'CAD' ? formatCAD(cl.payoutMajor) : formatNaira(cl.payoutMajor)}`
                  : 'DENIED'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
