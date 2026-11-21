/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const ECONOMY_CONFIG = {
  cadToNgnRate: 960.54,
  ngnToCadSpread: 0.992,
  canadaVisaFeeNGN: 2500000, // Configurable Canada Visa Application Fee (₦2,500,000)
  nigerianPassportFeeNGN: 85000,
  hospitalHealFeeNGN: 18500,
  clinicCheckupFeeNGN: 6500,
  gymSessionFeeNGN: 5000,
  hotelNightFeeNGN: 45000,
  commuteFares: {
    trek: 0,
    keke: 300,
    danfo: 600,
    bolt: 2500,
    car: 1200,
    home: 0,
  },
  minFoodThirstGain: 8,
  defaultDrinkThirstGain: 48,
  vitalsDecayPerTick: {
    hunger: 0.45,
    thirst: 0.72,
    energy: 0.3,
  },
} as const;

export interface SalonHairstyleCatalogItem {
  id: string;
  name: string;
  gender: 'male' | 'female' | 'unisex';
  priceNGN: number;
  isStarter: boolean;
  desc: string;
}

export interface ClothingCatalogItem {
  id: string;
  outfitKey: string;
  name: string;
  category:
    | 'shirts'
    | 'tshirts'
    | 'trousers'
    | 'jeans'
    | 'shorts'
    | 'dresses'
    | 'skirts'
    | 'jackets'
    | 'traditional'
    | 'corporate'
    | 'shoes'
    | 'accessories';
  gender: 'male' | 'female' | 'unisex';
  priceNGN: number;
  isStarter: boolean;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  pantsStyle?: string;
  shoesStyle?: string;
  desc: string;
}

// Curated Male & Female 3D Hairstyles (separate sets + unisex salon styles)
export const SALON_HAIRSTYLES_CATALOG: SalonHairstyleCatalogItem[] = [
  // Male Starter & Salon Hairstyles
  { id: 'fade', name: 'Low Taper Fade', gender: 'male', priceNGN: 0, isStarter: true, desc: 'Clean sculpted taper fade along sides and nape.' },
  { id: 'waves', name: '360 Deep Waves', gender: 'male', priceNGN: 0, isStarter: true, desc: 'Sharp brushed 360 wave crown.' },
  { id: 'buzz', name: 'Clean Skin Buzz', gender: 'male', priceNGN: 0, isStarter: true, desc: 'Crisp minimalist cropped buzz cut.' },
  { id: 'high_top', name: 'High-Top Fade', gender: 'male', priceNGN: 15000, isStarter: false, desc: 'Elevated geometric box-top crown with sharp temples.' },
  { id: 'afro', name: 'Classic Textured Afro', gender: 'male', priceNGN: 0, isStarter: true, desc: 'Full rounded natural curl crown.' },
  { id: 'cornrows', name: 'Pop Smoke Stitch Cornrows', gender: 'male', priceNGN: 22000, isStarter: false, desc: 'Back-swept sculpted cornrow channels.' },
  { id: 'dreads', name: 'Lagos Street Locs', gender: 'male', priceNGN: 32000, isStarter: false, desc: 'Structured textured dreadlock tendrils framing the brow.' },
  { id: 'peaky_cap', name: 'Shelby Newsboy Flat Cap', gender: 'male', priceNGN: 45000, isStarter: false, desc: 'Tailored wool tweed flat cap over sharp fade.' },

  // Female Starter & Salon Hairstyles
  { id: 'braids', name: 'Knotless Box Braids', gender: 'female', priceNGN: 0, isStarter: true, desc: 'Shoulder-draped parted box braids with neat edges.' },
  { id: 'afro_puff', name: 'Curly Afro Puff', gender: 'female', priceNGN: 0, isStarter: true, desc: 'Voluminous high curly crown gathered in a silk band.' },
  { id: 'ponytail', name: 'Sleek Silk Ponytail', gender: 'female', priceNGN: 0, isStarter: true, desc: 'Glossy high ponytail cascading smoothly past the shoulders.' },
  { id: 'bob_cut', name: 'Chic Jawline Bob', gender: 'female', priceNGN: 0, isStarter: true, desc: 'Tailored sleek bob framing cheekbones and jawline.' },
  { id: 'long_wavy', name: 'Wavy Goddess Curls', gender: 'female', priceNGN: 28000, isStarter: false, desc: 'Layered flowing waves with subtle volume.' },
  { id: 'fulani_braids', name: 'Fulani Beaded Braids', gender: 'female', priceNGN: 35000, isStarter: false, desc: 'Center-parted sculpted braids adorned with golden beads.' },
  { id: 'locs', name: 'Fine Goddess Sisterlocks', gender: 'female', priceNGN: 38000, isStarter: false, desc: 'Delicate cascading locs with golden cuff accents.' },
  { id: 'gele', name: 'Royal Damask Gele', gender: 'female', priceNGN: 55000, isStarter: false, desc: 'Layered fan-pleated traditional Nigerian ceremonial headwrap.' },
];

