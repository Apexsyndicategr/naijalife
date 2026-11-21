/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import {
  X,
  LogOut,
  Lightbulb,
  LightbulbOff,
  Paintbrush,
  RotateCw,
  Trash2,
  Package,
  Shirt,
  Utensils,
  Droplets,
  HeartPulse,
  Landmark,
  Scissors,
  Sparkles,
  CheckCircle2,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Bed,
  Tv,
  Briefcase,
  Building2,
  ShoppingBag,
  ArrowRightLeft,
} from 'lucide-react';
import {
  BankReceipt,
  CharacterAvatar,
  HouseLayoutData,
  PlacedFurnitureItem,
  PropertyAsset,
  UserProfile,
} from '../types/game';
import { Interior3DCanvas } from './interior3d/Interior3DCanvas';
import {
  buildInteriorBlueprint,
  InteractivePropSpec,
  mapPoiTypeToInteriorCategory,
} from './interior3d/interiorLayouts';
import { CharacterCustomizer } from './CharacterCustomizer';
import { BUY_MODE_FURNITURE_CATALOG } from '../data/assetsData';
import { EXPANDED_CHOWDECK } from '../data/expandedLifeData';
import {
  CLOTHING_SHOP_CATALOG,
  ECONOMY_CONFIG,
  inferDrinkStats,
  SALON_HAIRSTYLES_CATALOG,
} from '../config/economyConfig';
import {
  executeServerFxExchange,
  executeServerPurchase,
  executeServerTransfer,
} from '../services/economyService';
import { formatNaira } from '../utils/formatNaira';

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
  onUpdateStats: (effects: {
    energy?: number;
    hunger?: number;
    thirst?: number;
    health?: number;
    happiness?: number;
  }) => void;
  onUpdateMoney?: (deltaNGN: number, deltaUSD?: number) => void;
  onUpdateUserProfile?: (updatedProfile: UserProfile) => void;
  onOpenPhoneApp?: (app: 'bank' | 'jobs' | 'properties' | 'immigration') => void;
  onShowToast: (message: string) => void;
  triggerSound?: (type: 'coin' | 'stamp' | 'alert' | 'success') => void;
}

type ActiveModalType =
  | null
  | 'kitchen'
  | 'wardrobe'
  | 'storage'
  | 'food_menu'
  | 'boutique'
  | 'salon'
  | 'bank';

const DEFAULT_AVATAR: CharacterAvatar = {
  gender: 'male',
  skinTone: '#8d5524',
  bodyBuild: 'average',
  faceShape: 'oval',
  eyeStyle: 'classic',
  eyebrowStyle: 'natural',
  noseStyle: 'balanced',
  mouthStyle: 'neutral',
  hairstyle: 'fade',
  hairColor: '#18181b',
  outfit: 'casual',
  height: 'average',
  accessory: 'none',
};

const COLD_DRINKS_AND_WATER = [
  {
    id: 'drink_eva_water',
    name: 'Chilled Eva Bottled Water (75cl)',
    category: 'Chilled Drinks',
    cost: 500,
    hunger: 2,
    thirst: 65,
    joy: 8,
    icon: '💧',
    desc: 'Crisp chilled table water that quenches thirst fast.',
  },
  {
    id: 'drink_zobo_iced',
    name: 'Spiced Iced Zobo & Pineapple',
    category: 'Chilled Drinks',
    cost: 1200,
    hunger: 6,
    thirst: 55,
    joy: 16,
    icon: '🍹',
    desc: 'Fresh hibiscus blend infused with ginger and pineapple.',
  },
  {
    id: 'drink_chapman_vip',
    name: 'Lagos VIP Chapman Pitcher',
    category: 'Chilled Drinks',
    cost: 3500,
    hunger: 8,
    thirst: 62,
    joy: 24,
    icon: '🥂',
    desc: 'Fruity cucumber-citrus mocktail served frost cold.',
  },
];

