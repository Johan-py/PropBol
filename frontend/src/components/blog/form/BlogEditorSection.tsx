"use client";

import { useState, RefObject } from "react";
import { Eye, Bold, Italic, List, Quote, Link as LinkIcon } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

interface BlogEditorSectionProps {
  contenido: string;
  setContenido: (val: string) => void;
  textareaRef: RefObject<HTMLTextAreaElement>;
  applyFormatting: (p: string, s?: string) => void;
  insertLink: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  error?: string;
}

export default function BlogEditorSection({
  contenido,
  setContenido,
  textareaRef,
  applyFormatting,
  insertLink,
  onKeyDown,
  error
}: BlogEditorSectionProps) {
  const [showPreview, setShowPreview] = useState(true);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#A8A29E]">
          Contenido del artículo
        </span>
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] transition-colors ${showPreview ? "text-[#B45309] hover:text-[#92400E]" : "text-[#78716C] hover:text-[#44403C]"
            }`}
        >
          <Eye className={`h-3 w-3 ${showPreview ? "" : "opacity-50"}`} />
          {showPreview ? "Ocultar vista previa" : "Mostrar vista previa"}
        </button>
      </div>

      <div className={`grid grid-cols-1 ${showPreview ? "lg:grid-cols-2" : "lg:grid-cols-1"} gap-px rounded-[32px] bg-[#F5F5F4] shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-black/5 overflow-hidden transition-all duration-300`}>
        {/* Editor Column */}
        <div className="bg-white flex flex-col">
          <div className="flex items-center gap-2 border-b border-[#F5F5F4] px-6 py-4">
            <button type="button" onClick={() => applyFormatting("**")} className="p-2 text-[#78716C] hover:bg-[#F5F5F4] rounded-lg transition"><Bold className="h-4 w-4" /></button>
            <button type="button" onClick={() => applyFormatting("*")} className="p-2 text-[#78716C] hover:bg-[#F5F5F4] rounded-lg transition"><Italic className="h-4 w-4" /></button>
            <button type="button" onClick={() => applyFormatting("\n- ", "")} className="p-2 text-[#78716C] hover:bg-[#F5F5F4] rounded-lg transition"><List className="h-4 w-4" /></button>
            <button type="button" onClick={() => applyFormatting("\n> ", "")} className="p-2 text-[#78716C] hover:bg-[#F5F5F4] rounded-lg transition"><Quote className="h-4 w-4" /></button>
            <div className="w-px h-6 bg-[#F5F5F4] mx-2" />
            <button type="button" onClick={insertLink} className="p-2 text-[#78716C] hover:bg-[#F5F5F4] rounded-lg transition"><LinkIcon className="h-4 w-4" /></button>
          </div>
          <textarea
            ref={textareaRef}
            value={contenido}
            onChange={(e) => setContenido(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Comienza a escribir tu historia aquí..."
            className="w-full flex-1 px-8 py-8 text-lg leading-relaxed text-[#44403C] outline-none resize-none min-h-[500px]"
          />
        </div>

        {/* Preview Column */}
        {showPreview && (
          <div className="bg-[#FAFAFA] flex flex-col border-l border-[#F5F5F4] animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="px-8 py-6 border-b border-[#F5F5F4] bg-[#F5F5F4]/30">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#78716C]">Vista Previa</span>
            </div>
            <div className="flex-1 px-8 py-8 overflow-y-auto max-h-[600px] prose prose-stone prose-amber">
              {contenido ? (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkBreaks]}
                  components={{
                    h1: ({ ...props }) => <h1 className="text-3xl font-bold mb-4 text-[#1C1917]" {...props} />,
                    h2: ({ ...props }) => <h2 className="text-2xl font-bold mb-3 text-[#1C1917]" {...props} />,
                    h3: ({ ...props }) => <h3 className="text-xl font-bold mb-2 text-[#1C1917]" {...props} />,
                    p: ({ ...props }) => <p className="text-base leading-relaxed text-[#44403C] mb-4" {...props} />,
                    ul: ({ ...props }) => <ul className="list-disc pl-5 mb-4 space-y-2 text-[#44403C]" {...props} />,
                    ol: ({ ...props }) => <ol className="list-decimal pl-5 mb-4 space-y-2 text-[#44403C]" {...props} />,
                    li: ({ ...props }) => <li className="text-[#44403C]" {...props} />,
                    blockquote: ({ ...props }) => (
                      <blockquote className="border-l-4 border-[#B45309] pl-4 italic text-[#78716C] my-4" {...props} />
                    ),
                    a: ({ ...props }) => (
                      <a className="text-[#B45309] underline hover:text-[#92400E] transition-colors" target="_blank" rel="noopener noreferrer" {...props} />
                    ),
                  }}
                >
                  {contenido}
                </ReactMarkdown>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-3 opacity-40 py-20">
                  <div className="h-12 w-12 rounded-full bg-stone-200 flex items-center justify-center"><Eye className="h-6 w-6 text-stone-400" /></div>
                  <p className="text-sm font-medium text-stone-500">El contenido formateado aparecerá aquí...</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {error && <p className="px-2 text-sm font-medium text-red-500">{error}</p>}
    </div>
  );
}
