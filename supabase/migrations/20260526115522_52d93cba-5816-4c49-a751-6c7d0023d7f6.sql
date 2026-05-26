
grant execute on function public.has_role(uuid, public.app_role) to authenticated, anon;

insert into public.user_roles (user_id, role)
values ('0abe861d-9a82-4548-b1e6-bfd8b735b879', 'admin')
on conflict (user_id, role) do nothing;
