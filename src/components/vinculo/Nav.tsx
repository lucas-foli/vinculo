import { useAuth } from "@/hooks/useAuth";
import { useVinculoProfile } from "@/hooks/useVinculoProfile";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Nav() {
  const { isSignedIn, user, signOut } = useAuth();
  const { profile } = useVinculoProfile(user?.id);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isDark = location.pathname === "/";

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const navLinks = [
    { label: "Agências", to: "/agencias" },
    ...(isSignedIn && profile?.user_type === "creator" ? [{ label: "Meus Matches", to: "/matches" }] : []),
    ...(isSignedIn && profile?.user_type === "agency" ? [{ label: "Dashboard", to: "/dashboard" }] : []),
    ...(isSignedIn ? [{ label: "Chat", to: "/chat" }] : []),
  ];

  const base = isDark && !scrolled ? "text-[#F8F5F2]" : "text-[#0F172A]";
  const bg = scrolled
    ? "bg-[#F8F5F2]/95 backdrop-blur-sm shadow-sm"
    : isDark
    ? "bg-transparent"
    : "bg-[#F8F5F2]";

  return (
    <header className={cn("fixed top-0 left-0 right-0 z-50 transition-all duration-300", bg)}>
      <nav className="container mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className={cn("font-display-italic text-2xl tracking-tight", base)}>
          Vínculo
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={cn("label-uppercase hover:opacity-60 transition-opacity", base)}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Auth actions */}
        <div className="hidden md:flex items-center gap-4">
          {isSignedIn ? (
            <button
              onClick={handleSignOut}
              className={cn("label-uppercase hover:opacity-60 transition-opacity", base)}
            >
              Sair
            </button>
          ) : (
            <>
              <Link
                to="/auth"
                className={cn("label-uppercase hover:opacity-60 transition-opacity", base)}
              >
                Entrar
              </Link>
              <Link
                to="/auth?tab=signup"
                className="label-uppercase bg-[#B45309] text-[#F8F5F2] px-4 py-2 hover:bg-[#92400e] transition-colors"
              >
                Cadastrar
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className={cn("md:hidden", base)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#F8F5F2] border-t border-[#0F172A]/10 py-4 px-6 flex flex-col gap-4">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setMenuOpen(false)}
              className="label-uppercase text-[#0F172A] hover:text-[#B45309] transition-colors"
            >
              {l.label}
            </Link>
          ))}
          <div className="border-t border-[#0F172A]/10 pt-4 flex flex-col gap-3">
            {isSignedIn ? (
              <button onClick={handleSignOut} className="label-uppercase text-[#0F172A] text-left">
                Sair
              </button>
            ) : (
              <>
                <Link to="/auth" onClick={() => setMenuOpen(false)} className="label-uppercase text-[#0F172A]">
                  Entrar
                </Link>
                <Link
                  to="/auth?tab=signup"
                  onClick={() => setMenuOpen(false)}
                  className="label-uppercase bg-[#B45309] text-[#F8F5F2] px-4 py-2 text-center"
                >
                  Cadastrar
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
