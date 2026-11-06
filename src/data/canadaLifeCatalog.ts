/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// =========================================================================
// 1. CANADIAN LUXURY PROPERTIES (PURCHASED & RENTED IN CAD FROM CANADIAN BANK)
// =========================================================================
export interface CanadianProperty {
  id: string;
  title: string;
  city: string;
  province: string;
  neighborhood: string;
  buyPriceCAD: number;
  weeklyRentCAD: number;
  icon: string;
  type: 'condo' | 'penthouse' | 'mansion' | 'estate' | 'chalet';
  desc: string;
  bedrooms: number;
  bathrooms: number;
}

export const CANADA_PROPERTIES: CanadianProperty[] = [
  {
    id: 'can_prop_toronto_bay',
    title: 'Executive Financial District High-Rise Condo',
    city: 'Toronto',
    province: 'Ontario',
    neighborhood: 'Bay & King St, Downtown Toronto',
    buyPriceCAD: 1450000,
    weeklyRentCAD: 2800,
    icon: '🏙️',
    type: 'condo',
    desc: 'Floor-to-ceiling glass corner suite with panoramic views of the CN Tower and Lake Ontario. Concierge, private valet & gym.',
    bedrooms: 2,
    bathrooms: 2,
  },
  {
    id: 'can_prop_vancouver_coal',
    title: 'Coal Harbour Waterfront Sky Penthouse',
    city: 'Vancouver',
    province: 'British Columbia',
    neighborhood: 'Coal Harbour, Vancouver',
    buyPriceCAD: 3850000,
    weeklyRentCAD: 6800,
    icon: '🏰',
    type: 'penthouse',
    desc: 'Breathtaking 360-degree ocean views of Stanley Park and North Shore mountains. Private rooftop heated pool and yacht slip.',
    bedrooms: 4,
    bathrooms: 4,
  },
  {
    id: 'can_prop_montreal_westmount',
    title: 'Historic Westmount Heritage Stone Mansion',
    city: 'Montreal',
    province: 'Quebec',
    neighborhood: 'Westmount Heights, Montreal',
    buyPriceCAD: 2650000,
    weeklyRentCAD: 4900,
    icon: '🏡',
    type: 'mansion',
    desc: 'French-Victorian hand-carved stone estate with wine cellar, heated driveway, cedar sauna, and private gardens.',
    bedrooms: 5,
    bathrooms: 4,
  },
  {
    id: 'can_prop_calgary_foothills',
    title: 'Rocky Mountain Foothills Country Estate',
    city: 'Calgary',
    province: 'Alberta',
    neighborhood: 'Springbank / Bearspaw, Calgary',
    buyPriceCAD: 1950000,
    weeklyRentCAD: 3800,
    icon: '🌲',
    type: 'estate',
    desc: 'Sprawling 6-acre equestrian luxury estate with custom timber beams, heated indoor garage for 6 cars, and mountain vistas.',
    bedrooms: 5,
    bathrooms: 5,
  },
  {
    id: 'can_prop_ottawa_rockcliffe',
    title: 'Ambassadorial Manor in Rockcliffe Park',
    city: 'Ottawa',
    province: 'Ontario',
    neighborhood: 'Rockcliffe Park, National Capital Region',
    buyPriceCAD: 2900000,
    weeklyRentCAD: 5400,
    icon: '🏛️',
    type: 'estate',
    desc: 'Ultra-secure gated diplomatic estate walking distance from embassies, Rideau Hall, and private Ottawa academies.',
    bedrooms: 6,
    bathrooms: 5,
  },
  {
    id: 'can_prop_banff_chalet',
    title: 'Alpine Luxury Chalet & Hot Springs Spa',
    city: 'Banff',
    province: 'Alberta',
    neighborhood: 'Tunnel Mountain, Banff National Park',
    buyPriceCAD: 3200000,
    weeklyRentCAD: 6200,
    icon: '🏔️',
    type: 'chalet',
    desc: 'Ski-in ski-out Scandinavian cedar chalet surrounded by glaciers, outdoor heated hot springs plunge pool, and ski lodge.',
    bedrooms: 4,
    bathrooms: 3,
  },
];

