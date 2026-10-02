const OWNER = "Master Charbel";
const CURRENCY = "💰";

// ═══════════════════════════════════════════════════════════
// ⚙️ RÉGLAGES DU JEU
// ═══════════════════════════════════════════════════════════
const COLLECT_MAX_HOURS = 12;   // gains accumulés au maximum sur 12 h (il faut revenir collecter)
const UPGRADE_COST_MULT = 1.6;  // chaque niveau coûte 60 % de plus
const UPGRADE_GAIN_MULT = 1.35; // chaque niveau rapporte 35 % de plus
const MAX_LEVEL = 10;
const SELL_RATIO = 0.5;         // revente à 50 % de la valeur investie
const EVENT_CHANCE = 0.12;      // 12 % de chance d'événement à chaque collecte

// id : { nom, prix, gain par heure, emoji, description }
const SHOPS = {
	cafe:      { name: "Café de l'Anteiku",    price: 2000,    income: 120,   icon: "☕", desc: "Le refuge des ghouls et des humains." },
	librairie: { name: "Librairie de Tokyo",   price: 8000,    income: 450,   icon: "📚", desc: "Manga, romans et secrets bien gardés." },
	masques:   { name: "Atelier de Masques",   price: 25000,   income: 1300,  icon: "🎭", desc: "Chaque ghoul a besoin de son masque." },
	restaurant:{ name: "Restaurant Discret",   price: 80000,   income: 4000,  icon: "🍜", desc: "Le menu du jour est... spécial." },
	club:      { name: "Club de Shibuya",      price: 250000,  income: 11500, icon: "🎶", desc: "La nuit appartient aux ghouls." },
	laboratoire:{ name: "Laboratoire RC",      price: 800000,  income: 34000, icon: "🧪", desc: "Cellules RC, recherche et profits." },
	empire:    { name: "Empire d'Aogiri",      price: 3000000, income: 115000,icon: "👑", desc: "Le sommet du monde des ghouls." }
};

const ALIASES = {
	cafe: "cafe", café: "cafe", anteiku: "cafe",
	librairie: "librairie", livres: "librairie", lib: "librairie",
	masques: "masques", masque: "masques", atelier: "masques",
	restaurant: "restaurant", resto: "restaurant",
	club: "club", shibuya: "club",
	laboratoire: "laboratoire", labo: "laboratoire", rc: "laboratoire",
	empire: "empire", aogiri: "empire"
};

const EVENTS = [
	{ text: "Une horde de clients affamés a envahi le café !", mult: 1.5 },
	{ text: "Un critique célèbre a adoré votre établissement.", mult: 1.4 },
	{ text: "Une enquête de la CCG a fait fuir les clients.", mult: 0.6 },
	{ text: "Un ghoul errant a saccagé la devanture.", mult: 0.7 },
	{ text: "Un généreux client a laissé un énorme pourboire !", mult: 1.3 }
];

const HEADER =
	"╭─────── ☕ ───────╮\n" +
	"   💼 𝐄𝐌𝐏𝐈𝐑𝐄 𝐃𝐔 𝐆𝐇𝐎𝐔𝐋\n" +
	"╰─────── ☕ ───────╯\n\n";

const FOOTER = "\n\n━━━━━━━━━━━━━━━━━━━\n☕ 𝐒𝐇𝐀𝐃𝐎𝐖 𝐆𝐇𝐎𝐔𝐋 • " + OWNER;

// ═══════════════════════════════════════════════════════════
// 🔧 UTILITAIRES
// ═══════════════════════════════════════════════════════════
function fmt(n) {
	return Math.floor(Number(n)).toLocaleString("fr-FR");
}

function rand(arr) {
	return arr[Math.floor(Math.random() * arr.length)];
}

function bar(percent, size) {
	const total = size || 10;
	const p = Math.max(0, Math.min(100, percent));
	const filled = Math.round((p / 100) * total);
	return "█".repeat(filled) + "░".repeat(total - filled);
}

