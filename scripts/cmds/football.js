"use strict";

const COMMAND = "football";

const CD = {
  train: 30 * 60 * 1000,
  match: 20 * 60 * 1000
};

const POSITIONS = {
  BU: {
    name: "Buteur",
    stats: {
      pace: 72,
      passing: 58,
      shooting: 80,
      dribbling: 68,
      physical: 62,
      vision: 58
    }
  },

  AIL: {
    name: "Ailier",
    stats: {
      pace: 84,
      passing: 66,
      shooting: 68,
      dribbling: 82,
      physical: 55,
      vision: 68
    }
  },

  MOC: {
    name: "Milieu offensif",
    stats: {
      pace: 68,
      passing: 82,
      shooting: 65,
      dribbling: 78,
      physical: 58,
      vision: 86
    }
  },

  MC: {
    name: "Milieu central",
    stats: {
      pace: 61,
      passing: 80,
      shooting: 57,
      dribbling: 69,
      physical: 70,
      vision: 84
    }
  },

  DC: {
    name: "Défenseur central",
    stats: {
      pace: 56,
      passing: 63,
      shooting: 30,
      dribbling: 42,
      physical: 85,
      vision: 64
    }
  }
};

const CLUBS = {
  madrid: {
    name: "Real Madrid",
    league: "La Liga",
    strength: 94,
    icon: "⚪",
    squad: [
      "Mbappé",
      "Vini Jr.",
      "Bellingham",
      "Valverde",
      "Arda Güler",
      "Rodrygo",
      "Camavinga",
      "Courtois"
    ]
  },

  barca: {
    name: "FC Barcelona",
    league: "La Liga",
    strength: 92,
    icon: "🔵🔴",
    squad: [
      "Lamine Yamal",
      "Pedri",
      "Raphinha",
      "Gavi",
      "Fermín López",
      "Dani Olmo",
      "Frenkie de Jong",
      "João Cancelo"
    ]
  },

  city: {
    name: "Manchester City",
    league: "Premier League",
    strength: 93,
    icon: "🔵",
    squad: [
      "Haaland",
      "Foden",
      "Doku",
      "Donnarumma",
      "Rico Lewis",
      "Rúben Dias",
      "Gvardiol",
      "Semenyo"
    ]
  },

  psg: {
    name: "Paris Saint-Germain",
    league: "Ligue 1",
    strength: 91,
    icon: "🔵🔴",
    squad: [
      "Dembélé",
      "Kvaratskhelia",
      "Vitinha",
      "Hakimi",
      "Marquinhos",
      "João Neves",
      "Nuno Mendes",
      "Désiré Doué"
    ]
  },

  liverpool: {
    name: "Liverpool",
    league: "Premier League",
    strength: 90,
    icon: "🔴",
    squad: [
      "Florian Wirtz",
      "Alexander Isak",
      "Van Dijk",
      "Alisson",
      "Mac Allister",
      "Szoboszlai",
      "Gakpo",
      "Frimpong"
    ]
  },

  arsenal: {
    name: "Arsenal",
    league: "Premier League",
    strength: 89,
    icon: "🔴⚪",
    squad: [
      "Saka",
      "Ødegaard",
      "Rice",
      "Saliba",
      "Gabriel",
      "Martinelli",
      "Raya",
      "Havertz"
    ]
  },

  bayern: {
    name: "Bayern Munich",
    league: "Bundesliga",
    strength: 91,
    icon: "🔴⚪",
    squad: [
      "Kane",
      "Musiala",
      "Olise",
      "Kimmich",
      "Gnabry",
      "Davies",
      "Upamecano",
      "Neuer"
    ]
  },

  inter: {
    name: "Inter Milan",
    league: "Serie A",
    strength: 88,
    icon: "⚫🔵",
    squad: [
      "Lautaro Martínez",
      "Barella",
      "Çalhanoğlu",
      "Dimarco",
      "Bastoni",
      "Dumfries",
      "Thuram",
      "Sommer"
    ]
  },

  milan: {
    name: "AC Milan",
    league: "Serie A",
    strength: 85,
    icon: "🔴⚫",
    squad: [
      "Leão",
      "Pulisic",
      "Modrić",
      "Theo Hernández",
      "Fofana",
      "Tomori",
      "Maignan",
      "Nkunku"
    ]
  },

  chelsea: {
    name: "Chelsea",
    league: "Premier League",
    strength: 84,
    icon: "🔵",
    squad: [
      "Palmer",
      "Caicedo",
      "Enzo Fernández",
      "Neto",
      "Colwill",
      "James",
      "Cucurella",
      "Jackson"
    ]
  },

  united: {
    name: "Manchester United",
    league: "Premier League",
    strength: 82,
    icon: "🔴",
    squad: [
      "Bruno Fernandes",
      "Amad Diallo",
      "Mainoo",
      "Casemiro",
      "Martínez",
      "De Ligt",
      "Onana",
      "Sesko"
    ]
  },

  atletico: {
    name: "Atlético Madrid",
    league: "La Liga",
    strength: 87,
    icon: "🔴⚪",
    squad: [
      "Griezmann",
      "Julián Álvarez",
      "Marcos Llorente",
      "De Paul",
      "Koke",
      "Giménez",
      "Molina",
      "Oblak"
    ]
  }
};