// =========================================================================
// 2. CANADIAN CHOWDECK DELICACIES & FOOD (PRICED IN CAD)
// =========================================================================
export interface CanadianFoodItem {
  id: string;
  name: string;
  cityOrigin: string;
  costCAD: number;
  hungerBoost: number;
  joyBoost: number;
  icon: string;
  desc: string;
}

export const CANADA_FOOD_ITEMS: CanadianFoodItem[] = [
  {
    id: 'can_food_poutine',
    name: 'Authentic Quebecois Duck Confit Poutine',
    cityOrigin: 'Montreal, QC',
    costCAD: 24,
    hungerBoost: 55,
    joyBoost: 25,
    icon: '🍟',
    desc: 'Fresh cheese curds, twice-cooked Russet fries, rich duck demi-glace gravy, and braised duck shreds.',
  },
  {
    id: 'can_food_salmon',
    name: 'Wild Pacific Cedar-Plank Salmon & Truffle Mash',
    cityOrigin: 'Vancouver, BC',
    costCAD: 42,
    hungerBoost: 60,
    joyBoost: 30,
    icon: '🍣',
    desc: 'Fresh British Columbia wild sockeye salmon roasted on fragrant cedar with maple glaze and Yukon Gold potato purée.',
  },
  {
    id: 'can_food_alberta_beef',
    name: 'Prime Alberta AAA Bone-In Ribeye Steak (16oz)',
    cityOrigin: 'Calgary, AB',
    costCAD: 58,
    hungerBoost: 80,
    joyBoost: 40,
    icon: '🥩',
    desc: 'Charred over hickory coals, served with roasted garlic butter, asparagus spears, and smoked salt.',
  },
  {
    id: 'can_food_lobster_roll',
    name: 'Nova Scotia Butter-Poached Atlantic Lobster Roll',
    cityOrigin: 'Halifax, NS',
    costCAD: 36,
    hungerBoost: 50,
    joyBoost: 32,
    icon: '🦞',
    desc: 'Sweet claw and tail meat drenched in clarified brown butter inside a griddled brioche bun.',
  },
  {
    id: 'can_food_smoked_meat',
    name: 'Schwartz Style Smoked Meat & Kosher Dill Pickles',
    cityOrigin: 'Montreal, QC',
    costCAD: 22,
    hungerBoost: 48,
    joyBoost: 20,
    icon: '🥪',
    desc: '12-day cured beef brisket rubbed in coriander and black peppercorn, stacked high on caraway rye.',
  },
  {
    id: 'can_food_tim_hortons',
    name: 'Tim Hortons Double-Double & Timbits Box (20pk)',
    cityOrigin: 'Hamilton, ON',
    costCAD: 12,
    hungerBoost: 30,
    joyBoost: 18,
    icon: '☕',
    desc: 'Iconic Canadian drip coffee with two creams, two sugars, and an assorted box of glazed bite-sized donuts.',
  },
  {
    id: 'can_food_butter_tart',
    name: 'Ontario Hand-Crafted Pecan Butter Tarts (4pk)',
    cityOrigin: 'Midland, ON',
    costCAD: 14,
    hungerBoost: 28,
    joyBoost: 22,
    icon: '🥧',
    desc: 'Flaky pastry shells filled with runny brown sugar, pure maple syrup, toasted pecans, and churned butter.',
  },
  {
    id: 'can_food_maple_icecream',
    name: 'Quebec Pure Grade-A Maple Syrup Snow Toffee & Gelato',
    cityOrigin: 'Quebec City, QC',
    costCAD: 16,
    hungerBoost: 22,
    joyBoost: 25,
    icon: '🍨',
    desc: 'Boiled maple sap poured directly onto fresh mountain snow and spun on wooden paddle sticks.',
  },
];

