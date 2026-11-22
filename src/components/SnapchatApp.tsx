/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Camera,
  MessageSquare,
  Flame,
  Send,
  Sparkles,
  Search,
  Plus,
  Check,
  CheckCheck,
  Eye,
  Heart,
  Star,
  UserPlus,
  Users,
  ShieldAlert,
  Ban,
  Crown,
  Clock,
  Image as ImageIcon,
  Film,
  X,
  Palette,
  RefreshCw,
} from 'lucide-react';
import { UserProfile } from '../types/game';
import { formatNaira, formatCAD } from '../utils/formatNaira';
import { parseMinorString, majorToMinor } from '../utils/bigMoney';
import { getAuthBearerHeaders } from '../services/economyService';
import { realtimeClient } from '../services/realtimeClient';

export interface SnapchatAppProps {
  userProfile?: UserProfile;
  moneyNGN?: number;
  currentStateId?: string;
  onUpdateMoney?: (deltaNGN: number, deltaUSD?: number) => void;
  onUpdateProfile?: (updatedProfile: UserProfile) => void;
  onClose?: () => void;
  triggerSound?: (type: 'coin' | 'stamp' | 'alert' | 'success') => void;
  onShowToast?: (msg: string) => void;
  onUnreadCountChange?: (count: number) => void;
}

interface SnapChatProfile {
  username: string;
  displayName: string;
  bio: string;
  avatarUrl?: string;
  avatarEmoji?: string;
  themeColor?: string;
  appIconStyle?: string;
  chatBgStyle?: string;
  privacyMessages?: 'friends' | 'everyone';
  privacyStories?: 'friends' | 'public';
  isSnapPlus?: boolean;
  snapPlusExpiresAt?: number;
  friends: string[];
  blockedUsers: string[];
  streaks: Record<string, number>;
  online?: boolean;
}

interface SnapMessage {
  id: string;
  fromUsername: string;
  toUsername?: string;
  groupId?: string;
  text: string;
  mediaDataUrl?: string;
  mediaType?: 'image' | 'video';
  disappearSeconds: number;
  expiresAt?: number | null;
  replyToStoryId?: string;
  reactions: Record<string, string[]>;
  deliveredTo: string[];
  readBy: string[];
  createdAt: number;
}

interface SnapGroup {
  id: string;
  name: string;
  members: string[];
  createdBy: string;
  createdAt: number;
}

interface SnapStory {
  id: string;
  authorUsername: string;
  authorDisplayName: string;
  caption: string;
  mediaDataUrl?: string;
  mediaType?: 'image' | 'video';
  audience: 'friends' | 'public';
  bgTheme?: string;
  frameStyle?: string;
  viewers: string[];
  reactions: Record<string, string[]>;
  createdAt: number;
  expiresAt: number;
}

const SNAP_PLUS_PLANS = [
  { id: 'monthly', label: '30-Day Snapchat+ Pass', ngn: 4500, cad: 4.99, badge: 'Monthly' },
  { id: 'yearly', label: '365-Day Founder Pass', ngn: 42000, cad: 45.0, badge: 'Best Value' },
];

const CHAT_BG_STYLES: Record<string, string> = {
  obsidian: 'bg-zinc-950',
  emerald_aura: 'bg-gradient-to-b from-emerald-950/60 via-zinc-950 to-black',
  gold_royal: 'bg-gradient-to-b from-amber-950/50 via-zinc-950 to-black',
  neon_cyber: 'bg-gradient-to-b from-purple-950/60 via-zinc-950 to-indigo-950/40',
};

const TIMER_OPTIONS = [
  { sec: 0, label: 'Keep' },
  { sec: 10, label: '10s' },
  { sec: 60, label: '1m' },
  { sec: 86400, label: '24h' },
];

