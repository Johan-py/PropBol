import type { ResumenFinalData } from "./ResumenPanel";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";

function resolverUrlMultimedia(url: string) {
  if (!url) return "";

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  if (url.startsWith("/uploads")) {
    return `${API_BASE_URL}${url}`;
  }

  return url;
}
interface Props {
  multimedia: ResumenFinalData["multimedia"];
}

export default function GaleriaResumen({ multimedia }: Props) {
  const imagenes = multimedia.imagenes ?? [];
  const videos = multimedia.videos ?? [];

  return (
    <div className="h-full rounded-2xl border border-gray-200 bg-[#f7f7f7] p-6">
      <h3 className="mb-5 text-2xl font-semibold text-[#0f172a]">Multimedia</h3>

      <div className="mb-6">
        <p className="mb-3 text-lg font-semibold text-[#0f172a]">
          Fotos registradas
        </p>

        {imagenes.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {imagenes.map((imagen, index) => (
              <div
                key={`${imagen.id}-${index}`}
                className="relative h-32 overflow-hidden rounded-2xl md:h-36"
              >
                <img
                  src={resolverUrlMultimedia(imagen.url)}
                  alt={`Foto ${index + 1}`}
                  className="h-full w-full object-cover"
                />
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
                key={`${video.id}-${index}`}
                className="rounded-xl border border-gray-200 bg-white px-4 py-3"
              >
                <p className="font-medium text-[#0f172a]">Video {index + 1}</p>
                <p className="truncate text-sm text-gray-500">{video.url}</p>
                <p className="text-xs text-gray-400">{video.tipo}</p>
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
