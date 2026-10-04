const axios = require("axios");

/* =========================
   CONFIGURATION
========================= */

const API_URL = "https://naruto-ai-api-2.onrender.com";

// Render (offre gratuite) peut mettre ~1 minute à se réveiller
const TIMEOUT = 70000;
const MAX_ATTEMPTS = 2;

// Messenger refuse les messages trop longs
const MAX_MESSAGE_LENGTH = 1800;

// Dans un groupe, le bot réagit quand on prononce ces noms,
// quand on le mentionne, ou quand on répond à l'un de ses messages
const BOT_NAME_REGEX = /\b(gojo|satoru)\b/i;

// En message privé, le bot répond à tous les messages
const ANSWER_IN_INBOX = true;

// Anti-spam : SPAM_LIMIT messages en SPAM_WINDOW_MS = exclusion
const SPAM_LIMIT = 3;
const SPAM_WINDOW_MS = 5000;

// Membres inactifs
const INACTIVE_DEFAULT_DAYS = 7;
const CONFIRM_TIMEOUT_MS = 120000;
const KICK_DELAY_MS = 1500;

const INFO_CACHE_MS = 60000;
const ACTIVITY_SAVE_DELAY_MS = 60000;


/* =========================
   OUTILS GÉNÉRAUX
========================= */

// Chaque utilisateur a sa propre conversation.
// "ai reset" en démarre une nouvelle.
const sessionCounters = new Map();

function getSessionId(userID) {
	return `${userID}-${sessionCounters.get(userID) || 0}`;
}

function resetSession(userID) {
	sessionCounters.set(userID, (sessionCounters.get(userID) || 0) + 1);
}

function getPhotoUrl(attachments) {

	const photo = (attachments || []).find(
		(a) => a.type === "photo"
	);

	return photo ? photo.url : null;
}

// Coupe un long texte en morceaux (sans couper les mots)
function splitText(text, max) {

	const chunks = [];
	let rest = text.trim();

	while (rest.length > max) {

		let cut = rest.lastIndexOf("\n", max);

		if (cut < max / 2)
			cut = rest.lastIndexOf(" ", max);

		if (cut < max / 2)
			cut = max;

		chunks.push(rest.slice(0, cut).trim());
		rest = rest.slice(cut).trim();
	}

	if (rest)
		chunks.push(rest);

	return chunks;
}

function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

// Transforme une fonction à callback (api.xxx) en promesse
function call(fn, ...args) {

	return new Promise((resolve, reject) => {

		fn(...args, (error, result) => {
			if (error)
				reject(error);
			else
				resolve(result);
		});
	});
}

// Envoie un message et retourne les infos du message envoyé
function send(message, text) {

	return new Promise((resolve) => {

		message.reply(text, (error, info) => {
			resolve(error ? null : info);
		});
	});
}

function getPrefix(threadID) {

	try {
		return global.utils.getPrefix(threadID);
	} catch (error) {
		return global.GoatBot?.config?.prefix || "";
	}
}

async function getName(usersData, userID) {

	try {
		return (await usersData.getName(userID)) || String(userID);
	} catch (error) {
		return String(userID);
	}
}


/* =========================
   RÔLES ET INFOS DU GROUPE
========================= */

const infoCache = new Map();

async function getThreadInfo(api, threadID, force) {

	const cached = infoCache.get(threadID);

	if (!force && cached && Date.now() - cached.at < INFO_CACHE_MS)
		return cached.info;

	try {

		const info = await call(api.getThreadInfo, threadID);

		infoCache.set(threadID, { at: Date.now(), info });

		return info;

	} catch (error) {
		return cached ? cached.info : null;
	}
}

// Propriétaires du bot (adminBot dans config.json)
function isOwner(userID) {

	const owners = global.GoatBot?.config?.adminBot || [];

	return owners.map(String).includes(String(userID));
}

function isGroupAdmin(info, userID) {

	return (info?.adminIDs || []).some(
		(a) => String(a.id ?? a) === String(userID)
	);
}

// Peut donner des ordres au bot : admin du groupe ou propriétaire
function isManager(info, userID) {
	return isOwner(userID) || isGroupAdmin(info, userID);
}

// Personnes visées : mentions, sinon auteur du message cité
function getTargets(event, botID) {

	let ids = Object.keys(event.mentions || {});

	if (!ids.length && event.messageReply)
		ids = [event.messageReply.senderID];

	return ids
		.map(String)
		.filter((id) => id && id !== String(botID));
}


