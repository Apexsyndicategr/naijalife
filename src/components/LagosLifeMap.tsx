/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  MapPin,
  Compass,
  Bus,
  Plane,
  Building,
  GraduationCap,
  ShoppingBag,
  ShoppingCart,
  HeartPulse,
  Hotel,
  Coins,
  DollarSign,
  Zap,
  Utensils,
  Smile,
  Heart,
  Search,
  X,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Lock,
  ChevronDown,
  Navigation,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Landmark,
  UtensilsCrossed,
  Wine,
  Church,
  Trophy,
  Dumbbell,
  Store,
  Phone,
  Home as HomeIcon,
  Car,
  Key,
  Crown,
  Bed,
  PartyPopper,
  Radio,
  Footprints,
  Users,
  MessageSquare,
  Send,
  Award,
  Layers,
  Eye,
  SlidersHorizontal,
  CloudSun,
  Volume2,
  VolumeX,
  Plus,
  Check,
  AlertTriangle
} from 'lucide-react';
import {
  StateData,
  LocationPOI,
  POIType,
  PropertyAsset,
  VehicleAsset,
  InvestmentAsset,
  TransportMode,
  FurnitureItem
} from '../types/game';
import { NIGERIA_36_STATES_ALPHABETICAL } from '../data/stateLocationsData';
import { CANADA_STATE_DATA } from '../data/canadaLocations150';
import { MAP_100_LOCATIONS } from '../data/mapLocations100';
import { CharacterRenderer } from './CharacterRenderer';
import { UserProfile } from '../types/game';
import { NaijaPhone, PhoneAppType } from './NaijaPhone';
import { InteriorView } from './InteriorView';
import { BuyModeModal } from './BuyModeModal';
import { LagosLifeBuilding, getLocationLogo } from './LagosLifeBuilding';
import { getStateLocations, getStateLandmarks } from '../data/multiStateLocations';
import {
  calculateInterstateTrip,
  calculateDomesticFlightDetails,
  DOMESTIC_AIRLINES,
  INTERNATIONAL_DESTINATIONS,
  STATE_AIRPORTS,
  AirlineOption,
  FlightCabinClass,
  FLIGHT_CABIN_CLASSES,
  FLIGHT_SCHEDULE_PLANS,
  CANADA_AIRLINES,
  CANADA_CABIN_CLASSES,
} from '../utils/travelPricing';
import { formatNaira, formatMoneyInWords } from '../utils/formatNaira';
import { fetchRealLifeWeather, LiveWeatherData } from '../utils/realWeather';
import { getStoredUsers } from './AuthPortal';
import { DeviceOptimizationProfile } from './DeviceOptimizationLoader';
import { InFlightSimulationOverlay } from './InFlightSimulationOverlay';
import { InterstateBusSimulationOverlay } from './InterstateBusSimulationOverlay';

export interface LagosLifeMapProps {
  userProfile: UserProfile;
  currentState: StateData;
  spawnState: StateData;
  deviceOptimizationProfile?: DeviceOptimizationProfile;
  moneyNGN?: number;
  moneyUSD?: number;
  energy?: number;
  isMusicMuted?: boolean;
  onToggleMusicMute?: () => void;
  isBroadcastPlaying?: boolean;
  hunger?: number;
  health?: number;
  happiness?: number;
  ownedProperties?: PropertyAsset[];
  activeHome?: PropertyAsset | null;
  onSelectActiveHome?: (home: PropertyAsset) => void;
  onBuyOrRentProperty?: (property: PropertyAsset, mode: 'rent' | 'buy') => void;
  ownedVehicles?: VehicleAsset[];
  activeVehicle?: VehicleAsset | null;
  onSelectActiveVehicle?: (vehicle: VehicleAsset) => void;
  onBuyVehicle?: (vehicle: VehicleAsset) => void;
  investments?: InvestmentAsset[];
  onInvest?: (assetId: string, amount: number) => void;
  onLiquidateInvestment?: (assetId: string) => void;
  onPerformAction?: (action: {
    type: string;
    label: string;
    cost?: number;
    earn?: number;
    energyEffect?: number;
    hungerEffect?: number;
    healthEffect?: number;
    happinessEffect?: number;
    logText: string;
  }) => void;
  onInterstateTravel?: (targetState: StateData, fare: number) => void;
  onLogout?: () => void;
  onNewLife?: () => void;
  onUpdateMoney?: (deltaNGN: number, deltaUSD?: number) => void;
  onUpdateStats?: (effects: { energy?: number; hunger?: number; health?: number; happiness?: number }) => void;
  onLogAction?: (category: 'finance' | 'career' | 'lifestyle' | 'social', text: string) => void;
  onShowToast?: (message: string) => void;
  triggerSound?: (type: 'coin' | 'stamp' | 'alert' | 'success') => void;
}

