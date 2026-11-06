/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  MapPin,
  Compass,
  Bus,
  Plane,
  Star,
  Search,
  Utensils,
  Briefcase,
  Info,
  Clock,
  ArrowRight,
  ShieldAlert,
  Zap,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { NigeriaStateData, GeopoliticalZone } from '../App';
import { calculateInterstateTrip } from '../utils/travelPricing';

export interface StateMapNode {
  stateId: string;
  x: number;
  y: number;
  code: string;
}

export const NIGERIA_STATE_COORDINATES: Record<string, { x: number; y: number; code: string }> = {
  // North West
  sokoto: { x: 190, y: 95, code: 'SOK' },
  kebbi: { x: 110, y: 165, code: 'KEB' },
  zamfara: { x: 275, y: 145, code: 'ZAM' },
  katsina: { x: 375, y: 100, code: 'KAT' },
  kano: { x: 460, y: 135, code: 'KAN' },
  jigawa: { x: 540, y: 115, code: 'JIG' },
  kaduna: { x: 370, y: 235, code: 'KAD' },

  // North East
  yobe: { x: 650, y: 125, code: 'YOB' },
  borno: { x: 775, y: 140, code: 'BOR' },
  bauchi: { x: 550, y: 230, code: 'BAU' },
  gombe: { x: 670, y: 230, code: 'GOM' },
  adamawa: { x: 770, y: 300, code: 'ADA' },
  taraba: { x: 670, y: 375, code: 'TAR' },

  // North Central
  niger: { x: 230, y: 260, code: 'NIG' },
  kwara: { x: 160, y: 340, code: 'KWA' },
  fct: { x: 395, y: 320, code: 'ABJ' },
  kogi: { x: 345, y: 395, code: 'KOG' },
  plateau: { x: 510, y: 305, code: 'PLA' },
  nasarawa: { x: 460, y: 360, code: 'NAS' },
  benue: { x: 545, y: 420, code: 'BEN' },

  // South West
  oyo: { x: 120, y: 405, code: 'OYO' },
  osun: { x: 185, y: 435, code: 'OSU' },
  ekiti: { x: 245, y: 425, code: 'EKI' },
  ondo: { x: 260, y: 480, code: 'OND' },
  ogun: { x: 120, y: 475, code: 'OGU' },
  lagos: { x: 125, y: 530, code: 'LAG' },

  // South East
  enugu: { x: 450, y: 485, code: 'ENU' },
  ebonyi: { x: 515, y: 485, code: 'EBO' },
  anambra: { x: 400, y: 505, code: 'ANA' },
  imo: { x: 405, y: 555, code: 'IMO' },
  abia: { x: 455, y: 545, code: 'ABI' },

  // South South
  edo: { x: 325, y: 470, code: 'EDO' },
  delta: { x: 335, y: 535, code: 'DEL' },
  bayelsa: { x: 355, y: 595, code: 'BAY' },
  rivers: { x: 420, y: 595, code: 'RIV' },
  akwa_ibom: { x: 490, y: 585, code: 'AKW' },
  cross_river: { x: 555, y: 535, code: 'CRO' },
};

export const MAJOR_INTERSTATE_HIGHWAYS: [string, string][] = [
  ['lagos', 'ogun'],
  ['ogun', 'oyo'],
  ['oyo', 'osun'],
  ['osun', 'ekiti'],
  ['ekiti', 'ondo'],
  ['ondo', 'edo'],
  ['edo', 'delta'],
  ['delta', 'anambra'],
  ['anambra', 'enugu'],
  ['enugu', 'ebonyi'],
  ['enugu', 'abia'],
  ['abia', 'imo'],
  ['imo', 'rivers'],
  ['rivers', 'bayelsa'],
  ['rivers', 'akwa_ibom'],
  ['akwa_ibom', 'cross_river'],
  ['oyo', 'kwara'],
  ['kwara', 'niger'],
  ['niger', 'fct'],
  ['kogi', 'fct'],
  ['edo', 'kogi'],
  ['kogi', 'benue'],
  ['fct', 'nasarawa'],
  ['nasarawa', 'plateau'],
  ['plateau', 'bauchi'],
  ['fct', 'kaduna'],
  ['kaduna', 'kano'],
  ['kano', 'jigawa'],
  ['kano', 'katsina'],
  ['kaduna', 'zamfara'],
  ['zamfara', 'sokoto'],
  ['sokoto', 'kebbi'],
  ['bauchi', 'gombe'],
  ['gombe', 'adamawa'],
  ['bauchi', 'yobe'],
  ['yobe', 'borno'],
  ['benue', 'taraba'],
  ['taraba', 'adamawa'],
  ['nasarawa', 'benue'],
  ['enugu', 'benue'],
];

