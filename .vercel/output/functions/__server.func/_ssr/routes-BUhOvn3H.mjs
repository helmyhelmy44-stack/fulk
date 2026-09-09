import { i as __toESM } from "../_runtime.mjs";
import { L as require_react, v as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Pause, c as Gauge, i as Shield, n as Volume2, o as MousePointer2, s as Layers, t as VolumeX } from "../_libs/lucide-react.mjs";
import { t as create } from "../_libs/zustand.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-BUhOvn3H.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var FIXED_DT = 1 / 60;
var MAX_FRAME_DT = .1;
var FIRE_COOLDOWN = .13;
var INVULN_TIME = 1.4;
var COMBO_WINDOW = 1.7;
var ENEMY = {
	scout: {
		hp: 1,
		speed: 165,
		r: 13,
		score: 100,
		fire: 0,
		spread: 0
	},
	fighter: {
		hp: 3,
		speed: 118,
		r: 17,
		score: 250,
		fire: 1.55,
		spread: 1
	},
	heavy: {
		hp: 9,
		speed: 72,
		r: 24,
		score: 600,
		fire: 2.15,
		spread: 3
	}
};
var SPRITE = {
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
		"/sprites/explode-4.png"
	],
	muzzle: [
		"/sprites/muzzle-1.png",
		"/sprites/muzzle-2.png",
		"/sprites/muzzle-3.png",
		"/sprites/muzzle-4.png"
	],
	pickup: {
		spread: "/sprites/pickup-spread.png",
		shield: "/sprites/pickup-shield.png",
		speed: "/sprites/pickup-speed.png",
		star: "/sprites/pickup-star.png"
	}
};
var copy = {
	title: "فلك",
	latin: "FALAK",
	tagline: "موجات من الأعماق. أطلق، ترقَّ، ابقَ على قيد الحياة.",
	start: "ابدأ",
	scores: "أعلى النتائج",
	howMove: "الحركة",
	howMoveHint: "WASD أو الأسهم — أو حرّك المؤشر",
	howAim: "التصويب",
	howAimHint: "اتجاه المؤشر، أو أقرب عدو على اللمس",
	howFire: "الإطلاق",
	howFireHint: "مسافة أو نقرة. استمر للرمي الآلي",
	howPause: "إيقاف",
	howPauseHint: "Esc أو زر الإيقاف",
	pause: "إيقاف مؤقت",
	resume: "استئناف",
	restart: "إعادة",
	menu: "القائمة",
	gameover: "انتهت الرحلة",
	wave: "موجة",
	score: "النقاط",
	lives: "المحاولات",
	combo: "سلسلة",
	enterName: "اسم القائد",
	saveScore: "حفظ النتيجة",
	skipSave: "تخطي",
	emptyScores: "لا نتائج بعد — كن الأول.",
	back: "رجوع",
	upgradeTitle: "اختر ترقية",
	spread: "إطلاق متعدد",
	spreadHint: "مقذوفات إضافية في مروحة أوسع",
	shield: "درع",
	shieldHint: "طبقة حماية تمتص ضربة وتعيد الشحن",
	speed: "سرعة",
	speedHint: "استجابة أعلى واندفاع أسرع",
	muted: "كتم",
	shake: "اهتزاز",
	follow: "اتباع المؤشر",
	waveClear: "الموجة اكتملت",
	waveStart: (n) => `الموجة ${n}`,
	maxed: "الحد الأقصى",
	you: "نتيجتك"
};
var GAME_CODES = /* @__PURE__ */ new Set([
	"KeyW",
	"KeyA",
	"KeyS",
	"KeyD",
	"ArrowUp",
	"ArrowDown",
	"ArrowLeft",
	"ArrowRight",
	"Space",
	"Escape",
	"KeyP",
	"KeyM"
]);
function radial(x, y, dz = .18) {
	const m = Math.hypot(x, y);
	if (m < dz) return {
		x: 0,
		y: 0
	};
	const scale = (m - dz) / (1 - dz) / m;
	return {
		x: x * scale,
		y: y * scale
	};
}
var Input = class {
	keys = /* @__PURE__ */ new Set();
	injected = null;
	injectedSteer = null;
	pointerX = 0;
	pointerY = 0;
	pointerIn = false;
	pointerDown = false;
	fireHeld = false;
	pauseQueued = false;
	canvas;
	stickId = null;
	stickOrigin = {
		x: 0,
		y: 0
	};
	stick = {
		x: 0,
		y: 0
	};
	fireId = null;
	onUnlock;
	constructor(canvas) {
		this.canvas = canvas;
		this.onKeyDown = this.onKeyDown.bind(this);
		this.onKeyUp = this.onKeyUp.bind(this);
		this.onBlur = this.onBlur.bind(this);
		this.onPointerDown = this.onPointerDown.bind(this);
		this.onPointerMove = this.onPointerMove.bind(this);
		this.onPointerUp = this.onPointerUp.bind(this);
		window.addEventListener("keydown", this.onKeyDown);
		window.addEventListener("keyup", this.onKeyUp);
		window.addEventListener("blur", this.onBlur);
		document.addEventListener("visibilitychange", this.onBlur);
		canvas.addEventListener("pointerdown", this.onPointerDown);
		window.addEventListener("pointermove", this.onPointerMove);
		window.addEventListener("pointerup", this.onPointerUp);
		window.addEventListener("pointercancel", this.onPointerUp);
	}
	destroy() {
		window.removeEventListener("keydown", this.onKeyDown);
		window.removeEventListener("keyup", this.onKeyUp);
		window.removeEventListener("blur", this.onBlur);
		document.removeEventListener("visibilitychange", this.onBlur);
		this.canvas.removeEventListener("pointerdown", this.onPointerDown);
		window.removeEventListener("pointermove", this.onPointerMove);
		window.removeEventListener("pointerup", this.onPointerUp);
		window.removeEventListener("pointercancel", this.onPointerUp);
	}
	onKeyDown(e) {
		if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
		this.onUnlock?.();
		if (GAME_CODES.has(e.code)) e.preventDefault();
		this.keys.add(e.code);
		if (e.code === "Escape" || e.code === "KeyP") this.pauseQueued = true;
	}
	onKeyUp(e) {
		this.keys.delete(e.code);
	}
	onBlur() {
		this.keys.clear();
		this.pointerDown = false;
		this.fireHeld = false;
		this.stickId = null;
		this.fireId = null;
		this.stick.x = 0;
		this.stick.y = 0;
	}
	canvasPoint(e) {
		const r = this.canvas.getBoundingClientRect();
		return {
			x: (e.clientX - r.left) / r.width * this.canvas.width * (r.width ? this.canvas.clientWidth / (this.canvas.width || 1) : 1),
			y: (e.clientY - r.top) / r.height * this.canvas.height * (r.height ? this.canvas.clientHeight / (this.canvas.height || 1) : 1)
		};
	}
	logicalPoint(e, cssW, cssH) {
		const r = this.canvas.getBoundingClientRect();
		return {
			x: (e.clientX - r.left) / r.width * cssW,
			y: (e.clientY - r.top) / r.height * cssH
		};
	}
	setLogicalPointer(e, cssW, cssH) {
		const p = this.logicalPoint(e, cssW, cssH);
		this.pointerX = p.x;
		this.pointerY = p.y;
		this.pointerIn = true;
	}
	onPointerDown(e) {
		this.onUnlock?.();
		this.pointerIn = true;
		if (e.pointerType === "touch") {
			const r = this.canvas.getBoundingClientRect();
			if ((e.clientX - r.left) / r.width < .48 && this.stickId === null) {
				this.stickId = e.pointerId;
				this.stickOrigin = {
					x: e.clientX,
					y: e.clientY
				};
				this.stick = {
					x: 0,
					y: 0
				};
				try {
					this.canvas.setPointerCapture(e.pointerId);
				} catch {}
			} else if (this.fireId === null) {
				this.fireId = e.pointerId;
				this.fireHeld = true;
			}
		} else {
			this.pointerDown = true;
			this.fireHeld = e.button === 0;
		}
	}
	onPointerMove(e) {
		if (e.pointerType === "touch" && e.pointerId === this.stickId) {
			const dx = e.clientX - this.stickOrigin.x;
			const dy = e.clientY - this.stickOrigin.y;
			const v = radial(dx / 56, dy / 56, .12);
			const m = Math.hypot(v.x, v.y);
			if (m > 1) {
				this.stick.x = v.x / m;
				this.stick.y = v.y / m;
			} else this.stick = v;
		}
	}
	onPointerUp(e) {
		if (e.pointerId === this.stickId) {
			this.stickId = null;
			this.stick = {
				x: 0,
				y: 0
			};
		}
		if (e.pointerId === this.fireId) {
			this.fireId = null;
			this.fireHeld = false;
		}
		if (e.pointerType !== "touch") {
			this.pointerDown = false;
			this.fireHeld = false;
		}
	}
	setKeys(codes) {
		this.injected = codes;
	}
	setSteer(v) {
		this.injectedSteer = v;
	}
	sample(cssW, cssH) {
		const has = (c) => this.injected ? this.injected.includes(c) : this.keys.has(c);
		let moveX = 0;
		let moveY = 0;
		if (has("KeyA") || has("ArrowLeft")) moveX -= 1;
		if (has("KeyD") || has("ArrowRight")) moveX += 1;
		if (has("KeyW") || has("ArrowUp")) moveY -= 1;
		if (has("KeyS") || has("ArrowDown")) moveY += 1;
		if (this.injectedSteer != null) moveX -= this.injectedSteer;
		moveX += this.stick.x;
		moveY += this.stick.y;
		const pads = typeof navigator !== "undefined" ? navigator.getGamepads?.() ?? [] : [];
		for (const pad of pads) {
			if (!pad) continue;
			const ls = radial(pad.axes[0] ?? 0, pad.axes[1] ?? 0);
			moveX += ls.x;
			moveY += ls.y;
			const rs = radial(pad.axes[2] ?? 0, pad.axes[3] ?? 0, .28);
			if (Math.hypot(rs.x, rs.y) > 0) {
				this.pointerX = Math.min(cssW, Math.max(0, this.pointerX + rs.x * 18));
				this.pointerY = Math.min(cssH, Math.max(0, this.pointerY + rs.y * 18));
				this.fireHeld = true;
			}
			if (pad.buttons[0]?.pressed || (pad.buttons[7]?.value ?? 0) > .4) this.fireHeld = true;
			if (pad.buttons[9]?.pressed) this.pauseQueued = true;
		}
		const len = Math.hypot(moveX, moveY);
		if (len > 1) {
			moveX /= len;
			moveY /= len;
		}
		const fire = this.fireHeld || has("Space");
		const pause = this.pauseQueued;
		this.pauseQueued = false;
		return {
			moveX,
			moveY,
			fire,
			pause
		};
	}
};
var GameAudio = class {
	ctx = null;
	bus = null;
	muted = false;
	unlocked = false;
	drone = null;
	noise = null;
	unlock() {
		if (!this.ctx) {
			const Ctx = window.AudioContext || window.webkitAudioContext;
			this.ctx = new Ctx({ latencyHint: "interactive" });
			const master = this.ctx.createGain();
			const sfx = this.ctx.createGain();
			const music = this.ctx.createGain();
			sfx.gain.value = .7;
			music.gain.value = .18;
			sfx.connect(master);
			music.connect(master);
			master.connect(this.ctx.destination);
			this.bus = {
				master,
				sfx,
				music
			};
			this.noise = this.makeNoise();
		}
		if (this.ctx.state === "suspended") this.ctx.resume();
		this.unlocked = true;
		this.applyMute();
		this.ensureDrone();
	}
	setMuted(v) {
		this.muted = v;
		this.applyMute();
	}
	applyMute() {
		if (!this.bus || !this.ctx) return;
		this.bus.master.gain.setTargetAtTime(this.muted ? 0 : 1, this.ctx.currentTime, .03);
	}
	resume() {
		if (this.ctx?.state === "suspended") this.ctx.resume();
	}
	makeNoise() {
		if (!this.ctx) return null;
		const len = this.ctx.sampleRate * .4;
		const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
		const data = buf.getChannelData(0);
		for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
		return buf;
	}
	ensureDrone() {
		if (!this.ctx || !this.bus || this.drone) return;
		const o1 = this.ctx.createOscillator();
		const o2 = this.ctx.createOscillator();
		const g = this.ctx.createGain();
		o1.type = "sine";
		o2.type = "triangle";
		o1.frequency.value = 55;
		o2.frequency.value = 82.5;
		g.gain.value = .07;
		const f = this.ctx.createBiquadFilter();
		f.type = "lowpass";
		f.frequency.value = 240;
		o1.connect(g);
		o2.connect(g);
		g.connect(f);
		f.connect(this.bus.music);
		o1.start();
		o2.start();
		this.drone = o1;
	}
	tone(freq, dur, type, gain, slide = 0) {
		if (!this.ctx || !this.bus) return;
		const t = this.ctx.currentTime;
		const o = this.ctx.createOscillator();
		const g = this.ctx.createGain();
		o.type = type;
		o.frequency.setValueAtTime(freq, t);
		if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), t + dur);
		g.gain.setValueAtTime(1e-4, t);
		g.gain.exponentialRampToValueAtTime(gain, t + .012);
		g.gain.exponentialRampToValueAtTime(1e-4, t + dur);
		o.connect(g);
		g.connect(this.bus.sfx);
		o.start(t);
		o.stop(t + dur + .02);
	}
	burst(dur, gain, hp = 400) {
		if (!this.ctx || !this.bus || !this.noise) return;
		const t = this.ctx.currentTime;
		const src = this.ctx.createBufferSource();
		src.buffer = this.noise;
		const f = this.ctx.createBiquadFilter();
		f.type = "highpass";
		f.frequency.value = hp;
		const g = this.ctx.createGain();
		g.gain.setValueAtTime(gain, t);
		g.gain.exponentialRampToValueAtTime(1e-4, t + dur);
		src.connect(f);
		f.connect(g);
		g.connect(this.bus.sfx);
		src.start(t);
		src.stop(t + dur);
	}
	shoot() {
		const jitter = 1 + (Math.random() * 2 - 1) * .08;
		this.tone(760 * jitter, .07, "square", .045, -420);
		this.burst(.04, .05, 1800);
	}
	explode(big = false) {
		this.burst(big ? .35 : .18, big ? .22 : .12, big ? 180 : 420);
		this.tone(big ? 90 : 140, .22, "sawtooth", .06, -70);
	}
	pickup() {
		this.tone(520, .08, "sine", .07, 180);
		this.tone(780, .12, "triangle", .05, 220);
	}
	hit() {
		this.burst(.2, .16, 200);
		this.tone(110, .18, "sawtooth", .08, -50);
	}
	ui() {
		this.tone(440, .07, "sine", .04);
	}
	wave() {
		this.tone(220, .16, "triangle", .05, 80);
		this.tone(330, .22, "sine", .04, 120);
	}
};
var Starfield = class {
	stars = [];
	streaks = [];
	nebulae = [];
	w = 1;
	h = 1;
	resize(w, h) {
		this.w = w;
		this.h = h;
		const count = Math.floor(w * h / 2800);
		this.stars = Array.from({ length: count }, () => this.makeStar());
		this.nebulae = [
			{
				x: w * .22,
				y: h * .3,
				r: Math.min(w, h) * .42,
				a: .07,
				hue: 210
			},
			{
				x: w * .78,
				y: h * .62,
				r: Math.min(w, h) * .38,
				a: .05,
				hue: 195
			},
			{
				x: w * .5,
				y: h * .12,
				r: Math.min(w, h) * .28,
				a: .04,
				hue: 230
			}
		];
	}
	makeStar() {
		const z = Math.random();
		const depth = z * z;
		return {
			x: Math.random() * this.w,
			y: Math.random() * this.h,
			z: depth,
			s: .6 + depth * 2.4,
			tw: .4 + Math.random() * .6,
			phase: Math.random() * Math.PI * 2
		};
	}
	update(dt, camVx, camVy, playing) {
		const driftX = playing ? camVx : 12;
		const driftY = playing ? camVy : 8;
		for (const star of this.stars) {
			const par = .12 + star.z * .95;
			star.x -= driftX * par * dt;
			star.y -= driftY * par * dt;
			star.phase += dt * (.6 + star.z);
			if (star.x < 0) star.x += this.w;
			if (star.x > this.w) star.x -= this.w;
			if (star.y < 0) star.y += this.h;
			if (star.y > this.h) star.y -= this.h;
		}
		for (const n of this.nebulae) {
			n.x -= driftX * .04 * dt;
			n.y -= driftY * .03 * dt;
		}
		if (Math.random() < dt * .18) {
			const fromTop = Math.random() < .5;
			this.streaks.push({
				x: fromTop ? Math.random() * this.w : this.w + 20,
				y: fromTop ? -10 : Math.random() * this.h * .6,
				vx: -220 - Math.random() * 180,
				vy: 140 + Math.random() * 120,
				life: .55 + Math.random() * .4,
				max: .9
			});
		}
		for (let i = this.streaks.length - 1; i >= 0; i--) {
			const s = this.streaks[i];
			s.x += s.vx * dt;
			s.y += s.vy * dt;
			s.life -= dt;
			if (s.life <= 0) this.streaks.splice(i, 1);
		}
	}
	draw(ctx, reduced) {
		const { w, h } = this;
		ctx.fillStyle = "#07080c";
		ctx.fillRect(0, 0, w, h);
		for (const n of this.nebulae) {
			const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r);
			g.addColorStop(0, `hsla(${n.hue}, 18%, 42%, ${n.a})`);
			g.addColorStop(1, "hsla(210, 10%, 8%, 0)");
			ctx.fillStyle = g;
			ctx.beginPath();
			ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
			ctx.fill();
		}
		for (const star of this.stars) {
			const tw = reduced ? 1 : .55 + .45 * Math.sin(star.phase * star.tw);
			ctx.fillStyle = `rgba(232, 236, 244, ${(.25 + star.z * .75) * tw})`;
			const s = star.s;
			ctx.fillRect(star.x, star.y, s, s);
		}
		ctx.strokeStyle = "rgba(200, 214, 230, 0.55)";
		ctx.lineWidth = 1.2;
		for (const s of this.streaks) {
			ctx.globalAlpha = s.life / s.max * .8;
			ctx.beginPath();
			ctx.moveTo(s.x, s.y);
			ctx.lineTo(s.x - s.vx * .08, s.y - s.vy * .08);
			ctx.stroke();
		}
		ctx.globalAlpha = 1;
	}
};
function load(src) {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.crossOrigin = "anonymous";
		img.onload = () => resolve(img);
		img.onerror = () => reject(/* @__PURE__ */ new Error(`sprite ${src}`));
		img.src = src;
	});
}
async function optional(src) {
	try {
		return await load(src);
	} catch {
		return null;
	}
}
async function loadSprites() {
	const [player, scout, fighter, heavy, shotPlayer, shotEnemy, ...rest] = await Promise.all([
		optional(SPRITE.player),
		optional(SPRITE.scout),
		optional(SPRITE.fighter),
		optional(SPRITE.heavy),
		optional(SPRITE.shotPlayer),
		optional(SPRITE.shotEnemy),
		...SPRITE.explode.map(optional),
		...SPRITE.muzzle.map(optional),
		optional(SPRITE.pickup.spread),
		optional(SPRITE.pickup.shield),
		optional(SPRITE.pickup.speed),
		optional(SPRITE.pickup.star)
	]);
	const explode = rest.slice(0, 4);
	const muzzle = rest.slice(4, 8);
	const pick = rest.slice(8, 12);
	return {
		player,
		scout,
		fighter,
		heavy,
		shotPlayer,
		shotEnemy,
		explode,
		muzzle,
		pickup: {
			spread: pick[0] ?? null,
			shield: pick[1] ?? null,
			speed: pick[2] ?? null,
			star: pick[3] ?? null
		}
	};
}
var KEY = "falak-save";
var SAVE_VERSION = 1;
var MAX_SCORES = 10;
var defaults = {
	version: SAVE_VERSION,
	scores: [],
	settings: {
		muted: false,
		shake: true,
		followPointer: true
	}
};
function migrate(raw) {
	const s = {
		...defaults,
		...raw,
		settings: {
			...defaults.settings,
			...raw.settings
		}
	};
	s.version = SAVE_VERSION;
	s.scores = Array.isArray(raw.scores) ? raw.scores.filter((e) => e && typeof e.name === "string" && typeof e.score === "number" && typeof e.wave === "number").slice(0, MAX_SCORES) : [];
	return s;
}
function read() {
	try {
		const raw = localStorage.getItem(KEY);
		if (!raw) return {
			...defaults,
			settings: { ...defaults.settings }
		};
		return migrate(JSON.parse(raw));
	} catch {
		return {
			...defaults,
			settings: { ...defaults.settings }
		};
	}
}
function write(save) {
	try {
		localStorage.setItem(KEY, JSON.stringify(save));
	} catch {}
}
function loadSettings() {
	return { ...read().settings };
}
function saveSettings(settings) {
	write({
		...read(),
		settings
	});
}
function loadScores() {
	return read().scores;
}
function qualifies(score) {
	const scores = loadScores();
	if (score <= 0) return false;
	if (scores.length < MAX_SCORES) return true;
	return score > (scores[scores.length - 1]?.score ?? 0);
}
function addScore(entry) {
	const cur = read();
	const scores = [...cur.scores, entry].sort((a, b) => b.score - a.score || b.wave - a.wave).slice(0, MAX_SCORES);
	write({
		...cur,
		scores
	});
	return scores;
}
var settings = typeof window !== "undefined" ? loadSettings() : {
	muted: false,
	shake: true,
	followPointer: true
};
var initialHud = {
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
	isTouch: false
};
var useGameUI = create(() => initialHud);
function clamp(v, a, b) {
	return Math.max(a, Math.min(b, v));
}
function rand(a, b) {
	return a + Math.random() * (b - a);
}
function pick(arr) {
	return arr[Math.floor(Math.random() * arr.length)];
}
function pool(n, make) {
	return Array.from({ length: n }, make);
}
function waveQueue(n) {
	const scouts = 4 + n * 2;
	const fighters = Math.max(0, n);
	const heavies = n >= 3 ? Math.floor((n - 1) / 2) : 0;
	const wait = Math.max(.2, .82 - n * .045);
	const q = [];
	for (let i = 0; i < scouts; i++) q.push({
		kind: "scout",
		wait
	});
	for (let i = 0; i < fighters; i++) q.push({
		kind: "fighter",
		wait: wait * 1.15
	});
	for (let i = 0; i < heavies; i++) q.push({
		kind: "heavy",
		wait: wait * 1.4
	});
	for (let i = q.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		const tmp = q[i];
		q[i] = q[j];
		q[j] = tmp;
	}
	return q;
}
var FalakGame = class {
	canvas;
	ctx;
	w = 800;
	h = 600;
	dpr = 1;
	input;
	audio = new GameAudio();
	stars = new Starfield();
	sprites = null;
	mode = "menu";
	acc = 0;
	lastT = 0;
	raf = 0;
	reduced = false;
	settings;
	isTouch = false;
	player = {
		x: 0,
		y: 0,
		vx: 0,
		vy: 0,
		ang: -Math.PI / 2,
		r: 16,
		lives: 3,
		shield: 0,
		maxShield: 0,
		shieldCd: 0,
		spread: 1,
		speedLevel: 0,
		fireCd: 0,
		invuln: 0
	};
	score = 0;
	wave = 0;
	combo = 0;
	comboT = 0;
	banner = "";
	bannerT = 0;
	trauma = 0;
	hitstop = 0;
	spawnQ = [];
	spawnT = 0;
	restT = 0;
	lastScore = 0;
	upgradeChoices = [];
	waveOpen = false;
	lastHud = "";
	bullets;
	enemies;
	pickups;
	particles;
	flashes;
	booms;
	floaters;
	constructor(canvas) {
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
			active: false,
			x: 0,
			y: 0,
			vx: 0,
			vy: 0,
			r: 4,
			life: 0,
			friendly: true,
			dmg: 1
		}));
		this.enemies = pool(80, () => ({
			active: false,
			kind: "scout",
			x: 0,
			y: 0,
			vx: 0,
			vy: 0,
			r: 12,
			hp: 1,
			maxHp: 1,
			speed: 100,
			fire: 0,
			fireCd: 0,
			spread: 0,
			flash: 0,
			score: 100
		}));
		this.pickups = pool(16, () => ({
			active: false,
			kind: "star",
			x: 0,
			y: 0,
			life: 0,
			bob: 0
		}));
		this.particles = pool(420, () => ({
			active: false,
			x: 0,
			y: 0,
			vx: 0,
			vy: 0,
			life: 0,
			max: 1,
			size: 2,
			r: 255,
			g: 255,
			b: 255
		}));
		this.flashes = pool(20, () => ({
			active: false,
			x: 0,
			y: 0,
			ang: 0,
			t: 0
		}));
		this.booms = pool(24, () => ({
			active: false,
			x: 0,
			y: 0,
			t: 0,
			scale: 1
		}));
		this.floaters = pool(24, () => ({
			active: false,
			x: 0,
			y: 0,
			text: "",
			t: 0
		}));
		this.resize();
		this.resetPlayer(true);
		this.publish();
		loadSprites().then((s) => {
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
		if (new URLSearchParams(location.search).has("qa")) window.__controlsTest = {
			getYaw: () => this.player.ang,
			getSpeed: () => Math.hypot(this.player.vx, this.player.vy),
			getX: () => this.player.x,
			getY: () => this.player.y,
			setKeys: (codes) => {
				this.input.setKeys(codes);
				if (this.mode === "menu") this.begin();
			},
			setSteer: (v) => this.input.setSteer(v)
		};
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
	onResize() {
		this.resize();
	}
	onPointer(e) {
		const r = this.canvas.getBoundingClientRect();
		this.input.pointerX = (e.clientX - r.left) / r.width * this.w;
		this.input.pointerY = (e.clientY - r.top) / r.height * this.h;
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
		this.player.x = clamp(this.player.x || w / 2, 28, w - 28);
		this.player.y = clamp(this.player.y || h / 2, 28, h - 28);
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
	patchSettings(partial) {
		this.settings = {
			...this.settings,
			...partial
		};
		this.audio.setMuted(this.settings.muted);
		saveSettings(this.settings);
		this.publish();
	}
	chooseUpgrade(id) {
		this.applyUpgrade(id);
		this.mode = "playing";
		this.nextWave();
		this.publish(true);
	}
	submitName(name) {
		const scores = addScore({
			name: name.trim().slice(0, 14) || "قائد",
			score: this.lastScore,
			wave: this.wave,
			at: Date.now()
		});
		useGameUI.setState({
			scores,
			mode: "scores"
		});
		this.mode = "scores";
	}
	resetRun() {
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
	resetPlayer(center) {
		this.player.x = center ? this.w / 2 : this.w / 2;
		this.player.y = center ? this.h / 2 : this.h * .62;
		this.player.vx = 0;
		this.player.vy = 0;
		this.player.ang = -Math.PI / 2;
		this.player.lives = 3;
		this.player.shield = 0;
		this.player.maxShield = 0;
		this.player.shieldCd = 0;
		this.player.spread = 1;
		this.player.speedLevel = 0;
		this.player.fireCd = 0;
		this.player.invuln = 0;
	}
	clearWorld() {
		for (const a of this.bullets) a.active = false;
		for (const a of this.enemies) a.active = false;
		for (const a of this.pickups) a.active = false;
		for (const a of this.particles) a.active = false;
		for (const a of this.flashes) a.active = false;
		for (const a of this.booms) a.active = false;
		for (const a of this.floaters) a.active = false;
		this.spawnQ = [];
	}
	nextWave() {
		this.wave += 1;
		this.spawnQ = waveQueue(this.wave);
		this.spawnT = .4;
		this.restT = 0;
		this.waveOpen = true;
		this.showBanner(copy.waveStart(this.wave));
		this.audio.wave();
	}
	showBanner(text) {
		this.banner = text;
		this.bannerT = 1.8;
	}
	applyUpgrade(id) {
		if (id === "spread") this.player.spread = Math.min(5, this.player.spread + 1);
		if (id === "shield") {
			this.player.maxShield = Math.min(3, this.player.maxShield + 1);
			this.player.shield = this.player.maxShield;
		}
		if (id === "speed") this.player.speedLevel = Math.min(3, this.player.speedLevel + 1);
		this.audio.pickup();
	}
	grab(arr) {
		for (const it of arr) if (!it.active) return it;
		return null;
	}
	emit(x, y, n, color, speed, size) {
		for (let i = 0; i < n; i++) {
			const p = this.grab(this.particles);
			if (!p) return;
			const a = Math.random() * Math.PI * 2;
			const s = rand(speed * .3, speed);
			p.active = true;
			p.x = x;
			p.y = y;
			p.vx = Math.cos(a) * s;
			p.vy = Math.sin(a) * s;
			p.life = p.max = rand(.25, .7);
			p.size = rand(size * .5, size);
			p.r = color[0];
			p.g = color[1];
			p.b = color[2];
		}
	}
	boom(x, y, scale) {
		const b = this.grab(this.booms);
		if (b) {
			b.active = true;
			b.x = x;
			b.y = y;
			b.t = 0;
			b.scale = scale;
		}
	}
	float(x, y, text) {
		const f = this.grab(this.floaters);
		if (f) {
			f.active = true;
			f.x = x;
			f.y = y;
			f.text = text;
			f.t = 0;
		}
	}
	fireBullet(x, y, ang, speed, friendly, r, dmg) {
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
	playerShoot() {
		const p = this.player;
		const n = p.spread;
		const spread = n === 1 ? 0 : .12 + (n - 2) * .04;
		const nose = p.r + 10;
		const ox = p.x + Math.cos(p.ang) * nose;
		const oy = p.y + Math.sin(p.ang) * nose;
		for (let i = 0; i < n; i++) {
			const t = n === 1 ? 0 : (i / (n - 1) - .5) * 2;
			this.fireBullet(ox, oy, p.ang + t * spread, 640, true, 4.5, 1);
		}
		const fl = this.grab(this.flashes);
		if (fl) {
			fl.active = true;
			fl.x = ox;
			fl.y = oy;
			fl.ang = p.ang;
			fl.t = 0;
		}
		this.trauma = Math.min(1, this.trauma + .08);
		this.audio.shoot();
		this.emit(ox, oy, 3, [
			180,
			220,
			255
		], 80, 2);
	}
	spawnEnemy(kind) {
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
		const hpScale = 1 + this.wave * .08;
		e.active = true;
		e.kind = kind;
		e.x = x;
		e.y = y;
		e.vx = 0;
		e.vy = 0;
		e.r = spec.r;
		e.hp = Math.ceil(spec.hp * hpScale);
		e.maxHp = e.hp;
		e.speed = spec.speed * (1 + this.wave * .02);
		e.fire = spec.fire;
		e.fireCd = rand(.4, spec.fire || 1);
		e.spread = spec.spread;
		e.flash = 0;
		e.score = spec.score;
	}
	dropPickup(x, y, kind) {
		const p = this.grab(this.pickups);
		if (!p) return;
		p.active = true;
		p.kind = kind ?? pick([
			"spread",
			"shield",
			"speed",
			"star",
			"star"
		]);
		p.x = x;
		p.y = y;
		p.life = 9;
		p.bob = Math.random() * Math.PI * 2;
	}
	killEnemy(e) {
		e.active = false;
		this.combo += 1;
		this.comboT = COMBO_WINDOW;
		const mult = 1 + Math.min(8, this.combo - 1) * .15;
		const pts = Math.round(e.score * mult);
		this.score += pts;
		this.float(e.x, e.y, `+${pts}`);
		this.boom(e.x, e.y, e.kind === "heavy" ? 1.4 : 1);
		this.emit(e.x, e.y, e.kind === "heavy" ? 22 : 12, e.kind === "scout" ? [
			232,
			140,
			90
		] : e.kind === "fighter" ? [
			220,
			90,
			80
		] : [
			200,
			70,
			60
		], 180, 3.2);
		this.audio.explode(e.kind === "heavy");
		this.trauma = Math.min(1, this.trauma + (e.kind === "heavy" ? .45 : .22));
		this.hitstop = Math.max(this.hitstop, e.kind === "heavy" ? .07 : .03);
		const chance = e.kind === "heavy" ? .42 : e.kind === "fighter" ? .2 : .1;
		if (Math.random() < chance) this.dropPickup(e.x, e.y);
	}
	hurtPlayer(fromX, fromY) {
		const p = this.player;
		if (p.invuln > 0) return;
		if (p.shield > 0) {
			p.shield -= 1;
			p.shieldCd = 5;
			p.invuln = .55;
			this.trauma = Math.min(1, this.trauma + .3);
			this.emit(p.x, p.y, 10, [
				160,
				200,
				230
			], 140, 2.5);
			this.audio.hit();
			return;
		}
		p.lives -= 1;
		p.invuln = INVULN_TIME;
		this.hitstop = .1;
		this.trauma = .85;
		this.emit(p.x, p.y, 18, [
			230,
			220,
			220
		], 200, 3);
		this.audio.hit();
		const dx = p.x - fromX;
		const dy = p.y - fromY;
		const m = Math.hypot(dx, dy) || 1;
		p.vx += dx / m * 220;
		p.vy += dy / m * 220;
		if (p.lives <= 0) this.gameOver();
	}
	gameOver() {
		this.lastScore = this.score;
		this.mode = "gameover";
		this.showBanner(copy.gameover);
		this.audio.explode(true);
		this.publish();
	}
	openUpgrades() {
		const opts = [];
		for (const id of [
			"spread",
			"shield",
			"speed"
		]) {
			if (id === "spread" && this.player.spread >= 5) continue;
			if (id === "shield" && this.player.maxShield >= 3) continue;
			if (id === "speed" && this.player.speedLevel >= 3) continue;
			opts.push(id);
		}
		if (opts.length === 0) {
			this.score += 800;
			this.float(this.player.x, this.player.y - 20, "+800");
			this.restT = .8;
			return;
		}
		this.upgradeChoices = opts;
		this.mode = "upgrade";
		this.publish();
	}
	loop(now) {
		const raw = Math.min(MAX_FRAME_DT, (now - this.lastT) / 1e3);
		this.lastT = now;
		this.acc += raw;
		const simulating = this.mode === "playing";
		if (simulating) {
			if (this.hitstop > 0) this.hitstop -= raw;
			else while (this.acc >= FIXED_DT) {
				this.step(FIXED_DT);
				this.acc -= FIXED_DT;
			}
		} else {
			this.acc = 0;
			const act = this.input.sample(this.w, this.h);
			if (this.mode === "playing" || this.mode === "paused") {}
			if (act.pause && (this.mode === "paused" || this.mode === "playing")) this.togglePause();
		}
		const camVx = simulating ? this.player.vx : 18;
		const camVy = simulating ? this.player.vy : 10;
		if (this.mode !== "paused" && this.mode !== "upgrade") this.stars.update(raw, camVx, camVy, simulating);
		if (!simulating && this.mode === "paused") {
			if (this.input.sample(this.w, this.h).pause) this.togglePause();
		}
		this.draw(raw);
		this.raf = requestAnimationFrame(this.loop);
	}
	step(dt) {
		const act = this.input.sample(this.w, this.h);
		if (act.pause) {
			this.togglePause();
			return;
		}
		const p = this.player;
		const speed = 290 * (1 + p.speedLevel * .18);
		let dx = act.moveX;
		let dy = act.moveY;
		if (!(Math.hypot(dx, dy) > .08) && this.settings.followPointer && this.input.pointerIn && !this.isTouch) {
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
		const k = 1 - Math.exp(-14 * dt);
		p.vx += (desiredX - p.vx) * k;
		p.vy += (desiredY - p.vy) * k;
		p.x += p.vx * dt;
		p.y += p.vy * dt;
		p.x = clamp(p.x, 28, this.w - 28);
		p.y = clamp(p.y, 28, this.h - 28);
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
		if (Math.hypot(p.vx, p.vy) > 40) this.emit(p.x - Math.cos(p.ang) * 12, p.y - Math.sin(p.ang) * 12, 1, [
			140,
			190,
			230
		], 30, 1.6);
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
			const next = this.spawnQ.shift();
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
			if (this.wave > 0 && this.wave % 3 === 0) this.openUpgrades();
			else this.restT = 1.55;
		}
		if (this.restT > 0 && this.mode === "playing") {
			this.restT -= dt;
			if (this.restT <= 0) this.nextWave();
		}
		this.publish();
	}
	updateEnemies(dt) {
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
					sx += dx / d * (min - d);
					sy += dy / d * (min - d);
				}
			}
			const tx = p.x - e.x;
			const ty = p.y - e.y;
			const td = Math.hypot(tx, ty) || 1;
			const seekX = tx / td;
			const seekY = ty / td;
			const sep = .55;
			let vx = seekX * e.speed + sx * sep * 40;
			let vy = seekY * e.speed + sy * sep * 40;
			const vm = Math.hypot(vx, vy) || 1;
			if (vm > e.speed) {
				vx = vx / vm * e.speed;
				vy = vy / vm * e.speed;
			}
			e.vx = vx;
			e.vy = vy;
			e.x += vx * dt;
			e.y += vy * dt;
			e.flash = Math.max(0, e.flash - dt);
			if (e.fire > 0) {
				e.fireCd -= dt;
				if (e.fireCd <= 0 && td < 520) {
					e.fireCd = e.fire * (.85 + Math.random() * .3);
					const ang = Math.atan2(ty, tx);
					const count = e.spread || 1;
					const fan = count > 1 ? .22 : 0;
					for (let i = 0; i < count; i++) {
						const t = count === 1 ? 0 : (i / (count - 1) - .5) * 2;
						this.fireBullet(e.x, e.y, ang + t * fan, 240, false, 5, 1);
					}
				}
			}
			if (p.invuln <= 0) {
				if (Math.hypot(e.x - p.x, e.y - p.y) < e.r + p.r * .85) this.hurtPlayer(e.x, e.y);
			}
		}
	}
	updateBullets(dt) {
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
			if (b.friendly) for (const e of this.enemies) {
				if (!e.active) continue;
				if (Math.hypot(e.x - b.x, e.y - b.y) < e.r + b.r) {
					b.active = false;
					e.hp -= b.dmg;
					e.flash = .08;
					this.emit(b.x, b.y, 4, [
						210,
						230,
						255
					], 90, 2);
					if (e.hp <= 0) this.killEnemy(e);
					break;
				}
			}
			else if (p.invuln <= 0) {
				if (Math.hypot(p.x - b.x, p.y - b.y) < p.r + b.r) {
					b.active = false;
					this.hurtPlayer(b.x, b.y);
				}
			}
		}
	}
	updatePickups(dt) {
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
			if (d < 150) {
				const pull = (1 - d / 150) * 220;
				u.x += dx / (d || 1) * pull * dt;
				u.y += dy / (d || 1) * pull * dt;
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
				this.emit(u.x, u.y, 10, [
					200,
					220,
					240
				], 80, 2);
			}
		}
	}
	updateFx(dt) {
		for (const p of this.particles) {
			if (!p.active) continue;
			p.x += p.vx * dt;
			p.y += p.vy * dt;
			p.vx *= .98;
			p.vy *= .98;
			p.life -= dt;
			if (p.life <= 0) p.active = false;
		}
		for (const f of this.flashes) {
			if (!f.active) continue;
			f.t += dt;
			if (f.t > .1) f.active = false;
		}
		for (const b of this.booms) {
			if (!b.active) continue;
			b.t += dt;
			if (b.t > .32) b.active = false;
		}
		for (const f of this.floaters) {
			if (!f.active) continue;
			f.t += dt;
			f.y -= 28 * dt;
			if (f.t > .7) f.active = false;
		}
	}
	publish(force = false) {
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
			this.lastScore
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
			isTouch: this.isTouch
		});
	}
	draw(dt) {
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
		const vig = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * .2, w / 2, h / 2, Math.max(w, h) * .7);
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
	}
	drawSprite(ctx, img, x, y, ang, size, fallback) {
		if (img) {
			ctx.save();
			ctx.translate(x, y);
			ctx.rotate(ang + Math.PI / 2);
			ctx.drawImage(img, -size / 2, -size / 2, size, size);
			ctx.restore();
		} else fallback();
	}
	drawPlayer(ctx) {
		const p = this.player;
		if (p.invuln > 0 && Math.floor(p.invuln * 12) % 2 === 0) return;
		if (p.shield > 0) {
			ctx.beginPath();
			ctx.arc(p.x, p.y, p.r + 10 + Math.sin(performance.now() / 180) * 1.5, 0, Math.PI * 2);
			ctx.strokeStyle = `rgba(170, 210, 230, ${.35 + p.shield * .15})`;
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
	drawEnemy(ctx, e) {
		const ang = Math.atan2(e.vy, e.vx);
		const img = e.kind === "scout" ? this.sprites?.scout ?? null : e.kind === "fighter" ? this.sprites?.fighter ?? null : this.sprites?.heavy ?? null;
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
	drawBullet(ctx, b) {
		const img = b.friendly ? this.sprites?.shotPlayer ?? null : this.sprites?.shotEnemy ?? null;
		const ang = Math.atan2(b.vy, b.vx);
		this.drawSprite(ctx, img, b.x, b.y, ang, b.friendly ? 28 : 22, () => {
			ctx.fillStyle = b.friendly ? "#b9d8ee" : "#e09070";
			ctx.beginPath();
			ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
			ctx.fill();
		});
	}
	drawPickup(ctx, u) {
		const img = this.sprites?.pickup[u.kind] ?? null;
		const y = u.y + Math.sin(u.bob) * 4;
		this.drawSprite(ctx, img, u.x, y, 0, 36, () => {
			ctx.fillStyle = "#c5d0dc";
			ctx.beginPath();
			ctx.arc(u.x, y, 10, 0, Math.PI * 2);
			ctx.fill();
		});
	}
	drawMuzzle(ctx, f) {
		const frames = this.sprites?.muzzle ?? [];
		const img = frames[Math.min(frames.length - 1, Math.floor(f.t / .1 * frames.length))] ?? null;
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
	drawBoom(ctx, b) {
		const frames = this.sprites?.explode ?? [];
		const img = frames[Math.min(frames.length - 1, Math.floor(b.t / .32 * frames.length))] ?? null;
		this.drawSprite(ctx, img, b.x, b.y, 0, 70 * b.scale, () => {
			ctx.globalCompositeOperation = "lighter";
			ctx.fillStyle = `rgba(200,220,240,${1 - b.t / .32})`;
			ctx.beginPath();
			ctx.arc(b.x, b.y, 20 * b.scale * (.4 + b.t * 3), 0, Math.PI * 2);
			ctx.fill();
			ctx.globalCompositeOperation = "source-over";
		});
	}
	drawParticles(ctx, back) {
		ctx.globalCompositeOperation = "lighter";
		for (const p of this.particles) {
			if (!p.active) continue;
			const t = p.life / p.max;
			if (back && p.size > 2.2) continue;
			if (!back && p.size <= 2.2) continue;
			ctx.fillStyle = `rgba(${p.r},${p.g},${p.b},${t * .7})`;
			ctx.fillRect(p.x, p.y, p.size, p.size);
		}
		ctx.globalCompositeOperation = "source-over";
	}
	drawFloater(ctx, f) {
		ctx.globalAlpha = 1 - f.t / .7;
		ctx.fillStyle = "#e8eef4";
		ctx.font = "600 13px 'IBM Plex Sans Arabic', sans-serif";
		ctx.textAlign = "center";
		ctx.fillText(f.text, f.x, f.y);
		ctx.globalAlpha = 1;
	}
};
function qualifiesForBoard(score) {
	return qualifies(score);
}
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 font-medium select-none transition-colors duration-200 disabled:pointer-events-none disabled:opacity-40", {
	variants: {
		variant: {
			primary: "bg-accent text-accent-fg hover:bg-fg",
			secondary: "border border-border bg-surface text-fg hover:bg-surface-2",
			ghost: "text-muted hover:bg-surface hover:text-fg"
		},
		size: {
			default: "min-h-11 rounded-md px-5 text-sm",
			lg: "min-h-12 rounded-lg px-6 text-base",
			icon: "size-11 rounded-md"
		}
	},
	defaultVariants: {
		variant: "primary",
		size: "default"
	}
});
function Button({ className, variant, size, type = "button", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type,
		className: cn(buttonVariants({
			variant,
			size
		}), className),
		...props
	});
}
function Panel({ children, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("w-full max-w-md rounded-2xl border border-border bg-surface/95 p-6", className),
		children
	});
}
function ToggleRow({ label, on, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick,
		className: "flex min-h-11 w-full items-center justify-between rounded-md border border-border bg-surface-2 px-3 text-sm text-fg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: cn("text-xs", on ? "text-fg" : "text-subtle"),
			children: on ? "تشغيل" : "إيقاف"
		})]
	});
}
function StartScreen({ game }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "absolute inset-0 z-20 flex items-center justify-center bg-bg/55 p-4 pt-[max(1rem,env(safe-area-inset-top))]",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
			className: "flex flex-col gap-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs tracking-[0.28em] text-muted",
							children: copy.latin
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "mt-2 text-4xl font-semibold tracking-tight text-fg",
							children: copy.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm leading-relaxed text-muted",
							children: copy.tagline
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "grid gap-3 text-sm",
					children: [
						[copy.howMove, copy.howMoveHint],
						[copy.howAim, copy.howAimHint],
						[copy.howFire, copy.howFireHint],
						[copy.howPause, copy.howPauseHint]
					].map(([k, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-baseline justify-between gap-4 border-b border-border pb-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-fg",
							children: k
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-end text-muted",
							children: v
						})]
					}, k))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "lg",
						className: "w-full",
						onClick: () => game?.begin(),
						children: copy.start
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						className: "w-full",
						onClick: () => game?.showScores(),
						children: copy.scores
					})]
				})
			]
		})
	});
}
function PauseScreen({ game }) {
	const settings = useGameUI((s) => s.settings);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "absolute inset-0 z-20 flex items-center justify-center bg-bg/60 p-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
			className: "flex flex-col gap-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-center text-xl font-semibold",
					children: copy.pause
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "lg",
					onClick: () => game?.resume(),
					children: copy.resume
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "secondary",
					onClick: () => game?.begin(),
					children: copy.restart
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToggleRow, {
							label: copy.muted,
							on: settings.muted,
							onClick: () => game?.patchSettings({ muted: !settings.muted })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToggleRow, {
							label: copy.shake,
							on: settings.shake,
							onClick: () => game?.patchSettings({ shake: !settings.shake })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToggleRow, {
							label: copy.follow,
							on: settings.followPointer,
							onClick: () => game?.patchSettings({ followPointer: !settings.followPointer })
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					onClick: () => game?.toMenu(),
					children: copy.menu
				})
			]
		})
	});
}
function UpgradeScreen({ game }) {
	const choices = useGameUI((s) => s.upgradeChoices);
	const meta = {
		spread: {
			title: copy.spread,
			hint: copy.spreadHint,
			icon: Layers
		},
		shield: {
			title: copy.shield,
			hint: copy.shieldHint,
			icon: Shield
		},
		speed: {
			title: copy.speed,
			hint: copy.speedHint,
			icon: Gauge
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "absolute inset-0 z-20 flex items-center justify-center bg-bg/55 p-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
			className: "max-w-lg",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mb-4 text-center text-xl font-semibold",
				children: copy.upgradeTitle
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-3 sm:grid-cols-3",
				children: choices.map((id) => {
					const Item = meta[id];
					const Icon = Item.icon;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => game?.chooseUpgrade(id),
						className: "flex min-h-28 flex-col items-start gap-2 rounded-lg border border-border bg-surface-2 p-4 text-start hover:border-accent",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
								className: "size-5 text-accent",
								strokeWidth: 1.6
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-sm font-medium text-fg",
								children: Item.title
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs leading-snug text-muted",
								children: Item.hint
							})
						]
					}, id);
				})
			})]
		})
	});
}
function GameOverScreen({ game }) {
	const last = useGameUI((s) => s.lastScore);
	const wave = useGameUI((s) => s.wave);
	const [name, setName] = (0, import_react.useState)("");
	const canSave = qualifiesForBoard(last);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "absolute inset-0 z-20 flex items-center justify-center bg-bg/65 p-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
			className: "flex flex-col gap-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-xl font-semibold",
					children: copy.gameover
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-3 font-medium tabular-nums text-fg",
					children: [
						last.toLocaleString("en-US"),
						" · ",
						copy.wave,
						" ",
						wave
					]
				})]
			}), canSave ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "flex flex-col gap-3",
				onSubmit: (e) => {
					e.preventDefault();
					game?.submitName(name);
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						className: "text-sm text-muted",
						htmlFor: "pilot-name",
						children: copy.enterName
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						id: "pilot-name",
						value: name,
						onChange: (e) => setName(e.target.value),
						maxLength: 14,
						autoComplete: "off",
						className: "min-h-11 rounded-md border border-border bg-surface-2 px-3 text-fg outline-none focus:border-accent"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						size: "lg",
						children: copy.saveScore
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						onClick: () => game?.showScores(),
						children: copy.skipSave
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "lg",
						onClick: () => game?.begin(),
						children: copy.restart
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						onClick: () => game?.showScores(),
						children: copy.scores
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						onClick: () => game?.toMenu(),
						children: copy.menu
					})
				]
			})]
		})
	});
}
function ScoresScreen({ game }) {
	const scores = useGameUI((s) => s.scores);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "absolute inset-0 z-20 flex items-center justify-center bg-bg/65 p-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mb-4 text-center text-xl font-semibold",
				children: copy.scores
			}),
			scores.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-center text-sm text-muted",
				children: copy.emptyScores
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
				className: "grid gap-2",
				children: scores.map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center justify-between rounded-md bg-surface-2 px-3 py-2 text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted",
							children: i + 1
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "flex-1 px-3 text-fg",
							children: s.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "tabular-nums text-fg",
							children: s.score.toLocaleString("en-US")
						})
					]
				}, `${s.at}-${s.name}`))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-5 flex flex-col gap-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: () => game?.toMenu(),
					children: copy.back
				})
			})
		] })
	});
}
function Hud({ game }) {
	const mode = useGameUI((s) => s.mode);
	const score = useGameUI((s) => s.score);
	const wave = useGameUI((s) => s.wave);
	const lives = useGameUI((s) => s.lives);
	const shield = useGameUI((s) => s.shield);
	const maxShield = useGameUI((s) => s.maxShield);
	const spread = useGameUI((s) => s.spread);
	const speedLevel = useGameUI((s) => s.speedLevel);
	const combo = useGameUI((s) => s.combo);
	const banner = useGameUI((s) => s.banner);
	const muted = useGameUI((s) => s.settings.muted);
	if (mode === "menu" || mode === "scores") return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pointer-events-none absolute inset-0 z-10 p-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:p-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-start justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-lg border border-border bg-surface/80 px-3 py-2 text-xs text-muted",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: copy.score,
							value: score.toLocaleString("en-US")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: copy.wave,
							value: String(wave)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: copy.lives,
							value: String(lives)
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-2 flex gap-3 text-[11px]",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
							copy.spread,
							" ",
							spread
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
							copy.shield,
							" ",
							shield,
							"/",
							maxShield
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
							copy.speed,
							" ",
							speedLevel
						] }),
						combo > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-fg",
							children: [
								copy.combo,
								" ×",
								combo
							]
						}) : null
					]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "pointer-events-auto flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "secondary",
					size: "icon",
					"aria-label": copy.muted,
					onClick: () => game?.patchSettings({ muted: !muted }),
					children: muted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "size-4" })
				}), mode === "playing" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "secondary",
					size: "icon",
					"aria-label": copy.pause,
					onClick: () => game?.togglePause(),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-4" })
				}) : null]
			})]
		}), banner ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "pointer-events-none mt-8 text-center text-lg font-medium tracking-tight text-fg",
			children: banner
		}) : null]
	});
}
function Stat({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "text-[10px] uppercase tracking-wide",
		children: label
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "font-medium tabular-nums text-fg",
		children: value
	})] });
}
function TouchControls({ game }) {
	const mode = useGameUI((s) => s.mode);
	if (!useGameUI((s) => s.isTouch) || mode !== "playing" || !game) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pointer-events-none absolute inset-0 z-10",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "pointer-events-auto absolute bottom-[max(1.5rem,env(safe-area-inset-bottom))] start-4 size-32 rounded-full border border-border bg-surface/40",
			onPointerDown: (e) => {
				e.currentTarget.setPointerCapture(e.pointerId);
				steer(e, game);
			},
			onPointerMove: (e) => {
				if (e.currentTarget.hasPointerCapture(e.pointerId)) steer(e, game);
			},
			onPointerUp: () => {
				game.input.stick.x = 0;
				game.input.stick.y = 0;
			},
			onPointerCancel: () => {
				game.input.stick.x = 0;
				game.input.stick.y = 0;
			}
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			"aria-label": copy.howFire,
			className: "pointer-events-auto absolute bottom-[max(1.5rem,env(safe-area-inset-bottom))] end-4 size-20 rounded-full border border-border bg-surface/70 text-muted",
			onPointerDown: (e) => {
				e.preventDefault();
				game.input.fireHeld = true;
			},
			onPointerUp: () => {
				game.input.fireHeld = false;
			},
			onPointerCancel: () => {
				game.input.fireHeld = false;
			},
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MousePointer2, { className: "mx-auto size-5" })
		})]
	});
}
function steer(e, game) {
	const r = e.currentTarget.getBoundingClientRect();
	const x = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
	const y = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
	const m = Math.hypot(x, y);
	const s = m < .12 ? 0 : Math.min(1, m);
	game.input.stick.x = m === 0 ? 0 : x / m * s;
	game.input.stick.y = m === 0 ? 0 : y / m * s;
}
function GameApp() {
	const canvasRef = (0, import_react.useRef)(null);
	const [game, setGame] = (0, import_react.useState)(null);
	const mode = useGameUI((s) => s.mode);
	(0, import_react.useEffect)(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const g = new FalakGame(canvas);
		setGame(g);
		return () => {
			g.destroy();
			setGame(null);
		};
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "relative h-dvh w-full overflow-hidden bg-bg text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
				ref: canvasRef,
				className: "absolute inset-0 h-full w-full touch-none",
				onContextMenu: (e) => e.preventDefault()
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hud, { game }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TouchControls, { game }),
			mode === "menu" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StartScreen, { game }) : null,
			mode === "paused" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PauseScreen, { game }) : null,
			mode === "upgrade" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UpgradeScreen, { game }) : null,
			mode === "gameover" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GameOverScreen, { game }) : null,
			mode === "scores" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScoresScreen, { game }) : null
		]
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GameApp, {});
}
//#endregion
export { Home as component };
