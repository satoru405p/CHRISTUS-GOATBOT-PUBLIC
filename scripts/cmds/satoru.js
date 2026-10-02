/**
 * ============================================================
 *                    SATORU AI
 *                 GoatBot V2 Edition
 * ============================================================
 *
 * Créateur : Master Charbel
 *
 * APIs :
 *   1. Naruto AI 2
 *   2. Image Generation API
 *   3. Image Editing API
 *
 * Fonctions :
 *   - Conversation naturelle
 *   - Mémoire 20 messages
 *   - Génération d'images
 *   - Modification d'images
 *   - Réponse aux messages de Satoru
 *   - Appel avec ou sans préfixe
 *
 * ============================================================
 */

const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

/* ============================================================
   CONFIGURATION
   ============================================================ */

const NARUTO_API_URL =
    "https://naruto-ai-api-2.onrender.com/";

const IMAGE_GENERATE_URL =
    "https://image-gen-fix.vercel.app/generate";

const IMAGE_EDIT_URL =
    "https://image-gen-fix.vercel.app/edit";

/*
 * Nombre maximum de messages conservés par utilisateur.
 *
 * 20 messages = 10 échanges utilisateur/IA environ.
 */
const MAX_MEMORY = 20;

/*
 * Timeout général.
 */
const AI_TIMEOUT = 90000;

/*
 * Délai avant suppression des fichiers temporaires.
 */
const DELETE_DELAY = 5000;

/*
 * Dossier des données.
 */
const DATA_DIR = path.join(__dirname, "satoru_data");

/*
 * Fichier mémoire.
 */
const MEMORY_FILE = path.join(
    DATA_DIR,
    "memory.json"
);

/*
 * Cache images.
 */
const CACHE_DIR = path.join(
    __dirname,
    "cache"
);

/* ============================================================
   PERSONNALITÉ SATORU
   ============================================================ */

const SYSTEM_PROMPT = `
Tu es SATORU AI.

Tu es une intelligence artificielle avancée inspirée de
Satoru Gojo, mais tu ne dois pas prétendre être réellement
le personnage d'un anime.

Ton créateur est Master Charbel.

IDENTITÉ :
- Nom : Satoru AI
- Créateur : Master Charbel
- Style : intelligent, calme, confiant, légèrement drôle
- Tu peux utiliser quelques références à l'univers de Gojo
- Ne surcharge jamais tes réponses avec des emojis
- Ne réponds pas toujours avec des phrases arrogantes
- Adapte ton ton à l'utilisateur

RÈGLE PRINCIPALE :
Tu dois comprendre naturellement ce que l'utilisateur veut.

L'utilisateur peut :
- discuter avec toi
- poser une question
- demander une explication
- demander du code
- demander de l'aide
- demander une image
- demander une modification d'image
- continuer une conversation précédente

EXEMPLES :

"Salut Satoru"
=> conversation normale.

"Satoru explique-moi JavaScript"
=> conversation normale.

"Satoru dessine un samouraï futuriste"
=> génération d'image.

"Satoru crée une ville cyberpunk sous la pluie"
=> génération d'image.

"Satoru modifie cette image et ajoute un coucher de soleil"
=> modification d'image.

"Change le ciel en violet"
=> si une image est disponible dans le contexte,
   considère cela comme une modification.

IMPORTANT :
Ne demande pas à l'utilisateur d'utiliser une commande spéciale
pour générer une image.

Les phrases naturelles doivent fonctionner.

Tu dois comprendre les formulations comme :

- dessine
- génère
- crée
- imagine
- fais une image
- montre-moi
- transforme
- modifie
- change
- ajoute
- enlève
- remplace
- améliore
- retouche
- mets
- transforme cette photo
- édite cette image

CONVERSATION :
Utilise l'historique fourni pour garder le contexte.

Ne répète pas inutilement les anciennes réponses.

MÉMOIRE :
La mémoire est limitée aux 20 derniers messages.

Si l'utilisateur demande :
"Tu te rappelles ?"

Utilise l'historique disponible.

CRÉATEUR :
Si quelqu'un demande qui t'a créé :
réponds que ton créateur est Master Charbel.

Ne prétends pas connaître des informations privées sur
Master Charbel qui ne sont pas présentes dans le contexte.

STYLE :
Réponds naturellement en français si l'utilisateur parle français.

Si l'utilisateur parle anglais, tu peux répondre anglais.

Ne mets pas systématiquement :
"En tant qu'IA..."

Ne commence pas toutes les réponses par :
"Bien sûr Master Charbel".

Sois naturel.

IMPORTANT POUR LES IMAGES :
Quand une demande semble être une création ou modification
d'image, l'application autour de toi peut exécuter l'action.

Tu dois donc comprendre l'intention sans obliger l'utilisateur
à écrire une commande particulière.
`;

