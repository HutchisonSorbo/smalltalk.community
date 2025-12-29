import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { User } from "@shared/schema";
import { createClient } from "@/lib/supabase";
import { useEffect } from "react";

function isValidUser(data: unknown): data is User {
  if (typeof data !== "object" || data === null) return false;

  const d = data as Record<string, unknown>;

  // Critical fields validation
  // Note: Supabase might return timestamps as strings (ISO 8601), so we allow string dates
  const hasValidId = typeof d.id === "string" && d.id.length > 0;
  const hasValidEmail = typeof d.email === "string" && d.email.length > 0;
  // userType has default 'musician', checking it exists and is string
  const hasValidUserType = typeof d.userType === "string";
  // isAdmin has default false
  const hasValidIsAdmin = typeof d.isAdmin === "boolean";

  // createdAt check: can be Date object or ISO string that is valid date
  const hasValidCreatedAt =
    d.createdAt instanceof Date ||
    (typeof d.createdAt === "string" && !Number.isNaN(Date.parse(d.createdAt)));

  return (
    hasValidId &&
    hasValidEmail &&
    hasValidUserType &&
    hasValidIsAdmin &&
    hasValidCreatedAt
  );
}

export function useAuth() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["auth-user"],
    queryFn: async () => {
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

      if (!isValidUser(profile)) {
        console.error("Invalid user profile shape:", profile);
        return null;
      }

      return profile;
    },
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Listen for auth state changes to invalidate query
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        queryClient.invalidateQueries({ queryKey: ["auth-user"] });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient, supabase]);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}

// CodeRabbit Audit Trigger
