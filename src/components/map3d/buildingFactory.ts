/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { LocationPOI, POIType } from '../../types/game';
import { CityMaterialSet } from './cityMaterials';

export function poiPercentToWorld(xPct: number, yPct: number): { x: number; z: number } {
  return {
    x: (xPct - 50) * 3.6,
    z: (yPct - 50) * 2.6,
  };
}

export interface BuiltPOIEntry {
  loc: LocationPOI;
  group: THREE.Group;
  hitMesh: THREE.Mesh;
  topHeight: number;
  beaconLightMesh?: THREE.Mesh;
}

// Deterministic hash from string id for subtle architectural variation
function hashString(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

// Color accent palette for varied commercial & market canopies
const STALL_COLORS = [0xef4444, 0xf59e0b, 0x10b981, 0x3b82f6, 0xec4899, 0x8b5cf6];

export class CityBuildingBuilder {
  private mats: CityMaterialSet;
  private disposableGeometries: THREE.BufferGeometry[] = [];
  private disposableMaterials: THREE.Material[] = [];

  // Cached shared unit geometries
  private unitBox = new THREE.BoxGeometry(1, 1, 1);
  private unitCyl = new THREE.CylinderGeometry(1, 1, 1, 16);
  private unitCone = new THREE.ConeGeometry(1, 1, 4);
  private unitSphere = new THREE.SphereGeometry(1, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.52);

  constructor(mats: CityMaterialSet) {
    this.mats = mats;
    this.disposableGeometries.push(this.unitBox, this.unitCyl, this.unitCone, this.unitSphere);
  }

  private addPart(
    parent: THREE.Object3D,
    geo: THREE.BufferGeometry,
    mat: THREE.Material,
    sx: number,
    sy: number,
    sz: number,
    px: number,
    py: number,
    pz: number,
    castShadow = true,
    receiveShadow = true,
    ry = 0
  ): THREE.Mesh {
    const mesh = new THREE.Mesh(geo, mat);
    mesh.scale.set(sx, sy, sz);
    mesh.position.set(px, py, pz);
    if (ry !== 0) mesh.rotation.y = ry;
    mesh.castShadow = castShadow;
    mesh.receiveShadow = receiveShadow;
    parent.add(mesh);
    return mesh;
  }

  private getTintMaterial(hex: number, roughness = 0.65, metalness = 0.1): THREE.MeshStandardMaterial {
    const m = new THREE.MeshStandardMaterial({ color: hex, roughness, metalness });
    this.disposableMaterials.push(m);
    return m;
  }

  public buildLandmarkPOI(
    loc: LocationPOI,
    options?: { isHome?: boolean; isCnTower?: boolean; reduceShadows?: boolean }
  ): BuiltPOIEntry {
    const group = new THREE.Group();
    const seed = hashString(loc.id || loc.name);
    const floors = Math.max(1, loc.floorsCount || (loc.type === 'hotel' || loc.type === 'bank' ? 4 : 2));
    const shadows = !options?.reduceShadows;
    let topHeight = 8;
    let beaconLightMesh: THREE.Mesh | undefined;

    const type: POIType = options?.isHome ? 'home' : loc.type;

    // Concrete sidewalk pad beneath every urban building
    this.addPart(group, this.unitBox, this.mats.sidewalk, 11.5, 0.3, 9.5, 0, 0.15, 0, false, true);

    if (options?.isCnTower || loc.id.includes('cntower') || loc.name.toLowerCase().includes('cn tower')) {
      // Landmark CN Tower in Canada
      this.addPart(group, this.unitCyl, this.mats.concreteWall, 2.8, 2.5, 2.8, 0, 1.4, 0, shadows, true);
      this.addPart(group, this.unitCyl, this.mats.limestoneWall, 1.0, 22, 1.0, 0, 13.5, 0, shadows, true);
      this.addPart(group, this.unitCyl, this.mats.glassTower, 3.2, 2.2, 3.2, 0, 20.5, 0, shadows, true);
      this.addPart(group, this.unitCyl, this.mats.skyAccent, 2.6, 0.6, 2.6, 0, 22.0, 0, shadows, true);
      this.addPart(group, this.unitCyl, this.mats.crimsonMetal, 0.35, 8.5, 0.35, 0, 26.5, 0, shadows, false);
      beaconLightMesh = this.addPart(group, this.unitSphere, this.mats.crimsonMetal, 0.45, 0.45, 0.45, 0, 31.0, 0, false, false);
      topHeight = 32;
    } else if (type === 'home') {
      // Nigerian Residential Estate / Player Compound
      const wallH = 1.1;
      // Perimeter compound wall
      this.addPart(group, this.unitBox, this.mats.limestoneWall, 10.6, wallH, 0.35, 0, wallH / 2 + 0.3, -4.2, shadows, true);
      this.addPart(group, this.unitBox, this.mats.limestoneWall, 0.35, wallH, 8.4, -5.1, wallH / 2 + 0.3, 0, shadows, true);
      this.addPart(group, this.unitBox, this.mats.limestoneWall, 0.35, wallH, 8.4, 5.1, wallH / 2 + 0.3, 0, shadows, true);
      // Security Gatehouse
      this.addPart(group, this.unitBox, this.mats.emeraldAccent, 1.8, 1.8, 1.6, 3.2, 1.2, 3.5, shadows, true);
      this.addPart(group, this.unitCone, this.mats.terracottaRoof, 1.4, 0.9, 1.4, 3.2, 2.55, 3.5, shadows, true, Math.PI / 4);
      // Main House Duplex/Mansion
      const houseH = 2.6 + Math.min(3, floors) * 1.4;
      this.addPart(group, this.unitBox, this.mats.residentialWindow, 6.2, houseH, 5.2, -0.4, houseH / 2 + 0.3, -0.4, shadows, true);
      // Terrace balcony overhang
      this.addPart(group, this.unitBox, this.mats.limestoneWall, 6.6, 0.35, 1.8, -0.4, houseH * 0.55 + 0.3, 2.2, shadows, true);
      // Pitched Hip/Pyramid Terracotta Roof
      this.addPart(group, this.unitCone, this.mats.terracottaRoof, 5.0, 2.2, 4.4, -0.4, houseH + 1.35, -0.4, shadows, true, Math.PI / 4);
      // Overhead Black Water Tank Stand
      this.addPart(group, this.unitBox, this.mats.bridgeSteel, 1.1, 2.6, 1.1, 3.6, 1.6, -2.5, shadows, true);
      this.addPart(group, this.unitCyl, this.mats.slateRoof, 0.7, 1.3, 0.7, 3.6, 3.5, -2.5, shadows, true);
      topHeight = houseH + 3.2;
    } else if (type === 'hospital') {
      // Multi-Wing Teaching Hospital with Crimson Red Cross & Rooftop Helipad
      const mainH = 4.6 + Math.min(3, floors) * 1.3;
      this.addPart(group, this.unitBox, this.mats.limestoneWall, 9.8, 1.8, 7.2, 0, 1.2, 0, shadows, true);
      this.addPart(group, this.unitBox, this.mats.generatorWindow, 7.6, mainH, 4.4, 0, mainH / 2 + 1.2, -0.6, shadows, true);
      // Left & Right Clinical Wings
      this.addPart(group, this.unitBox, this.mats.generatorWindow, 2.4, mainH * 0.75, 6.4, -3.4, mainH * 0.375 + 1.2, 0.3, shadows, true);
      this.addPart(group, this.unitBox, this.mats.generatorWindow, 2.4, mainH * 0.75, 6.4, 3.4, mainH * 0.375 + 1.2, 0.3, shadows, true);
      // Emergency entrance canopy
      this.addPart(group, this.unitBox, this.mats.skyAccent, 3.4, 0.35, 2.4, 0, 2.2, 2.6, shadows, true);
      // Rooftop Helipad Pad + Red Cross
      this.addPart(group, this.unitCyl, this.mats.slateRoof, 2.1, 0.25, 2.1, -1.6, mainH + 1.35, -0.6, shadows, true);
      this.addPart(group, this.unitBox, this.mats.crimsonMetal, 2.2, 0.25, 0.65, 1.8, mainH + 1.35, -0.6, false, true);
      this.addPart(group, this.unitBox, this.mats.crimsonMetal, 0.65, 0.25, 2.2, 1.8, mainH + 1.35, -0.6, false, true);
      topHeight = mainH + 2.4;
    } else if (type === 'bank' || type === 'techhub') {
      // Sleek Glass Financial Skyscraper / Telecom Tower
      const towerH = 8.5 + Math.min(5, floors) * 2.2 + (seed % 4);
      this.addPart(group, this.unitBox, this.mats.limestoneWall, 8.6, 2.0, 7.6, 0, 1.3, 0, shadows, true);
      this.addPart(group, this.unitBox, this.mats.glassTower, 5.8, towerH, 5.4, 0, towerH / 2 + 2.0, 0, shadows, true);
      // Architectural upper setback crown
      this.addPart(group, this.unitBox, this.mats.generatorWindow, 4.0, 3.2, 3.8, 0, towerH + 3.4, 0, shadows, true);
      // Helipad / Spire antenna
      this.addPart(group, this.unitCyl, this.mats.bridgeSteel, 0.18, 4.2, 0.18, 0, towerH + 6.9, 0, shadows, false);
      beaconLightMesh = this.addPart(group, this.unitSphere, this.mats.emeraldAccent, 0.38, 0.38, 0.38, 0, towerH + 9.0, 0, false, false);
      topHeight = towerH + 9.2;
    } else if (type === 'hotel') {
      // Tiered 5-Star Luxury Hotel with Rooftop/Terrace Pool
      const h = 7.2 + Math.min(5, floors) * 1.9;
      this.addPart(group, this.unitBox, this.mats.limestoneWall, 9.6, 2.0, 7.8, 0, 1.3, 0, shadows, true);
      this.addPart(group, this.unitBox, this.mats.glassOffice, 7.4, h, 4.4, 0, h / 2 + 2.0, -1.1, shadows, true);
      // Terraced Turquoise Pool Courtyard
      this.addPart(group, this.unitBox, this.mats.waterSurface, 4.8, 0.25, 2.4, 0, 2.45, 2.4, false, true);
      // Gold rooftop trim parapet
      this.addPart(group, this.unitBox, this.mats.goldMetal, 7.7, 0.45, 4.7, 0, h + 2.2, -1.1, shadows, true);
      topHeight = h + 3.2;
    } else if (type === 'mall' || type === 'supermarket') {
      // Multi-Wing Modern Shopping Mall with Skylight Atrium & Parking Apron
      const h = 3.8 + Math.min(2, floors) * 1.0;
      this.addPart(group, this.unitBox, this.mats.limestoneWall, 9.6, h, 5.4, 0, h / 2 + 0.3, -1.4, shadows, true);
      // Glass Sky-lit Barrel Vault Atrium
      this.addPart(group, this.unitBox, this.mats.glassTower, 5.2, 1.2, 4.4, 0, h + 0.8, -1.4, shadows, true);
      // Colored Brand Signage Fascia
      this.addPart(
        group,
        this.unitBox,
        type === 'mall' ? this.mats.amberAccent : this.mats.emeraldAccent,
        8.6,
        0.75,
        0.4,
        0,
        h - 0.1,
        1.35,
        shadows,
        false
      );
      // Paved Parking Lot in front
      this.addPart(group, this.unitBox, this.mats.parkingLot, 9.6, 0.12, 3.0, 0, 0.36, 2.8, false, true);
      topHeight = h + 2.0;
    } else if (type === 'market') {
      // Bustling Open-Air Nigerian Market with Colorful Stall Rows
      this.addPart(group, this.unitBox, this.mats.concreteWall, 10.4, 0.4, 8.4, 0, 0.5, 0, false, true);
      for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 3; col++) {
          const sx = (col - 1) * 3.1;
          const sz = row === 0 ? -2.1 : 2.1;
          const stallMat = this.getTintMaterial(STALL_COLORS[(seed + row * 3 + col) % STALL_COLORS.length], 0.6, 0.1);
          this.addPart(group, this.unitBox, this.mats.concreteWall, 2.4, 1.5, 2.6, sx, 1.4, sz, shadows, true);
          this.addPart(group, this.unitBox, stallMat, 2.7, 0.35, 3.0, sx, 2.35, sz, shadows, true);
        }
      }
      // Central Market Clock Archway
      this.addPart(group, this.unitBox, this.mats.amberAccent, 1.6, 3.8, 1.6, 0, 2.2, 0, shadows, true);
      topHeight = 4.4;
    } else if (type === 'church') {
      // Cathedral Basilica with Steep Nave Roof & Tall Spire
      this.addPart(group, this.unitBox, this.mats.limestoneWall, 6.4, 3.6, 7.6, 0, 2.1, 0, shadows, true);
      this.addPart(group, this.unitCone, this.mats.slateRoof, 5.2, 2.4, 6.2, 0, 5.1, 0.2, shadows, true, Math.PI / 4);
      // Bell Tower Spire
      this.addPart(group, this.unitBox, this.mats.limestoneWall, 2.2, 6.5, 2.2, 0, 3.55, 2.8, shadows, true);
      this.addPart(group, this.unitCone, this.mats.crimsonMetal, 1.8, 3.4, 1.8, 0, 8.5, 2.8, shadows, true, Math.PI / 4);
      // Golden Cross on Spire
      this.addPart(group, this.unitBox, this.mats.goldMetal, 0.22, 1.4, 0.22, 0, 10.6, 2.8, false, false);
      this.addPart(group, this.unitBox, this.mats.goldMetal, 0.85, 0.22, 0.22, 0, 10.8, 2.8, false, false);
      topHeight = 11.6;
    } else if (type === 'mosque') {
      // Grand Mosque with Golden Central Dome & 4 Corner Minarets
      this.addPart(group, this.unitBox, this.mats.limestoneWall, 7.8, 3.2, 7.2, 0, 1.9, 0, shadows, true);
      // Grand Central Dome
      this.addPart(group, this.unitSphere, this.mats.goldMetal, 2.6, 2.4, 2.6, 0, 3.5, 0, shadows, true);
      // 4 Minarets
      const offsets = [
        [-3.4, -3.1],
        [3.4, -3.1],
        [-3.4, 3.1],
        [3.4, 3.1],
      ];
      for (const [mx, mz] of offsets) {
        this.addPart(group, this.unitCyl, this.mats.limestoneWall, 0.55, 6.4, 0.55, mx, 3.5, mz, shadows, true);
        this.addPart(group, this.unitSphere, this.mats.goldMetal, 0.65, 0.9, 0.65, mx, 6.7, mz, shadows, false);
      }
      topHeight = 8.0;
    } else if (type === 'gov' || type === 'court') {
      // Capitol / National Assembly Complex with Green/Gold Dome & Classical Colonnade
      this.addPart(group, this.unitBox, this.mats.limestoneWall, 9.6, 3.6, 6.4, 0, 2.1, -0.4, shadows, true);
      // Front Columns
      for (let c = -3.4; c <= 3.4; c += 1.7) {
        this.addPart(group, this.unitCyl, this.mats.concreteWall, 0.3, 3.6, 0.3, c, 2.1, 3.1, shadows, true);
      }
      this.addPart(group, this.unitBox, this.mats.limestoneWall, 8.6, 0.5, 1.4, 0, 4.15, 3.0, shadows, true);
      // Central Dome (Emerald for Nigeria Gov, Gold for Court)
      const domeMat = type === 'gov' ? this.mats.emeraldAccent : this.mats.goldMetal;
      this.addPart(group, this.unitCyl, this.mats.limestoneWall, 2.4, 1.4, 2.4, 0, 4.5, -0.4, shadows, true);
      this.addPart(group, this.unitSphere, domeMat, 2.35, 2.2, 2.35, 0, 5.2, -0.4, shadows, true);
      topHeight = 7.8;
    } else if (type === 'university' || type === 'school') {
      // Campus Quadrangle & Clock Tower
      this.addPart(group, this.unitBox, this.mats.glassOffice, 9.2, 3.2, 2.8, 0, 1.9, -2.6, shadows, true);
      this.addPart(group, this.unitBox, this.mats.limestoneWall, 2.6, 2.8, 5.2, -3.4, 1.7, 0.6, shadows, true);
      this.addPart(group, this.unitBox, this.mats.limestoneWall, 2.6, 2.8, 5.2, 3.4, 1.7, 0.6, shadows, true);
      // Clock Tower
      this.addPart(group, this.unitBox, this.mats.terracottaRoof, 2.0, 6.2, 2.0, 0, 3.4, -2.6, shadows, true);
      this.addPart(group, this.unitCone, this.mats.slateRoof, 1.7, 2.0, 1.7, 0, 7.5, -2.6, shadows, true, Math.PI / 4);
      // Green Courtyard Quad
      this.addPart(group, this.unitBox, this.mats.foliage, 3.8, 0.2, 3.8, 0, 0.4, 1.0, false, true);
      topHeight = 8.8;
    } else if (type === 'stadium') {
      // Oval Sports Arena with Emerald Pitch & 4 Tall Floodlight Masts
      this.addPart(group, this.unitCyl, this.mats.concreteWall, 5.4, 2.4, 4.4, 0, 1.5, 0, shadows, true);
      this.addPart(group, this.unitBox, this.mats.pitchField, 6.2, 0.25, 4.2, 0, 2.7, 0, false, true);
      // Rim canopy
      this.addPart(group, this.unitBox, this.mats.emeraldAccent, 9.8, 0.45, 1.2, 0, 3.0, -3.4, shadows, true);
      this.addPart(group, this.unitBox, this.mats.emeraldAccent, 9.8, 0.45, 1.2, 0, 3.0, 3.4, shadows, true);
      const poles = [
        [-4.5, -3.6],
        [4.5, -3.6],
        [-4.5, 3.6],
        [4.5, 3.6],
      ];
      for (const [fx, fz] of poles) {
        this.addPart(group, this.unitCyl, this.mats.bridgeSteel, 0.2, 5.8, 0.2, fx, 3.2, fz, shadows, false);
        this.addPart(group, this.unitBox, this.mats.streetLampBulb, 0.9, 0.45, 0.35, fx, 6.2, fz, false, false);
      }
      topHeight = 6.8;
    } else if (type === 'police') {
      // Tactical Police Station with Blue Band & Comms Tower
      this.addPart(group, this.unitBox, this.mats.concreteWall, 8.2, 3.4, 6.0, 0, 2.0, 0, shadows, true);
      this.addPart(group, this.unitBox, this.mats.skyAccent, 8.5, 0.55, 6.3, 0, 3.4, 0, shadows, false);
      this.addPart(group, this.unitCyl, this.mats.bridgeSteel, 0.2, 4.2, 0.2, 2.8, 5.4, -1.6, shadows, false);
      beaconLightMesh = this.addPart(group, this.unitSphere, this.mats.skyAccent, 0.38, 0.38, 0.38, 2.8, 7.6, -1.6, false, false);
      topHeight = 7.8;
    } else if (type === 'airport') {
      // Terminal Building & Approach Pad (plus main Airport Complex in infrastructure)
      this.addPart(group, this.unitBox, this.mats.glassTower, 9.4, 3.2, 5.2, 0, 1.9, 0, shadows, true);
      this.addPart(group, this.unitBox, this.mats.skyAccent, 9.8, 0.4, 5.6, 0, 3.7, 0, shadows, true);
      this.addPart(group, this.unitCyl, this.mats.limestoneWall, 1.0, 7.5, 1.0, 3.6, 4.0, -2.0, shadows, true);
      this.addPart(group, this.unitCyl, this.mats.glassTower, 1.6, 1.3, 1.6, 3.6, 8.2, -2.0, shadows, true);
      topHeight = 9.2;
    } else if (type === 'club' || type === 'betting') {
      // Neon-Lit Entertainment Lounge / Sports Hub
      const h = 4.2 + (seed % 3);
      const accentMat = type === 'club'
        ? this.getTintMaterial(0xa855f7, 0.35, 0.3)
        : this.mats.amberAccent;
      this.addPart(group, this.unitBox, this.mats.slateRoof, 7.8, h, 6.4, 0, h / 2 + 0.3, 0, shadows, true);
      this.addPart(group, this.unitBox, accentMat, 8.1, 0.45, 6.7, 0, h + 0.3, 0, shadows, false);
      this.addPart(group, this.unitBox, this.mats.glassTower, 6.0, h * 0.55, 0.25, 0, h * 0.45, 3.22, false, false);
      topHeight = h + 1.2;
    } else if (type === 'zoo' || type === 'golf' || type === 'lake') {
      // Scenic Park / Golf Greens / Lakeside Pavilion
      this.addPart(group, this.unitBox, this.mats.foliage, 10.2, 0.35, 8.2, 0, 0.48, 0, false, true);
      this.addPart(group, this.unitBox, type === 'lake' ? this.mats.waterSurface : this.mats.emeraldAccent, 5.8, 0.3, 4.6, -1.2, 0.65, 0.4, false, true);
      this.addPart(group, this.unitBox, this.mats.terracottaRoof, 3.2, 2.2, 2.8, 2.8, 1.5, -1.8, shadows, true);
      topHeight = 3.2;
    } else {
      // Eatery / Restaurant / Gym / Dealership / Mechanic / Boutique (Distinct Multi-Part Urban Form)
      const h = 3.2 + Math.min(3, floors) * 1.3 + (seed % 2);
      const roofColor =
        type === 'eatery' || type === 'restaurant'
          ? this.mats.crimsonMetal
          : type === 'dealership'
          ? this.mats.skyAccent
          : type === 'gym'
          ? this.mats.amberAccent
          : this.mats.slateRoof;
      const bodyMat = type === 'dealership' || type === 'boutique' ? this.mats.glassOffice : this.mats.concreteWall;
      this.addPart(group, this.unitBox, bodyMat, 7.6, h, 5.8, 0, h / 2 + 0.3, -0.4, shadows, true);
      // Awning / Forecourt Canopy
      this.addPart(group, this.unitBox, roofColor, 8.0, 0.45, 2.0, 0, 2.4, 2.6, shadows, true);
      // Rooftop HVAC & Signage Box
      this.addPart(group, this.unitBox, roofColor, 7.8, 0.45, 6.0, 0, h + 0.45, -0.4, shadows, true);
      this.addPart(group, this.unitBox, this.mats.bridgeSteel, 1.8, 0.7, 1.4, -1.8, h + 0.9, -0.8, shadows, false);
      topHeight = h + 1.6;
    }

    // Invisible Click/Hover Hitbox covering the building footprint cleanly
    const hitMat = new THREE.MeshBasicMaterial({ visible: false });
    this.disposableMaterials.push(hitMat);
    const hitMesh = new THREE.Mesh(this.unitBox, hitMat);
    hitMesh.scale.set(11.5, Math.max(5.5, topHeight), 9.5);
    hitMesh.position.set(0, Math.max(2.75, topHeight / 2), 0);
    hitMesh.userData = { poiId: loc.id, poi: loc };
    group.add(hitMesh);

    return {
      loc,
      group,
      hitMesh,
      topHeight,
      beaconLightMesh,
    };
  }

  // Natural 3D Zuma / Aso Granite Monoliths
  public buildNaturalMonolith(
    kind: 'zuma' | 'aso',
    reduceShadows = false
  ): THREE.Group {
    const g = new THREE.Group();
    const shadows = !reduceShadows;

    if (kind === 'zuma') {
      // Faceted Giant Basalt Monolith Pillar (left flank)
      const rockGeo1 = new THREE.DodecahedronGeometry(9.5, 1);
      const rockGeo2 = new THREE.ConeGeometry(7.2, 18, 7);
      this.disposableGeometries.push(rockGeo1, rockGeo2);

      const core = new THREE.Mesh(rockGeo2, this.mats.darkBasalt);
      core.scale.set(1.3, 1.45, 1.05);
      core.position.set(0, 12.5, 0);
      core.castShadow = shadows;
      core.receiveShadow = true;
      g.add(core);

      const shoulder = new THREE.Mesh(rockGeo1, this.mats.darkBasalt);
      shoulder.scale.set(1.2, 0.72, 1.1);
      shoulder.position.set(-4.5, 5.0, 3.0);
      shoulder.castShadow = shadows;
      shoulder.receiveShadow = true;
      g.add(shoulder);

      const foothill = new THREE.Mesh(rockGeo1, this.mats.darkBasalt);
      foothill.scale.set(0.9, 0.5, 0.95);
      foothill.position.set(5.5, 3.2, -2.5);
      foothill.castShadow = shadows;
      foothill.receiveShadow = true;
      g.add(foothill);
    } else {
      // Aso Rock Broad Granitic Ridge (right flank)
      const ridgeGeo = new THREE.DodecahedronGeometry(11.5, 1);
      this.disposableGeometries.push(ridgeGeo);

      const mainPeak = new THREE.Mesh(ridgeGeo, this.mats.darkBasalt);
      mainPeak.scale.set(1.25, 1.15, 1.45);
      mainPeak.position.set(0, 9.2, 0);
      mainPeak.rotation.y = 0.6;
      mainPeak.castShadow = shadows;
      mainPeak.receiveShadow = true;
      g.add(mainPeak);

      const subPeak = new THREE.Mesh(ridgeGeo, this.mats.darkBasalt);
      subPeak.scale.set(0.85, 0.72, 0.9);
      subPeak.position.set(-6.5, 5.2, 6.0);
      subPeak.castShadow = shadows;
      subPeak.receiveShadow = true;
      g.add(subPeak);
    }

    return g;
  }

  public dispose(): void {
    this.disposableGeometries.forEach((g) => g.dispose());
    this.disposableMaterials.forEach((m) => m.dispose());
    this.disposableGeometries = [];
    this.disposableMaterials = [];
  }
}
