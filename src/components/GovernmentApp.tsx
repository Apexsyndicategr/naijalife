/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Landmark, CheckCircle2, Trophy, RefreshCw } from 'lucide-react';
import { UserProfile } from '../types/game';
import { NIGERIA_36_STATES_ALPHABETICAL } from '../data/stateLocationsData';
import { formatNaira, formatCAD } from '../utils/formatNaira';
import { getAuthBearerHeaders } from '../services/economyService';

export interface GovernmentAppProps {
  userProfile?: UserProfile;
  currentStateId?: string;
  onUpdateProfile?: (updatedProfile: UserProfile) => void;
  onShowToast?: (msg: string) => void;
  triggerSound?: (type: 'coin' | 'stamp' | 'alert' | 'success') => void;
}

const CANADA_PROVINCES = [
  { id: 'ON', name: 'Ontario' },
  { id: 'QC', name: 'Quebec' },
  { id: 'BC', name: 'British Columbia' },
  { id: 'AB', name: 'Alberta' },
  { id: 'MB', name: 'Manitoba' },
  { id: 'SK', name: 'Saskatchewan' },
  { id: 'NS', name: 'Nova Scotia' },
  { id: 'NB', name: 'New Brunswick' },
  { id: 'NL', name: 'Newfoundland and Labrador' },
  { id: 'PE', name: 'Prince Edward Island' },
  { id: 'NT', name: 'Northwest Territories' },
  { id: 'YT', name: 'Yukon' },
  { id: 'NU', name: 'Nunavut' },
];

interface ElectionRecord {
  id: string;
  country: 'nigeria' | 'canada';
  level: 'federal' | 'subnational';
  jurisdictionId: string;
  jurisdictionName: string;
  officeTitle: string;
  status: 'active' | 'concluded';
  filingFee: number;
  currency: 'NGN' | 'CAD';
  candidates: Array<{
    uid: string;
    username: string;
    displayName: string;
    manifesto: string;
    votes: number;
    filedAt: number;
  }>;
  votedUids: string[];
  announcements: Array<{ id: string; author: string; text: string; createdAt: number }>;
  winnerUsername?: string;
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
  const [ngStateId, setNgStateId] = useState<string>(
    currentStateId && currentStateId !== 'canada' ? currentStateId : 'lagos'
  );
  const [caProvId, setCaProvId] = useState<string>('ON');
  const [elections, setElections] = useState<ElectionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [manifestoInput, setManifestoInput] = useState('');
  const [campaignMsgInput, setCampaignMsgInput] = useState('');
  const [busy, setBusy] = useState(false);

  const loadElections = useCallback(async () => {
    try {
      const headers = await getAuthBearerHeaders();
      const resp = await fetch(`/api/elections?country=${country}`, { headers });
      const data = await resp.json();
      if (resp.ok && data.success) {
        setElections(data.elections || []);
      }
    } finally {
      setLoading(false);
    }
  }, [country]);

  useEffect(() => {
    setLoading(true);
    loadElections();
  }, [loadElections]);

  const activeElection = elections.find((e) => {
    if (e.country !== country) return false;
    if (level === 'federal') return e.level === 'federal';
    return country === 'nigeria' ? e.jurisdictionId === ngStateId : e.jurisdictionId === caProvId;
  });

