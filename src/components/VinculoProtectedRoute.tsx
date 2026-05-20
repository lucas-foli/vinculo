import { useAuth } from "@/hooks/useAuth";
import { Navigate, useLocation } from "react-router-dom";

interface Props {
  children: React.ReactNode;
  requireUserType?: "creator" | "agency";
}

export default function VinculoProtectedRoute({ children }: Props) {
  const { isLoaded, isSignedIn } = useAuth();
  const location = useLocation();

  if (!isLoaded) {
    return (
      <div className="min-h-screen section-navy flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#B45309] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="font-technical text-[#F8F5F2]/60">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
