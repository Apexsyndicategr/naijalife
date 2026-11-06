/**
 * Generator script to create comprehensive Nigerian life catalogs:
 * - 70 businesses per state (Lagos, Abuja, Imo, Rivers, Kano) = 350 businesses
 * - 70 jobs per state (Lagos, Abuja, Imo, Rivers, Kano) = 350 jobs
 * - 100 houses per state (Lagos, Abuja, Imo, Rivers, Kano) = 500 houses
 * - 70+ Chowdeck meals (+50 more)
 * - 90+ Academy courses (+70 more)
 */

const fs = require('fs');

const STATES = [
  { id: 'lagos', name: 'Lagos', neighborhoods: ['Victoria Island', 'Ikoyi', 'Lekki Phase 1', 'Banana Island', 'Ikeja GRA', 'Surulere', 'Yaba', 'Magodo', 'Ajah', 'Maryland', 'Oshodi', 'Ikorodu', 'Alaba', 'Festac', 'Epe'] },
  { id: 'abuja', name: 'Abuja', neighborhoods: ['Maitama', 'Asokoro', 'Wuse 2', 'Gwarinpa', 'Jabi', 'Guzape', 'Utako', 'Central Business District', 'Garki 2', 'Apo Legislative', 'Life Camp', 'Lugbe', 'Kubwa', 'Katampe', 'Mpape'] },
  { id: 'imo', name: 'Imo', neighborhoods: ['New Owerri', 'Ikenegbu Layout', 'Aladinma', 'World Bank Housing Estate', 'Douglas Road', 'Orlu Road', 'Works Layout', 'Okigwe Road', 'Amakohia', 'Uratta', 'Trans-Egbu', 'Irete', 'Nekede', 'Orji', 'Control Post'] },
  { id: 'rivers', name: 'Rivers', neighborhoods: ['Old GRA Port Harcourt', 'New GRA Phase 2', 'Trans-Amadi Industrial', 'Peter Odili Road', 'Woji', 'D-Line', 'Rumuola', 'Ada George', 'Stadium Road', 'Eliozu', 'Bonny Island', 'Rumuokwuta', 'Choba', 'Borikiri', 'Diobu'] },
  { id: 'kano', name: 'Kano', neighborhoods: ['Nassarawa GRA', 'Bompai Industrial', 'Sabon Gari', 'Kofar Mata', 'Fagge', 'Dawanau', 'Sharada', 'Tarauni', 'Gidan Rumfa', 'Hotoro', 'Challawa', 'Kano City Walls', 'Bayero University Area', 'Yankaba', 'Dorayi'] }
];

