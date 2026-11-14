/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  X,
  ChevronLeft,
  Wifi,
  Battery,
  Signal,
  DollarSign,
  TrendingUp,
  MessageSquare,
  Briefcase,
  Settings,
  CreditCard,
  Send,
  RefreshCw,
  Phone,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Trophy,
  Plane,
  RotateCcw,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Coins,
  ShieldCheck,
  Zap,
  HelpCircle,
  Bell,
  Home,
  Car,
  Landmark,
  Building,
  Key,
  Search,
  Bed,
  PartyPopper,
  GraduationCap,
  Wrench,
  UtensilsCrossed,
  ShoppingBag,
  HeartPulse,
  Shield,
  Smartphone,
  Bus,
  Award,
  Users,
  User,
  Compass,
  Mic,
  MicOff,
  Image,
  Palette,
  Check,
  PlusCircle,
  Clock,
  Activity,
  FileText,
  BadgeCheck,
  Bot,
  MessageSquarePlus,
  Trash2,
  LogOut,
  ShoppingCart,
  Store,
  Flame,
  AlertTriangle,
  Crown,
  Anchor,
  Dog,
  PawPrint,
  Eye,
  EyeOff,
  Lock,
  Mail,
  KeyRound,
  Ban,
  UserCheck,
  Cloud,
  ChevronRight,
} from 'lucide-react';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { isStrictOwnerIdentity } from '../utils/authValidation';
import {
  changeCitizenUsername,
  checkUsernameAvailable,
  fetchOwnerAuditLogs,
  fetchOwnerCitizenRegistry,
  OwnerAuditLogEntry,
  RegistryCitizenEntry,
  requestCitizenEmailUpdate,
  sendPasswordReset,
  setCitizenSuspensionStatus,
  syncProfileToCloud,
  updateCitizenPassword,
} from '../services/firebaseAccountService';
import {
  UserProfile,
  PropertyAsset,
  VehicleAsset,
  InvestmentAsset,
  BusinessVenture,
  UserDocument,
} from '../types/game';
import { CANADA_STATE_DATA } from '../data/canadaLocations150';
import {
  AVAILABLE_VEHICLES,
  AVAILABLE_INVESTMENTS
} from '../data/assetsData';
import { NIGERIA_36_STATES_ALPHABETICAL } from '../data/stateLocationsData';
import { EXPANDED_PHONES, PhoneDeviceItem } from '../data/expandedPhoneCatalog';
import {
  EXPANDED_BUSINESSES,
  EXPANDED_JOBS,
  EXPANDED_HOUSES,
  EXPANDED_CHOWDECK,
  EXPANDED_COURSES,
  EXPANDED_BOUTIQUE,
  BusinessItem,
  JobItem,
  FoodItem,
  CourseItem,
  BoutiqueItem
} from '../data/expandedLifeData';
import { GROCERIES_100_CATALOG, GroceryItem } from '../data/groceriesCatalog';
import { CharacterRenderer } from './CharacterRenderer';
import { ThreeCharacterAvatar } from './ThreeCharacterAvatar';
import { CharacterAvatar } from '../types/game';
import { STORAGE_SESSION_KEY, STORAGE_USERS_KEY } from './AuthPortal';
import {
  calculateInterstateTrip,
  calculateDomesticFlightDetails,
  STATE_AIRPORTS,
  DOMESTIC_AIRLINES,
  INTERNATIONAL_DESTINATIONS,
  AirlineOption,
  FlightCabinClass,
  FLIGHT_CABIN_CLASSES,
  FLIGHT_SCHEDULE_PLANS,
  CANADA_AIRLINES,
  CANADA_CABIN_CLASSES,
} from '../utils/travelPricing';
import { formatNaira, formatCAD, formatFullNumberDigits } from '../utils/formatNaira';
import { getStoredUsers, saveSession } from './AuthPortal';
import { LUXURY_CATALOG, LuxuryVehicleItem } from '../data/luxuryCatalog';
import { PET_CATALOG, PetItem } from '../data/petCatalog';
import {
  getCourseLessons,
  getCourseTotalLessons,
  getCourseDailyCap,
  CourseLesson,
  StudentCourseProgress,
} from '../data/courseCurriculum';
import { SnapchatApp } from './SnapchatApp';
import {
  EXPANDED_105_WALLPAPERS,
  getDefaultWallpaperForPhoneModel,
  PhoneWallpaper,
} from '../data/wallpapers105';
import {
  CANADA_PROPERTIES,
  CanadianProperty,
  CANADA_FOOD_ITEMS,
  CanadianFoodItem,
  CANADA_GROCERIES,
  CanadianGroceryItem,
  CANADA_JOBS,
  CanadianJobItem,
  CANADA_BUSINESSES,
  CanadianBusiness,
  CANADA_COURSES,
  CanadianCourse,
  MULTI_SPORTS_FIXTURES,
  SportFixture,
} from '../data/canadaLifeCatalog';
import {
  CANADIAN_INVESTMENTS_CATALOG,
  CANADIAN_CARS_CATALOG,
  CANADIAN_PETS_CATALOG,
  CANADIAN_BOUTIQUE_105,
  CANADIAN_GROCERIES_95_ADDITIONAL,
  CANADIAN_FOOD_95_ADDITIONAL,
  CAD_TO_NGN_RATE,
} from '../data/canadaExpandedCatalogs';
import {
  getJobCertificateRequirement,
  getWorkShiftQuestions,
  WorkShiftQuestion
} from '../data/workShiftScenarios';

export function formatFullNairaNumber(amount: number): string {
  if (!amount || isNaN(amount)) return '₦0.00';
  if (amount >= 1e24) {
    const val = amount / 1e24;
    return `₦${val % 1 === 0 ? val : val.toFixed(1)} Septillion`;
  }
  if (amount >= 1e21) {
    const val = Math.round((amount / 1e21) * 10) / 10;
    return `₦${val % 1 === 0 ? val : val.toFixed(1)} Sextillion`;
  }
  if (amount >= 1e18) {
    const val = amount / 1e18;
    return `₦${val % 1 === 0 ? val : val.toFixed(1)} Quintillion`;
  }
  if (amount >= 1e15) {
    const val = amount / 1e15;
    return `₦${val % 1 === 0 ? val : val.toFixed(1)} Quadrillion`;
  }
  if (amount >= 1e12) {
    const val = amount / 1e12;
    return `₦${val % 1 === 0 ? val : val.toFixed(1)} Trillion`;
  }
  if (amount >= 1e9) {
    const val = amount / 1e9;
    return `₦${val % 1 === 0 ? val : val.toFixed(1)} Billion`;
  }
  if (amount >= 1e6) {
    const val = amount / 1e6;
    return `₦${val % 1 === 0 ? val : val.toFixed(1)} Million`;
  }
  return `₦${Math.floor(amount).toLocaleString('en-US')}.00`;
}

export interface NaijaPhoneProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  moneyNGN: number;
  moneyUSD: number;
  energy: number;
  hunger: number;
  health: number;
  happiness: number;
  ownedProperties: PropertyAsset[];
  activeHome: PropertyAsset | null;
  onSelectActiveHome: (property: PropertyAsset) => void;
  onBuyOrRentProperty: (property: PropertyAsset, mode: 'rent' | 'buy') => void;
  ownedVehicles: VehicleAsset[];
  activeVehicle: VehicleAsset | null;
  onSelectActiveVehicle: (vehicle: VehicleAsset) => void;
  onBuyVehicle: (vehicle: VehicleAsset) => void;
  investments: InvestmentAsset[];
  onInvest: (assetId: string, amount: number) => void;
  onLiquidateInvestment: (assetId: string) => void;
  onUpdateMoney: (deltaNGN: number, deltaUSD?: number) => void;
  onUpdateStats: (effects: { energy?: number; hunger?: number; health?: number; happiness?: number }) => void;
  onLogAction: (category: 'finance' | 'career' | 'lifestyle' | 'social', text: string) => void;
  onShowToast: (message: string) => void;
  onLogout?: () => void;
  triggerSound?: (type: 'coin' | 'stamp' | 'alert' | 'success') => void;
  currentStateId?: string;
  gameHour?: number;
  gameDay?: number;
  onInterstateTravel?: (targetState: any, fare: number) => void;
  onFlightTravel?: (targetState: any, fare: number, airlineName?: string, aircraftModel?: string) => void;
  onBusTravel?: (targetState: any, fare: number, busOperator?: string) => void;
  initialApp?: PhoneAppType;
  onUpdateProfile?: (updatedProfile: UserProfile) => void;
  cloudSyncStatus?: 'synced' | 'syncing' | 'conflict' | 'offline';
  onTriggerCloudSync?: () => Promise<void> | void;
}

export type PhoneAppType =
  | 'home'
  | 'snapchat'
  | 'government'
  | 'flight'
  | 'business'
  | 'jobs'
  | 'banking'
  | 'houses'
  | 'cars'
  | 'luxury'
  | 'pets'
  | 'messenger'
  | 'call'
  | 'eatery'
  | 'groceries'
  | 'courses'
  | 'invest'
  | 'naijabet'
  | 'health'
  | 'boutique'
  | 'handy'
  | 'bus'
  | 'phones'
  | 'certificates'
  | 'documents'
  | 'immigration'
  | 'suggestions'
  | 'settings';

export interface CommunityFeedbackTicket {
  id: string;
  category: 'Suggestion' | 'Complaint' | 'Bug Report' | 'General';
  title: string;
  details: string;
  username: string;
  senderName: string;
  stateOrigin: string;
  timestamp: string;
  status: 'Pending' | 'Reviewed' | 'Resolved';
}

const WALLPAPERS = EXPANDED_105_WALLPAPERS;

export const NaijaPhone: React.FC<NaijaPhoneProps> = ({
  isOpen,
  onClose,
  userProfile,
  moneyNGN,
  moneyUSD,
  energy,
  hunger,
  health,
  happiness,
  ownedProperties,
  activeHome,
  onSelectActiveHome,
  onBuyOrRentProperty,
  ownedVehicles,
  activeVehicle,
  onSelectActiveVehicle,
  onBuyVehicle,
  investments,
  onInvest,
  onLiquidateInvestment,
  onUpdateMoney,
  onUpdateStats,
  onLogAction,
  onShowToast,
  onLogout,
  triggerSound,
  currentStateId,
  gameHour,
  gameDay,
  onInterstateTravel,
  onFlightTravel,
  onBusTravel,
  initialApp = 'home',
  onUpdateProfile,
  cloudSyncStatus = 'synced',
  onTriggerCloudSync,
}) => {
  const [currentApp, setCurrentApp] = useState<PhoneAppType>(initialApp);

  useEffect(() => {
    if (initialApp && initialApp !== 'home') {
      setCurrentApp(initialApp);
    }
  }, [initialApp]);

  // Government App state (Democracy for real players; NO fake names; all positions coming soon)
  const [govLevelTab, setGovLevelTab] = useState<'federal' | 'state'>('federal');
  const [selectedGovStateId, setSelectedGovStateId] = useState<string>(currentStateId || 'lagos');

  // Flight App state (Domestic flights with real pricing & surge + International concourse)
  const [flightTab, setFlightTab] = useState<'domestic' | 'international'>('domestic');
  const [flightDestStateId, setFlightDestStateId] = useState<string>(currentStateId === 'abuja' ? 'lagos' : 'abuja');
  const [flightAirlineId, setFlightAirlineId] = useState<'air_peace' | 'ibom_air' | 'green_africa' | 'united_nigeria' | 'max_air'>('air_peace');
  const [flightSeatClass, setFlightSeatClass] = useState<FlightCabinClass>('economy');
  const [flightScheduleId, setFlightScheduleId] = useState<string>('morning_shuttle');
  const [selectedIntlDestId, setSelectedIntlDestId] = useState<string | null>('canada');
  const [canadaAirlineId, setCanadaAirlineId] = useState<string>('air_canada');
  const [canadaSeatClass, setCanadaSeatClass] = useState<FlightCabinClass>('economy');

  // Active State resolution
  const activeStateKey = currentStateId || userProfile?.spawnStateId || 'lagos';

  // Real world clock & date state
  const [liveRealTime, setLiveRealTime] = useState<string>('');
  const [liveRealDate, setLiveRealDate] = useState<string>('');
  const [batteryLevel] = useState<number>(92);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const isCanada = activeStateKey === 'canada';
      const timeZone = isCanada ? 'America/Toronto' : 'Africa/Lagos';

      const timeStr = now.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone,
      });
      setLiveRealTime(timeStr);

      const options: Intl.DateTimeFormatOptions = {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        timeZone,
      };
      setLiveRealDate(now.toLocaleDateString('en-US', options));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [activeStateKey]);

  // Phone Wallpaper & Model styling
  const modelLower = (userProfile?.phoneModel || 'iphone').toLowerCase();
  const isIphone18PM = modelLower === 'iphone_18_pm';
  const isIphone17PM = modelLower === 'iphone_17_pm';
  const isIphoneX = modelLower === 'iphone_x';
  const isIphone = isIphone18PM || isIphone17PM || isIphoneX || modelLower.includes('iphone') || modelLower.includes('apple');
  const isSamsung = modelLower.includes('samsung') || modelLower.includes('galaxy');
  const isPixel = modelLower.includes('pixel') || modelLower.includes('google');
  const isXiaomi =
    modelLower.includes('xiaomi') ||
    modelLower.includes('redmi') ||
    modelLower.includes('poco');
  const isTranssion =
    modelLower.includes('tecno') ||
    modelLower.includes('infinix') ||
    modelLower.includes('itel');

  const defaultWallpaperId = getDefaultWallpaperForPhoneModel(userProfile?.phoneModel);
  const [currentWallpaper, setCurrentWallpaper] = useState<string>(() => {
    return userProfile?.phoneWallpaper || defaultWallpaperId;
  });
  const [isWallpaperGalleryOpen, setIsWallpaperGalleryOpen] = useState<boolean>(false);
  const [wallpaperCategoryFilter, setWallpaperCategoryFilter] = useState<string>('All');
  const [wallpaperSearch, setWallpaperSearch] = useState<string>('');
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState<boolean>(false);
  const [tempAvatar, setTempAvatar] = useState<CharacterAvatar>(
    userProfile?.avatar || {
      gender: 'male',
      skinTone: '#8d5524',
      hairstyle: 'peaky_cap',
      hairColor: '#18181b',
      outfit: 'corporate',
      pants: 'slacks',
      shoes: 'loafers',
      accessory: 'none',
    }
  );

  // Canada & Region tabs for apps
  const [foodRegion, setFoodRegion] = useState<'nigeria' | 'canada'>('nigeria');
  const [groceryRegion, setGroceryRegion] = useState<'nigeria' | 'canada'>('nigeria');
  const [courseRegion, setCourseRegion] = useState<'nigeria' | 'canada'>('nigeria');
  const [certRegion, setCertRegion] = useState<'nigeria' | 'canada'>('nigeria');
  const [govRegion, setGovRegion] = useState<'nigeria' | 'canada'>('nigeria');
  const [bizRegion, setBizRegion] = useState<'nigeria' | 'canada'>('nigeria');
  const [betSportTab, setBetSportTab] = useState<'football' | 'basketball' | 'rugby' | 'tennis' | 'combat'>('football');
  const [canadaWorkPermitModalOpen, setCanadaWorkPermitModalOpen] = useState<boolean>(false);
  const [isBroadcastingSyncing, setIsBroadcastingSyncing] = useState<boolean>(false);
  const [broadcastSyncProgress, setBroadcastSyncProgress] = useState<number>(0);
  const [phoneCanadaBusJokeOpen, setPhoneCanadaBusJokeOpen] = useState<boolean>(false);

  const activeWallpaperObj = useMemo(() => {
    return (WALLPAPERS || []).find((w) => w.id === currentWallpaper) || WALLPAPERS[0];
  }, [currentWallpaper]);

  // Sickness state (MedClinic)
  const [activeSickness, setActiveSickness] = useState<string | null>(() => {
    try {
      return localStorage.getItem('naija_life_active_sickness') || null;
    } catch {
      return null;
    }
  });

  // Low energy or low hunger triggers sickness
  useEffect(() => {
    if (energy < 15 && !activeSickness) {
      const condition = 'Severe Physical Exhaustion & Sleep Deprivation';
      setActiveSickness(condition);
      try { localStorage.setItem('naija_life_active_sickness', condition); } catch {}
      onShowToast(`🚨 You fell sick from lack of sleep & extreme exhaustion! Visit MedClinic.`);
    } else if (hunger < 15 && !activeSickness) {
      const condition = 'Acute Gastritis & Nutritional Starvation';
      setActiveSickness(condition);
      try { localStorage.setItem('naija_life_active_sickness', condition); } catch {}
      onShowToast(`🚨 You collapsed from extreme hunger! Visit MedClinic.`);
    }
  }, [energy, hunger, activeSickness, onShowToast]);

  // Periodic rare sickness trigger (comes once in a while)
  useEffect(() => {
    const sickInterval = setInterval(() => {
      if (!activeSickness && Math.random() < 0.05) {
        const RANDOM_SICKNESSES = [
          'Malaria & High Typhoid Fever',
          'Acute Food Poisoning & Dehydration',
          'Bronchial Chest Infection & Wheezing Cough',
        ];
        const chosen = RANDOM_SICKNESSES[Math.floor(Math.random() * RANDOM_SICKNESSES.length)];
        setActiveSickness(chosen);
        try { localStorage.setItem('naija_life_active_sickness', chosen); } catch {}
        onShowToast(`🤒 You are feeling sick with ${chosen}! Open MedClinic.`);
      }
    }, 180000);
    return () => clearInterval(sickInterval);
  }, [activeSickness, onShowToast]);

  // Business Ventures State (70 per state)
  const [bizStateFilter, setBizStateFilter] = useState<string>('all');
  const [userBusinesses, setUserBusinesses] = useState<BusinessVenture[]>(() => {
    return userProfile?.ownedBusinesses || [];
  });
  const [newBizName, setNewBizName] = useState<string>('');
  const [selectedBizType, setSelectedBizType] = useState<string>('biz_lagos_1');

  // Job state (70 per state)
  const [jobStateFilter, setJobStateFilter] = useState<string>('all');
  const [currentJob, setCurrentJob] = useState<JobItem | null>(null);

  // Houses state (100 per state)
  const [houseStateFilter, setHouseStateFilter] = useState<string>('all');

  // Food state (50+ more options)
  const [foodCategoryFilter, setFoodCategoryFilter] = useState<string>('All');

  // Groceries state (100 items)
  const [groceryCategoryFilter, setGroceryCategoryFilter] = useState<string>('All');
  const [grocerySearchQuery, setGrocerySearchQuery] = useState<string>('');

  // Academy state (All in Lessons, Notes, 10-question Quizzes, GPA/CGPA, Daily Lesson Limit)
  const [courseCategoryFilter, setCourseCategoryFilter] = useState<string>('All');
  const [completedCoursesState, setCompletedCoursesState] = useState<string[]>(() => {
    return userProfile?.completedCourses || [];
  });
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
  const [courseProgressMap, setCourseProgressMap] = useState<Record<string, StudentCourseProgress>>(() => {
    try {
      const raw = localStorage.getItem('naija_life_course_progress_v3');
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });
  const [activeLessonStep, setActiveLessonStep] = useState<'reading' | 'quiz' | 'result'>('reading');
  const [selectedQuizAnswers, setSelectedQuizAnswers] = useState<Record<number, number>>({});
  const [lastQuizResult, setLastQuizResult] = useState<{ score: number; gpa: number; passed: boolean } | null>(null);
  const [currentQuizQuestionIndex, setCurrentQuizQuestionIndex] = useState<number>(0);
  const [selectedQuizChoice, setSelectedQuizChoice] = useState<number | null>(null);
  const [quizAnswerSubmitted, setQuizAnswerSubmitted] = useState<boolean>(false);

  const saveCourseProgress = (updatedMap: Record<string, StudentCourseProgress>) => {
    setCourseProgressMap(updatedMap);
    try {
      localStorage.setItem('naija_life_course_progress_v3', JSON.stringify(updatedMap));
    } catch {}
    if (userProfile) {
      userProfile.academyProgress = updatedMap;
    }
  };

  // Luxury App state (98 models: 33 jets, 33 helicopters, 32 yachts)
  const [luxuryCategoryFilter, setLuxuryCategoryFilter] = useState<'all' | 'jet' | 'helicopter' | 'yacht'>('all');
  const [luxurySearchQuery, setLuxurySearchQuery] = useState<string>('');

  // Pets state (All coming soon)
  const [petCategoryFilter, setPetCategoryFilter] = useState<string>('All');

  // Empire Biz Live Stacking Yield & Cash Out (strictly zero if player has no businesses)
  const [bizStackedProfit, setBizStackedProfit] = useState<number>(() => {
    if (!userProfile?.ownedBusinesses || userProfile.ownedBusinesses.length === 0) {
      try { localStorage.removeItem('naija_life_biz_accrued_profit'); } catch {}
      return 0;
    }
    try {
      const raw = localStorage.getItem('naija_life_biz_accrued_profit');
      return raw ? Number(raw) : 0;
    } catch {
      return 0;
    }
  });

  // Boutique state
  const [boutiqueCategoryFilter, setBoutiqueCategoryFilter] = useState<string>('All');

  // Phones state
  const [phoneBrandFilter, setPhoneBrandFilter] = useState<string>('All');
  const [phoneSearchQuery, setPhoneSearchQuery] = useState<string>('');

  // Suggestions & Complaints state
  const [suggestionTab, setSuggestionTab] = useState<'submit' | 'my_submissions' | 'owner_inbox'>('submit');
  const [suggestionCategory, setSuggestionCategory] = useState<'Suggestion' | 'Complaint' | 'Bug Report' | 'General'>('Suggestion');
  const [suggestionTitle, setSuggestionTitle] = useState<string>('');
  const [suggestionDetails, setSuggestionDetails] = useState<string>('');
  const [feedbackTickets, setFeedbackTickets] = useState<CommunityFeedbackTicket[]>(() => {
    try {
      const raw = localStorage.getItem('naija_life_community_feedback_v1');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // Banking state (Naija Pay - Multi-Country accounts: Nigeria, Canada, UK, US, UAE)
  const [bankCountry, setBankCountry] = useState<'nigeria' | 'canada' | 'uk' | 'usa' | 'uae'>('nigeria');
  const [bankTab, setBankTab] = useState<'home' | 'transfer' | 'savings' | 'repay_loan'>('home');
  const [transferUser, setTransferUser] = useState<string>('');
  const [transferAmount, setTransferAmount] = useState<number>(10000);
  const [savingsInputAmount, setSavingsInputAmount] = useState<number>(50000);
  const [repayLoanAmount, setRepayLoanAmount] = useState<number>(userProfile?.loanBalanceNGN || 0);

  // Canada Bank CAD & Cross-Border FX State
  const [fxModalOpen, setFxModalOpen] = useState<boolean>(false);
  const [fxDirection, setFxDirection] = useState<'ngn_to_cad' | 'cad_to_ngn'>('ngn_to_cad');
  const [fxAmount, setFxAmount] = useState<number>(115000);
  const [cadTransferUser, setCadTransferUser] = useState<string>('');
  const [cadTransferAmount, setCadTransferAmount] = useState<number>(100);
  const [cadSavingsInput, setCadSavingsInput] = useState<number>(50);

  // Documents App State
  const [documentsFilter, setDocumentsFilter] = useState<'all' | 'canada' | 'nigeria'>('all');

  // Immigration Interactive Assessment State
  const [selectedImmigrationItem, setSelectedImmigrationItem] = useState<any | null>(null);
  const [visaAnswerDest, setVisaAnswerDest] = useState<string>('Toronto (Ontario)');
  const [visaAnswerStream, setVisaAnswerStream] = useState<string>('Federal Skilled Worker (Express Entry)');
  const [visaAnswerFunds, setVisaAnswerFunds] = useState<string>('Certified Settlement Funds Available');

  // NaijaBet state: SportyBet 10 matches + Aviator + History Tab
  const [betTab, setBetTab] = useState<'sports' | 'history' | 'aviator'>('sports');
  const [selectedPicks, setSelectedPicks] = useState<Record<string, { match: string; pick: string; odd: number }>>({});
  const [betStake, setBetStake] = useState<number>(2000);
  const [placedBetSlips, setPlacedBetSlips] = useState<{
    id: string;
    summary: string;
    picksCount: number;
    totalOdds: number;
    stake: number;
    potentialWin: number;
    status: 'PENDING' | 'WON' | 'LOST';
    date: string;
    picks?: { match: string; pick: string; odd: number; isCorrect?: boolean; result?: string }[];
  }[]>(() => {
    try {
      const raw = localStorage.getItem('naija_life_bet_slips');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // NaijaBet Daily 8:30 PM WAT Match Settlement (0.1% win probability)
  useEffect(() => {
    const settlePendingSlips = () => {
      const now = new Date();
      // Calculate West Africa Time (UTC+1)
      const utc = now.getTime() + now.getTimezoneOffset() * 60000;
      const watDate = new Date(utc + 3600000 * 1);
      const watHours = watDate.getHours();
      const watMins = watDate.getMinutes();

      // Check if past 20:30 WAT (8:30 PM)
      const isPastSettlement = watHours > 20 || (watHours === 20 && watMins >= 30);
      if (!isPastSettlement) return;

      setPlacedBetSlips((prevSlips) => {
        let hasResolved = false;
        const updated = prevSlips.map((slip) => {
          if (slip.status !== 'PENDING') return slip;
          hasResolved = true;

          // 0.1% chance of winning (0.001)
          const isWinner = Math.random() < 0.001;
          const evaluatedPicks = (slip.picks || []).map((p) => {
            if (isWinner) {
              return { ...p, isCorrect: true, result: p.pick };
            } else {
              const correct = Math.random() < 0.35;
              return { ...p, isCorrect: correct, result: correct ? p.pick : (p.pick === '1' ? '2' : '1') };
            }
          });

          if (!isWinner && evaluatedPicks.length > 0 && evaluatedPicks.every((p) => p.isCorrect)) {
            evaluatedPicks[0].isCorrect = false;
            evaluatedPicks[0].result = evaluatedPicks[0].pick === '1' ? '2' : '1';
          }

          if (isWinner) {
            onUpdateMoney(slip.potentialWin);
            onShowToast(`🎉 NAIJABET WINNER! Your bet slip won ${formatNaira(slip.potentialWin)}!`);
            triggerSound?.('success');
            return {
              ...slip,
              status: 'WON' as const,
              picks: evaluatedPicks,
            };
          } else {
            return {
              ...slip,
              status: 'LOST' as const,
              picks: evaluatedPicks,
            };
          }
        });

        if (hasResolved) {
          try {
            localStorage.setItem('naija_life_bet_slips', JSON.stringify(updated));
          } catch {}
          return updated;
        }
        return prevSlips;
      });
    };

    settlePendingSlips();
    const interval = setInterval(settlePendingSlips, 20000);
    return () => clearInterval(interval);
  }, [onUpdateMoney, onShowToast, triggerSound]);

  // Empire Biz & Invest Sub-Tabs
  const [bizSubTab, setBizSubTab] = useState<'owned' | 'catalog'>('owned');
  const [investSubTab, setInvestSubTab] = useState<'holdings' | 'catalog' | 'canada'>('holdings');
  const [carsSubTab, setCarsSubTab] = useState<'nigeria' | 'canada'>('nigeria');
  const [petsSubTab, setPetsSubTab] = useState<'nigeria' | 'canada'>('nigeria');
  const [boutiqueRegionTab, setBoutiqueRegionTab] = useState<'nigeria' | 'canada'>('nigeria');
  const [isGlobalServerSyncing, setIsGlobalServerSyncing] = useState<boolean>(false);
  const [globalServerSyncPct, setGlobalServerSyncPct] = useState<number>(0);
  const [isNepaControlRoomOpen, setIsNepaControlRoomOpen] = useState<boolean>(false);
  const [nepaControlGrid, setNepaControlGrid] = useState<Record<string, { name: string; lightOn: boolean; voltage: number; megawatt: number }>>({});
  const [isPlayersRegistryModalOpen, setIsPlayersRegistryModalOpen] = useState<boolean>(false);
  const [playersRegistryList, setPlayersRegistryList] = useState<RegistryCitizenEntry[]>([]);
  const [registryMetrics, setRegistryMetrics] = useState({
    total: 0,
    verified: 0,
    unverified: 0,
    recent: 0,
    suspended: 0,
    active: 0,
  });
  const [registryAuditLogs, setRegistryAuditLogs] = useState<OwnerAuditLogEntry[]>([]);
  const [registryActiveTab, setRegistryActiveTab] = useState<'citizens' | 'audit'>('citizens');
  const [isRegistryScanning, setIsRegistryScanning] = useState<boolean>(false);
  const [registryScanPct, setRegistryScanPct] = useState<number>(0);
  const [registryScanMsg, setRegistryScanMsg] = useState<string>('Connecting to Firestore Citizen Ledger...');
  const [registryScanResult, setRegistryScanResult] = useState<string | null>(null);
  const [registrySearchTerm, setRegistrySearchTerm] = useState<string>('');
  const [registryVerifyFilter, setRegistryVerifyFilter] = useState<'all' | 'verified' | 'unverified'>('all');
  const [registryStatusFilter, setRegistryStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [registrySortOrder, setRegistrySortOrder] = useState<'newest' | 'oldest'>('newest');
  const [registryPage, setRegistryPage] = useState<number>(1);
  const [inspectedCitizen, setInspectedCitizen] = useState<RegistryCitizenEntry | null>(null);
  const [suspendReasonInput, setSuspendReasonInput] = useState<string>('');
  const [isSuspensionBusy, setIsSuspensionBusy] = useState<boolean>(false);
  const [academySearchQuery, setAcademySearchQuery] = useState<string>('');

  // Account Settings & Security Panel state
  const [accountActionTab, setAccountActionTab] = useState<'none' | 'username' | 'password' | 'email'>('none');
  const [newUsernameInput, setNewUsernameInput] = useState<string>('');
  const [usernameStatusMsg, setUsernameStatusMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [curPwdInput, setCurPwdInput] = useState<string>('');
  const [newPwdInput, setNewPwdInput] = useState<string>('');
  const [confirmPwdInput, setConfirmPwdInput] = useState<string>('');
  const [showAccountPwds, setShowAccountPwds] = useState<boolean>(false);
  const [newEmailInput, setNewEmailInput] = useState<string>('');
  const [emailChangePwdInput, setEmailChangePwdInput] = useState<string>('');
  const [accountSecurityBusy, setAccountSecurityBusy] = useState<boolean>(false);
  const [accountSecurityFeedback, setAccountSecurityFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // Interactive 15-question Work Shift State with 10-15 min countdown timer
  const [activeWorkShift, setActiveWorkShift] = useState<{
    job: any;
    isCanada: boolean;
    questions: WorkShiftQuestion[];
    currentIndex: number;
    correctCount: number;
    timerSeconds: number;
    maxTimerSeconds: number;
    isComplete: boolean;
    answers: number[];
    selectedOption: {
      letter: 'A' | 'B' | 'C' | 'D' | 'E';
      text: string;
      isOptimal: boolean;
      feedback: string;
      scoreDelta: number;
    } | null;
  } | null>(null);

  // Active Work Shift Countdown Timer (between 10 mins and 15 mins countdown)
  useEffect(() => {
    if (!activeWorkShift || activeWorkShift.isComplete || activeWorkShift.timerSeconds <= 0) return;
    const shiftInterval = setInterval(() => {
      setActiveWorkShift((prev) => {
        if (!prev || prev.isComplete) return prev;
        if (prev.timerSeconds <= 1) {
          return {
            ...prev,
            timerSeconds: 0,
            isComplete: true,
          };
        }
        return {
          ...prev,
          timerSeconds: prev.timerSeconds - 1,
        };
      });
    }, 1000);
    return () => clearInterval(shiftInterval);
  }, [activeWorkShift?.isComplete]);

  // Strict Apex Syndicate Owner Account Validator (NEVER trusts username alone!)
  const checkIsOwner = (prof?: any | null): boolean => {
    if (!prof) return false;
    // Registry entry check vs active userProfile check
    if (prof.role === 'owner' && prof.isOwner === true && prof.isVerified === true) {
      return isStrictOwnerIdentity({
        email: prof.email || prof.gmail,
        emailVerified: true,
        username: prof.username,
      });
    }
    if (prof.uid && prof.role === 'owner' && prof.emailVerified === true) {
      return isStrictOwnerIdentity({
        email: prof.email || prof.gmail,
        emailVerified: true,
        username: prof.username,
      });
    }
    return false;
  };

  const getAuthBearerHeaders = async (): Promise<Record<string, string>> => {
    const token = await auth.currentUser?.getIdToken(true);
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const fetchPlayersRegistry = async (): Promise<RegistryCitizenEntry[]> => {
    try {
      const [{ citizens, metrics }, logs] = await Promise.all([
        fetchOwnerCitizenRegistry(),
        fetchOwnerAuditLogs().catch(() => []),
      ]);
      setPlayersRegistryList(citizens);
      setRegistryMetrics(metrics);
      setRegistryAuditLogs(logs);
      return citizens;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load Citizen Account Registry.';
      onShowToast(msg);
      return [];
    }
  };

  // Live automatic synchronization of NEPA grid with server
  useEffect(() => {
    let isMounted = true;
    const fetchNepa = async () => {
      try {
        const res = await fetch('/api/nepa/grid');
        if (res.ok) {
          const d = await res.json();
          if (d.grid && isMounted) {
            setNepaControlGrid(d.grid);
            try {
              localStorage.setItem('naija_life_nepa_grid', JSON.stringify(d.grid));
            } catch {}
          }
        }
      } catch {}
    };

    fetchNepa();
    // Fast 2.5s polling while control room is open so owner witnesses dynamic state changes
    const pollInterval = isNepaControlRoomOpen ? 2500 : 15000;
    const interval = setInterval(fetchNepa, pollInterval);

    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('naija_life_nepa');
      bc.onmessage = (e) => {
        if (e.data?.grid && isMounted) {
          setNepaControlGrid(e.data.grid);
        }
      };
    } catch {}

    return () => {
      isMounted = false;
      clearInterval(interval);
      try { bc?.close(); } catch {}
    };
  }, [isNepaControlRoomOpen]);

  // Owner Broadcast state (for chiboy_52)
  const [ownerBroadcastTrack, setOwnerBroadcastTrack] = useState<string>('');
  const [isUploadingBroadcast, setIsUploadingBroadcast] = useState<boolean>(false);

  // Aviator game state
  const [aviatorStake, setAviatorStake] = useState<number>(1000);
  const [aviatorMultiplier, setAviatorMultiplier] = useState<number>(1.00);
  const [isAviatorFlying, setIsAviatorFlying] = useState<boolean>(false);
  const [aviatorCrashed, setAviatorCrashed] = useState<boolean>(false);
  const [hasCashedOut, setHasCashedOut] = useState<boolean>(false);
  const aviatorTimerRef = useRef<any>(null);
  const [aviatorHistory, setAviatorHistory] = useState<number[]>([1.85, 2.40, 1.15, 12.60, 3.10, 1.95]);

  const handleStartAviator = () => {
    const isCanada = activeStateKey === 'canada';
    const stakeCAD = Math.max(1, Math.round(aviatorStake / 960.54));
    if (isCanada) {
      const userCAD = userProfile?.bankCAD || 0;
      if (userCAD < stakeCAD) {
        onShowToast(`Insufficient CAD funds! Requires $${stakeCAD.toLocaleString()} CAD.`);
        triggerSound?.('alert');
        return;
      }
      if (userProfile) userProfile.bankCAD = userCAD - stakeCAD;
    } else {
      if (moneyNGN < aviatorStake) {
        onShowToast('Insufficient funds for Aviator stake!');
        triggerSound?.('alert');
        return;
      }
      onUpdateMoney(-aviatorStake);
    }
    setIsAviatorFlying(true);
    setAviatorCrashed(false);
    setHasCashedOut(false);
    setAviatorMultiplier(1.00);

    const crashAt = +(Math.random() < 0.65 
      ? (1.15 + Math.random() * 2.8) 
      : Math.random() < 0.85 
      ? (3.5 + Math.random() * 6.0) 
      : (9.0 + Math.random() * 25.0)).toFixed(2);

    let current = 1.00;
    if (aviatorTimerRef.current) clearInterval(aviatorTimerRef.current);

    aviatorTimerRef.current = setInterval(() => {
      current = +(current + 0.04 + (current * 0.02)).toFixed(2);
      if (current >= crashAt) {
        clearInterval(aviatorTimerRef.current);
        setAviatorMultiplier(crashAt);
        setIsAviatorFlying(false);
        setAviatorCrashed(true);
        setAviatorHistory((prev) => [crashAt, ...prev.slice(0, 7)]);
        triggerSound?.('alert');
      } else {
        setAviatorMultiplier(current);
      }
    }, 80);
  };

  const handleCashOutAviator = () => {
    if (!isAviatorFlying || hasCashedOut || aviatorCrashed) return;
    if (aviatorTimerRef.current) clearInterval(aviatorTimerRef.current);
    const isCanada = activeStateKey === 'canada';
    const stakeCAD = Math.max(1, Math.round(aviatorStake / 960.54));
    if (isCanada) {
      const winCAD = Math.round(stakeCAD * aviatorMultiplier);
      if (userProfile) userProfile.bankCAD = (userProfile.bankCAD || 0) + winCAD;
      setHasCashedOut(true);
      setIsAviatorFlying(false);
      onShowToast(`🚀 CASHED OUT at ${aviatorMultiplier}x! Won $${winCAD.toLocaleString()} CAD!`);
    } else {
      const win = Math.round(aviatorStake * aviatorMultiplier);
      onUpdateMoney(win);
      setHasCashedOut(true);
      setIsAviatorFlying(false);
      onShowToast(`🚀 CASHED OUT at ${aviatorMultiplier}x! Won ₦${win.toLocaleString()}!`);
    }
    triggerSound?.('coin');
  };

  // Invest state
  const [investCategoryFilter, setInvestCategoryFilter] = useState<string>('All');
  const [investSearchQuery, setInvestSearchQuery] = useState<string>('');

  // Drag and Pull to Scroll state for the real phone feel
  const phoneScrollRef = useRef<HTMLDivElement>(null);
  const [isPhoneDragging, setIsPhoneDragging] = useState<boolean>(false);
  const phoneDragStartY = useRef<number>(0);
  const phoneScrollTopStart = useRef<number>(0);

  const handlePhonePointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('input, textarea, button, select')) return;
    setIsPhoneDragging(true);
    phoneDragStartY.current = e.clientY;
    if (phoneScrollRef.current) {
      phoneScrollTopStart.current = phoneScrollRef.current.scrollTop;
    }
  };

  const handlePhonePointerMove = (e: React.PointerEvent) => {
    if (!isPhoneDragging || !phoneScrollRef.current) return;
    const dy = e.clientY - phoneDragStartY.current;
    phoneScrollRef.current.scrollTop = phoneScrollTopStart.current - dy;
  };

  const handlePhonePointerUp = () => {
    setIsPhoneDragging(false);
  };

  // =========================================================================
  // MESSENGER / CHAT: REAL "MY AI" + USERNAME SEARCH
  // =========================================================================
  const [activeChatTab, setActiveChatTab] = useState<'my_ai' | 'dm'>('my_ai');
  const [activeDmUser, setActiveDmUser] = useState<string>('');
  const [usernameSearchQuery, setUsernameSearchQuery] = useState<string>('');
  const [chatInput, setChatInput] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  const [aiChatHistory, setAiChatHistory] = useState<{ sender: 'me' | 'ai'; text: string; time: string }[]>([
    {
      sender: 'ai',
      text: "How far my guy! I am My AI, your personal intelligent assistant in Naija Life. You can ask me any question—casual greetings, business tips, life advice, or questions about Nigeria. What's on your mind today?",
      time: 'Just now',
    },
  ]);

  const [dmThreads, setDmThreads] = useState<Record<string, { sender: 'me' | 'them'; text: string; time: string }[]>>({});

  const handleSendAiMessage = async () => {
    if (!chatInput.trim() || isAiLoading) return;
    const userMsg = chatInput.trim();
    setChatInput('');
    const newHistory = [...aiChatHistory, { sender: 'me' as const, text: userMsg, time: liveRealTime || 'Just now' }];
    setAiChatHistory(newHistory);
    setIsAiLoading(true);

    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg }),
      });

      if (response.ok) {
        const data = await response.json();
        setAiChatHistory((prev) => [
          ...prev,
          { sender: 'ai' as const, text: data.reply || 'No wahala! How else can I help you?', time: liveRealTime || 'Just now' },
        ]);
      } else {
        throw new Error('API request failed');
      }
    } catch {
      // Friendly fallback
      setAiChatHistory((prev) => [
        ...prev,
        {
          sender: 'ai' as const,
          text: `How far! That's a great question about "${userMsg}". In Naija Life, keep making smart investments, attend to your daily hustle, and level up your skills in the Academy app!`,
          time: liveRealTime || 'Just now',
        },
      ]);
    } finally {
      setIsAiLoading(false);
      onUpdateStats({ happiness: 4 });
      triggerSound?.('coin');
    }
  };

  const handleSendDmMessage = () => {
    if (!chatInput.trim() || !activeDmUser) return;
    const text = chatInput.trim();
    setChatInput('');
    const current = dmThreads[activeDmUser] || [];
    const updated = {
      ...dmThreads,
      [activeDmUser]: [
        ...current,
        { sender: 'me' as const, text, time: liveRealTime || 'Just now' },
      ],
    };
    setDmThreads(updated);
    onShowToast(`💬 Sent message to @${activeDmUser}`);
    onUpdateStats({ happiness: 3 });
    triggerSound?.('coin');

    // Simulate online recipient reply in online game
    setTimeout(() => {
      setDmThreads((prev) => {
        const cur = prev[activeDmUser] || [];
        return {
          ...prev,
          [activeDmUser]: [
            ...cur,
            { sender: 'them' as const, text: `Received loud and clear! How's your hustle going today?`, time: liveRealTime || 'Just now' },
          ],
        };
      });
    }, 2500);
  };

  // =========================================================================
  // PHONE CALL APP: USERNAME SEARCH + WORKING MICROPHONE AUDIO WAVEFORM
  // =========================================================================
  const [callUsernameSearch, setCallUsernameSearch] = useState<string>('');

  const allRegisteredUsers = useMemo(() => {
    try {
      const usersObj = getStoredUsers();
      return Object.values(usersObj)
        .map((u) => u.profile)
        .filter((p) => p && p.username?.toLowerCase() !== userProfile?.username?.toLowerCase());
    } catch {
      return [];
    }
  }, [userProfile?.username]);

  const matchingCallUsers = useMemo(() => {
    if (!callUsernameSearch.trim()) return [];
    const q = callUsernameSearch.trim().toLowerCase().replace(/^@/, '');
    return allRegisteredUsers.filter(
      (u) =>
        u.username?.toLowerCase().includes(q) ||
        u.firstName?.toLowerCase().includes(q) ||
        u.lastName?.toLowerCase().includes(q)
    );
  }, [allRegisteredUsers, callUsernameSearch]);

  const matchingMsgUsers = useMemo(() => {
    if (!usernameSearchQuery.trim()) return [];
    const q = usernameSearchQuery.trim().toLowerCase().replace(/^@/, '');
    return allRegisteredUsers.filter(
      (u) =>
        u.username?.toLowerCase().includes(q) ||
        u.firstName?.toLowerCase().includes(q) ||
        u.lastName?.toLowerCase().includes(q)
    );
  }, [allRegisteredUsers, usernameSearchQuery]);

  const [activeCallUser, setActiveCallUser] = useState<string | null>(null);
  const [callDurationSecs, setCallDurationSecs] = useState<number>(0);
  const [isMicMuted, setIsMicMuted] = useState<boolean>(false);
  const [micAudioVolume, setMicAudioVolume] = useState<number>(0);
  const [micErrorMsg, setMicErrorMsg] = useState<string | null>(null);

  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const startVoiceCall = async (targetUsername: string) => {
    if (!targetUsername.trim()) return;
    setActiveCallUser(targetUsername.trim());
    setCallDurationSecs(0);
    setMicErrorMsg(null);
    setIsMicMuted(false);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);

      const dataArr = new Uint8Array(analyser.frequencyBinCount);
      const pollVolume = () => {
        analyser.getByteFrequencyData(dataArr);
        let sum = 0;
        for (let i = 0; i < dataArr.length; i++) sum += dataArr[i];
        const avg = sum / dataArr.length;
        setMicAudioVolume(Math.min(100, Math.round((avg / 128) * 100)));
        animFrameRef.current = requestAnimationFrame(pollVolume);
      };
      pollVolume();

      onShowToast(`📞 Connected live call with @${targetUsername}! Speak into your mic.`);
      triggerSound?.('success');
    } catch (err: any) {
      console.warn('Microphone permission info:', err);
      setMicErrorMsg('Microphone access requested. Please enable mic permissions so you can speak live!');
      onShowToast(`📞 Call initiated with @${targetUsername}`);
    }
  };

  const endVoiceCall = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setActiveCallUser(null);
    setCallDurationSecs(0);
    setMicAudioVolume(0);
    onShowToast('Call ended.');
  };

  const toggleMicMute = () => {
    if (mediaStreamRef.current) {
      const newMuted = !isMicMuted;
      mediaStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !newMuted;
      });
      setIsMicMuted(newMuted);
    }
  };

  useEffect(() => {
    if (!activeCallUser) return;
    const timer = setInterval(() => {
      setCallDurationSecs((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [activeCallUser]);

  // Clean up mic on unmount or close
  useEffect(() => {
    if (!isOpen && activeCallUser) {
      endVoiceCall();
    }
  }, [isOpen]);

  // Handle register business
  const handleRegisterBusiness = () => {
    const catalogItem = EXPANDED_BUSINESSES.find((b) => b.typeId === selectedBizType);
    if (!catalogItem) return;

    if (moneyNGN < catalogItem.costNGN) {
      onShowToast(`Insufficient funds! Need ${formatNaira(catalogItem.costNGN)} to incorporate ${catalogItem.name}`);
      triggerSound?.('alert');
      return;
    }

    const bizName = newBizName.trim() || `${userProfile?.firstName || 'Citizen'}'s ${catalogItem.name}`;
    const newVenture: BusinessVenture = {
      id: `biz_${Date.now()}`,
      name: bizName,
      typeId: catalogItem.typeId,
      typeName: catalogItem.name,
      registeredDate: new Date().toLocaleDateString(),
      level: 1,
      dailyRevenueNGN: catalogItem.dailyProfitNGN,
      lastCollectedDate: new Date().toLocaleDateString(),
    };

    onUpdateMoney(-catalogItem.costNGN);
    const updated = [...userBusinesses, newVenture];
    setUserBusinesses(updated);
    if (userProfile) {
      userProfile.ownedBusinesses = updated;
    }
    setNewBizName('');

    onShowToast(`🎉 Successfully incorporated ${bizName} with Corporate Affairs Commission (CAC)!`);
    onLogAction('finance', `Incorporated business: ${bizName} (-${formatNaira(catalogItem.costNGN)})`);
    triggerSound?.('success');
  };

  const totalBizCapital = useMemo(() => {
    return userBusinesses.reduce((sum, b) => {
      const match = EXPANDED_BUSINESSES.find((item) => item.typeId === b.typeId);
      return sum + (match?.costNGN || 5000000) * (b.level || 1);
    }, 0);
  }, [userBusinesses]);

  // Dynamic continuous yield stream for Empire Biz - ONLY runs if player actually owns businesses!
  useEffect(() => {
    if (!userBusinesses || userBusinesses.length === 0) {
      setBizStackedProfit(0);
      try { localStorage.removeItem('naija_life_biz_accrued_profit'); } catch {}
      return;
    }
    const totalDaily = userBusinesses.reduce((sum, b) => sum + (b.dailyRevenueNGN || 0) * (b.level || 1), 0);
    if (totalDaily <= 0) {
      setBizStackedProfit(0);
      try { localStorage.removeItem('naija_life_biz_accrued_profit'); } catch {}
      return;
    }
    const interval = setInterval(() => {
      const gain = Math.round(totalDaily / 120);
      if (gain > 0) {
        setBizStackedProfit((prev) => {
          const next = prev + gain;
          try { localStorage.setItem('naija_life_biz_accrued_profit', String(next)); } catch {}
          return next;
        });
      }
    }, 2500);
    return () => clearInterval(interval);
  }, [userBusinesses]);

  // Handle cash out business profits directly into account
  const handleCashOutEmpireBiz = () => {
    if (bizStackedProfit <= 0) {
      onShowToast('No accrued profits to cash out yet! Profits accrue continuously from your ventures.');
      triggerSound?.('alert');
      return;
    }
    const amount = bizStackedProfit;
    onUpdateMoney(amount);
    setBizStackedProfit(0);
    try { localStorage.setItem('naija_life_biz_accrued_profit', '0'); } catch {}
    onShowToast(`🎉 Cashed out ${formatNaira(amount)} from Empire Biz directly into your account!`);
    onLogAction('finance', `Cashed out Empire Biz profits: +${formatNaira(amount)}`);
    triggerSound?.('coin');
  };

  // Filtered lists
  const filteredBusinesses = useMemo(() => {
    if (bizStateFilter === 'all') return EXPANDED_BUSINESSES;
    return EXPANDED_BUSINESSES.filter((b) => b.stateId === bizStateFilter || b.stateId === 'all');
  }, [bizStateFilter]);

  const filteredJobs = useMemo(() => {
    if (jobStateFilter === 'all') return EXPANDED_JOBS;
    return EXPANDED_JOBS.filter((j) => j.stateId === jobStateFilter || j.stateId === 'all');
  }, [jobStateFilter]);

  const filteredHouses = useMemo(() => {
    if (houseStateFilter === 'all') return EXPANDED_HOUSES;
    return EXPANDED_HOUSES.filter((h) => h.stateId === houseStateFilter || h.stateId === 'all');
  }, [houseStateFilter]);

  const filteredFoods = useMemo(() => {
    if (foodCategoryFilter === 'All') return EXPANDED_CHOWDECK;
    return EXPANDED_CHOWDECK.filter((f) => f.category === foodCategoryFilter);
  }, [foodCategoryFilter]);

  const filteredGroceries = useMemo(() => {
    return GROCERIES_100_CATALOG.filter((g) => {
      const matchCat = groceryCategoryFilter === 'All' || g.category === groceryCategoryFilter;
      const matchSearch =
        !grocerySearchQuery.trim() ||
        g.name.toLowerCase().includes(grocerySearchQuery.toLowerCase()) ||
        g.desc.toLowerCase().includes(grocerySearchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [groceryCategoryFilter, grocerySearchQuery]);

  const filteredCourses = useMemo(() => {
    return EXPANDED_COURSES.filter((c) => {
      const matchCat = courseCategoryFilter === 'All' || c.category === courseCategoryFilter;
      const q = academySearchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        c.title.toLowerCase().includes(q) ||
        c.desc.toLowerCase().includes(q) ||
        c.institution.toLowerCase().includes(q) ||
        (c.certificateName && c.certificateName.toLowerCase().includes(q));
      return matchCat && matchSearch;
    });
  }, [courseCategoryFilter, academySearchQuery]);

  const filteredBoutique = useMemo(() => {
    if (boutiqueCategoryFilter === 'All') return EXPANDED_BOUTIQUE;
    return EXPANDED_BOUTIQUE.filter((b) => b.category === boutiqueCategoryFilter);
  }, [boutiqueCategoryFilter]);

  const filteredPhones = useMemo(() => {
    return EXPANDED_PHONES.filter((p) => {
      const matchBrand = phoneBrandFilter === 'All' || p.brand === phoneBrandFilter;
      const matchSearch =
        !phoneSearchQuery.trim() ||
        p.name.toLowerCase().includes(phoneSearchQuery.toLowerCase()) ||
        p.specs.toLowerCase().includes(phoneSearchQuery.toLowerCase()) ||
        p.desc.toLowerCase().includes(phoneSearchQuery.toLowerCase());
      return matchBrand && matchSearch;
    });
  }, [phoneBrandFilter, phoneSearchQuery]);

  const filteredInvestments = useMemo(() => {
    return AVAILABLE_INVESTMENTS.filter((inv) => {
      const matchesCat = investCategoryFilter === 'All' || inv.category === investCategoryFilter;
      const matchesSearch =
        !investSearchQuery.trim() ||
        inv.title.toLowerCase().includes(investSearchQuery.toLowerCase()) ||
        inv.desc.toLowerCase().includes(investSearchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [investCategoryFilter, investSearchQuery]);

  // Earned Certificates list
  const earnedCertificatesList = useMemo(() => {
    return EXPANDED_COURSES.filter((c) => completedCoursesState.includes(c.id));
  }, [completedCoursesState]);

  // Luxury Catalog filter
  const filteredLuxury = useMemo(() => {
    return LUXURY_CATALOG.filter((item) => {
      const matchCat = luxuryCategoryFilter === 'all' || item.category === luxuryCategoryFilter;
      const q = luxurySearchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.manufacturer.toLowerCase().includes(q) ||
        item.desc.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [luxuryCategoryFilter, luxurySearchQuery]);

  // Kennels & Pets filter
  const filteredPets = useMemo(() => {
    return PET_CATALOG.filter((p) => {
      if (petCategoryFilter === 'All') return true;
      return p.species.toLowerCase() === petCategoryFilter.toLowerCase();
    });
  }, [petCategoryFilter]);

  // Launch an interactive 15-question shift with 10-15 min countdown timer
  const handleLaunchShift = (j: any, isCanada: boolean) => {
    // 1. Certificate check
    const certReq = getJobCertificateRequirement(j.id, j.title, j.sector || 'commerce');
    const hasCert = !certReq || completedCoursesState.includes(certReq.courseId) || (userProfile?.completedCourses || []).includes(certReq.courseId);
    if (!hasCert && certReq) {
      onShowToast(`📜 Degree Required: You must study ${certReq.courseName} in the Academy first!`);
      setAcademySearchQuery(certReq.courseName.split(' ')[0]);
      if (certReq.region === 'canada') setCourseRegion('canada');
      else setCourseRegion('nigeria');
      setCurrentApp('courses');
      triggerSound?.('alert');
      return;
    }

    // 2. Energy check
    if (energy < j.minEnergy) {
      onShowToast(`Too exhausted to work this shift! Eat or rest first (Energy ${energy}% / required ${j.minEnergy}%).`);
      triggerSound?.('alert');
      return;
    }

    // 3. Canada physical location check
    if (isCanada && currentStateId !== 'canada') {
      onShowToast('✈️ Location Alert: You must fly to Canada to work this on-site Canadian job! Board a flight in Airport App.');
      triggerSound?.('alert');
      return;
    }

    // 4. Canada work permit check
    if (isCanada) {
      const hasValidWorkPermit = (userProfile?.ownedDocuments || []).some((d) => {
        const isPermit = ['work_permit', 'pr_card', 'citizenship'].includes(d.type);
        const isCan = d.country === 'Canada';
        const isExp = d.isExpired || (d.expiresAtTimestamp ? Date.now() > d.expiresAtTimestamp : false);
        return isPermit && isCan && !isExp;
      });
      if (!hasValidWorkPermit) {
        onShowToast('⛔ IRCC Alert: A valid 7-Day Canadian Work Permit is required for this role!');
        triggerSound?.('alert');
        return;
      }
    }

    // 5. Initialize interactive 15-question shift with 12-minute countdown timer (720 seconds)
    const questions = getWorkShiftQuestions(j.title, j.sector || 'corporate');
    setCurrentJob(j);
    setActiveWorkShift({
      job: j,
      isCanada,
      questions,
      currentIndex: 0,
      correctCount: 0,
      timerSeconds: 720,
      maxTimerSeconds: 720,
      isComplete: false,
      answers: [],
      selectedOption: null,
    });
    triggerSound?.('coin');
  };

  // Finalize shift and compute salary + bonuses
  const handleFinalizeShift = () => {
    if (!activeWorkShift) return;
    const { job, isCanada, correctCount } = activeWorkShift;

    const rank = userProfile?.jobRank || 'Apprentice';
    const multipliers: Record<string, number> = {
      'Apprentice': 1.0,
      'Junior': 1.0,
      'Associate': 1.8,
      'Senior': 3.5,
      'Manager': 6.0,
    };
    const mult = multipliers[rank] || 1.0;

    let earnedAmount = 0;

    if (isCanada) {
      const baseWeeklyCAD = job.salaryCADWeekly || 1200;
      const baseShiftCAD = Math.round((baseWeeklyCAD * mult) / 7);
      const performanceBonusCAD = Math.round(baseShiftCAD * (correctCount / 15) * 0.4);
      earnedAmount = baseShiftCAD + performanceBonusCAD;

      if (userProfile) {
        userProfile.bankCAD = (userProfile.bankCAD || 0) + earnedAmount;
        if (!Array.isArray(userProfile.receipts)) userProfile.receipts = [];
        userProfile.receipts.unshift({
          id: `SHIFT_CAN_${Date.now()}`,
          title: `Shift Payroll: ${job.title} (${correctCount}/15 Performance)`,
          category: 'career',
          amount: earnedAmount,
          date: new Date().toLocaleDateString('en-CA'),
          type: 'credit',
          currency: 'CAD',
        });
      }
    } else {
      const baseWeeklyNGN = job.salaryNGN || 28000;
      const baseShiftNGN = Math.round((baseWeeklyNGN * mult) / 7);
      const performanceBonusNGN = Math.round(baseShiftNGN * (correctCount / 15) * 0.35);
      earnedAmount = baseShiftNGN + performanceBonusNGN;

      onUpdateMoney(earnedAmount);
      if (userProfile) {
        userProfile.jobWeeklySalaryNGN = Math.round(baseWeeklyNGN * mult);
      }
    }

    const newShifts = (userProfile?.jobShiftsWorked || 0) + 1;
    let newRank = userProfile?.jobRank || 'Apprentice';
    let gotPromoted = false;

    if (newShifts >= 30 && newRank !== 'Manager') {
      newRank = 'Manager';
      gotPromoted = true;
    } else if (newShifts >= 15 && (newRank === 'Apprentice' || newRank === 'Associate')) {
      newRank = 'Senior';
      gotPromoted = true;
    } else if (newShifts >= 5 && newRank === 'Apprentice') {
      newRank = 'Associate';
      gotPromoted = true;
    }

    if (userProfile) {
      userProfile.jobShiftsWorked = newShifts;
      userProfile.jobRank = newRank;
    }

    onUpdateStats({
      energy: -job.minEnergy,
      hunger: -15,
      happiness: correctCount >= 10 ? 10 : 4,
    });

    if (gotPromoted) {
      onShowToast(`🏆 PROMOTION! You were promoted to ${newRank.toUpperCase()}! Salary multiplied!`);
      triggerSound?.('success');
    } else {
      const payLabel = isCanada ? `$${earnedAmount} CAD` : formatNaira(earnedAmount);
      onShowToast(`💼 Shift Completed! Earned ${payLabel} (${correctCount}/15 correct decisions)!`);
      triggerSound?.('coin');
    }

    setActiveWorkShift(null);
  };

  return (
    <div
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onPointerMove={(e) => e.stopPropagation()}
      className={`fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md select-none transition-all duration-300 ease-out ${
        isOpen ? 'opacity-100 pointer-events-auto scale-100' : 'opacity-0 pointer-events-none scale-95'
      }`}
    >
      {/* PHONE CASING (AUTHENTIC CHASSIS PER PHONE MODEL - NO SAME MODEL) */}
      <div
        className={`relative w-full max-w-[392px] h-[788px] max-h-[94vh] p-3 shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
          isIphone18PM
            ? 'rounded-[58px] border-[5px] border-[#d4af37] bg-[#161208] shadow-[0_30px_70px_rgba(0,0,0,0.98),0_0_35px_rgba(212,175,55,0.45)] ring-2 ring-yellow-400/60'
            : isIphone17PM
            ? 'rounded-[52px] border-[6px] border-[#4b4845] bg-[#1e1d1b] shadow-[0_25px_60px_rgba(0,0,0,0.95),0_0_20px_rgba(168,162,158,0.2)] ring-1 ring-zinc-500/40'
            : isIphoneX
            ? 'rounded-[46px] border-[6px] border-[#94a3b8] bg-[#0f172a] shadow-[0_20px_50px_rgba(0,0,0,0.95)] ring-2 ring-slate-400/50'
            : isIphone
            ? 'rounded-[50px] border-[6px] border-[#38332c] bg-[#1c1815] shadow-[0_25px_60px_rgba(0,0,0,0.95),0_0_30px_rgba(217,119,6,0.2)] ring-2 ring-amber-500/30'
            : isSamsung
            ? 'rounded-[22px] border-[5px] border-[#18222c] bg-[#0b1016] shadow-[0_25px_60px_rgba(0,0,0,0.95),0_0_30px_rgba(6,182,212,0.2)] ring-2 ring-cyan-500/40'
            : isPixel
            ? 'rounded-[48px] border-[5px] border-[#1c241e] bg-[#0d140f] shadow-[0_25px_60px_rgba(0,0,0,0.95)] ring-2 ring-emerald-500/30'
            : isXiaomi
            ? 'rounded-[44px] border-[5px] border-[#2a1e16] bg-[#140e0a] shadow-[0_25px_60px_rgba(0,0,0,0.95)] ring-2 ring-orange-500/30'
            : 'rounded-[42px] border-[5px] border-zinc-800 bg-zinc-950 shadow-black ring-2 ring-violet-500/30'
        }`}
      >
        {/* SAMSUNG ONEUI EDGE PANEL HANDLE */}
        {isSamsung && (
          <div className="absolute right-0 top-1/3 w-1.5 h-16 bg-cyan-400/80 rounded-l shadow-[0_0_8px_rgba(6,182,212,0.6)] z-40 pointer-events-none" />
        )}

        {/* PHONE INNER DISPLAY */}
        <div
          className={`relative w-full h-full flex flex-col overflow-hidden transition-colors duration-500 ${
            isIphone18PM
              ? 'rounded-[46px]'
              : isIphone17PM
              ? 'rounded-[38px]'
              : isIphoneX
              ? 'rounded-[32px]'
              : isSamsung
              ? 'rounded-[16px]'
              : isPixel
              ? 'rounded-[36px]'
              : 'rounded-[34px]'
          } ${activeWallpaperObj.bgClass}`}
        >
          {/* =========================================================================
              PHONE STATUS BAR
              ========================================================================= */}
          <div className="relative px-6 pt-3 pb-2 flex items-center justify-between text-white text-xs font-mono font-bold shrink-0 z-30 select-none">
            {/* Left: Clock */}
            <div className="flex items-center gap-1.5">
              <span>{liveRealTime || '12:00'}</span>
            </div>

            {/* CAMERA NOTCH / SENSOR / ISLAND - UNIQUELY MODELED PER DEVICE */}
            {isIphone18PM ? (
              /* iPhone 18 Pro Max: Micro Sub-Display Pill with Pulsing Gold Sensor */
              <div className="absolute left-1/2 -translate-x-1/2 top-2 h-4 w-14 bg-black/95 rounded-full flex items-center justify-center gap-1.5 shadow-lg border border-amber-500/50">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                <div className="w-2 h-2 rounded-full bg-zinc-900 border border-zinc-700" />
              </div>
            ) : isIphone17PM ? (
              /* iPhone 17 Pro Max: Authentic Dynamic Island Pill */
              <div className="absolute left-1/2 -translate-x-1/2 top-2 h-6 w-28 bg-black rounded-full flex items-center justify-between px-2.5 shadow-md border border-zinc-900">
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-900 border border-zinc-700" />
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_#10b981]" />
              </div>
            ) : isIphoneX ? (
              /* iPhone X: Iconic Classic Wide FaceID Notch Cutout */
              <div className="absolute left-1/2 -translate-x-1/2 top-0 h-6 w-36 bg-black rounded-b-2xl border-x border-b border-zinc-800 flex items-center justify-center gap-3 px-3 shadow-md">
                <div className="w-8 h-1 bg-zinc-800 rounded-full" />
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-900 border border-zinc-700 ring-1 ring-zinc-800" />
              </div>
            ) : isIphone ? (
              <div className="absolute left-1/2 -translate-x-1/2 top-2 h-6 w-28 bg-black rounded-full flex items-center justify-between px-2.5 shadow-md border border-zinc-900">
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-900 border border-zinc-700" />
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_#10b981]" />
              </div>
            ) : isSamsung ? (
              /* Samsung Galaxy S24: Centered Infinity-O Laser Punch Hole */
              <div className="absolute left-1/2 -translate-x-1/2 top-2.5 w-3.5 h-3.5 bg-black rounded-full flex items-center justify-center shadow-inner border border-zinc-850 ring-1 ring-cyan-400/40">
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
              </div>
            ) : isPixel ? (
              /* Google Pixel: Minimal Punch Hole with Tensor Ambient Ring */
              <div className="absolute left-1/2 -translate-x-1/2 top-2.5 w-3.5 h-3.5 bg-black rounded-full flex items-center justify-center shadow-inner border border-zinc-850 ring-1 ring-emerald-500/40">
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
              </div>
            ) : isXiaomi ? (
              <div className="absolute left-1/2 -translate-x-1/2 top-2.5 w-3.5 h-3.5 bg-black rounded-full flex items-center justify-center shadow-inner border border-zinc-850 ring-1 ring-orange-500/40">
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
              </div>
            ) : (
              <div className="absolute left-1/2 -translate-x-1/2 top-2.5 w-3.5 h-3.5 bg-black rounded-full flex items-center justify-center shadow-inner border border-zinc-900 ring-1 ring-zinc-700/80">
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
              </div>
            )}

            {/* Right: Cellular, WiFi, Battery */}
            <div className="flex items-center gap-2">
              <Signal className="w-3.5 h-3.5 text-zinc-300" />
              <Wifi className="w-3.5 h-3.5 text-zinc-300" />
              <div className="flex items-center gap-1">
                <span className="text-[10px]">{batteryLevel}%</span>
                <Battery className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
          </div>

          {/* =========================================================================
              PHONE TOP APP BAR
              ========================================================================= */}
          <div className="px-4 py-2 border-b border-white/10 flex items-center justify-between shrink-0 z-20 backdrop-blur-md bg-black/40">
            {currentApp !== 'home' ? (
              <button
                type="button"
                onClick={() => setCurrentApp('home')}
                className="flex items-center gap-1 text-xs font-black text-amber-300 hover:text-white transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Home</span>
              </button>
            ) : (
              <div className="flex items-center gap-1 text-xs font-black text-zinc-300">
                <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                <span className="truncate max-w-[170px]">
                  {EXPANDED_PHONES.find((p) => p.model === userProfile?.phoneModel)?.name || 'Naija Phone'}
                </span>
              </div>
            )}

            <span className="text-xs font-black tracking-wider uppercase text-white/90">
              {currentApp === 'snapchat'
                ? 'SNAPCHAT (16 SNAPS & STREAKS)'
                : currentApp === 'government'
                ? 'FEDERAL & STATE DEMOCRACY'
                : currentApp === 'flight'
                ? 'NIGERIAN AIRWAYS & FLIGHTS'
                : currentApp === 'business'
                ? 'EMPIRE BIZ'
                : currentApp === 'certificates'
                ? 'CERTIFICATES'
                : currentApp === 'documents'
                ? 'OFFICIAL DOCUMENTS'
                : currentApp === 'immigration'
                ? 'IMMIGRATION'
                : currentApp === 'suggestions'
                ? 'SUGGESTIONS & COMPLAINTS'
                : currentApp === 'luxury'
                ? 'LUXURY CLUB'
                : currentApp === 'pets'
                ? 'KENNELS & PETS'
                : currentApp.toUpperCase()}
            </span>

            <button
              type="button"
              onClick={onClose}
              className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 text-zinc-300 flex items-center justify-center cursor-pointer transition-colors"
              title="Close Phone"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* =========================================================================
              DRAGGABLE PHONE CONTENT CONTAINER (PULL & DRAG TO SCROLL, NO SCROLLBAR)
              ========================================================================= */}
          <div
            ref={phoneScrollRef}
            onPointerDown={handlePhonePointerDown}
            onPointerMove={handlePhonePointerMove}
            onPointerUp={handlePhonePointerUp}
            className={`flex-1 overflow-y-auto select-none p-4 pb-14 scrollbar-none [&::-webkit-scrollbar]:hidden ${
              isPhoneDragging ? 'cursor-grabbing' : 'cursor-grab'
            }`}
          >
            {/* =============================================================
                1. HOME SCREEN (APPS GRID - DYNAMIC PER PHONE BRAND/MODEL)
                ============================================================= */}
            {currentApp === 'home' && (() => {
              const appIconShape = isIphone
                ? 'w-13 h-13 rounded-[22px] shadow-[0_6px_16px_rgba(0,0,0,0.5)] border border-white/25 relative overflow-hidden ring-1 ring-white/10'
                : isSamsung
                ? 'w-13 h-13 rounded-[15px] shadow-[0_6px_16px_rgba(0,0,0,0.6)] border border-cyan-400/30 relative overflow-hidden ring-1 ring-cyan-500/20'
                : isPixel
                ? 'w-13 h-13 rounded-full shadow-[0_5px_14px_rgba(0,0,0,0.45)] border border-white/20 relative overflow-hidden ring-1 ring-emerald-500/20'
                : isXiaomi
                ? 'w-13 h-13 rounded-[18px] shadow-[0_6px_16px_rgba(0,0,0,0.5)] border border-orange-400/30 relative overflow-hidden ring-1 ring-orange-500/20'
                : 'w-13 h-13 rounded-[18px] shadow-[0_5px_14px_rgba(0,0,0,0.45)] border border-white/20 relative overflow-hidden';

              return (
                <div className="space-y-6">
                  {/* Real-world Date & Status Widget */}
                  <div className={`p-4 border backdrop-blur-md text-center shadow-xl ${
                    isSamsung ? 'rounded-2xl bg-cyan-950/40 border-cyan-500/30' : isIphone ? 'rounded-3xl bg-black/40 border-white/15' : 'rounded-2xl bg-black/35 border-white/10'
                  }`}>
                    <div className="text-3xl font-black text-white font-mono tracking-tight">{liveRealTime}</div>
                    <div className="text-xs text-amber-300 font-bold mt-0.5">{liveRealDate}</div>
                    <div className="text-[10px] text-zinc-300 mt-1 font-mono flex items-center justify-center gap-1">
                      <span>Citizen:</span>
                      <span className="font-bold text-white">{userProfile?.firstName} {userProfile?.lastName}</span>
                      <span className="text-emerald-400 font-bold">(@{userProfile?.username})</span>
                    </div>
                  </div>

                  {/* Grid of Apps with Model-Specific Design */}
                  <div className="grid grid-cols-4 gap-y-5 gap-x-2 text-center">
                    {/* APP: SNAPCHAT (16 UNREAD SNAPS & STREAKS - MATCHING SCREENSHOT) */}
                    <div onClick={() => setCurrentApp('snapchat')} className="flex flex-col items-center gap-1 cursor-pointer group">
                      <div className={`${appIconShape} bg-[#fffc00] flex items-center justify-center group-hover:scale-108 transition-transform border border-amber-300 relative shadow-[0_6px_20px_rgba(255,252,0,0.3)]`}>
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/30 via-transparent to-transparent pointer-events-none" />
                        <span className="text-2xl drop-shadow">👻</span>
                        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white font-mono text-[9px] font-black flex items-center justify-center ring-1 ring-black animate-pulse">
                          16
                        </span>
                      </div>
                      <span className="text-[10px] font-black text-amber-300 group-hover:text-yellow-200 transition-colors">Snapchat</span>
                    </div>

                    {/* APP 1: BUSINESS */}
                    <div onClick={() => setCurrentApp('business')} className="flex flex-col items-center gap-1 cursor-pointer group">
                      <div className={`${appIconShape} bg-gradient-to-br from-amber-500 via-amber-600 to-amber-900 flex items-center justify-center group-hover:scale-108 transition-transform`}>
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent pointer-events-none" />
                        <Building className="w-6 h-6 text-zinc-950 drop-shadow" />
                      </div>
                      <span className="text-[10px] font-bold text-zinc-200 group-hover:text-amber-300 transition-colors">Empire Biz</span>
                    </div>

                    {/* APP 2: BANKING */}
                    <div onClick={() => setCurrentApp('banking')} className="flex flex-col items-center gap-1 cursor-pointer group">
                      <div className={`${appIconShape} bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-900 flex items-center justify-center group-hover:scale-108 transition-transform`}>
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent pointer-events-none" />
                        <CreditCard className="w-6 h-6 text-white drop-shadow" />
                      </div>
                      <span className="text-[10px] font-bold text-zinc-200 group-hover:text-emerald-300 transition-colors">Naija Pay</span>
                    </div>

                    {/* APP 3: JOBS */}
                    <div onClick={() => setCurrentApp('jobs')} className="flex flex-col items-center gap-1 cursor-pointer group">
                      <div className={`${appIconShape} bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-900 flex items-center justify-center group-hover:scale-108 transition-transform`}>
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent pointer-events-none" />
                        <Briefcase className="w-6 h-6 text-white drop-shadow" />
                      </div>
                      <span className="text-[10px] font-bold text-zinc-200 group-hover:text-blue-300 transition-colors">Jobs</span>
                    </div>

                    {/* APP 4: HOUSES */}
                    <div onClick={() => setCurrentApp('houses')} className="flex flex-col items-center gap-1 cursor-pointer group">
                      <div className={`${appIconShape} bg-gradient-to-br from-emerald-600 via-green-700 to-green-950 flex items-center justify-center group-hover:scale-108 transition-transform`}>
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent pointer-events-none" />
                        <Home className="w-6 h-6 text-white drop-shadow" />
                      </div>
                      <span className="text-[10px] font-bold text-zinc-200 group-hover:text-emerald-300 transition-colors">Houses</span>
                    </div>

                    {/* APP 5: CARS */}
                    <div onClick={() => setCurrentApp('cars')} className="flex flex-col items-center gap-1 cursor-pointer group">
                      <div className={`${appIconShape} bg-gradient-to-br from-red-600 via-rose-700 to-red-950 flex items-center justify-center group-hover:scale-108 transition-transform`}>
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent pointer-events-none" />
                        <Car className="w-6 h-6 text-white drop-shadow" />
                      </div>
                      <span className="text-[10px] font-bold text-zinc-200 group-hover:text-rose-300 transition-colors">Auto Mart</span>
                    </div>

                    {/* APP 6: LUXURY (JETS, HELICOPTERS, YACHTS) */}
                    <div onClick={() => setCurrentApp('luxury')} className="flex flex-col items-center gap-1 cursor-pointer group">
                      <div className={`${appIconShape} bg-gradient-to-br from-amber-500 via-yellow-600 to-amber-900 flex items-center justify-center group-hover:scale-108 transition-transform border border-amber-400/40`}>
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent pointer-events-none" />
                        <Crown className="w-6 h-6 text-amber-200 drop-shadow" />
                      </div>
                      <span className="text-[10px] font-bold text-amber-300 group-hover:scale-105 transition-transform">Luxury Club</span>
                    </div>

                    {/* APP 7: PETS & SECURITY KENNELS */}
                    <div onClick={() => setCurrentApp('pets')} className="flex flex-col items-center gap-1 cursor-pointer group">
                      <div className={`${appIconShape} bg-gradient-to-br from-orange-600 via-amber-700 to-amber-950 flex items-center justify-center group-hover:scale-108 transition-transform border border-orange-500/30`}>
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent pointer-events-none" />
                        <Dog className="w-6 h-6 text-orange-200 drop-shadow" />
                      </div>
                      <span className="text-[10px] font-bold text-orange-300 group-hover:scale-105 transition-transform">Pets</span>
                    </div>

                    {/* APP 8: MESSAGES */}
                    <div onClick={() => setCurrentApp('messenger')} className="flex flex-col items-center gap-1 cursor-pointer group">
                      <div className={`${appIconShape} bg-gradient-to-br from-green-500 via-emerald-600 to-teal-800 flex items-center justify-center group-hover:scale-108 transition-transform`}>
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent pointer-events-none" />
                        <MessageSquare className="w-6 h-6 text-white drop-shadow" />
                      </div>
                      <span className="text-[10px] font-bold text-zinc-200 group-hover:text-emerald-300 transition-colors">Messages</span>
                    </div>

                    {/* APP 9: INVEST */}
                    <div onClick={() => setCurrentApp('invest')} className="flex flex-col items-center gap-1 cursor-pointer group">
                      <div className={`${appIconShape} bg-gradient-to-br from-cyan-600 via-sky-700 to-blue-900 flex items-center justify-center group-hover:scale-108 transition-transform`}>
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent pointer-events-none" />
                        <TrendingUp className="w-6 h-6 text-white drop-shadow" />
                      </div>
                      <span className="text-[10px] font-bold text-zinc-200 group-hover:text-cyan-300 transition-colors">Invest</span>
                    </div>

                    {/* APP 10: NAIJA BET */}
                    <div onClick={() => setCurrentApp('naijabet')} className="flex flex-col items-center gap-1 cursor-pointer group">
                      <div className={`${appIconShape} bg-gradient-to-br from-lime-500 via-green-600 to-emerald-900 flex items-center justify-center group-hover:scale-108 transition-transform`}>
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent pointer-events-none" />
                        <Trophy className="w-6 h-6 text-zinc-950 drop-shadow" />
                      </div>
                      <span className="text-[10px] font-bold text-zinc-200 group-hover:text-lime-300 transition-colors">NaijaBet</span>
                    </div>

                    {/* APP 11: CHOWDECK (100+ FOOD OPTIONS) */}
                    <div onClick={() => setCurrentApp('eatery')} className="flex flex-col items-center gap-1 cursor-pointer group">
                      <div className={`${appIconShape} bg-gradient-to-br from-orange-500 via-amber-600 to-red-800 flex items-center justify-center group-hover:scale-108 transition-transform`}>
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent pointer-events-none" />
                        <UtensilsCrossed className="w-6 h-6 text-white drop-shadow" />
                      </div>
                      <span className="text-[10px] font-bold text-zinc-200 group-hover:text-orange-300 transition-colors">Chowdeck</span>
                    </div>

                    {/* APP 12: GROCERIES (100 REAL LIFE MARKET GROCERIES) */}
                    <div onClick={() => setCurrentApp('groceries')} className="flex flex-col items-center gap-1 cursor-pointer group">
                      <div className={`${appIconShape} bg-gradient-to-br from-emerald-600 via-teal-700 to-green-950 flex items-center justify-center group-hover:scale-108 transition-transform`}>
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent pointer-events-none" />
                        <ShoppingCart className="w-6 h-6 text-white drop-shadow" />
                      </div>
                      <span className="text-[10px] font-bold text-zinc-200 group-hover:text-teal-300 transition-colors">Groceries</span>
                    </div>

                    {/* APP 13: ACADEMY (86+ COURSES) */}
                    <div onClick={() => setCurrentApp('courses')} className="flex flex-col items-center gap-1 cursor-pointer group">
                      <div className={`${appIconShape} bg-gradient-to-br from-purple-600 via-indigo-700 to-purple-950 flex items-center justify-center group-hover:scale-108 transition-transform`}>
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent pointer-events-none" />
                        <GraduationCap className="w-6 h-6 text-white drop-shadow" />
                      </div>
                      <span className="text-[10px] font-bold text-zinc-200 group-hover:text-purple-300 transition-colors">Academy</span>
                    </div>

                    {/* APP 14: GOVERNMENT (DEMOCRATIC NATIONWIDE VACANCIES) */}
                    <div onClick={() => setCurrentApp('government')} className="flex flex-col items-center gap-1 cursor-pointer group">
                      <div className={`${appIconShape} bg-gradient-to-br from-emerald-600 via-green-700 to-amber-700 flex items-center justify-center group-hover:scale-108 transition-transform border border-amber-400/40`}>
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent pointer-events-none" />
                        <Landmark className="w-6 h-6 text-amber-200 drop-shadow" />
                      </div>
                      <span className="text-[10px] font-bold text-zinc-200 group-hover:text-amber-300 transition-colors">Government</span>
                    </div>

                    {/* APP 15: FLIGHT */}
                    <div onClick={() => setCurrentApp('flight')} className="flex flex-col items-center gap-1 cursor-pointer group">
                      <div className={`${appIconShape} bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-900 flex items-center justify-center group-hover:scale-108 transition-transform border border-sky-400/40`}>
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent pointer-events-none" />
                        <Plane className="w-6 h-6 text-white drop-shadow" />
                      </div>
                      <span className="text-[10px] font-bold text-zinc-200 group-hover:text-sky-300 transition-colors">Flight</span>
                    </div>

                    {/* APP 16: INTERSTATE COACH */}
                    <div onClick={() => setCurrentApp('bus')} className="flex flex-col items-center gap-1 cursor-pointer group">
                      <div className={`${appIconShape} bg-gradient-to-br from-teal-500 via-emerald-600 to-teal-900 flex items-center justify-center group-hover:scale-108 transition-transform`}>
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent pointer-events-none" />
                        <Bus className="w-6 h-6 text-white drop-shadow" />
                      </div>
                      <span className="text-[10px] font-bold text-zinc-200 group-hover:text-teal-300 transition-colors">Interstate</span>
                    </div>

                    {/* APP 17: PHONE CALL (LIVE MIC & SEARCH) */}
                    <div onClick={() => setCurrentApp('call')} className="flex flex-col items-center gap-1 cursor-pointer group">
                      <div className={`${appIconShape} bg-gradient-to-br from-emerald-500 via-green-600 to-emerald-900 flex items-center justify-center group-hover:scale-108 transition-transform`}>
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent pointer-events-none" />
                        <Phone className="w-6 h-6 text-white drop-shadow" />
                      </div>
                      <span className="text-[10px] font-bold text-zinc-200 group-hover:text-emerald-300 transition-colors">Phone Call</span>
                    </div>

                    {/* APP 18: MEDCLINIC */}
                    <div onClick={() => setCurrentApp('health')} className="flex flex-col items-center gap-1 cursor-pointer group">
                      <div className={`${appIconShape} bg-gradient-to-br from-rose-600 via-red-700 to-rose-950 flex items-center justify-center group-hover:scale-108 transition-transform`}>
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent pointer-events-none" />
                        <HeartPulse className="w-6 h-6 text-white drop-shadow" />
                      </div>
                      <span className="text-[10px] font-bold text-zinc-200 group-hover:text-rose-300 transition-colors">MedClinic</span>
                    </div>

                    {/* APP 19: BOUTIQUE (100+ CLOTHES) */}
                    <div onClick={() => setCurrentApp('boutique')} className="flex flex-col items-center gap-1 cursor-pointer group">
                      <div className={`${appIconShape} bg-gradient-to-br from-pink-600 via-purple-700 to-fuchsia-950 flex items-center justify-center group-hover:scale-108 transition-transform`}>
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent pointer-events-none" />
                        <ShoppingBag className="w-6 h-6 text-white drop-shadow" />
                      </div>
                      <span className="text-[10px] font-bold text-zinc-200 group-hover:text-pink-300 transition-colors">Boutique</span>
                    </div>

                    {/* APP 20: DEVICE STORE (36 PHONES) */}
                    <div onClick={() => setCurrentApp('phones')} className="flex flex-col items-center gap-1 cursor-pointer group">
                      <div className={`${appIconShape} bg-gradient-to-br from-indigo-600 via-blue-700 to-indigo-950 flex items-center justify-center group-hover:scale-108 transition-transform`}>
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent pointer-events-none" />
                        <Smartphone className="w-6 h-6 text-white drop-shadow" />
                      </div>
                      <span className="text-[10px] font-bold text-zinc-200 group-hover:text-indigo-300 transition-colors">Device Store</span>
                    </div>

                    {/* APP 21: CERTIFICATES */}
                    <div onClick={() => setCurrentApp('certificates')} className="flex flex-col items-center gap-1 cursor-pointer group">
                      <div className={`${appIconShape} bg-gradient-to-br from-teal-600 via-cyan-700 to-teal-950 flex items-center justify-center group-hover:scale-108 transition-transform`}>
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent pointer-events-none" />
                        <Award className="w-6 h-6 text-white drop-shadow" />
                      </div>
                      <span className="text-[10px] font-bold text-zinc-200 group-hover:text-cyan-300 transition-colors">Certificates</span>
                    </div>

                    {/* APP: DOCUMENTS */}
                    <div onClick={() => setCurrentApp('documents')} className="flex flex-col items-center gap-1 cursor-pointer group">
                      <div className={`${appIconShape} bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-950 flex items-center justify-center group-hover:scale-108 transition-transform border border-emerald-400/50`}>
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent pointer-events-none" />
                        <FileText className="w-6 h-6 text-emerald-200 drop-shadow" />
                      </div>
                      <span className="text-[10px] font-bold text-emerald-300 group-hover:text-emerald-200 transition-colors">Documents</span>
                    </div>

                    {/* APP 22: IMMIGRATION */}
                    <div onClick={() => setCurrentApp('immigration')} className="flex flex-col items-center gap-1 cursor-pointer group">
                      <div className={`${appIconShape} bg-gradient-to-br from-blue-700 via-sky-800 to-slate-900 flex items-center justify-center group-hover:scale-108 transition-transform`}>
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent pointer-events-none" />
                        <Plane className="w-6 h-6 text-white drop-shadow" />
                      </div>
                      <span className="text-[10px] font-bold text-zinc-200 group-hover:text-sky-300 transition-colors">Immigration</span>
                    </div>

                    {/* APP 23: SUGGESTIONS & COMPLAINTS */}
                    <div onClick={() => setCurrentApp('suggestions')} className="flex flex-col items-center gap-1 cursor-pointer group">
                      <div className={`${appIconShape} bg-gradient-to-br from-violet-600 via-purple-700 to-fuchsia-950 flex items-center justify-center group-hover:scale-108 transition-transform`}>
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent pointer-events-none" />
                        <MessageSquarePlus className="w-6 h-6 text-white drop-shadow" />
                      </div>
                      <span className="text-[10px] font-bold text-zinc-200 group-hover:text-purple-300 transition-colors">Suggestions</span>
                    </div>

                    {/* APP 24: SETTINGS */}
                    <div onClick={() => setCurrentApp('settings')} className="flex flex-col items-center gap-1 cursor-pointer group">
                      <div className={`${appIconShape} bg-gradient-to-br from-zinc-700 via-stone-800 to-zinc-950 flex items-center justify-center group-hover:scale-108 transition-transform border border-zinc-600`}>
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent pointer-events-none" />
                        <Settings className="w-6 h-6 text-white drop-shadow" />
                      </div>
                      <span className="text-[10px] font-bold text-zinc-200 group-hover:text-zinc-400 transition-colors">Settings</span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* =============================================================
                GOVERNMENT APP (FEDERAL & STATE DEMOCRACY - REAL PLAYERS ONLY)
                ============================================================= */}
            {currentApp === 'government' && (() => {
              const currentGovState = NIGERIA_36_STATES_ALPHABETICAL.find((s) => s.id === selectedGovStateId) || {
                id: 'lagos',
                name: 'Lagos',
              };

              const federalRoles = [
                {
                  role: 'President of the Federal Republic of Nigeria',
                  branch: 'Executive Branch · Commander-in-Chief',
                  tenure: '4-Year Citizen Term',
                  desc: 'Head of State and Chief Executive of the Federation. Oversees national policies, economy, and armed forces.',
                  icon: '🦅',
                },
                {
                  role: 'Vice President of Nigeria',
                  branch: 'Executive Branch · The Presidency',
                  tenure: '4-Year Citizen Term',
                  desc: 'Chairman of the National Economic Council (NEC). Assists the President in federal administration.',
                  icon: '⚖️',
                },
                {
                  role: 'President of the Senate',
                  branch: 'Legislative Branch · National Assembly',
                  tenure: 'Parliamentary Term',
                  desc: 'Chairman of the National Assembly. Presides over federal legislative bills, confirmations, and budget acts.',
                  icon: '🏛️',
                },
                {
                  role: 'Speaker of the House of Representatives',
                  branch: 'Legislative Branch · National Assembly',
                  tenure: 'Parliamentary Term',
                  desc: 'Presides over the 360-member House representing all 36 states and federal constituencies.',
                  icon: '📜',
                },
                {
                  role: 'Chief Justice of Nigeria (CJN)',
                  branch: 'Judicial Branch · Supreme Court of Nigeria',
                  tenure: 'Constitutional Term',
                  desc: 'Head of the Judiciary and Chairman of the National Judicial Council (NJC).',
                  icon: '⚖️',
                },
              ];

              const stateRoles = [
                {
                  role: `Executive Governor of ${currentGovState.name} State`,
                  branch: `State Executive Council · ${currentGovState.name}`,
                  tenure: '4-Year Citizen Term',
                  desc: `Chief Executive of ${currentGovState.name} State. Oversees state budget, infrastructure, and executive orders.`,
                  icon: '🏛️',
                },
                {
                  role: `Deputy Governor of ${currentGovState.name} State`,
                  branch: `State Executive Council · ${currentGovState.name}`,
                  tenure: '4-Year Citizen Term',
                  desc: `Second-in-command of the State Government. Presides over state boundaries and developmental boards.`,
                  icon: '🤝',
                },
                {
                  role: 'Secretary to the State Government (SSG)',
                  branch: `Cabinet Office · ${currentGovState.name}`,
                  tenure: 'Cabinet Term',
                  desc: 'Coordinates the execution of all State Government policies, cabinet affairs, and ministerial directives.',
                  icon: '📁',
                },
                {
                  role: 'State Commissioner for Finance & Budget',
                  branch: `Ministry of Finance · ${currentGovState.name}`,
                  tenure: 'Cabinet Term',
                  desc: 'Manages state internally generated revenue (IGR), public debt, and state fiscal allocations.',
                  icon: '💰',
                },
                {
                  role: 'State Commissioner for Works & Infrastructure',
                  branch: `Ministry of Works · ${currentGovState.name}`,
                  tenure: 'Cabinet Term',
                  desc: 'Oversees interstate roads, highway contracts, bridges, and municipal public infrastructure projects.',
                  icon: '🏗️',
                },
                {
                  role: 'State Commissioner for Commerce, Industry & Investment',
                  branch: `Ministry of Commerce · ${currentGovState.name}`,
                  tenure: 'Cabinet Term',
                  desc: 'Fosters economic growth, trade zones, market regulations, and foreign direct investment.',
                  icon: '💼',
                },
                {
                  role: 'State Commissioner for Health & Social Welfare',
                  branch: `Ministry of Health · ${currentGovState.name}`,
                  tenure: 'Cabinet Term',
                  desc: 'Oversees state general hospitals, primary healthcare centers, and medical disease prevention.',
                  icon: '🏥',
                },
                {
                  role: `Speaker, ${currentGovState.name} State House of Assembly`,
                  branch: `State Legislature · ${currentGovState.name}`,
                  tenure: 'Legislative Term',
                  desc: `Presides over state legislative enactments, scrutiny of state commissioners, and state appropriation laws.`,
                  icon: '⚖️',
                },
              ];

              const displayedRoles = govLevelTab === 'federal' ? federalRoles : stateRoles;

              return (
                <div className="space-y-4">
                  {/* Region Selector: Nigeria Democracy vs Canada Parliament */}
                  <div className="flex gap-1.5 bg-zinc-950 p-1 rounded-2xl border border-zinc-800 text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => setGovRegion('nigeria')}
                      className={`flex-1 py-1.5 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1 ${
                        govRegion === 'nigeria'
                          ? 'bg-emerald-500 text-black font-black shadow-md'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      <span>🇳🇬 Nigeria Democracy</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setGovRegion('canada')}
                      className={`flex-1 py-1.5 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1 ${
                        govRegion === 'canada'
                          ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white font-black shadow-md'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      <span>🇨🇦 Parliament of Canada</span>
                      <span className="text-[8px] px-1 py-0.2 bg-red-950 text-red-300 rounded border border-red-500/40">Soon</span>
                    </button>
                  </div>

                  {govRegion === 'canada' ? (
                    <div className="space-y-4">
                      <div className="bg-gradient-to-r from-red-950/95 via-rose-950/90 to-zinc-900 border-2 border-red-500/40 rounded-3xl p-4 shadow-xl text-left space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-red-500/20 border border-red-400 flex items-center justify-center text-lg">
                              🍁
                            </div>
                            <div>
                              <h3 className="text-xs font-black text-red-200 uppercase tracking-wider">
                                Parliament of Canada · Ottawa, ON
                              </h3>
                              <p className="text-[10px] text-zinc-400">House of Commons & Senate Public Offices</p>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 text-[9px] font-mono font-bold">
                            CIVIC CANADA
                          </span>
                        </div>

                        <div className="bg-black/40 border border-red-500/30 rounded-2xl p-2.5 text-[10px] space-y-1 text-zinc-300">
                          <div className="flex items-center gap-1.5 font-bold text-amber-300">
                            <span>🗳️</span>
                            <span>CANADIAN CITIZEN ELECTIONS (COMING SOON)</span>
                          </div>
                          <p className="text-zinc-400 leading-relaxed">
                            Canadian parliamentary elections for verified citizens and PR holders will open in an upcoming release. All federal and provincial ridings are currently vacant and open for upcoming registration.
                          </p>
                        </div>
                      </div>

                      {/* Canadian Roles List */}
                      <div className="space-y-3">
                        {[
                          { role: 'Prime Minister of Canada', branch: 'Cabinet & Privy Council · Ottawa, ON', icon: '🍁', desc: 'Head of Government of Canada, leading the Federal Cabinet and national policy priorities.' },
                          { role: 'Governor General of Canada', branch: 'Rideau Hall · Crown Representative', icon: '👑', desc: 'Representative of the Canadian Crown, granting Royal Assent to Acts of Parliament.' },
                          { role: 'Minister of Finance & Deputy PM', branch: 'Department of Finance · Ottawa, ON', icon: '💰', desc: 'Oversees federal taxation, Bank of Canada monetary coordination, and national budget.' },
                          { role: 'Speaker of the House of Commons', branch: 'Parliament Hill · Legislative', icon: '⚖️', desc: 'Presides over parliamentary debates, vote counts, and constitutional proceedings.' },
                          { role: 'Premier of Ontario', branch: "Queen's Park · Legislative Assembly of Ontario", icon: '🏛️', desc: 'Chief Executive of Ontario, leading provincial health networks and infrastructure.' },
                        ].map((roleItem, idx) => (
                          <div
                            key={idx}
                            className="p-3.5 rounded-2xl bg-zinc-950/90 border border-zinc-800 space-y-2 shadow-md text-left"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="text-2xl shrink-0">{roleItem.icon}</span>
                                <div>
                                  <h4 className="text-xs font-black text-white">{roleItem.role}</h4>
                                  <div className="text-[10px] text-zinc-400">{roleItem.branch}</div>
                                </div>
                              </div>
                              <span className="px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/40 text-red-300 font-mono font-black text-[9px] uppercase tracking-wider shrink-0">
                                COMING SOON
                              </span>
                            </div>

                            <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800/90 flex items-center justify-between text-[10px]">
                              <div>
                                <span className="text-zinc-500 block uppercase font-mono text-[9px]">Incumbent Candidate:</span>
                                <span className="text-amber-300 font-bold flex items-center gap-1">
                                  <span>⚠️</span>
                                  <span>VACANT - No Real Citizen Running Yet</span>
                                </span>
                              </div>
                              <div className="text-right">
                                <span className="text-zinc-500 block uppercase font-mono text-[9px]">Ballot Status:</span>
                                <span className="text-zinc-400 font-mono">Awaiting Real Players</span>
                              </div>
                            </div>

                            <p className="text-[10px] text-zinc-400 leading-relaxed">{roleItem.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <>
                  {/* Government Header Banner */}
                  <div className="bg-gradient-to-r from-emerald-950/95 via-green-950/90 to-amber-950/80 border-2 border-emerald-500/40 rounded-3xl p-4 shadow-xl text-left space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-lg">
                          🏛️
                        </div>
                        <div>
                          <h3 className="text-xs font-black text-emerald-200 uppercase tracking-wider">
                            Federal Republic of Nigeria
                          </h3>
                          <p className="text-[10px] text-zinc-400">Citizen Democracy & Public Office Portal</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-mono font-bold">
                        CIVIC GOV
                      </span>
                    </div>

                    {/* Democratic Notice: Real Players Only, Strict No Fake Names */}
                    <div className="bg-black/40 border border-emerald-500/30 rounded-2xl p-2.5 text-[10px] space-y-1 text-zinc-300">
                      <div className="flex items-center gap-1.5 font-bold text-amber-300">
                        <span>🗳️</span>
                        <span>REAL CITIZEN ELECTIONS (NO FAKE NAMES)</span>
                      </div>
                      <p className="text-zinc-400 leading-relaxed">
                        Democracy in Naija Life is powered exclusively by real players. Real citizens will run for office, publish campaign manifestos, and vote. Currently, no citizen has declared candidacy for any position. All offices are vacant and open for upcoming registration.
                      </p>
                    </div>
                  </div>

                  {/* Level Switcher: Federal vs State */}
                  <div className="grid grid-cols-2 p-1 bg-zinc-900 border border-zinc-800 rounded-2xl">
                    <button
                      type="button"
                      onClick={() => setGovLevelTab('federal')}
                      className={`py-2 text-[11px] font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        govLevelTab === 'federal'
                          ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-black shadow-md'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      <span>🦅</span>
                      <span>Federal Government</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setGovLevelTab('state')}
                      className={`py-2 text-[11px] font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        govLevelTab === 'state'
                          ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-black shadow-md'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      <span>🏛️</span>
                      <span>State Government</span>
                    </button>
                  </div>

                  {/* State Picker when State Government Tab is Active */}
                  {govLevelTab === 'state' && (
                    <div className="p-3 rounded-2xl bg-zinc-950/90 border border-zinc-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                          Select State Government:
                        </span>
                        <span className="text-[10px] font-mono text-emerald-400 font-bold">
                          {currentGovState.name} State
                        </span>
                      </div>
                      <select
                        value={selectedGovStateId}
                        onChange={(e) => setSelectedGovStateId(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white font-bold cursor-pointer focus:outline-none focus:border-emerald-500"
                      >
                        {NIGERIA_36_STATES_ALPHABETICAL.map((st) => (
                          <option key={st.id} value={st.id}>
                            {st.name} State Executive Council
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Roles List */}
                  <div className="space-y-3">
                    {displayedRoles.map((roleItem, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-2xl bg-zinc-950/90 border border-zinc-800 hover:border-emerald-500/40 transition-all space-y-2 shadow-md text-left"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl shrink-0">{roleItem.icon}</span>
                            <div>
                              <h4 className="text-xs font-black text-white">{roleItem.role}</h4>
                              <div className="text-[10px] text-zinc-400">{roleItem.branch}</div>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono font-black text-[9px] uppercase tracking-wider shrink-0">
                            COMING SOON
                          </span>
                        </div>

                        {/* VACANT STATUS BANNER - STRICTLY NO FAKE NAMES */}
                        <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800/90 flex items-center justify-between text-[10px]">
                          <div>
                            <span className="text-zinc-500 block uppercase font-mono text-[9px]">Incumbent Candidate:</span>
                            <span className="text-amber-300 font-bold flex items-center gap-1">
                              <span>⚠️</span>
                              <span>VACANT - No Citizen Running Yet</span>
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-zinc-500 block uppercase font-mono text-[9px]">Ballot Status:</span>
                            <span className="text-zinc-400 font-mono">Awaiting Real Players</span>
                          </div>
                        </div>

                        <p className="text-[10px] text-zinc-400 leading-relaxed">{roleItem.desc}</p>

                        {/* Interactive Democratic Action Buttons (Set to Coming Soon) */}
                        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-zinc-900">
                          <button
                            type="button"
                            onClick={() => {
                              onShowToast(`🏛️ Candidacy registration for "${roleItem.role}" is COMING SOON! Real players will contest.`);
                              triggerSound?.('coin');
                            }}
                            className="py-1.5 px-2 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-zinc-300 font-bold text-[10px] border border-zinc-700 cursor-pointer text-center"
                          >
                            Declare Candidacy
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              onShowToast(`🗳️ Ballot boxes are closed. Voting opens when real citizen candidates register!`);
                              triggerSound?.('alert');
                            }}
                            className="py-1.5 px-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-[10px] border border-emerald-500/40 cursor-pointer text-center"
                          >
                            Vote Candidate
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
              );
            })()}

            {/* =============================================================
                FLIGHT APP (REAL DOMESTIC FLIGHTS & AIRPORTS + SURGE + INT WING)
                ============================================================= */}
            {currentApp === 'flight' && (() => {
              const originAirport = STATE_AIRPORTS[currentStateId || 'lagos'] || {
                airportName: 'Murtala Muhammed International Airport',
                iata: 'LOS',
                city: 'Lagos',
                type: 'international' as const,
              };

              const validDestStates = NIGERIA_36_STATES_ALPHABETICAL.filter(
                (s) => s.id !== (currentStateId || 'lagos')
              );

              const selectedDest =
                validDestStates.find((s) => s.id === flightDestStateId) || validDestStates[0];

              const flightDetails = calculateDomesticFlightDetails(
                currentStateId || 'lagos',
                selectedDest?.id || 'abuja',
                flightAirlineId,
                1,
                flightSeatClass
              );

              const selectedAirline =
                DOMESTIC_AIRLINES.find((a) => a.id === flightAirlineId) || DOMESTIC_AIRLINES[0];

              const selectedCabin =
                FLIGHT_CABIN_CLASSES.find((c) => c.id === flightSeatClass) || FLIGHT_CABIN_CLASSES[0];

              const selectedSchedule =
                FLIGHT_SCHEDULE_PLANS.find((s) => s.id === flightScheduleId) || FLIGHT_SCHEDULE_PLANS[0];

              const totalFlightFare = flightDetails.totalFareNGN;

              const handleBookPhoneFlight = () => {
                if (moneyNGN < totalFlightFare) {
                  onShowToast(
                    `Insufficient funds! Ticket costs ${formatNaira(totalFlightFare)}, you have ${formatNaira(moneyNGN)}.`
                  );
                  triggerSound?.('alert');
                  return;
                }

                if (onFlightTravel) {
                  onFlightTravel(selectedDest, totalFlightFare, selectedAirline.name, flightDetails.aircraftModel);
                } else if (onInterstateTravel) {
                  onInterstateTravel(selectedDest, totalFlightFare);
                } else {
                  onUpdateMoney(-totalFlightFare);
                }

                onUpdateStats({ happiness: 10 + selectedCabin.joyBonus, energy: -5 });
                onLogAction(
                  'lifestyle',
                  `Booked ${selectedAirline.name} [Flight ${selectedSchedule.flightCode}] in ${selectedCabin.name} from ${originAirport.iata} to ${flightDetails.destinationIata} (-${formatNaira(totalFlightFare)}).`
                );
                onShowToast(
                  `✈️ Boarded ${selectedAirline.name} [Flight ${selectedSchedule.flightCode}] in ${selectedCabin.name} to ${selectedDest.name} State! Safe landing (+${selectedCabin.joyBonus} Joy)!`
                );
                triggerSound?.('success');
                onClose();
              };

              return (
                <div className="space-y-4">
                  {/* International Flight Wings & Country Tabs */}
                  <div className="space-y-1 text-left">
                    <span className="text-[9px] font-mono font-bold text-sky-400 uppercase tracking-wider block">
                      Select Flight Corridor & Country:
                    </span>
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                      {[
                        { id: 'nigeria', label: '🇳🇬 36 States Domestic', status: 'active' },
                        { id: 'canada', label: '🇨🇦 Canada', status: 'active' },
                        { id: 'uk', label: '🇬🇧 United Kingdom', status: 'soon' },
                        { id: 'usa', label: '🇺🇸 United States', status: 'soon' },
                        { id: 'uae', label: '🇦🇪 United Arab Emirates', status: 'soon' },
                      ].map((tab) => {
                        const isSelected =
                          (tab.id === 'nigeria' && flightTab === 'domestic') ||
                          (tab.id === 'canada' && flightTab === 'international' && selectedIntlDestId === 'canada');
                        const isSoon = tab.status === 'soon';
                        return (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => {
                              if (isSoon) {
                                onShowToast(`🌐 International flights to ${tab.label} are COMING SOON! Bilateral FAAN & NCAA clearance in progress.`);
                                triggerSound?.('alert');
                                return;
                              }
                              if (tab.id === 'nigeria') {
                                setFlightTab('domestic');
                                triggerSound?.('coin');
                              } else if (tab.id === 'canada') {
                                setFlightTab('international');
                                setSelectedIntlDestId('canada');
                                triggerSound?.('coin');
                              }
                            }}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
                              isSelected
                                ? tab.id === 'canada'
                                  ? 'bg-gradient-to-r from-red-600 via-rose-600 to-red-800 text-white border-red-400 shadow-md font-black'
                                  : 'bg-gradient-to-r from-sky-500 to-blue-600 text-white border-sky-400 shadow-md font-black'
                                : isSoon
                                ? 'bg-zinc-900/60 text-zinc-500 border-zinc-800'
                                : 'bg-zinc-900 text-zinc-300 border-zinc-700 hover:border-zinc-500'
                            }`}
                          >
                            <span>{tab.label}</span>
                            {isSoon && (
                              <span className="text-[8px] px-1 py-0.2 rounded bg-zinc-800 text-zinc-400 uppercase font-mono">
                                Soon
                              </span>
                            )}
                            {isSelected && (
                              <span className="text-[8px] px-1 py-0.2 rounded bg-white text-black uppercase font-mono font-black">
                                Active
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Flight Header Banner */}
                  <div className="bg-gradient-to-r from-sky-950/90 via-blue-950/90 to-indigo-950/80 border-2 border-sky-500/40 rounded-3xl p-4 shadow-xl text-left space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-400 flex items-center justify-center text-lg">
                          ✈️
                        </div>
                        <div>
                          <h3 className="text-xs font-black text-sky-200 uppercase tracking-wider">
                            Federal Airports Authority of Nigeria
                          </h3>
                          <p className="text-[10px] text-zinc-400">Live Domestic & International Reservations</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40 text-[9px] font-mono font-bold">
                        FAAN TERMINAL
                      </span>
                    </div>

                    {/* Current Airport Indicator */}
                    <div className="p-2.5 rounded-2xl bg-black/40 border border-sky-500/30 flex items-center justify-between text-left">
                      <div>
                        <span className="text-[9px] font-mono text-zinc-400 uppercase block">Current Origin Airport:</span>
                        <div className="text-xs font-black text-white">{originAirport.airportName}</div>
                        <div className="text-[10px] text-sky-300 font-mono">Terminal IATA: {originAirport.iata} · {originAirport.city}</div>
                      </div>
                      <span className="px-2 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black font-mono">
                        OPEN
                      </span>
                    </div>
                  </div>

                  {/* Concourse Switcher: Domestic vs International */}
                  <div className="grid grid-cols-2 p-1 bg-zinc-900 border border-zinc-800 rounded-2xl">
                    <button
                      type="button"
                      onClick={() => setFlightTab('domestic')}
                      className={`py-2 text-[11px] font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        flightTab === 'domestic'
                          ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      <span>🇳🇬</span>
                      <span>Domestic Flights</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFlightTab('international')}
                      className={`py-2 text-[11px] font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        flightTab === 'international'
                          ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      <span>🌐</span>
                      <span>International Wing</span>
                    </button>
                  </div>

                  {/* DOMESTIC FLIGHTS CONCOURSE */}
                  {flightTab === 'domestic' && (
                    <div className="space-y-3 text-left">
                      {/* Destination Picker */}
                      {/* Destination Picker: All 36 States, Current Location marked Unavailable */}
                      <div className="p-3 rounded-2xl bg-zinc-950/90 border border-zinc-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                            Destination State Airport:
                          </label>
                          <span className="text-[9px] text-sky-400 font-mono font-bold">Origin: {currentStateId?.toUpperCase() || 'LAGOS'}</span>
                        </div>
                        <select
                          value={selectedDest?.id || ''}
                          onChange={(e) => setFlightDestStateId(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white font-bold cursor-pointer focus:outline-none focus:border-sky-500"
                        >
                          {NIGERIA_36_STATES_ALPHABETICAL.map((st) => {
                            const isCurrent = st.id === (currentStateId || 'lagos');
                            const airport = STATE_AIRPORTS[st.id] || { airportName: `${st.name} Airport`, iata: 'NGA', city: st.name, type: 'regional' as const };
                            return (
                              <option
                                key={st.id}
                                value={st.id}
                                disabled={isCurrent}
                                className={isCurrent ? 'text-zinc-500 bg-zinc-950 italic' : 'text-white bg-zinc-900'}
                              >
                                {isCurrent
                                  ? `${st.name} State — (Current Location - Already Here / Unavailable)`
                                  : `${st.name} State · ${airport.airportName} (${airport.iata})`}
                              </option>
                            );
                          })}
                        </select>
                      </div>

                      {/* Airline Carrier Selection */}
                      <div className="p-3 rounded-2xl bg-zinc-950/90 border border-zinc-800 space-y-2">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                          Select Domestic Airline Carrier:
                        </label>
                        <div className="grid grid-cols-1 gap-1.5">
                          {DOMESTIC_AIRLINES.map((air) => (
                            <button
                              key={air.id}
                              type="button"
                              onClick={() => setFlightAirlineId(air.id)}
                              className={`p-2 rounded-xl text-left border transition-all cursor-pointer flex items-center justify-between ${
                                flightAirlineId === air.id
                                  ? 'bg-sky-500/20 border-sky-400 text-white shadow-md'
                                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-base">{air.logo}</span>
                                <div>
                                  <div className="text-xs font-bold text-white">{air.name}</div>
                                  <div className="text-[9px] text-zinc-400">{air.aircraft} · {air.tagline}</div>
                                </div>
                              </div>
                              <span className="text-[10px] font-mono font-bold text-sky-400">
                                {air.multiplier > 1 ? '+VIP Tier' : air.multiplier < 1 ? 'Budget' : 'Standard'}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Cabin Class Selection (All 4 Classes: Economy, Premium Economy, Business, First Class) */}
                      <div className="p-3 rounded-2xl bg-zinc-950/90 border border-zinc-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                            Cabin Class & Travel Plan:
                          </label>
                          <span className="text-[9px] text-amber-300 font-mono font-bold">4 Flying Tiers</span>
                        </div>
                        <div className="space-y-1.5">
                          {FLIGHT_CABIN_CLASSES.map((cabin) => {
                            const isSelected = flightSeatClass === cabin.id;
                            const cabinFare = calculateDomesticFlightDetails(
                              currentStateId || 'lagos',
                              selectedDest?.id || 'abuja',
                              flightAirlineId,
                              1,
                              cabin.id
                            ).totalFareNGN;
                            return (
                              <button
                                key={cabin.id}
                                type="button"
                                onClick={() => setFlightSeatClass(cabin.id)}
                                className={`w-full p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                                  isSelected
                                    ? 'bg-gradient-to-r from-sky-950/80 via-zinc-900 to-amber-950/60 border-amber-400 ring-1 ring-amber-400/40 shadow-md'
                                    : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="text-lg">{cabin.icon}</span>
                                    <div>
                                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                                        <span>{cabin.name}</span>
                                        {isSelected && (
                                          <span className="px-1.5 py-0.2 rounded bg-amber-400 text-black text-[8px] font-black uppercase">
                                            Active
                                          </span>
                                        )}
                                      </div>
                                      <div className="text-[9px] text-zinc-400 font-mono">
                                        Baggage: {cabin.baggage}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <span className="text-xs font-mono font-black text-emerald-400 block">
                                      {formatNaira(cabinFare)}
                                    </span>
                                    <span className="text-[9px] font-mono text-amber-300">+{cabin.joyBonus} Joy</span>
                                  </div>
                                </div>
                                {isSelected && (
                                  <div className="mt-1.5 pt-1.5 border-t border-zinc-800 flex flex-wrap gap-1">
                                    {cabin.perks.map((p, idx) => (
                                      <span key={idx} className="text-[8px] px-1 py-0.2 rounded bg-zinc-950 text-zinc-300">
                                        {p}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Dynamic Real-Player Demand Surge Banner */}
                      {flightDetails.isSurgeActive && (
                        <div className="p-3 rounded-2xl bg-amber-950/80 border-2 border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.25)] space-y-1">
                          <div className="flex items-center gap-1.5 text-xs font-black text-amber-300">
                            <span className="animate-pulse">⚡</span>
                            <span>REAL PLAYER AIRLINE SURGE ACTIVE</span>
                          </div>
                          <p className="text-[10px] text-zinc-300 leading-relaxed">
                            Heavy flight bookings by real online citizens currently traveling this route. Dynamic airline algorithm applied a{' '}
                            <strong className="text-amber-200">{(flightDetails.surgeMultiplier).toFixed(2)}x surge (+{Math.round((flightDetails.surgeMultiplier - 1) * 100)}%)</strong> to ticket fares.
                          </p>
                        </div>
                      )}

                      {/* Flight Fare Summary Card */}
                      <div className="p-3.5 rounded-2xl bg-zinc-950/95 border border-sky-500/40 shadow-xl space-y-2.5">
                        <div className="flex items-center justify-between text-[10px] font-mono">
                          <span className="text-zinc-400">Flight Route & Code:</span>
                          <span className="text-sky-300 font-bold">{selectedSchedule.flightCode} · {originAirport.iata} ➔ {flightDetails.destinationIata}</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] font-mono">
                          <span className="text-zinc-400">Air Distance & Time:</span>
                          <span className="text-white font-bold">{flightDetails.distanceKm} km · {flightDetails.flightTimeFormatted}</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] font-mono">
                          <span className="text-zinc-400">Cabin & Schedule:</span>
                          <span className="text-amber-300 font-bold uppercase">{selectedCabin.name} ({selectedSchedule.timeSlot})</span>
                        </div>
                        <div className="pt-2 border-t border-zinc-800 flex items-center justify-between">
                          <div>
                            <span className="text-[9px] font-mono text-zinc-400 uppercase block">Total Airline Ticket Fare:</span>
                            <span className="text-base font-black font-mono text-sky-400">
                              {formatNaira(totalFlightFare)}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[9px] font-mono text-zinc-400 uppercase block">Wallet Balance:</span>
                            <span className={`text-xs font-mono font-bold ${moneyNGN >= totalFlightFare ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {formatNaira(moneyNGN)}
                            </span>
                          </div>
                        </div>

                        {/* Booking Action Button */}
                        <button
                          type="button"
                          onClick={handleBookPhoneFlight}
                          disabled={moneyNGN < totalFlightFare}
                          className={`w-full py-3 rounded-xl font-black text-xs cursor-pointer shadow-lg transition-all flex items-center justify-center gap-2 ${
                            moneyNGN >= totalFlightFare
                              ? 'bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white active:scale-98'
                              : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                          }`}
                        >
                          <Plane className="w-4 h-4" />
                          <span>
                            {moneyNGN >= totalFlightFare
                              ? `Book & Board [${selectedSchedule.flightCode}] (${formatNaira(totalFlightFare)})`
                              : 'Insufficient Funds for Flight Ticket'}
                          </span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* INTERNATIONAL WING CONCOURSE */}
                  {flightTab === 'international' && (
                    <div className="space-y-3 text-left">
                      {selectedIntlDestId === 'canada' ? (
                        /* FULL CANADA TRANSATLANTIC BOOKING VIEW (JUST LIKE DOMESTIC FLIGHT) */
                        (() => {
                          const currentOriginAirport = STATE_AIRPORTS[currentStateId || 'lagos'] || {
                            airportName: 'Murtala Muhammed International Airport',
                            iata: 'LOS',
                            city: 'Lagos',
                            type: 'international' as const,
                          };

                          const canadaFlightDetails = calculateDomesticFlightDetails(
                            currentStateId || 'lagos',
                            'canada',
                            canadaAirlineId,
                            1,
                            canadaSeatClass
                          );

                          const selectedCanadaAirline =
                            CANADA_AIRLINES.find((a) => a.id === canadaAirlineId) || CANADA_AIRLINES[0];

                          const selectedCanadaCabin =
                            CANADA_CABIN_CLASSES.find((c) => c.id === canadaSeatClass) || CANADA_CABIN_CLASSES[0];

                          const totalCanadaFare = canadaFlightDetails.totalFareNGN;
                          const isPlayerInCanada = currentStateId === 'canada' || activeStateKey === 'canada';
                          const totalCanadaFareCAD = Math.round(totalCanadaFare / 960.54);
                          const userCadBalance = userProfile?.bankCAD || 0;

                          const ownedLuxuryVehicles = (ownedVehicles || []).filter(
                            (v: any) => v.isLuxuryAsset || ['jet', 'helicopter', 'yacht'].includes((v.category || '').toLowerCase())
                          );

                          const validDocs = (userProfile?.ownedDocuments || []).filter((d) => {
                            const isCan =
                              d.country === 'Canada' ||
                              ['visa', 'study_permit', 'work_permit', 'pr_card', 'citizenship'].includes(d.type);
                            const isExp = d.isExpired || (d.expiresAtTimestamp ? Date.now() > d.expiresAtTimestamp : false);
                            return isCan && !isExp;
                          });
                          const hasValidVisa = validDocs.length > 0;

                          const handleBookCanadaFlight = (isPrivate = false) => {
                            if (!isPlayerInCanada && !hasValidVisa) {
                              onShowToast('⛔ CBSA Clearance Denied: You must possess a valid, non-expired Canadian Visa or Permit! Apply in the Immigration App.');
                              triggerSound?.('alert');
                              return;
                            }

                            const fareNGN = isPrivate ? 28000000 : totalCanadaFare;
                            const fareCAD = isPrivate ? 29150 : totalCanadaFareCAD;

                            if (isPlayerInCanada) {
                              if (userCadBalance < fareCAD) {
                                onShowToast(`Insufficient Canadian Dollars! Requires $${fareCAD.toLocaleString()} CAD. Your CAD balance is $${userCadBalance.toLocaleString()} CAD.`);
                                triggerSound?.('alert');
                                return;
                              }
                              if (userProfile) {
                                userProfile.bankCAD = userCadBalance - fareCAD;
                                if (!Array.isArray(userProfile.receipts)) userProfile.receipts = [];
                                userProfile.receipts.unshift({
                                  id: `TX_CAN_RET_${Date.now()}`,
                                  title: isPrivate ? `Private Aircraft Flight to Nigeria (Jet A-1 Fuel Fee)` : `${selectedCanadaAirline.name} Return Flight to Nigeria (MMIA Lagos)`,
                                  category: 'flight',
                                  amount: fareCAD,
                                  date: new Date().toLocaleDateString('en-CA'),
                                  type: 'debit',
                                  currency: 'CAD',
                                });
                              }
                              onUpdateStats({ happiness: isPrivate ? 65 : selectedCanadaCabin.joyBonus, energy: -5 });
                              onLogAction(
                                'lifestyle',
                                isPrivate
                                  ? `Flew private aircraft back to Nigeria from Toronto Pearson (-$${fareCAD.toLocaleString()} CAD).`
                                  : `Booked ${selectedCanadaAirline.name} back to Nigeria (-$${fareCAD.toLocaleString()} CAD).`
                              );
                              const lagosStateData = NIGERIA_36_STATES_ALPHABETICAL[0] as any;
                              onInterstateTravel?.(lagosStateData, fareCAD);
                              onShowToast(`✈️ Boarded flight to Lagos, Nigeria! Safe landing (+${isPrivate ? 65 : selectedCanadaCabin.joyBonus} Joy)!`);
                              triggerSound?.('success');
                              onClose();
                            } else {
                              if (moneyNGN < fareNGN) {
                                onShowToast(`Insufficient funds! Ticket costs ${formatNaira(fareNGN)}, you have ${formatNaira(moneyNGN)}.`);
                                triggerSound?.('alert');
                                return;
                              }
                              onUpdateMoney(-fareNGN);
                              if (userProfile) {
                                if (!Array.isArray(userProfile.receipts)) userProfile.receipts = [];
                                userProfile.receipts.unshift({
                                  id: `TX_CAN_${Date.now()}`,
                                  title: isPrivate ? `Private Aircraft Flight to Toronto (Jet A-1 Fuel Fee)` : `${selectedCanadaAirline.name} Transatlantic Flight to Toronto Pearson (YYZ)`,
                                  category: 'flight',
                                  amount: fareNGN,
                                  date: new Date().toLocaleDateString(),
                                  type: 'debit',
                                  currency: 'NGN',
                                });
                              }
                              onUpdateStats({ happiness: isPrivate ? 65 : selectedCanadaCabin.joyBonus, energy: -5 });
                              onLogAction(
                                'lifestyle',
                                isPrivate
                                  ? `Flew private jet to Toronto Pearson (-${formatNaira(fareNGN)}).`
                                  : `Booked ${selectedCanadaAirline.name} (${selectedCanadaCabin.name}) to Canada (-${formatNaira(fareNGN)}).`
                              );
                              if (onFlightTravel) {
                                onFlightTravel(
                                  CANADA_STATE_DATA,
                                  fareNGN,
                                  isPrivate ? 'Private Executive Jet' : selectedCanadaAirline.name,
                                  isPrivate ? 'Bombardier Global 7500' : 'Boeing 787-9 Dreamliner'
                                );
                              } else {
                                onInterstateTravel?.(CANADA_STATE_DATA, fareNGN);
                              }
                              onShowToast(`✈️ Boarded ${isPrivate ? 'your Private Jet' : selectedCanadaAirline.name} to Canada! Safe landing (+${isPrivate ? 65 : selectedCanadaCabin.joyBonus} Joy)!`);
                              triggerSound?.('success');
                              onClose();
                            }
                          };

                          return (
                            <div className="space-y-3">
                              {/* Back Navigation Bar */}
                              <div className="flex items-center justify-between">
                                <button
                                  type="button"
                                  onClick={() => setSelectedIntlDestId(null)}
                                  className="text-[10px] font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer"
                                >
                                  <span>←</span>
                                  <span>All International Destinations</span>
                                </button>
                                <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 text-[9px] font-mono font-bold">
                                  {isPlayerInCanada ? '🇳🇬 RETURN TO NIGERIA' : '🇨🇦 CANADA DIRECT'}
                                </span>
                              </div>

                              {/* Flight Route Header Card */}
                              <div className="p-3 rounded-2xl bg-gradient-to-r from-red-950/80 via-zinc-900 to-sky-950/70 border border-red-500/40 shadow-xl space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                  <div>
                                    <span className="text-[9px] font-mono text-zinc-400 uppercase block">Departing Airport</span>
                                    <span className="font-bold text-white">
                                      {isPlayerInCanada ? "Toronto Pearson Int'l (YYZ)" : currentOriginAirport.airportName}
                                    </span>
                                    <span className="text-[10px] text-sky-300 font-mono block">
                                      Terminal IATA: {isPlayerInCanada ? 'YYZ · Ontario, Canada' : `${currentOriginAirport.iata} · ${currentOriginAirport.city}`}
                                    </span>
                                  </div>
                                  <div className="text-right">
                                    <span className="text-[9px] font-mono text-zinc-400 uppercase block">Arrival Destination</span>
                                    <span className="font-bold text-white">
                                      {isPlayerInCanada ? "Murtala Muhammed Int'l (LOS)" : "Toronto Pearson Int'l (YYZ)"}
                                    </span>
                                    <span className="text-[10px] text-red-300 font-mono block">
                                      {isPlayerInCanada ? 'Lagos, Nigeria · 8,920 km' : 'Ontario, Canada · 8,920 km'}
                                    </span>
                                  </div>
                                </div>
                                <div className="p-2 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between text-[10px] font-mono">
                                  <span className="text-zinc-400">Flight Duration:</span>
                                  <span className="text-white font-bold">10h 45m Direct Transatlantic Jet</span>
                                </div>
                              </div>

                              {/* CBSA Clearance Status Banner */}
                              <div className={`p-2.5 rounded-2xl border flex items-center justify-between text-[10px] ${
                                hasValidVisa
                                  ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-200'
                                  : 'bg-amber-950/80 border-amber-500/60 text-amber-200'
                              }`}>
                                <div className="flex items-center gap-2">
                                  <span className="text-base">{hasValidVisa ? '✅' : '⚠️'}</span>
                                  <div>
                                    <span className="font-bold block">
                                      {hasValidVisa
                                        ? 'CBSA Clearance Verified: Canadian Visa / Permit Active'
                                        : 'CBSA Border Warning: Valid Visa or Permit Required'}
                                    </span>
                                    <span className="text-[9px] text-zinc-400">
                                      {hasValidVisa
                                        ? 'Cleared by Canada Border Services Agency for entry'
                                        : 'Apply in the Immigration App before departure'}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Transatlantic Airline Carrier Selection */}
                              <div className="p-3 rounded-2xl bg-zinc-950/90 border border-zinc-800 space-y-2">
                                <div className="flex items-center justify-between">
                                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                                    Select International Airline Carrier:
                                  </label>
                                  <span className="text-[9px] text-red-400 font-mono font-bold">6 Global Carriers</span>
                                </div>
                                <div className="space-y-1.5">
                                  {CANADA_AIRLINES.map((air) => {
                                    const isSelected = canadaAirlineId === air.id;
                                    const airlineFare = calculateDomesticFlightDetails(
                                      currentStateId || 'lagos',
                                      'canada',
                                      air.id,
                                      1,
                                      canadaSeatClass
                                    ).totalFareNGN;
                                    return (
                                      <button
                                        key={air.id}
                                        type="button"
                                        onClick={() => setCanadaAirlineId(air.id)}
                                        className={`w-full p-2.5 rounded-xl text-left border transition-all cursor-pointer flex items-center justify-between ${
                                          isSelected
                                            ? 'bg-red-950/60 border-red-400 ring-1 ring-red-400 text-white shadow-md'
                                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                                        }`}
                                      >
                                        <div className="flex items-center gap-2.5">
                                          <span className="text-xl">{air.logo}</span>
                                          <div>
                                            <div className="text-xs font-bold text-white flex items-center gap-1.5">
                                              <span>{air.name}</span>
                                              <span className="text-[9px] text-zinc-400 font-normal">({air.alliance})</span>
                                            </div>
                                            <div className="text-[9px] text-zinc-400">{air.aircraft} · {air.tagline}</div>
                                          </div>
                                        </div>
                                        <div className="text-right">
                                          <span className="text-xs font-mono font-black text-emerald-400 block">
                                            {formatNaira(airlineFare)}
                                          </span>
                                          <span className="text-[9px] font-mono text-zinc-400">
                                            {air.multiplier === 1 ? 'Standard' : air.multiplier < 1 ? 'Direct Saver' : `VIP +${Math.round((air.multiplier - 1) * 100)}%`}
                                          </span>
                                        </div>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Cabin Class Selection for Canada */}
                              <div className="p-3 rounded-2xl bg-zinc-950/90 border border-zinc-800 space-y-2">
                                <div className="flex items-center justify-between">
                                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                                    Cabin Class & Travel Plan:
                                  </label>
                                  <span className="text-[9px] text-amber-300 font-mono font-bold">4 Flying Tiers</span>
                                </div>
                                <div className="space-y-1.5">
                                  {CANADA_CABIN_CLASSES.map((cabin) => {
                                    const isSelected = canadaSeatClass === cabin.id;
                                    const cabinFare = calculateDomesticFlightDetails(
                                      currentStateId || 'lagos',
                                      'canada',
                                      canadaAirlineId,
                                      1,
                                      cabin.id
                                    ).totalFareNGN;
                                    return (
                                      <button
                                        key={cabin.id}
                                        type="button"
                                        onClick={() => setCanadaSeatClass(cabin.id)}
                                        className={`w-full p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                                          isSelected
                                            ? 'bg-gradient-to-r from-red-950/80 via-zinc-900 to-amber-950/60 border-amber-400 ring-1 ring-amber-400 shadow-md'
                                            : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                                        }`}
                                      >
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-2">
                                            <span className="text-lg">{cabin.icon}</span>
                                            <div>
                                              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                                                <span>{cabin.name}</span>
                                                {isSelected && (
                                                  <span className="px-1.5 py-0.2 rounded bg-amber-400 text-black text-[8px] font-black uppercase">
                                                    Active
                                                  </span>
                                                )}
                                              </div>
                                              <div className="text-[9px] text-zinc-400 font-mono">
                                                Baggage: {cabin.baggage}
                                              </div>
                                            </div>
                                          </div>
                                          <div className="text-right">
                                            <span className="text-xs font-mono font-black text-emerald-400 block">
                                              {formatNaira(cabinFare)}
                                            </span>
                                            <span className="text-[9px] font-mono text-amber-300">+{cabin.joyBonus} Joy</span>
                                          </div>
                                        </div>
                                        {isSelected && (
                                          <div className="mt-1.5 pt-1.5 border-t border-zinc-800 flex flex-wrap gap-1">
                                            {cabin.perks.map((p, idx) => (
                                              <span key={idx} className="text-[8px] px-1 py-0.2 rounded bg-zinc-950 text-zinc-300">
                                                {p}
                                              </span>
                                            ))}
                                          </div>
                                        )}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                                {/* Flight Fare Summary Card */}
                                <div className="p-3.5 rounded-2xl bg-zinc-950/95 border border-red-500/40 shadow-xl space-y-2.5">
                                  <div className="flex items-center justify-between text-[10px] font-mono">
                                    <span className="text-zinc-400">Flight Route & Carrier:</span>
                                    <span className="text-red-300 font-bold">
                                      {selectedCanadaAirline.name} · {isPlayerInCanada ? 'YYZ ➔ LOS' : `${currentOriginAirport.iata} ➔ YYZ`}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between text-[10px] font-mono">
                                    <span className="text-zinc-400">Aircraft & Distance:</span>
                                    <span className="text-white font-bold">{selectedCanadaAirline.aircraft} · 8,920 km</span>
                                  </div>
                                  <div className="flex items-center justify-between text-[10px] font-mono">
                                    <span className="text-zinc-400">Cabin Class:</span>
                                    <span className="text-amber-300 font-bold uppercase">{selectedCanadaCabin.name} (+{selectedCanadaCabin.joyBonus} Joy)</span>
                                  </div>
                                  <div className="pt-2 border-t border-zinc-800 flex items-center justify-between">
                                    <div>
                                      <span className="text-[9px] font-mono text-zinc-400 uppercase block">Total Ticket Fare:</span>
                                      <span className="text-base font-black font-mono text-emerald-400">
                                        {isPlayerInCanada ? `$${totalCanadaFareCAD.toLocaleString()} CAD` : formatNaira(totalCanadaFare)}
                                      </span>
                                    </div>
                                    <div className="text-right">
                                      <span className="text-[9px] font-mono text-zinc-400 uppercase block">Wallet Balance:</span>
                                      <span className={`text-xs font-mono font-bold ${
                                        (isPlayerInCanada ? userCadBalance >= totalCanadaFareCAD : moneyNGN >= totalCanadaFare) ? 'text-emerald-400' : 'text-rose-400'
                                      }`}>
                                        {isPlayerInCanada ? `$${userCadBalance.toLocaleString()} CAD` : formatNaira(moneyNGN)}
                                      </span>
                                    </div>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => handleBookCanadaFlight(false)}
                                    disabled={isPlayerInCanada ? userCadBalance < totalCanadaFareCAD : moneyNGN < totalCanadaFare}
                                    className={`w-full py-3 rounded-xl font-black text-xs cursor-pointer shadow-lg transition-all flex items-center justify-center gap-2 ${
                                      (isPlayerInCanada ? userCadBalance >= totalCanadaFareCAD : moneyNGN >= totalCanadaFare)
                                        ? 'bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white active:scale-98'
                                        : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                                    }`}
                                  >
                                    <Plane className="w-4 h-4" />
                                    <span>
                                      {isPlayerInCanada
                                        ? `Book Return Flight to Nigeria ($${totalCanadaFareCAD.toLocaleString()} CAD)`
                                        : `Book & Board [${selectedCanadaAirline.name}] (${formatNaira(totalCanadaFare)})`}
                                    </span>
                                  </button>

                                  {/* OWNED LUXURY PRIVATE JET / HELICOPTER / YACHT TRAVEL OPTION */}
                                  {ownedLuxuryVehicles.length > 0 && (
                                    <div className="pt-2 border-t border-zinc-800 space-y-1.5">
                                      <div className="flex items-center justify-between text-[10px] font-mono">
                                        <span className="text-amber-300 font-bold flex items-center gap-1">
                                          <span>👑</span>
                                          <span>Owned Private Aircraft / Yacht Option</span>
                                        </span>
                                        <span className="text-zinc-400 text-[9px]">{ownedLuxuryVehicles[0].name}</span>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => handleBookCanadaFlight(true)}
                                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 text-black font-black text-xs cursor-pointer shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all"
                                      >
                                        <Plane className="w-4 h-4 fill-black" />
                                        <span>
                                          Fly Owned Luxury Craft (Aviation Fuel: {isPlayerInCanada ? '$29,150 CAD' : '₦28,000,000'})
                                        </span>
                                      </button>
                                    </div>
                                  )}
                                </div>
                            </div>
                          );
                        })()
                      ) : (
                        /* INTERNATIONAL DESTINATIONS LIST */
                        <div className="space-y-2.5">
                          {INTERNATIONAL_DESTINATIONS.map((dest) => (
                            <div
                              key={dest.id}
                              className="p-3.5 rounded-2xl bg-zinc-950/90 border border-zinc-800 hover:border-sky-500/40 transition-all space-y-2 shadow-md cursor-pointer"
                              onClick={() => {
                                if (dest.id === 'canada') {
                                  setSelectedIntlDestId('canada');
                                }
                              }}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2.5">
                                  <span className="text-3xl shrink-0">{dest.flag}</span>
                                  <div>
                                    <div className="text-xs font-black text-white">{dest.country}</div>
                                    <div className="text-[10px] text-sky-400 font-mono">
                                      {dest.city} · {dest.airport} ({dest.iata})
                                    </div>
                                  </div>
                                </div>
                                <span className={`px-2 py-0.5 rounded-full font-mono font-black text-[9px] uppercase tracking-wider shrink-0 ${
                                  dest.status === 'ACTIVE'
                                    ? 'bg-emerald-500/20 border border-emerald-400 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                                    : 'bg-amber-500/20 border border-amber-500/40 text-amber-300'
                                }`}>
                                  {dest.status === 'ACTIVE' ? 'ACTIVE (LIVE)' : 'COMING SOON'}
                                </span>
                              </div>

                              <div className="grid grid-cols-2 gap-2 text-[9px] font-mono bg-zinc-900/60 p-2 rounded-xl border border-zinc-800">
                                <div>
                                  <span className="text-zinc-500 block uppercase">Visa Protocol:</span>
                                  <span className="text-zinc-300 font-bold truncate block">{dest.visaRequirements}</span>
                                </div>
                                <div>
                                  <span className="text-zinc-500 block uppercase">Estimated Flight:</span>
                                  <span className="text-zinc-300 font-bold">{dest.flightDuration}</span>
                                </div>
                              </div>

                              <p className="text-[10px] text-zinc-400 leading-relaxed">{dest.desc}</p>

                              <div className="flex items-center justify-between pt-1 border-t border-zinc-900">
                                <div>
                                  <span className="text-[9px] font-mono text-zinc-500 uppercase block">Ticket Price:</span>
                                  <span className="text-xs font-mono font-black text-amber-300">
                                    {dest.priceDisplay}
                                  </span>
                                </div>
                                {dest.id === 'canada' ? (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedIntlDestId('canada');
                                    }}
                                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white font-black text-[10px] shadow-lg cursor-pointer hover:scale-105 active:scale-95 transition-all flex items-center gap-1"
                                  >
                                    <span>Select Flights & Cabin</span>
                                    <span>➔</span>
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onShowToast(`🌐 International flights to ${dest.country} are COMING SOON! Bilateral FAAN clearance in progress.`);
                                      triggerSound?.('coin');
                                    }}
                                    className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-[10px] border border-zinc-700 cursor-pointer"
                                  >
                                    Reserve Seat (TBA)
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* =============================================================
                2. BUSINESS APP (EMPIRE BIZ - WITH MY BUSINESSES TAB & CASHOUT)
                ============================================================= */}
            {currentApp === 'business' && (
              <div className="space-y-3">
                {/* Top Tab Bar: My Owned Businesses vs Incorporate & Catalog */}
                <div className="flex bg-zinc-950 p-1 rounded-2xl border border-zinc-800 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setBizSubTab('owned')}
                    className={`flex-1 py-1.5 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                      bizSubTab === 'owned'
                        ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-black shadow-md'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Building className="w-3.5 h-3.5" />
                    <span>My Businesses ({userBusinesses.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setBizSubTab('catalog')}
                    className={`flex-1 py-1.5 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                      bizSubTab === 'catalog'
                        ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-black shadow-md'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span>📋 Catalog & Acquire</span>
                  </button>
                </div>

                {/* TAB 1: MY OWNED BUSINESSES WITH CUMULATIVE CASHOUT */}
                {bizSubTab === 'owned' && (
                  <div className="space-y-3">
                    {/* LIVE CUMULATIVE EMPIRE CASHOUT BOX */}
                    <div className="bg-gradient-to-br from-amber-950/90 via-zinc-950 to-neutral-900 border-2 border-amber-500/50 rounded-3xl p-4 shadow-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Building className="w-5 h-5 text-amber-400" />
                          <span className="text-xs font-black text-amber-200 uppercase tracking-wider">CUMULATIVE BUSINESS YIELD</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-mono font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                          ACTIVE ACCRUAL
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-zinc-900/80 p-2.5 rounded-2xl border border-zinc-800">
                          <span className="text-[9px] text-zinc-400 uppercase font-mono block">Invested Capital</span>
                          <span className="text-xs font-black text-white font-mono">
                            {formatNaira(totalBizCapital)}
                          </span>
                        </div>

                        <div className="bg-emerald-950/60 p-2.5 rounded-2xl border border-emerald-500/40">
                          <span className="text-[9px] text-emerald-400 uppercase font-mono block">Total Profit</span>
                          <span className="text-xs font-black text-emerald-300 font-mono animate-pulse">
                            +{formatNaira(bizStackedProfit)}
                          </span>
                        </div>

                        <div className="bg-amber-950/60 p-2.5 rounded-2xl border border-amber-500/40">
                          <span className="text-[9px] text-amber-300 uppercase font-mono block">Empire Value</span>
                          <span className="text-xs font-black text-amber-200 font-mono">
                            {formatNaira(totalBizCapital + bizStackedProfit)}
                          </span>
                        </div>
                      </div>

                      {/* Cumulative Cash Out Button */}
                      <button
                        type="button"
                        onClick={handleCashOutEmpireBiz}
                        disabled={bizStackedProfit <= 0}
                        className={`w-full py-3 rounded-2xl font-black text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg ${
                          bizStackedProfit > 0
                            ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-black shadow-amber-500/30 transform hover:scale-[1.02] active:scale-[0.98]'
                            : 'bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-60'
                        }`}
                      >
                        <Coins className="w-4 h-4 fill-current" />
                        <span>CASHOUT ALL BUSINESS PROFITS ({formatNaira(bizStackedProfit)})</span>
                      </button>
                    </div>

                    {/* List of Owned Businesses with Individual Daily Earnings */}
                    {userBusinesses.length === 0 ? (
                      <div className="p-6 rounded-3xl bg-zinc-950/80 border border-zinc-800 text-center space-y-3">
                        <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center mx-auto text-xl">
                          🏢
                        </div>
                        <h4 className="text-xs font-black text-white">No Businesses Owned Yet</h4>
                        <p className="text-[11px] text-zinc-400">
                          Switch to the Catalog tab to acquire retail stores, fuel stations, tech agencies, and factories across Nigeria!
                        </p>
                        <button
                          type="button"
                          onClick={() => setBizSubTab('catalog')}
                          className="px-4 py-2 bg-amber-500 text-black font-black text-xs rounded-xl cursor-pointer"
                        >
                          Explore Ventures
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 uppercase font-bold px-1">
                          <span>Your Active Ventures ({userBusinesses.length})</span>
                          <span className="text-amber-400">Daily Revenue Stream</span>
                        </div>

                        {userBusinesses.map((biz) => (
                          <div
                            key={biz.id}
                            className="p-3.5 rounded-2xl bg-zinc-950/90 border border-amber-500/30 shadow-md space-y-2"
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="text-xs font-black text-white">{biz.name}</h4>
                                <span className="text-[10px] font-mono text-zinc-400">
                                  {biz.typeName} · Registered: {biz.registeredDate}
                                </span>
                              </div>
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/40">
                                +{formatNaira(biz.dailyRevenueNGN)}/day
                              </span>
                            </div>

                            <div className="flex justify-between items-center text-[10px] font-mono bg-zinc-900/60 p-2 rounded-xl border border-zinc-800">
                              <span className="text-zinc-400">Enterprise Level: {biz.level}</span>
                              <span className="text-emerald-400 font-bold">Produces Active Cashflow</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 2: INCORPORATE & CATALOG */}
                {bizSubTab === 'catalog' && (
                  <div className="space-y-3">
                    {/* Region Selector: Nigeria vs Canada */}
                    <div className="flex gap-1.5 bg-zinc-950 p-1 rounded-2xl border border-zinc-800 text-[10px] font-bold">
                      <button
                        type="button"
                        onClick={() => setBizRegion('nigeria')}
                        className={`flex-1 py-1.5 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1 ${
                          bizRegion === 'nigeria'
                            ? 'bg-amber-500 text-black font-black shadow-md'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        <span>🇳🇬 Nigeria Enterprises</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setBizRegion('canada')}
                        className={`flex-1 py-1.5 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1 ${
                          bizRegion === 'canada'
                            ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white font-black shadow-md'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        <span>🇨🇦 Canada Ventures</span>
                        <span className="text-[8px] px-1 py-0.2 bg-red-950 text-red-300 rounded border border-red-500/40">CAD</span>
                      </button>
                    </div>

                    {bizRegion === 'canada' ? (
                      /* ================= CANADIAN VENTURES (CAD) ================= */
                      <div className="space-y-2.5">
                        <div className="p-2.5 rounded-xl bg-red-950/40 border border-red-500/30 flex items-center justify-between text-[10px]">
                          <span className="text-red-300 font-bold flex items-center gap-1.5">
                            <span>🍁</span>
                            <span>Corporations Canada & TSX Venture Hub</span>
                          </span>
                          <span className="text-zinc-400 font-mono">
                            Canadian Bank: <strong className="text-white">${(userProfile?.bankCAD || 0).toLocaleString()} CAD</strong>
                          </span>
                        </div>

                        {CANADA_BUSINESSES.map((biz) => {
                          const userCad = userProfile?.bankCAD || 0;
                          return (
                            <div key={biz.id} className="p-3.5 rounded-2xl bg-zinc-950/90 border border-red-500/30 space-y-2 shadow-md">
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-2xl">{biz.icon}</span>
                                   <div>
                                    <div className="text-xs font-black text-white">{biz.name}</div>
                                    <div className="text-[10px] text-red-400 font-mono">📍 {biz.city} · Canadian Enterprise</div>
                                  </div>
                                </div>
                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold border border-emerald-500/40">
                                  +${biz.dailyProfitCAD.toLocaleString()} CAD/day
                                </span>
                              </div>

                              <p className="text-[10px] text-zinc-300 leading-relaxed">{biz.desc}</p>

                              <div className="flex items-center justify-between pt-1.5 border-t border-zinc-900">
                                <span className="text-xs font-mono font-bold text-amber-300">
                                  ${biz.costCAD.toLocaleString()} CAD
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (userCad < biz.costCAD) {
                                      onShowToast(`Insufficient CAD funds! Requires $${biz.costCAD.toLocaleString()} CAD. Convert in Naija Pay.`);
                                      triggerSound?.('alert');
                                      return;
                                    }

                                    if (userProfile) {
                                      userProfile.bankCAD = userCad - biz.costCAD;
                                      const newVenture: BusinessVenture = {
                                        id: `biz_can_${Date.now()}`,
                                        typeId: biz.id,
                                        typeName: biz.name,
                                        name: biz.name,
                                        dailyRevenueNGN: Math.round(biz.dailyProfitCAD * 960.54),
                                        level: 1,
                                        registeredDate: new Date().toLocaleDateString('en-CA'),
                                      };
                                      if (!Array.isArray(userProfile.ownedBusinesses)) userProfile.ownedBusinesses = [];
                                      userProfile.ownedBusinesses.push(newVenture);

                                      if (!Array.isArray(userProfile.receipts)) userProfile.receipts = [];
                                      userProfile.receipts.unshift({
                                        id: `BIZ_CAN_${Date.now()}`,
                                        title: `Acquired: ${biz.name}`,
                                        category: 'business',
                                        amount: biz.costCAD,
                                        date: new Date().toLocaleDateString('en-CA'),
                                        type: 'debit',
                                        currency: 'CAD',
                                      });
                                    }

                                    onShowToast(`🍁 Acquired ${biz.name} (-$${biz.costCAD.toLocaleString()} CAD)! Generating +$${biz.dailyProfitCAD} CAD/day!`);
                                    triggerSound?.('success');
                                  }}
                                  className="px-3.5 py-1.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white font-black text-[10px] rounded-xl cursor-pointer shadow-md"
                                >
                                  Acquire (${biz.costCAD.toLocaleString()} CAD)
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <>
                        {/* State Filter Tabs */}
                        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                          {['all', 'lagos', 'abuja', 'imo', 'rivers', 'kano'].map((st) => (
                            <button
                              key={st}
                              type="button"
                              onClick={() => setBizStateFilter(st)}
                              className={`px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase transition-all whitespace-nowrap cursor-pointer ${
                                bizStateFilter === st ? 'bg-amber-500 text-black font-black' : 'bg-zinc-900/80 text-zinc-400 hover:text-white'
                              }`}
                            >
                              {st === 'all' ? 'All States' : st}
                            </button>
                          ))}
                        </div>

                    {/* Register New Venture Form */}
                    <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-3 space-y-2">
                      <span className="text-[10px] font-bold text-amber-400 uppercase">Incorporate New Venture</span>
                      <input
                        type="text"
                        placeholder="Enter Enterprise Name..."
                        value={newBizName}
                        onChange={(e) => setNewBizName(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-white"
                      />
                      <select
                        value={selectedBizType}
                        onChange={(e) => setSelectedBizType(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-white"
                      >
                        {filteredBusinesses.map((b) => (
                          <option key={b.typeId} value={b.typeId}>
                            {b.name} ({b.stateName}) — {formatNaira(b.costNGN)}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={handleRegisterBusiness}
                        className="w-full py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs rounded-xl cursor-pointer"
                      >
                        Register Venture
                      </button>
                    </div>

                    {/* Catalog List */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold">
                        Available Ventures ({filteredBusinesses.length} Options)
                      </span>
                      {filteredBusinesses.map((biz) => (
                        <div key={biz.typeId} className="p-3 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-1.5">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{biz.icon}</span>
                              <div>
                                <div className="text-xs font-bold text-white">{biz.name}</div>
                                <div className="text-[10px] text-amber-400/90 font-mono">📍 {biz.stateName}</div>
                              </div>
                            </div>
                            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold">
                              +{formatNaira(biz.dailyProfitNGN)}/day
                            </span>
                          </div>
                          <p className="text-[10px] text-zinc-400">{biz.desc}</p>
                          <div className="flex items-center justify-between pt-1 border-t border-zinc-900">
                            <span className="text-xs font-mono font-bold text-amber-300">{formatNaira(biz.costNGN)}</span>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedBizType(biz.typeId);
                                handleRegisterBusiness();
                              }}
                              className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-black font-black text-[10px] rounded-lg cursor-pointer"
                            >
                              Acquire
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* =============================================================
            3. BANKING APP (NAIJA PAY - MULTI-COUNTRY ACCOUNTS: NIGERIA & CANADA)
                ============================================================= */}
            {currentApp === 'banking' && (
              <div className="space-y-4">
                {/* Top Multi-Country Account Selector */}
                <div className="space-y-1">
                  <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
                    Global Bank Account & Jurisdiction:
                  </span>
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    {[
                      { id: 'nigeria', label: '🇳🇬 Nigeria', currency: 'NGN (₦)', status: 'active' },
                      { id: 'canada', label: '🇨🇦 Canada', currency: 'CAD ($)', status: 'active' },
                      { id: 'uk', label: '🇬🇧 UK', currency: 'GBP (£)', status: 'soon' },
                      { id: 'usa', label: '🇺🇸 USA', currency: 'USD ($)', status: 'soon' },
                      { id: 'uae', label: '🇦🇪 UAE', currency: 'AED (د.إ)', status: 'soon' },
                    ].map((cty) => {
                      const isSelected = bankCountry === cty.id;
                      const isSoon = cty.status === 'soon';
                      return (
                        <button
                          key={cty.id}
                          type="button"
                          onClick={() => {
                            if (isSoon) {
                              onShowToast(`${cty.label} foreign bank account is COMING SOON! Central bank clearance in progress.`);
                              return;
                            }
                            setBankCountry(cty.id as any);
                            triggerSound?.('coin');
                          }}
                          className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
                            isSelected
                              ? cty.id === 'canada'
                                ? 'bg-gradient-to-r from-red-600 via-rose-600 to-red-800 text-white border-red-400 shadow-md font-black'
                                : 'bg-emerald-500 text-black border-emerald-400 shadow-md font-black'
                              : isSoon
                              ? 'bg-zinc-900/60 text-zinc-500 border-zinc-800'
                              : 'bg-zinc-900 text-zinc-300 border-zinc-700 hover:border-zinc-500'
                          }`}
                        >
                          <span>{cty.label}</span>
                          {isSoon && (
                            <span className="text-[8px] px-1 py-0.2 rounded bg-zinc-800 text-zinc-400 uppercase font-mono">
                              Soon
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ======================= NIGERIA ACCOUNT UI ======================= */}
                {bankCountry === 'nigeria' && (
                  <>
                    <div className="bg-gradient-to-br from-emerald-900/90 via-teal-950 to-zinc-950 border border-emerald-500/50 rounded-2xl p-4 shadow-xl relative overflow-hidden">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-emerald-300 font-mono uppercase font-bold">Nigerian Liquid Balance</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-mono font-black border border-emerald-500/40">
                          CBN · NDIC Insured
                        </span>
                      </div>
                      <div className="mt-1">
                        <div className="text-lg sm:text-xl font-mono font-black text-white leading-tight break-all">
                          ₦{formatFullNumberDigits(checkIsOwner(userProfile) ? 9.99e23 : moneyNGN)}
                        </div>
                        <div className="text-[10px] font-bold text-emerald-300/90 font-mono mt-0.5">
                          ({formatNaira(checkIsOwner(userProfile) ? 9.99e23 : moneyNGN)})
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-emerald-500/20 text-[10px] text-zinc-400">
                        <span>NUBAN: 0182948291 · Zenith/Access Gateway</span>
                        <button
                          type="button"
                          onClick={() => {
                            setFxDirection('ngn_to_cad');
                            setFxAmount(115000);
                            setFxModalOpen(true);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 font-bold text-[9px] cursor-pointer flex items-center gap-1"
                        >
                          <span>💱</span>
                          <span>Transfer to Canada (CAD)</span>
                        </button>
                      </div>
                    </div>

                    {/* Sub-tabs */}
                    <div className={`grid ${((userProfile?.loanBalanceNGN || 0) > 0) ? 'grid-cols-4' : 'grid-cols-3'} gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-[10px] font-bold`}>
                      {(['home', 'transfer', 'savings'] as const).map((tab) => (
                        <button
                          key={tab}
                          type="button"
                          onClick={() => setBankTab(tab)}
                          className={`py-1 rounded-lg uppercase cursor-pointer ${
                            bankTab === tab ? 'bg-emerald-500 text-black font-black' : 'text-zinc-400 hover:text-white'
                          }`}
                        >
                          {tab}
                        </button>
                      ))}
                      {((userProfile?.loanBalanceNGN || 0) > 0) && (
                        <button
                          type="button"
                          onClick={() => setBankTab('repay_loan')}
                          className={`py-1 rounded-lg uppercase cursor-pointer ${
                            bankTab === 'repay_loan' ? 'bg-amber-500 text-black font-black' : 'text-amber-400 hover:text-amber-300'
                          }`}
                        >
                          Repay Loan
                        </button>
                      )}
                    </div>

                    {bankTab === 'home' && (
                      <div className="space-y-3">
                        {((userProfile?.loanBalanceNGN || 0) > 0) && (
                          <div className="p-3 rounded-2xl bg-amber-950/80 border border-amber-500/50 flex items-center justify-between">
                            <div>
                              <div className="text-xs font-black text-amber-300">Outstanding Starter Loan</div>
                              <div className="text-[10px] text-zinc-300">Remaining to settle: {formatFullNairaNumber(userProfile?.loanBalanceNGN || 0)}</div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setBankTab('repay_loan')}
                              className="px-2.5 py-1 rounded-lg bg-amber-500 text-black font-black text-[10px] cursor-pointer"
                            >
                              Repay Now
                            </button>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold">Recent Ledger Statements</span>
                          <span className="text-[9px] font-mono text-emerald-400 font-bold">Verified Real Transactions</span>
                        </div>

                        {/* Complete Ledger Statements: guaranteed starter fund + negative debits / positive credits */}
                        <div className="space-y-2">
                          {(() => {
                            const rawList = [...(userProfile?.receipts || [])];
                            const hasStarter = rawList.some(
                              (r) => r.category === 'starter' || r.id === 'rcpt_welcome' || r.title.toLowerCase().includes('starter') || r.title.toLowerCase().includes('welcome grant')
                            );
                            if (!hasStarter) {
                              const seedAmount = userProfile?.socialClass === 'nepo' ? 2250000 : userProfile?.socialClass === 'mapo' ? 900000 : 250000;
                              rawList.push({
                                id: 'rcpt_starter_default',
                                title: `Starter Fund Allocation (${(userProfile?.socialClass || 'LAPO').toUpperCase()} Seed)`,
                                category: 'starter',
                                amount: seedAmount,
                                date: userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString() : 'Account Opening',
                                type: 'credit',
                                currency: 'NGN',
                              });
                            }

                            return rawList.slice(0, 8).map((r) => {
                              const isCredit = r.type === 'credit';
                              const formattedAmt = isCredit
                                ? `(+${r.currency === 'CAD' ? '$' : '₦'}${r.amount.toLocaleString()})`
                                : `(-${r.currency === 'CAD' ? '$' : '₦'}${r.amount.toLocaleString()})`;

                              return (
                                <div key={r.id} className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 flex justify-between items-center text-xs">
                                  <div>
                                    <div className="font-bold text-white flex items-center gap-1.5">
                                      <span>{r.title}</span>
                                      {r.category === 'starter' && (
                                        <span className="text-[8px] px-1 rounded bg-amber-500/20 text-amber-300 font-mono font-bold">
                                          SEED FUND
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-[10px] text-zinc-500">{r.date} · {r.referenceNo || 'Settled'}</div>
                                  </div>
                                  <span className={`font-mono font-black text-xs ${isCredit ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {formattedAmt}
                                  </span>
                                </div>
                              );
                            });
                          })()}
                        </div>
                      </div>
                    )}

                    {bankTab === 'transfer' && (
                      <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-white">NIP Interbank Instant Transfer (NGN)</span>
                          <span className="text-[10px] text-emerald-400 font-mono font-bold">24/7 Live Settlement</span>
                        </div>

                        {/* Real Registered Citizens Chips */}
                        {(() => {
                          const realCitizens = Object.entries(getStoredUsers()).filter(
                            ([uname]) => uname !== userProfile?.username?.toLowerCase().trim()
                          );
                          if (realCitizens.length > 0) {
                            return (
                              <div className="space-y-1">
                                <span className="text-[10px] text-zinc-400 font-bold uppercase block">Active Registered Citizens:</span>
                                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                                  {realCitizens.slice(0, 8).map(([uname, udata]) => (
                                    <button
                                      key={uname}
                                      type="button"
                                      onClick={() => setTransferUser(udata.profile.username || uname)}
                                      className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                                        transferUser.toLowerCase().trim() === uname
                                          ? 'bg-emerald-500 text-black border-emerald-400 font-black'
                                          : 'bg-zinc-900 text-zinc-300 border-zinc-700 hover:border-zinc-500'
                                      }`}
                                    >
                                      <span>🇳🇬</span>
                                      <span>@{udata.profile.username || uname}</span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            );
                          }
                          return null;
                        })()}

                        <div className="space-y-1">
                          <span className="text-[10px] text-zinc-400 font-mono font-bold uppercase">Recipient Citizen Username</span>
                          <input
                            type="text"
                            placeholder="Enter real citizen username (e.g. chiboy_52)..."
                            value={transferUser}
                            onChange={(e) => setTransferUser(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white"
                          />
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] text-zinc-400 font-mono font-bold uppercase">Transfer Amount (NGN ₦)</span>
                          <input
                            type="number"
                            placeholder="Amount in NGN..."
                            value={transferAmount}
                            onChange={(e) => setTransferAmount(Number(e.target.value))}
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={async () => {
                            const cleanRecipient = transferUser.trim().toLowerCase().replace(/^@/, '');
                            if (!cleanRecipient) {
                              onShowToast('Please enter recipient citizen username!');
                              return;
                            }
                            if (moneyNGN < transferAmount) {
                              onShowToast('Insufficient funds in your Nigerian account!');
                              triggerSound?.('alert');
                              return;
                            }
                            if (transferAmount <= 0) {
                              onShowToast('Please enter a valid transfer amount!');
                              return;
                            }

                            const storedUsers = getStoredUsers();
                            let recipientRecord = storedUsers[cleanRecipient];
                            if (!recipientRecord) {
                              try {
                                const unameSnap = await getDoc(doc(db, 'usernames', cleanRecipient));
                                if (unameSnap.exists()) {
                                  recipientRecord = { profile: { username: unameSnap.data().username } } as any;
                                }
                              } catch {}
                            }
                            if (!recipientRecord) {
                              onShowToast(`Citizen @${cleanRecipient} not found. Transfers can only be made to real registered citizens!`);
                              triggerSound?.('alert');
                              return;
                            }

                            // Try API transfer
                            try {
                              await fetch('/api/bank/transfer', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  senderUsername: userProfile.username,
                                  recipientUsername: cleanRecipient,
                                  amount: transferAmount,
                                  currency: 'NGN',
                                }),
                              });
                            } catch {}

                            onUpdateMoney(-transferAmount);

                            const txRef = `TX_${Date.now()}`;
                            const nowStr = new Date().toLocaleDateString('en-GB');

                            if (userProfile) {
                              if (!Array.isArray(userProfile.receipts)) userProfile.receipts = [];
                              userProfile.receipts.unshift({
                                id: txRef,
                                title: `Transfer to @${cleanRecipient}`,
                                category: 'transfer',
                                amount: transferAmount,
                                date: nowStr,
                                type: 'debit',
                                currency: 'NGN',
                                recipientOrSender: cleanRecipient,
                              });
                            }

                            if (recipientRecord && recipientRecord.profile) {
                              recipientRecord.profile.bankNaira = (recipientRecord.profile.bankNaira || 0) + transferAmount;
                              if (!Array.isArray(recipientRecord.profile.receipts)) recipientRecord.profile.receipts = [];
                              recipientRecord.profile.receipts.unshift({
                                id: `RX_${Date.now()}`,
                                title: `Transfer from @${userProfile.username}`,
                                category: 'transfer',
                                amount: transferAmount,
                                date: nowStr,
                                type: 'credit',
                                currency: 'NGN',
                                recipientOrSender: userProfile.username,
                              });
                              storedUsers[cleanRecipient] = recipientRecord;
                              if (userProfile && storedUsers[userProfile.username.toLowerCase().trim()]) {
                                storedUsers[userProfile.username.toLowerCase().trim()].profile = {
                                  ...storedUsers[userProfile.username.toLowerCase().trim()].profile,
                                  ...userProfile,
                                  bankNaira: Math.max(0, moneyNGN - transferAmount),
                                };
                              }
                              try {
                                localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(storedUsers));
                                if (userProfile) saveSession(userProfile);
                                const bc = new BroadcastChannel('naija_life_bank_transfer');
                                bc.postMessage({
                                  type: 'TRANSFER_COMPLETE',
                                  sender: userProfile?.username,
                                  recipient: cleanRecipient,
                                  amount: transferAmount,
                                  currency: 'NGN',
                                });
                                bc.close();
                              } catch {}
                            }

                            onShowToast(`💸 Transferred (-₦${transferAmount.toLocaleString()}) to @${cleanRecipient}!`);
                            triggerSound?.('coin');
                            setTransferUser('');
                          }}
                          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-black text-xs cursor-pointer shadow-md transition-all"
                        >
                          Send Transfer (-₦{transferAmount ? transferAmount.toLocaleString() : '0'})
                        </button>
                      </div>
                    )}

                    {bankTab === 'savings' && (
                      <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-4 space-y-3">
                        <div className="text-center space-y-1">
                          <span className="text-xs font-bold text-emerald-400 block">High-Yield Target Lock Savings</span>
                          <p className="text-[10px] text-zinc-400">Lock funds to compound 18% annual return and protect capital.</p>
                        </div>
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold">Select Amount to Put In</span>
                          <input
                            type="number"
                            placeholder="Enter amount to save in NGN..."
                            value={savingsInputAmount}
                            onChange={(e) => setSavingsInputAmount(Number(e.target.value))}
                            className="w-full bg-zinc-900 border border-emerald-500/40 rounded-xl px-3 py-2 text-xs text-white font-mono"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (!savingsInputAmount || savingsInputAmount <= 0) {
                              onShowToast('Please enter a valid amount to save!');
                              return;
                            }
                            if (moneyNGN < savingsInputAmount) {
                              onShowToast(`Insufficient funds! Your balance is ${formatFullNairaNumber(moneyNGN)}`);
                              triggerSound?.('alert');
                              return;
                            }
                            onUpdateMoney(-savingsInputAmount);
                            if (userProfile) {
                              userProfile.savingsBalanceNGN = (userProfile.savingsBalanceNGN || 0) + savingsInputAmount;
                            }
                            onShowToast(`🔒 Successfully locked ₦${savingsInputAmount.toLocaleString()} into 18% Target Savings!`);
                            triggerSound?.('coin');
                          }}
                          className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-black rounded-xl text-xs cursor-pointer shadow-lg active:scale-95 transition-all"
                        >
                          Lock ₦{savingsInputAmount.toLocaleString()} into Savings
                        </button>
                      </div>
                    )}

                    {bankTab === 'repay_loan' && (
                      <div className="bg-zinc-950/80 border border-amber-500/50 rounded-2xl p-4 space-y-3">
                        <div className="text-center space-y-1">
                          <span className="text-xs font-bold text-amber-300 block">Settle Starter Class Loan</span>
                          <p className="text-[10px] text-zinc-400">Pay off your initial social class overdraft loan directly from your liquid balance.</p>
                          <div className="text-xl font-mono font-black text-rose-400 mt-2">
                            {formatFullNairaNumber(userProfile?.loanBalanceNGN || 0)}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const currentLoan = userProfile?.loanBalanceNGN || 0;
                              const toPay = Math.min(moneyNGN, repayLoanAmount || currentLoan);
                              if (toPay <= 0) {
                                onShowToast('Insufficient funds to make loan repayment!');
                                triggerSound?.('alert');
                                return;
                              }
                              onUpdateMoney(-toPay);
                              if (userProfile) {
                                userProfile.loanBalanceNGN = Math.max(0, currentLoan - toPay);
                              }
                              onShowToast(`🎉 Paid ${formatFullNairaNumber(toPay)} towards starter loan!`);
                              triggerSound?.('success');
                            }}
                            className="flex-1 py-2 rounded-xl bg-amber-500 text-black font-black text-xs cursor-pointer"
                          >
                            Repay Amount
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const currentLoan = userProfile?.loanBalanceNGN || 0;
                              if (moneyNGN < currentLoan) {
                                onShowToast(`Insufficient funds to clear entire loan of ${formatFullNairaNumber(currentLoan)}!`);
                                triggerSound?.('alert');
                                return;
                              }
                              onUpdateMoney(-currentLoan);
                              if (userProfile) {
                                userProfile.loanBalanceNGN = 0;
                              }
                              onShowToast(`🏆 Zero debt! You have completely cleared your starter loan.`);
                              triggerSound?.('success');
                            }}
                            className="flex-1 py-2 rounded-xl bg-emerald-500 text-black font-black text-xs cursor-pointer"
                          >
                            Pay in Full
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* ======================= CANADA ACCOUNT UI ======================= */}
                {bankCountry === 'canada' && (
                  <>
                    <div className="bg-gradient-to-br from-red-950/90 via-zinc-950 to-neutral-900 border-2 border-red-500/60 rounded-2xl p-4 shadow-xl relative overflow-hidden">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-red-300 font-mono uppercase font-bold flex items-center gap-1">
                          <span>🍁</span>
                          <span>Canadian Liquid Chequing Balance</span>
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 text-[9px] font-mono font-black border border-red-500/40">
                          RBC & BMO · CDIC Insured
                        </span>
                      </div>
                      <div className="mt-1">
                        <div className="text-lg sm:text-xl font-mono font-black text-white leading-tight break-all">
                          ${formatFullNumberDigits(checkIsOwner(userProfile) ? 9.99e23 : (userProfile?.bankCAD || 0))} CAD
                        </div>
                        <div className="text-[10px] font-bold text-red-300/90 font-mono mt-0.5">
                          ({formatCAD(checkIsOwner(userProfile) ? 9.99e23 : (userProfile?.bankCAD || 0))})
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-red-500/20 text-[10px] text-zinc-400">
                        <span>Transit No: 00392 · Royal Bank of Canada (RBC)</span>
                        <button
                          type="button"
                          onClick={() => {
                            setFxDirection('cad_to_ngn');
                            setFxAmount(100);
                            setFxModalOpen(true);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-400/40 font-bold text-[9px] cursor-pointer flex items-center gap-1"
                        >
                          <span>💱</span>
                          <span>Transfer to Nigeria (NGN)</span>
                        </button>
                      </div>
                    </div>

                    {/* Sub-tabs for Canada */}
                    <div className="grid grid-cols-3 gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-[10px] font-bold">
                      {(['home', 'transfer', 'savings'] as const).map((tab) => (
                        <button
                          key={tab}
                          type="button"
                          onClick={() => setBankTab(tab)}
                          className={`py-1 rounded-lg uppercase cursor-pointer ${
                            bankTab === tab ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white font-black' : 'text-zinc-400 hover:text-white'
                          }`}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>

                    {bankTab === 'home' && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold">Canadian Ledger Statements</span>
                          <span className="text-[9px] font-mono text-red-400 font-bold">CAD Interac & Wire Records</span>
                        </div>

                        <div className="space-y-2">
                          {(() => {
                            const rawList = (userProfile?.receipts || []).filter((r) => r.currency === 'CAD');
                            if (rawList.length === 0) {
                              return (
                                <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 text-center text-xs text-zinc-500">
                                  No Canadian dollar transactions recorded yet. Use the Currency Transfer button to convert NGN into CAD!
                                </div>
                              );
                            }

                            return rawList.map((r) => {
                              const isCredit = r.type === 'credit';
                              const formattedAmt = isCredit
                                ? `(+${r.amount.toLocaleString()} CAD)`
                                : `(-${r.amount.toLocaleString()} CAD)`;

                              return (
                                <div key={r.id} className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 flex justify-between items-center text-xs">
                                  <div>
                                    <div className="font-bold text-white">{r.title}</div>
                                    <div className="text-[10px] text-zinc-500">{r.date} · Interac e-Transfer</div>
                                  </div>
                                  <span className={`font-mono font-black text-xs ${isCredit ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {formattedAmt}
                                  </span>
                                </div>
                              );
                            });
                          })()}
                        </div>
                      </div>
                    )}

                    {bankTab === 'transfer' && (
                      <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-white">Interac e-Transfer (Canada CAD $)</span>
                          <span className="text-[10px] text-red-400 font-mono font-bold">Direct to Citizen's CAD Account</span>
                        </div>

                        {/* Real Registered Citizens Chips */}
                        {(() => {
                          const realCitizens = Object.entries(getStoredUsers()).filter(
                            ([uname]) => uname !== userProfile?.username?.toLowerCase().trim()
                          );
                          if (realCitizens.length > 0) {
                            return (
                              <div className="space-y-1">
                                <span className="text-[10px] text-zinc-400 font-bold uppercase block">Send to Real Citizen:</span>
                                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                                  {realCitizens.slice(0, 8).map(([uname, udata]) => (
                                    <button
                                      key={uname}
                                      type="button"
                                      onClick={() => setCadTransferUser(udata.profile.username || uname)}
                                      className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                                        cadTransferUser.toLowerCase().trim() === uname
                                          ? 'bg-red-600 text-white border-red-400 font-black'
                                          : 'bg-zinc-900 text-zinc-300 border-zinc-700 hover:border-zinc-500'
                                      }`}
                                    >
                                      <span>🇨🇦</span>
                                      <span>@{udata.profile.username || uname}</span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            );
                          }
                          return null;
                        })()}

                        <div className="space-y-1">
                          <span className="text-[10px] text-zinc-400 font-mono font-bold uppercase">Recipient Citizen Username</span>
                          <input
                            type="text"
                            placeholder="Recipient citizen username..."
                            value={cadTransferUser}
                            onChange={(e) => setCadTransferUser(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white"
                          />
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] text-zinc-400 font-mono font-bold uppercase">Transfer Amount ($ CAD)</span>
                          <input
                            type="number"
                            placeholder="Amount in Canadian Dollars ($)..."
                            value={cadTransferAmount}
                            onChange={(e) => setCadTransferAmount(Number(e.target.value))}
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={async () => {
                            const cleanRecipient = cadTransferUser.trim().toLowerCase().replace(/^@/, '');
                            if (!cleanRecipient) {
                              onShowToast('Please enter recipient citizen username!');
                              return;
                            }
                            const senderCad = userProfile?.bankCAD || 0;
                            if (senderCad < cadTransferAmount) {
                              onShowToast(`Insufficient funds! Your Canadian balance is $${senderCad.toLocaleString()} CAD.`);
                              triggerSound?.('alert');
                              return;
                            }
                            if (cadTransferAmount <= 0) {
                              onShowToast('Please enter a valid transfer amount in CAD!');
                              return;
                            }

                            const storedUsers = getStoredUsers();
                            let recipientRecord = storedUsers[cleanRecipient];
                            if (!recipientRecord) {
                              try {
                                const unameSnap = await getDoc(doc(db, 'usernames', cleanRecipient));
                                if (unameSnap.exists()) {
                                  recipientRecord = { profile: { username: unameSnap.data().username } } as any;
                                }
                              } catch {}
                            }
                            if (!recipientRecord) {
                              onShowToast(`Citizen @${cleanRecipient} not found. Transfers can only be made to real registered citizens!`);
                              triggerSound?.('alert');
                              return;
                            }

                            // Try API transfer
                            try {
                              await fetch('/api/bank/transfer', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  senderUsername: userProfile.username,
                                  recipientUsername: cleanRecipient,
                                  amount: cadTransferAmount,
                                  currency: 'CAD',
                                }),
                              });
                            } catch {}

                            // Deduct from sender CAD
                            if (userProfile) {
                              userProfile.bankCAD = senderCad - cadTransferAmount;
                              if (!Array.isArray(userProfile.receipts)) userProfile.receipts = [];
                              userProfile.receipts.unshift({
                                id: `TX_CAD_${Date.now()}`,
                                title: `Interac Transfer to @${cleanRecipient}`,
                                category: 'transfer',
                                amount: cadTransferAmount,
                                date: new Date().toLocaleDateString('en-CA'),
                                type: 'debit',
                                currency: 'CAD',
                                recipientOrSender: cleanRecipient,
                              });
                            }

                            // Deposit directly into recipient's Canadian account (bankCAD)
                            if (recipientRecord && recipientRecord.profile) {
                              recipientRecord.profile.bankCAD = (recipientRecord.profile.bankCAD || 0) + cadTransferAmount;
                              if (!Array.isArray(recipientRecord.profile.receipts)) recipientRecord.profile.receipts = [];
                              recipientRecord.profile.receipts.unshift({
                                id: `RX_CAD_${Date.now()}`,
                                title: `Interac Transfer from @${userProfile.username}`,
                                category: 'transfer',
                                amount: cadTransferAmount,
                                date: new Date().toLocaleDateString('en-CA'),
                                type: 'credit',
                                currency: 'CAD',
                                recipientOrSender: userProfile.username,
                              });
                              storedUsers[cleanRecipient] = recipientRecord;
                              if (userProfile && storedUsers[userProfile.username.toLowerCase().trim()]) {
                                storedUsers[userProfile.username.toLowerCase().trim()].profile = {
                                  ...storedUsers[userProfile.username.toLowerCase().trim()].profile,
                                  ...userProfile,
                                  bankCAD: Math.max(0, senderCad - cadTransferAmount),
                                };
                              }
                              try {
                                localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(storedUsers));
                                if (userProfile) saveSession(userProfile);
                                const bc = new BroadcastChannel('naija_life_bank_transfer');
                                bc.postMessage({
                                  type: 'TRANSFER_COMPLETE',
                                  sender: userProfile?.username,
                                  recipient: cleanRecipient,
                                  amount: cadTransferAmount,
                                  currency: 'CAD',
                                });
                                bc.close();
                              } catch {}
                            }

                            onShowToast(`💸 Transferred (-$${cadTransferAmount.toLocaleString()} CAD) to @${cleanRecipient}'s Canadian account!`);
                            triggerSound?.('coin');
                            setCadTransferUser('');
                          }}
                          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs cursor-pointer shadow-md transition-all"
                        >
                          Send Interac (-${cadTransferAmount ? cadTransferAmount.toLocaleString() : '0'} CAD)
                        </button>
                      </div>
                    )}

                    {bankTab === 'savings' && (
                      <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-4 space-y-3">
                        <div className="text-center space-y-1">
                          <span className="text-xs font-bold text-red-400 block">Canadian High-Yield TFSA / RRSP Savings</span>
                          <p className="text-[10px] text-zinc-400">Lock Canadian Dollars in Tax-Free Savings Account yielding 6.5% compound APY.</p>
                        </div>
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold">Deposit to TFSA ($ CAD)</span>
                          <input
                            type="number"
                            placeholder="Amount to lock in CAD..."
                            value={cadSavingsInput}
                            onChange={(e) => setCadSavingsInput(Number(e.target.value))}
                            className="w-full bg-zinc-900 border border-red-500/40 rounded-xl px-3 py-2 text-xs text-white font-mono"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const senderCad = userProfile?.bankCAD || 0;
                            if (senderCad < cadSavingsInput || cadSavingsInput <= 0) {
                              onShowToast(`Insufficient CAD funds! Your balance is $${senderCad.toLocaleString()} CAD.`);
                              triggerSound?.('alert');
                              return;
                            }
                            if (userProfile) {
                              userProfile.bankCAD = senderCad - cadSavingsInput;
                              userProfile.savingsCAD = (userProfile.savingsCAD || 0) + cadSavingsInput;
                            }
                            onShowToast(`🔒 Deposited $${cadSavingsInput.toLocaleString()} CAD into TFSA Tax-Free Savings!`);
                            triggerSound?.('coin');
                          }}
                          className="w-full py-2.5 bg-gradient-to-r from-red-600 to-rose-600 text-white font-black rounded-xl text-xs cursor-pointer shadow-lg active:scale-95 transition-all"
                        >
                          Lock ${cadSavingsInput.toLocaleString()} CAD into TFSA
                        </button>
                      </div>
                    )}
                  </>
                )}

                {/* FX Currency Conversion Modal (NGN <--> CAD) */}
                {fxModalOpen && (
                  <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3">
                    <div className="w-full max-w-sm bg-zinc-950 border-2 border-emerald-500/60 rounded-3xl p-5 shadow-[0_0_50px_rgba(16,185,129,0.3)] text-left space-y-4">
                      <div className="flex items-start justify-between pb-3 border-b border-zinc-800">
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl">💱</span>
                          <div>
                            <span className="text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-widest block">
                              Cross-Border FX Exchange
                            </span>
                            <h4 className="text-xs font-black text-white">Naija Pay FX Corridor</h4>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFxModalOpen(false)}
                          className="text-zinc-500 hover:text-white p-1 rounded-xl"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Direction selector */}
                      <div className="grid grid-cols-2 gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800 text-[10px] font-bold">
                        <button
                          type="button"
                          onClick={() => setFxDirection('ngn_to_cad')}
                          className={`py-1.5 rounded-lg cursor-pointer ${
                            fxDirection === 'ngn_to_cad' ? 'bg-emerald-500 text-black font-black' : 'text-zinc-400'
                          }`}
                        >
                          🇳🇬 NGN ➔ 🇨🇦 CAD
                        </button>
                        <button
                          type="button"
                          onClick={() => setFxDirection('cad_to_ngn')}
                          className={`py-1.5 rounded-lg cursor-pointer ${
                            fxDirection === 'cad_to_ngn' ? 'bg-red-600 text-white font-black' : 'text-zinc-400'
                          }`}
                        >
                          🇨🇦 CAD ➔ 🇳🇬 NGN
                        </button>
                      </div>

                      <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-[10px] font-mono space-y-1">
                        <div className="flex justify-between text-zinc-400">
                          <span>Real Exchange Rate:</span>
                          <span className="text-white font-bold">$1.00 CAD = ₦960.54 NGN</span>
                        </div>
                        <div className="flex justify-between text-zinc-400">
                          <span>Settlement Fee:</span>
                          <span className="text-emerald-400 font-bold">0.00 (Zero Surcharge)</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                          {fxDirection === 'ngn_to_cad' ? 'Amount to Convert (NGN ₦):' : 'Amount to Convert (CAD $):'}
                        </label>
                        <input
                          type="number"
                          value={fxAmount}
                          onChange={(e) => setFxAmount(Number(e.target.value))}
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                        />
                      </div>

                      {/* Calculated outcome */}
                      <div className="p-3 rounded-2xl bg-black/60 border border-white/10 text-center">
                        <span className="text-[10px] text-zinc-400 block">You will receive in destination account:</span>
                        <div className="text-lg font-mono font-black text-amber-300 mt-1">
                          {fxDirection === 'ngn_to_cad'
                            ? `$${(fxAmount / 960.54).toFixed(2)} CAD`
                            : `₦${Math.floor(fxAmount * 960.54).toLocaleString()} NGN`}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setFxModalOpen(false)}
                          className="flex-1 py-2 rounded-xl bg-zinc-900 text-zinc-400 text-xs font-bold"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (fxDirection === 'ngn_to_cad') {
                              if (moneyNGN < fxAmount || fxAmount <= 0) {
                                onShowToast('Insufficient NGN balance for currency exchange!');
                                triggerSound?.('alert');
                                return;
                              }
                              const receivedCAD = Math.round((fxAmount / 960.54) * 100) / 100;
                              onUpdateMoney(-fxAmount);
                              if (userProfile) {
                                userProfile.bankCAD = (userProfile.bankCAD || 0) + receivedCAD;
                                if (!Array.isArray(userProfile.receipts)) userProfile.receipts = [];
                                userProfile.receipts.unshift({
                                 id: `FX_OUT_${Date.now()}`,
                                  title: `FX Conversion to CAD Account`,
                                  category: 'transfer',
                                  amount: fxAmount,
                                  date: new Date().toLocaleDateString(),
                                  type: 'debit',
                                  currency: 'NGN',
                                });
                                userProfile.receipts.unshift({
                                  id: `FX_IN_${Date.now()}`,
                                  title: `FX Conversion from NGN`,
                                  category: 'transfer',
                                  amount: receivedCAD,
                                  date: new Date().toLocaleDateString(),
                                  type: 'credit',
                                  currency: 'CAD',
                                });
                              }
                              setFxModalOpen(false);
                              onShowToast(`💱 Exchanged ₦${fxAmount.toLocaleString()} NGN ➔ $${receivedCAD.toLocaleString()} CAD (Rate: ₦960.54)!`);
                              triggerSound?.('success');
                            } else {
                              const currentCad = userProfile?.bankCAD || 0;
                              if (currentCad < fxAmount || fxAmount <= 0) {
                                onShowToast('Insufficient CAD balance for currency exchange!');
                                triggerSound?.('alert');
                                return;
                              }
                              const receivedNGN = Math.floor(fxAmount * 960.54);
                              if (userProfile) {
                                userProfile.bankCAD = currentCad - fxAmount;
                                if (!Array.isArray(userProfile.receipts)) userProfile.receipts = [];
                                userProfile.receipts.unshift({
                                  id: `FX_CAD_OUT_${Date.now()}`,
                                  title: `FX Conversion to NGN Account`,
                                  category: 'transfer',
                                  amount: fxAmount,
                                  date: new Date().toLocaleDateString(),
                                  type: 'debit',
                                  currency: 'CAD',
                                });
                              }
                              onUpdateMoney(receivedNGN);
                              setFxModalOpen(false);
                              onShowToast(`💱 Exchanged $${fxAmount.toLocaleString()} CAD ➔ ₦${receivedNGN.toLocaleString()} NGN (Rate: ₦960.54)!`);
                              triggerSound?.('success');
                            }
                          }}
                          className="flex-1 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-black text-xs shadow-lg cursor-pointer hover:scale-105 active:scale-95 transition-all"
                        >
                          Execute Exchange
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* =============================================================
                4. JOBS APP (36 JOBS - GROUPED BY STATE)
                ============================================================= */}
            {currentApp === 'jobs' && (
              <div className="space-y-3">
                {/* Career Status & Sunday Payday Card */}
                <div className="bg-gradient-to-br from-blue-950 via-zinc-950 to-neutral-900 border-2 border-blue-500/50 rounded-2xl p-3.5 space-y-2.5 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-mono font-bold text-blue-400 uppercase tracking-widest block">
                        Professional Career Track
                      </span>
                      <h3 className="text-xs font-black text-white">
                        {currentJob ? currentJob.title : 'Unemployed / Free Agent'}
                      </h3>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[9px] font-mono font-black border border-blue-500/40">
                      RANK: {(userProfile?.jobRank || 'Apprentice').toUpperCase()}
                    </span>
                  </div>

                  {/* Career Ladder Progression */}
                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] font-mono">
                      <span className="text-zinc-400">Shifts Completed:</span>
                      <span className="text-amber-300 font-bold">{userProfile?.jobShiftsWorked || 0} Shifts</span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(
                            100,
                            ((userProfile?.jobShiftsWorked || 0) < 5
                              ? ((userProfile?.jobShiftsWorked || 0) / 5) * 100
                              : (userProfile?.jobShiftsWorked || 0) < 15
                              ? (((userProfile?.jobShiftsWorked || 0) - 5) / 10) * 100
                              : Math.min(100, (((userProfile?.jobShiftsWorked || 0) - 15) / 15) * 100))
                          )}%`,
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-[8px] font-mono text-zinc-500">
                      <span>Apprentice (0)</span>
                      <span>Associate (5)</span>
                      <span>Senior (15)</span>
                      <span>Manager (30)</span>
                    </div>
                  </div>

                  {/* Sunday Payday Banner */}
                  <div className="p-2 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-[9px] font-mono text-emerald-300 flex items-center gap-1.5">
                    <span>🗓️</span>
                    <span><strong>Sunday Payday:</strong> Weekly salaries deposit automatically into your bank every Sunday!</span>
                  </div>
                </div>

                {/* State Filter Tabs */}
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {[
                    { id: 'all', label: 'All Nigeria' },
                    { id: 'lagos', label: 'Lagos' },
                    { id: 'abuja', label: 'Abuja' },
                    { id: 'imo', label: 'Imo' },
                    { id: 'rivers', label: 'Rivers' },
                    { id: 'kano', label: 'Kano' },
                    { id: 'canada', label: '🇨🇦 Canada' },
                  ].map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setJobStateFilter(st.id)}
                      className={`px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase transition-all whitespace-nowrap cursor-pointer ${
                        jobStateFilter === st.id
                          ? st.id === 'canada'
                            ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white font-black shadow-md'
                            : 'bg-blue-500 text-white font-black shadow-md'
                          : 'bg-zinc-900/80 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>

                {jobStateFilter === 'canada' ? (
                  /* ================= CANADIAN JOBS (PAID IN CAD) ================= */
                  <div className="space-y-2">
                    <div className="p-2.5 rounded-xl bg-red-950/40 border border-red-500/30 flex items-center justify-between text-[10px]">
                      <div>
                        <span className="text-red-300 font-bold block">🍁 Canadian Employment & Labour Pool</span>
                        <span className="text-[9px] text-zinc-400">
                          Requires physical presence in Canada + 7-Day Work Permit. Salaries paid in CAD into Canadian bank!
                        </span>
                      </div>
                      <span className="text-red-300 font-mono font-bold shrink-0">
                        ${(userProfile?.bankCAD || 0).toLocaleString()} CAD
                      </span>
                    </div>

                    {CANADA_JOBS.map((j) => {
                      const rank = userProfile?.jobRank || 'Apprentice';
                      const multipliers: Record<string, number> = {
                        'Apprentice': 1.0,
                        'Junior': 1.0,
                        'Associate': 1.8,
                        'Senior': 3.5,
                        'Manager': 6.0,
                      };
                      const mult = multipliers[rank] || 1.0;
                      const effectiveSalaryCAD = Math.round(j.salaryCADWeekly * mult);
                      const shiftStipendCAD = Math.round(effectiveSalaryCAD / 7);

                      const hasValidWorkPermit = (userProfile?.ownedDocuments || []).some((d) => {
                        const isPermit = ['work_permit', 'pr_card', 'citizenship'].includes(d.type);
                        const isCan = d.country === 'Canada';
                        const isExp = d.isExpired || (d.expiresAtTimestamp ? Date.now() > d.expiresAtTimestamp : false);
                        return isPermit && isCan && !isExp;
                      });

                      const certReq = getJobCertificateRequirement(j.id, j.title, j.sector || 'commerce');
                      const hasCert = !certReq || completedCoursesState.includes(certReq.courseId) || (userProfile?.completedCourses || []).includes(certReq.courseId);

                      return (
                        <div key={j.id} className="p-3.5 rounded-2xl bg-zinc-950/90 border border-red-500/30 space-y-2 shadow-md">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="text-xs font-black text-white">{j.title}</div>
                              <div className="text-[10px] text-red-400 font-mono">
                                🏢 {j.employer} · 📍 {j.city}, {j.province}
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-mono font-black text-amber-300 block">
                                ${effectiveSalaryCAD.toLocaleString()} CAD/wk
                              </span>
                              <span className="text-[8px] font-mono text-zinc-400">Paid Sundays in CAD</span>
                            </div>
                          </div>

                          <p className="text-[10px] text-zinc-300 leading-relaxed">{j.desc}</p>

                          {/* University Degree Certificate Requirement Notice */}
                          {certReq && (
                            <div className={`p-2 rounded-xl flex items-center justify-between gap-2 border text-[10px] ${
                              hasCert ? 'bg-emerald-950/40 border-emerald-500/40' : 'bg-purple-950/40 border-purple-500/40'
                            }`}>
                              <div>
                                <span className={`font-bold flex items-center gap-1 ${hasCert ? 'text-emerald-300' : 'text-purple-300'}`}>
                                  <GraduationCap className="w-3.5 h-3.5" />
                                  <span>{hasCert ? '✓ Degree Verified:' : '📜 Degree Required:'} {certReq.courseName}</span>
                                </span>
                                <span className="text-[9px] text-zinc-400 font-mono block">
                                  {certReq.institution}
                                </span>
                              </div>
                              {!hasCert && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setAcademySearchQuery(certReq.courseName.split(' ')[0]);
                                    setCourseRegion('canada');
                                    setCurrentApp('courses');
                                    onShowToast(`🔍 Searching Academy for "${certReq.courseName}"...`);
                                    triggerSound?.('coin');
                                  }}
                                  className="px-2 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-[9px] shrink-0 cursor-pointer shadow"
                                >
                                  Search Academy
                                </button>
                              )}
                            </div>
                          )}

                          <div className="flex justify-between items-center pt-2 border-t border-zinc-900">
                            <span className="text-[9px] text-zinc-400 font-mono">
                              ⚡ Energy: {j.minEnergy}% · Shift: <strong className="text-emerald-400">+${shiftStipendCAD} CAD</strong>
                            </span>

                            {hasCert ? (
                              <button
                                type="button"
                                onClick={() => handleLaunchShift(j, true)}
                                className="px-3.5 py-1.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white font-black text-[10px] rounded-xl cursor-pointer shadow transition-all flex items-center gap-1.5 active:scale-95"
                              >
                                <span>💼</span>
                                <span>Work Shift (15 Tasks)</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  onShowToast(`📜 You must obtain a degree in ${certReq?.courseName} from the Academy first!`);
                                  triggerSound?.('alert');
                                }}
                                className="px-3 py-1.5 bg-zinc-800 text-zinc-500 font-bold text-[10px] rounded-xl cursor-not-allowed border border-zinc-700 flex items-center gap-1"
                              >
                                <span>🔒</span>
                                <span>Degree Required</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* ================= NIGERIA JOBS ================= */
                  <div className="space-y-2">
                    {filteredJobs.map((j) => {
                      const rank = userProfile?.jobRank || 'Apprentice';
                      const multipliers: Record<string, number> = {
                        'Apprentice': 1.0,
                        'Junior': 1.0,
                        'Associate': 1.8,
                        'Senior': 3.5,
                        'Manager': 6.0,
                      };
                      const mult = multipliers[rank] || 1.0;
                      const startingSalary = j.salaryNGN || 28000;
                      const effectiveSalary = Math.round(startingSalary * mult);
                      const shiftStipend = Math.round(effectiveSalary / 7);

                      const certReq = getJobCertificateRequirement(j.id, j.title, j.sector || 'commerce');
                      const hasCert = !certReq || completedCoursesState.includes(certReq.courseId) || (userProfile?.completedCourses || []).includes(certReq.courseId);

                      return (
                        <div key={j.id} className="p-3 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-1.5 shadow-md">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="text-xs font-bold text-white">{j.title}</div>
                              <div className="text-[10px] text-zinc-400">{j.company} · 📍 {j.stateName}</div>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-mono font-bold text-emerald-400 block">{formatNaira(effectiveSalary)}/wk</span>
                              <span className="text-[8px] font-mono text-zinc-500">Paid Sundays</span>
                            </div>
                          </div>
                          <p className="text-[10px] text-zinc-400 leading-relaxed">{j.desc}</p>

                          {/* University Degree Certificate Requirement Notice */}
                          {certReq && (
                            <div className={`p-2 rounded-xl flex items-center justify-between gap-2 border text-[10px] ${
                              hasCert ? 'bg-emerald-950/40 border-emerald-500/40' : 'bg-purple-950/40 border-purple-500/40'
                            }`}>
                              <div>
                                <span className={`font-bold flex items-center gap-1 ${hasCert ? 'text-emerald-300' : 'text-purple-300'}`}>
                                  <GraduationCap className="w-3.5 h-3.5" />
                                  <span>{hasCert ? '✓ Degree Verified:' : '📜 Degree Required:'} {certReq.courseName}</span>
                                </span>
                                <span className="text-[9px] text-zinc-400 font-mono block">
                                  {certReq.institution}
                                </span>
                              </div>
                              {!hasCert && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setAcademySearchQuery(certReq.courseName.split(' ')[0]);
                                    setCourseRegion('nigeria');
                                    setCurrentApp('courses');
                                    onShowToast(`🔍 Searching Academy for "${certReq.courseName}"...`);
                                    triggerSound?.('coin');
                                  }}
                                  className="px-2 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-[9px] shrink-0 cursor-pointer shadow"
                                >
                                  Search Academy
                                </button>
                              )}
                            </div>
                          )}

                          <div className="flex justify-between items-center pt-1.5 border-t border-zinc-900">
                            <span className="text-[9px] text-zinc-400 font-mono">⚡ Energy: {j.minEnergy}% · Shift: +{formatNaira(shiftStipend)}</span>

                            {hasCert ? (
                              <button
                                type="button"
                                onClick={() => handleLaunchShift(j, false)}
                                className="px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-[10px] rounded-xl cursor-pointer shadow transition-all flex items-center gap-1.5 active:scale-95"
                              >
                                <span>💼</span>
                                <span>Work Shift (15 Tasks)</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  onShowToast(`📜 You must obtain a degree in ${certReq?.courseName} from the Academy first!`);
                                  triggerSound?.('alert');
                                }}
                                className="px-3 py-1.5 bg-zinc-800 text-zinc-500 font-bold text-[10px] rounded-xl cursor-not-allowed border border-zinc-700 flex items-center gap-1"
                              >
                                <span>🔒</span>
                                <span>Degree Required</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* =============================================================
                5. HOUSES APP (55+ HOUSES - GROUPED BY STATE)
                ============================================================= */}
            {currentApp === 'houses' && (
              <div className="space-y-4">
                <div className="bg-emerald-950/80 border border-emerald-500/40 rounded-2xl p-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-black text-emerald-200">Nigeria Real Estate Portal</h3>
                    <p className="text-[10px] text-zinc-400">{filteredHouses.length} Properties Available</p>
                  </div>
                  <Home className="w-5 h-5 text-emerald-400" />
                </div>

                {/* State Filter Tabs */}
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {[
                    { id: 'all', label: 'All Nigeria' },
                    { id: 'lagos', label: 'Lagos' },
                    { id: 'abuja', label: 'Abuja' },
                    { id: 'imo', label: 'Imo' },
                    { id: 'rivers', label: 'Rivers' },
                    { id: 'kano', label: 'Kano' },
                    { id: 'canada', label: '🇨🇦 Canada' },
                  ].map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setHouseStateFilter(st.id)}
                      className={`px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase transition-all whitespace-nowrap cursor-pointer ${
                        houseStateFilter === st.id
                          ? st.id === 'canada'
                            ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white font-black shadow-md'
                            : 'bg-emerald-500 text-black font-black shadow-md'
                          : 'bg-zinc-900/80 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>

                {houseStateFilter === 'canada' ? (
                  /* ================= CANADIAN LUXURY PROPERTIES (IN CAD) ================= */
                  <div className="space-y-2">
                    <div className="p-2.5 rounded-xl bg-red-950/40 border border-red-500/30 flex items-center justify-between text-[10px]">
                      <span className="text-red-300 font-bold flex items-center gap-1">
                        <span>🍁</span>
                        <span>Canadian Real Estate Board (CREA)</span>
                      </span>
                      <span className="text-zinc-400 font-mono">
                        Canadian Bank Balance: <strong className="text-white">${(userProfile?.bankCAD || 0).toLocaleString()} CAD</strong>
                      </span>
                    </div>

                    {CANADA_PROPERTIES.map((prop) => {
                      const userCad = userProfile?.bankCAD || 0;
                      return (
                        <div key={prop.id} className="p-3.5 rounded-2xl bg-zinc-950/90 border border-red-500/30 shadow-lg space-y-2">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">{prop.icon}</span>
                              <div>
                                <div className="text-xs font-black text-white">{prop.title}</div>
                                <div className="text-[10px] text-red-400 font-mono">📍 {prop.neighborhood} · {prop.city}, {prop.province}</div>
                              </div>
                            </div>
                            <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 text-[9px] font-mono font-bold uppercase">
                              {prop.type}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-1.5 text-[9px] font-mono bg-zinc-900/60 p-2 rounded-xl border border-zinc-800">
                            <div>
                              <span className="text-zinc-500 block uppercase">Bedrooms & Bath:</span>
                              <span className="text-zinc-200 font-bold">{prop.bedrooms} Bed · {prop.bathrooms} Bath</span>
                            </div>
                            <div>
                              <span className="text-zinc-500 block uppercase">Currency Jurisdiction:</span>
                              <span className="text-red-300 font-bold">CAD ($ Canadian Dollars)</span>
                            </div>
                          </div>

                          <p className="text-[10px] text-zinc-300 leading-relaxed">{prop.desc}</p>

                          <div className="flex items-center justify-between pt-2 border-t border-zinc-900">
                            <div>
                              <div className="text-[10px] text-zinc-400">
                                Rent: <span className="font-mono text-amber-300 font-black">${prop.weeklyRentCAD.toLocaleString()} CAD/wk</span>
                              </div>
                              <div className="text-[10px] text-zinc-400">
                                Buy: <span className="font-mono text-emerald-400 font-black">${prop.buyPriceCAD.toLocaleString()} CAD</span>
                              </div>
                            </div>

                            <div className="flex gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  if (userCad < prop.weeklyRentCAD) {
                                    onShowToast(`Insufficient CAD funds! Weekly rent is $${prop.weeklyRentCAD.toLocaleString()} CAD. Exchange NGN to CAD in Naija Pay.`);
                                    triggerSound?.('alert');
                                    return;
                                  }
                                  if (userProfile) {
                                    userProfile.bankCAD = userCad - prop.weeklyRentCAD;
                                    if (!Array.isArray(userProfile.receipts)) userProfile.receipts = [];
                                    userProfile.receipts.unshift({
                                      id: `RENT_CAN_${Date.now()}`,
                                      title: `Lease: ${prop.title}`,
                                      category: 'lifestyle',
                                      amount: prop.weeklyRentCAD,
                                      date: new Date().toLocaleDateString('en-CA'),
                                      type: 'debit',
                                      currency: 'CAD',
                                    });
                                  }
                                  onBuyOrRentProperty({
                                    id: prop.id,
                                    title: prop.title,
                                    neighborhood: `${prop.neighborhood}, ${prop.city}`,
                                    annualRent: prop.weeklyRentCAD * 52,
                                    buyPrice: prop.buyPriceCAD,
                                    stateId: 'canada',
                                    type: prop.type === 'penthouse' ? 'villa' : prop.type === 'condo' ? 'flat' : 'duplex',
                                    icon: prop.icon,
                                    desc: prop.desc,
                                    roomsCount: prop.bedrooms,
                                    floorsCount: 1,
                                    x: 50,
                                    y: 50,
                                  }, 'rent');
                                  onShowToast(`🏠 Leased ${prop.title} (-$${prop.weeklyRentCAD.toLocaleString()} CAD/wk)! Paid from Canadian bank.`);
                                  triggerSound?.('coin');
                                }}
                                className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-[10px] cursor-pointer"
                              >
                                Rent (CAD)
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (userCad < prop.buyPriceCAD) {
                                    onShowToast(`Insufficient CAD funds! Purchase price is $${prop.buyPriceCAD.toLocaleString()} CAD. Exchange NGN to CAD in Naija Pay.`);
                                    triggerSound?.('alert');
                                    return;
                                  }
                                  if (userProfile) {
                                    userProfile.bankCAD = userCad - prop.buyPriceCAD;
                                    if (!Array.isArray(userProfile.receipts)) userProfile.receipts = [];
                                    userProfile.receipts.unshift({
                                      id: `BUY_CAN_${Date.now()}`,
                                      title: `Acquired Title: ${prop.title}`,
                                      category: 'lifestyle',
                                      amount: prop.buyPriceCAD,
                                      date: new Date().toLocaleDateString('en-CA'),
                                      type: 'debit',
                                      currency: 'CAD',
                                    });
                                  }
                                  onBuyOrRentProperty({
                                    id: prop.id,
                                    title: prop.title,
                                    neighborhood: `${prop.neighborhood}, ${prop.city}`,
                                    annualRent: prop.weeklyRentCAD * 52,
                                    buyPrice: prop.buyPriceCAD,
                                    stateId: 'canada',
                                    type: prop.type === 'penthouse' ? 'villa' : prop.type === 'condo' ? 'flat' : 'duplex',
                                    icon: prop.icon,
                                    desc: prop.desc,
                                    roomsCount: prop.bedrooms,
                                    floorsCount: 1,
                                    x: 50,
                                    y: 50,
                                  }, 'buy');
                                  onShowToast(`🏰 Congratulations! You now own ${prop.title} in Canada (-$${prop.buyPriceCAD.toLocaleString()} CAD)!`);
                                  triggerSound?.('success');
                                }}
                                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-black text-[10px] cursor-pointer shadow-md"
                              >
                                Buy (CAD)
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* ================= NIGERIA PROPERTIES ================= */
                  <div className="space-y-2">
                    {filteredHouses.map((prop) => {
                      const annual = prop.annualRent || 1200000;
                      let calibratedWeeklyRent = 400000;
                      if (annual >= 40000000) calibratedWeeklyRent = 1700000;
                      else if (annual >= 20000000) calibratedWeeklyRent = 1450000;
                      else if (annual >= 10000000) calibratedWeeklyRent = 1150000;
                      else if (annual >= 5000000) calibratedWeeklyRent = 850000;
                      else if (annual >= 2000000) calibratedWeeklyRent = 650000;
                      else calibratedWeeklyRent = 400000;

                      return (
                        <div key={prop.id} className="p-3 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-1.5">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{prop.icon}</span>
                              <div>
                                <div className="text-xs font-bold text-white">{prop.title}</div>
                                <div className="text-[10px] text-emerald-400/90 font-mono">📍 {prop.neighborhood}</div>
                              </div>
                            </div>
                          </div>
                          <p className="text-[10px] text-zinc-400">{prop.desc}</p>
                          <div className="flex items-center justify-between pt-1 border-t border-zinc-900">
                            <div className="text-[10px] text-zinc-400">
                              Rent: <span className="font-mono text-white font-bold">{formatNaira(calibratedWeeklyRent)}/wk</span>{' '}
                              <span className="text-[9px] text-emerald-400/90 font-mono block">(Paid every Saturday)</span>
                            </div>
                            <div className="text-[10px] text-zinc-400">
                              Buy: <span className="font-mono text-emerald-400 font-bold">{formatNaira(prop.buyPrice)}</span>
                            </div>
                            <div className="flex gap-1">
                              <button
                                type="button"
                                onClick={() => onBuyOrRentProperty({ ...prop, annualRent: calibratedWeeklyRent * 52 }, 'rent')}
                                className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-[10px] cursor-pointer"
                              >
                                Rent
                              </button>
                              <button
                                type="button"
                                onClick={() => onBuyOrRentProperty(prop, 'buy')}
                                className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-black text-[10px] cursor-pointer"
                              >
                                Buy
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* =============================================================
                6. CHOWDECK (55+ FOOD OPTIONS)
                ============================================================= */}
            {/* =============================================================
                6. CHOWDECK (55+ FOOD OPTIONS & CANADA DELICACIES)
                ============================================================= */}
            {currentApp === 'eatery' && (
              <div className="space-y-4">
                <div className="bg-orange-950/80 border border-orange-500/40 rounded-2xl p-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-black text-orange-200">Chowdeck Delivery Hub</h3>
                    <p className="text-[10px] text-zinc-400">Authentic Delicacies & Chilled Refreshments</p>
                  </div>
                  <span className="text-2xl">🍲</span>
                </div>

                {/* Region Selector: Nigeria vs Canada */}
                <div className="grid grid-cols-2 p-1 bg-zinc-900 border border-zinc-800 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setFoodRegion('nigeria')}
                    className={`py-1.5 text-[11px] font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      foodRegion === 'nigeria'
                        ? 'bg-orange-500 text-black shadow-md'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span>🇳🇬</span>
                    <span>Nigerian Delicacies</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFoodRegion('canada')}
                    className={`py-1.5 text-[11px] font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      foodRegion === 'canada'
                        ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span>🇨🇦</span>
                    <span>Canada Eats (CAD $)</span>
                  </button>
                </div>

                {foodRegion === 'canada' ? (
                  <div className="space-y-2">
                    <div className="p-2.5 rounded-xl bg-red-950/40 border border-red-500/30 flex items-center justify-between text-[10px]">
                      <div>
                        <span className="text-red-300 font-bold block">🇨🇦 Canadian Culinary Express</span>
                        <span className="text-[9px] text-zinc-400">
                          {currentStateId === 'canada'
                            ? '📍 In Canada: Local Canadian courier delivery ($0 delivery fee).'
                            : '📍 In Nigeria: $150 CAD Transatlantic Express Cargo DHL delivery fee applies!'}
                        </span>
                      </div>
                      <span className="text-red-300 font-mono font-bold shrink-0">
                        ${(userProfile?.bankCAD || 0).toLocaleString()} CAD
                      </span>
                    </div>

                    {[...CANADA_FOOD_ITEMS, ...CANADIAN_FOOD_95_ADDITIONAL].map((f) => {
                      const isLocal = currentStateId === 'canada';
                      const deliveryFeeCAD = isLocal ? 0 : 150;
                      const totalCAD = f.costCAD + deliveryFeeCAD;
                      const userCad = userProfile?.bankCAD || 0;

                      return (
                        <div key={f.id} className="p-3 rounded-2xl bg-zinc-950/90 border border-red-500/30 flex items-center justify-between">
                          <div className="flex items-center gap-2.5 min-w-0 pr-2">
                            <span className="text-2xl shrink-0">{f.icon}</span>
                            <div>
                              <div className="text-xs font-bold text-white">{f.name}</div>
                              <div className="text-[10px] text-red-400 font-mono">📍 {f.cityOrigin} · +{f.hungerBoost}% Hunger · +{f.joyBoost} Joy</div>
                              <div className="text-[10px] font-mono text-zinc-300 mt-0.5">
                                Food: <strong className="text-amber-300">${f.costCAD} CAD</strong>
                                {!isLocal && <span className="text-rose-400 ml-1.5">(+$150 CAD Transatlantic Surcharge)</span>}
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              if (userCad < totalCAD) {
                                onShowToast(`Insufficient CAD funds! Total is $${totalCAD} CAD (${f.costCAD} + ${deliveryFeeCAD} delivery). Exchange NGN to CAD in Naija Pay.`);
                                triggerSound?.('alert');
                                return;
                              }
                              if (userProfile) {
                                userProfile.bankCAD = userCad - totalCAD;
                                if (!Array.isArray(userProfile.receipts)) userProfile.receipts = [];
                                userProfile.receipts.unshift({
                                  id: `CHOW_CAN_${Date.now()}`,
                                  title: `Chowdeck Canada: ${f.name}`,
                                  category: 'lifestyle',
                                  amount: totalCAD,
                                  date: new Date().toLocaleDateString('en-CA'),
                                  type: 'debit',
                                  currency: 'CAD',
                                });
                              }
                              onUpdateStats({ hunger: f.hungerBoost, happiness: f.joyBoost });
                              onShowToast(`🍁 Delicious! Delivered ${f.name} (-$${totalCAD} CAD)!`);
                              triggerSound?.('coin');
                            }}
                            className="px-3 py-1.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white font-black text-xs rounded-xl cursor-pointer shrink-0 shadow-md"
                          >
                            Order (${totalCAD} CAD)
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <>
                    {/* Category Tabs */}
                    <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                      {['All', 'Rice & Combos', 'Swallows & Soups', 'Suya & Grills', 'Street Bites & Pastries', 'Chilled Drinks'].map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setFoodCategoryFilter(cat)}
                          className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all whitespace-nowrap cursor-pointer ${
                            foodCategoryFilter === cat ? 'bg-orange-500 text-black font-black' : 'bg-zinc-900/80 text-zinc-400 hover:text-white'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    <div className="space-y-2">
                      {filteredFoods.map((f) => (
                        <div key={f.id} className="p-3 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <span className="text-2xl shrink-0">{f.icon}</span>
                            <div>
                              <div className="text-xs font-bold text-white">{f.name}</div>
                              <div className="text-[10px] text-zinc-400">📍 Origin: {f.stateOrigin} · +{f.hunger}% Hunger</div>
                              <span className="text-xs font-mono font-bold text-orange-400 mt-0.5 block">{formatNaira(f.cost)}</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              if (moneyNGN < f.cost) {
                                onShowToast('Insufficient funds for food order!');
                                triggerSound?.('alert');
                                return;
                              }
                              onUpdateMoney(-f.cost);
                              onUpdateStats({ hunger: f.hunger, happiness: f.joy });
                              onShowToast(`🍲 Order delivered! Enjoyed ${f.name}.`);
                              triggerSound?.('coin');
                            }}
                            className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl cursor-pointer shrink-0"
                          >
                            Order
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* =============================================================
                6B. GROCERIES APP (100 AUTHENTIC NIGERIAN MARKET ITEMS & CANADA)
                ============================================================= */}
            {currentApp === 'groceries' && (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-emerald-950/90 to-teal-950/90 border border-emerald-500/50 rounded-2xl p-3 flex items-center justify-between shadow-xl">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center">
                      <ShoppingCart className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-white">Naija Fresh Groceries Mart</h3>
                      <p className="text-[10px] text-zinc-300">Pantry staples at real-life market prices</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-black">
                    {groceryRegion === 'canada' ? `${CANADA_GROCERIES.length + CANADIAN_GROCERIES_95_ADDITIONAL.length} CAD Items` : `${filteredGroceries.length} Items`}
                  </span>
                </div>

                {/* Region Switcher: Nigeria vs Canada */}
                <div className="grid grid-cols-2 p-1 bg-zinc-900 border border-zinc-800 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setGroceryRegion('nigeria')}
                    className={`py-1.5 text-[11px] font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      groceryRegion === 'nigeria'
                        ? 'bg-emerald-500 text-black shadow-md'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span>🇳🇬</span>
                    <span>Nigerian Mart</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setGroceryRegion('canada')}
                    className={`py-1.5 text-[11px] font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      groceryRegion === 'canada'
                        ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span>🇨🇦</span>
                    <span>Canada Supermarket (CAD)</span>
                  </button>
                </div>

                {groceryRegion === 'canada' ? (
                  <div className="space-y-2">
                    <div className="p-2.5 rounded-xl bg-red-950/40 border border-red-500/30 flex items-center justify-between text-[10px]">
                      <div>
                        <span className="text-red-300 font-bold block">🇨🇦 Loblaws & Metro Canada Pantry</span>
                        <span className="text-[9px] text-zinc-400">
                          {currentStateId === 'canada'
                            ? '📍 In Canada: Local Canadian courier delivery ($0 delivery fee).'
                            : '📍 In Nigeria: $150 CAD Transatlantic Express Cargo DHL delivery fee applies!'}
                        </span>
                      </div>
                      <span className="text-red-300 font-mono font-bold shrink-0">
                        ${(userProfile?.bankCAD || 0).toLocaleString()} CAD
                      </span>
                    </div>

                    {[...CANADA_GROCERIES, ...CANADIAN_GROCERIES_95_ADDITIONAL].map((item) => {
                      const isLocal = currentStateId === 'canada';
                      const deliveryFeeCAD = isLocal ? 0 : 150;
                      const totalCAD = item.priceCAD + deliveryFeeCAD;
                      const userCad = userProfile?.bankCAD || 0;

                      return (
                        <div
                          key={item.id}
                          className="p-3 rounded-2xl bg-zinc-950/90 border border-red-500/30 flex items-center justify-between hover:border-red-500/60 transition-colors"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 pr-2">
                            <span className="text-2xl shrink-0">{item.icon}</span>
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-white truncate">{item.name}</div>
                              <div className="text-[10px] text-red-400">
                                Unit: <span className="font-mono font-bold text-zinc-200">{item.unit}</span> · +{item.hungerRestore}% Hunger
                              </div>
                              <div className="text-[10px] font-mono text-zinc-300 mt-0.5">
                                Price: <strong className="text-amber-300">${item.priceCAD} CAD</strong>
                                {!isLocal && <span className="text-rose-400 ml-1.5">(+$150 CAD Transatlantic DHL)</span>}
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              if (userCad < totalCAD) {
                                onShowToast(`Insufficient CAD funds! Total is $${totalCAD} CAD (${item.priceCAD} + ${deliveryFeeCAD} delivery). Exchange NGN to CAD in Naija Pay.`);
                                triggerSound?.('alert');
                                return;
                              }
                              if (userProfile) {
                                userProfile.bankCAD = userCad - totalCAD;
                                if (!Array.isArray(userProfile.receipts)) userProfile.receipts = [];
                                userProfile.receipts.unshift({
                                  id: `GROC_CAN_${Date.now()}`,
                                  title: `Loblaws Canada: ${item.name}`,
                                  category: 'lifestyle',
                                  amount: totalCAD,
                                  date: new Date().toLocaleDateString('en-CA'),
                                  type: 'debit',
                                  currency: 'CAD',
                                });
                              }
                              onUpdateStats({ hunger: item.hungerRestore, health: 5 });
                              onShowToast(`🍁 Purchased ${item.name} (-$${totalCAD} CAD)!`);
                              triggerSound?.('coin');
                            }}
                            className="px-3 py-1.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white font-black text-xs rounded-xl cursor-pointer shrink-0 shadow-md"
                          >
                            Buy (${totalCAD} CAD)
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <>
                    {/* Search Bar */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-400" />
                      <input
                        type="text"
                        placeholder="Search rice, palm oil, beef, garri, milk..."
                        value={grocerySearchQuery}
                        onChange={(e) => setGrocerySearchQuery(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    {/* Category Pills */}
                    <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[10px]">
                      {[
                        'All',
                        'Grains & Staples',
                        'Meats & Seafood',
                        'Oils & Seasoning',
                        'Dairy & Breakfast',
                        'Fresh Produce',
                        'Packaged Foods',
                        'Beverages',
                        'Household',
                      ].map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setGroceryCategoryFilter(cat)}
                          className={`px-2.5 py-1 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer ${
                            groceryCategoryFilter === cat
                              ? 'bg-emerald-500 text-black font-black'
                              : 'bg-zinc-900/80 text-zinc-400 hover:text-white'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    {/* Grocery Items List */}
                    <div className="space-y-2">
                      {filteredGroceries.map((item) => (
                        <div
                          key={item.id}
                          className="p-3 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex items-center justify-between hover:border-emerald-500/40 transition-colors"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 pr-2">
                            <span className="text-2xl shrink-0">{item.icon}</span>
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-white truncate">{item.name}</div>
                              <div className="text-[10px] text-zinc-400">
                                Unit: <span className="text-zinc-300 font-mono font-bold">{item.unit}</span>
                                {item.hungerRestore > 0 && (
                                  <span className="text-emerald-400 font-bold ml-1.5">+{item.hungerRestore}% Hunger</span>
                                )}
                              </div>
                              <div className="text-[10px] text-zinc-500 truncate">{item.desc}</div>
                              <span className="text-xs font-mono font-bold text-emerald-400 mt-0.5 block">
                                {formatFullNairaNumber(item.priceNGN)}
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              if (moneyNGN < item.priceNGN) {
                                onShowToast(`Insufficient funds for ${item.name}!`);
                                triggerSound?.('alert');
                                return;
                              }
                              onUpdateMoney(-item.priceNGN);
                              if (item.hungerRestore > 0) {
                                onUpdateStats({ hunger: item.hungerRestore, health: 5 });
                              }
                              onShowToast(`🛒 Bought ${item.name}! Delivered straight to your home pantry.`);
                              triggerSound?.('coin');
                            }}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-black font-black text-xs rounded-xl cursor-pointer shrink-0 shadow-md active:scale-95 transition-all"
                          >
                            Buy Now
                          </button>
                        </div>
                      ))}

                      {filteredGroceries.length === 0 && (
                        <div className="py-8 text-center text-xs text-zinc-500">
                          No groceries found matching "{grocerySearchQuery}"
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* =============================================================
                7. ACADEMY (NIGERIAN & CANADIAN UNIVERSITY COURSES)
                ============================================================= */}
            {currentApp === 'courses' && (() => {
              const hasStudyPermit = (userProfile?.ownedDocuments || []).some(
                (d) => d.country === 'Canada' && (d.title?.toLowerCase().includes('study') || d.title?.toLowerCase().includes('visa') || d.status === 'Permanent') && !d.isExpired
              );

              return (
                <div className="space-y-4">
                  {/* Region Switcher: Nigeria Academy vs Canadian Universities */}
                  <div className="flex gap-1.5 bg-zinc-950 p-1 rounded-2xl border border-zinc-800 text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => setCourseRegion('nigeria')}
                      className={`flex-1 py-1.5 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1 ${
                        courseRegion === 'nigeria'
                          ? 'bg-purple-600 text-white font-black shadow-md'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      <span>🇳🇬 Nigerian Academy</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCourseRegion('canada')}
                      className={`flex-1 py-1.5 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1 ${
                        courseRegion === 'canada'
                          ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white font-black shadow-md'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      <span>🇨🇦 Canadian Universities</span>
                      <span className="text-[8px] px-1 py-0.2 bg-red-950 text-red-300 rounded border border-red-500/40">7-13 Lessons</span>
                    </button>
                  </div>

                  {/* UNIVERSAL ACADEMY DEGREE & COURSE SEARCH BAR */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={academySearchQuery}
                      onChange={(e) => setAcademySearchQuery(e.target.value)}
                      placeholder="Search degree, course title, or university..."
                      className="w-full bg-zinc-950/90 border border-purple-500/40 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-400 font-mono shadow-inner"
                    />
                    {academySearchQuery && (
                      <button
                        type="button"
                        onClick={() => setAcademySearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white text-xs cursor-pointer"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {courseRegion === 'canada' ? (
                    /* ================= CANADIAN UNIVERSITIES ================= */
                    <div className="space-y-3">
                      <div className="bg-gradient-to-r from-red-950/80 via-rose-950/80 to-zinc-900 border border-red-500/40 rounded-2xl p-3 flex items-center justify-between">
                        <div>
                          <h3 className="text-xs font-black text-red-200">Universities & Colleges of Canada</h3>
                          <p className="text-[10px] text-zinc-400">Accredited degree courses (7 - 13 lesson curriculum)</p>
                        </div>
                        <GraduationCap className="w-6 h-6 text-red-400" />
                      </div>

                      {/* Study Permit Warning / Quick Issue Banner */}
                      {!hasStudyPermit ? (
                        <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-950/80 via-zinc-950 to-neutral-900 border-2 border-amber-500/60 shadow-lg space-y-2">
                          <div className="flex items-start gap-2">
                            <span className="text-lg">🍁</span>
                            <div>
                              <div className="text-xs font-black text-amber-300">Canadian Study Permit Required</div>
                              <p className="text-[10px] text-zinc-300 mt-0.5 leading-relaxed">
                                Under IRCC regulations, international students must hold a verified Canadian Study Permit before enrolling in higher education courses.
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const userCad = userProfile?.bankCAD || 0;
                              if (userCad < 650 && moneyNGN < 624351) {
                                onShowToast('Insufficient funds for Canadian Study Permit ($650 CAD or ₦624,351 NGN)!');
                                triggerSound?.('alert');
                                return;
                              }
                              if (userCad >= 650) {
                                if (userProfile) userProfile.bankCAD = userCad - 650;
                              } else {
                                onUpdateMoney(-624351);
                              }

                                const studyDoc = {
                                id: `doc_can_study_${Date.now()}`,
                                title: 'Canada Designated Learning Institution Study Permit',
                                type: 'study_permit' as const,
                                country: 'Canada' as const,
                                documentNumber: `STU-CAN-${Math.floor(100000 + Math.random() * 900000)}`,
                                holderName: `${userProfile?.firstName || 'Citizen'} ${userProfile?.lastName || ''}`,
                                issueDate: new Date().toLocaleDateString('en-CA'),
                                expiresAtTimestamp: Date.now() + 14 * 86400000,
                                status: 'Valid' as const,
                                institution: 'IRCC · Immigration, Refugees and Citizenship Canada',
                                desc: 'Full-time study authorization at accredited Canadian Universities and Colleges.',
                              };
                              if (userProfile) {
                                if (!Array.isArray(userProfile.ownedDocuments)) userProfile.ownedDocuments = [];
                                userProfile.ownedDocuments.push(studyDoc);
                              }
                              onShowToast('🍁 Issued Canadian Study Permit! You are now authorized to enroll in Canadian university courses.');
                              triggerSound?.('success');
                            }}
                            className="w-full py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 text-black font-black text-xs rounded-xl cursor-pointer shadow-md"
                          >
                            Apply for Canadian Study Permit ($650 CAD / ₦624,351)
                          </button>
                        </div>
                      ) : (
                        <div className="p-2 rounded-xl bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-between text-[10px]">
                          <span className="text-emerald-300 font-bold flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>IRCC Study Permit Active · Cleared for Canadian Higher Education</span>
                          </span>
                          <span className="text-zinc-400 font-mono">CAD Account: ${userProfile?.bankCAD || 0}</span>
                        </div>
                      )}

                      {/* CANADIAN COURSES LIST */}
                      <div className="space-y-2.5">
                        {CANADA_COURSES.filter((crs) => {
                          const q = academySearchQuery.trim().toLowerCase();
                          return (
                            !q ||
                            crs.title.toLowerCase().includes(q) ||
                            crs.desc.toLowerCase().includes(q) ||
                            crs.institution.toLowerCase().includes(q) ||
                            crs.city.toLowerCase().includes(q) ||
                            crs.province.toLowerCase().includes(q)
                          );
                        }).map((crs) => {
                          const totalL = getCourseTotalLessons(crs.id, crs.title);
                          const dailyCap = getCourseDailyCap(totalL);
                          const progress = courseProgressMap[crs.id];
                          const isGraduated = completedCoursesState.includes(crs.id) || progress?.isGraduated;
                          const todayStr = new Date().toLocaleDateString('en-CA');
                          const isNewDay = progress && progress.lastLessonDate !== todayStr;
                          const effectiveToday = progress ? (isNewDay ? 0 : (progress.lessonsDoneToday || 0)) : 0;
                          const capReached = progress && effectiveToday >= dailyCap;
                          const completedL = progress ? (progress.completedLessons || 0) : 0;
                          const allLessonsDone = progress && completedL >= totalL;
                          const gradFee = crs.feeCAD * 2;
                          const userCad = userProfile?.bankCAD || 0;

                          return (
                            <div key={crs.id} className="p-3.5 rounded-2xl bg-zinc-950/90 border border-red-500/30 space-y-2.5 shadow-md">
                              <div className="flex items-start justify-between">
                                <div>
                                  <div className="text-xs font-bold text-white flex items-center gap-1.5 flex-wrap">
                                    <span>{crs.title}</span>
                                    {isGraduated && (
                                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-bold">
                                        ✓ Accredited Degree
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[10px] text-red-400 font-mono">
                                    {crs.institution} · 📍 {crs.city}, {crs.province}
                                  </div>
                                </div>
                                <div className="text-right shrink-0">
                                  <div className="text-xs font-mono font-bold text-amber-300">
                                    ${crs.feeCAD.toLocaleString()} CAD
                                  </div>
                                  <div className="text-[9px] text-zinc-400 font-mono">
                                    Graduation: ${gradFee.toLocaleString()} CAD
                                  </div>
                                </div>
                              </div>

                              <p className="text-[10px] text-zinc-300 leading-relaxed">{crs.desc}</p>

                              {/* Curriculum Specs */}
                              <div className="p-2 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between text-[10px] font-mono">
                                <span className="text-zinc-300 flex items-center gap-1">
                                  <span>📚</span>
                                  <span><strong>{totalL} Lessons</strong> ({dailyCap}/day cap)</span>
                                </span>
                                <span className="text-amber-400 font-bold">
                                  {totalL === 12 ? '15 Questions/Lesson' : '10-12 Questions/Lesson'}
                                </span>
                              </div>

                              {/* Progress bar if enrolled */}
                              {progress && !isGraduated && (
                                <div className="space-y-1.5 pt-1">
                                  <div className="flex justify-between text-[9px] font-mono">
                                    <span className="text-zinc-400">Progress: {completedL} / {totalL} Lessons</span>
                                    <span className={capReached ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
                                      Today: {effectiveToday} / {dailyCap} lessons
                                    </span>
                                  </div>
                                  <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-gradient-to-r from-red-500 to-amber-500 transition-all duration-300 rounded-full"
                                      style={{ width: `${Math.min(100, (completedL / totalL) * 100)}%` }}
                                    />
                                  </div>
                                </div>
                              )}

                              <div className="pt-2 border-t border-zinc-900 flex justify-between items-center gap-2">
                                {isGraduated ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setCertRegion('canada');
                                      setCurrentApp('certificates');
                                    }}
                                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] rounded-xl cursor-pointer text-center"
                                  >
                                    View Canadian Degree
                                  </button>
                                ) : allLessonsDone ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (userCad < gradFee) {
                                        onShowToast(`Insufficient CAD! Graduation fee is double tuition ($${gradFee.toLocaleString()} CAD).`);
                                        triggerSound?.('alert');
                                        return;
                                      }
                                      if (userProfile) {
                                        userProfile.bankCAD = userCad - gradFee;
                                        const updatedCourses = [...completedCoursesState, crs.id];
                                        setCompletedCoursesState(updatedCourses);
                                        userProfile.completedCourses = updatedCourses;
                                        if (!Array.isArray(userProfile.ownedDocuments)) userProfile.ownedDocuments = [];
                                        userProfile.ownedDocuments.push({
                                          id: `DEG_CAN_${crs.id}_${Date.now()}`,
                                          type: 'study_permit',
                                          title: `${crs.title} Degree`,
                                          country: 'Canada',
                                          documentNumber: `CAN-DEG-${Date.now().toString().slice(-6)}`,
                                          issueDate: todayStr,
                                          status: 'Valid',
                                          institution: crs.institution,
                                          desc: `Official accredited Canadian university degree conferred by ${crs.institution}.`,
                                        });
                                        if (!Array.isArray(userProfile.receipts)) userProfile.receipts = [];
                                        userProfile.receipts.unshift({
                                          id: `GRAD_CAN_${Date.now()}`,
                                          title: `Graduation Fee: ${crs.title}`,
                                          category: 'education',
                                          amount: gradFee,
                                          date: todayStr,
                                          type: 'debit',
                                          currency: 'CAD',
                                        });
                                      }
                                      const updatedMap = {
                                        ...courseProgressMap,
                                        [crs.id]: {
                                          ...progress,
                                          isGraduated: true,
                                        },
                                      };
                                      saveCourseProgress(updatedMap);
                                      onUpdateStats({ happiness: crs.happinessBonus + 20 });
                                      onShowToast(`🎓 Convocation complete! Paid $${gradFee.toLocaleString()} CAD graduation fee. Canadian Degree awarded!`);
                                      triggerSound?.('success');
                                    }}
                                    className="w-full py-2 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 text-black font-black text-[10px] rounded-xl cursor-pointer shadow-lg animate-pulse"
                                  >
                                    🎓 Pay Graduation Fee (${gradFee.toLocaleString()} CAD) & Convocate
                                  </button>
                                ) : progress ? (
                                  capReached ? (
                                    <div className="w-full flex items-center justify-between gap-2">
                                      <span className="text-[9px] text-amber-400 font-mono">
                                        Limit reached ({dailyCap}/{dailyCap} today)
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const updatedMap = {
                                            ...courseProgressMap,
                                            [crs.id]: {
                                              ...progress,
                                              lessonsDoneToday: 0,
                                              lastLessonDate: todayStr,
                                            },
                                          };
                                          saveCourseProgress(updatedMap);
                                          onShowToast(`🌅 Advanced to next academic day! You can now study up to ${dailyCap} lessons.`);
                                          triggerSound?.('coin');
                                        }}
                                        className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-amber-300 text-[10px] font-bold rounded-lg cursor-pointer"
                                      >
                                        ⏩ Simulate Next Study Day
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (isNewDay) {
                                          const updatedMap = {
                                            ...courseProgressMap,
                                            [crs.id]: {
                                              ...progress,
                                              lessonsDoneToday: 0,
                                              lastLessonDate: todayStr,
                                            },
                                          };
                                          saveCourseProgress(updatedMap);
                                        }
                                        setActiveCourseId(crs.id);
                                        setActiveLessonStep('reading');
                                        setCurrentQuizQuestionIndex(0);
                                        setSelectedQuizAnswers({});
                                        setSelectedQuizChoice(null);
                                        setQuizAnswerSubmitted(false);
                                        setLastQuizResult(null);
                                      }}
                                      className="w-full py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white font-bold text-[10px] rounded-xl cursor-pointer shadow"
                                    >
                                      📖 Study Lesson {completedL + 1} of {totalL} &rarr;
                                    </button>
                                  )
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (!hasStudyPermit) {
                                        onShowToast('You must acquire a Canadian Study Permit before enrolling!');
                                        triggerSound?.('alert');
                                        return;
                                      }
                                      if (userCad < crs.feeCAD) {
                                        onShowToast(`Insufficient CAD! Course costs $${crs.feeCAD.toLocaleString()} CAD. Convert funds in Naija Pay.`);
                                        triggerSound?.('alert');
                                        return;
                                      }
                                      if (userProfile) {
                                        userProfile.bankCAD = userCad - crs.feeCAD;
                                        if (!Array.isArray(userProfile.receipts)) userProfile.receipts = [];
                                        userProfile.receipts.unshift({
                                          id: `EDU_CAN_${Date.now()}`,
                                          title: `Tuition: ${crs.title}`,
                                          category: 'education',
                                          amount: crs.feeCAD,
                                          date: todayStr,
                                          type: 'debit',
                                          currency: 'CAD',
                                        });
                                      }
                                      const newProg: StudentCourseProgress = {
                                        courseId: crs.id,
                                        title: crs.title,
                                        institution: crs.institution,
                                        isCanada: true,
                                        fee: crs.feeCAD,
                                        graduationFee: gradFee,
                                        totalLessons: totalL,
                                        dailyCap,
                                        completedLessons: 0,
                                        currentLesson: 1,
                                        lessonsDoneToday: 0,
                                        lastLessonDate: todayStr,
                                        isGraduated: false,
                                        certificateCode: `CAN-DEG-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
                                        certificateName: `${crs.title} Degree`,
                                      };
                                      const updatedMap = {
                                        ...courseProgressMap,
                                        [crs.id]: newProg,
                                      };
                                      saveCourseProgress(updatedMap);
                                      setActiveCourseId(crs.id);
                                      setActiveLessonStep('reading');
                                      setCurrentQuizQuestionIndex(0);
                                      setSelectedQuizAnswers({});
                                      setSelectedQuizChoice(null);
                                      setQuizAnswerSubmitted(false);
                                      setLastQuizResult(null);
                                      onShowToast(`🍁 Enrolled in ${crs.title}! Lesson 1 class notes loaded.`);
                                      triggerSound?.('success');
                                    }}
                                    className="w-full py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white font-bold text-[10px] rounded-xl cursor-pointer shadow"
                                  >
                                    Enroll in Course (${crs.feeCAD.toLocaleString()} CAD)
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    /* ================= NIGERIAN ACADEMY ================= */
                    <div className="space-y-4">
                      <div className="bg-purple-950/80 border border-purple-500/40 rounded-2xl p-3 flex items-center justify-between">
                        <div>
                          <h3 className="text-xs font-black text-purple-200">National Academy & Skill Hub</h3>
                          <p className="text-[10px] text-zinc-400">Complete all lessons and pay graduation to earn verified degrees</p>
                        </div>
                        <GraduationCap className="w-6 h-6 text-purple-400" />
                      </div>

                      {/* Category Filter */}
                      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                        {['All', 'Technology', 'Finance & Business', 'Aviation & Marine', 'Healthcare', 'Creative Arts', 'Trades'].map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setCourseCategoryFilter(cat)}
                            className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all whitespace-nowrap cursor-pointer ${
                              courseCategoryFilter === cat ? 'bg-purple-600 text-white font-black' : 'bg-zinc-900/80 text-zinc-400 hover:text-white'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>

                      <div className="space-y-2.5">
                        {filteredCourses.map((crs) => {
                          const totalL = getCourseTotalLessons(crs.id, crs.title);
                          const dailyCap = getCourseDailyCap(totalL);
                          const progress = courseProgressMap[crs.id];
                          const isGraduated = completedCoursesState.includes(crs.id) || progress?.isGraduated;
                          const todayStr = new Date().toLocaleDateString('en-CA');
                          const isNewDay = progress && progress.lastLessonDate !== todayStr;
                          const effectiveToday = progress ? (isNewDay ? 0 : (progress.lessonsDoneToday || 0)) : 0;
                          const capReached = progress && effectiveToday >= dailyCap;
                          const completedL = progress ? (progress.completedLessons || 0) : 0;
                          const allLessonsDone = progress && completedL >= totalL;
                          const gradFee = crs.fee * 2;

                          return (
                            <div key={crs.id} className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-2.5 shadow-md">
                              <div className="flex items-start justify-between">
                                <div>
                                  <div className="text-xs font-bold text-white flex items-center gap-1.5 flex-wrap">
                                    <span>{crs.title}</span>
                                    {isGraduated && (
                                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-bold">
                                        ✓ Certified Degree
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[10px] text-purple-300/80 font-mono">{crs.institution}</div>
                                </div>
                                <div className="text-right shrink-0">
                                  <div className="text-xs font-mono font-bold text-purple-400">{formatNaira(crs.fee)}</div>
                                  <div className="text-[9px] text-zinc-500 font-mono">Graduation: {formatNaira(gradFee)}</div>
                                </div>
                              </div>

                              <p className="text-[10px] text-zinc-400 leading-relaxed">{crs.desc}</p>

                              {/* Curriculum Specs */}
                              <div className="p-2 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between text-[10px] font-mono">
                                <span className="text-zinc-300 flex items-center gap-1">
                                  <span>📚</span>
                                  <span><strong>{totalL} Lessons</strong> ({dailyCap}/day cap)</span>
                                </span>
                                <span className="text-purple-400 font-bold">
                                  {totalL === 12 ? '15 Questions/Lesson' : '10-12 Questions/Lesson'}
                                </span>
                              </div>

                              {/* Progress bar if enrolled */}
                              {progress && !isGraduated && (
                                <div className="space-y-1.5 pt-1">
                                  <div className="flex justify-between text-[9px] font-mono">
                                    <span className="text-zinc-400">Progress: {completedL} / {totalL} Lessons</span>
                                    <span className={capReached ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
                                      Today: {effectiveToday} / {dailyCap} lessons
                                    </span>
                                  </div>
                                  <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-300 rounded-full"
                                      style={{ width: `${Math.min(100, (completedL / totalL) * 100)}%` }}
                                    />
                                  </div>
                                </div>
                              )}

                              <div className="pt-2 border-t border-zinc-900 flex justify-between items-center gap-2">
                                {isGraduated ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setCertRegion('nigeria');
                                      setCurrentApp('certificates');
                                    }}
                                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] rounded-xl cursor-pointer text-center"
                                  >
                                    View Certificate
                                  </button>
                                ) : allLessonsDone ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (moneyNGN < gradFee) {
                                        onShowToast(`Insufficient funds! Graduation fee is double tuition (${formatNaira(gradFee)}).`);
                                        triggerSound?.('alert');
                                        return;
                                      }
                                      onUpdateMoney(-gradFee);
                                      const updatedCourses = [...completedCoursesState, crs.id];
                                      setCompletedCoursesState(updatedCourses);
                                      if (userProfile) {
                                        userProfile.completedCourses = updatedCourses;
                                        if (!Array.isArray(userProfile.ownedDocuments)) userProfile.ownedDocuments = [];
                                        userProfile.ownedDocuments.push({
                                          id: `DEG_NGA_${crs.id}_${Date.now()}`,
                                          type: 'nin_slip',
                                          title: `${crs.title} Certificate`,
                                          country: 'Nigeria',
                                          documentNumber: `NGA-DEG-${Date.now().toString().slice(-6)}`,
                                          issueDate: todayStr,
                                          status: 'Valid',
                                          institution: crs.institution,
                                          desc: `Official accredited certificate issued by ${crs.institution}.`,
                                        });
                                      }
                                      const updatedMap = {
                                        ...courseProgressMap,
                                        [crs.id]: {
                                          ...progress,
                                          isGraduated: true,
                                        },
                                      };
                                      saveCourseProgress(updatedMap);
                                      onUpdateStats({ happiness: crs.happinessBoost + 20 });
                                      onShowToast(`🎓 Graduation complete! Paid ${formatNaira(gradFee)} graduation fee. Accredited Degree awarded!`);
                                      triggerSound?.('success');
                                    }}
                                    className="w-full py-2 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 text-black font-black text-[10px] rounded-xl cursor-pointer shadow-lg animate-pulse"
                                  >
                                    🎓 Pay Graduation Fee ({formatNaira(gradFee)}) & Convocate
                                  </button>
                                ) : progress ? (
                                  capReached ? (
                                    <div className="w-full flex items-center justify-between gap-2">
                                      <span className="text-[9px] text-amber-400 font-mono">
                                        Limit reached ({dailyCap}/{dailyCap} today)
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const updatedMap = {
                                            ...courseProgressMap,
                                            [crs.id]: {
                                              ...progress,
                                              lessonsDoneToday: 0,
                                              lastLessonDate: todayStr,
                                            },
                                          };
                                          saveCourseProgress(updatedMap);
                                          onShowToast(`🌅 Advanced to next academic day! You can now study up to ${dailyCap} lessons.`);
                                          triggerSound?.('coin');
                                        }}
                                        className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-amber-300 text-[10px] font-bold rounded-lg cursor-pointer"
                                      >
                                        ⏩ Simulate Next Study Day
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (isNewDay) {
                                          const updatedMap = {
                                            ...courseProgressMap,
                                            [crs.id]: {
                                              ...progress,
                                              lessonsDoneToday: 0,
                                              lastLessonDate: todayStr,
                                            },
                                          };
                                          saveCourseProgress(updatedMap);
                                        }
                                        setActiveCourseId(crs.id);
                                        setActiveLessonStep('reading');
                                        setCurrentQuizQuestionIndex(0);
                                        setSelectedQuizAnswers({});
                                        setSelectedQuizChoice(null);
                                        setQuizAnswerSubmitted(false);
                                        setLastQuizResult(null);
                                      }}
                                      className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-[10px] rounded-xl cursor-pointer shadow"
                                    >
                                      📖 Study Lesson {completedL + 1} of {totalL} &rarr;
                                    </button>
                                  )
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (moneyNGN < crs.fee) {
                                        onShowToast(`Insufficient funds for enrollment! Course costs ${formatNaira(crs.fee)}.`);
                                        triggerSound?.('alert');
                                        return;
                                      }
                                      onUpdateMoney(-crs.fee);
                                      const newProg: StudentCourseProgress = {
                                        courseId: crs.id,
                                        title: crs.title,
                                        institution: crs.institution,
                                        isCanada: false,
                                        fee: crs.fee,
                                        graduationFee: gradFee,
                                        totalLessons: totalL,
                                        dailyCap,
                                        completedLessons: 0,
                                        currentLesson: 1,
                                        lessonsDoneToday: 0,
                                        lastLessonDate: todayStr,
                                        isGraduated: false,
                                        certificateCode: `NGA-DEG-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
                                        certificateName: `${crs.title} Certificate`,
                                      };
                                      const updatedMap = {
                                        ...courseProgressMap,
                                        [crs.id]: newProg,
                                      };
                                      saveCourseProgress(updatedMap);
                                      setActiveCourseId(crs.id);
                                      setActiveLessonStep('reading');
                                      setCurrentQuizQuestionIndex(0);
                                      setSelectedQuizAnswers({});
                                      setSelectedQuizChoice(null);
                                      setQuizAnswerSubmitted(false);
                                      setLastQuizResult(null);
                                      onShowToast(`📚 Enrolled in ${crs.title}! Lesson 1 class notes loaded.`);
                                      triggerSound?.('success');
                                    }}
                                    className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-[10px] rounded-xl cursor-pointer shadow"
                                  >
                                    Enroll in Course ({formatNaira(crs.fee)})
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* =============================================================
                8. CERTIFICATES APP (ONLY CERTIFICATES FROM ACADEMY)
                ============================================================= */}
            {currentApp === 'certificates' && (() => {
              const earnedCanadianCertificates = CANADA_COURSES.filter((c) =>
                completedCoursesState.includes(c.id)
              );

              return (
                <div className="space-y-4">
                  <div className="bg-teal-950/80 border border-teal-500/40 rounded-2xl p-3.5 flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-black text-teal-200">Accredited Credentials Vault</h3>
                      <p className="text-[10px] text-zinc-400">Official verified degrees & certificates</p>
                    </div>
                    <Award className="w-6 h-6 text-teal-400" />
                  </div>

                  {/* Region Switcher: Nigeria vs Canada */}
                  <div className="flex gap-1.5 bg-zinc-950 p-1 rounded-2xl border border-zinc-800 text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => setCertRegion('nigeria')}
                      className={`flex-1 py-1.5 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1 ${
                        certRegion === 'nigeria'
                          ? 'bg-emerald-500 text-black font-black shadow-md'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      <span>🇳🇬 Nigerian ({earnedCertificatesList.length})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCertRegion('canada')}
                      className={`flex-1 py-1.5 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1 ${
                        certRegion === 'canada'
                          ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white font-black shadow-md'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      <span>🇨🇦 Canadian ({earnedCanadianCertificates.length})</span>
                    </button>
                  </div>

                  {certRegion === 'canada' ? (
                    earnedCanadianCertificates.length === 0 ? (
                      <div className="bg-zinc-950/80 border border-zinc-800 rounded-3xl p-6 text-center space-y-3">
                        <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center mx-auto text-2xl">
                          🍁
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-white">No Canadian Degrees Earned Yet</h4>
                          <p className="text-xs text-zinc-400 mt-1">
                            Enroll in Canadian university courses (U of T, McGill, UBC, Waterloo) in the Academy app to unlock official Canadian degrees!
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setCourseRegion('canada');
                            setCurrentApp('courses');
                          }}
                          className="px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 text-white font-black text-xs rounded-xl cursor-pointer shadow-md"
                        >
                          Explore Canadian Universities
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold">
                          Canadian Degrees & Diplomas ({earnedCanadianCertificates.length})
                        </span>
                        {earnedCanadianCertificates.map((c) => (
                          <div
                            key={c.id}
                            className="bg-gradient-to-br from-zinc-950 via-neutral-900 to-red-950/40 border-2 border-red-500/50 rounded-3xl p-4 shadow-xl space-y-3"
                          >
                            <div className="flex items-center justify-between border-b border-red-500/20 pb-2">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-red-400">🇨🇦 ACCREDITED DEGREE</span>
                              </div>
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-black font-mono">
                                VERIFIED AUCC
                              </span>
                            </div>

                            <div>
                              <div className="text-[10px] font-mono text-red-400 uppercase tracking-widest">{c.institution} · {c.city}, {c.province}</div>
                              <h4 className="text-sm font-black text-white mt-0.5">{c.title}</h4>
                            </div>

                            <div className="bg-black/40 rounded-xl p-2.5 text-[10px] font-mono space-y-1 border border-zinc-800">
                              <div className="text-zinc-400">
                                Conferred to: <span className="text-white font-bold">{userProfile?.firstName} {userProfile?.lastName}</span>
                              </div>
                              <div className="text-zinc-400">
                                Credential ID: <span className="text-amber-400 font-bold">CAN-DEG-{c.id.toUpperCase()}-{userProfile?.username?.toUpperCase()}</span>
                              </div>
                              <div className="text-zinc-500">Accredited by Association of Universities and Colleges of Canada (AUCC)</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  ) : (
                    earnedCertificatesList.length === 0 ? (
                      <div className="bg-zinc-950/80 border border-zinc-800 rounded-3xl p-6 text-center space-y-3">
                        <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center mx-auto text-2xl">
                          📜
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-white">No Nigerian Certificates Earned Yet</h4>
                          <p className="text-xs text-zinc-400 mt-1">
                            Enroll and complete courses in the Academy app to unlock official verified certificates here!
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setCourseRegion('nigeria');
                            setCurrentApp('courses');
                          }}
                          className="px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-600 text-black font-black text-xs rounded-xl cursor-pointer"
                        >
                          Open Academy App
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold">
                          Earned Credentials ({earnedCertificatesList.length})
                        </span>
                        {earnedCertificatesList.map((c) => (
                          <div
                            key={c.id}
                            className="bg-gradient-to-br from-zinc-950 via-neutral-900 to-teal-950/40 border-2 border-teal-500/50 rounded-3xl p-4 shadow-xl space-y-3"
                          >
                            <div className="flex items-center justify-between border-b border-teal-500/20 pb-2">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-amber-300">🇳🇬 ACCREDITED</span>
                              </div>
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-black font-mono">
                                VERIFIED
                              </span>
                            </div>

                            <div>
                              <div className="text-[10px] font-mono text-teal-400 uppercase tracking-widest">{c.institution}</div>
                              <h4 className="text-sm font-black text-white mt-0.5">{c.certificateName}</h4>
                            </div>

                            <div className="bg-black/40 rounded-xl p-2.5 text-[10px] font-mono space-y-1 border border-zinc-800">
                              <div className="text-zinc-400">
                                Awarded to: <span className="text-white font-bold">{userProfile?.firstName} {userProfile?.lastName}</span>
                              </div>
                              <div className="text-zinc-400">
                                Serial: <span className="text-amber-400 font-bold">{c.certificateCode}-NGA-{userProfile?.username?.toUpperCase()}</span>
                              </div>
                              <div className="text-zinc-500">Issued by Federal Ministry of Education & Accreditation Council</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  )}
                </div>
              );
            })()}

            {/* =============================================================
                8B. DOCUMENTS APP (OFFICIAL PASSES, VISAS, PR CARDS & CERTIFICATES)
                ============================================================= */}
            {currentApp === 'documents' && (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-emerald-950/90 to-teal-950/90 border border-emerald-500/40 rounded-2xl p-3.5 flex items-center justify-between shadow-lg">
                  <div>
                    <h3 className="text-xs font-black text-emerald-300 uppercase">OFFICIAL CITIZEN DOCUMENTS VAULT</h3>
                    <p className="text-[10px] text-zinc-400">Verified Visas, PR Cards, Passports & Clearances</p>
                  </div>
                  <FileText className="w-6 h-6 text-emerald-400" />
                </div>

                {/* Filter Pills */}
                <div className="flex gap-1.5 bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-[10px] font-bold">
                  {(['all', 'canada', 'nigeria'] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setDocumentsFilter(tab)}
                      className={`flex-1 py-1 rounded-lg uppercase cursor-pointer ${
                        documentsFilter === tab ? 'bg-emerald-500 text-black font-black' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      {tab === 'all' ? 'All Docs' : tab === 'canada' ? '🍁 Canada' : '🇳🇬 Nigeria & General'}
                    </button>
                  ))}
                </div>

                {(() => {
                  const allDocs = userProfile?.ownedDocuments || [];
                  const filtered = allDocs.filter((d) => {
                    if (documentsFilter === 'canada') return d.country === 'Canada';
                    if (documentsFilter === 'nigeria') return d.country === 'Nigeria' || d.country === 'General';
                    return true;
                  });

                  if (filtered.length === 0) {
                    return (
                      <div className="bg-zinc-950/80 border border-zinc-800 rounded-3xl p-6 text-center space-y-3">
                        <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center mx-auto text-2xl">
                          📂
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-white">No Official Documents Issued Yet</h4>
                          <p className="text-xs text-zinc-400 mt-1">
                            Visit the Immigration App to process your International Passport, Canadian Visas, Study Permits, and PR Cards!
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setCurrentApp('immigration')}
                          className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-black font-black text-xs rounded-xl cursor-pointer shadow-md"
                        >
                          Open Immigration App
                        </button>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 font-bold uppercase">
                        <span>Issued Documents ({filtered.length})</span>
                        <span className="text-emerald-400">Gov-Verified Vault</span>
                      </div>
                      {filtered.map((doc) => (
                        <div
                          key={doc.id}
                          className={`rounded-2xl p-3.5 border shadow-xl space-y-2.5 relative overflow-hidden ${
                            doc.country === 'Canada'
                              ? 'bg-gradient-to-br from-red-950/50 via-zinc-950 to-neutral-900 border-red-500/40'
                              : 'bg-gradient-to-br from-emerald-950/50 via-zinc-950 to-neutral-900 border-emerald-500/40'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xl shrink-0">{doc.country === 'Canada' ? '🇨🇦' : '🇳🇬'}</span>
                              <div>
                                <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
                                  {doc.institution || (doc.country === 'Canada' ? 'IRCC · Government of Canada' : 'Nigeria Immigration Service (NIS)')}
                                </span>
                                <h4 className="text-xs font-black text-white">{doc.title}</h4>
                              </div>
                            </div>
                            {(() => {
                              const isExp = doc.isExpired || (doc.expiresAtTimestamp ? Date.now() > doc.expiresAtTimestamp : false);
                              const daysLeft = doc.expiresAtTimestamp ? Math.max(0, Math.ceil((doc.expiresAtTimestamp - Date.now()) / 86400000)) : null;

                              return (
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-black uppercase ${
                                  isExp
                                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50'
                                    : doc.status === 'Permanent'
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                }`}>
                                  {isExp ? '⛔ EXPIRED' : doc.status === 'Permanent' ? 'PERMANENT' : `VALID (${daysLeft}D LEFT)`}
                                </span>
                              );
                            })()}
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-[9px] font-mono bg-black/40 p-2 rounded-xl border border-white/5">
                            <div>
                              <span className="text-zinc-500 uppercase block">Document Number:</span>
                              <span className="text-amber-300 font-bold">{doc.documentNumber}</span>
                            </div>
                            <div>
                              <span className="text-zinc-500 uppercase block">Holder Citizen:</span>
                              <span className="text-zinc-200 font-bold">{userProfile?.firstName} {userProfile?.lastName}</span>
                            </div>
                            <div>
                              <span className="text-zinc-500 uppercase block">Issue Date:</span>
                              <span className="text-zinc-300">{doc.issueDate}</span>
                            </div>
                            <div>
                              <span className="text-zinc-500 uppercase block">Status / Expiry:</span>
                              {(() => {
                                const isExp = doc.isExpired || (doc.expiresAtTimestamp ? Date.now() > doc.expiresAtTimestamp : false);
                                const daysLeft = doc.expiresAtTimestamp ? Math.max(0, Math.ceil((doc.expiresAtTimestamp - Date.now()) / 86400000)) : null;
                                return (
                                  <span className={`font-bold ${isExp ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>
                                    {isExp
                                      ? '⛔ Expired (Boarding Denied)'
                                      : doc.status === 'Permanent'
                                      ? 'Permanent (Lifetime)'
                                      : `Valid (${daysLeft} Days Remaining)`}
                                  </span>
                                );
                              })()}
                            </div>
                          </div>

                          <p className="text-[10px] text-zinc-400 leading-relaxed">{doc.desc}</p>

                          <div className="flex items-center justify-between text-[8px] font-mono text-zinc-500 pt-1 border-t border-white/5">
                            <span className="flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3 text-emerald-400" />
                              Biometric Chip Encrypted
                            </span>
                            <span>Valid for Port of Entry Boarding</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* =============================================================
                9. IMMIGRATION APP (CANADA ACTIVE + GENERAL DOCS + COMING SOON)
                ============================================================= */}
            {currentApp === 'immigration' && (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-950/90 via-sky-950/80 to-indigo-950/90 border border-sky-500/40 rounded-2xl p-3.5 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Plane className="w-6 h-6 text-sky-400" />
                      <div>
                        <h3 className="text-xs font-black text-sky-300 uppercase">NIS & IRCC RELOCATION GATEWAY</h3>
                        <p className="text-[10px] text-zinc-400">Nigeria Immigration Service & Canadian High Commission</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Relocation Country Sections */}
                <div className="space-y-3">
                  {/* --- SECTION 1: CANADA (ACTIVE 100%) --- */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-base">🇨🇦</span>
                        <span className="text-xs font-black text-white uppercase tracking-wider">
                          Canada Relocation Wing
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-[9px] font-mono font-black uppercase">
                        Active Corridors
                      </span>
                    </div>

                    {[
                      {
                        id: 'can_tourist_visa',
                        type: 'visa' as const,
                        title: 'Canada Visitor Visa (V-1 Subclass)',
                        country: 'Canada' as const,
                        feeNGN: 250000,
                        feeDisplay: '₦250,000',
                        badge: '10-Yr Multiple Entry',
                        icon: '🍁',
                        desc: 'Official Temporary Resident Visa allowing travel and tourism across all 150 Canadian cities.',
                        status: 'Valid' as const,
                        institution: 'IRCC · Government of Canada',
                      },
                      {
                        id: 'can_study_permit',
                        type: 'study_permit' as const,
                        title: 'Canada Study Permit & Work Authorization',
                        country: 'Canada' as const,
                        feeNGN: 650000,
                        feeDisplay: '₦650,000',
                        badge: 'Study + 20hr Work',
                        icon: '🎓',
                        desc: 'Authorizes full-time study at U of T, McGill, UBC and designated learning institutions with off-campus work.',
                        status: 'Valid' as const,
                        institution: 'IRCC & EduCanada',
                      },
                      {
                        id: 'can_express_entry',
                        type: 'pr_card' as const,
                        title: 'Canada Express Entry (FSWP PR Nomination)',
                        country: 'Canada' as const,
                        feeNGN: 1200000,
                        feeDisplay: '₦1,200,000',
                        badge: 'Permanent Residence',
                        icon: '🍁',
                        desc: 'Federal Skilled Worker Program invitation to apply and comprehensive permanent residency landing clearance.',
                        status: 'Permanent' as const,
                        institution: 'IRCC Express Entry Pool',
                      },
                      {
                        id: 'can_pnp',
                        type: 'work_permit' as const,
                        title: 'Canada Provincial Nominee Program (PNP)',
                        country: 'Canada' as const,
                        feeNGN: 1500000,
                        feeDisplay: '₦1,500,000',
                        badge: 'Provincial Allocation',
                        icon: '🍁',
                        desc: 'Provincial nomination across Ontario (OINP), British Columbia (BC PNP) or Alberta Advantage Immigration.',
                        status: 'Permanent' as const,
                        institution: 'Provincial Ministries of Immigration',
                      },
                      {
                        id: 'can_pr_card',
                        type: 'pr_card' as const,
                        title: 'Official Canadian Permanent Resident (PR) Card',
                        country: 'Canada' as const,
                        feeNGN: 450000,
                        feeDisplay: '₦450,000',
                        badge: 'Official Wallet PR Card',
                        icon: '🪪',
                        desc: 'Government of Canada biometric Maple PR card required for commercial airline boarding into Canadian airspace.',
                        status: 'Permanent' as const,
                        institution: 'Immigration, Refugees and Citizenship Canada',
                      },
                      {
                        id: 'can_citizenship',
                        type: 'citizenship' as const,
                        title: 'Canadian Citizenship Grant & Passport',
                        country: 'Canada' as const,
                        feeNGN: 2500000,
                        feeDisplay: '₦2,500,000',
                        badge: 'Full Citizenship & Passport',
                        icon: '🇨🇦',
                        desc: 'Oath of Canadian citizenship certificate and biometric Royal Canadian passport with visa-free global travel.',
                        status: 'Permanent' as const,
                        institution: 'His Majesty King Charles III & IRCC',
                      },
                    ].map((item) => {
                      const alreadyOwned = (userProfile?.ownedDocuments || []).some(
                        (d) => d.id === item.id || d.title === item.title
                      );
                      return (
                        <div
                          key={item.id}
                          className="p-3.5 rounded-2xl bg-zinc-950/90 border border-zinc-800 hover:border-red-500/40 transition-all space-y-2 shadow-md"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <span className="text-2xl shrink-0">{item.icon}</span>
                              <div>
                                <div className="text-xs font-black text-white">{item.title}</div>
                                <div className="text-[10px] text-zinc-400 font-mono">{item.badge} · {item.institution}</div>
                              </div>
                            </div>
                            <span className="text-xs font-mono font-black text-amber-300 shrink-0">
                              {item.feeDisplay}
                            </span>
                          </div>

                          <p className="text-[10px] text-zinc-400">{item.desc}</p>

                          <div className="flex items-center justify-between pt-1 border-t border-zinc-900">
                            <span className="text-[9px] font-mono text-zinc-500">
                              Instant Assessment & Issuance
                            </span>
                            {alreadyOwned ? (
                              <button
                                type="button"
                                onClick={() => setCurrentApp('documents')}
                                className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-400 text-emerald-300 font-bold text-[10px] cursor-pointer flex items-center gap-1"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                Owned (View in Docs)
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedImmigrationItem(item);
                                  triggerSound?.('coin');
                                }}
                                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-[10px] shadow cursor-pointer transition-all"
                              >
                                Apply Now ({item.feeDisplay})
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* --- SECTION 2: GENERAL PREREQUISITE DOCUMENTS (ACTIVE) --- */}
                  <div className="space-y-2 pt-2 border-t border-zinc-900">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-base">🛂</span>
                        <span className="text-xs font-black text-white uppercase tracking-wider">
                          General Clearance & Passports
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-sky-500/20 border border-sky-400 text-sky-300 text-[9px] font-mono font-black uppercase">
                        Universal
                      </span>
                    </div>

                    {[
                      {
                        id: 'gen_passport',
                        type: 'passport' as const,
                        title: 'Standard 64-Page Smart ECOWAS International Passport',
                        country: 'Nigeria' as const,
                        feeNGN: 50000,
                        feeDisplay: '₦50,000',
                        badge: '10-Year Validity',
                        icon: '🛂',
                        desc: 'Official biometric international passport booklet issued by Nigeria Immigration Service (NIS).',
                        status: 'Valid' as const,
                        institution: 'Nigeria Immigration Service (NIS)',
                      },
                      {
                        id: 'gen_nin',
                        type: 'nin_slip' as const,
                        title: 'National Identification Number (NIN) Digital Slip',
                        country: 'Nigeria' as const,
                        feeNGN: 5000,
                        feeDisplay: '₦5,000',
                        badge: 'Federal NIMC Identity',
                        icon: '🪪',
                        desc: 'Verified biometric digital NIN card issued by National Identity Management Commission (NIMC).',
                        status: 'Permanent' as const,
                        institution: 'National Identity Management Commission (NIMC)',
                      },
                      {
                        id: 'gen_police',
                        type: 'police_clearance' as const,
                        title: 'Nigeria Police Force Character Clearance Certificate',
                        country: 'General' as const,
                        feeNGN: 25000,
                        feeDisplay: '₦25,000',
                        badge: 'Criminal Record Check',
                        icon: '🛡️',
                        desc: 'Official CID Alagbon police character certificate proving clear criminal background for embassies.',
                        status: 'Valid' as const,
                        institution: 'Nigeria Police Force CID',
                      },
                      {
                        id: 'gen_yellow_card',
                        type: 'yellow_card' as const,
                        title: 'Yellow Fever & Polio International Vaccination Card',
                        country: 'General' as const,
                        feeNGN: 15000,
                        feeDisplay: '₦15,000',
                        badge: 'Port Health Approved',
                        icon: '💉',
                        desc: 'Mandatory international health vaccination certificate issued by Federal Ministry of Health Port Health.',
                        status: 'Valid' as const,
                        institution: 'Federal Ministry of Health',
                      },
                      {
                        id: 'gen_medical',
                        type: 'medical_exam' as const,
                        title: 'Upfront Certified Immigration Medical Examination',
                        country: 'General' as const,
                        feeNGN: 85000,
                        feeDisplay: '₦85,000',
                        badge: 'IOM Panel Physician',
                        icon: '🩺',
                        desc: 'Panel physician clinical physical exam, chest X-ray, and certified lab tests required by foreign embassies.',
                        status: 'Valid' as const,
                        institution: 'IOM Migration Health Assessment Centre',
                      },
                    ].map((item) => {
                      const alreadyOwned = (userProfile?.ownedDocuments || []).some(
                        (d) => d.id === item.id || d.title === item.title
                      );
                      return (
                        <div
                          key={item.id}
                          className="p-3.5 rounded-2xl bg-zinc-950/90 border border-zinc-800 hover:border-sky-500/40 transition-all space-y-2 shadow-md"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <span className="text-2xl shrink-0">{item.icon}</span>
                              <div>
                                <div className="text-xs font-black text-white">{item.title}</div>
                                <div className="text-[10px] text-zinc-400 font-mono">{item.badge} · {item.institution}</div>
                              </div>
                            </div>
                            <span className="text-xs font-mono font-black text-amber-300 shrink-0">
                              {item.feeDisplay}
                            </span>
                          </div>

                          <p className="text-[10px] text-zinc-400">{item.desc}</p>

                          <div className="flex items-center justify-between pt-1 border-t border-zinc-900">
                            <span className="text-[9px] font-mono text-zinc-500">
                              Required for Foreign Embassies
                            </span>
                            {alreadyOwned ? (
                              <button
                                type="button"
                                onClick={() => setCurrentApp('documents')}
                                className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-400 text-emerald-300 font-bold text-[10px] cursor-pointer flex items-center gap-1"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                Owned (View in Docs)
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  if (moneyNGN < item.feeNGN) {
                                    onShowToast(`Insufficient funds! ${item.title} processing fee is ${item.feeDisplay}.`);
                                    triggerSound?.('alert');
                                    return;
                                  }
                                  onUpdateMoney(-item.feeNGN);
                                  const docNum = `DOC-${Math.floor(100000 + Math.random() * 900000)}`;
                                  const newDoc: UserDocument = {
                                    id: item.id,
                                    type: item.type,
                                    title: item.title,
                                    country: item.country,
                                    documentNumber: docNum,
                                    issueDate: new Date().toLocaleDateString('en-GB'),
                                    expiryDate: item.status === 'Permanent' ? 'No Expiry (Lifetime)' : 'Valid for 10 Years',
                                    status: item.status,
                                    desc: item.desc,
                                    costNGN: item.feeNGN,
                                    institution: item.institution,
                                  };
                                  if (userProfile) {
                                    if (!Array.isArray(userProfile.ownedDocuments)) userProfile.ownedDocuments = [];
                                    userProfile.ownedDocuments.push(newDoc);
                                    if (!Array.isArray(userProfile.receipts)) userProfile.receipts = [];
                                    userProfile.receipts.unshift({
                                      id: `TX_DOC_${Date.now()}`,
                                      title: `Immigration Processing: ${item.title}`,
                                      category: 'immigration',
                                      amount: item.feeNGN,
                                      date: new Date().toLocaleDateString(),
                                      type: 'debit',
                                      currency: 'NGN',
                                    });
                                  }
                                  onShowToast(`🎉 Issued! ${item.title} has been added to your Documents app.`);
                                  triggerSound?.('success');
                                }}
                                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-black text-[10px] shadow cursor-pointer transition-all"
                              >
                                Process ({item.feeDisplay})
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* --- SECTION 3: OTHER COUNTRIES (COMING SOON) --- */}
                  <div className="space-y-2 pt-2 border-t border-zinc-900">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-base">🌍</span>
                        <span className="text-xs font-black text-white uppercase tracking-wider">
                          Other Countries Relocation Wing
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[9px] font-mono font-black uppercase">
                        Coming Soon
                      </span>
                    </div>

                    {[
                      { country: 'United Kingdom', title: 'UK Skilled Worker & NHS Healthcare Visa', desc: 'Certificate of Sponsorship employment clearance to London, UK.', icon: '🇬🇧' },
                      { country: 'United Kingdom', title: 'UK High Potential Individual (HPI) & Global Talent', desc: 'Pre-approved endorsement for Nigerian university graduates & tech leaders.', icon: '🇬🇧' },
                      { country: 'United States', title: 'US EB-1 / EB-2 National Interest Waiver (NIW)', desc: 'Direct US Permanent Residency (Green Card) for skilled Nigerian professionals.', icon: '🇺🇸' },
                      { country: 'United States', title: 'US H-1B Specialty Occupation & Consular Visa', desc: 'Non-immigrant consular visa interview clearance in Lagos / Abuja.', icon: '🇺🇸' },
                      { country: 'United Arab Emirates', title: 'UAE 10-Year Golden Visa (Investors & Talents)', desc: 'Long-term self-sponsored residency in Dubai and Abu Dhabi.', icon: '🇦🇪' },
                      { country: 'United Arab Emirates', title: 'Dubai Green Visa & Remote Work Residency', desc: '1-year renewable virtual work permit for freelance tech professionals.', icon: '🇦🇪' },
                    ].map((item, idx) => (
                      <div key={idx} className="p-3 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl shrink-0">{item.icon}</span>
                          <div>
                            <div className="text-xs font-bold text-white">{item.title}</div>
                            <div className="text-[10px] text-zinc-400">{item.desc}</div>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[9px] font-mono font-black uppercase whitespace-nowrap shrink-0">
                          Coming Soon
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Interactive Assessment Modal for Canada Applications */}
                {selectedImmigrationItem && (
                  <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3">
                    <div className="w-full max-w-sm bg-zinc-950 border-2 border-red-500/60 rounded-3xl p-5 shadow-[0_0_50px_rgba(239,68,68,0.3)] text-left space-y-4">
                      <div className="flex items-start justify-between pb-3 border-b border-zinc-800">
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl">🇨🇦</span>
                          <div>
                            <span className="text-[9px] font-mono font-bold text-red-400 uppercase tracking-widest block">
                              IRCC Official Application
                            </span>
                            <h4 className="text-xs font-black text-white">{selectedImmigrationItem.title}</h4>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedImmigrationItem(null)}
                          className="text-zinc-500 hover:text-white p-1 rounded-xl"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-3 text-xs">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                            1. Intended Canadian Settlement Province / City:
                          </label>
                          <select
                            value={visaAnswerDest}
                            onChange={(e) => setVisaAnswerDest(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white"
                          >
                            <option value="Toronto (Ontario)">Toronto (Ontario) — Commercial Hub</option>
                            <option value="Vancouver (British Columbia)">Vancouver (British Columbia) — Pacific Gateway</option>
                            <option value="Montreal (Quebec)">Montreal (Quebec) — Cultural Metropolis</option>
                            <option value="Ottawa (National Capital)">Ottawa (National Capital) — Parliament</option>
                            <option value="Calgary (Alberta)">Calgary (Alberta) — Energy & Rocky Mountains</option>
                            <option value="Halifax (Nova Scotia)">Halifax (Nova Scotia) — Atlantic Seaboard</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                            2. Professional Qualification & Language Tier:
                          </label>
                          <select
                            value={visaAnswerStream}
                            onChange={(e) => setVisaAnswerStream(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white"
                          >
                            <option value="Federal Skilled Worker (Express Entry)">CLB 9+ Advanced English / French (FSWP)</option>
                            <option value="Provincial Nominee Stream (PNP)">Provincial Labour Market Shortage Endorsement</option>
                            <option value="Canadian University Admission Offer">Designated Learning Institution (DLI) Enrolled</option>
                            <option value="Tech & Executive Professional">Global Talent Stream / Executive Transfer</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                            3. Civic Declaration & Clearances:
                          </label>
                          <select
                            value={visaAnswerFunds}
                            onChange={(e) => setVisaAnswerFunds(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white"
                          >
                            <option value="Certified Settlement Funds Available">Verified Proof of Settlement Funds + Clear Record</option>
                            <option value="Full Biometric & Health Clearance">Panel Physician Medical + Police Character Certified</option>
                          </select>
                        </div>

                        <div className="p-2.5 rounded-xl bg-red-950/40 border border-red-500/30 flex items-center justify-between text-[11px] font-mono">
                          <span className="text-zinc-300">Application & Biometrics Fee:</span>
                          <span className="text-amber-300 font-black">{selectedImmigrationItem.feeDisplay}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedImmigrationItem(null)}
                          className="flex-1 py-2 rounded-xl bg-zinc-900 text-zinc-400 text-xs font-bold"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (moneyNGN < selectedImmigrationItem.feeNGN) {
                              onShowToast(`Insufficient funds! Fee is ${selectedImmigrationItem.feeDisplay}.`);
                              triggerSound?.('alert');
                              return;
                            }
                            onUpdateMoney(-selectedImmigrationItem.feeNGN);
                            const docNum = `CAN-${selectedImmigrationItem.type.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;
                            const newDoc: UserDocument = {
                              id: selectedImmigrationItem.id,
                              type: selectedImmigrationItem.type,
                              title: selectedImmigrationItem.title,
                              country: 'Canada',
                              documentNumber: docNum,
                              issueDate: new Date().toLocaleDateString('en-CA'),
                              validityWeeks: selectedImmigrationItem.status === 'Permanent' ? undefined : (selectedImmigrationItem.type === 'visa' ? 1 : 2),
                              expiresAtTimestamp: selectedImmigrationItem.status === 'Permanent' ? undefined : Date.now() + (selectedImmigrationItem.type === 'visa' ? 7 : 14) * 86400000,
                              expiryDate: selectedImmigrationItem.status === 'Permanent'
                                ? 'Permanent (Lifetime)'
                                : selectedImmigrationItem.type === 'visa'
                                ? 'Expires in 1 Week'
                                : 'Expires in 2 Weeks',
                              status: selectedImmigrationItem.status,
                              isExpired: false,
                              desc: `${selectedImmigrationItem.desc} Registered for ${visaAnswerDest} via ${visaAnswerStream}.`,
                              costNGN: selectedImmigrationItem.feeNGN,
                              institution: selectedImmigrationItem.institution,
                            };
                            if (userProfile) {
                              if (!Array.isArray(userProfile.ownedDocuments)) userProfile.ownedDocuments = [];
                              userProfile.ownedDocuments.push(newDoc);
                              if (!Array.isArray(userProfile.receipts)) userProfile.receipts = [];
                              userProfile.receipts.unshift({
                                id: `TX_IMM_${Date.now()}`,
                                title: `IRCC Approval: ${selectedImmigrationItem.title}`,
                                category: 'immigration',
                                amount: selectedImmigrationItem.feeNGN,
                                date: new Date().toLocaleDateString(),
                                type: 'debit',
                                currency: 'NGN',
                              });
                            }
                            setSelectedImmigrationItem(null);
                            onShowToast(`🇨🇦 CONGRATULATIONS! Your ${newDoc.title} is officially approved by IRCC! View in Documents app.`);
                            triggerSound?.('success');
                          }}
                          className="flex-1 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-black text-xs shadow-lg cursor-pointer hover:scale-105 active:scale-95 transition-all"
                        >
                          Pay & Submit
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* =============================================================
                10. DEVICE STORE (88+ PHONES INCLUDING XIAOMI 18 EDITIONS)
                ============================================================= */}
            {currentApp === 'phones' && (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-indigo-950/90 to-purple-950/80 border border-indigo-500/40 rounded-2xl p-3 flex items-center justify-between shadow-lg">
                  <div>
                    <h3 className="text-xs font-black text-indigo-200">Computer Village Tech Hub</h3>
                    <p className="text-[10px] text-zinc-400">{filteredPhones.length} Real-Life Models Available</p>
                  </div>
                  <Smartphone className="w-5 h-5 text-indigo-400" />
                </div>

                {/* Instant Search Bar */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={phoneSearchQuery}
                    onChange={(e) => setPhoneSearchQuery(e.target.value)}
                    placeholder="Search phones (e.g. Xiaomi 18, Ultra, Fold, iPhone)..."
                    className="w-full bg-zinc-950/90 border border-zinc-800 rounded-xl pl-8 pr-7 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                  />
                  {phoneSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setPhoneSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Brand Tabs with Xiaomi Priority */}
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {['All', 'Xiaomi', 'Apple', 'Samsung', 'Google', 'Tecno', 'Infinix', 'OnePlus'].map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setPhoneBrandFilter(b)}
                      className={`px-3 py-1 rounded-xl text-[10px] font-bold transition-all whitespace-nowrap cursor-pointer ${
                        phoneBrandFilter === b
                          ? 'bg-indigo-600 text-white font-black shadow-md'
                          : 'bg-zinc-900/80 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>

                <div className="space-y-2">
                  {filteredPhones.map((ph) => {
                    const isCurrent = userProfile?.phoneModel === ph.model;
                    return (
                      <div key={ph.model} className="p-3 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span>{ph.name}</span>
                            {isCurrent && (
                              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-bold">
                                Current
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-zinc-400">{ph.storage} · {ph.specs}</div>
                          {(() => {
                            const isCanada = activeStateKey === 'canada';
                            const priceCAD = Math.round(ph.price / 960.54);
                            return (
                              <span className="text-xs font-mono font-bold text-indigo-400 mt-0.5 block">
                                {isCanada ? `$${priceCAD.toLocaleString()} CAD` : formatNaira(ph.price)}
                              </span>
                            );
                          })()}
                        </div>
                        {!isCurrent && (
                          <button
                            type="button"
                            onClick={() => {
                              const isCanada = activeStateKey === 'canada';
                              const priceCAD = Math.round(ph.price / 960.54);
                              if (isCanada) {
                                const userCad = userProfile?.bankCAD || 0;
                                if (userCad < priceCAD) {
                                  onShowToast(`Insufficient CAD funds! Requires $${priceCAD.toLocaleString()} CAD.`);
                                  triggerSound?.('alert');
                                  return;
                                }
                                if (userProfile) {
                                  userProfile.bankCAD = userCad - priceCAD;
                                  userProfile.phoneModel = ph.model;
                                }
                              } else {
                                if (moneyNGN < ph.price) {
                                  onShowToast('Insufficient funds for phone upgrade!');
                                  triggerSound?.('alert');
                                  return;
                                }
                                onUpdateMoney(-ph.price);
                                if (userProfile) {
                                  userProfile.phoneModel = ph.model;
                                }
                              }
                              onShowToast(`📱 Upgraded to ${ph.name}! Hardware updated.`);
                              triggerSound?.('success');
                            }}
                            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer"
                          >
                            Upgrade
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* =============================================================
                11. BOUTIQUE (100+ CLOTHING ITEMS + 105 CANADIAN WINTER LUXURY)
                ============================================================= */}
            {currentApp === 'boutique' && (
              <div className="space-y-4">
                {/* Region Tabs */}
                <div className="flex bg-zinc-950 p-1 rounded-2xl border border-zinc-800 text-xs font-bold gap-1">
                  <button
                    type="button"
                    onClick={() => setBoutiqueRegionTab('nigeria')}
                    className={`flex-1 py-1.5 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1 ${
                      boutiqueRegionTab === 'nigeria'
                        ? 'bg-pink-600 text-white font-black shadow-md'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span>🇳🇬 Lekki Couture</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setBoutiqueRegionTab('canada')}
                    className={`flex-1 py-1.5 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1 ${
                      boutiqueRegionTab === 'canada'
                        ? 'bg-gradient-to-r from-red-600 to-rose-500 text-white font-black shadow-md'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span>🍁 Canada Winter Luxury (105 Items)</span>
                  </button>
                </div>

                {/* TAB 1: NIGERIAN BOUTIQUE */}
                {boutiqueRegionTab === 'nigeria' && (
                  <div className="space-y-3">
                    <div className="bg-pink-950/80 border border-pink-500/40 rounded-2xl p-3 flex items-center justify-between">
                      <div>
                        <h3 className="text-xs font-black text-pink-200">Lekki Couture &amp; Boutique</h3>
                        <p className="text-[10px] text-zinc-400">{filteredBoutique.length} Designer Fashion Pieces</p>
                      </div>
                      <ShoppingBag className="w-5 h-5 text-pink-400" />
                    </div>

                    {/* Category Tabs */}
                    <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                      {['All', 'Royal Agbada', 'Senator Suits', 'Ankara & Lace', 'Streetwear', 'Watches & Jewelry', 'Luxury Footwear', 'Accessories'].map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setBoutiqueCategoryFilter(cat)}
                          className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all whitespace-nowrap cursor-pointer ${
                            boutiqueCategoryFilter === cat ? 'bg-pink-600 text-white font-black' : 'bg-zinc-900/80 text-zinc-400 hover:text-white'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    <div className="space-y-2">
                      {filteredBoutique.map((item) => (
                        <div key={item.id} className="p-3 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex items-center justify-between shadow-md">
                          <div className="flex items-center gap-2.5">
                            <span className="text-2xl shrink-0">{item.icon}</span>
                            <div>
                              <div className="text-xs font-bold text-white">{item.name}</div>
                              <div className="text-[10px] text-zinc-400">{item.prestige} Prestige · 📍 {item.stateOrigin}</div>
                              <span className="text-xs font-mono font-bold text-pink-400 mt-0.5 block">{formatNaira(item.price)}</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              if (moneyNGN < item.price) {
                                onShowToast('Insufficient funds for boutique luxury!');
                                triggerSound?.('alert');
                                return;
                              }
                              onUpdateMoney(-item.price);
                              onUpdateStats({ happiness: 25 });
                              onShowToast(`✨ Acquired ${item.name}! Added to your wardrobe.`);
                              triggerSound?.('coin');
                            }}
                            className="px-3 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs cursor-pointer shrink-0"
                          >
                            Acquire
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 2: CANADIAN WINTER LUXURY (105 DISTINCT ITEMS IN CAD) */}
                {boutiqueRegionTab === 'canada' && (
                  <div className="space-y-3">
                    <div className="bg-gradient-to-r from-red-950/90 to-zinc-950 border border-red-500/40 rounded-2xl p-3 flex items-center justify-between shadow-lg">
                      <div>
                        <h3 className="text-xs font-black text-red-200 flex items-center gap-1.5">
                          <span>🍁</span>
                          <span>Yorkville &amp; Sainte-Catherine Canadian Luxury</span>
                        </h3>
                        <p className="text-[10px] text-zinc-400 font-mono">105 Cold-Weather Designer Outfits in Canadian Dollars ($ CAD)</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] font-mono text-zinc-400 uppercase block">CAD Bank:</span>
                        <span className="text-xs font-mono font-black text-amber-300">
                          ${(userProfile?.bankCAD || 0).toLocaleString()} CAD
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {CANADIAN_BOUTIQUE_105.map((item) => (
                        <div key={item.id} className="p-3 rounded-2xl bg-zinc-950/80 border border-zinc-800 hover:border-red-500/40 transition-all flex items-center justify-between shadow-md">
                          <div className="flex items-center gap-2.5 min-w-0 pr-2">
                            <span className="text-2xl shrink-0">{item.icon}</span>
                            <div>
                              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                                <span>{item.name}</span>
                                <span className="px-1.5 py-0.2 rounded text-[8px] font-mono font-bold uppercase bg-red-950 text-red-300 border border-red-500/40">
                                  {item.category}
                                </span>
                              </div>
                              <div className="text-[10px] text-zinc-400 truncate">{item.desc}</div>
                              <span className="text-xs font-mono font-bold text-amber-300 mt-0.5 block">
                                ${item.priceCAD.toLocaleString()} CAD
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const userCad = userProfile?.bankCAD || 0;
                              if (userCad < item.priceCAD) {
                                onShowToast(`Insufficient Canadian Dollars! Requires $${item.priceCAD.toLocaleString()} CAD. Exchange NGN to CAD in Naija Pay.`);
                                triggerSound?.('alert');
                                return;
                              }
                              if (userProfile) {
                                userProfile.bankCAD = userCad - item.priceCAD;
                                if (!userProfile.inventory) userProfile.inventory = [];
                                userProfile.inventory.push(`${item.name} (Canadian Wardrobe)`);
                                if (!Array.isArray(userProfile.receipts)) userProfile.receipts = [];
                                userProfile.receipts.unshift({
                                  id: `CLOTH_CAD_${Date.now()}`,
                                  title: `Canada Boutique: ${item.name}`,
                                  category: 'lifestyle',
                                  amount: item.priceCAD,
                                  date: new Date().toLocaleDateString('en-CA'),
                                  type: 'debit',
                                  currency: 'CAD',
                                });
                              }
                              onUpdateStats({ happiness: 35 });
                              onShowToast(`🍁 Acquired ${item.name}! Added to Canadian wardrobe (-$${item.priceCAD.toLocaleString()} CAD).`);
                              triggerSound?.('coin');
                            }}
                            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs cursor-pointer shrink-0 shadow"
                          >
                            Buy CAD
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* =============================================================
                12. MESSAGES APP ("MY AI" + USERNAME SEARCH)
                ============================================================= */}
            {currentApp === 'messenger' && (
              <div className="flex flex-col h-[520px] bg-zinc-950/95 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
                {/* Header Switcher */}
                <div className="p-3 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveChatTab('my_ai')}
                      className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                        activeChatTab === 'my_ai' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-black' : 'bg-zinc-800 text-zinc-300'
                      }`}
                    >
                      <Bot className="w-3.5 h-3.5" />
                      <span>My AI</span>
                    </button>
                    {activeDmUser && (
                      <button
                        type="button"
                        onClick={() => setActiveChatTab('dm')}
                        className={`px-3 py-1 rounded-xl text-xs font-bold cursor-pointer ${
                          activeChatTab === 'dm' ? 'bg-emerald-500 text-black font-black' : 'bg-zinc-800 text-zinc-300'
                        }`}
                      >
                        @{activeDmUser}
                      </button>
                    )}
                  </div>
                </div>

                {/* Username Search Bar (Online game citizen search) */}
                <div className="p-2.5 border-b border-zinc-800/80 bg-zinc-900/60 relative">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-400" />
                    <input
                      type="text"
                      placeholder="Search username to message..."
                      value={usernameSearchQuery}
                      onChange={(e) => setUsernameSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && usernameSearchQuery.trim()) {
                          setActiveDmUser(usernameSearchQuery.trim().replace(/^@/, ''));
                          setActiveChatTab('dm');
                          setUsernameSearchQuery('');
                        }
                      }}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-8 pr-16 py-1.5 text-xs text-white"
                    />
                    {usernameSearchQuery.trim() && (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveDmUser(usernameSearchQuery.trim().replace(/^@/, ''));
                          setActiveChatTab('dm');
                          setUsernameSearchQuery('');
                        }}
                        className="absolute right-1.5 top-1 px-2.5 py-1 bg-emerald-500 text-black font-bold text-[10px] rounded-lg cursor-pointer"
                      >
                        Chat
                      </button>
                    )}
                  </div>

                  {/* Real-time search dropdown */}
                  {usernameSearchQuery.trim() && (
                    <div className="absolute left-2.5 right-2.5 top-12 z-30 bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl p-2 max-h-44 overflow-y-auto space-y-1">
                      {matchingMsgUsers.length > 0 ? (
                        matchingMsgUsers.map((user) => (
                          <div
                            key={user.username}
                            onClick={() => {
                              setActiveDmUser(user.username);
                              setActiveChatTab('dm');
                              setUsernameSearchQuery('');
                            }}
                            className="p-2 rounded-xl hover:bg-zinc-900 flex items-center justify-between cursor-pointer transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{typeof user.avatar === 'string' ? user.avatar : '🇳🇬'}</span>
                              <div className="text-left">
                                <div className="text-xs font-bold text-white">{user.firstName} {user.lastName}</div>
                                <div className="text-[10px] text-emerald-400 font-mono">@{user.username}</div>
                              </div>
                            </div>
                            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">Chat</span>
                          </div>
                        ))
                      ) : (
                        <div className="py-2.5 text-center text-[10px] text-zinc-400">
                          No available user matching "@{usernameSearchQuery.trim().replace(/^@/, '')}"
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Chat Message Stream */}
                <div className="flex-1 p-3 overflow-y-auto space-y-2.5 scrollbar-none">
                  {activeChatTab === 'my_ai' ? (
                    <>
                      {aiChatHistory.map((msg, i) => (
                        <div
                          key={i}
                          className={`flex flex-col ${msg.sender === 'me' ? 'items-end' : 'items-start'}`}
                        >
                          <div
                            className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                              msg.sender === 'me'
                                ? 'bg-emerald-600 text-white rounded-br-none shadow-md'
                                : 'bg-zinc-850 text-zinc-100 rounded-bl-none border border-zinc-700/80 shadow-md'
                            }`}
                          >
                            {msg.sender === 'ai' && (
                              <div className="flex items-center gap-1 text-[10px] text-amber-300 font-bold mb-1">
                                <Bot className="w-3 h-3" />
                                <span>My AI</span>
                              </div>
                            )}
                            {msg.text}
                          </div>
                          <span className="text-[9px] text-zinc-500 mt-0.5">{msg.time}</span>
                        </div>
                      ))}
                      {isAiLoading && (
                        <div className="flex items-center gap-2 p-2 text-xs text-emerald-400">
                          <Bot className="w-4 h-4 animate-spin" />
                          <span>My AI is typing...</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {(dmThreads[activeDmUser] || []).map((msg, i) => (
                        <div
                          key={i}
                          className={`flex flex-col ${msg.sender === 'me' ? 'items-end' : 'items-start'}`}
                        >
                          <div
                            className={`max-w-[80%] p-2.5 rounded-2xl text-xs ${
                              msg.sender === 'me'
                                ? 'bg-emerald-600 text-white rounded-br-none'
                                : 'bg-zinc-850 text-zinc-100 rounded-bl-none border border-zinc-700'
                            }`}
                          >
                            {msg.text}
                          </div>
                          <span className="text-[9px] text-zinc-500 mt-0.5">{msg.time}</span>
                        </div>
                      ))}
                      {(!dmThreads[activeDmUser] || dmThreads[activeDmUser].length === 0) && (
                        <div className="text-center py-8 text-xs text-zinc-500">
                          No messages yet with @{activeDmUser}. Send a message to start chatting!
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Input Bar */}
                <div className="p-2 border-t border-zinc-800 flex gap-1.5 bg-zinc-950">
                  <input
                    type="text"
                    placeholder={activeChatTab === 'my_ai' ? "Ask My AI anything..." : `Message @${activeDmUser}...`}
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        if (activeChatTab === 'my_ai') handleSendAiMessage();
                        else handleSendDmMessage();
                      }
                    }}
                    className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (activeChatTab === 'my_ai') handleSendAiMessage();
                      else handleSendDmMessage();
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-500 text-black font-black text-xs cursor-pointer shadow-md"
                  >
                    Send
                  </button>
                </div>
              </div>
            )}

            {/* =============================================================
                13. PHONE CALL APP (USERNAME SEARCH + WORKING MIC WAVEFORM)
                ============================================================= */}
            {currentApp === 'call' && (
              <div className="space-y-4">
                {activeCallUser ? (
                  /* ACTIVE LIVE VOICE CALL VIEW */
                  <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 text-center space-y-6 shadow-2xl">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-700 mx-auto flex items-center justify-center text-3xl shadow-lg ring-4 ring-emerald-500/20">
                      👤
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white">@{activeCallUser}</h3>
                      <div className="text-xs text-emerald-400 font-mono mt-1 font-bold">
                        Call Connected · {String(Math.floor(callDurationSecs / 60)).padStart(2, '0')}:
                        {String(callDurationSecs % 60).padStart(2, '0')}
                      </div>
                      <div className="text-[10px] text-zinc-400 mt-1">Live Audio Channel · Working Mic Active</div>
                    </div>

                    {/* LIVE MICROPHONE AUDIO VISUALIZER BARS */}
                    <div className="flex items-center justify-center gap-1.5 h-12 bg-zinc-900/80 rounded-2xl p-2 border border-zinc-800">
                      {[15, 35, 65, 90, 100, 75, 45, 80, 50, 30].map((baseHeight, i) => {
                        const dynamicHeight = Math.max(
                          6,
                          Math.min(40, isMicMuted ? 6 : Math.round((baseHeight * micAudioVolume) / 100) + 6)
                        );
                        return (
                          <div
                            key={i}
                            style={{ height: `${dynamicHeight}px` }}
                            className={`w-1.5 rounded-full transition-all duration-75 ${
                              isMicMuted ? 'bg-zinc-700' : 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]'
                            }`}
                          />
                        );
                      })}
                    </div>

                    {micErrorMsg && (
                      <div className="text-[10px] text-amber-300 bg-amber-950/40 border border-amber-500/30 rounded-xl p-2">
                        {micErrorMsg}
                      </div>
                    )}

                    {/* CALL ACTIONS (MUTE & HANG UP) */}
                    <div className="flex justify-center items-center gap-6">
                      <button
                        type="button"
                        onClick={toggleMicMute}
                        className={`w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-all ${
                          isMicMuted ? 'bg-amber-500 text-black' : 'bg-zinc-800 text-white hover:bg-zinc-700'
                        }`}
                        title={isMicMuted ? 'Unmute Mic' : 'Mute Mic'}
                      >
                        {isMicMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                      </button>

                      <button
                        type="button"
                        onClick={endVoiceCall}
                        className="w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center cursor-pointer shadow-lg shadow-rose-950/80 active:scale-95"
                        title="End Call"
                      >
                        <Phone className="w-6 h-6 rotate-135" />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* SEARCH USERNAME TO CALL */
                  <div className="space-y-4">
                    <div className="bg-emerald-950/80 border border-emerald-500/40 rounded-2xl p-4 text-center space-y-1">
                      <Phone className="w-6 h-6 text-emerald-400 mx-auto" />
                      <h3 className="text-xs font-black text-white">Live Voice Call</h3>
                      <p className="text-[10px] text-zinc-400">Search any citizen username to speak with working mic audio</p>
                    </div>

                    <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 space-y-3">
                      <span className="text-xs font-bold text-white block">Search Citizen Username</span>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="e.g. chiboy_52, nepo_chief, lagos_hustler..."
                          value={callUsernameSearch}
                          onChange={(e) => setCallUsernameSearch(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && callUsernameSearch.trim()) {
                              startVoiceCall(callUsernameSearch.trim().replace(/^@/, ''));
                            }
                          }}
                          className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (callUsernameSearch.trim()) {
                              startVoiceCall(callUsernameSearch.trim().replace(/^@/, ''));
                            }
                          }}
                          className="px-4 py-2 bg-emerald-500 text-black font-black text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md"
                        >
                          <Phone className="w-3.5 h-3.5 fill-black" />
                          <span>Call</span>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {callUsernameSearch.trim() ? (
                        matchingCallUsers.length > 0 ? (
                          <>
                            <span className="text-[10px] text-zinc-400 uppercase font-bold block">
                              Registered Citizens ({matchingCallUsers.length})
                            </span>
                            {matchingCallUsers.map((user) => (
                              <div
                                key={user.username}
                                className="p-3 rounded-2xl bg-zinc-950/80 border border-emerald-500/30 flex items-center justify-between"
                              >
                                <div className="flex items-center gap-2.5">
                                  <span className="text-xl">{typeof user.avatar === 'string' ? user.avatar : '🇳🇬'}</span>
                                  <div>
                                    <span className="text-xs font-bold text-white block">
                                      {user.firstName} {user.lastName}
                                    </span>
                                    <span className="text-[10px] text-emerald-400 font-mono">
                                      @{user.username}
                                    </span>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => startVoiceCall(user.username)}
                                  className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs cursor-pointer shadow flex items-center gap-1.5"
                                >
                                  <Phone className="w-3.5 h-3.5 fill-black" />
                                  <span>Call</span>
                                </button>
                              </div>
                            ))}
                          </>
                        ) : (
                          <div className="p-5 rounded-2xl bg-zinc-950/90 border border-zinc-800 text-center space-y-2">
                            <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
                              <Users className="w-5 h-5" />
                            </div>
                            <div className="text-xs font-bold text-white">No available user</div>
                            <p className="text-[10px] text-zinc-400">
                              No citizen found matching "@{callUsernameSearch.trim().replace(/^@/, '')}". Please verify the username.
                            </p>
                          </div>
                        )
                      ) : (
                        <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-850 text-center text-xs text-zinc-400 space-y-1">
                          <p className="font-bold text-white">Citizen Call Directory</p>
                          <p className="text-[10px] text-zinc-500">
                            Type a registered citizen's username in the search bar above to verify and call them directly.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* =============================================================
                14. INTERSTATE TRAVEL (ABC / GIGM / AIRLINES)
                ============================================================= */}
            {/* =============================================================
                14. INTERSTATE TRAVEL (LUXURY COACHES & ROAD TRAVEL ONLY)
                ============================================================= */}
            {currentApp === 'bus' && (
              <div className="space-y-3">
                {/* Header Banner */}
                <div className="bg-gradient-to-r from-teal-950 via-zinc-950 to-emerald-950 border border-teal-500/40 rounded-2xl p-3.5 space-y-1.5 shadow-lg text-left">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-teal-500/20 border border-teal-400 flex items-center justify-center text-teal-300">
                        <Bus className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-xs font-black text-white">Interstate Road Travel</h3>
                        <p className="text-[10px] text-teal-300 font-mono">Luxury Coaches & Motor Parks (Road Travel Only)</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40 text-[9px] font-mono font-bold">
                      ROAD ONLY
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-1 border-t border-zinc-800/80">
                    <span>Departing: <strong className="text-emerald-400 capitalize">{activeStateKey} State</strong></span>
                    <span className="font-mono text-zinc-300">Fares: ₦250k - ₦650k</span>
                  </div>
                </div>

                <div className="space-y-2">
                  {/* =============================================================
                      CANADA ROAD EXPRESS (DIRECTLY AT THE TOP, ABOVE ABIA STATE)
                      Triggers joke modal on click: "shey you be mumu, you wan use bus go canada, ole, gerrout jorr😂"
                      ============================================================= */}
                  <div
                    onClick={() => {
                      setPhoneCanadaBusJokeOpen(true);
                      triggerSound?.('alert');
                    }}
                    className="p-3.5 rounded-2xl bg-gradient-to-r from-red-950/80 via-zinc-950 to-neutral-950 border-2 border-red-500/60 hover:border-red-400 transition-all cursor-pointer shadow-lg space-y-2 group text-left"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-red-900/40 border border-red-500/50 flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">
                          🍁
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs font-black text-white group-hover:text-red-300 transition-colors">
                              Canada (Toronto / Vancouver Express)
                            </h4>
                            <span className="px-1.5 py-0.2 rounded bg-red-950 border border-red-600/50 text-red-300 text-[8px] font-mono font-bold uppercase">
                              Road Bus
                            </span>
                          </div>
                          <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
                            Transatlantic Highway · Atlantic Ocean Crossing
                          </div>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 font-mono text-[10px] font-black border border-red-500/40 shrink-0">
                        ₦500,000
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-zinc-900">
                      <span className="text-zinc-500 font-mono">Operator: Atlantic Ocean Danfo Express</span>
                      <span className="text-red-400 font-bold group-hover:underline flex items-center gap-1">
                        <span>Board Road Bus</span>
                        <span>➔</span>
                      </span>
                    </div>
                  </div>

                  {/* =============================================================
                      36 NIGERIAN STATES (ALPHABETICAL: ABIA STATE, ADAMAWA, ETC.)
                      ============================================================= */}
                  {NIGERIA_36_STATES_ALPHABETICAL.map((st) => {
                    const isCurrent = st.id.toLowerCase() === activeStateKey.toLowerCase();
                    const trip = calculateInterstateTrip(activeStateKey, st.id);
                    return (
                      <div
                        key={st.id}
                        className={`p-3 rounded-2xl border transition-all text-left space-y-2 ${
                          isCurrent
                            ? 'bg-zinc-950/40 border-zinc-850 opacity-60'
                            : 'bg-zinc-950/90 border-zinc-800 hover:border-teal-500/40 shadow-md'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-xs font-black text-white">{st.name} State</h4>
                              {isCurrent && (
                                <span className="px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/40 text-[8px] font-mono font-bold">
                                  Current State
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
                              {isCurrent
                                ? 'You are already in this state (Unavailable)'
                                : `${trip.distanceKm} km · ${trip.travelTimeFormatted} · ${trip.busOperator}`}
                            </div>
                          </div>
                          <span className={`font-mono text-xs font-black ${isCurrent ? 'text-zinc-500' : 'text-teal-400'}`}>
                            {isCurrent ? 'N/A' : formatNaira(trip.fareNGN)}
                          </span>
                        </div>

                        {!isCurrent && (
                          <div className="pt-1.5 border-t border-zinc-900 flex items-center justify-between">
                            <span className="text-[9px] text-zinc-500 font-mono">Terminal: Central Motor Park</span>
                            <button
                              type="button"
                              onClick={() => {
                                if (moneyNGN < trip.fareNGN) {
                                  onShowToast(`Insufficient funds! Requires ${formatNaira(trip.fareNGN)} for interstate bus fare.`);
                                  triggerSound?.('alert');
                                  return;
                                }
                                onUpdateMoney(-trip.fareNGN);
                                if (userProfile) {
                                  if (!Array.isArray(userProfile.receipts)) userProfile.receipts = [];
                                  userProfile.receipts.unshift({
                                    id: `BUS_${Date.now()}`,
                                    title: `Interstate Road Bus: ${trip.busOperator} to ${st.name}`,
                                    category: 'transfer',
                                    amount: trip.fareNGN,
                                    date: new Date().toLocaleDateString(),
                                    type: 'debit',
                                    currency: 'NGN',
                                  });
                                }
                                if (onBusTravel) {
                                  onBusTravel(st as any, trip.fareNGN, trip.busOperator);
                                } else if (onInterstateTravel) {
                                  onInterstateTravel(st as any, trip.fareNGN);
                                }
                                onShowToast(`🎉 Safe journey! Boarded ${trip.busOperator} coach to ${st.name} State (-${formatNaira(trip.fareNGN)})!`);
                                triggerSound?.('success');
                                onClose();
                              }}
                              className="px-3 py-1 rounded-xl bg-teal-500 hover:bg-teal-400 text-black font-black text-[10px] cursor-pointer shadow transition-all active:scale-95"
                            >
                              Board Bus ({formatNaira(trip.fareNGN)})
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* =============================================================
                15. SETTINGS (ACCOUNT, CLOUD SYNC, SECURITY, AVATAR, WALLPAPER & OWNER CONTROL)
                ============================================================= */}
            {currentApp === 'settings' && (
              <div className="space-y-4">
                {/* Account Profile Card */}
                <div className="bg-gradient-to-br from-zinc-900 via-zinc-950 to-neutral-900 border border-zinc-800 rounded-3xl p-4 shadow-xl space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-zinc-800 border-2 border-emerald-500/50 flex items-center justify-center overflow-hidden shadow-lg shrink-0">
                      <CharacterRenderer avatar={userProfile?.avatar} size="sm" fullBody={false} showBackground={false} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="text-sm font-black text-white truncate">
                          {userProfile?.firstName} {userProfile?.lastName}
                        </h3>
                        {checkIsOwner(userProfile) && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-400/50 text-amber-300 text-[8px] font-black uppercase">
                            OWNER
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-mono text-emerald-400 font-bold">
                        @{userProfile?.username}
                      </div>
                      <span className="text-[10px] text-zinc-400 font-medium block truncate">
                        {userProfile?.email || userProfile?.gmail || 'Registered Citizen'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono pt-2 border-t border-zinc-800/80">
                    <div className="bg-zinc-900/60 p-2 rounded-xl border border-zinc-800">
                      <span className="text-zinc-500 block uppercase">Email Status</span>
                      <span className={userProfile?.isVerified ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                        {userProfile?.isVerified ? 'Verified' : 'Unverified'}
                      </span>
                    </div>
                    <div className="bg-zinc-900/60 p-2 rounded-xl border border-zinc-800">
                      <span className="text-zinc-500 block uppercase">Cloud Sync</span>
                      <span className={`font-bold uppercase ${
                        cloudSyncStatus === 'synced'
                          ? 'text-emerald-400'
                          : cloudSyncStatus === 'syncing'
                          ? 'text-sky-400'
                          : cloudSyncStatus === 'conflict'
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}>
                        {cloudSyncStatus}
                      </span>
                    </div>
                    <div className="bg-zinc-900/60 p-2 rounded-xl border border-zinc-800">
                      <span className="text-zinc-500 block uppercase">Account ID</span>
                      <span className="text-zinc-200 font-bold truncate block" title={userProfile?.uid || ''}>
                        {userProfile?.uid ? `${userProfile.uid.slice(0, 10)}...` : 'Cloud UID'}
                      </span>
                    </div>
                    <div className="bg-zinc-900/60 p-2 rounded-xl border border-zinc-800">
                      <span className="text-zinc-500 block uppercase">Registered</span>
                      <span className="text-white font-bold">
                        {userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString() : 'Active'}
                      </span>
                    </div>
                  </div>

                  {onTriggerCloudSync && (
                    <button
                      type="button"
                      onClick={() => {
                        onTriggerCloudSync();
                        onShowToast('Synchronizing progress with Naija Life Cloud...');
                      }}
                      className="w-full py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-emerald-300 font-bold text-[11px] flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Cloud className="w-3.5 h-3.5" />
                      <span>Sync Progress to Cloud Now</span>
                    </button>
                  )}
                </div>

                {/* ACCOUNT & SECURITY CONTROLS */}
                <div className="p-4 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <h4 className="text-xs font-black text-white uppercase tracking-wider">Account &amp; Security</h4>
                    </div>
                    <span className="text-[9px] font-mono text-zinc-500">Cloud Identity</span>
                  </div>

                  {accountSecurityFeedback && (
                    <div className={`p-2.5 rounded-xl text-[11px] border ${
                      accountSecurityFeedback.type === 'ok'
                        ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                        : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
                    }`}>
                      {accountSecurityFeedback.text}
                    </div>
                  )}

                  {(() => {
                    const hasPasswordProvider = auth.currentUser?.providerData?.some((p) => p.providerId === 'password') ?? false;
                    return !hasPasswordProvider && auth.currentUser ? (
                      <p className="text-[10px] text-emerald-300/90 bg-emerald-950/40 border border-emerald-500/30 rounded-xl px-2.5 py-1.5">
                        Signed in via Google ({auth.currentUser.email}). Username updates work directly here; email &amp; password security are managed by your Google Account.
                      </p>
                    ) : null;
                  })()}

                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setAccountActionTab(accountActionTab === 'username' ? 'none' : 'username');
                        setNewUsernameInput(userProfile?.username || '');
                        setUsernameStatusMsg(null);
                        setAccountSecurityFeedback(null);
                      }}
                      className={`py-2 px-2.5 rounded-xl text-[10px] font-bold border cursor-pointer flex items-center justify-center gap-1.5 ${
                        accountActionTab === 'username'
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white'
                      }`}
                    >
                      <User className="w-3 h-3" />
                      <span>Change Username</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const hasPwd = auth.currentUser?.providerData?.some((p) => p.providerId === 'password') ?? false;
                        if (!hasPwd) {
                          setAccountSecurityFeedback({
                            type: 'err',
                            text: 'This account uses Google Sign-In. Manage your password directly in your Google Account security settings.',
                          });
                          return;
                        }
                        setAccountActionTab(accountActionTab === 'password' ? 'none' : 'password');
                        setCurPwdInput('');
                        setNewPwdInput('');
                        setConfirmPwdInput('');
                        setAccountSecurityFeedback(null);
                      }}
                      className={`py-2 px-2.5 rounded-xl text-[10px] font-bold border cursor-pointer flex items-center justify-center gap-1.5 ${
                        accountActionTab === 'password'
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white'
                      }`}
                    >
                      <Lock className="w-3 h-3" />
                      <span>Change Password</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const hasPwd = auth.currentUser?.providerData?.some((p) => p.providerId === 'password') ?? false;
                        if (!hasPwd) {
                          setAccountSecurityFeedback({
                            type: 'err',
                            text: 'This account uses Google Sign-In. Your email identity is synced with your Google Account.',
                          });
                          return;
                        }
                        setAccountActionTab(accountActionTab === 'email' ? 'none' : 'email');
                        setNewEmailInput('');
                        setEmailChangePwdInput('');
                        setAccountSecurityFeedback(null);
                      }}
                      className={`py-2 px-2.5 rounded-xl text-[10px] font-bold border cursor-pointer flex items-center justify-center gap-1.5 ${
                        accountActionTab === 'email'
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white'
                      }`}
                    >
                      <Mail className="w-3 h-3" />
                      <span>Change Email</span>
                    </button>
                    <button
                      type="button"
                      disabled={accountSecurityBusy}
                      onClick={async () => {
                        const targetEmail = userProfile?.email || userProfile?.gmail || auth.currentUser?.email || '';
                        if (!targetEmail) return;
                        setAccountSecurityBusy(true);
                        setAccountSecurityFeedback(null);
                        try {
                          await sendPasswordReset(targetEmail);
                          setAccountSecurityFeedback({
                            type: 'ok',
                            text: `Password reset email sent to ${targetEmail}. Check your inbox or spam folder.`,
                          });
                          onShowToast('Password reset link sent!');
                        } catch (err) {
                          setAccountSecurityFeedback({
                            type: 'err',
                            text: err instanceof Error ? err.message : 'Failed to send reset link.',
                          });
                        } finally {
                          setAccountSecurityBusy(false);
                        }
                      }}
                      className="py-2 px-2.5 rounded-xl text-[10px] font-bold border bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <KeyRound className="w-3 h-3" />
                      <span>Reset Password</span>
                    </button>
                  </div>

                  {/* Change Username Form */}
                  {accountActionTab === 'username' && (
                    <div className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2">
                      <label className="text-[10px] font-bold text-zinc-400 block">
                        New Username (letters, numbers, _, ., -)
                      </label>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          value={newUsernameInput}
                          onChange={(e) => {
                            setNewUsernameInput(e.target.value);
                            setUsernameStatusMsg(null);
                          }}
                          placeholder="e.g. naija.gamer"
                          className="flex-1 bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                        />
                        <button
                          type="button"
                          onClick={async () => {
                            const res = await checkUsernameAvailable(newUsernameInput);
                            setUsernameStatusMsg({
                              type: res.available ? 'ok' : 'err',
                              text: res.available ? `"${newUsernameInput.trim()}" is available!` : res.error || 'Unavailable',
                            });
                          }}
                          className="px-2.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-[10px] font-bold text-zinc-200 cursor-pointer"
                        >
                          Check
                        </button>
                      </div>
                      {usernameStatusMsg && (
                        <p className={`text-[10px] ${usernameStatusMsg.type === 'ok' ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {usernameStatusMsg.text}
                        </p>
                      )}
                      <button
                        type="button"
                        disabled={accountSecurityBusy}
                        onClick={async () => {
                          if (!userProfile) return;
                          setAccountSecurityBusy(true);
                          setAccountSecurityFeedback(null);
                          try {
                            const { newUsername } = await changeCitizenUsername({
                              oldUsername: userProfile.username,
                              newUsername: newUsernameInput,
                            });
                            const nextProf = { ...userProfile, username: newUsername, citizenName: newUsername };
                            saveSession(nextProf);
                            onUpdateProfile?.(nextProf);
                            setAccountSecurityFeedback({ type: 'ok', text: `Username updated to @${newUsername}!` });
                            setAccountActionTab('none');
                            onShowToast(`Username updated to @${newUsername}!`);
                            triggerSound?.('success');
                          } catch (err) {
                            setAccountSecurityFeedback({
                              type: 'err',
                              text: err instanceof Error ? err.message : 'Failed to change username.',
                            });
                          } finally {
                            setAccountSecurityBusy(false);
                          }
                        }}
                        className="w-full py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs cursor-pointer disabled:opacity-50"
                      >
                        {accountSecurityBusy ? 'Updating...' : 'Save New Username'}
                      </button>
                    </div>
                  )}

                  {/* Change Password Form */}
                  {accountActionTab === 'password' && (
                    <div className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-zinc-400">Update Password</span>
                        <button
                          type="button"
                          onClick={() => setShowAccountPwds((v) => !v)}
                          className="text-[10px] text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer"
                        >
                          {showAccountPwds ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          <span>{showAccountPwds ? 'Hide' : 'Show'}</span>
                        </button>
                      </div>
                      <input
                        type={showAccountPwds ? 'text' : 'password'}
                        value={curPwdInput}
                        onChange={(e) => setCurPwdInput(e.target.value)}
                        placeholder="Current password"
                        className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                      <input
                        type={showAccountPwds ? 'text' : 'password'}
                        value={newPwdInput}
                        onChange={(e) => setNewPwdInput(e.target.value)}
                        placeholder="New strong password (min 8 chars)"
                        className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                      <input
                        type={showAccountPwds ? 'text' : 'password'}
                        value={confirmPwdInput}
                        onChange={(e) => setConfirmPwdInput(e.target.value)}
                        placeholder="Confirm new password"
                        className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        type="button"
                        disabled={accountSecurityBusy}
                        onClick={async () => {
                          setAccountSecurityBusy(true);
                          setAccountSecurityFeedback(null);
                          try {
                            await updateCitizenPassword(curPwdInput, newPwdInput, confirmPwdInput);
                            setAccountSecurityFeedback({ type: 'ok', text: 'Password updated successfully!' });
                            setAccountActionTab('none');
                            onShowToast('Password updated!');
                            triggerSound?.('success');
                          } catch (err) {
                            setAccountSecurityFeedback({
                              type: 'err',
                              text: err instanceof Error ? err.message : 'Failed to update password.',
                            });
                          } finally {
                            setAccountSecurityBusy(false);
                          }
                        }}
                        className="w-full py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs cursor-pointer disabled:opacity-50"
                      >
                        {accountSecurityBusy ? 'Updating...' : 'Save New Password'}
                      </button>
                    </div>
                  )}

                  {/* Change Email Form */}
                  {accountActionTab === 'email' && (
                    <div className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2">
                      <label className="text-[10px] font-bold text-zinc-400 block">
                        A verification link will be sent to your new email before changing your login email.
                      </label>
                      <input
                        type="email"
                        value={newEmailInput}
                        onChange={(e) => setNewEmailInput(e.target.value)}
                        placeholder="New email address"
                        className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                      <input
                        type="password"
                        value={emailChangePwdInput}
                        onChange={(e) => setEmailChangePwdInput(e.target.value)}
                        placeholder="Current password for verification"
                        className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        type="button"
                        disabled={accountSecurityBusy}
                        onClick={async () => {
                          setAccountSecurityBusy(true);
                          setAccountSecurityFeedback(null);
                          try {
                            await requestCitizenEmailUpdate(emailChangePwdInput, newEmailInput);
                            setAccountSecurityFeedback({
                              type: 'ok',
                              text: `Verification email sent to ${newEmailInput.trim()}. Click the link to finalize your email change.`,
                            });
                            setAccountActionTab('none');
                            onShowToast('Verification link sent to new email!');
                          } catch (err) {
                            setAccountSecurityFeedback({
                              type: 'err',
                              text: err instanceof Error ? err.message : 'Failed to request email change.',
                            });
                          } finally {
                            setAccountSecurityBusy(false);
                          }
                        }}
                        className="w-full py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs cursor-pointer disabled:opacity-50"
                      >
                        {accountSecurityBusy ? 'Sending Verification...' : 'Send Email Change Verification'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Wardrobe & 3D Avatar Customization Card (Available to EVERY Citizen) */}
                <div className="p-4 rounded-3xl bg-gradient-to-br from-emerald-950/60 via-zinc-950 to-teal-950/60 border border-emerald-500/40 shadow-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
                        <Sparkles className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '8s' }} />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-white">Wardrobe &amp; 3D Avatar</h4>
                        <span className="text-[10px] text-emerald-400 font-mono font-bold">
                          Cloud Synced Character
                        </span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[9px] font-bold">
                      All Citizens
                    </span>
                  </div>

                  <p className="text-[11px] text-zinc-300 leading-relaxed">
                    Customize your 3D avatar at any time: toggle gender, select your skin tone, switch hairstyles and tailored outfits. Changes sync to your cloud profile and HUD portrait.
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setTempAvatar(
                        userProfile?.avatar || {
                          gender: 'male',
                          skinTone: '#8d5524',
                          hairstyle: 'fade',
                          hairColor: '#18181b',
                          outfit: 'streetwear',
                          pants: 'jeans',
                          shoes: 'sneakers',
                          accessory: 'none',
                        }
                      );
                      setIsAvatarModalOpen(true);
                    }}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:from-emerald-400 text-black font-black text-xs cursor-pointer shadow-md flex items-center justify-center gap-2 transition-all active:scale-98"
                  >
                    <User className="w-4 h-4" />
                    <span>Edit 3D Avatar &amp; Wardrobe</span>
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-white block">Personalize Phone Wallpaper</span>
                    <span className="text-[10px] font-mono text-amber-400 font-bold">
                      Active: {activeWallpaperObj?.name || 'Default'}
                    </span>
                  </div>

                  {/* Active Wallpaper Preview & 105 Gallery Launch Button */}
                  <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2.5">
                    <div className={`w-full h-20 rounded-xl border border-white/10 p-3 flex flex-col justify-between ${activeWallpaperObj?.bgClass || 'bg-zinc-900'}`}>
                      <span className="text-[9px] font-mono font-bold text-white/80 uppercase">Active Phone Wallpaper</span>
                      <span className="text-xs font-black text-white drop-shadow">{activeWallpaperObj?.name || 'Standard Wallpaper'}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsWallpaperGalleryOpen(true)}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 text-black font-black text-xs cursor-pointer shadow-md flex items-center justify-center gap-2 transition-all active:scale-98"
                    >
                      <Palette className="w-4 h-4" />
                      <span>Browse All Wallpapers (105 Available)</span>
                    </button>
                  </div>
                </div>

                {/* APEX SYNDICATE OWNER CONTROLS (STRICTLY VERIFIED kchiboy50@gmail.com + chiboy_52 ONLY) */}
                {checkIsOwner(userProfile) && (
                  <div className="p-4 rounded-3xl bg-gradient-to-br from-amber-950 via-zinc-950 to-amber-950/40 border-2 border-amber-500/80 shadow-[0_0_25px_rgba(245,158,11,0.25)] space-y-3 text-left">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Crown className="w-5 h-5 text-amber-400 fill-amber-400" />
                        <div>
                          <h4 className="text-xs font-black text-amber-300 uppercase tracking-wider">
                            Apex Syndicate Owner Controls
                          </h4>
                          <span className="text-[9px] font-mono text-zinc-400">
                            Verified Master Admin · @{userProfile?.username}
                          </span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[9px] font-black border border-amber-500/40">
                        OWNER
                      </span>
                    </div>

                    {/* CITIZEN ACCOUNT REGISTRY & NEPA LAUNCHERS */}
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => {
                          fetchPlayersRegistry();
                          setIsPlayersRegistryModalOpen(true);
                          setRegistryScanResult(null);
                          setInspectedCitizen(null);
                          triggerSound?.('coin');
                        }}
                        className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 text-black font-black text-xs cursor-pointer shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all"
                      >
                        <Users className="w-3.5 h-3.5 text-black" />
                        <span>Open Citizen Account Registry</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsNepaControlRoomOpen(true);
                          triggerSound?.('coin');
                        }}
                        className="w-full py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-yellow-300 font-bold text-xs cursor-pointer border border-yellow-500/40 flex items-center justify-center gap-2"
                      >
                        <Zap className="w-3.5 h-3.5 text-yellow-400" />
                        <span>NEPA National Control Room</span>
                      </button>
                    </div>

                    {/* SERVER RADIO BROADCAST PANEL */}
                    <div className="p-2.5 rounded-2xl bg-black/60 border border-white/10 space-y-2">
                      <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block">
                        Owner Server Radio Broadcast
                      </span>
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="text-zinc-400">Selected MP3 Track:</span>
                        <span className="text-amber-300 font-bold truncate max-w-[170px]">
                          {ownerBroadcastTrack || 'No MP3 file selected'}
                        </span>
                      </div>

                      <input
                        type="file"
                        accept=".mp3,audio/mpeg,audio/mp3"
                        id="owner-mp3-upload"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          if (!file.name.toLowerCase().endsWith('.mp3') && !file.type.includes('mpeg') && !file.type.includes('mp3')) {
                            onShowToast('Only .mp3 audio files are accepted!');
                            triggerSound?.('alert');
                            return;
                          }
                          setOwnerBroadcastTrack(file.name);
                          setIsBroadcastingSyncing(true);
                          setBroadcastSyncProgress(10);

                          const syncStartTime = Date.now();
                          const syncTimer = setInterval(() => {
                            const elapsed = Date.now() - syncStartTime;
                            const pct = Math.min(100, Math.round((elapsed / 2500) * 100));
                            setBroadcastSyncProgress(pct);

                            if (elapsed >= 2500) {
                              clearInterval(syncTimer);
                              const reader = new FileReader();
                              reader.onload = async (evt) => {
                                const base64 = evt.target?.result as string;
                                try {
                                  const headers = await getAuthBearerHeaders();
                                  const res = await fetch('/api/broadcast/music', {
                                    method: 'POST',
                                    headers,
                                    body: JSON.stringify({
                                      title: file.name.replace(/\.mp3$/i, ''),
                                      audioData: base64,
                                    }),
                                  });
                                  const data = await res.json();
                                  setIsBroadcastingSyncing(false);
                                  if (res.ok) {
                                    onShowToast(`Broadcast Synced! "${file.name}" is now playing for all players!`);
                                    triggerSound?.('success');
                                  } else {
                                    onShowToast(`Failed: ${data.error || 'Could not broadcast'}`);
                                  }
                                } catch {
                                  setIsBroadcastingSyncing(false);
                                  onShowToast('Failed to upload audio broadcast to server.');
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }, 80);
                        }}
                      />

                      <div className="grid grid-cols-2 gap-2">
                        <label
                          htmlFor="owner-mp3-upload"
                          className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-black text-xs text-center cursor-pointer shadow-md flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                        >
                          <Volume2 className="w-3.5 h-3.5 fill-black" />
                          <span>{isBroadcastingSyncing ? 'Syncing...' : 'Upload MP3'}</span>
                        </label>

                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              const headers = await getAuthBearerHeaders();
                              const res = await fetch('/api/broadcast/music', {
                                method: 'DELETE',
                                headers,
                              });
                              if (res.ok) {
                                setOwnerBroadcastTrack('');
                                onShowToast('Server broadcast removed. Background music stopped.');
                                triggerSound?.('coin');
                              } else {
                                onShowToast('Unauthorized to remove server broadcast.');
                              }
                            } catch {
                              onShowToast('Failed to remove server broadcast.');
                            }
                          }}
                          className="py-2.5 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-xs cursor-pointer border border-zinc-700 flex items-center justify-center gap-1.5"
                        >
                          <VolumeX className="w-3.5 h-3.5" />
                          <span>Remove Music</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Prominent Log Out Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (onLogout) {
                        onLogout();
                        onClose();
                      }
                    }}
                    className="w-full py-3 rounded-2xl bg-rose-600/90 hover:bg-rose-500 text-white font-black text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-rose-950/80 active:scale-98 transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out of Citizen Account</span>
                  </button>
                </div>
              </div>
            )}

            {/* =============================================================
                16. QUICKFIX ARTISAN HUB (COMING SOON)
                ============================================================= */}
            {currentApp === 'handy' && (
              <div className="space-y-4">
                <div className="bg-amber-950/60 border border-amber-500/40 rounded-2xl p-3.5 flex items-center gap-2.5">
                  <Wrench className="w-6 h-6 text-amber-400" />
                  <div>
                    <h4 className="text-xs font-black text-amber-200">QuickFix Artisan Network</h4>
                    <p className="text-[10px] text-zinc-400">Emergency mechanics, electricians & generator technicians</p>
                  </div>
                </div>

                <div className="bg-zinc-950/90 border border-amber-500/30 rounded-3xl p-6 text-center space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-2xl">
                    🚧
                  </div>
                  <h3 className="text-sm font-black text-white">Service Coming Soon</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed max-w-[280px] mx-auto">
                    The nationwide verified artisan registry is undergoing accreditation. On-demand generator servicing, AC repair, and emergency plumbing will be live in the next update!
                  </p>
                  <div className="inline-block px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold">
                    ESTIMATED LAUNCH: PHASE 2
                  </div>
                </div>
              </div>
            )}

            {/* =============================================================
                17. MEDCLINIC HEALTHCARE & SICKNESS TREATMENT
                ============================================================= */}
            {currentApp === 'health' && (
              <div className="space-y-4">
                <div className="bg-rose-950/60 border border-rose-500/40 rounded-2xl p-3 flex items-center gap-2.5">
                  <HeartPulse className="w-6 h-6 text-rose-400" />
                  <div>
                    <h4 className="text-xs font-black text-rose-200">Federal Medical Center & Clinic</h4>
                    <p className="text-[10px] text-zinc-400">Diagnosis, hospital outpatient & VIP doctor home visits</p>
                  </div>
                </div>

                {/* SICKNESS / HEALTH DIAGNOSIS BANNER */}
                <div className={`p-4 rounded-2xl border ${
                  (health < 60 || activeSickness)
                    ? 'bg-rose-950/80 border-rose-500/60 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                    : 'bg-emerald-950/60 border-emerald-500/40'
                } space-y-2`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase font-black tracking-wider text-zinc-300">
                      Medical Diagnosis
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black font-mono ${
                      (health < 60 || activeSickness) ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-black'
                    }`}>
                      {(health < 60 || activeSickness) ? 'STATUS: SICK 🤒' : 'STATUS: HEALTHY 🩺'}
                    </span>
                  </div>

                  <div className="text-sm font-black text-white">
                    {activeSickness || (health < 60 ? 'Acute Malaria & High Typhoid Fever' : 'Normal Physiological Health (100% Fit)')}
                  </div>

                  <p className="text-[10px] text-zinc-300 leading-relaxed">
                    {(health < 60 || activeSickness)
                      ? 'Patient is showing elevated body temperature, muscle aches, and rapid energy drain. Prompt medical treatment is advised.'
                      : 'Vital signs stable. Blood pressure, hydration, and nutritional levels are within healthy clinical ranges.'}
                  </p>
                </div>

                {/* TREATMENT OPTIONS (TWO REALISTIC PATHWAYS) */}
                <div className="space-y-2.5">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold block">
                    Choose Medical Pathway
                  </span>

                  {/* 1. GO TO FEDERAL HOSPITAL */}
                  <div className="p-3.5 rounded-2xl bg-zinc-950/90 border border-zinc-800 hover:border-rose-500/40 transition-colors space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-base">🏥</span>
                          <span className="text-xs font-black text-white">Go to Federal General Hospital</span>
                        </div>
                        <p className="text-[10px] text-zinc-400 mt-1">
                          Subsidized public consultation with queue admission. Full cure of malaria & typhoid.
                        </p>
                      </div>
                      <span className="text-xs font-mono font-bold text-rose-400 shrink-0">₦5,000</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (moneyNGN < 5000) {
                          onShowToast('Insufficient funds for hospital consultation ticket (₦5,000)!');
                          triggerSound?.('alert');
                          return;
                        }
                        onUpdateMoney(-5000);
                        onUpdateStats({ health: 100, energy: 30, happiness: 15 });
                        setActiveSickness(null);
                        try { localStorage.removeItem('naija_life_active_sickness'); } catch {}
                        onShowToast('🏥 Consulted doctor at General Hospital! Injected Artesunate. Cured & Healthy!');
                        triggerSound?.('success');
                      }}
                      className="w-full py-2 rounded-xl bg-zinc-850 hover:bg-rose-600 hover:text-white text-zinc-200 font-black text-xs cursor-pointer border border-zinc-750 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>Receive Hospital Treatment (₦5,000)</span>
                    </button>
                  </div>

                  {/* 2. DOCTOR HOME VISIT */}
                  <div className="p-3.5 rounded-2xl bg-gradient-to-br from-zinc-950 via-rose-950/30 to-zinc-950 border-2 border-rose-500/50 shadow-lg space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-base">👨‍⚕️</span>
                          <span className="text-xs font-black text-amber-300">VIP Doctor Home Visit</span>
                          <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[8px] font-bold">
                            INSTANT VIP
                          </span>
                        </div>
                        <p className="text-[10px] text-zinc-300 mt-1">
                          Private Chief Consultant arrives directly at your residence with IV multivitamin drip and premium rapid antimalarials.
                        </p>
                      </div>
                      <span className="text-xs font-mono font-bold text-amber-300 shrink-0">₦35,000</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (moneyNGN < 35000) {
                          onShowToast('Insufficient funds for VIP doctor home call (₦35,000)!');
                          triggerSound?.('alert');
                          return;
                        }
                        onUpdateMoney(-35000);
                        onUpdateStats({ health: 100, energy: 100, happiness: 35 });
                        setActiveSickness(null);
                        try { localStorage.removeItem('naija_life_active_sickness'); } catch {}
                        onShowToast('👨‍⚕️ VIP Doctor arrived! Administered IV drip at home. Health and Energy 100%!');
                        triggerSound?.('success');
                      }}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-black text-xs cursor-pointer shadow-md transition-all flex items-center justify-center gap-1.5"
                    >
                      <span>Request VIP Doctor Home Visit (₦35,000)</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* =============================================================
                18. NAIJABET SPORTSBOOK & AVIATOR CRASH GAME
                ============================================================= */}
            {currentApp === 'naijabet' && (
              <div className="space-y-3">
                {/* Header Switcher */}
                <div className="bg-gradient-to-r from-lime-950/90 via-zinc-950 to-neutral-900 border border-lime-500/40 rounded-2xl p-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-lime-400" />
                    <div>
                      <h4 className="text-xs font-black text-lime-300 uppercase">NaijaBet Live</h4>
                      <p className="text-[9px] text-zinc-400">SportyBet Sportsbook & Aviator Crash</p>
                    </div>
                  </div>

                  <div className="flex bg-zinc-900 p-0.5 rounded-xl border border-zinc-800 text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => setBetTab('sports')}
                      className={`px-2 py-1 rounded-lg cursor-pointer ${
                        betTab === 'sports' ? 'bg-lime-500 text-black font-black' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      ⚽ Sports
                    </button>
                    <button
                      type="button"
                      onClick={() => setBetTab('history')}
                      className={`px-2 py-1 rounded-lg cursor-pointer ${
                        betTab === 'history' ? 'bg-amber-400 text-black font-black' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      📜 History ({placedBetSlips.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setBetTab('aviator')}
                      className={`px-2 py-1 rounded-lg cursor-pointer ${
                        betTab === 'aviator' ? 'bg-rose-600 text-white font-black' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      ✈️ Aviator
                    </button>
                  </div>
                </div>

                {/* TAB 1: SPORTYBET 10 DAILY MATCHES */}
                {betTab === 'sports' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold">
                        Today's Fixtures (Results settle 8:30 PM WAT)
                      </span>
                      <span className="text-[9px] font-mono text-lime-400 font-bold bg-lime-950/80 px-2 py-0.5 rounded border border-lime-500/40">
                        10 Live Matches
                      </span>
                    </div>

                    {/* SPORT SELECTOR SUBTABS */}
                    <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[10px] font-bold">
                      {[
                        { id: 'football', label: '⚽ Football' },
                        { id: 'basketball', label: '🏀 Basketball' },
                        { id: 'rugby', label: '🏉 Rugby' },
                        { id: 'tennis', label: '🎾 Tennis' },
                        { id: 'combat', label: '🥊 Combat & Boxing' },
                      ].map((sp) => (
                        <button
                          key={sp.id}
                          type="button"
                          onClick={() => setBetSportTab(sp.id as any)}
                          className={`px-3 py-1.5 rounded-xl whitespace-nowrap cursor-pointer transition-all ${
                            betSportTab === sp.id
                              ? 'bg-lime-500 text-black font-black shadow-md'
                              : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                          }`}
                        >
                          {sp.label}
                        </button>
                      ))}
                    </div>

                    {/* MATCHES LIST */}
                    <div className="space-y-2">
                      {(MULTI_SPORTS_FIXTURES[betSportTab] || []).map((m) => {
                        const currentPick = selectedPicks[m.id];
                        return (
                          <div key={m.id} className="p-2.5 rounded-2xl bg-zinc-950/90 border border-zinc-800 space-y-1.5">
                            <div className="flex justify-between items-center text-[9px] font-mono text-zinc-400">
                              <span className="text-lime-400 font-bold">{m.league}</span>
                              <span>{m.time}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs font-bold text-white px-0.5">
                              <span>{m.home}</span>
                              <span className="text-[10px] text-zinc-500 font-mono">VS</span>
                              <span>{m.away}</span>
                            </div>
                            <div className={`grid gap-1.5 pt-1 ${m.dOdd !== undefined ? 'grid-cols-3' : 'grid-cols-2'}`}>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedPicks((prev) => {
                                    const next = { ...prev };
                                    if (next[m.id]?.pick === '1') delete next[m.id];
                                    else next[m.id] = { match: `${m.home} vs ${m.away}`, pick: '1', odd: m.hOdd };
                                    return next;
                                  });
                                  triggerSound?.('coin');
                                }}
                                className={`py-1 rounded-xl text-[10px] font-mono font-bold flex flex-col items-center cursor-pointer transition-all ${
                                  currentPick?.pick === '1'
                                    ? 'bg-lime-500 text-black font-black shadow-md'
                                    : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
                                }`}
                              >
                                <span className="text-[8px]">1 (Home)</span>
                                <span>{m.hOdd.toFixed(2)}</span>
                              </button>
                              {m.dOdd !== undefined && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedPicks((prev) => {
                                      const next = { ...prev };
                                      if (next[m.id]?.pick === 'X') delete next[m.id];
                                      else next[m.id] = { match: `${m.home} vs ${m.away}`, pick: 'X', odd: m.dOdd! };
                                      return next;
                                    });
                                    triggerSound?.('coin');
                                  }}
                                  className={`py-1 rounded-xl text-[10px] font-mono font-bold flex flex-col items-center cursor-pointer transition-all ${
                                    currentPick?.pick === 'X'
                                      ? 'bg-lime-500 text-black font-black shadow-md'
                                      : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
                                  }`}
                                >
                                  <span className="text-[8px]">X (Draw)</span>
                                  <span>{m.dOdd.toFixed(2)}</span>
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedPicks((prev) => {
                                    const next = { ...prev };
                                    if (next[m.id]?.pick === '2') delete next[m.id];
                                    else next[m.id] = { match: `${m.home} vs ${m.away}`, pick: '2', odd: m.aOdd };
                                    return next;
                                  });
                                  triggerSound?.('coin');
                                }}
                                className={`py-1 rounded-xl text-[10px] font-mono font-bold flex flex-col items-center cursor-pointer transition-all ${
                                  currentPick?.pick === '2'
                                    ? 'bg-lime-500 text-black font-black shadow-md'
                                    : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
                                }`}
                              >
                                <span className="text-[8px]">2 (Away)</span>
                                <span>{m.aOdd.toFixed(2)}</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* BET SLIP BUILDER */}
                    <div className="p-3.5 rounded-2xl bg-gradient-to-br from-zinc-950 via-zinc-900 to-black border-2 border-lime-500/60 shadow-xl space-y-2.5">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black text-lime-300 uppercase tracking-wider">
                          Accumulator Bet Slip ({Object.keys(selectedPicks).length})
                        </span>
                        {Object.keys(selectedPicks).length > 0 && (
                          <button
                            type="button"
                            onClick={() => setSelectedPicks({})}
                            className="text-[9px] font-mono text-zinc-400 hover:text-rose-400 cursor-pointer"
                          >
                            Clear All
                          </button>
                        )}
                      </div>

                      {Object.keys(selectedPicks).length === 0 ? (
                        <p className="text-[10px] text-zinc-400 text-center py-2">
                          Select 1, X, or 2 on any match to build your accumulator slip!
                        </p>
                      ) : (
                        <div className="space-y-1.5 max-h-24 overflow-y-auto scrollbar-none">
                          {Object.entries(selectedPicks).map(([id, p]) => (
                            <div key={id} className="flex justify-between items-center text-[10px] font-mono bg-zinc-900/80 px-2 py-1 rounded-lg">
                              <span className="truncate max-w-[190px] text-white">{p.match}</span>
                              <span className="text-lime-300 font-bold">{p.pick} @ {p.odd.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="pt-2 border-t border-zinc-800 space-y-2">
                        <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                          <div className="bg-zinc-900/90 p-2 rounded-xl">
                            <span className="text-zinc-400 block">Total Odds</span>
                            <span className="text-sm font-black text-lime-400">
                              {Object.values(selectedPicks).length > 0
                                ? Object.values(selectedPicks).reduce((acc, p) => acc * p.odd, 1).toFixed(2) + 'x'
                                : '0.00x'}
                            </span>
                          </div>
                          <div className="bg-zinc-900/90 p-2 rounded-xl">
                            <span className="text-zinc-400 block">Potential Win</span>
                            <span className="text-sm font-black text-emerald-400">
                              {Object.values(selectedPicks).length > 0
                                ? activeStateKey === 'canada'
                                  ? `$${Math.round(Math.max(1, Math.round(betStake / 960.54)) * Object.values(selectedPicks).reduce((acc, p) => acc * p.odd, 1)).toLocaleString()} CAD`
                                  : formatNaira(Math.round(betStake * Object.values(selectedPicks).reduce((acc, p) => acc * p.odd, 1)))
                                : activeStateKey === 'canada' ? '$0 CAD' : '₦0'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-zinc-400 font-mono">
                            Stake {activeStateKey === 'canada' ? '(CAD)' : '(NGN)'}:
                          </span>
                          <input
                            type="number"
                            value={activeStateKey === 'canada' ? Math.max(1, Math.round(betStake / 960.54)) : betStake}
                            onChange={(e) => {
                              const val = Math.max(1, Number(e.target.value));
                              setBetStake(activeStateKey === 'canada' ? Math.round(val * 960.54) : val);
                            }}
                            className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-2.5 py-1 text-xs text-white font-mono"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            disabled={Object.keys(selectedPicks).length === 0}
                            onClick={() => {
                              if (Object.keys(selectedPicks).length === 0) return;
                              const isCan = activeStateKey === 'canada';
                              const stakeCAD = Math.max(1, Math.round(betStake / 960.54));
                              if (isCan) {
                                const userCAD = userProfile?.bankCAD || 0;
                                if (userCAD < stakeCAD) {
                                  onShowToast(`Insufficient CAD funds! Requires $${stakeCAD.toLocaleString()} CAD.`);
                                  triggerSound?.('alert');
                                  return;
                                }
                                if (userProfile) userProfile.bankCAD = userCAD - stakeCAD;
                              } else {
                                if (moneyNGN < betStake) {
                                  onShowToast('Insufficient funds for sports bet stake!');
                                  triggerSound?.('alert');
                                  return;
                                }
                                onUpdateMoney(-betStake);
                              }
                              const picksCount = Object.keys(selectedPicks).length;
                              const odds = +Object.values(selectedPicks).reduce((acc, p) => acc * p.odd, 1).toFixed(2);
                              const pot = isCan ? Math.round(stakeCAD * odds) : Math.round(betStake * odds);
                              const newSlip = {
                                id: `slip_${Date.now()}`,
                                summary: `${picksCount}-Match Accumulator`,
                                picksCount,
                                totalOdds: odds,
                                stake: isCan ? stakeCAD : betStake,
                                potentialWin: pot,
                                currency: isCan ? 'CAD' : 'NGN',
                                status: 'PENDING' as const,
                                date: liveRealTime || 'Today 20:30 WAT',
                                picks: Object.values(selectedPicks).map((p) => ({
                                  match: p.match,
                                  pick: p.pick,
                                  odd: p.odd,
                                })),
                              };
                              const nextSlips = [newSlip, ...placedBetSlips];
                              setPlacedBetSlips(nextSlips);
                              try { localStorage.setItem('naija_life_bet_slips', JSON.stringify(nextSlips)); } catch {}
                              setSelectedPicks({});
                              onShowToast(
                                isCan
                                  ? `🎯 Bet placed (-$${stakeCAD.toLocaleString()} CAD)! Matches settle daily at 8:30 PM.`
                                  : `🎯 Bet slip placed (-${formatNaira(betStake)})! Matches settle daily at 8:30 PM WAT.`
                              );
                              triggerSound?.('coin');
                            }}
                            className={`w-full py-2.5 rounded-xl font-black text-xs cursor-pointer shadow-md transition-all ${
                              Object.keys(selectedPicks).length > 0
                                ? 'bg-lime-500 hover:bg-lime-400 text-black'
                                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                            }`}
                          >
                            Place Bet Slip ({Object.keys(selectedPicks).length > 0 ? formatNaira(betStake) : 'Select Picks'})
                          </button>
                        </div>
                        <p className="text-[9px] font-mono text-zinc-400 text-center">
                          ⏰ Fixtures settle automatically everyday at 8:30 PM WAT. Track picks in the History tab!
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: HISTORY TAB (ALL PLACED SLIPS WITH CORRECT / WRONG MATCHES) */}
                {betTab === 'history' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold">
                        Betting Slips History ({placedBetSlips.length})
                      </span>
                      <span className="text-[9px] font-mono text-amber-400 font-bold">8:30 PM WAT Settlement</span>
                    </div>

                    {placedBetSlips.length === 0 ? (
                      <div className="p-6 rounded-3xl bg-zinc-950/80 border border-zinc-800 text-center space-y-2">
                        <div className="text-3xl">🎫</div>
                        <h4 className="text-xs font-black text-white">No Bet Slips Placed Yet</h4>
                        <p className="text-[10px] text-zinc-400">
                          Build your match accumulator in the Sports tab to track results here!
                        </p>
                        <button
                          type="button"
                          onClick={() => setBetTab('sports')}
                          className="px-3.5 py-1.5 rounded-xl bg-lime-500 text-black font-black text-xs cursor-pointer"
                        >
                          Select Live Matches
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {placedBetSlips.map((slip) => (
                          <div
                            key={slip.id}
                            className={`p-3.5 rounded-2xl border shadow-md space-y-2.5 ${
                              slip.status === 'WON'
                                ? 'bg-emerald-950/40 border-emerald-500/60'
                                : slip.status === 'LOST'
                                ? 'bg-rose-950/30 border-rose-500/40'
                                : 'bg-zinc-950/90 border-zinc-800'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-xs font-black text-white">{slip.summary}</span>
                                <div className="text-[9px] text-zinc-400 font-mono">
                                  {slip.date} · Stake: {formatNaira(slip.stake)} · Odds: {slip.totalOdds}x
                                </div>
                              </div>
                              <div className="text-right">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-black uppercase ${
                                    slip.status === 'WON'
                                      ? 'bg-emerald-500 text-black'
                                      : slip.status === 'LOST'
                                      ? 'bg-rose-600 text-white'
                                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                                  }`}
                                >
                                  {slip.status === 'PENDING' ? '⏳ PENDING 8:30 PM' : slip.status}
                                </span>
                                <span className="text-[10px] font-mono font-bold text-emerald-400 block mt-0.5">
                                  Pot. Win: {formatNaira(slip.potentialWin)}
                                </span>
                              </div>
                            </div>

                            {/* Individual matches list showing which were correct and wrong */}
                            <div className="space-y-1 pt-1.5 border-t border-zinc-800/80">
                              {(slip.picks || []).map((p: any, idx: number) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between text-[10px] font-mono p-1.5 rounded-lg bg-black/40 border border-white/5"
                                >
                                  <span className="truncate max-w-[170px] text-zinc-200">{p.match}</span>
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <span className="text-zinc-400">Pick {p.pick}</span>
                                    {slip.status === 'PENDING' ? (
                                      <span className="text-amber-400 text-[9px]">⏳ Pending</span>
                                    ) : p.isCorrect ? (
                                      <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                        <span>Correct</span>
                                      </span>
                                    ) : (
                                      <span className="text-rose-400 font-bold flex items-center gap-0.5">
                                        <X className="w-3 h-3 text-rose-400" />
                                        <span>Wrong</span>
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 2: AVIATOR CRASH GAME */}
                {betTab === 'aviator' && (
                  <div className="space-y-3">
                    {/* Crash History Ribbon */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                      <span className="text-[9px] font-mono text-zinc-500 uppercase shrink-0">History:</span>
                      {aviatorHistory.map((mult, idx) => (
                        <span
                          key={idx}
                          className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-black shrink-0 ${
                            mult >= 10
                              ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50'
                              : mult >= 2
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          }`}
                        >
                          {mult.toFixed(2)}x
                        </span>
                      ))}
                    </div>

                    {/* AVIATOR SKY FLIGHT DISPLAY */}
                    <div className="relative w-full h-48 rounded-3xl bg-gradient-to-b from-rose-950 via-zinc-950 to-black border-2 border-rose-600/60 p-4 flex flex-col justify-between overflow-hidden shadow-2xl">
                      {/* Grid Radar Lines */}
                      <div className="absolute inset-0 bg-[linear-gradient(to_right,#88133715_1px,transparent_1px),linear-gradient(to_bottom,#88133715_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

                      <div className="relative flex justify-between items-center z-10">
                        <span className="text-[10px] font-mono text-rose-400 font-bold flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                          <span>AVIATOR RADAR</span>
                        </span>
                        <span className="text-[10px] font-mono text-zinc-400">
                          {isAviatorFlying ? 'FLYING...' : aviatorCrashed ? 'CRASHED' : 'READY'}
                        </span>
                      </div>

                      {/* Flying Airplane & Multiplier */}
                      <div className="relative flex flex-col items-center justify-center my-auto z-10">
                        {isAviatorFlying ? (
                          <div className="flex flex-col items-center animate-pulse">
                            <span className="text-4xl filter drop-shadow-[0_0_12px_rgba(244,63,94,0.8)] -rotate-12 transition-transform duration-100">
                              ✈️
                            </span>
                            <div className="text-3xl font-mono font-black text-white mt-1 drop-shadow-md">
                              {aviatorMultiplier.toFixed(2)}x
                            </div>
                          </div>
                        ) : aviatorCrashed ? (
                          <div className="flex flex-col items-center">
                            <span className="text-3xl">💥</span>
                            <div className="text-lg font-mono font-black text-rose-400 mt-1 uppercase">
                              FLEW AWAY @ {aviatorMultiplier.toFixed(2)}x
                            </div>
                          </div>
                        ) : hasCashedOut ? (
                          <div className="flex flex-col items-center">
                            <span className="text-3xl">💰</span>
                            <div className="text-lg font-mono font-black text-emerald-400 mt-1 uppercase">
                              CASHED OUT @ {aviatorMultiplier.toFixed(2)}x!
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <span className="text-3xl">🛫</span>
                            <div className="text-xs font-mono text-zinc-400 mt-1">
                              Place your stake and take off!
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Bottom live payout tracker */}
                      <div className="relative flex justify-between items-center text-[10px] font-mono z-10 border-t border-rose-900/50 pt-1.5">
                        <span className="text-zinc-400">
                          Stake: {activeStateKey === 'canada' ? `$${Math.max(1, Math.round(aviatorStake / 960.54)).toLocaleString()} CAD` : formatNaira(aviatorStake)}
                        </span>
                        <span className="text-amber-300 font-bold">
                          Live Payout: {activeStateKey === 'canada' ? `$${Math.round(Math.max(1, Math.round(aviatorStake / 960.54)) * aviatorMultiplier).toLocaleString()} CAD` : formatNaira(Math.round(aviatorStake * aviatorMultiplier))}
                        </span>
                      </div>
                    </div>

                    {/* AVIATOR CONTROLLER */}
                    <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-3 space-y-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-zinc-400 font-mono">
                          Stake {activeStateKey === 'canada' ? '(CAD)' : '(NGN)'}:
                        </span>
                        <input
                          type="number"
                          disabled={isAviatorFlying}
                          value={activeStateKey === 'canada' ? Math.max(1, Math.round(aviatorStake / 960.54)) : aviatorStake}
                          onChange={(e) => {
                            const val = Math.max(1, Number(e.target.value));
                            setAviatorStake(activeStateKey === 'canada' ? Math.round(val * 960.54) : val);
                          }}
                          className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-2.5 py-1 text-xs text-white font-mono"
                        />
                      </div>

                      {/* Quick stake presets */}
                      <div className="grid grid-cols-4 gap-1">
                        {(activeStateKey === 'canada' ? [5, 10, 25, 50] : [500, 1000, 5000, 20000]).map((amt) => (
                          <button
                            key={amt}
                            type="button"
                            disabled={isAviatorFlying}
                            onClick={() => setAviatorStake(activeStateKey === 'canada' ? Math.round(amt * 960.54) : amt)}
                            className="py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-mono text-[9px] font-bold cursor-pointer"
                          >
                            {activeStateKey === 'canada' ? `+$${amt}` : `+${formatNaira(amt)}`}
                          </button>
                        ))}
                      </div>

                      {/* ACTION BUTTON: BET OR CASH OUT */}
                      {!isAviatorFlying ? (
                        <button
                          type="button"
                          onClick={handleStartAviator}
                          className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-black text-sm cursor-pointer shadow-lg shadow-emerald-950/80 active:scale-98 transition-all flex items-center justify-center gap-2"
                        >
                          <Plane className="w-4 h-4 fill-black" />
                          <span>
                            BET {activeStateKey === 'canada' ? `$${Math.max(1, Math.round(aviatorStake / 960.54)).toLocaleString()} CAD` : formatNaira(aviatorStake)} (TAKE OFF)
                          </span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleCashOutAviator}
                          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-black font-black text-sm cursor-pointer shadow-[0_0_20px_rgba(251,191,36,0.6)] animate-bounce active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                          <Coins className="w-5 h-5 fill-black" />
                          <span>
                            CASH OUT {activeStateKey === 'canada' ? `$${Math.round(Math.max(1, Math.round(aviatorStake / 960.54)) * aviatorMultiplier).toLocaleString()} CAD` : formatNaira(Math.round(aviatorStake * aviatorMultiplier))}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* =============================================================
                19. INVEST (77+ NGX EQUITIES, T-BILLS, REAL ESTATE & CRYPTO)
                ============================================================= */}
            {currentApp === 'invest' && (
              <div className="space-y-3">
                {/* LIVE INVESTMENT EARNINGS STACK BOX */}
                <div className="bg-gradient-to-br from-cyan-950 via-zinc-950 to-neutral-900 border-2 border-cyan-500/50 rounded-3xl p-4 shadow-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-cyan-400" />
                      <span className="text-xs font-black text-cyan-200 uppercase tracking-wider">LIVE STACKING YIELD STREAM</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-mono font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      ACTIVE ACCRUAL
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-zinc-900/80 p-2.5 rounded-2xl border border-zinc-800">
                      <span className="text-[9px] text-zinc-400 uppercase font-mono block">Invested Principal</span>
                      <span className="text-xs font-black text-white font-mono">
                        {formatNaira(investments.reduce((sum, inv) => sum + (inv.investedAmount || 0), 0))}
                      </span>
                    </div>

                    <div className="bg-emerald-950/60 p-2.5 rounded-2xl border border-emerald-500/40">
                      <span className="text-[9px] text-emerald-400 uppercase font-mono block">Stacked Yield</span>
                      <span className="text-xs font-black text-emerald-300 font-mono animate-pulse">
                        +{formatNaira(investments.reduce((sum, inv) => sum + (inv.earnedReturns || 0), 0))}
                      </span>
                    </div>

                    <div className="bg-cyan-950/60 p-2.5 rounded-2xl border border-cyan-500/40">
                      <span className="text-[9px] text-cyan-300 uppercase font-mono block">Total Value</span>
                      <span className="text-xs font-black text-cyan-200 font-mono">
                        {formatNaira(investments.reduce((sum, inv) => sum + (inv.investedAmount || 0) + (inv.earnedReturns || 0), 0))}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Top Tab Bar: My Active Portfolio vs Nigeria Catalog vs Canada (CAD) */}
                <div className="flex bg-zinc-950 p-1 rounded-2xl border border-zinc-800 text-xs font-bold gap-1">
                  <button
                    type="button"
                    onClick={() => setInvestSubTab('holdings')}
                    className={`flex-1 py-1.5 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1 ${
                      investSubTab === 'holdings'
                        ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-black font-black shadow-md'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span className="truncate">Holdings ({investments.filter((i) => (i.investedAmount || 0) > 0).length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setInvestSubTab('catalog')}
                    className={`flex-1 py-1.5 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1 ${
                      investSubTab === 'catalog'
                        ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-black font-black shadow-md'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Coins className="w-3.5 h-3.5" />
                    <span className="truncate">🇳🇬 Nigeria</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setInvestSubTab('canada')}
                    className={`flex-1 py-1.5 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1 ${
                      investSubTab === 'canada'
                        ? 'bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 text-white font-black shadow-md'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span>🍁</span>
                    <span className="truncate">Canada (CAD)</span>
                  </button>
                </div>

                {/* TAB 1: MY HOLDINGS WITH ACCUMULATED DIVIDENDS & CUMULATIVE CASHOUT */}
                {investSubTab === 'holdings' && (
                  <div className="space-y-3">
                    {/* CUMULATIVE CASHOUT BAR */}
                    {(() => {
                      const totalAccruedDividends = investments.reduce((sum, inv) => sum + (inv.earnedReturns || 0), 0);
                      return (
                        <div className="bg-gradient-to-br from-emerald-950 via-zinc-950 to-teal-950/60 border-2 border-emerald-500/50 rounded-2xl p-3.5 space-y-2 shadow-xl">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold">Total Stacked Yield Dividends</span>
                            <span className="text-xs font-mono font-black text-emerald-300 animate-pulse">
                              +{formatNaira(totalAccruedDividends)}
                            </span>
                          </div>
                          <button
                            type="button"
                            disabled={totalAccruedDividends <= 0}
                            onClick={() => {
                              if (totalAccruedDividends <= 0) return;
                              onUpdateMoney(totalAccruedDividends);
                              investments.forEach((inv) => {
                                inv.earnedReturns = 0;
                              });
                              onShowToast(`💰 Cashed out +${formatNaira(totalAccruedDividends)} cumulative dividends from all holdings!`);
                              triggerSound?.('coin');
                            }}
                            className={`w-full py-2.5 rounded-xl font-black text-xs cursor-pointer shadow-lg transition-all flex items-center justify-center gap-1.5 ${
                              totalAccruedDividends > 0
                                ? 'bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 text-black hover:scale-102 active:scale-98 shadow-emerald-950/80'
                                : 'bg-zinc-850 text-zinc-500 border border-zinc-750 cursor-not-allowed'
                            }`}
                          >
                            <Coins className="w-4 h-4 fill-black" />
                            <span>CASHOUT ALL INVESTMENT DIVIDENDS (+{formatNaira(totalAccruedDividends)})</span>
                          </button>
                        </div>
                      );
                    })()}

                    {/* ACTIVE PORTFOLIO HOLDINGS LIST */}
                    {investments.some((i) => (i.investedAmount || 0) > 0) ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold">
                            Individual Asset Holdings ({investments.filter((i) => (i.investedAmount || 0) > 0).length})
                          </span>
                        </div>

                        {investments
                          .filter((i) => (i.investedAmount || 0) > 0)
                          .map((inv) => (
                            <div
                              key={inv.id}
                              className="p-3.5 rounded-2xl bg-zinc-950/90 border border-cyan-500/30 shadow-md space-y-2"
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <h5 className="text-xs font-bold text-white">{inv.title}</h5>
                                  <span className="text-[9px] font-mono text-zinc-400 uppercase">{inv.category} · {inv.annualYieldPct}% p.a.</span>
                                </div>
                                <div className="text-right">
                                  <span className="text-xs font-mono font-black text-emerald-400 block">
                                    +{formatNaira(inv.earnedReturns || 0)}
                                  </span>
                                  <span className="text-[8px] font-mono text-emerald-400/80">Stacked Yield</span>
                                </div>
                              </div>

                              <div className="flex justify-between items-center text-[10px] font-mono bg-zinc-900/60 p-2 rounded-xl border border-zinc-800">
                                <span className="text-zinc-400">Principal: {formatNaira(inv.investedAmount)}</span>
                                <span className="text-cyan-300 font-bold">Total Value: {formatNaira(inv.investedAmount + (inv.earnedReturns || 0))}</span>
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  onLiquidateInvestment(inv.id);
                                  triggerSound?.('coin');
                                }}
                                className="w-full py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs cursor-pointer shadow flex items-center justify-center gap-1.5"
                              >
                                <Coins className="w-3.5 h-3.5" />
                                <span>Sell & Liquidate Asset (+{formatNaira(inv.investedAmount + (inv.earnedReturns || 0))})</span>
                              </button>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="p-6 rounded-3xl bg-zinc-950/80 border border-zinc-800 text-center space-y-2">
                        <div className="text-3xl">📈</div>
                        <h4 className="text-xs font-black text-white">No Active Investments Owned</h4>
                        <p className="text-[10px] text-zinc-400">
                          Switch to the Investment Catalog tab to purchase NGX equities, treasury bills, real estate, and crypto!
                        </p>
                        <button
                          type="button"
                          onClick={() => setInvestSubTab('catalog')}
                          className="px-3.5 py-1.5 rounded-xl bg-cyan-500 text-black font-black text-xs cursor-pointer"
                        >
                          Browse Investment Catalog
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 2: SEARCH AND ASSET CATALOG */}
                {investSubTab === 'catalog' && (
                  <div className="bg-zinc-950/90 border border-zinc-800 rounded-3xl p-3.5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-black text-white">Investment Asset Catalog</h4>
                        <p className="text-[10px] text-zinc-400">Equities, T-Bills, Agriculture & Startups</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-[10px] font-bold">
                        {filteredInvestments.length} Assets
                      </span>
                    </div>

                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={investSearchQuery}
                      onChange={(e) => setInvestSearchQuery(e.target.value)}
                      placeholder="Search stocks, bonds, farms, crypto..."
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  {/* Category Filters */}
                  <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[10px]">
                    {[
                      { id: 'All', label: 'All' },
                      { id: 'tbills', label: 'T-Bills' },
                      { id: 'equities', label: 'NGX Stocks' },
                      { id: 'realestate', label: 'Real Estate' },
                      { id: 'agribusiness', label: 'Agribusiness' },
                      { id: 'tech_startups', label: 'Startups' },
                      { id: 'crypto', label: 'Crypto' },
                      { id: 'forex', label: 'Forex' },
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setInvestCategoryFilter(cat.id)}
                        className={`px-2.5 py-1 rounded-lg font-bold shrink-0 cursor-pointer transition-colors ${
                          investCategoryFilter === cat.id
                            ? 'bg-cyan-500 text-black font-black'
                            : 'bg-zinc-900 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  {/* Asset Cards */}
                  <div className="space-y-2">
                    {filteredInvestments.map((inv) => (
                      <div
                        key={inv.id}
                        className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex justify-between items-center gap-2 hover:border-cyan-500/40 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-white truncate">{inv.title}</span>
                            <span
                              className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold shrink-0 ${
                                inv.risk?.includes('Low')
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                                  : inv.risk?.includes('Moderate')
                                  ? 'bg-amber-950 text-amber-400 border border-amber-500/40'
                                  : 'bg-rose-950 text-rose-400 border border-rose-500/40'
                              }`}
                            >
                              {inv.risk || 'Standard'}
                            </span>
                          </div>
                          <div className="text-[10px] text-zinc-400 truncate mt-0.5">{inv.desc}</div>
                          <div className="flex items-center gap-2 text-[10px] text-cyan-400 font-mono mt-1">
                            <span>Min: {formatNaira(inv.minDeposit)}</span>
                            <span>·</span>
                            <span className="text-emerald-400 font-bold">+{inv.annualYieldPct}% p.a.</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (moneyNGN < inv.minDeposit) {
                              onShowToast(`Insufficient funds! Minimum deposit is ${formatNaira(inv.minDeposit)}`);
                              triggerSound?.('alert');
                              return;
                            }
                            onInvest(inv.id, inv.minDeposit);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-zinc-950 font-bold text-xs cursor-pointer shrink-0 shadow"
                        >
                          Invest
                        </button>
                      </div>
                    ))}

                    {filteredInvestments.length === 0 && (
                      <div className="py-6 text-center text-xs text-zinc-500">
                        No investment assets found matching "{investSearchQuery}"
                      </div>
                    )}
                  </div>
                </div>
              )}

                {/* TAB 3: CANADIAN INVESTMENTS CATALOG (BOUGHT IN CAD, PAYS CAD) */}
                {investSubTab === 'canada' && (
                  <div className="space-y-3">
                    <div className="bg-gradient-to-r from-red-950/80 via-neutral-950 to-zinc-950 border border-red-500/40 rounded-2xl p-3 flex items-center justify-between shadow-md">
                      <div>
                        <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                          <span>🍁</span>
                          <span>Toronto Stock Exchange (TSX) &amp; Canadian Equities</span>
                        </h4>
                        <p className="text-[10px] text-zinc-400 font-mono mt-0.5">
                          Assets bought strictly with Canadian Dollars ($ CAD) · Pays CAD Yields
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] font-mono text-zinc-400 uppercase block">CAD Bank:</span>
                        <span className="text-xs font-mono font-black text-amber-300">
                          ${(userProfile?.bankCAD || 0).toLocaleString()} CAD
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {CANADIAN_INVESTMENTS_CATALOG.map((inv) => (
                        <div key={inv.id} className="p-3 rounded-2xl bg-zinc-950/80 border border-zinc-800 hover:border-red-500/40 transition-all flex items-center justify-between gap-3 shadow-md">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <h5 className="text-xs font-black text-white truncate">{inv.title}</h5>
                              <span className="px-1.5 py-0.2 rounded text-[8px] font-mono font-bold uppercase bg-red-950 text-red-300 border border-red-500/40">
                                {inv.risk} Risk
                              </span>
                            </div>
                            <div className="text-[10px] text-zinc-400 truncate mt-0.5">{inv.desc}</div>
                            <div className="flex items-center gap-2 text-[10px] text-red-300 font-mono mt-1">
                              <span>Min: <strong className="text-amber-300">${inv.minDepositCAD.toLocaleString()} CAD</strong></span>
                              <span>·</span>
                              <span className="text-emerald-400 font-bold">+{inv.annualYieldPct}% p.a. Yield</span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              const userCad = userProfile?.bankCAD || 0;
                              if (userCad < inv.minDepositCAD) {
                                onShowToast(`Insufficient Canadian Dollars! Requires $${inv.minDepositCAD.toLocaleString()} CAD. Exchange NGN to CAD in Naija Pay.`);
                                triggerSound?.('alert');
                                return;
                              }
                              if (userProfile) {
                                userProfile.bankCAD = userCad - inv.minDepositCAD;
                                if (!Array.isArray(userProfile.receipts)) userProfile.receipts = [];
                                userProfile.receipts.unshift({
                                  id: `INV_CAD_${Date.now()}`,
                                  title: `Canadian Asset: ${inv.title}`,
                                  category: 'business',
                                  amount: inv.minDepositCAD || 500,
                                  date: new Date().toLocaleDateString('en-CA'),
                                  type: 'debit',
                                  currency: 'CAD',
                                });
                              }
                              onShowToast(`🍁 Invested $${inv.minDepositCAD.toLocaleString()} CAD into ${inv.title}! Yields paid into Canadian Account.`);
                              triggerSound?.('coin');
                            }}
                            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs cursor-pointer shrink-0 shadow"
                          >
                            Invest CAD
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* =============================================================
                20. CARS (AUTO MART)
                ============================================================= */}
            {currentApp === 'cars' && (
              <div className="space-y-3">
                {/* Auto Mart Dealership Tabs */}
                <div className="flex bg-zinc-950 p-1 rounded-2xl border border-zinc-800 text-xs font-bold gap-1">
                  <button
                    type="button"
                    onClick={() => setCarsSubTab('nigeria')}
                    className={`flex-1 py-1.5 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1 ${
                      carsSubTab === 'nigeria'
                        ? 'bg-rose-600 text-white font-black shadow-md'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span>🇳🇬 Nigerian Motors</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCarsSubTab('canada')}
                    className={`flex-1 py-1.5 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1 ${
                      carsSubTab === 'canada'
                        ? 'bg-gradient-to-r from-red-600 to-rose-500 text-white font-black shadow-md'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span>🍁 Canadian AWD/EV Motors (CAD)</span>
                  </button>
                </div>

                {/* TAB 1: NIGERIAN MOTORS */}
                {carsSubTab === 'nigeria' && (
                  <div className="space-y-2">
                    {AVAILABLE_VEHICLES.map((veh) => (
                      <div key={veh.id} className="p-3 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex justify-between items-center shadow-md">
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl">{veh.icon}</span>
                          <div>
                            <div className="text-xs font-bold text-white">{veh.name}</div>
                            <div className="text-[10px] text-zinc-400">{veh.desc}</div>
                            <span className="text-xs font-mono font-bold text-rose-400 mt-0.5 block">{formatNaira(veh.price)}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => onBuyVehicle(veh)}
                          className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs cursor-pointer shrink-0"
                        >
                          Buy
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* TAB 2: CANADIAN WINTER AWD / EV CARS (DIFFERENT FROM NIGERIA, PAID IN CAD) */}
                {carsSubTab === 'canada' && (
                  <div className="space-y-2">
                    <div className="bg-gradient-to-r from-red-950/80 to-zinc-950 border border-red-500/30 rounded-2xl p-3 flex items-center justify-between shadow-md">
                      <div>
                        <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                          <span>🍁</span>
                          <span>Canadian Winter AWD &amp; Electric Dealership</span>
                        </h4>
                        <p className="text-[10px] text-zinc-400 font-mono mt-0.5">
                          Cold-climate winterized AWD/4x4 vehicles · Paid strictly in Canadian Dollars ($ CAD)
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] font-mono text-zinc-400 uppercase block">CAD Bank:</span>
                        <span className="text-xs font-mono font-black text-amber-300">
                          ${(userProfile?.bankCAD || 0).toLocaleString()} CAD
                        </span>
                      </div>
                    </div>

                    {CANADIAN_CARS_CATALOG.map((veh) => (
                      <div key={veh.id} className="p-3 rounded-2xl bg-zinc-950/80 border border-zinc-800 hover:border-red-500/40 transition-all flex justify-between items-center shadow-md">
                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                          <span className="text-2xl shrink-0">{veh.icon}</span>
                          <div>
                            <div className="text-xs font-bold text-white flex items-center gap-1.5">
                              <span>{veh.name}</span>
                              <span className="px-1.5 py-0.2 rounded text-[8px] font-mono font-bold uppercase bg-red-950 text-red-300 border border-red-500/40">
                                {veh.spec}
                              </span>
                            </div>
                            <div className="text-[10px] text-zinc-400 truncate">{veh.desc}</div>
                            <span className="text-xs font-mono font-bold text-amber-300 mt-0.5 block">
                              ${veh.priceCAD.toLocaleString()} CAD
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const userCad = userProfile?.bankCAD || 0;
                            if (userCad < veh.priceCAD) {
                              onShowToast(`Insufficient Canadian Dollars! Requires $${veh.priceCAD.toLocaleString()} CAD. Exchange NGN to CAD in Naija Pay.`);
                              triggerSound?.('alert');
                              return;
                            }
                            if (userProfile) {
                              userProfile.bankCAD = userCad - veh.priceCAD;
                              if (!userProfile.inventory) userProfile.inventory = [];
                              userProfile.inventory.push(`${veh.name} (Canadian Garage)`);
                              if (!Array.isArray(userProfile.receipts)) userProfile.receipts = [];
                              userProfile.receipts.unshift({
                                id: `CAR_CAD_${Date.now()}`,
                                title: `Auto Mart Canada: ${veh.name}`,
                                category: 'lifestyle',
                                amount: veh.priceCAD,
                                date: new Date().toLocaleDateString('en-CA'),
                                type: 'debit',
                                currency: 'CAD',
                              });
                            }
                            onBuyVehicle({
                              id: veh.id,
                              name: veh.name,
                              type: 'luxury_sedan',
                              price: Math.round(veh.priceCAD * 960.54),
                              speed: '210 km/h AWD',
                              prestige: 90,
                              icon: veh.icon,
                              desc: `${veh.desc} (Canadian Garage)`,
                              isOwned: true,
                            });
                            onShowToast(`🍁 Purchased ${veh.name}! Keys in your inventory (-$${veh.priceCAD.toLocaleString()} CAD).`);
                            triggerSound?.('coin');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs cursor-pointer shrink-0 shadow"
                        >
                          Buy CAD
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* =============================================================
                21. LUXURY APP (EXECUTIVE PRIVATE JETS, HELICOPTERS & SUPERYACHTS)
                ============================================================= */}
            {currentApp === 'luxury' && (
              <div className="space-y-4">
                {/* Executive Header Banner */}
                <div className="bg-gradient-to-br from-amber-950/90 via-zinc-950 to-neutral-900 border-2 border-amber-500/50 rounded-2xl p-4 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Crown className="w-5 h-5 text-amber-400" />
                        <h3 className="text-sm font-black text-amber-200 uppercase tracking-wider">
                          VIP Executive Hangar & Marina
                        </h3>
                      </div>
                      <p className="text-[10px] text-zinc-400 mt-1">
                        98 Ultra-Luxury Assets: Private Jets · Helicopters · Mega Yachts
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-mono font-bold">
                      ELITE FLEET
                    </span>
                  </div>

                  {/* Search Bar */}
                  <div className="mt-3 relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-400" />
                    <input
                      type="text"
                      placeholder="Search Gulfstream, Bombardier, Sikorsky, Lurssen, Benetti..."
                      value={luxurySearchQuery}
                      onChange={(e) => setLuxurySearchQuery(e.target.value)}
                      className="w-full bg-zinc-900/90 border border-amber-500/30 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* Category Tabs */}
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {(
                    [
                      { id: 'all', label: 'All Fleet (98)', icon: '👑' },
                      { id: 'jet', label: 'Private Jets (33)', icon: '🛩️' },
                      { id: 'helicopter', label: 'Helicopters (33)', icon: '🚁' },
                      { id: 'yacht', label: 'Mega Yachts (32)', icon: '🛥️' },
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setLuxuryCategoryFilter(tab.id)}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                        luxuryCategoryFilter === tab.id
                          ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-black shadow-md shadow-amber-500/20'
                          : 'bg-zinc-900/80 text-zinc-400 hover:text-white border border-zinc-800'
                      }`}
                    >
                      <span>{tab.icon}</span>
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>

                {/* Luxury Fleet Listing */}
                <div className="space-y-3">
                  {filteredLuxury.map((item) => {
                    const isAlreadyOwned = userProfile?.inventory?.some((inv) =>
                      inv.toLowerCase().includes(item.name.toLowerCase())
                    );
                    return (
                      <div
                        key={item.id}
                        className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800 hover:border-amber-500/40 transition-all space-y-2 relative overflow-hidden group shadow-md"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2.5">
                            <span className="text-3xl shrink-0 group-hover:scale-110 transition-transform">
                              {item.icon}
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-xs font-black text-white">{item.name}</h4>
                                <span className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-[9px] font-mono text-amber-300">
                                  {item.categoryLabel}
                                </span>
                              </div>
                              <div className="text-[10px] text-zinc-400 font-medium">
                                Maker: {item.manufacturer}
                              </div>
                            </div>
                          </div>
                          {isAlreadyOwned && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 font-bold text-[9px] shrink-0">
                              In Hangar
                            </span>
                          )}
                        </div>

                        {/* Specs Chips */}
                        <div className="grid grid-cols-3 gap-1 text-[9px] font-mono bg-zinc-900/60 p-2 rounded-xl border border-zinc-800/80">
                          <div>
                            <span className="text-zinc-500 block">Top Speed</span>
                            <span className="text-zinc-200 font-bold truncate block">{item.speed}</span>
                          </div>
                          <div>
                            <span className="text-zinc-500 block">Capacity</span>
                            <span className="text-zinc-200 font-bold truncate block">{item.capacity}</span>
                          </div>
                          <div>
                            <span className="text-zinc-500 block">Range/Length</span>
                            <span className="text-zinc-200 font-bold truncate block">{item.rangeOrLength}</span>
                          </div>
                        </div>

                        <p className="text-[10px] text-zinc-400 leading-relaxed">{item.desc}</p>

                        {/* Price & Action (Dynamic CAD in Canada vs NGN in Nigeria) */}
                        <div className="flex items-center justify-between pt-2 border-t border-zinc-900">
                          {(() => {
                            const isCanada = activeStateKey === 'canada';
                            const priceCAD = Math.round(item.priceNGN / 960.54);
                            return (
                              <>
                                <div>
                                  <span className="text-[9px] text-zinc-500 uppercase font-mono block">VIP Acquisition</span>
                                  <span className="text-xs font-mono font-black text-amber-400">
                                    {isCanada ? `$${priceCAD.toLocaleString()} CAD` : formatNaira(item.priceNGN)}
                                  </span>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => {
                                    if (isCanada) {
                                      const userCad = userProfile?.bankCAD || 0;
                                      if (userCad < priceCAD) {
                                        onShowToast(`Insufficient CAD funds! Requires $${priceCAD.toLocaleString()} CAD in your Canadian bank.`);
                                        triggerSound?.('alert');
                                        return;
                                      }
                                      if (userProfile) {
                                        userProfile.bankCAD = userCad - priceCAD;
                                        if (!userProfile.inventory) userProfile.inventory = [];
                                        userProfile.inventory.push(`${item.name} (Canadian Hangar / Berth)`);
                                      }
                                    } else {
                                      if (moneyNGN < item.priceNGN) {
                                        onShowToast(`Insufficient funds! Requires ${formatNaira(item.priceNGN)} for acquisition.`);
                                        triggerSound?.('alert');
                                        return;
                                      }
                                      onUpdateMoney(-item.priceNGN);
                                      if (userProfile) {
                                        if (!userProfile.inventory) userProfile.inventory = [];
                                        userProfile.inventory.push(`${item.name} (Hangar / Berth)`);
                                      }
                                    }
                                    onBuyVehicle?.({
                                      id: item.id,
                                      name: item.name,
                                      type: item.category === 'jet' ? 'hyper_luxury' : item.category === 'helicopter' ? 'supercar' : 'luxury_sedan',
                                      price: item.priceNGN,
                                      speed: item.speed,
                                      prestige: 100,
                                      icon: item.icon,
                                      desc: `${item.desc} (Hangar / Berth)`,
                                      isOwned: true,
                                    });
                                    onUpdateStats({ happiness: 50 });
                                    onLogAction('lifestyle', `Executive Asset: Acquired ${item.name}.`);
                                    onShowToast(`👑 Congratulations! You now own the ${item.name}! Added to your executive fleet.`);
                                    triggerSound?.('coin');
                                  }}
                                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-black font-black text-xs cursor-pointer shadow-md shadow-amber-500/20 active:scale-95 transition-all"
                                >
                                  {isAlreadyOwned ? 'Buy Additional' : isCanada ? 'Acquire CAD' : 'Acquire Asset'}
                                </button>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    );
                  })}

                  {filteredLuxury.length === 0 && (
                    <div className="py-8 text-center text-xs text-zinc-500">
                      No luxury assets found matching "{luxurySearchQuery}"
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* =============================================================
                22. PETS APP (KENNELS & GUARD DOGS)
                ============================================================= */}
            {currentApp === 'pets' && (
              <div className="space-y-4">
                {/* Header Banner */}
                <div className="bg-gradient-to-br from-orange-950/80 via-zinc-950 to-neutral-900 border border-orange-500/40 rounded-2xl p-4 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Dog className="w-5 h-5 text-orange-400" />
                        <h3 className="text-sm font-black text-orange-200 uppercase tracking-wider">
                          Supreme Nigerian Pedigree Kennels
                        </h3>
                      </div>
                      <p className="text-[10px] text-zinc-400 mt-1">
                        Champion Bloodline Guard Dogs &amp; Compound Protection Breeds
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/40 text-[9px] font-mono font-bold">
                      PEDIGREE
                    </span>
                  </div>
                </div>

                {/* Region Tabs */}
                <div className="flex bg-zinc-950 p-1 rounded-2xl border border-zinc-800 text-xs font-bold gap-1">
                  <button
                    type="button"
                    onClick={() => setPetsSubTab('nigeria')}
                    className={`flex-1 py-1.5 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1 ${
                      petsSubTab === 'nigeria'
                        ? 'bg-orange-500 text-black font-black shadow-md'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span>🇳🇬 Nigerian Kennels</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPetsSubTab('canada')}
                    className={`flex-1 py-1.5 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1 ${
                      petsSubTab === 'canada'
                        ? 'bg-gradient-to-r from-red-600 to-rose-500 text-white font-black shadow-md'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span>🍁 Canadian Breeds (Coming Soon)</span>
                  </button>
                </div>

                {/* TAB 1: NIGERIAN PETS */}
                {petsSubTab === 'nigeria' && (
                  <>
                    {/* Category Filter */}
                    <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                      {['All', 'Dog', 'Cat', 'Bird', 'Horse', 'Exotic'].map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setPetCategoryFilter(cat)}
                          className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase transition-all whitespace-nowrap cursor-pointer ${
                            petCategoryFilter === cat
                              ? 'bg-orange-500 text-black font-black shadow-md'
                              : 'bg-zinc-900/80 text-zinc-400 hover:text-white border border-zinc-800'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    {/* Pet Cards */}
                    <div className="space-y-3">
                      {filteredPets.map((pet) => (
                        <div
                          key={pet.id}
                          className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800 hover:border-orange-500/40 transition-all space-y-2 shadow-md"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <span className="text-3xl shrink-0">{pet.icon}</span>
                              <div>
                                <div className="text-xs font-black text-white">{pet.name}</div>
                                <div className="text-[10px] text-orange-400/90 font-mono">
                                  Breed: {pet.breed} · {pet.species}
                                </div>
                              </div>
                            </div>
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-[9px] shrink-0 uppercase tracking-wider">
                              COMING SOON
                            </span>
                          </div>

                          <div className="text-[10px] text-zinc-300 bg-zinc-900/60 p-2 rounded-xl border border-zinc-800/80 font-mono">
                            <span className="text-zinc-500">Temperament: </span>
                            {pet.temperament}
                          </div>

                          <p className="text-[10px] text-zinc-400 leading-relaxed">{pet.desc}</p>

                          <div className="flex items-center justify-between pt-2 border-t border-zinc-900">
                            <div>
                              <span className="text-[9px] text-zinc-500 uppercase font-mono block">Kennel Price</span>
                              <span className="text-xs font-mono font-bold text-orange-400">
                                {formatNaira(pet.priceNGN)}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                onShowToast(`🐾 Breeding kennel litters for ${pet.name} are currently in quarantine. Available in the next expansion!`);
                                triggerSound?.('coin');
                              }}
                              className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs cursor-pointer border border-zinc-700"
                            >
                              Reserve Puppy
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* TAB 2: CANADIAN BREEDS (ALL SET TO COMING SOON) */}
                {petsSubTab === 'canada' && (
                  <div className="space-y-3">
                    <div className="bg-gradient-to-r from-red-950/80 to-zinc-950 border border-red-500/30 rounded-2xl p-3 flex items-center justify-between shadow-md">
                      <div>
                        <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                          <span>🍁</span>
                          <span>Canadian Cold-Climate Working Breeds</span>
                        </h4>
                        <p className="text-[10px] text-zinc-400 font-mono mt-0.5">
                          Acclimatized Canadian snow breeds · Official Kennel Club (Coming Soon)
                        </p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 text-[9px] font-mono font-bold uppercase">
                        COMING SOON
                      </span>
                    </div>

                    <div className="space-y-3">
                      {CANADIAN_PETS_CATALOG.map((pet) => (
                        <div
                          key={pet.id}
                          className="p-3.5 rounded-2xl bg-zinc-950/80 border border-red-500/20 hover:border-red-500/40 transition-all space-y-2 shadow-md"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <span className="text-3xl shrink-0">{pet.icon}</span>
                              <div>
                                <div className="text-xs font-black text-white">{pet.name}</div>
                                <div className="text-[10px] text-red-400 font-mono">
                                  Breed: {pet.breed} · {pet.species}
                                </div>
                              </div>
                            </div>
                            <span className="px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/40 text-red-300 font-bold text-[9px] shrink-0 uppercase tracking-wider">
                              COMING SOON 🍁
                            </span>
                          </div>

                          <div className="text-[10px] text-zinc-300 bg-zinc-900/60 p-2 rounded-xl border border-zinc-800/80 font-mono">
                            <span className="text-zinc-500">Temperament: </span>
                            {pet.temperament}
                          </div>

                          <p className="text-[10px] text-zinc-400 leading-relaxed">{pet.desc}</p>

                          <div className="flex items-center justify-between pt-2 border-t border-zinc-900">
                            <div>
                              <span className="text-[9px] text-zinc-500 uppercase font-mono block">Estimated Fee</span>
                              <span className="text-xs font-mono font-bold text-amber-300">
                                ${pet.priceCAD.toLocaleString()} CAD
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                onShowToast(`🍁 Canadian Kennel Club import permits for ${pet.name} will open in the next update!`);
                                triggerSound?.('coin');
                              }}
                              className="px-3 py-1.5 rounded-xl bg-zinc-800/80 text-zinc-400 font-bold text-xs cursor-not-allowed border border-zinc-700"
                            >
                              Coming Soon
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* =============================================================
                23. SUGGESTIONS & COMPLAINTS (ONLINE CITIZEN FEEDBACK + OWNER INBOX)
                ============================================================= */}
            {currentApp === 'suggestions' && (() => {
              const isGameOwner = checkIsOwner(userProfile);
              const myTickets = feedbackTickets.filter((t) => t.username.toLowerCase() === userProfile?.username?.toLowerCase());

              const handleFeedbackSubmit = async (e: React.FormEvent) => {
                e.preventDefault();
                if (!suggestionTitle.trim() || !suggestionDetails.trim()) {
                  onShowToast('Please provide both a title and details for your feedback.');
                  return;
                }
                const newTicket: CommunityFeedbackTicket = {
                  id: 'fb_' + Date.now(),
                  category: suggestionCategory,
                  title: suggestionTitle.trim(),
                  details: suggestionDetails.trim(),
                  username: userProfile.username,
                  senderName: `${userProfile.firstName} ${userProfile.lastName}`,
                  stateOrigin: userProfile.spawnStateId || 'lagos',
                  timestamp: new Date().toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
                  status: 'Pending',
                };
                const updated = [newTicket, ...feedbackTickets];
                setFeedbackTickets(updated);
                try {
                  localStorage.setItem('naija_life_community_feedback_v1', JSON.stringify(updated));
                } catch {}
                try {
                  await fetch('/api/suggestions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newTicket),
                  });
                } catch {}
                setSuggestionTitle('');
                setSuggestionDetails('');
                triggerSound?.('success');
                onShowToast('Feedback submitted! Dispatched to Apex Syndicate Owner.');
              };

              const handleUpdateTicketStatus = async (ticketId: string, status: 'Reviewed' | 'Resolved') => {
                const updated = feedbackTickets.map((t) => (t.id === ticketId ? { ...t, status } : t));
                setFeedbackTickets(updated);
                try {
                  localStorage.setItem('naija_life_community_feedback_v1', JSON.stringify(updated));
                } catch {}
                try {
                  const headers = await getAuthBearerHeaders();
                  await fetch(`/api/suggestions/${encodeURIComponent(ticketId)}`, {
                    method: 'PATCH',
                    headers,
                    body: JSON.stringify({ status }),
                  });
                } catch {}
                triggerSound?.('coin');
                onShowToast(`Ticket marked as ${status}!`);
              };

              const handleDeleteTicket = (ticketId: string) => {
                const updated = feedbackTickets.filter((t) => t.id !== ticketId);
                setFeedbackTickets(updated);
                try {
                  localStorage.setItem('naija_life_community_feedback_v1', JSON.stringify(updated));
                } catch {}
                triggerSound?.('alert');
                onShowToast('Ticket removed.');
              };

              return (
                <div className="space-y-4">
                  {/* Top Banner */}
                  <div className="bg-gradient-to-r from-violet-950/90 via-purple-950/80 to-zinc-950 border border-violet-500/40 rounded-2xl p-3.5 shadow-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xs font-black text-violet-200 flex items-center gap-1.5">
                          <MessageSquarePlus className="w-4 h-4 text-violet-400" />
                          <span>Suggestions & Complaints</span>
                        </h3>
                        <p className="text-[10px] text-zinc-400 mt-0.5">
                          Direct citizen portal to submit game feedback, bug reports & requests
                        </p>
                      </div>
                      {isGameOwner && (
                        <div className="px-2 py-0.5 rounded-full bg-amber-400 text-black text-[9px] font-black uppercase tracking-wider shrink-0">
                          👑 OWNER ACCESS
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Navigation Tabs */}
                  <div className="flex gap-1.5 p-1 bg-zinc-900/90 border border-zinc-800 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setSuggestionTab('submit')}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        suggestionTab === 'submit'
                          ? 'bg-violet-600 text-white font-black shadow-md'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      Submit Feedback
                    </button>
                    <button
                      type="button"
                      onClick={() => setSuggestionTab('my_submissions')}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        suggestionTab === 'my_submissions'
                          ? 'bg-violet-600 text-white font-black shadow-md'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      My Tickets ({myTickets.length})
                    </button>
                    {isGameOwner && (
                      <button
                        type="button"
                        onClick={async () => {
                          setSuggestionTab('owner_inbox');
                          try {
                            const headers = await getAuthBearerHeaders();
                            const res = await fetch('/api/suggestions', { headers });
                            if (res.ok) {
                              const data = await res.json();
                              if (Array.isArray(data.tickets)) {
                                setFeedbackTickets(data.tickets);
                              }
                            }
                          } catch {}
                        }}
                        className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-black transition-all cursor-pointer flex items-center justify-center gap-1 ${
                          suggestionTab === 'owner_inbox'
                            ? 'bg-amber-400 text-zinc-950 shadow-md'
                            : 'text-amber-400 hover:text-amber-300'
                        }`}
                      >
                        <span>Owner Inbox</span>
                        <span className="px-1.5 py-0.2 rounded-full bg-black/40 text-[9px]">
                          {feedbackTickets.length}
                        </span>
                      </button>
                    )}
                  </div>

                  {/* TAB 1: SUBMIT FEEDBACK */}
                  {suggestionTab === 'submit' && (
                    <form onSubmit={handleFeedbackSubmit} className="space-y-3 bg-zinc-950/80 border border-zinc-800 p-3.5 rounded-2xl">
                      <div>
                        <label className="text-[10px] font-bold text-zinc-400 block mb-1">Feedback Category</label>
                        <div className="grid grid-cols-2 gap-1.5">
                          {(['Suggestion', 'Complaint', 'Bug Report', 'General'] as const).map((cat) => (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => setSuggestionCategory(cat)}
                              className={`py-1.5 px-2 rounded-xl text-[10px] font-bold border transition-all cursor-pointer text-left flex items-center gap-1.5 ${
                                suggestionCategory === cat
                                  ? 'bg-violet-600/30 border-violet-500 text-violet-200 font-black'
                                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                              }`}
                            >
                              <span>{cat === 'Suggestion' ? '💡' : cat === 'Complaint' ? '⚠️' : cat === 'Bug Report' ? '🐛' : '📝'}</span>
                              <span>{cat}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-zinc-400 block mb-1">Title / Summary</label>
                        <input
                          type="text"
                          value={suggestionTitle}
                          onChange={(e) => setSuggestionTitle(e.target.value)}
                          placeholder="e.g. Add more street foods in Abuja, or Map glitch..."
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-zinc-400 block mb-1">Detailed Description</label>
                        <textarea
                          rows={4}
                          value={suggestionDetails}
                          onChange={(e) => setSuggestionDetails(e.target.value)}
                          placeholder="Explain your suggestion or complaint in detail..."
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 resize-none"
                        />
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-1">
                        <span>Filing as: <strong className="text-emerald-400">@{userProfile?.username}</strong></span>
                        <span className="capitalize">State: {userProfile?.spawnStateId || 'Lagos'}</span>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-black text-xs tracking-wide shadow-lg shadow-violet-500/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit Feedback to Owner @chiboy_52</span>
                      </button>
                    </form>
                  )}

                  {/* TAB 2: MY SUBMISSIONS */}
                  {suggestionTab === 'my_submissions' && (
                    <div className="space-y-2">
                      {myTickets.length === 0 ? (
                        <div className="py-10 text-center text-xs text-zinc-500 bg-zinc-950/40 border border-zinc-800 rounded-2xl p-6">
                          <MessageSquarePlus className="w-8 h-8 text-zinc-600 mx-auto mb-2 opacity-50" />
                          <p className="font-bold text-zinc-400">You haven't submitted any feedback yet.</p>
                          <p className="text-[10px] text-zinc-500 mt-1">Use the "Submit Feedback" tab to send suggestions or complaints directly to the owner.</p>
                        </div>
                      ) : (
                        myTickets.map((t) => (
                          <div key={t.id} className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                                t.category === 'Suggestion'
                                  ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40'
                                  : t.category === 'Complaint'
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                  : t.category === 'Bug Report'
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                  : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                              }`}>
                                {t.category}
                              </span>
                              <span className="text-[9px] text-zinc-500">{t.timestamp}</span>
                            </div>
                            <h4 className="text-xs font-black text-white">{t.title}</h4>
                            <p className="text-[11px] text-zinc-300 whitespace-pre-wrap">{t.details}</p>
                            <div className="flex items-center justify-between pt-1 border-t border-zinc-800/60 text-[9px]">
                              <span className="text-zinc-500">Status: <strong className={t.status === 'Resolved' ? 'text-emerald-400' : t.status === 'Reviewed' ? 'text-blue-400' : 'text-amber-400'}>{t.status}</strong></span>
                              <span className="text-zinc-500">Forwarded to Game Owner</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* TAB 3: OWNER INBOX (EXCLUSIVE TAB FOR @chiboy_52 ONLY) */}
                  {suggestionTab === 'owner_inbox' && isGameOwner && (
                    <div className="space-y-3">
                      <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] flex items-center justify-between">
                        <span className="font-bold">Owner Inbox: Live Citizen Feedback ({feedbackTickets.length})</span>
                        <span className="text-[9px] font-mono text-zinc-400">Confidential Admin View</span>
                      </div>

                      {feedbackTickets.length === 0 ? (
                        <div className="py-12 text-center text-xs text-zinc-500 bg-zinc-950/60 border border-zinc-800 rounded-2xl p-6">
                          <MessageSquare className="w-10 h-10 text-zinc-600 mx-auto mb-2 opacity-50" />
                          <p className="font-black text-zinc-300 text-sm">No Suggestions or Complaints Received Yet</p>
                          <p className="text-[11px] text-zinc-400 mt-1 max-w-xs mx-auto">
                            As an online multiplayer game, this admin inbox is completely real and clean. It will populate in real-time as citizens submit tickets.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          {feedbackTickets.map((t) => (
                            <div key={t.id} className="p-3.5 rounded-2xl bg-zinc-950/90 border border-zinc-800 hover:border-violet-500/50 transition-colors space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                                    t.category === 'Suggestion'
                                      ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40'
                                      : t.category === 'Complaint'
                                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                      : t.category === 'Bug Report'
                                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                      : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                                  }`}>
                                    {t.category}
                                  </span>
                                  <span className="text-[10px] text-emerald-400 font-mono font-bold">@{t.username}</span>
                                </div>
                                <span className="text-[9px] text-zinc-500">{t.timestamp}</span>
                              </div>

                              <div>
                                <h4 className="text-xs font-black text-white">{t.title}</h4>
                                <p className="text-[11px] text-zinc-300 mt-1 whitespace-pre-wrap bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800/80">
                                  {t.details}
                                </p>
                              </div>

                              <div className="flex items-center justify-between pt-1 text-[10px]">
                                <span className="text-zinc-500">
                                  Origin: <span className="capitalize text-zinc-300">{t.stateOrigin} State</span> · Status: <strong className={t.status === 'Resolved' ? 'text-emerald-400' : t.status === 'Reviewed' ? 'text-blue-400' : 'text-amber-400'}>{t.status}</strong>
                                </span>

                                <div className="flex items-center gap-1.5">
                                  {t.status !== 'Reviewed' && (
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateTicketStatus(t.id, 'Reviewed')}
                                      className="px-2 py-1 rounded-lg bg-blue-600/30 hover:bg-blue-600 text-blue-200 text-[9px] font-bold transition-colors cursor-pointer"
                                    >
                                      Mark Reviewed
                                    </button>
                                  )}
                                  {t.status !== 'Resolved' && (
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateTicketStatus(t.id, 'Resolved')}
                                      className="px-2 py-1 rounded-lg bg-emerald-600/30 hover:bg-emerald-600 text-emerald-200 text-[9px] font-bold transition-colors cursor-pointer"
                                    >
                                      Mark Resolved
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteTicket(t.id)}
                                    className="p-1 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white transition-colors cursor-pointer"
                                    title="Delete Ticket"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* =============================================================
                SNAPCHAT APP: SET TO COMING SOON AS REQUESTED
                ============================================================= */}
            {currentApp === 'snapchat' && (
              <div className="h-full -m-4 min-h-[480px] bg-gradient-to-b from-[#fffc00] via-zinc-950 to-black text-white p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
                <div className="w-20 h-20 rounded-3xl bg-yellow-400 border-4 border-black/80 flex items-center justify-center text-5xl shadow-[0_10px_30px_rgba(255,252,0,0.4)] mb-4 animate-bounce">
                  👻
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-400/20 border border-yellow-400/50 text-yellow-300 font-mono text-[10px] font-black uppercase tracking-wider mb-2">
                  <span>👻 OFFICIAL SNAPCHAT</span>
                </div>
                <h2 className="text-2xl font-black text-white tracking-tight drop-shadow-md">
                  COMING SOON!
                </h2>
                <p className="text-xs text-zinc-300 mt-2 max-w-xs leading-relaxed font-sans">
                  Snapchat for Naija Life is currently in development. We will work on it later!
                </p>
                <div className="mt-4 p-3.5 bg-zinc-900/90 border border-zinc-800 rounded-2xl text-[11px] text-zinc-300 space-y-1.5 text-left max-w-xs">
                  <p className="text-yellow-400 font-bold flex items-center gap-1.5">
                    <span>✨ In Future Updates:</span>
                  </p>
                  <p>• Live Photo & Video Snaps across all 36 States & Canada</p>
                  <p>• Real-time Streaks (🔥) with other citizens</p>
                  <p>• Snap Map with real live citizen locations</p>
                  <p>• Add & chat with newly registered citizens</p>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentApp('home')}
                  className="mt-6 py-3 px-8 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs cursor-pointer shadow-xl transition-all active:scale-95"
                >
                  Back to Home Screen
                </button>
              </div>
            )}
          </div>

          {/* IPHONE HOME BAR / GESTURE INDICATOR */}
          <div className="py-1 shrink-0 z-20 pointer-events-none">
            <div className="w-32 h-1 bg-white/70 rounded-full mx-auto" />
          </div>

          {/* =============================================================
              105 WALLPAPERS SELECTION MODAL
              ============================================================= */}
          {isWallpaperGalleryOpen && (
            <div className="absolute inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col p-4 text-left animate-in fade-in zoom-in-95 duration-200">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                    <Palette className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-white">Phone Wallpapers</h3>
                    <p className="text-[10px] text-zinc-400 font-mono">105 Aesthetic Themes Available</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsWallpaperGalleryOpen(false)}
                  className="p-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Search bar */}
              <div className="pt-2.5 pb-1">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={wallpaperSearch}
                    onChange={(e) => setWallpaperSearch(e.target.value)}
                    placeholder="Search by wallpaper name or vibe..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 font-medium"
                  />
                </div>
              </div>

              {/* Category Pills */}
              <div className="flex gap-1.5 overflow-x-auto py-2 scrollbar-none shrink-0">
                {['All', 'Luxury', 'African', 'Cyberpunk', 'Nature', 'Minimal', 'Cosmic', 'Gaming', 'Vibrant'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setWallpaperCategoryFilter(cat)}
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                      wallpaperCategoryFilter === cat
                        ? 'bg-amber-400 text-black font-black shadow-md shadow-amber-500/20'
                        : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Wallpapers Grid */}
              <div className="flex-1 overflow-y-auto pr-0.5 space-y-2 mt-1">
                {(() => {
                  const filtered = EXPANDED_105_WALLPAPERS.filter((wp) => {
                    const matchCategory = wallpaperCategoryFilter === 'All' || wp.category === wallpaperCategoryFilter;
                    const matchSearch =
                      !wallpaperSearch ||
                      wp.name.toLowerCase().includes(wallpaperSearch.toLowerCase()) ||
                      wp.description.toLowerCase().includes(wallpaperSearch.toLowerCase()) ||
                      wp.category.toLowerCase().includes(wallpaperSearch.toLowerCase());
                    return matchCategory && matchSearch;
                  });

                  if (filtered.length === 0) {
                    return (
                      <div className="py-12 text-center text-zinc-500 text-xs">
                        No wallpapers found for &quot;{wallpaperSearch}&quot;.
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-2 gap-2 pb-6">
                      {filtered.map((wp) => {
                        const isSelected = wp.id === currentWallpaper;
                        return (
                          <div
                            key={wp.id}
                            onClick={() => {
                              setCurrentWallpaper(wp.id);
                              if (userProfile) {
                                userProfile.phoneWallpaper = wp.id;
                              }
                              try {
                                localStorage.setItem('naija_life_wallpaper', wp.id);
                              } catch {}
                              onShowToast(`🎨 Applied "${wp.name}" wallpaper!`);
                              triggerSound?.('coin');
                              setIsWallpaperGalleryOpen(false);
                            }}
                            className={`p-2.5 rounded-2xl border transition-all cursor-pointer text-left relative overflow-hidden group flex flex-col justify-between h-28 shadow-md ${
                              isSelected
                                ? 'border-amber-400 ring-2 ring-amber-400/50'
                                : 'border-zinc-800 hover:border-zinc-600'
                            }`}
                          >
                            {/* Visual gradient backdrop */}
                            <div className={`absolute inset-0 ${wp.bgClass} opacity-90 group-hover:scale-105 transition-transform duration-300`} />
                            <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" />

                            {/* Top badge */}
                            <div className="relative z-10 flex items-center justify-between">
                              <span className="px-1.5 py-0.5 rounded-md bg-black/60 border border-white/10 text-[8px] font-mono text-amber-300 uppercase">
                                {wp.category}
                              </span>
                              {isSelected && (
                                <span className="w-5 h-5 rounded-full bg-amber-400 text-black flex items-center justify-center text-[10px] font-bold shadow">
                                  ✓
                                </span>
                              )}
                            </div>

                            {/* Bottom Name & Description */}
                            <div className="relative z-10 space-y-0.5">
                              <h4 className="text-[11px] font-black text-white leading-tight drop-shadow truncate">
                                {wp.name}
                              </h4>
                              <p className="text-[8px] text-zinc-300 line-clamp-1 opacity-90">
                                {wp.description}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* =============================================================
              WARDROBE & 3D AVATAR CUSTOMIZATION MODAL (ALL PLAYERS)
              ============================================================= */}
          {isAvatarModalOpen && (
            <div className="absolute inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col p-4 text-left animate-in fade-in zoom-in-95 duration-200 overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-white">Wardrobe & 3D Avatar</h3>
                    <p className="text-[10px] text-zinc-400 font-mono">Real-Time 3D Mesh Customizer</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAvatarModalOpen(false)}
                  className="p-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* 3D Model Interactive Stage */}
              <div className="mt-3 w-full h-52 bg-gradient-to-b from-zinc-900/90 via-zinc-950 to-black rounded-2xl border border-zinc-800 flex items-center justify-center relative overflow-hidden shrink-0 shadow-inner">
                <ThreeCharacterAvatar avatar={tempAvatar} size="lg" interactive={true} className="mx-auto" />
                <div className="absolute bottom-2 left-2 z-10 pointer-events-none">
                  <span className="px-2 py-0.5 rounded-md bg-black/70 text-zinc-400 text-[9px] font-mono border border-white/10">
                    Drag to rotate 360°
                  </span>
                </div>
              </div>

              {/* Customization Options */}
              <div className="space-y-4 py-3 flex-1">
                {/* 1. GENDER SELECTION */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-black text-white block uppercase tracking-wider">
                    1. Select Gender
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setTempAvatar({ ...tempAvatar, gender: 'male' })}
                      className={`py-2 px-3 rounded-xl border text-xs font-black flex items-center justify-center gap-2 cursor-pointer transition-all ${
                        tempAvatar.gender === 'male'
                          ? 'bg-emerald-500 text-black border-emerald-400 shadow-md'
                          : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <span>👨 Male Character</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTempAvatar({ ...tempAvatar, gender: 'female' })}
                      className={`py-2 px-3 rounded-xl border text-xs font-black flex items-center justify-center gap-2 cursor-pointer transition-all ${
                        tempAvatar.gender === 'female'
                          ? 'bg-emerald-500 text-black border-emerald-400 shadow-md'
                          : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <span>👩 Female Character</span>
                    </button>
                  </div>
                </div>

                {/* 2. SKIN TONE SELECTION */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-white block uppercase tracking-wider">
                      2. Skin Tone
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400">
                      {tempAvatar.skinTone}
                    </span>
                  </div>
                  <div className="flex gap-2 overflow-x-auto py-1 scrollbar-none">
                    {[
                      { id: '#3b220d', label: 'Ebony Rich' },
                      { id: '#4a2c11', label: 'Deep Espresso' },
                      { id: '#6b3a1a', label: 'Dark Cocoa' },
                      { id: '#8d5524', label: 'Warm Bronze' },
                      { id: '#b07946', label: 'Caramel Honey' },
                      { id: '#c68642', label: 'Almond Glow' },
                      { id: '#d99b66', label: 'Golden Sand' },
                    ].map((tone) => (
                      <button
                        key={tone.id}
                        type="button"
                        onClick={() => setTempAvatar({ ...tempAvatar, skinTone: tone.id })}
                        className={`w-9 h-9 rounded-full border-2 transition-transform cursor-pointer shrink-0 ${
                          tempAvatar.skinTone === tone.id
                            ? 'border-emerald-400 scale-110 ring-2 ring-emerald-400/50'
                            : 'border-zinc-700 hover:scale-105'
                        }`}
                        style={{ backgroundColor: tone.id }}
                        title={tone.label}
                      />
                    ))}
                  </div>
                </div>

                {/* 3. 3D HAIRSTYLE SELECTION */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-black text-white block uppercase tracking-wider">
                    3. 3D Hairstyle & Headwear
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'peaky_cap', name: '🧢 Peaky Flat Cap', sub: 'Tweed Wool Brim' },
                      { id: 'afro', name: '👑 Classic 3D Afro', sub: 'High Crown, Clear Face' },
                      { id: 'fade', name: '💈 Low / Mid Fade', sub: 'Crisp Edge-up Line' },
                      { id: 'waves', name: '🌊 360 Waves', sub: 'Concentric Specular Flow' },
                      { id: 'braids', name: '🧵 Braids / Plats', sub: 'Intricate Platted' },
                      { id: 'dreads', name: '🧶 Dreadlocks / Locs', sub: 'Natural Strands' },
                      { id: 'buzz', name: '✂️ Clean Buzz Cut', sub: 'Sharp Low Crop' },
                      { id: 'gele', name: '👒 Nigerian Gele', sub: 'Traditional Head-Tie' },
                    ].map((hair) => (
                      <button
                        key={hair.id}
                        type="button"
                        onClick={() => setTempAvatar({ ...tempAvatar, hairstyle: hair.id as any })}
                        className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                          tempAvatar.hairstyle === hair.id
                            ? 'bg-emerald-950/80 border-emerald-400 text-white ring-1 ring-emerald-400'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                        }`}
                      >
                        <span className="text-xs font-black block">{hair.name}</span>
                        <span className="text-[9px] text-zinc-400 font-mono block">{hair.sub}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. OUTFIT SELECTION */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-black text-white block uppercase tracking-wider">
                    4. Tailored Outfits
                  </span>
                  <div className="space-y-1.5">
                    {[
                      {
                        id: 'corporate',
                        name: '👔 Dapper Tweed Vest & Red Tie',
                        desc: 'Tailored tweed grey waistcoat with crisp white shirt, red silk tie & pinstripe trousers.',
                      },
                      {
                        id: 'casual',
                        name: '👕 Simple White Tee & Blue Jeans',
                        desc: 'Classic crewneck with blue denim jeans and clean white sneakers.',
                      },
                      {
                        id: 'trad_senator',
                        name: '🧥 Casual Grey Polo & Chinos',
                        desc: 'Comfortable casual polo shirt with light beige chinos and dark loafers.',
                      },
                      {
                        id: 'streetwear',
                        name: '🏃 Everyday Cotton Shirt & Trackpants',
                        desc: 'Relaxed forest green cotton tee with dark charcoal sweatpants and clean trainers.',
                      },
                      {
                        id: 'ankara',
                        name: '👘 Basic Local Ankara Native',
                        desc: 'Short-sleeve wax print native top with dark casual trousers.',
                      },
                    ].map((fit) => (
                      <button
                        key={fit.id}
                        type="button"
                        onClick={() => setTempAvatar({ ...tempAvatar, outfit: fit.id as any })}
                        className={`w-full p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                          tempAvatar.outfit === fit.id
                            ? 'bg-emerald-950/80 border-emerald-400 text-white ring-1 ring-emerald-400'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-white">{fit.name}</span>
                          {tempAvatar.outfit === fit.id && (
                            <span className="text-[10px] text-emerald-400 font-bold">Active</span>
                          )}
                        </div>
                        <p className="text-[10px] text-zinc-400 mt-0.5">{fit.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Save & Synchronize Button */}
              <div className="pt-3 border-t border-zinc-800 shrink-0">
                <button
                  type="button"
                  onClick={async () => {
                    const updatedProfile: UserProfile = {
                      ...userProfile,
                      avatar: tempAvatar,
                    };

                    try {
                      localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(updatedProfile));
                    } catch {}

                    if (updatedProfile.uid) {
                      try {
                        await syncProfileToCloud(updatedProfile.uid, { avatar: tempAvatar });
                      } catch {}
                    }

                    onUpdateProfile?.(updatedProfile);
                    setIsAvatarModalOpen(false);
                    triggerSound?.('coin');
                    onShowToast('Wardrobe & 3D Avatar saved & synchronized to cloud!');
                  }}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:from-emerald-400 text-black font-black text-xs cursor-pointer shadow-lg flex items-center justify-center gap-2 transition-all active:scale-98"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>SAVE & SYNCHRONIZE 3D AVATAR</span>
                </button>
              </div>
            </div>
          )}

          {/* =============================================================
              OWNER MP3 BROADCAST SYNCING OVERLAY (UNSKIPPABLE 2.5S)
              ============================================================= */}
          {isBroadcastingSyncing && (
            <div className="absolute inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-150">
              {/* Radio wave animation */}
              <div className="relative mb-6">
                <div className="w-20 h-20 rounded-full bg-amber-500/20 border-2 border-amber-500/50 flex items-center justify-center animate-pulse">
                  <div className="w-14 h-14 rounded-full bg-amber-500/30 flex items-center justify-center">
                    <Volume2 className="w-7 h-7 text-amber-300 animate-bounce" />
                  </div>
                </div>
                <div className="absolute inset-0 rounded-full border border-amber-400/40 animate-ping" />
              </div>

              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[9px] font-black uppercase tracking-wider border border-amber-500/40 mb-3">
                NAIJA LIFE SERVER BROADCAST
              </span>

              <h3 className="text-sm font-black text-white max-w-[260px] leading-tight">
                Detecting audio and syncing across Naija Life servers...
              </h3>

              <p className="text-[11px] text-zinc-400 mt-2 font-mono truncate max-w-[240px]">
                🎵 {ownerBroadcastTrack || 'Broadcasting audio track'}
              </p>

              {/* Progress Bar */}
              <div className="w-full max-w-[260px] mt-5 space-y-1.5">
                <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 transition-all duration-100 ease-out rounded-full"
                    style={{ width: `${broadcastSyncProgress}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400">
                  <span>Propagating server-wide</span>
                  <span className="text-amber-400 font-bold">{broadcastSyncProgress}%</span>
                </div>
              </div>

              <p className="text-[9px] text-zinc-500 mt-6 font-mono">
                Audio will loop continuously for all connected citizens.
              </p>
            </div>
          )}

          {/* =============================================================
              GLOBAL SERVER SYNC UNSKIPPABLE OVERLAY (FOR chiboy_52)
              ============================================================= */}
          {isGlobalServerSyncing && (
            <div className="absolute inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-150">
              <div className="relative mb-6">
                <div className="w-20 h-20 rounded-full bg-amber-500/20 border-2 border-amber-500/50 flex items-center justify-center animate-spin">
                  <RefreshCw className="w-8 h-8 text-amber-400" />
                </div>
                <div className="absolute inset-0 rounded-full border border-amber-400/40 animate-ping" />
              </div>

              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[9px] font-black uppercase tracking-wider border border-amber-500/40 mb-3">
                NAIJA LIFE GLOBAL MASTER SYNCHRONIZER
              </span>

              <h3 className="text-sm font-black text-white max-w-[260px] leading-tight">
                Processing and refreshing every citizen&apos;s game across continents...
              </h3>

              <p className="text-[11px] text-zinc-400 mt-2 font-mono max-w-[240px]">
                🌐 Registering all citizen accounts, syncing Snapchat registry & unlocking cross-border banking
              </p>

              {/* Progress Bar */}
              <div className="w-full max-w-[260px] mt-5 space-y-1.5">
                <div className="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 transition-all duration-100 ease-out rounded-full"
                    style={{ width: `${globalServerSyncPct}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400">
                  <span>Syncing worldwide</span>
                  <span className="text-amber-400 font-bold">{globalServerSyncPct}%</span>
                </div>
              </div>

              <p className="text-[9px] text-zinc-500 mt-6 font-mono">
                Real-time propagation to all active browsers and devices.
              </p>
            </div>
          )}

          {/* =============================================================
              CITIZEN ACCOUNT REGISTRY — APEX SYNDICATE OWNER SETTINGS (LIVE FIRESTORE)
              ============================================================= */}
          {isPlayersRegistryModalOpen && checkIsOwner(userProfile) && (() => {
            const pageSize = 6;
            const filtered = playersRegistryList
              .filter((p) => {
                if (registryVerifyFilter === 'verified' && !p.emailVerified) return false;
                if (registryVerifyFilter === 'unverified' && p.emailVerified) return false;
                if (registryStatusFilter === 'active' && p.accountStatus !== 'active') return false;
                if (registryStatusFilter === 'suspended' && p.accountStatus !== 'suspended') return false;
                const q = registrySearchTerm.toLowerCase().trim();
                if (!q) return true;
                return (
                  (p.username && p.username.toLowerCase().includes(q)) ||
                  (p.email && p.email.toLowerCase().includes(q)) ||
                  (p.uid && p.uid.toLowerCase().includes(q)) ||
                  (p.stateOfOrigin && p.stateOfOrigin.toLowerCase().includes(q))
                );
              })
              .sort((a, b) => {
                const ta = a.createdAtIso ? new Date(a.createdAtIso).getTime() : 0;
                const tb = b.createdAtIso ? new Date(b.createdAtIso).getTime() : 0;
                return registrySortOrder === 'newest' ? tb - ta : ta - tb;
              });

            const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
            const safePage = Math.min(registryPage, totalPages);
            const pagedCitizens = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

            return (
              <div className="absolute inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col p-4 text-left animate-in fade-in duration-150">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800 shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/50 flex items-center justify-center">
                      <Crown className="w-4 h-4 text-amber-400 fill-amber-400" />
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-white uppercase tracking-wider">
                        Citizen Account Registry
                      </h3>
                      <span className="text-[9px] font-mono text-amber-300">
                        Apex Syndicate · Live Firestore Database
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsPlayersRegistryModalOpen(false);
                      setInspectedCitizen(null);
                    }}
                    className="p-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-700 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Registry Dashboard Metrics */}
                <div className="grid grid-cols-3 gap-1.5 my-2.5 shrink-0 font-mono">
                  <div className="p-2 rounded-xl bg-zinc-900/80 border border-zinc-800">
                    <span className="text-[8px] text-zinc-400 uppercase block">Total</span>
                    <span className="text-sm font-black text-white">{registryMetrics.total}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/30">
                    <span className="text-[8px] text-emerald-300 uppercase block">Verified</span>
                    <span className="text-sm font-black text-emerald-400">{registryMetrics.verified}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-amber-950/40 border border-amber-500/30">
                    <span className="text-[8px] text-amber-300 uppercase block">Unverified</span>
                    <span className="text-sm font-black text-amber-400">{registryMetrics.unverified}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-sky-950/40 border border-sky-500/30">
                    <span className="text-[8px] text-sky-300 uppercase block">Recent (7d)</span>
                    <span className="text-sm font-black text-sky-400">{registryMetrics.recent}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-zinc-900/80 border border-zinc-800">
                    <span className="text-[8px] text-zinc-400 uppercase block">Active</span>
                    <span className="text-sm font-black text-emerald-300">{registryMetrics.active}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-rose-950/40 border border-rose-500/30">
                    <span className="text-[8px] text-rose-300 uppercase block">Suspended</span>
                    <span className="text-sm font-black text-rose-400">{registryMetrics.suspended}</span>
                  </div>
                </div>

                {/* Sub-tabs: Citizens vs Audit Logs */}
                <div className="flex gap-1.5 mb-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setRegistryActiveTab('citizens')}
                    className={`flex-1 py-1.5 rounded-xl text-[10px] font-black cursor-pointer border ${
                      registryActiveTab === 'citizens'
                        ? 'bg-amber-400 text-black border-amber-300'
                        : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                    }`}
                  >
                    Citizens ({playersRegistryList.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegistryActiveTab('audit')}
                    className={`flex-1 py-1.5 rounded-xl text-[10px] font-black cursor-pointer border ${
                      registryActiveTab === 'audit'
                        ? 'bg-amber-400 text-black border-amber-300'
                        : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                    }`}
                  >
                    Audit Logs ({registryAuditLogs.length})
                  </button>
                  <button
                    type="button"
                    disabled={isRegistryScanning}
                    onClick={async () => {
                      setIsRegistryScanning(true);
                      setRegistryScanPct(30);
                      setRegistryScanMsg('Refreshing live Firestore citizen registry...');
                      try {
                        const headers = await getAuthBearerHeaders();
                        await fetch('/api/owner/global-refresh', {
                          method: 'POST',
                          headers,
                        }).catch(() => {});
                        setRegistryScanPct(75);
                        const fresh = await fetchPlayersRegistry();
                        setRegistryScanPct(100);
                        setRegistryScanResult(`Synced ${fresh.length} live citizen record(s) from Firestore.`);
                      } finally {
                        setIsRegistryScanning(false);
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-amber-300 text-[10px] font-bold cursor-pointer flex items-center gap-1"
                  >
                    <RefreshCw className={`w-3 h-3 ${isRegistryScanning ? 'animate-spin' : ''}`} />
                    <span>Sync</span>
                  </button>
                </div>

                {registryScanResult && (
                  <div className="mb-2 p-2 rounded-xl bg-zinc-900 border border-amber-500/40 text-[10px] text-amber-200 shrink-0">
                    {registryScanResult}
                  </div>
                )}

                {registryActiveTab === 'citizens' ? (
                  <>
                    {/* Search & Filters */}
                    <div className="space-y-1.5 mb-2 shrink-0">
                      <input
                        type="text"
                        placeholder="Search username, email, or account UID..."
                        value={registrySearchTerm}
                        onChange={(e) => {
                          setRegistrySearchTerm(e.target.value);
                          setRegistryPage(1);
                        }}
                        className="w-full px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white placeholder-zinc-500 outline-none focus:border-amber-400 font-mono"
                      />
                      <div className="grid grid-cols-3 gap-1 text-[9px]">
                        <select
                          value={registryVerifyFilter}
                          onChange={(e) => {
                            setRegistryVerifyFilter(e.target.value as any);
                            setRegistryPage(1);
                          }}
                          className="bg-zinc-900 border border-zinc-800 rounded-lg px-1.5 py-1 text-zinc-200"
                        >
                          <option value="all">All Emails</option>
                          <option value="verified">Verified</option>
                          <option value="unverified">Unverified</option>
                        </select>
                        <select
                          value={registryStatusFilter}
                          onChange={(e) => {
                            setRegistryStatusFilter(e.target.value as any);
                            setRegistryPage(1);
                          }}
                          className="bg-zinc-900 border border-zinc-800 rounded-lg px-1.5 py-1 text-zinc-200"
                        >
                          <option value="all">All Status</option>
                          <option value="active">Active</option>
                          <option value="suspended">Suspended</option>
                        </select>
                        <select
                          value={registrySortOrder}
                          onChange={(e) => setRegistrySortOrder(e.target.value as any)}
                          className="bg-zinc-900 border border-zinc-800 rounded-lg px-1.5 py-1 text-zinc-200"
                        >
                          <option value="newest">Newest First</option>
                          <option value="oldest">Oldest First</option>
                        </select>
                      </div>
                    </div>

                    {/* Citizens List */}
                    <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-none">
                      {pagedCitizens.length === 0 ? (
                        <div className="text-center py-8 text-zinc-500 text-xs font-mono">
                          No registered citizen accounts match the current filters.
                        </div>
                      ) : (
                        pagedCitizens.map((player) => {
                          const isOwnerRow = player.role === 'owner' && checkIsOwner(player);
                          return (
                            <div
                              key={player.uid}
                              className={`p-3 rounded-2xl border text-left space-y-2 transition-all ${
                                isOwnerRow
                                  ? 'bg-gradient-to-r from-amber-950/70 via-zinc-950 to-neutral-950 border-amber-500/70'
                                  : player.accountStatus === 'suspended'
                                  ? 'bg-rose-950/20 border-rose-500/50'
                                  : 'bg-zinc-950/90 border-zinc-800'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-xs font-black text-white font-mono">@{player.username}</span>
                                    {isOwnerRow && (
                                      <span className="px-1.5 py-0.5 rounded bg-amber-500/30 text-amber-300 border border-amber-500/60 text-[8px] font-black">
                                        OWNER
                                      </span>
                                    )}
                                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                                      player.emailVerified
                                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                    }`}>
                                      {player.emailVerified ? 'Verified' : 'Unverified'}
                                    </span>
                                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                                      player.accountStatus === 'suspended'
                                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                        : 'bg-zinc-800 text-zinc-300'
                                    }`}>
                                      {player.accountStatus}
                                    </span>
                                  </div>
                                  <div className="text-[10px] text-emerald-300 font-mono truncate mt-0.5">
                                    {player.email}
                                  </div>
                                  <div className="text-[9px] text-zinc-500 font-mono truncate">
                                    UID: {player.uid}
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setInspectedCitizen(player);
                                    setSuspendReasonInput(player.suspensionReason || '');
                                  }}
                                  className="px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-amber-300 text-[10px] font-bold flex items-center gap-1 cursor-pointer shrink-0"
                                >
                                  <span>Inspect</span>
                                  <ChevronRight className="w-3 h-3" />
                                </button>
                              </div>

                              <div className="grid grid-cols-2 gap-1 text-[9px] font-mono text-zinc-400 pt-1 border-t border-zinc-800/60">
                                <div>
                                  Joined: <strong className="text-zinc-200">{player.createdAtIso ? new Date(player.createdAtIso).toLocaleDateString() : '—'}</strong>
                                </div>
                                <div>
                                  Last Login: <strong className="text-zinc-200">{player.lastLoginIso ? new Date(player.lastLoginIso).toLocaleDateString() : '—'}</strong>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-[10px] font-mono shrink-0">
                        <button
                          type="button"
                          disabled={safePage <= 1}
                          onClick={() => setRegistryPage((p) => Math.max(1, p - 1))}
                          className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 disabled:opacity-40 cursor-pointer"
                        >
                          Prev
                        </button>
                        <span className="text-zinc-400">
                          Page {safePage} / {totalPages} ({filtered.length} matching)
                        </span>
                        <button
                          type="button"
                          disabled={safePage >= totalPages}
                          onClick={() => setRegistryPage((p) => Math.min(totalPages, p + 1))}
                          className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 disabled:opacity-40 cursor-pointer"
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  /* Audit Logs Tab */
                  <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-none">
                    {registryAuditLogs.length === 0 ? (
                      <div className="text-center py-8 text-zinc-500 text-xs font-mono">
                        No owner audit logs recorded yet.
                      </div>
                    ) : (
                      registryAuditLogs.map((log) => (
                        <div key={log.id} className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1 text-[10px]">
                          <div className="flex items-center justify-between">
                            <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold text-[9px]">
                              {log.action}
                            </span>
                            <span className="text-[9px] text-zinc-500 font-mono">
                              {log.createdAtIso ? new Date(log.createdAtIso).toLocaleString() : ''}
                            </span>
                          </div>
                          <p className="text-zinc-300 leading-snug">{log.details}</p>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* INSPECTED CITIZEN DETAILS MODAL */}
                {inspectedCitizen && (
                  <div className="absolute inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col p-4 space-y-3 overflow-y-auto">
                    <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                      <div>
                        <h4 className="text-xs font-black text-white font-mono">@{inspectedCitizen.username}</h4>
                        <span className="text-[9px] text-zinc-400 font-mono">{inspectedCitizen.uid}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setInspectedCitizen(null)}
                        className="p-1.5 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1.5 text-[10px] font-mono">
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Email (Owner Only):</span>
                        <span className="text-emerald-300 font-bold">{inspectedCitizen.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Role:</span>
                        <span className="text-amber-300 font-bold uppercase">{inspectedCitizen.role}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Email Verified:</span>
                        <span className={inspectedCitizen.emailVerified ? 'text-emerald-400' : 'text-amber-400'}>
                          {inspectedCitizen.emailVerified ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Account Status:</span>
                        <span className={inspectedCitizen.accountStatus === 'suspended' ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                          {inspectedCitizen.accountStatus.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Registered:</span>
                        <span className="text-zinc-200">{inspectedCitizen.createdAtIso ? new Date(inspectedCitizen.createdAtIso).toLocaleString() : '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Last Login:</span>
                        <span className="text-zinc-200">{inspectedCitizen.lastLoginIso ? new Date(inspectedCitizen.lastLoginIso).toLocaleString() : '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Origin State:</span>
                        <span className="text-zinc-200 capitalize">{inspectedCitizen.stateOfOrigin || 'lagos'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Social Class:</span>
                        <span className="text-zinc-200 uppercase">{inspectedCitizen.socialClass || 'mapo'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Bank NGN:</span>
                        <span className="text-emerald-300">{formatFullNairaNumber(inspectedCitizen.bankNaira || 0)}</span>
                      </div>
                    </div>

                    {inspectedCitizen.uid !== userProfile?.uid && inspectedCitizen.role !== 'owner' && (
                      <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
                        <span className="text-[10px] font-bold text-zinc-300 block uppercase">
                          Account Moderation
                        </span>
                        {inspectedCitizen.accountStatus === 'active' ? (
                          <>
                            <input
                              type="text"
                              value={suspendReasonInput}
                              onChange={(e) => setSuspendReasonInput(e.target.value)}
                              placeholder="Reason for suspension (optional)..."
                              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white"
                            />
                            <button
                              type="button"
                              disabled={isSuspensionBusy}
                              onClick={async () => {
                                setIsSuspensionBusy(true);
                                try {
                                  await setCitizenSuspensionStatus({
                                    targetUid: inspectedCitizen.uid,
                                    targetUsername: inspectedCitizen.username,
                                    suspend: true,
                                    reason: suspendReasonInput.trim() || 'Suspended by Apex Syndicate Owner.',
                                  });
                                  await fetchPlayersRegistry();
                                  setInspectedCitizen((prev) =>
                                    prev ? { ...prev, accountStatus: 'suspended', suspensionReason: suspendReasonInput.trim() } : null
                                  );
                                  onShowToast(`Suspended @${inspectedCitizen.username}.`);
                                  triggerSound?.('alert');
                                } catch (err) {
                                  onShowToast(err instanceof Error ? err.message : 'Suspension failed.');
                                } finally {
                                  setIsSuspensionBusy(false);
                                }
                              }}
                              className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                            >
                              <Ban className="w-3.5 h-3.5" />
                              <span>{isSuspensionBusy ? 'Suspending...' : 'Suspend Account'}</span>
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            disabled={isSuspensionBusy}
                            onClick={async () => {
                              setIsSuspensionBusy(true);
                              try {
                                await setCitizenSuspensionStatus({
                                  targetUid: inspectedCitizen.uid,
                                  targetUsername: inspectedCitizen.username,
                                  suspend: false,
                                });
                                await fetchPlayersRegistry();
                                setInspectedCitizen((prev) =>
                                  prev ? { ...prev, accountStatus: 'active', suspensionReason: undefined } : null
                                );
                                onShowToast(`Restored @${inspectedCitizen.username} to active status.`);
                                triggerSound?.('success');
                              } catch (err) {
                                onShowToast(err instanceof Error ? err.message : 'Restore failed.');
                              } finally {
                                setIsSuspensionBusy(false);
                              }
                            }}
                            className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>{isSuspensionBusy ? 'Restoring...' : 'Restore Account'}</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {isRegistryScanning && (
                  <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-12 h-12 rounded-full border-4 border-amber-500/30 border-t-amber-400 animate-spin mb-3" />
                    <p className="text-xs text-amber-300 font-mono">{registryScanMsg} ({registryScanPct}%)</p>
                  </div>
                )}
              </div>
            );
          })()}

          {isNepaControlRoomOpen && checkIsOwner(userProfile) && (
            <div className="absolute inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col p-4 text-left animate-in fade-in duration-150">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-yellow-500/20 border border-yellow-500/50 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-white uppercase tracking-wider">
                      NEPA National Control Room
                    </h3>
                    <span className="text-[9px] font-mono text-zinc-400">
                      National Control Center, Osogbo &middot; @{userProfile?.username}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsNepaControlRoomOpen(false)}
                  className="p-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Master Actions */}
              <div className="grid grid-cols-2 gap-2 my-3 shrink-0">
                <button
                  type="button"
                  onClick={async () => {
                    setNepaControlGrid((prev) => {
                      const next: typeof prev = {};
                      for (const [k, v] of Object.entries(prev)) {
                        if (k === 'canada') {
                          next[k] = { ...v, lightOn: true, voltage: 120, megawatt: 42000 };
                        } else {
                          next[k] = { ...v, lightOn: false, voltage: 0, megawatt: 0 };
                        }
                      }
                      try {
                        localStorage.setItem('naija_life_nepa_grid', JSON.stringify(next));
                      } catch {}
                      return next;
                    });
                    try {
                      const headers = await getAuthBearerHeaders();
                      const res = await fetch('/api/nepa/toggle', {
                        method: 'POST',
                        headers,
                        body: JSON.stringify({ masterBlackout: true }),
                      });
                      const d = await res.json();
                      if (d.grid) {
                        setNepaControlGrid(d.grid);
                        try {
                          const bc = new BroadcastChannel('naija_life_nepa');
                          bc.postMessage({ grid: d.grid });
                          bc.close();
                        } catch {}
                      }
                    } catch {}
                    onShowToast('NATIONAL BLACKOUT TRIGGERED! Canada 24/7 power unaffected.');
                    triggerSound?.('alert');
                  }}
                  className="py-2.5 px-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-500/50 text-rose-200 font-black text-[10px] text-center cursor-pointer shadow-md flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                >
                  <span>Master Blackout (Nigeria Off)</span>
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    setNepaControlGrid((prev) => {
                      const next: typeof prev = {};
                      for (const [k, v] of Object.entries(prev)) {
                        next[k] = {
                          ...v,
                          lightOn: true,
                          voltage: k === 'canada' ? 120 : 220,
                          megawatt: k === 'canada' ? 42000 : 4200,
                        };
                      }
                      try {
                        localStorage.setItem('naija_life_nepa_grid', JSON.stringify(next));
                      } catch {}
                      return next;
                    });
                    try {
                      const headers = await getAuthBearerHeaders();
                      const res = await fetch('/api/nepa/toggle', {
                        method: 'POST',
                        headers,
                        body: JSON.stringify({ masterPowerOn: true }),
                      });
                      const d = await res.json();
                      if (d.grid) {
                        setNepaControlGrid(d.grid);
                        try {
                          const bc = new BroadcastChannel('naija_life_nepa');
                          bc.postMessage({ grid: d.grid });
                          bc.close();
                        } catch {}
                      }
                    } catch {}
                    onShowToast('NATIONWIDE POWER RESTORED! "Up NEPA!" shouts echo across Nigeria!');
                    triggerSound?.('success');
                  }}
                  className="py-2.5 px-2 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-200 font-black text-[10px] text-center cursor-pointer shadow-md flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                >
                  <span>Restore Nationwide Grid</span>
                </button>
              </div>

              {/* Live States List */}
              <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 scrollbar-none">
                <div className="text-[10px] font-mono text-zinc-400 uppercase font-bold px-1 pb-1">
                  Substations &amp; Feeder Lines (36 States + FCT + Canada):
                </div>
                {Object.entries(nepaControlGrid).map(([stId, stData]) => {
                  const isCanada = stId === 'canada';
                  const isOnline = isCanada ? true : stData.lightOn;
                  return (
                    <div
                      key={stId}
                      className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                        isOnline
                          ? 'bg-zinc-950/90 border-emerald-500/40'
                          : 'bg-zinc-950/90 border-rose-900/40 opacity-80'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-rose-500'}`} />
                        <div>
                          <div className="text-[11px] font-black text-white flex items-center gap-1">
                            <span>{stData.name}</span>
                            {isCanada && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-950 text-red-300 border border-red-500/40 font-mono font-bold">
                                CAN
                              </span>
                            )}
                          </div>
                          <div className="text-[9px] font-mono text-zinc-400">
                            {isCanada
                              ? '120V · 42,000 MW (Permanent 24/7 Grid)'
                              : stData.lightOn
                              ? `${stData.voltage}V · ${stData.megawatt} MW (Active)`
                              : '0V · 0 MW (Grid Trip)'}
                          </div>
                        </div>
                      </div>

                      {isCanada ? (
                        <span className="px-2.5 py-1 rounded-lg text-[9px] font-mono font-black uppercase border bg-emerald-950/90 text-emerald-300 border-emerald-500/50 select-none cursor-not-allowed shadow-inner">
                          24/7 HYDRO (NO NEPA)
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={async () => {
                            const nextStatus = !stData.lightOn;
                            setNepaControlGrid((prev) => {
                              const updated = {
                                ...prev,
                                [stId]: {
                                  ...prev[stId],
                                  lightOn: nextStatus,
                                  voltage: nextStatus ? 220 : 0,
                                  megawatt: nextStatus ? 4200 : 0,
                                },
                              };
                              try {
                                localStorage.setItem('naija_life_nepa_grid', JSON.stringify(updated));
                              } catch {}
                              return updated;
                            });
                            try {
                              const headers = await getAuthBearerHeaders();
                              const res = await fetch('/api/nepa/toggle', {
                                method: 'POST',
                                headers,
                                body: JSON.stringify({
                                  stateId: stId,
                                  lightOn: nextStatus,
                                }),
                              });
                              const d = await res.json();
                              if (d.grid) {
                                setNepaControlGrid(d.grid);
                                try {
                                  const bc = new BroadcastChannel('naija_life_nepa');
                                  bc.postMessage({ grid: d.grid });
                                  bc.close();
                                } catch {}
                              }
                            } catch {}
                            onShowToast(`${stData.name} substation switched ${nextStatus ? 'ON (Up NEPA!)' : 'OFF (Light Out)'}`);
                            triggerSound?.(nextStatus ? 'success' : 'alert');
                          }}
                          className={`px-3 py-1 rounded-lg text-[9px] font-mono font-black uppercase cursor-pointer border transition-all ${
                            stData.lightOn
                              ? 'bg-emerald-500 text-black border-emerald-400 hover:bg-emerald-400'
                              : 'bg-rose-600/80 text-white border-rose-500 hover:bg-rose-500'
                          }`}
                        >
                          {stData.lightOn ? 'ON (Cut)' : 'OFF (Restore)'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* =============================================================
              INTERACTIVE 15-TASK WORK SHIFT SESSION WITH 10-15 MIN COUNTDOWN TIMER
              ============================================================= */}
          {activeWorkShift && (
            <div className="absolute inset-0 z-50 bg-neutral-950/98 backdrop-blur-xl flex flex-col p-4 text-left animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
              {/* Shift Header & Side Floating Timer */}
              <div className="flex items-start justify-between pb-3 border-b border-zinc-800 shrink-0 gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center shrink-0">
                    <Briefcase className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-black text-white truncate flex items-center gap-1.5">
                      <span>{activeWorkShift.job?.title || 'Active Shift'}</span>
                      <span className="px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300 text-[8px] font-mono font-bold">
                        {userProfile?.jobRank || 'Apprentice'}
                      </span>
                    </h3>
                    <div className="text-[9px] font-mono text-zinc-400 flex items-center gap-2 mt-0.5">
                      <span>{activeWorkShift.isCanada ? '🇨🇦 Canada Workplace' : '🇳🇬 Nigeria Office'}</span>
                      <span>&bull;</span>
                      <span className="text-emerald-400 font-bold">{activeWorkShift.correctCount} / 15 Optimal</span>
                    </div>
                  </div>
                </div>

                {/* Side Countdown Timer Widget (Small at the side as requested) */}
                <div className="shrink-0 flex flex-col items-end">
                  <div
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border font-mono font-black text-xs transition-all shadow-md ${
                      activeWorkShift.timerSeconds < 120
                        ? 'bg-rose-950/90 border-rose-500 text-rose-300 animate-pulse'
                        : 'bg-black/90 border-amber-500/60 text-amber-300'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
                    <span>
                      {Math.floor(activeWorkShift.timerSeconds / 60)}:
                      {(activeWorkShift.timerSeconds % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                  <span className="text-[8px] font-mono text-zinc-500 mt-0.5 uppercase tracking-wide">
                    Shift Timer
                  </span>
                </div>
              </div>

              {/* Progress Tracker (15 Tasks) */}
              <div className="py-2.5 shrink-0 space-y-1">
                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                  <span className="font-bold text-white">
                    Task {activeWorkShift.currentIndex + 1} of 15
                  </span>
                  <span>
                    {Math.round(((activeWorkShift.currentIndex + (activeWorkShift.selectedOption ? 1 : 0)) / 15) * 100)}% Complete
                  </span>
                </div>
                <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 via-emerald-400 to-emerald-500 transition-all duration-300 rounded-full"
                    style={{
                      width: `${((activeWorkShift.currentIndex + (activeWorkShift.selectedOption ? 1 : 0)) / 15) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Content Area */}
              {activeWorkShift.isComplete || activeWorkShift.timerSeconds <= 0 ? (
                /* Shift Completion & Payroll Settlement Screen */
                <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center p-4 text-center space-y-4 animate-in fade-in duration-200">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-emerald-500/20 border-2 border-emerald-400/80 flex items-center justify-center text-3xl shadow-lg">
                    🏆
                  </div>
                  <div className="space-y-1">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 font-mono text-[9px] font-black uppercase tracking-wider border border-emerald-500/40">
                      Shift Completed
                    </span>
                    <h3 className="text-base font-black text-white">
                      Payroll Settlement & Shift Review
                    </h3>
                    <p className="text-xs text-zinc-400 font-mono">
                      {activeWorkShift.job?.title} &bull; {activeWorkShift.correctCount} / 15 Optimal Workplace Decisions
                    </p>
                  </div>

                  <div className="w-full p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-left space-y-2 font-mono text-xs">
                    <div className="flex justify-between items-center text-zinc-300">
                      <span>Performance Rating:</span>
                      <strong className={activeWorkShift.correctCount >= 10 ? 'text-emerald-400' : 'text-amber-400'}>
                        {activeWorkShift.correctCount >= 13
                          ? 'Elite (Tier A+)'
                          : activeWorkShift.correctCount >= 10
                          ? 'Proficient (Tier B+)'
                          : activeWorkShift.correctCount >= 6
                          ? 'Standard (Tier C)'
                          : 'Probationary'}
                      </strong>
                    </div>
                    <div className="flex justify-between items-center text-zinc-300">
                      <span>Shift Time Remaining:</span>
                      <strong className="text-zinc-200">
                        {Math.floor(activeWorkShift.timerSeconds / 60)}m {activeWorkShift.timerSeconds % 60}s
                      </strong>
                    </div>
                    <div className="flex justify-between items-center text-zinc-300">
                      <span>Career Total Shifts:</span>
                      <strong className="text-white">{(userProfile?.jobShiftsWorked || 0) + 1} shifts</strong>
                    </div>
                    <div className="pt-2 border-t border-zinc-800 flex justify-between items-center font-black">
                      <span className="text-white">Calculated Payout:</span>
                      <span className="text-emerald-400 text-sm">
                        {activeWorkShift.isCanada
                          ? `$${Math.round(
                              ((activeWorkShift.job?.salaryCADWeekly || 1200) / 7) *
                                (1 + (activeWorkShift.correctCount / 15) * 0.4)
                            )} CAD`
                          : formatNaira(
                              Math.round(
                                ((activeWorkShift.job?.salaryNGN || 28000) / 7) *
                                  (1 + (activeWorkShift.correctCount / 15) * 0.35)
                              )
                            )}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleFinalizeShift}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:from-emerald-400 text-black font-black text-xs cursor-pointer shadow-xl transition-all active:scale-95"
                  >
                    💼 Collect Paycheck & Clock Out
                  </button>
                </div>
              ) : (
                /* Interactive Question Screen */
                <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-none flex flex-col justify-between">
                  {(() => {
                    const currentQ = activeWorkShift.questions[activeWorkShift.currentIndex];
                    if (!currentQ) return null;

                    return (
                      <div className="space-y-3">
                        {/* Question Prompt Callout */}
                        <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1">
                              <span>🏢</span>
                              <span>Workplace Dilemma #{activeWorkShift.currentIndex + 1}</span>
                            </span>
                            <span className="text-[9px] font-mono text-zinc-500">
                              Options A &ndash; E
                            </span>
                          </div>
                          <p className="text-xs font-bold text-white leading-relaxed">
                            &ldquo;{currentQ.scenario}&rdquo;
                          </p>
                        </div>

                        {/* Options A to E */}
                        <div className="space-y-2">
                          {currentQ.options.map((opt) => {
                            const isChosen = activeWorkShift.selectedOption?.letter === opt.letter;
                            const hasAnswered = !!activeWorkShift.selectedOption;

                            let btnStyle = 'bg-zinc-900/70 border-zinc-800 text-zinc-200 hover:border-zinc-700 hover:bg-zinc-800/80';
                            if (hasAnswered) {
                              if (isChosen) {
                                btnStyle = opt.isOptimal
                                  ? 'bg-emerald-950/90 border-emerald-500 text-emerald-200 font-bold shadow-lg shadow-emerald-950/40'
                                  : 'bg-rose-950/90 border-rose-500 text-rose-200 font-bold shadow-lg shadow-rose-950/40';
                              } else if (opt.isOptimal) {
                                btnStyle = 'bg-emerald-950/40 border-emerald-500/70 text-emerald-300 font-bold';
                              } else {
                                btnStyle = 'bg-zinc-950/50 border-zinc-900 text-zinc-500 opacity-60';
                              }
                            }

                            return (
                              <button
                                key={opt.letter}
                                type="button"
                                disabled={hasAnswered}
                                onClick={() => {
                                  if (hasAnswered) return;
                                  setActiveWorkShift((prev) => {
                                    if (!prev) return prev;
                                    return {
                                      ...prev,
                                      selectedOption: opt,
                                      correctCount: opt.isOptimal ? prev.correctCount + 1 : prev.correctCount,
                                      answers: [...prev.answers, opt.scoreDelta],
                                    };
                                  });
                                  if (opt.isOptimal) {
                                    triggerSound?.('success');
                                  } else {
                                    triggerSound?.('alert');
                                  }
                                }}
                                className={`w-full p-2.5 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer text-xs leading-snug ${btnStyle}`}
                              >
                                <span
                                  className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono font-black text-[11px] shrink-0 border ${
                                    isChosen
                                      ? opt.isOptimal
                                        ? 'bg-emerald-500 text-black border-emerald-400'
                                        : 'bg-rose-500 text-white border-rose-400'
                                      : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                                  }`}
                                >
                                  {opt.letter}
                                </span>
                                <span className="flex-1 mt-0.5">{opt.text}</span>
                                {hasAnswered && opt.isOptimal && (
                                  <span className="shrink-0 text-emerald-400 text-sm">✓</span>
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {/* Tactical Feedback Card */}
                        {activeWorkShift.selectedOption && (
                          <div
                            className={`p-3 rounded-xl border space-y-1 animate-in fade-in duration-150 ${
                              activeWorkShift.selectedOption.isOptimal
                                ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
                                : 'bg-amber-950/60 border-amber-500/50 text-amber-200'
                            }`}
                          >
                            <div className="flex items-center justify-between text-[10px] font-mono font-bold">
                              <span>
                                {activeWorkShift.selectedOption.isOptimal
                                  ? '🌟 Optimal Tactical Response'
                                  : '⚠️ Sub-optimal Decision'}
                              </span>
                              <span>+{activeWorkShift.selectedOption.scoreDelta} PTS</span>
                            </div>
                            <p className="text-[11px] leading-relaxed">
                              {activeWorkShift.selectedOption.feedback}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Action Button Bar */}
                  <div className="pt-2 border-t border-zinc-800 shrink-0 space-y-2">
                    {activeWorkShift.selectedOption ? (
                      activeWorkShift.currentIndex < 14 ? (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveWorkShift((prev) => {
                              if (!prev) return prev;
                              return {
                                ...prev,
                                currentIndex: prev.currentIndex + 1,
                                selectedOption: null,
                              };
                            });
                          }}
                          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 text-black font-black text-xs cursor-pointer shadow-lg transition-all active:scale-95 flex items-center justify-center gap-1.5"
                        >
                          <span>Proceed to Task {activeWorkShift.currentIndex + 2} of 15</span>
                          <span>&rarr;</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveWorkShift((prev) => (prev ? { ...prev, isComplete: true } : null));
                          }}
                          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:from-emerald-400 text-black font-black text-xs cursor-pointer shadow-lg transition-all active:scale-95 flex items-center justify-center gap-1.5"
                        >
                          <span>Complete Shift & Calculate Settlement</span>
                          <span>&rarr;</span>
                        </button>
                      )
                    ) : (
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-zinc-500">
                          Select option A &ndash; E to respond
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            handleFinalizeShift();
                          }}
                          className="text-[10px] font-mono text-zinc-500 hover:text-rose-400 underline cursor-pointer"
                        >
                          Emergency Clock Out
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =============================================================
              ACADEMY ACTIVE LESSON MODAL (NOTES + 10-15 QUESTIONS + PACING)
              ============================================================= */}
          {activeCourseId && (() => {
            const allCourses = [
              ...CANADA_COURSES.map((c) => ({ ...c, isCanada: true, fee: c.feeCAD })),
              ...EXPANDED_COURSES.map((c) => ({ ...c, isCanada: false })),
            ];
            const course = allCourses.find((c) => c.id === activeCourseId) || {
              id: activeCourseId,
              title: 'Professional Studies',
              institution: 'National Academy',
              isCanada: false,
              fee: 50000,
            };
            const totalL = getCourseTotalLessons(course.id, course.title);
            const dailyCap = getCourseDailyCap(totalL);
            const progress = courseProgressMap[activeCourseId] || {
              courseId: course.id,
              title: course.title,
              institution: course.institution,
              isCanada: course.isCanada,
              fee: course.fee,
              graduationFee: course.fee * 2,
              totalLessons: totalL,
              dailyCap,
              completedLessons: 0,
              currentLesson: 1,
              lessonsDoneToday: 0,
              lastLessonDate: new Date().toLocaleDateString('en-CA'),
              isGraduated: false,
              certificateCode: `DEG-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
              certificateName: `${course.title} Degree`,
            };

            const lessonsList = getCourseLessons(course.id, course.title, totalL);
            const lessonNum = Math.min(totalL, (progress.completedLessons || 0) + 1);
            const currentLesson = lessonsList[lessonNum - 1] || lessonsList[0];
            const questions = currentLesson.quizQuestions || [];
            const currentQ = questions[currentQuizQuestionIndex] || questions[0];
            const todayStr = new Date().toLocaleDateString('en-CA');

            return (
              <div className="absolute inset-0 z-50 bg-zinc-950/98 backdrop-blur-md flex flex-col p-4 text-white animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2 py-0.5 rounded-full bg-purple-950/80 border border-purple-500/40 text-purple-300 font-mono text-[9px] font-black uppercase tracking-wider">
                        Lesson {lessonNum} of {totalL}
                      </span>
                      <span className="text-[10px] text-zinc-400 font-mono">
                        {dailyCap} max/day · {questions.length} Questions
                      </span>
                    </div>
                    <h3 className="text-xs font-black text-white truncate max-w-[240px]">
                      {course.title}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveCourseId(null);
                      setSelectedQuizChoice(null);
                      setQuizAnswerSubmitted(false);
                      setLastQuizResult(null);
                    }}
                    className="w-7 h-7 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer font-bold text-xs"
                    title="Close"
                  >
                    ✕
                  </button>
                </div>

                {/* Sub-header Navigation / Tabs */}
                <div className="flex items-center gap-2 py-2 border-b border-zinc-900 text-[10px] font-mono">
                  <span className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 ${
                    activeLessonStep === 'reading' ? 'bg-purple-600 text-white' : 'bg-zinc-900 text-zinc-400'
                  }`}>
                    <span>📖</span>
                    <span>1. Class Note</span>
                  </span>
                  <span className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 ${
                    activeLessonStep === 'quiz' ? 'bg-purple-600 text-white' : 'bg-zinc-900 text-zinc-400'
                  }`}>
                    <span>✍️</span>
                    <span>2. Assessment ({questions.length} Qs)</span>
                  </span>
                  <span className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 ${
                    activeLessonStep === 'result' ? 'bg-purple-600 text-white' : 'bg-zinc-900 text-zinc-400'
                  }`}>
                    <span>🎓</span>
                    <span>3. Result</span>
                  </span>
                </div>

                {/* Body Content based on Step */}
                <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1 scrollbar-thin">
                  {/* STEP 1: CLASS NOTE */}
                  {activeLessonStep === 'reading' && (
                    <div className="space-y-3 animate-in fade-in duration-200">
                      <div className="p-3 rounded-2xl bg-purple-950/50 border border-purple-500/30 space-y-1">
                        <div className="text-[10px] text-purple-300 font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                          <span>🏛️</span>
                          <span>{course.institution}</span>
                        </div>
                        <h4 className="text-sm font-black text-white">
                          Lesson {currentLesson.lessonNumber}: {currentLesson.title}
                        </h4>
                        <p className="text-[10px] text-zinc-400 leading-relaxed">
                          Read and study the following lecture notes thoroughly. Once finished scrolling, click continue below to answer the mandatory {questions.length} assessment questions.
                        </p>
                      </div>

                      {/* Rich Scrollable Lecture Note */}
                      <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-3 text-xs leading-relaxed font-sans text-zinc-200">
                        {currentLesson.lectureNotes.split('\n\n').map((paragraph, idx) => {
                          if (paragraph.startsWith('### ')) {
                            return (
                              <h5 key={idx} className="text-xs font-black text-amber-300 pt-2 border-t border-zinc-800 flex items-center gap-1.5">
                                <span>📌</span>
                                <span>{paragraph.replace('### ', '')}</span>
                              </h5>
                            );
                          }
                          if (paragraph.startsWith('## ')) {
                            return (
                              <h5 key={idx} className="text-sm font-black text-purple-300 pt-1">
                                {paragraph.replace('## ', '')}
                              </h5>
                            );
                          }
                          return (
                            <p key={idx} className="text-[11px] text-zinc-300 leading-relaxed">
                              {paragraph}
                            </p>
                          );
                        })}
                      </div>

                      {/* Continue to Questions Button */}
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveLessonStep('quiz');
                            setCurrentQuizQuestionIndex(0);
                            setSelectedQuizAnswers({});
                            setSelectedQuizChoice(null);
                            setQuizAnswerSubmitted(false);
                            setLastQuizResult(null);
                          }}
                          className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 text-white font-black text-xs cursor-pointer shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                          <span>✓ I Have Studied the Note</span>
                          <span>&bull;</span>
                          <span>Continue to {questions.length} Questions &rarr;</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 2: 10-15 QUESTIONS ASSESSMENT */}
                  {activeLessonStep === 'quiz' && currentQ && (
                    <div className="space-y-3 animate-in fade-in duration-200">
                      {/* Stepper info */}
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="text-purple-300 font-bold">
                          Question {currentQuizQuestionIndex + 1} of {questions.length}
                        </span>
                        <span className="text-zinc-500">
                          Passing Grade: 70%
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-300 rounded-full"
                          style={{
                            width: `${((currentQuizQuestionIndex + (quizAnswerSubmitted ? 1 : 0)) / questions.length) * 100}%`,
                          }}
                        />
                      </div>

                      {/* Question card */}
                      <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-2">
                        <div className="text-[9px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                          Theoretical & Practical Examination
                        </div>
                        <p className="text-xs font-bold text-white leading-relaxed">
                          {currentQ.question}
                        </p>
                      </div>

                      {/* Options */}
                      <div className="space-y-2">
                        {currentQ.options.map((option, optIdx) => {
                          const isSelected = selectedQuizChoice === optIdx;
                          const isCorrect = currentQ.correctAnswerIndex === optIdx;
                          let btnStyle = 'bg-zinc-900/80 hover:bg-zinc-800/80 text-zinc-300 border-zinc-800';

                          if (quizAnswerSubmitted) {
                            if (isCorrect) {
                              btnStyle = 'bg-emerald-950/80 text-emerald-200 border-emerald-500 font-bold shadow-md';
                            } else if (isSelected && !isCorrect) {
                              btnStyle = 'bg-rose-950/80 text-rose-200 border-rose-500 font-bold';
                            } else {
                              btnStyle = 'opacity-40 bg-zinc-950 border-zinc-900 text-zinc-500';
                            }
                          } else if (isSelected) {
                            btnStyle = 'bg-purple-950/80 text-white border-purple-500 shadow-md ring-1 ring-purple-400';
                          }

                          return (
                            <button
                              key={optIdx}
                              type="button"
                              disabled={quizAnswerSubmitted}
                              onClick={() => setSelectedQuizChoice(optIdx)}
                              className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer flex items-start gap-2.5 ${btnStyle}`}
                            >
                              <span className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] font-mono shrink-0 font-bold">
                                {String.fromCharCode(65 + optIdx)}
                              </span>
                              <span className="leading-snug">{option}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Explanation Callout once submitted */}
                      {quizAnswerSubmitted && (
                        <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-1 animate-in fade-in duration-150">
                          <div className="text-[10px] font-mono font-bold flex items-center gap-1.5 text-zinc-300">
                            {selectedQuizChoice === currentQ.correctAnswerIndex ? (
                              <span className="text-emerald-400">✓ Correct!</span>
                            ) : (
                              <span className="text-rose-400">✗ Incorrect.</span>
                            )}
                            <span className="text-zinc-500">&bull; Lecture Note Excerpt</span>
                          </div>
                          <p className="text-[11px] text-zinc-300 leading-relaxed">
                            {currentQ.explanation}
                          </p>
                        </div>
                      )}

                      {/* Quiz Buttons */}
                      <div className="pt-2">
                        {!quizAnswerSubmitted ? (
                          <button
                            type="button"
                            disabled={selectedQuizChoice === null}
                            onClick={() => {
                              if (selectedQuizChoice === null) return;
                              setQuizAnswerSubmitted(true);
                              setSelectedQuizAnswers((prev) => ({
                                ...prev,
                                [currentQuizQuestionIndex]: selectedQuizChoice,
                              }));
                            }}
                            className={`w-full py-2.5 rounded-xl font-black text-xs cursor-pointer shadow transition-all ${
                              selectedQuizChoice !== null
                                ? 'bg-purple-600 hover:bg-purple-500 text-white'
                                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                            }`}
                          >
                            Submit Answer
                          </button>
                        ) : currentQuizQuestionIndex + 1 < questions.length ? (
                          <button
                            type="button"
                            onClick={() => {
                              setCurrentQuizQuestionIndex((prev) => prev + 1);
                              setSelectedQuizChoice(null);
                              setQuizAnswerSubmitted(false);
                            }}
                            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white font-black text-xs cursor-pointer shadow transition-all flex items-center justify-center gap-1"
                          >
                            <span>Next Question</span>
                            <span>&rarr;</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              // Compute score
                              const finalAnswers = {
                                ...selectedQuizAnswers,
                                [currentQuizQuestionIndex]: selectedQuizChoice ?? 0,
                              };
                              let correct = 0;
                              questions.forEach((q, idx) => {
                                if (finalAnswers[idx] === q.correctAnswerIndex) {
                                  correct++;
                                }
                              });
                              const score = Math.round((correct / questions.length) * 100);
                              const passed = score >= 70;
                              setLastQuizResult({
                                score,
                                gpa: passed ? 4.0 : 1.5,
                                passed,
                              });

                              if (passed) {
                                const newCompleted = Math.max(progress.completedLessons || 0, lessonNum);
                                const isNewDay = progress.lastLessonDate !== todayStr;
                                const todayCount = (isNewDay ? 0 : (progress.lessonsDoneToday || 0)) + 1;
                                const updatedMap = {
                                  ...courseProgressMap,
                                  [activeCourseId]: {
                                    ...progress,
                                    completedLessons: newCompleted,
                                    currentLesson: Math.min(totalL, newCompleted + 1),
                                    lessonsDoneToday: todayCount,
                                    lastLessonDate: todayStr,
                                  },
                                };
                                saveCourseProgress(updatedMap);
                                triggerSound?.('success');
                              } else {
                                triggerSound?.('alert');
                              }

                              setActiveLessonStep('result');
                            }}
                            className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-black font-black text-xs cursor-pointer shadow-xl transition-all"
                          >
                            🏆 Complete Assessment & Grade Lesson
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* STEP 3: RESULT SCREEN */}
                  {activeLessonStep === 'result' && lastQuizResult && (
                    <div className="flex-1 flex flex-col items-center justify-center p-4 text-center space-y-4 animate-in fade-in duration-200">
                      <div className={`w-16 h-16 rounded-2xl border-2 flex items-center justify-center text-3xl shadow-lg ${
                        lastQuizResult.passed
                          ? 'bg-emerald-500/20 border-emerald-400 text-emerald-400'
                          : 'bg-rose-500/20 border-rose-400 text-rose-400'
                      }`}>
                        {lastQuizResult.passed ? '🎓' : '📚'}
                      </div>

                      <div className="space-y-1">
                        <span className={`px-2.5 py-0.5 rounded-full font-mono text-[9px] font-black uppercase tracking-wider border ${
                          lastQuizResult.passed
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                            : 'bg-rose-950 text-rose-300 border-rose-500/40'
                        }`}>
                          {lastQuizResult.passed ? 'Lesson Passed' : 'Assessment Failed'}
                        </span>
                        <h3 className="text-base font-black text-white">
                          Score: {lastQuizResult.score}% (Pass: 70%)
                        </h3>
                        <p className="text-xs text-zinc-400 font-mono">
                          Lesson {lessonNum} of {totalL} &bull; {course.title}
                        </p>
                      </div>

                      <div className="w-full p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-left space-y-2 font-mono text-xs">
                        <div className="flex justify-between items-center text-zinc-300">
                          <span>Academic Status:</span>
                          <strong className={lastQuizResult.passed ? 'text-emerald-400' : 'text-rose-400'}>
                            {lastQuizResult.passed ? 'Credit Earned (Grade A)' : 'Revision Required'}
                          </strong>
                        </div>
                        <div className="flex justify-between items-center text-zinc-300">
                          <span>Total Completed:</span>
                          <strong className="text-white">
                            {Math.min(totalL, (progress.completedLessons || 0) + (lastQuizResult.passed ? 1 : 0))} / {totalL} Lessons
                          </strong>
                        </div>
                        <div className="flex justify-between items-center text-zinc-300">
                          <span>Daily Lessons Today:</span>
                          <strong className="text-zinc-200">
                            {lastQuizResult.passed ? Math.min(dailyCap, (progress.lessonsDoneToday || 0) + 1) : progress.lessonsDoneToday || 0} / {dailyCap}
                          </strong>
                        </div>
                      </div>

                      {lastQuizResult.passed ? (
                        <div className="w-full space-y-2">
                          {(progress.completedLessons || 0) + 1 >= totalL ? (
                            <div className="p-3 rounded-xl bg-amber-950/80 border border-amber-500/40 text-[11px] text-amber-200 font-sans">
                              🎉 <strong>All {totalL} Lessons Completed!</strong> You are now eligible to graduate! Return to the Academy to pay your graduation fee and receive your official degree.
                            </div>
                          ) : null}

                          <button
                            type="button"
                            onClick={() => {
                              setActiveCourseId(null);
                              setSelectedQuizChoice(null);
                              setQuizAnswerSubmitted(false);
                              setLastQuizResult(null);
                            }}
                            className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white font-black text-xs cursor-pointer shadow-xl transition-all"
                          >
                            Return to Academy & Complete Next Steps &rarr;
                          </button>
                        </div>
                      ) : (
                        <div className="w-full space-y-2">
                          <p className="text-[11px] text-zinc-400">
                            You must score at least 70% to pass this lesson. Re-read the syllabus notes and retake the quiz.
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveLessonStep('reading');
                              setSelectedQuizChoice(null);
                              setQuizAnswerSubmitted(false);
                              setLastQuizResult(null);
                            }}
                            className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs cursor-pointer shadow transition-all"
                          >
                            📖 Review Lecture Notes & Retake Quiz
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* =============================================================
              CANADA INTERSTATE BUS JOKE MODAL ("shey you be mumu, you wan use bus go canada, ole, gerrout jorr😂")
              ============================================================= */}
          {phoneCanadaBusJokeOpen && (
            <div className="absolute inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in-95 duration-200">
              <div className="w-20 h-20 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-4xl mx-auto shadow-inner mb-4 animate-bounce">
                😂
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[9px] font-black uppercase tracking-wider border border-amber-500/40 mb-2">
                NAIJA LIFE ROAD TRANSIT AUTHORITY 🇳🇬
              </span>
              <h3 className="text-base font-black text-white leading-snug px-2">
                &quot;shey you be mumu, you wan use bus go canada, ole, gerrout jorr😂&quot;
              </h3>
              <p className="text-xs text-zinc-300 leading-relaxed font-sans mt-3 bg-zinc-900/80 p-3.5 rounded-2xl border border-zinc-800 text-left">
                Oga who wan drive yellow Danfo or GIGM interstate bus cross Atlantic Ocean to Toronto? Water go drown you o! Transatlantic travel to Canada is strictly commercial flight or private jet.
              </p>
              <button
                type="button"
                onClick={() => setPhoneCanadaBusJokeOpen(false)}
                className="w-full mt-5 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 text-black font-black text-xs cursor-pointer shadow-xl transition-all active:scale-95"
              >
                Oya I hear you, gerrout! (Close)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
