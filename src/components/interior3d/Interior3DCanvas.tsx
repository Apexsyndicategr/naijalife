/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { CharacterAvatar } from '../../types/game';
import { createRiggedAvatar3D } from '../avatar3d/riggedAvatarBuilder';
import { InteractivePropSpec, InteriorSceneBlueprint } from './interiorLayouts';

export interface Interior3DCanvasProps {
  blueprint: InteriorSceneBlueprint;
  avatar: CharacterAvatar;
  lightsOn: boolean;
  isDecorateMode?: boolean;
  selectedCustomId?: string | null;
  onSelectCustomProp?: (propId: string) => void;
  onMoveCustomProp?: (propId: string, nextX: number, nextZ: number) => void;
  onTriggerInteraction: (prop: InteractivePropSpec) => void;
}

function createPropMesh(spec: InteractivePropSpec, accentHex: number): THREE.Group {
  const g = new THREE.Group();
  const baseMat = new THREE.MeshStandardMaterial({ color: accentHex, roughness: 0.55, metalness: 0.12 });
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.7 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.4, metalness: 0.25 });
  const brightMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.35 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.15, metalness: 0.5, transparent: true, opacity: 0.72 });

  const t = spec.propMeshType;
  if (t === 'door') {
    const frame = new THREE.Mesh(new THREE.BoxGeometry(1.75, 2.55, 0.25), darkMat);
    frame.position.y = 1.28;
    const leaf = new THREE.Mesh(new THREE.BoxGeometry(1.45, 2.4, 0.16), baseMat);
    leaf.position.y = 1.22;
    const handle = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 10), new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.9, roughness: 0.2 }));
    handle.position.set(0.5, 1.1, -0.1);
    g.add(frame, leaf, handle);
  } else if (t === 'bed') {
    const frame = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.38, 2.0), woodMat);
    frame.position.y = 0.22;
    const mattress = new THREE.Mesh(new THREE.BoxGeometry(2.15, 0.28, 1.85), brightMat);
    mattress.position.y = 0.5;
    const duvet = new THREE.Mesh(new THREE.BoxGeometry(2.18, 0.3, 1.2), baseMat);
    duvet.position.set(0, 0.52, 0.32);
    const headboard = new THREE.Mesh(new THREE.BoxGeometry(2.3, 1.15, 0.18), woodMat);
    headboard.position.set(0, 0.6, -0.92);
    g.add(frame, mattress, duvet, headboard);
  } else if (t === 'sofa') {
    const base = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.42, 1.05), baseMat);
    base.position.y = 0.24;
    const back = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.8, 0.24), baseMat);
    back.position.set(0, 0.58, -0.4);
    const armL = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.62, 1.05), baseMat);
    armL.position.set(-1.14, 0.45, 0);
    const armR = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.62, 1.05), baseMat);
    armR.position.set(1.14, 0.45, 0);
    g.add(base, back, armL, armR);
  } else if (t === 'tv') {
    const stand = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.52, 0.45), woodMat);
    stand.position.y = 0.26;
    const screen = new THREE.Mesh(new THREE.BoxGeometry(1.9, 1.05, 0.08), darkMat);
    screen.position.y = 1.2;
    const glow = new THREE.Mesh(
      new THREE.BoxGeometry(1.78, 0.92, 0.09),
      new THREE.MeshStandardMaterial({ color: 0x0ea5e9, emissive: 0x0284c7, emissiveIntensity: 0.45 })
    );
    glow.position.y = 1.2;
    g.add(stand, screen, glow);
  } else if (t === 'fridge') {
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.0, 2.1, 0.85), brightMat);
    body.position.y = 1.05;
    const split = new THREE.Mesh(new THREE.BoxGeometry(1.02, 0.04, 0.87), darkMat);
    split.position.y = 1.25;
    g.add(body, split);
  } else if (t === 'stove') {
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.9, 0.82), brightMat);
    body.position.y = 0.45;
    const top = new THREE.Mesh(new THREE.BoxGeometry(1.48, 0.08, 0.85), darkMat);
    top.position.y = 0.92;
    g.add(body, top);
  } else if (t === 'shower') {
    const tray = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.16, 1.4), brightMat);
    tray.position.y = 0.08;
    const wallA = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.2, 0.08), glassMat);
    wallA.position.set(0, 1.15, 0.66);
    const wallB = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.2, 1.4), glassMat);
    wallB.position.set(-0.66, 1.15, 0);
    const head = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.08, 14), darkMat);
    head.position.set(0, 2.15, -0.35);
    g.add(tray, wallA, wallB, head);
  } else if (t === 'wardrobe' || t === 'shelf_rack') {
    const box = new THREE.Mesh(new THREE.BoxGeometry(spec.w, 2.1, spec.d), woodMat);
    box.position.y = 1.05;
    const trim = new THREE.Mesh(new THREE.BoxGeometry(spec.w * 0.94, 1.9, 0.05), baseMat);
    trim.position.set(0, 1.05, spec.d / 2 + 0.01);
    g.add(box, trim);
  } else if (t === 'storage_crate' || t === 'pallet_stack') {
    const crate = new THREE.Mesh(new THREE.BoxGeometry(spec.w, 0.9, spec.d), baseMat);
    crate.position.y = 0.45;
    const lid = new THREE.Mesh(new THREE.BoxGeometry(spec.w * 1.04, 0.14, spec.d * 1.04), woodMat);
    lid.position.y = 0.92;
    g.add(crate, lid);
  } else if (t === 'lamp') {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.14, 1.65, 12), darkMat);
    pole.position.y = 0.82;
    const shade = new THREE.Mesh(
      new THREE.ConeGeometry(0.32, 0.42, 14),
      new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xfacc15, emissiveIntensity: 0.65 })
    );
    shade.position.y = 1.72;
    g.add(pole, shade);
  } else if (t === 'atm') {
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.85, 1.85, 0.75), darkMat);
    body.position.y = 0.92;
    const screen = new THREE.Mesh(
      new THREE.BoxGeometry(0.62, 0.48, 0.06),
      new THREE.MeshStandardMaterial({ color: accentHex, emissive: accentHex, emissiveIntensity: 0.55 })
    );
    screen.position.set(0, 1.28, 0.38);
    g.add(body, screen);
  } else if (t === 'counter_desk' || t === 'office_desk' || t === 'pulpit' || t === 'dj_booth') {
    const body = new THREE.Mesh(new THREE.BoxGeometry(spec.w, 1.02, spec.d), woodMat);
    body.position.y = 0.51;
    const top = new THREE.Mesh(new THREE.BoxGeometry(spec.w + 0.12, 0.1, spec.d + 0.12), baseMat);
    top.position.y = 1.06;
    g.add(body, top);
    const monitor = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.45, 0.06), darkMat);
    monitor.position.set(0, 1.38, -0.1);
    g.add(monitor);
  } else if (t === 'dining_table') {
    const top = new THREE.Mesh(new THREE.BoxGeometry(spec.w, 0.12, spec.d), woodMat);
    top.position.y = 0.78;
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.35, 0.76, 12), darkMat);
    leg.position.y = 0.38;
    g.add(top, leg);
  } else if (t === 'clothing_rack') {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(spec.w, 0.08, 0.1), darkMat);
    bar.position.y = 1.55;
    const legL = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.55, 8), darkMat);
    legL.position.set(-spec.w / 2 + 0.15, 0.77, 0);
    const legR = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.55, 8), darkMat);
    legR.position.set(spec.w / 2 - 0.15, 0.77, 0);
    const clothes = new THREE.Mesh(new THREE.BoxGeometry(spec.w - 0.5, 0.85, 0.55), baseMat);
    clothes.position.y = 1.1;
    g.add(bar, legL, legR, clothes);
  } else if (t === 'salon_chair') {
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.5, 0.25, 16), darkMat);
    base.position.y = 0.12;
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.22, 0.75), baseMat);
    seat.position.y = 0.55;
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.85, 0.18), baseMat);
    back.position.set(0, 0.95, -0.3);
    g.add(base, seat, back);
  } else if (t === 'medical_bed') {
    const frame = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.35, 1.25), brightMat);
    frame.position.y = 0.42;
    const sheet = new THREE.Mesh(new THREE.BoxGeometry(2.05, 0.2, 1.15), baseMat);
    sheet.position.y = 0.62;
    g.add(frame, sheet);
  } else if (t === 'treadmill') {
    const deck = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.22, 1.95), darkMat);
    deck.position.y = 0.14;
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.92, 1.15, 0.2), baseMat);
    rail.position.set(0, 0.72, -0.82);
    g.add(deck, rail);
  } else if (t === 'car_plinth') {
    const plinth = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.35, 0.2, 28), darkMat);
    plinth.position.y = 0.1;
    const body = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.75, 1.65), baseMat);
    body.position.y = 0.65;
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.58, 1.4), glassMat);
    cabin.position.set(-0.15, 1.25, 0);
    g.add(plinth, body, cabin);
  }

  g.traverse((obj) => {
    if ((obj as THREE.Mesh).isMesh) {
      obj.castShadow = true;
      obj.receiveShadow = true;
    }
  });
  return g;
}

