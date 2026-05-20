export type UserType = "creator" | "agency";

export interface Profile {
  id: string;
  user_type: UserType | null;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface Creator {
  user_id: string;
  niche: string | null;
  sub_niches: string[];
  platforms: string[];
  audience_size_range: string | null;
  goals: string[];
  bio: string | null;
  created_at: string;
}

export interface Agency {
  user_id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  niches: string[];
  services: string[];
  description: string | null;
  website: string | null;
  featured: boolean;
  created_at: string;
}

export interface AgencyWithProfile extends Agency {
  profiles: Pick<Profile, "display_name" | "avatar_url"> | null;
}

export interface Match {
  id: string;
  creator_id: string;
  agency_id: string;
  score: number;
  reason: string;
  created_at: string;
  agencies?: Agency;
}

export interface Thread {
  id: string;
  creator_id: string;
  agency_id: string;
  created_at: string;
  last_message_at: string | null;
  creator?: Pick<Profile, "display_name" | "avatar_url">;
  agency?: Pick<Agency, "name" | "logo_url" | "slug">;
}

export interface Message {
  id: string;
  thread_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

export interface Deal {
  id: string;
  thread_id: string;
  estimated_value: number;
  commission_rate: number;
  status: "pending" | "confirmed" | "paid";
  created_at: string;
}

export const NICHES = [
  "Beleza & Moda",
  "Fitness & Saúde",
  "Gastronomia",
  "Tecnologia",
  "Games",
  "Finanças",
  "Lifestyle",
  "Viagens",
  "Educação",
  "Humor & Entretenimento",
  "Esportes",
  "Sustentabilidade",
  "Arte & Design",
  "Música",
  "Podcasts",
];

export const PLATFORMS = [
  "Instagram",
  "TikTok",
  "YouTube",
  "Twitter/X",
  "LinkedIn",
  "Twitch",
  "Spotify",
  "Pinterest",
];

export const AUDIENCE_RANGES = [
  "Nano (1k–10k)",
  "Micro (10k–100k)",
  "Médio (100k–500k)",
  "Macro (500k–1M)",
  "Mega (1M+)",
];

export const CREATOR_GOALS = [
  "Monetização",
  "Crescimento de audiência",
  "Parcerias de marca",
  "Gestão de carreira",
  "Produção de conteúdo",
  "Assessoria de imprensa",
  "Negociação de contratos",
];
