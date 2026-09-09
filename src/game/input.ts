const GAME_CODES = new Set([
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
  "KeyM",
]);

function radial(x: number, y: number, dz = 0.18) {
  const m = Math.hypot(x, y);
  if (m < dz) return { x: 0, y: 0 };
  const scale = (m - dz) / (1 - dz) / m;
  return { x: x * scale, y: y * scale };
}

export class Input {
  keys = new Set<string>();
  injected: string[] | null = null;
  injectedSteer: number | null = null;
  pointerX = 0;
  pointerY = 0;
  pointerIn = false;
  pointerDown = false;
  fireHeld = false;
  pauseQueued = false;
  canvas: HTMLCanvasElement;
  stickId: number | null = null;
  stickOrigin = { x: 0, y: 0 };
  stick = { x: 0, y: 0 };
  fireId: number | null = null;
  onUnlock?: () => void;

  constructor(canvas: HTMLCanvasElement) {
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

  private onKeyDown(e: KeyboardEvent) {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
    this.onUnlock?.();
    if (GAME_CODES.has(e.code)) e.preventDefault();
    this.keys.add(e.code);
    if (e.code === "Escape" || e.code === "KeyP") this.pauseQueued = true;
  }

  private onKeyUp(e: KeyboardEvent) {
    this.keys.delete(e.code);
  }

  private onBlur() {
    this.keys.clear();
    this.pointerDown = false;
    this.fireHeld = false;
    this.stickId = null;
    this.fireId = null;
    this.stick.x = 0;
    this.stick.y = 0;
  }

  private canvasPoint(e: PointerEvent) {
    const r = this.canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) / r.width) * this.canvas.width * (r.width ? this.canvas.clientWidth / (this.canvas.width || 1) : 1),
      y: ((e.clientY - r.top) / r.height) * this.canvas.height * (r.height ? this.canvas.clientHeight / (this.canvas.height || 1) : 1),
    };
  }

  logicalPoint(e: PointerEvent, cssW: number, cssH: number) {
    const r = this.canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) / r.width) * cssW,
      y: ((e.clientY - r.top) / r.height) * cssH,
    };
  }

  setLogicalPointer(e: PointerEvent, cssW: number, cssH: number) {
    const p = this.logicalPoint(e, cssW, cssH);
    this.pointerX = p.x;
    this.pointerY = p.y;
    this.pointerIn = true;
  }

  private onPointerDown(e: PointerEvent) {
    this.onUnlock?.();
    this.pointerIn = true;
    if (e.pointerType === "touch") {
      const r = this.canvas.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width;
      if (nx < 0.48 && this.stickId === null) {
        this.stickId = e.pointerId;
        this.stickOrigin = { x: e.clientX, y: e.clientY };
        this.stick = { x: 0, y: 0 };
        try {
          this.canvas.setPointerCapture(e.pointerId);
        } catch {
          /* ignore */
        }
      } else if (this.fireId === null) {
        this.fireId = e.pointerId;
        this.fireHeld = true;
      }
    } else {
      this.pointerDown = true;
      this.fireHeld = e.button === 0;
    }
  }

  private onPointerMove(e: PointerEvent) {
    if (e.pointerType === "touch" && e.pointerId === this.stickId) {
      const dx = e.clientX - this.stickOrigin.x;
      const dy = e.clientY - this.stickOrigin.y;
      const v = radial(dx / 56, dy / 56, 0.12);
      const m = Math.hypot(v.x, v.y);
      if (m > 1) {
        this.stick.x = v.x / m;
        this.stick.y = v.y / m;
      } else {
        this.stick = v;
      }
    }
  }

  private onPointerUp(e: PointerEvent) {
    if (e.pointerId === this.stickId) {
      this.stickId = null;
      this.stick = { x: 0, y: 0 };
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

  setKeys(codes: string[]) {
    this.injected = codes;
  }

  setSteer(v: number) {
    this.injectedSteer = v;
  }

  sample(cssW: number, cssH: number) {
    const has = (c: string) =>
      this.injected ? this.injected.includes(c) : this.keys.has(c);

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
      const rs = radial(pad.axes[2] ?? 0, pad.axes[3] ?? 0, 0.28);
      if (Math.hypot(rs.x, rs.y) > 0) {
        this.pointerX = Math.min(cssW, Math.max(0, this.pointerX + rs.x * 18));
        this.pointerY = Math.min(cssH, Math.max(0, this.pointerY + rs.y * 18));
        this.fireHeld = true;
      }
      if (pad.buttons[0]?.pressed || (pad.buttons[7]?.value ?? 0) > 0.4) this.fireHeld = true;
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

    return { moveX, moveY, fire, pause };
  }
}
