/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CharacterAvatar } from '../types/game';

interface CharacterRendererProps {
  avatar: CharacterAvatar;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showBackground?: boolean;
  fullBody?: boolean;
  isWalking?: boolean;
  className?: string;
}

export const CharacterRenderer: React.FC<CharacterRendererProps> = ({
  avatar,
  size = 'md',
  showBackground = true,
  fullBody = true,
  isWalking = false,
  className = '',
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
    hairstyle: 'fade',
    hairColor: '#18181b',
    outfit: 'streetwear',
    pants: 'jeans',
    shoes: 'sneakers',
    accessory: 'none',
  };

  const skinColor = safeAvatar.skinTone || '#8d5524';
  const hairColor = safeAvatar.hairColor || '#1c1917';
  const pantsColor = safeAvatar.pantsColor || (safeAvatar.pants === 'jeans' ? '#1e3a8a' : safeAvatar.pants === 'sweatpants' ? '#374151' : safeAvatar.pants === 'wrapper' ? '#9a3412' : '#18181b');
  const shoesColor = safeAvatar.shoesColor || (safeAvatar.shoes === 'sneakers' ? '#ffffff' : safeAvatar.shoes === 'loafers' ? '#78350f' : safeAvatar.shoes === 'sandals' ? '#451a03' : '#18181b');

  return (
    <div
      className={`relative rounded-2xl flex items-center justify-center overflow-hidden shrink-0 select-none ${
        size === 'full' ? 'w-48 h-80 sm:w-56 sm:h-96' : sizeMap[size]
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

      {fullBody ? (
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
          <g style={{ transformOrigin: '60px 220px', transform: safeAvatar.height === 'short' ? 'scale(0.92, 0.90)' : safeAvatar.height === 'tall' ? 'scale(1.02, 1.05)' : safeAvatar.height === 'towering' ? 'scale(1.04, 1.10)' : 'scale(1, 1)' }}>
            {/* ========================================================
                LEGS & PANTS (Full Body with stepping rotation)
                ======================================================== */}
          {/* Left Leg & Shoe Group */}
          <g style={{ transformOrigin: '50px 136px', animation: isWalking ? 'walkLegL 0.42s ease-in-out infinite' : 'none' }}>
            <rect
              x="44"
              y="136"
              width="13"
              height="64"
              rx="5"
              fill={pantsColor}
            />
            {/* Left Foot / Shoe */}
            <rect x="40" y="198" width="18" height="14" rx="4" fill={shoesColor} />
            <path d="M40 210 L58 210" stroke="#fbbf24" strokeWidth="2" opacity="0.6" />
            <rect x="38" y="206" width="7" height="6" rx="2" fill="#e2e8f0" />
          </g>

          {/* Right Leg & Shoe Group */}
          <g style={{ transformOrigin: '70px 136px', animation: isWalking ? 'walkLegR 0.42s ease-in-out infinite' : 'none' }}>
            <rect
              x="63"
              y="136"
              width="13"
              height="64"
              rx="5"
              fill={pantsColor}
            />
            {/* Right Foot / Shoe */}
            <rect x="62" y="198" width="18" height="14" rx="4" fill={shoesColor} />
            <path d="M62 210 L80 210" stroke="#fbbf24" strokeWidth="2" opacity="0.6" />
            <rect x="75" y="206" width="7" height="6" rx="2" fill="#e2e8f0" />
          </g>

          {/* Wrapper Skirt / Traditional Flap if wrapper */}
          {safeAvatar.pants === 'wrapper' && (
            <path
              d="M38 136 L82 136 L86 195 L34 195 Z"
              fill={pantsColor}
              stroke="#fbbf24"
              strokeWidth="2"
            />
          )}

          {/* ========================================================
              ARMS & HANDS (with natural swing)
              ======================================================== */}
          {/* Left Arm Group */}
          <g style={{ transformOrigin: '28px 80px', animation: isWalking ? 'walkArmL 0.42s ease-in-out infinite' : 'none' }}>
            <rect x="22" y="80" width="12" height="54" rx="5" fill={safeAvatar.outfit === 'agbada' ? '#065f46' : safeAvatar.outfit === 'corporate' ? '#1e293b' : skinColor} />
            <circle cx="28" cy="138" r="6" fill={skinColor} />
            {(safeAvatar.accessory === 'rolex_watch' || safeAvatar.accessory === 'diamond_chain') && (
              <rect x="23" y="130" width="10" height="4" rx="1" fill="#f59e0b" stroke="#78350f" strokeWidth="1" />
            )}
          </g>

          {/* Right Arm Group */}
          <g style={{ transformOrigin: '92px 80px', animation: isWalking ? 'walkArmR 0.42s ease-in-out infinite' : 'none' }}>
            <rect x="86" y="80" width="12" height="54" rx="5" fill={safeAvatar.outfit === 'agbada' ? '#065f46' : safeAvatar.outfit === 'corporate' ? '#1e293b' : skinColor} />
            <circle cx="92" cy="138" r="6" fill={skinColor} />
          </g>

          {/* ========================================================
              TORSO / UPPER OUTFIT & HEAD (with walking bobbing)
              ======================================================== */}
          <g style={{ animation: isWalking ? 'walkBob 0.21s ease-in-out infinite' : 'none' }}>
          {safeAvatar.outfit === 'agbada' && (
            <g id="outfit-agbada-full">
              {/* Grand sweeping Agbada gown */}
              <path
                d="M16 82 L38 64 L60 72 L82 64 L104 82 L98 152 L22 152 Z"
                fill="#065f46"
              />
              {/* Embroidery Placket */}
              <path d="M48 68 L72 68 L68 140 L52 140 Z" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />
              <line x1="60" y1="70" x2="60" y2="136" stroke="#78350f" strokeWidth="2" strokeDasharray="3 3" />
            </g>
          )}

          {safeAvatar.outfit === 'ankara' && (
            <g id="outfit-ankara-full">
              <path d="M28 78 L38 65 L60 72 L82 65 L92 78 L88 142 L32 142 Z" fill="#ea580c" />
              <path d="M36 82 Q60 92 84 82" stroke="#facc15" strokeWidth="3" />
              <path d="M34 102 Q60 112 86 102" stroke="#0284c7" strokeWidth="3" />
              <path d="M36 122 Q60 132 84 122" stroke="#facc15" strokeWidth="3" />
            </g>
          )}

          {safeAvatar.outfit === 'corporate' && (
            <g id="outfit-corporate-full">
              <path d="M30 76 L40 64 L60 70 L80 64 L90 76 L86 142 L34 142 Z" fill="#1e293b" />
              <polygon points="52,68 68,68 60,92" fill="#f8fafc" />
              <polygon points="58,69 62,69 63,110 60,118 57,110" fill="#dc2626" />
              <path d="M40 64 L50 88 L44 92 L32 76 Z" fill="#0f172a" />
              <path d="M80 64 L70 88 L76 92 L88 76 Z" fill="#0f172a" />
            </g>
          )}

          {safeAvatar.outfit === 'trad_senator' && (
            <g id="outfit-trad-senator-full">
              {/* Senator tunic long cut */}
              <path d="M30 76 L40 65 L60 71 L80 65 L90 76 L87 154 L33 154 Z" fill="#334155" />
              {/* Geometric chest embroidery */}
              <rect x="52" y="72" width="16" height="42" fill="#64748b" stroke="#e2e8f0" strokeWidth="1" />
              <line x1="60" y1="74" x2="60" y2="112" stroke="#f8fafc" strokeWidth="1.5" />
            </g>
          )}

          {safeAvatar.outfit === 'streetwear' && (
            <g id="outfit-streetwear-full">
              <path d="M26 78 L38 65 L60 72 L82 65 L94 78 L90 142 L30 142 Z" fill="#18181b" />
              <path d="M44 68 Q60 78 76 68" stroke="#27272a" strokeWidth="4" />
              <circle cx="60" cy="94" r="8" fill="#10b981" />
              <text x="60" y="97" fontSize="7" fontWeight="bold" textAnchor="middle" fill="#ffffff">
                NAIJA
              </text>
              <path d="M42 108 L78 108 L76 132 L44 132 Z" fill="#27272a" />
            </g>
          )}

          {safeAvatar.outfit === 'designer' && (
            <g id="outfit-designer-full">
              <path d="M28 78 L38 65 L60 72 L82 65 L92 78 L88 140 L32 140 Z" fill="#4c0519" />
              <line x1="38" y1="65" x2="82" y2="140" stroke="#f43f5e" strokeWidth="2" opacity="0.4" />
              <text x="60" y="96" fontSize="8" fontWeight="900" textAnchor="middle" fill="#fbbf24">
                BALR
              </text>
            </g>
          )}

          {(!safeAvatar.outfit || safeAvatar.outfit === 'casual') && (
            <g id="outfit-casual-full">
              <path d="M30 78 L40 65 L60 72 L80 65 L90 78 L86 140 L34 140 Z" fill="#047857" />
              <ellipse cx="60" cy="69" rx="14" ry="4" fill="#065f46" />
            </g>
          )}

          {/* Neck */}
          <rect x="52" y="52" width="16" height="15" rx="3" fill={skinColor} />

          {/* Jewelry & Chains */}
          {(safeAvatar.accessory === 'gold_chain' || safeAvatar.accessory === 'designer_shades') && (
            <path d="M46 62 Q60 80 74 62" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
          )}
          {safeAvatar.accessory === 'diamond_chain' && (
            <path d="M44 62 Q60 84 76 62" stroke="#38bdf8" strokeWidth="3.5" strokeDasharray="3 2" />
          )}
          {safeAvatar.accessory === 'coral_beads' && (
            <g>
              <circle cx="48" cy="64" r="3.5" fill="#ea580c" />
              <circle cx="53" cy="68" r="3.5" fill="#ea580c" />
              <circle cx="60" cy="71" r="4" fill="#dc2626" />
              <circle cx="67" cy="68" r="3.5" fill="#ea580c" />
              <circle cx="72" cy="64" r="3.5" fill="#ea580c" />
            </g>
          )}

          {/* ========================================================
              HEAD & FACE
              ======================================================== */}
          {/* Head Shape */}
          <rect x="42" y="22" width="36" height="36" rx="14" fill={skinColor} />
          {/* Ears */}
          <circle cx="41" cy="40" r="4.5" fill={skinColor} />
          <circle cx="79" cy="40" r="4.5" fill={skinColor} />

          {/* Eyes */}
          <circle cx="52" cy="38" r="2.5" fill="#ffffff" />
          <circle cx="52" cy="38" r="1.5" fill="#000000" />
          <circle cx="68" cy="38" r="2.5" fill="#ffffff" />
          <circle cx="68" cy="38" r="1.5" fill="#000000" />
          {/* Eyebrows */}
          <line x1="49" y1="33" x2="56" y2="33" stroke="#1c1917" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="64" y1="33" x2="71" y2="33" stroke="#1c1917" strokeWidth="1.5" strokeLinecap="round" />

          {/* Nose */}
          <path d="M58 41 Q60 45 62 41" stroke="#000000" strokeWidth="1.2" strokeOpacity="0.4" fill="none" />

          {/* Smile */}
          <path d="M54 48 Q60 52 66 48" stroke="#000000" strokeWidth="1.8" strokeLinecap="round" fill="none" />

          {/* ========================================================
              HAIR & HEAD ACCESSORIES
              ======================================================== */}
          {safeAvatar.hairstyle === 'afro' && (
            <circle cx="60" cy="30" r="23" fill={hairColor} opacity="0.95" />
          )}

          {safeAvatar.hairstyle === 'fade' && (
            <path d="M41 34 Q60 12 79 34 L78 28 Q60 16 42 28 Z" fill={hairColor} />
          )}

          {safeAvatar.hairstyle === 'waves' && (
            <g>
              <path d="M42 32 Q60 16 78 32 L78 28 Q60 18 42 28 Z" fill={hairColor} />
              <path d="M46 25 Q60 21 74 25" stroke="#44403c" strokeWidth="1" fill="none" />
              <path d="M48 29 Q60 25 72 29" stroke="#44403c" strokeWidth="1" fill="none" />
            </g>
          )}

          {safeAvatar.hairstyle === 'buzz' && (
            <path d="M42 30 Q60 18 78 30 L77 26 Q60 18 43 26 Z" fill={hairColor} opacity="0.8" />
          )}

          {(safeAvatar.hairstyle === 'braids' || safeAvatar.hairstyle === 'cornrows') && (
            <g>
              <path d="M42 32 Q60 14 78 32 Z" fill={hairColor} />
              <line x1="48" y1="22" x2="44" y2="46" stroke={hairColor} strokeWidth="3" strokeLinecap="round" />
              <line x1="54" y1="18" x2="52" y2="48" stroke={hairColor} strokeWidth="3" strokeLinecap="round" />
              <line x1="60" y1="16" x2="60" y2="48" stroke={hairColor} strokeWidth="3" strokeLinecap="round" />
              <line x1="66" y1="18" x2="68" y2="48" stroke={hairColor} strokeWidth="3" strokeLinecap="round" />
              <line x1="72" y1="22" x2="76" y2="46" stroke={hairColor} strokeWidth="3" strokeLinecap="round" />
            </g>
          )}

          {(safeAvatar.hairstyle === 'dreads' || safeAvatar.hairstyle === 'locs') && (
            <g>
              <path d="M42 32 Q60 14 78 32 Z" fill={hairColor} />
              <rect x="37" y="24" width="6" height="32" rx="3" fill={hairColor} />
              <rect x="42" y="16" width="6" height="38" rx="3" fill={hairColor} />
              <rect x="57" y="14" width="6" height="40" rx="3" fill={hairColor} />
              <rect x="72" y="16" width="6" height="38" rx="3" fill={hairColor} />
              <rect x="77" y="24" width="6" height="32" rx="3" fill={hairColor} />
            </g>
          )}

          {safeAvatar.hairstyle === 'gele' && (
            <g>
              <path
                d="M32 26 Q60 -4 88 26 Q94 20 84 10 Q60 -8 36 10 Q26 20 32 26 Z"
                fill="#b91c1c"
                stroke="#facc15"
                strokeWidth="2"
              />
              <path d="M38 18 Q60 4 82 18" stroke="#fbbf24" strokeWidth="2" fill="none" />
              <path d="M42 24 Q60 12 78 24" stroke="#fbbf24" strokeWidth="1.5" fill="none" />
            </g>
          )}

          {/* Fila Traditional Cap */}
          {safeAvatar.accessory === 'fila_cap' && (
            <g>
              <path
                d="M40 26 Q60 12 80 26 L84 20 Q60 6 36 20 Z"
                fill="#047857"
                stroke="#facc15"
                strokeWidth="1.5"
              />
              <path d="M78 22 Q86 28 84 34 L78 30 Z" fill="#047857" />
            </g>
          )}

          {/* Sunglasses / Shades */}
          {(safeAvatar.accessory === 'sunglasses' || safeAvatar.accessory === 'designer_shades') && (
            <g>
              <rect x="46" y="34" width="12" height="9" rx="2" fill="#09090b" stroke="#fbbf24" strokeWidth="1" />
              <rect x="62" y="34" width="12" height="9" rx="2" fill="#09090b" stroke="#fbbf24" strokeWidth="1" />
              <line x1="58" y1="38" x2="62" y2="38" stroke="#fbbf24" strokeWidth="1.5" />
            </g>
          )}
          </g>
          </g>
        </svg>
      ) : (
        /* Bust / Portrait View (for compact avatar slots) */
        <svg
          viewBox="0 0 120 120"
          className="w-full h-full drop-shadow-md relative z-10"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <ellipse cx="60" cy="114" rx="34" ry="5" fill="#000000" fillOpacity="0.3" />
          <path d="M30 84 L40 70 L60 76 L80 70 L90 84 L85 114 L35 114 Z" fill={safeAvatar.outfit === 'agbada' ? '#065f46' : safeAvatar.outfit === 'corporate' ? '#1e293b' : '#047857'} />
          <rect x="52" y="62" width="16" height="14" rx="4" fill={skinColor} />
          <rect x="42" y="26" width="36" height="38" rx="14" fill={skinColor} />
          <circle cx="52" cy="42" r="2.5" fill="#ffffff" />
          <circle cx="52" cy="42" r="1.5" fill="#000000" />
          <circle cx="68" cy="42" r="2.5" fill="#ffffff" />
          <circle cx="68" cy="42" r="1.5" fill="#000000" />
          <path d="M54 52 Q60 56 66 52" stroke="#000000" strokeWidth="2" strokeLinecap="round" fill="none" />
          {safeAvatar.hairstyle === 'afro' && <circle cx="60" cy="34" r="22" fill={hairColor} opacity="0.95" />}
          {safeAvatar.hairstyle === 'fade' && <path d="M41 38 Q60 16 79 38 Z" fill={hairColor} />}
        </svg>
      )}
    </div>
  );
};