/* ============================================================
   OUTILS GÉNÉRAUX
   ============================================================ */

function ensureDirectories() {
    fs.ensureDirSync(DATA_DIR);
    fs.ensureDirSync(CACHE_DIR);

    if (!fs.existsSync(MEMORY_FILE)) {
        fs.writeJsonSync(
            MEMORY_FILE,
            {},
            {
                spaces: 2
            }
        );
    }
}

/* ============================================================
   MÉMOIRE
   ============================================================ */

function loadMemory() {
    ensureDirectories();

    try {
        const data = fs.readJsonSync(MEMORY_FILE);

        if (!data || typeof data !== "object") {
            return {};
        }

        return data;
    } catch (error) {
        console.error(
            "[SATORU MEMORY LOAD]",
            error.message
        );

        return {};
    }
}

function saveMemory(memory) {
    ensureDirectories();

    try {
        fs.writeJsonSync(
            MEMORY_FILE,
            memory,
            {
                spaces: 2
            }
        );

        return true;
    } catch (error) {
        console.error(
            "[SATORU MEMORY SAVE]",
            error.message
        );

        return false;
    }
}

function getUserMemory(userID) {
    const memory = loadMemory();

    if (!memory[userID]) {
        memory[userID] = [];
    }

    return memory[userID];
}

function addMemory(userID, role, content) {
    const memory = loadMemory();

    if (!memory[userID]) {
        memory[userID] = [];
    }

    memory[userID].push({
        role,
        content,
        timestamp: Date.now()
    });

    /*
     * On garde seulement les 20 derniers messages.
     */
    if (memory[userID].length > MAX_MEMORY) {
        memory[userID] =
            memory[userID].slice(-MAX_MEMORY);
    }

    saveMemory(memory);
}

function clearUserMemory(userID) {
    const memory = loadMemory();

    delete memory[userID];

    saveMemory(memory);
}

function getHistoryForAI(userID) {
    const history = getUserMemory(userID);

    return history.map(item => ({
        role: item.role,
        content: item.content
    }));
}

/* ============================================================
   NETTOYAGE MÉMOIRE
   ============================================================ */

function cleanupOldMemory() {
    const memory = loadMemory();

    const MAX_AGE =
        1000 * 60 * 60 * 24 * 30;

    let changed = false;

    for (const userID of Object.keys(memory)) {
        const oldLength =
            memory[userID].length;

        memory[userID] =
            memory[userID].filter(item => {
                if (!item.timestamp) {
                    return true;
                }

                return (
                    Date.now() -
                    item.timestamp
                ) < MAX_AGE;
            });

        if (
            memory[userID].length !==
            oldLength
        ) {
            changed = true;
        }

        if (
            memory[userID].length === 0
        ) {
            delete memory[userID];
            changed = true;
        }
    }

    if (changed) {
        saveMemory(memory);
    }
}

/* ============================================================
   EXTRACTION DE TEXTE
   ============================================================ */

function normalizeText(value) {
    if (value === undefined || value === null) {
        return "";
    }

    if (typeof value === "string") {
        return value.trim();
    }

    if (typeof value === "number") {
        return String(value);
    }

    return "";
}

function extractAIText(data) {
    if (!data) {
        return "";
    }

    if (typeof data === "string") {
        return data.trim();
    }

    /*
     * Formats fréquents.
     */

    const candidates = [
        data.response,
        data.reply,
        data.answer,
        data.message,
        data.text,
        data.content,
        data.result
    ];

    for (const candidate of candidates) {
        const text = normalizeText(candidate);

        if (text) {
            return text;
        }
    }

    /*
     * Format OpenAI-like.
     */

    if (
        Array.isArray(data.choices) &&
        data.choices.length
    ) {
        const choice = data.choices[0];

        if (choice.message) {
            const text =
                normalizeText(
                    choice.message.content
                );

            if (text) {
                return text;
            }
        }

        const text =
            normalizeText(choice.text);

        if (text) {
            return text;
        }
    }

    /*
     * Structures imbriquées.
     */

    if (data.data) {
        const text =
            extractAIText(data.data);

        if (text) {
            return text;
        }
    }

    if (data.result) {
        const text =
            extractAIText(data.result);

        if (text) {
            return text;
        }
    }

    return "";
}

