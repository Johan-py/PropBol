//FILTROS

'use client'

export default function Filters({ setFilters }) {
  return (
    <div style={{ padding: '10px' }}>
      <h3>Filtros</h3>

      <select onChange={(e) => setFilters((f) => ({ ...f, categoria: e.target.value }))}>
        <option value="">Inmueble</option>
        <option value="CASA">Casa</option>
        <option value="DEPARTAMENTO">Departamento</option>
        <option value="OFICINA">Oficina</option>
        <option value="TERRENO">Terreno</option>
      </select>

      <select onChange={(e) => setFilters((f) => ({ ...f, precio: e.target.value }))}>
        <option value="">Precio</option>
        <option value="bajo">Menor a 50k</option>
        <option value="alto">Mayor a 50k</option>
      </select>

      <select onChange={(e) => setFilters((f) => ({ ...f, tipo: e.target.value }))}>
        <option value="">Operacion</option>
        <option value="ALQUILER">Alquiler</option>
        <option value="ANTICRETO">Anticretico</option>
        <option value="VENTA">Venta</option>
      </select>
    </div>
  )
}
