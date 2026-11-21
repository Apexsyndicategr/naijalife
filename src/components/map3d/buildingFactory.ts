/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { LocationPOI } from '../../types/game';
import { CityMaterialSet } from './cityMaterials';
import { resolveBuildingIdentity, BuildingIdentityProfile } from './buildingIdentity';

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

const STALL_COLORS = [0xef4444, 0xf59e0b, 0x10b981, 0x3b82f6, 0xec4899, 0x8b5cf6];
const CAR_COLORS = [0xef4444, 0x2563eb, 0xf8fafc, 0x18181b, 0x10b981, 0xf59e0b];

export class CityBuildingBuilder {
  private mats: CityMaterialSet;
  private disposableGeometries: THREE.BufferGeometry[] = [];
  private disposableMaterials: THREE.Material[] = [];

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

  private getTintMat(hex: number, roughness = 0.65, metalness = 0.08): THREE.MeshStandardMaterial {
    const m = new THREE.MeshStandardMaterial({ color: hex, roughness, metalness });
    this.disposableMaterials.push(m);
    return m;
  }

  private addWindowGrid(
    parent: THREE.Object3D,
    w: number,
    h: number,
    d: number,
    cx: number,
    baseY: number,
    cz: number,
    cols: number,
    rows: number,
    glassMat: THREE.Material
  ) {
    const spanX = w * 0.72;
    const stepX = cols > 1 ? spanX / (cols - 1) : 0;
    const startX = cols > 1 ? cx - spanX / 2 : cx;
    const stepY = (h * 0.72) / Math.max(1, rows);
    for (let r = 0; r < rows; r++) {
      const wy = baseY + 0.75 + r * stepY;
      for (let c = 0; c < cols; c++) {
        const wx = startX + c * stepX;
        // Front facade window
        this.addPart(parent, this.unitBox, glassMat, 0.55, 0.72, 0.08, wx, wy, cz + d / 2 + 0.02, false, false);
        // Back facade window
        this.addPart(parent, this.unitBox, glassMat, 0.55, 0.72, 0.08, wx, wy, cz - d / 2 - 0.02, false, false);
      }
    }
  }

  private addTreeProp(parent: THREE.Object3D, px: number, pz: number, scale = 1, shadows = true) {
    this.addPart(parent, this.unitCyl, this.mats.terracottaRoof, 0.14 * scale, 1.0 * scale, 0.14 * scale, px, 0.75 * scale, pz, shadows, false);
    this.addPart(parent, this.unitSphere, this.mats.foliage, 0.85 * scale, 1.0 * scale, 0.85 * scale, px, 1.3 * scale, pz, shadows, true);
  }

  private addParkedCar(parent: THREE.Object3D, px: number, pz: number, colorHex: number, ry = 0, shadows = true) {
    const carGroup = new THREE.Group();
    carGroup.position.set(px, 0.32, pz);
    carGroup.rotation.y = ry;
    const carMat = this.getTintMat(colorHex, 0.3, 0.45);
    this.addPart(carGroup, this.unitBox, carMat, 1.25, 0.38, 0.65, 0, 0.25, 0, shadows, true);
    this.addPart(carGroup, this.unitBox, this.mats.glassTower, 0.68, 0.3, 0.54, -0.06, 0.55, 0, shadows, false);
    parent.add(carGroup);
  }

  private addCompoundFence(parent: THREE.Object3D, wallMat: THREE.Material, trimMat: THREE.Material, gateColorMat: THREE.Material, shadows: boolean) {
    const wallH = 1.05;
    this.addPart(parent, this.unitBox, wallMat, 10.6, wallH, 0.3, 0, wallH / 2 + 0.25, -4.3, shadows, true);
    this.addPart(parent, this.unitBox, wallMat, 0.3, wallH, 8.6, -5.15, wallH / 2 + 0.25, 0, shadows, true);
    this.addPart(parent, this.unitBox, wallMat, 0.3, wallH, 8.6, 5.15, wallH / 2 + 0.25, 0, shadows, true);
    // Front Left & Right wing walls + Central Iron Gate + Security Post
    this.addPart(parent, this.unitBox, wallMat, 3.6, wallH, 0.3, -3.3, wallH / 2 + 0.25, 4.3, shadows, true);
    this.addPart(parent, this.unitBox, wallMat, 3.6, wallH, 0.3, 3.3, wallH / 2 + 0.25, 4.3, shadows, true);
    this.addPart(parent, this.unitBox, gateColorMat, 3.0, 1.15, 0.14, 0, 0.85, 4.3, shadows, false);
    // Gate pillars
    this.addPart(parent, this.unitBox, trimMat, 0.5, 1.45, 0.5, -1.6, 0.95, 4.3, shadows, true);
    this.addPart(parent, this.unitBox, trimMat, 0.5, 1.45, 0.5, 1.6, 0.95, 4.3, shadows, true);
  }

