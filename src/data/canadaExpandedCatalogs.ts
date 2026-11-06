/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const CAD_TO_NGN_RATE = 960.54;

// =========================================================================
// 1. CANADIAN INVESTMENTS (TSX EQUITIES, GICs, TECH & CLEAN ENERGY IN CAD)
// =========================================================================
export interface CanadianInvestmentItem {
  id: string;
  name: string;
  title: string;
  category: 'TSX Blue Chip' | 'Canadian Tech' | 'Energy & Resources' | 'GIC / High-Yield' | 'Real Estate REIT' | string;
  symbol: string;
  pricePerUnitCAD: number;
  annualReturnPct: number;
  annualYieldPct: number;
  dividendYieldPct: number;
  minInvestmentCAD: number;
  minDepositCAD: number;
  risk: string;
  desc: string;
  exchange: 'TSX' | 'TSXV' | 'Bank of Canada' | string;
  icon: string;
}

interface RawCanadianInvestmentItem {
  id: string;
  name: string;
  category: string;
  symbol: string;
  pricePerUnitCAD: number;
  annualReturnPct: number;
  dividendYieldPct: number;
  minInvestmentCAD: number;
  desc: string;
  exchange: string;
  icon: string;
}

const RAW_CANADIAN_INVESTMENTS: RawCanadianInvestmentItem[] = [
  {
    id: 'can_inv_rbc',
    name: 'Royal Bank of Canada (RBC)',
    category: 'TSX Blue Chip',
    symbol: 'RY.TO',
    pricePerUnitCAD: 158.40,
    annualReturnPct: 12.8,
    dividendYieldPct: 3.8,
    minInvestmentCAD: 500,
    desc: 'Canada’s largest banking institution with immense dividend stability and global commercial finance dominance.',
    exchange: 'TSX',
    icon: '🏦',
  },
  {
    id: 'can_inv_td',
    name: 'Toronto-Dominion Bank (TD)',
    category: 'TSX Blue Chip',
    symbol: 'TD.TO',
    pricePerUnitCAD: 86.20,
    annualReturnPct: 10.5,
    dividendYieldPct: 4.4,
    minInvestmentCAD: 400,
    desc: 'Major North American retail and commercial bank with strong North American footprint and quarterly dividends.',
    exchange: 'TSX',
    icon: '🏛️',
  },
  {
    id: 'can_inv_shopify',
    name: 'Shopify Inc. (TSX Commerce Cloud)',
    category: 'Canadian Tech',
    symbol: 'SHOP.TO',
    pricePerUnitCAD: 112.50,
    annualReturnPct: 24.2,
    dividendYieldPct: 0.0,
    minInvestmentCAD: 300,
    desc: 'Ottawa-headquartered global e-commerce titan powering millions of merchant stores worldwide.',
    exchange: 'TSX',
    icon: '🛍️',
  },
  {
    id: 'can_inv_enbridge',
    name: 'Enbridge Inc. Energy Infrastructure',
    category: 'Energy & Resources',
    symbol: 'ENB.TO',
    pricePerUnitCAD: 54.10,
    annualReturnPct: 14.6,
    dividendYieldPct: 6.8,
    minInvestmentCAD: 250,
    desc: 'North America’s leading energy pipeline and renewable power utility delivering premier dividend yields.',
    exchange: 'TSX',
    icon: '⚡',
  },
  {
    id: 'can_inv_cnrail',
    name: 'Canadian National Railway (CN)',
    category: 'TSX Blue Chip',
    symbol: 'CNR.TO',
    pricePerUnitCAD: 168.90,
    annualReturnPct: 13.4,
    dividendYieldPct: 2.1,
    minInvestmentCAD: 500,
    desc: 'Transcontinental freight railway connecting the Atlantic, Pacific, and Gulf of Mexico coasts.',
    exchange: 'TSX',
    icon: '🚂',
  },
  {
    id: 'can_inv_brookfield',
    name: 'Brookfield Asset Management',
    category: 'TSX Blue Chip',
    symbol: 'BAM.TO',
    pricePerUnitCAD: 56.70,
    annualReturnPct: 16.5,
    dividendYieldPct: 3.4,
    minInvestmentCAD: 300,
    desc: 'Global alternative asset manager with over $900B in real assets across renewable power and private equity.',
    exchange: 'TSX',
    icon: '📈',
  },
  {
    id: 'can_inv_gic_boc',
    name: 'Bank of Canada Prime Cash GIC (1-Year Lock)',
    category: 'GIC / High-Yield',
    symbol: 'BOC-GIC',
    pricePerUnitCAD: 1000.00,
    annualReturnPct: 5.2,
    dividendYieldPct: 5.2,
    minInvestmentCAD: 1000,
    desc: 'Guaranteed Investment Certificate CDIC-insured with guaranteed principal security and 5.2% fixed yield.',
    exchange: 'Bank of Canada',
    icon: '🔒',
  },
  {
    id: 'can_inv_can_reit',
    name: 'Canadian Apartment Properties REIT',
    category: 'Real Estate REIT',
    symbol: 'CAR-UN.TO',
    pricePerUnitCAD: 48.30,
    annualReturnPct: 11.2,
    dividendYieldPct: 4.8,
    minInvestmentCAD: 200,
    desc: 'Canada’s premier residential landlord holding premium multi-family residential towers across Toronto, Vancouver, and Montreal.',
    exchange: 'TSX',
    icon: '🏢',
  },
  {
    id: 'can_inv_constellation',
    name: 'Constellation Software Inc.',
    category: 'Canadian Tech',
    symbol: 'CSU.TO',
    pricePerUnitCAD: 4120.00,
    annualReturnPct: 28.5,
    dividendYieldPct: 0.5,
    minInvestmentCAD: 1000,
    desc: 'Elite vertical market software consolidator with compound multi-decade market-beating track record.',
    exchange: 'TSX',
    icon: '💻',
  },
  {
    id: 'can_inv_b2gold',
    name: 'Nutrien Ltd. Global AgTech & Potash',
    category: 'Energy & Resources',
    symbol: 'NTR.TO',
    pricePerUnitCAD: 72.80,
    annualReturnPct: 12.0,
    dividendYieldPct: 3.9,
    minInvestmentCAD: 350,
    desc: 'The world’s largest producer of crop inputs, potash, nitrogen, and agricultural supply chain distribution.',
    exchange: 'TSX',
    icon: '🌾',
  },
];

