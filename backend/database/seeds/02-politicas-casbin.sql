-- =============================================================================
-- SEED: Políticas de Casbin (autorización)
-- =============================================================================
-- La tabla real se llama `casbin_rule` en el esquema `usuarios`. La crea el
-- propio DataSource de la app (synchronize: true) a partir de la entidad
-- src/core/authorization/entity/casbin.entity.ts, que tiene:
--   id, ptype, v0, v1, v2, v3, v4, v5, v6
--
-- IMPORTANTE: esa tabla NO tiene ningún índice único sobre
-- (ptype, v0, v1, v2). Por eso este script NO usa "ON CONFLICT DO NOTHING"
-- (no habría conflicto que detectar y se duplicarían las políticas al
-- reejecutarlo). En su lugar cada INSERT lleva un "WHERE NOT EXISTS".
--
-- ptype = 'p'  → política de permisos
--   v0 = sujeto  (rol, o '*' para cualquier rol)
--   v1 = objeto  (ruta, con el prefijo /api)
--   v2 = acción  (verbo HTTP en regex, o acción de UI para el frontend)
--   v3 = app     ('backend' o 'frontend'). NO participa del matching:
--                 el matcher de model.conf solo mira v0, v1 y v2. Sirve
--                 para que el frontend filtre qué botones mostrar.
--
-- Sobre el matching (model.conf usa keyMatch2 + regexMatch):
--   - ':id' captura UN segmento. '/api/documentos/:id' NO autoriza
--     '/api/documentos/5/descarga' (dos segmentos): hace falta una
--     política aparte para esa ruta.
--   - El verbo va en regex: 'GET|POST' casa GET o POST.
--   - CasbinGuard evalúa: Object.keys(query).length ? route.path : originalUrl
--     Se verificó que en esta versión de Nest AMBAS ramas devuelven una ruta
--     con el prefijo global y los placeholders ':id' intactos, así que las
--     políticas se escriben siempre con el prefijo /api.
--
-- Es idempotente: se puede reejecutar sin duplicar nada.
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- 1. ADMINISTRADOR — módulos nuevos
-- -----------------------------------------------------------------------------
INSERT INTO usuarios.casbin_rule (ptype, v0, v1, v2, v3)
SELECT 'p', 'ADMINISTRADOR', ruta, accion, 'backend'
FROM (VALUES
  ('/api/categorias-publicacion',                                        'GET|POST'),
  ('/api/categorias-publicacion/:id',                                    'PATCH'),
  ('/api/categorias-publicacion/:id/activacion',                         'PATCH'),
  ('/api/categorias-publicacion/:id/inactivacion',                       'PATCH'),

  ('/api/publicaciones',                                                 'GET|POST'),
  ('/api/publicaciones/:id',                                             'PATCH'),
  ('/api/publicaciones/:id/vista',                                        'POST'),
  ('/api/publicaciones/:id/publicacion',                                 'PATCH'),
  ('/api/publicaciones/:id/borrador',                                    'PATCH'),
  ('/api/publicaciones/:id/inactivacion',                                'PATCH'),

  ('/api/publicaciones/:idPublicacion/imagenes',                         'GET|POST'),
  ('/api/publicaciones/:idPublicacion/imagenes/:idImagen',               'PATCH|DELETE'),
  ('/api/publicaciones/:idPublicacion/imagenes/:idImagen/portada',       'PATCH'),
  ('/api/publicaciones/:idPublicacion/imagenes/:idImagen/activacion',    'PATCH'),
  ('/api/publicaciones/:idPublicacion/imagenes/:idImagen/inactivacion',  'PATCH'),

  ('/api/categorias-documento',                                          'GET|POST'),
  ('/api/categorias-documento/:id',                                      'PATCH'),
  ('/api/categorias-documento/:id/activacion',                           'PATCH'),
  ('/api/categorias-documento/:id/inactivacion',                         'PATCH'),

  ('/api/documentos',                                                    'GET|POST'),
  ('/api/documentos/:id',                                                'PATCH|DELETE'),
  ('/api/documentos/:id/descarga',                                       'POST'),
  ('/api/documentos/:id/activacion',                                     'PATCH'),
  ('/api/documentos/:id/inactivacion',                                   'PATCH'),

  ('/api/institucion',                                                   'GET|PUT')
) AS t(ruta, accion)
WHERE NOT EXISTS (
  SELECT 1 FROM usuarios.casbin_rule c
  WHERE c.ptype = 'p' AND c.v0 = 'ADMINISTRADOR'
    AND c.v1 = t.ruta AND c.v2 = t.accion
);

