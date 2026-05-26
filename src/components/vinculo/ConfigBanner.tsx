import { supabaseConfigured } from "@/integrations/supabase/client";
import { AlertTriangle } from "lucide-react";

export default function ConfigBanner() {
  if (supabaseConfigured) return null;
  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-[100] bg-amber-50 border border-amber-300 p-4 shadow-lg">
      <div className="flex gap-3 items-start">
        <AlertTriangle className="text-amber-700 flex-shrink-0 mt-0.5" size={16} />
        <div>
          <div className="font-technical text-amber-900 text-[11px]">
            Supabase não configurado
          </div>
          <p className="font-sans text-xs text-amber-800/80 mt-1 leading-relaxed">
            Crie um <code className="font-mono">.env</code> com{" "}
            <code className="font-mono">VITE_SUPABASE_URL</code> e{" "}
            <code className="font-mono">VITE_SUPABASE_PUBLISHABLE_KEY</code>, depois reinicie o dev server.
          </p>
        </div>
      </div>
    </div>
  );
}
