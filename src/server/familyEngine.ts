/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import path from 'path';
import { realtimeHub } from './realtimeHub.ts';

export type FamilyRole = 'Head' | 'Spouse' | 'Child' | 'Parent' | 'Sibling' | 'Member';

export interface FamilyMember {
  username: string;
  displayName: string;
  role: FamilyRole;
  parentUsernames: string[];
  spouseUsername?: string;
  joinedAt: number;
}

export interface FamilyInvitation {
  id: string;
  familyId: string;
  familyName: string;
  fromUsername: string;
  toUsername: string;
  proposedRole: FamilyRole;
  isMarriageProposal: boolean;
  message: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: number;
}

export interface FamilyEvent {
  id: string;
  familyId: string;
  title: string;
  activityType: 'dinner' | 'road_trip' | 'celebration' | 'house_chore' | 'game_night';
  scheduledDateTime: string;
  createdBy: string;
  rsvps: Record<string, 'going' | 'maybe' | 'declined'>;
  createdAt: number;
}

export interface FamilyUnit {
  id: string;
  name: string;
  motto: string;
  headUsername: string;
  householdHomeId?: string;
  members: FamilyMember[];
  activitiesLog: Array<{ id: string; actor: string; summary: string; timestamp: number }>;
  events: FamilyEvent[];
  createdAt: number;
}

export interface FamilyState {
  families: Record<string, FamilyUnit>;
  familyIdByUsername: Record<string, string>;
  invitations: FamilyInvitation[];
}

export class FamilyEngine {
  private filePath: string;
  public state: FamilyState;

  constructor(dbDir: string) {
    this.filePath = path.resolve(dbDir, 'family_state.json');
    this.state = this.load();
  }