export const ZONE_COLOR_THEMES: Record<
  GeopoliticalZone,
  {
    bg: string;
    border: string;
    text: string;
    nodeColor: string;
    glow: string;
    badgeBg: string;
  }
> = {
  'North West': {
    bg: 'bg-amber-950/20',
    border: 'border-amber-500/40',
    text: 'text-amber-400',
    nodeColor: '#f59e0b',
    glow: 'rgba(245, 158, 11, 0.4)',
    badgeBg: 'bg-amber-950/80',
  },
  'North East': {
    bg: 'bg-orange-950/20',
    border: 'border-orange-500/40',
    text: 'text-orange-400',
    nodeColor: '#ea580c',
    glow: 'rgba(234, 88, 12, 0.4)',
    badgeBg: 'bg-orange-950/80',
  },
  'North Central': {
    bg: 'bg-yellow-950/20',
    border: 'border-yellow-500/40',
    text: 'text-yellow-400',
    nodeColor: '#eab308',
    glow: 'rgba(234, 179, 8, 0.4)',
    badgeBg: 'bg-yellow-950/80',
  },
  'South West': {
    bg: 'bg-emerald-950/20',
    border: 'border-emerald-500/40',
    text: 'text-emerald-400',
    nodeColor: '#10b981',
    glow: 'rgba(16, 185, 129, 0.4)',
    badgeBg: 'bg-emerald-950/80',
  },
  'South East': {
    bg: 'bg-cyan-950/20',
    border: 'border-cyan-500/40',
    text: 'text-cyan-400',
    nodeColor: '#06b6d4',
    glow: 'rgba(6, 182, 212, 0.4)',
    badgeBg: 'bg-cyan-950/80',
  },
  'South South': {
    bg: 'bg-indigo-950/20',
    border: 'border-indigo-500/40',
    text: 'text-indigo-400',
    nodeColor: '#818cf8',
    glow: 'rgba(129, 140, 248, 0.4)',
    badgeBg: 'bg-indigo-950/80',
  },
};

interface NigeriaMapVisualizerProps {
  states: NigeriaStateData[];
  currentState: NigeriaStateData;
  birthState: NigeriaStateData;
  locationMode: 'NIGERIA' | 'INTERNATIONAL';
  playerNaira: number;
  energy: number;
  hunger: number;
  hasNINorPassport: boolean;
  onTravelByBus: (targetState: NigeriaStateData, fare: number) => void;
  onTravelByFlight: (targetState: NigeriaStateData, fare: number) => void;
}

