create or replace function public.crear_empresa(p_nombre text, p_nif text default null) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := auth.uid();
  v_empresa uuid;
  v_admin uuid; v_comercial uuid; v_almacen uuid; v_administracion uuid;
begin
  if v_uid is null then raise exception 'Hay que iniciar sesión para crear una empresa'; end if;

  insert into public.empresas (nombre, nif, creado_por) values (p_nombre, p_nif, v_uid) returning id into v_empresa;

  insert into public.roles (empresa_id, nombre, descripcion, es_admin) values
    (v_empresa, 'Administrador', 'Acceso total', true) returning id into v_admin;
  insert into public.roles (empresa_id, nombre, descripcion) values
    (v_empresa, 'Comercial', 'Sus clientes y presupuestos') returning id into v_comercial;
  insert into public.roles (empresa_id, nombre, descripcion) values
    (v_empresa, 'Almacén', 'Consulta de contactos') returning id into v_almacen;
  insert into public.roles (empresa_id, nombre, descripcion) values
    (v_empresa, 'Administración', 'Gestión administrativa y contable') returning id into v_administracion;

  insert into public.roles_permisos (rol_id, permiso, alcance) values
    (v_comercial, 'contactos.ver', 'propio'),
    (v_comercial, 'contactos.crear', 'todo'),
    (v_comercial, 'contactos.editar', 'propio'),
    (v_almacen, 'contactos.ver', 'todo'),
    (v_administracion, 'contactos.ver', 'todo'),
    (v_administracion, 'contactos.crear', 'todo'),
    (v_administracion, 'contactos.editar', 'todo'),
    (v_administracion, 'contactos.ver_bancarios', 'todo'),
    (v_administracion, 'contactos.editar_bancarios', 'todo');

  insert into public.tipos_contacto (empresa_id, clave, nombre, de_sistema) values
    (v_empresa, 'cliente', 'Cliente', true),
    (v_empresa, 'proveedor', 'Proveedor', true),
    (v_empresa, 'empleado', 'Empleado', true);

  insert into public.miembros (empresa_id, usuario_id, rol_id) values (v_empresa, v_uid, v_admin);

  update public.usuarios set ultima_empresa_id = v_empresa where id = v_uid;

  return v_empresa;
end $$;
