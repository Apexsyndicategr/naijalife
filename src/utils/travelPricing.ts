/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface StateGeoCoord {
  id: string;
  name: string;
  lat: number;
  lng: number;
  zone: string;
}

// Approximate geographic center coordinates for all 36 Nigerian states + FCT
export const NIGERIA_STATE_COORDS: Record<string, StateGeoCoord> = {
  abia: { id: 'abia', name: 'Abia', lat: 5.53, lng: 7.49, zone: 'South East' },
  adamawa: { id: 'adamawa', name: 'Adamawa', lat: 9.33, lng: 12.45, zone: 'North East' },
  akwa_ibom: { id: 'akwa_ibom', name: 'Akwa Ibom', lat: 5.03, lng: 7.91, zone: 'South South' },
  anambra: { id: 'anambra', name: 'Anambra', lat: 6.22, lng: 6.94, zone: 'South East' },
  bauchi: { id: 'bauchi', name: 'Bauchi', lat: 10.31, lng: 9.84, zone: 'North East' },
  bayelsa: { id: 'bayelsa', name: 'Bayelsa', lat: 4.93, lng: 6.27, zone: 'South South' },
  benue: { id: 'benue', name: 'Benue', lat: 7.73, lng: 8.52, zone: 'North Central' },
  borno: { id: 'borno', name: 'Borno', lat: 11.83, lng: 13.15, zone: 'North East' },
  cross_river: { id: 'cross_river', name: 'Cross River', lat: 5.96, lng: 8.33, zone: 'South South' },
  delta: { id: 'delta', name: 'Delta', lat: 5.54, lng: 5.76, zone: 'South South' },
  ebonyi: { id: 'ebonyi', name: 'Ebonyi', lat: 6.26, lng: 8.01, zone: 'South East' },
  edo: { id: 'edo', name: 'Edo', lat: 6.54, lng: 5.90, zone: 'South South' },
  ekiti: { id: 'ekiti', name: 'Ekiti', lat: 7.62, lng: 5.22, zone: 'South West' },
  enugu: { id: 'enugu', name: 'Enugu', lat: 6.45, lng: 7.51, zone: 'South East' },
  fct: { id: 'fct', name: 'FCT Abuja', lat: 9.07, lng: 7.40, zone: 'North Central' },
  gombe: { id: 'gombe', name: 'Gombe', lat: 10.29, lng: 11.17, zone: 'North East' },
  imo: { id: 'imo', name: 'Imo', lat: 5.48, lng: 7.03, zone: 'South East' },
  jigawa: { id: 'jigawa', name: 'Jigawa', lat: 12.23, lng: 9.56, zone: 'North West' },
  kaduna: { id: 'kaduna', name: 'Kaduna', lat: 10.52, lng: 7.44, zone: 'North West' },
  kano: { id: 'kano', name: 'Kano', lat: 12.00, lng: 8.52, zone: 'North West' },
  katsina: { id: 'katsina', name: 'Katsina', lat: 12.99, lng: 7.60, zone: 'North West' },
  kebbi: { id: 'kebbi', name: 'Kebbi', lat: 12.45, lng: 4.19, zone: 'North West' },
  kogi: { id: 'kogi', name: 'Kogi', lat: 7.80, lng: 6.74, zone: 'North Central' },
  kwara: { id: 'kwara', name: 'Kwara', lat: 8.50, lng: 4.54, zone: 'North Central' },
  lagos: { id: 'lagos', name: 'Lagos', lat: 6.52, lng: 3.38, zone: 'South West' },
  nasarawa: { id: 'nasarawa', name: 'Nasarawa', lat: 8.49, lng: 8.52, zone: 'North Central' },
  niger: { id: 'niger', name: 'Niger', lat: 9.93, lng: 5.98, zone: 'North Central' },
  ogun: { id: 'ogun', name: 'Ogun', lat: 7.00, lng: 3.35, zone: 'South West' },
  ondo: { id: 'ondo', name: 'Ondo', lat: 7.10, lng: 5.06, zone: 'South West' },
  osun: { id: 'osun', name: 'Osun', lat: 7.77, lng: 4.56, zone: 'South West' },
  oyo: { id: 'oyo', name: 'Oyo', lat: 7.85, lng: 3.93, zone: 'South West' },
  plateau: { id: 'plateau', name: 'Plateau', lat: 9.89, lng: 8.89, zone: 'North Central' },
  rivers: { id: 'rivers', name: 'Rivers', lat: 4.82, lng: 7.01, zone: 'South South' },
  sokoto: { id: 'sokoto', name: 'Sokoto', lat: 13.06, lng: 5.24, zone: 'North West' },
  taraba: { id: 'taraba', name: 'Taraba', lat: 7.87, lng: 9.78, zone: 'North East' },
  yobe: { id: 'yobe', name: 'Yobe', lat: 11.75, lng: 11.97, zone: 'North East' },
  zamfara: { id: 'zamfara', name: 'Zamfara', lat: 12.17, lng: 6.66, zone: 'North West' },
};

