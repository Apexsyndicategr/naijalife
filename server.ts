import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// Enable CORS and popup opener compatibility for cross-origin and multi-device access
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// =========================================================================
// FIREBASE CRYPTOGRAPHIC ID TOKEN & APEX SYNDICATE OWNER VERIFICATION
// =========================================================================
const OWNER_EMAIL = 'kchiboy50@gmail.com';
const OWNER_USERNAME = 'chiboy_52';

interface FirebaseAppletConfig {
  projectId: string;
  apiKey: string;
  firestoreDatabaseId: string;
}

function loadFirebaseAppletConfig(): FirebaseAppletConfig {
  try {
    const cfgPath = path.resolve(__dirname, 'firebase-applet-config.json');
    if (fs.existsSync(cfgPath)) {
      const parsed = JSON.parse(fs.readFileSync(cfgPath, 'utf-8'));
      return {
        projectId: String(parsed.projectId || ''),
        apiKey: String(parsed.apiKey || ''),
        firestoreDatabaseId: String(parsed.firestoreDatabaseId || '(default)'),
      };
    }
  } catch (err) {
    console.error('Failed to load firebase-applet-config.json:', err);
  }
  return { projectId: '', apiKey: '', firestoreDatabaseId: '(default)' };
}

const FIREBASE_CONFIG = loadFirebaseAppletConfig();

let cachedGoogleCerts: { certs: Record<string, string>; expiresAtMs: number } = {
  certs: {},
  expiresAtMs: 0,
};

async function getFirebasePublicCerts(): Promise<Record<string, string>> {
  const now = Date.now();
  if (now < cachedGoogleCerts.expiresAtMs && Object.keys(cachedGoogleCerts.certs).length > 0) {
    return cachedGoogleCerts.certs;
  }

  const resp = await fetch(
    'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com'
  );
  if (!resp.ok) {
    throw new Error(`Failed to fetch Google x509 certs: ${resp.status}`);
  }
  const cacheControl = resp.headers.get('cache-control') || '';
  const maxAgeMatch = cacheControl.match(/max-age=(\d+)/);
  const maxAgeSec = maxAgeMatch ? Number(maxAgeMatch[1]) : 3600;
  const certs = (await resp.json()) as Record<string, string>;
  cachedGoogleCerts = {
    certs,
    expiresAtMs: now + Math.max(60, maxAgeSec - 30) * 1000,
  };
  return certs;
}

function base64UrlDecodeToBuffer(str: string): Buffer {
  const normalized = str.replace(/-/g, '+').replace(/_/g, '/');
  const pad = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4));
  return Buffer.from(normalized + pad, 'base64');
}

interface VerifiedFirebaseUser {
  uid: string;
  email: string;
  emailVerified: boolean;
  idToken: string;
}

