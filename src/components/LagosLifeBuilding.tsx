/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { LocationPOI, POIType } from '../types/game';

interface LagosLifeBuildingProps {
  location: LocationPOI;
  isHome?: boolean;
  homeOwnerName?: string;
  showName?: boolean;
  isHighlighted?: boolean;
  reducedShadows?: boolean;
  style?: React.CSSProperties;
  className?: string;
  onClick: () => void;
}

// Map each POI type to its prominent category logo / emoji
export function getLocationLogo(type: POIType): string {
  switch (type) {
    case 'market':
      return '🛒';
    case 'supermarket':
      return '🧺';
    case 'hospital':
      return '🏥';
    case 'bank':
      return '🏦';
    case 'mall':
      return '🛍️';
    case 'hotel':
      return '🏨';
    case 'church':
      return '⛪';
    case 'mosque':
      return '🕌';
    case 'restaurant':
      return '🍽️';
    case 'eatery':
      return '🍲';
    case 'university':
      return '🎓';
    case 'school':
      return '📚';
    case 'gov':
      return '🏛️';
    case 'court':
      return '⚖️';
    case 'police':
      return '🚓';
    case 'club':
      return '🍸';
    case 'dealership':
      return '🏎️';
    case 'gym':
      return '🏋️';
    case 'betting':
      return '🎯';
    case 'mechanic':
      return '🔧';
    case 'boutique':
      return '👗';
    case 'stadium':
      return '⚽';
    case 'zoo':
      return '🦒';
    case 'golf':
      return '⛳';
    case 'techhub':
      return '💻';
    case 'airport':
      return '✈️';
    case 'home':
      return '🏡';
    default:
      return '🏢';
  }
}

// Primary theme color for building badge & glowing accents
export function getLocationAccent(type: POIType): { border: string; bg: string; glow: string; text: string; ring: string } {
  switch (type) {
    case 'market':
      return { border: 'border-amber-400', bg: 'bg-zinc-950/95', glow: 'shadow-amber-500/50', text: 'text-amber-300', ring: 'ring-amber-400/60' };
    case 'hospital':
      return { border: 'border-rose-500', bg: 'bg-zinc-950/95', glow: 'shadow-rose-500/50', text: 'text-rose-300', ring: 'ring-rose-500/60' };
    case 'bank':
      return { border: 'border-emerald-400', bg: 'bg-zinc-950/95', glow: 'shadow-emerald-500/50', text: 'text-emerald-300', ring: 'ring-emerald-400/60' };
    case 'mall':
    case 'supermarket':
      return { border: 'border-purple-400', bg: 'bg-zinc-950/95', glow: 'shadow-purple-500/50', text: 'text-purple-300', ring: 'ring-purple-400/60' };
    case 'hotel':
      return { border: 'border-sky-400', bg: 'bg-zinc-950/95', glow: 'shadow-sky-500/50', text: 'text-sky-300', ring: 'ring-sky-400/60' };
    case 'church':
      return { border: 'border-yellow-400', bg: 'bg-zinc-950/95', glow: 'shadow-yellow-500/50', text: 'text-yellow-300', ring: 'ring-yellow-400/60' };
    case 'mosque':
      return { border: 'border-emerald-400', bg: 'bg-zinc-950/95', glow: 'shadow-emerald-400/50', text: 'text-emerald-200', ring: 'ring-emerald-400/60' };
    case 'restaurant':
    case 'eatery':
      return { border: 'border-orange-400', bg: 'bg-zinc-950/95', glow: 'shadow-orange-500/50', text: 'text-orange-300', ring: 'ring-orange-400/60' };
    case 'university':
    case 'school':
      return { border: 'border-indigo-400', bg: 'bg-zinc-950/95', glow: 'shadow-indigo-500/50', text: 'text-indigo-300', ring: 'ring-indigo-400/60' };
    case 'gov':
    case 'court':
      return { border: 'border-teal-400', bg: 'bg-zinc-950/95', glow: 'shadow-teal-500/50', text: 'text-teal-300', ring: 'ring-teal-400/60' };
    case 'police':
      return { border: 'border-blue-500', bg: 'bg-zinc-950/95', glow: 'shadow-blue-500/50', text: 'text-blue-300', ring: 'ring-blue-500/60' };
    case 'club':
      return { border: 'border-fuchsia-400', bg: 'bg-zinc-950/95', glow: 'shadow-fuchsia-500/50', text: 'text-fuchsia-300', ring: 'ring-fuchsia-400/60' };
    case 'dealership':
      return { border: 'border-red-500', bg: 'bg-zinc-950/95', glow: 'shadow-red-500/50', text: 'text-red-300', ring: 'ring-red-500/60' };
    case 'boutique':
      return { border: 'border-pink-400', bg: 'bg-zinc-950/95', glow: 'shadow-pink-500/50', text: 'text-pink-300', ring: 'ring-pink-400/60' };
    case 'gym':
    case 'stadium':
      return { border: 'border-lime-400', bg: 'bg-zinc-950/95', glow: 'shadow-lime-500/50', text: 'text-lime-300', ring: 'ring-lime-400/60' };
    case 'techhub':
      return { border: 'border-cyan-400', bg: 'bg-zinc-950/95', glow: 'shadow-cyan-500/50', text: 'text-cyan-300', ring: 'ring-cyan-400/60' };
    case 'airport':
      return { border: 'border-sky-400', bg: 'bg-zinc-950/95', glow: 'shadow-sky-500/60', text: 'text-sky-300', ring: 'ring-sky-400/60' };
    default:
      return { border: 'border-zinc-500', bg: 'bg-zinc-950/95', glow: 'shadow-zinc-500/30', text: 'text-zinc-200', ring: 'ring-zinc-400/50' };
  }
}

