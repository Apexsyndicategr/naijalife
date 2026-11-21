/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HouseLayoutData, PlacedFurnitureItem, POIType } from '../../types/game';

export type InteriorCategory =
  | 'house'
  | 'bank'
  | 'restaurant'
  | 'supermarket'
  | 'boutique'
  | 'salon'
  | 'hospital'
  | 'hotel'
  | 'school'
  | 'office'
  | 'police'
  | 'gov'
  | 'church'
  | 'mosque'
  | 'club'
  | 'warehouse'
  | 'factory'
  | 'petrol_station'
  | 'gym'
  | 'dealership'
  | 'stadium';

export interface WallRect {
  x: number;
  z: number;
  w: number;
  d: number;
  h?: number;
  color?: number;
}

export interface InteractivePropSpec {
  id: string;
  label: string;
  actionType:
    | 'exit_door'
    | 'sleep_bed'
    | 'watch_tv'
    | 'use_fridge'
    | 'use_stove'
    | 'use_shower'
    | 'open_wardrobe'
    | 'open_storage'
    | 'toggle_lights'
    | 'sit_sofa'
    | 'bank_teller'
    | 'use_atm'
    | 'order_food'
    | 'buy_groceries'
    | 'shop_clothing'
    | 'salon_chair'
    | 'hospital_heal'
    | 'hotel_rest'
    | 'work_desk'
    | 'study_desk'
    | 'police_service'
    | 'worship'
    | 'club_bar'
    | 'gym_workout'
    | 'fuel_counter'
    | 'warehouse_shift'
    | 'showroom_car';
  propMeshType:
    | 'door'
    | 'bed'
    | 'tv'
    | 'fridge'
    | 'stove'
    | 'shower'
    | 'wardrobe'
    | 'storage_crate'
    | 'lamp'
    | 'sofa'
    | 'counter_desk'
    | 'atm'
    | 'dining_table'
    | 'shelf_rack'
    | 'clothing_rack'
    | 'salon_chair'
    | 'medical_bed'
    | 'office_desk'
    | 'pulpit'
    | 'dj_booth'
    | 'treadmill'
    | 'pallet_stack'
    | 'car_plinth';
  x: number;
  z: number;
  rotationY?: number;
  w: number;
  d: number;
  collides: boolean;
  roomName: string;
  accentHex?: number;
}

export interface InteriorSceneBlueprint {
  category: InteriorCategory;
  title: string;
  width: number;
  depth: number;
  spawnX: number;
  spawnZ: number;
  wallColorHex: number;
  floorColorHex: number;
  floorTileGrid: boolean;
  walls: WallRect[];
  props: InteractivePropSpec[];
  roomLabels: { name: string; x: number; z: number }[];
}

function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export function mapPoiTypeToInteriorCategory(poiType: POIType | string, name = ''): InteriorCategory {
  const n = name.toLowerCase();
  if (n.includes('salon') || n.includes('barber') || poiType === 'salon') return 'salon';
  if (n.includes('petrol') || n.includes('nnpc') || n.includes('filling') || poiType === 'petrol_station') return 'petrol_station';
  switch (poiType) {
    case 'home':
    case 'bungalow':
    case 'detached_house':
    case 'semi_detached':
    case 'duplex':
    case 'mansion':
    case 'apartment':
    case 'estate':
      return 'house';
    case 'bank':
      return 'bank';
    case 'restaurant':
    case 'eatery':
      return 'restaurant';
    case 'supermarket':
    case 'mall':
    case 'market':
      return 'supermarket';
    case 'boutique':
      return 'boutique';
    case 'hospital':
      return 'hospital';
    case 'hotel':
      return 'hotel';
    case 'school':
    case 'university':
      return 'school';
    case 'techhub':
    case 'office':
      return 'office';
    case 'police':
      return 'police';
    case 'gov':
    case 'court':
      return 'gov';
    case 'church':
      return 'church';
    case 'mosque':
      return 'mosque';
    case 'club':
    case 'betting':
      return 'club';
    case 'warehouse':
      return 'warehouse';
    case 'factory':
    case 'mechanic':
      return 'factory';
    case 'gym':
      return 'gym';
    case 'dealership':
      return 'dealership';
    case 'stadium':
    case 'golf':
    case 'zoo':
    case 'lake':
      return 'stadium';
    default:
      return 'office';
  }
}

