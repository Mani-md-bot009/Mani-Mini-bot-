// ============================================
// 🌸 JID - 𝗠𝗔𝗡𝗜 𝗠𝗜𝗡𝗜 𝗕𝗢𝗧
// 👑 Developer: 𝗠𝗔𝗡𝗜 𝗠𝗜𝗡𝗜 𝗕𝗢𝗧
// 💖 Boys Power Mode: ON
// ============================================

const { waqar } = require('../waqar');

waqar({
    pattern: "jid",
    alias: ["id", "chatid", "gjid"],
    desc: "🌸 Get full JID of current chat (Owner Only)",
    category: "owner",
    react: "🌸",
    filename: __filename
}, async (waqar, mek, m, { from, isGroup, isOwner, isCreator, reply, sender }) => {
    try {
        if (!isOwner && !isCreator) {
            return reply(`🌸 Only my owner can use this! 🦁💖`);
        }

        if (isGroup) {
            return reply(`👥 *Group JID:*\n\`\`\`${from}\`\`\``);
        } else {
            return reply(`👤 *User JID:*\n\`\`\`${sender}\`\`\``);
        }

    } catch (e) {
        console.error("🌸 JID Error:", e);
        reply(`⚠️ Error: ${e.message}`);
    }
});

console.log('🌸 𝗠𝗔𝗡𝗜 𝗠𝗜𝗡𝗜 𝗕𝗢𝗧 - JID plugin loaded! 💖');
