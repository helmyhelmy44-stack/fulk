import {
  ARENA_PAD,
  BULLET_SPEED,
  COMBO_WINDOW,
  ENEMY,
  ENEMY_BULLET_SPEED,
  FIRE_COOLDOWN,
  FIXED_DT,
  INVULN_TIME,
  MAX_FRAME_DT,
  MAX_SHIELD,
  MAX_SPEED_LEVEL,
  MAX_SPREAD,
  PICKUP_ATTRACT,
  PLAYER_ACCEL,
  PLAYER_BASE_SPEED,
  PLAYER_RADIUS,
  START_LIVES,
} from "./constants";
import { copy } from "./copy";
import { Input } from "./input";
import { GameAudio } from "./audio";
import { Starfield } from "./stars";
import { loadSprites, type SpritePack } from "./assets";
import { addScore, loadScores, loadSettings, qualifies, saveSettings } from "./persist";
import { useGameUI } from "./store";
import type { EnemyKind, Mode, PickupKind, Settings, UpgradeId } from "./types";

type Bullet = {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  life: number;
  friendly: boolean;
  dmg: number;
};

type Enemy = {
  active: boolean;
  kind: EnemyKind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  hp: number;
  maxHp: number;
  speed: number;
  fire: number;
  fireCd: number;
  spread: number;
  flash: number;
  score: number;
};

type Pickup = {
  active: boolean;
  kind: PickupKind;
  x: number;
  y: number;
  life: number;
  bob: number;
};

type Particle = {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  r: number;
  g: number;
  b: number;
};

type Flash = { active: boolean; x: number; y: number; ang: number; t: number };
type Boom = { active: boolean; x: number; y: number; t: number; scale: number };
type Floater = { active: boolean; x: number; y: number; text: string; t: number };

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v));
}

