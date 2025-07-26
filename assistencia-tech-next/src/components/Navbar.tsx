'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import styles from './Navbar.module.css';
import { useAuth } from '@/context/AuthContext';
import ProfileMenu from './ProfileMenu';

export default function Navbar() {
  const { user, userData, loading } = useAuth();
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  const [isVisible, setIsVisible] = useState(true);
  const [isAtTop, setIsAtTop] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsAtTop(currentScrollY < 50);

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const headerClassNames = [
    styles.header,
    isHomePage && isAtTop && styles.atTop,
    !isVisible && styles.hidden
  ].filter(Boolean).join(' ');

  const isTecnico = userData?.tipo === 'tecnico';
  const servicosLinkHref = isTecnico ? '/chamados' : '/servicos';
  const servicosLinkText = isTecnico ? 'Chamados' : 'Serviços';
  
  // Lógica para escolher a imagem e a classe
  const showWhiteLogo = isHomePage && isAtTop;
  const logoSrc = showWhiteLogo ? '/logoBranca.png' : '/logoAzul.png';
  const logoClass = showWhiteLogo ? styles.logoImageAtTop : styles.logoImageDefault;

  return (
    <header className={headerClassNames}>
      <div className={styles.container}>
        <Link href="/" className={styles.brand}>
          <Image
            src={logoSrc}
            alt="Logo da Servify"
            width={500} 
            height={500} 
            className={logoClass} // Usa a classe dinâmica
            priority
          />
        </Link>
        <nav className={styles.nav}>
          <ul className={styles.navList}>
            <li><Link href="/" className={styles.navLink}>Início</Link></li>
            <li><Link href="/profissionais" className={styles.navLink}>Profissionais</Link></li>
            <li>
              <Link href={servicosLinkHref} className={styles.navLink}>
                {servicosLinkText}
              </Link>
            </li>
            <li><Link href="/assinatura" className={styles.navLink}>Assinatura</Link></li>
            <li><Link href="/sobre" className={styles.navLink}>Sobre</Link></li>
          </ul>
        </nav>
        
        <div className={styles.actionsContainer}>
          {loading ? (
            <div className={styles.loader}></div>
          ) : user ? (
            <ProfileMenu />
          ) : (
            <Link href="/login" className={styles.loginButton}>
              Entrar
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}