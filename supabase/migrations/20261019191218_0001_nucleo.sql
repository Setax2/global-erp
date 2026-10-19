-- GLOBAL ERP · 0001 · Núcleo: empresas, usuarios, roles, permisos, contactos
-- Todas las tablas de negocio llevan empresa_id: cada empresa ve solo lo suyo.

create schema if not exists privado;

-- ── Empresas ───────────────────────────────────────────────────────────────
create table public.empresas (
  id          uuid primary key default gen_random_uuid(),
  nombre      text not null check (length(trim(nombre)) > 0),
  nif         text,
  creado_en   timestamptz not null default now(),
  creado_por  uuid references auth.users(id) on delete set null
);

-- ── Usuarios (quien inicia sesión; una persona, varias empresas) ───────────
create table public.usuarios (
  id                 uuid primary key references auth.users(id) on delete cascade,
  nombre             text,
  email              text,
  ultima_empresa_id  uuid references public.empresas(id) on delete set null,  -- selección de empresa
  creado_en          timestamptz not null default now()
);

-- ── Catálogo global de permisos ────────────────────────────────────────────
create table public.permisos (
  clave           text primary key,           -- p. ej. 'contactos.ver'
  modulo          text not null,
  descripcion     text not null,
  admite_alcance  boolean not null default false  -- si puede limitarse a "solo lo mío"
);

-- ── Roles (por empresa) ────────────────────────────────────────────────────
create table public.roles (
  id           uuid primary key default gen_random_uuid(),
  empresa_id   uuid not null references public.empresas(id) on delete cascade,
  nombre       text not null,
  descripcion  text,
  es_admin     boolean not null default false,   -- el rol administrador lo puede todo
  creado_en    timestamptz not null default now(),
  unique (empresa_id, nombre),
  unique (id, empresa_id)
);

create table public.roles_permisos (
  rol_id   uuid not null references public.roles(id) on delete cascade,
  permiso  text not null references public.permisos(clave) on delete cascade,
  alcance  text not null default 'todo' check (alcance in ('todo', 'propio')),
  primary key (rol_id, permiso)
);

-- ── Contactos: clientes, proveedores, empleados… son papeles de un contacto ─
create table public.contactos (
  id                uuid primary key default gen_random_uuid(),
  empresa_id        uuid not null references public.empresas(id) on delete cascade,
  tipo              text not null default 'empresa' check (tipo in ('persona', 'empresa')),
  nombre            text not null check (length(trim(nombre)) > 0),
  nombre_comercial  text,
  nif               text,
  email             text,
  telefono          text,
  direccion         text,
  codigo_postal     text,
  poblacion         text,
  provincia         text,
  pais              text default 'ES',
  notas             text,
  responsable_id    uuid,                                -- miembro responsable (p. ej. comercial)
  campos_extra      jsonb not null default '{}'::jsonb,  -- campos personalizados de cada empresa
  activo            boolean not null default true,
  creado_en         timestamptz not null default now(),
  actualizado_en    timestamptz not null default now(),
  unique (id, empresa_id)
);
create index contactos_empresa_idx on public.contactos (empresa_id);
create index contactos_responsable_idx on public.contactos (responsable_id);

-- ── Miembros: un usuario dentro de una empresa, con su rol ─────────────────
create table public.miembros (
  id           uuid primary key default gen_random_uuid(),
  empresa_id   uuid not null references public.empresas(id) on delete cascade,
  usuario_id   uuid not null references auth.users(id) on delete cascade,
  rol_id       uuid not null,
  contacto_id  uuid,                 -- su ficha de empleado (para RRHH)
  activo       boolean not null default true,
  creado_en    timestamptz not null default now(),
  unique (empresa_id, usuario_id),
  unique (id, empresa_id),
  foreign key (rol_id, empresa_id)      references public.roles(id, empresa_id),
  foreign key (contacto_id, empresa_id) references public.contactos(id, empresa_id) on delete set null (contacto_id)
);
create index miembros_usuario_idx on public.miembros (usuario_id);

alter table public.contactos
  add foreign key (responsable_id, empresa_id)
  references public.miembros(id, empresa_id) on delete set null (responsable_id);

-- Datos sensibles, aparte: se protegen con su propio permiso
create table public.contactos_datos_bancarios (
  contacto_id  uuid primary key,
  empresa_id   uuid not null,
  iban         text,
  bic          text,
  titular      text,
  actualizado_en timestamptz not null default now(),
  foreign key (contacto_id, empresa_id) references public.contactos(id, empresa_id) on delete cascade
);

-- Papeles de contacto (configurables por empresa: cliente, proveedor, empleado…)
create table public.tipos_contacto (
  id          uuid primary key default gen_random_uuid(),
  empresa_id  uuid not null references public.empresas(id) on delete cascade,
  clave       text not null,
  nombre      text not null,
  de_sistema  boolean not null default false,
  unique (empresa_id, clave),
  unique (id, empresa_id)
);

create table public.contactos_tipos (
  contacto_id  uuid not null,
  tipo_id      uuid not null,
  empresa_id   uuid not null,
  primary key (contacto_id, tipo_id),
  foreign key (contacto_id, empresa_id) references public.contactos(id, empresa_id) on delete cascade,
  foreign key (tipo_id, empresa_id)     references public.tipos_contacto(id, empresa_id) on delete cascade
);
create index contactos_tipos_tipo_idx on public.contactos_tipos (tipo_id);

-- ── Campos personalizados (definición; los valores van en campos_extra) ────
create table public.campos_personalizados (
  id           uuid primary key default gen_random_uuid(),
  empresa_id   uuid not null references public.empresas(id) on delete cascade,
  entidad      text not null,              -- 'contactos', más adelante 'articulos'…
  clave        text not null check (clave ~ '^[a-z][a-z0-9_]*$'),
  etiqueta     text not null,
  tipo         text not null check (tipo in ('texto', 'numero', 'fecha', 'booleano', 'lista')),
  opciones     jsonb,                      -- valores posibles si tipo = 'lista'
  obligatorio  boolean not null default false,
  orden        int not null default 0,
  unique (empresa_id, entidad, clave)
);

-- ── Fecha de última modificación automática ───────────────────────────────
create function privado.marcar_actualizado() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.actualizado_en := now();
  return new;
end $$;

create trigger contactos_actualizado before update on public.contactos
  for each row execute function privado.marcar_actualizado();
create trigger datos_bancarios_actualizado before update on public.contactos_datos_bancarios
  for each row execute function privado.marcar_actualizado();
