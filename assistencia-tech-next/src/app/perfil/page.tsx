'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Image from 'next/image';
import styles from './Perfil.module.css';
import { UserData } from '@/types';
import { IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5';

export default function PerfilPage() {
  const { user } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [showCpf, setShowCpf] = useState(false);

  useEffect(() => {
    if (user) {
      const docRef = doc(db, 'usuarios', user.uid);
      getDoc(docRef).then(docSnap => {
        if (docSnap.exists()) {
          setUserData(docSnap.data() as UserData);
        }
      });
    }
  }, [user]);

  if (!user || !userData) {
    return <div className={styles.loading}>Carregando...</div>;
  }

  const maskCpf = (cpf: string) => {
    if (!cpf) return '';
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "***.***.***-**");
  };

  return (
    <div>
      <div className={styles.welcomeHeader}>
        <Image
          src={userData.foto || '/images/placeholder.png'}
          alt="Foto de perfil"
          width={80}
          height={80}
          className={styles.profileImage}
        />
        <h1 className={styles.welcomeTitle}>Bem-vindo, {userData.nome}!</h1>
        <p className={styles.welcomeSubtitle}>
          Gerencie suas informações, privacidade e segurança para que a Servify atenda suas necessidades.
        </p>
      </div>
    </div>
  );
}