import { useEffect, useRef, useState } from "react";
import { FalakGame } from "@/game/game";
import { useGameUI } from "@/game/store";
import {
  GameOverScreen,
  Hud,
  PauseScreen,
  ScoresScreen,
  StartScreen,
  TouchControls,
  UpgradeScreen,
} from "./overlays";

export function GameApp() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [game, setGame] = useState<FalakGame | null>(null);
  const mode = useGameUI((s) => s.mode);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const g = new FalakGame(canvas);
    setGame(g);
    return () => {
      g.destroy();
      setGame(null);
    };
  }, []);

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-bg text-fg">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full touch-none"
        onContextMenu={(e) => e.preventDefault()}
      />
      <Hud game={game} />
      <TouchControls game={game} />
      {mode === "menu" ? <StartScreen game={game} /> : null}
      {mode === "paused" ? <PauseScreen game={game} /> : null}
      {mode === "upgrade" ? <UpgradeScreen game={game} /> : null}
      {mode === "gameover" ? <GameOverScreen game={game} /> : null}
      {mode === "scores" ? <ScoresScreen game={game} /> : null}
    </main>
  );
}
