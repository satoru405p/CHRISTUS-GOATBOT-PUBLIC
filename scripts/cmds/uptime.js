const os = require("os");
const fs = require("fs");
const path = require("path");

// ═══════════════════════════════════════════════════════════
// ⚙️ RÉGLAGES
// ═══════════════════════════════════════════════════════════
const OWNER = "Master Charbel";
const DATA_FILE = path.join(process.cwd(), "upt_data.json");
const SAVE_EVERY_MS = 15000;

// ═══════════════════════════════════════════════════════════
// ◈ RANGS SATORU GOJO
// ═══════════════════════════════════════════════════════════
const RANKS = [
  { min: 0,       title: "◈ Sorcier débutant",      desc: "Le Limitless vient de s'éveiller." },
  { min: 3600,    title: "◇ Énergie maudite",       desc: "Le noyau commence à prendre forme." },
  { min: 21600,   title: "◎ Six Eyes éveillés",     desc: "La perception du système s'affine." },
  { min: 86400,   title: "∞ Limitless activé",      desc: "L'espace entre le bot et le chaos se réduit." },
  { min: 259200,  title: "✦ Sorcier confirmé",      desc: "Trois jours sans perdre le contrôle." },
  { min: 604800,  title: "◉ Gojo's Domain",         desc: "Une semaine. Le système tient toujours." },
  { min: 1209600, title: "◇ Infinity Master",       desc: "Deux semaines sous protection du Limitless." },
  { min: 2592000, title: "∞ The Strongest AI",      desc: "Un mois. Le noyau est devenu une légende." }
];

const QUOTES = [
  "« Le Limitless ne laisse rien atteindre son objectif. »",
  "« La puissance n'a de valeur que lorsqu'elle est maîtrisée. »",
  "« Même dans le chaos, le système continue d'avancer. »",
  "« Six Eyes activés. Chaque détail est sous contrôle. »",
  "« L'infini n'est pas une distance. C'est une limite impossible à franchir. »",
  "« Le système peut redémarrer. Le noyau, lui, continue d'évoluer. »",
  "« Quand tout semble impossible, active le Limitless. »",
  "« Le plus fort n'a pas besoin de faire du bruit. »"
];

const MOODS = [
  { max: 40,  text: "◎ Noyau parfaitement stable" },
  { max: 70,  text: "◇ Charge maîtrisée, système concentré" },
  { max: 90,  text: "◉ Six Eyes surveillent la charge" },
  { max: 101, text: "∞ Limitless sous forte activité" }
];

// ═══════════════════════════════════════════════════════════
// 🗃️ MÉMOIRE PERMANENTE
// ═══════════════════════════════════════════════════════════
function defaultData() {
  return {
    firstBoot: Date.now(),
    sessionStart: Date.now(),
    lastSeen: Date.now(),
    totalSeconds: 0,
    bestSession: 0,
    boots: 0,
    history: []
  };
}

function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
      const data = Object.assign(defaultData(), parsed);

      if (!Array.isArray(data.history)) {
        data.history = [];
      }

      return data;
    }
  } catch (e) {
    console.error(
      "[UPT] Lecture impossible, données réinitialisées :",
      e.message
    );
  }

  return defaultData();
}

function saveData(data) {
  try {
    fs.writeFileSync(
      DATA_FILE,
      JSON.stringify(data, null, 2)
    );
  } catch (e) {
    if (!global.uptSaveWarned) {
      console.error(
        "[UPT] Sauvegarde impossible :",
        e.message
      );
      global.uptSaveWarned = true;
    }
  }
}

