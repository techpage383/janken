import { Link } from "react-router-dom";
import { useLayoutEffect } from "react";
import { HAND_EMOJI } from "@/lib/janken-types";
import { useDashboardData } from "@/lib/dashboard-query";
import { RoomCard } from "@/components/RoomCard";

export function HomePage() {
  useLayoutEffect(() => {
    document.title = "BLOCK-JANKEN — Web3じゃんけん対戦プラットフォーム";
  }, []);

  const { featuredRooms, recentMatches, isError, isFetching } = useDashboardData();

  return (
    <main className="max-w-7xl mx-auto p-6 grid grid-cols-12 gap-6">
      <div className="col-span-12 lg:col-span-8 space-y-6">
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/10 border border-border p-8">
          <div className="relative z-10 space-y-4 max-w-2xl">
            <div className="inline-block px-2 py-1 bg-black text-primary font-mono text-[10px] font-bold tracking-widest uppercase">
              Season 04 Active
            </div>
            <h1 className="text-5xl md:text-6xl font-black leading-tight text-balance">
              世界中のプレイヤーと
              <br />
              <span className="text-primary">ガチじゃんけん。</span>
            </h1>
            <p className="text-white/60 text-base max-w-md">
              ブロックチェーン技術を活用した、透明でエキサイティングな対戦プラットフォーム。
              数秒でルーム作成、即座に勝敗を確定。
            </p>
            <div className="flex flex-wrap gap-3 pt-4">
              <Link
                to="/rooms"
                className="px-8 py-4 bg-primary text-primary-foreground font-black text-lg hover:scale-[1.02] transition-transform"
              >
                ルームを作る
              </Link>
              <Link
                to="/rooms"
                className="px-8 py-4 border-2 border-white/20 font-black text-lg hover:bg-white/5 transition-colors"
              >
                クイック参加
              </Link>
            </div>
          </div>
          <div className="absolute right-[-5%] top-1/2 -translate-y-1/2 opacity-10 pointer-events-none select-none">
            <span className="font-accent text-[200px] md:text-[280px] leading-none">RPS</span>
          </div>
        </section>

        <section>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <h2 className="text-xl font-black flex items-center gap-2">
              <span className="size-3 bg-secondary rounded-full" />
              注目のルーム <span className="text-white/40 font-mono text-sm ml-2">[FEATURED]</span>
            </h2>
            <div className="flex items-center gap-4">
              <p className="text-[10px] font-mono text-white/40 uppercase">
                {isFetching ? "更新中… " : ""}
                {isError ? "API接続エラー" : ""}
              </p>
              <Link
                to="/rooms"
                className="text-xs font-bold tracking-widest text-white/60 hover:text-primary uppercase"
              >
                See all →
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featuredRooms.map((r) => (
              <RoomCard key={r.id} room={r} />
            ))}
          </div>
        </section>
      </div>

      <aside className="col-span-12 lg:col-span-4 space-y-6">
        <div className="glass-panel rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-border bg-white/5 flex items-center justify-between">
            <h3 className="text-sm font-black tracking-tighter flex items-center gap-2">
              <span className="size-2 bg-destructive rounded-full animate-ping" />
              リアルタイム履歴
            </h3>
            <span className="text-[10px] font-mono text-white/40 uppercase">LIVE FEED</span>
          </div>
          <div className="divide-y divide-white/5">
            {recentMatches.map((m) => (
              <div key={m.id} className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-lg">{HAND_EMOJI[m.winnerHand]}</span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold truncate">{m.winner}</p>
                    <p className="text-[10px] text-white/40 truncate">が {m.loser} に勝利</p>
                  </div>
                </div>
                <span className="font-accent text-lg text-success shrink-0">
                  +${m.payout.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          <Link
            to="/history"
            className="block w-full py-3 text-center text-[10px] font-bold tracking-widest text-white/60 uppercase hover:bg-white/5 border-t border-border"
          >
            すべての履歴を見る →
          </Link>
        </div>

        <div className="glass-panel rounded-2xl p-6 space-y-3">
          <h3 className="text-sm font-black tracking-tighter">遊び方</h3>
          <ol className="space-y-2 text-sm text-white/70">
            <li>
              <span className="text-primary font-mono mr-2">01</span>ルームを作るか参加する
            </li>
            <li>
              <span className="text-primary font-mono mr-2">02</span>賞金額を選択（$1/$5/$10）
            </li>
            <li>
              <span className="text-primary font-mono mr-2">03</span>グー・チョキ・パーで勝負！
            </li>
            <li>
              <span className="text-primary font-mono mr-2">04</span>勝者が賞金を獲得
            </li>
          </ol>
        </div>
      </aside>
    </main>
  );
}
