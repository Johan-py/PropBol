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
      <div className="bg-[#D9D9D9] rounded-sm p-6">
      </div>
    </div>

  );
}