import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const stateFile = path.join(dataDir, 'paxtabox_state.json');
const allCalendarsFile = path.join(__dirname, 'src', 'data', 'allCalendars.json');
const moonEpicFile = path.join(__dirname, 'src', 'data', 'moonEpicItems.json');

// STRICT HARDWARE-LEVEL PROTECTION FOR THE 4 FORBIDDEN NFTs (NEVER TOUCH OR TRANSFER!)
// HeartLocket-2 (6068), Mask-80 (4226), ResistanceDog-45 (3015), HeartLocket-29 (6095)
const FORBIDDEN_GIFT_IDS = new Set([6068, 4226, 3015, 6095]);
const FORBIDDEN_SLUGS = new Set([
  'heartlocket-2',
  'mask-80',
  'resistancedog-45',
  'heartlocket-29',
]);

// Primary Bot: @CaseBot (ID: 1445) & Partner Bot: @UpgradeBot (ID: 682)
const CASE_BOT_TOKEN = process.env.PAXTA_BOT_TOKEN || '1445:8Wz27wOA9PT-VCXrPb9gIVHtoETJxAIu1f4';
const UPGRADE_BOT_TOKEN = '682:OSWsBqK5LZHWlGJmzeONb9iIjE-UV7QBQY_';
const PAXTA_API_BASE = 'https://paxta.online';
const PUBLIC_APP_URL =
  process.env.RENDER_EXTERNAL_URL ||
  process.env.PUBLIC_APP_URL ||
  'https://paxta-cs2-cases.onrender.com';

// @moon Account Credentials for Instant Gift & Automated NFT Delivery
const MOON_USERNAME = process.env.MOON_USERNAME || 'shade';
const MOON_PASSWORD = process.env.MOON_PASSWORD || 'urRFEbgx5mgbWib';

const UPGRADE_BOT_REMOTE = 'https://paxta-gift-upgrade.onrender.com';
const UPGRADE_BOT_LOCAL_PROMOS = 'D:\\code\\paxta-gift-upgrade\\data\\promocodes.json';

// Turso Cloud DB (LibSQL) for 100% Permanent Persistence across Render Deploys
const TURSO_PIPELINE = 'https://antigrvty-umarbe.aws-ap-northeast-1.turso.io/v2/pipeline';
const TURSO_TOKEN =
  process.env.TURSO_AUTH_TOKEN ||
  'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJleHAiOjE4MDE2NjU5ODcsImlhdCI6MTc5Mzg4OTk4NywiaWQiOiIwMWExYWMyYy05NzAxLTdiMjUtYjNhNS1jMWZmZWNiMTU1YjMiLCJraWQiOiJPbi1BME5RanhSWEZOSVdFeGRucUQ0SVBJZDRPMEdfbWM3bTZ6VDcyX01BIiwicmlkIjoiYjY5NGEwNjYtNzEwNi00ZmMyLThjNWEtYjM4ZGQ2OWIyNDNmIn0.3FAho1-aZZmAzxd3HKWLuRocdTDTZF-DheGd6T-5ceHaJiPv8kEtlwR8SvrYgsCCUp6z51-XwNuFVtC_uDB4Ag';

const BROWSER_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';

const DEFAULT_STATE = {
  invoices: {},
  charges: {},
  lastUpdateId: 0,
  withdrawals: [],
  mintedPromos: [],
  errorLogs: [],
  globalPool: {
    claimedNftIds: [],
    casePoolReserves: {},
    totalSpins: 0,
  },
  users: {},
};

const ADMIN_KEYS = new Set(['moon2026', 'urRFEbgx5mgbWib', '100']);

