import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen section-navy flex flex-col items-center justify-center text-center px-6">
      <span className="font-technical text-[#B45309] text-lg mb-4">404</span>
      <h1 className="font-display text-[clamp(3rem,8vw,7rem)] text-[#F8F5F2] leading-none">
        Página não<br />
        <em className="font-display-italic text-[#B45309]">encontrada</em>
      </h1>
      <Link
        to="/"
        className="mt-12 inline-flex items-center gap-2 border border-[#F8F5F2]/30 text-[#F8F5F2] px-8 py-4 label-uppercase hover:border-[#F8F5F2] transition-colors"
      >
        Voltar ao início
      </Link>
    </div>
  );
}
