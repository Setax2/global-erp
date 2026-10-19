alter table public.empresas enable row level security;
alter table public.usuarios enable row level security;
alter table public.permisos enable row level security;
alter table public.roles enable row level security;
alter table public.roles_permisos enable row level security;
alter table public.miembros enable row level security;
alter table public.contactos enable row level security;
alter table public.contactos_tipos enable row level security;
alter table public.contactos_datos_bancarios enable row level security;
alter table public.tipos_contacto enable row level security;
alter table public.campos_personalizados enable row level security;

create policy empresas_ver on public.empresas for select to authenticated using (privado.es_miembro(id));
create policy empresas_editar on public.empresas for update to authenticated
  using (privado.tiene_permiso(id, 'configuracion.empresa')) with check (privado.tiene_permiso(id, 'configuracion.empresa'));

create policy usuarios_ver on public.usuarios for select to authenticated
  using (id = (select auth.uid()) or privado.comparte_empresa(id));
create policy usuarios_editar on public.usuarios for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()) and (ultima_empresa_id is null or privado.es_miembro(ultima_empresa_id)));

create policy permisos_ver on public.permisos for select to authenticated using (true);

create policy roles_ver on public.roles for select to authenticated using (privado.es_miembro(empresa_id));
create policy roles_crear on public.roles for insert to authenticated
  with check (privado.tiene_permiso(empresa_id, 'configuracion.roles') and (not es_admin or privado.es_admin(empresa_id)));
create policy roles_editar on public.roles for update to authenticated
  using (privado.tiene_permiso(empresa_id, 'configuracion.roles') and (not es_admin or privado.es_admin(empresa_id)))
  with check (privado.tiene_permiso(empresa_id, 'configuracion.roles') and (not es_admin or privado.es_admin(empresa_id)));
create policy roles_borrar on public.roles for delete to authenticated
  using (privado.tiene_permiso(empresa_id, 'configuracion.roles') and (not es_admin or privado.es_admin(empresa_id)));

create policy roles_permisos_ver on public.roles_permisos for select to authenticated
  using (privado.es_miembro(privado.empresa_de_rol(rol_id)));
create policy roles_permisos_gestionar on public.roles_permisos for all to authenticated
  using (privado.tiene_permiso(privado.empresa_de_rol(rol_id), 'configuracion.roles'))
  with check (privado.tiene_permiso(privado.empresa_de_rol(rol_id), 'configuracion.roles'));

create policy miembros_ver on public.miembros for select to authenticated using (privado.es_miembro(empresa_id));
create policy miembros_crear on public.miembros for insert to authenticated
  with check (privado.tiene_permiso(empresa_id, 'configuracion.miembros') and (not privado.rol_es_admin(rol_id) or privado.es_admin(empresa_id)));
create policy miembros_editar on public.miembros for update to authenticated
  using (privado.tiene_permiso(empresa_id, 'configuracion.miembros'))
  with check (privado.tiene_permiso(empresa_id, 'configuracion.miembros') and (not privado.rol_es_admin(rol_id) or privado.es_admin(empresa_id)));
create policy miembros_borrar on public.miembros for delete to authenticated
  using (privado.tiene_permiso(empresa_id, 'configuracion.miembros') and (not privado.rol_es_admin(rol_id) or privado.es_admin(empresa_id)));

create policy contactos_ver on public.contactos for select to authenticated
  using (privado.puede(empresa_id, 'contactos.ver', responsable_id));
create policy contactos_crear on public.contactos for insert to authenticated
  with check (privado.tiene_permiso(empresa_id, 'contactos.crear') and privado.puede(empresa_id, 'contactos.ver', responsable_id));
create policy contactos_editar on public.contactos for update to authenticated
  using (privado.puede(empresa_id, 'contactos.editar', responsable_id))
  with check (privado.puede(empresa_id, 'contactos.editar', responsable_id));
create policy contactos_borrar on public.contactos for delete to authenticated
  using (privado.puede(empresa_id, 'contactos.borrar', responsable_id));

create policy contactos_tipos_ver on public.contactos_tipos for select to authenticated
  using (exists (select 1 from public.contactos c where c.id = contacto_id));
create policy contactos_tipos_gestionar on public.contactos_tipos for all to authenticated
  using ((privado.tiene_permiso(empresa_id, 'contactos.editar') or privado.tiene_permiso(empresa_id, 'contactos.crear'))
         and exists (select 1 from public.contactos c where c.id = contacto_id))
  with check ((privado.tiene_permiso(empresa_id, 'contactos.editar') or privado.tiene_permiso(empresa_id, 'contactos.crear'))
         and exists (select 1 from public.contactos c where c.id = contacto_id));

create policy bancarios_ver on public.contactos_datos_bancarios for select to authenticated
  using (privado.tiene_permiso(empresa_id, 'contactos.ver_bancarios') and exists (select 1 from public.contactos c where c.id = contacto_id));
create policy bancarios_gestionar on public.contactos_datos_bancarios for all to authenticated
  using (privado.tiene_permiso(empresa_id, 'contactos.editar_bancarios') and exists (select 1 from public.contactos c where c.id = contacto_id))
  with check (privado.tiene_permiso(empresa_id, 'contactos.editar_bancarios') and exists (select 1 from public.contactos c where c.id = contacto_id));

create policy tipos_contacto_ver on public.tipos_contacto for select to authenticated using (privado.es_miembro(empresa_id));
create policy tipos_contacto_crear on public.tipos_contacto for insert to authenticated
  with check (privado.tiene_permiso(empresa_id, 'configuracion.tipos_contacto') and not de_sistema);
create policy tipos_contacto_editar on public.tipos_contacto for update to authenticated
  using (privado.tiene_permiso(empresa_id, 'configuracion.tipos_contacto'))
  with check (privado.tiene_permiso(empresa_id, 'configuracion.tipos_contacto'));
create policy tipos_contacto_borrar on public.tipos_contacto for delete to authenticated
  using (privado.tiene_permiso(empresa_id, 'configuracion.tipos_contacto') and not de_sistema);

create policy campos_ver on public.campos_personalizados for select to authenticated using (privado.es_miembro(empresa_id));
create policy campos_gestionar on public.campos_personalizados for all to authenticated
  using (privado.tiene_permiso(empresa_id, 'configuracion.campos'))
  with check (privado.tiene_permiso(empresa_id, 'configuracion.campos'));
