// Con los dos puntos (../) salimos de 'app' y entramos a 'components'
import Hero from '../components/layout/Hero'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-gray-50">
      {/* Aquí llamamos a los componentes que acabo de crear */}
      
      <Hero />
    </main>
  )
}