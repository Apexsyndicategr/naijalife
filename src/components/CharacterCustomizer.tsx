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
  Palette,
  Scissors,
  Shirt,
  Ruler,
  CheckCircle2
} from 'lucide-react';
import { CharacterAvatar } from '../types/game';
import { CharacterRenderer } from './CharacterRenderer';
import { ThreeCharacterAvatar } from './ThreeCharacterAvatar';

interface CharacterCustomizerProps {
  avatar: CharacterAvatar;
  onChange: (updated: CharacterAvatar) => void;
  onProceed: () => void;
  playerName: string;
}

const SKIN_TONES = [
  { id: '#3b220d', label: 'Ebony Rich', color: '#3b220d', desc: 'Deep rich ebony' },
  { id: '#4a2c11', label: 'Deep Espresso', color: '#4a2c11', desc: 'Dark espresso glow' },
  { id: '#6b3a1a', label: 'Dark Cocoa', color: '#6b3a1a', desc: 'Warm cocoa complexion' },
  { id: '#8d5524', label: 'Warm Bronze', color: '#8d5524', desc: 'Golden bronze undertone' },
  { id: '#b07946', label: 'Caramel Honey', color: '#b07946', desc: 'Smooth honey caramel' },
  { id: '#c68642', label: 'Almond Glow', color: '#c68642', desc: 'Warm almond skin' },
  { id: '#d99b66', label: 'Golden Sand', color: '#d99b66', desc: 'Bright radiant sand' },
];

interface HairOption {
  id: CharacterAvatar['hairstyle'];
  label: string;
  type: string;
  renderPreview: (color: string) => React.ReactNode;
}

