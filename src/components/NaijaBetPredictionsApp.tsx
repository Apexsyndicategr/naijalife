/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Trophy, Clock, Award, RefreshCw, CheckCircle2 } from 'lucide-react';
import { UserProfile } from '../types/game';
import { getAuthBearerHeaders } from '../services/economyService';

export interface NaijaBetPredictionsAppProps {
  userProfile?: UserProfile;
  onShowToast?: (msg: string) => void;
  triggerSound?: (type: 'coin' | 'stamp' | 'alert' | 'success') => void;
}

function get8PmWatCountdown(): string {
  const now = new Date();
  const watMs = now.getTime() + 3600 * 1000;
  const wat = new Date(watMs);
  let target = Date.UTC(wat.getUTCFullYear(), wat.getUTCMonth(), wat.getUTCDate(), 20, 0, 0);
  if (watMs >= target) target += 86400 * 1000;
  const diff = Math.max(0, Math.floor((target - watMs) / 1000));
  return `${Math.floor(diff / 3600)}h ${Math.floor((diff % 3600) / 60)}m to 8:00 PM WAT`;
}

export const NaijaBetPredictionsApp: React.FC<NaijaBetPredictionsAppProps> = ({
  onShowToast,
  triggerSound,
}) => {
  const [tab, setTab] = useState<'fixtures' | 'history' | 'leaderboard'>('fixtures');
  const [fixtures, setFixtures] = useState<any[]>([]);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [countdown, setCountdown] = useState(get8PmWatCountdown());
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const loadPredictions = useCallback(async () => {
    try {
      const headers = await getAuthBearerHeaders();
      const resp = await fetch('/api/predictions/state', { headers });
      const data = await resp.json();
      if (resp.ok && data.success) {
        setFixtures(data.fixtures || []);
        setPredictions(data.myPredictions || data.predictions || []);
        setLeaderboard(data.leaderboard || []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPredictions();
    const timer = window.setInterval(() => setCountdown(get8PmWatCountdown()), 15000);
    return () => window.clearInterval(timer);
  }, [loadPredictions]);

  const handleSubmitPick = async (fixtureId: string, pick: 'HOME_WIN' | 'DRAW' | 'AWAY_WIN') => {
    setBusy(true);
    try {
      const headers = await getAuthBearerHeaders();
      const resp = await fetch('/api/predictions/submit', {
        method: 'POST',
        headers,
        body: JSON.stringify({ fixtureId, pick }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        onShowToast?.(data.error || 'Could not submit prediction.');
        triggerSound?.('alert');
        return;
      }
      onShowToast?.(`Free prediction locked (${pick})! Results settle at 8:00 PM WAT.`);
      triggerSound?.('success');
      loadPredictions();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Free Predictions Header (Zero Gambling) */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-lime-950/90 via-zinc-950 to-black border border-lime-500/40 space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-lime-400" />
            <div>
              <h3 className="text-xs font-black text-white">Naija Bet Free Predictions</h3>
              <p className="text-[10px] text-lime-300 font-mono">100% Free-to-Play Points League</p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-lime-500/20 text-lime-300 text-[9px] font-mono font-black">
            NO WAGERS
          </span>
        </div>
        <div className="p-2 rounded-xl bg-black/50 border border-lime-500/20 flex items-center justify-between text-[10px]">
          <span className="text-zinc-300 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-lime-400" /> Daily Settlement:
          </span>
          <span className="font-mono font-black text-lime-300">{countdown}</span>
        </div>
        <p className="text-[10px] text-zinc-400">
          Scoring: <strong>+10 pts</strong> per correct match prediction (+5 streak bonus at 3+ wins).
        </p>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-[10px] font-bold">
        {[
          { id: 'fixtures', label: 'Upcoming Matches' },
          { id: 'history', label: `My Picks (${predictions.length})` },
          { id: 'leaderboard', label: 'Leaderboard' },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id as any)}
            className={`py-1.5 rounded-lg cursor-pointer ${
              tab === t.id ? 'bg-lime-500 text-black font-black' : 'text-zinc-400 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-10 text-center text-xs text-zinc-400 flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-lime-400" /> Loading fixtures...
        </div>
      ) : tab === 'fixtures' ? (
        <div className="space-y-2.5">
          {fixtures.map((f) => {
            const existingPick = predictions.find((p) => p.fixtureId === f.id);
            return (
              <div key={f.id} className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
                <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                  <span>{f.league}</span>
                  <span>{f.status === 'SETTLED' ? `Result: ${f.finalScore || f.result || 'Settled'}` : f.kickoffLabel || 'Settles 8:00 PM WAT'}</span>
                </div>
                <div className="text-xs font-black text-white">
                  {f.homeTeam} vs {f.awayTeam}
                </div>
                {existingPick ? (
                  <div className="p-2 rounded-xl bg-lime-500/15 border border-lime-500/30 text-[11px] font-bold text-lime-200 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-lime-400" />
                    <span>Predicted: {existingPick.pick} ({existingPick.status})</span>
                  </div>
                ) : f.status === 'UPCOMING' ? (
                  <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                    {(['HOME_WIN', 'DRAW', 'AWAY_WIN'] as const).map((choice) => (
                      <button
                        key={choice}
                        type="button"
                        disabled={busy}
                        onClick={() => handleSubmitPick(f.id, choice)}
                        className="py-1.5 rounded-xl bg-zinc-900 hover:bg-lime-500 hover:text-black border border-zinc-700 font-black text-zinc-200 cursor-pointer transition-colors"
                      >
                        {choice === 'HOME_WIN' ? f.homeTeam.split(' ')[0] : choice === 'AWAY_WIN' ? f.awayTeam.split(' ')[0] : 'Draw'}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : tab === 'history' ? (
        <div className="space-y-2">
          {predictions.length === 0 ? (
            <div className="p-6 text-center text-xs text-zinc-500 rounded-2xl bg-zinc-950 border border-zinc-800">
              No predictions submitted yet.
            </div>
          ) : (
            predictions.map((p) => {
              const fx = fixtures.find((f) => f.id === p.fixtureId);
              return (
                <div key={p.id} className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 flex justify-between items-center text-xs">
                  <div>
                    <div className="font-bold text-white">{fx ? `${fx.homeTeam} vs ${fx.awayTeam}` : p.fixtureId}</div>
                    <div className="text-[10px] text-zinc-400 font-mono">Pick: {p.pick} · {p.status}</div>
                  </div>
                  <span className="font-mono font-black text-lime-300">+{p.pointsAwarded} pts</span>
                </div>
              );
            })
          )}
        </div>
      ) : (
        <div className="space-y-1.5">
          {leaderboard.length === 0 ? (
            <div className="p-6 text-center text-xs text-zinc-500 rounded-2xl bg-zinc-950 border border-zinc-800">
              Leaderboard will populate once matches settle at 8:00 PM WAT.
            </div>
          ) : (
            leaderboard.map((row, idx) => (
              <div key={row.username} className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 flex justify-between items-center text-xs">
                <span className="font-bold text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" /> #{idx + 1} @{row.username}
                </span>
                <span className="font-mono font-black text-lime-300">
                  {row.points} pts ({row.correct ?? row.correctCount ?? 0} correct)
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
