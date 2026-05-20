import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import VinculoProtectedRoute from "./components/VinculoProtectedRoute";
import ConfigBanner from "./components/vinculo/ConfigBanner";
import NotFound from "./pages/NotFound";

// Vínculo pages
import Landing from "@/pages/vinculo/Landing";
import AgencyDirectory from "@/pages/vinculo/AgencyDirectory";
import AgencyProfile from "@/pages/vinculo/AgencyProfile";
import VinculoAuth from "@/pages/vinculo/Auth";
import CreatorOnboarding from "@/pages/vinculo/CreatorOnboarding";
import AgencyOnboarding from "@/pages/vinculo/AgencyOnboarding";
import MatchesPage from "@/pages/vinculo/Matches";
import AgencyDashboard from "@/pages/vinculo/AgencyDashboard";
import ChatPage from "@/pages/vinculo/Chat";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ConfigBanner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Landing />} />
            <Route path="/agencias" element={<AgencyDirectory />} />
            <Route path="/agencias/:slug" element={<AgencyProfile />} />
            <Route path="/auth" element={<VinculoAuth />} />

            {/* Onboarding */}
            <Route path="/onboarding/criador" element={<VinculoProtectedRoute><CreatorOnboarding /></VinculoProtectedRoute>} />
            <Route path="/onboarding/agencia" element={<VinculoProtectedRoute><AgencyOnboarding /></VinculoProtectedRoute>} />

            {/* Creator */}
            <Route path="/matches" element={<MatchesPage />} />

            {/* Agency */}
            <Route path="/dashboard" element={<AgencyDashboard />} />

            {/* Chat */}
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/chat/:threadId" element={<ChatPage />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
