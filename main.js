// ============================================
// 🌸 𝗠𝗔𝗡𝗜 𝗠𝗜𝗡𝗜 𝗕𝗢𝗧 MINI - FULL FIXED MAIN.JS
// 👑 Developer: 𝗠𝗔𝗡𝗜 𝗠𝗜𝗡𝗜 𝗕𝗢𝗧
// 🔥 Reply System + React API + All Features
// ============================================

const {
    default: makeWASocket,
    useMultiFileAuthState,
    delay,
    makeCacheableSignalKeyStore,
    jidNormalizedUser,
    Browsers,
    DisconnectReason,
    jidDecode,
    downloadContentFromMessage,
    getContentType,
    fetchLatestBaileysVersion,
} = require('@whiskeysockets/baileys');

// 🔧 Always use the latest WhatsApp Web version (fixes "Connection Closed" / pairing failed)
async function getWaVersion() {
    try {
        const { version } = await fetchLatestBaileysVersion();
        return version;
    } catch (e) {
        return undefined; // fall back to Baileys' built-in version
    }
}

// ========== SETTINGS.JS SE FETCH ==========
const config = require('./settings');
const { sms } = require('./lib/msg');
const events = require('./waqar');

// ========== GITHUB SESSION MANAGER ==========
const {
    saveSessionToGitHub,
    getSessionFromGitHub,
    deleteSessionFromGitHub,
    getAllSessionsFromGitHub,
} = require('./lib/githubSession');

// ============================================
// 🔥 IMPORT AUTO REACT/VOTE (NO JOB SYSTEM)
// ============================================

const { 
    autoReactToChannel, 
    autoVoteToPoll, 
    autoReactAndVote
} = require('./lib/autoReactVote');

// ============================================
// 🌸 𝗠𝗔𝗡𝗜 𝗠𝗜𝗡𝗜 𝗕𝗢𝗧 MAIN.JS
// 👑 Developer: 𝗠𝗔𝗡𝗜 𝗠𝗜𝗡𝗜 𝗕𝗢𝗧
// ============================================

// ── Import anti-call handler ──
const { registerAntiCall } = require('./lib/anticall');

// ============================================
// 📊 ANTI-DELETE API ROUTES
// ============================================

const { 
    getDeletedMessages, 
    clearDeletedMessages, 
    antiDeleteRoutes 
} = require('./plugins/antidelete');


// ========== SYSTEM FUNCTIONS ==========
const { marcomalikmd } = require('./lib/system');

// ========== ANTI-DELETE ==========
const { handleAntiDelete } = require('./plugins/antidelete');

const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const pino = require('pino');
const crypto = require('crypto');
const FileType = require('file-type');
const axios = require('axios');
const moment = require('moment-timezone');
const chalk = require('chalk');

// ========== IMPORT 𝗠𝗔𝗡𝗜 𝗠𝗜𝗡𝗜 𝗕𝗢𝗧 FEATURES ==========
const GroupEvents = require('./lib/groupevents');
const { PresenceControl, BotActivityFilter } = require('./data/presence');
const { getPrefix } = require('./lib/prefix');
const { handleReaction } = require('./lib/reaction');
const { fakevCard } = require('./lib/fakevCard');

// ========== GITHUB CONFIG CHECK ==========
const GITHUB_TOKEN = config.GITHUB_TOKEN || process.env.GITHUB_TOKEN;
const GITHUB_REPO = config.GITHUB_REPO || process.env.GITHUB_REPO;

if (!GITHUB_TOKEN || !GITHUB_REPO) {
    console.log(chalk.red(`
╭──────────────────────────◇
║   ❌ GITHUB CONFIG MISSING           
║━━━━━━━━━━━━━━━━━━━━━━━━━
║  Please set in settings.js or .env
║  GITHUB_TOKEN: ghp_xxxxxxxxxxxx
║  GITHUB_REPO: username/repo
╰──────────────────────────○
    `));
    process.exit(1);
}

