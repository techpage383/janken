import { useQuery } from "@tanstack/react-query";
import { fetchRoomById } from "@/lib/api";

export function useRoomDetailQuery(roomId: string | undefined) {
  return useQuery({
    queryKey: ["room", roomId],
    queryFn: ({ signal }) => fetchRoomById(roomId!, signal),
    enabled: Boolean(roomId),
    staleTime: 10_000,
    retry: 1,
  });
}