async function verifyFirebaseIdToken(req: express.Request): Promise<{
  ok: boolean;
  user?: VerifiedFirebaseUser;
  status?: number;
  error?: string;
}> {
  const authHeader = String(req.headers.authorization || '');
  if (!authHeader.startsWith('Bearer ')) {
    return { ok: false, status: 401, error: 'Missing Bearer authentication token.' };
  }
  const idToken = authHeader.slice(7).trim();
  if (!idToken || idToken.split('.').length !== 3) {
    return { ok: false, status: 401, error: 'Malformed authentication token.' };
  }

  if (!FIREBASE_CONFIG.projectId) {
    return { ok: false, status: 500, error: 'Firebase project configuration is unavailable.' };
  }

  try {
    const [headerB64, payloadB64, sigB64] = idToken.split('.');
    const header = JSON.parse(base64UrlDecodeToBuffer(headerB64).toString('utf-8'));
    const payload = JSON.parse(base64UrlDecodeToBuffer(payloadB64).toString('utf-8'));

    if (header.alg !== 'RS256' || !header.kid) {
      return { ok: false, status: 401, error: 'Invalid JWT signature algorithm or key ID.' };
    }

    const certs = await getFirebasePublicCerts();
    const pemCert = certs[header.kid];
    if (!pemCert) {
      return { ok: false, status: 401, error: 'Unknown Firebase signing certificate.' };
    }

    const verifier = crypto.createVerify('RSA-SHA256');
    verifier.update(`${headerB64}.${payloadB64}`);
    verifier.end();
    const signatureBuf = base64UrlDecodeToBuffer(sigB64);
    const sigValid = verifier.verify(pemCert, signatureBuf);
    if (!sigValid) {
      return { ok: false, status: 401, error: 'Invalid Firebase ID token signature.' };
    }

    const nowSec = Math.floor(Date.now() / 1000);
    const expectedIssuer = `https://securetoken.google.com/${FIREBASE_CONFIG.projectId}`;
    if (
      payload.aud !== FIREBASE_CONFIG.projectId ||
      payload.iss !== expectedIssuer ||
      typeof payload.sub !== 'string' ||
      payload.sub.length === 0 ||
      typeof payload.exp !== 'number' ||
      payload.exp <= nowSec ||
      typeof payload.iat !== 'number' ||
      payload.iat > nowSec + 60
    ) {
      return { ok: false, status: 401, error: 'Firebase ID token claims failed validation or token expired.' };
    }

    // Confirm live account state (disabled / live emailVerified) via Firebase Identity Toolkit
    let liveEmail = String(payload.email || '').toLowerCase().trim();
    let liveVerified = payload.email_verified === true;
    if (FIREBASE_CONFIG.apiKey) {
      const lookupResp = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_CONFIG.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken }),
        }
      );
      if (!lookupResp.ok) {
        return { ok: false, status: 401, error: 'Firebase session could not be verified.' };
      }
      const lookupData = (await lookupResp.json()) as {
        users?: Array<{ localId?: string; email?: string; emailVerified?: boolean; disabled?: boolean }>;
      };
      const account = lookupData.users?.[0];
      if (!account || account.localId !== payload.sub) {
        return { ok: false, status: 401, error: 'Firebase user record not found.' };
      }
      if (account.disabled) {
        return { ok: false, status: 403, error: 'This account has been disabled.' };
      }
      liveEmail = String(account.email || liveEmail).toLowerCase().trim();
      liveVerified = account.emailVerified === true;
    }

    return {
      ok: true,
      user: {
        uid: payload.sub,
        email: liveEmail,
        emailVerified: liveVerified,
        idToken,
      },
    };
  } catch (err) {
    console.error('Firebase token verification error:', err);
    return { ok: false, status: 401, error: 'Failed to verify Firebase authentication token.' };
  }
}