const ACHIEVEMENTS = {
  firstGoal: {
    name: "Premier but",
    icon: "⚽",
    description: "Marquer ton premier but"
  },

  hatTrick: {
    name: "Triplé",
    icon: "🎩",
    description: "Marquer 3 buts dans un match"
  },

  playmaker: {
    name: "Maître passeur",
    icon: "🎯",
    description: "Réaliser 10 passes décisives"
  },

  star: {
    name: "Étoile montante",
    icon: "⭐",
    description: "Atteindre une note de 85"
  },

  champion: {
    name: "Champion",
    icon: "🏆",
    description: "Remporter un trophée"
  },

  legend: {
    name: "Légende",
    icon: "👑",
    description: "Atteindre le niveau 25"
  }
};

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function formatMoney(value) {
  return new Intl.NumberFormat("fr-FR").format(value);
}

function overall(player) {
  const s = player.stats;

  return Math.round(
    (
      s.pace +
      s.passing +
      s.shooting +
      s.dribbling +
      s.physical +
      s.vision
    ) / 6
  );
}

function getLevelXP(level) {
  return 100 + (level - 1) * 60;
}

function getClub(key) {
  return CLUBS[key] || null;
}

function createCareer(name, position, club) {
  const base = POSITIONS[position];

  return {
    name,
    position,
    club,

    level: 1,
    xp: 0,

    energy: 100,
    form: 75,
    morale: 75,

    value: 500000,
    salary: 5000,

    matches: 0,
    wins: 0,
    draws: 0,
    losses: 0,

    goals: 0,
    assists: 0,
    shots: 0,
    passes: 0,
    keyPasses: 0,
    dribbles: 0,
    successfulDribbles: 0,
    tackles: 0,
    interceptions: 0,

    trophies: 0,
    cleanSheets: 0,
    manOfTheMatch: 0,

    reputation: 10,
    fans: 100,

    season: 1,
    achievements: [],

    stats: {
      pace: base.stats.pace,
      passing: base.stats.passing,
      shooting: base.stats.shooting,
      dribbling: base.stats.dribbling,
      physical: base.stats.physical,
      vision: base.stats.vision
    },

    cooldowns: {
      train: 0,
      match: 0
    },

    currentMatch: null
  };
}

function getPositionName(position) {
  return POSITIONS[position]?.name || position;
}

function addXP(player, amount) {
  player.xp += amount;

  let leveledUp = false;

  while (player.xp >= getLevelXP(player.level)) {
    player.xp -= getLevelXP(player.level);
    player.level++;
    leveledUp = true;

    player.stats.pace += random(0, 1);
    player.stats.passing += random(0, 1);
    player.stats.shooting += random(0, 1);
    player.stats.dribbling += random(0, 1);
    player.stats.physical += random(0, 1);
    player.stats.vision += random(0, 1);
  }

  return leveledUp;
}

function unlockAchievement(player, id) {
  if (!ACHIEVEMENTS[id]) return false;
  if (player.achievements.includes(id)) return false;

  player.achievements.push(id);
  return true;
}

function checkAchievements(player) {
  const unlocked = [];

  if (player.goals >= 1 && unlockAchievement(player, "firstGoal")) {
    unlocked.push(ACHIEVEMENTS.firstGoal);
  }

  if (player.assists >= 10 && unlockAchievement(player, "playmaker")) {
    unlocked.push(ACHIEVEMENTS.playmaker);
  }

  if (overall(player) >= 85 && unlockAchievement(player, "star")) {
    unlocked.push(ACHIEVEMENTS.star);
  }

  if (player.trophies >= 1 && unlockAchievement(player, "champion")) {
    unlocked.push(ACHIEVEMENTS.champion);
  }

  if (player.level >= 25 && unlockAchievement(player, "legend")) {
    unlocked.push(ACHIEVEMENTS.legend);
  }

  return unlocked;
      }

async function getCareer(usersData, userID) {
  const user = await usersData.get(userID);
  const data = user?.data || {};

  if (!data.football) return null;

  return data.football;
}

async function saveCareer(usersData, userID, career) {
  await usersData.set(userID, {
    data: {
      football: career
    }
  });
}

function getCooldown(time) {
  if (!time || time <= Date.now()) return "disponible";

  const seconds = Math.ceil((time - Date.now()) / 1000);
  const minutes = Math.floor(seconds / 60);
  const sec = seconds % 60;

  if (minutes > 0) {
    return `${minutes}m ${sec}s`;
  }

  return `${sec}s`;
}

function getRandomOpponent(currentClub) {
  const keys = Object.keys(CLUBS).filter(key => key !== currentClub);
  return pick(keys);
}

function getOpponentForMatch(player) {
  const club = getClub(player.club);

  if (!club) return "barca";

  const keys = Object.keys(CLUBS)
    .filter(key => key !== player.club)
    .sort((a, b) => {
      const diffA = Math.abs(CLUBS[a].strength - club.strength);
      const diffB = Math.abs(CLUBS[b].strength - club.strength);

      return diffA - diffB;
    });

  /*
   * On ne donne pas toujours un adversaire
   * de niveau proche. Il peut aussi tomber
   * sur une grosse équipe.
   */
  const roll = Math.random();

  if (roll < 0.20) {
    const stronger = keys.filter(
      key => CLUBS[key].strength > club.strength
    );

    if (stronger.length) return pick(stronger);
  }

  if (roll < 0.75) {
    return keys[0];
  }

  return pick(keys);
}

