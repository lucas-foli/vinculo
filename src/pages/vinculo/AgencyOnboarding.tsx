import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { upsertAgency } from "@/hooks/useAgencies";
import { NICHES } from "@/types/vinculo";
import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const STEPS = ["Identidade", "Nichos", "Serviços", "Detalhes"];

const SERVICES_OPTIONS = [
  "Gestão de carreira",
  "Negociação de contratos",
  "Assessoria de imprensa",
  "Produção de conteúdo",
  "Estratégia de crescimento",
  "Monetização",
  "Branding pessoal",
  "Parcerias comerciais",
  "Redes sociais",
  "Booking & eventos",
];

function ChipButton({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "border px-3 py-2 font-technical text-[10px] transition-all flex items-center gap-1.5",
        selected
          ? "bg-[#B45309] text-[#F8F5F2] border-[#B45309]"
          : "border-[#0F172A]/20 text-[#0F172A]/60 hover:border-[#B45309] hover:text-[#B45309]"
      )}
    >
      {selected && <Check size={10} />}
      {label}
    </button>
  );
}

export default function AgencyOnboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const [agencyName, setAgencyName] = useState("");
  const [niches, setNiches] = useState<string[]>([]);
  const [services, setServices] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");

  const toggleArray = (arr: string[], setArr: (v: string[]) => void, val: string) => {
    setArr(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
  };

  const handleFinish = async () => {
    if (!user) return;
    setSaving(true);

    await upsertAgency(user.id, {
      name: agencyName,
      niches,
      services,
      description,
      website: website || undefined,
      featured: false,
    });

    await supabase.from("profiles").update({
      display_name: agencyName,
      user_type: "agency",
    } as Record<string, unknown>).eq("id", user.id);

    setSaving(false);
    navigate("/dashboard");
  };

  const canProceed = [
    agencyName.trim().length > 2,
    niches.length > 0,
    services.length > 0,
    description.trim().length > 10,
  ][step];

  return (
    <div className="min-h-screen section-cream">
      {/* Top bar */}
      <div className="bg-[#0F172A] px-6 py-4 flex items-center justify-between">
        <Link to="/" className="font-display-italic text-2xl text-[#F8F5F2]">Vínculo</Link>
        <div className="flex items-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={cn(
                  "w-6 h-6 flex items-center justify-center font-technical text-[10px] transition-all",
                  i < step ? "bg-[#B45309] text-[#F8F5F2]" : i === step ? "border border-[#B45309] text-[#B45309]" : "border border-[#F8F5F2]/20 text-[#F8F5F2]/30"
                )}
              >
                {i < step ? <Check size={10} /> : i + 1}
              </div>
              {i < STEPS.length - 1 && <div className={cn("w-8 h-px", i < step ? "bg-[#B45309]" : "bg-[#F8F5F2]/15")} />}
            </div>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-6 py-16 max-w-2xl">
        <div className="label-uppercase text-[#B45309] mb-3 flex items-center gap-2">
          <span className="inline-block w-6 h-px bg-[#B45309]" />
          Passo {step + 1} de {STEPS.length}
        </div>

        {/* Step 0: Identity */}
        {step === 0 && (
          <div className="animate-fade-in">
            <h1 className="font-display text-[clamp(2rem,5vw,4rem)] text-[#0F172A] leading-tight mb-10">
              Nome da<br />
              <em className="font-display-italic text-[#B45309]">agência</em>
            </h1>
            <input
              type="text"
              value={agencyName}
              onChange={(e) => setAgencyName(e.target.value)}
              placeholder="Ex: Flow Agency"
              className="w-full border-b border-[#0F172A]/20 bg-transparent pb-2 font-serif text-2xl text-[#0F172A] placeholder:text-[#0F172A]/25 focus:outline-none focus:border-[#B45309] transition-colors"
            />
          </div>
        )}

        {/* Step 1: Nichos */}
        {step === 1 && (
          <div className="animate-fade-in">
            <h1 className="font-display text-[clamp(2rem,5vw,4rem)] text-[#0F172A] leading-tight mb-10">
              Nichos que<br />
              <em className="font-display-italic text-[#B45309]">você atende</em>
            </h1>
            <div className="flex flex-wrap gap-2">
              {NICHES.map((n) => (
                <ChipButton
                  key={n}
                  label={n}
                  selected={niches.includes(n)}
                  onClick={() => toggleArray(niches, setNiches, n)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Services */}
        {step === 2 && (
          <div className="animate-fade-in">
            <h1 className="font-display text-[clamp(2rem,5vw,4rem)] text-[#0F172A] leading-tight mb-10">
              <em className="font-display-italic text-[#B45309]">Serviços</em><br />
              que você oferece
            </h1>
            <div className="flex flex-wrap gap-2">
              {SERVICES_OPTIONS.map((s) => (
                <ChipButton
                  key={s}
                  label={s}
                  selected={services.includes(s)}
                  onClick={() => toggleArray(services, setServices, s)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Description + website */}
        {step === 3 && (
          <div className="animate-fade-in space-y-10">
            <div>
              <h1 className="font-display text-[clamp(2rem,5vw,4rem)] text-[#0F172A] leading-tight mb-6">
                Descreva sua<br />
                <em className="font-display-italic text-[#B45309]">agência</em>
              </h1>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Conte sobre sua trajetória, sua equipe e como vocês ajudam criadores a crescer..."
                rows={5}
                className="w-full border-b border-[#0F172A]/20 bg-transparent py-2 font-serif text-lg text-[#0F172A] placeholder:text-[#0F172A]/25 focus:outline-none focus:border-[#B45309] transition-colors resize-none"
              />
            </div>
            <div>
              <label className="label-uppercase text-[#0F172A]/50 block mb-2">Site (opcional)</label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://suaagencia.com.br"
                className="w-full border-b border-[#0F172A]/20 bg-transparent pb-2 font-sans text-base text-[#0F172A] placeholder:text-[#0F172A]/25 focus:outline-none focus:border-[#B45309] transition-colors"
              />
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center mt-14 pt-8 border-t border-[#0F172A]/10">
          {step > 0 ? (
            <button onClick={() => setStep((s) => s - 1)} className="inline-flex items-center gap-2 label-uppercase text-[#0F172A]/50 hover:text-[#0F172A] transition-colors">
              <ArrowLeft size={12} /> Voltar
            </button>
          ) : <div />}
          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canProceed}
              className="inline-flex items-center gap-2 bg-[#0F172A] text-[#F8F5F2] px-8 py-3 label-uppercase hover:bg-[#1e2d4a] transition-colors disabled:opacity-30"
            >
              Próximo <ArrowRight size={12} />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={!canProceed || saving}
              className="inline-flex items-center gap-2 bg-[#B45309] text-[#F8F5F2] px-8 py-3 label-uppercase hover:bg-[#92400e] transition-colors disabled:opacity-30"
            >
              {saving ? "Salvando..." : "Acessar dashboard"} <ArrowRight size={12} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
