/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Landmark, CheckCircle2, Trophy, RefreshCw, AlertCircle, Megaphone, Vote, Award } from 'lucide-react';
import { UserProfile } from '../types/game';
import { formatNaira, formatCAD } from '../utils/formatNaira';
import { getAuthBearerHeaders } from '../services/economyService';

export interface GovernmentAppProps {
  userProfile?: UserProfile;
  currentStateId?: string;
  onUpdateProfile?: (updatedProfile: UserProfile) => void;
  onShowToast?: (msg: string) => void;
  triggerSound?: (type: 'coin' | 'stamp' | 'alert' | 'success') => void;
}

const DEFAULT_NIGERIA_JURISDICTIONS = [
  'Federal Republic of Nigeria (Presidency)',
  'Lagos', 'FCT Abuja', 'Rivers', 'Kano', 'Oyo', 'Imo', 'Enugu', 'Anambra', 'Delta', 'Ogun',
  'Edo', 'Kaduna', 'Katsina', 'Abia', 'Akwa Ibom', 'Plateau', 'Cross River', 'Borno', 'Sokoto',
  'Benue', 'Kwara', 'Ondo', 'Osun', 'Ekiti', 'Ebonyi', 'Kogi', 'Nasarawa', 'Niger', 'Adamawa',
  'Bauchi', 'Gombe', 'Taraba', 'Yobe', 'Jigawa', 'Kebbi', 'Zamfara', 'Bayelsa',
];

const DEFAULT_CANADA_JURISDICTIONS = [
  'Canada Federal Government (Prime Minister)',
  'Ontario', 'Quebec', 'British Columbia', 'Alberta', 'Manitoba', 'Saskatchewan',
  'Nova Scotia', 'New Brunswick', 'Newfoundland and Labrador', 'Prince Edward Island',
  'Yukon', 'Northwest Territories', 'Nunavut',
];

interface CandidateAnnouncement {
  id: string;
  text: string;
  createdAt: number;
}

interface ElectionCandidate {
  id: string;
  uid: string;
  username: string;
  displayName: string;
  party: string;
  manifesto: string;
  announcements: CandidateAnnouncement[];
  votes: number;
  filedAt: number;
}

interface CivicElectionRecord {
  id: string;
  country: 'nigeria' | 'canada';
  jurisdiction: string;
  officeTitle: string;
  cycleName: string;
  status: 'UPCOMING' | 'ACTIVE' | 'CONCLUDED';
  opensAt: number;
  closesAt: number;
  filingFeeMajor: number;
  currency: 'NGN' | 'CAD';
  candidates: ElectionCandidate[];
  votersByUid: Record<string, string>;
  hasVoted?: boolean;
  myVoteCandidateId?: string | null;
  winnerUsername?: string;
  winnerDisplayName?: string;
}

function mapStateIdToNgJurisdiction(stateId: string, validList: string[]): string {
  const clean = (stateId || '').toLowerCase().trim();
  if (!clean || clean === 'canada') return 'Lagos';
  if (clean === 'fct' || clean === 'abuja' || clean === 'fct_abuja') return 'FCT Abuja';
  const normalized = clean.replace(/[_-]+/g, ' ');
  const found = validList.find(
    (j) => !j.includes('Federal') && j.toLowerCase() === normalized
  );
  return found || 'Lagos';
}

