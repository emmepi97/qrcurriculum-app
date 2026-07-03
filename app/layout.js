import './globals.css';

export const metadata = { title: 'CV Online', description: 'CV online aggiornabile con Supabase e Vercel' };

export default function RootLayout({ children }) {
  return <html lang="it"><body>{children}</body></html>;
}
