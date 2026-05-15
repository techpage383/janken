import { useQuery } from "@tanstack/react-query";
import { fetchDashboard } from "@/lib/api";

export function useDashboardQuery() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: ({ signal }) => fetchDashboard(signal),
    staleTime: 20_000,
    retry: 1,
  });
}

export function useDashboardData() {
  const q = useDashboardQuery();
  return {
    featuredRooms: q.data?.featuredRooms ?? [],
    recentMatches: q.data?.recentMatches ?? [],
    isError: q.isError,
    error: q.error,
    isFetching: q.isFetching,
    isPending: q.isPending,
  };
}
