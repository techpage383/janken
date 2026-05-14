import { useQuery } from "@tanstack/react-query";
import { fetchDashboard } from "@/lib/api";
import { MOCK_MATCHES, MOCK_ROOMS } from "@/lib/mock-data";

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
    featuredRooms: q.data?.featuredRooms ?? MOCK_ROOMS.slice(0, 4),
    recentMatches: q.data?.recentMatches ?? MOCK_MATCHES.slice(0, 6),
    isApiError: q.isError,
    isFetching: q.isFetching,
  };
}