export interface InterstateTripDetails {
  originId: string;
  destinationId: string;
  originName: string;
  destinationName: string;
  distanceKm: number;
  travelTimeHours: number;
  travelTimeFormatted: string;
  fareNGN: number;
  busOperator: string;
  routeType: 'Adjacent / Local Express' | 'Intra-Regional' | 'Inter-Regional Direct' | 'Cross-Country Long Haul';
}

/**
 * Calculates real-world road distance and commercial bus fare (Peace Mass Transit, GIGM, ABC Transport)
 * between any origin state and destination state in Nigeria.
 */
export function calculateInterstateTrip(
  fromStateId: string,
  toStateId: string,
  fromStateName?: string,
  toStateName?: string
): InterstateTripDetails {
  const normFrom = fromStateId.toLowerCase().replace(/[^a-z0-9_]/g, '');
  const normTo = toStateId.toLowerCase().replace(/[^a-z0-9_]/g, '');

  if (normFrom === normTo) {
    return {
      originId: normFrom,
      destinationId: normTo,
      originName: fromStateName || normFrom,
      destinationName: toStateName || normTo,
      distanceKm: 0,
      travelTimeHours: 0,
      travelTimeFormatted: '0 mins',
      fareNGN: 0,
      busOperator: 'Local Transit',
      routeType: 'Adjacent / Local Express',
    };
  }

  // Transatlantic travel to Canada is strictly flight only — no road/bus service across Atlantic Ocean!
  if (normTo === 'canada' || normFrom === 'canada') {
    return {
      originId: normFrom,
      destinationId: normTo,
      originName: fromStateName || normFrom,
      destinationName: toStateName || normTo,
      distanceKm: 8920,
      travelTimeHours: 0,
      travelTimeFormatted: 'No Road Access (Atlantic Ocean)',
      fareNGN: 0,
      busOperator: 'No Bus Route (Transatlantic Flight Only)',
      routeType: 'Cross-Country Long Haul',
    };
  }

  const c1 = NIGERIA_STATE_COORDS[normFrom] || { lat: 7.5, lng: 6.5, zone: 'Nigeria', name: fromStateName || normFrom };
  const c2 = NIGERIA_STATE_COORDS[normTo] || { lat: 9.0, lng: 7.5, zone: 'Nigeria', name: toStateName || normTo };

  // Haversine formula for spherical distance in km
  const R = 6371; // Earth radius km
  const dLat = ((c2.lat - c1.lat) * Math.PI) / 180;
  const dLng = ((c2.lng - c1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((c1.lat * Math.PI) / 180) *
      Math.cos((c2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightLineKm = R * c;

  // Real Nigerian road winding factor (approx 1.35x straight line)
  const roadKm = Math.max(45, Math.round(straightLineKm * 1.35));

  // Determine real route type and bus company
  let busOperator = 'Peace Mass Transit (PMT)';
  let routeType: InterstateTripDetails['routeType'] = 'Intra-Regional';

  if (roadKm <= 120) {
    routeType = 'Adjacent / Local Express';
    busOperator = 'State Park Interstate Bus';
  } else if (roadKm <= 350) {
    routeType = 'Intra-Regional';
    busOperator = 'Peace Mass Transit (PMT)';
  } else if (roadKm <= 650) {
    routeType = 'Inter-Regional Direct';
    busOperator = 'GIGM (God Is Good Motors)';
  } else {
    routeType = 'Cross-Country Long Haul';
    busOperator = 'ABC Transport / Young Shall Grow';
  }

  // Interstate travel pricing: minimum ₦250,000 to maximum ₦650,000 depending on distance
  // Shortest adjacent routes (~50km) start at ₦250,000; longest cross-country routes (~1,400km) reach ₦650,000
  const MIN_FARE = 250000;
  const MAX_FARE = 650000;
  const MIN_DIST = 50;
  const MAX_DIST = 1400;
  const clampedDist = Math.max(MIN_DIST, Math.min(MAX_DIST, roadKm));
  const distRatio = (clampedDist - MIN_DIST) / (MAX_DIST - MIN_DIST);
  const rawFare = MIN_FARE + distRatio * (MAX_FARE - MIN_FARE);

  // Round fare to nearest ₦5,000 for authentic transport park pricing
  const fareNGN = Math.round(rawFare / 5000) * 5000;

  // Real travel time estimate (avg 55-65 km/h on Nigerian expressways + stops)
  const travelTimeHours = Math.round((roadKm / 60) * 10) / 10;
  const hours = Math.floor(travelTimeHours);
  const mins = Math.round((travelTimeHours - hours) * 60);
  const travelTimeFormatted = hours > 0 ? `${hours}h ${mins > 0 ? `${mins}m` : ''}`.trim() : `${mins} mins`;

  return {
    originId: normFrom,
    destinationId: normTo,
    originName: fromStateName || c1.name,
    destinationName: toStateName || c2.name,
    distanceKm: roadKm,
    travelTimeHours,
    travelTimeFormatted,
    fareNGN,
    busOperator,
    routeType,
  };
}

export interface AirportData {
  airportName: string;
  iata: string;
  city: string;
  type: 'international' | 'major_domestic' | 'regional';
}

export const STATE_AIRPORTS: Record<string, AirportData> = {
  lagos: { airportName: 'Murtala Muhammed International Airport', iata: 'LOS', city: 'Ikeja, Lagos', type: 'international' },
  fct: { airportName: 'Nnamdi Azikiwe International Airport', iata: 'ABV', city: 'Abuja FCT', type: 'international' },
  fct_abuja: { airportName: 'Nnamdi Azikiwe International Airport', iata: 'ABV', city: 'Abuja FCT', type: 'international' },
  abuja: { airportName: 'Nnamdi Azikiwe International Airport', iata: 'ABV', city: 'Abuja FCT', type: 'international' },
  rivers: { airportName: 'Port Harcourt International Airport', iata: 'PHC', city: 'Omagwa, Port Harcourt', type: 'international' },
  kano: { airportName: 'Mallam Aminu Kano International Airport', iata: 'KAN', city: 'Kano City', type: 'international' },
  enugu: { airportName: 'Akanu Ibiam International Airport', iata: 'ENU', city: 'Emene, Enugu', type: 'international' },
  anambra: { airportName: 'Chinua Achebe International Airport', iata: 'ANA', city: 'Umueri, Anambra', type: 'major_domestic' },
  imo: { airportName: 'Sam Mbakwe International Cargo Airport', iata: 'QOW', city: 'Ulakwo, Owerri', type: 'major_domestic' },
  akwa_ibom: { airportName: 'Victor Attah International Airport', iata: 'QUO', city: 'Uyo', type: 'major_domestic' },
  delta: { airportName: 'Asaba International Airport', iata: 'ABB', city: 'Asaba', type: 'major_domestic' },
  cross_river: { airportName: 'Margaret Ekpo International Airport', iata: 'CBQ', city: 'Calabar', type: 'major_domestic' },
  edo: { airportName: 'Benin City Airport', iata: 'BNI', city: 'Benin City', type: 'major_domestic' },
  kaduna: { airportName: 'Kaduna International Airport', iata: 'KAD', city: 'Rigachikun, Kaduna', type: 'major_domestic' },
  sokoto: { airportName: 'Sadiq Abubakar III International Airport', iata: 'SKO', city: 'Sokoto', type: 'major_domestic' },
  borno: { airportName: 'Maiduguri International Airport', iata: 'MIU', city: 'Maiduguri', type: 'major_domestic' },
  adamawa: { airportName: 'Lamido Aliyu Musdafa Airport', iata: 'YOL', city: 'Yola', type: 'major_domestic' },
  kwara: { airportName: 'Ilorin International Airport', iata: 'ILR', city: 'Ilorin', type: 'major_domestic' },
  plateau: { airportName: 'Yakubu Gowon Airport', iata: 'JOS', city: 'Heipang, Jos', type: 'major_domestic' },
  benue: { airportName: 'Makurdi Air Force & Civil Airport', iata: 'MDI', city: 'Makurdi', type: 'regional' },
  oyo: { airportName: 'Ibadan Airport (Samuel Ladoke Akintola)', iata: 'IBA', city: 'Alakia, Ibadan', type: 'major_domestic' },
  ondo: { airportName: 'Akure Domestic Airport', iata: 'AKR', city: 'Akure', type: 'regional' },
  ebonyi: { airportName: 'Chuba Okadigbo International Airport', iata: 'EBO', city: 'Onueke, Ebonyi', type: 'major_domestic' },
  ogun: { airportName: 'Gateway Agro-Cargo International Airport', iata: 'OGU', city: 'Iperu, Ogun', type: 'major_domestic' },
  bauchi: { airportName: 'Sir Abubakar Tafawa Balewa International Airport', iata: 'BCU', city: 'Bauchi', type: 'major_domestic' },
  bayelsa: { airportName: 'Bayelsa International Airport', iata: 'BYA', city: 'Amassoma, Bayelsa', type: 'major_domestic' },
  ekiti: { airportName: 'Ekiti State Agro-Allied International Airport', iata: 'QEK', city: 'Ado-Ekiti', type: 'regional' },
  gombe: { airportName: 'Sani Abacha International Airport', iata: 'GMO', city: 'Lawanti, Gombe', type: 'major_domestic' },
  jigawa: { airportName: 'Dutse International Airport', iata: 'DUT', city: 'Dutse', type: 'regional' },
  katsina: { airportName: 'Umaru Musa Yar’adua International Airport', iata: 'DKA', city: 'Katsina', type: 'major_domestic' },
  kebbi: { airportName: 'Sir Ahmadu Bello International Airport', iata: 'SKB', city: 'Birnin Kebbi', type: 'regional' },
  kogi: { airportName: 'Lokoja Confluence Executive Airstrip', iata: 'QKG', city: 'Lokoja', type: 'regional' },
  nasarawa: { airportName: 'Lafia Cargo International Airport', iata: 'QNS', city: 'Lafia', type: 'regional' },
  niger: { airportName: 'Minna International Airport', iata: 'MXJ', city: 'Minna', type: 'regional' },
  osun: { airportName: 'M.K.O. Abiola International Airport', iata: 'QOS', city: 'Ido-Osun, Osogbo', type: 'regional' },
  taraba: { airportName: 'Danbaba Danfulani Suntai Airport', iata: 'JAL', city: 'Jalingo', type: 'regional' },
  yobe: { airportName: 'Damaturu International Cargo Airport', iata: 'QYB', city: 'Damaturu', type: 'regional' },
  zamfara: { airportName: 'Gusau International Airport Strip', iata: 'QZA', city: 'Gusau', type: 'regional' },
  abia: { airportName: 'Abia Gateway Transit Hub (Owerri/Uyo Corridor)', iata: 'QOW', city: 'Umuahia / Aba', type: 'regional' },
};

export interface AirlineOption {
  id: 'air_peace' | 'ibom_air' | 'green_africa' | 'united_nigeria' | 'max_air';
  name: string;
  aircraft: string;
  multiplier: number;
  tagline: string;
  color: string;
  logo: string;
}

export const DOMESTIC_AIRLINES: AirlineOption[] = [
  { id: 'air_peace', name: 'Air Peace', aircraft: 'Boeing 737-800 / Embraer E195-E2', multiplier: 1.0, tagline: 'Your Peace, Our Goal', color: 'from-blue-600 to-indigo-800', logo: '✈️' },
  { id: 'ibom_air', name: 'Ibom Air', aircraft: 'Airbus A220-300', multiplier: 1.14, tagline: 'Schedule Reliability & Premium Service', color: 'from-orange-500 to-red-700', logo: '🛫' },
  { id: 'green_africa', name: 'Green Africa', aircraft: 'ATR 72-600 Turboprop', multiplier: 0.90, tagline: 'Affordable Gbaradun Flights', color: 'from-emerald-500 to-green-700', logo: '🛬' },
  { id: 'united_nigeria', name: 'United Nigeria', aircraft: 'Embraer ERJ-145', multiplier: 0.96, tagline: 'Flying to Unite', color: 'from-sky-600 to-blue-700', logo: '✈️' },
  { id: 'max_air', name: 'Max Air', aircraft: 'Boeing 737-300', multiplier: 0.98, tagline: 'Safety and Comfort', color: 'from-amber-600 to-yellow-800', logo: '✈️' },
];

export interface InternationalDestination {
  id: 'uk' | 'canada' | 'usa' | 'uae';
  country: string;
  city: string;
  airport: string;
  iata: string;
  flag: string;
  flightDuration: string;
  status: 'COMING_SOON' | 'ACTIVE';
  statusBadge: string;
  priceDisplay: string;
  priceNGN: number;
  priceCAD?: number;
  visaRequirements: string;
  desc: string;
}

export const INTERNATIONAL_DESTINATIONS: InternationalDestination[] = [
  {
    id: 'uk',
    country: 'United Kingdom',
    city: 'London',
    airport: 'London Heathrow Airport (LHR)',
    iata: 'LHR',
    flag: '🇬🇧',
    flightDuration: '6h 35m direct',
    status: 'COMING_SOON',
    statusBadge: 'COMING SOON (Japa Relocation Wing)',
    priceDisplay: 'Coming Soon',
    priceNGN: 0,
    visaRequirements: 'UK Skilled Worker Visa, Student Visa (Tier 4) or British Passport',
    desc: 'Direct trans-continental corridor from Lagos/Abuja to London Heathrow. Connect to Birmingham, Manchester, and Leeds.',
  },
  {
    id: 'canada',
    country: 'Canada',
    city: 'Toronto (YYZ) / Vancouver (YVR) / Montreal (YUL)',
    airport: 'Toronto Pearson International (YYZ)',
    iata: 'YYZ',
    flag: '🇨🇦',
    flightDuration: '12h 45m Direct Transatlantic',
    status: 'ACTIVE',
    statusBadge: 'ACTIVE CORRIDOR (150 Locations Live)',
    priceDisplay: '₦5,000,000',
    priceNGN: 5000000,
    priceCAD: 4350,
    visaRequirements: 'Canada Visa, Study Permit, Work Permit, PR Card or Canadian Passport',
    desc: 'Official active international gateway into Toronto, Vancouver, Montreal, Ottawa, Calgary and beyond. 150 authentic Canadian real-life locations available upon arrival.',
  },
  {
    id: 'usa',
    country: 'United States',
    city: 'New York / Atlanta',
    airport: 'John F. Kennedy International (JFK)',
    iata: 'JFK',
    flag: '🇺🇸',
    flightDuration: '11h 20m direct',
    status: 'COMING_SOON',
    statusBadge: 'COMING SOON (Embassy Visa Interview Wing)',
    priceDisplay: 'Coming Soon',
    priceNGN: 0,
    visaRequirements: 'US B1/B2 Visitor Visa, F-1 Student Visa, or Green Card',
    desc: 'North American trans-Atlantic connection into New York JFK and Atlanta Hartsfield.',
  },
  {
    id: 'uae',
    country: 'United Arab Emirates',
    city: 'Dubai',
    airport: 'Dubai International Airport (DXB)',
    iata: 'DXB',
    flag: '🇦🇪',
    flightDuration: '7h 10m direct',
    status: 'COMING_SOON',
    statusBadge: 'COMING SOON (Gulf Trade & Tourism Corridor)',
    priceDisplay: 'Coming Soon',
    priceNGN: 0,
    visaRequirements: 'UAE Tourist Visa, Residence Golden Visa or Investor Permit',
    desc: 'Direct long-range link into Dubai DXB Terminal 3. High-flying lifestyle, luxury shopping, and Gulf business.',
  },
];

export type FlightCabinClass = 'economy' | 'premium_economy' | 'business' | 'first_class';

export interface FlightCabinOption {
  id: FlightCabinClass;
  name: string;
  multiplier: number;
  icon: string;
  baggage: string;
  badge: string;
  joyBonus: number;
  perks: string[];
}

export const FLIGHT_CABIN_CLASSES: FlightCabinOption[] = [
  {
    id: 'economy',
    name: 'Economy Class',
    multiplier: 1.0,
    icon: '💺',
    baggage: '20kg Checked + 7kg Hand',
    badge: 'Standard Class',
    joyBonus: 5,
    perks: ['Standard Ergonomic Jet Seat', '20kg Checked Baggage', 'In-flight Cold Water & Pastry', 'Digital Mobile Boarding Pass'],
  },
  {
    id: 'premium_economy',
    name: 'Premium Economy',
    multiplier: 1.5,
    icon: '🛫',
    baggage: '30kg Checked + 10kg Hand',
    badge: 'Extra Comfort',
    joyBonus: 12,
    perks: ['Extra 6" Legroom Recline', 'Priority Gate 1 Boarding', '30kg Baggage Allowance', 'Hot Nigerian Suya / Meat Pie & Drink'],
  },
  {
    id: 'business',
    name: 'Business Class (VIP)',
    multiplier: 2.5,
    icon: '🥂',
    baggage: '40kg Checked + 12kg Hand',
    badge: 'Executive VIP',
    joyBonus: 22,
    perks: ['Wide Leather Lie-Flat Recliner', 'VIP Terminal Lounge & Buffet', '40kg Baggage Allowance', 'Fast-Track Security & Customs', '+22 Joy Restored'],
  },
  {
    id: 'first_class',
    name: 'First Class / Presidential Suite',
    multiplier: 4.5,
    icon: '👑',
    baggage: 'Unlimited Baggage',
    badge: 'Presidential Suite',
    joyBonus: 40,
    perks: ['Private Enclosed Cabin Suite', 'VIP Tarmac Chauffeur Escort', 'Top-Shelf Champagne & Fine Dining', 'Unlimited Baggage', '+40 Joy Restored'],
  },
];

export interface CanadaAirlineOption {
  id: string;
  name: string;
  aircraft: string;
  multiplier: number;
  tagline: string;
  color: string;
  logo: string;
  alliance: string;
}

export const CANADA_AIRLINES: CanadaAirlineOption[] = [
  {
    id: 'air_canada',
    name: 'Air Canada',
    aircraft: 'Boeing 787-9 Dreamliner',
    multiplier: 1.0, // Economy = ₦5,000,000
    tagline: 'Canada’s Flagship Transatlantic Service',
    color: 'from-red-600 to-rose-900',
    logo: '🍁',
    alliance: 'Star Alliance Member',
  },
  {
    id: 'air_peace_intl',
    name: 'Air Peace Prime',
    aircraft: 'Boeing 777-300ER',
    multiplier: 0.95, // Economy = ₦4,750,000 (Saver)
    tagline: 'Nigeria’s Direct Transatlantic Bridge',
    color: 'from-blue-600 to-indigo-800',
    logo: '✈️',
    alliance: 'Direct Nigerian Flagship',
  },
  {
    id: 'british_airways',
    name: 'British Airways',
    aircraft: 'Airbus A350-1000',
    multiplier: 1.15, // Economy = ₦5,750,000
    tagline: 'World Traveller & Club World via London Heathrow',
    color: 'from-blue-700 to-red-800',
    logo: '🇬🇧',
    alliance: 'oneworld Alliance',
  },
  {
    id: 'lufthansa',
    name: 'Lufthansa',
    aircraft: 'Boeing 747-8 Intercontinental',
    multiplier: 1.12, // Economy = ₦5,600,000
    tagline: 'Star Alliance Atlantic Gateway via Frankfurt',
    color: 'from-amber-600 to-blue-900',
    logo: '🇩🇪',
    alliance: 'Star Alliance Member',
  },
  {
    id: 'qatar_airways',
    name: 'Qatar Airways',
    aircraft: 'Airbus A350-900',
    multiplier: 1.25, // Economy = ₦6,250,000
    tagline: 'Skytrax 5-Star Global Carrier & Qsuite',
    color: 'from-purple-800 to-rose-950',
    logo: '🇶🇦',
    alliance: 'oneworld Alliance',
  },
  {
    id: 'emirates',
    name: 'Emirates Airline',
    aircraft: 'Airbus A380-800 Superjumbo',
    multiplier: 1.28, // Economy = ₦6,400,000
    tagline: 'Fly Better Transatlantic Luxury Connection',
    color: 'from-red-700 to-amber-700',
    logo: '🇦🇪',
    alliance: 'Emirates Skywards VIP',
  },
];

export const CANADA_CABIN_CLASSES: FlightCabinOption[] = [
  {
    id: 'economy',
    name: 'Economy Class',
    multiplier: 1.0, // ₦5,000,000 base
    icon: '💺',
    baggage: '2x 23kg Checked + 10kg Hand',
    badge: 'Standard Jet',
    joyBonus: 15,
    perks: ['Standard Dreamliner Ergonomic Jet Seat', 'Seatback 4K On-Demand Entertainment', 'Complimentary Hot In-flight Meals & Drinks', 'CBSA Arrival Declaration Assistance'],
  },
  {
    id: 'premium_economy',
    name: 'Premium Economy',
    multiplier: 1.5, // ₦7,500,000 base
    icon: '🛫',
    baggage: '2x 32kg Checked + 12kg Hand',
    badge: 'Extra Comfort',
    joyBonus: 30,
    perks: ['Dedicated Wide Recliner + Extra 7" Legroom & Footrest', 'Priority Zone 2 Boarding & Express Luggage Delivery', 'Noise-Cancelling Premium Headphones', 'Three-Course Canadian Gourmet Meal & Wine'],
  },
  {
    id: 'business',
    name: 'Business Class (VIP)',
    multiplier: 2.5, // ₦12,500,000 base
    icon: '🥂',
    baggage: '3x 32kg Checked + 15kg Hand',
    badge: 'Executive VIP',
    joyBonus: 55,
    perks: ['Full Lie-Flat Bed Transatlantic Suite with Direct Aisle Access', 'Maple Leaf / Star Alliance VIP Lounge Access', 'Chilled Laurent-Perrier Champagne & Fine Dining', 'Fast-Track CBSA Canadian Border Clearance', '+55 Joy Restored'],
  },
  {
    id: 'first_class',
    name: 'First Class / Presidential Suite',
    multiplier: 4.5, // ₦22,500,000 base
    icon: '👑',
    baggage: 'Unlimited Baggage',
    badge: 'Presidential Suite',
    joyBonus: 100,
    perks: ['Ultra-Private Enclosed Transatlantic Suite with Double Bed', 'Private Jet Bridge & Chauffeur Tarmac Transfer', 'Personal Onboard Chef & Sommelier Service', 'Dedicated 24/7 Diplomatic & VIP Arrival Butler', '+100 Joy Restored'],
  },
];

export interface FlightSchedulePlan {
  id: string;
  timeSlot: string;
  departureTime: string;
  arrivalTime: string;
  flightCode: string;
  name: string;
  badge: string;
}

export const FLIGHT_SCHEDULE_PLANS: FlightSchedulePlan[] = [
  {
    id: 'morning_shuttle',
    timeSlot: 'Morning',
    departureTime: '07:15 AM',
    arrivalTime: '08:25 AM',
    flightCode: 'NG-102',
    name: 'Morning Business Shuttle',
    badge: 'Early Bird Direct',
  },
  {
    id: 'midday_express',
    timeSlot: 'Midday',
    departureTime: '01:30 PM',
    arrivalTime: '02:40 PM',
    flightCode: 'NG-304',
    name: 'Midday Commercial Express',
    badge: 'Popular Direct',
  },
  {
    id: 'sunset_exec',
    timeSlot: 'Sunset',
    departureTime: '06:45 PM',
    arrivalTime: '07:55 PM',
    flightCode: 'NG-508',
    name: 'Sunset Executive Flight',
    badge: 'Twilight Service',
  },
  {
    id: 'night_courier',
    timeSlot: 'Night',
    departureTime: '09:20 PM',
    arrivalTime: '10:30 PM',
    flightCode: 'NG-712',
    name: 'Night Courier Flight',
    badge: 'Red-Eye Fast',
  },
];

export interface DomesticFlightDetails {
  originId: string;
  originName: string;
  originAirport: string;
  originIata: string;
  destinationId: string;
  destinationName: string;
  destinationAirport: string;
  destinationIata: string;
  distanceKm: number;
  flightTimeFormatted: string;
  baseFareNGN: number;
  airlineName: string;
  airlineFareNGN: number;
  isSurgeActive: boolean;
  surgeMultiplier: number;
  surgeReason: string;
  totalFareNGN: number;
  aircraftModel: string;
  cabinClass: FlightCabinClass;
  cabinName: string;
  cabinMultiplier: number;
}

export function calculateDomesticFlightDetails(
  fromStateId: string,
  toStateId: string,
  airlineId: string = 'air_peace',
  realPlayersCount: number = 1,
  cabinClass: FlightCabinClass = 'economy'
): DomesticFlightDetails {
  const normFrom = fromStateId.toLowerCase().replace(/[^a-z0-9_]/g, '');
  const normTo = toStateId.toLowerCase().replace(/[^a-z0-9_]/g, '');

  // Transatlantic International Flight to Canada
  if (normTo === 'canada' || normFrom === 'canada') {
    const isOutbound = normTo === 'canada';
    const originAirportObj = STATE_AIRPORTS[normFrom] || {
      airportName: isOutbound ? 'Murtala Muhammed International Airport (LOS)' : 'Toronto Pearson International (YYZ)',
      iata: isOutbound ? 'LOS' : 'YYZ',
      city: isOutbound ? 'Lagos' : 'Toronto',
      type: 'major_domestic' as const,
    };
    const destAirportObj = {
      airportName: isOutbound ? 'Toronto Pearson International Airport (YYZ)' : (STATE_AIRPORTS[normTo]?.airportName || 'Murtala Muhammed International (LOS)'),
      iata: isOutbound ? 'YYZ' : (STATE_AIRPORTS[normTo]?.iata || 'LOS'),
      city: isOutbound ? 'Toronto, Canada' : 'Nigeria',
      type: 'major_domestic' as const,
    };

    const selectedAirline =
      CANADA_AIRLINES.find((a) => a.id === airlineId) ||
      (airlineId === 'air_peace' ? CANADA_AIRLINES[1] : CANADA_AIRLINES[0]);

    const selectedCabin =
      CANADA_CABIN_CLASSES.find((c) => c.id === cabinClass) || CANADA_CABIN_CLASSES[0];

    const baseFareNGN = 5000000;
    const airlineAdjusted = Math.round(baseFareNGN * selectedAirline.multiplier);
    const totalFareNGN = Math.round((airlineAdjusted * selectedCabin.multiplier) / 1000) * 1000;

    return {
      originId: normFrom,
      originName: isOutbound ? 'Nigeria' : 'Canada',
      originAirport: originAirportObj.airportName,
      originIata: originAirportObj.iata,
      destinationId: normTo,
      destinationName: isOutbound ? 'Canada' : 'Nigeria',
      destinationAirport: destAirportObj.airportName,
      destinationIata: destAirportObj.iata,
      distanceKm: 8920,
      flightTimeFormatted: '10h 45m',
      baseFareNGN,
      airlineName: selectedAirline.name,
      airlineFareNGN: airlineAdjusted,
      isSurgeActive: false,
      surgeMultiplier: 1.0,
      surgeReason: `${selectedAirline.tagline} (${selectedAirline.alliance})`,
      totalFareNGN,
      aircraftModel: selectedAirline.aircraft,
      cabinClass: selectedCabin.id,
      cabinName: selectedCabin.name,
      cabinMultiplier: selectedCabin.multiplier,
    };
  }

  const c1 = NIGERIA_STATE_COORDS[normFrom] || { lat: 6.52, lng: 3.38, zone: 'South West', name: fromStateId };
  const c2 = NIGERIA_STATE_COORDS[normTo] || { lat: 9.07, lng: 7.40, zone: 'North Central', name: toStateId };

  // Calculate straight line distance (flight path)
  const R = 6371;
  const dLat = ((c2.lat - c1.lat) * Math.PI) / 180;
  const dLng = ((c2.lng - c1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((c1.lat * Math.PI) / 180) *
      Math.cos((c2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const airDistanceKm = Math.max(120, Math.round(R * c));

  const originAirportObj = STATE_AIRPORTS[normFrom] || {
    airportName: `${c1.name} Domestic Airport`,
    iata: normFrom.slice(0, 3).toUpperCase(),
    city: c1.name,
    type: 'major_domestic' as const,
  };
  const destAirportObj = STATE_AIRPORTS[normTo] || {
    airportName: `${c2.name} Domestic Airport`,
    iata: normTo.slice(0, 3).toUpperCase(),
    city: c2.name,
    type: 'major_domestic' as const,
  };

  // Domestic flight airfares starting at ₦800,000 for standard economy (raised from 680k to 800k, scaling others too)
  const distRatio = Math.min(1, Math.max(0, (airDistanceKm - 500) / 600));
  let rawBaseFare = Math.round((800000 + distRatio * 300000) / 10000) * 10000;
  rawBaseFare = Math.max(800000, Math.min(1100000, rawBaseFare));

  const selectedAirline = DOMESTIC_AIRLINES.find((a) => a.id === airlineId) || DOMESTIC_AIRLINES[0];
  const airlineAdjusted = Math.round(rawBaseFare * selectedAirline.multiplier);

  // Dynamic real-player surge multiplier!
  const isHighDemandRoute =
    (normFrom === 'lagos' && (normTo === 'fct' || normTo === 'fct_abuja' || normTo === 'abuja')) ||
    ((normFrom === 'fct' || normFrom === 'fct_abuja' || normFrom === 'abuja') && normTo === 'lagos');

  let surgeMultiplier = 1.0;
  let isSurgeActive = false;
  let surgeReason = 'Standard Scheduled Flight Rates';

  if (realPlayersCount >= 3 || (isHighDemandRoute && realPlayersCount >= 2)) {
    surgeMultiplier = 1.35;
    isSurgeActive = true;
    surgeReason = `🔥 High Passenger Demand: Multiple real citizens active in Nigerian airspace (${realPlayersCount} online). Surge rate active.`;
  } else if (isHighDemandRoute) {
    surgeMultiplier = 1.18;
    isSurgeActive = true;
    surgeReason = 'Heavy Passenger Volume on Federal Capital & Lagos Commercial Aviation Corridor.';
  } else if (realPlayersCount >= 2) {
    surgeMultiplier = 1.12;
    isSurgeActive = true;
    surgeReason = 'Elevated Passenger Bookings: Multiple live citizens online.';
  }

  // Cabin Class multiplier
  const selectedCabin = FLIGHT_CABIN_CLASSES.find((c) => c.id === cabinClass) || FLIGHT_CABIN_CLASSES[0];
  const finalFare = Math.round((airlineAdjusted * surgeMultiplier * selectedCabin.multiplier) / 1000) * 1000;

  // Flight time (avg jet groundspeed ~680 km/h + 20 mins taxi & ascent/descent)
  const flightMins = Math.round(20 + (airDistanceKm / 680) * 60);
  const fHours = Math.floor(flightMins / 60);
  const fRemainingMins = flightMins % 60;
  const flightTimeFormatted = fHours > 0 ? `${fHours}h ${fRemainingMins}m` : `${fRemainingMins} mins`;

  return {
    originId: normFrom,
    originName: c1.name,
    originAirport: originAirportObj.airportName,
    originIata: originAirportObj.iata,
    destinationId: normTo,
    destinationName: c2.name,
    destinationAirport: destAirportObj.airportName,
    destinationIata: destAirportObj.iata,
    distanceKm: airDistanceKm,
    flightTimeFormatted,
    baseFareNGN: Math.round(rawBaseFare / 1000) * 1000,
    airlineName: selectedAirline.name,
    airlineFareNGN: airlineAdjusted,
    isSurgeActive,
    surgeMultiplier,
    surgeReason,
    totalFareNGN: finalFare,
    aircraftModel: selectedAirline.aircraft,
    cabinClass: selectedCabin.id,
    cabinName: selectedCabin.name,
    cabinMultiplier: selectedCabin.multiplier,
  };
}
