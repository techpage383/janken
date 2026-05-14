import { Link } from "react-router-dom";
import type { Room } from "@/lib/mock-data";

export function RoomCard({ room }: { room: Room }) {
  const isFull = room.players.length >= room.maxPlayers;
  return (
    <div className="glass-panel p-5 rounded-xl hover:border-primary/50 transition-colors group">
      <div className="flex justify-between items-start mb-4">
        <div className="min-w-0">
          <span className="text-[10px] font-mono text-white/40 block mb-1 uppercase tracking-widest">
            Host: {room.host}
          </span>
          <h4 className="text-lg font-bold truncate">{room.name}</h4>
        </div>
        <div className="font-accent text-3xl text-primary shrink-0 ml-3">${room.stake}</div>
      </div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {Array.from({ length: room.maxPlayers }).map((_, i) => (
              <div
                key={i}
                className={
                  i < room.players.length
                    ? "size-8 rounded-full bg-zinc-700 border-2 border-background flex items-center justify-center text-[10px] font-bold"
                    : "size-8 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center text-[10px] text-white/20"
                }
              >
                {i < room.players.length ? room.players[i][0].toUpperCase() : "+"}
              </div>
            ))}
          </div>
          <span className="text-sm font-bold text-white/60">
            {room.players.length}/{room.maxPlayers}
            <span className="text-[10px] text-white/20 ml-1">PLAYERS</span>
          </span>
        </div>
        {isFull ? (
          <span className="px-3 py-1 bg-white/5 text-white/40 text-[10px] font-black tracking-tighter rounded">
            対戦中
          </span>
        ) : (
          <span className="px-3 py-1 bg-success/20 text-success text-[10px] font-black tracking-tighter rounded">
            募集中
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Link
          to={`/rooms/${room.id}?mode=player`}
          className={
            "py-2 text-center text-[11px] font-black tracking-widest uppercase rounded-md transition-colors " +
            (isFull
              ? "bg-white/5 text-white/30 cursor-not-allowed pointer-events-none"
              : "bg-primary text-primary-foreground hover:opacity-90")
          }
        >
          🎮 参加する
        </Link>
        <Link
          to={`/rooms/${room.id}?mode=spectator`}
          className="py-2 text-center text-[11px] font-black tracking-widest uppercase rounded-md bg-secondary/20 text-secondary border border-secondary/40 hover:bg-secondary/30 transition-colors"
        >
          👁 観戦する
        </Link>
      </div>
    </div>
  );
}
