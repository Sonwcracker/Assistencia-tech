'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import styles from './PerfilLayout.module.css';
import { IoHomeOutline, IoPersonOutline, IoShieldCheckmarkOutline, IoConstructOutline } from 'react-icons/io5';
import { useAuth } from '@/context/AuthContext';

export default function PerfilLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { userData } = useAuth();

  const navItems = [
    { href: '/perfil', label: 'Início', icon: <IoHomeOutline /> },
    { href: '/perfil/informacoes', label: 'Informações Pessoais', icon: <IoPersonOutline /> },
    { href: '/perfil/seguranca', label: 'Segurança', icon: <IoShieldCheckmarkOutline /> },
  ];

  if (userData?.tipo === 'tecnico') {
    navItems.push({ 
      href: '/perfil/profissional', 
      label: 'Informações Profissionais', 
      icon: <IoConstructOutline /> 
    });
  }

  return (
    <div className={styles.layoutContainer}>
      <aside className={styles.sidebar}>
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