// =========================================================================
// 3. CANADIAN SUPERMARKET GROCERIES (LOBLAWS / METRO)
// =========================================================================
export interface CanadianGroceryItem {
  id: string;
  name: string;
  priceCAD: number;
  unit: string;
  hungerRestore: number;
  icon: string;
  desc: string;
}

export const CANADA_GROCERIES: CanadianGroceryItem[] = [
  { id: 'can_groc_maple', name: '100% Pure Canadian Maple Syrup (Grade A Amber)', priceCAD: 14, unit: '500ml Bottle', hungerRestore: 15, icon: '🍁', desc: 'Harvested from Laurentian sugar shacks.' },
  { id: 'can_groc_milk_bag', name: 'Ontario 3-Pack Bagged 2% Whole Milk', priceCAD: 7, unit: '4 Litre Bag', hungerRestore: 20, icon: '🥛', desc: 'Traditional Canadian bagged milk jugs.' },
  { id: 'can_groc_kraft_dinner', name: 'Kraft Dinner (KD) Original Macaroni & Cheese (12pk)', priceCAD: 16, unit: '12-Box Bundle', hungerRestore: 45, icon: '🧀', desc: 'Canada unofficial national comfort pantry food.' },
  { id: 'can_groc_bacon', name: 'Peameal Cornmeal-Crusted Canadian Back Bacon', priceCAD: 11, unit: '750g Pack', hungerRestore: 35, icon: '🥓', desc: 'Lean pork loin rolled in ground yellow cornmeal.' },
  { id: 'can_groc_oats', name: 'Saskatchewan Steel-Cut Organic Golden Oats', priceCAD: 8, unit: '1.5 kg Tub', hungerRestore: 25, icon: '🌾', desc: 'Prairie-grown high fiber whole grain cereal.' },
  { id: 'can_groc_salmon_fillet', name: 'Fresh Atlantic Salmon Fillet Club Pack', priceCAD: 28, unit: '1 kg Fillet', hungerRestore: 50, icon: '🐟', desc: 'Rich in Omega-3 fatty acids, fresh from Saint John.' },
  { id: 'can_groc_apples', name: 'Okanagan Valley Crisp Honeycrisp Apples', priceCAD: 9, unit: '3 lb Bag', hungerRestore: 18, icon: '🍎', desc: 'Crisp, sweet mountain orchard apples.' },
  { id: 'can_groc_cheddar', name: 'Balderson 3-Year Aged Extra Old White Cheddar', priceCAD: 13, unit: '400g Block', hungerRestore: 30, icon: '🧀', desc: 'Sharp, crumbly artisan cheese made in Ontario.' },
];

// =========================================================================
// 4. CANADIAN JOBS (PAID IN CAD INTO CANADIAN BANK ACCOUNT)
// =========================================================================
export interface CanadianJobItem {
  id: string;
  title: string;
  employer: string;
  city: string;
  province: string;
  salaryCADWeekly: number;
  minEnergy: number;
  sector: 'Tech' | 'Finance' | 'Engineering' | 'Healthcare' | 'Aviation' | 'Hospitality';
  desc: string;
}

