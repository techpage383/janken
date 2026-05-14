import { useQuery } from "@tanstack/react-query";
import { fetchMe } from "@/lib/api";
import { PLAYER_NAME } from "@/lib/player";

export function useMeQuery(playerName = PLAYER_NAME) {
  return useQuery({
    queryKey: ["me", playerName],
    queryFn: ({ signal }) => fetchMe(playerName, signal),
    staleTime: 20_000,
    retry: 1,
  });
}

export function useMeData(playerName = PLAYER_NAME) {
  const q = useMeQuery(playerName);
  return {
    profile: q.data?.profile,
    matches: q.data?.matches ?? [],
    isError: q.isError,
    isPending: q.isPending,
    isFetching: q.isFetching,
    refetch: q.refetch,
  };
}
