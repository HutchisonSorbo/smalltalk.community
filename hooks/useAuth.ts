import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export function useAuth() {
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,

    staleTime: 60 * 60 * 1000, // 1 hour (User data rarely changes)
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
    refetchOnWindowFocus: false, // Don't refetch on window focus to prevent flickering
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}

// CodeRabbit Audit Trigger