/* =========================
   ACTIVITÉ DES MEMBRES
   (pour retirer les membres inactifs)
========================= */

const activityCache = new Map();

function getActivity(threadsData, threadID) {

	if (!activityCache.has(threadID)) {

		activityCache.set(threadID, (async () => {

			let saved = null;

			try {
				saved = await threadsData.get(threadID, "data.aiActivity");
			} catch (error) {
				saved = null;
			}

			return {
				data: saved && saved.users
					? saved
					: { since: Date.now(), users: {} },
				lastSave: 0
			};
		})());
	}

	return activityCache.get(threadID);
}

async function recordActivity(threadsData, threadID, userID) {

	const entry = await getActivity(threadsData, threadID);

	entry.data.users[userID] = Date.now();

	if (Date.now() - entry.lastSave > ACTIVITY_SAVE_DELAY_MS) {

		entry.lastSave = Date.now();

		try {
			await threadsData.set(threadID, entry.data, "data.aiActivity");
		} catch (error) {
			// pas grave : on réessaiera plus tard
		}
	}
}

function findInactive(info, activity, days, botID) {

	const limit = days * 86400000;
	const now = Date.now();

	return (info?.participantIDs || [])
		.map(String)
		.filter((id) => {

			if (id === String(botID) || isManager(info, id))
				return false;

			const last = activity.users[id];

			// Jamais vu : inactif seulement si on surveille
			// le groupe depuis plus longtemps que la durée demandée
			return last
				? now - last > limit
				: now - activity.since > limit;
		});
}


/* =========================
   ANTI-SPAM
========================= */

const spamTracker = new Map();

function isSpamming(threadID, userID) {

	if (spamTracker.size > 5000)
		spamTracker.clear();

	const key = `${threadID}:${userID}`;
	const now = Date.now();

	const times = (spamTracker.get(key) || []).filter(
		(t) => now - t < SPAM_WINDOW_MS
	);

	times.push(now);

	if (times.length >= SPAM_LIMIT) {
		spamTracker.delete(key);
		return true;
	}

	spamTracker.set(key, times);

	return false;
}


/* =========================
   ACTIONS SUR LE GROUPE
   (utilisées par l'IA ET par les sous-commandes)
========================= */

async function namesOf(usersData, ids) {

	const names = [];

	for (const id of ids)
		names.push(await getName(usersData, id));

	return names;
}