export const InteriorView: React.FC<InteriorViewProps> = ({
  location,
  userProfile,
  activeHome,
  onExit,
  onUpdateStats,
  onUpdateMoney,
  onUpdateUserProfile,
  onOpenPhoneApp,
  onShowToast,
  triggerSound,
}) => {
  const category = useMemo(
    () => mapPoiTypeToInteriorCategory(location.type, location.name),
    [location.type, location.name]
  );
  const isHome = category === 'house';
  const propertyKey = useMemo(() => {
    if (isHome) return activeHome?.id || location.id || 'player_home';
    return location.id;
  }, [isHome, activeHome?.id, location.id]);

  const savedLayout: HouseLayoutData = useMemo(() => {
    const existing = userProfile?.houseLayouts?.[propertyKey];
    if (existing) return existing;
    return {
      propertyId: propertyKey,
      wallTheme: 'cream',
      floorTheme: 'oak',
      lightsOn: true,
      placedFurniture: [],
    };
  }, [userProfile?.houseLayouts, propertyKey]);

  const [lightsOn, setLightsOn] = useState<boolean>(savedLayout.lightsOn !== false);
  const [isDecorateMode, setIsDecorateMode] = useState<boolean>(false);
  const [selectedCustomId, setSelectedCustomId] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<ActiveModalType>(null);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);

  // Bank inside-building state
  const [bankRecipient, setBankRecipient] = useState('');
  const [bankAmount, setBankAmount] = useState('10000');
  const [bankCurrency, setBankCurrency] = useState<'NGN' | 'CAD'>('NGN');
  const [fxDirection, setFxDirection] = useState<'NGN_TO_CAD' | 'CAD_TO_NGN'>('NGN_TO_CAD');
  const [fxAmount, setFxAmount] = useState('50000');
  const [isBankBusy, setIsBankBusy] = useState(false);

  const blueprint = useMemo(
    () =>
      buildInteriorBlueprint({
        id: location.id,
        name: location.name,
        type: location.type,
        houseLayout: savedLayout,
      }),
    [location.id, location.name, location.type, savedLayout]
  );

  const updateHouseLayout = (updater: (prev: HouseLayoutData) => HouseLayoutData) => {
    if (!onUpdateUserProfile || !userProfile) return;
    const nextLayout = updater(savedLayout);
    onUpdateUserProfile({
      ...userProfile,
      houseLayouts: {
        ...(userProfile.houseLayouts || {}),
        [propertyKey]: nextLayout,
      },
    });
  };

  const showActionBanner = (msg: string) => {
    setStatusBanner(msg);
    onShowToast(msg);
    setTimeout(() => {
      setStatusBanner((cur) => (cur === msg ? null : cur));
    }, 3200);
  };

  const applyDebitWithReceipt = async (params: {
    itemId: string;
    title: string;
    category: BankReceipt['category'];
    costNGN: number;
    unlockType?: 'clothing' | 'hairstyle' | 'furniture';
    unlockKey?: string;
    profilePatch?: Partial<UserProfile>;
  }): Promise<boolean> => {
    const totalAvail = (userProfile.cashNaira || 0) + (userProfile.bankNaira || 0);
    if (!userProfile.isOwner && totalAvail < params.costNGN) {
      onShowToast(`Insufficient funds! Need ${formatNaira(params.costNGN)}`);
      triggerSound?.('alert');
      return false;
    }

    const res = await executeServerPurchase({
      itemId: params.itemId,
      title: params.title,
      category: params.category,
      amountNGN: params.costNGN,
      unlockType: params.unlockType,
      unlockKey: params.unlockKey,
    });

    if (res.success && res.account) {
      onUpdateUserProfile?.({
        ...userProfile,
        ...(params.profilePatch || {}),
        bankNaira: res.account.bankNaira,
        cashNaira: res.account.cashNaira,
        bankCAD: res.account.bankCAD,
        ownedClothing: res.account.ownedClothing,
        ownedHairstyles: res.account.ownedHairstyles,
        furnitureBought: res.account.furnitureBought,
        receipts: res.account.receipts,
      });
      return true;
    }

    // Fallback when running guest/local offline profile
    if (res.error && !res.error.includes('Auth required') && !res.error.includes('Offline')) {
      onShowToast(res.error);
      triggerSound?.('alert');
      return false;
    }

    if (params.costNGN > 0) {
      onUpdateMoney?.(-params.costNGN);
    }
    const receipt: BankReceipt = {
      id: `rcp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      title: params.title,
      amount: params.costNGN,
      date: new Date().toLocaleDateString('en-GB'),
      type: 'debit',
      category: params.category,
      currency: 'NGN',
    };
    if (onUpdateUserProfile) {
      onUpdateUserProfile({
        ...userProfile,
        ...(params.profilePatch || {}),
        bankNaira: Math.max(0, (userProfile.bankNaira || 0) - params.costNGN),
        receipts: [receipt, ...(userProfile.receipts || [])].slice(0, 60),
      });
    }
    return true;
  };

  const handleTriggerInteraction = async (prop: InteractivePropSpec) => {
    switch (prop.actionType) {
      case 'exit_door': {
        triggerSound?.('stamp');
        onExit();
        return;
      }
      case 'toggle_lights': {
        const next = !lightsOn;
        setLightsOn(next);
        updateHouseLayout((prev) => ({ ...prev, lightsOn: next }));
        showActionBanner(next ? '💡 Interior lights switched ON' : '🌙 Interior lights dimmed OFF');
        triggerSound?.('stamp');
        return;
      }
      case 'sleep_bed': {
        onUpdateStats({ energy: 55, health: 12, happiness: 18 });
        showActionBanner('🛏️ Rested comfortably on your king bed (+55 Energy, +12 Health, +18 Joy)!');
        triggerSound?.('success');
        return;
      }
      case 'watch_tv': {
        onUpdateStats({ happiness: 22, energy: 8 });
        showActionBanner('📺 Watched Africa Magic & Afrobeats Live on OLED TV (+22 Joy, +8 Energy)!');
        triggerSound?.('coin');
        return;
      }
      case 'sit_sofa': {
        onUpdateStats({ energy: 12, happiness: 12 });
        showActionBanner('🛋️ Relaxed on the plush lounge seating (+12 Energy, +12 Joy).');
        triggerSound?.('coin');
        return;
      }
      case 'use_shower': {
        onUpdateStats({ energy: 18, health: 14, happiness: 15 });
        showActionBanner('🚿 Fresh shower & grooming routine complete (+18 Energy, +14 Health, +15 Joy)!');
        triggerSound?.('success');
        return;
      }
      case 'use_fridge':
      case 'use_stove': {
        setActiveModal('kitchen');
        triggerSound?.('stamp');
        return;
      }
      case 'open_wardrobe': {
        setActiveModal('wardrobe');
        triggerSound?.('stamp');
        return;
      }
      case 'open_storage': {
        setActiveModal('storage');
        triggerSound?.('stamp');
        return;
      }
      case 'order_food':
      case 'buy_groceries': {
        setActiveModal('food_menu');
        triggerSound?.('stamp');
        return;
      }
      case 'shop_clothing': {
        setActiveModal('boutique');
        triggerSound?.('stamp');
        return;
      }
      case 'salon_chair': {
        setActiveModal('salon');
        triggerSound?.('stamp');
        return;
      }
      case 'bank_teller':
      case 'use_atm': {
        setActiveModal('bank');
        triggerSound?.('stamp');
        return;
      }
      case 'hospital_heal': {
        const fee = ECONOMY_CONFIG.hospitalHealFeeNGN;
        const ok = await applyDebitWithReceipt({
          itemId: `heal_${Date.now()}`,
          title: `${location.name} Medical Treatment`,
          category: 'medical',
          costNGN: fee,
        });
        if (ok) {
          onUpdateStats({ health: 100, energy: 35, thirst: 20, happiness: 15 });
          showActionBanner(`🩺 Treated by resident physician (-${formatNaira(fee)}, Health 100%)!`);
          triggerSound?.('success');
        }
        return;
      }
      case 'hotel_rest': {
        const fee = ECONOMY_CONFIG.hotelNightFeeNGN;
        const ok = await applyDebitWithReceipt({
          itemId: `hotel_${Date.now()}`,
          title: `${location.name} Suite Stay`,
          category: 'lifestyle',
          costNGN: fee,
        });
        if (ok) {
          onUpdateStats({ energy: 100, health: 25, happiness: 35, thirst: 15 });
          showActionBanner(`🛎️ Checked into luxury suite (-${formatNaira(fee)}, Energy 100%, +35 Joy)!`);
          triggerSound?.('success');
        }
        return;
      }
      case 'gym_workout': {
        const fee = ECONOMY_CONFIG.gymSessionFeeNGN;
        const ok = await applyDebitWithReceipt({
          itemId: `gym_${Date.now()}`,
          title: `${location.name} Fitness Session`,
          category: 'lifestyle',
          costNGN: fee,
        });
        if (ok) {
          onUpdateStats({ energy: -18, thirst: -18, hunger: -10, health: 24, happiness: 22 });
          showActionBanner(`🏋️ Completed high-intensity workout (-${formatNaira(fee)}, +24 Health, +22 Joy)!`);
          triggerSound?.('success');
        }
        return;
      }
      case 'work_desk': {
        const pay = 18500;
        onUpdateMoney?.(pay);
        onUpdateStats({ energy: -14, hunger: -8, thirst: -12, happiness: 10 });
        showActionBanner(`💼 Completed on-site contract task (+${formatNaira(pay)} earned)!`);
        triggerSound?.('coin');
        return;
      }
      case 'warehouse_shift': {
        const pay = 12000;
        onUpdateMoney?.(pay);
        onUpdateStats({ energy: -18, hunger: -10, thirst: -15, happiness: 8 });
        showActionBanner(`📦 Completed warehouse logistics dispatch shift (+${formatNaira(pay)})!`);
        triggerSound?.('coin');
        return;
      }
      case 'study_desk': {
        onUpdateStats({ energy: -10, happiness: 20 });
        showActionBanner('📚 Studied research journals & lecture notes (+20 Joy, Sharp Mind)!');
        triggerSound?.('stamp');
        return;
      }
      case 'worship': {
        onUpdateStats({ energy: 15, happiness: 30, health: 8 });
        showActionBanner('🙏 Peaceful prayer & community fellowship (+30 Joy, +15 Energy).');
        triggerSound?.('success');
        return;
      }
      case 'club_bar': {
        const drinkCost = 6500;
        const ok = await applyDebitWithReceipt({
          itemId: `club_drink_${Date.now()}`,
          title: `${location.name} VIP Lounge Drinks`,
          category: 'lifestyle',
          costNGN: drinkCost,
        });
        if (ok) {
          onUpdateStats({ thirst: 50, happiness: 35, energy: -6 });
          showActionBanner(`🍸 Served VIP chilled cocktail (-${formatNaira(drinkCost)}, +50 Thirst, +35 Joy)!`);
          triggerSound?.('coin');
        }
        return;
      }
      case 'fuel_counter': {
        const voucherCost = 8500;
        const ok = await applyDebitWithReceipt({
          itemId: `fuel_${Date.now()}`,
          title: `${location.name} Fuel Voucher`,
          category: 'car',
          costNGN: voucherCost,
        });
        if (ok) {
          onUpdateStats({ happiness: 12 });
          showActionBanner(`⛽ Purchased verified fuel voucher (-${formatNaira(voucherCost)}).`);
          triggerSound?.('coin');
        }
        return;
      }
      case 'police_service': {
        onUpdateStats({ happiness: 10 });
        showActionBanner(`🛡️ Met duty officer at ${location.name}. Civic clearance verified.`);
        triggerSound?.('stamp');
        return;
      }
      case 'showroom_car': {
        onUpdateStats({ happiness: 15 });
        showActionBanner('🚘 Inspected showroom vehicle! Open Auto Mart on your phone to finance or purchase.');
        triggerSound?.('coin');
        return;
      }
    }
  };

  // Place furniture into the active home layout
  const handlePlaceFurniture = (catalogId: string, name: string, categoryTag: string) => {
    const newItem: PlacedFurnitureItem = {
      instanceId: `pf_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      furnitureId: catalogId,
      name,
      category: categoryTag as PlacedFurnitureItem['category'],
      x: 0,
      z: 0,
      rotationY: 0,
    };
    updateHouseLayout((prev) => ({
      ...prev,
      placedFurniture: [...(prev.placedFurniture || []), newItem],
    }));
    setSelectedCustomId(`custom_${newItem.instanceId}`);
    showActionBanner(`🛋️ Placed ${name} in your house! Drag or use arrows to position.`);
    triggerSound?.('success');
  };

  const selectedPlacedItem = useMemo(() => {
    if (!selectedCustomId?.startsWith('custom_')) return null;
    const rawId = selectedCustomId.replace('custom_', '');
    return (savedLayout.placedFurniture || []).find((f) => f.instanceId === rawId) || null;
  }, [selectedCustomId, savedLayout.placedFurniture]);

  const moveSelectedCustom = (dx: number, dz: number) => {
    if (!selectedPlacedItem) return;
    updateHouseLayout((prev) => ({
      ...prev,
      placedFurniture: prev.placedFurniture.map((f) =>
        f.instanceId === selectedPlacedItem.instanceId
          ? { ...f, x: Math.max(-7.5, Math.min(7.5, f.x + dx)), z: Math.max(-5.5, Math.min(5.2, f.z + dz)) }
          : f
      ),
    }));
  };

  const rotateSelectedCustom = () => {
    if (!selectedPlacedItem) return;
    updateHouseLayout((prev) => ({
      ...prev,
      placedFurniture: prev.placedFurniture.map((f) =>
        f.instanceId === selectedPlacedItem.instanceId ? { ...f, rotationY: (f.rotationY + Math.PI / 2) % (Math.PI * 2) } : f
      ),
    }));
  };

  const removeSelectedCustom = () => {
    if (!selectedPlacedItem) return;
    updateHouseLayout((prev) => ({
      ...prev,
      placedFurniture: prev.placedFurniture.filter((f) => f.instanceId !== selectedPlacedItem.instanceId),
    }));
    setSelectedCustomId(null);
    showActionBanner(`Stored ${selectedPlacedItem.name} back into house furniture inventory.`);
  };

  const moveItemToStorage = (itemName: string, idx: number) => {
    if (!onUpdateUserProfile) return;
    const nextInv = [...(userProfile.inventory || [])];
    nextInv.splice(idx, 1);
    const nextStored = [...(userProfile.storedItems || []), itemName];
    onUpdateUserProfile({ ...userProfile, inventory: nextInv, storedItems: nextStored });
    triggerSound?.('stamp');
  };

  const retrieveItemFromStorage = (itemName: string, idx: number) => {
    if (!onUpdateUserProfile) return;
    const nextStored = [...(userProfile.storedItems || [])];
    nextStored.splice(idx, 1);
    const nextInv = [...(userProfile.inventory || []), itemName];
    onUpdateUserProfile({ ...userProfile, inventory: nextInv, storedItems: nextStored });
    triggerSound?.('coin');
  };

  const foodMenuItems = useMemo(() => {
    const sample = EXPANDED_CHOWDECK.slice(0, 14).map((f) => ({
      ...f,
      thirst: inferDrinkStats(f.name, f.category).thirstGain,
    }));
    return [...COLD_DRINKS_AND_WATER, ...sample];
  }, []);

  const ownedFurnitureList = useMemo(() => {
    const ownedIds = userProfile?.furnitureBought || [];
    return BUY_MODE_FURNITURE_CATALOG.filter((item) => ownedIds.includes(item.id));
  }, [userProfile?.furnitureBought]);

  const avatar = userProfile?.avatar || DEFAULT_AVATAR;

  return (
    <div className="fixed inset-0 z-40 bg-zinc-950 flex flex-col select-none overflow-hidden">
      {/* TOP BAR */}
      <header className="h-14 bg-zinc-950/95 border-b border-zinc-800 px-3 sm:px-5 flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
            <Building2 className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xs sm:text-sm font-black text-white truncate flex items-center gap-2">
              <span>{location.name}</span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-950/90 border border-emerald-500/30 text-[10px] font-mono text-emerald-300 uppercase">
                {category.replace('_', ' ')}
              </span>
            </h2>
            <p className="text-[10px] sm:text-[11px] text-zinc-400 truncate">
              {isHome
                ? 'Private 3D Residence · Decorate, Store Items, Change Outfits & Rest'
                : location.desc || 'Explorable 3D Nigerian Building Interior'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-mono">
            <span className="text-zinc-400">Cash/Bank:</span>
            <span className="text-emerald-400 font-black">
              {formatNaira((userProfile?.cashNaira || 0) + (userProfile?.bankNaira || 0))}
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              const next = !lightsOn;
              setLightsOn(next);
              if (isHome) updateHouseLayout((prev) => ({ ...prev, lightsOn: next }));
            }}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
              lightsOn
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                : 'bg-zinc-900 border-zinc-700 text-zinc-400'
            }`}
            title="Toggle Interior Lighting"
          >
            {lightsOn ? <Lightbulb className="w-3.5 h-3.5" /> : <LightbulbOff className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{lightsOn ? 'Lights ON' : 'Lights OFF'}</span>
          </button>

          {isHome && (
            <button
              type="button"
              onClick={() => {
                setIsDecorateMode((v) => !v);
                setSelectedCustomId(null);
              }}
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                isDecorateMode
                  ? 'bg-emerald-500 text-zinc-950 border-emerald-400'
                  : 'bg-zinc-900 border-zinc-700 text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              <Paintbrush className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isDecorateMode ? 'Done Editing' : 'Decorate'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onExit}
            className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-black flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Exit</span>
          </button>
        </div>
      </header>

      {/* REAL 3D EXPLORABLE INTERIOR CANVAS */}
      <div className="relative flex-1 overflow-hidden">
        <Interior3DCanvas
          blueprint={blueprint}
          avatar={avatar}
          lightsOn={lightsOn}
          isDecorateMode={isDecorateMode}
          selectedCustomId={selectedCustomId}
          onSelectCustomProp={(id) => setSelectedCustomId(id)}
          onMoveCustomProp={(rawId, nextX, nextZ) => {
            updateHouseLayout((prev) => ({
              ...prev,
              placedFurniture: prev.placedFurniture.map((f) =>
                f.instanceId === rawId ? { ...f, x: nextX, z: nextZ } : f
              ),
            }));
          }}
          onTriggerInteraction={handleTriggerInteraction}
        />

        {/* STATUS TOAST BANNER */}
        {statusBanner && (
          <div className="absolute top-14 left-1/2 -translate-x-1/2 z-30 bg-emerald-950/95 border border-emerald-400/70 text-emerald-100 px-4 py-2 rounded-xl text-xs font-bold shadow-2xl flex items-center gap-2 pointer-events-none">
            <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
            <span>{statusBanner}</span>
          </div>
        )}

        {/* HOUSE DECORATE SIDE PANEL */}
        {isHome && isDecorateMode && (
          <div className="absolute top-3 right-3 z-30 w-72 max-h-[82vh] bg-zinc-950/95 border border-emerald-500/40 rounded-2xl p-3.5 shadow-2xl overflow-y-auto space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="text-xs font-black text-emerald-300 uppercase tracking-wide">
                House Customization
              </span>
              <button
                type="button"
                onClick={() => setIsDecorateMode(false)}
                className="text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Wall Colors */}
            <div>
              <span className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">Wall Paint</span>
              <div className="grid grid-cols-5 gap-1.5">
                {(['cream', 'sage', 'charcoal', 'terracotta', 'ivory'] as HouseLayoutData['wallTheme'][]).map((theme) => (
                  <button
                    key={theme}
                    type="button"
                    onClick={() => updateHouseLayout((prev) => ({ ...prev, wallTheme: theme }))}
                    className={`py-1.5 rounded-lg text-[10px] font-bold capitalize border cursor-pointer ${
                      savedLayout.wallTheme === theme
                        ? 'border-emerald-400 bg-emerald-500/20 text-emerald-200'
                        : 'border-zinc-800 bg-zinc-900 text-zinc-400'
                    }`}
                  >
                    {theme}
                  </button>
                ))}
              </div>
            </div>

            {/* Floor Materials */}
            <div>
              <span className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">Floor Finish</span>
              <div className="grid grid-cols-4 gap-1.5">
                {(['oak', 'marble', 'slate', 'terrazzo'] as HouseLayoutData['floorTheme'][]).map((fl) => (
                  <button
                    key={fl}
                    type="button"
                    onClick={() => updateHouseLayout((prev) => ({ ...prev, floorTheme: fl }))}
                    className={`py-1.5 rounded-lg text-[10px] font-bold capitalize border cursor-pointer ${
                      savedLayout.floorTheme === fl
                        ? 'border-emerald-400 bg-emerald-500/20 text-emerald-200'
                        : 'border-zinc-800 bg-zinc-900 text-zinc-400'
                    }`}
                  >
                    {fl}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Furniture Controls */}
            {selectedPlacedItem && (
              <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-amber-200 truncate">{selectedPlacedItem.name}</span>
                  <button
                    type="button"
                    onClick={removeSelectedCustom}
                    className="p-1 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 cursor-pointer"
                    title="Remove Furniture"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-5 gap-1">
                  <button type="button" onClick={() => moveSelectedCustom(-0.6, 0)} className="p-1.5 rounded bg-zinc-900 hover:bg-zinc-800 flex justify-center cursor-pointer"><ArrowLeft className="w-3.5 h-3.5" /></button>
                  <button type="button" onClick={() => moveSelectedCustom(0, -0.6)} className="p-1.5 rounded bg-zinc-900 hover:bg-zinc-800 flex justify-center cursor-pointer"><ArrowUp className="w-3.5 h-3.5" /></button>
                  <button type="button" onClick={() => moveSelectedCustom(0, 0.6)} className="p-1.5 rounded bg-zinc-900 hover:bg-zinc-800 flex justify-center cursor-pointer"><ArrowDown className="w-3.5 h-3.5" /></button>
                  <button type="button" onClick={() => moveSelectedCustom(0.6, 0)} className="p-1.5 rounded bg-zinc-900 hover:bg-zinc-800 flex justify-center cursor-pointer"><ArrowRight className="w-3.5 h-3.5" /></button>
                  <button type="button" onClick={rotateSelectedCustom} className="p-1.5 rounded bg-emerald-600 text-zinc-950 flex justify-center cursor-pointer" title="Rotate 90°"><RotateCw className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            )}

            {/* Owned Furniture Placement List */}
            <div>
              <span className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">
                Place Owned Furniture ({ownedFurnitureList.length})
              </span>
              {ownedFurnitureList.length === 0 ? (
                <p className="text-[11px] text-zinc-500 p-2 rounded-xl bg-zinc-900 border border-zinc-800">
                  Buy furniture from the Buy Shop on the map to place custom pieces inside your rooms.
                </p>
              ) : (
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {ownedFurnitureList.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => handlePlaceFurniture(f.id, f.name, f.category)}
                      className="w-full text-left px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[11px] font-bold text-zinc-200 flex items-center justify-between cursor-pointer"
                    >
                      <span className="truncate">{f.icon} {f.name}</span>
                      <span className="text-emerald-400 text-[10px] font-mono shrink-0 ml-2">+ Place</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* =====================================================================
          INTERACTIVE STATION MODALS (REAL ACTIONS INSIDE BUILDINGS)
          ===================================================================== */}

      {/* 1. HOUSE KITCHEN & FRIDGE MODAL */}
      {activeModal === 'kitchen' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Utensils className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-black text-white">Home Kitchen & Chilled Fridge</h3>
              </div>
              <button type="button" onClick={() => setActiveModal(null)} className="text-zinc-400 hover:text-white cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => {
                  onUpdateStats({ thirst: 60, energy: 8, happiness: 10 });
                  showActionBanner('💧 Drank cold sachet/bottled water from the fridge (+60 Thirst, +8 Energy)!');
                  triggerSound?.('success');
                  setActiveModal(null);
                }}
                className="w-full p-3 rounded-xl bg-sky-950/50 hover:bg-sky-900/60 border border-sky-500/40 text-left flex items-center justify-between cursor-pointer"
              >
                <div>
                  <div className="text-xs font-black text-sky-200">💧 Cold Fridge Water</div>
                  <div className="text-[11px] text-zinc-400">Hydrate immediately (+60 Thirst)</div>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-400">Free at Home</span>
              </button>

              <button
                type="button"
                onClick={async () => {
                  const ok = await applyDebitWithReceipt({
                    itemId: `home_cook_${Date.now()}`,
                    title: 'Home Jollof & Plantain Ingredients',
                    category: 'supermarket',
                    costNGN: 2500,
                  });
                  if (ok) {
                    onUpdateStats({ hunger: 55, thirst: 10, energy: 15, happiness: 20 });
                    showActionBanner('🍛 Cooked fresh Smoky Jollof & Plantain (-₦2,500, +55 Hunger, +20 Joy)!');
                    triggerSound?.('success');
                    setActiveModal(null);
                  }
                }}
                className="w-full p-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-left flex items-center justify-between cursor-pointer"
              >
                <div>
                  <div className="text-xs font-black text-white">🍛 Cook Home Jollof & Grilled Chicken</div>
                  <div className="text-[11px] text-zinc-400">+55 Hunger · +15 Energy · +20 Joy</div>
                </div>
                <span className="text-xs font-mono font-bold text-amber-300">₦2,500</span>
              </button>

              <button
                type="button"
                onClick={async () => {
                  const ok = await applyDebitWithReceipt({
                    itemId: `home_indomie_${Date.now()}`,
                    title: 'Quick Indomie & Two Fried Eggs',
                    category: 'supermarket',
                    costNGN: 1200,
                  });
                  if (ok) {
                    onUpdateStats({ hunger: 38, energy: 10, happiness: 14 });
                    showActionBanner('🍜 Prepared hot Indomie & fried eggs (-₦1,200, +38 Hunger)!');
                    triggerSound?.('coin');
                    setActiveModal(null);
                  }
                }}
                className="w-full p-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-left flex items-center justify-between cursor-pointer"
              >
                <div>
                  <div className="text-xs font-black text-white">🍜 Prepare Quick Noodles & Eggs</div>
                  <div className="text-[11px] text-zinc-400">+38 Hunger · +10 Energy</div>
                </div>
                <span className="text-xs font-mono font-bold text-amber-300">₦1,200</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. HOUSE WARDROBE MODAL (LIVE 3D WARDROBE SYNC) */}
      {activeModal === 'wardrobe' && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
          <div className="w-full max-w-4xl max-h-[92vh] bg-zinc-950 border border-zinc-800 rounded-3xl overflow-y-auto p-4 sm:p-6">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Shirt className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-black text-white">Home Wardrobe & Grooming Mirror</h3>
              </div>
              <button type="button" onClick={() => setActiveModal(null)} className="text-zinc-400 hover:text-white cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <CharacterCustomizer
              avatar={avatar}
              onChange={(nextAvatar) => {
                if (onUpdateUserProfile) {
                  onUpdateUserProfile({ ...userProfile, avatar: nextAvatar });
                }
              }}
              onProceed={() => {
                setActiveModal(null);
                showActionBanner('✨ Outfit & 3D look updated on your character!');
                triggerSound?.('success');
              }}
              playerName={userProfile.firstName || userProfile.username}
              wardrobeMode={true}
              ownedClothing={userProfile.ownedClothing || []}
              ownedHairstyles={userProfile.ownedHairstyles || []}
              buttonLabel="Wear This Look"
            />
          </div>
        </div>
      )}

      {/* 3. HOUSE STORAGE TRUNK MODAL */}
      {activeModal === 'storage' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl p-5 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-black text-white">Home Storage Vault & Backpack</h3>
              </div>
              <button type="button" onClick={() => setActiveModal(null)} className="text-zinc-400 hover:text-white cursor-pointer"><X className="w-4 h-4" /></button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                <div className="text-xs font-bold text-emerald-300">🎒 Carrying ({userProfile.inventory?.length || 0})</div>
                {(userProfile.inventory || []).length === 0 ? (
                  <p className="text-xs text-zinc-500">Nothing in backpack.</p>
                ) : (
                  <div className="space-y-1.5 max-h-56 overflow-y-auto">
                    {(userProfile.inventory || []).map((item, idx) => (
                      <div key={`${item}_${idx}`} className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-zinc-950 text-xs">
                        <span className="truncate text-zinc-200">{item}</span>
                        <button
                          type="button"
                          onClick={() => moveItemToStorage(item, idx)}
                          className="text-[10px] font-bold text-amber-300 hover:underline ml-2 shrink-0 cursor-pointer"
                        >
                          Store →
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                <div className="text-xs font-bold text-amber-300">📦 Stored at Home ({userProfile.storedItems?.length || 0})</div>
                {(userProfile.storedItems || []).length === 0 ? (
                  <p className="text-xs text-zinc-500">Storage chest is empty.</p>
                ) : (
                  <div className="space-y-1.5 max-h-56 overflow-y-auto">
                    {(userProfile.storedItems || []).map((item, idx) => (
                      <div key={`${item}_${idx}`} className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-zinc-950 text-xs">
                        <span className="truncate text-zinc-200">{item}</span>
                        <button
                          type="button"
                          onClick={() => retrieveItemFromStorage(item, idx)}
                          className="text-[10px] font-bold text-emerald-400 hover:underline ml-2 shrink-0 cursor-pointer"
                        >
                          ← Take
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. RESTAURANT / SUPERMARKET / CHILLED DRINKS MENU */}
      {activeModal === 'food_menu' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl p-5 space-y-4 max-h-[88vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <Droplets className="w-5 h-5 text-sky-400" />
                <h3 className="text-sm font-black text-white">{location.name} — Fresh Meals & Cold Drinks</h3>
              </div>
              <button type="button" onClick={() => setActiveModal(null)} className="text-zinc-400 hover:text-white cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 overflow-y-auto pr-1">
              {foodMenuItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={async () => {
                    const ok = await applyDebitWithReceipt({
                      itemId: item.id,
                      title: `${location.name}: ${item.name}`,
                      category: 'lifestyle',
                      costNGN: item.cost,
                    });
                    if (ok) {
                      onUpdateStats({
                        hunger: item.hunger,
                        thirst: item.thirst,
                        happiness: item.joy,
                      });
                      showActionBanner(`${item.icon} Enjoyed ${item.name} (-${formatNaira(item.cost)}, +${item.hunger} Hunger, +${item.thirst} Thirst)!`);
                      triggerSound?.('coin');
                    }
                  }}
                  className="p-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-left flex items-center justify-between gap-2 cursor-pointer"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-black text-white truncate">{item.icon} {item.name}</div>
                    <div className="text-[10px] text-zinc-400">
                      +{item.hunger} Hunger · +{item.thirst} Thirst · +{item.joy} Joy
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold shrink-0">
                    {formatNaira(item.cost)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. CLOTHING BOUTIQUE MODAL */}
      {activeModal === 'boutique' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl p-5 space-y-4 max-h-[88vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-black text-white">{location.name} — Luxury 3D Boutique</h3>
              </div>
              <button type="button" onClick={() => setActiveModal(null)} className="text-zinc-400 hover:text-white cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 overflow-y-auto pr-1">
              {CLOTHING_SHOP_CATALOG.filter((c) => !c.isStarter).map((item) => {
                const owned = (userProfile.ownedClothing || []).includes(item.outfitKey);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={async () => {
                      if (owned) {
                        onUpdateUserProfile?.({
                          ...userProfile,
                          avatar: { ...avatar, outfit: item.outfitKey as CharacterAvatar['outfit'] },
                        });
                        showActionBanner(`👔 Equipped ${item.name}!`);
                        triggerSound?.('success');
                        return;
                      }
                      const ok = await applyDebitWithReceipt({
                        itemId: item.id,
                        title: `Boutique: ${item.name}`,
                        category: 'lifestyle',
                        costNGN: item.priceNGN,
                        unlockType: 'clothing',
                        unlockKey: item.outfitKey,
                        profilePatch: {
                          ownedClothing: Array.from(new Set([...(userProfile.ownedClothing || []), item.outfitKey])),
                          avatar: { ...avatar, outfit: item.outfitKey as CharacterAvatar['outfit'] },
                        },
                      });
                      if (ok) {
                        onUpdateStats({ happiness: 20 });
                        showActionBanner(`🛍️ Purchased & equipped ${item.name} (-${formatNaira(item.priceNGN)})!`);
                        triggerSound?.('success');
                      }
                    }}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between gap-2 cursor-pointer ${
                      owned ? 'bg-emerald-950/30 border-emerald-500/40' : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-black text-white truncate">{item.name}</div>
                      <div className="text-[10px] text-zinc-400 truncate">{item.desc}</div>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 text-xs font-mono font-bold shrink-0">
                      {owned ? 'Wear' : formatNaira(item.priceNGN)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 6. HAIR SALON / BARBERSHOP MODAL */}
      {activeModal === 'salon' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl p-5 space-y-4 max-h-[88vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <Scissors className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-black text-white">{location.name} — Hair Salon & Grooming</h3>
              </div>
              <button type="button" onClick={() => setActiveModal(null)} className="text-zinc-400 hover:text-white cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 overflow-y-auto pr-1">
              {SALON_HAIRSTYLES_CATALOG.filter(
                (h) => h.gender === avatar.gender || h.gender === 'unisex'
              ).map((style) => {
                const owned = style.isStarter || (userProfile.ownedHairstyles || []).includes(style.id);
                return (
                  <button
                    key={style.id}
                    type="button"
                    onClick={async () => {
                      if (owned) {
                        onUpdateUserProfile?.({
                          ...userProfile,
                          avatar: { ...avatar, hairstyle: style.id as CharacterAvatar['hairstyle'] },
                        });
                        showActionBanner(`💇 Styled hair into ${style.name}!`);
                        triggerSound?.('success');
                        return;
                      }
                      const ok = await applyDebitWithReceipt({
                        itemId: style.id,
                        title: `Salon Cut: ${style.name}`,
                        category: 'lifestyle',
                        costNGN: style.priceNGN,
                        unlockType: 'hairstyle',
                        unlockKey: style.id,
                        profilePatch: {
                          ownedHairstyles: Array.from(new Set([...(userProfile.ownedHairstyles || []), style.id])),
                          avatar: { ...avatar, hairstyle: style.id as CharacterAvatar['hairstyle'] },
                        },
                      });
                      if (ok) {
                        onUpdateStats({ happiness: 18 });
                        showActionBanner(`💇 New 3D Hairstyle: ${style.name} (-${formatNaira(style.priceNGN)})!`);
                        triggerSound?.('success');
                      }
                    }}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between gap-2 cursor-pointer ${
                      avatar.hairstyle === style.id
                        ? 'bg-emerald-950/40 border-emerald-500'
                        : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-black text-white truncate">{style.name}</div>
                      <div className="text-[10px] text-zinc-400 truncate">{style.desc}</div>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold shrink-0">
                      {avatar.hairstyle === style.id ? 'Active' : owned ? 'Style' : formatNaira(style.priceNGN)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 7. BANK TELLER & FX MODAL */}
      {activeModal === 'bank' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Landmark className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-sm font-black text-white">{location.name} — Teller Counter</h3>
                  <p className="text-[10px] font-mono text-emerald-400">
                    Acct: {userProfile.walletAccountNumber || 'N/A'} · @{userProfile.username}
                  </p>
                </div>
              </div>
              <button type="button" onClick={() => setActiveModal(null)} className="text-zinc-400 hover:text-white cursor-pointer"><X className="w-4 h-4" /></button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800">
                <span className="text-[10px] text-zinc-400 block">NGN Balance</span>
                <span className="font-mono font-black text-emerald-400">{formatNaira(userProfile.bankNaira || 0)}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800">
                <span className="text-[10px] text-zinc-400 block">CAD Balance</span>
                <span className="font-mono font-black text-sky-400">${(userProfile.bankCAD || 0).toLocaleString()} CAD</span>
              </div>
            </div>

            {/* P2P Transfer */}
            <div className="p-3 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-2.5">
              <div className="text-xs font-black text-white">Send Funds (Username or 10-Digit NUBAN)</div>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  value={bankRecipient}
                  onChange={(e) => setBankRecipient(e.target.value)}
                  placeholder="@username or 30..."
                  className="col-span-2 px-2.5 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-white"
                />
                <select
                  value={bankCurrency}
                  onChange={(e) => setBankCurrency(e.target.value as 'NGN' | 'CAD')}
                  className="px-2 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-white"
                >
                  <option value="NGN">NGN (₦)</option>
                  <option value="CAD">CAD ($)</option>
                </select>
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  min={1}
                  value={bankAmount}
                  onChange={(e) => setBankAmount(e.target.value)}
                  className="flex-1 px-2.5 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-white font-mono"
                />
                <button
                  type="button"
                  disabled={isBankBusy}
                  onClick={async () => {
                    const amt = Number(bankAmount);
                    if (!bankRecipient.trim() || !amt || amt <= 0) {
                      onShowToast('Enter valid recipient and positive amount.');
                      return;
                    }
                    setIsBankBusy(true);
                    const res = await executeServerTransfer({
                      senderUsername: userProfile.username,
                      recipientIdentifier: bankRecipient.trim(),
                      amount: amt,
                      currency: bankCurrency,
                      note: `Counter transfer at ${location.name}`,
                    });
                    setIsBankBusy(false);
                    if (res.success && res.senderProfile) {
                      onUpdateUserProfile?.({
                        ...userProfile,
                        bankNaira: res.senderProfile.bankNaira,
                        bankCAD: res.senderProfile.bankCAD,
                        receipts: res.senderProfile.receipts || userProfile.receipts,
                      });
                      setBankRecipient('');
                      showActionBanner(res.message || 'Transfer successful!');
                      triggerSound?.('success');
                    } else {
                      onShowToast(res.error || 'Transfer failed');
                      triggerSound?.('alert');
                    }
                  }}
                  className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-black cursor-pointer disabled:opacity-50"
                >
                  Send
                </button>
              </div>
            </div>

            {/* FX Exchange */}
            <div className="p-3 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-2.5">
              <div className="text-xs font-black text-white flex items-center gap-1.5">
                <ArrowRightLeft className="w-3.5 h-3.5 text-sky-400" />
                <span>FX Desk (1 CAD ≈ ₦{ECONOMY_CONFIG.cadToNgnRate})</span>
              </div>
              <div className="flex gap-2">
                <select
                  value={fxDirection}
                  onChange={(e) => setFxDirection(e.target.value as 'NGN_TO_CAD' | 'CAD_TO_NGN')}
                  className="px-2.5 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-white"
                >
                  <option value="NGN_TO_CAD">NGN → CAD</option>
                  <option value="CAD_TO_NGN">CAD → NGN</option>
                </select>
                <input
                  type="number"
                  min={1}
                  value={fxAmount}
                  onChange={(e) => setFxAmount(e.target.value)}
                  className="flex-1 px-2.5 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-white font-mono"
                />
                <button
                  type="button"
                  disabled={isBankBusy}
                  onClick={async () => {
                    const amt = Number(fxAmount);
                    if (!amt || amt <= 0) return;
                    setIsBankBusy(true);
                    const res = await executeServerFxExchange({
                      direction: fxDirection,
                      amount: amt,
                    });
                    setIsBankBusy(false);
                    if (res.success && res.account) {
                      onUpdateUserProfile?.({
                        ...userProfile,
                        bankNaira: res.account.bankNaira,
                        bankCAD: res.account.bankCAD,
                        receipts: res.account.receipts,
                      });
                      showActionBanner(res.message || 'FX exchange completed!');
                      triggerSound?.('success');
                    } else {
                      onShowToast(res.error || 'FX failed');
                      triggerSound?.('alert');
                    }
                  }}
                  className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-zinc-950 text-xs font-black cursor-pointer disabled:opacity-50"
                >
                  Convert
                </button>
              </div>
            </div>

            {onOpenPhoneApp && (
              <button
                type="button"
                onClick={() => {
                  setActiveModal(null);
                  onOpenPhoneApp('bank');
                }}
                className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-bold text-zinc-200 cursor-pointer"
              >
                Open Full Bank App & Ledger History
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
