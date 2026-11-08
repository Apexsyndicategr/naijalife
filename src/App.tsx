/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Heart,
  Zap,
  Utensils,
  Smile,
  Coins,
  DollarSign,
  Globe,
  Plane,
  FileCheck,
  Briefcase,
  Home,
  RefreshCw,
  Volume2,
  VolumeX,
  Pause,
  Play,
  AlertCircle,
  CheckCircle2,
  MapPin,
  Building,
  ShieldCheck,
  X,
  Send,
  Stethoscope,
  Compass,
  FileText,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Landmark,
  ArrowRightLeft,
  Skull,
  Scale,
  ShieldAlert,
  AlertOctagon,
  Map as MapIcon,
  HardDrive,
  Database,
  Save,
  Download,
  Upload,
  Check,
  Sparkles,
  RotateCcw,
  LogOut
} from 'lucide-react';
import { NigeriaMapVisualizer } from './components/NigeriaMapVisualizer';
import { LagosLifeMap } from './components/LagosLifeMap';
import { PropertyAsset, VehicleAsset, InvestmentAsset } from './types/game';
import { AVAILABLE_INVESTMENTS } from './data/assetsData';
import { calculateInterstateTrip } from './utils/travelPricing';
import { registerRealPlayerOnline } from './utils/multiplayerOnline';
import { NIGERIA_36_STATES_ALPHABETICAL } from './data/stateLocationsData';
import { CANADA_STATE_DATA } from './data/canadaLocations150';
import {
  saveGameState,
  loadSavedGame,
  clearSavedGame,
  exportSaveFile,
  importSaveFile,
  hasSavedGame,
} from './utils/saveGameManager';
import { SavedGameState } from './types/saveGame';
import {
  AuthPortal,
  UserProfile,
  getStoredSession,
  clearSession,
  saveSession,
  getStoredUsers,
  STORAGE_USERS_KEY,
} from './components/AuthPortal';
import {
  DeviceOptimizationLoader,
  DeviceOptimizationProfile,
} from './components/DeviceOptimizationLoader';

/* =========================================================================
   1. RANDOM NIGERIAN SPAWN ENGINE: ALL 36 STATES + FCT
   ========================================================================= */

export type GeopoliticalZone =
  | 'South West'
  | 'South East'
  | 'South South'
  | 'North West'
  | 'North East'
  | 'North Central';

export interface NigeriaStateData {
  id: string;
  name: string;
  capital: string;
  zone: GeopoliticalZone;
  slogan: string;
  costMultiplier: number;
  delicacy: {
    name: string;
    desc: string;
    hunger: number;
    joy: number;
    cost: number;
  };
  jobMarket: {
    specialtyJob: string;
    desc: string;
    energy: number;
    earnMin: number;
    earnMax: number;
  };
}

export const ALL_36_NIGERIAN_STATES: NigeriaStateData[] = [
  {
    id: 'abia',
    name: 'Abia',
    capital: 'Umuahia / Aba',
    zone: 'South East',
    slogan: "God's Own State",
    costMultiplier: 1.0,
    delicacy: { name: 'Oha Soup & Akpu', desc: 'Aromatic oha leaves slow-cooked with stockfish & beef cuts', hunger: 35, joy: 18, cost: 2800 },
    jobMarket: { specialtyJob: 'Aba Garment & Shoe Manufacturing', desc: 'Craft bespoke leather loafers in Ariaria market clusters', energy: 18, earnMin: 15000, earnMax: 28000 },
  },
  {
    id: 'adamawa',
    name: 'Adamawa',
    capital: 'Yola',
    zone: 'North East',
    slogan: 'Land of Beauty',
    costMultiplier: 0.9,
    delicacy: { name: 'Tuwo Shinkafa & Miyan Kuka', desc: 'Baobab leaf soup with tender braised beef and soft rice swallow', hunger: 32, joy: 16, cost: 2200 },
    jobMarket: { specialtyJob: 'Cattle Ranching & Cotton Trade', desc: 'Manage grain supplies and cross-border pastoral logistics', energy: 20, earnMin: 13000, earnMax: 24000 },
  },
  {
    id: 'akwa_ibom',
    name: 'Akwa Ibom',
    capital: 'Uyo',
    zone: 'South South',
    slogan: 'Land of Promise',
    costMultiplier: 1.1,
    delicacy: { name: 'Afang Soup & Pounded Yam', desc: 'Wild afang leaf soup simmered with dried prawns and periwinkle', hunger: 42, joy: 24, cost: 3800 },
    jobMarket: { specialtyJob: 'Palm Oil Export & Maritime Logistics', desc: 'Supervise coastal palm extraction depots and barge supplies', energy: 19, earnMin: 18000, earnMax: 34000 },
  },
  {
    id: 'anambra',
    name: 'Anambra',
    capital: 'Awka / Onitsha',
    zone: 'South East',
    slogan: 'Light of the Nation',
    costMultiplier: 1.15,
    delicacy: { name: 'Onugbu (Bitterleaf) & Fufu', desc: 'Savory bitterleaf soup steeped with smoked catfish and fermented ogiri', hunger: 38, joy: 20, cost: 3200 },
    jobMarket: { specialtyJob: 'Onitsha Main Market Wholesale', desc: 'Broker massive container consignments of consumer electronics', energy: 22, earnMin: 22000, earnMax: 45000 },
  },
  {
    id: 'bauchi',
    name: 'Bauchi',
    capital: 'Bauchi',
    zone: 'North East',
    slogan: 'Pearl of Tourism',
    costMultiplier: 0.85,
    delicacy: { name: 'Masa & Miyan Taushe', desc: 'Golden fermented rice cakes with spiced pumpkin stew and lamb brisket', hunger: 30, joy: 17, cost: 2000 },
    jobMarket: { specialtyJob: 'Yankari Tourism & Sesame Depot', desc: 'Coordinate eco-safari tours and assemble sesame seed shipments', energy: 17, earnMin: 12000, earnMax: 23000 },
  },
  {
    id: 'bayelsa',
    name: 'Bayelsa',
    capital: 'Yenagoa',
    zone: 'South South',
    slogan: 'Glory of All Lands',
    costMultiplier: 1.05,
    delicacy: { name: 'Kikiyai & River Mangrove Fish', desc: 'Plantain potage with peppery fresh water mangrove fish', hunger: 36, joy: 20, cost: 3400 },
    jobMarket: { specialtyJob: 'Riverine Marine Speedboat Transport', desc: 'Pilot twin-outboard passenger speedboats along coastal creeks', energy: 20, earnMin: 17000, earnMax: 33000 },
  },
  {
    id: 'benue',
    name: 'Benue',
    capital: 'Makurdi',
    zone: 'North Central',
    slogan: 'Food Basket of the Nation',
    costMultiplier: 0.95,
    delicacy: { name: 'Pounded Yam & Egusi Soup', desc: 'Giant roasted yams pounded fluffy with goat meat melon seed sauce', hunger: 44, joy: 22, cost: 2600 },
    jobMarket: { specialtyJob: 'Zaki Biam Yam Tuber Aggregation', desc: 'Source trailer-loads of grade-A tubers for nationwide distribution', energy: 21, earnMin: 16000, earnMax: 30000 },
  },
  {
    id: 'borno',
    name: 'Borno',
    capital: 'Maiduguri',
    zone: 'North East',
    slogan: 'Home of Peace',
    costMultiplier: 0.9,
    delicacy: { name: 'Maiduguri Kilishi & Masa', desc: 'Spiced sun-dried beef wafers dusted in crushed kuli-kuli pepper', hunger: 35, joy: 24, cost: 2800 },
    jobMarket: { specialtyJob: 'Gum Arabic & Sahel Border Commerce', desc: 'Inspect premium acacia resin lots for international export brokers', energy: 19, earnMin: 14000, earnMax: 28000 },
  },
  {
    id: 'cross_river',
    name: 'Cross River',
    capital: 'Calabar',
    zone: 'South South',
    slogan: "The People's Paradise",
    costMultiplier: 1.1,
    delicacy: { name: 'Edikang Ikong & Yellow Garri', desc: 'Royal vegetable broth with waterleaf, snails, cow leg and dry fish', hunger: 42, joy: 26, cost: 3600 },
    jobMarket: { specialtyJob: 'Calabar Eco-Tourism & Cocoa Farming', desc: 'Guide rainforest excursions and process premium cocoa drying tables', energy: 18, earnMin: 16000, earnMax: 32000 },
  },
  {
    id: 'delta',
    name: 'Delta',
    capital: 'Asaba / Warri',
    zone: 'South South',
    slogan: 'The Big Heart',
    costMultiplier: 1.15,
    delicacy: { name: 'Banga Soup & Starch', desc: 'Fragrant palm fruit extract with beletiete spices and glossy yellow starch', hunger: 45, joy: 25, cost: 3800 },
    jobMarket: { specialtyJob: 'Warri Marine Rigging & Pipefitting', desc: 'Supply offshore industrial valves and marine mechanical fittings', energy: 22, earnMin: 22000, earnMax: 44000 },
  },
  {
    id: 'ebonyi',
    name: 'Ebonyi',
    capital: 'Abakaliki',
    zone: 'South East',
    slogan: 'Salt of the Nation',
    costMultiplier: 0.9,
    delicacy: { name: 'Ofe Nsala (White Soup) & Yam', desc: 'Spicy catfish broth thickened with boiled white yam paste', hunger: 37, joy: 21, cost: 2700 },
    jobMarket: { specialtyJob: 'Abakaliki Parboiled Rice Milling', desc: 'Operate de-stoning machines and package 50kg rice bags for retailers', energy: 20, earnMin: 14000, earnMax: 27000 },
  },
  {
    id: 'edo',
    name: 'Edo',
    capital: 'Benin City',
    zone: 'South South',
    slogan: 'Heartbeat of the Nation',
    costMultiplier: 1.05,
    delicacy: { name: 'Black Soup (Omobe) & Pounded Yam', desc: 'Medicinal ground herb soup with roasted cow meat from the ancient kingdom', hunger: 40, joy: 23, cost: 3200 },
    jobMarket: { specialtyJob: 'Bronze Casting & Industrial Starch', desc: 'Craft artistic bronze emblems and supervise industrial cassava tubers', energy: 19, earnMin: 16000, earnMax: 31000 },
  },
  {
    id: 'ekiti',
    name: 'Ekiti',
    capital: 'Ado-Ekiti',
    zone: 'South West',
    slogan: 'Land of Honour',
    costMultiplier: 0.9,
    delicacy: { name: 'Iyan Ekiti & Egusi Efo', desc: 'Velvety smooth pounded yam with melon seeds and bushmeat gravy', hunger: 40, joy: 21, cost: 2500 },
    jobMarket: { specialtyJob: 'Timber Logging & Cocoa Depot', desc: 'Measure mahogany timber logs and coordinate warehouse cocoa scales', energy: 20, earnMin: 13000, earnMax: 26000 },
  },
  {
    id: 'enugu',
    name: 'Enugu',
    capital: 'Enugu City',
    zone: 'South East',
    slogan: 'Coal City State',
    costMultiplier: 1.05,
    delicacy: { name: 'Okpa Di Oku & Spicy Abacha', desc: 'Steaming hot Bambara nut cake and shredded cassava salad with garden eggs', hunger: 36, joy: 24, cost: 2600 },
    jobMarket: { specialtyJob: 'Coal City Software Outsourcing', desc: 'Provide remote code services for Lagos fintech companies', energy: 19, earnMin: 18000, earnMax: 36000 },
  },
  {
    id: 'gombe',
    name: 'Gombe',
    capital: 'Gombe',
    zone: 'North East',
    slogan: 'Jewel in the Savannah',
    costMultiplier: 0.85,
    delicacy: { name: 'Dambun Shinkafa & Moringa', desc: 'Steamed crushed rice mixed with moringa, spices and dried minced meat', hunger: 33, joy: 16, cost: 2100 },
    jobMarket: { specialtyJob: 'Cotton Ginnery & Grain Warehousing', desc: 'Press cotton lint bales and manage regional sorghum silos', energy: 19, earnMin: 13000, earnMax: 24000 },
  },
  {
    id: 'imo',
    name: 'Imo',
    capital: 'Owerri',
    zone: 'South East',
    slogan: 'Eastern Heartland',
    costMultiplier: 1.15,
    delicacy: { name: 'Ofe Owerri with Stockfish & Snails', desc: 'Luxurious Igbo soup packed with fluted pumpkin, garden egg leaves and snail', hunger: 43, joy: 25, cost: 4000 },
    jobMarket: { specialtyJob: 'Hospitality & Luxury Real Estate', desc: 'Manage executive boutique hotels and broker prime residential plots', energy: 18, earnMin: 19000, earnMax: 38000 },
  },
  {
    id: 'jigawa',
    name: 'Jigawa',
    capital: 'Dutse',
    zone: 'North West',
    slogan: 'The New World',
    costMultiplier: 0.85,
    delicacy: { name: 'Tuwo Masara & Miyan Kubewa', desc: 'Corn meal swallow with sun-dried okra powder and braised meat', hunger: 31, joy: 15, cost: 1900 },
    jobMarket: { specialtyJob: 'Sweet Dates & Sesame Export Silos', desc: 'Pack desert dates in cartons for Middle East freight buyers', energy: 18, earnMin: 12000, earnMax: 22000 },
  },
  {
    id: 'kaduna',
    name: 'Kaduna',
    capital: 'Kaduna / Zaria',
    zone: 'North West',
    slogan: 'Centre of Learning',
    costMultiplier: 1.0,
    delicacy: { name: 'Tuwo Dawa & Miyan Zogale', desc: 'Nutritious guinea corn with fresh moringa soup and goat cuts', hunger: 34, joy: 18, cost: 2300 },
    jobMarket: { specialtyJob: 'Dry Port Rail Cargo & Textile Trade', desc: 'Coordinate container manifests arriving from Lagos sea ports', energy: 19, earnMin: 16000, earnMax: 32000 },
  },
  {
    id: 'kano',
    name: 'Kano',
    capital: 'Kano Municipal',
    zone: 'North West',
    slogan: 'Centre of Commerce',
    costMultiplier: 1.1,
    delicacy: { name: 'Tuwo Shinkafa & Dambu Nama', desc: 'Fluffy white rice swallow served with savory shredded seasoned dried beef', hunger: 36, joy: 22, cost: 2800 },
    jobMarket: { specialtyJob: 'Kurmi Market Wholesale Textiles & Leather', desc: 'Trade wholesale dyed fabrics and genuine goat leather hides', energy: 20, earnMin: 20000, earnMax: 42000 },
  },
  {
    id: 'katsina',
    name: 'Katsina',
    capital: 'Katsina',
    zone: 'North West',
    slogan: 'Home of Hospitality',
    costMultiplier: 0.85,
    delicacy: { name: 'Koko & Crispy Kosai', desc: 'Warm spiced millet porridge with crisp golden bean fritters', hunger: 28, joy: 16, cost: 1800 },
    jobMarket: { specialtyJob: 'Cross-Border Grain Clearing & Forwarding', desc: 'Broker bilateral border clearances for sorghum trailers', energy: 19, earnMin: 14000, earnMax: 26000 },
  },
  {
    id: 'kebbi',
    name: 'Kebbi',
    capital: 'Birnin Kebbi',
    zone: 'North West',
    slogan: 'Land of Equity',
    costMultiplier: 0.85,
    delicacy: { name: 'Tuwo & Miyan Karkashi', desc: 'Sorghum meal paired with restorative green herb draw soup', hunger: 32, joy: 15, cost: 2000 },
    jobMarket: { specialtyJob: 'Argungu Rice Paddies & Fish Hatchery', desc: 'Oversee mechanical harvesters in riverine rice fields', energy: 20, earnMin: 13000, earnMax: 26000 },
  },
  {
    id: 'kogi',
    name: 'Kogi',
    capital: 'Lokoja',
    zone: 'North Central',
    slogan: 'The Confluence State',
    costMultiplier: 0.95,
    delicacy: { name: 'Egusi Soup with Confluence Catfish', desc: 'Melon seed soup with huge fresh smoked fish from River Niger', hunger: 37, joy: 20, cost: 2700 },
    jobMarket: { specialtyJob: 'River Niger Cargo Barge Transfer', desc: 'Manage freight transfers at the confluence of Rivers Niger & Benue', energy: 19, earnMin: 15000, earnMax: 29000 },
  },
  {
    id: 'kwara',
    name: 'Kwara',
    capital: 'Ilorin',
    zone: 'North Central',
    slogan: 'State of Harmony',
    costMultiplier: 0.95,
    delicacy: { name: 'Fried Wara & Hot Amala', desc: 'Crispy fried local milk curds served with silky dark yam swallow', hunger: 35, joy: 20, cost: 2400 },
    jobMarket: { specialtyJob: 'Wara Curd Processing & Sobi Pottery', desc: 'Supply cheese curd wholesale to commercial restaurants', energy: 18, earnMin: 14000, earnMax: 27000 },
  },
  {
    id: 'lagos',
    name: 'Lagos',
    capital: 'Ikeja / Victoria Island',
    zone: 'South West',
    slogan: 'Centre of Excellence',
    costMultiplier: 1.5,
    delicacy: { name: 'Smokey Party Jollof & Asun', desc: 'Firewood party jollof with spicy charred goat meat and fried plantain', hunger: 46, joy: 30, cost: 5200 },
    jobMarket: { specialtyJob: 'Lekki Tech Unicorn / Brokerage', desc: 'Close digital software deals or broker luxury serviced flats in Ikoyi', energy: 24, earnMin: 28000, earnMax: 70000 },
  },
  {
    id: 'nasarawa',
    name: 'Nasarawa',
    capital: 'Lafia',
    zone: 'North Central',
    slogan: 'Home of Solid Minerals',
    costMultiplier: 0.9,
    delicacy: { name: 'Yam Porridge (Asaro) with Smoked Beef', desc: 'Slow-simmered yam chunks in red oil, crushed crayfish and tomatoes', hunger: 36, joy: 18, cost: 2300 },
    jobMarket: { specialtyJob: 'Tourmaline Gemstone & Mineral Quarry', desc: 'Inspect raw quartz and semi-precious mineral crystals', energy: 21, earnMin: 15000, earnMax: 32000 },
  },
  {
    id: 'niger',
    name: 'Niger',
    capital: 'Minna',
    zone: 'North Central',
    slogan: 'The Power State',
    costMultiplier: 0.9,
    delicacy: { name: 'Tuwo Masara & Miyan Taushe', desc: 'Maize meal with roasted pumpkin sauce and grilled river fish', hunger: 34, joy: 17, cost: 2100 },
    jobMarket: { specialtyJob: 'Kainji Dam Electrical Logistics & Shea Trade', desc: 'Package unrefined organic shea butter blocks for cosmetic export', energy: 19, earnMin: 14000, earnMax: 27000 },
  },
  {
    id: 'ogun',
    name: 'Ogun',
    capital: 'Abeokuta',
    zone: 'South West',
    slogan: 'Gateway State',
    costMultiplier: 1.1,
    delicacy: { name: 'Lafun (White Amala) & Gbegiri', desc: 'Cassava swallow paired with yellow bean soup and peppery stew', hunger: 38, joy: 20, cost: 2600 },
    jobMarket: { specialtyJob: 'Adire Indigo Tie-Dye Workshop', desc: 'Stamp and dye traditional adire fabrics under Olumo Rock', energy: 18, earnMin: 16000, earnMax: 32000 },
  },
  {
    id: 'ondo',
    name: 'Ondo',
    capital: 'Akure',
    zone: 'South West',
    slogan: 'Sunshine State',
    costMultiplier: 1.0,
    delicacy: { name: 'Pupuru & Marugbo Herbal Soup', desc: 'Smoked cassava dough with therapeutic 44-leaf aromatic soup', hunger: 39, joy: 22, cost: 2700 },
    jobMarket: { specialtyJob: 'Cocoa Plantation Export Depot', desc: 'Grade fermented cocoa beans on drying beds for shipping lines', energy: 20, earnMin: 15000, earnMax: 30000 },
  },
  {
    id: 'osun',
    name: 'Osun',
    capital: 'Osogbo',
    zone: 'South West',
    slogan: 'Land of Virtue',
    costMultiplier: 0.95,
    delicacy: { name: 'Amala Lafun & Gbegiri with Ewedu', desc: 'Silky smooth abula combo with goat meat chunks from local bukas', hunger: 37, joy: 21, cost: 2400 },
    jobMarket: { specialtyJob: 'Osogbo Sacred Woodcarving & Art Studio', desc: 'Carve ceremonial African hardwoods for gallery collectors', energy: 19, earnMin: 14000, earnMax: 28000 },
  },
  {
    id: 'oyo',
    name: 'Oyo',
    capital: 'Ibadan',
    zone: 'South West',
    slogan: 'Pace Setter State',
    costMultiplier: 1.1,
    delicacy: { name: 'Amala Dudu, Ewedu & Gbegiri (Abula)', desc: 'Iconic dark yam flour with slippery ewedu, fiery gbegiri and cow stripe', hunger: 43, joy: 27, cost: 2900 },
    jobMarket: { specialtyJob: 'Bodija Market Foodstuff Fleet Dispatch', desc: 'Coordinate 18-wheeler trailer dispatches of grains and tubers', energy: 20, earnMin: 18000, earnMax: 36000 },
  },
  {
    id: 'plateau',
    name: 'Plateau',
    capital: 'Jos',
    zone: 'North Central',
    slogan: 'Home of Peace and Tourism',
    costMultiplier: 1.0,
    delicacy: { name: 'Gwote & Irish Potato Stew', desc: 'Warm fonio cereal porridge with garden vegetables, brisket & chili', hunger: 38, joy: 24, cost: 2500 },
    jobMarket: { specialtyJob: 'Temperate Strawberry & Cold-Chain Crops', desc: 'Pack fresh strawberries and crisp cabbages for chilled airfreight', energy: 18, earnMin: 15000, earnMax: 31000 },
  },
  {
    id: 'rivers',
    name: 'Rivers',
    capital: 'Port Harcourt',
    zone: 'South South',
    slogan: 'Treasure Base of the Nation',
    costMultiplier: 1.4,
    delicacy: { name: 'PH Bole & Roasted Fish with Sauce', desc: 'Sweet charcoal-roasted plantain with giant croaker fish and pepper sauce', hunger: 45, joy: 28, cost: 4500 },
    jobMarket: { specialtyJob: 'Oilfield Engineering Subcontractor', desc: 'Service offshore petroleum valves and maritime welding contracts', energy: 22, earnMin: 25000, earnMax: 55000 },
  },
  {
    id: 'sokoto',
    name: 'Sokoto',
    capital: 'Sokoto',
    zone: 'North West',
    slogan: 'Seat of the Caliphate',
    costMultiplier: 0.9,
    delicacy: { name: 'Tuwo Shinkafa & Miya Zogale', desc: 'Moringa leaf soup cooked with crushed peanut paste and beef cuts', hunger: 33, joy: 17, cost: 2100 },
    jobMarket: { specialtyJob: 'Red Sokoto Moroccan Goat Leather Export', desc: 'Supply supple red goat leather to luxury tanneries', energy: 19, earnMin: 15000, earnMax: 29000 },
  },
  {
    id: 'taraba',
    name: 'Taraba',
    capital: 'Jalingo',
    zone: 'North East',
    slogan: "Nature's Gift to the Nation",
    costMultiplier: 0.85,
    delicacy: { name: 'Miyan Geda (Groundnut Soup) & Tuwo', desc: 'Creamy roasted peanut soup with spinach and smoked catfish', hunger: 37, joy: 19, cost: 2300 },
    jobMarket: { specialtyJob: 'Mambilla Highland Tea Estate Operations', desc: 'Grade orthodox black tea leaves on misty plateaus', energy: 19, earnMin: 14000, earnMax: 27000 },
  },
  {
    id: 'yobe',
    name: 'Yobe',
    capital: 'Damaturu',
    zone: 'North East',
    slogan: 'Pride of the Sahel',
    costMultiplier: 0.85,
    delicacy: { name: 'Tuwo Dawa & Miyan Karkashi', desc: 'Steamed sorghum swallow with thick mucilaginous herb sauce', hunger: 32, joy: 15, cost: 1900 },
    jobMarket: { specialtyJob: 'Potiskum Cattle Market Livestock Broker', desc: 'Broker prize bulls and desert camels at cattle exchange', energy: 20, earnMin: 15000, earnMax: 28000 },
  },
  {
    id: 'zamfara',
    name: 'Zamfara',
    capital: 'Gusau',
    zone: 'North West',
    slogan: 'Farming is Our Pride',
    costMultiplier: 0.85,
    delicacy: { name: 'Tuwo Masara & Miyan Taushe', desc: 'Traditional staple with roasted squash and slow-braised lamb cuts', hunger: 33, joy: 16, cost: 2000 },
    jobMarket: { specialtyJob: 'Artisanal Gold Prospecting & Cotton Lint', desc: 'Pan alluvial gold dust and bundle raw white cotton lint', energy: 21, earnMin: 15000, earnMax: 30000 },
  },
  {
    id: 'fct',
    name: 'FCT Abuja',
    capital: 'Maitama / Garki',
    zone: 'North Central',
    slogan: 'Centre of Unity',
    costMultiplier: 1.45,
    delicacy: { name: 'Maitama Suya Platter & Shawarma', desc: 'Sizzling prime sirloin beef with yaji spice, onions, and flatbread', hunger: 42, joy: 29, cost: 4800 },
    jobMarket: { specialtyJob: 'Federal Procurement & Policy Advisory', desc: 'Prepare compliance tenders for federal ministries in Central Area', energy: 22, earnMin: 26000, earnMax: 60000 },
  },
];

