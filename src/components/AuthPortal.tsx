/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  User,
  Lock,
  Calendar,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  MapPin,
  Play,
  Compass,
  Crown,
  Mail,
  RefreshCw,
  LogOut,
  KeyRound,
  Check,
  Loader2,
  ShieldCheck,
  ExternalLink,
  Copy,
} from 'lucide-react';
import { EmeraldAtmosphere } from './EmeraldAtmosphere';
import { auth, firebaseConfig } from '../firebase';
import { UserProfile, CharacterAvatar, StateData, SocialClass } from '../types/game';
export type { UserProfile };
import { CharacterRenderer } from './CharacterRenderer';
import { CharacterCustomizer } from './CharacterCustomizer';
import { SpawnStateSelector } from './SpawnStateSelector';
import { NIGERIA_36_STATES_ALPHABETICAL } from '../data/stateLocationsData';
import { CANADA_STATE_DATA } from '../data/canadaLocations150';
import { formatNaira } from '../utils/formatNaira';
import {
  generateWalletAccountNumber,
  getStarterClothingForGender,
  getStarterHairstylesForGender,
} from '../config/economyConfig';
import {
  OWNER_EMAIL,
  OWNER_USERNAME,
  validateBirthdayInput,
  validateEmailInput,
  validatePasswordStrength,
  validateUsernameInput,
} from '../utils/authValidation';
import {
  applyAuthPersistence,
  checkEmailPasswordProviderEnabled,
  checkEmailVerificationStatus,
  checkUsernameAvailable,
  CloudGameSaveDoc,
  completeGoogleCitizenRegistration,
  consumeGoogleRedirectResult,
  FirebaseAuthUiError,
  loadAuthenticatedCitizenSession,
  loginCitizenAccount,
  LoginResult,
  logoutFirebaseUser,
  registerCitizenAccount,
  resendCurrentUserVerification,
  sendPasswordReset,
  signInWithGoogleIdToken,
  signInWithGooglePopup,
  signInWithGoogleRedirect,
  syncProfileToCloud,
} from '../services/firebaseAccountService';

interface AuthPortalProps {
  onAuthSuccess: (user: UserProfile, spawnState: StateData, cloudSave?: CloudGameSaveDoc | null) => void;
  triggerSound?: (type: 'coin' | 'alert' | 'stamp' | 'success') => void;
  initialVerificationEmail?: string | null;
  initialGoogleCompletionEmail?: string | null;
  initialSuspendedReason?: string | null;
}

export const STORAGE_USERS_KEY = 'naija_life_citizens_v20_clean';
export const STORAGE_SESSION_KEY = 'naija_life_active_citizen_v20_clean';

export function purgeAllLegacyAccounts(): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const keysToPurge = [
        'naija_life_citizens_v15_gmail',
        'naija_life_active_citizen_v15_gmail',
        'naija_life_citizens_v12_release',
        'naija_life_citizens_v1',
        'naija_life_citizens_v10_reset',
        'naija_life_global_players',
        'naija_life_global_chats',
        'naija_life_saved_game',
        'naija_life_saved_game_backup',
      ];
      for (const k of keysToPurge) {
        localStorage.removeItem(k);
      }
    }
  } catch {}
}

export function getStoredSession(): UserProfile | null {
  try {
    purgeAllLegacyAccounts();
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
  } catch {}
}

export function clearSession(): void {
  try {
    localStorage.removeItem(STORAGE_SESSION_KEY);
  } catch {}
}