// ═══════════════════════════════════════════════════════════
// ◈ INITIALISATION DE LA SESSION
// ═══════════════════════════════════════════════════════════
if (!global.uptState) {
  const data = loadData();

  if (data.boots > 0) {
    const previous = Math.max(
      0,
      Math.floor(
        (data.lastSeen - data.sessionStart) / 1000
      )
    );

    data.totalSeconds += previous;

    if (previous > data.bestSession) {
      data.bestSession = previous;
    }

    if (previous > 0) {
      data.history.unshift({
        start: data.sessionStart,
        seconds: previous
      });

      data.history = data.history.slice(0, 5);
    }
  }

  data.boots += 1;
  data.sessionStart = Date.now();
  data.lastSeen = Date.now();

  saveData(data);

  global.uptState = data;

  const timer = setInterval(() => {
    global.uptState.lastSeen = Math.max(
      global.uptState.lastSeen,
      Date.now()
    );

    saveData(global.uptState);
  }, SAVE_EVERY_MS);

  if (timer.unref) {
    timer.unref();
  }
}

// ═══════════════════════════════════════════════════════════
// 🔧 UTILITAIRES
// ═══════════════════════════════════════════════════════════
function formatDuration(seconds) {
  seconds = Math.max(0, Math.floor(seconds));

  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  return { d, h, m, s };
}

function short(seconds) {
  const t = formatDuration(seconds);
  const parts = [];

  if (t.d) parts.push(`${t.d}j`);
  if (t.h) parts.push(`${t.h}h`);

  if (t.m || !parts.length) {
    parts.push(`${t.m}min`);
  }

  return parts.join(" ");
}

function pad(n) {
  return String(n).padStart(2, "0");
}

function formatBytes(bytes) {
  const units = ["o", "Ko", "Mo", "Go", "To"];

  let i = 0;
  let value = bytes;

  while (
    value >= 1024 &&
    i < units.length - 1
  ) {
    value /= 1024;
    i++;
  }

  return `${value.toFixed(value >= 100 ? 0 : 1)} ${units[i]}`;
}

function progressBar(percent, size = 12) {
  const p = Math.max(
    0,
    Math.min(100, percent)
  );

  const filled = Math.round(
    (p / 100) * size
  );

  return (
    "▰".repeat(filled) +
    "▱".repeat(size - filled)
  );
}

function measureLatency(event) {
  const sent = Number(
    event && event.timestamp
  );

  if (
    Number.isFinite(sent) &&
    sent > 0
  ) {
    const delta = Date.now() - sent;

    if (
      delta >= 0 &&
      delta < 60000
    ) {
      return String(delta);
    }
  }

  return "—";
}

function cpuUsage() {
  try {
    const cores = os.cpus().length || 1;
    const load = os.loadavg()[0];

    if (!load) return null;

    return Math.min(
      100,
      Math.round((load / cores) * 100)
    );
  } catch (e) {
    return null;
  }
}

function diskUsage() {
  try {
    if (
      typeof fs.statfsSync !== "function"
    ) {
      return null;
    }

    const st = fs.statfsSync(
      process.cwd()
    );

    const total =
      st.blocks * st.bsize;

    const free =
      st.bavail * st.bsize;

    const used =
      total - free;

    return {
      total,
      used,
      percent: Math.round(
        (used / total) * 100
      )
    };
  } catch (e) {
    if (!global.uptDiskWarned) {
      console.error(
        "[UPT] Disque non lisible :",
        e.message
      );

      global.uptDiskWarned = true;
    }

    return null;
  }
}

function getRank(seconds) {
  let current = RANKS[0];
  let next = null;

  for (let i = 0; i < RANKS.length; i++) {
    if (seconds >= RANKS[i].min) {
      current = RANKS[i];
      next = RANKS[i + 1] || null;
    }
  }

  return {
    current,
    next
  };
}

function rand(arr) {
  return arr[
    Math.floor(Math.random() * arr.length)
  ];
}

function moodFor(percent) {
  for (const m of MOODS) {
    if (percent <= m.max) {
      return m.text;
    }
  }

  return MOODS[MOODS.length - 1].text;
}

function dateFr(ms) {
  return new Date(ms).toLocaleString(
    "fr-FR",
    {
      dateStyle: "short",
      timeStyle: "short"
    }
  );
}

