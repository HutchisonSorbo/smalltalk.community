import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { User } from "@shared/schema";
import { createClient } from "@/lib/supabase";
import { useEffect, useMemo } from "react";

function isValidUser(data: unknown): data is User {
  if (typeof data !== "object" || data === null) return false;

  const d = data as Record<string, unknown>;

  // Critical fields validation
  // Note: Supabase might return timestamps as strings (ISO 8601), so we allow string dates
  const hasValidId = typeof d.id === "string" && d.id.length > 0;
  const hasValidEmail = typeof d.email === "string" && d.email.length > 0;
  // userType has default 'individual', checking it exists and is string
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
  const supabase = useMemo(() => createClient(), []);

  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["auth-user"],
    queryFn: async () => {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

      if (authError || !authUser) {
        return null;
      }

      // Fetch profile from public.users table
      const { data: profiles, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("id", authUser.id);

      if (profileError) {
        console.error("Error fetching user profile:", {
          message: profileError.message,
          code: profileError.code,
          details: profileError.details,
          hint: profileError.hint,
          authUser: authUser
        });
        return null;
      }

      let profile: User | null = null;

      if (profiles && profiles.length > 0) {
        const raw = profiles[0];
        // Map snake_case from Supabase -> camelCase for application
        profile = {
          ...raw,
          firstName: raw.first_name,
          lastName: raw.last_name,
          profileImageUrl: raw.profile_image_url,
          dateOfBirth: raw.date_of_birth ? new Date(raw.date_of_birth) : null,
          userType: raw.user_type,
          accountType: raw.account_type,
          accountTypeSpecification: raw.account_type_specification,
          onboardingCompleted: raw.onboarding_completed,
          organisationName: raw.organisation_name,
          isAdmin: raw.is_admin,
          isMinor: raw.is_minor,
          messagePrivacy: raw.message_privacy,
          lastActiveAt: raw.last_active_at ? new Date(raw.last_active_at) : null,
          createdAt: raw.created_at ? new Date(raw.created_at) : null,
          updatedAt: raw.updated_at ? new Date(raw.updated_at) : null,
        } as User;
      }

      if (!profile) {
        console.warn("No profile found for user:", authUser.id);
        return null;
      }

      if (!isValidUser(profile)) {
        console.error("Invalid user profile shape. Received:", profile);
        console.error("Validation details:", {
          id: typeof (profile as any).id,
          email: typeof (profile as any).email,
          userType: typeof (profile as any).userType,
          isAdmin: typeof (profile as any).isAdmin,
          createdAt: (profile as any).createdAt,
          // Check snake_case versions too
          user_type: typeof (profile as any).user_type,
          is_admin: typeof (profile as any).is_admin,
          created_at: (profile as any).created_at
        });
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
      if (
        event === "SIGNED_IN" ||
        event === "SIGNED_OUT" ||
        event === "TOKEN_REFRESHED" ||
        event === "INITIAL_SESSION" ||
        event === "USER_UPDATED"
      ) {
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
