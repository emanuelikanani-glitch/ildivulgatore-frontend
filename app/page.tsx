import Link from 'next/link';

// Definiamo l'interfaccia TypeScript per gli articoli di WordPress
interface WPPost {
  id: number;
  slug: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  date: string;
  _embedded?: {
    'wp:featuredmedia'?: Array<{ source_url: string }>;
  };
}

// Funzione per recuperare gli articoli dal tuo WordPress
async function getPosts(): Promise<WPPost[]> {
  const wpUrl = process.env.NEXT_PUBLIC_WORDPRESS_API_URL;
  if (!wpUrl) throw new Error("URL di WordPress mancante nel file .env.local");

  // Chiamiamo l'API di WordPress. 
  // ?_embed ci permette di scaricare anche le immagini in evidenza e l'autore in un solo colpo
  // status=publish assicura che mostriamo solo gli articoli ufficiali, non le bozze dell'IA!
  const res = await fetch(`${wpUrl}/posts?_embed&status=publish`, {
    cache: 'no-store' // <-- MODIFICA EFFETTUATA: Disattiva la cache per vedere gli articoli in tempo reale
  });

  if (!res.ok) {
    console.error("Errore fetch WordPress");
    return []; // Se WordPress è giù, restituiamo un array vuoto per non far crashare il sito
  }

  return res.json();
}

export default async function Home() {
  const posts = await getPosts();

  return (
    <main className="min-h-screen bg-gray-50 p-8 font-sans">
      <header className="max-w-4xl mx-auto mb-12 text-center mt-10">
        <h1 className="text-5xl font-extrabold text-blue-900 mb-4 tracking-tight">
          Il Divulgatore
        </h1>
        <p className="text-xl text-gray-600 font-light">
          Medicina basata sulle evidenze scientifiche (EBM), spiegata in modo chiaro e accessibile a tutti.
        </p>
      </header>

      <section className="max-w-4xl mx-auto grid gap-6 md:grid-cols-2">
        {posts.length === 0 ? (
          <div className="col-span-2 text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
            <p className="text-gray-500 text-lg">
              Nessun articolo pubblicato al momento.
            </p>
            <p className="text-sm text-gray-400 mt-2">
              (Ricordati di entrare in WordPress, aprire le Bozze generate dall'IA e cliccare su "Pubblica"!)
            </p>
          </div>
        ) : (
          posts.map((post) => (
            <article 
              key={post.id} 
              className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
            >
              <div className="p-6 flex flex-col flex-grow">
                {/* Usiamo dangerouslySetInnerHTML perché WordPress invia i titoli con caratteri speciali codificati (es. l&#8217; per l'apostrofo) */}
                <h2 
                  className="text-2xl font-bold text-gray-800 mb-3 line-clamp-2 leading-tight"
                  dangerouslySetInnerHTML={{ __html: post.title.rendered }}
                />
                
                <div 
                  className="text-gray-600 mb-6 line-clamp-3 text-sm flex-grow"
                  dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
                />
                
                <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-50">
                  <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                    {new Date(post.date).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                  <Link 
                    href={`/articolo/${post.slug}`} 
                    className="text-blue-600 font-semibold hover:text-blue-800 transition-colors flex items-center gap-1"
                  >
                    Leggi tutto <span aria-hidden="true">&rarr;</span>
                  </Link>
                </div>
              </div>
            </article>
          ))
        )}
      </section>
    </main>
  );
}