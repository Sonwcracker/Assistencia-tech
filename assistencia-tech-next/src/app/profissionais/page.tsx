'use client'; // 1. Torne esta página um componente de cliente

import React, { useState, useEffect } from 'react';
import styles from './profissionais.module.css';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import FreelancerGrid from '../../components/FreeLancerGrid'; 

// Interfaces...
interface Freelancer {
  id: string;
  nome: string;
  profissao: string;
  imagemUrl?: string;
}

interface Profissao {
  id: string;
  nome: string;
}

export default function ProfissionaisPage() {
  // 2. Adicione estados para os dados e para o título
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [profissoes, setProfissoes] = useState<Profissao[]>([]);
  const [pageTitle, setPageTitle] = useState('Todos os Freelancers');
  const [loading, setLoading] = useState(true);

  // 3. Mova a busca de dados para um useEffect
  useEffect(() => {
    async function fetchData() {
      try {
        const usersRef = collection(db, 'usuarios');
        const q = query(usersRef, where('tipo', '==', 'tecnico'));
        const freelancersSnapshot = await getDocs(q);
        const freelancersData = freelancersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Freelancer[];
        setFreelancers(freelancersData);

        const profissoesRef = collection(db, 'profissoes');
        const profissoesSnapshot = await getDocs(profissoesRef);
        const profissoesData = profissoesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Profissao[];
        setProfissoes(profissoesData);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []); // Array vazio garante que a busca aconteça apenas uma vez

  // 4. Crie a função de callback que será passada para o filho
  const handleFilterChange = (newTitle: string) => {
    setPageTitle(newTitle);
  };

  if (loading) {
    return <div className={styles.pageContainer}><h1 className={styles.pageTitle}>Carregando...</h1></div>;
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>{pageTitle}</h1>
      </div>
      <FreelancerGrid 
        allFreelancers={freelancers} 
        allProfessions={profissoes}
        onFilterChange={handleFilterChange} // 5. Passe a função como prop
      />
    </div>
  );
}