/* =========================================================================
   2. DESTINATION COUNTRIES & GLOBAL DATA
   ========================================================================= */

export type CurrencyCode = 'NGN' | 'USD' | 'GBP' | 'EUR' | 'CAD';

export type LegalStatus =
  | 'CITIZEN_NIGERIA'
  | 'LEGAL_RESIDENT'
  | 'UNDOCUMENTED'
  | 'LEGALIZED_PERMANENT_RESIDENT';

export interface ForeignJob {
  id: string;
  title: string;
  hourlyWage: number;
  currency: CurrencyCode;
  currencySymbol: string;
  energyCost: number;
  hungerCost: number;
  reqSkill?: string;
  desc: string;
}

export interface CashInHandJob {
  id: string;
  countryId: string;
  title: string;
  hourlyWage: number;
  currency: CurrencyCode;
  currencySymbol: string;
  energyCost: number;
  hungerCost: number;
  raidRisk: number; // 0.08 - 0.14
  desc: string;
}

export interface CountryData {
  id: string;
  name: string;
  flag: string;
  city: string;
  currency: CurrencyCode;
  currencySymbol: string;
  visaName: string;
  visaFeeUSD: number;
  proofOfFundsNGN: number;
  flightTicketUSD: number;
  delicacy: {
    name: string;
    desc: string;
    hunger: number;
    joy: number;
    costForeign: number;
  };
  foreignJobs: ForeignJob[];
  cashJobs: CashInHandJob[];
  rejectionReasons: string[];
  interviewQuestions: {
    prompt: string;
    choices: { text: string; score: number }[];
  }[];
}

