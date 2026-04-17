"use client";

import { Share2 } from 'lucide-react';

export default function ShareButton({ title }: { title: string }) {
  const handleShare = async () => {
    // Puliamo il titolo da eventuali tag HTML
    const cleanTitle = title.replace(/<[^>]*>?/gm, '');
    const url = window.location.href; // Prende in automatico il link esatto della pagina

    if (navigator.share) {
      try {
        await navigator.share({
          title: cleanTitle,
          text: `Leggi questo EBM Report su Il Divulgatore: ${cleanTitle}`,
          url: url,
        });
      } catch (error) {
        console.log('Condivisione annullata', error);
      }
    } else {
      // Se il browser (es. un vecchio PC) non supporta il menu nativo, copia il link
      navigator.clipboard.writeText(url);
      alert("Link dell'articolo copiato negli appunti!");
    }
  };

  return (
    <button 
      onClick={handleShare}
      className="p-3 bg-[#1f2937] border-2 border-[#AE8854]/50 text-[#AE8854] rounded-xl hover:bg-[#AE8854] hover:text-[#111827] transition-all shadow-sm flex items-center justify-center group"
      title="Condividi Articolo"
    >
      <Share2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
    </button>
  );
}