export const LagosLifeMap: React.FC<LagosLifeMapProps> = ({
  userProfile,
  currentState,
  spawnState,
  deviceOptimizationProfile,
  moneyNGN = 0,
  moneyUSD = 0,
  energy = 100,
  isMusicMuted = false,
  onToggleMusicMute,
  isBroadcastPlaying = false,
  hunger = 100,
  health = 100,
  happiness = 100,
  ownedProperties = [],
  activeHome = null,
  onSelectActiveHome,
  onBuyOrRentProperty,
  ownedVehicles = [],
  activeVehicle = null,
  onSelectActiveVehicle,
  onBuyVehicle,
  investments = [],
  onInvest,
  onLiquidateInvestment,
  onPerformAction,
  onInterstateTravel,
  onLogout,
  onNewLife,
  onUpdateMoney,
  onUpdateStats,
  onLogAction,
  onShowToast = () => {},
  triggerSound,
}) => {
  // Map pan drag state (Zero-Lag Direct Hardware GPU Composited Transform)
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: -750, y: -500 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const touchStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const currentPanRef = useRef<{ x: number; y: number }>({ x: -750, y: -500 });
  const currentZoomRef = useRef<number>(0.85);

  const applyTransform = (x: number, y: number, currentZoom: number) => {
    if (mapContainerRef.current) {
      mapContainerRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${currentZoom}) rotateX(38deg) rotateZ(-12deg)`;
    }
  };

  // Map settings - naturally OFF by default per user request
  const [showLocationNames, setShowLocationNames] = useState<boolean>(false);
  const [soundMuted, setSoundMuted] = useState<boolean>(false);

  // Device detection state (Mobile, Tablet, Desktop) & Responsive Auto-Fit
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>(
    deviceOptimizationProfile?.deviceCategory === 'phone'
      ? 'mobile'
      : deviceOptimizationProfile?.deviceCategory === 'tablet'
      ? 'tablet'
      : 'desktop'
  );

  // Map Zoom state (auto-scaled for mobile/tablet via device profile)
  const [zoom, setZoom] = useState<number>(
    deviceOptimizationProfile?.viewportScale ||
      (typeof window !== 'undefined' && window.innerWidth < 640 ? 0.68 : 0.85)
  );
  const touchDistRef = useRef<number | null>(null);

  // Keep DOM hardware transform smoothly synchronized whenever state updates
  useEffect(() => {
    currentPanRef.current = panOffset;
    currentZoomRef.current = zoom;
    applyTransform(panOffset.x, panOffset.y, zoom);
  }, [panOffset, zoom]);

  useEffect(() => {
    const handleDeviceCheck = () => {
      const w = window.innerWidth;
      if (w < 640) {
        setDeviceType('mobile');
        setZoom((prev) => (prev > 0.72 ? 0.68 : prev));
      } else if (w < 1024) {
        setDeviceType('tablet');
        setZoom((prev) => (prev > 0.85 ? 0.8 : prev));
      } else {
        setDeviceType('desktop');
      }
    };
    handleDeviceCheck();
    window.addEventListener('resize', handleDeviceCheck);
    return () => window.removeEventListener('resize', handleDeviceCheck);
  }, []);

  // State Switcher: Lagos, Abuja, Imo, and Others dropdown
  const [isOthersDropdownOpen, setIsOthersDropdownOpen] = useState<boolean>(false);
  // Previewing state mode: if player clicks a state they are not in
  const [previewState, setPreviewState] = useState<StateData | null>(null);

  // Interstate Travel & Flight Booking Modal (Bus vs Flight with origin, destination & real prices)
  const [travelBookingModalState, setTravelBookingModalState] = useState<StateData | null>(null);
  const [travelBookingMode, setTravelBookingMode] = useState<'bus' | 'plane' | 'private'>('plane');
  const [canadaBusJokeModalOpen, setCanadaBusJokeModalOpen] = useState<boolean>(false);

  // Check owned luxury assets (private jet, helicopter, yacht)
  const userLuxuryVehicles = useMemo(() => {
    const inv = userProfile?.inventory || [];
    return inv.filter((item: string) => {
      const l = item.toLowerCase();
      return (
        l.includes('jet') ||
        l.includes('gulfstream') ||
        l.includes('bombardier') ||
        l.includes('helicopter') ||
        l.includes('sikorsky') ||
        l.includes('yacht') ||
        l.includes('benetti') ||
        l.includes('lurssen')
      );
    });
  }, [userProfile?.inventory]);
  const hasLuxuryFleet = userLuxuryVehicles.length > 0;

  // Modals & Panels
  const [isPhoneOpen, setIsPhoneOpen] = useState<boolean>(false);
  const [phoneInitialApp, setPhoneInitialApp] = useState<PhoneAppType>('home');
  const [isBuyModeOpen, setIsBuyModeOpen] = useState<boolean>(false);
  const [isAirportModalOpen, setIsAirportModalOpen] = useState<boolean>(false);
  const [airportModalTab, setAirportModalTab] = useState<'domestic' | 'international'>('domestic');
  const [selectedFlightStateId, setSelectedFlightStateId] = useState<string>('fct');
  const [selectedAirlineId, setSelectedAirlineId] = useState<string>('air_peace');
  const [selectedCabinClass, setSelectedCabinClass] = useState<FlightCabinClass>('economy');
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>('morning_shuttle');

  // Real live online citizens count for flight surge demand
  const liveCitizensCount = useMemo(() => {
    try {
      const users = getStoredUsers();
      return Math.max(1, Object.keys(users).length);
    } catch {
      return 1;
    }
  }, []);

  // Real distance-based domestic flight details for Airport Terminal Modal
  const airportFlightDetails = useMemo(() => {
    return calculateDomesticFlightDetails(
      currentState.id,
      selectedFlightStateId,
      selectedAirlineId,
      liveCitizensCount,
      selectedCabinClass
    );
  }, [currentState.id, selectedFlightStateId, selectedAirlineId, liveCitizensCount, selectedCabinClass]);

  // Real distance-based flight and bus details for Interstate Travel Modal
  const travelModalFlightDetails = useMemo(() => {
    if (!travelBookingModalState) return null;
    const isCanada = travelBookingModalState.id === 'canada';
    const effectiveAirlineId = isCanada && !CANADA_AIRLINES.some((a) => a.id === selectedAirlineId)
      ? 'air_canada'
      : selectedAirlineId;
    return calculateDomesticFlightDetails(
      currentState.id,
      travelBookingModalState.id,
      effectiveAirlineId,
      liveCitizensCount,
      selectedCabinClass
    );
  }, [currentState.id, travelBookingModalState, selectedAirlineId, liveCitizensCount, selectedCabinClass]);

  const travelModalBusDetails = useMemo(() => {
    if (!travelBookingModalState) return null;
    return calculateInterstateTrip(
      currentState.id,
      travelBookingModalState.id,
      currentState.name,
      travelBookingModalState.name
    );
  }, [currentState.id, travelBookingModalState]);

  // Locations Dropdown state (button to the left of Lagos)
  const [isLocationsDropdownOpen, setIsLocationsDropdownOpen] = useState<boolean>(false);
  const [locationsSearchQuery, setLocationsSearchQuery] = useState<string>('');
  const [locationsCategoryFilter, setLocationsCategoryFilter] = useState<string>('All');
  const [highlightedLocationId, setHighlightedLocationId] = useState<string | null>(null);

  // Dynamic Traffic State (Changes dynamically all the time across 5 Nigerian traffic levels)
  const TRAFFIC_CONDITIONS = useMemo(() => [
    { id: 'free_flow', label: 'Clear Road', subtitle: 'Smooth Cruising · 0 Delay', color: 'text-emerald-300', dot: 'bg-emerald-400', border: 'border-emerald-500/40' },
    { id: 'light', label: 'Light Traffic', subtitle: 'Moving Freely · Minimal Delay', color: 'text-teal-300', dot: 'bg-teal-400', border: 'border-teal-500/40' },
    { id: 'moderate', label: 'Go-Slow', subtitle: 'Moderate Congestion · 15m Delay', color: 'text-amber-300', dot: 'bg-amber-400', border: 'border-amber-500/40' },
    { id: 'heavy', label: 'Heavy Hold-Up', subtitle: 'Bottleneck Slowdown · 35m Delay', color: 'text-orange-400', dot: 'bg-orange-500', border: 'border-orange-500/40' },
    { id: 'gridlock', label: 'Standstill Gridlock', subtitle: 'Severe Jam / Breakdown · Standstill', color: 'text-rose-400', dot: 'bg-rose-500', border: 'border-rose-500/40' },
  ], []);

  const [trafficIndex, setTrafficIndex] = useState<number>(2); // Starts on Go-Slow then shifts dynamically

  useEffect(() => {
    // Dynamically change traffic condition every 14 seconds to simulate real-world Nigerian traffic shifts
    const interval = setInterval(() => {
      setTrafficIndex((prev) => {
        const next = Math.floor(Math.random() * TRAFFIC_CONDITIONS.length);
        return next !== prev ? next : (prev + 1) % TRAFFIC_CONDITIONS.length;
      });
    }, 14000);
    return () => clearInterval(interval);
  }, [TRAFFIC_CONDITIONS.length]);

  // Real-Life Live Weather matching Nigerian States
  const [liveWeather, setLiveWeather] = useState<LiveWeatherData | null>(null);

  const activeStateId = previewState ? previewState.id : currentState?.id || 'lagos';

  useEffect(() => {
    let isMounted = true;
    fetchRealLifeWeather(activeStateId).then((data) => {
      if (isMounted) setLiveWeather(data);
    });
    // Refresh weather every 5 minutes
    const interval = setInterval(() => {
      fetchRealLifeWeather(activeStateId).then((data) => {
        if (isMounted) setLiveWeather(data);
      });
    }, 5 * 60 * 1000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [activeStateId]);

  const [activeInteriorLocation, setActiveInteriorLocation] = useState<{
    id: string;
    name: string;
    type: string;
    floorsCount?: number;
    desc?: string;
  } | null>(null);

  // Commute Transport Modal state (when player clicks building to travel to it)
  const [pendingCommuteTarget, setPendingCommuteTarget] = useState<LocationPOI | null>(null);

  // Active in-flight live simulation state (30s domestic, 60s international)
  const [activeFlightSimulation, setActiveFlightSimulation] = useState<{
    originName: string;
    originIata: string;
    originCity?: string;
    destinationName: string;
    destinationIata: string;
    destinationCity?: string;
    isInternational: boolean;
    airlineName: string;
    aircraftModel: string;
    destState: StateData;
    fare: number;
  } | null>(null);

  const triggerFlightWithSimulation = (
    destState: StateData,
    fare: number,
    customAirlineName?: string,
    customAircraft?: string
  ) => {
    const isCanada = destState.id === 'canada' || currentState.id === 'canada';
    const originAirportObj = STATE_AIRPORTS[currentState.id] || {
      airportName: currentState.name + ' Airport',
      iata: currentState.id === 'canada' ? 'YYZ' : (currentState.id.slice(0, 3).toUpperCase() || 'LOS'),
      city: currentState.name,
      type: 'major_domestic' as const,
    };
    const destAirportObj = destState.id === 'canada'
      ? { airportName: 'Toronto Pearson International Airport (YYZ)', iata: 'YYZ', city: 'Toronto, Canada' }
      : (STATE_AIRPORTS[destState.id] || { airportName: destState.name + ' Airport', iata: destState.id.slice(0, 3).toUpperCase() || 'ABV', city: destState.capital });

    // Close any open travel/booking modals
    setTravelBookingModalState(null);
    setPreviewState(null);
    setIsAirportModalOpen(false);
    setIsPhoneOpen(false);

    setActiveFlightSimulation({
      originName: currentState.name,
      originIata: originAirportObj.iata,
      originCity: originAirportObj.city,
      destinationName: destState.name,
      destinationIata: destAirportObj.iata,
      destinationCity: destAirportObj.city,
      isInternational: isCanada,
      airlineName: customAirlineName || (isCanada ? 'Air Canada / Air Peace Transatlantic Jet' : (DOMESTIC_AIRLINES.find(a => a.id === selectedAirlineId)?.name || 'Air Peace')),
      aircraftModel: customAircraft || (isCanada ? 'Boeing 787-9 Dreamliner' : 'Boeing 737-800 NextGen'),
      destState,
      fare,
    });
  };

  // Active interstate bus road simulation state (strictly 60 seconds / 1 minute)
  const [activeBusSimulation, setActiveBusSimulation] = useState<{
    destinationState: StateData;
    busOperator: string;
    fare: number;
  } | null>(null);

  const triggerBusWithSimulation = (
    destState: StateData,
    fare: number,
    busOperator: string = 'GIGM / Young Shall Grow Luxury Coach'
  ) => {
    setTravelBookingModalState(null);
    setPreviewState(null);
    setIsAirportModalOpen(false);
    setIsPhoneOpen(false);

    setActiveBusSimulation({
      destinationState: destState,
      busOperator,
      fare,
    });
  };

  // Real-world clock & live date (Dynamic for Canada Eastern Time vs Nigeria WAT)
  const [realClock, setRealClock] = useState<string>('8:20 PM');
  const [realDate, setRealDate] = useState<string>('Mon 12');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      if (activeStateId === 'canada') {
        setRealClock(now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', timeZone: 'America/Toronto' }));
        setRealDate(now.toLocaleDateString([], { weekday: 'short', day: 'numeric', timeZone: 'America/Toronto' }));
      } else {
        setRealClock(now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', timeZone: 'Africa/Lagos' }));
        setRealDate(now.toLocaleDateString([], { weekday: 'short', day: 'numeric', timeZone: 'Africa/Lagos' }));
      }
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [activeStateId]);

  // Map Dragging / Panning handlers (Hardware Accelerated Zero-Lag with direct GPU transform)
  const handlePointerDown = (e: React.PointerEvent) => {
    if (isPhoneOpen || isBuyModeOpen || isAirportModalOpen) return;
    if ((e.target as HTMLElement).closest('button, .interactive-pin, .hud-overlay, input, select')) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - currentPanRef.current.x, y: e.clientY - currentPanRef.current.y };
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isPhoneOpen || isBuyModeOpen || isAirportModalOpen) return;
    if (!isDragging) return;
    const newX = Math.max(-2900, Math.min(400, e.clientX - dragStartRef.current.x));
    const newY = Math.max(-2000, Math.min(400, e.clientY - dragStartRef.current.y));
    currentPanRef.current = { x: newX, y: newY };
    applyTransform(newX, newY, currentZoomRef.current);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
    setPanOffset(currentPanRef.current);
  };

  // PC Mouse Wheel Zoom (Locked when phone is open)
  const handleWheel = (e: React.WheelEvent) => {
    if (isPhoneOpen || isBuyModeOpen || isAirportModalOpen) return;
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.08 : -0.08;
    const newZoom = Math.max(0.6, Math.min(2.0, Number((zoom + delta).toFixed(2))));
    setZoom(newZoom);
    currentZoomRef.current = newZoom;
    applyTransform(currentPanRef.current.x, currentPanRef.current.y, newZoom);
  };

  // Mobile Touch 1-Finger Zero-Lag Dragging & 2-Finger Pinch-to-Zoom
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isPhoneOpen || isBuyModeOpen || isAirportModalOpen) return;
    if ((e.target as HTMLElement).closest('button, .interactive-pin, .hud-overlay, input, select')) return;
    if (e.touches.length === 1) {
      touchStartRef.current = {
        x: e.touches[0].clientX - currentPanRef.current.x,
        y: e.touches[0].clientY - currentPanRef.current.y,
      };
    } else if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchDistRef.current = dist;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isPhoneOpen || isBuyModeOpen || isAirportModalOpen) return;
    if (e.touches.length === 1) {
      const newX = Math.max(-2900, Math.min(400, e.touches[0].clientX - touchStartRef.current.x));
      const newY = Math.max(-2000, Math.min(400, e.touches[0].clientY - touchStartRef.current.y));
      currentPanRef.current = { x: newX, y: newY };
      applyTransform(newX, newY, currentZoomRef.current);
    } else if (e.touches.length === 2 && touchDistRef.current !== null) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const diff = dist - touchDistRef.current;
      if (Math.abs(diff) > 2) {
        const factor = diff > 0 ? 0.02 : -0.02;
        const newZoom = Math.max(0.6, Math.min(2.0, Number((currentZoomRef.current + factor).toFixed(2))));
        setZoom(newZoom);
        currentZoomRef.current = newZoom;
        applyTransform(currentPanRef.current.x, currentPanRef.current.y, newZoom);
        touchDistRef.current = dist;
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchDistRef.current = null;
    if (e.touches.length === 0) {
      setPanOffset(currentPanRef.current);
    }
  };

  // Player's Dynamic Mood Calculation (dynamically reacts to health, hunger, energy & happiness)
  const playerMood = useMemo(() => {
    if (health < 25) return { label: 'Sick / Unwell', emoji: '🤒' };
    if (hunger < 25) return { label: 'Starving', emoji: '🤤' };
    if (energy < 25) return { label: 'Exhausted', emoji: '😴' };
    if (happiness < 25) return { label: 'Depressed', emoji: '😞' };

    const avg = (energy + hunger + happiness + health) / 4;
    if (avg >= 85) return { label: 'Thriving', emoji: '🤩' };
    if (avg >= 70) return { label: 'Very Happy', emoji: '😄' };
    if (avg >= 50) return { label: 'Content', emoji: '😌' };
    if (avg >= 35) return { label: 'Stressed', emoji: '🥱' };
    return { label: 'Struggling', emoji: '😫' };
  }, [energy, hunger, happiness, health]);

  // Handle Home Button Click -> Smoothly center map directly on player's house
  const handleGoToMyHouse = () => {
    if (previewState) {
      onShowToast(`You are currently previewing ${previewState.name}. Travel back to your home state to view your house!`);
      return;
    }

    let targetX = 0;
    let targetY = 0;
    let houseId = 'player_home';

    if (activeHome) {
      targetX = activeHome.x ? (activeHome.x / 100) * 3500 + 150 : 2000;
      targetY = activeHome.y ? (activeHome.y / 100) * 2500 + 150 : 2200;
      houseId = activeHome.id;
    } else {
      targetX = (userProfile?.socialClass === 'nepo' ? 74 : userProfile?.socialClass === 'mapo' ? 52 : 36) * 35;
      targetY = (userProfile?.socialClass === 'nepo' ? 32 : userProfile?.socialClass === 'mapo' ? 48 : 70) * 25;
    }

    const targetPanX = Math.max(-2900, Math.min(400, Math.round(window.innerWidth / 2 - targetX)));
    const targetPanY = Math.max(-2000, Math.min(400, Math.round(window.innerHeight / 2 - targetY)));

    setPanOffset({ x: targetPanX, y: targetPanY });
    setHighlightedLocationId(houseId);
    triggerSound?.('stamp');
    onShowToast("📍 Centered on your residence! Click your house to choose your transport means and enter.");
  };

  // State selection logic: opens the travel booking modal showing current state, destination and real prices
  const handleSelectStateTab = (stateId: string) => {
    setIsOthersDropdownOpen(false);
    const targetState = stateId === 'canada'
      ? CANADA_STATE_DATA
      : NIGERIA_36_STATES_ALPHABETICAL.find((s) => s.id === stateId);
    if (!targetState) return;

    if (stateId === currentState.id) {
      setPreviewState(null);
      setTravelBookingModalState(null);
      onShowToast(`Active in ${targetState.name}!`);
    } else {
      setPreviewState(targetState);
      setTravelBookingModalState(targetState);
      if (targetState.id === 'canada') {
        setTravelBookingMode('plane');
      }
      triggerSound?.('coin');
    }
  };

  // Handle Travel Confirmation from Travel Booking Modal
  const handleConfirmStateTravel = (mode: 'bus' | 'plane' | 'private') => {
    const destState = travelBookingModalState || previewState;
    if (!destState) return;

    if (destState.id === 'canada' && mode === 'bus') {
      setCanadaBusJokeModalOpen(true);
      return;
    }

    const isOwner = userProfile?.username?.toLowerCase() === 'chiboy_52';

    // PRIVATE FLEET TRAVEL (Private Jet, Helicopter, Yacht)
    if (mode === 'private') {
      const fuelCost = destState.id === 'canada' ? 3850000 : 1650000;
      if (moneyNGN < fuelCost && !isOwner) {
        onShowToast(`Insufficient funds for VIP Fleet Fuel! Fuel surcharge is ${formatNaira(fuelCost)}.`);
        triggerSound?.('alert');
        return;
      }
      if (destState.id === 'canada') {
        const hasCanadaDoc = (userProfile?.ownedDocuments || []).some(
          (d) => d.country === 'Canada' || ['visa', 'study_permit', 'work_permit', 'pr_card', 'citizenship'].includes(d.type)
        );
        if (!hasCanadaDoc) {
          onShowToast('⛔ CBSA Clearance Blocked: Valid Canadian Visa / Permit required even for private fleet entry!');
          triggerSound?.('alert');
          return;
        }
      }
      if (onUpdateMoney) onUpdateMoney(-fuelCost);
      if (onUpdateStats) onUpdateStats({ happiness: 50, energy: -5 });
      const assetTitle = userLuxuryVehicles[0] || 'Private Jet Fleet';
      triggerFlightWithSimulation(destState, fuelCost, assetTitle, 'Gulfstream G700 / Superyacht VIP Transit');
      onShowToast(`👑 Cruised to ${destState.name} in your ${assetTitle} (-${formatNaira(fuelCost)} Fuel, +50 Joy)!`);
      triggerSound?.('success');
      setTravelBookingModalState(null);
      setPreviewState(null);
      return;
    }

    let fare = 0;
    let airlineName = '';
    let aircraftModel = '';
    if (destState.id === 'canada') {
      const hasCanadaDoc = (userProfile?.ownedDocuments || []).some(
        (d) => d.country === 'Canada' || ['visa', 'study_permit', 'work_permit', 'pr_card', 'citizenship'].includes(d.type)
      );
      if (!hasCanadaDoc) {
        onShowToast('⛔ CBSA Clearance Blocked: Valid Canadian Visa, Study Permit, PR Card or Passport required! Open phone to apply in Immigration App.');
        triggerSound?.('alert');
        return;
      }
      const effectiveAirlineId = CANADA_AIRLINES.some((a) => a.id === selectedAirlineId)
        ? selectedAirlineId
        : 'air_canada';
      const flight = calculateDomesticFlightDetails(currentState.id, destState.id, effectiveAirlineId, liveCitizensCount, selectedCabinClass);
      fare = flight.totalFareNGN;
      airlineName = flight.airlineName;
      aircraftModel = flight.aircraftModel;
    } else if (mode === 'bus') {
      const trip = calculateInterstateTrip(currentState.id, destState.id, currentState.name, destState.name);
      fare = trip.fareNGN;
    } else {
      const flight = calculateDomesticFlightDetails(currentState.id, destState.id, selectedAirlineId, liveCitizensCount, selectedCabinClass);
      fare = flight.totalFareNGN;
      airlineName = flight.airlineName;
      aircraftModel = flight.aircraftModel;
    }

    if (moneyNGN < fare && !isOwner) {
      onShowToast(`Insufficient funds for ${mode === 'plane' ? 'flight' : 'bus ticket'}! Need ${formatNaira(fare)}`);
      triggerSound?.('alert');
      return;
    }

    if (mode === 'plane') {
      triggerFlightWithSimulation(destState, fare, airlineName, aircraftModel);
      return;
    }

    // Interstate road travel by bus -> Trigger strictly 60s (1m) coach bus animation
    triggerBusWithSimulation(destState, fare, 'GIGM / Young Shall Grow Luxury Coach');
  };

  // Handle Location Click on Map
  const handleLocationClick = (loc: LocationPOI) => {
    if (previewState) {
      onShowToast(`You are currently previewing ${previewState.name}! Travel here by Bus or Plane to enter ${loc.name}.`);
      return;
    }
    if (loc.type === 'airport') {
      setIsAirportModalOpen(true);
      triggerSound?.('stamp');
      return;
    }
    setPendingCommuteTarget(loc);
    triggerSound?.('stamp');
  };

  // Handle Commute Selection (Trek, Keke, Danfo, Bolt, Car)
  const handleConfirmCommute = (mode: 'trek' | 'keke' | 'danfo' | 'bolt' | 'car') => {
    if (!pendingCommuteTarget) return;

    let fare = 0;
    let energyCost = 0;
    let hungerCost = 0;
    let joyGain = 0;
    let label = '';

    if (mode === 'trek') {
      fare = 0;
      energyCost = 6;
      hungerCost = 5;
      label = '🚶 Trekked on foot under the Nigerian sun (Free, ₦0)!';
    } else if (mode === 'keke') {
      fare = 300;
      energyCost = 2;
      hungerCost = 2;
      label = '🛺 Commuted via Keke Napep (-₦300)!';
    } else if (mode === 'danfo') {
      fare = 600;
      energyCost = 3;
      hungerCost = 3;
      label = '🚐 Boarded yellow Danfo bus with conductor (-₦600)!';
    } else if (mode === 'bolt') {
      fare = 2500;
      joyGain = 8;
      label = '🚕 Arrived in air-conditioned Bolt cab (-₦2,500, +8 Joy)!';
    } else if (mode === 'car') {
      fare = 1200;
      joyGain = 10;
      label = '🚗 Drove personal luxury ride (-₦1,200 Fuel, +10 Joy)!';
    }

    if (moneyNGN < fare) {
      onShowToast(`Insufficient funds! Need ₦${fare.toLocaleString()}`);
      triggerSound?.('alert');
      return;
    }

    if (fare > 0 && onUpdateMoney) onUpdateMoney(-fare);
    if (onUpdateStats) {
      onUpdateStats({
        energy: -energyCost,
        hunger: -hungerCost,
        happiness: joyGain,
      });
    }

    const target = pendingCommuteTarget;
    setPendingCommuteTarget(null);
    onShowToast(label);
    triggerSound?.(fare > 0 ? 'coin' : 'stamp');

    // Enter building interior!
    setActiveInteriorLocation({
      id: target.id,
      name: target.name,
      type: target.type,
      floorsCount: target.floorsCount || 2,
      desc: target.desc,
    });
  };

  // Handle Airport Flight Booking from Airport Terminal Modal
  const handleConfirmFlightBooking = () => {
    const destState = NIGERIA_36_STATES_ALPHABETICAL.find((s) => s.id === selectedFlightStateId);
    if (!destState) return;

    const details = calculateDomesticFlightDetails(
      currentState.id,
      selectedFlightStateId,
      selectedAirlineId,
      liveCitizensCount,
      selectedCabinClass
    );
    const flightFare = details.totalFareNGN;

    const isOwner = userProfile?.username?.toLowerCase() === 'chiboy_52';
    if (moneyNGN < flightFare && !isOwner) {
      onShowToast(`Insufficient funds! Flight ticket costs ${formatNaira(flightFare)}`);
      triggerSound?.('alert');
      return;
    }

    const selectedCabin = FLIGHT_CABIN_CLASSES.find((c) => c.id === selectedCabinClass) || FLIGHT_CABIN_CLASSES[0];
    if (onUpdateStats) {
      onUpdateStats({ happiness: selectedCabin.joyBonus, energy: -5 });
    }

    setIsAirportModalOpen(false);
    setPreviewState(null);
    triggerFlightWithSimulation(destState, flightFare, details.airlineName, details.aircraftModel);
  };

  // Other 33 states excluding Lagos, Abuja (fct/fct_abuja), and Imo
  const otherStatesList = useMemo(() => {
    return NIGERIA_36_STATES_ALPHABETICAL.filter(
      (s) => s.id !== 'lagos' && s.id !== 'fct' && s.id !== 'fct_abuja' && s.id !== 'imo'
    );
  }, []);

  const displayedStateName = previewState ? previewState.name : currentState?.name || 'Lagos';
  const activeStateLocations = useMemo(() => getStateLocations(activeStateId), [activeStateId]);
  const stateLandmarks = useMemo(() => getStateLandmarks(activeStateId), [activeStateId]);

  // Locations filtered by category and search
  const filteredLocations = useMemo(() => {
    return activeStateLocations.filter((loc) => {
      let matchCat = true;
      if (locationsCategoryFilter === 'Markets') {
        matchCat = loc.type === 'market' || loc.type === 'mall' || loc.type === 'supermarket';
      } else if (locationsCategoryFilter === 'Schools') {
        matchCat = loc.type === 'school' || loc.type === 'university';
      } else if (locationsCategoryFilter === 'Hospitals') {
        matchCat = loc.type === 'hospital' || (loc.type as string) === 'pharmacy';
      } else if (locationsCategoryFilter === 'Banks') {
        matchCat = loc.type === 'bank' || loc.type === 'betting';
      } else if (locationsCategoryFilter === 'Eateries') {
        matchCat = loc.type === 'eatery' || loc.type === 'restaurant';
      } else if (locationsCategoryFilter === 'Hotels & Nightlife') {
        matchCat = loc.type === 'hotel' || loc.type === 'club' || loc.type === 'stadium' || loc.type === 'zoo';
      } else if (locationsCategoryFilter === 'Govt & Law') {
        matchCat = loc.type === 'gov' || loc.type === 'police' || loc.type === 'court';
      } else if (locationsCategoryFilter === 'Transit & Auto') {
        matchCat = loc.type === 'airport' || loc.type === 'mechanic' || loc.type === 'dealership';
      }

      const query = locationsSearchQuery.trim().toLowerCase();
      const matchSearch =
        !query ||
        loc.name.toLowerCase().includes(query) ||
        loc.tagLabel.toLowerCase().includes(query) ||
        (loc.desc && loc.desc.toLowerCase().includes(query)) ||
        loc.type.toLowerCase().includes(query);

      return matchCat && matchSearch;
    });
  }, [activeStateLocations, locationsCategoryFilter, locationsSearchQuery]);

  // Jump to location and close dropdown automatically
  const handleFlyToLocation = (loc: LocationPOI) => {
    setIsLocationsDropdownOpen(false);
    const targetCanvasX = (loc.x / 100) * 3500 + 150;
    const targetCanvasY = (loc.y / 100) * 2500 + 150;
    const viewW = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const viewH = typeof window !== 'undefined' ? window.innerHeight : 800;
    const newPanX = -targetCanvasX * zoom + viewW / 2;
    const newPanY = -targetCanvasY * zoom + viewH / 2;
    setPanOffset({
      x: Math.max(-2900, Math.min(400, newPanX)),
      y: Math.max(-2000, Math.min(400, newPanY)),
    });
    setHighlightedLocationId(loc.id);
    triggerSound?.('coin');
    onShowToast(`📍 Moved map to ${loc.name}!`);
  };

  // Realistic NEPA Power Grid State (Abuja ~92% light ON, Lagos ~68%, varying across Nigeria; completely hidden & 100% in Canada)
  const getStateNepaProb = (stId: string): number => {
    const s = stId.toLowerCase().trim();
    if (s === 'fct' || s === 'fct_abuja' || s === 'abuja') return 0.92; // Abuja: takes light but barely
    if (s === 'lagos') return 0.68;
    if (s === 'rivers') return 0.70;
    if (['edo', 'delta', 'enugu', 'anambra', 'ogun', 'oyo', 'kano', 'kaduna'].includes(s)) return 0.60;
    return 0.48;
  };

  const [nepaLightOn, setNepaLightOn] = useState<boolean>(() => {
    if (activeStateId === 'canada') return true;
    try {
      const raw = localStorage.getItem('naija_life_nepa_grid');
      if (raw) {
        const parsed = JSON.parse(raw);
        const normKey = (activeStateId || 'lagos').toLowerCase().replace(/\s+/g, '_');
        const targetKey = (normKey === 'fct_abuja' || normKey === 'fct') ? 'fct' : normKey;
        const st = parsed[targetKey] || parsed['fct_abuja'] || parsed[normKey];
        if (st && typeof st.lightOn === 'boolean') return st.lightOn;
      }
    } catch {}
    return false;
  });

  useEffect(() => {
    if (activeStateId === 'canada') {
      setNepaLightOn(true);
      return;
    }

    const normKey = (activeStateId || 'lagos').toLowerCase().replace(/\s+/g, '_');
    const targetKey = (normKey === 'fct_abuja' || normKey === 'fct') ? 'fct' : normKey;

    const resolveStateLight = (gridObj: any): boolean | null => {
      if (!gridObj) return null;
      const stateData = gridObj[targetKey] || (targetKey === 'fct' ? gridObj['fct_abuja'] : null) || gridObj[normKey];
      if (stateData && typeof stateData.lightOn === 'boolean') {
        return stateData.lightOn;
      }
      return null;
    };

    const fetchNepaStatus = async () => {
      try {
        const res = await fetch('/api/nepa/grid');
        if (res.ok) {
          const data = await res.json();
          if (data.grid) {
            const lightStatus = resolveStateLight(data.grid);
            if (lightStatus !== null) {
              setNepaLightOn(lightStatus);
            }
          }
        }
      } catch {}
    };

    fetchNepaStatus();
    // Fast 2s polling so the live dynamic cycle and owner phone overrides correspond seamlessly
    const interval = setInterval(fetchNepaStatus, 2000);

    // Real-time broadcast channel coordination between phone control room and map
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('naija_life_nepa');
      bc.onmessage = (evt) => {
        if (evt.data?.grid) {
          const lightStatus = resolveStateLight(evt.data.grid);
          if (lightStatus !== null) {
            setNepaLightOn(lightStatus);
          }
        }
      };
    } catch {}

    return () => {
      clearInterval(interval);
      try { bc?.close(); } catch {}
    };
  }, [activeStateId]);

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={`fixed inset-0 w-screen h-screen overflow-hidden bg-[#0a1610] select-none text-white touch-none ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      }`}
    >
      {/* =========================================================================
          TOP FLOATING CAPSULES (HUD STATUS BAR)
          ========================================================================= */}
      <div className="absolute top-1.5 sm:top-2.5 inset-x-0 z-30 flex flex-col items-center gap-1 sm:gap-1.5 pointer-events-none px-1 sm:px-2 select-none">
        {/* ROW 1: FLOATING STATUS CAPSULE */}
        <div className="pointer-events-auto bg-[#101b14]/95 border border-zinc-700/70 rounded-full px-2.5 sm:px-5 py-1 sm:py-1.5 flex items-center gap-2 sm:gap-4 text-[10px] sm:text-xs shadow-2xl backdrop-blur-md max-w-[98vw] overflow-x-auto no-scrollbar">
          {/* Weather & Time */}
          <div
            className="flex items-center gap-1 sm:gap-1.5 text-zinc-100 font-bold shrink-0"
            title={`Live Weather in ${displayedStateName}: ${liveWeather?.temperatureC ?? 28}°C · ${liveWeather?.conditionLabel ?? 'Humid'}`}
          >
            <span>{liveWeather?.conditionEmoji || '☀️'}</span>
            <span className="font-mono text-[10px] sm:text-xs">
              {realDate} · {realClock}
            </span>
          </div>

          <div className="h-3 w-px bg-zinc-700/80" />

          {/* Player Mood */}
          <div className="flex items-center gap-1 text-emerald-400 font-bold text-[10px] sm:text-xs shrink-0">
            <span>{playerMood.emoji}</span>
            <span>{playerMood.label}</span>
          </div>



          <div className="h-3 w-px bg-zinc-700/80" />

          {/* Sound Toggle (Mute/Unmute owner broadcast music or game audio) */}
          <button
            type="button"
            onClick={() => {
              if (onToggleMusicMute) onToggleMusicMute();
              else setSoundMuted(!soundMuted);
            }}
            className="text-zinc-400 hover:text-white transition-colors cursor-pointer p-0.5 shrink-0"
            title={isMusicMuted ? 'Unmute Owner Radio / Music' : 'Mute Owner Radio / Music'}
          >
            {isMusicMuted ? (
              <VolumeX className="w-3.5 h-3.5 text-zinc-500" />
            ) : (
              <Volume2 className={`w-3.5 h-3.5 ${isBroadcastPlaying ? 'text-emerald-400 animate-pulse' : 'text-zinc-300'}`} />
            )}
          </button>

          {/* Green Wallet Pill: Words display without plus icon as requested */}
          <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-0.5 sm:py-1 rounded-full bg-[#1e6f47] text-white font-mono font-black text-[10px] sm:text-xs shadow-md border border-emerald-400/30 shrink-0">
            <span>{formatMoneyInWords(moneyNGN, activeStateId === 'canada')}</span>
          </div>
        </div>

        {/* ROW 2: NEPA (NIGERIA ONLY), STATE SELECTOR, LOCATIONS DIRECTORY & DYNAMIC LIVE TRAFFIC STATUS */}
        <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2 max-w-[98vw]">
          {/* NEPA Status Indicator: Disappears in Canada as requested! Realistic for Nigerian states */}
          {activeStateId !== 'canada' && (
            <div
              className={`border rounded-full px-2 sm:px-2.5 py-0.5 sm:py-1 flex items-center gap-1.5 shadow-xl backdrop-blur-md text-[9px] sm:text-[11px] font-black uppercase font-mono transition-colors shrink-0 ${
                nepaLightOn
                  ? 'bg-emerald-950/90 border-emerald-500/70 text-emerald-300'
                  : 'bg-rose-950/90 border-rose-500/70 text-rose-300 animate-pulse'
              }`}
              title={`NEPA Power Grid Status in ${displayedStateName}: ${nepaLightOn ? 'Light is ON (Grid Active)' : 'No Light (NEPA Outage)'}`}
            >
              <Zap className={`w-3 h-3 ${nepaLightOn ? 'text-emerald-400' : 'text-rose-400'}`} />
              <span>NEPA: {nepaLightOn ? 'ON' : 'OFF'}</span>
              <span className={`w-1.5 h-1.5 rounded-full ${nepaLightOn ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]' : 'bg-rose-500 shadow-[0_0_8px_#ef4444]'}`} />
            </div>
          )}

          <div className="bg-[#101b14]/90 border border-zinc-700/70 rounded-full px-2 sm:px-3 py-0.5 sm:py-1 flex items-center gap-1.5 sm:gap-2 shadow-xl backdrop-blur-md text-[10px] sm:text-xs">
            {/* State Dropdown Trigger */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsOthersDropdownOpen(!isOthersDropdownOpen);
                  setIsLocationsDropdownOpen(false);
                }}
                className="flex items-center gap-1 sm:gap-1.5 text-white hover:text-amber-300 font-black transition-colors cursor-pointer px-1.5 sm:px-2 py-0.5"
              >
                <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400" />
                <span className="truncate max-w-[85px] sm:max-w-none">{displayedStateName}</span>
                <ChevronDown className={`w-3 h-3 text-zinc-400 transition-transform ${isOthersDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Nigerian States Selection Dropdown */}
              {isOthersDropdownOpen && (
                <div className="absolute left-0 top-8 w-56 max-h-80 overflow-y-auto bg-zinc-950/98 border border-zinc-700 rounded-2xl p-1.5 shadow-2xl backdrop-blur-md z-50 space-y-0.5">
                  <div className="text-[10px] font-mono font-bold text-amber-300 px-2 py-1 uppercase border-b border-zinc-800">
                    Switch Active State Map
                  </div>
                  {/* International Expansion Section (Canada) */}
                  <div className="py-1 border-b border-zinc-800/80">
                    <button
                      type="button"
                      onClick={() => handleSelectStateTab('canada')}
                      className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-between ${
                        (previewState?.id === 'canada' || (!previewState && currentState?.id === 'canada'))
                          ? 'bg-gradient-to-r from-red-600 to-rose-700 text-white font-black'
                          : 'text-zinc-200 hover:bg-zinc-900'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <span>🇨🇦</span>
                        <span>Canada (International)</span>
                      </span>
                      <span className="text-[9px] uppercase tracking-wider text-red-300 font-mono font-bold">150 Locations Live</span>
                    </button>
                  </div>
                  {/* Primary 3 States first */}
                  <div className="py-1 border-b border-zinc-800/80">
                    <button
                      type="button"
                      onClick={() => handleSelectStateTab('lagos')}
                      className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-between ${
                        (previewState?.id === 'lagos' || (!previewState && currentState?.id === 'lagos'))
                          ? 'bg-emerald-600 text-white'
                          : 'text-zinc-200 hover:bg-zinc-900'
                      }`}
                    >
                      <span>🏙️ Lagos State</span>
                      <span className="text-[9px] uppercase tracking-wider text-emerald-300">Commercial Hub</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectStateTab('fct')}
                      className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-between ${
                        (previewState?.id === 'fct' || previewState?.id === 'fct_abuja' || (!previewState && (currentState?.id === 'fct' || currentState?.id === 'fct_abuja')))
                          ? 'bg-blue-600 text-white'
                          : 'text-zinc-200 hover:bg-zinc-900'
                      }`}
                    >
                      <span>🏛️ Abuja (FCT)</span>
                      <span className="text-[9px] uppercase tracking-wider text-sky-300">Federal Capital</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectStateTab('imo')}
                      className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-between ${
                        (previewState?.id === 'imo' || (!previewState && currentState?.id === 'imo'))
                          ? 'bg-emerald-600 text-white'
                          : 'text-zinc-200 hover:bg-zinc-900'
                      }`}
                    >
                      <span>🌴 Imo State</span>
                      <span className="text-[9px] uppercase tracking-wider text-emerald-300">Eastern Heartland</span>
                    </button>
                  </div>
                  {/* All other states */}
                  {otherStatesList.map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => handleSelectStateTab(st.id)}
                      className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors cursor-pointer flex items-center justify-between"
                    >
                      <span>{st.name} State</span>
                      <span className="text-[10px] text-zinc-500">{st.zone}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="h-3 w-px bg-zinc-700/80" />

            {/* Locations Directory Button (shows full list of every location in state) */}
            <button
              type="button"
              onClick={() => {
                setIsLocationsDropdownOpen(!isLocationsDropdownOpen);
                setIsOthersDropdownOpen(false);
              }}
              className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold transition-all cursor-pointer flex items-center gap-1 sm:gap-1.5 ${
                isLocationsDropdownOpen
                  ? 'bg-amber-400 text-zinc-950 font-black shadow-lg shadow-amber-400/30'
                  : 'text-amber-300 hover:text-white hover:bg-zinc-800'
              }`}
              title={`View directory of all ${activeStateLocations.length} locations in ${displayedStateName}`}
            >
              <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" />
              <span className="font-bold">Locations</span>
              <span className="text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.2 rounded-full bg-zinc-800/90 text-amber-200 font-mono font-bold">
                {activeStateLocations.length}
              </span>
            </button>

            {/* Names Toggle Button (Auto shows full names of all locations across map) */}
            <button
              type="button"
              onClick={() => {
                const nextState = !showLocationNames;
                setShowLocationNames(nextState);
                onShowToast(nextState ? '🏷️ Full location names visible across all buildings!' : '🏷️ Location names hidden (hover pins to view)');
              }}
              className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold transition-all cursor-pointer flex items-center gap-1 sm:gap-1.5 ${
                showLocationNames
                  ? 'bg-emerald-500 text-zinc-950 font-black shadow-lg shadow-emerald-500/30 ring-1 ring-emerald-300'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
              }`}
              title="Toggle full location names on the map"
            >
              <span className="text-xs">🏷️</span>
              <span className="font-bold">Names</span>
              <span className={`text-[8px] sm:text-[9px] px-1 sm:px-1.5 py-0.2 rounded font-mono font-black uppercase ${showLocationNames ? 'bg-zinc-950 text-emerald-300' : 'bg-zinc-800 text-zinc-400'}`}>
                {showLocationNames ? 'ON' : 'OFF'}
              </span>
            </button>

            <div className="h-3 w-px bg-zinc-700/80" />

            {/* Dynamic Live Traffic Indicator Pill */}
            <div
              className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 rounded-full bg-zinc-900/90 border ${TRAFFIC_CONDITIONS[trafficIndex].border} text-[9px] sm:text-[10px] font-bold ${TRAFFIC_CONDITIONS[trafficIndex].color} transition-all duration-300 whitespace-nowrap`}
              title={`Live Traffic in ${displayedStateName}: ${TRAFFIC_CONDITIONS[trafficIndex].subtitle}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${TRAFFIC_CONDITIONS[trafficIndex].dot} animate-pulse`} />
              <span>{TRAFFIC_CONDITIONS[trafficIndex].label}</span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          LOCATIONS DIRECTORY DROPDOWN (PULLED WHEN CLICKING LOCATIONS BUTTON)
          ========================================================================= */}
      {isLocationsDropdownOpen && (
        <div className="absolute top-28 right-4 sm:right-16 w-[92vw] sm:w-[420px] max-h-[75vh] bg-zinc-950/95 border-2 border-amber-500/50 rounded-3xl p-4 shadow-2xl backdrop-blur-2xl z-40 flex flex-col pointer-events-auto animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 font-bold">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-black text-white flex items-center gap-1.5">
                  <span>{displayedStateName} Locations Directory</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-400/20 text-amber-300 text-[10px]">
                    {filteredLocations.length} Places
                  </span>
                </h3>
                <p className="text-[10px] text-zinc-400">Click any location to automatically move map there</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsLocationsDropdownOpen(false)}
              className="p-1 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative mt-3 mb-2.5">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={locationsSearchQuery}
              onChange={(e) => setLocationsSearchQuery(e.target.value)}
              placeholder={`Search in ${displayedStateName} (e.g. Market, Hospital, Bank)...`}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-8 pr-7 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
            />
            {locationsSearchQuery && (
              <button
                type="button"
                onClick={() => setLocationsSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none mb-2">
            {[
              { id: 'All', label: 'All', icon: '📍' },
              { id: 'Markets', label: 'Markets & Malls', icon: '🛒' },
              { id: 'Schools', label: 'Schools & Unis', icon: '🎓' },
              { id: 'Hospitals', label: 'Hospitals', icon: '🏥' },
              { id: 'Banks', label: 'Banks & Money', icon: '🏦' },
              { id: 'Eateries', label: 'Eateries', icon: '🍲' },
              { id: 'Hotels & Nightlife', label: 'Hotels & Clubs', icon: '🎉' },
              { id: 'Govt & Law', label: 'Govt & Law', icon: '⚖️' },
              { id: 'Transit & Auto', label: 'Transit & Auto', icon: '🚗' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setLocationsCategoryFilter(cat.id)}
                className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                  locationsCategoryFilter === cat.id
                    ? 'bg-amber-400 text-zinc-950 font-black shadow-md'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Locations List */}
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 scrollbar-none">
            {filteredLocations.length === 0 ? (
              <div className="py-8 text-center text-xs text-zinc-500">
                No locations found matching "{locationsSearchQuery}" in {displayedStateName}.
              </div>
            ) : (
              filteredLocations.map((loc) => {
                const logo = getLocationLogo(loc.type);
                return (
                  <div
                    key={loc.id}
                    onClick={() => handleFlyToLocation(loc)}
                    className="p-2.5 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800/90 border border-zinc-800/80 hover:border-amber-400/50 flex items-center justify-between gap-3 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-base shrink-0 group-hover:scale-110 transition-transform">
                        {logo}
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-black text-white group-hover:text-amber-300 transition-colors truncate">
                          {loc.name}
                        </div>
                        <div className="text-[10px] text-zinc-400 truncate flex items-center gap-1.5">
                          <span className="uppercase text-[9px] font-bold text-amber-400/80">{loc.tagLabel}</span>
                          <span>·</span>
                          <span className="truncate">{loc.desc}</span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-1 text-[10px] font-bold text-amber-400 group-hover:translate-x-0.5 transition-transform">
                      <span className="hidden sm:inline">Move Map</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          PREVIEW MODE FLOATING BANNER (WHEN USER CLICKS STATE THEY ARE NOT IN)
          ========================================================================= */}
      {previewState && (
        <div className="absolute top-28 inset-x-4 z-35 pointer-events-auto max-w-2xl mx-auto">
          <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border-2 border-amber-500/60 rounded-3xl p-3.5 shadow-2xl backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-1.5">
                <span className="px-2 py-0.5 rounded-md bg-amber-500 text-black font-black text-[10px] uppercase">
                  PREVIEW MODE
                </span>
                <span className="text-xs font-bold text-white">Viewing {previewState.name} State Map</span>
              </div>
              <p className="text-[10px] text-zinc-400 mt-0.5">
                You currently reside in <span className="text-emerald-400 font-bold">{currentState.name} State</span>. Travel here to live, work, and enter buildings!
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Option 1: Travel by Bus (Hidden for Canada - Flight only!) */}
              {previewState.id !== 'canada' && (
                <button
                  type="button"
                  onClick={() => {
                    setTravelBookingMode('bus');
                    setTravelBookingModalState(previewState);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all hover:scale-105"
                >
                  <Bus className="w-3.5 h-3.5" />
                  <span>Book Bus</span>
                </button>
              )}

              {/* Option 2: Travel by Plane */}
              <button
                type="button"
                onClick={() => {
                  setTravelBookingMode('plane');
                  setTravelBookingModalState(previewState);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all hover:scale-105"
              >
                <Plane className="w-3.5 h-3.5" />
                <span>{previewState.id === 'canada' ? 'Board Flight to Canada (₦5,000,000)' : 'Book Flight'}</span>
              </button>

              {/* Option 3: Return to current state map */}
              <button
                type="button"
                onClick={() => setPreviewState(null)}
                className="p-1.5 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
                title="Return to your current state map"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          ISOMETRIC 3D MAP VIEWPORT (ANGLED FROM THE SIDE MATCHING LAGOS LIFE)
          ========================================================================= */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-auto"
        style={{
          perspective: '1350px',
          perspectiveOrigin: '50% 50%',
        }}
      >
        <div
          ref={mapContainerRef}
          style={{
            width: '4000px',
            height: '3000px',
            transform: `translate3d(${panOffset.x}px, ${panOffset.y}px, 0) scale(${zoom}) rotateX(38deg) rotateZ(-12deg)`,
            transformOrigin: '2000px 1500px',
            transformStyle: deviceType === 'mobile' ? 'flat' : 'preserve-3d',
            willChange: 'transform',
            transition: 'none',
          }}
          className="relative bg-[#0d2215] select-none"
        >
          {/* VIBRANT TERRAIN TEXTURE GRID WITH LUSH MEADOWS */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#123121] via-[#0f281b] to-[#0a1b11]" />
          <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#22c55e_1.5px,transparent_1.5px)] [background-size:40px_40px]" />

          {/* PERIMETER FOREST OF LOW-POLY TROPICAL & EVERGREEN TREES */}
          {Array.from({ length: deviceType === 'mobile' ? 16 : 48 }).map((_, i) => {
            const total = deviceType === 'mobile' ? 16 : 48;
            const third = Math.floor(total / 3);
            const isLeft = i < third;
            const isRight = i >= third && i < third * 2;
            const posX = isLeft
              ? 50 + (i % 3) * 45
              : isRight
              ? 3680 + (i % 3) * 50
              : 250 + (i - third * 2) * 220;
            const posY = isLeft
              ? 200 + i * (deviceType === 'mobile' ? 360 : 160)
              : isRight
              ? 200 + (i - third) * (deviceType === 'mobile' ? 360 : 160)
              : 60 + ((i % 3) * 40);
            return (
              <div
                key={`perimeter-tree-${i}`}
                style={{ left: `${posX}px`, top: `${posY}px` }}
                className="absolute pointer-events-none z-10 flex flex-col items-center"
              >
                <div
                  className={`w-12 h-14 bg-gradient-to-t from-emerald-950 via-emerald-800 to-green-700 rounded-full ${
                    deviceType === 'mobile' ? 'border border-emerald-700/30' : 'shadow-lg border border-emerald-600/40'
                  } opacity-90`}
                />
                <div className="w-2.5 h-3.5 bg-amber-950 rounded-b" />
              </div>
            );
          })}

          {/* =====================================================================
              1. NATURAL LANDMARKS (ZUMA ROCK ON LEFT, ASO ROCK ON RIGHT)
              ===================================================================== */}
          {/* LEFT MONOLITH: ZUMA ROCK (MASSIVE DARK BASALT PILLAR WITH MOUNTAIN BADGE) */}
          <div
            style={{ left: '160px', top: '780px' }}
            className="absolute w-72 h-[420px] pointer-events-none z-20 flex flex-col items-center"
          >
            {/* Mountain badge icon matching reference photo */}
            <div className="px-2.5 py-1 rounded-full bg-zinc-900/90 border border-zinc-700 shadow-xl flex items-center gap-1.5 text-xs text-amber-300 font-bold mb-2 backdrop-blur-md">
              <span>⛰️</span>
              <span className="text-[10px] uppercase tracking-wider font-mono">Zuma Monolith</span>
            </div>
            {/* Rock Column */}
            <div className="w-64 h-80 bg-gradient-to-b from-[#2a3036] via-[#1a2024] to-[#0d1114] rounded-t-[100px] rounded-b-[40px] border-4 border-zinc-700/80 shadow-[0_35px_70px_rgba(0,0,0,0.9)] relative overflow-hidden flex flex-col items-center justify-end pb-6">
              {/* Vertical basalt striations */}
              <div className="absolute inset-0 opacity-30 bg-[repeating-linear-gradient(90deg,transparent,transparent_12px,#000_12px,#000_16px)]" />
              <div className="w-52 h-64 bg-gradient-to-t from-zinc-950 via-zinc-900 to-zinc-750 rounded-t-[80px] opacity-70 border-t-2 border-zinc-500/80" />
              <span className="text-xs font-mono font-black text-amber-300 uppercase tracking-widest relative z-10 drop-shadow">
                {stateLandmarks.primaryLandmarkName}
              </span>
              <span className="text-[9px] text-zinc-400 font-mono relative z-10">
                {stateLandmarks.primaryLandmarkSubtitle}
              </span>
            </div>
            {/* Surrounding Boulders at Base */}
            <div className="flex gap-2 -mt-4">
              <div className="w-14 h-10 rounded-2xl bg-zinc-800 border border-zinc-700 shadow-md" />
              <div className="w-18 h-12 rounded-3xl bg-zinc-850 border border-zinc-700 shadow-lg" />
              <div className="w-14 h-10 rounded-2xl bg-zinc-800 border border-zinc-700 shadow-md" />
            </div>
          </div>

          {/* RIGHT MONOLITH: ASO ROCK (MASSIVE DARK FACETED GRANITE MONOLITH) */}
          <div
            style={{ left: '3320px', top: '920px' }}
            className="absolute w-88 h-[440px] pointer-events-none z-20 flex flex-col items-center"
          >
            {/* Mountain badge icon */}
            <div className="px-2.5 py-1 rounded-full bg-zinc-900/90 border border-zinc-700 shadow-xl flex items-center gap-1.5 text-xs text-amber-300 font-bold mb-2 backdrop-blur-md">
              <span>⛰️</span>
              <span className="text-[10px] uppercase tracking-wider font-mono">Aso Monolith</span>
            </div>
            {/* Faceted Boulder */}
            <div className="w-80 h-80 bg-gradient-to-bl from-[#2a3036] via-[#161c20] to-[#090d10] rounded-[70px] border-4 border-zinc-700/80 shadow-[0_35px_70px_rgba(0,0,0,0.9)] relative overflow-hidden flex flex-col items-center justify-center p-4">
              {/* Angular facet overlays */}
              <div className="absolute top-2 left-6 w-32 h-32 bg-zinc-700/20 rotate-45 border-r border-zinc-500/30" />
              <div className="absolute bottom-4 right-8 w-40 h-40 bg-zinc-950/60 rotate-12 border-l border-zinc-700/40" />
              <span className="text-sm font-mono font-black text-amber-300 uppercase tracking-widest relative z-10 drop-shadow">
                {stateLandmarks.secondaryLandmarkName}
              </span>
              <span className="text-[9px] text-zinc-400 font-mono relative z-10">
                {stateLandmarks.secondaryLandmarkSubtitle}
              </span>
            </div>
            {/* Base Foothills */}
            <div className="flex gap-2 -mt-4">
              <div className="w-20 h-12 rounded-3xl bg-zinc-850 border border-zinc-700 shadow-md" />
              <div className="w-24 h-14 rounded-3xl bg-zinc-900 border border-zinc-700 shadow-lg" />
              <div className="w-18 h-10 rounded-2xl bg-zinc-850 border border-zinc-700 shadow-md" />
            </div>
          </div>

          {/* NORTH-WEST: JABI LAKE (DEEP SAPPHIRE WATER WITH SHORELINE & SPEEDBOAT) */}
          <div
            style={{ left: '600px', top: '720px' }}
            className="absolute w-[560px] h-[300px] bg-gradient-to-b from-[#0f4068] via-[#092a48] to-[#041624] rounded-[180px] border-4 border-[#38bdf8]/70 shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-col items-center justify-center pointer-events-none overflow-hidden z-15"
          >
            {/* Animated water shimmer rings */}
            <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#38bdf8_2px,transparent_2px)] [background-size:20px_20px] animate-pulse" />
            {/* Lakeside Boardwalk Pier */}
            <div className="absolute bottom-4 left-20 w-32 h-6 bg-amber-900/80 border-t border-amber-600/60 rounded" />
            {/* White Speedboat with Water Ripple */}
            <div className="absolute top-12 right-24 flex flex-col items-center animate-bounce duration-1000">
              <span className="text-4xl drop-shadow-lg">🚤</span>
              <span className="text-[8px] font-mono font-bold text-sky-200 bg-black/75 px-1.5 py-0.5 rounded border border-sky-400/40">
                Speedboat Dock
              </span>
            </div>
            {/* Lake Typography */}
            <span className="text-2xl font-black tracking-[0.25em] text-white uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
              JABI LAKE
            </span>
            <span className="text-xs text-sky-300 font-bold tracking-wider font-mono">
              Federal Waterfront & Promenade
            </span>
          </div>

          {/* =====================================================================
              2. AIRPORT RUNWAY 27 & HUB (BOTTOM-LEFT MATCHING REFERENCE PHOTO)
              ===================================================================== */}
          <div
            onClick={() => setIsAirportModalOpen(true)}
            style={{ left: '260px', top: '2280px' }}
            className="interactive-pin absolute w-[880px] h-[300px] bg-zinc-950 border-4 border-sky-500/70 shadow-[0_0_40px_rgba(14,165,233,0.35)] rounded-3xl flex flex-col justify-between p-5 cursor-pointer group hover:scale-[1.01] transition-all z-20"
          >
            {/* Floating Airport Logo Badge with Hover Glow */}
            <div className="absolute -top-5 left-10 flex flex-col items-center pointer-events-none z-30">
              <div className="w-10 h-10 rounded-full bg-zinc-950 border-2 border-sky-400 shadow-[0_0_20px_rgba(14,165,233,0.8)] flex items-center justify-center group-hover:scale-125 transition-transform">
                <span className="text-lg leading-none drop-shadow">✈️</span>
              </div>
            </div>

            {/* Runway Header */}
            <div className="flex items-center justify-between text-xs font-mono font-bold text-zinc-300 pl-10">
              <div className="flex items-center gap-2.5">
                <Plane className="w-5 h-5 text-sky-400 animate-pulse" />
                <span className="text-base font-black text-white uppercase tracking-wider">
                  {stateLandmarks.airportName}
                </span>
                <span className="px-2 py-0.5 rounded bg-sky-950 border border-sky-400/60 text-[10px] text-sky-300 font-mono">
                  ACTIVE AIRFIELD
                </span>
              </div>
              <span className="px-3.5 py-1.5 bg-sky-500 hover:bg-sky-400 text-black font-black text-xs rounded-xl shadow-lg transition-transform group-hover:scale-105">
                CLICK TO FLY ✈️
              </span>
            </div>

            {/* Runway Asphalt Surface with "27" Number & Dashed Markings */}
            <div className="relative w-full h-24 bg-[#141a22] border-y-2 border-zinc-600 rounded-xl flex items-center px-6 overflow-hidden">
              {/* Runway threshold lines */}
              <div className="flex flex-col gap-1 mr-4">
                <div className="w-12 h-1.5 bg-white" />
                <div className="w-12 h-1.5 bg-white" />
                <div className="w-12 h-1.5 bg-white" />
                <div className="w-12 h-1.5 bg-white" />
              </div>

              {/* BOLD RUNWAY NUMERAL "27" MATCHING REFERENCE PHOTO */}
              <div className="text-5xl font-black font-mono tracking-tighter text-white/95 mr-6 drop-shadow select-none">
                27
              </div>

              {/* Center dashed runway striping */}
              <div className="flex-1 border-b-4 border-dashed border-amber-400/90 h-0 my-auto" />

              {/* Taxiway turnoff lines */}
              <div className="w-20 border-b-2 border-dashed border-sky-400/70 rotate-12 ml-4" />
            </div>

            {/* Parked Aircrafts at Gates */}
            <div className="flex justify-around items-center pt-1 border-t border-zinc-800">
              {[
                { airline: 'Air Peace', gate: 'Gate 1', emoji: '✈️' },
                { airline: 'Ibom Air', gate: 'Gate 2', emoji: '🛫' },
                { airline: 'Green Africa', gate: 'Gate 3', emoji: '🛬' },
                { airline: 'Max Air', gate: 'Gate 4', emoji: '✈️' },
              ].map((f, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-zinc-900/80 px-3 py-1.5 rounded-xl border border-zinc-800">
                  <span className="text-2xl drop-shadow group-hover:scale-110 transition-transform">{f.emoji}</span>
                  <div>
                    <div className="text-[11px] font-mono text-sky-300 font-bold">{f.airline}</div>
                    <div className="text-[9px] text-zinc-400">{f.gate} · Terminal Concourse</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* =====================================================================
              3. ASPHALT ROADWAY NETWORK (EXPRESSWAYS, BOULEVARDS & ROUNDABOUTS)
              ===================================================================== */}
          {/* East-West Primary Expressway 1 */}
          <div className="absolute top-[1200px] left-0 w-full h-20 bg-[#151d26] border-y-2 border-zinc-650 pointer-events-none flex items-center shadow-lg">
            <div className="w-full border-b-2 border-dashed border-amber-400/80 h-0.5" />
          </div>

          {/* East-West Primary Expressway 2 */}
          <div className="absolute top-[2100px] left-0 w-full h-20 bg-[#151d26] border-y-2 border-zinc-650 pointer-events-none flex items-center shadow-lg">
            <div className="w-full border-b-2 border-dashed border-amber-400/80 h-0.5" />
          </div>

          {/* North-South Primary Boulevard 1 */}
          <div className="absolute top-0 left-[1300px] w-20 h-full bg-[#151d26] border-x-2 border-zinc-650 pointer-events-none flex justify-center shadow-lg">
            <div className="h-full border-r-2 border-dashed border-amber-400/80 w-0.5" />
          </div>

          {/* North-South Primary Boulevard 2 */}
          <div className="absolute top-0 left-[2550px] w-20 h-full bg-[#151d26] border-x-2 border-zinc-650 pointer-events-none flex justify-center shadow-lg">
            <div className="h-full border-r-2 border-dashed border-amber-400/80 w-0.5" />
          </div>

          {/* Secondary Cross-Avenues */}
          <div className="absolute top-[680px] left-0 w-full h-14 bg-[#18222c] border-y border-zinc-700/60 pointer-events-none flex items-center opacity-85">
            <div className="w-full border-b border-dashed border-white/40 h-0.5" />
          </div>
          <div className="absolute top-0 left-[680px] w-14 h-full bg-[#18222c] border-x border-zinc-700/60 pointer-events-none flex justify-center opacity-85">
            <div className="h-full border-r border-dashed border-white/40 w-0.5" />
          </div>

          {/* Roundabouts with central palm tree medians */}
          {[
            { x: 1260, y: 1160 },
            { x: 2510, y: 1160 },
            { x: 1260, y: 2060 },
            { x: 2510, y: 2060 },
          ].map((rb, idx) => (
            <div
              key={`roundabout-${idx}`}
              style={{ left: `${rb.x}px`, top: `${rb.y}px` }}
              className="absolute w-32 h-32 rounded-full bg-[#151d26] border-4 border-zinc-600 flex items-center justify-center pointer-events-none shadow-2xl z-15"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-900 border-2 border-emerald-400 shadow-md flex items-center justify-center text-xl">
                🌴
              </div>
            </div>
          ))}

          {/* Zebra Pedestrian Crossings at Intersections */}
          {[
            { x: 1265, y: 1120, w: 70, h: 16, horizontal: true },
            { x: 1265, y: 1285, w: 70, h: 16, horizontal: true },
            { x: 1215, y: 1165, w: 16, h: 70, horizontal: false },
            { x: 1385, y: 1165, w: 16, h: 70, horizontal: false },
            { x: 2515, y: 1120, w: 70, h: 16, horizontal: true },
            { x: 2515, y: 1285, w: 70, h: 16, horizontal: true },
            { x: 2515, y: 2020, w: 70, h: 16, horizontal: true },
            { x: 2515, y: 2185, w: 70, h: 16, horizontal: true },
          ].map((zb, i) => (
            <div
              key={`zebra-${i}`}
              style={{ left: `${zb.x}px`, top: `${zb.y}px`, width: `${zb.w}px`, height: `${zb.h}px` }}
              className="absolute pointer-events-none z-10 flex gap-1 opacity-70"
            >
              <div className="w-full h-full bg-[repeating-linear-gradient(90deg,#fff,#fff_4px,transparent_4px,transparent_8px)]" />
            </div>
          ))}

          {/* Roadside Streetlamps with Warm Cones of Light */}
          {[
            { x: 1240, y: 1140 },
            { x: 2490, y: 1140 },
            { x: 1240, y: 2040 },
            { x: 2490, y: 2040 },
            { x: 700, y: 1200 },
            { x: 1900, y: 1200 },
            { x: 3100, y: 1200 },
            { x: 700, y: 2100 },
            { x: 1900, y: 2100 },
            { x: 3100, y: 2100 },
          ].map((lamp, i) => (
            <div
              key={`streetlamp-${i}`}
              style={{ left: `${lamp.x}px`, top: `${lamp.y}px` }}
              className="absolute pointer-events-none flex items-center justify-center z-15"
            >
              <div className="w-24 h-24 rounded-full bg-amber-400/15 blur-lg" />
              <div className="w-3 h-3 rounded-full bg-amber-200 shadow" />
            </div>
          ))}

          {/* =====================================================================
              4. 3D ROADSIDE BILLBOARDS (CHOWDECK, AIR PEACE, GIGM, NAIJA PAY, NAIJABET)
              ===================================================================== */}
          {[
            {
              x: 520,
              y: 1120,
              title: 'CHOWDECK FOODS',
              subtitle: '🍔 24/7 Fast Naija Delivery',
              bg: 'from-pink-600 via-rose-700 to-amber-600',
              border: 'border-pink-400',
            },
            {
              x: 820,
              y: 1480,
              title: 'AIR PEACE NIGERIA',
              subtitle: '✈️ Your Safety, Our Priority',
              bg: 'from-sky-600 via-blue-700 to-indigo-800',
              border: 'border-sky-400',
            },
            {
              x: 1540,
              y: 1100,
              title: 'GIGM LOGISTICS',
              subtitle: '🚌 Interstate Luxury Coach',
              bg: 'from-amber-500 via-orange-600 to-red-700',
              border: 'border-amber-400',
            },
            {
              x: 2100,
              y: 1280,
              title: 'NAIJA PAY APP',
              subtitle: '💳 0% Fees · Instant Alerts',
              bg: 'from-emerald-600 via-teal-700 to-green-900',
              border: 'border-emerald-400',
            },
            {
              x: 2750,
              y: 1120,
              title: 'NAIJABET SPORTS',
              subtitle: '⚽ 1000% Welcome Payout',
              bg: 'from-purple-600 via-violet-700 to-indigo-900',
              border: 'border-purple-400',
            },
            {
              x: 2850,
              y: 2020,
              title: 'FRASER SUITES',
              subtitle: '🏨 5-Star Executive Towers',
              bg: 'from-yellow-600 via-amber-700 to-stone-900',
              border: 'border-yellow-400',
            },
          ].map((bb, idx) => (
            <div
              key={`billboard-${idx}`}
              style={{ left: `${bb.x}px`, top: `${bb.y}px` }}
              className="absolute pointer-events-none z-20 flex flex-col items-center"
            >
              {/* Dual floodlights at top */}
              <div className="flex justify-between w-36 px-2 mb-0.5">
                <div className="w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_8px_#fff]" />
                <div className="w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_8px_#fff]" />
              </div>
              {/* Billboard Screen */}
              <div className={`w-40 h-20 rounded-xl bg-gradient-to-r ${bb.bg} border-2 ${bb.border} p-2 shadow-2xl flex flex-col justify-between text-center overflow-hidden`}>
                <span className="text-[10px] font-black uppercase text-white tracking-wider drop-shadow">
                  {bb.title}
                </span>
                <span className="text-[9px] font-bold text-amber-200 drop-shadow">
                  {bb.subtitle}
                </span>
                <div className="w-full h-1 bg-white/40 rounded-full" />
              </div>
              {/* Dual steel support posts */}
              <div className="flex justify-between w-28 px-4">
                <div className="w-2 h-7 bg-zinc-700 border-x border-zinc-900" />
                <div className="w-2 h-7 bg-zinc-700 border-x border-zinc-900" />
              </div>
            </div>
          ))}



          {/* =====================================================================
              6. DISTRICT TYPOGRAPHY ON THE TURF (MATCHING REFERENCE PHOTO)
              ===================================================================== */}
          <div
            style={{ left: '1720px', top: '1580px' }}
            className="absolute pointer-events-none text-xl font-black tracking-[0.35em] text-emerald-950/60 font-mono uppercase z-10 select-none"
          >
            CENTRAL BUSINESS DISTRICT
          </div>
          <div
            style={{ left: '2650px', top: '1480px' }}
            className="absolute pointer-events-none text-lg font-black tracking-[0.35em] text-emerald-950/60 font-mono uppercase z-10 select-none"
          >
            THREE ARMS ZONE
          </div>
          <div
            style={{ left: '1750px', top: '2280px' }}
            className="absolute pointer-events-none text-lg font-black tracking-[0.35em] text-emerald-950/60 font-mono uppercase z-10 select-none"
          >
            GARKI DISTRICT
          </div>
          <div
            style={{ left: '3000px', top: '2240px' }}
            className="absolute pointer-events-none text-base font-black tracking-[0.35em] text-emerald-950/60 font-mono uppercase z-10 select-none"
          >
            ASOKORO
          </div>

          {/* =====================================================================
              7. PLAYER'S PERSONAL HOUSE(S)
              ===================================================================== */}
          {(() => {
            const stateProperties = (ownedProperties || []).filter(
              (p) => !p.stateId || p.stateId.toLowerCase() === currentState.id.toLowerCase()
            );

            if (activeHome && (!activeHome.stateId || activeHome.stateId.toLowerCase() === currentState.id.toLowerCase())) {
              if (!stateProperties.some((p) => p.id === activeHome.id)) {
                stateProperties.push(activeHome);
              }
            }

            if (stateProperties.length === 0 && (!userProfile?.spawnStateId || userProfile.spawnStateId === currentState.id)) {
              const defaultX = (userProfile?.socialClass === 'nepo' ? 74 : userProfile?.socialClass === 'mapo' ? 52 : 36) * 35;
              const defaultY = (userProfile?.socialClass === 'nepo' ? 32 : userProfile?.socialClass === 'mapo' ? 48 : 70) * 25;
              const starterHomeLoc: LocationPOI = {
                id: 'player_home',
                name: `${userProfile?.firstName || 'Citizen'}'s Residence`,
                type: 'home',
                tagLabel: 'MY RESIDENCE',
                x: 50,
                y: 80,
                desc: 'Personal private residence',
                floorsCount: userProfile?.socialClass === 'nepo' ? 3 : 1,
              };
              return (
                <LagosLifeBuilding
                  key="player-personal-house-starter"
                  location={starterHomeLoc}
                  isHome={true}
                  homeOwnerName={userProfile?.firstName}
                  showName={showLocationNames}
                  reducedShadows={deviceOptimizationProfile?.reducedShadows || deviceType === 'mobile'}
                  isHighlighted={highlightedLocationId === 'player_home'}
                  style={{ left: `${defaultX}px`, top: `${defaultY}px` }}
                  onClick={() => handleLocationClick(starterHomeLoc)}
                />
              );
            }

            return stateProperties.map((prop) => {
              const isPrimary = !activeHome || activeHome?.id === prop.id;
              const homeX = prop.x ? (prop.x / 100) * 3500 + 150 : 2000;
              const homeY = prop.y ? (prop.y / 100) * 2500 + 150 : 2200;
              const propHomeLoc: LocationPOI = {
                id: prop.id,
                name: prop.title,
                type: 'home',
                tagLabel: isPrimary ? 'PRIMARY HOME' : 'RESIDENCE',
                x: prop.x,
                y: prop.y,
                desc: prop.desc || 'Personal residence',
                floorsCount: prop.floorsCount || 2,
              };

              return (
                <LagosLifeBuilding
                  key={`player-home-${prop.id}`}
                  location={propHomeLoc}
                  isHome={true}
                  homeOwnerName={userProfile?.firstName}
                  showName={showLocationNames}
                  reducedShadows={deviceOptimizationProfile?.reducedShadows || deviceType === 'mobile'}
                  isHighlighted={highlightedLocationId === prop.id}
                  style={{ left: `${homeX}px`, top: `${homeY}px` }}
                  onClick={() => {
                    if (onSelectActiveHome) onSelectActiveHome(prop);
                    handleLocationClick(propHomeLoc);
                  }}
                />
              );
            });
          })()}

          {/* =====================================================================
              8. STATE-SPECIFIC REALISTIC BUILDINGS WITH FLOATING CATEGORY LOGOS
              ===================================================================== */}
          {(() => {
            const isMobile = deviceType === 'mobile' || !!deviceOptimizationProfile?.reducedShadows;

            return activeStateLocations.map((loc) => {
              const posX = (loc.x / 100) * 3500 + 150;
              const posY = (loc.y / 100) * 2500 + 150;
              const isHighlighted = loc.id === highlightedLocationId;

              return (
                <LagosLifeBuilding
                  key={loc.id}
                  location={loc}
                  showName={showLocationNames}
                  reducedShadows={isMobile}
                  isHighlighted={isHighlighted}
                  style={{
                    left: `${posX}px`,
                    top: `${posY}px`,
                  }}
                  onClick={() => handleLocationClick(loc)}
                />
              );
            });
          })()}
        </div>
      </div>

      {/* =========================================================================
          ZOOM IN / OUT FLOATING CONTROLS
          ========================================================================= */}
      <div className="absolute right-5 bottom-24 z-35 pointer-events-auto flex flex-col gap-2 bg-[#101b14]/90 border border-zinc-700/80 p-1.5 rounded-2xl shadow-2xl backdrop-blur-md">
        <button
          type="button"
          onClick={() => setZoom((z) => Math.min(2.0, Number((z + 0.15).toFixed(2))))}
          className="w-8 h-8 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-black text-base flex items-center justify-center transition-colors cursor-pointer border border-zinc-700"
          title="Zoom In"
        >
          +
        </button>
        <div className="text-[9px] font-mono font-bold text-center text-zinc-400 select-none">
          {Math.round(zoom * 100)}%
        </div>
        <button
          type="button"
          onClick={() => setZoom((z) => Math.max(0.6, Number((z - 0.15).toFixed(2))))}
          className="w-8 h-8 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-black text-base flex items-center justify-center transition-colors cursor-pointer border border-zinc-700"
          title="Zoom Out"
        >
          −
        </button>
      </div>

      {/* =========================================================================
          BOTTOM-LEFT HUD: CIRCULAR AVATAR WITH NEON GREEN RING + 6 MINI NEED BARS
          ========================================================================= */}
      {/* =========================================================================
          BOTTOM-LEFT HUD: CIRCULAR AVATAR WITH NEON GREEN RING + 6 MINI NEED BARS
          ========================================================================= */}
      <div className="absolute bottom-[66px] sm:bottom-5 left-2 sm:left-5 z-30 pointer-events-auto flex items-center gap-2 sm:gap-3 bg-[#101b14]/95 border border-zinc-750/90 rounded-2xl sm:rounded-3xl p-1.5 sm:p-2.5 shadow-2xl backdrop-blur-md scale-90 sm:scale-100 origin-bottom-left">
        {/* Circular Avatar Portrait with Neon Green Ring */}
        <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-emerald-950 border-2 sm:border-3 border-emerald-400 p-0.5 shadow-[0_0_15px_rgba(52,211,153,0.5)] flex items-center justify-center shrink-0 overflow-hidden ring-2 ring-emerald-500/30">
          <CharacterRenderer avatar={userProfile?.avatar} size="sm" showBackground={false} />
        </div>

        {/* 6 Mini Need Status Bars in 2 Rows of 3 */}
        <div className="flex flex-col gap-1 sm:gap-1.5">
          {/* Row 1: Hunger (orange), Energy (yellow), Happiness (cyan) */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="flex items-center gap-1" title={`Hunger: ${Math.round(hunger)}%`}>
              <span className="text-[9px] sm:text-[10px]">🍔</span>
              <div className="w-8 sm:w-10 h-1.5 sm:h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500 transition-all duration-300" style={{ width: `${hunger}%` }} />
              </div>
            </div>

            <div className="flex items-center gap-1" title={`Energy: ${Math.round(energy)}%`}>
              <span className="text-[9px] sm:text-[10px]">⚡</span>
              <div className="w-8 sm:w-10 h-1.5 sm:h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 transition-all duration-300" style={{ width: `${energy}%` }} />
              </div>
            </div>

            <div className="flex items-center gap-1" title={`Happiness: ${Math.round(happiness)}%`}>
              <span className="text-[9px] sm:text-[10px]">🎉</span>
              <div className="w-8 sm:w-10 h-1.5 sm:h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-sky-400 transition-all duration-300" style={{ width: `${happiness}%` }} />
              </div>
            </div>
          </div>

          {/* Row 2: Social (purple), Hygiene (blue), Rest/Sleep (teal) */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="flex items-center gap-1" title="Social Well-being">
              <span className="text-[9px] sm:text-[10px]">💬</span>
              <div className="w-8 sm:w-10 h-1.5 sm:h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-purple-400 transition-all duration-300" style={{ width: `${Math.min(100, Math.round(happiness * 0.95 + 5))}%` }} />
              </div>
            </div>

            <div className="flex items-center gap-1" title="Hygiene">
              <span className="text-[9px] sm:text-[10px]">🧼</span>
              <div className="w-8 sm:w-10 h-1.5 sm:h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-400 transition-all duration-300" style={{ width: `${Math.min(100, Math.round(health * 0.9 + 10))}%` }} />
              </div>
            </div>

            <div className="flex items-center gap-1" title="Rest & Sleep">
              <span className="text-[9px] sm:text-[10px]">🌙</span>
              <div className="w-8 sm:w-10 h-1.5 sm:h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-400 transition-all duration-300" style={{ width: `${Math.min(100, Math.round(energy * 0.9 + 10))}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          BOTTOM DOCK (MATCHING LAGOS LIFE REFERENCE PHOTO WITH MY HOUSE & BUY)
          ========================================================================= */}
      <div className="absolute bottom-2 sm:bottom-5 left-1/2 -translate-x-1/2 z-30 bg-[#101b14]/95 border border-zinc-700/80 rounded-full px-3 sm:px-5 py-1.5 sm:py-2 shadow-2xl backdrop-blur-md flex items-center gap-3 sm:gap-6 max-w-[96vw]">
        {/* 1. HOME BUTTON */}
        <button
          type="button"
          onClick={handleGoToMyHouse}
          className="flex flex-col items-center gap-0.5 text-zinc-300 hover:text-white transition-colors cursor-pointer group"
          title="Home / Residence"
        >
          <HomeIcon className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-300 group-hover:text-emerald-400 transition-colors" />
        </button>

        {/* 2. DRIVE / VEHICLES BUTTON */}
        <button
          type="button"
          onClick={() => {
            if (activeVehicle) {
              onShowToast(`🚗 Cruising in ${activeVehicle.name} (${activeVehicle.speed} · Prestige +${activeVehicle.prestige})`);
              triggerSound?.('coin');
            } else {
              setIsPhoneOpen(true);
              onShowToast('Visit Auto Mart in Phone to buy a ride!');
            }
          }}
          className="flex flex-col items-center gap-0.5 text-zinc-300 hover:text-white transition-colors cursor-pointer group"
          title="Drive / Vehicles"
        >
          <Car className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-300 group-hover:text-amber-400 transition-colors" />
        </button>

        {/* 3. MAP BUTTON (GREEN ACTIVE PILL MATCHING REFERENCE PHOTO) */}
        <div className="px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full bg-[#1b432a] border border-emerald-400/50 flex items-center gap-1.5 sm:gap-2 text-white font-bold text-[11px] sm:text-xs shadow-inner">
          <Compass className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
          <span className="text-emerald-200">Map</span>
        </div>

        {/* 4. "MY HOUSE" BUTTON (DIRECT SHORTCUT KEPT PER EXPLICIT REQUEST) */}
        <button
          type="button"
          onClick={handleGoToMyHouse}
          className="flex flex-col items-center gap-0.5 text-zinc-300 hover:text-emerald-400 transition-colors cursor-pointer group"
          title="Enter your house interior"
        >
          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center">
            <span className="text-[10px] sm:text-xs">🏡</span>
          </div>
          <span className="text-[8px] sm:text-[9px] font-black text-emerald-400 whitespace-nowrap">My House</span>
        </button>

        {/* 5. "BUY" BUTTON (DIRECT SHORTCUT KEPT PER EXPLICIT REQUEST) */}
        <button
          type="button"
          onClick={() => setIsBuyModeOpen(true)}
          className="flex flex-col items-center gap-0.5 text-zinc-300 hover:text-amber-400 transition-colors cursor-pointer group"
          title="Open Buy Mart"
        >
          <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 group-hover:scale-110 transition-transform" />
          <span className="text-[8px] sm:text-[9px] font-bold text-amber-300">Buy</span>
        </button>

        {/* 6. PHONE BUTTON (SLEEK TILTED SMARTPHONE GRAPHIC MATCHING REFERENCE PHOTO) */}
        <button
          type="button"
          onClick={() => setIsPhoneOpen(true)}
          className="relative flex flex-col items-center cursor-pointer group hover:scale-110 transition-transform"
          title="Open Naija Phone"
        >
          <div className="w-5 h-7 sm:w-6 sm:h-8 rounded-md bg-gradient-to-tr from-purple-600 via-indigo-500 to-sky-400 border border-white/60 p-0.5 shadow-lg flex flex-col justify-between items-center rotate-6 group-hover:rotate-0 transition-transform">
            <div className="w-2 sm:w-2.5 h-0.5 bg-black rounded-full" />
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-400 absolute -top-1 -right-1 ring-2 ring-zinc-950 animate-ping" />
        </button>
      </div>

      {/* =========================================================================
          AIRPORT TERMINAL MODAL (DOMESTIC REAL FARES + INTERNATIONAL CORRIDORS)
          ========================================================================= */}
      {isAirportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-xl bg-zinc-950 border-2 border-sky-500/60 rounded-3xl p-5 sm:p-6 shadow-[0_0_50px_rgba(14,165,233,0.3)] text-left space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-sky-950 border border-sky-400 flex items-center justify-center text-2xl shadow-inner">
                  ✈️
                </div>
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <span>{stateLandmarks.airportName}</span>
                  </h3>
                  <p className="text-xs text-sky-300 font-mono">
                    Departure Terminal · Origin: {currentState.name} State ({STATE_AIRPORTS[currentState.id]?.iata || 'LOS'})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAirportModalOpen(false)}
                className="text-zinc-500 hover:text-white cursor-pointer p-1 rounded-xl hover:bg-zinc-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Wing Switcher Tabs: Domestic vs International */}
            <div className="grid grid-cols-2 p-1 bg-zinc-900 border border-zinc-800 rounded-2xl">
              <button
                type="button"
                onClick={() => setAirportModalTab('domestic')}
                className={`py-2 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  airportModalTab === 'domestic'
                    ? 'bg-sky-500 text-zinc-950 shadow-md font-black'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <span>🇳🇬 Domestic Flights (36 States)</span>
              </button>
              <button
                type="button"
                onClick={() => setAirportModalTab('international')}
                className={`py-2 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  airportModalTab === 'international'
                    ? 'bg-sky-500 text-zinc-950 shadow-md font-black'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <span>🌍 International Concourse (Japa)</span>
              </button>
            </div>

            {/* TAB 1: DOMESTIC FLIGHTS */}
            {airportModalTab === 'domestic' && (
              <div className="space-y-4">
                {/* Destination Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300 block">
                    Choose Destination Airport (36 Nigerian States):
                  </label>
                  <select
                    value={selectedFlightStateId}
                    onChange={(e) => setSelectedFlightStateId(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-2xl px-3.5 py-2.5 text-xs text-white cursor-pointer focus:outline-none focus:border-sky-400"
                  >
                    {NIGERIA_36_STATES_ALPHABETICAL.map((st) => {
                      const isCurrent = st.id === currentState.id;
                      return (
                        <option
                          key={st.id}
                          value={st.id}
                          disabled={isCurrent}
                          className={isCurrent ? 'text-zinc-500 bg-zinc-950 font-bold' : ''}
                        >
                          {st.name} State {isCurrent ? '— (Current Location - Already Here / Unavailable)' : `— ${STATE_AIRPORTS[st.id]?.airportName || `${st.name} Airport`} (${STATE_AIRPORTS[st.id]?.iata || 'NGA'})`}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Real Live Surge Notice if triggered by live player volume */}
                {airportFlightDetails.isSurgeActive && (
                  <div className="p-3 rounded-2xl bg-amber-950/70 border border-amber-500/60 text-amber-300 text-xs flex items-start gap-2 shadow-inner">
                    <span className="text-base shrink-0">🔥</span>
                    <div>
                      <span className="font-black uppercase text-[10px] tracking-wide block">Peak Airspace Traffic Alert:</span>
                      <p className="text-[11px] text-amber-200 mt-0.5">{airportFlightDetails.surgeReason}</p>
                    </div>
                  </div>
                )}

                {/* Airline Selection (5 Real Nigerian Carriers) */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-300 block">
                    Select Commercial Carrier:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {DOMESTIC_AIRLINES.map((carrier) => {
                      const carrierFlight = calculateDomesticFlightDetails(
                        currentState.id,
                        selectedFlightStateId,
                        carrier.id,
                        liveCitizensCount
                      );
                      const isSelected = selectedAirlineId === carrier.id;
                      return (
                        <button
                          key={carrier.id}
                          type="button"
                          onClick={() => setSelectedAirlineId(carrier.id)}
                          className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-sky-950/90 border-sky-400 ring-2 ring-sky-400/40 shadow-lg shadow-sky-950'
                              : 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-lg">{carrier.logo}</span>
                            <span className="text-[9px] font-mono font-bold text-zinc-400">{carrier.multiplier}x</span>
                          </div>
                          <div className="text-xs font-black text-white mt-1">{carrier.name}</div>
                          <div className="text-[10px] text-zinc-400 truncate">{carrier.aircraft}</div>
                          <div className="text-xs font-mono text-emerald-400 font-black mt-1">
                            {formatNaira(carrierFlight.totalFareNGN)}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Cabin Class Selection (All 4 Real Flying Plans: Economy, Premium Economy, Business, First Class) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-zinc-300 block">
                      Select Travel Cabin Class & Flying Plan:
                    </label>
                    <span className="text-[10px] text-amber-300 font-mono font-bold">4 Cabin Tiers</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {FLIGHT_CABIN_CLASSES.map((cabin) => {
                      const isSelected = selectedCabinClass === cabin.id;
                      const cabinDetails = calculateDomesticFlightDetails(
                        currentState.id,
                        selectedFlightStateId,
                        selectedAirlineId,
                        liveCitizensCount,
                        cabin.id
                      );
                      return (
                        <button
                          key={cabin.id}
                          type="button"
                          onClick={() => setSelectedCabinClass(cabin.id)}
                          className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-gradient-to-br from-amber-950/60 via-zinc-900 to-sky-950/60 border-amber-400 ring-2 ring-amber-400/40 shadow-xl'
                              : 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{cabin.icon}</span>
                              <div>
                                <div className="text-xs font-black text-white flex items-center gap-1.5">
                                  <span>{cabin.name}</span>
                                  {isSelected && (
                                    <span className="px-1.5 py-0.2 rounded bg-amber-400 text-black text-[8px] font-black uppercase">
                                      Selected
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-zinc-400 font-mono">
                                  Baggage: <span className="text-zinc-300 font-bold">{cabin.baggage}</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-xs font-mono font-black text-emerald-400 block">
                                {formatNaira(cabinDetails.totalFareNGN)}
                              </span>
                              <span className="text-[9px] font-mono text-amber-300">+{cabin.joyBonus} Joy</span>
                            </div>
                          </div>
                          {/* Cabin perks */}
                          <div className="mt-2 pt-2 border-t border-zinc-800/80 flex flex-wrap gap-1">
                            {cabin.perks.slice(0, 3).map((perk, pIdx) => (
                              <span
                                key={pIdx}
                                className="px-1.5 py-0.5 rounded-md bg-zinc-950/80 border border-zinc-800 text-[9px] text-zinc-300 font-sans"
                              >
                                {perk}
                              </span>
                            ))}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Flight Route & Ticket Summary */}
                <div className="bg-zinc-900/90 rounded-2xl p-3.5 border border-zinc-800 space-y-2 font-mono">
                  <div className="flex items-center justify-between text-xs border-b border-zinc-800 pb-2">
                    <div>
                      <span className="text-zinc-500 text-[10px] block">FLIGHT ROUTE</span>
                      <span className="text-white font-bold">
                        {STATE_AIRPORTS[currentState.id]?.iata || 'LOS'} ➔ {STATE_AIRPORTS[selectedFlightStateId]?.iata || 'ABV'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-zinc-500 text-[10px] block">AIR DISTANCE & TIME</span>
                      <span className="text-sky-300 font-bold">
                        {airportFlightDetails.distanceKm} km · {airportFlightDetails.flightTimeFormatted}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-zinc-400 block">TOTAL COMMERCIAL AIRFARE:</span>
                      <span className="text-base font-black text-emerald-400">
                        {formatNaira(airportFlightDetails.totalFareNGN)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-zinc-400 block">WALLET BALANCE:</span>
                      <span className={`text-xs font-bold ${moneyNGN >= airportFlightDetails.totalFareNGN ? 'text-zinc-200' : 'text-rose-400'}`}>
                        {formatNaira(moneyNGN)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Confirm Flight Button */}
                <button
                  type="button"
                  onClick={handleConfirmFlightBooking}
                  className="w-full py-3.5 bg-gradient-to-r from-sky-500 via-blue-500 to-sky-500 hover:brightness-110 text-black font-black text-sm rounded-2xl cursor-pointer shadow-xl shadow-sky-950/80 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                >
                  <Plane className="w-4 h-4 fill-black" />
                  <span>Confirm & Board Flight ({formatNaira(airportFlightDetails.totalFareNGN)})</span>
                </button>
              </div>
            )}

            {/* TAB 2: INTERNATIONAL CONCOURSE (UK, CANADA, US, UAE - ALL COMING SOON) */}
            {airportModalTab === 'international' && (
              <div className="space-y-3">
                <div className="bg-sky-950/50 border border-sky-500/40 rounded-2xl p-3 text-xs text-sky-200">
                  <p className="font-bold flex items-center gap-1.5">
                    <span>🌍</span>
                    <span>International Trans-Continental Corridors</span>
                  </p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Bilateral air service agreements and embassy visa integration are currently being commissioned.
                  </p>
                </div>

                <div className="space-y-2.5">
                  {INTERNATIONAL_DESTINATIONS.map((dest) => (
                    <div
                      key={dest.id}
                      className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl">{dest.flag}</span>
                          <div>
                            <div className="text-xs font-black text-white flex items-center gap-2">
                              <span>{dest.country}</span>
                              <span className="text-zinc-400 font-mono text-[10px]">({dest.city})</span>
                            </div>
                            <div className="text-[10px] text-sky-300 font-mono">{dest.airport}</div>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-mono font-black uppercase whitespace-nowrap">
                          {dest.status.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[10px] font-mono bg-zinc-950/60 p-2 rounded-xl border border-zinc-800/80">
                        <div>
                          <span className="text-zinc-500 block">Flight Duration</span>
                          <span className="text-zinc-200 font-bold">{dest.flightDuration}</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block">Ticket Price</span>
                          <span className="text-amber-400 font-bold">{dest.priceDisplay}</span>
                        </div>
                      </div>

                      <div className="text-[10px] text-zinc-400">{dest.desc}</div>
                      <div className="text-[9px] text-zinc-500 font-mono">
                        Requirements: {dest.visaRequirements}
                      </div>

                      {dest.id === 'canada' ? (
                        <div className="pt-2 border-t border-zinc-800 flex justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              const hasCanadaDoc = (userProfile?.ownedDocuments || []).some(
                                (d) => d.country === 'Canada' || ['visa', 'study_permit', 'work_permit', 'pr_card', 'citizenship'].includes(d.type)
                              );
                              if (!hasCanadaDoc) {
                                onShowToast('⛔ CBSA Clearance Blocked: Valid Canadian Visa, Study Permit, PR Card or Passport required! Open phone to apply in Immigration App.');
                                triggerSound?.('alert');
                                return;
                              }
                              if (moneyNGN < 5000000) {
                                onShowToast('Insufficient funds! Direct transatlantic flight to Canada costs ₦5,000,000.');
                                triggerSound?.('alert');
                                return;
                              }
                              if (onUpdateMoney) onUpdateMoney(-5000000);
                              if (userProfile) {
                                if (!Array.isArray(userProfile.receipts)) userProfile.receipts = [];
                                userProfile.receipts.unshift({
                                  id: `TX_AIR_CAN_${Date.now()}`,
                                  title: 'Transatlantic Flight to Toronto Pearson (YYZ)',
                                  category: 'flight',
                                  amount: 5000000,
                                  date: new Date().toLocaleDateString(),
                                  type: 'debit',
                                  currency: 'NGN',
                                });
                              }
                              triggerFlightWithSimulation(
                                CANADA_STATE_DATA as any,
                                5000000,
                                'Air Canada / Air Peace Transatlantic Jet',
                                'Boeing 787-9 Dreamliner'
                              );
                            }}
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs shadow-lg cursor-pointer hover:scale-105 active:scale-95 transition-all"
                          >
                            Book & Board Direct Flight (₦5,000,000)
                          </button>
                        </div>
                      ) : (
                        <div className="pt-1 text-[9px] font-mono text-zinc-500">
                          Status: Diplomatic aviation clearance and bilaterial route integration in progress.
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          INTERSTATE TRAVEL & FLIGHT BOOKING MODAL (WHEN CLICKING STATE TABS)
          ========================================================================= */}
      {travelBookingModalState && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-lg bg-zinc-950 border-2 border-emerald-500/60 rounded-3xl p-5 sm:p-6 shadow-[0_0_50px_rgba(16,185,129,0.3)] text-left space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-950 border border-emerald-400 flex items-center justify-center text-xl shadow-inner">
                  🗺️
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest block">
                    Interstate Travel Booking
                  </span>
                  <h3 className="text-base font-black text-white">
                    {currentState.name} ➔ {travelBookingModalState.name} State
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTravelBookingModalState(null)}
                className="text-zinc-500 hover:text-white cursor-pointer p-1 rounded-xl hover:bg-zinc-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Travel Method Switcher: Bus vs Plane vs Private Fleet */}
            <div className={`grid ${hasLuxuryFleet ? 'grid-cols-3' : 'grid-cols-2'} p-1 bg-zinc-900 border border-zinc-800 rounded-2xl`}>
              <button
                type="button"
                onClick={() => {
                  if (travelBookingModalState.id === 'canada') {
                    setCanadaBusJokeModalOpen(true);
                  } else {
                    setTravelBookingMode('bus');
                  }
                }}
                className={`py-2 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  travelBookingMode === 'bus' && travelBookingModalState.id !== 'canada'
                    ? 'bg-teal-500 text-zinc-950 shadow-md font-black'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Bus className="w-4 h-4" />
                <span>Interstate Bus</span>
              </button>
              <button
                type="button"
                onClick={() => setTravelBookingMode('plane')}
                className={`py-2 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  travelBookingMode === 'plane'
                    ? 'bg-sky-500 text-zinc-950 shadow-md font-black'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Plane className="w-4 h-4" />
                <span>{travelBookingModalState.id === 'canada' ? 'Transatlantic Flight' : 'Domestic Flight'}</span>
              </button>
              {hasLuxuryFleet && (
                <button
                  type="button"
                  onClick={() => setTravelBookingMode('private')}
                  className={`py-2 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    travelBookingMode === 'private'
                      ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-black shadow-md font-black'
                      : 'text-amber-400 hover:text-white'
                  }`}
                >
                  <span>👑</span>
                  <span>Private Fleet</span>
                </button>
              )}
            </div>

            {/* BUS DETAILS (Strictly hidden if destination is Canada) */}
            {travelBookingModalState.id !== 'canada' && travelBookingMode === 'bus' && travelModalBusDetails && (
              <div className="space-y-3 bg-zinc-900/90 p-4 rounded-2xl border border-zinc-800">
                <div className="flex items-center justify-between text-xs border-b border-zinc-800 pb-2">
                  <div>
                    <span className="text-zinc-500 text-[10px] block font-mono">OPERATOR</span>
                    <span className="text-white font-bold">{travelModalBusDetails.busOperator}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-zinc-500 text-[10px] block font-mono">ROAD DISTANCE</span>
                    <span className="text-teal-300 font-bold font-mono">
                      {travelModalBusDetails.distanceKm} km ({travelModalBusDetails.travelTimeFormatted})
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-zinc-400 block font-mono">COMMERCIAL BUS TARIFF:</span>
                    <span className="text-lg font-mono font-black text-emerald-400">
                      {formatNaira(travelModalBusDetails.fareNGN)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-zinc-400 block font-mono">YOUR WALLET:</span>
                    <span className={`text-xs font-mono font-bold ${moneyNGN >= travelModalBusDetails.fareNGN ? 'text-zinc-200' : 'text-rose-400'}`}>
                      {formatNaira(moneyNGN)}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleConfirmStateTravel('bus')}
                  className="w-full py-3 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-zinc-950 font-black text-xs rounded-xl cursor-pointer shadow-lg shadow-teal-950/80 flex items-center justify-center gap-2 mt-2"
                >
                  <Bus className="w-4 h-4" />
                  <span>Board Bus & Travel to {travelBookingModalState.name} ({formatNaira(travelModalBusDetails.fareNGN)})</span>
                </button>
              </div>
            )}

            {/* FLIGHT DETAILS */}
            {(travelBookingModalState.id === 'canada' || travelBookingMode === 'plane') && travelModalFlightDetails && (
              <div className="space-y-3 bg-zinc-900/90 p-4 rounded-2xl border border-zinc-800">
                {/* Airline Selector / Banner */}
                {travelBookingModalState.id === 'canada' ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-zinc-400 uppercase font-bold">Select Transatlantic Carrier:</span>
                      <span className="text-red-400 font-bold">🍁 6 Approved Carriers</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                      {CANADA_AIRLINES.map((al) => (
                        <button
                          key={al.id}
                          type="button"
                          onClick={() => setSelectedAirlineId(al.id)}
                          className={`p-2 rounded-xl border text-left cursor-pointer transition-all ${
                            selectedAirlineId === al.id
                              ? 'bg-red-950/70 border-red-500 ring-1 ring-red-400 shadow-md'
                              : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm">{al.logo}</span>
                            <div className="text-[11px] font-bold text-white truncate">{al.name}</div>
                          </div>
                          <div className="text-[9px] text-zinc-400 truncate">{al.aircraft}</div>
                          <div className="text-[9px] text-emerald-400 font-mono font-bold mt-0.5">
                            {formatNaira(calculateDomesticFlightDetails(currentState.id, travelBookingModalState.id, al.id, liveCitizensCount, selectedCabinClass).totalFareNGN)}
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Cabin Class Selector for Canada */}
                    <div className="pt-2 border-t border-zinc-800 space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="text-zinc-400 uppercase font-bold">Cabin Class:</span>
                        <span className="text-amber-300 font-bold">4 Flying Tiers</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        {CANADA_CABIN_CLASSES.map((cb) => (
                          <button
                            key={cb.id}
                            type="button"
                            onClick={() => setSelectedCabinClass(cb.id)}
                            className={`p-2 rounded-xl border text-left cursor-pointer transition-all ${
                              selectedCabinClass === cb.id
                                ? 'bg-amber-950/60 border-amber-400 ring-1 ring-amber-400 shadow-md'
                                : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-white flex items-center gap-1">
                                <span>{cb.icon}</span>
                                <span>{cb.name}</span>
                              </span>
                              <span className="text-[9px] font-mono text-amber-300 font-bold">+{cb.joyBonus} Joy</span>
                            </div>
                            <div className="text-[9px] text-zinc-400 font-mono mt-0.5 truncate">{cb.baggage}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="grid grid-cols-3 gap-1.5">
                      {DOMESTIC_AIRLINES.slice(0, 3).map((al) => (
                        <button
                          key={al.id}
                          type="button"
                          onClick={() => setSelectedAirlineId(al.id)}
                          className={`p-2 rounded-xl border text-left cursor-pointer transition-all ${
                            selectedAirlineId === al.id
                              ? 'bg-sky-950 border-sky-400 ring-1 ring-sky-400'
                              : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                          }`}
                        >
                          <div className="text-xs font-bold text-white">{al.name}</div>
                          <div className="text-[9px] text-sky-400 font-mono font-bold mt-0.5">
                            {formatNaira(calculateDomesticFlightDetails(currentState.id, travelBookingModalState.id, al.id, liveCitizensCount, selectedCabinClass).totalFareNGN)}
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Cabin Class Selector for Domestic */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
                      {FLIGHT_CABIN_CLASSES.map((cb) => (
                        <button
                          key={cb.id}
                          type="button"
                          onClick={() => setSelectedCabinClass(cb.id)}
                          className={`p-1.5 rounded-lg border text-left cursor-pointer transition-all text-[10px] ${
                            selectedCabinClass === cb.id
                              ? 'bg-sky-950 border-sky-400 text-white font-bold'
                              : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                          }`}
                        >
                          <div className="truncate">{cb.icon} {cb.name}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs border-b border-zinc-800 pb-2 font-mono">
                  <div>
                    <span className="text-zinc-500 text-[10px] block">AIR ROUTE</span>
                    <span className="text-white font-bold">
                      {STATE_AIRPORTS[currentState.id]?.iata || 'LOS'} ➔ {travelBookingModalState.id === 'canada' ? 'YYZ (Toronto)' : (STATE_AIRPORTS[travelBookingModalState.id]?.iata || 'ABV')}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-zinc-500 text-[10px] block">FLIGHT TIME</span>
                    <span className="text-sky-300 font-bold">
                      {travelModalFlightDetails.distanceKm} km · {travelModalFlightDetails.flightTimeFormatted}
                    </span>
                  </div>
                </div>

                {/* Canada Document Status Notice */}
                {travelBookingModalState.id === 'canada' && (
                  <div className="p-2 rounded-xl bg-zinc-950 border border-zinc-800 text-[10px]">
                    {(userProfile?.ownedDocuments || []).some(
                      (d) => d.country === 'Canada' || ['visa', 'study_permit', 'work_permit', 'pr_card', 'citizenship'].includes(d.type)
                    ) ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> CBSA Clearance: Valid Canadian travel documents verified!
                      </span>
                    ) : (
                      <span className="text-amber-400 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> CBSA Requirement: Valid Canadian Visa, Study Permit, PR Card or Passport required. Apply in Immigration App on your phone.
                      </span>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between font-mono">
                  <div>
                    <span className="text-[10px] text-zinc-400 block">
                      {travelBookingModalState.id === 'canada' ? 'TRANSATLANTIC FARE:' : 'DOMESTIC TICKET PRICE:'}
                    </span>
                    <span className="text-lg font-black text-emerald-400">
                      {formatNaira(travelModalFlightDetails.totalFareNGN)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-zinc-400 block">YOUR WALLET:</span>
                    <span className={`text-xs font-bold ${moneyNGN >= travelModalFlightDetails.totalFareNGN ? 'text-zinc-200' : 'text-rose-400'}`}>
                      {formatNaira(moneyNGN)}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleConfirmStateTravel('plane')}
                  className="w-full py-3 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-black font-black text-xs rounded-xl cursor-pointer shadow-lg shadow-sky-950/80 flex items-center justify-center gap-2 mt-2"
                >
                  <Plane className="w-4 h-4 fill-black" />
                  <span>
                    {travelBookingModalState.id === 'canada'
                      ? `Board Transatlantic Flight & Fly to Canada (${formatNaira(travelModalFlightDetails.totalFareNGN)})`
                      : `Board Flight & Fly to ${travelBookingModalState.name} (${formatNaira(travelModalFlightDetails.totalFareNGN)})`}
                  </span>
                </button>
              </div>
            )}

            {/* PRIVATE FLEET DETAILS (JET / HELICOPTER / YACHT) */}
            {hasLuxuryFleet && travelBookingMode === 'private' && (
              <div className="space-y-3 bg-gradient-to-br from-amber-950/70 via-zinc-950 to-neutral-900 p-4 rounded-2xl border-2 border-amber-500/60 shadow-xl">
                <div className="flex items-center justify-between border-b border-amber-500/30 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">👑</span>
                    <div>
                      <span className="text-[10px] text-amber-400 font-mono font-bold uppercase block">
                        VIP Hangar & Marina Fleet
                      </span>
                      <h4 className="text-xs font-black text-white">
                        {userLuxuryVehicles[0] || 'Private Jet / Yacht Fleet'}
                      </h4>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-amber-400 text-black text-[9px] font-black uppercase">
                    VIP OWNED
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-black/60 border border-white/10 text-[10px] font-mono space-y-1">
                  <div className="flex justify-between text-zinc-400">
                    <span>Aviation / Marine Route:</span>
                    <span className="text-white font-bold">
                      {currentState.name} ➔ {travelBookingModalState.name}
                    </span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>VIP Prestige & Joy Boost:</span>
                    <span className="text-amber-300 font-bold">+50 Joy (Pure Executive Comfort)</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Flight Time:</span>
                    <span className="text-emerald-400 font-bold">Direct Supersonic / Express Cruise</span>
                  </div>
                </div>

                {/* Canada Document Requirement notice for private jet */}
                {travelBookingModalState.id === 'canada' && (
                  <div className="p-2 rounded-xl bg-red-950/50 border border-red-500/40 text-[9px] text-red-200">
                    CBSA Border Notice: Even on private charter or yacht, international aviation law requires valid Canadian documents.
                  </div>
                )}

                <div className="flex items-center justify-between pt-1 border-t border-zinc-800 font-mono">
                  <div>
                    <span className="text-[9px] text-zinc-400 uppercase block">Jet / Marine Fuel Surcharge:</span>
                    <span className="text-base font-black text-amber-400">
                      {formatNaira(travelBookingModalState.id === 'canada' ? 3850000 : 1650000)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-zinc-400 uppercase block">Wallet Balance:</span>
                    <span className={`text-xs font-bold ${moneyNGN >= (travelBookingModalState.id === 'canada' ? 3850000 : 1650000) ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {formatNaira(moneyNGN)}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleConfirmStateTravel('private')}
                  className="w-full py-3 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-black font-black text-xs rounded-xl cursor-pointer shadow-lg shadow-amber-950/80 flex items-center justify-center gap-2 mt-2 transition-all active:scale-98"
                >
                  <span>👑</span>
                  <span>
                    Depart in {userLuxuryVehicles[0] || 'Private Fleet'} ({formatNaira(travelBookingModalState.id === 'canada' ? 3850000 : 1650000)} Fuel)
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          CANADA BUS JOKE MODAL ("shey you be mumu, you wan use bus go canada, ole, gerrout jorr😂")
          ========================================================================= */}
      {canadaBusJokeModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-gradient-to-b from-zinc-950 via-zinc-900 to-black border-2 border-amber-500 rounded-3xl p-6 shadow-[0_0_60px_rgba(245,158,11,0.5)] text-center space-y-4 animate-in zoom-in-95">
            <div className="w-20 h-20 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-4xl mx-auto shadow-inner">
              😂
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-black text-amber-400 uppercase tracking-widest block">
                Naija Life Transit Authority 🇳🇬
              </span>
              <h3 className="text-lg font-black text-white leading-tight">
                "shey you be mumu, you wan use bus go canada, ole, gerrout jorr😂"
              </h3>
            </div>
            <div className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800 text-xs text-zinc-300 leading-relaxed font-sans">
              Oga who wan drive yellow Danfo or GIGM interstate bus cross Atlantic Ocean to Toronto? Water go drown you o! Transatlantic travel to Canada is strictly commercial flight or private jet.
            </div>
            <button
              type="button"
              onClick={() => setCanadaBusJokeModalOpen(false)}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-black font-black text-xs cursor-pointer shadow-xl transition-all"
            >
              Oya I hear you, gerrout! (Close)
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          COMMUTE / TRANSPORTATION OPTIONS MODAL (WHEN VISITING BUILDINGS)
          ========================================================================= */}
      {/* =========================================================================
          INTERIOR RENOVATION & ARCHITECTURAL FIT-OUT NOTICE (FOR ALL BUILDINGS)
          ========================================================================= */}
      {pendingCommuteTarget && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-zinc-950 border-2 border-amber-500/60 rounded-3xl p-6 shadow-2xl text-left space-y-4 relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-36 h-36 bg-yellow-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* Header & Construction Ribbon */}
            <div className="flex items-start justify-between pb-3 border-b border-zinc-800 relative z-10">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-black uppercase">
                  <span>🚧</span>
                  <span>INTERIOR FIT-OUT & ACTIVE RENOVATION</span>
                </div>
                <h3 className="text-xl font-black text-white tracking-tight">
                  {pendingCommuteTarget.name}
                </h3>
                <p className="text-xs text-zinc-400 font-mono">
                  📍 {currentState.name} State · {pendingCommuteTarget.desc || 'Commercial Landmark'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPendingCommuteTarget(null)}
                className="p-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Renovation Notice Details */}
            <div className="space-y-3 relative z-10">
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-950/60 via-zinc-900/80 to-black border border-amber-500/30 text-xs text-zinc-300 leading-relaxed space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono font-bold text-amber-300">
                  <span className="flex items-center gap-1">
                    <span>🏗️</span>
                    <span>Federal Works & Urban Planning Directive</span>
                  </span>
                  <span className="text-[10px] bg-amber-500/20 px-2 py-0.5 rounded text-amber-200">
                    PERMIT #NJA-2025-ARCH
                  </span>
                </div>
                <p>
                  Please bear with us! The indoor interiors of <strong>{pendingCommuteTarget.name}</strong> are currently undergoing intensive architectural remodeling, marble flooring installation, soundproof acoustic wall fit-outs, and customized interactive station setups.
                </p>
                <p className="text-[11px] text-zinc-400">
                  Our master construction teams and electrical engineers are working round the clock to deliver hyper-realistic walkthroughs. No manual commuting is needed to access services!
                </p>
              </div>

              {/* Progress Indicator */}
              <div className="p-3 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-zinc-400 flex items-center gap-1.5">
                    <span>👷‍♂️</span>
                    <span>Interior Remodeling Completion:</span>
                  </span>
                  <span className="text-amber-300 font-bold">84% Finalized</span>
                </div>
                <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400 rounded-full w-[84%]" />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                  <span>Structural Framing ✓</span>
                  <span>Acoustics & Lighting ✓</span>
                  <span>3D Walkthrough Fit-Out (Active)</span>
                </div>
              </div>

              {/* Work Phone Hint */}
              <div className="p-2.5 rounded-xl bg-blue-950/40 border border-blue-500/30 flex items-center gap-2.5 text-xs text-blue-200">
                <span className="text-base">📱</span>
                <div>
                  <strong>Work Shift Notice:</strong> All occupational shifts and career tasks are performed directly through your <strong>Smartphone Job Portal</strong> without needing physical interior entry.
                </div>
              </div>
            </div>

            {/* Primary Action Button */}
            <button
              type="button"
              onClick={() => {
                setPendingCommuteTarget(null);
                triggerSound?.('coin');
              }}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 text-black font-black text-sm tracking-wide shadow-xl shadow-amber-500/20 cursor-pointer active:scale-98 transition-all flex items-center justify-center gap-2 relative z-10"
            >
              <span>Understood (Bear With Us & Be Patient)</span>
              <Check className="w-4 h-4 text-black" />
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          INTERIOR VIEW MODAL
          ========================================================================= */}
      {activeInteriorLocation && (
        <InteriorView
          location={activeInteriorLocation}
          userProfile={userProfile}
          activeHome={activeHome}
          onExit={() => setActiveInteriorLocation(null)}
          onUpdateStats={onUpdateStats || (() => {})}
          onUpdateMoney={onUpdateMoney}
          onShowToast={onShowToast}
          triggerSound={triggerSound}
        />
      )}

      {/* =========================================================================
          BUY MODE MODAL (House Furnishings)
          ========================================================================= */}
      {isBuyModeOpen && (
        <BuyModeModal
          isOpen={isBuyModeOpen}
          onClose={() => setIsBuyModeOpen(false)}
          moneyNGN={moneyNGN}
          ownedFurnitureIds={userProfile?.furnitureBought || []}
          onPurchaseItem={(item) => {
            if (moneyNGN < item.priceNGN) {
              onShowToast(`Insufficient funds for ${item.name}!`);
              triggerSound?.('alert');
              return;
            }
            if (onUpdateMoney) onUpdateMoney(-item.priceNGN);
            if (userProfile) {
              userProfile.furnitureBought = [...(userProfile.furnitureBought || []), item.id];
            }
            onShowToast(`🎉 Purchased and installed ${item.name}!`);
            triggerSound?.('success');
          }}
          triggerSound={triggerSound}
        />
      )}

      {/* =========================================================================
          NAIJA PHONE MODAL
          ========================================================================= */}
      <NaijaPhone
        isOpen={isPhoneOpen}
        onClose={() => setIsPhoneOpen(false)}
        userProfile={userProfile}
        moneyNGN={moneyNGN}
        moneyUSD={moneyUSD}
        energy={energy}
        hunger={hunger}
        health={health}
        happiness={happiness}
        ownedProperties={ownedProperties}
        activeHome={activeHome}
        onSelectActiveHome={onSelectActiveHome || (() => {})}
        onBuyOrRentProperty={onBuyOrRentProperty || (() => {})}
        ownedVehicles={ownedVehicles}
        activeVehicle={activeVehicle}
        onSelectActiveVehicle={onSelectActiveVehicle || (() => {})}
        onBuyVehicle={onBuyVehicle || (() => {})}
        investments={investments}
        onInvest={onInvest || (() => {})}
        onLiquidateInvestment={onLiquidateInvestment || (() => {})}
        onUpdateMoney={onUpdateMoney || (() => {})}
        onUpdateStats={onUpdateStats || (() => {})}
        onLogAction={onLogAction || (() => {})}
        onShowToast={onShowToast}
        onLogout={onLogout}
        triggerSound={triggerSound}
        currentStateId={currentState.id}
        initialApp={phoneInitialApp}
        onInterstateTravel={(targetState, fare) => {
          // Bus fallback
          triggerBusWithSimulation(targetState as any, fare);
        }}
        onFlightTravel={(targetState, fare, airlineName, aircraftModel) => {
          // Trigger the high-altitude airline flight simulation (30s domestic, 60s international)
          triggerFlightWithSimulation(targetState as any, fare, airlineName, aircraftModel);
        }}
        onBusTravel={(targetState, fare, busOperator) => {
          // Trigger the interstate coach bus simulation (strictly 60s / 1m)
          triggerBusWithSimulation(targetState as any, fare, busOperator);
        }}
      />

      {/* =========================================================================
          CRAZY ANIMATED IN-FLIGHT SIMULATION OVERLAY (30s DOMESTIC, 60s INTERNATIONAL)
          ========================================================================= */}
      {activeFlightSimulation && (
        <InFlightSimulationOverlay
          originName={activeFlightSimulation.originName}
          originIata={activeFlightSimulation.originIata}
          originCity={activeFlightSimulation.originCity}
          destinationName={activeFlightSimulation.destinationName}
          destinationIata={activeFlightSimulation.destinationIata}
          destinationCity={activeFlightSimulation.destinationCity}
          isInternational={activeFlightSimulation.isInternational}
          airlineName={activeFlightSimulation.airlineName}
          aircraftModel={activeFlightSimulation.aircraftModel}
          triggerSound={triggerSound}
          onFlightComplete={() => {
            const { destState, fare, isInternational } = activeFlightSimulation;
            if (onInterstateTravel) {
              onInterstateTravel(destState, fare);
            } else if (onUpdateMoney) {
              onUpdateMoney(-fare);
            }
            setActiveFlightSimulation(null);
            onShowToast(
              isInternational
                ? '🇨🇦 Welcome to Canada! Landed safely at Toronto Pearson International Airport (YYZ)!'
                : `🛬 Touchdown! Landed safely in ${destState.name} State (${destState.capital})!`
            );
            triggerSound?.('success');
          }}
        />
      )}

      {/* =========================================================================
          INTERSTATE BUS ROAD TRAVEL ANIMATION (STRICTLY 60s / 1 MINUTE DURATION)
          ========================================================================= */}
      {activeBusSimulation && (
        <InterstateBusSimulationOverlay
          originStateName={currentState.name}
          destinationState={{
            id: activeBusSimulation.destinationState.id,
            name: activeBusSimulation.destinationState.name,
            capital: activeBusSimulation.destinationState.capital,
            region: activeBusSimulation.destinationState.zone,
          }}
          busOperator={activeBusSimulation.busOperator}
          fare={activeBusSimulation.fare}
          triggerSound={triggerSound}
          onBusComplete={() => {
            const { destinationState, fare } = activeBusSimulation;
            if (onInterstateTravel) {
              onInterstateTravel(destinationState, fare);
            } else if (onUpdateMoney) {
              onUpdateMoney(-fare);
            }
            setActiveBusSimulation(null);
            onShowToast(`🎉 Arrived safely in ${destinationState.name} State terminal via Interstate Coach (-${formatNaira(fare)})!`);
            triggerSound?.('success');
          }}
        />
      )}
    </div>
  );
};
