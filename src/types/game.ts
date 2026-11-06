/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type SocialClass = 'lapo' | 'mapo' | 'nepo';

export interface CharacterAvatar {
  gender: 'male' | 'female' | 'unisex';
  skinTone: string;
  hairstyle: 'afro' | 'fade' | 'braids' | 'dreads' | 'gele' | 'buzz' | 'waves' | 'locs' | 'cornrows';
  hairColor: string;
  outfit: 'ankara' | 'agbada' | 'streetwear' | 'corporate' | 'casual' | 'trad_senator' | 'designer';
  pants?: 'jeans' | 'sweatpants' | 'slacks' | 'wrapper' | 'shorts';
  pantsColor?: string;
  shoes?: 'sneakers' | 'loafers' | 'sandals' | 'boots' | 'heels';
  shoesColor?: string;
  accessory: 'none' | 'sunglasses' | 'gold_chain' | 'fila_cap' | 'designer_shades' | 'coral_beads' | 'rolex_watch' | 'diamond_chain';
}

export interface UserDocument {
  id: string;
  type: 'passport' | 'visa' | 'study_permit' | 'work_permit' | 'pr_card' | 'citizenship' | 'police_clearance' | 'medical_exam' | 'yellow_card' | 'nin_slip';
  title: string;
  country: 'Canada' | 'General' | 'Nigeria';
  documentNumber: string;
  issueDate: string;
  expiryDate?: string;
  expiresAtTimestamp?: number;
  validityWeeks?: number;
  isExpired?: boolean;
  status: 'Active' | 'Valid' | 'Permanent' | 'Expired';
  desc: string;
  costNGN?: number;
  costCAD?: number;
  institution?: string;
  visaType?: string;
}

export interface BankReceipt {
  id: string;
  title: string;
  category: 'flight' | 'supermarket' | 'market' | 'property' | 'car' | 'luxury' | 'medical' | 'education' | 'general' | 'transfer' | 'immigration' | 'starter' | 'business' | 'career' | 'lifestyle';
  amount: number;
  date: string;
  type: 'debit' | 'credit';
  currency?: 'NGN' | 'CAD';
  recipientOrSender?: string;
  referenceNo?: string;
}

export interface BankAlert {
  id: string;
  text: string;
  amount: number;
  date: string;
  type: 'credit' | 'debit';
  senderOrRecipient: string;
}

export interface UserProfile {
  username: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string; // Real life DOB as requested
  createdAt: string;
  avatar: CharacterAvatar;
  spawnStateId: string; // Fixed birthplace/spawn state
  lastLocationStateId?: string; // Current state/country where user left off
  socialClass: SocialClass;
  phoneModel: string;
  cashNaira: number;
  bankNaira: number;
  loanBalanceNGN: number;
  savingsBalanceNGN: number;
  cashUSD: number;
  cashGBP?: number;
  cashEUR?: number;
  bankCAD?: number;
  savingsCAD?: number;
  currentCountry?: 'nigeria' | 'canada';
  ownedDocuments?: UserDocument[];
  energy: number;
  hunger: number;
  health: number; // maintained for internal wellness logic, not shown on HUD
  happiness: number;
  inventory: string[];
  fatherRentSubsidyPct: number; // 0 for Lapo, 35 for Mapo, 100 for Nepo
  completedCourses: string[];
  activeJobId?: string;
  jobTitle?: string;
  jobLevel?: number;
  jobRank?: string;
  jobShiftsWorked?: number;
  jobWeeklySalaryNGN?: number;
  jobAutoAttend?: boolean;
  furnitureBought: string[];
  receipts: BankReceipt[];
  alerts: BankAlert[];
  savedNotes?: string[];
  phoneWallpaper?: string;
  ownedBusinesses?: BusinessVenture[];
  snapUsername?: string;
  isSnapPlus?: boolean;
}

export interface BusinessVenture {
  id: string;
  name: string;
  typeId: string;
  typeName: string;
  registeredDate: string;
  level: number;
  dailyRevenueNGN: number;
  lastCollectedDate?: string;
}

export type POIType =
  | 'market'
  | 'supermarket'
  | 'school'
  | 'university'
  | 'hospital'
  | 'hotel'
  | 'airport'
  | 'bank'
  | 'police'
  | 'club'
  | 'eatery'
  | 'restaurant'
  | 'church'
  | 'mosque'
  | 'gym'
  | 'betting'
  | 'mechanic'
  | 'gov'
  | 'court'
  | 'stadium'
  | 'zoo'
  | 'golf'
  | 'lake'
  | 'mall'
  | 'boutique'
  | 'dealership'
  | 'techhub'
  | 'home';

export interface LocationPOI {
  id: string;
  name: string;
  type: POIType;
  tagLabel: string;
  x: number; // Percentage X (0 - 100) on isometric grid
  y: number; // Percentage Y (0 - 100) on isometric grid
  desc: string;
  buildingIcon?: string;
  comingSoon?: boolean;
  floorsCount?: number;
  actions?: {
    label: string;
    cost?: number;
    earn?: number;
    energyEffect?: number;
    hungerEffect?: number;
    healthEffect?: number;
    happinessEffect?: number;
  }[];
}

export interface PropertyAsset {
  id: string;
  title: string;
  type: 'self_contain' | 'flat' | 'duplex' | 'mansion' | 'villa';
  stateId: string;
  neighborhood: string;
  annualRent: number;
  buyPrice: number;
  icon: string;
  desc: string;
  roomsCount: number;
  floorsCount: number;
  isOwned?: boolean;
  isRented?: boolean;
  isRentedOut?: boolean;
  rentalIncomeDaily?: number;
  x: number;
  y: number;
}

export interface VehicleAsset {
  id: string;
  name: string;
  type: 'bike' | 'keke' | 'sedan' | 'luxury_sedan' | 'suv' | 'hyper_luxury' | 'supercar';
  price: number;
  speed: string;
  prestige: number;
  icon: string;
  desc: string;
  isOwned?: boolean;
}

export interface InvestmentAsset {
  id: string;
  title: string;
  category: 'tbills' | 'stocks' | 'agro' | 'reits' | 'crypto' | 'vc';
  minDeposit: number;
  annualYieldPct: number;
  risk: 'Low (Guaranteed)' | 'Moderate' | 'High';
  investedAmount: number;
  earnedReturns: number;
  desc: string;
}

export type TransportMode = 'leg' | 'keke' | 'danfo' | 'taxi' | 'car';

export interface StateData {
  id: string;
  name: string;
  capital: string;
  zone: string;
  slogan: string;
  locations: LocationPOI[];
  delicacy: {
    name: string;
    cost: number;
    hunger: number;
    joy: number;
  };
}

export interface FurnitureItem {
  id: string;
  name: string;
  category: 'kitchen' | 'bathroom' | 'room' | 'living_room' | 'comfort' | 'luxury';
  priceNGN: number;
  icon: string;
  desc: string;
  statBonus?: {
    energy?: number;
    hunger?: number;
    happiness?: number;
  };
}
