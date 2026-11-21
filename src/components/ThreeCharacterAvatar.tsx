/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { CharacterAvatar } from '../types/game';
import { createRiggedAvatar3D } from './avatar3d/riggedAvatarBuilder';

interface ThreeCharacterAvatarProps {
  avatar: CharacterAvatar;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  interactive?: boolean;
  isWalking?: boolean;
  className?: string;
}

export const ThreeCharacterAvatar: React.FC<ThreeCharacterAvatarProps> = ({
  avatar,
  interactive = true,
  isWalking = false,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const walkingRef = useRef<boolean>(isWalking);
  walkingRef.current = isWalking;

  const serializedAvatar = JSON.stringify(avatar || {});

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let disposed = false;
    const width = container.clientWidth || 220;
    const height = container.clientHeight || 360;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envRT.texture;
    scene.environmentIntensity = 0.55;
    pmrem.dispose();

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 30);
    camera.position.set(0.35, 1.15, 2.85);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0.94, 0);
    controls.enablePan = false;
    controls.enableZoom = interactive;
    controls.enableRotate = interactive;
    controls.minDistance = 1.6;
    controls.maxDistance = 4.2;
    controls.minPolarAngle = 0.55;
    controls.maxPolarAngle = 1.78;
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.update();

    const hemi = new THREE.HemisphereLight(0xffffff, 0x064e3b, 1.15);
    scene.add(hemi);

    const key = new THREE.DirectionalLight(0xfffbeb, 1.9);
    key.position.set(2.4, 3.8, 2.8);
    key.castShadow = true;
    key.shadow.mapSize.set(512, 512);
    scene.add(key);

    const rim = new THREE.DirectionalLight(0x34d399, 0.9);
    rim.position.set(-2.5, 2.5, -2.5);
    scene.add(rim);

    // Subtle circular showcase plinth
    const plinthGeo = new THREE.CylinderGeometry(0.62, 0.68, 0.06, 28);
    const plinthMat = new THREE.MeshStandardMaterial({
      color: 0x064e3b,
      roughness: 0.35,
      metalness: 0.4,
    });
    const plinth = new THREE.Mesh(plinthGeo, plinthMat);
    plinth.position.y = -0.03;
    plinth.receiveShadow = true;
    scene.add(plinth);

    const ringGeo = new THREE.TorusGeometry(0.64, 0.014, 8, 36);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x34d399,
      emissive: 0x10b981,
      emissiveIntensity: 0.65,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.004;
    scene.add(ring);

    const rigged = createRiggedAvatar3D(avatar);
    scene.add(rigged.group);

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

    let rafId = 0;
    let prev = performance.now();
    const start = prev;

    const animate = (now: number) => {
      if (disposed) return;
      rafId = requestAnimationFrame(animate);
      const dt = Math.min(0.05, Math.max(0.001, (now - prev) / 1000));
      const elapsed = (now - start) / 1000;
      prev = now;

      rigged.updateAnimation(elapsed, dt, walkingRef.current ? 'walk' : 'idle');
      if (!interactive) {
        rigged.group.rotation.y = Math.sin(elapsed * 0.6) * 0.25;
      }
      controls.update();
      renderer.render(scene, camera);
    };
    rafId = requestAnimationFrame(animate);

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      resizeObs.disconnect();
      controls.dispose();
      rigged.dispose();
      plinthGeo.dispose();
      plinthMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      envRT.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [serializedAvatar, interactive]);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full relative ${className}`}
      title={interactive ? 'Drag to rotate 3D avatar · Scroll to zoom' : undefined}
    />
  );
};
