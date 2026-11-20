/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';
import * as THREE from 'three';
import { MapControls } from 'three/examples/jsm/controls/MapControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { LocationPOI, PropertyAsset, UserProfile } from '../../types/game';
import { StateLandmarkTheme } from '../../data/multiStateLocations';
import { LiveWeatherData } from '../../utils/realWeather';
import { getLocationLogo } from '../LagosLifeBuilding';
import { createCityTextures, CityTextureSet } from './cityTextures';
import { createCityMaterials, CityMaterialSet } from './cityMaterials';
import {
  CityBuildingBuilder,
  BuiltPOIEntry,
  poiPercentToWorld,
} from './buildingFactory';
import { buildCityInfrastructure, CityInfrastructureHandle } from './infrastructureFactory';
import {
  createWeatherAndTimeSystem,
  WeatherAndTimeController,
} from './weatherAndTimeSystem';

export interface HomePOIEntry extends LocationPOI {
  isPrimaryHome?: boolean;
  propertyRef?: PropertyAsset;
}

export interface NaijaCity3DHandle {
  flyToPercent: (xPct: number, yPct: number, targetDistance?: number) => void;
  zoomByFactor: (factor: number) => void;
  resetAerialView: () => void;
}

export interface NaijaCity3DCanvasProps {
  activeStateId: string;
  locations: LocationPOI[];
  homeLocations: HomePOIEntry[];
  stateLandmarks: StateLandmarkTheme;
  userProfile: UserProfile;
  showLocationNames: boolean;
  highlightedLocationId: string | null;
  liveWeather: LiveWeatherData | null;
  nepaLightOn: boolean;
  trafficLevelId: string;
  reduceShadows?: boolean;
  isModalBlocking?: boolean;
  onLocationClick: (loc: LocationPOI, homeProp?: PropertyAsset) => void;
  onAirportClick: () => void;
  onZoomPercentChange?: (pct: number) => void;
}

function getPinColorStyle(type: LocationPOI['type'], isHome: boolean): { borderHex: string; glowRgba: string } {
  if (isHome) return { borderHex: '#34d399', glowRgba: 'rgba(52,211,153,0.55)' };
  switch (type) {
    case 'hospital':
      return { borderHex: '#f43f5e', glowRgba: 'rgba(244,63,94,0.45)' };
    case 'bank':
    case 'gov':
      return { borderHex: '#10b981', glowRgba: 'rgba(16,185,129,0.45)' };
    case 'airport':
    case 'police':
      return { borderHex: '#38bdf8', glowRgba: 'rgba(56,189,248,0.45)' };
    case 'market':
    case 'hotel':
    case 'mosque':
      return { borderHex: '#fbbf24', glowRgba: 'rgba(251,191,36,0.45)' };
    case 'mall':
    case 'club':
      return { borderHex: '#c084fc', glowRgba: 'rgba(192,132,252,0.45)' };
    default:
      return { borderHex: '#a1a1aa', glowRgba: 'rgba(161,161,170,0.35)' };
  }
}

function detectSoftwareWebGL(): boolean {
  try {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2') || c.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    if (!ext) return false;
    const renderer = String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) || '');
    return /SwiftShader|llvmpipe|Software|Microsoft Basic Render/i.test(renderer);
  } catch {
    return false;
  }
}

