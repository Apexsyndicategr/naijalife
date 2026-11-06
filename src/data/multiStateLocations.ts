/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LocationPOI } from '../types/game';
import { MAP_100_LOCATIONS } from './mapLocations100';
import { NIGERIA_36_STATES_ALPHABETICAL } from './stateLocationsData';
import { CANADA_150_LOCATIONS } from './canadaLocations150';

// Landmark definitions for state maps
export interface StateLandmarkTheme {
  primaryLandmarkName: string;
  primaryLandmarkSubtitle: string;
  primaryLandmarkType: 'rock' | 'lake' | 'monument' | 'bridge';
  secondaryLandmarkName: string;
  secondaryLandmarkSubtitle: string;
  waterfrontName: string;
  waterfrontSubtitle: string;
  waterfrontVessel: string;
  waterfrontVesselName: string;
  airportName: string;
}

export function getStateLandmarks(stateId: string): StateLandmarkTheme {
  const sid = stateId.toLowerCase();
  if (sid === 'canada') {
    return {
      primaryLandmarkName: 'CN Tower & SkyDome',
      primaryLandmarkSubtitle: '553m Architectural Wonder (Toronto, ON)',
      primaryLandmarkType: 'monument',
      secondaryLandmarkName: 'Rocky Mountains & Banff Ridge',
      secondaryLandmarkSubtitle: 'Glacial Peaks of Alberta & BC',
      waterfrontName: 'LAKE ONTARIO & PACIFIC HARBOUR',
      waterfrontSubtitle: 'Queen’s Quay & Vancouver False Creek',
      waterfrontVessel: '🛳️',
      waterfrontVesselName: 'Transatlantic Ferry',
      airportName: 'TORONTO PEARSON INTL AIRPORT (YYZ)',
    };
  }
  if (sid === 'lagos') {
    return {
      primaryLandmarkName: 'Third Mainland Bridge',
      primaryLandmarkSubtitle: '11.8km Lagoon Transit Corridor',
      primaryLandmarkType: 'bridge',
      secondaryLandmarkName: 'Eko Atlantic City',
      secondaryLandmarkSubtitle: 'Reclaimed Financial Peninsula',
      waterfrontName: 'LAGOS LAGOON & ATLANTIC',
      waterfrontSubtitle: 'Lekki Coastal Jetty & Yacht Haven',
      waterfrontVessel: '🛥️',
      waterfrontVesselName: 'Eko Superyacht',
      airportName: 'MURTALA MUHAMMED INTL AIRPORT (LOS)',
    };
  }
  if (sid === 'fct' || sid === 'fct_abuja' || sid === 'abuja') {
    return {
      primaryLandmarkName: 'Zuma Monolith Rock',
      primaryLandmarkSubtitle: 'Gateway Giant Granite Monolith',
      primaryLandmarkType: 'rock',
      secondaryLandmarkName: 'Aso Mountain Peak',
      secondaryLandmarkSubtitle: 'Presidential Monolith Ridge',
      waterfrontName: 'JABI LAKE WATERFRONT',
      waterfrontSubtitle: 'Marina Boardwalk & Jet Ski Basin',
      waterfrontVessel: '🛥️',
      waterfrontVesselName: 'Capital Yacht',
      airportName: 'NNAMDI AZIKIWE INTL AIRPORT (ABV)',
    };
  }
  if (sid === 'imo') {
    return {
      primaryLandmarkName: 'Mbari Cultural Monument',
      primaryLandmarkSubtitle: 'Heritage Igbo Artistry Pavilion',
      primaryLandmarkType: 'monument',
      secondaryLandmarkName: 'Otamiri River Valley',
      secondaryLandmarkSubtitle: 'Eastern Heartland Waterways',
      waterfrontName: 'OGUTA LAKE BLUE WATERFRONT',
      waterfrontSubtitle: 'Confluence of Urashi & Oguta Waters',
      waterfrontVessel: '🚤',
      waterfrontVesselName: 'Oguta Cruiser',
      airportName: 'SAM MBAKWE INTL CARGO AIRPORT (QOW)',
    };
  }
  if (sid === 'rivers') {
    return {
      primaryLandmarkName: 'Bonny River Gulf Estuary',
      primaryLandmarkSubtitle: 'Deepwater Petroleum Terminal',
      primaryLandmarkType: 'lake',
      secondaryLandmarkName: 'Isaac Boro Garden Park',
      secondaryLandmarkSubtitle: 'Historic Civic Freedom Monument',
      waterfrontName: 'PORT HARCOURT HARBOR',
      waterfrontSubtitle: 'Pleasure Park Lagoon & Marina',
      waterfrontVessel: '🛳️',
      waterfrontVesselName: 'NLNG Carrier',
      airportName: 'PORT HARCOURT INTL AIRPORT (PHC)',
    };
  }
  if (sid === 'kano') {
    return {
      primaryLandmarkName: 'Ancient Dala Hill',
      primaryLandmarkSubtitle: 'Historic 1,400-Year Settlement Hill',
      primaryLandmarkType: 'rock',
      secondaryLandmarkName: 'Goron Dutse Peak',
      secondaryLandmarkSubtitle: 'Sahel Panoramic Monolith',
      waterfrontName: 'TIGA LAKE RESERVOIR',
      waterfrontSubtitle: 'Kano Irrigation & Fishery Basin',
      waterfrontVessel: '⛵',
      waterfrontVesselName: 'Sahel Sail',
      airportName: 'MALLAM AMINU KANO INTL (KAN)',
    };
  }
  // Generic state theme
  const st = NIGERIA_36_STATES_ALPHABETICAL.find((s) => s.id === sid);
  return {
    primaryLandmarkName: `${st?.name || 'State'} Central Monument`,
    primaryLandmarkSubtitle: `${st?.slogan || 'Civic Heritage Ground'}`,
    primaryLandmarkType: 'monument',
    secondaryLandmarkName: `${st?.capital || 'Capital'} Highland Ridge`,
    secondaryLandmarkSubtitle: 'Regional Green Valley',
    waterfrontName: `${st?.name?.toUpperCase() || 'STATE'} RIVERFRONT`,
    waterfrontSubtitle: 'Lakeside Recreational Basin',
    waterfrontVessel: '🚤',
    waterfrontVesselName: 'State Cruiser',
    airportName: `${st?.name?.toUpperCase() || 'STATE'} AIRPORT RUNWAY 27`,
  };
}