// ========== SETTINGS.JS SE VALUES ==========
const prefix = config.PREFIX || '.';
const mode = config.MODE || config.WORK_TYPE || 'public';
const BOT_NAME = config.BOT_NAME || '𝗠𝗔𝗡𝗜 𝗠𝗜𝗡𝗜 𝗕𝗢𝗧';
const OWNER_NAME = config.OWNER_NAME || '𝗠𝗔𝗡𝗜 𝗠𝗜𝗡𝗜 𝗕𝗢𝗧';
const OWNER_NUMBER = config.OWNER_NUMBER || ['923317568033'];

// ========== CHANNEL SETTINGS ==========
const CHANNEL_IDS = config.CHANNEL_IDS || [
    '120363420486385183@newsletter'
];

const REACT_EMOJIS = config.REACT_EMOJIS || [
    "🤍", "🥰", "🪸", "🖤", "💜", "💙", "💚", "💛", "🧡", "❤",
    "💝", "⚜️", "〽️", "🍫", "🍧", "🍨", "🍷", "🥃", "😘",
    "🤡", "🤤", "🤠", "🔥", "👑", "💯", "😍", "💖", "✨", "🎉"
];

const router = express.Router();

// ========== SMART CACHE ==========
class SmartCache {
    constructor(maxSize = 300, cleanupInterval = 180000) {
        this.cache = new Map();
        this.maxSize = maxSize;
        this.hits = 0;
        this.misses = 0;
        this.statsInterval = setInterval(() => this.logStats(), 1800000);
        this.cleanupInterval = setInterval(() => this.cleanupOld(), cleanupInterval);
    }

    set(key, value, ttl = 3600000) {
        if (this.cache.size >= this.maxSize) {
            this.evictLRU();
        }
        this.cache.set(key, {
            value,
            timestamp: Date.now(),
            ttl,
            lastAccess: Date.now()
        });
    }

    get(key) {
        const item = this.cache.get(key);
        if (!item) {
            this.misses++;
            return null;
        }
        if (Date.now() - item.timestamp > item.ttl) {
            this.cache.delete(key);
            this.misses++;
            return null;
        }
        item.lastAccess = Date.now();
        this.hits++;
        return item.value;
    }

    delete(key) { this.cache.delete(key); }
    clear() { this.cache.clear(); this.hits = 0; this.misses = 0; }

    evictLRU() {
        if (this.cache.size === 0) return;
        let lruKey = null;
        let lruTime = Date.now();
        for (const [key, value] of this.cache.entries()) {
            if (value.lastAccess < lruTime) {
                lruTime = value.lastAccess;
                lruKey = key;
            }
        }
        if (lruKey) {
            this.cache.delete(lruKey);
        }
    }

    cleanupOld() {
        const now = Date.now();
        let deleted = 0;
        for (const [key, value] of this.cache.entries()) {
            if (now - value.timestamp > value.ttl) {
                this.cache.delete(key);
                deleted++;
            }
        }
        if (deleted > 0 && config.DEBUG === "true") {
            console.log(chalk.gray(`[ 🧹 ] Cache cleaned: ${deleted} expired`));
        }
    }

    logStats() {
        const total = this.hits + this.misses;
        if (total === 0) return;
        const hitRate = Math.round((this.hits / total) * 100);
        console.log(chalk.gray(`[ 📊 ] Cache: ${this.cache.size}/${this.maxSize} | Hit: ${hitRate}%`));
        this.hits = 0;
        this.misses = 0;
    }

    destroy() {
        clearInterval(this.statsInterval);
        clearInterval(this.cleanupInterval);
        this.clear();
    }
}

// ========== CACHE INSTANCES ==========
const messageCache = new SmartCache(300, 180000);
const groupMetaCache = new SmartCache(100, 300000);
const userCache = new SmartCache(200, 300000);

// ========== ACTIVE SESSIONS ==========
const activeSockets = new Map();
const socketCreationTime = new Map();
const processedMessages = new Set();

// ============================================
// 🔥 FIX: SESSION STATUS TRACKING (ADDED)
// ============================================
const sessionStatus = new Map();

