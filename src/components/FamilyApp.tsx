/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Heart,
  Users,
  Calendar,
  Plus,
  Check,
  X,
  Crown,
  GitBranch,
  Activity,
  RefreshCw,
  LogOut,
} from 'lucide-react';
import { UserProfile } from '../types/game';
import { getAuthBearerHeaders } from '../services/economyService';

export interface FamilyAppProps {
  userProfile?: UserProfile;
  onShowToast?: (msg: string) => void;
  triggerSound?: (type: 'coin' | 'stamp' | 'alert' | 'success') => void;
}

interface FamilyMember {
  username: string;
  displayName?: string;
  role: 'Head' | 'Spouse' | 'Child' | 'Parent' | 'Sibling' | 'Member';
  joinedAt: number;
  spouseUsername?: string;
  parentUsernames?: string[];
}

interface FamilyRecord {
  id: string;
  name: string;
  motto: string;
  headUsername: string;
  members: FamilyMember[];
  activitiesLog: Array<{ id: string; actor: string; summary: string; timestamp: number }>;
  events: Array<{
    id: string;
    title: string;
    activityType: 'dinner' | 'road_trip' | 'celebration' | 'house_chore' | 'game_night';
    scheduledDateTime: string;
    createdBy: string;
    rsvps: Record<string, 'going' | 'maybe' | 'declined'>;
  }>;
}

interface FamilyInvitation {
  id: string;
  familyId: string;
  familyName: string;
  fromUsername: string;
  toUsername: string;
  isMarriageProposal: boolean;
  proposedRole: FamilyMember['role'];
  message: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: number;
}