-- -----------------------------------------------------------------------------
-- 2. TECNICO — mismos permisos que ADMINISTRADOR, salvo /institucion que es
--    solo lectura. Ajusta estas políticas cuando definas laRoles reales.
-- -----------------------------------------------------------------------------
INSERT INTO usuarios.casbin_rule (ptype, v0, v1, v2, v3)
SELECT 'p', 'TECNICO', ruta, accion, 'backend'
FROM (VALUES
  ('/api/categorias-publicacion',                                        'GET|POST'),
  ('/api/categorias-publicacion/:id',                                    'PATCH'),
  ('/api/categorias-publicacion/:id/activacion',                         'PATCH'),
  ('/api/categorias-publicacion/:id/inactivacion',                       'PATCH'),

  ('/api/publicaciones',                                                 'GET|POST'),
  ('/api/publicaciones/:id',                                             'PATCH'),
  ('/api/publicaciones/:id/vista',                                        'POST'),
  ('/api/publicaciones/:id/publicacion',                                 'PATCH'),
  ('/api/publicaciones/:id/borrador',                                    'PATCH'),
  ('/api/publicaciones/:id/inactivacion',                                'PATCH'),

  ('/api/publicaciones/:idPublicacion/imagenes',                         'GET|POST'),
  ('/api/publicaciones/:idPublicacion/imagenes/:idImagen',               'PATCH|DELETE'),
  ('/api/publicaciones/:idPublicacion/imagenes/:idImagen/portada',       'PATCH'),
  ('/api/publicaciones/:idPublicacion/imagenes/:idImagen/activacion',    'PATCH'),
  ('/api/publicaciones/:idPublicacion/imagenes/:idImagen/inactivacion',  'PATCH'),

  ('/api/categorias-documento',                                          'GET|POST'),
  ('/api/categorias-documento/:id',                                      'PATCH'),
  ('/api/categorias-documento/:id/activacion',                           'PATCH'),
  ('/api/categorias-documento/:id/inactivacion',                         'PATCH'),

  ('/api/documentos',                                                    'GET|POST'),
  ('/api/documentos/:id',                                                'PATCH|DELETE'),
  ('/api/documentos/:id/descarga',                                       'POST'),
  ('/api/documentos/:id/activacion',                                     'PATCH'),
  ('/api/documentos/:id/inactivacion',                                   'PATCH'),

  ('/api/institucion',                                                   'GET')
) AS t(ruta, accion)
WHERE NOT EXISTS (
  SELECT 1 FROM usuarios.casbin_rule c
  WHERE c.ptype = 'p' AND c.v0 = 'TECNICO'
    AND c.v1 = t.ruta AND c.v2 = t.accion
);

-- -----------------------------------------------------------------------------
-- 3. PERMISOS DE UI PARA EL FRONTEND
--    El frontend lee estas filas vía GET /api/autorizacion/permisos, que
--    filtra por v3 = 'frontend'. Las acciones NO son verbos HTTP.
--    No autorizan nada: el matcher ignora v3.
-- -----------------------------------------------------------------------------
INSERT INTO usuarios.casbin_rule (ptype, v0, v1, v2, v3)
SELECT 'p', rol, ruta, accion, 'frontend'
FROM (VALUES
  ('ADMINISTRADOR', '/publicaciones', 'read|create|update|delete'),
  ('ADMINISTRADOR', '/categorias',    'read|create|update|delete'),
  ('ADMINISTRADOR', '/documentos',    'read|create|update|delete'),
  ('ADMINISTRADOR', '/institucion',   'read|update'),
  ('TECNICO',       '/publicaciones', 'read|create|update'),
  ('TECNICO',       '/categorias',    'read|create|update'),
  ('TECNICO',       '/documentos',    'read|create|update'),
  ('TECNICO',       '/institucion',   'read')
) AS t(rol, ruta, accion)
WHERE NOT EXISTS (
  SELECT 1 FROM usuarios.casbin_rule c
  WHERE c.ptype = 'p' AND c.v0 = t.rol
    AND c.v1 = t.ruta AND c.v2 = t.accion AND c.v3 = 'frontend'
);

-- -----------------------------------------------------------------------------
-- 4. RUTAS PÚBLICAS (cualquier rol, incluido USUARIO)
--    Solo lectura. OJO: los archivos binarios (imágenes y PDFs) NO aparecen
--    aquí porque se sirven por express.static en /api/archivos, fuera del
--    CasbinGuard. Si necesitas protegerlos, hay que mudar esa ruta a un
--    controller con el guard aplicado.
-- -----------------------------------------------------------------------------
INSERT INTO usuarios.casbin_rule (ptype, v0, v1, v2, v3)
SELECT 'p', '*', ruta, 'GET', 'backend'
FROM (VALUES
  ('/api/publicaciones/publicadas'),
  ('/api/publicaciones/destacadas'),
  ('/api/publicaciones/slug/:slug'),
  ('/api/documentos/destacados'),
  ('/api/documentos/versiones/:codigoDocumento')
) AS t(ruta)
WHERE NOT EXISTS (
  SELECT 1 FROM usuarios.casbin_rule c
  WHERE c.ptype = 'p' AND c.v0 = '*'
    AND c.v1 = t.ruta AND c.v2 = 'GET'
);

COMMIT;

-- =============================================================================
-- VERIFICACIÓN
-- =============================================================================
SELECT v0 AS rol, v1 AS ruta, v2 AS accion, v3 AS app
FROM usuarios.casbin_rule
WHERE ptype = 'p'
  AND (v1 LIKE '%publicacion%'
    OR v1 LIKE '%documento%'
    OR v1 LIKE '%categorias%'
    OR v1 LIKE '%institucion%')
ORDER BY v0, v1, v2;
