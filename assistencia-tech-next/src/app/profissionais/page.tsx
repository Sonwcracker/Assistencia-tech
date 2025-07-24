'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation'; 
import styles from './profissionais.module.css';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import FreelancerGrid from '../../components/FreeLancerGrid';

// Interfaces
interface Freelancer {
  id: string;
  nome: string;
  profissao: string;
  foto?: string;
}

interface Profissao {
  id: string;
  nome: string;
}

// 2. Remova a prop 'searchParams' da função
export default function ProfissionaisPage() {
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [profissoes, setProfissoes] = useState<Profissao[]>([]);
  const [pageTitle, setPageTitle] = useState('Todos os Freelancers');
  const [loading, setLoading] = useState(true);

  // 3. Use o hook para ler os parâmetros da URL
  const searchParams = useSearchParams();
  const filtroInicial = searchParams.get('filtro') || 'todos';

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
        initialFilter={filtroInicial}
      />
    </div>
  );
}