// Starter (₦0) + Boutique Unlockable 3D Outfits
export const CLOTHING_SHOP_CATALOG: ClothingCatalogItem[] = [
  // 5 Distinct MALE Starter Outfits
  {
    id: 'outfit_m_tweed_vest',
    outfitKey: 'peaky_dapper',
    name: 'Emerald Waistcoat & White Shirt',
    category: 'corporate',
    gender: 'male',
    priceNGN: 0,
    isStarter: true,
    primaryColor: '#064e3b',
    secondaryColor: '#f8fafc',
    accentColor: '#d97706',
    pantsStyle: 'pinstripe',
    shoesStyle: 'oxford',
    desc: 'Crisp tailored vest over white dress shirt with slim trousers.',
  },
  {
    id: 'outfit_m_white_tee_jeans',
    outfitKey: 'streetwear',
    name: 'Clean White Tee & Indigo Jeans',
    category: 'tshirts',
    gender: 'male',
    priceNGN: 0,
    isStarter: true,
    primaryColor: '#f1f5f9',
    secondaryColor: '#1e3a8a',
    accentColor: '#10b981',
    pantsStyle: 'jeans',
    shoesStyle: 'sneakers',
    desc: 'Relaxed crew-neck tee paired with denim jeans and clean kicks.',
  },
  {
    id: 'outfit_m_polo_chinos',
    outfitKey: 'casual',
    name: 'Slate Polo & Khaki Chinos',
    category: 'shirts',
    gender: 'male',
    priceNGN: 0,
    isStarter: true,
    primaryColor: '#334155',
    secondaryColor: '#a8845c',
    accentColor: '#34d399',
    pantsStyle: 'slacks',
    shoesStyle: 'loafers',
    desc: 'Smart casual collar polo built for errands and café runs.',
  },
  {
    id: 'outfit_m_native_senator',
    outfitKey: 'trad_senator',
    name: 'Lagos Ash Senator Tunic',
    category: 'traditional',
    gender: 'male',
    priceNGN: 0,
    isStarter: true,
    primaryColor: '#1e293b',
    secondaryColor: '#0f172a',
    accentColor: '#fbbf24',
    pantsStyle: 'slacks',
    shoesStyle: 'loafers',
    desc: 'Tailored longline mandarin-collar Nigerian native tunic.',
  },
  {
    id: 'outfit_m_sport_track',
    outfitKey: 'sporty_fit',
    name: 'Naija Green Track Jacket & Joggers',
    category: 'jackets',
    gender: 'male',
    priceNGN: 0,
    isStarter: true,
    primaryColor: '#047857',
    secondaryColor: '#18181b',
    accentColor: '#facc15',
    pantsStyle: 'sweatpants',
    shoesStyle: 'sneakers',
    desc: 'Breathable athletic zip jacket with tapered joggers.',
  },

  // 5 Distinct FEMALE Starter Outfits (Zero masculine waistcoat/tie defaults!)
  {
    id: 'outfit_f_sundress',
    outfitKey: 'female_sundress',
    name: 'Emerald Pleated Midi Dress',
    category: 'dresses',
    gender: 'female',
    priceNGN: 0,
    isStarter: true,
    primaryColor: '#059669',
    secondaryColor: '#ecfdf5',
    accentColor: '#f59e0b',
    pantsStyle: 'wrapper',
    shoesStyle: 'sandals',
    desc: 'Flared waist-cinched midi dress tailored for sunny Lagos afternoons.',
  },
  {
    id: 'outfit_f_crop_jeans',
    outfitKey: 'female_casual',
    name: 'Ivory Fitted Top & High-Waist Denim',
    category: 'tshirts',
    gender: 'female',
    priceNGN: 0,
    isStarter: true,
    primaryColor: '#fafaf9',
    secondaryColor: '#1d4ed8',
    accentColor: '#f43f5e',
    pantsStyle: 'jeans',
    shoesStyle: 'sneakers',
    desc: 'Clean fitted top tucked into structured high-rise blue jeans.',
  },
  {
    id: 'outfit_f_ankara_peplum',
    outfitKey: 'ankara',
    name: 'Ankara Peplum Blouse & Skirt',
    category: 'traditional',
    gender: 'female',
    priceNGN: 0,
    isStarter: true,
    primaryColor: '#b45309',
    secondaryColor: '#047857',
    accentColor: '#fbbf24',
    pantsStyle: 'wrapper',
    shoesStyle: 'heels',
    desc: 'Tailored Nigerian wax-print peplum blouse with fitted skirt.',
  },
  {
    id: 'outfit_f_corp_blazer',
    outfitKey: 'female_corporate',
    name: 'Executive Cream Blazer & Pencil Skirt',
    category: 'corporate',
    gender: 'female',
    priceNGN: 0,
    isStarter: true,
    primaryColor: '#e2e8f0',
    secondaryColor: '#1e293b',
    accentColor: '#10b981',
    pantsStyle: 'slacks',
    shoesStyle: 'heels',
    desc: 'Polished Victoria Island boardroom blazer with tailored skirt.',
  },
  {
    id: 'outfit_f_sporty_set',
    outfitKey: 'female_sporty',
    name: 'Sage Cropped Zip & Active Leggings',
    category: 'jackets',
    gender: 'female',
    priceNGN: 0,
    isStarter: true,
    primaryColor: '#10b981',
    secondaryColor: '#18181b',
    accentColor: '#ffffff',
    pantsStyle: 'sweatpants',
    shoesStyle: 'sneakers',
    desc: 'Sculpted athletic zip top paired with fitted leggings and runners.',
  },

  // Shop / Boutique Unlockable Outfits (Cross-linked to Wardrobe)
  {
    id: 'outfit_shop_agbada_gold',
    outfitKey: 'agbada',
    name: '24K Gold Embroidered Royal Agbada',
    category: 'traditional',
    gender: 'unisex',
    priceNGN: 250000,
    isStarter: false,
    primaryColor: '#f8fafc',
    secondaryColor: '#1e293b',
    accentColor: '#fbbf24',
    pantsStyle: 'slacks',
    shoesStyle: 'loafers',
    desc: 'Flowing ceremonial robe with golden embroidery.',
  },
  {
    id: 'outfit_shop_designer_black',
    outfitKey: 'designer',
    name: 'Ikoyi Midnight Designer Ensemble',
    category: 'jackets',
    gender: 'unisex',
    priceNGN: 185000,
    isStarter: false,
    primaryColor: '#09090b',
    secondaryColor: '#27272a',
    accentColor: '#34d399',
    pantsStyle: 'slacks',
    shoesStyle: 'boots',
    desc: 'Runway tailored dark jacket with sleek hardware accents.',
  },
  {
    id: 'outfit_shop_gala_gown',
    outfitKey: 'female_gala',
    name: 'Maitama Gold-Trimmed Evening Gown',
    category: 'dresses',
    gender: 'female',
    priceNGN: 210000,
    isStarter: false,
    primaryColor: '#7c2d12',
    secondaryColor: '#fbbf24',
    accentColor: '#fef08a',
    pantsStyle: 'wrapper',
    shoesStyle: 'heels',
    desc: 'Floor-skimming luxury evening dress with golden bodice accents.',
  },
  {
    id: 'outfit_shop_executive_navy',
    outfitKey: 'corporate',
    name: 'CBN Navy Double-Breasted Suit',
    category: 'corporate',
    gender: 'unisex',
    priceNGN: 145000,
    isStarter: false,
    primaryColor: '#172554',
    secondaryColor: '#0f172a',
    accentColor: '#38bdf8',
    pantsStyle: 'slacks',
    shoesStyle: 'oxford',
    desc: 'Sharp executive suiting cut for banking & diplomatic deals.',
  },
  {
    id: 'outfit_shop_varsity',
    outfitKey: 'streetwear_luxe',
    name: 'Yaba Tech Varsity Leather Jacket',
    category: 'jackets',
    gender: 'unisex',
    priceNGN: 120000,
    isStarter: false,
    primaryColor: '#065f46',
    secondaryColor: '#18181b',
    accentColor: '#f59e0b',
    pantsStyle: 'jeans',
    shoesStyle: 'sneakers',
    desc: 'Two-tone wool & leather jacket with stacked jeans.',
  },
  {
    id: 'outfit_shop_summer_shorts',
    outfitKey: 'beach_shorts',
    name: 'Tarkwa Bay Linen Shirt & Shorts',
    category: 'shorts',
    gender: 'unisex',
    priceNGN: 45000,
    isStarter: false,
    primaryColor: '#bae6fd',
    secondaryColor: '#d6d3d1',
    accentColor: '#f97316',
    pantsStyle: 'shorts',
    shoesStyle: 'sandals',
    desc: 'Breezy coastal resort shirt with tailored linen shorts.',
  },
];

