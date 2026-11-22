/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { MapPin, Navigation, Clock, CheckCircle2, Car } from 'lucide-react';
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

interface RideCompanyDef {
  id: 'ekogo' | 'swiftcab' | 'mapleride';
  name: string;
  tagline: string;
  color: string;
  rating: number;
  baseNGN: number;
  perUnitNGN: number;
  baseCAD: number;
  perUnitCAD: number;
  tierLabel: string;
  etaMins: number;
}

const DEFAULT_COMPANIES: RideCompanyDef[] = [
  {
    id: 'ekogo',
    name: 'EkoGo',
    tagline: 'Everyday Smart City Rides',
    color: '#10b981',
    rating: 4.7,
    baseNGN: 1200,
    perUnitNGN: 380,
    baseCAD: 6.5,
    perUnitCAD: 1.9,
    tierLabel: 'Value Economy',
    etaMins: 4,
  },
  {
    id: 'swiftcab',
    name: 'SwiftCab',
    tagline: 'AC Comfort & Priority Dispatch',
    color: '#f59e0b',
    rating: 4.9,
    baseNGN: 1850,
    perUnitNGN: 470,
    baseCAD: 9.0,
    perUnitCAD: 2.35,
    tierLabel: 'Comfort Sedan',
    etaMins: 2,
  },
  {
    id: 'mapleride',
    name: 'RoyalLux Ride',
    tagline: 'Executive SUV Chauffeur',
    color: '#38bdf8',
    rating: 4.95,
    baseNGN: 3400,
    perUnitNGN: 720,
    baseCAD: 15.0,
    perUnitCAD: 3.4,
    tierLabel: 'Executive Class',
    etaMins: 3,
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
      {id === 'mapleride' && (
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
  const [companies, setCompanies] = useState<RideCompanyDef[]>(DEFAULT_COMPANIES);
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
        if (Array.isArray(data.companies) && data.companies.length > 0) {
          setCompanies(data.companies);
        }
        setRides(Array.isArray(data.history) ? data.history : []);
      }
    } catch {}
  }, []);

  useEffect(() => {
    loadRides();
  }, [loadRides]);

  const activeRide = rides.find((r) => r.status !== 'COMPLETED');

  useEffect(() => {
    if (!activeRide) return;
    const timer = window.setInterval(async () => {
      const nextStatus =
        activeRide.status === 'SEARCHING'
          ? 'DRIVER_EN_ROUTE'
          : activeRide.status === 'DRIVER_EN_ROUTE'
          ? 'IN_TRANSIT'
          : 'COMPLETED';
      const headers = await getAuthBearerHeaders();
      await fetch('/api/rides/status', {
        method: 'POST',
        headers,
        body: JSON.stringify({ rideId: activeRide.id, status: nextStatus }),
      });
      if (nextStatus === 'COMPLETED') {
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

  const handleBookRide = async (provider: RideCompanyDef) => {
    if (pickup === destination) {
      onShowToast?.('Pickup and destination must be different.');
      return;
    }

    setBusy(true);
    try {
      const headers = await getAuthBearerHeaders();
      const resp = await fetch('/api/rides/book', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          companyId: provider.id,
          pickup,
          destination,
          distanceKm,
          country: isCanada ? 'canada' : 'nigeria',
          requestId: `ride_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
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
          cashNaira: data.account.cashNaira ?? 0,
          bankCAD: data.account.bankCAD,
          receipts: data.account.receipts,
        });
      }
      onShowToast?.(`${provider.name} driver ${data.ride?.driverName || ''} dispatched!`);
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
              {isCanada ? 'Ontario Ride Network (CAD)' : `${currentStateId?.toUpperCase()} Transit (NGN)`}
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
            <span className="flex items-center gap-1.5">
              <Car className="w-4 h-4" /> {activeRide.companyName} Live Trip
            </span>
            <span className="uppercase font-mono text-[10px] px-2 py-0.5 rounded bg-emerald-500/20">
              {String(activeRide.status).replace(/_/g, ' ')}
            </span>
          </div>
          <div className="text-[11px] text-white">
            {activeRide.pickup} &rarr; {activeRide.destination}
          </div>
          <div className="text-[10px] text-zinc-300 font-mono">
            Driver: {activeRide.driverName} · Plate: {activeRide.vehiclePlate}
          </div>
          <div className="grid grid-cols-4 gap-1 pt-1">
            {['SEARCHING', 'DRIVER_EN_ROUTE', 'IN_TRANSIT', 'COMPLETED'].map((st, idx) => {
              const curIdx = ['SEARCHING', 'DRIVER_EN_ROUTE', 'IN_TRANSIT', 'COMPLETED'].indexOf(activeRide.status);
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

          <div className="space-y-2">
            {companies.map((p) => {
              const fare = isCanada
                ? +(p.baseCAD + distanceKm * p.perUnitCAD).toFixed(2)
                : Math.round(p.baseNGN + distanceKm * p.perUnitNGN);
              const eta = p.etaMins + Math.floor(distanceKm / 6);
              return (
                <div key={p.id} className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <ProviderLogo id={p.id} accent={p.color} />
                    <div className="min-w-0">
                      <div className="text-xs font-black text-white">
                        {p.name} <span className="text-[9px] text-zinc-400 font-normal">· {p.tierLabel} ({p.rating}★)</span>
                      </div>
                      <div className="text-[10px] text-zinc-400 truncate">{p.tagline}</div>
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
                  <div className="text-[10px] text-zinc-500 font-mono">
                    From {r.pickup} · {r.driverName} · {r.status}
                  </div>
                </div>
                <span className="font-mono font-bold text-teal-300">
                  {r.currency === 'CAD' ? formatCAD(r.fareMajor) : formatNaira(r.fareMajor)}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
