// frontend/src/app/api/devops/dashboard/route.ts
import { promises as fs } from 'fs'
import csv from 'csvtojson'
import path from 'path'

// Requisito: Forzar runtime de Node.js
export const runtime = 'nodejs'

export async function GET() {
  try {
    // Usamos process.cwd() que apunta a la carpeta "frontend"
    // para crear un "path absoluto" libre de errores hacia "src/core_data"
    const basePath = path.join(process.cwd(), 'src', 'core_data')

    // 1. Rutas exactas a los 3 archivos requeridos
    const pathUsuarios = path.join(basePath, 'usuarios.csv')
    const pathPipelines = path.join(basePath, 'pipelines_runs.csv')
    const pathAuthor = path.join(basePath, 'author_consist.csv')

    // 2. Lectura correcta de los 3 archivos en memoria usando "fs"
    const usuariosCsv = await fs.readFile(pathUsuarios, 'utf-8')
    const pipelinesCsv = await fs.readFile(pathPipelines, 'utf-8')
    const authorCsv = await fs.readFile(pathAuthor, 'utf-8')

    // 3. Imprimir cantidad de filas (Criteria: "logs muestran cantidad de filas")
    console.log(`📄 usuarios.csv leídos: ${usuariosCsv.trim().split('\n').length} filas.`)
    console.log(`📄 pipelines_runs.csv leídos: ${pipelinesCsv.trim().split('\n').length} filas.`)
    console.log(`📄 author_consist.csv leídos: ${authorCsv.trim().split('\n').length} filas.`)

    // --- Conversión csv a json (Ticket 3) ---
    const [usuariosData, pipelinesData, authorsData] = await Promise.all([
      csv({ checkType: true }).fromString(usuariosCsv),
      csv({ checkType: true }).fromString(pipelinesCsv),
      csv({ checkType: true }).fromString(authorCsv)
    ])

    // --- Procesamiento de Métricas por equipo (Ticket 4) ---
    const equipoStats: any = {}
    const unionUsuarioAEquipo: any = {}

    // A. Leer y vincular nombres y usernames de github a los Equipos Oficiales
    usuariosData.forEach((u: any) => {
      const eq = u.nombre_equipo?.trim()
      const numC_nomCompleto = u.nombre_completo?.trim().toLowerCase()
      const numG_github = u.github_user_name?.trim().toLowerCase()

      // No contar a los marcados como "none"
      if (eq && eq !== 'none') {
        if (numC_nomCompleto) unionUsuarioAEquipo[numC_nomCompleto] = eq
        if (numG_github) unionUsuarioAEquipo[numG_github] = eq

        // Crear contenedor vacío de estadísticas por equipo
        if (!equipoStats[eq]) {
          equipoStats[eq] = {
            team: eq,
            total_commits: 0,
            sum_score: 0,
            num_devs: 0,
            total_pipelines: 0,
            success_pipelines: 0
          }
        }
      }
    })

    // B. Extraer datos de Score de "authorsData" (archivo author_consist)
    authorsData.forEach((a: any) => {
      const equipoVinculado = a.team?.trim()
      if (equipoVinculado && equipoStats[equipoVinculado]) {
        // Sumar todos los commits que reporta este dev
        equipoStats[equipoVinculado].total_commits += Number(a.total_commits) || 0

        // Acumular la puntuacion bruta para hacer promedios exactos
        const sCore = parseFloat(a.commit_score) || 0
        equipoStats[equipoVinculado].sum_score += sCore
        equipoStats[equipoVinculado].num_devs += 1
      }
    })

    // C. Contabilizar Pipelines y éxitos basados en quién disparó el pipeline
    pipelinesData.forEach((p: any) => {
      const nameVinculo = p.commit_author_name_norm?.trim().toLowerCase()

      // Ubicar a qué equipo pertenece el que gatilló el Pipeline:
      const devTeam = unionUsuarioAEquipo[nameVinculo]

      if (devTeam && equipoStats[devTeam]) {
        equipoStats[devTeam].total_pipelines += 1
        // Identificando Exitos vs Fracasos del CI Action en la red
        if (p.conclusion?.toLowerCase() === 'success') {
          equipoStats[devTeam].success_pipelines += 1
        }
      }
    })

    // D. Agrupar de Vuelta todo en formato Array para UI e impedir `NaNs` por división con zeros (Requisito Documento)
    const formatedMetricaList = Object.values(equipoStats).map((eData: any) => {
      const calculatedRawAvg = eData.num_devs > 0 ? eData.sum_score / eData.num_devs : 0
      const calculateCirawRate =
        eData.total_pipelines > 0 ? eData.success_pipelines / eData.total_pipelines : 0

      return {
        team: eData.team,
        avg_commit_score: Number(calculatedRawAvg.toFixed(2)),
        ci_success_rate: Number(calculateCirawRate.toFixed(2)),
        total_commits: eData.total_commits,
        total_pipelines: eData.total_pipelines
      }
    })

    // 4. Se entrega lo acordado según Requisitos de Formato de Endpoint
    return Response.json({ teams: formatedMetricaList }, { status: 200 })
  } catch (error) {
    console.error('Error procesando dashboard stats:', error)
    return Response.json(
      { error: 'Error en ruta/procesamiento o datos faltantes en core_data' },
      { status: 500 }
    )
  }
}
