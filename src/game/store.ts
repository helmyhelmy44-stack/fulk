import { create } from "zustand";
import type { HudState } from "./types";
import { loadScores, loadSettings } from "./persist";

const settings = typeof window !== "undefined" ? loadSettings() : {
  muted: false,
  shake: true,
  followPointer: true,
};

export const initialHud: HudState = {
  mode: "menu",
  score: 0,
  wave: 0,
  lives: 3,
  shield: 0,
  maxShield: 0,
  spread: 1,
  speedLevel: 0,
  combo: 0,
  banner: "",
  upgradeChoices: [],
  scores: typeof window !== "undefined" ? loadScores() : [],
  settings,
  lastScore: 0,
  isTouch: false,
};

export const useGameUI = create<HudState>(() => initialHud);
