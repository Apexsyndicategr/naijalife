/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Camera,
  MessageSquare,
  MapPin,
  Flame,
  Send,
  Sparkles,
  Search,
  Plus,
  Smile,
  RotateCcw,
  Volume2,
  Check,
  Eye,
  Heart,
  Share2,
  Star,
  UserPlus,
  Users,
  Lock,
  ChevronRight,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { UserProfile, CharacterAvatar } from '../types/game';
import { CharacterRenderer } from './CharacterRenderer';
import { getStoredUsers } from './AuthPortal';
import { formatNaira } from '../utils/formatNaira';

const DEFAULT_AVATAR: CharacterAvatar = {
  gender: 'unisex',
  skinTone: '#8d5524',
  hairstyle: 'fade',
  hairColor: '#000000',
  outfit: 'casual',
  accessory: 'sunglasses',
};

export interface RealSnapUser {
  username: string;
  firstName: string;
  lastName: string;
  location: string;
  avatar: CharacterAvatar;
  isSnapPlus?: boolean;
}

export interface SnapMessageRecord {
  id: string;
  fromUser: string;
  toUser: string;
  text: string;
  time: string;
  timestamp: number;
  streak: number;
  isOpened: boolean;
  filterUsed?: string;
}

export interface SnapchatAppProps {
  userProfile?: UserProfile;
  moneyNGN?: number;
  onUpdateMoney?: (deltaNGN: number, deltaUSD?: number) => void;
  onClose?: () => void;
  triggerSound?: (type: 'coin' | 'stamp' | 'alert' | 'success') => void;
  onShowToast?: (msg: string) => void;
}

