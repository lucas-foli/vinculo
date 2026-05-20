import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-[#0F172A] text-[#F8F5F2]/60 py-12">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          <div>
            <span className="font-display-italic text-[#F8F5F2] text-2xl">Vínculo</span>
            <p className="label-uppercase mt-3 max-w-xs leading-relaxed text-[#F8F5F2]/40">
              Marketplace de criadores e agências
            </p>
          </div>
          <div className="flex gap-12">
            <div className="flex flex-col gap-3">
              <span className="label-uppercase text-[#F8F5F2]/30">Plataforma</span>
              <Link to="/agencias" className="label-uppercase hover:text-[#F8F5F2] transition-colors">Agências</Link>
              <Link to="/auth?tab=signup" className="label-uppercase hover:text-[#F8F5F2] transition-colors">Cadastrar</Link>
              <Link to="/auth" className="label-uppercase hover:text-[#F8F5F2] transition-colors">Entrar</Link>
            </div>
            <div className="flex flex-col gap-3">
              <span className="label-uppercase text-[#F8F5F2]/30">Legal</span>
              <span className="label-uppercase">Privacidade</span>
              <span className="label-uppercase">Termos</span>
            </div>
          </div>
        </div>
        <div className="border-t border-[#F8F5F2]/10 mt-10 pt-6 flex justify-between items-center">
          <span className="font-technical text-[#F8F5F2]/30">© 2025 Vínculo</span>
          <span className="font-technical text-[#F8F5F2]/20">v1.0.0</span>
        </div>
      </div>
    </footer>
  );
}
