/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import path from 'path';
import { EconomyEngine } from './economyEngine.ts';
import { majorToMinor } from '../utils/bigMoney.ts';

// =========================================================================
// 1. DEVICE STORE LAPTOPS & CODING / CYBERSECURITY DEFENSE CAREER
// =========================================================================
export interface LaptopCatalogItem {
  id: string;
  name: string;
  brand: string;
  cpu: string;
  ram: string;
  storage: string;
  display: string;
  priceNGN: number;
  priceCAD: number;
  color: string;
  tier: 'Entry' | 'Creator' | 'Executive' | 'Workstation';
  desc: string;
}

export const LAPTOP_CATALOG: LaptopCatalogItem[] = [
  {
    id: 'naijabook_air_14',
    name: 'NaijaBook Air 14',
    brand: 'NaijaTech',
    cpu: 'N12 8-Core ARM',
    ram: '16GB Unified',
    storage: '512GB NVMe',
    display: '14.2" IPS 2.4K',
    priceNGN: 450000,
    priceCAD: 650,
    color: '#10b981',
    tier: 'Entry',
    desc: 'Featherweight anodized emerald laptop built for daily productivity & coding basics.',
  },
  {
    id: 'zinox_lumina_16',
    name: 'Zinox Lumina Pro 16',
    brand: 'Zinox Labs',
    cpu: 'Core Ultra 7 155H',
    ram: '32GB DDR5',
    storage: '1TB Gen4 SSD',
    display: '16" OLED 120Hz',
    priceNGN: 1250000,
    priceCAD: 1650,
    color: '#3b82f6',
    tier: 'Creator',
    desc: 'High-brightness OLED workstation tailored for Lagos developers & engineers.',
  },
  {
    id: 'mapleleaf_studiobook',
    name: 'MapleLeaf StudioBook X1',
    brand: 'MapleTech Toronto',
    cpu: 'M-Pro 12-Core',
    ram: '36GB Unified',
    storage: '2TB NVMe',
    display: '15.3" Liquid Retina',
    priceNGN: 2450000,
    priceCAD: 2550,
    color: '#ef4444',
    tier: 'Executive',
    desc: 'Precision milled aluminum laptop optimized for full-stack builds & telemetry.',
  },
  {
    id: 'eko_quantum_ws',
    name: 'Eko Quantum Workstation',
    brand: 'Apex Systems',
    cpu: 'Ryzen 9 9950HX',
    ram: '64GB ECC',
    storage: '4TB RAID NVMe',
    display: '17" Mini-LED 165Hz',
    priceNGN: 4800000,
    priceCAD: 4950,
    color: '#f59e0b',
    tier: 'Workstation',
    desc: 'Flagship security operations and parallel compile machine with dual cooling.',
  },
];

// =========================================================================
// 2. NAIJA RIDE (3 DISTINCT FICTIONAL COMPANIES)
// =========================================================================
export interface RideCompanyDef {
  id: 'ekogo' | 'swiftcab' | 'mapleride';
  name: string;
  tagline: string;
  color: string;
  rating: number;
  baseNGN: number;
  perUnitNGN: number;
  baseCAD: number;
  perUnitCAD: number;
  tierLabel: string;
  etaMins: number;
}

export const RIDE_COMPANIES: RideCompanyDef[] = [
  {
    id: 'ekogo',
    name: 'EkoGo',
    tagline: 'Everyday Smart City Rides',
    color: '#10b981',
    rating: 4.7,
    baseNGN: 1200,
    perUnitNGN: 380,
    baseCAD: 6.5,
    perUnitCAD: 1.9,
    tierLabel: 'Value Economy',
    etaMins: 4,
  },
  {
    id: 'swiftcab',
    name: 'SwiftCab',
    tagline: 'AC Comfort & Priority Dispatch',
    color: '#f59e0b',
    rating: 4.9,
    baseNGN: 1850,
    perUnitNGN: 470,
    baseCAD: 9.0,
    perUnitCAD: 2.35,
    tierLabel: 'Comfort Sedan',
    etaMins: 2,
  },
  {
    id: 'mapleride',
    name: 'RoyalLux Ride',
    tagline: 'Executive SUV Chauffeur',
    color: '#38bdf8',
    rating: 4.95,
    baseNGN: 3400,
    perUnitNGN: 720,
    baseCAD: 15.0,
    perUnitCAD: 3.4,
    tierLabel: 'Executive Class',
    etaMins: 3,
  },
];

