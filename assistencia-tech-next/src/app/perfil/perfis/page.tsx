'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import styles from './perfis.module.css';
import { UserData } from '@/types'; // Importe o tipo

export default function PerfisPage() {
  const { user } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const docRef = doc(db, 'usuarios', user.uid);
      getDoc(docRef).then((docSnap) => {
        if (docSnap.exists()) {
          setUserData(docSnap.data() as UserData);
        }
      }).finally(() => setLoading(false));
    } else {
       setLoading(false);
    }
  }, [user]);

  if (loading) return <div>Carregando...</div>;
  if (!userData) return <div>Não foi possível carregar os dados do perfil.</div>;

  const hasClientProfile = userData.tipo === 'cliente';
  const hasFreelancerProfile = userData.tipo === 'tecnico';

  return (
    <div>
      <h1>Seus Perfis</h1>
      <p>Veja como seus diferentes perfis aparecem na Servify.</p>
      <div className={styles.profileList}>
        <div className={styles.profileCard}>
          <p>Seu perfil ativo como <strong>{userData.tipo}</strong>.</p>
        </div>
        {!hasFreelancerProfile && (
          <div className={styles.createProfileCard}>
            <p>Você ainda não tem um perfil de Freelancer.</p>
            <button>Criar Perfil de Freelancer</button>
          </div>
        )}
         {!hasClientProfile && (
          <div className={styles.createProfileCard}>
            <p>Você ainda não tem um perfil de Cliente.</p>
            <button>Criar Perfil de Cliente</button>
          </div>
        )}
      </div>
    </div>
  );
}