function logSystemError(type, details) {
  const entry = {
    id: `ERR-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
    type,
    ...details,
    createdAt: new Date().toISOString(),
  };
  if (!Array.isArray(appState.errorLogs)) appState.errorLogs = [];
  appState.errorLogs.unshift(entry);
  if (appState.errorLogs.length > 200) appState.errorLogs.length = 200;
  saveState();
  return entry;
}

function loadLocalState() {
  try {
    if (!fs.existsSync(stateFile)) return structuredClone(DEFAULT_STATE);
    const parsed = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
    return {
      ...structuredClone(DEFAULT_STATE),
      ...parsed,
      globalPool: {
        ...structuredClone(DEFAULT_STATE.globalPool),
        ...(parsed.globalPool || {}),
      },
      users: parsed.users || {},
    };
  } catch {
    return structuredClone(DEFAULT_STATE);
  }
}

let appState = loadLocalState();
let tursoSaveTimer = null;

async function tursoExecute(sql, args = []) {
  try {
    const formattedArgs = args.map((a) => {
      if (typeof a === 'number') return { type: 'integer', value: String(a) };
      return { type: 'text', value: String(a) };
    });
    const res = await fetch(TURSO_PIPELINE, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${TURSO_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [{ type: 'execute', stmt: { sql, args: formattedArgs } }],
      }),
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.results?.[0]?.response?.result || null;
  } catch {
    return null;
  }
}

export async function initPaxtaBoxTurso() {
  try {
    await tursoExecute(`
      CREATE TABLE IF NOT EXISTS kv_store (
        key TEXT PRIMARY KEY,
        val TEXT,
        updated_at INTEGER
      );
    `);
    const res = await tursoExecute("SELECT val FROM kv_store WHERE key = 'paxtabox_state';");
    const rawVal = res?.rows?.[0]?.[0]?.value;
    if (rawVal) {
      const remoteState = JSON.parse(rawVal);
      appState = {
        ...structuredClone(DEFAULT_STATE),
        ...remoteState,
        globalPool: {
          ...structuredClone(DEFAULT_STATE.globalPool),
          ...(remoteState.globalPool || {}),
        },
        users: remoteState.users || {},
      };
      fs.writeFileSync(stateFile, JSON.stringify(appState, null, 2), 'utf8');
      console.log(
        `[Turso] Restored paxtabox_state (${appState.globalPool.claimedNftIds.length} claimed NFTs, ${Object.keys(appState.users).length} users, ${appState.withdrawals.length} withdrawals)`
      );
    } else {
      await persistStateNow();
      console.log('[Turso] Seeded initial paxtabox_state to Turso Cloud DB');
    }
  } catch (err) {
    console.error('[Turso Init Error]', err.message);
  }
}

async function persistStateNow() {
  try {
    fs.writeFileSync(stateFile, JSON.stringify(appState, null, 2), 'utf8');
  } catch {}
  try {
    await tursoExecute(
      'INSERT OR REPLACE INTO kv_store (key, val, updated_at) VALUES (?, ?, ?);',
      ['paxtabox_state', JSON.stringify(appState), Date.now()]
    );
  } catch {}
}

function saveState(immediate = false) {
  try {
    fs.writeFileSync(stateFile, JSON.stringify(appState, null, 2), 'utf8');
  } catch {}
  if (immediate) {
    persistStateNow();
    return;
  }
  if (tursoSaveTimer) clearTimeout(tursoSaveTimer);
  tursoSaveTimer = setTimeout(() => {
    tursoSaveTimer = null;
    persistStateNow();
  }, 350);
}

// ============================================================================
// @moon PaxtaGram Client (Sends Unlimited Store Gifts & Transfers NFTs)
// ============================================================================
class MoonPaxtaClient {
  constructor() {
    this.cookies = new Map();
    this.isLoggedIn = false;
    this.user = null;
    this.lastLoginAt = 0;
  }

  updateCookies(headers) {
    const raw =
      typeof headers.getSetCookie === 'function'
        ? headers.getSetCookie()
        : headers.get('set-cookie')
          ? [headers.get('set-cookie')]
          : [];
    for (const c of raw) {
      const firstPart = c.split(';')[0];
      const eqIdx = firstPart.indexOf('=');
      if (eqIdx > 0) {
        const k = firstPart.slice(0, eqIdx).trim();
        const v = firstPart.slice(eqIdx + 1).trim();
        this.cookies.set(k, v);
      }
    }
  }

  getCookieHeader() {
    return Array.from(this.cookies.entries())
      .map(([k, v]) => `${k}=${v}`)
      .join('; ');
  }

  getXsrfToken() {
    const raw = this.cookies.get('XSRF-TOKEN') || '';
    try {
      return decodeURIComponent(raw);
    } catch {
      return raw;
    }
  }

  async request(apiPath, options = {}) {
    const url = apiPath.startsWith('http') ? apiPath : `${PAXTA_API_BASE}/api${apiPath}`;
    const headers = {
      'User-Agent': BROWSER_UA,
      Accept: 'application/json, text/plain, */*',
      Referer: `${PAXTA_API_BASE}/`,
      Cookie: this.getCookieHeader(),
      'X-XSRF-TOKEN': this.getXsrfToken(),
      ...(options.headers || {}),
    };
    let body = options.body;
    if (body && typeof body === 'object') {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify(body);
    }
    const res = await fetch(url, {
      ...options,
      headers,
      body,
      signal: AbortSignal.timeout(8000),
    });
    this.updateCookies(res.headers);
    return res;
  }

  async ensureLoggedIn() {
    if (this.isLoggedIn && Date.now() - this.lastLoginAt < 25 * 60 * 1000) {
      return true;
    }
    try {
      const csrfRes = await fetch(`${PAXTA_API_BASE}/sanctum/csrf-cookie`, {
        headers: { 'User-Agent': BROWSER_UA, Referer: `${PAXTA_API_BASE}/` },
        signal: AbortSignal.timeout(6000),
      });
      this.updateCookies(csrfRes.headers);

      // Try MOON_USERNAME ('shade' or 'moon')
      for (const uname of [MOON_USERNAME, 'moon', 'shade']) {
        const loginRes = await this.request('/auth/login', {
          method: 'POST',
          body: { username: uname, password: MOON_PASSWORD },
        });
        if (loginRes.ok) {
          const data = await loginRes.json();
          this.user = data.user;
          this.isLoggedIn = true;
          this.lastLoginAt = Date.now();
          console.log(`[@moon Client] Logged in as @${this.user?.username} (ID: ${this.user?.id})`);
          return true;
        }
      }
    } catch (err) {
      console.error('[@moon Login Error]', err.message);
    }
    return false;
  }

  async resolveUserByUsername(rawUsername) {
    const clean = String(rawUsername || '')
      .replace(/^@/, '')
      .trim();
    if (!clean) return null;
    await this.ensureLoggedIn();
    try {
      const res = await this.request(`/users/${encodeURIComponent(clean)}`);
      if (!res.ok) return null;
      const data = await res.json();
      return data.user || null;
    } catch {
      return null;
    }
  }

  async sendOfficialStoreGift({ targetUserId, giftId, expectedPrice, message }) {
    await this.ensureLoggedIn();
    const res = await this.request('/gifts/send', {
      method: 'POST',
      body: {
        gift_id: Number(giftId),
        user_id: Number(targetUserId),
        hide_name: false,
        message: message || "🎁 PaxtaBox (@CaseBot) yutug'ingiz!",
        expected_price: Number(expectedPrice),
      },
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, data };
  }

  async transferNftGift({ giftId, targetUserId }) {
    const numGiftId = Number(giftId);
    if (FORBIDDEN_GIFT_IDS.has(numGiftId)) {
      return { ok: false, status: 403, data: { message: 'Protected personal NFT!' } };
    }
    await this.ensureLoggedIn();
    // If the NFT is currently listed on Paxta Market resale, delist it first so transfer succeeds
    try {
      await this.request(`/user-gifts/${numGiftId}/resale`, { method: 'DELETE' });
    } catch {}
    const res = await this.request(`/user-gifts/${numGiftId}/transfer`, {
      method: 'POST',
      body: {
        user_id: Number(targetUserId),
        expected_price: 50,
      },
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, data };
  }
}

const moonClient = new MoonPaxtaClient();

// ============================================================================
// @CaseBot API Helper & Poller
// ============================================================================
export async function callCaseBot(method, body = {}) {
  try {
    const res = await fetch(`${PAXTA_API_BASE}/bot${CASE_BOT_TOKEN}/${method}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'User-Agent': BROWSER_UA,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(7500),
    });
    return await res.json();
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

