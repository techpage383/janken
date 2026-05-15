import type { Match, Room } from "@/lib/janken-types";

/**
 * Base URL for API requests.
 * - Dev (default): empty string → same origin + Vite proxy `/api` → Express
 * - Production: empty → same host as the built SPA (Express serves `dist/`)
 * - Override: set VITE_API_URL=http://localhost:3000 if you skip the proxy
 */
export function getApiBase(): string {
  const raw = import.meta.env.VITE_API_URL;
  if (raw === undefined || raw === "") return "";
  return raw.replace(/\/$/, "");
}

export type MeResponse = {
  profile: { name: string; wallet: string; balance: number };
  matches: Match[];
};

export type DashboardResponse = {
  featuredRooms: Room[];
  recentMatches: Match[];
};

export async function fetchRoomById(id: string, signal?: AbortSignal): Promise<Room> {
  const res = await fetch(`${getApiBase()}/api/rooms/${encodeURIComponent(id)}`, {
    credentials: "include",
    signal,
  });
  if (!res.ok) {
    throw new Error(`GET /api/rooms/:id failed: ${res.status}`);
  }
  const body = (await res.json()) as { room: Room };
  return body.room;
}

export async function fetchRooms(signal?: AbortSignal): Promise<Room[]> {
  const res = await fetch(`${getApiBase()}/api/rooms`, {
    credentials: "include",
    signal,
  });
  if (!res.ok) {
    throw new Error(`GET /api/rooms failed: ${res.status}`);
  }
  const body = (await res.json()) as { rooms: Room[] };
  return body.rooms;
}

export async function createRoom(input: {
  stake: 1 | 5 | 10;
  host?: string;
  name?: string;
}): Promise<Room> {
  const res = await fetch(`${getApiBase()}/api/rooms`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      stake: input.stake,
      host: input.host,
      name: input.name,
    }),
  });
  const body = (await res.json()) as { room?: Room; error?: string };
  if (!res.ok) {
    throw new Error(body.error ?? `POST /api/rooms failed: ${res.status}`);
  }
  if (!body.room) throw new Error("Invalid response from server");
  return body.room;
}

export async function fetchDashboard(signal?: AbortSignal): Promise<DashboardResponse> {
  const res = await fetch(`${getApiBase()}/api/stats/dashboard`, {
    credentials: "include",
    signal,
  });
  if (!res.ok) {
    throw new Error(`GET /api/stats/dashboard failed: ${res.status}`);
  }
  return res.json() as Promise<DashboardResponse>;
}

export async function fetchMatches(limit = 80, signal?: AbortSignal): Promise<Match[]> {
  const res = await fetch(
    `${getApiBase()}/api/matches?limit=${encodeURIComponent(String(limit))}`,
    {
      credentials: "include",
      signal,
    },
  );
  if (!res.ok) {
    throw new Error(`GET /api/matches failed: ${res.status}`);
  }
  const body = (await res.json()) as { matches: Match[] };
  return body.matches;
}

export async function fetchMe(playerName: string, signal?: AbortSignal): Promise<MeResponse> {
  const res = await fetch(`${getApiBase()}/api/me`, {
    credentials: "include",
    signal,
    headers: { "X-Player-Name": playerName },
  });
  if (!res.ok) {
    throw new Error(`GET /api/me failed: ${res.status}`);
  }
  return res.json() as Promise<MeResponse>;
}
