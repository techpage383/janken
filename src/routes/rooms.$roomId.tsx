import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { MOCK_ROOMS, HAND_EMOJI, HAND_JP, ME, type Hand, determineWinner } from "@/lib/mock-data";

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

  type Mode = "player" | "spectator";
  const isHost = room.host === ME.name;
  const seatsLeft = room.maxPlayers - room.players.length;
  // 既に参加済みなら player、満員ならデフォルト観戦、それ以外は player
  const initialMode: Mode = isHost || room.players.includes(ME.name)
    ? "player"
    : seatsLeft > 0
      ? "player"
      : "spectator";
  const [mode, setMode] = useState<Mode>(initialMode);
  const [joined, setJoined] = useState<boolean>(isHost || room.players.includes(ME.name));

  const [myHand, setMyHand] = useState<Hand | null>(null);
  const [oppHand, setOppHand] = useState<Hand | null>(null);
  const [resolving, setResolving] = useState(false);
  const [viewers, setViewers] = useState(42);
  // ラウンドフェーズ: 観戦者にもリアルタイム同期される共有状態
  type Phase = "idle" | "selecting" | "reveal";
  const [phase, setPhase] = useState<Phase>("idle");
  const [round, setRound] = useState(1);
  const [log, setLog] = useState<{ round: number; a: Hand; b: Hand; winner: "a" | "b" | "draw" }[]>([]);
  const tickRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const HANDS: Hand[] = ["rock", "paper", "scissors"];

  function clearTick() {
    if (tickRef.current) clearTimeout(tickRef.current);
    tickRef.current = null;
  }

  // 観戦モード: 自動でラウンドを進めるシミュレーション (リアルタイム同期の代用)
  useEffect(() => {
    if (mode !== "spectator") {
      clearTick();
      return;
    }
    let cancelled = false;
    function runRound() {
      if (cancelled) return;
      setPhase("selecting");
      setMyHand(null);
      setOppHand(null);
      tickRef.current = setTimeout(() => {
        if (cancelled) return;
        const a = HANDS[Math.floor(Math.random() * 3)];
        const b = HANDS[Math.floor(Math.random() * 3)];
        setMyHand(a);
        setOppHand(b);
        setPhase("reveal");
        const w = determineWinner(a, b);
        setLog((l) => [{ round: roundRef.current, a, b, winner: w }, ...l].slice(0, 8));
        tickRef.current = setTimeout(() => {
          if (cancelled) return;
          roundRef.current += 1;
          setRound(roundRef.current);
          runRound();
        }, 3500);
      }, 1800);
    }
    const startDelay = setTimeout(runRound, 600);
    return () => {
      cancelled = true;
      clearTimeout(startDelay);
      clearTick();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  // round の最新値を effect 内で参照するための ref
  const roundRef = useRef(round);
  useEffect(() => { roundRef.current = round; }, [round]);

  // 観戦中のビューワー数を微変動 (リアルタイム感)
  useEffect(() => {
    const id = setInterval(() => {
      setViewers((v) => Math.max(1, v + (Math.random() > 0.5 ? 1 : -1)));
    }, 3000);
    return () => clearInterval(id);
  }, []);

  function play(h: Hand) {
    if (mode !== "player" || !joined) return;
    setMyHand(h);
    setOppHand(null);
    setResolving(true);
    setPhase("selecting");
    setTimeout(() => {
      const opp = HANDS[Math.floor(Math.random() * 3)];
      setOppHand(opp);
      setResolving(false);
      setPhase("reveal");
      const w = determineWinner(h, opp);
      setLog((l) => [{ round: roundRef.current, a: h, b: opp, winner: w }, ...l].slice(0, 8));
      setRound((r) => r + 1);
    }, 1200);
  }

  function switchTo(next: Mode) {
    if (next === mode) return;
    setMode(next);
    setMyHand(null);
    setOppHand(null);
    setPhase("idle");
    if (next === "spectator") {
      setJoined(false);
      setViewers((v) => v + 1);
    } else {
      setViewers((v) => Math.max(0, v - 1));
    }
  }

  function joinSeat() {
    if (seatsLeft <= 0) return;
    setMode("player");
    setJoined(true);
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
              <span className={
                "px-2 py-1 text-[10px] font-black rounded " +
                (mode === "player"
                  ? "bg-primary/20 text-primary"
                  : "bg-secondary/20 text-secondary")
              }>
                {mode === "player" ? (joined ? "参加中" : "参加準備") : "観戦中"}
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

        {/* モード切替トグル */}
        <div className="glass-panel rounded-xl p-2 flex items-center gap-1">
          <button
            onClick={() => switchTo("player")}
            disabled={!joined && seatsLeft <= 0}
            className={
              "flex-1 py-2.5 text-xs font-black tracking-widest uppercase rounded-lg transition-colors " +
              (mode === "player"
                ? "bg-primary text-primary-foreground"
                : "text-white/60 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed")
            }
          >
            🎮 プレイヤー
          </button>
          <button
            onClick={() => switchTo("spectator")}
            className={
              "flex-1 py-2.5 text-xs font-black tracking-widest uppercase rounded-lg transition-colors " +
              (mode === "spectator"
                ? "bg-secondary text-secondary-foreground"
                : "text-white/60 hover:bg-white/5")
            }
          >
            👁 観戦者
          </button>
        </div>

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
            {mode === "player" && joined ? (
              <>
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
              </>
            ) : mode === "player" && !joined ? (
              <div className="text-center space-y-3">
                <p className="text-[10px] font-mono text-white/40 tracking-widest">
                  プレイヤーとして参加するには着席してください
                </p>
                <button
                  onClick={joinSeat}
                  disabled={seatsLeft <= 0}
                  className="px-8 py-3 bg-primary text-primary-foreground font-black hover:scale-[1.02] transition-transform disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {seatsLeft > 0 ? `+ 着席する ($${room.stake} デポジット)` : "満席"}
                </button>
              </div>
            ) : (
              <div className="text-center space-y-2 py-4">
                <p className="font-accent text-2xl text-secondary">SPECTATOR MODE</p>
                <p className="text-xs text-white/50">
                  観戦中は手を出せません。プレイヤーの動きをリアルタイムで観戦できます。
                </p>
              </div>
            )}
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
            <span className="font-mono text-xs text-white/60">{viewers} viewers</span>
          </div>
          {mode === "player" ? (
            <button
              onClick={() => switchTo("spectator")}
              className="w-full py-2 border border-border text-[10px] font-bold tracking-widest hover:bg-white/5 uppercase"
            >
              観戦モードに切替
            </button>
          ) : (
            <button
              onClick={() => switchTo("player")}
              disabled={!joined && seatsLeft <= 0}
              className="w-full py-2 border border-primary text-primary text-[10px] font-bold tracking-widest hover:bg-primary/10 uppercase disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {seatsLeft > 0 || joined ? "プレイヤーに切替" : "満席のため不可"}
            </button>
          )}
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
