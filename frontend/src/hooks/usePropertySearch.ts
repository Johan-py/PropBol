"use client"

import { useState } from "react"

export function usePropertySearch() {

  const [data, setData] = useState<any>(null)

  const searchProperties = async (tipos: string[], modo: string) => {

    const params = new URLSearchParams()

    tipos.forEach(tipo => {
      params.append("categoria", tipo)
    })

    params.append("tipoAccion", modo)

    const res = await fetch(
      `http://localhost:5000/api/properties/search?${params}`
    )

    const json = await res.json()

    console.log("RESULTADO JSON:")
    console.log(json)

    setData(json)

  }

  return {
    data,
    searchProperties
  }

}