// Rich Real-Life Locations for Abuja (FCT)
export const ABUJA_LOCATIONS: LocationPOI[] = [
  { id: 'abj_wuse_mkt', name: 'Wuse Ultra-Modern Market', type: 'market', tagLabel: 'Wuse Market', x: 42, y: 38, desc: 'Bustling bazaar famous for gold jewelry, fabrics, shoes and groceries.', floorsCount: 2 },
  { id: 'abj_garki_mkt', name: 'Garki International Market', type: 'market', tagLabel: 'Garki Market', x: 50, y: 38, desc: 'Huge wholesale foodstuff, yam, and provision market.', floorsCount: 2 },
  { id: 'abj_next_spm', name: 'Next Cash & Carry Hypermarket', type: 'supermarket', tagLabel: 'Next Cash&Carry', x: 20, y: 38, desc: 'Massive warehouse hypermarket with electronics, food and home goods.', floorsCount: 2 },
  { id: 'abj_jabi_mall', name: 'Jabi Lake Waterfront Mall', type: 'mall', tagLabel: 'Jabi Mall', x: 12, y: 38, desc: 'Two-story luxury waterfront mall with cinema, food court & promenade.', floorsCount: 2 },
  { id: 'abj_ceddi', name: 'Ceddi Plaza & Cineplex Central Area', type: 'mall', tagLabel: 'Ceddi Plaza', x: 28, y: 38, desc: 'IMAX cinema, cafes, and corporate business boutiques.', floorsCount: 3 },
  { id: 'abj_fmc', name: 'Federal Medical Centre (FMC Jabi)', type: 'hospital', tagLabel: 'FMC Jabi', x: 44, y: 12, desc: 'Tertiary emergency response, trauma center and surgical wing.', floorsCount: 3 },
  { id: 'abj_nat_hsp', name: 'National Hospital Abuja', type: 'hospital', tagLabel: 'National Hosp', x: 52, y: 12, desc: 'Apex federal hospital with helipad and specialist medical wings.', floorsCount: 4 },
  { id: 'abj_cedarcrest', name: 'Cedarcrest Orthopedic Hospital Apo', type: 'hospital', tagLabel: 'Cedarcrest', x: 60, y: 12, desc: 'Elite private surgical hospital with advanced imaging and rehab.', floorsCount: 3 },
  { id: 'abj_cbn', name: 'Central Bank of Nigeria (CBN HQ)', type: 'bank', tagLabel: 'CBN HQ', x: 74, y: 38, desc: 'National monetary headquarters and sovereign currency reserves.', floorsCount: 5 },
  { id: 'abj_zenith', name: 'Zenith Bank Maitama Tower', type: 'bank', tagLabel: 'Zenith Maitama', x: 82, y: 38, desc: 'Corporate banking, forex treasury, and private wealth banking.', floorsCount: 4 },
  { id: 'abj_access', name: 'Access Bank Central Business District', type: 'bank', tagLabel: 'Access Bank', x: 90, y: 38, desc: 'Commercial banking, multi-currency ATM galleries and investment desk.', floorsCount: 3 },
  { id: 'abj_nass', name: 'National Assembly Complex (Senate Dome)', type: 'gov', tagLabel: 'NASS Dome', x: 74, y: 12, desc: 'Green dome chamber for Senate and House of Representatives.', floorsCount: 3 },
  { id: 'abj_three_arms', name: 'Three Arms Presidential Villa Zone', type: 'gov', tagLabel: 'Three Arms', x: 82, y: 12, desc: 'State House Executive Council and presidential administration.', floorsCount: 4 },
  { id: 'abj_sup_court', name: 'Supreme Court & Ministry of Justice', type: 'court', tagLabel: 'Supreme Court', x: 90, y: 12, desc: 'Federal apex courts, constitutional legal chambers.', floorsCount: 3 },
  { id: 'abj_force_hq', name: 'Force Headquarters (Louis Edet House)', type: 'police', tagLabel: 'Police Force HQ', x: 68, y: 22, desc: 'National police inspector general command and emergency dispatch.', floorsCount: 3 },
  { id: 'abj_hilton', name: 'Transcorp Hilton 5-Star Hotel Maitama', type: 'hotel', tagLabel: 'Hilton Maitama', x: 68, y: 56, desc: 'Presidential suites, international buffet, and diplomatic summits.', floorsCount: 5 },
  { id: 'abj_fraser', name: 'Fraser Suites Diplomatic Central', type: 'hotel', tagLabel: 'Fraser Suites', x: 88, y: 56, desc: 'Luxury serviced suites with landscaped swimming pool courtyards.', floorsCount: 4 },
  { id: 'abj_nile_univ', name: 'Nile University of Nigeria', type: 'university', tagLabel: 'Nile Univ', x: 10, y: 12, desc: 'Modern university campus with STEM faculties and medical school.', floorsCount: 3 },
  { id: 'abj_baze_univ', name: 'Baze University Campus & Law Clinic', type: 'university', tagLabel: 'Baze Univ', x: 18, y: 12, desc: 'Private university campus with moot courts and IT laboratories.', floorsCount: 3 },
  { id: 'abj_uniabuja', name: 'University of Abuja (Gwagwalada Main)', type: 'university', tagLabel: 'UniAbuja', x: 26, y: 12, desc: 'Federal university training lawyers, economists and scientists.', floorsCount: 3 },
  { id: 'abj_nat_mosque', name: 'National Central Mosque Abuja', type: 'mosque', tagLabel: 'Nat Mosque', x: 42, y: 52, desc: 'Gleaming golden dome and four towering minarets.', floorsCount: 2 },
  { id: 'abj_nat_church', name: 'National Christian Ecumenical Centre', type: 'church', tagLabel: 'Ecumenical Ctr', x: 50, y: 52, desc: 'Monumental cathedral spire and sacred sanctuary.', floorsCount: 2 },
  { id: 'abj_drumstix', name: 'Drumstix & Maitama Suya Garden Wuse 2', type: 'eatery', tagLabel: 'Drumstix Wuse2', x: 42, y: 72, desc: 'Legendary crispy chicken, shawarma, and night-time suya.', floorsCount: 2 },
  { id: 'abj_kilimanjaro', name: 'Kilimanjaro Quick Restaurant Maitama', type: 'eatery', tagLabel: 'Kilimanjaro', x: 50, y: 72, desc: 'Jollof rice combos, peppered beef, and chilled malt.', floorsCount: 1 },
  { id: 'abj_bank_club', name: 'The Bank VIP Club & Lounge Wuse 2', type: 'club', tagLabel: 'The Bank Club', x: 58, y: 72, desc: 'Elite Abuja nightlife, celebrity tables and Afrobeats DJs.', floorsCount: 2 },
  { id: 'abj_bodyline', name: 'Bodyline Fitness & Gym Maitama', type: 'gym', tagLabel: 'Bodyline Gym', x: 14, y: 72, desc: 'High-end celebrity fitness club, CrossFit, and sauna.', floorsCount: 2 },
  { id: 'abj_coscharis', name: 'Coscharis Motors (BMW & Rolls-Royce)', type: 'dealership', tagLabel: 'Coscharis Auto', x: 22, y: 72, desc: 'Certified luxury German automobiles and diplomat sales.', floorsCount: 2 },
  { id: 'abj_danfo_park', name: 'Utako Interstate Transit Terminus', type: 'mechanic', tagLabel: 'Utako Transit', x: 30, y: 72, desc: 'Bus terminal connecting Abuja to Lagos, Kano, and Port Harcourt.', floorsCount: 1 },
];

