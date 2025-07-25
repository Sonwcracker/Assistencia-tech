'use client';
import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import styles from './ChamadosLayout.module.css';
import { IoListOutline, IoTimeOutline, IoPlayCircleOutline } from 'react-icons/io5';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  count?: number;
}

export default function ChamadosLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [newChamadosCount, setNewChamadosCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'solicitacoes'), where('status', '==', 'aberto'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      setNewChamadosCount(querySnapshot.size);
    });
    return () => unsubscribe();
  }, [user]);

  const navItems: NavItem[] = [
    { href: '/chamados', label: 'Novos Chamados', icon: <IoListOutline />, count: newChamadosCount },
    { href: '/chamados/andamento', label: 'Em Andamento', icon: <IoPlayCircleOutline /> },
    { href: '/chamados/historico', label: 'Histórico', icon: <IoTimeOutline /> },
  ];

  return (
    <div className={styles.layoutContainer}>
      <aside className={styles.sidebar}>
        <h2 className={styles.sidebarTitle}>Painel do Técnico</h2>
        <nav className={styles.nav}>
          {navItems.map(item => (
            <Link key={item.href} href={item.href} className={`${styles.navItem} ${pathname === item.href ? styles.active : ''}`}>
              <div className={styles.navItemContent}>
                {item.icon}
                <span>{item.label}</span>
              </div>
              {item.count > 0 && <span className={styles.notificationBadge}>{item.count}</span>}
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