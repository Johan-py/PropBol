CREATE TABLE IF NOT EXISTS "zona_predefinida" (
  "id" SERIAL PRIMARY KEY,
  "nombre" TEXT NOT NULL,
  "coordenadas" JSONB NOT NULL,
  "color" TEXT NOT NULL DEFAULT '#ea580c',
  "activa" BOOLEAN NOT NULL DEFAULT TRUE,
  "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO "zona_predefinida" ("nombre", "coordenadas", "color", "activa")
SELECT 'Zona Norte',   '[[-17.362,-66.157],[-17.362,-66.131],[-17.378,-66.131],[-17.378,-66.157]]'::jsonb, '#ea580c', TRUE
WHERE NOT EXISTS (SELECT 1 FROM "zona_predefinida" WHERE "nombre" = 'Zona Norte');

INSERT INTO "zona_predefinida" ("nombre", "coordenadas", "color", "activa")
SELECT 'Zona Centro',  '[[-17.388,-66.163],[-17.388,-66.143],[-17.402,-66.143],[-17.402,-66.163]]'::jsonb, '#ea580c', TRUE
WHERE NOT EXISTS (SELECT 1 FROM "zona_predefinida" WHERE "nombre" = 'Zona Centro');

INSERT INTO "zona_predefinida" ("nombre", "coordenadas", "color", "activa")
SELECT 'Zona Sur',     '[[-17.410,-66.160],[-17.410,-66.138],[-17.428,-66.138],[-17.428,-66.160]]'::jsonb, '#ea580c', TRUE
WHERE NOT EXISTS (SELECT 1 FROM "zona_predefinida" WHERE "nombre" = 'Zona Sur');

INSERT INTO "zona_predefinida" ("nombre", "coordenadas", "color", "activa")
SELECT 'Quillacollo',  '[[-17.390,-66.282],[-17.390,-66.256],[-17.408,-66.256],[-17.408,-66.282]]'::jsonb, '#ea580c', TRUE
WHERE NOT EXISTS (SELECT 1 FROM "zona_predefinida" WHERE "nombre" = 'Quillacollo');

INSERT INTO "zona_predefinida" ("nombre", "coordenadas", "color", "activa")
SELECT 'Tiquipaya',    '[[-17.332,-66.222],[-17.332,-66.196],[-17.348,-66.196],[-17.348,-66.222]]'::jsonb, '#ea580c', TRUE
WHERE NOT EXISTS (SELECT 1 FROM "zona_predefinida" WHERE "nombre" = 'Tiquipaya');

INSERT INTO "zona_predefinida" ("nombre", "coordenadas", "color", "activa")
SELECT 'Sacaba',       '[[-17.388,-66.072],[-17.388,-66.048],[-17.406,-66.048],[-17.406,-66.072]]'::jsonb, '#ea580c', TRUE
WHERE NOT EXISTS (SELECT 1 FROM "zona_predefinida" WHERE "nombre" = 'Sacaba');