  public buildLandmarkPOI(
    loc: LocationPOI,
    options?: { isHome?: boolean; isCnTower?: boolean; stateId?: string; reduceShadows?: boolean }
  ): BuiltPOIEntry {
    const group = new THREE.Group();
    const idProf: BuildingIdentityProfile = resolveBuildingIdentity(loc, {
      isHome: options?.isHome,
      stateId: options?.stateId,
    });
    const floors = Math.max(1, loc.floorsCount || (loc.type === 'hotel' || loc.type === 'bank' ? 4 : 2));
    const shadows = !options?.reduceShadows;
    let topHeight = 8;
    let beaconLightMesh: THREE.Mesh | undefined;

    const wallMat = this.getTintMat(idProf.wallHex, 0.72, 0.04);
    const roofMat = this.getTintMat(idProf.roofHex, 0.55, 0.16);
    const accentMat = this.getTintMat(idProf.accentHex, 0.4, 0.25);
    const trimMat = this.getTintMat(idProf.trimHex, 0.5, 0.1);
    const glassMat = this.mats.glassTower;

    // Concrete sidewalk pad beneath every plot
    this.addPart(group, this.unitBox, this.mats.sidewalk, 11.6, 0.28, 9.6, 0, 0.14, 0, false, true);

    const archGroup = new THREE.Group();
    if (idProf.rotationQuarterTurns > 0) {
      archGroup.rotation.y = idProf.rotationQuarterTurns * (Math.PI / 2);
    }
    group.add(archGroup);

    const s = idProf.style;

    if (options?.isCnTower || loc.id.includes('cntower') || loc.name.toLowerCase().includes('cn tower')) {
      this.addPart(archGroup, this.unitCyl, this.mats.concreteWall, 2.8, 2.5, 2.8, 0, 1.4, 0, shadows, true);
      this.addPart(archGroup, this.unitCyl, this.mats.limestoneWall, 1.0, 22, 1.0, 0, 13.5, 0, shadows, true);
      this.addPart(archGroup, this.unitCyl, this.mats.glassTower, 3.2, 2.2, 3.2, 0, 20.5, 0, shadows, true);
      this.addPart(archGroup, this.unitCyl, this.mats.skyAccent, 2.6, 0.6, 2.6, 0, 22.0, 0, shadows, true);
      this.addPart(archGroup, this.unitCyl, this.mats.crimsonMetal, 0.35, 8.5, 0.35, 0, 26.5, 0, shadows, false);
      beaconLightMesh = this.addPart(archGroup, this.unitSphere, this.mats.crimsonMetal, 0.45, 0.45, 0.45, 0, 31.0, 0, false, false);
      topHeight = 32;
    } else if (s === 'bungalow') {
      if (idProf.hasFence) this.addCompoundFence(archGroup, wallMat, trimMat, accentMat, shadows);
      this.addPart(archGroup, this.unitBox, wallMat, 6.8, 2.5, 4.8, -0.4, 1.55, -0.5, shadows, true);
      // Porch overhang & wooden front door
      this.addPart(archGroup, this.unitBox, trimMat, 2.4, 0.25, 1.4, -0.4, 2.3, 2.3, shadows, true);
      this.addPart(archGroup, this.unitBox, this.mats.terracottaRoof, 0.9, 1.7, 0.14, -0.4, 1.15, 1.92, false, false);
      this.addWindowGrid(archGroup, 6.8, 2.5, 4.8, -0.4, 0.3, -0.5, 3, 1, glassMat);
      this.addPart(archGroup, this.unitCone, roofMat, 5.4, 1.9, 4.0, -0.4, 3.7, -0.5, shadows, true, Math.PI / 4);
      this.addTreeProp(archGroup, 3.5, -2.5, 1.1, shadows);
      topHeight = 5.4;
    } else if (s === 'semi_detached') {
      this.addCompoundFence(archGroup, wallMat, trimMat, accentMat, shadows);
      // Twin symmetrical attached units with dividing party parapet
      const h = 4.6;
      this.addPart(archGroup, this.unitBox, wallMat, 3.4, h, 4.8, -1.85, h / 2 + 0.3, -0.5, shadows, true);
      this.addPart(archGroup, this.unitBox, wallMat, 3.4, h, 4.8, 1.85, h / 2 + 0.3, -0.5, shadows, true);
      this.addPart(archGroup, this.unitBox, accentMat, 0.4, h + 0.5, 5.1, 0, h / 2 + 0.55, -0.5, shadows, true);
      this.addWindowGrid(archGroup, 3.4, h, 4.8, -1.85, 0.3, -0.5, 2, 2, glassMat);
      this.addWindowGrid(archGroup, 3.4, h, 4.8, 1.85, 0.3, -0.5, 2, 2, glassMat);
      this.addPart(archGroup, this.unitCone, roofMat, 2.9, 1.8, 4.0, -1.85, h + 1.15, -0.5, shadows, true, Math.PI / 4);
      this.addPart(archGroup, this.unitCone, roofMat, 2.9, 1.8, 4.0, 1.85, h + 1.15, -0.5, shadows, true, Math.PI / 4);
      topHeight = h + 2.5;
    } else if (s === 'detached_house' || s === 'duplex') {
      this.addCompoundFence(archGroup, wallMat, trimMat, accentMat, shadows);
      const h = s === 'duplex' ? 5.2 + (idProf.seed % 2) * 0.8 : 4.2;
      this.addPart(archGroup, this.unitBox, wallMat, 6.2, h, 5.0, -0.4, h / 2 + 0.3, -0.4, shadows, true);
      // Cantilever balcony & porch pillars
      this.addPart(archGroup, this.unitBox, trimMat, 4.2, 0.32, 1.6, -0.4, h * 0.55 + 0.3, 2.4, shadows, true);
      this.addPart(archGroup, this.unitCyl, trimMat, 0.15, h * 0.55, 0.15, -2.0, h * 0.275 + 0.3, 2.9, shadows, true);
      this.addPart(archGroup, this.unitCyl, trimMat, 0.15, h * 0.55, 0.15, 1.2, h * 0.275 + 0.3, 2.9, shadows, true);
      // Front Entry Door
      this.addPart(archGroup, this.unitBox, this.mats.terracottaRoof, 0.95, 1.9, 0.15, -0.4, 1.25, 2.12, false, false);
      this.addWindowGrid(archGroup, 6.2, h, 5.0, -0.4, 0.3, -0.4, 3, 2, glassMat);
      // Roof variation
      if (idProf.roofShape === 'flat_parapet') {
        this.addPart(archGroup, this.unitBox, roofMat, 6.6, 0.55, 5.4, -0.4, h + 0.55, -0.4, shadows, true);
      } else {
        this.addPart(archGroup, this.unitCone, roofMat, 5.0, 2.2, 4.2, -0.4, h + 1.35, -0.4, shadows, true, Math.PI / 4);
      }
      // Security Post + Black Borehole Water Tank
      this.addPart(archGroup, this.unitBox, this.mats.emeraldAccent, 1.7, 1.8, 1.5, 3.4, 1.2, 3.4, shadows, true);
      this.addPart(archGroup, this.unitBox, this.mats.bridgeSteel, 1.0, 2.6, 1.0, 3.8, 1.6, -2.6, shadows, true);
      this.addPart(archGroup, this.unitCyl, this.mats.slateRoof, 0.65, 1.2, 0.65, 3.8, 3.4, -2.6, shadows, true);
      this.addTreeProp(archGroup, -3.9, 2.6, 0.95, shadows);
      topHeight = h + 3.0;
    } else if (s === 'mansion' || s === 'estate') {
      this.addCompoundFence(archGroup, trimMat, this.mats.goldMetal, this.mats.goldMetal, shadows);
      const h = 6.2 + (idProf.seed % 2) * 1.1;
      // Central Grand Rotunda + Left & Right Wings
      this.addPart(archGroup, this.unitBox, wallMat, 8.2, h, 4.2, 0, h / 2 + 0.3, -1.2, shadows, true);
      this.addPart(archGroup, this.unitBox, wallMat, 2.6, h * 0.8, 2.4, -3.1, h * 0.4 + 0.3, 1.6, shadows, true);
      this.addPart(archGroup, this.unitBox, wallMat, 2.6, h * 0.8, 2.4, 3.1, h * 0.4 + 0.3, 1.6, shadows, true);
      // Classical Portico Columns & Balconies
      for (const cx of [-1.2, 0, 1.2]) {
        this.addPart(archGroup, this.unitCyl, trimMat, 0.2, h * 0.72, 0.2, cx, h * 0.36 + 0.3, 1.35, shadows, true);
      }
      this.addPart(archGroup, this.unitSphere, roofMat, 2.4, 1.8, 2.4, 0, h + 0.3, -1.2, shadows, true);
      // Courtyard Swimming Pool
      this.addPart(archGroup, this.unitBox, this.mats.waterSurface, 3.4, 0.18, 2.2, 0, 0.38, 2.4, false, true);
      this.addWindowGrid(archGroup, 8.2, h, 4.2, 0, 0.3, -1.2, 4, 2, glassMat);
      this.addTreeProp(archGroup, -4.0, -3.1, 1.1, shadows);
      this.addTreeProp(archGroup, 4.0, -3.1, 1.1, shadows);
      topHeight = h + 3.2;
    } else if (s === 'apartment') {
      const h = 7.4 + (idProf.seed % 3) * 1.4;
      this.addPart(archGroup, this.unitBox, wallMat, 7.2, h, 5.2, 0, h / 2 + 0.3, -0.4, shadows, true);
      // Stacked Floor Balconies
      for (let b = 1; b <= 3; b++) {
        this.addPart(archGroup, this.unitBox, trimMat, 5.8, 0.25, 1.1, 0, b * (h / 4) + 0.3, 2.65, shadows, true);
      }
      this.addWindowGrid(archGroup, 7.2, h, 5.2, 0, 0.3, -0.4, 4, 4, glassMat);
      this.addPart(archGroup, this.unitBox, roofMat, 7.5, 0.45, 5.5, 0, h + 0.5, -0.4, shadows, true);
      topHeight = h + 2.0;
    } else if (s === 'hospital') {
      const mainH = 4.8 + Math.min(3, floors) * 1.2;
      this.addPart(archGroup, this.unitBox, trimMat, 9.8, 1.8, 7.2, 0, 1.2, 0, shadows, true);
      this.addPart(archGroup, this.unitBox, this.mats.generatorWindow, 7.6, mainH, 4.4, 0, mainH / 2 + 1.2, -0.6, shadows, true);
      this.addPart(archGroup, this.unitBox, wallMat, 2.4, mainH * 0.78, 6.4, -3.4, mainH * 0.39 + 1.2, 0.3, shadows, true);
      this.addPart(archGroup, this.unitBox, wallMat, 2.4, mainH * 0.78, 6.4, 3.4, mainH * 0.39 + 1.2, 0.3, shadows, true);
      this.addPart(archGroup, this.unitBox, this.mats.skyAccent, 3.4, 0.35, 2.4, 0, 2.2, 2.6, shadows, true);
      this.addPart(archGroup, this.unitCyl, this.mats.slateRoof, 2.0, 0.25, 2.0, -1.6, mainH + 1.35, -0.6, shadows, true);
      this.addPart(archGroup, this.unitBox, this.mats.crimsonMetal, 2.2, 0.25, 0.65, 1.8, mainH + 1.35, -0.6, false, true);
      this.addPart(archGroup, this.unitBox, this.mats.crimsonMetal, 0.65, 0.25, 2.2, 1.8, mainH + 1.35, -0.6, false, true);
      topHeight = mainH + 2.4;
    } else if (s === 'bank' || s === 'office') {
      const towerH = s === 'bank' ? 9.5 + (idProf.seed % 4) * 1.4 : 7.0 + (idProf.seed % 4) * 1.3;
      this.addPart(archGroup, this.unitBox, trimMat, 8.6, 2.0, 7.6, 0, 1.3, 0, shadows, true);
      this.addPart(archGroup, this.unitBox, s === 'bank' ? glassMat : wallMat, 5.8, towerH, 5.4, 0, towerH / 2 + 2.0, 0, shadows, true);
      if (s === 'office') {
        this.addWindowGrid(archGroup, 5.8, towerH, 5.4, 0, 2.0, 0, 4, 5, glassMat);
      }
      this.addPart(archGroup, this.unitBox, accentMat, 4.2, 2.6, 4.0, 0, towerH + 3.2, 0, shadows, true);
      this.addPart(archGroup, this.unitCyl, this.mats.bridgeSteel, 0.18, 4.0, 0.18, 0, towerH + 6.4, 0, shadows, false);
      beaconLightMesh = this.addPart(archGroup, this.unitSphere, accentMat, 0.36, 0.36, 0.36, 0, towerH + 8.4, 0, false, false);
      topHeight = towerH + 8.6;
    } else if (s === 'hotel') {
      const h = 7.4 + (idProf.seed % 3) * 1.5;
      this.addPart(archGroup, this.unitBox, trimMat, 9.6, 2.0, 7.8, 0, 1.3, 0, shadows, true);
      this.addPart(archGroup, this.unitBox, this.mats.glassOffice, 7.4, h, 4.4, 0, h / 2 + 2.0, -1.1, shadows, true);
      this.addPart(archGroup, this.unitBox, this.mats.waterSurface, 4.8, 0.25, 2.4, 0, 2.45, 2.4, false, true);
      this.addPart(archGroup, this.unitBox, this.mats.goldMetal, 7.7, 0.45, 4.7, 0, h + 2.2, -1.1, shadows, true);
      topHeight = h + 3.2;
    } else if (s === 'mall' || s === 'supermarket') {
      const h = s === 'mall' ? 4.8 : 3.6;
      this.addPart(archGroup, this.unitBox, wallMat, 9.8, h, 5.6, 0, h / 2 + 0.3, -1.2, shadows, true);
      this.addPart(archGroup, this.unitBox, glassMat, 5.4, 1.2, 4.2, 0, h + 0.85, -1.2, shadows, true);
      this.addPart(archGroup, this.unitBox, accentMat, 8.8, 0.75, 0.4, 0, h - 0.1, 1.65, shadows, false);
      this.addPart(archGroup, this.unitBox, this.mats.parkingLot, 9.8, 0.12, 3.0, 0, 0.36, 2.8, false, true);
      topHeight = h + 2.2;
    } else if (s === 'petrol_station') {
      // Forecourt Station Canopy + 4 Fuel Dispensers + Pay Mart
      this.addPart(archGroup, this.unitBox, this.mats.parkingLot, 10.6, 0.16, 8.4, 0, 0.36, 0, false, true);
      // Convenience Shop in back
      this.addPart(archGroup, this.unitBox, wallMat, 7.8, 3.2, 2.8, 0, 1.9, -2.5, shadows, true);
      this.addPart(archGroup, this.unitBox, accentMat, 8.0, 0.5, 3.0, 0, 3.7, -2.5, shadows, false);
      // Canopy Roof over fuel islands
      this.addPart(archGroup, this.unitBox, this.mats.crimsonMetal, 7.4, 0.55, 3.8, 0, 4.2, 1.4, shadows, true);
      for (const px of [-2.4, 2.4]) {
        this.addPart(archGroup, this.unitCyl, trimMat, 0.22, 3.8, 0.22, px, 2.1, 1.4, shadows, true);
      }
      // Fuel Pump Boxes
      for (const fx of [-1.4, 0, 1.4]) {
        this.addPart(archGroup, this.unitBox, this.mats.amberAccent, 0.55, 1.4, 0.45, fx, 1.0, 1.4, shadows, true);
      }
      topHeight = 5.0;
    } else if (s === 'warehouse' || s === 'factory') {
      // Industrial Saw-Tooth / Barrel Vault Factory + Smokestack / Loading Bay
      this.addPart(archGroup, this.unitBox, this.mats.concreteWall, 9.4, 4.0, 6.4, -0.2, 2.3, -0.6, shadows, true);
      this.addPart(archGroup, this.unitCyl, roofMat, 3.1, 9.4, 2.0, -0.2, 4.3, -0.6, shadows, true, 0);
      // Loading Doors
      for (const bx of [-2.6, 0, 2.6]) {
        this.addPart(archGroup, this.unitBox, accentMat, 1.8, 2.4, 0.15, bx, 1.5, 2.65, false, false);
      }
      if (s === 'factory') {
        this.addPart(archGroup, this.unitCyl, this.mats.terracottaRoof, 0.55, 6.2, 0.55, 3.6, 5.2, -2.4, shadows, true);
        this.addPart(archGroup, this.unitCyl, this.mats.goldMetal, 0.62, 0.5, 0.62, 3.6, 8.2, -2.4, false, false);
      }
      topHeight = s === 'factory' ? 8.8 : 5.8;
    } else if (s === 'market') {
      this.addPart(archGroup, this.unitBox, this.mats.concreteWall, 10.4, 0.4, 8.4, 0, 0.5, 0, false, true);
      for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 3; col++) {
          const sx = (col - 1) * 3.1;
          const sz = row === 0 ? -2.1 : 2.1;
          const stallMat = this.getTintMat(STALL_COLORS[(idProf.seed + row * 3 + col) % STALL_COLORS.length], 0.6, 0.1);
          this.addPart(archGroup, this.unitBox, this.mats.concreteWall, 2.4, 1.5, 2.6, sx, 1.4, sz, shadows, true);
          this.addPart(archGroup, this.unitBox, stallMat, 2.7, 0.35, 3.0, sx, 2.35, sz, shadows, true);
        }
      }
      this.addPart(archGroup, this.unitBox, this.mats.amberAccent, 1.6, 3.8, 1.6, 0, 2.2, 0, shadows, true);
      topHeight = 4.4;
    } else if (s === 'church') {
      this.addPart(archGroup, this.unitBox, wallMat, 6.4, 3.6, 7.6, 0, 2.1, 0, shadows, true);
      this.addPart(archGroup, this.unitCone, roofMat, 5.2, 2.4, 6.2, 0, 5.1, 0.2, shadows, true, Math.PI / 4);
      this.addPart(archGroup, this.unitBox, wallMat, 2.2, 6.5, 2.2, 0, 3.55, 2.8, shadows, true);
      this.addPart(archGroup, this.unitCone, accentMat, 1.8, 3.4, 1.8, 0, 8.5, 2.8, shadows, true, Math.PI / 4);
      this.addPart(archGroup, this.unitBox, this.mats.goldMetal, 0.22, 1.4, 0.22, 0, 10.6, 2.8, false, false);
      this.addPart(archGroup, this.unitBox, this.mats.goldMetal, 0.85, 0.22, 0.22, 0, 10.8, 2.8, false, false);
      topHeight = 11.6;
    } else if (s === 'mosque') {
      this.addPart(archGroup, this.unitBox, wallMat, 7.8, 3.2, 7.2, 0, 1.9, 0, shadows, true);
      this.addPart(archGroup, this.unitSphere, this.mats.goldMetal, 2.6, 2.4, 2.6, 0, 3.5, 0, shadows, true);
      for (const [mx, mz] of [
        [-3.4, -3.1],
        [3.4, -3.1],
        [-3.4, 3.1],
        [3.4, 3.1],
      ]) {
        this.addPart(archGroup, this.unitCyl, wallMat, 0.55, 6.4, 0.55, mx, 3.5, mz, shadows, true);
        this.addPart(archGroup, this.unitSphere, this.mats.goldMetal, 0.65, 0.9, 0.65, mx, 6.7, mz, shadows, false);
      }
      topHeight = 8.0;
    } else if (s === 'gov') {
      this.addPart(archGroup, this.unitBox, wallMat, 9.6, 3.6, 6.4, 0, 2.1, -0.4, shadows, true);
      for (let c = -3.4; c <= 3.4; c += 1.7) {
        this.addPart(archGroup, this.unitCyl, trimMat, 0.3, 3.6, 0.3, c, 2.1, 3.1, shadows, true);
      }
      this.addPart(archGroup, this.unitBox, trimMat, 8.6, 0.5, 1.4, 0, 4.15, 3.0, shadows, true);
      const domeMat = loc.type === 'gov' ? this.mats.emeraldAccent : this.mats.goldMetal;
      this.addPart(archGroup, this.unitCyl, wallMat, 2.4, 1.4, 2.4, 0, 4.5, -0.4, shadows, true);
      this.addPart(archGroup, this.unitSphere, domeMat, 2.35, 2.2, 2.35, 0, 5.2, -0.4, shadows, true);
      topHeight = 7.8;
    } else if (s === 'university' || s === 'school') {
      this.addPart(archGroup, this.unitBox, wallMat, 9.2, 3.4, 2.8, 0, 2.0, -2.6, shadows, true);
      this.addPart(archGroup, this.unitBox, wallMat, 2.6, 2.9, 5.2, -3.4, 1.75, 0.6, shadows, true);
      this.addPart(archGroup, this.unitBox, wallMat, 2.6, 2.9, 5.2, 3.4, 1.75, 0.6, shadows, true);
      this.addPart(archGroup, this.unitBox, roofMat, 2.0, 6.2, 2.0, 0, 3.4, -2.6, shadows, true);
      this.addPart(archGroup, this.unitCone, this.mats.slateRoof, 1.7, 2.0, 1.7, 0, 7.5, -2.6, shadows, true, Math.PI / 4);
      this.addPart(archGroup, this.unitBox, this.mats.foliage, 3.8, 0.2, 3.8, 0, 0.4, 1.0, false, true);
      topHeight = 8.8;
    } else if (s === 'stadium') {
      this.addPart(archGroup, this.unitCyl, this.mats.concreteWall, 5.4, 2.4, 4.4, 0, 1.5, 0, shadows, true);
      this.addPart(archGroup, this.unitBox, this.mats.pitchField, 6.2, 0.25, 4.2, 0, 2.7, 0, false, true);
      this.addPart(archGroup, this.unitBox, this.mats.emeraldAccent, 9.8, 0.45, 1.2, 0, 3.0, -3.4, shadows, true);
      this.addPart(archGroup, this.unitBox, this.mats.emeraldAccent, 9.8, 0.45, 1.2, 0, 3.0, 3.4, shadows, true);
      for (const [fx, fz] of [
        [-4.5, -3.6],
        [4.5, -3.6],
        [-4.5, 3.6],
        [4.5, 3.6],
      ]) {
        this.addPart(archGroup, this.unitCyl, this.mats.bridgeSteel, 0.2, 5.8, 0.2, fx, 3.2, fz, shadows, false);
        this.addPart(archGroup, this.unitBox, this.mats.streetLampBulb, 0.9, 0.45, 0.35, fx, 6.2, fz, false, false);
      }
      topHeight = 6.8;
    } else if (s === 'police') {
      this.addPart(archGroup, this.unitBox, this.mats.concreteWall, 8.2, 3.4, 6.0, 0, 2.0, 0, shadows, true);
      this.addPart(archGroup, this.unitBox, this.mats.skyAccent, 8.5, 0.55, 6.3, 0, 3.4, 0, shadows, false);
      this.addPart(archGroup, this.unitCyl, this.mats.bridgeSteel, 0.2, 4.2, 0.2, 2.8, 5.4, -1.6, shadows, false);
      beaconLightMesh = this.addPart(archGroup, this.unitSphere, this.mats.skyAccent, 0.38, 0.38, 0.38, 2.8, 7.6, -1.6, false, false);
      topHeight = 7.8;
    } else if (s === 'airport') {
      this.addPart(archGroup, this.unitBox, glassMat, 9.4, 3.2, 5.2, 0, 1.9, 0, shadows, true);
      this.addPart(archGroup, this.unitBox, this.mats.skyAccent, 9.8, 0.4, 5.6, 0, 3.7, 0, shadows, true);
      this.addPart(archGroup, this.unitCyl, wallMat, 1.0, 7.5, 1.0, 3.6, 4.0, -2.0, shadows, true);
      this.addPart(archGroup, this.unitCyl, glassMat, 1.6, 1.3, 1.6, 3.6, 8.2, -2.0, shadows, true);
      topHeight = 9.2;
    } else if (s === 'club') {
      const h = 4.5 + (idProf.seed % 2);
      const neonMat = this.getTintMat(0xa855f7, 0.3, 0.35);
      this.addPart(archGroup, this.unitBox, this.mats.slateRoof, 7.8, h, 6.4, 0, h / 2 + 0.3, 0, shadows, true);
      this.addPart(archGroup, this.unitBox, neonMat, 8.1, 0.45, 6.7, 0, h + 0.3, 0, shadows, false);
      this.addPart(archGroup, this.unitBox, glassMat, 6.0, h * 0.55, 0.25, 0, h * 0.45, 3.22, false, false);
      topHeight = h + 1.2;
    } else if (s === 'park') {
      this.addPart(archGroup, this.unitBox, this.mats.foliage, 10.2, 0.35, 8.2, 0, 0.48, 0, false, true);
      this.addPart(archGroup, this.unitBox, loc.type === 'lake' ? this.mats.waterSurface : this.mats.emeraldAccent, 5.8, 0.3, 4.6, -1.2, 0.65, 0.4, false, true);
      this.addPart(archGroup, this.unitBox, roofMat, 3.2, 2.2, 2.8, 2.8, 1.5, -1.8, shadows, true);
      this.addTreeProp(archGroup, -3.8, -2.6, 1.15, shadows);
      this.addTreeProp(archGroup, 3.5, 2.4, 1.05, shadows);
      topHeight = 3.5;
    } else {
      // Restaurant / Boutique / Salon / Dealership / Gym — seeded custom awnings, storefronts & windows
      const h = 3.4 + (idProf.seed % 3) * 1.1;
      const bodyMat = s === 'dealership' || s === 'boutique' || s === 'salon' ? glassMat : wallMat;
      this.addPart(archGroup, this.unitBox, bodyMat, 7.8, h, 5.8, 0, h / 2 + 0.3, -0.4, shadows, true);
      this.addWindowGrid(archGroup, 7.8, h, 5.8, 0, 0.3, -0.4, 3, 2, glassMat);
      this.addPart(archGroup, this.unitBox, accentMat, 8.2, 0.42, 2.1, 0, 2.4, 2.7, shadows, true);
      if (s === 'restaurant') {
        // Outdoor patio dining tables & umbrellas
        for (const px of [-2.2, 0, 2.2]) {
          this.addPart(archGroup, this.unitCyl, trimMat, 0.55, 0.75, 0.55, px, 0.7, 3.4, shadows, false);
          this.addPart(archGroup, this.unitCone, roofMat, 0.9, 0.45, 0.9, px, 1.6, 3.4, shadows, false);
        }
      }
      this.addPart(archGroup, this.unitBox, roofMat, 8.0, 0.45, 6.0, 0, h + 0.45, -0.4, shadows, true);
      topHeight = h + 1.6;
    }

    // Add parked vehicles for commercial plots
    for (let c = 0; c < Math.min(2, idProf.parkedCars); c++) {
      const carColor = CAR_COLORS[(idProf.seed + c) % CAR_COLORS.length];
      this.addParkedCar(archGroup, -2.5 + c * 2.5, 3.9, carColor, Math.PI / 2, shadows);
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

  public buildNaturalMonolith(kind: 'zuma' | 'aso', reduceShadows = false): THREE.Group {
    const g = new THREE.Group();
    const shadows = !reduceShadows;

    if (kind === 'zuma') {
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
    } else {
      const ridgeGeo = new THREE.DodecahedronGeometry(11.5, 1);
      this.disposableGeometries.push(ridgeGeo);

      const mainPeak = new THREE.Mesh(ridgeGeo, this.mats.darkBasalt);
      mainPeak.scale.set(1.25, 1.15, 1.45);
      mainPeak.position.set(0, 9.2, 0);
      mainPeak.rotation.y = 0.6;
      mainPeak.castShadow = shadows;
      mainPeak.receiveShadow = true;
      g.add(mainPeak);
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
