import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
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
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [path]);

  const balanceLabel = isPending
    ? "…"
    : isError || !profile
      ? "—"
      : `$${profile.balance.toFixed(2)}`;

  return (
    <div className="min-h-screen bg-background text-foreground font-display">
      {menuOpen ? (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-background/70 backdrop-blur-sm md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      ) : null}

      <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-2 px-4 py-3 md:gap-4 md:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-4 md:gap-8">
            <Link to="/" className="block min-w-0 shrink" onClick={() => setMenuOpen(false)}>
              <h1 className="text-xl font-black tracking-tighter italic text-primary leading-none md:text-2xl">
                BLOCK-JANKEN
                <span className="text-[10px] not-italic font-bold text-white/40 block tracking-normal mt-0.5">
                  ブロック・じゃんけん
                </span>
              </h1>
            </Link>
            <div className="hidden gap-6 text-sm font-bold tracking-widest md:flex">
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
          <div className="flex shrink-0 items-center gap-2 md:gap-4">
            <div className="hidden items-center gap-2 rounded-full border border-border bg-white/5 px-3 py-1 sm:flex">
              <div className="size-2 shrink-0 rounded-full bg-success animate-pulse" />
              <span className="font-mono text-xs uppercase tracking-tighter">Online: 1,284</span>
            </div>
            <div className="hidden items-center gap-2 rounded-lg border border-border bg-white/5 px-3 py-1.5 sm:flex">
              <span className="text-[10px] font-mono text-white/40">BAL</span>
              <span className="font-accent text-lg leading-none text-primary">{balanceLabel}</span>
            </div>
            <button
              type="button"
              className="grid size-11 shrink-0 place-items-center rounded-lg border border-border bg-white/5 text-white/80 touch-manipulation hover:bg-white/10 md:hidden"
              aria-expanded={menuOpen}
              aria-controls="mobile-nav-menu"
              onClick={() => setMenuOpen((o) => !o)}
            >
              {menuOpen ? (
                <X className="size-5" aria-hidden />
              ) : (
                <Menu className="size-5" aria-hidden />
              )}
            </button>
          </div>
        </div>

        <div
          id="mobile-nav-menu"
          className={
            "border-t border-border bg-background/95 backdrop-blur-md md:hidden " +
            (menuOpen ? "block" : "hidden")
          }
        >
          <div className="mx-auto max-w-[1440px] px-4 py-2">
            <ul className="flex flex-col">
              {NAV.map((n) => {
                const active = n.to === "/" ? path === "/" : path.startsWith(n.to);
                return (
                  <li key={n.to}>
                    <Link
                      to={n.to}
                      className={
                        "block py-3.5 text-sm font-bold tracking-widest transition-colors " +
                        (active ? "text-primary" : "text-white/70 hover:text-white")
                      }
                    >
                      {n.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </nav>

      <Outlet />

      <footer className="fixed bottom-0 z-40 flex w-full items-center justify-between border-t border-border bg-black/80 px-6 py-2 backdrop-blur-xl">
        <div className="flex gap-6 overflow-hidden text-xs">
          <span className="font-mono">
            <span className="text-white/40">BTC </span>$64,120.50
          </span>
          <span className="hidden font-mono sm:inline">
            <span className="text-white/40">GAS </span>
            <span className="text-success">12 GWEI</span>
          </span>
          <span className="hidden font-mono md:inline">
            <span className="text-white/40">STAKED </span>
            <span className="text-primary">$4,204,192</span>
          </span>
        </div>
        <div className="hidden text-[10px] font-mono text-white/20 md:block">
          BLOCK_JANKEN ENGINE V.0.4.1-ALPHA
        </div>
      </footer>
      <div className="h-12" />
    </div>
  );
}
