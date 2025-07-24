import { NextConfig } from 'next';

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      // ADICIONE ESTE NOVO BLOCO para o domínio do erro
      {
        protocol: 'https',
        hostname: 'img.cdndsgni.com',
      },
    ],
  },
};

export default nextConfig;