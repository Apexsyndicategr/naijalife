/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { CityTextureSet } from './cityTextures';
import { CityMaterialSet } from './cityMaterials';
import { LiveWeatherData, getLocationLocalHourDecimal } from '../../utils/realWeather';

export interface WeatherAndTimeController {
  group: THREE.Group;
  sunLight: THREE.DirectionalLight;
  hemiLight: THREE.HemisphereLight;
  fog: THREE.FogExp2;
  update: (params: {
    elapsed: number;
    dt: number;
    weather: LiveWeatherData | null;
    isCanada: boolean;
    nepaLightOn: boolean;
    nightOverrideHour?: number | null;
  }) => { nightFactor: number; windFactor: number };
  dispose: () => void;
}

export function createWeatherAndTimeSystem(params: {
  scene: THREE.Scene;
  textures: CityTextureSet;
  mats: CityMaterialSet;
  reduceShadows: boolean;
}): WeatherAndTimeController {
  const { scene, textures, mats, reduceShadows } = params;
  const group = new THREE.Group();

  // 1. Atmospheric Fog & Background
  const fog = new THREE.FogExp2(0x93c5fd, 0.0014);
  scene.fog = fog;
  scene.background = new THREE.Color(0x93c5fd);

  // 2. Hemisphere Sky/Ground Fill Light
  const hemiLight = new THREE.HemisphereLight(0xdbeafe, 0x1e3a28, 0.9);
  scene.add(hemiLight);

  // 3. Key Sun / Moon Directional Light with Crisp Aerial Shadow Frustum
  const sunLight = new THREE.DirectionalLight(0xfffbeb, 1.85);
  sunLight.position.set(110, 165, 85);
  sunLight.castShadow = !reduceShadows;
  if (!reduceShadows) {
    sunLight.shadow.mapSize.set(2048, 2048);
    sunLight.shadow.camera.left = -210;
    sunLight.shadow.camera.right = 210;
    sunLight.shadow.camera.top = 180;
    sunLight.shadow.camera.bottom = -180;
    sunLight.shadow.camera.near = 25;
    sunLight.shadow.camera.far = 420;
    sunLight.shadow.bias = -0.0005;
  }
  scene.add(sunLight);

  // 4. Drifting Volumetric Cloud Layer (Sprite Cards floating above city)
  const cloudCount = 34;
  const cloudSprites: { sprite: THREE.Sprite; speedMul: number; baseY: number }[] = [];
  const cloudMaterials: THREE.SpriteMaterial[] = [];

  for (let i = 0; i < cloudCount; i++) {
    const mat = new THREE.SpriteMaterial({
      map: textures.cloudPuff,
      color: 0xffffff,
      transparent: true,
      opacity: 0.0,
      depthWrite: false,
    });
    cloudMaterials.push(mat);
    const sprite = new THREE.Sprite(mat);
    const rx = (((Math.sin(i * 41.3) * 43758.5) % 1 + 1) % 1 - 0.5) * 380;
    const rz = (((Math.sin(i * 87.9) * 23421.1) % 1 + 1) % 1 - 0.5) * 280;
    const scale = 38 + (i % 5) * 14;
    const baseY = 58 + (i % 4) * 5;
    sprite.position.set(rx, baseY, rz);
    sprite.scale.set(scale * 1.45, scale * 0.72, 1);
    group.add(sprite);
    cloudSprites.push({ sprite, speedMul: 0.75 + (i % 4) * 0.22, baseY });
  }

  // 5. GPU Weather Particles (Rain Streaks / Snow Flakes)
  const particleCount = 1800;
  const positions = new Float32Array(particleCount * 3);
  const velocities = new Float32Array(particleCount);
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.sin(i * 12.7) * 0.5) * 360;
    positions[i * 3 + 1] = ((Math.sin(i * 91.1) * 43758.5) % 1 + 1) % 1 * 88;
    positions[i * 3 + 2] = (Math.cos(i * 45.3) * 0.5) * 270;
    velocities[i] = 0.8 + (i % 7) * 0.12;
  }

  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particleMat = new THREE.PointsMaterial({
    color: 0xbae6fd,
    size: 0.85,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });
  const particlePoints = new THREE.Points(particleGeo, particleMat);
  particlePoints.frustumCulled = false;
  group.add(particlePoints);

  scene.add(group);

  // Scratch colors (zero allocation in loop)
  const daySky = new THREE.Color(0x90c6f4);
  const sunsetSky = new THREE.Color(0xfb923c);
  const nightSky = new THREE.Color(0x09111e);
  const stormSky = new THREE.Color(0x334155);
  const fogHarmattan = new THREE.Color(0xb8a386);
  const fogCanada = new THREE.Color(0xcbd5e1);
  const targetSky = new THREE.Color();

  const daySunCol = new THREE.Color(0xfffbeb);
  const sunsetSunCol = new THREE.Color(0xf97316);
  const moonSunCol = new THREE.Color(0x93c5fd);
  const targetSunCol = new THREE.Color();

  let lightningFlash = 0;
  let nextLightningAt = 6;

  const update: WeatherAndTimeController['update'] = ({
    elapsed,
    dt,
    weather,
    isCanada,
    nepaLightOn,
    nightOverrideHour,
  }) => {
    const tz = weather?.timezone || (isCanada ? 'America/Toronto' : 'Africa/Lagos');
    const localHour =
      typeof nightOverrideHour === 'number'
        ? nightOverrideHour
        : getLocationLocalHourDecimal(tz);

    // Compute smooth day/dusk/night envelope
    // Sunrise: 5.5..7.2 | Day: 7.2..17.6 | Sunset: 17.6..19.3 | Night: 19.3..5.5
    let nightFactor = 0;
    let goldenFactor = 0;
    if (localHour >= 19.3 || localHour < 5.5) {
      nightFactor = 1;
    } else if (localHour >= 17.6 && localHour < 19.3) {
      const t = (localHour - 17.6) / 1.7;
      nightFactor = t;
      goldenFactor = Math.sin(t * Math.PI);
    } else if (localHour >= 5.5 && localHour < 7.2) {
      const t = (localHour - 5.5) / 1.7;
      nightFactor = 1 - t;
      goldenFactor = Math.sin(t * Math.PI);
    }

    const wType = weather?.weatherType || 'sunny';
    const windSpeed = weather?.windSpeedKmh ?? 10;
    const windFactor = Math.min(2.2, windSpeed / 16);
    const isWet = wType === 'rain' || wType === 'heavy_rain' || wType === 'thunderstorm';
    const isSnow = wType === 'snow';
    const isFog = wType === 'fog';
    const isStorm = wType === 'thunderstorm' || wType === 'heavy_rain';

    // Update dynamic materials (wet asphalt, snow tint, NEPA/night windows)
    mats.updateDynamicState({
      nightFactor,
      isWet,
      isSnow,
      nepaLightOn,
      isCanada,
    });

    // Sun Elevation Arc across Day
    const dayArc = Math.max(0.15, Math.sin(((Math.max(5.5, Math.min(19.3, localHour)) - 5.5) / 13.8) * Math.PI));
    const sunElev = nightFactor > 0.85 ? 135 : 42 + dayArc * 125;
    const sunX = nightFactor > 0.85 ? -90 : Math.cos((localHour / 24) * Math.PI * 2) * 140;
    sunLight.position.set(sunX, sunElev, 88);

    // Thunderstorm Lightning Pulse
    if (wType === 'thunderstorm') {
      if (elapsed > nextLightningAt) {
        lightningFlash = 1.0;
        nextLightningAt = elapsed + 3.5 + ((Math.sin(elapsed * 19.3) + 1) * 2.5);
      }
      lightningFlash = Math.max(0, lightningFlash - dt * 4.5);
    } else {
      lightningFlash = 0;
    }

    // Sky & Fog Blending
    targetSky.copy(daySky).lerp(sunsetSky, goldenFactor * 0.72).lerp(nightSky, nightFactor);
    if (isStorm) {
      targetSky.lerp(stormSky, 0.58 * (1 - nightFactor * 0.5));
    } else if (wType === 'cloudy') {
      targetSky.lerp(stormSky, 0.25 * (1 - nightFactor * 0.5));
    } else if (isFog) {
      targetSky.lerp(isCanada ? fogCanada : fogHarmattan, 0.52);
    }
    if (lightningFlash > 0.1) {
      targetSky.lerp(daySunCol, lightningFlash * 0.45);
    }

    (scene.background as THREE.Color).copy(targetSky);
    fog.color.copy(targetSky);

    let fogDensity = 0.0011;
    if (isFog) fogDensity = 0.0058;
    else if (wType === 'heavy_rain' || wType === 'thunderstorm') fogDensity = 0.0034;
    else if (wType === 'rain' || wType === 'snow') fogDensity = 0.0023;
    else if (wType === 'cloudy') fogDensity = 0.0017;
    fog.density = fogDensity;

    // Key Sun & Hemisphere Intensities
    targetSunCol.copy(daySunCol).lerp(sunsetSunCol, goldenFactor * 0.85).lerp(moonSunCol, nightFactor);
    sunLight.color.copy(targetSunCol);

    const cloudDim = isStorm ? 0.52 : wType === 'cloudy' ? 0.72 : isFog ? 0.68 : 1.0;
    sunLight.intensity =
      (1.9 * (1 - nightFactor) + 0.42 * nightFactor) * cloudDim + lightningFlash * 2.6;

    hemiLight.intensity =
      (0.95 * (1 - nightFactor) + 0.34 * nightFactor) * (isStorm ? 0.75 : 1.0) +
      lightningFlash * 0.8;
    hemiLight.color.copy(targetSky).lerp(daySunCol, 0.25);

    // Update Drifting Clouds
    const targetCloudCount =
      wType === 'thunderstorm' || wType === 'heavy_rain' || wType === 'cloudy'
        ? cloudCount
        : wType === 'rain' || wType === 'snow'
        ? 26
        : wType === 'windy'
        ? 16
        : Math.max(4, Math.round(((weather?.cloudCoverPct ?? 25) / 100) * cloudCount));

    const cloudColorHex = isStorm ? 0x475569 : nightFactor > 0.6 ? 0x334155 : 0xffffff;
    const baseCloudOpacity =
      wType === 'thunderstorm'
        ? 0.52
        : wType === 'cloudy' || wType === 'heavy_rain'
        ? 0.44
        : wType === 'rain' || wType === 'snow'
        ? 0.36
        : 0.22;

    const cloudSpeed = (3.5 + windSpeed * 0.42) * dt;
    for (let i = 0; i < cloudCount; i++) {
      const cObj = cloudSprites[i];
      const mat = cloudMaterials[i];
      if (i < targetCloudCount && !isFog) {
        cObj.sprite.visible = true;
        cObj.sprite.position.x += cloudSpeed * cObj.speedMul;
        if (cObj.sprite.position.x > 220) cObj.sprite.position.x = -220;
        mat.color.setHex(cloudColorHex);
        mat.opacity = baseCloudOpacity;
      } else {
        cObj.sprite.visible = false;
      }
    }

    // Update GPU Rain / Snow Precipitation Particles
    const posAttr = particleGeo.getAttribute('position') as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;

    if (isWet || isSnow) {
      particlePoints.visible = true;
      if (isSnow) {
        particleMat.color.setHex(0xffffff);
        particleMat.size = 1.15;
        particleMat.opacity = 0.85;
        const fallSpeed = 12 * dt;
        for (let i = 0; i < particleCount; i++) {
          arr[i * 3] += (Math.sin(elapsed * 1.4 + i) * 3.5 + windFactor * 4) * dt;
          arr[i * 3 + 1] -= fallSpeed * velocities[i];
          if (arr[i * 3 + 1] < 0) arr[i * 3 + 1] = 86;
          if (arr[i * 3] > 185) arr[i * 3] = -185;
        }
      } else {
        const heavy = wType === 'heavy_rain' || wType === 'thunderstorm';
        particleMat.color.setHex(0x93c5fd);
        particleMat.size = heavy ? 1.05 : 0.78;
        particleMat.opacity = heavy ? 0.72 : 0.48;
        const fallSpeed = (heavy ? 76 : 52) * dt;
        const windDrift = windFactor * 9 * dt;
        for (let i = 0; i < particleCount; i++) {
          arr[i * 3] += windDrift;
          arr[i * 3 + 1] -= fallSpeed * velocities[i];
          if (arr[i * 3 + 1] < 0) arr[i * 3 + 1] = 88;
          if (arr[i * 3] > 185) arr[i * 3] = -185;
        }
      }
      posAttr.needsUpdate = true;
    } else {
      particlePoints.visible = false;
    }

    return { nightFactor, windFactor };
  };

  return {
    group,
    sunLight,
    hemiLight,
    fog,
    update,
    dispose: () => {
      particleGeo.dispose();
      particleMat.dispose();
      cloudMaterials.forEach((m) => m.dispose());
    },
  };
}
