/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LocationPOI, POIType } from '../../types/game';

export type ArchitecturalStyle =
  | 'bungalow'
  | 'detached_house'
  | 'semi_detached'
  | 'duplex'
  | 'mansion'
  | 'apartment'
  | 'estate'
  | 'hotel'
  | 'restaurant'
  | 'mall'
  | 'supermarket'
  | 'bank'
  | 'hospital'
  | 'school'
  | 'university'
  | 'office'
  | 'gov'
  | 'police'
  | 'church'
  | 'mosque'
  | 'club'
  | 'warehouse'
  | 'factory'
  | 'petrol_station'
  | 'dealership'
  | 'boutique'
  | 'salon'
  | 'market'
  | 'stadium'
  | 'gym'
  | 'airport'
  | 'park';

export interface BuildingIdentityProfile {
  seed: number;
  style: ArchitecturalStyle;
  wallHex: number;
  trimHex: number;
  roofHex: number;
  accentHex: number;
  windowHex: number;
  roofShape: 'hipped' | 'gabled' | 'flat_parapet' | 'stepped' | 'dome' | 'vault';
  hasFence: boolean;
  hasGarden: boolean;
  hasBalcony: boolean;
  hasParking: boolean;
  parkedCars: number;
  rotationQuarterTurns: number;
  regionFlavor: 'northern' | 'lagos_coastal' | 'abuja_modern' | 'eastern_manor' | 'canada';
}

