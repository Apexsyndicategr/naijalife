/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Footprints,
  Sparkles,
  ArrowRight,
  Layers,
  ChevronUp,
  Volume2,
  CheckCircle2,
  Zap,
  Utensils,
  Smile,
  LogOut,
  Bed,
  Tv,
  Bath,
  Coffee,
  Laptop,
  Briefcase,
  Building,
  Plane,
  Shield,
  ShoppingBag,
  HeartPulse,
  Church,
  Landmark,
  Coins,
  Music,
  Users,
  GraduationCap
} from 'lucide-react';
import { UserProfile, PropertyAsset, LocationPOI, FurnitureItem } from '../types/game';
import { CharacterRenderer } from './CharacterRenderer';

export interface InteriorViewProps {
  location: {
    id: string;
    name: string;
    type: string;
    floorsCount?: number;
    desc?: string;
  };
  userProfile: UserProfile;
  activeHome: PropertyAsset | null;
  onExit: () => void;
  onUpdateStats: (effects: { energy?: number; hunger?: number; happiness?: number }) => void;
  onUpdateMoney?: (deltaNGN: number) => void;
  onShowToast: (message: string) => void;
  triggerSound?: (type: 'coin' | 'stamp' | 'alert' | 'success') => void;
}

export const InteriorView: React.FC<InteriorViewProps> = ({
  location,
  userProfile,
  activeHome,
  onExit,
  onUpdateStats,
  onUpdateMoney,
  onShowToast,
  triggerSound,
}) => {
  // Avatar walking position (% coordinates on room floor)
  const [avatarPos, setAvatarPos] = useState<{ x: number; y: number }>({ x: 50, y: 72 });
  const [isWalking, setIsWalking] = useState<boolean>(false);
  const [facingLeft, setFacingLeft] = useState<boolean>(false);
  const [currentFloor, setCurrentFloor] = useState<number>(1);
  const [showFloorsModal, setShowFloorsModal] = useState<boolean>(false);
  const [activeInteraction, setActiveInteraction] = useState<string | null>(null);

  const isHome = location.type === 'home' || location.id.startsWith('prop_') || location.id === 'starter_home';
  const totalFloors = location.floorsCount || (isHome ? (activeHome?.floorsCount || 2) : 2);

  const walkTimerRef = useRef<any>(null);

  // Handle floor click -> walk avatar to clicked coordinate with stepping animation
  const handleFloorClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    // Constrain walking area within room walkable floor (Y between 42% and 86%)
    const clampedX = Math.max(12, Math.min(88, clickX));
    const clampedY = Math.max(45, Math.min(86, clickY));

    // Turn avatar towards walking direction
    setFacingLeft(clampedX < avatarPos.x);

    // Calculate distance to adjust walk animation duration
    const dist = Math.hypot(clampedX - avatarPos.x, clampedY - avatarPos.y);
    const duration = Math.max(500, Math.min(1200, dist * 22));

    setIsWalking(true);
    setAvatarPos({ x: clampedX, y: clampedY });

    clearTimeout(walkTimerRef.current);
    walkTimerRef.current = setTimeout(() => {
      setIsWalking(false);
    }, duration);
  };

  // Perform object interactions
  const handleInteractObject = (action: {
    title: string;
    energyEffect?: number;
    hungerEffect?: number;
    joyEffect?: number;
    cost?: number;
    message: string;
    sound?: 'coin' | 'stamp' | 'success';
  }) => {
    setActiveInteraction(action.title);
    setTimeout(() => setActiveInteraction(null), 2500);

    if (action.cost && onUpdateMoney) {
      const totalAvailable = (userProfile?.cashNaira || 0) + (userProfile?.bankNaira || 0);
      if (totalAvailable < action.cost) {
        onShowToast(`Insufficient funds! Need ₦${action.cost.toLocaleString()}`);
        triggerSound?.('alert');
        return;
      }
      onUpdateMoney(-action.cost);
    }

    onUpdateStats({
      energy: action.energyEffect || 0,
      hunger: action.hungerEffect || 0,
      happiness: action.joyEffect || 0,
    });

    onShowToast(action.message);
    triggerSound?.(action.sound || 'coin');
  };

  const locType = location.type.toLowerCase();

  return (
    <div className="fixed inset-0 z-40 bg-zinc-950 flex flex-col select-none overflow-hidden">
      {/* =========================================================================
          TOP INTERIOR HUD BAR
          ========================================================================= */}
      <header className="h-14 bg-zinc-900/90 border-b border-zinc-800 px-4 flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-black">
            {isHome ? '🏠' : locType === 'church' ? '⛪' : locType === 'mosque' ? '🕌' : locType === 'bank' ? '🏦' : locType === 'airport' ? '✈️' : locType === 'hospital' ? '🏥' : '🏢'}
          </div>
          <div>
            <h2 className="text-sm font-black text-white flex items-center gap-2">
              <span>{location.name}</span>
              <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-[10px] text-zinc-400 font-mono font-normal">
                Floor {currentFloor} of {totalFloors}
              </span>
            </h2>
            <p className="text-[11px] text-zinc-400">
              {isHome
                ? `Private Residence • ${userProfile.socialClass.toUpperCase()} Class Home`
                : `${location.desc || 'Public building interior in Nigeria'}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {totalFloors > 1 && (
            <button
              type="button"
              onClick={() => setShowFloorsModal(!showFloorsModal)}
              className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white flex items-center gap-1.5 border border-zinc-700 transition-colors cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span>Change Floor</span>
            </button>
          )}

          <button
            type="button"
            onClick={onExit}
            className="px-3.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-black flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Exit to Map</span>
          </button>
        </div>
      </header>

      {/* =========================================================================
          MAIN ROOM PERSPECTIVE VIEWPORT (Click to walk anywhere!)
          ========================================================================= */}
      <div
        onClick={handleFloorClick}
        className="relative flex-1 bg-gradient-to-b from-[#11161d] via-[#151c24] to-[#0c1015] overflow-hidden cursor-crosshair"
      >
        {/* ROOM CEILING ARCHITECTURE */}
        <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-black/80 to-transparent pointer-events-none z-10">
          <div className="flex justify-around items-center pt-3 opacity-60">
            <div className="w-32 h-1 bg-zinc-700 rounded-full shadow-[0_0_12px_#38bdf8]" />
            <div className="w-32 h-1 bg-zinc-700 rounded-full shadow-[0_0_12px_#38bdf8]" />
            <div className="w-32 h-1 bg-zinc-700 rounded-full shadow-[0_0_12px_#38bdf8]" />
          </div>
        </div>

        {/* REAR WALL PERSPECTIVE */}
        <div className="absolute top-0 inset-x-0 h-[48%] bg-gradient-to-b from-zinc-900 to-zinc-850 border-b-4 border-zinc-950 pointer-events-none flex flex-col justify-end px-12">
          {/* Wall Paneling & Baseboard */}
          <div className="w-full h-8 bg-zinc-950/80 border-t border-zinc-800" />
        </div>

        {/* FLOOR PERSPECTIVE (Isometric Wood/Tile Grid) */}
        <div className="absolute top-[48%] inset-x-0 bottom-0 bg-gradient-to-b from-[#1a1c23] via-[#14151b] to-[#0a0a0f] pointer-events-none shadow-inner">
          <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:48px_24px]" />
        </div>

        {/* =====================================================================
            1. CHURCH SANCTUARY INTERIOR
            ===================================================================== */}
        {locType === 'church' && (
          <>
            {/* Center Golden Cross & Stained Glass */}
            <div className="absolute top-[8%] left-1/2 -translate-x-1/2 w-48 h-60 bg-gradient-to-b from-amber-500/10 to-transparent border-2 border-amber-400/40 rounded-t-full flex flex-col items-center justify-center p-3 pointer-events-none shadow-[0_0_40px_rgba(245,158,11,0.2)]">
              <span className="text-5xl drop-shadow-[0_0_15px_#f59e0b]">✝️</span>
              <span className="text-[10px] font-mono text-amber-300 font-bold tracking-widest mt-2 uppercase">Holy Altar</span>
            </div>

            {/* Pulpit / Podium */}
            <div
              onClick={(e) => {
                e.stopPropagation();
                handleInteractObject({
                  title: 'Altar Prayer',
                  energyEffect: 15,
                  joyEffect: 25,
                  message: '🙏 Prayed at the holy sanctuary altar (+25 Joy, +15 Energy). God bless you!',
                  sound: 'success',
                });
              }}
              className="absolute top-[32%] left-1/2 -translate-x-1/2 w-48 h-28 bg-amber-950/80 border-2 border-amber-500 rounded-2xl p-3 shadow-2xl cursor-pointer hover:scale-105 transition-all text-center z-20"
            >
              <div className="text-xs font-black text-amber-300 flex items-center justify-center gap-1.5">
                <Church className="w-4 h-4" />
                <span>PULPIT & BIBLE</span>
              </div>
              <p className="text-[10px] text-zinc-300 mt-1">Tap to pray and receive spiritual peace.</p>
            </div>

            {/* Pews (Left and Right) */}
            <div className="absolute top-[48%] left-10 w-64 h-16 bg-amber-900/60 border border-amber-700/80 rounded-xl flex items-center justify-center text-xs text-amber-200 font-bold pointer-events-none shadow-lg">
              🪑 Wooden Church Pews (Left Wing)
            </div>
            <div className="absolute top-[48%] right-10 w-64 h-16 bg-amber-900/60 border border-amber-700/80 rounded-xl flex items-center justify-center text-xs text-amber-200 font-bold pointer-events-none shadow-lg">
              🪑 Wooden Church Pews (Right Wing)
            </div>

            {/* Donation / Tithe Box */}
            <div
              onClick={(e) => {
                e.stopPropagation();
                handleInteractObject({
                  title: 'Church Tithe Offering',
                  cost: 2000,
                  joyEffect: 30,
                  message: '💰 Gave ₦2,000 Church Tithe & Offering. Joy & prosperity restored (+30 Joy)!',
                  sound: 'coin',
                });
              }}
              className="absolute top-[40%] right-20 w-40 h-24 bg-zinc-900 border-2 border-amber-400 rounded-2xl p-2.5 shadow-2xl cursor-pointer hover:scale-105 transition-all text-center z-20"
            >
              <span className="text-xl">🕊️</span>
              <div className="text-xs font-bold text-amber-300">Tithe & Offering Box</div>
              <p className="text-[10px] text-zinc-400">Give ₦2,000 Tithe</p>
            </div>
          </>
        )}

        {/* =====================================================================
            2. MOSQUE PRAYER HALL INTERIOR
            ===================================================================== */}
        {locType === 'mosque' && (
          <>
            {/* Mihrab Arch pointing to Qibla */}
            <div className="absolute top-[6%] left-1/2 -translate-x-1/2 w-56 h-64 bg-emerald-950/40 border-2 border-emerald-400/50 rounded-t-full flex flex-col items-center justify-center p-3 pointer-events-none shadow-[0_0_45px_rgba(16,185,129,0.25)]">
              <span className="text-5xl drop-shadow-[0_0_15px_#10b981]">🕌</span>
              <span className="text-xs font-mono text-emerald-300 font-bold tracking-widest mt-2 uppercase">Holy Mihrab (Qibla)</span>
            </div>

            {/* Minbar Pulpit */}
            <div
              onClick={(e) => {
                e.stopPropagation();
                handleInteractObject({
                  title: 'Solat Prayer',
                  energyEffect: 15,
                  joyEffect: 25,
                  message: '🤲 Performed Solat Prayer on the sacred prayer carpets (+25 Joy, Peace of Mind).',
                  sound: 'success',
                });
              }}
              className="absolute top-[34%] left-1/2 -translate-x-1/2 w-52 h-26 bg-zinc-900 border-2 border-emerald-500 rounded-2xl p-3 shadow-2xl cursor-pointer hover:scale-105 transition-all text-center z-20"
            >
              <div className="text-xs font-black text-emerald-300">MINBAR & KHUTBAH PODIUM</div>
              <p className="text-[10px] text-zinc-300 mt-1">Tap to pray Solat on the carpet.</p>
            </div>

            {/* Green Islamic Geometric Carpet Floor Overlay */}
            <div className="absolute top-[52%] inset-x-8 h-28 bg-emerald-900/30 border-y border-emerald-500/40 rounded-2xl flex items-center justify-around text-xs text-emerald-300 font-mono pointer-events-none">
              <span>🟩 Sajjada Prayer Line 1</span>
              <span>🟩 Sajjada Prayer Line 2</span>
              <span>🟩 Sajjada Prayer Line 3</span>
            </div>

            {/* Sadaqah Charity Box */}
            <div
              onClick={(e) => {
                e.stopPropagation();
                handleInteractObject({
                  title: 'Sadaqah Charity',
                  cost: 2000,
                  joyEffect: 30,
                  message: '💚 Donated ₦2,000 Sadaqah for community care. Barka da Sallah (+30 Joy)!',
                  sound: 'coin',
                });
              }}
              className="absolute top-[40%] left-16 w-44 h-24 bg-zinc-900 border-2 border-emerald-400 rounded-2xl p-2.5 shadow-2xl cursor-pointer hover:scale-105 transition-all text-center z-20"
            >
              <span className="text-xl">🌙</span>
              <div className="text-xs font-bold text-emerald-300">Sadaqah Charity Box</div>
              <p className="text-[10px] text-zinc-400">Give ₦2,000 Sadaqah</p>
            </div>
          </>
        )}

        {/* =====================================================================
            3. HOSPITAL INTERIOR (FMC)
            ===================================================================== */}
        {locType === 'hospital' && (
          <>
            <div
              onClick={(e) => {
                e.stopPropagation();
                handleInteractObject({
                  title: 'Doctor Medical Checkup',
                  cost: 15000,
                  energyEffect: 40,
                  joyEffect: 20,
                  message: '🩺 Full Medical Checkup by Consultant Physician (+40 Energy, Health Restored)!',
                  sound: 'success',
                });
              }}
              className="absolute top-[28%] left-12 w-64 h-32 bg-zinc-900 border-2 border-emerald-500 rounded-2xl p-3 shadow-2xl cursor-pointer hover:scale-105 transition-all z-20"
            >
              <div className="text-xs font-black text-emerald-400 flex items-center gap-1.5">
                <HeartPulse className="w-4 h-4" />
                <span>CONSULTANT DOCTOR CLINIC</span>
              </div>
              <p className="text-[11px] text-zinc-300 mt-1">Full Health Diagnostics & Prescription.</p>
              <span className="text-[10px] text-emerald-300 font-mono">Fee: ₦15,000</span>
            </div>

            {/* Hospital Beds with monitors */}
            <div className="absolute top-[32%] right-16 w-60 h-28 bg-teal-950/60 border border-teal-500/50 rounded-2xl p-3 shadow-xl pointer-events-none">
              <div className="text-xs font-bold text-teal-300">🛏️ Hospital Ward Beds</div>
              <p className="text-[10px] text-zinc-400 mt-1">Cardiac telemetry monitors active. 72 BPM.</p>
            </div>
          </>
        )}

        {/* =====================================================================
            4. BANK INTERIOR (CBN / Commercial)
            ===================================================================== */}
        {locType === 'bank' && (
          <>
            <div
              onClick={(e) => {
                e.stopPropagation();
                handleInteractObject({
                  title: 'Teller Cash Transaction',
                  message: '💵 Visited Cashier Teller: Account balanced and verified.',
                  sound: 'coin',
                });
              }}
              className="absolute top-[28%] left-14 w-72 h-32 bg-zinc-900 border-2 border-amber-500 rounded-2xl p-3 shadow-2xl cursor-pointer hover:scale-105 transition-all z-20"
            >
              <div className="text-xs font-black text-amber-400 flex items-center gap-1.5">
                <Coins className="w-4 h-4" />
                <span>COMMERCIAL BANK TELLER BOOTHS</span>
              </div>
              <p className="text-[11px] text-zinc-300 mt-1">Bulletproof glass deposit counters & cash counting machines.</p>
            </div>

            {/* Armored Vault */}
            <div className="absolute top-[30%] right-16 w-56 h-30 bg-zinc-950 border-4 border-amber-600 rounded-2xl p-3 shadow-2xl pointer-events-none flex flex-col items-center justify-center">
              <span className="text-3xl">🏦</span>
              <span className="text-xs font-black text-amber-400 mt-1">HEAVY STEEL VAULT</span>
              <span className="text-[9px] text-zinc-500 font-mono">ARMED SECURITY GUARD ON DUTY</span>
            </div>
          </>
        )}

        {/* =====================================================================
            5. MALL & SUPERMARKET (Novare / Jabi)
            ===================================================================== */}
        {(locType === 'mall' || locType === 'supermarket') && (
          <>
            <div
              onClick={(e) => {
                e.stopPropagation();
                handleInteractObject({
                  title: 'Supermarket Groceries',
                  cost: 8500,
                  hungerEffect: 40,
                  joyEffect: 15,
                  message: '🛒 Bought fresh groceries, beverages, and biscuits (+40 Hunger, +15 Joy)!',
                  sound: 'coin',
                });
              }}
              className="absolute top-[28%] left-14 w-72 h-32 bg-zinc-900 border-2 border-emerald-500 rounded-2xl p-3 shadow-2xl cursor-pointer hover:scale-105 transition-all z-20"
            >
              <div className="text-xs font-black text-emerald-400 flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4" />
                <span>SUPERMARKET AISLE & CHECKOUT</span>
              </div>
              <p className="text-[11px] text-zinc-300 mt-1">Shelves with provisions, dairy, cornflakes, and drinks.</p>
              <span className="text-[10px] text-emerald-300 font-mono">Groceries: ₦8,500</span>
            </div>

            <div className="absolute top-[30%] right-16 w-60 h-28 bg-zinc-900 border border-purple-500/50 rounded-2xl p-3 shadow-xl pointer-events-none">
              <div className="text-xs font-bold text-purple-300">👗 Designer Boutique Wing</div>
              <p className="text-[10px] text-zinc-400 mt-1">Latest Ankara, Senator styles & perfumes on display.</p>
            </div>
          </>
        )}

        {/* =====================================================================
            6. FRASER 5-STAR HOTEL
            ===================================================================== */}
        {locType === 'hotel' && (
          <>
            <div
              onClick={(e) => {
                e.stopPropagation();
                handleInteractObject({
                  title: '5-Star Suite Stay',
                  cost: 65000,
                  energyEffect: 80,
                  joyEffect: 40,
                  message: '🛎️ Checked in to Luxury Presidential Suite (+80 Energy, +40 Joy)! Slept like royalty.',
                  sound: 'success',
                });
              }}
              className="absolute top-[28%] left-14 w-72 h-34 bg-zinc-900 border-2 border-amber-500 rounded-2xl p-3.5 shadow-2xl cursor-pointer hover:scale-105 transition-all z-20"
            >
              <div className="text-xs font-black text-amber-400 flex items-center gap-1.5">
                <Building className="w-4 h-4" />
                <span>FRASER SUITES GRAND CONCIERGE</span>
              </div>
              <p className="text-[11px] text-zinc-300 mt-1">Marble check-in desk, crystal chandelier, and VIP service.</p>
              <span className="text-[10px] text-amber-300 font-mono">Suite Stay: ₦65,000 / Night</span>
            </div>

            <div className="absolute top-[30%] right-16 w-56 h-28 bg-zinc-950 border border-amber-400/50 rounded-2xl p-3 shadow-xl pointer-events-none">
              <span className="text-xl">🍸</span>
              <div className="text-xs font-bold text-amber-300">Executive Cocktail Lounge</div>
              <p className="text-[10px] text-zinc-400 mt-0.5">Live acoustic jazz & chill champagne.</p>
            </div>
          </>
        )}

        {/* =====================================================================
            7. RESTAURANT & CLUB (Club Cubana / Lounge)
            ===================================================================== */}
        {(locType === 'restaurant' || locType === 'club') && (
          <>
            <div
              onClick={(e) => {
                e.stopPropagation();
                handleInteractObject({
                  title: 'Order Peppered Suya & Drinks',
                  cost: 7500,
                  hungerEffect: 45,
                  joyEffect: 25,
                  message: '🍢 Hot spicy Suya, roasted plantain, and chilled Chapman served (+45 Hunger, +25 Joy)!',
                  sound: 'coin',
                });
              }}
              className="absolute top-[28%] left-14 w-72 h-32 bg-zinc-900 border-2 border-orange-500 rounded-2xl p-3 shadow-2xl cursor-pointer hover:scale-105 transition-all z-20"
            >
              <div className="text-xs font-black text-orange-400 flex items-center gap-1.5">
                <Utensils className="w-4 h-4" />
                <span>BAR & SUYA KITCHEN COUNTER</span>
              </div>
              <p className="text-[11px] text-zinc-300 mt-1">Spicy grilled beef Suya, Asun, and cold drinks.</p>
              <span className="text-[10px] text-orange-300 font-mono">Platter: ₦7,500</span>
            </div>

            <div
              onClick={(e) => {
                e.stopPropagation();
                handleInteractObject({
                  title: 'Dance Floor Vibes',
                  energyEffect: -10,
                  joyEffect: 35,
                  message: '🎵 DJ playing Burna Boy & Asake on the dance floor (+35 Joy, energetic vibes)!',
                  sound: 'success',
                });
              }}
              className="absolute top-[30%] right-16 w-60 h-30 bg-purple-950/80 border-2 border-purple-500 rounded-2xl p-3 shadow-2xl cursor-pointer hover:scale-105 transition-all z-20"
            >
              <div className="text-xs font-bold text-purple-300 flex items-center gap-1">
                <Music className="w-4 h-4" />
                <span>DJ BOOTH & DANCE FLOOR</span>
              </div>
              <p className="text-[10px] text-zinc-300 mt-1">Strobe neon lights. Tap to dance to Afrobeats!</p>
            </div>
          </>
        )}

        {/* =====================================================================
            8. NILE UNIVERSITY CAMPUS
            ===================================================================== */}
        {(locType === 'school' || locType === 'university') && (
          <>
            <div
              onClick={(e) => {
                e.stopPropagation();
                handleInteractObject({
                  title: 'Lecture Class',
                  energyEffect: -12,
                  joyEffect: 18,
                  message: '📚 Attended University Lecture Hall session. Gained knowledge and networking (+18 Joy)!',
                  sound: 'stamp',
                });
              }}
              className="absolute top-[28%] left-14 w-72 h-32 bg-zinc-900 border-2 border-sky-500 rounded-2xl p-3 shadow-2xl cursor-pointer hover:scale-105 transition-all z-20"
            >
              <div className="text-xs font-black text-sky-400 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4" />
                <span>TIERED LECTURE THEATRE</span>
              </div>
              <p className="text-[11px] text-zinc-300 mt-1">Smart blackboard, projector screen, and study desks.</p>
              <span className="text-[10px] text-sky-300 font-mono">Tap to attend class</span>
            </div>

            <div className="absolute top-[30%] right-16 w-60 h-28 bg-zinc-900 border border-sky-400/50 rounded-2xl p-3 shadow-xl pointer-events-none">
              <span className="text-xl">📖</span>
              <div className="text-xs font-bold text-sky-300">University Research Library</div>
              <p className="text-[10px] text-zinc-400 mt-0.5">Quiet study carrels & fast WiFi.</p>
            </div>
          </>
        )}

        {/* =====================================================================
            9. AIRPORT TERMINAL
            ===================================================================== */}
        {locType === 'airport' && (
          <>
            <div
              onClick={(e) => {
                e.stopPropagation();
                handleInteractObject({
                  title: 'Boarding Gate 4',
                  message: '✈️ Boarding Gate 4: Domestic flights to Lagos, Abuja, Port Harcourt, and Owerri are on schedule.',
                  sound: 'stamp',
                });
              }}
              className="absolute top-[28%] left-14 w-76 h-34 bg-zinc-900 border-2 border-sky-500 rounded-2xl p-3 shadow-2xl cursor-pointer hover:scale-105 transition-all z-20"
            >
              <div className="text-xs font-black text-sky-400 flex items-center gap-1.5">
                <Plane className="w-4 h-4" />
                <span>DOMESTIC DEPARTURES BOARDING GATE 4</span>
              </div>
              <p className="text-[11px] text-zinc-300 mt-1">Air Peace & Ibom Air boarding counters. Runway view outside.</p>
              <span className="text-[10px] text-sky-300 font-mono">Flight Concourse Active</span>
            </div>

            <div className="absolute top-[30%] right-16 w-60 h-28 bg-zinc-950 border border-sky-400/50 rounded-2xl p-3 shadow-xl pointer-events-none flex flex-col items-center justify-center">
              <span className="text-2xl">🛄</span>
              <div className="text-xs font-bold text-sky-300 mt-1">Baggage Carousel & Security</div>
              <span className="text-[9px] text-zinc-500 font-mono">FEDERAL AIRPORT AUTHORITY (FAAN)</span>
            </div>
          </>
        )}

        {/* =====================================================================
            10. HOME / RESIDENCE (My House)
            ===================================================================== */}
        {isHome && (
          <>
            {/* Living Room Smart TV & Sofa */}
            <div
              onClick={(e) => {
                e.stopPropagation();
                handleInteractObject({
                  title: 'Watch Smart TV',
                  energyEffect: 10,
                  joyEffect: 20,
                  message: '📺 Relaxed on the luxury sofa watching Africa Magic & Premier League (+20 Joy, +10 Energy)!',
                  sound: 'coin',
                });
              }}
              className="absolute top-[28%] left-14 w-68 h-32 bg-zinc-900 border-2 border-emerald-500 rounded-2xl p-3 shadow-2xl cursor-pointer hover:scale-105 transition-all z-20"
            >
              <div className="text-xs font-black text-emerald-400 flex items-center gap-1.5">
                <Tv className="w-4 h-4" />
                <span>75" 4K OLED SMART TV & SOFA</span>
              </div>
              <p className="text-[11px] text-zinc-300 mt-1">Plush leather couch. Tap to relax and watch cable TV.</p>
            </div>

            {/* Bedroom King Bed */}
            <div
              onClick={(e) => {
                e.stopPropagation();
                handleInteractObject({
                  title: 'Rest on King Bed',
                  energyEffect: 50,
                  joyEffect: 20,
                  message: '🛏️ Took a deep, peaceful sleep on orthopedic king mattress (+50 Energy, Restored)!',
                  sound: 'success',
                });
              }}
              className="absolute top-[28%] right-16 w-64 h-32 bg-zinc-900 border-2 border-emerald-500 rounded-2xl p-3 shadow-2xl cursor-pointer hover:scale-105 transition-all z-20"
            >
              <div className="text-xs font-black text-emerald-400 flex items-center gap-1.5">
                <Bed className="w-4 h-4" />
                <span>MASTER KING-SIZED BED</span>
              </div>
              <p className="text-[11px] text-zinc-300 mt-1">Silk duvets and air conditioning. Tap to sleep and recharge.</p>
            </div>
          </>
        )}

        {/* =====================================================================
            DEFAULT PUBLIC BUILDING INTERIOR FIXTURE (Gov / Others)
            ===================================================================== */}
        {!isHome && !['church', 'mosque', 'hospital', 'bank', 'mall', 'supermarket', 'hotel', 'restaurant', 'club', 'school', 'university', 'airport'].includes(locType) && (
          <div className="absolute top-[28%] left-1/2 -translate-x-1/2 w-80 h-32 bg-zinc-900 border-2 border-emerald-500 rounded-2xl p-4 shadow-2xl text-center z-20 pointer-events-none">
            <span className="text-3xl">🏛️</span>
            <div className="text-sm font-black text-white mt-1">{location.name}</div>
            <p className="text-xs text-zinc-400 mt-1">Official Nigerian civic reception hall & administrative offices.</p>
          </div>
        )}

        {/* =====================================================================
            WALKING FULL-BODY AVATAR WITH REAL WALKING ANIMATION & DIRECTION FLIP
            ===================================================================== */}
        <div
          style={{
            left: `${avatarPos.x}%`,
            top: `${avatarPos.y}%`,
            transform: `translate(-50%, -85%) ${facingLeft ? 'scaleX(-1)' : 'scaleX(1)'}`,
            transition: isWalking ? 'left 0.7s cubic-bezier(0.25, 1, 0.5, 1), top 0.7s cubic-bezier(0.25, 1, 0.5, 1)' : 'none',
          }}
          className="absolute z-30 pointer-events-none drop-shadow-2xl flex flex-col items-center"
        >
          {/* Overhead Player Name & Status Tag */}
          <div
            style={{ transform: facingLeft ? 'scaleX(-1)' : 'scaleX(1)' }}
            className="mb-1 px-2.5 py-0.5 rounded-full bg-zinc-950/90 border border-emerald-500/60 text-[10px] font-black text-white whitespace-nowrap shadow-md flex items-center gap-1"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{userProfile?.firstName || 'Citizen'} {userProfile?.lastName || ''}</span>
            <span className="text-emerald-400 font-mono">({(userProfile?.socialClass || 'citizen').toUpperCase()})</span>
          </div>

          {/* Full-Body Avatar Renderer with stepping animation */}
          <CharacterRenderer
            avatar={userProfile?.avatar}
            size="md"
            fullBody={true}
            isWalking={isWalking}
            showBackground={false}
            className="w-24 h-40"
          />
        </div>

        {/* WALK HINT AT BOTTOM */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-zinc-950/80 border border-zinc-800 rounded-full px-4 py-1.5 text-xs text-zinc-300 flex items-center gap-2 pointer-events-none shadow-xl">
          <Footprints className="w-4 h-4 text-emerald-400 animate-bounce" />
          <span>Tap anywhere on the floor to walk your avatar</span>
        </div>

        {/* INTERACTION TOAST BUBBLE */}
        {activeInteraction && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 bg-emerald-950/95 border-2 border-emerald-400 text-white rounded-2xl px-5 py-2.5 shadow-2xl text-xs font-bold animate-in fade-in flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Interacted with: {activeInteraction}</span>
          </div>
        )}
      </div>

      {/* FLOORS SWITCHER MODAL */}
      {showFloorsModal && (
        <div className="absolute top-16 right-4 z-50 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-2xl w-60 animate-in fade-in">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-800">
            <span className="text-xs font-bold text-white">Select Floor</span>
            <button
              onClick={() => setShowFloorsModal(false)}
              className="text-zinc-500 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-1.5">
            {Array.from({ length: totalFloors }, (_, idx) => idx + 1).map((fl) => (
              <button
                key={fl}
                onClick={() => {
                  setCurrentFloor(fl);
                  setShowFloorsModal(false);
                  onShowToast(`Moved to Floor ${fl}`);
                  triggerSound?.('stamp');
                }}
                className={`w-full py-2 px-3 rounded-xl text-xs font-bold text-left transition-all flex items-center justify-between cursor-pointer ${
                  currentFloor === fl
                    ? 'bg-emerald-500 text-zinc-950 shadow-md'
                    : 'bg-zinc-950 text-zinc-300 hover:bg-zinc-800'
                }`}
              >
                <span>Floor {fl}</span>
                {currentFloor === fl && <CheckCircle2 className="w-4 h-4 text-zinc-950" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
