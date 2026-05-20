-- Vínculo: Seed de 8 agências de exemplo para demonstração
-- Cria usuários "trancados" em auth.users (senha não usável) apenas para satisfazer
-- a FK agencies.user_id → auth.users.id. Esses usuários não podem fazer login.
-- O trigger handle_new_user cria os perfis automaticamente.

-- ─── auth.users (demo) ───────────────────────────────────────────────────────
insert into auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  raw_app_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change
)
values
  ('a1111111-1111-4111-8111-111111111101'::uuid, '00000000-0000-0000-0000-000000000000'::uuid, 'authenticated', 'authenticated', 'demo+flow@vinculo.dev',         crypt('SEED_'||gen_random_uuid()::text, gen_salt('bf')), now(), '{"display_name":"Flow Agency","user_type":"agency"}'::jsonb,         '{"provider":"email","providers":["email"],"seed":true}'::jsonb, now(), now(), '', '', '', ''),
  ('a1111111-1111-4111-8111-111111111102'::uuid, '00000000-0000-0000-0000-000000000000'::uuid, 'authenticated', 'authenticated', 'demo+creator-studio@vinculo.dev', crypt('SEED_'||gen_random_uuid()::text, gen_salt('bf')), now(), '{"display_name":"Creator Studio","user_type":"agency"}'::jsonb,        '{"provider":"email","providers":["email"],"seed":true}'::jsonb, now(), now(), '', '', '', ''),
  ('a1111111-1111-4111-8111-111111111103'::uuid, '00000000-0000-0000-0000-000000000000'::uuid, 'authenticated', 'authenticated', 'demo+pulse@vinculo.dev',        crypt('SEED_'||gen_random_uuid()::text, gen_salt('bf')), now(), '{"display_name":"Pulse Media","user_type":"agency"}'::jsonb,           '{"provider":"email","providers":["email"],"seed":true}'::jsonb, now(), now(), '', '', '', ''),
  ('a1111111-1111-4111-8111-111111111104'::uuid, '00000000-0000-0000-0000-000000000000'::uuid, 'authenticated', 'authenticated', 'demo+nexo@vinculo.dev',         crypt('SEED_'||gen_random_uuid()::text, gen_salt('bf')), now(), '{"display_name":"Nexo Talentos","user_type":"agency"}'::jsonb,         '{"provider":"email","providers":["email"],"seed":true}'::jsonb, now(), now(), '', '', '', ''),
  ('a1111111-1111-4111-8111-111111111105'::uuid, '00000000-0000-0000-0000-000000000000'::uuid, 'authenticated', 'authenticated', 'demo+ignis@vinculo.dev',        crypt('SEED_'||gen_random_uuid()::text, gen_salt('bf')), now(), '{"display_name":"Ignis Creators","user_type":"agency"}'::jsonb,        '{"provider":"email","providers":["email"],"seed":true}'::jsonb, now(), now(), '', '', '', ''),
  ('a1111111-1111-4111-8111-111111111106'::uuid, '00000000-0000-0000-0000-000000000000'::uuid, 'authenticated', 'authenticated', 'demo+vertex@vinculo.dev',       crypt('SEED_'||gen_random_uuid()::text, gen_salt('bf')), now(), '{"display_name":"Vertex Influência","user_type":"agency"}'::jsonb,     '{"provider":"email","providers":["email"],"seed":true}'::jsonb, now(), now(), '', '', '', ''),
  ('a1111111-1111-4111-8111-111111111107'::uuid, '00000000-0000-0000-0000-000000000000'::uuid, 'authenticated', 'authenticated', 'demo+rota@vinculo.dev',         crypt('SEED_'||gen_random_uuid()::text, gen_salt('bf')), now(), '{"display_name":"Rota Conteúdo","user_type":"agency"}'::jsonb,         '{"provider":"email","providers":["email"],"seed":true}'::jsonb, now(), now(), '', '', '', ''),
  ('a1111111-1111-4111-8111-111111111108'::uuid, '00000000-0000-0000-0000-000000000000'::uuid, 'authenticated', 'authenticated', 'demo+luma@vinculo.dev',         crypt('SEED_'||gen_random_uuid()::text, gen_salt('bf')), now(), '{"display_name":"Luma House","user_type":"agency"}'::jsonb,            '{"provider":"email","providers":["email"],"seed":true}'::jsonb, now(), now(), '', '', '', '')
