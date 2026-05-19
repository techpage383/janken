/** All React Query hooks in one place (easier for beginners to follow). */
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { PLAYER_NAME } from "@/lib/player";

export const roomsQueryKey = ["rooms"] as const;
export const meQueryKey = (playerName: string) => ["me", playerName] as const;

export function useDashboard() {
  const q = useQuery({
    queryKey: ["dashboard"],
    queryFn: ({ signal }) => api.dashboard(signal),
    staleTime: 20_000,
  });
  return {
    featuredRooms: q.data?.featuredRooms ?? [],
    recentMatches: q.data?.recentMatches ?? [],
    isError: q.isError,
    error: q.error,
    isFetching: q.isFetching,
  };
}

export function useRooms() {
  const q = useQuery({
    queryKey: roomsQueryKey,
    queryFn: ({ signal }) => api.rooms(signal),
    staleTime: 15_000,
  });
  return {
    rooms: q.data ?? [],
    isError: q.isError,
    error: q.error,
    isFetching: q.isFetching,
  };
}

export function useRoom(id: string | undefined) {
  return useQuery({
    queryKey: ["room", id],
    queryFn: ({ signal }) => api.room(id!, signal),
    enabled: Boolean(id),
    staleTime: 10_000,
  });
}

export function useMatches(limit = 120) {
  const q = useQuery({
    queryKey: ["matches", limit],
    queryFn: ({ signal }) => api.matches(limit, signal),
    refetchInterval: 4_000,
    staleTime: 0,
  });
  return {
    matches: q.data ?? [],
    isError: q.isError,
    error: q.error,
    isFetching: q.isFetching,
  };
}

export function useMe(playerName = PLAYER_NAME) {
  const q = useQuery({
    queryKey: meQueryKey(playerName),
    queryFn: ({ signal }) => api.me(playerName, signal),
    staleTime: 20_000,
  });
  return {
    profile: q.data?.profile,
    matches: q.data?.matches ?? [],
    isError: q.isError,
    error: q.error,
    isPending: q.isPending,
  };
}
