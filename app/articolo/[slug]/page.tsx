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

  // 🚀 FIX: IL PURIFICATORE DI CODICE
  // Spazziamo via i margini e le larghezze fisse portate dal "Copia-Incolla" nell'editor
  let cleanContent = post.content.rendered;
  cleanContent = cleanContent.replace(/width\s*:\s*[^;"]+;?/gi, ''); // Rimuove width CSS
  cleanContent = cleanContent.replace(/max-width\s*:\s*[^;"]+;?/gi, ''); // Rimuove max-width CSS
  cleanContent = cleanContent.replace(/margin[^:]*:\s*[^;"]+;?/gi, ''); // Rimuove tutti i tipi di margin CSS
  cleanContent = cleanContent.replace(/width="\d+"/gi, ''); // Rimuove attributi width diretti

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
        <div className="flex items-center gap-2">
          <Stethoscope className="w-6 h-6 text-[#AE8854]" />
          <span className="font-black text-white text-lg tracking-widest uppercase">Il Divulgatore</span>
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

          {/* Stili CSS iniettati per formattare il testo di WordPress con i colori de Il Dottorino */}
          <div 
            className="
              text-lg w-full
              /* 🚀 FIX: Disintegriamo le larghezze fisse fantasma di WordPress */
              [&_div]:!w-full [&_div]:!max-w-none 
              [&_p]:!w-full [&_p]:!max-w-none 
              [&_figure]:!w-full [&_figure]:!max-w-none
              [&_img]:!max-w-full [&_img]:!h-auto
              
              /* Stili Tipografici */
              [&_h2]:text-3xl [&_h2]:font-black [&_h2]:text-[#AE8854] [&_h2]:mt-14 [&_h2]:mb-6 [&_h2]:tracking-tighter [&_h2]:!w-full [&_h2]:!max-w-none
              [&_h3]:text-2xl [&_h3]:font-black [&_h3]:text-white [&_h3]:mt-10 [&_h3]:mb-4 [&_h3]:!w-full [&_h3]:!max-w-none
              [&_p]:text-gray-300 [&_p]:leading-relaxed [&_p]:mb-6 [&_p]:font-medium
              [&_strong]:font-black [&_strong]:text-white
              [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:text-gray-300 [&_ul]:mb-8 [&_ul]:space-y-3 [&_ul]:marker:text-[#AE8854]
              [&_li]:leading-relaxed
              [&_a]:text-[#E2C293] [&_a]:font-bold [&_a]:underline [&_a]:decoration-[#AE8854] hover:[&_a]:text-white transition-colors
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
              Le informazioni mediche possono essere complesse. Clicca qui sotto per parlarne direttamente Il Dottorino!.
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