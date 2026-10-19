create or replace function privado.mi_miembro(p_empresa uuid) returns uuid
language sql stable security definer set search_path = '' as $$
  select m.id from public.miembros m
  where m.empresa_id = p_empresa and m.usuario_id = (select auth.uid()) and m.activo
$$;

create or replace function privado.es_miembro(p_empresa uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select privado.mi_miembro(p_empresa) is not null
$$;

create or replace function privado.es_admin(p_empresa uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select coalesce((select r.es_admin from public.miembros m
    join public.roles r on r.id = m.rol_id and r.empresa_id = m.empresa_id
    where m.empresa_id = p_empresa and m.usuario_id = (select auth.uid()) and m.activo), false)
$$;

create or replace function privado.alcance(p_empresa uuid, p_permiso text) returns text
language sql stable security definer set search_path = '' as $$
  select case when r.es_admin then 'todo'
              else (select rp.alcance from public.roles_permisos rp where rp.rol_id = r.id and rp.permiso = p_permiso) end
  from public.miembros m
  join public.roles r on r.id = m.rol_id and r.empresa_id = m.empresa_id
  where m.empresa_id = p_empresa and m.usuario_id = (select auth.uid()) and m.activo
$$;

create or replace function privado.tiene_permiso(p_empresa uuid, p_permiso text) returns boolean
language sql stable security definer set search_path = '' as $$
  select privado.alcance(p_empresa, p_permiso) is not null
$$;

create or replace function privado.puede(p_empresa uuid, p_permiso text, p_responsable uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select case privado.alcance(p_empresa, p_permiso)
           when 'todo' then true
           when 'propio' then p_responsable is not null and p_responsable = privado.mi_miembro(p_empresa)
           else false end
$$;

create or replace function privado.empresa_de_rol(p_rol uuid) returns uuid
language sql stable security definer set search_path = '' as $$
  select empresa_id from public.roles where id = p_rol
$$;

create or replace function privado.rol_es_admin(p_rol uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select coalesce((select es_admin from public.roles where id = p_rol), false)
$$;

create or replace function privado.comparte_empresa(p_usuario uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.miembros a join public.miembros b on a.empresa_id = b.empresa_id
                 where a.usuario_id = (select auth.uid()) and a.activo and b.usuario_id = p_usuario)
$$;

create or replace function privado.nuevo_usuario() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.usuarios (id, email, nombre)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'nombre', new.raw_user_meta_data->>'full_name'))
  on conflict (id) do nothing;
  return new;
end $$;

create or replace function privado.asignar_responsable() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.responsable_id is null then
    new.responsable_id := privado.mi_miembro(new.empresa_id);
  end if;
  return new;
end $$;

create trigger al_crear_usuario after insert on auth.users
  for each row execute function privado.nuevo_usuario();

create trigger contactos_responsable before insert on public.contactos
  for each row execute function privado.asignar_responsable();

insert into public.usuarios (id, email) select id, email from auth.users on conflict (id) do nothing;

grant usage on schema privado to authenticated;
grant execute on all functions in schema privado to authenticated;