  private load(): FamilyState {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      if (fs.existsSync(this.filePath)) {
        const parsed = JSON.parse(fs.readFileSync(this.filePath, 'utf-8'));
        return {
          families: parsed.families || {},
          familyIdByUsername: parsed.familyIdByUsername || {},
          invitations: Array.isArray(parsed.invitations) ? parsed.invitations : [],
        };
      }
    } catch (err) {
      console.error('Error loading family state:', err);
    }
    return { families: {}, familyIdByUsername: {}, invitations: [] };
  }

  public save(): void {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      const tmp = `${this.filePath}.tmp`;
      fs.writeFileSync(tmp, JSON.stringify(this.state, null, 2), 'utf-8');
      fs.renameSync(tmp, this.filePath);
    } catch (err) {
      console.error('Error saving family state:', err);
    }
  }

  public getUserFamilyBundle(username: string): {
    family: FamilyUnit | null;
    incomingInvites: FamilyInvitation[];
    outgoingInvites: FamilyInvitation[];
  } {
    const clean = username.toLowerCase().trim();
    const fid = this.state.familyIdByUsername[clean];
    const family = fid ? this.state.families[fid] || null : null;
    const incomingInvites = this.state.invitations.filter(
      (i) => i.toUsername === clean && i.status === 'pending'
    );
    const outgoingInvites = this.state.invitations.filter(
      (i) => i.fromUsername === clean && i.status === 'pending'
    );
    return { family, incomingInvites, outgoingInvites };
  }

  public createFamily(params: {
    username: string;
    displayName: string;
    familyName: string;
    motto?: string;
    householdHomeId?: string;
  }): { ok: boolean; error?: string; family?: FamilyUnit } {
    const clean = params.username.toLowerCase().trim();
    if (!clean) return { ok: false, error: 'Username required.' };
    if (this.state.familyIdByUsername[clean]) {
      return { ok: false, error: 'You already belong to a family. Leave your current family first.' };
    }
    const famName = String(params.familyName || '').trim().slice(0, 48);
    if (famName.length < 2) return { ok: false, error: 'Family name must be at least 2 characters.' };

    const fid = `fam_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const family: FamilyUnit = {
      id: fid,
      name: famName,
      motto: String(params.motto || 'Stronger Together').trim().slice(0, 100),
      headUsername: clean,
      householdHomeId: params.householdHomeId,
      members: [
        {
          username: clean,
          displayName: params.displayName || clean,
          role: 'Head',
          parentUsernames: [],
          joinedAt: Date.now(),
        },
      ],
      activitiesLog: [
        {
          id: `act_${Date.now()}`,
          actor: clean,
          summary: `Founded the ${famName} Family`,
          timestamp: Date.now(),
        },
      ],
      events: [],
      createdAt: Date.now(),
    };
    this.state.families[fid] = family;
    this.state.familyIdByUsername[clean] = fid;
    this.save();
    return { ok: true, family };
  }

  public sendInvite(params: {
    fromUsername: string;
    toUsername: string;
    proposedRole: FamilyRole;
    isMarriageProposal?: boolean;
    message?: string;
  }): { ok: boolean; error?: string; invite?: FamilyInvitation } {
    const cleanFrom = params.fromUsername.toLowerCase().trim();
    const cleanTo = params.toUsername.toLowerCase().trim();
    if (!cleanFrom || !cleanTo || cleanFrom === cleanTo) {
      return { ok: false, error: 'Invalid target citizen username.' };
    }
    const fid = this.state.familyIdByUsername[cleanFrom];
    if (!fid || !this.state.families[fid]) {
      return { ok: false, error: 'Create a family first before inviting members.' };
    }
    const fam = this.state.families[fid];
    if (fam.members.some((m) => m.username === cleanTo)) {
      return { ok: false, error: `@${cleanTo} is already in your family.` };
    }
    const existingPending = this.state.invitations.find(
      (i) => i.familyId === fid && i.toUsername === cleanTo && i.status === 'pending'
    );
    if (existingPending) {
      return { ok: false, error: `Pending invitation already sent to @${cleanTo}.` };
    }

    const invite: FamilyInvitation = {
      id: `faminv_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      familyId: fid,
      familyName: fam.name,
      fromUsername: cleanFrom,
      toUsername: cleanTo,
      proposedRole: params.isMarriageProposal ? 'Spouse' : params.proposedRole || 'Member',
      isMarriageProposal: Boolean(params.isMarriageProposal),
      message:
        String(params.message || '').trim().slice(0, 140) ||
        (params.isMarriageProposal
          ? `@${cleanFrom} proposed marriage to join the ${fam.name} Family!`
          : `@${cleanFrom} invited you to join the ${fam.name} Family as ${params.proposedRole || 'Member'}.`),
      status: 'pending',
      createdAt: Date.now(),
    };

    this.state.invitations.unshift(invite);
    this.save();
    realtimeHub.sendToUser(cleanTo, { type: 'family:invite', invite });
    return { ok: true, invite };
  }

  public respondInvite(params: {
    actorUsername: string;
    actorDisplayName?: string;
    inviteId: string;
    accept: boolean;
  }): { ok: boolean; error?: string; family?: FamilyUnit | null } {
    const cleanActor = params.actorUsername.toLowerCase().trim();
    const invite = this.state.invitations.find((i) => i.id === params.inviteId && i.toUsername === cleanActor);
    if (!invite || invite.status !== 'pending') {
      return { ok: false, error: 'Invitation not found or already handled.' };
    }

    if (!params.accept) {
      invite.status = 'declined';
      this.save();
      realtimeHub.sendToUser(invite.fromUsername, {
        type: 'family:invite_response',
        inviteId: invite.id,
        accepted: false,
        by: cleanActor,
      });
      return { ok: true, family: null };
    }

    if (this.state.familyIdByUsername[cleanActor]) {
      return { ok: false, error: 'You already belong to a family. Leave your current family before accepting.' };
    }

    const fam = this.state.families[invite.familyId];
    if (!fam) {
      invite.status = 'declined';
      this.save();
      return { ok: false, error: 'Family no longer exists.' };
    }

    invite.status = 'accepted';
    const inviter = fam.members.find((m) => m.username === invite.fromUsername);
    const newMember: FamilyMember = {
      username: cleanActor,
      displayName: params.actorDisplayName || cleanActor,
      role: invite.isMarriageProposal ? 'Spouse' : invite.proposedRole,
      parentUsernames:
        invite.proposedRole === 'Child' && inviter
          ? [inviter.username, ...(inviter.spouseUsername ? [inviter.spouseUsername] : [])]
          : [],
      spouseUsername: invite.isMarriageProposal ? invite.fromUsername : undefined,
      joinedAt: Date.now(),
    };

    if (invite.isMarriageProposal && inviter) {
      inviter.spouseUsername = cleanActor;
    }

    fam.members.push(newMember);
    fam.activitiesLog.unshift({
      id: `act_${Date.now()}`,
      actor: cleanActor,
      summary: invite.isMarriageProposal
        ? `@${cleanActor} & @${invite.fromUsername} got married and united the family!`
        : `@${cleanActor} joined the family as ${newMember.role}`,
      timestamp: Date.now(),
    });
    this.state.familyIdByUsername[cleanActor] = fam.id;
    this.save();

    for (const m of fam.members) {
      realtimeHub.sendToUser(m.username, { type: 'family:updated', family: fam });
    }
    return { ok: true, family: fam };
  }

  public updateMemberRole(actorUsername: string, targetUsername: string, role: FamilyRole): { ok: boolean; error?: string; family?: FamilyUnit } {
    const cleanActor = actorUsername.toLowerCase().trim();
    const cleanTarget = targetUsername.toLowerCase().trim();
    const fid = this.state.familyIdByUsername[cleanActor];
    const fam = fid ? this.state.families[fid] : undefined;
    if (!fam) return { ok: false, error: 'Family not found.' };
    const member = fam.members.find((m) => m.username === cleanTarget);
    if (!member) return { ok: false, error: 'Member not found in your family.' };
    member.role = role;
    fam.activitiesLog.unshift({
      id: `act_${Date.now()}`,
      actor: cleanActor,
      summary: `Updated @${cleanTarget}'s family role to ${role}`,
      timestamp: Date.now(),
    });
    this.save();
    return { ok: true, family: fam };
  }

  public addActivityOrEvent(params: {
    actorUsername: string;
    title: string;
    activityType: FamilyEvent['activityType'];
    scheduledDateTime: string;
  }): { ok: boolean; error?: string; family?: FamilyUnit } {
    const cleanActor = params.actorUsername.toLowerCase().trim();
    const fid = this.state.familyIdByUsername[cleanActor];
    const fam = fid ? this.state.families[fid] : undefined;
    if (!fam) return { ok: false, error: 'Join or create a family first.' };

    const evt: FamilyEvent = {
      id: `famevt_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
      familyId: fid,
      title: params.title.trim().slice(0, 80) || 'Family Gathering',
      activityType: params.activityType || 'dinner',
      scheduledDateTime: params.scheduledDateTime || new Date(Date.now() + 3600000).toISOString().slice(0, 16),
      createdBy: cleanActor,
      rsvps: { [cleanActor]: 'going' },
      createdAt: Date.now(),
    };
    fam.events.unshift(evt);
    fam.activitiesLog.unshift({
      id: `act_${Date.now()}`,
      actor: cleanActor,
      summary: `Scheduled family event: ${evt.title}`,
      timestamp: Date.now(),
    });
    this.save();
    for (const m of fam.members) {
      realtimeHub.sendToUser(m.username, { type: 'family:event_created', event: evt, family: fam });
    }
    return { ok: true, family: fam };
  }

  public rsvpEvent(actorUsername: string, eventId: string, status: 'going' | 'maybe' | 'declined'): { ok: boolean; error?: string; family?: FamilyUnit } {
    const cleanActor = actorUsername.toLowerCase().trim();
    const fid = this.state.familyIdByUsername[cleanActor];
    const fam = fid ? this.state.families[fid] : undefined;
    if (!fam) return { ok: false, error: 'Family not found.' };
    const evt = fam.events.find((e) => e.id === eventId);
    if (!evt) return { ok: false, error: 'Event not found.' };
    evt.rsvps[cleanActor] = status;
    this.save();
    return { ok: true, family: fam };
  }

  public leaveFamily(actorUsername: string): { ok: boolean } {
    const cleanActor = actorUsername.toLowerCase().trim();
    const fid = this.state.familyIdByUsername[cleanActor];
    if (!fid) return { ok: true };
    const fam = this.state.families[fid];
    delete this.state.familyIdByUsername[cleanActor];
    if (fam) {
      fam.members = fam.members.filter((m) => m.username !== cleanActor);
      if (fam.members.length === 0) {
        delete this.state.families[fid];
      } else if (fam.headUsername === cleanActor) {
        fam.headUsername = fam.members[0].username;
        fam.members[0].role = 'Head';
      }
    }
    this.save();
    return { ok: true };
  }
}