// --- 70 BUSINESS TEMPLATES PER STATE ---
const BIZ_TEMPLATES = [
  { name: 'POS & Mobile Money Agency Terminal Network', icon: '💳', cost: 350000, profit: 24000, desc: 'High-traffic financial kiosk processing cash withdrawals, electricity bills, and deposits.' },
  { name: 'Commercial Transit Minibus Fleet', icon: '🚐', cost: 5200000, profit: 340000, desc: 'Fleet of 3 commercial transit buses plying busy municipal commuter routes.' },
  { name: 'Rooftop Cocktail Lounge & Suya Spot', icon: '🍸', cost: 24000000, profit: 1600000, desc: 'High-margin nightlife venue with DJ booth, cocktail bar, and VIP lounges.' },
  { name: 'AI & Fintech Software Engineering Firm', icon: '💻', cost: 19500000, profit: 1350000, desc: 'Tech studio building web apps, APIs, and payment integrations for global clients.' },
  { name: 'Pure Water & Bottled Mineral Water Factory', icon: '💧', cost: 4200000, profit: 280000, desc: 'Automated reverse osmosis purification plant with 2 delivery delivery trucks.' },
  { name: 'Maritime Freight Clearing & Forwarding Agency', icon: '🚢', cost: 38000000, profit: 2600000, desc: 'Customs brokerage and container haulage from port terminals to inland warehouses.' },
  { name: 'Executive Bulletproof Luxury Car Hire & Escort', icon: '🚙', cost: 48000000, profit: 3100000, desc: 'VIP armored Prado SUVs and security convoy hire for dignitaries and executives.' },
  { name: 'Bespoke Haute Couture Fashion Atelier', icon: '👗', cost: 15500000, profit: 980000, desc: 'Custom Senator cuts, luxury agbadas, and designer embroidery bridal gowns.' },
  { name: 'Gourmet Continental & Afro-Fusion Bistro', icon: '🍽️', cost: 18000000, profit: 1250000, desc: 'Fine dining culinary spot frequented by expatriates, tourists, and company directors.' },
  { name: 'Prime Commercial Real Estate Brokerage', icon: '🏗️', cost: 85000000, profit: 5200000, desc: 'High-ticket luxury property sales, land acquisition, and tenant management.' },
  { name: 'Waterfront Boat & Jet Ski Rental Club', icon: '🛥️', cost: 32000000, profit: 2100000, desc: 'Speedboat charters, private pontoon cruises, and weekend jet ski hires.' },
  { name: 'Boutique Luxury Hotel & Executive Suites', icon: '🏨', cost: 68000000, profit: 4300000, desc: '40-room hospitality palace with banquet halls, pool bar, and 24/7 solar generators.' },
  { name: 'Automotive Spare Parts Import Depot', icon: '⚙️', cost: 7200000, profit: 490000, desc: 'Direct container imports of Japanese & German OEM auto parts, brake pads, and oils.' },
  { name: 'Commercial Integrated Poultry & Feed Mill Farm', icon: '🐔', cost: 6000000, profit: 390000, desc: '5,000 layer birds, automated egg grading, and broiler chicken supplies.' },
  { name: 'Licensed Wholesale Pharmaceuticals Warehouse', icon: '💊', cost: 14000000, profit: 950000, desc: 'NAFDAC-certified distribution of prescription medications and medical consumables.' },
  { name: 'Offshore Energy Logistics & Supply Base', icon: '⛽', cost: 140000000, profit: 8900000, desc: 'Heavy valves, PPE, and offshore support vessel provisioning for oil platforms.' },
  { name: 'Marine Tugboat & Coastal Barge Transport', icon: '⛴️', cost: 95000000, profit: 6200000, desc: 'Barge haulage of pipes, cement, and containerised cargo across coastal waterways.' },
  { name: 'Cold-Chain Seafood & Tiger Prawns Depot', icon: '🐟', cost: 8800000, profit: 580000, desc: 'Industrial blast freezers storing Atlantic croaker, prawns, and red snapper.' },
  { name: 'Heritage Textile Weaving & Embroidery Mills', icon: '🧵', cost: 4800000, profit: 330000, desc: 'Traditional woven fabrics, indigo dyed cotton, and exported brocades.' },
  { name: 'Wholesale Grains & Agro-Commodities Silos', icon: '🌾', cost: 17500000, profit: 1180000, desc: 'Bulk warehousing of beans, maize, sorghum, and sesame seed export bags.' },
  { name: 'Finished Leather Export & Tannery Enterprise', icon: '👞', cost: 42000000, profit: 2800000, desc: 'Processing prime goat and cow hide for European luxury leather ateliers.' },
  { name: '24/7 Automated Solar EV Charging Hub & Car Wash', icon: '⚡', cost: 12500000, profit: 820000, desc: 'Ultra-modern steam car wash with commercial DC fast chargers and snack bar.' },
  { name: 'Modern Dental & Maxillofacial Diagnostic Clinic', icon: '🦷', cost: 26000000, profit: 1750000, desc: 'Cosmetic dentistry, teeth whitening, and digital panoramic X-ray imaging.' },
  { name: 'International Logistics Express Courier Hub', icon: '📦', cost: 11000000, profit: 750000, desc: 'Motorcycle dispatch fleet and air cargo forwarding across all 36 states.' },
  { name: 'Supermarket & Organic Grocery Department Store', icon: '🛒', cost: 35000000, profit: 2350000, desc: 'Modern air-conditioned grocery aisles with bakery and butchery sections.' },
  { name: 'Premium Gymnasium & Wellness Spa Centre', icon: '🏋️', cost: 16500000, profit: 1120000, desc: 'State-of-the-art strength training, steam sauna, and certified personal trainers.' },
  { name: 'Artisan Bakery & European Pastry Kitchen', icon: '🥐', cost: 8200000, profit: 560000, desc: 'Fresh butter croissants, sourdough loaves, and customized celebration cakes.' },
  { name: 'Commercial Printing & Corporate Branding Press', icon: '🖨️', cost: 13500000, profit: 910000, desc: 'Heidelberg offset printing for calendars, billboards, and luxury packaging.' },
  { name: 'Solar Inverter & Lithium Battery Assembly Plant', icon: '🔋', cost: 29000000, profit: 1980000, desc: 'Assembling clean energy hybrid inverter systems for estates and industries.' },
  { name: 'Automated Brick & Concrete Paving Block Works', icon: '🧱', cost: 9500000, profit: 640000, desc: 'Hydraulic vibration press manufacturing durable interlocking stones and blocks.' },
  { name: 'Event Management & Luxury Marquee Arena', icon: '🎪', cost: 45000000, profit: 3050000, desc: '1,500-seater air-conditioned dome hosting high-society weddings and summits.' },
  { name: 'Professional Sound, Lighting & Stage Rigging Hire', icon: '🎤', cost: 21000000, profit: 1420000, desc: 'Concert-grade line array sound, moving heads, and outdoor LED stage screens.' },
  { name: 'Specialty Coffee Roastery & Digital Nomad Cafe', icon: '☕', cost: 7800000, profit: 530000, desc: 'Artisanal single-origin bean coffees with high-speed fiber internet workspaces.' },
  { name: 'Film Production Studio & Audio Mastering Suite', icon: '🎬', cost: 34000000, profit: 2280000, desc: '4K cinema cameras, green screen stage, and Dolby Atmos audio mixing room.' },
  { name: 'Petroleum Products Retail Filling Station', icon: '⛽', cost: 115000000, profit: 7400000, desc: '8-pump digital filling station with automated supermarket and lube bay.' }
];

