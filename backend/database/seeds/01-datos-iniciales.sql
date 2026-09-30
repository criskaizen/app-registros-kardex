-- =============================================================================
-- SEED: Datos iniciales del Sistema Institucional
-- =============================================================================
-- Ejecutar DESPUÉS de levantar la app al menos una vez (para que
-- `synchronize: true` haya creado las tablas).
--
--   psql -h <host> -U <user> -d <database> -f database/seeds/01-datos-iniciales.sql
--
-- Es idempotente: se puede ejecutar varias veces sin duplicar registros.
-- =============================================================================

\set ON_ERROR_STOP on

BEGIN;

-- -----------------------------------------------------------------------------
-- 1. Categorías de publicación
-- -----------------------------------------------------------------------------
INSERT INTO proyecto.categorias_publicacion
  (codigo, nombre, descripcion, color, icono, _estado, _transaccion, _usuario_creacion)
VALUES
  ('NOTICIA',      'Noticias Institucionales', 'Novedades y notas de prensa de la institución',                '#1e40af', 'newspaper', 'ACTIVO', 'CREAR', 1),
  ('COMUNICADO',  'Comunicados Oficiales',    'Avisos importantes dirigidos a la población',                      '#b91c1c', 'megaphone',  'ACTIVO', 'CREAR', 1),
  ('CONVOCATORIA', 'Convocatorias Públicas',   'Convocatorias laborales, licitaciones y convocatorias ciudadanas', '#047857', 'briefcase',  'ACTIVO', 'CREAR', 1)
ON CONFLICT (codigo) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 2. Categorías de documento
-- -----------------------------------------------------------------------------
INSERT INTO proyecto.categorias_documento
  (codigo, nombre, descripcion, _estado, _transaccion, _usuario_creacion)
VALUES
  ('FORMULARIO', 'Formularios de Trámite',  'Formularios oficiales para trámites ciudadanos',              'ACTIVO', 'CREAR', 1),
  ('NORMATIVA',  'Normativas y Resoluciones', 'Leyes, decretos y resoluciones institucionales',           'ACTIVO', 'CREAR', 1),
  ('MANUAL',     'Guías y Manuales',        'Manuales de usuario y guías informativas',                   'ACTIVO', 'CREAR', 1)
ON CONFLICT (codigo) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 3. Roles (solo si la tabla está vacía: el proyecto base ya los trae)
-- -----------------------------------------------------------------------------
INSERT INTO usuarios.roles (rol, nombre, descripcion, _estado, _transaccion, _usuario_creacion)
SELECT 'ADMINISTRADOR', 'Administrador', 'Acceso total al sistema', 'ACTIVO', 'CREAR', 1
WHERE NOT EXISTS (SELECT 1 FROM usuarios.roles WHERE rol = 'ADMINISTRADOR');

INSERT INTO usuarios.roles (rol, nombre, descripcion, _estado, _transaccion, _usuario_creacion)
SELECT 'TECNICO', 'Técnico', 'Operación y consulta del sistema', 'ACTIVO', 'CREAR', 1
WHERE NOT EXISTS (SELECT 1 FROM usuarios.roles WHERE rol = 'TECNICO');

INSERT INTO usuarios.roles (rol, nombre, descripcion, _estado, _transaccion, _usuario_creacion)
SELECT 'USUARIO', 'Usuario', 'Acceso al portal público', 'ACTIVO', 'CREAR', 1
WHERE NOT EXISTS (SELECT 1 FROM usuarios.roles WHERE rol = 'USUARIO');

COMMIT;

-- =============================================================================
-- VERIFICACIÓN
-- =============================================================================
SELECT codigo, nombre, _estado FROM proyecto.categorias_publicacion ORDER BY codigo;
SELECT codigo, nombre, _estado FROM proyecto.categorias_documento ORDER BY codigo;
SELECT rol, nombre, _estado FROM usuarios.roles ORDER BY rol;
