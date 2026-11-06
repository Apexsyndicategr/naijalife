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

// Seed active Nigerian online players roaming across states
const DEFAULT_ONLINE_PEERS: OnlinePlayer[] = [
  {
    id: 'peer-1',
    username: 'Tunde_Lekki',
    stateId: 'lagos',
    stateName: 'Lagos',
    avatar: {
      gender: 'male',
      skinTone: '#614335',
      hairstyle: 'dreads',
      hairColor: '#09090b',
      outfit: 'agbada',
      accessory: 'sunglasses',
    },
    x: 42,
    y: 35,
    vehicleName: 'Mercedes Benz G-Wagon G63',
    vehicleEmoji: '🚙',
    hustle: 'Tech Founder & Real Estate',
    netWorthNGN: 145000000,
    status: 'Cruising Admiralty Way, Lekki Phase 1',
    isRealUser: false,
    lastActive: Date.now(),
  },
  {
    id: 'peer-2',
    username: 'Chidi_Alaba',
    stateId: 'lagos',
    stateName: 'Lagos',
    avatar: {
      gender: 'male',
      skinTone: '#4a332a',
      hairstyle: 'fade',
      hairColor: '#18181b',
      outfit: 'casual',
      accessory: 'none',
    },
    x: 68,
    y: 52,
    vehicleName: 'Toyota Land Cruiser V8',
    vehicleEmoji: '🚗',
    hustle: 'Electronics Importer',
    netWorthNGN: 82000000,
    status: 'Clearing 40ft container at Apapa Wharf',
    isRealUser: false,
    lastActive: Date.now(),
  },
  {
    id: 'peer-3',
    username: 'Amina_Maitama',
    stateId: 'fct',
    stateName: 'Abuja (FCT)',
    avatar: {
      gender: 'female',
      skinTone: '#8d5b4c',
      hairstyle: 'gele',
      hairColor: '#09090b',
      outfit: 'ankara',
      accessory: 'designer_shades',
    },
    x: 52,
    y: 40,
    vehicleName: 'Range Rover Velar',
    vehicleEmoji: '🚘',
    hustle: 'Federal Contractor & Consultant',
    netWorthNGN: 210000000,
    status: 'Meeting at Transcorp Hilton, Maitama',
    isRealUser: false,
    lastActive: Date.now(),
  },
  {
    id: 'peer-4',
    username: 'Emeka_Owerri01',
    stateId: 'imo',
    stateName: 'Imo',
    avatar: {
      gender: 'male',
      skinTone: '#5c3826',
      hairstyle: 'buzz',
      hairColor: '#09090b',
      outfit: 'corporate',
      accessory: 'coral_beads',
    },
    x: 48,
    y: 58,
    vehicleName: 'Lexus RX 350',
    vehicleEmoji: '🚙',
    hustle: 'Hotelier & Logistics Mogul',
    netWorthNGN: 65000000,
    status: 'Inspecting new lounge on World Bank Road, Owerri',
    isRealUser: false,
    lastActive: Date.now(),
  },
  {
    id: 'peer-5',
    username: 'Burna_Ikeja',
    stateId: 'lagos',
    stateName: 'Lagos',
    avatar: {
      gender: 'male',
      skinTone: '#3b2219',
      hairstyle: 'afro',
      hairColor: '#09090b',
      outfit: 'streetwear',
      accessory: 'gold_chain',
    },
    x: 25,
    y: 65,
    vehicleName: 'Bajaj Boxer 150 Motorcycle',
    vehicleEmoji: '🏍️',
    hustle: 'Sound Producer & Artist',
    netWorthNGN: 18500000,
    status: 'Recording at Allen Avenue Studio',
    isRealUser: false,
    lastActive: Date.now(),
  },
  {
    id: 'peer-6',
    username: 'Zainab_KanoKano',
    stateId: 'kano',
    stateName: 'Kano',
    avatar: {
      gender: 'female',
      skinTone: '#a26a57',
      hairstyle: 'gele',
      hairColor: '#09090b',
      outfit: 'ankara',
      accessory: 'none',
    },
    x: 55,
    y: 45,
    vehicleName: 'Toyota Corolla (Muscle)',
    vehicleEmoji: '🚗',
    hustle: 'Textile Wholesale Exporter',
    netWorthNGN: 47000000,
    status: 'Trading at Kantin Kwari Textile Market',
    isRealUser: false,
    lastActive: Date.now(),
  },
  {
    id: 'peer-7',
    username: 'Kene_Enugu042',
    stateId: 'enugu',
    stateName: 'Enugu',
    avatar: {
      gender: 'male',
      skinTone: '#614335',
      hairstyle: 'fade',
      hairColor: '#09090b',
      outfit: 'corporate',
      accessory: 'none',
    },
    x: 50,
    y: 50,
    vehicleName: 'Mercedes Benz C300',
    vehicleEmoji: '🏎️',
    hustle: 'Coal City Tech Engineer',
    netWorthNGN: 34000000,
    status: 'Chilling at Polo Park Mall',
    isRealUser: false,
    lastActive: Date.now(),
  },
  {
    id: 'peer-8',
    username: 'Segun_Ibadan',
    stateId: 'oyo',
    stateName: 'Oyo',
    avatar: {
      gender: 'male',
      skinTone: '#5c3826',
      hairstyle: 'buzz',
      hairColor: '#09090b',
      outfit: 'agbada',
      accessory: 'fila_cap',
    },
    x: 40,
    y: 60,
    vehicleName: 'Honda Accord Evil Spirit',
    vehicleEmoji: '🚗',
    hustle: 'Agro Commodity Broker',
    netWorthNGN: 29000000,
    status: 'Loading grain trucks at Bodija Market',
    isRealUser: false,
    lastActive: Date.now(),
  },
  {
    id: 'peer-9',
    username: 'Tamuno_PHC',
    stateId: 'rivers',
    stateName: 'Rivers',
    avatar: {
      gender: 'male',
      skinTone: '#4a332a',
      hairstyle: 'buzz',
      hairColor: '#09090b',
      outfit: 'casual',
      accessory: 'sunglasses',
    },
    x: 58,
    y: 62,
    vehicleName: 'Toyota Hilux 4x4',
    vehicleEmoji: '🛻',
    hustle: 'Offshore Maritime Contractor',
    netWorthNGN: 92000000,
    status: 'Docked at Trans-Amadi Port Harcourt',
    isRealUser: false,
    lastActive: Date.now(),
  },
];