/* ============================================================
   EXTRACTION D'ERREUR
   ============================================================ */

function extractError(error) {
    try {
        if (
            error &&
            error.response &&
            error.response.data
        ) {
            const data =
                error.response.data;

            if (
                Buffer.isBuffer(data)
            ) {
                const text =
                    data.toString("utf8");

                try {
                    const json =
                        JSON.parse(text);

                    return (
                        json.error ||
                        json.message ||
                        text
                    );
                } catch {
                    return text;
                }
            }

            if (typeof data === "string") {
                return data;
            }

            if (typeof data === "object") {
                return (
                    data.error ||
                    data.message ||
                    JSON.stringify(data)
                );
            }
        }
    } catch {}

    return (
        error?.message ||
        "Erreur inconnue."
    );
}

/* ============================================================
   DÉTECTION DE RATIO
   ============================================================ */

function extractRatio(text) {
    if (!text) {
        return {
            ratio: "1:1",
            text
        };
    }

    const match =
        text.match(
            /(?:^|\s)(\d+:\d+)(?:\s|$)/
        );

    if (!match) {
        return {
            ratio: "1:1",
            text
        };
    }

    return {
        ratio: match[1],
        text: text
            .replace(match[1], "")
            .replace(/\s+/g, " ")
            .trim()
    };
}

/* ============================================================
   URL IMAGE
   ============================================================ */

function extractImageURL(text) {
    if (!text) {
        return null;
    }

    const match =
        text.match(
            /https?:\/\/[^\s]+/i
        );

    return match
        ? match[0]
        : null;
}

/* ============================================================
   PIÈCE JOINTE IMAGE
   ============================================================ */

function getAttachedImage(event) {
    try {
        const attachments =
            event?.attachments ||
            event?.messageReply?.attachments ||
            [];

        if (!Array.isArray(attachments)) {
            return null;
        }

        const image =
            attachments.find(item => {
                return (
                    item &&
                    (
                        item.type === "photo" ||
                        item.type === "image"
                    ) &&
                    item.url
                );
            });

        return image?.url || null;
    } catch {
        return null;
    }
}

/* ============================================================
   DÉTECTION INTENTION IMAGE
   ============================================================ */

function looksLikeImageGeneration(text) {
    if (!text) {
        return false;
    }

    const value =
        text.toLowerCase();

    const patterns = [
        /\bdessine\b/,
        /\bdessiner\b/,
        /\bgénère\b/,
        /\bgénérer\b/,
        /\bgenere\b/,
        /\bgenérer\b/,
        /\bcrée une image\b/,
        /\bcreer une image\b/,
        /\bcréer une image\b/,
        /\bfais une image\b/,
        /\bfaire une image\b/,
        /\bimagine une image\b/,
        /\bproduis une image\b/,
        /\bfabrique une image\b/,
        /\bmontre[- ]moi une image\b/,
        /\bune image de\b/,
        /\bimage de\b/
    ];

    return patterns.some(
        pattern => pattern.test(value)
    );
}

function looksLikeImageEdit(text, hasImage) {
    if (!text) {
        return false;
    }

    const value =
        text.toLowerCase();

    const patterns = [
        /\bmodifie\b/,
        /\bmodifier\b/,
        /\bédite\b/,
        /\béditer\b/,
        /\bedite\b/,
        /\bediter\b/,
        /\bchange\b/,
        /\bchanger\b/,
        /\btransforme\b/,
        /\btransformer\b/,
        /\bretouche\b/,
        /\bretoucher\b/,
        /\baméliore\b/,
        /\baméliorer\b/,
        /\bajoute\b/,
        /\bajouter\b/,
        /\benlève\b/,
        /\benlever\b/,
        /\bremplace\b/,
        /\bremplacer\b/,
        /\bmet[s]?\b/,
        /\bmettre\b/
    ];

    /*
     * Une modification est particulièrement probable
     * lorsqu'une image est disponible.
     */

    if (hasImage) {
        return patterns.some(
            pattern => pattern.test(value)
        );
    }

    /*
     * Même sans image détectée, certaines formulations
     * indiquent clairement une édition.
     */

    return (
        /\bcette image\b/i.test(value) ||
        /\bcette photo\b/i.test(value) ||
        /\bmon image\b/i.test(value)
    );
}

