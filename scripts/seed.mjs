// Vínculo — seed data generator (remote Supabase)
//
// Creates demo creators + agencies (real auth users), computes AI matches,
// and seeds chat threads, messages and deals so every screen has data.
//
// The service_role key is fetched live from the Supabase CLI (so it is never
// hardcoded or committed). You must be logged in: `supabase login` and have the
// project linked (`supabase link`).
//
// Usage (from the vinculo/ project dir):
//   node scripts/seed.mjs
//
// Re-running is safe & idempotent: demo accounts are matched by email and their
// matches/threads/messages/deals are rebuilt. Existing real accounts are left
// untouched.

import { execSync } from "node:child_process";
import { createClient } from "@supabase/supabase-js";

const PROJECT_REF = process.env.SUPABASE_PROJECT_REF || "uparocipcdngcxiplemy";
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || `https://${PROJECT_REF}.supabase.co`;
const DEMO_PASSWORD = "vinculo123"; // all demo accounts share this password
const DEMO_DOMAIN = "vinculo.demo"; // namespace so demo accounts are identifiable

// ── Resolve service_role key ─────────────────────────────────────────────────
function getServiceKey() {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) return process.env.SUPABASE_SERVICE_ROLE_KEY;
  const out = execSync(`supabase projects api-keys --project-ref ${PROJECT_REF} -o json`, {
    encoding: "utf8",
  });
  const keys = JSON.parse(out);
  const svc = keys.find((k) => k.name === "service_role");
  if (!svc) throw new Error("Could not resolve service_role key from supabase CLI");
  return svc.api_key;
}

const sb = createClient(SUPABASE_URL, getServiceKey(), {
  auth: { persistSession: false, autoRefreshToken: false },
});

