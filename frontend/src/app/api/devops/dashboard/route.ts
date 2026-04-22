// frontend/src/app/api/devops/dashboard/route.ts
import { promises as fs } from 'fs'
import csv from 'csvtojson'
import path from 'path'

// Requisito: Forzar runtime de Node.js
export const runtime = 'nodejs'

export async function GET() {
  let usuariosCsv = ''
  let pipelinesCsv = ''
  let authorCsv = ''

  // === TICKET 10: MANEJO ESPECÍFICO DE ARCHIVO NO ENCONTRADO ===
  try {
    const basePath = path.join(process.cwd(), 'src', 'core_data')
    usuariosCsv = await fs.readFile(path.join(basePath, 'usuarios.csv'), 'utf-8')
    pipelinesCsv = await fs.readFile(path.join(basePath, 'pipelines_runs.csv'), 'utf-8')
    authorCsv = await fs.readFile(path.join(basePath, 'author_consist.csv'), 'utf-8')

    // TICKET 10: Validación "CSV vacío"
    if (!usuariosCsv.trim() || !pipelinesCsv.trim() || !authorCsv.trim()) {
      throw new Error('Uno de los CSV se encuentra vacío')
    }
  } catch (error) {
    // Ejemplo esperado textualmente en el TICKET 10
    return Response.json({ error: 'Error leyendo archivos CSV' }, { status: 500 })
  }

  // Lógica principal
  try {
    console.log(`📄 usuarios.csv leídos: ${usuariosCsv.trim().split('\n').length} filas.`)
    console.log(`📄 pipelines_runs.csv leídos: ${pipelinesCsv.trim().split('\n').length} filas.`)
    console.log(`📄 author_consist.csv leídos: ${authorCsv.trim().split('\n').length} filas.`)

    // --- Conversión csv a json ---
    const [usuariosData, pipelinesData, authorsData] = await Promise.all([
      csv({ checkType: true }).fromString(usuariosCsv),
      csv({ checkType: true }).fromString(pipelinesCsv),
      csv({ checkType: true }).fromString(authorCsv)
    ])

    // === TICKET 10: Validaciones Obligatorias de "Columnas Faltantes" ===
    // (Verificamos y prevenimos usando las validaciones pedidas en doc sin crashear)
    const faltaUsuariosCol = usuariosData.length > 0 && !('nombre_equipo' in usuariosData[0])
    const faltaPipelineCol = pipelinesData.length > 0 && !('conclusion' in pipelinesData[0])
    const faltaAuthorCol = authorsData.length > 0 && !('commit_score' in authorsData[0])

    if (faltaUsuariosCol || faltaPipelineCol || faltaAuthorCol) {
      console.warn(
        '⚠️ Validacion T10: Faltan columnas en los datos base, algunos resultados pueden ir en ceros'
      )
    }

    // --- Tu procesamiento de Métricas Intacto (Ticket 4) ---
    const equipoStats: any = {}
    const unionUsuarioAEquipo: any = {}

    // A. Leer y vincular
    usuariosData.forEach((u: any) => {
      const eq = u.nombre_equipo?.trim()
      const numC_nomCompleto = u.nombre_completo?.trim().toLowerCase()
      const numG_github = u.github_user_name?.trim().toLowerCase()

      if (eq && eq !== 'none') {
        if (numC_nomCompleto) unionUsuarioAEquipo[numC_nomCompleto] = eq
        if (numG_github) unionUsuarioAEquipo[numG_github] = eq

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

    // B. Scores
    authorsData.forEach((a: any) => {
      const equipoVinculado = a.team?.trim()
      if (equipoVinculado && equipoStats[equipoVinculado]) {
        equipoStats[equipoVinculado].total_commits += Number(a.total_commits) || 0
        const sCore = parseFloat(a.commit_score) || 0
        equipoStats[equipoVinculado].sum_score += sCore
        equipoStats[equipoVinculado].num_devs += 1
      }
    })

    // C. Contabilizar CI
    pipelinesData.forEach((p: any) => {
      const nameVinculo = p.commit_author_name_norm?.trim().toLowerCase()
      const devTeam = unionUsuarioAEquipo[nameVinculo]

      if (devTeam && equipoStats[devTeam]) {
        equipoStats[devTeam].total_pipelines += 1
        if (p.conclusion?.toLowerCase() === 'success') {
          equipoStats[devTeam].success_pipelines += 1
        }
      }
    })

    // D. Agrupar evitando DivisionByZero
    const formatedMetricaList = Object.values(equipoStats).map((eData: any) => {
      // Uso extra del operador condicional asegura prevenir caidas de memoria
      const calculatedRawAvg = eData.num_devs > 0 ? eData.sum_score / eData.num_devs : 0
      const calculateCirawRate =
        eData.total_pipelines > 0 ? eData.success_pipelines / eData.total_pipelines : 0

      return {
        team: eData.team,
        avg_commit_score: Number(calculatedRawAvg.toFixed(2)) || 0,
        ci_success_rate: Number(calculateCirawRate.toFixed(2)) || 0,
        total_commits: eData.total_commits || 0,
        total_pipelines: eData.total_pipelines || 0
      }
    })

    return Response.json({ teams: formatedMetricaList }, { status: 200 })
  } catch (error) {
    // TICKET 10: "Manejar Errores de Parsing"
    console.error('Error general parsing CSV - T10 Crash Prevention:', error)
    return Response.json({ error: 'Error durante el parseo CSV/calculo' }, { status: 500 })
  }
}
