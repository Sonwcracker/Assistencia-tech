<<<<<<< HEAD
// next.config.ts
import type { NextConfig } from "next";
=======
import { NextConfig } from 'next';
>>>>>>> b18c9c2210511c2981bf37c557d928d66ef33417

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  images: {
<<<<<<< HEAD
    domains: [
      "s3.amazonaws.com",
      "cptstatic.s3.amazonaws.com", // opcionalmente esse também
=======
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
>>>>>>> b18c9c2210511c2981bf37c557d928d66ef33417
    ],
  },
};

export default nextConfig;