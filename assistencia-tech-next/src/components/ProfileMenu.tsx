'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './ProfileMenu.module.css';
import { useAuth } from '@/context/AuthContext';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation'; // Importe o useRouter
import { IoPersonCircleOutline, IoLogOutOutline } from 'react-icons/io5';
import ConfirmationModal from './ConfirmationModal'; // Importe o modal de confirmação

export default function ProfileMenu() {
  const { user, userData } = useAuth();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false); // Estado para o novo modal
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

  // Função que executa o logout e redireciona
  const handleConfirmSignOut = () => {
    signOut(auth)
      .then(() => {
        router.push('/'); // Redireciona para a Home após sair
      })
      .catch((error) => console.error("Erro ao sair:", error));
  };

  // Função para abrir o modal de confirmação
  const handleSignOutClick = () => {
    setIsMenuOpen(false); // Fecha o menu de perfil
    setIsConfirmModalOpen(true); // Abre o modal de confirmação
  };

  if (!user) return null;

  // Lógica para definir a foto, priorizando Firestore > Auth > Placeholder
  const displayPhotoURL = userData?.foto || user.photoURL || '/images/placeholder.png';
  const displayName = userData?.nome || user.displayName || 'Usuário';

  return (
    <>
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
                {/* O botão "Sair" agora abre o modal */}
                <button onClick={handleSignOutClick} className={styles.menuItem}>
                  <IoLogOutOutline />
                  Sair
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmSignOut}
        message="Você tem certeza que deseja sair?"
      />
    </>
  );
}