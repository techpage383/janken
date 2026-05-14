import { useQuery } from "@tanstack/react-query";
import { fetchMe } from "@/lib/api";
import { ME, MY_MATCHES } from "@/lib/mock-data";

export function useMeQuery(playerName = ME.name) {
  return useQuery({
    queryKey: ["me", playerName],
    queryFn: ({ signal }) => fetchMe(playerName, signal),
    staleTime: 20_000,
    retry: 1,
  });
}

export function useMeData(playerName = ME.name) {
  const q = useMeQuery(playerName);
  return {
    profile: q.data?.profile ?? {
      name: ME.name,
      wallet: ME.wallet,
      balance: ME.balance,
    },
    matches: q.data?.matches ?? MY_MATCHES,
    isApiError: q.isError,
  };
}