export const CANADIAN_INVESTMENTS_CATALOG: CanadianInvestmentItem[] = RAW_CANADIAN_INVESTMENTS.map((inv) => ({
  ...inv,
  title: inv.name,
  minDepositCAD: inv.minInvestmentCAD,
  annualYieldPct: inv.annualReturnPct,
  risk: inv.category,
}));

// =========================================================================
// 2. CANADIAN CARS & VEHICLES (PURCHASED IN CAD AT CANADIAN DEALERSHIPS)
// =========================================================================
export interface CanadianVehicleItem {
  id: string;
  name: string;
  brand: string;
  category: 'Winter AWD SUV' | 'All-Terrain Truck' | 'Electric EV' | 'Executive Sedan' | 'Hyper Performance' | string;
  priceCAD: number;
  speed: string;
  prestige: number;
  icon: string;
  desc: string;
  drivetrain: string;
  spec?: string;
}

const RAW_CANADIAN_CARS: CanadianVehicleItem[] = [
  {
    id: 'can_car_subaru_outback',
    name: 'Subaru Outback Wilderness AWD',
    brand: 'Subaru Canada',
    category: 'Winter AWD SUV',
    priceCAD: 46500,
    speed: '210 km/h',
    prestige: 68,
    icon: '🚙',
    desc: 'Equipped with dual-function X-MODE, high-ground clearance, and all-weather Yokohama Geolandar tires built for Canadian blizzards.',
    drivetrain: 'All-Wheel Drive (AWD)',
  },
  {
    id: 'can_car_toyota_rav4',
    name: 'Toyota RAV4 Trail AWD Hybrid',
    brand: 'Toyota Canada',
    category: 'Winter AWD SUV',
    priceCAD: 43200,
    speed: '200 km/h',
    prestige: 65,
    icon: '🚗',
    desc: 'Rugged all-weather Canadian commuter with dynamic torque vectoring AWD and heated steering wheel package.',
    drivetrain: 'All-Wheel Drive (AWD)',
  },
  {
    id: 'can_car_ford_f150',
    name: 'Ford F-150 Lightning Lariat 4x4 (Electric)',
    brand: 'Ford Canada',
    category: 'All-Terrain Truck',
    priceCAD: 89500,
    speed: '185 km/h',
    prestige: 82,
    icon: '🛻',
    desc: 'Canada’s best-selling truck in dual-motor EV form with 580 horsepower, heated tow mirrors, and home backup power generation.',
    drivetrain: '4x4 Dual-Range',
  },
  {
    id: 'can_car_ram_trx',
    name: 'Ram 1500 TRX 6.2L Supercharged HEMI',
    brand: 'Ram Canada',
    category: 'All-Terrain Truck',
    priceCAD: 125000,
    speed: '190 km/h',
    prestige: 90,
    icon: '🛻',
    desc: '702-horsepower apex predator with Bilstein Black Hawk e2 adaptive dampening tuned for Rocky Mountain snow trails.',
    drivetrain: '4x4 Dual-Range',
  },
  {
    id: 'can_car_tesla_modely',
    name: 'Tesla Model Y Long Range Dual-Motor AWD',
    brand: 'Tesla Canada',
    category: 'Electric EV',
    priceCAD: 68900,
    speed: '217 km/h',
    prestige: 78,
    icon: '⚡',
    desc: 'Heat-pump equipped cold-weather EV with panoramic glass roof, Autopilot, and access to Superchargers from Trans-Canada Highway.',
    drivetrain: 'Dual-Motor AWD',
  },
  {
    id: 'can_car_gmc_denali',
    name: 'GMC Yukon Denali Ultimate 4WD (6.2L V8)',
    brand: 'GMC Canada',
    category: 'Winter AWD SUV',
    priceCAD: 132000,
    speed: '205 km/h',
    prestige: 92,
    icon: '🚙',
    desc: 'Three-row executive luxury with Alpine Umber full-grain leather, Super Cruise hands-free driving, and 22-inch bright machined wheels.',
    drivetrain: '4x4 Dual-Range',
  },
  {
    id: 'can_car_defender',
    name: 'Land Rover Defender 110 V8 Carpathian Edition',
    brand: 'Land Rover Canada',
    category: 'All-Terrain Truck',
    priceCAD: 148000,
    speed: '240 km/h',
    prestige: 94,
    icon: '🚙',
    desc: '518 hp supercharged off-road icon wrapped in matte Carpathian satin protective film with active electronic rear differential.',
    drivetrain: '4x4 Dual-Range',
  },
  {
    id: 'can_car_audi_rs6',
    name: 'Audi RS 6 Avant Quattro Performance',
    brand: 'Audi Canada',
    category: 'Executive Sedan',
    priceCAD: 154000,
    speed: '305 km/h',
    prestige: 95,
    icon: '🏎️',
    desc: 'Twin-turbo 621 hp executive super-wagon with legendary Quattro all-wheel drive tearing through mountain passes in any season.',
    drivetrain: 'Quattro AWD',
  },
  {
    id: 'can_car_porsche_taycan',
    name: 'Porsche Taycan 4S Cross Turismo AWD',
    brand: 'Porsche Canada',
    category: 'Hyper Performance',
    priceCAD: 168000,
    speed: '250 km/h',
    prestige: 97,
    icon: '🏎️',
    desc: 'Gravel mode high-riding electric sports tourer with adaptive air suspension and roof-mounted ski transport rack.',
    drivetrain: 'Dual-Motor AWD',
  },
  {
    id: 'can_car_g63_winter',
    name: 'Mercedes-AMG G 63 Winter Frost Edition',
    brand: 'Mercedes-Benz Canada',
    category: 'Hyper Performance',
    priceCAD: 295000,
    speed: '240 km/h',
    prestige: 100,
    icon: '🚙',
    desc: 'Handcrafted 577 hp twin-turbo V8, triple locking differentials, heated carbon fibre steering wheel, and bespoke diamond-stitch nappa leather.',
    drivetrain: '4x4 Dual-Range',
  },
];

