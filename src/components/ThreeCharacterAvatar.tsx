/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
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
    hairstyle: 'peaky_cap',
    hairColor: '#18181b',
    outfit: 'corporate',
    pants: 'pinstripe',
    shoes: 'oxford',
    accessory: 'none',
  };

  const isFemale = safeAvatar.gender === 'female';
  const skinColor = safeAvatar.skinTone || '#8d5524';
  const hairColor = safeAvatar.hairColor || '#18181b';
  const outfitType = safeAvatar.outfit || 'corporate';
  const hairstyle = safeAvatar.hairstyle || 'peaky_cap';
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

    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 50);
    camera.position.set(0, 1.25, 3.9);
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
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // Studio 3-Point Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xfff7ed, 0x1c1917, 0.8);
    scene.add(hemiLight);

    // Warm Key Light (Front-Right)
    const keyLight = new THREE.DirectionalLight(0xfffaf0, 1.5);
    keyLight.position.set(2.4, 4.0, 3.2);
    keyLight.castShadow = !isSoftwareGl;
    if (!isSoftwareGl) {
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.bias = -0.0004;
      keyLight.shadow.normalBias = 0.02;
    }
    scene.add(keyLight);

    // Soft Cool Fill Light (Front-Left)
    const fillLight = new THREE.DirectionalLight(0xe0f2fe, 0.7);
    fillLight.position.set(-2.5, 2.8, 2.5);
    scene.add(fillLight);

    // Vivid Cyan/Sky-Blue Rim Light (Back-Left - Silhouette Highlight)
    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.15);
    rimLight.position.set(-2.8, 3.0, -3.0);
    scene.add(rimLight);

    // Subtle Amber Warm Rim (Back-Right)
    const warmRim = new THREE.DirectionalLight(0xf59e0b, 0.6);
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
      grad.addColorStop(0.45, 'rgba(0, 0, 0, 0.28)');
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
    // 3D PROCEDURAL CHARACTER MODEL (MATCHING USER'S DAPPER GENTLEMAN REFERENCE)
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
      color: skinToneObj.clone().lerp(new THREE.Color(0xb91c1c), 0.26),
      roughness: 0.45,
      metalness: 0.04,
    });

    const hairMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(hairColor),
      roughness: 0.88,
      metalness: 0.02,
    });

    // Peaky Tweed & Dapper Vest materials
    const tweedVestMat = new THREE.MeshStandardMaterial({
      color: 0x8a929a, // Tailored heather grey/charcoal tweed
      roughness: 0.72,
      metalness: 0.05,
    });

    const whiteShirtMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc, // Crisp white collared dress shirt
      roughness: 0.65,
      metalness: 0.02,
    });

    const redTieMat = new THREE.MeshStandardMaterial({
      color: 0x991b1b, // Deep crimson red silk necktie
      roughness: 0.38,
      metalness: 0.12,
    });

    const pinstripePantsMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b, // Dark navy tailored trousers
      roughness: 0.75,
      metalness: 0.04,
    });

    const oxfordShoeMat = new THREE.MeshStandardMaterial({
      color: 0x18181b, // Polished black leather dress shoes
      roughness: 0.35,
      metalness: 0.15,
    });

    const buttonMat = new THREE.MeshStandardMaterial({
      color: 0x27272a,
      roughness: 0.3,
      metalness: 0.6,
    });

    // Other outfit choices
    const isDapperOutfit = outfitType === 'corporate' || outfitType === 'peaky_dapper' || outfitType === 'designer';
    const isSenatorOutfit = outfitType === 'trad_senator' || outfitType === 'ankara';
    const isCasualOutfit = outfitType === 'casual';

    let shirtMat = isDapperOutfit ? whiteShirtMat : whiteShirtMat;
    let pantsMat = isDapperOutfit ? pinstripePantsMat : pinstripePantsMat;

    if (isSenatorOutfit) {
      shirtMat = new THREE.MeshStandardMaterial({ color: 0x7c2d12, roughness: 0.65 });
      pantsMat = new THREE.MeshStandardMaterial({ color: 0x7c2d12, roughness: 0.65 });
    } else if (isCasualOutfit) {
      shirtMat = new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.75 });
      pantsMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.8 });
    }

    // 1. Torso Group (Gender Proportions)
    const torsoGroup = new THREE.Group();
    torsoGroup.position.set(0, 1.26, 0);

    const chestWidth = isFemale ? 0.38 : 0.46;
    const waistWidth = isFemale ? 0.31 : 0.38;
    const hipWidth = isFemale ? 0.42 : 0.39;

    // Upper Chest Base (White Dress Shirt)
    const chestGeo = new THREE.CylinderGeometry(chestWidth / 2, waistWidth / 2, 0.36, 16);
    const chestMesh = new THREE.Mesh(chestGeo, whiteShirtMat);
    chestMesh.position.y = 0.16;
    chestMesh.castShadow = !isSoftwareGl;
    chestMesh.receiveShadow = !isSoftwareGl;
    torsoGroup.add(chestMesh);

    // TAILORED TWEED WAISTCOAT / VEST (As seen in the uploaded reference photo)
    if (isDapperOutfit) {
      // Vest body wrapped over shirt
      const vestGeo = new THREE.CylinderGeometry((chestWidth / 2) + 0.008, (waistWidth / 2) + 0.008, 0.32, 16);
      const vestMesh = new THREE.Mesh(vestGeo, tweedVestMat);
      vestMesh.position.y = 0.14;
      vestMesh.castShadow = !isSoftwareGl;
      torsoGroup.add(vestMesh);

      // V-neck cutout revealing white shirt & red tie
      const vCutGeo = new THREE.ConeGeometry(0.09, 0.22, 4);
      const vCutMat = whiteShirtMat;
      const vCutMesh = new THREE.Mesh(vCutGeo, vCutMat);
      vCutMesh.rotation.x = Math.PI;
      vCutMesh.position.set(0, 0.25, (chestWidth / 2) + 0.009);
      torsoGroup.add(vCutMesh);

      // RED SILK NECKTIE (Tucked neatly into the vest)
      const tieKnotGeo = new THREE.ConeGeometry(0.022, 0.038, 6);
      const tieKnot = new THREE.Mesh(tieKnotGeo, redTieMat);
      tieKnot.rotation.x = Math.PI;
      tieKnot.position.set(0, 0.31, (chestWidth / 2) + 0.012);
      torsoGroup.add(tieKnot);

      const tieBodyGeo = new THREE.BoxGeometry(0.032, 0.20, 0.008);
      const tieBody = new THREE.Mesh(tieBodyGeo, redTieMat);
      tieBody.position.set(0, 0.20, (chestWidth / 2) + 0.011);
      torsoGroup.add(tieBody);

      // Vest Buttons down the front
      for (let b = 0; b < 4; b++) {
        const btnGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.006, 8);
        const btnMesh = new THREE.Mesh(btnGeo, buttonMat);
        btnMesh.rotation.x = Math.PI / 2;
        btnMesh.position.set(0, 0.12 - b * 0.05, (waistWidth / 2) + 0.012);
        torsoGroup.add(btnMesh);
      }
    }

    // Shirt Collar Band & Wings
    const collarGeo = new THREE.TorusGeometry(0.09, 0.016, 8, 20);
    const collarMesh = new THREE.Mesh(collarGeo, whiteShirtMat);
    collarMesh.rotation.x = Math.PI / 2;
    collarMesh.position.set(0, 0.34, 0);
    torsoGroup.add(collarMesh);

    // Collar wings
    const collarWingGeo = new THREE.ConeGeometry(0.03, 0.05, 4);
    const collarWingL = new THREE.Mesh(collarWingGeo, whiteShirtMat);
    collarWingL.rotation.z = -0.5;
    collarWingL.position.set(-0.045, 0.33, 0.09);
    const collarWingR = new THREE.Mesh(collarWingGeo, whiteShirtMat);
    collarWingR.rotation.z = 0.5;
    collarWingR.position.set(0.045, 0.33, 0.09);
    torsoGroup.add(collarWingL, collarWingR);

    // Female bust curvature if female
    if (isFemale) {
      const bustGeo = new THREE.SphereGeometry(0.088, 14, 14);
      const bustL = new THREE.Mesh(bustGeo, isDapperOutfit ? tweedVestMat : shirtMat);
      bustL.position.set(-0.085, 0.16, 0.13);
      bustL.scale.set(1.0, 0.9, 1.15);
      const bustR = new THREE.Mesh(bustGeo, isDapperOutfit ? tweedVestMat : shirtMat);
      bustR.position.set(0.085, 0.16, 0.13);
      bustR.scale.set(1.0, 0.9, 1.15);
      torsoGroup.add(bustL, bustR);
    }

    // Pelvis / High-Waisted Tailored Trousers Top
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

    // Sculpted Jaw & Chin
    const jawGeo = new THREE.CylinderGeometry(0.13, isFemale ? 0.085 : 0.115, 0.15, 14);
    const jawMesh = new THREE.Mesh(jawGeo, skinMat);
    jawMesh.position.set(0, -0.065, 0.035);
    headGroup.add(jawMesh);

    // Defined Nose Bridge
    const noseGeo = new THREE.ConeGeometry(0.026, 0.072, 8);
    const noseMesh = new THREE.Mesh(noseGeo, skinMat);
    noseMesh.rotation.x = Math.PI / 2.2;
    noseMesh.position.set(0, -0.01, 0.18);
    headGroup.add(noseMesh);

    // Expressive 3D Eyes
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

    // Ears with Lobes
    const earGeo = new THREE.SphereGeometry(0.042, 10, 10);
    earGeo.scale(0.35, 1.15, 0.85);
    const earL = new THREE.Mesh(earGeo, skinMat);
    earL.position.set(-0.168, 0.01, -0.01);
    const earR = new THREE.Mesh(earGeo, skinMat);
    earR.position.set(0.168, 0.01, -0.01);
    headGroup.add(earL, earR);

    // =========================================================================
    // 3. 3D HAIRSTYLES (INCLUDING FLAT / PEAKY CAP LIKE THE UPLOADED PHOTO!)
    // AFRO SITS NEATLY ON TOP & NEVER OBSCOURES THE FOREHEAD OR FACE
    // =========================================================================
    const hairGroup = new THREE.Group();

    if (hairstyle === 'peaky_cap' || safeAvatar.accessory === 'peaky_cap') {
      // 3D FLAT CAP / PEAKY BLINDER CAP (Matches reference image perfectly!)
      const capMat = new THREE.MeshStandardMaterial({
        color: 0x475569, // Slate/charcoal tweed wool
        roughness: 0.82,
        metalness: 0.03,
      });

      // Cap Crown (Puffed low rounded dome)
      const capCrownGeo = new THREE.SphereGeometry(0.19, 18, 18);
      capCrownGeo.scale(1.15, 0.55, 1.25);
      const capCrown = new THREE.Mesh(capCrownGeo, capMat);
      capCrown.rotation.x = -0.15;
      capCrown.position.set(0, 0.14, -0.01);
      capCrown.castShadow = !isSoftwareGl;
      hairGroup.add(capCrown);

      // Stiff Curved Visor / Brim
      const brimGeo = new THREE.CylinderGeometry(0.17, 0.18, 0.015, 16, 1, false, 0, Math.PI);
      const brimMesh = new THREE.Mesh(brimGeo, capMat);
      brimMesh.rotation.x = 0.28;
      brimMesh.rotation.y = Math.PI;
      brimMesh.position.set(0, 0.09, 0.12);
      hairGroup.add(brimMesh);

      // Top Button
      const btnGeo = new THREE.SphereGeometry(0.016, 8, 8);
      const capBtn = new THREE.Mesh(btnGeo, capMat);
      capBtn.position.set(0, 0.23, -0.02);
      hairGroup.add(capBtn);
    } else if (hairstyle === 'afro') {
      // 3D COMPACT AFRO CROWN (Elevated high above forehead, clear face!)
      const afroBaseGeo = new THREE.SphereGeometry(0.20, 18, 18);
      afroBaseGeo.scale(1.1, 1.0, 1.05);
      const afroMesh = new THREE.Mesh(afroBaseGeo, hairMat);
      // Lifted up & back so forehead and eyes remain 100% visible
      afroMesh.position.set(0, 0.16, -0.04);
      hairGroup.add(afroMesh);

      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const bumpGeo = new THREE.SphereGeometry(0.08, 10, 10);
        const bumpMesh = new THREE.Mesh(bumpGeo, hairMat);
        bumpMesh.position.set(
          Math.cos(angle) * 0.13,
          0.19 + Math.sin(angle) * 0.05,
          Math.sin(angle) * 0.13 - 0.04
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
      // Dreads/Braids falling backward and sideways
      const capGeo = new THREE.SphereGeometry(0.176, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.52);
      const cap = new THREE.Mesh(capGeo, hairMat);
      hairGroup.add(cap);

      const strandCount = 16;
      for (let b = 0; b < strandCount; b++) {
        const angle = (b / strandCount) * Math.PI * 1.5 + Math.PI * 0.75;
        const length = 0.30 + (b % 3) * 0.04;
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
    } else if (hairstyle === 'gele') {
      // Traditional Nigerian Gele Head-Tie
      const geleMat = new THREE.MeshStandardMaterial({
        color: 0xb91c1c,
        roughness: 0.5,
        metalness: 0.2,
      });
      const geleCrownGeo = new THREE.CylinderGeometry(0.24, 0.18, 0.22, 18);
      const geleCrown = new THREE.Mesh(geleCrownGeo, geleMat);
      geleCrown.position.set(0, 0.16, 0);
      hairGroup.add(geleCrown);
    } else {
      // Clean buzz cut
      const buzzGeo = new THREE.SphereGeometry(0.174, 18, 18, 0, Math.PI * 2, 0, Math.PI * 0.50);
      buzzGeo.scale(1.01, 1.11, 1.03);
      const buzzMesh = new THREE.Mesh(buzzGeo, hairMat);
      hairGroup.add(buzzMesh);
    }

    headGroup.add(hairGroup);
    charGroup.add(headGroup);

    // =========================================================================
    // 4. NATURAL RELAXED ARMS (Resting alongside body at ~12°, NOT T-Pose)
    // White shirt sleeves with cuffs + natural curved hands
    // =========================================================================
    const armWidth = isFemale ? 0.082 : 0.098;
    const shoulderSpan = (chestWidth / 2) + 0.055;

    // Sleeve material: White dress shirt
    const sleeveMat = whiteShirtMat;

    // Helper for structured arm
    const createArm = (isRight: boolean) => {
      const armGroup = new THREE.Group();
      armGroup.position.set(isRight ? shoulderSpan : -shoulderSpan, 1.40, 0);

      // Deltoid
      const deltoidGeo = new THREE.SphereGeometry(armWidth * 0.7, 10, 10);
      const deltoid = new THREE.Mesh(deltoidGeo, sleeveMat);
      armGroup.add(deltoid);

      // Upper Arm (White sleeve)
      const upperArmGeo = new THREE.CylinderGeometry(armWidth / 2, (armWidth * 0.88) / 2, 0.32, 12);
      const upperArm = new THREE.Mesh(upperArmGeo, sleeveMat);
      upperArm.position.y = -0.15;
      armGroup.add(upperArm);

      // Forearm (White sleeve extending down to cuff)
      const forearmGeo = new THREE.CylinderGeometry((armWidth * 0.88) / 2, (armWidth * 0.74) / 2, 0.30, 12);
      const forearm = new THREE.Mesh(forearmGeo, sleeveMat);
      forearm.position.y = -0.42;
      armGroup.add(forearm);

      // Shirt Cuff & Button
      const cuffGeo = new THREE.CylinderGeometry((armWidth * 0.76) / 2, (armWidth * 0.76) / 2, 0.04, 12);
      const cuff = new THREE.Mesh(cuffGeo, whiteShirtMat);
      cuff.position.y = -0.54;
      armGroup.add(cuff);

      // Hand (Skin tone with subtle thumb)
      const handGeo = new THREE.SphereGeometry(0.042, 10, 10);
      handGeo.scale(0.8, 1.25, 0.95);
      const hand = new THREE.Mesh(handGeo, skinMat);
      hand.position.y = -0.61;
      armGroup.add(hand);

      // Relaxed angle along the body
      armGroup.rotation.z = isRight ? -0.12 : 0.12;
      armGroup.rotation.x = 0.04;

      return armGroup;
    };

    const armLGroup = createArm(false);
    const armRGroup = createArm(true);
    charGroup.add(armLGroup, armRGroup);

    // =========================================================================
    // 5. ANATOMICAL LEGS & OXFORD DRESS SHOES (High-waisted tailored trousers)
    // =========================================================================
    const legWidth = isFemale ? 0.11 : 0.13;
    const legSpacing = isFemale ? 0.115 : 0.135;

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

      // Oxford Dress Shoes (Polished black leather with defined heel & welt)
      const shoeGroup = new THREE.Group();
      shoeGroup.position.set(0, -0.97, 0.04);

      // Shoe Upper
      const shoeUpperGeo = new THREE.BoxGeometry(0.115, 0.075, 0.22);
      const shoeUpper = new THREE.Mesh(shoeUpperGeo, oxfordShoeMat);
      shoeUpper.castShadow = !isSoftwareGl;
      shoeGroup.add(shoeUpper);

      // Tapered Dress Shoe Toe Cap
      const toeGeo = new THREE.CylinderGeometry(0.055, 0.058, 0.065, 12);
      const toeMesh = new THREE.Mesh(toeGeo, oxfordShoeMat);
      toeMesh.position.set(0, 0, 0.11);
      shoeGroup.add(toeMesh);

      // Polished Leather Outsole & Heel
      const soleGeo = new THREE.BoxGeometry(0.12, 0.02, 0.23);
      const soleMesh = new THREE.Mesh(soleGeo, oxfordShoeMat);
      soleMesh.position.set(0, -0.042, 0.005);
      shoeGroup.add(soleMesh);

      // Stacked Dress Heel
      const heelGeo = new THREE.BoxGeometry(0.11, 0.02, 0.07);
      const heelMesh = new THREE.Mesh(heelGeo, oxfordShoeMat);
      heelMesh.position.set(0, -0.05, -0.07);
      shoeGroup.add(heelMesh);

      legGroup.add(shoeGroup);
      return legGroup;
    };

    const leftLeg = createLeg(false);
    const rightLeg = createLeg(true);
    charGroup.add(leftLeg, rightLeg);

    charGroup.position.y = 0.04;

    // =========================================================================
    // 6. RENDER LOOP & 360-DEGREE ORBIT INTERACTION
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

      if (characterGroupRef.current) {
        if (isAutoSpinningRef.current && !isDraggingRef.current) {
          targetRotationYRef.current += 0.003;
        }
        characterGroupRef.current.rotation.y +=
          (targetRotationYRef.current - characterGroupRef.current.rotation.y) * 0.08;

        // Subtle idle breathing
        const breath = Math.sin(elapsed * 1.8) * 0.012;
        torsoGroup.position.y = 1.26 + breath * 0.5;
        torsoGroup.scale.set(1 + breath * 0.3, 1 + breath * 0.2, 1 + breath * 0.3);

        // Subtle arm idle sway
        armLGroup.rotation.z = 0.12 + Math.sin(elapsed * 1.8) * 0.012;
        armRGroup.rotation.z = -0.12 - Math.sin(elapsed * 1.8) * 0.012;
      }

      renderer.render(scene, camera);
    };

    animate();

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
    safeAvatar.accessory,
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
