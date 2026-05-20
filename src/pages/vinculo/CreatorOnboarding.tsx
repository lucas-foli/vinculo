import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AUDIENCE_RANGES, CREATOR_GOALS, NICHES, PLATFORMS } from "@/types/vinculo";
import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const STEPS = ["Nicho", "Plataformas", "Objetivos", "Bio"];

function ChipButton({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
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

export default function CreatorOnboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const [niche, setNiche] = useState("");
  const [subNiches, setSubNiches] = useState<string[]>([]);
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [audienceSize, setAudienceSize] = useState("");
  const [goals, setGoals] = useState<string[]>([]);
  const [bio, setBio] = useState("");

  const toggleArray = (arr: string[], setArr: (v: string[]) => void, val: string) => {
    setArr(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
  };

  const handleFinish = async () => {
    if (!user) return;
    setSaving(true);

    await supabase.from("creators").upsert({
      user_id: user.id,
      niche,
      sub_niches: subNiches,
      platforms,
      audience_size_range: audienceSize,
      goals,
      bio,
    } as Record<string, unknown>);

    await supabase.from("profiles").update({
      display_name: user.user_metadata?.display_name ?? user.email?.split("@")[0] ?? "",
      user_type: "creator",
    } as Record<string, unknown>).eq("id", user.id);

    setSaving(false);
    navigate("/matches");
  };

  const canProceed = [
    !!niche,
    platforms.length > 0 && !!audienceSize,
    goals.length > 0,
    bio.trim().length > 10,
  ][step];

  return (
    <div className="min-h-screen section-cream">
      {/* Top bar */}
      <div className="bg-[#0F172A] px-6 py-4 flex items-center justify-between">
        <Link to="/" className="font-display-italic text-2xl text-[#F8F5F2]">
          Vínculo
        </Link>
        <div className="flex items-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={cn(
                  "w-6 h-6 flex items-center justify-center font-technical text-[10px] transition-all",
                  i < step
                    ? "bg-[#B45309] text-[#F8F5F2]"
                    : i === step
                    ? "border border-[#B45309] text-[#B45309]"
                    : "border border-[#F8F5F2]/20 text-[#F8F5F2]/30"
                )}
              >
                {i < step ? <Check size={10} /> : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className={cn("w-8 h-px", i < step ? "bg-[#B45309]" : "bg-[#F8F5F2]/15")} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-16 max-w-2xl">
        <div className="label-uppercase text-[#B45309] mb-3 flex items-center gap-2">
          <span className="inline-block w-6 h-px bg-[#B45309]" />
          Passo {step + 1} de {STEPS.length}
        </div>

        {/* Step 0: Nicho */}
        {step === 0 && (
          <div className="animate-fade-in">
            <h1 className="font-display text-[clamp(2rem,5vw,4rem)] text-[#0F172A] leading-tight mb-10">
              Qual é o seu<br />
              <em className="font-display-italic text-[#B45309]">nicho</em> principal?
            </h1>
            <div className="flex flex-wrap gap-2 mb-10">
              {NICHES.map((n) => (
                <ChipButton
                  key={n}
                  label={n}
                  selected={niche === n}
                  onClick={() => setNiche(n === niche ? "" : n)}
                />
              ))}
            </div>
            {niche && (
              <div className="animate-fade-in">
                <div className="label-uppercase text-[#0F172A]/50 mb-3">Sub-nichos (opcional)</div>
                <div className="flex flex-wrap gap-2">
                  {NICHES.filter((n) => n !== niche).map((n) => (
                    <ChipButton
                      key={n}
                      label={n}
                      selected={subNiches.includes(n)}
                      onClick={() => toggleArray(subNiches, setSubNiches, n)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 1: Plataformas */}
        {step === 1 && (
          <div className="animate-fade-in">
            <h1 className="font-display text-[clamp(2rem,5vw,4rem)] text-[#0F172A] leading-tight mb-10">
              Onde você<br />
              <em className="font-display-italic text-[#B45309]">publica</em>?
            </h1>
            <div className="flex flex-wrap gap-2 mb-10">
              {PLATFORMS.map((p) => (
                <ChipButton
                  key={p}
                  label={p}
                  selected={platforms.includes(p)}
                  onClick={() => toggleArray(platforms, setPlatforms, p)}
                />
              ))}
            </div>
            <div className="mt-8">
              <div className="label-uppercase text-[#0F172A]/50 mb-4">Tamanho da audiência</div>
              <div className="flex flex-wrap gap-2">
                {AUDIENCE_RANGES.map((r) => (
                  <ChipButton
                    key={r}
                    label={r}
                    selected={audienceSize === r}
                    onClick={() => setAudienceSize(r === audienceSize ? "" : r)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Objetivos */}
        {step === 2 && (
          <div className="animate-fade-in">
            <h1 className="font-display text-[clamp(2rem,5vw,4rem)] text-[#0F172A] leading-tight mb-10">
              O que você<br />
              <em className="font-display-italic text-[#B45309]">busca</em> numa agência?
            </h1>
            <div className="flex flex-wrap gap-2">
              {CREATOR_GOALS.map((g) => (
                <ChipButton
                  key={g}
                  label={g}
                  selected={goals.includes(g)}
                  onClick={() => toggleArray(goals, setGoals, g)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Bio */}
        {step === 3 && (
          <div className="animate-fade-in">
            <h1 className="font-display text-[clamp(2rem,5vw,4rem)] text-[#0F172A] leading-tight mb-10">
              Conte sobre<br />
              <em className="font-display-italic text-[#B45309]">você</em>
            </h1>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Descreva seu trabalho, trajetória e o que você espera de uma parceria com uma agência..."
              rows={6}
              className="w-full border-b border-[#0F172A]/20 bg-transparent py-2 font-serif text-lg text-[#0F172A] placeholder:text-[#0F172A]/25 focus:outline-none focus:border-[#B45309] transition-colors resize-none"
            />
            <div className="font-technical text-[10px] text-[#0F172A]/30 mt-2">
              {bio.length} caracteres
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center mt-14 pt-8 border-t border-[#0F172A]/10">
          {step > 0 ? (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="inline-flex items-center gap-2 label-uppercase text-[#0F172A]/50 hover:text-[#0F172A] transition-colors"
            >
              <ArrowLeft size={12} /> Voltar
            </button>
          ) : (
            <div />
          )}
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
              {saving ? "Salvando..." : "Ver meus matches"} <ArrowRight size={12} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
