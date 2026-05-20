import { useAuthContext } from "@/contexts/AuthContext";

export const useAuth = () => {
  const { user, session, isLoading, signOut } = useAuthContext();
  return {
    user, session, isLoading,
    isLoaded: !isLoading,
    isSignedIn: Boolean(user),
    accessToken: session?.access_token ?? null,
    signOut,
  };
};
