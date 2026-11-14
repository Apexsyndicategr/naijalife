/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CharacterAvatar } from '../types/game';
import { ThreeCharacterAvatar } from './ThreeCharacterAvatar';

interface CharacterRendererProps {
  avatar: CharacterAvatar;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showBackground?: boolean;
  fullBody?: boolean;
  isWalking?: boolean;
  className?: string;
  use3D?: boolean;
}

export const CharacterRenderer: React.FC<CharacterRendererProps> = ({
  avatar,
  size = 'md',
  showBackground = true,
  fullBody,
  isWalking = false,
  className = '',
  use3D = false,
}) => {
  const sizeMap = {
    sm: 'w-10 h-10',
    md: 'w-20 h-20',
    lg: 'w-36 h-36',
    xl: 'w-56 h-56',
    full: 'w-48 h-80 sm:w-56 sm:h-96',
  };

  const safeAvatar: CharacterAvatar = avatar || {
    gender: 'male',
    skinTone: '#8d5524',
    hairstyle: 'peaky_cap',
    hairColor: '#18181b',
    outfit: 'corporate',
    pants: 'slacks',
    shoes: 'loafers',
    accessory: 'none',
  };

  // If full body / xl or explicitly requested, use authentic Three.js 3D character!
  if (use3D || size === 'full') {
    return (
      <div
        className={`relative rounded-2xl flex items-center justify-center overflow-hidden shrink-0 select-none ${
          sizeMap[size] || 'w-48 h-80 sm:w-56 sm:h-96'
        } ${
          showBackground
            ? 'bg-gradient-to-b from-zinc-800 via-zinc-900 to-zinc-950 border border-zinc-700/60 shadow-lg'
            : ''
        } ${className}`}
      >
        <ThreeCharacterAvatar avatar={safeAvatar} size={size} interactive={true} />
      </div>
    );
  }

  // Default: if size is 'sm', use portrait bust mode so face is crisp and large in HUD
  const shouldRenderFullBody = fullBody !== undefined ? fullBody : size !== 'sm';

  const skinColor = safeAvatar.skinTone || '#8d5524';
  const hairColor = safeAvatar.hairColor || '#1c1917';
  const pantsColor =
    safeAvatar.pantsColor ||
    (safeAvatar.pants === 'jeans'
      ? '#1e3a8a'
      : safeAvatar.pants === 'sweatpants'
      ? '#374151'
      : safeAvatar.pants === 'wrapper'
      ? '#9a3412'
      : '#1e293b');
  const shoesColor =
    safeAvatar.shoesColor ||
    (safeAvatar.shoes === 'sneakers'
      ? '#ffffff'
      : safeAvatar.shoes === 'loafers' || safeAvatar.shoes === 'oxford'
      ? '#18181b'
      : safeAvatar.shoes === 'sandals'
      ? '#451a03'
      : '#18181b');

  const isDapper =
    safeAvatar.outfit === 'corporate' ||
    safeAvatar.outfit === 'peaky_dapper' ||
    safeAvatar.outfit === 'designer';

  return (
    <div
      className={`relative rounded-2xl flex items-center justify-center overflow-hidden shrink-0 select-none ${
        sizeMap[size]
      } ${
        showBackground
          ? 'bg-gradient-to-b from-zinc-800 via-zinc-900 to-zinc-950 border border-zinc-700/60 shadow-lg'
          : ''
      } ${className}`}
    >
      {showBackground && (
        <>
          <div className="absolute inset-0 bg-radial from-emerald-500/15 via-transparent to-transparent opacity-80" />
          <div className="absolute bottom-0 inset-x-0 h-1/3 bg-gradient-to-t from-emerald-950/40 to-transparent pointer-events-none" />
        </>
      )}

      {shouldRenderFullBody ? (
        <svg
          viewBox="0 0 120 230"
          className="w-full h-full drop-shadow-md relative z-10"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <style>{`
            @keyframes walkLegL { 0%, 100% { transform: rotate(-18deg); } 50% { transform: rotate(18deg); } }
            @keyframes walkLegR { 0%, 100% { transform: rotate(18deg); } 50% { transform: rotate(-18deg); } }
            @keyframes walkArmL { 0%, 100% { transform: rotate(18deg); } 50% { transform: rotate(-18deg); } }
            @keyframes walkArmR { 0%, 100% { transform: rotate(-18deg); } 50% { transform: rotate(18deg); } }
            @keyframes walkBob { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-3px); } }
          `}</style>

          {/* Ground shadow */}
          <ellipse cx="60" cy="222" rx="36" ry="6" fill="#000000" fillOpacity="0.4" />

          {/* Character height scaling group */}
          <g
            style={{
              transformOrigin: '60px 220px',
              transform:
                safeAvatar.height === 'short'
                  ? 'scale(0.92, 0.90)'
                  : safeAvatar.height === 'tall'
                  ? 'scale(1.02, 1.05)'
                  : safeAvatar.height === 'towering'
                  ? 'scale(1.04, 1.10)'
                  : 'scale(1, 1)',
            }}
          >
            {/* Legs & Pants */}
            <g
              style={{
                transformOrigin: '50px 136px',
                animation: isWalking ? 'walkLegL 0.42s ease-in-out infinite' : 'none',
              }}
            >
              <rect x="44" y="136" width="13" height="64" rx="5" fill={pantsColor} />
              {/* Left Shoe */}
              <rect x="40" y="198" width="18" height="14" rx="4" fill={shoesColor} />
              <rect x="38" y="206" width="7" height="6" rx="2" fill="#334155" />
            </g>

            <g
              style={{
                transformOrigin: '70px 136px',
                animation: isWalking ? 'walkLegR 0.42s ease-in-out infinite' : 'none',
              }}
            >
              <rect x="63" y="136" width="13" height="64" rx="5" fill={pantsColor} />
              {/* Right Shoe */}
              <rect x="62" y="198" width="18" height="14" rx="4" fill={shoesColor} />
              <rect x="75" y="206" width="7" height="6" rx="2" fill="#334155" />
            </g>

            {/* Arms & Hands */}
            <g
              style={{
                transformOrigin: '28px 80px',
                animation: isWalking ? 'walkArmL 0.42s ease-in-out infinite' : 'none',
              }}
            >
              <rect
                x="22"
                y="80"
                width="12"
                height="54"
                rx="5"
                fill={
                  isDapper || safeAvatar.outfit === 'casual'
                    ? '#f8fafc'
                    : safeAvatar.outfit === 'agbada' || safeAvatar.outfit === 'streetwear'
                    ? '#047857'
                    : safeAvatar.outfit === 'trad_senator'
                    ? '#475569'
                    : safeAvatar.outfit === 'ankara'
                    ? '#ea580c'
                    : skinColor
                }
              />
              <circle cx="28" cy="138" r="6" fill={skinColor} />
            </g>

            <g
              style={{
                transformOrigin: '92px 80px',
                animation: isWalking ? 'walkArmR 0.42s ease-in-out infinite' : 'none',
              }}
            >
              <rect
                x="86"
                y="80"
                width="12"
                height="54"
                rx="5"
                fill={
                  isDapper || safeAvatar.outfit === 'casual'
                    ? '#f8fafc'
                    : safeAvatar.outfit === 'agbada' || safeAvatar.outfit === 'streetwear'
                    ? '#047857'
                    : safeAvatar.outfit === 'trad_senator'
                    ? '#475569'
                    : safeAvatar.outfit === 'ankara'
                    ? '#ea580c'
                    : skinColor
                }
              />
              <circle cx="92" cy="138" r="6" fill={skinColor} />
            </g>

            {/* Torso & Shirt / Waistcoat */}
            <g>
              {isDapper ? (
                <>
                  {/* White shirt base */}
                  <path d="M36 78 L60 74 L84 78 L80 138 L40 138 Z" fill="#f8fafc" />
                  {/* Grey tweed waistcoat / vest */}
                  <path d="M38 82 L50 88 L60 88 L70 88 L82 82 L78 136 L60 142 L42 136 Z" fill="#64748b" />
                  {/* Red silk necktie */}
                  <polygon points="58,74 62,74 61,104 59,104" fill="#991b1b" />
                  {/* Vest buttons */}
                  <circle cx="60" cy="100" r="1.5" fill="#18181b" />
                  <circle cx="60" cy="112" r="1.5" fill="#18181b" />
                  <circle cx="60" cy="124" r="1.5" fill="#18181b" />
                </>
              ) : safeAvatar.outfit === 'trad_senator' ? (
                <>
                  <path d="M36 78 L60 74 L84 78 L80 138 L40 138 Z" fill="#475569" />
                  <rect x="57" y="75" width="6" height="22" fill="#1e293b" />
                </>
              ) : safeAvatar.outfit === 'ankara' ? (
                <>
                  <path d="M36 78 L60 74 L84 78 L80 138 L40 138 Z" fill="#ea580c" />
                  <path d="M40 94 Q60 102 80 94" stroke="#facc15" strokeWidth="2.5" fill="none" />
                  <path d="M40 112 Q60 120 80 112" stroke="#0284c7" strokeWidth="2.5" fill="none" />
                </>
              ) : safeAvatar.outfit === 'agbada' ? (
                <>
                  <path d="M34 76 L60 72 L86 76 L82 142 L38 142 Z" fill="#065f46" />
                  <rect x="56" y="74" width="8" height="42" fill="#f59e0b" />
                </>
              ) : safeAvatar.outfit === 'streetwear' ? (
                <path d="M36 78 L60 74 L84 78 L80 138 L40 138 Z" fill="#047857" />
              ) : (
                <path d="M36 78 L60 74 L84 78 L80 138 L40 138 Z" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
              )}
            </g>

            {/* Neck & Head */}
            <rect x="54" y="62" width="12" height="14" rx="4" fill={skinColor} />
            <rect x="42" y="24" width="36" height="40" rx="14" fill={skinColor} />

            {/* Eyes */}
            <circle cx="52" cy="42" r="2.8" fill="#ffffff" />
            <circle cx="52" cy="42" r="1.6" fill="#09090b" />
            <circle cx="68" cy="42" r="2.8" fill="#ffffff" />
            <circle cx="68" cy="42" r="1.6" fill="#09090b" />

            {/* Eyebrows */}
            <line x1="48" y1="36" x2="56" y2="36" stroke={hairColor} strokeWidth="1.5" />
            <line x1="64" y1="36" x2="72" y2="36" stroke={hairColor} strokeWidth="1.5" />

            {/* Lips */}
            <path d="M54 54 Q60 58 66 54" stroke="#7f1d1d" strokeWidth="2" strokeLinecap="round" fill="none" />

            {/* Hairstyles in Full Body */}
            {(safeAvatar.hairstyle === 'peaky_cap' || safeAvatar.accessory === 'peaky_cap') && (
              <g>
                <path d="M36 28 C36 14 50 10 70 12 C78 13 84 17 84 24 L32 28 Z" fill="#475569" />
                <path d="M30 28 Q60 25 84 24 L88 28 Q60 30 28 28 Z" fill="#334155" />
                <circle cx="60" cy="13" r="2" fill="#334155" />
              </g>
            )}

            {safeAvatar.hairstyle === 'afro' && (
              <circle cx="60" cy="22" r="20" fill={hairColor} opacity="0.95" />
            )}

            {safeAvatar.hairstyle === 'fade' && (
              <path d="M40 28 Q60 14 80 28 Z" fill={hairColor} />
            )}

            {safeAvatar.hairstyle === 'cornrows' && (
              <g>
                <line x1="50" y1="18" x2="50" y2="28" stroke={hairColor} strokeWidth="3" strokeLinecap="round" />
                <line x1="56" y1="16" x2="56" y2="28" stroke={hairColor} strokeWidth="3" strokeLinecap="round" />
                <line x1="64" y1="16" x2="64" y2="28" stroke={hairColor} strokeWidth="3" strokeLinecap="round" />
                <line x1="70" y1="18" x2="70" y2="28" stroke={hairColor} strokeWidth="3" strokeLinecap="round" />
              </g>
            )}

            {safeAvatar.hairstyle === 'waves' && (
              <g>
                <path d="M40 28 Q60 14 80 28 Z" fill={hairColor} />
                <path d="M44 22 Q60 18 76 22" stroke="#ffffff" strokeWidth="0.8" opacity="0.5" fill="none" />
              </g>
            )}

            {(safeAvatar.hairstyle === 'braids' || safeAvatar.hairstyle === 'dreads' || safeAvatar.hairstyle === 'locs') && (
              <g>
                <path d="M40 28 Q60 14 80 28 Z" fill={hairColor} />
                <line x1="39" y1="26" x2="35" y2="54" stroke={hairColor} strokeWidth="3" strokeLinecap="round" />
                <line x1="81" y1="26" x2="85" y2="54" stroke={hairColor} strokeWidth="3" strokeLinecap="round" />
              </g>
            )}

            {safeAvatar.hairstyle === 'gele' && (
              <g>
                <path d="M32 24 Q60 -4 88 24 Q94 18 84 8 Q60 -10 36 8 Q26 18 32 24 Z" fill="#b91c1c" stroke="#facc15" strokeWidth="2" />
              </g>
            )}

            {safeAvatar.accessory === 'fila_cap' && (
              <g>
                <path d="M40 24 Q60 12 80 24 L84 18 Q60 6 36 18 Z" fill="#047857" stroke="#facc15" strokeWidth="1.5" />
              </g>
            )}

            {(safeAvatar.accessory === 'sunglasses' || safeAvatar.accessory === 'designer_shades') && (
              <g>
                <rect x="46" y="38" width="12" height="9" rx="2" fill="#09090b" stroke="#fbbf24" strokeWidth="1" />
                <rect x="62" y="38" width="12" height="9" rx="2" fill="#09090b" stroke="#fbbf24" strokeWidth="1" />
                <line x1="58" y1="42" x2="62" y2="42" stroke="#fbbf24" strokeWidth="1.5" />
              </g>
            )}
          </g>
        </svg>
      ) : (
        /* =========================================================================
           PORTRAIT BUST VIEW (FOR BOTTOM-LEFT HUD & COMPACT SLOTS)
           Carefully framed so the customized face, hairstyle & dapper vest pop!
           ========================================================================= */
        <svg
          viewBox="0 0 120 120"
          className="w-full h-full drop-shadow-md relative z-10"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Subtle base shadow */}
          <ellipse cx="60" cy="116" rx="36" ry="6" fill="#000000" fillOpacity="0.4" />

          {/* Shoulders & Upper Chest */}
          {isDapper ? (
            <g>
              {/* White collared shirt */}
              <path d="M22 88 L38 72 L60 76 L82 72 L98 88 L92 120 L28 120 Z" fill="#f8fafc" />
              {/* Grey tweed waistcoat / vest */}
              <path d="M26 92 L42 78 L60 84 L78 78 L94 92 L88 120 L32 120 Z" fill="#64748b" />
              {/* Crimson red silk tie */}
              <polygon points="57,74 63,74 62,106 58,106" fill="#991b1b" />
              {/* Vest buttons */}
              <circle cx="60" cy="94" r="1.8" fill="#18181b" />
              <circle cx="60" cy="108" r="1.8" fill="#18181b" />
            </g>
          ) : safeAvatar.outfit === 'trad_senator' ? (
            <g>
              <path d="M22 86 L38 72 L60 76 L82 72 L98 86 L92 120 L28 120 Z" fill="#475569" />
              <rect x="57" y="74" width="6" height="22" fill="#1e293b" />
            </g>
          ) : safeAvatar.outfit === 'ankara' ? (
            <g>
              <path d="M22 86 L38 72 L60 76 L82 72 L98 86 L92 120 L28 120 Z" fill="#ea580c" />
              <path d="M30 96 Q60 104 90 96" stroke="#facc15" strokeWidth="2.5" fill="none" />
              <path d="M30 110 Q60 118 90 110" stroke="#0284c7" strokeWidth="2.5" fill="none" />
            </g>
          ) : safeAvatar.outfit === 'agbada' ? (
            <g>
              <path d="M22 86 L38 72 L60 76 L82 72 L98 86 L92 120 L28 120 Z" fill="#065f46" />
              <rect x="56" y="74" width="8" height="42" fill="#f59e0b" />
            </g>
          ) : safeAvatar.outfit === 'streetwear' ? (
            <path d="M24 88 L38 72 L60 76 L82 72 L96 88 L90 120 L30 120 Z" fill="#047857" />
          ) : (
            <path d="M24 88 L38 72 L60 76 L82 72 L96 88 L90 120 L30 120 Z" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
          )}

          {/* Neck */}
          <rect x="52" y="60" width="16" height="16" rx="4" fill={skinColor} />

          {/* Head & Cranium */}
          <rect x="40" y="24" width="40" height="44" rx="16" fill={skinColor} />

          {/* Ears with Lobes */}
          <ellipse cx="38" cy="46" rx="3" ry="6" fill={skinColor} />
          <ellipse cx="82" cy="46" rx="3" ry="6" fill={skinColor} />

          {/* Expressive Eyes with Highlights */}
          <circle cx="50" cy="44" r="3.2" fill="#ffffff" />
          <circle cx="50" cy="44" r="1.8" fill="#09090b" />
          <circle cx="51" cy="43" r="0.8" fill="#ffffff" />

          <circle cx="70" cy="44" r="3.2" fill="#ffffff" />
          <circle cx="70" cy="44" r="1.8" fill="#09090b" />
          <circle cx="71" cy="43" r="0.8" fill="#ffffff" />

          {/* Eyebrows */}
          <line x1="45" y1="37" x2="55" y2="37" stroke={hairColor} strokeWidth="2" strokeLinecap="round" />
          <line x1="65" y1="37" x2="75" y2="37" stroke={hairColor} strokeWidth="2" strokeLinecap="round" />

          {/* Defined Nose */}
          <path d="M60 42 L58 50 L62 50" stroke="#451a03" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.6" />

          {/* Lips */}
          <path d="M53 58 Q60 63 67 58" stroke="#7f1d1d" strokeWidth="2.5" strokeLinecap="round" fill="none" />

          {/* Hairstyles in Portrait Bust */}
          {(safeAvatar.hairstyle === 'peaky_cap' || safeAvatar.accessory === 'peaky_cap') && (
            <g>
              {/* Slate/charcoal tweed flat cap dome */}
              <path d="M34 30 C34 12 50 8 72 10 C82 11 88 16 88 24 L28 30 Z" fill="#475569" />
              {/* Curved visor brim resting above brow */}
              <path d="M26 30 Q60 27 88 25 L92 30 Q60 33 24 30 Z" fill="#334155" />
              <circle cx="62" cy="11" r="2.5" fill="#334155" />
            </g>
          )}

          {safeAvatar.hairstyle === 'afro' && (
            <circle cx="60" cy="22" r="22" fill={hairColor} opacity="0.95" />
          )}

          {safeAvatar.hairstyle === 'fade' && (
            <g>
              <path d="M38 30 Q60 14 82 30 Z" fill={hairColor} />
              <rect x="38" y="28" width="4" height="12" rx="1" fill={hairColor} />
              <rect x="78" y="28" width="4" height="12" rx="1" fill={hairColor} />
            </g>
          )}

          {safeAvatar.hairstyle === 'cornrows' && (
            <g>
              <line x1="48" y1="18" x2="48" y2="30" stroke={hairColor} strokeWidth="3.2" strokeLinecap="round" />
              <line x1="56" y1="16" x2="56" y2="30" stroke={hairColor} strokeWidth="3.2" strokeLinecap="round" />
              <line x1="64" y1="16" x2="64" y2="30" stroke={hairColor} strokeWidth="3.2" strokeLinecap="round" />
              <line x1="72" y1="18" x2="72" y2="30" stroke={hairColor} strokeWidth="3.2" strokeLinecap="round" />
            </g>
          )}

          {safeAvatar.hairstyle === 'waves' && (
            <g>
              <path d="M38 30 Q60 14 82 30 Z" fill={hairColor} />
              <path d="M43 24 Q60 20 77 24" stroke="#ffffff" strokeWidth="1" opacity="0.6" fill="none" />
              <path d="M45 27 Q60 23 75 27" stroke="#ffffff" strokeWidth="1" opacity="0.6" fill="none" />
            </g>
          )}

          {(safeAvatar.hairstyle === 'braids' || safeAvatar.hairstyle === 'dreads' || safeAvatar.hairstyle === 'locs') && (
            <g>
              <path d="M38 30 Q60 14 82 30 Z" fill={hairColor} />
              <line x1="36" y1="28" x2="32" y2="58" stroke={hairColor} strokeWidth="3.5" strokeLinecap="round" />
              <line x1="42" y1="26" x2="38" y2="64" stroke={hairColor} strokeWidth="3.5" strokeLinecap="round" />
              <line x1="78" y1="26" x2="82" y2="64" stroke={hairColor} strokeWidth="3.5" strokeLinecap="round" />
              <line x1="84" y1="28" x2="88" y2="58" stroke={hairColor} strokeWidth="3.5" strokeLinecap="round" />
            </g>
          )}

          {safeAvatar.hairstyle === 'buzz' && (
            <path d="M39 30 Q60 18 81 30 Z" fill={hairColor} />
          )}

          {safeAvatar.hairstyle === 'gele' && (
            <g>
              <path d="M30 24 Q60 -6 90 24 Q96 18 86 8 Q60 -12 34 8 Q24 18 30 24 Z" fill="#b91c1c" stroke="#facc15" strokeWidth="2" />
            </g>
          )}

          {safeAvatar.accessory === 'fila_cap' && (
            <g>
              <path d="M38 24 Q60 10 82 24 L86 18 Q60 4 34 18 Z" fill="#047857" stroke="#facc15" strokeWidth="1.5" />
            </g>
          )}

          {(safeAvatar.accessory === 'sunglasses' || safeAvatar.accessory === 'designer_shades') && (
            <g>
              <rect x="44" y="40" width="13" height="9" rx="2" fill="#09090b" stroke="#fbbf24" strokeWidth="1" />
              <rect x="63" y="40" width="13" height="9" rx="2" fill="#09090b" stroke="#fbbf24" strokeWidth="1" />
              <line x1="57" y1="44" x2="63" y2="44" stroke="#fbbf24" strokeWidth="1.5" />
            </g>
          )}

          {(safeAvatar.accessory === 'gold_chain' || safeAvatar.accessory === 'diamond_chain') && (
            <path
              d="M48 76 Q60 88 72 76"
              stroke={safeAvatar.accessory === 'diamond_chain' ? '#e2e8f0' : '#f59e0b'}
              strokeWidth="2.5"
              fill="none"
            />
          )}

          {safeAvatar.accessory === 'coral_beads' && (
            <path d="M46 76 Q60 90 74 76" stroke="#dc2626" strokeWidth="3.5" fill="none" />
          )}
        </svg>
      )}
    </div>
  );
};
