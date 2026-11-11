import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// Enable CORS for cross-origin and multi-device preview access
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Real AI Chat Route for "My AI"
app.post('/api/ai-chat', async (req, res) => {
  const { message, chatHistory } = req.body;
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      const ai = new GoogleGenAI({ apiKey });
      const systemInstruction = `You are "My AI", a friendly, witty, and brilliantly informed AI assistant built right into the Naija Phone in "Naija Life: RPG Simulation". You answer ANY question thoroughly, warmly, and helpfully—whether it's casual greetings ("How far", "Good morning"), trivia, career guidance, questions about Nigeria, budgeting tips, or deep philosophical/tech questions. You can seamlessly blend standard English with authentic Nigerian warmth and colloquial phrases ("No wahala", "I dey for you", "Oya ask away"). Keep answers punchy and conversational (1-4 paragraphs max).`;

      const promptText = `${systemInstruction}\n\nUser: ${message}\nMy AI:`;
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: promptText,
      });

      if (response && response.text) {
        return res.json({ reply: response.text.trim() });
      }
    }
  } catch (err) {
    console.error('Server Gemini API error:', err);
  }

  // Fallback intelligent responses if API key is not configured
  const msgLower = message.toLowerCase();
  let fallback = "How far! I dey active 24/7. Ask me anything whether na casual greetings, life advice, business questions, or general knowledge!";
  if (msgLower.includes('hello') || msgLower.includes('hi') || msgLower.includes('how far') || msgLower.includes('hey')) {
    fallback = "How far my guy! I dey hail you o! What's happening in your side today? How's the hustle going?";
  } else if (msgLower.includes('money') || msgLower.includes('rich') || msgLower.includes('cash') || msgLower.includes('hustle')) {
    fallback = "To build generational wealth in Nigeria: 1. Keep hustling with daily jobs. 2. Save up in Naija Pay. 3. Invest in Empire Biz ventures like Tech Studios or Logistics. 4. Collect your CAC dividends daily. Consistency is key!";
  } else if (msgLower.includes('who are you') || msgLower.includes('what are you')) {
    fallback = "I am My AI—your personal built-in AI assistant on your Naija Phone. I can answer any question, teach you anything, and chat whenever you need company.";
  } else if (msgLower.includes('lagos') || msgLower.includes('abuja') || msgLower.includes('imo')) {
    fallback = "Nigeria has 36 vibrant states! Lagos is the commercial heartbeat full of tech and grit, Abuja is the diplomatic capital with wide roads and serene hills, and Imo is the Eastern hub of enterprise and hospitality!";
  } else {
    fallback = `That's a great question! Regarding "${message}": Keep pressing forward, stay focused on your goals, and make smart moves every day. If you need any specific tip or explanation, feel free to ask me!`;
  }

  return res.json({ reply: fallback });
});

// Real Suggestions & Complaints System (Starts 100% empty, populated ONLY when citizens submit)
interface CommunitySubmission {
  id: string;
  username: string;
  category: string;
  subject: string;
  message: string;
  status: 'pending' | 'reviewed' | 'resolved';
  createdAt: string;
}

let communitySubmissions: CommunitySubmission[] = [];

// Universal Owner Account Validator (Recognizes kchiboy50@gmail.com, chiboy, and chiboy_52)
function isOwnerAccount(username?: string, email?: string, citizenName?: string): boolean {
  const u = String(username || '').toLowerCase().trim();
  const em = String(email || '').toLowerCase().trim();
  const c = String(citizenName || '').toLowerCase().trim();
  return (
    em === 'kchiboy50@gmail.com' ||
    u === 'chiboy' ||
    u === 'chiboy_52' ||
    c === 'chiboy' ||
    c.includes('chiboy')
  );
}

// GET all submissions (for owner inbox and user's own tickets)
app.get('/api/suggestions', (req, res) => {
  const username = req.query.username ? String(req.query.username).toLowerCase() : '';
  const email = req.query.email ? String(req.query.email).toLowerCase() : '';
  if (isOwnerAccount(username, email)) {
    // Owner sees all real citizen submissions
    return res.json({ submissions: communitySubmissions });
  }
  if (username) {
    // Regular citizens see their own submitted tickets
    const userTickets = communitySubmissions.filter((s) => s.username.toLowerCase() === username);
    return res.json({ submissions: userTickets });
  }
  return res.json({ submissions: [] });
});

