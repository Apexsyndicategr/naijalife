/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { CharacterAvatar } from '../../types/game';

export type AvatarAnimMode = 'idle' | 'walk' | 'sit' | 'interact';

export interface RiggedAvatarHandle {
  group: THREE.Group;
  updateAnimation: (elapsed: number, dt: number, mode: AvatarAnimMode) => void;
  dispose: () => void;
}

function makeAnkaraPatternTex(primary = '#b45309', secondary = '#047857', accent = '#fbbf24'): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext('2d');
  if (ctx) {
    ctx.fillStyle = primary;
    ctx.fillRect(0, 0, 256, 256);
    for (let y = 0; y < 256; y += 64) {
      for (let x = 0; x < 256; x += 64) {
        ctx.strokeStyle = accent;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(x + 32, y + 32, 22, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = secondary;
        ctx.beginPath();
        ctx.moveTo(x + 32, y + 12);
        ctx.lineTo(x + 52, y + 32);
        ctx.lineTo(x + 32, y + 52);
        ctx.lineTo(x + 12, y + 32);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = accent;
        ctx.beginPath();
        ctx.arc(x + 32, y + 32, 6, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(2, 2);
  return t;
}

function makeFabricWeaveTex(hex: string, stripe = false): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 128;
  const ctx = c.getContext('2d');
  if (ctx) {
    ctx.fillStyle = hex;
    ctx.fillRect(0, 0, 128, 128);
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    for (let y = 0; y < 128; y += 4) {
      for (let x = (y % 8 === 0 ? 0 : 2); x < 128; x += 4) {
        ctx.fillRect(x, y, 2, 2);
      }
    }
    if (stripe) {
      ctx.fillStyle = 'rgba(255,255,255,0.16)';
      for (let x = 6; x < 128; x += 14) {
        ctx.fillRect(x, 0, 1.5, 128);
      }
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(2, 2);
  return t;
}

export function normalizeAvatarConfig(raw?: Partial<CharacterAvatar> | null): CharacterAvatar {
  const gender: CharacterAvatar['gender'] =
    raw?.gender === 'female' ? 'female' : raw?.gender === 'unisex' ? 'unisex' : 'male';
  const defaultOutfit: CharacterAvatar['outfit'] =
    gender === 'female' ? 'female_sundress' : 'peaky_dapper';
  const defaultHair: CharacterAvatar['hairstyle'] =
    gender === 'female' ? 'braids' : 'fade';

  return {
    gender,
    skinTone: raw?.skinTone || '#8d5524',
    bodyBuild: raw?.bodyBuild || 'average',
    faceShape: raw?.faceShape || (gender === 'female' ? 'heart' : 'oval'),
    eyeStyle: raw?.eyeStyle || 'classic',
    eyebrowStyle: raw?.eyebrowStyle || (gender === 'female' ? 'arched' : 'natural'),
    noseStyle: raw?.noseStyle || 'balanced',
    mouthStyle: raw?.mouthStyle || (gender === 'female' ? 'full' : 'confident'),
    hairstyle: raw?.hairstyle || defaultHair,
    hairColor: raw?.hairColor || '#18181b',
    outfit: raw?.outfit || defaultOutfit,
    outfitColor: raw?.outfitColor,
    pants: raw?.pants || (gender === 'female' ? 'jeans' : 'slacks'),
    pantsColor: raw?.pantsColor,
    shoes: raw?.shoes || (gender === 'female' ? 'sandals' : 'sneakers'),
    shoesColor: raw?.shoesColor,
    accessory: raw?.accessory || 'none',
    height: raw?.height || 'average',
  };
}

function resolveOutfitPalette(av: CharacterAvatar): {
  topHex: string;
  secondaryHex: string;
  accentHex: string;
  bottomHex: string;
  shoeHex: string;
  isDress: boolean;
  isAgbada: boolean;
  isWaistcoat: boolean;
  isPolo: boolean;
  isJacket: boolean;
  isAnkara: boolean;
} {
  const o = av.outfit;
  switch (o) {
    case 'peaky_dapper':
      return {
        topHex: '#064e3b',
        secondaryHex: '#f8fafc',
        accentHex: '#d97706',
        bottomHex: av.pantsColor || '#1e293b',
        shoeHex: av.shoesColor || '#18181b',
        isDress: false,
        isAgbada: false,
        isWaistcoat: true,
        isPolo: false,
        isJacket: false,
        isAnkara: false,
      };
    case 'streetwear':
      return {
        topHex: '#f1f5f9',
        secondaryHex: '#e2e8f0',
        accentHex: '#10b981',
        bottomHex: av.pantsColor || '#1e3a8a',
        shoeHex: av.shoesColor || '#f8fafc',
        isDress: false,
        isAgbada: false,
        isWaistcoat: false,
        isPolo: false,
        isJacket: false,
        isAnkara: false,
      };
    case 'casual':
      return {
        topHex: '#334155',
        secondaryHex: '#f8fafc',
        accentHex: '#34d399',
        bottomHex: av.pantsColor || '#a8845c',
        shoeHex: av.shoesColor || '#18181b',
        isDress: false,
        isAgbada: false,
        isWaistcoat: false,
        isPolo: true,
        isJacket: false,
        isAnkara: false,
      };
    case 'trad_senator':
      return {
        topHex: '#1e293b',
        secondaryHex: '#0f172a',
        accentHex: '#fbbf24',
        bottomHex: av.pantsColor || '#1e293b',
        shoeHex: av.shoesColor || '#27272a',
        isDress: false,
        isAgbada: false,
        isWaistcoat: false,
        isPolo: true,
        isJacket: false,
        isAnkara: false,
      };
    case 'sporty_fit':
    case 'female_sporty':
      return {
        topHex: o === 'female_sporty' ? '#10b981' : '#047857',
        secondaryHex: '#ecfdf5',
        accentHex: '#facc15',
        bottomHex: '#18181b',
        shoeHex: '#f8fafc',
        isDress: false,
        isAgbada: false,
        isWaistcoat: false,
        isPolo: false,
        isJacket: true,
        isAnkara: false,
      };
    case 'female_sundress':
      return {
        topHex: '#059669',
        secondaryHex: '#ecfdf5',
        accentHex: '#fbbf24',
        bottomHex: '#059669',
        shoeHex: '#78350f',
        isDress: true,
        isAgbada: false,
        isWaistcoat: false,
        isPolo: false,
        isJacket: false,
        isAnkara: false,
      };
    case 'female_casual':
      return {
        topHex: '#fafaf9',
        secondaryHex: '#f43f5e',
        accentHex: '#f43f5e',
        bottomHex: '#1d4ed8',
        shoeHex: '#ffffff',
        isDress: false,
        isAgbada: false,
        isWaistcoat: false,
        isPolo: false,
        isJacket: false,
        isAnkara: false,
      };
    case 'female_corporate':
      return {
        topHex: '#e2e8f0',
        secondaryHex: '#f8fafc',
        accentHex: '#10b981',
        bottomHex: '#1e293b',
        shoeHex: '#18181b',
        isDress: true,
        isAgbada: false,
        isWaistcoat: false,
        isPolo: false,
        isJacket: true,
        isAnkara: false,
      };
    case 'female_gala':
      return {
        topHex: '#7c2d12',
        secondaryHex: '#fbbf24',
        accentHex: '#fef08a',
        bottomHex: '#7c2d12',
        shoeHex: '#d97706',
        isDress: true,
        isAgbada: false,
        isWaistcoat: false,
        isPolo: false,
        isJacket: false,
        isAnkara: false,
      };
    case 'ankara':
      return {
        topHex: '#b45309',
        secondaryHex: '#047857',
        accentHex: '#fbbf24',
        bottomHex: '#047857',
        shoeHex: '#78350f',
        isDress: av.gender === 'female',
        isAgbada: false,
        isWaistcoat: false,
        isPolo: false,
        isJacket: false,
        isAnkara: true,
      };
    case 'agbada':
      return {
        topHex: '#f8fafc',
        secondaryHex: '#1e293b',
        accentHex: '#f59e0b',
        bottomHex: '#e2e8f0',
        shoeHex: '#451a03',
        isDress: false,
        isAgbada: true,
        isWaistcoat: false,
        isPolo: false,
        isJacket: false,
        isAnkara: false,
      };
    case 'designer':
      return {
        topHex: '#09090b',
        secondaryHex: '#27272a',
        accentHex: '#34d399',
        bottomHex: '#09090b',
        shoeHex: '#18181b',
        isDress: false,
        isAgbada: false,
        isWaistcoat: false,
        isPolo: false,
        isJacket: true,
        isAnkara: false,
      };
    case 'streetwear_luxe':
      return {
        topHex: '#065f46',
        secondaryHex: '#18181b',
        accentHex: '#fbbf24',
        bottomHex: '#1e3a8a',
        shoeHex: '#f8fafc',
        isDress: false,
        isAgbada: false,
        isWaistcoat: false,
        isPolo: false,
        isJacket: true,
        isAnkara: false,
      };
    case 'beach_shorts':
      return {
        topHex: '#bae6fd',
        secondaryHex: '#ffffff',
        accentHex: '#f97316',
        bottomHex: '#d6d3d1',
        shoeHex: '#78350f',
        isDress: false,
        isAgbada: false,
        isWaistcoat: false,
        isPolo: true,
        isJacket: false,
        isAnkara: false,
      };
    case 'corporate':
    default:
      return {
        topHex: '#172554',
        secondaryHex: '#f8fafc',
        accentHex: '#b91c1c',
        bottomHex: av.pantsColor || '#0f172a',
        shoeHex: av.shoesColor || '#18181b',
        isDress: false,
        isAgbada: false,
        isWaistcoat: true,
        isPolo: false,
        isJacket: true,
        isAnkara: false,
      };
  }
}

export function createRiggedAvatar3D(rawAvatar?: Partial<CharacterAvatar> | null): RiggedAvatarHandle {
  const av = normalizeAvatarConfig(rawAvatar);
  const isFemale = av.gender === 'female';
  const palette = resolveOutfitPalette(av);

  const geos: THREE.BufferGeometry[] = [];
  const mats: THREE.Material[] = [];
  const texs: THREE.Texture[] = [];

  const trackGeo = <T extends THREE.BufferGeometry>(g: T): T => {
    geos.push(g);
    return g;
  };
  const trackMat = <T extends THREE.Material>(m: T): T => {
    mats.push(m);
    return m;
  };
  const trackTex = <T extends THREE.Texture>(t: T): T => {
    texs.push(t);
    return t;
  };

  const root = new THREE.Group();

  // Body build & height scaling
  const heightScale =
    av.height === 'short' ? 0.93 : av.height === 'tall' ? 1.07 : av.height === 'towering' ? 1.13 : 1.0;
  const widthScale =
    av.bodyBuild === 'slim'
      ? 0.9
      : av.bodyBuild === 'athletic'
      ? 1.06
      : av.bodyBuild === 'broad'
      ? 1.16
      : 1.0;

  root.scale.set(widthScale * (isFemale ? 0.94 : 1.0), heightScale, widthScale * (isFemale ? 0.94 : 1.0));

  // Core shared PBR materials
  const skinMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: new THREE.Color(av.skinTone),
      roughness: 0.56,
      metalness: 0.04,
    })
  );
  const hairMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: new THREE.Color(av.hairColor || '#18181b'),
      roughness: 0.78,
      metalness: 0.05,
    })
  );

  const topTex = palette.isAnkara
    ? trackTex(makeAnkaraPatternTex(palette.topHex, palette.secondaryHex, palette.accentHex))
    : trackTex(makeFabricWeaveTex(palette.topHex, palette.isWaistcoat));
  const topMat = trackMat(
    new THREE.MeshStandardMaterial({
      map: topTex,
      roughness: 0.72,
      metalness: 0.06,
    })
  );
  const secondaryMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: new THREE.Color(palette.secondaryHex),
      roughness: 0.65,
      metalness: 0.05,
    })
  );
  const accentMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: new THREE.Color(palette.accentHex),
      roughness: 0.32,
      metalness: 0.55,
    })
  );
  const bottomTex = palette.isAnkara
    ? topTex
    : trackTex(makeFabricWeaveTex(palette.bottomHex, av.pants === 'pinstripe'));
  const bottomMat = trackMat(
    new THREE.MeshStandardMaterial({
      map: bottomTex,
      roughness: 0.76,
      metalness: 0.04,
    })
  );
  const shoeMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: new THREE.Color(palette.shoeHex),
      roughness: 0.42,
      metalness: 0.12,
    })
  );
  const darkMat = trackMat(new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.5 }));
  const scleraMat = trackMat(new THREE.MeshStandardMaterial({ color: 0xfefefe, roughness: 0.2 }));
  const goldMat = trackMat(new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.22, metalness: 0.85 }));

  // Pivots for smooth procedural walk/idle/sit animations
  const bodyPivot = new THREE.Group();
  root.add(bodyPivot);

  const pelvisY = 0.86;

  // 1. LEGS (articulated hip -> thigh -> knee -> shin -> shoe)
  const legSpread = isFemale ? 0.115 : 0.13;
  const thighRadiusTop = isFemale ? 0.095 : 0.09;
  const thighRadiusBot = isFemale ? 0.072 : 0.075;
  const shinRadiusTop = 0.068;
  const shinRadiusBot = 0.05;

  const thighGeo = trackGeo(new THREE.CylinderGeometry(thighRadiusTop, thighRadiusBot, 0.42, 14));
  const shinGeo = trackGeo(new THREE.CylinderGeometry(shinRadiusTop, shinRadiusBot, 0.4, 14));
  const shoeGeo = trackGeo(new THREE.BoxGeometry(0.11, 0.075, 0.22));
  const soleGeo = trackGeo(new THREE.BoxGeometry(0.116, 0.02, 0.228));

  const makeLeg = (side: -1 | 1) => {
    const hipPivot = new THREE.Group();
    hipPivot.position.set(side * legSpread, pelvisY, 0);

    const isShorts = av.pants === 'shorts' || av.outfit === 'beach_shorts';
    const isSkirted = palette.isDress;
    const thighM = isSkirted ? skinMat : bottomMat;
    const shinM = isShorts || isSkirted ? skinMat : bottomMat;

    const thigh = new THREE.Mesh(thighGeo, thighM);
    thigh.position.y = -0.21;
    thigh.castShadow = true;
    hipPivot.add(thigh);

    const kneePivot = new THREE.Group();
    kneePivot.position.y = -0.42;
    hipPivot.add(kneePivot);

    const shin = new THREE.Mesh(shinGeo, shinM);
    shin.position.y = -0.2;
    shin.castShadow = true;
    kneePivot.add(shin);

    const shoe = new THREE.Mesh(shoeGeo, shoeMat);
    shoe.position.set(0, -0.415, 0.04);
    shoe.castShadow = true;
    kneePivot.add(shoe);

    if (av.shoes === 'heels' && isFemale) {
      const heelSpike = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.015, 0.01, 0.065, 8)), shoeMat);
      heelSpike.position.set(0, -0.435, -0.05);
      kneePivot.add(heelSpike);
    } else {
      const sole = new THREE.Mesh(soleGeo, av.shoes === 'sneakers' ? scleraMat : darkMat);
      sole.position.set(0, -0.445, 0.04);
      kneePivot.add(sole);
    }

    bodyPivot.add(hipPivot);
    return { hipPivot, kneePivot };
  };

  const leftLeg = makeLeg(-1);
  const rightLeg = makeLeg(1);

  // 2. PELVIS / SKIRT / DRESS HEM
  const pelvisGeo = trackGeo(new THREE.CylinderGeometry(isFemale ? 0.165 : 0.155, isFemale ? 0.19 : 0.16, 0.18, 16));
  const pelvisMesh = new THREE.Mesh(pelvisGeo, bottomMat);
  pelvisMesh.position.y = pelvisY + 0.04;
  pelvisMesh.scale.set(1.12, 1, 0.78);
  pelvisMesh.castShadow = true;
  bodyPivot.add(pelvisMesh);

  if (palette.isDress) {
    const skirtH = av.outfit === 'female_gala' ? 0.62 : av.outfit === 'female_corporate' ? 0.42 : 0.48;
    const skirtFlare = av.outfit === 'female_corporate' ? 0.21 : 0.31;
    const skirtGeo = trackGeo(new THREE.CylinderGeometry(0.175, skirtFlare, skirtH, 18));
    const skirt = new THREE.Mesh(skirtGeo, av.outfit === 'female_corporate' ? bottomMat : topMat);
    skirt.position.y = pelvisY + 0.08 - skirtH / 2;
    skirt.scale.set(1.08, 1, 0.85);
    skirt.castShadow = true;
    bodyPivot.add(skirt);
  }

  // 3. TORSO (Tailored male vs female geometry)
  const chestW = isFemale ? 0.175 : 0.22;
  const waistW = isFemale ? 0.14 : 0.165;
  const torsoGeo = trackGeo(new THREE.CylinderGeometry(chestW, waistW, 0.48, 18));
  const torsoMesh = new THREE.Mesh(torsoGeo, topMat);
  torsoMesh.position.y = pelvisY + 0.34;
  torsoMesh.scale.set(1.08, 1, 0.74);
  torsoMesh.castShadow = true;
  bodyPivot.add(torsoMesh);

  // Female anatomical upper chest contour (modest natural silhouette)
  if (isFemale) {
    const bustGeo = trackGeo(new THREE.SphereGeometry(0.105, 14, 12));
    const bustL = new THREE.Mesh(bustGeo, topMat);
    bustL.position.set(-0.075, pelvisY + 0.41, 0.085);
    bustL.scale.set(1, 0.85, 0.8);
    bodyPivot.add(bustL);
    const bustR = new THREE.Mesh(bustGeo, topMat);
    bustR.position.set(0.075, pelvisY + 0.41, 0.085);
    bustR.scale.set(1, 0.85, 0.8);
    bodyPivot.add(bustR);
  }

  // Outfit architectural details
  if (palette.isAgbada) {
    // Wide draped ceremonial outer robe & golden chest panel
    const robeGeo = trackGeo(new THREE.CylinderGeometry(0.32, 0.35, 0.78, 16));
    const robe = new THREE.Mesh(robeGeo, topMat);
    robe.position.y = pelvisY + 0.22;
    robe.scale.set(1.05, 1, 0.7);
    robe.castShadow = true;
    bodyPivot.add(robe);

    const embGeo = trackGeo(new THREE.BoxGeometry(0.15, 0.36, 0.04));
    const emb = new THREE.Mesh(embGeo, goldMat);
    emb.position.set(0, pelvisY + 0.38, 0.23);
    bodyPivot.add(emb);
  } else if (palette.isWaistcoat) {
    // White shirt chest V & silk tie
    const shirtFront = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.13, 0.22, 0.03)), secondaryMat);
    shirtFront.position.set(0, pelvisY + 0.47, 0.145);
    bodyPivot.add(shirtFront);

    const tie = new THREE.Mesh(trackGeo(new THREE.ConeGeometry(0.028, 0.24, 4)), accentMat);
    tie.rotation.z = Math.PI;
    tie.position.set(0, pelvisY + 0.42, 0.165);
    bodyPivot.add(tie);
  } else if (palette.isPolo) {
    const collar = new THREE.Mesh(trackGeo(new THREE.TorusGeometry(0.095, 0.02, 8, 16)), secondaryMat);
    collar.rotation.x = Math.PI / 2;
    collar.position.set(0, pelvisY + 0.58, 0.01);
    bodyPivot.add(collar);
  } else if (palette.isJacket) {
    const lapelL = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.08, 0.44, 0.04)), secondaryMat);
    lapelL.position.set(-0.08, pelvisY + 0.35, 0.14);
    bodyPivot.add(lapelL);
    const lapelR = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.08, 0.44, 0.04)), secondaryMat);
    lapelR.position.set(0.08, pelvisY + 0.35, 0.14);
    bodyPivot.add(lapelR);
  }

  // 4. ARMS (articulated shoulder -> upper arm -> forearm -> hand)
  const shoulderOffset = isFemale ? 0.215 : 0.265;
  const shoulderY = pelvisY + 0.53;
  const upperArmGeo = trackGeo(new THREE.CylinderGeometry(0.052, 0.044, 0.28, 12));
  const forearmGeo = trackGeo(new THREE.CylinderGeometry(0.042, 0.034, 0.26, 12));
  const handGeo = trackGeo(new THREE.SphereGeometry(0.042, 10, 10));

  const sleeveMat =
    palette.isWaistcoat || palette.isJacket || palette.isAgbada || av.outfit === 'trad_senator'
      ? palette.isWaistcoat && av.outfit === 'peaky_dapper'
        ? secondaryMat
        : topMat
      : skinMat;

  const makeArm = (side: -1 | 1) => {
    const shoulderPivot = new THREE.Group();
    shoulderPivot.position.set(side * shoulderOffset, shoulderY, 0);

    const shoulderCap = new THREE.Mesh(trackGeo(new THREE.SphereGeometry(0.06, 10, 10)), topMat);
    shoulderPivot.add(shoulderCap);

    const upperArm = new THREE.Mesh(
      upperArmGeo,
      av.outfit === 'female_sundress' || av.outfit === 'streetwear' || av.outfit === 'casual' ? topMat : sleeveMat
    );
    upperArm.position.y = -0.13;
    upperArm.castShadow = true;
    shoulderPivot.add(upperArm);

    const elbowPivot = new THREE.Group();
    elbowPivot.position.y = -0.27;
    shoulderPivot.add(elbowPivot);

    const forearm = new THREE.Mesh(
      forearmGeo,
      palette.isJacket || palette.isAgbada || av.outfit === 'trad_senator' ? sleeveMat : skinMat
    );
    forearm.position.y = -0.12;
    forearm.castShadow = true;
    elbowPivot.add(forearm);

    const hand = new THREE.Mesh(handGeo, skinMat);
    hand.position.y = -0.26;
    elbowPivot.add(hand);

    if (side === -1 && av.accessory === 'rolex_watch') {
      const watch = new THREE.Mesh(trackGeo(new THREE.TorusGeometry(0.04, 0.01, 8, 14)), goldMat);
      watch.rotation.x = Math.PI / 2;
      watch.position.y = -0.21;
      elbowPivot.add(watch);
    }

    bodyPivot.add(shoulderPivot);
    return { shoulderPivot, elbowPivot };
  };

  const leftArm = makeArm(-1);
  const rightArm = makeArm(1);

  // 5. NECK & HEAD + CUSTOMIZED FACE
  const neckGeo = trackGeo(new THREE.CylinderGeometry(0.062, 0.072, 0.14, 12));
  const neckMesh = new THREE.Mesh(neckGeo, skinMat);
  neckMesh.position.y = pelvisY + 0.63;
  bodyPivot.add(neckMesh);

  // Neck jewelry
  if (av.accessory === 'gold_chain' || av.accessory === 'diamond_chain' || av.accessory === 'coral_beads') {
    const chainMat =
      av.accessory === 'coral_beads'
        ? trackMat(new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.35 }))
        : av.accessory === 'diamond_chain'
        ? trackMat(new THREE.MeshStandardMaterial({ color: 0xe0f2fe, roughness: 0.12, metalness: 0.9 }))
        : goldMat;
    const chain = new THREE.Mesh(trackGeo(new THREE.TorusGeometry(0.115, 0.015, 8, 22)), chainMat);
    chain.rotation.x = Math.PI / 2 + 0.35;
    chain.position.set(0, pelvisY + 0.57, 0.05);
    bodyPivot.add(chain);
  }

  const headPivot = new THREE.Group();
  headPivot.position.set(0, pelvisY + 0.81, 0);
  bodyPivot.add(headPivot);

  // Face shape scaling
  const headScaleX =
    av.faceShape === 'square' ? 1.04 : av.faceShape === 'round' ? 1.07 : av.faceShape === 'heart' ? 0.95 : 0.98;
  const headScaleY = av.faceShape === 'round' ? 0.96 : 1.08;
  const headGeo = trackGeo(new THREE.SphereGeometry(0.165, 24, 20));
  const headMesh = new THREE.Mesh(headGeo, skinMat);
  headMesh.scale.set(headScaleX, headScaleY, 0.96);
  headMesh.castShadow = true;
  headPivot.add(headMesh);

  if (av.faceShape === 'square') {
    const jaw = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.21, 0.09, 0.18)), skinMat);
    jaw.position.set(0, -0.09, 0.02);
    headPivot.add(jaw);
  }

  // Ears
  const earGeo = trackGeo(new THREE.SphereGeometry(0.036, 10, 10));
  const earL = new THREE.Mesh(earGeo, skinMat);
  earL.scale.set(0.45, 0.9, 0.7);
  earL.position.set(-0.165 * headScaleX, -0.01, -0.01);
  headPivot.add(earL);
  const earR = new THREE.Mesh(earGeo, skinMat);
  earR.scale.set(0.45, 0.9, 0.7);
  earR.position.set(0.165 * headScaleX, -0.01, -0.01);
  headPivot.add(earR);

  // Eyes (sclera + dark iris + subtle lash if female)
  const eyeScaleX = av.eyeStyle === 'almond' ? 1.18 : av.eyeStyle === 'sharp' ? 1.15 : 1.0;
  const eyeScaleY = av.eyeStyle === 'bright' ? 1.15 : av.eyeStyle === 'sharp' ? 0.78 : 0.92;
  const eyeZ = 0.142;
  const eyeY = 0.022;
  for (const side of [-1, 1]) {
    const sclera = new THREE.Mesh(trackGeo(new THREE.SphereGeometry(0.024, 10, 10)), scleraMat);
    sclera.scale.set(eyeScaleX, eyeScaleY, 0.55);
    sclera.position.set(side * 0.056, eyeY, eyeZ);
    headPivot.add(sclera);

    const iris = new THREE.Mesh(trackGeo(new THREE.SphereGeometry(0.014, 10, 10)), darkMat);
    iris.scale.set(0.95, 0.95, 0.55);
    iris.position.set(side * 0.056, eyeY, eyeZ + 0.011);
    headPivot.add(iris);

    // Eyebrow
    const browThickness = av.eyebrowStyle === 'thick' ? 0.014 : av.eyebrowStyle === 'sleek' ? 0.007 : 0.01;
    const brow = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.046, browThickness, 0.015)), hairMat);
    brow.position.set(side * 0.058, eyeY + 0.036, eyeZ + 0.008);
    brow.rotation.z =
      av.eyebrowStyle === 'arched' ? -side * 0.18 : av.eyebrowStyle === 'sleek' ? side * 0.08 : -side * 0.05;
    headPivot.add(brow);
  }

  // Nose
  const noseW = av.noseStyle === 'broad' ? 0.034 : av.noseStyle === 'sculpted' ? 0.02 : 0.026;
  const noseMesh = new THREE.Mesh(trackGeo(new THREE.ConeGeometry(noseW, 0.052, 8)), skinMat);
  noseMesh.rotation.x = Math.PI * 0.36;
  noseMesh.position.set(0, -0.018, 0.162);
  headPivot.add(noseMesh);

  // Mouth / Lips
  const lipColor = isFemale
    ? new THREE.Color(av.skinTone).lerp(new THREE.Color('#9f1239'), 0.45)
    : new THREE.Color(av.skinTone).lerp(new THREE.Color('#451a03'), 0.32);
  const lipMat = trackMat(new THREE.MeshStandardMaterial({ color: lipColor, roughness: 0.45 }));
  const mouthW = av.mouthStyle === 'full' ? 0.062 : 0.052;
  const mouthH = av.mouthStyle === 'full' ? 0.018 : 0.012;
  const mouth = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(mouthW, mouthH, 0.02)), lipMat);
  mouth.position.set(0, -0.078, 0.145);
  if (av.mouthStyle === 'smile' || av.mouthStyle === 'confident') {
    mouth.rotation.z = av.mouthStyle === 'confident' ? 0.08 : 0;
  }
  headPivot.add(mouth);

  // Eyewear / Sunglasses accessory
  if (av.accessory === 'sunglasses' || av.accessory === 'designer_shades') {
    const frameMat = av.accessory === 'designer_shades' ? goldMat : darkMat;
    const lensMat = trackMat(new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.1, metalness: 0.85 }));
    for (const side of [-1, 1]) {
      const lens = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.058, 0.036, 0.012)), lensMat);
      lens.position.set(side * 0.058, eyeY, 0.168);
      headPivot.add(lens);
    }
    const bridge = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.14, 0.008, 0.012)), frameMat);
    bridge.position.set(0, eyeY + 0.012, 0.168);
    headPivot.add(bridge);
  }

  // 6. SCULPTED 3D HAIRSTYLES
  const hs = av.hairstyle;
  if (hs === 'buzz') {
    const cap = new THREE.Mesh(
      trackGeo(new THREE.SphereGeometry(0.168, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.56)),
      hairMat
    );
    cap.position.y = 0.015;
    cap.scale.set(headScaleX, 1.0, 0.98);
    headPivot.add(cap);
  } else if (hs === 'waves' || hs === 'fade') {
    const topCap = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.142, 0.155, hs === 'waves' ? 0.055 : 0.085, 18)),
      hairMat
    );
    topCap.position.set(0, 0.125, -0.01);
    headPivot.add(topCap);
    const backFade = new THREE.Mesh(
      trackGeo(new THREE.SphereGeometry(0.166, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.52)),
      hairMat
    );
    backFade.position.y = 0.025;
    headPivot.add(backFade);
  } else if (hs === 'high_top') {
    const flatTop = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.14, 0.145, 0.145, 18)), hairMat);
    flatTop.position.set(0, 0.165, -0.005);
    flatTop.castShadow = true;
    headPivot.add(flatTop);
  } else if (hs === 'afro') {
    const crown = new THREE.Mesh(trackGeo(new THREE.SphereGeometry(0.245, 22, 18)), hairMat);
    crown.position.set(0, 0.085, -0.025);
    crown.scale.set(1.06, 0.96, 1.04);
    crown.castShadow = true;
    headPivot.add(crown);
  } else if (hs === 'afro_puff') {
    const baseCap = new THREE.Mesh(
      trackGeo(new THREE.SphereGeometry(0.168, 18, 14, 0, Math.PI * 2, 0, Math.PI * 0.58)),
      hairMat
    );
    baseCap.position.y = 0.015;
    headPivot.add(baseCap);
    const puff = new THREE.Mesh(trackGeo(new THREE.SphereGeometry(0.155, 18, 16)), hairMat);
    puff.position.set(0, 0.21, -0.055);
    puff.castShadow = true;
    headPivot.add(puff);
    const band = new THREE.Mesh(trackGeo(new THREE.TorusGeometry(0.085, 0.016, 8, 16)), accentMat);
    band.rotation.x = Math.PI / 2 - 0.3;
    band.position.set(0, 0.155, -0.045);
    headPivot.add(band);
  } else if (hs === 'ponytail') {
    const sleekCap = new THREE.Mesh(
      trackGeo(new THREE.SphereGeometry(0.169, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.62)),
      hairMat
    );
    sleekCap.position.y = 0.015;
    headPivot.add(sleekCap);
    const tail = new THREE.Mesh(trackGeo(new THREE.ConeGeometry(0.075, 0.38, 12)), hairMat);
    tail.rotation.x = -Math.PI * 0.85;
    tail.position.set(0, 0.02, -0.22);
    tail.castShadow = true;
    headPivot.add(tail);
  } else if (hs === 'bob_cut') {
    const topCap = new THREE.Mesh(
      trackGeo(new THREE.SphereGeometry(0.185, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.68)),
      hairMat
    );
    topCap.position.set(0, 0.025, -0.015);
    headPivot.add(topCap);
    for (const side of [-1, 1]) {
      const panel = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.055, 0.068, 0.24, 10)), hairMat);
      panel.position.set(side * 0.155, -0.06, -0.01);
      headPivot.add(panel);
    }
    const backCurtain = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.175, 0.195, 0.24, 14, 1, false, Math.PI * 0.5, Math.PI)), hairMat);
    backCurtain.position.set(0, -0.05, -0.02);
    headPivot.add(backCurtain);
  } else if (hs === 'braids' || hs === 'fulani_braids' || hs === 'locs' || hs === 'dreads' || hs === 'long_wavy') {
    const baseCap = new THREE.Mesh(
      trackGeo(new THREE.SphereGeometry(0.169, 18, 14, 0, Math.PI * 2, 0, Math.PI * 0.6)),
      hairMat
    );
    baseCap.position.y = 0.02;
    headPivot.add(baseCap);

    const isThick = hs === 'dreads' || hs === 'long_wavy';
    const strandRadius = isThick ? 0.026 : hs === 'locs' ? 0.015 : 0.02;
    const strandLen = hs === 'long_wavy' || hs === 'braids' || hs === 'fulani_braids' ? 0.36 : 0.28;
    const strandGeo = trackGeo(new THREE.CylinderGeometry(strandRadius, strandRadius * 0.85, strandLen, 7));

    const angles = [-2.5, -2.1, -1.7, -1.35, -1.0, 1.0, 1.35, 1.7, 2.1, 2.5, Math.PI];
    for (let i = 0; i < angles.length; i++) {
      const ang = angles[i];
      const strand = new THREE.Mesh(strandGeo, hairMat);
      strand.position.set(Math.sin(ang) * 0.16, -0.07, Math.cos(ang) * 0.16 - 0.02);
      strand.rotation.z = -Math.sin(ang) * 0.14;
      strand.rotation.x = Math.cos(ang) * 0.12;
      strand.castShadow = true;
      headPivot.add(strand);

      if (hs === 'fulani_braids' && i % 2 === 0) {
        const bead = new THREE.Mesh(trackGeo(new THREE.SphereGeometry(0.023, 8, 8)), goldMat);
        bead.position.set(Math.sin(ang) * 0.175, -0.22, Math.cos(ang) * 0.175 - 0.02);
        headPivot.add(bead);
      }
    }
  } else if (hs === 'cornrows') {
    const baseCap = new THREE.Mesh(
      trackGeo(new THREE.SphereGeometry(0.166, 18, 14, 0, Math.PI * 2, 0, Math.PI * 0.56)),
      skinMat
    );
    baseCap.position.y = 0.015;
    headPivot.add(baseCap);
    for (let i = -3; i <= 3; i++) {
      const ridge = new THREE.Mesh(trackGeo(new THREE.TorusGeometry(0.162, 0.015, 6, 16, Math.PI * 0.95)), hairMat);
      ridge.rotation.y = Math.PI / 2;
      ridge.position.set(i * 0.036, 0.02, -0.01);
      headPivot.add(ridge);
    }
  } else if (hs === 'gele') {
    const wrap1 = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.22, 0.18, 0.14, 18)), accentMat);
    wrap1.position.set(0, 0.11, -0.01);
    wrap1.rotation.z = 0.12;
    headPivot.add(wrap1);
    const fan = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.28, 0.19, 0.07, 18)), secondaryMat);
    fan.position.set(0.03, 0.18, -0.02);
    fan.rotation.z = -0.18;
    headPivot.add(fan);
  }

  // Headgear accessories (Peaky Cap / Fila Cap)
  if (hs === 'peaky_cap' || av.accessory === 'peaky_cap') {
    const capMat = trackMat(new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.85 }));
    const crown = new THREE.Mesh(trackGeo(new THREE.SphereGeometry(0.178, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.45)), capMat);
    crown.position.set(0, 0.08, -0.01);
    crown.scale.set(1.04, 0.55, 1.15);
    headPivot.add(crown);
    const brim = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.16, 0.16, 0.018, 16, 1, false, -0.9, 1.8)), capMat);
    brim.position.set(0, 0.085, 0.12);
    brim.rotation.x = 0.12;
    headPivot.add(brim);
  } else if (av.accessory === 'fila_cap') {
    const fila = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.165, 0.17, 0.12, 18)), accentMat);
    fila.position.set(0, 0.13, -0.01);
    fila.rotation.z = 0.22;
    headPivot.add(fila);
  }

  // Animation controller
  const updateAnimation = (elapsed: number, _dt: number, mode: AvatarAnimMode) => {
    if (mode === 'walk') {
      const speed = 7.2;
      const swing = Math.sin(elapsed * speed) * 0.56;
      leftLeg.hipPivot.rotation.x = swing;
      rightLeg.hipPivot.rotation.x = -swing;
      leftLeg.kneePivot.rotation.x = Math.max(0, -swing * 0.55);
      rightLeg.kneePivot.rotation.x = Math.max(0, swing * 0.55);

      leftArm.shoulderPivot.rotation.x = -swing * 0.72;
      rightArm.shoulderPivot.rotation.x = swing * 0.72;
      leftArm.elbowPivot.rotation.x = -0.25;
      rightArm.elbowPivot.rotation.x = -0.25;

      bodyPivot.position.y = Math.abs(Math.sin(elapsed * speed)) * 0.035;
      headPivot.rotation.y = Math.sin(elapsed * 2.2) * 0.04;
    } else if (mode === 'sit') {
      leftLeg.hipPivot.rotation.x = -Math.PI * 0.48;
      rightLeg.hipPivot.rotation.x = -Math.PI * 0.48;
      leftLeg.kneePivot.rotation.x = Math.PI * 0.48;
      rightLeg.kneePivot.rotation.x = Math.PI * 0.48;
      leftArm.shoulderPivot.rotation.x = -0.35;
      rightArm.shoulderPivot.rotation.x = -0.35;
      bodyPivot.position.y = -0.32;
    } else if (mode === 'interact') {
      leftLeg.hipPivot.rotation.x = 0;
      rightLeg.hipPivot.rotation.x = 0;
      leftLeg.kneePivot.rotation.x = 0;
      rightLeg.kneePivot.rotation.x = 0;
      rightArm.shoulderPivot.rotation.x = -1.15 + Math.sin(elapsed * 6) * 0.2;
      rightArm.elbowPivot.rotation.x = -0.4;
      leftArm.shoulderPivot.rotation.x = 0.05;
      bodyPivot.position.y = Math.sin(elapsed * 3) * 0.015;
    } else {
      // Idle breathing & relaxed natural stance
      leftLeg.hipPivot.rotation.x = 0;
      rightLeg.hipPivot.rotation.x = 0;
      leftLeg.kneePivot.rotation.x = 0;
      rightLeg.kneePivot.rotation.x = 0;
      leftArm.shoulderPivot.rotation.x = Math.sin(elapsed * 1.4) * 0.04;
      rightArm.shoulderPivot.rotation.x = -Math.sin(elapsed * 1.4) * 0.04;
      leftArm.elbowPivot.rotation.x = -0.08;
      rightArm.elbowPivot.rotation.x = -0.08;
      bodyPivot.position.y = Math.sin(elapsed * 2.1) * 0.012;
      headPivot.rotation.y = Math.sin(elapsed * 0.9) * 0.06;
    }
  };

  const dispose = () => {
    geos.forEach((g) => g.dispose());
    mats.forEach((m) => m.dispose());
    texs.forEach((t) => t.dispose());
  };

  return { group: root, updateAnimation, dispose };
}
