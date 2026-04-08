import Link from 'next/link';
import { Search, Stethoscope, ChevronRight, Activity, Newspaper } from 'lucide-react';

interface WPPost {
  id: number;
  slug: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  date: string;
  _embedded?: {
    'wp:term'?: Array<Array<{ taxonomy: string, name: string }>>;
  };
}

// Funzione di fetch con supporto alla RICERCA
async function getPosts(searchQuery: string): Promise<WPPost[]> {
  const wpUrl = process.env.NEXT_PUBLIC_WORDPRESS_API_URL;
  if (!wpUrl) throw new Error("URL di WordPress mancante nel file .env.local");

  // Costruiamo l'URL. Se c'è una query, usiamo il motore di ricerca interno di WordPress
  let fetchUrl = `${wpUrl}/posts?_embed&status=publish&per_page=100`;
  if (searchQuery) {
    fetchUrl += `&search=${encodeURIComponent(searchQuery)}`;
  }

  const res = await fetch(fetchUrl, { cache: 'no-store' });
  if (!res.ok) return [];

  return res.json();
}

// Helper per estrarre la Categoria da WordPress
function getCategory(post: WPPost): string {
  const terms = post._embedded?.['wp:term'];
  if (terms) {
    const categories = terms.flat().filter(t => t.taxonomy === 'category' && t.name !== 'Senza categoria');
    if (categories.length > 0) return categories[0].name;
  }
  return 'Medicina Generale';
}

