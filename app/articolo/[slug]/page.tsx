import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft, Stethoscope, BookOpen } from 'lucide-react';

interface WPPost {
  title: { rendered: string };
  content: { rendered: string };
  date: string;
}

// Fetch super-ottimizzata
async function getPost(slug: string): Promise<WPPost | null> {
  const wpUrl = process.env.NEXT_PUBLIC_WORDPRESS_API_URL;
  if (!wpUrl) throw new Error("URL di WordPress mancante nel file .env.local");

  const res = await fetch(`${wpUrl}/posts?slug=${slug}&_embed&status=publish`, {
    cache: 'no-store'
  });

  if (!res.ok) return null;

  const posts = await res.json();
  return posts.length > 0 ? posts[0] : null;
}

// Next.js 15+ richiede che params sia una Promise
export default async function ArticoloPage({ params }: { params: Promise<{ slug: string }> }) {
  // Risolviamo il parametro slug per evitare il 404
  const resolvedParams = await params;
  const post = await getPost(resolvedParams.slug);

  if (!post) {
    notFound();
  }

  
  // 🚀 RIPULITURA LEGGERA: Mantiene i tag intatti, elimina solo blocchi di colore e margini
  let cleanContent = post.content.rendered;

  // Elimina vecchi tag <font> che forzano il colore nero
  cleanContent = cleanContent.replace(/<\/?font[^>]*>/gi, '');

  return (
    <main className="min-h-screen bg-[#111827] text-white selection:bg-[#AE8854] font-sans pb-24">
      
      {/* Navbar Stile Dottorino */}
      <nav className="max-w-7xl mx-auto px-6 pt-6 pb-4 flex justify-between items-center relative z-20">
        <Link 
          href="/" 
          className="p-3 bg-[#1f2937] border-2 border-[#AE8854]/50 text-[#AE8854] rounded-xl hover:bg-[#AE8854] hover:text-[#111827] transition-all shadow-sm flex items-center gap-2 font-black text-xs uppercase tracking-widest"
        >
          <ChevronLeft className="w-4 h-4" /> Indietro
        </Link>
        
        {/* Gruppo di Destra: Titolo + Bottoni Condivisione (Senza JS!) */}
        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden sm:flex items-center gap-2 mr-2">
            <Stethoscope className="w-6 h-6 text-[#AE8854]" />
            <span className="font-black text-white text-lg tracking-widest uppercase">Il Divulgatore</span>
          </div>
          
          {/* 🚀 CONDIVISIONE WHATSAPP (Link Puro) */}
          <a 
            href={`https://wa.me/?text=${encodeURIComponent(`Leggi questo EBM Report: ${post.title.rendered.replace(/<[^>]*>?/gm, '')} - https://ildivulgatore.emanuelikanani.it/${resolvedParams.slug}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 bg-[#1f2937] border-2 border-[#25D366]/50 text-[#25D366] rounded-xl hover:bg-[#25D366] hover:text-white transition-all shadow-sm flex items-center justify-center group"
            title="Condividi su WhatsApp"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current group-hover:scale-110 transition-transform"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
          </a>
          
        </div>
      </nav>

      {/* Corpo dell'Articolo */}
      <article className="max-w-7xl mx-auto px-4 sm:px-0 mt-8 bg-[#1f2937] rounded-[3rem] shadow-[0_20px_40px_rgba(0,0,0,0.6)] border-[6px] border-[#AE8854]/30 overflow-hidden relative">
        <div className="p-8 md:p-14">
          
          <header className="mb-12 border-b-4 border-[#374151] pb-10">
            <div className="flex items-center justify-center gap-4 text-xs font-black text-[#AE8854] uppercase tracking-widest mb-6">
              <time>
                {new Date(post.date).toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })}
              </time>
              <span>•</span>
              <span className="flex items-center gap-1"><BookOpen className="w-4 h-4"/> EBM Report</span>
            </div>
            
            <h1 
              className="text-4xl md:text-5xl font-black text-white leading-tight tracking-tighter text-center"
              dangerouslySetInnerHTML={{ __html: post.title.rendered }}
            />
          </header>

          <div 
            className="
              text-lg w-full text-gray-300
              
              /* 🎨 COLORI: Forza i testi chiari ignorando i vecchi stili neri */
              [&_p]:text-gray-300 [&_strong]:text-white [&_b]:text-white
              [&_h2]:text-[#AE8854] [&_h3]:text-white [&_a]:text-[#E2C293]
              
              /* 📐 LARGHEZZA FLUIDA: Solo i blocchi principali (p, div, table) si allargano, 
                 senza spaccare i tag interni (come i grassetti o i link) */
              [&_p]:w-full [&_p]:max-w-none
              [&_div]:w-full [&_div]:max-w-none
              [&_table]:w-full [&_table]:max-w-none
              
              /* Struttura e Spaziature Verticali (Manteniamo i veri paragrafi) */
              [&_p]:leading-relaxed [&_p]:mb-6
              [&_h2]:text-3xl [&_h2]:font-black [&_h2]:mt-14 [&_h2]:mb-6 [&_h2]:tracking-tighter
              [&_h3]:text-2xl [&_h3]:font-black [&_h3]:mt-10 [&_h3]:mb-4
              
              /* Liste e Media */
              [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-8 [&_ul]:space-y-3 [&_ul]:marker:text-[#AE8854]
              [&_li]:leading-relaxed
              [&_a]:font-bold [&_a]:underline [&_a]:decoration-[#AE8854] hover:[&_a]:text-white transition-colors
              [&_img]:max-w-full [&_img]:h-auto [&_img]:mx-auto [&_img]:rounded-xl
              [&_hr]:my-14 [&_hr]:border-t-4 [&_hr]:border-dashed [&_hr]:border-[#374151]
            "
            dangerouslySetInnerHTML={{ __html: cleanContent }}
          />

          {/* 🚀 IL NUOVO BOTTONE: Chiedi al Dottorino (In fondo all'articolo) */}
          <div className="mt-16 pt-12 border-t border-[#374151] flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-[#1f2937] border-2 border-[#AE8854] rounded-full flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(174,136,84,0.2)]">
              <Stethoscope className="w-8 h-8 text-[#AE8854]" />
            </div>
            
            <h3 className="text-2xl md:text-3xl font-black text-white tracking-tighter mb-4">
              Vuoi capire meglio argomento?
            </h3>
            
            <p className="text-gray-400 font-medium mb-10 max-w-lg leading-relaxed">
              Le informazioni mediche possono essere complesse. Clicca qui sotto per parlarne direttamente con IlDottorino!.
            </p>
            
            <Link 
              href={`/dashboard?topic=${encodeURIComponent(post.title.rendered)}`}
              className="group flex items-center justify-center gap-3 bg-[#AE8854] text-[#111827] px-8 py-5 rounded-full font-black uppercase tracking-widest hover:bg-white transition-all shadow-[0_0_30px_rgba(174,136,84,0.3)] hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] hover:scale-105 active:scale-95 w-full md:w-auto"
            >
              <Stethoscope className="w-5 h-5 group-hover:animate-pulse" />
              Chiedi al Dottorino!
            </Link>
          </div>
          
        </div>
      </article>
    </main>
  );
}