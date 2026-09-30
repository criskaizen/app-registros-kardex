# 🌱 Seeds — Datos iniciales

Scripts SQL para dejar el sistema en estado utilizable: categorías, roles y
políticas de autorización.

## 📋 Archivos

| Archivo | Qué inserta |
| :--- | :--- |
| `01-datos-iniciales.sql` | Categorías de publicación, categorías de documento, roles faltantes |
| `02-politicas-casbin.sql` | Políticas de Casbin (backend, frontend y rutas públicas) |

Ambos son **idempotentes**: se pueden reejecutar sin duplicar nada.

---

## ⚠️ Orden de ejecución

Las tablas las crea la propia aplicación al arrancar (`synchronize: true` en
`src/core/config/database/database.module.ts`), así que **primero hay que
levantar la app al menos una vez** y luego correr los scripts.

```bash
# 1. Configura tu .env (copia .env.sample) y crea los schemas
psql -U postgres -c "CREATE SCHEMA IF NOT EXISTS proyecto;"
psql -U postgres -c "CREATE SCHEMA IF NOT EXISTS usuarios;"
psql -U postgres -c "CREATE SCHEMA IF NOT EXISTS parametricas;"

# 2. Levanta la app para que se creen las tablas
npm run start:dev

# 3. En otra terminal, corre los seeds
psql -h localhost -U postgres -d database_db -f database/seeds/01-datos-iniciales.sql
psql -h localhost -U postgres -d database_db -f database/seeds/02-politicas-casbin.sql

# 4. Reinicia la app para que Casbin recargue las políticas
```

> **El paso 4 no es opcional.** `AuthorizationConfigModule` llama a
> `enforcer.loadPolicy()` una sola vez, al arrancar. Si insertas políticas con
> la app corriendo, Casbin no las verá hasta que reinicies.

---

## 🔑 Sobre el schema

Los scripts asumen los valores de `.env.sample`:

| Variable | Valor por defecto | Contiene |
| :--- | :--- | :--- |
| `DB_SCHEMA` | `proyecto` | Las 6 tablas nuevas del sistema institucional |
| `DB_SCHEMA_USUARIOS` | `usuarios` | `casbin_rule`, `roles`, `usuarios`, etc. |

Si cambiaste alguno, ajusta los prefijos de esquema en los `.sql`.

---

## 🧪 Verificación

```sql
-- 3 categorías de publicación
SELECT count(*) FROM proyecto.categorias_publicacion;   -- 3
SELECT count(*) FROM proyecto.categorias_documento;    -- 3

-- políticas insertadas
SELECT v0, count(*) FROM usuarios.casbin_rule
WHERE ptype = 'p' GROUP BY v0 ORDER BY v0;
```

---

## 🧠 Cómo funcionan las políticas (model.conf)

El modelo Casbin del proyecto es:

```
m = (r.sub == p.sub || p.sub == "*") && keyMatch2(r.obj, p.obj) && regexMatch(r.act, p.act)
```

Consecuencias prácticas al escribir políticas:

1. **`:id` captura un solo segmento.**
   `/api/documentos/:id` **no** autoriza `/api/documentos/5/descarga`.
   Cada ruta con sufijo necesita su propia política.

2. **El verbo va como regex**, no como igualdad: `GET|POST` casa ambos.

3. **Siempre con prefijo `/api`.** `CasbinGuard` evalúa
   `Object.keys(query).length ? route.path : originalUrl`. Se verificó
   empíricamente que en esta versión de Nest **ambas** ramas producen una
   ruta con el prefijo global y con los placeholders `:id` intactos:

   | Request | `resource` que recibe Casbin |
   | :--- | :--- |
   | `GET /api/documentos` | `/api/documentos` |
   | `GET /api/documentos?limite=10` | `/api/documentos` |
   | `GET /api/documentos/5` | `/api/documentos/5` |
   | `GET /api/documentos/5?detalle=1` | `/api/documentos/:id` |

   Nota la asimetría de la última fila: **con query params se compara contra
   el patrón de la ruta, sin query se compara contra la URL concreta.** Por eso
   una política escrita como `/api/documentos/:id` solo casa la variante con
   query params, y la variante literal `5` casa contra `/api/documentos/5`
   gracias a `keyMatch2`, que también acepta un valor fijo. Si alguna vez una
   ruta da problemas, esta tabla es el primer sitio donde mirar.

4. **El campo `v3` (app) no autoriza nada.** Solo lo usa
   `GET /api/autorizacion/permisos` para que el frontend sepa qué botones
   mostrar. Ahí las acciones son `read|create|update|delete`, no verbos HTTP.

5. **El sujeto `*` aplica a todos los roles**, incluido `USUARIO`.

---

## ⚠️ Archivos binarios sin protección

Las imágenes de publicaciones y los PDFs se sirven en `/api/archivos/<ruta>`
mediante `express.static` (ver `src/main.ts`), **fuera del `CasbinGuard`**.
Cualquiera que conozca la URL puede descargarlos.

Para un portal público es aceptable. Si necesitas restringirlos, hay que
convertir esa ruta en un controller con el guard aplicado, o mover los
archivos a un bucket con URLs firmadas.

---

## 🔐 Roles

Los roles `ADMINISTRADOR`, `TECNICO` y `USUARIO` vienen del proyecto base.
El script `01` solo los crea si no existen.

El script `02` le da a `TECNICO` los mismos permisos que a `ADMINISTRADOR`
salvo `/api/institucion` (solo lectura). **Esa es una decisión provisional**:
ajústala a tu definición real de roles antes de pasar a producción.
