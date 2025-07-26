'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import styles from './ServicosLayout.module.css';
import { IoListOutline, IoPlayCircleOutline, IoTimeOutline } from 'react-icons/io5';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

export default function ServicosClienteLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    { href: '/servicos', label: 'Solicitações Ativas', icon: <IoListOutline /> },
    { href: '/servicos/andamento', label: 'Em Andamento', icon: <IoPlayCircleOutline /> },
    { href: '/servicos/historico', label: 'Histórico', icon: <IoTimeOutline /> },
  ];

  return (
    <div className={styles.layoutContainer}>
      <aside className={styles.sidebar}>
        <h2 className={styles.sidebarTitle}>Painel do Cliente</h2>
        <nav className={styles.nav}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${pathname === item.href ? styles.active : ''}`}
            >
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