export const SnapchatApp: React.FC<SnapchatAppProps> = ({
  userProfile,
  moneyNGN = 0,
  currentStateId = 'lagos',
  onUpdateProfile,
  triggerSound,
  onShowToast,
  onUnreadCountChange,
}) => {
  const isCanada = currentStateId === 'canada' || userProfile?.currentCountry === 'canada';
  const myUsername = (userProfile?.username || '').toLowerCase().trim();

  const [tab, setTab] = useState<'chats' | 'stories' | 'friends' | 'profile' | 'plus'>('chats');
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<SnapChatProfile | null>(null);
  const [directory, setDirectory] = useState<SnapChatProfile[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<Array<{ id: string; fromUsername: string; createdAt: number }>>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<Array<{ id: string; toUsername: string; createdAt: number }>>([]);
  const [messages, setMessages] = useState<SnapMessage[]>([]);
  const [groups, setGroups] = useState<SnapGroup[]>([]);
  const [stories, setStories] = useState<SnapStory[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [typingFrom, setTypingFrom] = useState<Record<string, number>>({});

  // Active thread state
  const [activeDm, setActiveDm] = useState<string | null>(null);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [composerText, setComposerText] = useState('');
  const [disappearSec, setDisappearSec] = useState<number>(0);
  const [mediaDataUrl, setMediaDataUrl] = useState<string>('');
  const [mediaType, setMediaType] = useState<'image' | 'video' | undefined>(undefined);

  // Friend search & group modal
  const [searchQuery, setSearchQuery] = useState('');
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [groupNameInput, setGroupNameInput] = useState('');
  const [groupMemberChecks, setGroupMemberChecks] = useState<string[]>([]);

  // Story creation & viewing
  const [storyCaption, setStoryCaption] = useState('');
  const [storyAudience, setStoryAudience] = useState<'friends' | 'public'>('friends');
  const [storyMediaUrl, setStoryMediaUrl] = useState('');
  const [storyMediaType, setStoryMediaType] = useState<'image' | 'video' | undefined>(undefined);
  const [storyBg, setStoryBg] = useState('from-amber-600 to-rose-700');
  const [storyFrame, setStoryFrame] = useState('default');
  const [viewingStory, setViewingStory] = useState<SnapStory | null>(null);
  const [storyReplyInput, setStoryReplyInput] = useState('');

  // Profile editor
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editEmoji, setEditEmoji] = useState('😎');
  const [editAvatarUrl, setEditAvatarUrl] = useState('');
  const [editPrivacyMsg, setEditPrivacyMsg] = useState<'friends' | 'everyone'>('friends');
  const [editPrivacyStory, setEditPrivacyStory] = useState<'friends' | 'public'>('friends');

  // Report modal
  const [reportTarget, setReportTarget] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [busyAction, setBusyAction] = useState(false);
  const typingCooldownRef = useRef<number>(0);

  const loadState = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    try {
      const headers = await getAuthBearerHeaders();
      const resp = await fetch('/api/snapchat/state', { headers });
      const data = await resp.json();
      if (resp.ok && data.success) {
        setProfile(data.profile);
        setDirectory(data.directory || []);
        setIncomingRequests(data.incomingRequests || []);
        setOutgoingRequests(data.outgoingRequests || []);
        setMessages(data.messages || []);
        setGroups(data.groups || []);
        setStories(data.stories || []);
        setOnlineUsers(data.onlineUsers || []);

        if (data.profile && !editDisplayName) {
          setEditDisplayName(data.profile.displayName || myUsername);
          setEditBio(data.profile.bio || '');
          setEditEmoji(data.profile.avatarEmoji || '😎');
          setEditAvatarUrl(data.profile.avatarUrl || '');
          setEditPrivacyMsg(data.profile.privacyMessages || 'friends');
          setEditPrivacyStory(data.profile.privacyStories || 'friends');
        }

        const unread = (data.messages || []).filter(
          (m: SnapMessage) => m.fromUsername !== myUsername && !(m.readBy || []).includes(myUsername)
        ).length;
        onUnreadCountChange?.(unread);
      }
    } catch {
      // silent retry next cycle
    } finally {
      if (!quiet) setLoading(false);
    }
  }, [editDisplayName, myUsername, onUnreadCountChange]);

  useEffect(() => {
    loadState(false);
    const timer = window.setInterval(() => loadState(true), 8000);
    return () => window.clearInterval(timer);
  }, [loadState]);

  useEffect(() => {
    const unsub = realtimeClient.subscribe((evt) => {
      if (evt.type === 'snapchat:message' || evt.type === 'snapchat:story' || evt.type === 'snapchat:friend_update') {
        loadState(true);
      } else if (evt.type === 'typing:start' && evt.fromUsername) {
        setTypingFrom((prev) => ({ ...prev, [String(evt.fromUsername).toLowerCase()]: Date.now() }));
      } else if (evt.type === 'typing:stop' && evt.fromUsername) {
        setTypingFrom((prev) => {
          const next = { ...prev };
          delete next[String(evt.fromUsername).toLowerCase()];
          return next;
        });
      } else if (evt.type === 'presence:update' && Array.isArray(evt.onlineUsers)) {
        setOnlineUsers(evt.onlineUsers);
      }
    });
    return () => unsub();
  }, [loadState]);

  // Mark active thread messages as read (triggers disappearing timer countdown on server!)
  useEffect(() => {
    if (!activeDm && !activeGroupId) return;
    const markRead = async () => {
      try {
        const headers = await getAuthBearerHeaders();
        await fetch('/api/snapchat/messages/read', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            peerUsername: activeDm || undefined,
            groupId: activeGroupId || undefined,
          }),
        });
        loadState(true);
      } catch {}
    };
    markRead();
  }, [activeDm, activeGroupId, messages.length, loadState]);

  const handleFilePick = (
    e: React.ChangeEvent<HTMLInputElement>,
    onDone: (dataUrl: string, kind: 'image' | 'video') => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      onShowToast?.('Media must be under 2 MB.');
      triggerSound?.('alert');
      return;
    }
    const kind: 'image' | 'video' = file.type.startsWith('video/') ? 'video' : 'image';
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onDone(reader.result, kind);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSendMessage = async () => {
    if (!composerText.trim() && !mediaDataUrl) return;
    if (!activeDm && !activeGroupId) return;
    setBusyAction(true);
    try {
      const headers = await getAuthBearerHeaders();
      const resp = await fetch('/api/snapchat/messages', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          toUsername: activeDm || undefined,
          groupId: activeGroupId || undefined,
          text: composerText.trim(),
          mediaDataUrl: mediaDataUrl || undefined,
          mediaType,
          disappearSeconds: disappearSec,
        }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        onShowToast?.(data.error || 'Could not send message.');
        triggerSound?.('alert');
        return;
      }
      setComposerText('');
      setMediaDataUrl('');
      setMediaType(undefined);
      if (activeDm) realtimeClient.sendTyping(activeDm, false);
      triggerSound?.('coin');
      loadState(true);
    } catch {
      onShowToast?.('Network error sending message.');
    } finally {
      setBusyAction(false);
    }
  };

  const handleReactMessage = async (messageId: string, emoji: string) => {
    try {
      const headers = await getAuthBearerHeaders();
      await fetch('/api/snapchat/messages/react', {
        method: 'POST',
        headers,
        body: JSON.stringify({ messageId, emoji }),
      });
      loadState(true);
    } catch {}
  };

  const handleFriendRequest = async (toUsername: string) => {
    setBusyAction(true);
    try {
      const headers = await getAuthBearerHeaders();
      const resp = await fetch('/api/snapchat/friend-request', {
        method: 'POST',
        headers,
        body: JSON.stringify({ toUsername }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        onShowToast?.(data.error || 'Request failed.');
        triggerSound?.('alert');
        return;
      }
      onShowToast?.(`Friend request sent to @${toUsername}`);
      triggerSound?.('success');
      loadState(true);
    } finally {
      setBusyAction(false);
    }
  };

  const handleRespondRequest = async (requestId: string, action: 'accept' | 'decline') => {
    setBusyAction(true);
    try {
      const headers = await getAuthBearerHeaders();
      const resp = await fetch('/api/snapchat/friend-respond', {
        method: 'POST',
        headers,
        body: JSON.stringify({ requestId, action }),
      });
      const data = await resp.json();
      if (resp.ok) {
        onShowToast?.(action === 'accept' ? 'Friend added!' : 'Request declined.');
        triggerSound?.(action === 'accept' ? 'success' : 'coin');
        loadState(true);
      } else {
        onShowToast?.(data.error || 'Failed to update request.');
      }
    } finally {
      setBusyAction(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupNameInput.trim() || groupMemberChecks.length === 0) {
      onShowToast?.('Enter a group name and select at least 1 friend.');
      return;
    }
    setBusyAction(true);
    try {
      const headers = await getAuthBearerHeaders();
      const resp = await fetch('/api/snapchat/groups', {
        method: 'POST',
        headers,
        body: JSON.stringify({ name: groupNameInput.trim(), members: groupMemberChecks }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        onShowToast?.(data.error || 'Group creation failed.');
        return;
      }
      setCreatingGroup(false);
      setGroupNameInput('');
      setGroupMemberChecks([]);
      setActiveDm(null);
      setActiveGroupId(data.group.id);
      triggerSound?.('success');
      loadState(true);
    } finally {
      setBusyAction(false);
    }
  };

  const handlePostStory = async () => {
    if (!storyCaption.trim() && !storyMediaUrl) {
      onShowToast?.('Add text or a photo/video for your 24h story.');
      return;
    }
    setBusyAction(true);
    try {
      const headers = await getAuthBearerHeaders();
      const resp = await fetch('/api/snapchat/stories', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          caption: storyCaption.trim(),
          mediaDataUrl: storyMediaUrl || undefined,
          mediaType: storyMediaType,
          audience: storyAudience,
          bgTheme: storyBg,
          frameStyle: isSnapPlusActive ? storyFrame : 'default',
        }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        onShowToast?.(data.error || 'Could not post story.');
        return;
      }
      setStoryCaption('');
      setStoryMediaUrl('');
      setStoryMediaType(undefined);
      onShowToast?.('24-hour Story posted!');
      triggerSound?.('success');
      loadState(true);
    } finally {
      setBusyAction(false);
    }
  };

  const handleOpenStory = async (st: SnapStory) => {
    setViewingStory(st);
    try {
      const headers = await getAuthBearerHeaders();
      await fetch(`/api/snapchat/stories/${st.id}/view`, { method: 'POST', headers });
      loadState(true);
    } catch {}
  };

  const handleReplyStory = async () => {
    if (!viewingStory || !storyReplyInput.trim()) return;
    setBusyAction(true);
    try {
      const headers = await getAuthBearerHeaders();
      const resp = await fetch('/api/snapchat/messages', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          toUsername: viewingStory.authorUsername,
          text: `[Story Reply: "${viewingStory.caption.slice(0, 40)}"] ${storyReplyInput.trim()}`,
          replyToStoryId: viewingStory.id,
          disappearSeconds: 0,
        }),
      });
      if (resp.ok) {
        onShowToast?.(`Reply delivered to @${viewingStory.authorUsername}`);
        setStoryReplyInput('');
        triggerSound?.('coin');
        loadState(true);
      }
    } finally {
      setBusyAction(false);
    }
  };

  const handleSaveProfile = async () => {
    setBusyAction(true);
    try {
      const headers = await getAuthBearerHeaders();
      const resp = await fetch('/api/snapchat/profile', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          displayName: editDisplayName.trim(),
          bio: editBio.trim(),
          avatarEmoji: editEmoji,
          avatarUrl: editAvatarUrl,
          privacyMessages: editPrivacyMsg,
          privacyStories: editPrivacyStory,
        }),
      });
      const data = await resp.json();
      if (resp.ok) {
        setProfile(data.profile);
        onShowToast?.('Snapchat profile updated!');
        triggerSound?.('success');
        loadState(true);
      } else {
        onShowToast?.(data.error || 'Update failed.');
      }
    } finally {
      setBusyAction(false);
    }
  };

  const handleBuySnapPlus = async (planId: 'monthly' | 'yearly', currency: 'NGN' | 'CAD') => {
    const plan = SNAP_PLUS_PLANS.find((p) => p.id === planId);
    if (!plan) return;
    if (currency === 'NGN') {
      const bal = parseMinorString(userProfile?.ngnKobo, moneyNGN);
      if (bal < majorToMinor(plan.ngn)) {
        onShowToast?.(`Insufficient NGN balance. Need ${formatNaira(plan.ngn)}.`);
        triggerSound?.('alert');
        return;
      }
    } else {
      const bal = parseMinorString(userProfile?.cadCents, userProfile?.bankCAD || 0);
      if (bal < majorToMinor(plan.cad)) {
        onShowToast?.(`Insufficient CAD balance. Need ${formatCAD(plan.cad)}.`);
        triggerSound?.('alert');
        return;
      }
    }

    setBusyAction(true);
    try {
      const headers = await getAuthBearerHeaders();
      const resp = await fetch('/api/snapchat/plus/subscribe', {
        method: 'POST',
        headers,
        body: JSON.stringify({ planId, currency }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        onShowToast?.(data.error || 'Subscription failed.');
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
          isSnapPlus: true,
          snapPlusExpiresAt: data.expiresAt,
          receipts: data.account.receipts || userProfile.receipts,
        });
      }
      onShowToast?.(`Snapchat+ activated for ${planId === 'yearly' ? '365 days' : '30 days'}!`);
      triggerSound?.('success');
      loadState(true);
    } finally {
      setBusyAction(false);
    }
  };

  const handleToggleBlock = async (targetUsername: string) => {
    const headers = await getAuthBearerHeaders();
    const resp = await fetch('/api/snapchat/block', {
      method: 'POST',
      headers,
      body: JSON.stringify({ targetUsername }),
    });
    const data = await resp.json();
    if (resp.ok) {
      onShowToast?.(data.blocked ? `Blocked @${targetUsername}` : `Unblocked @${targetUsername}`);
      if (activeDm === targetUsername) setActiveDm(null);
      loadState(true);
    }
  };

  const handleSubmitReport = async () => {
    if (!reportTarget || !reportReason.trim()) return;
    const headers = await getAuthBearerHeaders();
    const resp = await fetch('/api/snapchat/report', {
      method: 'POST',
      headers,
      body: JSON.stringify({ targetUsername: reportTarget, reason: reportReason.trim() }),
    });
    if (resp.ok) {
      onShowToast?.(`Report submitted against @${reportTarget} to moderation.`);
      setReportTarget(null);
      setReportReason('');
    }
  };

  const isSnapPlusActive = Boolean(
    profile?.isSnapPlus && profile?.snapPlusExpiresAt && profile.snapPlusExpiresAt > Date.now()
  );

  const threadMessages = useMemo(() => {
    if (activeGroupId) {
      return messages.filter((m) => m.groupId === activeGroupId);
    }
    if (activeDm) {
      return messages.filter(
        (m) =>
          !m.groupId &&
          ((m.fromUsername === myUsername && m.toUsername === activeDm) ||
            (m.fromUsername === activeDm && m.toUsername === myUsername))
      );
    }
    return [];
  }, [messages, activeDm, activeGroupId, myUsername]);

  const filteredDirectory = useMemo(() => {
    const q = searchQuery.trim().toLowerCase().replace(/^@/, '');
    return directory.filter((u) => {
      if (u.username === myUsername) return false;
      if (!q) return true;
      return u.username.includes(q) || (u.displayName || '').toLowerCase().includes(q);
    });
  }, [directory, searchQuery, myUsername]);

  const isPeerTyping = activeDm && typingFrom[activeDm] && Date.now() - typingFrom[activeDm] < 5000;
  const chatBgClass = CHAT_BG_STYLES[profile?.chatBgStyle || 'obsidian'] || CHAT_BG_STYLES.obsidian;

  if (loading && !profile) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-zinc-400 gap-2">
        <RefreshCw className="w-6 h-6 animate-spin text-yellow-400" />
        <span className="text-xs font-mono">Loading Snapchat Social Network...</span>
      </div>
    );
  }

  // Active Chat / Group Thread View
  if (activeDm || activeGroupId) {
    const activeGroup = groups.find((g) => g.id === activeGroupId);
    const peerProfile = directory.find((u) => u.username === activeDm);
    const peerOnline = activeDm ? onlineUsers.includes(activeDm) : false;
    const streakCount = activeDm ? profile?.streaks?.[activeDm] || 0 : 0;

    return (
      <div className={`flex flex-col h-[525px] -mx-1 rounded-2xl border border-zinc-800 overflow-hidden ${chatBgClass}`}>
        <div className="p-3 bg-zinc-900/95 border-b border-zinc-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={() => {
                setActiveDm(null);
                setActiveGroupId(null);
              }}
              className="px-2 py-1 rounded-lg bg-zinc-800 text-zinc-200 text-xs font-bold cursor-pointer"
            >
              Back
            </button>
            <div className="min-w-0">
              <div className="text-xs font-black text-white flex items-center gap-1.5 truncate">
                <span>
                  {activeGroup ? activeGroup.name : peerProfile?.displayName || `@${activeDm}`}
                </span>
                {activeDm && peerOnline && <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />}
                {streakCount > 0 && (
                  <span className="text-[10px] text-amber-400 font-mono flex items-center gap-0.5">
                    <Flame className="w-3 h-3" /> {streakCount}
                  </span>
                )}
              </div>
              <div className="text-[10px] text-zinc-400 font-mono">
                {activeGroup
                  ? `${activeGroup.members.length} members`
                  : isPeerTyping
                  ? 'typing...'
                  : peerOnline
                  ? 'Online now'
                  : `@${activeDm}`}
              </div>
            </div>
          </div>

          {activeDm && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleToggleBlock(activeDm)}
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-rose-900/60 text-zinc-300 hover:text-rose-300 cursor-pointer"
                title="Block / Unblock User"
              >
                <Ban className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setReportTarget(activeDm)}
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-amber-900/60 text-zinc-300 hover:text-amber-300 cursor-pointer"
                title="Report User"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Messages stream */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5 scrollbar-none">
          {threadMessages.length === 0 ? (
            <div className="text-center py-12 text-xs text-zinc-500">
              No messages yet. Say hello or send a photo/video snap!
            </div>
          ) : (
            threadMessages.map((m) => {
              const isMe = m.fromUsername === myUsername;
              const isReadByPeer = activeDm
                ? (m.readBy || []).includes(activeDm)
                : (m.readBy || []).length > 1;
              return (
                <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  {!isMe && activeGroupId && (
                    <span className="text-[9px] text-amber-300 font-mono mb-0.5">@{m.fromUsername}</span>
                  )}
                  <div
                    className={`max-w-[82%] rounded-2xl p-2.5 text-xs space-y-1.5 ${
                      isMe
                        ? 'bg-emerald-600 text-white rounded-br-sm'
                        : 'bg-zinc-800 text-zinc-100 rounded-bl-sm border border-zinc-700'
                    }`}
                  >
                    {m.mediaDataUrl && m.mediaType === 'image' && (
                      <img src={m.mediaDataUrl} alt="Snap attachment" className="rounded-xl max-h-44 object-cover w-full" />
                    )}
                    {m.mediaDataUrl && m.mediaType === 'video' && (
                      <video src={m.mediaDataUrl} controls className="rounded-xl max-h-44 w-full" />
                    )}
                    {m.text && <p className="leading-relaxed break-words">{m.text}</p>}
                    <div className="flex items-center justify-between gap-2 text-[9px] opacity-80 font-mono">
                      <span className="flex items-center gap-1">
                        {m.disappearSeconds > 0 && (
                          <span className="inline-flex items-center gap-0.5 text-amber-200">
                            <Clock className="w-2.5 h-2.5" />
                            {m.disappearSeconds}s
                          </span>
                        )}
                      </span>
                      <span className="flex items-center gap-1">
                        {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {isMe && (isReadByPeer ? <CheckCheck className="w-3 h-3 text-sky-200" /> : <Check className="w-3 h-3" />)}
                      </span>
                    </div>
                  </div>
                  {/* Quick Reactions */}
                  <div className="flex items-center gap-1 mt-0.5">
                    {['🔥', '❤️', '😂'].map((em) => {
                      const count = (m.reactions?.[em] || []).length;
                      return (
                        <button
                          key={em}
                          type="button"
                          onClick={() => handleReactMessage(m.id, em)}
                          className={`px-1.5 py-0.5 rounded-full text-[9px] cursor-pointer transition-all ${
                            count > 0 ? 'bg-zinc-800 border border-amber-400/50 text-white' : 'opacity-40 hover:opacity-100 text-zinc-400'
                          }`}
                        >
                          {em} {count > 0 ? count : ''}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Media attachment preview & Disappear timer picker */}
        <div className="px-2.5 py-1.5 bg-zinc-900/90 border-t border-zinc-800 flex items-center justify-between gap-2 text-[10px]">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-400" />
            {TIMER_OPTIONS.map((opt) => (
              <button
                key={opt.sec}
                type="button"
                onClick={() => setDisappearSec(opt.sec)}
                className={`px-1.5 py-0.5 rounded-md font-bold cursor-pointer ${
                  disappearSec === opt.sec ? 'bg-amber-400 text-black' : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {mediaDataUrl && (
            <button
              type="button"
              onClick={() => {
                setMediaDataUrl('');
                setMediaType(undefined);
              }}
              className="text-rose-400 font-bold flex items-center gap-0.5 cursor-pointer"
            >
              <X className="w-3 h-3" /> Remove {mediaType}
            </button>
          )}
        </div>

        {/* Composer */}
        <div className="p-2 bg-zinc-950 border-t border-zinc-800 flex items-center gap-1.5">
          <label className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 cursor-pointer">
            <ImageIcon className="w-4 h-4" />
            <input
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={(e) =>
                handleFilePick(e, (url, kind) => {
                  setMediaDataUrl(url);
                  setMediaType(kind);
                })
              }
            />
          </label>
          <input
            type="text"
            value={composerText}
            onChange={(e) => {
              setComposerText(e.target.value);
              if (activeDm && Date.now() - typingCooldownRef.current > 2000) {
                typingCooldownRef.current = Date.now();
                realtimeClient.sendTyping(activeDm, true);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage();
            }}
            placeholder={disappearSec > 0 ? `Disappearing message (${disappearSec}s)...` : 'Send chat or snap...'}
            className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white"
          />
          <button
            type="button"
            disabled={busyAction}
            onClick={handleSendMessage}
            className="px-3 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Snapchat Top Banner */}
      <div className="p-3 rounded-2xl bg-gradient-to-r from-yellow-400/15 via-zinc-900 to-zinc-950 border border-yellow-400/40 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-[#fffc00] border-2 border-black flex items-center justify-center text-xl shadow">
            {profile?.avatarEmoji || '👻'}
          </div>
          <div>
            <div className="text-xs font-black text-white flex items-center gap-1.5">
              <span>{profile?.displayName || `@${myUsername}`}</span>
              {isSnapPlusActive && (
                <span className="px-1.5 py-0.5 rounded bg-gradient-to-r from-amber-400 to-yellow-300 text-black text-[9px] font-black">
                  SNAP+
                </span>
              )}
            </div>
            <div className="text-[10px] text-zinc-400 font-mono">
              @{myUsername} · {(profile?.friends || []).length} Friends
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setTab('plus')}
          className={`px-2.5 py-1.5 rounded-xl text-[10px] font-black cursor-pointer flex items-center gap-1 ${
            isSnapPlusActive
              ? 'bg-amber-500/20 text-amber-300 border border-amber-400/50'
              : 'bg-gradient-to-r from-yellow-400 to-amber-400 text-black'
          }`}
        >
          <Crown className="w-3.5 h-3.5" />
          <span>{isSnapPlusActive ? 'Plus Active' : 'Snapchat+'}</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="grid grid-cols-5 gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-[10px] font-bold">
        {[
          { id: 'chats', label: 'Chats' },
          { id: 'stories', label: 'Stories' },
          { id: 'friends', label: `Friends${incomingRequests.length ? ` (${incomingRequests.length})` : ''}` },
          { id: 'profile', label: 'Profile' },
          { id: 'plus', label: 'Snap+' },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id as any)}
            className={`py-1.5 rounded-lg cursor-pointer transition-all ${
              tab === t.id ? 'bg-yellow-400 text-black font-black' : 'text-zinc-400 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB 1: CHATS & GROUPS */}
      {tab === 'chats' && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold">Direct &amp; Group Conversations</span>
            <button
              type="button"
              onClick={() => setCreatingGroup((v) => !v)}
              className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-700 text-emerald-300 text-[10px] font-bold cursor-pointer flex items-center gap-1"
            >
              <Users className="w-3 h-3" />
              <span>New Group</span>
            </button>
          </div>

          {creatingGroup && (
            <div className="p-3 rounded-2xl bg-zinc-950 border border-emerald-500/40 space-y-2">
              <input
                type="text"
                value={groupNameInput}
                onChange={(e) => setGroupNameInput(e.target.value)}
                placeholder="Group Chat Name..."
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-white"
              />
              <div className="flex flex-wrap gap-1.5">
                {(profile?.friends || []).map((fr) => {
                  const selected = groupMemberChecks.includes(fr);
                  return (
                    <button
                      key={fr}
                      type="button"
                      onClick={() =>
                        setGroupMemberChecks((prev) =>
                          prev.includes(fr) ? prev.filter((x) => x !== fr) : [...prev, fr]
                        )
                      }
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer border ${
                        selected ? 'bg-emerald-500 text-black border-emerald-400' : 'bg-zinc-900 text-zinc-300 border-zinc-700'
                      }`}
                    >
                      @{fr}
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={handleCreateGroup}
                className="w-full py-2 rounded-xl bg-emerald-500 text-black font-black text-xs cursor-pointer"
              >
                Create Group Chat
              </button>
            </div>
          )}

          {/* Group Chats */}
          {groups.map((g) => (
            <div
              key={g.id}
              onClick={() => {
                setActiveDm(null);
                setActiveGroupId(g.id);
              }}
              className="p-3 rounded-2xl bg-zinc-950/90 border border-zinc-800 hover:border-yellow-400/50 flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center">
                  <Users className="w-4 h-4 text-indigo-300" />
                </div>
                <div>
                  <div className="text-xs font-black text-white">{g.name}</div>
                  <div className="text-[10px] text-zinc-400 font-mono">{g.members.length} members</div>
                </div>
              </div>
              <MessageSquare className="w-4 h-4 text-yellow-400" />
            </div>
          ))}

          {/* Friends & Recent DMs */}
          {directory
            .filter((u) => u.username !== myUsername && !(profile?.blockedUsers || []).includes(u.username))
            .filter((u) => (profile?.friends || []).includes(u.username) || messages.some((m) => m.fromUsername === u.username || m.toUsername === u.username))
            .map((u) => {
              const unread = messages.filter(
                (m) => m.fromUsername === u.username && m.toUsername === myUsername && !(m.readBy || []).includes(myUsername)
              ).length;
              const lastMsg = [...messages]
                .reverse()
                .find(
                  (m) =>
                    !m.groupId &&
                    ((m.fromUsername === u.username && m.toUsername === myUsername) ||
                      (m.fromUsername === myUsername && m.toUsername === u.username))
                );
              const isOnline = onlineUsers.includes(u.username);
              return (
                <div
                  key={u.username}
                  onClick={() => {
                    setActiveGroupId(null);
                    setActiveDm(u.username);
                  }}
                  className="p-3 rounded-2xl bg-zinc-950/90 border border-zinc-800 hover:border-yellow-400/50 flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-lg shrink-0">
                      {u.avatarEmoji || '😎'}
                      {isOnline && (
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-zinc-950 absolute bottom-0 right-0" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-black text-white flex items-center gap-1.5">
                        <span className="truncate">{u.displayName || u.username}</span>
                        {u.isSnapPlus && <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />}
                        {(profile?.streaks?.[u.username] || 0) > 0 && (
                          <span className="text-[10px] text-amber-400 font-mono">
                            🔥{profile?.streaks?.[u.username]}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-zinc-400 truncate">
                        {lastMsg ? (lastMsg.mediaType ? `📷 Sent a ${lastMsg.mediaType}` : lastMsg.text) : `@${u.username} · Tap to chat`}
                      </div>
                    </div>
                  </div>
                  {unread > 0 ? (
                    <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black">{unread}</span>
                  ) : (
                    <Camera className="w-4 h-4 text-zinc-500" />
                  )}
                </div>
              );
            })}
        </div>
      )}

      {/* TAB 2: 24H STORIES */}
      {tab === 'stories' && (
        <div className="space-y-3">
          <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-yellow-300">Post 24-Hour Story</span>
              <select
                value={storyAudience}
                onChange={(e) => setStoryAudience(e.target.value as 'friends' | 'public')}
                className="bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1 text-[10px] text-white"
              >
                <option value="friends">Friends Only</option>
                <option value="public">Public Story</option>
              </select>
            </div>
            <input
              type="text"
              value={storyCaption}
              onChange={(e) => setStoryCaption(e.target.value)}
              placeholder="Share what's happening in Lagos or Toronto..."
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white"
            />
            <div className="flex items-center justify-between gap-2">
              <label className="px-2.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700 text-[10px] font-bold text-zinc-300 cursor-pointer flex items-center gap-1">
                <Film className="w-3.5 h-3.5 text-yellow-400" />
                <span>{storyMediaUrl ? `Attached (${storyMediaType})` : 'Photo / Video'}</span>
                <input
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={(e) =>
                    handleFilePick(e, (url, kind) => {
                      setStoryMediaUrl(url);
                      setStoryMediaType(kind);
                    })
                  }
                />
              </label>
              {isSnapPlusActive && (
                <select
                  value={storyFrame}
                  onChange={(e) => setStoryFrame(e.target.value)}
                  className="bg-zinc-900 border border-amber-500/40 rounded-lg px-2 py-1 text-[10px] text-amber-300"
                >
                  <option value="default">Standard Frame</option>
                  <option value="gold_crown">Plus Gold Frame</option>
                  <option value="emerald_glow">Plus Emerald Frame</option>
                </select>
              )}
              <button
                type="button"
                disabled={busyAction}
                onClick={handlePostStory}
                className="px-3.5 py-1.5 rounded-xl bg-yellow-400 text-black font-black text-xs cursor-pointer"
              >
                Post Story
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {stories.length === 0 ? (
              <div className="p-6 text-center text-xs text-zinc-500 rounded-2xl bg-zinc-950 border border-zinc-800">
                No active stories right now. Post the first 24h story!
              </div>
            ) : (
              stories.map((st) => (
                <div
                  key={st.id}
                  onClick={() => handleOpenStory(st)}
                  className={`p-3 rounded-2xl bg-zinc-950 border cursor-pointer transition-all flex items-center justify-between ${
                    st.frameStyle === 'gold_crown'
                      ? 'border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.2)]'
                      : st.frameStyle === 'emerald_glow'
                      ? 'border-emerald-400'
                      : 'border-zinc-800 hover:border-yellow-400/50'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="text-xs font-black text-white flex items-center gap-1.5">
                      <span>{st.authorDisplayName}</span>
                      <span className="text-[9px] text-zinc-400 font-mono uppercase px-1.5 py-0.5 rounded bg-zinc-900">
                        {st.audience}
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-300 truncate mt-0.5">
                      {st.caption || `(${st.mediaType} story)`}
                    </div>
                  </div>
                  <div className="text-right shrink-0 text-[10px] text-zinc-400 font-mono flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-yellow-400" />
                    <span>{st.viewers.length}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: FRIENDS & DIRECTORY */}
      {tab === 'friends' && (
        <div className="space-y-3">
          {incomingRequests.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono uppercase text-amber-300 font-bold">Pending Friend Requests</span>
              {incomingRequests.map((req) => (
                <div key={req.id} className="p-2.5 rounded-xl bg-zinc-950 border border-amber-500/40 flex items-center justify-between">
                  <span className="text-xs font-bold text-white">@{req.fromUsername}</span>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleRespondRequest(req.id, 'accept')}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500 text-black font-black text-[10px] cursor-pointer"
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRespondRequest(req.id, 'decline')}
                      className="px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-300 font-bold text-[10px] cursor-pointer"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search citizens by @username or display name..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white"
            />
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto scrollbar-none">
            {filteredDirectory.map((u) => {
              const isFriend = (profile?.friends || []).includes(u.username);
              const isBlocked = (profile?.blockedUsers || []).includes(u.username);
              const hasOutgoing = outgoingRequests.some((r) => r.toUsername === u.username);
              return (
                <div key={u.username} className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-lg">{u.avatarEmoji || '😎'}</span>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate">{u.displayName}</div>
                      <div className="text-[10px] text-zinc-400 font-mono">@{u.username}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {isFriend ? (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveDm(u.username);
                          setTab('chats');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold cursor-pointer"
                      >
                        Message
                      </button>
                    ) : hasOutgoing ? (
                      <span className="px-2 py-1 rounded-lg bg-zinc-900 text-zinc-400 text-[10px]">Requested</span>
                    ) : !isBlocked ? (
                      <button
                        type="button"
                        onClick={() => handleFriendRequest(u.username)}
                        className="px-2.5 py-1 rounded-lg bg-yellow-400 text-black font-black text-[10px] cursor-pointer flex items-center gap-1"
                      >
                        <UserPlus className="w-3 h-3" /> Add
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => handleToggleBlock(u.username)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer ${
                        isBlocked ? 'bg-rose-600 text-white' : 'bg-zinc-900 text-zinc-400'
                      }`}
                    >
                      {isBlocked ? 'Unblock' : 'Block'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: PROFILE & PRIVACY */}
      {tab === 'profile' && (
        <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
          <h4 className="text-xs font-black text-white">Snapchat Profile &amp; Privacy Settings</h4>
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-zinc-400 uppercase">Display Name</label>
            <input
              type="text"
              value={editDisplayName}
              onChange={(e) => setEditDisplayName(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-white"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-zinc-400 uppercase">Bio</label>
            <input
              type="text"
              value={editBio}
              onChange={(e) => setEditBio(e.target.value)}
              placeholder="Write your bio..."
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-white"
            />
          </div>
          <div className="flex items-center gap-2">
            {['😎', '🦁', '👑', '🚀', '💎', '🦋'].map((em) => (
              <button
                key={em}
                type="button"
                onClick={() => setEditEmoji(em)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer border ${
                  editEmoji === em ? 'bg-yellow-400/20 border-yellow-400' : 'bg-zinc-900 border-zinc-700'
                }`}
              >
                {em}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div>
              <label className="text-zinc-400 block mb-1">Who can message me</label>
              <select
                value={editPrivacyMsg}
                onChange={(e) => setEditPrivacyMsg(e.target.value as 'friends' | 'everyone')}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1.5 text-white"
              >
                <option value="friends">Friends Only</option>
                <option value="everyone">Everyone</option>
              </select>
            </div>
            <div>
              <label className="text-zinc-400 block mb-1">Story Visibility</label>
              <select
                value={editPrivacyStory}
                onChange={(e) => setEditPrivacyStory(e.target.value as 'friends' | 'public')}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1.5 text-white"
              >
                <option value="friends">Friends Only</option>
                <option value="public">Public</option>
              </select>
            </div>
          </div>
          <button
            type="button"
            disabled={busyAction}
            onClick={handleSaveProfile}
            className="w-full py-2.5 rounded-xl bg-yellow-400 text-black font-black text-xs cursor-pointer"
          >
            Save Profile &amp; Privacy
          </button>
        </div>
      )}

      {/* TAB 5: PAID SNAPCHAT+ SUBSCRIPTION */}
      {tab === 'plus' && (
        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/20 via-zinc-950 to-black border border-amber-400/50 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-400" />
                <h4 className="text-sm font-black text-amber-200">Snapchat Plus Membership</h4>
              </div>
              {isSnapPlusActive && profile?.snapPlusExpiresAt && (
                <span className="text-[10px] font-mono text-emerald-300">
                  Expires {new Date(profile.snapPlusExpiresAt).toLocaleDateString()}
                </span>
              )}
            </div>
            <p className="text-[11px] text-zinc-300 leading-relaxed">
              Unlock exclusive chat backgrounds, Plus story frames, golden Plus badge, and custom app icons using your NGN or CAD balance. No silent auto-renewals.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1">
              {Object.keys(CHAT_BG_STYLES).map((bgKey) => (
                <button
                  key={bgKey}
                  type="button"
                  disabled={!isSnapPlusActive}
                  onClick={async () => {
                    const headers = await getAuthBearerHeaders();
                    await fetch('/api/snapchat/profile', {
                      method: 'POST',
                      headers,
                      body: JSON.stringify({ chatBgStyle: bgKey }),
                    });
                    onShowToast?.(`Applied ${bgKey} chat theme!`);
                    loadState(true);
                  }}
                  className={`p-2 rounded-xl border text-[10px] font-bold flex items-center gap-1.5 cursor-pointer ${
                    profile?.chatBgStyle === bgKey
                      ? 'border-amber-400 bg-amber-500/20 text-amber-200'
                      : 'border-zinc-800 bg-zinc-900 text-zinc-400'
                  } ${!isSnapPlusActive ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Palette className="w-3.5 h-3.5" />
                  <span className="capitalize">{bgKey.replace('_', ' ')}</span>
                </button>
              ))}
            </div>
          </div>

          {SNAP_PLUS_PLANS.map((plan) => (
            <div key={plan.id} className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-2">
              <div>
                <div className="text-xs font-black text-white">{plan.label}</div>
                <div className="text-[10px] text-amber-300 font-mono">
                  {formatNaira(plan.ngn)} · {formatCAD(plan.cad)}
                </div>
              </div>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  disabled={busyAction}
                  onClick={() => handleBuySnapPlus(plan.id as 'monthly' | 'yearly', isCanada ? 'CAD' : 'NGN')}
                  className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-black text-[10px] cursor-pointer"
                >
                  {isSnapPlusActive ? 'Extend' : 'Subscribe'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* STORY VIEWER MODAL */}
      {viewingStory && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-4 max-w-md mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-black text-white">{viewingStory.authorDisplayName}</div>
              <div className="text-[10px] text-zinc-400 font-mono">
                @{viewingStory.authorUsername} · {viewingStory.viewers.length} views
              </div>
            </div>
            <button
              type="button"
              onClick={() => setViewingStory(null)}
              className="p-2 rounded-full bg-zinc-900 text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className={`my-4 flex-1 rounded-3xl bg-gradient-to-br ${viewingStory.bgTheme || 'from-amber-600 to-rose-700'} p-5 flex flex-col items-center justify-center text-center gap-3 overflow-hidden`}>
            {viewingStory.mediaDataUrl && viewingStory.mediaType === 'image' && (
              <img src={viewingStory.mediaDataUrl} alt="Story" className="max-h-72 rounded-2xl object-contain" />
            )}
            {viewingStory.mediaDataUrl && viewingStory.mediaType === 'video' && (
              <video src={viewingStory.mediaDataUrl} controls autoPlay className="max-h-72 rounded-2xl" />
            )}
            {viewingStory.caption && (
              <p className="text-base font-black text-white drop-shadow-md">{viewingStory.caption}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex justify-center gap-2">
              {['🔥', '❤️', '😂', '👏'].map((em) => (
                <button
                  key={em}
                  type="button"
                  onClick={async () => {
                    const headers = await getAuthBearerHeaders();
                    await fetch(`/api/snapchat/stories/${viewingStory.id}/react`, {
                      method: 'POST',
                      headers,
                      body: JSON.stringify({ emoji: em }),
                    });
                    onShowToast?.(`Reacted ${em} to story!`);
                  }}
                  className="px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-700 text-sm cursor-pointer"
                >
                  {em}
                </button>
              ))}
            </div>
            {viewingStory.authorUsername !== myUsername && (
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={storyReplyInput}
                  onChange={(e) => setStoryReplyInput(e.target.value)}
                  placeholder={`Reply to @${viewingStory.authorUsername}'s story...`}
                  className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white"
                />
                <button
                  type="button"
                  onClick={handleReplyStory}
                  className="px-3 py-2 rounded-xl bg-yellow-400 text-black font-black text-xs cursor-pointer"
                >
                  Reply
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* REPORT USER MODAL */}
      {reportTarget && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <div className="w-full max-w-xs bg-zinc-950 border border-rose-500/40 rounded-2xl p-4 space-y-3">
            <h4 className="text-xs font-black text-rose-300">Report @{reportTarget}</h4>
            <textarea
              rows={3}
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Describe why you are reporting this user..."
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-2 text-xs text-white"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setReportTarget(null)}
                className="flex-1 py-2 rounded-xl bg-zinc-900 text-zinc-400 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitReport}
                className="flex-1 py-2 rounded-xl bg-rose-600 text-white text-xs font-black cursor-pointer"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
