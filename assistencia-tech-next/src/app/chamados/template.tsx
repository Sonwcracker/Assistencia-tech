'use client';

import { motion } from 'framer-motion';

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ x: 150, opacity: 0 }} // Estado inicial: 20px abaixo e transparente
      animate={{ x: 0, opacity: 1 }}    // Estado final: na posição original e opaco
      transition={{ ease: 'easeInOut', duration: 1 }} // Duração e tipo da animação
    >
      {children}
    </motion.div>
  );
}