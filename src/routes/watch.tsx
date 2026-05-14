import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  MOCK_ROOMS,
  HAND_EMOJI,
  HAND_JP,
  type Hand,
  determineWinner,
} from "@/lib/mock-data";

export const Route = createFileRoute("/watch")({
  head: () => ({
    meta: [
      { title: "観戦ロビー — BLOCK-JANKEN" },
      {
        name: "description",
        content: "進行中のじゃんけんルームをリアルタイムで観戦。",
      },
    ],
  }),
  component: WatchPage,
});

const HANDS: Hand[] = ["rock", "paper", "scissors"];

function WatchPage() {
  // 実際にプレイ中（満員）のルームのみ表示。0件なら全件にフォールバック
  const playing = MOCK_ROOMS.filter((r) => r.players.length >= r.maxPlayers);
  const rooms = playing.length > 0 ? playing : MOCK_ROOMS;

  return (
    <main className="max-w-7xl mx-auto p-6 space-y-6">
      <header className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-4xl font-black flex items-center gap-3">
            <span className="size-3 bg-destructive rounded-full animate-pulse" />
            観戦ロビー
          </h1>
          <p className="text-white/40 font-mono text-xs mt-2 tracking-widest uppercase">
            [LIVE] {rooms.length} matches in progress
          </p>
        </div>
        <Link
          to="/rooms"
          className="px-4 py-2 border border-border text-xs font-black tracking-widest uppercase hover:bg-white/5 rounded-md"
        >
          ← ロビーへ戻る
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {rooms.map((r) => (
          <LiveRoomCard key={r.id} roomId={r.id} />
        ))}
      </div>
    </main>
  );
}

function LiveRoomCard({ roomId }: { roomId: string }) {
  const room = MOCK_ROOMS.find((x) => x.id === roomId)!;
  const [phase, setPhase] = useState<"selecting" | "reveal">("selecting");
  const [a, setA] = useState<Hand | null>(null);
  const [b, setB] = useState<Hand | null>(null);
  const [round, setRound] = useState(1);
  const [viewers, setViewers] = useState(
    8 + Math.floor((room.id.charCodeAt(5) * 7) % 40),
  );
  const tickRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    function loop() {
      if (cancelled) return;
      setPhase("selecting");
      setA(null);
      setB(null);
      tickRef.current = setTimeout(() => {
        if (cancelled) return;
        setA(HANDS[Math.floor(Math.random() * 3)]);
        setB(HANDS[Math.floor(Math.random() * 3)]);
        setPhase("reveal");
        tickRef.current = setTimeout(() => {
          if (cancelled) return;
          setRound((r) => r + 1);
          loop();
        }, 3200);
      }, 1500 + Math.random() * 1200);
    }
    // ルーム毎に開始タイミングをずらす
    const startDelay = setTimeout(loop, Math.random() * 1500);
    const v = setInterval(
      () =>
        setViewers((x) =>
          Math.max(1, x + (Math.random() > 0.5 ? 1 : -1)),
        ),
      4000,
    );
    return () => {
      cancelled = true;
      clearTimeout(startDelay);
      if (tickRef.current) clearTimeout(tickRef.current);
      clearInterval(v);
    };
  }, []);

  const winner = a && b ? determineWinner(a, b) : null;
  const p1 = room.players[0] ?? room.host;
  const p2 = room.players[1] ?? "Opponent";

  return (
    <Link
      to="/rooms/$roomId"
      params={{ roomId: room.id }}
      search={{ mode: "spectator" as const }}
      className="glass-panel rounded-xl p-4 block hover:border-secondary/50 transition-colors"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="min-w-0">
          <span className="text-[10px] font-mono text-white/40 block uppercase tracking-widest">
            {room.id.toUpperCase()}
          </span>
          <h3 className="font-bold truncate">{room.name}</h3>
        </div>
        <div className="text-right shrink-0 ml-2">
          <span className="font-accent text-2xl text-primary leading-none">
            ${room.stake}
          </span>
          <span className="block text-[10px] font-mono text-white/40">
            R{round}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 items-center gap-2 my-2">
        <MiniSlot name={p1} hand={a} highlight={winner === "a"} />
        <div className="text-center">
          <div className="font-accent text-2xl text-primary">VS</div>
          {phase === "selecting" ? (
            <div className="text-[10px] font-mono text-white/40 mt-1 animate-pulse tracking-widest">
              SELECT...
            </div>
          ) : (
            <div
              className={
                "text-[10px] font-black mt-1 tracking-widest " +
                (winner === "draw"
                  ? "text-white/40"
                  : winner === "a"
                    ? "text-success"
                    : "text-destructive")
              }
            >
              {winner === "draw" ? "DRAW" : winner === "a" ? "P1 WIN" : "P2 WIN"}
            </div>
          )}
        </div>
        <MiniSlot name={p2} hand={b} highlight={winner === "b"} />
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
        <span className="flex items-center gap-1.5 text-[10px] font-mono text-white/50">
          <span className="size-1.5 rounded-full bg-destructive animate-pulse" />
          {viewers} 観戦中
        </span>
        <span className="text-[10px] font-black tracking-widest text-secondary uppercase">
          観戦に入る →
        </span>
      </div>
    </Link>
  );
}

function MiniSlot({
  name,
  hand,
  highlight,
}: {
  name: string;
  hand: Hand | null;
  highlight: boolean;
}) {
  return (
    <div
      className={
        "rounded-lg border-2 p-2 text-center transition-colors " +
        (highlight
          ? "border-primary bg-primary/10"
          : "border-border bg-white/5")
      }
    >
      <p className="text-[9px] font-mono text-white/40 truncate uppercase tracking-widest">
        {name}
      </p>
      <div className="text-4xl h-12 flex items-center justify-center">
        {hand ? (
          HAND_EMOJI[hand]
        ) : (
          <span className="animate-pulse text-white/20">⌛</span>
        )}
      </div>
      <p className="text-[10px] font-bold h-4">{hand ? HAND_JP[hand] : ""}</p>
    </div>
  );
}