async function fetchFirestoreUserFields(
  uid: string,
  idToken: string
): Promise<{ usernameLower?: string; role?: string; accountStatus?: string } | null> {
  if (!FIREBASE_CONFIG.projectId) return null;
  const dbId = encodeURIComponent(FIREBASE_CONFIG.firestoreDatabaseId || '(default)');
  const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_CONFIG.projectId}/databases/${dbId}/documents/users/${encodeURIComponent(uid)}`;
  try {
    const resp = await fetch(url, {
      headers: { Authorization: `Bearer ${idToken}` },
    });
    if (!resp.ok) return null;
    const docData = (await resp.json()) as {
      fields?: Record<string, { stringValue?: string }>;
    };
    return {
      usernameLower: docData.fields?.usernameLower?.stringValue?.toLowerCase().trim(),
      role: docData.fields?.role?.stringValue?.toLowerCase().trim(),
      accountStatus: docData.fields?.accountStatus?.stringValue?.toLowerCase().trim(),
    };
  } catch {
    return null;
  }
}

async function verifyStrictOwnerToken(req: express.Request): Promise<{
  ok: boolean;
  uid?: string;
  email?: string;
  usernameLower?: string;
  status?: number;
  error?: string;
}> {
  const tokenRes = await verifyFirebaseIdToken(req);
  if (!tokenRes.ok || !tokenRes.user) {
    return { ok: false, status: tokenRes.status || 401, error: tokenRes.error || 'Authentication required.' };
  }

  const { uid, email, emailVerified, idToken } = tokenRes.user;
  if (!emailVerified) {
    return { ok: false, status: 403, error: 'Verified email address required for Owner privileges.' };
  }
  if (email !== OWNER_EMAIL) {
    return { ok: false, status: 403, error: 'Unauthorized: Account email does not match Apex Syndicate Owner.' };
  }

  const userFields = await fetchFirestoreUserFields(uid, idToken);
  if (!userFields) {
    return { ok: false, status: 403, error: 'Citizen account record could not be verified on database.' };
  }
  if (userFields.accountStatus === 'suspended') {
    return { ok: false, status: 403, error: 'Account is suspended.' };
  }
  if (userFields.usernameLower !== OWNER_USERNAME) {
    return {
      ok: false,
      status: 403,
      error: `Unauthorized: Owner role requires both ${OWNER_EMAIL} AND username ${OWNER_USERNAME}.`,
    };
  }

  return { ok: true, uid, email, usernameLower: userFields.usernameLower };
}

// Real AI Chat Route for "My AI"
app.post('/api/ai-chat', async (req, res) => {
  const { message } = req.body;
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

const communitySubmissions: CommunitySubmission[] = [];

// GET all submissions (Owner verified via Firebase Bearer token sees all; citizens see own tickets)
app.get('/api/suggestions', async (req, res) => {
  const ownerCheck = req.headers.authorization ? await verifyStrictOwnerToken(req) : { ok: false };
  if (ownerCheck.ok) {
    return res.json({ submissions: communitySubmissions });
  }
  const username = req.query.username ? String(req.query.username).toLowerCase().trim() : '';
  if (username) {
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

// PATCH update status (Strictly Verified Owner only)
app.patch('/api/suggestions/:id', async (req, res) => {
  const ownerCheck = await verifyStrictOwnerToken(req);
  if (!ownerCheck.ok) {
    return res.status(ownerCheck.status || 403).json({ error: ownerCheck.error || 'Only verified Apex Syndicate Owner can review tickets.' });
  }

  const { id } = req.params;
  const { status } = req.body;
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

// =========================================================================
// SECURE BACKEND REGISTRATION VALIDATION, OWNER PROVISIONING & ACCESS GATES
// =========================================================================

// 1. Server-side registration validation (mirrors frontend validation + checks Firestore username collision)
app.post('/api/auth/validate-registration', async (req, res) => {
  const { email, username, dateOfBirth, password } = req.body || {};

  const cleanEmail = String(email || '').trim().toLowerCase();
  const rawUser = String(username || '').trim();
  const cleanUser = rawUser.toLowerCase();
  const dob = String(dateOfBirth || '').trim();
  const pwd = String(password || '');

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!cleanEmail || cleanEmail.length > 120 || !emailRegex.test(cleanEmail)) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }

  const usernameRegex = /^[a-zA-Z0-9_.-]{3,24}$/;
  if (!usernameRegex.test(rawUser)) {
    return res.status(400).json({
      error: 'Username must be 3–24 characters using letters (A-Z, a-z), numbers (0-9), underscores (_), periods (.), or hyphens (-).',
    });
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
    return res.status(400).json({ error: 'Please provide a valid Date of Birth (YYYY-MM-DD).' });
  }
  const [yStr, mStr, dStr] = dob.split('-');
  const year = Number(yStr);
  const month = Number(mStr);
  const day = Number(dStr);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    return res.status(400).json({ error: 'Date of Birth is not a valid calendar date.' });
  }
  const now = new Date();
  const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  if (parsed.getTime() > todayUTC.getTime()) {
    return res.status(400).json({ error: 'Date of Birth cannot be in the future.' });
  }
  if (year < 1900) {
    return res.status(400).json({ error: 'Please enter a valid Date of Birth (year 1900 or later).' });
  }
  const minAgeDate = new Date(Date.UTC(now.getUTCFullYear() - 13, now.getUTCMonth(), now.getUTCDate()));
  if (parsed.getTime() > minAgeDate.getTime()) {
    return res.status(400).json({ error: 'Players must be at least 13 years old to create an online account.' });
  }

  if (pwd.length < 8 || pwd.length > 128 || !/[A-Z]/.test(pwd) || !/[a-z]/.test(pwd) || !/[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(pwd)) {
    return res.status(400).json({
      error: 'Password must be at least 8 characters and include uppercase, lowercase, and a number or symbol.',
    });
  }

  // Check Firestore usernames/{usernameLower} availability directly
  if (FIREBASE_CONFIG.projectId) {
    try {
      const dbId = encodeURIComponent(FIREBASE_CONFIG.firestoreDatabaseId || '(default)');
      const uResp = await fetch(
        `https://firestore.googleapis.com/v1/projects/${FIREBASE_CONFIG.projectId}/databases/${dbId}/documents/usernames/${encodeURIComponent(cleanUser)}`
      );
      if (uResp.ok) {
        return res.status(409).json({
          error: `Username "${rawUser}" is already taken! Please choose another.`,
        });
      }
    } catch {}
  }

  return res.json({ valid: true, normalizedEmail: cleanEmail, normalizedUsername: cleanUser });
});