// Generate 70 businesses for a state by cycling through variations and neighborhoods
function generateBusinessesForState(state) {
  const result = [];
  for (let i = 0; i < 70; i++) {
    const tmpl = BIZ_TEMPLATES[i % BIZ_TEMPLATES.length];
    const n = state.neighborhoods[i % state.neighborhoods.length];
    const multiplier = 1 + (Math.floor(i / BIZ_TEMPLATES.length) * 0.25);
    const cost = Math.round(tmpl.cost * multiplier);
    const profit = Math.round(tmpl.profit * multiplier);
    const id = `biz_${state.id}_${i + 1}`;
    result.push({
      typeId: id,
      name: `${n} ${tmpl.name}`,
      stateId: state.id,
      stateName: state.name,
      icon: tmpl.icon,
      costNGN: cost,
      dailyProfitNGN: profit,
      desc: `${tmpl.desc} Situated in the prime commercial zone of ${n}, ${state.name}.`
    });
  }
  return result;
}

// --- 70 JOBS TEMPLATES PER STATE ---
const JOB_SECTORS = ['tech', 'corporate', 'healthcare', 'oil_gas', 'commerce', 'creative', 'civil', 'trades'];
const JOB_TEMPLATES = [
  { title: 'Chief Technology Officer (CTO)', company: 'Zenith Matrix Fintech', sector: 'tech', salary: 3800000, energy: 30, desc: 'Lead engineering, cloud architecture, and cybersecurity strategy for fintech platform.' },
  { title: 'Senior Full Stack Software Architect', company: 'PayPulse Technologies', sector: 'tech', salary: 2200000, energy: 25, desc: 'Build scalable React and Node.js microservices handling millions of daily queries.' },
  { title: 'Mobile Applications Engineer', company: 'NaijaSmart Labs', sector: 'tech', salary: 1400000, energy: 20, desc: 'Develop native iOS and Android apps with offline synchronization capabilities.' },
  { title: 'Senior Investment Banker & M&A Associate', company: 'Stanbic IBTC Capital', sector: 'corporate', salary: 2800000, energy: 35, desc: 'Structure multi-billion naira syndications, equity mergers, and sovereign Eurobonds.' },
  { title: 'Corporate Treasury & Forex Risk Manager', company: 'Access Holdings Group', sector: 'corporate', salary: 1950000, energy: 25, desc: 'Manage liquidity buffers, FX swaps, and hedging instruments with the Central Bank.' },
  { title: 'Chartered Management Accountant', company: 'PwC Global Advisory', sector: 'corporate', salary: 1350000, energy: 20, desc: 'Deliver statutory audits, tax advisory, and quarterly financial filings.' },
  { title: 'Senior Consultant Cardiothoracic Surgeon', company: 'Apex Specialist Teaching Hospital', sector: 'healthcare', salary: 3200000, energy: 40, desc: 'Perform complex coronary artery bypass and thoracic surgeries in laminar flow theatres.' },
  { title: 'Chief Medical Officer (CMO)', company: 'St. Nicholas Care Hospital', sector: 'healthcare', salary: 2600000, energy: 30, desc: 'Supervise hospital clinical operations, emergency admissions, and medical ethics.' },
  { title: 'Licensed Clinical Pharmacist Specialist', company: 'MedPlus Nationwide Health', sector: 'healthcare', salary: 850000, energy: 15, desc: 'Dispense specialized compounding therapies and patient pharmaceutical consultations.' },
  { title: 'Principal Petroleum Drilling Engineer', company: 'Shell Deepwater Nigeria', sector: 'oil_gas', salary: 4500000, energy: 40, desc: 'Direct offshore subsea drilling rigs and blowout preventer operations in the Bonga field.' },
  { title: 'Offshore Piping & Structural Integrity Lead', company: 'TotalEnergies Exploration', sector: 'oil_gas', salary: 3600000, energy: 35, desc: 'Inspect FPSO mooring systems, gas turbines, and high-pressure subsea pipelines.' },
  { title: 'Downstream Fuel Terminal Manager', company: 'NNPC Retail Limited', sector: 'oil_gas', salary: 1800000, energy: 25, desc: 'Oversee petroleum storage tank farm logistics, automated gantry loading, and safety.' },
  { title: 'Commercial Real Estate Development Director', company: 'Eko Atlantic Properties', sector: 'commerce', salary: 3100000, energy: 30, desc: 'Negotiate high-value land acquisitions, zoning permits, and luxury skyscraper builds.' },
  { title: 'Wholesale Trade & FMCG Supply Chain Head', company: 'Dangote Consumer Foods', sector: 'commerce', salary: 1750000, energy: 25, desc: 'Optimize national logistics fleets delivering consumer food staples to open markets.' },
  { title: 'Chief Procurement & Sourcing Specialist', company: 'Shoprite Nigeria Retail', sector: 'commerce', salary: 1100000, energy: 20, desc: 'Negotiate bulk contracts with local manufacturers and international food importers.' },
  { title: 'Senior Creative Director & Brand Strategist', company: 'Ogilvy & Mather West Africa', sector: 'creative', salary: 1600000, energy: 25, desc: 'Direct multi-channel commercial campaigns for telecom, banking, and beverage brands.' },
  { title: 'Lead 3D Motion Graphics & VFX Artist', company: 'EbonyLife Media Studios', sector: 'creative', salary: 1250000, energy: 20, desc: 'Create cinematic visual effects, color grading, and CGI for international feature films.' },
  { title: 'Executive Music Producer & Sound Engineer', company: 'Mavin Records Global', sector: 'creative', salary: 2100000, energy: 25, desc: 'Compose, mix, and master Afrobeats tracks for billboard-charting music artistes.' },
  { title: 'Permanent Secretary / Director of Public Finance', company: 'State Ministry of Finance', sector: 'civil', salary: 1500000, energy: 25, desc: 'Oversee annual state fiscal budget implementation, revenue allocation, and civil payroll.' },
  { title: 'State High Court Registrar & Magistrate', company: 'State Judicial Commission', sector: 'civil', salary: 1200000, energy: 20, desc: 'Preside over civil litigation hearings, probate filings, and contractual disputes.' },
  { title: 'Director of Urban Town Planning & Zoning', company: 'Ministry of Physical Planning', sector: 'civil', salary: 980000, energy: 20, desc: 'Enforce master plans, approve residential blueprints, and issue building permits.' },
  { title: 'Certified Industrial Electrical Contractor', company: 'Schneider Power Solutions', sector: 'trades', salary: 950000, energy: 25, desc: 'Install high-voltage switchgear, transformer substations, and industrial backup systems.' },
  { title: 'Master Automotive Engine Machinist & Diagnostic Tech', company: 'Coscharis Motors Service', sector: 'trades', salary: 820000, energy: 20, desc: 'Troubleshoot electronic control units, automatic transmissions, and turbochargers.' },
  { title: 'Senior HVAC & Heavy Commercial Chiller Specialist', company: 'Carrier Air Conditioning', sector: 'trades', salary: 780000, energy: 20, desc: 'Service central air handling units, refrigerant circuits, and duct cooling for high-rises.' }
];