export const CANADA_JOBS: CanadianJobItem[] = [
  {
    id: 'can_job_shopify',
    title: 'Senior Cloud Platform Architect',
    employer: 'Shopify Canada Headquarters',
    city: 'Ottawa',
    province: 'Ontario',
    salaryCADWeekly: 2850,
    minEnergy: 18,
    sector: 'Tech',
    desc: 'Maintain planetary merchant checkout infrastructure scaling to millions of transactions per minute.',
  },
  {
    id: 'can_job_rbc',
    title: 'Quantitative Risk & Capital Markets Analyst',
    employer: 'Royal Bank of Canada (RBC Capital Markets)',
    city: 'Toronto',
    province: 'Ontario',
    salaryCADWeekly: 2450,
    minEnergy: 16,
    sector: 'Finance',
    desc: 'Model fixed income portfolios and cross-border currency derivatives on Bay Street.',
  },
  {
    id: 'can_job_nurse',
    title: 'Acute Care Specialized Registered Nurse',
    employer: 'Mount Sinai Hospital / University Health Network',
    city: 'Toronto',
    province: 'Ontario',
    salaryCADWeekly: 2200,
    minEnergy: 22,
    sector: 'Healthcare',
    desc: 'Deliver precision patient care in state-of-the-art Toronto intensive care and oncology wards.',
  },
  {
    id: 'can_job_oilsands',
    title: 'Heavy Equipment Maintenance Engineer',
    employer: 'Suncor Energy / Syncrude Canada',
    city: 'Fort McMurray',
    province: 'Alberta',
    salaryCADWeekly: 2600,
    minEnergy: 25,
    sector: 'Engineering',
    desc: 'Maintain 400-ton Caterpillar 797F ultra-class mining haul trucks in sub-zero Athabasca conditions.',
  },
  {
    id: 'can_job_air_canada',
    title: 'Transatlantic Flight Dispatcher & Operations Lead',
    employer: 'Air Canada Flight Operations',
    city: 'Dorval / Montreal',
    province: 'Quebec',
    salaryCADWeekly: 1950,
    minEnergy: 15,
    sector: 'Aviation',
    desc: 'Coordinate oceanic jet tracks, ETOPS fuel reserves, and de-icing schedules across North America.',
  },
  {
    id: 'can_job_tim_supervisor',
    title: 'Hospitality & Branch General Supervisor',
    employer: 'Tim Hortons Pacific District',
    city: 'Vancouver',
    province: 'British Columbia',
    salaryCADWeekly: 1100,
    minEnergy: 14,
    sector: 'Hospitality',
    desc: 'Manage inventory logistics, drive-thru throughput times, and shift customer service standards.',
  },
];

// =========================================================================
// 5. CANADIAN BUSINESSES & TSX INVESTMENTS (IN CAD)
// =========================================================================
export interface CanadianBusiness {
  id: string;
  name: string;
  city: string;
  costCAD: number;
  dailyProfitCAD: number;
  desc: string;
  icon: string;
}

export const CANADA_BUSINESSES: CanadianBusiness[] = [
  {
    id: 'can_biz_coffee',
    name: 'Specialty Roastery & Maple Cafe (Old Montreal)',
    city: 'Montreal, QC',
    costCAD: 185000,
    dailyProfitCAD: 920,
    desc: 'Artisan espresso and butter pastry cafe bustling with university students and European tourists.',
    icon: '☕',
  },
  {
    id: 'can_biz_tech_firm',
    name: 'Toronto AI FinTech Infrastructure Lab',
    city: 'Toronto, ON',
    costCAD: 450000,
    dailyProfitCAD: 2450,
    desc: 'Enterprise enterprise SaaS billing systems for Canadian financial institutions.',
    icon: '💻',
  },
  {
    id: 'can_biz_logistics',
    name: 'Trans-Canada Freight Haulage Fleet (Calgary Hub)',
    city: 'Calgary, AB',
    costCAD: 680000,
    dailyProfitCAD: 3800,
    desc: 'Fleet of 12 Peterbilt refrigerated tractor-trailers moving goods on the Trans-Canada Highway.',
    icon: '🚛',
  },
  {
    id: 'can_biz_salmon_farm',
    name: 'Pacific Coastal Aquaculture & Hatchery',
    city: 'Campbell River, BC',
    costCAD: 890000,
    dailyProfitCAD: 5200,
    desc: 'Ocean-enclosed sustainable organic king salmon pens exporting directly to Tokyo and Seattle.',
    icon: '🐟',
  },
];

// =========================================================================
// 6. CANADIAN ACADEMY COURSES (7 TO 13 LESSONS REQUIRING STUDY PERMIT)
// =========================================================================
export interface CanadianCourse {
  id: string;
  title: string;
  institution: string;
  city: string;
  province: string;
  feeCAD: number;
  lessonsCount: number;
  durationWeeks: string;
  happinessBonus: number;
  desc: string;
}