export const Interior3DCanvas: React.FC<Interior3DCanvasProps> = ({
  blueprint,
  avatar,
  lightsOn,
  isDecorateMode = false,
  selectedCustomId = null,
  onSelectCustomProp,
  onTriggerInteraction,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [nearbyProp, setNearbyProp] = useState<InteractivePropSpec | null>(null);
  const keysPressedRef = useRef<Set<string>>(new Set());
  const dpadDirRef = useRef<{ x: number; z: number }>({ x: 0, z: 0 });
  const walkTargetRef = useRef<{ active: boolean; x: number; z: number }>({ active: false, x: 0, z: 0 });
  const playerPosRef = useRef<{ x: number; z: number; rotY: number }>({
    x: blueprint.spawnX,
    z: blueprint.spawnZ,
    rotY: Math.PI,
  });

  const lightsOnRef = useRef(lightsOn);
  lightsOnRef.current = lightsOn;
  const blueprintRef = useRef(blueprint);
  blueprintRef.current = blueprint;
  const onTriggerRef = useRef(onTriggerInteraction);
  onTriggerRef.current = onTriggerInteraction;
  const nearbyPropRef = useRef<InteractivePropSpec | null>(null);
  nearbyPropRef.current = nearbyProp;
  const isDecorateRef = useRef(isDecorateMode);
  isDecorateRef.current = isDecorateMode;
  const onSelectCustomRef = useRef(onSelectCustomProp);
  onSelectCustomRef.current = onSelectCustomProp;

  const bpKey = `${blueprint.title}_${blueprint.category}_${blueprint.wallColorHex}_${blueprint.floorColorHex}_${blueprint.props.length}_${selectedCustomId || ''}`;
  const avatarKey = JSON.stringify(avatar || {});

  useEffect(() => {
    // Only reset player position if entering a completely different building
    playerPosRef.current = { x: blueprint.spawnX, z: blueprint.spawnZ, rotY: Math.PI };
    walkTargetRef.current.active = false;
  }, [blueprint.title, blueprint.category]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k)) {
        keysPressedRef.current.add(k);
        walkTargetRef.current.active = false;
      } else if (k === 'e' || k === 'enter') {
        if (nearbyPropRef.current) {
          onTriggerRef.current(nearbyPropRef.current);
        }
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keysPressedRef.current.delete(e.key.toLowerCase());
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let disposed = false;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    } catch {
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x090d0b);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envRT.texture;
    scene.environmentIntensity = 0.45;
    pmrem.dispose();

    const camera = new THREE.PerspectiveCamera(48, width / height, 0.2, 100);
    camera.position.set(playerPosRef.current.x, 7.2, playerPosRef.current.z + 7.4);

    // Interior Lighting
    const hemiLight = new THREE.HemisphereLight(0xfffbeb, 0x1e293b, 0.95);
    scene.add(hemiLight);
    const sunLight = new THREE.DirectionalLight(0xfff7ed, 1.35);
    sunLight.position.set(5, 11, 6);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.set(1024, 1024);
    sunLight.shadow.camera.left = -12;
    sunLight.shadow.camera.right = 12;
    sunLight.shadow.camera.top = 10;
    sunLight.shadow.camera.bottom = -10;
    scene.add(sunLight);

    const warmCeilingLight = new THREE.PointLight(0xfef08a, 1.4, 24);
    warmCeilingLight.position.set(0, 3.3, 0);
    scene.add(warmCeilingLight);

    const bp = blueprintRef.current;

    // Floor Slab
    const floorGeo = new THREE.BoxGeometry(bp.width, 0.24, bp.depth);
    const floorMat = new THREE.MeshStandardMaterial({
      color: bp.floorColorHex,
      roughness: bp.floorTileGrid ? 0.35 : 0.72,
      metalness: 0.06,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.position.y = -0.12;
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    const gridHelper = new THREE.GridHelper(bp.width, 18, 0x000000, 0x000000);
    (gridHelper.material as THREE.Material).transparent = true;
    (gridHelper.material as THREE.Material).opacity = 0.09;
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);

    // Perimeter Walls (Back, Left, Right; Front wall low cutaway so angled camera never clips!)
    const wallMat = new THREE.MeshStandardMaterial({ color: bp.wallColorHex, roughness: 0.75 });
    const wallMeshes: THREE.Mesh[] = [];
    const buildWallBox = (w: number, h: number, d: number, x: number, z: number, colorHex?: number) => {
      const mat = colorHex ? new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.75 }) : wallMat;
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
      m.position.set(x, h / 2, z);
      m.castShadow = true;
      m.receiveShadow = true;
      scene.add(m);
      wallMeshes.push(m);
    };

    buildWallBox(bp.width + 0.4, 3.2, 0.3, 0, -bp.depth / 2 - 0.15); // Back
    buildWallBox(0.3, 3.2, bp.depth + 0.3, -bp.width / 2 - 0.15, 0); // Left
    buildWallBox(0.3, 3.2, bp.depth + 0.3, bp.width / 2 + 0.15, 0); // Right
    // Front cutaway walls flanking entrance door
    buildWallBox(bp.width / 2 - 1.2, 0.85, 0.28, -(bp.width / 4 + 0.6), bp.depth / 2 + 0.14);
    buildWallBox(bp.width / 2 - 1.2, 0.85, 0.28, bp.width / 4 + 0.6, bp.depth / 2 + 0.14);

    // Interior partition walls
    for (const pw of bp.walls) {
      buildWallBox(pw.w, pw.h || 3.0, pw.d, pw.x, pw.z, pw.color);
    }

    // Build Interactive 3D Props & Selection Ring
    const propHitMeshes: THREE.Object3D[] = [];
    for (const prop of bp.props) {
      const propGroup = createPropMesh(prop, prop.accentHex || 0x10b981);
      propGroup.position.set(prop.x, 0, prop.z);
      if (prop.rotationY) propGroup.rotation.y = prop.rotationY;
      propGroup.userData = { prop };
      scene.add(propGroup);

      // Subtle emerald interactive floor ring around prop
      const isSelected = selectedCustomId && prop.id === `custom_${selectedCustomId}`;
      const ringGeo = new THREE.RingGeometry(Math.max(prop.w, prop.d) * 0.48, Math.max(prop.w, prop.d) * 0.56, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: isSelected ? 0xfbbf24 : prop.actionType === 'exit_door' ? 0x34d399 : 0x38bdf8,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: isSelected ? 0.9 : 0.32,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(prop.x, 0.02, prop.z);
      scene.add(ring);

      const hit = new THREE.Mesh(
        new THREE.BoxGeometry(Math.max(1.2, prop.w), 2.2, Math.max(1.2, prop.d)),
        new THREE.MeshBasicMaterial({ visible: false })
      );
      hit.position.set(prop.x, 1.1, prop.z);
      hit.userData = { prop };
      scene.add(hit);
      propHitMeshes.push(hit);
    }

    // Spawn Player's Authoritative Customized 3D Avatar inside Entrance!
    const playerAvatar = createRiggedAvatar3D(avatar);
    playerAvatar.group.position.set(playerPosRef.current.x, 0, playerPosRef.current.z);
    playerAvatar.group.rotation.y = playerPosRef.current.rotY;
    scene.add(playerAvatar.group);

    // Click-on-floor or Click-on-prop raycaster
    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const handlePointerUp = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      ndc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      ndc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(ndc, camera);

      const propHits = raycaster.intersectObjects(propHitMeshes, false);
      if (propHits.length > 0) {
        const hitProp = propHits[0].object.userData?.prop as InteractivePropSpec | undefined;
        if (hitProp) {
          if (isDecorateRef.current && hitProp.id.startsWith('custom_')) {
            onSelectCustomRef.current?.(hitProp.id.replace('custom_', ''));
            return;
          }
          const dist = Math.hypot(hitProp.x - playerPosRef.current.x, hitProp.z - playerPosRef.current.z);
          if (dist <= 2.9) {
            onTriggerRef.current(hitProp);
          } else {
            // Walk close to clicked prop
            walkTargetRef.current = { active: true, x: hitProp.x, z: hitProp.z + (hitProp.z < 0 ? 1.4 : -1.4) };
          }
          return;
        }
      }

      const floorHits = raycaster.intersectObject(floorMesh, false);
      if (floorHits.length > 0) {
        const pt = floorHits[0].point;
        walkTargetRef.current = {
          active: true,
          x: THREE.MathUtils.clamp(pt.x, -bp.width / 2 + 0.8, bp.width / 2 - 0.8),
          z: THREE.MathUtils.clamp(pt.z, -bp.depth / 2 + 0.8, bp.depth / 2 - 0.8),
        };
      }
    };
    renderer.domElement.addEventListener('pointerup', handlePointerUp);

    const resizeObs = new ResizeObserver((entries) => {
      if (disposed) return;
      for (const entry of entries) {
        const w = Math.max(1, entry.contentRect.width);
        const h = Math.max(1, entry.contentRect.height);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    });
    resizeObs.observe(container);

    // Collision Check (Walls & Colliding Furniture AABBs)
    const isBlocked = (nx: number, nz: number): boolean => {
      const margin = 0.45;
      if (nx < -bp.width / 2 + margin || nx > bp.width / 2 - margin) return true;
      if (nz < -bp.depth / 2 + margin || nz > bp.depth / 2 - margin) return true;
      for (const w of bp.walls) {
        if (Math.abs(nx - w.x) < w.w / 2 + 0.35 && Math.abs(nz - w.z) < w.d / 2 + 0.35) {
          return true;
        }
      }
      for (const p of bp.props) {
        if (!p.collides) continue;
        if (Math.abs(nx - p.x) < p.w / 2 + 0.3 && Math.abs(nz - p.z) < p.d / 2 + 0.3) {
          return true;
        }
      }
      return false;
    };

    let rafId = 0;
    let prev = performance.now();
    const start = prev;
    let lastNearbyId: string | null = null;

    const animate = (now: number) => {
      if (disposed) return;
      rafId = requestAnimationFrame(animate);
      const dt = Math.min(0.05, Math.max(0.001, (now - prev) / 1000));
      const elapsed = (now - start) / 1000;
      prev = now;

      // Update lighting state
      const lOn = lightsOnRef.current;
      hemiLight.intensity = lOn ? 1.0 : 0.32;
      sunLight.intensity = lOn ? 1.35 : 0.35;
      warmCeilingLight.intensity = lOn ? 1.4 : 0.12;

      // Movement vector from keyboard + mobile D-pad + click-to-walk
      let vx = dpadDirRef.current.x;
      let vz = dpadDirRef.current.z;
      const ks = keysPressedRef.current;
      if (ks.has('w') || ks.has('arrowup')) vz -= 1;
      if (ks.has('s') || ks.has('arrowdown')) vz += 1;
      if (ks.has('a') || ks.has('arrowleft')) vx -= 1;
      if (ks.has('d') || ks.has('arrowright')) vx += 1;

      if (vx === 0 && vz === 0 && walkTargetRef.current.active) {
        const dx = walkTargetRef.current.x - playerPosRef.current.x;
        const dz = walkTargetRef.current.z - playerPosRef.current.z;
        const d = Math.hypot(dx, dz);
        if (d < 0.25) {
          walkTargetRef.current.active = false;
        } else {
          vx = dx / d;
          vz = dz / d;
        }
      }

      const len = Math.hypot(vx, vz);
      const isMoving = len > 0.05;
      if (isMoving) {
        const speed = 4.6;
        const nx = (vx / len) * speed * dt;
        const nz = (vz / len) * speed * dt;

        // Axis-separated sliding collision
        if (!isBlocked(playerPosRef.current.x + nx, playerPosRef.current.z)) {
          playerPosRef.current.x += nx;
        }
        if (!isBlocked(playerPosRef.current.x, playerPosRef.current.z + nz)) {
          playerPosRef.current.z += nz;
        }

        const targetAngle = Math.atan2(vx, vz);
        let diff = targetAngle - playerPosRef.current.rotY;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        playerPosRef.current.rotY += diff * Math.min(1, dt * 12);
      }

      playerAvatar.group.position.set(playerPosRef.current.x, 0, playerPosRef.current.z);
      playerAvatar.group.rotation.y = playerPosRef.current.rotY;
      playerAvatar.updateAnimation(elapsed, dt, isMoving ? 'walk' : 'idle');

      // Smooth angled third-person follow camera inside room
      const goalCamX = playerPosRef.current.x * 0.72;
      const goalCamZ = playerPosRef.current.z + 7.2;
      camera.position.x = THREE.MathUtils.damp(camera.position.x, goalCamX, 6.0, dt);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, 7.1, 6.0, dt);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, goalCamZ, 6.0, dt);
      camera.lookAt(playerPosRef.current.x * 0.85, 0.9, playerPosRef.current.z - 0.6);

      // Find nearest interactive prop within proximity radius
      let closest: InteractivePropSpec | null = null;
      let bestDist = 2.6;
      for (const p of bp.props) {
        const d = Math.hypot(p.x - playerPosRef.current.x, p.z - playerPosRef.current.z);
        if (d < bestDist) {
          bestDist = d;
          closest = p;
        }
      }
      if ((closest?.id || null) !== lastNearbyId) {
        lastNearbyId = closest?.id || null;
        setNearbyProp(closest);
      }

      renderer.render(scene, camera);
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      resizeObs.disconnect();
      renderer.domElement.removeEventListener('pointerup', handlePointerUp);
      playerAvatar.dispose();
      floorGeo.dispose();
      floorMat.dispose();
      wallMat.dispose();
      envRT.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [bpKey, avatarKey]);

  const setPad = (dx: number, dz: number) => {
    dpadDirRef.current = { x: dx, z: dz };
    if (dx !== 0 || dz !== 0) walkTargetRef.current.active = false;
  };

  return (
    <div className="relative w-full h-full select-none overflow-hidden bg-zinc-950">
      <div ref={containerRef} className="w-full h-full cursor-pointer" />

      {/* Room Zones HUD Indicator */}
      <div className="absolute top-3 left-3 z-20 pointer-events-none hidden sm:flex flex-wrap gap-1.5 max-w-md">
        {blueprint.roomLabels.map((r) => (
          <span
            key={r.name}
            className="px-2.5 py-1 rounded-lg bg-zinc-950/75 border border-zinc-800/90 text-[10px] font-mono text-zinc-300"
          >
            {r.name}
          </span>
        ))}
      </div>

      {/* Controls Tip */}
      <div className="absolute top-3 right-3 z-20 pointer-events-none hidden sm:block px-3 py-1 rounded-lg bg-zinc-950/80 border border-zinc-800 text-[10px] font-mono text-zinc-400">
        WASD / Arrows or Tap Floor to Walk · [E] Interact
      </div>

      {/* Proximity Interact Prompt */}
      {nearbyProp && (
        <div className="absolute bottom-24 sm:bottom-8 left-1/2 -translate-x-1/2 z-30">
          <button
            type="button"
            onClick={() => onTriggerInteraction(nearbyProp)}
            className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs sm:text-sm shadow-2xl shadow-emerald-500/30 border-2 border-emerald-200 flex items-center gap-2 cursor-pointer transition-transform active:scale-95"
          >
            <span className="px-1.5 py-0.5 rounded bg-black text-emerald-300 font-mono text-[10px]">E</span>
            <span>{nearbyProp.label}</span>
          </button>
        </div>
      )}

      {/* Mobile / Touch On-Screen D-Pad */}
      <div className="absolute bottom-4 left-4 z-30 grid grid-cols-3 gap-1 w-28 h-28 bg-zinc-950/75 p-1.5 rounded-2xl border border-zinc-800 backdrop-blur-md">
        <div />
        <button
          type="button"
          onPointerDown={() => setPad(0, -1)}
          onPointerUp={() => setPad(0, 0)}
          onPointerLeave={() => setPad(0, 0)}
          className="rounded-lg bg-zinc-800 active:bg-emerald-500 active:text-black text-white font-black text-xs flex items-center justify-center"
        >
          ▲
        </button>
        <div />
        <button
          type="button"
          onPointerDown={() => setPad(-1, 0)}
          onPointerUp={() => setPad(0, 0)}
          onPointerLeave={() => setPad(0, 0)}
          className="rounded-lg bg-zinc-800 active:bg-emerald-500 active:text-black text-white font-black text-xs flex items-center justify-center"
        >
          ◀
        </button>
        <div className="rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[9px] font-mono text-zinc-500">
          WALK
        </div>
        <button
          type="button"
          onPointerDown={() => setPad(1, 0)}
          onPointerUp={() => setPad(0, 0)}
          onPointerLeave={() => setPad(0, 0)}
          className="rounded-lg bg-zinc-800 active:bg-emerald-500 active:text-black text-white font-black text-xs flex items-center justify-center"
        >
          ▶
        </button>
        <div />
        <button
          type="button"
          onPointerDown={() => setPad(0, 1)}
          onPointerUp={() => setPad(0, 0)}
          onPointerLeave={() => setPad(0, 0)}
          className="rounded-lg bg-zinc-800 active:bg-emerald-500 active:text-black text-white font-black text-xs flex items-center justify-center"
        >
          ▼
        </button>
        <div />
      </div>
    </div>
  );
};