// 2. Strict Server-Side Owner Provisioning Endpoint
// Only grants owner if cryptographic Firebase ID Token proves verified email kchiboy50@gmail.com AND Firestore users/{uid}.usernameLower === chiboy_52
app.post('/api/auth/verify-owner', async (req, res) => {
  const ownerCheck = await verifyStrictOwnerToken(req);
  if (!ownerCheck.ok) {
    return res.status(ownerCheck.status || 403).json({
      isOwner: false,
      role: 'citizen',
      error: ownerCheck.error || 'Owner verification denied.',
    });
  }

  return res.json({
    isOwner: true,
    role: 'owner',
    uid: ownerCheck.uid,
    email: ownerCheck.email,
    usernameLower: ownerCheck.usernameLower,
  });
});

// 3. Owner Access Verification Gate (Registry Inspection)
app.post('/api/owner/verify-access', async (req, res) => {
  const ownerCheck = await verifyStrictOwnerToken(req);
  if (!ownerCheck.ok) {
    return res.status(ownerCheck.status || 403).json({
      authorized: false,
      error: ownerCheck.error || 'Unauthorized: Apex Syndicate Owner verification failed.',
    });
  }
  return res.json({ authorized: true, uid: ownerCheck.uid, role: 'owner' });
});

// 4. Owner Suspend / Restore Authorization Gate
app.post('/api/owner/suspend-check', async (req, res) => {
  const ownerCheck = await verifyStrictOwnerToken(req);
  if (!ownerCheck.ok) {
    return res.status(ownerCheck.status || 403).json({
      authorized: false,
      error: ownerCheck.error || 'Unauthorized owner suspension attempt.',
    });
  }
  const targetUid = String(req.body?.targetUid || '').trim();
  if (!targetUid || targetUid === ownerCheck.uid) {
    return res.status(400).json({ error: 'Cannot suspend the active Owner master account.' });
  }
  return res.json({ authorized: true, actorUid: ownerCheck.uid, targetUid });
});

app.post('/api/owner/restore-check', async (req, res) => {
  const ownerCheck = await verifyStrictOwnerToken(req);
  if (!ownerCheck.ok) {
    return res.status(ownerCheck.status || 403).json({
      authorized: false,
      error: ownerCheck.error || 'Unauthorized owner restore attempt.',
    });
  }
  const targetUid = String(req.body?.targetUid || '').trim();
  if (!targetUid) {
    return res.status(400).json({ error: 'Target account UID is required.' });
  }
  return res.json({ authorized: true, actorUid: ownerCheck.uid, targetUid });
});

