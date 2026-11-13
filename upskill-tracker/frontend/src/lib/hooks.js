import { QueryClient, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/data";

export const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false } },
});

export const useStats = () => useQuery({ queryKey: ["stats"], queryFn: api.stats });
export const usePace = () => useQuery({ queryKey: ["pace"], queryFn: api.pace });
export const useOwnership = () => useQuery({ queryKey: ["ownership"], queryFn: api.ownership });
export const useStreak = () => useQuery({ queryKey: ["streak"], queryFn: api.streak });
export const useProblems = () => useQuery({ queryKey: ["problems"], queryFn: api.problems });
export const useVideos = () => useQuery({ queryKey: ["videos"], queryFn: api.videos });
export const useResources = () => useQuery({ queryKey: ["resources"], queryFn: api.resources });
export const useMocks = () => useQuery({ queryKey: ["mocks"], queryFn: api.mocks });
export const useReflections = () => useQuery({ queryKey: ["reflections"], queryFn: api.reflections });
export const useSessions = () => useQuery({ queryKey: ["sessions"], queryFn: api.sessions });

// Tiny app: any write refreshes everything.
export function useWrite(fn) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: fn, onSuccess: () => qc.invalidateQueries() });
}
