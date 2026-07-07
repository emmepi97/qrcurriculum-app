import './globals.css';
import { LanguageProvider } from '@/components/LanguageProvider';
export const metadata = { title: 'QR Curriculum', description: 'CV online, QR code, analytics e radar skill' };
export default function RootLayout({ children }) { return <html lang="it"><body><LanguageProvider>{children}</LanguageProvider></body></html>; }