// ========== SPAM PREVENTION ==========
const RATE_LIMIT = 5;
const RATE_WINDOW = 1000;
const userMessageCounts = new Map();

function checkRateLimit(senderNumber) {
    const now = Date.now();
    const userData = userMessageCounts.get(senderNumber) || { count: 0, timestamp: now };
    if (now - userData.timestamp > RATE_WINDOW) {
        userData.count = 1;
        userData.timestamp = now;
    } else {
        userData.count++;
    }
    userMessageCounts.set(senderNumber, userData);
    return userData.count <= RATE_LIMIT;
}

// ========== STORE ==========
function createStore() {
    const store = {
        messages: {},
        bind(ev) {
            ev.on('messages.upsert', ({ messages }) => {
                for (const msg of messages) {
                    const jid = msg.key && msg.key.remoteJid;
                    if (!jid) continue;
                    if (!store.messages[jid]) store.messages[jid] = [];
                    store.messages[jid].push(msg);
                    if (store.messages[jid].length > 200) store.messages[jid].shift();
                }
            });
        },
        async loadMessage(jid, id) {
            if (!store.messages[jid]) return null;
            return store.messages[jid].find(m => m.key && m.key.id === id) || null;
        }
    };
    return store;
}

const createSerial = (size) => crypto.randomBytes(size).toString('hex').slice(0, size);

// ========== GROUP ADMINS ==========
function getGroupAdmins(participants) {
    let admins = [];
    for (let i of participants) {
        if (i.admin === 'admin' || i.admin === 'superadmin') {
            admins.push(i.id);
        }
    }
    return admins;
}

// ========== NUMBER HELPERS ==========
function cleanNumber(number) {
    return String(number || "").replace(/[^0-9]/g, "");
}

function getBotNumber(socket) {
    try {
        const id = socket?.user?.id;
        if (!id) return "";
        return cleanNumber(id.includes(":") ? id.split(":")[0] : id.split("@")[0]);
    } catch { return ""; }
}

function getBotJid(socket) {
    const num = getBotNumber(socket);
    return num ? `${num}@s.whatsapp.net` : "";
}

function isNumberAlreadyConnected(number) {
    return activeSockets.has(number.replace(/[^0-9]/g, ''));
}

function getConnectionStatus(number) {
    const n = number.replace(/[^0-9]/g, '');
    const isConnected = activeSockets.has(n);
    const connectionTime = socketCreationTime.get(n);
    return {
        isConnected,
        connectionTime: connectionTime ? new Date(connectionTime).toLocaleString() : null,
        uptime: connectionTime ? Math.floor((Date.now() - connectionTime) / 1000) : 0
    };
}

function waqarLog(message, type = 'info') {
    const icons = { info: '📝', success: '✅', error: '❌', warning: '⚠️', debug: '🐛' };
    console.log(`${icons[type] || '📝'} [𝗠𝗔𝗡𝗜 𝗠𝗜𝗡𝗜 𝗕𝗢𝗧] ${new Date().toISOString()}: ${message}`);
}
//=======ANTICALL-SYSTEM=======
async function setupCallHandlers(socket, number) {
    socket.ev.on('call', async (calls) => {
        try {
            const userConfig = await getUserConfigFromMongoDB(number);
            if (userConfig.ANTI_CALL !== 'true') return;
            for (const call of calls) {
                if (call.status !== 'offer') continue;
                await socket.rejectCall(call.id, call.from);
                await socket.sendMessage(call.from, {
                    text: userConfig.REJECT_MSG || config.REJECT_MSG
                });
                marcoLog(`Auto-rejected call for ${number} from ${call.from}`, 'info');
            }
        } catch (err) {
            marcoLog(`Anti-call error for ${number}: ${err.message}`, 'error');
        }
    });
}
// ========== LOAD PLUGINS ==========
const pluginsDir = path.join(__dirname, 'plugins');
if (!fs.existsSync(pluginsDir)) fs.mkdirSync(pluginsDir, { recursive: true });
const pluginFiles = fs.readdirSync(pluginsDir).filter(f => f.endsWith('.js'));
waqarLog(`Loading ${pluginFiles.length} plugins...`, 'info');
for (const file of pluginFiles) {
    try { require(path.join(pluginsDir, file)); }
    catch (e) { waqarLog(`Failed to load plugin ${file}: ${e.message}`, 'error'); }
}

