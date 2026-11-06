/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PropertyAsset } from '../types/game';

export interface BusinessItem {
  typeId: string;
  name: string;
  stateId: string;
  stateName: string;
  icon: string;
  costNGN: number;
  dailyProfitNGN: number;
  desc: string;
}

export interface JobItem {
  id: string;
  title: string;
  company: string;
  stateId: string;
  stateName: string;
  salaryNGN: number;
  minEnergy: number;
  sector: 'tech' | 'corporate' | 'healthcare' | 'oil_gas' | 'commerce' | 'creative' | 'civil' | 'trades';
  desc: string;
}

export interface FoodItem {
  id: string;
  name: string;
  category: 'Rice & Combos' | 'Swallows & Soups' | 'Suya & Grills' | 'Street Bites & Pastries' | 'Chilled Drinks';
  stateOrigin: string;
  cost: number;
  hunger: number;
  joy: number;
  icon: string;
  desc: string;
}

export interface CourseItem {
  id: string;
  title: string;
  category: 'Technology' | 'Finance & Business' | 'Aviation & Marine' | 'Healthcare' | 'Creative Arts' | 'Law & Public Policy' | 'Trades';
  certificateName: string;
  certificateCode: string;
  fee: number;
  duration: string;
  happinessBoost: number;
  institution: string;
  desc: string;
}

export interface BoutiqueItem {
  id: string;
  name: string;
  category: 'Royal Agbada' | 'Senator Suits' | 'Ankara & Lace' | 'Streetwear' | 'Watches & Jewelry' | 'Luxury Footwear' | 'Accessories';
  stateOrigin: string;
  price: number;
  prestige: 'Standard' | 'High' | 'Very High' | 'VIP Royalty' | 'Billionaire';
  icon: string;
  desc: string;
}

import { EXPANDED_STATE_BUSINESSES, EXPANDED_STATE_JOBS, EXPANDED_STATE_HOUSES } from './expandedStateCatalogs';
import { ADDITIONAL_50_FOOD, ADDITIONAL_70_COURSES } from './additionalFoodAndCourses';

// 70 Businesses per state (Lagos, Abuja, Imo, Rivers, Kano) = 350 businesses
export const EXPANDED_BUSINESSES: BusinessItem[] = EXPANDED_STATE_BUSINESSES;

// 70 Jobs per state (Lagos, Abuja, Imo, Rivers, Kano) = 350 jobs
// Realistic entry-level starting salaries (~₦20,000 - ₦35,000 / week) with promotion potential
export const EXPANDED_JOBS: JobItem[] = EXPANDED_STATE_JOBS.map((j, idx) => {
  let startingWeekly = 28000;
  if (j.sector === 'tech') startingWeekly = 32000;
  else if (j.sector === 'corporate') startingWeekly = 30000;
  else if (j.sector === 'oil_gas') startingWeekly = 35000;
  else if (j.sector === 'healthcare') startingWeekly = 33000;
  else if (j.sector === 'creative') startingWeekly = 25000;
  else startingWeekly = 20000 + ((idx * 839) % 15000); // 20,000 to 35,000

  // Strip senior titles so player starts at low rank
  const cleanTitle = j.title.replace(/Chief |Senior |Director |Lead |Head of |Principal /gi, 'Junior ');
  const normalizedTitle = cleanTitle.startsWith('Junior') || cleanTitle.startsWith('Apprentice') || cleanTitle.startsWith('Entry')
    ? cleanTitle
    : `Trainee ${cleanTitle}`;

  return {
    ...j,
    title: normalizedTitle,
    salaryNGN: startingWeekly,
  };
});

// 100 Houses per state (Lagos, Abuja, Imo, Rivers, Kano) = 500 houses
export const EXPANDED_HOUSES: PropertyAsset[] = EXPANDED_STATE_HOUSES;

const LEGACY_BUSINESSES: BusinessItem[] = [
  // Lagos businesses
  { typeId: 'biz_pos_lagos', name: 'POS & Agency Banking Kiosk Network', stateId: 'lagos', stateName: 'Lagos', icon: '💳', costNGN: 250000, dailyProfitNGN: 18000, desc: 'Process deposits, bill payments, and cash withdrawals in bustling Oshodi & Ikeja markets.' },
  { typeId: 'biz_danfo_fleet', name: 'Commercial Danfo Bus Transit Fleet', stateId: 'lagos', stateName: 'Lagos', icon: '🚐', costNGN: 4800000, dailyProfitNGN: 310000, desc: 'Fleet of 3 yellow commercial minibuses plying Oshodi to CMS expressway routes.' },
  { typeId: 'biz_lekki_lounge', name: 'Lekki Phase 1 Rooftop Lounge & Grill', stateId: 'lagos', stateName: 'Lagos', icon: '🍸', costNGN: 22000000, dailyProfitNGN: 1450000, desc: 'High-margin nightlife venue with DJ booth, shisha, and cocktail bar.' },
  { typeId: 'biz_tech_studio', name: 'Yaba Fintech & AI Software Studio', stateId: 'lagos', stateName: 'Lagos', icon: '💻', costNGN: 18000000, dailyProfitNGN: 1200000, desc: 'Engineering team building payment gateways and web applications for global clients.' },
  { typeId: 'biz_water_factory', name: 'Pure Water & Bottled Mineral Plant', stateId: 'lagos', stateName: 'Lagos', icon: '💧', costNGN: 3500000, dailyProfitNGN: 240000, desc: 'Automated sachet and bottled water bottling plant with 2 delivery vans in Ikorodu.' },
  { typeId: 'biz_apapa_clearing', name: 'Apapa Port Freight Forwarding Agency', stateId: 'lagos', stateName: 'Lagos', icon: '🚢', costNGN: 35000000, dailyProfitNGN: 2400000, desc: 'Customs brokerage and container clearing services for maritime importers.' },

  // Abuja businesses
  { typeId: 'biz_abuja_carhire', name: 'Diplomatic Armored Car Hire & Escort', stateId: 'abuja', stateName: 'Abuja', icon: '🚙', costNGN: 45000000, dailyProfitNGN: 2900000, desc: 'Fleet of bulletproof Prado SUVs serving embassies, ministries, and VIP visitors.' },
  { typeId: 'biz_maitama_boutique', name: 'Maitama Haute Couture Fashion House', stateId: 'abuja', stateName: 'Abuja', icon: '👗', costNGN: 14000000, dailyProfitNGN: 920000, desc: 'Bespoke Senator cuts and hand-woven traditional attires for senators and ministers.' },
  { typeId: 'biz_wuse_bistro', name: 'Wuse 2 Gourmet Continental Bistro', stateId: 'abuja', stateName: 'Abuja', icon: '🍽️', costNGN: 16000000, dailyProfitNGN: 1100000, desc: 'Fine dining culinary destination serving diplomats, expatriates, and government directors.' },
  { typeId: 'biz_fct_realestate', name: 'Asokoro Luxury Real Estate Brokerage', stateId: 'abuja', stateName: 'Abuja', icon: '🏗️', costNGN: 75000000, dailyProfitNGN: 4800000, desc: 'High-ticket residential property sales and diplomatic lease management.' },
  { typeId: 'biz_jabi_watersports', name: 'Jabi Lake Recreational Jet Ski Club', stateId: 'abuja', stateName: 'Abuja', icon: '🛥️', costNGN: 28000000, dailyProfitNGN: 1850000, desc: 'Waterfront boat rentals, kayaking, and private weekend pontoon charters.' },

  // Imo businesses
  { typeId: 'biz_owerri_hotel', name: 'Owerri Boutique Luxury Hospitality Suites', stateId: 'imo', stateName: 'Imo', icon: '🏨', costNGN: 60000000, dailyProfitNGN: 3900000, desc: '30-room luxury hotel with banquet hall, pool bar, and 24/7 industrial generator.' },
  { typeId: 'biz_douglas_spares', name: 'Douglas Road Motor Auto Parts Depot', stateId: 'imo', stateName: 'Imo', icon: '⚙️', costNGN: 6500000, dailyProfitNGN: 430000, desc: 'Direct wholesale distribution of Toyota & Mercedes auto parts and lubricants.' },
  { typeId: 'biz_imo_poultry', name: 'Ulonna Commercial Poultry & Feed Mill', stateId: 'imo', stateName: 'Imo', icon: '🐔', costNGN: 5000000, dailyProfitNGN: 330000, desc: 'Broilers, layer cages, and egg supply to supermarkets across the Eastern states.' },
  { typeId: 'biz_orlu_pharmacy', name: 'Eastern Wholesale Pharmaceuticals Depot', stateId: 'imo', stateName: 'Imo', icon: '💊', costNGN: 12000000, dailyProfitNGN: 820000, desc: 'Licensed distribution of medical consumables and essential pharmaceutical drugs.' },

  // Rivers businesses
  { typeId: 'biz_ph_oilfield', name: 'Trans-Amadi Offshore Supply Base Services', stateId: 'rivers', stateName: 'Rivers', icon: '⛽', costNGN: 120000000, dailyProfitNGN: 7800000, desc: 'Supplying valves, safety gear, and specialized chemicals to multinational oil rigs.' },
  { typeId: 'biz_ph_logistics', name: 'Niger Delta Tugboat & Marine Barge Hire', stateId: 'rivers', stateName: 'Rivers', icon: '⛴️', costNGN: 85000000, dailyProfitNGN: 5500000, desc: 'Heavy barge transportation for industrial equipment along the Bonny river corridor.' },
  { typeId: 'biz_ph_seafood', name: 'Port Harcourt Cold-Chain Seafood Depot', stateId: 'rivers', stateName: 'Rivers', icon: '🐟', costNGN: 8000000, dailyProfitNGN: 520000, desc: 'Blast-freezers for Atlantic tiger prawns, sea croaker, and barracuda distribution.' },

  // Kano businesses
  { typeId: 'biz_kano_textiles', name: 'Kano Kurmi International Textile Dye Pit', stateId: 'kano', stateName: 'Kano', icon: '🧵', costNGN: 4200000, dailyProfitNGN: 290000, desc: 'Heritage indigo-dyed cotton fabrics and brocade distribution across Sahel borders.' },
  { typeId: 'biz_kano_grains', name: 'Dawanau Grains & Sesame Seed Silos', stateId: 'kano', stateName: 'Kano', icon: '🌾', costNGN: 15000000, dailyProfitNGN: 1050000, desc: 'Bulk trade of sorghum, millet, beans, and sesame seeds in West Africa largest grain market.' },
  { typeId: 'biz_kano_leather', name: 'Challawa Tannery & Export Finished Leather', stateId: 'kano', stateName: 'Kano', icon: '👞', costNGN: 38000000, dailyProfitNGN: 2600000, desc: 'Exporting premium red goat leather to luxury shoe and bag ateliers in Milan and Paris.' },

  // Pan-Nigeria Mega Ventures
  { typeId: 'biz_interstate_haulage', name: 'Interstate Haulage & 40ft Truck Fleet', stateId: 'all', stateName: 'All States', icon: '🚛', costNGN: 90000000, dailyProfitNGN: 5800000, desc: 'Fleet of Mack heavy haulage trucks connecting farm gates to coastal seaports.' },
  { typeId: 'biz_solar_energy', name: 'Mini-Grid Solar Energy IPP Utility', stateId: 'all', stateName: 'All States', icon: '☀️', costNGN: 200000000, dailyProfitNGN: 13500000, desc: 'Providing commercial mini-grid solar installations for industrial parks and estates.' },
  { typeId: 'biz_fintech_rail', name: 'Central Microfinance Payment Switch', stateId: 'all', stateName: 'All States', icon: '🏦', costNGN: 450000000, dailyProfitNGN: 31000000, desc: 'Tier-1 national payment rails routing millions of card transactions per second.' },
  { typeId: 'biz_conglomerate', name: 'Diversified Conglomerate Holdings', stateId: 'all', stateName: 'All States', icon: '👑', costNGN: 1000000000, dailyProfitNGN: 70000000, desc: 'Multinational conglomerate with cement, sugar, agro-allied, and maritime shipping lines.' },
];

