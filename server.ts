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

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ limit: '25mb', extended: true }));

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

// GET all submissions (for owner chiboy_52 inbox and user's own tickets)
app.get('/api/suggestions', (req, res) => {
  const username = req.query.username ? String(req.query.username).toLowerCase() : '';
  if (username === 'chiboy_52') {
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
  const { status, ownerUsername } = req.body;
  if (String(ownerUsername).toLowerCase() !== 'chiboy_52') {
    return res.status(403).json({ error: 'Only game owner chiboy_52 can review tickets' });
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

// Initialize or load NEPA grid state
const ALL_STATES_LIST = [
  'abia', 'adamawa', 'akwa_ibom', 'anambra', 'bauchi', 'bayelsa', 'benue', 'borno',
  'cross_river', 'delta', 'ebonyi', 'edo', 'ekiti', 'enugu', 'fct_abuja', 'gombe',
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
      const formattedName = s.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      // Realistic baseline: Lagos, Abuja, Rivers, Edo have stable power; others realistic 75% on
      const lightOn = ['lagos', 'fct_abuja', 'rivers', 'edo', 'anambra'].includes(s) ? true : Math.random() > 0.3;
      grid[s] = {
        name: formattedName,
        lightOn,
        voltage: lightOn ? 220 + Math.floor(Math.random() * 15) : 0,
        megawatt: lightOn ? 1800 + Math.floor(Math.random() * 1200) : 0,
      };
    }
  }
  return grid;
}

function loadNepaGrid(): Record<string, { name: string; lightOn: boolean; voltage: number; megawatt: number }> {
  try {
    if (fs.existsSync(NEPA_FILE)) {
      return JSON.parse(fs.readFileSync(NEPA_FILE, 'utf-8'));
    }
  } catch (err) {
    console.error('Error loading NEPA grid:', err);
  }
  return initDefaultNepaGrid();
}

function saveNepaGrid(grid: Record<string, { name: string; lightOn: boolean; voltage: number; megawatt: number }>) {
  try {
    if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
    fs.writeFileSync(NEPA_FILE, JSON.stringify(grid, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving NEPA grid:', err);
  }
}

let nepaGrid = loadNepaGrid();

// Realistic NEPA timer: subtle dynamic fluctuation every 25 minutes (NOT every 45 seconds!)
setInterval(() => {
  for (const s of ALL_STATES_LIST) {
    if (s === 'canada') continue; // Canada never loses grid power
    // 10% chance of status shift every 25 minutes
    if (Math.random() < 0.10) {
      nepaGrid[s].lightOn = !nepaGrid[s].lightOn;
      nepaGrid[s].voltage = nepaGrid[s].lightOn ? 220 + Math.floor(Math.random() * 10) : 0;
      nepaGrid[s].megawatt = nepaGrid[s].lightOn ? 2100 : 0;
    }
  }
  saveNepaGrid(nepaGrid);
}, 25 * 60 * 1000);

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
// Enforces: citizen usernames must be letters only (no numbers, no special chars) except owner chiboy_52
// Username and Full Citizen Name must both be unique. Password is required.
app.post('/api/auth/register', (req, res) => {
  const { username, password, profile } = req.body;
  if (!username || !password || !profile) {
    return res.status(400).json({ error: 'Username, password, and character profile are required' });
  }

  const cleanUser = String(username).toLowerCase().trim();
  const rawUser = String(username).trim();
  const firstName = String(profile.firstName || '').trim();
  const lastName = String(profile.lastName || '').trim();
  const fullNameClean = `${firstName} ${lastName}`.toLowerCase().trim();

  // Validate citizen username: ONLY letters allowed, no numbers or symbols (except chiboy_52)
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

  // Check full citizen name uniqueness (first name + last name combination cannot be used twice)
  for (const [existingKey, existingRec] of Object.entries(citizensDB)) {
    if (existingKey === cleanUser) continue;
    const existingFullName = `${existingRec.profile?.firstName || ''} ${existingRec.profile?.lastName || ''}`.toLowerCase().trim();
    if (existingFullName === fullNameClean && fullNameClean.length > 0) {
      return res.status(400).json({
        error: `Citizen name "${firstName} ${lastName}" is already registered! Please choose a unique citizen name.`
      });
    }
  }

  // If chiboy_52, grant full owner perks with the exact password signed up with
  const isOwner = cleanUser === 'chiboy_52';
  citizensDB[cleanUser] = {
    password: String(password).trim(),
    profile: {
      ...profile,
      username: isOwner ? 'chiboy_52' : rawUser,
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
// Strict password authentication enforced! Only logs in with the exact password signed up with.
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are both required to log in.' });
  }

  const cleanUser = String(username).toLowerCase().trim();
  citizensDB = loadCitizensDB();
  const record = citizensDB[cleanUser];

  if (!record) {
    return res.status(404).json({ error: 'Citizen account not found. Please click "CREATE NEW LIFE" to register.' });
  }

  // Strict password check for ALL users including owner
  if (!record.password || record.password !== String(password).trim()) {
    return res.status(401).json({ error: 'Incorrect password! You can only log in with the password you signed up with.' });
  }

  // Ensure chiboy_52 maintains owner bank balance and perks
  if (cleanUser === 'chiboy_52') {
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
  });
});

app.get('/api/auth/sync-all', (req, res) => {
  citizensDB = loadCitizensDB();
  return res.json({
    success: true,
    count: Object.keys(citizensDB).length,
    accounts: citizensDB,
  });
});

// 3. OWNER GLOBAL REFRESH & REGISTER ALL CITIZEN ACCOUNTS INTO SNAPCHAT
app.post('/api/owner/global-refresh', (req, res) => {
  const { username } = req.body;
  const cleanUser = String(username || '').toLowerCase().trim();
  if (cleanUser !== 'chiboy_52') {
    return res.status(403).json({ error: 'Unauthorized: Only game owner @chiboy_52 can perform global server sync & account registration.' });
  }

  citizensDB = loadCitizensDB();
  snapchatUsersDB = loadSnapUsers();

  let registeredCount = 0;
  // Automatically register all real citizens into Snapchat if not already present
  for (const [key, c] of Object.entries(citizensDB)) {
    const snapKey = key.toLowerCase();
    if (!snapchatUsersDB[snapKey]) {
      snapchatUsersDB[snapKey] = {
        snapUsername: snapKey,
        displayName: c.profile.firstName ? `${c.profile.firstName} ${c.profile.lastName || ''}`.trim() : snapKey,
        citizenUsername: snapKey,
        password: c.password || 'snap123',
        isSnapPlus: snapKey === 'chiboy_52',
        snapScore: snapKey === 'chiboy_52' ? 999999999 : 250,
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
  const { username, stateId, lightOn, masterBlackout, masterPowerOn } = req.body;
  const cleanUser = String(username || '').toLowerCase().trim();
  if (cleanUser !== 'chiboy_52') {
    return res.status(403).json({ error: 'Unauthorized: Only owner @chiboy_52 can control the NEPA National Power Grid.' });
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
  } else if (stateId && nepaGrid[stateId]) {
    if (stateId === 'canada') {
      nepaGrid['canada'].lightOn = true;
      nepaGrid['canada'].voltage = 120;
      nepaGrid['canada'].megawatt = 42000;
      return res.status(400).json({
        error: 'Canada power is 24/7 permanent hydro power. No NEPA cuts in Canada!',
        grid: nepaGrid,
      });
    }
    nepaGrid[stateId].lightOn = !!lightOn;
    nepaGrid[stateId].voltage = lightOn ? 225 : 0;
    nepaGrid[stateId].megawatt = lightOn ? 2800 : 0;
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

let currentBroadcastTrack: BroadcastTrack | null = loadBroadcastTrack();

app.get('/api/broadcast/music', (req, res) => {
  res.json({
    active: !!currentBroadcastTrack,
    audioData: currentBroadcastTrack?.audioData || null,
    track: currentBroadcastTrack,
  });
});

app.post('/api/broadcast/music', (req, res) => {
  const { username, title, audioData } = req.body;
  const cleanUser = String(username || '').toLowerCase().trim();
  if (cleanUser !== 'chiboy_52') {
    return res.status(403).json({ error: 'Unauthorized: Only the game owner chiboy_52 can broadcast music.' });
  }
  if (!audioData || typeof audioData !== 'string') {
    return res.status(400).json({ error: 'Audio data is required' });
  }
  if (!audioData.includes('audio/mpeg') && !audioData.includes('audio/mp3') && !audioData.startsWith('data:audio/')) {
    return res.status(400).json({ error: 'Only MP3 format audio files (.mp3) are accepted!' });
  }
  currentBroadcastTrack = {
    title: String(title || 'Owner Custom Soundtrack').trim(),
    audioData,
    uploadedBy: 'chiboy_52',
    uploadedAt: Date.now(),
  };
  saveBroadcastTrack(currentBroadcastTrack);
  return res.json({
    success: true,
    active: true,
    audioData: currentBroadcastTrack.audioData,
    track: currentBroadcastTrack,
  });
});

app.delete('/api/broadcast/music', (req, res) => {
  const { username } = req.body;
  const cleanUser = String(username || '').toLowerCase().trim();
  if (cleanUser !== 'chiboy_52') {
    return res.status(403).json({ error: 'Unauthorized: Only the game owner chiboy_52 can modify broadcast.' });
  }
  currentBroadcastTrack = null;
  saveBroadcastTrack(null);
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