export function hashBuildingSeed(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

const WALL_PALETTES = [
  0xf3efe6, // Warm Ivory Stucco
  0xe7d8c3, // Savannah Sandstone
  0xd6e4dc, // Mint Cream
  0xe2e8f0, // Architectural Cool Stone
  0xf2d9c9, // Soft Peach Terracotta
  0xcbd5e1, // Brushed Cement
  0xd9cbb8, // Colonial Ochre
  0xfaf5eb, // Bright Plaster
];

const ROOF_PALETTES = [
  0x8c2f1d, // Nigerian Terracotta Tile
  0x1e293b, // Charcoal Slate
  0x065f46, // Emerald Gerard Tile
  0x1d4ed8, // Royal Cobalt Sheet
  0x7c2d12, // Burnished Bronze
  0x334155, // Gunmetal Shingle
];

const ACCENT_PALETTES = [
  0x10b981,
  0xf59e0b,
  0x0284c7,
  0xe11d48,
  0x8b5cf6,
  0xd97706,
];

function inferStyleFromPOI(loc: LocationPOI, isHome: boolean, seed: number): ArchitecturalStyle {
  const n = (loc.name || '').toLowerCase();
  const t: POIType = loc.type;

  if (t === 'home' || isHome) {
    if (n.includes('mansion') || n.includes('palace') || n.includes('villa')) return 'mansion';
    if (n.includes('bungalow')) return 'bungalow';
    if (n.includes('semi')) return 'semi_detached';
    if (n.includes('estate')) return 'estate';
    if (n.includes('flat') || n.includes('studio') || n.includes('apartment')) return 'apartment';
    if (n.includes('duplex')) return 'duplex';
    return seed % 2 === 0 ? 'duplex' : 'detached_house';
  }

  switch (t) {
    case 'bungalow':
      return 'bungalow';
    case 'detached_house':
      return 'detached_house';
    case 'semi_detached':
      return 'semi_detached';
    case 'duplex':
      return 'duplex';
    case 'mansion':
      return 'mansion';
    case 'apartment':
      return 'apartment';
    case 'estate':
      return 'estate';
    case 'hotel':
      return 'hotel';
    case 'restaurant':
    case 'eatery':
      return 'restaurant';
    case 'mall':
      return 'mall';
    case 'supermarket':
      return 'supermarket';
    case 'bank':
      return 'bank';
    case 'hospital':
      return 'hospital';
    case 'school':
      return 'school';
    case 'university':
      return 'university';
    case 'techhub':
    case 'office':
      return 'office';
    case 'gov':
    case 'court':
      return 'gov';
    case 'police':
      return 'police';
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
      return n.includes('petrol') || n.includes('fuel') || n.includes('nnpc') ? 'petrol_station' : 'factory';
    case 'petrol_station':
      return 'petrol_station';
    case 'dealership':
      return 'dealership';
    case 'boutique':
      return 'boutique';
    case 'salon':
      return 'salon';
    case 'market':
      return 'market';
    case 'stadium':
      return 'stadium';
    case 'gym':
      return 'gym';
    case 'airport':
      return 'airport';
    case 'zoo':
    case 'golf':
    case 'lake':
      return 'park';
    default:
      if (n.includes('petrol') || n.includes('nnpc') || n.includes('filling')) return 'petrol_station';
      if (n.includes('warehouse') || n.includes('depot')) return 'warehouse';
      if (n.includes('factory') || n.includes('plant')) return 'factory';
      if (n.includes('salon') || n.includes('barber')) return 'salon';
      return 'office';
  }
}

export function resolveBuildingIdentity(
  loc: LocationPOI,
  options?: { isHome?: boolean; stateId?: string }
): BuildingIdentityProfile {
  const seed = hashBuildingSeed(`${loc.id}_${loc.name}_${loc.x}_${loc.y}`);
  const style = inferStyleFromPOI(loc, Boolean(options?.isHome), seed);
  const st = (options?.stateId || '').toLowerCase();

  let regionFlavor: BuildingIdentityProfile['regionFlavor'] = 'lagos_coastal';
  if (st === 'canada') regionFlavor = 'canada';
  else if (['kano', 'kaduna', 'sokoto', 'katsina', 'borno', 'bauchi', 'kebbi', 'zamfara', 'yobe', 'jigawa', 'gombe'].includes(st)) {
    regionFlavor = 'northern';
  } else if (['fct', 'fct_abuja', 'abuja'].includes(st)) {
    regionFlavor = 'abuja_modern';
  } else if (['imo', 'anambra', 'enugu', 'abia', 'ebonyi', 'rivers', 'delta'].includes(st)) {
    regionFlavor = 'eastern_manor';
  }

  const roofShapes: BuildingIdentityProfile['roofShape'][] = [
    'hipped',
    'gabled',
    'flat_parapet',
    'stepped',
    'vault',
  ];

  const wallHex =
    regionFlavor === 'northern'
      ? WALL_PALETTES[(seed + 1) % 3 === 0 ? 1 : 4]
      : WALL_PALETTES[seed % WALL_PALETTES.length];
  const roofHex =
    regionFlavor === 'canada'
      ? 0x334155
      : ROOF_PALETTES[(seed >> 3) % ROOF_PALETTES.length];

  return {
    seed,
    style,
    wallHex,
    trimHex: seed % 2 === 0 ? 0xf8fafc : 0x334155,
    roofHex,
    accentHex: ACCENT_PALETTES[(seed >> 5) % ACCENT_PALETTES.length],
    windowHex: seed % 3 === 0 ? 0x38bdf8 : 0x60a5fa,
    roofShape: style === 'mosque' ? 'dome' : roofShapes[(seed >> 2) % roofShapes.length],
    hasFence:
      ['detached_house', 'semi_detached', 'duplex', 'mansion', 'estate', 'police', 'school', 'hospital'].includes(style) ||
      seed % 3 !== 0,
    hasGarden:
      ['bungalow', 'detached_house', 'mansion', 'estate', 'hotel', 'park', 'university', 'church'].includes(style) ||
      seed % 2 === 0,
    hasBalcony: ['duplex', 'mansion', 'apartment', 'hotel', 'semi_detached'].includes(style),
    hasParking: !['market', 'mosque', 'church', 'park'].includes(style),
    parkedCars: ['mall', 'supermarket', 'hotel', 'bank', 'dealership', 'office', 'hospital'].includes(style)
      ? 2 + (seed % 3)
      : seed % 2,
    rotationQuarterTurns: style === 'mall' || style === 'stadium' || style === 'airport' ? 0 : seed % 4 === 0 ? 1 : 0,
    regionFlavor,
  };
}