// ============================================================================
// 2. EXPANDED JOBS CATALOG (36 JOBS ACROSS STATES & SECTORS)
// ============================================================================
const LEGACY_JOBS: JobItem[] = [
  // Lagos jobs
  { id: 'job_pos_opay', title: 'POS Kiosk Operator', company: 'OPay QuickPay Hub', stateId: 'lagos', stateName: 'Lagos', salaryNGN: 85000, minEnergy: 10, sector: 'commerce', desc: 'Process deposits and withdrawals for market traders.' },
  { id: 'job_danfo_driver', title: 'Danfo Commercial Driver', company: 'NURTW Lagos Transit', stateId: 'lagos', stateName: 'Lagos', salaryNGN: 180000, minEnergy: 25, sector: 'commerce', desc: 'Navigate Oshodi-CMS expressways. Collect transit cash fares.' },
  { id: 'job_teller_gtb', title: 'Bank Customer Service Teller', company: 'GTBank / Access Bank', stateId: 'lagos', stateName: 'Lagos', salaryNGN: 160000, minEnergy: 15, sector: 'corporate', desc: 'Count cash bundles, issue mastercards, and balance daily ledgers.' },
  { id: 'job_nurse_luth', title: 'Registered General Nurse', company: 'Lagos University Teaching Hospital', stateId: 'lagos', stateName: 'Lagos', salaryNGN: 240000, minEnergy: 20, sector: 'healthcare', desc: 'Administer treatments and care for ward patients in tertiary clinic.' },
  { id: 'job_swe_flutterwave', title: 'Senior Software Engineer', company: 'Flutterwave / Paystack Tech', stateId: 'lagos', stateName: 'Lagos', salaryNGN: 1250000, minEnergy: 15, sector: 'tech', desc: 'Architect fintech payment rails in TypeScript & Go.' },
  { id: 'job_product_designer', title: 'Lead UI/UX Product Designer', company: 'PiggyVest Tech Hub', stateId: 'lagos', stateName: 'Lagos', salaryNGN: 950000, minEnergy: 12, sector: 'tech', desc: 'Design mobile banking user interfaces and design systems.' },
  { id: 'job_sound_engineer', title: 'Afrobeats Recording Engineer', company: 'Mavin Records Studio', stateId: 'lagos', stateName: 'Lagos', salaryNGN: 680000, minEnergy: 15, sector: 'creative', desc: 'Record vocals, mix stems, and master tracks for top chart artists.' },
  { id: 'job_realestate_agent', title: 'Senior Real Estate Broker', company: 'Lekki Luxury Homes Agency', stateId: 'lagos', stateName: 'Lagos', salaryNGN: 850000, minEnergy: 18, sector: 'corporate', desc: 'Close high-ticket duplex sales on Banana Island & Ikoyi.' },

  // Abuja jobs
  { id: 'job_legislative_aide', title: 'Legislative Parliamentary Aide', company: 'National Assembly Complex', stateId: 'abuja', stateName: 'Abuja', salaryNGN: 450000, minEnergy: 15, sector: 'civil', desc: 'Draft legislative bills, analyze committee memos, and brief senators.' },
  { id: 'job_diplomatic_driver', title: 'Embassy Diplomatic Chauffeur', company: 'British High Commission / US Embassy', stateId: 'abuja', stateName: 'Abuja', salaryNGN: 320000, minEnergy: 12, sector: 'civil', desc: 'Provide VIP security transport for diplomatic attachés and dignitaries.' },
  { id: 'job_cbn_analyst', title: 'Central Bank Economic Analyst', company: 'Central Bank of Nigeria (CBN)', stateId: 'abuja', stateName: 'Abuja', salaryNGN: 780000, minEnergy: 15, sector: 'corporate', desc: 'Analyze inflation indicators, foreign exchange reserves, and monetary policy.' },
  { id: 'job_hotel_manager', title: 'Executive Operations Manager', company: 'Transcorp Hilton Abuja', stateId: 'abuja', stateName: 'Abuja', salaryNGN: 650000, minEnergy: 20, sector: 'corporate', desc: 'Oversee 5-star presidential suites, diplomatic banquets, and concierge.' },
  { id: 'job_statehouse_legal', title: 'State House Legal Counsel', company: 'Federal Ministry of Justice', stateId: 'abuja', stateName: 'Abuja', salaryNGN: 890000, minEnergy: 16, sector: 'civil', desc: 'Review gazettes, bilateral treaties, and statutory government contracts.' },
  { id: 'job_pilot_airpeace', title: 'Domestic First Officer Pilot', company: 'Air Peace Airlines Nnamdi Azikiwe', stateId: 'abuja', stateName: 'Abuja', salaryNGN: 1850000, minEnergy: 20, sector: 'corporate', desc: 'Fly Boeing 737 aircraft on Abuja-Lagos-Port Harcourt domestic air corridors.' },

  // Imo jobs
  { id: 'job_imo_agronomist', title: 'Chief Agronomist & Farm Lead', company: 'Imo Palm Oil Processing Mill', stateId: 'imo', stateName: 'Imo', salaryNGN: 290000, minEnergy: 20, sector: 'commerce', desc: 'Manage commercial palm plantation yields and mechanized extraction.' },
  { id: 'job_imo_fmc_surgeon', title: 'Consultant Orthopedic Surgeon', company: 'Federal Medical Centre (FMC Owerri)', stateId: 'imo', stateName: 'Imo', salaryNGN: 920000, minEnergy: 25, sector: 'healthcare', desc: 'Perform specialized surgical operations and supervise medical interns.' },
  { id: 'job_imo_poly_lecturer', title: 'Senior Engineering Lecturer', company: 'Federal Polytechnic Nekede', stateId: 'imo', stateName: 'Imo', salaryNGN: 340000, minEnergy: 14, sector: 'civil', desc: 'Teach thermodynamics, structural dynamics, and mentor undergraduate students.' },
  { id: 'job_imo_concorde_chef', title: 'Executive Head Chef', company: 'Imo Concorde Hotel', stateId: 'imo', stateName: 'Imo', salaryNGN: 260000, minEnergy: 18, sector: 'creative', desc: 'Curate authentic Igbo delicacies and continental banquets.' },
  { id: 'job_imo_auto_mechanic', title: 'Master Automotive Diagnostic Lead', company: 'Douglas Auto Engineering Works', stateId: 'imo', stateName: 'Imo', salaryNGN: 210000, minEnergy: 22, sector: 'trades', desc: 'Calibrate engine control units (ECU) and service imported transmissions.' },

  // Rivers jobs
  { id: 'job_ph_drilling_eng', title: 'Offshore Drilling Superintendent', company: 'TotalEnergies / SPDC Joint Venture', stateId: 'rivers', stateName: 'Rivers', salaryNGN: 3950000, minEnergy: 28, sector: 'oil_gas', desc: 'Direct deepwater rotary drilling rigs and blow-out prevention protocols.' },
  { id: 'job_ph_hse_officer', title: 'Senior Safety & HSE Inspector', company: 'Nigeria LNG (NLNG) Bonny Island', stateId: 'rivers', stateName: 'Rivers', salaryNGN: 1650000, minEnergy: 16, sector: 'oil_gas', desc: 'Enforce stringent maritime hazard compliance and liquefied gas safety.' },
  { id: 'job_ph_marine_captain', title: 'Harbour Pilot & Tugboat Captain', company: 'Nigerian Ports Authority Onne', stateId: 'rivers', stateName: 'Rivers', salaryNGN: 1450000, minEnergy: 20, sector: 'oil_gas', desc: 'Maneuver 10,000-TEU container container carriers through deep river channels.' },
  { id: 'job_ph_pipeline_welder', title: 'Underwater Hyperbaric Welder', company: 'Trans-Amadi Fabrication Yards', stateId: 'rivers', stateName: 'Rivers', salaryNGN: 1200000, minEnergy: 26, sector: 'trades', desc: 'Execute precision subsea pipeline repairs under extreme hydrostatic pressure.' },

  // Kano jobs
  { id: 'job_kano_commodities', title: 'Senior Agricultural Commodities Trader', company: 'Dawanau Grains Exchange', stateId: 'kano', stateName: 'Kano', salaryNGN: 480000, minEnergy: 16, sector: 'commerce', desc: 'Arbitrage seasonal pulses, cowpeas, and sesame seed price fluctuations.' },
  { id: 'job_kano_textile_eng', title: 'Industrial Textile Production Manager', company: 'Bompai Industrial Cotton Mills', stateId: 'kano', stateName: 'Kano', salaryNGN: 360000, minEnergy: 18, sector: 'trades', desc: 'Supervise automated spinning looms, quality inspection, and export logistics.' },
  { id: 'job_kano_microfinance', title: 'Islamic Non-Interest Banking Officer', company: 'Jaiz Bank Commercial Kano', stateId: 'kano', stateName: 'Kano', salaryNGN: 320000, minEnergy: 12, sector: 'corporate', desc: 'Structure Murabaha equipment financing for small market enterprises.' },
  { id: 'job_kano_tannery_chemist', title: 'Quality Control Leather Chemist', company: 'Challawa Tannery PLC', stateId: 'kano', stateName: 'Kano', salaryNGN: 290000, minEnergy: 15, sector: 'trades', desc: 'Formulate natural tanning extracts and inspect leather grain softness.' },

  // Federal / Nationwide jobs
  { id: 'job_fed_cybersecurity', title: 'National Cyber Command Analyst', company: 'NITDA / National Cybersecurity Center', stateId: 'all', stateName: 'All States', salaryNGN: 1100000, minEnergy: 14, sector: 'tech', desc: 'Guard national critical infrastructure from cyber intrusions.' },
  { id: 'job_fed_tax_auditor', title: 'Senior Corporate Tax Auditor', company: 'Federal Inland Revenue Service (FIRS)', stateId: 'all', stateName: 'All States', salaryNGN: 520000, minEnergy: 14, sector: 'civil', desc: 'Audit multinational enterprise accounts and ensure statutory tax payments.' },
  { id: 'job_fed_telecom_eng', title: '5G Core Network Infrastructure Architect', company: 'MTN Nigeria / Airtel Communications', stateId: 'all', stateName: 'All States', salaryNGN: 1550000, minEnergy: 16, sector: 'tech', desc: 'Maintain national fiber optic backbones and 5G base transceiver stations.' },
  { id: 'job_fed_customs_lead', title: 'Customs Enforcement Superintendent', company: 'Nigeria Customs Service (NCS)', stateId: 'all', stateName: 'All States', salaryNGN: 480000, minEnergy: 22, sector: 'civil', desc: 'Inspect international freight manifests and enforce border import tariffs.' },
  { id: 'job_fed_investment_exec', title: 'Principal Venture Capital Partner', company: 'Pan-African Sovereign Wealth Fund', stateId: 'all', stateName: 'All States', salaryNGN: 3200000, minEnergy: 18, sector: 'corporate', desc: 'Lead $50M growth equity rounds into tech and clean energy startups.' },
];