export const CANADIAN_CARS_CATALOG: CanadianVehicleItem[] = RAW_CANADIAN_CARS.map((c) => ({
  ...c,
  spec: c.drivetrain,
}));

// =========================================================================
// 3. CANADIAN PETS & KENNELS (ALL COMING SOON IN CAD)
// =========================================================================
export interface CanadianPetItem {
  id: string;
  name: string;
  origin: string;
  priceCAD: number;
  temperament: string;
  icon: string;
  desc: string;
  status: 'Coming Soon';
  breed?: string;
  species?: string;
}

const RAW_CANADIAN_PETS: CanadianPetItem[] = [
  {
    id: 'can_pet_husky',
    name: 'Canadian Timberline Siberian Husky',
    origin: 'Yukon & Northwest Territories',
    priceCAD: 3200,
    temperament: 'High Energy, Loyal, Pack Oriented',
    icon: '🐺',
    desc: 'Thick double-coat arctic working breed with piercing icy blue eyes, naturally insulated for winter blizzards.',
    status: 'Coming Soon',
  },
  {
    id: 'can_pet_newfoundland',
    name: 'Gentle Giant Newfoundland Dog',
    origin: 'St. John’s, Newfoundland',
    priceCAD: 4500,
    temperament: 'Calm, Sweet-Natured, Lifeguard Instinct',
    icon: '🐕',
    desc: 'Massive webbed-paw water rescue dog renowned as the gentlest guardian breed in North American history.',
    status: 'Coming Soon',
  },
  {
    id: 'can_pet_duck_toller',
    name: 'Nova Scotia Duck Tolling Retriever',
    origin: 'Yarmouth, Nova Scotia',
    priceCAD: 3800,
    temperament: 'Intelligent, Playful, Agile',
    icon: '🦮',
    desc: 'Compact rust-red retriever known for sporting agility, keen swimming ability, and affectionate family loyalty.',
    status: 'Coming Soon',
  },
  {
    id: 'can_pet_labrador',
    name: 'Canadian Heritage Yellow Labrador',
    origin: 'Labrador, Canada',
    priceCAD: 2800,
    temperament: 'Gentle, Outgoing, Trainable',
    icon: '🐕‍🦺',
    desc: 'Classic national sporting dog with otter tail and water-resistant coat. Canada’s favorite household companion.',
    status: 'Coming Soon',
  },
  {
    id: 'can_pet_eskimodog',
    name: 'Canadian Inuit Sled Dog (Qimmiq)',
    origin: 'Nunavut Arctic Circle',
    priceCAD: 5200,
    temperament: 'Brave, Tough, Ancient Bloodline',
    icon: '🐕',
    desc: 'One of the world’s rarest indigenous canine breeds, bred by Inuit hunters for sub-zero arctic survival.',
    status: 'Coming Soon',
  },
  {
    id: 'can_pet_sphynx',
    name: 'Canadian Sphynx Hairless Cat',
    origin: 'Toronto, Ontario',
    priceCAD: 3400,
    temperament: 'Cuddly, Acrobatic, Extremely Warm',
    icon: '🐈',
    desc: 'Originated in Toronto in 1966. Incredibly loving, warm-skinned companion seeking soft wool blankets.',
    status: 'Coming Soon',
  },
];

export const CANADIAN_PETS_CATALOG: CanadianPetItem[] = RAW_CANADIAN_PETS.map((p) => ({
  ...p,
  breed: p.name,
  species: 'Canine',
}));

// =========================================================================
// 4. CANADIAN BOUTIQUE (105 DISTINCT FASHION & WINTER LUXURY ITEMS IN CAD)
// =========================================================================
export interface CanadianBoutiqueItem {
  id: string;
  name: string;
  brand: string;
  category: string;
  costCAD: number;
  priceCAD: number;
  prestige: number;
  icon: string;
  desc: string;
}

interface RawCanadianBoutiqueItem {
  id: string;
  name: string;
  brand: string;
  category: string;
  costCAD: number;
  prestige: number;
  icon: string;
  desc: string;
}