// Rich Real-Life Locations for Imo State (Owerri & environs)
export const IMO_LOCATIONS: LocationPOI[] = [
  { id: 'imo_eke_ukwu', name: 'Eke Ukwu Owerri Modern Market', type: 'market', tagLabel: 'Eke Ukwu Market', x: 44, y: 38, desc: 'Historic commerce market with local food goods, seafood and fabrics.', floorsCount: 2 },
  { id: 'imo_relief_mkt', name: 'Relief Market Owerri', type: 'market', tagLabel: 'Relief Market', x: 52, y: 38, desc: 'Wholesale provisions, yam tubers, fresh fish and agricultural produce.', floorsCount: 2 },
  { id: 'imo_shoprite', name: 'Shoprite Owerri Mall (Egbu Road)', type: 'mall', tagLabel: 'Shoprite Owerri', x: 16, y: 38, desc: 'Modern retail mall with Genesis Cinemas, clothing boutiques, and supermarket.', floorsCount: 2 },
  { id: 'imo_roban', name: 'Roban Stores Owerri', type: 'supermarket', tagLabel: 'Roban Stores', x: 24, y: 38, desc: 'Popular mega retail department store with fresh bakery and groceries.', floorsCount: 2 },
  { id: 'imo_fmc', name: 'Federal Medical Centre (FMC Owerri)', type: 'hospital', tagLabel: 'FMC Owerri', x: 48, y: 12, desc: 'Apex tertiary healthcare hospital and trauma center.', floorsCount: 3 },
  { id: 'imo_st_david', name: 'St. David Specialist Hospital Owerri', type: 'hospital', tagLabel: 'St David Hosp', x: 56, y: 12, desc: 'Maternal health, pediatric care, and orthopedic center.', floorsCount: 2 },
  { id: 'imo_futo', name: 'Federal University of Technology Owerri (FUTO)', type: 'university', tagLabel: 'FUTO Campus', x: 12, y: 12, desc: 'Top technological university training engineers and tech experts.', floorsCount: 3 },
  { id: 'imo_imsu', name: 'Imo State University (IMSU Campus)', type: 'university', tagLabel: 'IMSU Campus', x: 22, y: 12, desc: 'State university faculties of law, medicine, humanities and business.', floorsCount: 3 },
  { id: 'imo_alvan', name: 'Alvan Ikoku Federal College of Education', type: 'school', tagLabel: 'Alvan Ikoku', x: 30, y: 12, desc: 'Historic teacher education and academic research institute.', floorsCount: 2 },
  { id: 'imo_concorde', name: 'Imo Concorde Hotel & Casino', type: 'hotel', tagLabel: 'Concorde Hotel', x: 68, y: 56, desc: 'Legendary Eastern hospitality giant with Olympic pool and casino.', floorsCount: 4 },
  { id: 'imo_landmark_htl', name: 'Landmark International Hotel Owerri', type: 'hotel', tagLabel: 'Landmark Hotel', x: 88, y: 56, desc: 'Executive hotel along Port Harcourt Road with presidential suites.', floorsCount: 3 },
  { id: 'imo_assumpta', name: 'Maria Assumpta Catholic Cathedral', type: 'church', tagLabel: 'Assumpta Cath', x: 44, y: 54, desc: 'Iconic monumental cathedral dome overlooking Assumpta roundabout.', floorsCount: 2 },
  { id: 'imo_police_hq', name: 'Imo State Police Command Headquarters', type: 'police', tagLabel: 'Police Command', x: 74, y: 12, desc: 'State police headquarters and criminal investigation bureau.', floorsCount: 2 },
  { id: 'imo_access_bnk', name: 'Access Bank Wethedral Regional Hub', type: 'bank', tagLabel: 'Access Bank', x: 74, y: 38, desc: 'Commercial banking, ATM galleries, and business cash deposits.', floorsCount: 3 },
  { id: 'imo_zenith_bnk', name: 'Zenith Bank Bank Road Owerri', type: 'bank', tagLabel: 'Zenith Bank', x: 82, y: 38, desc: 'Commercial branch, corporate wire settlements and foreign exchange.', floorsCount: 3 },
  { id: 'imo_first_bnk', name: 'First Bank Douglas Road Branch', type: 'bank', tagLabel: 'FirstBank', x: 90, y: 38, desc: 'Centennial branch handling commercial accounts and treasury.', floorsCount: 2 },
  { id: 'imo_kilimanjaro', name: 'Kilimanjaro Fast Food Wethedral', type: 'eatery', tagLabel: 'Kilimanjaro', x: 42, y: 72, desc: 'Jollof rice, meat pies, and authentic Ofe Owerri native soup.', floorsCount: 1 },
  { id: 'imo_orange_room', name: 'Orange Room Nightclub & Ibiza Lounge', type: 'club', tagLabel: 'Orange Room', x: 50, y: 72, desc: 'Vibrant Owerri weekend nightlife, VIP sparklers, and live DJ mixes.', floorsCount: 2 },
  { id: 'imo_dan_anyiam', name: 'Dan Anyiam Stadium Complex', type: 'stadium', tagLabel: 'Dan Anyiam', x: 58, y: 72, desc: 'Heartland FC home stadium with track and field athletics.', floorsCount: 2 },
  { id: 'imo_oguta_resort', name: 'Oguta Lake Motel & Golf Resort', type: 'hotel', tagLabel: 'Oguta Resort', x: 90, y: 72, desc: 'Scenic lakeside golf course with boat cruise on the blue lake.', floorsCount: 2 },
  { id: 'imo_danfo_park', name: 'Arawa Motor Park & Interstate Buses', type: 'mechanic', tagLabel: 'Arawa Park', x: 18, y: 72, desc: 'Bus park with departures to Aba, Port Harcourt, and Lagos.', floorsCount: 1 },
];

