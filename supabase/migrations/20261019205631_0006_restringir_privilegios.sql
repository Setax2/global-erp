revoke all on public.empresas, public.usuarios, public.permisos, public.roles, public.roles_permisos,
  public.miembros, public.contactos, public.contactos_tipos, public.contactos_datos_bancarios,
  public.tipos_contacto, public.campos_personalizados from anon;

revoke insert, update, delete on public.empresas from authenticated;
grant update (nombre, nif) on public.empresas to authenticated;
revoke insert, update, delete on public.usuarios from authenticated;
grant update (nombre, ultima_empresa_id) on public.usuarios to authenticated;
revoke insert, update, delete on public.permisos from authenticated;

revoke execute on function public.crear_empresa(text, text) from public, anon;
grant execute on function public.crear_empresa(text, text) to authenticated;
revoke execute on all functions in schema privado from public, anon;
grant execute on all functions in schema privado to authenticated;
