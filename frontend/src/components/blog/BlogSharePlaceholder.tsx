'use client'
import React, { useState, useRef, useEffect } from 'react'
import { jsPDF } from 'jspdf'

interface BlogShareProps {
  title?: string;
  author?: string;
  category?: string;
  imageUrl?: string;
  description?: string;
}
// Componente para colocar las opciones de compartir del blog
export default function BlogSharePlaceholder({ 
  title, 
  author, 
  category, 
  imageUrl, 
  description 
}: BlogShareProps) {
  const [isDownloadOpen, setIsDownloadOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  
  const getUrl = () => typeof window !== 'undefined' ? window.location.href : '';
  const getTitle = () => title || (typeof document !== 'undefined' ? document.title : 'Blog PropBol');

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    setIsDownloadOpen(false);

    try {
      const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      let currentY = 25;

      // 1. Título
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      const titleLines = doc.splitTextToSize(getTitle(), contentWidth);
      doc.text(titleLines, margin, currentY);
      currentY += (titleLines.length * 10) + 5;

      // 2. Info (Autor y Categoría)
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text(`Por: ${author || 'Anónimo'} | Categoría: ${category || 'General'}`, margin, currentY);
      currentY += 10;

      // 3. Imagen
      if (imageUrl) {
        try {
          const img = new Image();
          img.crossOrigin = "Anonymous";
          
          await new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = () => reject();
            img.src = imageUrl;
          });

          const imgWidth = contentWidth;
          const imgHeight = (img.height * imgWidth) / img.width;
          
          if (currentY + imgHeight > 270) {
            doc.addPage();
            currentY = 20;
          }

          doc.addImage(img, 'JPEG', margin, currentY, imgWidth, imgHeight);
          currentY += imgHeight + 15;
        } catch (error) {
          console.error("Error cargando la imagen para el PDF:", error);
          currentY += 5;
        }
      }

      // 4. Descripción / Contenido
      doc.setFontSize(12);
      doc.setTextColor(30, 30, 30);
      doc.setFont('helvetica', 'normal');
      
      const cleanDescription = (description || '')
        .replace(/[#*`]/g, '')
        .replace(/\n\s*\n/g, '\n\n');

      const descLines: string[] = doc.splitTextToSize(cleanDescription, contentWidth);
      
      descLines.forEach((line: string) => {
        if (currentY > 280) {
          doc.addPage();
          currentY = 20;
        }
        doc.text(line, margin, currentY);
        currentY += 7;
      });

      // Pie de página
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`PropBol - ${getTitle()} | Página ${i} de ${totalPages}`, pageWidth / 2, 285, { align: 'center' });
      }

      doc.save(`${getTitle().substring(0, 30)}.pdf`);
    } catch (error) {
      console.error("Error al generar el PDF:", error);
      alert("Hubo un error al generar el PDF. Por favor intenta de nuevo.");
    } finally {
      setIsGenerating(false);
    }
  };

  const shareToGmail = () => { window.open(`https://mail.google.com/mail/?view=cm&fs=1&su=${encodeURIComponent(getTitle())}&body=${encodeURIComponent('¡Hola! Te comparto este artículo que me pareció interesante:\n\n' + getUrl())}`, '_blank') };

  const shareToWhatsApp = () => {
    const text = encodeURIComponent(`¡Hola! Te comparto este artículo que me pareció interesante:\n\n${getTitle()}\n${getUrl()}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const shareToLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(getUrl())}`, '_blank');
  };

  const shareToX = () => {
    const text = encodeURIComponent(`¡Hola! Te comparto este artículo que me pareció interesante de PropBol:\n\n${getTitle()}\n`);
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(getUrl())}&text=${text}`, '_blank');
  };

  const shareToFacebook = () => {
    const url = getUrl();
    const quote = `${getTitle()} | Lee más en PropBol`;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(quote)}`, '_blank');
  };

  // Cerrar menú al hacer clic fuera del modal peee
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsDownloadOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])


  return (
    <div className="mt-8 w-full rounded-2xl bg-white p-6 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-stone-100 min-h-[120px] transition-all duration-300">
      <div className="flex flex-col gap-6">
        <h3 className="text-xs font-bold uppercase tracking-[0.24em] text-[#a56400]">
          Compartir
        </h3>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center justify-start gap-4 sm:gap-5 md:gap-6">
            <button onClick={shareToGmail} className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-stone-100 hover:bg-stone-200 transition-colors duration-200 group shrink-0" title="Compartir por Gmail">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg"
                alt="Gmail"
                className="w-7 h-7 sm:w-8 sm:h-8 opacity-90 group-hover:opacity-100 transition-opacity"
              />
            </button>
            <button onClick={shareToWhatsApp} className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-stone-100 hover:bg-stone-200 transition-colors duration-200 group shrink-0" title="Compartir por WhatsApp">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                alt="WhatsApp"
                className="w-7 h-7 sm:w-8 sm:h-8 opacity-90 group-hover:opacity-100 transition-opacity"
              />
            </button>
            <button onClick={shareToFacebook} className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-stone-100 hover:bg-stone-200 transition-colors duration-200 group shrink-0" title="Compartir en Facebook">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/b/b8/2021_Facebook_icon.svg"
                alt="Facebook"
                className="w-7 h-7 sm:w-8 sm:h-8 opacity-90 group-hover:opacity-100 transition-opacity"
              />
            </button>
            <button onClick={shareToX} className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-stone-100 hover:bg-stone-200 transition-colors duration-200 group shrink-0" title="Compartir en X (Twitter)">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/c/ce/X_logo_2023.svg"
                alt="X"
                className="w-6 h-6 sm:w-7 sm:h-7 opacity-90 group-hover:opacity-100 transition-opacity"
              />
            </button>
            <button onClick={shareToLinkedIn} className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-stone-100 hover:bg-stone-200 transition-colors duration-200 group shrink-0" title="Compartir en LinkedIn">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png"
                alt="LinkedIn"
                className="w-7 h-7 sm:w-8 sm:h-8 opacity-90 group-hover:opacity-100 transition-opacity"
              />
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(getUrl());
                alert('¡Enlace copiado al portapapeles!');
              }}
              className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-stone-100 hover:bg-stone-200 transition-colors duration-200 group shrink-0"
              title="Copiar enlace"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-[22px] sm:h-[22px] opacity-90 group-hover:opacity-100 transition-opacity text-[#433527]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect width="14" height="14" x="8" y="8" rx="2.5" ry="2.5"></rect>
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
              </svg>
            </button>
          </div>

          {/* MENÚ DE DESCARGA */}
          <div className="relative w-full sm:w-56" ref={menuRef}>
            <button
              onClick={() => setIsDownloadOpen(!isDownloadOpen)}
              disabled={isGenerating}
              className={`flex items-center justify-between gap-3 w-full h-12 px-5 rounded-xl border transition-all duration-300 group whitespace-nowrap shrink-0 ${isDownloadOpen
                ? 'bg-stone-900 border-stone-900 text-white shadow-lg shadow-stone-200'
                : 'border-stone-200 hover:border-stone-400 hover:bg-stone-50 text-[#433527]'
                } ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center gap-2">
                {isGenerating ? (
                  <div className="w-4 h-4 border-2 border-stone-300 border-t-stone-100 rounded-full animate-spin" />
                ) : (
                  <svg viewBox="0 0 24 24" className={`w-[18px] h-[18px] ${isDownloadOpen ? 'text-stone-100' : 'text-[#433527]'}`} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                )}
                <span className="text-xs font-bold tracking-[0.1em]">
                  {isGenerating ? 'GENERANDO...' : 'DESCARGAR'}
                </span>
              </div>
              <svg viewBox="0 0 24 24" className={`w-4 h-4 transition-transform duration-300 ${isDownloadOpen ? 'rotate-180 text-white' : 'text-stone-400 group-hover:text-stone-600'}`} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>

            {/* DROPDOWN */}
            {isDownloadOpen && (
              <div className="absolute right-0 top-full mt-2.5 w-full bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-stone-100 p-2 z-50 animate-in fade-in zoom-in slide-in-from-top-2 duration-300 origin-top">
                <button
                  className="flex items-center w-full gap-3 px-3 py-3 rounded-xl hover:bg-stone-50 text-stone-700 transition-colors group"
                  onClick={handleDownloadPDF}
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 group-hover:bg-red-100 transition-colors shrink-0">
                    <svg viewBox="0 0 24 24" className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="9" y1="15" x2="15" y2="15"></line>
                    </svg>
                  </div>
                  <span className="text-sm font-semibold whitespace-nowrap">Descargar PDF</span>
                </button>

                <button
                  className="flex items-center w-full gap-3 px-3 py-3 rounded-xl hover:bg-stone-50 text-stone-700 transition-colors group"
                  onClick={async () => {
                    setIsDownloadOpen(false);
                    try {
                      // Buscar el elemento principal del artículo (el blog completo)
                      const articleElement = document.querySelector('article') as HTMLElement;
                      if (!articleElement) {
                        alert('No se encontró el contenido principal para descargar.');
                        return;
                      }

                      // Importar html2canvas dinámicamente para no engordar el bundle inicial
                      const html2canvas = (await import('html2canvas')).default;

                      // Capturar el HTML usando html2canvas
                      const canvas = await html2canvas(articleElement, {
                        scale: 2, // Mejor resolución
                        useCORS: true, // Para cargar imágenes externas sin error de CORS
                        backgroundColor: '#ffffff', // Fondo blanco por defecto
                        onclone: (clonedDoc) => {
                          // Ocultar componentes que no se deben incluir en la captura (comentarios, sidebar, etc.)
                          const elementsToHide = clonedDoc.querySelectorAll('.no-capture');
                          elementsToHide.forEach(el => {
                            (el as HTMLElement).style.display = 'none';
                          });
                          
                          // Ajustar el grid para que el contenido principal ocupe todo el ancho
                          const grid = clonedDoc.querySelector('.blog-grid-container') as HTMLElement;
                          if (grid) {
                            grid.style.gridTemplateColumns = '1fr';
                          }
                        }
                      });

                      // Convertir el canvas a URL de imagen
                      const url = canvas.toDataURL('image/jpeg', 0.9);

                      // Crear un enlace temporal y simular el clic para descargar
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${title?.replace(/\s+/g, '-').toLowerCase() || 'blog-completo'}.jpg`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                    } catch (error) {
                      console.error('Error al descargar el blog:', error);
                      alert('Hubo un error al intentar descargar el blog como imagen.');
                    }
                  }}
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 group-hover:bg-blue-100 transition-colors shrink-0">
                    <svg viewBox="0 0 24 24" className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <circle cx="8.5" cy="8.5" r="1.5"></circle>
                      <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>
                  </div>
                  <span className="text-sm font-semibold whitespace-nowrap">Descargar Imagen</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
