/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { CharacterAvatar } from '../../types/game';
import { createRiggedAvatar3D, normalizeAvatarConfig } from './riggedAvatarBuilder';

const PORTRAIT_CACHE = new Map<string, string>();
const MAX_CACHE_SIZE = 80;

let sharedRenderer: THREE.WebGLRenderer | null = null;

function getSharedPortraitRenderer(): THREE.WebGLRenderer | null {
  if (typeof document === 'undefined') return null;
  if (!sharedRenderer) {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 192;
      canvas.height = 192;
      sharedRenderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        preserveDrawingBuffer: true,
      });
      sharedRenderer.setSize(192, 192, false);
      sharedRenderer.setPixelRatio(1);
      sharedRenderer.outputColorSpace = THREE.SRGBColorSpace;
      sharedRenderer.toneMapping = THREE.ACESFilmicToneMapping;
      sharedRenderer.toneMappingExposure = 1.15;
    } catch {
      return null;
    }
  }
  return sharedRenderer;
}

export function getAvatarPortraitCacheKey(avatar?: Partial<CharacterAvatar> | null, fullBody = false): string {
  const norm = normalizeAvatarConfig(avatar);
  return `${fullBody ? 'full' : 'bust'}:${JSON.stringify(norm)}`;
}

export function renderAvatarPortrait3DSync(
  avatar?: Partial<CharacterAvatar> | null,
  fullBody = false
): string | null {
  const key = getAvatarPortraitCacheKey(avatar, fullBody);
  const hit = PORTRAIT_CACHE.get(key);
  if (hit) return hit;

  const renderer = getSharedPortraitRenderer();
  if (!renderer) return null;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 20);

  if (fullBody) {
    camera.position.set(0.28, 1.08, 3.15);
    camera.lookAt(0, 0.94, 0);
  } else {
    // Crisp bust / headshot framing matching bottom-left HUD circle
    camera.position.set(0.16, 1.65, 1.18);
    camera.lookAt(0, 1.56, 0);
  }

  const hemi = new THREE.HemisphereLight(0xf8fafc, 0x064e3b, 1.35);
  scene.add(hemi);
  const keyLight = new THREE.DirectionalLight(0xffffff, 1.85);
  keyLight.position.set(2.2, 3.2, 2.8);
  scene.add(keyLight);
  const rimLight = new THREE.DirectionalLight(0x34d399, 0.85);
  rimLight.position.set(-2.2, 2.0, -2.0);
  scene.add(rimLight);

  const built = createRiggedAvatar3D(avatar);
  built.updateAnimation(0, 0, 'idle');
  built.group.rotation.y = 0.22;
  scene.add(built.group);

  renderer.setClearColor(0x000000, 0);
  renderer.render(scene, camera);

  let dataUrl: string | null = null;
  try {
    dataUrl = renderer.domElement.toDataURL('image/png');
  } catch {
    dataUrl = null;
  }

  scene.remove(built.group);
  built.dispose();

  if (dataUrl) {
    if (PORTRAIT_CACHE.size >= MAX_CACHE_SIZE) {
      const oldestKey = PORTRAIT_CACHE.keys().next().value;
      if (oldestKey) PORTRAIT_CACHE.delete(oldestKey);
    }
    PORTRAIT_CACHE.set(key, dataUrl);
  }

  return dataUrl;
}
