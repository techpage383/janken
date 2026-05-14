import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { MOCK_ROOMS, type Room } from "@/lib/mock-data";
import { RoomCard } from "./index";

export const Route = createFileRoute("/rooms")({
  head: () => ({
    meta: [
      { title: "ロビー — BLOCK-JANKEN" },
      { name: "description", content: "稼働中のじゃんけんルーム一覧。参加・観戦・新規作成。" },
    ],
  }),
  component: RoomsPage,
});

type StakeFilter = "all" | 1 | 5 | 10;

function RoomsPage() {
  const [stake, setStake] = useState<StakeFilter>("all");
  const [size, setSize] = useState<"all" | 2 | 3>("all");
  const [open, setOpen] = useState(false);
  const [rooms, setRooms] = useState<Room[]>(MOCK_ROOMS);

  const filtered = useMemo(
    () =>
      rooms.filter(
        (r) =>
          (stake === "all" || r.stake === stake) &&
          (size === "all" || r.maxPlayers === size),
      ),
    [rooms, stake, size],
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
          </p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="px-6 py-3 bg-primary text-primary-foreground font-black hover:scale-[1.02] transition-transform"
        >
          + ルーム作成
        </button>
      </header>

      <div className="glass-panel rounded-xl p-4 flex flex-wrap gap-4">
        <FilterGroup label="STAKE">
          {(["all", 1, 5, 10] as const).map((v) => (
            <Chip key={String(v)} active={stake === v} onClick={() => setStake(v)}>
              {v === "all" ? "全て" : `$${v}`}
            </Chip>
          ))}
        </FilterGroup>
        <FilterGroup label="PLAYERS">
          {(["all", 2, 3] as const).map((v) => (
            <Chip key={String(v)} active={size === v} onClick={() => setSize(v)}>
              {v === "all" ? "全て" : `${v}人`}
            </Chip>
          ))}
        </FilterGroup>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((r) => <RoomCard key={r.id} room={r} />)}
      </div>

      {open && <CreateRoomModal onClose={() => setOpen(false)} onCreate={(r) => { setRooms([r, ...rooms]); setOpen(false); }} />}
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

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
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

function CreateRoomModal({ onClose, onCreate }: { onClose: () => void; onCreate: (r: Room) => void }) {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [stake, setStake] = useState<1 | 5 | 10>(1);
  const [max, setMax] = useState<2 | 3>(2);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass-panel rounded-2xl p-8 max-w-md w-full bg-card"
      >
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-black">ルーム作成</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white">×</button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const id = `room-${Date.now()}`;
            const newRoom: Room = {
              id,
              name: name || "新しいルーム",
              host: "Player_404",
              maxPlayers: max,
              stake,
              players: ["Player_404"],
              status: "waiting",
              createdAt: Date.now(),
            };
            onCreate(newRoom);
            navigate({ to: "/rooms/$roomId", params: { roomId: id } });
          }}
          className="space-y-5"
        >
          <div>
            <label className="text-[10px] font-mono text-white/40 tracking-widest block mb-2">ROOM NAME</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: 真剣勝負ルーム"
              className="w-full bg-white/5 border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="text-[10px] font-mono text-white/40 tracking-widest block mb-2">PLAYERS</label>
            <div className="grid grid-cols-2 gap-2">
              {([2, 3] as const).map((v) => (
                <button
                  type="button"
                  key={v}
                  onClick={() => setMax(v)}
                  className={
                    "py-3 font-black border " +
                    (max === v ? "bg-primary text-primary-foreground border-primary" : "bg-white/5 border-border text-white/60")
                  }
                >
                  {v}人対戦
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[10px] font-mono text-white/40 tracking-widest block mb-2">STAKE</label>
            <div className="grid grid-cols-3 gap-2">
              {([1, 5, 10] as const).map((v) => (
                <button
                  type="button"
                  key={v}
                  onClick={() => setStake(v)}
                  className={
                    "py-3 font-accent text-2xl border " +
                    (stake === v ? "bg-primary text-primary-foreground border-primary" : "bg-white/5 border-border text-white/60")
                  }
                >
                  ${v}
                </button>
              ))}
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-4 bg-primary text-primary-foreground font-black text-lg hover:scale-[1.01] transition-transform"
          >
            作成して入室
          </button>
        </form>
      </div>
    </div>
  );
}
