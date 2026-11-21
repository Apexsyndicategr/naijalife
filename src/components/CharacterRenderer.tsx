/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { CharacterAvatar } from '../types/game';
import { ThreeCharacterAvatar } from './ThreeCharacterAvatar';
import { renderAvatarPortrait3DSync } from './avatar3d/avatarPortraitRenderer';
import { normalizeAvatarConfig as normAv } from './avatar3d/riggedAvatarBuilder';

interface CharacterRendererProps {
  avatar?: CharacterAvatar | null;
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

  const safeAvatar = normAv(avatar);
  const wantsFullBody = fullBody !== undefined ? fullBody : size !== 'sm';
  const [snapshotUrl, setSnapshotUrl] = useState<string | null>(null);
  const avatarKey = JSON.stringify(safeAvatar) + (wantsFullBody ? '_f' : '_b');

  useEffect(() => {
    if (use3D || size === 'full') return;
    const url = renderAvatarPortrait3DSync(safeAvatar, wantsFullBody);
    setSnapshotUrl(url);
  }, [avatarKey, use3D, size, wantsFullBody]);

  // Live interactive WebGL 3D view when full-body or explicitly 3D requested
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
        <ThreeCharacterAvatar avatar={safeAvatar} size={size} interactive={true} isWalking={isWalking} />
      </div>
    );
  }

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
        <div className="absolute inset-0 bg-radial from-emerald-500/20 via-transparent to-transparent pointer-events-none" />
      )}
      {snapshotUrl ? (
        <img
          src={snapshotUrl}
          alt="3D Citizen Avatar"
          className="w-full h-full object-contain relative z-10 pointer-events-none drop-shadow-[0_4px_10px_rgba(0,0,0,0.45)]"
          draggable={false}
        />
      ) : (
        <div
          className="w-full h-full flex items-center justify-center text-xs font-black text-emerald-300"
          style={{ backgroundColor: safeAvatar.skinTone }}
        >
          3D
        </div>
      )}
    </div>
  );
};
