/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Laptop,
  FolderOpen,
  Globe,
  Code2,
  Settings,
  ShieldCheck,
  X,
  Play,
  CheckCircle2,
  Lock,
  Terminal,
  FileText,
  Sparkles,
  Power,
} from 'lucide-react';
import { UserProfile } from '../types/game';
import { formatNaira, formatCAD } from '../utils/formatNaira';
import { getAuthBearerHeaders } from '../services/economyService';

export interface LaptopOSProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  currentStateId?: string;
  onUpdateProfile?: (updatedProfile: UserProfile) => void;
  onShowToast?: (msg: string) => void;
  triggerSound?: (type: 'coin' | 'stamp' | 'alert' | 'success') => void;
}

interface CodingChallenge {
  id: string;
  title: string;
  levelRequired: number;
  xpReward: number;
  prompt: string;
  starterCode: string;
  testFn: (fn: (...args: any[]) => any) => boolean;
}

const CODING_CHALLENGES: CodingChallenge[] = [
  {
    id: 'ch_hello_function',
    title: 'Lesson 1: Safe Currency Formatter',
    levelRequired: 1,
    xpReward: 120,
    prompt: 'Write `function formatKoboToNaira(kobo)` that returns `Math.floor(kobo / 100)`.',
    starterCode: 'function formatKoboToNaira(kobo) {\n  return Math.floor(kobo / 100);\n}',
    testFn: (fn) => fn(25050) === 250 && fn(100) === 1 && fn(0) === 0,
  },
  {
    id: 'ch_fx_spread',
    title: 'Lesson 2: FX Margin Calculator',
    levelRequired: 2,
    xpReward: 180,
    prompt: 'Write `function calcNet(amount, feePct)` returning `amount - amount * (feePct / 100)`.',
    starterCode: 'function calcNet(amount, feePct) {\n  return amount - amount * (feePct / 100);\n}',
    testFn: (fn) => Math.abs(fn(1000, 1) - 990) < 0.001 && Math.abs(fn(200, 5) - 190) < 0.001,
  },
  {
    id: 'ch_sanitize_handle',
    title: 'Lesson 3: Sanitize Social Handle',
    levelRequired: 3,
    xpReward: 240,
    prompt: 'Write `function cleanHandle(raw)` that strips leading `@`, trims, and lowercases.',
    starterCode: 'function cleanHandle(raw) {\n  return String(raw).trim().replace(/^@/, "").toLowerCase();\n}',
    testFn: (fn) => fn(' @Chiboy_52 ') === 'chiboy_52' && fn('Lagos') === 'lagos',
  },
  {
    id: 'ch_rate_limiter',
    title: 'Lesson 4: Request Burst Check',
    levelRequired: 4,
    xpReward: 320,
    prompt: 'Write `function isAllowed(count, limit)` returning true when count <= limit and count >= 0.',
    starterCode: 'function isAllowed(count, limit) {\n  return count >= 0 && count <= limit;\n}',
    testFn: (fn) => fn(3, 5) === true && fn(6, 5) === false && fn(-1, 5) === false,
  },
  {
    id: 'ch_hash_verify',
    title: 'Lesson 5: HMAC Checksum Guard',
    levelRequired: 5,
    xpReward: 420,
    prompt: 'Write `function matchesToken(a, b)` that compares equal-length strings strictly.',
    starterCode: 'function matchesToken(a, b) {\n  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false;\n  let diff = 0;\n  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);\n  return diff === 0;\n}',
    testFn: (fn) => fn('sec_99', 'sec_99') === true && fn('sec_99', 'sec_98') === false,
  },
  {
    id: 'ch_jwt_exp',
    title: 'Lesson 6: Session Token Expiry Gate',
    levelRequired: 6,
    xpReward: 550,
    prompt: 'Write `function isTokenValid(expMs, nowMs)` returning true when expMs > nowMs.',
    starterCode: 'function isTokenValid(expMs, nowMs) {\n  return Number(expMs) > Number(nowMs);\n}',
    testFn: (fn) => fn(2000, 1000) === true && fn(1000, 1000) === false,
  },
];

