'use client';

import React, { useState, useEffect } from 'react';
import styles from './profissionais.module.css';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import FreelancerGrid from '../../components/FreeLancerGrid';

// Interfaces
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

// 1. Adicione a prop 'searchParams' à função da página
export default function ProfissionaisPage({ searchParams }: { searchParams: { filtro: string } }) {
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [profissoes, setProfissoes] = useState<Profissao[]>([]);
  const [pageTitle, setPageTitle] = useState('Todos os Freelancers');
  const [loading, setLoading] = useState(true);

  // 2. Obtenha o filtro inicial diretamente da prop 'searchParams'
  const filtroInicial = searchParams.filtro || 'todos';

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
  }, []);

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
        onFilterChange={handleFilterChange}
        initialFilter={filtroInicial} // 3. Passe o filtro obtido para o componente
      />
    </div>
  );
}