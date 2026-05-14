import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { MOCK_ROOMS, HAND_EMOJI, HAND_JP, type Hand, determineWinner } from "@/lib/mock-data";

export const Route = createFileRoute("/rooms/$roomId")({
  head: () => ({
    meta: [
      { title: "対戦ルーム — BLOCK-JANKEN" },
      { name: "description", content: "じゃんけんルームで対戦・観戦する。" },
    ],
  }),
  component: RoomPage,
  notFoundComponent: () => (
    <div className="max-w-xl mx-auto p-12 text-center">
      <h1 className="text-3xl font-black mb-4">ルームが見つかりません</h1>
      <Link to="/rooms" className="text-primary underline">ロビーへ戻る</Link>
    </div>
  ),
});

function RoomPage() {
  const { roomId } = Route.useParams();
  const room = MOCK_ROOMS.find((r) => r.id === roomId);
  if (!room) throw notFound();

  const [myHand, setMyHand] = useState<Hand | null>(null);
  const [oppHand, setOppHand] = useState<Hand | null>(null);
  const [resolving, setResolving] = useState(false);

  const HANDS: Hand[] = ["rock", "paper", "scissors"];

  function play(h: Hand) {
    setMyHand(h);
    setOppHand(null);
    setResolving(true);
    setTimeout(() => {
      const opp = HANDS[Math.floor(Math.random() * 3)];
      setOppHand(opp);
      setResolving(false);
    }, 1200);
  }

  const result =
    myHand && oppHand
      ? determineWinner(myHand, oppHand) === "draw"
        ? "draw"
        : determineWinner(myHand, oppHand) === "a"
          ? "win"
          : "lose"
      : null;

  return (
    <main className="max-w-7xl mx-auto p-6 grid grid-cols-12 gap-6">
      <div className="col-span-12 lg:col-span-8 space-y-6">
        <div className="flex items-center gap-2 text-xs font-mono text-white/40">
          <Link to="/rooms" className="hover:text-white">← LOBBY</Link>
          <span>/</span>
          <span>{room.id.toUpperCase()}</span>
        </div>

        <header className="glass-panel rounded-2xl p-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono text-white/40 block mb-1 uppercase tracking-widest">
              Host: {room.host}
            </span>
            <h1 className="text-3xl font-black">{room.name}</h1>
            <div className="flex gap-3 mt-3">
              <span className="px-2 py-1 bg-success/20 text-success text-[10px] font-black rounded">募集中</span>
              <span className="px-2 py-1 bg-white/5 text-white/60 text-[10px] font-black rounded">
                {room.maxPlayers}人対戦
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-mono text-white/40 block">STAKE</span>
            <span className="font-accent text-5xl text-primary leading-none">${room.stake}</span>
            <span className="text-[10px] font-mono text-white/40 block mt-1">
              WIN: ${(room.stake * (room.maxPlayers - 1) * 1.9).toFixed(2)}
            </span>
          </div>
        </header>

        <section className="glass-panel rounded-2xl p-8">
          <div className="grid grid-cols-3 items-center gap-4 mb-8">
            <PlayerSlot name="YOU" hand={myHand} highlight={result === "win"} />
            <div className="text-center">
              <div className="font-accent text-5xl text-primary">VS</div>
              {result && (
                <div className={
                  "mt-3 font-black text-xl " +
                  (result === "win" ? "text-success" : result === "lose" ? "text-destructive" : "text-white/60")
                }>
                  {result === "win" ? "勝利！" : result === "lose" ? "敗北..." : "あいこ"}
                </div>
              )}
            </div>
            <PlayerSlot name={room.host} hand={oppHand} highlight={result === "lose"} loading={resolving} />
          </div>

          <div className="border-t border-border pt-6">
            <p className="text-[10px] font-mono text-white/40 tracking-widest mb-3 text-center">
              YOUR HAND を選択
            </p>
            <div className="grid grid-cols-3 gap-3">
              {HANDS.map((h) => (
                <button
                  key={h}
                  onClick={() => play(h)}
                  disabled={resolving}
                  className={
                    "py-6 rounded-xl border-2 transition-all flex flex-col items-center gap-2 " +
                    (myHand === h
                      ? "bg-primary/20 border-primary"
                      : "border-border bg-white/5 hover:border-primary/50 hover:scale-[1.02]")
                  }
                >
                  <span className="text-5xl">{HAND_EMOJI[h]}</span>
                  <span className="font-black text-sm">{HAND_JP[h]}</span>
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>

      <aside className="col-span-12 lg:col-span-4 space-y-4">
        <div className="glass-panel rounded-2xl p-5">
          <h3 className="text-sm font-black tracking-tighter mb-4">参加プレイヤー</h3>
          <div className="space-y-2">
            {Array.from({ length: room.maxPlayers }).map((_, i) => {
              const p = room.players[i];
              return (
                <div
                  key={i}
                  className={
                    "flex items-center gap-3 p-3 rounded-lg border " +
                    (p ? "bg-white/5 border-border" : "border-dashed border-white/10")
                  }
                >
                  <div className={
                    "size-8 rounded-full grid place-items-center text-xs font-bold " +
                    (p ? "bg-zinc-700 text-white" : "bg-white/5 text-white/20")
                  }>
                    {p ? p[0].toUpperCase() : "?"}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold">{p ?? "空席"}</p>
                    <p className="text-[10px] font-mono text-white/40">{p === room.host ? "HOST" : p ? "PLAYER" : "WAITING..."}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 space-y-3">
          <h3 className="text-sm font-black tracking-tighter">観戦中</h3>
          <div className="flex items-center gap-2">
            <span className="size-2 bg-destructive rounded-full animate-pulse" />
            <span className="font-mono text-xs text-white/60">42 viewers</span>
          </div>
          <button className="w-full py-2 border border-border text-[10px] font-bold tracking-widest hover:bg-white/5 uppercase">
            観戦モードで参加
          </button>
        </div>
      </aside>
    </main>
  );
}

function PlayerSlot({ name, hand, highlight, loading }: { name: string; hand: Hand | null; highlight?: boolean; loading?: boolean }) {
  return (
    <div className={
      "p-6 rounded-2xl border-2 text-center transition-all " +
      (highlight ? "border-primary bg-primary/10" : "border-border bg-white/5")
    }>
      <p className="text-[10px] font-mono text-white/40 tracking-widest mb-3">{name}</p>
      <div className="text-7xl h-24 flex items-center justify-center">
        {loading ? <span className="animate-pulse">⌛</span> : hand ? HAND_EMOJI[hand] : <span className="text-white/10">?</span>}
      </div>
      <p className="text-sm font-black mt-2 h-5">{hand ? HAND_JP[hand] : ""}</p>
    </div>
  );
}