function rand(a: number, b: number) {
  return a + Math.random() * (b - a);
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function pool<T>(n: number, make: () => T): T[] {
  return Array.from({ length: n }, make);
}

function waveQueue(n: number): { kind: EnemyKind; wait: number }[] {
  const scouts = 4 + n * 2;
  const fighters = Math.max(0, n);
  const heavies = n >= 3 ? Math.floor((n - 1) / 2) : 0;
  const wait = Math.max(0.2, 0.82 - n * 0.045);
  const q: { kind: EnemyKind; wait: number }[] = [];
  for (let i = 0; i < scouts; i++) q.push({ kind: "scout", wait });
  for (let i = 0; i < fighters; i++) q.push({ kind: "fighter", wait: wait * 1.15 });
  for (let i = 0; i < heavies; i++) q.push({ kind: "heavy", wait: wait * 1.4 });
  for (let i = q.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = q[i]!;
    q[i] = q[j]!;
    q[j] = tmp;
  }
  return q;
}

export class FalakGame {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  w = 800;
  h = 600;
  dpr = 1;
  input: Input;
  audio = new GameAudio();
  stars = new Starfield();
  sprites: SpritePack | null = null;
  mode: Mode = "menu";
  acc = 0;
  lastT = 0;
  raf = 0;
  reduced = false;
  settings: Settings;
  isTouch = false;

  player = {
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    ang: -Math.PI / 2,
    r: PLAYER_RADIUS,
    lives: START_LIVES,
    shield: 0,
    maxShield: 0,
    shieldCd: 0,
    spread: 1,
    speedLevel: 0,
    fireCd: 0,
    invuln: 0,
  };
  score = 0;
  wave = 0;
  combo = 0;
  comboT = 0;
  banner = "";
  bannerT = 0;
  trauma = 0;
  hitstop = 0;
  spawnQ: { kind: EnemyKind; wait: number }[] = [];
  spawnT = 0;
  restT = 0;
  lastScore = 0;
  upgradeChoices: UpgradeId[] = [];
  waveOpen = false;
  lastHud = "";

  bullets: Bullet[];
  enemies: Enemy[];
  pickups: Pickup[];
  particles: Particle[];
  flashes: Flash[];
  booms: Boom[];
  floaters: Floater[];

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas");
    this.ctx = ctx;
    this.input = new Input(canvas);
    this.settings = loadSettings();
    this.audio.setMuted(this.settings.muted);
    this.input.onUnlock = () => this.audio.unlock();
    this.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.isTouch = window.matchMedia("(pointer: coarse)").matches;

    this.bullets = pool(360, () => ({
      active: false, x: 0, y: 0, vx: 0, vy: 0, r: 4, life: 0, friendly: true, dmg: 1,
    }));
    this.enemies = pool(80, () => ({
      active: false, kind: "scout", x: 0, y: 0, vx: 0, vy: 0, r: 12, hp: 1, maxHp: 1,
      speed: 100, fire: 0, fireCd: 0, spread: 0, flash: 0, score: 100,
    }));
    this.pickups = pool(16, () => ({
      active: false, kind: "star", x: 0, y: 0, life: 0, bob: 0,
    }));
    this.particles = pool(420, () => ({
      active: false, x: 0, y: 0, vx: 0, vy: 0, life: 0, max: 1, size: 2, r: 255, g: 255, b: 255,
    }));
    this.flashes = pool(20, () => ({ active: false, x: 0, y: 0, ang: 0, t: 0 }));
    this.booms = pool(24, () => ({ active: false, x: 0, y: 0, t: 0, scale: 1 }));
    this.floaters = pool(24, () => ({ active: false, x: 0, y: 0, text: "", t: 0 }));

    this.resize();
    this.resetPlayer(true);
    this.publish();
    void loadSprites().then((s) => {
      this.sprites = s;
    });

    this.onResize = this.onResize.bind(this);
    this.onPointer = this.onPointer.bind(this);
    this.loop = this.loop.bind(this);
    window.addEventListener("resize", this.onResize);
    canvas.addEventListener("pointermove", this.onPointer);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") this.audio.resume();
      else this.input.keys.clear();
    });

    const qa = import.meta.env.DEV || new URLSearchParams(location.search).has("qa");
    if (qa) {
      window.__controlsTest = {
        getYaw: () => this.player.ang,
        getSpeed: () => Math.hypot(this.player.vx, this.player.vy),
        getX: () => this.player.x,
        getY: () => this.player.y,
        setKeys: (codes) => {
          this.input.setKeys(codes);
          if (this.mode === "menu") this.begin();
        },
        setSteer: (v) => this.input.setSteer(v),
      };
    }

    this.lastT = performance.now();
    this.raf = requestAnimationFrame(this.loop);
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    window.removeEventListener("resize", this.onResize);
    this.canvas.removeEventListener("pointermove", this.onPointer);
    this.input.destroy();
    delete window.__controlsTest;
  }

  private onResize() {
    this.resize();
  }

  private onPointer(e: PointerEvent) {
    const r = this.canvas.getBoundingClientRect();
    this.input.pointerX = ((e.clientX - r.left) / r.width) * this.w;
    this.input.pointerY = ((e.clientY - r.top) / r.height) * this.h;
    this.input.pointerIn = true;
  }

  resize() {
    const parent = this.canvas.parentElement ?? document.body;
    const w = Math.max(320, parent.clientWidth);
    const h = Math.max(480, parent.clientHeight);
    this.w = w;
    this.h = h;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.floor(w * this.dpr);
    this.canvas.height = Math.floor(h * this.dpr);
    this.canvas.style.width = `${w}px`;
    this.canvas.style.height = `${h}px`;
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.stars.resize(w, h);
    this.player.x = clamp(this.player.x || w / 2, ARENA_PAD, w - ARENA_PAD);
    this.player.y = clamp(this.player.y || h / 2, ARENA_PAD, h - ARENA_PAD);
  }

  begin() {
    this.audio.unlock();
    this.resetRun();
    this.mode = "playing";
    this.nextWave();
    this.publish();
  }

  togglePause() {
    if (this.mode === "playing") {
      this.mode = "paused";
      this.publish();
    } else if (this.mode === "paused") {
      this.mode = "playing";
      this.publish();
    }
  }

  resume() {
    if (this.mode === "paused") {
      this.mode = "playing";
      this.publish();
    }
  }

  toMenu() {
    this.mode = "menu";
    this.clearWorld();
    this.resetPlayer(true);
    this.publish();
  }

  showScores() {
    this.mode = "scores";
    this.publish();
  }

  patchSettings(partial: Partial<Settings>) {
    this.settings = { ...this.settings, ...partial };
    this.audio.setMuted(this.settings.muted);
    saveSettings(this.settings);
    this.publish();
  }

  chooseUpgrade(id: UpgradeId) {
    this.applyUpgrade(id);
    this.mode = "playing";
    this.nextWave();
    this.publish(true);
  }

  submitName(name: string) {
    const n = name.trim().slice(0, 14) || "قائد";
    const scores = addScore({ name: n, score: this.lastScore, wave: this.wave, at: Date.now() });
    useGameUI.setState({ scores, mode: "scores" });
    this.mode = "scores";
  }

  private resetRun() {
    this.clearWorld();
    this.resetPlayer(false);
    this.score = 0;
    this.wave = 0;
    this.combo = 0;
    this.comboT = 0;
    this.trauma = 0;
    this.hitstop = 0;
    this.restT = 0;
    this.lastScore = 0;
    this.waveOpen = false;
  }

  private resetPlayer(center: boolean) {
    this.player.x = center ? this.w / 2 : this.w / 2;
    this.player.y = center ? this.h / 2 : this.h * 0.62;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.ang = -Math.PI / 2;
    this.player.lives = START_LIVES;
    this.player.shield = 0;
    this.player.maxShield = 0;
    this.player.shieldCd = 0;
    this.player.spread = 1;
    this.player.speedLevel = 0;
    this.player.fireCd = 0;
    this.player.invuln = 0;
  }

  private clearWorld() {
    for (const a of this.bullets) a.active = false;
    for (const a of this.enemies) a.active = false;
    for (const a of this.pickups) a.active = false;
    for (const a of this.particles) a.active = false;
    for (const a of this.flashes) a.active = false;
    for (const a of this.booms) a.active = false;
    for (const a of this.floaters) a.active = false;
    this.spawnQ = [];
  }

  private nextWave() {
    this.wave += 1;
    this.spawnQ = waveQueue(this.wave);
    this.spawnT = 0.4;
    this.restT = 0;
    this.waveOpen = true;
    this.showBanner(copy.waveStart(this.wave));
    this.audio.wave();
  }

  private showBanner(text: string) {
    this.banner = text;
    this.bannerT = 1.8;
  }

  private applyUpgrade(id: UpgradeId) {
    if (id === "spread") this.player.spread = Math.min(MAX_SPREAD, this.player.spread + 1);
    if (id === "shield") {
      this.player.maxShield = Math.min(MAX_SHIELD, this.player.maxShield + 1);
      this.player.shield = this.player.maxShield;
    }
    if (id === "speed") this.player.speedLevel = Math.min(MAX_SPEED_LEVEL, this.player.speedLevel + 1);
    this.audio.pickup();
  }

  private grab<T extends { active: boolean }>(arr: T[]): T | null {
    for (const it of arr) {
      if (!it.active) return it;
    }
    return null;
  }

  private emit(x: number, y: number, n: number, color: [number, number, number], speed: number, size: number) {
    for (let i = 0; i < n; i++) {
      const p = this.grab(this.particles);
      if (!p) return;
      const a = Math.random() * Math.PI * 2;
      const s = rand(speed * 0.3, speed);
      p.active = true;
      p.x = x;
      p.y = y;
      p.vx = Math.cos(a) * s;
      p.vy = Math.sin(a) * s;
      p.life = p.max = rand(0.25, 0.7);
      p.size = rand(size * 0.5, size);
      p.r = color[0];
      p.g = color[1];
      p.b = color[2];
    }
  }

  private boom(x: number, y: number, scale: number) {
    const b = this.grab(this.booms);
    if (b) {
      b.active = true;
      b.x = x;
      b.y = y;
      b.t = 0;
      b.scale = scale;
    }
  }

  private float(x: number, y: number, text: string) {
    const f = this.grab(this.floaters);
    if (f) {
      f.active = true;
      f.x = x;
      f.y = y;
      f.text = text;
      f.t = 0;
    }
  }

  private fireBullet(
    x: number,
    y: number,
    ang: number,
    speed: number,
    friendly: boolean,
    r: number,
    dmg: number,
  ) {
    const b = this.grab(this.bullets);
    if (!b) return;
    b.active = true;
    b.x = x;
    b.y = y;
    b.vx = Math.cos(ang) * speed;
    b.vy = Math.sin(ang) * speed;
    b.r = r;
    b.life = 1.6;
    b.friendly = friendly;
    b.dmg = dmg;
  }

  private playerShoot() {
    const p = this.player;
    const n = p.spread;
    const spread = n === 1 ? 0 : 0.12 + (n - 2) * 0.04;
    const nose = p.r + 10;
    const ox = p.x + Math.cos(p.ang) * nose;
    const oy = p.y + Math.sin(p.ang) * nose;
    for (let i = 0; i < n; i++) {
      const t = n === 1 ? 0 : (i / (n - 1) - 0.5) * 2;
      this.fireBullet(ox, oy, p.ang + t * spread, BULLET_SPEED, true, 4.5, 1);
    }
    const fl = this.grab(this.flashes);
    if (fl) {
      fl.active = true;
      fl.x = ox;
      fl.y = oy;
      fl.ang = p.ang;
      fl.t = 0;
    }
    this.trauma = Math.min(1, this.trauma + 0.08);
    this.audio.shoot();
    this.emit(ox, oy, 3, [180, 220, 255], 80, 2);
  }

  private spawnEnemy(kind: EnemyKind) {
    const e = this.grab(this.enemies);
    if (!e) return;
    const spec = ENEMY[kind];
    const side = Math.floor(Math.random() * 4);
    let x = 0;
    let y = 0;
    if (side === 0) {
      x = rand(0, this.w);
      y = -20;
    } else if (side === 1) {
      x = this.w + 20;
      y = rand(0, this.h);
    } else if (side === 2) {
      x = rand(0, this.w);
      y = this.h + 20;
    } else {
      x = -20;
      y = rand(0, this.h);
    }
    const hpScale = 1 + this.wave * 0.08;
    e.active = true;
    e.kind = kind;
    e.x = x;
    e.y = y;
    e.vx = 0;
    e.vy = 0;
    e.r = spec.r;
    e.hp = Math.ceil(spec.hp * hpScale);
    e.maxHp = e.hp;
    e.speed = spec.speed * (1 + this.wave * 0.02);
    e.fire = spec.fire;
    e.fireCd = rand(0.4, spec.fire || 1);
    e.spread = spec.spread;
    e.flash = 0;
    e.score = spec.score;
  }

  private dropPickup(x: number, y: number, kind?: PickupKind) {
    const p = this.grab(this.pickups);
    if (!p) return;
    p.active = true;
    p.kind = kind ?? pick(["spread", "shield", "speed", "star", "star"]);
    p.x = x;
    p.y = y;
    p.life = 9;
    p.bob = Math.random() * Math.PI * 2;
  }

  private killEnemy(e: Enemy) {
    e.active = false;
    this.combo += 1;
    this.comboT = COMBO_WINDOW;
    const mult = 1 + Math.min(8, this.combo - 1) * 0.15;
    const pts = Math.round(e.score * mult);
    this.score += pts;
    this.float(e.x, e.y, `+${pts}`);
    this.boom(e.x, e.y, e.kind === "heavy" ? 1.4 : 1);
    this.emit(
      e.x,
      e.y,
      e.kind === "heavy" ? 22 : 12,
      e.kind === "scout" ? [232, 140, 90] : e.kind === "fighter" ? [220, 90, 80] : [200, 70, 60],
      180,
      3.2,
    );
    this.audio.explode(e.kind === "heavy");
    this.trauma = Math.min(1, this.trauma + (e.kind === "heavy" ? 0.45 : 0.22));
    this.hitstop = Math.max(this.hitstop, e.kind === "heavy" ? 0.07 : 0.03);
    const chance = e.kind === "heavy" ? 0.42 : e.kind === "fighter" ? 0.2 : 0.1;
    if (Math.random() < chance) this.dropPickup(e.x, e.y);
  }

  private hurtPlayer(fromX: number, fromY: number) {
    const p = this.player;
    if (p.invuln > 0) return;
    if (p.shield > 0) {
      p.shield -= 1;
      p.shieldCd = 5;
      p.invuln = 0.55;
      this.trauma = Math.min(1, this.trauma + 0.3);
      this.emit(p.x, p.y, 10, [160, 200, 230], 140, 2.5);
      this.audio.hit();
      return;
    }
    p.lives -= 1;
    p.invuln = INVULN_TIME;
    this.hitstop = 0.1;
    this.trauma = 0.85;
    this.emit(p.x, p.y, 18, [230, 220, 220], 200, 3);
    this.audio.hit();
    const dx = p.x - fromX;
    const dy = p.y - fromY;
    const m = Math.hypot(dx, dy) || 1;
    p.vx += (dx / m) * 220;
    p.vy += (dy / m) * 220;
    if (p.lives <= 0) this.gameOver();
  }

  private gameOver() {
    this.lastScore = this.score;
    this.mode = "gameover";
    this.showBanner(copy.gameover);
    this.audio.explode(true);
    this.publish();
  }

  private openUpgrades() {
    const opts: UpgradeId[] = [];
    const poolIds: UpgradeId[] = ["spread", "shield", "speed"];
    for (const id of poolIds) {
      if (id === "spread" && this.player.spread >= MAX_SPREAD) continue;
      if (id === "shield" && this.player.maxShield >= MAX_SHIELD) continue;
      if (id === "speed" && this.player.speedLevel >= MAX_SPEED_LEVEL) continue;
      opts.push(id);
    }
    if (opts.length === 0) {
      this.score += 800;
      this.float(this.player.x, this.player.y - 20, "+800");
      this.restT = 0.8;
      return;
    }
    this.upgradeChoices = opts;
    this.mode = "upgrade";
    this.publish();
  }

  private loop(now: number) {
    const raw = Math.min(MAX_FRAME_DT, (now - this.lastT) / 1000);
    this.lastT = now;
    this.acc += raw;
    const simulating = this.mode === "playing";
    if (simulating) {
      if (this.hitstop > 0) {
        this.hitstop -= raw;
      } else {
        while (this.acc >= FIXED_DT) {
          this.step(FIXED_DT);
          this.acc -= FIXED_DT;
        }
      }
    } else {
      this.acc = 0;
      const act = this.input.sample(this.w, this.h);
      if (this.mode === "playing" || this.mode === "paused") {
        /* handled in UI */
      }
      if (act.pause && (this.mode === "paused" || this.mode === "playing")) this.togglePause();
    }
    const camVx = simulating ? this.player.vx : 18;
    const camVy = simulating ? this.player.vy : 10;
    if (this.mode !== "paused" && this.mode !== "upgrade") {
      this.stars.update(raw, camVx, camVy, simulating);
    }
    if (!simulating && this.mode === "paused") {
      const act = this.input.sample(this.w, this.h);
      if (act.pause) this.togglePause();
    }
    this.draw(raw);
    this.raf = requestAnimationFrame(this.loop);
  }

  private step(dt: number) {
    const act = this.input.sample(this.w, this.h);
    if (act.pause) {
      this.togglePause();
      return;
    }
    const p = this.player;
    const speed = PLAYER_BASE_SPEED * (1 + p.speedLevel * 0.18);

    let dx = act.moveX;
    let dy = act.moveY;
    const keyMove = Math.hypot(dx, dy) > 0.08;
    if (!keyMove && this.settings.followPointer && this.input.pointerIn && !this.isTouch) {
      const tx = this.input.pointerX - p.x;
      const ty = this.input.pointerY - p.y;
      const dist = Math.hypot(tx, ty);
      if (dist > 18) {
        dx = tx / dist;
        dy = ty / dist;
      }
    }
    const desiredX = dx * speed;
    const desiredY = dy * speed;
    const k = 1 - Math.exp(-PLAYER_ACCEL * dt);
    p.vx += (desiredX - p.vx) * k;
    p.vy += (desiredY - p.vy) * k;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.x = clamp(p.x, ARENA_PAD, this.w - ARENA_PAD);
    p.y = clamp(p.y, ARENA_PAD, this.h - ARENA_PAD);

    let aimX = this.input.pointerX;
    let aimY = this.input.pointerY;
    if (this.isTouch || !this.input.pointerIn) {
      let best = Infinity;
      for (const e of this.enemies) {
        if (!e.active) continue;
        const d = (e.x - p.x) ** 2 + (e.y - p.y) ** 2;
        if (d < best) {
          best = d;
          aimX = e.x;
          aimY = e.y;
        }
      }
    }
    p.ang = Math.atan2(aimY - p.y, aimX - p.x);

    if (Math.hypot(p.vx, p.vy) > 40) {
      this.emit(
        p.x - Math.cos(p.ang) * 12,
        p.y - Math.sin(p.ang) * 12,
        1,
        [140, 190, 230],
        30,
        1.6,
      );
    }

    p.fireCd -= dt;
    if (act.fire && p.fireCd <= 0) {
      p.fireCd = FIRE_COOLDOWN * (p.spread >= 4 ? 1.12 : 1);
      this.playerShoot();
    }

    p.invuln = Math.max(0, p.invuln - dt);
    p.shieldCd = Math.max(0, p.shieldCd - dt);
    if (p.maxShield > 0 && p.shield < p.maxShield && p.shieldCd <= 0) {
      p.shield += 1;
      p.shieldCd = 6;
    }

    this.comboT -= dt;
    if (this.comboT <= 0) this.combo = 0;
    this.bannerT = Math.max(0, this.bannerT - dt);
    this.trauma = Math.max(0, this.trauma - dt * 1.6);

    this.spawnT -= dt;
    if (this.spawnQ.length && this.spawnT <= 0) {
      const next = this.spawnQ.shift()!;
      this.spawnEnemy(next.kind);
      this.spawnT = next.wait;
    }

    this.updateEnemies(dt);
    this.updateBullets(dt);
    this.updatePickups(dt);
    this.updateFx(dt);

    const liveEnemies = this.enemies.some((e) => e.active);
    if (this.waveOpen && !liveEnemies && this.spawnQ.length === 0) {
      this.waveOpen = false;
      this.showBanner(copy.waveClear);
      this.score += 400 + this.wave * 120;
      if (this.wave > 0 && this.wave % 3 === 0) {
        this.openUpgrades();
      } else {
        this.restT = 1.55;
      }
    }
    if (this.restT > 0 && this.mode === "playing") {
      this.restT -= dt;
      if (this.restT <= 0) this.nextWave();
    }

    this.publish();
  }

  private updateEnemies(dt: number) {
    const p = this.player;
    for (const e of this.enemies) {
      if (!e.active) continue;
      let sx = 0;
      let sy = 0;
      for (const o of this.enemies) {
        if (!o.active || o === e) continue;
        const dx = e.x - o.x;
        const dy = e.y - o.y;
        const d2 = dx * dx + dy * dy;
        const min = (e.r + o.r) * 1.8;
        if (d2 > 0 && d2 < min * min) {
          const d = Math.sqrt(d2);
          sx += (dx / d) * (min - d);
          sy += (dy / d) * (min - d);
        }
      }
      const tx = p.x - e.x;
      const ty = p.y - e.y;
      const td = Math.hypot(tx, ty) || 1;
      const seekX = tx / td;
      const seekY = ty / td;
      const sep = 0.55;
      let vx = seekX * e.speed + sx * sep * 40;
      let vy = seekY * e.speed + sy * sep * 40;
      const vm = Math.hypot(vx, vy) || 1;
      if (vm > e.speed) {
        vx = (vx / vm) * e.speed;
        vy = (vy / vm) * e.speed;
      }
      e.vx = vx;
      e.vy = vy;
      e.x += vx * dt;
      e.y += vy * dt;
      e.flash = Math.max(0, e.flash - dt);

      if (e.fire > 0) {
        e.fireCd -= dt;
        if (e.fireCd <= 0 && td < 520) {
          e.fireCd = e.fire * (0.85 + Math.random() * 0.3);
          const ang = Math.atan2(ty, tx);
          const count = e.spread || 1;
          const fan = count > 1 ? 0.22 : 0;
          for (let i = 0; i < count; i++) {
            const t = count === 1 ? 0 : (i / (count - 1) - 0.5) * 2;
            this.fireBullet(e.x, e.y, ang + t * fan, ENEMY_BULLET_SPEED, false, 5, 1);
          }
        }
      }

      if (p.invuln <= 0) {
        const d = Math.hypot(e.x - p.x, e.y - p.y);
        if (d < e.r + p.r * 0.85) this.hurtPlayer(e.x, e.y);
      }
    }
  }

  private updateBullets(dt: number) {
    const p = this.player;
    for (const b of this.bullets) {
      if (!b.active) continue;
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.life -= dt;
      if (b.life <= 0 || b.x < -40 || b.y < -40 || b.x > this.w + 40 || b.y > this.h + 40) {
        b.active = false;
        continue;
      }
      if (b.friendly) {
        for (const e of this.enemies) {
          if (!e.active) continue;
          const d = Math.hypot(e.x - b.x, e.y - b.y);
          if (d < e.r + b.r) {
            b.active = false;
            e.hp -= b.dmg;
            e.flash = 0.08;
            this.emit(b.x, b.y, 4, [210, 230, 255], 90, 2);
            if (e.hp <= 0) this.killEnemy(e);
            break;
          }
        }
      } else if (p.invuln <= 0) {
        const d = Math.hypot(p.x - b.x, p.y - b.y);
        if (d < p.r + b.r) {
          b.active = false;
          this.hurtPlayer(b.x, b.y);
        }
      }
    }
  }

  private updatePickups(dt: number) {
    const p = this.player;
    for (const u of this.pickups) {
      if (!u.active) continue;
      u.life -= dt;
      u.bob += dt * 3;
      if (u.life <= 0) {
        u.active = false;
        continue;
      }
      const dx = p.x - u.x;
      const dy = p.y - u.y;
      const d = Math.hypot(dx, dy);
      if (d < PICKUP_ATTRACT) {
        const pull = (1 - d / PICKUP_ATTRACT) * 220;
        u.x += (dx / (d || 1)) * pull * dt;
        u.y += (dy / (d || 1)) * pull * dt;
      }
      if (d < p.r + 16) {
        u.active = false;
        if (u.kind === "spread") this.applyUpgrade("spread");
        else if (u.kind === "shield") this.applyUpgrade("shield");
        else if (u.kind === "speed") this.applyUpgrade("speed");
        else {
          this.score += 150;
          this.float(u.x, u.y, "+150");
          this.audio.pickup();
        }
        this.emit(u.x, u.y, 10, [200, 220, 240], 80, 2);
      }
    }
  }

  private updateFx(dt: number) {
    for (const p of this.particles) {
      if (!p.active) continue;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 0.98;
      p.vy *= 0.98;
      p.life -= dt;
      if (p.life <= 0) p.active = false;
    }
    for (const f of this.flashes) {
      if (!f.active) continue;
      f.t += dt;
      if (f.t > 0.1) f.active = false;
    }
    for (const b of this.booms) {
      if (!b.active) continue;
      b.t += dt;
      if (b.t > 0.32) b.active = false;
    }
    for (const f of this.floaters) {
      if (!f.active) continue;
      f.t += dt;
      f.y -= 28 * dt;
      if (f.t > 0.7) f.active = false;
    }
  }

  private publish(force = false) {
    const key = [
      this.mode,
      this.score,
      this.wave,
      this.player.lives,
      this.player.shield,
      this.player.maxShield,
      this.player.spread,
      this.player.speedLevel,
      this.combo,
      this.bannerT > 0 ? this.banner : "",
      this.settings.muted,
      this.settings.shake,
      this.settings.followPointer,
      this.lastScore,
    ].join("|");
    if (!force && key === this.lastHud) return;
    this.lastHud = key;
    useGameUI.setState({
      mode: this.mode,
      score: this.score,
      wave: this.wave,
      lives: this.player.lives,
      shield: this.player.shield,
      maxShield: this.player.maxShield,
      spread: this.player.spread,
      speedLevel: this.player.speedLevel,
      combo: this.combo,
      banner: this.bannerT > 0 ? this.banner : "",
      upgradeChoices: this.upgradeChoices,
      scores: this.mode === "scores" || this.mode === "gameover" ? loadScores() : useGameUI.getState().scores,
      settings: this.settings,
      lastScore: this.lastScore,
      isTouch: this.isTouch,
    });
  }

  private draw(dt: number) {
    const ctx = this.ctx;
    const { w, h } = this;
    ctx.save();
    let ox = 0;
    let oy = 0;
    if (this.settings.shake && this.trauma > 0 && !this.reduced) {
      const mag = this.trauma * this.trauma * 14;
      ox = (Math.random() * 2 - 1) * mag;
      oy = (Math.random() * 2 - 1) * mag;
    }
    ctx.translate(ox, oy);

    this.stars.draw(ctx, this.reduced);

    const vig = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.2, w / 2, h / 2, Math.max(w, h) * 0.7);
    vig.addColorStop(0, "rgba(0,0,0,0)");
    vig.addColorStop(1, "rgba(0,0,0,0.35)");
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, w, h);

    this.drawParticles(ctx, true);
    for (const u of this.pickups) if (u.active) this.drawPickup(ctx, u);
    for (const e of this.enemies) if (e.active) this.drawEnemy(ctx, e);
    for (const b of this.bullets) if (b.active) this.drawBullet(ctx, b);
    if (this.mode !== "menu") this.drawPlayer(ctx);
    for (const f of this.flashes) if (f.active) this.drawMuzzle(ctx, f);
    for (const b of this.booms) if (b.active) this.drawBoom(ctx, b);
    this.drawParticles(ctx, false);
    for (const f of this.floaters) if (f.active) this.drawFloater(ctx, f);

    ctx.restore();
    void dt;
  }

  private drawSprite(
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement | null,
    x: number,
    y: number,
    ang: number,
    size: number,
    fallback: () => void,
  ) {
    if (img) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(ang + Math.PI / 2);
      ctx.drawImage(img, -size / 2, -size / 2, size, size);
      ctx.restore();
    } else {
      fallback();
    }
  }

  private drawPlayer(ctx: CanvasRenderingContext2D) {
    const p = this.player;
    if (p.invuln > 0 && Math.floor(p.invuln * 12) % 2 === 0) return;
    if (p.shield > 0) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r + 10 + Math.sin(performance.now() / 180) * 1.5, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(170, 210, 230, ${0.35 + p.shield * 0.15})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    this.drawSprite(ctx, this.sprites?.player ?? null, p.x, p.y, p.ang, 46, () => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.ang + Math.PI / 2);
      ctx.fillStyle = "#d7e4f0";
      ctx.beginPath();
      ctx.moveTo(0, -18);
      ctx.lineTo(12, 14);
      ctx.lineTo(0, 8);
      ctx.lineTo(-12, 14);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    });
  }

  private drawEnemy(ctx: CanvasRenderingContext2D, e: Enemy) {
    const ang = Math.atan2(e.vy, e.vx);
    const img =
      e.kind === "scout"
        ? this.sprites?.scout ?? null
        : e.kind === "fighter"
          ? this.sprites?.fighter ?? null
          : this.sprites?.heavy ?? null;
    const size = e.kind === "heavy" ? 62 : e.kind === "fighter" ? 48 : 36;
    if (e.flash > 0) ctx.globalCompositeOperation = "lighter";
    this.drawSprite(ctx, img, e.x, e.y, ang, size, () => {
      ctx.fillStyle = e.kind === "scout" ? "#e08a58" : e.kind === "fighter" ? "#d06058" : "#a04038";
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalCompositeOperation = "source-over";
    if (e.hp < e.maxHp) {
      const bw = e.r * 2;
      ctx.fillStyle = "rgba(0,0,0,0.4)";
      ctx.fillRect(e.x - bw / 2, e.y - e.r - 8, bw, 3);
      ctx.fillStyle = "#c9d2dc";
      ctx.fillRect(e.x - bw / 2, e.y - e.r - 8, bw * (e.hp / e.maxHp), 3);
    }
  }

  private drawBullet(ctx: CanvasRenderingContext2D, b: Bullet) {
    const img = b.friendly ? this.sprites?.shotPlayer ?? null : this.sprites?.shotEnemy ?? null;
    const ang = Math.atan2(b.vy, b.vx);
    this.drawSprite(ctx, img, b.x, b.y, ang, b.friendly ? 28 : 22, () => {
      ctx.fillStyle = b.friendly ? "#b9d8ee" : "#e09070";
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  private drawPickup(ctx: CanvasRenderingContext2D, u: Pickup) {
    const img = this.sprites?.pickup[u.kind] ?? null;
    const y = u.y + Math.sin(u.bob) * 4;
    this.drawSprite(ctx, img, u.x, y, 0, 36, () => {
      ctx.fillStyle = "#c5d0dc";
      ctx.beginPath();
      ctx.arc(u.x, y, 10, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  private drawMuzzle(ctx: CanvasRenderingContext2D, f: Flash) {
    const frames = this.sprites?.muzzle ?? [];
    const i = Math.min(frames.length - 1, Math.floor((f.t / 0.1) * frames.length));
    const img = frames[i] ?? null;
    this.drawSprite(ctx, img, f.x, f.y, f.ang, 34, () => {
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.fillStyle = "rgba(210,230,255,0.8)";
      ctx.beginPath();
      ctx.arc(f.x, f.y, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  private drawBoom(ctx: CanvasRenderingContext2D, b: Boom) {
    const frames = this.sprites?.explode ?? [];
    const i = Math.min(frames.length - 1, Math.floor((b.t / 0.32) * frames.length));
    const img = frames[i] ?? null;
    this.drawSprite(ctx, img, b.x, b.y, 0, 70 * b.scale, () => {
      ctx.globalCompositeOperation = "lighter";
      ctx.fillStyle = `rgba(200,220,240,${1 - b.t / 0.32})`;
      ctx.beginPath();
      ctx.arc(b.x, b.y, 20 * b.scale * (0.4 + b.t * 3), 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";
    });
  }

  private drawParticles(ctx: CanvasRenderingContext2D, back: boolean) {
    ctx.globalCompositeOperation = "lighter";
    for (const p of this.particles) {
      if (!p.active) continue;
      const t = p.life / p.max;
      if (back && p.size > 2.2) continue;
      if (!back && p.size <= 2.2) continue;
      ctx.fillStyle = `rgba(${p.r},${p.g},${p.b},${t * 0.7})`;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    }
    ctx.globalCompositeOperation = "source-over";
  }

  private drawFloater(ctx: CanvasRenderingContext2D, f: Floater) {
    ctx.globalAlpha = 1 - f.t / 0.7;
    ctx.fillStyle = "#e8eef4";
    ctx.font = "600 13px 'IBM Plex Sans Arabic', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(f.text, f.x, f.y);
    ctx.globalAlpha = 1;
  }
}

export function qualifiesForBoard(score: number) {
  return qualifies(score);
}