export const NigeriaMapVisualizer: React.FC<NigeriaMapVisualizerProps> = ({
  states,
  currentState,
  birthState,
  locationMode,
  playerNaira,
  energy,
  hunger,
  hasNINorPassport,
  onTravelByBus,
  onTravelByFlight,
}) => {
  const [selectedStateId, setSelectedStateId] = useState<string>(currentState.id);
  const [activeZoneFilter, setActiveZoneFilter] = useState<GeopoliticalZone | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredStateId, setHoveredStateId] = useState<string | null>(null);

  const selectedState = useMemo(() => {
    return states.find((s) => s.id === selectedStateId) || currentState;
  }, [states, selectedStateId, currentState]);

  const filteredStates = useMemo(() => {
    return states.filter((st) => {
      const matchZone = activeZoneFilter === 'ALL' || st.zone === activeZoneFilter;
      const matchSearch =
        st.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        st.capital.toLowerCase().includes(searchQuery.toLowerCase()) ||
        st.zone.toLowerCase().includes(searchQuery.toLowerCase());
      return matchZone && matchSearch;
    });
  }, [states, activeZoneFilter, searchQuery]);

  // Travel cost calculations (Authentic road distances & commercial bus tariffs)
  const interstateTrip = useMemo(() => {
    return calculateInterstateTrip(currentState.id, selectedState.id, currentState.name, selectedState.name);
  }, [currentState.id, selectedState.id, currentState.name, selectedState.name]);

  const busFare = interstateTrip.fareNGN;

  const flightFare = useMemo(() => {
    return Math.round(92000 * selectedState.costMultiplier);
  }, [selectedState]);

  const canAffordBus = playerNaira >= busFare && energy >= 20;
  const canAffordFlight = playerNaira >= flightFare && energy >= 5;
  const isAtSelectedState = locationMode === 'NIGERIA' && currentState.id === selectedState.id;

  return (
    <div className="space-y-6">
      {/* Top Controls: Filter by Zone & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs">
          <button
            onClick={() => setActiveZoneFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors whitespace-nowrap ${
              activeZoneFilter === 'ALL'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            All 37 States
          </button>
          {(
            [
              'North West',
              'North East',
              'North Central',
              'South West',
              'South East',
              'South South',
            ] as GeopoliticalZone[]
          ).map((zone) => {
            const theme = ZONE_COLOR_THEMES[zone];
            const isSelected = activeZoneFilter === zone;
            return (
              <button
                key={zone}
                onClick={() => setActiveZoneFilter(zone)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap border ${
                  isSelected
                    ? `${theme.badgeBg} ${theme.text} ${theme.border} ring-1 ring-emerald-500/30`
                    : 'bg-zinc-800/80 border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {zone}
              </button>
            );
          })}
        </div>

        <div className="relative min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search state or capital..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Main Grid: Interactive 2D Map on Left, Detailed State Terminal on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* MAP CANVAS PANEL */}
        <div className="lg:col-span-8 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-6 flex flex-col justify-between shadow-xl relative overflow-hidden">
          {/* Map Header Legend */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-800 text-xs">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-white tracking-wide">
                Federation of Nigeria — 2D Interactive Travel Grid
              </span>
            </div>

            <div className="flex items-center gap-4 text-[11px] text-zinc-400">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-emerald-300 animate-pulse" />
                <span className="text-emerald-400 font-semibold">Current State</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-400 flex items-center justify-center text-[9px] font-bold text-zinc-950">
                  ★
                </span>
                <span className="text-amber-400 font-semibold">Birthplace</span>
              </div>
            </div>
          </div>

          {/* SVG MAP VISUALIZER */}
          <div className="relative w-full aspect-[4/3] max-h-[580px] my-2 bg-gradient-to-b from-zinc-950 via-zinc-950 to-emerald-950/10 rounded-xl border border-zinc-800/80 p-2 overflow-hidden select-none">
            {/* Ambient Background Grid */}
            <svg
              viewBox="0 0 900 660"
              className="w-full h-full"
              style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.6))' }}
            >
              <defs>
                {/* Radial Glow Filters */}
                <radialGradient id="currentGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="birthGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Background Country Perimeter Schematic */}
              <path
                d="M 100,170 L 190,95 L 375,90 L 540,110 L 780,130 L 790,300 L 680,380 L 560,540 L 490,590 L 410,610 L 350,600 L 125,540 L 105,470 L 95,330 Z"
                fill="rgba(16, 185, 129, 0.03)"
                stroke="rgba(16, 185, 129, 0.15)"
                strokeWidth="2"
                strokeDasharray="4 4"
              />

              {/* Major Highway Corridors */}
              <g stroke="rgba(255, 255, 255, 0.09)" strokeWidth="1.5">
                {MAJOR_INTERSTATE_HIGHWAYS.map(([fromId, toId], idx) => {
                  const fromCoord = NIGERIA_STATE_COORDINATES[fromId];
                  const toCoord = NIGERIA_STATE_COORDINATES[toId];
                  if (!fromCoord || !toCoord) return null;

                  const isConnectingCurrent =
                    (fromId === currentState.id && toId === selectedStateId) ||
                    (toId === currentState.id && fromId === selectedStateId);

                  return (
                    <line
                      key={`hway-${idx}`}
                      x1={fromCoord.x}
                      y1={fromCoord.y}
                      x2={toCoord.x}
                      y2={toCoord.y}
                      stroke={
                        isConnectingCurrent
                          ? '#10b981'
                          : 'rgba(255, 255, 255, 0.08)'
                      }
                      strokeWidth={isConnectingCurrent ? 2.5 : 1.2}
                      strokeDasharray={isConnectingCurrent ? '5 3' : undefined}
                      className={isConnectingCurrent ? 'animate-pulse' : undefined}
                    />
                  );
                })}
              </g>

              {/* Render State Nodes */}
              {states.map((st) => {
                const coord = NIGERIA_STATE_COORDINATES[st.id];
                if (!coord) return null;

                const isCurrent = locationMode === 'NIGERIA' && currentState.id === st.id;
                const isBirth = birthState.id === st.id;
                const isSelected = selectedStateId === st.id;
                const isHovered = hoveredStateId === st.id;
                const zoneTheme = ZONE_COLOR_THEMES[st.zone];
                const matchesFilter =
                  activeZoneFilter === 'ALL' || st.zone === activeZoneFilter;

                const opacity = matchesFilter ? 1 : 0.25;

                return (
                  <g
                    key={st.id}
                    onClick={() => setSelectedStateId(st.id)}
                    onMouseEnter={() => setHoveredStateId(st.id)}
                    onMouseLeave={() => setHoveredStateId(null)}
                    className="cursor-pointer transition-all duration-200"
                    style={{ opacity }}
                  >
                    {/* Glowing outer pulse for CURRENT location */}
                    {isCurrent && (
                      <>
                        <circle
                          cx={coord.x}
                          cy={coord.y}
                          r="28"
                          fill="url(#currentGlow)"
                          className="animate-ping"
                          style={{ animationDuration: '2.5s' }}
                        />
                        <circle
                          cx={coord.x}
                          cy={coord.y}
                          r="22"
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="2"
                          strokeDasharray="3 3"
                        />
                      </>
                    )}

                    {/* Outer ring for SELECTED state */}
                    {isSelected && !isCurrent && (
                      <circle
                        cx={coord.x}
                        cy={coord.y}
                        r="20"
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="2.5"
                      />
                    )}

                    {/* State circle node */}
                    <circle
                      cx={coord.x}
                      cy={coord.y}
                      r={isSelected || isHovered ? 16 : 13}
                      fill={
                        isCurrent
                          ? '#10b981'
                          : isSelected
                          ? '#f59e0b'
                          : isBirth
                          ? '#d97706'
                          : '#18181b'
                      }
                      stroke={
                        isCurrent
                          ? '#34d399'
                          : isSelected
                          ? '#fbbf24'
                          : zoneTheme.nodeColor
                      }
                      strokeWidth={isSelected || isHovered ? 3 : 2}
                      className="transition-transform duration-150"
                    />

                    {/* Birthplace star marker */}
                    {isBirth && (
                      <text
                        x={coord.x}
                        y={coord.y + 4}
                        textAnchor="middle"
                        fill={isCurrent ? '#ffffff' : '#09090b'}
                        fontSize="11"
                        fontWeight="bold"
                        className="pointer-events-none select-none"
                      >
                        ★
                      </text>
                    )}

                    {/* Current state center dot */}
                    {isCurrent && !isBirth && (
                      <circle
                        cx={coord.x}
                        cy={coord.y}
                        r="4"
                        fill="#ffffff"
                        className="pointer-events-none"
                      />
                    )}

                    {/* Normal state code if not current or birth */}
                    {!isCurrent && !isBirth && (
                      <text
                        x={coord.x}
                        y={coord.y + 3.5}
                        textAnchor="middle"
                        fill={isSelected ? '#09090b' : '#a1a1aa'}
                        fontSize="9"
                        fontWeight="bold"
                        className="pointer-events-none select-none font-mono"
                      >
                        {coord.code}
                      </text>
                    )}

                    {/* State Name Label underneath */}
                    <text
                      x={coord.x}
                      y={coord.y + 24}
                      textAnchor="middle"
                      fill={
                        isSelected
                          ? '#fbbf24'
                          : isCurrent
                          ? '#34d399'
                          : '#e4e4e7'
                      }
                      fontSize="10"
                      fontWeight={isSelected || isCurrent ? 'bold' : 'normal'}
                      className="pointer-events-none select-none"
                      style={{
                        textShadow: '0 1px 4px rgba(0,0,0,0.9)',
                      }}
                    >
                      {st.name}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Hover Tooltip Overlay */}
            {hoveredStateId && (
              <div className="absolute top-3 left-3 bg-zinc-900/95 border border-zinc-700/80 backdrop-blur-md px-3 py-2 rounded-lg text-xs pointer-events-none shadow-xl z-20">
                {(() => {
                  const hovered = states.find((s) => s.id === hoveredStateId);
                  if (!hovered) return null;
                  return (
                    <div>
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span>{hovered.name} State</span>
                        <span className="text-[10px] text-zinc-400 font-mono font-normal">
                          ({hovered.capital})
                        </span>
                      </div>
                      <div className="text-[11px] text-emerald-400 mt-0.5">
                        {hovered.zone} · Cost Index: {hovered.costMultiplier}x
                      </div>
                      <div className="text-[10px] text-zinc-400 italic">
                        "{hovered.slogan}"
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

          {/* Quick Zone Distribution Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-3 border-t border-zinc-800 text-[11px] text-zinc-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>North West (7)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
              <span>North East (6)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
              <span>North Central (7)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>South West (6)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
              <span>South East (5)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
              <span>South South (6)</span>
            </div>
          </div>
        </div>

        {/* STATE DETAIL & INTERSTATE TRAVEL BOOKING TERMINAL */}
        <div className="lg:col-span-4 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between shadow-xl space-y-6">
          <div className="space-y-5">
            {/* Header Badge */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-2.5 py-1 rounded">
                {selectedState.zone} Geopolitical Zone
              </span>

              <div className="flex items-center gap-1.5">
                {birthState.id === selectedState.id && (
                  <span className="text-[10px] font-bold bg-amber-950 text-amber-400 border border-amber-500/40 px-2 py-0.5 rounded flex items-center gap-1">
                    <Star className="w-2.5 h-2.5 fill-amber-400" />
                    Birthplace
                  </span>
                )}
                {isAtSelectedState && (
                  <span className="text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded flex items-center gap-1">
                    <MapPin className="w-2.5 h-2.5" />
                    Current
                  </span>
                )}
              </div>
            </div>

            {/* State Title & Slogan */}
            <div>
              <h3 className="text-2xl font-bold text-white tracking-tight">
                {selectedState.name} State
              </h3>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">
                Capital: <strong className="text-zinc-200">{selectedState.capital}</strong>
              </p>
              <p className="text-xs text-emerald-400/90 italic mt-1 font-medium">
                "{selectedState.slogan}"
              </p>
            </div>

            {/* Cost Index & Specs */}
            <div className="grid grid-cols-2 gap-3 bg-zinc-950 border border-zinc-800 p-3.5 rounded-xl text-xs">
              <div>
                <span className="text-[10px] uppercase text-zinc-500 block">
                  Cost Multiplier
                </span>
                <span className="text-sm font-bold font-mono text-zinc-200">
                  {selectedState.costMultiplier}x
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-zinc-500 block">
                  Living Index
                </span>
                <span className="text-sm font-bold font-mono text-amber-400">
                  {selectedState.costMultiplier > 1.2
                    ? 'High Metro'
                    : selectedState.costMultiplier < 0.95
                    ? 'Economical'
                    : 'Standard'}
                </span>
              </div>
            </div>

            {/* Local Delicacy */}
            <div className="bg-zinc-950 border border-zinc-800 p-3.5 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-zinc-300 flex items-center gap-1.5">
                  <Utensils className="w-3.5 h-3.5 text-orange-400" />
                  Regional Delicacy
                </span>
                <span className="font-mono text-orange-400 font-bold">
                  ₦{selectedState.delicacy.cost.toLocaleString()}
                </span>
              </div>
              <h4 className="text-xs font-semibold text-white">
                {selectedState.delicacy.name}
              </h4>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                {selectedState.delicacy.desc}
              </p>
            </div>

            {/* Specialty Job Market */}
            <div className="bg-zinc-950 border border-zinc-800 p-3.5 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-zinc-300 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
                  Specialty State Hustle
                </span>
                <span className="font-mono text-emerald-400 font-bold">
                  +₦{selectedState.jobMarket.earnMin.toLocaleString()} - {selectedState.jobMarket.earnMax.toLocaleString()}
                </span>
              </div>
              <h4 className="text-xs font-semibold text-white">
                {selectedState.jobMarket.specialtyJob}
              </h4>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                {selectedState.jobMarket.desc}
              </p>
            </div>
          </div>

          {/* INTERSTATE TRAVEL ACTIONS */}
          <div className="pt-4 border-t border-zinc-800 space-y-3">
            {isAtSelectedState ? (
              <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-4 text-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-1.5" />
                <span className="text-xs font-bold text-emerald-300 block">
                  You are currently based in {selectedState.name}!
                </span>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Enjoy local mama put meals, execute trade shifts, or click another state on the map to travel.
                </p>
              </div>
            ) : locationMode === 'INTERNATIONAL' ? (
              <div className="bg-amber-950/40 border border-amber-500/40 rounded-xl p-4 text-center space-y-2">
                <Info className="w-5 h-5 text-amber-400 mx-auto" />
                <span className="text-xs font-bold text-amber-300 block">
                  You are currently living abroad!
                </span>
                <p className="text-[11px] text-zinc-300">
                  To relocate back to {selectedState.name} State, book an international flight to Nigeria via the Airport tab.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <span className="text-xs font-bold text-zinc-300 block">
                  Domestic Inter-State Transport Options:
                </span>

                {/* Option 1: Interstate Bus */}
                <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-xl flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                      <Bus className="w-3.5 h-3.5 text-amber-400" />
                      Interstate Commercial Coach ({interstateTrip.busOperator})
                    </div>
                    <div className="text-[10px] text-zinc-400 mt-0.5 font-mono">
                      {interstateTrip.distanceKm} km · {interstateTrip.travelTimeFormatted} (+6h, -10% Energy)
                    </div>
                    <div className="text-xs font-bold font-mono text-emerald-400 mt-1">
                      ₦{busFare.toLocaleString()}
                    </div>
                  </div>

                  <button
                    onClick={() => onTravelByBus(selectedState, busFare)}
                    disabled={!canAffordBus}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-900 disabled:text-zinc-600 text-white rounded-lg text-xs font-bold transition-colors border border-zinc-700/80 whitespace-nowrap"
                  >
                    Board Bus
                  </button>
                </div>

                {/* Option 2: Domestic Flight */}
                <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-xl flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                      <Plane className="w-3.5 h-3.5 text-sky-400" />
                      Domestic Scheduled Flight
                    </div>
                    <div className="text-[10px] text-zinc-400 mt-0.5">
                      Air Peace / Ibom Air · 1 hr (+1h, -5% Energy, +15 Joy)
                    </div>
                    <div className="text-xs font-bold font-mono text-sky-400 mt-1">
                      ₦{flightFare.toLocaleString()}
                    </div>
                  </div>

                  <button
                    onClick={() => onTravelByFlight(selectedState, flightFare)}
                    disabled={!canAffordFlight}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-900 disabled:text-zinc-600 text-white rounded-lg text-xs font-bold transition-colors whitespace-nowrap"
                  >
                    Fly Express
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