// ============================================================================
// 3. EXPANDED HOUSES CATALOG (55+ HOUSES ACROSS STATES)
// ============================================================================
const LEGACY_HOUSES: PropertyAsset[] = [
  // LAGOS (12 Properties)
  { id: 'prop_lag_yaba_studio', title: 'Self-Contain Studio (Yaba Tech Corridor)', type: 'self_contain', stateId: 'lagos', neighborhood: 'Yaba, Lagos', annualRent: 450000, buyPrice: 6500000, icon: '🏠', desc: 'Compact studio near UNILAG and tech co-working spaces with prepaid meter.', roomsCount: 1, floorsCount: 1, x: 28, y: 36 },
  { id: 'prop_lag_gbagada_mini', title: 'Modern Mini Flat (Gbagada Phase 2)', type: 'flat', stateId: 'lagos', neighborhood: 'Gbagada, Lagos', annualRent: 950000, buyPrice: 14000000, icon: '🏢', desc: 'Clean 1-bedroom flat with quick access to Third Mainland Bridge.', roomsCount: 1, floorsCount: 1, x: 38, y: 44 },
  { id: 'prop_lag_surulere_2bed', title: '2-Bedroom Flat (Bode Thomas, Surulere)', type: 'flat', stateId: 'lagos', neighborhood: 'Surulere, Lagos', annualRent: 1500000, buyPrice: 22000000, icon: '🏢', desc: 'Tiled floors, POP ceiling, water borehole, and night security guard.', roomsCount: 2, floorsCount: 1, x: 44, y: 52 },
  { id: 'prop_lag_ogba_3bed', title: '3-Bedroom Apartment (Ogba Excellence)', type: 'flat', stateId: 'lagos', neighborhood: 'Ogba, Lagos', annualRent: 1800000, buyPrice: 26000000, icon: '🏢', desc: 'Family apartment with spacious living room, fitted wardrobes, and parking.', roomsCount: 3, floorsCount: 1, x: 32, y: 28 },
  { id: 'prop_lag_magodo_duplex', title: '4-Bedroom Detached House (Magodo Shangisha)', type: 'duplex', stateId: 'lagos', neighborhood: 'Magodo GRA, Lagos', annualRent: 3500000, buyPrice: 52000000, icon: '🏡', desc: 'Serene gated residential GRA with 24/7 security patrol and dedicated transformer.', roomsCount: 4, floorsCount: 2, x: 48, y: 22 },
  { id: 'prop_lag_ikeja_gra_flat', title: '4-Bedroom Executive Flat (Isaac John, Ikeja GRA)', type: 'flat', stateId: 'lagos', neighborhood: 'Ikeja GRA, Lagos', annualRent: 3800000, buyPrice: 55000000, icon: '🏢', desc: 'Prestigious flat 10 mins from MMA Airport, gym, and swimming pool.', roomsCount: 4, floorsCount: 1, x: 35, y: 42 },
  { id: 'prop_lag_chevron_terrace', title: '4-Bedroom Serviced Terrace (Chevron Tollgate)', type: 'duplex', stateId: 'lagos', neighborhood: 'Lekki Tollgate, Lagos', annualRent: 4500000, buyPrice: 68000000, icon: '🏡', desc: 'Uniformed security guards, treated industrial water plant, and kids playground.', roomsCount: 4, floorsCount: 2, x: 62, y: 68 },
  { id: 'prop_lag_lekki1_duplex', title: '5-Bedroom Semi-Detached Duplex (Lekki Phase 1)', type: 'duplex', stateId: 'lagos', neighborhood: 'Admiralty Way, Lekki Phase 1', annualRent: 6500000, buyPrice: 95000000, icon: '🏡', desc: 'Modern smart home with fitted Italian kitchen, BQ, and CCTV surveillance.', roomsCount: 5, floorsCount: 2, x: 68, y: 64 },
  { id: 'prop_lag_vi_apartment', title: 'Luxury 3-Bedroom High-Rise (Victoria Island)', type: 'flat', stateId: 'lagos', neighborhood: 'Ahmadu Bello Way, VI, Lagos', annualRent: 12000000, buyPrice: 180000000, icon: '🏢', desc: 'Atlantic Ocean view luxury flat with infinity pool and concierge service.', roomsCount: 3, floorsCount: 2, x: 64, y: 56 },
  { id: 'prop_lag_ikoyi_penthouse', title: 'Luxury Sky Penthouse (Bouridillon, Ikoyi)', type: 'duplex', stateId: 'lagos', neighborhood: 'Bouridillon Road, Ikoyi, Lagos', annualRent: 25000000, buyPrice: 420000000, icon: '🏢', desc: 'Panoramic skyline penthouse overlooking Five Cowries Creek with private elevator.', roomsCount: 5, floorsCount: 2, x: 72, y: 48 },
  { id: 'prop_lag_banana_mansion', title: 'Two-Story Waterfront Villa (Banana Island, Ikoyi)', type: 'villa', stateId: 'lagos', neighborhood: 'Banana Island, Ikoyi, Lagos', annualRent: 45000000, buyPrice: 850000000, icon: '🏰', desc: 'Ultra-exclusive 7-bedroom smart waterfront estate with private yacht jetty.', roomsCount: 7, floorsCount: 3, x: 78, y: 38 },
  { id: 'prop_lag_eko_atlantic', title: 'Presidential Tower Suite (Eko Atlantic City)', type: 'villa', stateId: 'lagos', neighborhood: 'Ocean Front, Eko Atlantic, Lagos', annualRent: 75000000, buyPrice: 1400000000, icon: '🏰', desc: 'State-of-the-art skyscraper villa overlooking Great Wall of Lagos.', roomsCount: 8, floorsCount: 3, x: 82, y: 52 },

  // ABUJA (11 Properties)
  { id: 'prop_abj_kubwa_flat', title: '1-Bedroom Compact Apartment (Kubwa Extension)', type: 'flat', stateId: 'abuja', neighborhood: 'Kubwa, Abuja', annualRent: 650000, buyPrice: 9500000, icon: '🏢', desc: 'Affordable apartment close to Kubwa train station with steady power.', roomsCount: 1, floorsCount: 1, x: 22, y: 72 },
  { id: 'prop_abj_lugbe_2bed', title: '2-Bedroom Terrace Flat (Lugbe Airport Road)', type: 'flat', stateId: 'abuja', neighborhood: 'Airport Road, Lugbe, Abuja', annualRent: 1200000, buyPrice: 18000000, icon: '🏢', desc: 'Fenced estate with solar streetlights along the airport expressway.', roomsCount: 2, floorsCount: 1, x: 18, y: 84 },
  { id: 'prop_abj_gwarinpa_flat', title: '3-Bedroom Estate Flat (Gwarinpa Estate)', type: 'flat', stateId: 'abuja', neighborhood: '3rd Avenue, Gwarinpa, Abuja', annualRent: 2400000, buyPrice: 35000000, icon: '🏢', desc: 'Located inside West Africa largest residential housing estate.', roomsCount: 3, floorsCount: 1, x: 32, y: 45 },
  { id: 'prop_abj_wuse2_duplex', title: '4-Bedroom Luxury Semi-Duplex (Wuse 2)', type: 'duplex', stateId: 'abuja', neighborhood: 'Aminu Kano Crescent, Wuse 2, Abuja', annualRent: 5500000, buyPrice: 85000000, icon: '🏡', desc: 'Heart of Abuja dining & shopping district. Ample parking for 4 cars.', roomsCount: 4, floorsCount: 2, x: 42, y: 35 },
  { id: 'prop_abj_jabi_lakeside', title: '4-Bedroom Waterfront Villa (Jabi Lakefront)', type: 'duplex', stateId: 'abuja', neighborhood: 'Jabi Lake, Abuja', annualRent: 8000000, buyPrice: 130000000, icon: '🏡', desc: 'Direct panoramic frontage on Jabi Lake with private boat pier access.', roomsCount: 4, floorsCount: 2, x: 30, y: 30 },
  { id: 'prop_abj_garki_penthouse', title: '3-Bedroom Sky Penthouse (Garki 2 Area)', type: 'flat', stateId: 'abuja', neighborhood: 'Garki 2, Abuja', annualRent: 4200000, buyPrice: 62000000, icon: '🏢', desc: 'Central Area view apartment with smart automation and 24/7 power backup.', roomsCount: 3, floorsCount: 1, x: 58, y: 72 },
  { id: 'prop_abj_katampe_hill', title: '5-Bedroom Mountain View Detached Duplex (Katampe Main)', type: 'duplex', stateId: 'abuja', neighborhood: 'Katampe Hills, Abuja', annualRent: 9500000, buyPrice: 160000000, icon: '🏡', desc: 'Elevated cliffside villa overlooking the central Abuja bowl lights.', roomsCount: 5, floorsCount: 2, x: 48, y: 24 },
  { id: 'prop_abj_guzape_duplex', title: '5-Bedroom Smart Villa with Infinity Pool (Guzape Hills)', type: 'duplex', stateId: 'abuja', neighborhood: 'Asokoro Extension, Guzape, Abuja', annualRent: 14000000, buyPrice: 240000000, icon: '🏡', desc: 'Ultra-modern glass architecture with private infinity swimming pool.', roomsCount: 5, floorsCount: 2, x: 66, y: 58 },
  { id: 'prop_abj_maitama_mansion', title: '6-Bedroom Diplomatic Ambassadorial Villa (Maitama)', type: 'villa', stateId: 'abuja', neighborhood: 'Gana Street, Maitama, Abuja', annualRent: 22000000, buyPrice: 380000000, icon: '🏰', desc: 'Bulletproof glass, Olympic swimming pool, tennis court, and banquet hall.', roomsCount: 6, floorsCount: 2, x: 50, y: 38 },
  { id: 'prop_abj_asokoro_palace', title: '8-Bedroom Hilltop Presidential Palace (Asokoro Rock)', type: 'villa', stateId: 'abuja', neighborhood: 'Yakubu Gowon Crescent, Asokoro, Abuja', annualRent: 40000000, buyPrice: 750000000, icon: '🏰', desc: 'Helipad access, underground bunker, private cinema, and manicured royal gardens.', roomsCount: 8, floorsCount: 3, x: 62, y: 44 },
  { id: 'prop_abj_aso_drive', title: 'Imperial Villa Residence (Aso Drive VIP Sector)', type: 'villa', stateId: 'abuja', neighborhood: 'Aso Rock Drive, Abuja', annualRent: 60000000, buyPrice: 1100000000, icon: '🏰', desc: 'Direct view of Aso Rock monolith, maximum diplomatic security perimeter.', roomsCount: 9, floorsCount: 3, x: 56, y: 32 },

  // IMO (10 Properties)
  { id: 'prop_imo_aladinma_flat', title: '1-Bedroom Student & Professional Flat (Aladinma Housing)', type: 'flat', stateId: 'imo', neighborhood: 'Aladinma, Owerri, Imo', annualRent: 350000, buyPrice: 5200000, icon: '🏢', desc: 'Neat tiled flat close to IMSU university gate and modern shopping strip.', roomsCount: 1, floorsCount: 1, x: 42, y: 38 },
  { id: 'prop_imo_worldbank_2bed', title: '2-Bedroom Bungalow (World Bank Housing Estate)', type: 'flat', stateId: 'imo', neighborhood: 'World Bank Estate, Owerri, Imo', annualRent: 750000, buyPrice: 11000000, icon: '🏠', desc: 'Fenced compound with wide frontage, steady borehole water and quiet streets.', roomsCount: 2, floorsCount: 1, x: 50, y: 46 },
  { id: 'prop_imo_ikenegbu_flat', title: '3-Bedroom Executive Flat (Ikenegbu Layout)', type: 'flat', stateId: 'imo', neighborhood: 'Ikenegbu, Owerri, Imo', annualRent: 1200000, buyPrice: 18000000, icon: '🏢', desc: 'Heart of Owerri commercial center. Walking distance to banks and restaurants.', roomsCount: 3, floorsCount: 1, x: 46, y: 40 },
  { id: 'prop_imo_orji_3bed', title: '3-Bedroom Serviced Apartment (Orji Flyover Area)', type: 'flat', stateId: 'imo', neighborhood: 'Orji, Owerri, Imo', annualRent: 1400000, buyPrice: 20000000, icon: '🏢', desc: 'Modern construction with security gates and dedicated inverter wiring.', roomsCount: 3, floorsCount: 1, x: 54, y: 32 },
  { id: 'prop_imo_works_duplex', title: '4-Bedroom Semi-Detached Duplex (Works Layout)', type: 'duplex', stateId: 'imo', neighborhood: 'Works Layout, Owerri, Imo', annualRent: 2200000, buyPrice: 34000000, icon: '🏡', desc: 'Serene residential layout with paved access roads and night guards.', roomsCount: 4, floorsCount: 2, x: 48, y: 36 },
  { id: 'prop_imo_new_owerri_duplex', title: '4-Bedroom Contemporary Duplex (New Owerri City)', type: 'duplex', stateId: 'imo', neighborhood: 'New Owerri, Imo', annualRent: 3200000, buyPrice: 48000000, icon: '🏡', desc: 'Master bedroom with jacuzzi, family lounge, and stamped concrete compound.', roomsCount: 4, floorsCount: 2, x: 58, y: 50 },
  { id: 'prop_imo_gra_mansion', title: '5-Bedroom Luxury Duplex (Owerri GRA Phase 1)', type: 'duplex', stateId: 'imo', neighborhood: 'Owerri GRA, Imo', annualRent: 4800000, buyPrice: 75000000, icon: '🏡', desc: 'Governor Road axis with green lawns, perimeter electric fence, and generator house.', roomsCount: 5, floorsCount: 2, x: 52, y: 42 },
  { id: 'prop_imo_concorde_villa', title: '6-Bedroom Continental Villa (Concorde Boulevard)', type: 'villa', stateId: 'imo', neighborhood: 'Concorde Avenue, Owerri, Imo', annualRent: 7500000, buyPrice: 110000000, icon: '🏰', desc: 'Grand Roman pillars, swimming pool, and banquet hosting grounds.', roomsCount: 6, floorsCount: 2, x: 60, y: 44 },
  { id: 'prop_imo_mbaise_estate', title: 'Country Manor Estate (Mbaise Heartland)', type: 'villa', stateId: 'imo', neighborhood: 'Mbaise Road, Imo', annualRent: 5500000, buyPrice: 85000000, icon: '🏰', desc: 'Sprawling countryside compound with palm grove and private guest lodge.', roomsCount: 7, floorsCount: 2, x: 68, y: 38 },
  { id: 'prop_imo_royal_palace', title: 'Eastern Aristocratic Mansion (Owerri Heartland)', type: 'villa', stateId: 'imo', neighborhood: 'Heartland VIP, Owerri, Imo', annualRent: 15000000, buyPrice: 220000000, icon: '🏰', desc: 'High-walled private estate with imported chandeliers and executive pavilion.', roomsCount: 8, floorsCount: 3, x: 55, y: 48 },

  // RIVERS (8 Properties)
  { id: 'prop_riv_diobu_flat', title: '2-Bedroom City Flat (Mile 1 Diobu, Port Harcourt)', type: 'flat', stateId: 'rivers', neighborhood: 'Diobu, Port Harcourt', annualRent: 850000, buyPrice: 12500000, icon: '🏢', desc: 'Accessible commercial location with vibrant street commerce nearby.', roomsCount: 2, floorsCount: 1, x: 40, y: 55 },
  { id: 'prop_riv_woji_3bed', title: '3-Bedroom Serviced Flat (Woji Estate, PH)', type: 'flat', stateId: 'rivers', neighborhood: 'Woji, Port Harcourt', annualRent: 1800000, buyPrice: 28000000, icon: '🏢', desc: 'Family estate with quiet paved avenues and dedicated borehole water.', roomsCount: 3, floorsCount: 1, x: 48, y: 52 },
  { id: 'prop_riv_peter_odili', title: '4-Bedroom Waterfront Duplex (Peter Odili Road)', type: 'duplex', stateId: 'rivers', neighborhood: 'Peter Odili, Port Harcourt', annualRent: 4200000, buyPrice: 65000000, icon: '🏡', desc: 'Modern gated security estate along the prime Trans-Amadi corridor.', roomsCount: 4, floorsCount: 2, x: 52, y: 58 },
  { id: 'prop_riv_gra2_duplex', title: '5-Bedroom Executive Duplex (PH GRA Phase 2)', type: 'duplex', stateId: 'rivers', neighborhood: 'GRA Phase 2, Port Harcourt', annualRent: 6500000, buyPrice: 105000000, icon: '🏡', desc: 'Premier residential enclave for oil company directors and expatriates.', roomsCount: 5, floorsCount: 2, x: 45, y: 48 },
  { id: 'prop_riv_old_gra_mansion', title: '6-Bedroom Colonial Villa (Old GRA, Port Harcourt)', type: 'villa', stateId: 'rivers', neighborhood: 'Old GRA, Port Harcourt', annualRent: 12000000, buyPrice: 195000000, icon: '🏰', desc: 'High ceilings, expansive private lawns, and swimming pool.', roomsCount: 6, floorsCount: 2, x: 46, y: 45 },
  { id: 'prop_riv_trans_amadi', title: 'Penthouse Apartment (Trans-Amadi Commercial)', type: 'flat', stateId: 'rivers', neighborhood: 'Trans-Amadi, Port Harcourt', annualRent: 3500000, buyPrice: 55000000, icon: '🏢', desc: 'Top-floor serviced apartment with industrial inverter system.', roomsCount: 3, floorsCount: 1, x: 50, y: 50 },
  { id: 'prop_riv_bonny_lakeside', title: 'Atlantic Coastal Manor (Bonny Island Executive)', type: 'villa', stateId: 'rivers', neighborhood: 'Bonny Island, Rivers', annualRent: 18000000, buyPrice: 280000000, icon: '🏰', desc: 'Direct coastal marine frontage, private jetty, and helipad clearance.', roomsCount: 6, floorsCount: 2, x: 56, y: 64 },
  { id: 'prop_riv_garden_city_palace', title: 'Garden City Royal Estate (Port Harcourt VIP)', type: 'villa', stateId: 'rivers', neighborhood: 'VIP Quarter, Port Harcourt', annualRent: 28000000, buyPrice: 450000000, icon: '🏰', desc: 'Sprawling palace with armored security gatehouse and private sports courts.', roomsCount: 7, floorsCount: 3, x: 48, y: 42 },

  // KANO (8 Properties)
  { id: 'prop_kan_sabongari_flat', title: '2-Bedroom Commercial Flat (Sabon Gari, Kano)', type: 'flat', stateId: 'kano', neighborhood: 'Sabon Gari, Kano', annualRent: 600000, buyPrice: 8500000, icon: '🏢', desc: 'Heart of Kano wholesale merchant district with bustling trade.', roomsCount: 2, floorsCount: 1, x: 46, y: 42 },
  { id: 'prop_kan_bompai_duplex', title: '3-Bedroom Semi-Duplex (Bompai Industrial GRA)', type: 'duplex', stateId: 'kano', neighborhood: 'Bompai GRA, Kano', annualRent: 1800000, buyPrice: 26000000, icon: '🏡', desc: 'Quiet tree-lined residential street with generator backup.', roomsCount: 3, floorsCount: 2, x: 50, y: 38 },
  { id: 'prop_kan_nassarawa_villa', title: 'Northern Aristocratic Villa (Nassarawa GRA, Kano)', type: 'villa', stateId: 'kano', neighborhood: 'Nassarawa GRA, Kano', annualRent: 8000000, buyPrice: 120000000, icon: '🏰', desc: 'High-walled traditional villa with ornate carved gates and guest chalets.', roomsCount: 8, floorsCount: 2, x: 55, y: 35 },
  { id: 'prop_kan_badawa_duplex', title: '4-Bedroom Detached House (Badawa Layout)', type: 'duplex', stateId: 'kano', neighborhood: 'Badawa, Kano', annualRent: 2200000, buyPrice: 32000000, icon: '🏡', desc: 'Spacious compound with traditional guest quarters and borehole.', roomsCount: 4, floorsCount: 2, x: 52, y: 36 },
  { id: 'prop_kan_farm_centre', title: '3-Bedroom Modern Flat (Farm Centre Tech Hub)', type: 'flat', stateId: 'kano', neighborhood: 'Farm Centre, Kano', annualRent: 1200000, buyPrice: 17000000, icon: '🏢', desc: 'Walking distance to Kano gadget and electronics markets.', roomsCount: 3, floorsCount: 1, x: 48, y: 40 },
  { id: 'prop_kan_tudun_wada', title: 'Traditional Courtyard Compound (Old Walled City)', type: 'villa', stateId: 'kano', neighborhood: 'Ancient City, Kano', annualRent: 1500000, buyPrice: 22000000, icon: '🏰', desc: 'Historic clay-plaster architecture with shaded interior courtyard.', roomsCount: 5, floorsCount: 1, x: 44, y: 46 },
  { id: 'prop_kan_emirate_manor', title: 'Grand Emirate Heritage Residence (Kano Royal Sector)', type: 'villa', stateId: 'kano', neighborhood: 'Emirate Axis, Kano', annualRent: 16000000, buyPrice: 240000000, icon: '🏰', desc: 'Prestigious estate with ornate domes, high ramparts, and equestrian stables.', roomsCount: 8, floorsCount: 2, x: 54, y: 32 },
  { id: 'prop_kan_sahel_palace', title: 'Sahelian Monarch Palace (Nassarawa Hills)', type: 'villa', stateId: 'kano', neighborhood: 'Kano VIP Sector', annualRent: 32000000, buyPrice: 480000000, icon: '🏰', desc: 'Monumental northern architecture with banquet pavilion for 500 guests.', roomsCount: 9, floorsCount: 3, x: 58, y: 30 },

  // OTHER STATES (6 Properties)
  { id: 'prop_enugu_independence', title: '4-Bedroom Duplex (Independence Layout, Enugu)', type: 'duplex', stateId: 'all', neighborhood: 'Independence Layout, Enugu', annualRent: 2800000, buyPrice: 42000000, icon: '🏡', desc: 'Coal City scenic hill view duplex with constant cool mountain breeze.', roomsCount: 4, floorsCount: 2, x: 52, y: 52 },
  { id: 'prop_oyo_bodija_villa', title: '5-Bedroom Historic Villa (Old Bodija, Ibadan)', type: 'villa', stateId: 'all', neighborhood: 'Bodija GRA, Ibadan, Oyo', annualRent: 2400000, buyPrice: 38000000, icon: '🏰', desc: 'Expansive compound with fruit trees, wide verandas, and quiet ambience.', roomsCount: 5, floorsCount: 2, x: 38, y: 48 },
  { id: 'prop_delta_asaba_gra', title: '4-Bedroom Modern Duplex (Asaba GRA, Delta)', type: 'duplex', stateId: 'all', neighborhood: 'Asaba GRA, Delta State', annualRent: 2600000, buyPrice: 40000000, icon: '🏡', desc: 'Overlooking the River Niger bridge corridor with modern finishes.', roomsCount: 4, floorsCount: 2, x: 50, y: 54 },
  { id: 'prop_calabar_marina', title: 'Colonial Waterfront Bungalow (Marina Resort, Calabar)', type: 'villa', stateId: 'all', neighborhood: 'Marina, Calabar, Cross River', annualRent: 3200000, buyPrice: 50000000, icon: '🏰', desc: 'Clean seaside air with manicured garden lawns and river cruise jetty.', roomsCount: 4, floorsCount: 1, x: 62, y: 62 },
  { id: 'prop_ogun_arepo_terrace', title: '4-Bedroom Serviced Terrace (Arepo Journalists Estate)', type: 'duplex', stateId: 'all', neighborhood: 'Arepo, Ogun State', annualRent: 1900000, buyPrice: 30000000, icon: '🏡', desc: 'Gated community 15 minutes drive into central Ikeja Lagos.', roomsCount: 4, floorsCount: 2, x: 34, y: 40 },
  { id: 'prop_plateau_rayfield', title: 'Mountain View Manor (Rayfield Resort, Jos)', type: 'villa', stateId: 'all', neighborhood: 'Rayfield, Jos, Plateau', annualRent: 3500000, buyPrice: 55000000, icon: '🏰', desc: 'Temperate mountain climate with fireplace, lake view, and golf fairway access.', roomsCount: 5, floorsCount: 2, x: 54, y: 44 },
];