// Rich Real-Life Locations for Rivers State (Port Harcourt & environs)
export const RIVERS_LOCATIONS: LocationPOI[] = [
  { id: 'riv_mile1_mkt', name: 'Mile 1 Ultra-Modern Market Diobu', type: 'market', tagLabel: 'Mile 1 Market', x: 42, y: 38, desc: 'Massive multi-story market for textiles, foodstuffs, electronics, and shoes.', floorsCount: 2 },
  { id: 'riv_oil_mill', name: 'Oil Mill Market (Rumuokwrushi)', type: 'market', tagLabel: 'Oil Mill Market', x: 50, y: 38, desc: 'Weekly mega-market for palm oil, garri, plantains, and fresh seafood.', floorsCount: 1 },
  { id: 'riv_market_sq', name: 'Market Square GRA Phase 2', type: 'supermarket', tagLabel: 'Market Square', x: 20, y: 38, desc: 'High-end grocery shopping, fresh pastries, and imported delicacies.', floorsCount: 2 },
  { id: 'riv_spar_mall', name: 'SPAR Port Harcourt Mall Azikiwe Road', type: 'mall', tagLabel: 'SPAR Mall', x: 28, y: 38, desc: 'Large shopping mall with cinema, food court, and department store.', floorsCount: 2 },
  { id: 'riv_upth', name: 'University of Port Harcourt Teaching Hospital (UPTH)', type: 'hospital', tagLabel: 'UPTH Hospital', x: 46, y: 12, desc: 'Apex federal teaching hospital with advanced surgical and trauma care.', floorsCount: 4 },
  { id: 'riv_bms_hsp', name: 'Braithwaite Memorial Specialist Hospital (BMSH)', type: 'hospital', tagLabel: 'BMSH Hospital', x: 56, y: 12, desc: 'State specialist hospital equipped with diagnostic laboratories.', floorsCount: 3 },
  { id: 'riv_uniport', name: 'University of Port Harcourt (UNIPORT)', type: 'university', tagLabel: 'UNIPORT Campus', x: 12, y: 12, desc: 'Premier federal university training petroleum engineers and actors.', floorsCount: 3 },
  { id: 'riv_rsu', name: 'Rivers State University (RSU Nkpolu)', type: 'university', tagLabel: 'RSU Campus', x: 22, y: 12, desc: 'State university renowned for law, engineering, and environmental studies.', floorsCount: 3 },
  { id: 'riv_presidential', name: 'Hotel Presidential 5-Star GRA Phase 2', type: 'hotel', tagLabel: 'Hotel Presidential', x: 68, y: 56, desc: 'Historic 5-star hotel with Olympic swimming pool, tennis courts and casino.', floorsCount: 5 },
  { id: 'riv_le_meridien', name: 'Novotel Hotel Port Harcourt Stadium Road', type: 'hotel', tagLabel: 'Novotel Hotel', x: 88, y: 56, desc: 'International luxury hotel near the entertainment strip.', floorsCount: 4 },
  { id: 'riv_nlng_hq', name: 'NLNG Corporate Headquarters Amadi Creek', type: 'bank', tagLabel: 'NLNG HQ', x: 74, y: 38, desc: 'Nigeria Liquified Natural Gas corporate executive administrative tower.', floorsCount: 4 },
  { id: 'riv_spdc_gate', name: 'Shell Industrial Area (SPDC Camp)', type: 'gov', tagLabel: 'Shell SPDC', x: 82, y: 38, desc: 'Heavy engineering camp and multinational oil exploration base.', floorsCount: 3 },
  { id: 'riv_zenith_aba', name: 'Zenith Bank Commercial Hub Aba Road', type: 'bank', tagLabel: 'Zenith Bank', x: 90, y: 38, desc: 'Tier-1 corporate oil and gas banking branch.', floorsCount: 3 },
  { id: 'riv_pleasure_park', name: 'Port Harcourt Pleasure Park & Lake', type: 'zoo', tagLabel: 'Pleasure Park', x: 42, y: 54, desc: 'Manicured green park, artificial pedal lake, climbing tower and fitness.', floorsCount: 1 },
  { id: 'riv_bole_king', name: 'Bole & Fish Native Joint Elekahia', type: 'eatery', tagLabel: 'Bole King', x: 42, y: 72, desc: 'Authentic Port Harcourt roasted plantain, spicy grilled fish with pepper sauce.', floorsCount: 1 },
  { id: 'riv_cubana_ph', name: 'Cubana Lounge & Nightclub GRA Phase 2', type: 'club', tagLabel: 'Cubana PH', x: 50, y: 72, desc: 'Celebrity nightlife, VIP bottle service, and top Afrobeats entertainment.', floorsCount: 2 },
  { id: 'riv_sharks_stadium', name: 'Sharks Football Stadium Hospital Road', type: 'stadium', tagLabel: 'Sharks Stadium', x: 58, y: 72, desc: 'City football stadium and sports pavilion.', floorsCount: 2 },
  { id: 'riv_police_moscow', name: 'Rivers State Police Command Moscow Road', type: 'police', tagLabel: 'Police Moscow Rd', x: 74, y: 12, desc: 'State police headquarters command building.', floorsCount: 3 },
  { id: 'riv_danfo_park', name: 'Mile 3 Interstate Commercial Motor Park', type: 'mechanic', tagLabel: 'Mile 3 Park', x: 18, y: 72, desc: 'Bustling transit hub with yellow Danfo buses and interstate coaches.', floorsCount: 1 },
];

// Rich Real-Life Locations for Kano State
export const KANO_LOCATIONS: LocationPOI[] = [
  { id: 'kan_kurmi_mkt', name: 'Kurmi Ancient Craft Market', type: 'market', tagLabel: 'Kurmi Market', x: 42, y: 38, desc: 'Century-old historic market for leatherwork, dyed textiles, brass and spices.', floorsCount: 2 },
  { id: 'kan_sabon_gari', name: 'Sabon Gari Commercial Mega Market', type: 'market', tagLabel: 'Sabon Gari', x: 50, y: 38, desc: 'Vast mercantile trade hub for imported provisions, shoes and clothing.', floorsCount: 2 },
  { id: 'kan_ado_bayero', name: 'Ado Bayero Mall & Shoprite', type: 'mall', tagLabel: 'Bayero Mall', x: 22, y: 38, desc: 'Northern Nigeria’s largest modern retail mall with Filmhouse Cinema.', floorsCount: 2 },
  { id: 'kan_akth', name: 'Aminu Kano Teaching Hospital (AKTH)', type: 'hospital', tagLabel: 'AKTH Hospital', x: 48, y: 12, desc: 'Federal apex university teaching hospital with cardiac and kidney centers.', floorsCount: 4 },
  { id: 'kan_murtala_hsp', name: 'Murtala Muhammad Specialist Hospital', type: 'hospital', tagLabel: 'Murtala Hosp', x: 58, y: 12, desc: 'City public hospital with large outpatient wards.', floorsCount: 2 },
  { id: 'kan_buk_new', name: 'Bayero University Kano (BUK New Campus)', type: 'university', tagLabel: 'BUK Campus', x: 12, y: 12, desc: 'Top federal university with faculty of engineering, computer science and law.', floorsCount: 3 },
  { id: 'kan_emir_palace', name: 'Emir of Kano Royal Palace (Gidan Rumfa)', type: 'gov', tagLabel: 'Emir Palace', x: 74, y: 12, desc: 'Historic 15th-century royal mud-brick palace of the Kano Emirate.', floorsCount: 2 },
  { id: 'kan_tahir_palace', name: 'Tahir Guest Palace 5-Star Hotel', type: 'hotel', tagLabel: 'Tahir Palace', x: 68, y: 56, desc: 'Luxury northern hospitality, Lebanese restaurant, and swimming pool.', floorsCount: 4 },
  { id: 'kan_cent_mosque', name: 'Kano Central Grand Mosque', type: 'mosque', tagLabel: 'Central Mosque', x: 44, y: 54, desc: 'Massive historic Islamic grand mosque next to the Emir’s palace.', floorsCount: 2 },
  { id: 'kan_sani_abacha', name: 'Sani Abacha Stadium Kofar Mata', type: 'stadium', tagLabel: 'Abacha Stadium', x: 58, y: 72, desc: 'Home ground of Kano Pillars FC football club.', floorsCount: 2 },
  { id: 'kan_police_bompai', name: 'Kano State Police Command Bompai', type: 'police', tagLabel: 'Police Bompai', x: 84, y: 12, desc: 'State police headquarters command.', floorsCount: 2 },
  { id: 'kan_zenith_bank', name: 'Zenith Bank Bank Road Kano', type: 'bank', tagLabel: 'Zenith Bank', x: 74, y: 38, desc: 'Commercial banking and wholesale trade forex exchange.', floorsCount: 3 },
  { id: 'kan_kilishi_hub', name: 'Dawanau Food Market & Kilishi Depot', type: 'eatery', tagLabel: 'Kilishi Depot', x: 42, y: 72, desc: 'World-famous authentic dried beef kilishi and spiced suya.', floorsCount: 1 },
  { id: 'kan_motor_park', name: 'Kofar Ruwa Transit & Motor Park', type: 'mechanic', tagLabel: 'Kofar Ruwa', x: 18, y: 72, desc: 'Regional bus depot departing to Kaduna, Abuja, Katsina and Niger.', floorsCount: 1 },
];

