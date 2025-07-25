'use client';
import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import styles from './ServicosLayout.module.css';
import { IoListCircleOutline, IoTimeOutline } from 'react-icons/io5';

const navItems = [
  { href: '/servicos', label: 'Solicitações Ativas', icon: <IoListCircleOutline /> },
  { href: '/servicos/historico', label: 'Histórico', icon: <IoTimeOutline /> },
];

export default function ServicosLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className={styles.layoutContainer}>
      <aside className={styles.sidebar}>
        <h2 className={styles.sidebarTitle}>Painel do Cliente</h2>
        <nav className={styles.nav}>
          {navItems.map(item => (
            <Link key={item.href} href={item.href} className={`${styles.navItem} ${pathname === item.href ? styles.active : ''}`}>
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
}