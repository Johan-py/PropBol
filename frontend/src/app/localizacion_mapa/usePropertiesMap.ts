'use client'

import { useEffect, useState } from 'react'
import { PropiedadMapa } from './types'

export function usePropertiesMap() {
  const [properties, setProperties] = useState<PropiedadMapa[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('http://localhost:5000/api/localizacionMapa')
      .then((res) => res.json())
      .then((data) => {
        console.log('DATA BACKEND:', data)
        setProperties(data.data)
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  return { properties, loading }
}