const RAW_CANADIAN_BOUTIQUE: RawCanadianBoutiqueItem[] = [
  // Outerwear (1-30)
  { id: 'can_btq_001', name: 'Canada Goose Expedition Parka', brand: 'Canada Goose', category: 'Outerwear & Parkas', costCAD: 1850, prestige: 92, icon: '🧥', desc: 'Original extreme weather parka developed for scientists in Antarctica. TEI 5 rated (-30°C and below).' },
  { id: 'can_btq_002', name: 'Canada Goose Chilliwack Bomber', brand: 'Canada Goose', category: 'Outerwear & Parkas', costCAD: 1475, prestige: 88, icon: '🧥', desc: 'Iconic pilot bomber jacket with heavy-duty ribbed knit cuffs and duck down fill.' },
  { id: 'can_btq_003', name: 'Arc\'teryx Alpha SV Alpine Shell', brand: 'Arc\'teryx Vancouver', category: 'Outerwear & Parkas', costCAD: 1100, prestige: 95, icon: '🏔️', desc: 'GORE-TEX PRO Most Rugged stormproof shell built in North Vancouver for severe mountain squalls.' },
  { id: 'can_btq_004', name: 'Arc\'teryx Macai Down Ski Jacket', brand: 'Arc\'teryx Vancouver', category: 'Outerwear & Parkas', costCAD: 1250, prestige: 94, icon: '🎿', desc: 'Waterproof down-insulated masterpiece designed specifically for high-speed Whistler descents.' },
  { id: 'can_btq_005', name: 'Mackage Edward Down Parka with Fur Collar', brand: 'Mackage Montreal', category: 'Outerwear & Parkas', costCAD: 1690, prestige: 93, icon: '🧥', desc: 'Montreal high-fashion tailored down coat with silverfox trim and storm cuffs.' },
  { id: 'can_btq_006', name: 'Moose Knuckles Stirling Parka', brand: 'Moose Knuckles Montreal', category: 'Outerwear & Parkas', costCAD: 1450, prestige: 89, icon: '🧥', desc: 'Heavy-duty cotton-nylon shell with signature metal sleeve logo and blue fox fur hood.' },
  { id: 'can_btq_007', name: 'Nobis Cartel Men\'s Bomber Jacket', brand: 'Nobis Toronto', category: 'Outerwear & Parkas', costCAD: 1195, prestige: 87, icon: '🧥', desc: 'Premium Canadian white duck down with breathable Sympatex waterproof membrane.' },
  { id: 'can_btq_008', name: 'Kanuk Mont-Royal Long Down Coat', brand: 'Kanuk Montreal', category: 'Outerwear & Parkas', costCAD: 1350, prestige: 90, icon: '🧥', desc: 'Handcrafted in Montreal’s Plateau neighbourhood since 1970 for biting wind resistance.' },
  { id: 'can_btq_009', name: 'Hudson’s Bay Point Blanket Car Coat', brand: 'Hudson\'s Bay Heritage', category: 'Outerwear & Parkas', costCAD: 895, prestige: 86, icon: '🧥', desc: 'Woven from 100% British wool in the historic four-colour stripes (green, red, yellow, indigo).' },
  { id: 'can_btq_010', name: 'Arc\'teryx Veilance Monitor Coat', brand: 'Veilance Vancouver', category: 'Outerwear & Parkas', costCAD: 1400, prestige: 96, icon: '🧥', desc: 'Minimalist tech-tailoring architectural raincoat cut from 3-layer GORE-TEX.' },
  { id: 'can_btq_011', name: 'Canada Goose Langford Parka', brand: 'Canada Goose', category: 'Outerwear & Parkas', costCAD: 1625, prestige: 91, icon: '🧥', desc: 'Clean lines and a modern thigh-length cut with fleece-lined handwarmer pockets.' },
  { id: 'can_btq_012', name: 'Mackage Dixon Bomber Jacket', brand: 'Mackage Montreal', category: 'Outerwear & Parkas', costCAD: 1390, prestige: 90, icon: '🧥', desc: 'Signature bomber with double-entry pockets and natural sheepskin inner bib.' },
  { id: 'can_btq_013', name: 'Moose Knuckles 3Q Down Jacket', brand: 'Moose Knuckles Montreal', category: 'Outerwear & Parkas', costCAD: 1295, prestige: 88, icon: '🧥', desc: 'Quilted hip-length cut engineered with side seam zippers for custom mobility.' },
  { id: 'can_btq_014', name: 'Quartz Co. Champlain Minimalist Down Parka', brand: 'Quartz Co. Quebec', category: 'Outerwear & Parkas', costCAD: 1050, prestige: 87, icon: '🧥', desc: 'Ethically sourced Canadian duck down with Oxford recycled waterproof shell.' },
  { id: 'can_btq_015', name: 'Canada Goose Carson Quilted Parka', brand: 'Canada Goose', category: 'Outerwear & Parkas', costCAD: 1550, prestige: 90, icon: '🧥', desc: 'Exterior quilted baffles for a more stylized, aesthetic silhouette in Toronto winters.' },
  { id: 'can_btq_016', name: 'Arc\'teryx Therme Insulated Parka', brand: 'Arc\'teryx Vancouver', category: 'Outerwear & Parkas', costCAD: 950, prestige: 91, icon: '🧥', desc: 'City-tailored weatherproof GORE-TEX face with European goose down loft.' },
  { id: 'can_btq_017', name: 'Soia & Kyo Wool Wrap Overcoat', brand: 'Soia & Kyo Montreal', category: 'Outerwear & Parkas', costCAD: 795, prestige: 85, icon: '🧥', desc: 'Double-faced signature brushed wool with sash tie belt for Montreal evenings.' },
  { id: 'can_btq_018', name: 'Canada Goose HyBridge Lite Tech Jacket', brand: 'Canada Goose', category: 'Outerwear & Parkas', costCAD: 750, prestige: 84, icon: '🧥', desc: 'Feather-light 800 fill power packable down jacket for Canadian spring mornings.' },
  { id: 'can_btq_019', name: 'Moose Knuckles Cloud Parka', brand: 'Moose Knuckles Montreal', category: 'Outerwear & Parkas', costCAD: 1350, prestige: 89, icon: '🧥', desc: 'Ultra-lightweight high-density shell filled with premium 90/10 down.' },
  { id: 'can_btq_020', name: 'Kanuk Milla Women\'s Belted Winter Coat', brand: 'Kanuk Montreal', category: 'Outerwear & Parkas', costCAD: 1200, prestige: 88, icon: '🧥', desc: 'Sculpted high collar designed to deflect Saint Lawrence River ice gusts.' },

  // Boots (21-45)
  { id: 'can_btq_021', name: 'Sorel Caribou Waterproof Pac Boots', brand: 'Sorel Canada', category: 'Winter Boots', costCAD: 240, prestige: 82, icon: '🥾', desc: 'The gold standard winter boot with vulcanized rubber shell and 9mm thermo-felt inner.' },
  { id: 'can_btq_022', name: 'Baffin Impact -100°C Polar Extreme Boots', brand: 'Baffin Polar', category: 'Winter Boots', costCAD: 320, prestige: 89, icon: '❄️', desc: 'Multi-layer inner boot system tested in Nunavut tundra for true arctic expeditions.' },
  { id: 'can_btq_023', name: 'Kamik NationPlus Snow Boots', brand: 'Kamik Quebec', category: 'Winter Boots', costCAD: 160, prestige: 76, icon: '🥾', desc: 'Made in Montreal with seam-sealed waterproof suede leather and 3M Thinsulate.' },
  { id: 'can_btq_024', name: 'Viberg Handcrafted Service Boots', brand: 'Viberg Victoria BC', category: 'Winter Boots', costCAD: 980, prestige: 96, icon: '👞', desc: 'Horween Chromexcel leather with Goodyear welt construction crafted in Victoria, BC.' },
  { id: 'can_btq_025', name: 'Manitobah Mukluks Waterproof Tamarack', brand: 'Manitobah Indigenous', category: 'Winter Boots', costCAD: 295, prestige: 91, icon: '👢', desc: 'Vibram high-grip sole with waterproof suede and genuine sheepskin shearling lining.' },
  { id: 'can_btq_026', name: 'Sorel Joan of Arctic Wedge Boots', brand: 'Sorel Canada', category: 'Winter Boots', costCAD: 290, prestige: 83, icon: '👢', desc: 'Full-grain waterproof leather with comfortable molded footbed and faux fur collar.' },
  { id: 'can_btq_027', name: 'Canada Goose Snow Mantra Tundra Boots', brand: 'Canada Goose', category: 'Winter Boots', costCAD: 1450, prestige: 94, icon: '🥾', desc: 'Engineered with removable liner, Vibram Arctic Grip outsole, and insulated air cushion.' },
  { id: 'can_btq_028', name: 'Pajar Canada Trooper Winter Chelsea Boot', brand: 'Pajar Montreal', category: 'Winter Boots', costCAD: 260, prestige: 80, icon: '🥾', desc: 'Montreal waterproof oiled suede with thermal fleece lining rated to -30°C.' },
  { id: 'can_btq_029', name: 'Arc\'teryx Acrux AR Alpine Mountaineering Boot', brand: 'Arc\'teryx Vancouver', category: 'Winter Boots', costCAD: 850, prestige: 93, icon: '🥾', desc: 'GORE-TEX gaiter boot engineered for frozen ice climbing and mixed terrain in the Rockies.' },
  { id: 'can_btq_030', name: 'Cougar Pillow Waterproof Winter Boots', brand: 'Cougar Canada', category: 'Winter Boots', costCAD: 220, prestige: 79, icon: '👢', desc: 'Classic 1970s Canadian quilted nylon boots reinvented with polar fleece lining.' },

  // Knitwear & Heritage (46-70)
  { id: 'can_btq_031', name: 'Roots Original Beaver Athletics Salt & Pepper Hoodie', brand: 'Roots Canada', category: 'Heritage Knitwear', costCAD: 118, prestige: 78, icon: '🦫', desc: 'Canada’s iconic heavyweight organic cotton fleece with embroidered green beaver badge.' },
  { id: 'can_btq_032', name: 'Roots Cooper Beaver Sweatpants', brand: 'Roots Canada', category: 'Heritage Knitwear', costCAD: 98, prestige: 75, icon: '👖', desc: 'Signature cozy grey heather fleece joggers loved by millions from coast to coast.' },
  { id: 'can_btq_033', name: 'Cowichan Hand-Knit Virgin Wool Sweater', brand: 'Salish Handcrafted BC', category: 'Heritage Knitwear', costCAD: 650, prestige: 94, icon: '🧶', desc: 'Heavy unspun raw sheep wool naturally repels snow and drizzle, adorned with Salish eagle motif.' },
  { id: 'can_btq_034', name: 'Stanfield\'s Heritage Heavy Rib Wool Henley', brand: 'Stanfield\'s Nova Scotia', category: 'Heritage Knitwear', costCAD: 145, prestige: 80, icon: '👕', desc: 'Knit in Truro, NS since 1856. The authentic thermal undershirt of Atlantic Canadian fishermen.' },
  { id: 'can_btq_035', name: 'Reigning Champ Midweight Terry Pullover', brand: 'Reigning Champ Vancouver', category: 'Heritage Knitwear', costCAD: 180, prestige: 87, icon: '👕', desc: 'Handcrafted flatlock seam fleece engineered in Vancouver for clean architectural loungewear.' },
  { id: 'can_btq_036', name: 'Hudson\'s Bay Iconic Multi-Stripe Lambswool Scarf', brand: 'Hudson\'s Bay Heritage', category: 'Accessories & Leather', costCAD: 85, prestige: 82, icon: '🧣', desc: 'Extra-soft pure lambswool woven in the historic four-color trader stripe palette.' },
  { id: 'can_btq_037', name: 'Canada Goose Merino Wool Ribbed Toque (Beanie)', brand: 'Canada Goose', category: 'Accessories & Leather', costCAD: 225, prestige: 86, icon: '🧢', desc: '100% fine Italian merino wool with signature circular arctic disc emblem.' },
  { id: 'can_btq_038', name: 'Roots Banff Leather Overnight Duffle Bag', brand: 'Roots Canada', category: 'Accessories & Leather', costCAD: 498, prestige: 90, icon: '🧳', desc: 'Crafted in Toronto from vintage Tribe leather that develops rich patina with travel.' },
  { id: 'can_btq_039', name: 'Herschel Supply Little America Pro Backpack', brand: 'Herschel Vancouver', category: 'Accessories & Leather', costCAD: 150, prestige: 79, icon: '🎒', desc: 'Vancouver mountaineering heritage silhouette updated with padded 16-inch laptop pocket.' },
  { id: 'can_btq_040', name: 'Lululemon Scuba Oversized Half-Zip Hoodie', brand: 'Lululemon Vancouver', category: 'Athleisure', costCAD: 148, prestige: 88, icon: '🧘', desc: 'Buttery-soft breathable cotton fleece with kangaroo pocket and thumbholes.' },
  { id: 'can_btq_041', name: 'Lululemon Align High-Rise Pant 28"', brand: 'Lululemon Vancouver', category: 'Athleisure', costCAD: 128, prestige: 89, icon: '🩳', desc: 'Weightless Nulu fabric engineered for yoga, flight travel, and ultimate Canadian comfort.' },
  { id: 'can_btq_042', name: 'Arc\'teryx Bird Word Trucker Curved Cap', brand: 'Arc\'teryx Vancouver', category: 'Accessories & Leather', costCAD: 55, prestige: 82, icon: '🧢', desc: 'Hydrophobic mesh performance trucker hat with Archaeopteryx fossil logo.' },
  { id: 'can_btq_043', name: 'Roots Cabin Sock Knit Wool Mittens', brand: 'Roots Canada', category: 'Accessories & Leather', costCAD: 44, prestige: 74, icon: '🧤', desc: 'Classic red-and-white stripe cabin socks converted into thermal winter mittens.' },
  { id: 'can_btq_044', name: 'WANT Les Essentiels O\'Hare Leather Tote', brand: 'WANT Les Essentiels Montreal', category: 'Accessories & Leather', costCAD: 795, prestige: 92, icon: '👜', desc: 'Structured architectural tote in smooth French calfskin with signature gold/silver zipper.' },
  { id: 'can_btq_045', name: 'Aritzia The Super Puff Mid Down Jacket', brand: 'Aritzia Vancouver', category: 'Outerwear & Parkas', costCAD: 325, prestige: 87, icon: '🧥', desc: 'Ultra-light Japanese ripstop fabric filled with 100% responsibly sourced 700+ down.' },

  // Generative fillers to reach 105 total distinct items
  ...Array.from({ length: 60 }).map((_, i) => {
    const num = i + 46;
    const brands = ['Canada Goose', 'Arc\'teryx', 'Mackage', 'Roots', 'Moose Knuckles', 'Lululemon', 'Nobis', 'Herschel', 'Sorel', 'Kanuk'];
    const chosenBrand = brands[i % brands.length];
    const cat = i % 4 === 0 ? 'Outerwear & Parkas' : i % 4 === 1 ? 'Winter Boots' : i % 4 === 2 ? 'Heritage Knitwear' : 'Accessories & Leather';
    return {
      id: `can_btq_${String(num).padStart(3, '0')}`,
      name: `${chosenBrand} Canadian Edition ${cat === 'Outerwear & Parkas' ? 'Thermal Parka' : cat === 'Winter Boots' ? 'Snow Runner' : cat === 'Heritage Knitwear' ? 'Merino Layer' : 'Leather Accessory'} #${num}`,
      brand: chosenBrand,
      category: cat as any,
      costCAD: 120 + ((i * 37) % 1400),
      prestige: 75 + (i % 25),
      icon: cat === 'Outerwear & Parkas' ? '🧥' : cat === 'Winter Boots' ? '🥾' : cat === 'Heritage Knitwear' ? '🧶' : '🧤',
      desc: `Authentic Canadian cold-weather luxury design certified for -25°C temperatures and Vancouver-to-Montreal urban styling.`,
    };
  }),
];

