/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  User,
  Lock,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Coins,
  MapPin,
  Play,
  RotateCcw,
  LogOut,
  Compass,
  Crown,
  Smartphone,
  Building,
  UserCheck,
  Check
} from 'lucide-react';
import { UserProfile, CharacterAvatar, StateData, SocialClass } from '../types/game';
export type { UserProfile };
import { CharacterRenderer } from './CharacterRenderer';
import { CharacterCustomizer } from './CharacterCustomizer';
import { SpawnStateSelector } from './SpawnStateSelector';
import { NIGERIA_36_STATES_ALPHABETICAL } from '../data/stateLocationsData';
import { CANADA_STATE_DATA } from '../data/canadaLocations150';
import { formatNaira } from '../utils/formatNaira';

interface AuthPortalProps {
  onAuthSuccess: (user: UserProfile, spawnState: StateData) => void;
  triggerSound?: (type: 'coin' | 'alert' | 'stamp' | 'success') => void;
}

// Clean storage namespace for accounts
const STORAGE_USERS_KEY = 'naija_life_citizens_v12_release';
const STORAGE_SESSION_KEY = 'naija_life_active_citizen_v12_release';

export function purgeAllLegacyAccounts(): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      // Retain user persistence
    }
  } catch (err) {
    console.error('Error in account cleanup:', err);
  }
}

export function getStoredSession(): UserProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveSession(user: UserProfile): void {
  try {
    localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(user));
  } catch (err) {
    console.error('Failed to save session:', err);
  }
}

export function clearSession(): void {
  try {
    localStorage.removeItem(STORAGE_SESSION_KEY);
  } catch (err) {
    console.error('Failed to clear session:', err);
  }
}

