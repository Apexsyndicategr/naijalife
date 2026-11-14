/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { CharacterAvatar } from '../types/game';

interface ThreeCharacterAvatarProps {
  avatar: CharacterAvatar;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  interactive?: boolean;
  className?: string;
}

function createTweedTexture(baseHex: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = baseHex;
    ctx.fillRect(0, 0, 256, 256);
    for (let y = 0; y < 256; y += 4) {
      for (let x = 0; x < 256; x += 4) {
        const diag = ((x + y) / 4) % 2 === 0;
        ctx.fillStyle = diag ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.14)';
        ctx.fillRect(x, y, 2, 4);
      }
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (let i = -256; i < 512; i += 8) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + 256, 256);
      ctx.stroke();
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 3);
  return tex;
}

function createPinstripeTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#172030';
    ctx.fillRect(0, 0, 128, 128);
    ctx.fillStyle = 'rgba(203, 213, 225, 0.22)';
    for (let x = 8; x < 128; x += 16) {
      ctx.fillRect(x, 0, 1.5, 128);
    }
    for (let y = 0; y < 128; y += 2) {
      ctx.fillStyle = y % 4 === 0 ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.04)';
      ctx.fillRect(0, y, 128, 1);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 2);
  return tex;
}

function createDenimTexture(baseHex = '#1e3a8a'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = baseHex;
    ctx.fillRect(0, 0, 128, 128);
    for (let y = 0; y < 128; y += 3) {
      for (let x = 0; x < 128; x += 3) {
        ctx.fillStyle = ((x + y) % 6 === 0) ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.12)';
        ctx.fillRect(x, y, 2, 2);
      }
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 4);
  return tex;
}

function createAnkaraTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#c2410c';
    ctx.fillRect(0, 0, 256, 256);

    const motifs = [
      { cx: 64, cy: 64, color: '#facc15', ring: '#0284c7' },
      { cx: 192, cy: 64, color: '#10b981', ring: '#fef08a' },
      { cx: 64, cy: 192, color: '#0ea5e9', ring: '#fde047' },
      { cx: 192, cy: 192, color: '#facc15', ring: '#065f46' },
      { cx: 128, cy: 128, color: '#fef08a', ring: '#1d4ed8' },
    ];
    for (const m of motifs) {
      ctx.strokeStyle = m.ring;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(m.cx, m.cy, 36, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = m.color;
      for (let a = 0; a < 8; a++) {
        const ang = (a / 8) * Math.PI * 2;
        ctx.beginPath();
        ctx.ellipse(
          m.cx + Math.cos(ang) * 18,
          m.cy + Math.sin(ang) * 18,
          10,
          4,
          ang,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }

      ctx.fillStyle = '#18181b';
      ctx.beginPath();
      ctx.arc(m.cx, m.cy, 6, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  return tex;
}

function createIrisTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(64, 64, 14, 64, 64, 60);
    grad.addColorStop(0, '#09090b');
    grad.addColorStop(0.28, '#09090b');
    grad.addColorStop(0.32, '#451a03');
    grad.addColorStop(0.65, '#78350f');
    grad.addColorStop(0.88, '#291003');
    grad.addColorStop(1, '#110702');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);

    ctx.strokeStyle = 'rgba(217, 119, 6, 0.25)';
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 36; i++) {
      const a = (i / 36) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(64 + Math.cos(a) * 20, 64 + Math.sin(a) * 20);
      ctx.lineTo(64 + Math.cos(a) * 52, 64 + Math.sin(a) * 52);
      ctx.stroke();
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export const ThreeCharacterAvatar: React.FC<ThreeCharacterAvatarProps> = ({
  avatar,
  size = 'md',
  interactive = true,
  className = '',
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  const safeAvatar: CharacterAvatar = avatar || {
    gender: 'male',
    skinTone: '#8d5524',
    hairstyle: 'peaky_cap',
    hairColor: '#18181b',
    outfit: 'corporate',
    pants: 'slacks',
    shoes: 'oxford',
    accessory: 'none',
  };

  const isFemale = safeAvatar.gender === 'female';
  const skinColor = safeAvatar.skinTone || '#8d5524';
  const hairColor = safeAvatar.hairColor || '#18181b';
  const outfitType = safeAvatar.outfit || 'corporate';
  const hairstyle = safeAvatar.hairstyle || 'peaky_cap';
  const heightPreset = safeAvatar.height || 'average';
  const accessoryType = safeAvatar.accessory || 'none';
  const pantsType = safeAvatar.pants || 'slacks';
  const pantsColorHex = safeAvatar.pantsColor || '';
  const shoesType = safeAvatar.shoes || 'loafers';
  const shoesColorHex = safeAvatar.shoesColor || '';

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return false;
      }
    })();

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 460;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(32, width / height, 0.1, 40);
    camera.position.set(0.32, 1.38, 3.65);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Environment Map (Studio PBR Reflections)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envTarget = pmremGenerator.fromScene(roomEnv, 0.04);
    scene.environment = envTarget.texture;
    roomEnv.dispose();
    pmremGenerator.dispose();

    // Smooth Damped OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.target.set(0, 1.06, 0);
    controls.enablePan = false;
    controls.minDistance = 2.1;
    controls.maxDistance = 5.2;
    controls.minPolarAngle = Math.PI * 0.22;
    controls.maxPolarAngle = Math.PI * 0.62;
    controls.enabled = interactive;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.9;
    const stopAutoRotate = () => {
      controls.autoRotate = false;
    };
    controls.addEventListener('start', stopAutoRotate);

    // 3-Point Studio Lighting + Dual Edge Rims
    const hemiLight = new THREE.HemisphereLight(0xf8fafc, 0x18181b, 0.55);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff5e6, 1.85);
    keyLight.position.set(2.8, 4.2, 3.4);
    keyLight.castShadow = !isSoftwareGl;
    if (!isSoftwareGl) {
      keyLight.shadow.mapSize.set(1024, 1024);
      keyLight.shadow.camera.near = 0.5;
      keyLight.shadow.camera.far = 14;
      keyLight.shadow.camera.left = -1.6;
      keyLight.shadow.camera.right = 1.6;
      keyLight.shadow.camera.top = 2.6;
      keyLight.shadow.camera.bottom = -0.4;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.025;
    }
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xdbeafe, 0.65);
    fillLight.position.set(-2.8, 2.2, 2.6);
    scene.add(fillLight);

    const rimEmerald = new THREE.DirectionalLight(0x34d399, 1.1);
    rimEmerald.position.set(-2.4, 3.1, -2.8);
    scene.add(rimEmerald);

    const rimAmber = new THREE.DirectionalLight(0xf59e0b, 0.75);
    rimAmber.position.set(2.4, 2.6, -2.6);
    scene.add(rimAmber);

    // Studio Plinth & Contact Shadow
    const plinthGroup = new THREE.Group();
    const plinthGeo = new THREE.CylinderGeometry(0.68, 0.74, 0.06, 48);
    const plinthMat = new THREE.MeshStandardMaterial({
      color: 0x09090b,
      roughness: 0.35,
      metalness: 0.6,
    });
    const plinthMesh = new THREE.Mesh(plinthGeo, plinthMat);
    plinthMesh.position.y = -0.03;
    plinthMesh.receiveShadow = !isSoftwareGl;
    plinthGroup.add(plinthMesh);

    const plinthRingGeo = new THREE.TorusGeometry(0.685, 0.009, 12, 64);
    const plinthRingMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x059669,
      emissiveIntensity: 0.55,
      roughness: 0.25,
      metalness: 0.85,
    });
    const plinthRing = new THREE.Mesh(plinthRingGeo, plinthRingMat);
    plinthRing.rotation.x = Math.PI / 2;
    plinthRing.position.y = 0.0;
    plinthGroup.add(plinthRing);

    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 256;
    shadowCanvas.height = 256;
    const sCtx = shadowCanvas.getContext('2d');
    if (sCtx) {
      const grad = sCtx.createRadialGradient(128, 128, 14, 128, 128, 118);
      grad.addColorStop(0, 'rgba(0,0,0,0.72)');
      grad.addColorStop(0.5, 'rgba(0,0,0,0.32)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      sCtx.fillStyle = grad;
      sCtx.fillRect(0, 0, 256, 256);
    }
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(1.18, 1.18),
      new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false })
    );
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = 0.002;
    plinthGroup.add(shadowPlane);
    scene.add(plinthGroup);

    // =========================================================================
    // PROCEDURAL TEXTURES & PBR MATERIALS
    // =========================================================================
    const maxAniso = Math.min(4, renderer.capabilities.getMaxAnisotropy() || 1);
    const tweedTex = createTweedTexture('#64748b');
    const capTweedTex = createTweedTexture('#475569');
    const pinstripeTex = createPinstripeTexture();
    const denimTex = createDenimTexture('#1e3a8a');
    const ankaraTex = createAnkaraTexture();
    const irisTex = createIrisTexture();
    [tweedTex, capTweedTex, pinstripeTex, denimTex, ankaraTex, irisTex].forEach((t) => {
      t.anisotropy = maxAniso;
    });

    const skinColorObj = new THREE.Color(skinColor);
    const skinMat = new THREE.MeshPhysicalMaterial({
      color: skinColorObj,
      roughness: 0.48,
      metalness: 0.02,
      clearcoat: 0.08,
      clearcoatRoughness: 0.72,
    });
    const skinShadowMat = new THREE.MeshStandardMaterial({
      color: skinColorObj.clone().multiplyScalar(0.84),
      roughness: 0.56,
      metalness: 0.02,
    });
    const lipsMat = new THREE.MeshPhysicalMaterial({
      color: skinColorObj.clone().lerp(new THREE.Color(0x9f1239), 0.32),
      roughness: 0.38,
      metalness: 0.02,
      clearcoat: 0.25,
      clearcoatRoughness: 0.35,
    });
    const hairMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(hairColor),
      roughness: hairstyle === 'waves' ? 0.35 : 0.82,
      metalness: hairstyle === 'waves' ? 0.14 : 0.04,
    });
    const browMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(hairColor).multiplyScalar(0.9),
      roughness: 0.78,
      metalness: 0.02,
    });

    // Outfit Material Resolution (Faithful to Customizer + In-game Store)
    const isDapper = outfitType === 'corporate' || outfitType === 'peaky_dapper' || outfitType === 'designer';
    const isCasual = outfitType === 'casual';
    const isSenator = outfitType === 'trad_senator';
    const isStreetwear = outfitType === 'streetwear';
    const isAnkara = outfitType === 'ankara' || outfitType === 'agbada';

    const whiteCottonMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.72,
      metalness: 0.02,
    });
    const tweedVestMat = new THREE.MeshStandardMaterial({
      map: tweedTex,
      roughness: 0.84,
      metalness: 0.04,
    });
    const redSilkMat = new THREE.MeshPhysicalMaterial({
      color: 0x991b1b,
      roughness: 0.32,
      metalness: 0.08,
      clearcoat: 0.2,
      clearcoatRoughness: 0.3,
    });
    const poloMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.74,
      metalness: 0.04,
    });
    const streetGreenMat = new THREE.MeshStandardMaterial({
      color: 0x047857,
      roughness: 0.72,
      metalness: 0.03,
    });
    const ankaraMat = new THREE.MeshStandardMaterial({
      map: ankaraTex,
      roughness: 0.62,
      metalness: 0.05,
    });

    const torsoFabricMat = isDapper
      ? tweedVestMat
      : isCasual
      ? whiteCottonMat
      : isSenator
      ? poloMat
      : isStreetwear
      ? streetGreenMat
      : ankaraMat;

    const sleeveFabricMat = isDapper
      ? whiteCottonMat
      : isCasual
      ? whiteCottonMat
      : isSenator
      ? poloMat
      : isStreetwear
      ? streetGreenMat
      : ankaraMat;

    // Trousers Material
    let trousersMat: THREE.MeshStandardMaterial;
    if (pantsType === 'jeans') {
      trousersMat = new THREE.MeshStandardMaterial({
        map: denimTex,
        color: pantsColorHex ? new THREE.Color(pantsColorHex) : new THREE.Color(0xffffff),
        roughness: 0.82,
        metalness: 0.03,
      });
    } else if (pantsType === 'sweatpants') {
      trousersMat = new THREE.MeshStandardMaterial({
        color: pantsColorHex ? new THREE.Color(pantsColorHex) : new THREE.Color(0x1f2937),
        roughness: 0.88,
        metalness: 0.02,
      });
    } else if (isDapper) {
      trousersMat = new THREE.MeshStandardMaterial({
        map: pinstripeTex,
        roughness: 0.68,
        metalness: 0.05,
      });
    } else {
      trousersMat = new THREE.MeshStandardMaterial({
        color: pantsColorHex ? new THREE.Color(pantsColorHex) : new THREE.Color(isSenator ? 0x92400e : 0x1e293b),
        roughness: 0.72,
        metalness: 0.04,
      });
    }

    // Shoe Material
    const isSneaker = shoesType === 'sneakers';
    const isSandal = shoesType === 'sandals';
    const shoeUpperMat = new THREE.MeshPhysicalMaterial({
      color: shoesColorHex
        ? new THREE.Color(shoesColorHex)
        : new THREE.Color(isSneaker ? 0xf8fafc : isSandal ? 0x451a03 : 0x18181b),
      roughness: isSneaker ? 0.52 : 0.28,
      metalness: isSneaker ? 0.04 : 0.12,
      clearcoat: isSneaker ? 0.1 : 0.45,
      clearcoatRoughness: 0.25,
    });
    const soleMat = new THREE.MeshStandardMaterial({
      color: isSneaker ? 0xe2e8f0 : 0x09090b,
      roughness: 0.65,
      metalness: 0.05,
    });
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      roughness: 0.2,
      metalness: 0.92,
    });
    const silverMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.18,
      metalness: 0.94,
    });

    // =========================================================================
    // CHARACTER HIERARCHY & ANATOMY
    // =========================================================================
    const charGroup = new THREE.Group();
    const heightScaleY =
      heightPreset === 'short'
        ? 0.94
        : heightPreset === 'tall'
        ? 1.05
        : heightPreset === 'towering'
        ? 1.09
        : 1.0;
    charGroup.scale.set(1, heightScaleY, 1);
    scene.add(charGroup);

    const castShadowFlag = !isSoftwareGl;

    // 1. SCULPTED LATHE TORSO (Organic chest-to-waist-to-hip taper)
    const torsoGroup = new THREE.Group();
    torsoGroup.position.set(0, 1.02, 0);

    const chestR = isFemale ? 0.168 : 0.205;
    const waistR = isFemale ? 0.128 : 0.162;
    const hipR = isFemale ? 0.184 : 0.172;
    const torsoPoints = [
      new THREE.Vector2(0.01, -0.02),
      new THREE.Vector2(hipR, 0.02),
      new THREE.Vector2(waistR, 0.18),
      new THREE.Vector2(chestR * 0.96, 0.34),
      new THREE.Vector2(chestR, 0.46),
      new THREE.Vector2(0.088, 0.54),
      new THREE.Vector2(0.01, 0.55),
    ];
    const torsoGeo = new THREE.LatheGeometry(torsoPoints, 28);
    torsoGeo.scale(1.08, 1.0, 0.72);
    const torsoMesh = new THREE.Mesh(torsoGeo, torsoFabricMat);
    torsoMesh.castShadow = castShadowFlag;
    torsoMesh.receiveShadow = castShadowFlag;
    torsoGroup.add(torsoMesh);

    // Belt / Waistband seam
    const beltMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(waistR * 1.09, waistR * 1.11, 0.036, 24),
      new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.4, metalness: 0.2 })
    );
    beltMesh.scale.set(1, 1, 0.72);
    beltMesh.position.set(0, 0.10, 0);
    torsoGroup.add(beltMesh);

    const buckleMesh = new THREE.Mesh(new THREE.BoxGeometry(0.044, 0.034, 0.014), goldMat);
    buckleMesh.position.set(0, 0.10, waistR * 0.73);
    torsoGroup.add(buckleMesh);

    // Tailored Pelvis Transition
    const pelvisGeo = new THREE.CylinderGeometry(waistR * 1.04, hipR * 1.04, 0.16, 24);
    pelvisGeo.scale(1.06, 1, 0.73);
    const pelvisMesh = new THREE.Mesh(pelvisGeo, trousersMat);
    pelvisMesh.position.y = 0.03;
    pelvisMesh.castShadow = castShadowFlag;
    torsoGroup.add(pelvisMesh);

    // Female natural bust contour
    if (isFemale) {
      const bustGeo = new THREE.SphereGeometry(0.072, 18, 16);
      bustGeo.scale(1.0, 0.92, 0.95);
      const bustL = new THREE.Mesh(bustGeo, torsoFabricMat);
      bustL.position.set(-0.078, 0.36, 0.095);
      const bustR = new THREE.Mesh(bustGeo, torsoFabricMat);
      bustR.position.set(0.078, 0.36, 0.095);
      torsoGroup.add(bustL, bustR);
    }

    // Outfit Specific Sculpted Details
    if (isDapper) {
      // Crisp white V-front dress shirt triangle
      const vShirtShape = new THREE.Shape();
      vShirtShape.moveTo(0, 0.20);
      vShirtShape.lineTo(-0.068, 0.51);
      vShirtShape.lineTo(0.068, 0.51);
      vShirtShape.closePath();
      const vShirtGeo = new THREE.ExtrudeGeometry(vShirtShape, { depth: 0.018, bevelEnabled: false });
      const vShirt = new THREE.Mesh(vShirtGeo, whiteCottonMat);
      vShirt.position.set(0, 0.01, chestR * 0.68);
      torsoGroup.add(vShirt);

      // Lapel trims
      const lapelGeo = new THREE.BoxGeometry(0.022, 0.25, 0.014);
      const lapelL = new THREE.Mesh(lapelGeo, tweedVestMat);
      lapelL.position.set(-0.044, 0.37, chestR * 0.74);
      lapelL.rotation.z = -0.22;
      const lapelR = new THREE.Mesh(lapelGeo, tweedVestMat);
      lapelR.position.set(0.044, 0.37, chestR * 0.74);
      lapelR.rotation.z = 0.22;
      torsoGroup.add(lapelL, lapelR);

      // Silk Necktie (sculpted knot + tapered blade)
      const tieKnot = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.014, 0.036, 6), redSilkMat);
      tieKnot.position.set(0, 0.515, chestR * 0.75);
      const tieBladeShape = new THREE.Shape();
      tieBladeShape.moveTo(-0.013, 0);
      tieBladeShape.lineTo(0.013, 0);
      tieBladeShape.lineTo(0.021, -0.21);
      tieBladeShape.lineTo(0, -0.245);
      tieBladeShape.lineTo(-0.021, -0.21);
      tieBladeShape.closePath();
      const tieBlade = new THREE.Mesh(
        new THREE.ExtrudeGeometry(tieBladeShape, { depth: 0.008, bevelEnabled: false }),
        redSilkMat
      );
      tieBlade.position.set(0, 0.50, chestR * 0.76);
      torsoGroup.add(tieKnot, tieBlade);

      // 4 Vest Buttons
      const btnGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.007, 12);
      const btnMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.25, metalness: 0.55 });
      for (let i = 0; i < 4; i++) {
        const btn = new THREE.Mesh(btnGeo, btnMat);
        btn.rotation.x = Math.PI / 2;
        btn.position.set(0, 0.26 - i * 0.042, chestR * 0.73 - i * 0.004);
        torsoGroup.add(btn);
      }

      // Structured Dress Shirt Collar
      const collarRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.078, 0.014, 10, 24),
        whiteCottonMat
      );
      collarRing.rotation.x = Math.PI / 2;
      collarRing.position.set(0, 0.545, 0.008);
      torsoGroup.add(collarRing);
    } else if (isSenator) {
      // Sculpted Polo / Senator Placket & Gold Stud
      const placket = new THREE.Mesh(
        new THREE.BoxGeometry(0.036, 0.18, 0.012),
        new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.65 })
      );
      placket.position.set(0, 0.43, chestR * 0.73);
      const stud = new THREE.Mesh(new THREE.SphereGeometry(0.007, 10, 10), goldMat);
      stud.position.set(0, 0.48, chestR * 0.75);
      const collar = new THREE.Mesh(new THREE.TorusGeometry(0.082, 0.015, 10, 24), poloMat);
      collar.rotation.x = Math.PI / 2;
      collar.position.set(0, 0.54, 0.006);
      torsoGroup.add(placket, stud, collar);
    } else if (isAnkara) {
      // Gold embroidered native neckline trim
      const trim = new THREE.Mesh(
        new THREE.BoxGeometry(0.055, 0.22, 0.014),
        new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.35, metalness: 0.35 })
      );
      trim.position.set(0, 0.41, chestR * 0.72);
      torsoGroup.add(trim);
    } else {
      // Crew neck collar trim
      const ribCollar = new THREE.Mesh(
        new THREE.TorusGeometry(0.084, 0.012, 10, 24),
        torsoFabricMat
      );
      ribCollar.rotation.x = Math.PI / 2;
      ribCollar.position.set(0, 0.54, 0.006);
      torsoGroup.add(ribCollar);
    }

    charGroup.add(torsoGroup);

    // 2. NECK & SCULPTED HEAD WITH REALISTIC FACIAL ANATOMY
    const neckPts = [
      new THREE.Vector2(0.072, 0.0),
      new THREE.Vector2(0.059, 0.06),
      new THREE.Vector2(0.062, 0.13),
    ];
    const neckMesh = new THREE.Mesh(new THREE.LatheGeometry(neckPts, 20), skinMat);
    neckMesh.position.set(0, 1.54, 0.005);
    neckMesh.castShadow = castShadowFlag;
    charGroup.add(neckMesh);

    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.77, 0.01);

    // Sculpted Cranium + Cheekbones (Lathe-contoured oval skull)
    const skullPts = [
      new THREE.Vector2(0.001, -0.155),
      new THREE.Vector2(isFemale ? 0.062 : 0.078, -0.138), // Chin
      new THREE.Vector2(isFemale ? 0.105 : 0.122, -0.082), // Jaw
      new THREE.Vector2(0.142, -0.015), // Cheeks
      new THREE.Vector2(0.150, 0.055),  // Temples
      new THREE.Vector2(0.134, 0.125),
      new THREE.Vector2(0.082, 0.168),
      new THREE.Vector2(0.001, 0.178),
    ];
    const skullGeo = new THREE.LatheGeometry(skullPts, 32);
    skullGeo.scale(0.94, 1.0, 1.06);
    const skullMesh = new THREE.Mesh(skullGeo, skinMat);
    skullMesh.castShadow = castShadowFlag;
    skullMesh.receiveShadow = castShadowFlag;
    headGroup.add(skullMesh);

    // Subtle Brow Ridge & Cheek Contour
    const browRidge = new THREE.Mesh(
      new THREE.SphereGeometry(0.095, 16, 12),
      skinMat
    );
    browRidge.scale.set(1.15, 0.25, 0.52);
    browRidge.position.set(0, 0.048, 0.118);
    headGroup.add(browRidge);

    // SCULPTED NOSE (Bridge + Tip + Nostrils — ZERO cones!)
    const noseBridgePts = [
      new THREE.Vector3(0, 0.036, 0.148),
      new THREE.Vector3(0, 0.006, 0.168),
      new THREE.Vector3(0, -0.018, 0.175),
    ];
    const noseBridgeCurve = new THREE.CatmullRomCurve3(noseBridgePts);
    const noseBridge = new THREE.Mesh(
      new THREE.TubeGeometry(noseBridgeCurve, 10, 0.0135, 10, false),
      skinMat
    );
    const noseTip = new THREE.Mesh(new THREE.SphereGeometry(0.0175, 12, 12), skinMat);
    noseTip.scale.set(1.08, 0.88, 1.02);
    noseTip.position.set(0, -0.02, 0.174);

    const nostrilGeo = new THREE.SphereGeometry(0.0105, 10, 10);
    const nostrilL = new THREE.Mesh(nostrilGeo, skinShadowMat);
    nostrilL.position.set(-0.014, -0.025, 0.165);
    const nostrilR = new THREE.Mesh(nostrilGeo, skinShadowMat);
    nostrilR.position.set(0.014, -0.025, 0.165);
    headGroup.add(noseBridge, noseTip, nostrilL, nostrilR);

    // MULTI-PART REALISTIC EYES (Sclera, Procedural Iris, Clearcoat Glint, Eyelid Fold)
    const scleraMat = new THREE.MeshPhysicalMaterial({
      color: 0xf8fafc,
      roughness: 0.14,
      clearcoat: 0.85,
      clearcoatRoughness: 0.1,
    });
    const irisMat = new THREE.MeshPhysicalMaterial({
      map: irisTex,
      roughness: 0.12,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
    });
    const glintMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    const createEye = (xSign: number) => {
      const eyeGrp = new THREE.Group();
      eyeGrp.position.set(xSign * 0.052, 0.028, 0.138);

      const sclera = new THREE.Mesh(new THREE.SphereGeometry(0.022, 14, 14), scleraMat);
      sclera.scale.set(1.18, 0.72, 0.65);
      eyeGrp.add(sclera);

      const iris = new THREE.Mesh(new THREE.CylinderGeometry(0.0125, 0.0125, 0.005, 18), irisMat);
      iris.rotation.x = Math.PI / 2;
      iris.position.set(0, 0, 0.013);
      eyeGrp.add(iris);

      const glint = new THREE.Mesh(new THREE.SphereGeometry(0.0032, 8, 8), glintMat);
      glint.position.set(xSign * 0.004 + 0.002, 0.0045, 0.0165);
      eyeGrp.add(glint);

      // Upper eyelid crease
      const lidCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.024, 0.005, 0.008),
        new THREE.Vector3(0, 0.015, 0.014),
        new THREE.Vector3(0.024, 0.005, 0.008),
      ]);
      const upperLid = new THREE.Mesh(
        new THREE.TubeGeometry(lidCurve, 10, 0.0038, 8, false),
        skinShadowMat
      );
      eyeGrp.add(upperLid);

      return eyeGrp;
    };
    headGroup.add(createEye(-1), createEye(1));

    // ARCHED TUBE EYEBROWS
    const createBrow = (xSign: number) => {
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(xSign * 0.026, 0.062, 0.148),
        new THREE.Vector3(xSign * 0.052, 0.069, 0.148),
        new THREE.Vector3(xSign * 0.078, 0.060, 0.135),
      ]);
      return new THREE.Mesh(new THREE.TubeGeometry(curve, 12, 0.0052, 8, false), browMat);
    };
    headGroup.add(createBrow(-1), createBrow(1));

    // CONTOURED UPPER & LOWER LIPS
    const upperLipCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.032, -0.066, 0.141),
      new THREE.Vector3(-0.012, -0.060, 0.155),
      new THREE.Vector3(0, -0.063, 0.156),
      new THREE.Vector3(0.012, -0.060, 0.155),
      new THREE.Vector3(0.032, -0.066, 0.141),
    ]);
    const upperLip = new THREE.Mesh(new THREE.TubeGeometry(upperLipCurve, 14, 0.0068, 8, false), lipsMat);

    const lowerLipCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.028, -0.068, 0.142),
      new THREE.Vector3(0, -0.075, 0.156),
      new THREE.Vector3(0.028, -0.068, 0.142),
    ]);
    const lowerLip = new THREE.Mesh(new THREE.TubeGeometry(lowerLipCurve, 12, 0.0078, 8, false), lipsMat);
    headGroup.add(upperLip, lowerLip);

    // SCULPTED EARS (Outer helix + inner concha)
    const createEar = (xSign: number) => {
      const earGrp = new THREE.Group();
      earGrp.position.set(xSign * 0.143, 0.006, -0.01);
      const outer = new THREE.Mesh(new THREE.SphereGeometry(0.034, 12, 12), skinMat);
      outer.scale.set(0.32, 1.18, 0.72);
      const inner = new THREE.Mesh(new THREE.SphereGeometry(0.019, 10, 10), skinShadowMat);
      inner.scale.set(0.3, 0.95, 0.55);
      inner.position.set(xSign * 0.005, 0, 0.002);
      earGrp.add(outer, inner);
      return earGrp;
    };
    headGroup.add(createEar(-1), createEar(1));

    // =========================================================================
    // 3. SCULPTED HAIRSTYLES (Matches every option in CharacterCustomizer)
    // =========================================================================
    const hairGroup = new THREE.Group();

    if (hairstyle === 'peaky_cap' || accessoryType === 'peaky_cap') {
      const capMat = new THREE.MeshStandardMaterial({
        map: capTweedTex,
        roughness: 0.85,
        metalness: 0.04,
      });
      // Underneath fade sides so temples aren't bald
      const underCap = new THREE.Mesh(
        new THREE.SphereGeometry(0.152, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.52),
        hairMat
      );
      underCap.scale.set(0.95, 1.05, 1.06);
      underCap.position.set(0, 0.015, 0);
      hairGroup.add(underCap);

      // 8-panel Newsboy Flat Cap Dome
      const crown = new THREE.Mesh(new THREE.SphereGeometry(0.175, 24, 18), capMat);
      crown.scale.set(1.06, 0.48, 1.24);
      crown.rotation.x = -0.14;
      crown.position.set(0, 0.125, -0.015);
      crown.castShadow = castShadowFlag;
      hairGroup.add(crown);

      // Curved stiff front visor
      const brimGeo = new THREE.CylinderGeometry(0.145, 0.165, 0.014, 24, 1, false, 0, Math.PI);
      const brim = new THREE.Mesh(brimGeo, capMat);
      brim.rotation.x = 0.24;
      brim.rotation.y = Math.PI;
      brim.position.set(0, 0.082, 0.095);
      hairGroup.add(brim);

      // Top covered button
      const capBtn = new THREE.Mesh(new THREE.SphereGeometry(0.014, 10, 10), capMat);
      capBtn.position.set(0, 0.205, -0.02);
      hairGroup.add(capBtn);
    } else if (hairstyle === 'afro') {
      const baseAfro = new THREE.Mesh(new THREE.SphereGeometry(0.188, 24, 20), hairMat);
      baseAfro.scale.set(1.06, 0.98, 1.04);
      baseAfro.position.set(0, 0.135, -0.028);
      baseAfro.castShadow = castShadowFlag;
      hairGroup.add(baseAfro);

      for (let i = 0; i < 14; i++) {
        const theta = (i / 14) * Math.PI * 2;
        const puff = new THREE.Mesh(new THREE.SphereGeometry(0.072, 12, 12), hairMat);
        puff.position.set(
          Math.cos(theta) * 0.115,
          0.14 + Math.sin(theta * 2) * 0.045,
          Math.sin(theta) * 0.105 - 0.03
        );
        hairGroup.add(puff);
      }
    } else if (hairstyle === 'fade') {
      const topCap = new THREE.Mesh(
        new THREE.SphereGeometry(0.158, 24, 18, 0, Math.PI * 2, 0, Math.PI * 0.54),
        hairMat
      );
      topCap.scale.set(0.97, 1.06, 1.08);
      topCap.position.set(0, 0.024, 0.002);
      hairGroup.add(topCap);

      const lineup = new THREE.Mesh(new THREE.BoxGeometry(0.135, 0.024, 0.032), hairMat);
      lineup.position.set(0, 0.108, 0.132);
      hairGroup.add(lineup);
    } else if (hairstyle === 'waves') {
      const waveCap = new THREE.Mesh(
        new THREE.SphereGeometry(0.156, 24, 18, 0, Math.PI * 2, 0, Math.PI * 0.55),
        hairMat
      );
      waveCap.scale.set(0.96, 1.05, 1.07);
      waveCap.position.set(0, 0.015, 0);
      hairGroup.add(waveCap);

      for (let r = 0; r < 5; r++) {
        const ring = new THREE.Mesh(
          new THREE.TorusGeometry(0.135 - r * 0.018, 0.0065, 8, 28),
          hairMat
        );
        ring.rotation.x = Math.PI / 2;
        ring.position.set(0, 0.11 + r * 0.014, -0.005);
        hairGroup.add(ring);
      }
    } else if (hairstyle === 'cornrows') {
      const scalpMat = new THREE.MeshStandardMaterial({
        color: skinColorObj.clone().multiplyScalar(0.88),
        roughness: 0.6,
      });
      const scalp = new THREE.Mesh(
        new THREE.SphereGeometry(0.148, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.52),
        scalpMat
      );
      scalp.scale.set(0.95, 1.04, 1.06);
      hairGroup.add(scalp);

      // 7 crisp braided cornrow ridges front-to-back
      for (let row = -3; row <= 3; row++) {
        const xOff = row * 0.032;
        const arcDrop = Math.abs(row) * 0.012;
        const curve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(xOff, 0.095 - arcDrop, 0.125 - Math.abs(row) * 0.01),
          new THREE.Vector3(xOff, 0.172 - arcDrop, 0.03),
          new THREE.Vector3(xOff, 0.135 - arcDrop, -0.115),
          new THREE.Vector3(xOff, 0.035 - arcDrop, -0.16),
        ]);
        const braidRow = new THREE.Mesh(new THREE.TubeGeometry(curve, 16, 0.011, 8, false), hairMat);
        hairGroup.add(braidRow);
      }
    } else if (hairstyle === 'braids' || hairstyle === 'dreads' || hairstyle === 'locs') {
      const cap = new THREE.Mesh(
        new THREE.SphereGeometry(0.155, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.54),
        hairMat
      );
      cap.scale.set(0.96, 1.04, 1.07);
      hairGroup.add(cap);

      const strandRadius = hairstyle === 'dreads' ? 0.0155 : hairstyle === 'locs' ? 0.0085 : 0.0115;
      const strandCount = hairstyle === 'locs' ? 22 : 16;
      for (let b = 0; b < strandCount; b++) {
        const angle = (b / strandCount) * Math.PI * 1.45 + Math.PI * 0.775;
        const sx = Math.cos(angle) * 0.135;
        const sz = Math.sin(angle) * 0.145;
        const dropLen = 0.24 + (b % 3) * 0.04;
        const curve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(sx * 0.7, 0.14, sz * 0.7),
          new THREE.Vector3(sx * 1.05, 0.06, sz * 1.05),
          new THREE.Vector3(sx * 1.15, -dropLen * 0.45, sz * 1.12),
          new THREE.Vector3(sx * 1.12, -dropLen, sz * 1.04),
        ]);
        const strand = new THREE.Mesh(new THREE.TubeGeometry(curve, 12, strandRadius, 8, false), hairMat);
        strand.castShadow = castShadowFlag;
        hairGroup.add(strand);
      }
    } else if (hairstyle === 'gele') {
      const geleMat = new THREE.MeshStandardMaterial({
        color: 0xb91c1c,
        roughness: 0.45,
        metalness: 0.22,
      });
      for (let fold = 0; fold < 3; fold++) {
        const pleat = new THREE.Mesh(
          new THREE.TorusGeometry(0.165 + fold * 0.012, 0.032, 12, 28),
          geleMat
        );
        pleat.rotation.x = Math.PI / 2 + 0.12 * fold - 0.12;
        pleat.position.set(0, 0.095 + fold * 0.045, -0.015);
        hairGroup.add(pleat);
      }
    } else {
      // Clean buzz cut
      const buzz = new THREE.Mesh(
        new THREE.SphereGeometry(0.152, 22, 16, 0, Math.PI * 2, 0, Math.PI * 0.52),
        hairMat
      );
      buzz.scale.set(0.95, 1.02, 1.06);
      hairGroup.add(buzz);
    }

    // Accessories on Head & Neck
    if (accessoryType === 'fila_cap') {
      const filaMat = new THREE.MeshStandardMaterial({ color: 0x047857, roughness: 0.65 });
      const fila = new THREE.Mesh(new THREE.CylinderGeometry(0.148, 0.156, 0.11, 24), filaMat);
      fila.position.set(0, 0.135, -0.005);
      fila.rotation.z = -0.1;
      const trim = new THREE.Mesh(new THREE.TorusGeometry(0.152, 0.008, 8, 28), goldMat);
      trim.rotation.x = Math.PI / 2;
      trim.position.set(0, 0.088, -0.005);
      hairGroup.add(fila, trim);
    }

    if (accessoryType === 'sunglasses' || accessoryType === 'designer_shades') {
      const frameMat = accessoryType === 'designer_shades' ? goldMat : soleMat;
      const lensMat = new THREE.MeshPhysicalMaterial({
        color: 0x09090b,
        roughness: 0.08,
        metalness: 0.2,
        clearcoat: 1.0,
        transparent: true,
        opacity: 0.88,
      });
      const glassesGrp = new THREE.Group();
      glassesGrp.position.set(0, 0.028, 0.162);

      const lensGeo = new THREE.BoxGeometry(0.048, 0.028, 0.006);
      const lensL = new THREE.Mesh(lensGeo, lensMat);
      lensL.position.set(-0.048, 0, 0);
      const lensR = new THREE.Mesh(lensGeo, lensMat);
      lensR.position.set(0.048, 0, 0);
      const rimGeo = new THREE.BoxGeometry(0.054, 0.034, 0.004);
      const rimL = new THREE.Mesh(rimGeo, frameMat);
      rimL.position.set(-0.048, 0, -0.002);
      const rimR = new THREE.Mesh(rimGeo, frameMat);
      rimR.position.set(0.048, 0, -0.002);
      const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.005, 0.005), frameMat);
      bridge.position.set(0, 0.008, 0);
      glassesGrp.add(rimL, rimR, lensL, lensR, bridge);
      headGroup.add(glassesGrp);
    }

    if (accessoryType === 'gold_chain' || accessoryType === 'diamond_chain') {
      const chainMat = accessoryType === 'diamond_chain' ? silverMat : goldMat;
      const chain = new THREE.Mesh(new THREE.TorusGeometry(0.095, 0.008, 10, 28), chainMat);
      chain.rotation.x = Math.PI / 2 + 0.35;
      chain.position.set(0, 0.515, 0.028);
      const medallion = new THREE.Mesh(new THREE.OctahedronGeometry(0.02, 0), chainMat);
      medallion.scale.set(1, 1, 0.35);
      medallion.position.set(0, 0.46, chestR * 0.77);
      torsoGroup.add(chain, medallion);
    }

    if (accessoryType === 'coral_beads') {
      const coralMat = new THREE.MeshPhysicalMaterial({ color: 0xdc2626, roughness: 0.25, clearcoat: 0.6 });
      for (let tier = 0; tier < 2; tier++) {
        const strand = new THREE.Mesh(new THREE.TorusGeometry(0.098 + tier * 0.014, 0.009, 10, 28), coralMat);
        strand.rotation.x = Math.PI / 2 + 0.35;
        strand.position.set(0, 0.515 - tier * 0.022, 0.028);
        torsoGroup.add(strand);
      }
    }

    headGroup.add(hairGroup);
    charGroup.add(headGroup);

    // 4. SCULPTED ARMS & STRUCTURED HANDS
    const shoulderOffset = chestR * 1.08 + 0.032;
    const armL = new THREE.Group();
    const armR = new THREE.Group();

    const buildArm = (isRight: boolean, grp: THREE.Group) => {
      grp.position.set(isRight ? shoulderOffset : -shoulderOffset, 1.48, 0);

      // Shoulder Cap
      const shoulder = new THREE.Mesh(
        new THREE.SphereGeometry(isFemale ? 0.044 : 0.052, 16, 14),
        sleeveFabricMat
      );
      shoulder.castShadow = castShadowFlag;
      grp.add(shoulder);

      // Short sleeves on Casual/Streetwear/Ankara vs Long sleeves on Dapper
      const isShortSleeve = isCasual || isStreetwear || isAnkara;
      const upperArm = new THREE.Mesh(
        new THREE.CylinderGeometry(isFemale ? 0.038 : 0.045, isFemale ? 0.034 : 0.040, 0.26, 16),
        sleeveFabricMat
      );
      upperArm.position.y = -0.14;
      upperArm.castShadow = castShadowFlag;
      grp.add(upperArm);

      const forearmMat = isShortSleeve ? skinMat : sleeveFabricMat;
      const forearm = new THREE.Mesh(
        new THREE.CylinderGeometry(isFemale ? 0.033 : 0.038, isFemale ? 0.025 : 0.029, 0.24, 16),
        forearmMat
      );
      forearm.position.y = -0.37;
      forearm.castShadow = castShadowFlag;
      grp.add(forearm);

      if (!isShortSleeve) {
        const cuff = new THREE.Mesh(
          new THREE.CylinderGeometry(0.031, 0.031, 0.038, 16),
          isDapper ? whiteCottonMat : sleeveFabricMat
        );
        cuff.position.y = -0.47;
        grp.add(cuff);
      }

      // Wristwatch
      if (!isRight && accessoryType === 'rolex_watch') {
        const watchBand = new THREE.Mesh(new THREE.CylinderGeometry(0.031, 0.031, 0.022, 16), goldMat);
        watchBand.position.y = -0.46;
        grp.add(watchBand);
      }

      // Sculpted Hand (Palm + Fingers Block + Thumb)
      const handGrp = new THREE.Group();
      handGrp.position.set(0, -0.52, 0.01);
      const palm = new THREE.Mesh(new THREE.BoxGeometry(0.034, 0.058, 0.048), skinMat);
      palm.castShadow = castShadowFlag;
      const fingers = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.012, 0.055, 10), skinMat);
      fingers.position.set(0, -0.045, 0.004);
      const thumb = new THREE.Mesh(new THREE.CapsuleGeometry(0.008, 0.024, 4, 8), skinMat);
      thumb.position.set(isRight ? -0.018 : 0.018, -0.012, 0.022);
      thumb.rotation.x = 0.45;
      handGrp.add(palm, fingers, thumb);
      grp.add(handGrp);

      grp.rotation.z = isRight ? -0.10 : 0.10;
      grp.rotation.x = 0.03;
      return grp;
    };

    charGroup.add(buildArm(false, armL), buildArm(true, armR));

    // 5. ANATOMICAL LEGS & DETAILED FOOTWEAR
    const legSpacing = isFemale ? 0.105 : 0.125;
    const legPoints = [
      new THREE.Vector2(0.001, -0.96),
      new THREE.Vector2(isFemale ? 0.038 : 0.042, -0.92), // Ankle
      new THREE.Vector2(isFemale ? 0.052 : 0.058, -0.68), // Calf
      new THREE.Vector2(isFemale ? 0.048 : 0.054, -0.48), // Knee
      new THREE.Vector2(isFemale ? 0.072 : 0.078, -0.12), // Upper Thigh
      new THREE.Vector2(isFemale ? 0.076 : 0.080, 0.0),
    ];

    const buildLeg = (isRight: boolean) => {
      const legGrp = new THREE.Group();
      legGrp.position.set(isRight ? legSpacing : -legSpacing, 1.02, 0);

      const legGeo = new THREE.LatheGeometry(legPoints, 22);
      const legMesh = new THREE.Mesh(legGeo, trousersMat);
      legMesh.castShadow = castShadowFlag;
      legMesh.receiveShadow = castShadowFlag;
      legGrp.add(legMesh);

      // Detailed Footwear
      const shoeGrp = new THREE.Group();
      shoeGrp.position.set(0, -0.975, 0.038);

      const outsole = new THREE.Mesh(new THREE.BoxGeometry(0.098, 0.022, 0.225), soleMat);
      outsole.position.set(0, -0.022, 0.01);
      outsole.castShadow = castShadowFlag;
      shoeGrp.add(outsole);

      if (isSandal) {
        const strap = new THREE.Mesh(new THREE.BoxGeometry(0.096, 0.024, 0.055), shoeUpperMat);
        strap.position.set(0, 0.005, 0.035);
        const footSkin = new THREE.Mesh(new THREE.BoxGeometry(0.082, 0.036, 0.18), skinMat);
        footSkin.position.set(0, 0.002, 0.005);
        shoeGrp.add(footSkin, strap);
      } else {
        const vamp = new THREE.Mesh(new THREE.CapsuleGeometry(0.044, 0.11, 8, 14), shoeUpperMat);
        vamp.rotation.x = Math.PI / 2;
        vamp.scale.set(1.05, 1.0, 0.78);
        vamp.position.set(0, 0.008, 0.015);
        vamp.castShadow = castShadowFlag;
        shoeGrp.add(vamp);

        const ankleCollar = new THREE.Mesh(
          new THREE.CylinderGeometry(0.044, 0.046, 0.045, 16),
          shoeUpperMat
        );
        ankleCollar.position.set(0, 0.022, -0.038);
        shoeGrp.add(ankleCollar);

        if (!isSneaker) {
          const heel = new THREE.Mesh(new THREE.BoxGeometry(0.092, 0.018, 0.068), soleMat);
          heel.position.set(0, -0.035, -0.062);
          shoeGrp.add(heel);
        }
      }

      legGrp.add(shoeGrp);
      return legGrp;
    };

    charGroup.add(buildLeg(false), buildLeg(true));

    // =========================================================================
    // ANIMATION LOOP & SAFE CLEANUP
    // =========================================================================
    let frameId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Subtle natural idle breathing & micro-sway
      const breath = Math.sin(t * 1.7) * 0.008;
      torsoGroup.scale.set(1 + breath * 0.45, 1, 1 + breath * 0.55);
      armL.rotation.z = 0.10 + Math.sin(t * 1.7) * 0.01;
      armR.rotation.z = -0.10 - Math.sin(t * 1.7) * 0.01;
      headGroup.rotation.y = Math.sin(t * 0.65) * 0.035;

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      cancelAnimationFrame(frameId);
    };
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost, false);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 320;
      const h = container.clientHeight || 460;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      controls.removeEventListener('start', stopAutoRotate);
      renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
      controls.dispose();

      scene.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const mesh = obj as THREE.Mesh;
          mesh.geometry?.dispose();
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((m) => m.dispose());
          } else {
            mesh.material?.dispose();
          }
        }
      });

      [tweedTex, capTweedTex, pinstripeTex, denimTex, ankaraTex, irisTex, shadowTex, envTarget.texture].forEach(
        (tex) => tex.dispose()
      );
      envTarget.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [
    isFemale,
    skinColor,
    hairColor,
    outfitType,
    hairstyle,
    heightPreset,
    accessoryType,
    pantsType,
    pantsColorHex,
    shoesType,
    shoesColorHex,
    interactive,
  ]);

  const sizeClasses = {
    sm: 'w-24 h-32',
    md: 'w-48 h-64',
    lg: 'w-64 h-80',
    xl: 'w-80 h-96',
    full: 'w-full h-full min-h-[360px] sm:min-h-[420px]',
  };

  return (
    <div
      ref={mountRef}
      className={`relative select-none cursor-grab active:cursor-grabbing ${sizeClasses[size]} ${className}`}
      title="Drag to orbit 360° or scroll to zoom"
    >
      {interactive && (
        <div className="absolute bottom-2 right-2 pointer-events-none z-10">
          <span className="px-2 py-0.5 rounded-full bg-black/65 text-zinc-300 text-[9px] font-mono border border-white/10 backdrop-blur-sm">
            Drag to Orbit · Scroll to Zoom
          </span>
        </div>
      )}
    </div>
  );
};