function generateJobsForState(state) {
  const result = [];
  for (let i = 0; i < 70; i++) {
    const tmpl = JOB_TEMPLATES[i % JOB_TEMPLATES.length];
    const n = state.neighborhoods[i % state.neighborhoods.length];
    const multiplier = 1 + (Math.floor(i / JOB_TEMPLATES.length) * 0.15);
    const salary = Math.round(tmpl.salary * multiplier);
    const id = `job_${state.id}_${i + 1}`;
    result.push({
      id,
      title: `${tmpl.title} (${n})`,
      company: `${tmpl.company} - ${state.name} Division`,
      stateId: state.id,
      stateName: state.name,
      salaryNGN: salary,
      minEnergy: tmpl.energy,
      sector: tmpl.sector,
      desc: `${tmpl.desc} Stationed in the regional offices at ${n}, ${state.name}.`
    });
  }
  return result;
}

// --- 100 HOUSES TEMPLATES PER STATE ---
const HOUSE_TYPES = [
  { type: 'self_contain', nameSuffix: 'Modern Studio Self-Contain', icon: '🏢', baseRent: 450000, baseBuy: 8500000, rooms: 1, floors: 1, desc: 'Compact fully-tiled self-contain with ensuite bath and kitchenette.' },
  { type: 'flat', nameSuffix: '2-Bedroom Serviced Apartment Flat', icon: '🏬', baseRent: 1200000, baseBuy: 22000000, rooms: 2, floors: 1, desc: 'Serviced flat in gated compound with prepaid meter and security gate.' },
  { type: 'flat', nameSuffix: '3-Bedroom Luxury Apartment with BQ', icon: '🏢', baseRent: 2800000, baseBuy: 45000000, rooms: 3, floors: 1, desc: 'Spacious modern flat with POP ceiling, master ensuite, and staff quarters.' },
  { type: 'duplex', nameSuffix: '4-Bedroom Semi-Detached Duplex', icon: '🏡', baseRent: 6500000, baseBuy: 95000000, rooms: 4, floors: 2, desc: 'Two-story private duplex with private car park for 4 vehicles and balcony.' },
  { type: 'duplex', nameSuffix: '5-Bedroom Fully-Detached Smart Duplex', icon: '🏰', baseRent: 12000000, baseBuy: 180000000, rooms: 5, floors: 2, desc: 'Smart home automation, CCTV surveillance, fitted kitchen, and solar panels.' },
  { type: 'mansion', nameSuffix: '6-Bedroom Contemporary Executive Mansion', icon: '🏛️', baseRent: 25000000, baseBuy: 420000000, rooms: 6, floors: 3, desc: '3-story mansion with private cinema room, swimming pool, and elevator lift.' },
  { type: 'villa', nameSuffix: 'Waterfront / Hilltop Presidential Palace Villa', icon: '👑', baseRent: 55000000, baseBuy: 1200000000, rooms: 8, floors: 3, desc: 'Ultra-exclusive private villa with helipad, landscaped gardens, and infinity pool.' }
];