// Next.js 15+ richiede che searchParams sia una Promise
export default async function Home({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const resolvedParams = await searchParams;
  const query = resolvedParams.q || '';
  
  const posts = await getPosts(query);

  // Raggruppiamo gli articoli per macrocategoria
  const groupedPosts: Record<string, WPPost[]> = {};
  posts.forEach(post => {
    const cat = getCategory(post);
    if (!groupedPosts[cat]) groupedPosts[cat] = [];
    groupedPosts[cat].push(post);
  });

  // Isoliamo l'articolo in evidenza (il primo in assoluto, se non stiamo cercando)
  const heroPost = !query && posts.length > 0 ? posts[0] : null;
  
  // Se abbiamo un heroPost, lo togliamo dai gruppi per non duplicarlo
  if (heroPost) {
    const heroCat = getCategory(heroPost);
    groupedPosts[heroCat] = groupedPosts[heroCat].filter(p => p.id !== heroPost.id);
    if (groupedPosts[heroCat].length === 0) delete groupedPosts[heroCat];
  }

  return (
    <main className="min-h-screen bg-[#111827] text-white selection:bg-[#AE8854] font-sans pb-20">
      
      {/* NAVBAR & SEARCH BAR */}
      <nav className="max-w-6xl mx-auto px-6 pt-8 pb-6 flex flex-col md:flex-row justify-between items-center gap-6 relative z-20">
        
        {/* LOGO E TITOLO */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#1f2937] border-2 border-[#AE8854] flex items-center justify-center overflow-hidden shadow-[0_0_15px_rgba(174,136,84,0.3)]">
            <img src="/volto.png" alt="Il Dottorino Logo" className="w-12 h-12 object-contain" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase text-white leading-none">Il Divulgatore</h1>
            <p className="text-[#AE8854] text-[10px] md:text-xs font-black tracking-widest uppercase mt-1">By Il Dottorino</p>
          </div>
        </div>

        {/* SEARCH BAR & BUTTON ILDOTTORINO */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          {/* Motore di Ricerca in puro stile SSR */}
          <form action="/" method="GET" className="w-full sm:w-80 relative group">
            <input 
              type="text" 
              name="q" 
              defaultValue={query}
              placeholder="Cerca sintomo, patologia..." 
              className="w-full pl-12 pr-6 py-3.5 bg-[#1f2937] border-2 border-[#AE8854]/50 rounded-full focus:border-[#AE8854] font-bold text-white text-sm outline-none transition-all shadow-inner placeholder:text-gray-500"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#AE8854] group-focus-within:text-white transition-colors" />
            <button type="submit" className="hidden">Cerca</button>
          </form>

          {/* BOTTONE VAI SU ILDOTTORINO */}
          <a 
            href="https://ildottorino.emanuelikanani.it" 
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-[#E2C293] to-[#AE8854] text-[#111827] rounded-full font-black text-[10px] uppercase tracking-widest shadow-[0_0_20px_rgba(174,136,84,0.4)] hover:brightness-110 active:scale-95 transition-all text-center flex items-center justify-center gap-2 whitespace-nowrap"
          >
            Vai su IlDottorino <ChevronRight className="w-4 h-4" />
          </a>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6">
        
        {/* MESSAGGIO RICERCA */}
        {query && (
          <div className="mb-8 p-4 bg-[#1f2937] border-l-4 border-[#AE8854] rounded-r-2xl">
            <p className="font-bold text-gray-300">
              Risultati per: <span className="text-white">"{query}"</span> ({posts.length})
            </p>
            <Link href="/" className="text-[#AE8854] text-xs font-black uppercase tracking-widest mt-2 inline-block hover:underline">
              &larr; Azzera ricerca
            </Link>
          </div>
        )}

        {posts.length === 0 ? (
          <div className="text-center py-24 bg-[#1f2937] rounded-[3rem] border-4 border-dashed border-[#AE8854]/30">
            <Newspaper className="w-16 h-16 text-[#AE8854] mx-auto mb-4 opacity-50" />
            <p className="text-xl font-black text-gray-400 uppercase tracking-widest">Nessun articolo trovato.</p>
          </div>
        ) : (
          <>
            {/* HERO SECTION (Mostrata solo se NON c'è una ricerca in corso) */}
            {heroPost && (
              <section className="mb-16">
                <Link href={`/articolo/${heroPost.slug}`} className="block group">
                  <div className="bg-gradient-to-br from-[#1f2937] to-[#111827] rounded-[3rem] p-8 md:p-14 shadow-[0_20px_40px_rgba(0,0,0,0.6)] border-[6px] border-[#AE8854] relative overflow-hidden transition-transform hover:-translate-y-1">
                    {/* Effetto luce sfondo */}
                    <div className="absolute -right-20 -top-20 w-96 h-96 bg-[#AE8854] opacity-10 blur-[100px] rounded-full group-hover:opacity-20 transition-opacity"></div>
                    
                    <div className="relative z-10 flex flex-col md:w-3/4">
                      <div className="flex items-center gap-3 mb-6">
                        <span className="bg-[#AE8854] text-[#111827] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(174,136,84,0.4)]">
                          In Evidenza
                        </span>
                        <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">
                           {getCategory(heroPost)}
                        </span>
                      </div>
                      
                      <h2 
                        className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tighter mb-6 group-hover:text-[#E2C293] transition-colors"
                        dangerouslySetInnerHTML={{ __html: heroPost.title.rendered }}
                      />
                      
                      <div 
                        className="text-gray-400 text-lg md:text-xl font-medium line-clamp-3 mb-8 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: heroPost.excerpt.rendered }}
                      />
                      
                      <div className="flex items-center gap-2 text-[#AE8854] font-black uppercase tracking-widest text-sm">
                        Leggi Report Completo <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              </section>
            )}

            {/* SEZIONI PER MACROCATEGORIA */}
            {Object.entries(groupedPosts).map(([category, catPosts]) => (
              <section key={category} className="mb-16">
                <div className="flex items-center gap-4 mb-8">
                  <Activity className="w-8 h-8 text-[#AE8854]" />
                  <h3 className="text-3xl font-black text-white tracking-tighter uppercase">{category}</h3>
                  <div className="flex-1 h-1 bg-gradient-to-r from-[#AE8854]/50 to-transparent ml-4 rounded-full"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {catPosts.map((post) => (
                    <Link href={`/articolo/${post.slug}`} key={post.id} className="block group h-full">
                      <article className="bg-[#1f2937] h-full rounded-[2.5rem] p-8 border-2 border-[#374151] hover:border-[#AE8854] transition-all hover:-translate-y-1 hover:shadow-[0_15px_30px_rgba(174,136,84,0.15)] flex flex-col relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 opacity-5 blur-[50px] rounded-full group-hover:opacity-10"></div>
                        
                        <div className="mb-4 flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                          <span className="text-[#AE8854]">{new Date(post.date).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        </div>
                        
                        <h4 
                          className="text-xl font-black text-white leading-snug tracking-tight mb-4 group-hover:text-[#E2C293] transition-colors line-clamp-3"
                          dangerouslySetInnerHTML={{ __html: post.title.rendered }}
                        />
                        
                        <div 
                          className="text-gray-400 text-sm line-clamp-3 mb-8 flex-grow leading-relaxed font-medium"
                          dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
                        />
                        
                        <div className="mt-auto pt-6 border-t-2 border-[#374151] flex items-center justify-between text-[#AE8854] group-hover:text-white transition-colors">
                          <span className="text-[10px] font-black uppercase tracking-widest">Leggi di più</span>
                          <div className="w-8 h-8 rounded-full bg-[#111827] border-2 border-[#AE8854] flex items-center justify-center group-hover:bg-[#AE8854] transition-colors">
                            <ChevronRight className="w-4 h-4 group-hover:text-[#111827]" />
                          </div>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </>
        )}
      </div>
    </main>
  );
}