// 5. Legacy plaintext-password endpoints retired for security
app.post('/api/auth/register', (_req, res) => {
  return res.status(410).json({ error: 'Use Firebase Authentication + Firestore registration.' });
});
app.post('/api/auth/login', (_req, res) => {
  return res.status(410).json({ error: 'Use Firebase Authentication login.' });
});
app.get('/api/auth/all-accounts', (_req, res) => {
  return res.json({ success: true, mode: 'firebase-cloud', clusterOnline: true });
});
app.get('/api/auth/sync-all', (_req, res) => {
  return res.json({ success: true, mode: 'firebase-cloud', clusterOnline: true });
});
app.post('/api/auth/reset-all-accounts', async (req, res) => {
  const ownerCheck = await verifyStrictOwnerToken(req);
  if (!ownerCheck.ok) {
    return res.status(ownerCheck.status || 403).json({ error: 'Unauthorized.' });
  }
  citizensDB = {};
  saveCitizensDB({});
  return res.json({ success: true, count: 0 });
});
app.post('/api/auth/sync', async (req, res) => {
  const authRes = await verifyFirebaseIdToken(req);
  if (!authRes.ok || !authRes.user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }
  return res.json({ success: true, uid: authRes.user.uid });
});
app.get('/api/owner/players-registry', async (req, res) => {
  const ownerCheck = await verifyStrictOwnerToken(req);
  if (!ownerCheck.ok) {
    return res.status(ownerCheck.status || 403).json({ error: 'Unauthorized: Only verified game owner can inspect the Citizen Account Registry.' });
  }
  return res.json({ success: true, source: 'firestore', message: 'Use Firestore Citizen Account Registry.' });
});

// 6. OWNER GLOBAL REFRESH (Strictly Verified Owner via Bearer ID Token)
app.post('/api/owner/global-refresh', async (req, res) => {
  const ownerCheck = await verifyStrictOwnerToken(req);
  if (!ownerCheck.ok) {
    return res.status(ownerCheck.status || 403).json({
      error: ownerCheck.error || 'Unauthorized: Only verified game owner can perform global server sync.',
    });
  }

  globalRefreshCounter++;

  return res.json({
    success: true,
    message: 'Global sync complete! Refreshed Naija Life Central Servers & NEPA telemetry.',
    globalRefreshCounter,
    totalSnapUsers: Object.keys(snapchatUsersDB).length,
  });
});

// 7. GLOBAL SERVER STATUS (Pollable by all clients)
app.get('/api/global/status', (req, res) => {
  return res.json({
    globalRefreshCounter,
    activeTrack: currentBroadcastTrack,
    nepaGrid,
    serverTime: Date.now(),
  });
});

// 8. NEPA GRID STATUS & OWNER CONTROL ROOM
app.get('/api/nepa/grid', (req, res) => {
  return res.json({ success: true, grid: nepaGrid });
});

app.post('/api/nepa/toggle', async (req, res) => {
  const ownerCheck = await verifyStrictOwnerToken(req);
  if (!ownerCheck.ok) {
    return res.status(ownerCheck.status || 403).json({
      error: ownerCheck.error || 'Unauthorized: Only verified game owner can control the NEPA National Power Grid.',
    });
  }

  const { stateId, lightOn, masterBlackout, masterPowerOn } = req.body;

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

app.post('/api/broadcast/music', async (req, res) => {
  const ownerCheck = await verifyStrictOwnerToken(req);
  if (!ownerCheck.ok) {
    return res.status(ownerCheck.status || 403).json({ error: ownerCheck.error || 'Unauthorized: Only the verified game owner can broadcast music.' });
  }
  const { title, audioData } = req.body;
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
    uploadedBy: ownerCheck.usernameLower || 'chiboy_52',
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

app.delete('/api/broadcast/music', async (req, res) => {
  const ownerCheck = await verifyStrictOwnerToken(req);
  if (!ownerCheck.ok) {
    return res.status(ownerCheck.status || 403).json({ error: ownerCheck.error || 'Unauthorized: Only the verified game owner can modify broadcast.' });
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
