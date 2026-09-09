export type Mode =
  | "menu"
  | "playing"
  | "paused"
  | "upgrade"
  | "gameover"
  | "scores";

export type EnemyKind = "scout" | "fighter" | "heavy";
export type PickupKind = "spread" | "shield" | "speed" | "star";
export type UpgradeId = "spread" | "shield" | "speed";

export type ScoreEntry = {
  name: string;
  score: number;
  wave: number;
  at: number;
};

export type Settings = {
  muted: boolean;
  shake: boolean;
  followPointer: boolean;
};

export type HudState = {
  mode: Mode;
  score: number;
  wave: number;
  lives: number;
  shield: number;
  maxShield: number;
  spread: number;
  speedLevel: number;
  combo: number;
  banner: string;
  upgradeChoices: UpgradeId[];
  scores: ScoreEntry[];
  settings: Settings;
  lastScore: number;
  isTouch: boolean;
};

export type ControlsProbe = {
  getYaw: () => number;
  getSpeed: () => number;
  getX: () => number;
  getY: () => number;
  setSteer?: (v: number) => void;
  setKeys?: (codes: string[]) => void;
};

declare global {
  interface Window {
    __controlsTest?: ControlsProbe;
  }
}