// 98 pre-calculated spacious isometric coordinates for all 36 states (14 cols x 7 rows)
// Buffered strictly so NO point falls inside the Airport Runway footprint (x: 2-32, y: 79-98) or Jabi Lake
export const ALL_98_SLOTS = Array.from({ length: 98 }, (_, i) => {
  const col = i % 14;
  const row = Math.floor(i / 14);
  let x = Math.round(7 + (col / 13) * 86);
  let y = Math.round(7 + (row / 6) * 86);

  // Clearance from Airport Runway & Terminal bounds (x: 2-32%, y: 79-98%)
  if (x <= 32 && y >= 79) {
    x = Math.round(34 + (col % 4) * 8);
    y = Math.round(64 + (col % 2) * 8);
  }

  // Clearance from Lake Waterfront bounds (x: 12-30%, y: 20-36%)
  if (x >= 12 && x <= 30 && y >= 20 && y <= 36) {
    y = y < 28 ? 16 : 40;
  }

  // Clearance from Left Monolith (x: 0-11%, y: 24-42%)
  if (x <= 11 && y >= 24 && y <= 42) {
    x = 13;
  }

  // Clearance from Right Monolith (x: 88-98%, y: 28-48%)
  if (x >= 88 && y >= 28 && y <= 48) {
    x = 84;
  }

  return { x, y };
});

