type Star = {
  x: number;
  y: number;
  z: number;
  s: number;
  tw: number;
  phase: number;
};

type Streak = { x: number; y: number; vx: number; vy: number; life: number; max: number };

export class Starfield {
  stars: Star[] = [];
  streaks: Streak[] = [];
  nebulae: { x: number; y: number; r: number; a: number; hue: number }[] = [];
  w = 1;
  h = 1;

  resize(w: number, h: number) {
    this.w = w;
    this.h = h;
    const count = Math.floor((w * h) / 2800);
    this.stars = Array.from({ length: count }, () => this.makeStar());
    this.nebulae = [
      { x: w * 0.22, y: h * 0.3, r: Math.min(w, h) * 0.42, a: 0.07, hue: 210 },
      { x: w * 0.78, y: h * 0.62, r: Math.min(w, h) * 0.38, a: 0.05, hue: 195 },
      { x: w * 0.5, y: h * 0.12, r: Math.min(w, h) * 0.28, a: 0.04, hue: 230 },
    ];
  }

  makeStar(): Star {
    const z = Math.random();
    const depth = z * z;
    return {
      x: Math.random() * this.w,
      y: Math.random() * this.h,
      z: depth,
      s: 0.6 + depth * 2.4,
      tw: 0.4 + Math.random() * 0.6,
      phase: Math.random() * Math.PI * 2,
    };
  }

  update(dt: number, camVx: number, camVy: number, playing: boolean) {
    const driftX = playing ? camVx : 12;
    const driftY = playing ? camVy : 8;
    for (const star of this.stars) {
      const par = 0.12 + star.z * 0.95;
      star.x -= driftX * par * dt;
      star.y -= driftY * par * dt;
      star.phase += dt * (0.6 + star.z);
      if (star.x < 0) star.x += this.w;
      if (star.x > this.w) star.x -= this.w;
      if (star.y < 0) star.y += this.h;
      if (star.y > this.h) star.y -= this.h;
    }
    for (const n of this.nebulae) {
      n.x -= driftX * 0.04 * dt;
      n.y -= driftY * 0.03 * dt;
    }
    if (Math.random() < dt * 0.18) {
      const fromTop = Math.random() < 0.5;
      this.streaks.push({
        x: fromTop ? Math.random() * this.w : this.w + 20,
        y: fromTop ? -10 : Math.random() * this.h * 0.6,
        vx: -220 - Math.random() * 180,
        vy: 140 + Math.random() * 120,
        life: 0.55 + Math.random() * 0.4,
        max: 0.9,
      });
    }
    for (let i = this.streaks.length - 1; i >= 0; i--) {
      const s = this.streaks[i]!;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.life -= dt;
      if (s.life <= 0) this.streaks.splice(i, 1);
    }
  }

  draw(ctx: CanvasRenderingContext2D, reduced: boolean) {
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
      const tw = reduced ? 1 : 0.55 + 0.45 * Math.sin(star.phase * star.tw);
      const a = (0.25 + star.z * 0.75) * tw;
      ctx.fillStyle = `rgba(232, 236, 244, ${a})`;
      const s = star.s;
      ctx.fillRect(star.x, star.y, s, s);
    }

    ctx.strokeStyle = "rgba(200, 214, 230, 0.55)";
    ctx.lineWidth = 1.2;
    for (const s of this.streaks) {
      const t = s.life / s.max;
      ctx.globalAlpha = t * 0.8;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x - s.vx * 0.08, s.y - s.vy * 0.08);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
}
