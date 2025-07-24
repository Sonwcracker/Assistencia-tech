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
  const { user, userData } = useAuth(); // userData vem do Firestore
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  // Define as informações a serem exibidas, priorizando o Firestore (userData)
  const displayName = userData?.nome || user.displayName || 'Usuário';
  const displayEmail = user.email;
  const displayPhotoURL = userData?.foto || user.photoURL || '/images/placeholder-profile.png';

  return (
    <div className={styles.profileContainer} ref={menuRef}>
      <button onClick={() => setIsMenuOpen(!isMenuOpen)} className={styles.profileButton}>
        <Image
          src={displayPhotoURL}
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
              src={displayPhotoURL}
              alt="Foto de perfil"
              width={48}
              height={48}
              className={styles.dropdownImage}
            />
            <div className={styles.userDetails}>
              <span className={styles.userName}>{displayName}</span>
              <span className={styles.userEmail}>{displayEmail}</span>
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