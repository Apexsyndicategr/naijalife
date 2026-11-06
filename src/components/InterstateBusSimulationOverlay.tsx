/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Bus, Clock, MapPin, CheckCircle2, Gauge, AlertTriangle, Radio, ShieldCheck } from 'lucide-react';

export interface InterstateBusSimulationProps {
  originStateName: string;
  destinationState: {
    id: string;
    name: string;
    capital?: string;
    region?: string;
  };
  busOperator?: string;
  fare?: number;
  onBusComplete: () => void;
  triggerSound?: (type: 'coin' | 'stamp' | 'alert' | 'success') => void;
}

export const InterstateBusSimulationOverlay: React.FC<InterstateBusSimulationProps> = ({
  originStateName,
  destinationState,
  busOperator = 'GIGM / Young Shall Grow Luxury Coach',
  fare = 45000,
  onBusComplete,
  triggerSound,
}) => {
  // Interstate bus road travel lasts strictly 60 seconds (1 full minute) because road travel is slower than flight
  const totalDuration = 60;
  const [secondsRemaining, setSecondsRemaining] = useState<number>(totalDuration);
  const [hasArrived, setHasArrived] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(45);
  const [highwayAnnounce, setHighwayAnnounce] = useState<string>(
    '🚌 Pneumatic doors locked! Luxury AC Coach departing motor park terminal. Safe journey prayer said!'
  );
  const [checkpointActive, setCheckpointActive] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Travel progress percentage: 0% -> 100%
  const progressPct = Math.min(100, Math.max(0, ((totalDuration - secondsRemaining) / totalDuration) * 100));

  // Countdown timer engine (1 second per tick)
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setHasArrived(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Road physics & Conductor Announcements along the route
  useEffect(() => {
    const elapsed = totalDuration - secondsRemaining;

    // Speed curve simulation: Terminal departure -> Expressway acceleration -> Ore stop/slowdown -> Arrival
    if (elapsed < 8) {
      // Pulling out of terminal
      setSpeed(Math.min(75, 30 + elapsed * 6));
    } else if (elapsed < 25) {
      // Cruising expressway
      setSpeed(Math.round(98 + Math.sin(elapsed) * 8));
    } else if (elapsed >= 25 && elapsed < 32) {
      // Checkpoint or toll gate slow down
      setSpeed(35);
    } else if (elapsed >= 32 && elapsed < 52) {
      // Full highway throttle
      setSpeed(Math.round(105 + Math.cos(elapsed) * 6));
    } else {
      // Decelerating into destination terminal
      const decPct = (elapsed - 52) / 8;
      setSpeed(Math.max(15, Math.round(95 * (1 - decPct))));
    }

    // Dynamic Nigerian highway events & announcements
    if (elapsed === 1) {
      setHighwayAnnounce('🚌 "Driver, blow horn make dat Danfo shift!" Coach merging onto express highway.');
      triggerSound?.('coin');
    } else if (elapsed === 8) {
      setHighwayAnnounce(`🛣️ Passing Sagamu/Ore Interchange. Speed steady at 100 km/h. Next terminal: ${destinationState.name}!`);
    } else if (elapsed === 18) {
      setHighwayAnnounce('🥖 Hawkers outside window: "Buy your fresh hot Gala, plantain chips, and cold bottle LaCasera!" Conductor shouting: "Hold your exact change!"');
    } else if (elapsed === 26) {
      setCheckpointActive(true);
      setHighwayAnnounce('🚨 Federal Road Safety Corps (FRSC) & Police checkpoint flagged. Driver flashed headlights, papers verified, cleared immediately!');
      setTimeout(() => setCheckpointActive(false), 5000);
    } else if (elapsed === 36) {
      setHighwayAnnounce('⛽ Quick technical stop at mega petroleum plaza. Passengers stretched legs, diesel refueled, coach rolling back onto highway.');
    } else if (elapsed === 46) {
      setHighwayAnnounce(`🌳 Rolling past lush hills and scenic highway palm groves. ${destinationState.name} state boundary signs in view!`);
    } else if (elapsed === 54) {
      setHighwayAnnounce(`🏙️ "Conductor clapping: Oya check under your seat, wake up! We don reach ${destinationState.name} Central Park!"`);
    }
  }, [secondsRemaining, destinationState.name, triggerSound]);

  // Arrival handler
  useEffect(() => {
    if (hasArrived) {
      setHighwayAnnounce(`🏆 AIRBRAKES ENGAGED (PSSSHHH)! Welcome safely to ${destinationState.name} (${destinationState.capital || 'Capital City'})!`);
      triggerSound?.('success');
      const finishTimeout = setTimeout(() => {
        onBusComplete();
      }, 2000);
      return () => clearTimeout(finishTimeout);
    }
  }, [hasArrived, destinationState.name, destinationState.capital, onBusComplete, triggerSound]);

  const mins = Math.floor(secondsRemaining / 60);
  const secs = secondsRemaining % 60;
  const timeFormatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-[125] w-screen h-screen overflow-hidden bg-zinc-950 select-none text-white flex flex-col justify-between p-3 sm:p-6 font-sans">
      {/* =========================================================================
          BACKGROUND INTERSTATE HIGHWAY TARMAC WITH MOVING ROAD LANES
          ========================================================================= */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Asphalt road background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#111814] via-[#09120c] to-[#040805]" />

        {/* Highway road perspective lines */}
        <div className="absolute inset-x-0 bottom-0 top-1/4 flex justify-center opacity-40">
          <div className="w-[380px] sm:w-[620px] h-full bg-[#1c221e] border-x-4 border-yellow-500/30 relative overflow-hidden shadow-2xl">
            {/* Dashed Center Road Lines Scrolling Downwards rapidly */}
            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-3 flex flex-col gap-6 animate-[moveRoad_1.2s_linear_infinite]">
              {Array.from({ length: 16 }).map((_, i) => (
                <div key={i} className="w-full h-12 bg-amber-400 rounded-sm shadow-[0_0_8px_rgba(251,191,36,0.6)] shrink-0" />
              ))}
            </div>
          </div>
        </div>

        {/* Ambient road greenery & tree silhouettes passing */}
        <div className="absolute inset-0 bg-radial from-transparent via-black/40 to-black/90" />
      </div>

      {/* =========================================================================
          TOP BAR: BUS OPERATOR & 1-MINUTE ROAD TRIP CHRONOMETER
          ========================================================================= */}
      <div className="relative z-10 flex items-center justify-between gap-3 bg-zinc-950/90 border border-zinc-800 rounded-3xl p-3 sm:p-4 shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center text-xl shadow-lg border bg-amber-950 border-amber-500/60 shadow-amber-950/60">
            🚍
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-xs font-mono font-black text-amber-400 uppercase tracking-widest">
                {busOperator}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[9px] font-black border border-emerald-500/40 animate-pulse">
                INTERSTATE ROAD EXPRESS
              </span>
            </div>
            <h2 className="text-sm sm:text-lg font-black text-white flex items-center gap-2">
              <span className="text-zinc-300">{originStateName}</span>
              <span className="text-amber-500">➔</span>
              <span className="text-emerald-400 font-black">{destinationState.name}</span>
              <span className="text-xs text-zinc-400 font-normal hidden sm:inline">
                (Fare: ₦{fare.toLocaleString()})
              </span>
            </h2>
          </div>
        </div>

        {/* 1-MINUTE LIVE ROAD TRAVEL COUNTDOWN */}
        <div className="flex items-center gap-3 bg-zinc-900/90 border border-amber-500/60 rounded-2xl px-3 sm:px-5 py-2 shadow-[0_0_20px_rgba(245,158,11,0.25)]">
          <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 animate-spin [animation-duration:12s]" />
          <div className="text-right">
            <span className="text-[9px] font-mono text-zinc-400 block uppercase font-bold tracking-wider">
              PARK ARRIVAL IN:
            </span>
            <div className="text-xl sm:text-2xl font-mono font-black text-amber-300 tracking-wider">
              {timeFormatted}
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          CENTER STAGE: VIBRATING LUXURY COACH BUS & HIGHWAY SCENE
          ========================================================================= */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center my-2 sm:my-4">
        {/* Animated Coach Bus with Engine Vibration */}
        <div className={`relative transition-transform duration-100 ${
          checkpointActive ? 'scale-95 transition-all' : 'animate-[bounce_0.6s_ease-in-out_infinite]'
        }`}>
          {/* Dual Headlight Beams projecting forward */}
          <div className="absolute top-1/2 -left-36 w-36 h-8 bg-gradient-to-l from-amber-300/40 via-yellow-200/10 to-transparent blur-md" />
          <div className="absolute top-1/2 -right-36 w-36 h-8 bg-gradient-to-r from-amber-300/40 via-yellow-200/10 to-transparent blur-md" />

          {/* Underglow Exhaust smoke */}
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-32 h-6 bg-zinc-600/30 blur-md rounded-full animate-pulse" />

          {/* Luxury Bus Body Icon & Graphic */}
          <div className="relative w-44 h-44 sm:w-56 sm:h-56 bg-gradient-to-br from-zinc-900 via-emerald-950/80 to-zinc-900 border-2 border-emerald-500/60 rounded-3xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.9)] flex flex-col items-center justify-center">
            <Bus className="w-24 h-24 sm:w-32 sm:h-32 text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]" />

            {/* Coach Livery Label */}
            <div className="absolute bottom-3 inset-x-3 text-center">
              <span className="px-2.5 py-0.5 rounded-full bg-black/80 border border-emerald-500/40 text-[9px] font-mono font-black text-emerald-300 tracking-wider">
                {destinationState.name.toUpperCase()} EXECUTIVE SERVICE
              </span>
            </div>

            {/* Flashing Turn Signals / Headlights */}
            <span className="absolute top-3 left-3 w-3 h-3 rounded-full bg-amber-400 animate-ping ring-2 ring-amber-300" />
            <span className="absolute top-3 right-3 w-3 h-3 rounded-full bg-amber-400 animate-ping ring-2 ring-amber-300" />
          </div>

          <div className="text-center mt-2">
            <span className="px-3 py-1 rounded-full bg-zinc-950/80 border border-zinc-800 text-[10px] font-mono font-bold text-zinc-300 tracking-wider">
              MERCEDES-BENZ MARCOPOLO COACH · SPEED LIMITER ACTIVE
            </span>
          </div>
        </div>

        {/* Dynamic Highway Public Announcement Ticker */}
        <div className="mt-4 sm:mt-6 max-w-xl w-full bg-zinc-950/90 border border-zinc-700/80 rounded-2xl p-3 shadow-xl backdrop-blur-md flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shrink-0">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[9px] font-mono font-bold text-amber-400 uppercase tracking-widest block">
              COACH CONDUCTOR & ROAD TELEMETRY
            </span>
            <p className="text-xs sm:text-sm text-zinc-200 font-medium truncate">
              {highwayAnnounce}
            </p>
          </div>
        </div>
      </div>

      {/* =========================================================================
          BOTTOM HUD: ROAD TELEMETRY GAUGES & REAL-TIME PROGRESS TRACKER
          ========================================================================= */}
      <div className="relative z-10 space-y-3 bg-zinc-950/85 border border-zinc-800 rounded-3xl p-3 sm:p-5 shadow-2xl backdrop-blur-md">
        {/* Telemetry Numbers Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-left font-mono">
          <div className="p-2 sm:p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
            <span className="text-[9px] text-zinc-500 uppercase block font-bold flex items-center gap-1">
              <Gauge className="w-3 h-3 text-emerald-400" /> SPEED
            </span>
            <span className="text-sm sm:text-base font-black text-emerald-400">
              {speed} KM/H
            </span>
          </div>

          <div className="p-2 sm:p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
            <span className="text-[9px] text-zinc-500 uppercase block font-bold flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-400" /> TRIP DURATION
            </span>
            <span className="text-sm sm:text-base font-black text-amber-300">
              1 MINUTE EXPRESS
            </span>
          </div>

          <div className="p-2 sm:p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
            <span className="text-[9px] text-zinc-500 uppercase block font-bold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-sky-400" /> HIGHWAY ESCORT
            </span>
            <span className="text-sm sm:text-base font-black text-sky-400">
              FRSC MONITORED
            </span>
          </div>

          <div className="p-2 sm:p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
            <span className="text-[9px] text-zinc-500 uppercase block font-bold flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-rose-400" /> ROUTE
            </span>
            <span className="text-sm sm:text-base font-black text-rose-300 truncate block">
              FEDERAL ARTERIAL A1
            </span>
          </div>
        </div>

        {/* ROAD TRAVEL PROGRESS BAR */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-zinc-400" />
              <span className="font-bold text-zinc-300">{originStateName} Motor Park</span>
            </div>
            <div className="text-amber-400 font-bold">
              {Math.round(progressPct)}% COMPLETED ({secondsRemaining}s REMAINING)
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-emerald-400">{destinationState.name} Terminal</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
          </div>

          {/* Glowing Animated Progress Bar */}
          <div className="relative w-full h-3 rounded-full bg-zinc-900 overflow-hidden border border-zinc-800">
            <div
              className="h-full transition-all duration-500 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.8)] bg-gradient-to-r from-amber-500 via-emerald-400 to-teal-400"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        <div className="text-center text-[10px] text-zinc-500 font-mono">
          🚍 Real-time road physics active · 60s interstate journey · Do not exit screen during travel
        </div>
      </div>
    </div>
  );
};
