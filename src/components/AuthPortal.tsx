/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
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
  loadAuthenticatedCitizenSession,
  loginCitizenAccount,
  logoutFirebaseUser,
  registerCitizenAccount,
  resendCurrentUserVerification,
  sendPasswordReset,
  signInWithGooglePopup,
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
    avatar,
    spawnStateId,
    lastLocationStateId: spawnStateId,
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
    hairstyle: 'fade',
    hairColor: '#18181b',
    outfit: 'streetwear',
    pants: 'jeans',
    shoes: 'sneakers',
    accessory: 'designer_shades',
  });
  const [signupStateId, setSignupStateId] = useState('lagos');
  const [pendingProfile, setPendingProfile] = useState<UserProfile | null>(null);
  const [pendingCloudSave, setPendingCloudSave] = useState<CloudGameSaveDoc | null>(null);

  // Loading & Feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPasswordAuthEnabled, setIsPasswordAuthEnabled] = useState<boolean | null>(null);
  const [checkingProviderStatus, setCheckingProviderStatus] = useState(false);

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
  // GOOGLE SIGN-IN HANDLER (Popup Auth + Cross-Device Sync + First-Time Profile)
  // =========================================================================
  const handleGoogleSignIn = async () => {
    // Call signInWithGooglePopup() before any state/await overhead that could risk losing transient activation
    const popupPromise = signInWithGooglePopup();
    setErrorMessage(null);
    setSuccessMessage(null);
    const prefilledUname = authMode === 'SIGNUP' ? validateUsernameInput(signupUsername) : null;
    const prefilledDob = authMode === 'SIGNUP' ? validateBirthdayInput(dateOfBirth) : null;

    setIsSubmitting(true);
    try {
      const result = await popupPromise;
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

        // If citizen already filled a valid username & birthday on the signup form, complete registration directly!
        if (prefilledUname?.valid && prefilledDob?.valid) {
          try {
            const starterProfile = buildStarterProfile({
              email: googleEmail.toLowerCase(),
              username: prefilledUname.trimmed,
              dateOfBirth,
              avatar,
              spawnStateId: signupStateId,
            });
            const completed = await completeGoogleCitizenRegistration({
              user: result.user,
              username: prefilledUname.trimmed,
              dateOfBirth,
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
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Google Sign-In failed.');
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
      <div className="fixed inset-0 w-screen h-screen min-h-[100dvh] z-50 flex items-center justify-center bg-black text-white p-4">
        <div className="w-full max-w-md bg-zinc-950 border-2 border-rose-500/60 rounded-3xl p-7 text-center shadow-2xl space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8 text-rose-400" />
          </div>
          <h2 className="text-2xl font-black text-white">ACCOUNT SUSPENDED</h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Access to Naija Life servers has been restricted for this account by Apex Syndicate administration.
          </p>
          <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-200 font-medium">
            {suspendedReason || 'Administrative suspension in effect.'}
          </div>
          <button
            type="button"
            onClick={handleLogoutAndReturn}
            className="w-full py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-black flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out & Return to Login</span>
          </button>
        </div>
      </div>
    );
  }

  if (currentStep === 'VERIFY_EMAIL') {
    return (
      <div className="fixed inset-0 w-screen h-screen min-h-[100dvh] z-50 flex items-center justify-center bg-black text-white p-4 overflow-y-auto">
        <div className="w-full max-w-md bg-zinc-950 border-2 border-emerald-500/50 rounded-3xl p-7 shadow-2xl space-y-4">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center mx-auto">
              <Mail className="w-7 h-7 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-black text-white">VERIFY YOUR EMAIL</h2>
            <p className="text-xs text-zinc-400">
              We sent a verification link to{' '}
              <strong className="text-emerald-300 font-mono">{pendingVerifyEmail || auth.currentUser?.email}</strong>.
            </p>
          </div>

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-500 text-emerald-300 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-500 text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-[11px] text-zinc-300 space-y-1.5">
            <p className="font-bold text-white flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Why verify?</span>
            </p>
            <p className="text-zinc-400 leading-relaxed">
              Email verification protects your cross-device cloud saves, unlocks account recovery, and secures Apex Syndicate role provisioning.
            </p>
          </div>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleCheckVerification}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:brightness-110 disabled:opacity-60 text-zinc-950 font-black text-xs uppercase tracking-wide flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            <span>I Have Verified — Check Status & Continue</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={isSubmitting || resendCooldown > 0}
              onClick={handleResendVerification}
              className="py-2.5 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 border border-zinc-700 text-xs font-bold text-zinc-200 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
              <span>{resendCooldown > 0 ? `Resend (${resendCooldown}s)` : 'Resend Link'}</span>
            </button>
            <button
              type="button"
              onClick={handleLogoutAndReturn}
              className="py-2.5 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-bold text-zinc-300 flex items-center justify-center gap-1.5 cursor-pointer"
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
      <div className="fixed inset-0 w-screen h-screen min-h-[100dvh] z-50 flex items-center justify-center bg-[#060809] text-white p-4 overflow-y-auto">
        <div className="w-full max-w-md bg-zinc-950 border-2 border-emerald-500/50 rounded-3xl p-7 shadow-2xl space-y-4">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-7 h-7 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-black text-white">COMPLETE CITIZEN PROFILE</h2>
            <p className="text-xs text-zinc-400">
              Google verified <strong className="text-emerald-300 font-mono">{activeGoogleEmail}</strong>. Choose your unique username and private birthday to activate your cross-device account.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-500 text-rose-200 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleCompleteGoogleProfile} className="space-y-3.5">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-zinc-300">Username</label>
                <span className="text-[10px] text-zinc-400 font-mono">A-Z, 0-9, _ . -</span>
              </div>
              <div className="relative">
                <User className="w-4 h-4 text-orange-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={signupUsername}
                  onChange={(e) => setSignupUsername(e.target.value)}
                  placeholder="e.g. chiboy_52 or naija.gamer"
                  required
                  minLength={3}
                  maxLength={24}
                  autoComplete="username"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-9 pr-8 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-400 font-mono"
                />
                {usernameStatus.checking && (
                  <Loader2 className="w-3.5 h-3.5 text-zinc-400 animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
                )}
              </div>
              {usernameStatus.message && (
                <p
                  className={`text-[10px] mt-1 font-medium ${
                    usernameStatus.checking
                      ? 'text-zinc-400'
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
                <label className="text-xs font-bold text-zinc-300">Date of Birth</label>
                <span className="text-[10px] text-zinc-500">Private · Never shown publicly</span>
              </div>
              <div className="relative">
                <Calendar className="w-4 h-4 text-amber-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  value={dateOfBirth}
                  max={todayMaxDate}
                  min="1900-01-01"
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  required
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {isPendingOwnerMatch && (
              <p className="text-[11px] text-amber-300 text-center font-medium bg-amber-950/40 border border-amber-500/30 rounded-xl p-2">
                Verified Apex Syndicate Owner identity detected — master Owner privileges will be provisioned server-side upon activation.
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting || (usernameStatus.available === false && !usernameStatus.checking)}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:brightness-110 disabled:opacity-60 text-zinc-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>{isSubmitting ? 'Activating Account...' : 'Activate Citizen Account & Continue'}</span>
              {!isSubmitting && <ArrowRight className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={handleLogoutAndReturn}
              className="w-full py-2.5 text-xs font-bold text-zinc-400 hover:text-white cursor-pointer flex items-center justify-center gap-1.5"
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
      <div className="fixed inset-0 w-screen h-screen min-h-[100dvh] z-50 flex items-center justify-center bg-black text-white p-4">
        <div className="w-full max-w-md bg-zinc-950 border-2 border-amber-500/40 rounded-3xl p-7 shadow-2xl space-y-4">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center mx-auto">
              <KeyRound className="w-6 h-6 text-amber-400" />
            </div>
            <h2 className="text-2xl font-black text-white">RESET PASSWORD</h2>
            <p className="text-xs text-zinc-400">
              Enter your registered email address and we will send a secure password reset link.
            </p>
          </div>

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-500 text-emerald-300 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-500 text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-zinc-300 block mb-1.5">Registered Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 disabled:opacity-60 text-zinc-950 font-black text-xs uppercase tracking-wide flex items-center justify-center gap-2 cursor-pointer"
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
              className="w-full py-2.5 text-xs font-bold text-zinc-400 hover:text-white cursor-pointer"
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
      <div className="fixed inset-0 w-screen h-screen min-h-[100dvh] z-50 flex items-center justify-center bg-zinc-950 text-white select-none overflow-y-auto overflow-x-hidden py-6 px-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/30 via-zinc-950 to-black pointer-events-none" />
        <div className="relative z-10 w-full max-w-lg mx-auto flex flex-col items-center text-center">
          <div className="mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black tracking-widest uppercase mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>CITIZEN STATUS UNLOCKED</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              {isOwner ? 'APEX SYNDICATE OWNER VERIFIED' : 'YOUR NIGERIAN BACKGROUND'}
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              {isOwner
                ? 'Verified owner identity confirmed. Master privileges & registry control active.'
                : 'Here is your official social class and starting package.'}
            </p>
          </div>

          <div className="w-full bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 shadow-2xl backdrop-blur-md mb-5 relative overflow-hidden text-left">
            <div className="flex items-center justify-between mb-4 gap-2">
              <span className="flex items-center gap-1.5 text-xs text-emerald-300 font-bold">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>Spawning in {currentSpawnState.name} ({currentSpawnState.zone})</span>
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-black tracking-wide uppercase flex items-center gap-1.5 ${
                  isNepo
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : isMapo
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}
              >
                <Crown className="w-3.5 h-3.5" />
                <span>{isOwner ? 'OWNER (NEPO)' : `${pendingProfile.socialClass.toUpperCase()} STATUS`}</span>
              </span>
            </div>

            <div className="flex items-center gap-4 bg-zinc-950/70 border border-zinc-800 p-3.5 rounded-2xl mb-4">
              <CharacterRenderer avatar={avatar} size="sm" showBackground={false} />
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <span>{pendingProfile.firstName} {pendingProfile.lastName}</span>
                  {isOwner && (
                    <span className="px-2 py-0.5 rounded bg-amber-400 text-black text-[10px] font-black uppercase">
                      OWNER
                    </span>
                  )}
                </h3>
                <p className="text-xs text-emerald-400 font-mono">@{pendingProfile.username}</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Capital: {currentSpawnState.capital}
                </p>
              </div>
            </div>

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
                <span className="text-[10px] text-zinc-500 uppercase font-bold block mb-1">Father&apos;s Rent Aid</span>
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

          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleProceedDirectlyToMap}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-zinc-950 font-black text-lg tracking-wide shadow-xl shadow-emerald-500/25 transition-all flex items-center justify-center gap-3 cursor-pointer"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>ENTER {currentSpawnState.name.toUpperCase()} MAP</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <div className="mt-3 flex items-center justify-center gap-4 text-xs">
            <button
              type="button"
              onClick={() => setCurrentStep('PICK_SPAWN')}
              className="text-zinc-300 hover:text-emerald-400 transition-colors flex items-center gap-1 cursor-pointer font-bold"
            >
              <Compass className="w-3.5 h-3.5 text-emerald-400" />
              <span>Change Starting State</span>
            </button>
            <span className="text-zinc-600">·</span>
            <button
              type="button"
              onClick={() => setCurrentStep('CUSTOMIZE')}
              className="text-zinc-400 hover:text-emerald-400 transition-colors cursor-pointer"
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

  if (currentStep === 'PICK_SPAWN' && pendingProfile) {
    return (
      <div className="fixed inset-0 w-screen h-screen min-h-[100dvh] z-50 flex items-center justify-center bg-zinc-950 text-white overflow-y-auto overflow-x-hidden py-8">
        <SpawnStateSelector
          initialStateId={pendingProfile.spawnStateId || signupStateId}
          onSelectState={handleSpawnSelected}
          userName={`${pendingProfile.firstName} ${pendingProfile.lastName}`}
          socialClass={pendingProfile.socialClass}
          avatar={avatar}
        />
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
    <div className="fixed inset-0 w-screen h-screen min-h-[100dvh] z-50 flex items-center justify-center bg-[#060809] text-white select-none overflow-y-auto overflow-x-hidden py-4 px-4">
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-500/15 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute bottom-0 -right-32 w-96 h-96 bg-orange-500/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0596690a_1px,transparent_1px),linear-gradient(to_bottom,#0596690a_1px,transparent_1px)] bg-[size:36px_36px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-lg mx-auto my-auto">
        <div className="text-center mb-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/90 border border-orange-500/40 text-orange-300 text-[10px] font-black tracking-widest uppercase mb-2 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>CROSS-DEVICE CLOUD ACCOUNTS ACTIVE</span>
          </div>

          <div className="flex items-center justify-center gap-3 mb-1">
            <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-[0_0_20px_rgba(16,185,129,0.45)] border-2 border-emerald-400/60 shrink-0">
              <img src="/nl-logo.png" alt="Naija Life NL Emblem" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-amber-200 to-orange-400">
              NAIJA LIFE
            </h1>
          </div>
          <p className="text-[11px] text-zinc-400 font-medium">
            36 Real States · Live Economy · Persistent Cross-Device Save
          </p>
        </div>

        {/* Auth Mode Switcher */}
        <div className="grid grid-cols-2 p-1 bg-zinc-900/90 border border-zinc-800 rounded-2xl mb-3 shadow-xl">
          <button
            type="button"
            onClick={() => {
              setAuthMode('LOGIN');
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className={`py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
              authMode === 'LOGIN'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-zinc-950 shadow-lg'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            LOG IN
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('SIGNUP');
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className={`py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
              authMode === 'SIGNUP'
                ? 'bg-gradient-to-r from-orange-500 to-amber-400 text-zinc-950 shadow-lg'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            CREATE NEW LIFE
          </button>
        </div>

        <div className="bg-zinc-950/95 border border-zinc-800 rounded-3xl p-5 shadow-2xl backdrop-blur-xl">
          {/* Primary Instant Google Sign-In / Sign-Up CTA — Always visible without scrolling */}
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleGoogleSignIn}
            className="w-full py-3 px-4 rounded-xl bg-white hover:bg-zinc-100 disabled:opacity-60 text-zinc-950 font-black text-xs tracking-wide shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2.5"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin text-zinc-900" />
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
              {authMode === 'SIGNUP'
                ? 'Sign Up Instantly with Google (Verified Cloud Account)'
                : 'Sign In with Google'}
            </span>
          </button>

          <div className="my-3.5 flex items-center gap-3">
            <div className="h-px flex-1 bg-zinc-800" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Or Email &amp; Password</span>
            <div className="h-px flex-1 bg-zinc-800" />
          </div>

          {isPasswordAuthEnabled === false && !errorMessage && (
            <div className="mb-3 p-2.5 rounded-xl bg-amber-950/50 border border-amber-500/40 text-amber-200 text-[11px] flex flex-col gap-1.5">
              <div className="flex items-start justify-between gap-2">
                <span>
                  <strong className="text-amber-300">Tip:</strong> Email/Password login is currently off in Firebase Console, so use <strong className="text-white">Sign Up / Sign In with Google</strong> above to enter immediately.
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={firebaseProvidersUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] font-bold text-amber-300 underline hover:text-amber-200 inline-flex items-center gap-1"
                >
                  <span>Enable Email/Password in Firebase Console</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
                <span className="text-zinc-600">·</span>
                <button
                  type="button"
                  disabled={checkingProviderStatus}
                  onClick={refreshProviderStatus}
                  className="text-[10px] font-bold text-emerald-300 hover:text-emerald-200 inline-flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className={`w-2.5 h-2.5 ${checkingProviderStatus ? 'animate-spin' : ''}`} />
                  <span>{checkingProviderStatus ? 'Checking...' : 'Re-check Status'}</span>
                </button>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="mb-3 p-3 rounded-xl bg-emerald-950/70 border border-emerald-500 text-emerald-300 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="mb-3 p-3 rounded-xl bg-rose-950/70 border border-rose-500 text-rose-200 text-xs space-y-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
              {errorMessage.toLowerCase().includes('popup') && (
                <div className="pl-6 space-y-2">
                  <p className="text-[11px] text-amber-200">
                    Tip: Click the blocked pop-up icon in your browser&apos;s address bar to allow pop-ups, or open Naija Life in a full browser tab to sign in with Google cleanly:
                  </p>
                  <a
                    href={typeof window !== 'undefined' ? window.location.href : '/'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-white text-zinc-950 font-black text-[11px] hover:bg-zinc-200 inline-flex items-center gap-1.5"
                  >
                    <span>Open App in Full Browser Tab</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
              {isAuthDisabledError && (
                <div className="pl-6 space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={handleGoogleSignIn}
                      className="px-3 py-1.5 rounded-lg bg-white text-zinc-950 font-black text-[11px] hover:bg-zinc-200 cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Continue with Google Now</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                    <a
                      href={firebaseProvidersUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-amber-400/50 text-amber-300 font-bold text-[11px] hover:bg-zinc-800 inline-flex items-center gap-1"
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
            <form onSubmit={handleSignupSubmit} className="space-y-2.5">
              {/* 1. Email Address */}
              <div>
                <label className="text-[11px] font-bold text-zinc-300 block mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="citizen@example.com"
                    required
                    autoComplete="email"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400 font-mono"
                  />
                </div>
              </div>

              {/* 2 & 3. Username + Date of Birth side by side on wider screens */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-zinc-300">Username</label>
                    <span className="text-[9px] text-zinc-400 font-mono">A-Z 0-9 _ . -</span>
                  </div>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-orange-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={signupUsername}
                      onChange={(e) => setSignupUsername(e.target.value)}
                      placeholder="chiboy_52"
                      required
                      minLength={3}
                      maxLength={24}
                      autoComplete="username"
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-8 pr-7 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-400 font-mono"
                    />
                    {usernameStatus.checking && (
                      <Loader2 className="w-3.5 h-3.5 text-zinc-400 animate-spin absolute right-2.5 top-1/2 -translate-y-1/2" />
                    )}
                  </div>
                  {usernameStatus.message && (
                    <p
                      className={`text-[10px] mt-1 font-medium ${
                        usernameStatus.checking
                          ? 'text-zinc-400'
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
                    <label className="text-[11px] font-bold text-zinc-300">Date of Birth</label>
                    <span className="text-[9px] text-zinc-500">Private</span>
                  </div>
                  <div className="relative">
                    <Calendar className="w-3.5 h-3.5 text-amber-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="date"
                      value={dateOfBirth}
                      max={todayMaxDate}
                      min="1900-01-01"
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      required
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-8 pr-2.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>

              {/* 4 & 5. Password + Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-bold text-zinc-300 block mb-1">Password</label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-teal-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showSignupPassword ? 'text' : 'password'}
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="Min 8 chars, strong"
                      required
                      autoComplete="new-password"
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-8 pr-8 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupPassword(!showSignupPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white cursor-pointer"
                      aria-label="Toggle password visibility"
                    >
                      {showSignupPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-zinc-300 block mb-1">Confirm Password</label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-teal-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      required
                      autoComplete="new-password"
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-8 pr-8 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white cursor-pointer"
                      aria-label="Toggle confirm password visibility"
                    >
                      {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {signupPassword.length > 0 && (
                <div className="space-y-1">
                  <div className="grid grid-cols-4 gap-1">
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
                            : 'bg-zinc-800'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-[10px] text-zinc-400">
                    {pwdStrength.valid ? 'Strong password ready.' : pwdStrength.error}
                  </p>
                </div>
              )}

              {confirmPassword.length > 0 && confirmPassword !== signupPassword && (
                <p className="text-[10px] text-rose-400">Passwords do not match.</p>
              )}

              {/* 6. Create Account Button */}
              <button
                type="submit"
                disabled={isSubmitting || (usernameStatus.available === false && !usernameStatus.checking)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500 hover:brightness-110 disabled:opacity-60 text-zinc-950 font-black text-xs uppercase tracking-wider shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2 mt-1"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>{isSubmitting ? 'Creating Account...' : 'Create Account & Send Verification'}</span>
                {!isSubmitting && <ArrowRight className="w-4 h-4" />}
              </button>

              {signupEmail.trim().toLowerCase() === OWNER_EMAIL &&
                signupUsername.trim().toLowerCase() === OWNER_USERNAME && (
                  <p className="text-[10px] text-amber-300 text-center font-medium">
                    Apex Syndicate Owner identity detected — privileges will activate server-side once email verification completes.
                  </p>
                )}
            </form>
          ) : (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="Enter your registered email"
                    required
                    autoComplete="email"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-teal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white cursor-pointer"
                    aria-label="Toggle password visibility"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 text-zinc-300 cursor-pointer">
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={rememberMe}
                    onClick={() => setRememberMe(!rememberMe)}
                    className={`w-4 h-4 rounded flex items-center justify-center border transition-colors cursor-pointer ${
                      rememberMe ? 'bg-emerald-500 border-emerald-400 text-black' : 'bg-zinc-900 border-zinc-700'
                    }`}
                  >
                    {rememberMe && <Check className="w-3 h-3 stroke-[3]" />}
                  </button>
                  <span>Remember Me on this device</span>
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setResetEmail(loginEmail);
                    setErrorMessage(null);
                    setSuccessMessage(null);
                    setCurrentStep('FORGOT_PASSWORD');
                  }}
                  className="text-orange-400 hover:text-orange-300 font-bold cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:brightness-110 disabled:opacity-60 text-zinc-950 font-black text-sm tracking-wide shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                <span>{isSubmitting ? 'Signing In & Loading Cloud Save...' : 'Log In & Enter Naija Life'}</span>
                {!isSubmitting && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