function getDifficulty(player, opponent) {
  const club = getClub(player.club);
  const enemy = getClub(opponent);

  if (!club || !enemy) return 50;

  let difficulty = 50;

  difficulty += (enemy.strength - club.strength) * 1.5;

  difficulty += random(-8, 8);

  difficulty -= (player.form - 75) * 0.25;

  return clamp(Math.round(difficulty), 20, 90);
}

function getMatchOpponentPlayer(opponent, type = "normal") {
  const club = getClub(opponent);

  if (!club) return "Défenseur adverse";

  if (type === "keeper") {
    const keepers = club.squad.filter(name =>
      /Courtois|Donnarumma|Alisson|Neuer|Sommer|Maignan|Raya|Onana|Oblak/i.test(name)
    );

    return keepers.length ? pick(keepers) : "le gardien adverse";
  }

  return pick(club.squad);
}

function improveStat(player, stat, amount = 1) {
  if (!player.stats[stat]) return;

  player.stats[stat] = clamp(
    player.stats[stat] + amount,
    1,
    99
  );
}

function trainingSession(player, type) {
  const results = {
    speed: {
      label: "Vitesse",
      stat: "pace",
      xp: 35
    },

    shooting: {
      label: "Finition",
      stat: "shooting",
      xp: 40
    },

    passing: {
      label: "Passe",
      stat: "passing",
      xp: 35
    },

    dribbling: {
      label: "Dribble",
      stat: "dribbling",
      xp: 40
    },

    physical: {
      label: "Physique",
      stat: "physical",
      xp: 35
    },

    vision: {
      label: "Vision",
      stat: "vision",
      xp: 35
    }
  };

  const session = results[type];

  if (!session) return null;

  const improvement = Math.random() < 0.25 ? 2 : 1;

  improveStat(player, session.stat, improvement);

  const xp = session.xp + random(0, 20);

  const leveledUp = addXP(player, xp);

  player.energy = clamp(
    player.energy - random(5, 12),
    0,
    100
  );

  player.form = clamp(
    player.form + random(1, 3),
    0,
    100
  );

  player.morale = clamp(
    player.morale + random(1, 4),
    0,
    100
  );

  return {
    label: session.label,
    stat: session.stat,
    improvement,
    xp,
    leveledUp
  };
}

function getMatchTitle(player, opponent) {
  const club = getClub(player.club);
  const enemy = getClub(opponent);

  return `${club.icon} ${club.name} vs ${enemy.icon} ${enemy.name}`;
}

function createMatch(player, opponent) {
  const club = getClub(player.club);
  const enemy = getClub(opponent);

  const difficulty = getDifficulty(player, opponent);

  return {
    opponent,

    minute: random(5, 15),

    homeScore: 0,
    awayScore: 0,

    difficulty,

    finished: false,
    started: true,

    playerGoals: 0,
    playerAssists: 0,

    shots: 0,
    passes: 0,
    keyPasses: 0,
    dribbles: 0,
    successfulDribbles: 0,

    tackles: 0,
    interceptions: 0,

    matchRating: 6.0,

    events: [],

    lastAction: null,

    possession: Math.random() < 0.5 ? "player" : "opponent",

    opponentStrength: enemy.strength,
    clubStrength: club.strength,

    homeClub: player.club,

    actionCount: 0
  };
}

function scoreText(match, player) {
  const club = getClub(player.club);
  const opponent = getClub(match.opponent);

  return (
    `⚽ ${club.icon} ${club.name} ${match.homeScore} - ` +
    `${match.awayScore} ${opponent.icon} ${opponent.name}\n` +
    `⏱️ ${match.minute}'\n`
  );
}

function getMatchRating(match) {
  let rating = 6;

  rating += match.playerGoals * 1.4;
  rating += match.playerAssists * 0.9;
  rating += match.successfulDribbles * 0.08;
  rating += match.keyPasses * 0.08;
  rating += match.tackles * 0.05;
  rating += match.interceptions * 0.05;

  rating -= match.shots > 6 && match.playerGoals === 0 ? 0.4 : 0;
  rating -= match.actionCount > 15 && match.playerGoals === 0 ? 0.2 : 0;

  return clamp(Number(rating.toFixed(1)), 4, 10);
}

function getActionChance(player, match, action) {
  const s = player.stats;

  let chance = 50;

  switch (action) {
    case "pass":
      chance = 55 + s.passing * 0.35 + s.vision * 0.25;
      break;

    case "through":
      chance = 40 + s.passing * 0.30 + s.vision * 0.35;
      break;

    case "dribble":
      chance = 35 + s.dribbling * 0.45 + s.pace * 0.20;
      break;

    case "shoot":
      chance = 30 + s.shooting * 0.50 + s.vision * 0.10;
      break;

    case "cross":
      chance = 40 + s.passing * 0.35 + s.vision * 0.25;
      break;

    case "defend":
      chance = 35 + s.physical * 0.35 + s.vision * 0.25;
      break;

    case "tackle":
      chance = 35 + s.physical * 0.45 + s.vision * 0.15;
      break;
  }

  chance -= match.difficulty * 0.20;

  chance += random(-10, 10);

  return clamp(chance, 15, 92);
}