/* ============================================================
   EXTRACTION PROMPT IMAGE
   ============================================================ */

function cleanImagePrompt(text) {
    if (!text) {
        return "";
    }

    return text
        .replace(
            /^satoru[\s,:-]*/i,
            ""
        )
        .replace(
            /^dessine[\s,:-]*/i,
            ""
        )
        .replace(
            /^génère[\s,:-]*/i,
            ""
        )
        .replace(
            /^genere[\s,:-]*/i,
            ""
        )
        .replace(
            /^crée une image[\s,:-]*/i,
            ""
        )
        .replace(
            /^crée[\s,:-]*/i,
            ""
        )
        .replace(
            /^fais une image[\s,:-]*/i,
            ""
        )
        .replace(
            /^modifie[\s,:-]*/i,
            ""
        )
        .replace(
            /^modifier[\s,:-]*/i,
            ""
        )
        .replace(
            /^édite[\s,:-]*/i,
            ""
        )
        .replace(
            /^edite[\s,:-]*/i,
            ""
        )
        .trim();
}

/* ============================================================
   APPEL NARUTO AI 2
   ============================================================ */

async function askSatoruAI({
    userID,
    message
}) {
    const history =
        getHistoryForAI(userID);

    /*
     * Payload volontairement riche.
     *
     * L'API peut utiliser les champs qu'elle reconnaît.
     */

    const payload = {
        message,
        prompt: SYSTEM_PROMPT,
        system: SYSTEM_PROMPT,

        history,

        conversation: history,

        conversationId: String(userID),

        userId: String(userID)
    };

    const response =
        await axios.post(
            NARUTO_API_URL,
            payload,
            {
                timeout: AI_TIMEOUT,
                headers: {
                    "Content-Type":
                        "application/json"
                }
            }
        );

    const answer =
        extractAIText(
            response.data
        );

    if (!answer) {
        throw new Error(
            "L'API Naruto AI n'a renvoyé aucune réponse exploitable."
        );
    }

    return answer;
}

/* ============================================================
   GÉNÉRATION IMAGE
   ============================================================ */

async function generateImage({
    prompt,
    ratio
}) {
    const response =
        await axios.post(
            IMAGE_GENERATE_URL,
            {
                prompt,
                ratio,
                format: "jpeg",
                nw: true
            },
            {
                responseType:
                    "arraybuffer",
                timeout: AI_TIMEOUT
            }
        );

    return Buffer.from(
        response.data
    );
}

/* ============================================================
   ÉDITION IMAGE
   ============================================================ */

async function editImage({
    prompt,
    image,
    ratio
}) {
    const response =
        await axios.post(
            IMAGE_EDIT_URL,
            {
                prompt,
                image,
                ratio
            },
            {
                responseType:
                    "arraybuffer",
                timeout: AI_TIMEOUT
            }
        );

    return Buffer.from(
        response.data
    );
}

/* ============================================================
   FICHIER IMAGE TEMPORAIRE
   ============================================================ */

async function saveTemporaryImage(buffer) {
    await fs.ensureDir(
        CACHE_DIR
    );

    const filename =
        "satoru_" +
        Date.now() +
        "_" +
        Math.random()
            .toString(36)
            .slice(2) +
        ".jpg";

    const filePath =
        path.join(
            CACHE_DIR,
            filename
        );

    await fs.writeFile(
        filePath,
        buffer
    );

    return filePath;
}

async function deleteTemporaryFile(filePath) {
    try {
        if (
            filePath &&
            fs.existsSync(filePath)
        ) {
            await fs.remove(
                filePath
            );
        }
    } catch (error) {
        console.error(
            "[SATORU CACHE DELETE]",
            error.message
        );
    }
}

/* ============================================================
   RÉACTION
   ============================================================ */

function react(api, messageID, emoji) {
    return new Promise(resolve => {
        try {
            api.setMessageReaction(
                emoji,
                messageID,
                () => resolve(),
                true
            );
        } catch {
            resolve();
        }
    });
}

/* ============================================================
   ENVOI D'UNE RÉPONSE ET ENREGISTREMENT REPLY
   ============================================================ */

async function sendSatoruReply({
    message,
    body,
    api,
    event
}) {
    return new Promise(resolve => {
        message.reply(
            body,
            (error, info) => {
                if (!error && info?.messageID) {
                    registerReply(
                        info.messageID,
                        event.senderI
