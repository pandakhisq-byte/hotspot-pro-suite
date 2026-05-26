
-- Lock function search_path
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.user_roles where user_id = _user_id and role = _role);
$$;
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, phone)
  values (new.id, new.email,
    coalesce(new.raw_user_meta_data->>'full_name',''),
    coalesce(new.raw_user_meta_data->>'phone',''));
  insert into public.user_roles (user_id, role) values (new.id, 'user');
  return new;
end;$$;
create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end;$$;

-- Revoke public execute on security-definer fns
revoke execute on function public.has_role(uuid, app_role) from public, anon;
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- Tighten payment insert: must include matching user_id (or null for guest by phone)
drop policy if exists "Anyone create tx" on public.transactions;
create policy "Authenticated create own tx" on public.transactions for insert
  with check (auth.uid() = user_id);
create policy "Guests create tx without user" on public.transactions for insert
  with check (user_id is null);
