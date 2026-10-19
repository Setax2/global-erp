insert into public.permisos (clave, modulo, descripcion, admite_alcance) values
 ('contactos.ver','contactos','Ver contactos',true),
 ('contactos.crear','contactos','Crear contactos',false),
 ('contactos.editar','contactos','Editar contactos',true),
 ('contactos.borrar','contactos','Borrar contactos',true),
 ('contactos.ver_bancarios','contactos','Ver datos bancarios de contactos',false),
 ('contactos.editar_bancarios','contactos','Editar datos bancarios de contactos',false),
 ('configuracion.empresa','configuracion','Editar los datos de la empresa',false),
 ('configuracion.miembros','configuracion','Gestionar empleados con acceso',false),
 ('configuracion.roles','configuracion','Gestionar roles y permisos',false),
 ('configuracion.tipos_contacto','configuracion','Gestionar tipos de contacto',false),
 ('configuracion.campos','configuracion','Gestionar campos personalizados',false)
on conflict (clave) do nothing;
