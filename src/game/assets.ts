import { SPRITE } from "./constants";

function load(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`sprite ${src}`));
    img.src = src;
  });
}

export type SpritePack = {
  player: HTMLImageElement | null;
  scout: HTMLImageElement | null;
  fighter: HTMLImageElement | null;
  heavy: HTMLImageElement | null;
  shotPlayer: HTMLImageElement | null;
  shotEnemy: HTMLImageElement | null;
  explode: (HTMLImageElement | null)[];
  muzzle: (HTMLImageElement | null)[];
  pickup: Record<"spread" | "shield" | "speed" | "star", HTMLImageElement | null>;
};

async function optional(src: string): Promise<HTMLImageElement | null> {
  try {
    return await load(src);
  } catch {
    return null;
  }
}

export async function loadSprites(): Promise<SpritePack> {
  const [
    player,
    scout,
    fighter,
    heavy,
    shotPlayer,
    shotEnemy,
    ...rest
  ] = await Promise.all([
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
    optional(SPRITE.pickup.star),
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
      star: pick[3] ?? null,
    },
  };
}
