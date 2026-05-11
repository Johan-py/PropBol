export default function ActiveSessions() {
  const sessions = [
  {
    id: 1,
    activity: 'Hace 2 min',
    status: 'Sesión actual',
  },
  {
    id: 2,
    activity: 'Hace 1 hora',
    status: 'Activa',
  },
  {
    id: 3,
    activity: 'Hace 3 días',
    status: 'Activa',
  },
];

  return (
    <div className="min-h-screen bg-[#EAEAEA] p-4">
      {/* Contenedor principal */}
      <div className="bg-[#D9D9D9] rounded-sm p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-black">
               Gestión de Sesiones Activas
          </h1>
             <p className="text-lg text-black mt-2">
               3 sesiones activas
            </p>
        </div>
        {/* Tabla/Card */}
        <div className="bg-[#F4F4F4] rounded-2xl p-8">

           {/* Header tabla */}
          <div className="max-w-5xl mx-auto grid grid-cols-4 bg-[#E8962F] text-white font-bold rounded-lg py-4 px-6 mb-4 text-center text-lg">
                <p>ID</p>
                <p>Última actividad</p>
                <p>Estado</p>
                <p>Acción</p>
                </div>
              <div className="space-y-3">

                 {sessions.map((session) => (
                    <div 
                   key={session.id}
                   className="max-w-5xl mx-auto grid grid-cols-4 items-center bg-[#E7DFD7] rounded-lg py-5 px-6 text-center text-lg">
                    
                    {/* ID */}
                <p>{session.id}.</p>

                {/* Última actividad */}
                <p>{session.activity}</p>

                {/* Estado */}
                <p>{session.status}</p>
              </div>
              ))}

            </div>
                
        </div>

      </div>
    </div>

  );
}