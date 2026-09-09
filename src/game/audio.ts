type Bus = { master: GainNode; sfx: GainNode; music: GainNode };

export class GameAudio {
  ctx: AudioContext | null = null;
  bus: Bus | null = null;
  muted = false;
  unlocked = false;
  drone: OscillatorNode | null = null;
  noise: AudioBuffer | null = null;

  unlock() {
    if (!this.ctx) {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new Ctx({ latencyHint: "interactive" });
      const master = this.ctx.createGain();
      const sfx = this.ctx.createGain();
      const music = this.ctx.createGain();
      sfx.gain.value = 0.7;
      music.gain.value = 0.18;
      sfx.connect(master);
      music.connect(master);
      master.connect(this.ctx.destination);
      this.bus = { master, sfx, music };
      this.noise = this.makeNoise();
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
    this.unlocked = true;
    this.applyMute();
    this.ensureDrone();
  }

  setMuted(v: boolean) {
    this.muted = v;
    this.applyMute();
  }

  applyMute() {
    if (!this.bus || !this.ctx) return;
    this.bus.master.gain.setTargetAtTime(this.muted ? 0 : 1, this.ctx.currentTime, 0.03);
  }

  resume() {
    if (this.ctx?.state === "suspended") void this.ctx.resume();
  }

  private makeNoise(): AudioBuffer | null {
    if (!this.ctx) return null;
    const len = this.ctx.sampleRate * 0.4;
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    return buf;
  }

  private ensureDrone() {
    if (!this.ctx || !this.bus || this.drone) return;
    const o1 = this.ctx.createOscillator();
    const o2 = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o1.type = "sine";
    o2.type = "triangle";
    o1.frequency.value = 55;
    o2.frequency.value = 82.5;
    g.gain.value = 0.07;
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

  private tone(freq: number, dur: number, type: OscillatorType, gain: number, slide = 0) {
    if (!this.ctx || !this.bus) return;
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    g.connect(this.bus.sfx);
    o.start(t);
    o.stop(t + dur + 0.02);
  }

  private burst(dur: number, gain: number, hp = 400) {
    if (!this.ctx || !this.bus || !this.noise) return;
    const t = this.ctx.currentTime;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noise;
    const f = this.ctx.createBiquadFilter();
    f.type = "highpass";
    f.frequency.value = hp;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f);
    f.connect(g);
    g.connect(this.bus.sfx);
    src.start(t);
    src.stop(t + dur);
  }

  shoot() {
    const jitter = 1 + (Math.random() * 2 - 1) * 0.08;
    this.tone(760 * jitter, 0.07, "square", 0.045, -420);
    this.burst(0.04, 0.05, 1800);
  }

  explode(big = false) {
    this.burst(big ? 0.35 : 0.18, big ? 0.22 : 0.12, big ? 180 : 420);
    this.tone(big ? 90 : 140, 0.22, "sawtooth", 0.06, -70);
  }

  pickup() {
    this.tone(520, 0.08, "sine", 0.07, 180);
    this.tone(780, 0.12, "triangle", 0.05, 220);
  }

  hit() {
    this.burst(0.2, 0.16, 200);
    this.tone(110, 0.18, "sawtooth", 0.08, -50);
  }

  ui() {
    this.tone(440, 0.07, "sine", 0.04);
  }

  wave() {
    this.tone(220, 0.16, "triangle", 0.05, 80);
    this.tone(330, 0.22, "sine", 0.04, 120);
  }
}
