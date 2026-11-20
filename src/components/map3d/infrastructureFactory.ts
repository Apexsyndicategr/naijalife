/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { CityMaterialSet } from './cityMaterials';

export interface RoadSegmentSpec {
  id: string;
  x1: number;
  z1: number;
  x2: number;
  z2: number;
  y1: number;
  y2: number;
  width: number;
  isElevated?: boolean;
  lanesPerDir?: number;
}

export interface VehicleLaneAgent {
  segIndex: number;
  t: number; // 0..1 along path
  dir: 1 | -1;
  speed: number;
  colorIdx: number;
  kind: 'car' | 'danfo' | 'suv' | 'keke';
  laneOffset: number;
}

export interface CityInfrastructureHandle {
  group: THREE.Group;
  airportHitMesh: THREE.Mesh;
  radarDishMesh: THREE.Mesh;
  beaconMesh: THREE.Mesh;
  waterMesh: THREE.Mesh;
  treesInstanced: THREE.InstancedMesh;
  update: (elapsed: number, dt: number, trafficFactor: number, nightFactor: number, windFactor: number) => void;
  dispose: () => void;
}

// Deterministic pseudo-random helper
function hash2(x: number, y: number): number {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return s - Math.floor(s);
}

// Color palette for Nigerian & Canadian city vehicles
const VEHICLE_COLORS = [
  new THREE.Color(0xfacc15), // Iconic Lagos Yellow Danfo
  new THREE.Color(0xfbbf24), // Danfo Amber
  new THREE.Color(0xe2e8f0), // Silver Sedan
  new THREE.Color(0x1e293b), // Midnight SUV
  new THREE.Color(0x0284c7), // BRT / Blue Ride
  new THREE.Color(0xdc2626), // Crimson Sport
  new THREE.Color(0x10b981), // Emerald Keke / Cab
  new THREE.Color(0xf8fafc), // White G-Wagon / Hilux
];