function generateHousesForState(state) {
  const result = [];
  for (let i = 0; i < 100; i++) {
    const tmpl = HOUSE_TYPES[i % HOUSE_TYPES.length];
    const n = state.neighborhoods[i % state.neighborhoods.length];
    // Coordinate generation across the 100 map grid
    const col = i % 10;
    const row = Math.floor(i / 10);
    const x = Math.round(15 + (col / 9) * 70);
    const y = Math.round(15 + (row / 9) * 70);

    const tier = Math.floor(i / HOUSE_TYPES.length) + 1;
    const multiplier = 1 + (tier - 1) * 0.18;
    const rent = Math.round(tmpl.baseRent * multiplier);
    const buy = Math.round(tmpl.baseBuy * multiplier);
    const id = `house_${state.id}_${i + 1}`;

    result.push({
      id,
      title: `${n} ${tmpl.nameSuffix}${tier > 1 ? ` (Phase ${tier})` : ''}`,
      type: tmpl.type,
      stateId: state.id,
      neighborhood: n,
      annualRent: rent,
      buyPrice: buy,
      icon: tmpl.icon,
      desc: `${tmpl.desc} Located on a quiet paved residential avenue in ${n}, ${state.name}.`,
      roomsCount: tmpl.rooms,
      floorsCount: tmpl.floors,
      x,
      y,
      rentalIncomeDaily: Math.round(rent / 365)
    });
  }
  return result;
}