function progressMatch(match) {
  match.minute += random(3, 9);

  if (match.minute > 90) {
    match.minute = 90;
  }

  match.actionCount++;

  return match.minute;
}

function randomOpponentEvent(player, match) {
  const roll = Math.random();

  if (roll < 0.15) {
    match.awayScore++;

    const scorer = getMatchOpponentPlayer(match.opponent);

    match.events.push(
      `⚠️ ${scorer} profite d'une erreur défensive et marque.`
    );

    match.possession = "player";
    return "goal";
  }

  if (roll < 0.30) {
    const scorer = getMatchOpponentPlayer(match.opponent);

    match.events.push(
      `🧤 ${scorer} tente sa chance... le tir passe juste à côté !`
    );

    match.possession = "player";
    return "shot";
  }

  if (roll < 0.45) {
    match.events.push(
      `🛡️ La défense adverse récupère le ballon.`
    );

    match.possession = "opponent";
    return "defend";
  }

  match.possession = "player";

  return "nothing";
}

function chooseTeammate(player) {
  const club = getClub(player.club);

  if (!club) return "ton coéquipier";

  return pick(club.squad);
}

function actionMenu(match, player, situation = "normal") {
  const score = scoreText(match, player);

  if (situation === "penalty") {
    return (
      score +
      `\n🥅 PENALTY !\n\n` +
      `Le gardien est sur sa ligne.\n\n` +
      `1️⃣ Tir à gauche\n` +
      `2️⃣ Tir au centre\n` +
      `3️⃣ Tir à droite\n` +
      `4️⃣ Panenka`
    );
  }

  if (situation === "faceoff") {
    return (
      score +
      `\n🔥 FACE-À-FACE !\n\n` +
      `Tu es seul devant le gardien.\n\n` +
      `1️⃣ Frapper immédiatement\n` +
      `2️⃣ Dribbler le gardien\n` +
      `3️⃣ Faire une passe`
    );
  }

  if (situation === "counter") {
    return (
      score +
      `\n⚡ CONTRE-ATTAQUE !\n\n` +
      `La défense adverse est désorganisée.\n\n` +
      `1️⃣ Accélérer\n` +
      `2️⃣ Passe en profondeur\n` +
      `3️⃣ Frapper\n` +
      `4️⃣ Attendre le soutien`
    );
  }

  return (
    score +
    `\n🎮 Le ballon arrive sur toi.\n\n` +
    `1️⃣ Passe à ${chooseTeammate(player)}\n` +
    `2️⃣ Passe en profondeur\n` +
    `3️⃣ Dribble\n` +
    `4️⃣ Frappe\n` +
    `5️⃣ Centre\n` +
    `6️⃣ Conserver le ballon`
  );
}

function calculateGoalChance(player, match, distance = "normal") {
  let chance =
    8 +
    player.stats.shooting * 0.42 +
    player.stats.vision * 0.05;

  if (distance === "close") chance += 20;
  if (distance === "far") chance -= 25;

  chance -= match.difficulty * 0.30;

  chance += player.form * 0.08;

  return clamp(chance, 5, 80);
}

function calculatePenalty(player, choice) {
  let chance = 68 + player.stats.shooting * 0.22;

  if (choice === 4) {
    chance -= 15;
  }

  chance += random(-12, 12);

  return clamp(chance, 25, 95);
}

async function showProfile(message, player) {
  const club = getClub(player.club);
  const rating = overall(player);

  const xpNeeded = getLevelXP(player.level);

  return message.reply(
    `╭─〔 ⚽ CARRIÈRE 〕─╮\n` +
    `│\n` +
    `│ 👤 ${player.name}\n` +
    `│ 🏟️ ${club.icon} ${club.name}\n` +
    `│ 📍 ${getPositionName(player.position)}\n` +
    `│ ⭐ Général : ${rating}\n` +
    `│ 🔥 Niveau : ${player.level}\n` +
    `│ 📈 XP : ${player.xp}/${xpNeeded}\n` +
    `│\n` +
    `│ ⚡ Forme : ${player.form}/100\n` +
    `│ 🔋 Énergie : ${player.energy}/100\n` +
    `│ 😎 Moral : ${player.morale}/100\n` +
    `│\n` +
    `│ ⚽ Buts : ${player.goals}\n` +
    `│ 🎯 Passes : ${player.assists}\n` +
    `│ 🏟️ Matchs : ${player.matches}\n` +
    `│ 🟢 Victoires : ${player.wins}\n` +
    `│ 🟡 Nuls : ${player.draws}\n` +
    `│ 🔴 Défaites : ${player.losses}\n` +
    `│\n` +
    `│ 💰 Valeur : ${formatMoney(player.value)} €\n` +
    `│ 💵 Salaire : ${formatMoney(player.salary)} €/match\n` +
    `│ 👥 Fans : ${formatMoney(player.fans)}\n` +
    `│ 🏆 Trophées : ${player.trophies}\n` +
    `│\n` +
    `╰─〔 SATORU GOJO AI 〕─╯`
  );
}

