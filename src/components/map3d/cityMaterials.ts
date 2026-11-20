/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { CityTextureSet } from './cityTextures';

export interface CityMaterialSet {
  ground: THREE.MeshStandardMaterial;
  groundCanada: THREE.MeshStandardMaterial;
  asphaltRoad: THREE.MeshPhysicalMaterial;
  bridgeDeck: THREE.MeshPhysicalMaterial;
  sidewalk: THREE.MeshStandardMaterial;
  crosswalk: THREE.MeshStandardMaterial;
  parkingLot: THREE.MeshStandardMaterial;
  runway: THREE.MeshPhysicalMaterial;
  concretePier: THREE.MeshStandardMaterial;
  guardRail: THREE.MeshStandardMaterial;
  bridgeSteel: THREE.MeshStandardMaterial;
  waterSurface: THREE.MeshPhysicalMaterial;
  glassTower: THREE.MeshPhysicalMaterial;
  glassOffice: THREE.MeshPhysicalMaterial;
  residentialWindow: THREE.MeshStandardMaterial;
  generatorWindow: THREE.MeshStandardMaterial;
  concreteWall: THREE.MeshStandardMaterial;
  limestoneWall: THREE.MeshStandardMaterial;
  terracottaRoof: THREE.MeshStandardMaterial;
  slateRoof: THREE.MeshStandardMaterial;
  goldMetal: THREE.MeshStandardMaterial;
  crimsonMetal: THREE.MeshStandardMaterial;
  emeraldAccent: THREE.MeshStandardMaterial;
  skyAccent: THREE.MeshStandardMaterial;
  amberAccent: THREE.MeshStandardMaterial;
  darkBasalt: THREE.MeshStandardMaterial;
  foliage: THREE.MeshStandardMaterial;
  trunkWood: THREE.MeshStandardMaterial;
  streetLampBulb: THREE.MeshStandardMaterial;
  trafficGreenBulb: THREE.MeshStandardMaterial;
  trafficRedBulb: THREE.MeshStandardMaterial;
  headlightGlow: THREE.MeshBasicMaterial;
  taillightGlow: THREE.MeshBasicMaterial;
  pitchField: THREE.MeshStandardMaterial;
  updateDynamicState: (params: {
    nightFactor: number;
    isWet: boolean;
    isSnow: boolean;
    nepaLightOn: boolean;
    isCanada: boolean;
  }) => void;
  dispose: () => void;
}