export interface RideBookingRecord {
  id: string;
  uid: string;
  companyId: RideCompanyDef['id'];
  companyName: string;
  country: 'nigeria' | 'canada';
  pickup: string;
  destination: string;
  distanceKm: number;
  fareMajor: number;
  currency: 'NGN' | 'CAD';
  status: 'SEARCHING' | 'DRIVER_EN_ROUTE' | 'IN_TRANSIT' | 'COMPLETED';
  driverName: string;
  vehiclePlate: string;
  createdAt: number;
}

// =========================================================================
// 3. INTERACTIVE 3D PETS CATALOG
// =========================================================================
export interface PetSpeciesCatalog {
  id: string;
  name: string;
  species: 'dog' | 'cat' | 'rabbit' | 'parrot' | 'horse';
  priceNGN: number;
  priceCAD: number;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  trait: string;
  desc: string;
}

export const PET_CATALOG: PetSpeciesCatalog[] = [
  { id: 'pet_boerboel', name: 'Boerboel Guard Dog', species: 'dog', priceNGN: 320000, priceCAD: 450, primaryColor: '#a16207', secondaryColor: '#451a03', accentColor: '#ef4444', trait: 'Loyal Protector', desc: 'Muscular tan mastiff built for Ikoyi & Abuja compound security.' },
  { id: 'pet_gsd', name: 'German Shepherd', species: 'dog', priceNGN: 450000, priceCAD: 680, primaryColor: '#92400e', secondaryColor: '#18181b', accentColor: '#10b981', trait: 'Sharp Responder', desc: 'Black-and-tan working dog with upright ears and athletic posture.' },
  { id: 'pet_husky', name: 'Siberian Husky', species: 'dog', priceNGN: 520000, priceCAD: 750, primaryColor: '#64748b', secondaryColor: '#f8fafc', accentColor: '#38bdf8', trait: 'Winter Sprinter', desc: 'Wolf-like double-coat companion adapted nicely for Toronto.' },
  { id: 'pet_siamese', name: 'Siamese Cat', species: 'cat', priceNGN: 165000, priceCAD: 280, primaryColor: '#e7e5e4', secondaryColor: '#44403c', accentColor: '#6366f1', trait: 'Graceful Companion', desc: 'Cream coat feline with chocolate points and sapphire eyes.' },
  { id: 'pet_rabbit', name: 'Lionhead Lop Rabbit', species: 'rabbit', priceNGN: 75000, priceCAD: 140, primaryColor: '#f5f5f4', secondaryColor: '#fda4af', accentColor: '#f43f5e', trait: 'Calm Hopper', desc: 'Fluffy long-eared bunny ideal for apartment & estate living.' },
  { id: 'pet_parrot', name: 'African Grey Parrot', species: 'parrot', priceNGN: 240000, priceCAD: 520, primaryColor: '#71717a', secondaryColor: '#dc2626', accentColor: '#facc15', trait: 'Clever Mimic', desc: 'Intelligent silver-grey tropical bird with crimson tail feathers.' },
];

export interface OwnedPetRecord {
  id: string;
  uid: string;
  speciesId: string;
  species: PetSpeciesCatalog['species'];
  breedName: string;
  petName: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  hunger: number; // 0-100
  happiness: number; // 0-100
  health: number; // 0-100
  energy: number; // 0-100
  ageDays: number;
  adoptedAt: number;
  lastCareAt: number;
}