// ============================================================================
// 4. EXPANDED CHOWDECK FOOD CATALOG (55+ FOOD ITEMS)
// ============================================================================
const BASE_CHOWDECK: FoodItem[] = [
  // Rice & Combos
  { id: 'fd_party_jollof', name: 'Smoky Party Jollof Rice & Fried Chicken', category: 'Rice & Combos', stateOrigin: 'Lagos', cost: 4500, hunger: 50, joy: 20, icon: '🍛', desc: 'Cooked on firewood for authentic party flavor, served with crispy chicken.' },
  { id: 'fd_fried_rice_turkey', name: 'Special Fried Rice & Peppered Turkey', category: 'Rice & Combos', stateOrigin: 'Lagos', cost: 5800, hunger: 55, joy: 22, icon: '🍛', desc: 'Loaded with diced liver, sweetcorn, and tender spicy turkey wing.' },
  { id: 'fd_ofada_rice', name: 'Ofada Rice & Hot Ayamase Designer Stew', category: 'Rice & Combos', stateOrigin: 'Ogun', cost: 6500, hunger: 60, joy: 25, icon: '🍲', desc: 'Unpolished native rice with bleached palm oil, iru, and assorted offal.' },
  { id: 'fd_coconut_rice', name: 'Creamy Coconut Rice & Jumbo Prawns', category: 'Rice & Combos', stateOrigin: 'Lagos', cost: 7200, hunger: 55, joy: 24, icon: '🥥', desc: 'Simmered in rich coconut milk broth with fresh sea prawns.' },
  { id: 'fd_native_jollof', name: 'Native Concoction Jollof (Iwuk Edesi)', category: 'Rice & Combos', stateOrigin: 'Akwa Ibom', cost: 5200, hunger: 52, joy: 20, icon: '🍛', desc: 'Rich palm oil rice cooked with smoked fish, scent leaves, and dried prawns.' },
  { id: 'fd_jollof_dodo_egg', name: 'Student Budget Jollof & Dodo with Egg', category: 'Rice & Combos', stateOrigin: 'All', cost: 2200, hunger: 40, joy: 15, icon: '🍳', desc: 'Quick hearty campus combination that never misses.' },
  { id: 'fd_rice_and_beans', name: 'Street Rice & Beans with Aganyin Sauce', category: 'Rice & Combos', stateOrigin: 'Lagos', cost: 2800, hunger: 50, joy: 18, icon: '🍛', desc: 'Classic mama-put combination drenched in spicy black chili oil.' },

  // Swallows & Soups
  { id: 'fd_pounded_yam_egusi', name: 'Pounded Yam with Goat Meat Egusi Soup', category: 'Swallows & Soups', stateOrigin: 'Ondo', cost: 6000, hunger: 70, joy: 25, icon: '🍲', desc: 'Fluffy pounded yam paired with melon seed soup and stockfish.' },
  { id: 'fd_amala_ewedu_gbegiri', name: 'Amala Abula (Gbegiri, Ewedu & Ogufe Goat)', category: 'Swallows & Soups', stateOrigin: 'Oyo', cost: 5500, hunger: 68, joy: 26, icon: '🍲', desc: 'Velvety yam flour swallow topped with yellow bean stew and green jute soup.' },
  { id: 'fd_oha_soup_akpu', name: 'Oha Soup & Akpu with Cow Foot & Snails', category: 'Swallows & Soups', stateOrigin: 'Imo', cost: 6800, hunger: 72, joy: 28, icon: '🥣', desc: 'Authentic Eastern delicacy with shredded oha leaves, cocoyam thickener.' },
  { id: 'fd_afang_soup_eba', name: 'Calabar Afang Soup with Waterleaf & Beef', category: 'Swallows & Soups', stateOrigin: 'Cross River', cost: 7000, hunger: 70, joy: 27, icon: '🍲', desc: 'Heavy Afang vegetable broth packed with periwinkles and smoked fish.' },
  { id: 'fd_edikang_ikong', name: 'Royal Edikang Ikong & Pounded Yam', category: 'Swallows & Soups', stateOrigin: 'Akwa Ibom', cost: 7500, hunger: 75, joy: 30, icon: '🍲', desc: 'Rich pumpkin leaf and waterleaf powerhouse with dried cod and dry fish.' },
  { id: 'fd_banga_starch', name: 'Delta Banga Soup & Starch with Fresh Catfish', category: 'Swallows & Soups', stateOrigin: 'Delta', cost: 7200, hunger: 72, joy: 28, icon: '🍲', desc: 'Aromatic palm fruit soup seasoned with oburunbebe stick.' },
  { id: 'fd_ogbono_fufu', name: 'Draw Ogbono Soup with Okra & Beef Tripe', category: 'Swallows & Soups', stateOrigin: 'Edo', cost: 4800, hunger: 65, joy: 20, icon: '🍲', desc: 'Silky wild mango seed soup loaded with kpomo and smoked mackerel.' },
  { id: 'fd_bitterleaf_soup', name: 'Ofe Onugbu (Bitterleaf Soup) & Semo', category: 'Swallows & Soups', stateOrigin: 'Anambra', cost: 5800, hunger: 66, joy: 22, icon: '🥣', desc: 'Washed bitterleaf thoroughly simmered with cocoyam and stockfish.' },
  { id: 'fd_tuwo_shinkafa', name: 'Tuwo Shinkafa with Miyan Kuka & Beef', category: 'Swallows & Soups', stateOrigin: 'Kano', cost: 4200, hunger: 64, joy: 22, icon: '🥣', desc: 'Soft mashed rice swallow paired with aromatic dried baobab leaf soup.' },
  { id: 'fd_miyan_taushe', name: 'Tuwo Masara & Miyan Taushe Pumpkin Stew', category: 'Swallows & Soups', stateOrigin: 'Kaduna', cost: 4500, hunger: 65, joy: 23, icon: '🥣', desc: 'Sweet pumpkin and roasted peanut soup garnished with sorrel leaves.' },

  // Suya & Grills
  { id: 'fd_beef_suya', name: 'Spicy Beef Suya Platter with Onions & Cabbage', category: 'Suya & Grills', stateOrigin: 'Kano', cost: 5000, hunger: 45, joy: 20, icon: '🥩', desc: 'Thinly sliced tender beef rubbed with yaji pepper and roasted on open fire.' },
  { id: 'fd_chicken_suya', name: 'Whole Grilled Chicken Suya & Yaji Spice', category: 'Suya & Grills', stateOrigin: 'Kano', cost: 7500, hunger: 65, joy: 25, icon: '🍗', desc: 'Flame-roasted whole chicken basted in spicy groundnut oil.' },
  { id: 'fd_ram_suya', name: 'Spicy Grilled Ram Suya (Balangu Cut)', category: 'Suya & Grills', stateOrigin: 'Sokoto', cost: 6500, hunger: 55, joy: 24, icon: '🥩', desc: 'Succulent cuts of prime ram seasoned with northern aromatic herbs.' },
  { id: 'fd_asun_goat', name: 'Smoky Peppered Asun (Spicy Roasted Goat Meat)', category: 'Suya & Grills', stateOrigin: 'Ondo', cost: 6000, hunger: 48, joy: 26, icon: '🍖', desc: 'Bite-sized roasted goat meat tossed in habanero peppers and onions.' },
  { id: 'fd_nkwobi', name: 'Traditional Nkwobi Spicy Cow Foot Delicacy', category: 'Suya & Grills', stateOrigin: 'Imo', cost: 6800, hunger: 52, joy: 28, icon: '🍲', desc: 'Tender cow foot simmered in rich palm oil and potash paste with utazi.' },
  { id: 'fd_isi_ewu', name: 'Isi Ewu (Traditional Goat Head Delicacy)', category: 'Suya & Grills', stateOrigin: 'Enugu', cost: 9500, hunger: 70, joy: 35, icon: '🍲', desc: 'Whole seasoned goat head cooked in traditional wooden mortar dish.' },
  { id: 'fd_catfish_peppersoup', name: 'Point-and-Kill Fresh Catfish Peppersoup', category: 'Suya & Grills', stateOrigin: 'Rivers', cost: 8500, hunger: 60, joy: 30, icon: '🐟', desc: 'Live catfish simmered in hot aromatic peppersoup broth with scent leaf.' },
  { id: 'fd_goat_peppersoup', name: 'Goat Meat Peppersoup (Ogufe)', category: 'Suya & Grills', stateOrigin: 'Lagos', cost: 5500, hunger: 50, joy: 24, icon: '🥣', desc: 'Steaming hot spicy herbal broth loaded with tender goat chunks.' },
  { id: 'fd_kilishi_pack', name: 'Northern Export Kilishi (Spicy Beef Jerky Pack)', category: 'Suya & Grills', stateOrigin: 'Kano', cost: 4000, hunger: 35, joy: 20, icon: '🥓', desc: 'Sun-dried wafer-thin beef coated with spicy ground peanut paste.' },
  { id: 'fd_peppered_snail', name: 'Giant Congo Peppered Snails (4 Large Pieces)', category: 'Suya & Grills', stateOrigin: 'Ogun', cost: 9000, hunger: 45, joy: 32, icon: '🐌', desc: 'Crispy sauteed jumbo snails drenched in spicy red pepper sauce.' },
  { id: 'fd_grilled_tilapia', name: 'Whole Grilled Tilapia Fish & Roasted Plantain (Bole)', category: 'Suya & Grills', stateOrigin: 'Rivers', cost: 8000, hunger: 65, joy: 30, icon: '🐟', desc: 'Port Harcourt style sweet roasted bole plantain with spicy palm oil pepper sauce.' },

  // Street Bites & Pastries
  { id: 'fd_shawarma_double', name: 'Lekki Beef & Chicken Shawarma Double Sausage', category: 'Street Bites & Pastries', stateOrigin: 'Lagos', cost: 3800, hunger: 45, joy: 18, icon: '🌯', desc: 'Wrapped in pita with cabbage, mayo cream, and two hot dog sausages.' },
  { id: 'fd_meatpie_special', name: 'Rich Beef Flaky Meat Pie & Chilled Juice', category: 'Street Bites & Pastries', stateOrigin: 'All', cost: 1800, hunger: 30, joy: 14, icon: '🥟', desc: 'Golden buttery crust stuffed with minced beef, potatoes, and carrots.' },
  { id: 'fd_chicken_pie', name: 'Savory Chicken Pie with Herbs', category: 'Street Bites & Pastries', stateOrigin: 'All', cost: 2000, hunger: 32, joy: 15, icon: '🥟', desc: 'Golden pastry filled with shredded chicken breast and seasoning.' },
  { id: 'fd_puff_puff_box', name: 'Golden Sugar Puff-Puff Box (12 Pieces)', category: 'Street Bites & Pastries', stateOrigin: 'All', cost: 1500, hunger: 25, joy: 16, icon: '🍩', desc: 'Fluffy deep-fried dough balls lightly dusted with powdered sugar.' },
  { id: 'fd_akara_agege', name: 'Fresh Hot Akara Balls & Agege Soft Bread', category: 'Street Bites & Pastries', stateOrigin: 'Lagos', cost: 1200, hunger: 35, joy: 16, icon: '🍞', desc: 'Golden bean cakes paired with stretchy, sweet Agege bread loaf.' },
  { id: 'fd_moi_moi_egg', name: 'Special Moi-Moi with Boiled Egg & Fish', category: 'Street Bites & Pastries', stateOrigin: 'All', cost: 2200, hunger: 38, joy: 16, icon: '🫔', desc: 'Steamed bean pudding wrapped in fresh banana leaves.' },
  { id: 'fd_gizdodo', name: 'Peppered Gizdodo (Gizzard & Fried Dodo)', category: 'Street Bites & Pastries', stateOrigin: 'Lagos', cost: 4200, hunger: 42, joy: 22, icon: '🍲', desc: 'Fried ripe plantain cubes and spicy chicken gizzards in bell pepper sauce.' },
  { id: 'fd_abacha_salad', name: 'Abacha & Ugba (African Salad with Fried Fish)', category: 'Street Bites & Pastries', stateOrigin: 'Enugu', cost: 3800, hunger: 40, joy: 22, icon: '🥗', desc: 'Dried shredded cassava tossed in palm oil, garden eggs, and fried fish.' },
  { id: 'fd_roasted_corn_ube', name: 'Roasted Cob Corn & Bush Pear (Ube)', category: 'Street Bites & Pastries', stateOrigin: 'All', cost: 1000, hunger: 25, joy: 14, icon: '🌽', desc: 'Charcoal roasted sweet corn paired with hot boiled purple bush pear.' },
  { id: 'fd_plantain_chips', name: 'Crunchy Salted Plantain Chips Pack', category: 'Street Bites & Pastries', stateOrigin: 'All', cost: 800, hunger: 15, joy: 10, icon: '🍌', desc: 'Crispy wafer slices of ripe and unripe plantain.' },
  { id: 'fd_gala_roll', name: 'Pure Beef Sausage Roll (Gala)', category: 'Street Bites & Pastries', stateOrigin: 'All', cost: 500, hunger: 12, joy: 8, icon: '🥖', desc: 'Legendary traffic snack companion.' },
  { id: 'fd_indomie_egg_suya', name: 'Indomie Special with 2 Eggs & Suya Strips', category: 'Street Bites & Pastries', stateOrigin: 'All', cost: 2500, hunger: 42, joy: 18, icon: '🍜', desc: 'Two packs of noodles fried with diced onions, tomatoes, and fried eggs.' },

  // Chilled Drinks & Beverages
  { id: 'fd_chapman_cocktail', name: 'Chilled Chapman Cocktail with Cucumber & Orange', category: 'Chilled Drinks', stateOrigin: 'Lagos', cost: 2000, hunger: 15, joy: 20, icon: '🍹', desc: 'Classic Nigerian mocktail with Angostura bitters and grenadine.' },
  { id: 'fd_zobo_pineapple', name: 'Ice-Cold Zobo Drink with Ginger & Pineapple', category: 'Chilled Drinks', stateOrigin: 'All', cost: 1200, hunger: 12, joy: 18, icon: '🍷', desc: 'Hibiscus flower infusion brewed with cloves, ginger, and honey.' },
  { id: 'fd_palm_wine', name: 'Fresh Sweet Palm Wine (Nkwu Elu Tap)', category: 'Chilled Drinks', stateOrigin: 'Imo', cost: 2500, hunger: 15, joy: 24, icon: '🍶', desc: 'Undiluted tapped palm wine straight from oil palm tree tops.' },
  { id: 'fd_kunu_aya', name: 'Chilled Tiger Nut Milk (Kunu Aya)', category: 'Chilled Drinks', stateOrigin: 'Kano', cost: 1500, hunger: 20, joy: 18, icon: '🥛', desc: 'Creamy blend of tiger nuts, dates, and coconut milk.' },
  { id: 'fd_fura_da_nono', name: 'Northern Fura da Nono with Millet Balls', category: 'Chilled Drinks', stateOrigin: 'Kano', cost: 1800, hunger: 32, joy: 20, icon: '🥛', desc: 'Fermented cow milk yoghurt mixed with spiced millet flour dumplings.' },
  { id: 'fd_maltina_can', name: 'Chilled Maltina Malt Beverage Can', category: 'Chilled Drinks', stateOrigin: 'All', cost: 800, hunger: 15, joy: 12, icon: '🍺', desc: 'Nourishing non-alcoholic malt drink with vitamins.' },
  { id: 'fd_malta_guinness', name: 'Malta Guinness Energy Can', category: 'Chilled Drinks', stateOrigin: 'All', cost: 850, hunger: 15, joy: 14, icon: '🍺', desc: 'Rich malty goodness brewed for energy and strength.' },
  { id: 'fd_star_radler', name: 'Star Radler Citrus Beer Can', category: 'Chilled Drinks', stateOrigin: 'All', cost: 950, hunger: 10, joy: 16, icon: '🍺', desc: 'Crisp lager beer blended with real fruit juice.' },
  { id: 'fd_bigi_cola', name: 'Bigi Premium Cola Bottle 60cl', category: 'Chilled Drinks', stateOrigin: 'All', cost: 400, hunger: 10, joy: 10, icon: '🥤', desc: 'Ice-cold carbonated refreshing cola.' },
  { id: 'fd_chi_exotic', name: 'Chi Exotic Pineapple & Mango Nectar', category: 'Chilled Drinks', stateOrigin: 'All', cost: 1400, hunger: 15, joy: 14, icon: '🧃', desc: '1-litre tetra pack of pure tropical fruit nectar.' },
  { id: 'fd_hollandia_yoghurt', name: 'Hollandia Yoghurt Strawberry 1L', category: 'Chilled Drinks', stateOrigin: 'All', cost: 1800, hunger: 25, joy: 18, icon: '🥛', desc: 'Thick, creamy drinking yoghurt with sweet strawberry taste.' },
  { id: 'fd_fanyogo_strawberry', name: 'FanYogo Frozen Strawberry Pouch', category: 'Chilled Drinks', stateOrigin: 'All', cost: 500, hunger: 12, joy: 14, icon: '🍧', desc: 'Frozen refreshing yoghurt treat perfect for hot afternoons.' },
  { id: 'fd_lucozade_boost', name: 'Lucozade Energy Drink 50cl', category: 'Chilled Drinks', stateOrigin: 'All', cost: 1000, hunger: 12, joy: 15, icon: '⚡', desc: 'Glucose energy drink for rapid mental and physical stamina.' },
  { id: 'fd_five_alive', name: '5Alive Citrus Burst Juice', category: 'Chilled Drinks', stateOrigin: 'All', cost: 1300, hunger: 14, joy: 14, icon: '🍊', desc: 'Blend of five refreshing citrus and apple juices.' },
];