function healthScore(
  memPercent,
  cpuPercent,
  disk
) {
  let score = 100;

  score -=
    memPercent > 80
      ? 30
      : memPercent > 60
        ? 15
        : 5;

  if (
    cpuPercent !== null &&
    cpuPercent > 75
  ) {
    score -= 25;
  }

  if (
    disk &&
    disk.percent > 85
  ) {
    score -= 25;
  }

  return Math.max(
    0,
    Math.min(100, score)
  );
}

function healthLabel(score) {
  if (score >= 85) return "◎ Excellente";
  if (score >= 65) return "◇ Bonne";
  if (score >= 40) return "◈ Moyenne";

  return "× Critique";
}

// ═══════════════════════════════════════════════════════════
// ◈ DESIGN SATORU GOJO AI
// ═══════════════════════════════════════════════════════════
const HEADER =
  `╭───〔 六眼 • SATORU GOJO AI 〕───╮\n\n` +
  `        ◉ LIMITLESS CORE\n` +
  `        ∞ SYSTEM ONLINE\n\n`;

const FOOTER =
  `\n\n   ⟡ Created by ${OWNER} ⟡\n` +
  `   〔 SATORU GOJO AI • 六眼 〕`;

const SECTION = name =>
  `\n──〔 ${name} 〕──\n`;

