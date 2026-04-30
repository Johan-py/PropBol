'use client'; // Exigido por Recharts y Next.js en Client-side hooks
import { useEffect, useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

export default function DashboardDevOps() {
  const [data, setData] = useState<{ teams: any[] } | null>(null);
  const [error, setError] = useState(false);

  // Implementacion TICKET 5 (Peticion por FETCH a lo que armamos previamente)
  useEffect(() => {
    async function loadMetricas() {
      try {
        const res = await fetch("/api/devops/dashboard");
        if (!res.ok) throw new Error("Falla al recuperar los datos");
        
        const jsonResponse = await res.json();
        // Console Log Obligatorio por el criterio de TICKET 6 ("datos visibles en consola")
        console.log("Datos frontend dashboard obtenidos: ", jsonResponse); 
        setData(jsonResponse);
      } catch (err) {
        console.error(err);
        setError(true);
      }
    }
    loadMetricas();
  }, []);

  // -- Preparaciones y Loading States base (Validaciones Doc Frontend)
  if (error) return <p className="text-red-500 font-bold m-5">Error cargando datos</p>;
  if (!data) return <p className="m-5 text-gray-500 animate-pulse">Cargando...</p>;

  // Usamos el Array final entregado en json.teams para pintar los graficos y las tablas 
  const losEquipos = data.teams;

  return (
    <div className="p-8 max-w-7xl mx-auto font-sans bg-slate-50 min-h-screen">
      <h1 className="text-3xl font-extrabold mb-8 text-slate-800">Dashboard DevOps Métricas</h1>

      {/* ------ TABLA SIMPLE MÍNIMA REQUERIDA (Ticket 6 by Roberto, completada aquí) ------ */}
      <div className="mb-10 bg-white p-4 shadow-sm border rounded-lg">
         <h2 className="text-xl font-bold mb-4">Tabla General</h2>
         <table className="min-w-full table-auto border-collapse">
           <thead className="bg-slate-200">
             <tr>
               <th className="p-3 text-left">Equipo</th>
	       <th className="p-3 text-left">Score</th>
               <th className="p-3 text-left">Calidad</th>
               <th className="p-3 text-left">CI Success Rate</th>
               <th className="p-3 text-left">Total Commits</th>
             </tr>
           </thead>
           <tbody>
             {losEquipos.map((row: any, i: number) => (
               <tr key={i} className="border-b">
                 <td className="p-3 font-semibold text-slate-700">{row.team}</td>
		 <td className="p-3 font-bold text-purple-600">{row.total_score}</td>
                 <td className="p-3 text-blue-600">{row.avg_commit_score}</td>
                 <td className="p-3 text-green-600">{row.ci_success_rate * 100}%</td>
                 <td className="p-3">{row.total_commits}</td>
               </tr>
             ))}
           </tbody>
         </table>
      </div>


      {/* ------ ZONA TICKET 7 MÍO (GRAFICOS EXIGIDOS) ------ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* GRÁFICO 1: Calidad de Commit Por equipo (AVG Score) */}
        <div className="bg-white p-6 shadow-sm border rounded-xl">
          <h2 className="text-lg font-bold mb-6 text-gray-700">Gráfico: Calidad por Equipo</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={losEquipos} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2}/>
                <XAxis dataKey="team" />
                <YAxis />
                <Tooltip />
                <Legend />
                {/* Barras requeridas Calidad por score_commit */}
                <Bar dataKey="avg_commit_score" fill="#3b82f6" name="Promedio Calidad Score" radius={[4, 4, 0, 0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* GRÁFICO 2: Tasas Exito de CI (%/1) de cada Equipo  */}
        <div className="bg-white p-6 shadow-sm border rounded-xl">
          <h2 className="text-lg font-bold mb-6 text-gray-700">Gráfico: Tasa Éxito Pipeline (CI)</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={losEquipos} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2}/>
                <XAxis dataKey="team" />
                <YAxis domain={[0, 1]} /> {/* 0 a 1 porque tu endpoint da 0.7 o asi */}
                <Tooltip />
                <Legend />
                <Bar dataKey="ci_success_rate" fill="#10b981" name="CI Success Rate" radius={[4, 4, 0, 0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}