// Generate all catalogs
let allBusinesses = [];
let allJobs = [];
let allHouses = [];

STATES.forEach(st => {
  allBusinesses = allBusinesses.concat(generateBusinessesForState(st));
  allJobs = allJobs.concat(generateJobsForState(st));
  allHouses = allHouses.concat(generateHousesForState(st));
});

console.log(`Generated Businesses: ${allBusinesses.length}`);
console.log(`Generated Jobs: ${allJobs.length}`);
console.log(`Generated Houses: ${allHouses.length}`);

// Write out to src/data/expandedStateCatalogs.ts
const code = `/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Auto-generated comprehensive state-specific catalogs:
 * - 70 Businesses per state (Lagos, Abuja, Imo, Rivers, Kano) = 350 businesses
 * - 70 Jobs per state (Lagos, Abuja, Imo, Rivers, Kano) = 350 jobs
 * - 100 Houses per state (Lagos, Abuja, Imo, Rivers, Kano) = 500 houses
 */

import { BusinessItem, JobItem } from './expandedLifeData';
import { PropertyAsset } from '../types/game';

export const EXPANDED_STATE_BUSINESSES: BusinessItem[] = ${JSON.stringify(allBusinesses, null, 2)};

export const EXPANDED_STATE_JOBS: JobItem[] = ${JSON.stringify(allJobs, null, 2)};

export const EXPANDED_STATE_HOUSES: PropertyAsset[] = ${JSON.stringify(allHouses, null, 2)};
`;

fs.writeFileSync('src/data/expandedStateCatalogs.ts', code);
console.log('Successfully wrote src/data/expandedStateCatalogs.ts');
