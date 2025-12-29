import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { User } from "@shared/schema";
import { createClient } from "@/lib/supabase";
import { useEffect } from "react"; // Ensure react imports if needed

export function useAuth() {
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["auth-user"],
    queryFn: async () => {
      const supabase = createClient();
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

      if (authError || !authUser) {
        return null;
      }

      // Fetch profile from public.users table
      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("id", authUser.id)
        .single();

      if (profileError) {
        // If profile doesn't exist but auth does, we might want to return basic info or null
        // For now, logging error and returning null to be safe
        console.error("Error fetching user profile:", profileError);
        return null;
      }

      return profile as User;
    },
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Listen for auth state changes to invalidate query
  useEffect(() => {
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        queryClient.invalidateQueries({ queryKey: ["auth-user"] });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}

// CodeRabbit Audit Trigger
