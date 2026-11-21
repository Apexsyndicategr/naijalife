/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import {
  Sparkles,
  Shuffle,
  ArrowRight,
  User,
  Palette,
  Scissors,
  Shirt,
  Ruler,
  CheckCircle2,
  Lock,
  Smile,
  Crown,
} from 'lucide-react';
import { CharacterAvatar } from '../types/game';
import { ThreeCharacterAvatar } from './ThreeCharacterAvatar';
import {
  CLOTHING_SHOP_CATALOG,
  SALON_HAIRSTYLES_CATALOG,
  getStarterClothingForGender,
  getStarterHairstylesForGender,
} from '../config/economyConfig';

interface CharacterCustomizerProps {
  avatar: CharacterAvatar;
  onChange: (updated: CharacterAvatar) => void;
  onProceed: () => void;
  playerName: string;
  wardrobeMode?: boolean;
  ownedClothing?: string[];
  ownedHairstyles?: string[];
  buttonLabel?: string;
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

const HAIR_COLORS = [
  { id: '#18181b', label: 'Jet Black', color: '#18181b' },
  { id: '#3f2e18', label: 'Dark Brown', color: '#3f2e18' },
  { id: '#b45309', label: 'Golden Tint', color: '#b45309' },
  { id: '#881337', label: 'Burgundy', color: '#881337' },
];

const HEIGHT_OPTIONS = [
  { id: 'short', label: 'Short', metric: `5'5" (165cm)` },
  { id: 'average', label: 'Average', metric: `5'9" (175cm)` },
  { id: 'tall', label: 'Tall', metric: `6'1" (185cm)` },
  { id: 'towering', label: 'Towering', metric: `6'4" (193cm)` },
] as const;

const ACCESSORY_OPTIONS: {
  id: CharacterAvatar['accessory'];
  label: string;
  starter: boolean;
}[] = [
  { id: 'none', label: 'None (Clean)', starter: true },
  { id: 'sunglasses', label: 'Classic Shades', starter: true },
  { id: 'designer_shades', label: 'Gold Cartier Shades', starter: false },
  { id: 'gold_chain', label: '18K Gold Chain', starter: false },
  { id: 'diamond_chain', label: 'VVS Diamond Chain', starter: false },
  { id: 'coral_beads', label: 'Royal Edo Coral Beads', starter: false },
  { id: 'rolex_watch', label: 'Gold Wristwatch', starter: false },
  { id: 'fila_cap', label: 'Aso-Oke Fila Cap', starter: false },
  { id: 'peaky_cap', label: 'Wool Flat Cap', starter: true },
];

export const CharacterCustomizer: React.FC<CharacterCustomizerProps> = ({
  avatar,
  onChange,
  onProceed,
  playerName,
  wardrobeMode = false,
  ownedClothing = [],
  ownedHairstyles = [],
  buttonLabel,
}) => {
  const [activeTab, setActiveTab] = useState<'skin' | 'face' | 'hair' | 'clothes' | 'accessories' | 'height'>('skin');

  const safeAvatar: CharacterAvatar = {
    gender: avatar?.gender || 'male',
    skinTone: avatar?.skinTone || '#8d5524',
    bodyBuild: avatar?.bodyBuild || 'average',
    faceShape: avatar?.faceShape || (avatar?.gender === 'female' ? 'heart' : 'oval'),
    eyeStyle: avatar?.eyeStyle || 'classic',
    eyebrowStyle: avatar?.eyebrowStyle || (avatar?.gender === 'female' ? 'arched' : 'natural'),
    noseStyle: avatar?.noseStyle || 'balanced',
    mouthStyle: avatar?.mouthStyle || (avatar?.gender === 'female' ? 'full' : 'confident'),
    hairstyle: avatar?.hairstyle || (avatar?.gender === 'female' ? 'braids' : 'fade'),
    hairColor: avatar?.hairColor || '#18181b',
    outfit: avatar?.outfit || (avatar?.gender === 'female' ? 'female_sundress' : 'peaky_dapper'),
    pants: avatar?.pants || (avatar?.gender === 'female' ? 'jeans' : 'slacks'),
    pantsColor: avatar?.pantsColor || '#1e293b',
    shoes: avatar?.shoes || (avatar?.gender === 'female' ? 'sandals' : 'sneakers'),
    shoesColor: avatar?.shoesColor || '#18181b',
    accessory: avatar?.accessory || 'none',
    height: avatar?.height || 'average',
  };

  const activeGender = safeAvatar.gender === 'female' ? 'female' : 'male';
  const starterClothes = useMemo(() => getStarterClothingForGender(activeGender), [activeGender]);
  const starterHairs = useMemo(() => getStarterHairstylesForGender(activeGender), [activeGender]);

  const unlockedClothingSet = useMemo(
    () => new Set([...starterClothes, ...ownedClothing]),
    [starterClothes, ownedClothing]
  );
  const unlockedHairSet = useMemo(
    () => new Set([...starterHairs, ...ownedHairstyles]),
    [starterHairs, ownedHairstyles]
  );

  // Separate curated hairstyles strictly by gender (or show all salon styles in wardrobeMode)
  const visibleHairstyles = useMemo(() => {
    return SALON_HAIRSTYLES_CATALOG.filter((h) => {
      if (wardrobeMode) {
        return h.gender === activeGender || h.gender === 'unisex';
      }
      return (h.gender === activeGender || h.gender === 'unisex') && h.isStarter;
    });
  }, [activeGender, wardrobeMode]);

  // Separate 5 curated starter outfits per gender + unlockable boutique items in wardrobeMode
  const visibleOutfits = useMemo(() => {
    return CLOTHING_SHOP_CATALOG.filter((c) => {
      if (wardrobeMode) {
        return c.gender === activeGender || c.gender === 'unisex';
      }
      return c.isStarter && c.gender === activeGender;
    });
  }, [activeGender, wardrobeMode]);

  const handleGenderChange = (nextGender: 'male' | 'female') => {
    if (nextGender === safeAvatar.gender) return;
    if (nextGender === 'female') {
      onChange({
        ...safeAvatar,
        gender: 'female',
        faceShape: 'heart',
        eyebrowStyle: 'arched',
        mouthStyle: 'full',
        hairstyle: 'braids',
        outfit: 'female_sundress',
        pants: 'wrapper',
        shoes: 'sandals',
        accessory: safeAvatar.accessory === 'peaky_cap' ? 'none' : safeAvatar.accessory,
      });
    } else {
      onChange({
        ...safeAvatar,
        gender: 'male',
        faceShape: 'oval',
        eyebrowStyle: 'natural',
        mouthStyle: 'confident',
        hairstyle: 'fade',
        outfit: 'peaky_dapper',
        pants: 'pinstripe',
        shoes: 'oxford',
      });
    }
  };

  const handleRandomize = () => {
    const skin = SKIN_TONES[Math.floor(Math.random() * SKIN_TONES.length)].id;
    const hColor = HAIR_COLORS[Math.floor(Math.random() * HAIR_COLORS.length)].id;
    const unlockedHairs = visibleHairstyles.filter((h) => h.isStarter || unlockedHairSet.has(h.id));
    const hair = (unlockedHairs[Math.floor(Math.random() * unlockedHairs.length)] || visibleHairstyles[0])
      .id as CharacterAvatar['hairstyle'];
    const unlockedFits = visibleOutfits.filter((o) => o.isStarter || unlockedClothingSet.has(o.outfitKey));
    const fit = unlockedFits[Math.floor(Math.random() * unlockedFits.length)] || visibleOutfits[0];
    const height = HEIGHT_OPTIONS[Math.floor(Math.random() * HEIGHT_OPTIONS.length)].id;

    onChange({
      ...safeAvatar,
      skinTone: skin,
      hairstyle: hair,
      hairColor: hColor,
      outfit: fit.outfitKey as CharacterAvatar['outfit'],
      pants: (fit.pantsStyle as CharacterAvatar['pants']) || 'slacks',
      shoes: (fit.shoesStyle as CharacterAvatar['shoes']) || 'sneakers',
      height,
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-4 text-zinc-100">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-zinc-800/80">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{wardrobeMode ? 'Citizen 3D Wardrobe & Salon' : 'Step 2: 3D Character & Identity Creator'}</span>
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {wardrobeMode ? `Style ${playerName || 'Citizen'} (Real-Time 3D)` : `Create Your Citizen: ${playerName || 'Citizen'}`}
          </h2>
        </div>

        <button
          type="button"
          onClick={handleRandomize}
          className="px-3.5 py-2 rounded-xl bg-zinc-800/90 hover:bg-zinc-700 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer self-start sm:self-auto"
        >
          <Shuffle className="w-3.5 h-3.5" />
          <span>Randomize 3D Look</span>
        </button>
      </div>

      {/* Main Layout: 3D Preview Stage Left + Categorized Controls Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left: Live 3D Turntable Stage */}
        <div className="lg:col-span-5 bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 flex flex-col items-center justify-between shadow-2xl relative overflow-hidden min-h-[380px]">
          <div className="w-full flex items-center justify-between z-10">
            <span className="text-[10px] font-mono text-zinc-400 bg-zinc-950/90 px-2.5 py-1 rounded-full border border-zinc-800">
              Interactive 3D · Drag to Spin
            </span>
            <div className="flex gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
              {(['male', 'female'] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => handleGenderChange(g)}
                  className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                    safeAvatar.gender === g
                      ? 'bg-emerald-500 text-black shadow-md'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {g === 'male' ? '♂ Male' : '♀ Female'}
                </button>
              ))}
            </div>
          </div>

          <div className="w-full h-[300px] sm:h-[340px] flex items-center justify-center relative my-1">
            <ThreeCharacterAvatar avatar={safeAvatar} size="full" interactive={true} />
          </div>

          <div className="w-full bg-zinc-950/90 border border-zinc-800/80 rounded-xl p-2.5 flex items-center justify-between text-[11px] font-mono z-10">
            <span className="text-zinc-400">
              Build: <strong className="text-white capitalize">{safeAvatar.bodyBuild}</strong> ·{' '}
              <strong className="text-white capitalize">{safeAvatar.height}</strong>
            </span>
            <span className="text-emerald-400 font-bold uppercase truncate max-w-[140px]">
              {SALON_HAIRSTYLES_CATALOG.find((h) => h.id === safeAvatar.hairstyle)?.name || safeAvatar.hairstyle}
            </span>
          </div>
        </div>

        {/* Right: Modular Customization Panels */}
        <div className="lg:col-span-7 bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-2xl">
          <div>
            {/* Navigation Tabs */}
            <div className="flex flex-wrap gap-1.5 pb-3 border-b border-zinc-800 mb-4">
              {[
                { id: 'skin', label: 'Skin', icon: Palette },
                { id: 'face', label: 'Face & Body', icon: Smile },
                { id: 'hair', label: 'Hairstyles', icon: Scissors },
                { id: 'clothes', label: 'Outfits', icon: Shirt },
                { id: 'accessories', label: 'Accessories', icon: Crown },
                { id: 'height', label: 'Height', icon: Ruler },
              ].map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-3 py-2 rounded-xl text-[11px] font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                      active
                        ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-950/50'
                        : 'bg-zinc-950/80 text-zinc-400 hover:text-white border border-zinc-800'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB: SKIN */}
            {activeTab === 'skin' && (
              <div className="space-y-3">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 block">
                  Select Complexion & Skin Undertone
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {SKIN_TONES.map((t) => {
                    const isSelected = safeAvatar.skinTone.toLowerCase() === t.id.toLowerCase();
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

            {/* TAB: FACE & BODY */}
            {activeTab === 'face' && (
              <div className="space-y-3 max-h-[330px] overflow-y-auto pr-1">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-emerald-400 block mb-1.5">
                    Body Build
                  </span>
                  <div className="grid grid-cols-4 gap-2">
                    {(['slim', 'average', 'athletic', 'broad'] as const).map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => onChange({ ...safeAvatar, bodyBuild: b })}
                        className={`py-2 rounded-xl border text-[11px] font-bold capitalize cursor-pointer ${
                          safeAvatar.bodyBuild === b
                            ? 'bg-emerald-500 text-black border-emerald-400'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-300'
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-emerald-400 block mb-1.5">
                    Face Structure
                  </span>
                  <div className="grid grid-cols-4 gap-2">
                    {(['oval', 'square', 'heart', 'round'] as const).map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => onChange({ ...safeAvatar, faceShape: f })}
                        className={`py-2 rounded-xl border text-[11px] font-bold capitalize cursor-pointer ${
                          safeAvatar.faceShape === f
                            ? 'bg-emerald-500 text-black border-emerald-400'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-300'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase text-zinc-400 block mb-1.5">
                      Eyes
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {(['classic', 'almond', 'sharp', 'bright'] as const).map((e) => (
                        <button
                          key={e}
                          type="button"
                          onClick={() => onChange({ ...safeAvatar, eyeStyle: e })}
                          className={`py-1.5 rounded-lg border text-[10px] font-bold capitalize cursor-pointer ${
                            safeAvatar.eyeStyle === e
                              ? 'bg-emerald-950 border-emerald-400 text-emerald-300'
                              : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                          }`}
                        >
                          {e}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase text-zinc-400 block mb-1.5">
                      Eyebrows
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {(['natural', 'arched', 'thick', 'sleek'] as const).map((eb) => (
                        <button
                          key={eb}
                          type="button"
                          onClick={() => onChange({ ...safeAvatar, eyebrowStyle: eb })}
                          className={`py-1.5 rounded-lg border text-[10px] font-bold capitalize cursor-pointer ${
                            safeAvatar.eyebrowStyle === eb
                              ? 'bg-emerald-950 border-emerald-400 text-emerald-300'
                              : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                          }`}
                        >
                          {eb}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase text-zinc-400 block mb-1.5">
                      Nose
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {(['balanced', 'sculpted', 'broad', 'button'] as const).map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => onChange({ ...safeAvatar, noseStyle: n })}
                          className={`py-1.5 rounded-lg border text-[10px] font-bold capitalize cursor-pointer ${
                            safeAvatar.noseStyle === n
                              ? 'bg-emerald-950 border-emerald-400 text-emerald-300'
                              : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase text-zinc-400 block mb-1.5">
                      Lips / Expression
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {(['neutral', 'smile', 'confident', 'full'] as const).map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => onChange({ ...safeAvatar, mouthStyle: m })}
                          className={`py-1.5 rounded-lg border text-[10px] font-bold capitalize cursor-pointer ${
                            safeAvatar.mouthStyle === m
                              ? 'bg-emerald-950 border-emerald-400 text-emerald-300'
                              : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: HAIRSTYLES */}
            {activeTab === 'hair' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                    {activeGender === 'female' ? 'Curated Women 3D Hairstyles' : 'Curated Men 3D Hairstyles'}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    {wardrobeMode ? 'Salon Styles Unlockable In-Game' : 'More Styles at Salon'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[245px] overflow-y-auto pr-1">
                  {visibleHairstyles.map((h) => {
                    const isOwned = !wardrobeMode || h.isStarter || unlockedHairSet.has(h.id);
                    const isSelected = safeAvatar.hairstyle === h.id;
                    return (
                      <button
                        key={h.id}
                        type="button"
                        disabled={!isOwned}
                        onClick={() =>
                          isOwned && onChange({ ...safeAvatar, hairstyle: h.id as CharacterAvatar['hairstyle'] })
                        }
                        className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between gap-1 ${
                          !isOwned
                            ? 'bg-zinc-950/40 border-zinc-800/60 opacity-65 cursor-not-allowed'
                            : isSelected
                            ? 'bg-emerald-950/90 border-emerald-500 ring-2 ring-emerald-500/40 cursor-pointer'
                            : 'bg-zinc-950/70 border-zinc-800 hover:border-zinc-700 cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className={`text-xs font-bold truncate ${isSelected ? 'text-emerald-300' : 'text-white'}`}>
                            {h.name}
                          </span>
                          {!isOwned ? (
                            <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          ) : isSelected ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          ) : null}
                        </div>
                        <p className="text-[10px] text-zinc-400 line-clamp-2">{h.desc}</p>
                        {!isOwned && (
                          <span className="text-[9px] font-mono text-amber-300 font-bold">
                            ₦{h.priceNGN.toLocaleString()} @ Salon
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-2 border-t border-zinc-800/80">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold block mb-2">
                    Hair Color
                  </span>
                  <div className="flex flex-wrap gap-2">
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

            {/* TAB: OUTFITS (5 STARTER OUTFITS PER GENDER + OWNED BOUTIQUE FITS) */}
            {activeTab === 'clothes' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                    {wardrobeMode
                      ? 'Wardrobe Collection (Owned & Store)'
                      : `5 ${activeGender === 'female' ? 'Women' : 'Men'} Starter Outfits`}
                  </span>
                  <span className="text-[10px] text-amber-400 font-mono">
                    {wardrobeMode ? 'Shop More at Boutique / Mall' : 'Designer Fits Sold In-Game'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
                  {visibleOutfits.map((fit) => {
                    const isOwned = !wardrobeMode || fit.isStarter || unlockedClothingSet.has(fit.outfitKey);
                    const isSelected = safeAvatar.outfit === fit.outfitKey;
                    return (
                      <button
                        key={fit.id}
                        type="button"
                        disabled={!isOwned}
                        onClick={() =>
                          isOwned &&
                          onChange({
                            ...safeAvatar,
                            outfit: fit.outfitKey as CharacterAvatar['outfit'],
                            pants: (fit.pantsStyle as CharacterAvatar['pants']) || safeAvatar.pants,
                            pantsColor: fit.secondaryColor,
                            shoes: (fit.shoesStyle as CharacterAvatar['shoes']) || safeAvatar.shoes,
                          })
                        }
                        className={`p-3 rounded-xl border flex items-center gap-3 text-left transition-all ${
                          !isOwned
                            ? 'bg-zinc-950/40 border-zinc-800/60 opacity-65 cursor-not-allowed'
                            : isSelected
                            ? 'bg-emerald-950/90 border-emerald-500 ring-2 ring-emerald-500/50 cursor-pointer'
                            : 'bg-zinc-950/70 border-zinc-800 hover:border-zinc-700 cursor-pointer'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-xl border border-white/15 shrink-0 flex items-center justify-center shadow-inner relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${fit.primaryColor}, ${fit.secondaryColor})` }}>
                          <span className="w-3 h-3 rounded-full border border-white/40" style={{ backgroundColor: fit.accentColor }} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[10px] font-mono text-emerald-400 uppercase font-black">
                              {fit.category}
                            </span>
                            {!isOwned ? (
                              <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            ) : isSelected ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            ) : null}
                          </div>
                          <p className={`text-xs font-bold mt-0.5 truncate ${isSelected ? 'text-white' : 'text-zinc-200'}`}>
                            {fit.name}
                          </p>
                          <p className="text-[10px] text-zinc-400 line-clamp-1">
                            {isOwned ? fit.desc : `Locked · ₦${fit.priceNGN.toLocaleString()} @ Boutique`}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB: ACCESSORIES */}
            {activeTab === 'accessories' && (
              <div className="space-y-3">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 block">
                  Eyewear, Chains, Watches & Caps
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {ACCESSORY_OPTIONS.map((acc) => {
                    const isOwned = !wardrobeMode || acc.starter || unlockedClothingSet.has(acc.id);
                    const isSelected = safeAvatar.accessory === acc.id;
                    return (
                      <button
                        key={acc.id}
                        type="button"
                        disabled={!isOwned}
                        onClick={() => isOwned && onChange({ ...safeAvatar, accessory: acc.id })}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          !isOwned
                            ? 'bg-zinc-950/40 border-zinc-800/60 opacity-60 cursor-not-allowed'
                            : isSelected
                            ? 'bg-emerald-950/90 border-emerald-500 ring-2 ring-emerald-500/40 cursor-pointer'
                            : 'bg-zinc-950/70 border-zinc-800 hover:border-zinc-700 cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-bold text-white truncate">{acc.label}</span>
                          {!isOwned && <Lock className="w-3 h-3 text-amber-400 shrink-0" />}
                        </div>
                        <span className="text-[10px] text-zinc-400 font-mono">
                          {isOwned ? (isSelected ? 'Equipped' : 'Owned') : 'Boutique Luxury'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB: HEIGHT */}
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
                        onClick={() => onChange({ ...safeAvatar, height: h.id })}
                        className={`p-4 rounded-xl border flex flex-col items-center justify-between gap-3 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-950/90 border-emerald-500 ring-2 ring-emerald-500/50 shadow-md'
                            : 'bg-zinc-950/70 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/50'
                        }`}
                      >
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
                                ? 'h-16'
                                : 'h-20'
                            }`}
                          />
                        </div>
                        <div className="text-center">
                          <p className={`text-xs font-black capitalize ${isSelected ? 'text-emerald-300' : 'text-zinc-200'}`}>
                            {h.label}
                          </p>
                          <p className="text-[10px] text-zinc-400 mt-0.5 font-mono">{h.metric}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-zinc-800 mt-4">
            <button
              type="button"
              onClick={onProceed}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:brightness-110 text-black font-black text-sm rounded-xl shadow-lg shadow-emerald-950/60 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>{buttonLabel || (wardrobeMode ? 'Save Style to Citizen Profile' : 'Confirm Avatar & Pick State of Origin')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