export const STATE_DISTRICT_KEYS: Record<string, string[]> = {
  lagos: ['Victoria Island', 'Ikoyi Waterfront', 'Lekki Phase 1', 'Ikeja GRA', 'Surulere Stadium Axis', 'Yaba Tech Corridor', 'Marina Financial Core', 'Epe Resort Coast', 'Badagry Heritage', 'Festac Town', 'Magodo Shangisha', 'Ajah Lekki Corridor'],
  fct: ['Maitama Diplomatic', 'Asokoro Hills', 'Garki Area 2', 'Wuse II Commercial', 'Central Business District', 'Jabi Lake Promenade', 'Guzape Heights', 'Utako Commercial Hub', 'Gwarinpa Estate', 'Kubwa Satellite', 'Mpape Quarry Rocks', 'Lugbe Airport Corridor'],
  abuja: ['Maitama Diplomatic', 'Asokoro Hills', 'Garki Area 2', 'Wuse II Commercial', 'Central Business District', 'Jabi Lake Promenade', 'Guzape Heights', 'Utako Commercial Hub', 'Gwarinpa Estate', 'Kubwa Satellite', 'Mpape Quarry Rocks', 'Lugbe Airport Corridor'],
  kano: ['Gidan Rumfa Royal', 'Dala Historic Hill', 'Sabon Gari Mega Market', 'Kurmi Ancient Guild', 'Fagge Commercial', 'Bompai Industrial', 'Nassarawa GRA', 'Kofar Mata Dye Pits', 'Challawa Basin', 'Kofar Ruwa Depot', 'Tarauni Layout', 'Sharada Industrial'],
  rivers: ['Old GRA Port Harcourt', 'Trans-Amadi Industrial', 'Diobu Mile 1 Hub', 'D-Line Commercial', 'Rumuola Links', 'Elekahia Stadium', 'Borokiri Waterfront', 'Bonny Island Deepsea', 'Onne Ocean Terminal', 'Choba Campus Green', 'Woji River Estate', 'Peter Odili Boulevard'],
  imo: ['Douglas Road Commercial', 'Aladinma Mall District', 'Ikenegbu Layout', 'Wetheral Boulevard', 'Works Layout Owerri', 'New Owerri Capital', 'World Bank Housing Estate', 'Orlu Highway Hub', 'Okigwe Rolling Hills', 'Egbu Road Corridor', 'Amakohia Layout', 'Uratta Urban Basin'],
  enugu: ['Independence Layout', 'Coal Camp Heritage', 'Ogbete Main Market', 'New Haven Business', 'GRA Enugu', 'Emene Industrial Area', 'Nsukka University Town', 'Agbani Law School', 'Udi Hillcrest Ridge', 'Abakpa Nike Hub', 'Trans-Ekulu Layout', 'Kenyatta Market Axis'],
  anambra: ['Main Market Onitsha', 'Upper Iweka Transit', 'GRA Onitsha', 'Nnewi Industrial Triangle', 'Awka Capital Boulevard', 'Ekwulobia Gateway', 'Ihiala Commercial Hub', 'Ogbaru Marine Dock', 'Nkpor Commercial Junction', 'Agulu Lake Green', 'Alor Royal Basin', 'Obosi Commercial Zone'],
  oyo: ['Dugbe Central Bank Axis', 'Bodija Housing Estate', 'Mokola Cultural Hill', 'Agodi Gardens & Secretariat', 'Ring Road Commercial', 'University of Ibadan (UI)', 'Iwo Road Transit Depot', 'Ologuneru Tech Hub', 'Ogbomoso Export Zone', 'Oyo Royal Palace Atiba', 'Iseyin Weaving Guild', 'Sango Market Hub'],
  kaduna: ['Ahmadu Bello Way Central', 'Barnawa GRA', 'Malali Waterfront', 'Kakuri Industrial Estate', 'Kawo Transit Junction', 'Kaduna South Commercial', 'Zaria Samaru Campus', 'Kafanchan Southern Kaduna', 'Rigasa Railway Gateway', 'Tudun Wada Central', 'Narayi High Cost', 'Sabon Tasha'],
  ogun: ['Oke-Mosan Secretariat', 'Ibara GRA Abeokuta', 'Kuto Central Market', 'Ota Industrial Zone', 'Sagamu Interchange', 'Ijebu-Ode Royal Court', 'Ilaro Border Route', 'Mowe-Ibafo Corridor', 'Abeokuta Olumo Rock Axis', 'Ago-Iwoye Campus', 'Sango Ota Mega Hub', 'Iperu Agro-Cargo'],
  delta: ['Warri Effurun Roundabout', 'GRA Warri', 'Asaba Delta Capital Quay', 'Sapele River Port', 'Ughelli Oilfield Base', 'Agbor Transit Hub', 'Oghara Coastal Link', 'Koko Free Trade Zone', 'Osubi Airport Strip', 'Ekpan Refinery Axis', 'Abraka River Sands', 'Anwai University'],
  akwa_ibom: ['Uyo Plaza Circus', 'Ewet Housing Estate', 'Ibom Tropicana', 'Ikot Ekpene Raffia City', 'Oron Coastal Marine', 'Eket Oilfield Base', 'Abak Road Boulevard', 'Itam International Market', 'Shelter Afrique Estate', 'Nwaniba Golf Haven', 'Urua Ikpa Road', 'Four Lanes Environs'],
  abia: ['Aba Ariaria International', 'Faulks Road Leather Guild', 'Umuahia Capital Secretariat', 'Osisioma Industrial Interchange', 'Enyimba Stadium Axis', 'Ogbor Hill Waterfront', 'Bende Valley', 'Ohafia Cultural Ridge', 'Abiriba Small London', 'Umuahia Old Timber', 'Brass Street Commercial', 'Umudike Agri-Hub'],
  edo: ['Ring Road King Square', 'GRA Benin City', 'Uselu Market Axis', 'Ikpoba Hill Heights', 'Ekpoma Ambrose Alli Campus', 'Auchi Sacred Heights', 'Sapele Road Commercial', 'Airport Road GRA', 'Ugbowo University Gateway', 'Ekenwan Cultural Quarter', 'Ehor Agricultural Basin', 'Oredo Central Core'],
  benue: ['Makurdi Benue Riverbank', 'High Level Commercial', 'Wurukum Roundabout', 'Gboko Tiv Heritage Capital', 'Otukpo Idoma Heartland', 'North Bank Agro Depot', 'Katsina-Ala Basin', 'Modern Market Makurdi', 'Apir Industrial Layout', 'Judges Quarters', 'Low Level Residential', 'Yandev Cement Valley'],
  plateau: ['Jos Terminus Roundabout', 'Rayfield Luxury Golf Environs', 'Bukuru Industrial Axis', 'Rukuba Military Barracks', 'Lamingo Dam Heights', 'Pankshin Highland Ridge', 'Anglo-Jos Commercial', 'Vom Veterinary Haven', 'Shendam Yam Basin', 'Tafawa Balewa Way', 'Old Airport Road', 'Shere Hills Eco Park'],
  borno: ['Maiduguri Monday Market', 'Custom Roundabout', 'Bama Road Gateway', 'University of Maiduguri (UNIMAID)', 'Shehu of Borno Palace', 'Post Office Commercial Axis', 'Bulunkutu Haven', 'Damboa Road', 'Bolori District', 'Gomboru Ngala Corridor', 'GRA Maiduguri', 'Kashim Ibrahim Way'],
  adamawa: ['Jimeta Modern Market', 'Yola Town Royal Palace', 'Modibbo Adama Campus (MAUTECH)', 'Bekaji Estate', 'Lamido Zubairu Way', 'Numan Confluence Basin', 'Mubi International Border Market', 'Doubeli Riverport', 'Karewa GRA', 'Gibson Jalo Way', 'FMC Yola Quarter', 'Shagari Low Cost'],
  bauchi: ['Wunti Modern Market', 'Yankari Reserve Gateway', 'Abubakar Tafawa Balewa Campus', 'GRA Bauchi', 'Gubi Dam Valley', 'Azare Northern Mercantile', 'Misau Heritage Basin', 'Kandahar District', 'Kobi Football Street', 'Ran Gate Commercial', 'Dass Hill Road', 'Central Market Plaza'],
  bayelsa: ['Yenagoa Swali Market', 'Ox-Bow Lake Marina', 'Tombia Roundabout', 'Amarata Central Core', 'Opolo Expressway', 'Wilberforce Island Campus', 'Brass Oil Export Island', 'Otuoke Federal University', 'Akaba Waterfront', 'Kpansia Market Axis', 'Azikoro Village', 'Etegwe High Cross'],
  cross_river: ['Marina Resort Waterfront', 'Calabar Marian Road', 'Watt Market Commercial', 'Tinapa Free Trade Zone', 'Ikom Cocoa & Border Gate', 'Odukpani Junction', 'State Housing Estate Calabar', 'Obudu Mountain Cattle Ranch', 'Diamond Hill Cultural', 'EPZ Free Trade Zone', 'Akamkpa Mining Corridor', 'Atekong Drive'],
  ebonyi: ['Abakaliki Rice Mill Mega Center', 'Margaret Umahi International Market', 'Presco Campus Mile 50', 'Ezza Road Boulevard', 'Afikpo Ancient Rock Formations', 'Onueke Central Core', 'Waterworks Road', 'Ogoja Road Commercial', 'Uburu Medical Village', 'Nkalagu Cement Base', 'Kpirikpiri Market', 'Centenary City'],
  ekiti: ['Ado-Ekiti Fajuyi Memorial Park', 'Oja Oba King Market', 'EKSU Iworoko Campus', 'Ikogosi Warm Springs Ridge', 'GRA Ado-Ekiti', 'Ikole Agricultural Hub', 'Ilawe Banana Groves', 'Oye Federal University', 'Ijero Mineral Basin', 'Ajilosun Commercial Highway', 'Basiri Layout', 'Bank Road Axis'],
  gombe: ['Gombe Main Market', 'Tudun Wada Commercial', 'Pantami Stadium Axis', 'GRA Gombe', 'Federal University Kashere', 'Dukku Transit Road', 'Ashaka Cement Industrial Valley', 'Biu Road Bypass', 'Kaltungo Pastoral Ridge', 'Jeka Da Fari Core', 'Dadinkowa Dam Basin', 'Herwagana District'],
  jigawa: ['Dutse Rock Monolith Capital', 'Dutse Modern Market', 'Hadejia Fish & Rice Riverland', 'Kazaure Emirate Valley', 'Gumel Camel Caravan Gateway', 'Ringim Sugar Basin', 'GRA Dutse', 'Federal University Dutse', 'Babura Northern Border Gate', 'Birnin Kudu Ancient Paintings', 'Kiyawa Agro Axis', 'Kiyawa Road'],
  katsina: ['Katsina Central Market', 'Kofar Kaura Roundabout', 'Umaru Musa Yar\'adua Campus', 'Daura Ancient Kusugu Well', 'Emir of Katsina Palace', 'Funtua Cotton & Grain Basin', 'GRA Katsina', 'Jibia Border Trade Gate', 'IBB Way Commercial', 'Dadin Kowa District', 'Kofar Marusa Gate', 'Batagarawa Layout'],
  kebbi: ['Birnin Kebbi Central Market', 'Argungu International Fishing Lake', 'GRA Birnin Kebbi', 'Waziri Umaru Polytechnic', 'Yauri River Niger Port', 'Zuru Highland Federation', 'Haliru Abdu Secretariat', 'Gwandu Historical Emirate', 'Jega Livestock & Agro Market', 'Kanta Museum Area', 'Kalgo Medical Hub', 'Murtala Way'],
  kogi: ['Lokoja Confluence of Rivers', 'Ganaja Village Flyover', 'Kogi State University Anyigba', 'Okene Ebira Weaving Loom', 'Kabba Yoruba Hills', 'Obajana Dangote Mega Cement', 'Patti Hill Panoramic Ridge', 'Old Market Lokoja', 'GRA Lokoja', 'Ajaokuta Steel City Works', 'Felele Transit Axis', 'Nataco Bus Depot'],
  kwara: ['Ilorin Post Office Roundabout', 'Emir of Ilorin Central Palace', 'Tanke University of Ilorin Road', 'GRA Ilorin', 'Offa Sweet Potato & Railway Hub', 'Mandate Ultra Modern Market', 'Oja Oba Historic Market', 'Jebba River Niger Hydro Bridge', 'Lafiaji Sugar Expanse', 'Fate Road Business Strip', 'Asa Dam Road', 'Ganmo Market'],
  nasarawa: ['Lafia Modern Market', 'Doma Dam Agricultural Basin', 'Keffi Federal University', 'Karu Gateway Metropolis', 'Mararaba Abuja Border Concourse', 'Akwanga Hills Junction', 'GRA Lafia', 'Jos Road Commercial', 'Nasarawa Palace Axis', 'Eggon Hilltop Heritage', 'Keana Salt Mine Springs', 'Shendam Road Core'],
  niger: ['Minna Bosso Campus (FUTMINNA)', 'Chanchaga Water Works', 'Bida Brass & Glass Guilds', 'Suleja Zuma Rock Gateway', 'Kontagora Agrarian Heartland', 'Kainji Hydroelectric Dam', 'GRA Minna', 'Shiroro Hydro Basin', 'Mokwa Agro Exchange', 'Paiko Road Layout', 'David Mark Road', 'Kpakungu Roundabout'],
  ondo: ['Akure Oba Adesida Road', 'Oja Oba Grand Market', 'Alagbaka Government Reserve (GRA)', 'Ondo Town Cocoa Kingdom', 'FUTA South Gate Tech Valley', 'Idanre Ancient Hilltop Peak', 'Owo Ancient Palace Heritage', 'Ore Mega Transit Junction', 'Okitipupa Oil Palm Fields', 'Igbokoda Atlantic Deepsea', 'Arakale Electronic Market', 'Oyemekun Drive'],
  osun: ['Osogbo Sacred Osun Grove', 'Oja Oba King Market Osogbo', 'OAU Ile-Ife Anglo-Moz Campus', 'OAU Teaching Hospital Axis', 'Ilesa Gold Mining Heartland', 'Ede Federal Polytechnic', 'GRA Osogbo', 'Gbongan Interchange', 'Ikire Dodo Native Delicacy Strip', 'Alekuwodo Commercial', 'Station Road Osogbo', 'Iragbiji Hillcrest'],
  sokoto: ['Sokoto Central Grand Market', 'Sultan of Sokoto Royal Palace', 'Usmanu Danfodiyo University (UDUS)', 'Hubbare Historical Tomb', 'GRA Sokoto', 'Tambuwal Agro Hub', 'Goronyo Dam Reservoir', 'Kano Road Commercial', 'Runjin Sambo Layout', 'Arkilla Residential Haven', 'Bado Quarters', 'Gusau Road Bypass'],
  taraba: ['Jalingo Main Market', 'Mambilla Highland Tea Estate', 'Wukari Kwararafa Kingdom', 'Taraba State University Campus', 'GRA Jalingo', 'Takum Granite Ridge', 'Ibi River Benue Crossing', 'Gembu Mountain Heights', 'Mutum Biyu Rice Heartland', 'Hammaruwa Way Commercial', 'Ngel Nyaki Montane Forest', 'Mayo Belwa Gateway'],
  yobe: ['Damaturu Central Market', 'Bayamari Gum Arabic Exchange', 'Gashua River Basin', 'Potiskum Cattle & Truck Transit Hub', 'Yobe State University Campus', 'Nguru Wetland Oasis', 'GRA Damaturu', 'Geidam Desert Oasis Border', 'Fika Royal Palace', 'Bukarti Trading Route', 'Gujba Road Bypass', 'Maiduguri Road Core'],
  zamfara: ['Gusau Central Modern Market', 'Federal University Gusau', 'Tsafe Agricultural Corridor', 'Anka Mineral & Gold Mines', 'Talata Mafara Grain Heartland', 'GRA Gusau', 'Kaura Namoda Railway Gateway', 'Bakolori Dam Valley', 'Canteen Road Commercial Axis', 'Bungudu River Basin', 'Samaru Layout Gusau', 'Zaria Road Bypass'],
};