function createUpgradeBotAdminToken() {
  const data = 'admin:100';
  const sig = crypto
    .createHmac('sha256', UPGRADE_BOT_TOKEN)
    .update(data)
    .digest('hex')
    .slice(0, 32);
  return `${data}:${sig}`;
}

async function registerPromoInUpgradeBot({ code, stars, rewardType = 'stars', giftSlug = null }) {
  const cleanCode = code.trim().toUpperCase();
  const promoEntry = {
    code: cleanCode,
    rewardType,
    stars: Math.max(1, Number(stars) || 100),
    maxUses: 1,
    usedCount: 0,
    usedBy: [],
    giftSlug: giftSlug || null,
    createdAt: new Date().toISOString(),
  };

  // 1. Local @UpgradeBot promocodes.json
  try {
    const dir = path.dirname(UPGRADE_BOT_LOCAL_PROMOS);
    if (fs.existsSync(dir)) {
      const raw = fs.existsSync(UPGRADE_BOT_LOCAL_PROMOS)
        ? JSON.parse(fs.readFileSync(UPGRADE_BOT_LOCAL_PROMOS, 'utf8'))
        : {};
      raw[cleanCode] = promoEntry;
      fs.writeFileSync(UPGRADE_BOT_LOCAL_PROMOS, JSON.stringify(raw, null, 2), 'utf8');
    }
  } catch {}

  // 2. Live @UpgradeBot Admin API
  const adminToken = createUpgradeBotAdminToken();
  for (const baseUrl of [UPGRADE_BOT_REMOTE, 'http://localhost:4000']) {
    try {
      await fetch(`${baseUrl}/api/admin/promocode`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': adminToken,
        },
        body: JSON.stringify({
          action: 'create',
          code: cleanCode,
          stars: promoEntry.stars,
          maxUses: 1,
          rewardType: promoEntry.rewardType,
          giftSlug: promoEntry.giftSlug,
        }),
        signal: AbortSignal.timeout(4500),
      });
    } catch {}
  }

  // 3. Direct Turso Cloud DB (`kv_store` key = 'promocodes')
  try {
    const selRes = await tursoExecute("SELECT val FROM kv_store WHERE key = 'promocodes';");
    const rawVal = selRes?.rows?.[0]?.[0]?.value;
    const remotePromos = rawVal ? JSON.parse(rawVal) : {};
    remotePromos[cleanCode] = promoEntry;
    await tursoExecute(
      'INSERT OR REPLACE INTO kv_store (key, val, updated_at) VALUES (?, ?, ?);',
      ['promocodes', JSON.stringify(remotePromos), Date.now()]
    );
  } catch {}

  appState.mintedPromos.unshift(promoEntry);
  if (appState.mintedPromos.length > 500) appState.mintedPromos.length = 500;
  saveState();

  return promoEntry;
}

// Background Worker: Automatically transfers queued NFTs as soon as their 48-hour Trade-Ban expires
async function processTradeBanQueue() {
  const now = Date.now();
  let changed = false;

  for (const w of appState.withdrawals) {
    if (w.status !== 'queued_trade_ban' || !w.giftId || !w.targetUserId) continue;
    const unlockMs = w.tradeLockedUntil ? Date.parse(w.tradeLockedUntil) : 0;
    if (unlockMs > now) continue;

    try {
      const tr = await moonClient.transferNftGift({
        giftId: w.giftId,
        targetUserId: w.targetUserId,
      });
      if (tr.ok) {
        w.status = 'transferred';
        w.transferredAt = new Date().toISOString();
        changed = true;
        console.log(
          `🎉 [@moon Auto-Transfer] Desk Calendar #${w.number} transferred to @${w.targetUsername} (ID: ${w.targetUserId}) after 48h trade-ban!`
        );
        await callCaseBot('sendMessage', {
          chat_id: 100,
          text: `✅ *48-Soatlik Trade-Ban Tugadi — NFT Avtomatik Yuborildi!*\n\n📅 *NFT:* Desk Calendar #${w.number} (${w.model})\n👤 *Qabul qiluvchi:* @${w.targetUsername}\n🧾 *Kvitansiya:* \`${w.receiptCode}\``,
          parse_mode: 'Markdown',
        });
      }
    } catch {}
  }

  if (changed) saveState(true);
}