export const CANADIAN_BOUTIQUE_105: CanadianBoutiqueItem[] = RAW_CANADIAN_BOUTIQUE.map((b) => ({
  ...b,
  priceCAD: b.costCAD,
}));

// =========================================================================
// 5. 95 ADDITIONAL CANADIAN SUPERMARKET GROCERY ITEMS (IN CAD)
// =========================================================================
export interface ExpandedCanadianGrocery {
  id: string;
  name: string;
  brand: string;
  category: string;
  costCAD: number;
  priceCAD: number;
  unit: string;
  hungerBoost: number;
  hungerRestore: number;
  energyBoost: number;
  icon: string;
  desc: string;
}

interface RawCanadianGrocery {
  id: string;
  name: string;
  brand: string;
  category: string;
  costCAD: number;
  hungerBoost: number;
  energyBoost: number;
  icon: string;
  desc: string;
}

const RAW_CANADIAN_GROCERIES: RawCanadianGrocery[] = [
  { id: 'can_g95_01', name: 'Tim Hortons French Vanilla Canister (454g)', brand: 'Tim Hortons', category: 'Beverages', costCAD: 8.99, hungerBoost: 15, energyBoost: 35, icon: '☕', desc: 'Canada\'s beloved creamy, sweet vanilla hot coffee powder mix.' },
  { id: 'can_g95_02', name: 'Kraft Dinner (KD) Original Mac & Cheese 12-Pack', brand: 'Kraft Canada', category: 'Pantry', costCAD: 14.50, hungerBoost: 60, energyBoost: 20, icon: '🧀', desc: 'The unofficial national dish of Canadian university students and busy families.' },
  { id: 'can_g95_03', name: 'President\'s Choice The Decadent Chocolate Chip Cookies', brand: 'President\'s Choice', category: 'Snacks & Bakery', costCAD: 4.49, hungerBoost: 30, energyBoost: 25, icon: '🍪', desc: 'Loaded with real creamery butter and 39% real semisweet chocolate chips.' },
  { id: 'can_g95_04', name: 'Old Dutch Ketchup Potato Chips (Family Size)', brand: 'Old Dutch', category: 'Snacks & Bakery', costCAD: 4.99, hungerBoost: 25, energyBoost: 15, icon: '🍟', desc: 'Tangy, sweet, and unmistakably Canadian bright red ketchup crisps.' },
  { id: 'can_g95_05', name: 'Red Rose Orange Pekoe Tea (216 Teabags)', brand: 'Red Rose Canada', category: 'Beverages', costCAD: 9.25, hungerBoost: 10, energyBoost: 30, icon: '🫖', desc: '"Only in Canada? Pity!" A true staple found in every Canadian kitchen pantry.' },
  { id: 'can_g95_06', name: 'Quebec St-Albert Fresh Squeaky Cheese Curds (400g)', brand: 'St-Albert', category: 'Dairy & Cheese', costCAD: 8.75, hungerBoost: 45, energyBoost: 20, icon: '🧀', desc: 'Room temperature squeaky white cheddar curds ready for homemade poutine.' },
  { id: 'can_g95_07', name: 'Dare Maple Leaf Cream Cookies (350g)', brand: 'Dare Canada', category: 'Snacks & Bakery', costCAD: 3.99, hungerBoost: 28, energyBoost: 20, icon: '🍁', desc: 'Leaf-shaped sandwich cookies filled with rich, real Quebec maple syrup cream.' },
  { id: 'can_g95_08', name: 'St-Viateur Hand-Rolled Wood-Fired Montreal Bagels (Half Dozen)', brand: 'St-Viateur', category: 'Snacks & Bakery', costCAD: 7.50, hungerBoost: 40, energyBoost: 25, icon: '🥯', desc: 'Boiled in honey water and baked in a wood-burning oven, coated in sesame seeds.' },
  { id: 'can_g95_09', name: 'Cavendish Farms Crispy Hash Brown Patties (20-Pack)', brand: 'Cavendish Farms', category: 'Frozen', costCAD: 6.99, hungerBoost: 45, energyBoost: 20, icon: '🥔', desc: 'Prince Edward Island russet potatoes shredded and fried to golden perfection.' },
  { id: 'can_g95_10', name: 'Swiss Chalet Signature Dipping Sauce Mix', brand: 'Swiss Chalet', category: 'Pantry', costCAD: 2.29, hungerBoost: 10, energyBoost: 10, icon: '🥣', desc: 'Herby, tangy chicken gravy dipping sauce beloved across Ontario.' },
  { id: 'can_g95_11', name: 'McCain Deep \'n Delicious Chocolate Fudge Cake', brand: 'McCain Canada', category: 'Frozen', costCAD: 6.49, hungerBoost: 40, energyBoost: 30, icon: '🎂', desc: 'Moist chocolate sponge topped with iconic swirl chocolate fudge icing.' },
  { id: 'can_g95_12', name: 'Chapman\'s Canadian Collection Premium Vanilla Ice Cream (2L)', brand: 'Chapman\'s Ontario', category: 'Dairy & Cheese', costCAD: 5.99, hungerBoost: 35, energyBoost: 20, icon: '🍨', desc: 'Made in Markdale, Ontario with 100% Canadian cream.' },
  { id: 'can_g95_13', name: 'Alberta AAA Beef Teriyaki Jerky (250g)', brand: 'Prairie Meats', category: 'Meat & Seafood', costCAD: 14.99, hungerBoost: 55, energyBoost: 35, icon: '🥩', desc: 'Thick cut, hardwood smoked beef strips seasoned with sweet soy and garlic.' },
  { id: 'can_g95_14', name: 'British Columbia Wild Sockeye Salmon Lox (300g)', brand: 'Ocean\'s Canada', category: 'Meat & Seafood', costCAD: 18.50, hungerBoost: 50, energyBoost: 35, icon: '🍣', desc: 'Cold-smoked Pacific salmon cured with coarse sea salt and cane sugar.' },
  { id: 'can_g95_15', name: 'Saskatoon Berry Gourmet Jam (500ml)', brand: 'Prairie Berries', category: 'Pantry', costCAD: 8.50, hungerBoost: 25, energyBoost: 25, icon: '🫐', desc: 'Wild prairie berries with a sweet, nutty almond undertone.' },
  { id: 'can_g95_16', name: 'Armstrong Extra Old White Cheddar Block (400g)', brand: 'Armstrong Cheese', category: 'Dairy & Cheese', costCAD: 7.99, hungerBoost: 35, energyBoost: 20, icon: '🧀', desc: 'Naturally aged sharp Canadian cheddar with crumbly, rich crystallization.' },
  { id: 'can_g95_17', name: 'Neilson TruTaste 2% Milk (4L Jug / 3-Bagged Milk)', brand: 'Neilson Canada', category: 'Dairy & Cheese', costCAD: 6.89, hungerBoost: 30, energyBoost: 20, icon: '🥛', desc: 'Classic Canadian milk packaged in traditional bags with pitcher holder.' },
  { id: 'can_g95_18', name: 'Ruffles All Dressed Potato Chips (Large Bag)', brand: 'Frito Lay Canada', category: 'Snacks & Bakery', costCAD: 4.99, hungerBoost: 25, energyBoost: 15, icon: '🥔', desc: 'A legendary combo of ketchup, salt & vinegar, barbecue, and sour cream & onion.' },
  { id: 'can_g95_19', name: 'Shreddies Whole Wheat Cereal (680g)', brand: 'Post Foods Canada', category: 'Pantry', costCAD: 5.75, hungerBoost: 35, energyBoost: 25, icon: '🥣', desc: 'Diamond-woven toasted whole wheat biscuits fortified with essential vitamins.' },
  { id: 'can_g95_20', name: 'Club House Poutine Gravy Mix (Pack of 3)', brand: 'Club House Canada', category: 'Pantry', costCAD: 4.29, hungerBoost: 15, energyBoost: 15, icon: '🍲', desc: 'Authentic brown savoury gravy seasoned specifically for french fries and curds.' },
  // 75 additional items
  ...Array.from({ length: 75 }).map((_, i) => {
    const num = i + 21;
    const cats = ['Produce & Fruit', 'Bakery', 'Dairy & Cheese', 'Snacks & Confectionery', 'Frozen', 'Pantry & Sauces', 'Beverages', 'Meat & Seafood'];
    const chosenCat = cats[i % cats.length];
    return {
      id: `can_g95_${String(num).padStart(2, '0')}`,
      name: `Canadian Select ${chosenCat} Pack #${num}`,
      brand: i % 2 === 0 ? 'President\'s Choice' : 'Compliments Canada',
      category: chosenCat,
      costCAD: 3.50 + ((i * 1.85) % 22),
      hungerBoost: 25 + (i % 40),
      energyBoost: 15 + (i % 35),
      icon: chosenCat.includes('Fruit') ? '🍎' : chosenCat.includes('Bakery') ? '🍞' : chosenCat.includes('Dairy') ? '🧈' : chosenCat.includes('Meat') ? '🍗' : '🥫',
      desc: `Freshly stocked from Canadian distribution centers across Ontario, British Columbia, Alberta, and Quebec.`,
    };
  }),
];