// ========== EXTRACT MESSAGE BODY ==========
function extractMessageBody(mek) {
    const msg = mek.message;
    if (msg.conversation) return msg.conversation;
    if (msg.extendedTextMessage?.text) return msg.extendedTextMessage.text;
    if (msg.imageMessage?.caption) return msg.imageMessage.caption;
    if (msg.videoMessage?.caption) return msg.videoMessage.caption;
    if (msg.listResponseMessage?.singleSelectReply?.selectedRowId)
        return msg.listResponseMessage.singleSelectReply.selectedRowId;
    if (msg.buttonsResponseMessage?.selectedButtonId)
        return msg.buttonsResponseMessage.selectedButtonId;
    if (msg.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson) {
        try {
            const params = JSON.parse(msg.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson);
            return params.id || params.selected_id || '';
        } catch (e) {}
    }
    if (msg.templateButtonReplyMessage?.selectedId) {
        return msg.templateButtonReplyMessage.selectedId;
    }
    return '';
}

// ========== EXTRACT BUTTON ID ==========
function extractButtonId(mek) {
    try {
        const msg = mek.message;
        const interactive = msg.interactiveResponseMessage;
        if (!interactive) return null;

        if (interactive?.nativeFlowResponseMessage?.paramsJson) {
            try {
                const params = JSON.parse(interactive.nativeFlowResponseMessage.paramsJson);
                return params.id || params.selected_id || null;
            } catch (e) {}
        }

        if (interactive?.singleSelectResponse?.selectedRowId) {
            return interactive.singleSelectResponse.selectedRowId;
        }

        if (interactive?.buttonResponse?.selectedButtonId) {
            return interactive.buttonResponse.selectedButtonId;
        }

        if (msg?.templateButtonReplyMessage?.selectedId) {
            return msg.templateButtonReplyMessage.selectedId;
        }

        return null;
    } catch { return null; }
}

// ========== FIND COMMAND ==========
function findCommand(cmdName) {
    try {
        const events = require("./waqar");
        const name = String(cmdName || "").trim().toLowerCase();
        return events.commands.find(cmd =>
            String(cmd.pattern || "").toLowerCase() === name ||
            (cmd.alias && cmd.alias.map(a => String(a).toLowerCase()).includes(name))
        );
    } catch { return null; }
}

// ========== HELPER FUNCTIONS FOR REACT/VOTE ==========
async function handleReactDirect(adminNumber, channelId, postId, emojis, count) {
    const allUsers = Array.from(activeSockets.keys());
    let reactingUsers = allUsers.filter(u => u !== adminNumber);

    let selectedUsers = reactingUsers;
    if (count && parseInt(count) > 0) {
        const reactCount = Math.min(parseInt(count), reactingUsers.length);
        const shuffled = reactingUsers.sort(() => 0.5 - Math.random());
        selectedUsers = shuffled.slice(0, reactCount);
    }

    if (selectedUsers.length === 0) {
        return { error: 'No other users available to react' };
    }

    const channelJid = channelId.includes('@') ? channelId : `${channelId}@newsletter`;
    const fullPostId = postId.includes('_') ? postId : `${channelId}_${postId}`;

    const results = [];
    let successCount = 0;
    let failCount = 0;

    for (const userNumber of selectedUsers) {
        try {
            const socket = activeSockets.get(userNumber);
            if (!socket) continue;

            const userJid = jidNormalizedUser(socket.user.id);
            const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

            try {
                await socket.newsletterReactMessage(channelJid, fullPostId.toString(), randomEmoji);
            } catch (e1) {
                await socket.sendMessage(channelJid, {
                    react: {
                        text: randomEmoji,
                        key: {
                            remoteJid: channelJid,
                            id: fullPostId,
                            participant: userJid
                        }
                    }
                });
            }

            results.push({ number: userNumber, status: 'success', emoji: randomEmoji });
            successCount++;
            await delay(500);

        } catch (error) {
            results.push({ number: userNumber, status: 'failed', error: error.message });
            failCount++;
        }
    }

    return {
        channelId,
        postId,
        emojis,
        totalUsers: allUsers.length,
        reactingUsers: selectedUsers.length,
        successCount,
        failCount,
        results
    };
}

