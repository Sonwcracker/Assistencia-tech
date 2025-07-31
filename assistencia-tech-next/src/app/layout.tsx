import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import './globals.css';
import type { Metadata } from 'next';

// 1. Importe o Toaster
import { Toaster } from 'react-hot-toast';

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
      <body>
        <AuthProvider>
          {/* 2. Adicione o componente Toaster aqui */}
          {/* Ele ficará invisível até que uma notificação seja disparada */}
          <Toaster 
            position="top-center"
            toastOptions={{
              success: {
                style: {
                  background: '#28a745',
                  color: 'white',
                },
              },
              error: {
                style: {
                  background: '#dc3545',
                  color: 'white',
                },
              },
            }}
          />

          <Navbar />
          <main>{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}