// POST new citizen suggestion or complaint
app.post('/api/suggestions', (req, res) => {
  const { username, category, subject, message } = req.body;
  if (!username || !subject || !message) {
    return res.status(400).json({ error: 'Username, subject and message are required' });
  }

  const newTicket: CommunitySubmission = {
    id: `ticket_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    username: String(username).trim(),
    category: String(category || 'General Suggestion').trim(),
    subject: String(subject).trim(),
    message: String(message).trim(),
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  communitySubmissions.unshift(newTicket);
  return res.json({ success: true, submission: newTicket });
});

// PATCH update status (Owner only)
app.patch('/api/suggestions/:id', (req, res) => {
  const { id } = req.params;
  const { status, ownerUsername, ownerEmail } = req.body;
  if (!isOwnerAccount(String(ownerUsername), String(ownerEmail))) {
    return res.status(403).json({ error: 'Only game owner can review tickets' });
  }

  const ticket = communitySubmissions.find((t) => t.id === id);
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

  if (status === 'reviewed' || status === 'resolved' || status === 'pending') {
    ticket.status = status;
  }
  return res.json({ success: true, submission: ticket });
});

// =========================================================================
// REAL CROSS-DEVICE CITIZEN DATABASE & MULTI-SERVER SYNC
// =========================================================================
const DB_DIR = path.resolve(__dirname, 'server_data');
const CITIZENS_FILE = path.resolve(DB_DIR, 'citizens.json');
const NEPA_FILE = path.resolve(DB_DIR, 'nepa_grid.json');
const BROADCAST_FILE = path.resolve(DB_DIR, 'broadcast_track.json');
const SNAP_USERS_FILE = path.resolve(DB_DIR, 'snapchat_users.json');
const SNAP_MESSAGES_FILE = path.resolve(DB_DIR, 'snapchat_messages.json');

interface CitizenRecord {
  password: string;
  gmail?: string;
  profile: any;
  updatedAt: string;
}

interface SnapUserRecord {
  snapUsername: string;
  displayName: string;
  citizenUsername: string;
  password?: string;
  isSnapPlus?: boolean;
  snapScore: number;
  streaks: Record<string, { days: number; lastInteracted: number }>;
}

function loadSnapUsers(): Record<string, SnapUserRecord> {
  try {
    if (fs.existsSync(SNAP_USERS_FILE)) {
      return JSON.parse(fs.readFileSync(SNAP_USERS_FILE, 'utf-8'));
    }
  } catch (err) {
    console.error('Error loading snap users:', err);
  }
  return {};
}

function saveSnapUsers(users: Record<string, SnapUserRecord>) {
  try {
    if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
    fs.writeFileSync(SNAP_USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving snap users:', err);
  }
}

function loadSnapMessages(): any[] {
  try {
    if (fs.existsSync(SNAP_MESSAGES_FILE)) {
      return JSON.parse(fs.readFileSync(SNAP_MESSAGES_FILE, 'utf-8'));
    }
  } catch (err) {
    console.error('Error loading snap messages:', err);
  }
  return [];
}

function saveSnapMessages(msgs: any[]) {
  try {
    if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
    fs.writeFileSync(SNAP_MESSAGES_FILE, JSON.stringify(msgs.slice(0, 500), null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving snap messages:', err);
  }
}

let snapchatUsersDB: Record<string, SnapUserRecord> = loadSnapUsers();
let snapMessagesDB: {
  id: string;
  fromUser: string;
  toUser: string;
  caption: string;
  filterUsed?: string;
  timestamp: number;
  timeStr: string;
  isOpened: boolean;
}[] = loadSnapMessages();

let globalRefreshCounter = 1;

// Initialize or load NEPA grid state (All 36 States + FCT + Canada)
const ALL_STATES_LIST = [
  'abia', 'adamawa', 'akwa_ibom', 'anambra', 'bauchi', 'bayelsa', 'benue', 'borno',
  'cross_river', 'delta', 'ebonyi', 'edo', 'ekiti', 'enugu', 'fct', 'gombe',
  'imo', 'jigawa', 'kaduna', 'kano', 'katsina', 'kebbi', 'kogi', 'kwara',
  'lagos', 'nasarawa', 'niger', 'ogun', 'ondo', 'osun', 'oyo', 'plateau',
  'rivers', 'sokoto', 'taraba', 'yobe', 'zamfara', 'canada'
];

function initDefaultNepaGrid(): Record<string, { name: string; lightOn: boolean; voltage: number; megawatt: number }> {
  const grid: Record<string, { name: string; lightOn: boolean; voltage: number; megawatt: number }> = {};
  for (const s of ALL_STATES_LIST) {
    if (s === 'canada') {
      grid[s] = { name: 'Canada (Hydro-Québec / Ontario Grid)', lightOn: true, voltage: 120, megawatt: 42000 };
    } else {
      const formattedName = s === 'fct' ? 'FCT Abuja' : s.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      // Dynamic realistic baseline: ~50% of states have light, ~50% in blackout
      const lightOn = Math.random() > 0.48;
      grid[s] = {
        name: formattedName,
        lightOn,
        voltage: lightOn ? 200 + Math.floor(Math.random() * 25) : 0,
        megawatt: lightOn ? 1800 + Math.floor(Math.random() * 1500) : 0,
      };
    }
  }
  // Alias fct_abuja to fct
  grid['fct_abuja'] = { ...grid['fct'], name: 'FCT Abuja' };
  return grid;
}

function loadNepaGrid(): Record<string, { name: string; lightOn: boolean; voltage: number; megawatt: number }> {
  try {
    if (fs.existsSync(NEPA_FILE)) {
      const data = JSON.parse(fs.readFileSync(NEPA_FILE, 'utf-8'));
      // Ensure Canada is ALWAYS locked 100% on
      data['canada'] = { name: 'Canada (Hydro-Québec / Ontario Grid)', lightOn: true, voltage: 120, megawatt: 42000 };
      if (data['fct']) data['fct_abuja'] = { ...data['fct'], name: 'FCT Abuja' };
      else if (data['fct_abuja']) data['fct'] = { ...data['fct_abuja'], name: 'FCT Abuja' };
      return data;
    }
  } catch (err) {
    console.error('Error loading NEPA grid:', err);
  }
  return initDefaultNepaGrid();
}

function saveNepaGrid(grid: Record<string, { name: string; lightOn: boolean; voltage: number; megawatt: number }>) {
  try {
    if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
    // Guarantee Canada is always ON before saving
    grid['canada'] = { name: 'Canada (Hydro-Québec / Ontario Grid)', lightOn: true, voltage: 120, megawatt: 42000 };
    if (grid['fct']) grid['fct_abuja'] = { ...grid['fct'], name: 'FCT Abuja' };
    fs.writeFileSync(NEPA_FILE, JSON.stringify(grid, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving NEPA grid:', err);
  }
}

let nepaGrid = loadNepaGrid();

// Dynamic automatic NEPA power grid cycle: runs every 15 seconds
// Automatically fluctuates power across 2-3 random Nigerian states (toggling between outage and light on with realistic voltage)
// Keeps Canada strictly 100% immune (24/7 hydro)
setInterval(() => {
  const nigerianStates = ALL_STATES_LIST.filter((s) => s !== 'canada');
  const countToShift = Math.floor(Math.random() * 2) + 2; // 2 or 3 states shift each cycle
  for (let i = 0; i < countToShift; i++) {
    const randomState = nigerianStates[Math.floor(Math.random() * nigerianStates.length)];
    if (nepaGrid[randomState]) {
      const newLightStatus = !nepaGrid[randomState].lightOn;
      nepaGrid[randomState].lightOn = newLightStatus;
      nepaGrid[randomState].voltage = newLightStatus ? 198 + Math.floor(Math.random() * 27) : 0;
      nepaGrid[randomState].megawatt = newLightStatus ? 1850 + Math.floor(Math.random() * 1400) : 0;
    }
  }
  // Guarantee Canada never changes
  nepaGrid['canada'] = { name: 'Canada (Hydro-Québec / Ontario Grid)', lightOn: true, voltage: 120, megawatt: 42000 };
  if (nepaGrid['fct']) nepaGrid['fct_abuja'] = { ...nepaGrid['fct'], name: 'FCT Abuja' };
  saveNepaGrid(nepaGrid);
  globalRefreshCounter++;
}, 15 * 1000);

function loadCitizensDB(): Record<string, CitizenRecord> {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    if (fs.existsSync(CITIZENS_FILE)) {
      const data = fs.readFileSync(CITIZENS_FILE, 'utf-8');
      const db = JSON.parse(data);
      return db;
    }
  } catch (err) {
    console.error('Error loading citizens database:', err);
  }
  return {};
}

function saveCitizensDB(db: Record<string, CitizenRecord>) {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    fs.writeFileSync(CITIZENS_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving citizens database:', err);
  }
}

let citizensDB: Record<string, CitizenRecord> = loadCitizensDB();

const SEXTILLION_999 = 9.99e23;

// 1. REGISTER NEW CITIZEN ACROSS SERVERS
// Enforces: Email (any valid email domain), username (letters only), birthday, and password.
// Enforces: Strict uniqueness for Username, Email, AND Citizen Name across all accounts.
// Recognizes: Any account created with kchiboy50@gmail.com and chiboy as owner account with full privileges!
app.post('/api/auth/register', (req, res) => {
  const { username, password, email, gmail, profile } = req.body;
  const rawEmail = String(email || gmail || '').trim();
  const cleanEmail = rawEmail.toLowerCase();
  const rawUser = String(username || '').trim();
  const cleanUser = rawUser.toLowerCase();
  const rawCitizenName = String(profile?.citizenName || profile?.firstName || rawUser).trim();
  const cleanCitizenName = rawCitizenName.toLowerCase();

  if (!username || !password || !rawEmail || !profile) {
    return res.status(400).json({ error: 'Email, username, password, and character profile are required' });
  }

  // Validate Email format (Accepts ANY valid email domain: Gmail, Yahoo, Outlook, Hotmail, iCloud, custom domains, etc.)
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(cleanEmail)) {
    return res.status(400).json({
      error: 'Please enter a valid existing email address (e.g. kchiboy50@gmail.com or citizen@domain.com).'
    });
  }

  // Validate citizen username: ONLY letters allowed, no numbers or symbols (except chiboy_52 legacy)
  if (cleanUser !== 'chiboy_52') {
    const isLettersOnly = /^[a-zA-Z]+$/.test(rawUser);
    if (!isLettersOnly) {
      return res.status(400).json({
        error: 'Citizen username must contain LETTERS ONLY! No numbers, no spaces, and no special characters allowed.'
      });
    }
  }

  citizensDB = loadCitizensDB();

  // Check username uniqueness
  if (citizensDB[cleanUser]) {
    return res.status(400).json({
      error: `Username "${rawUser}" is already taken! Every citizen must have a distinct unique username.`
    });
  }

  // Check Email & Citizen Name uniqueness across all existing registered accounts
  for (const existingRec of Object.values(citizensDB)) {
    const exEm = (existingRec.gmail || existingRec.profile?.email || '').toLowerCase().trim();
    if (exEm && exEm === cleanEmail) {
      return res.status(400).json({
        error: `Email "${rawEmail}" is already registered to another citizen account!`
      });
    }

    const exFirstName = (existingRec.profile?.firstName || '').toLowerCase().trim();
    const exCitizenName = (existingRec.profile?.citizenName || '').toLowerCase().trim();
    if ((exCitizenName && exCitizenName === cleanCitizenName) || (exFirstName && exFirstName === cleanCitizenName)) {
      return res.status(400).json({
        error: `Citizen name "${rawCitizenName}" is already taken! Two accounts cannot bear the same citizen name.`
      });
    }
  }

  // Recognize Game Owner:
  // "any acct created with kchiboy50@gmail.com and chiboy as citizen name IS THE OWNER ACCOUNT WHICH WILL GET THE OWNERS PRIVILEDGES"
  const isOwner = isOwnerAccount(cleanUser, cleanEmail, cleanCitizenName);

  citizensDB[cleanUser] = {
    password: String(password).trim(),
    gmail: cleanEmail,
    profile: {
      ...profile,
      username: isOwner ? (cleanUser === 'chiboy_52' ? 'chiboy_52' : rawUser) : rawUser,
      gmail: cleanEmail,
      email: cleanEmail,
      citizenName: rawCitizenName,
      firstName: profile.firstName || rawCitizenName,
      isOwner,
      isOwnerAccount: isOwner,
      isVerified: isOwner,
      socialClass: isOwner ? 'nepo' : (profile.socialClass || 'mapo'),
      phoneModel: isOwner ? 'iphone_18_pm' : (profile.phoneModel || 'samsung_s24_base'),
      bankNaira: isOwner ? SEXTILLION_999 : Number(profile.bankNaira || 10000),
      cashNaira: isOwner ? SEXTILLION_999 : Number(profile.cashNaira || 5000),
      bankCAD: isOwner ? SEXTILLION_999 : Number(profile.bankCAD || 0),
      savingsCAD: isOwner ? SEXTILLION_999 : Number(profile.savingsCAD || 0),
      cashUSD: isOwner ? 1000000000 : Number(profile.cashUSD || 0),
      fatherRentSubsidyPct: isOwner ? 100 : Number(profile.fatherRentSubsidyPct || 35),
      energy: 100,
      hunger: 95,
      health: 100,
      happiness: 100,
      receipts: profile.receipts || [],
      alerts: profile.alerts || [],
    },
    updatedAt: new Date().toISOString(),
  };

  saveCitizensDB(citizensDB);
  return res.json({ success: true, profile: citizensDB[cleanUser].profile });
});

// 2. LOG IN CITIZEN FROM ANY DEVICE
// Allows login by Username OR Email with strict password verification!
app.post('/api/auth/login', (req, res) => {
  const { username, password, email, gmail, identifier } = req.body;
  const loginKey = String(identifier || username || email || gmail || '').toLowerCase().trim();
  if (!loginKey || !password) {
    return res.status(400).json({ error: 'Username or Email, and password are required to log in.' });
  }

  citizensDB = loadCitizensDB();

  // Search by username key directly or by matching stored email/gmail, citizenName, or profile username
  let foundKey = citizensDB[loginKey] ? loginKey : '';
  if (!foundKey) {
    for (const [key, rec] of Object.entries(citizensDB)) {
      const recEm = (rec.gmail || rec.profile?.email || '').toLowerCase().trim();
      const recUser = (rec.profile?.username || key).toLowerCase().trim();
      const recCit = (rec.profile?.citizenName || rec.profile?.firstName || '').toLowerCase().trim();
      if (
        (recEm && recEm === loginKey) ||
        (recUser && recUser === loginKey) ||
        (recCit && recCit === loginKey) ||
        key.toLowerCase().trim() === loginKey
      ) {
        foundKey = key;
        break;
      }
    }
  }

  if (!foundKey) {
    return res.status(404).json({ error: 'Citizen account not found. Please click "CREATE NEW LIFE" to register.' });
  }

  const record = citizensDB[foundKey];
  // Strict password check for ALL users including owner
  if (!record.password || record.password !== String(password).trim()) {
    return res.status(401).json({ error: 'Incorrect password! You can only log in with the password you signed up with.' });
  }

  // Ensure owner accounts maintain owner perks and status
  const isOwner = isOwnerAccount(foundKey, record.gmail || record.profile?.email, record.profile?.citizenName || record.profile?.firstName);
  if (isOwner) {
    record.profile.isOwner = true;
    record.profile.isOwnerAccount = true;
    record.profile.isVerified = true;
    record.profile.bankNaira = SEXTILLION_999;
    record.profile.cashNaira = SEXTILLION_999;
    record.profile.bankCAD = SEXTILLION_999;
    record.profile.savingsCAD = SEXTILLION_999;
    record.profile.socialClass = 'nepo';
    record.profile.phoneModel = 'iphone_18_pm';
    record.profile.fatherRentSubsidyPct = 100;
    saveCitizensDB(citizensDB);
  }

  return res.json({ success: true, profile: record.profile });
});

// 2b. FETCH ALL ACCOUNTS FOR MULTI-DEVICE SYNCHRONIZATION
app.get('/api/auth/all-accounts', (req, res) => {
  citizensDB = loadCitizensDB();
  return res.json({
    success: true,
    count: Object.keys(citizensDB).length,
    accounts: citizensDB,
    citizens: citizensDB,
  });
});

app.post('/api/auth/reset-all-accounts', (req, res) => {
  citizensDB = {};
  saveCitizensDB({});
  return res.json({
    success: true,
    count: 0,
    message: 'All accounts completely deleted from Naija Life Central Servers.',
  });
});

app.get('/api/auth/sync-all', (req, res) => {
  citizensDB = loadCitizensDB();
  return res.json({
    success: true,
    count: Object.keys(citizensDB).length,
    accounts: citizensDB,
    citizens: citizensDB,
  });
});

// 2c. REAL-TIME ACCOUNT PROFILE SYNC (Saves bank balance, cash, CAD, stats across devices)
app.post('/api/auth/sync', (req, res) => {
  const { username, email, profileUpdates } = req.body;
  if (!username || !profileUpdates) {
    return res.status(400).json({ error: 'Username and profile updates are required.' });
  }

  const cleanUser = String(username).toLowerCase().trim();
  citizensDB = loadCitizensDB();

  if (!citizensDB[cleanUser]) {
    return res.status(404).json({ error: 'Citizen account not found on Naija Life servers.' });
  }

  const userEm = String(email || citizensDB[cleanUser]?.gmail || citizensDB[cleanUser]?.profile?.email || '').toLowerCase().trim();
  const isOwner = isOwnerAccount(cleanUser, userEm, citizensDB[cleanUser]?.profile?.citizenName);

  citizensDB[cleanUser].profile = {
    ...citizensDB[cleanUser].profile,
    ...profileUpdates,
    bankNaira: isOwner ? SEXTILLION_999 : (profileUpdates.bankNaira !== undefined ? Number(profileUpdates.bankNaira) : citizensDB[cleanUser].profile.bankNaira),
    cashNaira: isOwner ? SEXTILLION_999 : (profileUpdates.cashNaira !== undefined ? Number(profileUpdates.cashNaira) : citizensDB[cleanUser].profile.cashNaira),
    bankCAD: isOwner ? SEXTILLION_999 : (profileUpdates.bankCAD !== undefined ? Number(profileUpdates.bankCAD) : citizensDB[cleanUser].profile.bankCAD),
    socialClass: isOwner ? 'nepo' : (citizensDB[cleanUser].profile.socialClass || 'mapo'),
    phoneModel: isOwner ? 'iphone_18_pm' : (citizensDB[cleanUser].profile.phoneModel || 'samsung_s24_base'),
  };
  citizensDB[cleanUser].updatedAt = new Date().toISOString();

  saveCitizensDB(citizensDB);
  return res.json({ success: true, profile: citizensDB[cleanUser].profile });
});

// 2d. OWNER PLAYERS REGISTRY (Returns all registered real citizens with passwords for owner)
app.get('/api/owner/players-registry', (req, res) => {
  const username = String(req.query.username || '').toLowerCase().trim();
  const email = String(req.query.email || '').toLowerCase().trim();
  if (!isOwnerAccount(username, email)) {
    return res.status(403).json({ error: 'Unauthorized: Only game owner can inspect the players registry.' });
  }

  citizensDB = loadCitizensDB();
  const players = Object.entries(citizensDB).map(([key, record]) => {
    const prof = record.profile || {};
    return {
      username: prof.username || key,
      gmail: record.gmail || prof.gmail || prof.email || '(none)',
      email: record.gmail || prof.gmail || prof.email || '(none)',
      citizenName: prof.citizenName || `${prof.firstName || ''} ${prof.lastName || ''}`.trim() || prof.username || key,
      gender: prof.gender || prof.avatar?.gender || 'male',
      stateOfOrigin: prof.spawnStateId || prof.originState || 'Lagos',
      socialClass: prof.socialClass || 'mapo',
      phoneModel: prof.phoneModel || 'samsung_s24_base',
      bankNaira: prof.bankNaira || 0,
      bankCAD: prof.bankCAD || 0,
      password: record.password || '(not set)',
      registeredAt: record.updatedAt || new Date().toISOString(),
      avatar: prof.avatar || null,
    };
  });

  return res.json({
    success: true,
    totalPlayers: players.length,
    players,
  });
});

// 3. OWNER GLOBAL REFRESH & REGISTER ALL CITIZEN ACCOUNTS INTO SNAPCHAT
app.post('/api/owner/global-refresh', (req, res) => {
  const { username, email } = req.body;
  const cleanUser = String(username || '').toLowerCase().trim();
  const cleanEmail = String(email || '').toLowerCase().trim();
  if (!isOwnerAccount(cleanUser, cleanEmail)) {
    return res.status(403).json({ error: 'Unauthorized: Only game owner can perform global server sync & account registration.' });
  }

  citizensDB = loadCitizensDB();
  snapchatUsersDB = loadSnapUsers();

  let registeredCount = 0;
  // Automatically register all real citizens into Snapchat if not already present
  for (const [key, c] of Object.entries(citizensDB)) {
    const snapKey = key.toLowerCase();
    const isOwnerCitizen = isOwnerAccount(snapKey, c.gmail || c.profile?.email, c.profile?.citizenName);
    if (!snapchatUsersDB[snapKey]) {
      snapchatUsersDB[snapKey] = {
        snapUsername: snapKey,
        displayName: c.profile.firstName ? `${c.profile.firstName} ${c.profile.lastName || ''}`.trim() : snapKey,
        citizenUsername: snapKey,
        password: c.password || 'snap123',
        isSnapPlus: isOwnerCitizen,
        snapScore: isOwnerCitizen ? 999999999 : 250,
        streaks: {},
      };
      registeredCount++;
    }
  }

  saveSnapUsers(snapchatUsersDB);
  globalRefreshCounter++;

  return res.json({
    success: true,
    message: `Global sync complete! Refreshed game servers worldwide. ${registeredCount} citizen accounts registered into Snapchat & Banking Network.`,
    globalRefreshCounter,
    totalCitizens: Object.keys(citizensDB).length,
    totalSnapUsers: Object.keys(snapchatUsersDB).length,
  });
});

// 4. GLOBAL SERVER STATUS (Pollable by all clients)
app.get('/api/global/status', (req, res) => {
  return res.json({
    globalRefreshCounter,
    activeTrack: currentBroadcastTrack,
    nepaGrid,
    serverTime: Date.now(),
  });
});

// 5. NEPA GRID STATUS & OWNER CONTROL ROOM
app.get('/api/nepa/grid', (req, res) => {
  return res.json({ success: true, grid: nepaGrid });
});

app.post('/api/nepa/toggle', (req, res) => {
  const { username, email, stateId, lightOn, masterBlackout, masterPowerOn } = req.body;
  const cleanUser = String(username || '').toLowerCase().trim();
  const cleanEmail = String(email || '').toLowerCase().trim();
  if (!isOwnerAccount(cleanUser, cleanEmail)) {
    return res.status(403).json({ error: 'Unauthorized: Only game owner can control the NEPA National Power Grid.' });
  }

  if (masterBlackout) {
    for (const s of ALL_STATES_LIST) {
      if (s === 'canada') continue;
      nepaGrid[s].lightOn = false;
      nepaGrid[s].voltage = 0;
      nepaGrid[s].megawatt = 0;
    }
  } else if (masterPowerOn) {
    for (const s of ALL_STATES_LIST) {
      nepaGrid[s].lightOn = true;
      nepaGrid[s].voltage = s === 'canada' ? 120 : 230;
      nepaGrid[s].megawatt = s === 'canada' ? 42000 : 3200;
    }
  } else if (stateId) {
    const targetKey = (stateId === 'fct_abuja') ? 'fct' : stateId;
    if (targetKey === 'canada') {
      nepaGrid['canada'].lightOn = true;
      nepaGrid['canada'].voltage = 120;
      nepaGrid['canada'].megawatt = 42000;
      return res.status(400).json({
        error: 'Canada power is 24/7 permanent hydro power. No NEPA cuts in Canada!',
        grid: nepaGrid,
      });
    }
    if (nepaGrid[targetKey]) {
      nepaGrid[targetKey].lightOn = !!lightOn;
      nepaGrid[targetKey].voltage = lightOn ? 225 : 0;
      nepaGrid[targetKey].megawatt = lightOn ? 2800 : 0;
      if (targetKey === 'fct') {
        nepaGrid['fct_abuja'] = { ...nepaGrid['fct'], name: 'FCT Abuja' };
      }
    }
  }

  saveNepaGrid(nepaGrid);
  globalRefreshCounter++;

  return res.json({ success: true, grid: nepaGrid });
});

// 7. REAL CITIZEN-TO-CITIZEN BANK TRANSFERS (NGN & CAD)
app.post('/api/bank/transfer', (req, res) => {
  const { senderUsername, recipientUsername, amount, currency = 'NGN', note = 'Naija Pay Transfer' } = req.body;
  if (!senderUsername || !recipientUsername || !amount || amount <= 0) {
    return res.status(400).json({ error: 'Sender, recipient, and a positive amount are required.' });
  }

  const cleanSender = String(senderUsername).toLowerCase().trim();
  const cleanRecipient = String(recipientUsername).toLowerCase().trim();

  if (cleanSender === cleanRecipient) {
    return res.status(400).json({ error: 'Cannot transfer funds to yourself.' });
  }

  citizensDB = loadCitizensDB();
  if (!citizensDB[cleanSender] && req.body.senderProfile) {
    citizensDB[cleanSender] = {
      password: req.body.senderPassword || 'pass123',
      profile: req.body.senderProfile,
      updatedAt: new Date().toISOString(),
    };
  }

  const senderRecord = citizensDB[cleanSender];
  const recipientRecord = citizensDB[cleanRecipient];

  if (!senderRecord || !senderRecord.profile) {
    return res.status(404).json({ error: 'Sender account not found.' });
  }

  if (!recipientRecord || !recipientRecord.profile) {
    return res.status(404).json({ error: `Citizen @${recipientUsername} not found on Naija Life servers. Only real registered citizens can receive transfers.` });
  }

  const transferCurrency = currency === 'CAD' ? 'CAD' : 'NGN';
  const numAmount = Math.round(Number(amount));

  if (transferCurrency === 'CAD') {
    const senderBalance = Number(senderRecord.profile.bankCAD || 0);
    if (senderBalance < numAmount) {
      return res.status(400).json({ error: `Insufficient CAD funds. Your Canadian balance is $${senderBalance.toLocaleString()} CAD.` });
    }
    // Deduct from sender
    senderRecord.profile.bankCAD = senderBalance - numAmount;
    // Deposit into recipient's Canadian account
    recipientRecord.profile.bankCAD = Number(recipientRecord.profile.bankCAD || 0) + numAmount;
  } else {
    const senderBalance = Number(senderRecord.profile.bankNaira || 0);
    if (senderBalance < numAmount) {
      return res.status(400).json({ error: `Insufficient NGN funds. Your Nigerian balance is ₦${senderBalance.toLocaleString()}.` });
    }
    // Deduct from sender
    senderRecord.profile.bankNaira = senderBalance - numAmount;
    // Deposit into recipient's Nigerian account
    recipientRecord.profile.bankNaira = Number(recipientRecord.profile.bankNaira || 0) + numAmount;
  }

  const txId = `TX_${Date.now()}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  const nowStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  // Update sender receipts
  if (!Array.isArray(senderRecord.profile.receipts)) {
    senderRecord.profile.receipts = [];
  }
  senderRecord.profile.receipts.unshift({
    id: txId,
    title: `Transfer to @${recipientRecord.profile.username || cleanRecipient}`,
    category: 'transfer',
    amount: numAmount,
    date: nowStr,
    type: 'debit',
    currency: transferCurrency,
    recipientOrSender: recipientRecord.profile.username || cleanRecipient,
    referenceNo: txId,
  });

  // Update recipient receipts & alert
  if (!Array.isArray(recipientRecord.profile.receipts)) {
    recipientRecord.profile.receipts = [];
  }
  recipientRecord.profile.receipts.unshift({
    id: `RX_${Date.now()}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
    title: `Transfer from @${senderRecord.profile.username || cleanSender}`,
    category: 'transfer',
    amount: numAmount,
    date: nowStr,
    type: 'credit',
    currency: transferCurrency,
    recipientOrSender: senderRecord.profile.username || cleanSender,
    referenceNo: txId,
  });

  if (!Array.isArray(recipientRecord.profile.alerts)) {
    recipientRecord.profile.alerts = [];
  }
  recipientRecord.profile.alerts.unshift({
    id: `ALT_${Date.now()}`,
    text: `CREDIT ALERT: Received ${transferCurrency === 'CAD' ? '$' : '₦'}${numAmount.toLocaleString()} ${transferCurrency} from @${senderRecord.profile.username || cleanSender}. Ref: ${txId}`,
    amount: numAmount,
    date: nowStr,
    type: 'credit',
    senderOrRecipient: senderRecord.profile.username || cleanSender,
  });

  senderRecord.updatedAt = new Date().toISOString();
  recipientRecord.updatedAt = new Date().toISOString();

  globalRefreshCounter++;
  saveCitizensDB(citizensDB);

  return res.json({
    success: true,
    message: `Successfully transferred ${transferCurrency === 'CAD' ? '$' : '₦'}${numAmount.toLocaleString()} ${transferCurrency} to @${recipientRecord.profile.username || cleanRecipient}.`,
    senderProfile: senderRecord.profile,
  });
});


// =========================================================================
// OWNER-ONLY BACKGROUND MUSIC BROADCAST SYSTEM (CHIBOY_52 ONLY)
// =========================================================================
interface BroadcastTrack {
  title: string;
  audioData: string; // base64 mp3 data URL
  uploadedBy: string;
  uploadedAt: number;
}

function loadBroadcastTrack(): BroadcastTrack | null {
  try {
    if (fs.existsSync(BROADCAST_FILE)) {
      const data = fs.readFileSync(BROADCAST_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error loading broadcast track:', err);
  }
  return null;
}

function saveBroadcastTrack(track: BroadcastTrack | null) {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    if (track) {
      fs.writeFileSync(BROADCAST_FILE, JSON.stringify(track), 'utf-8');
    } else if (fs.existsSync(BROADCAST_FILE)) {
      fs.unlinkSync(BROADCAST_FILE);
    }
  } catch (err) {
    console.error('Error saving broadcast track:', err);
  }
}

const AUDIO_STREAM_FILE = path.resolve(DB_DIR, 'broadcast_audio.mp3');

app.get('/api/broadcast/audio.mp3', (req, res) => {
  if (!fs.existsSync(AUDIO_STREAM_FILE)) {
    return res.status(404).end();
  }
  try {
    const stat = fs.statSync(AUDIO_STREAM_FILE);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = (end - start) + 1;
      const fileStream = fs.createReadStream(AUDIO_STREAM_FILE, { start, end });
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-cache',
      });
      return fileStream.pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': 'audio/mpeg',
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'no-cache',
      });
      return fs.createReadStream(AUDIO_STREAM_FILE).pipe(res);
    }
  } catch (err) {
    console.error('Error streaming broadcast audio:', err);
    return res.status(500).end();
  }
});

let currentBroadcastTrack: BroadcastTrack | null = loadBroadcastTrack();

app.get('/api/broadcast/music', (req, res) => {
  const hasAudioFile = fs.existsSync(AUDIO_STREAM_FILE);
  const ts = currentBroadcastTrack?.uploadedAt || 1;
  res.json({
    active: !!currentBroadcastTrack || hasAudioFile,
    audioData: currentBroadcastTrack?.audioData || (hasAudioFile ? `/api/broadcast/audio.mp3?t=${ts}` : null),
    streamUrl: hasAudioFile ? `/api/broadcast/audio.mp3?t=${ts}` : null,
    track: currentBroadcastTrack,
  });
});

app.post('/api/broadcast/music', (req, res) => {
  const { username, email, title, audioData } = req.body;
  const cleanUser = String(username || '').toLowerCase().trim();
  const cleanEmail = String(email || '').toLowerCase().trim();
  if (!isOwnerAccount(cleanUser, cleanEmail)) {
    return res.status(403).json({ error: 'Unauthorized: Only the game owner can broadcast music.' });
  }
  if (!audioData || typeof audioData !== 'string') {
    return res.status(400).json({ error: 'Audio data is required' });
  }

  const uploadTs = Date.now();
  try {
    if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
    const base64Index = audioData.indexOf('base64,');
    if (base64Index !== -1) {
      const rawBase64 = audioData.slice(base64Index + 7);
      const buffer = Buffer.from(rawBase64, 'base64');
      fs.writeFileSync(AUDIO_STREAM_FILE, buffer);
    }
  } catch (err) {
    console.error('Error saving audio stream file:', err);
  }

  currentBroadcastTrack = {
    title: String(title || 'Owner Custom Soundtrack').trim(),
    audioData: `/api/broadcast/audio.mp3?t=${uploadTs}`,
    uploadedBy: cleanUser || 'chiboy',
    uploadedAt: uploadTs,
  };
  saveBroadcastTrack(currentBroadcastTrack);
  globalRefreshCounter++;

  return res.json({
    success: true,
    active: true,
    streamUrl: `/api/broadcast/audio.mp3?t=${uploadTs}`,
    track: currentBroadcastTrack,
  });
});

app.delete('/api/broadcast/music', (req, res) => {
  const { username, email } = req.body;
  const cleanUser = String(username || '').toLowerCase().trim();
  const cleanEmail = String(email || '').toLowerCase().trim();
  if (!isOwnerAccount(cleanUser, cleanEmail)) {
    return res.status(403).json({ error: 'Unauthorized: Only the game owner can modify broadcast.' });
  }
  currentBroadcastTrack = null;
  saveBroadcastTrack(null);
  try {
    if (fs.existsSync(AUDIO_STREAM_FILE)) fs.unlinkSync(AUDIO_STREAM_FILE);
  } catch {}
  globalRefreshCounter++;
  return res.json({ success: true, active: false });
});


// GET real registered players on Snapchat
app.get('/api/snapchat/users', (req, res) => {
  citizensDB = loadCitizensDB();
  const allCitizens = Object.values(citizensDB).map((c) => ({
    username: c.profile.username,
    firstName: c.profile.firstName,
    lastName: c.profile.lastName,
    avatar: c.profile.avatar,
    state: c.profile.spawnStateId || 'lagos',
  }));

  const snapAccounts = Object.values(snapchatUsersDB).map((s) => ({
    snapUsername: s.snapUsername,
    displayName: s.displayName,
    citizenUsername: s.citizenUsername,
    isSnapPlus: !!s.isSnapPlus,
    snapScore: s.snapScore,
  }));

  return res.json({ citizens: allCitizens, snapUsers: snapAccounts });
});

// Register or Login to Snapchat
app.post('/api/snapchat/auth', (req, res) => {
  const { snapUsername, displayName, password, citizenUsername, isLogin } = req.body;
  const cleanSnapUser = String(snapUsername || '').toLowerCase().trim();
  const cleanCitizen = String(citizenUsername || '').toLowerCase().trim();

  if (!cleanSnapUser) {
    return res.status(400).json({ error: 'Snapchat username is required' });
  }

  if (isLogin) {
    const existing = snapchatUsersDB[cleanSnapUser];
    if (!existing) {
      return res.status(404).json({ error: 'Snapchat account not found. Please sign up!' });
    }
    if (existing.password && existing.password !== password) {
      return res.status(401).json({ error: 'Incorrect Snapchat password.' });
    }
    return res.json({ success: true, account: existing });
  }

  // Sign up
  if (snapchatUsersDB[cleanSnapUser]) {
    return res.status(400).json({ error: 'That Snapchat username is already taken! Choose another.' });
  }

  snapchatUsersDB[cleanSnapUser] = {
    snapUsername: cleanSnapUser,
    displayName: String(displayName || snapUsername).trim(),
    citizenUsername: cleanCitizen,
    password: String(password || ''),
    isSnapPlus: cleanCitizen === 'chiboy_52',
    snapScore: cleanCitizen === 'chiboy_52' ? 999999999 : 150,
    streaks: {},
  };
  saveSnapUsers(snapchatUsersDB);

  return res.json({ success: true, account: snapchatUsersDB[cleanSnapUser] });
});

// GET messages/snaps for a user
app.get('/api/snapchat/messages', (req, res) => {
  const username = String(req.query.username || '').toLowerCase().trim();
  if (!username) return res.json({ messages: [] });
  const userMessages = snapMessagesDB.filter((m) => m.toUser === username || m.fromUser === username);
  return res.json({ messages: userMessages });
});

// Send Snap / Message
app.post('/api/snapchat/send', (req, res) => {
  const { fromUser, toUser, caption, filterUsed } = req.body;
  const cleanFrom = String(fromUser || '').toLowerCase().trim();
  const cleanTo = String(toUser || '').toLowerCase().trim();

  if (!cleanFrom || !cleanTo) {
    return res.status(400).json({ error: 'Sender and recipient required' });
  }

  const newMsg = {
    id: `snap_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    fromUser: cleanFrom,
    toUser: cleanTo,
    caption: String(caption || '').trim(),
    filterUsed: filterUsed || '',
    timestamp: Date.now(),
    timeStr: 'Just now',
    isOpened: false,
  };
  snapMessagesDB.unshift(newMsg);

  // Update streaks
  if (snapchatUsersDB[cleanFrom]) {
    snapchatUsersDB[cleanFrom].snapScore += 10;
    if (!snapchatUsersDB[cleanFrom].streaks) snapchatUsersDB[cleanFrom].streaks = {};
    const curStreak = snapchatUsersDB[cleanFrom].streaks[cleanTo]?.days || 0;
    snapchatUsersDB[cleanFrom].streaks[cleanTo] = { days: curStreak + 1, lastInteracted: Date.now() };
  }
  if (snapchatUsersDB[cleanTo]) {
    if (!snapchatUsersDB[cleanTo].streaks) snapchatUsersDB[cleanTo].streaks = {};
    const curStreak = snapchatUsersDB[cleanTo].streaks[cleanFrom]?.days || 0;
    snapchatUsersDB[cleanTo].streaks[cleanFrom] = { days: curStreak + 1, lastInteracted: Date.now() };
  }

  saveSnapUsers(snapchatUsersDB);
  saveSnapMessages(snapMessagesDB);

  return res.json({ success: true, message: newMsg });
});

// Buy Snap Plus with in-game money
app.post('/api/snapchat/plus', (req, res) => {
  const { snapUsername, citizenUsername } = req.body;
  const cleanSnap = String(snapUsername || '').toLowerCase().trim();
  const cleanCitizen = String(citizenUsername || '').toLowerCase().trim();

  citizensDB = loadCitizensDB();
  const userRecord = citizensDB[cleanCitizen];
  if (!userRecord || !userRecord.profile) {
    return res.status(404).json({ error: 'Citizen not found' });
  }

  const costNGN = 3500;
  if (Number(userRecord.profile.bankNaira || 0) < costNGN && Number(userRecord.profile.cashNaira || 0) < costNGN) {
    return res.status(400).json({ error: 'Insufficient funds for Snapchat+ (₦3,500/mo)' });
  }

  if (Number(userRecord.profile.bankNaira || 0) >= costNGN) {
    userRecord.profile.bankNaira = Number(userRecord.profile.bankNaira) - costNGN;
  } else {
    userRecord.profile.cashNaira = Number(userRecord.profile.cashNaira) - costNGN;
  }

  if (snapchatUsersDB[cleanSnap]) {
    snapchatUsersDB[cleanSnap].isSnapPlus = true;
    snapchatUsersDB[cleanSnap].snapScore += 500;
  }
  saveSnapUsers(snapchatUsersDB);
  saveCitizensDB(citizensDB);

  return res.json({ success: true, message: 'Snapchat+ Activated! ⭐️ Gold Star Badge & VIP Features Unlocked!' });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', citizensCount: Object.keys(citizensDB).length, time: new Date().toISOString() });
});

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