export const LagosLifeBuilding: React.FC<LagosLifeBuildingProps> = ({
  location,
  isHome = false,
  homeOwnerName,
  showName = false,
  isHighlighted = false,
  reducedShadows = false,
  style,
  className = '',
  onClick,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const logo = isHome ? '🏡' : getLocationLogo(location.type);
  const accent = isHome
    ? { border: 'border-emerald-400', bg: 'bg-zinc-950/95', glow: 'shadow-emerald-400/60', text: 'text-emerald-300', ring: 'ring-emerald-400/60' }
    : getLocationAccent(location.type);

  // Render authentic 3D isometric architectural building structures
  const renderBuildingArchitecture = () => {
    // PLAYER HOME / RESIDENCE VILLA
    if (isHome) {
      return (
        <div className="relative w-32 h-26 flex flex-col items-center justify-end select-none">
          {/* Villa sloped terracotta roof */}
          <div className="w-28 h-10 bg-gradient-to-t from-amber-900 via-red-800 to-amber-700 rounded-t-2xl shadow-xl border-t border-amber-300/60 relative flex items-center justify-between px-2">
            <span className="text-[7px] font-mono font-black text-amber-200 bg-black/60 px-1 py-0.5 rounded">RESIDENCE</span>
            {/* Blue Geepee water tank on roof */}
            <div className="w-4 h-5 bg-blue-600 rounded-sm border border-blue-300 shadow absolute -top-3 right-3 flex items-center justify-center text-[7px] text-white font-bold">
              GP
            </div>
          </div>
          {/* Main 2-story Villa building */}
          <div className="w-26 h-14 bg-gradient-to-b from-stone-100 to-stone-300 border border-stone-400 shadow-xl flex flex-col justify-between p-1">
            <div className="flex justify-around items-center pt-0.5">
              <div className="w-3.5 h-4 bg-sky-400/60 rounded-sm border border-sky-600 shadow-inner" />
              <div className="w-3.5 h-4 bg-sky-400/60 rounded-sm border border-sky-600 shadow-inner" />
            </div>
            <div className="flex justify-around items-end">
              <div className="w-3.5 h-4 bg-sky-400/60 rounded-sm border border-sky-600 shadow-inner" />
              {/* Grand wooden double doors */}
              <div className="w-5 h-7 bg-amber-950 rounded-t-sm border-t border-x border-amber-700 shadow flex items-center justify-center text-[8px] text-amber-300">
                🚪
              </div>
              <div className="w-3.5 h-4 bg-sky-400/60 rounded-sm border border-sky-600 shadow-inner" />
            </div>
          </div>
          {/* Gated security compound wall */}
          <div className="w-30 h-2 bg-gradient-to-r from-zinc-700 via-zinc-800 to-zinc-700 rounded-b flex items-center justify-center">
            <div className="w-6 h-1.5 bg-amber-400/80 rounded" />
          </div>
        </div>
      );
    }

    switch (location.type) {
      // 1. CHURCH & CATHEDRAL (Actual Church with Soaring Spire, Cross & Stained Glass)
      case 'church':
        return (
          <div className="relative w-32 h-32 flex flex-col items-center justify-end select-none">
            {/* Tall Gothic Steeple Spire with Cross */}
            <div className="flex flex-col items-center -mb-1 z-10">
              <div className="text-yellow-300 font-bold text-sm drop-shadow-[0_0_8px_#facc15] animate-pulse">✝️</div>
              <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[24px] border-b-zinc-800 drop-shadow" />
              <div className="w-6 h-7 bg-zinc-800 border-x border-zinc-750 flex items-center justify-center text-[7px] text-yellow-300">
                🔔
              </div>
            </div>
            {/* Steeply Pitched Cathedral A-Frame Nave Roof */}
            <div className="w-28 h-8 bg-gradient-to-t from-slate-900 via-slate-800 to-indigo-950 rounded-t-xl border-t-2 border-yellow-500/80 shadow-2xl relative flex items-center justify-center" />
            {/* Stone Cathedral Sanctuary Walls & Rose Stained Glass */}
            <div className="w-26 h-14 bg-gradient-to-b from-stone-200 via-stone-300 to-stone-400 border border-stone-500 rounded-b shadow-2xl flex flex-col justify-between items-center p-1 relative">
              {/* Circular Rose Stained Glass Window */}
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-rose-500 via-amber-400 to-sky-500 border-2 border-yellow-400 shadow-md flex items-center justify-center text-[7px] -mt-3 z-10">
                ✨
              </div>
              {/* Arched Gothic Portal Doors */}
              <div className="w-6 h-8 rounded-t-full bg-amber-950 border-t-2 border-x-2 border-yellow-500 flex items-center justify-center text-[9px] shadow-inner mb-0.5">
                🚪
              </div>
            </div>
          </div>
        );

      // 2. NATIONAL MOSQUE (Central Golden Dome, 4 Minarets & Marble Courtyard)
      case 'mosque':
        return (
          <div className="relative w-34 h-30 flex flex-col items-center justify-end select-none">
            {/* Crescent finial above golden dome */}
            <div className="text-amber-300 text-xs -mb-1 z-10">🌙</div>
            {/* Gleaming Golden Central Dome */}
            <div className="w-16 h-12 rounded-t-full bg-gradient-to-t from-amber-600 via-yellow-400 to-amber-300 border-2 border-yellow-200 shadow-[0_0_20px_rgba(251,191,36,0.6)] flex items-center justify-center relative z-10" />
            {/* Marble Structure with 4 Minaret Towers */}
            <div className="w-30 h-14 bg-gradient-to-b from-emerald-950 via-zinc-900 to-emerald-950 border-2 border-emerald-400 rounded-b-xl shadow-2xl flex items-center justify-between px-1 relative">
              {/* Left Minaret Tower */}
              <div className="w-3 h-16 bg-gradient-to-t from-zinc-800 to-stone-300 rounded-t-full border border-emerald-400 flex flex-col items-center justify-between -mt-6">
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="text-[6px]">🕌</div>
              </div>
              {/* Central Arched Porticos */}
              <div className="flex gap-1 items-end justify-center h-full pb-1">
                <div className="w-4 h-7 rounded-t-full bg-emerald-900 border border-emerald-400/80" />
                <div className="w-5 h-9 rounded-t-full bg-emerald-800 border-2 border-yellow-400" />
                <div className="w-4 h-7 rounded-t-full bg-emerald-900 border border-emerald-400/80" />
              </div>
              {/* Right Minaret Tower */}
              <div className="w-3 h-16 bg-gradient-to-t from-zinc-800 to-stone-300 rounded-t-full border border-emerald-400 flex flex-col items-center justify-between -mt-6">
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="text-[6px]">🕌</div>
              </div>
            </div>
          </div>
        );

      // 3. HOSPITAL & MEDICAL CENTRE (Multi-Wing Clinic, Emergency Red Cross & Ambulance Bay)
      case 'hospital':
        return (
          <div className="relative w-32 h-28 flex flex-col items-center justify-end select-none">
            {/* Rooftop Helipad with Red Emergency Cross */}
            <div className="w-18 h-5 bg-slate-800 rounded-t-lg border-t-2 border-x-2 border-rose-500 shadow-md flex items-center justify-center gap-1">
              <span className="text-rose-500 font-black text-xs">➕</span>
              <span className="text-[8px] font-mono font-black text-white">EMERGENCY</span>
            </div>
            {/* Multi-story Clinic Building with Medical Blue Glass */}
            <div className="w-28 h-16 bg-gradient-to-b from-slate-100 to-slate-200 border-2 border-rose-500/80 rounded-b shadow-2xl flex flex-col justify-between p-1.5">
              <div className="grid grid-cols-4 gap-1">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-3 bg-sky-500/40 rounded-xs border border-sky-600/60 shadow-inner" />
                ))}
              </div>
              {/* Ambulance Emergency Portico */}
              <div className="w-full h-5 bg-rose-950 rounded flex items-center justify-between px-2 text-[8px] text-white font-mono">
                <span className="text-rose-300 font-bold">TRAUMA 24/7</span>
                <span className="text-xs">🚑</span>
              </div>
            </div>
          </div>
        );

      // 4. BANK & FINANCIAL TOWER (Neoclassical Columns, Gold Vault & Ticker)
      case 'bank':
        return (
          <div className="relative w-32 h-28 flex flex-col items-center justify-end select-none">
            {/* Classical Triangular Pediment Roof with Gold Naira Crest */}
            <div className="w-28 h-7 bg-gradient-to-t from-emerald-900 to-emerald-700 rounded-t-lg border-t-2 border-emerald-400 shadow flex items-center justify-center">
              <span className="text-[9px] font-mono font-black text-amber-300 tracking-wider">₦ CENTRAL BANK</span>
            </div>
            {/* Monumental Marble Pillars & Vault */}
            <div className="w-26 h-16 bg-gradient-to-b from-stone-900 to-black border-2 border-emerald-400 rounded-b shadow-2xl flex flex-col justify-between p-1">
              <div className="flex justify-around items-center pt-1">
                <div className="w-2.5 h-9 bg-zinc-300 rounded-xs border border-zinc-500 shadow" />
                {/* Golden Vault Doors */}
                <div className="w-7 h-9 rounded bg-gradient-to-br from-amber-400 to-yellow-600 border border-amber-300 shadow-inner flex flex-col items-center justify-center text-[7px] font-mono text-black font-black">
                  <span>VAULT</span>
                  <span>🔒</span>
                </div>
                <div className="w-2.5 h-9 bg-zinc-300 rounded-xs border border-zinc-500 shadow" />
              </div>
              {/* Ticker marquee */}
              <div className="w-full h-3 bg-emerald-950 rounded flex items-center justify-center text-[7px] font-mono text-emerald-300 font-bold">
                COMMERCIAL BANKING
              </div>
            </div>
          </div>
        );

      // 5. OPEN-AIR MARKET (Market Stalls with Striped Awning & Produce Crates)
      case 'market':
        return (
          <div className="relative w-32 h-26 flex flex-col items-center justify-end select-none">
            {/* Striped Canvas Market Stalls Awnings */}
            <div className="w-30 h-7 rounded-t-xl bg-[repeating-linear-gradient(45deg,#dc2626,#dc2626_8px,#fef08a_8px,#fef08a_16px,#16a34a_16px,#16a34a_24px)] border-t-2 border-amber-400 shadow-lg flex items-center justify-center">
              <span className="px-1.5 py-0.2 bg-black/80 text-[8px] font-mono font-black text-amber-300 rounded uppercase">
                BAZAAR COMMODITIES
              </span>
            </div>
            {/* Wooden Market Crates & Hustle Stalls */}
            <div className="w-28 h-14 bg-gradient-to-b from-amber-950 via-zinc-900 to-black border-2 border-amber-500 rounded-b shadow-2xl flex flex-col justify-between p-1.5">
              <div className="flex items-center justify-around text-sm">
                <span title="Tomatoes">🍅</span>
                <span title="Yams">🥔</span>
                <span title="Plantain">🍌</span>
                <span title="Peppers">🌶️</span>
              </div>
              <div className="w-full h-3.5 bg-amber-900/90 rounded border border-amber-600 flex items-center justify-center text-[7px] font-mono text-amber-200 font-black">
                TRADERS & WHOLESALE
              </div>
            </div>
          </div>
        );

      // 6. 5-STAR HOTEL & SUITES (Twin Glass Towers with Rooftop Swimming Pool)
      case 'hotel':
        return (
          <div className="relative w-32 h-32 flex flex-col items-center justify-end select-none">
            {/* Rooftop Infinity Swimming Pool Terrace & Palm Tree */}
            <div className="w-24 h-6 bg-gradient-to-r from-sky-500 to-blue-700 rounded-t-lg border-t-2 border-sky-300 shadow flex items-center justify-between px-2 text-[8px]">
              <span className="text-white font-mono font-black">POOL</span>
              <span className="text-xs">🏊</span>
              <span className="text-xs">🌴</span>
            </div>
            {/* Luxury Glass Tower with Balconies */}
            <div className="w-28 h-18 bg-gradient-to-b from-sky-950 via-slate-900 to-black border-2 border-sky-400 rounded-b shadow-2xl flex flex-col justify-between p-1.5">
              <div className="grid grid-cols-4 gap-1">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="h-2.5 bg-sky-300/35 rounded-xs border border-sky-400/40" />
                ))}
              </div>
              <div className="w-full h-3.5 bg-blue-950 rounded flex items-center justify-between px-2 text-[7px] font-mono text-sky-200">
                <span>DIPLOMATIC SUITES</span>
                <span>🍸</span>
              </div>
            </div>
          </div>
        );

      // 7. SPORTS STADIUM (Curved Arena with Floodlights & Football Pitch)
      case 'stadium':
      case 'golf':
        return (
          <div className="relative w-34 h-28 flex flex-col items-center justify-end select-none">
            {/* 4 Stadium Floodlight Masts */}
            <div className="flex justify-between w-full px-2 -mb-1 z-10">
              <div className="w-2.5 h-3 rounded-full bg-white shadow-[0_0_10px_#fff]" />
              <div className="w-2.5 h-3 rounded-full bg-white shadow-[0_0_10px_#fff]" />
            </div>
            {/* Curved Arena Bowl with Green Football Pitch */}
            <div className="w-32 h-20 rounded-3xl bg-gradient-to-b from-zinc-800 to-zinc-950 border-2 border-lime-400 shadow-2xl flex flex-col justify-between p-1.5 overflow-hidden">
              <div className="w-full h-10 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-700 border-2 border-white/60 flex items-center justify-center relative shadow-inner">
                <div className="w-5 h-5 rounded-full border border-white/70 flex items-center justify-center">
                  <div className="w-1 h-1 rounded-full bg-white" />
                </div>
              </div>
              <div className="w-full h-3 bg-black rounded flex items-center justify-center text-[7px] font-mono text-lime-400 font-bold uppercase">
                OLYMPIC PREMIER ARENA
              </div>
            </div>
          </div>
        );

      // 8. UNIVERSITY & ACADEMY (Senate Building with Clock Tower & Library)
      case 'university':
      case 'school':
        return (
          <div className="relative w-32 h-30 flex flex-col items-center justify-end select-none">
            {/* Central Clock Tower with Bell */}
            <div className="w-8 h-8 rounded-t bg-gradient-to-t from-indigo-900 to-indigo-700 border-t-2 border-x-2 border-indigo-300 shadow flex flex-col items-center justify-center text-[8px] -mb-1 z-10">
              <span className="text-yellow-300 font-black">⏰</span>
            </div>
            {/* Senate Hall Facade */}
            <div className="w-28 h-16 bg-gradient-to-b from-indigo-950 via-slate-900 to-black border-2 border-indigo-400 rounded-b shadow-2xl flex flex-col justify-between p-1.5">
              <div className="flex justify-around items-center pt-0.5">
                <div className="w-7 h-7 bg-zinc-800 rounded border border-indigo-400/60 flex items-center justify-center text-xs">📚</div>
                <div className="w-7 h-7 bg-zinc-800 rounded border border-indigo-400/60 flex items-center justify-center text-xs">🔬</div>
              </div>
              <div className="w-full h-3.5 bg-indigo-950 rounded flex items-center justify-center text-[7px] font-mono text-indigo-300 font-bold uppercase">
                CAMPUS SENATE
              </div>
            </div>
          </div>
        );

      // 9. GOVERNMENT & LEGISLATURE (Capitol Dome, Columns & Nigerian Crest)
      case 'gov':
      case 'court':
        return (
          <div className="relative w-32 h-30 flex flex-col items-center justify-end select-none">
            {/* Capitol Dome with Nigerian Flag */}
            <div className="flex flex-col items-center -mb-1 z-10">
              <span className="text-xs">🇳🇬</span>
              <div className="w-12 h-7 rounded-t-full bg-gradient-to-t from-teal-800 to-teal-500 border border-teal-300 shadow" />
            </div>
            {/* Classical Pediment & Pillars */}
            <div className="w-28 h-16 bg-gradient-to-b from-teal-950 via-zinc-900 to-black border-2 border-teal-400 rounded-b shadow-2xl flex flex-col justify-between p-1.5">
              <div className="flex justify-around items-center pt-1">
                <div className="w-2.5 h-8 bg-zinc-300 rounded-xs border border-zinc-500 shadow" />
                <div className="w-7 h-8 bg-teal-900/60 rounded border border-teal-400/80 flex items-center justify-center text-xs">
                  ⚖️
                </div>
                <div className="w-2.5 h-8 bg-zinc-300 rounded-xs border border-zinc-500 shadow" />
              </div>
              <div className="w-full h-3.5 bg-teal-950 rounded flex items-center justify-center text-[7px] font-mono text-teal-300 font-bold uppercase">
                STATE SECRETARIAT
              </div>
            </div>
          </div>
        );

      // 10. AIRPORT RUNWAY & TERMINAL (Active Runway, Control Tower & Parked Airliner)
      case 'airport':
        return (
          <div className="relative w-36 h-28 flex flex-col items-center justify-end select-none">
            {/* Airport Terminal & Control Radar */}
            <div className="w-28 h-6 bg-gradient-to-r from-sky-800 to-blue-900 rounded-t-lg border-t-2 border-sky-400 shadow flex items-center justify-between px-2 text-[8px] text-white font-mono">
              <span>TERMINAL</span>
              <span className="text-xs">📡</span>
              <span>GATE 1</span>
            </div>
            {/* Runway Asphalt Surface with Jet Airliner */}
            <div className="w-34 h-16 bg-zinc-950 border-2 border-sky-400 rounded-b shadow-2xl flex items-center justify-between px-2 relative overflow-hidden">
              {/* White Dashed Runway Centerline */}
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-b-2 border-dashed border-white/60 h-0" />
              <span className="text-lg font-black font-mono text-white/90 z-10 drop-shadow">27</span>
              {/* Parked Passenger Jet */}
              <div className="flex items-center gap-1 z-10 bg-black/75 px-1.5 py-0.5 rounded border border-sky-400/60">
                <span className="text-base drop-shadow animate-pulse">✈️</span>
                <span className="text-[7px] font-mono font-bold text-sky-300">AIR PEACE</span>
              </div>
            </div>
          </div>
        );

      // 11. MEGAMALL & SUPERMARKET (Glass Atrium & Retail Levels)
      case 'mall':
      case 'supermarket':
        return (
          <div className="relative w-32 h-28 flex flex-col items-center justify-end select-none">
            <div className="w-28 h-6 bg-purple-900 rounded-t-lg border-t-2 border-purple-400 shadow flex items-center justify-between px-2 text-[8px] text-purple-200 font-mono">
              <span>RETAIL GALLERIA</span>
              <span className="text-xs">🛍️</span>
            </div>
            <div className="w-28 h-16 bg-gradient-to-b from-purple-950 via-zinc-900 to-black border-2 border-purple-500 rounded-b shadow-2xl flex flex-col justify-between p-1.5">
              <div className="flex justify-around items-center pt-0.5 text-base">
                <span>🏬</span>
                <span>🛒</span>
                <span>🎬</span>
              </div>
              <div className="w-full h-3.5 bg-purple-950 rounded flex items-center justify-center text-[7px] font-mono text-purple-300 font-bold uppercase">
                MEGA CITY MALL
              </div>
            </div>
          </div>
        );

      // 12. AUTO MART & DEALERSHIP (Glass Showroom & Sports Car on Display)
      case 'dealership':
      case 'mechanic':
        return (
          <div className="relative w-32 h-26 flex flex-col items-center justify-end select-none">
            <div className="w-28 h-5 bg-red-900 rounded-t-lg border-t-2 border-red-500 shadow flex items-center justify-between px-2 text-[8px] text-red-200 font-mono">
              <span>AUTO SHOWROOM</span>
              <span className="text-xs">🏎️</span>
            </div>
            <div className="w-28 h-15 bg-gradient-to-b from-stone-900 to-black border-2 border-red-500 rounded-b shadow-2xl flex flex-col justify-between p-1.5">
              <div className="flex items-center justify-center gap-2 pt-0.5">
                <div className="w-10 h-7 rounded bg-zinc-800 border border-red-400 flex items-center justify-center text-sm shadow">
                  🏎️
                </div>
                <div className="w-10 h-7 rounded bg-zinc-800 border border-zinc-600 flex items-center justify-center text-sm shadow">
                  🚙
                </div>
              </div>
              <div className="w-full h-3 bg-red-950 rounded flex items-center justify-center text-[7px] font-mono text-red-300 font-bold uppercase">
                CLEAN TITLE MOTORS
              </div>
            </div>
          </div>
        );

      // 13. RESTAURANT & EATERY (Outdoor Bukka Terrace & Barbecue Grill)
      case 'restaurant':
      case 'eatery':
        return (
          <div className="relative w-30 h-26 flex flex-col items-center justify-end select-none">
            <div className="w-26 h-5 bg-orange-900 rounded-t-lg border-t-2 border-orange-400 shadow flex items-center justify-between px-2 text-[8px] text-orange-200 font-mono">
              <span>BUKKA & GRILL</span>
              <span className="text-xs">🍲</span>
            </div>
            <div className="w-26 h-15 bg-gradient-to-b from-amber-950 via-zinc-900 to-black border-2 border-orange-500 rounded-b shadow-2xl flex flex-col justify-between p-1.5">
              <div className="flex justify-around items-center pt-0.5 text-base">
                <span>🍗</span>
                <span>🍚</span>
                <span>🥩</span>
              </div>
              <div className="w-full h-3 bg-orange-950 rounded flex items-center justify-center text-[7px] font-mono text-orange-300 font-bold uppercase">
                HOT PEPPER SOUP
              </div>
            </div>
          </div>
        );

      // 14. POLICE COMMAND & SECURITY (Fortified Perimeter with Flashing Beacons)
      case 'police':
        return (
          <div className="relative w-30 h-26 flex flex-col items-center justify-end select-none">
            <div className="w-26 h-5 bg-blue-900 rounded-t-lg border-t-2 border-blue-400 shadow flex items-center justify-between px-2 text-[8px] text-blue-200 font-mono">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                <span>AREA COMMAND</span>
              </span>
              <span className="text-xs">🚨</span>
            </div>
            <div className="w-26 h-15 bg-gradient-to-b from-slate-900 to-black border-2 border-blue-500 rounded-b shadow-2xl flex flex-col justify-between p-1.5">
              <div className="flex justify-around items-center pt-0.5 text-base">
                <span>🚓</span>
                <span>👮</span>
              </div>
              <div className="w-full h-3 bg-blue-950 rounded flex items-center justify-center text-[7px] font-mono text-blue-300 font-bold uppercase">
                TACTICAL UNIT 24/7
              </div>
            </div>
          </div>
        );

      // 15. NIGHTLIFE CLUB & LOUNGE (VIP Lasers & Afrobeats Stage)
      case 'club':
        return (
          <div className="relative w-30 h-26 flex flex-col items-center justify-end select-none">
            <div className="w-26 h-5 bg-fuchsia-900 rounded-t-lg border-t-2 border-fuchsia-400 shadow flex items-center justify-between px-2 text-[8px] text-fuchsia-200 font-mono">
              <span>VIP NIGHTCLUB</span>
              <span className="text-xs">🍸</span>
            </div>
            <div className="w-26 h-15 bg-gradient-to-b from-purple-950 via-zinc-950 to-black border-2 border-fuchsia-500 rounded-b shadow-2xl flex flex-col justify-between p-1.5">
              <div className="flex justify-around items-center pt-0.5 text-base">
                <span>🍾</span>
                <span>🎧</span>
              </div>
              <div className="w-full h-3 bg-fuchsia-950 rounded flex items-center justify-center text-[7px] font-mono text-fuchsia-300 font-bold uppercase">
                AFROBEATS LIVE
              </div>
            </div>
          </div>
        );

      // DEFAULT: MODERN COMMERCIAL METROPOLIS TOWER
      default:
        return (
          <div className="relative w-30 h-26 flex flex-col items-center justify-end select-none">
            <div className="w-26 h-5 bg-zinc-800 rounded-t-lg border-t-2 border-zinc-400 shadow flex items-center justify-between px-2 text-[8px] text-zinc-200 font-mono">
              <span>COMMERCIAL</span>
              <span className="text-xs">{logo}</span>
            </div>
            <div className="w-26 h-15 bg-gradient-to-b from-zinc-900 to-black border-2 border-zinc-500 rounded-b shadow-2xl flex flex-col justify-between p-1.5">
              <div className="grid grid-cols-3 gap-1 pt-0.5">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-3 bg-sky-400/25 rounded-xs border border-sky-400/30" />
                ))}
              </div>
              <div className="w-full h-3 bg-zinc-950 rounded flex items-center justify-center text-[7px] font-mono text-zinc-300 font-bold uppercase">
                METROPOLIS CORE
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transform: 'translate(-50%, -100%) rotateZ(12deg) rotateX(-38deg)',
        transformOrigin: 'bottom center',
        transformStyle: 'preserve-3d',
        backfaceVisibility: 'visible',
        ...style,
      }}
      className={`interactive-pin absolute cursor-pointer pointer-events-auto transition-transform duration-200 hover:scale-110 ${isHighlighted ? 'z-40' : isHovered ? 'z-50' : 'z-20'} flex flex-col items-center select-none group ${className}`}
    >
      {/* Target Highlight Marker if selected/searched */}
      {isHighlighted && (
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none z-50 animate-bounce">
          <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-zinc-950 font-black text-[10px] uppercase tracking-wider shadow-xl shadow-amber-400/60 ring-2 ring-white whitespace-nowrap">
            📍 TARGET
          </span>
          <div className="w-2.5 h-2.5 rotate-45 bg-amber-400 -mt-1 shadow" />
        </div>
      )}
      {/* =========================================================================
          THE PROMINENT FLOATING LOGO OVER THE BUILDING (AS REQUESTED)
          When hovered over: reveals full name of the place
          When clicked: opens transport commute modal to travel to it
          ========================================================================= */}
      <div className="relative mb-1 flex flex-col items-center z-30 pointer-events-auto">
        {/* Full Name Badge (Hovered or Names Toggle active) */}
        {(showName || isHovered) && (
          <div className={`absolute -top-11 left-1/2 -translate-x-1/2 z-50 px-3 py-1 rounded-full ${
            showName && !isHovered
              ? 'bg-zinc-950/90 border border-amber-400/80 text-amber-200'
              : 'bg-zinc-950/98 border-2 border-amber-400 text-white ring-2 ring-amber-400/60'
          } text-xs font-black whitespace-nowrap shadow-2xl flex items-center gap-1.5 pointer-events-none animate-in fade-in duration-150 drop-shadow-2xl`}>
            <span className="text-sm">{logo}</span>
            <span className="font-bold tracking-wide">
              {isHome ? `${homeOwnerName || 'Citizen'}'s Residence` : location.name}
            </span>
            {isHovered && (
              <span className="px-1.5 py-0.5 rounded bg-amber-400 text-black text-[9px] font-mono font-black uppercase tracking-wider">
                Travel
              </span>
            )}
          </div>
        )}

        {/* Small Logo Badge on the Building */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          className={`w-8 h-8 rounded-full ${accent.bg} border-2 ${accent.border} ${accent.glow} shadow-xl flex items-center justify-center transition-all duration-200 backdrop-blur-md group-hover:scale-125 group-hover:ring-2 ${accent.ring} cursor-pointer`}
          title={`Click to travel to ${location.name}`}
        >
          <span className="text-sm leading-none drop-shadow">{logo}</span>
        </div>

        {/* Needle pin connection from logo down to building roof */}
        <div className="w-0.5 h-2 bg-gradient-to-b from-white to-transparent" />
      </div>

      {/* =========================================================================
          THE AUTHENTIC 3D ISOMETRIC ARCHITECTURAL BUILDING STRUCTURE
          ========================================================================= */}
      <div
        className={`transition-transform duration-200 ${
          reducedShadows
            ? 'will-change-transform'
            : 'drop-shadow-[0_12px_20px_rgba(0,0,0,0.9)]'
        }`}
      >
        {renderBuildingArchitecture()}
      </div>

      {/* Base Ground Shadow on Asphalt */}
      <div
        className={`w-28 h-4 bg-black/70 rounded-full ${
          reducedShadows ? 'opacity-40' : 'blur-[2px]'
        } -mt-1 pointer-events-none`}
      />
    </div>
  );
};