const STATE_POI_TEMPLATES: { nameSuffix: string; type: LocationPOI['type']; tag: string; desc: string; floors: number }[] = [
  { nameSuffix: 'International Trade & Commodities Mega Market', type: 'market', tag: 'Mega Market', desc: 'Vibrant wholesale trade stalls and indigenous mercantile logistics.', floors: 2 },
  { nameSuffix: 'Federal Medical Centre & Emergency Surgical Pavilion', type: 'hospital', tag: 'Medical Centre', desc: 'Apex specialist hospital with trauma ambulance response.', floors: 4 },
  { nameSuffix: 'State University Faculty of Applied Sciences & Engineering', type: 'university', tag: 'State Univ', desc: 'Higher learning campus with modern lecture auditoriums and IT labs.', floors: 3 },
  { nameSuffix: 'High Court of Justice & Judicial Complex', type: 'court', tag: 'High Court', desc: 'Appellate court chambers, registry administration and legal suites.', floors: 2 },
  { nameSuffix: 'Area Police Command Headquarters & Tactical Unit', type: 'police', tag: 'Police Command', desc: 'Divisional safety headquarters and 24/7 metropolitan patrol network.', floors: 2 },
  { nameSuffix: 'Grand Cathedral Basilica of Faith', type: 'church', tag: 'Cathedral', desc: 'Majestic Christian sanctuary with soaring bells and choir gallery.', floors: 3 },
  { nameSuffix: 'Central Grand Jumaat Mosque & Islamic Center', type: 'mosque', tag: 'Grand Mosque', desc: 'Historic arched domes, marble courtyards, and grand minarets.', floors: 2 },
  { nameSuffix: '5-Star Diplomatic Luxury Suites & Convention Palace', type: 'hotel', tag: 'Luxury Hotel', desc: 'Elite hospitality suites with international dining and pool terrace.', floors: 5 },
  { nameSuffix: 'State Sports Arena & Premier Football Stadium', type: 'stadium', tag: 'Sports Arena', desc: 'Modern bowl arena hosting professional football fixtures.', floors: 2 },
  { nameSuffix: 'Zenith & FirstBank Apex Financial Banking Tower', type: 'bank', tag: 'Banking Tower', desc: 'Tier-1 commercial banking headquarters and corporate forex clearing.', floors: 3 },
  { nameSuffix: 'Mega City Mall & Multi-Screen Cinema Arcade', type: 'mall', tag: 'City Mall', desc: 'Modern retail mall with grocery stores and entertainment halls.', floors: 2 },
  { nameSuffix: 'Interstate Luxury Coach Terminal & Transit Depot', type: 'mechanic', tag: 'Coach Depot', desc: 'Air-conditioned interstate buses connecting national routes.', floors: 1 },
  { nameSuffix: 'Broadcasting & Telecommunications Media Tower', type: 'techhub', tag: 'Broadcast Tower', desc: 'State radio and television transmitting towers, fiber internet and media production house.', floors: 3 },
  { nameSuffix: 'Heritage Bukka & Local Delicacy Grill Haven', type: 'eatery', tag: 'Heritage Bukka', desc: 'Authentic local delicacies, sizzling grills, pepper soup and chilled drinks.', floors: 1 },
  { nameSuffix: 'Government Executive Secretariat Complex', type: 'gov', tag: 'Secretariat', desc: 'State civil service ministries and executive directorate offices.', floors: 3 },
  { nameSuffix: 'Technology Innovation Incubator & Coworking Hub', type: 'techhub', tag: 'Tech Hub', desc: 'Software developers, startup incubators and high-speed fiber internet.', floors: 2 },
  { nameSuffix: 'Championship Golf Greens & Country Polo Grounds', type: 'golf', tag: 'Polo & Golf', desc: 'Manicured 18-hole fairways and exclusive clubhouse lounge.', floors: 1 },
  { nameSuffix: 'Premier Auto Dealership & Clean Title Showroom', type: 'dealership', tag: 'Auto Showroom', desc: 'Imported SUV showroom and certified diagnostic inspection yard.', floors: 1 },
];

