import type { AvatarPreset, Match, PlayerProfile, Room, StakeTier } from "@/lib/types";
import { PLAYER_NAME } from "@/lib/player";

export function getApiBase(): string {
  const raw = import.meta.env.VITE_API_URL;
  if (raw === undefined || raw === "") return "";
  return raw.replace(/\/$/, "");
}

export type MeResponse = {
  profile: PlayerProfile;
  matches: Match[];
};

export type DashboardResponse = {
  featuredRooms: Room[];
  recentMatches: Match[];
};

async function getJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${getApiBase()}${path}`, { credentials: "include", ...init });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `${init?.method ?? "GET"} ${path} failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export function describeApiFailure(error: unknown): string {
  const base = getApiBase() || "(same origin / Vite proxy)";
  if (error instanceof Error) {
    if (error.message.includes("404") && error.message.includes("/api/me")) {
      return `プレイヤー「${PLAYER_NAME}」が見つかりません。MySQL を起動し、npm run dev:server でシードを確認してください。`;
    }
    if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
      return `API に接続できません。npm run dev で client(:8080) と server(:3000) の両方を起動し、MySQL(XAMPP) が動いているか確認してください。`;
    }
    return `${error.message}（接続先: ${base}）`;
  }
  return `API 接続を確認してください（${base}）。`;
}

export const api = {
  rooms: (signal?: AbortSignal) =>
    getJson<{ rooms: Room[] }>("/api/rooms", { signal }).then((b) => b.rooms),
  room: (id: string, signal?: AbortSignal) =>
    getJson<{ room: Room }>(`/api/rooms/${encodeURIComponent(id)}`, { signal }).then(
      (b) => b.room,
    ),
  createRoom: (input: { stake: StakeTier; host?: string; name?: string }) =>
    getJson<{ room: Room }>("/api/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }).then((b) => b.room),
  matches: (limit: number, signal?: AbortSignal) =>
    getJson<{ matches: Match[] }>(`/api/matches?limit=${limit}`, { signal }).then((b) => b.matches),
  dashboard: (signal?: AbortSignal) =>
    getJson<DashboardResponse>("/api/stats/dashboard", { signal }),
  me: (playerName: string, signal?: AbortSignal) =>
    getJson<MeResponse>("/api/me", {
      signal,
      headers: { "X-Player-Name": playerName },
    }),
  updateAvatar: (playerName: string, avatar: AvatarPreset) =>
    getJson<{ profile: PlayerProfile }>("/api/me/avatar", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "X-Player-Name": playerName },
      body: JSON.stringify({ avatar }),
    }).then((b) => b.profile),
};