export function buildCityInfrastructure(params: {
  mats: CityMaterialSet;
  isCanada: boolean;
  avoidPoints: { x: number; z: number; radius: number }[];
  reduceShadows: boolean;
}): CityInfrastructureHandle {
  const { mats, isCanada, avoidPoints, reduceShadows } = params;
  const group = new THREE.Group();
  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];
  const shadows = !reduceShadows;

  const trackGeo = <T extends THREE.BufferGeometry>(g: T): T => {
    geometries.push(g);
    return g;
  };
  const trackMat = <T extends THREE.Material>(m: T): T => {
    materials.push(m);
    return m;
  };

  // =========================================================================
  // 1. GROUND PLANE, PARKS & CITY WATERWAYS (RIVER + LAKE)
  // =========================================================================
  const groundGeo = trackGeo(new THREE.PlaneGeometry(520, 420));
  const groundMesh = new THREE.Mesh(groundGeo, isCanada ? mats.groundCanada : mats.ground);
  groundMesh.rotation.x = -Math.PI / 2;
  groundMesh.position.y = 0;
  groundMesh.receiveShadow = true;
  group.add(groundMesh);

  // Winding City River Channel & Western Waterfront Lake (centered cleanly in corridor Z = -56)
  const riverZ = -56;
  const waterGeo = trackGeo(new THREE.PlaneGeometry(460, 16));
  const waterMesh = new THREE.Mesh(waterGeo, mats.waterSurface);
  waterMesh.rotation.x = -Math.PI / 2;
  waterMesh.position.set(10, 0.06, riverZ);
  waterMesh.receiveShadow = true;
  group.add(waterMesh);

  // Jabi Lake / Lagos Lagoon / Lake Ontario Scenic Basin on West side
  const lakeGeo = trackGeo(new THREE.CylinderGeometry(28, 30, 0.14, 32));
  const lakeMesh = new THREE.Mesh(lakeGeo, mats.waterSurface);
  lakeMesh.scale.set(1.35, 1, 0.72);
  lakeMesh.position.set(-106, 0.05, riverZ);
  lakeMesh.receiveShadow = true;
  group.add(lakeMesh);

  // Concrete Riverbank Embankment Retaining Walls
  const bankGeo = trackGeo(new THREE.BoxGeometry(460, 0.75, 1.1));
  const northBank = new THREE.Mesh(bankGeo, mats.concretePier);
  northBank.position.set(10, 0.25, riverZ - 8.4);
  northBank.receiveShadow = true;
  const southBank = new THREE.Mesh(bankGeo, mats.concretePier);
  southBank.position.set(10, 0.25, riverZ + 8.4);
  southBank.receiveShadow = true;
  group.add(northBank, southBank);

  // Landscaped City Parks & Gardens
  const parkSpecs = [
    { x: -16, z: -2, w: 32, d: 22 },
    { x: 90, z: 68, w: 34, d: 24 },
    { x: -84, z: 18, w: 26, d: 22 },
  ];
  const parkTurfMat = trackMat(new THREE.MeshStandardMaterial({ color: isCanada ? 0x2d6a4f : 0x16a34a, roughness: 0.9 }));
  const walkwayMat = trackMat(new THREE.MeshStandardMaterial({ color: 0xd6d3d1, roughness: 0.85 }));
  for (const pk of parkSpecs) {
    const pMesh = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(pk.w, 0.14, pk.d)), parkTurfMat);
    pMesh.position.set(pk.x, 0.07, pk.z);
    pMesh.receiveShadow = true;
    group.add(pMesh);
    // Cross-park promenade footpaths
    const path1 = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(pk.w * 0.86, 0.18, 1.8)), walkwayMat);
    path1.position.set(pk.x, 0.09, pk.z);
    const path2 = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.8, 0.18, pk.d * 0.86)), walkwayMat);
    path2.position.set(pk.x, 0.09, pk.z);
    group.add(path1, path2);
  }

  // =========================================================================
  // 2. SURFACE ROAD NETWORK, SIDEWALKS, ROUNDABOUTS & CROSSWALKS
  // =========================================================================
  const surfaceRoads: { x: number; z: number; len: number; width: number; axis: 'x' | 'z' }[] = [
    // Primary 4-lane East-West Expressways
    { x: 0, z: -32, len: 410, width: 11, axis: 'x' },
    { x: 0, z: 42, len: 410, width: 11, axis: 'x' },
    // Secondary East-West Collectors
    { x: 0, z: -86, len: 410, width: 8, axis: 'x' },
    { x: 0, z: 96, len: 410, width: 8, axis: 'x' },
    // Primary 4-lane North-South Boulevards
    { x: -52, z: 0, len: 310, width: 11, axis: 'z' },
    { x: 56, z: 0, len: 310, width: 11, axis: 'z' },
    // Secondary North-South Collectors
    { x: -124, z: 0, len: 310, width: 8, axis: 'z' },
    { x: 126, z: 0, len: 310, width: 8, axis: 'z' },
  ];

  for (const r of surfaceRoads) {
    // Raised Sidewalk Border Ribbon
    const swGeo = trackGeo(new THREE.BoxGeometry(r.len, 0.18, r.width + 3.0));
    const swMesh = new THREE.Mesh(swGeo, mats.sidewalk);
    swMesh.position.set(r.x, 0.09, r.z);
    if (r.axis === 'z') swMesh.rotation.y = Math.PI / 2;
    swMesh.receiveShadow = true;
    group.add(swMesh);

    // Asphalt Road Surface
    const rdGeo = trackGeo(new THREE.BoxGeometry(r.len, 0.22, r.width));
    const rdMesh = new THREE.Mesh(rdGeo, mats.asphaltRoad);
    rdMesh.position.set(r.x, 0.12, r.z);
    if (r.axis === 'z') rdMesh.rotation.y = Math.PI / 2;
    rdMesh.receiveShadow = true;
    group.add(rdMesh);
  }

  // Surface Bridges crossing the River Channel along N-S Boulevards (-52, 56, 126)
  const riverBridgeXs = [-124, -52, 56, 126];
  const pierCylGeo = trackGeo(new THREE.CylinderGeometry(0.65, 0.8, 3.2, 10));
  for (const bx of riverBridgeXs) {
    const deck = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(12.2, 0.7, 21)), mats.bridgeDeck);
    deck.position.set(bx, 1.4, riverZ);
    deck.castShadow = shadows;
    deck.receiveShadow = true;
    group.add(deck);

    // Side guardrails
    const railGeo = trackGeo(new THREE.BoxGeometry(0.4, 0.85, 21));
    const rL = new THREE.Mesh(railGeo, mats.guardRail);
    rL.position.set(bx - 5.9, 2.05, riverZ);
    const rR = new THREE.Mesh(railGeo, mats.guardRail);
    rR.position.set(bx + 5.9, 2.05, riverZ);
    group.add(rL, rR);

    // River piers
    for (const pz of [riverZ - 5.5, riverZ + 5.5]) {
      const p1 = new THREE.Mesh(pierCylGeo, mats.concretePier);
      p1.position.set(bx - 3.6, 0.1, pz);
      const p2 = new THREE.Mesh(pierCylGeo, mats.concretePier);
      p2.position.set(bx + 3.6, 0.1, pz);
      group.add(p1, p2);
    }
  }

  // Roundabouts at major Boulevard Intersections
  const roundaboutCenters = [
    { x: -52, z: -32 },
    { x: 56, z: -32 },
    { x: -52, z: 42 },
    { x: 56, z: 42 },
  ];
  const rbOuterGeo = trackGeo(new THREE.CylinderGeometry(11.5, 11.5, 0.28, 32));
  const rbIslandGeo = trackGeo(new THREE.CylinderGeometry(5.2, 5.4, 0.55, 24));
  const rbTurfGeo = trackGeo(new THREE.CylinderGeometry(4.6, 4.6, 0.62, 24));
  const crossGeo = trackGeo(new THREE.PlaneGeometry(9.6, 3.2));

  for (const rb of roundaboutCenters) {
    const outer = new THREE.Mesh(rbOuterGeo, mats.asphaltRoad);
    outer.position.set(rb.x, 0.15, rb.z);
    outer.receiveShadow = true;
    const curb = new THREE.Mesh(rbIslandGeo, mats.sidewalk);
    curb.position.set(rb.x, 0.28, rb.z);
    curb.receiveShadow = true;
    const turf = new THREE.Mesh(rbTurfGeo, mats.foliage);
    turf.position.set(rb.x, 0.32, rb.z);
    group.add(outer, curb, turf);

    // Zebra Crosswalks around all 4 exits of each roundabout
    const cwOffsets = [
      { dx: 0, dz: -13.5, ry: 0 },
      { dx: 0, dz: 13.5, ry: 0 },
      { dx: -13.5, dz: 0, ry: Math.PI / 2 },
      { dx: 13.5, dz: 0, ry: Math.PI / 2 },
    ];
    for (const cw of cwOffsets) {
      const m = new THREE.Mesh(crossGeo, mats.crosswalk);
      m.rotation.x = -Math.PI / 2;
      m.rotation.z = cw.ry;
      m.position.set(rb.x + cw.dx, 0.25, rb.z + cw.dz);
      group.add(m);
    }
  }

  // =========================================================================
  // 3. REAL 3D OVERHEAD BRIDGES, FLYOVERS, RAMPS & FOOTBRIDGES (CRITICAL!)
  // =========================================================================
  // Helper builds an elevated bridge/ramp deck between two 3D points with piers & guardrails
  const addElevatedViaductSegment = (
    x1: number,
    y1: number,
    z1: number,
    x2: number,
    y2: number,
    z2: number,
    width: number,
    pierSpacing: number
  ) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dz = z2 - z1;
    const horizLen = Math.hypot(dx, dz);
    const totalLen = Math.hypot(horizLen, dy);
    const yaw = Math.atan2(dx, dz); // direction along +Z rotated by yaw
    const pitch = -Math.atan2(dy, horizLen); // tilt upwards when y2 > y1

    const segGroup = new THREE.Group();
    segGroup.position.set((x1 + x2) / 2, (y1 + y2) / 2, (z1 + z2) / 2);
    segGroup.rotation.order = 'YXZ';
    segGroup.rotation.y = yaw;
    segGroup.rotation.x = pitch;

    // Structural concrete box girder underside
    const girder = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(width * 0.76, 1.15, totalLen)),
      mats.concretePier
    );
    girder.position.y = -0.72;
    girder.castShadow = shadows;
    girder.receiveShadow = true;
    segGroup.add(girder);

    // Asphalt/Concrete Bridge Road Deck (with rotated texture UVs cleanly mapped along length)
    const deckMat = mats.bridgeDeck;
    const deck = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(width, 0.45, totalLen)),
      deckMat
    );
    deck.castShadow = shadows;
    deck.receiveShadow = true;
    segGroup.add(deck);

    // Side Guardrails + Center Jersey Barrier
    const barrierGeo = trackGeo(new THREE.BoxGeometry(0.45, 0.72, totalLen));
    const railL = new THREE.Mesh(barrierGeo, mats.guardRail);
    railL.position.set(-width / 2 + 0.25, 0.55, 0);
    railL.castShadow = shadows;
    const railR = new THREE.Mesh(barrierGeo, mats.guardRail);
    railR.position.set(width / 2 - 0.25, 0.55, 0);
    railR.castShadow = shadows;
    const median = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.42, 0.55, totalLen)),
      mats.concretePier
    );
    median.position.set(0, 0.48, 0);
    segGroup.add(railL, railR, median);

    group.add(segGroup);

    // Concrete Support T-Piers & Dual Columns grounded down to Y = 0
    const pierCount = Math.max(2, Math.floor(horizLen / pierSpacing));
    for (let i = 1; i < pierCount; i++) {
      const t = i / pierCount;
      const px = x1 + dx * t;
      const py = y1 + dy * t;
      const pz = z1 + dz * t;
      if (py < 2.2) continue;

      const pierGroup = new THREE.Group();
      pierGroup.position.set(px, 0, pz);
      pierGroup.rotation.y = yaw;

      // Crosshead beam cap
      const cap = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(width * 0.84, 0.95, 1.7)),
        mats.concretePier
      );
      cap.position.y = py - 1.5;
      cap.castShadow = shadows;
      cap.receiveShadow = true;
      pierGroup.add(cap);

      // Twin Cylindrical Columns
      const colH = Math.max(0.5, py - 1.6);
      const colGeo = trackGeo(new THREE.CylinderGeometry(0.72, 0.88, colH, 12));
      for (const cx of [-width * 0.27, width * 0.27]) {
        const col = new THREE.Mesh(colGeo, mats.concretePier);
        col.position.set(cx, colH / 2, 0);
        col.castShadow = shadows;
        col.receiveShadow = true;
        pierGroup.add(col);
      }

      // Elevated Flyover Streetlights at alternating piers
      if (i % 2 === 1) {
        const mast = new THREE.Mesh(
          trackGeo(new THREE.CylinderGeometry(0.11, 0.14, 3.6, 6)),
          mats.bridgeSteel
        );
        mast.position.set(0, py + 2.0, 0);
        const lampBar = new THREE.Mesh(
          trackGeo(new THREE.BoxGeometry(3.2, 0.18, 0.35)),
          mats.bridgeSteel
        );
        lampBar.position.set(0, py + 3.8, 0);
        const bulbL = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.55, 0.16, 0.3)), mats.streetLampBulb);
        bulbL.position.set(-1.35, py + 3.68, 0);
        const bulbR = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.55, 0.16, 0.3)), mats.streetLampBulb);
        bulbR.position.set(1.35, py + 3.68, 0);
        pierGroup.add(mast, lampBar, bulbL, bulbR);
      }

      group.add(pierGroup);
    }
  };

  // HERO FLYOVER SYSTEM 1: Grand East-West Elevated Highway ("Third Mainland / Eko Bridge Viaduct")
  // Spans Z = 8 from West Ramp (-156 -> -114) elevated at Y=7.6 ABOVE Blvd 1 (-52) and Blvd 2 (+56), down to East Ramp (+106 -> +152)
  addElevatedViaductSegment(-156, 0.25, 8, -108, 7.6, 8, 10.2, 22);
  addElevatedViaductSegment(-108, 7.6, 8, 106, 7.6, 8, 10.6, 26);
  addElevatedViaductSegment(106, 7.6, 8, 154, 0.25, 8, 10.2, 22);

  // HERO FLYOVER SYSTEM 2: North-South Elevated Viaduct ("Ojuelegba / Carter Flyover") along X = 18
  // Rises from South Ramp (Z = +116 -> +66) at Y = 11.4? Let's make Y = 11.6 so it gracefully flies OVER BOTH Z=42, Z=8 flyover, Z=-32 AND River Z=-56!
  // Wait: passing over Z=8 flyover at Y=12.4 makes a true 3-level Nigerian mega-interchange!
  addElevatedViaductSegment(18, 0.25, 128, 18, 12.2, 68, 9.6, 22);
  addElevatedViaductSegment(18, 12.2, 68, 18, 12.2, -96, 9.8, 28);
  addElevatedViaductSegment(18, 12.2, -96, 18, 0.25, -144, 9.6, 22);

  // HERO INTERCHANGE RAMP: Sweeping Curved / Angled Slip-Ramp connecting East-West Flyover (18+24, 7.6, 8) down to Surface Expressway (56, 0.25, 42)
  addElevatedViaductSegment(42, 7.6, 8, 56, 3.8, 26, 6.2, 16);
  addElevatedViaductSegment(56, 3.8, 26, 56, 0.25, 42, 6.2, 16);

  // HERO RIVER FLYOVER WEST: Elevated Viaduct along X = -52 crossing High Above River (Z = -56) and E-W Expressway (-32)
  addElevatedViaductSegment(-52, 0.25, -138, -52, 7.2, -98, 9.4, 20);
  addElevatedViaductSegment(-52, 7.2, -98, -52, 7.2, -22, 9.6, 24);
  addElevatedViaductSegment(-52, 7.2, -22, -52, 0.25, 16, 9.4, 20);

  // SUNKEN UNDERPASS TUNNEL PORTAL at (-92, 42)
  const portalWallGeo = trackGeo(new THREE.BoxGeometry(18, 3.6, 1.4));
  const pW1 = new THREE.Mesh(portalWallGeo, mats.concretePier);
  pW1.position.set(-92, 1.8, 35.8);
  const pW2 = new THREE.Mesh(portalWallGeo, mats.concretePier);
  pW2.position.set(-92, 1.8, 48.2);
  const portalRoof = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(16, 1.2, 13.8)), mats.bridgeSteel);
  portalRoof.position.set(-92, 3.8, 42);
  portalRoof.castShadow = shadows;
  group.add(pW1, pW2, portalRoof);

  // 3 ELEVATED PEDESTRIAN FOOTBRIDGES spanning busy roads
  const footbridges = [
    { x: -24, z: 42, rotY: 0 }, // Over E-W Expressway 2
    { x: 86, z: -32, rotY: 0 }, // Over E-W Expressway 1
    { x: 56, z: 72, rotY: Math.PI / 2 }, // Over N-S Boulevard 2
  ];
  for (const fb of footbridges) {
    const fbg = new THREE.Group();
    fbg.position.set(fb.x, 0, fb.z);
    fbg.rotation.y = fb.rotY;

    const spanDeck = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(2.4, 0.45, 15.6)), mats.concretePier);
    spanDeck.position.set(0, 4.6, 0);
    spanDeck.castShadow = shadows;
    const archRoof = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(2.6, 0.3, 15.6)), mats.skyAccent);
    archRoof.position.set(0, 6.4, 0);
    archRoof.castShadow = shadows;
    const stairA = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(2.2, 4.6, 2.2)), mats.bridgeSteel);
    stairA.position.set(0, 2.3, -7.8);
    stairA.castShadow = shadows;
    const stairB = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(2.2, 4.6, 2.2)), mats.bridgeSteel);
    stairB.position.set(0, 2.3, 7.8);
    stairB.castShadow = shadows;
    fbg.add(spanDeck, archRoof, stairA, stairB);
    group.add(fbg);
  }

  // =========================================================================
  // 4. DEDICATED 3D INTERNATIONAL AIRPORT COMPLEX (BOTTOM-LEFT RUNWAY 27)
  // =========================================================================
  const airportGroup = new THREE.Group();
  airportGroup.position.set(-108, 0, 114);

  // Apron Concrete Pad
  const apron = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(92, 0.25, 42)), mats.concretePier);
  apron.position.y = 0.12;
  apron.receiveShadow = true;
  airportGroup.add(apron);

  // Runway 27 Asphalt Strip
  const runwayMesh = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(84, 0.3, 16)), mats.runway);
  runwayMesh.position.set(0, 0.2, 8);
  runwayMesh.receiveShadow = true;
  airportGroup.add(runwayMesh);

  // Main Concourse Terminal Building
  const terminal = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(46, 5.2, 11)), mats.glassTower);
  terminal.position.set(-12, 2.8, -11);
  terminal.castShadow = shadows;
  terminal.receiveShadow = true;
  const termRoof = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(48, 0.7, 12.6)), mats.skyAccent);
  termRoof.position.set(-12, 5.7, -11);
  termRoof.castShadow = shadows;
  airportGroup.add(terminal, termRoof);

  // ATC Control Tower + Spinning Radar
  const atcShaft = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(1.4, 2.1, 13.5, 12)), mats.limestoneWall);
  atcShaft.position.set(22, 6.9, -11);
  atcShaft.castShadow = shadows;
  const atcCab = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(3.2, 2.3, 2.8, 12)), mats.glassTower);
  atcCab.position.set(22, 14.5, -11);
  atcCab.castShadow = shadows;
  const radarDishMesh = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(3.6, 0.45, 0.7)), mats.skyAccent);
  radarDishMesh.position.set(22, 16.5, -11);
  const beaconMesh = new THREE.Mesh(trackGeo(new THREE.SphereGeometry(0.45, 10, 8)), mats.crimsonMetal);
  beaconMesh.position.set(22, 17.5, -11);
  airportGroup.add(atcShaft, atcCab, radarDishMesh, beaconMesh);

  // 3 Parked Commercial Airliners at Gates
  const planeFuselageGeo = trackGeo(new THREE.CylinderGeometry(0.85, 0.85, 9.5, 10));
  const planeWingGeo = trackGeo(new THREE.BoxGeometry(10.5, 0.2, 2.1));
  const planeTailGeo = trackGeo(new THREE.BoxGeometry(0.25, 2.4, 1.8));
  const planeWhiteMat = trackMat(new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.32, metalness: 0.2 }));
  for (let p = 0; p < 3; p++) {
    const pg = new THREE.Group();
    pg.position.set(-28 + p * 15, 1.4, -1.2);
    const body = new THREE.Mesh(planeFuselageGeo, planeWhiteMat);
    body.rotation.x = Math.PI / 2;
    body.castShadow = shadows;
    const wing = new THREE.Mesh(planeWingGeo, p === 0 ? mats.skyAccent : p === 1 ? mats.emeraldAccent : mats.crimsonMetal);
    wing.position.y = -0.1;
    wing.castShadow = shadows;
    const tail = new THREE.Mesh(planeTailGeo, p === 0 ? mats.skyAccent : mats.emeraldAccent);
    tail.position.set(0, 1.1, -4.0);
    pg.add(body, wing, tail);
    airportGroup.add(pg);
  }

  // Airport Hitbox
  const airportHitMesh = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(92, 14, 42)),
    trackMat(new THREE.MeshBasicMaterial({ visible: false }))
  );
  airportHitMesh.position.y = 7;
  airportHitMesh.userData = { isAirportComplex: true };
  airportGroup.add(airportHitMesh);
  group.add(airportGroup);

  // =========================================================================
  // 5. INSTANCED URBAN CITYSCAPE FILL (BUILDINGS, TREES, STREETLIGHTS, SIGNALS)
  // =========================================================================
  const roadXs = [-124, -52, 18, 56, 126];
  const roadZs = [-86, -32, 8, 42, 96];

  const isPointClear = (px: number, pz: number): boolean => {
    // River & Lake exclusion
    if (Math.abs(pz - riverZ) < 12.5) return false;
    if (Math.hypot((px + 106) / 38, (pz - riverZ) / 22) < 1.15) return false;
    // Airport exclusion
    if (px > -162 && px < -54 && pz > 86 && pz < 142) return false;
    // Park exclusion
    for (const pk of parkSpecs) {
      if (Math.abs(px - pk.x) < pk.w * 0.56 && Math.abs(pz - pk.z) < pk.d * 0.56) return false;
    }
    // Road exclusion
    for (const rx of roadXs) {
      if (Math.abs(px - rx) < 10.5) return false;
    }
    for (const rz of roadZs) {
      if (Math.abs(pz - rz) < 10.5) return false;
    }
    // Roundabout exclusion
    for (const rb of roundaboutCenters) {
      if (Math.hypot(px - rb.x, pz - rb.z) < 16) return false;
    }
    // Landmark POI exclusion
    for (const ap of avoidPoints) {
      if (Math.hypot(px - ap.x, pz - ap.z) < ap.radius) return false;
    }
    return true;
  };

  // Collect candidate filler city blocks across the entire map grid
  const fillerBlocks: { x: number; z: number; w: number; h: number; d: number; color: number; isGlass: boolean }[] = [];
  const blockPalette = [0xcbd5e1, 0xe2e8f0, 0xd6d3d1, 0x94a3b8, 0xfef3c7, 0xdbeafe];
  for (let gx = -182; gx <= 182; gx += 11) {
    for (let gz = -132; gz <= 132; gz += 11) {
      const rnd = hash2(gx, gz);
      const jx = gx + (rnd - 0.5) * 2.5;
      const jz = gz + (hash2(gz, gx) - 0.5) * 2.5;
      if (!isPointClear(jx, jz)) continue;
      if (rnd < 0.28) continue; // Leave some green breathing yards

      // Taller skyscrapers in central CBD, cozy residential houses on outer rings
      const distCenter = Math.hypot(jx, jz);
      const isCBD = distCenter < 75;
      const isGlass = isCBD && rnd > 0.62;
      const h = isCBD
        ? 3.8 + rnd * 13.5
        : 2.2 + rnd * 5.2;
      const w = 4.6 + (rnd * 2.6);
      const d = 4.6 + (hash2(jx, jz) * 2.4);
      const color = blockPalette[Math.floor(rnd * blockPalette.length) % blockPalette.length];
      fillerBlocks.push({ x: jx, z: jz, w, h, d, color, isGlass });
    }
  }

  // Split filler blocks into Residential/Concrete InstancedMesh and Glass Mid-Rise InstancedMesh
  const solidBlocks = fillerBlocks.filter((b) => !b.isGlass);
  const glassBlocks = fillerBlocks.filter((b) => b.isGlass);
  const unitBoxGeo = trackGeo(new THREE.BoxGeometry(1, 1, 1));
  const dummy = new THREE.Object3D();
  const tempCol = new THREE.Color();

  const solidMat = trackMat(
    new THREE.MeshStandardMaterial({
      map: mats.residentialWindow.map,
      emissiveMap: mats.residentialWindow.emissiveMap,
      emissive: new THREE.Color(0xfbbf24),
      emissiveIntensity: 0.1,
      roughness: 0.72,
      metalness: 0.1,
    })
  );
  const solidInst = new THREE.InstancedMesh(unitBoxGeo, solidMat, Math.max(1, solidBlocks.length));
  solidInst.castShadow = shadows;
  solidInst.receiveShadow = true;
  solidBlocks.forEach((b, i) => {
    dummy.position.set(b.x, b.h / 2, b.z);
    dummy.scale.set(b.w, b.h, b.d);
    dummy.rotation.set(0, 0, 0);
    dummy.updateMatrix();
    solidInst.setMatrixAt(i, dummy.matrix);
    solidInst.setColorAt(i, tempCol.setHex(b.color));
  });
  solidInst.instanceMatrix.needsUpdate = true;
  if (solidInst.instanceColor) solidInst.instanceColor.needsUpdate = true;
  solidInst.computeBoundingSphere();
  group.add(solidInst);

  // Terracotta / Slate roofs on residential filler blocks
  const roofInst = new THREE.InstancedMesh(unitBoxGeo, mats.terracottaRoof, Math.max(1, solidBlocks.length));
  roofInst.castShadow = false;
  roofInst.receiveShadow = true;
  solidBlocks.forEach((b, i) => {
    dummy.position.set(b.x, b.h + 0.22, b.z);
    dummy.scale.set(b.w + 0.35, 0.45, b.d + 0.35);
    dummy.rotation.set(0, 0, 0);
    dummy.updateMatrix();
    roofInst.setMatrixAt(i, dummy.matrix);
  });
  roofInst.instanceMatrix.needsUpdate = true;
  roofInst.computeBoundingSphere();
  group.add(roofInst);

  // Glass Mid-Rise CBD Filler Blocks
  const glassFillerInst = new THREE.InstancedMesh(unitBoxGeo, mats.glassOffice, Math.max(1, glassBlocks.length));
  glassFillerInst.castShadow = shadows;
  glassFillerInst.receiveShadow = true;
  glassBlocks.forEach((b, i) => {
    dummy.position.set(b.x, b.h / 2, b.z);
    dummy.scale.set(b.w, b.h, b.d);
    dummy.rotation.set(0, 0, 0);
    dummy.updateMatrix();
    glassFillerInst.setMatrixAt(i, dummy.matrix);
    glassFillerInst.setColorAt(i, tempCol.setHex(0xe0f2fe));
  });
  glassFillerInst.instanceMatrix.needsUpdate = true;
  if (glassFillerInst.instanceColor) glassFillerInst.instanceColor.needsUpdate = true;
  glassFillerInst.computeBoundingSphere();
  group.add(glassFillerInst);

  // Tropical & Shade Trees (Instanced trunks + crowns along parks, avenues & perimeter)
  const treePositions: { x: number; z: number; scale: number }[] = [];
  // Park & roundabout palm trees
  for (const rb of roundaboutCenters) {
    treePositions.push({ x: rb.x, z: rb.z, scale: 1.25 });
  }
  for (const pk of parkSpecs) {
    for (let ti = 0; ti < 16; ti++) {
      const tx = pk.x + (hash2(pk.x + ti, pk.z) - 0.5) * pk.w * 0.8;
      const tz = pk.z + (hash2(pk.z, pk.x + ti) - 0.5) * pk.d * 0.8;
      treePositions.push({ x: tx, z: tz, scale: 0.9 + (ti % 3) * 0.25 });
    }
  }
  // Avenue & Perimeter Forest Trees
  for (let i = 0; i < 360; i++) {
    const px = (hash2(i, 17) - 0.5) * 395;
    const pz = (hash2(31, i) - 0.5) * 290;
    if (isPointClear(px, pz)) {
      treePositions.push({ x: px, z: pz, scale: 0.8 + hash2(px, pz) * 0.65 });
    }
  }

  const trunkGeo = trackGeo(new THREE.CylinderGeometry(0.18, 0.26, 2.2, 6));
  const crownGeo = trackGeo(new THREE.DodecahedronGeometry(1.45, 0));
  const trunksInst = new THREE.InstancedMesh(trunkGeo, mats.trunkWood, treePositions.length);
  const treesInstanced = new THREE.InstancedMesh(crownGeo, mats.foliage, treePositions.length);
  treesInstanced.castShadow = shadows;
  treesInstanced.receiveShadow = true;

  treePositions.forEach((tp, i) => {
    dummy.position.set(tp.x, 1.1 * tp.scale, tp.z);
    dummy.scale.set(tp.scale, tp.scale, tp.scale);
    dummy.rotation.set(0, 0, 0);
    dummy.updateMatrix();
    trunksInst.setMatrixAt(i, dummy.matrix);

    dummy.position.set(tp.x, 2.7 * tp.scale, tp.z);
    dummy.scale.set(tp.scale, tp.scale * 1.1, tp.scale);
    dummy.updateMatrix();
    treesInstanced.setMatrixAt(i, dummy.matrix);
  });
  trunksInst.instanceMatrix.needsUpdate = true;
  treesInstanced.instanceMatrix.needsUpdate = true;
  trunksInst.computeBoundingSphere();
  treesInstanced.computeBoundingSphere();
  group.add(trunksInst, treesInstanced);

  // Roadside Streetlamps & Intersection Traffic Lights (Instanced)
  const lampLocations: { x: number; z: number }[] = [];
  for (let lx = -170; lx <= 170; lx += 34) {
    if (Math.abs(lx + 52) > 14 && Math.abs(lx - 56) > 14) {
      lampLocations.push({ x: lx, z: -38.5 });
      lampLocations.push({ x: lx, z: 48.5 });
    }
  }
  for (let lz = -120; lz <= 120; lz += 34) {
    if (Math.abs(lz + 32) > 14 && Math.abs(lz - 42) > 14 && Math.abs(lz - riverZ) > 14) {
      lampLocations.push({ x: -58.5, z: lz });
      lampLocations.push({ x: 62.5, z: lz });
    }
  }

  const poleGeo = trackGeo(new THREE.CylinderGeometry(0.1, 0.14, 4.2, 6));
  const bulbGeo = trackGeo(new THREE.SphereGeometry(0.32, 8, 6));
  const polesInst = new THREE.InstancedMesh(poleGeo, mats.bridgeSteel, lampLocations.length);
  const bulbsInst = new THREE.InstancedMesh(bulbGeo, mats.streetLampBulb, lampLocations.length);
  lampLocations.forEach((lp, i) => {
    dummy.position.set(lp.x, 2.1, lp.z);
    dummy.scale.set(1, 1, 1);
    dummy.rotation.set(0, 0, 0);
    dummy.updateMatrix();
    polesInst.setMatrixAt(i, dummy.matrix);

    dummy.position.set(lp.x, 4.35, lp.z);
    dummy.updateMatrix();
    bulbsInst.setMatrixAt(i, dummy.matrix);
  });
  polesInst.instanceMatrix.needsUpdate = true;
  bulbsInst.instanceMatrix.needsUpdate = true;
  polesInst.computeBoundingSphere();
  bulbsInst.computeBoundingSphere();
  group.add(polesInst, bulbsInst);

  // Traffic Light Gantries at 4 secondary intersections
  const trafficJunctions = [
    { x: -124, z: -32 },
    { x: 126, z: -32 },
    { x: -124, z: 42 },
    { x: 126, z: 42 },
  ];
  for (const tj of trafficJunctions) {
    const post = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.16, 0.2, 4.8, 8)), mats.bridgeSteel);
    post.position.set(tj.x + 6.5, 2.4, tj.z - 6.5);
    const arm = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(5.5, 0.22, 0.22)), mats.bridgeSteel);
    arm.position.set(tj.x + 3.8, 4.7, tj.z - 6.5);
    const housing = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.55, 1.25, 0.45)), mats.slateRoof);
    housing.position.set(tj.x + 2.2, 4.55, tj.z - 6.5);
    const greenOrb = new THREE.Mesh(trackGeo(new THREE.SphereGeometry(0.18, 6, 6)), mats.trafficGreenBulb);
    greenOrb.position.set(tj.x + 2.2, 4.2, tj.z - 6.22);
    const redOrb = new THREE.Mesh(trackGeo(new THREE.SphereGeometry(0.18, 6, 6)), mats.trafficRedBulb);
    redOrb.position.set(tj.x + 2.2, 4.9, tj.z - 6.22);
    group.add(post, arm, housing, greenOrb, redOrb);
  }

  // =========================================================================
  // 6. ANIMATED LIVE 3D VEHICLES ON SURFACE ROADS & ELEVATED FLYOVERS
  // =========================================================================
  const vehiclePaths: RoadSegmentSpec[] = [
    // Surface roads
    { id: 'ew1', x1: -190, y1: 0.55, z1: -32, x2: 190, y2: 0.55, z2: -32, width: 11 },
    { id: 'ew2', x1: -190, y1: 0.55, z1: 42, x2: 190, y2: 0.55, z2: 42, width: 11 },
    { id: 'ns1', x1: -52, y1: 0.55, z1: 20, x2: -52, y2: 0.55, z2: 140, width: 11 },
    { id: 'ns2', x1: 56, y1: 0.55, z1: -140, x2: 56, y2: 0.55, z2: 140, width: 11 },
    // Elevated Flyover 1 (East-West Z = 8, including ramps)
    { id: 'fly1_w', x1: -156, y1: 0.55, z1: 8, x2: -108, y2: 7.95, z2: 8, width: 10.2, isElevated: true },
    { id: 'fly1_c', x1: -108, y1: 7.95, z1: 8, x2: 106, y2: 7.95, z2: 8, width: 10.6, isElevated: true },
    { id: 'fly1_e', x1: 106, y1: 7.95, z1: 8, x2: 154, y2: 0.55, z2: 8, width: 10.2, isElevated: true },
    // Elevated Flyover 2 (North-South X = 18 at Y = 12.55)
    { id: 'fly2_c', x1: 18, y1: 12.55, z1: 68, x2: 18, y2: 12.55, z2: -96, width: 9.8, isElevated: true },
  ];

  const vehicleCount = 84;
  const agents: VehicleLaneAgent[] = [];
  for (let i = 0; i < vehicleCount; i++) {
    const segIndex = i % vehiclePaths.length;
    const rnd = hash2(i, segIndex);
    const kindPool: VehicleLaneAgent['kind'][] = ['car', 'danfo', 'suv', 'car', 'danfo', 'keke'];
    const kind = kindPool[i % kindPool.length];
    const dir: 1 | -1 = i % 2 === 0 ? 1 : -1;
    const laneOffset = dir * (1.8 + (i % 2) * 1.9);
    const colorIdx =
      kind === 'danfo' ? (i % 2) : 2 + (i % (VEHICLE_COLORS.length - 2));
    agents.push({
      segIndex,
      t: rnd,
      dir,
      speed: (kind === 'danfo' ? 17 : kind === 'keke' ? 14 : 22) + (i % 5) * 2.1,
      colorIdx,
      kind,
      laneOffset,
    });
  }

  const carBodyGeo = trackGeo(new THREE.BoxGeometry(1.5, 0.9, 3.2));
  const carCabGeo = trackGeo(new THREE.BoxGeometry(1.3, 0.6, 1.7));
  const headlightGeo = trackGeo(new THREE.BoxGeometry(1.3, 0.22, 0.16));
  const vehicleBodyMat = trackMat(new THREE.MeshStandardMaterial({ roughness: 0.35, metalness: 0.35 }));
  const vehicleCabMat = trackMat(new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.15, metalness: 0.6 }));

  const vBodyInst = new THREE.InstancedMesh(carBodyGeo, vehicleBodyMat, vehicleCount);
  const vCabInst = new THREE.InstancedMesh(carCabGeo, vehicleCabMat, vehicleCount);
  const vHeadInst = new THREE.InstancedMesh(headlightGeo, mats.headlightGlow, vehicleCount);
  const vTailInst = new THREE.InstancedMesh(headlightGeo, mats.taillightGlow, vehicleCount);
  vBodyInst.castShadow = shadows;

  agents.forEach((ag, i) => {
    vBodyInst.setColorAt(i, VEHICLE_COLORS[ag.colorIdx]);
  });
  if (vBodyInst.instanceColor) vBodyInst.instanceColor.needsUpdate = true;

  group.add(vBodyInst, vCabInst, vHeadInst, vTailInst);

  // Reusable math scratch objects (ZERO per-frame allocations)
  const vPos = new THREE.Vector3();
  const vDir = new THREE.Vector3();
  const vSide = new THREE.Vector3();
  const vUp = new THREE.Vector3(0, 1, 0);
  const vQuat = new THREE.Quaternion();
  const vLookMat = new THREE.Matrix4();
  const vMat = new THREE.Matrix4();
  const vScale = new THREE.Vector3();
  const vSubPos = new THREE.Vector3();

  const update = (
    elapsed: number,
    dt: number,
    trafficFactor: number,
    _nightFactor: number,
    windFactor: number
  ) => {
    // 1. Airport ATC radar rotation + subtle beacon blink
    radarDishMesh.rotation.y = elapsed * 1.4;
    const blink = Math.sin(elapsed * 4.5) > 0.2 ? 1.15 : 0.7;
    beaconMesh.scale.setScalar(blink);

    // 2. Water gentle ripple scroll
    if (mats.waterSurface.map) {
      mats.waterSurface.map.offset.x = (elapsed * 0.012) % 1;
      mats.waterSurface.map.offset.y = (elapsed * 0.006) % 1;
    }

    // 3. Subtle wind sway on tree foliage
    if (windFactor > 0.15) {
      treesInstanced.rotation.z = Math.sin(elapsed * 1.8) * 0.012 * windFactor;
    } else {
      treesInstanced.rotation.z = 0;
    }

    // 4. Advance all 3D Vehicles smoothly along surface & elevated flyover lanes
    const effectiveDt = Math.min(0.08, dt) * trafficFactor;
    for (let i = 0; i < agents.length; i++) {
      const ag = agents[i];
      const seg = vehiclePaths[ag.segIndex];
      const segLen = Math.hypot(seg.x2 - seg.x1, seg.z2 - seg.z1);
      ag.t += (ag.dir * ag.speed * effectiveDt) / Math.max(1, segLen);
      if (ag.t > 1) ag.t -= 1;
      if (ag.t < 0) ag.t += 1;

      const lx = seg.x1 + (seg.x2 - seg.x1) * ag.t;
      const ly = seg.y1 + (seg.y2 - seg.y1) * ag.t;
      const lz = seg.z1 + (seg.z2 - seg.z1) * ag.t;

      vDir.set(
        (seg.x2 - seg.x1) * ag.dir,
        (seg.y2 - seg.y1) * ag.dir,
        (seg.z2 - seg.z1) * ag.dir
      ).normalize();

      vSide.crossVectors(vDir, vUp).normalize();
      vPos.set(lx, ly, lz).addScaledVector(vSide, ag.laneOffset);

      vLookMat.lookAt(vPos, vSubPos.copy(vPos).add(vDir), vUp);
      // Note lookAt builds camera matrix looking down -Z; invert basis or negate Z
      vQuat.setFromRotationMatrix(vLookMat);

      const scaleX = ag.kind === 'danfo' ? 1.2 : ag.kind === 'keke' ? 0.72 : 1.0;
      const scaleY = ag.kind === 'danfo' ? 1.45 : ag.kind === 'suv' ? 1.15 : 0.95;
      const scaleZ = ag.kind === 'danfo' ? 1.35 : ag.kind === 'keke' ? 0.68 : 1.0;

      vScale.set(scaleX, scaleY, scaleZ);
      vMat.compose(vPos, vQuat, vScale);
      vBodyInst.setMatrixAt(i, vMat);

      // Cabin roof
      vSubPos.copy(vPos);
      vSubPos.y += 0.65 * scaleY;
      vScale.set(scaleX * 0.9, scaleY * 0.85, scaleZ * 0.9);
      vMat.compose(vSubPos, vQuat, vScale);
      vCabInst.setMatrixAt(i, vMat);

      // Front headlights (along +vDir)
      vSubPos.copy(vPos).addScaledVector(vDir, 1.65 * scaleZ);
      vSubPos.y -= 0.05;
      vScale.set(scaleX, 1, 1);
      vMat.compose(vSubPos, vQuat, vScale);
      vHeadInst.setMatrixAt(i, vMat);

      // Rear taillights (along -vDir)
      vSubPos.copy(vPos).addScaledVector(vDir, -1.65 * scaleZ);
      vMat.compose(vSubPos, vQuat, vScale);
      vTailInst.setMatrixAt(i, vMat);
    }

    vBodyInst.instanceMatrix.needsUpdate = true;
    vCabInst.instanceMatrix.needsUpdate = true;
    vHeadInst.instanceMatrix.needsUpdate = true;
    vTailInst.instanceMatrix.needsUpdate = true;
  };

  // Initial pose frame
  update(0, 0.016, 1, 0, 0);

  return {
    group,
    airportHitMesh,
    radarDishMesh,
    beaconMesh,
    waterMesh,
    treesInstanced,
    update,
    dispose: () => {
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
    },
  };
}