export const CANADA_COURSES: CanadianCourse[] = [
  {
    id: 'can_crs_uoft_ai',
    title: 'Advanced Machine Learning & Deep Neural Architecture',
    institution: 'University of Toronto (Vector Institute)',
    city: 'Toronto',
    province: 'Ontario',
    feeCAD: 3800,
    lessonsCount: 13,
    durationWeeks: '13 Weeks',
    happinessBonus: 35,
    desc: 'Study transformer architectures and generative agents in Canada premier AI research lab.',
  },
  {
    id: 'can_crs_mcgill_finance',
    title: 'Quantitative Derivatives & Asset Allocation',
    institution: 'McGill University (Desautels Faculty of Management)',
    city: 'Montreal',
    province: 'Quebec',
    feeCAD: 3200,
    lessonsCount: 12,
    durationWeeks: '12 Weeks',
    happinessBonus: 30,
    desc: 'Black-Scholes modeling, interest rate swaps, and pension risk hedge structuring.',
  },
  {
    id: 'can_crs_ubc_marine',
    title: 'Pacific Marine Ecosystems & Coastal Engineering',
    institution: 'University of British Columbia (UBC)',
    city: 'Vancouver',
    province: 'British Columbia',
    feeCAD: 2800,
    lessonsCount: 10,
    durationWeeks: '10 Weeks',
    happinessBonus: 28,
    desc: 'Deep tidal flow analysis, port dredging acoustics, and fjord preservation technology.',
  },
  {
    id: 'can_crs_waterloo_crypto',
    title: 'Zero-Knowledge Cryptography & Distributed Consensus',
    institution: 'University of Waterloo (David R. Cheriton School)',
    city: 'Waterloo',
    province: 'Ontario',
    feeCAD: 3400,
    lessonsCount: 11,
    durationWeeks: '11 Weeks',
    happinessBonus: 32,
    desc: 'ZK-SNARK proofs, distributed memory consensus algorithms, and fault-tolerant protocols.',
  },
  {
    id: 'can_crs_alberta_petro',
    title: 'Heavy Petroleum Subsurface Recovery & CCUS Clean Tech',
    institution: 'University of Alberta',
    city: 'Edmonton',
    province: 'Alberta',
    feeCAD: 2600,
    lessonsCount: 9,
    durationWeeks: '9 Weeks',
    happinessBonus: 25,
    desc: 'Advanced thermodynamic steam injection and underground carbon sequestration pipelines.',
  },
  {
    id: 'can_crs_ottawa_public_policy',
    title: 'International Bilateral Treaties & Aviation Governance',
    institution: 'University of Ottawa (Faculty of Law)',
    city: 'Ottawa',
    province: 'Ontario',
    feeCAD: 2200,
    lessonsCount: 8,
    durationWeeks: '8 Weeks',
    happinessBonus: 24,
    desc: 'Chicago Convention airspace sovereignty, trade corridors, and diplomatic protocols.',
  },
  {
    id: 'can_crs_humber_pilot',
    title: 'Transport Canada Commercial Instrument Flight Ratings',
    institution: 'Humber College Aviation Center',
    city: 'Toronto',
    province: 'Ontario',
    feeCAD: 4500,
    lessonsCount: 13,
    durationWeeks: '13 Weeks',
    happinessBonus: 40,
    desc: 'Level-D simulator multi-engine jet ratings, radar vectoring, and severe weather landings.',
  },
];

// =========================================================================
// 7. EXPANDED NAIJA BET SPORTS FIXTURES (10 LIVE MATCHES FOR EACH SPORT)
// =========================================================================
export interface SportFixture {
  id: string;
  sport: 'football' | 'basketball' | 'rugby' | 'tennis' | 'combat';
  league: string;
  home: string;
  away: string;
  time: string;
  hOdd: number;
  dOdd?: number;
  aOdd: number;
}

