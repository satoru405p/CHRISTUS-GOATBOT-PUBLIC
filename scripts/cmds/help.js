const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;

let fonts;
try {
	fonts = require("../../func/font.js");
} catch (error) {
	fonts = {
		bold: t => t,
		sansSerif: t => t,
		monospace: t => t,
		fancy: t => t
	};
}

function toTitleCase(str) {
	if (!str) return "";
	return str.replace(/\w\S*/g, txt =>
		txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
	);
}

module.exports = {

	config: {
		name: "help",
		aliases: [],
		version: "4.0.0",
		author: "Master Charbel",
		countDown: 5,
		role: 0,

		description: {
			fr: "👁️‍🗨️ Menu des techniques de Satoru Gojo AI"
		},

		category: "info",

		guide: {
			fr:
				"{pn} : ouvrir le domaine\n" +
				"{pn} <commande> : examiner une technique\n" +
				"{pn} basics : techniques essentielles\n" +
				"{pn} search <mot> : rechercher une technique"
		}
	},

	onStart: async function ({ message, args, event, role }) {

		const prefix = getPrefix(event.threadID);
		const arg = args[0]?.toLowerCase();

		// =====================================================
		// RÉCUPÉRATION DES COMMANDES
		// =====================================================

		const allCommands = [];
		const seen = new Set();

		for (const [name, cmd] of commands) {

			if (cmd.config.role > role)
				continue;

			if (!seen.has(name)) {
				seen.add(name);
				allCommands.push(cmd);
			}
		}

		allCommands.sort((a, b) =>
			a.config.name.localeCompare(b.config.name)
		);

		// =====================================================
		// DOMAINE PRINCIPAL
		// =====================================================

		if (!arg) {

			const categorized = {};

			for (const cmd of allCommands) {

				const cat =
					cmd.config.category || "other";

				if (!categorized[cat])
					categorized[cat] = [];

				categorized[cat].push(cmd.config.name);
			}

			const sortedCats =
				Object.keys(categorized).sort();

			let msg = "";

			msg += "╭━━━━━━━━━━━━━━━━━━━━╮\n";
			msg += "       👁️‍🗨️ 𝑮𝑶𝑱𝑶 𝑨𝑰 👁️‍🗨️\n";
			msg += "╰━━━━━━━━━━━━━━━━━━━━╯\n\n";

			msg += "「 ♾️ 𝑰𝑵𝑭𝑰𝑵𝑰𝑻𝒀 𝑫𝑶𝑴𝑨𝑰𝑵 」\n";
			msg += "━━━━━━━━━━━━━━━━━━━━\n";
			msg += `⚡ ${allCommands.length} techniques disponibles\n`;
			msg += "🔵 Limitless • 🔴 Reversal • 👁️ Six Eyes\n\n";

			for (const cat of sortedCats) {

				const cmds =
					categorized[cat].sort();

				msg += `╭─「 🔮 ${toTitleCase(cat)} 」\n`;

				for (let i = 0; i < cmds.length; i += 2) {

					const first =
						cmds[i];

					const second =
						cmds[i + 1];

					msg += `│ 🔹 ${prefix}${first}`;

					if (second)
						msg += `   🔹 ${prefix}${second}`;

					msg += "\n";
				}

				msg += "╰──────────────────\n\n";
			}

			msg += "╭━━━━━━━━━━━━━━━━━━━━╮\n";
			msg += "│ 👁️ 𝐒𝐈𝐗 𝐄𝐘𝐄𝐒 𝐒𝐘𝐒𝐓𝐄𝐌\n";
			msg += "│\n";
			msg += `│ ⚡ ${prefix}help <commande>\n`;
			msg += "│   Examiner une technique\n";
			msg += "│\n";
			msg += `│ 🔮 ${prefix}help basics\n`;
			msg += "│   Techniques essentielles\n";
			msg += "│\n";
			msg += `│ 🔍 ${prefix}help search <mot>\n`;
			msg += "│   Trouver une technique\n";
			msg += "╰━━━━━━━━━━━━━━━━━━━━╯\n\n";

			msg += "♾️ 「 𝐋𝐄𝐒𝐒 𝐏𝐑𝐄𝐒𝐒𝐔𝐑𝐄, 𝐌𝐎𝐑𝐄 𝐏𝐎𝐖𝐄𝐑 」\n";
			msg += "👑 Satoru Gojo AI • Created by Master Charbel";

			return message.reply(msg);
		}

		// =====================================================
		// BASICS
		// =====================================================

		if (arg === "basics") {

			const basicCmdList = [
				"register",
				"items",
				"gift",
				"bal",
				"bank",
				"active",
				"streak",
				"vault",
				"bag",
				"rank",
				"ratings",
				"report",
				"trade",
				"uid",
				"pet",
				"rosashop",
				"garden",
				"arena",
				"mtls"
			];

			const validCommands = [];

			for (const cmdName of basicCmdList) {

				const cmd =
					commands.get(cmdName);

				if (
					cmd &&
					cmd.config.role <= role
				) {
					validCommands.push(cmd);
				}
			}

			if (!validCommands.length) {

				return message.reply(
					"❌ Aucun sort accessible à ton niveau."
				);
			}

			let msg = "";

			msg += "╭━━━━━━━━━━━━━━━━━━━━╮\n";
			msg += "│ 🔵 𝑳𝑰𝑴𝑰𝑻𝑳𝑬𝑺𝑺 𝑩𝑨𝑺𝑰𝑪𝑺\n";
			msg += "╰━━━━━━━━━━━━━━━━━━━━╯\n\n";

			msg += "👁️ Techniques fondamentales\n";
			msg += "━━━━━━━━━━━━━━━━━━━━\n\n";

			for (const cmd of validCommands) {

				const cfg = cmd.config;

				const desc =
					cfg.description?.fr ||
					"Aucune description";

				msg += `🔹 ${prefix}${cfg.name}\n`;
				msg += `   ↳ ${desc}\n\n`;
			}

			msg += "━━━━━━━━━━━━━━━━━━━━\n";
			msg += `♾️ Toutes les techniques : ${prefix}help\n`;
			msg += "👑 Satoru Gojo AI";

			return message.reply(msg);
		}

		// =====================================================
		// SEARCH
		// =====================================================

		if (
			arg === "search" ||
			arg === "find"
		) {

			const searchStr =
				args.slice(1).join(" ").trim();

			if (!searchStr) {

				return message.reply(
					"╭─「 🔍 SIX EYES SEARCH 」\n" +
					"│\n" +
					`│ Utilisation : ${prefix}help search <mot>\n` +
					"│\n" +
					"│ Exemple :\n" +
					`│ ${prefix}help search music\n` +
					"╰──────────────────"
				);
			}

			const results = [];

			const searchLower =
				searchStr.toLowerCase();

			for (const [name, cmd] of commands) {

				if (cmd.config.role > role)
					continue;

				const cfg = cmd.config;

				const searchableText = `
					${cfg.name}
					${cfg.category || ""}
					${(cfg.aliases || []).join(" ")}
					${cfg.description?.fr || ""}
				`.toLowerCase();

				if (
					searchableText.includes(searchLower)
				) {
					results.push(cmd);
				}
			}

			if (!results.length) {

				return message.reply(
					"╭─「 👁️ SIX EYES 」\n" +
					"│\n" +
					"│ ❌ Aucune technique trouvée.\n" +
					"│\n" +
					"│ Même les Six Eyes n'ont rien vu... 👁️😂\n" +
					"╰──────────────────"
				);
			}

			const topResults =
				results.slice(0, 8);

			let msg = "";

			msg += "╭━━━━━━━━━━━━━━━━━━━━╮\n";
			msg += "│ 👁️ 𝑺𝑰𝑿 𝑬𝒀𝑬𝑺 𝑺𝑬𝑨𝑹𝑪𝑯\n";
			msg += "╰━━━━━━━━━━━━━━━━━━━━╯\n\n";

			msg += `🔎 Recherche : 「${searchStr}」\n`;
			msg += `⚡ ${topResults.length} technique(s) trouvée(s)\n\n`;

			for (const cmd of topResults) {

				const cfg = cmd.config;

				msg += `🔹 ${prefix}${cfg.name}\n`;
				msg += `   ↳ ${cfg.description?.fr || "Aucune description"}\n\n`;
			}

			msg += "━━━━━━━━━━━━━━━━━━━━\n";
			msg += "👁️ Six Eyes • Infinity • Limitless";

			return message.reply(msg);
		}

		// =====================================================
		// DÉTAIL D'UNE COMMANDE
		// =====================================================

		const cmdName =
			args[0];

		let cmd =
			commands.get(cmdName);

		if (!cmd) {

			const alias =
				aliases.get(cmdName);

			if (alias)
				cmd = commands.get(alias);
		}

		if (!cmd) {

			return message.reply(
				"╭─「 👁️ SIX EYES 」\n" +
				"│\n" +
				`│ ❌ ${cmdName} n'existe pas.\n` +
				"│\n" +
				"│ Même Gojo ne peut pas utiliser\n" +
				"│ une technique qui n'existe pas. 😂\n" +
				"╰──────────────────"
			);
		}

		const cfg =
			cmd.config;

		let usage =
			cfg.guide?.fr ||
			"Aucun guide disponible";

		usage = usage
			.replace(/{p}/g, prefix)
			.replace(/{n}/g, cfg.name);

		const roleText =
			cfg.role === 0
				? "Tout utilisateur"
				: cfg.role === 1
					? "Admin du groupe"
					: cfg.role === 2
						? "Admin du bot"
						: "Inconnu";

		let detail = "";

		detail += "╭━━━━━━━━━━━━━━━━━━━━╮\n";
		detail += `│ 👁️ 「 ${toTitleCase(cfg.name)} 」\n`;
		detail += "╰━━━━━━━━━━━━━━━━━━━━╯\n\n";

		detail += "🔮 𝐓𝐄𝐂𝐇𝐍𝐈𝐐𝐔𝐄\n";
		detail += `   ${cfg.name}\n\n`;

		detail += "📜 𝐃𝐄𝐒𝐂𝐑𝐈𝐏𝐓𝐈𝐎𝐍\n";
		detail += `   ${cfg.description?.fr || "Aucune"}\n\n`;

		detail += "⚡ 𝐔𝐓𝐈𝐋𝐈𝐒𝐀𝐓𝐈𝐎𝐍\n";
		detail += `   ${usage}\n\n`;

		detail += "👑 𝐈𝐍𝐅𝐎𝐒\n";
		detail += `   Auteur : ${cfg.author || "Inconnu"}\n`;
		detail += `   Catégorie : ${cfg.category || "other"}\n`;
		detail += `   Cooldown : ${cfg.countDown || 1}s\n`;
		detail += `   Accès : ${roleText}\n`;

		detail += "\n👁️ 𝐒𝐈𝐗 𝐄𝐘𝐄𝐒\n";
		detail += `   Alias : ${
			cfg.aliases?.length
				? cfg.aliases.join(", ")
				: "Aucun"
		}\n\n`;

		detail += "━━━━━━━━━━━━━━━━━━━━\n";
		detail += "♾️ LIMITLESS • 🔵 BLUE • 🔴 RED\n";
		detail += "👑 Satoru Gojo AI\n";
		detail += "Created by Master Charbel";

		return message.reply(detail);
	}
};
