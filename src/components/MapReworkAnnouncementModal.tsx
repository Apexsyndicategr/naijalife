/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowRight, Building2, Layers, MapPin, SunMoon } from 'lucide-react';

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
      <div className="w-full sm:max-w-2xl max-h-[92dvh] flex flex-col bg-[#07130d] border border-emerald-700/50 rounded-t-3xl sm:rounded-3xl shadow-[0_24px_80px_rgba(0,0,0,0.88)] overflow-hidden text-left">
        {/* Top Header */}
        <div className="px-5 pt-6 pb-5 sm:px-8 sm:pt-7 sm:pb-6 bg-[#0a1c13] border-b border-emerald-900/60 shrink-0">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-950/70">
              <Building2 className="w-6 h-6 text-[#04120b]" />
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-400">
                Upcoming Major Update
              </p>
              <h2
                id="map-rework-title"
                className="font-display text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-tight"
              >
                Major Map Rework: Real 3D Buildings Coming Soon
              </h2>
              <p className="text-sm text-emerald-100/75 leading-relaxed">
                Naija Life is keeping its signature city-map style while upgrading every flat tile and icon into standing, real 3D buildings and towering Nigerian skylines.
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable Roadmap Highlights */}
        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-8 sm:py-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="p-4 rounded-2xl bg-[#0b1f15] border border-emerald-800/45 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Real 3D Standing Buildings</h3>
              <p className="text-xs text-emerald-100/65 leading-relaxed">
                Say goodbye to flat map cutouts. High-rise towers, glass banks, multi-story estates, malls, hospitals, and universities are being modeled as true 3D structures with height, roofs, and street-level depth.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#0b1f15] border border-emerald-800/45 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-300">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Flyovers, Bridges &amp; City Depth</h3>
              <p className="text-xs text-emerald-100/65 leading-relaxed">
                Explore layered expressway flyovers, cable-stayed bridges, waterfront piers, and realistic architectural districts across Lagos, Abuja, Port Harcourt, all 36 states, and Toronto.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#0b1f15] border border-emerald-800/45 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-300">
                <SunMoon className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">3D Shadows, Weather &amp; NEPA</h3>
              <p className="text-xs text-emerald-100/65 leading-relaxed">
                Watch real building shadows move from sunrise to dusk, lit tower windows glow across the skyline at night, and generator lights react dynamically when NEPA cuts power.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#0b1f15] border border-emerald-800/45 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">True to Naija Life</h3>
              <p className="text-xs text-emerald-100/65 leading-relaxed">
                Same fast, intuitive Naija Life gameplay you already know — tapping districts, buying estates, running businesses, traveling states, and enjoying upcoming phone apps like Family &amp; Snapchat — just in a lush 3D skyline.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-600/35">
            <p className="text-xs text-emerald-100/90 leading-relaxed">
              <strong className="text-emerald-300">Your progress is completely safe:</strong> All your Naira &amp; CAD balances, homes, vehicles, businesses, and current travel location stay intact when the 3D city buildings go live.
            </p>
          </div>
        </div>

        {/* Sticky Bottom Thumb-Zone Primary Action */}
        <div className="px-5 py-4 sm:px-8 sm:py-5 bg-[#06100b] border-t border-emerald-900/60 shrink-0">
          <button
            type="button"
            onClick={onContinue}
            className="w-full min-h-[48px] py-3.5 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#031209] font-extrabold text-sm tracking-wide shadow-lg shadow-emerald-950/60 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] transition-all"
          >
            <span>Continue to Game</span>
            <ArrowRight className="w-4 h-4 text-[#031209]" />
          </button>
        </div>
      </div>
    </div>
  );
};
