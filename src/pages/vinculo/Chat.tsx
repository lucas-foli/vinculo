import Nav from "@/components/vinculo/Nav";
import VinculoProtectedRoute from "@/components/VinculoProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import { useVinculoProfile } from "@/hooks/useVinculoProfile";
import { useThreads, useMessages, markDealClosed } from "@/hooks/useVinculoChat";
import { supabase } from "@/integrations/supabase/client";
import type { Thread } from "@/types/vinculo";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowLeft, Send, HandshakeIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

function ThreadSidebar({
  threads,
  activeId,
  userType,
}: {
  threads: Thread[];
  activeId?: string;
  userType: "creator" | "agency" | null;
}) {
  return (
    <div className="w-full md:w-72 lg:w-80 border-r border-[#0F172A]/10 flex flex-col overflow-hidden">
      <div className="p-4 border-b border-[#0F172A]/10">
        <div className="label-uppercase text-[#0F172A]/50">Conversas</div>
        <div className="font-technical text-[10px] text-[#0F172A]/30 mt-1">
          {threads.length} thread{threads.length !== 1 ? "s" : ""}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {threads.length === 0 ? (
          <div className="p-6 text-center">
            <p className="font-sans text-sm text-[#0F172A]/40">Sem conversas</p>
          </div>
        ) : (
          threads.map((t) => {
            const name =
              userType === "creator"
                ? t.agency?.name ?? "Agência"
                : t.creator?.display_name ?? "Criador";
            return (
              <Link
                key={t.id}
                to={`/chat/${t.id}`}
                className={`block px-4 py-4 border-b border-[#0F172A]/5 hover:bg-[#0F172A]/2 transition-colors ${
                  t.id === activeId ? "bg-[#B45309]/5 border-l-2 border-l-[#B45309]" : ""
                }`}
              >
                <div className="font-serif text-sm text-[#0F172A] truncate">{name}</div>
                <div className="font-technical text-[10px] text-[#0F172A]/40 mt-1">
                  {t.last_message_at
                    ? formatDistanceToNow(new Date(t.last_message_at), { addSuffix: true, locale: ptBR })
                    : "Nova conversa"}
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}

function ThreadView({ threadId }: { threadId: string }) {
  const { user } = useAuth();
  const { profile } = useVinculoProfile(user?.id);
  const { messages, isLoading, sendMessage } = useMessages(threadId);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [showDealModal, setShowDealModal] = useState(false);
  const [dealValue, setDealValue] = useState("");
  const [dealSaving, setDealSaving] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [otherParty, setOtherParty] = useState<string>("...");

  useEffect(() => {
    if (!profile?.user_type) return;
    supabase.from("threads").select("*").eq("id", threadId).maybeSingle().then(({ data }) => {
      if (!data) return;
      const t = data as unknown as Thread;
      const otherId = profile.user_type === "creator" ? t.agency_id : t.creator_id;
      if (profile.user_type === "creator") {
        supabase
          .from("agencies")
          .select("name")
          .eq("user_id", otherId)
          .maybeSingle()
          .then(({ data: a }) => {
            if (a?.name) setOtherParty(a.name as string);
          });
      } else {
        supabase
          .from("profiles")
          .select("display_name")
          .eq("id", otherId)
          .maybeSingle()
          .then(({ data: p }) => {
            if (p?.display_name) setOtherParty(p.display_name as string);
          });
      }
    });
  }, [threadId, profile?.user_type]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !input.trim()) return;
    setSending(true);
    await sendMessage(user.id, input);
    setInput("");
    setSending(false);
  };

  const handleDealClose = async () => {
    if (!dealValue || isNaN(Number(dealValue))) return;
    setDealSaving(true);
    await markDealClosed(threadId, Number(dealValue));
    setDealSaving(false);
    setShowDealModal(false);
    setDealValue("");
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Thread header */}
      <div className="px-6 py-4 border-b border-[#0F172A]/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/chat" className="md:hidden text-[#0F172A]/40 hover:text-[#0F172A]">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="font-serif text-[#0F172A]">{otherParty}</div>
            <div className="font-technical text-[10px] text-[#0F172A]/40">{messages.length} mensagens</div>
          </div>
        </div>
        <button
          onClick={() => setShowDealModal(true)}
          className="inline-flex items-center gap-1.5 border border-[#0F172A]/15 px-3 py-1.5 font-technical text-[10px] text-[#0F172A]/60 hover:border-[#B45309] hover:text-[#B45309] transition-all"
        >
          <HandshakeIcon size={11} /> Contrato fechado
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-6 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-[#B45309] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12">
            <p className="font-serif text-xl text-[#0F172A]/30">Inicie a conversa</p>
            <p className="font-sans text-sm text-[#0F172A]/30 mt-2">Apresente-se e conte sobre seu projeto</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === user?.id;
            return (
              <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[70%] px-4 py-3 ${
                    isMe
                      ? "bg-[#0F172A] text-[#F8F5F2]"
                      : "border border-[#0F172A]/10 bg-white text-[#0F172A]"
                  }`}
                >
                  <p className="font-sans text-sm leading-relaxed">{msg.content}</p>
                  <div className={`font-technical text-[9px] mt-2 ${isMe ? "text-[#F8F5F2]/40" : "text-[#0F172A]/30"}`}>
                    {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true, locale: ptBR })}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="px-6 py-4 border-t border-[#0F172A]/10 flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Digite sua mensagem..."
          disabled={sending}
          className="flex-1 border-b border-[#0F172A]/20 bg-transparent pb-2 font-sans text-sm text-[#0F172A] placeholder:text-[#0F172A]/30 focus:outline-none focus:border-[#B45309] transition-colors"
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          className="bg-[#0F172A] text-[#F8F5F2] p-2.5 hover:bg-[#B45309] transition-colors disabled:opacity-40"
        >
          <Send size={15} />
        </button>
      </form>

      {/* Deal modal */}
      {showDealModal && (
        <div className="fixed inset-0 bg-[#0F172A]/60 flex items-center justify-center z-50 p-6">
          <div className="bg-[#F8F5F2] border-technical p-8 max-w-md w-full animate-fade-in">
            <div className="label-uppercase text-[#B45309] mb-4 flex items-center gap-2">
              <span className="inline-block w-6 h-px bg-[#B45309]" />
              Registrar contrato fechado
            </div>
            <h3 className="font-display text-3xl text-[#0F172A] mb-6">
              Valor do contrato
            </h3>
            <div className="flex items-center gap-2 border-b border-[#0F172A]/20 pb-2 mb-6">
              <span className="font-serif text-xl text-[#0F172A]/40">R$</span>
              <input
                type="number"
                value={dealValue}
                onChange={(e) => setDealValue(e.target.value)}
                placeholder="5000"
                className="flex-1 bg-transparent font-serif text-2xl text-[#0F172A] focus:outline-none placeholder:text-[#0F172A]/20"
              />
            </div>
            <p className="font-sans text-sm text-[#0F172A]/50 mb-6">
              Comissão estimada: R$ {dealValue ? (Number(dealValue) * 0.1).toFixed(0) : "0"} (10%)
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDealModal(false)}
                className="flex-1 border border-[#0F172A]/15 py-3 label-uppercase text-[#0F172A]/50 hover:border-[#0F172A]/40 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDealClose}
                disabled={dealSaving || !dealValue}
                className="flex-1 bg-[#B45309] text-[#F8F5F2] py-3 label-uppercase hover:bg-[#92400e] transition-colors disabled:opacity-40"
              >
                {dealSaving ? "Salvando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ChatContent() {
  const { threadId } = useParams<{ threadId?: string }>();
  const { user } = useAuth();
  const { profile } = useVinculoProfile(user?.id);
  const { threads } = useThreads(user?.id, profile?.user_type ?? null);

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Sidebar — hidden on mobile when thread is open */}
      <div className={`${threadId ? "hidden md:flex" : "flex"} w-full md:w-auto`}>
        <ThreadSidebar threads={threads} activeId={threadId} userType={profile?.user_type ?? null} />
      </div>

      {/* Thread or empty state */}
      {threadId ? (
        <ThreadView threadId={threadId} />
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="font-display text-3xl text-[#0F172A]/25">Selecione uma conversa</p>
            <p className="font-sans text-sm text-[#0F172A]/30 mt-3">
              Escolha um thread na lista à esquerda
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ChatPage() {
  return (
    <VinculoProtectedRoute>
      <div className="min-h-screen section-cream flex flex-col">
        <Nav />
        <div className="pt-16 flex-1 flex flex-col">
          <ChatContent />
        </div>
      </div>
    </VinculoProtectedRoute>
  );
}