export const NaijaCity3DCanvas = React.forwardRef<NaijaCity3DHandle, NaijaCity3DCanvasProps>(
  (
    {
      activeStateId,
      locations,
      homeLocations,
      stateLandmarks,
      showLocationNames,
      highlightedLocationId,
      liveWeather,
      nepaLightOn,
      trafficLevelId,
      reduceShadows = false,
      isModalBlocking = false,
      onLocationClick,
      onAirportClick,
      onZoomPercentChange,
    },
    ref
  ) => {
    const mountRef = useRef<HTMLDivElement | null>(null);
    const markerRefs = useRef<Map<string, HTMLDivElement>>(new Map());
    const specialMarkerRefs = useRef<Map<string, HTMLDivElement>>(new Map());
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    // Live mutable refs so RAF loop always reads fresh state without re-creating WebGL context
    const weatherRef = useRef<LiveWeatherData | null>(liveWeather);
    weatherRef.current = liveWeather;
    const nepaRef = useRef<boolean>(nepaLightOn);
    nepaRef.current = nepaLightOn;
    const trafficRef = useRef<string>(trafficLevelId);
    trafficRef.current = trafficLevelId;
    const isCanadaRef = useRef<boolean>(activeStateId === 'canada');
    isCanadaRef.current = activeStateId === 'canada';
    const isModalBlockingRef = useRef<boolean>(isModalBlocking);
    isModalBlockingRef.current = isModalBlocking;
    const onLocationClickRef = useRef(onLocationClick);
    onLocationClickRef.current = onLocationClick;
    const onAirportClickRef = useRef(onAirportClick);
    onAirportClickRef.current = onAirportClick;
    const onZoomPercentChangeRef = useRef(onZoomPercentChange);
    onZoomPercentChangeRef.current = onZoomPercentChange;

    // Camera fly-to goal ref
    const flyGoalRef = useRef<{
      active: boolean;
      targetX: number;
      targetZ: number;
      distance?: number;
    }>({ active: false, targetX: 0, targetZ: 0 });

    const controlsRef = useRef<MapControls | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

    useImperativeHandle(ref, () => ({
      flyToPercent: (xPct: number, yPct: number, targetDistance = 88) => {
        const w = poiPercentToWorld(xPct, yPct);
        flyGoalRef.current = {
          active: true,
          targetX: w.x,
          targetZ: w.z,
          distance: targetDistance,
        };
      },
      zoomByFactor: (factor: number) => {
        const cam = cameraRef.current;
        const ctrl = controlsRef.current;
        if (!cam || !ctrl) return;
        const offset = new THREE.Vector3().subVectors(cam.position, ctrl.target);
        const curDist = offset.length();
        const nextDist = THREE.MathUtils.clamp(curDist * factor, ctrl.minDistance, ctrl.maxDistance);
        offset.setLength(nextDist);
        cam.position.copy(ctrl.target).add(offset);
        ctrl.update();
      },
      resetAerialView: () => {
        flyGoalRef.current = { active: true, targetX: 0, targetZ: 10, distance: 162 };
      },
    }));

    // Combined list of all interactive marker items (Homes + State POIs)
    const allMarkers = React.useMemo(() => {
      const items: {
        id: string;
        loc: LocationPOI;
        isHome: boolean;
        homeProp?: PropertyAsset;
        worldX: number;
        worldZ: number;
        pinHeight: number;
      }[] = [];

      for (const h of homeLocations) {
        const w = poiPercentToWorld(h.x, h.y);
        items.push({
          id: h.id,
          loc: h,
          isHome: true,
          homeProp: h.propertyRef,
          worldX: w.x,
          worldZ: w.z,
          pinHeight: 8.5,
        });
      }

      for (const loc of locations) {
        const w = poiPercentToWorld(loc.x, loc.y);
        const estH =
          loc.type === 'bank' || loc.type === 'hotel' || loc.type === 'techhub'
            ? 14
            : loc.type === 'church' || loc.type === 'airport'
            ? 11
            : 8;
        items.push({
          id: loc.id,
          loc,
          isHome: false,
          worldX: w.x,
          worldZ: w.z,
          pinHeight: estH,
        });
      }
      return items;
    }, [locations, homeLocations]);

    const allMarkersRef = useRef(allMarkers);
    allMarkersRef.current = allMarkers;

    // Static landmark badge coordinates (Airport Runway 27, Zuma Monolith, Aso Monolith, Lake)
    const specialMarkers = React.useMemo(
      () => [
        {
          id: '__airport_hub__',
          label: stateLandmarks.airportName,
          shortLabel: 'Airport (Runway 27)',
          emoji: '✈️',
          x: -108,
          y: 16,
          z: 112,
          isAirport: true,
        },
        {
          id: '__monolith_left__',
          label: stateLandmarks.primaryLandmarkName,
          shortLabel: stateLandmarks.primaryLandmarkName,
          emoji: '⛰️',
          x: -162,
          y: 22,
          z: -24,
          isAirport: false,
        },
        {
          id: '__monolith_right__',
          label: stateLandmarks.secondaryLandmarkName,
          shortLabel: stateLandmarks.secondaryLandmarkName,
          emoji: '⛰️',
          x: 158,
          y: 20,
          z: -10,
          isAirport: false,
        },
        {
          id: '__waterfront__',
          label: stateLandmarks.waterfrontName,
          shortLabel: stateLandmarks.waterfrontName,
          emoji: stateLandmarks.waterfrontVessel,
          x: -106,
          y: 5,
          z: -56,
          isAirport: false,
        },
      ],
      [stateLandmarks]
    );
    const specialMarkersRef = useRef(specialMarkers);
    specialMarkersRef.current = specialMarkers;

    // =========================================================================
    // MOUNT SINGLE PERSISTENT WEBGL RENDERER + CONTROLS + SCENE GRAPH
    // =========================================================================
    const sceneObjectsRef = useRef<{
      scene: THREE.Scene;
      mats: CityMaterialSet;
      cityGroup: THREE.Group;
      buildingEntries: BuiltPOIEntry[];
      infraHandle: CityInfrastructureHandle | null;
      buildingBuilder: CityBuildingBuilder;
      hitMeshes: THREE.Object3D[];
    } | null>(null);

    useEffect(() => {
      const container = mountRef.current;
      if (!container) return;

      const isSw = detectSoftwareWebGL();
      const useShadows = !isSw && !reduceShadows;

      const renderer = new THREE.WebGLRenderer({
        antialias: !isSw,
        powerPreference: 'high-performance',
        alpha: false,
      });
      renderer.setPixelRatio(isSw ? 1 : Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(container.clientWidth || window.innerWidth, container.clientHeight || window.innerHeight);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.shadowMap.enabled = useShadows;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.domElement.style.display = 'block';
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
      container.appendChild(renderer.domElement);

      const scene = new THREE.Scene();

      // Environment reflections via RoomEnvironment PMREM
      const pmrem = new THREE.PMREMGenerator(renderer);
      const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
      scene.environment = envRT.texture;
      scene.environmentIntensity = 0.45;
      pmrem.dispose();

      // Strict Top-Down Aerial Camera (~58 deg pitch looking down across city)
      const camera = new THREE.PerspectiveCamera(
        42,
        (container.clientWidth || window.innerWidth) / (container.clientHeight || window.innerHeight),
        1.5,
        1400
      );
      camera.position.set(0, 148, 86);
      cameraRef.current = camera;

      const controls = new MapControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.085;
      controls.screenSpacePanning = false; // Drag ground smoothly on XZ plane
      controls.minDistance = 40;
      controls.maxDistance = 265;
      controls.minPolarAngle = 0.22; // Almost directly overhead
      controls.maxPolarAngle = 0.88; // Strictly aerial top-down (never street-level!)
      controls.panSpeed = 1.1;
      controls.zoomSpeed = 1.15;
      controls.rotateSpeed = 0.55;
      controls.target.set(0, 0, 8);
      controls.update();
      controlsRef.current = controls;

      const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
      const textures: CityTextureSet = createCityTextures(maxAnisotropy);
      const mats: CityMaterialSet = createCityMaterials(textures);
      const buildingBuilder = new CityBuildingBuilder(mats);
      const weatherAndTime: WeatherAndTimeController = createWeatherAndTimeSystem({
        scene,
        textures,
        mats,
        reduceShadows: !useShadows,
      });

      const cityGroup = new THREE.Group();
      scene.add(cityGroup);

      sceneObjectsRef.current = {
        scene,
        mats,
        cityGroup,
        buildingEntries: [],
        infraHandle: null,
        buildingBuilder,
        hitMeshes: [],
      };

      // Raycasting for 3D building hover & click (only when pointer didn't pan)
      const raycaster = new THREE.Raycaster();
      const ndc = new THREE.Vector2();
      let downPos = { x: 0, y: 0 };
      let activePointerHoverId: string | null = null;

      const handlePointerDown = (e: PointerEvent) => {
        downPos = { x: e.clientX, y: e.clientY };
        flyGoalRef.current.active = false;
      };

      const handlePointerMove = (e: PointerEvent) => {
        if (isModalBlockingRef.current || !sceneObjectsRef.current) return;
        const rect = renderer.domElement.getBoundingClientRect();
        ndc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        ndc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(ndc, camera);
        const hits = raycaster.intersectObjects(sceneObjectsRef.current.hitMeshes, false);
        if (hits.length > 0) {
          const ud = hits[0].object.userData;
          if (ud?.isAirportComplex) {
            if (activePointerHoverId !== '__airport_hub__') {
              activePointerHoverId = '__airport_hub__';
              setHoveredId('__airport_hub__');
            }
            renderer.domElement.style.cursor = 'pointer';
            return;
          }
          if (ud?.poiId) {
            if (activePointerHoverId !== ud.poiId) {
              activePointerHoverId = ud.poiId;
              setHoveredId(ud.poiId);
            }
            renderer.domElement.style.cursor = 'pointer';
            return;
          }
        }
        if (activePointerHoverId !== null) {
          activePointerHoverId = null;
          setHoveredId(null);
        }
        renderer.domElement.style.cursor = 'grab';
      };

      const handlePointerUp = (e: PointerEvent) => {
        if (isModalBlockingRef.current || !sceneObjectsRef.current) return;
        const moved = Math.hypot(e.clientX - downPos.x, e.clientY - downPos.y);
        if (moved > 6) return; // Panning gesture, not a click

        const rect = renderer.domElement.getBoundingClientRect();
        ndc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        ndc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(ndc, camera);
        const hits = raycaster.intersectObjects(sceneObjectsRef.current.hitMeshes, false);
        if (hits.length > 0) {
          const ud = hits[0].object.userData;
          if (ud?.isAirportComplex) {
            onAirportClickRef.current();
            return;
          }
          if (ud?.poi) {
            onLocationClickRef.current(ud.poi as LocationPOI, ud.homeProp as PropertyAsset | undefined);
          }
        }
      };

      renderer.domElement.addEventListener('pointerdown', handlePointerDown);
      renderer.domElement.addEventListener('pointermove', handlePointerMove);
      renderer.domElement.addEventListener('pointerup', handlePointerUp);

      // ResizeObserver cleanly tracks canvas size
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const w = Math.max(1, entry.contentRect.width);
          const h = Math.max(1, entry.contentRect.height);
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        }
      });
      resizeObserver.observe(container);

      // Reusable scratch vectors inside animation loop (zero per-frame heap churn)
      const projVec = new THREE.Vector3();
      const camOffset = new THREE.Vector3();
      let rafId = 0;
      let prevTime = performance.now();
      const startTime = prevTime;
      let lastReportedZoomPct = -1;

      const animate = (now: number) => {
        rafId = requestAnimationFrame(animate);
        const dt = Math.min(0.05, Math.max(0.001, (now - prevTime) / 1000));
        const elapsed = (now - startTime) / 1000;
        prevTime = now;

        // Disable controls while modals/phone cover viewport
        controls.enabled = !isModalBlockingRef.current;

        // Smooth Fly-To Camera Interpolation when user selects a location or "My House"
        if (flyGoalRef.current.active) {
          const g = flyGoalRef.current;
          const prevTX = controls.target.x;
          const prevTZ = controls.target.z;
          const nx = THREE.MathUtils.damp(prevTX, g.targetX, 6.5, dt);
          const nz = THREE.MathUtils.damp(prevTZ, g.targetZ, 6.5, dt);
          camera.position.x += nx - prevTX;
          camera.position.z += nz - prevTZ;
          controls.target.x = nx;
          controls.target.z = nz;

          if (typeof g.distance === 'number') {
            camOffset.subVectors(camera.position, controls.target);
            const curD = camOffset.length();
            const nextD = THREE.MathUtils.damp(curD, g.distance, 5.5, dt);
            camOffset.setLength(nextD);
            camera.position.copy(controls.target).add(camOffset);
          }

          if (Math.hypot(g.targetX - controls.target.x, g.targetZ - controls.target.z) < 0.5) {
            flyGoalRef.current.active = false;
          }
        }

        controls.update();

        // Clamp aerial pan bounds inside the city perimeter
        const cx = THREE.MathUtils.clamp(controls.target.x, -180, 180);
        const cz = THREE.MathUtils.clamp(controls.target.z, -132, 132);
        if (cx !== controls.target.x || cz !== controls.target.z) {
          camera.position.x += cx - controls.target.x;
          camera.position.z += cz - controls.target.z;
          controls.target.x = cx;
          controls.target.z = cz;
        }
        controls.target.y = 0;

        // Compute Zoom % for HUD indicator
        const dist = camera.position.distanceTo(controls.target);
        const zoomPct = Math.round(
          THREE.MathUtils.clamp(
            ((controls.maxDistance - dist) / (controls.maxDistance - controls.minDistance)) * 140 + 60,
            60,
            200
          )
        );
        if (zoomPct !== lastReportedZoomPct) {
          lastReportedZoomPct = zoomPct;
          onZoomPercentChangeRef.current?.(zoomPct);
        }

        // Traffic speed multiplier tied to live traffic pill
        const trId = trafficRef.current;
        const trafficFactor =
          trId === 'free_flow'
            ? 1.35
            : trId === 'light'
            ? 1.05
            : trId === 'moderate'
            ? 0.65
            : trId === 'heavy'
            ? 0.3
            : 0.08;

        // Update weather, day/night lights, fog, and precipitation
        const { nightFactor, windFactor } = weatherAndTime.update({
          elapsed,
          dt,
          weather: weatherRef.current,
          isCanada: isCanadaRef.current,
          nepaLightOn: nepaRef.current,
        });

        // Update infrastructure animations (live vehicles, radar, water ripples, wind trees)
        const sObj = sceneObjectsRef.current;
        if (sObj?.infraHandle) {
          sObj.infraHandle.update(elapsed, dt, trafficFactor, nightFactor, windFactor);
        }

        // Project 3D coordinates cleanly onto compact screen pins (zero React state churn!)
        const viewW = renderer.domElement.clientWidth || window.innerWidth;
        const viewH = renderer.domElement.clientHeight || window.innerHeight;

        const markersList = allMarkersRef.current;
        for (let i = 0; i < markersList.length; i++) {
          const mk = markersList[i];
          const el = markerRefs.current.get(mk.id);
          if (!el) continue;
          projVec.set(mk.worldX, mk.pinHeight, mk.worldZ);
          projVec.project(camera);
          if (projVec.z > 1 || projVec.z < -1) {
            el.style.display = 'none';
            continue;
          }
          const sx = (projVec.x * 0.5 + 0.5) * viewW;
          const sy = (-projVec.y * 0.5 + 0.5) * viewH;
          if (sx < -60 || sx > viewW + 60 || sy < -60 || sy > viewH + 60) {
            el.style.display = 'none';
            continue;
          }
          el.style.display = 'flex';
          el.style.transform = `translate3d(${sx.toFixed(1)}px, ${sy.toFixed(1)}px, 0) translate(-50%, -100%)`;
        }

        const spList = specialMarkersRef.current;
        for (let i = 0; i < spList.length; i++) {
          const sp = spList[i];
          const el = specialMarkerRefs.current.get(sp.id);
          if (!el) continue;
          projVec.set(sp.x, sp.y, sp.z);
          projVec.project(camera);
          if (projVec.z > 1 || projVec.z < -1) {
            el.style.display = 'none';
            continue;
          }
          const sx = (projVec.x * 0.5 + 0.5) * viewW;
          const sy = (-projVec.y * 0.5 + 0.5) * viewH;
          if (sx < -100 || sx > viewW + 100 || sy < -60 || sy > viewH + 60) {
            el.style.display = 'none';
            continue;
          }
          el.style.display = 'flex';
          el.style.transform = `translate3d(${sx.toFixed(1)}px, ${sy.toFixed(1)}px, 0) translate(-50%, -100%)`;
        }

        renderer.render(scene, camera);
      };

      rafId = requestAnimationFrame(animate);

      return () => {
        cancelAnimationFrame(rafId);
        resizeObserver.disconnect();
        renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
        renderer.domElement.removeEventListener('pointermove', handlePointerMove);
        renderer.domElement.removeEventListener('pointerup', handlePointerUp);
        controls.dispose();
        weatherAndTime.dispose();
        if (sceneObjectsRef.current?.infraHandle) {
          sceneObjectsRef.current.infraHandle.dispose();
        }
        buildingBuilder.dispose();
        mats.dispose();
        textures.dispose();
        envRT.dispose();
        renderer.dispose();
        if (renderer.domElement.parentNode === container) {
          container.removeChild(renderer.domElement);
        }
        sceneObjectsRef.current = null;
      };
    }, [reduceShadows]);

    // =========================================================================
    // REBUILD CITY LANDMARKS & INFRASTRUCTURE WHEN ACTIVE STATE OR HOMES CHANGE
    // =========================================================================
    useEffect(() => {
      const sObj = sceneObjectsRef.current;
      if (!sObj) return;

      // Clear previous city meshes cleanly
      while (sObj.cityGroup.children.length > 0) {
        sObj.cityGroup.remove(sObj.cityGroup.children[0]);
      }
      if (sObj.infraHandle) {
        sObj.infraHandle.dispose();
        sObj.infraHandle = null;
      }
      sObj.buildingEntries = [];
      sObj.hitMeshes = [];

      const avoidPoints: { x: number; z: number; radius: number }[] = [];

      // 1. Place Home Buildings
      for (const home of homeLocations) {
        const built = sObj.buildingBuilder.buildLandmarkPOI(home, {
          isHome: true,
          reduceShadows,
        });
        const w = poiPercentToWorld(home.x, home.y);
        built.group.position.set(w.x, 0, w.z);
        built.hitMesh.userData = { poiId: home.id, poi: home, homeProp: home.propertyRef };
        sObj.cityGroup.add(built.group);
        sObj.buildingEntries.push(built);
        sObj.hitMeshes.push(built.hitMesh);
        avoidPoints.push({ x: w.x, z: w.z, radius: 9.5 });
      }

      // 2. Place State POIs
      for (const loc of locations) {
        const built = sObj.buildingBuilder.buildLandmarkPOI(loc, {
          isCnTower: activeStateId === 'canada' && loc.id === 'can_cntower',
          reduceShadows,
        });
        const w = poiPercentToWorld(loc.x, loc.y);
        built.group.position.set(w.x, 0, w.z);
        sObj.cityGroup.add(built.group);
        sObj.buildingEntries.push(built);
        sObj.hitMeshes.push(built.hitMesh);
        avoidPoints.push({ x: w.x, z: w.z, radius: 9.2 });
      }

      // 3. Natural 3D Monoliths (Zuma Left, Aso Right)
      const zumaRock = sObj.buildingBuilder.buildNaturalMonolith('zuma', reduceShadows);
      zumaRock.position.set(-162, 0, -24);
      sObj.cityGroup.add(zumaRock);
      avoidPoints.push({ x: -162, z: -24, radius: 18 });

      const asoRock = sObj.buildingBuilder.buildNaturalMonolith('aso', reduceShadows);
      asoRock.position.set(158, 0, -10);
      sObj.cityGroup.add(asoRock);
      avoidPoints.push({ x: 158, z: -10, radius: 18 });

      // 4. Build Roads, Bridges, Elevated Flyovers, River, Airport, Urban Fill & Live Vehicles
      const infra = buildCityInfrastructure({
        mats: sObj.mats,
        isCanada: activeStateId === 'canada',
        avoidPoints,
        reduceShadows,
      });
      sObj.infraHandle = infra;
      sObj.cityGroup.add(infra.group);
      sObj.hitMeshes.push(infra.airportHitMesh);
    }, [activeStateId, locations, homeLocations, reduceShadows]);

    return (
      <div className="absolute inset-0 overflow-hidden select-none">
        {/* WebGL Three.js Top-Down Aerial City Viewport */}
        <div ref={mountRef} className="w-full h-full" />

        {/* Clean, Compact Projected Location Markers (Hover to show full name, or toggle Names ON) */}
        <div className="pointer-events-none fixed inset-0 z-20 overflow-hidden">
          {allMarkers.map((mk) => {
            const accent = getPinColorStyle(mk.loc.type, mk.isHome);
            const logo = mk.isHome ? '🏡' : getLocationLogo(mk.loc.type);
            const isHighlighted = highlightedLocationId === mk.id;
            const isHovered = hoveredId === mk.id;
            const showFullLabel = showLocationNames || isHovered || isHighlighted;

            return (
              <div
                key={`pin3d-${mk.id}`}
                ref={(el) => {
                  if (el) markerRefs.current.set(mk.id, el);
                  else markerRefs.current.delete(mk.id);
                }}
                style={{ display: 'none', willChange: 'transform' }}
                className="absolute top-0 left-0 flex-col items-center pointer-events-auto"
              >
                {/* Compact Hover / Toggled Name Pill */}
                {showFullLabel && (
                  <div
                    className={`mb-1 px-2 py-0.5 rounded-md text-[10px] font-bold tracking-tight whitespace-nowrap shadow-md border pointer-events-none transition-all ${
                      mk.isHome
                        ? 'bg-emerald-950/95 text-emerald-200 border-emerald-400/70'
                        : isHighlighted
                        ? 'bg-amber-400 text-zinc-950 border-white font-black'
                        : 'bg-zinc-950/90 text-white border-zinc-700/80'
                    }`}
                  >
                    {isHovered ? mk.loc.name : mk.loc.tagLabel || mk.loc.name}
                  </div>
                )}

                {/* Sleek Small Circular Pin Icon */}
                <button
                  type="button"
                  onMouseEnter={() => setHoveredId(mk.id)}
                  onMouseLeave={() => setHoveredId((prev) => (prev === mk.id ? null : prev))}
                  onClick={(e) => {
                    e.stopPropagation();
                    onLocationClick(mk.loc, mk.homeProp);
                  }}
                  title={mk.loc.name}
                  className={`interactive-pin w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-lg border transition-transform cursor-pointer ${
                    mk.isHome
                      ? 'bg-emerald-900 border-emerald-300 ring-2 ring-emerald-400/40 scale-110'
                      : isHighlighted
                      ? 'bg-amber-400 text-zinc-950 border-white scale-125 ring-2 ring-amber-300/60'
                      : isHovered
                      ? 'bg-zinc-900 border-white scale-125'
                      : 'bg-zinc-950/85 hover:scale-120'
                  }`}
                  style={{
                    borderColor: isHighlighted ? '#ffffff' : accent.borderHex,
                    boxShadow: `0 2px 8px rgba(0,0,0,0.65), 0 0 8px ${accent.glowRgba}`,
                  }}
                >
                  <span className="leading-none text-[11px]">{logo}</span>
                </button>
              </div>
            );
          })}

          {/* Special Infrastructure Landmark Badges (Airport Runway, Monoliths, Waterfront) */}
          {specialMarkers.map((sp) => {
            const isHov = hoveredId === sp.id;
            return (
              <div
                key={sp.id}
                ref={(el) => {
                  if (el) specialMarkerRefs.current.set(sp.id, el);
                  else specialMarkerRefs.current.delete(sp.id);
                }}
                style={{ display: 'none', willChange: 'transform' }}
                className="absolute top-0 left-0 flex-col items-center pointer-events-auto"
              >
                <button
                  type="button"
                  onMouseEnter={() => setHoveredId(sp.id)}
                  onMouseLeave={() => setHoveredId((prev) => (prev === sp.id ? null : prev))}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (sp.isAirport) onAirportClick();
                  }}
                  className={`interactive-pin px-2 py-0.5 rounded-full border text-[10px] font-bold flex items-center gap-1 shadow-lg transition-transform ${
                    sp.isAirport
                      ? 'bg-sky-950/90 border-sky-400/80 text-sky-200 hover:scale-105 cursor-pointer'
                      : 'bg-zinc-950/80 border-zinc-700/80 text-zinc-200 cursor-default'
                  }`}
                >
                  <span>{sp.emoji}</span>
                  <span className="max-w-[160px] truncate">
                    {isHov || showLocationNames ? sp.label : sp.shortLabel}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);
