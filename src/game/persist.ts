import type { ScoreEntry, Settings } from "./types";

const KEY = "falak-save";
const SAVE_VERSION = 1;
const MAX_SCORES = 10;

type SaveBlob = {
  version: number;
  scores: ScoreEntry[];
  settings: Settings;
};

const defaults: SaveBlob = {
  version: SAVE_VERSION,
  scores: [],
  settings: { muted: false, shake: true, followPointer: true },
};

function migrate(raw: SaveBlob): SaveBlob {
  const s = { ...defaults, ...raw, settings: { ...defaults.settings, ...raw.settings } };
  s.version = SAVE_VERSION;
  s.scores = Array.isArray(raw.scores)
    ? raw.scores
        .filter(
          (e) =>
            e &&
            typeof e.name === "string" &&
            typeof e.score === "number" &&
            typeof e.wave === "number",
        )
        .slice(0, MAX_SCORES)
    : [];
  return s;
}

function read(): SaveBlob {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...defaults, settings: { ...defaults.settings } };
    const parsed = JSON.parse(raw) as SaveBlob;
    return migrate(parsed);
  } catch {
    return { ...defaults, settings: { ...defaults.settings } };
  }
}

function write(save: SaveBlob) {
  try {
    localStorage.setItem(KEY, JSON.stringify(save));
  } catch {
    /* private mode / quota */
  }
}

export function loadSettings(): Settings {
  return { ...read().settings };
}

export function saveSettings(settings: Settings) {
  const cur = read();
  write({ ...cur, settings });
}

export function loadScores(): ScoreEntry[] {
  return read().scores;
}

export function qualifies(score: number): boolean {
  const scores = loadScores();
  if (score <= 0) return false;
  if (scores.length < MAX_SCORES) return true;
  return score > (scores[scores.length - 1]?.score ?? 0);
}

export function addScore(entry: ScoreEntry): ScoreEntry[] {
  const cur = read();
  const scores = [...cur.scores, entry]
    .sort((a, b) => b.score - a.score || b.wave - a.wave)
    .slice(0, MAX_SCORES);
  write({ ...cur, scores });
  return scores;
}
