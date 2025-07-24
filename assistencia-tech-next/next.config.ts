import { NextConfig } from 'next';

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Domínio principal do Firebase Storage
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      // Outros domínios que já configuramos
      {
        protocol: 'https',
        hostname: 'img.cdndsgni.com',
      },
      // Domínios que estavam no seu conflito
      {
        protocol: 'https',
        hostname: 's3.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'cptstatic.s3.amazonaws.com',
      },
    ],
  },
};

export default nextConfig;