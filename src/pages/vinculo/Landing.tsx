import Footer from "@/components/vinculo/Footer";
import Nav from "@/components/vinculo/Nav";
import { useAgencies } from "@/hooks/useAgencies";
import { NICHES } from "@/types/vinculo";
import { ArrowRight, Star, TrendingUp, Users } from "lucide-react";
import { Link } from "react-router-dom";

function AgencyCard({ agency }: { agency: { name: string; niches: string[]; description: string | null; logo_url: string | null; slug: string } }) {
  return (
    <Link
      to={`/agencias/${agency.slug}`}
      className="border-technical bg-white group hover:border-[#B45309] transition-colors duration-200 block"
    >
      <div className="aspect-[4/3] bg-[#0F172A]/5 flex items-center justify-center overflow-hidden relative">
        {agency.logo_url ? (
          <img src={agency.logo_url} alt={agency.name} className="object-cover w-full h-full" />
        ) : (
          <span className="font-display text-5xl text-[#0F172A]/20">
            {agency.name.charAt(0)}
          </span>
        )}
        {/* Match badge placeholder for landing */}
        <div className="absolute top-3 right-3 badge-match">
          DESTAQUE
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-serif text-xl text-[#0F172A] group-hover:text-[#B45309] transition-colors">
          {agency.name}
        </h3>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {agency.niches.slice(0, 3).map((n) => (
            <span key={n} className="border border-[#0F172A]/20 px-2 py-0.5 font-technical text-[10px] text-[#0F172A]/60">
              {n}
            </span>
          ))}
        </div>
        <p className="text-sm text-[#0F172A]/60 mt-3 line-clamp-2 font-sans">
          {agency.description ?? "Agência especializada em gestão de carreiras de criadores."}
        </p>
      </div>
    </Link>
  );
}

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Crie seu perfil",
    desc: "Preencha nicho, plataformas, tamanho da audiência e objetivos de carreira.",
  },
  {
    step: "02",
    title: "Receba seu ranking",
    desc: "Nossa IA analisa seu perfil e seleciona as agências mais compatíveis com score e justificativa.",
  },
  {
    step: "03",
    title: "Conecte-se",
    desc: "Inicie uma conversa diretamente com as agências escolhidas e feche parcerias.",
  },
];