export const GovernmentApp: React.FC<GovernmentAppProps> = ({
  userProfile,
  currentStateId = 'lagos',
  onUpdateProfile,
  onShowToast,
  triggerSound,
}) => {
  const defaultCountry: 'nigeria' | 'canada' =
    currentStateId === 'canada' || userProfile?.currentCountry === 'canada' ? 'canada' : 'nigeria';

  const [country, setCountry] = useState<'nigeria' | 'canada'>(defaultCountry);
  const [level, setLevel] = useState<'federal' | 'subnational'>('federal');
  const [ngJurisdictions, setNgJurisdictions] = useState<string[]>(DEFAULT_NIGERIA_JURISDICTIONS);
  const [caJurisdictions, setCaJurisdictions] = useState<string[]>(DEFAULT_CANADA_JURISDICTIONS);
  const [ngSelected, setNgSelected] = useState<string>(() =>
    mapStateIdToNgJurisdiction(currentStateId, DEFAULT_NIGERIA_JURISDICTIONS)
  );
  const [caSelected, setCaSelected] = useState<string>('Ontario');

  const [elections, setElections] = useState<CivicElectionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [partyInput, setPartyInput] = useState('');
  const [manifestoInput, setManifestoInput] = useState('');
  const [campaignMsgInput, setCampaignMsgInput] = useState('');
  const [busy, setBusy] = useState(false);

  const loadElections = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    setLoadError(null);
    try {
      const headers = await getAuthBearerHeaders();
      const resp = await fetch('/api/gov/elections', { headers });
      const data = await resp.json();
      if (!resp.ok || !data.success) {
        setLoadError(data.error || 'Could not reach Electoral Commission servers.');
        return;
      }
      if (Array.isArray(data.nigeriaJurisdictions) && data.nigeriaJurisdictions.length > 0) {
        setNgJurisdictions(data.nigeriaJurisdictions);
      }
      if (Array.isArray(data.canadaJurisdictions) && data.canadaJurisdictions.length > 0) {
        setCaJurisdictions(data.canadaJurisdictions);
      }
      setElections(Array.isArray(data.elections) ? data.elections : []);
    } catch {
      setLoadError('Network error while connecting to Electoral Commission.');
    } finally {
      if (!quiet) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadElections(false);
  }, [loadElections]);

  const ngSubnationalList = useMemo(
    () => ngJurisdictions.filter((j) => !j.includes('Federal')),
    [ngJurisdictions]
  );
  const caSubnationalList = useMemo(
    () => caJurisdictions.filter((j) => !j.includes('Federal')),
    [caJurisdictions]
  );

  const selectedJurisdiction = useMemo(() => {
    if (country === 'canada') {
      if (level === 'federal') {
        return caJurisdictions.find((j) => j.includes('Federal')) || 'Canada Federal Government (Prime Minister)';
      }
      return caSelected || caSubnationalList[0] || 'Ontario';
    }
    if (level === 'federal') {
      return ngJurisdictions.find((j) => j.includes('Federal')) || 'Federal Republic of Nigeria (Presidency)';
    }
    return ngSelected || ngSubnationalList[0] || 'Lagos';
  }, [country, level, caJurisdictions, ngJurisdictions, caSelected, ngSelected, caSubnationalList, ngSubnationalList]);

  const matchedElection = useMemo(() => {
    const matches = elections.filter(
      (e) => e.country === country && e.jurisdiction.toLowerCase() === selectedJurisdiction.toLowerCase()
    );
    return matches.find((e) => e.status !== 'CONCLUDED') || matches[0] || null;
  }, [elections, country, selectedJurisdiction]);

  const displayOffice = useMemo(() => {
    if (matchedElection) return matchedElection;
    const isFed = level === 'federal';
    const officeTitle =
      country === 'canada'
        ? isFed
          ? 'Prime Minister of Canada'
          : `Premier of ${selectedJurisdiction}`
        : isFed
        ? 'President of Nigeria'
        : selectedJurisdiction === 'FCT Abuja'
        ? 'FCT Abuja Council Chairperson'
        : `Governor of ${selectedJurisdiction} State`;

    return {
      id: '',
      country,
      jurisdiction: selectedJurisdiction,
      officeTitle,
      cycleName: '2026–2030 Mandate',
      status: 'ACTIVE' as const,
      opensAt: Date.now(),
      closesAt: Date.now() + 7 * 86400000,
      filingFeeMajor: isFed ? (country === 'canada' ? 100 : 50000) : country === 'canada' ? 50 : 25000,
      currency: (country === 'canada' ? 'CAD' : 'NGN') as 'NGN' | 'CAD',
      candidates: [] as ElectionCandidate[],
      votersByUid: {} as Record<string, string>,
      hasVoted: false,
      myVoteCandidateId: null,
    };
  }, [matchedElection, country, level, selectedJurisdiction]);

  const countryRacesWithCandidates = useMemo(
    () => elections.filter((e) => e.country === country && e.candidates.length > 0),
    [elections, country]
  );

  const totalBallotsCast = useMemo(() => {
    if (!matchedElection) return 0;
    const fromMap = Object.keys(matchedElection.votersByUid || {}).length;
    const fromVotes = matchedElection.candidates.reduce((sum, c) => sum + (c.votes || 0), 0);
    return Math.max(fromMap, fromVotes);
  }, [matchedElection]);

  const aggregatedAnnouncements = useMemo(() => {
    const items: Array<CandidateAnnouncement & { author: string; party: string }> = [];
    for (const c of displayOffice.candidates) {
      for (const ann of c.announcements || []) {
        items.push({ ...ann, author: c.username, party: c.party });
      }
    }
    return items.sort((a, b) => b.createdAt - a.createdAt);
  }, [displayOffice]);

  const syncAccountBalance = (account: any) => {
    if (!account || !userProfile || !onUpdateProfile) return;
    onUpdateProfile({
      ...userProfile,
      ngnKobo: account.ngnKobo ?? userProfile.ngnKobo,
      cadCents: account.cadCents ?? userProfile.cadCents,
      bankNaira: account.bankNaira ?? userProfile.bankNaira,
      cashNaira: account.cashNaira ?? 0,
      bankCAD: account.bankCAD ?? userProfile.bankCAD,
      receipts: account.receipts || userProfile.receipts,
    });
  };

  const handleRunForOffice = async () => {
    if (!manifestoInput.trim()) {
      onShowToast?.('Write your campaign manifesto first.');
      triggerSound?.('alert');
      return;
    }
    setBusy(true);
    try {
      const headers = await getAuthBearerHeaders();
      const resp = await fetch('/api/gov/declare', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          country,
          jurisdiction: selectedJurisdiction,
          party: partyInput.trim() || 'Independent Coalition',
          manifesto: manifestoInput.trim(),
          requestId: `gov_declare_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        }),
      });
      const data = await resp.json();
      if (!resp.ok || !data.success) {
        onShowToast?.(data.error || 'Could not file candidacy.');
        triggerSound?.('alert');
        return;
      }
      syncAccountBalance(data.account);
      setPartyInput('');
      setManifestoInput('');
      onShowToast?.(`Candidacy filed for ${displayOffice.officeTitle}!`);
      triggerSound?.('stamp');
      await loadElections(true);
    } catch {
      onShowToast?.('Network error submitting candidacy.');
      triggerSound?.('alert');
    } finally {
      setBusy(false);
    }
  };

  const handleVote = async (candidateId: string) => {
    if (!matchedElection?.id) return;
    setBusy(true);
    try {
      const headers = await getAuthBearerHeaders();
      const resp = await fetch('/api/gov/vote', {
        method: 'POST',
        headers,
        body: JSON.stringify({ electionId: matchedElection.id, candidateId }),
      });
      const data = await resp.json();
      if (!resp.ok || !data.success) {
        onShowToast?.(data.error || 'Vote rejected.');
        triggerSound?.('alert');
        return;
      }
      onShowToast?.('Your ballot has been officially recorded!');
      triggerSound?.('success');
      await loadElections(true);
    } catch {
      onShowToast?.('Network error casting ballot.');
      triggerSound?.('alert');
    } finally {
      setBusy(false);
    }
  };

  const handleAnnounce = async () => {
    if (!matchedElection?.id || !campaignMsgInput.trim()) {
      onShowToast?.('Enter a campaign statement first.');
      return;
    }
    setBusy(true);
    try {
      const headers = await getAuthBearerHeaders();
      const resp = await fetch('/api/gov/announce', {
        method: 'POST',
        headers,
        body: JSON.stringify({ electionId: matchedElection.id, text: campaignMsgInput.trim() }),
      });
      const data = await resp.json();
      if (!resp.ok || !data.success) {
        onShowToast?.(data.error || 'Could not post announcement.');
        triggerSound?.('alert');
        return;
      }
      setCampaignMsgInput('');
      onShowToast?.('Campaign announcement published!');
      triggerSound?.('coin');
      await loadElections(true);
    } catch {
      onShowToast?.('Network error posting announcement.');
    } finally {
      setBusy(false);
    }
  };

  const handleConcludeElection = async () => {
    if (!matchedElection?.id) return;
    setBusy(true);
    try {
      const headers = await getAuthBearerHeaders();
      const resp = await fetch('/api/gov/conclude', {
        method: 'POST',
        headers,
        body: JSON.stringify({ electionId: matchedElection.id }),
      });
      const data = await resp.json();
      if (!resp.ok || !data.success) {
        onShowToast?.(data.error || 'Could not conclude election.');
        triggerSound?.('alert');
        return;
      }
      onShowToast?.('Election concluded and results certified!');
      triggerSound?.('stamp');
      await loadElections(true);
    } finally {
      setBusy(false);
    }
  };

  const myUid = userProfile?.uid || '';
  const hasVoted = Boolean(
    matchedElection?.hasVoted || (myUid && matchedElection?.votersByUid && matchedElection.votersByUid[myUid])
  );
  const myVoteCandidateId =
    matchedElection?.myVoteCandidateId ||
    (myUid && matchedElection?.votersByUid ? matchedElection.votersByUid[myUid] : null);
  const amCandidate = displayOffice.candidates.some(
    (c) => (myUid && c.uid === myUid) || (userProfile?.username && c.username.toLowerCase() === userProfile.username.toLowerCase())
  );

  return (
    <div className="space-y-3">
      {/* Strictly Separated Jurisdiction Switcher */}
      <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-950/90 via-zinc-950 to-black border border-emerald-500/40 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Landmark className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <h3 className="text-xs font-black text-white">Democratic Governance Portal</h3>
              <p className="text-[10px] text-zinc-400">
                {country === 'nigeria' ? 'INEC · Federal + 36 States & FCT' : 'Elections Canada · Federal + 13 P/T'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => loadElections(false)}
            className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-emerald-400 cursor-pointer"
            title="Refresh Elections"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => setCountry('nigeria')}
            className={`py-1.5 rounded-xl text-[10px] font-black border cursor-pointer ${
              country === 'nigeria' ? 'bg-emerald-500 text-black border-emerald-400' : 'bg-zinc-900 text-zinc-300 border-zinc-700'
            }`}
          >
            Nigeria (NGN)
          </button>
          <button
            type="button"
            onClick={() => setCountry('canada')}
            className={`py-1.5 rounded-xl text-[10px] font-black border cursor-pointer ${
              country === 'canada' ? 'bg-red-600 text-white border-red-400' : 'bg-zinc-900 text-zinc-300 border-zinc-700'
            }`}
          >
            Canada (CAD)
          </button>
        </div>
      </div>

      {/* Level & Subnational Picker */}
      <div className="grid grid-cols-2 gap-1.5">
        <button
          type="button"
          onClick={() => setLevel('federal')}
          className={`py-1.5 rounded-xl text-[10px] font-bold border cursor-pointer ${
            level === 'federal' ? 'bg-amber-400 text-black border-amber-300 font-black' : 'bg-zinc-950 text-zinc-400 border-zinc-800'
          }`}
        >
          {country === 'nigeria' ? 'Presidency (Nigeria)' : 'Prime Minister (Canada)'}
        </button>
        <button
          type="button"
          onClick={() => setLevel('subnational')}
          className={`py-1.5 rounded-xl text-[10px] font-bold border cursor-pointer ${
            level === 'subnational' ? 'bg-amber-400 text-black border-amber-300 font-black' : 'bg-zinc-950 text-zinc-400 border-zinc-800'
          }`}
        >
          {country === 'nigeria' ? '36 States + FCT' : '10 Provinces + 3 Terr.'}
        </button>
      </div>

      {level === 'subnational' && (
        <select
          value={country === 'nigeria' ? ngSelected : caSelected}
          onChange={(e) => (country === 'nigeria' ? setNgSelected(e.target.value) : setCaSelected(e.target.value))}
          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
        >
          {country === 'nigeria'
            ? ngSubnationalList.map((st) => (
                <option key={st} value={st}>
                  {st === 'FCT Abuja' ? 'FCT Abuja Council' : `${st} State Governorship`}
                </option>
              ))
            : caSubnationalList.map((p) => (
                <option key={p} value={p}>
                  {p} Premier Election
                </option>
              ))}
        </select>
      )}

      {/* Quick-jump pills for races that already have active candidates */}
      {countryRacesWithCandidates.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[9px] font-mono uppercase text-emerald-400 shrink-0">Active Contests:</span>
          {countryRacesWithCandidates.map((race) => (
            <button
              key={race.id}
              type="button"
              onClick={() => {
                if (race.jurisdiction.includes('Federal')) {
                  setLevel('federal');
                } else {
                  setLevel('subnational');
                  if (race.country === 'canada') setCaSelected(race.jurisdiction);
                  else setNgSelected(race.jurisdiction);
                }
              }}
              className={`px-2 py-0.5 rounded-lg text-[9px] font-bold border whitespace-nowrap cursor-pointer ${
                race.jurisdiction === selectedJurisdiction
                  ? 'bg-emerald-500 text-black border-emerald-400'
                  : 'bg-zinc-900 text-zinc-300 border-zinc-700'
              }`}
            >
              {race.jurisdiction.includes('Federal') ? 'Federal' : race.jurisdiction} ({race.candidates.length})
            </button>
          ))}
        </div>
      )}

      {loadError && (
        <div className="p-3 rounded-2xl bg-rose-950/60 border border-rose-500/40 flex items-center justify-between gap-2 text-xs text-rose-200">
          <span className="flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{loadError}</span>
          </span>
          <button
            type="button"
            onClick={() => loadElections(false)}
            className="px-2.5 py-1 rounded-lg bg-rose-500 text-white font-bold text-[10px] cursor-pointer shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="py-10 text-center text-xs text-zinc-400 flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" /> Loading electoral commission...
        </div>
      ) : (
        <div className="space-y-3">
          {/* Office Summary Card */}
          <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-xs font-black text-white">{displayOffice.officeTitle}</div>
                <div className="text-[10px] text-zinc-400 font-mono">
                  {displayOffice.jurisdiction} · {totalBallotsCast} Ballots Cast · {displayOffice.candidates.length} Candidate{displayOffice.candidates.length === 1 ? '' : 's'}
                </div>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-black uppercase shrink-0 ${
                  displayOffice.status === 'ACTIVE'
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : displayOffice.status === 'UPCOMING'
                    ? 'bg-sky-500/20 text-sky-300'
                    : 'bg-amber-500/20 text-amber-300'
                }`}
              >
                {displayOffice.status}
              </span>
            </div>

            {displayOffice.status === 'UPCOMING' && (
              <div className="text-[10px] text-sky-300 bg-sky-950/40 border border-sky-500/30 rounded-xl px-2.5 py-1.5">
                Nominations are open! Declare candidacy below to activate ballot voting for {displayOffice.jurisdiction}.
              </div>
            )}

            {displayOffice.winnerUsername && (
              <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-400/40 text-xs font-black text-amber-200 flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Elected Official: @{displayOffice.winnerUsername}</span>
              </div>
            )}

            {userProfile?.isOwner && matchedElection && matchedElection.status !== 'CONCLUDED' && (
              <button
                type="button"
                disabled={busy}
                onClick={handleConcludeElection}
                className="w-full py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/40 text-amber-300 text-[10px] font-bold cursor-pointer flex items-center justify-center gap-1"
              >
                <Award className="w-3.5 h-3.5" /> Owner: Certify Winner &amp; Conclude Election
              </button>
            )}
          </div>

          {/* Candidacy Form */}
          {!amCandidate && displayOffice.status !== 'CONCLUDED' && (
            <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
              <div className="flex justify-between text-[10px] font-mono">
                <span className="text-zinc-200 font-bold">Run for this Office</span>
                <span className="text-amber-300">
                  Filing Fee:{' '}
                  {displayOffice.currency === 'CAD'
                    ? formatCAD(displayOffice.filingFeeMajor)
                    : formatNaira(displayOffice.filingFeeMajor)}
                </span>
              </div>
              <input
                type="text"
                value={partyInput}
                onChange={(e) => setPartyInput(e.target.value)}
                placeholder="Political Party / Coalition (e.g. Naija Forward Party)"
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-white"
              />
              <input
                type="text"
                value={manifestoInput}
                onChange={(e) => setManifestoInput(e.target.value)}
                placeholder="Enter your campaign promise / manifesto..."
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-white"
              />
              <button
                type="button"
                disabled={busy}
                onClick={handleRunForOffice}
                className="w-full py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-black font-black text-xs cursor-pointer"
              >
                File Candidacy &amp; Pay Fee
              </button>
            </div>
          )}

          {/* Campaign Announcement Composer for Registered Candidates */}
          {amCandidate && displayOffice.status !== 'CONCLUDED' && matchedElection && (
            <div className="p-3 rounded-2xl bg-zinc-950 border border-amber-500/30 space-y-1.5">
              <span className="text-[10px] font-mono text-amber-300 uppercase font-bold flex items-center gap-1">
                <Megaphone className="w-3 h-3" /> Official Candidate Press Desk
              </span>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={campaignMsgInput}
                  onChange={(e) => setCampaignMsgInput(e.target.value)}
                  placeholder="Post official campaign statement..."
                  className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-white"
                />
                <button
                  type="button"
                  disabled={busy}
                  onClick={handleAnnounce}
                  className="px-3 py-1.5 rounded-xl bg-amber-400 text-black font-black text-[10px] cursor-pointer"
                >
                  Post
                </button>
              </div>
            </div>
          )}

          {/* Candidates Ballot */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold flex items-center gap-1">
              <Vote className="w-3 h-3 text-emerald-400" /> Official Ballot ({displayOffice.candidates.length})
            </span>
            {displayOffice.candidates.length === 0 ? (
              <div className="p-5 text-center text-xs text-zinc-400 rounded-2xl bg-zinc-950 border border-zinc-800">
                No candidates filed yet for {displayOffice.officeTitle}. File above to appear on the ballot!
              </div>
            ) : (
              displayOffice.candidates.map((cand) => {
                const isMyVote = myVoteCandidateId === cand.id;
                return (
                  <div
                    key={cand.id}
                    className={`p-3 rounded-2xl bg-zinc-950 border space-y-2 ${
                      isMyVote ? 'border-emerald-400/60' : 'border-zinc-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-xs font-black text-white flex flex-wrap items-center gap-1.5">
                          <span>{cand.displayName}</span>
                          <span className="text-emerald-400 font-mono">@{cand.username}</span>
                          {cand.party && (
                            <span className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-[9px] text-zinc-300 font-mono">
                              {cand.party}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-300 mt-1">&ldquo;{cand.manifesto}&rdquo;</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs font-mono font-black text-amber-300 shrink-0">
                        {cand.votes} vote{cand.votes === 1 ? '' : 's'}
                      </span>
                    </div>
                    {displayOffice.status === 'ACTIVE' && (
                      <button
                        type="button"
                        disabled={busy || hasVoted}
                        onClick={() => handleVote(cand.id)}
                        className={`w-full py-1.5 rounded-xl text-xs font-black flex items-center justify-center gap-1 ${
                          hasVoted
                            ? isMyVote
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/50 cursor-default'
                              : 'bg-zinc-900 text-zinc-500 border border-zinc-800 cursor-not-allowed'
                            : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 cursor-pointer'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>
                          {isMyVote ? 'Voted for This Candidate' : hasVoted ? 'Ballot Already Cast' : 'Cast Vote'}
                        </span>
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Campaign Announcements Feed */}
          {aggregatedAnnouncements.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold">Campaign Bulletins</span>
              {aggregatedAnnouncements.slice(0, 8).map((ann) => (
                <div key={ann.id} className="p-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800 text-[11px] text-zinc-300">
                  <div className="flex items-center justify-between text-[9px] text-zinc-500 font-mono mb-0.5">
                    <strong className="text-amber-300">
                      @{ann.author} ({ann.party})
                    </strong>
                    <span>{new Date(ann.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p>{ann.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