on conflict (id) do nothing;

-- ─── public.agencies ─────────────────────────────────────────────────────────
insert into public.agencies (user_id, name, slug, niches, services, description, website, featured)
values
  (
    'a1111111-1111-4111-8111-111111111101'::uuid,
    'Flow Agency',
    'flow-agency',
    array['Beleza & Moda','Lifestyle']::text[],
    array['Gestão de carreira','Negociação de contratos','Branding pessoal']::text[],
    'Especialistas em creators de moda e estilo de vida, com track record de parcerias com grandes marcas nacionais e internacionais.',
    'https://flowagency.exemplo',
    true
  ),
  (
    'a1111111-1111-4111-8111-111111111102'::uuid,
    'Creator Studio',
    'creator-studio',
    array['Fitness & Saúde','Esportes']::text[],
    array['Produção de conteúdo','Monetização','Estratégia de crescimento']::text[],
    'Boutique focada em creators de fitness e bem-estar. Produção própria de conteúdo e estratégia 360.',
    'https://creatorstudio.exemplo',
    true
  ),
  (
    'a1111111-1111-4111-8111-111111111103'::uuid,
    'Pulse Media',
    'pulse-media',
    array['Gastronomia','Viagens']::text[],
    array['Booking & eventos','Parcerias comerciais','Assessoria de imprensa']::text[],
    'Conecta chefs, food creators e influenciadores de viagem com marcas premium e roteiros patrocinados.',
    null,
    true
  ),
  (
    'a1111111-1111-4111-8111-111111111104'::uuid,
    'Nexo Talentos',
    'nexo-talentos',
    array['Tecnologia','Educação','Finanças']::text[],
    array['Gestão de carreira','Estratégia de crescimento','Redes sociais']::text[],
    'Casa de talentos especializada em creators técnicos: edtech, fintech, devrels e divulgação científica.',
    'https://nexo.exemplo',
    false
  ),
  (
    'a1111111-1111-4111-8111-111111111105'::uuid,
    'Ignis Creators',
    'ignis-creators',
    array['Games','Humor & Entretenimento']::text[],
    array['Booking & eventos','Monetização','Parcerias comerciais']::text[],
    'Agência forte em gaming, streamers e creators de entretenimento. Conexão com publishers, eventos e marcas de hardware.',
    null,
    false
  ),
  (
    'a1111111-1111-4111-8111-111111111106'::uuid,
    'Vertex Influência',
    'vertex-influencia',
    array['Beleza & Moda','Lifestyle','Sustentabilidade']::text[],
    array['Branding pessoal','Assessoria de imprensa','Parcerias comerciais']::text[],
    'Influência consciente: trabalhamos com creators alinhados a marcas sustentáveis e propósito de marca claro.',
    null,
    false
  ),
  (
    'a1111111-1111-4111-8111-111111111107'::uuid,
    'Rota Conteúdo',
    'rota-conteudo',
    array['Podcasts','Música','Arte & Design']::text[],
    array['Produção de conteúdo','Monetização','Booking & eventos']::text[],
    'Casa de produção e gestão para creators do universo de áudio e cultura: podcasters, músicos e artistas digitais.',
    null,
    false
  ),
  (
    'a1111111-1111-4111-8111-111111111108'::uuid,
    'Luma House',
    'luma-house',
    array['Lifestyle','Beleza & Moda','Viagens']::text[],
    array['Gestão de carreira','Negociação de contratos','Branding pessoal','Redes sociais']::text[],
    'Boutique premium para creators lifestyle de alto padrão. Estratégia integrada, branding e contratos exclusivos.',
    'https://lumahouse.exemplo',
    true
  )
on conflict (user_id) do nothing;
