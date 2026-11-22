/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import path from 'path';
import { EconomyEngine } from './economyEngine.ts';
import { realtimeHub } from './realtimeHub.ts';
import { majorToMinor } from '../utils/bigMoney.ts';

export interface SnapAccount {
  usernameLower: string;
  snapUsername: string;
  displayName: string;
  bio: string;
  avatarEmoji: string;
  privacyMessages: 'everyone' | 'friends';
  privacyStories: 'everyone' | 'friends';
  blockedUsers: string[];
  friends: string[];
  incomingRequests: Array<{ from: string; createdAt: number }>;
  outgoingRequests: Array<{ to: string; createdAt: number }>;
  snapScore: number;
  isSnapPlus: boolean;
  snapPlusExpiresAt: number;
  plusCustom: {
    profileTheme: 'gold' | 'emerald' | 'obsidian' | 'sunset';
    appIcon: 'classic' | 'noir' | 'neon_emerald' | 'royal_gold';
    chatBackground: 'default' | 'lagos_night' | 'toronto_aurora' | 'emerald_grid';
    storyFrame: 'classic' | 'gold_halo' | 'emerald_pulse';
  };
  streaks: Record<string, { days: number; lastInteracted: number }>;
  updatedAt: number;
}

export interface SnapGroup {
  id: string;
  name: string;
  creator: string;
  members: string[];
  createdAt: number;
}

export interface SnapDirectMessage {
  id: string;
  threadType: 'dm' | 'group';
  groupId?: string;
  fromUser: string;
  toUser?: string;
  text: string;
  mediaDataUrl?: string;
  mediaType?: 'image' | 'video';
  filterUsed?: string;
  disappearSeconds: 0 | 10 | 60 | 86400;
  expiresAt?: number;
  replyToStoryId?: string;
  reactions: Array<{ user: string; emoji: string }>;
  deliveredTo: string[];
  readBy: string[];
  timestamp: number;
}

export interface SnapStory {
  id: string;
  author: string;
  authorDisplayName: string;
  caption: string;
  mediaDataUrl?: string;
  mediaType?: 'image' | 'video';
  bgGradient: string;
  audience: 'public' | 'friends';
  storyStyle?: string;
  viewers: string[];
  reactions: Array<{ user: string; emoji: string }>;
  createdAt: number;
  expiresAt: number;
}

export interface SnapReport {
  id: string;
  reporter: string;
  targetUser: string;
  reason: string;
  createdAt: number;
}

export interface SnapchatState {
  accounts: Record<string, SnapAccount>;
  groups: Record<string, SnapGroup>;
  messages: SnapDirectMessage[];
  stories: SnapStory[];
  reports: SnapReport[];
}

export class SnapchatEngine {
  private filePath: string;
  public state: SnapchatState;

  constructor(dbDir: string) {
    this.filePath = path.resolve(dbDir, 'snapchat_ecosystem.json');
    this.state = this.load();
  }