export function createCityMaterials(textures: CityTextureSet): CityMaterialSet {
  const ground = new THREE.MeshStandardMaterial({
    map: textures.ground,
    roughness: 0.92,
    metalness: 0.02,
  });

  const groundCanada = new THREE.MeshStandardMaterial({
    map: textures.groundCanada,
    roughness: 0.9,
    metalness: 0.03,
  });

  const asphaltRoad = new THREE.MeshPhysicalMaterial({
    map: textures.asphaltRoad,
    color: 0xffffff,
    roughness: 0.85,
    metalness: 0.05,
    clearcoat: 0.0,
    clearcoatRoughness: 0.4,
  });

  const bridgeDeck = new THREE.MeshPhysicalMaterial({
    map: textures.bridgeDeck,
    color: 0xffffff,
    roughness: 0.82,
    metalness: 0.06,
    clearcoat: 0.0,
    clearcoatRoughness: 0.35,
  });

  const sidewalk = new THREE.MeshStandardMaterial({
    map: textures.sidewalk,
    roughness: 0.88,
    metalness: 0.03,
  });

  const crosswalk = new THREE.MeshStandardMaterial({
    map: textures.crosswalk,
    roughness: 0.78,
    metalness: 0.04,
    polygonOffset: true,
    polygonOffsetFactor: -1,
  });

  const parkingLot = new THREE.MeshStandardMaterial({
    map: textures.parkingLot,
    roughness: 0.86,
    metalness: 0.04,
  });

  const runway = new THREE.MeshPhysicalMaterial({
    map: textures.runway27,
    roughness: 0.8,
    metalness: 0.05,
    clearcoat: 0.0,
    clearcoatRoughness: 0.3,
  });

  const concretePier = new THREE.MeshStandardMaterial({
    color: 0x9ca3af,
    roughness: 0.85,
    metalness: 0.05,
  });

  const guardRail = new THREE.MeshStandardMaterial({
    color: 0xd1d5db,
    roughness: 0.42,
    metalness: 0.65,
  });

  const bridgeSteel = new THREE.MeshStandardMaterial({
    color: 0x475569,
    roughness: 0.45,
    metalness: 0.72,
  });

  const waterSurface = new THREE.MeshPhysicalMaterial({
    map: textures.waterRipple,
    color: 0x0ea5e9,
    roughness: 0.14,
    metalness: 0.15,
    clearcoat: 0.9,
    clearcoatRoughness: 0.12,
    reflectivity: 0.9,
  });

  // Reflective skyscraper glass with cool emissive glow at night
  const glassTower = new THREE.MeshPhysicalMaterial({
    map: textures.windowGlassColor,
    emissiveMap: textures.windowEmissiveCool,
    emissive: new THREE.Color(0x93c5fd),
    emissiveIntensity: 0.05,
    roughness: 0.18,
    metalness: 0.45,
    clearcoat: 0.75,
    clearcoatRoughness: 0.15,
  });

  const glassOffice = new THREE.MeshPhysicalMaterial({
    map: textures.windowGlassColor,
    emissiveMap: textures.windowEmissiveWarm,
    emissive: new THREE.Color(0xfcd34d),
    emissiveIntensity: 0.05,
    roughness: 0.25,
    metalness: 0.35,
    clearcoat: 0.55,
  });

  // Grid-dependent residential windows (dims during NEPA OFF in Nigeria!)
  const residentialWindow = new THREE.MeshStandardMaterial({
    map: textures.windowGlassColor,
    emissiveMap: textures.windowEmissiveWarm,
    emissive: new THREE.Color(0xfbbf24),
    emissiveIntensity: 0.05,
    roughness: 0.45,
    metalness: 0.15,
  });

  // Backup-generator landmarks (Hospital, CBN, Airport, Hilton stay lit 24/7)
  const generatorWindow = new THREE.MeshStandardMaterial({
    map: textures.windowGlassColor,
    emissiveMap: textures.windowEmissiveCool,
    emissive: new THREE.Color(0xfef08a),
    emissiveIntensity: 0.08,
    roughness: 0.3,
    metalness: 0.25,
  });

  const concreteWall = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    roughness: 0.8,
    metalness: 0.05,
  });

  const limestoneWall = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9,
    roughness: 0.74,
    metalness: 0.06,
  });

  const terracottaRoof = new THREE.MeshStandardMaterial({
    color: 0xb45309,
    roughness: 0.72,
    metalness: 0.08,
  });

  const slateRoof = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.68,
    metalness: 0.15,
  });

  const goldMetal = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    roughness: 0.26,
    metalness: 0.85,
  });

  const crimsonMetal = new THREE.MeshStandardMaterial({
    color: 0xdc2626,
    roughness: 0.42,
    metalness: 0.25,
  });

  const emeraldAccent = new THREE.MeshStandardMaterial({
    color: 0x10b981,
    roughness: 0.4,
    metalness: 0.22,
  });

  const skyAccent = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    roughness: 0.35,
    metalness: 0.3,
  });

  const amberAccent = new THREE.MeshStandardMaterial({
    color: 0xd97706,
    roughness: 0.45,
    metalness: 0.2,
  });

  const darkBasalt = new THREE.MeshStandardMaterial({
    color: 0x3f3f46,
    roughness: 0.92,
    metalness: 0.05,
    flatShading: true,
  });

  const foliage = new THREE.MeshStandardMaterial({
    color: 0x15803d,
    roughness: 0.85,
    metalness: 0.02,
    flatShading: true,
  });

  const trunkWood = new THREE.MeshStandardMaterial({
    color: 0x5c4033,
    roughness: 0.92,
    metalness: 0.02,
  });

  const streetLampBulb = new THREE.MeshStandardMaterial({
    color: 0xfef08a,
    emissive: new THREE.Color(0xf59e0b),
    emissiveIntensity: 0.15,
    roughness: 0.2,
  });

  const trafficGreenBulb = new THREE.MeshStandardMaterial({
    color: 0x22c55e,
    emissive: new THREE.Color(0x22c55e),
    emissiveIntensity: 1.2,
    roughness: 0.2,
  });

  const trafficRedBulb = new THREE.MeshStandardMaterial({
    color: 0xef4444,
    emissive: new THREE.Color(0xef4444),
    emissiveIntensity: 1.1,
    roughness: 0.2,
  });

  const headlightGlow = new THREE.MeshBasicMaterial({
    color: 0xfef9c3,
    transparent: true,
    opacity: 0.85,
  });

  const taillightGlow = new THREE.MeshBasicMaterial({
    color: 0xff2d2d,
    transparent: true,
    opacity: 0.85,
  });

  const pitchField = new THREE.MeshStandardMaterial({
    map: textures.pitchField,
    roughness: 0.9,
    metalness: 0.02,
  });

  const allMaterials: THREE.Material[] = [
    ground,
    groundCanada,
    asphaltRoad,
    bridgeDeck,
    sidewalk,
    crosswalk,
    parkingLot,
    runway,
    concretePier,
    guardRail,
    bridgeSteel,
    waterSurface,
    glassTower,
    glassOffice,
    residentialWindow,
    generatorWindow,
    concreteWall,
    limestoneWall,
    terracottaRoof,
    slateRoof,
    goldMetal,
    crimsonMetal,
    emeraldAccent,
    skyAccent,
    amberAccent,
    darkBasalt,
    foliage,
    trunkWood,
    streetLampBulb,
    trafficGreenBulb,
    trafficRedBulb,
    headlightGlow,
    taillightGlow,
    pitchField,
  ];

  const updateDynamicState = ({
    nightFactor,
    isWet,
    isSnow,
    nepaLightOn,
    isCanada,
  }: {
    nightFactor: number;
    isWet: boolean;
    isSnow: boolean;
    nepaLightOn: boolean;
    isCanada: boolean;
  }) => {
    // 1. Wet roads & runway reflectivity during Rain / Heavy Rain / Thunderstorm
    const roadRoughness = isWet ? 0.16 : 0.85;
    const roadClearcoat = isWet ? 0.88 : 0.0;
    const roadTint = isWet ? 0xcad3df : 0xffffff;

    asphaltRoad.roughness = roadRoughness;
    asphaltRoad.clearcoat = roadClearcoat;
    asphaltRoad.color.setHex(roadTint);

    bridgeDeck.roughness = isWet ? 0.18 : 0.82;
    bridgeDeck.clearcoat = isWet ? 0.84 : 0.0;
    bridgeDeck.color.setHex(roadTint);

    runway.roughness = isWet ? 0.17 : 0.8;
    runway.clearcoat = isWet ? 0.85 : 0.0;

    // 2. Snow seasonal tinting on ground & roofs when snowfall is active
    if (isSnow) {
      groundCanada.color.setHex(0xdbeafe);
      terracottaRoof.color.setHex(0xcbd5e1);
      slateRoof.color.setHex(0x94a3b8);
      foliage.color.setHex(0x64748b);
    } else {
      groundCanada.color.setHex(0xffffff);
      terracottaRoof.color.setHex(0xb45309);
      slateRoof.color.setHex(0x334155);
      foliage.color.setHex(0x15803d);
    }

    // 3. Nighttime Building Windows & Streetlamps (Reacting to NEPA grid in Nigeria!)
    const gridPowerFactor = isCanada || nepaLightOn ? 1.0 : 0.14; // Backup inverters keep minimal dim lights
    const nightBoost = Math.max(0, Math.min(1, nightFactor));

    generatorWindow.emissiveIntensity = 0.06 + nightBoost * 1.45;
    glassTower.emissiveIntensity = 0.05 + nightBoost * (0.65 + 0.75 * gridPowerFactor);
    glassOffice.emissiveIntensity = 0.05 + nightBoost * (0.45 + 0.85 * gridPowerFactor);
    residentialWindow.emissiveIntensity = 0.03 + nightBoost * (1.35 * gridPowerFactor);

    streetLampBulb.emissiveIntensity = 0.1 + nightBoost * (isCanada || nepaLightOn ? 2.6 : 0.35);
    headlightGlow.opacity = 0.25 + nightBoost * 0.72;
    taillightGlow.opacity = 0.35 + nightBoost * 0.65;
  };

  return {
    ground,
    groundCanada,
    asphaltRoad,
    bridgeDeck,
    sidewalk,
    crosswalk,
    parkingLot,
    runway,
    concretePier,
    guardRail,
    bridgeSteel,
    waterSurface,
    glassTower,
    glassOffice,
    residentialWindow,
    generatorWindow,
    concreteWall,
    limestoneWall,
    terracottaRoof,
    slateRoof,
    goldMetal,
    crimsonMetal,
    emeraldAccent,
    skyAccent,
    amberAccent,
    darkBasalt,
    foliage,
    trunkWood,
    streetLampBulb,
    trafficGreenBulb,
    trafficRedBulb,
    headlightGlow,
    taillightGlow,
    pitchField,
    updateDynamicState,
    dispose: () => {
      allMaterials.forEach((m) => m.dispose());
    },
  };
}