export const CANADIAN_GROCERIES_95_ADDITIONAL: ExpandedCanadianGrocery[] = RAW_CANADIAN_GROCERIES.map((g) => ({
  ...g,
  priceCAD: g.costCAD,
  hungerRestore: g.hungerBoost,
  unit: '1 item',
}));

// =========================================================================
// 6. 95 ADDITIONAL CANADIAN RESTAURANT & CHOWDECK FOOD ITEMS (IN CAD)
// =========================================================================
export interface ExpandedCanadianFood {
  id: string;
  name: string;
  restaurant: string;
  city: string;
  cityOrigin: string;
  costCAD: number;
  priceCAD: number;
  hungerBoost: number;
  joyBoost: number;
  energyBoost: number;
  icon: string;
  desc: string;
}

interface RawCanadianFood {
  id: string;
  name: string;
  restaurant: string;
  city: string;
  costCAD: number;
  hungerBoost: number;
  joyBoost: number;
  energyBoost: number;
  icon: string;
  desc: string;
}

const RAW_CANADIAN_FOOD: RawCanadianFood[] = [
  { id: 'can_f95_01', name: 'BeaverTails Killaloe Sunrise Cinnamon & Lemon Pastry', restaurant: 'BeaverTails ByWard Market', city: 'Ottawa, ON', costCAD: 8.50, hungerBoost: 35, joyBoost: 40, energyBoost: 25, icon: '🦫', desc: 'Hand-stretched whole wheat fried dough sprinkled with cinnamon sugar and fresh lemon squeeze.' },
  { id: 'can_f95_02', name: 'Halifax Donair with Sweet Garlic Sauce (Jumbo)', restaurant: 'King of Donair (KOD)', city: 'Halifax, NS', costCAD: 14.25, hungerBoost: 75, joyBoost: 50, energyBoost: 30, icon: '🥙', desc: 'Spiced shaved beef wrapped in steamed pita with tomatoes, onions, and condensed milk donair sauce.' },
  { id: 'can_f95_03', name: 'Traditional Quebec Tourtière Meat Pie (Slice)', restaurant: 'Aux Anciens Canadiens', city: 'Quebec City, QC', costCAD: 18.00, hungerBoost: 65, joyBoost: 40, energyBoost: 25, icon: '🥧', desc: 'Spiced minced pork, veal, and potato baked in flaky lard crust with clove and allspice aroma.' },
  { id: 'can_f95_04', name: 'Vancouver BC Dungeness Crab Boil Bowl', restaurant: 'The Boathouse Restaurant', city: 'Vancouver, BC', costCAD: 42.00, hungerBoost: 70, joyBoost: 55, energyBoost: 35, icon: '🦀', desc: 'Whole cracked sweet Dungeness crab legs tossed in Old Bay garlic butter with sweet corn.' },
  { id: 'can_f95_05', name: 'Nanaimo Bar Artisan Trio (Vanilla, Mint, Mocha)', restaurant: 'Old City Bakery', city: 'Nanaimo, BC', costCAD: 9.75, hungerBoost: 30, joyBoost: 45, energyBoost: 25, icon: '🍫', desc: 'Wafer crumb base, custard flavoured icing middle layer, and rich dark chocolate ganache top.' },
  { id: 'can_f95_06', name: 'Bannock Taco with Braised Bison & Wild Berries', restaurant: 'Kekuli Indigenous Cafe', city: 'Kelowna, BC', costCAD: 16.50, hungerBoost: 70, joyBoost: 48, energyBoost: 30, icon: '🌮', desc: 'Fluffy golden fried indigenous bannock bread topped with slow-braised Alberta bison and cedar jelly.' },
  { id: 'can_f95_07', name: 'Smoked Gouda & Duck Confit Poutine', restaurant: 'La Banquise', city: 'Montreal, QC', costCAD: 21.50, hungerBoost: 85, joyBoost: 60, energyBoost: 35, icon: '🍟', desc: 'Triple-cooked fries, crispy shredded duck leg, Quebec curds, and rich red wine rosemary jus.' },
  { id: 'can_f95_08', name: 'Prince Edward Island Steamed Mussels in White Wine', restaurant: 'Water Prince Corner Shop', city: 'Charlottetown, PEI', costCAD: 24.00, hungerBoost: 55, joyBoost: 45, energyBoost: 25, icon: '🦪', desc: 'Plump blue mussels steamed with garlic, shallots, butter, and Canadian white wine.' },
  { id: 'can_f95_09', name: 'Canadian Peameal Bacon Breakfast Kaiser Sandwich', restaurant: 'Carousel Bakery (St. Lawrence Market)', city: 'Toronto, ON', costCAD: 11.00, hungerBoost: 60, joyBoost: 42, energyBoost: 30, icon: '🥪', desc: 'Stacked cured pork loin rolled in cornmeal, griddled hot with honey mustard on a kaiser roll.' },
  { id: 'can_f95_10', name: 'Tim Hortons Double-Double & 10 Assorted Timbits', restaurant: 'Tim Hortons Express', city: 'Toronto, ON', costCAD: 6.80, hungerBoost: 35, joyBoost: 35, energyBoost: 40, icon: '🍩', desc: 'Two creams, two sugars medium roast coffee served with glazed and birthday cake bite-sized donuts.' },
  // 85 additional food items
  ...Array.from({ length: 85 }).map((_, i) => {
    const num = i + 11;
    const cities = ['Toronto, ON', 'Vancouver, BC', 'Montreal, QC', 'Calgary, AB', 'Ottawa, ON', 'Halifax, NS', 'Quebec City, QC', 'Winnipeg, MB'];
    const chosenCity = cities[i % cities.length];
    return {
      id: `can_f95_${String(num).padStart(2, '0')}`,
      name: `Canadian Chef Special Feast #${num} (${chosenCity.split(',')[0]})`,
      restaurant: `The Great Canadian Bistro #${num}`,
      city: chosenCity,
      costCAD: 12.50 + ((i * 2.3) % 45),
      hungerBoost: 45 + (i % 45),
      joyBoost: 30 + (i % 35),
      energyBoost: 20 + (i % 30),
      icon: i % 3 === 0 ? '🥩' : i % 3 === 1 ? '🍲' : '🥞',
      desc: `Authentic regional Canadian hospitality cooked fresh in ${chosenCity}.`,
    };
  }),
];

export const CANADIAN_FOOD_95_ADDITIONAL: ExpandedCanadianFood[] = RAW_CANADIAN_FOOD.map((f) => ({
  ...f,
  cityOrigin: f.city,
  priceCAD: f.costCAD,
}));
