import Image from 'next/image'

interface BannerProps {
  url: string
  title?: string
  subtitle?: string
}

export const HomeBanner = ({ url, title, subtitle }: BannerProps) => {
  return (
    /* h-[220px] -> Altura slim para móvil para ver el buscador rápido */
    /* md:h-[60vh] -> Altura completa para escritorio */
    <div className="relative w-full h-[220px] md:h-[60vh] bg-stone-200 flex items-center justify-center overflow-hidden">
      
      <Image 
        src={url} 
        alt="Portada principal" 
        fill 
        /* AQUÍ EL TRUCO: 
           En móvil usamos 'object-[80%_center]' para ver a las personas (derecha).
           En PC usamos 'md:object-center' para que se vea todo equilibrado.
        */
        className="object-cover object-[80%_center] md:object-center transition-all duration-500" 
        priority 
      />

      {/* Capa oscura para que el texto blanco siempre se lea bien */}
      <div className="absolute inset-0 bg-black/45 z-0" />

      {/* Contenido centrado con anchos máximos para que no desborde en móvil */}
      <div className="relative z-10 text-center px-4 py-4 flex flex-col gap-2 md:gap-6 items-center">
        {title && (
          <h1 className="text-xl md:text-5xl lg:text-6xl font-bold text-white drop-shadow-xl max-w-[280px] md:max-w-none text-balance">
            {title}
          </h1>
        )}
        
        {subtitle && (
          <p className="text-xs md:text-xl lg:text-2xl text-stone-200 drop-shadow-lg font-medium max-w-[240px] md:max-w-2xl text-balance">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  )
}