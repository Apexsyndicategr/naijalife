/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';

export interface CityTextureSet {
  ground: THREE.CanvasTexture;
  groundCanada: THREE.CanvasTexture;
  asphaltRoad: THREE.CanvasTexture;
  bridgeDeck: THREE.CanvasTexture;
  crosswalk: THREE.CanvasTexture;
  runway27: THREE.CanvasTexture;
  windowGlassColor: THREE.CanvasTexture;
  windowEmissiveWarm: THREE.CanvasTexture;
  windowEmissiveCool: THREE.CanvasTexture;
  sidewalk: THREE.CanvasTexture;
  parkingLot: THREE.CanvasTexture;
  waterRipple: THREE.CanvasTexture;
  cloudPuff: THREE.CanvasTexture;
  pitchField: THREE.CanvasTexture;
  dispose: () => void;
}

function makeCanvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  return [canvas, ctx];
}

function finalizeTexture(
  canvas: HTMLCanvasElement,
  anisotropy: number,
  options?: {
    srgb?: boolean;
    repeatX?: number;
    repeatY?: number;
    wrap?: boolean;
  }
): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = options?.srgb === false ? THREE.NoColorSpace : THREE.SRGBColorSpace;
  tex.anisotropy = Math.min(8, Math.max(1, anisotropy));
  if (options?.wrap !== false) {
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
  } else {
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
  }
  if (options?.repeatX || options?.repeatY) {
    tex.repeat.set(options.repeatX ?? 1, options.repeatY ?? 1);
  }
  tex.needsUpdate = true;
  return tex;
}

