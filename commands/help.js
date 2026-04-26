module.exports = {
  config: {
    name: 'help',
    aliases: ['menu', 'commands', 'h', 'الاوامر'],
    version: '4.8',
    author: 'NeoKEX',
    description: 'عرض قائمة الأوامر المتاحة',
    usage: 'help [اسم الأمر]',
    cooldown: 3,
    role: 0, // متاح للجميع
    category: 'system'
  },

  async run({ api, event, args, bot, config, logger }) {
    try {
      const { commandLoader } = bot;
      // تأكد من جلب البريفكس بشكل صحيح حتى لو تغير في config
      const prefix = config.prefix || '~'; 
      const allCommands = commandLoader.commands;

      const roleNames = {
        0: 'Normal User',
        1: 'Group Admin',
        2: 'Bot Admin',
        3: 'Premium User',
        4: 'Developer'
      };

      const emojiMap = {
        ai: '🤖', 'ai-image': '🎨', group: '👥', system: '⚙️',
        fun: '🎮', owner: '👑', config: '🔧', economy: '💰',
        media: '🎬', tools: '🛠️', utility: '🛠️', info: 'ℹ️',
        image: '🖼️', game: '🎲', admin: '👑', rank: '📊',
        boxchat: '💬', moderation: '🛡️', others: '📦'
      };

      const cleanCategory = (text) => {
        if (!text) return 'others';
        return text
          .normalize('NFKD')
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, ' ')
          .trim()
          .toLowerCase();
      };

      // ── تفاصيل أمر محدد ──────────────────────────────────────────
      if (args.length > 0) {
        const query = args[0].toLowerCase();
        const cmd = commandLoader.getCommand(query);

        if (!cmd) {
          return api.sendMessage(
            `❌ الأمر "${query}" غير موجود.\n\nاكتب ${prefix}help لعرض كل الأوامر.`,
            event.threadId
          );
        }

        const {
          name, version, author, usage, category,
          description, aliases, cooldown, role
        } = cmd.config;

        const roleName = roleNames[role] ?? 'Normal User';
        const usageStr = usage
          ? usage.replace(/\{pn\}/g, prefix)
          : `${prefix}${name}`;

        let info = `ℹ️ 𝗜𝗡𝗙𝗢 𝗖𝗢𝗠𝗠𝗔𝗡𝗗 ℹ️\n\n`;
        info += `➥ الاسم: ${name}\n`;
        info += `➥ الفئة: ${category || 'عام'}\n`;
        info += `➥ الوصف: ${description || 'لا يوجد وصف'}\n`;
        info += `➥ الاختصارات: ${aliases?.length ? aliases.join(', ') : 'لا يوجد'}\n`;
        info += `➥ الاستخدام: ${usageStr}\n`;
        info += `➥ الانتظار: ${cooldown || 0} ثانية\n`;
        info += `➥ الصلاحية: ${roleName}\n`;

        return api.sendMessage(info, event.threadId);
      }

      // ── قائمة الأوامر الكاملة ──────────────────────────────────────────────
      const categories = {};
      let totalUnique = 0;

      for (const [key, cmd] of allCommands) {
        if (cmd.config.name !== key) continue; // تخطي الاختصارات
        
        const cat = cleanCategory(cmd.config.category);
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push(cmd.config.name);
        totalUnique++;
      }

      let msg = `━━━ ✨ ${config.nickNameBot || 'InstaBOT'} ✨ ━━━\n`;
      msg += `│ البريفكس: ${prefix}  │  الأوامر: ${totalUnique}\n`;

      const sortedCats = Object.keys(categories).sort();
      for (const cat of sortedCats) {
        const emoji = emojiMap[cat] || '⭐';
        const cmds  = categories[cat].sort().map(c => `${c}`).join(' ، ');
        msg += `\n╭──『 ${emoji} ${cat.toUpperCase()} 』\n`;
        msg += `│ ${cmds}\n`;
        msg += `╰────────────◊\n`;
      }

      msg += `\n➥ اكتب: ${prefix}help [اسم الأمر] للتفاصيل`;

      return api.sendMessage(msg, event.threadId);

    } catch (error) {
      logger.error('Error in help command', { error: error.message });
      return api.sendMessage('❌ حدث خطأ أثناء عرض قائمة الأوامر.', event.threadId);
    }
  }
};
