// frontend/src/app/api/devops/dashboard/route.ts
import { promises as fs } from 'fs'
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
    // Se usa un simple .trim().split('\n') para contar las líneas/saltos de texto en este punto
    console.log(`📄 usuarios.csv leídos: ${usuariosCsv.trim().split('\n').length} filas.`)
    console.log(`📄 pipelines_runs.csv leídos: ${pipelinesCsv.trim().split('\n').length} filas.`)
    console.log(`📄 author_consist.csv leídos: ${authorCsv.trim().split('\n').length} filas.`)

    return Response.json({ message: 'archivos leídos correctamente en backend' })
  } catch (error) {
    // Si los archivos no existen o la ruta está mal, logueará un error para evitar crashes totales.
    console.error('Error al leer los archivos de la carpeta core_data:', error)
    return Response.json({ error: 'Error leyendo archivos' }, { status: 500 })
  }
}
