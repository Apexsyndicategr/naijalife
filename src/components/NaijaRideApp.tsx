/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { MapPin, Navigation, Clock, RefreshCw, CheckCircle2 } from 'lucide-react';
import { UserProfile } from '../types/game';
import { formatNaira, formatCAD } from '../utils/formatNaira';
import { getAuthBearerHeaders } from '../services/economyService';

export interface NaijaRideAppProps {
  userProfile?: UserProfile;
  currentStateId?: string;
  onUpdateProfile?: (updatedProfile: UserProfile) => void;
  onShowToast?: (msg: string) => void;
  triggerSound?: (type: 'coin' | 'stamp' | 'alert' | 'success') => void;
}

const RIDE_PROVIDERS = [
  {
    id: 'ekogo',
    name: 'EkoGo',
    tier: 'Everyday Economy',
    ngnPerKm: 320,
    baseNGN: 800,
    cadPerKm: 0.95,
    baseCAD: 2.5,
    etaBase: 4,
    accent: '#10b981',
    desc: 'Budget-friendly city hatchbacks & sedans',
  },
  {
    id: 'swiftcab',
    name: 'SwiftCab',
    tier: 'Priority Comfort',
    ngnPerKm: 480,
    baseNGN: 1200,
    cadPerKm: 1.45,
    baseCAD: 3.75,
    etaBase: 2,
    accent: '#3b82f6',
    desc: 'Fast-dispatch AC sedans with priority routing',
  },
  {
    id: 'royallux',
    name: 'RoyalLux Ride',
    tier: 'Executive VIP SUV',
    ngnPerKm: 920,
    baseNGN: 2500,
    cadPerKm: 2.6,
    baseCAD: 6.5,
    etaBase: 6,
    accent: '#f59e0b',
    desc: 'Chauffeur-driven executive SUVs',
  },
];

const NIGERIA_SPOTS = [
  { name: 'Victoria Island Financial District', km: 0 },
  { name: 'Lekki Phase 1 Gate', km: 7 },
  { name: 'Ikeja City Mall & Tech Hub', km: 18 },
  { name: 'Murtala Muhammed Airport (LOS)', km: 22 },
  { name: 'Yaba Coding Campus', km: 13 },
  { name: 'Banana Island Private Estates', km: 9 },
];

const CANADA_SPOTS = [
  { name: 'Toronto Union Station Core', km: 0 },
  { name: 'Yorkville Bloor West', km: 4 },
  { name: 'Toronto Pearson Airport (YYZ)', km: 26 },
  { name: 'Scarborough Town Centre', km: 21 },
  { name: 'Mississauga Square One', km: 29 },
  { name: 'Harbourfront Financial Pier', km: 2 },
];

function ProviderLogo({ id, accent }: { id: string; accent: string }) {
  return (
    <svg viewBox="0 0 36 36" className="w-9 h-9 shrink-0">
      <rect x="2" y="2" width="32" height="32" rx="10" fill={accent} fillOpacity="0.18" stroke={accent} strokeWidth="1.8" />
      {id === 'ekogo' && (
        <path d="M10 21h16l-2-6H12l-2 6zm3 3a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm10 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" fill={accent} />
      )}
      {id === 'swiftcab' && (
        <path d="M9 18l9-7 9 7-3 1v6h-4v-4h-4v4h-4v-6l-3-1z" fill={accent} />
      )}
      {id === 'royallux' && (
        <path d="M9 24l3-10 6 4 6-4 3 10H9z" fill={accent} />
      )}
    </svg>
  );
}

