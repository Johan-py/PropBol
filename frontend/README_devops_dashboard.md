# 📊 DevOps Metrics Dashboard

## Descripción General
Este proyecto implementa un dashboard diseñado para analizar, calcular y visualizar el rendimiento y la calidad de código de múltiples equipos de desarrollo. El sistema procesa métricas provenientes de repositorios y pipelines.

---

## 🏗️ Arquitectura del Sistema

El flujo de la aplicación se divide en tres capas principales:
```text
📁 ./
├── 📁 src/
│   ├── 📁 app/
│   │   ├── 📁 api/devops/dashboard/
│   │   │   └── 📄 route.ts           # Backend: Procesamiento y métricas
│   │   └── 📁 devops/dashboard/
│   │       └── 📄 page.tsx           # Frontend: Tabla y gráficos (Usando Recharts)
│   │
│   └── 📁 core_data/                 # Tablas (CSVs estáticos)
│       ├── 📄 author_consist.csv
│       ├── 📄 pipelines_runs.csv
│       └── 📄 usuarios.csv
│
└── 📄 README_devops_dashboard.md
```

1. **Ingesta de Datos:** Lectura de los archivos CSV.
2. **Capa de Procesamiento (API):** Un endpoint en el backend (`route.ts`) que vincula a los autores con sus respectivos equipos y realiza una serie de controles internos.
3. **Capa de Presentación (UI):** Una interfaz básica desarrollada en React/Next.js (`page.tsx`) que consume la API, ordena los datos de forma descendente y los renderiza utilizando componentes de `recharts`.

---

## 📂 Fuentes de Datos

El sistema se alimenta de tres archivos base (ubicados en `src/core_data/`):

* `usuarios.csv`: Diccionario que mapea el nombre completo y usuario de GitHub de cada desarrollador con su equipo asignado.
* `author_consist.csv`: Historial de commits que incluye puntajes individuales de calidad (`commit_score`), tamaño y frecuencia.
* `pipelines_runs.csv`: Registro de las ejecuciones de Integración Continua (CI), detallando si el pipeline fue exitoso (`success`) o fallido.

---

## 🧮 Sobre las Métricas y el puntaje general

Para evaluar a los equipos, el backend realiza calculos considerando lo siguiente:

### 1. Calidad Promedio de Commits
Evalúa la limpieza y consistencia del código enviado por el equipo. Se calcula promediando el score de todos los miembros:
* **Fórmula:** `(Suma de los scores de los commits del equipo) / (Número de desarrolladores en el equipo)`

### 2. Tasa de Éxito de CI (Success Rate)
Mide la estabilidad del código al pasar por las pruebas automatizadas.
* **Fórmula:** `(Pipelines exitosos del equipo) / (Total de pipelines ejecutados por el equipo)`

### 3. Score Total (Ranking Global)
Es la métrica definitiva utilizada para ordenar la tabla principal. Pondera por igual la calidad del código y la estabilidad de los despliegues, sumando una constante base por participación (esto debido al trabajo que varia entre epica y sprint).
* **Fórmula:** `(Calidad Promedio + (Tasa de Éxito CI * 100) + 100) / 3`
* *Nota técnica:* Los calculos pueden no ser exactos con lo mostrado en la tabla debido al procesamiento interno que considera todas las decimales.

---

## 💻 Interfaz de Usuario (Dashboard)

El panel principal ofrece las siguientes vistas:

* **Tabla ordenada descendiente de los Equipos:**
* **Gráfico de barras Calidad**
* **Gráfico de barras CI**

---

## 🛡️ Manejo de Errores

El sistema está diseñado para ser tolerante a fallos:
* **Validación de Archivos:** El backend verifica que los archivos CSV existan y no estén vacíos. Si detecta anomalías, previene caídas y emite advertencias.
* **Prevención de Caídas en UI:** El frontend implementa *fallbacks* de datos. Si la API demora o falla en la entrega de la lista de equipos, la interfaz renderiza componentes vacíos en lugar de generar errores que puedan bloquear la UX.

---

## 🚀 Instalación y Ejecución

1. Clonar el repositorio, si ya tiene una copia local, dirigirse a la rama devops lorem
2. Asegurar que los archivos CSV correspondientes se encuentren en el directorio `src/core_data/`.
3. Instalar las dependencias:
   ```bash
   pnpm install
   ```
4. Levantar el servidor:
   ```bash
   pnpm dev
   ```
5. Navegar a http://localhost:3000/devops/dashboard para visualizar la página.