export const EXPANDED_CHOWDECK: FoodItem[] = [
  ...BASE_CHOWDECK,
  ...ADDITIONAL_50_FOOD,
];

// ============================================================================
// 5. EXPANDED ACADEMY COURSES (86+ COURSES AWARDING CERTIFICATES)
// ============================================================================
const BASE_COURSES: CourseItem[] = [
  { id: 'crs_web_dev', title: 'Fullstack Software Engineering', category: 'Technology', certificateName: 'Professional Diploma in Fullstack Software Engineering', certificateCode: 'ACAD-SWE-01', fee: 150000, duration: '6 Lessons', happinessBoost: 25, institution: 'National Institute of Information Technology (NIIT)', desc: 'Master TypeScript, React, Node.js, and cloud architectures.' },
  { id: 'crs_cybersecurity', title: 'Cybersecurity & Ethical Hacking Defense', category: 'Technology', certificateName: 'Certified Cyber Defense & Network Security Specialist', certificateCode: 'ACAD-SEC-02', fee: 180000, duration: '8 Lessons', happinessBoost: 28, institution: 'NITDA Cyber Academy Abuja', desc: 'Learn ethical penetration testing, firewall defenses, and cryptography.' },
  { id: 'crs_data_ai', title: 'Data Science & Machine Learning Engineering', category: 'Technology', certificateName: 'Accredited Data Scientist & AI Practitioner', certificateCode: 'ACAD-DSAI-03', fee: 200000, duration: '8 Lessons', happinessBoost: 30, institution: 'Yaba Tech AI Research Lab', desc: 'Train deep neural models, statistical analysis, and Python pipelines.' },
  { id: 'crs_ui_ux', title: 'Product Design (UI/UX) & Design Systems', category: 'Technology', certificateName: 'Certified User Experience & Interface Designer', certificateCode: 'ACAD-UIX-04', fee: 130000, duration: '4 Lessons', happinessBoost: 22, institution: 'Lagos Design Institute', desc: 'Design mobile and desktop fintech interfaces in Figma.' },
  { id: 'crs_fin_banking', title: 'Investment Banking & Corporate Finance', category: 'Finance & Business', certificateName: 'Certified Corporate Financial Analyst (CCFA)', certificateCode: 'ACAD-FIN-05', fee: 220000, duration: '6 Lessons', happinessBoost: 28, institution: 'Chartered Institute of Bankers of Nigeria (CIBN)', desc: 'Corporate valuation, treasury management, and portfolio investment.' },
  { id: 'crs_real_estate', title: 'Commercial Real Estate Brokerage & Appraisal', category: 'Finance & Business', certificateName: 'Licensed Real Estate Broker & Property Appraiser', certificateCode: 'ACAD-EST-06', fee: 175000, duration: '5 Lessons', happinessBoost: 25, institution: 'Nigerian Institution of Estate Surveyors (NIESV)', desc: 'Property title laws, Governor consent processing, and brokerage.' },
  { id: 'crs_biz_mgmt', title: 'Corporate Affairs & Business Leadership', category: 'Finance & Business', certificateName: 'Executive Diploma in Corporate Business Management', certificateCode: 'ACAD-MGT-07', fee: 160000, duration: '5 Lessons', happinessBoost: 24, institution: 'Lagos Business School (LBS Executive)', desc: 'Scale enterprises, manage balance sheets, and negotiate contracts.' },
  { id: 'crs_pilot_ground', title: 'Commercial Airline Pilot Private Ground School', category: 'Aviation & Marine', certificateName: 'NCAA Commercial Aviation Ground School Certificate', certificateCode: 'ACAD-AVN-08', fee: 850000, duration: '12 Lessons', happinessBoost: 45, institution: 'Nigerian College of Aviation Technology (NCAT Zaria)', desc: 'Aerodynamics, navigation instruments, air traffic control, and FAA/NCAA regulations.' },
  { id: 'crs_marine_nav', title: 'Maritime Navigation & Offshore Rig Safety', category: 'Aviation & Marine', certificateName: 'NIMASA Certified Offshore Marine Safety Officer', certificateCode: 'ACAD-MAR-09', fee: 350000, duration: '6 Lessons', happinessBoost: 32, institution: 'Maritime Academy of Nigeria Oron', desc: 'Vessel command, coastal radar plotting, and offshore survival protocols.' },
  { id: 'crs_nursing_care', title: 'Clinical Nursing & Emergency Trauma Care', category: 'Healthcare', certificateName: 'Registered Healthcare Auxiliary & Emergency Responder', certificateCode: 'ACAD-MED-10', fee: 190000, duration: '8 Lessons', happinessBoost: 28, institution: 'Lagos University Teaching Hospital Academy', desc: 'Patient triage, pharmaceutical dosage, wound care, and CPR certification.' },
  { id: 'crs_pharma_mgmt', title: 'Pharmaceutical Inventory & Drug Dispensing', category: 'Healthcare', certificateName: 'Certified Pharmacy Technician & Dispenser', certificateCode: 'ACAD-PHM-11', fee: 140000, duration: '5 Lessons', happinessBoost: 22, institution: 'Pharmacists Council of Nigeria (PCN)', desc: 'Cold chain storage, prescription auditing, and pharmacological basics.' },
  { id: 'crs_sound_prod', title: 'Afrobeats Music Production & Sound Engineering', category: 'Creative Arts', certificateName: 'Certified Audio Engineer & Music Producer', certificateCode: 'ACAD-SND-12', fee: 160000, duration: '6 Lessons', happinessBoost: 30, institution: 'Mavin Academy & Audio Arts Lagos', desc: 'Logic Pro, ProTools mixing, vocal tuning, drum programming, and mastering.' },
  { id: 'crs_fashion_design', title: 'Haute Couture & Traditional African Fashion', category: 'Creative Arts', certificateName: 'Master Fashion Couturier & Pattern Drafter', certificateCode: 'ACAD-FSH-13', fee: 120000, duration: '4 Lessons', happinessBoost: 24, institution: 'Lekki Fashion Academy', desc: 'Pattern drafting, Senator cuts, embroidery techniques, and runway styling.' },
  { id: 'crs_culinary_arts', title: 'Continental & African Gourmet Culinary Arts', category: 'Creative Arts', certificateName: 'Executive Professional Chef Diploma', certificateCode: 'ACAD-CUL-14', fee: 145000, duration: '5 Lessons', happinessBoost: 25, institution: 'Red Dish Culinary Chronicles', desc: 'Pastry making, sauce reductions, plating, and restaurant kitchen safety.' },
  { id: 'crs_solar_eng', title: 'Solar PV Systems & High-Voltage Electrical', category: 'Trades', certificateName: 'Licensed Clean Energy & Solar PV Installation Engineer', certificateCode: 'ACAD-SOL-15', fee: 135000, duration: '4 Lessons', happinessBoost: 24, institution: 'National Power Training Institute (NAPTIN)', desc: 'Design solar inverter systems, lithium battery banks, and solar panel arrays.' },
  { id: 'crs_legal_clerk', title: 'Corporate Legal Secretary & Compliance', category: 'Law & Public Policy', certificateName: 'Certified Legal Clerk & Corporate Secretary', certificateCode: 'ACAD-LAW-16', fee: 155000, duration: '6 Lessons', happinessBoost: 26, institution: 'Nigerian Law School Continuing Education', desc: 'CAC filings, trademark registration, contract drafting, and notary procedures.' },
];

