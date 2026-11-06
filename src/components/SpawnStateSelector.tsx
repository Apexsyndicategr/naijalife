/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  MapPin,
  Search,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  Utensils,
  Compass,
  Building
} from 'lucide-react';
import { StateData, CharacterAvatar } from '../types/game';
import { NIGERIA_36_STATES_ALPHABETICAL } from '../data/stateLocationsData';
import { CharacterRenderer } from './CharacterRenderer';

interface SpawnStateSelectorProps {
  avatar?: CharacterAvatar;
  playerName?: string;
  userName?: string;
  socialClass?: string;
  onSelectSpawn?: (state: StateData) => void;
  onSelectState?: (state: StateData) => void;
}

export const SpawnStateSelector: React.FC<SpawnStateSelectorProps> = ({
  avatar,
  playerName,
  userName,
  socialClass,
  onSelectSpawn,
  onSelectState,
}) => {
  const displayName = userName || playerName || 'Citizen';
  const handleSelect = onSelectState || onSelectSpawn || (() => {});
  const safeAvatar: CharacterAvatar = avatar || {
    gender: 'unisex',
    skinTone: '#6b4423',
    hairstyle: 'afro',
    hairColor: '#1a110b',
    outfit: 'streetwear',
    pants: 'jeans',
    shoes: 'sneakers',
    accessory: 'none',
  };
  // Sort states strictly alphabetically by name
  const sortedStates = useMemo(() => {
    return [...NIGERIA_36_STATES_ALPHABETICAL].sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const [selectedStateId, setSelectedStateId] = useState<string>('lagos');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStates = useMemo(() => {
    if (!searchQuery.trim()) return sortedStates;
    const q = searchQuery.toLowerCase();
    return sortedStates.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.capital.toLowerCase().includes(q) ||
        s.zone.toLowerCase().includes(q) ||
        s.slogan.toLowerCase().includes(q)
    );
  }, [sortedStates, searchQuery]);

  const currentStateObj = useMemo(() => {
    return sortedStates.find((s) => s.id === selectedStateId) || sortedStates[0];
  }, [sortedStates, selectedStateId]);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6">
      {/* Top Banner */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[11px] font-semibold text-emerald-300 shadow-sm mb-2">
          <Compass className="w-3.5 h-3.5 text-emerald-400" />
          <span>Step 3 of 3: Official Birthplace & Starting Spawn</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Pick Your Starting <span className="text-emerald-400">Nigerian State</span>
        </h2>
        <p className="text-xs text-zinc-400 max-w-md mx-auto mt-1">
          Scroll through all 36 Nigerian states (+ FCT) in alphabetical order to select where your life journey begins.
        </p>

        {/* STUCK HERE WARNING BANNER */}
        <div className="mt-3 max-w-lg mx-auto p-2.5 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-300 text-xs flex items-center justify-center gap-2 text-left">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>Official Rule:</strong> Once you pick your spawn, you are <strong>stuck in that state</strong> until you earn funds to travel out!
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: SCROLLABLE ALPHABETICAL LIST */}
        <div className="lg:col-span-7 bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 backdrop-blur-xl shadow-xl flex flex-col h-[520px]">
          {/* Header & Search */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                States List ({filteredStates.length} / {sortedStates.length})
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">
                Arranged Alphabetically (A - Z)
              </span>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search state name, capital, or zone..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          {/* SCROLLABLE STATE CARDS LIST */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-2 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-900">
            {filteredStates.map((state, idx) => {
              const isSelected = state.id === selectedStateId;
              return (
                <button
                  key={state.id}
                  type="button"
                  onClick={() => setSelectedStateId(state.id)}
                  className={`w-full p-3 rounded-xl text-left transition-all border flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-emerald-950/80 border-emerald-500 shadow-md ring-1 ring-emerald-500/50'
                      : 'bg-zinc-950/70 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/60'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center font-mono text-[11px] font-bold text-zinc-400 shrink-0">
                      {idx + 1}
                    </span>
                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-black truncate ${isSelected ? 'text-emerald-300' : 'text-zinc-200'}`}>
                          {state.name} State
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800/80 text-zinc-400 font-mono">
                          {state.zone}
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-400 flex items-center gap-2 mt-0.5 truncate">
                        <span>Capital: <strong className="text-zinc-300">{state.capital}</strong></span>
                        <span>·</span>
                        <span className="italic text-zinc-500 truncate">"{state.slogan}"</span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    {isSelected ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-zinc-700" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: SELECTED STATE DOSSIER & CONFIRMATION */}
        <div className="lg:col-span-5 bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 backdrop-blur-xl shadow-xl flex flex-col justify-between h-[520px]">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                Selected Spawn
              </span>
              <span className="text-xs font-mono text-zinc-500">
                {currentStateObj.zone}
              </span>
            </div>

            {/* Character & State Badge */}
            <div className="flex items-center gap-4 bg-zinc-950/70 border border-zinc-800/80 p-3 rounded-xl mb-4">
              <CharacterRenderer avatar={safeAvatar} size="sm" />
              <div>
                <h4 className="text-sm font-black text-white">{displayName}</h4>
                <p className="text-[11px] text-emerald-400 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3" />
                  Spawning in <strong>{currentStateObj.name}</strong>
                </p>
              </div>
            </div>

            {/* State Deep Info */}
            <div className="space-y-3">
              <div>
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">
                  State Name & Capital
                </span>
                <p className="text-xl font-black text-white">
                  {currentStateObj.name} State
                </p>
                <p className="text-xs text-zinc-400 mt-0.5 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-zinc-500" />
                  Capital: <strong className="text-zinc-200">{currentStateObj.capital}</strong>
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">
                  Official State Slogan
                </span>
                <p className="text-xs font-semibold text-emerald-300 italic mt-0.5">
                  "{currentStateObj.slogan}"
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                  <Utensils className="w-3 h-3 text-amber-400" />
                  Local Regional Delicacy
                </span>
                <p className="text-xs font-bold text-zinc-200 mt-0.5">
                  {currentStateObj.delicacy.name}
                </p>
                <p className="text-[10px] text-zinc-500">
                  Cost: ₦{currentStateObj.delicacy.cost.toLocaleString()} · Restores Hunger & Joy
                </p>
              </div>

              {/* Real Locations count */}
              <div className="text-[11px] text-zinc-400 pt-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>
                  Includes <strong>{currentStateObj.locations.length} live locations</strong> (Markets, Schools, Supermarkets, Hospitals, Hotels, & Airport)
                </span>
              </div>
            </div>
          </div>

          {/* CONFIRM SPAWN BUTTON */}
          <div className="pt-4 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => handleSelect(currentStateObj)}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-950/60 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.01] active:scale-[0.99] group"
            >
              <span>Confirm Spawn in {currentStateObj.name} & Enter Map</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="text-[10px] text-center text-zinc-500 mt-2 font-mono">
              ⚠️ You cannot change your spawn state once confirmed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
