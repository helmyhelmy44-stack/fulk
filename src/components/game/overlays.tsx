import { useState, type PointerEvent, type ReactNode } from "react";
import {
  Gauge,
  Layers,
  Pause,
  Shield,
  Volume2,
  VolumeX,
  MousePointer2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { copy } from "@/game/copy";
import { useGameUI } from "@/game/store";
import { qualifiesForBoard, type FalakGame } from "@/game/game";
import type { UpgradeId } from "@/game/types";
import { cn } from "@/lib/utils";

function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "w-full max-w-md rounded-2xl border border-border bg-surface/95 p-6",
        className,
      )}
    >
      {children}
    </div>
  );
}

function ToggleRow({
  label,
  on,
  onClick,
}: {
  label: string;
  on: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-11 w-full items-center justify-between rounded-md border border-border bg-surface-2 px-3 text-sm text-fg"
    >
      <span>{label}</span>
      <span className={cn("text-xs", on ? "text-fg" : "text-subtle")}>{on ? "تشغيل" : "إيقاف"}</span>
    </button>
  );
}

export function StartScreen({ game }: { game: FalakGame | null }) {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-bg/55 p-4 pt-[max(1rem,env(safe-area-inset-top))]">
      <Panel className="flex flex-col gap-6">
        <header className="text-center">
          <p className="text-xs tracking-[0.28em] text-muted">{copy.latin}</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-fg">{copy.title}</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted">{copy.tagline}</p>
        </header>
        <ul className="grid gap-3 text-sm">
          {[
            [copy.howMove, copy.howMoveHint],
            [copy.howAim, copy.howAimHint],
            [copy.howFire, copy.howFireHint],
            [copy.howPause, copy.howPauseHint],
          ].map(([k, v]) => (
            <li key={k} className="flex items-baseline justify-between gap-4 border-b border-border pb-2">
              <span className="text-fg">{k}</span>
              <span className="text-end text-muted">{v}</span>
            </li>
          ))}
        </ul>
        <div className="flex flex-col gap-3">
          <Button size="lg" className="w-full" onClick={() => game?.begin()}>
            {copy.start}
          </Button>
          <Button variant="secondary" className="w-full" onClick={() => game?.showScores()}>
            {copy.scores}
          </Button>
        </div>
      </Panel>
    </div>
  );
}

export function PauseScreen({ game }: { game: FalakGame | null }) {
  const settings = useGameUI((s) => s.settings);
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-bg/60 p-4">
      <Panel className="flex flex-col gap-4">
        <h2 className="text-center text-xl font-semibold">{copy.pause}</h2>
        <Button size="lg" onClick={() => game?.resume()}>
          {copy.resume}
        </Button>
        <Button variant="secondary" onClick={() => game?.begin()}>
          {copy.restart}
        </Button>
        <div className="grid gap-2">
          <ToggleRow
            label={copy.muted}
            on={settings.muted}
            onClick={() => game?.patchSettings({ muted: !settings.muted })}
          />
          <ToggleRow
            label={copy.shake}
            on={settings.shake}
            onClick={() => game?.patchSettings({ shake: !settings.shake })}
          />
          <ToggleRow
            label={copy.follow}
            on={settings.followPointer}
            onClick={() => game?.patchSettings({ followPointer: !settings.followPointer })}
          />
        </div>
        <Button variant="ghost" onClick={() => game?.toMenu()}>
          {copy.menu}
        </Button>
      </Panel>
    </div>
  );
}

export function UpgradeScreen({ game }: { game: FalakGame | null }) {
  const choices = useGameUI((s) => s.upgradeChoices);
  const meta: Record<UpgradeId, { title: string; hint: string; icon: typeof Shield }> = {
    spread: { title: copy.spread, hint: copy.spreadHint, icon: Layers },
    shield: { title: copy.shield, hint: copy.shieldHint, icon: Shield },
    speed: { title: copy.speed, hint: copy.speedHint, icon: Gauge },
  };
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-bg/55 p-4">
      <Panel className="max-w-lg">
        <h2 className="mb-4 text-center text-xl font-semibold">{copy.upgradeTitle}</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {choices.map((id) => {
            const Item = meta[id];
            const Icon = Item.icon;
            return (
              <button
                key={id}
                type="button"
                onClick={() => game?.chooseUpgrade(id)}
                className="flex min-h-28 flex-col items-start gap-2 rounded-lg border border-border bg-surface-2 p-4 text-start hover:border-accent"
              >
                <Icon className="size-5 text-accent" strokeWidth={1.6} />
                <span className="text-sm font-medium text-fg">{Item.title}</span>
                <span className="text-xs leading-snug text-muted">{Item.hint}</span>
              </button>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}

export function GameOverScreen({ game }: { game: FalakGame | null }) {
  const last = useGameUI((s) => s.lastScore);
  const wave = useGameUI((s) => s.wave);
  const [name, setName] = useState("");
  const canSave = qualifiesForBoard(last);
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-bg/65 p-4">
      <Panel className="flex flex-col gap-5">
        <div className="text-center">
          <h2 className="text-xl font-semibold">{copy.gameover}</h2>
          <p className="mt-3 font-medium tabular-nums text-fg">
            {last.toLocaleString("en-US")} · {copy.wave} {wave}
          </p>
        </div>
        {canSave ? (
          <form
            className="flex flex-col gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              game?.submitName(name);
            }}
          >
            <label className="text-sm text-muted" htmlFor="pilot-name">
              {copy.enterName}
            </label>
            <input
              id="pilot-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={14}
              autoComplete="off"
              className="min-h-11 rounded-md border border-border bg-surface-2 px-3 text-fg outline-none focus:border-accent"
            />
            <Button type="submit" size="lg">
              {copy.saveScore}
            </Button>
            <Button variant="ghost" onClick={() => game?.showScores()}>
              {copy.skipSave}
            </Button>
          </form>
        ) : (
          <div className="flex flex-col gap-3">
            <Button size="lg" onClick={() => game?.begin()}>
              {copy.restart}
            </Button>
            <Button variant="secondary" onClick={() => game?.showScores()}>
              {copy.scores}
            </Button>
            <Button variant="ghost" onClick={() => game?.toMenu()}>
              {copy.menu}
            </Button>
          </div>
        )}
      </Panel>
    </div>
  );
}

export function ScoresScreen({ game }: { game: FalakGame | null }) {
  const scores = useGameUI((s) => s.scores);
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-bg/65 p-4">
      <Panel>
        <h2 className="mb-4 text-center text-xl font-semibold">{copy.scores}</h2>
        {scores.length === 0 ? (
          <p className="text-center text-sm text-muted">{copy.emptyScores}</p>
        ) : (
          <ol className="grid gap-2">
            {scores.map((s, i) => (
              <li
                key={`${s.at}-${s.name}`}
                className="flex items-center justify-between rounded-md bg-surface-2 px-3 py-2 text-sm"
              >
                <span className="text-muted">{i + 1}</span>
                <span className="flex-1 px-3 text-fg">{s.name}</span>
                <span className="tabular-nums text-fg">{s.score.toLocaleString("en-US")}</span>
              </li>
            ))}
          </ol>
        )}
        <div className="mt-5 flex flex-col gap-2">
          <Button onClick={() => game?.toMenu()}>{copy.back}</Button>
        </div>
      </Panel>
    </div>
  );
}