export const NaijaRideApp: React.FC<NaijaRideAppProps> = ({
  userProfile,
  currentStateId = 'lagos',
  onUpdateProfile,
  onShowToast,
  triggerSound,
}) => {
  const isCanada = currentStateId === 'canada' || userProfile?.currentCountry === 'canada';
  const spots = isCanada ? CANADA_SPOTS : NIGERIA_SPOTS;

  const [tab, setTab] = useState<'book' | 'history'>('book');
  const [pickup, setPickup] = useState(spots[0].name);
  const [destination, setDestination] = useState(spots[1].name);
  const [rides, setRides] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);

  const loadRides = useCallback(async () => {
    try {
      const headers = await getAuthBearerHeaders();
      const resp = await fetch('/api/rides/state', { headers });
      const data = await resp.json();
      if (resp.ok && data.success) {
        setRides(data.rides || []);
      }
    } catch {}
  }, []);

  useEffect(() => {
    loadRides();
  }, [loadRides]);

  const activeRide = rides.find((r) => r.status !== 'completed');

  useEffect(() => {
    if (!activeRide) return;
    const timer = window.setInterval(async () => {
      const nextStatus =
        activeRide.status === 'driver_assigned'
          ? 'arriving'
          : activeRide.status === 'arriving'
          ? 'in_progress'
          : 'completed';
      const headers = await getAuthBearerHeaders();
      await fetch(`/api/rides/${activeRide.id}/advance`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ status: nextStatus }),
      });
      if (nextStatus === 'completed') {
        onShowToast?.(`Arrived at ${activeRide.destination}!`);
        triggerSound?.('success');
      }
      loadRides();
    }, 3500);
    return () => window.clearInterval(timer);
  }, [activeRide, loadRides, onShowToast, triggerSound]);

  const pKm = spots.find((s) => s.name === pickup)?.km ?? 0;
  const dKm = spots.find((s) => s.name === destination)?.km ?? 8;
  const distanceKm = Math.max(2, Math.abs(dKm - pKm) + 3);

  const handleBookRide = async (provider: (typeof RIDE_PROVIDERS)[number]) => {
    if (pickup === destination) {
      onShowToast?.('Pickup and destination must be different.');
      return;
    }
    const fare = isCanada
      ? +(provider.baseCAD + distanceKm * provider.cadPerKm).toFixed(2)
      : Math.round(provider.baseNGN + distanceKm * provider.ngnPerKm);

    setBusy(true);
    try {
      const headers = await getAuthBearerHeaders();
      const resp = await fetch('/api/rides/book', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          companyId: provider.id,
          companyName: provider.name,
          pickup,
          destination,
          fare,
          currency: isCanada ? 'CAD' : 'NGN',
          etaMinutes: provider.etaBase + Math.floor(distanceKm / 6),
        }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        onShowToast?.(data.error || 'Ride booking failed.');
        triggerSound?.('alert');
        return;
      }
      if (data.account && userProfile && onUpdateProfile) {
        onUpdateProfile({
          ...userProfile,
          ngnKobo: data.account.ngnKobo,
          cadCents: data.account.cadCents,
          bankNaira: data.account.bankNaira,
          cashNaira: 0,
          bankCAD: data.account.bankCAD,
          receipts: data.account.receipts,
        });
      }
      onShowToast?.(`${provider.name} driver dispatched!`);
      triggerSound?.('coin');
      loadRides();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="p-3 rounded-2xl bg-gradient-to-r from-teal-950/90 via-zinc-950 to-black border border-teal-500/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Navigation className="w-5 h-5 text-teal-400" />
          <div>
            <h3 className="text-xs font-black text-white">Naija Ride Dispatch</h3>
            <p className="text-[10px] text-teal-300 font-mono">
              {isCanada ? '🍁 Ontario Ride Network (CAD)' : `🇳🇬 ${currentStateId?.toUpperCase()} Transit (NGN)`}
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          {(['book', 'history'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold capitalize cursor-pointer ${
                tab === t ? 'bg-teal-500 text-black font-black' : 'bg-zinc-900 text-zinc-400'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {activeRide && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/50 border border-emerald-400/50 space-y-2">
          <div className="flex items-center justify-between text-xs font-black text-emerald-300">
            <span>{activeRide.companyName} Live Trip</span>
            <span className="uppercase font-mono text-[10px] px-2 py-0.5 rounded bg-emerald-500/20">
              {activeRide.status.replace('_', ' ')}
            </span>
          </div>
          <div className="text-[11px] text-white">
            {activeRide.pickup} ➔ {activeRide.destination}
          </div>
          <div className="grid grid-cols-4 gap-1 pt-1">
            {['driver_assigned', 'arriving', 'in_progress', 'completed'].map((st, idx) => {
              const curIdx = ['driver_assigned', 'arriving', 'in_progress', 'completed'].indexOf(activeRide.status);
              return (
                <div key={st} className={`h-1.5 rounded-full ${idx <= curIdx ? 'bg-emerald-400' : 'bg-zinc-800'}`} />
              );
            })}
          </div>
        </div>
      )}

      {tab === 'book' ? (
        <div className="space-y-3">
          <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
            <div>
              <label className="text-[10px] font-mono text-zinc-400 uppercase flex items-center gap-1 mb-1">
                <MapPin className="w-3 h-3 text-emerald-400" /> Pickup
              </label>
              <select
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-white"
              >
                {spots.map((s) => (
                  <option key={s.name} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-mono text-zinc-400 uppercase flex items-center gap-1 mb-1">
                <Navigation className="w-3 h-3 text-amber-400" /> Destination (~{distanceKm} km)
              </label>
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-white"
              >
                {spots.map((s) => (
                  <option key={s.name} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 3 Ride Companies Fare Comparison */}
          <div className="space-y-2">
            {RIDE_PROVIDERS.map((p) => {
              const fare = isCanada
                ? +(p.baseCAD + distanceKm * p.cadPerKm).toFixed(2)
                : Math.round(p.baseNGN + distanceKm * p.ngnPerKm);
              const eta = p.etaBase + Math.floor(distanceKm / 6);
              return (
                <div key={p.id} className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <ProviderLogo id={p.id} accent={p.accent} />
                    <div className="min-w-0">
                      <div className="text-xs font-black text-white">
                        {p.name} <span className="text-[9px] text-zinc-400 font-normal">· {p.tier}</span>
                      </div>
                      <div className="text-[10px] text-zinc-400 truncate">{p.desc}</div>
                      <div className="text-[10px] font-mono text-teal-300 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" /> {eta} mins away
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={busy || Boolean(activeRide)}
                    onClick={() => handleBookRide(p)}
                    className="px-3 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-black font-black text-[11px] cursor-pointer shrink-0"
                  >
                    {isCanada ? formatCAD(fare) : formatNaira(fare)}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {rides.length === 0 ? (
            <div className="p-6 text-center text-xs text-zinc-500 rounded-2xl bg-zinc-950 border border-zinc-800">
              No completed rides yet.
            </div>
          ) : (
            rides.map((r) => (
              <div key={r.id} className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 flex justify-between items-center text-xs">
                <div>
                  <div className="font-bold text-white flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{r.companyName}: {r.destination}</span>
                  </div>
                  <div className="text-[10px] text-zinc-500 font-mono">From {r.pickup} · {r.status}</div>
                </div>
                <span className="font-mono font-bold text-teal-300">
                  {r.currency === 'CAD' ? formatCAD(r.fare) : formatNaira(r.fare)}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