let pollerStarted = false;
export function startCaseBotPoller() {
  if (pollerStarted) return;
  pollerStarted = true;

  // Initialize Turso State & Configure @CaseBot Menu Button
  initPaxtaBoxTurso().then(async () => {
    try {
      await callCaseBot('deleteWebhook', { drop_pending_updates: false });
      await callCaseBot('setChatMenuButton', {
        menu_button: {
          type: 'web_app',
          text: '🎁 PaxtaBox',
          web_app: { url: PUBLIC_APP_URL },
        },
      });
      await callCaseBot('setMyCommands', {
        commands: [
          { command: 'start', description: '🎁 PaxtaBox Mini Ilovasini Ochish' },
          { command: 'rules', description: '🛡 Kafolat Do‘koni va Qoidalar' },
          { command: 'help', description: '💡 Yordam va Qo‘llanma' },
        ],
      });
    } catch {}
  });

  // Start 60s Trade-Ban Auto-Transfer Queue Worker
  setInterval(() => {
    processTradeBanQueue().catch(() => {});
  }, 60 * 1000);

  (async () => {
    while (true) {
      try {
        const offset = (appState.lastUpdateId || 0) + 1;
        const u = await callCaseBot('getUpdates', { offset, timeout: 2 });
        if (u && u.ok && Array.isArray(u.result) && u.result.length > 0) {
          for (const item of u.result) {
            appState.lastUpdateId = item.update_id;

            // 1. Approve PreCheckoutQuery immediately
            if (item.pre_checkout_query) {
              await callCaseBot('answerPreCheckoutQuery', {
                pre_checkout_query_id: item.pre_checkout_query.id,
                ok: true,
              });
            }

            // 2. Credit Stars on successful_payment
            if (item.message?.successful_payment) {
              const sp = item.message.successful_payment;
              const payload = String(sp.invoice_payload || '');
              const chargeId = sp.telegram_payment_charge_id;

              if (payload.startsWith('case_topup:')) {
                const parts = payload.split(':');
                const nonce = parts[2];
                if (nonce && appState.invoices[nonce] && appState.invoices[nonce].status !== 'paid') {
                  appState.invoices[nonce].status = 'paid';
                  appState.invoices[nonce].paidAt = new Date().toISOString();
                  appState.invoices[nonce].chargeId = chargeId;
                  appState.invoices[nonce].paidBy =
                    item.message.from?.username || item.message.from?.id || 'user';
                  console.log(
                    `⭐ [@CaseBot] Real Stars payment confirmed: +${sp.total_amount} ⭐ (nonce: ${nonce})`
                  );
                }
              }

              if (item.message.chat?.id) {
                await callCaseBot('sendMessage', {
                  chat_id: item.message.chat.id,
                  text: `✅ *To‘lov muvaffaqiyatli qabul qilindi!*\n\nPaxtaBox hisobingizga *+⭐ ${sp.total_amount} Stars* qo‘shildi! Endi qutilarni ochishingiz mumkin.`,
                  parse_mode: 'Markdown',
                  reply_markup: {
                    inline_keyboard: [
                      [{ text: '🎁 PaxtaBox Qutilarini Ochish', web_app: { url: PUBLIC_APP_URL } }],
                    ],
                  },
                });
              }
            }

            // 3. Handle /admin command for owner (@moon, ID: 100)
            const txt = (item.message?.text || '').trim();
            if (txt.startsWith('/admin')) {
              const fromId = item.message?.from?.id;
              const fromUser = String(item.message?.from?.username || '').toLowerCase();
              if (fromId === 100 || fromUser === 'moon' || fromUser === 'shade') {
                const usersList = Object.values(appState.users || {});
                const totalSpentAll = usersList.reduce((s, u) => s + (Number(u.totalSpent) || 0), 0);
                const pendingW = (appState.withdrawals || []).filter(
                  (w) => w.status !== 'transferred' && w.status !== 'delivered_instant'
                ).length;
                const errCount = (appState.errorLogs || []).length;
                await callCaseBot('sendMessage', {
                  chat_id: item.message.chat.id,
                  text:
                    `🛡 *PaxtaBox (@CaseBot) — Admin Boshqaruv Paneli*\n\n` +
                    `👥 *Foydalanuvchilar:* ${usersList.length} ta\n` +
                    `⭐ *Sarflangan Stars:* ${totalSpentAll.toLocaleString()} ⭐\n` +
                    `🎁 *Yutilgan NFTlar:* ${(appState.globalPool?.claimedNftIds || []).length} / 199 ta\n` +
                    `⏳ *Navbatdagi / O‘tmay qolgan sovg‘alar:* ${pendingW} ta\n` +
                    `⚠️ *Tizim xatoliklari:* ${errCount} ta\n\n` +
                    `🔑 *Admin parol:* \`moon2026\`\n` +
                    `Pastdagi tugma orqali to‘liq Admin Panelni oching:`,
                  parse_mode: 'Markdown',
                  reply_markup: {
                    inline_keyboard: [
                      [
                        {
                          text: '🛡 Admin Panelni Ochish',
                          web_app: { url: `${PUBLIC_APP_URL}/?admin=moon2026` },
                        },
                      ],
                    ],
                  },
                });
              }
            } else if (txt.startsWith('/start') || txt.startsWith('/help') || txt.startsWith('/rules')) {
              await callCaseBot('sendMessage', {
                chat_id: item.message.chat.id,
                text:
                  `🎁 *PaxtaBox — Desk Calendar NFT va Rasmiy Sovg‘alar Qutisi!*\n\n` +
                  `✨ *128 ta Desk Calendar NFT* (#98 Sub-100, Golden Touch, Durov Day va boshqalar)\n` +
                  `🍁 *@moon orqali 1 soniyada profilga boradigan Rasmiy Giftlar* (Maple Leaf, Money Tree, Cake)\n` +
                  `🎟 *@UpgradeBot uchun 1-martalik haqiqiy Promokodlar* (100 ⭐ – 350 ⭐)\n` +
                  `⭐ *Ichki Stars keshbeklar va Bepul Chiptalar*\n\n` +
                  `Pastdagi tugmani bosib qutilarni oching:`,
                parse_mode: 'Markdown',
                reply_markup: {
                  inline_keyboard: [
                    [{ text: '🎁 PaxtaBox Mini Ilovasini Ochish', web_app: { url: PUBLIC_APP_URL } }],
                  ],
                },
              });
            }
          }
          saveState(true);
        }
      } catch {}
      await new Promise((r) => setTimeout(r, 900));
    }
  })();
}

function readBody(req) {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
    });
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        resolve({});
      }
    });
  });
}

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

function lookupNftMeta({ giftId, number, slug }) {
  try {
    const calendars = fs.existsSync(allCalendarsFile)
      ? JSON.parse(fs.readFileSync(allCalendarsFile, 'utf8'))
      : [];
    const epicItems = fs.existsSync(moonEpicFile)
      ? JSON.parse(fs.readFileSync(moonEpicFile, 'utf8'))
      : [];
    const combined = [...epicItems, ...calendars];
    if (giftId) {
      const byGiftId = combined.find((c) => Number(c.giftId) === Number(giftId));
      if (byGiftId) return byGiftId;
    }
    if (slug && number) {
      const bySlugNum = combined.find(
        (c) =>
          String(c.slug || 'DeskCalendar').toLowerCase() === String(slug).toLowerCase() &&
          Number(c.number) === Number(number)
      );
      if (bySlugNum) return bySlugNum;
    }
    return combined.find((c) => Number(c.number) === Number(number)) || null;
  } catch {
    return null;
  }
}