export const DESTINATION_COUNTRIES: CountryData[] = [
  {
    id: 'uk',
    name: 'United Kingdom',
    flag: '🇬🇧',
    city: 'London',
    currency: 'GBP',
    currencySymbol: '£',
    visaName: 'Skilled Worker / Health & Care Visa',
    visaFeeUSD: 190,
    proofOfFundsNGN: 15000000,
    flightTicketUSD: 850,
    delicacy: { name: 'Full English Breakfast & Earl Grey', desc: 'Crispy bacon, Cumberland sausages, baked beans & sourdough', hunger: 45, joy: 28, costForeign: 15 },
    foreignJobs: [
      { id: 'uk_care', title: 'NHS Senior Care Worker', hourlyWage: 22, currency: 'GBP', currencySymbol: '£', energyCost: 18, hungerCost: 12, desc: 'Provide essential nursing and clinical assistance in regional NHS wards.' },
      { id: 'uk_warehouse', title: 'London Underground Logistics Lead', hourlyWage: 26, currency: 'GBP', currencySymbol: '£', energyCost: 20, hungerCost: 14, desc: 'Coordinate passenger dispatch and terminal inventory in central transit stations.' },
      { id: 'uk_tech', title: 'Canary Wharf Software Engineer', hourlyWage: 65, currency: 'GBP', currencySymbol: '£', energyCost: 18, hungerCost: 10, reqSkill: 'coding_cert', desc: 'Develop low-latency fintech payment rails for British investment banks.' },
    ],
    cashJobs: [
      { id: 'uk_cash_kitchen', countryId: 'uk', title: 'Night Kitchen Porter / Dishwasher', hourlyWage: 11, currency: 'GBP', currencySymbol: '£', energyCost: 18, hungerCost: 14, raidRisk: 0.08, desc: 'Wash pots and pans in back-alley restaurant kitchens. Paid cash-in-hand in envelope.' },
      { id: 'uk_cash_build', countryId: 'uk', title: 'Off-the-Books Construction Labourer', hourlyWage: 13, currency: 'GBP', currencySymbol: '£', energyCost: 22, hungerCost: 16, raidRisk: 0.12, desc: 'Haul cement bags and clear rubble on unregulated renovation sites.' },
      { id: 'uk_cash_carwash', countryId: 'uk', title: 'Cash-in-Hand Hand Carwash Attendant', hourlyWage: 9, currency: 'GBP', currencySymbol: '£', energyCost: 19, hungerCost: 13, raidRisk: 0.10, desc: 'Scrub tires and buff luxury vehicles under cold drizzle for daily tips.' },
    ],
    rejectionReasons: [
      'Appendix Finance: Bank statement did not meet 28-day consecutive balance rule.',
      'Immigration Rules Part 9: Failure to demonstrate genuine intention to fulfill shortage role.',
      'Insufficient proof of English proficiency certificate verification.',
    ],
    interviewQuestions: [
      {
        prompt: 'Why do you believe you meet the Home Office points-based requirements?',
        choices: [
          { text: 'I hold registered qualifications, valid CoS reference, and personal maintenance.', score: 35 },
          { text: 'I just need to enter London first, then figure out work in Peckham.', score: -45 },
          { text: 'My cousin promised to host me in Manchester while I look around.', score: -20 },
        ],
      },
      {
        prompt: 'How do you intend to finance your initial housing before first monthly payroll?',
        choices: [
          { text: 'Through personal liquid reserves demonstrated on my stamped bank statement.', score: 40 },
          { text: 'Borrowing from acquaintances through unregistered cash transfers.', score: -40 },
          { text: 'Using pre-booked employer corporate temporary accommodation.', score: 35 },
        ],
      },
    ],
  },
  {
    id: 'usa',
    name: 'United States',
    flag: '🇺🇸',
    city: 'New York',
    currency: 'USD',
    currencySymbol: '$',
    visaName: 'B1/B2 Non-Immigrant / H-1B Visa',
    visaFeeUSD: 185,
    proofOfFundsNGN: 25000000,
    flightTicketUSD: 1100,
    delicacy: { name: 'NYC Pastrami Sandwich & Craft Soda', desc: 'Spiced cured beef brisket layered on rye with kosher pickles', hunger: 48, joy: 30, costForeign: 22 },
    foreignJobs: [
      { id: 'us_amazon', title: 'Amazon Fulfillment Shift Lead', hourlyWage: 28, currency: 'USD', currencySymbol: '$', energyCost: 20, hungerCost: 14, desc: 'Direct automated robotics sorting in massive New Jersey warehouse hubs.' },
      { id: 'us_driver', title: 'NYC Rideshare & City Driver', hourlyWage: 32, currency: 'USD', currencySymbol: '$', energyCost: 19, hungerCost: 12, desc: 'Navigate Midtown traffic and airport pickups during evening peak surges.' },
      { id: 'us_tech', title: 'Silicon Alley Tech Software Engineer', hourlyWage: 85, currency: 'USD', currencySymbol: '$', energyCost: 18, hungerCost: 10, reqSkill: 'coding_cert', desc: 'Architect enterprise cloud infrastructure for Manhattan tech unicorns.' },
    ],
    cashJobs: [
      { id: 'us_cash_cook', countryId: 'usa', title: 'Back-Alley Diner Line Cook', hourlyWage: 14, currency: 'USD', currencySymbol: '$', energyCost: 19, hungerCost: 14, raidRisk: 0.10, desc: 'Grill burgers and prep fries over hot grease without paper trail.' },
      { id: 'us_cash_demolition', countryId: 'usa', title: 'Unlicensed Day Labor & Demolition', hourlyWage: 16, currency: 'USD', currencySymbol: '$', energyCost: 24, hungerCost: 16, raidRisk: 0.14, desc: 'Picked up on street corners for heavy masonry teardown.' },
      { id: 'us_cash_janitor', countryId: 'usa', title: 'Graveyard Shift Janitorial Cleaner', hourlyWage: 12, currency: 'USD', currencySymbol: '$', energyCost: 17, hungerCost: 12, raidRisk: 0.08, desc: 'Mop corporate skyscrapers after midnight under shadow contractors.' },
    ],
    rejectionReasons: [
      'Section 214(b) INA: Failed to overcome presumption of immigrant intent / lack of strong ties.',
      'Unexplained large lump-sum deposit flagged on bank statement prior to interview.',
      'Contradictory travel purpose during consular officer interrogation.',
    ],
    interviewQuestions: [
      {
        prompt: 'What strong binding social and economic ties guarantee your return to Nigeria?',
        choices: [
          { text: 'Verifiable corporate employment, titled landed property, and dependent family.', score: 45 },
          { text: 'I sold everything in Lagos to fund this trip because life is hard.', score: -75 },
          { text: 'I love Nigeria and plan to return once my conference finishes.', score: 15 },
        ],
      },
      {
        prompt: 'Can you account for the source of funds reflected in your account statement?',
        choices: [
          { text: 'Consistent business turnover and documented salary deposits over 12 months.', score: 40 },
          { text: 'My uncle transferred the money into my account just for this embassy interview.', score: -80 },
          { text: 'Personal savings generated from freelance technology consultancy.', score: 30 },
        ],
      },
    ],
  },
  {
    id: 'canada',
    name: 'Canada',
    flag: '🇨🇦',
    city: 'Toronto',
    currency: 'CAD',
    currencySymbol: 'C$',
    visaName: 'Express Entry / Study Permit',
    visaFeeUSD: 150,
    proofOfFundsNGN: 20000000,
    flightTicketUSD: 1150,
    delicacy: { name: 'Poutine with Quebec Curds & Maple Bacon', desc: 'Golden hot fries drenched in savory brown gravy & squeaky curds', hunger: 44, joy: 28, costForeign: 18 },
    foreignJobs: [
      { id: 'ca_uber', title: 'Toronto Rideshare & Uber Driver', hourlyWage: 26, currency: 'CAD', currencySymbol: 'C$', energyCost: 18, hungerCost: 12, desc: 'Drive snow-cleared downtown avenues and ferry commuters to Union Station.' },
      { id: 'ca_logistics', title: 'Ontario Cold-Chain Coordinator', hourlyWage: 32, currency: 'CAD', currencySymbol: 'C$', energyCost: 19, hungerCost: 14, desc: 'Manage temperature-controlled vaccine and grocery fleet manifests.' },
      { id: 'ca_cloud', title: 'Cloud Solutions Architect', hourlyWage: 75, currency: 'CAD', currencySymbol: 'C$', energyCost: 18, hungerCost: 10, reqSkill: 'coding_cert', desc: 'Deploy fault-tolerant Kubernetes clusters for Bay Street banking clients.' },
    ],
    cashJobs: [
      { id: 'ca_cash_snow', countryId: 'canada', title: 'Cash Snow Shoveling & Moving', hourlyWage: 15, currency: 'CAD', currencySymbol: 'C$', energyCost: 22, hungerCost: 15, raidRisk: 0.09, desc: 'Clear driveways in freezing sub-zero weather for direct cash tips.' },
      { id: 'ca_cash_sort', countryId: 'canada', title: 'Off-the-Books Vegetable Packer', hourlyWage: 13, currency: 'CAD', currencySymbol: 'C$', energyCost: 18, hungerCost: 13, raidRisk: 0.11, desc: 'Crate potatoes and carrots in unheated food terminal warehouses.' },
    ],
    rejectionReasons: [
      'IRCC Section 216(1): Officer not satisfied you will leave Canada at end of stay.',
      'Proof of settlement funds not unencumbered or readily accessible.',
      'Course/career progression lacks logical coherence with past academic history.',
    ],
    interviewQuestions: [
      {
        prompt: 'How do you satisfy IRCC settlement funds criteria for living in Ontario?',
        choices: [
          { text: 'Personal funds unencumbered by liens, held in my personal commercial bank.', score: 40 },
          { text: 'Informal loans taken with 50% weekly interest from neighbourhood lenders.', score: -60 },
          { text: 'Certified bank manager letter and audited financial portfolio.', score: 35 },
        ],
      },
      {
        prompt: 'Why choose Canada specifically over educational and career options in Nigeria?',
        choices: [
          { text: 'To gain advanced specialization in critical STEM sectors to deploy back home.', score: 35 },
          { text: 'Anywhere outside Nigeria is fine, I just took the easiest option.', score: -40 },
          { text: 'Canada has world-class post-graduate research laboratories in my field.', score: 30 },
        ],
      },
    ],
  },
  {
    id: 'germany',
    name: 'Germany',
    flag: '🇩🇪',
    city: 'Berlin',
    currency: 'EUR',
    currencySymbol: '€',
    visaName: 'Opportunity Card (Chancenkarte) / Job Seeker',
    visaFeeUSD: 110,
    proofOfFundsNGN: 12000000,
    flightTicketUSD: 780,
    delicacy: { name: 'Currywurst, Fries & Sourdough Pretzel', desc: 'Fried sausage seasoned with curry ketchup and golden crusty pretzel', hunger: 42, joy: 25, costForeign: 14 },
    foreignJobs: [
      { id: 'de_support', title: 'Bilingual Tech Support Specialist', hourlyWage: 25, currency: 'EUR', currencySymbol: '€', energyCost: 16, hungerCost: 10, desc: 'Handle client escalations for European enterprise logistics providers.' },
      { id: 'de_logistics', title: 'Berlin Cargo Logistics Team Lead', hourlyWage: 29, currency: 'EUR', currencySymbol: '€', energyCost: 20, hungerCost: 14, desc: 'Supervise rail freight consolidation in Brandenburg distribution centers.' },
      { id: 'de_tech', title: 'Senior Full-Stack Engineer', hourlyWage: 68, currency: 'EUR', currencySymbol: '€', energyCost: 18, hungerCost: 10, reqSkill: 'coding_cert', desc: 'Develop sustainable clean-tech microservices in Berlin-Kreuzberg.' },
    ],
    cashJobs: [
      { id: 'de_cash_dish', countryId: 'germany', title: 'Unregistered Bistro Cleaner', hourlyWage: 10, currency: 'EUR', currencySymbol: '€', energyCost: 17, hungerCost: 12, raidRisk: 0.09, desc: 'Wash beer mugs and scrub kitchen tiles behind closed doors in Neukölln.' },
      { id: 'de_cash_scaffold', countryId: 'germany', title: 'Demolition Site Assistant', hourlyWage: 12, currency: 'EUR', currencySymbol: '€', energyCost: 22, hungerCost: 15, raidRisk: 0.12, desc: 'Dismantle scaffolding on construction sites for cash envelopes.' },
    ],
    rejectionReasons: [
      'Blocked Account (Sperrkonto) minimum balance statutory requirement not satisfied.',
      'Language certification credentials could not be verified with Goethe-Institut.',
      'Failure to score minimum points on statutory Chancenkarte grid.',
    ],
    interviewQuestions: [
      {
        prompt: 'Have you fulfilled the mandatory Sperrkonto blocked account deposit for Germany?',
        choices: [
          { text: 'Yes, statutory funds are deposited in a recognized German blocked account.', score: 45 },
          { text: 'I plan to bring cash paper notes in my pocket after landing.', score: -60 },
          { text: 'Official formal bank guarantee letter provided by registered guarantor.', score: 35 },
        ],
      },
      {
        prompt: 'Which shortage occupational cluster matches your university qualification?',
        choices: [
          { text: 'IT, Software Engineering, and Renewable Technology sector shortages.', score: 35 },
          { text: 'I will look for whatever manual job shows up on Berlin streets.', score: -30 },
          { text: 'Healthcare diagnostics and telecommunications engineering.', score: 30 },
        ],
      },
    ],
  },
  {
    id: 'uae',
    name: 'United Arab Emirates',
    flag: '🇦🇪',
    city: 'Dubai',
    currency: 'USD',
    currencySymbol: '$',
    visaName: 'Green Freelance / Remote Residence Visa',
    visaFeeUSD: 120,
    proofOfFundsNGN: 5000000,
    flightTicketUSD: 520,
    delicacy: { name: 'Al Machboos Spiced Lamb & Saffron Rice', desc: 'Fragrant basmati with dried lime, whole cardamom, tender lamb & almonds', hunger: 46, joy: 29, costForeign: 20 },
    foreignJobs: [
      { id: 'uae_retail', title: 'Dubai Mall Luxury Hospitality & Retail', hourlyWage: 28, currency: 'USD', currencySymbol: '$', energyCost: 17, hungerCost: 11, desc: 'Serve VIP international tourists in Downtown Dubai luxury boutiques.' },
      { id: 'uae_realtor', title: 'Marina Real Estate Investment Advisor', hourlyWage: 50, currency: 'USD', currencySymbol: '$', energyCost: 19, hungerCost: 12, desc: 'Broker off-plan luxury waterfront penthouse suites to global investors.' },
      { id: 'uae_growth', title: 'Digital Growth Marketing Director', hourlyWage: 70, currency: 'USD', currencySymbol: '$', energyCost: 18, hungerCost: 10, reqSkill: 'coding_cert', desc: 'Scale performance campaigns for Business Bay commerce startups.' },
    ],
    cashJobs: [
      { id: 'uae_cash_deira', countryId: 'uae', title: 'Deira Market Porter & Offloader', hourlyWage: 12, currency: 'USD', currencySymbol: '$', energyCost: 20, hungerCost: 14, raidRisk: 0.12, desc: 'Wheel wooden cartloads of spice and textile sacks in scorching Deira alleys.' },
      { id: 'uae_cash_cleaner', countryId: 'uae', title: 'Private Villa Cleaner & Housekeeper', hourlyWage: 14, currency: 'USD', currencySymbol: '$', energyCost: 18, hungerCost: 12, raidRisk: 0.10, desc: 'Mop marble floors in private residences without labor card registration.' },
    ],
    rejectionReasons: [
      'GDRFA Security Clearing: Incomplete document attestation from foreign ministry.',
      'Failure to maintain required health insurance policy coverage.',
      'National demographic visa quota reached for the quarter.',
    ],
    interviewQuestions: [
      {
        prompt: 'What is the commercial or freelance focus of your residence in Dubai?',
        choices: [
          { text: 'Digital software development, international trade, and remote enterprise tech.', score: 35 },
          { text: 'I just want to visit clubs and film TikTok videos on Sheikh Zayed Road.', score: -30 },
          { text: 'Managing regional supply chain distribution for West African clients.', score: 30 },
        ],
      },
      {
        prompt: 'Do you understand local labor laws regarding lawful freelance registration?',
        choices: [
          { text: 'Yes, fully licensed under a verified Free Zone commercial permit.', score: 40 },
          { text: 'I will work under the radar without permits to avoid registration fees.', score: -70 },
          { text: 'Sponsored through an approved corporate entity.', score: 35 },
        ],
      },
    ],
  },
  {
    id: 'ghana',
    name: 'Ghana',
    flag: '🇬🇭',
    city: 'Accra',
    currency: 'USD',
    currencySymbol: '$',
    visaName: 'ECOWAS Residence & Trade Stamp',
    visaFeeUSD: 50,
    proofOfFundsNGN: 2000000,
    flightTicketUSD: 160,
    delicacy: { name: 'Authentic Waakye with Shito & Fried Fish', desc: 'Rice and beans with red sorghum leaves, black pepper sauce & fried plantain', hunger: 42, joy: 26, costForeign: 6 },
    foreignJobs: [
      { id: 'gh_hospitality', title: 'Osu Hospitality & Tourism Coordinator', hourlyWage: 18, currency: 'USD', currencySymbol: '$', energyCost: 16, hungerCost: 10, desc: 'Organize cultural culinary tours and coastal retreats in East Legon.' },
      { id: 'gh_trader', title: 'Cross-Border Gold & Commodity Merchant', hourlyWage: 30, currency: 'USD', currencySymbol: '$', energyCost: 19, hungerCost: 14, desc: 'Liaise between Makola market distributors and regional mineral buyers.' },
      { id: 'gh_tech', title: 'Silicon Accra Tech Hub Instructor', hourlyWage: 42, currency: 'USD', currencySymbol: '$', energyCost: 17, hungerCost: 10, reqSkill: 'coding_cert', desc: 'Train aspiring frontend engineers at modern coding academies in Accra.' },
    ],
    cashJobs: [
      { id: 'gh_cash_porter', countryId: 'ghana', title: 'Makola Market Kayayoo Porter', hourlyWage: 8, currency: 'USD', currencySymbol: '$', energyCost: 18, hungerCost: 13, raidRisk: 0.05, desc: 'Head-carry cargo pans across crowded wholesale market lanes.' },
    ],
    rejectionReasons: [
      'GIPC Trade Infringement: Reserved retail trade compliance query.',
      'Irregularity in ECOWAS biometric passport documentation.',
    ],
    interviewQuestions: [
      {
        prompt: 'Under what protocol of ECOWAS are you establishing entry into Ghana?',
        choices: [
          { text: '1979 ECOWAS Protocol on Free Movement of Persons and Goods.', score: 40 },
          { text: 'I am sneaking through unofficial bush paths at Aflao border.', score: -80 },
          { text: 'Visiting for regional cross-border commerce and tech hub exchanges.', score: 30 },
        ],
      },
      {
        prompt: 'Between Nigerian Jollof and Ghanaian Jollof, which one is superior?',
        choices: [
          { text: 'Both are West African treasures uniting our people through culinary greatness!', score: 50 },
          { text: 'Ghana Jollof has no taste whatsoever!', score: -30 },
          { text: 'I love Ghanaian Waakye and Naija Smokey Jollof equally with all my heart.', score: 40 },
        ],
      },
    ],
  },
];

/* =========================================================================
   3. UNOFFICIAL ROUTES (HIGH-RISK SMUGGLING ENGINE)
   ========================================================================= */

export interface UnofficialRoute {
  id: string;
  destinationCountryId: string;
  name: string;
  pathway: string;
  agentFeeNGN: number;
  failureRate: number; // 0.60 (60% failure rate)
  dangerDescription: string;
  possibleDisasters: {
    title: string;
    narrative: string;
    healthDrop: number;
    energyDrop: number;
  }[];
}

export const UNOFFICIAL_SMUGGLING_ROUTES: UnofficialRoute[] = [
  {
    id: 'route_uk_dinghy',
    destinationCountryId: 'uk',
    name: 'English Channel Dinghy & Cargo Smuggling',
    pathway: 'Lagos → Transit Airport → Calais Jungle Camp → Small Inflatable Dinghy → Dover Beach',
    agentFeeNGN: 5200000,
    failureRate: 0.60,
    dangerDescription: 'Extremely freezing sea waters, puncture risk on overloaded dinghy, thermal drone scans by UK Border Force.',
    possibleDisasters: [
      { title: 'Channel Patrol Interception', narrative: 'Border Force intercepted your rubber dinghy near Dover. French coastguards pulled you from freezing waters and detained you in Calais camp.', healthDrop: 45, energyDrop: 50 },
      { title: 'Smuggling Syndicate Scam', narrative: 'The "connection man" collected your ₦5.2M in cash, gave you a fake rendezvous point in France, and vanished into thin air!', healthDrop: 20, energyDrop: 30 },
      { title: 'Refrigerated Truck Hypothermia', narrative: 'You hid inside a cold storage lorry. You suffered severe hypothermia before being discovered and dumped back at a transit checkpoint.', healthDrop: 55, energyDrop: 60 },
    ],
  },
  {
    id: 'route_usa_dunkey',
    destinationCountryId: 'usa',
    name: 'The "Dunkey" Jungle & Rio Grande Crossing',
    pathway: 'Lagos → South America → Darien Gap Jungle Hike → Central America → Rio Grande River Crossing',
    agentFeeNGN: 7500000,
    failureRate: 0.60,
    dangerDescription: 'Deadly jungle terrain, cartel checkpoints, flash floods in Darien Gap, and aggressive border patrol sweeps.',
    possibleDisasters: [
      { title: 'Cartel Ambush & Robbery', narrative: 'Coyotes stripped your group of passports, mobile phones, and remaining dollars in the jungle. You were left stranded in Guatemala with severe fever.', healthDrop: 50, energyDrop: 60 },
      { title: 'Rio Grande Current Swept', narrative: 'Strong river currents swept away your group gear. US Border Patrol spotted you with night-vision scopes and immediately deported you.', healthDrop: 45, energyDrop: 50 },
      { title: 'Fake Travel Agent Abandonment', narrative: 'Your connection agent dumped you at an airport transit zone without connecting boarding passes. You spent days sleeping on concrete floors.', healthDrop: 30, energyDrop: 40 },
    ],
  },
  {
    id: 'route_germany_sahara',
    destinationCountryId: 'germany',
    name: 'Sahara Desert & Mediterranean Sea Boat',
    pathway: 'Kano → Agadez Desert Trucks → Tripoli Detention Risk → Mediterranean Boat → Lampedusa → Berlin',
    agentFeeNGN: 2800000,
    failureRate: 0.60,
    dangerDescription: 'Extreme Sahara heat exhaustion, militia detention in Libya, dangerous sea crossing on wooden fishing boats.',
    possibleDisasters: [
      { title: 'Desert Truck Breakdown & Dehydration', narrative: 'The 4x4 pickup broke down amid Saharan sand dunes. You spent 3 days without water before an emergency humanitarian rescue found you.', healthDrop: 60, energyDrop: 70 },
      { title: 'Libyan Militia Detention', narrative: 'Armed militia intercepted the convoy near Sabha. You were locked in a warehouse until your family in Nigeria sent emergency ransom to release you.', healthDrop: 50, energyDrop: 60 },
      { title: 'Capsized Sea Dinghy', narrative: 'The engine stalled 12 miles off Zuwarah. You treaded water for hours before an NGO rescue boat picked you up and returned you to coastal quarantine.', healthDrop: 45, energyDrop: 55 },
    ],
  },
  {
    id: 'route_uae_ghost',
    destinationCountryId: 'uae',
    name: 'Ghost Visa Agent & Deira Irregular Transit',
    pathway: 'Lagos → Addis Ababa → Dubai Tourist Entry → Fake Quota Agent Runs → Irregular Deira Slum Room',
    agentFeeNGN: 1900000,
    failureRate: 0.60,
    dangerDescription: 'Fake employment offer letters, airport passport confiscation, sudden immigration raid in crowded partitioned flats.',
    possibleDisasters: [
      { title: 'Airport Immigration Turnaround', narrative: 'Dubai airport border control detected fraudulent hotel reservations and returned you on the very next flight back to Lagos MMIA.', healthDrop: 20, energyDrop: 35 },
      { title: 'Passport Seizure by Fraud Syndicate', narrative: 'The fake recruitment agent took your passport and ₦1.9M promising a residency card, then blocked your WhatsApp number permanently.', healthDrop: 25, energyDrop: 40 },
    ],
  },
  {
    id: 'route_canada_snow',
    destinationCountryId: 'canada',
    name: 'Northern Border Winter Forest Crossing',
    pathway: 'Transit Flight → Northern US Rural Post → Unpatrolled Quebec Snow Trail Trek → Montreal / Toronto',
    agentFeeNGN: 4800000,
    failureRate: 0.60,
    dangerDescription: 'Severe frostbite, disorientation in deep Canadian winter blizzards, RCMP thermal imaging patrols.',
    possibleDisasters: [
      { title: 'Severe Frostbite in Snowdrift', narrative: 'You lost your path in a blinding blizzard at -22°C. Forest rangers found you semi-conscious with frostbitten fingers and transported you to hospital.', healthDrop: 55, energyDrop: 65 },
      { title: 'RCMP Thermal Drone Interception', narrative: 'Thermal cameras spotted foot tracks in the snow within 500 meters of the border fence. You were intercepted and refused entry.', healthDrop: 35, energyDrop: 45 },
    ],
  },
  {
    id: 'route_ghana_bush',
    destinationCountryId: 'ghana',
    name: 'Cross-Border Bush Path & Motorbike Crossing',
    pathway: 'Badagry → Seme Bush Paths → Cotonou → Aflao Creek Boat → Accra Undocumented',
    agentFeeNGN: 350000,
    failureRate: 0.60,
    dangerDescription: 'Border vigilantes, extortion along unpaved creek trails, motorcycle accidents on swampy terrain.',
    possibleDisasters: [
      { title: 'Border Gendarme Shakedown', narrative: 'Gendarmes ambushed your motorcycle in the mangroves, seized your baggage and personal cash, and forced you to trek back to Seme border.', healthDrop: 30, energyDrop: 40 },
      { title: 'Motorcycle Swamp Crash', narrative: 'The speeding smuggler lost control on slippery red clay, tossing you into swamp mud with sprained limbs.', healthDrop: 35, energyDrop: 45 },
    ],
  },
];

/* =========================================================================
   4. NIGERIAN REAL ESTATE & LAND ASSETS FOR REMITTANCE
   ========================================================================= */

export interface NigerianLandAsset {
  id: string;
  title: string;
  location: string;
  costNGN: number;
  passiveYieldPerDayNGN: number;
  desc: string;
}

export const NIGERIAN_LAND_ASSETS: NigerianLandAsset[] = [
  {
    id: 'ibadan_plot',
    title: 'Moniya / Ido Commercial Plot (Ibadan)',
    location: 'Ibadan, Oyo State',
    costNGN: 1800000,
    passiveYieldPerDayNGN: 4500,
    desc: 'Rapidly appreciating 600sqm dry plot close to the Lagos-Ibadan railway terminal. Generates steady agricultural lease yields.',
  },
  {
    id: 'enugu_plot',
    title: 'Centenary City Estate Plot (Enugu)',
    location: 'Enugu City, Enugu State',
    costNGN: 4500000,
    passiveYieldPerDayNGN: 12000,
    desc: 'Prime gated development plot on the rolling hills of Coal City. Appreciates steadily with capital infrastructure growth.',
  },
  {
    id: 'lekki_plot',
    title: 'Prime Lekki Coastal Corridor Plot (Lagos)',
    location: 'Lekki Phase 1 / Epe, Lagos',
    costNGN: 14000000,
    passiveYieldPerDayNGN: 45000,
    desc: 'Commercial dry land along the booming coastal highway corridor. Leased out to logistics operators for solid daily returns.',
  },
  {
    id: 'duplex_block',
    title: '4-Unit Residential Apartment Block (Abuja)',
    location: 'Guzape / Garki, FCT Abuja',
    costNGN: 32000000,
    passiveYieldPerDayNGN: 110000,
    desc: 'Fully tenanted luxury residential block generating passive monthly executive rent directly into your FirstBank account.',
  },
];