// Retourne { text, confirm? }
async function executeAction(action, env) {

	const { api, event, threadsData, usersData, botID } = env;
	const threadID = event.threadID;

	if (!event.isGroup)
		return { text: "⚠️ Cette action ne marche que dans un groupe." };

	let info = await getThreadInfo(api, threadID);

	if (!isManager(info, event.senderID))
		return { text: "🔒 Seuls les admins du groupe peuvent me demander ça." };

	try {

		switch (action.type) {

			case "set_emoji": {

				const emoji = String(action.emoji || "").trim();

				if (!/\p{Extended_Pictographic}/u.test(emoji))
					return { text: "⚠️ Je n'ai pas trouvé d'emoji valide." };

				await call(api.changeThreadEmoji, emoji, threadID);

				return { text: `✅ Emoji du groupe changé : ${emoji}` };
			}

			case "set_title": {

				const title = String(action.title || "").trim().slice(0, 100);

				if (!title)
					return { text: "⚠️ Je n'ai pas compris le nouveau nom." };

				await call(api.setTitle, title, threadID);

				return { text: `✅ Nom du groupe changé : ${title}` };
			}

			case "set_photo": {

				const url =
					getPhotoUrl(event.attachments) ||
					getPhotoUrl(event.messageReply?.attachments);

				if (!url) {
					return {
						text: "🖼️ Envoie une image (ou réponds à une image) avec ta demande."
					};
				}

				const stream = await global.utils.getStreamFromURL(url);

				await call(api.changeGroupImage, stream, threadID);

				return { text: "✅ Photo du groupe changée." };
			}

			case "set_nickname": {

				const targets = getTargets(event, botID);
				const ids = targets.length ? targets : [event.senderID];

				const nickname = String(action.nickname ?? "")
					.trim()
					.slice(0, 50);

				for (const id of ids)
					await call(api.changeNickname, nickname, threadID, id);

				return {
					text: nickname
						? `✅ Surnom changé : ${nickname}`
						: "✅ Surnom supprimé."
				};
			}

			case "kick": {

				info = await getThreadInfo(api, threadID, true);

				if (!isGroupAdmin(info, botID)) {
					return {
						text: "⚠️ Je dois être admin du groupe pour retirer quelqu'un."
					};
				}

				const targets = getTargets(event, botID);

				if (!targets.length) {
					return {
						text: "👤 Mentionne la personne (ou réponds à son message)."
					};
				}

				const removed = [];
				const skipped = [];

				for (const id of targets) {

					if (isManager(info, id)) {
						skipped.push(id);
						continue;
					}

					try {
						await call(api.removeUserFromGroup, id, threadID);
						removed.push(id);
					} catch (error) {
						skipped.push(id);
					}
				}

				const lines = [];

				if (removed.length) {
					lines.push(
						"🚪 Retiré : " +
						(await namesOf(usersData, removed)).join(", ")
					);
				}

				if (skipped.length) {
					lines.push(
						"⚠️ Impossible (admin ou erreur) : " +
						(await namesOf(usersData, skipped)).join(", ")
					);
				}

				return { text: lines.join("\n") };
			}

			case "antispam": {

				const enabled = action.enabled === true;

				await threadsData.set(threadID, enabled, "data.aiAntiSpam");

				if (!enabled)
					return { text: "🛡️ Anti-spam désactivé." };

				let text =
					`🛡️ Anti-spam activé : ${SPAM_LIMIT} messages en `
					+ `${SPAM_WINDOW_MS / 1000} secondes = exclusion `
					+ "(les admins sont épargnés).";

				if (!isGroupAdmin(info, botID))
					text += "\n⚠️ Je dois être admin du groupe pour exclure quelqu'un.";

				return { text };
			}

			case "list_inactive": {

				info = await getThreadInfo(api, threadID, true);

				const days = Math.min(
					365,
					Math.max(1, parseInt(action.days, 10) || INACTIVE_DEFAULT_DAYS)
				);

				const activity = (await getActivity(threadsData, threadID)).data;

				const ids = findInactive(info, activity, days, botID);

				const since = new Date(activity.since).toLocaleDateString("fr-FR");

				if (!ids.length) {
					return {
						text: `✅ Aucun membre inactif depuis ${days} jour(s). `
							+ `(Je surveille l'activité depuis le ${since}.)`
					};
				}

				const names = await namesOf(usersData, ids.slice(0, 25));

				let text =
					`😴 ${ids.length} membre(s) inactif(s) depuis ${days} jour(s) :\n`
					+ names.map((n) => `• ${n}`).join("\n")
					+ (ids.length > 25 ? `\n… et ${ids.length - 25} autre(s)` : "")
					+ `\n(Activité surveillée depuis le ${since}.)`;

				if (!isGroupAdmin(info, botID)) {
					return {
						text: text + "\n\n⚠️ Je dois être admin du groupe pour les retirer."
					};
				}

				text += "\n\nRéponds « oui » à ce message pour les retirer (2 minutes).";

				return {
					text,
					confirm: {
						type: "kick_inactive",
						ids,
						expires: Date.now() + CONFIRM_TIMEOUT_MS
					}
				};
			}

			default:
				return { text: "" };
		}

	} catch (error) {

		console.error("[ai] action", action.type, error?.message || error);

		return {
			text: `⚠️ Je n'ai pas pu le faire (${action.type}). `
				+ "Vérifie que je suis bien admin du groupe."
		};
	}
}

// Retire les membres inactifs après confirmation
async function runConfirmedKick(confirm, env) {

	const { api, event, message, botID } = env;
	const threadID = event.threadID;

	if (Date.now() > confirm.expires)
		return send(message, "⌛ Confirmation expirée. Redemande-moi si besoin.");

	const info = await getThreadInfo(api, threadID, true);

	if (!isManager(info, event.senderID))
		return send(message, "🔒 Seuls les admins du groupe peuvent confirmer.");

	if (!isGroupAdmin(info, botID))
		return send(message, "⚠️ Je dois être admin du groupe pour retirer quelqu'un.");

	const present = (info?.participantIDs || []).map(String);

	let removed = 0;
	let failed = 0;

	for (const id of confirm.ids) {

		if (!present.includes(String(id)) || isManager(info, id))
			continue;

		try {
			await call(api.removeUserFromGroup, id, threadID);
			removed++;
		} catch (error) {
			failed++;
		}

		await sleep(KICK_DELAY_MS);
	}

	return send(
		message,
		`🚪 ${removed} membre(s) inactif(s) retiré(s)`
		+ (failed ? `, ${failed} échec(s).` : ".")
	);
}


