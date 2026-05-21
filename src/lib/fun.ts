// Funny copy + simple confetti + sound-ish blip. Pure DOM / Web Audio, no deps.

export const FUNNY_LOADING = [
  "じゃんけんの神に祈っています…",
  "RNG をなでなで中…",
  "対戦相手の指をほぐしています…",
  "コインをピカピカに磨いています…",
  "回線にチョキを通しています…",
  "観客に静かにするよう頼んでいます…",
] as const;

export const FUNNY_WIN_TOASTS = [
  "勝った！🎉 相手は今ごろ枕を殴っています",
  "完全勝利。今夜の夢はコインまみれ💰",
  "ナイス読み！相手の心、丸見え👁",
  "勝因: 圧倒的じゃんけん力",
] as const;

export const FUNNY_LOSS_TOASTS = [
  "ドンマイ…次は宇宙が味方してくれる🌌",
  "敗北。でもあなたの心はチョキより鋭い✂️",
  "RNG の機嫌が悪かったらしい",
] as const;

export const FUNNY_DRAW_TOASTS = [
  "あいこ。運命の赤い糸が絡まりました",
  "DRAW! まるで鏡を見ているようだ🪞",
] as const;

export function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// === Confetti ===
const CONFETTI_COLORS = ["#fbbf24", "#f43f5e", "#34d399", "#60a5fa", "#a78bfa", "#f472b6"];

export function fireConfetti(count = 90) {
  if (typeof document === "undefined") return;
  const root = document.createElement("div");
  root.className = "fun-confetti-root";
  document.body.appendChild(root);
  const w = window.innerWidth;
  for (let i = 0; i < count; i++) {
    const piece = document.createElement("span");
    piece.className = "fun-confetti-piece";
    const left = Math.random() * w;
    const delay = Math.random() * 250;
    const duration = 1800 + Math.random() * 1400;
    const drift = (Math.random() - 0.5) * 240;
    const rot = Math.random() * 720 - 360;
    const size = 6 + Math.random() * 8;
    piece.style.left = `${left}px`;
    piece.style.top = `-20px`;
    piece.style.width = `${size}px`;
    piece.style.height = `${size * 1.4}px`;
    piece.style.background = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
    piece.style.setProperty("--drift", `${drift}px`);
    piece.style.setProperty("--rot", `${rot}deg`);
    piece.style.animation = `confetti-fall ${duration}ms ${delay}ms cubic-bezier(0.2,0.6,0.4,1) forwards`;
    root.appendChild(piece);
  }
  setTimeout(() => root.remove(), 4000);
}

// === Tiny blip via WebAudio (no asset) ===
let _audioCtx: AudioContext | null = null;
function ctx() {
  if (typeof window === "undefined") return null;
  if (!_audioCtx) {
    try {
      _audioCtx = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    } catch {
      return null;
    }
  }
  return _audioCtx;
}

export function playBlip(kind: "win" | "lose" | "draw" = "win") {
  const ac = ctx();
  if (!ac) return;
  const notes =
    kind === "win"
      ? [523, 659, 784, 1047]
      : kind === "lose"
        ? [392, 311, 233]
        : [440, 440];
  notes.forEach((freq, i) => {
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = "square";
    o.frequency.value = freq;
    const start = ac.currentTime + i * 0.09;
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(0.12, start + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, start + 0.18);
    o.connect(g).connect(ac.destination);
    o.start(start);
    o.stop(start + 0.2);
  });
}