import { Link, Outlet, useLocation } from "react-router-dom";
import { useMeData } from "@/lib/me-query";

const NAV = [
  { to: "/", label: "TOP" },
  { to: "/rooms", label: "LOBBY" },
  { to: "/history", label: "HISTORY" },
  { to: "/mypage", label: "MY PAGE" },
] as const;

export function AppShell() {
  const { pathname: path } = useLocation();
  const { profile, isPending, isError } = useMeData();

  const balanceLabel = isPending
    ? "…"
    : isError || !profile
      ? "—"
      : `$${profile.balance.toFixed(2)}`;

  return (
    <div className="min-h-screen bg-background text-foreground font-display">
      <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between px-6 py-3">
          <div className="flex items-center gap-8">
            <Link to="/" className="block">
              <h1 className="text-2xl font-black tracking-tighter italic text-primary leading-none">
                BLOCK-JANKEN
                <span className="text-[10px] not-italic font-bold text-white/40 block tracking-normal mt-0.5">
                  ブロック・じゃんけん
                </span>
              </h1>
            </Link>
            <div className="hidden md:flex gap-6 text-sm font-bold tracking-widest">
              {NAV.map((n) => {
                const active = n.to === "/" ? path === "/" : path.startsWith(n.to);
                return (
                  <Link
                    key={n.to}
                    to={n.to}
                    className={
                      active
                        ? "text-primary border-b-2 border-primary pb-1"
                        : "text-white/60 hover:text-white transition-colors"
                    }
                  >
                    {n.label}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-3 py-1 bg-white/5 rounded-full border border-border flex items-center gap-2">
              <div className="size-2 rounded-full bg-success animate-pulse" />
              <span className="font-mono text-xs uppercase tracking-tighter">Online: 1,284</span>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-border">
              <span className="text-[10px] text-white/40 font-mono">BAL</span>
              <span className="font-accent text-lg text-primary leading-none">{balanceLabel}</span>
            </div>
          </div>
        </div>
      </nav>

      <Outlet />

      <footer className="fixed bottom-0 w-full bg-black/80 backdrop-blur-xl border-t border-border px-6 py-2 flex items-center justify-between z-40">
        <div className="flex gap-6 overflow-hidden text-xs">
          <span className="font-mono">
            <span className="text-white/40">BTC </span>$64,120.50
          </span>
          <span className="font-mono hidden sm:inline">
            <span className="text-white/40">GAS </span>
            <span className="text-success">12 GWEI</span>
          </span>
          <span className="font-mono hidden md:inline">
            <span className="text-white/40">STAKED </span>
            <span className="text-primary">$4,204,192</span>
          </span>
        </div>
        <div className="text-[10px] font-mono text-white/20 hidden md:block">
          BLOCK_JANKEN ENGINE V.0.4.1-ALPHA
        </div>
      </footer>
      <div className="h-12" />
    </div>
  );
}
