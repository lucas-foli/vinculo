-- Allow PostgREST to embed agency data on matches (used by useMatches:
--   supabase.from("matches").select("*, agencies(*)"))
--
-- matches.agency_id and agencies.user_id both reference auth.users(id), so
-- there was no direct relationship for PostgREST to infer. Add an explicit FK
-- from matches.agency_id -> agencies.user_id to enable the embedded select.

alter table public.matches
  add constraint matches_agency_id_agencies_fkey
  foreign key (agency_id) references public.agencies(user_id) on delete cascade;
