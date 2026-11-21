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

app.post('/api/owner/delete-check', async (req, res) => {
  const ownerCheck = await verifyStrictOwnerToken(req);
  if (!ownerCheck.ok) {
    return res.status(ownerCheck.status || 403).json({
      authorized: false,
      error: ownerCheck.error || 'Unauthorized owner delete attempt.',
    });
  }
  const mode = String(req.body?.mode || 'single');
  const targetUid = String(req.body?.targetUid || '').trim();
  if (mode !== 'purge-non-owner' && mode !== 'wipe-all-progress') {
    if (!targetUid || targetUid === ownerCheck.uid) {
      return res.status(400).json({ error: 'Cannot delete the active Apex Syndicate Owner master account.' });
    }
  }
  return res.json({ authorized: true, actorUid: ownerCheck.uid, mode, targetUid: targetUid || null });
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
  snapchatUsersDB = {};
  saveSnapUsers({});
  snapMessagesDB = [];
  saveSnapMessages([]);
  communitySubmissions.length = 0;
  globalRefreshCounter++;
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

// =========================================================================
// 7. AUTHORITATIVE SERVER ECONOMY, UNIQUE ACCOUNT IDS, TRANSFERS & IMMIGRATION
// =========================================================================
const ECONOMY_FILE = path.resolve(DB_DIR, 'economy_state.json');
const CAD_TO_NGN_RATE = 960.54;
const NGN_TO_CAD_SPREAD = 0.992;
const CANADA_VISA_FEE_NGN = 2500000;
const SEXTILLION_999_SERVER = 9.99e23;

interface ServerEconomyAccount {
  uid: string;
  username: string;
  usernameLower: string;
  walletAccountNumber: string;
  isOwner: boolean;
  bankNaira: number;
  cashNaira: number;
  bankCAD: number;
  savingsBalanceNGN: number;
  savingsCAD: number;
  loanBalanceNGN: number;
  spawnStateId: string;
  lastLocationStateId: string;
  currentCountry: string;
  migratedToNigeriaOriginalStateV1: boolean;
  immigrationStatus: string;
  ownedClothing: string[];
  ownedHairstyles: string[];
  furnitureBought: string[];
  ownedDocuments: any[];
  receipts: any[];
  alerts: any[];
  lastBusinessCollectByDate: Record<string, string>;
  updatedAt: string;
}

interface EconomyStore {
  accountsByUid: Record<string, ServerEconomyAccount>;
  uidByUsername: Record<string, string>;
  uidByAccountNumber: Record<string, string>;
  processedRequestIds: Record<string, { createdAt: number; response: any }>;
}

function loadEconomyStore(): EconomyStore {
  try {
    if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
    if (fs.existsSync(ECONOMY_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(ECONOMY_FILE, 'utf-8'));
      return {
        accountsByUid: parsed.accountsByUid || {},
        uidByUsername: parsed.uidByUsername || {},
        uidByAccountNumber: parsed.uidByAccountNumber || {},
        processedRequestIds: parsed.processedRequestIds || {},
      };
    }
  } catch (err) {
    console.error('Error loading economy store:', err);
  }
  return {
    accountsByUid: {},
    uidByUsername: {},
    uidByAccountNumber: {},
    processedRequestIds: {},
  };
}

let economyStore: EconomyStore = loadEconomyStore();

function saveEconomyStore(): void {
  try {
    if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
    // Trim idempotency cache if above 2500 entries
    const reqKeys = Object.keys(economyStore.processedRequestIds);
    if (reqKeys.length > 2500) {
      reqKeys.sort(
        (a, b) =>
          (economyStore.processedRequestIds[a]?.createdAt || 0) -
          (economyStore.processedRequestIds[b]?.createdAt || 0)
      );
      for (const k of reqKeys.slice(0, reqKeys.length - 1500)) {
        delete economyStore.processedRequestIds[k];
      }
    }
    const tmpFile = `${ECONOMY_FILE}.tmp`;
    fs.writeFileSync(tmpFile, JSON.stringify(economyStore, null, 2), 'utf-8');
    fs.renameSync(tmpFile, ECONOMY_FILE);
  } catch (err) {
    console.error('Error saving economy store:', err);
  }
}

function generateServerAccountNumber(seed: string, existingMap: Record<string, string>): string {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  let attempt = 0;
  while (attempt < 50) {
    const val = (Math.abs(hash + attempt * 7919) % 90000000) + 10000000;
    const candidate = `30${val}`;
    if (!existingMap[candidate]) return candidate;
    attempt++;
  }
  return `30${Math.floor(10000000 + Math.random() * 89999999)}`;
}

function normalizeOwnerBalances(acc: ServerEconomyAccount): void {
  if (acc.isOwner) {
    acc.cashNaira = SEXTILLION_999_SERVER;
    acc.bankNaira = SEXTILLION_999_SERVER;
    acc.bankCAD = SEXTILLION_999_SERVER;
    acc.savingsCAD = SEXTILLION_999_SERVER;
    acc.loanBalanceNGN = 0;
  }
}

function mirrorAccountToCitizensDB(acc: ServerEconomyAccount): void {
  if (!acc.usernameLower) return;
  const existing = citizensDB[acc.usernameLower]?.profile || {};
  citizensDB[acc.usernameLower] = {
    profile: {
      ...existing,
      uid: acc.uid,
      username: acc.username,
      walletAccountNumber: acc.walletAccountNumber,
      cashNaira: acc.cashNaira,
      bankNaira: acc.bankNaira,
      bankCAD: acc.bankCAD,
      savingsBalanceNGN: acc.savingsBalanceNGN,
      savingsCAD: acc.savingsCAD,
      loanBalanceNGN: acc.loanBalanceNGN,
      spawnStateId: acc.spawnStateId,
      lastLocationStateId: acc.lastLocationStateId,
      currentCountry: acc.currentCountry,
      migratedToNigeriaOriginalStateV1: acc.migratedToNigeriaOriginalStateV1,
      immigrationStatus: acc.immigrationStatus,
      ownedDocuments: acc.ownedDocuments,
      receipts: acc.receipts.slice(0, 200),
      alerts: acc.alerts.slice(0, 100),
    },
    updatedAt: new Date().toISOString(),
  };
}

app.post('/api/economy/sync-account', async (req, res) => {
  const tokenRes = await verifyFirebaseIdToken(req);
  if (!tokenRes.ok || !tokenRes.user) {
    return res.status(tokenRes.status || 401).json({ error: tokenRes.error || 'Authentication required.' });
  }
  const { uid, email, emailVerified, idToken } = tokenRes.user;
  const userDoc = await fetchFirestoreUserFields(uid, idToken);
  const clientProfile = (req.body?.profile || {}) as Record<string, any>;
  const usernameRaw = String(clientProfile.username || userDoc?.usernameLower || uid.slice(0, 12)).trim();
  const usernameLower = usernameRaw.toLowerCase();
  const isOwner =
    emailVerified &&
    email === OWNER_EMAIL &&
    (userDoc?.usernameLower === OWNER_USERNAME || usernameLower === OWNER_USERNAME);

  let acc = economyStore.accountsByUid[uid];
  if (!acc) {
    const legacyCitizen = citizensDB[usernameLower]?.profile;
    const acctNum =
      String(clientProfile.walletAccountNumber || legacyCitizen?.walletAccountNumber || '').trim() ||
      generateServerAccountNumber(uid, economyStore.uidByAccountNumber);
    const spawnState = String(clientProfile.spawnStateId || legacyCitizen?.spawnStateId || 'lagos');
    acc = {
      uid,
      username: usernameRaw,
      usernameLower,
      walletAccountNumber: acctNum,
      isOwner,
      bankNaira: Number(legacyCitizen?.bankNaira ?? clientProfile.bankNaira ?? 100000),
      cashNaira: Number(legacyCitizen?.cashNaira ?? clientProfile.cashNaira ?? 50000),
      bankCAD: Number(legacyCitizen?.bankCAD ?? clientProfile.bankCAD ?? 0),
      savingsBalanceNGN: Number(legacyCitizen?.savingsBalanceNGN ?? clientProfile.savingsBalanceNGN ?? 0),
      savingsCAD: Number(legacyCitizen?.savingsCAD ?? clientProfile.savingsCAD ?? 0),
      loanBalanceNGN: Number(legacyCitizen?.loanBalanceNGN ?? clientProfile.loanBalanceNGN ?? 0),
      spawnStateId: spawnState,
      lastLocationStateId: String(clientProfile.lastLocationStateId || legacyCitizen?.lastLocationStateId || spawnState),
      currentCountry: String(clientProfile.currentCountry || legacyCitizen?.currentCountry || 'nigeria').toLowerCase(),
      migratedToNigeriaOriginalStateV1: Boolean(clientProfile.migratedToNigeriaOriginalStateV1),
      immigrationStatus: String(clientProfile.immigrationStatus || 'NIGERIA_RESIDENT'),
      ownedClothing: Array.isArray(clientProfile.ownedClothing) ? clientProfile.ownedClothing : [],
      ownedHairstyles: Array.isArray(clientProfile.ownedHairstyles) ? clientProfile.ownedHairstyles : [],
      furnitureBought: Array.isArray(clientProfile.furnitureBought) ? clientProfile.furnitureBought : [],
      ownedDocuments: Array.isArray(clientProfile.ownedDocuments) ? clientProfile.ownedDocuments : [],
      receipts: Array.isArray(clientProfile.receipts) ? clientProfile.receipts.slice(0, 200) : [],
      alerts: Array.isArray(clientProfile.alerts) ? clientProfile.alerts.slice(0, 100) : [],
      lastBusinessCollectByDate: {},
      updatedAt: new Date().toISOString(),
    };
  } else {
    acc.isOwner = isOwner;
    if (usernameRaw) {
      acc.username = usernameRaw;
      acc.usernameLower = usernameLower;
    }
    // Reconcile any newly minted local starter grants or documents if server had zero
    if (Array.isArray(clientProfile.ownedClothing) && clientProfile.ownedClothing.length > acc.ownedClothing.length) {
      acc.ownedClothing = Array.from(new Set([...acc.ownedClothing, ...clientProfile.ownedClothing]));
    }
    if (Array.isArray(clientProfile.ownedHairstyles) && clientProfile.ownedHairstyles.length > acc.ownedHairstyles.length) {
      acc.ownedHairstyles = Array.from(new Set([...acc.ownedHairstyles, ...clientProfile.ownedHairstyles]));
    }
    if (Array.isArray(clientProfile.furnitureBought) && clientProfile.furnitureBought.length > acc.furnitureBought.length) {
      acc.furnitureBought = Array.from(new Set([...acc.furnitureBought, ...clientProfile.furnitureBought]));
    }
    if (clientProfile.lastLocationStateId && acc.migratedToNigeriaOriginalStateV1) {
      acc.lastLocationStateId = String(clientProfile.lastLocationStateId);
      acc.currentCountry = String(clientProfile.currentCountry || (acc.lastLocationStateId === 'canada' ? 'canada' : 'nigeria')).toLowerCase();
    }
  }

  // One-Time Existing-Player Restoration Migration:
  // If user was placed abroad (uk, usa, germany, uae, ghana, canada) before this update and hasn't migrated yet,
  // return them cleanly to Nigeria in their original spawnStateId while keeping ALL money, houses, inventory, businesses & docs.
  let restoredToNigeria = false;
  if (!acc.migratedToNigeriaOriginalStateV1) {
    const loc = String(acc.lastLocationStateId || '').toLowerCase();
    const country = String(acc.currentCountry || '').toLowerCase();
    const legacyAbroadStates = new Set(['uk', 'usa', 'germany', 'uae', 'ghana', 'canada', 'london', 'toronto', 'dubai', 'berlin', 'new_york']);
    if (legacyAbroadStates.has(loc) || (country && country !== 'nigeria')) {
      acc.lastLocationStateId = acc.spawnStateId || 'lagos';
      acc.currentCountry = 'nigeria';
      restoredToNigeria = true;
    }
    acc.migratedToNigeriaOriginalStateV1 = true;
  }

  normalizeOwnerBalances(acc);
  acc.updatedAt = new Date().toISOString();

  economyStore.accountsByUid[uid] = acc;
  economyStore.uidByUsername[acc.usernameLower] = uid;
  economyStore.uidByAccountNumber[acc.walletAccountNumber] = uid;
  mirrorAccountToCitizensDB(acc);
  saveEconomyStore();
  saveCitizensDB(citizensDB);

  return res.json({
    success: true,
    restoredToNigeria,
    account: acc,
  });
});

// Authentic Server-Authoritative Citizen-to-Citizen Transfers (supports @username OR 10-digit Account ID)
app.post('/api/bank/transfer', async (req, res) => {
  const tokenRes = await verifyFirebaseIdToken(req);
  const {
    requestId,
    senderUsername,
    recipientIdentifier,
    recipientUsername,
    amount,
    currency = 'NGN',
    note = 'Naija Pay Transfer',
  } = req.body || {};

  const reqKey = requestId ? String(requestId).trim() : '';
  if (reqKey && economyStore.processedRequestIds[reqKey]) {
    return res.json({
      ...economyStore.processedRequestIds[reqKey].response,
      duplicate: true,
    });
  }

  const targetInput = String(recipientIdentifier || recipientUsername || '').replace(/^@/, '').trim();
  const numAmount = Math.round(Number(amount));
  if (!targetInput || !Number.isFinite(numAmount) || numAmount <= 0) {
    return res.status(400).json({ error: 'Valid recipient (@username or Account ID) and positive amount are required.' });
  }

  let senderAcc: ServerEconomyAccount | undefined;
  if (tokenRes.ok && tokenRes.user) {
    senderAcc = economyStore.accountsByUid[tokenRes.user.uid];
  }
  if (!senderAcc && senderUsername) {
    const cleanSender = String(senderUsername).toLowerCase().replace(/^@/, '').trim();
    const mappedUid = economyStore.uidByUsername[cleanSender];
    if (mappedUid) senderAcc = economyStore.accountsByUid[mappedUid];
  }

  if (!senderAcc) {
    return res.status(401).json({ error: 'Authenticated sender account not initialized yet. Please retry.' });
  }
  if (tokenRes.ok && tokenRes.user && senderAcc.uid !== tokenRes.user.uid) {
    return res.status(403).json({ error: 'Sender identity mismatch.' });
  }

  const targetLower = targetInput.toLowerCase();
  const targetUid =
    economyStore.uidByAccountNumber[targetInput] ||
    economyStore.uidByUsername[targetLower];

  let recipientAcc = targetUid ? economyStore.accountsByUid[targetUid] : undefined;

  // Fallback: check legacy citizensDB or Firestore username index to hydrate recipient record
  if (!recipientAcc) {
    const legacyRec = citizensDB[targetLower];
    if (legacyRec?.profile) {
      const recUid = String(legacyRec.profile.uid || `legacy_${targetLower}`);
      const acctNum =
        String(legacyRec.profile.walletAccountNumber || '') ||
        generateServerAccountNumber(recUid, economyStore.uidByAccountNumber);
      recipientAcc = {
        uid: recUid,
        username: String(legacyRec.profile.username || targetLower),
        usernameLower: targetLower,
        walletAccountNumber: acctNum,
        isOwner: false,
        bankNaira: Number(legacyRec.profile.bankNaira ?? 100000),
        cashNaira: Number(legacyRec.profile.cashNaira ?? 0),
        bankCAD: Number(legacyRec.profile.bankCAD ?? 0),
        savingsBalanceNGN: Number(legacyRec.profile.savingsBalanceNGN ?? 0),
        savingsCAD: Number(legacyRec.profile.savingsCAD ?? 0),
        loanBalanceNGN: Number(legacyRec.profile.loanBalanceNGN ?? 0),
        spawnStateId: String(legacyRec.profile.spawnStateId || 'lagos'),
        lastLocationStateId: String(legacyRec.profile.lastLocationStateId || 'lagos'),
        currentCountry: String(legacyRec.profile.currentCountry || 'nigeria'),
        migratedToNigeriaOriginalStateV1: true,
        immigrationStatus: 'NIGERIA_RESIDENT',
        ownedClothing: [],
        ownedHairstyles: [],
        furnitureBought: [],
        ownedDocuments: [],
        receipts: Array.isArray(legacyRec.profile.receipts) ? legacyRec.profile.receipts : [],
        alerts: Array.isArray(legacyRec.profile.alerts) ? legacyRec.profile.alerts : [],
        lastBusinessCollectByDate: {},
        updatedAt: new Date().toISOString(),
      };
      economyStore.accountsByUid[recUid] = recipientAcc;
      economyStore.uidByUsername[targetLower] = recUid;
      economyStore.uidByAccountNumber[acctNum] = recUid;
    } else if (FIREBASE_CONFIG.projectId) {
      try {
        const dbId = encodeURIComponent(FIREBASE_CONFIG.firestoreDatabaseId || '(default)');
        const uResp = await fetch(
          `https://firestore.googleapis.com/v1/projects/${FIREBASE_CONFIG.projectId}/databases/${dbId}/documents/usernames/${encodeURIComponent(targetLower)}`
        );
        if (uResp.ok) {
          const uJson = (await uResp.json()) as { fields?: { uid?: { stringValue?: string }; username?: { stringValue?: string } } };
          const fUid = uJson.fields?.uid?.stringValue;
          const fUsername = uJson.fields?.username?.stringValue || targetInput;
          if (fUid) {
            const acctNum = generateServerAccountNumber(fUid, economyStore.uidByAccountNumber);
            recipientAcc = {
              uid: fUid,
              username: fUsername,
              usernameLower: targetLower,
              walletAccountNumber: acctNum,
              isOwner: false,
              bankNaira: 100000,
              cashNaira: 50000,
              bankCAD: 0,
              savingsBalanceNGN: 0,
              savingsCAD: 0,
              loanBalanceNGN: 0,
              spawnStateId: 'lagos',
              lastLocationStateId: 'lagos',
              currentCountry: 'nigeria',
              migratedToNigeriaOriginalStateV1: true,
              immigrationStatus: 'NIGERIA_RESIDENT',
              ownedClothing: [],
              ownedHairstyles: [],
              furnitureBought: [],
              ownedDocuments: [],
              receipts: [],
              alerts: [],
              lastBusinessCollectByDate: {},
              updatedAt: new Date().toISOString(),
            };
            economyStore.accountsByUid[fUid] = recipientAcc;
            economyStore.uidByUsername[targetLower] = fUid;
            economyStore.uidByAccountNumber[acctNum] = fUid;
          }
        }
      } catch {}
    }
  }

  if (!recipientAcc) {
    return res.status(404).json({
      error: `Account "${targetInput}" not found on Naija Life Banking Network. Verify the @username or 10-digit Account Number.`,
    });
  }

  if (recipientAcc.uid === senderAcc.uid) {
    return res.status(400).json({ error: 'Cannot transfer funds to your own account.' });
  }

  const transferCurrency = currency === 'CAD' ? 'CAD' : 'NGN';
  if (transferCurrency === 'CAD') {
    if (!senderAcc.isOwner && senderAcc.bankCAD < numAmount) {
      return res.status(400).json({ error: `Insufficient CAD balance ($${senderAcc.bankCAD.toLocaleString()} CAD available).` });
    }
    if (!senderAcc.isOwner) senderAcc.bankCAD -= numAmount;
    if (!recipientAcc.isOwner) recipientAcc.bankCAD += numAmount;
  } else {
    if (!senderAcc.isOwner && senderAcc.bankNaira < numAmount) {
      return res.status(400).json({ error: `Insufficient NGN balance (₦${senderAcc.bankNaira.toLocaleString()} available).` });
    }
    if (!senderAcc.isOwner) senderAcc.bankNaira -= numAmount;
    if (!recipientAcc.isOwner) recipientAcc.bankNaira += numAmount;
  }

  normalizeOwnerBalances(senderAcc);
  normalizeOwnerBalances(recipientAcc);

  const txId = `NLTX_${Date.now()}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  const nowStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const debitReceipt = {
    id: txId,
    title: `Transfer to @${recipientAcc.username} (${recipientAcc.walletAccountNumber})`,
    category: 'transfer',
    amount: numAmount,
    date: nowStr,
    type: 'debit',
    currency: transferCurrency,
    recipientOrSender: `${recipientAcc.username} • ${recipientAcc.walletAccountNumber}`,
    referenceNo: txId,
  };
  const creditReceipt = {
    id: `NLRX_${Date.now()}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
    title: `Transfer from @${senderAcc.username} (${note})`,
    category: 'transfer',
    amount: numAmount,
    date: nowStr,
    type: 'credit',
    currency: transferCurrency,
    recipientOrSender: `${senderAcc.username} • ${senderAcc.walletAccountNumber}`,
    referenceNo: txId,
  };

  senderAcc.receipts = [debitReceipt, ...senderAcc.receipts].slice(0, 200);
  recipientAcc.receipts = [creditReceipt, ...recipientAcc.receipts].slice(0, 200);
  recipientAcc.alerts = [
    {
      id: `ALT_${Date.now()}`,
      text: `CREDIT ALERT: Received ${transferCurrency === 'CAD' ? '$' : '₦'}${numAmount.toLocaleString()} ${transferCurrency} from @${senderAcc.username}. Ref: ${txId}`,
      amount: numAmount,
      date: nowStr,
      type: 'credit',
      senderOrRecipient: senderAcc.username,
    },
    ...recipientAcc.alerts,
  ].slice(0, 100);

  senderAcc.updatedAt = new Date().toISOString();
  recipientAcc.updatedAt = new Date().toISOString();

  mirrorAccountToCitizensDB(senderAcc);
  mirrorAccountToCitizensDB(recipientAcc);

  const responsePayload = {
    success: true,
    referenceNo: txId,
    message: `Transferred ${transferCurrency === 'CAD' ? '$' : '₦'}${numAmount.toLocaleString()} ${transferCurrency} to @${recipientAcc.username} (${recipientAcc.walletAccountNumber}).`,
    receipt: debitReceipt,
    senderProfile: senderAcc,
  };

  if (reqKey) {
    economyStore.processedRequestIds[reqKey] = { createdAt: Date.now(), response: responsePayload };
  }

  globalRefreshCounter++;
  saveEconomyStore();
  saveCitizensDB(citizensDB);

  return res.json(responsePayload);
});

app.post('/api/economy/fx-exchange', async (req, res) => {
  const tokenRes = await verifyFirebaseIdToken(req);
  if (!tokenRes.ok || !tokenRes.user) {
    return res.status(tokenRes.status || 401).json({ error: tokenRes.error || 'Authentication required.' });
  }
  const { requestId, direction, amount } = req.body || {};
  const reqKey = requestId ? String(requestId).trim() : '';
  if (reqKey && economyStore.processedRequestIds[reqKey]) {
    return res.json({ ...economyStore.processedRequestIds[reqKey].response, duplicate: true });
  }

  const acc = economyStore.accountsByUid[tokenRes.user.uid];
  if (!acc) {
    return res.status(404).json({ error: 'Account not initialized.' });
  }

  const numAmount = Number(amount);
  if (!Number.isFinite(numAmount) || numAmount <= 0) {
    return res.status(400).json({ error: 'Positive exchange amount required.' });
  }

  const nowStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const refId = `FX_${Date.now()}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  let message = '';
  let converted = 0;

  if (direction === 'CAD_TO_NGN') {
    if (!acc.isOwner && acc.bankCAD < numAmount) {
      return res.status(400).json({ error: `Insufficient CAD funds ($${acc.bankCAD.toLocaleString()} CAD available).` });
    }
    converted = Math.round(numAmount * CAD_TO_NGN_RATE);
    if (!acc.isOwner) {
      acc.bankCAD -= numAmount;
      acc.bankNaira += converted;
    }
    message = `Exchanged $${numAmount.toLocaleString()} CAD -> ₦${converted.toLocaleString()} NGN`;
    acc.receipts = [
      {
        id: refId,
        title: `FX Conversion: CAD -> NGN`,
        category: 'transfer',
        amount: converted,
        date: nowStr,
        type: 'credit',
        currency: 'NGN',
        recipientOrSender: 'CBN / Royal Bank FX Desk',
        referenceNo: refId,
      },
      ...acc.receipts,
    ].slice(0, 200);
  } else {
    if (!acc.isOwner && acc.bankNaira < numAmount) {
      return res.status(400).json({ error: `Insufficient NGN funds (₦${acc.bankNaira.toLocaleString()} available).` });
    }
    converted = Number(((numAmount / CAD_TO_NGN_RATE) * NGN_TO_CAD_SPREAD).toFixed(2));
    if (!acc.isOwner) {
      acc.bankNaira -= numAmount;
      acc.bankCAD += converted;
    }
    message = `Exchanged ₦${numAmount.toLocaleString()} NGN -> $${converted.toLocaleString()} CAD`;
    acc.receipts = [
      {
        id: refId,
        title: `FX Conversion: NGN -> CAD ($${converted.toLocaleString()})`,
        category: 'transfer',
        amount: numAmount,
        date: nowStr,
        type: 'debit',
        currency: 'NGN',
        recipientOrSender: 'CBN / Royal Bank FX Desk',
        referenceNo: refId,
      },
      ...acc.receipts,
    ].slice(0, 200);
  }

  normalizeOwnerBalances(acc);
  acc.updatedAt = new Date().toISOString();
  mirrorAccountToCitizensDB(acc);
  const resp = { success: true, converted, message, account: acc, referenceNo: refId };
  if (reqKey) economyStore.processedRequestIds[reqKey] = { createdAt: Date.now(), response: resp };
  saveEconomyStore();
  saveCitizensDB(citizensDB);
  return res.json(resp);
});

app.post('/api/economy/purchase', async (req, res) => {
  const tokenRes = await verifyFirebaseIdToken(req);
  if (!tokenRes.ok || !tokenRes.user) {
    return res.status(tokenRes.status || 401).json({ error: tokenRes.error || 'Authentication required.' });
  }
  const { requestId, itemId, title, category, amountNGN, unlockKey, unlockType } = req.body || {};
  const reqKey = requestId ? String(requestId).trim() : '';
  if (reqKey && economyStore.processedRequestIds[reqKey]) {
    return res.json({ ...economyStore.processedRequestIds[reqKey].response, duplicate: true });
  }

  const acc = economyStore.accountsByUid[tokenRes.user.uid];
  if (!acc) return res.status(404).json({ error: 'Account not initialized.' });

  const cost = Math.max(0, Math.round(Number(amountNGN || 0)));
  if (!acc.isOwner && acc.bankNaira + acc.cashNaira < cost) {
    return res.status(400).json({ error: `Insufficient funds! Need ₦${cost.toLocaleString()}.` });
  }

  if (!acc.isOwner && cost > 0) {
    if (acc.bankNaira >= cost) {
      acc.bankNaira -= cost;
    } else {
      const rem = cost - acc.bankNaira;
      acc.bankNaira = 0;
      acc.cashNaira = Math.max(0, acc.cashNaira - rem);
    }
  }

  if (unlockType === 'clothing' && unlockKey && !acc.ownedClothing.includes(unlockKey)) {
    acc.ownedClothing.push(unlockKey);
  } else if (unlockType === 'hairstyle' && unlockKey && !acc.ownedHairstyles.includes(unlockKey)) {
    acc.ownedHairstyles.push(unlockKey);
  } else if (unlockType === 'furniture' && unlockKey && !acc.furnitureBought.includes(unlockKey)) {
    acc.furnitureBought.push(unlockKey);
  }

  const refId = `BUY_${Date.now()}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  const nowStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const receipt = {
    id: refId,
    title: String(title || itemId || 'Merchant Purchase'),
    category: String(category || 'general'),
    amount: cost,
    date: nowStr,
    type: 'debit',
    currency: 'NGN',
    recipientOrSender: 'Naija Life Merchant Network',
    referenceNo: refId,
  };
  if (cost > 0) {
    acc.receipts = [receipt, ...acc.receipts].slice(0, 200);
  }
  normalizeOwnerBalances(acc);
  acc.updatedAt = new Date().toISOString();
  mirrorAccountToCitizensDB(acc);

  const resp = { success: true, receipt, account: acc };
  if (reqKey) economyStore.processedRequestIds[reqKey] = { createdAt: Date.now(), response: resp };
  saveEconomyStore();
  saveCitizensDB(citizensDB);
  return res.json(resp);
});

app.post('/api/economy/business-collect', async (req, res) => {
  const tokenRes = await verifyFirebaseIdToken(req);
  if (!tokenRes.ok || !tokenRes.user) {
    return res.status(tokenRes.status || 401).json({ error: tokenRes.error || 'Authentication required.' });
  }
  const { requestId, businessId, businessName, dailyRevenueNGN } = req.body || {};
  const reqKey = requestId ? String(requestId).trim() : '';
  if (reqKey && economyStore.processedRequestIds[reqKey]) {
    return res.json({ ...economyStore.processedRequestIds[reqKey].response, duplicate: true });
  }

  const acc = economyStore.accountsByUid[tokenRes.user.uid];
  if (!acc) return res.status(404).json({ error: 'Account not initialized.' });

  const bizKey = String(businessId || '').trim();
  const todayKey = new Date().toISOString().slice(0, 10);
  if (!bizKey || !Number.isFinite(Number(dailyRevenueNGN)) || Number(dailyRevenueNGN) <= 0) {
    return res.status(400).json({ error: 'Invalid business payout request.' });
  }
  if (!acc.isOwner && acc.lastBusinessCollectByDate[bizKey] === todayKey) {
    return res.status(429).json({ error: 'Daily revenue for this venture has already been settled today.' });
  }

  const payout = Math.round(Number(dailyRevenueNGN));
  if (!acc.isOwner) {
    acc.bankNaira += payout;
  }
  acc.lastBusinessCollectByDate[bizKey] = todayKey;

  const refId = `BIZ_${Date.now()}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  const nowStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const receipt = {
    id: refId,
    title: `Business Dividend: ${String(businessName || bizKey)}`,
    category: 'business',
    amount: payout,
    date: nowStr,
    type: 'credit',
    currency: 'NGN',
    recipientOrSender: 'Corporate Treasury Settlement',
    referenceNo: refId,
  };
  acc.receipts = [receipt, ...acc.receipts].slice(0, 200);
  normalizeOwnerBalances(acc);
  acc.updatedAt = new Date().toISOString();
  mirrorAccountToCitizensDB(acc);

  const resp = { success: true, payout, receipt, account: acc, collectedDate: todayKey };
  if (reqKey) economyStore.processedRequestIds[reqKey] = { createdAt: Date.now(), response: resp };
  saveEconomyStore();
  saveCitizensDB(citizensDB);
  return res.json(resp);
});

// Instant Canada Visa & Nigerian Passport Processing Endpoint (0 wait timer)
app.post('/api/immigration/apply-canada', async (req, res) => {
  const tokenRes = await verifyFirebaseIdToken(req);
  if (!tokenRes.ok || !tokenRes.user) {
    return res.status(tokenRes.status || 401).json({ error: tokenRes.error || 'Authentication required.' });
  }
  const {
    requestId,
    fullName,
    age,
    currentNigerianState,
    travelPurpose,
    intendedDuration,
    employmentStatus,
    financialInfo,
  } = req.body || {};

  const reqKey = requestId ? String(requestId).trim() : '';
  if (reqKey && economyStore.processedRequestIds[reqKey]) {
    return res.json({ ...economyStore.processedRequestIds[reqKey].response, duplicate: true });
  }

  const acc = economyStore.accountsByUid[tokenRes.user.uid];
  if (!acc) return res.status(404).json({ error: 'Account not initialized.' });

  const cleanName = String(fullName || '').trim();
  const numAge = Number(age);
  if (cleanName.length < 3) {
    return res.status(400).json({ error: 'Full Name (at least 3 characters) is required.' });
  }
  if (!Number.isFinite(numAge) || numAge < 16 || numAge > 110) {
    return res.status(400).json({ error: 'Valid applicant age (16 - 110) is required.' });
  }
  if (!currentNigerianState || !travelPurpose || !intendedDuration || !employmentStatus || !financialInfo) {
    return res.status(400).json({ error: 'All Canada Visa application fields must be completed.' });
  }

  if (!acc.isOwner && acc.bankNaira + acc.cashNaira < CANADA_VISA_FEE_NGN) {
    return res.status(400).json({
      error: `Insufficient funds for Canada Visa Processing Fee (₦${CANADA_VISA_FEE_NGN.toLocaleString()}).`,
    });
  }

  if (!acc.isOwner) {
    if (acc.bankNaira >= CANADA_VISA_FEE_NGN) {
      acc.bankNaira -= CANADA_VISA_FEE_NGN;
    } else {
      const rem = CANADA_VISA_FEE_NGN - acc.bankNaira;
      acc.bankNaira = 0;
      acc.cashNaira = Math.max(0, acc.cashNaira - rem);
    }
  }

  const nowStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const docsToAdd: any[] = [];
  const hasPassport = acc.ownedDocuments.some((d) => d.type === 'passport' && d.country === 'Nigeria');
  if (!hasPassport) {
    docsToAdd.push({
      id: `doc_ngp_${Date.now()}`,
      type: 'passport',
      title: 'Federal Republic of Nigeria e-Passport',
      country: 'Nigeria',
      documentNumber: `NGA-${Math.floor(1000000 + Math.random() * 8999999)}`,
      issueDate: nowStr,
      expiryDate: '10 Years',
      status: 'Valid',
      desc: `Issued to ${cleanName} (${currentNigerianState} Origin) by Nigeria Immigration Service.`,
    });
  }

  const visaDoc = {
    id: `doc_can_${Date.now()}`,
    type: 'visa',
    title: `Canada ${String(travelPurpose)} Visa (IRCC Electronic Travel Approval)`,
    country: 'Canada',
    documentNumber: `IRCC-CA-${Math.floor(10000000 + Math.random() * 89999999)}`,
    issueDate: nowStr,
    expiryDate: String(intendedDuration),
    status: 'Active',
    visaType: String(travelPurpose),
    desc: `Applicant: ${cleanName} (Age ${numAge}) • Origin: ${currentNigerianState} • Status: ${employmentStatus} • Funds Verified: ${financialInfo}`,
  };
  docsToAdd.push(visaDoc);

  acc.ownedDocuments = [...acc.ownedDocuments.filter((d) => !(d.country === 'Canada' && d.type === 'visa')), ...docsToAdd];
  acc.immigrationStatus = 'CANADA_VISA_APPROVED';

  const refId = `IRCC_${Date.now()}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  const receipt = {
    id: refId,
    title: `Canada Visa & Passport Processing (${travelPurpose})`,
    category: 'immigration',
    amount: CANADA_VISA_FEE_NGN,
    date: nowStr,
    type: 'debit',
    currency: 'NGN',
    recipientOrSender: 'IRCC Canada High Commission',
    referenceNo: refId,
  };
  acc.receipts = [receipt, ...acc.receipts].slice(0, 200);
  normalizeOwnerBalances(acc);
  acc.updatedAt = new Date().toISOString();
  mirrorAccountToCitizensDB(acc);

  const resp = {
    success: true,
    approved: true,
    issuedDocuments: docsToAdd,
    receipt,
    account: acc,
    message: 'Canada Visa & Nigerian Passport APPROVED immediately! You are cleared for flight booking to Toronto, Canada.',
  };
  if (reqKey) economyStore.processedRequestIds[reqKey] = { createdAt: Date.now(), response: resp };
  saveEconomyStore();
  saveCitizensDB(citizensDB);
  return res.json(resp);
});



// =========================================================================
// OWNER-ONLY BACKGROUND MUSIC BROADCAST SYSTEM (CHIBOY_52 ONLY)
// =========================================================================
interface BroadcastTrack {
  trackId: string;
  title: string;
  mimeType?: string;
  sizeBytes?: number;
  audioData: string; // stream URL
  uploadedBy: string;
  uploadedAt: number;
}

const AUDIO_STREAM_FILE = path.resolve(DB_DIR, 'broadcast_audio.mp3');

function loadBroadcastTrack(): BroadcastTrack | null {
  try {
    if (fs.existsSync(BROADCAST_FILE)) {
      const data = fs.readFileSync(BROADCAST_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (parsed && !parsed.trackId) {
        parsed.trackId = `trk_${parsed.uploadedAt || Date.now()}`;
      }
      return parsed;
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

interface PendingChunkUpload {
  trackId: string;
  title: string;
  mimeType: string;
  sizeBytes: number;
  totalChunks: number;
  uploadedBy: string;
  chunks: Map<number, string>;
  createdAt: number;
}

const pendingBroadcastUploads = new Map<string, PendingChunkUpload>();

app.get('/api/broadcast/audio.mp3', (req, res) => {
  if (!fs.existsSync(AUDIO_STREAM_FILE)) {
    return res.status(404).end();
  }
  try {
    const stat = fs.statSync(AUDIO_STREAM_FILE);
    const fileSize = stat.size;
    if (fileSize === 0) {
      return res.status(404).end();
    }
    const range = req.headers.range;
    const contentType = currentBroadcastTrack?.mimeType || 'audio/mpeg';

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const safeEnd = Math.min(end, fileSize - 1);
      const chunkSize = safeEnd - start + 1;
      const fileStream = fs.createReadStream(AUDIO_STREAM_FILE, { start, end: safeEnd });
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${safeEnd}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': contentType,
        'Cache-Control': 'no-store',
        'Access-Control-Allow-Origin': '*',
      });
      return fileStream.pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': contentType,
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'no-store',
        'Access-Control-Allow-Origin': '*',
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
  const hasAudioFile = fs.existsSync(AUDIO_STREAM_FILE) && fs.statSync(AUDIO_STREAM_FILE).size > 0;
  const ts = currentBroadcastTrack?.uploadedAt || 1;
  const streamUrl = hasAudioFile ? `/api/broadcast/audio.mp3?t=${ts}` : null;
  res.json({
    active: !!currentBroadcastTrack && hasAudioFile,
    trackId: currentBroadcastTrack?.trackId || (hasAudioFile ? `trk_${ts}` : null),
    title: currentBroadcastTrack?.title || 'Owner Custom Soundtrack',
    audioData: streamUrl || currentBroadcastTrack?.audioData || null,
    streamUrl,
    track: hasAudioFile ? currentBroadcastTrack : null,
  });
});

app.post('/api/broadcast/music/init', async (req, res) => {
  const ownerCheck = await verifyStrictOwnerToken(req);
  if (!ownerCheck.ok) {
    return res.status(ownerCheck.status || 403).json({ error: ownerCheck.error || 'Unauthorized: Only the verified game owner can broadcast music.' });
  }
  const { trackId, title, mimeType, sizeBytes, totalChunks } = req.body || {};
  const cleanTrackId = String(trackId || `trk_${Date.now()}`).replace(/[^a-zA-Z0-9_-]/g, '');
  const cleanTotal = Number(totalChunks || 0);
  if (!cleanTrackId || cleanTotal < 1 || cleanTotal > 120) {
    return res.status(400).json({ error: 'Invalid chunked broadcast upload metadata.' });
  }
  // Clean stale pending uploads (>10 mins old)
  const now = Date.now();
  for (const [k, v] of pendingBroadcastUploads.entries()) {
    if (now - v.createdAt > 10 * 60 * 1000) pendingBroadcastUploads.delete(k);
  }
  pendingBroadcastUploads.set(cleanTrackId, {
    trackId: cleanTrackId,
    title: String(title || 'Owner Custom Soundtrack').trim().slice(0, 160),
    mimeType: String(mimeType || 'audio/mpeg').trim().slice(0, 64),
    sizeBytes: Number(sizeBytes || 0),
    totalChunks: cleanTotal,
    uploadedBy: ownerCheck.usernameLower || 'chiboy_52',
    chunks: new Map(),
    createdAt: now,
  });
  return res.json({ success: true, trackId: cleanTrackId });
});

app.post('/api/broadcast/music/chunk', async (req, res) => {
  const ownerCheck = await verifyStrictOwnerToken(req);
  if (!ownerCheck.ok) {
    return res.status(ownerCheck.status || 403).json({ error: ownerCheck.error || 'Unauthorized' });
  }
  const { trackId, index, chunkBase64 } = req.body || {};
  const cleanTrackId = String(trackId || '').replace(/[^a-zA-Z0-9_-]/g, '');
  const session = pendingBroadcastUploads.get(cleanTrackId);
  if (!session) {
    return res.status(404).json({ error: 'Upload session not found or expired. Please retry upload.' });
  }
  const idx = Number(index);
  if (!Number.isInteger(idx) || idx < 0 || idx >= session.totalChunks || typeof chunkBase64 !== 'string' || !chunkBase64) {
    return res.status(400).json({ error: 'Invalid audio chunk.' });
  }
  session.chunks.set(idx, chunkBase64);
  return res.json({ success: true, received: session.chunks.size, totalChunks: session.totalChunks });
});

app.post('/api/broadcast/music/complete', async (req, res) => {
  const ownerCheck = await verifyStrictOwnerToken(req);
  if (!ownerCheck.ok) {
    return res.status(ownerCheck.status || 403).json({ error: ownerCheck.error || 'Unauthorized' });
  }
  const { trackId } = req.body || {};
  const cleanTrackId = String(trackId || '').replace(/[^a-zA-Z0-9_-]/g, '');
  const session = pendingBroadcastUploads.get(cleanTrackId);
  if (!session) {
    return res.status(404).json({ error: 'Upload session not found.' });
  }
  if (session.chunks.size !== session.totalChunks) {
    return res.status(400).json({ error: `Missing audio chunks (${session.chunks.size}/${session.totalChunks}).` });
  }

  try {
    if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
    const buffers: Buffer[] = [];
    for (let i = 0; i < session.totalChunks; i++) {
      const b64 = session.chunks.get(i) || '';
      buffers.push(Buffer.from(b64, 'base64'));
    }
    const fullBuffer = Buffer.concat(buffers);
    fs.writeFileSync(AUDIO_STREAM_FILE, fullBuffer);
    pendingBroadcastUploads.delete(cleanTrackId);

    const uploadTs = Date.now();
    const streamUrl = `/api/broadcast/audio.mp3?t=${uploadTs}`;
    currentBroadcastTrack = {
      trackId: cleanTrackId,
      title: session.title,
      mimeType: session.mimeType,
      sizeBytes: fullBuffer.length,
      audioData: streamUrl,
      uploadedBy: session.uploadedBy,
      uploadedAt: uploadTs,
    };
    saveBroadcastTrack(currentBroadcastTrack);
    globalRefreshCounter++;

    return res.json({
      success: true,
      active: true,
      trackId: cleanTrackId,
      streamUrl,
      track: currentBroadcastTrack,
    });
  } catch (err) {
    console.error('Error finalizing chunked audio broadcast:', err);
    pendingBroadcastUploads.delete(cleanTrackId);
    return res.status(500).json({ error: 'Server failed to assemble uploaded audio file.' });
  }
});

app.post('/api/broadcast/music', async (req, res) => {
  const ownerCheck = await verifyStrictOwnerToken(req);
  if (!ownerCheck.ok) {
    return res.status(ownerCheck.status || 403).json({ error: ownerCheck.error || 'Unauthorized: Only the verified game owner can broadcast music.' });
  }
  const { title, audioData, trackId } = req.body || {};
  if (!audioData || typeof audioData !== 'string') {
    return res.status(400).json({ error: 'Audio data is required' });
  }

  const uploadTs = Date.now();
  const cleanTrackId = String(trackId || `trk_${uploadTs}`).replace(/[^a-zA-Z0-9_-]/g, '');
  let savedBytes = 0;
  try {
    if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
    const base64Index = audioData.indexOf('base64,');
    const rawBase64 = base64Index !== -1 ? audioData.slice(base64Index + 7) : audioData;
    const buffer = Buffer.from(rawBase64, 'base64');
    savedBytes = buffer.length;
    fs.writeFileSync(AUDIO_STREAM_FILE, buffer);
  } catch (err) {
    console.error('Error saving audio stream file:', err);
    return res.status(500).json({ error: 'Failed to save audio stream file on server.' });
  }

  const streamUrl = `/api/broadcast/audio.mp3?t=${uploadTs}`;
  currentBroadcastTrack = {
    trackId: cleanTrackId,
    title: String(title || 'Owner Custom Soundtrack').trim(),
    mimeType: 'audio/mpeg',
    sizeBytes: savedBytes,
    audioData: streamUrl,
    uploadedBy: ownerCheck.usernameLower || 'chiboy_52',
    uploadedAt: uploadTs,
  };
  saveBroadcastTrack(currentBroadcastTrack);
  globalRefreshCounter++;

  return res.json({
    success: true,
    active: true,
    trackId: cleanTrackId,
    streamUrl,
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

// Real-time meteorological cache (keyed by lat/lon, 10-min TTL)
const serverWeatherCache = new Map<string, { payload: any; expiresAt: number }>();

const WEATHER_STATE_COORDS: Record<string, { lat: number; lon: number; name: string; tz: string }> = {
  lagos: { lat: 6.5244, lon: 3.3792, name: 'Lagos', tz: 'Africa/Lagos' },
  fct: { lat: 9.0765, lon: 7.3986, name: 'Abuja FCT', tz: 'Africa/Lagos' },
  fct_abuja: { lat: 9.0765, lon: 7.3986, name: 'Abuja FCT', tz: 'Africa/Lagos' },
  abuja: { lat: 9.0765, lon: 7.3986, name: 'Abuja FCT', tz: 'Africa/Lagos' },
  canada: { lat: 43.6532, lon: -79.3832, name: 'Toronto, Canada', tz: 'America/Toronto' },
  imo: { lat: 5.485, lon: 7.035, name: 'Imo (Owerri)', tz: 'Africa/Lagos' },
  rivers: { lat: 4.8156, lon: 7.0498, name: 'Rivers (Port Harcourt)', tz: 'Africa/Lagos' },
  kano: { lat: 12.0022, lon: 8.592, name: 'Kano', tz: 'Africa/Lagos' },
  oyo: { lat: 7.3775, lon: 3.947, name: 'Oyo (Ibadan)', tz: 'Africa/Lagos' },
  enugu: { lat: 6.4584, lon: 7.5464, name: 'Enugu', tz: 'Africa/Lagos' },
  delta: { lat: 6.1982, lon: 6.7329, name: 'Delta (Asaba)', tz: 'Africa/Lagos' },
  kaduna: { lat: 10.5105, lon: 7.4165, name: 'Kaduna', tz: 'Africa/Lagos' },
  plateau: { lat: 9.8965, lon: 8.8583, name: 'Plateau (Jos)', tz: 'Africa/Lagos' },
  akwa_ibom: { lat: 5.0377, lon: 7.9128, name: 'Akwa Ibom (Uyo)', tz: 'Africa/Lagos' },
  anambra: { lat: 6.2209, lon: 7.0723, name: 'Anambra (Awka)', tz: 'Africa/Lagos' },
  ogun: { lat: 7.1557, lon: 3.3451, name: 'Ogun (Abeokuta)', tz: 'Africa/Lagos' },
  edo: { lat: 6.335, lon: 5.6037, name: 'Edo (Benin City)', tz: 'Africa/Lagos' },
  borno: { lat: 11.8333, lon: 13.15, name: 'Borno (Maiduguri)', tz: 'Africa/Lagos' },
  sokoto: { lat: 13.0609, lon: 5.2476, name: 'Sokoto', tz: 'Africa/Lagos' },
  cross_river: { lat: 4.9757, lon: 8.3417, name: 'Cross River (Calabar)', tz: 'Africa/Lagos' },
  benue: { lat: 7.7321, lon: 8.5391, name: 'Benue (Makurdi)', tz: 'Africa/Lagos' },
  kwara: { lat: 8.4966, lon: 4.5421, name: 'Kwara (Ilorin)', tz: 'Africa/Lagos' },
  ondo: { lat: 7.2571, lon: 5.2058, name: 'Ondo (Akure)', tz: 'Africa/Lagos' },
  osun: { lat: 7.7827, lon: 4.5418, name: 'Osun (Osogbo)', tz: 'Africa/Lagos' },
  ekiti: { lat: 7.6214, lon: 5.2215, name: 'Ekiti (Ado-Ekiti)', tz: 'Africa/Lagos' },
  abia: { lat: 5.526, lon: 7.4896, name: 'Abia (Umuahia)', tz: 'Africa/Lagos' },
  ebonyi: { lat: 6.3249, lon: 8.1137, name: 'Ebonyi (Abakaliki)', tz: 'Africa/Lagos' },
  kogi: { lat: 7.8023, lon: 6.7333, name: 'Kogi (Lokoja)', tz: 'Africa/Lagos' },
  nasarawa: { lat: 8.4932, lon: 8.5153, name: 'Nasarawa (Lafia)', tz: 'Africa/Lagos' },
  niger: { lat: 9.6139, lon: 6.5569, name: 'Niger (Minna)', tz: 'Africa/Lagos' },
  adamawa: { lat: 9.2094, lon: 12.4818, name: 'Adamawa (Yola)', tz: 'Africa/Lagos' },
  bauchi: { lat: 10.3158, lon: 9.8442, name: 'Bauchi', tz: 'Africa/Lagos' },
  gombe: { lat: 10.2897, lon: 11.1673, name: 'Gombe', tz: 'Africa/Lagos' },
  taraba: { lat: 8.8937, lon: 11.3614, name: 'Taraba (Jalingo)', tz: 'Africa/Lagos' },
  yobe: { lat: 11.747, lon: 11.9608, name: 'Yobe (Damaturu)', tz: 'Africa/Lagos' },
  jigawa: { lat: 11.7583, lon: 9.3389, name: 'Jigawa (Dutse)', tz: 'Africa/Lagos' },
  katsina: { lat: 12.9908, lon: 7.6018, name: 'Katsina', tz: 'Africa/Lagos' },
  kebbi: { lat: 12.4539, lon: 4.1975, name: 'Kebbi (Birnin Kebbi)', tz: 'Africa/Lagos' },
  zamfara: { lat: 12.1628, lon: 6.6614, name: 'Zamfara (Gusau)', tz: 'Africa/Lagos' },
  bayelsa: { lat: 4.9267, lon: 6.2676, name: 'Bayelsa (Yenagoa)', tz: 'Africa/Lagos' },
};

app.get('/api/weather', async (req, res) => {
  const stateId = String(req.query.stateId || 'lagos').toLowerCase().trim();
  const coords = WEATHER_STATE_COORDS[stateId] || WEATHER_STATE_COORDS.lagos;
  const now = Date.now();
  const cached = serverWeatherCache.get(stateId);
  if (cached && cached.expiresAt > now) {
    return res.json(cached.payload);
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,relative_humidity_2m,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,wind_speed_10m&timezone=${encodeURIComponent(coords.tz)}`;
    const resp = await fetch(url);
    if (!resp.ok) {
      throw new Error(`Open-Meteo HTTP ${resp.status}`);
    }
    const json = await resp.json();
    const cur = json.current || {};
    const payload = {
      ok: true,
      stateId,
      locationName: coords.name,
      timezone: coords.tz,
      temperatureC: Math.round(Number(cur.temperature_2m ?? 26)),
      humidityPct: Math.round(Number(cur.relative_humidity_2m ?? 70)),
      isDay: Number(cur.is_day ?? 1) === 1,
      precipitationMm: Number(cur.precipitation ?? 0),
      rainMm: Number(cur.rain ?? 0),
      snowfallCm: Number(cur.snowfall ?? 0),
      weatherCode: Number(cur.weather_code ?? 0),
      cloudCoverPct: Math.round(Number(cur.cloud_cover ?? 25)),
      windSpeedKmh: Math.round(Number(cur.wind_speed_10m ?? 10)),
      source: 'live_open_meteo',
      fetchedAt: new Date().toISOString(),
    };
    serverWeatherCache.set(stateId, { payload, expiresAt: now + 10 * 60 * 1000 });
    return res.json(payload);
  } catch (err) {
    console.warn('Weather API upstream failed:', err);
    return res.status(502).json({ ok: false, error: 'Weather service unavailable' });
  }
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
