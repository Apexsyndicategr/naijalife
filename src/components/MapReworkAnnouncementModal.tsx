/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowRight, Building2, Car, Compass, SunMoon } from 'lucide-react';

interface MapReworkAnnouncementModalProps {
  isOpen: boolean;
  onContinue: () => void;
}

export const MapReworkAnnouncementModal: React.FC<MapReworkAnnouncementModalProps> = ({
  isOpen,
  onContinue,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[130] bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-5 select-none animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="map-rework-title"
    >
      <div className="w-full sm:max-w-2xl max-h-[92dvh] flex flex-col bg-zinc-950 border border-emerald-500/35 rounded-t-3xl sm:rounded-3xl shadow-[0_24px_80px_rgba(0,0,0,0.85)] overflow-hidden text-left">
        {/* Top Ambient Header Strip */}
        <div className="px-5 pt-6 pb-5 sm:px-8 sm:pt-7 sm:pb-6 bg-gradient-to-br from-emerald-950/90 via-zinc-950 to-amber-950/40 border-b border-zinc-800/80 shrink-0">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-amber-500 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-950/60">
              <Compass className="w-6 h-6 text-zinc-950" />
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-400">
                Upcoming Major Expansion
              </p>
              <h2
                id="map-rework-title"
                className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight"
              >
                Major Map Rework: Entering True 3D
              </h2>
              <p className="text-sm text-zinc-300 leading-relaxed">
                A complete world overhaul is in active development for Naija Life. Your entire city experience is being rebuilt from the ground up into a living, interactive 3D world.
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable Roadmap Highlights */}
        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-8 sm:py-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Full 3D Cities & Skylines</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                The current flat map is evolving into rotatable, zoomable 3D districts with multi-story towers, expressway flyovers, bridges, and realistic neighborhoods across Lagos, Abuja, Port Harcourt, all 36 states, and Toronto.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <SunMoon className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Dynamic Lighting, Weather & NEPA</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Watch golden sunsets fade into neon city nights, streetlamps react in real time when the NEPA grid drops, generator headlights cut through blackouts, and tropical rainstorms sweep across rooftops.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
                <Car className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Driveable 3D Vehicles & Flights</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Take your cars, SUVs, kekes, and luxury rides onto 3D roads with smooth camera follow, animated airport runways for interstate &amp; international departures, and live citizen movement around town.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Walkable Landmarks & Interiors</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Step directly inside redesigned 3D banks, malls, hospitals, mansions, nightclubs, and universities — plus new upcoming social experiences like Family &amp; Snapchat integration.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-950/35 border border-emerald-500/25">
            <p className="text-xs text-emerald-200 leading-relaxed">
              <strong className="text-emerald-300">Your progress is safe:</strong> All your cash, Naira &amp; CAD balances, properties, vehicles, businesses, and current travel location carry straight forward when the 3D world goes live.
            </p>
          </div>
        </div>

        {/* Sticky Bottom Thumb-Zone Primary Action */}
        <div className="px-5 py-4 sm:px-8 sm:py-5 bg-zinc-950/95 border-t border-zinc-800/80 shrink-0">
          <button
            type="button"
            onClick={onContinue}
            className="w-full min-h-[48px] py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-zinc-950 font-black text-sm tracking-wide shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] transition-all"
          >
            <span>Continue to Game</span>
            <ArrowRight className="w-4 h-4 text-zinc-950" />
          </button>
        </div>
      </div>
    </div>
  );
};
