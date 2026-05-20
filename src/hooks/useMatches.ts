import { supabase } from "@/integrations/supabase/client";
import type { Agency, Creator, Match } from "@/types/vinculo";
import { useState } from "react";

export function useMatches(creatorId: string | undefined) {
  const [matches, setMatches] = useState<(Match & { agency: Agency })[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchExistingMatches = async () => {
    if (!creatorId) return;
    setIsLoading(true);
    const { data } = await supabase
      .from("matches")
      .select("*, agencies(*)")
      .eq("creator_id", creatorId)
      .order("score", { ascending: false });

    if (data) {
      setMatches(
        data.map((m) => ({
          ...(m as unknown as Match),
          agency: (m as Record<string, unknown>).agencies as Agency,
        }))
      );
    }
    setIsLoading(false);
  };

  const runMatching = async (creator: Creator): Promise<void> => {
    if (!creatorId) return;
    setIsLoading(true);

    try {
      const { data: agenciesData } = await supabase.from("agencies").select("*");
      const agencies = (agenciesData ?? []) as unknown as Agency[];

      if (agencies.length === 0) {
        setIsLoading(false);
        return;
      }

      // Client-side scoring (fallback when no edge function)
      const scored = agencies.map((agency) => {
        let score = 0;
        const reasons: string[] = [];

        // Niche overlap
        const creatorNiches = [creator.niche, ...(creator.sub_niches ?? [])].filter(Boolean) as string[];
        const nicheOverlap = creatorNiches.filter((n) => agency.niches.includes(n));
        if (nicheOverlap.length > 0) {
          score += nicheOverlap.length * 30;
          reasons.push(`Nichos compatíveis: ${nicheOverlap.join(", ")}`);
        }

        // Goal alignment with services
        const goalMatch = (creator.goals ?? []).filter((g) =>
          agency.services.some((s) => s.toLowerCase().includes(g.toLowerCase()))
        );
        if (goalMatch.length > 0) {
          score += goalMatch.length * 20;
          reasons.push(`Serviços alinhados: ${goalMatch.join(", ")}`);
        }

        // Featured bonus
        if (agency.featured) score += 10;

        // Normalize to 0-100
        const normalizedScore = Math.min(100, score);

        return {
          agency,
          score: normalizedScore,
          reason: reasons.length > 0 ? reasons.join(". ") + "." : "Agência com perfil diversificado e compatível.",
        };
      });

      // Sort and take top 8
      const top = scored
        .filter((s) => s.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 8);

      if (top.length === 0) {
        // Fallback: return all agencies with base score
        const fallback = agencies.slice(0, 5).map((agency) => ({
          agency,
          score: 65 + Math.floor(Math.random() * 20),
          reason: "Agência ativa no marketplace com experiência em múltiplos nichos.",
        }));
        top.push(...fallback);
      }

      // Delete existing matches and insert new ones
      await supabase.from("matches").delete().eq("creator_id", creatorId);

      const toInsert = top.map((m) => ({
        creator_id: creatorId,
        agency_id: m.agency.user_id,
        score: m.score,
        reason: m.reason,
      }));

      await supabase.from("matches").insert(toInsert);
      await fetchExistingMatches();
    } catch {
      setIsLoading(false);
    }
  };

  return { matches, isLoading, fetchExistingMatches, runMatching };
}