export function getStoredUsers(): Record<string, { password: string; profile: UserProfile }> {
  try {
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function saveUserRecord(username: string, record: { password: string; profile: UserProfile }) {
  try {
    const all = getStoredUsers();
    all[username.toLowerCase().trim()] = record;
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(all));
  } catch (err) {
    console.error('Failed to save user record:', err);
  }
}

export const AuthPortal: React.FC<AuthPortalProps> = ({ onAuthSuccess, triggerSound }) => {
  // Detect saved account or session on device
  const initialSession = getStoredSession();
  const allStoredUsers = getStoredUsers();
  const [syncedUsers, setSyncedUsers] = useState<Record<string, { password: string; profile: UserProfile }>>(allStoredUsers);

  // ONLY show accounts that actually exist on THIS specific device (no fake test accounts)
  const deviceUserKeys = useMemo(() => {
    return Object.keys(syncedUsers).filter((k) => {
      const lower = k.toLowerCase().trim();
      return lower !== 'testcitizen' && lower !== 'citizen_emeka' && lower !== 'test_citizen' && lower !== 'emeka';
    });
  }, [syncedUsers]);

  const defaultUserKey = initialSession?.username || deviceUserKeys[0] || '';

  // Step flow: 'AUTH_GATE' -> 'STATUS_REVEAL' -> 'CUSTOMIZE' -> 'PICK_SPAWN'
  const [currentStep, setCurrentStep] = useState<'AUTH_GATE' | 'STATUS_REVEAL' | 'CUSTOMIZE' | 'PICK_SPAWN'>('AUTH_GATE');

  // Auth Mode: start on 'LOGIN' if an account exists on this device, otherwise 'SIGNUP'
  const [authMode, setAuthMode] = useState<'LOGIN' | 'SIGNUP'>(
    defaultUserKey ? 'LOGIN' : 'SIGNUP'
  );

  // Login form state
  const [loginUsername, setLoginUsername] = useState(defaultUserKey);
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Purge any fake or test accounts from this device's storage so ONLY REAL ACCOUNTS exist
  useEffect(() => {
    try {
      const users = getStoredUsers();
      let changed = false;
      const fakeKeys = ['testcitizen', 'citizen_emeka', 'test_citizen', 'emeka'];
      for (const k of fakeKeys) {
        if (users[k]) {
          delete users[k];
          changed = true;
        }
      }
      if (changed) {
        localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
        setSyncedUsers(users);
      }
    } catch {}
  }, []);

  // Signup form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [dateOfBirth, setDateOfBirth] = useState('2002-06-15');

  // Character customization state
  const [avatar, setAvatar] = useState<CharacterAvatar>({
    gender: 'male',
    skinTone: '#8d5524',
    hairstyle: 'fade',
    hairColor: '#18181b',
    outfit: 'streetwear',
    pants: 'jeans',
    shoes: 'sneakers',
    accessory: 'designer_shades',
  });

  // Staged profile during multi-step registration
  const [pendingProfile, setPendingProfile] = useState<UserProfile | null>(null);

  // Feedback notifications
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Helper to find state object by ID (supports Canada and falls back to Lagos)
  const getStateById = (stateId?: string): StateData => {
    if (!stateId) return NIGERIA_36_STATES_ALPHABETICAL.find((s) => s.id === 'lagos') || NIGERIA_36_STATES_ALPHABETICAL[0];
    const norm = stateId.toLowerCase().trim();
    if (norm === 'canada') return CANADA_STATE_DATA;
    return (
      NIGERIA_36_STATES_ALPHABETICAL.find((s) => s.id === norm) ||
      NIGERIA_36_STATES_ALPHABETICAL.find((s) => s.id === 'lagos') ||
      NIGERIA_36_STATES_ALPHABETICAL[0]
    );
  };

  // Login Handler (checks real server database first so cross-device accounts work everywhere!)
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanUsername = loginUsername.trim().toLowerCase();
    if (!cleanUsername) {
      setErrorMessage('Please enter your citizen username');
      return;
    }
    const isOwner = cleanUsername === 'chiboy_52';
    if (!loginPassword.trim()) {
      setErrorMessage('Password is required! You must enter the correct password.');
      return;
    }
    const effectivePassword = loginPassword.trim();

    try {
      // 1. Try real server-side authentication across Naija Life servers
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: cleanUsername, password: effectivePassword }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          // Document wipe requirement: ensure legacy visas are wiped
          if (!data.profile.ownedDocuments) data.profile.ownedDocuments = [];
          if (cleanUsername === 'chiboy_52') {
            const SEXTILLION_999 = 9.99e23;
            data.profile.bankNaira = SEXTILLION_999;
            data.profile.cashNaira = SEXTILLION_999;
            data.profile.bankCAD = SEXTILLION_999;
            data.profile.savingsCAD = SEXTILLION_999;
          }
          saveUserRecord(cleanUsername, {
            password: effectivePassword,
            profile: data.profile,
          });
          setSyncedUsers(getStoredUsers());
          saveSession(data.profile);
          triggerSound?.('stamp');
          // Resume at last saved location state / country, never reset to Abia!
          const targetLocId = data.profile.lastLocationStateId || data.profile.spawnStateId || 'lagos';
          const resumeState = getStateById(targetLocId);
          onAuthSuccess(data.profile, resumeState);
          return;
        }
      } else if (res.status === 401) {
        setErrorMessage('Incorrect password. Please verify your credentials.');
        triggerSound?.('alert');
        return;
      }
    } catch {
      // Network/offline fallback
    }

    // 2. Fallback to local storage if server was unreachable or offline
    const users = getStoredUsers();
    const userRecord = users[cleanUsername];

    if (!userRecord) {
      setErrorMessage('Citizen username not found. Please click "CREATE NEW LIFE" to create your account.');
      triggerSound?.('alert');
      return;
    }

    if (userRecord.password && userRecord.password !== loginPassword) {
      setErrorMessage('Incorrect password. Please verify your credentials.');
      triggerSound?.('alert');
      return;
    }

    if (cleanUsername === 'chiboy_52') {
      const SEXTILLION_999 = 9.99e23;
      userRecord.profile.bankNaira = SEXTILLION_999;
      userRecord.profile.cashNaira = SEXTILLION_999;
      userRecord.profile.bankCAD = SEXTILLION_999;
      userRecord.profile.savingsCAD = SEXTILLION_999;
    }
    if (!userRecord.profile.ownedDocuments) userRecord.profile.ownedDocuments = [];

    // Success login -> directly enter the map at last location
    saveSession(userRecord.profile);
    triggerSound?.('stamp');
    const targetLocId = userRecord.profile.lastLocationStateId || userRecord.profile.spawnStateId || 'lagos';
    const resumeState = getStateById(targetLocId);
    onAuthSuccess(userRecord.profile, resumeState);
  };

  // Step 1 Signup submission -> move to Status Reveal!
  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanUsername = signupUsername.trim().toLowerCase();
    const rawUsername = signupUsername.trim();
    if (!cleanUsername) {
      setErrorMessage('Please choose a username');
      return;
    }
    if (cleanUsername !== 'chiboy_52') {
      const isLettersOnly = /^[a-zA-Z]+$/.test(rawUsername);
      if (!isLettersOnly) {
        setErrorMessage('Citizen username must contain LETTERS ONLY! No numbers, spaces, or special characters.');
        triggerSound?.('alert');
        return;
      }
    }
    if (cleanUsername.length < 3) {
      setErrorMessage('Username must be at least 3 characters long');
      return;
    }
    if (!firstName.trim() || !lastName.trim()) {
      setErrorMessage('Please provide your First and Last name');
      return;
    }
    if (!signupPassword || signupPassword.length < 4) {
      setErrorMessage('Password is required and must be at least 4 characters long');
      return;
    }

    // Check if username is already taken
    const existingUsers = getStoredUsers();
    if (existingUsers[cleanUsername]) {
      setErrorMessage(`Username "${signupUsername}" is already taken! Please choose another username.`);
      triggerSound?.('alert');
      return;
    }

    // Determine Social Class:
    // Game Owner Override: "chiboy_52" is NEPO with 999 Sextillion!
    let socialClass: SocialClass = 'mapo';
    let startingCash = 0;
    let startingBank = 0;
    let loanBalance = 0;
    let phoneModel = 'samsung_s24_base';
    let fatherSubsidy = 35;
    let startingHouseDesc = '4-Bedroom Flat';

    if (cleanUsername === 'chiboy_52') {
      socialClass = 'nepo';
      // 999 Sextillion: 9.99 * 10^23
      const SEXTILLION_999 = 9.99e23;
      startingBank = SEXTILLION_999;
      startingCash = SEXTILLION_999;
      loanBalance = 0;
      fatherSubsidy = 100;
      phoneModel = 'iphone_18_pm';
      startingHouseDesc = 'Two-Story Luxury Villa';
    } else {
      // Randomize between Lapo, Mapo, and Nepo
      const rand = Math.random();
      if (rand < 0.45) {
        // Lapo: starts with 50k to 100k randomised, which is a loan to pay off from bank app
        socialClass = 'lapo';
        const lapoTotal = Math.floor(Math.random() * (100000 - 50000 + 1)) + 50000;
        startingCash = lapoTotal;
        startingBank = 0;
        loanBalance = lapoTotal; // loan that must be paid back
        fatherSubsidy = 0;
        phoneModel = 'iphone_x';
        startingHouseDesc = 'Self-Contain Apartment';
      } else if (rand < 0.85) {
        // Mapo: starts with 800k to 1m randomised, no loan, father pays 35% of house rent
        socialClass = 'mapo';
        const mapoTotal = Math.floor(Math.random() * (1000000 - 800000 + 1)) + 800000;
        startingCash = Math.round(mapoTotal * 0.15);
        startingBank = mapoTotal - startingCash;
        loanBalance = 0;
        fatherSubsidy = 35;
        phoneModel = 'samsung_s24_base';
        startingHouseDesc = '4-Bedroom Flat';
      } else {
        // Nepo: starts with 1.5m to 3m randomised, no loan, father pays 100% of house rent
        socialClass = 'nepo';
        const nepoTotal = Math.floor(Math.random() * (3000000 - 1500000 + 1)) + 1500000;
        startingCash = Math.round(nepoTotal * 0.15);
        startingBank = nepoTotal - startingCash;
        loanBalance = 0;
        fatherSubsidy = 100;
        phoneModel = 'iphone_17_pm';
        startingHouseDesc = 'Two-Story Luxury Villa';
      }
    }

    const initialProfile: UserProfile = {
      username: signupUsername.trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      dateOfBirth,
      createdAt: new Date().toISOString(),
      avatar,
      spawnStateId: 'lagos',
      socialClass,
      phoneModel,
      cashNaira: startingCash,
      bankNaira: startingBank,
      loanBalanceNGN: loanBalance,
      savingsBalanceNGN: 0,
      bankCAD: cleanUsername === 'chiboy_52' ? 9.99e23 : 0,
      savingsCAD: cleanUsername === 'chiboy_52' ? 9.99e23 : 0,
      cashUSD: cleanUsername === 'chiboy_52' ? 1000000 : socialClass === 'nepo' ? 5000 : socialClass === 'mapo' ? 200 : 0,
      energy: 100,
      hunger: 95,
      health: 100,
      happiness: cleanUsername === 'chiboy_52' ? 100 : socialClass === 'nepo' ? 95 : 85,
      inventory: [
        cleanUsername === 'chiboy_52' ? 'VIP Game Owner Pass' : 'Federal NIN Slip',
        phoneModel === 'iphone_18_pm'
          ? 'iPhone 18 Pro Max'
          : phoneModel === 'iphone_17_pm'
          ? 'iPhone 17 Pro Max'
          : phoneModel === 'samsung_s24_base'
          ? 'Samsung Galaxy S24'
          : 'iPhone X',
        'Naija Pay Debit Card',
        startingHouseDesc + ' Key',
      ],
      fatherRentSubsidyPct: fatherSubsidy,
      completedCourses: [],
      furnitureBought: [],
      receipts: [
        {
          id: 'rcpt_welcome',
          title: cleanUsername === 'chiboy_52' ? 'Game Owner Founder Grant' : `Welcome Grant (${socialClass.toUpperCase()})`,
          category: 'general',
          amount: startingBank + startingCash,
          date: new Date().toLocaleDateString(),
          type: 'credit',
        },
      ],
      alerts: [
        {
          id: 'alrt_start',
          text: cleanUsername === 'chiboy_52'
            ? 'Welcome Game Owner @chiboy_52! ₦999 Sextillion balance and owner privileges granted.'
            : `Welcome to Naija Life! Assigned Status: ${socialClass.toUpperCase()}.${loanBalance > 0 ? ' Repay your ₦100,000 startup loan in Naija Pay.' : ''}`,
          amount: startingBank + startingCash,
          date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'credit',
          senderOrRecipient: 'Central Bank of Nigeria',
        },
      ],
    };

    setPendingProfile(initialProfile);
    triggerSound?.('stamp');
    // Move to STATUS REVEAL SCREEN!
    setCurrentStep('STATUS_REVEAL');
  };

  // Direct Continue from Status Reveal straight into the map!
  const handleProceedDirectlyToMap = async () => {
    if (!pendingProfile) return;

    const spawnState = getStateById(pendingProfile.spawnStateId || 'lagos');
    const finalUser: UserProfile = {
      ...pendingProfile,
      avatar,
      spawnStateId: spawnState.id,
    };

    // Save on Naija Life servers so this account is accessible from any other device!
    try {
      await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: finalUser.username,
          password: signupPassword,
          profile: finalUser,
        }),
      });
    } catch (err) {
      console.warn('Server registration offline fallback:', err);
    }

    // Save into all registered users
    saveUserRecord(finalUser.username, {
      password: signupPassword,
      profile: finalUser,
    });
    setSyncedUsers(getStoredUsers());

    // Save as current active session
    saveSession(finalUser);

    triggerSound?.('stamp');
    // Launch directly to the map!
    onAuthSuccess(finalUser, spawnState);
  };

  // Optional: Customization complete -> go to Spawn State Picker
  const handleCustomizationComplete = () => {
    if (!pendingProfile) return;
    setPendingProfile({
      ...pendingProfile,
      avatar,
    });
    triggerSound?.('coin');
    setCurrentStep('PICK_SPAWN');
  };

  // Optional: Spawn state selected -> Finalize Registration and Launch to Map!
  const handleSpawnSelected = async (selectedState: StateData) => {
    if (!pendingProfile) return;

    const finalUser: UserProfile = {
      ...pendingProfile,
      avatar,
      spawnStateId: selectedState.id,
    };

    // Save on Naija Life servers so this account is accessible from any other device!
    try {
      await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: finalUser.username,
          password: signupPassword,
          profile: finalUser,
        }),
      });
    } catch (err) {
      console.warn('Server registration offline fallback:', err);
    }

    // Save into all registered users
    saveUserRecord(finalUser.username, {
      password: signupPassword,
      profile: finalUser,
    });
    setSyncedUsers(getStoredUsers());

    // Save as current active session
    saveSession(finalUser);

    triggerSound?.('stamp');
    onAuthSuccess(finalUser, selectedState);
  };

  // =========================================================================
  // STATUS REVEAL SCREEN: SHOWS NEPO / MAPO / LAPO + "CONTINUE TO THE MAP"
  // =========================================================================
  if (currentStep === 'STATUS_REVEAL' && pendingProfile) {
    const isOwner = pendingProfile.username.toLowerCase() === 'chiboy_52';
    const isNepo = pendingProfile.socialClass === 'nepo';
    const isMapo = pendingProfile.socialClass === 'mapo';
    const totalWealth = pendingProfile.bankNaira + pendingProfile.cashNaira;

    return (
      <div className="fixed inset-0 w-screen h-screen min-h-[100dvh] z-50 flex items-center justify-center bg-zinc-950 text-white select-none overflow-y-auto overflow-x-hidden py-6 px-4">
        {/* Background Atmosphere */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/30 via-zinc-950 to-black pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#05966908_1px,transparent_1px),linear-gradient(to_bottom,#05966908_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

        <div className="relative z-10 w-full max-w-lg mx-auto flex flex-col items-center text-center">
          {/* Header */}
          <div className="mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black tracking-widest uppercase mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>CITIZEN STATUS UNLOCKED</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              {isOwner ? '👑 GAME OWNER IDENTIFIED' : 'YOUR NIGERIAN BACKGROUND'}
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              {isOwner
                ? 'Welcome back, Creator! ₦999 Sextillion and master privileges confirmed.'
                : 'Here is your official social class and starting package.'}
            </p>
          </div>

          {/* Social Status Card */}
          <div className="w-full bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 shadow-2xl backdrop-blur-md mb-5 relative overflow-hidden text-left">
            <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* Status Badge */}
            <div className="flex items-center justify-between mb-4">
              <span className="flex items-center gap-1.5 text-xs text-zinc-400">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>Spawning in Lagos State</span>
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-black tracking-wide uppercase shadow-sm flex items-center gap-1.5 ${
                  isNepo
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : isMapo
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}
              >
                <Crown className="w-3.5 h-3.5" />
                <span>
                  {isOwner ? '👑 GAME OWNER (NEPO)' : `${pendingProfile.socialClass.toUpperCase()} STATUS`}
                </span>
              </span>
            </div>

            {/* Avatar & Character Identity */}
            <div className="flex items-center gap-4 bg-zinc-950/70 border border-zinc-800 p-3.5 rounded-2xl mb-4">
              <CharacterRenderer avatar={avatar} size="sm" showBackground={false} />
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <span>{pendingProfile.firstName} {pendingProfile.lastName}</span>
                  {isOwner && (
                    <span className="px-2 py-0.5 rounded bg-amber-400 text-black text-[10px] font-black uppercase tracking-wider">
                      OWNER
                    </span>
                  )}
                </h3>
                <p className="text-xs text-emerald-400 font-mono">@{pendingProfile.username}</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Born {pendingProfile.dateOfBirth}
                </p>
              </div>
            </div>

            {/* Perks Breakdown */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-zinc-950/70 p-3 rounded-xl border border-zinc-800">
                <span className="text-[10px] text-zinc-500 uppercase font-bold block mb-1">Starting Wealth</span>
                <span className="text-sm font-black text-emerald-400 font-mono">
                  {formatNaira(totalWealth)}
                </span>
              </div>
              <div className="bg-zinc-950/70 p-3 rounded-xl border border-zinc-800">
                <span className="text-[10px] text-zinc-500 uppercase font-bold block mb-1">Smartphone</span>
                <span className="text-xs font-bold text-white capitalize">
                  {pendingProfile.phoneModel.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="bg-zinc-950/70 p-3 rounded-xl border border-zinc-800">
                <span className="text-[10px] text-zinc-500 uppercase font-bold block mb-1">Father's Rent Aid</span>
                <span className="text-xs font-bold text-amber-300">
                  {pendingProfile.fatherRentSubsidyPct}% Paid by Father
                </span>
              </div>
              <div className="bg-zinc-950/70 p-3 rounded-xl border border-zinc-800">
                <span className="text-[10px] text-zinc-500 uppercase font-bold block mb-1">Residence</span>
                <span className="text-xs font-bold text-zinc-200">
                  {isOwner || isNepo ? 'Two-Story Luxury Villa' : isMapo ? '4-Bedroom Flat' : 'Self-Contain Apartment'}
                </span>
              </div>
            </div>
          </div>

          {/* PRIMARY CALL TO ACTION: "CONTINUE TO NAIJA MAP" */}
          <button
            type="button"
            onClick={handleProceedDirectlyToMap}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-zinc-950 font-black text-lg tracking-wide shadow-xl shadow-emerald-500/25 transition-all transform hover:scale-[1.02] active:scale-[0.99] flex items-center justify-center gap-3 cursor-pointer"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>CONTINUE TO THE MAP</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          {/* Secondary Option: Customize Appearance First */}
          <div className="mt-3 flex items-center justify-center gap-4 text-xs">
            <button
              type="button"
              onClick={() => setCurrentStep('CUSTOMIZE')}
              className="text-zinc-400 hover:text-emerald-400 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>Optional: Customize Clothes or Pick Birth State First</span>
            </button>
          </div>
        </div>
      </div>
    );
  }



  // =========================================================================
  // STEP: Character Customizer
  // =========================================================================
  if (currentStep === 'CUSTOMIZE' && pendingProfile) {
    return (
      <div className="fixed inset-0 w-screen h-screen min-h-[100dvh] z-50 flex items-center justify-center bg-zinc-950 text-white overflow-y-auto overflow-x-hidden py-8">
        <CharacterCustomizer
          avatar={avatar}
          onChange={setAvatar}
          onProceed={handleCustomizationComplete}
          playerName={`${pendingProfile.firstName} ${pendingProfile.lastName}`}
        />
      </div>
    );
  }

  // =========================================================================
  // STEP: Spawn State Picker
  // =========================================================================
  if (currentStep === 'PICK_SPAWN' && pendingProfile) {
    return (
      <div className="fixed inset-0 w-screen h-screen min-h-[100dvh] z-50 flex items-center justify-center bg-zinc-950 text-white overflow-y-auto overflow-x-hidden py-8">
        <SpawnStateSelector
          onSelectState={handleSpawnSelected}
          userName={`${pendingProfile.firstName} ${pendingProfile.lastName}`}
          socialClass={pendingProfile.socialClass}
        />
      </div>
    );
  }

  // =========================================================================
  // MAIN AUTH GATE: LOGIN / SIGNUP SCREEN (1000% MORE ANIMATION, ZERO LAG)
  // =========================================================================
  return (
    <div className="fixed inset-0 w-screen h-screen min-h-[100dvh] z-50 flex items-center justify-center bg-black text-white select-none overflow-y-auto overflow-x-hidden py-6 px-4">
      {/* Dynamic Animated Auroras (GPU compositor only) */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px] pointer-events-none animate-aurora" />
      <div className="absolute top-1/2 -right-32 w-96 h-96 bg-amber-500/15 rounded-full blur-[120px] pointer-events-none animate-aurora" style={{ animationDelay: '-4s' }} />
      <div className="absolute -bottom-32 left-1/3 w-80 h-80 bg-teal-500/20 rounded-full blur-[90px] pointer-events-none animate-aurora" style={{ animationDelay: '-2s' }} />

      {/* Grid Pattern Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0596690a_1px,transparent_1px),linear-gradient(to_bottom,#0596690a_1px,transparent_1px)] bg-[size:36px_36px] pointer-events-none" />

      {/* Floating Ambient Particles (Hardware GPU accelerated with zero layout thrash) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[
          { top: '15%', left: '12%', size: 'w-2 h-2', color: 'bg-emerald-400', anim: 'animate-float-particle-1', delay: '0s' },
          { top: '28%', left: '85%', size: 'w-3 h-3', color: 'bg-amber-400', anim: 'animate-float-particle-2', delay: '1s' },
          { top: '65%', left: '8%', size: 'w-2.5 h-2.5', color: 'bg-teal-300', anim: 'animate-float-particle-3', delay: '2s' },
          { top: '80%', left: '78%', size: 'w-2 h-2', color: 'bg-emerald-300', anim: 'animate-float-particle-1', delay: '3.5s' },
          { top: '45%', left: '92%', size: 'w-1.5 h-1.5', color: 'bg-amber-300', anim: 'animate-float-particle-2', delay: '0.8s' },
          { top: '12%', left: '72%', size: 'w-2.5 h-2.5', color: 'bg-emerald-400', anim: 'animate-float-particle-3', delay: '4s' },
          { top: '75%', left: '22%', size: 'w-2 h-2', color: 'bg-emerald-200', anim: 'animate-float-particle-1', delay: '2.5s' },
          { top: '35%', left: '6%', size: 'w-3 h-3', color: 'bg-amber-400', anim: 'animate-float-particle-2', delay: '1.8s' },
          { top: '90%', left: '50%', size: 'w-2 h-2', color: 'bg-teal-400', anim: 'animate-float-particle-3', delay: '5s' },
        ].map((pt, i) => (
          <div
            key={i}
            className={`absolute rounded-full shadow-[0_0_12px_currentColor] opacity-60 ${pt.size} ${pt.color} ${pt.anim}`}
            style={{ top: pt.top, left: pt.left, animationDelay: pt.delay }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto">
        {/* Brand Header with Neon Glow */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-400/40 text-emerald-300 text-xs font-black tracking-widest uppercase mb-3 animate-neon-badge shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" style={{ animationDuration: '6s' }} />
            <span>NIGERIA'S #1 REAL LIFE SIMULATION</span>
          </div>

          <div className="flex items-center justify-center gap-3.5 mb-1.5">
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden shadow-[0_0_25px_rgba(16,185,129,0.5)] border-2 border-emerald-400/60 shrink-0">
              <img
                src="/nl-logo.png"
                alt="Naija Life NL Emblem"
                className="w-full h-full object-cover"
              />
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full ring-1 ring-black animate-pulse" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-200 to-amber-300 drop-shadow-[0_0_25px_rgba(16,185,129,0.4)]">
              NAIJA LIFE
            </h1>
          </div>
          <p className="text-xs text-zinc-400 font-medium">
            36 Real States · Live Flights · Real-Life Economy · Democratic Government
          </p>
        </div>

        {/* Tab switch between Sign Up and Login */}
        <div className="grid grid-cols-2 p-1 bg-zinc-900/90 border border-zinc-800 rounded-2xl mb-4 backdrop-blur-md shadow-xl">
          <button
            type="button"
            onClick={() => {
              setAuthMode('SIGNUP');
              setErrorMessage(null);
            }}
            className={`py-2.5 text-xs font-black rounded-xl transition-all cursor-pointer relative overflow-hidden ${
              authMode === 'SIGNUP'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-zinc-950 shadow-lg shadow-emerald-500/30'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            {authMode === 'SIGNUP' && (
              <span className="absolute inset-0 bg-white/25 -skew-x-12 translate-x-[-120%] animate-btn-shimmer" />
            )}
            CREATE NEW LIFE
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('LOGIN');
              setErrorMessage(null);
            }}
            className={`py-2.5 text-xs font-black rounded-xl transition-all cursor-pointer relative overflow-hidden ${
              authMode === 'LOGIN'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-zinc-950 shadow-lg shadow-emerald-500/30'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            {authMode === 'LOGIN' && (
              <span className="absolute inset-0 bg-white/25 -skew-x-12 translate-x-[-120%] animate-btn-shimmer" />
            )}
            LOG IN
          </button>
        </div>

        {/* Glowing Form Card Container */}
        <div className="bg-zinc-950/90 border-2 rounded-3xl p-6 sm:p-7 shadow-[0_10px_40px_rgba(0,0,0,0.8)] backdrop-blur-xl relative overflow-hidden animate-border-glow">
          {/* Subtle Inner Corner Accents */}
          <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-28 h-28 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />

          {successMessage && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-950/70 border border-emerald-500 text-emerald-300 text-xs flex items-start gap-2 shadow-lg shadow-emerald-950">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400 animate-bounce" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-950/70 border border-rose-500 text-rose-300 text-xs flex items-start gap-2 shadow-lg shadow-rose-950">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {authMode === 'SIGNUP' ? (
            /* ================= SIGNUP FORM ================= */
            <form onSubmit={handleSignupSubmit} className="space-y-3.5 relative z-10">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-1">First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="e.g. Tunde"
                    className="w-full bg-zinc-900/90 border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-1">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="e.g. Adeleke"
                    className="w-full bg-zinc-900/90 border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1">Citizen Username</label>
                <div className="relative">
                  <User className="w-4 h-4 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={signupUsername}
                    onChange={(e) => setSignupUsername(e.target.value)}
                    placeholder="Choose your unique username"
                    className="w-full bg-zinc-900/90 border border-zinc-700/80 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1">Date of Birth</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-amber-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full bg-zinc-900/90 border border-zinc-700/80 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-teal-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showSignupPassword ? 'text' : 'password'}
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="At least 4 characters"
                    className="w-full bg-zinc-900/90 border border-zinc-700/80 rounded-xl pl-9 pr-9 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignupPassword(!showSignupPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white cursor-pointer"
                  >
                    {showSignupPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Status lottery notice */}
              <div className="p-3 bg-zinc-900/80 border border-emerald-500/20 rounded-xl text-[11px] text-zinc-300 space-y-1 shadow-inner">
                <p className="font-bold text-emerald-300 flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
                  <span>Random Social Status Lottery on Birth:</span>
                </p>
                <p>• <strong className="text-emerald-400">Lapo (Poor):</strong> ₦50k-₦100k starter loan, Self-Contain Apt, iPhone X</p>
                <p>• <strong className="text-blue-400">Mapo (Middle):</strong> ₦800k-₦1M starting funds, 4-Bedroom Flat, Samsung S24, 35% rent aid</p>
                <p>• <strong className="text-amber-400">Nepo (Rich):</strong> ₦1.5M-₦3M starting wealth, Luxury Villa, iPhone 17 Pro Max, 100% rent aid</p>
                <p className="text-[10px] text-amber-300/90 mt-0.5">• 👑 Game Owner starts with 999 Sextillion &amp; iPhone 18 Pro Max</p>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:brightness-110 text-zinc-950 font-black text-sm tracking-wide shadow-xl shadow-emerald-500/30 transition-all cursor-pointer relative overflow-hidden group hover:scale-[1.01]"
              >
                <span className="absolute inset-0 bg-white/30 -skew-x-12 translate-x-[-150%] animate-btn-shimmer" />
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <span>Create Account & Roll Social Status</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            </form>
          ) : (
            /* ================= LOGIN FORM ================= */
            <form onSubmit={handleLoginSubmit} className="space-y-4 relative z-10">
              {/* Quick Select for Accounts Saved on This Specific Device */}
              {deviceUserKeys.length > 0 && (
                <div className="space-y-1.5 pb-1">
                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Saved Accounts on This Device:</span>
                  </span>
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                    {deviceUserKeys.map((uKey: string) => {
                      const uRec = syncedUsers[uKey];
                      const isSelected = loginUsername.toLowerCase().trim() === uKey;
                      const isOwner = uKey === 'chiboy_52';
                      return (
                        <button
                          key={uKey}
                          type="button"
                          onClick={() => {
                            setLoginUsername(uRec?.profile?.username || uKey);
                            setErrorMessage(null);
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                            isSelected
                              ? 'bg-emerald-500/25 border-emerald-400 text-emerald-300 font-black shadow-[0_0_15px_rgba(16,185,129,0.4)] scale-105'
                              : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-600'
                          }`}
                        >
                          <span>{isOwner ? '👑' : '🇳🇬'}</span>
                          <span>@{uRec?.profile?.username || uKey}</span>
                          <span
                            className={`text-[9px] uppercase px-1.5 py-0.5 rounded ${
                              isOwner || uRec?.profile?.socialClass === 'nepo'
                                ? 'bg-amber-500/30 text-amber-300'
                                : uRec?.profile?.socialClass === 'mapo'
                                ? 'bg-blue-500/30 text-blue-300'
                                : 'bg-emerald-500/30 text-emerald-300'
                            }`}
                          >
                            {isOwner ? 'OWNER' : uRec?.profile?.socialClass || 'Citizen'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1.5">Citizen Username</label>
                <div className="relative">
                  <User className="w-4 h-4 text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder="Enter your citizen username"
                    className="w-full bg-zinc-900/90 border border-zinc-700/80 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-teal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full bg-zinc-900/90 border border-zinc-700/80 rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white cursor-pointer"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:brightness-110 text-zinc-950 font-black text-sm tracking-wide shadow-xl shadow-emerald-500/30 transition-all cursor-pointer mt-2 relative overflow-hidden group hover:scale-[1.01]"
              >
                <span className="absolute inset-0 bg-white/30 -skew-x-12 translate-x-[-150%] animate-btn-shimmer" />
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <span>Log In & Enter Naija Life</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
