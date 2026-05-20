import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { ArrowRight, Building2, User } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

type UserType = "creator" | "agency";
type Tab = "signin" | "signup";

export default function VinculoAuth() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const [tab, setTab] = useState<Tab>((params.get("tab") as Tab) ?? "signin");
  const [userType, setUserType] = useState<UserType>((params.get("type") as UserType) ?? "creator");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const tabParam = params.get("tab");
    const typeParam = params.get("type");
    if (tabParam === "signup" || tabParam === "signin") setTab(tabParam);
    if (typeParam === "creator" || typeParam === "agency") setUserType(typeParam);
  }, [params]);

  const routeAfterAuth = async (userId: string) => {
    const { data: profile } = await supabase
      .from("profiles")
      .select("user_type")
      .eq("id", userId)
      .maybeSingle();

    if (profile?.user_type === "creator") {
      const { data: creator } = await supabase
        .from("creators")
        .select("user_id")
        .eq("user_id", userId)
        .maybeSingle();
      navigate(creator ? "/matches" : "/onboarding/criador");
      return;
    }
    if (profile?.user_type === "agency") {
      const { data: agency } = await supabase
        .from("agencies")
        .select("user_id")
        .eq("user_id", userId)
        .maybeSingle();
      navigate(agency ? "/dashboard" : "/onboarding/agencia");
      return;
    }
    navigate("/");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (tab === "signup") {
        const { data, error: err } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: name, user_type: userType },
          },
        });
        if (err) throw err;

        // Email confirm desabilitado: sessão criada imediatamente, vai pro onboarding.
        // Email confirm habilitado: data.session é null, mostra mensagem de verificação.
        if (data.session?.user) {
          navigate(userType === "creator" ? "/onboarding/criador" : "/onboarding/agencia");
        } else {
          setSuccess(
            "Conta criada! Verifique seu e-mail para confirmar a conta e depois faça login."
          );
          setTab("signin");
        }
      } else {
        const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
        if (data.user) await routeAfterAuth(data.user.id);
        else navigate("/");
      }
    } catch (err: unknown) {
      setError((err as Error).message ?? "Erro inesperado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/` },
    });
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left — dark editorial */}
      <div className="section-navy hidden lg:flex flex-col justify-between p-12">
        <Link to="/" className="font-display-italic text-3xl text-[#F8F5F2]">
          Vínculo
        </Link>
        <div>
          <div className="label-uppercase text-[#B45309] mb-6 flex items-center gap-2">
            <span className="inline-block w-6 h-px bg-[#B45309]" />
            O marketplace certo para sua carreira
          </div>
          <p className="font-display text-[clamp(2rem,3.5vw,3.5rem)] text-[#F8F5F2] leading-tight">
            Criadores e agências<br />
            <em className="font-display-italic text-[#B45309]">conectados</em> pela IA
          </p>
          <div className="mt-12 border border-[#F8F5F2]/10 p-6">
            <div className="label-uppercase text-[#F8F5F2]/40 mb-4">Depoimento</div>
            <p className="font-serif text-[#F8F5F2]/80 text-lg leading-relaxed italic">
              "Em 2 dias já tinha 3 propostas de agências alinhadas com meu nicho de fitness. O match da IA foi perfeito."
            </p>
            <div className="mt-4 font-technical text-[#F8F5F2]/40">@mariasantos · 180k seguidores</div>
          </div>
        </div>
        <div className="font-technical text-[#F8F5F2]/20">© 2025 Vínculo</div>
      </div>

      {/* Right — form */}
      <div className="section-cream flex items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link to="/" className="font-display-italic text-2xl text-[#0F172A] block lg:hidden mb-10">
            Vínculo
          </Link>

          {/* Tabs */}
          <div className="flex border-b border-[#0F172A]/15 mb-8">
            {([["signin", "Entrar"], ["signup", "Criar conta"]] as [Tab, string][]).map(([t, label]) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "pb-3 mr-8 label-uppercase transition-colors",
                  tab === t
                    ? "text-[#0F172A] border-b-2 border-[#B45309] -mb-px"
                    : "text-[#0F172A]/40 hover:text-[#0F172A]"
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {/* User type (signup only) */}
          {tab === "signup" && (
            <div className="mb-8">
              <div className="label-uppercase text-[#0F172A]/50 mb-3">Você é:</div>
              <div className="grid grid-cols-2 gap-3">
                {([["creator", "Criador", User], ["agency", "Agência", Building2]] as [UserType, string, typeof User][]).map(
                  ([type, label, Icon]) => (
                    <button
                      key={type}
                      onClick={() => setUserType(type)}
                      className={cn(
                        "border p-4 flex flex-col items-center gap-2 transition-all",
                        userType === type
                          ? "border-[#B45309] bg-[#B45309]/5"
                          : "border-[#0F172A]/15 hover:border-[#0F172A]/40"
                      )}
                    >
                      <Icon
                        size={20}
                        className={userType === type ? "text-[#B45309]" : "text-[#0F172A]/40"}
                      />
                      <span className={cn("label-uppercase", userType === type ? "text-[#B45309]" : "text-[#0F172A]/60")}>
                        {label}
                      </span>
                    </button>
                  )
                )}
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {tab === "signup" && (
              <div>
                <label className="label-uppercase text-[#0F172A]/50 block mb-2">Nome</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Seu nome ou nome da agência"
                  className="w-full border-b border-[#0F172A]/20 bg-transparent pb-2 font-serif text-xl text-[#0F172A] placeholder:text-[#0F172A]/25 focus:outline-none focus:border-[#B45309] transition-colors"
                />
              </div>
            )}

            <div>
              <label className="label-uppercase text-[#0F172A]/50 block mb-2">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="seu@email.com"
                className="w-full border-b border-[#0F172A]/20 bg-transparent pb-2 font-serif text-xl text-[#0F172A] placeholder:text-[#0F172A]/25 focus:outline-none focus:border-[#B45309] transition-colors"
              />
            </div>

            <div>
              <label className="label-uppercase text-[#0F172A]/50 block mb-2">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="••••••••"
                className="w-full border-b border-[#0F172A]/20 bg-transparent pb-2 font-serif text-xl text-[#0F172A] placeholder:text-[#0F172A]/25 focus:outline-none focus:border-[#B45309] transition-colors"
              />
            </div>

            {error && (
              <div className="border border-red-200 bg-red-50 px-4 py-3">
                <p className="font-technical text-red-600 text-xs">{error}</p>
              </div>
            )}

            {success && (
              <div className="border border-green-200 bg-green-50 px-4 py-3">
                <p className="font-technical text-green-700 text-xs">{success}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0F172A] text-[#F8F5F2] py-4 label-uppercase hover:bg-[#1e2d4a] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? "Aguarde..." : tab === "signin" ? "Entrar" : "Criar conta"}
              {!loading && <ArrowRight size={14} />}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-[#0F172A]/10" />
            <span className="font-technical text-[10px] text-[#0F172A]/30">ou continue com</span>
            <div className="flex-1 h-px bg-[#0F172A]/10" />
          </div>

          {/* Google */}
          <button
            onClick={handleGoogle}
            className="w-full border border-[#0F172A]/15 py-3 label-uppercase text-[#0F172A]/70 hover:border-[#0F172A]/40 hover:text-[#0F172A] transition-colors flex items-center justify-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google
          </button>

          {tab === "signin" && (
            <p className="text-center mt-6 font-sans text-sm text-[#0F172A]/50">
              Não tem conta?{" "}
              <button onClick={() => setTab("signup")} className="text-[#B45309] hover:opacity-70 transition-opacity">
                Criar agora
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