// =========================================================================
// 4. INSURANCE PLANS & POLICIES
// =========================================================================
export type InsuranceCategory = 'vehicle' | 'home' | 'health' | 'business' | 'property';

export interface InsurancePlanDef {
  id: string;
  category: InsuranceCategory;
  name: string;
  provider: string;
  premiumNGN: number;
  premiumCAD: number;
  coverageCapNGN: number;
  coverageCapCAD: number;
  deductiblePct: number;
  durationDays: number;
  benefits: string[];
}

export const INSURANCE_PLANS: InsurancePlanDef[] = [
  { id: 'ins_vehicle', category: 'vehicle', name: 'Comprehensive Auto Shield', provider: 'AXA Mansard / Intact', premiumNGN: 45000, premiumCAD: 120, coverageCapNGN: 15000000, coverageCapCAD: 35000, deductiblePct: 10, durationDays: 30, benefits: ['Collision & road damage reimbursement', 'Theft protection on active vehicle'] },
  { id: 'ins_home', category: 'home', name: 'Home & Contents Protect', provider: 'Leadway Assurance', premiumNGN: 65000, premiumCAD: 145, coverageCapNGN: 25000000, coverageCapCAD: 55000, deductiblePct: 5, durationDays: 30, benefits: ['Power surge & fire repair cover', 'Residential furniture coverage'] },
  { id: 'ins_health', category: 'health', name: 'Prime Health HMO + OHIP Care', provider: 'Hygeia / SunLife', premiumNGN: 28000, premiumCAD: 85, coverageCapNGN: 5000000, coverageCapCAD: 20000, deductiblePct: 0, durationDays: 30, benefits: ['Emergency clinic & hospital bill reimbursement', 'Zero deductible checkups'] },
  { id: 'ins_business', category: 'business', name: 'Empire Venture Continuity', provider: 'AIICO Corporate', premiumNGN: 110000, premiumCAD: 220, coverageCapNGN: 40000000, coverageCapCAD: 85000, deductiblePct: 8, durationDays: 30, benefits: ['Inventory & supply chain recovery', 'Commercial liability protection'] },
  { id: 'ins_property', category: 'property', name: 'Real Estate Title & Landlord Guard', provider: 'Custodian PLC', premiumNGN: 95000, premiumCAD: 195, coverageCapNGN: 60000000, coverageCapCAD: 120000, deductiblePct: 10, durationDays: 30, benefits: ['Structural storm damage claim', 'Rental interruption compensation'] },
];

export interface InsurancePolicyRecord {
  id: string;
  uid: string;
  planId: string;
  category: InsuranceCategory;
  name: string;
  currency: 'NGN' | 'CAD';
  coverageCapMajor: number;
  deductiblePct: number;
  purchasedAt: number;
  expiresAt: number;
  claimsHistory: Array<{
    id: string;
    incidentKey: string;
    reason: string;
    requestedMajor: number;
    payoutMajor: number;
    status: 'APPROVED' | 'REJECTED';
    note: string;
    createdAt: number;
  }>;
}

export interface LifestyleState {
  rides: RideBookingRecord[];
  pets: OwnedPetRecord[];
  policies: InsurancePolicyRecord[];
}

export class LifestyleEngine {
  private filePath: string;
  public state: LifestyleState;

  constructor(dbDir: string) {
    this.filePath = path.resolve(dbDir, 'lifestyle_state.json');
    this.state = this.load();
  }

