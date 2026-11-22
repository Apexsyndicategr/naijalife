/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

export interface PetViewport3DProps {
  breedId: string;
  energy?: number;
  happiness?: number;
}

function buildPetMesh(breedId: string): { root: THREE.Group; tail?: THREE.Object3D; head?: THREE.Object3D } {
  const root = new THREE.Group();

  if (breedId === 'african_grey') {
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x9ca3af, roughness: 0.55 });
    const wingMat = new THREE.MeshStandardMaterial({ color: 0x6b7280, roughness: 0.6 });
    const tailMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.45 });
    const beakMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.35 });

    const perch = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 1.4, 12),
      new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 })
    );
    perch.rotation.z = Math.PI / 2;
    perch.position.y = 0.38;
    root.add(perch);

    const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.24, 0.36, 8, 16), bodyMat);
    torso.position.set(0, 0.72, 0);
    torso.rotation.x = 0.2;
    root.add(torso);

    const head = new THREE.Group();
    head.position.set(0, 1.12, 0.08);
    const skull = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 16), bodyMat);
    const beak = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.2, 8), beakMat);
    beak.rotation.x = Math.PI / 2.2;
    beak.position.set(0, -0.02, 0.2);
    head.add(skull, beak);
    root.add(head);

    const wingL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.42, 0.26), wingMat);
    wingL.position.set(-0.25, 0.74, -0.02);
    const wingR = wingL.clone();
    wingR.position.x = 0.25;
    root.add(wingL, wingR);

    const tail = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.45, 8), tailMat);
    tail.rotation.x = -Math.PI * 0.8;
    tail.position.set(0, 0.42, -0.25);
    root.add(tail);

    return { root, tail, head };
  }

  if (breedId === 'holland_lop') {
    const furMat = new THREE.MeshStandardMaterial({ color: 0xf5f5f4, roughness: 0.75 });
    const innerEarMat = new THREE.MeshStandardMaterial({ color: 0xfda4af, roughness: 0.7 });

    const body = new THREE.Mesh(new THREE.SphereGeometry(0.38, 18, 16), furMat);
    body.scale.set(0.95, 0.85, 1.25);
    body.position.set(0, 0.34, 0);
    root.add(body);

    const head = new THREE.Group();
    head.position.set(0, 0.62, 0.36);
    const skull = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 16), furMat);
    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.04, 10, 10), innerEarMat);
    nose.position.set(0, -0.03, 0.23);

    const earL = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.28, 6, 10), furMat);
    earL.position.set(-0.22, -0.02, -0.02);
    earL.rotation.z = 0.35;
    const earR = earL.clone();
    earR.position.x = 0.22;
    earR.rotation.z = -0.35;

    head.add(skull, nose, earL, earR);
    root.add(head);

    const tail = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), furMat);
    tail.position.set(0, 0.35, -0.48);
    root.add(tail);

    return { root, tail, head };
  }

  if (breedId === 'siamese_cat') {
    const creamMat = new THREE.MeshStandardMaterial({ color: 0xfde68a, roughness: 0.65 });
    const pointMat = new THREE.MeshStandardMaterial({ color: 0x3f2e21, roughness: 0.6 });
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.2 });

    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 0.62, 8, 16), creamMat);
    body.rotation.x = Math.PI / 2;
    body.position.set(0, 0.44, 0);
    root.add(body);

    [[-0.14, 0.28], [0.14, 0.28], [-0.14, -0.28], [0.14, -0.28]].forEach(([x, z]) => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.045, 0.42, 10), pointMat);
      leg.position.set(x, 0.21, z);
      root.add(leg);
    });

    const head = new THREE.Group();
    head.position.set(0, 0.68, 0.42);
    const skull = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 16), creamMat);
    const mask = new THREE.Mesh(new THREE.SphereGeometry(0.14, 14, 14), pointMat);
    mask.position.set(0, -0.02, 0.1);
    const earL = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.18, 6), pointMat);
    earL.position.set(-0.12, 0.2, 0);
    const earR = earL.clone();
    earR.position.x = 0.12;
    const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), eyeMat);
    eyeL.position.set(-0.07, 0.04, 0.19);
    const eyeR = eyeL.clone();
    eyeR.position.x = 0.07;
    head.add(skull, mask, earL, earR, eyeL, eyeR);
    root.add(head);

    const tail = new THREE.Mesh(new THREE.CapsuleGeometry(0.04, 0.55, 6, 10), pointMat);
    tail.position.set(0, 0.66, -0.45);
    tail.rotation.x = -0.5;
    root.add(tail);

    return { root, tail, head };
  }

  // Articulated Dog Breeds (Boerboel Mastiff, German Shepherd, Siberian Husky)
  const palette =
    breedId === 'siberian_husky'
      ? { coat: 0xe5e7eb, accent: 0x374151, scale: 0.95 }
      : breedId === 'boerboel_mastiff'
      ? { coat: 0xb45309, accent: 0x1c1917, scale: 1.15 }
      : { coat: 0x92400e, accent: 0x18181b, scale: 1.02 };

  const coatMat = new THREE.MeshStandardMaterial({ color: palette.coat, roughness: 0.7 });
  const accentMat = new THREE.MeshStandardMaterial({ color: palette.accent, roughness: 0.65 });

  root.scale.setScalar(palette.scale);

  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.27, 0.7, 8, 16), coatMat);
  torso.rotation.x = Math.PI / 2;
  torso.position.set(0, 0.52, 0);
  root.add(torso);

  const saddle = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.18, 0.45), accentMat);
  saddle.position.set(0, 0.66, -0.02);
  root.add(saddle);

  [[-0.17, 0.34], [0.17, 0.34], [-0.17, -0.34], [0.17, -0.34]].forEach(([x, z]) => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.055, 0.48, 10), coatMat);
    leg.position.set(x, 0.24, z);
    root.add(leg);
  });

  const head = new THREE.Group();
  head.position.set(0, 0.84, 0.48);
  const skull = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.3, 0.34), coatMat);
  const snout = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.14, 0.24), accentMat);
  snout.position.set(0, -0.05, 0.24);
  const earL = new THREE.Mesh(
    new THREE.ConeGeometry(0.07, breedId === 'boerboel_mastiff' ? 0.14 : 0.22, 6),
    accentMat
  );
  earL.position.set(-0.11, 0.22, -0.02);
  if (breedId === 'boerboel_mastiff') earL.rotation.z = 2.6;
  const earR = earL.clone();
  earR.position.x = 0.11;
  if (breedId === 'boerboel_mastiff') earR.rotation.z = -2.6;
  head.add(skull, snout, earL, earR);
  root.add(head);

  const tail = new THREE.Mesh(new THREE.CapsuleGeometry(0.05, 0.38, 6, 10), accentMat);
  tail.position.set(0, 0.68, -0.52);
  tail.rotation.x = -0.65;
  root.add(tail);

  return { root, tail, head };
}

