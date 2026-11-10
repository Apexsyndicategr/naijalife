/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { CharacterAvatar } from '../types/game';

interface ThreeCharacterAvatarProps {
  avatar: CharacterAvatar;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  interactive?: boolean;
  className?: string;
}

export const ThreeCharacterAvatar: React.FC<ThreeCharacterAvatarProps> = ({
  avatar,
  size = 'md',
  interactive = true,
  className = '',
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const prevMouseXRef = useRef<number>(0);
  const characterGroupRef = useRef<THREE.Group | null>(null);
  const targetRotationYRef = useRef<number>(0);
  const isAutoSpinningRef = useRef<boolean>(true);

  const safeAvatar: CharacterAvatar = avatar || {
    gender: 'male',
    skinTone: '#8d5524',
    hairstyle: 'fade',
    hairColor: '#18181b',
    outfit: 'streetwear',
    pants: 'jeans',
    shoes: 'sneakers',
    accessory: 'none',
  };

  const isFemale = safeAvatar.gender === 'female';
  const skinColor = safeAvatar.skinTone || '#8d5524';
  const hairColor = safeAvatar.hairColor || '#18181b';
  const outfitType = safeAvatar.outfit || 'streetwear';
  const hairstyle = safeAvatar.hairstyle || 'fade';
  const heightPreset = safeAvatar.height || 'average';

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect software WebGL
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

    // Scene & Camera
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 50);
    // Framed to capture full character from head to toe with good margins
    camera.position.set(0, 1.25, 4.0);
    camera.lookAt(0, 1.05, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // Cinematic 3-Point Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xfff7ed, 0x18181b, 0.75);
    scene.add(hemiLight);

    // Warm Key Light (Front-Right)
    const keyLight = new THREE.DirectionalLight(0xfffaf0, 1.45);
    keyLight.position.set(2.4, 3.8, 3.2);
    keyLight.castShadow = !isSoftwareGl;
    if (!isSoftwareGl) {
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.bias = -0.0004;
      keyLight.shadow.normalBias = 0.02;
    }
    scene.add(keyLight);

    // Soft Cool Fill Light (Front-Left)
    const fillLight = new THREE.DirectionalLight(0xe0f2fe, 0.65);
    fillLight.position.set(-2.5, 2.8, 2.5);
    scene.add(fillLight);

    // Vivid Cyan/Sky-Blue Rim Light (Back-Left - AAA Character Silhouette Highlight)
    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.1);
    rimLight.position.set(-2.8, 3.0, -3.0);
    scene.add(rimLight);

    // Subtle Amber Warm Rim (Back-Right)
    const warmRim = new THREE.DirectionalLight(0xf59e0b, 0.55);
    warmRim.position.set(2.5, 2.5, -2.5);
    scene.add(warmRim);

    // Soft Contact Shadow Plane on Floor
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 256;
    shadowCanvas.height = 256;
    const sCtx = shadowCanvas.getContext('2d');
    if (sCtx) {
      const grad = sCtx.createRadialGradient(128, 128, 15, 128, 128, 120);
      grad.addColorStop(0, 'rgba(0, 0, 0, 0.65)');
      grad.addColorStop(0.45, 'rgba(0, 0, 0, 0.3)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      sCtx.fillStyle = grad;
      sCtx.fillRect(0, 0, 256, 256);
    }
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowGeo = new THREE.PlaneGeometry(1.6, 1.6);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.85,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = 0.003;
    scene.add(shadowMesh);

    // =========================================================================
    // 3D PROCEDURAL CHARACTER MODEL
    // Realistic proportions, natural relaxed standing posture, human anatomical structure
    // =========================================================================
    const charGroup = new THREE.Group();
    characterGroupRef.current = charGroup;
    scene.add(charGroup);

    // Height scale
    const heightScaleY =
      heightPreset === 'short'
        ? 0.94
        : heightPreset === 'tall'
        ? 1.05
        : heightPreset === 'towering'
        ? 1.10
        : 1.0;
    charGroup.scale.set(1, heightScaleY, 1);

    // High quality standard PBR materials
    const skinMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(skinColor),
      roughness: 0.52,
      metalness: 0.03,
    });

    const skinToneObj = new THREE.Color(skinColor);
    const lipsMat = new THREE.MeshStandardMaterial({
      color: skinToneObj.clone().lerp(new THREE.Color(0xb91c1c), 0.28),
      roughness: 0.45,
      metalness: 0.04,
    });

    const hairMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(hairColor),
      roughness: 0.88,
      metalness: 0.02,
    });

    // Outfit Palette
    let shirtColorHex = 0xffffff;
    let pantsColorHex = 0x1e3a8a;
    let accentColorHex = 0xd97706;

    if (outfitType === 'corporate') {
      shirtColorHex = 0x1d4ed8; // Crisp royal blue corporate shirt
      pantsColorHex = 0x27272a; // Charcoal tailored trousers
      accentColorHex = 0xd4af37;
    } else if (outfitType === 'casual') {
      shirtColorHex = 0x059669; // Forest green casual crewneck
      pantsColorHex = 0x18181b; // Pitch black street joggers
      accentColorHex = 0x10b981;
    } else if (outfitType === 'ankara' || outfitType === 'trad_senator') {
      shirtColorHex = 0x7c2d12; // Rich African mahogany rust with gold embroidery
      pantsColorHex = 0x7c2d12; // Matching tailored senator trousers
      accentColorHex = 0xf59e0b; // Gold embroidery
    } else {
      // streetwear: clean crisp white designer tee & indigo wash jeans
      shirtColorHex = 0xf8fafc;
      pantsColorHex = 0x1e3a8a;
      accentColorHex = 0xef4444;
    }

    if (safeAvatar.pantsColor) {
      try {
        pantsColorHex = new THREE.Color(safeAvatar.pantsColor).getHex();
      } catch {}
    }

    const shirtMat = new THREE.MeshStandardMaterial({
      color: shirtColorHex,
      roughness: 0.75,
      metalness: 0.02,
    });

    const pantsMat = new THREE.MeshStandardMaterial({
      color: pantsColorHex,
      roughness: 0.80,
      metalness: 0.02,
    });

    const beltMat = new THREE.MeshStandardMaterial({
      color: 0x1c1917,
      roughness: 0.5,
      metalness: 0.1,
    });

    const goldBuckleMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.25,
      metalness: 0.85,
    });

    const shoeMainMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.45,
      metalness: 0.08,
    });

    const shoeSoleMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.35,
      metalness: 0.02,
    });

    // 1. Torso Group (Gender Proportions)
    const torsoGroup = new THREE.Group();
    torsoGroup.position.set(0, 1.26, 0);

    const chestWidth = isFemale ? 0.38 : 0.46;
    const waistWidth = isFemale ? 0.31 : 0.39;
    const hipWidth = isFemale ? 0.42 : 0.39;

    // Upper Chest
    const chestGeo = new THREE.CylinderGeometry(chestWidth / 2, waistWidth / 2, 0.36, 16);
    const chestMesh = new THREE.Mesh(chestGeo, shirtMat);
    chestMesh.position.y = 0.16;
    chestMesh.castShadow = !isSoftwareGl;
    chestMesh.receiveShadow = !isSoftwareGl;
    torsoGroup.add(chestMesh);

    // Shirt Collar Band
    const collarGeo = new THREE.TorusGeometry(0.09, 0.016, 8, 20);
    const collarMesh = new THREE.Mesh(collarGeo, shirtMat);
    collarMesh.rotation.x = Math.PI / 2;
    collarMesh.position.set(0, 0.33, 0);
    torsoGroup.add(collarMesh);

    // Traditional Senator / Ankara Chest Embroidery Detail
    if (outfitType === 'trad_senator' || outfitType === 'ankara') {
      const embroGeo = new THREE.BoxGeometry(0.08, 0.26, 0.01);
      const embroMat = new THREE.MeshStandardMaterial({
        color: accentColorHex,
        roughness: 0.4,
        metalness: 0.3,
      });
      const embroMesh = new THREE.Mesh(embroGeo, embroMat);
      embroMesh.position.set(0, 0.16, (chestWidth / 2) * 0.9 + 0.01);
      torsoGroup.add(embroMesh);
    }

    // Female bust curvature
    if (isFemale) {
      const bustGeo = new THREE.SphereGeometry(0.09, 14, 14);
      const bustL = new THREE.Mesh(bustGeo, shirtMat);
      bustL.position.set(-0.085, 0.16, 0.13);
      bustL.scale.set(1.0, 0.9, 1.15);
      const bustR = new THREE.Mesh(bustGeo, shirtMat);
      bustR.position.set(0.085, 0.16, 0.13);
      bustR.scale.set(1.0, 0.9, 1.15);
      torsoGroup.add(bustL, bustR);
    }

    // Belt & Buckle
    const beltGeo = new THREE.CylinderGeometry(waistWidth / 2 + 0.006, waistWidth / 2 + 0.006, 0.045, 16);
    const beltMesh = new THREE.Mesh(beltGeo, beltMat);
    beltMesh.position.y = -0.02;
    torsoGroup.add(beltMesh);

    const buckleGeo = new THREE.BoxGeometry(0.05, 0.04, 0.02);
    const buckleMesh = new THREE.Mesh(buckleGeo, goldBuckleMat);
    buckleMesh.position.set(0, -0.02, waistWidth / 2 + 0.01);
    torsoGroup.add(buckleMesh);

    // Pelvis / Hips
    const pelvisGeo = new THREE.CylinderGeometry(waistWidth / 2, hipWidth / 2, 0.20, 16);
    const pelvisMesh = new THREE.Mesh(pelvisGeo, pantsMat);
    pelvisMesh.position.y = -0.12;
    pelvisMesh.castShadow = !isSoftwareGl;
    torsoGroup.add(pelvisMesh);

    charGroup.add(torsoGroup);

    // 2. Neck & Head
    const neckGeo = new THREE.CylinderGeometry(0.075, 0.085, 0.13, 14);
    const neckMesh = new THREE.Mesh(neckGeo, skinMat);
    neckMesh.position.set(0, 1.57, 0);
    neckMesh.castShadow = !isSoftwareGl;
    charGroup.add(neckMesh);

    // Head Group
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.77, 0);

    // Cranium
    const headGeo = new THREE.SphereGeometry(0.168, 22, 22);
    headGeo.scale(1, 1.14, 1.06);
    const headMesh = new THREE.Mesh(headGeo, skinMat);
    headMesh.castShadow = !isSoftwareGl;
    headGroup.add(headMesh);

    // Tapered Jaw & Chin
    const jawGeo = new THREE.CylinderGeometry(0.13, isFemale ? 0.085 : 0.115, 0.15, 14);
    const jawMesh = new THREE.Mesh(jawGeo, skinMat);
    jawMesh.position.set(0, -0.065, 0.035);
    headGroup.add(jawMesh);

    // Defined Nose Bridge
    const noseGeo = new THREE.ConeGeometry(0.028, 0.07, 8);
    const noseMesh = new THREE.Mesh(noseGeo, skinMat);
    noseMesh.rotation.x = Math.PI / 2.2;
    noseMesh.position.set(0, -0.01, 0.18);
    headGroup.add(noseMesh);

    // Stylized Expressive 3D Eyes
    const eyeWhiteGeo = new THREE.SphereGeometry(0.026, 10, 10);
    const eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1 });
    const pupilGeo = new THREE.SphereGeometry(0.015, 10, 10);
    const pupilMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.1 });
    const glintGeo = new THREE.SphereGeometry(0.005, 6, 6);
    const glintMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    // Left Eye
    const eyeL = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat);
    eyeL.position.set(-0.058, 0.032, 0.152);
    eyeL.scale.set(1.2, 0.72, 0.6);
    const pupilL = new THREE.Mesh(pupilGeo, pupilMat);
    pupilL.position.set(-0.058, 0.032, 0.168);
    const glintL = new THREE.Mesh(glintGeo, glintMat);
    glintL.position.set(-0.053, 0.037, 0.178);

    // Right Eye
    const eyeR = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat);
    eyeR.position.set(0.058, 0.032, 0.152);
    eyeR.scale.set(1.2, 0.72, 0.6);
    const pupilR = new THREE.Mesh(pupilGeo, pupilMat);
    pupilR.position.set(0.058, 0.032, 0.168);
    const glintR = new THREE.Mesh(glintGeo, glintMat);
    glintR.position.set(0.063, 0.037, 0.178);

    headGroup.add(eyeL, pupilL, glintL, eyeR, pupilR, glintR);

    // Styled Eyebrows
    const browGeo = new THREE.BoxGeometry(0.048, 0.01, 0.016);
    const browMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(hairColor), roughness: 0.85 });
    const browL = new THREE.Mesh(browGeo, browMat);
    browL.position.set(-0.058, 0.066, 0.165);
    browL.rotation.z = 0.07;
    const browR = new THREE.Mesh(browGeo, browMat);
    browR.position.set(0.058, 0.066, 0.165);
    browR.rotation.z = -0.07;
    headGroup.add(browL, browR);

    // Natural Contoured Lips
    const lipGeo = new THREE.CylinderGeometry(0.036, 0.032, 0.014, 10);
    const lipMesh = new THREE.Mesh(lipGeo, lipsMat);
    lipMesh.rotation.x = Math.PI / 2;
    lipMesh.position.set(0, -0.065, 0.165);
    lipMesh.scale.set(1.2, 0.6, 0.9);
    headGroup.add(lipMesh);

    // Realistic Ears with Lobes
    const earGeo = new THREE.SphereGeometry(0.042, 10, 10);
    earGeo.scale(0.35, 1.15, 0.85);
    const earL = new THREE.Mesh(earGeo, skinMat);
    earL.position.set(-0.168, 0.01, -0.01);
    const earR = new THREE.Mesh(earGeo, skinMat);
    earR.position.set(0.168, 0.01, -0.01);
    headGroup.add(earL, earR);

    // 3. 3D HAIRSTYLES (Sitting comfortably above cranium - never obscuring eyes!)
    const hairGroup = new THREE.Group();

    if (hairstyle === 'afro') {
      // Volumetric Afro Crown
      const afroBaseGeo = new THREE.SphereGeometry(0.23, 18, 18);
      afroBaseGeo.scale(1.15, 1.08, 1.15);
      const afroMesh = new THREE.Mesh(afroBaseGeo, hairMat);
      afroMesh.position.set(0, 0.13, -0.03);
      hairGroup.add(afroMesh);

      // Fluffy textured density nodes
      for (let i = 0; i < 9; i++) {
        const angle = (i / 9) * Math.PI * 2;
        const bumpGeo = new THREE.SphereGeometry(0.095, 10, 10);
        const bumpMesh = new THREE.Mesh(bumpGeo, hairMat);
        bumpMesh.position.set(
          Math.cos(angle) * 0.15,
          0.17 + Math.sin(angle) * 0.06,
          Math.sin(angle) * 0.15 - 0.03
        );
        hairGroup.add(bumpMesh);
      }
    } else if (hairstyle === 'fade') {
      // Clean Taper Fade with crisp front hairline
      const fadeGeo = new THREE.SphereGeometry(0.176, 18, 18, 0, Math.PI * 2, 0, Math.PI * 0.52);
      fadeGeo.scale(1.02, 1.13, 1.04);
      const fadeMesh = new THREE.Mesh(fadeGeo, hairMat);
      fadeMesh.position.set(0, 0.015, 0);
      hairGroup.add(fadeMesh);

      // Crisp front edge-up line
      const edgeGeo = new THREE.BoxGeometry(0.11, 0.012, 0.02);
      const edgeMesh = new THREE.Mesh(edgeGeo, hairMat);
      edgeMesh.position.set(0, 0.11, 0.158);
      hairGroup.add(edgeMesh);
    } else if (hairstyle === 'waves') {
      // 360 Waves with specular rings
      const waveCapGeo = new THREE.SphereGeometry(0.176, 18, 18, 0, Math.PI * 2, 0, Math.PI * 0.54);
      waveCapGeo.scale(1.02, 1.13, 1.04);
      const waveCap = new THREE.Mesh(waveCapGeo, hairMat);
      hairGroup.add(waveCap);

      for (let w = 0; w < 4; w++) {
        const ringGeo = new THREE.TorusGeometry(0.12 - w * 0.02, 0.012, 6, 18);
        const ringMesh = new THREE.Mesh(ringGeo, hairMat);
        ringMesh.rotation.x = Math.PI / 2;
        ringMesh.position.set(0, 0.15 - w * 0.03, -0.01);
        hairGroup.add(ringMesh);
      }
    } else if (hairstyle === 'braids' || hairstyle === 'dreads' || hairstyle === 'locs') {
      // Crown cap + Hanging segmented dreads/braids
      const capGeo = new THREE.SphereGeometry(0.176, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.52);
      const cap = new THREE.Mesh(capGeo, hairMat);
      hairGroup.add(cap);

      const strandCount = 16;
      for (let b = 0; b < strandCount; b++) {
        const angle = (b / strandCount) * Math.PI * 1.5 + Math.PI * 0.75;
        const length = 0.32 + (b % 3) * 0.04;
        const strandGeo = new THREE.CylinderGeometry(0.014, 0.01, length, 8);
        const strandMesh = new THREE.Mesh(strandGeo, hairMat);
        const radius = 0.16;
        strandMesh.position.set(
          Math.cos(angle) * radius,
          -length / 2 + 0.02,
          Math.sin(angle) * radius
        );
        strandMesh.rotation.z = Math.cos(angle) * -0.16;
        hairGroup.add(strandMesh);
      }
    } else {
      // Clean buzz cut
      const buzzGeo = new THREE.SphereGeometry(0.174, 18, 18, 0, Math.PI * 2, 0, Math.PI * 0.50);
      buzzGeo.scale(1.01, 1.11, 1.03);
      const buzzMesh = new THREE.Mesh(buzzGeo, hairMat);
      hairGroup.add(buzzMesh);
    }

    headGroup.add(hairGroup);
    charGroup.add(headGroup);

    // 4. Natural Relaxed Arms (Resting along torso at ~15°, NOT T-Pose)
    const armWidth = isFemale ? 0.082 : 0.098;
    const shoulderSpan = (chestWidth / 2) + 0.055;

    // Left Arm
    const armLGroup = new THREE.Group();
    armLGroup.position.set(-shoulderSpan, 1.40, 0);

    // Shoulder Deltoid
    const deltoidGeo = new THREE.SphereGeometry(armWidth * 0.7, 10, 10);
    const deltoidL = new THREE.Mesh(deltoidGeo, shirtMat);
    armLGroup.add(deltoidL);

    // Bicep / Upper Arm
    const upperArmGeo = new THREE.CylinderGeometry(armWidth / 2, (armWidth * 0.88) / 2, 0.32, 12);
    const upperArmL = new THREE.Mesh(upperArmGeo, shirtMat);
    upperArmL.position.y = -0.15;
    armLGroup.add(upperArmL);

    // Forearm (Skin)
    const forearmGeo = new THREE.CylinderGeometry((armWidth * 0.88) / 2, (armWidth * 0.74) / 2, 0.30, 12);
    const forearmL = new THREE.Mesh(forearmGeo, skinMat);
    forearmL.position.y = -0.42;
    armLGroup.add(forearmL);

    // Wristwatch on Left Arm
    const watchBandGeo = new THREE.CylinderGeometry(armWidth * 0.39, armWidth * 0.39, 0.035, 12);
    const watchBandMesh = new THREE.Mesh(watchBandGeo, goldBuckleMat);
    watchBandMesh.position.y = -0.54;
    armLGroup.add(watchBandMesh);

    // Resting Curled Hand
    const handGeo = new THREE.SphereGeometry(0.044, 10, 10);
    handGeo.scale(0.8, 1.25, 0.95);
    const handL = new THREE.Mesh(handGeo, skinMat);
    handL.position.y = -0.61;
    armLGroup.add(handL);

    // Natural 16-degree relaxed angle
    armLGroup.rotation.z = 0.16;
    armLGroup.rotation.x = 0.06;
    charGroup.add(armLGroup);

    // Right Arm
    const armRGroup = new THREE.Group();
    armRGroup.position.set(shoulderSpan, 1.40, 0);

    const deltoidR = new THREE.Mesh(deltoidGeo, shirtMat);
    armRGroup.add(deltoidR);

    const upperArmR = new THREE.Mesh(upperArmGeo, shirtMat);
    upperArmR.position.y = -0.15;
    armRGroup.add(upperArmR);

    const forearmR = new THREE.Mesh(forearmGeo, skinMat);
    forearmR.position.y = -0.42;
    armRGroup.add(forearmR);

    const handR = new THREE.Mesh(handGeo, skinMat);
    handR.position.y = -0.61;
    armRGroup.add(handR);

    armRGroup.rotation.z = -0.16;
    armRGroup.rotation.x = 0.06;
    charGroup.add(armRGroup);

    // 5. Anatomical Legs & Realistic Footwear
    const legWidth = isFemale ? 0.11 : 0.13;
    const legSpacing = isFemale ? 0.115 : 0.135;

    // Helper for structured leg (Thigh + Knee + Calf + Shoe)
    const createLeg = (isRight: boolean) => {
      const legGroup = new THREE.Group();
      legGroup.position.set(isRight ? legSpacing : -legSpacing, 1.08, 0);

      // Thigh (Upper Leg)
      const thighGeo = new THREE.CylinderGeometry(legWidth / 2, (legWidth * 0.88) / 2, 0.46, 14);
      const thighMesh = new THREE.Mesh(thighGeo, pantsMat);
      thighMesh.position.y = -0.23;
      thighMesh.castShadow = !isSoftwareGl;
      legGroup.add(thighMesh);

      // Knee Joint
      const kneeGeo = new THREE.SphereGeometry((legWidth * 0.85) / 2, 10, 10);
      const kneeMesh = new THREE.Mesh(kneeGeo, pantsMat);
      kneeMesh.position.y = -0.46;
      kneeMesh.scale.set(1, 0.8, 1.1);
      legGroup.add(kneeMesh);

      // Calf / Shin (Lower Leg)
      const calfGeo = new THREE.CylinderGeometry((legWidth * 0.85) / 2, (legWidth * 0.72) / 2, 0.46, 14);
      const calfMesh = new THREE.Mesh(calfGeo, pantsMat);
      calfMesh.position.y = -0.69;
      calfMesh.castShadow = !isSoftwareGl;
      legGroup.add(calfMesh);

      // Sneaker / Shoe Group
      const shoeGroup = new THREE.Group();
      shoeGroup.position.set(0, -0.97, 0.04);

      // Shoe Upper
      const shoeUpperGeo = new THREE.BoxGeometry(0.12, 0.075, 0.22);
      const shoeUpper = new THREE.Mesh(shoeUpperGeo, shoeMainMat);
      shoeUpper.castShadow = !isSoftwareGl;
      shoeGroup.add(shoeUpper);

      // Rounded Toe Cap
      const toeGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.06, 12);
      const toeMesh = new THREE.Mesh(toeGeo, shoeMainMat);
      toeMesh.position.set(0, 0, 0.11);
      shoeGroup.add(toeMesh);

      // White Rubber Midsole / Outsole
      const soleGeo = new THREE.BoxGeometry(0.124, 0.024, 0.23);
      const soleMesh = new THREE.Mesh(soleGeo, shoeSoleMat);
      soleMesh.position.set(0, -0.042, 0.005);
      shoeGroup.add(soleMesh);

      legGroup.add(shoeGroup);
      return legGroup;
    };

    const leftLeg = createLeg(false);
    const rightLeg = createLeg(true);
    charGroup.add(leftLeg, rightLeg);

    // Shift whole group so soles rest flush on floor (y = 0.04)
    charGroup.position.y = 0.04;

    // =========================================================================
    // RENDER LOOP & INTERACTION (Idle Breathing & Orbit Rotation)
    // =========================================================================
    let frameId = 0;
    const clock = new THREE.Clock();

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      if (!interactive) return;
      isDraggingRef.current = true;
      isAutoSpinningRef.current = false;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      prevMouseXRef.current = clientX;
    };

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if (!interactive || !isDraggingRef.current) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const deltaX = clientX - prevMouseXRef.current;
      targetRotationYRef.current += deltaX * 0.012;
      prevMouseXRef.current = clientX;
    };

    const handlePointerUp = () => {
      isDraggingRef.current = false;
    };

    if (interactive) {
      container.addEventListener('mousedown', handlePointerDown);
      window.addEventListener('mousemove', handlePointerMove);
      window.addEventListener('mouseup', handlePointerUp);

      container.addEventListener('touchstart', handlePointerDown, { passive: true });
      window.addEventListener('touchmove', handlePointerMove, { passive: true });
      window.addEventListener('touchend', handlePointerUp);
    }

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Smooth rotational damping
      if (characterGroupRef.current) {
        if (isAutoSpinningRef.current && !isDraggingRef.current) {
          targetRotationYRef.current += 0.003;
        }
        characterGroupRef.current.rotation.y +=
          (targetRotationYRef.current - characterGroupRef.current.rotation.y) * 0.08;

        // Subtle idle breathing animation
        const breath = Math.sin(elapsed * 1.6) * 0.015;
        torsoGroup.position.y = 1.26 + breath * 0.5;
        torsoGroup.scale.set(1 + breath * 0.4, 1 + breath * 0.3, 1 + breath * 0.4);

        // Subtle arm idle sway
        armLGroup.rotation.z = 0.16 + Math.sin(elapsed * 1.6) * 0.015;
        armRGroup.rotation.z = -0.16 - Math.sin(elapsed * 1.6) * 0.015;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize observer
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
      if (interactive) {
        container.removeEventListener('mousedown', handlePointerDown);
        window.removeEventListener('mousemove', handlePointerMove);
        window.removeEventListener('mouseup', handlePointerUp);
        container.removeEventListener('touchstart', handlePointerDown);
        window.removeEventListener('touchmove', handlePointerMove);
        window.removeEventListener('touchend', handlePointerUp);
      }
      try {
        renderer.dispose();
        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
      } catch {}
    };
  }, [
    avatar,
    isFemale,
    skinColor,
    hairColor,
    outfitType,
    hairstyle,
    heightPreset,
    safeAvatar.pantsColor,
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
      title="Click and drag to rotate your 3D avatar 360°"
    >
      {interactive && (
        <div className="absolute bottom-2 right-2 pointer-events-none z-10">
          <span className="px-2 py-0.5 rounded-full bg-black/60 text-zinc-400 text-[9px] font-mono border border-white/10 backdrop-blur-sm">
            Drag to Rotate 360°
          </span>
        </div>
      )}
    </div>
  );
};