  const handleRunForOffice = async () => {
    if (!activeElection || !manifestoInput.trim()) {
      onShowToast?.('Write your campaign manifesto first.');
      return;
    }
    setBusy(true);
    try {
      const headers = await getAuthBearerHeaders();
      const resp = await fetch('/api/elections/run', {
        method: 'POST',
        headers,
        body: JSON.stringify({ electionId: activeElection.id, manifesto: manifestoInput.trim() }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        onShowToast?.(data.error || 'Could not file candidacy.');
        triggerSound?.('alert');
        return;
      }
      if (data.account && userProfile && onUpdateProfile) {
        onUpdateProfile({
          ...userProfile,
          ngnKobo: data.account.ngnKobo,
          cadCents: data.account.cadCents,
          bankNaira: data.account.bankNaira,
          cashNaira: 0,
          bankCAD: data.account.bankCAD,
          receipts: data.account.receipts,
        });
      }
      setManifestoInput('');
      onShowToast?.('Candidacy filed successfully!');
      triggerSound?.('stamp');
      loadElections();
    } finally {
      setBusy(false);
    }
  };

  const handleVote = async (candidateUid: string) => {
    if (!activeElection) return;
    setBusy(true);
    try {
      const headers = await getAuthBearerHeaders();
      const resp = await fetch('/api/elections/vote', {
        method: 'POST',
        headers,
        body: JSON.stringify({ electionId: activeElection.id, candidateUid }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        onShowToast?.(data.error || 'Vote rejected.');
        triggerSound?.('alert');
        return;
      }
      onShowToast?.('Your ballot has been recorded!');
      triggerSound?.('success');
      loadElections();
    } finally {
      setBusy(false);
    }
  };

  const handleAnnounce = async () => {
    if (!activeElection || !campaignMsgInput.trim()) return;
    setBusy(true);
    try {
      const headers = await getAuthBearerHeaders();
      const resp = await fetch('/api/elections/announce', {
        method: 'POST',
        headers,
        body: JSON.stringify({ electionId: activeElection.id, text: campaignMsgInput.trim() }),
      });
      if (resp.ok) {
        setCampaignMsgInput('');
        onShowToast?.('Campaign announcement posted!');
        loadElections();
      }
    } finally {
      setBusy(false);
    }
  };

  const myUid = userProfile?.uid || '';
  const hasVoted = activeElection ? activeElection.votedUids.includes(myUid) : false;
  const amCandidate = activeElection ? activeElection.candidates.some((c) => c.uid === myUid) : false;

  return (
    <div className="space-y-3">
      {/* Strictly Separated Jurisdiction Switcher */}
      <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-950/90 via-zinc-950 to-black border border-emerald-500/40 space-y-2">
        <div className="flex items-center gap-2">
          <Landmark className="w-5 h-5 text-emerald-400" />
          <div>
            <h3 className="text-xs font-black text-white">Democratic Governance Portal</h3>
            <p className="text-[10px] text-zinc-400">Strictly separated Nigeria &amp; Canada offices</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => setCountry('nigeria')}
            className={`py-1.5 rounded-xl text-[10px] font-black border cursor-pointer ${
              country === 'nigeria' ? 'bg-emerald-500 text-black border-emerald-400' : 'bg-zinc-900 text-zinc-300 border-zinc-700'
            }`}
          >
            🇳🇬 Nigeria (Federal + 37 States)
          </button>
          <button
            type="button"
            onClick={() => setCountry('canada')}
            className={`py-1.5 rounded-xl text-[10px] font-black border cursor-pointer ${
              country === 'canada' ? 'bg-red-600 text-white border-red-400' : 'bg-zinc-900 text-zinc-300 border-zinc-700'
            }`}
          >
            🇨🇦 Canada (Federal + 13 P/T)
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
          {country === 'nigeria' ? '36 States + FCT' : '10 Provinces + 3 Territories'}
        </button>
      </div>

      {level === 'subnational' && (
        <select
          value={country === 'nigeria' ? ngStateId : caProvId}
          onChange={(e) => (country === 'nigeria' ? setNgStateId(e.target.value) : setCaProvId(e.target.value))}
          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
        >
          {country === 'nigeria'
            ? NIGERIA_36_STATES_ALPHABETICAL.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name} Governorship
                </option>
              ))
            : CANADA_PROVINCES.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} Premier
                </option>
              ))}
        </select>
      )}

      {loading ? (
        <div className="py-10 text-center text-xs text-zinc-400 flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" /> Loading electoral commission...
        </div>
      ) : activeElection ? (
        <div className="space-y-3">
          <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs font-black text-white">{activeElection.officeTitle}</div>
                <div className="text-[10px] text-zinc-400 font-mono">
                  {activeElection.jurisdictionName} · {activeElection.votedUids.length} Ballots Cast
                </div>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-black uppercase ${
                  activeElection.status === 'active'
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-amber-500/20 text-amber-300'
                }`}
              >
                {activeElection.status}
              </span>
            </div>

            {activeElection.winnerUsername && (
              <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-400/40 text-xs font-black text-amber-200 flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Elected Official: @{activeElection.winnerUsername}</span>
              </div>
            )}
          </div>

          {/* Candidacy Form */}
          {!amCandidate && activeElection.status === 'active' && (
            <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
              <div className="flex justify-between text-[10px] font-mono">
                <span className="text-zinc-300 font-bold">Run for this Office</span>
                <span className="text-amber-300">
                  Filing Fee:{' '}
                  {activeElection.currency === 'CAD'
                    ? formatCAD(activeElection.filingFee)
                    : formatNaira(activeElection.filingFee)}
                </span>
              </div>
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
                className="w-full py-2 rounded-xl bg-emerald-500 text-black font-black text-xs cursor-pointer"
              >
                File Candidacy &amp; Pay Fee
              </button>
            </div>
          )}

          {/* Campaign Announcement */}
          {amCandidate && activeElection.status === 'active' && (
            <div className="flex gap-1.5">
              <input
                type="text"
                value={campaignMsgInput}
                onChange={(e) => setCampaignMsgInput(e.target.value)}
                placeholder="Post official campaign announcement..."
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white"
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
          )}

          {/* Candidates Ballot */}
          <div className="space-y-2">
            {activeElection.candidates.length === 0 ? (
              <div className="p-5 text-center text-xs text-zinc-500 rounded-2xl bg-zinc-950 border border-zinc-800">
                No candidates filed yet for {activeElection.officeTitle}. Be the first to run!
              </div>
            ) : (
              activeElection.candidates.map((cand) => (
                <div key={cand.uid} className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs font-black text-white">
                        {cand.displayName} <span className="text-emerald-400 font-mono">@{cand.username}</span>
                      </div>
                      <p className="text-[11px] text-zinc-300 mt-0.5">&ldquo;{cand.manifesto}&rdquo;</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs font-mono font-black text-amber-300">
                      {cand.votes} votes
                    </span>
                  </div>
                  {activeElection.status === 'active' && (
                    <button
                      type="button"
                      disabled={busy || hasVoted}
                      onClick={() => handleVote(cand.uid)}
                      className={`w-full py-1.5 rounded-xl text-xs font-black cursor-pointer flex items-center justify-center gap-1 ${
                        hasVoted
                          ? 'bg-zinc-900 text-zinc-500 border border-zinc-800 cursor-not-allowed'
                          : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{hasVoted ? 'Ballot Already Cast' : 'Cast Vote'}</span>
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Campaign Announcements Feed */}
          {activeElection.announcements.length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase text-zinc-400">Campaign Bulletins</span>
              {activeElection.announcements.slice(0, 5).map((ann) => (
                <div key={ann.id} className="p-2 rounded-xl bg-zinc-950/70 border border-zinc-800 text-[11px] text-zinc-300">
                  <strong className="text-amber-300">@{ann.author}:</strong> {ann.text}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};
