import { useQuery } from "@tanstack/react-query";
import { fetchRooms } from "@/lib/api";

export const roomsQueryKey = ["rooms"] as const;

export function useRoomsQuery() {
  return useQuery({
    queryKey: roomsQueryKey,
    queryFn: ({ signal }) => fetchRooms(signal),
    staleTime: 15_000,
    retry: 1,
  });
}

export function useRoomsList() {
  const q = useRoomsQuery();
  return {
    rooms: q.data ?? [],
    isError: q.isError,
    isFetching: q.isFetching,
    isPending: q.isPending,
    refetch: q.refetch,
  };
}
