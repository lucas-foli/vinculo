import Nav from "@/components/vinculo/Nav";
import Footer from "@/components/vinculo/Footer";
import VinculoProtectedRoute from "@/components/VinculoProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import { useVinculoProfile } from "@/hooks/useVinculoProfile";
import { useMatches } from "@/hooks/useMatches";
import { supabase } from "@/integrations/supabase/client";
import type { Creator } from "@/types/vinculo";
import { getOrCreateThread } from "@/hooks/useVinculoChat";
import { MessageCircle, RefreshCw, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function MatchCard({
  match,
  onContact,
}: {
  match: { agency: { name: string; niches: string[]; description: string | null; logo_url: string | null; slug: string; user_id: string }; score: number; reason: string };
  onContact: (agencyUserId: string) => void;
}) {
  const score = Math.round(match.score);
  return (
    <div className="border-technical bg-white animate-fade-in group">
      <div className="aspect-[4/3] bg-[#0F172A]/5 relative flex items-center justify-center overflow-hidden">
        {match.agency.logo_url ? (
          <img src={match.agency.logo_url} alt={match.agency.name} className="object-cover w-full h-full" />
        ) : (
          <span className="font-display text-6xl text-[#0F172A]/15">{match.agency.name.charAt(0)}</span>
        )}
        <div className="absolute top-3 right-3 badge-match font-technical text-xs">
          {score}% MATCH
        </div>
      </div>
      <div className="p-5">
        <Link to={`/agencias/${match.agency.slug}`} className="font-serif text-xl text-[#0F172A] hover:text-[#B45309] transition-colors flex items-center gap-1.5">
          {match.agency.name} <ExternalLink size={13} className="opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>
        <div className="flex flex-wrap gap-1.5 mt-2.5">
          {match.agency.niches.slice(0, 3).map((n) => (
            <span key={n} className="border border-[#0F172A]/15 px-2 py-0.5 font-technical text-[10px] text-[#0F172A]/50">
              {n}
            </span>
          ))}
        </div>
        <p className="text-sm text-[#0F172A]/55 mt-3 font-sans leading-relaxed line-clamp-3">
          {match.reason}
        </p>

        {/* Score bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1">
            <span className="font-technical text-[10px] text-[#0F172A]/40">Compatibilidade</span>
            <span className="font-technical text-[10px] text-[#B45309]">{score}%</span>
          </div>
          <div className="h-1 bg-[#0F172A]/8 w-full">
            <div
              className="h-full bg-[#B45309] transition-all duration-700"
              style={{ width: `${score}%` }}
            />
          </div>
        </div>

        <button
          onClick={() => onContact(match.agency.user_id)}
          className="mt-5 w-full border border-[#0F172A]/15 py-2.5 font-technical text-[10px] text-[#0F172A]/60 hover:bg-[#B45309] hover:text-[#F8F5F2] hover:border-[#B45309] transition-all flex items-center justify-center gap-2"
        >
          <MessageCircle size={12} /> Iniciar conversa
        </button>
      </div>
    </div>
  );
}

function MatchesContent() {
  const { user } = useAuth();
  const { profile } = useVinculoProfile(user?.id);
  const { matches, isLoading, fetchExistingMatches, runMatching } = useMatches(user?.id);
  const [creator, setCreator] = useState<Creator | null>(null);
  const [loadingCreator, setLoadingCreator] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from("creators").select("*").eq("user_id", user.id).maybeSingle(),
      fetchExistingMatches(),
    ]).then(([{ data }]) => {
      if (data) setCreator(data as unknown as Creator);
      setLoadingCreator(false);
    });
  }, [user]);

  const handleRunMatch = async () => {
    if (!creator) return;
    await runMatching(creator);
  };

  const handleContact = async (agencyUserId: string) => {
    if (!user) return;
    const threadId = await getOrCreateThread(user.id, agencyUserId);
    navigate(`/chat/${threadId}`);
  };

  if (loadingCreator) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-8 h-8 border-2 border-[#B45309] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="py-32 text-center">
        <p className="font-display text-3xl text-[#0F172A]">Complete seu perfil primeiro</p>
        <p className="font-sans text-[#0F172A]/50 mt-3">Preencha as informações para receber os matches</p>
        <Link
          to="/onboarding/criador"
          className="mt-8 inline-flex items-center gap-2 bg-[#B45309] text-[#F8F5F2] px-8 py-4 label-uppercase hover:bg-[#92400e] transition-colors"
        >
          Completar perfil
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Profile summary */}
      <div className="border-technical bg-white p-6 mb-10">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="label-uppercase text-[#0F172A]/40 mb-2">Seu perfil</div>
            <div className="flex flex-wrap gap-2">
              {creator.niche && (
                <span className="badge-match">{creator.niche}</span>
              )}
              {creator.platforms?.map((p) => (
                <span key={p} className="border border-[#0F172A]/15 px-2 py-0.5 font-technical text-[10px] text-[#0F172A]/60">
                  {p}
                </span>
              ))}
              {creator.audience_size_range && (
                <span className="border border-[#0F172A]/15 px-2 py-0.5 font-technical text-[10px] text-[#0F172A]/60">
                  {creator.audience_size_range}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={handleRunMatch}
            disabled={isLoading}
            className="inline-flex items-center gap-2 border border-[#0F172A]/15 px-5 py-2.5 label-uppercase text-[#0F172A]/60 hover:border-[#B45309] hover:text-[#B45309] transition-all disabled:opacity-40"
          >
            <RefreshCw size={12} className={isLoading ? "animate-spin" : ""} />
            {isLoading ? "Calculando..." : "Recalcular matches"}
          </button>
        </div>
      </div>

      {/* Matches grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="border-technical animate-pulse">
              <div className="aspect-[4/3] bg-[#0F172A]/5" />
              <div className="p-5 space-y-3">
                <div className="h-5 bg-[#0F172A]/8 rounded w-3/4" />
                <div className="h-3 bg-[#0F172A]/5 rounded w-1/2" />
                <div className="h-1 bg-[#0F172A]/5 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : matches.length === 0 ? (
        <div className="py-24 text-center border-technical">
          <p className="font-display text-3xl text-[#0F172A]/40">Nenhum match ainda</p>
          <p className="font-sans text-[#0F172A]/40 mt-3">Clique em "Recalcular matches" para gerar seu ranking</p>
          <button
            onClick={handleRunMatch}
            className="mt-8 inline-flex items-center gap-2 bg-[#B45309] text-[#F8F5F2] px-8 py-4 label-uppercase hover:bg-[#92400e] transition-colors"
          >
            <RefreshCw size={14} /> Gerar matches agora
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {matches.map((m, i) => (
            <div key={m.id} style={{ animationDelay: `${i * 60}ms` }}>
              <MatchCard match={m} onContact={handleContact} />
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export default function MatchesPage() {
  return (
    <VinculoProtectedRoute>
      <div className="min-h-screen section-cream">
        <Nav />
        <div className="bg-[#0F172A] pt-24 pb-16">
          <div className="container mx-auto px-6">
            <div className="label-uppercase text-[#B45309] mb-4 flex items-center gap-2">
              <span className="inline-block w-6 h-px bg-[#B45309]" />
              IA · Compatibilidade
            </div>
            <h1 className="font-display text-[clamp(2.5rem,5vw,5rem)] text-[#F8F5F2] leading-tight">
              Seus Matches
            </h1>
          </div>
        </div>
        <div className="container mx-auto px-6 py-12">
          <MatchesContent />
        </div>
        <Footer />
      </div>
    </VinculoProtectedRoute>
  );
}
