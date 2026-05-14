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
  validateSearch: (s: Record<string, unknown>) => ({
    mode: s.mode === "spectator" ? ("spectator" as const) : ("player" as const),
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
  const { mode: searchMode } = Route.useSearch();
  const room = MOCK_ROOMS.find((r) => r.id === roomId);
  if (!room) throw notFound();

  type Mode = "player" | "spectator";
  const isHost = room.host === ME.name;
  const seatsLeft = room.maxPlayers - room.players.length;
  // URL ?mode=spectator が最優先。次に既参加・空席状況でデフォルト判定
  const initialMode: Mode =
    searchMode === "spectator"
      ? "spectator"
      : isHost || room.players.includes(ME.name)
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
  // ラウンドフェーズ: idle → selecting (手選択) → judging (判定) → reveal (結果)
  type Phase = "idle" | "selecting" | "judging" | "reveal";
  const [phase, setPhase] = useState<Phase>("idle");
  const SELECT_SECONDS = 5;
  const [countdown, setCountdown] = useState<number>(SELECT_SECONDS);
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
      // 1) 手選択フェーズ + カウントダウン
      setPhase("selecting");
      setMyHand(null);
      setOppHand(null);
      setCountdown(SELECT_SECONDS);
      let n = SELECT_SECONDS;
      const cdId = setInterval(() => {
        n -= 1;
        setCountdown(Math.max(0, n));
        if (n <= 0) clearInterval(cdId);
      }, 1000);
      tickRef.current = setTimeout(() => {
        clearInterval(cdId);
        if (cancelled) return;
        // 2) 判定フェーズ (両者ロック → 演出)
        const a = HANDS[Math.floor(Math.random() * 3)];
        const b = HANDS[Math.floor(Math.random() * 3)];
        setPhase("judging");
        tickRef.current = setTimeout(() => {
          if (cancelled) return;
          // 3) リザルト反映
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
          }, 3000);
        }, 1100);
      }, SELECT_SECONDS * 1000);
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
    if (phase === "judging" || phase === "reveal") return;
    setMyHand(h);
    setOppHand(null);
    setResolving(true);
    // 1) 選択ロック → 2) 判定演出 → 3) 結果
    setPhase("judging");
    setTimeout(() => {
      const opp = HANDS[Math.floor(Math.random() * 3)];
      setOppHand(opp);
      setResolving(false);
      setPhase("reveal");
      const w = determineWinner(h, opp);
      setLog((l) => [{ round: roundRef.current, a: h, b: opp, winner: w }, ...l].slice(0, 8));
      setTimeout(() => {
        setRound((r) => r + 1);
        setMyHand(null);
        setOppHand(null);
        setPhase("idle");
      }, 2500);
    }, 1100);
  }

  function switchTo(next: Mode) {
    if (next === mode) return;
    setMode(next);
    setMyHand(null);
    setOppHand(null);
    setPhase("idle");
    setCountdown(SELECT_SECONDS);
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

  // 観戦者目線では「勝利/敗北」ではなくプレイヤー名で表示
  const spectatorResultLabel = (() => {
    if (!result) return null;
    if (result === "draw") return "DRAW";
    return result === "win" ? "YOU WIN" : `${room.host} WIN`;
  })();

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
          {/* === ラウンド進行ステッパー === */}
          <PhaseStepper phase={phase} round={round} countdown={countdown} selectSeconds={SELECT_SECONDS} />

          <div className="grid grid-cols-3 items-center gap-4 mb-8">
            <PlayerSlot
              name={mode === "spectator" ? ME.name : "YOU"}
              hand={myHand}
              highlight={result === "win"}
              phase={phase}
              locked={mode === "player" && joined && phase !== "idle" && myHand !== null}
            />
            <div className="text-center">
              <div className="font-accent text-5xl text-primary">VS</div>
              <div className="text-[10px] font-mono text-white/40 mt-1 tracking-widest">
                ROUND {round}
              </div>
              {phase === "judging" && (
                <div className="mt-3 font-accent text-2xl text-warning animate-pulse tracking-widest">
                  JUDGING...
                </div>
              )}
              {result && phase === "reveal" && (
                <div className={
                  "mt-3 font-black text-2xl animate-result-pop " +
                  (result === "win" ? "text-success" : result === "lose" ? "text-destructive" : "text-white/60")
                }>
                  {mode === "spectator"
                    ? spectatorResultLabel
                    : result === "win" ? "勝利！" : result === "lose" ? "敗北..." : "あいこ"}
                </div>
              )}
            </div>
            <PlayerSlot
              name={room.host}
              hand={oppHand}
              highlight={result === "lose"}
              phase={phase}
              locked={phase !== "idle" && oppHand !== null}
            />
          </div>

          <div className="border-t border-border pt-6">
            {mode === "player" && joined ? (
              <>
                <p className="text-[10px] font-mono text-white/40 tracking-widest mb-3 text-center">
                  {phase === "judging"
                    ? "両者の手をロック中..."
                    : phase === "reveal"
                      ? "次のラウンド準備中"
                      : `YOUR HAND を選択 — 残り ${countdown}s`}
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {HANDS.map((h) => (
                    <button
                      key={h}
                      onClick={() => play(h)}
                      disabled={resolving || phase === "judging" || phase === "reveal"}
                      className={
                        "py-6 rounded-xl border-2 transition-all flex flex-col items-center gap-2 " +
                        (myHand === h
                          ? "bg-primary/20 border-primary"
                          : "border-border bg-white/5 hover:border-primary/50 hover:scale-[1.02] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100")
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
                  観戦中は手を出せません。プレイヤーの手と結果がリアルタイムで同期表示されます。
                </p>
                <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-full bg-white/5 border border-border">
                  <span className={
                    "size-2 rounded-full " +
                    (phase === "selecting" ? "bg-primary animate-pulse"
                      : phase === "reveal" ? "bg-success" : "bg-white/30")
                  } />
                  <span className="font-mono text-[10px] tracking-widest text-white/60 uppercase">
                    {phase === "selecting" ? "プレイヤー選択中"
                      : phase === "reveal" ? "結果発表"
                      : "次ラウンド準備中"}
                  </span>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 直近ラウンドの履歴 — 参加者・観戦者ともに同じデータを共有 */}
        <section className="glass-panel rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-black tracking-tighter">直近のラウンド</h3>
            <span className="font-mono text-[10px] text-white/40 tracking-widest uppercase flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-destructive animate-pulse" />
              LIVE SYNC
            </span>
          </div>
          {log.length === 0 ? (
            <p className="text-xs text-white/30 text-center py-4">まだラウンドがありません</p>
          ) : (
            <div className="divide-y divide-white/5">
              {log.map((r, i) => (
                <div key={`${r.round}-${i}`} className="flex items-center gap-3 py-2 text-sm">
                  <span className="font-mono text-[10px] text-white/40 w-12">R{r.round}</span>
                  <span className="text-2xl">{HAND_EMOJI[r.a]}</span>
                  <span className="text-white/20 text-xs">vs</span>
                  <span className="text-2xl">{HAND_EMOJI[r.b]}</span>
                  <span className="ml-auto font-black text-[10px] tracking-widest">
                    {r.winner === "draw"
                      ? <span className="text-white/40">DRAW</span>
                      : r.winner === "a"
                        ? <span className="text-success">P1 WIN</span>
                        : <span className="text-destructive">P2 WIN</span>}
                  </span>
                </div>
              ))}
            </div>
          )}
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

type SlotPhase = "idle" | "selecting" | "judging" | "reveal";

function PlayerSlot({
  name,
  hand,
  highlight,
  phase,
  locked,
}: {
  name: string;
  hand: Hand | null;
  highlight?: boolean;
  phase: SlotPhase;
  locked?: boolean;
}) {
  const showHand = phase === "reveal" && !!hand;
  const isShaking = phase === "selecting" || phase === "judging";
  return (
    <div
      className={
        "p-6 rounded-2xl border-2 text-center transition-all " +
        (highlight
          ? "border-primary bg-primary/10 shadow-[0_0_30px_-8px_var(--color-primary)]"
          : "border-border bg-white/5")
      }
    >
      <div className="flex items-center justify-center gap-1.5 mb-3">
        <span className="text-[10px] font-mono text-white/40 tracking-widest">{name}</span>
        {locked && (
          <span className="text-[9px] font-mono text-success tracking-widest">🔒 LOCKED</span>
        )}
      </div>
      <div className="text-7xl h-24 flex items-center justify-center">
        {showHand ? (
          <span key={hand} className="animate-hand-pop inline-block">{HAND_EMOJI[hand!]}</span>
        ) : isShaking ? (
          <span className="animate-hand-shake">✊</span>
        ) : (
          <span className="text-white/10">?</span>
        )}
      </div>
      <p className="text-sm font-black mt-2 h-5">{showHand ? HAND_JP[hand!] : ""}</p>
    </div>
  );
}

function PhaseStepper({
  phase,
  round,
  countdown,
  selectSeconds,
}: {
  phase: SlotPhase;
  round: number;
  countdown: number;
  selectSeconds: number;
}) {
  const steps = [
    { key: "selecting", label: "手選択", icon: "✊" },
    { key: "judging", label: "判定", icon: "⚖" },
    { key: "reveal", label: "結果", icon: "🏆" },
  ] as const;
  const order: SlotPhase[] = ["idle", "selecting", "judging", "reveal"];
  const idx = order.indexOf(phase);
  const pct = Math.max(0, Math.min(1, (selectSeconds - countdown) / selectSeconds));
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <span className="font-mono text-[10px] text-white/40 tracking-widest uppercase">
          ROUND {round} / 進行
        </span>
        {phase === "selecting" && (
          <span className="font-accent text-3xl text-primary leading-none tabular-nums">
            {countdown}
            <span className="text-xs text-white/40 ml-1">s</span>
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        {steps.map((s, i) => {
          const stepIdx = i + 1; // selecting=1, judging=2, reveal=3
          const active = idx === stepIdx;
          const done = idx > stepIdx;
          return (
            <div key={s.key} className="flex-1 flex items-center gap-2">
              <div
                className={
                  "size-8 rounded-full grid place-items-center text-sm font-black transition-colors shrink-0 " +
                  (done
                    ? "bg-success text-success-foreground"
                    : active
                      ? "bg-primary text-primary-foreground animate-step-glow"
                      : "bg-white/5 text-white/30 border border-border")
                }
              >
                {done ? "✓" : s.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-black tracking-widest uppercase truncate">
                  <span className={done || active ? "text-white" : "text-white/30"}>{s.label}</span>
                </div>
                <div className="h-1 mt-1 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className={
                      "h-full transition-all duration-300 " +
                      (done
                        ? "bg-success w-full"
                        : active
                          ? s.key === "selecting"
                            ? "bg-primary"
                            : "bg-primary animate-pulse w-full"
                          : "w-0")
                    }
                    style={
                      active && s.key === "selecting"
                        ? { width: `${pct * 100}%` }
                        : undefined
                    }
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
