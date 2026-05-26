
alter table public.packages replica identity full;
alter table public.transactions replica identity full;
alter table public.routers replica identity full;

alter publication supabase_realtime add table public.packages;
alter publication supabase_realtime add table public.transactions;
alter publication supabase_realtime add table public.routers;
