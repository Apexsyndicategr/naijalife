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
  const pantsType = safeAvatar.pants || 'jeans';
  const shoesType = safeAvatar.shoes || 'sneakers';
  const hairstyle = safeAvatar.hairstyle || 'fade';
  const heightPreset = safeAvatar.height || 'average';

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect software WebGL guard
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

    const width = container.clientWidth || 300;
    const height = container.clientHeight || 450;

    // Scene & Camera
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    camera.position.set(0, 1.45, 3.8);
    camera.lookAt(0, 1.15, 0);

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

    // Studio Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xfff5e6, 0x1f2937, 0.85);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfffaf0, 1.35);
    keyLight.position.set(2.5, 4.0, 3.5);
    keyLight.castShadow = !isSoftwareGl;
    if (!isSoftwareGl) {
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.7);
    rimLight.position.set(-3.0, 3.2, -2.5);
    scene.add(rimLight);

    // Soft Radial Contact Shadow Grounding Plane
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 256;
    shadowCanvas.height = 256;
    const sCtx = shadowCanvas.getContext('2d');
    if (sCtx) {
      const grad = sCtx.createRadialGradient(128, 128, 10, 128, 128, 120);
      grad.addColorStop(0, 'rgba(0, 0, 0, 0.55)');
      grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.25)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      sCtx.fillStyle = grad;
      sCtx.fillRect(0, 0, 256, 256);
    }
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowGeo = new THREE.PlaneGeometry(1.4, 1.4);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.85,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = 0.002;
    scene.add(shadowMesh);

    // =========================================================================
    // 3D PROCEDURAL CHARACTER MESH BUILDER
    // Relaxed Natural Standing Posture (Arms naturally relaxed down, NOT T-Pose)
    // =========================================================================
    const charGroup = new THREE.Group();
    characterGroupRef.current = charGroup;
    scene.add(charGroup);

    // Height scale
    const heightScaleY =
      heightPreset === 'short'
        ? 0.93
        : heightPreset === 'tall'
        ? 1.05
        : heightPreset === 'towering'
        ? 1.10
        : 1.0;
    charGroup.scale.set(1, heightScaleY, 1);

    // Shared Materials
    const skinMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(skinColor),
      roughness: 0.62,
      metalness: 0.04,
    });

    const hairMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(hairColor),
      roughness: 0.85,
      metalness: 0.05,
    });

    // Outfit Materials based on selection (4 starter non-expensive clothes)
    let shirtColorHex = 0xffffff; // default white tee
    let shirtRoughness = 0.8;
    let pantsColorHex = 0x1e3a8a; // default blue jeans
    let pantsRoughness = 0.85;

    if (outfitType === 'corporate') {
      shirtColorHex = 0x2563eb; // Royal blue fitted polo
      pantsColorHex = 0xd97706; // Khaki / beige chinos
    } else if (outfitType === 'casual') {
      shirtColorHex = 0x059669; // Forest green cotton tee
      pantsColorHex = 0x18181b; // Black casual joggers
    } else if (outfitType === 'ankara' || outfitType === 'trad_senator') {
      shirtColorHex = 0x7c2d12; // Rich Ankara print rust tone
      pantsColorHex = 0x7c2d12; // Matching Ankara trousers
    } else {
      // streetwear / white tee
      shirtColorHex = 0xf8fafc;
      pantsColorHex = 0x1e3a8a;
    }

    if (safeAvatar.pantsColor) {
      try {
        pantsColorHex = new THREE.Color(safeAvatar.pantsColor).getHex();
      } catch {}
    }

    const shirtMat = new THREE.MeshStandardMaterial({
      color: shirtColorHex,
      roughness: shirtRoughness,
      metalness: 0.02,
    });

    const pantsMat = new THREE.MeshStandardMaterial({
      color: pantsColorHex,
      roughness: pantsRoughness,
      metalness: 0.02,
    });

    const shoeMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.4,
      metalness: 0.1,
    });

    // 1. Torso / Upper Body (Gender-Differentiated Anatomy)
    // Male: Broader upper chest, tapering down
    // Female: Narrower shoulders, fitted waist, feminine bust curvature
    const torsoGroup = new THREE.Group();
    torsoGroup.position.set(0, 1.25, 0);

    const chestWidth = isFemale ? 0.36 : 0.44;
    const waistWidth = isFemale ? 0.30 : 0.38;
    const hipWidth = isFemale ? 0.40 : 0.38;

    const chestGeo = new THREE.CylinderGeometry(chestWidth / 2, waistWidth / 2, 0.35, 16);
    const chestMesh = new THREE.Mesh(chestGeo, shirtMat);
    chestMesh.position.y = 0.15;
    chestMesh.castShadow = !isSoftwareGl;
    chestMesh.receiveShadow = !isSoftwareGl;
    torsoGroup.add(chestMesh);

    // Female bust curvature
    if (isFemale) {
      const bustGeo = new THREE.SphereGeometry(0.085, 12, 12);
      const bustL = new THREE.Mesh(bustGeo, shirtMat);
      bustL.position.set(-0.08, 0.14, 0.12);
      bustL.scale.set(1, 0.85, 1.1);
      const bustR = new THREE.Mesh(bustGeo, shirtMat);
      bustR.position.set(0.08, 0.14, 0.12);
      bustR.scale.set(1, 0.85, 1.1);
      torsoGroup.add(bustL, bustR);
    }

    // Lower Torso / Pelvis
    const pelvisGeo = new THREE.CylinderGeometry(waistWidth / 2, hipWidth / 2, 0.22, 16);
    const pelvisMesh = new THREE.Mesh(pelvisGeo, pantsMat);
    pelvisMesh.position.y = -0.12;
    pelvisMesh.castShadow = !isSoftwareGl;
    torsoGroup.add(pelvisMesh);

    charGroup.add(torsoGroup);

    // 2. Neck & Head
    const neckGeo = new THREE.CylinderGeometry(0.075, 0.085, 0.12, 12);
    const neckMesh = new THREE.Mesh(neckGeo, skinMat);
    neckMesh.position.set(0, 1.55, 0);
    neckMesh.castShadow = !isSoftwareGl;
    charGroup.add(neckMesh);

    // Head
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.74, 0);

    // Cranium
    const headGeo = new THREE.SphereGeometry(0.165, 20, 20);
    headGeo.scale(1, 1.12, 1.05);
    const headMesh = new THREE.Mesh(headGeo, skinMat);
    headMesh.castShadow = !isSoftwareGl;
    headGroup.add(headMesh);

    // Jawline
    const jawGeo = new THREE.CylinderGeometry(0.12, isFemale ? 0.08 : 0.11, 0.14, 12);
    const jawMesh = new THREE.Mesh(jawGeo, skinMat);
    jawMesh.position.set(0, -0.06, 0.03);
    headGroup.add(jawMesh);

    // Facial Features: Nose, Ears, Eyes, Lips
    const noseGeo = new THREE.ConeGeometry(0.026, 0.065, 8);
    const noseMesh = new THREE.Mesh(noseGeo, skinMat);
    noseMesh.rotation.x = Math.PI / 2.2;
    noseMesh.position.set(0, -0.01, 0.175);
    headGroup.add(noseMesh);

    // Eyes
    const eyeWhiteGeo = new THREE.SphereGeometry(0.025, 8, 8);
    const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc });
    const pupilGeo = new THREE.SphereGeometry(0.014, 8, 8);
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x09090b });

    const eyeL = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat);
    eyeL.position.set(-0.055, 0.03, 0.15);
    eyeL.scale.set(1.2, 0.7, 0.5);
    const pupilL = new THREE.Mesh(pupilGeo, pupilMat);
    pupilL.position.set(-0.055, 0.03, 0.165);

    const eyeR = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat);
    eyeR.position.set(0.055, 0.03, 0.15);
    eyeR.scale.set(1.2, 0.7, 0.5);
    const pupilR = new THREE.Mesh(pupilGeo, pupilMat);
    pupilR.position.set(0.055, 0.03, 0.165);

    headGroup.add(eyeL, pupilL, eyeR, pupilR);

    // Eyebrows
    const browGeo = new THREE.BoxGeometry(0.045, 0.009, 0.015);
    const browMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(hairColor), roughness: 0.9 });
    const browL = new THREE.Mesh(browGeo, browMat);
    browL.position.set(-0.055, 0.062, 0.162);
    browL.rotation.z = 0.06;
    const browR = new THREE.Mesh(browGeo, browMat);
    browR.position.set(0.055, 0.062, 0.162);
    browR.rotation.z = -0.06;
    headGroup.add(browL, browR);

    // Ears
    const earGeo = new THREE.SphereGeometry(0.038, 8, 8);
    earGeo.scale(0.4, 1.1, 0.8);
    const earL = new THREE.Mesh(earGeo, skinMat);
    earL.position.set(-0.165, 0.01, -0.01);
    const earR = new THREE.Mesh(earGeo, skinMat);
    earR.position.set(0.165, 0.01, -0.01);
    headGroup.add(earL, earR);

    // =========================================================================
    // 3. 3D HAIRSTYLES (CRUCIALLY PLACED ABOVE FOREHEAD - NEVER COVERING FACE!)
    // =========================================================================
    const hairGroup = new THREE.Group();

    if (hairstyle === 'afro') {
      // Volumetric Afro Crown sitting securely atop and around skull, well above brow!
      const afroBaseGeo = new THREE.SphereGeometry(0.22, 16, 16);
      afroBaseGeo.scale(1.15, 1.05, 1.15);
      const afroMesh = new THREE.Mesh(afroBaseGeo, hairMat);
      // Positioned up and back on the cranium so hairline is cleanly above brow
      afroMesh.position.set(0, 0.12, -0.03);
      hairGroup.add(afroMesh);

      // Fluffy textured bumps for authentic afro density
      for (let i = 0; i < 7; i++) {
        const angle = (i / 7) * Math.PI * 2;
        const bumpGeo = new THREE.SphereGeometry(0.09, 10, 10);
        const bumpMesh = new THREE.Mesh(bumpGeo, hairMat);
        bumpMesh.position.set(
          Math.cos(angle) * 0.14,
          0.16 + Math.sin(angle) * 0.05,
          Math.sin(angle) * 0.14 - 0.03
        );
        hairGroup.add(bumpMesh);
      }
    } else if (hairstyle === 'fade') {
      // Low / Mid Fade: Clean cap hugging scalp closely with crisp edge
      const fadeGeo = new THREE.SphereGeometry(0.174, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.52);
      fadeGeo.scale(1.02, 1.12, 1.04);
      const fadeMesh = new THREE.Mesh(fadeGeo, hairMat);
      fadeMesh.position.set(0, 0.01, 0);
      hairGroup.add(fadeMesh);
    } else if (hairstyle === 'waves') {
      // 360 Waves: Tight cap with concentric wave rings
      const waveCapGeo = new THREE.SphereGeometry(0.174, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.55);
      waveCapGeo.scale(1.02, 1.12, 1.04);
      const waveCap = new THREE.Mesh(waveCapGeo, hairMat);
      hairGroup.add(waveCap);

      for (let w = 0; w < 4; w++) {
        const ringGeo = new THREE.TorusGeometry(0.12 - w * 0.02, 0.012, 6, 16);
        const ringMesh = new THREE.Mesh(ringGeo, hairMat);
        ringMesh.rotation.x = Math.PI / 2;
        ringMesh.position.set(0, 0.14 - w * 0.03, -0.01);
        hairGroup.add(ringMesh);
      }
    } else if (hairstyle === 'braids' || hairstyle === 'dreads' || hairstyle === 'locs') {
      // Scalp crown + Hanging braided strands down shoulders
      const capGeo = new THREE.SphereGeometry(0.175, 14, 14, 0, Math.PI * 2, 0, Math.PI * 0.52);
      const cap = new THREE.Mesh(capGeo, hairMat);
      hairGroup.add(cap);

      // Hanging dread/braid cylinders
      const braidCount = 14;
      for (let b = 0; b < braidCount; b++) {
        const angle = (b / braidCount) * Math.PI * 1.5 + Math.PI * 0.75;
        const length = 0.28 + (b % 3) * 0.04;
        const strandGeo = new THREE.CylinderGeometry(0.014, 0.01, length, 6);
        const strandMesh = new THREE.Mesh(strandGeo, hairMat);
        const radius = 0.155;
        strandMesh.position.set(
          Math.cos(angle) * radius,
          -length / 2 + 0.02,
          Math.sin(angle) * radius
        );
        strandMesh.rotation.z = Math.cos(angle) * -0.15;
        hairGroup.add(strandMesh);
      }
    } else {
      // Buzz cut
      const buzzGeo = new THREE.SphereGeometry(0.172, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.48);
      buzzGeo.scale(1.01, 1.10, 1.03);
      const buzzMesh = new THREE.Mesh(buzzGeo, hairMat);
      hairGroup.add(buzzMesh);
    }

    headGroup.add(hairGroup);
    charGroup.add(headGroup);

    // =========================================================================
    // 4. NATURAL RELAXED ARMS (Relaxed down naturally at sides, NOT T-Pose)
    // =========================================================================
    const armWidth = isFemale ? 0.08 : 0.095;
    const shoulderSpan = (chestWidth / 2) + 0.05;

    // Left Arm (Relaxed slightly down and forward)
    const armLGroup = new THREE.Group();
    armLGroup.position.set(-shoulderSpan, 1.38, 0);

    const upperArmGeo = new THREE.CylinderGeometry(armWidth / 2, (armWidth * 0.85) / 2, 0.32, 10);
    const upperArmL = new THREE.Mesh(upperArmGeo, shirtMat);
    upperArmL.position.y = -0.14;
    armLGroup.add(upperArmL);

    // Forearm & Hand (Skin)
    const forearmGeo = new THREE.CylinderGeometry((armWidth * 0.85) / 2, (armWidth * 0.75) / 2, 0.30, 10);
    const forearmL = new THREE.Mesh(forearmGeo, skinMat);
    forearmL.position.y = -0.42;
    armLGroup.add(forearmL);

    const handGeo = new THREE.SphereGeometry(0.045, 8, 8);
    handGeo.scale(0.8, 1.2, 0.9);
    const handL = new THREE.Mesh(handGeo, skinMat);
    handL.position.y = -0.60;
    armLGroup.add(handL);

    // Natural resting arm angle: relaxed downwards at ~10° along torso
    armLGroup.rotation.z = 0.14;
    armLGroup.rotation.x = 0.06;
    charGroup.add(armLGroup);

    // Right Arm (Relaxed slightly down and forward)
    const armRGroup = new THREE.Group();
    armRGroup.position.set(shoulderSpan, 1.38, 0);

    const upperArmR = new THREE.Mesh(upperArmGeo, shirtMat);
    upperArmR.position.y = -0.14;
    armRGroup.add(upperArmR);

    const forearmR = new THREE.Mesh(forearmGeo, skinMat);
    forearmR.position.y = -0.42;
    armRGroup.add(forearmR);

    const handR = new THREE.Mesh(handGeo, skinMat);
    handR.position.y = -0.60;
    armRGroup.add(handR);

    armRGroup.rotation.z = -0.14;
    armRGroup.rotation.x = 0.06;
    charGroup.add(armRGroup);

    // =========================================================================
    // 5. LEGS & SHOES (Natural Balanced Stand)
    // =========================================================================
    const legWidth = isFemale ? 0.105 : 0.125;
    const legSpacing = isFemale ? 0.11 : 0.13;

    // Left Leg
    const legLGroup = new THREE.Group();
    legLGroup.position.set(-legSpacing, 1.05, 0);

    const legGeo = new THREE.CylinderGeometry(legWidth / 2, (legWidth * 0.8) / 2, 0.95, 12);
    const legL = new THREE.Mesh(legGeo, pantsMat);
    legL.position.y = -0.48;
    legL.castShadow = !isSoftwareGl;
    legLGroup.add(legL);

    // Left Shoe
    const shoeGeo = new THREE.BoxGeometry(0.12, 0.09, 0.22);
    const shoeL = new THREE.Mesh(shoeGeo, shoeMat);
    shoeL.position.set(0, -0.98, 0.04);
    shoeL.castShadow = !isSoftwareGl;
    legLGroup.add(shoeL);

    charGroup.add(legLGroup);

    // Right Leg
    const legRGroup = new THREE.Group();
    legRGroup.position.set(legSpacing, 1.05, 0);

    const legR = new THREE.Mesh(legGeo, pantsMat);
    legR.position.y = -0.48;
    legR.castShadow = !isSoftwareGl;
    legRGroup.add(legR);

    // Right Shoe
    const shoeR = new THREE.Mesh(shoeGeo, shoeMat);
    shoeR.position.set(0, -0.98, 0.04);
    shoeR.castShadow = !isSoftwareGl;
    legRGroup.add(shoeR);

    charGroup.add(legRGroup);

    // Shift whole group so feet stand flush on ground at y = 0
    charGroup.position.y = 0.02;

    // =========================================================================
    // RENDER LOOP & INTERACTION (Smooth Damping & Idle Breathing)
    // =========================================================================
    let frameId = 0;
    const clock = new THREE.Clock();

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      if (!interactive) return;
      isDraggingRef.current = true;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      prevMouseXRef.current = clientX;
    };

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if (!interactive || !isDraggingRef.current) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const deltaX = clientX - prevMouseXRef.current;
      prevMouseXRef.current = clientX;
      targetRotationYRef.current += deltaX * 0.012;
    };

    const handlePointerUp = () => {
      isDraggingRef.current = false;
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    domEl.addEventListener('touchstart', handlePointerDown, { passive: true });
    window.addEventListener('touchmove', handlePointerMove, { passive: true });
    window.addEventListener('touchend', handlePointerUp);

    const renderTick = () => {
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Smooth damped rotation towards target
      if (charGroup) {
        charGroup.rotation.y = THREE.MathUtils.damp(
          charGroup.rotation.y,
          targetRotationYRef.current,
          10,
          delta
        );

        // Subtle realistic idle breathing motion
        const breath = Math.sin(time * 2.2) * 0.005;
        torsoGroup.position.y = 1.25 + breath;
        headGroup.position.y = 1.74 + breath * 1.2;
        armLGroup.position.y = 1.38 + breath;
        armRGroup.position.y = 1.38 + breath;
      }

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(renderTick);
    };

    frameId = requestAnimationFrame(renderTick);

    // Handle Resize
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth || 300;
      const newH = container.clientHeight || 450;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      domEl.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      domEl.removeEventListener('touchstart', handlePointerDown);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);

      // Clean disposal
      renderer.dispose();
      if (domEl.parentNode) {
        domEl.parentNode.removeChild(domEl);
      }
    };
  }, [
    isFemale,
    skinColor,
    hairColor,
    outfitType,
    pantsType,
    shoesType,
    hairstyle,
    heightPreset,
    interactive,
  ]);

  const sizeClasses = {
    sm: 'w-16 h-24',
    md: 'w-36 h-48 sm:w-44 sm:h-60',
    lg: 'w-48 h-64 sm:w-56 sm:h-72',
    xl: 'w-64 h-80 sm:w-72 sm:h-96',
    full: 'w-full h-80 sm:h-96',
  };

  return (
    <div
      ref={mountRef}
      className={`relative flex items-center justify-center overflow-hidden select-none cursor-grab active:cursor-grabbing ${sizeClasses[size]} ${className}`}
      title={interactive ? 'Click and drag to rotate your 3D avatar 360°' : undefined}
    >
      {interactive && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-black/60 border border-white/10 text-[9px] font-mono text-zinc-300 pointer-events-none z-10 backdrop-blur-xs flex items-center gap-1 shadow">
          <span>🔄</span>
          <span>Drag to Rotate 3D</span>
        </div>
      )}
    </div>
  );
};