export function getStarterHairstylesForGender(gender: 'male' | 'female' | 'unisex'): string[] {
  return SALON_HAIRSTYLES_CATALOG.filter(
    (h) => h.isStarter && (gender === 'unisex' || h.gender === gender || h.gender === 'unisex')
  ).map((h) => h.id);
}

export function getStarterClothingForGender(gender: 'male' | 'female' | 'unisex'): string[] {
  return CLOTHING_SHOP_CATALOG.filter(
    (c) => c.isStarter && (gender === 'unisex' || c.gender === gender || c.gender === 'unisex')
  ).map((c) => c.outfitKey);
}

export function generateWalletAccountNumber(seedKey: string): string {
  let hash = 2166136261;
  const s = String(seedKey || 'naijalife');
  for (let i = 0; i < s.length; i++) {
    hash ^= s.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const num = (Math.abs(hash) % 90000000) + 10000000;
  return `30${num}`; // 10-digit Nigerian NUBAN format starting with 30
}

export function inferDrinkStats(nameOrId: string, category?: string): { isDrink: boolean; thirstGain: number } {
  const s = `${nameOrId} ${category || ''}`.toLowerCase();
  const isDrink =
    s.includes('drink') ||
    s.includes('water') ||
    s.includes('zobo') ||
    s.includes('chapman') ||
    s.includes('malt') ||
    s.includes('yoghurt') ||
    s.includes('fura') ||
    s.includes('kunu') ||
    s.includes('juice') ||
    s.includes('cola') ||
    s.includes('palm wine') ||
    s.includes('wine') ||
    s.includes('radler') ||
    s.includes('lucozade') ||
    s.includes('nectar');
  return {
    isDrink,
    thirstGain: isDrink ? ECONOMY_CONFIG.defaultDrinkThirstGain : ECONOMY_CONFIG.minFoodThirstGain,
  };
}