export function createCityTextures(maxAnisotropy: number): CityTextureSet {
  // 1. Urban Ground / Terrain (Tropical West Africa Lush Greens & Urban Parcels)
  const [groundC, gCtx] = makeCanvas(512, 512);
  gCtx.fillStyle = '#24452b';
  gCtx.fillRect(0, 0, 512, 512);
  // Subtle organic turf patches (deterministic pseudo-random using fixed trig hash)
  for (let i = 0; i < 360; i++) {
    const px = ((Math.sin(i * 12.9898) * 43758.5453) % 1 + 1) % 1 * 512;
    const py = ((Math.sin(i * 78.233) * 23421.631) % 1 + 1) % 1 * 512;
    const r = 10 + (i % 24);
    gCtx.fillStyle = i % 3 === 0 ? 'rgba(54, 102, 58, 0.28)' : i % 3 === 1 ? 'rgba(28, 56, 35, 0.3)' : 'rgba(66, 115, 63, 0.16)';
    gCtx.beginPath();
    gCtx.arc(px, py, r, 0, Math.PI * 2);
    gCtx.fill();
  }
  // Subtle city parcel grid
  gCtx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
  gCtx.lineWidth = 2;
  for (let p = 0; p < 512; p += 64) {
    gCtx.beginPath();
    gCtx.moveTo(p, 0);
    gCtx.lineTo(p, 512);
    gCtx.stroke();
    gCtx.beginPath();
    gCtx.moveTo(0, p);
    gCtx.lineTo(512, p);
    gCtx.stroke();
  }
  const ground = finalizeTexture(groundC, maxAnisotropy, { repeatX: 16, repeatY: 12 });

  // 1b. Northern Temperate Urban Ground (Canada)
  const [canGroundC, cgCtx] = makeCanvas(512, 512);
  cgCtx.fillStyle = '#2b4734';
  cgCtx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 300; i++) {
    const px = ((Math.sin(i * 17.13) * 43758.5453) % 1 + 1) % 1 * 512;
    const py = ((Math.sin(i * 63.71) * 23421.631) % 1 + 1) % 1 * 512;
    const r = 12 + (i % 20);
    cgCtx.fillStyle = i % 2 === 0 ? 'rgba(58, 86, 68, 0.25)' : 'rgba(35, 55, 45, 0.25)';
    cgCtx.beginPath();
    cgCtx.arc(px, py, r, 0, Math.PI * 2);
    cgCtx.fill();
  }
  cgCtx.strokeStyle = 'rgba(226, 232, 240, 0.06)';
  cgCtx.lineWidth = 2;
  for (let p = 0; p < 512; p += 64) {
    cgCtx.beginPath();
    cgCtx.moveTo(p, 0);
    cgCtx.lineTo(p, 512);
    cgCtx.stroke();
    cgCtx.beginPath();
    cgCtx.moveTo(0, p);
    cgCtx.lineTo(512, p);
    cgCtx.stroke();
  }
  const groundCanada = finalizeTexture(canGroundC, maxAnisotropy, { repeatX: 16, repeatY: 12 });

  // 2. Multi-Lane Asphalt Road Texture (Horizontal U-axis along road length)
  const [roadC, rCtx] = makeCanvas(512, 256);
  rCtx.fillStyle = '#232830';
  rCtx.fillRect(0, 0, 512, 256);
  // Micro asphalt grain
  for (let i = 0; i < 1600; i++) {
    const gx = ((Math.sin(i * 91.7) * 43758.54) % 1 + 1) % 1 * 512;
    const gy = ((Math.sin(i * 31.3) * 18392.11) % 1 + 1) % 1 * 256;
    rCtx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.12)';
    rCtx.fillRect(gx, gy, 2, 2);
  }
  // Edge solid white lines
  rCtx.fillStyle = '#d4d8df';
  rCtx.fillRect(0, 14, 512, 5);
  rCtx.fillRect(0, 237, 512, 5);
  // Double amber/yellow median centerline
  rCtx.fillStyle = '#f59e0b';
  rCtx.fillRect(0, 121, 512, 5);
  rCtx.fillRect(0, 130, 512, 5);
  // Dashed lane lines
  rCtx.fillStyle = 'rgba(241, 245, 249, 0.85)';
  for (let d = 16; d < 512; d += 64) {
    rCtx.fillRect(d, 68, 34, 4);
    rCtx.fillRect(d, 184, 34, 4);
  }
  const asphaltRoad = finalizeTexture(roadC, maxAnisotropy, { repeatX: 10, repeatY: 1 });

  // 3. Elevated Highway / Flyover Deck Texture
  const [bridgeC, bCtx] = makeCanvas(512, 256);
  bCtx.fillStyle = '#2b323c';
  bCtx.fillRect(0, 0, 512, 256);
  // Concrete expansion joints
  bCtx.fillStyle = 'rgba(15, 23, 42, 0.45)';
  for (let x = 0; x < 512; x += 128) {
    bCtx.fillRect(x, 0, 3, 256);
  }
  // Outer shoulder & median markings
  bCtx.fillStyle = '#e2e8f0';
  bCtx.fillRect(0, 18, 512, 5);
  bCtx.fillRect(0, 233, 512, 5);
  bCtx.fillStyle = '#fbbf24';
  bCtx.fillRect(0, 118, 512, 4);
  bCtx.fillRect(0, 134, 512, 4);
  bCtx.fillStyle = 'rgba(255,255,255,0.8)';
  for (let d = 12; d < 512; d += 64) {
    bCtx.fillRect(d, 68, 34, 3);
    bCtx.fillRect(d, 185, 34, 3);
  }
  const bridgeDeck = finalizeTexture(bridgeC, maxAnisotropy, { repeatX: 12, repeatY: 1 });

  // 4. Zebra Crosswalk
  const [crossC, cCtx] = makeCanvas(128, 128);
  cCtx.fillStyle = '#232830';
  cCtx.fillRect(0, 0, 128, 128);
  cCtx.fillStyle = '#f8fafc';
  for (let y = 10; y < 118; y += 22) {
    cCtx.fillRect(8, y, 112, 12);
  }
  const crosswalk = finalizeTexture(crossC, maxAnisotropy, { repeatX: 1, repeatY: 1, wrap: false });

  // 5. Airport Runway 27 Texture
  const [rwyC, rwCtx] = makeCanvas(1024, 256);
  rwCtx.fillStyle = '#181e27';
  rwCtx.fillRect(0, 0, 1024, 256);
  // Edge lines
  rwCtx.fillStyle = '#e2e8f0';
  rwCtx.fillRect(0, 10, 1024, 5);
  rwCtx.fillRect(0, 241, 1024, 5);
  // Threshold piano key bars
  for (let y = 26; y <= 214; y += 24) {
    rwCtx.fillRect(24, y, 56, 14);
    rwCtx.fillRect(944, y, 56, 14);
  }
  // Runway designation "27"
  rwCtx.save();
  rwCtx.fillStyle = '#ffffff';
  rwCtx.font = 'bold 58px monospace';
  rwCtx.textAlign = 'center';
  rwCtx.textBaseline = 'middle';
  rwCtx.translate(132, 128);
  rwCtx.rotate(Math.PI / 2);
  rwCtx.fillText('27', 0, 0);
  rwCtx.restore();
  // Touchdown blocks
  rwCtx.fillStyle = '#f8fafc';
  rwCtx.fillRect(220, 62, 65, 16);
  rwCtx.fillRect(220, 178, 65, 16);
  rwCtx.fillRect(740, 62, 65, 16);
  rwCtx.fillRect(740, 178, 65, 16);
  // Dashed white centerline
  for (let x = 210; x < 860; x += 62) {
    rwCtx.fillRect(x, 124, 36, 8);
  }
  const runway27 = finalizeTexture(rwyC, maxAnisotropy, { wrap: false });

  // 6. Architectural Window Facade & Night Emissive Window Grids
  const [winColC, wcCtx] = makeCanvas(256, 256);
  wcCtx.fillStyle = '#1e293b';
  wcCtx.fillRect(0, 0, 256, 256);
  const [winWarmC, wwCtx] = makeCanvas(256, 256);
  wwCtx.fillStyle = '#000000';
  wwCtx.fillRect(0, 0, 256, 256);
  const [winCoolC, wclCtx] = makeCanvas(256, 256);
  wclCtx.fillStyle = '#000000';
  wclCtx.fillRect(0, 0, 256, 256);

  const cols = 8;
  const rows = 8;
  const cellW = 256 / cols;
  const cellH = 256 / rows;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const hash = ((Math.sin(r * 37.2 + c * 91.7) * 43758.5) % 1 + 1) % 1;
      const x = c * cellW + 4;
      const y = r * cellH + 5;
      const w = cellW - 8;
      const h = cellH - 10;

      // Daylight glass pane with sky reflection gradient
      const grad = wcCtx.createLinearGradient(x, y, x, y + h);
      grad.addColorStop(0, hash > 0.5 ? '#5b8fb9' : '#3d6e96');
      grad.addColorStop(1, '#223f5c');
      wcCtx.fillStyle = grad;
      wcCtx.fillRect(x, y, w, h);

      // Nighttime lit windows (roughly 62% lit in realistic apartments/offices)
      if (hash > 0.36) {
        wwCtx.fillStyle = hash > 0.78 ? '#fde68a' : hash > 0.55 ? '#f59e0b' : '#fed7aa';
        wwCtx.fillRect(x + 1, y + 1, w - 2, h - 2);

        wclCtx.fillStyle = hash > 0.75 ? '#e0f2fe' : hash > 0.52 ? '#7dd3fc' : '#fef08a';
        wclCtx.fillRect(x + 1, y + 1, w - 2, h - 2);
      }
    }
  }
  const windowGlassColor = finalizeTexture(winColC, maxAnisotropy, { repeatX: 1, repeatY: 1 });
  const windowEmissiveWarm = finalizeTexture(winWarmC, maxAnisotropy, { repeatX: 1, repeatY: 1 });
  const windowEmissiveCool = finalizeTexture(winCoolC, maxAnisotropy, { repeatX: 1, repeatY: 1 });

  // 7. Sidewalk Paver Texture
  const [swC, swCtx] = makeCanvas(256, 256);
  swCtx.fillStyle = '#94a3b8';
  swCtx.fillRect(0, 0, 256, 256);
  swCtx.strokeStyle = 'rgba(51, 65, 85, 0.35)';
  swCtx.lineWidth = 2;
  for (let i = 0; i <= 256; i += 32) {
    swCtx.beginPath();
    swCtx.moveTo(i, 0);
    swCtx.lineTo(i, 256);
    swCtx.stroke();
    swCtx.beginPath();
    swCtx.moveTo(0, i);
    swCtx.lineTo(256, i);
    swCtx.stroke();
  }
  const sidewalk = finalizeTexture(swC, maxAnisotropy, { repeatX: 6, repeatY: 6 });

  // 8. Parking Lot Texture
  const [pkC, pkCtx] = makeCanvas(256, 256);
  pkCtx.fillStyle = '#272d36';
  pkCtx.fillRect(0, 0, 256, 256);
  pkCtx.fillStyle = '#cbd5e1';
  for (let x = 24; x < 240; x += 34) {
    pkCtx.fillRect(x, 14, 3, 72);
    pkCtx.fillRect(x, 170, 3, 72);
  }
  pkCtx.fillRect(16, 12, 224, 3);
  pkCtx.fillRect(16, 241, 224, 3);
  const parkingLot = finalizeTexture(pkC, maxAnisotropy, { wrap: false });

  // 9. Water Ripple Bump/Albedo Map
  const [watC, watCtx] = makeCanvas(256, 256);
  watCtx.fillStyle = '#0c4a6e';
  watCtx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 120; i++) {
    const x = ((Math.sin(i * 19.3) * 43758.5) % 1 + 1) % 1 * 256;
    const y = ((Math.sin(i * 57.1) * 19283.1) % 1 + 1) % 1 * 256;
    watCtx.fillStyle = i % 2 === 0 ? 'rgba(56, 189, 248, 0.16)' : 'rgba(12, 74, 110, 0.25)';
    watCtx.beginPath();
    watCtx.ellipse(x, y, 22, 6, 0.2, 0, Math.PI * 2);
    watCtx.fill();
  }
  const waterRipple = finalizeTexture(watC, maxAnisotropy, { repeatX: 6, repeatY: 4 });

  // 10. Soft Cloud Puff Sprite Texture
  const [cldC, cldCtx] = makeCanvas(256, 256);
  const rad = cldCtx.createRadialGradient(128, 128, 12, 128, 128, 124);
  rad.addColorStop(0, 'rgba(255, 255, 255, 0.92)');
  rad.addColorStop(0.45, 'rgba(241, 245, 249, 0.65)');
  rad.addColorStop(1, 'rgba(241, 245, 249, 0)');
  cldCtx.fillStyle = rad;
  cldCtx.fillRect(0, 0, 256, 256);
  const cloudPuff = finalizeTexture(cldC, maxAnisotropy, { wrap: false });

  // 11. Stadium Football Pitch Texture
  const [pitchC, ptCtx] = makeCanvas(256, 512);
  for (let s = 0; s < 10; s++) {
    ptCtx.fillStyle = s % 2 === 0 ? '#15803d' : '#166534';
    ptCtx.fillRect(0, s * 51.2, 256, 51.2);
  }
  ptCtx.strokeStyle = 'rgba(255,255,255,0.9)';
  ptCtx.lineWidth = 4;
  ptCtx.strokeRect(14, 16, 228, 480);
  ptCtx.beginPath();
  ptCtx.moveTo(14, 256);
  ptCtx.lineTo(242, 256);
  ptCtx.stroke();
  ptCtx.beginPath();
  ptCtx.arc(128, 256, 40, 0, Math.PI * 2);
  ptCtx.stroke();
  ptCtx.strokeRect(68, 16, 120, 64);
  ptCtx.strokeRect(68, 432, 120, 64);
  const pitchField = finalizeTexture(pitchC, maxAnisotropy, { wrap: false });

  return {
    ground,
    groundCanada,
    asphaltRoad,
    bridgeDeck,
    crosswalk,
    runway27,
    windowGlassColor,
    windowEmissiveWarm,
    windowEmissiveCool,
    sidewalk,
    parkingLot,
    waterRipple,
    cloudPuff,
    pitchField,
    dispose: () => {
      ground.dispose();
      groundCanada.dispose();
      asphaltRoad.dispose();
      bridgeDeck.dispose();
      crosswalk.dispose();
      runway27.dispose();
      windowGlassColor.dispose();
      windowEmissiveWarm.dispose();
      windowEmissiveCool.dispose();
      sidewalk.dispose();
      parkingLot.dispose();
      waterRipple.dispose();
      cloudPuff.dispose();
      pitchField.dispose();
    },
  };
}