async function showStats(message, player) {
  const s = player.stats;

  return message.reply(
    `⚽ STATISTIQUES DE ${player.name}\n\n` +
    `⭐ Général : ${overall(player)}\n\n` +
    `💨 Vitesse : ${s.pace}\n` +
    `🎯 Passe : ${s.passing}\n` +
    `🥅 Tir : ${s.shooting}\n` +
    `🪄 Dribble : ${s.dribbling}\n` +
    `💪 Physique : ${s.physical}\n` +
    `🧠 Vision : ${s.vision}\n\n` +
    `⚽ Buts : ${player.goals}\n` +
    `🎯 Passes décisives : ${player.assists}\n` +
    `🪄 Dribbles réussis : ${player.successfulDribbles}\n` +
    `🎯 Passes clés : ${player.keyPasses}\n` +
    `🛡️ Tacles : ${player.tackles}\n` +
    `🚫 Interceptions : ${player.interceptions}\n` +
    `⭐ Homme du match : ${player.manOfTheMatch}`
  );
}

async function showClubs(message) {
  const list = Object.entries(CLUBS)
    .map(([key, club]) =>
      `${club.icon} ${club.name} — ${club.strength}/100\n` +
      `   ${key}`
    )
    .join("\n\n");

  return message.reply(
    `🏟️ CLUBS DISPONIBLES\n\n${list}\n\n` +
    `Pour commencer :\n` +
    `+football start`
  );
}

async function showPlayers(message, player) {
  const club = getClub(player.club);

  return message.reply(
    `${club.icon} ${club.name}\n\n` +
    `⭐ JOUEURS\n\n` +
    club.squad.map((name, i) => `${i + 1}. ${name}`).join("\n")
  );
}

async function showAchievements(message, player) {
  const list = Object.entries(ACHIEVEMENTS)
    .map(([id, achievement]) => {
      const unlocked = player.achievements.includes(id);

      return (
        `${unlocked ? "✅" : "🔒"} ${achievement.icon} ` +
        `${achievement.name}\n` +
        `   ${achievement.description}`
      );
    })
    .join("\n\n");

  return message.reply(
    `🏆 SUCCÈS\n\n${list}`
  );
}

async function showRanking(message, usersData) {
  const allUsers = await usersData.getAll();

  const ranking = [];

  for (const user of allUsers || []) {
    const career = user?.data?.football;

    if (!career) continue;

    ranking.push(career);
  }

  ranking.sort((a, b) => {
    const scoreA =
      overall(a) * 10 +
      a.goals * 3 +
      a.assists * 2 +
      a.trophies * 50;

    const scoreB =
      overall(b) * 10 +
      b.goals * 3 +
      b.assists * 2 +
      b.trophies * 50;

    return scoreB - scoreA;
  });

  if (!ranking.length) {
    return message.reply("🏆 Aucun joueur n'est encore classé.");
  }

  const top = ranking.slice(0, 10);

  const text = top.map((p, index) => {
    const club = getClub(p.club);

    return (
      `${index + 1}. ${p.name}\n` +
      `   ${club?.name || "Club inconnu"} • ⭐ ${overall(p)}`
    );
  }).join("\n\n");

  return message.reply(
    `🏆 CLASSEMENT DES JOUEURS\n\n${text}`
  );
}

async function handleTraining(message, player, type, usersData, userID) {
  const now = Date.now();

  if (player.cooldowns.train > now) {
    return message.reply(
      `🏋️ Tu dois récupérer avant de t'entraîner.\n\n` +
      `⏳ Disponible dans : ${getCooldown(player.cooldowns.train)}`
    );
  }

  if (player.energy < 20) {
    return message.reply(
      `🔋 Tu es trop fatigué.\n\n` +
      `Énergie : ${player.energy}/100\n\n` +
      `Joue quelques matchs ou repose-toi avant de reprendre l'entraînement.`
    );
  }

  const result = trainingSession(player, type);

  if (!result) {
    return message.reply(
      `🏋️ CHOISIS TON ENTRAÎNEMENT\n\n` +
      `1️⃣ Vitesse\n` +
      `2️⃣ Finition\n` +
      `3️⃣ Passe\n` +
      `4️⃣ Dribble\n` +
      `5️⃣ Physique\n` +
      `6️⃣ Vision`
    );
  }

  player.cooldowns.train = now + CD.train;

  const newAchievements = checkAchievements(player);

  await saveCareer(usersData, userID, player);

  let text =
    `🏋️ ENTRAÎNEMENT TERMINÉ\n\n` +
    `📚 Travail : ${result.label}\n` +
    `📈 +${result.improvement} ${result.stat}\n` +
    `✨ +${result.xp} XP\n` +
    `🔋 Énergie : ${player.energy}/100\n` +
    `⭐ Général : ${overall(player)}`;

  if (result.leveledUp) {
    text += `\n\n🔥 NIVEAU SUPÉRIEUR !\n` +
      `Tu passes niveau ${player.level}.`;
  }

  if (newAchievements.length) {
    text += `\n\n🏆 Nouveau succès : ` +
      newAchievements.map(a => `${a.icon} ${a.name}`).join(", ");
  }

  return message.reply(text);
}