export default function Landing() {
  const { agencies } = useAgencies({ featured: true });

  return (
    <div className="min-h-screen">
      <Nav />

      {/* Hero — dark navy */}
      <section className="section-navy min-h-screen flex items-center pt-16">
        <div className="container mx-auto px-6 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left — 7 cols */}
            <div className="lg:col-span-7 animate-fade-in">
              <div className="label-uppercase text-[#B45309] mb-6 flex items-center gap-2">
                <span className="inline-block w-8 h-px bg-[#B45309]" />
                Marketplace de Criadores & Agências
              </div>
              <h1 className="font-display text-[clamp(3rem,6vw,6rem)] leading-[1.04] tracking-tight text-[#F8F5F2]">
                O match<br />
                <em className="font-display-italic text-[#B45309]">certo</em> para<br />
                sua carreira
              </h1>
              <p className="mt-8 text-[#F8F5F2]/60 text-lg font-sans leading-relaxed max-w-lg">
                Criadores encontram agências alinhadas ao seu nicho, audiência e objetivos.
                IA analisa compatibilidade e gera o ranking ideal para você.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-10">
                <Link
                  to="/auth?tab=signup&type=creator"
                  className="inline-flex items-center gap-2 bg-[#B45309] text-[#F8F5F2] px-8 py-4 label-uppercase hover:bg-[#92400e] transition-colors"
                >
                  Sou Criador <ArrowRight size={14} />
                </Link>
                <Link
                  to="/auth?tab=signup&type=agency"
                  className="inline-flex items-center gap-2 border border-[#F8F5F2]/30 text-[#F8F5F2] px-8 py-4 label-uppercase hover:border-[#F8F5F2] transition-colors"
                >
                  Sou Agência <ArrowRight size={14} />
                </Link>
              </div>

              {/* Stats */}
              <div className="flex gap-8 mt-14 pt-10 border-t border-[#F8F5F2]/10">
                {[
                  { icon: Users, label: "Criadores ativos", value: "2.4k+" },
                  { icon: Star, label: "Agências verificadas", value: "180+" },
                  { icon: TrendingUp, label: "Contratos fechados", value: "940+" },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label}>
                    <div className="font-display text-3xl text-[#F8F5F2]">{value}</div>
                    <div className="font-technical text-[#F8F5F2]/40 mt-1">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — 5 cols: editorial visual */}
            <div className="lg:col-span-5 hidden lg:block">
              <div className="relative">
                <div className="border border-[#F8F5F2]/10 p-8 bg-[#F8F5F2]/5 backdrop-blur-sm">
                  <div className="label-uppercase text-[#B45309] mb-4">Match Preview</div>
                  {[
                    { name: "Flow Agency", score: 94, niches: ["Beleza & Moda", "Lifestyle"] },
                    { name: "Creator Studio", score: 87, niches: ["Fitness & Saúde"] },
                    { name: "Pulse Media", score: 81, niches: ["Gastronomia", "Viagens"] },
                  ].map((item, i) => (
                    <div key={item.name} className="flex items-center gap-4 py-4 border-b border-[#F8F5F2]/10 last:border-0">
                      <div className="w-10 h-10 bg-[#B45309]/20 flex items-center justify-center flex-shrink-0">
                        <span className="font-technical text-[#B45309] text-xs">{String(i + 1).padStart(2, "0")}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-serif text-[#F8F5F2] text-base">{item.name}</div>
                        <div className="font-technical text-[#F8F5F2]/40 text-[10px] mt-1">
                          {item.niches.join(" · ")}
                        </div>
                      </div>
                      <div className="font-technical text-[#B45309] text-sm flex-shrink-0">
                        {item.score}% MATCH
                      </div>
                    </div>
                  ))}
                </div>
                <div className="absolute -bottom-3 -right-3 w-24 h-24 border border-[#B45309]/30" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works — cream */}
      <section className="section-cream py-24">
        <div className="container mx-auto px-6">
          <div className="flex items-center gap-4 mb-16">
            <span className="inline-block w-8 h-px bg-[#B45309]" />
            <span className="label-uppercase text-[#B45309]">Como funciona</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
            {HOW_IT_WORKS.map((item, i) => (
              <div key={item.step} className={`p-8 border-technical ${i < 2 ? "md:border-r-0" : ""}`}>
                <div className="font-technical text-[#B45309] text-2xl mb-6">{item.step}</div>
                <h3 className="font-display text-2xl text-[#0F172A] mb-4">{item.title}</h3>
                <p className="text-[#0F172A]/60 font-sans leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Agencies — white */}
      <section className="bg-white py-24">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-4">
              <span className="inline-block w-8 h-px bg-[#B45309]" />
              <span className="label-uppercase text-[#B45309]">Agências em destaque</span>
            </div>
            <Link to="/agencias" className="label-uppercase text-[#0F172A] hover:text-[#B45309] transition-colors flex items-center gap-2">
              Ver todas <ArrowRight size={12} />
            </Link>
          </div>

          {agencies.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Skeleton placeholders */}
              {[1, 2, 3].map((i) => (
                <div key={i} className="border-technical animate-pulse">
                  <div className="aspect-[4/3] bg-[#0F172A]/5" />
                  <div className="p-5">
                    <div className="h-5 bg-[#0F172A]/10 rounded mb-3" />
                    <div className="h-3 bg-[#0F172A]/5 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {agencies.slice(0, 6).map((a) => (
                <AgencyCard key={a.user_id} agency={a} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Niches ribbon */}
      <section className="section-cream py-16 overflow-hidden">
        <div className="container mx-auto px-6 mb-8">
          <span className="label-uppercase text-[#0F172A]/40">Nichos atendidos</span>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 px-6 scrollbar-thin">
          {NICHES.map((n) => (
            <Link
              key={n}
              to={`/agencias?niche=${encodeURIComponent(n)}`}
              className="flex-shrink-0 border-technical px-5 py-2.5 font-technical text-[#0F172A]/70 hover:border-[#B45309] hover:text-[#B45309] transition-colors"
            >
              {n}
            </Link>
          ))}
        </div>
      </section>

      {/* CTA — dark */}
      <section className="section-navy py-24">
        <div className="container mx-auto px-6 text-center">
          <span className="label-uppercase text-[#B45309]">Pronto para começar?</span>
          <h2 className="font-display text-[clamp(2.5rem,5vw,5rem)] text-[#F8F5F2] mt-4 leading-tight">
            Encontre a agência<br />
            <em className="font-display-italic text-[#B45309]">ideal</em> para você
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
            <Link
              to="/auth?tab=signup&type=creator"
              className="inline-flex items-center gap-2 bg-[#B45309] text-[#F8F5F2] px-10 py-4 label-uppercase hover:bg-[#92400e] transition-colors"
            >
              Começar como Criador <ArrowRight size={14} />
            </Link>
            <Link
              to="/agencias"
              className="inline-flex items-center gap-2 border border-[#F8F5F2]/30 text-[#F8F5F2] px-10 py-4 label-uppercase hover:border-[#F8F5F2] transition-colors"
            >
              Explorar Agências <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
