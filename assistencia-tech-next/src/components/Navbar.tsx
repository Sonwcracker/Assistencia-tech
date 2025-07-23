'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import styles from './Navbar.module.css';

export default function Navbar() {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  const [isVisible, setIsVisible] = useState(true);
  const [isAtTop, setIsAtTop] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsAtTop(currentScrollY === 0);

      // Esta lógica agora funciona em todas as páginas
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false); // Rolando para baixo
      } else {
        setIsVisible(true); // Rolando para cima
      }

      setLastScrollY(currentScrollY);
    };

    // A lógica de scroll agora é adicionada globalmente, não só na Home
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]); // O listener depende apenas da posição do scroll

  return (
    <header
      className={`
        ${styles.header}
        ${isHomePage && isAtTop ? styles.atTop : ''}
        ${!isVisible ? styles.hidden : ''}
      `}
    >
      <div className={styles.container}>
        <Link href="/" className={styles.brand}>
          Servify
        </Link>
        <nav className={styles.nav}>
          <ul className={styles.navList}>
            <li><Link href="/" className={styles.navLink}>Início</Link></li>
            <li><Link href="/profissionais" className={styles.navLink}>Profissionais</Link></li>
            <li><Link href="/solicitações" className={styles.navLink}>Solicitações</Link></li>
            <li><Link href="/assinatura" className={styles.navLink}>Assinatura</Link></li>
            <li><Link href="/sobre" className={styles.navLink}>Sobre</Link></li>
          </ul>
        </nav>
        <Link href="/login" className={styles.loginButton}>
          Entrar
        </Link>
      </div>
    </header>
  );
}