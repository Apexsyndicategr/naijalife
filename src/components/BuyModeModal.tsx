/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  ShoppingBag,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Coins,
  Crown,
  Plane,
  Tv,
  Bed,
  Utensils,
  Bath,
  Armchair
} from 'lucide-react';
import { FurnitureItem, UserProfile } from '../types/game';
import { BUY_MODE_FURNITURE_CATALOG } from '../data/assetsData';

interface BuyModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  moneyNGN: number;
  ownedFurnitureIds: string[];
  onPurchaseItem: (item: FurnitureItem) => void;
  triggerSound?: (type: 'coin' | 'stamp' | 'alert' | 'success') => void;
}

export const BuyModeModal: React.FC<BuyModeModalProps> = ({
  isOpen,
  onClose,
  moneyNGN,
  ownedFurnitureIds,
  onPurchaseItem,
  triggerSound,
}) => {
  const [activeCategory, setActiveCategory] = useState<
    'kitchen' | 'bathroom' | 'room' | 'living_room' | 'comfort' | 'luxury'
  >('living_room');

  if (!isOpen) return null;

  const filteredItems = BUY_MODE_FURNITURE_CATALOG.filter(
    (item) => item.category === activeCategory
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 select-none animate-in fade-in">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl flex flex-col text-white overflow-hidden">
        {/* HEADER */}
        <div className="p-5 bg-gradient-to-r from-zinc-900 via-zinc-900 to-emerald-950/60 border-b border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <span>BUY MODE • HOME FURNISHINGS & LUXURY</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono">
                  Real Prices
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Furnish your home interior with real consoles, electronics, appliances, and luxury home decor.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-[10px] font-mono text-zinc-400 uppercase">Available Funds</span>
              <span className="text-sm font-black text-emerald-400 font-mono">
                ₦{moneyNGN.toLocaleString()}
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* CATEGORY TABS */}
        <div className="p-3 bg-zinc-900/90 border-b border-zinc-800 grid grid-cols-3 sm:grid-cols-6 gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveCategory('kitchen')}
            className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeCategory === 'kitchen'
                ? 'bg-amber-500/20 border border-amber-500/50 text-amber-300'
                : 'bg-zinc-950/60 text-zinc-400 hover:text-white border border-transparent'
            }`}
          >
            <span>🍳</span>
            <span>Kitchen</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('bathroom')}
            className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeCategory === 'bathroom'
                ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-300'
                : 'bg-zinc-950/60 text-zinc-400 hover:text-white border border-transparent'
            }`}
          >
            <span>🛁</span>
            <span>Bathroom</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('room')}
            className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeCategory === 'room'
                ? 'bg-indigo-500/20 border border-indigo-500/50 text-indigo-300'
                : 'bg-zinc-950/60 text-zinc-400 hover:text-white border border-transparent'
            }`}
          >
            <span>🛏️</span>
            <span>Bedroom</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('living_room')}
            className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeCategory === 'living_room'
                ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300'
                : 'bg-zinc-950/60 text-zinc-400 hover:text-white border border-transparent'
            }`}
          >
            <span>🎮</span>
            <span>Living & PS5</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('comfort')}
            className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeCategory === 'comfort'
                ? 'bg-purple-500/20 border border-purple-500/50 text-purple-300'
                : 'bg-zinc-950/60 text-zinc-400 hover:text-white border border-transparent'
            }`}
          >
            <span>🧘</span>
            <span>Comfort</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('luxury')}
            className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeCategory === 'luxury'
                ? 'bg-gradient-to-r from-amber-500/30 to-yellow-500/30 border border-amber-400 text-amber-300 shadow-md'
                : 'bg-zinc-950/60 text-zinc-400 hover:text-white border border-transparent'
            }`}
          >
            <span>👑</span>
            <span>Grand Decor</span>
          </button>
        </div>

        {/* ITEMS GRID */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 md:grid-cols-2 gap-4 custom-scrollbar">
          {filteredItems.map((item) => {
            const isOwned = (ownedFurnitureIds || []).includes(item.id);
            const canAfford = moneyNGN >= item.priceNGN;

            return (
              <div
                key={item.id}
                className={`bg-zinc-900/90 border rounded-2xl p-4 flex flex-col justify-between transition-all ${
                  isOwned
                    ? 'border-emerald-500/50 bg-emerald-950/15'
                    : 'border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-3xl">{item.icon}</span>
                      <div>
                        <h3 className="text-sm font-black text-white">{item.name}</h3>
                        <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-mono">
                          {item.category.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    {isOwned && (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[10px] font-black uppercase flex items-center gap-1 shrink-0">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>Installed</span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed mb-3">{item.desc}</p>
                </div>

                <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between mt-auto">
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase block font-mono">Real Price</span>
                    <span className="text-sm font-black text-white font-mono">
                      ₦{item.priceNGN.toLocaleString()}
                    </span>
                  </div>

                  <button
                    type="button"
                    disabled={isOwned || !canAfford}
                    onClick={() => {
                      onPurchaseItem(item);
                      triggerSound?.('coin');
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      isOwned
                        ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                        : canAfford
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 shadow-md transform hover:scale-105'
                        : 'bg-zinc-800 text-zinc-500 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    {isOwned ? 'Purchased' : canAfford ? 'Buy Now' : 'Insufficient ₦'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* FOOTER */}
        <div className="p-4 bg-zinc-900/80 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400 shrink-0">
          <span>Purchased items are automatically installed in your home interior.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition-colors cursor-pointer"
          >
            Close Buy Mode
          </button>
        </div>
      </div>
    </div>
  );
};
