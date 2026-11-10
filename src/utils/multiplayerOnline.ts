/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserProfile, VehicleAsset } from '../types/game';

export interface OnlinePlayer {
  id: string;
  username: string;
  stateId: string;
  stateName: string;
  avatar: UserProfile['avatar'];
  x: number;
  y: number;
  targetX?: number;
  targetY?: number;
  vehicleName?: string;
  vehicleEmoji?: string;
  hustle: string;
  netWorthNGN: number;
  status: string;
  isRealUser: boolean;
  lastActive: number;
}

export interface OnlineChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  stateName: string;
  message: string;
  timestamp: string;
  isRealUser?: boolean;
}

const STORAGE_KEY_PLAYERS = 'naija_life_global_players';
const STORAGE_KEY_CHATS = 'naija_life_global_chats';

// ONLY Real registered players roaming across states (Strictly NO fake accounts)
const DEFAULT_ONLINE_PEERS: OnlinePlayer[] = [];

// ONLY Real citizen chat messages (Strictly NO fake accounts)
const DEFAULT_GLOBAL_CHATS: OnlineChatMessage[] = [];

/**
 * Register or update the current real player in the shared global pool
 */
export function registerRealPlayerOnline(
  user: UserProfile,
  stateId: string,
  stateName: string,
  walletNGN: number,
  activeVehicle?: VehicleAsset | null
): OnlinePlayer[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PLAYERS);
    let allPlayers: OnlinePlayer[] = raw ? JSON.parse(raw) : [...DEFAULT_ONLINE_PEERS];

    // Find if current real user exists by username
    const existingIndex = allPlayers.findIndex(
      (p) => p.username.toLowerCase() === user.username.toLowerCase()
    );

    const currentPlayerEntry: OnlinePlayer = {
      id: user.username,
      username: user.username,
      stateId: stateId.toLowerCase(),
      stateName,
      avatar: user.avatar,
      x: 38 + Math.floor(Math.random() * 20) - 10,
      y: 45 + Math.floor(Math.random() * 20) - 10,
      vehicleName: activeVehicle ? activeVehicle.name : undefined,
      vehicleEmoji: activeVehicle ? activeVehicle.icon : undefined,
      hustle: 'Professional Citizen',
      netWorthNGN: walletNGN,
      status: `Active in ${stateName}`,
      isRealUser: true,
      lastActive: Date.now(),
    };

    if (existingIndex >= 0) {
      allPlayers[existingIndex] = currentPlayerEntry;
    } else {
      allPlayers.unshift(currentPlayerEntry);
    }

    localStorage.setItem(STORAGE_KEY_PLAYERS, JSON.stringify(allPlayers));
    return allPlayers;
  } catch {
    return DEFAULT_ONLINE_PEERS;
  }
}

/**
 * Get all online players across Nigeria (Strictly real registered players)
 */
export function getOnlinePlayers(): OnlinePlayer[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PLAYERS);
    if (!raw) return [];
    const players: OnlinePlayer[] = JSON.parse(raw);
    const realPlayers = players.filter((p) => p && p.isRealUser === true && !String(p.id).startsWith('peer-'));
    if (realPlayers.length !== players.length) {
      localStorage.setItem(STORAGE_KEY_PLAYERS, JSON.stringify(realPlayers));
    }
    return realPlayers;
  } catch {
    return [];
  }
}

/**
 * Get online players in a specific state
 */
export function getOnlinePlayersInState(stateId: string, currentUsername?: string): OnlinePlayer[] {
  const all = getOnlinePlayers();
  const normalized = stateId.toLowerCase();
  return all.filter(
    (p) =>
      p.stateId.toLowerCase() === normalized &&
      (!currentUsername || p.username.toLowerCase() !== currentUsername.toLowerCase())
  );
}

/**
 * Get global live shoutbox chats (Strictly real registered citizens)
 */
export function getGlobalChats(): OnlineChatMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CHATS);
    if (!raw) return [];
    const parsed: OnlineChatMessage[] = JSON.parse(raw);
    const realChats = parsed.filter((c) => c && c.isRealUser === true && !String(c.senderId).startsWith('peer-'));
    if (realChats.length !== parsed.length) {
      localStorage.setItem(STORAGE_KEY_CHATS, JSON.stringify(realChats));
    }
    return realChats;
  } catch {
    return [];
  }
}

/**
 * Broadcast a new message to the global live shoutbox
 */
export function postGlobalChat(
  senderUser: UserProfile,
  stateName: string,
  message: string
): OnlineChatMessage[] {
  try {
    const current = getGlobalChats();
    const newMsg: OnlineChatMessage = {
      id: `chat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      senderId: senderUser.username,
      senderName: senderUser.username,
      stateName,
      message,
      timestamp: 'Just now',
      isRealUser: true,
    };
    const updated = [newMsg, ...current.slice(0, 49)];
    localStorage.setItem(STORAGE_KEY_CHATS, JSON.stringify(updated));
    return updated;
  } catch {
    return DEFAULT_GLOBAL_CHATS;
  }
}
