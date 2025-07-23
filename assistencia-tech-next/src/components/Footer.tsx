import React from 'react';
import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.copyright}>
          {/* Usar new Date().getFullYear() torna o ano do copyright automático */}
          &copy; {new Date().getFullYear()} Servify. Todos os direitos reservados.
        </div>
        <nav className={styles.nav}>
          <Link href="/termos" className={styles.link}>Termos de Serviço</Link>
          <Link href="/privacidade" className={styles.link}>Política de Privacidade</Link>
          <Link href="/contato" className={styles.link}>Contato</Link>
        </nav>
      </div>
    </footer>
  );
}