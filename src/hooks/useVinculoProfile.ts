import { supabase } from "@/integrations/supabase/client";
import type { Profile, UserType } from "@/types/vinculo";
import { useEffect, useState } from "react";

export function useVinculoProfile(userId: string | undefined) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    supabase
      .from("profiles")
      .select("id, user_type, display_name, avatar_url, created_at")
      .eq("id", userId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!error && data) {
          setProfile(data as unknown as Profile);
        }
        setIsLoading(false);
      });
  }, [userId]);

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!userId) return;
    const { data, error } = await supabase
      .from("profiles")
      .update(updates as Record<string, unknown>)
      .eq("id", userId)
      .select()
      .maybeSingle();
    if (!error && data) setProfile(data as unknown as Profile);
    return { error };
  };

  const setUserType = async (userType: UserType) => {
    return updateProfile({ user_type: userType });
  };

  return { profile, isLoading, updateProfile, setUserType };
}
