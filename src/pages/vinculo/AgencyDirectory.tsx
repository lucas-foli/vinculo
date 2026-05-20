import Footer from "@/components/vinculo/Footer";
import Nav from "@/components/vinculo/Nav";
import { useAgencies } from "@/hooks/useAgencies";
import { NICHES, type Agency } from "@/types/vinculo";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

function AgencyCard({ agency }: { agency: Agency }) {
  return (
    <Link
      to={`/agencias/${agency.slug}`}
      className="border-technical bg-white group hover:border-[#B45309] transition-colors duration-200 block animate-fade-in"
    >
      <div className="aspect-[4/3] bg-[#0F172A]/5 flex items-center justify-center overflow-hidden">
        {agency.logo_url ? (
          <img src={agency.logo_url} alt={agency.name} className="object-cover w-full h-full" />
        ) : (
          <span className="font-display text-6xl text-[#0F172A]/15">{agency.name.charAt(0)}</span>
        )}
      </div>
      <div className="p-5">
        {agency.featured && (
          <span className="badge-match mb-3 inline-block">Destaque</span>
        )}
        <h2 className="font-serif text-xl text-[#0F172A] group-hover:text-[#B45309] transition-colors leading-tight">
          {agency.name}
        </h2>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {agency.niches.slice(0, 3).map((n) => (
            <span key={n} className="border border-[#0F172A]/15 px-2 py-0.5 font-technical text-[10px] text-[#0F172A]/50">
              {n}
            </span>
          ))}
          {agency.niches.length > 3 && (
            <span className="border border-[#0F172A]/10 px-2 py-0.5 font-technical text-[10px] text-[#0F172A]/40">
              +{agency.niches.length - 3}
            </span>
          )}
        </div>
        {agency.description && (
          <p className="text-sm text-[#0F172A]/55 mt-3 line-clamp-2 font-sans leading-relaxed">
            {agency.description}
          </p>
        )}
      </div>
    </Link>
  );
}

export default function AgencyDirectory() {
  const [params] = useSearchParams();
  const [search, setSearch] = useState("");
  const [selectedNiches, setSelectedNiches] = useState<string[]>(
    params.get("niche") ? [params.get("niche")!] : []
  );

  const { agencies, isLoading } = useAgencies();

  const filtered = useMemo(() => {
    return agencies.filter((a) => {
      const matchSearch =
        !search ||
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        (a.description ?? "").toLowerCase().includes(search.toLowerCase());
      const matchNiche =
        selectedNiches.length === 0 ||
        selectedNiches.some((n) => a.niches.includes(n));
      return matchSearch && matchNiche;
    });
  }, [agencies, search, selectedNiches]);

  const toggleNiche = (n: string) =>
    setSelectedNiches((prev) =>
      prev.includes(n) ? prev.filter((x) => x !== n) : [...prev, n]
    );

  return (
    <div className="min-h-screen section-cream">
      <Nav />

      {/* Page header */}
      <div className="bg-[#0F172A] pt-24 pb-16">
        <div className="container mx-auto px-6">
          <div className="label-uppercase text-[#B45309] mb-4 flex items-center gap-2">
            <span className="inline-block w-6 h-px bg-[#B45309]" />
            Diretório
          </div>
          <h1 className="font-display text-[clamp(2.5rem,5vw,5rem)] text-[#F8F5F2] leading-tight">
            Agências
          </h1>
          <p className="text-[#F8F5F2]/50 mt-4 font-sans">
            {agencies.length} agências cadastradas na plataforma
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        {/* Search + filters */}
        <div className="flex flex-col gap-6 mb-10">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0F172A]/40" size={16} />
            <input
              type="text"
              placeholder="Buscar agências..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border-technical bg-white pl-9 pr-4 py-3 font-sans text-sm text-[#0F172A] placeholder:text-[#0F172A]/40 focus:outline-none focus:border-[#B45309] transition-colors"
            />
          </div>

          {/* Niche filters */}
          <div className="flex flex-wrap gap-2">
            {NICHES.map((n) => (
              <button
                key={n}
                onClick={() => toggleNiche(n)}
                className={`font-technical text-[10px] px-3 py-1.5 border transition-colors ${
                  selectedNiches.includes(n)
                    ? "bg-[#B45309] text-[#F8F5F2] border-[#B45309]"
                    : "border-[#0F172A]/20 text-[#0F172A]/60 hover:border-[#B45309] hover:text-[#B45309]"
                }`}
              >
                {n}
              </button>
            ))}
            {selectedNiches.length > 0 && (
              <button
                onClick={() => setSelectedNiches([])}
                className="font-technical text-[10px] px-3 py-1.5 text-[#0F172A]/40 hover:text-[#0F172A] transition-colors"
              >
                Limpar filtros
              </button>
            )}
          </div>
        </div>

        {/* Results count */}
        <div className="font-technical text-[#0F172A]/40 mb-6">
          {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
          {selectedNiches.length > 0 && ` · filtrado por ${selectedNiches.join(", ")}`}
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="border-technical animate-pulse">
                <div className="aspect-[4/3] bg-[#0F172A]/5" />
                <div className="p-5">
                  <div className="h-5 bg-[#0F172A]/8 rounded mb-3" />
                  <div className="h-3 bg-[#0F172A]/5 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-24 text-center">
            <p className="font-serif text-3xl text-[#0F172A]/30">Nenhuma agência encontrada</p>
            <p className="font-sans text-[#0F172A]/40 mt-3">Tente ajustar os filtros de busca</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((a) => (
              <AgencyCard key={a.user_id} agency={a} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