/* =========================================================================
   5. LOCAL NIGERIAN CAREERS & SKILL COURSES
   ========================================================================= */

export interface LocalHustleJob {
  id: string;
  title: string;
  category: 'Street & Retail' | 'Civil & Enterprise' | 'Digital & Tech';
  earnMin: number;
  earnMax: number;
  energyCost: number;
  hungerCost: number;
  reqSkill?: string;
  reqDegree?: boolean;
  tieBonus: number;
  desc: string;
}

export const LOCAL_NIGERIAN_JOBS: LocalHustleJob[] = [
  {
    id: 'pos_attendant',
    title: 'POS Terminal Cash-Out & Agent Banking',
    category: 'Street & Retail',
    earnMin: 6500,
    earnMax: 13000,
    energyCost: 12,
    hungerCost: 8,
    tieBonus: 5,
    desc: 'Run a busy agent banking kiosk. Provide instant cash withdrawals and utility bill payments.',
  },
  {
    id: 'okada_hustle',
    title: 'Okada & Commercial Dispatch Riding',
    category: 'Street & Retail',
    earnMin: 12000,
    earnMax: 26000,
    energyCost: 20,
    hungerCost: 15,
    tieBonus: 8,
    desc: 'Beat notorious city gridlocks on two wheels delivering packages and ferrying passengers.',
  },
  {
    id: 'civil_servant',
    title: 'State Civil Service Executive Officer',
    category: 'Civil & Enterprise',
    earnMin: 40000,
    earnMax: 75000,
    energyCost: 16,
    hungerCost: 10,
    reqDegree: true,
    tieBonus: 35,
    desc: 'Process ministry paperwork, attend departmental hearings, and earn steady pensionable pay.',
  },
  {
    id: 'tech_freelancer',
    title: 'Remote Software Engineer / Web Dev',
    category: 'Digital & Tech',
    earnMin: 90000,
    earnMax: 240000,
    energyCost: 20,
    hungerCost: 12,
    reqSkill: 'coding_cert',
    tieBonus: 25,
    desc: 'Build full-stack React and Node applications for overseas clients with inverter power humming.',
  },
];

export interface SkillTrainingCourse {
  id: string;
  title: string;
  cost: number;
  energyReq: number;
  benefit: string;
  desc: string;
}

export const SKILL_COURSES: SkillTrainingCourse[] = [
  {
    id: 'coding_cert',
    title: 'Full-Stack Software Engineering Bootcamp',
    cost: 160000,
    energyReq: 35,
    benefit: 'Unlocks Tech Freelancer (₦90k-₦240k) & Global Tech Engineer roles (£65/hr, $85/hr)',
    desc: 'Master React, TypeScript, cloud deployments, and system architecture with real-world projects.',
  },
  {
    id: 'degree',
    title: 'B.Sc University Degree & NYSC Discharge',
    cost: 500000,
    energyReq: 40,
    benefit: 'Unlocks Civil Service Officer & +20% Embassy Visa Approval',
    desc: 'Complete accredited four-year university program and national service year.',
  },
  {
    id: 'ielts_exam',
    title: 'IELTS Academic & Language Test Coaching',
    cost: 180000,
    energyReq: 20,
    benefit: '+15% Visa Approval for UK, Canada & Germany',
    desc: 'Score Band 8.5 on British Council test to satisfy foreign immigration ministries.',
  },
];

/* =========================================================================
   6. WEB AUDIO SYNTHESIZER
   ========================================================================= */

function playSynth(type: 'coin' | 'alert' | 'stamp' | 'plane' | 'eat' | 'siren') {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (type === 'coin') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } else if (type === 'stamp') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1174.66, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } else if (type === 'plane') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.4);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } else if (type === 'eat') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(350, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(520, ctx.currentTime + 0.09);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } else if (type === 'alert') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.setValueAtTime(240, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } else if (type === 'siren') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(900, ctx.currentTime + 0.2);
      osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.4);
      osc.frequency.linearRampToValueAtTime(900, ctx.currentTime + 0.6);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.7);
    }
  } catch {
    // Ignore audio permission errors
  }
}

/* =========================================================================
   7. TYPES & INTERFACES FOR STATE
   ========================================================================= */

export interface VisaDoc {
  countryId: string;
  status: 'NONE' | 'APPROVED' | 'REJECTED';
  expiryDay?: number;
  rejectionNotice?: string;
}

export interface TerminalEvent {
  id: string;
  timestamp: string;
  category:
    | 'finance'
    | 'travel'
    | 'health'
    | 'career'
    | 'immigration'
    | 'remittance'
    | 'deportation'
    | 'lifestyle'
    | 'save';
  text: string;
}

export interface MultiWallet {
  NGN: number;
  USD: number;
  GBP: number;
  EUR: number;
  CAD: number;
}

export interface ForexRates {
  USD: number;
  GBP: number;
  EUR: number;
  CAD: number;
}

/* =========================================================================
   8. MAIN COMPONENT: NAIJA LIFE ENGINE WITH HIGH-RISK PATHWAYS
   ========================================================================= */