  private load(): LifestyleState {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      if (fs.existsSync(this.filePath)) {
        const parsed = JSON.parse(fs.readFileSync(this.filePath, 'utf-8'));
        return {
          rides: Array.isArray(parsed.rides) ? parsed.rides : [],
          pets: Array.isArray(parsed.pets) ? parsed.pets : [],
          policies: Array.isArray(parsed.policies) ? parsed.policies : [],
        };
      }
    } catch (err) {
      console.error('Error loading lifestyle state:', err);
    }
    return { rides: [], pets: [], policies: [] };
  }

  public save(): void {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      const tmp = `${this.filePath}.tmp`;
      fs.writeFileSync(tmp, JSON.stringify(this.state, null, 2), 'utf-8');
      fs.renameSync(tmp, this.filePath);
    } catch (err) {
      console.error('Error saving lifestyle state:', err);
    }
  }

  // ---- LAPTOPS & CODING CAREER ----
  public buyLaptop(params: {
    uid: string;
    laptopId: string;
    currency: 'NGN' | 'CAD';
    economy: EconomyEngine;
    requestId?: string;
  }): { ok: boolean; error?: string; account?: any } {
    const item = LAPTOP_CATALOG.find((l) => l.id === params.laptopId);
    if (!item) return { ok: false, error: 'Laptop model not found.' };
    const acc = params.economy.store.accountsByUid[params.uid];
    if (!acc) return { ok: false, error: 'Account not initialized.' };
    if (acc.ownedLaptops.includes(item.id)) {
      acc.activeLaptopId = item.id;
      params.economy.save();
      return { ok: true, account: acc };
    }
    const price = params.currency === 'CAD' ? item.priceCAD : item.priceNGN;
    const debit = params.economy.debitMinor({
      uid: params.uid,
      currency: params.currency,
      amountMinor: majorToMinor(price),
      title: `Device Store: ${item.name}`,
      category: 'luxury',
      recipientOrSender: `${item.brand} Authorized Store`,
      requestId: params.requestId,
    });
    if (!debit.ok || !debit.account) return { ok: false, error: debit.error };
    debit.account.ownedLaptops = [...debit.account.ownedLaptops, item.id];
    debit.account.activeLaptopId = item.id;
    params.economy.save();
    return { ok: true, account: debit.account };
  }

  public recordCodingCompletion(params: {
    uid: string;
    challengeId: string;
    xpGain: number;
    isCyberMission?: boolean;
    rewardNGN?: number;
    rewardCAD?: number;
    currency?: 'NGN' | 'CAD';
    economy: EconomyEngine;
  }): { ok: boolean; error?: string; account?: any; level: number; xp: number; cyberUnlocked: boolean } {
    const acc = params.economy.store.accountsByUid[params.uid];
    if (!acc) return { ok: false, error: 'Account not initialized.', level: 1, xp: 0, cyberUnlocked: false };

    if (params.isCyberMission && acc.codingLevel < 7) {
      return {
        ok: false,
        error: `Cybersecurity Defense Career unlocks at Coding Level 7 (current: Level ${acc.codingLevel}).`,
        level: acc.codingLevel,
        xp: acc.codingXp,
        cyberUnlocked: false,
      };
    }

    if (!acc.completedCodingChallenges.includes(params.challengeId)) {
      acc.completedCodingChallenges.push(params.challengeId);
      acc.codingXp += Math.max(25, Math.min(400, params.xpGain));
      acc.codingLevel = Math.max(1, Math.floor(acc.codingXp / 150) + 1);
    }

    if (params.isCyberMission && !acc.completedCyberMissions.includes(params.challengeId)) {
      acc.completedCyberMissions.push(params.challengeId);
      const curr: 'NGN' | 'CAD' = params.currency === 'CAD' ? 'CAD' : 'NGN';
      const bounty = curr === 'CAD' ? (params.rewardCAD || 350) : (params.rewardNGN || 180000);
      params.economy.creditMinor({
        uid: params.uid,
        currency: curr,
        amountMinor: majorToMinor(bounty),
        title: `Cyber Defense Bounty (${params.challengeId})`,
        category: 'career',
        recipientOrSender: 'Apex Cyber Defense Command',
        persist: false,
      });
    }
    params.economy.save();
    return {
      ok: true,
      account: acc,
      level: acc.codingLevel,
      xp: acc.codingXp,
      cyberUnlocked: acc.codingLevel >= 7,
    };
  }

  // ---- NAIJA RIDE ----
  public bookRide(params: {
    uid: string;
    companyId: RideCompanyDef['id'];
    pickup: string;
    destination: string;
    distanceKm: number;
    country: 'nigeria' | 'canada';
    economy: EconomyEngine;
    requestId?: string;
  }): { ok: boolean; error?: string; ride?: RideBookingRecord; account?: any } {
    const company = RIDE_COMPANIES.find((c) => c.id === params.companyId);
    if (!company) return { ok: false, error: 'Ride company not found.' };
    if (!params.pickup.trim() || !params.destination.trim()) {
      return { ok: false, error: 'Pickup and destination are required.' };
    }
    if (params.pickup.trim().toLowerCase() === params.destination.trim().toLowerCase()) {
      return { ok: false, error: 'Pickup and destination cannot be identical.' };
    }
    const km = Math.max(1.5, Math.min(80, Number(params.distanceKm) || 6));
    const currency: 'NGN' | 'CAD' = params.country === 'canada' ? 'CAD' : 'NGN';
    const fareMajor =
      currency === 'CAD'
        ? Number((company.baseCAD + company.perUnitCAD * km).toFixed(2))
        : Math.round(company.baseNGN + company.perUnitNGN * km);

    const debit = params.economy.debitMinor({
      uid: params.uid,
      currency,
      amountMinor: majorToMinor(fareMajor),
      title: `${company.name} Ride: ${params.pickup} -> ${params.destination}`,
      category: 'general',
      recipientOrSender: `${company.name} Mobility`,
      requestId: params.requestId,
    });
    if (!debit.ok) return { ok: false, error: debit.error };

    const drivers = ['Tunde Adeyemi', 'Chukwuemeka Obi', 'Ibrahim Musa', 'Liam Tremblay', 'Amara Nwosu'];
    const driverName = drivers[Math.floor(Math.random() * drivers.length)];
    const ride: RideBookingRecord = {
      id: `ride_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
      uid: params.uid,
      companyId: company.id,
      companyName: company.name,
      country: params.country,
      pickup: params.pickup.trim(),
      destination: params.destination.trim(),
      distanceKm: km,
      fareMajor,
      currency,
      status: 'DRIVER_EN_ROUTE',
      driverName,
      vehiclePlate: params.country === 'canada' ? `ON-${Math.floor(1000 + Math.random() * 8999)}` : `LND-${Math.floor(100 + Math.random() * 899)}KY`,
      createdAt: Date.now(),
    };
    this.state.rides.unshift(ride);
    this.save();
    return { ok: true, ride, account: debit.account };
  }

  public advanceRideStatus(uid: string, rideId: string, status: RideBookingRecord['status']): { ok: boolean; ride?: RideBookingRecord } {
    const ride = this.state.rides.find((r) => r.id === rideId && r.uid === uid);
    if (!ride) return { ok: false };
    ride.status = status;
    this.save();
    return { ok: true, ride };
  }

  // ---- 3D PETS ----
  public buyPet(params: {
    uid: string;
    speciesId: string;
    petName: string;
    currency: 'NGN' | 'CAD';
    economy: EconomyEngine;
    requestId?: string;
  }): { ok: boolean; error?: string; pet?: OwnedPetRecord; account?: any } {
    const spec = PET_CATALOG.find((p) => p.id === params.speciesId);
    if (!spec) return { ok: false, error: 'Pet breed not found.' };
    const cleanName = String(params.petName || '').trim().slice(0, 28) || spec.name.split(' ')[0];
    const price = params.currency === 'CAD' ? spec.priceCAD : spec.priceNGN;

    const debit = params.economy.debitMinor({
      uid: params.uid,
      currency: params.currency,
      amountMinor: majorToMinor(price),
      title: `Pet Adoption: ${cleanName} (${spec.name})`,
      category: 'lifestyle',
      recipientOrSender: 'Naija Paws & Companion Guild',
      requestId: params.requestId,
    });
    if (!debit.ok) return { ok: false, error: debit.error };

    const pet: OwnedPetRecord = {
      id: `pet_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
      uid: params.uid,
      speciesId: spec.id,
      species: spec.species,
      breedName: spec.name,
      petName: cleanName,
      primaryColor: spec.primaryColor,
      secondaryColor: spec.secondaryColor,
      accentColor: spec.accentColor,
      hunger: 85,
      happiness: 90,
      health: 100,
      energy: 90,
      ageDays: 1,
      adoptedAt: Date.now(),
      lastCareAt: Date.now(),
    };
    this.state.pets.unshift(pet);
    this.save();
    return { ok: true, pet, account: debit.account };
  }

  public carePet(params: {
    uid: string;
    petId: string;
    action: 'feed' | 'play' | 'groom' | 'vet';
    currency: 'NGN' | 'CAD';
    economy: EconomyEngine;
  }): { ok: boolean; error?: string; pet?: OwnedPetRecord; account?: any } {
    const pet = this.state.pets.find((p) => p.id === params.petId && p.uid === params.uid);
    if (!pet) return { ok: false, error: 'Pet not found in your care.' };

    const costs: Record<string, { ngn: number; cad: number; label: string }> = {
      feed: { ngn: 3500, cad: 8, label: 'Premium Pet Feed' },
      play: { ngn: 2000, cad: 5, label: 'Interactive Toy & Park Session' },
      groom: { ngn: 8500, cad: 22, label: 'Luxury Pet Grooming Spa' },
      vet: { ngn: 15000, cad: 45, label: 'Veterinary Wellness Checkup' },
    };
    const cfg = costs[params.action] || costs.feed;
    const cost = params.currency === 'CAD' ? cfg.cad : cfg.ngn;
    const debit = params.economy.debitMinor({
      uid: params.uid,
      currency: params.currency,
      amountMinor: majorToMinor(cost),
      title: `Pet Care (${pet.petName}): ${cfg.label}`,
      category: 'lifestyle',
      recipientOrSender: 'Naija Paws Veterinary & Care',
    });
    if (!debit.ok) return { ok: false, error: debit.error };

    if (params.action === 'feed') {
      pet.hunger = Math.min(100, pet.hunger + 30);
      pet.energy = Math.min(100, pet.energy + 10);
    } else if (params.action === 'play') {
      pet.happiness = Math.min(100, pet.happiness + 28);
      pet.hunger = Math.max(10, pet.hunger - 8);
      pet.energy = Math.max(15, pet.energy - 12);
    } else if (params.action === 'groom') {
      pet.happiness = Math.min(100, pet.happiness + 18);
      pet.health = Math.min(100, pet.health + 12);
    } else if (params.action === 'vet') {
      pet.health = 100;
      pet.energy = Math.min(100, pet.energy + 15);
    }
    pet.lastCareAt = Date.now();
    this.save();
    return { ok: true, pet, account: debit.account };
  }

  // ---- INSURANCE ----
  public buyPolicy(params: {
    uid: string;
    planId: string;
    currency: 'NGN' | 'CAD';
    economy: EconomyEngine;
    requestId?: string;
  }): { ok: boolean; error?: string; policy?: InsurancePolicyRecord; account?: any } {
    const plan = INSURANCE_PLANS.find((p) => p.id === params.planId);
    if (!plan) return { ok: false, error: 'Insurance plan not found.' };

    const now = Date.now();
    const existingActive = this.state.policies.find(
      (p) => p.uid === params.uid && p.planId === plan.id && p.expiresAt > now
    );
    if (existingActive) {
      return { ok: false, error: `You already hold an active ${plan.name} policy.` };
    }

    const premium = params.currency === 'CAD' ? plan.premiumCAD : plan.premiumNGN;
    const cap = params.currency === 'CAD' ? plan.coverageCapCAD : plan.coverageCapNGN;
    const debit = params.economy.debitMinor({
      uid: params.uid,
      currency: params.currency,
      amountMinor: majorToMinor(premium),
      title: `Insurance Policy: ${plan.name}`,
      category: 'general',
      recipientOrSender: plan.provider,
      requestId: params.requestId,
    });
    if (!debit.ok) return { ok: false, error: debit.error };

    const policy: InsurancePolicyRecord = {
      id: `pol_${now}_${Math.random().toString(36).slice(2, 5)}`,
      uid: params.uid,
      planId: plan.id,
      category: plan.category,
      name: plan.name,
      currency: params.currency,
      coverageCapMajor: cap,
      deductiblePct: plan.deductiblePct,
      purchasedAt: now,
      expiresAt: now + plan.durationDays * 24 * 60 * 60 * 1000,
      claimsHistory: [],
    };
    this.state.policies.unshift(policy);
    this.save();
    return { ok: true, policy, account: debit.account };
  }

  public submitClaim(params: {
    uid: string;
    policyId: string;
    incidentKey: string;
    reason: string;
    requestedMajor: number;
    hasMatchingAsset: boolean;
    economy: EconomyEngine;
  }): { ok: boolean; error?: string; payoutMajor?: number; policy?: InsurancePolicyRecord; account?: any } {
    const policy = this.state.policies.find((p) => p.id === params.policyId && p.uid === params.uid);
    if (!policy) return { ok: false, error: 'Insurance policy not found.' };

    const now = Date.now();
    if (policy.expiresAt <= now) {
      return { ok: false, error: 'Claim rejected: Policy has expired. Renew your coverage first.' };
    }

    const cleanIncident = String(params.incidentKey || '').trim().toLowerCase();
    if (!cleanIncident) {
      return { ok: false, error: 'Valid incident reference is required.' };
    }

    if (policy.claimsHistory.some((c) => c.incidentKey === cleanIncident && c.status === 'APPROVED')) {
      return { ok: false, error: 'Duplicate claim rejected: Incident already reimbursed under this policy.' };
    }

    // Asset ownership enforcement for asset-backed plans
    if (['vehicle', 'business', 'property'].includes(policy.category) && !params.hasMatchingAsset) {
      policy.claimsHistory.unshift({
        id: `clm_${now}`,
        incidentKey: cleanIncident,
        reason: params.reason,
        requestedMajor: params.requestedMajor,
        payoutMajor: 0,
        status: 'REJECTED',
        note: `No owned ${policy.category} asset verified on account.`,
        createdAt: now,
      });
      this.save();
      return {
        ok: false,
        error: `Claim rejected: Account must own an eligible ${policy.category} asset to claim ${policy.name}.`,
        policy,
      };
    }

    const reqAmt = Number(params.requestedMajor);
    if (!Number.isFinite(reqAmt) || reqAmt <= 0 || reqAmt > policy.coverageCapMajor) {
      return {
        ok: false,
        error: `Claim amount must be between 1 and policy cap (${policy.coverageCapMajor.toLocaleString()} ${policy.currency}).`,
      };
    }

    const netPayout = Number((reqAmt * (1 - policy.deductiblePct / 100)).toFixed(2));
    const credit = params.economy.creditMinor({
      uid: params.uid,
      currency: policy.currency,
      amountMinor: majorToMinor(netPayout),
      title: `Insurance Claim Settlement: ${policy.name}`,
      category: 'general',
      recipientOrSender: 'Insurance Underwriting Claims Desk',
    });
    if (!credit.ok) return { ok: false, error: credit.error };

    policy.claimsHistory.unshift({
      id: `clm_${now}`,
      incidentKey: cleanIncident,
      reason: params.reason.slice(0, 140),
      requestedMajor: reqAmt,
      payoutMajor: netPayout,
      status: 'APPROVED',
      note: `Settled after ${policy.deductiblePct}% deductible.`,
      createdAt: now,
    });
    this.save();
    return { ok: true, payoutMajor: netPayout, policy, account: credit.account };
  }
}
