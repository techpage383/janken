import { useQuery } from "@tanstack/react-query";
import { fetchRooms } from "@/lib/api";
import { MOCK_ROOMS } from "@/lib/mock-data";

export const roomsQueryKey = ["rooms"] as const;

export function useRoomsQuery() {
  return useQuery({
    queryKey: roomsQueryKey,
    queryFn: ({ signal }) => fetchRooms(signal),
    staleTime: 15_000,
    retry: 1,
  });
}

/** List for UI: API data when available, otherwise mock (including while loading or on error). */
export function useRoomsList() {
  const q = useRoomsQuery();
  return {
    rooms: q.data ?? MOCK_ROOMS,
    isApiError: q.isError,
    isFetching: q.isFetching,
    refetch: q.refetch,
  };
}
