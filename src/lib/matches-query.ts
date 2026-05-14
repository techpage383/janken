import { useQuery } from "@tanstack/react-query";
import { fetchMatches } from "@/lib/api";

export function useMatchesFeedQuery(limit = 120) {
  return useQuery({
    queryKey: ["matches", "feed", limit],
    queryFn: ({ signal }) => fetchMatches(limit, signal),
    refetchInterval: 4_000,
    staleTime: 0,
    retry: 1,
  });
}

export function useMatchesList(limit = 120) {
  const q = useMatchesFeedQuery(limit);
  return {
    matches: q.data ?? [],
    isError: q.isError,
    isFetching: q.isFetching,
    isPending: q.isPending,
  };
}