/* =========================
   APPEL À L'API
========================= */

async function askAPI({ prompt, image, sessionId, context }) {

	let lastError;

	for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {

		try {

			const { data } = await axios.post(
				`${API_URL}/chat`,
				{
					prompt: prompt || undefined,
					image: image || undefined,
					sessionId,
					context
				},
				{ timeout: TIMEOUT }
			);

			const answer = String(
				data?.response ??
				data?.message ??
				data?.reply ??
				data?.answer ??
				""
			).trim();

			const actions = Array.isArray(data?.actions)
				? data.actions
				: [];

			if (!answer && !actions.length)
				throw new Error("Réponse vide");

			return { answer, actions };

		} catch (error) {

			lastError = error;

			const status = error.response?.status;

			// On réessaie seulement si l'API dormait ou était injoignable
			const canRetry =
				!status || status === 502 || status === 504;

			if (!canRetry || attempt === MAX_ATTEMPTS)
				break;

			await sleep(3000);
		}
	}

	throw lastError;
}

function errorMessage(error) {

	const status = error.response?.status;

	if (error.code === "ECONNABORTED") {
		return "⏳ L'API met trop de temps à répondre. Réessaie dans une minute.";
	}

	if (status === 503) {
		return "⚠️ Les services IA sont momentanément indisponibles. Réessaie plus tard.";
	}

	if (status === 429) {
		return "🚦 Trop de demandes. Patiente un instant puis réessaie.";
	}

	if (status === 400) {
		return "💬 Je n'ai pas compris ta demande. Écris une question ou envoie une image.";
	}

	return `⚠️ Erreur${status ? " (HTTP " + status + ")" : ""}. Réessaie plus tard.`;
}


/* =========================
   ENVOI + SUITE DE LA CONVERSATION
========================= */

// Envoie le texte (en plusieurs messages si besoin)
// et permet de continuer en répondant au dernier message.
async function deliver(env, text, confirm) {

	const { message, event, commandName } = env;

	let lastInfo = null;

	for (const chunk of splitText(text, MAX_MESSAGE_LENGTH))
		lastInfo = await send(message, chunk);

	if (lastInfo) {

		global.GoatBot.onReply.set(lastInfo.messageID, {
			commandName,
			author: event.senderID,
			confirm: confirm || null
		});
	}
}


/* =========================
   TRAITEMENT D'UNE DEMANDE EN LANGAGE NATUREL
========================= */

async function handleRequest(env) {

	const { message, event, api, threadsData, usersData, prompt, image } = env;

	const botID = String(api.getCurrentUserID());
	const isGroup = Boolean(event.isGroup);

	api.setMessageReaction("⏳", event.messageID, () => {}, true);

	try {

		let context = { isGroup: false };

		if (isGroup) {

			const info = await getThreadInfo(api, event.threadID);

			let antispam = false;

			try {
				antispam = Boolean(
					await threadsData.get(event.threadID, "data.aiAntiSpam")
				);
			} catch (error) {
				antispam = false;
			}

			context = {
				isGroup: true,
				senderName: await getName(usersData, event.senderID),
				senderIsAdmin: isManager(info, event.senderID),
				botIsAdmin: isGroupAdmin(info, botID),
				groupName: info?.threadName || "",
				memberCount: (info?.participantIDs || []).length,
				hasTargets: getTargets(event, botID).length > 0,
				hasImage: Boolean(
					getPhotoUrl(event.attachments) ||
					getPhotoUrl(event.messageReply?.attachments)
				),
				antispam
			};
		}

		const { answer, actions } = await askAPI({
			prompt,
			image,
			sessionId: getSessionId(event.senderID),
			context
		});

		// Les actions sont toujours vérifiées ici :
		// l'IA propose, mais c'est le bot qui contrôle les droits.
		const parts = [];
		let confirm = null;

		for (const action of actions) {

			const result = await executeAction(action, { ...env, botID });

			if (result.text)
				parts.push(result.text);

			if (result.confirm)
				confirm = result.confirm;
		}

		const finalText = [answer, ...parts].filter(Boolean).join("\n\n");

		if (!finalText)
			throw new Error("Réponse vide");

		api.setMessageReaction("✅", event.messageID, () => {}, true);

		await deliver(env, finalText, confirm);

	} catch (error) {

		console.error("[ai]", error.response?.status || error.message);

		api.setMessageReaction("❌", event.messageID, () => {}, true);

		await send(message, errorMessage(error));
	}
}