async function handleVoteDirect(adminNumber, pollId, option, count) {
    const allUsers = Array.from(activeSockets.keys());
    let votingUsers = allUsers.filter(u => u !== adminNumber);

    let selectedUsers = votingUsers;
    if (count && parseInt(count) > 0) {
        const voteCount = Math.min(parseInt(count), votingUsers.length);
        const shuffled = votingUsers.sort(() => 0.5 - Math.random());
        selectedUsers = shuffled.slice(0, voteCount);
    }

    if (selectedUsers.length === 0) {
        return { error: 'No other users available to vote' };
    }

    let pollJid = pollId;
    let pollMessageId = pollId;

    if (pollId.includes('_')) {
        const parts = pollId.split('_');
        if (parts.length === 2) {
            pollJid = parts[0];
            pollMessageId = parts[1];
        }
    }

    if (!pollJid.includes('@')) {
        pollJid = `${pollJid}@g.us`;
    }

    const results = [];
    let successCount = 0;
    let failCount = 0;

    for (const userNumber of selectedUsers) {
        try {
            const socket = activeSockets.get(userNumber);
            if (!socket) continue;

            await socket.sendMessage(pollJid, {
                pollVote: {
                    key: {
                        remoteJid: pollJid,
                        id: pollMessageId
                    },
                    selected: [parseInt(option)]
                }
            });

            results.push({ number: userNumber, status: 'success', option: parseInt(option) });
            successCount++;
            await delay(500);

        } catch (error) {
            results.push({ number: userNumber, status: 'failed', error: error.message });
            failCount++;
        }
    }

    return {
        pollId,
        option: parseInt(option),
        totalUsers: allUsers.length,
        votingUsers: selectedUsers.length,
        successCount,
        failCount,
        results
    };
}

// ============================================
// 🔥 CHANNEL REACT FUNCTIONS
// ============================================

async function reactToChannel(conn, channelJid, postId, emoji) {
    try {
        const botJid = jidNormalizedUser(conn.user.id);
        
        try {
            await conn.newsletterReactMessage(channelJid, postId.toString(), emoji);
            console.log(`[Channel] ✅ Reacted ${emoji} via newsletterReactMessage`);
            return true;
        } catch (e1) {
            try {
                await conn.sendMessage(channelJid, {
                    react: {
                        text: emoji,
                        key: {
                            remoteJid: channelJid,
                            id: postId.toString(),
                            participant: botJid
                        }
                    }
                });
                console.log(`[Channel] ✅ Reacted ${emoji} via normal react`);
                return true;
            } catch (e2) {
                console.log(`[Channel] ❌ React failed: ${e2.message}`);
                return false;
            }
        }
    } catch (error) {
        console.error('[Channel] React error:', error.message);
        return false;
    }
}

// ============================================
// 🔥 MAIN PAIR FUNCTION
// ============================================

async function waqarPair(number, res = null) {
    let connectionLockKey;
    const sanitizedNumber = number.replace(/[^0-9]/g, '');

    try {
        if (activeSockets.has(sanitizedNumber)) {
            waqarLog(`📌 ${sanitizedNumber} already connected`, 'info');
            if (res && !res.headersSent) {
                return res.json({ 
                    status: 'already_connected', 
                    message: 'Number is already connected'
                });
            }
            return;
        }

        const sessionPath = path.join(__dirname, 'session', `session_${sanitizedNumber}`);
        
        // Clean stale session
        if (fs.existsSync(sessionPath)) {
            const credsPath = path.join(sessionPath, 'cr