export const SnapchatApp: React.FC<SnapchatAppProps> = ({
  userProfile,
  moneyNGN = 0,
  onUpdateMoney,
  onClose,
  triggerSound,
  onShowToast,
}) => {
  const isOwner = userProfile?.username?.toLowerCase() === 'chiboy_52';
  const defaultSnapHandle = userProfile?.snapUsername || userProfile?.username || 'citizen';

  // --- Snapchat Authentication State (in-app dedicated account) ---
  const [snapUser, setSnapUser] = useState<{
    handle: string;
    isLoggedIn: boolean;
    isSnapPlus: boolean;
    streakCount: number;
  }>(() => {
    try {
      const saved = localStorage.getItem('naija_life_snap_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          handle: parsed.handle || defaultSnapHandle,
          isLoggedIn: true,
          isSnapPlus: !!parsed.isSnapPlus || isOwner,
          streakCount: parsed.streakCount || (isOwner ? 100 : 1),
        };
      }
    } catch {}
    return {
      handle: defaultSnapHandle,
      isLoggedIn: true, // Auto-logged in with citizen account for instant play
      isSnapPlus: isOwner,
      streakCount: isOwner ? 100 : 3,
    };
  });

  // Auth screen state (if user chooses to switch account or sign up fresh)
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'active'>('active');
  const [customHandleInput, setCustomHandleInput] = useState<string>('');
  const [customPasswordInput, setCustomPasswordInput] = useState<string>('');

  // Active view tab
  const [activeTab, setActiveTab] = useState<'chats' | 'camera' | 'stories' | 'map'>('chats');

  // Real Registered Players Directory
  const [realCitizens, setRealCitizens] = useState<RealSnapUser[]>([]);
  const [searchCitizenQuery, setSearchCitizenQuery] = useState<string>('');
  const [friendsList, setFriendsList] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`snap_friends_${snapUser.handle}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Selected chat with real friend
  const [activeChatUser, setActiveChatUser] = useState<RealSnapUser | null>(null);
  const [chatSubTab, setChatSubTab] = useState<'all' | 'friends' | 'requests'>('all');
  const [receivedRequests, setReceivedRequests] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`snap_reqs_${snapUser.handle}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [chatInputText, setChatInputText] = useState<string>('');
  const [messages, setMessages] = useState<SnapMessageRecord[]>(() => {
    try {
      const saved = localStorage.getItem(`snap_messages_${snapUser.handle}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Camera lens & Stories
  const [selectedLens, setSelectedLens] = useState<string>('lagos_shades');
  const [snapCaptionInput, setSnapCaptionInput] = useState<string>('');
  const [snapPlusModalOpen, setSnapPlusModalOpen] = useState<boolean>(false);
  const [activeViewingStory, setActiveViewingStory] = useState<{
    id: string;
    user: string;
    text: string;
    time: string;
    filter: string;
  } | null>(null);

  // Load real registered citizens from DB / server / localStorage (NO FAKE SEEDS!)
  useEffect(() => {
    const loadRealUsers = async () => {
      try {
        const res = await fetch('/api/snapchat/users');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.users) && data.users.length > 0) {
            setRealCitizens(data.users);
            return;
          }
        }
      } catch {}

      // Fallback to local stored citizens
      const localUsers = getStoredUsers();
      const list: RealSnapUser[] = Object.values(localUsers).map((u) => ({
        username: u.profile.username,
        firstName: u.profile.firstName,
        lastName: u.profile.lastName,
        location: u.profile.lastLocationStateId === 'canada' ? 'Toronto, Canada' : `${u.profile.spawnStateId || 'Lagos'}, Nigeria`,
        avatar: u.profile.avatar || DEFAULT_AVATAR,
        isSnapPlus: u.profile.username.toLowerCase() === 'chiboy_52',
      }));
      setRealCitizens(list);
    };

    loadRealUsers();
  }, []);

  // Save session when modified
  const updateSnapSession = (updates: Partial<typeof snapUser>) => {
    setSnapUser((prev) => {
      const next = { ...prev, ...updates };
      try {
        localStorage.setItem('naija_life_snap_session', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Add / Remove friend (real player only)
  const handleToggleFriend = (targetUsername: string) => {
    setFriendsList((prev) => {
      const isAlreadyFriend = prev.includes(targetUsername);
      const next = isAlreadyFriend
        ? prev.filter((u) => u !== targetUsername)
        : [...prev, targetUsername];
      try {
        localStorage.setItem(`snap_friends_${snapUser.handle}`, JSON.stringify(next));
      } catch {}

      // If adding, register a friend request in the target's inbox
      if (!isAlreadyFriend) {
        try {
          const targetKey = `snap_reqs_${targetUsername.toLowerCase()}`;
          const existing = JSON.parse(localStorage.getItem(targetKey) || '[]');
          if (!existing.includes(snapUser.handle)) {
            localStorage.setItem(targetKey, JSON.stringify([...existing, snapUser.handle]));
          }
        } catch {}
      }

      return next;
    });
    triggerSound?.('coin');
    onShowToast?.(`Updated friend status for @${targetUsername}`);
  };

  const handleAcceptRequest = (requesterUsername: string) => {
    setFriendsList((prev) => {
      const next = prev.includes(requesterUsername) ? prev : [...prev, requesterUsername];
      try {
        localStorage.setItem(`snap_friends_${snapUser.handle}`, JSON.stringify(next));
      } catch {}
      return next;
    });
    setReceivedRequests((prev) => {
      const next = prev.filter((u) => u !== requesterUsername);
      try {
        localStorage.setItem(`snap_reqs_${snapUser.handle}`, JSON.stringify(next));
      } catch {}
      return next;
    });
    triggerSound?.('success');
    onShowToast?.(`🎉 Accepted friend request from @${requesterUsername}! Added to friends.`);
  };

  const handleDeclineRequest = (requesterUsername: string) => {
    setReceivedRequests((prev) => {
      const next = prev.filter((u) => u !== requesterUsername);
      try {
        localStorage.setItem(`snap_reqs_${snapUser.handle}`, JSON.stringify(next));
      } catch {}
      return next;
    });
    onShowToast?.(`Declined request from @${requesterUsername}`);
  };

  // Send Snap or Chat to Real Friend
  const handleSendChat = (recipientUsername: string, customText?: string) => {
    const textToSend = (customText || chatInputText).trim();
    if (!textToSend) return;

    const newMsg: SnapMessageRecord = {
      id: `msg_${Date.now()}`,
      fromUser: snapUser.handle,
      toUser: recipientUsername,
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
      streak: snapUser.streakCount + 1,
      isOpened: false,
    };

    const nextMessages = [...messages, newMsg];
    setMessages(nextMessages);
    try {
      localStorage.setItem(`snap_messages_${snapUser.handle}`, JSON.stringify(nextMessages));
    } catch {}

    // Send to backend endpoint for real synchronization across servers
    fetch('/api/snapchat/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fromUsername: snapUser.handle,
        toUsername: recipientUsername,
        text: textToSend,
      }),
    }).catch(() => {});

    // Increment streak
    updateSnapSession({ streakCount: snapUser.streakCount + 1 });
    setChatInputText('');
    triggerSound?.('coin');
    onShowToast?.(`🔥 Snap delivered to @${recipientUsername}! Daily streak active!`);
  };

  // Purchase Snapchat+ (Snap Plus ⭐️)
  const handleBuySnapPlus = () => {
    const cost = 3500;
    if (moneyNGN < cost && !isOwner) {
      onShowToast?.(`Insufficient funds! Snapchat+ requires ${formatNaira(cost)}/mo.`);
      triggerSound?.('alert');
      return;
    }

    if (onUpdateMoney && !isOwner) {
      onUpdateMoney(-cost);
    }

    updateSnapSession({ isSnapPlus: true });
    setSnapPlusModalOpen(false);
    triggerSound?.('success');
    onShowToast?.('⭐️ Welcome to Snapchat+! Gold Star Bitmoji badge & exclusive perks unlocked!');
  };

  // Filtered real citizens: STRICTLY EXCLUDE own account!
  const myHandle = (userProfile?.username || snapUser.handle || '').toLowerCase().trim();
  const filteredRealPlayers = realCitizens.filter((c) => {
    // NEVER show user's own account on own snap!
    if (c.username.toLowerCase().trim() === myHandle) return false;

    // Filter by subtab
    if (chatSubTab === 'friends' && !friendsList.includes(c.username)) return false;

    const q = searchCitizenQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      c.username.toLowerCase().includes(q) ||
      c.firstName.toLowerCase().includes(q) ||
      c.lastName.toLowerCase().includes(q) ||
      c.location.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex flex-col h-full w-full bg-zinc-950 text-white select-none relative overflow-hidden font-sans">
      {/* =========================================================================
          TOP BANNER: SNAPCHAT YELLOW BAR WITH BITMOJI AVATAR & SNAP PLUS
          ========================================================================= */}
      <div className="bg-[#fffc00] text-black px-4 py-2.5 flex items-center justify-between shadow-md shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-black/90 p-0.5 border border-black flex items-center justify-center overflow-hidden">
            <CharacterRenderer avatar={userProfile?.avatar || DEFAULT_AVATAR} size="sm" showBackground={false} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-xs tracking-tight">
                {userProfile?.firstName || 'Naija'} {userProfile?.lastName || 'Citizen'}
              </span>
              {snapUser.isSnapPlus && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-black text-[9px] font-black flex items-center gap-0.5 shadow-sm border border-black/20" title="Snapchat+ Member">
                  <Star className="w-2.5 h-2.5 fill-black" />
                  <span>PLUS</span>
                </span>
              )}
            </div>
            <div className="text-[10px] font-mono text-zinc-800 flex items-center gap-2">
              <span className="font-bold">@{snapUser.handle}</span>
              <span className="flex items-center gap-0.5 text-orange-600 font-black">
                <Flame className="w-3 h-3 fill-orange-500" />
                {snapUser.streakCount}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Snap+ Button */}
          {!snapUser.isSnapPlus && (
            <button
              type="button"
              onClick={() => setSnapPlusModalOpen(true)}
              className="px-2 py-1 rounded-xl bg-black text-[#fffc00] text-[10px] font-black flex items-center gap-1 shadow cursor-pointer hover:scale-105 transition-all"
            >
              <Star className="w-3 h-3 fill-current" />
              <span>Snap+</span>
            </button>
          )}

          {/* Close Snapchat */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-black/10 hover:bg-black/20 text-black flex items-center justify-center transition-colors cursor-pointer"
              title="Close Snapchat"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          )}
        </div>
      </div>

      {/* =========================================================================
          ACTIVE TAB NAVIGATION (CHATS, CAMERA, STORIES, SNAP MAP)
          ========================================================================= */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-3 py-1 flex justify-around text-xs font-bold text-zinc-400 shrink-0">
        <button
          type="button"
          onClick={() => { setActiveTab('chats'); setActiveChatUser(null); }}
          className={`py-1.5 px-3 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'chats' ? 'bg-[#fffc00] text-black font-black shadow-md' : 'hover:text-white'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Real Chats</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('camera')}
          className={`py-1.5 px-3 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'camera' ? 'bg-[#fffc00] text-black font-black shadow-md' : 'hover:text-white'
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          <span>Camera</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('stories')}
          className={`py-1.5 px-3 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'stories' ? 'bg-[#fffc00] text-black font-black shadow-md' : 'hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Stories</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('map')}
          className={`py-1.5 px-3 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'map' ? 'bg-[#fffc00] text-black font-black shadow-md' : 'hover:text-white'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>Snap Map</span>
        </button>
      </div>

      {/* =========================================================================
          MAIN BODY
          ========================================================================= */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* TAB 1: REAL CHATS & DIRECTORY */}
        {activeTab === 'chats' && !activeChatUser && (
          <div className="space-y-3">
            {/* Search Real Players */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchCitizenQuery}
                onChange={(e) => setSearchCitizenQuery(e.target.value)}
                placeholder="Search real registered citizens..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#fffc00]"
              />
            </div>

            {/* Sub-Tabs: All Citizens | Friends | Received Requests */}
            <div className="grid grid-cols-3 p-1 bg-zinc-900 border border-zinc-800 rounded-2xl text-[10px] font-bold">
              <button
                type="button"
                onClick={() => setChatSubTab('all')}
                className={`py-1.5 rounded-xl cursor-pointer transition-all ${
                  chatSubTab === 'all' ? 'bg-[#fffc00] text-black font-black' : 'text-zinc-400 hover:text-white'
                }`}
              >
                All Players ({realCitizens.filter(c => c.username.toLowerCase() !== myHandle).length})
              </button>
              <button
                type="button"
                onClick={() => setChatSubTab('friends')}
                className={`py-1.5 rounded-xl cursor-pointer transition-all ${
                  chatSubTab === 'friends' ? 'bg-[#fffc00] text-black font-black' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Friends ({friendsList.length})
              </button>
              <button
                type="button"
                onClick={() => setChatSubTab('requests')}
                className={`py-1.5 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1 ${
                  chatSubTab === 'requests'
                    ? 'bg-[#fffc00] text-black font-black'
                    : receivedRequests.length > 0
                    ? 'text-[#fffc00] font-black'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <span>Requests</span>
                {receivedRequests.length > 0 && (
                  <span className="w-4 h-4 rounded-full bg-red-600 text-white text-[8px] flex items-center justify-center font-bold">
                    {receivedRequests.length}
                  </span>
                )}
              </button>
            </div>

            {/* TAB CONTENT: RECEIVED REQUESTS */}
            {chatSubTab === 'requests' ? (
              <div className="space-y-2">
                {receivedRequests.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-center text-xs text-zinc-500 space-y-1">
                    <p className="font-bold text-zinc-400">No Pending Friend Requests</p>
                    <p className="text-[10px]">When other real players add your Snapchat handle, requests appear here!</p>
                  </div>
                ) : (
                  receivedRequests.map((reqUname) => {
                    const reqCitizen = realCitizens.find((c) => c.username.toLowerCase() === reqUname.toLowerCase());
                    return (
                      <div
                        key={reqUname}
                        className="p-3 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center overflow-hidden">
                            <CharacterRenderer avatar={reqCitizen?.avatar || DEFAULT_AVATAR} size="sm" showBackground={false} />
                          </div>
                          <div>
                            <div className="text-xs font-black text-white">
                              {reqCitizen ? `${reqCitizen.firstName} ${reqCitizen.lastName}` : `@${reqUname}`}
                            </div>
                            <div className="text-[10px] text-zinc-400 font-mono">@{reqUname} wants to be friends</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleAcceptRequest(reqUname)}
                            className="px-2.5 py-1 rounded-xl bg-[#fffc00] text-black font-black text-[10px] cursor-pointer hover:scale-105 transition-all shadow"
                          >
                            Accept
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeclineRequest(reqUname)}
                            className="px-2 py-1 rounded-xl bg-zinc-800 text-zinc-400 hover:text-rose-400 text-[10px] font-bold cursor-pointer transition-all"
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            ) : (
              /* REAL CITIZENS LIST (ALL / FRIENDS) */
              filteredRealPlayers.length === 0 ? (
                <div className="text-center py-8 text-zinc-500 text-xs">
                  {chatSubTab === 'friends'
                    ? "You haven't added any real friends yet. Click '+ Add' on any citizen below!"
                    : `No real citizens found matching "${searchCitizenQuery}".`}
                </div>
              ) : (
              <div className="space-y-1.5">
                {filteredRealPlayers.map((player) => {
                  const isFriend = friendsList.includes(player.username);
                  const isCurrent = player.username.toLowerCase() === userProfile?.username?.toLowerCase();
                  const threadMessages = messages.filter(
                    (m) =>
                      (m.fromUser === snapUser.handle && m.toUser === player.username) ||
                      (m.fromUser === player.username && m.toUser === snapUser.handle)
                  );
                  const lastMsg = threadMessages[threadMessages.length - 1];

                  return (
                    <div
                      key={player.username}
                      className="p-2.5 rounded-2xl bg-zinc-900/90 border border-zinc-800/80 hover:border-zinc-700 flex items-center justify-between transition-all"
                    >
                      <button
                        type="button"
                        onClick={() => setActiveChatUser(player)}
                        className="flex items-center gap-2.5 text-left flex-1 min-w-0 cursor-pointer"
                      >
                        <div className="relative w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0 overflow-hidden">
                          <CharacterRenderer avatar={player.avatar} size="sm" showBackground={false} />
                          {player.isSnapPlus && (
                            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#fffc00] text-black flex items-center justify-center text-[7px] font-black">
                              ★
                            </span>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black text-white truncate">
                              {player.firstName} {player.lastName}
                            </span>
                            {player.username.toLowerCase() === 'chiboy_52' && (
                              <span className="text-[9px] px-1 py-0.2 rounded bg-amber-400 text-black font-black">
                                OWNER
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-zinc-400 font-mono truncate">
                            {lastMsg ? lastMsg.text : `📍 ${player.location}`}
                          </div>
                        </div>
                      </button>

                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        {!isCurrent && (
                          <button
                            type="button"
                            onClick={() => handleToggleFriend(player.username)}
                            className={`px-2.5 py-1 rounded-xl text-[10px] font-bold cursor-pointer transition-all ${
                              isFriend
                                ? 'bg-zinc-800 text-zinc-300 hover:bg-rose-950 hover:text-rose-300'
                                : 'bg-[#fffc00] text-black font-black hover:scale-105'
                            }`}
                          >
                            {isFriend ? 'Friends' : '+ Add'}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setActiveChatUser(player)}
                          className="w-7 h-7 rounded-xl bg-zinc-800 text-zinc-300 hover:text-[#fffc00] flex items-center justify-center cursor-pointer"
                          title="Open Chat"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {/* ACTIVE CHAT THREAD WITH REAL FRIEND */}
        {activeTab === 'chats' && activeChatUser && (
          <div className="space-y-3 flex flex-col h-full">
            {/* Chat Header */}
            <div className="p-2.5 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => setActiveChatUser(null)}
                className="text-xs text-[#fffc00] font-black cursor-pointer flex items-center gap-1"
              >
                ← Back
              </button>
              <div className="text-center">
                <div className="text-xs font-black text-white">
                  {activeChatUser.firstName} {activeChatUser.lastName}
                </div>
                <div className="text-[9px] font-mono text-zinc-400">@{activeChatUser.username} · {activeChatUser.location}</div>
              </div>
              <div className="flex items-center gap-1 text-orange-400 font-mono text-xs font-black">
                <Flame className="w-3.5 h-3.5 fill-current" />
                <span>{snapUser.streakCount}</span>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 min-h-[220px] bg-zinc-950/80 border border-zinc-900 rounded-2xl p-3 space-y-2 overflow-y-auto">
              {messages
                .filter(
                  (m) =>
                    (m.fromUser === snapUser.handle && m.toUser === activeChatUser.username) ||
                    (m.fromUser === activeChatUser.username && m.toUser === snapUser.handle)
                )
                .map((msg) => {
                  const isMe = msg.fromUser === snapUser.handle;
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`p-2.5 rounded-2xl text-xs max-w-[80%] space-y-1 ${
                          isMe
                            ? 'bg-[#fffc00] text-black font-semibold rounded-br-none'
                            : 'bg-zinc-800 text-white rounded-bl-none'
                        }`}
                      >
                        <p>{msg.text}</p>
                        <div className="text-[8px] font-mono opacity-60 text-right">
                          {msg.time}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Send Snap Quick Actions */}
            <div className="grid grid-cols-2 gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => handleSendChat(activeChatUser.username, '📸 Sent you a red snap! Tap to view.')}
                className="py-1.5 rounded-xl bg-rose-600/30 border border-rose-500/50 text-rose-300 font-black text-[10px] cursor-pointer hover:bg-rose-600/40 flex items-center justify-center gap-1"
              >
                <span>🔴</span>
                <span>Send Red Snap (Picture)</span>
              </button>
              <button
                type="button"
                onClick={() => handleSendChat(activeChatUser.username, '🔥 Streak Snap! Keep it alive!')}
                className="py-1.5 rounded-xl bg-amber-600/30 border border-amber-500/50 text-amber-300 font-black text-[10px] cursor-pointer hover:bg-amber-600/40 flex items-center justify-center gap-1"
              >
                <Flame className="w-3 h-3 fill-current text-orange-400" />
                <span>Send Streak 🔥</span>
              </button>
            </div>

            {/* Input Bar */}
            <div className="flex gap-1.5 shrink-0">
              <input
                type="text"
                value={chatInputText}
                onChange={(e) => setChatInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendChat(activeChatUser.username);
                }}
                placeholder={`Send chat to @${activeChatUser.username}...`}
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#fffc00]"
              />
              <button
                type="button"
                onClick={() => handleSendChat(activeChatUser.username)}
                className="px-3.5 py-2 bg-[#fffc00] text-black rounded-xl font-black text-xs cursor-pointer hover:scale-105"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: CAMERA & LENSES */}
        {activeTab === 'camera' && (
          <div className="space-y-3">
            <div className="relative w-full h-64 rounded-3xl bg-zinc-900 border-2 border-zinc-800 overflow-hidden flex flex-col items-center justify-center shadow-inner">
              <div className="w-24 h-24 rounded-full bg-zinc-800/80 border border-zinc-700 flex items-center justify-center">
                <CharacterRenderer avatar={userProfile?.avatar || DEFAULT_AVATAR} size="lg" showBackground={false} />
              </div>
              <span className="text-[10px] font-mono text-zinc-400 mt-2">Lens: {selectedLens}</span>

              {/* Shutter Button */}
              <button
                type="button"
                onClick={() => {
                  triggerSound?.('stamp');
                  onShowToast?.('📸 Snap captured! Choose friends or post to your Story.');
                }}
                className="absolute bottom-4 w-14 h-14 rounded-full border-4 border-white flex items-center justify-center bg-white/20 hover:scale-110 transition-transform cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-white" />
              </button>
            </div>

            {/* Caption Input */}
            <input
              type="text"
              value={snapCaptionInput}
              onChange={(e) => setSnapCaptionInput(e.target.value)}
              placeholder="Add caption to this snap..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#fffc00]"
            />

            {/* Post Story Button */}
            <button
              type="button"
              onClick={() => {
                const text = snapCaptionInput.trim() || 'Living my best Naija Life! ✨';
                triggerSound?.('success');
                onShowToast?.(`📸 Snap added to your 24h Story (+50 Snap Score)!`);
                setSnapCaptionInput('');
                setActiveTab('stories');
              }}
              className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-yellow-400 to-[#fffc00] text-black font-black text-xs cursor-pointer shadow-md"
            >
              Post to My Story (+50 Snap Score)
            </button>
          </div>
        )}

        {/* TAB 3: STORIES */}
        {activeTab === 'stories' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 uppercase font-bold px-1">
              <span>Friends' Stories</span>
              <span className="text-[#fffc00]">Real Player Updates</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {realCitizens.slice(0, 6).map((c, idx) => (
                <div
                  key={c.username}
                  onClick={() => {
                    setActiveViewingStory({
                      id: `st_${idx}`,
                      user: `${c.firstName} ${c.lastName}`,
                      text: `Cruising through ${c.location}! The vibes are unmatched 🔥🇳🇬`,
                      time: `${idx + 1}h ago`,
                      filter: 'Lagos Big Boy',
                    });
                  }}
                  className="p-3 rounded-2xl bg-zinc-900 border-2 border-[#fffc00]/40 flex flex-col justify-between h-28 cursor-pointer hover:border-[#fffc00] transition-all"
                >
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-full bg-zinc-800 overflow-hidden border border-zinc-700">
                      <CharacterRenderer avatar={c.avatar} size="sm" showBackground={false} />
                    </div>
                    <span className="text-xs font-black text-white truncate">{c.firstName}</span>
                  </div>
                  <div className="text-[10px] text-zinc-300 font-mono">📍 {c.location}</div>
                  <span className="text-[9px] text-amber-300 font-mono font-bold">Tap to View</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: SNAP MAP */}
        {activeTab === 'map' && (
          <div className="space-y-3">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-950 via-zinc-950 to-neutral-900 border border-emerald-500/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-300 uppercase">Live Citizen Snap Map</span>
                <span className="text-[9px] font-mono text-emerald-400 font-bold">GPS Active</span>
              </div>
              <p className="text-[10px] text-zinc-400">
                View real live citizens positioned in their actual states & locations across Nigeria and Canada.
              </p>
            </div>

            <div className="space-y-1.5">
              {realCitizens.slice(0, 8).map((c) => (
                <div key={c.username} className="p-2.5 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 overflow-hidden border border-zinc-700">
                      <CharacterRenderer avatar={c.avatar} size="sm" showBackground={false} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">{c.firstName} {c.lastName}</div>
                      <div className="text-[10px] text-emerald-400 font-mono">📍 {c.location}</div>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono text-zinc-500">Live on Map</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          SNAPCHAT+ (SNAP PLUS ⭐️) SUBSCRIPTION MODAL
          ========================================================================= */}
      {snapPlusModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3">
          <div className="w-full max-w-xs bg-zinc-950 border-2 border-amber-400 rounded-3xl p-5 shadow-[0_0_50px_rgba(251,191,36,0.3)] text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-black flex items-center justify-center mx-auto text-2xl shadow-lg">
              <Star className="w-8 h-8 fill-current" />
            </div>

            <div>
              <h3 className="text-base font-black text-white">Snapchat+ Exclusive</h3>
              <p className="text-xs text-zinc-400 mt-1">Get exclusive VIP features for your citizen account</p>
            </div>

            <div className="bg-zinc-900/80 p-3 rounded-2xl border border-zinc-800 text-left space-y-2 text-xs">
              <div className="flex items-center gap-2 text-zinc-200">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>Gold Star Bitmoji Badge ⭐️</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-200">
                <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
                <span>Streak Restores & Boosters</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-200">
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                <span>Custom Gold App Icons & Trails</span>
              </div>
            </div>

            <div className="text-xs font-mono text-amber-300 font-black">
              Price: ₦3,500 / month (or $5 CAD)
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSnapPlusModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-zinc-900 text-zinc-400 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBuySnapPlus}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-black font-black text-xs cursor-pointer shadow"
              >
                Subscribe Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW STORY MODAL
          ========================================================================= */}
      {activeViewingStory && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-4">
          <div className="flex items-center justify-between text-white">
            <span className="text-xs font-black">{activeViewingStory.user}</span>
            <button
              type="button"
              onClick={() => setActiveViewingStory(null)}
              className="text-white hover:text-rose-400 p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="text-center space-y-2 py-12">
            <div className="text-base font-bold text-white px-4 leading-relaxed">
              "{activeViewingStory.text}"
            </div>
            <span className="text-xs font-mono text-zinc-400 block">{activeViewingStory.time}</span>
          </div>

          <div className="text-center text-xs text-zinc-500 font-mono">
            Tap anywhere to dismiss story
          </div>
        </div>
      )}
    </div>
  );
};
