import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useLayoutEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { createRoom } from "@/lib/api";
import { describeApiFailure } from "@/lib/api-error-hint";
import type { Room } from "@/lib/janken-types";
import { PLAYER_NAME } from "@/lib/player";
import { RoomCard } from "@/components/RoomCard";
import { roomsQueryKey, useRoomsList } from "@/lib/rooms-query";

type StakeFilter = "all" | 1 | 5 | 10;
type LobbyStatusFilter = "all" | "waiting";

export function RoomsPage() {
  useLayoutEffect(() => {
    document.title = "ロビー — BLOCK-JANKEN";
  }, []);

  const { rooms, isError, error, isFetching } = useRoomsList();

  const [stake, setStake] = useState<StakeFilter>("all");
  const [statusFilter, setStatusFilter] = useState<LobbyStatusFilter>("all");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(
    () =>
      rooms.filter((r) => {
        const stakeOk = stake === "all" || r.stake === stake;
        const statusOk = statusFilter === "all" || r.status === "waiting";
        return stakeOk && statusOk;
      }),
    [rooms, stake, statusFilter],
  );

  return (
    <main className="max-w-7xl mx-auto p-6 space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black flex items-center gap-3">
            <span className="size-3 bg-secondary rounded-full" />
            ルーム一覧
          </h1>
          <p className="text-white/40 font-mono text-xs mt-2 tracking-widest uppercase">
            [LOBBY] {filtered.length} active rooms
            {isFetching ? " · 更新中…" : ""}
            {isError ? " · API接続エラー" : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="px-6 py-3 bg-primary text-primary-foreground font-black hover:scale-[1.02] transition-transform"
        >
          + ルーム作成
        </button>
      </header>

      {isError ? (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm">
          <p className="font-bold text-destructive">API接続エラー</p>
          <p className="mt-2 text-xs text-white/85 leading-relaxed normal-case font-sans">
            {describeApiFailure(error)}
          </p>
        </div>
      ) : null}

      <div className="glass-panel rounded-xl p-4 flex flex-wrap gap-6">
        <FilterGroup label="表示">
          <Chip active={statusFilter === "all"} onClick={() => setStatusFilter("all")}>
            全体
          </Chip>
          <Chip active={statusFilter === "waiting"} onClick={() => setStatusFilter("waiting")}>
            待機中
          </Chip>
        </FilterGroup>
        <FilterGroup label="STAKE">
          {(["all", 1, 5, 10] as const).map((v) => (
            <Chip key={String(v)} active={stake === v} onClick={() => setStake(v)}>
              {v === "all" ? "全て" : `$${v}`}
            </Chip>
          ))}
        </FilterGroup>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((r) => (
          <RoomCard key={r.id} room={r} />
        ))}
      </div>

      {open && <CreateRoomModal onClose={() => setOpen(false)} />}
    </main>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-mono text-white/40 tracking-widest">{label}</span>
      <div className="flex gap-1">{children}</div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "px-3 py-1 text-xs font-bold border transition-colors " +
        (active
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-white/5 border-border text-white/60 hover:text-white")
      }
    >
      {children}
    </button>
  );
}

function CreateRoomModal({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [stake, setStake] = useState<1 | 5 | 10>(1);
  const [submitting, setSubmitting] = useState(false);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
      role="presentation"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        className="glass-panel rounded-2xl p-8 max-w-md w-full bg-card"
      >
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-black">ルーム作成</h2>
          <button type="button" onClick={onClose} className="text-white/40 hover:text-white">
            ×
          </button>
        </div>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setSubmitting(true);
            try {
              const room = await createRoom({
                stake,
                host: PLAYER_NAME,
                name: "新しいルーム",
              });
              queryClient.setQueryData<Room[]>(roomsQueryKey, (prev) => [room, ...(prev ?? [])]);
              await queryClient.invalidateQueries({ queryKey: roomsQueryKey });
              onClose();
              navigate(`/rooms/${room.id}?mode=player`);
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "ルーム作成に失敗しました");
            } finally {
              setSubmitting(false);
            }
          }}
          className="space-y-5"
        >
          <div>
            <label className="text-[10px] font-mono text-white/40 tracking-widest block mb-2">
              STAKE
            </label>
            <div className="grid grid-cols-3 gap-2">
              {([1, 5, 10] as const).map((v) => (
                <button
                  type="button"
                  key={v}
                  onClick={() => setStake(v)}
                  className={
                    "py-3 font-accent text-2xl border " +
                    (stake === v
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-white/5 border-border text-white/60")
                  }
                >
                  ${v}
                </button>
              ))}
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-primary text-primary-foreground font-black text-lg hover:scale-[1.01] transition-transform disabled:opacity-60"
          >
            {submitting ? "作成中…" : "作成して入室"}
          </button>
        </form>
      </div>
    </div>
  );
}