export const MULTI_SPORTS_FIXTURES: Record<string, SportFixture[]> = {
  football: [
    { id: 'fb_1', sport: 'football', league: 'Premier League', home: 'Arsenal FC', away: 'Chelsea FC', time: '17:30 WAT', hOdd: 1.95, dOdd: 3.50, aOdd: 3.60 },
    { id: 'fb_2', sport: 'football', league: 'NPFL Nigeria', home: 'Enyimba Aba', away: 'Remo Stars', time: '16:00 WAT', hOdd: 1.75, dOdd: 3.20, aOdd: 4.80 },
    { id: 'fb_3', sport: 'football', league: 'La Liga', home: 'Real Madrid', away: 'Barcelona', time: '20:00 WAT', hOdd: 2.10, dOdd: 3.60, aOdd: 3.05 },
    { id: 'fb_4', sport: 'football', league: 'Premier League', home: 'Man City', away: 'Liverpool', time: '18:30 WAT', hOdd: 2.05, dOdd: 3.70, aOdd: 3.25 },
    { id: 'fb_5', sport: 'football', league: 'AFCON Qualifiers', home: 'Super Eagles 🇳🇬', away: 'Black Stars Ghana 🇬🇭', time: '20:30 WAT', hOdd: 1.80, dOdd: 3.30, aOdd: 4.20 },
    { id: 'fb_6', sport: 'football', league: 'Bundesliga', home: 'Bayern Munich', away: 'Borussia Dortmund', time: '17:30 WAT', hOdd: 1.55, dOdd: 4.20, aOdd: 5.10 },
    { id: 'fb_7', sport: 'football', league: 'NPFL Nigeria', home: 'Kano Pillars', away: 'Rangers International', time: '16:00 WAT', hOdd: 1.85, dOdd: 3.10, aOdd: 4.40 },
    { id: 'fb_8', sport: 'football', league: 'Ligue 1', home: 'Paris Saint-Germain', away: 'Marseille', time: '20:45 WAT', hOdd: 1.50, dOdd: 4.40, aOdd: 5.80 },
    { id: 'fb_9', sport: 'football', league: 'Serie A', home: 'Inter Milan', away: 'AC Milan', time: '19:45 WAT', hOdd: 2.15, dOdd: 3.25, aOdd: 3.30 },
    { id: 'fb_10', sport: 'football', league: 'UEFA Champions League', home: 'Atletico Madrid', away: 'Juventus', time: '20:00 WAT', hOdd: 2.00, dOdd: 3.15, aOdd: 3.75 },
  ],
  basketball: [
    { id: 'bb_1', sport: 'basketball', league: 'NBA Championship', home: 'Boston Celtics', away: 'Los Angeles Lakers', time: '01:30 WAT', hOdd: 1.65, aOdd: 2.25 },
    { id: 'bb_2', sport: 'basketball', league: 'NBA Championship', home: 'Golden State Warriors', away: 'Denver Nuggets', time: '03:00 WAT', hOdd: 2.10, aOdd: 1.75 },
    { id: 'bb_3', sport: 'basketball', league: 'EuroLeague', home: 'Real Madrid Baloncesto', away: 'Panathinaikos', time: '19:45 WAT', hOdd: 1.80, aOdd: 2.00 },
    { id: 'bb_4', sport: 'basketball', league: 'BAL Africa', home: 'Rivers Hoopers 🇳🇬', away: 'US Monastir 🇹🇳', time: '17:00 WAT', hOdd: 1.90, aOdd: 1.90 },
    { id: 'bb_5', sport: 'basketball', league: 'NBA Championship', home: 'Milwaukee Bucks', away: 'Miami Heat', time: '02:00 WAT', hOdd: 1.70, aOdd: 2.15 },
    { id: 'bb_6', sport: 'basketball', league: 'NBA Championship', home: 'Dallas Mavericks', away: 'Phoenix Suns', time: '02:30 WAT', hOdd: 1.85, aOdd: 1.95 },
    { id: 'bb_7', sport: 'basketball', league: 'EuroLeague', home: 'Fenerbahce', away: 'Olympiacos', time: '18:30 WAT', hOdd: 1.72, aOdd: 2.10 },
    { id: 'bb_8', sport: 'basketball', league: 'BAL Africa', home: 'Al Ahly Ly 🇱🇾', away: 'Cape Town Tigers 🇿🇦', time: '15:30 WAT', hOdd: 1.60, aOdd: 2.30 },
    { id: 'bb_9', sport: 'basketball', league: 'NBA Championship', home: 'Philadelphia 76ers', away: 'New York Knicks', time: '00:30 WAT', hOdd: 1.95, aOdd: 1.85 },
    { id: 'bb_10', sport: 'basketball', league: 'NBA Championship', home: 'Minnesota Timberwolves', away: 'OKC Thunder', time: '03:30 WAT', hOdd: 2.05, aOdd: 1.78 },
  ],
  rugby: [
    { id: 'rg_1', sport: 'rugby', league: 'Six Nations Championship', home: 'England', away: 'Ireland', time: '16:45 WAT', hOdd: 2.40, dOdd: 19.0, aOdd: 1.55 },
    { id: 'rg_2', sport: 'rugby', league: 'Six Nations Championship', home: 'France', away: 'South Africa Springboks', time: '20:00 WAT', hOdd: 1.85, dOdd: 18.0, aOdd: 1.95 },
    { id: 'rg_3', sport: 'rugby', league: 'The Rugby Championship', home: 'New Zealand All Blacks', away: 'Australia Wallabies', time: '08:30 WAT', hOdd: 1.30, dOdd: 22.0, aOdd: 3.60 },
    { id: 'rg_4', sport: 'rugby', league: 'Premiership Rugby', home: 'Saracens', away: 'Leicester Tigers', time: '15:00 WAT', hOdd: 1.60, dOdd: 18.0, aOdd: 2.35 },
    { id: 'rg_5', sport: 'rugby', league: 'Top 14 France', home: 'Toulouse', away: 'La Rochelle', time: '20:05 WAT', hOdd: 1.50, dOdd: 19.0, aOdd: 2.60 },
    { id: 'rg_6', sport: 'rugby', league: 'United Rugby Champ', home: 'Leinster', away: 'Munster', time: '18:15 WAT', hOdd: 1.40, dOdd: 20.0, aOdd: 3.00 },
    { id: 'rg_7', sport: 'rugby', league: 'Super Rugby Pacific', home: 'Crusaders', away: 'Blues', time: '07:05 WAT', hOdd: 1.75, dOdd: 17.0, aOdd: 2.10 },
    { id: 'rg_8', sport: 'rugby', league: 'Super Rugby Pacific', home: 'Chiefs', away: 'Brumbies', time: '09:35 WAT', hOdd: 1.45, dOdd: 19.0, aOdd: 2.80 },
    { id: 'rg_9', sport: 'rugby', league: 'Currie Cup South Africa', home: 'Blue Bulls', away: 'Sharks', time: '16:00 WAT', hOdd: 1.70, dOdd: 18.0, aOdd: 2.20 },
    { id: 'rg_10', sport: 'rugby', league: 'Major League Rugby', home: 'New England Free Jacks', away: 'San Diego Legion', time: '22:00 WAT', hOdd: 1.80, dOdd: 18.0, aOdd: 2.05 },
  ],
  tennis: [
    { id: 'tn_1', sport: 'tennis', league: 'Wimbledon Grand Slam', home: 'Carlos Alcaraz', away: 'Novak Djokovic', time: '14:00 WAT', hOdd: 1.85, aOdd: 1.95 },
    { id: 'tn_2', sport: 'tennis', league: 'US Open Flushing Meadows', home: 'Jannik Sinner', away: 'Daniil Medvedev', time: '19:00 WAT', hOdd: 1.55, aOdd: 2.45 },
    { id: 'tn_3', sport: 'tennis', league: 'Roland Garros Final', home: 'Iga Swiatek', away: 'Aryna Sabalenka', time: '15:30 WAT', hOdd: 1.65, aOdd: 2.25 },
    { id: 'tn_4', sport: 'tennis', league: 'ATP Masters 1000', home: 'Alexander Zverev', away: 'Taylor Fritz', time: '17:00 WAT', hOdd: 1.75, aOdd: 2.10 },
    { id: 'tn_5', sport: 'tennis', league: 'WTA 1000 Tour', home: 'Coco Gauff', away: 'Elena Rybakina', time: '16:30 WAT', hOdd: 1.90, aOdd: 1.90 },
    { id: 'tn_6', sport: 'tennis', league: 'ATP Masters 1000', home: 'Stefanos Tsitsipas', away: 'Casper Ruud', time: '13:00 WAT', hOdd: 1.95, aOdd: 1.85 },
    { id: 'tn_7', sport: 'tennis', league: 'WTA 500 Tour', home: 'Jessica Pegula', away: 'Ons Jabeur', time: '18:00 WAT', hOdd: 1.70, aOdd: 2.15 },
    { id: 'tn_8', sport: 'tennis', league: 'ATP 500 Tour', home: 'Holger Rune', away: 'Hubert Hurkacz', time: '14:30 WAT', hOdd: 1.80, aOdd: 2.00 },
    { id: 'tn_9', sport: 'tennis', league: 'WTA Tour Finals', home: 'Qinwen Zheng', away: 'Barbora Krejcikova', time: '17:30 WAT', hOdd: 1.62, aOdd: 2.30 },
    { id: 'tn_10', sport: 'tennis', league: 'Australian Open Grand Slam', home: 'Alex de Minaur', away: 'Tommy Paul', time: '09:00 WAT', hOdd: 1.72, aOdd: 2.12 },
  ],
  combat: [
    { id: 'cb_1', sport: 'combat', league: 'Undisputed Heavyweight Boxing', home: 'Tyson Fury', away: 'Oleksandr Usyk', time: '22:30 WAT', hOdd: 1.90, dOdd: 15.0, aOdd: 1.90 },
    { id: 'cb_2', sport: 'combat', league: 'Heavyweight Boxing Championship', home: 'Anthony Joshua 🇳🇬', away: 'Deontay Wilder', time: '23:00 WAT', hOdd: 1.65, dOdd: 16.0, aOdd: 2.25 },
    { id: 'cb_3', sport: 'combat', league: 'UFC Middleweight Title', home: 'Israel Adesanya 🇳🇬', away: 'Dricus du Plessis', time: '04:00 WAT', hOdd: 1.75, aOdd: 2.10 },
    { id: 'cb_4', sport: 'combat', league: 'UFC Welterweight Championship', home: 'Kamaru Usman 🇳🇬', away: 'Leon Edwards', time: '04:30 WAT', hOdd: 1.80, aOdd: 2.05 },
    { id: 'cb_5', sport: 'combat', league: 'Light Heavyweight Boxing', home: 'Dmitry Bivol', away: 'Artur Beterbiev', time: '21:30 WAT', hOdd: 1.85, dOdd: 15.0, aOdd: 1.95 },
    { id: 'cb_6', sport: 'combat', league: 'Super Middleweight Boxing', home: 'Canelo Alvarez', away: 'David Benavidez', time: '03:30 WAT', hOdd: 1.70, dOdd: 16.0, aOdd: 2.15 },
    { id: 'cb_7', sport: 'combat', league: 'UFC Lightweight Championship', home: 'Islam Makhachev', away: 'Arman Tsarukyan', time: '05:00 WAT', hOdd: 1.35, aOdd: 3.20 },
    { id: 'cb_8', sport: 'combat', league: 'UFC Bantamweight Title', home: 'Sean O\'Malley', away: 'Merab Dvalishvili', time: '04:45 WAT', hOdd: 1.95, aOdd: 1.85 },
    { id: 'cb_9', sport: 'combat', league: 'Cruiserweight Title Boxing', home: 'Jai Opetaia', away: 'Mairis Briedis', time: '20:00 WAT', hOdd: 1.45, dOdd: 16.0, aOdd: 2.80 },
    { id: 'cb_10', sport: 'combat', league: 'UFC Heavyweight Title', home: 'Jon Jones', away: 'Stipe Miocic', time: '05:30 WAT', hOdd: 1.25, aOdd: 3.90 },
  ],
};
