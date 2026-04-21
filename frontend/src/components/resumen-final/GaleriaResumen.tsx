import type { VideoItem } from "./ResumenPanel";

interface Props {
  imagenes: string[];
  videos: VideoItem[];
}

export default function GaleriaResumen({ imagenes, videos }: Props) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-[#f7f7f7] p-6">
      <h3 className="mb-5 text-2xl font-semibold text-[#0f172a]">Multimedia</h3>

      <div className="mb-6">
        <p className="mb-3 text-lg font-semibold text-[#0f172a]">
          Fotos registradas
        </p>

        {imagenes.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {imagenes.map((imagen, index) => (
              <div
                key={`${imagen}-${index}`}
                className="relative h-32 overflow-hidden rounded-2xl md:h-36"
              >
                <img
                  src={imagen}
                  alt={`Foto ${index + 1}`}
                  className="h-full w-full object-cover"
                />

                {index === 2 && (
                  <span className="absolute left-2 top-2 rounded-md bg-blue-600 px-2 py-1 text-xs font-semibold text-white">
                    360°
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-6 text-center text-gray-500">
            No hay fotos registradas
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 pt-5">
        <p className="mb-3 text-lg font-semibold text-[#0f172a]">
          Videos registrados
        </p>

        {videos.length > 0 ? (
          <div className="space-y-3">
            {videos.map((video, index) => (
              <div
                key={`${video.titulo}-${index}`}
                className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3"
              >
                <div>
                  <p className="font-medium text-[#0f172a]">{video.titulo}</p>
                  <p className="text-sm text-gray-500">{video.tipo}</p>
                </div>
                <div className="text-2xl">🎥</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-6 text-center text-gray-500">
            No hay videos registrados
          </div>
        )}
      </div>
    </div>
  );
}