// ── Helpers ──────────────────────────────────────────────────────────────────
const slugify = (s) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const avatarUrl = (name, bg) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${bg}&color=fff&size=256&font-size=0.4&bold=true`;

const daysAgo = (d, hours = 0) => {
  const t = new Date();
  t.setDate(t.getDate() - d);
  t.setHours(t.getHours() - hours);
  return t.toISOString();
};

// Find an existing auth user by email (paginates through the admin list).
async function findUserByEmail(email) {
  let page = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { data, error } = await sb.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const hit = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (hit) return hit;
    if (data.users.length < 200) return null;
    page += 1;
  }
}

// Create the auth user (or reuse if it already exists). The DB trigger creates
// the profile row from user_metadata; we then sync display_name/avatar/type.
async function ensureUser({ email, displayName, userType, avatar }) {
  let user = await findUserByEmail(email);
  if (!user) {
    const { data, error } = await sb.auth.admin.createUser({
      email,
      password: DEMO_PASSWORD,
      email_confirm: true,
      user_metadata: { display_name: displayName, user_type: userType },
    });
    if (error) throw new Error(`createUser ${email}: ${error.message}`);
    user = data.user;
  }
  await sb
    .from("profiles")
    .update({ display_name: displayName, user_type: userType, avatar_url: avatar })
    .eq("id", user.id);
  return user.id;
}

// ── Data ─────────────────────────────────────────────────────────────────────

// New agencies to complement the 8 already in the project (distinct slugs).
const AGENCIES = [
  {
    handle: "orbita",
    name: "Órbita Digital",
    niches: ["Tecnologia", "Games", "Finanças"],
    services: ["Estratégia de crescimento", "Monetização", "Parcerias comerciais", "Redes sociais"],
    description:
      "Agência data-driven focada em criadores de tech, games e finanças. Estruturamos canais de monetização e fechamos parcerias com marcas de SaaS, hardware e fintechs.",
    website: "https://orbitadigital.com.br",
    featured: true,
  },
  {
    handle: "raiz",
    name: "Raiz Conteúdo",
    niches: ["Gastronomia", "Sustentabilidade", "Lifestyle"],
    services: ["Produção de conteúdo", "Branding pessoal", "Gestão de carreira"],
    description:
      "Boutique de conteúdo para criadores de gastronomia, vida sustentável e lifestyle. Cuidamos de produção, identidade de marca e relacionamento com marcas conscientes.",
    website: "https://raizconteudo.com.br",
    featured: false,
  },
  {
    handle: "alta",
    name: "Alta Performance",
    niches: ["Fitness & Saúde", "Esportes"],
    services: ["Gestão de carreira", "Negociação de contratos", "Booking & eventos", "Monetização"],
    description:
      "Assessoria completa para atletas e criadores fitness. Negociamos contratos de patrocínio, agenda de eventos e planos de monetização de longo prazo.",
    website: "https://altaperformance.com.br",
    featured: true,
  },
  {
    handle: "sonora",
    name: "Sonora Coletivo",
    niches: ["Música", "Podcasts", "Arte & Design"],
    services: ["Booking & eventos", "Produção de conteúdo", "Assessoria de imprensa"],
    description:
      "Coletivo criativo para artistas musicais, podcasters e criadores visuais. Booking de shows, produção de episódios e assessoria de imprensa para a cena independente.",
    website: "https://sonoracoletivo.com.br",
    featured: false,
  },
];

const CREATORS = [
  {
    handle: "mariana",
    name: "Mariana Costa",
    niche: "Beleza & Moda",
    sub_niches: ["Lifestyle"],
    platforms: ["Instagram", "TikTok"],
    audience_size_range: "Micro (10k–100k)",
    goals: ["Parcerias de marca", "Monetização", "Gestão de carreira"],
    bio: "Criadora de beleza e moda em São Paulo. Faço reviews honestos de skincare e maquiagem, com foco em rotinas acessíveis. Procuro parcerias de longo prazo com marcas que combinam com meu público.",
  },
  {
    handle: "rafael",
    name: "Rafael Mendes",
    niche: "Fitness & Saúde",
    sub_niches: ["Esportes"],
    platforms: ["Instagram", "YouTube"],
    audience_size_range: "Médio (100k–500k)",
    goals: ["Monetização", "Negociação de contratos", "Produção de conteúdo"],
    bio: "Personal trainer e criador de conteúdo fitness. Treinos em casa, nutrição prática e bastidores de competições de crossfit. Quero estruturar minha carreira e fechar patrocínios sérios.",
  },
  {
    handle: "beatriz",
    name: "Beatriz Lima",
    niche: "Gastronomia",
    sub_niches: ["Viagens"],
    platforms: ["Instagram", "Pinterest"],
    audience_size_range: "Micro (10k–100k)",
    goals: ["Produção de conteúdo", "Parcerias de marca"],
    bio: "Cozinheira amadora apaixonada por receitas afetivas e rotas gastronômicas pelo Brasil. Crio receitas autorais e guias de viagem para quem ama comer bem.",
  },
  {
    handle: "thiago",
    name: "Thiago Souza",
    niche: "Tecnologia",
    sub_niches: ["Games"],
    platforms: ["YouTube", "Twitch"],
    audience_size_range: "Médio (100k–500k)",
    goals: ["Monetização", "Crescimento de audiência", "Parcerias de marca"],
    bio: "Reviews de gadgets, setups e jogos indie. Faço análises técnicas sem hype e lives de programação aos finais de semana. Buscando crescer de forma sustentável.",
  },
  {
    handle: "camila",
    name: "Camila Rocha",
    niche: "Lifestyle",
    sub_niches: ["Sustentabilidade", "Viagens"],
    platforms: ["Instagram", "TikTok"],
    audience_size_range: "Macro (500k–1M)",
    goals: ["Gestão de carreira", "Assessoria de imprensa", "Parcerias de marca"],
    bio: "Conteúdo de lifestyle consciente: moda circular, viagens de baixo impacto e bem-estar. Já trabalhei com grandes marcas e quero profissionalizar a gestão da minha carreira.",
  },
  {
    handle: "pedro",
    name: "Pedro Alves",
    niche: "Games",
    sub_niches: ["Humor & Entretenimento"],
    platforms: ["Twitch", "YouTube"],
    audience_size_range: "Macro (500k–1M)",
    goals: ["Monetização", "Negociação de contratos", "Parcerias de marca"],
    bio: "Streamer de variety games e cortes de humor. Comunidade super engajada na Twitch. Quero negociar contratos melhores e diversificar minhas fontes de renda.",
  },
  {
    handle: "larissa",
    name: "Larissa Fernandes",
    niche: "Finanças",
    sub_niches: ["Educação"],
    platforms: ["Instagram", "LinkedIn"],
    audience_size_range: "Micro (10k–100k)",
    goals: ["Crescimento de audiência", "Produção de conteúdo", "Monetização"],
    bio: "Educadora financeira. Descomplico investimentos e finanças pessoais para iniciantes. Conteúdo no Instagram e LinkedIn, sempre baseado em dados.",
  },
  {
    handle: "gabriel",
    name: "Gabriel Martins",
    niche: "Música",
    sub_niches: ["Podcasts"],
    platforms: ["Spotify", "Instagram"],
    audience_size_range: "Nano (1k–10k)",
    goals: ["Assessoria de imprensa", "Produção de conteúdo", "Parcerias de marca"],
    bio: "Cantor e compositor independente, apresento um podcast sobre bastidores da música autoral brasileira. Procuro visibilidade e booking para shows.",
  },
];

// ── Matching (mirrors src/hooks/useMatches.ts scoring) ───────────────────────
function scoreMatches(creator, agencies) {
  const scored = agencies.map((agency) => {
    let score = 0;
    const reasons = [];
    const creatorNiches = [creator.niche, ...(creator.sub_niches ?? [])].filter(Boolean);
    const nicheOverlap = creatorNiches.filter((n) => agency.niches.includes(n));
    if (nicheOverlap.length > 0) {
      score += nicheOverlap.length * 30;
      reasons.push(`Nichos compatíveis: ${nicheOverlap.join(", ")}`);
    }
    const goalMatch = (creator.goals ?? []).filter((g) =>
      agency.services.some((s) => s.toLowerCase().includes(g.toLowerCase()))
    );
    if (goalMatch.length > 0) {
      score += goalMatch.length * 20;
      reasons.push(`Serviços alinhados: ${goalMatch.join(", ")}`);
    }
    if (agency.featured) score += 10;
    const normalizedScore = Math.min(100, score);
    return {
      agency,
      score: normalizedScore,
      reason: reasons.length > 0 ? reasons.join(". ") + "." : "Agência com perfil diversificado e compatível.",
    };
  });
  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);
}

// ── Conversations (creator handle ↔ agency slug) ─────────────────────────────
// Each renders in /chat and on the agency dashboard. Optional deal closes it.
const CONVERSATIONS = [
  {
    creator: "rafael",
    agencySlug: "alta-performance",
    startedDaysAgo: 9,
    messages: [
      { from: "creator", text: "Oi! Vi que a Alta Performance trabalha com atletas e criadores fitness. Tô buscando estruturar minha carreira, faz sentido conversar?" },
      { from: "agency", text: "Olá Rafael! Com certeza. Acompanhamos seu canal, o engajamento nos treinos em casa é excelente. Você já tem patrocínios ativos hoje?" },
      { from: "creator", text: "Tenho dois pequenos, mas nada estruturado. Queria algo de longo prazo." },
      { from: "agency", text: "Perfeito. Conseguimos negociar um pacote anual com uma marca de suplementos parceira. Topa marcar uma call essa semana?" },
      { from: "creator", text: "Topo demais! Quinta de manhã funciona pra mim." },
      { from: "agency", text: "Fechado. Te mando o convite. Vamos montar uma proposta inicial em torno de R$ 24k pra temporada." },
    ],
    deal: { estimated_value: 24000, commission_rate: 0.15, status: "confirmed" },
  },
  {
    creator: "mariana",
    agencySlug: "flow-agency",
    startedDaysAgo: 5,
    messages: [
      { from: "creator", text: "Oi Flow! Amo o trabalho de vocês com criadoras de beleza. Posso saber como funciona a parceria?" },
      { from: "agency", text: "Oi Mariana! Que bom te ver por aqui ✨ Trabalhamos com gestão de carreira e parcerias de marca. Seu conteúdo de skincare acessível tem tudo a ver com nosso portfólio." },
      { from: "creator", text: "Que ótimo! Meu foco agora é fechar parcerias mais consistentes." },
      { from: "agency", text: "Conseguimos te conectar com 2 marcas de skincare nacionais que estão buscando exatamente seu perfil. Bora detalhar?" },
    ],
    deal: { estimated_value: 8500, commission_rate: 0.1, status: "pending" },
  },
  {
    creator: "thiago",
    agencySlug: "orbita-digital",
    startedDaysAgo: 14,
    messages: [
      { from: "creator", text: "Fala Órbita! Curti a pegada data-driven de vocês. Faço reviews de tech e lives de programação." },
      { from: "agency", text: "E aí Thiago! Acompanhamos suas análises de gadgets, conteúdo de altíssima qualidade. Temos parceria ativa com marcas de hardware e SaaS." },
      { from: "creator", text: "Show. Meu objetivo é crescer e monetizar sem perder a credibilidade." },
      { from: "agency", text: "Esse é o nosso jeito de trabalhar. Fechamos uma campanha com um fabricante de SSD mês passado, deu super certo. Vamos planejar um Q seu?" },
      { from: "creator", text: "Bora! Me manda os detalhes da campanha." },
      { from: "agency", text: "Enviado por e-mail. A primeira ativação ficou em R$ 18k, comissão de 12%. Assina e a gente arranca." },
    ],
    deal: { estimated_value: 18000, commission_rate: 0.12, status: "paid" },
  },
  {
    creator: "beatriz",
    agencySlug: "pulse-media",
    startedDaysAgo: 3,
    messages: [
      { from: "creator", text: "Oi Pulse! Trabalho com gastronomia e rotas de viagem. Vocês atendem esse nicho?" },
      { from: "agency", text: "Oi Beatriz! Sim, gastronomia e viagens são duas das nossas verticais principais. Adoramos seu feed 🍝" },
      { from: "creator", text: "Que delícia saber disso! Quero produzir conteúdo mais consistente e fechar campanhas." },
      { from: "agency", text: "Vamos te ajudar com o calendário editorial e captação de marcas. Te chamo pra uma call de diagnóstico?" },
    ],
    deal: null,
  },
  {
    creator: "camila",
    agencySlug: "luma-house",
    startedDaysAgo: 7,
    messages: [
      { from: "creator", text: "Oi Luma House! Faço lifestyle consciente e já trabalho com marcas grandes, mas preciso de gestão profissional." },
      { from: "agency", text: "Oi Camila! Seu posicionamento de moda circular é exatamente o que marcas premium procuram. Cuidamos de gestão de carreira e assessoria de imprensa completa." },
      { from: "creator", text: "Perfeito, é disso que preciso. Quero também aparecer mais na mídia." },
      { from: "agency", text: "Conseguimos pautas em veículos de lifestyle e sustentabilidade. Montamos um plano trimestral pra você?" },
      { from: "creator", text: "Sim! Vamos marcar." },
    ],
    deal: { estimated_value: 32000, commission_rate: 0.18, status: "confirmed" },
  },
  {
    creator: "pedro",
    agencySlug: "ignis-creators",
    startedDaysAgo: 11,
    messages: [
      { from: "creator", text: "E aí Ignis! Sou streamer de variety na Twitch, comunidade bem engajada. Vocês fecham contrato com streamers?" },
      { from: "agency", text: "Opa Pedro! Fechamos sim, games e entretenimento é nossa praia. Seus cortes de humor viralizam bem no YouTube." },
      { from: "creator", text: "Quero negociar contratos melhores e diversificar a renda fora da Twitch." },
      { from: "agency", text: "Conseguimos estruturar patrocínios mensais e ativações em eventos de games. Te mando uma proposta inicial?" },
      { from: "creator", text: "Manda sim, tô bem interessado." },
    ],
    deal: { estimated_value: 15000, commission_rate: 0.1, status: "pending" },
  },
];

// ── Run ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n🌱 Seeding Vínculo → ${SUPABASE_URL}\n`);

  // 1) Agencies (auth user + agency row)
  console.log("→ Agencies");
  for (const a of AGENCIES) {
    const email = `agencia.${a.handle}@${DEMO_DOMAIN}`;
    const userId = await ensureUser({
      email,
      displayName: a.name,
      userType: "agency",
      avatar: avatarUrl(a.name, "0F172A"),
    });
    const { error } = await sb.from("agencies").upsert(
      {
        user_id: userId,
        name: a.name,
        slug: slugify(a.name),
        logo_url: avatarUrl(a.name, "B45309"),
        niches: a.niches,
        services: a.services,
        description: a.description,
        website: a.website,
        featured: a.featured,
      },
      { onConflict: "user_id" }
    );
    if (error) throw new Error(`agency ${a.name}: ${error.message}`);
    console.log(`   ✓ ${a.name}  (${email})`);
  }

  // 2) Creators (auth user + creator row)
  console.log("\n→ Creators");
  const creatorIds = {};
  for (const c of CREATORS) {
    const email = `criador.${c.handle}@${DEMO_DOMAIN}`;
    const userId = await ensureUser({
      email,
      displayName: c.name,
      userType: "creator",
      avatar: avatarUrl(c.name, "B45309"),
    });
    creatorIds[c.handle] = userId;
    const { error } = await sb.from("creators").upsert(
      {
        user_id: userId,
        niche: c.niche,
        sub_niches: c.sub_niches,
        platforms: c.platforms,
        audience_size_range: c.audience_size_range,
        goals: c.goals,
        bio: c.bio,
      },
      { onConflict: "user_id" }
    );
    if (error) throw new Error(`creator ${c.name}: ${error.message}`);
    console.log(`   ✓ ${c.name}  (${email})`);
  }

  // 3) Matches — score every demo creator against ALL agencies in the project
  console.log("\n→ Matches");
  const { data: allAgencies, error: agErr } = await sb.from("agencies").select("*");
  if (agErr) throw agErr;
  const slugToAgencyId = Object.fromEntries(allAgencies.map((a) => [a.slug, a.user_id]));

  for (const c of CREATORS) {
    const creatorId = creatorIds[c.handle];
    const top = scoreMatches(c, allAgencies);
    await sb.from("matches").delete().eq("creator_id", creatorId);
    if (top.length === 0) {
      console.log(`   • ${c.name}: no scored matches`);
      continue;
    }
    const rows = top.map((m) => ({
      creator_id: creatorId,
      agency_id: m.agency.user_id,
      score: m.score,
      reason: m.reason,
    }));
    const { error } = await sb.from("matches").insert(rows);
    if (error) throw new Error(`matches ${c.name}: ${error.message}`);
    console.log(`   ✓ ${c.name}: ${rows.length} matches (top score ${top[0].score})`);
  }

  // 4) Threads + messages + deals
  console.log("\n→ Conversations");
  for (const conv of CONVERSATIONS) {
    const creatorId = creatorIds[conv.creator];
    const agencyId = slugToAgencyId[conv.agencySlug];
    if (!creatorId || !agencyId) {
      console.log(`   ! skipped ${conv.creator} ↔ ${conv.agencySlug} (missing party)`);
      continue;
    }

    // Rebuild for idempotency (cascades to messages + deals)
    await sb.from("threads").delete().eq("creator_id", creatorId).eq("agency_id", agencyId);

    const { data: thread, error: tErr } = await sb
      .from("threads")
      .insert({ creator_id: creatorId, agency_id: agencyId, created_at: daysAgo(conv.startedDaysAgo) })
      .select("id")
      .single();
    if (tErr) throw new Error(`thread ${conv.creator}: ${tErr.message}`);

    const n = conv.messages.length;
    const msgRows = conv.messages.map((m, i) => ({
      thread_id: thread.id,
      sender_id: m.from === "creator" ? creatorId : agencyId,
      content: m.text,
      // spread messages across the conversation window, oldest → newest
      created_at: daysAgo(conv.startedDaysAgo, -i * Math.max(1, Math.floor((conv.startedDaysAgo * 24) / n))),
    }));
    const lastAt = msgRows[msgRows.length - 1].created_at;
    const { error: mErr } = await sb.from("messages").insert(msgRows);
    if (mErr) throw new Error(`messages ${conv.creator}: ${mErr.message}`);
    await sb.from("threads").update({ last_message_at: lastAt }).eq("id", thread.id);

    let dealNote = "no deal";
    if (conv.deal) {
      const { error: dErr } = await sb.from("deals").insert({
        thread_id: thread.id,
        estimated_value: conv.deal.estimated_value,
        commission_rate: conv.deal.commission_rate,
        status: conv.deal.status,
      });
      if (dErr) throw new Error(`deal ${conv.creator}: ${dErr.message}`);
      dealNote = `deal R$${conv.deal.estimated_value} (${conv.deal.status})`;
    }
    console.log(`   ✓ ${conv.creator} ↔ ${conv.agencySlug}: ${n} msgs, ${dealNote}`);
  }

  console.log(`\n✅ Done. Demo login password for every account: "${DEMO_PASSWORD}"`);
  console.log(`   Creators:  criador.<handle>@${DEMO_DOMAIN}`);
  console.log(`   Agencies:  agencia.<handle>@${DEMO_DOMAIN}\n`);
}

main().catch((e) => {
  console.error("\n❌ Seed failed:", e.message);
  process.exit(1);
});
