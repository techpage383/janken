import { useLayoutEffect } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { HAND_EMOJI, HAND_JP, type Match } from "@/lib/janken-types";
import { PLAYER_NAME } from "@/lib/player";
import { useMeData } from "@/lib/me-query";

export function MyAccountPage() {
  useLayoutEffect(() => {
    document.title = "マイページ — BLOCK-JANKEN";
  }, []);

  const { profile, matches, isPending, isError } = useMeData();

  if (isPending) {
    return (
      <main className="max-w-7xl mx-auto p-6">
        <p className="font-mono text-sm text-white/50">プロフィールを読み込み中…</p>
      </main>
    );
  }

  if (isError || !profile) {
    return (
      <main className="max-w-7xl mx-auto p-6 space-y-4">
        <h1 className="text-2xl font-black">マイページ</h1>
        <p className="text-sm text-destructive">
          プロフィールを取得できませんでした。APIとDBを確認してください（プレイヤー名: {PLAYER_NAME}
          ）。
        </p>
      </main>
    );
  }

  const playerName = profile.name;

  const wins = matches.filter((m) => m.winner === playerName).length;
  const losses = matches.length - wins;
  const winRate = matches.length ? ((wins / matches.length) * 100).toFixed(1) : "0.0";
  const totalEarned = matches.reduce(
    (acc, m) => acc + (m.winner === playerName ? m.payout : -m.stake),
    0,
  );

  const sorted = [...matches].sort((a, b) => a.finishedAt - b.finishedAt);
  let cum = 0;
  const chartData = sorted.map((m, i) => {
    const delta = m.winner === playerName ? m.payout : -m.stake;
    cum += delta;
    return { match: i + 1, balance: Number(cum.toFixed(2)) };
  });

  return (
    <main className="max-w-7xl mx-auto p-6 space-y-6">
      <header className="glass-panel rounded-2xl p-6 flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="size-16 rounded-full bg-gradient-to-tr from-primary to-secondary p-[2px]">
            <div className="w-full h-full rounded-full bg-card grid place-items-center font-accent text-2xl text-primary">
              {playerName[0]}
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-black">{playerName}</h1>
            <p className="text-[10px] font-mono text-white/40">{profile.wallet}</p>
            <span className="inline-block mt-1 px-2 py-0.5 bg-primary/20 text-primary text-[10px] font-black rounded">
              RANK: シルバー II
            </span>
          </div>
        </div>
        <div className="flex gap-6">
          <Stat label="BALANCE" value={`$${profile.balance.toFixed(2)}`} accent />
          <Stat
            label="TOTAL EARNED"
            value={`${totalEarned >= 0 ? "+" : ""}$${totalEarned.toFixed(2)}`}
            success={totalEarned >= 0}
          />
        </div>
      </header>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-4 space-y-4">
          <div className="glass-panel rounded-2xl p-6">
            <p className="text-[10px] font-mono text-white/40 tracking-widest mb-2">WIN RATE</p>
            <p className="font-accent text-6xl text-primary leading-none">{winRate}%</p>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden mt-4 flex">
              <div className="h-full bg-primary" style={{ width: `${winRate}%` }} />
            </div>
            <div className="grid grid-cols-2 gap-3 mt-5">
              <div className="bg-white/5 p-3 rounded-lg">
                <p className="text-[10px] text-white/40">WINS</p>
                <p className="font-mono font-bold text-success text-lg">{wins}</p>
              </div>
              <div className="bg-white/5 p-3 rounded-lg">
                <p className="text-[10px] text-white/40">LOSSES</p>
                <p className="font-mono font-bold text-destructive text-lg">{losses}</p>
              </div>
            </div>
          </div>
          <div className="glass-panel rounded-2xl p-6">
            <p className="text-[10px] font-mono text-white/40 tracking-widest mb-3">HAND USAGE</p>
            <HandUsage matches={matches} playerName={playerName} />
          </div>
        </div>

        <div className="col-span-12 lg:col-span-8 glass-panel rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-black tracking-tighter">収支推移</h3>
              <p className="text-[10px] font-mono text-white/40 tracking-widest uppercase">
                [CUMULATIVE BALANCE]
              </p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer>
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="match" stroke="rgba(255,255,255,0.3)" fontSize={10} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} />
                <Tooltip
                  contentStyle={{
                    background: "#18181b",
                    border: "1px solid rgba(255,255,255,0.1)",
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "#facc15" }}
                />
                <Area
                  type="monotone"
                  dataKey="balance"
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                  fill="url(#g)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <section>
        <h2 className="text-xl font-black mb-4 flex items-center gap-2">
          <span className="size-3 bg-secondary rounded-full" />
          直近の対戦
        </h2>
        <div className="glass-panel rounded-2xl overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-border bg-white/5 text-[10px] font-mono text-white/40 tracking-widest uppercase">
            <div className="col-span-2">RESULT</div>
            <div className="col-span-3">OPPONENT</div>
            <div className="col-span-2 text-center">HANDS</div>
            <div className="col-span-3">ROOM</div>
            <div className="col-span-2 text-right">P/L</div>
          </div>
          <div className="divide-y divide-white/5">
            {matches.slice(0, 12).map((m) => {
              const won = m.winner === playerName;
              const opp = won ? m.loser : m.winner;
              return (
                <div key={m.id} className="grid grid-cols-12 gap-4 px-5 py-3 items-center text-sm">
                  <div className="col-span-2">
                    <span
                      className={
                        "px-2 py-1 text-[10px] font-black rounded " +
                        (won ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive")
                      }
                    >
                      {won ? "WIN" : "LOSS"}
                    </span>
                  </div>
                  <div className="col-span-3 truncate font-bold">{opp}</div>
                  <div className="col-span-2 flex items-center justify-center gap-2 text-xl">
                    <span title={HAND_JP[m.winnerHand]}>{HAND_EMOJI[m.winnerHand]}</span>
                    <span className="text-white/20 text-xs">vs</span>
                    <span className="opacity-60" title={HAND_JP[m.loserHand]}>
                      {HAND_EMOJI[m.loserHand]}
                    </span>
                  </div>
                  <div className="col-span-3 truncate text-xs text-white/60">
                    ${m.stake} · {m.roomName}
                  </div>
                  <div
                    className={
                      "col-span-2 text-right font-accent text-lg " +
                      (won ? "text-success" : "text-destructive")
                    }
                  >
                    {won ? "+" : "-"}${(won ? m.payout : m.stake).toFixed(2)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}

function Stat({
  label,
  value,
  accent,
  success,
}: {
  label: string;
  value: string;
  accent?: boolean;
  success?: boolean;
}) {
  return (
    <div className="text-right">
      <p className="text-[10px] font-mono text-white/40 tracking-widest">{label}</p>
      <p
        className={
          "font-accent text-3xl leading-none " +
          (accent ? "text-primary" : success ? "text-success" : "text-foreground")
        }
      >
        {value}
      </p>
    </div>
  );
}

function HandUsage({ matches, playerName }: { matches: Match[]; playerName: string }) {
  const counts = matches.reduce(
    (acc, m) => {
      const mine = m.winner === playerName ? m.winnerHand : m.loserHand;
      acc[mine]++;
      return acc;
    },
    { rock: 0, paper: 0, scissors: 0 } as Record<string, number>,
  );
  const total = Math.max(matches.length, 1);
  return (
    <div className="space-y-3">
      {(["rock", "paper", "scissors"] as const).map((h) => {
        const pct = (counts[h] / total) * 100;
        return (
          <div key={h}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="flex items-center gap-2">
                <span className="text-lg">{HAND_EMOJI[h]}</span>
                <span className="font-bold">{HAND_JP[h]}</span>
              </span>
              <span className="font-mono text-white/60">
                {counts[h]} ({pct.toFixed(0)}%)
              </span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
