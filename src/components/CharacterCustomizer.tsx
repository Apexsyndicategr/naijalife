/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Sparkles,
  Shuffle,
  ArrowRight,
  User,
  Crown,
  Shirt,
  Glasses,
  Palette,
  Footprints,
  Scissors
} from 'lucide-react';
import { CharacterAvatar } from '../types/game';
import { CharacterRenderer } from './CharacterRenderer';

interface CharacterCustomizerProps {
  avatar: CharacterAvatar;
  onChange: (updated: CharacterAvatar) => void;
  onProceed: () => void;
  playerName: string;
}

const SKIN_TONES = [
  { id: '#3b220d', label: 'Ebony Rich', color: '#3b220d' },
  { id: '#4a2c11', label: 'Deep Espresso', color: '#4a2c11' },
  { id: '#6b3a1a', label: 'Dark Cocoa', color: '#6b3a1a' },
  { id: '#8d5524', label: 'Warm Bronze', color: '#8d5524' },
  { id: '#b07946', label: 'Caramel Honey', color: '#b07946' },
  { id: '#c68642', label: 'Almond Glow', color: '#c68642' },
  { id: '#d99b66', label: 'Golden Sand', color: '#d99b66' },
];

const HAIR_STYLES = [
  { id: 'fade', label: 'Low/High Fade', gender: 'unisex' },
  { id: 'waves', label: '360 Waves', gender: 'unisex' },
  { id: 'afro', label: 'Classic Afro', gender: 'unisex' },
  { id: 'braids', label: 'Braids / Plats', gender: 'unisex' },
  { id: 'cornrows', label: 'Crisp Cornrows', gender: 'unisex' },
  { id: 'dreads', label: 'Dreadlocks', gender: 'unisex' },
  { id: 'locs', label: 'Fresh Sisterlocks', gender: 'unisex' },
  { id: 'buzz', label: 'Clean Buzz Cut', gender: 'unisex' },
  { id: 'gele', label: 'Royal Gele Wrap', gender: 'female' },
];

const HAIR_COLORS = [
  { id: '#18181b', label: 'Jet Black', color: '#18181b' },
  { id: '#3f2e18', label: 'Espresso Brown', color: '#3f2e18' },
  { id: '#b45309', label: 'Golden Blonde', color: '#b45309' },
  { id: '#881337', label: 'Burgundy Wine', color: '#881337' },
  { id: '#94a3b8', label: 'Silver Platinum', color: '#94a3b8' },
  { id: '#065f46', label: 'Emerald Tint', color: '#065f46' },
];

const OUTFITS = [
  { id: 'streetwear', label: 'Lagos Streetwear Hoodie', desc: 'Oversized graphic drip hoodie' },
  { id: 'agbada', label: 'Grand Royal Agbada', desc: 'Extravagant 3-piece traditional regalia' },
  { id: 'ankara', label: 'Vibrant Ankara Wax', desc: 'Vivid African patterned native top' },
  { id: 'trad_senator', label: 'Crisp Senator Suit', desc: 'Tailored sleek contemporary native' },
  { id: 'corporate', label: 'Sharp Corporate Suit', desc: 'Navy blue banker blazer with tie' },
  { id: 'designer', label: 'Balr Luxury Polo', desc: 'Exclusive designer monogram fit' },
  { id: 'casual', label: 'Casual Emerald Tee', desc: 'Relaxed everyday street style' },
];

const PANTS = [
  { id: 'jeans', label: 'Denim Jeans' },
  { id: 'sweatpants', label: 'Tech Fleece Trackpants' },
  { id: 'slacks', label: 'Tailored Native Slacks' },
  { id: 'wrapper', label: 'Royal Wrapper / Skirt' },
  { id: 'shorts', label: 'Designer Cargo Shorts' },
];

const SHOES = [
  { id: 'sneakers', label: 'Designer Sneakers' },
  { id: 'loafers', label: 'Italian Leather Loafers' },
  { id: 'sandals', label: 'Leather Native Slippers' },
  { id: 'boots', label: 'Chelsea Boots' },
  { id: 'heels', label: 'Luxury Stilettos' },
];

const ACCESSORIES = [
  { id: 'none', label: 'None (Clean Look)' },
  { id: 'designer_shades', label: 'Designer Black Shades' },
  { id: 'sunglasses', label: 'Gold Wire Sunglasses' },
  { id: 'gold_chain', label: '18k Cuban Link Chain' },
  { id: 'diamond_chain', label: 'Iced Out Diamond Choker' },
  { id: 'rolex_watch', label: 'Gold Presidential Watch' },
  { id: 'fila_cap', label: 'Traditional Fila Cap' },
  { id: 'coral_beads', label: 'Royal Benin Coral Beads' },
];