function getTrainingType(number) {
  const types = {
    1: "speed",
    2: "shooting",
    3: "passing",
    4: "dribbling",
    5: "physical",
    6: "vision"
  };

  return types[number];
}

async function startCareer(message, playerName, usersData, userID) {
  if (!playerName) {
    return message.reply(
      `⚽ CRÉATION DE CARRIÈRE\n\n` +
      `Utilise :\n` +
      `+football start <ton prénom>\n\n` +
      `Exemple :\n` +
      `+football start Charbel`
    );
  }

  const existing = await getCareer(usersData, userID);

  if (existing) {
    return message.reply(
      `⚽ Tu as déjà une carrière.\n\n` +
      `👤 ${existing.name}\n` +
      `🏟️ ${getClub(existing.club)?.name}\n` +
      `⭐ Général : ${overall(existing)}\n\n` +
      `Utilise +football profile pour la consulter.`
    );
  }

  const player = createCareer(
    playerName.slice(0, 20),
    "AIL",
    "madrid"
  );

  player.currentMatch = null;

  await saveCareer(usersData, userID, player);

  return message.reply(
    `⚽ CARRIÈRE CRÉÉE !\n\n` +
    `👤 ${player.name}\n` +
    `🏟️ Real Madrid\n` +
    `📍 Ailier\n` +
    `⭐ Général : ${overall(player)}\n\n` +
    `🔥 Ton aventure commence maintenant.\n\n` +
    `Utilise :\n` +
    `+football profile\n` +
    `+football train\n` +
    `+football match`
  );
}

async function transferPlayer(message, player, target, usersData, userID) {
  if (!target) {
    const clubs = Object.entries(CLUBS)
      .filter(([key]) => key !== player.club)
      .map(([key, club]) =>
        `${club.icon} ${club.name} — ${key}`
      )
      .join("\n");

    return message.reply(
      `🔄 TRANSFERTS\n\n${clubs}\n\n` +
      `Exemple : +football transfer barca`
    );
  }

  const club = getClub(target);

  if (!club) {
    return message.reply(
      `❌ Club introuvable.\n\n` +
      `Utilise +football clubs`
    );
  }

  if (target === player.club) {
    return message.reply(
      `🏟️ Tu es déjà à ${club.name}.`
    );
  }

  if (player.matches < 5) {
    return message.reply(
      `🔒 Ton agent veut que tu joues encore quelques matchs.\n\n` +
      `Matchs nécessaires : 5\n` +
      `Matchs joués : ${player.matches}`
    );
  }

  const difference = club.strength - overall(player);

  if (difference > 18) {
    return message.reply(
      `❌ ${club.name} refuse le transfert.\n\n` +
      `Le club demande un niveau plus élevé.\n` +
      `⭐ Ton général : ${overall(player)}\n` +
      `⭐ Niveau conseillé : ${club.strength - 12}`
    );
  }

  const oldClub = getClub(player.club);

  player.club = target;
  player.form = clamp(player.form + 5, 0, 100);
  player.morale = clamp(player.morale + 8, 0, 100);

  player.salary = Math.round(
    player.salary * (club.strength / Math.max(oldClub.strength, 1)) * 1.08
  );

  player.value = Math.round(
    player.value * 1.15
  );

  await saveCareer(usersData, userID, player);

  return message.reply(
    `🔄 TRANSFERT OFFICIEL !\n\n` +
    `👤 ${player.name}\n` +
    `🏟️ ${oldClub.icon} ${oldClub.name}\n` +
    `⬇️\n` +
    `${club.icon} ${club.name}\n\n` +
    `💰 Salaire : ${formatMoney(player.salary)} €/match\n` +
    `⭐ Général : ${overall(player)}`
  );
}

function createSituation(player, match) {
  const roll = Math.random();

  if (roll < 0.08 && player.position === "BU") {
    return "penalty";
  }

  if (roll < 0.17) {
    return "faceoff";
  }

  if (roll < 0.27) {
    return "counter";
  }

  return "normal";
}