// ═══════════════════════════════════════════════════════════
// 📤 MODULE EXPORT
// ═══════════════════════════════════════════════════════════
module.exports = {

  config: {
    name: "upt",
    aliases: [
      "runtime",
      "status"
    ],

    version: "5.0",

    author: OWNER,

    countDown: 5,

    role: 0,

    shortDescription: {
      en: "∞ Satoru Gojo AI system status"
    },

    longDescription: {
      en:
        "Affiche l'état du bot, l'uptime du bot et du serveur, la RAM, le CPU, le stockage, le ping et l'état du système."
    },

    category: "system",

    guide: {
      en:
        "{pn} → statut complet\n" +
        "{pn} history → historique des sessions\n" +
        "{pn} mini → statut rapide"
    }
  },

  onStart: async function ({
    api,
    event,
    args
  }) {

    const {
      threadID,
      messageID
    } = event;

    const mode = (
      args[0] || ""
    ).toLowerCase();

    try {
      api.setMessageReaction(
        "◉",
        messageID,
        () => {},
        true
      );
    } catch (e) {}

    const data =
      global.uptState ||
      defaultData();

    // ═══════════════════════════════════════
    // ⏱️ UPTIMES
    // ═══════════════════════════════════════
    const sessionSeconds =
      process.uptime();

    const serverSeconds =
      os.uptime();

    const totalCumul =
      data.totalSeconds +
      sessionSeconds;

    const bestSession =
      Math.max(
        data.bestSession,
        sessionSeconds
      );

    const bot =
      formatDuration(
        sessionSeconds
      );

    const server =
      formatDuration(
        serverSeconds
      );

    // ═══════════════════════════════════════
    // ◈ RANG
    // ═══════════════════════════════════════
    const {
      current,
      next
    } = getRank(totalCumul);

    // ═══════════════════════════════════════
    // 🧠 MÉMOIRE
    // ═══════════════════════════════════════
    const totalMem =
      os.totalmem();

    const freeMem =
      os.freemem();

    const usedMem =
      totalMem - freeMem;

    const memPercent =
      Math.round(
        (usedMem / totalMem) * 100
      );

    const procMem =
      process.memoryUsage().rss;

    // ═══════════════════════════════════════
    // ⚙️ CPU
    // ═══════════════════════════════════════
    const cpus =
      os.cpus();

    const cpuModel =
      (
        cpus[0]?.model ||
        "Inconnu"
      )
        .replace(/\s+/g, " ")
        .trim();

    const cpuPercent =
      cpuUsage();

    // ═══════════════════════════════════════
    // 💾 DISQUE
    // ═══════════════════════════════════════
    const disk =
      diskUsage();

    // ═══════════════════════════════════════
    // 🌐 LATENCE
    // ═══════════════════════════════════════
    const ping =
      measureLatency(event);

    // ═══════════════════════════════════════
    // 💚 SANTÉ
    // ═══════════════════════════════════════
    const health =
      healthScore(
        memPercent,
        cpuPercent,
        disk
      );

    // ═══════════════════════════════════════
    // 📦 COMMANDES
    // ═══════════════════════════════════════
    let cmdCount = 0;

    try {
      const cmds =
        global.GoatBot &&
        global.GoatBot.commands;

      cmdCount =
        (cmds && cmds.size) ||
        (
          cmds
            ? Object.keys(cmds).length
            : 0
        );
    } catch (e) {}

    // ═══════════════════════════════════════
    // 📜 HISTORY
    // ═══════════════════════════════════════
    if (
      mode === "history" ||
      mode === "historique" ||
      mode === "histo"
    ) {

      let msg =
        HEADER;

      msg +=
        `◈ 𝗟𝗜𝗠𝗜𝗧𝗟𝗘𝗦𝗦 𝗛𝗜𝗦𝗧𝗢𝗥𝗬\n`;

      msg +=
        `◇ Premier éveil : ${dateFr(data.firstBoot)}\n`;

      msg +=
        `◇ Démarrages : ${data.boots}\n`;

      msg +=
        `◇ Record session : ${short(bestSession)}\n`;

      msg +=
        `◇ Temps cumulé : ${short(totalCumul)}\n`;

      msg += SECTION(
        "RECENT SESSIONS"
      );

      msg +=
        `◎ En cours : ${short(sessionSeconds)}\n`;

      if (
        data.history.length === 0
      ) {

        msg +=
          `◇ Aucune session terminée enregistrée.\n`;

      } else {

        data.history.forEach(
          (h, i) => {

            msg +=
              `◇ ${i + 1}. ${short(h.seconds)} • ${dateFr(h.start)}\n`;
          }
        );
      }

      msg += FOOTER;

      return api.sendMessage(
        msg,
        threadID,
        messageID
      );
    }

    // ═══════════════════════════════════════
    // ⚡ MINI
    // ═══════════════════════════════════════
    if (
      mode === "mini" ||
      mode === "short"
    ) {

      let msg =
        `╭──〔 六眼 • GOJO AI 〕──╮\n\n`;

      msg +=
        `∞ LIMITLESS : ONLINE\n\n`;

      msg +=
        `◇ Bot    : ${bot.d}j ${pad(bot.h)}h ${pad(bot.m)}m ${pad(bot.s)}s\n`;

      msg +=
        `◇ Server : ${server.d}j ${pad(server.h)}h ${pad(server.m)}m ${pad(server.s)}s\n`;

      msg +=
        `◇ RAM    : ${memPercent}%\n`;

      msg +=
        `◇ Ping   : ${ping} ms\n`;

      msg +=
        `◇ Santé  : ${health}/100\n`;

      msg +=
        `\n⟡ ${OWNER} ⟡`;

      return api.sendMessage(
        msg,
        threadID,
        messageID
      );
    }

    // ═══════════════════════════════════════
    // ◉ PROGRESSION
    // ═══════════════════════════════════════
    let progress = 100;

    let nextLine =
      "∞ Niveau maximal atteint.";

    if (next) {

      progress =
        Math.round(
          (
            (totalCumul - current.min) /
            (next.min - current.min)
          ) * 100
        );

      nextLine =
        `◇ Prochain : ${next.title}\n` +
        `◇ Progression : ${progress}% • ${short(next.min - totalCumul)}`;
    }

    const startStr =
      dateFr(
        Date.now() -
        sessionSeconds * 1000
      );

    const nowStr =
      new Date().toLocaleString(
        "fr-FR",
        {
          dateStyle: "short",
          timeStyle: "medium"
        }
      );

    const quote =
      rand(QUOTES);

    // ═══════════════════════════════════════
    // ◈ MESSAGE PRINCIPAL
    // ═══════════════════════════════════════
    let msg =
      HEADER;

    // ─────────────────────────────────────
    // LIMITLESS
    // ─────────────────────────────────────
    msg +=
      `◈ 𝗟𝗜𝗠𝗜𝗧𝗟𝗘𝗦𝗦 𝗖𝗢𝗥𝗘\n`;

    msg +=
      `◇ ${current.title}\n`;

    msg +=
      `◇ ${current.desc}\n`;

    msg +=
      `${progressBar(progress)} ${progress}%\n`;

    msg +=
      `${nextLine}\n`;

    msg += SECTION(
      "UPTIME"
    );

    // BOT UPTIME
    msg +=
      `◎ Bot    : ${bot.d}j ${pad(bot.h)}h ${pad(bot.m)}m ${pad(bot.s)}s\n`;

    // SERVER UPTIME
    msg +=
      `◎ Server : ${server.d}j ${pad(server.h)}h ${pad(server.m)}m ${pad(server.s)}s\n`;

    msg +=
      `◇ Cumul  : ${short(totalCumul)}\n`;

    msg +=
      `◇ Record : ${short(bestSession)}\n`;

    msg +=
      `◇ Boots  : ${data.boots}\n`;

    // ═══════════════════════════════════════
    // CONNECTION
    // ═══════════════════════════════════════
    msg += SECTION(
      "CONNECTION"
    );

    msg +=
      `◎ Facebook : Connected\n`;

    msg +=
      `◎ Network  : Stable\n`;

    msg +=
      `◎ AI Core  : Online\n`;

    msg +=
      `◎ Ping     : ${ping} ms\n`;

    // ═══════════════════════════════════════
    // SIX EYES
    // ═══════════════════════════════════════
    msg += SECTION(
      "SIX EYES"
    );

    msg +=
      `◇ RAM     : ${progressBar(memPercent)} ${memPercent}%\n`;

    msg +=
      `◇ Usage   : ${formatBytes(usedMem)} / ${formatBytes(totalMem)}\n`;

    msg +=
      `◇ Bot RAM : ${formatBytes(procMem)}\n`;

    msg +=
      `${moodFor(memPercent)}\n`;

    // ═══════════════════════════════════════
    // SYSTEM CORE
    // ═══════════════════════════════════════
    msg += SECTION(
      "SYSTEM CORE"
    );

    if (cpuPercent !== null) {

      msg +=
        `◎ CPU : ${progressBar(cpuPercent)} ${cpuPercent}%\n`;
    }

    msg +=
      `◇ Cores : ${cpus.length}\n`;

    msg +=
      `◇ Node  : ${process.version}\n`;

    msg +=
      `◇ OS    : ${os.platform()} ${os.arch()}\n`;

    msg +=
      `◇ Cmds  : ${cmdCount}\n`;

    // ═══════════════════════════════════════
    // STORAGE
    // ═══════════════════════════════════════
    if (disk) {

      msg += SECTION(
        "STORAGE"
      );

      msg +=
        `◇ Disk : ${progressBar(disk.percent)} ${disk.percent}%\n`;

      msg +=
        `◇ Used : ${formatBytes(disk.used)} / ${formatBytes(disk.total)}\n`;
    }

    // ═══════════════════════════════════════
    // HEALTH
    // ═══════════════════════════════════════
    msg += SECTION(
      "SYSTEM HEALTH"
    );

    msg +=
      `${progressBar(health)} ${health}/100\n`;

    msg +=
      `◎ ${healthLabel(health)}\n`;

    // ═══════════════════════════════════════
    // SESSION
    // ═══════════════════════════════════════
    msg += SECTION(
      "SESSION"
    );

    msg +=
      `◇ Started : ${startStr}\n`;

    msg +=
      `◇ Now     : ${nowStr}\n`;

    // ═══════════════════════════════════════
    // QUOTE
    // ═══════════════════════════════════════
    msg +=
      `\n「 ${quote.replace(/^«\s*|\s*»$/g, "")} 」`;

    msg +=
      `\n\n◎ upt history  •  ◎ upt mini`;

    msg += FOOTER;

    try {
      api.setMessageReaction(
        "∞",
        messageID,
        () => {},
        true
      );
    } catch (e) {}

    return api.sendMessage(
      msg,
      threadID,
      messageID
    );
  }
};