export const WALL_THEMES: Record<HouseLayoutData['wallTheme'], number> = {
  cream: 0xf5efe6,
  sage: 0xd1e2d7,
  charcoal: 0x334155,
  terracotta: 0xe6c8b6,
  ivory: 0xfafaf9,
};

export const FLOOR_THEMES: Record<HouseLayoutData['floorTheme'], number> = {
  oak: 0x8b5a2b,
  marble: 0xe2e8f0,
  slate: 0x334155,
  terrazzo: 0xcbd5e1,
};

export function buildInteriorBlueprint(params: {
  id: string;
  name: string;
  type: string;
  houseLayout?: HouseLayoutData | null;
}): InteriorSceneBlueprint {
  const category = mapPoiTypeToInteriorCategory(params.type, params.name);
  const seed = hashSeed(`${params.id}_${params.name}`);

  // Default 18m x 14m interior hall unless house
  if (category === 'house') {
    const w = 18;
    const d = 14;
    const wallHex = params.houseLayout ? WALL_THEMES[params.houseLayout.wallTheme] : 0xf4efe6;
    const floorHex = params.houseLayout ? FLOOR_THEMES[params.houseLayout.floorTheme] : 0x8d5b32;

    // Multi-room House Floorplan:
    // Top-Left: Bedroom (-5.5, -3.5) | Top-Right: Kitchen + Dining (4.5, -3.5)
    // Bottom-Left: Living Room (-4.5, 3.0) | Bottom-Right: Bathroom (6.2, 3.2)
    // Central Entrance Doorway at (0, 6.7) -> Spawn safely inside at (0, 5.1)
    const walls: WallRect[] = [
      // Bedroom partition wall with wide doorway gap
      { x: -1.0, z: -4.2, w: 0.3, d: 5.4, h: 3.1, color: wallHex },
      { x: -6.8, z: -0.6, w: 4.2, d: 0.3, h: 3.1, color: wallHex },
      // Bathroom enclosure bottom-right with doorway facing hall
      { x: 3.5, z: 3.6, w: 0.3, d: 6.4, h: 3.1, color: wallHex },
      { x: 6.6, z: 0.5, w: 4.6, d: 0.3, h: 3.1, color: wallHex },
    ];

    const props: InteractivePropSpec[] = [
      {
        id: 'house_exit',
        label: 'Exit to City',
        actionType: 'exit_door',
        propMeshType: 'door',
        x: 0,
        z: 6.75,
        w: 1.6,
        d: 0.35,
        collides: false,
        roomName: 'Foyer',
        accentHex: 0x10b981,
      },
      // Living Room
      {
        id: 'house_sofa',
        label: 'Relax on Sectional Sofa',
        actionType: 'sit_sofa',
        propMeshType: 'sofa',
        x: -4.8,
        z: 3.4,
        w: 2.8,
        d: 1.2,
        collides: true,
        roomName: 'Living Room',
        accentHex: 0x334155,
      },
      {
        id: 'house_tv',
        label: 'Watch 4K Smart TV',
        actionType: 'watch_tv',
        propMeshType: 'tv',
        x: -8.2,
        z: 3.4,
        rotationY: Math.PI / 2,
        w: 0.5,
        d: 2.4,
        collides: true,
        roomName: 'Living Room',
        accentHex: 0x0ea5e9,
      },
      {
        id: 'house_light_switch',
        label: 'Toggle Room Lights',
        actionType: 'toggle_lights',
        propMeshType: 'lamp',
        x: -1.6,
        z: 6.1,
        w: 0.5,
        d: 0.5,
        collides: true,
        roomName: 'Living Room',
        accentHex: 0xfacc15,
      },
      // Bedroom
      {
        id: 'house_bed',
        label: 'Sleep in King Bed (+Energy)',
        actionType: 'sleep_bed',
        propMeshType: 'bed',
        x: -6.4,
        z: -4.7,
        w: 2.6,
        d: 2.2,
        collides: true,
        roomName: 'Bedroom',
        accentHex: 0x065f46,
      },
      {
        id: 'house_wardrobe',
        label: 'Open Wardrobe (Change Outfits)',
        actionType: 'open_wardrobe',
        propMeshType: 'wardrobe',
        x: -2.4,
        z: -5.8,
        w: 1.8,
        d: 0.85,
        collides: true,
        roomName: 'Bedroom',
        accentHex: 0x78350f,
      },
      {
        id: 'house_storage',
        label: 'Storage Trunk',
        actionType: 'open_storage',
        propMeshType: 'storage_crate',
        x: -3.2,
        z: -2.2,
        w: 1.1,
        d: 0.8,
        collides: true,
        roomName: 'Bedroom',
        accentHex: 0xd97706,
      },
      // Kitchen & Dining
      {
        id: 'house_fridge',
        label: 'Grab Cold Drink / Snack (Fridge)',
        actionType: 'use_fridge',
        propMeshType: 'fridge',
        x: 7.8,
        z: -5.6,
        w: 1.1,
        d: 0.95,
        collides: true,
        roomName: 'Kitchen',
        accentHex: 0xcbd5e1,
      },
      {
        id: 'house_stove',
        label: 'Cook Home Meal (Gas Cooker)',
        actionType: 'use_stove',
        propMeshType: 'stove',
        x: 5.2,
        z: -5.8,
        w: 1.6,
        d: 0.9,
        collides: true,
        roomName: 'Kitchen',
        accentHex: 0x1e293b,
      },
      {
        id: 'house_dining',
        label: 'Dining Table',
        actionType: 'use_stove',
        propMeshType: 'dining_table',
        x: 4.5,
        z: -2.2,
        w: 2.4,
        d: 1.4,
        collides: true,
        roomName: 'Dining Area',
        accentHex: 0x92400e,
      },
      // Bathroom
      {
        id: 'house_shower',
        label: 'Take Refreshing Shower (+Energy/Joy)',
        actionType: 'use_shower',
        propMeshType: 'shower',
        x: 7.4,
        z: 5.2,
        w: 1.5,
        d: 1.5,
        collides: true,
        roomName: 'Bathroom',
        accentHex: 0x38bdf8,
      },
    ];

    // Add player-placed custom furniture items if persisted!
    const customFurniture: PlacedFurnitureItem[] = params.houseLayout?.placedFurniture || [];
    for (const pf of customFurniture) {
      props.push({
        id: `custom_${pf.instanceId}`,
        label: `${pf.name} (Placed)`,
        actionType:
          pf.category === 'kitchen'
            ? 'use_fridge'
            : pf.category === 'bathroom'
            ? 'use_shower'
            : pf.category === 'room'
            ? 'sleep_bed'
            : 'sit_sofa',
        propMeshType:
          pf.category === 'kitchen'
            ? 'fridge'
            : pf.category === 'bathroom'
            ? 'shower'
            : pf.category === 'room'
            ? 'bed'
            : pf.name.toLowerCase().includes('tv')
            ? 'tv'
            : 'sofa',
        x: pf.x,
        z: pf.z,
        rotationY: pf.rotationY,
        w: 1.6,
        d: 1.2,
        collides: true,
        roomName: 'Custom Decor',
        accentHex: 0x10b981,
      });
    }

    return {
      category: 'house',
      title: params.name,
      width: w,
      depth: d,
      spawnX: 0,
      spawnZ: 5.1,
      wallColorHex: wallHex,
      floorColorHex: floorHex,
      floorTileGrid: true,
      walls,
      props,
      roomLabels: [
        { name: 'Living Room', x: -5.2, z: 1.6 },
        { name: 'Bedroom', x: -5.5, z: -3.5 },
        { name: 'Kitchen & Dining', x: 5.2, z: -3.5 },
        { name: 'Bathroom', x: 6.2, z: 3.2 },
      ],
    };
  }

  // Non-residential tailored interiors
  const exitProp: InteractivePropSpec = {
    id: 'poi_exit',
    label: 'Exit Building',
    actionType: 'exit_door',
    propMeshType: 'door',
    x: 0,
    z: 6.75,
    w: 1.8,
    d: 0.35,
    collides: false,
    roomName: 'Entrance',
    accentHex: 0x10b981,
  };

  if (category === 'bank') {
    return {
      category,
      title: params.name,
      width: 18,
      depth: 14,
      spawnX: 0,
      spawnZ: 5.1,
      wallColorHex: seed % 2 === 0 ? 0xf8fafc : 0xe2e8f0,
      floorColorHex: 0xdbeafe,
      floorTileGrid: true,
      walls: [{ x: 0, z: -2.2, w: 12, d: 0.4, h: 1.3, color: 0x064e3b }],
      props: [
        exitProp,
        { id: 'bank_teller_1', label: 'Bank Teller Counter (Transfers & FX)', actionType: 'bank_teller', propMeshType: 'counter_desk', x: -3.2, z: -3.2, w: 3.4, d: 1.2, collides: true, roomName: 'Teller Hall', accentHex: 0x10b981 },
        { id: 'bank_teller_2', label: 'VIP Accounts Desk', actionType: 'bank_teller', propMeshType: 'counter_desk', x: 3.2, z: -3.2, w: 3.4, d: 1.2, collides: true, roomName: 'Teller Hall', accentHex: 0x10b981 },
        { id: 'bank_atm_1', label: '24/7 ATM Terminal', actionType: 'use_atm', propMeshType: 'atm', x: -7.5, z: 2.2, rotationY: Math.PI / 2, w: 0.9, d: 1.1, collides: true, roomName: 'ATM Lobby', accentHex: 0x0ea5e9 },
        { id: 'bank_atm_2', label: 'FX / CAD Exchange Kiosk', actionType: 'use_atm', propMeshType: 'atm', x: -7.5, z: 0.2, rotationY: Math.PI / 2, w: 0.9, d: 1.1, collides: true, roomName: 'ATM Lobby', accentHex: 0xf59e0b },
        { id: 'bank_wait_sofa', label: 'Customer Lounge Seating', actionType: 'sit_sofa', propMeshType: 'sofa', x: 5.8, z: 2.5, rotationY: -Math.PI / 2, w: 1.4, d: 2.8, collides: true, roomName: 'Lounge' },
      ],
      roomLabels: [
        { name: 'Teller Counters', x: 0, z: -4.2 },
        { name: 'ATM Zone', x: -6.2, z: 1.2 },
        { name: 'Customer Lounge', x: 5.0, z: 2.2 },
      ],
    };
  }

  if (category === 'restaurant') {
    return {
      category,
      title: params.name,
      width: 18,
      depth: 14,
      spawnX: 0,
      spawnZ: 5.1,
      wallColorHex: 0xfef3c7,
      floorColorHex: 0x78350f,
      floorTileGrid: true,
      walls: [],
      props: [
        exitProp,
        { id: 'rest_counter', label: 'Order Food & Chilled Drinks', actionType: 'order_food', propMeshType: 'counter_desk', x: 0, z: -4.2, w: 7.5, d: 1.4, collides: true, roomName: 'Ordering Counter', accentHex: 0xe11d48 },
        { id: 'rest_table_1', label: 'Dine at Table 1', actionType: 'order_food', propMeshType: 'dining_table', x: -4.8, z: 0.2, w: 2.2, d: 1.6, collides: true, roomName: 'Dining Hall' },
        { id: 'rest_table_2', label: 'Dine at Table 2', actionType: 'order_food', propMeshType: 'dining_table', x: 4.8, z: 0.2, w: 2.2, d: 1.6, collides: true, roomName: 'Dining Hall' },
        { id: 'rest_table_3', label: 'VIP Booth Seating', actionType: 'sit_sofa', propMeshType: 'sofa', x: -5.2, z: 3.5, w: 2.6, d: 1.3, collides: true, roomName: 'Lounge Booth' },
      ],
      roomLabels: [
        { name: 'Chef Kitchen & Order Counter', x: 0, z: -5.4 },
        { name: 'Dining Floor', x: 0, z: 0.5 },
      ],
    };
  }

  if (category === 'supermarket') {
    return {
      category,
      title: params.name,
      width: 18,
      depth: 14,
      spawnX: 0,
      spawnZ: 5.1,
      wallColorHex: 0xf1f5f9,
      floorColorHex: 0xe2e8f0,
      floorTileGrid: true,
      walls: [],
      props: [
        exitProp,
        { id: 'sup_aisle_1', label: 'Beverages & Cold Water Aisle', actionType: 'buy_groceries', propMeshType: 'shelf_rack', x: -5.0, z: -1.8, w: 1.4, d: 5.2, collides: true, roomName: 'Aisle 1', accentHex: 0x0ea5e9 },
        { id: 'sup_aisle_2', label: 'Snacks & Fresh Foods Aisle', actionType: 'buy_groceries', propMeshType: 'shelf_rack', x: 0, z: -1.8, w: 1.4, d: 5.2, collides: true, roomName: 'Aisle 2', accentHex: 0x10b981 },
        { id: 'sup_aisle_3', label: 'Household & Provisions Aisle', actionType: 'buy_groceries', propMeshType: 'shelf_rack', x: 5.0, z: -1.8, w: 1.4, d: 5.2, collides: true, roomName: 'Aisle 3', accentHex: 0xf59e0b },
        { id: 'sup_checkout', label: 'Express POS Checkout', actionType: 'buy_groceries', propMeshType: 'counter_desk', x: -4.2, z: 3.4, w: 3.2, d: 1.1, collides: true, roomName: 'Checkout', accentHex: 0x10b981 },
      ],
      roomLabels: [
        { name: 'Drinks & Fridge', x: -5.0, z: -4.8 },
        { name: 'Fresh Groceries', x: 0, z: -4.8 },
        { name: 'Checkout Till', x: -4.2, z: 4.5 },
      ],
    };
  }

  if (category === 'boutique' || category === 'salon') {
    return {
      category,
      title: params.name,
      width: 18,
      depth: 14,
      spawnX: 0,
      spawnZ: 5.1,
      wallColorHex: 0xfdf4ff,
      floorColorHex: 0xf5d0fe,
      floorTileGrid: true,
      walls: [],
      props: [
        exitProp,
        { id: 'btq_rack_1', label: 'Browse Men & Women Fashion Racks', actionType: 'shop_clothing', propMeshType: 'clothing_rack', x: -5.2, z: -1.6, w: 3.2, d: 1.1, collides: true, roomName: 'Runway Floor', accentHex: 0xa855f7 },
        { id: 'btq_rack_2', label: 'Luxury Agbada, Gowns & Accessories', actionType: 'shop_clothing', propMeshType: 'clothing_rack', x: 5.2, z: -1.6, w: 3.2, d: 1.1, collides: true, roomName: 'VIP Atelier', accentHex: 0xfbbf24 },
        { id: 'salon_station_1', label: 'Hair Salon & Grooming Chair', actionType: 'salon_chair', propMeshType: 'salon_chair', x: 0, z: -3.8, w: 1.5, d: 1.5, collides: true, roomName: 'Styling Studio', accentHex: 0xec4899 },
        { id: 'btq_wardrobe', label: 'Full-Length Try-On Mirror (Wardrobe)', actionType: 'open_wardrobe', propMeshType: 'wardrobe', x: -6.8, z: 2.2, rotationY: Math.PI / 2, w: 0.9, d: 2.0, collides: true, roomName: 'Fitting Area' },
      ],
      roomLabels: [
        { name: 'Designer Racks', x: -5.2, z: -3.2 },
        { name: '3D Hair Salon', x: 0, z: -5.2 },
        { name: 'Couture Fitting', x: 5.2, z: -3.2 },
      ],
    };
  }

  if (category === 'hospital') {
    return {
      category,
      title: params.name,
      width: 18,
      depth: 14,
      spawnX: 0,
      spawnZ: 5.1,
      wallColorHex: 0xf8fafc,
      floorColorHex: 0xdbeafe,
      floorTileGrid: true,
      walls: [{ x: 0, z: -2.0, w: 0.3, d: 7.5, h: 2.6, color: 0xe2e8f0 }],
      props: [
        exitProp,
        { id: 'hosp_recep', label: 'Triage & Pharmacy Counter (Full Heal)', actionType: 'hospital_heal', propMeshType: 'counter_desk', x: -4.2, z: 1.8, w: 3.4, d: 1.2, collides: true, roomName: 'Reception', accentHex: 0xe11d48 },
        { id: 'hosp_bed_1', label: 'Medical Ward Bed 1 (Treatment)', actionType: 'hospital_heal', propMeshType: 'medical_bed', x: -5.5, z: -3.8, w: 2.4, d: 1.5, collides: true, roomName: 'Ward A', accentHex: 0x38bdf8 },
        { id: 'hosp_bed_2', label: 'Medical Ward Bed 2 (Treatment)', actionType: 'hospital_heal', propMeshType: 'medical_bed', x: 5.5, z: -3.8, w: 2.4, d: 1.5, collides: true, roomName: 'Ward B', accentHex: 0x38bdf8 },
      ],
      roomLabels: [
        { name: 'Emergency Triage', x: -4.2, z: 3.2 },
        { name: 'Treatment Ward', x: 4.5, z: -5.2 },
      ],
    };
  }

  if (category === 'hotel') {
    return {
      category,
      title: params.name,
      width: 18,
      depth: 14,
      spawnX: 0,
      spawnZ: 5.1,
      wallColorHex: 0xfef9c3,
      floorColorHex: 0x92400e,
      floorTileGrid: true,
      walls: [{ x: -1.5, z: -1.0, w: 0.3, d: 8.5, h: 3.0, color: 0xf5f5f4 }],
      props: [
        exitProp,
        { id: 'hotel_desk', label: 'Concierge Check-In Desk', actionType: 'hotel_rest', propMeshType: 'counter_desk', x: 4.5, z: 1.4, w: 3.6, d: 1.2, collides: true, roomName: 'Lobby', accentHex: 0xfbbf24 },
        { id: 'hotel_bed', label: 'Presidential Suite King Bed (Sleep)', actionType: 'hotel_rest', propMeshType: 'bed', x: -5.8, z: -3.8, w: 2.6, d: 2.2, collides: true, roomName: 'VIP Suite', accentHex: 0xb45309 },
        { id: 'hotel_lounge', label: 'Lobby Velvet Lounge', actionType: 'sit_sofa', propMeshType: 'sofa', x: 4.8, z: -3.6, w: 2.8, d: 1.3, collides: true, roomName: 'Lobby Bar' },
      ],
      roomLabels: [
        { name: 'VIP Suite', x: -5.5, z: -5.5 },
        { name: 'Grand Lobby', x: 4.5, z: 2.8 },
      ],
    };
  }

  if (category === 'school') {
    return {
      category,
      title: params.name,
      width: 18,
      depth: 14,
      spawnX: 0,
      spawnZ: 5.1,
      wallColorHex: 0xecfdf5,
      floorColorHex: 0xb45309,
      floorTileGrid: true,
      walls: [],
      props: [
        exitProp,
        { id: 'sch_podium', label: 'Attend Lecture (+Career Skill / Happiness)', actionType: 'study_desk', propMeshType: 'pulpit', x: 0, z: -4.8, w: 2.2, d: 1.2, collides: true, roomName: 'Lecture Hall', accentHex: 0x047857 },
        { id: 'sch_desk_1', label: 'Study Desk', actionType: 'study_desk', propMeshType: 'office_desk', x: -4.2, z: -0.6, w: 2.2, d: 1.1, collides: true, roomName: 'Classroom' },
        { id: 'sch_desk_2', label: 'Computer Lab Desk', actionType: 'study_desk', propMeshType: 'office_desk', x: 4.2, z: -0.6, w: 2.2, d: 1.1, collides: true, roomName: 'Classroom' },
        { id: 'sch_books', label: 'University Library Shelf', actionType: 'study_desk', propMeshType: 'shelf_rack', x: -7.2, z: -3.8, w: 1.2, d: 4.2, collides: true, roomName: 'Library' },
      ],
      roomLabels: [
        { name: 'Lecture Podium', x: 0, z: -5.8 },
        { name: 'Student Desks', x: 0, z: 1.2 },
      ],
    };
  }

  if (category === 'church' || category === 'mosque') {
    return {
      category,
      title: params.name,
      width: 18,
      depth: 14,
      spawnX: 0,
      spawnZ: 5.1,
      wallColorHex: 0xfafaf9,
      floorColorHex: category === 'mosque' ? 0x065f46 : 0x7c2d12,
      floorTileGrid: false,
      walls: [],
      props: [
        exitProp,
        { id: 'wsp_altar', label: category === 'mosque' ? 'Pray & Reflect (+Peace / Happiness)' : 'Attend Service (+Peace / Happiness)', actionType: 'worship', propMeshType: 'pulpit', x: 0, z: -4.8, w: 2.6, d: 1.4, collides: true, roomName: 'Sanctuary', accentHex: 0xfbbf24 },
        { id: 'wsp_pew_l', label: 'Sanctuary Seating', actionType: 'sit_sofa', propMeshType: 'sofa', x: -4.2, z: -0.5, w: 3.4, d: 1.2, collides: true, roomName: 'Congregation' },
        { id: 'wsp_pew_r', label: 'Sanctuary Seating', actionType: 'sit_sofa', propMeshType: 'sofa', x: 4.2, z: -0.5, w: 3.4, d: 1.2, collides: true, roomName: 'Congregation' },
      ],
      roomLabels: [
        { name: category === 'mosque' ? 'Mihrab & Prayer Hall' : 'Altar & Sanctuary', x: 0, z: -5.6 },
      ],
    };
  }

  if (category === 'club') {
    return {
      category,
      title: params.name,
      width: 18,
      depth: 14,
      spawnX: 0,
      spawnZ: 5.1,
      wallColorHex: 0x1e1b4b,
      floorColorHex: 0x0f172a,
      floorTileGrid: true,
      walls: [],
      props: [
        exitProp,
        { id: 'club_dj', label: 'DJ Booth (Dance & Party)', actionType: 'club_bar', propMeshType: 'dj_booth', x: 0, z: -4.8, w: 4.0, d: 1.4, collides: true, roomName: 'DJ Stage', accentHex: 0xa855f7 },
        { id: 'club_bar', label: 'VIP Bottle & Cocktail Bar', actionType: 'order_food', propMeshType: 'counter_desk', x: -6.4, z: -0.5, rotationY: Math.PI / 2, w: 1.4, d: 4.6, collides: true, roomName: 'Bar', accentHex: 0xec4899 },
        { id: 'club_vip', label: 'VIP Velvet Booth', actionType: 'sit_sofa', propMeshType: 'sofa', x: 5.4, z: -0.5, w: 2.6, d: 1.4, collides: true, roomName: 'VIP Section' },
      ],
      roomLabels: [
        { name: 'Dance Floor & DJ', x: 0, z: -2.0 },
        { name: 'Cocktail Bar', x: -5.5, z: 1.5 },
      ],
    };
  }

  if (category === 'gym' || category === 'stadium') {
    return {
      category,
      title: params.name,
      width: 18,
      depth: 14,
      spawnX: 0,
      spawnZ: 5.1,
      wallColorHex: 0x18181b,
      floorColorHex: category === 'stadium' ? 0x15803d : 0x27272a,
      floorTileGrid: true,
      walls: [],
      props: [
        exitProp,
        { id: 'gym_run_1', label: 'Cardio Workout (+Health & Happiness)', actionType: 'gym_workout', propMeshType: 'treadmill', x: -4.5, z: -2.6, w: 1.4, d: 2.2, collides: true, roomName: 'Cardio Zone', accentHex: 0x10b981 },
        { id: 'gym_run_2', label: 'Strength Conditioning (+Health)', actionType: 'gym_workout', propMeshType: 'treadmill', x: 4.5, z: -2.6, w: 1.4, d: 2.2, collides: true, roomName: 'Weights Zone', accentHex: 0xf59e0b },
        { id: 'gym_bar', label: 'Protein & Cold Hydration Bar', actionType: 'order_food', propMeshType: 'counter_desk', x: 0, z: -5.0, w: 3.4, d: 1.1, collides: true, roomName: 'Juice Bar', accentHex: 0x0ea5e9 },
      ],
      roomLabels: [
        { name: category === 'stadium' ? 'Arena Training Turf' : 'Training Floor', x: 0, z: -1.5 },
      ],
    };
  }

  if (category === 'warehouse' || category === 'factory') {
    return {
      category,
      title: params.name,
      width: 18,
      depth: 14,
      spawnX: 0,
      spawnZ: 5.1,
      wallColorHex: 0x475569,
      floorColorHex: 0x64748b,
      floorTileGrid: true,
      walls: [],
      props: [
        exitProp,
        { id: 'wh_stack_1', label: 'Inspect Cargo Pallets (+Shift Pay)', actionType: 'warehouse_shift', propMeshType: 'pallet_stack', x: -4.8, z: -2.2, w: 2.6, d: 2.2, collides: true, roomName: 'Bay A', accentHex: 0xf59e0b },
        { id: 'wh_stack_2', label: 'Logistics Dispatch Rack', actionType: 'warehouse_shift', propMeshType: 'shelf_rack', x: 4.8, z: -2.2, w: 1.6, d: 4.6, collides: true, roomName: 'Bay B', accentHex: 0xd97706 },
        { id: 'wh_desk', label: 'Operations Foreman Desk', actionType: 'work_desk', propMeshType: 'office_desk', x: 0, z: -4.5, w: 2.6, d: 1.2, collides: true, roomName: 'Control Desk' },
      ],
      roomLabels: [
        { name: 'Cargo & Production Floor', x: 0, z: -1.5 },
      ],
    };
  }

  if (category === 'petrol_station') {
    return {
      category,
      title: params.name,
      width: 18,
      depth: 14,
      spawnX: 0,
      spawnZ: 5.1,
      wallColorHex: 0xfef2f2,
      floorColorHex: 0xe2e8f0,
      floorTileGrid: true,
      walls: [],
      props: [
        exitProp,
        { id: 'fuel_till', label: 'Fuel Voucher & POS Counter', actionType: 'fuel_counter', propMeshType: 'counter_desk', x: 0, z: -4.2, w: 4.4, d: 1.2, collides: true, roomName: 'Station Mart', accentHex: 0xdc2626 },
        { id: 'fuel_drinks', label: 'Grab Chilled Drinks & Snacks', actionType: 'buy_groceries', propMeshType: 'fridge', x: 6.4, z: -3.8, w: 1.4, d: 1.1, collides: true, roomName: 'Cooler Wall', accentHex: 0x0ea5e9 },
      ],
      roomLabels: [
        { name: 'Mini Mart & Fuel POS', x: 0, z: -5.4 },
      ],
    };
  }

  if (category === 'dealership') {
    return {
      category,
      title: params.name,
      width: 18,
      depth: 14,
      spawnX: 0,
      spawnZ: 5.1,
      wallColorHex: 0xf8fafc,
      floorColorHex: 0x1e293b,
      floorTileGrid: true,
      walls: [],
      props: [
        exitProp,
        { id: 'dlr_car', label: 'Inspect Showroom Flagship Vehicle', actionType: 'showroom_car', propMeshType: 'car_plinth', x: -3.5, z: -1.5, w: 4.0, d: 2.2, collides: true, roomName: 'Showroom', accentHex: 0x0284c7 },
        { id: 'dlr_desk', label: 'Sales & Financing Desk', actionType: 'work_desk', propMeshType: 'office_desk', x: 5.2, z: -3.2, w: 2.8, d: 1.3, collides: true, roomName: 'Sales Office' },
      ],
      roomLabels: [
        { name: 'Luxury Auto Showroom', x: -2.0, z: -4.2 },
      ],
    };
  }

  if (category === 'police' || category === 'gov') {
    return {
      category,
      title: params.name,
      width: 18,
      depth: 14,
      spawnX: 0,
      spawnZ: 5.1,
      wallColorHex: 0xf1f5f9,
      floorColorHex: 0xcbd5e1,
      floorTileGrid: true,
      walls: [],
      props: [
        exitProp,
        { id: 'civic_desk', label: category === 'police' ? 'Clearance & Desk Sergeant' : 'Civic Affairs & Permit Desk', actionType: 'police_service', propMeshType: 'counter_desk', x: 0, z: -3.8, w: 5.6, d: 1.3, collides: true, roomName: 'Front Desk', accentHex: category === 'police' ? 0x0284c7 : 0x059669 },
        { id: 'civic_bench', label: 'Waiting Bench', actionType: 'sit_sofa', propMeshType: 'sofa', x: -5.4, z: 1.5, w: 2.6, d: 1.1, collides: true, roomName: 'Lobby' },
      ],
      roomLabels: [
        { name: category === 'police' ? 'Command Counter' : 'Federal Ministry Desk', x: 0, z: -5.0 },
      ],
    };
  }

  // Default: Modern Office / TechHub
  return {
    category: 'office',
    title: params.name,
    width: 18,
    depth: 14,
    spawnX: 0,
    spawnZ: 5.1,
    wallColorHex: 0xf8fafc,
    floorColorHex: 0x475569,
    floorTileGrid: true,
    walls: [],
    props: [
      exitProp,
      { id: 'ofc_desk_1', label: 'Complete Freelance Sprint (+NGN)', actionType: 'work_desk', propMeshType: 'office_desk', x: -4.2, z: -2.2, w: 2.4, d: 1.2, collides: true, roomName: 'Work Pods', accentHex: 0x10b981 },
      { id: 'ofc_desk_2', label: 'Executive Conference Desk', actionType: 'work_desk', propMeshType: 'office_desk', x: 4.2, z: -2.2, w: 2.4, d: 1.2, collides: true, roomName: 'Executive Desk', accentHex: 0x0ea5e9 },
      { id: 'ofc_coffee', label: 'Refreshment Bar', actionType: 'use_fridge', propMeshType: 'fridge', x: 7.2, z: -5.2, w: 1.2, d: 1.0, collides: true, roomName: 'Break Corner', accentHex: 0xcbd5e1 },
    ],
    roomLabels: [
      { name: 'Workstations', x: 0, z: -3.5 },
    ],
  };
}
