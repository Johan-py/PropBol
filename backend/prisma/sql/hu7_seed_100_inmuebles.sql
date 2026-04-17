WITH owner AS (
  SELECT id AS propietario_id
  FROM usuario
  ORDER BY id
  LIMIT 1
),
nuevos_inmuebles AS (
  INSERT INTO inmueble (
    titulo,
    tipo_accion,
    categoria,
    precio,
    superficie_m2,
    nro_cuartos,
    nro_banos,
    descripcion,
    estado,
    fecha_publicacion,
    created_at,
    updated_at,
    propietario_id
  )
  SELECT
    'Inmueble demo ' || lpad(gs::text, 3, '0') AS titulo,
    CASE
      WHEN gs % 3 = 0 THEN 'ANTICRETO'::tipo_accion
      WHEN gs % 3 = 1 THEN 'VENTA'::tipo_accion
      ELSE 'ALQUILER'::tipo_accion
    END AS tipo_accion,
    CASE
      WHEN gs % 4 = 0 THEN 'CASA'::categoria
      WHEN gs % 4 = 1 THEN 'DEPARTAMENTO'::categoria
      WHEN gs % 4 = 2 THEN 'TERRENO'::categoria
      ELSE 'OFICINA'::categoria
    END AS categoria,
    (25000 + (gs * 1250))::numeric(12, 2) AS precio,
    (35 + (gs % 8) * 7)::numeric(10, 2) AS superficie_m2,
    (1 + (gs % 4)) AS nro_cuartos,
    (1 + (gs % 3)) AS nro_banos,
    'Inmueble demo generado para HU7, registro ' || gs AS descripcion,
    'ACTIVO'::estado_inmueble AS estado,
    NOW() AS fecha_publicacion,
    NOW() AS created_at,
    NOW() AS updated_at,
    owner.propietario_id
  FROM generate_series(1, 100) gs
  CROSS JOIN owner
  WHERE NOT EXISTS (
    SELECT 1
    FROM inmueble i
    WHERE i.titulo = 'Inmueble demo ' || lpad(gs::text, 3, '0')
  )
  RETURNING id, titulo, propietario_id
),
coords AS (
  SELECT
    id,
    titulo,
    propietario_id,
    row_number() OVER (ORDER BY id) AS rn
  FROM nuevos_inmuebles
)
INSERT INTO ubicacion_inmueble (
  latitud,
  longitud,
  direccion,
  inmueble_id,
  ubicacion_maestra_id,
  ciudad,
  zona
)
SELECT
  (-17.2500000 - (rn * 0.0017000))::numeric(10, 7) AS latitud,
  (-66.1000000 - ((rn % 12) * 0.0042000))::numeric(10, 7) AS longitud,
  titulo || ', Cochabamba' AS direccion,
  id AS inmueble_id,
  NULL AS ubicacion_maestra_id,
  CASE
    WHEN rn % 3 = 0 THEN 'Cercado'
    WHEN rn % 3 = 1 THEN 'Quillacollo'
    ELSE 'Sacaba'
  END AS ciudad,
  CASE
    WHEN rn % 4 = 0 THEN 'Zona Norte'
    WHEN rn % 4 = 1 THEN 'Zona Centro'
    WHEN rn % 4 = 2 THEN 'Zona Sur'
    ELSE 'Zona Mixta'
  END AS zona
FROM coords;