import Nav from "@/components/vinculo/Nav";
import Footer from "@/components/vinculo/Footer";
import VinculoProtectedRoute from "@/components/VinculoProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import { useVinculoProfile } from "@/hooks/useVinculoProfile";
import { useThreads } from "@/hooks/useVinculoChat";
import { supabase } from "@/integrations/supabase/client";
import type { Agency, Deal } from "@/types/vinculo";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MessageCircle, TrendingUp, Users, DollarSign } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function AgencyDashboardContent() {
  const { user } = useAuth();
  const { profile } = useVinculoProfile(user?.id);
  const { threads, isLoading: threadsLoading } = useThreads(user?.id, "agency");
  const [agency, setAgency] = useState<Agency | null>(null);
  const [deals, setDeals] = useState<Deal[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from("agencies").select("*").eq("user_id", user.id).maybeSingle().then(({ data }) => {
      if (data) setAgency(data as unknown as Agency);
    });

    // Load deals via threads
    supabase
      .from("deals")
      .select("*, threads!inner(agency_id)")
      .eq("threads.agency_id", user.id)
      .then(({ data }) => {
        if (data) setDeals(data as unknown as Deal[]);
      });
  }, [user]);

  const totalCommission = deals.reduce((sum, d) => sum + d.estimated_value * d.commission_rate, 0);
  const pendingDeals = deals.filter((d) => d.status === "pending").length;

  const stats = [
    { label: "Leads recebidos", value: threads.length, icon: Users },
    { label: "Contratos fechados", value: deals.length, icon: TrendingUp },
    { label: "Comissão pendente", value: `R$ ${totalCommission.toFixed(0)}`, icon: DollarSign },
    { label: "Conversas ativas", value: threads.length, icon: MessageCircle },
  ];

  if (!agency && !threadsLoading) {
    return (
      <div className="py-32 text-center">
        <p className="font-display text-3xl text-[#0F172A]">Complete o perfil da agência</p>
        <Link
          to="/onboarding/agencia"
          className="mt-8 inline-flex items-center gap-2 bg-[#B45309] text-[#F8F5F2] px-8 py-4 label-uppercase hover:bg-[#92400e] transition-colors"
        >
          Completar perfil
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Agency info */}
      {agency && (
        <div className="border-technical bg-white p-6 mb-10 flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="font-display text-3xl text-[#0F172A]">{agency.name}</div>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {agency.niches.slice(0, 5).map((n) => (
                <span key={n} className="border border-[#0F172A]/15 px-2 py-0.5 font-technical text-[10px] text-[#0F172A]/50">
                  {n}
                </span>
              ))}
            </div>
          </div>
          <Link
            to={`/agencias/${agency.slug}`}
            className="label-uppercase text-[#B45309] hover:opacity-70 transition-opacity"
          >
            Ver perfil público →
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="border-technical bg-white p-5">
            <Icon size={16} className="text-[#B45309] mb-3" />
            <div className="font-display text-3xl text-[#0F172A]">{value}</div>
            <div className="font-technical text-[10px] text-[#0F172A]/40 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Leads */}
      <div className="label-uppercase text-[#B45309] mb-6 flex items-center gap-2">
        <span className="inline-block w-6 h-px bg-[#B45309]" />
        Leads recebidos
      </div>

      {threadsLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="border-technical p-5 animate-pulse">
              <div className="h-4 bg-[#0F172A]/8 rounded w-1/3 mb-2" />
              <div className="h-3 bg-[#0F172A]/5 rounded w-1/4" />
            </div>
          ))}
        </div>
      ) : threads.length === 0 ? (
        <div className="border-technical py-16 text-center">
          <p className="font-display text-2xl text-[#0F172A]/30">Nenhum lead ainda</p>
          <p className="font-sans text-sm text-[#0F172A]/40 mt-2">
            Quando criadores iniciarem conversas, eles aparecerão aqui
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {threads.map((thread) => (
            <Link
              key={thread.id}
              to={`/chat/${thread.id}`}
              className="border-technical bg-white p-5 flex items-center justify-between hover:border-[#B45309] transition-colors group block"
            >
              <div>
                <div className="font-serif text-[#0F172A] group-hover:text-[#B45309] transition-colors">
                  Criador #{thread.creator_id.slice(0, 8)}
                </div>
                <div className="font-technical text-[10px] text-[#0F172A]/40 mt-1">
                  {thread.last_message_at
                    ? formatDistanceToNow(new Date(thread.last_message_at), { addSuffix: true, locale: ptBR })
                    : "Sem mensagens"}
                </div>
              </div>
              <div className="label-uppercase text-[#B45309] opacity-0 group-hover:opacity-100 transition-opacity">
                Abrir →
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Deals */}
      {deals.length > 0 && (
        <div className="mt-12">
          <div className="label-uppercase text-[#B45309] mb-6 flex items-center gap-2">
            <span className="inline-block w-6 h-px bg-[#B45309]" />
            Contratos fechados
          </div>
          <div className="space-y-3">
            {deals.map((deal) => (
              <div key={deal.id} className="border-technical bg-white p-5 flex items-center justify-between">
                <div>
                  <div className="font-serif text-[#0F172A]">
                    R$ {deal.estimated_value.toLocaleString("pt-BR")}
                  </div>
                  <div className="font-technical text-[10px] text-[#0F172A]/40 mt-1">
                    Comissão: R$ {(deal.estimated_value * deal.commission_rate).toFixed(0)} ({(deal.commission_rate * 100).toFixed(0)}%)
                  </div>
                </div>
                <span className={`font-technical text-[10px] px-3 py-1 border ${
                  deal.status === "pending"
                    ? "border-amber-200 text-amber-700 bg-amber-50"
                    : "border-green-200 text-green-700 bg-green-50"
                }`}>
                  {deal.status === "pending" ? "PENDENTE" : "CONFIRMADO"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AgencyDashboard() {
  return (
    <VinculoProtectedRoute>
      <div className="min-h-screen section-cream">
        <Nav />
        <div className="bg-[#0F172A] pt-24 pb-16">
          <div className="container mx-auto px-6">
            <div className="label-uppercase text-[#B45309] mb-4 flex items-center gap-2">
              <span className="inline-block w-6 h-px bg-[#B45309]" />
              Visão geral
            </div>
            <h1 className="font-display text-[clamp(2.5rem,5vw,5rem)] text-[#F8F5F2] leading-tight">
              Dashboard
            </h1>
          </div>
        </div>
        <div className="container mx-auto px-6 py-12">
          <AgencyDashboardContent />
        </div>
        <Footer />
      </div>
    </VinculoProtectedRoute>
  );
}
