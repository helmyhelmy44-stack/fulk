export const FIXED_DT = 1 / 60;
export const MAX_FRAME_DT = 0.1;
export const START_LIVES = 3;
export const PLAYER_RADIUS = 16;
export const PLAYER_BASE_SPEED = 290;
export const PLAYER_ACCEL = 14;
export const FIRE_COOLDOWN = 0.13;
export const BULLET_SPEED = 640;
export const ENEMY_BULLET_SPEED = 240;
export const MAX_SPREAD = 5;
export const MAX_SPEED_LEVEL = 3;
export const MAX_SHIELD = 3;
export const INVULN_TIME = 1.4;
export const COMBO_WINDOW = 1.7;
export const PICKUP_ATTRACT = 150;
export const ARENA_PAD = 28;

export const ENEMY = {
  scout: { hp: 1, speed: 165, r: 13, score: 100, fire: 0, spread: 0 },
  fighter: { hp: 3, speed: 118, r: 17, score: 250, fire: 1.55, spread: 1 },
  heavy: { hp: 9, speed: 72, r: 24, score: 600, fire: 2.15, spread: 3 },
} as const;

export const SPRITE = {
  player: "/sprites/player.png",
  scout: "/sprites/scout.png",
  fighter: "/sprites/fighter.png",
  heavy: "/sprites/heavy.png",
  shotPlayer: "/sprites/shot-player.png",
  shotEnemy: "/sprites/shot-enemy.png",
  explode: [
    "/sprites/explode-1.png",
    "/sprites/explode-2.png",
    "/sprites/explode-3.png",
    "/sprites/explode-4.png",
  ],
  muzzle: [
    "/sprites/muzzle-1.png",
    "/sprites/muzzle-2.png",
    "/sprites/muzzle-3.png",
    "/sprites/muzzle-4.png",
  ],
  pickup: {
    spread: "/sprites/pickup-spread.png",
    shield: "/sprites/pickup-shield.png",
    speed: "/sprites/pickup-speed.png",
    star: "/sprites/pickup-star.png",
  },
} as const;
