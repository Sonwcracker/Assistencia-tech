'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './ProfileMenu.module.css';
import { useAuth } from '@/context/AuthContext';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { IoPersonCircleOutline, IoLogOutOutline } from 'react-icons/io5';

export default function ProfileMenu() {
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Efeito para fechar o menu se clicar fora dele
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  const handleSignOut = () => {
    signOut(auth).catch((error) => console.error("Erro ao sair:", error));
  };

  if (!user) return null;

  return (
    <div className={styles.profileContainer} ref={menuRef}>
      <button onClick={() => setIsMenuOpen(!isMenuOpen)} className={styles.profileButton}>
        <Image
          src={user.photoURL || '/images/placeholder-profile.png'} // Usa a foto do Google ou um placeholder
          alt="Foto de perfil"
          width={32}
          height={32}
          className={styles.profileImage}
        />
      </button>

      {isMenuOpen && (
        <div className={styles.dropdownMenu}>
          <div className={styles.userInfo}>
            <Image
              src={user.photoURL || '/images/placeholder-profile.png'}
              alt="Foto de perfil"
              width={48}
              height={48}
              className={styles.dropdownImage}
            />
            <div className={styles.userDetails}>
              <span className={styles.userName}>{user.displayName || 'Usuário'}</span>
              <span className={styles.userEmail}>{user.email}</span>
            </div>
          </div>
          <ul className={styles.menuList}>
            <li>
              <Link href="/perfil" className={styles.menuItem} onClick={() => setIsMenuOpen(false)}>
                <IoPersonCircleOutline />
                Meu Perfil
              </Link>
            </li>
            <li>
              <button onClick={handleSignOut} className={styles.menuItem}>
                <IoLogOutOutline />
                Sair
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}