export const PetViewport3D: React.FC<PetViewport3DProps> = ({ breedId, happiness = 80 }) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const [webglFallback, setWebglFallback] = useState(false);

  useEffect(() => {
    const container = hostRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer | null = null;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch {
      setWebglFallback(true);
      return;
    }

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 200;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 40);
    camera.position.set(1.65, 1.35, 2.05);
    camera.lookAt(0, 0.55, 0);

    const floor = new THREE.Mesh(
      new THREE.CylinderGeometry(1.15, 1.22, 0.08, 32),
      new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.7, metalness: 0.15 })
    );
    floor.position.y = -0.04;
    scene.add(floor);

    const petRig = buildPetMesh(breedId);
    scene.add(petRig.root);

    let dragActive = false;
    let prevX = 0;
    let yaw = 0.45;
    const dom = renderer.domElement;
    const onDown = (e: PointerEvent) => {
      dragActive = true;
      prevX = e.clientX;
    };
    const onMove = (e: PointerEvent) => {
      if (!dragActive) return;
      yaw += (e.clientX - prevX) * 0.012;
      prevX = e.clientX;
    };
    const onUp = () => {
      dragActive = false;
    };
    const onContextLost = (e: Event) => {
      e.preventDefault();
      setWebglFallback(true);
    };

    dom.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    dom.addEventListener('webglcontextlost', onContextLost);

    let rafId = 0;
    const clock = new THREE.Clock();
    const animate = () => {
      rafId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      if (!dragActive) yaw += 0.004;
      petRig.root.rotation.y = yaw;
      petRig.root.position.y = Math.sin(t * 2.4) * 0.018;
      if (petRig.tail) {
        const wagSpeed = happiness > 60 ? 7.5 : 2.5;
        petRig.tail.rotation.z = Math.sin(t * wagSpeed) * 0.35;
      }
      if (petRig.head) {
        petRig.head.rotation.z = Math.sin(t * 1.3) * 0.06;
      }
      renderer?.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(rafId);
      dom.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      dom.removeEventListener('webglcontextlost', onContextLost);
      scene.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const m = obj as THREE.Mesh;
          m.geometry.dispose();
          if (Array.isArray(m.material)) m.material.forEach((mat) => mat.dispose());
          else m.material.dispose();
        }
      });
      pmrem.dispose();
      renderer?.dispose();
    };
  }, [breedId, happiness]);

  if (webglFallback) {
    return (
      <div className="w-full h-44 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xs text-zinc-400">
        3D Pet Preview ({breedId.replace('_', ' ')})
      </div>
    );
  }

  return <div ref={hostRef} className="w-full h-44 rounded-2xl bg-gradient-to-b from-zinc-900 to-black border border-orange-500/30 cursor-grab active:cursor-grabbing overflow-hidden" />;
};