export function createApiMiddleware() {
  startCaseBotPoller();

  return async (req, res, next) => {
    const rawUrl = req.url || '';
    const urlPath = rawUrl.split('?')[0];
    if (!urlPath.startsWith('/api/')) return next();

    // 0. Health Check
    if (req.method === 'GET' && urlPath === '/api/health') {
      return sendJson(res, 200, {
        ok: true,
        service: 'paxta-cs2-cases',
        bot: '@CaseBot',
        claimedNfts: appState.globalPool.claimedNftIds.length,
        usersCount: Object.keys(appState.users).length,
        withdrawalsCount: appState.withdrawals.length,
        time: new Date().toISOString(),
      });
    }

    // 1. Cloud State Sync (GET & POST) so Turso DB preserves everything across devices & Render deploys
    if (req.method === 'GET' && urlPath === '/api/state/sync') {
      const qs = new URLSearchParams(rawUrl.split('?')[1] || '');
      const userId = qs.get('userId') || 'default';
      const userObj = appState.users[userId] || null;
      let pendingDelta = 0;
      if (userObj && typeof userObj.pendingAdminStarsDelta === 'number' && userObj.pendingAdminStarsDelta !== 0) {
        pendingDelta = userObj.pendingAdminStarsDelta;
        userObj.pendingAdminStarsDelta = 0;
        saveState();
      }
      return sendJson(res, 200, {
        ok: true,
        globalPool: appState.globalPool,
        userProfile: userObj,
        pendingAdminStarsDelta: pendingDelta,
        withdrawals: appState.withdrawals.slice(0, 50),
      });
    }

    if (req.method === 'POST' && urlPath === '/api/state/sync') {
      const body = await readBody(req);
      const userId = String(body.userId || 'default');

      if (body.globalPool) {
        if (Array.isArray(body.globalPool.claimedNftIds)) {
          const mergedIds = Array.from(
            new Set([
              ...(appState.globalPool.claimedNftIds || []),
              ...body.globalPool.claimedNftIds,
            ])
          );
          appState.globalPool.claimedNftIds = mergedIds;
        }
        const prevOpened = Number(appState.users[userId]?.totalOpened) || 0;
        const nextOpened = Number(body.userProfile?.totalOpened) || 0;
        if (
          nextOpened > prevOpened &&
          body.globalPool.casePoolReserves &&
          typeof body.globalPool.casePoolReserves === 'object'
        ) {
          appState.globalPool.casePoolReserves = {
            ...(appState.globalPool.casePoolReserves || {}),
            ...body.globalPool.casePoolReserves,
          };
        }
      }

      let pendingDelta = 0;
      if (body.userProfile && typeof body.userProfile === 'object') {
        const existingUser = appState.users[userId] || {};
        if (typeof existingUser.pendingAdminStarsDelta === 'number' && existingUser.pendingAdminStarsDelta !== 0) {
          pendingDelta = existingUser.pendingAdminStarsDelta;
        }
        appState.users[userId] = {
          ...existingUser,
          ...body.userProfile,
          stars: Math.max(0, (Number(body.userProfile.stars) || 0) + pendingDelta),
          pendingAdminStarsDelta: 0,
          updatedAt: new Date().toISOString(),
        };
      }

      saveState();
      return sendJson(res, 200, {
        ok: true,
        globalPool: appState.globalPool,
        pendingAdminStarsDelta: pendingDelta,
      });
    }

    // 2. Create Real PaxtaGram Stars Invoice (`createInvoiceLink`)
    if (req.method === 'POST' && urlPath === '/api/stars/create-invoice') {
      const body = await readBody(req);
      const amount = Math.max(1, Math.min(100000, parseInt(body.amount, 10) || 385));
      const nonce = crypto.randomBytes(6).toString('hex');
      const payload = `case_topup:${amount}:${nonce}`;
      const title = `PaxtaBox · ${amount} Stars`.slice(0, 32);
      const description = `PaxtaBox NFT qutilarini ochish uchun ${amount} PaxtaGram Stars hisobni to'ldirish`;

      const botRes = await callCaseBot('createInvoiceLink', {
        title,
        description,
        payload,
        provider_token: '',
        currency: 'XTR',
        prices: [{ label: `${amount} Stars`, amount }],
      });

      if (!botRes.ok || !botRes.result) {
        return sendJson(res, 502, {
          ok: false,
          error: botRes.description || 'PaxtaGram Stars hisob-fakturasini yaratib bo‘lmadi',
        });
      }

      const invoiceLink = botRes.result;
      const slugMatch = invoiceLink.match(/\/invoice\/([A-Za-z0-9_-]+)/);
      const slug = slugMatch ? slugMatch[1] : '';

      appState.invoices[nonce] = {
        nonce,
        slug,
        amount,
        invoiceLink,
        webInvoiceUrl: `${PAXTA_API_BASE}/?invoice=${slug}`,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      saveState(true);

      return sendJson(res, 200, {
        ok: true,
        nonce,
        slug,
        amount,
        invoiceLink,
        webInvoiceUrl: `${PAXTA_API_BASE}/?invoice=${slug}`,
      });
    }

    // 3. Check Real PaxtaGram Stars Invoice Status
    if (req.method === 'GET' && urlPath.startsWith('/api/stars/status/')) {
      const nonce = urlPath.split('/api/stars/status/')[1];
      const inv = appState.invoices?.[nonce];
      if (!inv) {
        return sendJson(res, 404, { ok: false, error: 'Hisob-faktura topilmadi' });
      }
      return sendJson(res, 200, {
        ok: true,
        status: inv.status,
        amount: inv.amount,
        paidAt: inv.paidAt || null,
      });
    }

    // 4. Mint Real 1-Time @UpgradeBot Promo Code (`maxUses: 1`, minimum 500 Stars!)
    if (req.method === 'POST' && urlPath === '/api/promocode/mint') {
      const body = await readBody(req);
      const stars = Math.max(500, Math.min(5000, parseInt(body.stars, 10) || 500));
      const rewardType = body.rewardType === 'gift' ? 'gift' : 'stars';
      const giftSlug = body.giftSlug || null;
      const rand = crypto.randomBytes(3).toString('hex').toUpperCase();
      const prefix = rewardType === 'gift' ? 'UPGGIFT' : `UPG${stars}`;
      const code = `${prefix}-${rand}`;

      const promo = await registerPromoInUpgradeBot({
        code,
        stars,
        rewardType,
        giftSlug,
      });

      return sendJson(res, 200, {
        ok: true,
        code: promo.code,
        stars: promo.stars,
        maxUses: 1,
        rewardType: promo.rewardType,
        botUsername: '@UpgradeBot',
        botUrl: 'https://paxta.online/u/UpgradeBot',
      });
    }

    // 5. Instant Official Unlimited Store Gift Delivery via @moon (`Maple Leaf` 50 ⭐, `Money Tree` 75 ⭐, `Cake` 100 ⭐)
    if (req.method === 'POST' && urlPath === '/api/gift/send') {
      const body = await readBody(req);
      const { giftId, price, title, targetUsername } = body;
      const cleanUser = String(targetUsername || '')
        .replace(/^@/, '')
        .trim();

      if (!cleanUser || cleanUser.length < 2) {
        return sendJson(res, 400, {
          ok: false,
          error: 'PaxtaGram @username ni to‘g‘ri kiriting!',
        });
      }

      const targetUser = await moonClient.resolveUserByUsername(cleanUser);
      if (!targetUser || !targetUser.id) {
        logSystemError('gift_user_not_found', {
          targetUsername: `@${cleanUser}`,
          itemTitle: title || `Gift #${giftId}`,
          error: `@${cleanUser} PaxtaGram’da topilmadi`,
        });
        return sendJson(res, 404, {
          ok: false,
          error: `@${cleanUser} PaxtaGram’da topilmadi! Username’ni tekshirib qayta kiriting.`,
        });
      }

      const sendResult = await moonClient.sendOfficialStoreGift({
        targetUserId: targetUser.id,
        giftId: Number(giftId) || 1,
        expectedPrice: Number(price) || 50,
        message: `🎁 PaxtaBox (@CaseBot) yutug'ingiz: ${title || 'Rasmiy Gift'}!`,
      });

      if (!sendResult.ok) {
        const errMsg =
          sendResult.data?.message ||
          'Sovg‘ani yuborishda xatolik yuz berdi (@moon balansini yoki ulanishni tekshiring).';
        const failReceipt = `GIFT-ERR-${targetUser.id}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
        appState.withdrawals.unshift({
          type: 'official_gift',
          receiptCode: failReceipt,
          giftId: Number(giftId) || 1,
          title: title || 'Rasmiy Gift',
          price: Number(price) || 50,
          targetUsername: targetUser.username || cleanUser,
          targetUserId: targetUser.id,
          status: 'failed_transfer',
          lastError: errMsg,
          createdAt: new Date().toISOString(),
        });
        logSystemError('gift_send_failed', {
          receiptCode: failReceipt,
          targetUsername: `@${targetUser.username || cleanUser}`,
          targetUserId: targetUser.id,
          itemTitle: title || `Gift #${giftId}`,
          giftId: Number(giftId) || 1,
          price: Number(price) || 50,
          error: errMsg,
        });
        return sendJson(res, 502, {
          ok: false,
          error: errMsg,
        });
      }

      const receiptCode = `GIFT-${targetUser.id}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
      appState.withdrawals.unshift({
        type: 'official_gift',
        receiptCode,
        giftId,
        title,
        price,
        targetUsername: targetUser.username || cleanUser,
        targetUserId: targetUser.id,
        status: 'delivered_instant',
        createdAt: new Date().toISOString(),
      });
      saveState(true);

      await callCaseBot('sendMessage', {
        chat_id: 100,
        text: `🍁 *@moon Orqali Rasmiy Gift Yuborildi!*\n\n🎁 *Sovg‘a:* ${title} (${price} ⭐)\n👤 *Qabul qiluvchi:* @${targetUser.username || cleanUser} (ID: ${targetUser.id})\n🧾 *Kvitansiya:* \`${receiptCode}\``,
        parse_mode: 'Markdown',
      });

      return sendJson(res, 200, {
        ok: true,
        receiptCode,
        targetUsername: `@${targetUser.username || cleanUser}`,
        status: 'delivered_instant',
        message: `🎁 "${title}" rasmiy sovg‘asi @moon orqali @${targetUser.username || cleanUser} profiliga muvaffaqiyatli yuborildi!`,
      });
    }

    // 6. Real NFT Withdrawal (Desk Calendars & @moon Epic NFTs with 48-Hour Trade-Ban Support & Auto-Transfer Queue)
    if (req.method === 'POST' && urlPath === '/api/nft/withdraw') {
      const body = await readBody(req);
      const { number, slug, title, model, backdrop, pattern, targetUsername } = body;
      const cleanUser = String(targetUsername || '')
        .replace(/^@/, '')
        .trim();

      if (!cleanUser || cleanUser.length < 2) {
        return sendJson(res, 400, {
          ok: false,
          error: 'PaxtaGram @username ni to‘g‘ri kiriting!',
        });
      }

      const checkSlugKey = `${String(slug || 'DeskCalendar').toLowerCase()}-${number}`;
      if (FORBIDDEN_SLUGS.has(checkSlugKey) || FORBIDDEN_GIFT_IDS.has(Number(body.giftId))) {
        return sendJson(res, 403, {
          ok: false,
          error: 'Ushbu shaxsiy NFT himoyalangan va o‘yinga kiritilmagan!',
        });
      }

      // 1. Verify recipient exists on PaxtaGram
      const targetUser = await moonClient.resolveUserByUsername(cleanUser);
      if (!targetUser || !targetUser.id) {
        logSystemError('nft_user_not_found', {
          targetUsername: `@${cleanUser}`,
          itemTitle: `${title || 'Desk Calendar'} #${number}`,
          number,
          error: `@${cleanUser} PaxtaGram’da topilmadi`,
        });
        return sendJson(res, 404, {
          ok: false,
          error: `@${cleanUser} PaxtaGram’da topilmadi! Username’ni tekshirib qayta kiriting.`,
        });
      }

      // 2. Lookup NFT details (giftId, channelId, tradeLockedUntil)
      const calMeta = lookupNftMeta({
        giftId: body.giftId,
        number,
        slug: slug || 'DeskCalendar',
      });
      const giftId = calMeta?.giftId || body.giftId;
      const channelId = calMeta?.channelId || 2000001271;
      const itemTitle = calMeta?.name || `${title || calMeta?.title || 'Desk Calendar'} #${number}`;
      const tradeLockedUntil = calMeta?.tradeLockedUntil || null;
      const unlockMs = tradeLockedUntil ? Date.parse(tradeLockedUntil) : 0;
      const isTradeLocked = unlockMs > Date.now();

      const receiptCode = `PX-${channelId}-#${number}-${crypto
        .randomBytes(2)
        .toString('hex')
        .toUpperCase()}`;

      let transferStatus = 'queued_trade_ban';
      let transferMessage = '';
      let lastTransferError = null;

      // 3. If 48h Trade-Ban has expired (or it's an unlocked @moon profile NFT), transfer immediately via @moon!
      if (!isTradeLocked && giftId) {
        const tr = await moonClient.transferNftGift({
          giftId,
          targetUserId: targetUser.id,
        });
        if (tr.ok) {
          transferStatus = 'transferred';
          transferMessage = `🎉 ${itemTitle} darhol @moon orqali @${targetUser.username} profiliga o‘tkazib berildi!`;
        } else {
          lastTransferError = tr.data?.message || `HTTP ${tr.status}`;
          logSystemError('nft_transfer_queued_or_failed', {
            receiptCode,
            targetUsername: `@${targetUser.username || cleanUser}`,
            targetUserId: targetUser.id,
            itemTitle,
            giftId,
            number,
            error: lastTransferError,
          });
        }
      }

      const hoursLeft = isTradeLocked
        ? Math.max(1, Math.ceil((unlockMs - Date.now()) / (1000 * 60 * 60)))
        : 0;
      if (transferStatus !== 'transferred') {
        transferMessage = isTradeLocked
          ? `🔒 ${itemTitle} @${targetUser.username} (ID: ${targetUser.id}) nomiga rasman band qilindi! Yangi NFTlarda PaxtaGram 48 soatlik Trade-Ban mavjud (${hoursLeft} soat qoldi) — muddat tugashi bilan @moon avtomatik profilingizga o‘tkazadi!`
          : `🔒 ${itemTitle} @${targetUser.username} (ID: ${targetUser.id}) nomiga rasman band qilindi va @moon avto-transfer navbatiga qo‘shildi!`;
      }

      const entry = {
        type: 'nft_calendar',
        receiptCode,
        giftId,
        channelId,
        slug: calMeta?.slug || slug || 'DeskCalendar',
        itemTitle,
        number,
        model,
        backdrop,
        pattern,
        targetUsername: targetUser.username || cleanUser,
        targetUserId: targetUser.id,
        tradeLockedUntil,
        lastError: lastTransferError,
        createdAt: new Date().toISOString(),
        status: transferStatus,
      };
      appState.withdrawals.unshift(entry);
      saveState(true);

      await callCaseBot('sendMessage', {
        chat_id: 100,
        text:
          transferStatus === 'transferred'
            ? `✅ *${itemTitle} Darhol O‘tkazildi!*\n\n🎁 *NFT:* ${itemTitle} (${model})\n👤 *Qabul qiluvchi:* @${targetUser.username} (ID: ${targetUser.id})\n🧾 *Kvitansiya:* \`${receiptCode}\``
            : `⏳ *${itemTitle} Avto-Navbatga Qo‘shildi*\n\n🎁 *NFT:* ${itemTitle} (${model})\n👤 *Qabul qiluvchi:* @${targetUser.username} (ID: ${targetUser.id})\n📍 *Manba:* ${channelId === 100 ? '@moon profili' : channelId}\n🧾 *Kvitansiya:* \`${receiptCode}\`\n🤖 *@moon orqali avtomatik o‘tkazib beriladi!*`,
        parse_mode: 'Markdown',
      });

      return sendJson(res, 200, {
        ok: true,
        receiptCode,
        targetUsername: `@${targetUser.username || cleanUser}`,
        targetUserId: targetUser.id,
        status: transferStatus,
        tradeLockedUntil,
        hoursLeft: isTradeLocked ? hoursLeft : 0,
        message: transferMessage,
      });
    }

    // 7. Admin Dashboard Overview (Users, Balances, Won Items, Pending/Failed Transfers & Error Logs)
    if (req.method === 'GET' && urlPath === '/api/admin/dashboard') {
      const qs = new URLSearchParams(rawUrl.split('?')[1] || '');
      const key = String(qs.get('key') || req.headers['x-admin-key'] || '').trim();
      if (!ADMIN_KEYS.has(key)) {
        return sendJson(res, 403, { ok: false, error: 'Admin parol noto‘g‘ri!' });
      }

      const usersEntries = Object.entries(appState.users || {}).map(([uid, u]) => ({
        userId: uid,
        username: u.tgUsername || u.username || uid,
        firstName: u.tgFirstName || '',
        stars: Number(u.stars) || 0,
        tickets: Number(u.tickets) || 0,
        loyaltyPoints: Number(u.loyaltyPoints) || 0,
        totalOpened: Number(u.totalOpened) || 0,
        totalSpent: Number(u.totalSpent) || 0,
        totalReturned: Number(u.totalReturned) || 0,
        inventory: Array.isArray(u.inventory) ? u.inventory : [],
        wonGifts: Array.isArray(u.wonGifts) ? u.wonGifts : [],
        wonPromos: Array.isArray(u.wonPromos) ? u.wonPromos : [],
        updatedAt: u.updatedAt || null,
      }));
      usersEntries.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));

      const invoicesList = Object.values(appState.invoices || {}).sort((a, b) =>
        (b.createdAt || '').localeCompare(a.createdAt || '')
      );
      const totalPaidStars = invoicesList
        .filter((i) => i.status === 'paid')
        .reduce((s, i) => s + (Number(i.amount) || 0), 0);
      const totalSpentAll = usersEntries.reduce((s, u) => s + u.totalSpent, 0);
      const totalOpenedAll = usersEntries.reduce((s, u) => s + u.totalOpened, 0);
      const withdrawalsList = Array.isArray(appState.withdrawals) ? appState.withdrawals : [];
      const pendingWithdrawals = withdrawalsList.filter(
        (w) => w.status !== 'transferred' && w.status !== 'delivered_instant'
      );

      return sendJson(res, 200, {
        ok: true,
        summary: {
          totalUsers: usersEntries.length,
          totalOpenedAll,
          totalSpentAll,
          totalPaidStars,
          claimedNftsCount: (appState.globalPool?.claimedNftIds || []).length,
          casePoolReserves: appState.globalPool?.casePoolReserves || {},
          totalWithdrawals: withdrawalsList.length,
          pendingWithdrawalsCount: pendingWithdrawals.length,
          errorsCount: (appState.errorLogs || []).length,
        },
        users: usersEntries,
        withdrawals: withdrawalsList.slice(0, 150),
        errorLogs: (appState.errorLogs || []).slice(0, 100),
        invoices: invoicesList.slice(0, 50),
        mintedPromos: (appState.mintedPromos || []).slice(0, 50),
      });
    }

    // 8. Admin Actions (Retry failed/queued transfer, mark transferred, adjust user balance, clear errors)
    if (req.method === 'POST' && urlPath === '/api/admin/action') {
      const body = await readBody(req);
      const key = String(body.key || req.headers['x-admin-key'] || '').trim();
      if (!ADMIN_KEYS.has(key)) {
        return sendJson(res, 403, { ok: false, error: 'Admin parol noto‘g‘ri!' });
      }

      const { action } = body;

      // Action A: Retry NFT or Official Gift transfer immediately via @moon
      if (action === 'retry_transfer') {
        const { receiptCode } = body;
        const w = (appState.withdrawals || []).find((x) => x.receiptCode === receiptCode);
        if (!w) {
          return sendJson(res, 404, { ok: false, error: 'O‘tkazma topilmadi' });
        }

        if (w.type === 'official_gift') {
          const sr = await moonClient.sendOfficialStoreGift({
            targetUserId: w.targetUserId,
            giftId: Number(w.giftId) || 1,
            expectedPrice: Number(w.price) || 50,
            message: `🎁 PaxtaBox (@CaseBot) yutug'ingiz: ${w.title || 'Rasmiy Gift'}!`,
          });
          if (sr.ok) {
            w.status = 'delivered_instant';
            w.lastError = null;
            w.transferredAt = new Date().toISOString();
            saveState(true);
            return sendJson(res, 200, {
              ok: true,
              message: `✅ "${w.title}" rasmiy sovg‘asi @${w.targetUsername} ga muvaffaqiyatli yuborildi!`,
            });
          } else {
            w.lastError = sr.data?.message || `HTTP ${sr.status}`;
            saveState(true);
            return sendJson(res, 400, {
              ok: false,
              error: `Xatolik: ${w.lastError}`,
            });
          }
        } else {
          const tr = await moonClient.transferNftGift({
            giftId: w.giftId,
            targetUserId: w.targetUserId,
          });
          if (tr.ok) {
            w.status = 'transferred';
            w.lastError = null;
            w.transferredAt = new Date().toISOString();
            saveState(true);
            return sendJson(res, 200, {
              ok: true,
              message: `✅ ${w.itemTitle || `NFT #${w.number}`} @${w.targetUsername} ga muvaffaqiyatli o‘tkazildi!`,
            });
          } else {
            w.lastError = tr.data?.message || `HTTP ${tr.status}`;
            saveState(true);
            return sendJson(res, 400, {
              ok: false,
              error: `O‘tkazishda xatolik: ${w.lastError}`,
            });
          }
        }
      }

      // Action B: Mark withdrawal as manually transferred
      if (action === 'mark_transferred') {
        const { receiptCode } = body;
        const w = (appState.withdrawals || []).find((x) => x.receiptCode === receiptCode);
        if (!w) return sendJson(res, 404, { ok: false, error: 'O‘tkazma topilmadi' });
        w.status = w.type === 'official_gift' ? 'delivered_instant' : 'transferred';
        w.lastError = null;
        w.transferredAt = new Date().toISOString();
        saveState(true);
        return sendJson(res, 200, { ok: true, message: 'O‘tkazilgan deb belgilandi!' });
      }

      // Action C: Adjust User Stars Balance (+ or -)
      if (action === 'adjust_balance') {
        const { userId, deltaStars } = body;
        const delta = parseInt(deltaStars, 10) || 0;
        if (!userId || !appState.users[userId]) {
          return sendJson(res, 404, { ok: false, error: 'Foydalanuvchi topilmadi' });
        }
        const u = appState.users[userId];
        u.stars = Math.max(0, (Number(u.stars) || 0) + delta);
        u.pendingAdminStarsDelta = (Number(u.pendingAdminStarsDelta) || 0) + delta;
        u.updatedAt = new Date().toISOString();
        saveState(true);
        return sendJson(res, 200, {
          ok: true,
          newStars: u.stars,
          message: `Balans yangilandi: ${u.stars} ⭐`,
        });
      }

      // Action D: Clear error logs
      if (action === 'clear_errors') {
        appState.errorLogs = [];
        saveState(true);
        return sendJson(res, 200, { ok: true, message: 'Xatoliklar jurnali tozalandi!' });
      }

      return sendJson(res, 400, { ok: false, error: 'Noma’lum amal' });
    }

    return sendJson(res, 404, { ok: false, error: 'API endpoint topilmadi' });
  };
}