const CYBER_MISSIONS = [
  {
    id: 'cyber_waf_patch',
    title: 'FinTech API Firewall Audit',
    xpReward: 450,
    payoutNGN: 450000,
    payoutCAD: 480,
    desc: 'Patch SQL injection & idempotency bypass in banking settlement gateway.',
  },
  {
    id: 'cyber_ddos_shield',
    title: 'National Grid Telemetry Hardening',
    xpReward: 620,
    payoutNGN: 720000,
    payoutCAD: 760,
    desc: 'Enforce strict rate limits and TLS pinning across substation nodes.',
  },
  {
    id: 'cyber_zero_trust',
    title: 'Cross-Border Passport HSM Rotation',
    xpReward: 850,
    payoutNGN: 1150000,
    payoutCAD: 1200,
    desc: 'Audit hardware signing keys and revoke compromised service credentials.',
  },
];

type WindowId = 'files' | 'browser' | 'coding' | 'cyber' | 'settings';

export const LaptopOS: React.FC<LaptopOSProps> = ({
  isOpen,
  onClose,
  userProfile,
  currentStateId = 'lagos',
  onUpdateProfile,
  onShowToast,
  triggerSound,
}) => {
  const isCanada = currentStateId === 'canada' || userProfile.currentCountry === 'canada';

  const [activeWindow, setActiveWindow] = useState<WindowId>('coding');
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [wallpaper, setWallpaper] = useState<'aurora' | 'matrix' | 'sunset'>('aurora');
  const [catalog, setCatalog] = useState<any[]>([]);
  const [selectedChallengeId, setSelectedChallengeId] = useState<string>(CODING_CHALLENGES[0].id);
  const [codeDraft, setCodeDraft] = useState<string>(CODING_CHALLENGES[0].starterCode);
  const [consoleOutput, setConsoleOutput] = useState<string>('Ready. Write your function and click Run Tests.');
  const [browserPage, setBrowserPage] = useState<'portal' | 'docs' | 'cyber_brief'>('portal');
  const [busy, setBusy] = useState(false);

  const loadLaptops = useCallback(async () => {
    try {
      const headers = await getAuthBearerHeaders();
      const resp = await fetch('/api/laptops/state', { headers });
      const data = await resp.json();
      if (resp.ok && data.success) {
        setCatalog(data.catalog || []);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (isOpen) loadLaptops();
  }, [isOpen, loadLaptops]);

  const currentChallenge = useMemo(
    () => CODING_CHALLENGES.find((c) => c.id === selectedChallengeId) || CODING_CHALLENGES[0],
    [selectedChallengeId]
  );

  const codingLevel = userProfile.codingLevel || 1;
  const codingXp = userProfile.codingXp || 0;
  const completedChallenges = userProfile.completedCodingChallenges || [];
  const completedMissions = userProfile.completedCyberMissions || [];
  const activeLaptopModel =
    catalog.find((l) => l.id === userProfile.activeLaptopId) ||
    catalog.find((l) => (userProfile.ownedLaptops || []).includes(l.id)) ||
    null;

  if (!isOpen) return null;

  const runChallengeTests = async () => {
    try {
      const match = codeDraft.match(/function\s+([a-zA-Z_$][0-9a-zA-Z_$]*)/);
      const fnName = match?.[1];
      if (!fnName) {
        setConsoleOutput('ERROR: Define a named JavaScript function first.');
        return;
      }
      // eslint-disable-next-line no-new-func
      const runner = new Function(`${codeDraft}\nreturn ${fnName};`);
      const compiledFn = runner();
      if (typeof compiledFn !== 'function') {
        setConsoleOutput('ERROR: Compiled symbol is not a function.');
        return;
      }
      const passed = currentChallenge.testFn(compiledFn);
      if (!passed) {
        setConsoleOutput('FAILED: One or more unit assertions returned false. Adjust your logic and re-run.');
        triggerSound?.('alert');
        return;
      }

      setConsoleOutput(`PASSED! All test cases succeeded. Submitting +${currentChallenge.xpReward} XP...`);
      setBusy(true);
      const headers = await getAuthBearerHeaders();
      const resp = await fetch('/api/coding/complete', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          kind: 'challenge',
          id: currentChallenge.id,
          xpEarned: currentChallenge.xpReward,
        }),
      });
      const data = await resp.json();
      if (resp.ok && data.account && onUpdateProfile) {
        onUpdateProfile({
          ...userProfile,
          codingXp: data.account.codingXp,
          codingLevel: data.account.codingLevel,
          completedCodingChallenges: data.account.completedCodingChallenges,
        });
        setConsoleOutput(
          `VERIFIED! Level ${data.account.codingLevel} (${data.account.codingXp} XP). ${
            data.account.codingLevel >= 7 ? 'CYBERSECURITY DEFENSE MODULE UNLOCKED!' : ''
          }`
        );
        triggerSound?.('success');
      } else {
        setConsoleOutput(data.error || 'Challenge completed locally.');
      }
    } catch (err) {
      setConsoleOutput(`RUNTIME ERROR: ${err instanceof Error ? err.message : 'Syntax error'}`);
      triggerSound?.('alert');
    } finally {
      setBusy(false);
    }
  };

  const runCyberMission = async (mission: (typeof CYBER_MISSIONS)[number]) => {
    if (codingLevel < 7) {
      onShowToast?.('Reach Coding Level 7 first to unlock Cybersecurity Defense Operations!');
      triggerSound?.('alert');
      return;
    }
    setBusy(true);
    try {
      const payout = isCanada ? mission.payoutCAD : mission.payoutNGN;
      const currency = isCanada ? 'CAD' : 'NGN';
      const headers = await getAuthBearerHeaders();
      const resp = await fetch('/api/coding/complete', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          kind: 'cyber_mission',
          id: mission.id,
          xpEarned: mission.xpReward,
          payoutAmount: payout,
          currency,
        }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        onShowToast?.(data.error || 'Mission blocked.');
        triggerSound?.('alert');
        return;
      }
      if (data.account && onUpdateProfile) {
        onUpdateProfile({
          ...userProfile,
          ngnKobo: data.account.ngnKobo,
          cadCents: data.account.cadCents,
          bankNaira: data.account.bankNaira,
          cashNaira: 0,
          bankCAD: data.account.bankCAD,
          codingXp: data.account.codingXp,
          codingLevel: data.account.codingLevel,
          completedCyberMissions: data.account.completedCyberMissions,
          receipts: data.account.receipts,
        });
      }
      onShowToast?.(
        `Contract Paid: +${currency === 'CAD' ? formatCAD(payout) : formatNaira(payout)} (${mission.title})`
      );
      triggerSound?.('coin');
    } finally {
      setBusy(false);
    }
  };

  const wallpaperClass =
    wallpaper === 'matrix'
      ? 'bg-gradient-to-br from-emerald-950 via-zinc-950 to-black'
      : wallpaper === 'sunset'
      ? 'bg-gradient-to-br from-indigo-950 via-rose-950/60 to-zinc-950'
      : 'bg-gradient-to-br from-slate-950 via-emerald-950/40 to-zinc-950';

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-5 select-none">
      {/* Laptop Aluminum Bezel */}
      <div className={`w-full max-w-4xl h-[90vh] max-h-[680px] rounded-3xl border-4 border-zinc-700 shadow-[0_30px_90px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden ${wallpaperClass}`}>
        {/* Top OS Status Bar */}
        <div className="px-4 py-2 bg-black/80 border-b border-white/10 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Laptop className="w-4 h-4 text-emerald-400" />
            <span className="font-black text-white">
              {activeLaptopModel?.name || 'NaijaOS Workstation'}
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">
              Dev Lv.{codingLevel} ({codingXp} XP)
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-2.5 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600/40 border border-rose-500/40 text-rose-200 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
          >
            <Power className="w-3.5 h-3.5" /> Close Laptop
          </button>
        </div>

        {/* Desktop Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Desktop Icons Rail */}
          <div className="w-20 sm:w-24 p-2.5 flex flex-col gap-3 border-r border-white/10 bg-black/30 shrink-0">
            {[
              { id: 'coding', label: 'Code Studio', icon: Code2, color: 'text-emerald-400' },
              { id: 'cyber', label: 'Cyber Defense', icon: ShieldCheck, color: codingLevel >= 7 ? 'text-cyan-400' : 'text-zinc-500' },
              { id: 'files', label: 'Files', icon: FolderOpen, color: 'text-amber-400' },
              { id: 'browser', label: 'Browser', icon: Globe, color: 'text-sky-400' },
              { id: 'settings', label: 'OS Settings', icon: Settings, color: 'text-zinc-300' },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeWindow === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveWindow(item.id as WindowId)}
                  className={`p-2 rounded-xl flex flex-col items-center gap-1 text-center cursor-pointer transition-all ${
                    isActive ? 'bg-white/15 border border-white/25' : 'hover:bg-white/10'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${item.color}`} />
                  <span className="text-[10px] font-bold text-white leading-tight">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active App Window */}
          <div className="flex-1 overflow-y-auto p-4 bg-zinc-950/75 text-white">
            {/* WINDOW: CODING STUDIO */}
            {activeWindow === 'coding' && (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-zinc-800">
                  <div>
                    <h3 className="text-sm font-black text-emerald-300 flex items-center gap-2">
                      <Terminal className="w-4 h-4" /> NaijaCode IDE · Reach Level 7 to Unlock Cyber Defense Contracts
                    </h3>
                    <p className="text-[11px] text-zinc-400">
                      Current Progress: Level {codingLevel}/10 · {codingXp} XP · {completedChallenges.length}/{CODING_CHALLENGES.length} Labs Solved
                    </p>
                  </div>
                </div>

                {/* Challenge Selector */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {CODING_CHALLENGES.map((ch) => {
                    const done = completedChallenges.includes(ch.id);
                    return (
                      <button
                        key={ch.id}
                        type="button"
                        onClick={() => {
                          setSelectedChallengeId(ch.id);
                          setCodeDraft(ch.starterCode);
                          setConsoleOutput('Loaded challenge.');
                        }}
                        className={`p-2 rounded-xl border text-left text-[10px] cursor-pointer ${
                          selectedChallengeId === ch.id
                            ? 'bg-emerald-500/20 border-emerald-400 text-white'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-300'
                        }`}
                      >
                        <div className="font-bold flex items-center justify-between">
                          <span>{ch.title.split(':')[0]}</span>
                          {done && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                        </div>
                        <div className="text-zinc-400 font-mono">+{ch.xpReward} XP</div>
                      </button>
                    );
                  })}
                </div>

                <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs text-zinc-200">
                  <strong className="text-emerald-300 block mb-0.5">{currentChallenge.title}</strong>
                  <span>{currentChallenge.prompt}</span>
                </div>

                <textarea
                  rows={6}
                  value={codeDraft}
                  onChange={(e) => setCodeDraft(e.target.value)}
                  spellCheck={false}
                  className="w-full bg-black border border-zinc-700 rounded-xl p-3 font-mono text-xs text-emerald-300 focus:outline-none focus:border-emerald-500"
                />

                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 p-2.5 rounded-xl bg-black/90 border border-zinc-800 font-mono text-[11px] text-amber-200">
                    {consoleOutput}
                  </div>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={runChallengeTests}
                    className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs cursor-pointer flex items-center gap-1.5 shrink-0"
                  >
                    <Play className="w-3.5 h-3.5" /> Run &amp; Submit
                  </button>
                </div>
              </div>
            )}

            {/* WINDOW: CYBERSECURITY DEFENSE (UNLOCKS AT LEVEL 7) */}
            {activeWindow === 'cyber' && (
              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-cyan-950/90 to-zinc-950 border border-cyan-500/40 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black text-cyan-200 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-cyan-400" /> Level 7 Cybersecurity Defense Operations
                    </h3>
                    <p className="text-[11px] text-zinc-400">
                      {codingLevel >= 7
                        ? 'Clearance Granted! Complete defensive security audits for high-tier NGN/CAD payouts.'
                        : `Locked: Reach Coding Level 7 in Code Studio first (Current Level: ${codingLevel}/7 · ${1500 - Math.min(1500, codingXp)} XP needed).`}
                    </p>
                  </div>
                  {codingLevel < 7 && <Lock className="w-6 h-6 text-amber-400" />}
                </div>

                <div className="space-y-2.5">
                  {CYBER_MISSIONS.map((m) => {
                    const payoutStr = isCanada ? formatCAD(m.payoutCAD) : formatNaira(m.payoutNGN);
                    const done = completedMissions.includes(m.id);
                    return (
                      <div key={m.id} className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between gap-3">
                        <div>
                          <div className="text-xs font-black text-white flex items-center gap-1.5">
                            <span>{m.title}</span>
                            {done && <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[9px]">Completed</span>}
                          </div>
                          <p className="text-[11px] text-zinc-400 mt-0.5">{m.desc}</p>
                          <div className="text-[10px] font-mono text-cyan-300 mt-1">
                            Contract Bounty: {payoutStr} · +{m.xpReward} XP
                          </div>
                        </div>
                        <button
                          type="button"
                          disabled={busy || codingLevel < 7}
                          onClick={() => runCyberMission(m)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-black shrink-0 ${
                            codingLevel >= 7
                              ? 'bg-cyan-500 hover:bg-cyan-400 text-black cursor-pointer'
                              : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                          }`}
                        >
                          {codingLevel >= 7 ? 'Deploy Patch' : 'Lv.7 Locked'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* WINDOW: FILE MANAGER */}
            {activeWindow === 'files' && (
              <div className="space-y-3">
                <h3 className="text-sm font-black text-amber-300 flex items-center gap-2">
                  <FolderOpen className="w-4 h-4" /> Citizen Home Directory (/home/{userProfile.username})
                </h3>
                <div className="grid sm:grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
                    <div className="text-xs font-black text-white">Official Documents ({(userProfile.ownedDocuments || []).length})</div>
                    {(userProfile.ownedDocuments || []).length === 0 ? (
                      <p className="text-[11px] text-zinc-500">No passports or permits filed yet.</p>
                    ) : (
                      (userProfile.ownedDocuments || []).map((d) => (
                        <div key={d.id} className="p-2 rounded-xl bg-zinc-950 border border-zinc-800 text-[11px] flex items-center gap-2">
                          <FileText className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="truncate">{d.title} ({d.status})</span>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
                    <div className="text-xs font-black text-white">Recent Bank Statements ({(userProfile.receipts || []).length})</div>
                    {(userProfile.receipts || []).slice(0, 6).map((r) => (
                      <div key={r.id} className="p-2 rounded-xl bg-zinc-950 border border-zinc-800 text-[11px] flex justify-between">
                        <span className="truncate pr-2">{r.title}</span>
                        <span className="font-mono text-emerald-300 shrink-0">{r.currency || 'NGN'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* WINDOW: BROWSER */}
            {activeWindow === 'browser' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 bg-zinc-900 p-2 rounded-xl border border-zinc-800">
                  <Globe className="w-4 h-4 text-sky-400 shrink-0" />
                  <span className="text-[11px] font-mono text-zinc-300 flex-1">
                    https://portal.naijalife.gov/{browserPage}
                  </span>
                  {(['portal', 'docs', 'cyber_brief'] as const).map((pg) => (
                    <button
                      key={pg}
                      type="button"
                      onClick={() => setBrowserPage(pg)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer ${
                        browserPage === pg ? 'bg-sky-500 text-black' : 'bg-zinc-800 text-zinc-300'
                      }`}
                    >
                      {pg.replace('_', ' ')}
                    </button>
                  ))}
                </div>
                <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-2 text-xs text-zinc-300 leading-relaxed">
                  {browserPage === 'portal' && (
                    <>
                      <h4 className="font-black text-white text-sm">Nigeria &amp; Canada Citizen Intranet</h4>
                      <p>Active Account Holder: @{userProfile.username} · State: {currentStateId?.toUpperCase()}</p>
                      <p>Use NaijaPhone for real-time transfers, IRCC immigration filing, NGX/TSX trading, and Democratic elections.</p>
                    </>
                  )}
                  {browserPage === 'docs' && (
                    <>
                      <h4 className="font-black text-white text-sm">Coding Career Progression Guide</h4>
                      <p>Every 250 XP earned in Code Studio advances your developer tier by +1 Level. Reach Level 7 (1,500 XP) to unlock paid enterprise cybersecurity contracts.</p>
                    </>
                  )}
                  {browserPage === 'cyber_brief' && (
                    <>
                      <h4 className="font-black text-cyan-300 text-sm">Cybersecurity Defense Briefing</h4>
                      <p>Defensive engineering includes constant-time token checks, strict BigInt ledger validation, and automated WebSocket origin checks.</p>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* WINDOW: SETTINGS */}
            {activeWindow === 'settings' && (
              <div className="space-y-3">
                <h3 className="text-sm font-black text-white">Workstation Hardware &amp; Theme</h3>
                <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs space-y-1">
                  <div><strong>Active Device:</strong> {activeLaptopModel?.name || userProfile.activeLaptopId || 'Developer Laptop'}</div>
                  <div><strong>Specs:</strong> {activeLaptopModel?.specs || '16GB RAM · NVMe SSD · NaijaOS 4.2'}</div>
                  <div><strong>Owned Laptops:</strong> {(userProfile.ownedLaptops || []).length}</div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {(['aurora', 'matrix', 'sunset'] as const).map((wp) => (
                    <button
                      key={wp}
                      type="button"
                      onClick={() => setWallpaper(wp)}
                      className={`py-2.5 rounded-xl border text-xs font-bold capitalize cursor-pointer ${
                        wallpaper === wp ? 'border-emerald-400 bg-emerald-500/20 text-emerald-200' : 'border-zinc-800 bg-zinc-900 text-zinc-300'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 inline mr-1" />
                      {wp}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Taskbar */}
        <div className="px-3 py-2 bg-black/90 border-t border-white/10 flex items-center justify-between text-xs relative">
          <button
            type="button"
            onClick={() => setStartMenuOpen((s) => !s)}
            className="px-3 py-1 rounded-lg bg-emerald-500 text-black font-black text-[11px] cursor-pointer"
          >
            Start
          </button>
          <span className="text-[10px] font-mono text-zinc-400">
            @{userProfile.username} · {isCanada ? 'Canada CAD' : 'Nigeria NGN'}
          </span>
          {startMenuOpen && (
            <div className="absolute bottom-11 left-3 w-48 bg-zinc-900 border border-zinc-700 rounded-xl p-2 shadow-2xl space-y-1 z-20">
              {(['coding', 'cyber', 'files', 'browser', 'settings'] as WindowId[]).map((win) => (
                <button
                  key={win}
                  type="button"
                  onClick={() => {
                    setActiveWindow(win);
                    setStartMenuOpen(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-zinc-800 text-xs font-bold text-white capitalize cursor-pointer"
                >
                  Open {win}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
