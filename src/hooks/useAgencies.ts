import { supabase } from "@/integrations/supabase/client";
import type { Agency } from "@/types/vinculo";
import { useEffect, useState } from "react";

export function useAgencies(options?: { featured?: boolean; search?: string; niches?: string[] }) {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let query = supabase
      .from("agencies")
      .select("*")
      .order("featured", { ascending: false })
      .order("name");

    if (options?.featured) {
      query = query.eq("featured", true);
    }

    query.then(({ data, error }) => {
      if (!error && data) {
        let filtered = data as unknown as Agency[];
        if (options?.search) {
          const s = options.search.toLowerCase();
          filtered = filtered.filter(
            (a) =>
              a.name.toLowerCase().includes(s) ||
              (a.description ?? "").toLowerCase().includes(s)
          );
        }
        if (options?.niches && options.niches.length > 0) {
          filtered = filtered.filter((a) =>
            options.niches!.some((n) => a.niches.includes(n))
          );
        }
        setAgencies(filtered);
      }
      setIsLoading(false);
    });
  }, [options?.search, options?.featured, options?.niches?.join(",")]);

  return { agencies, isLoading };
}

export function useAgency(slug: string | undefined) {
  const [agency, setAgency] = useState<Agency | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!slug) {
      setIsLoading(false);
      return;
    }

    supabase
      .from("agencies")
      .select("*")
      .eq("slug", slug)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!error && data) setAgency(data as unknown as Agency);
        setIsLoading(false);
      });
  }, [slug]);

  return { agency, isLoading };
}

export async function upsertAgency(userId: string, data: Partial<Agency>) {
  const slug = data.name
    ? data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
    : undefined;

  return supabase
    .from("agencies")
    .upsert({ user_id: userId, slug, ...data } as Record<string, unknown>)
    .select()
    .maybeSingle();
}