function duration(ms) {
	const s = Math.floor(ms / 1000);
	const h = Math.floor(s / 3600);
	const m = Math.floor((s % 3600) / 60);
	return h ? h + "h " + m + "min" : m + "min";
}

// Revenu par heure d'un commerce selon son niveau
function incomePerHour(shopId, level) {
	return Math.floor(SHOPS[shopId].income * Math.pow(UPGRADE_GAIN_MULT, level - 1));
}

// Coût pour passer au niveau suivant
function upgradeCost(shopId, level) {
	return Math.floor(SHOPS[shopId].price * Math.pow(UPGRADE_COST_MULT, level));
}

// Total investi dans un commerce (achat + améliorations), sert à la revente
function invested(shopId, level) {
	let total = SHOPS[shopId].price;
	for (let l = 1; l < level; l++) total += upgradeCost(shopId, l);
	return total;
}

function resolveShop(text) {
	return ALIASES[String(text || "").toLowerCase()] || null;
}

async function getMoney(usersData, uid) {
	const m = await usersData.get(uid, "money");
	return Number.isFinite(Number(m)) ? Number(m) : 0;
}

async function setMoney(usersData, uid, amount) {
	await usersData.set(uid, { money: Math.max(0, Math.floor(amount)) });
}

// Les données du business sont dans la fiche de l'utilisateur : usersData.get(uid, "data.business")
async function getBiz(usersData, uid) {
	const biz = await usersData.get(uid, "data.business");
	if (biz && typeof biz === "object" && biz.shops) return biz;
	return { shops: {}, lastCollect: Date.now(), totalEarned: 0 };
}

async function saveBiz(usersData, uid, biz) {
	await usersData.set(uid, biz, "data.business");
}

// Gains accumulés depuis la dernière collecte (plafonnés à COLLECT_MAX_HOURS)
function pending(biz) {
	const hours = Math.min((Date.now() - biz.lastCollect) / 3600000, COLLECT_MAX_HOURS);
	let total = 0;
	for (const id of Object.keys(biz.shops)) {
		total += incomePerHour(id, biz.shops[id].level) * hours;
	}
	return { amount: Math.floor(total), hours: hours, capped: (Date.now() - biz.lastCollect) / 3600000 >= COLLECT_MAX_HOURS };
}