export const EXPANDED_COURSES: CourseItem[] = [
  ...BASE_COURSES,
  ...ADDITIONAL_70_COURSES,
];

// ============================================================================
// 6. EXPANDED BOUTIQUE CATALOG (100+ CLOTHING & ACCESSORY ITEMS)
// ============================================================================
export const EXPANDED_BOUTIQUE: BoutiqueItem[] = [
  // Royal Agbada (15 items)
  { id: 'btq_agb_royal_gold', name: '24K Gold Embroidered Royal Agbada & Fila', category: 'Royal Agbada', stateOrigin: 'Oyo', price: 250000, prestige: 'VIP Royalty', icon: '👑', desc: 'Heavy hand-stitched silk agbada fit for traditional monarchs.' },
  { id: 'btq_agb_white_monarch', name: 'Pure White Swiss Voile Agbada with Pearl Buttons', category: 'Royal Agbada', stateOrigin: 'Lagos', price: 180000, prestige: 'Very High', icon: '🥻', desc: 'Pristine white fabric with subtle self-colored geometric embroidery.' },
  { id: 'btq_agb_onyx_black', name: 'Onyx Black Wool Agbada with Silver Threading', category: 'Royal Agbada', stateOrigin: 'Abuja', price: 210000, prestige: 'Very High', icon: '🥻', desc: 'Dignified dark tones preferred by senators and oil magnates.' },
  { id: 'btq_agb_emerald_velvet', name: 'Emerald Green Velvet Agbada with Gold Cuffs', category: 'Royal Agbada', stateOrigin: 'Kano', price: 290000, prestige: 'VIP Royalty', icon: '🥻', desc: 'Lush velvet robe with aristocratic Hausa knot embroidery.' },
  { id: 'btq_agb_burgundy_damask', name: 'Burgundy Damask Agbada with Hand-Dyed Fila', category: 'Royal Agbada', stateOrigin: 'Oyo', price: 195000, prestige: 'Very High', icon: '🥻', desc: 'Rich burgundy sheen that captures golden light at wedding banquets.' },
  { id: 'btq_agb_asooke_heritage', name: 'Vintage Hand-Woven Aso-Oke 3-Piece Agbada', category: 'Royal Agbada', stateOrigin: 'Ogun', price: 340000, prestige: 'VIP Royalty', icon: '🥻', desc: 'Authentic loom-woven cotton with heritage metallic thread accents.' },
  { id: 'btq_agb_navy_presidential', name: 'Midnight Navy Blue Presidential Agbada', category: 'Royal Agbada', stateOrigin: 'Abuja', price: 230000, prestige: 'Very High', icon: '🥻', desc: 'Executive presidential cut worn to state banquets and gala dinners.' },
  { id: 'btq_agb_cream_cashmere', name: 'Italian Cashmere Cream 4-Piece Agbada Set', category: 'Royal Agbada', stateOrigin: 'Lagos', price: 380000, prestige: 'Billionaire', icon: '👑', desc: 'Featherlight imported Italian cashmere with matching trousers and undershirt.' },
  { id: 'btq_agb_champagne_brocade', name: 'Champagne Gold Brocade Agbada Set', category: 'Royal Agbada', stateOrigin: 'Kano', price: 220000, prestige: 'Very High', icon: '🥻', desc: 'Intricate jacquard brocade texture with shimmering champagne undertones.' },
  { id: 'btq_agb_royal_purple', name: 'Royal Purple Imperial Agbada with Crystal Trim', category: 'Royal Agbada', stateOrigin: 'Lagos', price: 275000, prestige: 'VIP Royalty', icon: '🥻', desc: 'Swarovski crystal button trims and matching purple cap.' },
  { id: 'btq_agb_sunset_terracotta', name: 'Terracotta Earth Tone Agbada Set', category: 'Royal Agbada', stateOrigin: 'Oyo', price: 165000, prestige: 'High', icon: '🥻', desc: 'Warm African earth tones with clean hand-embroidered neckline.' },
  { id: 'btq_agb_silver_platinum', name: 'Platinum Silver Lurex Agbada Ensemble', category: 'Royal Agbada', stateOrigin: 'Abuja', price: 320000, prestige: 'VIP Royalty', icon: '👑', desc: 'Reflective platinum threads tailored for grand entrance owambe celebrations.' },
  { id: 'btq_agb_charcoal_minimalist', name: 'Charcoal Minimalist Modern Cut Agbada', category: 'Royal Agbada', stateOrigin: 'Lagos', price: 175000, prestige: 'High', icon: '🥻', desc: 'Streamlined silhouette designed for younger tech founders and creatives.' },
  { id: 'btq_agb_forest_green', name: 'Forest Green Heavy Jacquard Agbada', category: 'Royal Agbada', stateOrigin: 'Imo', price: 190000, prestige: 'Very High', icon: '🥻', desc: 'Substantial structured drape with matching green suede cap.' },
  { id: 'btq_agb_billionaire_gold', name: 'Bespoke Solid 24K Thread Babanriga (Northern Grand Agbada)', category: 'Royal Agbada', stateOrigin: 'Kano', price: 750000, prestige: 'Billionaire', icon: '👑', desc: 'Woven with real gold-coated threads by royal master weavers in Kano.' },

  // Senator Suits (15 items)
  { id: 'btq_sen_black_gold', name: 'Midnight Black Senator with 18K Gold Buttons', category: 'Senator Suits', stateOrigin: 'Imo', price: 95000, prestige: 'High', icon: '👔', desc: 'Sharp high-collar cut popular among Eastern business tycoons.' },
  { id: 'btq_sen_navy_white', name: 'Navy Blue Senator with White Piping Detail', category: 'Senator Suits', stateOrigin: 'Lagos', price: 85000, prestige: 'High', icon: '👔', desc: 'Crisp contrasting piping on collar and breast pocket.' },
  { id: 'btq_sen_wine_red', name: 'Wine Red Wool Senator with Double Pocket Flaps', category: 'Senator Suits', stateOrigin: 'Imo', price: 92000, prestige: 'High', icon: '👔', desc: 'Deep wine red shade tailored with clean tapered slacks.' },
  { id: 'btq_sen_olive_military', name: 'Olive Green Military Cut Senator with Epaulets', category: 'Senator Suits', stateOrigin: 'Abuja', price: 110000, prestige: 'Very High', icon: '👔', desc: 'Structured military shoulder epaulets with bronze insignia buttons.' },
  { id: 'btq_sen_sky_blue', name: 'Sky Blue Summer Linen Senator Suit', category: 'Senator Suits', stateOrigin: 'Lagos', price: 78000, prestige: 'Standard', icon: '👔', desc: 'Breathable pure linen suited for hot afternoon boardroom meetings.' },
  { id: 'btq_sen_charcoal_grey', name: 'Charcoal Grey Wool Senator with Asymmetric Zip', category: 'Senator Suits', stateOrigin: 'Abuja', price: 120000, prestige: 'Very High', icon: '👔', desc: 'Modern diagonal zipper closure with hidden chest pocket.' },
  { id: 'btq_sen_chocolate_brown', name: 'Chocolate Brown Cashmere Senator with Cufflinks', category: 'Senator Suits', stateOrigin: 'Imo', price: 105000, prestige: 'High', icon: '👔', desc: 'Warm mocha cashmere paired with custom wooden cufflinks.' },
  { id: 'btq_sen_ivory_cream', name: 'Ivory Cream Senator with Embroidered Collar', category: 'Senator Suits', stateOrigin: 'Rivers', price: 98000, prestige: 'High', icon: '👔', desc: 'Elegant cream tone with delicate geometric embroidery around the mandarin neck.' },
  { id: 'btq_sen_mustard_yellow', name: 'Mustard Gold Contemporary Cut Senator', category: 'Senator Suits', stateOrigin: 'Lagos', price: 88000, prestige: 'High', icon: '👔', desc: 'Bold trendsetting colorway with fitted slim trousers.' },
  { id: 'btq_sen_teal_blue', name: 'Deep Teal Senator with Metallic Chest Patch', category: 'Senator Suits', stateOrigin: 'Rivers', price: 115000, prestige: 'Very High', icon: '👔', desc: 'Rich jewel tone with modern brushed steel chest badge.' },
  { id: 'btq_sen_burgundy_velvet', name: 'Burgundy Velvet Lapel Executive Senator', category: 'Senator Suits', stateOrigin: 'Abuja', price: 140000, prestige: 'Very High', icon: '👔', desc: 'Subtle velvet trim along the lapel and sleeve cuffs.' },
  { id: 'btq_sen_stone_grey', name: 'Stone Grey Minimalist Senator 2-Piece', category: 'Senator Suits', stateOrigin: 'Lagos', price: 82000, prestige: 'Standard', icon: '👔', desc: 'Everyday executive staple designed for maximum comfort.' },
  { id: 'btq_sen_royal_blue', name: 'Vibrant Royal Blue Senator with Silver Studs', category: 'Senator Suits', stateOrigin: 'Imo', price: 100000, prestige: 'High', icon: '👔', desc: 'Radiant blue wool adorned with polished silver snap buttons.' },
  { id: 'btq_sen_camel_tan', name: 'Camel Tan Safari Senator with Front Belting', category: 'Senator Suits', stateOrigin: 'Abuja', price: 125000, prestige: 'Very High', icon: '👔', desc: 'Safari-inspired mid-belt with tailored front pleats.' },
  { id: 'btq_sen_billionaire_silk', name: 'Italian Raw Silk Black Tie Senator with Diamond Studs', category: 'Senator Suits', stateOrigin: 'Abuja', price: 350000, prestige: 'Billionaire', icon: '👑', desc: 'Pure raw silk with certified lab-grown diamond buttons.' },

  // Ankara & Lace (15 items)
  { id: 'btq_ank_mermaid_gown', name: 'Lekki Couture Ankara Fishtail Mermaid Gown', category: 'Ankara & Lace', stateOrigin: 'Lagos', price: 135000, prestige: 'Very High', icon: '👗', desc: 'Corseted waist with flared organza frills at the base.' },
  { id: 'btq_ank_swiss_lace', name: 'Swiss Voile Dry Lace 6-Yard Wrapper & Blouse', category: 'Ankara & Lace', stateOrigin: 'Oyo', price: 190000, prestige: 'VIP Royalty', icon: '👗', desc: 'Heavy corded Swiss lace with matching headgear (Gele).' },
  { id: 'btq_ank_wax_kente', name: 'Real Dutch Wax Ankara Geometric Kimono Jacket', category: 'Ankara & Lace', stateOrigin: 'Lagos', price: 65000, prestige: 'Standard', icon: '👘', desc: 'Versatile oversized statement jacket with deep side pockets.' },
  { id: 'btq_ank_george_wrapper', name: 'Original India George Wrapper with Gold Beading', category: 'Ankara & Lace', stateOrigin: 'Rivers', price: 240000, prestige: 'VIP Royalty', icon: '👗', desc: 'Heavy George fabric with intricate gold bead embroidery for Niger Delta brides.' },
  { id: 'btq_ank_french_lace_gown', name: 'Hand-Beaded French Tulle Lace Evening Gown', category: 'Ankara & Lace', stateOrigin: 'Abuja', price: 280000, prestige: 'VIP Royalty', icon: '👗', desc: 'Sequined sheer neckline with trailing train for red carpet galas.' },
  { id: 'btq_ank_blazer_dress', name: 'Ankara Double-Breasted Power Blazer Dress', category: 'Ankara & Lace', stateOrigin: 'Lagos', price: 85000, prestige: 'High', icon: '👗', desc: 'Modern corporate chic dress for female founders and directors.' },
  { id: 'btq_ank_organza_top', name: 'Sheer Organza Blouse with Ankara Bustier', category: 'Ankara & Lace', stateOrigin: 'Lagos', price: 55000, prestige: 'Standard', icon: '👚', desc: 'Puffed organza sleeves paired with internal boned bodice.' },
  { id: 'btq_ank_maxi_dress', name: 'Tiered Boho Ankara Maxi Dress with Pockets', category: 'Ankara & Lace', stateOrigin: 'Oyo', price: 48000, prestige: 'Standard', icon: '👗', desc: 'Flowing breathable summer dress in vibrant sunflower yellow print.' },
  { id: 'btq_ank_pleated_skirt', name: 'High-Waisted Accordion Pleated Ankara Skirt', category: 'Ankara & Lace', stateOrigin: 'Lagos', price: 42000, prestige: 'Standard', icon: '👗', desc: 'Permanent pleated wax fabric that swishes as you walk.' },
  { id: 'btq_ank_jumpsuit_cape', name: 'Wide-Leg Ankara Jumpsuit with Detachable Cape', category: 'Ankara & Lace', stateOrigin: 'Abuja', price: 95000, prestige: 'High', icon: '👗', desc: 'Sleek backless jumpsuit with dramatic floor-length cape.' },
  { id: 'btq_ank_velvet_lace_combo', name: 'Royal Velvet & Cord Lace Fusion Dress', category: 'Ankara & Lace', stateOrigin: 'Imo', price: 160000, prestige: 'Very High', icon: '👗', desc: 'Plush velvet bodice tapering into exquisite lace tiers.' },
  { id: 'btq_ank_offshoulder_corset', name: 'Off-Shoulder Ankara Corset Top & Flared Pants', category: 'Ankara & Lace', stateOrigin: 'Lagos', price: 72000, prestige: 'Standard', icon: '👗', desc: 'Structured boning that sculpts the waistline with matching wide pants.' },
  { id: 'btq_ank_brocade_bubu', name: 'Biliki Silk Brocade Bubu Gown with Crystal Neck', category: 'Ankara & Lace', stateOrigin: 'Abuja', price: 110000, prestige: 'Very High', icon: '👗', desc: 'Effortless flowing kaftan silhouette dripping in luxury comfort.' },
  { id: 'btq_ank_wedding_george', name: 'Gold-Woven Coral Bead Wedding George Ensemble', category: 'Ankara & Lace', stateOrigin: 'Imo', price: 320000, prestige: 'VIP Royalty', icon: '👗', desc: 'Exquisite traditional wedding attire with authentic red coral bead accents.' },
  { id: 'btq_ank_diamond_lace', name: 'Bespoke Austrian Crystal Net Lace Gown', category: 'Ankara & Lace', stateOrigin: 'Lagos', price: 550000, prestige: 'Billionaire', icon: '👑', desc: 'Hand-sewn with 2,000 sparkling Austrian crystals.' },

  // Streetwear & Modern (15 items)
  { id: 'btq_str_cargo_pants', name: 'Heavyweight Black Tactical Cargo Pants', category: 'Streetwear', stateOrigin: 'Lagos', price: 35000, prestige: 'Standard', icon: '👖', desc: 'Multi-pocket tactical pants with adjustable strap cuffs.' },
  { id: 'btq_str_graphic_tee', name: 'Yaba Tech Streetwear Oversized Graphic Tee', category: 'Streetwear', stateOrigin: 'Lagos', price: 22000, prestige: 'Standard', icon: '👕', desc: '280 GSM heavyweight cotton with retro Lagos bus graphic print.' },
  { id: 'btq_str_bomber_jacket', name: 'Satin Embroidered Afrobeats Tour Bomber Jacket', category: 'Streetwear', stateOrigin: 'Lagos', price: 65000, prestige: 'High', icon: '🧥', desc: 'Shiny reversible satin jacket with ribbed collar and golden zip.' },
  { id: 'btq_str_hoodie_fleece', name: 'Distressed Acid-Wash Fleece Hoodie', category: 'Streetwear', stateOrigin: 'Lagos', price: 42000, prestige: 'Standard', icon: '🧥', desc: 'Washed charcoal hoodie with double-layer hood and kangaroo pocket.' },
  { id: 'btq_str_leather_varsity', name: 'Wool & Genuine Leather Letterman Varsity Jacket', category: 'Streetwear', stateOrigin: 'Abuja', price: 120000, prestige: 'Very High', icon: '🧥', desc: 'Chenille patches and genuine cowhide leather sleeves.' },
  { id: 'btq_str_tracksuit_set', name: 'Reflective Neon Nylon Tracksuit Two-Piece Set', category: 'Streetwear', stateOrigin: 'Lagos', price: 58000, prestige: 'Standard', icon: '🏃', desc: 'Water-resistant windbreaker with matching track pants.' },
  { id: 'btq_str_distressed_denim', name: 'Japanese Selvedge Distressed Stacked Denim Jeans', category: 'Streetwear', stateOrigin: 'Lagos', price: 75000, prestige: 'High', icon: '👖', desc: 'Premium raw selvedge denim with custom distressing and paint splatters.' },
  { id: 'btq_str_flannel_overshirt', name: 'Plaid Heavy Cotton Flannel Overshirt', category: 'Streetwear', stateOrigin: 'All', price: 32000, prestige: 'Standard', icon: '👔', desc: 'Thick layered shirt with dual chest flap pockets.' },
  { id: 'btq_str_leather_biker', name: 'Heavy Cowhide Leather Biker Jacket with Asym Zip', category: 'Streetwear', stateOrigin: 'Lagos', price: 185000, prestige: 'Very High', icon: '🧥', desc: 'Classic Schott-style motorcycle jacket with silver hardware.' },
  { id: 'btq_str_mesh_jersey', name: 'Super Eagles Retro 1994 Green Mesh Jersey', category: 'Streetwear', stateOrigin: 'All', price: 38000, prestige: 'Standard', icon: '⚽', desc: 'Iconic throwback vintage football jersey with ribbed collar.' },
  { id: 'btq_str_puffer_vest', name: 'Matte Black Down Puffer Vest with High Collar', category: 'Streetwear', stateOrigin: 'Abuja', price: 48000, prestige: 'Standard', icon: '🦺', desc: 'Warm insulated sleeveless vest for cool Harmattan mornings.' },
  { id: 'btq_str_sweatpants_heavy', name: 'Heavyweight Loopback French Terry Sweatpants', category: 'Streetwear', stateOrigin: 'Lagos', price: 30000, prestige: 'Standard', icon: '👖', desc: 'Ultra-plush lounging and gym sweatpants with metal aglet drawstrings.' },
  { id: 'btq_str_denim_jacket', name: 'Sherpa-Lined Vintage Washed Denim Trucker Jacket', category: 'Streetwear', stateOrigin: 'All', price: 55000, prestige: 'Standard', icon: '🧥', desc: 'Cozy faux-shearling collar and warm quilted interior.' },
  { id: 'btq_str_designer_hoodie', name: 'Limited Edition Milan Runway Monogram Hoodie', category: 'Streetwear', stateOrigin: 'Lagos', price: 210000, prestige: 'Very High', icon: '🧥', desc: 'Imported high-fashion designer release with embroidered monogram.' },
  { id: 'btq_str_leather_trench', name: 'Full-Length Matrix Black Leather Trench Coat', category: 'Streetwear', stateOrigin: 'Abuja', price: 290000, prestige: 'VIP Royalty', icon: '🧥', desc: 'Dramatic floor-length supple lambskin leather statement coat.' },

  // Watches & Luxury Jewelry (15 items)
  { id: 'btq_lux_cuban_chain', name: '18K Yellow Gold 15mm Miami Cuban Link Chain', category: 'Watches & Jewelry', stateOrigin: 'Lagos', price: 2500000, prestige: 'Billionaire', icon: '📿', desc: 'Heavy solid gold links with custom iced box clasp.' },
  { id: 'btq_lux_rolex_daydate', name: 'Rolex Day-Date 40mm 18K Yellow Gold Presidential Watch', category: 'Watches & Jewelry', stateOrigin: 'Abuja', price: 18500000, prestige: 'Billionaire', icon: '⌚', desc: 'Fluted bezel, champagne dial, and iconic Presidential gold bracelet.' },
  { id: 'btq_lux_audemars_royal', name: 'Audemars Piguet Royal Oak Stainless Steel 41mm', category: 'Watches & Jewelry', stateOrigin: 'Lagos', price: 16000000, prestige: 'Billionaire', icon: '⌚', desc: 'Grand tapisserie blue dial with integrated steel bracelet.' },
  { id: 'btq_lux_patek_philippe', name: 'Patek Philippe Nautilus Rose Gold Chronograph', category: 'Watches & Jewelry', stateOrigin: 'Abuja', price: 28000000, prestige: 'Billionaire', icon: '⌚', desc: 'Ultimate watch connoisseur grail in 18K rose gold.' },
  { id: 'btq_lux_diamond_tennis', name: '10 Carat VVS Diamond Tennis Bracelet', category: 'Watches & Jewelry', stateOrigin: 'Lagos', price: 4200000, prestige: 'Billionaire', icon: '💎', desc: 'Four-prong white gold setting with round brilliant cut diamonds.' },
  { id: 'btq_lux_coral_beads', name: 'Authentic Royal Edo Coral Bead Choker & Wristlets', category: 'Watches & Jewelry', stateOrigin: 'Edo', price: 450000, prestige: 'VIP Royalty', icon: '📿', desc: 'Rare deep red natural sea coral beads worn by royalty.' },
  { id: 'btq_lux_gold_pendant_eagle', name: 'Nigerian Coat of Arms Solid Gold Medallion Pendant', category: 'Watches & Jewelry', stateOrigin: 'Abuja', price: 850000, prestige: 'Very High', icon: '🏅', desc: 'Detailed engraved eagle and dual horses in 18K gold.' },
  { id: 'btq_lux_cartier_santos', name: 'Cartier Santos Two-Tone Steel & Gold Watch', category: 'Watches & Jewelry', stateOrigin: 'Lagos', price: 4800000, prestige: 'Very High', icon: '⌚', desc: 'Iconic square aviator watch with exposed gold screw bezel.' },
  { id: 'btq_lux_richard_mille', name: 'Richard Mille RM 11-03 Carbon Chronograph Watch', category: 'Watches & Jewelry', stateOrigin: 'Abuja', price: 65000000, prestige: 'Billionaire', icon: '⌚', desc: 'Flyback chronograph with skeletonized titanium automatic movement.' },
  { id: 'btq_lux_diamond_grillz', name: 'Custom 8-Top VVS Diamond Dental Grillz', category: 'Watches & Jewelry', stateOrigin: 'Lagos', price: 1600000, prestige: 'Very High', icon: '✨', desc: 'Handset flawless diamonds in 14K white gold dental setting.' },
  { id: 'btq_lux_rolex_submariner', name: 'Rolex Submariner Date Ceramic Bezel 41mm', category: 'Watches & Jewelry', stateOrigin: 'Lagos', price: 7200000, prestige: 'Billionaire', icon: '⌚', desc: 'Classic black dial diving watch with Oysterlock clasp.' },
  { id: 'btq_lux_emerald_ring', name: 'Columbian Emerald & Diamond Cocktail Ring', category: 'Watches & Jewelry', stateOrigin: 'Abuja', price: 1800000, prestige: 'Very High', icon: '💍', desc: 'Vivid green emerald flanked by tapered baguette diamonds.' },
  { id: 'btq_lux_cartier_love', name: 'Cartier Love Bracelet in 18K Rose Gold with Screwdriver', category: 'Watches & Jewelry', stateOrigin: 'Lagos', price: 3600000, prestige: 'Billionaire', icon: '💍', desc: 'Timeless oval bangle locked by its signature gold screwdriver.' },
  { id: 'btq_lux_gold_rope_chain', name: '14K Yellow Gold 6mm Diamond Cut Rope Chain', category: 'Watches & Jewelry', stateOrigin: 'Lagos', price: 950000, prestige: 'Very High', icon: '📿', desc: 'Twisted spiral rope chain with brilliant light-catching diamond cuts.' },
  { id: 'btq_lux_hublot_bigbang', name: 'Hublot Big Bang Unico Ceramic Chronograph', category: 'Watches & Jewelry', stateOrigin: 'Lagos', price: 8900000, prestige: 'Billionaire', icon: '⌚', desc: 'Matte black microblasted ceramic case with skeleton dial.' },

  // Luxury Footwear (15 items)
  { id: 'btq_ftw_louboutin_oxford', name: 'Christian Louboutin Red Bottom Patent Leather Oxfords', category: 'Luxury Footwear', stateOrigin: 'Lagos', price: 420000, prestige: 'Very High', icon: '👞', desc: 'High-gloss black dress shoes with iconic scarlet red lacquer soles.' },
  { id: 'btq_ftw_berluti_loafers', name: 'Berluti Venezia Leather Patina Loafers', category: 'Luxury Footwear', stateOrigin: 'Abuja', price: 580000, prestige: 'Billionaire', icon: '👞', desc: 'Hand-burnished leather with rich dual-tone tobacco patina.' },
  { id: 'btq_ftw_jordans_retro1', name: 'Air Jordan 1 Retro High OG Chicago Colorway', category: 'Luxury Footwear', stateOrigin: 'Lagos', price: 180000, prestige: 'High', icon: '👟', desc: 'Original high-top basketball sneaker in classic white, black and red.' },
  { id: 'btq_ftw_gucci_mule', name: 'Gucci Horsebit Leather Slippers / Mules', category: 'Luxury Footwear', stateOrigin: 'Lagos', price: 340000, prestige: 'Very High', icon: '🥿', desc: 'Gold horsebit buckle with supple leather lining for effortless owambe style.' },
  { id: 'btq_ftw_hermes_sandals', name: 'Hermès Chypre Leather Comfort Slide Sandals', category: 'Luxury Footwear', stateOrigin: 'Abuja', price: 410000, prestige: 'Very High', icon: '🩴', desc: 'Calfskin slides with anatomical rubber soles and adjustable strap.' },
  { id: 'btq_ftw_balenciaga_triple_s', name: 'Balenciaga Triple S Chunky Sneakers', category: 'Luxury Footwear', stateOrigin: 'Lagos', price: 460000, prestige: 'Very High', icon: '👟', desc: 'Oversized multi-layer sole unit with embroidered size on the toe.' },
  { id: 'btq_ftw_chelsea_boots', name: 'Italian Suede Chelsea Boots with Crepe Sole', category: 'Luxury Footwear', stateOrigin: 'Lagos', price: 120000, prestige: 'High', icon: '👢', desc: 'Snug elastic side gores and plush sand suede leather.' },
  { id: 'btq_ftw_alexander_mcqueen', name: 'Alexander McQueen Oversized Leather Sneakers', category: 'Luxury Footwear', stateOrigin: 'Lagos', price: 290000, prestige: 'High', icon: '👟', desc: 'Clean white smooth calf leather sneaker with thick platform sole.' },
  { id: 'btq_ftw_crocodile_shoes', name: 'Handcrafted Genuine Nile Crocodile Skin Loafers', category: 'Luxury Footwear', stateOrigin: 'Kano', price: 850000, prestige: 'Billionaire', icon: '👞', desc: 'Exotic scaled crocodile leather crafted by master cordwainers.' },
  { id: 'btq_ftw_travisscott_jordan', name: 'Travis Scott x Air Jordan 1 Low Reverse Mocha', category: 'Luxury Footwear', stateOrigin: 'Lagos', price: 620000, prestige: 'Very High', icon: '👟', desc: 'Reverse Nike swoosh with Cactus Jack heel embroidery.' },
  { id: 'btq_ftw_dior_b23', name: 'Dior B23 High-Top Oblique Monogram Sneakers', category: 'Luxury Footwear', stateOrigin: 'Lagos', price: 490000, prestige: 'Very High', icon: '👟', desc: 'Translucent mesh overlays revealing the classic Dior Oblique pattern.' },
  { id: 'btq_ftw_prada_monolith', name: 'Prada Monolith Lug-Sole Combat Boots', category: 'Luxury Footwear', stateOrigin: 'Abuja', price: 680000, prestige: 'Billionaire', icon: '👢', desc: 'Brushed leather boots with detachable nylon zip pouches.' },
  { id: 'btq_ftw_bottega_slide', name: 'Bottega Veneta Intrecciato Woven Slide Sandals', category: 'Luxury Footwear', stateOrigin: 'Lagos', price: 360000, prestige: 'Very High', icon: '🩴', desc: 'Hand-woven wide leather strap in signature parakeet green.' },
  { id: 'btq_ftw_loropiana_summer', name: 'Loro Piana Open Walk Suede Summer Loafers', category: 'Luxury Footwear', stateOrigin: 'Abuja', price: 540000, prestige: 'Billionaire', icon: '👞', desc: 'Water-repellent calfskin suede with ultra-light rubber soles.' },
  { id: 'btq_ftw_gold_spurred_boots', name: 'Bespoke 24K Gold Buckled Western Ankle Boots', category: 'Luxury Footwear', stateOrigin: 'Lagos', price: 950000, prestige: 'Billionaire', icon: '👢', desc: 'Hand-tooled cordovan leather with solid gold side buckles.' },

  // Accessories & Eyewear (12 items)
  { id: 'btq_acc_cartier_glasses', name: 'Cartier C Décor Rimless Buffalo Horn Sunglasses', category: 'Accessories', stateOrigin: 'Abuja', price: 850000, prestige: 'Billionaire', icon: '🕶️', desc: 'Rare genuine white buffalo horn temples with gold C Décor hinges.' },
  { id: 'btq_acc_louis_vuitton_belt', name: 'Louis Vuitton Initiales 40mm Reversible Belt', category: 'Accessories', stateOrigin: 'Lagos', price: 320000, prestige: 'Very High', icon: '🎗️', desc: 'Damier graphite canvas with brushed ruthenium LV buckle.' },
  { id: 'btq_acc_hermes_birkin', name: 'Hermès Birkin 30 Togo Leather Handbag in Gold', category: 'Accessories', stateOrigin: 'Abuja', price: 14500000, prestige: 'Billionaire', icon: '👜', desc: 'The most coveted luxury handbag in the world with gold palladium hardware.' },
  { id: 'btq_acc_dior_saddle_bag', name: 'Dior Oblique Canvas Saddle Crossbody Bag', category: 'Accessories', stateOrigin: 'Lagos', price: 1850000, prestige: 'Very High', icon: '👜', desc: 'Curved saddle silhouette with industrial Christian Dior magnetic buckle.' },
  { id: 'btq_acc_gucci_fedora', name: 'Gucci Wide-Brim Panama Straw Hat with Web Ribbon', category: 'Accessories', stateOrigin: 'Lagos', price: 210000, prestige: 'High', icon: '👒', desc: 'Hand-woven straw hat finished with signature green and red stripe ribbon.' },
  { id: 'btq_acc_fila_asooke', name: 'Royal Hand-Woven Aso-Oke Gobi Fila (Embroidered)', category: 'Accessories', stateOrigin: 'Oyo', price: 45000, prestige: 'High', icon: '🎩', desc: 'Crisp foldable cap embroidered in royal crest motifs.' },
  { id: 'btq_acc_prada_bucket', name: 'Prada Re-Nylon Triangle Logo Bucket Hat', category: 'Accessories', stateOrigin: 'Lagos', price: 280000, prestige: 'Very High', icon: '🧢', desc: 'Sustainable regenerated nylon with enameled metal triangle logo.' },
  { id: 'btq_acc_goyard_wallet', name: 'Goyard Saint Sulpice Hand-Painted Card Holder', category: 'Accessories', stateOrigin: 'Lagos', price: 260000, prestige: 'Very High', icon: '💳', desc: 'Hand-stenciled Goyardine chevron canvas with four card slots.' },
  { id: 'btq_acc_rimowa_trunk', name: 'Rimowa Classic Aluminum Cabin Carry-On Suitcase', category: 'Accessories', stateOrigin: 'Abuja', price: 780000, prestige: 'Very High', icon: '🧳', desc: 'Anodized aluminum grooved suitcase with leather handles and TSA locks.' },
  { id: 'btq_acc_versace_sunglasses', name: 'Versace Medusa Biggie Rectangular Sunglasses', category: 'Accessories', stateOrigin: 'Lagos', price: 195000, prestige: 'High', icon: '🕶️', desc: 'Thick black acetate frames adorned with iconic gold Medusa medallions.' },
  { id: 'btq_acc_chanel_classic', name: 'Chanel Classic Double Flap Quilted Bag in Caviar Leather', category: 'Accessories', stateOrigin: 'Abuja', price: 5800000, prestige: 'Billionaire', icon: '👜', desc: 'Diamond quilted caviar leather with interlocking CC turn-lock clasp.' },
  { id: 'btq_acc_montblanc_pen', name: 'Montblanc Meisterstück 149 Solid Gold Fountain Pen', category: 'Accessories', stateOrigin: 'Abuja', price: 650000, prestige: 'Very High', icon: '✒️', desc: '18K gold nib with platinum inlay, chosen by heads of state to sign treaties.' },
];