export const FamilyApp: React.FC<FamilyAppProps> = ({
  userProfile,
  onShowToast,
  triggerSound,
}) => {
  const myUsername = (userProfile?.username || '').toLowerCase().trim();
  const [tab, setTab] = useState<'overview' | 'tree' | 'events' | 'invites'>('overview');
  const [loading, setLoading] = useState(true);
  const [family, setFamily] = useState<FamilyRecord | null>(null);
  const [incomingInvites, setIncomingInvites] = useState<FamilyInvitation[]>([]);
  const [outgoingInvites, setOutgoingInvites] = useState<FamilyInvitation[]>([]);
  const [citizens, setCitizens] = useState<Array<{ username: string; usernameLower: string; state: string }>>([]);

  // Forms
  const [newFamName, setNewFamName] = useState('');
  const [newFamMotto, setNewFamMotto] = useState('');
  const [inviteTarget, setInviteTarget] = useState('');
  const [inviteRole, setInviteRole] = useState<FamilyMember['role']>('Member');
  const [inviteType, setInviteType] = useState<'membership' | 'marriage'>('membership');

  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventType, setEventType] = useState<'dinner' | 'road_trip' | 'celebration' | 'house_chore' | 'game_night'>('dinner');
  const [busy, setBusy] = useState(false);

  const loadFamily = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    try {
      const headers = await getAuthBearerHeaders();
      const resp = await fetch(`/api/family/state?username=${encodeURIComponent(myUsername)}`, { headers });
      const data = await resp.json();
      if (resp.ok && data.success) {
        setFamily(data.family || null);
        setIncomingInvites(Array.isArray(data.incomingInvites) ? data.incomingInvites : []);
        setOutgoingInvites(Array.isArray(data.outgoingInvites) ? data.outgoingInvites : []);
        setCitizens(Array.isArray(data.citizens) ? data.citizens : []);
      }
    } catch {
      // silent retry
    } finally {
      if (!quiet) setLoading(false);
    }
  }, [myUsername]);

  useEffect(() => {
    loadFamily(false);
  }, [loadFamily]);

  const handleCreateFamily = async () => {
    if (!newFamName.trim()) {
      onShowToast?.('Enter a family name.');
      return;
    }
    setBusy(true);
    try {
      const headers = await getAuthBearerHeaders();
      const resp = await fetch('/api/family/create', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          familyName: newFamName.trim(),
          motto: newFamMotto.trim(),
        }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        onShowToast?.(data.error || 'Could not create family.');
        triggerSound?.('alert');
        return;
      }
      setFamily(data.family);
      setNewFamName('');
      setNewFamMotto('');
      onShowToast?.(`${data.family.name} household established!`);
      triggerSound?.('success');
      loadFamily(true);
    } finally {
      setBusy(false);
    }
  };

  const handleSendInvite = async () => {
    const clean = inviteTarget.trim().replace(/^@/, '').toLowerCase();
    if (!clean) {
      onShowToast?.('Enter a citizen @username to invite.');
      return;
    }
    setBusy(true);
    try {
      const headers = await getAuthBearerHeaders();
      const resp = await fetch('/api/family/invite', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          toUsername: clean,
          proposedRole: inviteType === 'marriage' ? 'Spouse' : inviteRole,
          isMarriageProposal: inviteType === 'marriage',
        }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        onShowToast?.(data.error || 'Invitation failed.');
        triggerSound?.('alert');
        return;
      }
      setInviteTarget('');
      onShowToast?.(
        inviteType === 'marriage'
          ? `Sent marriage proposal to @${clean}. Waiting for consent.`
          : `Sent family invite to @${clean}!`
      );
      triggerSound?.('coin');
      loadFamily(true);
    } finally {
      setBusy(false);
    }
  };

  const handleRespondInvite = async (inviteId: string, accept: boolean) => {
    setBusy(true);
    try {
      const headers = await getAuthBearerHeaders();
      const resp = await fetch('/api/family/respond', {
        method: 'POST',
        headers,
        body: JSON.stringify({ inviteId, accept }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        onShowToast?.(data.error || 'Failed to respond.');
        return;
      }
      onShowToast?.(accept ? 'Joined family!' : 'Invitation declined.');
      triggerSound?.(accept ? 'success' : 'coin');
      loadFamily(true);
    } finally {
      setBusy(false);
    }
  };

  const handleUpdateRole = async (targetUsername: string, role: FamilyMember['role']) => {
    setBusy(true);
    try {
      const headers = await getAuthBearerHeaders();
      const resp = await fetch('/api/family/role', {
        method: 'POST',
        headers,
        body: JSON.stringify({ targetUsername, role }),
      });
      if (resp.ok) {
        onShowToast?.(`Updated @${targetUsername} to ${role}`);
        loadFamily(true);
      }
    } finally {
      setBusy(false);
    }
  };

  const handleCreateEvent = async () => {
    if (!eventTitle.trim()) {
      onShowToast?.('Enter an event title.');
      return;
    }
    setBusy(true);
    try {
      const headers = await getAuthBearerHeaders();
      const resp = await fetch('/api/family/event', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title: eventTitle.trim(),
          activityType: eventType,
          scheduledDateTime: eventDate || new Date(Date.now() + 86400000).toISOString().slice(0, 10),
        }),
      });
      const data = await resp.json();
      if (resp.ok && data.success) {
        setEventTitle('');
        onShowToast?.('Family event scheduled!');
        triggerSound?.('success');
        loadFamily(true);
      } else {
        onShowToast?.(data.error || 'Could not schedule event.');
      }
    } finally {
      setBusy(false);
    }
  };

  const handleRsvp = async (eventId: string, status: 'going' | 'maybe' | 'declined') => {
    const headers = await getAuthBearerHeaders();
    const resp = await fetch('/api/family/rsvp', {
      method: 'POST',
      headers,
      body: JSON.stringify({ eventId, status }),
    });
    if (resp.ok) {
      onShowToast?.(`RSVP updated: ${status}`);
      loadFamily(true);
    }
  };

  const handleLeaveFamily = async () => {
    setBusy(true);
    try {
      const headers = await getAuthBearerHeaders();
      const resp = await fetch('/api/family/leave', { method: 'POST', headers });
      if (resp.ok) {
        setFamily(null);
        onShowToast?.('You left the household.');
        loadFamily(true);
      }
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-zinc-400 gap-2">
        <RefreshCw className="w-6 h-6 animate-spin text-rose-400" />
        <span className="text-xs font-mono">Loading Family Legacy Portal...</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Banner */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-rose-950/90 via-pink-950/50 to-zinc-950 border border-rose-500/40 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow">
            <Heart className="w-5 h-5 text-white fill-white" />
          </div>
          <div>
            <h3 className="text-xs font-black text-white">
              {family ? family.name : 'Naija Life Family'}
            </h3>
            <p className="text-[10px] text-rose-200 font-mono">
              {family ? `"${family.motto || 'Unity & Legacy'}" · ${family.members.length} members` : 'Create or join a household'}
            </p>
          </div>
        </div>
        {incomingInvites.length > 0 && (
          <button
            type="button"
            onClick={() => setTab('invites')}
            className="px-2 py-1 rounded-lg bg-rose-500 text-white text-[10px] font-black cursor-pointer"
          >
            {incomingInvites.length} Invite{incomingInvites.length > 1 ? 's' : ''}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-4 gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-[10px] font-bold">
        {[
          { id: 'overview', label: 'Household' },
          { id: 'tree', label: 'Tree' },
          { id: 'events', label: 'Events' },
          { id: 'invites', label: `Invites${incomingInvites.length ? ` (${incomingInvites.length})` : ''}` },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id as any)}
            className={`py-1.5 rounded-lg cursor-pointer ${
              tab === t.id ? 'bg-rose-500 text-white font-black' : 'text-zinc-400 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* NO FAMILY YET VIEW */}
      {!family && tab !== 'invites' && (
        <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
          <h4 className="text-xs font-black text-white">Establish a New Family</h4>
          <p className="text-[11px] text-zinc-400">
            Create your household to invite friends or spouses (requires mutual consent), schedule gatherings, and grow your generational family tree.
          </p>
          <input
            type="text"
            value={newFamName}
            onChange={(e) => setNewFamName(e.target.value)}
            placeholder="Family Surname / House Name (e.g. House of Okonkwo)"
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white"
          />
          <input
            type="text"
            value={newFamMotto}
            onChange={(e) => setNewFamMotto(e.target.value)}
            placeholder="Family Motto (optional)"
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white"
          />
          <button
            type="button"
            disabled={busy}
            onClick={handleCreateFamily}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-black text-xs cursor-pointer"
          >
            Create Family
          </button>
        </div>
      )}

      {/* TAB: OVERVIEW */}
      {family && tab === 'overview' && (
        <div className="space-y-3">
          {/* Invite / Marriage Proposal Form */}
          <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-rose-300 font-bold">
                Invite Citizen or Propose Marriage
              </span>
              <select
                value={inviteType}
                onChange={(e) => setInviteType(e.target.value as 'membership' | 'marriage')}
                className="bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1 text-[10px] text-white"
              >
                <option value="membership">Family Invite</option>
                <option value="marriage">Marriage Proposal</option>
              </select>
            </div>
            <div className="flex gap-1.5">
              <input
                type="text"
                value={inviteTarget}
                onChange={(e) => setInviteTarget(e.target.value)}
                placeholder="@username..."
                className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-white"
              />
              {inviteType === 'membership' && (
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as FamilyMember['role'])}
                  className="bg-zinc-900 border border-zinc-700 rounded-xl px-2 py-1.5 text-[10px] text-white"
                >
                  <option value="Member">Member</option>
                  <option value="Child">Child</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Parent">Parent</option>
                  <option value="Spouse">Spouse</option>
                </select>
              )}
              <button
                type="button"
                disabled={busy}
                onClick={handleSendInvite}
                className="px-3 py-1.5 rounded-xl bg-rose-500 text-white font-black text-[10px] cursor-pointer"
              >
                Send
              </button>
            </div>
            {citizens.filter((c) => c.usernameLower !== myUsername).length > 0 && (
              <div className="flex gap-1 overflow-x-auto pb-0.5 scrollbar-none">
                {citizens
                  .filter((c) => c.usernameLower !== myUsername)
                  .slice(0, 6)
                  .map((c) => (
                    <button
                      key={c.usernameLower}
                      type="button"
                      onClick={() => setInviteTarget(c.username)}
                      className="px-2 py-0.5 rounded-lg bg-zinc-900 border border-zinc-700 text-[9px] text-zinc-300 cursor-pointer shrink-0"
                    >
                      @{c.username}
                    </button>
                  ))}
              </div>
            )}
          </div>

          {/* Members list */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold">Members &amp; Roles</span>
              <button
                type="button"
                disabled={busy}
                onClick={handleLeaveFamily}
                className="px-2 py-0.5 rounded-lg bg-zinc-900 border border-zinc-800 text-[9px] text-rose-300 flex items-center gap-1 cursor-pointer"
              >
                <LogOut className="w-2.5 h-2.5" /> Leave
              </button>
            </div>
            {family.members.map((m) => (
              <div key={m.username} className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-black text-white flex items-center gap-1.5">
                    <span>@{m.username}</span>
                    {m.role === 'Head' && <Crown className="w-3.5 h-3.5 text-amber-400" />}
                    {m.spouseUsername && (
                      <span className="text-[9px] text-rose-300 font-mono">Spouse: @{m.spouseUsername}</span>
                    )}
                  </div>
                  <div className="text-[10px] text-zinc-400">Role: {m.role}</div>
                </div>
                {family.headUsername === myUsername && m.username !== myUsername && (
                  <select
                    value={m.role}
                    onChange={(e) => handleUpdateRole(m.username, e.target.value as FamilyMember['role'])}
                    className="bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1 text-[10px] text-white"
                  >
                    {['Spouse', 'Child', 'Parent', 'Sibling', 'Member'].map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            ))}
          </div>

          {/* Activities */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold flex items-center gap-1">
              <Activity className="w-3 h-3 text-rose-400" /> Recent Family Activities
            </span>
            {(family.activitiesLog || []).slice(0, 6).map((act) => (
              <div key={act.id} className="p-2 rounded-xl bg-zinc-950/70 border border-zinc-800/80 text-[11px] text-zinc-300 flex justify-between gap-2">
                <span>{act.summary}</span>
                <span className="text-[9px] text-zinc-500 font-mono shrink-0">
                  {new Date(act.timestamp).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: TREE */}
      {family && tab === 'tree' && (
        <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
          <div className="flex items-center gap-2 text-xs font-black text-rose-300">
            <GitBranch className="w-4 h-4" />
            <span>Generational Family Tree</span>
          </div>

          {(['Parent', 'Head', 'Spouse', 'Sibling', 'Child', 'Member'] as const).map((tier) => {
            const tierMembers = family.members.filter((m) => m.role === tier);
            if (tierMembers.length === 0) return null;
            return (
              <div key={tier} className="space-y-1">
                <span className="text-[9px] font-mono uppercase text-zinc-500">{tier} Tier</span>
                <div className="flex flex-wrap gap-2">
                  {tierMembers.map((m) => (
                    <div
                      key={m.username}
                      className="px-3 py-2 rounded-xl bg-zinc-900 border border-rose-500/30 text-xs font-bold text-white flex items-center gap-1.5"
                    >
                      <Users className="w-3.5 h-3.5 text-rose-400" />
                      <span>@{m.username}</span>
                      {m.spouseUsername && (
                        <span className="text-[9px] text-pink-300 font-mono">&harr; @{m.spouseUsername}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB: EVENTS */}
      {family && tab === 'events' && (
        <div className="space-y-3">
          <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
            <span className="text-[10px] font-mono uppercase text-rose-300 font-bold">Schedule Family Gathering</span>
            <input
              type="text"
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              placeholder="Event title (e.g. Sunday Jollof Dinner)..."
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-white"
            />
            <div className="grid grid-cols-2 gap-1.5">
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="bg-zinc-900 border border-zinc-700 rounded-xl px-2.5 py-1.5 text-[10px] text-white"
              />
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value as any)}
                className="bg-zinc-900 border border-zinc-700 rounded-xl px-2.5 py-1.5 text-[10px] text-white"
              >
                <option value="dinner">Family Dinner</option>
                <option value="road_trip">Road Trip</option>
                <option value="celebration">Celebration</option>
                <option value="game_night">Game Night</option>
                <option value="house_chore">House Chore</option>
              </select>
            </div>
            <button
              type="button"
              disabled={busy}
              onClick={handleCreateEvent}
              className="w-full py-2 rounded-xl bg-rose-500 text-white font-black text-xs cursor-pointer flex items-center justify-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Schedule Event
            </button>
          </div>

          {family.events.map((ev) => {
            const myRsvp = ev.rsvps?.[myUsername];
            const goingCount = Object.values(ev.rsvps || {}).filter((v) => v === 'going').length;
            return (
              <div key={ev.id} className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs font-black text-white flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-rose-400" />
                      <span>{ev.title}</span>
                    </div>
                    <div className="text-[10px] text-zinc-400 font-mono">
                      {ev.scheduledDateTime} · {ev.activityType.replace('_', ' ')} · {goingCount} going
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                  {(['going', 'maybe', 'declined'] as const).map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => handleRsvp(ev.id, status)}
                      className={`py-1 rounded-lg font-bold capitalize cursor-pointer border ${
                        myRsvp === status
                          ? 'bg-rose-500 text-white border-rose-400'
                          : 'bg-zinc-900 text-zinc-300 border-zinc-700'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB: INVITATIONS */}
      {tab === 'invites' && (
        <div className="space-y-2.5">
          {incomingInvites.length === 0 ? (
            <div className="p-6 text-center text-xs text-zinc-500 rounded-2xl bg-zinc-950 border border-zinc-800">
              No pending incoming invitations or marriage proposals.
            </div>
          ) : (
            incomingInvites.map((inv) => (
              <div key={inv.id} className="p-3 rounded-2xl bg-zinc-950 border border-rose-500/40 space-y-2">
                <div className="text-xs font-black text-white">
                  {inv.isMarriageProposal ? 'Marriage Proposal' : 'Family Invitation'} from @{inv.fromUsername}
                </div>
                <div className="text-[11px] text-zinc-300">
                  Household: <strong>{inv.familyName}</strong> · Role: <strong>{inv.proposedRole}</strong>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => handleRespondInvite(inv.id, true)}
                    className="flex-1 py-1.5 rounded-xl bg-emerald-500 text-black font-black text-xs cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" /> Accept
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => handleRespondInvite(inv.id, false)}
                    className="flex-1 py-1.5 rounded-xl bg-zinc-800 text-zinc-300 font-bold text-xs cursor-pointer flex items-center justify-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" /> Decline
                  </button>
                </div>
              </div>
            ))
          )}

          {outgoingInvites.length > 0 && (
            <div className="space-y-1.5 pt-2">
              <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold">Sent Invites</span>
              {outgoingInvites.map((inv) => (
                <div key={inv.id} className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-300 flex justify-between">
                  <span>
                    To @{inv.toUsername} ({inv.proposedRole})
                  </span>
                  <span className="text-amber-300 font-mono">Pending</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