function resolveNormalAction(choice, player, match) {
  const teammate = chooseTeammate(player);

  switch (choice) {
    case 1: {
      match.passes++;

      const chance = getActionChance(player, match, "pass");

      if (random(1, 100) <= chance) {
        match.keyPasses++;

        return {
          success: true,
          text:
            `🎯 Belle passe vers ${teammate} !\n` +
            `${teammate} se retrouve en bonne position.`,
          next: "chance"
        };
      }

      return {
        success: false,
        text:
          `❌ La passe est interceptée !\n` +
          `La défense adverse lit bien ton intention.`,
        next: "opponent"
      };
    }

    case 2: {
      match.passes++;

      const chance = getActionChance(player, match, "through");

      if (random(1, 100) <= chance) {
        match.keyPasses++;

        return {
          success: true,
          text:
            `⚡ PASSE EN PROFONDEUR !\n\n` +
            `${teammate} part dans le dos de la défense !`,
          next: "chance"
        };
      }

      return {
        success: false,
        text:
          `🛡️ Le défenseur anticipe parfaitement la passe.`,
        next: "opponent"
      };
    }

    case 3: {
      match.dribbles++;

      const chance = getActionChance(player, match, "dribble");

      if (random(1, 100) <= chance) {
        match.successfulDribbles++;

        return {
          success: true,
          text:
            `🪄 MAGNIFIQUE DRIBBLE !\n\n` +
            `Tu élimines ton adversaire et continues ta course.`,
          next: "chance"
        };
      }

      return {
        success: false,
        text:
          `🛡️ Le défenseur ne tombe pas dans le piège.\n` +
          `Il récupère le ballon.`,
        next: "opponent"
      };
    }

    case 4: {
      match.shots++;

      const chance = calculateGoalChance(
        player,
        match,
        Math.random() < 0.25 ? "far" : "normal"
      );

      if (random(1, 100) <= chance) {
        match.homeScore++;
        match.playerGoals++;

        return {
          success: true,
          text:
            `⚽ BUT DE ${player.name.toUpperCase()} !\n\n` +
            `🔥 Frappe parfaite !\n` +
            `Le gardien ne peut rien faire.`,
          next: "goal"
        };
      }

      return {
        success: false,
        text:
          `🥅 FRAPPE !\n\n` +
          `Le gardien repousse le ballon !`,
        next: "opponent"
      };
    }

    case 5: {
      match.passes++;

      const chance = getActionChance(player, match, "cross");

      if (random(1, 100) <= chance) {
        return {
          success: true,
          text:
            `🎯 CENTRE PARFAIT !\n\n` +
            `${teammate} est à la réception.`,
          next: "chance"
        };
      }

      return {
        success: false,
        text:
          `❌ Centre trop profond.\n` +
          `Le ballon sort de la zone dangereuse.`,
        next: "opponent"
      };
    }

    case 6: {
      player.energy = clamp(player.energy + 2, 0, 100);

      return {
        success: true,
        text:
          `🧠 Tu gardes calmement le ballon.\n\n` +
          `Tu attends le bon moment pour construire l'action.`,
        next: "chance"
      };
    }

    default:
      return null;
  }
}

function resolveChance(choice, player, match) {
  const teammate = chooseTeammate(player);

  switch (choice) {
    case 1: {
      match.shots++;

      const chance = calculateGoalChance(
        player,
        match,
        "close"
      );

      if (random(1, 100) <= chance) {
        match.homeScore++;
        match.playerGoals++;

        return {
          text:
            `⚽ BUT !!!\n\n` +
            `${player.name} termine l'action !\n` +
            `Le stade explose !`,
          endAction: true
        };
      }

      return {
        text:
          `🧤 ARRÊT EXCEPTIONNEL !\n\n` +
          `Le gardien sort une parade énorme.`,
        endAction: true
      };
    }

    case 2: {
      match.passes++;
      match.assists++;

      if (random(1, 100) <= 55) {
        match.homeScore++;

        return {
          text:
            `🎯 PASSE DÉCISIVE !\n\n` +
            `${teammate} reprend ton ballon et marque !`,
          endAction: true
        };
      }

      return {
        text:
          `❌ ${teammate} rate sa tentative.`,
        endAction: true
      };
    }

    case 3: {
      match.dribbles++;

      if (random(1, 100) <= getActionChance(player, match, "dribble")) {
        match.successfulDribbles++;

        return {
          text:
            `🪄 Tu élimines le défenseur !\n\n` +
            `Tu te retrouves face au gardien.`,
          next: "faceoff"
        };
      }

      return {
        text:
          `🛡️ Le défenseur intervient au dernier moment.`,
        endAction: true
      };
    }

    default:
      return null;
  }
}

function resolveCounter(choice, player, match) {
  switch (choice) {
    case 1: {
      player.energy = clamp(player.energy - 5, 0, 100);

      if (
        random(1, 100) <=
        40 + player.stats.pace * 0.35 - match.difficulty * 0.2
      ) {
        return {
          text:
            `💨 TU ACCÉLÈRES !\n\n` +
            `Tu dépasses ton adversaire et arrives dans la surface.`,
          next: "chance"
        };
      }

      return {
        text:
          `🛡️ Le défenseur réussit à te rattraper.`,
        endAction: true
      };
    }

    case 2: {
      match.passes++;

      if (
        random(1, 100) <=
        getActionChance(player, match, "through")
      ) {
        return {
          text:
            `🎯 Passe parfaite dans la profondeur !\n\n` +
            `Ton coéquipier part seul.`,
          next: "chance"
        };
      }

      return {
        text:
          `❌ La défense coupe la passe.`,
        endAction: true
      };
    }

    case 3: {
      match.shots++;

      const chance = calculateGoalChance(
        player,
        match,
        "normal"
      );

      if (random(1, 100) <= chance) {
        match.homeScore++;
        match.playerGoals++;

        return {
          text:
            `⚽ BUT EN CONTRE-ATTAQUE !\n\n` +
            `${player.name} frappe sans hésiter !`,
          endAction: true
        };
      }

      return {
        text:
          `🥅 Frappe repoussée par le gardien.`,
        endAction: true
      };
    }

    case 4:
      return {
        text:
          `🧠 Tu attends le soutien.\n\n` +
          `Ton équipe remonte et garde la possession.`,
        next: "normal"
      };

    default:
      return null;
  }
}