export default function App() {
  // Navigation Tabs: Map & Travel, Home, Careers, Immigration, Forex, Airport
  const [activeTab, setActiveTab] = useState<'map' | 'home' | 'career' | 'immigration' | 'forex' | 'airport'>('map');

  // Immigration Sub-Tab: Official vs Unofficial
  const [immigrationSubTab, setImmigrationSubTab] = useState<'official' | 'unofficial'>('official');

  // User Authentication Session State (Always requires clicking Continue Life or logging in via AuthPortal)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  // Device hardware profile & optimization state (unskippable authentic scan before login)
  const [deviceOptimizationProfile, setDeviceOptimizationProfile] = useState<DeviceOptimizationProfile | null>(null);

  // Storage, Save & Load State
  const [showStorageModal, setShowStorageModal] = useState(false);
  const [showWelcomeBackModal, setShowWelcomeBackModal] = useState(false);
  const [savedGamePreview, setSavedGamePreview] = useState<SavedGameState | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [lastAutoSaveTime, setLastAutoSaveTime] = useState<string>('');
  const [nepaPopup, setNepaPopup] = useState<{ message: string; subMessage: string; hasSolar: boolean } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((cur) => (cur === msg ? null : cur));
    }, 4000);
  }, []);

  // One-time purge of legacy saved game glitch (Emeka Adeleke)
  useEffect(() => {
    try {
      localStorage.removeItem('naija_life_savegame_v1');
      localStorage.removeItem('naija_life_users');
    } catch {
      // ignore
    }
  }, []);

  // Owner Broadcast Radio Player (Synchronized across all servers & players)
  const broadcastAudioRef = useRef<HTMLAudioElement | null>(null);
  const currentAudioSrcRef = useRef<string>('');
  const lastGlobalCounterRef = useRef<number>(1);
  const [isMusicMuted, setIsMusicMuted] = useState<boolean>(false);
  const [isBroadcastPlaying, setIsBroadcastPlaying] = useState<boolean>(false);

  useEffect(() => {
    const audio = broadcastAudioRef.current;
    if (audio) {
      audio.loop = true;
      audio.onended = () => {
        audio.currentTime = 0;
        if (!isMusicMuted && currentAudioSrcRef.current) {
          audio.play().then(() => setIsBroadcastPlaying(true)).catch(() => {});
        }
      };
      audio.onpause = () => {
        // Prevent browser from automatically killing music playback after idle
        if (!isMusicMuted && currentAudioSrcRef.current && !audio.ended) {
          audio.play().then(() => setIsBroadcastPlaying(true)).catch(() => {});
        }
      };
    }
  }, [isMusicMuted]);

  useEffect(() => {
    const syncServerMusicAndGlobalState = async () => {
      try {
        // 1. Sync broadcast soundtrack (Server first, localStorage fallback)
        let activeAudioData = '';
        try {
          const res = await fetch('/api/broadcast/music');
          if (res.ok) {
            const data = await res.json();
            if (data.active) {
              activeAudioData = data.streamUrl || data.audioData || '';
            }
          }
        } catch {}

        if (!activeAudioData && typeof window !== 'undefined') {
          const localTrack = localStorage.getItem('naija_life_broadcast_track');
          if (localTrack) activeAudioData = localTrack;
        }

        const audio = broadcastAudioRef.current;
        if (activeAudioData && audio) {
          if (currentAudioSrcRef.current !== activeAudioData) {
            currentAudioSrcRef.current = activeAudioData;
            audio.src = activeAudioData;
            audio.loop = true;
            if (!isMusicMuted) {
              audio.play().then(() => setIsBroadcastPlaying(true)).catch(() => {});
            }
          } else if (!isMusicMuted && audio.paused) {
            audio.play().then(() => setIsBroadcastPlaying(true)).catch(() => {});
          }
        } else if (!activeAudioData && audio && currentAudioSrcRef.current) {
          currentAudioSrcRef.current = '';
          audio.pause();
          audio.src = '';
          setIsBroadcastPlaying(false);
        }

        // 2. Poll global status to trigger server-wide state refresh if owner bumped globalRefreshCounter
        const statusRes = await fetch('/api/global/status');
        if (statusRes.ok) {
          const statusData = await statusRes.json();
          if (statusData.globalRefreshCounter && statusData.globalRefreshCounter !== lastGlobalCounterRef.current) {
            lastGlobalCounterRef.current = statusData.globalRefreshCounter;
            // Refetch active user session data if logged in
            const curSession = getStoredSession();
            if (curSession?.username) {
              const accRes = await fetch('/api/auth/all-accounts');
              if (accRes.ok) {
                const accData = await accRes.json();
                const cleanU = curSession.username.toLowerCase().trim();
                if (accData.citizens?.[cleanU]?.profile) {
                  const updatedProfile = accData.citizens[cleanU].profile;
                  saveSession(updatedProfile);
                  setCurrentUser(updatedProfile);
                  setWallet((w) => ({
                    ...w,
                    NGN: updatedProfile.bankNaira || w.NGN,
                  }));
                }
              }
            }
          }
        }
      } catch {}
    };

    syncServerMusicAndGlobalState();
    const interval = setInterval(syncServerMusicAndGlobalState, 5000);

    // Cross-tab / cross-device live event synchronization
    let transferChannel: BroadcastChannel | null = null;
    let globalChannel: BroadcastChannel | null = null;
    try {
      transferChannel = new BroadcastChannel('naija_life_bank_transfer');
      transferChannel.onmessage = (evt) => {
        if (evt.data?.recipient && currentUser) {
          const cleanCur = currentUser.username.toLowerCase().trim();
          const cleanRec = String(evt.data.recipient).toLowerCase().trim();
          if (cleanCur === cleanRec) {
            const addedAmount = Number(evt.data.amount) || 0;
            const curr = evt.data.currency || 'NGN';
            if (curr === 'CAD') {
              setCurrentUser((prev) => prev ? { ...prev, bankCAD: (prev.bankCAD || 0) + addedAmount } : null);
              showToast(`🔔 CREDIT ALERT: +$${addedAmount.toLocaleString()} CAD from @${evt.data.sender}!`);
            } else {
              setWallet((w) => ({ ...w, NGN: w.NGN + addedAmount }));
              setCurrentUser((prev) => prev ? { ...prev, bankNaira: (prev.bankNaira || 0) + addedAmount } : null);
              showToast(`🔔 CREDIT ALERT: +₦${addedAmount.toLocaleString()} NGN from @${evt.data.sender}!`);
            }
            triggerSound('coin');
          }
        }
      };

      globalChannel = new BroadcastChannel('naija_life_global_sync');
      globalChannel.onmessage = () => {
        const curSession = getStoredSession();
        if (curSession) {
          setCurrentUser(curSession);
          setWallet((w) => ({ ...w, NGN: curSession.bankNaira || w.NGN }));
        }
      };
    } catch {}

    return () => {
      clearInterval(interval);
      try {
        transferChannel?.close();
        globalChannel?.close();
      } catch {}
    };
  }, [isMusicMuted, currentUser]);

  const handleToggleMusicMute = () => {
    setIsMusicMuted((prev) => {
      const next = !prev;
      const audio = broadcastAudioRef.current;
      if (audio) {
        if (next) {
          audio.pause();
          setIsBroadcastPlaying(false);
        } else if (audio.src) {
          audio.play().then(() => setIsBroadcastPlaying(true)).catch(() => {});
        }
      }
      return next;
    });
  };

  // Player Identity & Birth System
  const [playerName, setPlayerName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);

  // Birth State (Always randomly chosen on New Game from all 36 States + FCT)
  const [birthState, setBirthState] = useState<NigeriaStateData>(() => {
    return ALL_36_NIGERIAN_STATES[Math.floor(Math.random() * ALL_36_NIGERIAN_STATES.length)];
  });

  // Current Location & Legal Residence Status
  const [currentState, setCurrentState] = useState<NigeriaStateData>(() => birthState);
  const [locationMode, setLocationMode] = useState<'NIGERIA' | 'INTERNATIONAL'>('NIGERIA');
  const [internationalCountry, setInternationalCountry] = useState<CountryData | null>(null);

  // LEGAL RESIDENCE STATUS: Citizen / Legal Resident / Undocumented / Legalized PR
  const [legalStatus, setLegalStatus] = useState<LegalStatus>('CITIZEN_NIGERIA');
  const [undocumentedDaysAbroad, setUndocumentedDaysAbroad] = useState<number>(0);

  // Time Engine (Ticks every 4 seconds)
  const [gameDay, setGameDay] = useState(1);
  const [gameHour, setGameHour] = useState(8);
  const [isPaused, setIsPaused] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Need Meters (0 - 100%, decay every 4 seconds)
  const [energy, setEnergy] = useState(85);
  const [hunger, setHunger] = useState(80);
  const [health, setHealth] = useState(95);
  const [happiness, setHappiness] = useState(75);

  // Family Happiness / Karma
  const [familyHappiness, setFamilyHappiness] = useState(65);

  // MULTI-CURRENCY WALLET
  const [wallet, setWallet] = useState<MultiWallet>({
    NGN: 95000,
    USD: 0,
    GBP: 0,
    EUR: 0,
    CAD: 0,
  });

  // Real-Time Fluctuating Forex Rates
  const [fxRates, setFxRates] = useState<ForexRates>({
    USD: 1530,
    GBP: 1980,
    EUR: 1660,
    CAD: 1120,
  });

  const [fxTrends, setFxTrends] = useState<Record<keyof ForexRates, 'up' | 'down' | 'stable'>>({
    USD: 'stable',
    GBP: 'stable',
    EUR: 'stable',
    CAD: 'stable',
  });

  // Real Estate Land Holdings in Nigeria
  const [ownedLandAssets, setOwnedLandAssets] = useState<string[]>([]);

  // PROPERTIES & REAL ESTATE (HOUSE APP)
  const [ownedProperties, setOwnedProperties] = useState<PropertyAsset[]>([]);
  const [activeHome, setActiveHome] = useState<PropertyAsset | null>(null);

  // VEHICLES & CARS (CAR APP)
  const [ownedVehicles, setOwnedVehicles] = useState<VehicleAsset[]>([]);
  const [activeVehicle, setActiveVehicle] = useState<VehicleAsset | null>(null);

  // INVESTMENTS PORTFOLIO (INVESTMENT APP)
  const [investments, setInvestments] = useState<InvestmentAsset[]>(AVAILABLE_INVESTMENTS);

  const handleBuyOrRentProperty = (property: PropertyAsset, mode: 'rent' | 'buy') => {
    const cost = mode === 'rent' ? property.annualRent : property.buyPrice;
    setWallet((w) => ({ ...w, NGN: Math.max(0, w.NGN - cost) }));
    const updatedProp: PropertyAsset = {
      ...property,
      isRented: mode === 'rent',
      isOwned: mode === 'buy',
    };
    setOwnedProperties((prev) => [...prev.filter((p) => p.id !== property.id), updatedProp]);
    setActiveHome(updatedProp);
    addLog('lifestyle', `Real Estate: ${mode === 'rent' ? 'Rented' : 'Purchased'} ${property.title} in ${property.neighborhood} (-₦${cost.toLocaleString()}).`);
    triggerSound('stamp');
  };

  const handleSelectActiveHome = (home: PropertyAsset) => {
    setActiveHome(home);
    addLog('lifestyle', `Set primary residence to ${home.title}.`);
    showToast(`Home set to ${home.title}!`);
  };

  const handleBuyVehicle = (vehicle: VehicleAsset) => {
    setWallet((w) => ({ ...w, NGN: Math.max(0, w.NGN - vehicle.price) }));
    const updatedVeh: VehicleAsset = { ...vehicle, isOwned: true };
    setOwnedVehicles((prev) => [...prev.filter((v) => v.id !== vehicle.id), updatedVeh]);
    setActiveVehicle(updatedVeh);
    setHappiness((h) => Math.min(100, h + 25));
    addLog('lifestyle', `Auto Dealership: Purchased ${vehicle.name} (-₦${vehicle.price.toLocaleString()}, +25% Joy).`);
    triggerSound('coin');
  };

  const handleSelectActiveVehicle = (vehicle: VehicleAsset) => {
    setActiveVehicle(vehicle);
    addLog('lifestyle', `Switched active ride to ${vehicle.name}.`);
    showToast(`Now driving ${vehicle.name}!`);
  };

  const handleInvest = (assetId: string, amount: number) => {
    setWallet((w) => ({ ...w, NGN: Math.max(0, w.NGN - amount) }));
    setInvestments((prev) =>
      prev.map((inv) =>
        inv.id === assetId ? { ...inv, investedAmount: inv.investedAmount + amount } : inv
      )
    );
    const targetAsset = investments.find((i) => i.id === assetId);
    addLog('finance', `Investment: Placed ₦${amount.toLocaleString()} into ${targetAsset?.title || 'portfolio'}.`);
    triggerSound('coin');
  };

  const handleLiquidateInvestment = (assetId: string) => {
    const inv = investments.find((i) => i.id === assetId);
    if (!inv || inv.investedAmount <= 0) return;
    const totalPayout = inv.investedAmount + inv.earnedReturns;
    setWallet((w) => ({ ...w, NGN: w.NGN + totalPayout }));
    setInvestments((prev) =>
      prev.map((i) => (i.id === assetId ? { ...i, investedAmount: 0, earnedReturns: 0 } : i))
    );
    addLog('finance', `Liquidated ${inv.title}: Credited ₦${totalPayout.toLocaleString()} back to bank wallet.`);
    showToast(`Liquidated ₦${totalPayout.toLocaleString()}!`);
    triggerSound('coin');
  };

  // Online Multiplayer Presence Sync (Every user who logs in plays with everyone else)
  useEffect(() => {
    if (currentUser) {
      registerRealPlayerOnline(currentUser, currentState.id, currentState.name, wallet.NGN, activeVehicle);
    }
  }, [currentUser, currentState.id, currentState.name, wallet.NGN, activeVehicle]);

  const tickCounterRef = useRef(0);

  // STEP 1: Passport & NIN System
  const [passportStatus, setPassportStatus] = useState<
    'NOT_APPLIED' | 'APPLYING' | 'FILE_LOST_DELAY' | 'READY_FOR_COLLECTION' | 'OWNED'
  >('NOT_APPLIED');
  const [passportChecksDone, setPassportChecksDone] = useState(0);
  const [passportApplicationDay, setPassportApplicationDay] = useState(0);
  const [passportBookletNo, setPassportBookletNo] = useState<string>('');

  // Official Embassy Visas
  const [visas, setVisas] = useState<Record<string, VisaDoc>>({
    uk: { countryId: 'uk', status: 'NONE' },
    usa: { countryId: 'usa', status: 'NONE' },
    canada: { countryId: 'canada', status: 'NONE' },
    germany: { countryId: 'germany', status: 'NONE' },
    uae: { countryId: 'uae', status: 'NONE' },
    ghana: { countryId: 'ghana', status: 'NONE' },
  });

  // Skills & Degrees
  const [skills, setSkills] = useState<string[]>([]);

  // Travel History
  const [travelHistory, setTravelHistory] = useState<string[]>([]);

  // Terminal Event Log
  const [terminalLogs, setTerminalLogs] = useState<TerminalEvent[]>([
    {
      id: 'init-1',
      timestamp: 'Day 1 · 08:00',
      category: 'immigration',
      text: `Welcome to Naija Life! You were born in ${birthState.name} State (${birthState.capital}) — "${birthState.slogan}". Current legal status: Nigerian Citizen.`,
    },
    {
      id: 'init-2',
      timestamp: 'Day 1 · 08:01',
      category: 'finance',
      text: 'FirstBank multi-currency wallet initialized with ₦95,000. Live Forex bureau rates connected.',
    },
  ]);

  const terminalRef = useRef<HTMLDivElement>(null);

  // Modals
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [activeInterviewCountry, setActiveInterviewCountry] = useState<CountryData | null>(null);
  const [interviewQuestionIndex, setInterviewQuestionIndex] = useState(0);
  const [interviewScore, setInterviewScore] = useState(0);
  const [interviewOutcome, setInterviewOutcome] = useState<{
    approved: boolean;
    notice: string;
    expiryDay?: number;
  } | null>(null);

  const [showClinicModal, setShowClinicModal] = useState(false);
  const [showNewGameModal, setShowNewGameModal] = useState(false);
  const [showInterstateModal, setShowInterstateModal] = useState(false);

  // Smuggling Outcome Modal
  const [smugglingOutcome, setSmugglingOutcome] = useState<{
    success: boolean;
    route: UnofficialRoute;
    disaster?: { title: string; narrative: string };
  } | null>(null);

  // Deportation Notice Modal
  const [deportationNotice, setDeportationNotice] = useState<{
    countryName: string;
    reason: string;
  } | null>(null);

  // Legalization Decision Modal
  const [legalizationResult, setLegalizationResult] = useState<{
    approved: boolean;
    narrative: string;
  } | null>(null);

  // Sound triggering
  const triggerSound = useCallback(
    (type: 'coin' | 'alert' | 'stamp' | 'plane' | 'eat' | 'siren') => {
      if (soundEnabled) {
        playSynth(type);
      }
    },
    [soundEnabled]
  );

  // Logging to Live Terminal
  const addLog = useCallback(
    (category: TerminalEvent['category'], text: string) => {
      const newEntry: TerminalEvent = {
        id: `${Date.now()}-${Math.random()}`,
        timestamp: `Day ${gameDay} · ${String(gameHour).padStart(2, '0')}:00`,
        category,
        text,
      };
      setTerminalLogs((prev) => [newEntry, ...prev.slice(0, 59)]);
    },
    [gameDay, gameHour]
  );

  // Auto scroll terminal
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = 0;
    }
  }, [terminalLogs]);

  // Total Net Worth in NGN equivalent
  const totalNetWorthNGN = useMemo(() => {
    return (
      wallet.NGN +
      wallet.USD * fxRates.USD +
      wallet.GBP * fxRates.GBP +
      wallet.EUR * fxRates.EUR +
      wallet.CAD * fxRates.CAD
    );
  }, [wallet, fxRates]);

  /* =========================================================================
     9. CORE GAME LOOP: 4-SECOND TICK & DEPORTATION PROBABILITY
     ========================================================================= */
  useEffect(() => {
    if (!currentUser || isPaused) return;

    const interval = setInterval(() => {
      tickCounterRef.current += 1;
      const ticks = tickCounterRef.current;

      // 1. Advance Game Time & Check Scheduled Daily Events
      setGameHour((prevHour) => {
        const nextHour = prevHour >= 23 ? 0 : prevHour + 1;
        if (prevHour >= 23) {
          setGameDay((d) => {
            const nextDay = d + 1;
            // WEEKLY RENT SETTLEMENT: PAID EVERY SATURDAY (Day 6 of 7-day cycle)
            const isSaturday = (nextDay % 7 === 6);
            if (isSaturday && activeHome && activeHome.isRented) {
              // Rents calibrated between least ₦400k to max ₦1.7m paid every Saturday
              const annual = activeHome.annualRent || 1200000;
              let weeklyRent = 400000;
              if (annual >= 40000000) weeklyRent = 1700000;
              else if (annual >= 20000000) weeklyRent = 1450000;
              else if (annual >= 10000000) weeklyRent = 1150000;
              else if (annual >= 5000000) weeklyRent = 850000;
              else if (annual >= 2000000) weeklyRent = 650000;
              else weeklyRent = 400000;

              const subsidyPct = currentUser?.fatherRentSubsidyPct ?? 0;
              const subsidizedCost = Math.round(weeklyRent * (1 - subsidyPct / 100));

              if (subsidizedCost > 0) {
                // STRICT RULE: Saturday rent is the ONLY situation allowed to create a negative bank balance (debt)!
                setWallet((w) => ({ ...w, NGN: w.NGN - subsidizedCost }));
                addLog('lifestyle', `Saturday Weekly Rent: ₦${subsidizedCost.toLocaleString()} debited for ${activeHome.title} (Father subsidized ${subsidyPct}%).`);
                showToast(`🏠 Saturday Rent: ₦${subsidizedCost.toLocaleString()} debited for weekly lease.`);
              } else {
                addLog('lifestyle', `Saturday Weekly Rent: ₦${weeklyRent.toLocaleString()} for ${activeHome.title} was 100% covered by Father!`);
                showToast(`🏠 Saturday Rent: 100% covered by Father!`);
              }
            }

            // WEEKLY SALARY SETTLEMENT: PAID EVERY SUNDAY (Day 0 of 7-day cycle)
            const isSunday = (nextDay % 7 === 0);
            if (isSunday && (currentUser?.jobWeeklySalaryNGN || currentUser?.jobRank)) {
              const rank = String(currentUser?.jobRank || 'Apprentice');
              const multipliers: Record<string, number> = {
                'Apprentice': 1.0,
                'Junior': 1.0,
                'Associate': 1.8,
                'Senior': 3.5,
                'Manager': 6.0,
              };
              const mult = multipliers[rank] || 1.0;
              const baseSalary = currentUser?.jobWeeklySalaryNGN || 28000;
              const weeklySalary = Math.round(baseSalary * mult);
              setWallet((w) => ({ ...w, NGN: w.NGN + weeklySalary }));
              addLog('finance', `🗓️ Sunday Payday: Credited +₦${weeklySalary.toLocaleString()} weekly salary as ${rank}!`);
              showToast(`💼 Sunday Payday: +₦${weeklySalary.toLocaleString()} deposited to your bank!`);
              triggerSound('coin');
            }
            return nextDay;
          });
        }

        // 8:00 PM (20:00): BUSINESS DIVIDENDS PAYOUT
        if (nextHour === 20) {
          if (currentUser?.ownedBusinesses && currentUser.ownedBusinesses.length > 0) {
            const totalProfit = currentUser.ownedBusinesses.reduce((sum, b) => sum + (b.dailyRevenueNGN || 0) * (b.level || 1), 0);
            if (totalProfit > 0) {
              setWallet((w) => ({ ...w, NGN: w.NGN + totalProfit }));
              addLog('finance', `8:00 PM Enterprise Dividends: Credited +₦${totalProfit.toLocaleString()} daily profits from your registered businesses.`);
              showToast(`💰 8:00 PM: Received ₦${totalProfit.toLocaleString()} daily business dividends!`);
              triggerSound('coin');
            }
          }
        }

        // 8:30 PM (20:30 WAT): NAIJABET SPORTS ACCUMULATOR MATCH RESULTS SETTLEMENT (0.1% CHANCE)
        if (nextHour === 21) {
          try {
            const rawSlips = localStorage.getItem('naija_life_bet_slips');
            if (rawSlips) {
              const slips = JSON.parse(rawSlips);
              const pendingSlips = slips.filter((s: any) => s.status === 'PENDING');
              if (pendingSlips.length > 0) {
                let wonPayout = 0;
                const updatedSlips = slips.map((s: any) => {
                  if (s.status !== 'PENDING') return s;
                  // Secret 0.1% winning probability (players do not know this)
                  const won = Math.random() < 0.001;
                  const updatedPicks = (s.picks || []).map((p: any, idx: number) => {
                    if (won) return { ...p, isCorrect: true, result: 'WON' };
                    // If lost, cut 1 or 2 matches
                    const isCutMatch = idx === 0 || Math.random() < 0.35;
                    return { ...p, isCorrect: !isCutMatch, result: isCutMatch ? 'LOST' : 'WON' };
                  });
                  // Ensure at least one match failed if not won
                  if (!won && updatedPicks.length > 0 && updatedPicks.every((p: any) => p.isCorrect)) {
                    updatedPicks[0].isCorrect = false;
                    updatedPicks[0].result = 'LOST';
                  }

                  if (won) {
                    wonPayout += s.potentialWin;
                    return { ...s, status: 'WON', picks: updatedPicks };
                  }
                  return { ...s, status: 'LOST', picks: updatedPicks };
                });
                localStorage.setItem('naija_life_bet_slips', JSON.stringify(updatedSlips));
                if (wonPayout > 0) {
                  setWallet((w) => ({ ...w, NGN: w.NGN + wonPayout }));
                  showToast(`🎉 8:30 PM NaijaBet Alert: BOOM! Your accumulator WON! +₦${wonPayout.toLocaleString()} credited.`);
                  addLog('finance', `8:30 PM NaijaBet Win: Sports match results finalized. Accumulator ticket cashed out for ₦${wonPayout.toLocaleString()}.`);
                  triggerSound('coin');
                } else {
                  showToast(`⚽ 8:30 PM NaijaBet: Today's matches completed. Results posted to History.`);
                  addLog('finance', `8:30 PM NaijaBet: Today's 10 match fixtures concluded.`);
                }
              }
            }
          } catch {}
        }

        // NEPA POWER OUTAGE CHANCE (STATE-BASED)
        // Completely disabled in Canada (there is ALWAYS light in Canada)
        const isCanadaLoc = currentState?.id === 'canada' || locationMode === 'INTERNATIONAL';
        if (!isCanadaLoc && ticks % 30 === 0 && locationMode === 'NIGERIA') {
          const stateId = currentState?.id?.toLowerCase() || 'lagos';
          const blackoutChance = (stateId === 'fct' || stateId === 'fct_abuja' || stateId === 'abuja') ? 0.015 : stateId === 'lagos' ? 0.06 : 0.12;
          if (Math.random() < blackoutChance) {
            const hasSolarOrInverter =
              currentUser?.username?.toLowerCase() === 'chiboy_52' ||
              currentUser?.furnitureBought?.includes('comf_solar_array') ||
              currentUser?.furnitureBought?.includes('comf_pure_inverter') ||
              currentUser?.inventory?.some((item) => item.toLowerCase().includes('solar') || item.toLowerCase().includes('inverter'));

            if (hasSolarOrInverter) {
              setNepaPopup({
                message: '⚡ NEPA has taken light!',
                subMessage: '☀️ Solar to the rescue!',
                hasSolar: true,
              });
              addLog('lifestyle', `NEPA Grid Failure: Solar Array & Inverter engaged. Solar to the rescue! 100% green power.`);
              triggerSound('coin');
            } else {
              setNepaPopup({
                message: '⚡ NEPA has taken light!',
                subMessage: '',
                hasSolar: false,
              });
              addLog('lifestyle', `NEPA Blackout: DISCO cut electricity in ${currentState?.name || 'State'}.`);
              setHappiness((hp) => Math.max(15, hp - 3));
              triggerSound('alert');
            }

            // Message lasts exactly 5.5 seconds then disappears
            setTimeout(() => {
              setNepaPopup(null);
            }, 5500);
          }
        }

        return nextHour;
      });

      // 2. Realistic, Slow Needs Decay (Like Lagos Life, forgiving and gradual)
      // Decay Hunger 1 point every 15 ticks (~60 seconds)
      if (ticks % 15 === 0) {
        setHunger((h) => Math.max(15, h - 1));
      }
      // Decay Energy 1 point every 20 ticks (~80 seconds)
      if (ticks % 20 === 0) {
        setEnergy((e) => Math.max(15, e - 1));
      }
      // Decay Happiness 1 point every 30 ticks (~120 seconds)
      if (ticks % 30 === 0) {
        setHappiness((hp) => Math.max(20, hp - 1));
      }

      // 4. Track days lived abroad as undocumented for Legalization (5 in-game years)
      if (locationMode === 'INTERNATIONAL' && legalStatus === 'UNDOCUMENTED') {
        setUndocumentedDaysAbroad((days) => days + 1);

        // RANDOM IMMIGRATION CHECK WHILE LIVING ABROAD AS UNDOCUMENTED (3% chance per tick)
        if (Math.random() < 0.03) {
          executeDeportation('Street Immigration Checkpoint: Border officers conducted random biometric sweep on transit line.');
          return;
        }
      }

      // 5. Live Multi-Currency Forex Rate Fluctuations
      setFxRates((prev) => {
        const deltaUSD = Math.floor(Math.random() * 11) - 5;
        const deltaGBP = Math.floor(Math.random() * 13) - 6;
        const deltaEUR = Math.floor(Math.random() * 11) - 5;
        const deltaCAD = Math.floor(Math.random() * 9) - 4;

        const nextUSD = Math.max(1480, Math.min(1600, prev.USD + deltaUSD));
        const nextGBP = Math.max(1920, Math.min(2080, prev.GBP + deltaGBP));
        const nextEUR = Math.max(1600, Math.min(1740, prev.EUR + deltaEUR));
        const nextCAD = Math.max(1080, Math.min(1180, prev.CAD + deltaCAD));

        setFxTrends({
          USD: nextUSD > prev.USD ? 'up' : nextUSD < prev.USD ? 'down' : 'stable',
          GBP: nextGBP > prev.GBP ? 'up' : nextGBP < prev.GBP ? 'down' : 'stable',
          EUR: nextEUR > prev.EUR ? 'up' : nextEUR < prev.EUR ? 'down' : 'stable',
          CAD: nextCAD > prev.CAD ? 'up' : nextCAD < prev.CAD ? 'down' : 'stable',
        });

        return { USD: nextUSD, GBP: nextGBP, EUR: nextEUR, CAD: nextCAD };
      });

      // 6. Passive Yield from Owned Nigerian Land Assets
      setOwnedLandAssets((owned) => {
        if (owned.length > 0) {
          let totalDailyYield = 0;
          owned.forEach((assetId) => {
            const asset = NIGERIAN_LAND_ASSETS.find((a) => a.id === assetId);
            if (asset) totalDailyYield += Math.round(asset.passiveYieldPerDayNGN / 6);
          });
          if (totalDailyYield > 0) {
            setWallet((w) => ({ ...w, NGN: w.NGN + totalDailyYield }));
          }
        }
        return owned;
      });

      // 7. Passive Yield from Investments Portfolio
      setInvestments((prev) =>
        prev.map((inv) => {
          if (inv.investedAmount <= 0) return inv;
          const returnTick = Math.max(1, Math.round((inv.investedAmount * (inv.annualYieldPct / 100)) / 180));
          return {
            ...inv,
            earnedReturns: inv.earnedReturns + returnTick,
          };
        })
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [currentUser, isPaused, locationMode, legalStatus, addLog, triggerSound]);

  // Passport 30-day completion check
  useEffect(() => {
    if (passportStatus === 'APPLYING' && gameDay - passportApplicationDay >= 30) {
      setPassportStatus('READY_FOR_COLLECTION');
      addLog('immigration', 'NIS Biometric Alert: 30 days completed! Your Green International Passport is ready for collection.');
      triggerSound('stamp');
    }
  }, [gameDay, passportApplicationDay, passportStatus, addLog, triggerSound]);

  // Visa expiration check
  useEffect(() => {
    setVisas((prevVisas) => {
      let changed = false;
      const updated = { ...prevVisas };
      Object.keys(updated).forEach((cId) => {
        const doc = updated[cId];
        if (doc.status === 'APPROVED' && doc.expiryDay && gameDay > doc.expiryDay) {
          changed = true;
          updated[cId] = {
            countryId: cId,
            status: 'NONE',
            rejectionNotice: `Expired on Day ${doc.expiryDay}. Re-application required.`,
          };
          addLog('immigration', `Notice: Your ${cId.toUpperCase()} Visa has EXPIRED (Validity passed on Day ${doc.expiryDay}). Work authorization revoked.`);
          triggerSound('alert');

          // If player is currently in that country, their legal status drops to UNDOCUMENTED!
          if (locationMode === 'INTERNATIONAL' && internationalCountry?.id === cId && legalStatus === 'LEGAL_RESIDENT') {
            setLegalStatus('UNDOCUMENTED');
            addLog('deportation', `CRITICAL: Your visa expired while in ${internationalCountry.name}! You are now an Undocumented Resident facing deportation risk.`);
          }
        }
      });
      return changed ? updated : prevVisas;
    });
  }, [gameDay, locationMode, internationalCountry, legalStatus, addLog, triggerSound]);

  /* =========================================================================
     10. DEPORTATION ENGINE
     ========================================================================= */

  const executeDeportation = (reason: string) => {
    const fromCountryName = internationalCountry?.name || 'Abroad';
    triggerSound('siren');

    // 1. Reset location to original Nigerian birth state
    setLocationMode('NIGERIA');
    setCurrentState(birthState);
    setInternationalCountry(null);
    setLegalStatus('CITIZEN_NIGERIA');

    // 2. Clear visas & reduce happiness and energy
    setVisas({
      uk: { countryId: 'uk', status: 'NONE' },
      usa: { countryId: 'usa', status: 'NONE' },
      canada: { countryId: 'canada', status: 'NONE' },
      germany: { countryId: 'germany', status: 'NONE' },
      uae: { countryId: 'uae', status: 'NONE' },
      ghana: { countryId: 'ghana', status: 'NONE' },
    });

    setHappiness((h) => Math.max(10, h - 45));
    setEnergy((e) => Math.max(15, e - 40));

    // 3. Confiscate 50% of foreign cash during deportation processing
    setWallet((w) => ({
      ...w,
      USD: Math.floor(w.USD * 0.5),
      GBP: Math.floor(w.GBP * 0.5),
      EUR: Math.floor(w.EUR * 0.5),
      CAD: Math.floor(w.CAD * 0.5),
    }));

    // Record deportation in travel history
    setTravelHistory((prev) => [...prev, `Deported from ${fromCountryName} (Day ${gameDay})`]);

    setDeportationNotice({
      countryName: fromCountryName,
      reason,
    });

    addLog(
      'deportation',
      `DEPORTED TO NIGERIA: ${reason} Escorted to charter flight and expelled back to ${birthState.name} State! 50% foreign funds confiscated.`
    );
  };

  /* =========================================================================
     11. UNOFFICIAL SMUGGLING ENGINE (60% FAILURE RATE)
     ========================================================================= */

  const handleContractSmugglingRoute = (route: UnofficialRoute) => {
    if (wallet.NGN < route.agentFeeNGN) {
      addLog('finance', `Insufficient funds for smuggling agent. Requires ₦${route.agentFeeNGN.toLocaleString()}.`);
      triggerSound('alert');
      return;
    }

    // Deduct agent fee
    setWallet((w) => ({ ...w, NGN: w.NGN - route.agentFeeNGN }));

    // Target destination country
    const targetCountry = DESTINATION_COUNTRIES.find((c) => c.id === route.destinationCountryId);
    if (!targetCountry) return;

    // 60% FAILURE RATE
    const isSuccess = Math.random() >= route.failureRate;

    if (isSuccess) {
      // SUCCESSFUL TRANSIT AS UNDOCUMENTED RESIDENT
      setLocationMode('INTERNATIONAL');
      setInternationalCountry(targetCountry);
      setLegalStatus('UNDOCUMENTED');
      setHappiness((h) => Math.min(100, h + 30));
      setEnergy((e) => Math.max(20, e - 35));

      const tripRecord = `${targetCountry.name} (${targetCountry.city}) - Undocumented`;
      if (!travelHistory.includes(tripRecord)) {
        setTravelHistory((prev) => [...prev, tripRecord]);
      }

      setSmugglingOutcome({
        success: true,
        route,
      });

      addLog(
        'immigration',
        `UNOFFICIAL TRANSIT SUCCESS: Survived the perilous trek along ${route.name}! Arrived in ${targetCountry.city}, ${targetCountry.name} as an Undocumented Resident.`
      );
      triggerSound('plane');
    } else {
      // FAILED TRANSIT (60%): Scam, Health Drop, or Stranded
      const disaster = route.possibleDisasters[Math.floor(Math.random() * route.possibleDisasters.length)];

      setHealth((h) => Math.max(10, h - disaster.healthDrop));
      setEnergy((e) => Math.max(10, e - disaster.energyDrop));
      setHappiness((hp) => Math.max(10, hp - 30));

      setSmugglingOutcome({
        success: false,
        route,
        disaster,
      });

      addLog(
        'immigration',
        `SMUGGLING FAILURE: ${disaster.title} — ${disaster.narrative} Lost ₦${route.agentFeeNGN.toLocaleString()} agent fee (-${disaster.healthDrop}% Health).`
      );
      triggerSound('alert');
    }
  };

  /* =========================================================================
     12. LEGALIZATION / ASYLUM REGULARIZATION SYSTEM (5 IN-GAME YEARS)
     ========================================================================= */

  const yearsSurvivedAbroad = useMemo(() => {
    // 1 in-game year = 30 in-game days
    return Math.floor(undocumentedDaysAbroad / 30);
  }, [undocumentedDaysAbroad]);

  const canApplyLegalization = undocumentedDaysAbroad >= 150 || (undocumentedDaysAbroad >= 20 && health < 40);

  const handleApplyLegalization = () => {
    if (!internationalCountry || legalStatus !== 'UNDOCUMENTED') return;

    const legalFeeUSD = 2500;
    const legalFeeNGN = legalFeeUSD * fxRates.USD;

    if (wallet.USD < legalFeeUSD && wallet.NGN < legalFeeNGN) {
      addLog('finance', `Humanitarian Legal Retainer fee is $${legalFeeUSD} (~₦${Math.round(legalFeeNGN).toLocaleString()}). Insufficient funds.`);
      triggerSound('alert');
      return;
    }

    // Deduct lawyer retainer
    if (wallet.USD >= legalFeeUSD) {
      setWallet((w) => ({ ...w, USD: w.USD - legalFeeUSD }));
    } else {
      setWallet((w) => ({ ...w, NGN: w.NGN - legalFeeNGN }));
    }

    // Evaluate asylum / regularization petition
    // 75% approval if survived 5 full years (150 days); 50% if under humanitarian hardship
    const successProb = undocumentedDaysAbroad >= 150 ? 0.85 : 0.60;
    const isApproved = Math.random() <= successProb;

    if (isApproved) {
      setLegalStatus('LEGALIZED_PERMANENT_RESIDENT');
      setHappiness((h) => Math.min(100, h + 45));

      setLegalizationResult({
        approved: true,
        narrative: `LEGALIZATION GRANTED! The Immigration Tribunal ruled in your favor. You have been granted Indefinite Leave to Remain / Permanent Residence in ${internationalCountry.name}. Deportation risk eliminated forever!`,
      });

      addLog(
        'immigration',
        `LEGAL STATUS CONFERRED: Regularization petition granted in ${internationalCountry.name}! Converted to Permanent Resident with full legal working rights.`
      );
      triggerSound('stamp');
    } else {
      setHappiness((h) => Math.max(10, h - 25));

      setLegalizationResult({
        approved: false,
        narrative: `PETITION ADJOURNED: The tribunal cited insufficient proof of continuous community integration. Retainer fee spent, but case remains open for future re-filing.`,
      });

      addLog('immigration', `Legalization Appeal Adjourned: Tribunal requested additional documentary evidence.`);
      triggerSound('alert');
    }
  };

  /* =========================================================================
     13. WORK HUSTLES: FORMAL & CASH-IN-HAND
     ========================================================================= */

  // Work Cash-in-Hand Job (Under-the-Table)
  const handleWorkCashJob = (job: CashInHandJob) => {
    if (!internationalCountry) return;

    if (energy < job.energyCost) {
      addLog('career', 'Too fatigued for this shift. Rest first!');
      triggerSound('alert');
      return;
    }

    // IMMIGRATION RAID RISK CHECK
    if (Math.random() < job.raidRisk) {
      executeDeportation(`Workplace Raid: Immigration enforcement raided the premises during your shift at ${job.title}!`);
      return;
    }

    const shiftPay = job.hourlyWage * 8;
    setEnergy((e) => Math.max(0, e - job.energyCost));
    setHunger((h) => Math.max(0, h - job.hungerCost));
    setWallet((w) => ({ ...w, [job.currency]: w[job.currency] + shiftPay }));
    addLog(
      'career',
      `Cash Shift Done: Completed 8 hours as ${job.title} in ${internationalCountry.city}. Received cash in envelope: +${job.currencySymbol}${shiftPay} ${job.currency}.`
    );
    triggerSound('coin');
  };

  // Work Formal Foreign Job
  const handleWorkFormalJob = (job: ForeignJob) => {
    if (!internationalCountry) return;

    // Formal jobs CANNOT be accessed by undocumented residents!
    if (legalStatus === 'UNDOCUMENTED') {
      addLog('career', `ACCESS DENIED: Formal career (${job.title}) strictly requires legal work authorization or permanent residency! Undocumented residents cannot pass HR biometric background checks.`);
      triggerSound('alert');
      return;
    }

    if (job.reqSkill && !skills.includes(job.reqSkill)) {
      addLog('career', `Missing qualification: Requires ${job.reqSkill.replace('_', ' ')}.`);
      triggerSound('alert');
      return;
    }

    if (energy < job.energyCost) {
      addLog('career', 'Too exhausted for this shift. Rest first!');
      triggerSound('alert');
      return;
    }

    const shiftPay = job.hourlyWage * 8;
    setEnergy((e) => Math.max(0, e - job.energyCost));
    setHunger((h) => Math.max(0, h - job.hungerCost));
    setWallet((w) => ({ ...w, [job.currency]: w[job.currency] + shiftPay }));
    addLog(
      'career',
      `Formal Shift Completed: Worked as ${job.title} in ${internationalCountry.city}! Paid directly into foreign account: +${job.currencySymbol}${shiftPay} ${job.currency}.`
    );
    triggerSound('coin');
  };

  // Local Nigerian Career
  const handleWorkLocalJob = (job: LocalHustleJob) => {
    if (energy < job.energyCost) {
      addLog('career', `Insufficient energy for ${job.title}. Need ${job.energyCost}% energy.`);
      triggerSound('alert');
      return;
    }
    if (job.reqSkill && !skills.includes(job.reqSkill)) {
      addLog('career', `Missing Qualification: Requires completed ${job.reqSkill.replace('_', ' ')}.`);
      triggerSound('alert');
      return;
    }
    if (job.reqDegree && !skills.includes('degree')) {
      addLog('career', 'Missing Prerequisite: State Civil Service requires University Degree & NYSC.');
      triggerSound('alert');
      return;
    }

    const earned = Math.floor(Math.random() * (job.earnMax - job.earnMin + 1) + job.earnMin);
    setEnergy((e) => Math.max(0, e - job.energyCost));
    setHunger((h) => Math.max(0, h - job.hungerCost));
    setWallet((w) => ({ ...w, NGN: w.NGN + earned }));
    addLog('career', `Shift Completed: Worked as ${job.title}. Credited ₦${earned.toLocaleString()} to bank account.`);
    triggerSound('coin');
  };

  // State Specialty Trade
  const handleStateSpecialtyTrade = () => {
    const trade = currentState.jobMarket;
    if (energy < trade.energy) {
      addLog('career', `Too exhausted for ${trade.specialtyJob}. Rest first!`);
      triggerSound('alert');
      return;
    }
    const earned = Math.floor(Math.random() * (trade.earnMax - trade.earnMin + 1) + trade.earnMin);
    setEnergy((e) => Math.max(0, e - trade.energy));
    setHunger((h) => Math.max(0, h - 10));
    setWallet((w) => ({ ...w, NGN: w.NGN + earned }));
    addLog('career', `State Trade Done: Executed ${trade.specialtyJob} in ${currentState.name}! Earned ₦${earned.toLocaleString()}.`);
    triggerSound('coin');
  };

  // Skill Course
  const handleEnrollCourse = (course: SkillTrainingCourse) => {
    if (skills.includes(course.id)) return;
    if (wallet.NGN < course.cost) {
      addLog('finance', `Insufficient funds for ${course.title}. Requires ₦${course.cost.toLocaleString()}.`);
      triggerSound('alert');
      return;
    }
    if (energy < course.energyReq) {
      addLog('career', `Need at least ${course.energyReq}% energy to study.`);
      triggerSound('alert');
      return;
    }

    setWallet((w) => ({ ...w, NGN: w.NGN - course.cost }));
    setEnergy((e) => Math.max(0, e - course.energyReq));
    setSkills((prev) => [...prev, course.id]);
    addLog('career', `Certification Achieved: Enrolled and completed ${course.title}! ${course.benefit}.`);
    triggerSound('stamp');
  };

  /* =========================================================================
     14. FOREX & REMITTANCES
     ========================================================================= */

  const [fxFromCurrency, setFxFromCurrency] = useState<CurrencyCode>('NGN');
  const [fxToCurrency, setFxToCurrency] = useState<CurrencyCode>('USD');
  const [fxAmountInput, setFxAmountInput] = useState<string>('153000');

  const calculateConversion = (amount: number, from: CurrencyCode, to: CurrencyCode): number => {
    if (from === to) return amount;
    let amountInNGN = 0;
    if (from === 'NGN') amountInNGN = amount;
    else amountInNGN = amount * fxRates[from as keyof ForexRates];

    if (to === 'NGN') return Math.floor(amountInNGN);
    return Math.floor((amountInNGN / fxRates[to as keyof ForexRates]) * 100) / 100;
  };

  const handleExecuteForexExchange = () => {
    const amt = parseFloat(fxAmountInput);
    if (isNaN(amt) || amt <= 0) return;

    if (wallet[fxFromCurrency] < amt) {
      addLog('finance', `Insufficient ${fxFromCurrency} balance to complete exchange.`);
      triggerSound('alert');
      return;
    }

    const converted = calculateConversion(amt, fxFromCurrency, fxToCurrency);
    if (converted <= 0) return;

    setWallet((w) => ({
      ...w,
      [fxFromCurrency]: w[fxFromCurrency] - amt,
      [fxToCurrency]: w[fxToCurrency] + converted,
    }));

    addLog('finance', `Forex Bureau: Exchanged ${fxFromCurrency} ${amt.toLocaleString()} for ${fxToCurrency} ${converted.toLocaleString()} at live rate.`);
    triggerSound('coin');
  };

  const handleSendFamilyRemittance = (foreignCurr: CurrencyCode, amount: number) => {
    if (wallet[foreignCurr] < amount) {
      addLog('finance', `Insufficient ${foreignCurr} balance to send remittance.`);
      triggerSound('alert');
      return;
    }

    const rate = foreignCurr === 'NGN' ? 1 : fxRates[foreignCurr as keyof ForexRates];
    const nairaReceived = Math.round(amount * rate);

    setWallet((w) => ({
      ...w,
      [foreignCurr]: w[foreignCurr] - amount,
    }));

    setFamilyHappiness((fh) => Math.min(100, fh + 20));
    setHappiness((h) => Math.min(100, h + 18));

    addLog(
      'remittance',
      `Remittance Sent Home: Sent ${foreignCurr} ${amount} (~₦${nairaReceived.toLocaleString()}) to family in Nigeria! Family prayed for your prosperity (+20% Family Karma, +18% Joy).`
    );
    triggerSound('coin');
  };

  const handleBuyLandAsset = (asset: NigerianLandAsset) => {
    if (ownedLandAssets.includes(asset.id)) return;
    if (wallet.NGN < asset.costNGN) {
      addLog('finance', `Insufficient Naira balance for ${asset.title}. Requires ₦${asset.costNGN.toLocaleString()}. Exchange foreign currency at Forex Bureau first!`);
      triggerSound('alert');
      return;
    }

    setWallet((w) => ({ ...w, NGN: w.NGN - asset.costNGN }));
    setOwnedLandAssets((prev) => [...prev, asset.id]);
    setHappiness((h) => Math.min(100, h + 25));

    addLog(
      'remittance',
      `Land Acquired: Purchased ${asset.title} for ₦${asset.costNGN.toLocaleString()}! Generates passive lease returns (+₦${asset.passiveYieldPerDayNGN.toLocaleString()}/day).`
    );
    triggerSound('stamp');
  };

  /* =========================================================================
     15. PASSPORT & EMBASSY INTERVIEWS
     ========================================================================= */

  const handleApplyPassport = () => {
    const fee = 60000;
    if (wallet.NGN < fee) {
      addLog('immigration', `Insufficient funds for NIS Passport Capture. You need ₦${fee.toLocaleString()}.`);
      triggerSound('alert');
      return;
    }
    setWallet((w) => ({ ...w, NGN: w.NGN - fee }));
    setPassportStatus('APPLYING');
    setPassportChecksDone(0);
    setPassportApplicationDay(gameDay);
    addLog('immigration', 'NIS Passport Office: NIN verified & Biometric capture completed (-₦60,000). Requires 5 manual status checks or 30 in-game days.');
    triggerSound('stamp');
  };

  const handleCheckPassportStatus = () => {
    if (passportStatus !== 'APPLYING') return;
    if (energy < 5) {
      addLog('immigration', 'Need at least 5% energy to queue at the immigration portal.');
      triggerSound('alert');
      return;
    }
    setEnergy((e) => Math.max(0, e - 5));

    if (Math.random() < 0.15) {
      setPassportStatus('FILE_LOST_DELAY');
      addLog('immigration', 'SYSTEM DELAY: NIS Alausa server downtime and physical file lost! Officer requested ₦10,000 file tracing fee.');
      triggerSound('alert');
      return;
    }

    const nextChecks = passportChecksDone + 1;
    setPassportChecksDone(nextChecks);
    if (nextChecks >= 5) {
      setPassportStatus('READY_FOR_COLLECTION');
      addLog('immigration', 'STATUS CHECK (5/5): Biometrics approved! Green 32-Page ECOWAS Passport is READY FOR COLLECTION.');
      triggerSound('stamp');
    } else {
      addLog('immigration', `STATUS CHECK (${nextChecks}/5): Dossier verified at NIS headquarters (${5 - nextChecks} checks remaining).`);
    }
  };

  const handlePayFileTracingFee = () => {
    if (wallet.NGN < 10000) {
      addLog('finance', 'Need ₦10,000 to settle the officer file tracing fee.');
      triggerSound('alert');
      return;
    }
    setWallet((w) => ({ ...w, NGN: w.NGN - 10000 }));
    setPassportStatus('APPLYING');
    addLog('immigration', 'FILE RECOVERED: Paid ₦10,000 mobilization fee. Resumed status checking.');
    triggerSound('stamp');
  };

  const handleCollectPassport = () => {
    const randomBooklet = `A0${Math.floor(Math.random() * 899999 + 100000)}`;
    setPassportBookletNo(randomBooklet);
    setPassportStatus('OWNED');
    addLog('immigration', `PASSPORT ISSUED: Official 32-Page ECOWAS Green Passport collected! Booklet No: ${randomBooklet}.`);
    triggerSound('stamp');
  };

  const handleStartEmbassyApplication = (country: CountryData) => {
    if (passportStatus !== 'OWNED') {
      addLog('immigration', 'Embassy Refusal: You cannot apply for a foreign visa without an official, issued Nigerian Passport!');
      triggerSound('alert');
      return;
    }

    const feeInNGN = country.visaFeeUSD * fxRates.USD;
    if (wallet.USD < country.visaFeeUSD && wallet.NGN < feeInNGN) {
      addLog('finance', `Insufficient funds for non-refundable visa application fee ($${country.visaFeeUSD} or ~₦${Math.round(feeInNGN).toLocaleString()}).`);
      triggerSound('alert');
      return;
    }

    if (wallet.USD >= country.visaFeeUSD) {
      setWallet((w) => ({ ...w, USD: w.USD - country.visaFeeUSD }));
    } else {
      setWallet((w) => ({ ...w, NGN: w.NGN - feeInNGN }));
    }

    setActiveInterviewCountry(country);
    setInterviewQuestionIndex(0);
    setInterviewScore(0);
    setInterviewOutcome(null);
    setShowInterviewModal(true);

    addLog('immigration', `NON-REFUNDABLE FEE PAID: Paid $${country.visaFeeUSD} for ${country.name} (${country.visaName}). Consular interview commenced.`);
    triggerSound('stamp');
  };

  const handleAnswerInterviewChoice = (score: number) => {
    const newScore = interviewScore + score;
    setInterviewScore(newScore);

    if (!activeInterviewCountry) return;

    if (interviewQuestionIndex < activeInterviewCountry.interviewQuestions.length - 1) {
      setInterviewQuestionIndex((prev) => prev + 1);
    } else {
      const fundsRatio = totalNetWorthNGN / activeInterviewCountry.proofOfFundsNGN;
      let proofScore = 0;
      if (fundsRatio >= 2.0) proofScore = 40;
      else if (fundsRatio >= 1.0) proofScore = 25;
      else if (fundsRatio >= 0.7) proofScore = -25;
      else proofScore = -70;

      const travelBonus = Math.min(20, travelHistory.length * 10);
      const eduBonus = skills.includes('degree') ? 15 : 0;
      const ieltsBonus = skills.includes('ielts_exam') ? 15 : 0;
      const luckRoll = Math.floor(Math.random() * 31) - 15;

      const totalScore = newScore + proofScore + travelBonus + eduBonus + ieltsBonus + luckRoll;
      const isApproved = fundsRatio >= 1.0 && totalScore >= 50;

      if (isApproved) {
        const expiry = gameDay + 180;
        setVisas((prev) => ({
          ...prev,
          [activeInterviewCountry.id]: {
            countryId: activeInterviewCountry.id,
            status: 'APPROVED',
            expiryDay: expiry,
          },
        }));

        setInterviewOutcome({
          approved: true,
          notice: `Congratulations! Consular Officer granted your ${activeInterviewCountry.visaName}. Visa Foil stamped into passport! Valid until Day ${expiry}.`,
          expiryDay: expiry,
        });

        addLog('immigration', `VISA APPROVED: ${activeInterviewCountry.name} granted entry & work clearance! Valid until Day ${expiry}.`);
        triggerSound('stamp');
      } else {
        let refusalReason = '';
        if (fundsRatio < 1.0) {
          refusalReason = `Insufficient Proof of Funds: Declared balance (₦${Math.round(totalNetWorthNGN).toLocaleString()}) is below statutory minimum (₦${activeInterviewCountry.proofOfFundsNGN.toLocaleString()}).`;
        } else {
          const reasons = activeInterviewCountry.rejectionReasons;
          refusalReason = reasons[Math.floor(Math.random() * reasons.length)];
        }

        setVisas((prev) => ({
          ...prev,
          [activeInterviewCountry.id]: {
            countryId: activeInterviewCountry.id,
            status: 'REJECTED',
            rejectionNotice: refusalReason,
          },
        }));

        setInterviewOutcome({
          approved: false,
          notice: `VISA APPLICATION REFUSED: ${refusalReason} The non-refundable fee of $${activeInterviewCountry.visaFeeUSD} is forfeited. You must save up to re-apply.`,
        });

        addLog('immigration', `VISA REFUSED (${activeInterviewCountry.name}): ${refusalReason} Application fee forfeited.`);
        triggerSound('alert');
      }
    }
  };

  /* =========================================================================
     16. FLIGHT BOOKING & OFFICIAL RELOCATION
     ========================================================================= */

  const handleBookFlightRelocate = (country: CountryData) => {
    if (passportStatus !== 'OWNED') {
      addLog('travel', 'Airport Desk: Boarding denied. No valid Nigerian Passport presented.');
      triggerSound('alert');
      return;
    }

    const visa = visas[country.id];
    if (!visa || visa.status !== 'APPROVED' || (visa.expiryDay && gameDay > visa.expiryDay)) {
      addLog('travel', `Airport Desk: Boarding denied. No valid/unexpired visa for ${country.name}.`);
      triggerSound('alert');
      return;
    }

    const ticketCostNGN = country.flightTicketUSD * fxRates.USD;
    if (wallet.USD < country.flightTicketUSD && wallet.NGN < ticketCostNGN) {
      addLog('finance', `Cannot afford flight ticket to ${country.name} ($${country.flightTicketUSD} or ~₦${Math.round(ticketCostNGN).toLocaleString()}).`);
      triggerSound('alert');
      return;
    }

    if (wallet.USD >= country.flightTicketUSD) {
      setWallet((w) => ({ ...w, USD: w.USD - country.flightTicketUSD }));
    } else {
      setWallet((w) => ({ ...w, NGN: w.NGN - ticketCostNGN }));
    }

    setLocationMode('INTERNATIONAL');
    setInternationalCountry(country);
    setLegalStatus('LEGAL_RESIDENT');
    setHappiness((h) => Math.min(100, h + 35));

    const tripEntry = `${country.name} (${country.city}) - Lawful Visa`;
    if (!travelHistory.includes(tripEntry)) {
      setTravelHistory((prev) => [...prev, tripEntry]);
    }

    addLog('travel', `OFFICIAL FLIGHT DEPARTED: Arrived in ${country.city}, ${country.name}! Lawful resident status activated (+35% joy).`);
    triggerSound('plane');
  };

  const handleReturnFlightToNigeria = () => {
    const returnCostUSD = 600;
    const returnCostNGN = returnCostUSD * fxRates.USD;

    if (wallet.USD < returnCostUSD && wallet.NGN < returnCostNGN) {
      addLog('finance', `Return flight to Lagos costs $${returnCostUSD}. Insufficient funds.`);
      triggerSound('alert');
      return;
    }

    if (wallet.USD >= returnCostUSD) {
      setWallet((w) => ({ ...w, USD: w.USD - returnCostUSD }));
    } else {
      setWallet((w) => ({ ...w, NGN: w.NGN - returnCostNGN }));
    }

    setLocationMode('NIGERIA');
    setInternationalCountry(null);
    setLegalStatus('CITIZEN_NIGERIA');
    setHappiness((h) => Math.min(100, h + 10));

    addLog('travel', 'Landed back at Murtala Muhammed International Airport Lagos (LOS). Welcome back home to Nigeria!');
    triggerSound('plane');
  };

  const handleInterstateTravel = (targetState: NigeriaStateData) => {
    const trip = calculateInterstateTrip(currentState.id, targetState.id, currentState.name, targetState.name);
    const fare = trip.fareNGN;
    if (wallet.NGN < fare) {
      addLog(
        'finance',
        `Interstate coach (${trip.busOperator}) to ${targetState.name} costs ₦${fare.toLocaleString()} (${trip.distanceKm} km, ~${trip.travelTimeFormatted}). Insufficient balance.`
      );
      triggerSound('alert');
      showToast(`Insufficient balance for ticket to ${targetState.name} (₦${fare.toLocaleString()}).`);
      return;
    }
    setWallet((w) => ({ ...w, NGN: w.NGN - fare }));
    setEnergy((e) => Math.max(10, e - 10));
    setCurrentState(targetState);
    setShowInterstateModal(false);
    addLog(
      'travel',
      `Interstate Coach (${trip.busOperator}): Traveled from ${currentState.name} to ${targetState.name} (${trip.distanceKm} km, ~${trip.travelTimeFormatted}) — "${targetState.slogan}". (-₦${fare.toLocaleString()}).`
    );
    triggerSound('stamp');
    showToast(`Arrived in ${targetState.name} State!`);
  };

  /* =========================================================================
     MAP & TRAVEL 2D VISUALIZER HANDLERS
     ========================================================================= */

  const handleMapTravelBus = (targetState: NigeriaStateData, fare: number) => {
    if (wallet.NGN < fare) {
      addLog('finance', `Cannot afford bus to ${targetState.name} (₦${fare.toLocaleString()}).`);
      triggerSound('alert');
      showToast('Insufficient Naira balance for bus fare.');
      return;
    }
    if (energy < 20) {
      addLog('career', 'Too physically exhausted for a long interstate bus trip. Rest first!');
      triggerSound('alert');
      showToast('Too exhausted for 6-hour bus trip.');
      return;
    }

    setWallet((w) => ({ ...w, NGN: w.NGN - fare }));
    setEnergy((e) => Math.max(10, e - 20));
    setHunger((h) => Math.max(10, h - 25));
    setHappiness((hp) => Math.min(100, hp + 5));
    setGameHour((hr) => {
      const next = hr + 6;
      if (next >= 24) {
        setGameDay((d) => d + 1);
        return next - 24;
      }
      return next;
    });

    setCurrentState(targetState);
    const tripEntry = `Interstate Bus: ${currentState.name} → ${targetState.name}`;
    setTravelHistory((prev) => [...prev, tripEntry]);
    addLog(
      'travel',
      `Interstate Commercial Bus: Boarded Peace Mass / GIGM coach from ${currentState.name} to ${targetState.name} (-₦${fare.toLocaleString()}, +6 hrs). Reached ${targetState.capital}!`
    );
    showToast(`Arrived in ${targetState.name} State (${targetState.capital})!`);
    triggerSound('stamp');
  };

  const handleMapTravelFlight = (targetState: NigeriaStateData, fare: number) => {
    if (wallet.NGN < fare) {
      addLog('finance', `Cannot afford domestic flight to ${targetState.name} (₦${fare.toLocaleString()}).`);
      triggerSound('alert');
      showToast('Insufficient Naira for domestic flight ticket.');
      return;
    }
    if (energy < 5) {
      addLog('career', 'Too fatigued for airport check-in.');
      triggerSound('alert');
      return;
    }

    setWallet((w) => ({ ...w, NGN: w.NGN - fare }));
    setEnergy((e) => Math.max(10, e - 5));
    setHunger((h) => Math.max(10, h - 5));
    setHappiness((hp) => Math.min(100, hp + 15));
    setGameHour((hr) => {
      const next = hr + 1;
      if (next >= 24) {
        setGameDay((d) => d + 1);
        return 0;
      }
      return next;
    });

    setCurrentState(targetState);
    const tripEntry = `Domestic Flight: ${currentState.name} → ${targetState.name}`;
    setTravelHistory((prev) => [...prev, tripEntry]);
    addLog(
      'travel',
      `Domestic Flight (Air Peace / Ibom Air): Express flight from ${currentState.name} to ${targetState.capital}, ${targetState.name} (-₦${fare.toLocaleString()}, +15 joy). Welcome!`
    );
    showToast(`Landed in ${targetState.capital}, ${targetState.name} via Domestic Flight!`);
    triggerSound('plane');
  };

  /* =========================================================================
     LOCAL STORAGE SAVE / LOAD / AUTO-SAVE ENGINE
     ========================================================================= */

  const buildCurrentSaveState = useCallback((): SavedGameState => {
    return {
      version: 1,
      savedAt: new Date().toISOString(),
      savedAtFormatted: new Date().toLocaleString(),
      playerName,
      birthStateId: birthState.id,
      currentStateId: currentState.id,
      locationMode,
      internationalCountryId: internationalCountry?.id || null,
      legalStatus,
      undocumentedDaysAbroad,
      gameDay,
      gameHour,
      energy,
      hunger,
      health,
      happiness,
      familyHappiness,
      wallet,
      fxRates,
      fxTrends,
      ownedLandAssets,
      passportStatus,
      passportChecksDone,
      passportApplicationDay,
      passportBookletNo,
      visas,
      skills,
      travelHistory,
      terminalLogs,
    };
  }, [
    playerName,
    birthState,
    currentState,
    locationMode,
    internationalCountry,
    legalStatus,
    undocumentedDaysAbroad,
    gameDay,
    gameHour,
    energy,
    hunger,
    health,
    happiness,
    familyHappiness,
    wallet,
    fxRates,
    fxTrends,
    ownedLandAssets,
    passportStatus,
    passportChecksDone,
    passportApplicationDay,
    passportBookletNo,
    visas,
    skills,
    travelHistory,
    terminalLogs,
  ]);

  const handleManualSave = () => {
    const saveObj = buildCurrentSaveState();
    const ok = saveGameState(saveObj);
    if (ok) {
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastAutoSaveTime(timeStr);
      showToast('Game saved successfully to browser storage!');
      addLog('save', `Manual Save: Character "${playerName}" saved at Day ${gameDay} (${String(gameHour).padStart(2, '0')}:00).`);
      triggerSound('stamp');
    } else {
      showToast('Failed to save to local storage.');
    }
  };

  const handleAutoSave = useCallback(() => {
    if (isPaused) return;
    const saveObj = buildCurrentSaveState();
    const ok = saveGameState(saveObj);
    if (ok) {
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastAutoSaveTime(timeStr);
    }
  }, [isPaused, buildCurrentSaveState]);

  // 30-Second Auto-Save Interval Engine
  useEffect(() => {
    if (!currentUser) return;
    const timer = setInterval(() => {
      handleAutoSave();
    }, 30000);
    return () => clearInterval(timer);
  }, [currentUser, handleAutoSave]);

  const handleExportSave = () => {
    const saveObj = buildCurrentSaveState();
    exportSaveFile(saveObj);
    showToast(`Save exported as JSON for ${playerName}!`);
    addLog('save', `Exported save file backup (${playerName}_day${gameDay}.json).`);
  };

  const restoreSavedState = (saved: SavedGameState) => {
    const bState = ALL_36_NIGERIAN_STATES.find((s) => s.id === saved.birthStateId) || ALL_36_NIGERIAN_STATES[0];
    const cState = ALL_36_NIGERIAN_STATES.find((s) => s.id === saved.currentStateId) || bState;
    const intlCountry = saved.internationalCountryId
      ? DESTINATION_COUNTRIES.find((c) => c.id === saved.internationalCountryId) || null
      : null;

    setPlayerName(saved.playerName || 'Emeka Adeleke');
    setBirthState(bState);
    setCurrentState(cState);
    setLocationMode(saved.locationMode || 'NIGERIA');
    setInternationalCountry(intlCountry);
    setLegalStatus(saved.legalStatus || 'CITIZEN_NIGERIA');
    setUndocumentedDaysAbroad(saved.undocumentedDaysAbroad || 0);
    setGameDay(saved.gameDay || 1);
    setGameHour(saved.gameHour || 8);
    setEnergy(saved.energy ?? 85);
    setHunger(saved.hunger ?? 80);
    setHealth(saved.health ?? 95);
    setHappiness(saved.happiness ?? 75);
    setFamilyHappiness(saved.familyHappiness ?? 65);
    setWallet(saved.wallet || { NGN: 95000, USD: 0, GBP: 0, EUR: 0, CAD: 0 });
    setFxRates(saved.fxRates || { USD: 1530, GBP: 1980, EUR: 1660, CAD: 1120 });
    setFxTrends(saved.fxTrends || { USD: 'stable', GBP: 'stable', EUR: 'stable', CAD: 'stable' });
    setOwnedLandAssets(saved.ownedLandAssets || []);
    setPassportStatus(saved.passportStatus || 'NOT_APPLIED');
    setPassportChecksDone(saved.passportChecksDone || 0);
    setPassportApplicationDay(saved.passportApplicationDay || 0);
    setPassportBookletNo(saved.passportBookletNo || '');
    setVisas(saved.visas || {
      uk: { countryId: 'uk', status: 'NONE' },
      usa: { countryId: 'usa', status: 'NONE' },
      canada: { countryId: 'canada', status: 'NONE' },
      germany: { countryId: 'germany', status: 'NONE' },
      uae: { countryId: 'uae', status: 'NONE' },
      ghana: { countryId: 'ghana', status: 'NONE' },
    });
    setSkills(saved.skills || []);
    setTravelHistory(saved.travelHistory || []);
    if (saved.terminalLogs && saved.terminalLogs.length > 0) {
      setTerminalLogs(saved.terminalLogs);
    }
  };

  const handleImportSave = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const imported = await importSaveFile(file);
      restoreSavedState(imported);
      saveGameState(imported);
      setShowStorageModal(false);
      showToast(`Successfully imported save for ${imported.playerName}!`);
      addLog('save', `Imported save file from external JSON. Progress restored to Day ${imported.gameDay}.`);
      triggerSound('stamp');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid JSON file';
      showToast(`Import failed: ${message}`);
      triggerSound('alert');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleContinueSavedGame = () => {
    if (savedGamePreview) {
      restoreSavedState(savedGamePreview);
      addLog('save', `Welcome back, ${savedGamePreview.playerName}! Resumed saved journey at Day ${savedGamePreview.gameDay}.`);
      showToast(`Welcome back, ${savedGamePreview.playerName}!`);
      triggerSound('stamp');
    }
    setShowWelcomeBackModal(false);
  };

  const handleStartFreshFromWelcome = () => {
    clearSavedGame();
    setShowWelcomeBackModal(false);
    handleNewGame();
    showToast('Started brand new life! Previous save erased.');
  };

  const handleNewGame = () => {
    // Wipe previous save from storage when starting fresh
    clearSavedGame();

    const randomPick = ALL_36_NIGERIAN_STATES[Math.floor(Math.random() * ALL_36_NIGERIAN_STATES.length)];
    setBirthState(randomPick);
    setCurrentState(randomPick);
    setLocationMode('NIGERIA');
    setInternationalCountry(null);
    setLegalStatus('CITIZEN_NIGERIA');
    setUndocumentedDaysAbroad(0);

    setGameDay(1);
    setGameHour(8);
    setEnergy(85);
    setHunger(80);
    setHealth(95);
    setHappiness(75);
    setFamilyHappiness(65);

    setWallet({ NGN: 95000, USD: 0, GBP: 0, EUR: 0, CAD: 0 });
    setFxRates({ USD: 1530, GBP: 1980, EUR: 1660, CAD: 1120 });

    setPassportStatus('NOT_APPLIED');
    setPassportChecksDone(0);
    setPassportApplicationDay(0);
    setPassportBookletNo('');

    setVisas({
      uk: { countryId: 'uk', status: 'NONE' },
      usa: { countryId: 'usa', status: 'NONE' },
      canada: { countryId: 'canada', status: 'NONE' },
      germany: { countryId: 'germany', status: 'NONE' },
      uae: { countryId: 'uae', status: 'NONE' },
      ghana: { countryId: 'ghana', status: 'NONE' },
    });

    setSkills([]);
    setOwnedLandAssets([]);
    setOwnedProperties([]);
    setActiveHome(null);
    setOwnedVehicles([]);
    setActiveVehicle(null);
    setInvestments(AVAILABLE_INVESTMENTS);
    setShowNewGameModal(false);
    setShowClinicModal(false);
    setShowStorageModal(false);
    setDeportationNotice(null);
    setSmugglingOutcome(null);
    setLegalizationResult(null);

    setTerminalLogs([
      {
        id: `ng-${Date.now()}`,
        timestamp: 'Day 1 · 08:00',
        category: 'immigration',
        text: `New Life Initialized! Born in ${randomPick.name} State (${randomPick.capital}) — "${randomPick.slogan}". Starting balance ₦95,000.`,
      },
    ]);

    triggerSound('stamp');
  };

  const persistLatestUserState = useCallback(() => {
    if (!currentUser) return;
    try {
      const users = getStoredUsers();
      const cleanUsername = currentUser.username.toLowerCase().trim();
      const existingRec = users[cleanUsername];
      const isOwner = cleanUsername === 'chiboy_52';
      const SEXTILLION_999 = 9.99e23;
      const updatedProfile: UserProfile = {
        ...currentUser,
        cashNaira: isOwner ? SEXTILLION_999 : Math.round(wallet.NGN * 0.15),
        bankNaira: isOwner ? SEXTILLION_999 : Math.max(0, wallet.NGN - Math.round(wallet.NGN * 0.15)),
        bankCAD: isOwner ? SEXTILLION_999 : (currentUser.bankCAD || 0),
        savingsCAD: isOwner ? SEXTILLION_999 : (currentUser.savingsCAD || 0),
        cashUSD: isOwner ? 1000000000 : wallet.USD,
        cashGBP: isOwner ? 1000000000 : wallet.GBP,
        cashEUR: isOwner ? 1000000000 : wallet.EUR,
        energy,
        hunger,
        health,
        happiness,
        spawnStateId: currentUser.spawnStateId || 'lagos',
        lastLocationStateId: currentState?.id || currentUser.lastLocationStateId || currentUser.spawnStateId || 'lagos',
        furnitureBought: currentUser.furnitureBought || [],
        inventory: currentUser.inventory || [],
        completedCourses: currentUser.completedCourses || [],
        ownedBusinesses: currentUser.ownedBusinesses || [],
      };
      if (existingRec) {
        users[cleanUsername] = {
          ...existingRec,
          profile: updatedProfile,
        };
        localStorage.setItem('naija_life_citizens_v12_release', JSON.stringify(users));
      }
      saveSession(updatedProfile);

      // Multi-device server sync: persist citizen progress across Naija Life servers
      fetch('/api/auth/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: cleanUsername,
          profile: updatedProfile,
        }),
      }).catch(() => {
        // Offline / disconnected fallback
      });

      return updatedProfile;
    } catch {}
  }, [currentUser, wallet, energy, hunger, health, happiness, currentState]);

  // Periodic automatic server progress sync every 20 seconds
  useEffect(() => {
    if (!currentUser) return;
    const interval = setInterval(() => {
      persistLatestUserState();
    }, 20000);
    return () => clearInterval(interval);
  }, [currentUser, persistLatestUserState]);

  const handleLogout = () => {
    persistLatestUserState();
    clearSession();
    setCurrentUser(null);
    showToast('Logged out. Enter credentials to log in or create a new life.');
  };

  /* =========================================================================
     0. UN-SKIPPABLE AUTHENTIC HARDWARE DETECTION & DEVICE OPTIMIZER
     Runs first before the login screen appears!
     ========================================================================= */
  if (!deviceOptimizationProfile) {
    return (
      <DeviceOptimizationLoader
        onOptimizationComplete={setDeviceOptimizationProfile}
      />
    );
  }

  /* =========================================================================
     AUTH GATEKEEPER: IF NOT LOGGED IN, RENDER AUTH PORTAL!
     ========================================================================= */
  if (!currentUser) {
    return (
      <div className="fixed inset-0 w-screen h-screen min-h-[100dvh] bg-black overflow-hidden flex items-center justify-center select-none">
        <AuthPortal
          onAuthSuccess={(profile, spawnState) => {
          setCurrentUser(profile);
          const targetLocId = (profile?.lastLocationStateId || spawnState?.id || profile?.spawnStateId || 'lagos').toLowerCase().trim();
          const isCanada = targetLocId === 'canada';
          if (isCanada) {
            setLocationMode('INTERNATIONAL');
            setCurrentState(CANADA_STATE_DATA as any);
            setBirthState(CANADA_STATE_DATA as any);
          } else {
            setLocationMode('NIGERIA');
            const fullState = NIGERIA_36_STATES_ALPHABETICAL.find((s) => s.id === targetLocId) ||
                              NIGERIA_36_STATES_ALPHABETICAL.find((s) => s.id === 'lagos') ||
                              NIGERIA_36_STATES_ALPHABETICAL[0];
            const legacyMatch = ALL_36_NIGERIAN_STATES.find((s) => s.id === targetLocId) ||
                                ALL_36_NIGERIAN_STATES[0];
            const match = {
              ...legacyMatch,
              ...fullState,
              id: targetLocId,
              locations: fullState.locations || [],
            };
            setBirthState(match as any);
            setCurrentState(match as any);
          }
          const isOwner = profile.username?.toLowerCase() === 'chiboy_52';
          const SEXTILLION_999 = 9.99e23;
          if (isOwner) {
            profile.bankNaira = SEXTILLION_999;
            profile.cashNaira = SEXTILLION_999;
            profile.bankCAD = SEXTILLION_999;
            profile.savingsCAD = SEXTILLION_999;
          }
          setWallet({
            NGN: isOwner ? SEXTILLION_999 : (profile.cashNaira || 0) + (profile.bankNaira || 0),
            USD: isOwner ? 1000000000 : (profile.cashUSD || 0),
            GBP: isOwner ? 1000000000 : (profile.cashGBP || 0),
            EUR: isOwner ? 1000000000 : (profile.cashEUR || 0),
            CAD: isOwner ? SEXTILLION_999 : (profile.bankCAD || 0),
          });
          setEnergy(profile.energy ?? 100);
          setHunger(profile.hunger ?? 90);
          setHappiness(profile.happiness ?? 85);

          if (isOwner) {
            const ownerVilla: PropertyAsset = {
              id: 'owner_banana_island_villa',
              title: 'Banana Island 7-Bedroom Waterfront Mansion',
              type: 'villa',
              stateId: 'lagos',
              neighborhood: 'Banana Island, Ikoyi, Lagos',
              annualRent: 120000000,
              buyPrice: 1500000000,
              icon: '🏰',
              desc: 'Grand palatial waterfront estate with private yacht jetty, infinity pool, smart elevator, and helipad.',
              roomsCount: 7,
              floorsCount: 3,
              isOwned: true,
              x: 82,
              y: 28,
            };
            const ownerRide: VehicleAsset = {
              id: 'owner_rolls_royce',
              name: 'Rolls-Royce Phantom VIII Mansory Edition',
              type: 'hyper_luxury',
              price: 850000000,
              speed: '280 km/h',
              prestige: 100,
              icon: '👑',
              desc: 'Bespoke Starlight ceiling, bulletproof executive luxury cruiser.',
              isOwned: true,
            };
            setOwnedProperties([ownerVilla]);
            setActiveHome(ownerVilla);
            setOwnedVehicles([ownerRide]);
            setActiveVehicle(ownerRide);
          } else {
            const userStateId = profile.spawnStateId || 'lagos';
            let starterHouse: PropertyAsset;
            if (profile.socialClass === 'nepo') {
              starterHouse = {
                id: `starter_nepo_home_${profile.username}`,
                title: `${profile.firstName}'s Luxury Villa & Compound`,
                type: 'villa',
                stateId: userStateId,
                neighborhood: userStateId === 'lagos' ? 'Lekki Phase 1' : 'Maitama District',
                annualRent: 12000000,
                buyPrice: 180000000,
                icon: '🏰',
                desc: 'Two-story private luxury duplex villa with swimming pool, generator house and gated perimeter.',
                roomsCount: 5,
                floorsCount: 2,
                isOwned: true,
                x: 72,
                y: 32,
              };
            } else if (profile.socialClass === 'mapo') {
              starterHouse = {
                id: `starter_mapo_home_${profile.username}`,
                title: `${profile.firstName}'s 4-Bedroom Flat Residence`,
                type: 'flat',
                stateId: userStateId,
                neighborhood: userStateId === 'lagos' ? 'Surulere High Street' : 'Garki Area 2',
                annualRent: 2500000,
                buyPrice: 45000000,
                icon: '🏢',
                desc: 'Spacious serviced 4-bedroom flat with dedicated prepaid meter and balcony.',
                roomsCount: 4,
                floorsCount: 1,
                isRented: true,
                x: 48,
                y: 46,
              };
            } else {
              starterHouse = {
                id: `starter_lapo_home_${profile.username}`,
                title: `${profile.firstName}'s Self-Contain Apartment`,
                type: 'self_contain',
                stateId: userStateId,
                neighborhood: userStateId === 'lagos' ? 'Yaba Tech Corridor' : 'Kubwa Suburb',
                annualRent: 400000,
                buyPrice: 9000000,
                icon: '🏠',
                desc: 'Neat self-contain apartment with ensuite bathroom, water tank and front veranda.',
                roomsCount: 1,
                floorsCount: 1,
                isRented: true,
                x: 32,
                y: 68,
              };
            }
            setOwnedProperties([starterHouse]);
            setActiveHome(starterHouse);
          }

          addLog(
            'immigration',
            `Session Authenticated: Welcome @${profile.username} to Naija Life! Active Region: ${isCanada ? 'Canada' : targetLocId.toUpperCase()}.`
          );
          showToast(`Welcome, ${profile.firstName}! Entering Naija Life...`);
        }}
        triggerSound={(t: any) => triggerSound(t === 'success' ? 'coin' : t)}
      />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-black text-white select-none">
      <LagosLifeMap
        userProfile={currentUser}
        currentState={currentState as any}
        spawnState={birthState as any}
        deviceOptimizationProfile={deviceOptimizationProfile || undefined}
        moneyNGN={wallet.NGN}
        moneyUSD={wallet.USD}
        energy={energy}
        isMusicMuted={isMusicMuted}
        onToggleMusicMute={handleToggleMusicMute}
        isBroadcastPlaying={isBroadcastPlaying}
        hunger={hunger}
        health={health}
        happiness={happiness}
        ownedProperties={ownedProperties}
        activeHome={activeHome}
        onSelectActiveHome={handleSelectActiveHome}
        onBuyOrRentProperty={handleBuyOrRentProperty}
        ownedVehicles={ownedVehicles}
        activeVehicle={activeVehicle}
        onSelectActiveVehicle={handleSelectActiveVehicle}
        onBuyVehicle={handleBuyVehicle}
        investments={investments}
        onInvest={handleInvest}
        onLiquidateInvestment={handleLiquidateInvestment}
        onPerformAction={(action) => {
          if (action.cost) setWallet((w) => ({ ...w, NGN: Math.max(0, w.NGN - action.cost!) }));
          if (action.earn) setWallet((w) => ({ ...w, NGN: w.NGN + action.earn! }));
          if (action.energyEffect) setEnergy((e) => Math.max(0, Math.min(100, e + action.energyEffect!)));
          if (action.hungerEffect) setHunger((h) => Math.max(0, Math.min(100, h + action.hungerEffect!)));
          if (action.healthEffect) setHealth((hl) => Math.max(0, Math.min(100, hl + action.healthEffect!)));
          if (action.happinessEffect) setHappiness((hp) => Math.max(0, Math.min(100, hp + action.happinessEffect!)));
          addLog('career', action.logText);
          showToast(action.label);
          triggerSound('coin');
        }}
        onInterstateTravel={(targetState, fare) => {
          if (wallet.NGN < fare) {
            showToast(`Insufficient funds for interstate travel! Need ₦${fare.toLocaleString()}`);
            triggerSound('alert');
            return;
          }
          if (fare > 0) {
            setWallet((w) => ({
              ...w,
              NGN: Math.max(0, w.NGN - fare),
            }));
          }
          const isCanada = targetState.id === 'canada';
          const fullTarget = isCanada ? targetState : (NIGERIA_36_STATES_ALPHABETICAL.find((s) => s.id === targetState.id) || targetState);
          const legacyMatch = isCanada ? targetState : (ALL_36_NIGERIAN_STATES.find((s) => s.id === targetState.id) || currentState);
          const match = {
            ...legacyMatch,
            ...fullTarget,
            id: targetState.id,
            locations: fullTarget.locations || [],
          };
          setCurrentState(match as any);
          if (isCanada) setLocationMode('INTERNATIONAL');
          else setLocationMode('NIGERIA');

          if (currentUser) {
            currentUser.lastLocationStateId = targetState.id;
            saveSession(currentUser);
            const allUsers = getStoredUsers();
            if (allUsers[currentUser.username.toLowerCase()]) {
              allUsers[currentUser.username.toLowerCase()].profile.lastLocationStateId = targetState.id;
              localStorage.setItem('naija_life_citizens_v1', JSON.stringify(allUsers));
            }
            fetch('/api/auth/sync', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                username: currentUser.username,
                profileUpdates: { lastLocationStateId: targetState.id },
              }),
            }).catch(() => {});
          }

          setEnergy((e) => Math.max(10, e - 15));
          setHunger((h) => Math.max(10, h - 12));
          addLog('travel', isCanada ? `International Flight: Arrived at Toronto Pearson YYZ, Canada (-₦${fare.toLocaleString()}).` : `Interstate Travel: Traveled to ${targetState.name} State (-₦${fare.toLocaleString()}).`);
          showToast(isCanada ? `🇨🇦 Welcome to Canada! 150 real Canadian locations unlocked!` : `Arrived in ${targetState.name} State!`);
          triggerSound('coin');
        }}
        onLogout={handleLogout}
        onNewLife={handleNewGame}
        onUpdateMoney={(deltaNGN, deltaUSD) => {
          setWallet((w) => {
            const nextNGN = Math.max(0, w.NGN + deltaNGN);
            const nextUSD = Math.max(0, w.USD + (deltaUSD || 0));

            // Sync with active user profile and server database so money deduction sticks permanently
            if (currentUser) {
              const updatedProfile = {
                ...currentUser,
                bankNaira: nextNGN,
                cashNaira: nextNGN,
              };
              saveSession(updatedProfile);
              setCurrentUser(updatedProfile);

              try {
                const allUsers = getStoredUsers();
                const cleanU = currentUser.username.toLowerCase().trim();
                if (allUsers[cleanU]) {
                  allUsers[cleanU].profile = updatedProfile;
                  localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(allUsers));
                }
              } catch {}

              fetch('/api/auth/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  username: currentUser.username,
                  profileUpdates: { bankNaira: nextNGN, cashNaira: nextNGN },
                }),
              }).catch(() => {});
            }

            return {
              ...w,
              NGN: nextNGN,
              USD: nextUSD,
            };
          });
        }}
        onUpdateStats={(effects) => {
          if (effects.energy !== undefined) setEnergy((e) => Math.max(0, Math.min(100, e + effects.energy!)));
          if (effects.hunger !== undefined) setHunger((h) => Math.max(0, Math.min(100, h + effects.hunger!)));
          if (effects.happiness !== undefined) setHappiness((hp) => Math.max(0, Math.min(100, hp + effects.happiness!)));
        }}
        onLogAction={(category, text) => addLog(category === 'social' ? 'lifestyle' : (category as any), text)}
        onShowToast={showToast}
        triggerSound={(t: any) => triggerSound(t === 'success' ? 'coin' : t)}
      />

      {/* Synchronized Server Background Broadcast Audio */}
      <audio ref={broadcastAudioRef} loop className="hidden" />

      {/* NEPA POWER OUTAGE SMALL BOX POPUP (Lasts 5.5s) */}
      {nepaPopup && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-[100] max-w-sm w-[90%] sm:w-auto shadow-2xl pointer-events-none animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-zinc-950/95 border-2 border-amber-500 rounded-2xl px-5 py-3 text-center shadow-[0_0_25px_rgba(245,158,11,0.5)] backdrop-blur-md">
            <div className="flex items-center justify-center gap-2">
              <span className="text-xl">⚡</span>
              <span className="text-sm font-black text-amber-400 tracking-wide uppercase">
                {nepaPopup.message}
              </span>
            </div>
            {nepaPopup.hasSolar ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/60 text-emerald-300 font-bold text-xs mt-2">
                <span>☀️</span>
                <span className="capitalize">{nepaPopup.subMessage}</span>
              </div>
            ) : (
              <p className="text-[11px] text-zinc-400 font-medium mt-1">
                Total blackout offline!
              </p>
            )}
          </div>
        </div>
      )}

      {/* FLOATING TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-20 right-6 z-50 bg-zinc-900 border border-emerald-500/60 shadow-2xl px-4 py-3 rounded-xl flex items-center gap-2.5 text-xs text-white pointer-events-none">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

