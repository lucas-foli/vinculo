import Footer from "@/components/vinculo/Footer";
import Nav from "@/components/vinculo/Nav";
import VinculoProtectedRoute from "@/components/VinculoProtectedRoute";
import { useAgency } from "@/hooks/useAgencies";
import { useAuth } from "@/hooks/useAuth";
import { getOrCreateThread } from "@/hooks/useVinculoChat";
import { useVinculoProfile } from "@/hooks/useVinculoProfile";
import { ArrowLeft, ExternalLink, MessageCircle } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

function ContactButton({ agencyId, agencyUserId }: { agencyId: string; agencyUserId: string }) {
  const { user } = useAuth();
  const { profile } = useVinculoProfile(user?.id);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleContact = async () => {
    if (!user || profile?.user_type !== "creator") return;
    setLoading(true);
    try {
      const threadId = await getOrCreateThread(user.id, agencyUserId);
      navigate(`/chat/${threadId}`);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Link
        to="/auth"
        className="inline-flex items-center gap-2 bg-[#B45309] text-[#F8F5F2] px-8 py-4 label-uppercase hover:bg-[#92400e] transition-colors"
      >
        <MessageCircle size={14} />
        Entrar para contato
      </Link>
    );
  }

  if (profile?.user_type !== "creator") return null;

  return (
    <button
      onClick={handleContact}
      disabled={loading}
      className="inline-flex items-center gap-2 bg-[#B45309] text-[#F8F5F2] px-8 py-4 label-uppercase hover:bg-[#92400e] transition-colors disabled:opacity-50"
    >
      <MessageCircle size={14} />
      {loading ? "Abrindo chat..." : "Entrar em contato"}
    </button>
  );
}

export default function AgencyProfile() {
  const { slug } = useParams<{ slug: string }>();
  const { agency, isLoading } = useAgency(slug);

  if (isLoading) {
    return (
      <div className="min-h-screen section-cream">
        <Nav />
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-8 h-8 border-2 border-[#B45309] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!agency) {
    return (
      <div className="min-h-screen section-cream">
        <Nav />
        <div className="container mx-auto px-6 pt-36 text-center">
          <h1 className="font-display text-5xl text-[#0F172A]">Agência não encontrada</h1>
          <Link to="/agencias" className="mt-8 inline-flex items-center gap-2 label-uppercase text-[#B45309] hover:opacity-70 transition-opacity">
            <ArrowLeft size={12} /> Voltar ao diretório
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen section-cream">
      <Nav />

      {/* Hero */}
      <div className="bg-[#0F172A] pt-24 pb-20">
        <div className="container mx-auto px-6">
          <Link
            to="/agencias"
            className="inline-flex items-center gap-2 label-uppercase text-[#F8F5F2]/50 hover:text-[#F8F5F2] transition-colors mb-10"
          >
            <ArrowLeft size={12} /> Diretório
          </Link>

          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Logo */}
            <div className="w-24 h-24 border border-[#F8F5F2]/20 bg-[#F8F5F2]/5 flex items-center justify-center flex-shrink-0">
              {agency.logo_url ? (
                <img src={agency.logo_url} alt={agency.name} className="w-full h-full object-cover" />
              ) : (
                <span className="font-display text-4xl text-[#F8F5F2]/30">{agency.name.charAt(0)}</span>
              )}
            </div>

            <div className="flex-1">
              <h1 className="font-display text-[clamp(2rem,5vw,4rem)] text-[#F8F5F2] leading-tight">
                {agency.name}
              </h1>
              <div className="flex flex-wrap gap-2 mt-4">
                {agency.niches.map((n) => (
                  <span key={n} className="border border-[#F8F5F2]/20 px-3 py-1 font-technical text-[10px] text-[#F8F5F2]/60">
                    {n}
                  </span>
                ))}
              </div>
              {agency.website && (
                <a
                  href={agency.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-4 font-technical text-[#B45309] hover:opacity-70 transition-opacity"
                >
                  {agency.website.replace(/^https?:\/\//, "")} <ExternalLink size={11} />
                </a>
              )}
            </div>

            <div className="flex-shrink-0">
              <ContactButton agencyId={agency.slug} agencyUserId={agency.user_id} />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main */}
          <div className="lg:col-span-2">
            {agency.description && (
              <div className="mb-12">
                <div className="label-uppercase text-[#B45309] mb-4 flex items-center gap-2">
                  <span className="inline-block w-6 h-px bg-[#B45309]" />
                  Sobre a agência
                </div>
                <p className="font-serif text-xl text-[#0F172A]/80 leading-relaxed">
                  {agency.description}
                </p>
              </div>
            )}

            {agency.services.length > 0 && (
              <div>
                <div className="label-uppercase text-[#B45309] mb-6 flex items-center gap-2">
                  <span className="inline-block w-6 h-px bg-[#B45309]" />
                  Serviços oferecidos
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {agency.services.map((s) => (
                    <div key={s} className="border-technical p-4 bg-white">
                      <span className="font-technical text-[#B45309] mr-2">→</span>
                      <span className="font-sans text-[#0F172A]/80 text-sm">{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div>
            <div className="border-technical p-6 bg-white sticky top-24">
              <div className="label-uppercase text-[#0F172A]/50 mb-4">Informações</div>

              <div className="space-y-4">
                <div>
                  <div className="font-technical text-[10px] text-[#0F172A]/40 mb-1">Nichos</div>
                  <div className="flex flex-wrap gap-1.5">
                    {agency.niches.map((n) => (
                      <span key={n} className="border border-[#0F172A]/15 px-2 py-0.5 font-technical text-[10px] text-[#0F172A]/60">
                        {n}
                      </span>
                    ))}
                  </div>
                </div>

                {agency.website && (
                  <div>
                    <div className="font-technical text-[10px] text-[#0F172A]/40 mb-1">Site</div>
                    <a href={agency.website} target="_blank" rel="noopener noreferrer" className="font-sans text-sm text-[#B45309] hover:opacity-70 transition-opacity flex items-center gap-1">
                      Visitar <ExternalLink size={11} />
                    </a>
                  </div>
                )}

                <div className="pt-4 border-t border-[#0F172A]/10">
                  <ContactButton agencyId={agency.slug} agencyUserId={agency.user_id} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
