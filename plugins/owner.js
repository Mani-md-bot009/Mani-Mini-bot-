// ============================================
// 👑 OWNER - 𝗠𝗔𝗡𝗜 𝗠𝗜𝗡𝗜 𝗕𝗢𝗧
// 👑 Developer: 𝗠𝗔𝗡𝗜 𝗠𝗜𝗡𝗜 𝗕𝗢𝗧
// 💖 Boys Power Mode: ON
// 📌 Owner info + Developer commands
// ============================================

const { waqar } = require('../waqar');
const { sendInteractiveMessage } = require('gifted-btns');
const config = require('../config');
const fs = require('fs');
const path = require('path');
const { runtime, sleep } = require('../lib/functions');

// ============================================
// 📌 DEVELOPER INFO
// ============================================
const DEV_INFO = {
    name: "𝗠𝗔𝗡𝗜 𝗠𝗜𝗡𝗜 𝗕𝗢𝗧",
    channel: "https://whatsapp.com/channel/0029Vb60cZWI1rcauQ1lpn0Y",
    group: "https://chat.whatsapp.com/GmdWc3gy7VBJ7FUu1YJy0C?s=cl&p=a&iam=2",
    github: "https://github.com/YOUR_GITHUB_USER",
    telegram: "https://t.me/Mani375",
};

// ============================================
// 👑 OWNER / DEVELOPER INFO COMMAND
// ============================================
waqar({
    pattern: "owner",
    alias: ["creator", "dev", "developer", "about"],
    desc: "🌸 Get developer/owner information",
    category: "info",
    react: "👑",
    filename: __filename
}, async (waqar, mek, m, { from, reply }) => {
    try {
        const uptime = runtime(process.uptime());
        const botName = config.BOT_NAME || "🌸 𝗠𝗔𝗡𝗜 𝗠𝗜𝗡𝗜 𝗕𝗢𝗧 🌸";

        const text = `
╭═══✿══════════════╗
│  ✿ 👑 𝗗𝗘𝗩𝗘𝗟𝗢𝗣𝗘𝗥 ✿
│  ✿━━━━━━━━━━━━━━━✿
│  ✿ 🤖 Bot: ${botName}
│  ✿ 👤 Name: ${DEV_INFO.name}
│  ✿ ⏳ Uptime: ${uptime}
╰═══✿══════════════╝

💖 *Join Channel:*
${DEV_INFO.channel}

💖 *Join Group:*
${DEV_INFO.group}

💖 *GitHub:*
${DEV_INFO.github}

💖 *Website:*
${DEV_INFO.website}

🌸 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗠𝗔𝗡𝗜 𝗠𝗜𝗡𝗜 𝗕𝗢𝗧 💖
        `.trim();

        // ── Send with Buttons ──
        await sendInteractiveMessage(waqar, from, {
            text: text,
            footer: `💖 ${botName}`,
            interactiveButtons: [
                ...(config.OWNER_LINK ? [{
                    name: 'cta_url',
                    buttonParamsJson: JSON.stringify({
                        display_text: '📱 CONTACT OWNER',
                        url: config.OWNER_LINK
                    })
                }] : []),
                {
                    name: 'cta_url',
                    buttonParamsJson: JSON.stringify({
                        display_text: '🎀 CHANNEL',
                        url: DEV_INFO.channel
                    })
                },
                {
                    name: 'cta_url',
                    buttonParamsJson: JSON.stringify({
                        display_text: '👥 GROUP',
                        url: DEV_INFO.group
                    })
                },
                {
                    name: 'cta_url',
                    buttonParamsJson: JSON.stringify({
                        display_text: '💻 GITHUB',
                        url: DEV_INFO.github
                    })
                },
                {
                    name: 'cta_url',
                    buttonParamsJson: JSON.stringify({
                        display_text: '🌐 WEBSITE',
                        url: DEV_INFO.website
                    })
                }
            ]
        });

    } catch (error) {
        console.error('🌸 Owner Error:', error);
        reply(`❌ Error: ${error.message}`);
    }
});

// ============================================
// 👑 SHUTDOWN / RESTART COMMAND
// ============================================
waqar({
    pattern: "shutdown",
    alias: ["restart", "reboot"],
    desc: "👑 Restart the bot (Owner only)",
    category: "owner",
    react: "🔄",
    filename: __filename
}, async (waqar, mek, m, { from, isOwner, reply }) => {
    if (!isOwner) return reply("🌸 *Access Denied!* 💕\n\nOnly owner can use this command.");

    await reply("🔄 *Restarting bot...* Please wait! 💖");
    await sleep(2000);
    process.exit(0);
});