function resolveFaceoff(choice, player, match) {
  switch (choice) {
    case 1: {
      match.shots++;

      if (
        random(1, 100) <=
        calculateGoalChance(player, match, "close")
      ) {
        match.homeScore++;
        match.playerGoals++;

        return {
          text:
            `⚽ BUT !\n\n` +
            `Tu frappes avant que le gardien puisse fermer l'angle.`,
          endAction: true
        };
      }

      return {
        text:
          `🧤 LE GARDIEN GAGNE LE DUEL !`,
        endAction: true
      };
    }

    case 2: {
      match.dribbles++;

      if (
        random(1, 100) <=
        getActionChance(player, match, "dribble")
      ) {
        match.successfulDribbles++;
        match.homeScore++;
        match.playerGoals++;

        return {
          text:
            `🪄 TU ÉLIMINES LE GARDIEN !\n\n` +
            `⚽ BUT !`,
          endAction: true
        };
      }

      return {
        text:
          `🧤 Le gardien reste debout et récupère le ballon.`,
        endAction: true
      };
    }

    case 3:
      match.passes++;

      if (random(1, 100) <= 70) {
        match.assists++;
        match.homeScore++;

        return {
          text:
            `🎯 TU OFFRES LE BUT À TON COÉQUIPIER !\n\n` +
            `⚽ Magnifique action collective.`,
          endAction: true
        };
      }

      return {
        text:
          `❌ La défense intercepte ta passe.`,
        endAction: true
      };

    default:
      return null;
  }
}

function resolvePenalty(choice, player, match) {
  const chance = calculatePenalty(player, choice);

  if (random(1, 100) <= chance) {
    match.homeScore++;
    match.playerGoals++;

    return (
      `⚽ BUT SUR PENALTY !\n\n` +
      `${player.name} ne tremble pas.\n` +
      `Le gardien part du mauvais côté.`
    );
  }

  if (random(1, 100) <= 50) {
    return (
      `🧤 PENALTY ARRÊTÉ !\n\n` +
      `Le gardien avait deviné ton intention.`
    );
  }

  return (
    `😱 PENALTY RATÉ !\n\n` +
    `Le ballon ne trouve pas le cadre.`
  );
}

function finishMatch(player, match) {
  match.finished = true;

  const rating = getMatchRating(match);
  match.matchRating = rating;

  player.matches++;

  if (match.homeScore > match.awayScore) {
    player.wins++;
    player.morale = clamp(player.morale + 6, 0, 100);
    player.fans += random(20, 70);
  } else if (match.homeScore === match.awayScore) {
    player.draws++;
    player.morale = clamp(player.morale + 1, 0, 100);
    player.fans += random(5, 25);
  } else {
    player.losses++;
    player.morale = clamp(player.morale - 4, 0, 100);
    player.fans = Math.max(0, player.fans - random(1, 15));
  }

  player.goals += match.playerGoals;
  player.assists += match.playerAssists;
  player.shots += match.shots;
  player.passes += match.passes;
  player.keyPasses += match.keyPasses;
  player.dribbles += match.dribbles;
  player.successfulDribbles += match.successfulDribbles;
  player.tackles += match.tackles;
  player.interceptions += match.interceptions;

  player.energy = clamp(
    player.energy - random(12, 25),
    0,
    100
  );

  player.form = clamp(
    player.form + (rating >= 7 ? 5 : rating < 5.5 ? -5 : 1),
    0,
    100
  );

  const xp =
    30 +
    Math.round(rating * 8) +
    match.playerGoals * 35 +
    match.playerAssists * 25;

  const leveledUp = addXP(player, xp);

  if (rating >= 8.5) {
    player.manOfTheMatch++;
  }

  if (match.playerGoals > 0) {
    player.value += match.playerGoals * 25000;
  }

  player.value = Math.round(
    player.value * (1 + Math.max(0, rating - 6) / 100)
  );

  const achievements = checkAchievements(player);

  return {
    rating,
    xp,
    leveledUp,
    achievements
  };
}

async function finishAndSave(message, player, match, usersData, userID) {
  const result = finishMatch(player, match);

  player.currentMatch = null;

  await saveCareer(usersData, userID, player);

  const club = getClub(player.club);
  const opponent = getClub(match.opponent);

  let resultIcon = "🟡";

  if (match.homeScore > match.awayScore) {
    resultIcon = "🟢";
  } else if (match.homeScore < match.awayScore) {
    resultIcon = "🔴";
  }

  let text =
    `╭─〔 ⚽ FIN DU MATCH 〕─╮\n` +
    `│\n` +
    `│ ${club.icon} ${club.name} ${match.homeScore} - ` +
    `${match.awayScore} ${opponent.icon} ${opponent.name}\n` +
    `│\n` +
    `│ ${resultIcon} ${match.homeScore > match.awayScore ? "VICTOIRE" : match.homeScore === match.awayScore ? "MATCH NUL" : "DÉFAITE"}\n` +
    `│\n` +
    `│ ⭐ Note : ${result.rating}/10\n` +
    `│ ⚽ Tes