export function getStoredUsers(): Record<string, { password?: string; profile: UserProfile }> {
  try {
    purgeAllLegacyAccounts();
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function getStateById(stateId?: string): StateData {
  if (!stateId) return NIGERIA_36_STATES_ALPHABETICAL.find((s) => s.id === 'lagos') || NIGERIA_36_STATES_ALPHABETICAL[0];
  const norm = stateId.toLowerCase().trim();
  if (norm === 'canada') return CANADA_STATE_DATA;
  return (
    NIGERIA_36_STATES_ALPHABETICAL.find((s) => s.id === norm) ||
    NIGERIA_36_STATES_ALPHABETICAL.find((s) => s.id === 'lagos') ||
    NIGERIA_36_STATES_ALPHABETICAL[0]
  );
}

function buildStarterProfile(params: {
  email: string;
  username: string;
  dateOfBirth: string;
  avatar: CharacterAvatar;
  spawnStateId: string;
}): UserProfile {
  const { email, username, dateOfBirth, avatar, spawnStateId } = params;
  const formattedFirstName = username.charAt(0).toUpperCase() + username.slice(1);

  const rand = Math.random();
  let socialClass: SocialClass = 'mapo';
  let startingCash = 0;
  let startingBank = 0;
  let loanBalance = 0;
  let phoneModel = 'samsung_s24_base';
  let fatherSubsidy = 35;
  let startingHouseDesc = '4-Bedroom Flat';

  if (rand < 0.45) {
    socialClass = 'lapo';
    const lapoTotal = Math.floor(Math.random() * (100000 - 50000 + 1)) + 50000;
    startingCash = lapoTotal;
    startingBank = 0;
    loanBalance = lapoTotal;
    fatherSubsidy = 0;
    phoneModel = 'iphone_x';
    startingHouseDesc = 'Self-Contain Apartment';
  } else if (rand < 0.85) {
    socialClass = 'mapo';
    const mapoTotal = Math.floor(Math.random() * (1000000 - 800000 + 1)) + 800000;
    startingCash = Math.round(mapoTotal * 0.15);
    startingBank = mapoTotal - startingCash;
    loanBalance = 0;
    fatherSubsidy = 35;
    phoneModel = 'samsung_s24_base';
    startingHouseDesc = '4-Bedroom Flat';
  } else {
    socialClass = 'nepo';
    const nepoTotal = Math.floor(Math.random() * (3000000 - 1500000 + 1)) + 1500000;
    startingCash = Math.round(nepoTotal * 0.15);
    startingBank = nepoTotal - startingCash;
    loanBalance = 0;
    fatherSubsidy = 100;
    phoneModel = 'iphone_17_pm';
    startingHouseDesc = 'Two-Story Luxury Villa';
  }

  return {
    username,
    citizenName: formattedFirstName,
    gmail: email,
    email,
    firstName: formattedFirstName,
    lastName: 'Citizen',
    dateOfBirth,
    createdAt: new Date().toISOString(),
    role: 'citizen',
    accountStatus: 'active',
    isOwner: false,
    isOwnerAccount: false,
    isVerified: false,
    walletAccountNumber: generateWalletAccountNumber(`${username}_${email}`),
    avatar,
    spawnStateId,
    lastLocationStateId: spawnStateId,
    currentCountry: 'nigeria',
    migratedToNigeriaOriginalStateV1: true,
    immigrationStatus: 'NIGERIA_RESIDENT',
    socialClass,
    phoneModel,
    cashNaira: startingCash,
    bankNaira: startingBank,
    loanBalanceNGN: loanBalance,
    savingsBalanceNGN: 0,
    bankCAD: 0,
    savingsCAD: 0,
    cashUSD: socialClass === 'nepo' ? 5000 : socialClass === 'mapo' ? 200 : 0,
    energy: 100,
    hunger: 95,
    thirst: 95,
    health: 100,
    happiness: socialClass === 'nepo' ? 95 : 85,
    inventory: [
      'Federal NIN Slip',
      phoneModel === 'iphone_17_pm'
        ? 'iPhone 17 Pro Max'
        : phoneModel === 'samsung_s24_base'
        ? 'Samsung Galaxy S24'
        : 'iPhone X',
      'Naija Pay Debit Card',
      `${startingHouseDesc} Key`,
    ],
    fatherRentSubsidyPct: fatherSubsidy,
    completedCourses: [],
    furnitureBought: [],
    ownedClothing: getStarterClothingForGender(avatar.gender),
    ownedHairstyles: getStarterHairstylesForGender(avatar.gender),
    houseLayouts: {},
    storedItems: [],
    receipts: [
      {
        id: 'rcpt_welcome',
        title: `Welcome Grant (${socialClass.toUpperCase()})`,
        category: 'general',
        amount: startingBank + startingCash,
        date: new Date().toLocaleDateString(),
        type: 'credit',
      },
    ],
    alerts: [
      {
        id: 'alrt_start',
        text: `Welcome to Naija Life! Assigned Status: ${socialClass.toUpperCase()}.${
          loanBalance > 0 ? ' Repay your startup loan in Naija Pay.' : ''
        }`,
        amount: startingBank + startingCash,
        date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'credit',
        senderOrRecipient: 'Central Bank of Nigeria',
      },
    ],
    ownedDocuments: [],
  };
}

export const AuthPortal: React.FC<AuthPortalProps> = ({
  onAuthSuccess,
  triggerSound,
  initialVerificationEmail,
  initialGoogleCompletionEmail,
  initialSuspendedReason,
}) => {
  useEffect(() => {
    purgeAllLegacyAccounts();
  }, []);

  type PortalStep =
    | 'AUTH_GATE'
    | 'VERIFY_EMAIL'
    | 'COMPLETE_GOOGLE_PROFILE'
    | 'FORGOT_PASSWORD'
    | 'SUSPENDED'
    | 'CUSTOMIZE'
    | 'PICK_SPAWN'
    | 'STATUS_REVEAL';

  const [currentStep, setCurrentStep] = useState<PortalStep>(
    initialSuspendedReason
      ? 'SUSPENDED'
      : initialGoogleCompletionEmail
      ? 'COMPLETE_GOOGLE_PROFILE'
      : initialVerificationEmail
      ? 'VERIFY_EMAIL'
      : 'AUTH_GATE'
  );
  const [authMode, setAuthMode] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');
  const [isNewSignupFlow, setIsNewSignupFlow] = useState(false);
  const [pendingGoogleEmail, setPendingGoogleEmail] = useState(initialGoogleCompletionEmail || '');

  // Registration form fields (all 6 required fields)
  const [signupEmail, setSignupEmail] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('2002-06-15');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Live username availability state
  const [usernameStatus, setUsernameStatus] = useState<{
    checking: boolean;
    available?: boolean;
    message?: string;
  }>({ checking: false });

  // Login form fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Forgot password & verification & suspension state
  const [resetEmail, setResetEmail] = useState('');
  const [pendingVerifyEmail, setPendingVerifyEmail] = useState(initialVerificationEmail || '');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [suspendedReason, setSuspendedReason] = useState(initialSuspendedReason || '');

  // Onboarding state
  const [avatar, setAvatar] = useState<CharacterAvatar>({
    gender: 'male',
    skinTone: '#8d5524',
    bodyBuild: 'average',
    faceShape: 'oval',
    eyeStyle: 'classic',
    eyebrowStyle: 'natural',
    noseStyle: 'balanced',
    mouthStyle: 'neutral',
    hairstyle: 'fade',
    hairColor: '#18181b',
    outfit: 'streetwear',
    pants: 'jeans',
    shoes: 'sneakers',
    height: 'average',
    accessory: 'designer_shades',
  });
  const [signupStateId, setSignupStateId] = useState('lagos');
  const [pendingProfile, setPendingProfile] = useState<UserProfile | null>(null);
  const [pendingCloudSave, setPendingCloudSave] = useState<CloudGameSaveDoc | null>(null);

  // Loading & Feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingRedirect, setIsProcessingRedirect] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPasswordAuthEnabled, setIsPasswordAuthEnabled] = useState<boolean | null>(null);
  const [checkingProviderStatus, setCheckingProviderStatus] = useState(false);
  const [copiedAppLink, setCopiedAppLink] = useState(false);
  const [gisReady, setGisReady] = useState(false);

  const isEmbeddedIframe =
    typeof window !== 'undefined' &&
    (() => {
      try {
        return window.self !== window.top;
      } catch {
        return true;
      }
    })();

  const refreshProviderStatus = async () => {
    setCheckingProviderStatus(true);
    const enabled = await checkEmailPasswordProviderEnabled();
    setIsPasswordAuthEnabled(enabled);
    setCheckingProviderStatus(false);
  };

  useEffect(() => {
    applyAuthPersistence(rememberMe);
  }, [rememberMe]);

  useEffect(() => {
    let active = true;
    checkEmailPasswordProviderEnabled().then((enabled) => {
      if (active) setIsPasswordAuthEnabled(enabled);
    });
    return () => {
      active = false;
    };
  }, []);

  // Preload Google Identity Services script quietly for FedCM popup-free fallback if needed
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const w = window as unknown as { google?: { accounts?: { id?: unknown } } };
    if (w.google?.accounts?.id) {
      setGisReady(true);
      return;
    }
    const existing = document.querySelector('script[data-naija-gis="true"]') as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => setGisReady(true));
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.dataset.naijaGis = 'true';
    script.onload = () => setGisReady(true);
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  // Sync external initial step transitions (e.g. page reload while mid-Google profile completion)
  useEffect(() => {
    if (initialGoogleCompletionEmail && auth.currentUser && currentStep === 'AUTH_GATE' && !isSubmitting) {
      setPendingGoogleEmail(initialGoogleCompletionEmail);
      setCurrentStep('COMPLETE_GOOGLE_PROFILE');
    }
  }, [initialGoogleCompletionEmail, currentStep, isSubmitting]);

  // Automatically pre-fill Owner username chiboy_52 when kchiboy50@gmail.com completes Google profile
  useEffect(() => {
    const activeEmail = (auth.currentUser?.email || pendingGoogleEmail || '').trim().toLowerCase();
    if (currentStep === 'COMPLETE_GOOGLE_PROFILE' && activeEmail === OWNER_EMAIL && !signupUsername.trim()) {
      setSignupUsername(OWNER_USERNAME);
    }
  }, [currentStep, pendingGoogleEmail, signupUsername]);

  // Debounced live username uniqueness check during signup or Google profile completion
  useEffect(() => {
    const isCheckingSignup = authMode === 'SIGNUP' && currentStep === 'AUTH_GATE';
    const isCheckingGoogleProfile = currentStep === 'COMPLETE_GOOGLE_PROFILE';
    if (!isCheckingSignup && !isCheckingGoogleProfile) return;
    const raw = signupUsername.trim();
    if (!raw) {
      setUsernameStatus({ checking: false });
      return;
    }
    const validation = validateUsernameInput(raw);
    if (!validation.valid) {
      setUsernameStatus({ checking: false, available: false, message: validation.error });
      return;
    }

    let cancelled = false;
    setUsernameStatus({ checking: true, message: 'Checking availability...' });
    const timer = setTimeout(async () => {
      try {
        const res = await checkUsernameAvailable(raw);
        if (!cancelled) {
          setUsernameStatus({
            checking: false,
            available: res.available,
            message: res.available ? `@${res.normalized} is available` : res.error || 'Username already taken',
          });
        }
      } catch {
        if (!cancelled) setUsernameStatus({ checking: false });
      }
    }, 450);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [signupUsername, authMode, currentStep]);

  const pwdStrength = validatePasswordStrength(signupPassword);
  const todayMaxDate = new Date().toISOString().split('T')[0];

  // =========================================================================
  // REGISTRATION HANDLER (Firebase Auth + Firestore Transaction + Verification)
  // =========================================================================
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const emailCheck = validateEmailInput(signupEmail);
    if (!emailCheck.valid) {
      setErrorMessage(emailCheck.error || 'Invalid email address.');
      triggerSound?.('alert');
      return;
    }

    const unameCheck = validateUsernameInput(signupUsername);
    if (!unameCheck.valid) {
      setErrorMessage(unameCheck.error || 'Invalid username.');
      triggerSound?.('alert');
      return;
    }

    const dobCheck = validateBirthdayInput(dateOfBirth);
    if (!dobCheck.valid) {
      setErrorMessage(dobCheck.error || 'Invalid date of birth.');
      triggerSound?.('alert');
      return;
    }

    if (!pwdStrength.valid) {
      setErrorMessage(pwdStrength.error || 'Please choose a stronger password.');
      triggerSound?.('alert');
      return;
    }

    if (signupPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter Confirm Password.');
      triggerSound?.('alert');
      return;
    }

    setIsSubmitting(true);
    try {
      const starterProfile = buildStarterProfile({
        email: emailCheck.normalized,
        username: unameCheck.trimmed,
        dateOfBirth,
        avatar,
        spawnStateId: signupStateId,
      });

      await registerCitizenAccount({
        email: emailCheck.normalized,
        username: unameCheck.trimmed,
        dateOfBirth,
        password: signupPassword,
        confirmPassword,
        starterProfile,
      });

      setPendingVerifyEmail(emailCheck.normalized);
      setIsNewSignupFlow(true);
      setResendCooldown(60);
      setSuccessMessage(
        `Account created! A verification email has been sent to ${emailCheck.normalized}. Please verify your email before entering Naija Life.`
      );
      triggerSound?.('stamp');
      setCurrentStep('VERIFY_EMAIL');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Registration failed.');
      triggerSound?.('alert');
    } finally {
      setIsSubmitting(false);
    }
  };

  // =========================================================================
  // LOGIN HANDLER (Firebase Email + Password + Remember Me + Cloud Profile)
  // =========================================================================
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const emailCheck = validateEmailInput(loginEmail);
    if (!emailCheck.valid) {
      setErrorMessage(emailCheck.error || 'Please enter a valid email address.');
      triggerSound?.('alert');
      return;
    }
    if (!loginPassword) {
      setErrorMessage('Password is required.');
      triggerSound?.('alert');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await loginCitizenAccount({
        email: emailCheck.normalized,
        password: loginPassword,
        rememberMe,
      });

      if (result.status === 'NEEDS_VERIFICATION') {
        setPendingVerifyEmail(result.email || emailCheck.normalized);
        setIsNewSignupFlow(false);
        setCurrentStep('VERIFY_EMAIL');
        triggerSound?.('alert');
        return;
      }

      if (result.status === 'SUSPENDED') {
        setSuspendedReason(result.reason);
        setCurrentStep('SUSPENDED');
        triggerSound?.('alert');
        return;
      }

      if (result.status === 'NEEDS_PROFILE_COMPLETION') {
        setPendingGoogleEmail(result.email || emailCheck.normalized);
        setIsNewSignupFlow(true);
        setCurrentStep('COMPLETE_GOOGLE_PROFILE');
        triggerSound?.('coin');
        return;
      }

      // Authenticated and verified -> load existing cross-device account directly into game!
      saveSession(result.profile);
      triggerSound?.('stamp');
      const targetLocId = result.profile.lastLocationStateId || result.profile.spawnStateId || 'lagos';
      onAuthSuccess(result.profile, getStateById(targetLocId), result.cloudSave);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Login failed.');
      triggerSound?.('alert');
    } finally {
      setIsSubmitting(false);
    }
  };

  // =========================================================================
  // GOOGLE SIGN-IN HELPERS (Popup + Redirect Fallback + FedCM Account Chooser)
  // =========================================================================
  const GOOGLE_DRAFT_KEY = 'naija_life_google_redirect_draft';

  const stashGoogleDraftToSession = () => {
    try {
      sessionStorage.setItem(
        GOOGLE_DRAFT_KEY,
        JSON.stringify({
          authMode,
          signupUsername,
          dateOfBirth,
          signupStateId,
        })
      );
    } catch {}
  };

  const popGoogleDraftFromSession = (): {
    authMode?: 'LOGIN' | 'SIGNUP';
    signupUsername?: string;
    dateOfBirth?: string;
    signupStateId?: string;
  } | null => {
    try {
      const raw = sessionStorage.getItem(GOOGLE_DRAFT_KEY);
      if (!raw) return null;
      sessionStorage.removeItem(GOOGLE_DRAFT_KEY);
      return JSON.parse(raw);
    } catch {
      return null;
    }
  };

  const processGoogleLoginResult = async (
    result: LoginResult,
    prefilled?: { username?: string; dob?: string; spawnStateId?: string; mode?: 'LOGIN' | 'SIGNUP' }
  ) => {
    if (result.status === 'SUSPENDED') {
      setSuspendedReason(result.reason);
      setCurrentStep('SUSPENDED');
      triggerSound?.('alert');
      return;
    }
    if (result.status === 'NEEDS_PROFILE_COMPLETION') {
      const googleEmail = result.email || result.user.email || '';
      setPendingGoogleEmail(googleEmail);
      setIsNewSignupFlow(true);

      const candidateUname = prefilled?.username ?? (authMode === 'SIGNUP' ? signupUsername : '');
      const candidateDob = prefilled?.dob ?? (authMode === 'SIGNUP' ? dateOfBirth : '');
      const candidateStateId = prefilled?.spawnStateId ?? signupStateId;
      const candidateMode = prefilled?.mode ?? authMode;

      const prefilledUname = candidateMode === 'SIGNUP' ? validateUsernameInput(candidateUname) : null;
      const prefilledDob = candidateMode === 'SIGNUP' ? validateBirthdayInput(candidateDob) : null;

      if (candidateUname) setSignupUsername(candidateUname);
      if (candidateDob) setDateOfBirth(candidateDob);

      // If citizen already filled a valid username & birthday on the signup form, complete registration directly!
      if (prefilledUname?.valid && prefilledDob?.valid) {
        try {
          const starterProfile = buildStarterProfile({
            email: googleEmail.toLowerCase(),
            username: prefilledUname.trimmed,
            dateOfBirth: candidateDob,
            avatar,
            spawnStateId: candidateStateId,
          });
          const completed = await completeGoogleCitizenRegistration({
            user: result.user,
            username: prefilledUname.trimmed,
            dateOfBirth: candidateDob,
            starterProfile,
          });
          if (completed.status === 'AUTHENTICATED') {
            triggerSound?.('stamp');
            setPendingProfile(completed.profile);
            setPendingCloudSave(completed.cloudSave);
            setAvatar(completed.profile.avatar || avatar);
            setCurrentStep('CUSTOMIZE');
            return;
          }
        } catch (regErr) {
          setErrorMessage(regErr instanceof Error ? regErr.message : 'Please choose your username and birthday.');
        }
      }

      setCurrentStep('COMPLETE_GOOGLE_PROFILE');
      triggerSound?.('coin');
      return;
    }
    if (result.status === 'NEEDS_VERIFICATION') {
      setPendingVerifyEmail(result.email);
      setCurrentStep('VERIFY_EMAIL');
      triggerSound?.('alert');
      return;
    }

    saveSession(result.profile);
    triggerSound?.('stamp');
    const targetLocId = result.profile.lastLocationStateId || result.profile.spawnStateId || 'lagos';
    onAuthSuccess(result.profile, getStateById(targetLocId), result.cloudSave);
  };

  // Consume any Google signInWithRedirect return on mount
  useEffect(() => {
    let active = true;
    setIsProcessingRedirect(true);
    const draft = popGoogleDraftFromSession();
    consumeGoogleRedirectResult()
      .then(async (result) => {
        if (!active || !result) return;
        await processGoogleLoginResult(result, {
          username: draft?.signupUsername,
          dob: draft?.dateOfBirth,
          spawnStateId: draft?.signupStateId,
          mode: draft?.authMode,
        });
      })
      .catch((err) => {
        if (!active) return;
        setErrorMessage(err instanceof Error ? err.message : 'Google redirect sign-in failed.');
      })
      .finally(() => {
        if (active) setIsProcessingRedirect(false);
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGoogleRedirectSignIn = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    if (isEmbeddedIframe) {
      setErrorMessage(
        'Embedded viewer frames cannot open Google Sign-In via redirect. Click "Open Published App in Full Tab" below and sign in there cleanly.'
      );
      triggerSound?.('alert');
      return;
    }
    setIsSubmitting(true);
    stashGoogleDraftToSession();
    try {
      await signInWithGoogleRedirect();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Unable to start Google redirect sign-in.');
      setIsSubmitting(false);
      triggerSound?.('alert');
    }
  };

  const handleGoogleFedCmPrompt = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    const w = window as unknown as {
      google?: {
        accounts?: {
          id?: {
            initialize: (cfg: Record<string, unknown>) => void;
            prompt: (cb?: (notif: { isNotDisplayed?: () => boolean; isSkippedMoment?: () => boolean }) => void) => void;
          };
        };
      };
    };
    const oAuthClientId = (firebaseConfig as { oAuthClientId?: string }).oAuthClientId;
    if (!w.google?.accounts?.id || !oAuthClientId) {
      setErrorMessage('Browser account chooser is unavailable here. Use "Open Published App in Full Tab" below.');
      return;
    }
    const capturedDraft = {
      username: signupUsername,
      dob: dateOfBirth,
      spawnStateId: signupStateId,
      mode: authMode,
    };
    setIsSubmitting(true);
    try {
      w.google.accounts.id.initialize({
        client_id: oAuthClientId,
        use_fedcm_for_prompt: true,
        ux_mode: 'popup',
        callback: async (resp: { credential?: string }) => {
          if (!resp?.credential) {
            setIsSubmitting(false);
            return;
          }
          try {
            const res = await signInWithGoogleIdToken(resp.credential);
            await processGoogleLoginResult(res, capturedDraft);
          } catch (err) {
            setErrorMessage(err instanceof Error ? err.message : 'Google credential sign-in failed.');
            triggerSound?.('alert');
          } finally {
            setIsSubmitting(false);
          }
        },
      });
      w.google.accounts.id.prompt((notification) => {
        if (notification?.isNotDisplayed?.() || notification?.isSkippedMoment?.()) {
          setIsSubmitting(false);
          setErrorMessage(
            isEmbeddedIframe
              ? 'Your browser blocked Google prompts inside this embedded frame. Click "Open Published App in Full Tab" below to sign in.'
              : 'Account chooser could not appear automatically. Click "Sign In via Redirect (No Popup)" below.'
          );
        }
      });
    } catch {
      setIsSubmitting(false);
      setErrorMessage('Browser account chooser could not open. Try opening in a full browser tab.');
    }
  };

  const handleCopyPublishedUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedAppLink(true);
      setTimeout(() => setCopiedAppLink(false), 2500);
    } catch {}
  };

  const handleGoogleSignIn = async () => {
    // Call signInWithGooglePopup() immediately on click gesture before any awaits so Chrome preserves transient activation
    const popupPromise = signInWithGooglePopup();
    const capturedDraft = {
      username: signupUsername,
      dob: dateOfBirth,
      spawnStateId: signupStateId,
      mode: authMode,
    };
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      const result = await popupPromise;
      await processGoogleLoginResult(result, capturedDraft);
    } catch (err) {
      const code = err instanceof FirebaseAuthUiError ? err.code : '';
      const msg = err instanceof Error ? err.message : 'Google Sign-In failed.';
      const isPopupBlocked =
        code === 'auth/popup-blocked' ||
        (msg.toLowerCase().includes('popup') && msg.toLowerCase().includes('block'));

      // On standalone published/top-level tabs, seamlessly fall back to full-page redirect (zero popup required!)
      if (isPopupBlocked && !isEmbeddedIframe) {
        stashGoogleDraftToSession();
        setSuccessMessage('Popup was blocked by browser — redirecting to Google Sign-In automatically...');
        try {
          await signInWithGoogleRedirect();
          return;
        } catch (redirErr) {
          setSuccessMessage(null);
          setErrorMessage(
            redirErr instanceof Error
              ? redirErr.message
              : 'Popup was blocked and redirect could not start. Allow popups or try again.'
          );
        }
      } else {
        setErrorMessage(msg);
      }
      triggerSound?.('alert');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteGoogleProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const fbUser = auth.currentUser;
    if (!fbUser) {
      setErrorMessage('Google session expired. Please click Continue with Google again.');
      setCurrentStep('AUTH_GATE');
      return;
    }

    const unameCheck = validateUsernameInput(signupUsername);
    if (!unameCheck.valid) {
      setErrorMessage(unameCheck.error || 'Invalid username.');
      triggerSound?.('alert');
      return;
    }

    const dobCheck = validateBirthdayInput(dateOfBirth);
    if (!dobCheck.valid) {
      setErrorMessage(dobCheck.error || 'Invalid date of birth.');
      triggerSound?.('alert');
      return;
    }

    setIsSubmitting(true);
    try {
      const starterProfile = buildStarterProfile({
        email: (fbUser.email || pendingGoogleEmail).toLowerCase(),
        username: unameCheck.trimmed,
        dateOfBirth,
        avatar,
        spawnStateId: signupStateId,
      });

      const session = await completeGoogleCitizenRegistration({
        user: fbUser,
        username: unameCheck.trimmed,
        dateOfBirth,
        starterProfile,
      });

      if (session.status !== 'AUTHENTICATED') {
        setErrorMessage('Could not finalize your citizen profile. Please try again.');
        return;
      }

      triggerSound?.('stamp');
      setPendingProfile(session.profile);
      setPendingCloudSave(session.cloudSave);
      setAvatar(session.profile.avatar || avatar);
      setCurrentStep('CUSTOMIZE');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to complete registration.');
      triggerSound?.('alert');
    } finally {
      setIsSubmitting(false);
    }
  };

  // =========================================================================
  // VERIFICATION CHECK & RESEND HANDLERS
  // =========================================================================
  const handleCheckVerification = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);
    try {
      const { verified } = await checkEmailVerificationStatus();
      if (!verified || !auth.currentUser) {
        setErrorMessage('Your email is not verified yet. Please open the link in your inbox (or spam folder) and try again.');
        triggerSound?.('alert');
        return;
      }

      const session = await loadAuthenticatedCitizenSession(auth.currentUser);
      if (session.status === 'SUSPENDED') {
        setSuspendedReason(session.reason);
        setCurrentStep('SUSPENDED');
        return;
      }
      if (session.status !== 'AUTHENTICATED') {
        setErrorMessage('Email verification is still pending propagation. Please retry in a second.');
        return;
      }

      triggerSound?.('stamp');
      if (isNewSignupFlow) {
        setPendingProfile(session.profile);
        setPendingCloudSave(session.cloudSave);
        setAvatar(session.profile.avatar || avatar);
        setCurrentStep('CUSTOMIZE');
      } else {
        saveSession(session.profile);
        const targetLocId = session.profile.lastLocationStateId || session.profile.spawnStateId || 'lagos';
        onAuthSuccess(session.profile, getStateById(targetLocId), session.cloudSave);
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Unable to verify email status.');
      triggerSound?.('alert');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    if (resendCooldown > 0) return;
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);
    try {
      await resendCurrentUserVerification();
      setResendCooldown(60);
      setSuccessMessage(`A fresh verification link was sent to ${pendingVerifyEmail || 'your email'}.`);
      triggerSound?.('coin');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to resend verification email.');
      triggerSound?.('alert');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);
    try {
      await sendPasswordReset(resetEmail);
      setSuccessMessage(`Password reset instructions sent to ${resetEmail.trim().toLowerCase()}. Check your inbox and spam folder.`);
      triggerSound?.('stamp');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Could not send reset email.');
      triggerSound?.('alert');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogoutAndReturn = async () => {
    try {
      await logoutFirebaseUser();
    } catch {}
    clearSession();
    setErrorMessage(null);
    setSuccessMessage(null);
    setCurrentStep('AUTH_GATE');
  };

  // =========================================================================
  // ONBOARDING: CUSTOMIZE -> PICK SPAWN -> STATUS REVEAL -> CLOUD LAUNCH
  // =========================================================================
  const handleCustomizationComplete = () => {
    if (!pendingProfile) return;
    setPendingProfile({ ...pendingProfile, avatar });
    triggerSound?.('coin');
    setCurrentStep('PICK_SPAWN');
  };

  const handleSpawnSelected = (selectedState: StateData) => {
    if (!pendingProfile) return;
    setPendingProfile({
      ...pendingProfile,
      avatar,
      spawnStateId: selectedState.id,
      lastLocationStateId: selectedState.id,
    });
    setSignupStateId(selectedState.id);
    triggerSound?.('stamp');
    setCurrentStep('STATUS_REVEAL');
  };

  const handleProceedDirectlyToMap = async () => {
    if (!pendingProfile) return;
    setIsSubmitting(true);
    try {
      const spawnState = getStateById(pendingProfile.spawnStateId || signupStateId || 'lagos');
      const finalUser: UserProfile = {
        ...pendingProfile,
        avatar,
        spawnStateId: spawnState.id,
        lastLocationStateId: spawnState.id,
      };
      if (finalUser.uid) {
        await syncProfileToCloud(finalUser.uid, finalUser).catch(() => {});
      }
      saveSession(finalUser);
      triggerSound?.('stamp');
      onAuthSuccess(finalUser, spawnState, pendingCloudSave);
    } finally {
      setIsSubmitting(false);
    }
  };

  // =========================================================================
  // STEP VIEWS: SUSPENDED / VERIFY EMAIL / FORGOT PASSWORD / ONBOARDING
  // =========================================================================
  if (currentStep === 'SUSPENDED') {
    return (
      <div className="fixed inset-0 w-screen h-screen min-h-[100dvh] z-50 flex items-center justify-center bg-[#040b07] text-[#f4f7f5] p-4 overflow-y-auto">
        <EmeraldAtmosphere />
        <div className="relative z-10 w-full max-w-md bg-[#08150f]/95 border border-rose-500/45 rounded-2xl p-6 sm:p-7 text-center shadow-[0_24px_60px_rgba(0,0,0,0.8)] backdrop-blur-xl space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/35 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-7 h-7 text-rose-400" />
          </div>
          <h2 className="font-display text-2xl font-extrabold text-white">Account Suspended</h2>
          <p className="text-xs text-emerald-100/70 leading-relaxed">
            Access to Naija Life servers has been restricted for this account by Apex Syndicate administration.
          </p>
          <div className="p-3.5 rounded-xl bg-rose-950/55 border border-rose-500/35 text-xs text-rose-200 font-medium">
            {suspendedReason || 'Administrative suspension in effect.'}
          </div>
          <button
            type="button"
            onClick={handleLogoutAndReturn}
            className="w-full min-h-[44px] py-3 rounded-xl bg-[#0e2419] hover:bg-[#133022] border border-emerald-800/60 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out &amp; Return to Login</span>
          </button>
        </div>
      </div>
    );
  }

  if (currentStep === 'VERIFY_EMAIL') {
    return (
      <div className="fixed inset-0 w-screen h-screen min-h-[100dvh] z-50 flex items-center justify-center bg-[#040b07] text-[#f4f7f5] p-4 overflow-y-auto">
        <EmeraldAtmosphere />
        <div className="relative z-10 w-full max-w-md bg-[#08150f]/95 border border-emerald-800/55 rounded-2xl p-6 sm:p-7 shadow-[0_24px_60px_rgba(0,0,0,0.8)] backdrop-blur-xl space-y-4">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/35 flex items-center justify-center mx-auto">
              <Mail className="w-7 h-7 text-emerald-400" />
            </div>
            <h2 className="font-display text-2xl font-extrabold text-white">Verify Your Email</h2>
            <p className="text-xs text-emerald-100/70 leading-relaxed">
              We sent a verification link to{' '}
              <strong className="text-emerald-300 font-mono">{pendingVerifyEmail || auth.currentUser?.email}</strong>.
            </p>
          </div>

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-200 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-500/60 text-rose-200 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="p-3.5 rounded-xl bg-[#050f0a] border border-emerald-900/55 text-xs text-emerald-100/75 space-y-1.5">
            <p className="font-bold text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Why verify?</span>
            </p>
            <p className="text-emerald-100/65 leading-relaxed">
              Email verification protects your cross-device cloud saves, unlocks account recovery, and keeps your account secure.
            </p>
          </div>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleCheckVerification}
            className="w-full min-h-[46px] py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-[#031209] font-extrabold text-xs tracking-wide flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            <span>I Have Verified — Continue</span>
          </button>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              disabled={isSubmitting || resendCooldown > 0}
              onClick={handleResendVerification}
              className="min-h-[42px] py-2.5 px-3 rounded-xl bg-[#0b1f15] hover:bg-[#102b1d] disabled:opacity-50 border border-emerald-800/55 text-xs font-bold text-emerald-100 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
              <span>{resendCooldown > 0 ? `Resend (${resendCooldown}s)` : 'Resend Link'}</span>
            </button>
            <button
              type="button"
              onClick={handleLogoutAndReturn}
              className="min-h-[42px] py-2.5 px-3 rounded-xl bg-[#0b1f15] hover:bg-[#102b1d] border border-emerald-800/55 text-xs font-bold text-emerald-100/80 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span>Switch Account</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 'COMPLETE_GOOGLE_PROFILE') {
    const activeGoogleEmail = (auth.currentUser?.email || pendingGoogleEmail || '').trim().toLowerCase();
    const isPendingOwnerMatch =
      activeGoogleEmail === OWNER_EMAIL && signupUsername.trim().toLowerCase() === OWNER_USERNAME;

    return (
      <div className="fixed inset-0 w-screen h-screen min-h-[100dvh] z-50 flex items-center justify-center bg-[#040b07] text-[#f4f7f5] p-4 overflow-y-auto">
        <EmeraldAtmosphere />
        <div className="relative z-10 w-full max-w-md bg-[#08150f]/95 border border-emerald-800/55 rounded-2xl p-6 sm:p-7 shadow-[0_24px_60px_rgba(0,0,0,0.8)] backdrop-blur-xl space-y-4">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/35 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-7 h-7 text-emerald-400" />
            </div>
            <h2 className="font-display text-2xl font-extrabold text-white">Complete Citizen Profile</h2>
            <p className="text-xs text-emerald-100/70 leading-relaxed">
              Google verified <strong className="text-emerald-300 font-mono">{activeGoogleEmail}</strong>. Choose your username and birthday to activate your account.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-500/60 text-rose-200 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleCompleteGoogleProfile} className="space-y-3.5">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-emerald-100">Username</label>
                <span className="text-[11px] text-emerald-200/50 font-mono">A-Z, 0-9, _ . -</span>
              </div>
              <div className="relative">
                <User className="w-4 h-4 text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={signupUsername}
                  onChange={(e) => setSignupUsername(e.target.value)}
                  placeholder="e.g. chiboy_52 or naija.gamer"
                  required
                  minLength={3}
                  maxLength={24}
                  autoComplete="username"
                  className="w-full min-h-[42px] bg-[#040c08] border border-emerald-900/70 rounded-xl pl-10 pr-8 py-2.5 text-xs text-white placeholder-emerald-200/35 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30 font-mono"
                />
                {usernameStatus.checking && (
                  <Loader2 className="w-3.5 h-3.5 text-emerald-300 animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
                )}
              </div>
              {usernameStatus.message && (
                <p
                  className={`text-[11px] mt-1 font-medium ${
                    usernameStatus.checking
                      ? 'text-emerald-200/60'
                      : usernameStatus.available
                      ? 'text-emerald-400'
                      : 'text-rose-400'
                  }`}
                >
                  {usernameStatus.message}
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-emerald-100">Date of Birth</label>
                <span className="text-[11px] text-emerald-200/50">Private</span>
              </div>
              <div className="relative">
                <Calendar className="w-4 h-4 text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  value={dateOfBirth}
                  max={todayMaxDate}
                  min="1900-01-01"
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  required
                  className="w-full min-h-[42px] bg-[#040c08] border border-emerald-900/70 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30"
                />
              </div>
            </div>

            {isPendingOwnerMatch && (
              <p className="text-[11px] text-amber-300 text-center font-medium bg-amber-950/35 border border-amber-500/30 rounded-xl p-2.5">
                Verified Apex Syndicate Owner identity detected — master Owner privileges will be provisioned server-side upon activation.
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting || (usernameStatus.available === false && !usernameStatus.checking)}
              className="w-full min-h-[46px] py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-[#031209] font-extrabold text-xs tracking-wide flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              <span>{isSubmitting ? 'Activating Account...' : 'Activate Citizen Account'}</span>
              {!isSubmitting && <ArrowRight className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={handleLogoutAndReturn}
              className="w-full min-h-[40px] py-2 text-xs font-semibold text-emerald-200/70 hover:text-white cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Use a Different Account</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (currentStep === 'FORGOT_PASSWORD') {
    return (
      <div className="fixed inset-0 w-screen h-screen min-h-[100dvh] z-50 flex items-center justify-center bg-[#040b07] text-[#f4f7f5] p-4 overflow-y-auto">
        <EmeraldAtmosphere />
        <div className="relative z-10 w-full max-w-md bg-[#08150f]/95 border border-emerald-800/55 rounded-2xl p-6 sm:p-7 shadow-[0_24px_60px_rgba(0,0,0,0.8)] backdrop-blur-xl space-y-4">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/35 flex items-center justify-center mx-auto">
              <KeyRound className="w-6 h-6 text-emerald-400" />
            </div>
            <h2 className="font-display text-2xl font-extrabold text-white">Reset Password</h2>
            <p className="text-xs text-emerald-100/70 leading-relaxed">
              Enter your registered email address and we will send a password reset link.
            </p>
          </div>

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-200 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-500/60 text-rose-200 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-emerald-100 block mb-1.5">Registered Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  className="w-full min-h-[44px] bg-[#040c08] border border-emerald-900/70 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-emerald-200/35 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30 font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full min-h-[46px] py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-[#031209] font-extrabold text-xs tracking-wide flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
              <span>Send Password Reset Link</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setErrorMessage(null);
                setSuccessMessage(null);
                setCurrentStep('AUTH_GATE');
              }}
              className="w-full min-h-[40px] py-2 text-xs font-semibold text-emerald-200/70 hover:text-white cursor-pointer transition-colors"
            >
              Back to Log In
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (currentStep === 'STATUS_REVEAL' && pendingProfile) {
    const isOwner = pendingProfile.isOwner === true && pendingProfile.role === 'owner';
    const isNepo = pendingProfile.socialClass === 'nepo';
    const isMapo = pendingProfile.socialClass === 'mapo';
    const totalWealth = pendingProfile.bankNaira + pendingProfile.cashNaira;
    const currentSpawnState = getStateById(pendingProfile.spawnStateId || signupStateId || 'lagos');

    return (
      <div className="fixed inset-0 w-screen h-screen min-h-[100dvh] z-50 flex items-center justify-center bg-[#040b07] text-[#f4f7f5] select-none overflow-y-auto overflow-x-hidden py-6 px-4">
        <EmeraldAtmosphere />
        <div className="relative z-10 w-full max-w-lg mx-auto flex flex-col items-center text-center">
          <div className="mb-5 space-y-1.5">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-400">
              Citizen Profile Ready
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {isOwner ? 'Apex Syndicate Owner Verified' : 'Your Nigerian Background'}
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/70">
              {isOwner
                ? 'Verified owner identity confirmed with full master registry privileges.'
                : 'Your starting social class, residence, and account balance are ready.'}
            </p>
          </div>

          <div className="w-full bg-[#08150f]/95 border border-emerald-800/55 rounded-2xl p-5 sm:p-6 shadow-[0_24px_60px_rgba(0,0,0,0.8)] backdrop-blur-xl mb-5 text-left space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-emerald-900/50">
              <span className="flex items-center gap-1.5 text-xs text-emerald-200 font-semibold">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>{currentSpawnState.name} ({currentSpawnState.zone})</span>
              </span>
              <span
                className={`text-xs font-bold flex items-center gap-1.5 ${
                  isNepo || isOwner
                    ? 'text-amber-300'
                    : isMapo
                    ? 'text-emerald-300'
                    : 'text-emerald-200/80'
                }`}
              >
                <Crown className="w-3.5 h-3.5" />
                <span>{isOwner ? 'Owner · Nepo Class' : `${pendingProfile.socialClass.toUpperCase()} Class`}</span>
              </span>
            </div>

            <div className="flex items-center gap-4 py-1">
              <CharacterRenderer avatar={avatar} size="sm" showBackground={false} />
              <div className="min-w-0">
                <h3 className="text-lg font-extrabold text-white flex items-center gap-2 flex-wrap">
                  <span>{pendingProfile.firstName} {pendingProfile.lastName}</span>
                  {isOwner && (
                    <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                      · Owner
                    </span>
                  )}
                </h3>
                <p className="text-xs text-emerald-400 font-mono">@{pendingProfile.username}</p>
                <p className="text-xs text-emerald-100/60 mt-0.5">
                  Capital: {currentSpawnState.capital}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-emerald-900/50 text-xs">
              <div className="bg-[#050f0a] p-3.5 rounded-xl border border-emerald-900/50">
                <span className="text-[11px] text-emerald-200/55 block mb-1">Starting Wealth</span>
                <span className="text-sm font-extrabold text-emerald-300 font-mono tabular-nums">
                  {formatNaira(totalWealth)}
                </span>
              </div>
              <div className="bg-[#050f0a] p-3.5 rounded-xl border border-emerald-900/50">
                <span className="text-[11px] text-emerald-200/55 block mb-1">Smartphone</span>
                <span className="text-xs font-bold text-white capitalize">
                  {pendingProfile.phoneModel.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="bg-[#050f0a] p-3.5 rounded-xl border border-emerald-900/50">
                <span className="text-[11px] text-emerald-200/55 block mb-1">Father&apos;s Rent Aid</span>
                <span className="text-xs font-bold text-amber-300 tabular-nums">
                  {pendingProfile.fatherRentSubsidyPct}% Paid by Father
                </span>
              </div>
              <div className="bg-[#050f0a] p-3.5 rounded-xl border border-emerald-900/50">
                <span className="text-[11px] text-emerald-200/55 block mb-1">Residence</span>
                <span className="text-xs font-bold text-emerald-50">
                  {isOwner || isNepo ? 'Two-Story Luxury Villa' : isMapo ? '4-Bedroom Flat' : 'Self-Contain Apartment'}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleProceedDirectlyToMap}
            className="w-full min-h-[52px] py-3.5 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#031209] font-extrabold text-base tracking-wide shadow-lg shadow-emerald-950/60 transition-colors flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Enter {currentSpawnState.name} Map</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="mt-4 flex items-center justify-center gap-4 text-xs">
            <button
              type="button"
              onClick={() => setCurrentStep('PICK_SPAWN')}
              className="text-emerald-200/80 hover:text-emerald-300 transition-colors flex items-center gap-1.5 cursor-pointer font-semibold"
            >
              <Compass className="w-3.5 h-3.5 text-emerald-400" />
              <span>Change Starting State</span>
            </button>
            <span className="text-emerald-800">·</span>
            <button
              type="button"
              onClick={() => setCurrentStep('CUSTOMIZE')}
              className="text-emerald-200/65 hover:text-emerald-300 transition-colors cursor-pointer font-medium"
            >
              <span>Customize Character</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 'CUSTOMIZE' && pendingProfile) {
    return (
      <div className="fixed inset-0 w-screen h-screen min-h-[100dvh] z-50 flex items-center justify-center bg-[#040b07] text-white overflow-y-auto overflow-x-hidden py-8">
        <EmeraldAtmosphere showSkyline={false} />
        <div className="relative z-10 w-full flex justify-center">
          <CharacterCustomizer
            avatar={avatar}
            onChange={setAvatar}
            onProceed={handleCustomizationComplete}
            playerName={`${pendingProfile.firstName} ${pendingProfile.lastName}`}
          />
        </div>
      </div>
    );
  }

  if (currentStep === 'PICK_SPAWN' && pendingProfile) {
    return (
      <div className="fixed inset-0 w-screen h-screen min-h-[100dvh] z-50 flex items-center justify-center bg-[#040b07] text-white overflow-y-auto overflow-x-hidden py-8">
        <EmeraldAtmosphere showSkyline={false} />
        <div className="relative z-10 w-full flex justify-center">
          <SpawnStateSelector
            initialStateId={pendingProfile.spawnStateId || signupStateId}
            onSelectState={handleSpawnSelected}
            userName={`${pendingProfile.firstName} ${pendingProfile.lastName}`}
            socialClass={pendingProfile.socialClass}
            avatar={avatar}
          />
        </div>
      </div>
    );
  }

  // =========================================================================
  // MAIN AUTH GATE: LOGIN & 6-FIELD REGISTRATION
  // =========================================================================
  const isAuthDisabledError =
    errorMessage?.includes('Email/Password sign-in is not yet enabled') ||
    errorMessage?.includes('PASSWORD_LOGIN_DISABLED');

  const firebaseProvidersUrl = `https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/providers`;

  return (
    <div className="fixed inset-0 w-screen h-screen min-h-[100dvh] z-50 bg-[#040b07] text-[#f4f7f5] select-none overflow-y-auto overflow-x-hidden">
      <EmeraldAtmosphere />

      <div className="relative z-10 w-full max-w-5xl mx-auto min-h-full flex flex-col justify-center py-6 px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 lg:items-center gap-6 lg:gap-12">
          {/* Left Column: World Identity & Architectural Highlights */}
          <div className="lg:col-span-6 text-center lg:text-left space-y-5">
            <div className="flex items-center justify-center lg:justify-start gap-3.5">
              <div className="nl-emblem-float w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden border border-emerald-500/45 bg-[#071910] shadow-[0_12px_36px_rgba(0,0,0,0.65)] shrink-0">
                <img src="/nl-logo.png" alt="Naija Life Emblem" className="w-full h-full object-cover" />
              </div>
              <div>
                <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
                  Naija Life
                </h1>
                <p className="text-xs sm:text-sm text-emerald-300/80 font-medium lg:hidden">
                  36 Real States · Live Economy · Cloud Save
                </p>
              </div>
            </div>

            <div className="hidden lg:block space-y-6 max-w-md">
              <h2 className="font-display text-2xl xl:text-3xl font-bold text-emerald-50 leading-snug text-balance">
                Build your hustle across Nigeria&apos;s 36 states and beyond.
              </h2>
              <p className="text-sm text-emerald-100/70 leading-relaxed">
                Step into a living economy with Nigerian banking, real estate, street hustles, NEPA power cycles, and cross-border flights to Canada.
              </p>

              <div className="border-t border-emerald-900/55 pt-5 space-y-4 text-left">
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-xs font-bold text-emerald-400">01</span>
                  <div>
                    <h3 className="text-sm font-bold text-white">Real States &amp; Living Cities</h3>
                    <p className="text-xs text-emerald-100/60 mt-0.5">
                      Start in Lagos, Abuja, Port Harcourt, or any of the 36 states with dynamic neighborhoods.
                    </p>
                  </div>
                </div>
                <div className="flex items-baseline gap-3 border-t border-emerald-900/40 pt-4">
                  <span className="font-mono text-xs font-bold text-emerald-400">02</span>
                  <div>
                    <h3 className="text-sm font-bold text-white">Cross-Border Naira &amp; CAD Economy</h3>
                    <p className="text-xs text-emerald-100/60 mt-0.5">
                      Run businesses, invest, buy luxury rides, and exchange currency seamlessly between accounts.
                    </p>
                  </div>
                </div>
                <div className="flex items-baseline gap-3 border-t border-emerald-900/40 pt-4">
                  <span className="font-mono text-xs font-bold text-emerald-400">03</span>
                  <div>
                    <h3 className="text-sm font-bold text-white">Seamless Cross-Device Progress</h3>
                    <p className="text-xs text-emerald-100/60 mt-0.5">
                      Your location, properties, and wealth stay synced wherever you sign in.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Auth Card */}
          <div className="lg:col-span-6 w-full max-w-md mx-auto lg:ml-auto lg:mr-0">
            {/* Auth Mode Switcher */}
            <div className="grid grid-cols-2 p-1 bg-[#06120c] border border-emerald-900/60 rounded-xl mb-3.5 shadow-lg">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('LOGIN');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`min-h-[40px] py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  authMode === 'LOGIN'
                    ? 'bg-emerald-500 text-[#031209] shadow-sm'
                    : 'text-emerald-200/70 hover:text-white'
                }`}
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('SIGNUP');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`min-h-[40px] py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  authMode === 'SIGNUP'
                    ? 'bg-emerald-500 text-[#031209] shadow-sm'
                    : 'text-emerald-200/70 hover:text-white'
                }`}
              >
                Create Account
              </button>
            </div>

            <div className="bg-[#08150f]/94 border border-emerald-800/50 rounded-2xl p-5 sm:p-6 shadow-[0_24px_65px_rgba(0,0,0,0.78)] backdrop-blur-xl">
              {/* Primary Instant Google Sign-In / Sign-Up CTA */}
              <button
                type="button"
                disabled={isSubmitting || isProcessingRedirect}
                onClick={handleGoogleSignIn}
                className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-white hover:bg-emerald-50 disabled:opacity-60 text-[#05140c] font-bold text-xs sm:text-sm tracking-wide shadow-md transition-colors cursor-pointer flex items-center justify-center gap-2.5"
              >
                {isSubmitting || isProcessingRedirect ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#05140c]" />
                ) : (
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.37 24 12 24Z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"
                    />
                  </svg>
                )}
                <span>
                  {isProcessingRedirect
                    ? 'Completing Google Sign-In...'
                    : authMode === 'SIGNUP'
                    ? 'Sign Up with Google'
                    : 'Sign In with Google'}
                </span>
              </button>

              {/* Published / Popup-Blocked Direct Fallback Strip */}
              <div className="mt-2.5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] text-emerald-200/60">
                {isEmbeddedIframe ? (
                  <>
                    <a
                      href={typeof window !== 'undefined' ? window.location.href : '/'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-300 hover:text-emerald-200 font-semibold underline underline-offset-2 inline-flex items-center gap-1"
                    >
                      <span>Popup blocked? Open in Full Tab</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    {gisReady && (
                      <>
                        <span className="text-emerald-800">·</span>
                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={handleGoogleFedCmPrompt}
                          className="text-emerald-200 hover:text-white font-semibold cursor-pointer"
                        >
                          Try No-Popup Chooser
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <button
                    type="button"
                    disabled={isSubmitting || isProcessingRedirect}
                    onClick={handleGoogleRedirectSignIn}
                    className="text-emerald-300 hover:text-emerald-200 font-semibold underline underline-offset-2 cursor-pointer"
                  >
                    Popup not opening? Sign in via Redirect
                  </button>
                )}
              </div>

              <div className="my-4 flex items-center gap-3">
                <div className="h-px flex-1 bg-emerald-900/60" />
                <span className="text-[11px] font-semibold text-emerald-200/50">Or with email</span>
                <div className="h-px flex-1 bg-emerald-900/60" />
              </div>

              {isPasswordAuthEnabled === false && !errorMessage && (
                <div className="mb-3.5 p-3 rounded-xl bg-amber-950/40 border border-amber-500/35 text-amber-200 text-[11px] flex flex-col gap-1.5">
                  <div>
                    <strong className="text-amber-300">Note:</strong> Email/Password sign-in is disabled in Firebase Console. Use <strong className="text-white">Google Sign-In</strong> above or enable it below.
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <a
                      href={firebaseProvidersUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-semibold text-amber-300 underline hover:text-amber-200 inline-flex items-center gap-1"
                    >
                      <span>Open Firebase Console</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <span className="text-emerald-800">·</span>
                    <button
                      type="button"
                      disabled={checkingProviderStatus}
                      onClick={refreshProviderStatus}
                      className="text-[11px] font-semibold text-emerald-300 hover:text-emerald-200 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className={`w-3 h-3 ${checkingProviderStatus ? 'animate-spin' : ''}`} />
                      <span>{checkingProviderStatus ? 'Checking...' : 'Re-check Status'}</span>
                    </button>
                  </div>
                </div>
              )}

              {successMessage && (
                <div className="mb-3.5 p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-200 text-xs flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                  <span>{successMessage}</span>
                </div>
              )}

              {errorMessage && (
                <div className="mb-3.5 p-3 rounded-xl bg-rose-950/70 border border-rose-500/60 text-rose-200 text-xs space-y-2">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                    <span>{errorMessage}</span>
                  </div>
                  {(errorMessage.toLowerCase().includes('popup') || errorMessage.toLowerCase().includes('embedded')) && (
                    <div className="pl-6 space-y-2">
                      <p className="text-[11px] text-emerald-100/80">
                        {isEmbeddedIframe
                          ? 'Published viewer frames often block pop-up sign-in windows. Open Naija Life directly in a full browser tab (or use the no-popup chooser) to sign in with Google:'
                          : 'Your browser blocked the pop-up window. Sign in directly using full-page Google Redirect (no pop-up required):'}
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        {!isEmbeddedIframe && (
                          <button
                            type="button"
                            disabled={isSubmitting}
                            onClick={handleGoogleRedirectSignIn}
                            className="px-3 py-1.5 rounded-lg bg-emerald-500 text-[#031209] font-bold text-[11px] hover:bg-emerald-400 inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <span>Continue via Google Redirect</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                        <a
                          href={typeof window !== 'undefined' ? window.location.href : '/'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-white text-[#05140c] font-bold text-[11px] hover:bg-emerald-50 inline-flex items-center gap-1.5"
                        >
                          <span>Open in Full Tab</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        <button
                          type="button"
                          onClick={handleCopyPublishedUrl}
                          className="px-3 py-1.5 rounded-lg bg-[#0b1f15] border border-emerald-800/60 text-emerald-100 font-semibold text-[11px] hover:bg-[#102b1d] inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Copy className="w-3 h-3" />
                          <span>{copiedAppLink ? 'Link Copied' : 'Copy Link'}</span>
                        </button>
                        {gisReady && (
                          <button
                            type="button"
                            disabled={isSubmitting}
                            onClick={handleGoogleFedCmPrompt}
                            className="px-3 py-1.5 rounded-lg bg-emerald-400 text-[#031209] font-bold text-[11px] hover:bg-emerald-300 inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <span>Try No-Popup Chooser</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                  {isAuthDisabledError && (
                    <div className="pl-6 space-y-2">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={handleGoogleSignIn}
                          className="px-3 py-1.5 rounded-lg bg-white text-[#05140c] font-bold text-[11px] hover:bg-emerald-50 cursor-pointer flex items-center gap-1.5"
                        >
                          <span>Continue with Google</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                        <a
                          href={firebaseProvidersUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-[#0b1f15] border border-emerald-700/60 text-emerald-300 font-semibold text-[11px] hover:bg-[#102b1d] inline-flex items-center gap-1"
                        >
                          <span>Enable in Firebase Console</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {authMode === 'SIGNUP' ? (
                <form onSubmit={handleSignupSubmit} className="space-y-3">
                  {/* 1. Email Address */}
                  <div>
                    <label className="text-xs font-semibold text-emerald-100 block mb-1">Email Address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        placeholder="citizen@example.com"
                        required
                        autoComplete="email"
                        className="w-full min-h-[42px] bg-[#040c08] border border-emerald-900/70 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-emerald-200/35 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30 font-mono"
                      />
                    </div>
                  </div>

                  {/* 2 & 3. Username + Date of Birth */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-emerald-100">Username</label>
                        <span className="text-[10px] text-emerald-200/45 font-mono">A-Z 0-9 _.-</span>
                      </div>
                      <div className="relative">
                        <User className="w-4 h-4 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={signupUsername}
                          onChange={(e) => setSignupUsername(e.target.value)}
                          placeholder="chiboy_52"
                          required
                          minLength={3}
                          maxLength={24}
                          autoComplete="username"
                          className="w-full min-h-[42px] bg-[#040c08] border border-emerald-900/70 rounded-xl pl-9 pr-7 py-2 text-xs text-white placeholder-emerald-200/35 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30 font-mono"
                        />
                        {usernameStatus.checking && (
                          <Loader2 className="w-3.5 h-3.5 text-emerald-300 animate-spin absolute right-2.5 top-1/2 -translate-y-1/2" />
                        )}
                      </div>
                      {usernameStatus.message && (
                        <p
                          className={`text-[11px] mt-1 font-medium ${
                            usernameStatus.checking
                              ? 'text-emerald-200/60'
                              : usernameStatus.available
                              ? 'text-emerald-400'
                              : 'text-rose-400'
                          }`}
                        >
                          {usernameStatus.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-emerald-100">Date of Birth</label>
                        <span className="text-[10px] text-emerald-200/45">Private</span>
                      </div>
                      <div className="relative">
                        <Calendar className="w-4 h-4 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="date"
                          value={dateOfBirth}
                          max={todayMaxDate}
                          min="1900-01-01"
                          onChange={(e) => setDateOfBirth(e.target.value)}
                          required
                          className="w-full min-h-[42px] bg-[#040c08] border border-emerald-900/70 rounded-xl pl-9 pr-2.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 4 & 5. Password + Confirm Password */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-emerald-100 block mb-1">Password</label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type={showSignupPassword ? 'text' : 'password'}
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          placeholder="Min 8 chars, strong"
                          required
                          autoComplete="new-password"
                          className="w-full min-h-[42px] bg-[#040c08] border border-emerald-900/70 rounded-xl pl-9 pr-9 py-2 text-xs text-white placeholder-emerald-200/35 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSignupPassword(!showSignupPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-emerald-200/60 hover:text-white cursor-pointer"
                          aria-label="Toggle password visibility"
                        >
                          {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-emerald-100 block mb-1">Confirm Password</label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-enter password"
                          required
                          autoComplete="new-password"
                          className="w-full min-h-[42px] bg-[#040c08] border border-emerald-900/70 rounded-xl pl-9 pr-9 py-2 text-xs text-white placeholder-emerald-200/35 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-emerald-200/60 hover:text-white cursor-pointer"
                          aria-label="Toggle confirm password visibility"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {signupPassword.length > 0 && (
                    <div className="space-y-1">
                      <div className="grid grid-cols-4 gap-1.5">
                        {[1, 2, 3, 4].map((lvl) => (
                          <div
                            key={lvl}
                            className={`h-1 rounded-full ${
                              pwdStrength.score >= lvl
                                ? pwdStrength.score >= 4
                                  ? 'bg-emerald-400'
                                  : pwdStrength.score >= 3
                                  ? 'bg-amber-400'
                                  : 'bg-rose-400'
                                : 'bg-emerald-950'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-[11px] text-emerald-200/70">
                        {pwdStrength.valid ? 'Strong password ready.' : pwdStrength.error}
                      </p>
                    </div>
                  )}

                  {confirmPassword.length > 0 && confirmPassword !== signupPassword && (
                    <p className="text-[11px] text-rose-400">Passwords do not match.</p>
                  )}

                  {/* 6. Create Account Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting || (usernameStatus.available === false && !usernameStatus.checking)}
                    className="w-full min-h-[46px] py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-[#031209] font-extrabold text-xs tracking-wide shadow-lg shadow-emerald-950/60 transition-colors cursor-pointer flex items-center justify-center gap-2 mt-1"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    <span>{isSubmitting ? 'Creating Account...' : 'Create Account & Send Verification'}</span>
                    {!isSubmitting && <ArrowRight className="w-4 h-4" />}
                  </button>

                  {signupEmail.trim().toLowerCase() === OWNER_EMAIL &&
                    signupUsername.trim().toLowerCase() === OWNER_USERNAME && (
                      <p className="text-[11px] text-amber-300 text-center font-medium">
                        Apex Syndicate Owner identity detected — privileges will activate server-side once email verification completes.
                      </p>
                    )}
                </form>
              ) : (
                <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                  <div>
                    <label className="text-xs font-semibold text-emerald-100 block mb-1.5">Email Address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="Enter your registered email"
                        required
                        autoComplete="email"
                        className="w-full min-h-[44px] bg-[#040c08] border border-emerald-900/70 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-emerald-200/35 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-emerald-100 block mb-1.5">Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showLoginPassword ? 'text' : 'password'}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                        autoComplete="current-password"
                        className="w-full min-h-[44px] bg-[#040c08] border border-emerald-900/70 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-emerald-200/35 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-200/60 hover:text-white cursor-pointer"
                        aria-label="Toggle password visibility"
                      >
                        {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-0.5">
                    <label className="flex items-center gap-2 text-emerald-100/80 cursor-pointer">
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={rememberMe}
                        onClick={() => setRememberMe(!rememberMe)}
                        className={`w-4 h-4 rounded flex items-center justify-center border transition-colors cursor-pointer ${
                          rememberMe ? 'bg-emerald-500 border-emerald-400 text-[#031209]' : 'bg-[#040c08] border-emerald-800'
                        }`}
                      >
                        {rememberMe && <Check className="w-3 h-3 stroke-[3]" />}
                      </button>
                      <span>Remember me on this device</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => {
                        setResetEmail(loginEmail);
                        setErrorMessage(null);
                        setSuccessMessage(null);
                        setCurrentStep('FORGOT_PASSWORD');
                      }}
                      className="text-emerald-300 hover:text-emerald-200 font-semibold cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full min-h-[46px] py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-[#031209] font-extrabold text-sm tracking-wide shadow-lg shadow-emerald-950/60 transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    <span>{isSubmitting ? 'Signing In & Loading Save...' : 'Log In & Enter Naija Life'}</span>
                    {!isSubmitting && <ArrowRight className="w-4 h-4" />}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