export function Hud({ game }: { game: FalakGame | null }) {
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
  return (
    <div className="pointer-events-none absolute inset-0 z-10 p-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="rounded-lg border border-border bg-surface/80 px-3 py-2 text-xs text-muted">
          <div className="flex gap-4">
            <Stat label={copy.score} value={score.toLocaleString("en-US")} />
            <Stat label={copy.wave} value={String(wave)} />
            <Stat label={copy.lives} value={String(lives)} />
          </div>
          <div className="mt-2 flex gap-3 text-[11px]">
            <span>
              {copy.spread} {spread}
            </span>
            <span>
              {copy.shield} {shield}/{maxShield}
            </span>
            <span>
              {copy.speed} {speedLevel}
            </span>
            {combo > 1 ? (
              <span className="text-fg">
                {copy.combo} ×{combo}
              </span>
            ) : null}
          </div>
        </div>
        <div className="pointer-events-auto flex gap-2">
          <Button
            variant="secondary"
            size="icon"
            aria-label={copy.muted}
            onClick={() => game?.patchSettings({ muted: !muted })}
          >
            {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
          </Button>
          {mode === "playing" ? (
            <Button variant="secondary" size="icon" aria-label={copy.pause} onClick={() => game?.togglePause()}>
              <Pause className="size-4" />
            </Button>
          ) : null}
        </div>
      </div>
      {banner ? (
        <div className="pointer-events-none mt-8 text-center text-lg font-medium tracking-tight text-fg">
          {banner}
        </div>
      ) : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide">{label}</div>
      <div className="font-medium tabular-nums text-fg">{value}</div>
    </div>
  );
}

export function TouchControls({ game }: { game: FalakGame | null }) {
  const mode = useGameUI((s) => s.mode);
  const isTouch = useGameUI((s) => s.isTouch);
  if (!isTouch || mode !== "playing" || !game) return null;
  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      <div
        className="pointer-events-auto absolute bottom-[max(1.5rem,env(safe-area-inset-bottom))] start-4 size-32 rounded-full border border-border bg-surface/40"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          steer(e, game);
        }}
        onPointerMove={(e) => {
          if (e.currentTarget.hasPointerCapture(e.pointerId)) steer(e, game);
        }}
        onPointerUp={() => {
          game.input.stick.x = 0;
          game.input.stick.y = 0;
        }}
        onPointerCancel={() => {
          game.input.stick.x = 0;
          game.input.stick.y = 0;
        }}
      />
      <button
        type="button"
        aria-label={copy.howFire}
        className="pointer-events-auto absolute bottom-[max(1.5rem,env(safe-area-inset-bottom))] end-4 size-20 rounded-full border border-border bg-surface/70 text-muted"
        onPointerDown={(e) => {
          e.preventDefault();
          game.input.fireHeld = true;
        }}
        onPointerUp={() => {
          game.input.fireHeld = false;
        }}
        onPointerCancel={() => {
          game.input.fireHeld = false;
        }}
      >
        <MousePointer2 className="mx-auto size-5" />
      </button>
    </div>
  );
}

function steer(e: PointerEvent<HTMLDivElement>, game: FalakGame) {
  const r = e.currentTarget.getBoundingClientRect();
  const x = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
  const y = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
  const m = Math.hypot(x, y);
  const s = m < 0.12 ? 0 : Math.min(1, m);
  game.input.stick.x = m === 0 ? 0 : (x / m) * s;
  game.input.stick.y = m === 0 ? 0 : (y / m) * s;
}
