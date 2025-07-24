'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Image from 'next/image';
import styles from './Perfil.module.css';
import { IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5';
import { UserData } from '@/types'; 

export default function PerfilPage() {
  const { user } = useAuth();
  // 2. Informe ao useState o tipo de dados que ele vai guardar
  const [userData, setUserData] = useState<UserData | null>(null);
  const [showCpf, setShowCpf] = useState(false);

  useEffect(() => {
    if (user) {
      const docRef = doc(db, 'usuarios', user.uid);
      getDoc(docRef).then(docSnap => {
        if (docSnap.exists()) {
          // 3. Diga ao TypeScript que os dados do docSnap seguem o formato de UserData
          setUserData(docSnap.data() as UserData);
        }
      });
    }
  }, [user]);

  if (!user || !userData) return <div className={styles.loading}>Carregando...</div>;

  const maskCpf = (cpf) => {
    if (!cpf) return '';
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "***.***.***-**");
  };

  return (
    <div>
      <div className={styles.welcomeHeader}>
        <Image
          src={userData.foto || '/images/placeholder.jpg'}
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