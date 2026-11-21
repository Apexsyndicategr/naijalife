/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type SocialClass = 'lapo' | 'mapo' | 'nepo';

export interface CharacterAvatar {
  gender: 'male' | 'female' | 'unisex';
  skinTone: string;
  bodyBuild?: 'slim' | 'average' | 'athletic' | 'broad';
  faceShape?: 'oval' | 'square' | 'heart' | 'round';
  eyeStyle?: 'classic' | 'almond' | 'sharp' | 'bright';
  eyebrowStyle?: 'natural' | 'arched' | 'thick' | 'sleek';
  noseStyle?: 'balanced' | 'sculpted' | 'broad' | 'button';
  mouthStyle?: 'neutral' | 'smile' | 'confident' | 'full';
  hairstyle:
    | 'afro'
    | 'fade'
    | 'braids'
    | 'dreads'
    | 'gele'
    | 'buzz'
    | 'waves'
    | 'locs'
    | 'cornrows'
    | 'peaky_cap'
    | 'high_top'
    | 'afro_puff'
    | 'ponytail'
    | 'bob_cut'
    | 'long_wavy'
    | 'fulani_braids';
  hairColor: string;
  outfit:
    | 'ankara'
    | 'agbada'
    | 'streetwear'
    | 'corporate'
    | 'casual'
    | 'trad_senator'
    | 'designer'
    | 'peaky_dapper'
    | 'sporty_fit'
    | 'female_sundress'
    | 'female_casual'
    | 'female_corporate'
    | 'female_sporty'
    | 'female_gala'
    | 'streetwear_luxe'
    | 'beach_shorts';
  outfitColor?: string;
  pants?: 'jeans' | 'sweatpants' | 'slacks' | 'wrapper' | 'shorts' | 'pinstripe';
  pantsColor?: string;
  shoes?: 'sneakers' | 'loafers' | 'sandals' | 'boots' | 'heels' | 'oxford';
  shoesColor?: string;
  accessory:
    | 'none'
    | 'sunglasses'
    | 'gold_chain'
    | 'fila_cap'
    | 'designer_shades'
    | 'coral_beads'
    | 'rolex_watch'
    | 'diamond_chain'
    | 'peaky_cap'
    | 'red_tie';
  height?: 'short' | 'average' | 'tall' | 'towering';
}

export interface PlacedFurnitureItem {
  instanceId: string;
  furnitureId: string;
  name: string;
  category: 'kitchen' | 'bathroom' | 'room' | 'living_room' | 'comfort' | 'luxury';
  x: number;
  z: number;
  rotationY: number;
}

export interface HouseLayoutData {
  propertyId: string;
  wallTheme: 'cream' | 'sage' | 'charcoal' | 'terracotta' | 'ivory';
  floorTheme: 'oak' | 'marble' | 'slate' | 'terrazzo';
  lightsOn: boolean;
  placedFurniture: PlacedFurnitureItem[];
  updatedAt?: string;
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
  uid?: string;
  username: string;
  citizenName?: string;
  walletAccountNumber?: string;
  role?: 'citizen' | 'owner';
  accountStatus?: 'active' | 'suspended';
  isOwner?: boolean;
  isOwnerAccount?: boolean;
  isVerified?: boolean;
  gmail?: string;
  email?: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string; // Real life DOB as requested
  createdAt: string;
  avatar: CharacterAvatar;
  spawnStateId: string; // Fixed birthplace/spawn state
  lastLocationStateId?: string; // Current state/country where user left off
  migratedToNigeriaOriginalStateV1?: boolean;
  immigrationStatus?: 'NIGERIA_RESIDENT' | 'CANADA_VISA_APPROVED' | 'CANADA_RESIDENT';
  travelHistory?: string[];
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
  currentCountry?: 'nigeria' | 'canada' | string;
  ownedDocuments?: UserDocument[];
  energy: number;
  hunger: number;
  thirst?: number;
  health: number;
  happiness: number;
  inventory: string[];
  ownedClothing?: string[];
  ownedHairstyles?: string[];
  houseLayouts?: Record<string, HouseLayoutData>;
  storedItems?: string[];
  fatherRentSubsidyPct: number; // 0 for Lapo, 35 for Mapo, 100 for Nepo
  completedCourses: string[];
  academyProgress?: Record<string, any>;
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
  | 'salon'
  | 'dealership'
  | 'techhub'
  | 'office'
  | 'warehouse'
  | 'factory'
  | 'petrol_station'
  | 'bungalow'
  | 'detached_house'
  | 'semi_detached'
  | 'duplex'
  | 'mansion'
  | 'apartment'
  | 'estate'
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
    thirstEffect?: number;
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
