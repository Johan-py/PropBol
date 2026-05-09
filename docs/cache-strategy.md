# Estrategia de Caché: Tipo de Cambio Referencial

## 1. Funcionamiento del Revalidate (Caché Principal)
La implementación usa el caché nativo de Next.js (`revalidate: 1800`). El sistema es estrictamente on-demand: si nadie entra al Home, no se hacen peticiones a P2P.Army.
- **Menos de 30 minutos:** Next.js sirve el valor desde su caché interno instantáneamente sin consumir red.
- **Más de 30 minutos (Expirado):** Next.js sirve el último valor conocido al instante para no bloquear al usuario, y dispara una petición en background para actualizar el dato.

## 2. Instancia en Memoria (Fallback / Cold Start)
En el archivo `exchangeRateService.ts` se utilizará una variable global (`let moduleCache`). Esta variable actúa como una instancia en memoria que vive mientras el servidor Node.js/Next.js esté en ejecución.
- Si ocurre un *Cold Start* (el servidor despierta y el caché de Next.js está vacío) y P2P.Army rechaza la conexión, el servicio utilizará el valor guardado en `moduleCache` como red de seguridad para evitar que la UI falle.

## 3. Justificación: Por qué NO se usa Supabase
El proyecto cuenta con un plan limitado de base de datos en Supabase. Utilizar una tabla para guardar un solo número (el tipo de cambio) que se consulta en la página de mayor tráfico (el Home) generaría un exceso de lecturas/escrituras injustificado. La combinación del Data Cache de Next.js + la instancia en memoria (`moduleCache`) resuelve el problema con 0 llamadas a la base de datos y 0 costo adicional.
