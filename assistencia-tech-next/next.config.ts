import { NextConfig } from 'next';

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'img.cdndsgni.com',
      },
      {
        protocol: 'https',
        hostname: 's3.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'cptstatic.s3.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'media.istockphoto.com',
      },
      {
        protocol: 'https',
        hostname: 'www.verzani.com.br',
      },
      {
        protocol: 'https',
        hostname: 'soscasacuritiba.com.br',
      },
      {
        protocol: 'https',
        hostname: 'img.freepik.com',
      },
      {
        protocol: 'https',
        hostname: 'thumbs.dreamstime.com',
      },
      {
        protocol: 'https',
        hostname: 'institucional.politintas.com.br',
      },
      {
        protocol: 'https',
        hostname: 'certificadocursosonline.com',
      },
      {
        protocol: 'https',
        hostname: 'institutodaconstrucao.com.br', // ✅ novo domínio adicionado
      },
    ],
  },
};

export default nextConfig;