// ═══════════════════════════════════════════════════════════
// 📤 MODULE
// ═══════════════════════════════════════════════════════════
module.exports = {
	config: {
		name: "business",
		aliases: ["biz", "commerce", "empire", "boutique2"],
		version: "1.0",
		author: OWNER,
		countDown: 3,
		role: 0,
		shortDescription: { en: "💼 Construis ton empire de commerces" },
		longDescription: { en: "Achète des commerces, améliore-les, collecte leurs revenus et deviens le roi des affaires de Tokyo." },
		category: "economy",
		guide: {
			en:
				"{pn} → ton empire\n" +
				"{pn} shop → commerces à acheter\n" +
				"{pn} buy <commerce> → acheter\n" +
				"{pn} upgrade <commerce> → améliorer\n" +
				"{pn} collect → récupérer les revenus\n" +
				"{pn} sell <commerce> → revendre (50 %)\n" +
				"{pn} top → les plus gros empires"
		}
	},

	onStart: async function ({ message, args, event, usersData }) {
		const uid = event.senderID;
		const action = (args[0] || "").toLowerCase();

		// ═════════════════════════════════════════
		// 🏪 SHOP : catalogue
		// ═════════════════════════════════════════
		if (action === "shop" || action === "boutique" || action === "catalogue") {
			const biz = await getBiz(usersData, uid);
			const money = await getMoney(usersData, uid);
			let msg = HEADER + "🏪 𝗖𝗔𝗧𝗔𝗟𝗢𝗚𝗨𝗘\n";
			msg += "┃ " + CURRENCY + " Ton solde : " + fmt(money) + "\n\n";
			for (const id of Object.keys(SHOPS)) {
				const s = SHOPS[id];
				const owned = biz.shops[id] ? " ✅ niv." + biz.shops[id].level : "";
				msg += s.icon + " " + s.name + owned + "\n";
				msg += "┃ 💵 Prix : " + fmt(s.price) + "\n";
				msg += "┃ 📈 Revenu : " + fmt(s.income) + "/h\n";
				msg += "┃ ➤ business buy " + id + "\n\n";
			}
			return message.reply(msg.trim() + FOOTER);
		}

		// ═════════════════════════════════════════
		// 🛒 BUY : acheter un commerce
		// ═════════════════════════════════════════
		if (action === "buy" || action === "acheter") {
			const id = resolveShop(args[1]);
			if (!id) return message.reply("❌ Commerce inconnu.\nTape business shop pour voir la liste.");
			const biz = await getBiz(usersData, uid);
			if (biz.shops[id]) return message.reply("⚠️ Tu possèdes déjà ce commerce. Utilise business upgrade " + id + " pour l'améliorer.");

			const money = await getMoney(usersData, uid);
			const shop = SHOPS[id];
			if (money < shop.price) {
				return message.reply("😔 Il te manque " + fmt(shop.price - money) + " " + CURRENCY + ".\n┃ Prix : " + fmt(shop.price) + "\n┃ Ton solde : " + fmt(money));
			}

			// On encaisse d'abord les gains en attente pour ne pas les perdre quand le revenu change
			const gain = pending(biz).amount;
			biz.shops[id] = { level: 1, bought: Date.now() };
			biz.lastCollect = Date.now();
			await setMoney(usersData, uid, money - shop.price + gain);
			await saveBiz(usersData, uid, biz);

			return message.reply(
				HEADER + "🎉 𝗔𝗖𝗛𝗔𝗧 𝗥𝗘́𝗨𝗦𝗦𝗜\n" +
				"┃ " + shop.icon + " " + shop.name + "\n" +
				"┃ 💵 Payé : " + fmt(shop.price) + "\n" +
				"┃ 📈 Revenu : " + fmt(shop.income) + "/h\n" +
				(gain > 0 ? "┃ 🎁 Revenus encaissés : +" + fmt(gain) + "\n" : "") +
				"\n« " + shop.desc + " »" + FOOTER
			);
		}

		// ═════════════════════════════════════════
		// ⬆️ UPGRADE : améliorer
		// ═════════════════════════════════════════
		if (action === "upgrade" || action === "up" || action === "ameliorer") {
			const id = resolveShop(args[1]);
			if (!id) return message.reply("❌ Précise le commerce.\nExemple : business upgrade cafe");
			const biz = await getBiz(usersData, uid);
			const owned = biz.shops[id];
			if (!owned) return message.reply("⚠️ Tu ne possèdes pas encore ce commerce.");
			if (owned.level >= MAX_LEVEL) return message.reply("🏆 Ce commerce est déjà au niveau maximum (" + MAX_LEVEL + ").");

			const cost = upgradeCost(id, owned.level);
			const money = await getMoney(usersData, uid);
			if (money < cost) {
				return message.reply("😔 Il te manque " + fmt(cost - money) + " " + CURRENCY + ".\n┃ Coût : " + fmt(cost) + "\n┃ Ton solde : " + fmt(money));
			}

			const gain = pending(biz).amount;
			const before = incomePerHour(id, owned.level);
			owned.level += 1;
			biz.lastCollect = Date.now();
			await setMoney(usersData, uid, money - cost + gain);
			await saveBiz(usersData, uid, biz);

			return message.reply(
				HEADER + "⬆️ 𝗔𝗠𝗘́𝗟𝗜𝗢𝗥𝗔𝗧𝗜𝗢𝗡\n" +
				"┃ " + SHOPS[id].icon + " " + SHOPS[id].name + "\n" +
				"┃ 🔼 Niveau : " + (owned.level - 1) + " ➜ " + owned.level + "\n" +
				"┃ 📈 Revenu : " + fmt(before) + " ➜ " + fmt(incomePerHour(id, owned.level)) + "/h\n" +
				"┃ 💵 Coût : " + fmt(cost) +
				(gain > 0 ? "\n┃ 🎁 Revenus encaissés : +" + fmt(gain) : "") +
				FOOTER
			);
		}

		// ═════════════════════════════════════════
		// 💰 COLLECT : récupérer les revenus
		// ═════════════════════════════════════════
		if (action === "collect" || action === "recolter" || action === "encaisser") {
			const biz = await getBiz(usersData, uid);
			if (!Object.keys(biz.shops).length) return message.reply("🏚️ Tu n'as aucun commerce. Tape business shop pour en acheter un.");

			const p = pending(biz);
			if (p.amount < 1) return message.reply("⏳ Rien à collecter pour l'instant. Reviens dans quelques minutes.");

			let amount = p.amount;
			let eventLine = "";
			if (Math.random() < EVENT_CHANCE) {
				const ev = rand(EVENTS);
				amount = Math.floor(amount * ev.mult);
				eventLine = "\n\n🎲 𝗘́𝗩𝗘́𝗡𝗘𝗠𝗘𝗡𝗧\n┃ " + ev.text + "\n┃ " + (ev.mult >= 1 ? "📈 x" : "📉 x") + ev.mult;
			}

			const money = await getMoney(usersData, uid);
			biz.lastCollect = Date.now();
			biz.totalEarned = (biz.totalEarned || 0) + amount;
			await setMoney(usersData, uid, money + amount);
			await saveBiz(usersData, uid, biz);

			return message.reply(
				HEADER + "💰 𝗥𝗘𝗩𝗘𝗡𝗨𝗦 𝗖𝗢𝗟𝗟𝗘𝗖𝗧𝗘́𝗦\n" +
				"┃ ⏱️ Accumulés sur : " + duration(p.hours * 3600000) + "\n" +
				"┃ 💵 Gain : +" + fmt(amount) + " " + CURRENCY +
				eventLine +
				"\n\n💼 Nouveau solde : " + fmt(money + amount) + " " + CURRENCY +
				(p.capped ? "\n\n⚠️ Tes caisses étaient pleines depuis un moment (limite " + COLLECT_MAX_HOURS + " h). Passe plus souvent !" : "") +
				FOOTER
			);
		}

		// ═════════════════════════════════════════
		// 💸 SELL : revendre
		// ═════════════════════════════════════════
		if (action === "sell" || action === "vendre") {
			const id = resolveShop(args[1]);
			if (!id) return message.reply("❌ Précise le commerce.\nExemple : business sell cafe");
			const biz = await getBiz(usersData, uid);
			const owned = biz.shops[id];
			if (!owned) return message.reply("⚠️ Tu ne possèdes pas ce commerce.");

			// Confirmation obligatoire pour éviter les erreurs : il faut taper "confirm"
			const value = Math.floor(invested(id, owned.level) * SELL_RATIO);
			if ((args[2] || "").toLowerCase() !== "confirm") {
				return message.reply(
					HEADER + "⚠️ 𝗖𝗢𝗡𝗙𝗜𝗥𝗠𝗔𝗧𝗜𝗢𝗡\n" +
					"┃ " + SHOPS[id].icon + " " + SHOPS[id].name + " (niv. " + owned.level + ")\n" +
					"┃ 💵 Valeur de revente : " + fmt(value) + " (50 % de " + fmt(invested(id, owned.level)) + ")\n\n" +
					"Cette action est définitive.\n➤ business sell " + id + " confirm" + FOOTER
				);
			}

			const gain = pending(biz).amount;
			delete biz.shops[id];
			biz.lastCollect = Date.now();
			const money = await getMoney(usersData, uid);
			await setMoney(usersData, uid, money + value + gain);
			await saveBiz(usersData, uid, biz);

			return message.reply(
				HEADER + "💸 𝗩𝗘𝗡𝗧𝗘 𝗘𝗙𝗙𝗘𝗖𝗧𝗨𝗘́𝗘\n" +
				"┃ " + SHOPS[id].icon + " " + SHOPS[id].name + "\n" +
				"┃ 💵 Reçu : +" + fmt(value) + (gain > 0 ? "\n┃ 🎁 Revenus encaissés : +" + fmt(gain) : "") + FOOTER
			);
		}

		// ═════════════════════════════════════════
		// 🏆 TOP : classement
		// ═════════════════════════════════════════
		if (action === "top" || action === "classement") {
			let all;
			try { all = await usersData.getAll(); } catch (e) { all = []; }
			const ranking = [];
			for (const u of all) {
				const b = u && u.data && u.data.business;
				if (!b || !b.shops) continue;
				let perHour = 0;
				for (const id of Object.keys(b.shops)) {
					if (SHOPS[id]) perHour += incomePerHour(id, b.shops[id].level);
				}
				if (perHour > 0) ranking.push({ name: u.name || "Inconnu", perHour: perHour, count: Object.keys(b.shops).length });
			}
			ranking.sort(function (a, b) { return b.perHour - a.perHour; });
			if (!ranking.length) return message.reply(HEADER + "👁️ Personne n'a encore d'empire." + FOOTER);

			const medals = ["🥇", "🥈", "🥉"];
			let msg = HEADER + "🏆 𝗟𝗘𝗦 𝗣𝗟𝗨𝗦 𝗚𝗥𝗢𝗦 𝗘𝗠𝗣𝗜𝗥𝗘𝗦\n\n";
			ranking.slice(0, 10).forEach(function (r, i) {
				msg += (medals[i] || (i + 1) + ".") + " " + r.name + "\n┃ 📈 " + fmt(r.perHour) + "/h • 🏪 " + r.count + " commerce(s)\n";
			});
			return message.reply(msg.trim() + FOOTER);
		}

		// ═════════════════════════════════════════
		// 🏢 ACCUEIL : ton empire
		// ═════════════════════════════════════════
		const biz = await getBiz(usersData, uid);
		const ids = Object.keys(biz.shops).filter(function (id) { return SHOPS[id]; });
		const money = await getMoney(usersData, uid);

		if (!ids.length) {
			return message.reply(
				HEADER + "🏚️ Tu n'as encore aucun commerce.\n\n" +
				"┃ " + CURRENCY + " Ton solde : " + fmt(money) + "\n" +
				"┃ ☕ Le plus abordable : " + SHOPS.cafe.name + " (" + fmt(SHOPS.cafe.price) + ")\n\n" +
				"➤ business shop pour voir les commerces\n" +
				"➤ business buy cafe pour commencer" + FOOTER
			);
		}

		let totalHour = 0;
		let msg = HEADER + "🏢 𝗧𝗢𝗡 𝗘𝗠𝗣𝗜𝗥𝗘\n\n";
		for (const id of ids) {
			const lvl = biz.shops[id].level;
			const inc = incomePerHour(id, lvl);
			totalHour += inc;
			const next = lvl < MAX_LEVEL ? "➜ niv. " + (lvl + 1) + " : " + fmt(upgradeCost(id, lvl)) : "🏆 niveau max";
			msg += SHOPS[id].icon + " " + SHOPS[id].name + "\n";
			msg += "┃ 🔼 Niveau " + lvl + "/" + MAX_LEVEL + " " + bar((lvl / MAX_LEVEL) * 100, 8) + "\n";
			msg += "┃ 📈 " + fmt(inc) + "/h  " + next + "\n\n";
		}

		const p = pending(biz);
		const fill = Math.round((p.hours / COLLECT_MAX_HOURS) * 100);
		msg += "📊 𝗥𝗘́𝗦𝗨𝗠𝗘́\n";
		msg += "┃ 📈 Revenu total : " + fmt(totalHour) + "/h\n";
		msg += "┃ 💰 En caisse : " + fmt(p.amount) + " " + CURRENCY + "\n";
		msg += "┃ " + bar(fill, 10) + " " + fill + "% (max " + COLLECT_MAX_HOURS + " h)\n";
		msg += "┃ 🏦 Total gagné : " + fmt(biz.totalEarned || 0) + "\n";
		msg += "┃ " + CURRENCY + " Solde : " + fmt(money) + "\n\n";
		msg += "➤ business collect pour encaisser";
		return message.reply(msg + FOOTER);
	}
};
