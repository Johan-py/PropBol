import { Categoria, TipoAccion } from '@prisma/client'

export interface PropiedadMapa {
  id: number
  titulo: string
  precio: number
  tipo: TipoAccion //Tipo de operacion: venta, alquiler, anticretico.
  categoria: Categoria //Tipo de inmueble: casa, departamento, local, terreno.
  ubicacion: string
  lat: number
  lng: number
  //imagen: any
}