export const CharacterCustomizer: React.FC<CharacterCustomizerProps> = ({
  avatar,
  onChange,
  onProceed,
  playerName,
}) => {
  const [activeTab, setActiveTab] = useState<'body' | 'hair' | 'outfit' | 'bottoms' | 'accessories'>('body');

  const handleRandomize = () => {
    const randomSkin = SKIN_TONES[Math.floor(Math.random() * SKIN_TONES.length)].id;
    const randomHair = HAIR_STYLES[Math.floor(Math.random() * HAIR_STYLES.length)].id as any;
    const randomHairColor = HAIR_COLORS[Math.floor(Math.random() * HAIR_COLORS.length)].id;
    const randomOutfit = OUTFITS[Math.floor(Math.random() * OUTFITS.length)].id as any;
    const randomPants = PANTS[Math.floor(Math.random() * PANTS.length)].id as any;
    const randomShoes = SHOES[Math.floor(Math.random() * SHOES.length)].id as any;
    const randomAccessory = ACCESSORIES[Math.floor(Math.random() * ACCESSORIES.length)].id as any;
    const randomGender = Math.random() > 0.5 ? 'male' : 'female';

    onChange({
      gender: randomGender,
      skinTone: randomSkin,
      hairstyle: randomHair,
      hairColor: randomHairColor,
      outfit: randomOutfit,
      pants: randomPants,
      shoes: randomShoes,
      accessory: randomAccessory,
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-4">
      {/* Top Banner */}
      <div className="text-center mb-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[11px] font-semibold text-emerald-300 shadow-sm mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" style={{ animationDuration: '6s' }} />
          <span>Character Studio • Full Body Avatar</span>
        </div>
        <h2 className="text-2xl font-black text-white tracking-tight">
          Style Your Avatar, <span className="text-emerald-400">{playerName || 'Citizen'}</span>
        </h2>
        <p className="text-xs text-zinc-400 mt-1 max-w-lg mx-auto">
          Customize your full-body character to walk freely across Nigerian cities, houses, offices, and clubs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT / CENTER: Full-Body Character Showcase */}
        <div className="lg:col-span-5 bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 flex flex-col items-center justify-center relative shadow-2xl overflow-hidden min-h-[460px]">
          <div className="absolute inset-0 bg-radial from-emerald-500/10 via-transparent to-transparent pointer-events-none" />

          {/* Tag & Randomize Button */}
          <div className="w-full flex items-center justify-between mb-4 z-10">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-emerald-400" />
              Full Body Preview
            </span>
            <button
              onClick={handleRandomize}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800/90 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 border border-zinc-700/80 transition-colors shadow-sm cursor-pointer"
            >
              <Shuffle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Randomize</span>
            </button>
          </div>

          {/* Full body character renderer */}
          <div className="my-auto py-2">
            <CharacterRenderer
              avatar={avatar}
              size="full"
              fullBody={true}
              showBackground={false}
              className="drop-shadow-2xl"
            />
          </div>

          {/* Quick summary tag */}
          <div className="mt-4 z-10 w-full bg-zinc-950/70 border border-zinc-800/80 rounded-xl px-4 py-2.5 text-center">
            <p className="text-xs font-bold text-zinc-200 capitalize">
              {avatar.outfit.replace('_', ' ')} • {avatar.hairstyle}
            </p>
            <p className="text-[11px] text-zinc-400 capitalize">
              {avatar.accessory !== 'none' ? avatar.accessory.replace('_', ' ') : 'Clean look'} • {avatar.pants || 'jeans'} • {avatar.shoes || 'sneakers'}
            </p>
          </div>
        </div>

        {/* RIGHT: Customization Tabs & Options */}
        <div className="lg:col-span-7 bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-2xl flex flex-col">
          {/* Category Tabs */}
          <div className="grid grid-cols-5 gap-1.5 p-1 bg-zinc-950/80 rounded-xl border border-zinc-800/80 mb-5">
            <button
              onClick={() => setActiveTab('body')}
              className={`py-2 px-1 text-xs font-bold rounded-lg transition-all flex flex-col items-center gap-1 ${
                activeTab === 'body'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Skin</span>
            </button>
            <button
              onClick={() => setActiveTab('hair')}
              className={`py-2 px-1 text-xs font-bold rounded-lg transition-all flex flex-col items-center gap-1 ${
                activeTab === 'hair'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Scissors className="w-3.5 h-3.5" />
              <span>Hair</span>
            </button>
            <button
              onClick={() => setActiveTab('outfit')}
              className={`py-2 px-1 text-xs font-bold rounded-lg transition-all flex flex-col items-center gap-1 ${
                activeTab === 'outfit'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Shirt className="w-3.5 h-3.5" />
              <span>Top</span>
            </button>
            <button
              onClick={() => setActiveTab('bottoms')}
              className={`py-2 px-1 text-xs font-bold rounded-lg transition-all flex flex-col items-center gap-1 ${
                activeTab === 'bottoms'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Footprints className="w-3.5 h-3.5" />
              <span>Bottoms</span>
            </button>
            <button
              onClick={() => setActiveTab('accessories')}
              className={`py-2 px-1 text-xs font-bold rounded-lg transition-all flex flex-col items-center gap-1 ${
                activeTab === 'accessories'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Crown className="w-3.5 h-3.5" />
              <span>Bling</span>
            </button>
          </div>

          {/* TAB CONTENT */}
          <div className="min-h-[280px]">
            {/* TAB: BODY & SKIN */}
            {activeTab === 'body' && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-2">Gender Appearance</label>
                  <div className="grid grid-cols-2 gap-3">
                    {(['male', 'female'] as const).map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => onChange({ ...avatar, gender: g })}
                        className={`p-3 rounded-xl border text-xs font-bold capitalize transition-all ${
                          avatar.gender === g
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-sm'
                            : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                        }`}
                      >
                        {g} Presentation
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-2">Melanin Complexion / Skin Tone</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {SKIN_TONES.map((tone) => (
                      <button
                        key={tone.id}
                        type="button"
                        onClick={() => onChange({ ...avatar, skinTone: tone.id })}
                        className={`flex items-center gap-2.5 p-2 rounded-xl border transition-all ${
                          avatar.skinTone === tone.id
                            ? 'bg-emerald-950/40 border-emerald-500 shadow-md ring-1 ring-emerald-500'
                            : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        <span
                          className="w-6 h-6 rounded-full border border-black/30 shrink-0 shadow-sm"
                          style={{ backgroundColor: tone.color }}
                        />
                        <span className="text-xs font-semibold text-zinc-200">{tone.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: HAIR */}
            {activeTab === 'hair' && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-2">Hairstyle</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[160px] overflow-y-auto pr-1">
                    {HAIR_STYLES.map((style) => (
                      <button
                        key={style.id}
                        type="button"
                        onClick={() => onChange({ ...avatar, hairstyle: style.id as any })}
                        className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all ${
                          avatar.hairstyle === style.id
                            ? 'bg-emerald-950/50 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500'
                            : 'bg-zinc-950/60 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                        }`}
                      >
                        {style.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-2">Hair Color</label>
                  <div className="flex flex-wrap gap-2">
                    {HAIR_COLORS.map((col) => (
                      <button
                        key={col.id}
                        type="button"
                        onClick={() => onChange({ ...avatar, hairColor: col.id })}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                          avatar.hairColor === col.id
                            ? 'bg-zinc-800 border-emerald-500 text-white ring-1 ring-emerald-500'
                            : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                        }`}
                      >
                        <span className="w-3.5 h-3.5 rounded-full border border-zinc-700 shrink-0" style={{ backgroundColor: col.color }} />
                        <span>{col.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: TOPS / OUTFITS */}
            {activeTab === 'outfit' && (
              <div className="space-y-3">
                <label className="text-xs font-bold text-zinc-300 block">Top Wear / Traditional Regalia</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[240px] overflow-y-auto pr-1">
                  {OUTFITS.map((outfit) => (
                    <button
                      key={outfit.id}
                      type="button"
                      onClick={() => onChange({ ...avatar, outfit: outfit.id as any })}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        avatar.outfit === outfit.id
                          ? 'bg-emerald-950/50 border-emerald-500 ring-1 ring-emerald-500'
                          : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div className="text-xs font-bold text-zinc-100">{outfit.label}</div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">{outfit.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: BOTTOMS & SHOES */}
            {activeTab === 'bottoms' && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-2">Trousers / Bottoms</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {PANTS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => onChange({ ...avatar, pants: p.id as any })}
                        className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all ${
                          avatar.pants === p.id
                            ? 'bg-emerald-950/50 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500'
                            : 'bg-zinc-950/60 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-2">Footwear</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {SHOES.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => onChange({ ...avatar, shoes: s.id as any })}
                        className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all ${
                          avatar.shoes === s.id
                            ? 'bg-emerald-950/50 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500'
                            : 'bg-zinc-950/60 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: ACCESSORIES & BLING */}
            {activeTab === 'accessories' && (
              <div className="space-y-3">
                <label className="text-xs font-bold text-zinc-300 block">Jewelry & Accessories</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[240px] overflow-y-auto pr-1">
                  {ACCESSORIES.map((acc) => (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => onChange({ ...avatar, accessory: acc.id as any })}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        avatar.accessory === acc.id
                          ? 'bg-emerald-950/50 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500'
                          : 'bg-zinc-950/60 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                      }`}
                    >
                      <div className="text-xs font-bold text-zinc-100">{acc.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Confirm & Continue */}
          <div className="mt-5 pt-4 border-t border-zinc-800 flex justify-end">
            <button
              onClick={onProceed}
              type="button"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 font-black text-sm shadow-lg shadow-emerald-500/20 transition-all cursor-pointer transform hover:scale-[1.02]"
            >
              <span>Confirm Look & Choose State</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
