import { useLayoutEffect, useState } from "react";
import { HAND_EMOJI, HAND_JP, type Match } from "@/lib/janken-types";
import { useMatchesList } from "@/lib/matches-query";

export function HistoryPage() {
  const [mounted, setMounted] = useState(false);
  const { matches, isError, isFetching } = useMatchesList(120);

  useLayoutEffect(() => {
    document.title = "対戦履歴 — BLOCK-JANKEN";
    setMounted(true);
  }, []);

  return (
    <main className="max-w-7xl mx-auto p-6 space-y-6">
      <header>
        <h1 className="text-4xl font-black flex items-center gap-3">
          <span className="size-3 bg-destructive rounded-full animate-pulse" />
          リアルタイム対戦履歴
        </h1>
        <p className="text-white/40 font-mono text-xs mt-2 tracking-widest uppercase">
          [LIVE FEED] {isFetching ? "更新中… " : ""}
          {isError ? "API接続エラー" : "APIから4秒ごとに更新"}
        </p>
      </header>

      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-border bg-white/5 text-[10px] font-mono text-white/40 tracking-widest uppercase">
          <div className="col-span-1">TIME</div>
          <div className="col-span-3">WINNER</div>
          <div className="col-span-3">LOSER</div>
          <div className="col-span-2 text-center">HANDS</div>
          <div className="col-span-2">ROOM</div>
          <div className="col-span-1 text-right">PAYOUT</div>
        </div>
        <div className="divide-y divide-white/5">
          {matches.map((m) => (
            <MatchRow key={m.id} m={m} mounted={mounted} />
          ))}
        </div>
      </div>
    </main>
  );
}

function MatchRow({ m, mounted }: { m: Match; mounted: boolean }) {
  const ago = mounted ? formatAgo(m.finishedAt) : "—";
  return (
    <div className="grid grid-cols-12 gap-4 px-5 py-3 items-center hover:bg-white/5 transition-colors text-sm">
      <div className="col-span-1 font-mono text-xs text-white/40">{ago}</div>
      <div className="col-span-3 flex items-center gap-2">
        <div className="size-7 rounded-full bg-success/20 grid place-items-center text-[10px] font-black text-success">
          W
        </div>
        <span className="font-bold truncate">{m.winner}</span>
      </div>
      <div className="col-span-3 flex items-center gap-2 text-white/60">
        <div className="size-7 rounded-full bg-white/5 grid place-items-center text-[10px] font-black">
          L
        </div>
        <span className="truncate">{m.loser}</span>
      </div>
      <div className="col-span-2 flex items-center justify-center gap-2 text-2xl">
        <span title={HAND_JP[m.winnerHand]}>{HAND_EMOJI[m.winnerHand]}</span>
        <span className="text-white/20 text-sm">vs</span>
        <span className="opacity-50" title={HAND_JP[m.loserHand]}>
          {HAND_EMOJI[m.loserHand]}
        </span>
      </div>
      <div className="col-span-2 truncate text-xs text-white/60">
        ${m.stake} · {m.roomName}
      </div>
      <div className="col-span-1 text-right font-accent text-lg text-success">
        +${m.payout.toFixed(2)}
      </div>
    </div>
  );
}

function formatAgo(ts: number) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  return `${h}h`;
}