const DEFAULT_GLOBAL_CHATS: OnlineChatMessage[] = [
  {
    id: 'msg-1',
    senderId: 'peer-1',
    senderName: 'Tunde_Lekki',
    stateName: 'Lagos',
    message: 'Who dey Lekki tollgate? Traffic clear this afternoon o! 🙌',
    timestamp: 'Just now',
  },
  {
    id: 'msg-2',
    senderId: 'peer-4',
    senderName: 'Emeka_Owerri01',
    stateName: 'Imo',
    message: 'Owerri nightlife is untouched! Heading to Concorde Hotel now. 🍻',
    timestamp: '2m ago',
  },
  {
    id: 'msg-3',
    senderId: 'peer-3',
    senderName: 'Amina_Maitama',
    stateName: 'Abuja (FCT)',
    message: 'Just concluded contract bid in Central Business District. Cash flow! 💼',
    timestamp: '4m ago',
  },
  {
    id: 'msg-4',
    senderId: 'peer-5',
    senderName: 'Burna_Ikeja',
    stateName: 'Lagos',
    message: 'Naija Bet lucky spin just paid out ₦180k! We move! 🔥',
    timestamp: '6m ago',
  },
];

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
 * Get all online players across Nigeria
 */
export function getOnlinePlayers(): OnlinePlayer[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PLAYERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_PLAYERS, JSON.stringify(DEFAULT_ONLINE_PEERS));
      return DEFAULT_ONLINE_PEERS;
    }
    const players: OnlinePlayer[] = JSON.parse(raw);
    return players;
  } catch {
    return DEFAULT_ONLINE_PEERS;
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
 * Get global live shoutbox chats
 */
export function getGlobalChats(): OnlineChatMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CHATS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_CHATS, JSON.stringify(DEFAULT_GLOBAL_CHATS));
      return DEFAULT_GLOBAL_CHATS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_GLOBAL_CHATS;
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
