import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Servify',
  description: 'Conectando você aos melhores profissionais.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body> {/* O CSS do globals.css será aplicado aqui */}
        <AuthProvider>
          <Navbar />
          <main>{children}</main> {/* E aqui */}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}