/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Plane, Compass, Wind, ShieldAlert, Radio, Clock, MapPin, CheckCircle2 } from 'lucide-react';

export interface InFlightSimulationProps {
  originName: string;
  originIata: string;
  originCity?: string;
  destinationName: string;
  destinationIata: string;
  destinationCity?: string;
  isInternational: boolean; // True for Canada (60s), False for Domestic Nigeria (30s)
  airlineName?: string;
  aircraftModel?: string;
  onFlightComplete: () => void;
  triggerSound?: (type: 'coin' | 'stamp' | 'alert' | 'success') => void;
}

export const InFlightSimulationOverlay: React.FC<InFlightSimulationProps> = ({
  originName,
  originIata,
  originCity,
  destinationName,
  destinationIata,
  destinationCity,
  isInternational,
  airlineName = 'Air Peace / Air Canada Express',
  aircraftModel = isInternational ? 'Boeing 787-9 Dreamliner' : 'Boeing 737-800 NextGen',
  onFlightComplete,
  triggerSound,
}) => {
  // Flight duration: exactly 60 seconds for Canada / international, exactly 30 seconds for Nigerian domestic
  const totalDuration = isInternational ? 60 : 30;
  const [secondsRemaining, setSecondsRemaining] = useState<number>(totalDuration);
  const [hasLanded, setHasLanded] = useState<boolean>(false);
  const [altitude, setAltitude] = useState<number>(3800);
  const [groundspeed, setGroundspeed] = useState<number>(680);
  const [cabinAnnouncement, setCabinAnnouncement] = useState<string>('🔔 DING! Fasten Seatbelt sign on. Cleared for takeoff runway 18R.');
  const [turbulenceActive, setTurbulenceActive] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Flight progress percentage: 0% -> 100%
  const progressPct = Math.min(100, Math.max(0, ((totalDuration - secondsRemaining) / totalDuration) * 100));

  // Countdown timer engine
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setHasLanded(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [totalDuration]);

  // Telemetry updates (Altitude, Speed, Captain announcements)
  useEffect(() => {
    const elapsed = totalDuration - secondsRemaining;
    const half = totalDuration / 2;

    // Altitude profile: Climb to 38,000ft, Cruise, then Descend to 0ft
    if (elapsed < totalDuration * 0.3) {
      // Climb
      const climbPct = elapsed / (totalDuration * 0.3);
      setAltitude(Math.round(3500 + climbPct * 34500));
      setGroundspeed(Math.round(620 + climbPct * 260));
    } else if (elapsed < totalDuration * 0.75) {
      // Cruise at 38,000 ft
      setAltitude(Math.round(38000 + Math.sin(elapsed) * 150));
      setGroundspeed(Math.round(880 + Math.cos(elapsed) * 15));
    } else {
      // Descent
      const descentPct = (elapsed - totalDuration * 0.75) / (totalDuration * 0.25);
      setAltitude(Math.max(120, Math.round(38000 * (1 - descentPct))));
      setGroundspeed(Math.max(260, Math.round(880 - descentPct * 580)));
    }

    // Dynamic Pilot / Cabin Crew Announcements
    if (elapsed === 1) {
      setCabinAnnouncement('🛫 Takeoff thrust engaged! Climbing out through 10,000 feet.');
      triggerSound?.('coin');
    } else if (elapsed === Math.round(totalDuration * 0.15)) {
      setCabinAnnouncement(`✈️ Reaching cruising altitude. Welcome aboard ${airlineName}! Estimated arrival in ${destinationName}.`);
    } else if (elapsed === Math.round(totalDuration * 0.35)) {
      if (isInternational) {
        setCabinAnnouncement('🌊 Cruising over the North Atlantic at Mach 0.84. In-flight lunch: Smokey Jollof Rice, Suya Spiced Cuts & Cold Malt.');
      } else {
        setCabinAnnouncement('🍲 In-flight meal service started: Fresh meat pie, plantain chips, and cold beverages being served.');
      }
    } else if (elapsed === Math.round(totalDuration * 0.55)) {
      setTurbulenceActive(true);
      setCabinAnnouncement('⚠️ "Cabin crew take seats, light atmospheric jetstream turbulence ahead." Seatbelt sign illuminates.');
      setTimeout(() => setTurbulenceActive(false), 4500);
    } else if (elapsed === Math.round(totalDuration * 0.75)) {
      setCabinAnnouncement(`🛬 "Ladies and gentlemen, we have commenced our descent into ${destinationCity || destinationName} airspace."`);
    } else if (elapsed === Math.round(totalDuration * 0.90)) {
      setCabinAnnouncement('💺 "Cabin crew, prepare cabin for landing. Please secure all carry-on baggage." Gear down!');
    }
  }, [secondsRemaining, totalDuration, airlineName, destinationName, destinationCity, isInternational, triggerSound]);

  // Auto-finish after landing sequence completes
  useEffect(() => {
    if (hasLanded) {
      setCabinAnnouncement(`🏆 TOUCHDOWN! Reverse thrusters deployed! Welcome to ${destinationName} (${destinationIata})!`);
      triggerSound?.('success');
      const finishTimeout = setTimeout(() => {
        onFlightComplete();
      }, 1800);
      return () => clearTimeout(finishTimeout);
    }
  }, [hasLanded, destinationName, destinationIata, onFlightComplete, triggerSound]);

  // Formatted countdown time MM:SS
  const mins = Math.floor(secondsRemaining / 60);
  const secs = secondsRemaining % 60;
  const timeFormatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-[120] w-screen h-screen overflow-hidden bg-black select-none text-white flex flex-col justify-between p-3 sm:p-6 font-sans">
      {/* =========================================================================
          BACKGROUND STRATOSPHERE ATMOSPHERE WITH RAPID MOVING CLOUDS & JETSTREAM
          ========================================================================= */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Sky Gradient */}
        <div className={`absolute inset-0 transition-colors duration-1000 ${
          isInternational
            ? 'bg-gradient-to-b from-[#020b18] via-[#091f3a] to-[#040e1d]'
            : 'bg-gradient-to-b from-[#041d14] via-[#0b3323] to-[#020f09]'
        }`} />

        {/* Moving Starfields */}
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] animate-pulse" />

        {/* Animated Turbulent Jetstream Clouds Passing at High Speed */}
        <div className="absolute inset-0 opacity-30 overflow-hidden">
          <div className="absolute -inset-x-[100%] top-1/4 h-32 bg-gradient-to-r from-transparent via-white/20 to-transparent blur-2xl animate-[moveClouds_4s_linear_infinite]" />
          <div className="absolute -inset-x-[100%] top-1/2 h-48 bg-gradient-to-r from-transparent via-sky-200/15 to-transparent blur-3xl animate-[moveClouds_2.5s_linear_infinite]" />
          <div className="absolute -inset-x-[100%] top-3/4 h-24 bg-gradient-to-r from-transparent via-emerald-200/20 to-transparent blur-xl animate-[moveClouds_3.2s_linear_infinite]" />
        </div>

        {/* Ambient Cockpit Vignette */}
        <div className="absolute inset-0 bg-radial from-transparent via-black/40 to-black/85" />
      </div>

      {/* =========================================================================
          TOP BAR: FLIGHT STATUS, AIRLINE BRAND, UNBREAKABLE LIVE CHRONOMETER
          ========================================================================= */}
      <div className="relative z-10 flex items-center justify-between gap-3 bg-zinc-950/80 border border-zinc-800 rounded-3xl p-3 sm:p-4 shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center text-xl shadow-lg border ${
            isInternational
              ? 'bg-red-950 border-red-500/60 shadow-red-950/60'
              : 'bg-emerald-950 border-emerald-500/60 shadow-emerald-950/60'
          }`}>
            {isInternational ? '🇨🇦' : '🇳🇬'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-xs font-mono font-black text-amber-400 uppercase tracking-widest">
                {airlineName}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[9px] font-black border border-emerald-500/40 animate-pulse">
                IN-FLIGHT
              </span>
            </div>
            <h2 className="text-sm sm:text-lg font-black text-white flex items-center gap-2">
              <span>{originIata}</span>
              <span className="text-zinc-500">➔</span>
              <span className="text-emerald-400">{destinationIata}</span>
              <span className="text-xs text-zinc-400 font-normal hidden sm:inline">
                ({originName} to {destinationName})
              </span>
            </h2>
          </div>
        </div>

        {/* BIG LIVE COUNTDOWN CHRONOMETER */}
        <div className="flex items-center gap-3 bg-zinc-900/90 border border-amber-500/60 rounded-2xl px-3 sm:px-5 py-2 shadow-[0_0_20px_rgba(245,158,11,0.25)]">
          <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 animate-spin [animation-duration:8s]" />
          <div className="text-right">
            <span className="text-[9px] font-mono text-zinc-400 block uppercase font-bold tracking-wider">
              TOUCHDOWN IN:
            </span>
            <div className="text-xl sm:text-2xl font-mono font-black text-amber-300 tracking-wider">
              {timeFormatted}
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          CENTER STAGE: CRAZILY ANIMATED HIGH-FLYING JETLINER & TURBINE FLAME WASH
          ========================================================================= */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center my-2 sm:my-4">
        {/* Vibrating Airplane Frame (Turbulence effect) */}
        <div className={`relative transition-transform duration-100 ${
          turbulenceActive ? 'animate-[bounce_0.2s_infinite]' : 'animate-[pulse_3s_ease-in-out_infinite]'
        }`}>
          {/* Condensation trails streaming from wingtips */}
          <div className="absolute top-1/2 -left-48 w-48 h-1 bg-gradient-to-l from-white/70 via-sky-300/30 to-transparent blur-[1px] animate-pulse" />
          <div className="absolute top-1/2 -right-48 w-48 h-1 bg-gradient-to-r from-white/70 via-sky-300/30 to-transparent blur-[1px] animate-pulse" />

          {/* Engine 1 Jet Turbine Afterburner Glow */}
          <div className="absolute -bottom-8 left-12 w-6 h-20 bg-gradient-to-b from-amber-400 via-orange-500 to-transparent blur-md rounded-full opacity-90 animate-pulse" />
          {/* Engine 2 Jet Turbine Afterburner Glow */}
          <div className="absolute -bottom-8 right-12 w-6 h-20 bg-gradient-to-b from-amber-400 via-orange-500 to-transparent blur-md rounded-full opacity-90 animate-pulse" />

          {/* Airplane Silhouette Graphic */}
          <div className="relative w-48 h-48 sm:w-64 sm:h-64 flex items-center justify-center drop-shadow-[0_20px_35px_rgba(0,0,0,0.8)]">
            <Plane className={`w-36 h-36 sm:w-48 sm:h-48 transform -rotate-45 transition-all ${
              isInternational ? 'text-rose-100 fill-white' : 'text-emerald-100 fill-emerald-50'
            }`} />

            {/* Wingtip Flashing Navigation Strobes */}
            <span className="absolute top-10 left-6 w-3 h-3 rounded-full bg-rose-500 animate-ping ring-2 ring-rose-400" />
            <span className="absolute top-10 right-6 w-3 h-3 rounded-full bg-emerald-400 animate-ping ring-2 ring-emerald-300" />
            <span className="absolute bottom-6 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-white animate-pulse ring-2 ring-white" />
          </div>

          {/* Aircraft Sub-label */}
          <div className="text-center mt-1">
            <span className="px-3 py-1 rounded-full bg-zinc-950/80 border border-zinc-800 text-[10px] font-mono font-bold text-zinc-300 tracking-wider">
              {aircraftModel} · CRUISING FL380
            </span>
          </div>
        </div>

        {/* Dynamic Pilot Public Address Announcement Ticker */}
        <div className="mt-4 sm:mt-6 max-w-xl w-full bg-zinc-950/90 border border-zinc-700/80 rounded-2xl p-3 shadow-xl backdrop-blur-md flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shrink-0">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[9px] font-mono font-bold text-amber-400 uppercase tracking-widest block">
              CAPTAIN ADELEKE · LIVE FLIGHT ANNOUNCEMENT
            </span>
            <p className="text-xs sm:text-sm text-zinc-200 font-medium truncate">
              {cabinAnnouncement}
            </p>
          </div>
        </div>
      </div>

      {/* =========================================================================
          BOTTOM HUD: AVIONICS TELEMETRY GAUGES & REAL-TIME PROGRESS TRACKER
          ========================================================================= */}
      <div className="relative z-10 space-y-3 bg-zinc-950/85 border border-zinc-800 rounded-3xl p-3 sm:p-5 shadow-2xl backdrop-blur-md">
        {/* Telemetry Numbers Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-left font-mono">
          <div className="p-2 sm:p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
            <span className="text-[9px] text-zinc-500 uppercase block font-bold">ALTITUDE</span>
            <span className="text-sm sm:text-base font-black text-sky-400">
              {altitude.toLocaleString()} FT
            </span>
          </div>

          <div className="p-2 sm:p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
            <span className="text-[9px] text-zinc-500 uppercase block font-bold">AIRSPEED</span>
            <span className="text-sm sm:text-base font-black text-emerald-400">
              {groundspeed} KM/H (M 0.83)
            </span>
          </div>

          <div className="p-2 sm:p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
            <span className="text-[9px] text-zinc-500 uppercase block font-bold">OUTSIDE TEMP</span>
            <span className="text-sm sm:text-base font-black text-zinc-300">
              -54°C (STRATOSPHERE)
            </span>
          </div>

          <div className="p-2 sm:p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
            <span className="text-[9px] text-zinc-500 uppercase block font-bold">RADAR CORRIDOR</span>
            <span className="text-sm sm:text-base font-black text-amber-400 truncate block">
              {isInternational ? 'TRANSATLANTIC DIRECT' : 'NIGERIAN NAMA AIRSPACE'}
            </span>
          </div>
        </div>

        {/* FLIGHT PROGRESS BAR & VECTOR ROUTE */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-zinc-400" />
              <span className="font-bold text-zinc-300">{originName} ({originIata})</span>
            </div>
            <div className="text-amber-400 font-bold">
              {Math.round(progressPct)}% COMPLETED ({secondsRemaining}s REMAINING)
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-emerald-400">{destinationName} ({destinationIata})</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
          </div>

          {/* Glowing Animated Progress Bar */}
          <div className="relative w-full h-3 rounded-full bg-zinc-900 overflow-hidden border border-zinc-800">
            <div
              className={`h-full transition-all duration-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.8)] ${
                isInternational
                  ? 'bg-gradient-to-r from-red-600 via-rose-500 to-amber-400'
                  : 'bg-gradient-to-r from-emerald-500 via-teal-400 to-sky-400'
              }`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        <div className="text-center text-[10px] text-zinc-500 font-mono">
          ✈️ Real-time flight physics active · Do not exit screen during descent and touchdown
        </div>
      </div>
    </div>
  );
};