const HAIR_OPTIONS: HairOption[] = [
  {
    id: 'peaky_cap',
    label: 'Peaky Flat Cap',
    type: 'Dapper Wool Tweed',
    renderPreview: (c) => (
      <svg viewBox="0 0 40 40" className="w-9 h-9">
        <path d="M10 24 C10 16 18 12 28 14 C32 15 34 18 34 22 L8 24 Z" fill="#475569" />
        <path d="M8 24 Q20 22 34 22 L36 25 Q20 27 6 25 Z" fill="#334155" />
        <ellipse cx="20" cy="27" rx="7" ry="6" fill="#8d5524" />
      </svg>
    ),
  },
  {
    id: 'afro',
    label: 'Classic Afro',
    type: 'Natural Volume',
    renderPreview: (c) => (
      <svg viewBox="0 0 40 40" className="w-9 h-9">
        <circle cx="20" cy="22" r="14" fill={c} />
        <ellipse cx="20" cy="25" rx="8" ry="9" fill="#8d5524" />
      </svg>
    ),
  },
  {
    id: 'fade',
    label: 'Low / Mid Fade',
    type: 'Crisp Taper',
    renderPreview: (c) => (
      <svg viewBox="0 0 40 40" className="w-9 h-9">
        <path d="M12 20 Q20 12 28 20 L27 22 L13 22 Z" fill={c} />
        <ellipse cx="20" cy="25" rx="7" ry="8" fill="#8d5524" />
      </svg>
    ),
  },
  {
    id: 'waves',
    label: '360 Waves',
    type: 'Concentric Flow',
    renderPreview: (c) => (
      <svg viewBox="0 0 40 40" className="w-9 h-9">
        <ellipse cx="20" cy="20" rx="10" ry="8" fill={c} />
        <path d="M13 18 Q20 15 27 18" stroke="#ffffff" strokeWidth="0.8" opacity="0.6" fill="none" />
        <path d="M14 20 Q20 17 26 20" stroke="#ffffff" strokeWidth="0.8" opacity="0.6" fill="none" />
        <ellipse cx="20" cy="26" rx="7" ry="7" fill="#8d5524" />
      </svg>
    ),
  },
  {
    id: 'cornrows',
    label: 'Crisp Cornrows',
    type: 'Geometric Scalp Rows',
    renderPreview: (c) => (
      <svg viewBox="0 0 40 40" className="w-9 h-9">
        <ellipse cx="20" cy="24" rx="8" ry="9" fill="#8d5524" />
        <line x1="16" y1="14" x2="16" y2="22" stroke={c} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="20" y1="13" x2="20" y2="22" stroke={c} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="24" y1="14" x2="24" y2="22" stroke={c} strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'braids',
    label: 'Braids / Plats',
    type: 'Hanging Intricate',
    renderPreview: (c) => (
      <svg viewBox="0 0 40 40" className="w-9 h-9">
        <ellipse cx="20" cy="23" rx="7" ry="8" fill="#8d5524" />
        <path d="M13 18 L10 32 M15 16 L12 34 M20 14 L20 35 M25 16 L28 34 M27 18 L30 32" stroke={c} strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'dreads',
    label: 'Dreadlocks',
    type: 'Textured Rasta Crown',
    renderPreview: (c) => (
      <svg viewBox="0 0 40 40" className="w-9 h-9">
        <ellipse cx="20" cy="23" rx="7" ry="8" fill="#8d5524" />
        <path d="M12 17 L9 33 M15 15 L13 35 M20 13 L20 35 M25 15 L27 35 M28 17 L31 33" stroke={c} strokeWidth="3" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'locs',
    label: 'Fine Sisterlocks',
    type: 'Layered Slender Locs',
    renderPreview: (c) => (
      <svg viewBox="0 0 40 40" className="w-9 h-9">
        <ellipse cx="20" cy="23" rx="7" ry="8" fill="#8d5524" />
        <path d="M14 17 L11 31 M17 15 L15 34 M20 14 L20 34 M23 15 L25 34 M26 17 L29 31" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'buzz',
    label: 'Clean Buzz Cut',
    type: 'Minimal Low Trim',
    renderPreview: (c) => (
      <svg viewBox="0 0 40 40" className="w-9 h-9">
        <ellipse cx="20" cy="24" rx="8" ry="9" fill="#8d5524" />
        <path d="M13 20 Q20 14 27 20" stroke={c} strokeWidth="3.5" fill="none" />
      </svg>
    ),
  },
];

const HAIR_COLORS = [
  { id: '#18181b', label: 'Jet Black', color: '#18181b' },
  { id: '#3f2e18', label: 'Dark Brown', color: '#3f2e18' },
  { id: '#b45309', label: 'Golden Tint', color: '#b45309' },
  { id: '#881337', label: 'Burgundy', color: '#881337' },
];

// STRICTLY 4 NON-EXPENSIVE STARTER CLOTHES (Expensive clothes must be bought in-game)
interface StarterOutfitOption {
  id: CharacterAvatar['outfit'];
  name: string;
  category: string;
  description: string;
  pants: CharacterAvatar['pants'];
  pantsColor: string;
  shoes: CharacterAvatar['shoes'];
  shoesColor: string;
  renderMiniGraphic: () => React.ReactNode;
}

const STARTER_OUTFITS: StarterOutfitOption[] = [
  {
    id: 'corporate',
    name: 'Dapper Tweed Vest & Red Tie',
    category: 'Gentleman Classic',
    description: 'Tailored tweed grey waistcoat with crisp white shirt, crimson red silk tie, navy pinstripe trousers & Oxford shoes.',
    pants: 'slacks',
    pantsColor: '#1e293b',
    shoes: 'loafers',
    shoesColor: '#18181b',
    renderMiniGraphic: () => (
      <svg viewBox="0 0 40 48" className="w-9 h-11 shrink-0">
        {/* White shirt base */}
        <path d="M10 10 L16 4 L24 4 L30 10 L28 26 L12 26 Z" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
        {/* Grey tweed vest */}
        <path d="M13 14 L17 18 L23 18 L27 14 L26 26 L14 26 Z" fill="#64748b" />
        {/* Red tie */}
        <polygon points="19,10 21,10 20.5,19 19.5,19" fill="#b91c1c" />
        {/* Dark trousers */}
        <rect x="12" y="26" width="6" height="18" rx="2" fill="#1e293b" />
        <rect x="22" y="26" width="6" height="18" rx="2" fill="#1e293b" />
        {/* Oxford shoes */}
        <rect x="10" y="44" width="8" height="4" rx="1.5" fill="#18181b" />
        <rect x="22" y="44" width="8" height="4" rx="1.5" fill="#18181b" />
      </svg>
    ),
  },
  {
    id: 'casual',
    name: 'Simple White Tee & Blue Jeans',
    category: 'Starter Fit 1',
    description: 'Crisp plain white cotton t-shirt with classic blue denim jeans and white sneakers.',
    pants: 'jeans',
    pantsColor: '#1e3a8a',
    shoes: 'sneakers',
    shoesColor: '#ffffff',
    renderMiniGraphic: () => (
      <svg viewBox="0 0 40 48" className="w-9 h-11 shrink-0">
        {/* White crewneck shirt */}
        <path d="M10 10 L16 4 L24 4 L30 10 L28 26 L12 26 Z" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
        {/* Blue denim jeans */}
        <rect x="12" y="26" width="6" height="18" rx="2" fill="#1e3a8a" />
        <rect x="22" y="26" width="6" height="18" rx="2" fill="#1e3a8a" />
        {/* White sneakers */}
        <rect x="10" y="44" width="8" height="4" rx="1.5" fill="#ffffff" />
        <rect x="22" y="44" width="8" height="4" rx="1.5" fill="#ffffff" />
      </svg>
    ),
  },
  {
    id: 'trad_senator',
    name: 'Casual Grey Polo & Chinos',
    category: 'Starter Fit 2',
    description: 'Comfortable grey polo shirt with light beige chinos and casual dark loafers.',
    pants: 'slacks',
    pantsColor: '#78350f',
    shoes: 'loafers',
    shoesColor: '#18181b',
    renderMiniGraphic: () => (
      <svg viewBox="0 0 40 48" className="w-9 h-11 shrink-0">
        {/* Grey polo */}
        <path d="M10 10 L16 4 L24 4 L30 10 L28 26 L12 26 Z" fill="#475569" stroke="#334155" strokeWidth="0.8" />
        <polygon points="17,5 23,5 20,12" fill="#1e293b" />
        {/* Tan chinos */}
        <rect x="12" y="26" width="6" height="18" rx="2" fill="#a16207" />
        <rect x="22" y="26" width="6" height="18" rx="2" fill="#a16207" />
        {/* Dark loafers */}
        <rect x="10" y="44" width="8" height="4" rx="1.5" fill="#18181b" />
        <rect x="22" y="44" width="8" height="4" rx="1.5" fill="#18181b" />
      </svg>
    ),
  },
  {
    id: 'streetwear',
    name: 'Everyday Cotton Shirt & Trackpants',
    category: 'Starter Fit 3',
    description: 'Relaxed forest green cotton tee with dark charcoal sweatpants and clean trainers.',
    pants: 'sweatpants',
    pantsColor: '#1f2937',
    shoes: 'sneakers',
    shoesColor: '#ffffff',
    renderMiniGraphic: () => (
      <svg viewBox="0 0 40 48" className="w-9 h-11 shrink-0">
        {/* Green tee */}
        <path d="M10 10 L16 4 L24 4 L30 10 L28 26 L12 26 Z" fill="#047857" stroke="#065f46" strokeWidth="0.8" />
        {/* Dark trackpants */}
        <rect x="12" y="26" width="6" height="18" rx="2" fill="#1f2937" />
        <rect x="22" y="26" width="6" height="18" rx="2" fill="#1f2937" />
        {/* Trainers */}
        <rect x="10" y="44" width="8" height="4" rx="1.5" fill="#ffffff" />
        <rect x="22" y="44" width="8" height="4" rx="1.5" fill="#ffffff" />
      </svg>
    ),
  },
  {
    id: 'ankara',
    name: 'Basic Local Ankara Native',
    category: 'Starter Fit 4',
    description: 'Modest short-sleeve orange & yellow wax print native top with dark casual trousers.',
    pants: 'slacks',
    pantsColor: '#0f172a',
    shoes: 'sandals',
    shoesColor: '#451a03',
    renderMiniGraphic: () => (
      <svg viewBox="0 0 40 48" className="w-9 h-11 shrink-0">
        {/* Ankara patterned shirt */}
        <path d="M10 10 L16 4 L24 4 L30 10 L28 26 L12 26 Z" fill="#ea580c" />
        <path d="M12 14 Q20 18 28 14" stroke="#facc15" strokeWidth="1.5" fill="none" />
        <path d="M12 20 Q20 24 28 20" stroke="#0284c7" strokeWidth="1.5" fill="none" />
        {/* Dark slacks */}
        <rect x="12" y="26" width="6" height="18" rx="2" fill="#0f172a" />
        <rect x="22" y="26" width="6" height="18" rx="2" fill="#0f172a" />
        {/* Leather slippers */}
        <rect x="10" y="44" width="8" height="4" rx="1.5" fill="#451a03" />
        <rect x="22" y="44" width="8" height="4" rx="1.5" fill="#451a03" />
      </svg>
    ),
  },
];

const HEIGHT_OPTIONS = [
  { id: 'short', label: "Short (5'5\" / 165cm)", visualH: 'h-6' },
  { id: 'average', label: "Average (5'9\" / 175cm)", visualH: 'h-8' },
  { id: 'tall', label: "Tall (6'1\" / 185cm)", visualH: 'h-10' },
  { id: 'towering', label: "Towering (6'4\" / 193cm)", visualH: 'h-12' },
] as const;

export const CharacterCustomizer: React.FC<CharacterCustomizerProps> = ({
  avatar,
  onChange,
  onProceed,
  playerName,
}) => {
  const [activeTab, setActiveTab] = useState<'skin' | 'hair' | 'clothes' | 'height'>('skin');

  const safeAvatar: CharacterAvatar = {
    gender: avatar?.gender || 'male',
    skinTone: avatar?.skinTone || '#8d5524',
    hairstyle: avatar?.hairstyle || 'afro',
    hairColor: avatar?.hairColor || '#18181b',
    outfit: avatar?.outfit || 'casual',
    pants: avatar?.pants || 'jeans',
    pantsColor: avatar?.pantsColor || '#1e3a8a',
    shoes: avatar?.shoes || 'sneakers',
    shoesColor: avatar?.shoesColor || '#ffffff',
    accessory: avatar?.accessory || 'none',
    height: avatar?.height || 'average',
  };

  const handleRandomize = () => {
    const randomSkin = SKIN_TONES[Math.floor(Math.random() * SKIN_TONES.length)].id;
    const randomHair = HAIR_OPTIONS[Math.floor(Math.random() * HAIR_OPTIONS.length)].id;
    const randomOutfit = STARTER_OUTFITS[Math.floor(Math.random() * STARTER_OUTFITS.length)];
    const randomHeight = HEIGHT_OPTIONS[Math.floor(Math.random() * HEIGHT_OPTIONS.length)].id;

    onChange({
      ...safeAvatar,
      skinTone: randomSkin,
      hairstyle: randomHair,
      outfit: randomOutfit.id,
      pants: randomOutfit.pants,
      pantsColor: randomOutfit.pantsColor,
      shoes: randomOutfit.shoes,
      shoesColor: randomOutfit.shoesColor,
      height: randomHeight,
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-4">
      {/* Top Banner */}
      <div className="text-center mb-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[11px] font-semibold text-emerald-300 shadow-sm mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" style={{ animationDuration: '6s' }} />
          <span>Step 2 of 4 • Realistic Avatar Customization</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Style Your Citizen, <span className="text-emerald-400">{playerName || 'Citizen'}</span>
        </h2>
        <p className="text-xs text-zinc-400 mt-1 max-w-lg mx-auto">
          Choose your skin tone, realistic hairstyle, starter outfit, and height. High-end luxury designer clothes are unlocked later in city stores!
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
              <span>Full-Body Citizen</span>
            </span>

            <button
              type="button"
              onClick={handleRandomize}
              className="px-3 py-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 border border-zinc-700 transition-colors cursor-pointer"
            >
              <Shuffle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Randomize</span>
            </button>
          </div>

          {/* Real-time 3D Full-Body Character Avatar */}
          <div className="my-auto py-2 w-full flex items-center justify-center">
            <ThreeCharacterAvatar
              avatar={safeAvatar}
              size="full"
              interactive={true}
            />
          </div>

          <div className="w-full mt-4 pt-3 border-t border-zinc-800/80 text-center">
            <div className="text-[11px] font-mono text-zinc-400">
              Gender: <strong className="text-white capitalize">{safeAvatar.gender || 'male'}</strong> · Height: <strong className="text-emerald-400 capitalize">{safeAvatar.height || 'average'}</strong> · Fit: <strong className="text-white capitalize">{safeAvatar.outfit?.replace(/_/g, ' ')}</strong>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Studio Controls with Pictorial Hair & Starter Clothes */}
        <div className="lg:col-span-7 bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-2xl backdrop-blur-xl flex flex-col justify-between min-h-[460px]">
          <div>
            {/* Gender Selection: Male vs Female (Dynamically modifies 3D body proportions) */}
            <div className="mb-3.5 space-y-1.5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 block">
                Select Gender (3D Anatomical Proportions)
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onChange({ ...safeAvatar, gender: 'male' })}
                  className={`py-2 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    safeAvatar.gender === 'male' || !safeAvatar.gender
                      ? 'bg-emerald-500 text-black border-emerald-400 shadow-md ring-2 ring-emerald-500/40'
                      : 'bg-zinc-950/80 text-zinc-300 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <span className="text-sm">👨</span>
                  <span>Male (Masculine Frame)</span>
                </button>
                <button
                  type="button"
                  onClick={() => onChange({ ...safeAvatar, gender: 'female' })}
                  className={`py-2 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    safeAvatar.gender === 'female'
                      ? 'bg-emerald-500 text-black border-emerald-400 shadow-md ring-2 ring-emerald-500/40'
                      : 'bg-zinc-950/80 text-zinc-300 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <span className="text-sm">👩</span>
                  <span>Female (Feminine Silhouette)</span>
                </button>
              </div>
            </div>

            {/* Customizer Tabs */}
            <div className="grid grid-cols-4 gap-1.5 p-1 bg-zinc-950/80 border border-zinc-800 rounded-xl mb-4">
              <button
                type="button"
                onClick={() => setActiveTab('skin')}
                className={`py-2 px-1 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'skin'
                    ? 'bg-emerald-500 text-black shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
                <span>Skin</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('hair')}
                className={`py-2 px-1 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'hair'
                    ? 'bg-emerald-500 text-black shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Scissors className="w-3.5 h-3.5" />
                <span>Hairstyle</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('clothes')}
                className={`py-2 px-1 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'clothes'
                    ? 'bg-emerald-500 text-black shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Shirt className="w-3.5 h-3.5" />
                <span>Clothes (4)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('height')}
                className={`py-2 px-1 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'height'
                    ? 'bg-emerald-500 text-black shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Ruler className="w-3.5 h-3.5" />
                <span>Height</span>
              </button>
            </div>

            {/* TAB CONTENT: SKIN TONE */}
            {activeTab === 'skin' && (
              <div className="space-y-3">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 block">
                  Select Skin Tone Complexion
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {SKIN_TONES.map((t) => {
                    const isSelected = safeAvatar.skinTone === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => onChange({ ...safeAvatar, skinTone: t.id })}
                        className={`p-3 rounded-xl border flex items-center gap-3 transition-all cursor-pointer text-left ${
                          isSelected
                            ? 'bg-emerald-950/80 border-emerald-500 ring-2 ring-emerald-500/50'
                            : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        <span
                          className="w-7 h-7 rounded-full shadow-md border border-white/20 shrink-0"
                          style={{ backgroundColor: t.color }}
                        />
                        <div className="min-w-0">
                          <p className={`text-xs font-bold truncate ${isSelected ? 'text-emerald-300' : 'text-zinc-200'}`}>
                            {t.label}
                          </p>
                          <p className="text-[10px] text-zinc-500 truncate">{t.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB CONTENT: HAIRSTYLES (WITH PICTURE OF THE HAIR) */}
            {activeTab === 'hair' && (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                      Pick Hairstyle (With Live Picture)
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">Realistic Styling</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {HAIR_OPTIONS.map((h) => {
                      const isSelected = safeAvatar.hairstyle === h.id;
                      return (
                        <button
                          key={h.id}
                          type="button"
                          onClick={() => onChange({ ...safeAvatar, hairstyle: h.id })}
                          className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-950/90 border-emerald-500 ring-2 ring-emerald-500/50'
                              : 'bg-zinc-950/70 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/60'
                          }`}
                        >
                          {/* PICTURE OF THE HAIR */}
                          <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-inner">
                            {h.renderPreview(safeAvatar.hairColor || '#18181b')}
                          </div>
                          <span className={`text-[11px] font-bold text-center leading-tight ${isSelected ? 'text-emerald-300' : 'text-zinc-300'}`}>
                            {h.label}
                          </span>
                          <span className="text-[9px] text-zinc-500 text-center truncate max-w-full">
                            {h.type}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Hair Color Bar */}
                <div className="pt-2 border-t border-zinc-800/80">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold block mb-2">
                    Hair Color
                  </span>
                  <div className="flex gap-2">
                    {HAIR_COLORS.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => onChange({ ...safeAvatar, hairColor: c.id })}
                        className={`px-3 py-1.5 rounded-lg border text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                          safeAvatar.hairColor === c.id
                            ? 'bg-emerald-950 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        <span className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: c.color }} />
                        <span>{c.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: CLOTHES (ONLY 4 NON-EXPENSIVE STARTER CLOTHES) */}
            {activeTab === 'clothes' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                    Pick from 4 Starter Outfits
                  </span>
                  <span className="text-[10px] text-amber-400 font-mono">
                    Humble Starter Clothes · Luxury Fits Sold in Stores
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {STARTER_OUTFITS.map((outfit) => {
                    const isSelected = safeAvatar.outfit === outfit.id;
                    return (
                      <button
                        key={outfit.id}
                        type="button"
                        onClick={() => {
                          onChange({
                            ...safeAvatar,
                            outfit: outfit.id,
                            pants: outfit.pants,
                            pantsColor: outfit.pantsColor,
                            shoes: outfit.shoes,
                            shoesColor: outfit.shoesColor,
                          });
                        }}
                        className={`p-3 rounded-xl border flex items-center gap-3 transition-all cursor-pointer text-left ${
                          isSelected
                            ? 'bg-emerald-950/90 border-emerald-500 ring-2 ring-emerald-500/50 shadow-md'
                            : 'bg-zinc-950/70 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/50'
                        }`}
                      >
                        {/* Mini Graphic of the Outfit */}
                        <div className="w-12 h-14 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 shadow-inner">
                          {outfit.renderMiniGraphic()}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[10px] font-mono text-emerald-400 uppercase font-black">
                              {outfit.category}
                            </span>
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                          </div>
                          <p className={`text-xs font-bold mt-0.5 truncate ${isSelected ? 'text-white' : 'text-zinc-200'}`}>
                            {outfit.name}
                          </p>
                          <p className="text-[10px] text-zinc-400 mt-0.5 leading-snug line-clamp-2">
                            {outfit.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB CONTENT: HEIGHT */}
            {activeTab === 'height' && (
              <div className="space-y-4">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 block">
                  Select Character Height & Stature
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {HEIGHT_OPTIONS.map((h) => {
                    const isSelected = (safeAvatar.height || 'average') === h.id;
                    return (
                      <button
                        key={h.id}
                        type="button"
                        onClick={() => onChange({ ...safeAvatar, height: h.id as any })}
                        className={`p-4 rounded-xl border flex flex-col items-center justify-between gap-3 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-950/90 border-emerald-500 ring-2 ring-emerald-500/50 shadow-md'
                            : 'bg-zinc-950/70 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/50'
                        }`}
                      >
                        {/* Visual Height Silhouette Bar */}
                        <div className="h-20 w-10 flex items-end justify-center pb-1">
                          <div
                            className={`w-4 rounded-t-lg transition-all ${
                              isSelected ? 'bg-emerald-400 shadow-[0_0_10px_#34d399]' : 'bg-zinc-700'
                            } ${
                              h.id === 'short'
                                ? 'h-11'
                                : h.id === 'average'
                                ? 'h-14'
                                : h.id === 'tall'
                                ? 'h-17'
                                : 'h-20'
                            }`}
                          />
                        </div>

                        <div className="text-center">
                          <p className={`text-xs font-black capitalize ${isSelected ? 'text-emerald-300' : 'text-zinc-200'}`}>
                            {h.id}
                          </p>
                          <p className="text-[10px] text-zinc-400 mt-0.5 font-mono">
                            {h.id === 'short' ? "5'5\" (165cm)" : h.id === 'average' ? "5'9\" (175cm)" : h.id === 'tall' ? "6'1\" (185cm)" : "6'4\" (193cm)"}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* PROCEED BUTTON: ADVANCE TO STEP 3 (STATE SELECTION) */}
          <div className="pt-4 border-t border-zinc-800 mt-4">
            <button
              type="button"
              onClick={onProceed}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:brightness-110 text-black font-black text-sm rounded-xl shadow-lg shadow-emerald-950/60 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            >
              <span>Confirm Avatar & Pick State of Origin</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-[10px] text-center text-zinc-500 mt-1.5 font-mono">
              Next Step: Choose from the 36 Nigerian states where you will start your life.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
