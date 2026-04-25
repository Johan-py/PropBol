"use client";

import { Camera } from "lucide-react";

interface BlogImageSectionProps {
  imagePreviewUrl: string;
  onImageChange: (file: File | null) => void;
  error?: string;
}

export default function BlogImageSection({ 
  imagePreviewUrl, 
  onImageChange, 
  error 
}: BlogImageSectionProps) {
  return (
    <div className="space-y-2">
      <label className="relative flex min-h-[300px] cursor-pointer flex-col items-center justify-center rounded-[32px] border-2 border-dashed border-[#E7E5E4] bg-[#FAFAFA] px-10 py-12 text-center transition hover:border-[#F59E0B] hover:bg-white group">
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0] ?? null;
            onImageChange(file);
          }}
        />

        {imagePreviewUrl ? (
          <div className="absolute inset-0 overflow-hidden rounded-[32px]">
            <img
              src={imagePreviewUrl}
              alt="Preview"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 transition group-hover:opacity-100 flex items-center justify-center">
              <Camera className="h-10 w-10 text-white" />
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-black/5">
              <Camera className="h-6 w-6 text-[#A8A29E]" />
            </div>
            <p className="text-base font-semibold text-[#1C1917]">
              Arrastra y suelta la imagen destacada
            </p>
            <p className="mt-1 text-xs font-medium text-[#78716C]">
              Recomendado: 1920×820px (JPG, PNG)
            </p>
          </>
        )}
      </label>
      {error && (
        <p className="px-2 text-sm font-medium text-red-500">{error}</p>
      )}
    </div>
  );
}