/* =========================
   COMMANDE
========================= */

const HELP =
	"🤖 AI Assistant\n\n"
	+ "Parle-moi naturellement :\n"
	+ "• en privé, écris simplement ton message\n"
	+ "• dans un groupe, appelle-moi (« Gojo, … »), mentionne-moi ou réponds à mes messages\n"
	+ "• réponds à une photo pour que je l'analyse\n\n"
	+ "👑 Pour les admins du groupe, je comprends aussi (sans formule imposée) :\n"
	+ "emoji, nom et photo du groupe, surnoms, exclusion d'un membre, "
	+ "anti-spam, retrait des membres inactifs.\n\n"
	+ "⌨️ Commandes directes :\n"
	+ "ai emoji 🔥 | ai nom <texte> | ai photo | ai surnom <texte> | ai kick @membre\n"
	+ "ai antispam on/off | ai inactifs <jours> | ai reset";

module.exports = {
	config: {
		name: "gojo",
		version: "3.0",
		author: "Master Charbel",
		countDown: 3,
		role: 0,
		description: {
			fr: "IA conversationnelle et assistant admin de groupe"
		},
		category: "ai",
		guide: {
			fr: "{pn} <message> : discuter avec l'IA\n"
				+ "{pn} help : voir tout ce que je sais faire"
		}
	},

	// Commande avec préfixe : « <préfixe>ai ... »
	onStart: async function (params) {

		const { message, event, args, api } = params;

		const botID = String(api.getCurrentUserID());
		const env = { ...params, commandName: this.config.name, botID };

		const sub = (args[0] || "").toLowerCase();
		const rest = args.slice(1).join(" ").trim();

		if (sub === "help" || sub === "aide")
			return message.reply(HELP);

		if (sub === "reset") {
			resetSession(event.senderID);
			return message.reply("🔄 Nouvelle conversation démarrée. J'ai oublié ce dont on parlait.");
		}

		// Commandes directes (mêmes actions que l'IA, vérifiées pareil)
		const direct = {
			emoji: { type: "set_emoji", emoji: rest },
			nom: { type: "set_title", title: rest },
			name: { type: "set_title", title: rest },
			photo: { type: "set_photo" },
			surnom: { type: "set_nickname", nickname: rest },
			kick: { type: "kick" },
			antispam: { type: "antispam", enabled: rest.toLowerCase() === "on" },
			inactifs: { type: "list_inactive", days: parseInt(rest, 10) || INACTIVE_DEFAULT_DAYS }
		}[sub];

		if (direct) {

			if (sub === "antispam" && !["on", "off"].includes(rest.toLowerCase()))
				return message.reply("🛡️ Utilise : ai antispam on  ou  ai antispam off");

			const result = await executeAction(direct, env);

			return deliver(env, result.text || "⚠️ Rien à faire.", result.confirm);
		}

		// Sinon : conversation normale
		const prompt = args.join(" ").trim();
		const image =
			getPhotoUrl(event.messageReply?.attachments) ||
			getPhotoUrl(event.attachments);

		if (!prompt && !image)
			return message.reply(HELP);

		return handleRequest({ ...env, prompt, image });
	},

	// Surveille tous les messages (conversation naturelle, anti-spam, activité)
	onChat: async function (params) {

		const { event, api, message, threadsData, usersData } = params;

		const { threadID, senderID } = event;
		const botID = String(api.getCurrentUserID());

		if (String(senderID) === botID)
			return;

		const body = (event.body || "").trim();
		const photo = getPhotoUrl(event.attachments);
		const isGroup = Boolean(event.isGroup);

		/* ---------- surveillance du groupe ---------- */

		if (isGroup) {

			await recordActivity(threadsData, threadID, String(s