  private load(): SnapchatState {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      if (fs.existsSync(this.filePath)) {
        const parsed = JSON.parse(fs.readFileSync(this.filePath, 'utf-8'));
        return {
          accounts: parsed.accounts || {},
          groups: parsed.groups || {},
          messages: Array.isArray(parsed.messages) ? parsed.messages : [],
          stories: Array.isArray(parsed.stories) ? parsed.stories : [],
          reports: Array.isArray(parsed.reports) ? parsed.reports : [],
        };
      }
    } catch (err) {
      console.error('Error loading snapchat ecosystem:', err);
    }
    return { accounts: {}, groups: {}, messages: [], stories: [], reports: [] };
  }

  public save(): void {
    try {
      this.purgeExpired();
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      const tmp = `${this.filePath}.tmp`;
      fs.writeFileSync(tmp, JSON.stringify(this.state, null, 2), 'utf-8');
      fs.renameSync(tmp, this.filePath);
    } catch (err) {
      console.error('Error saving snapchat ecosystem:', err);
    }
  }

  public purgeExpired(nowMs: number = Date.now()): boolean {
    const prevMsgLen = this.state.messages.length;
    const prevStoryLen = this.state.stories.length;
    this.state.messages = this.state.messages.filter((m) => !m.expiresAt || m.expiresAt > nowMs);
    this.state.stories = this.state.stories.filter((s) => s.expiresAt > nowMs);
    for (const acc of Object.values(this.state.accounts)) {
      if (acc.isSnapPlus && acc.snapPlusExpiresAt > 0 && acc.snapPlusExpiresAt <= nowMs) {
        acc.isSnapPlus = false;
      }
    }
    return this.state.messages.length !== prevMsgLen || this.state.stories.length !== prevStoryLen;
  }

  public ensureAccount(username: string, displayName?: string, isOwner = false): SnapAccount {
    const clean = username.toLowerCase().trim();
    const existing = this.state.accounts[clean];
    if (existing) {
      if (existing.isSnapPlus && existing.snapPlusExpiresAt > 0 && existing.snapPlusExpiresAt <= Date.now()) {
        existing.isSnapPlus = false;
      }
      return existing;
    }
    const created: SnapAccount = {
      usernameLower: clean,
      snapUsername: clean,
      displayName: (displayName || username).trim() || clean,
      bio: 'Living large in Naija Life',
      avatarEmoji: '😎',
      privacyMessages: 'everyone',
      privacyStories: 'everyone',
      blockedUsers: [],
      friends: [],
      incomingRequests: [],
      outgoingRequests: [],
      snapScore: isOwner ? 1000 : 50,
      isSnapPlus: false,
      snapPlusExpiresAt: 0,
      plusCustom: {
        profileTheme: 'gold',
        appIcon: 'classic',
        chatBackground: 'default',
        storyFrame: 'classic',
      },
      streaks: {},
      updatedAt: Date.now(),
    };
    this.state.accounts[clean] = created;
    this.save();
    return created;
  }

  public isBlockedEitherWay(userA: string, userB: string): boolean {
    const a = this.state.accounts[userA.toLowerCase().trim()];
    const b = this.state.accounts[userB.toLowerCase().trim()];
    const cleanA = userA.toLowerCase().trim();
    const cleanB = userB.toLowerCase().trim();
    return Boolean(a?.blockedUsers?.includes(cleanB) || b?.blockedUsers?.includes(cleanA));
  }

  public updateProfile(username: string, updates: Partial<SnapAccount>): SnapAccount {
    const acc = this.ensureAccount(username);
    if (typeof updates.displayName === 'string' && updates.displayName.trim()) {
      acc.displayName = updates.displayName.trim().slice(0, 40);
    }
    if (typeof updates.bio === 'string') {
      acc.bio = updates.bio.trim().slice(0, 140);
    }
    if (typeof updates.avatarEmoji === 'string' && updates.avatarEmoji.trim()) {
      acc.avatarEmoji = updates.avatarEmoji.trim().slice(0, 8);
    }
    if (updates.privacyMessages === 'everyone' || updates.privacyMessages === 'friends') {
      acc.privacyMessages = updates.privacyMessages;
    }
    if (updates.privacyStories === 'everyone' || updates.privacyStories === 'friends') {
      acc.privacyStories = updates.privacyStories;
    }
    if (updates.plusCustom && (acc.isSnapPlus && acc.snapPlusExpiresAt > Date.now())) {
      acc.plusCustom = { ...acc.plusCustom, ...updates.plusCustom };
    }
    acc.updatedAt = Date.now();
    this.save();
    return acc;
  }

  public sendFriendRequest(fromUser: string, toUser: string): { ok: boolean; error?: string; fromAcc?: SnapAccount } {
    const cleanFrom = fromUser.toLowerCase().trim();
    const cleanTo = toUser.toLowerCase().trim();
    if (!cleanFrom || !cleanTo || cleanFrom === cleanTo) {
      return { ok: false, error: 'Cannot add yourself as a friend.' };
    }
    if (this.isBlockedEitherWay(cleanFrom, cleanTo)) {
      return { ok: false, error: 'Unable to send friend request due to block settings.' };
    }
    const fromAcc = this.ensureAccount(cleanFrom);
    const toAcc = this.ensureAccount(cleanTo);

    if (fromAcc.friends.includes(cleanTo)) {
      return { ok: false, error: `You and @${cleanTo} are already friends.` };
    }

    // If the recipient already requested us, auto-accept
    if (fromAcc.incomingRequests.some((r) => r.from === cleanTo)) {
      return this.respondFriendRequest(cleanFrom, cleanTo, true);
    }

    if (!toAcc.incomingRequests.some((r) => r.from === cleanFrom)) {
      toAcc.incomingRequests.unshift({ from: cleanFrom, createdAt: Date.now() });
    }
    if (!fromAcc.outgoingRequests.some((r) => r.to === cleanTo)) {
      fromAcc.outgoingRequests.unshift({ to: cleanTo, createdAt: Date.now() });
    }
    this.save();
    realtimeHub.sendToUser(cleanTo, {
      type: 'snap:friend_request',
      from: cleanFrom,
      displayName: fromAcc.displayName,
    });
    return { ok: true, fromAcc };
  }

  public respondFriendRequest(
    actorUser: string,
    requesterUser: string,
    accept: boolean
  ): { ok: boolean; error?: string; fromAcc?: SnapAccount } {
    const cleanActor = actorUser.toLowerCase().trim();
    const cleanReq = requesterUser.toLowerCase().trim();
    const actorAcc = this.ensureAccount(cleanActor);
    const reqAcc = this.ensureAccount(cleanReq);

    actorAcc.incomingRequests = actorAcc.incomingRequests.filter((r) => r.from !== cleanReq);
    reqAcc.outgoingRequests = reqAcc.outgoingRequests.filter((r) => r.to !== cleanActor);

    if (accept && !this.isBlockedEitherWay(cleanActor, cleanReq)) {
      if (!actorAcc.friends.includes(cleanReq)) actorAcc.friends.push(cleanReq);
      if (!reqAcc.friends.includes(cleanActor)) reqAcc.friends.push(cleanActor);
      realtimeHub.sendToUser(cleanReq, {
        type: 'snap:friend_accepted',
        by: cleanActor,
      });
    }
    this.save();
    return { ok: true, fromAcc: actorAcc };
  }

  public toggleBlock(actorUser: string, targetUser: string, block: boolean): SnapAccount {
    const cleanActor = actorUser.toLowerCase().trim();
    const cleanTarget = targetUser.toLowerCase().trim();
    const actorAcc = this.ensureAccount(cleanActor);
    if (block) {
      if (!actorAcc.blockedUsers.includes(cleanTarget)) actorAcc.blockedUsers.push(cleanTarget);
      actorAcc.friends = actorAcc.friends.filter((f) => f !== cleanTarget);
      const targetAcc = this.state.accounts[cleanTarget];
      if (targetAcc) {
        targetAcc.friends = targetAcc.friends.filter((f) => f !== cleanActor);
      }
    } else {
      actorAcc.blockedUsers = actorAcc.blockedUsers.filter((b) => b !== cleanTarget);
    }
    this.save();
    return actorAcc;
  }

  public fileReport(reporter: string, targetUser: string, reason: string): SnapReport {
    const rep: SnapReport = {
      id: `rep_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      reporter: reporter.toLowerCase().trim(),
      targetUser: targetUser.toLowerCase().trim(),
      reason: reason.trim().slice(0, 300) || 'Inappropriate conduct',
      createdAt: Date.now(),
    };
    this.state.reports.unshift(rep);
    this.state.reports = this.state.reports.slice(0, 300);
    this.save();
    return rep;
  }

  public createGroup(creator: string, name: string, members: string[]): { ok: boolean; error?: string; group?: SnapGroup } {
    const cleanCreator = creator.toLowerCase().trim();
    const cleanName = name.trim().slice(0, 48);
    if (!cleanName) return { ok: false, error: 'Group name is required.' };
    const cleanMembers = Array.from(
      new Set([cleanCreator, ...members.map((m) => m.toLowerCase().trim()).filter(Boolean)])
    );
    if (cleanMembers.length < 2) {
      return { ok: false, error: 'Add at least 1 other citizen to create a group chat.' };
    }
    const group: SnapGroup = {
      id: `grp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: cleanName,
      creator: cleanCreator,
      members: cleanMembers,
      createdAt: Date.now(),
    };
    this.state.groups[group.id] = group;
    this.save();
    for (const member of cleanMembers) {
      realtimeHub.sendToUser(member, { type: 'snap:group_created', group });
    }
    return { ok: true, group };
  }

  public sendMessage(params: {
    fromUser: string;
    toUser?: string;
    groupId?: string;
    text?: string;
    mediaDataUrl?: string;
    mediaType?: 'image' | 'video';
    filterUsed?: string;
    disappearSeconds?: number;
    replyToStoryId?: string;
  }): { ok: boolean; error?: string; message?: SnapDirectMessage } {
    const cleanFrom = params.fromUser.toLowerCase().trim();
    if (!cleanFrom) return { ok: false, error: 'Sender required.' };

    const rawDisappear = Number(params.disappearSeconds || 0);
    const disappearSeconds: 0 | 10 | 60 | 86400 =
      rawDisappear === 10 || rawDisappear === 60 || rawDisappear === 86400 ? rawDisappear : 0;

    if (params.mediaDataUrl && params.mediaDataUrl.length > 2_800_000) {
      return { ok: false, error: 'Media attachment exceeds 2MB limit.' };
    }

    const fromAcc = this.ensureAccount(cleanFrom);
    const deliveredTo: string[] = [];

    if (params.groupId) {
      const group = this.state.groups[params.groupId];
      if (!group || !group.members.includes(cleanFrom)) {
        return { ok: false, error: 'Group not found or you are not a member.' };
      }
      for (const m of group.members) {
        if (m !== cleanFrom && !this.isBlockedEitherWay(cleanFrom, m)) {
          if (realtimeHub.isUserOnline(m)) deliveredTo.push(m);
        }
      }
    } else {
      const cleanTo = String(params.toUser || '').toLowerCase().trim();
      if (!cleanTo) return { ok: false, error: 'Recipient is required.' };
      if (this.isBlockedEitherWay(cleanFrom, cleanTo)) {
        return { ok: false, error: 'Message blocked due to privacy/block settings.' };
      }
      const toAcc = this.ensureAccount(cleanTo);
      if (toAcc.privacyMessages === 'friends' && !toAcc.friends.includes(cleanFrom)) {
        return { ok: false, error: `@${cleanTo} only accepts messages from friends.` };
      }
      if (realtimeHub.isUserOnline(cleanTo)) deliveredTo.push(cleanTo);
      // Update streak
      const curStreak = fromAcc.streaks[cleanTo]?.days || 0;
      fromAcc.streaks[cleanTo] = { days: curStreak + 1, lastInteracted: Date.now() };
      const toStreak = toAcc.streaks[cleanFrom]?.days || 0;
      toAcc.streaks[cleanFrom] = { days: toStreak + 1, lastInteracted: Date.now() };
    }

    const now = Date.now();
    // If disappearSeconds === 86400, start countdown immediately; 10s/60s start countdown upon read
    const expiresAt = disappearSeconds === 86400 ? now + 86400 * 1000 : undefined;

    const msg: SnapDirectMessage = {
      id: `snap_${now}_${Math.random().toString(36).slice(2, 7)}`,
      threadType: params.groupId ? 'group' : 'dm',
      groupId: params.groupId,
      fromUser: cleanFrom,
      toUser: params.groupId ? undefined : String(params.toUser).toLowerCase().trim(),
      text: String(params.text || '').trim().slice(0, 1000),
      mediaDataUrl: params.mediaDataUrl,
      mediaType: params.mediaType,
      filterUsed: params.filterUsed,
      disappearSeconds,
      expiresAt,
      replyToStoryId: params.replyToStoryId,
      reactions: [],
      deliveredTo,
      readBy: [cleanFrom],
      timestamp: now,
    };

    fromAcc.snapScore += 10;
    this.state.messages.unshift(msg);
    if (this.state.messages.length > 1500) {
      this.state.messages = this.state.messages.slice(0, 1500);
    }
    this.save();

    if (params.groupId) {
      const group = this.state.groups[params.groupId];
      for (const m of group.members) {
        if (m !== cleanFrom && !this.isBlockedEitherWay(cleanFrom, m)) {
          realtimeHub.sendToUser(m, { type: 'snap:new_message', message: msg });
        }
      }
    } else if (msg.toUser) {
      realtimeHub.sendToUser(msg.toUser, { type: 'snap:new_message', message: msg });
    }
    return { ok: true, message: msg };
  }

  public markThreadRead(reader: string, peerOrGroupId: string, isGroup = false): SnapDirectMessage[] {
    const cleanReader = reader.toLowerCase().trim();
    const cleanPeer = peerOrGroupId.toLowerCase().trim();
    const now = Date.now();
    let modified = false;

    for (const msg of this.state.messages) {
      const matches = isGroup
        ? msg.threadType === 'group' && msg.groupId === peerOrGroupId
        : msg.threadType === 'dm' && msg.fromUser === cleanPeer && msg.toUser === cleanReader;
      if (matches && !msg.readBy.includes(cleanReader)) {
        msg.readBy.push(cleanReader);
        if (!msg.deliveredTo.includes(cleanReader)) msg.deliveredTo.push(cleanReader);
        if (msg.disappearSeconds > 0 && !msg.expiresAt) {
          msg.expiresAt = now + msg.disappearSeconds * 1000;
        }
        modified = true;
        realtimeHub.sendToUser(msg.fromUser, {
          type: 'snap:message_read',
          messageId: msg.id,
          readBy: msg.readBy,
          expiresAt: msg.expiresAt,
        });
      }
    }
    if (modified) this.save();
    return this.getMessagesForUser(cleanReader);
  }

  public reactMessage(actorUser: string, messageId: string, emoji: string): { ok: boolean; message?: SnapDirectMessage } {
    const cleanActor = actorUser.toLowerCase().trim();
    const msg = this.state.messages.find((m) => m.id === messageId);
    if (!msg) return { ok: false };
    msg.reactions = msg.reactions.filter((r) => r.user !== cleanActor);
    msg.reactions.push({ user: cleanActor, emoji: emoji.slice(0, 6) });
    this.save();
    const targets = msg.groupId
      ? this.state.groups[msg.groupId]?.members || []
      : [msg.fromUser, msg.toUser || ''].filter(Boolean);
    for (const t of targets) {
      realtimeHub.sendToUser(t, { type: 'snap:message_reaction', message: msg });
    }
    return { ok: true, message: msg };
  }

  public getMessagesForUser(username: string): SnapDirectMessage[] {
    this.purgeExpired();
    const clean = username.toLowerCase().trim();
    const userGroupIds = new Set(
      Object.values(this.state.groups)
        .filter((g) => g.members.includes(clean))
        .map((g) => g.id)
    );
    return this.state.messages.filter((m) => {
      if (this.isBlockedEitherWay(clean, m.fromUser)) return false;
      if (m.threadType === 'group') {
        return Boolean(m.groupId && userGroupIds.has(m.groupId));
      }
      return m.fromUser === clean || m.toUser === clean;
    });
  }

  public postStory(params: {
    author: string;
    caption: string;
    mediaDataUrl?: string;
    mediaType?: 'image' | 'video';
    bgGradient?: string;
    audience?: 'public' | 'friends';
    storyStyle?: string;
  }): { ok: boolean; error?: string; story?: SnapStory } {
    const cleanAuthor = params.author.toLowerCase().trim();
    const acc = this.ensureAccount(cleanAuthor);
    if (params.mediaDataUrl && params.mediaDataUrl.length > 2_800_000) {
      return { ok: false, error: 'Story media exceeds 2MB size limit.' };
    }
    const now = Date.now();
    const story: SnapStory = {
      id: `sty_${now}_${Math.random().toString(36).slice(2, 6)}`,
      author: cleanAuthor,
      authorDisplayName: acc.displayName,
      caption: String(params.caption || '').trim().slice(0, 280),
      mediaDataUrl: params.mediaDataUrl,
      mediaType: params.mediaType,
      bgGradient: params.bgGradient || 'from-emerald-600 via-teal-700 to-zinc-950',
      audience: params.audience === 'friends' ? 'friends' : 'public',
      storyStyle: params.storyStyle || (acc.isSnapPlus ? acc.plusCustom.storyFrame : 'classic'),
      viewers: [],
      reactions: [],
      createdAt: now,
      expiresAt: now + 24 * 60 * 60 * 1000, // strictly 24 hours
    };
    this.state.stories.unshift(story);
    acc.snapScore += 15;
    this.save();
    realtimeHub.broadcastAll({ type: 'snap:story_posted', author: cleanAuthor, storyId: story.id });
    return { ok: true, story };
  }

  public getVisibleStories(viewer: string): SnapStory[] {
    this.purgeExpired();
    const cleanViewer = viewer.toLowerCase().trim();
    return this.state.stories.filter((s) => {
      if (s.author === cleanViewer) return true;
      if (this.isBlockedEitherWay(cleanViewer, s.author)) return false;
      const authorAcc = this.state.accounts[s.author];
      if (s.audience === 'friends' || authorAcc?.privacyStories === 'friends') {
        return Boolean(authorAcc?.friends?.includes(cleanViewer));
      }
      return true;
    });
  }

  public viewStory(viewer: string, storyId: string): SnapStory | null {
    const cleanViewer = viewer.toLowerCase().trim();
    const story = this.state.stories.find((s) => s.id === storyId);
    if (!story) return null;
    if (story.author !== cleanViewer && !story.viewers.includes(cleanViewer)) {
      story.viewers.push(cleanViewer);
      this.save();
    }
    return story;
  }

  public reactStory(viewer: string, storyId: string, emoji: string): SnapStory | null {
    const cleanViewer = viewer.toLowerCase().trim();
    const story = this.state.stories.find((s) => s.id === storyId);
    if (!story) return null;
    story.reactions = story.reactions.filter((r) => r.user !== cleanViewer);
    story.reactions.push({ user: cleanViewer, emoji: emoji.slice(0, 6) });
    this.save();
    realtimeHub.sendToUser(story.author, {
      type: 'snap:story_reaction',
      storyId,
      from: cleanViewer,
      emoji,
    });
    return story;
  }

  public subscribeSnapPlus(params: {
    uid: string;
    username: string;
    currency: 'NGN' | 'CAD';
    economy: EconomyEngine;
    requestId?: string;
  }): { ok: boolean; error?: string; account?: SnapAccount; economyAccount?: any; message?: string } {
    const priceMajor = params.currency === 'CAD' ? 5 : 3500;
    const debitRes = params.economy.debitMinor({
      uid: params.uid,
      currency: params.currency,
      amountMinor: majorToMinor(priceMajor),
      title: `Snapchat+ Monthly Membership (${params.currency === 'CAD' ? '$5 CAD' : '₦3,500'})`,
      category: 'lifestyle',
      recipientOrSender: 'Snapchat+ Subscription Billing',
      requestId: params.requestId,
    });
    if (!debitRes.ok) {
      return { ok: false, error: debitRes.error };
    }
    const acc = this.ensureAccount(params.username);
    const now = Date.now();
    const baseExpiry = acc.snapPlusExpiresAt > now ? acc.snapPlusExpiresAt : now;
    acc.isSnapPlus = true;
    acc.snapPlusExpiresAt = baseExpiry + 30 * 24 * 60 * 60 * 1000;
    acc.snapScore += 500;
    if (debitRes.account) {
      debitRes.account.snapPlusExpiresAt = acc.snapPlusExpiresAt;
      this.economySyncFlag(debitRes.account, acc);
    }
    this.save();
    return {
      ok: true,
      account: acc,
      economyAccount: debitRes.account,
      message: `Snapchat+ Activated for 30 days! Custom icons, themes & story frames unlocked.`,
    };
  }

  private economySyncFlag(econAcc: any, snapAcc: SnapAccount): void {
    econAcc.snapPlusExpiresAt = snapAcc.snapPlusExpiresAt;
  }
}