// Helper to get exactly 98 real-life locations for ANY state
export function getStateLocations(stateId: string): LocationPOI[] {
  const sid = stateId?.toLowerCase() || 'lagos';
  if (sid === 'canada') {
    // Return all 150 authentic Canadian real-life locations
    return CANADA_150_LOCATIONS;
  }
  if (sid === 'lagos') {
    // Return all 98 authentic Lagos locations from MAP_100_LOCATIONS
    return MAP_100_LOCATIONS.slice(0, 98);
  }

  // Base authentic locations
  let baseLocations: LocationPOI[] = [];
  if (sid === 'fct' || sid === 'fct_abuja' || sid === 'abuja') {
    baseLocations = ABUJA_LOCATIONS;
  } else if (sid === 'imo') {
    baseLocations = IMO_LOCATIONS;
  } else if (sid === 'rivers') {
    baseLocations = RIVERS_LOCATIONS;
  } else if (sid === 'kano') {
    baseLocations = KANO_LOCATIONS;
  } else {
    const stateData = NIGERIA_36_STATES_ALPHABETICAL.find((s) => s.id === sid);
    if (stateData && stateData.locations) {
      baseLocations = stateData.locations;
    }
  }

  const stateData = NIGERIA_36_STATES_ALPHABETICAL.find((s) => s.id === sid);
  const stateName = stateData?.name || sid.toUpperCase();
  const capitalName = stateData?.capital || stateName;
  const districtList = STATE_DISTRICT_KEYS[sid] || [
    `${capitalName} Central`,
    `${capitalName} GRA`,
    `${capitalName} Main Market`,
    `${capitalName} Secretariat`,
    `${capitalName} Bypass`,
    `${capitalName} Industrial`,
    `${capitalName} Hillside`,
    `${capitalName} Riverside`,
    `${capitalName} New Layout`,
    `${capitalName} Expressway`,
    `${capitalName} High Cost`,
    `${capitalName} West End`,
  ];

  const finalLocations: LocationPOI[] = [];

  // 1. Add base authentic locations with coordinates assigned and unique state naming
  baseLocations.forEach((loc, idx) => {
    if (idx < 98) {
      const slot = ALL_98_SLOTS[idx];
      const uniqueName = loc.name.includes(stateName) || loc.name.includes(capitalName)
        ? loc.name
        : `${loc.name} (${capitalName}, ${stateName})`;
      finalLocations.push({
        ...loc,
        id: loc.id.startsWith(sid) ? loc.id : `${sid}_${loc.id}`,
        name: uniqueName,
        x: loc.x && loc.x > 0 ? loc.x : slot.x,
        y: loc.y && loc.y > 0 ? loc.y : slot.y,
      });
    }
  });

  // 2. Fill remaining slots up to exactly 98 locations
  while (finalLocations.length < 98) {
    const idx = finalLocations.length;
    const slot = ALL_98_SLOTS[idx];
    const tmpl = STATE_POI_TEMPLATES[idx % STATE_POI_TEMPLATES.length];
    const district = districtList[idx % districtList.length];
    const iteration = Math.floor(idx / STATE_POI_TEMPLATES.length) + 1;

    finalLocations.push({
      id: `${sid}_poi_${idx + 1}`,
      name: `${stateName} (${district}) ${tmpl.nameSuffix}${iteration > 1 ? ` No. ${iteration}` : ''}`,
      type: tmpl.type,
      tagLabel: tmpl.tag,
      x: slot.x,
      y: slot.y,
      desc: `${tmpl.desc} Situated within the active civic district of ${district}, ${stateName} State.`,
      floorsCount: tmpl.floors,
    });
  }

  return finalLocations;
}

