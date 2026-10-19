# GLOBAL ERP

ERP desde cero, pensado para que la IA sea la forma principal de usarlo, y flexible para cualquier tipo de empresa.

## Principios

- **Multiempresa desde el primer día.** Cada tabla de negocio lleva `empresa_id` y la base de datos aísla los datos de cada empresa con seguridad por filas (RLS), aunque falle la aplicación.
- **Núcleo rígido, extensiones flexibles.** Lo que tiene que cuadrar siempre (contactos, catálogo, documentos, movimientos) va en tablas fijas; lo propio de cada empresa va en campos personalizados (`campos_extra`, JSONB) y módulos opcionales.
- **La IA actúa con los permisos de quien la usa, nunca con más.** Cada acción pasa por las mismas reglas que si la hiciera una persona desde una pantalla.

## Pila

- Base de datos: PostgreSQL en Supabase (región Frankfurt, `eu-central-1`)
- Aplicación web: Next.js 16 + TypeScript + Tailwind, sesión con `@supabase/ssr`
- Capa de IA: Claude vía API con herramientas concretas (pendiente)

## Estado

### Fase 1 — en curso
- [x] Empresas, usuarios, miembros (empleados con acceso), selección de empresa (`usuarios.ultima_empresa_id`)
- [x] Roles por empresa y permisos por módulo/acción, con alcance `todo` / `propio`
- [x] Contactos con varios papeles a la vez (cliente, proveedor, empleado, otros definidos por la empresa)
- [x] Datos bancarios separados, con permiso propio
- [x] Campos personalizados por empresa
- [x] Seguridad por filas en todas las tablas
- [x] Aplicación web: registro e inicio de sesión, crear empresa, selector de empresa
- [x] Contactos: listado con filtro por papel (clientes, proveedores, ambos…), búsqueda, alta y edición
- [ ] Gestión de empleados con acceso, roles y permisos desde la aplicación
- [ ] Datos bancarios y campos personalizados en la ficha de contacto
- [ ] Catálogo de productos y servicios
- [ ] Presupuestos

### Más adelante
- Recursos humanos: fichajes (registro de jornada), vacaciones, bajas, nóminas
- Facturación (con cumplimiento Verifactu)

## Desarrollo

```bash
npm install
npm run dev   # http://localhost:3000
```

## Publicación

En Vercel: importar este repositorio y desplegar, sin configuración extra. Después, en Supabase →
Authentication → URL Configuration, poner la dirección de Vercel como *Site URL* y añadir
`https://<tu-dominio>/auth/confirmar` a *Redirect URLs*, para que funcionen los correos de confirmación.

## Estructura

- `src/proxy.ts` — refresca la sesión y manda a `/entrar` a quien no la tiene
- `src/lib/contexto.ts` — usuario, empresas, empresa activa y permisos de la petición
- `src/app/(acceso)` — entrar y registrarse
- `src/app/(app)` — la aplicación: selector de empresa, empresas, contactos

## Base de datos

Las migraciones están en `supabase/migrations/`, con el mismo nombre y versión con que están aplicadas en Supabase.

Funciones clave:
- `public.crear_empresa(nombre, nif)` — crea la empresa con roles de serie (Administrador, Comercial, Almacén, Administración), tipos de contacto (Cliente, Proveedor, Empleado) y hace administrador a quien la crea.
- `privado.*` — comprobaciones de pertenencia y permisos usadas por las reglas de seguridad. El esquema `privado` no se expone por la API.
