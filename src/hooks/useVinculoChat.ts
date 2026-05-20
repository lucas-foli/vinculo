import { supabase } from "@/integrations/supabase/client";
import type { Message, Thread } from "@/types/vinculo";
import { useEffect, useRef, useState } from "react";

export function useThreads(userId: string | undefined, userType: "creator" | "agency" | null) {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = async () => {
    if (!userId || !userType) return;
    const col = userType === "creator" ? "creator_id" : "agency_id";
    const { data } = await supabase
      .from("threads")
      .select("*")
      .eq(col, userId)
      .order("last_message_at", { ascending: false, nullsFirst: false });
    if (data) setThreads(data as unknown as Thread[]);
    setIsLoading(false);
  };

  useEffect(() => {
    load();
  }, [userId, userType]);

  return { threads, isLoading, reload: load };
}

export function useMessages(threadId: string | undefined) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!threadId) {
      setIsLoading(false);
      return;
    }

    // Initial load
    supabase
      .from("messages")
      .select("*")
      .eq("thread_id", threadId)
      .order("created_at")
      .then(({ data }) => {
        if (data) setMessages(data as unknown as Message[]);
        setIsLoading(false);
      });

    // Realtime subscription
    const channel = supabase
      .channel(`thread:${threadId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `thread_id=eq.${threadId}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    channelRef.current = channel;
    return () => {
      channel.unsubscribe();
    };
  }, [threadId]);

  const sendMessage = async (senderId: string, content: string) => {
    if (!threadId || !content.trim()) return;
    await supabase.from("messages").insert({
      thread_id: threadId,
      sender_id: senderId,
      content: content.trim(),
    });
    await supabase
      .from("threads")
      .update({ last_message_at: new Date().toISOString() })
      .eq("id", threadId);
  };

  return { messages, isLoading, sendMessage };
}

export async function getOrCreateThread(creatorId: string, agencyId: string): Promise<string> {
  // Check for existing thread
  const { data: existing } = await supabase
    .from("threads")
    .select("id")
    .eq("creator_id", creatorId)
    .eq("agency_id", agencyId)
    .maybeSingle();

  if (existing) return existing.id as string;

  // Create new thread
  const { data } = await supabase
    .from("threads")
    .insert({ creator_id: creatorId, agency_id: agencyId })
    .select("id")
    .single();

  return (data as { id: string }).id;
}

export async function markDealClosed(threadId: string, estimatedValue: number): Promise<void> {
  await supabase.from("deals").insert({
    thread_id: threadId,
    estimated_value: estimatedValue,
    commission_rate: 0.1,
    status: "pending",
  });
}
