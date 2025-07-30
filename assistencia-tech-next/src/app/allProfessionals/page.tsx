'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './allProfissionais.module.css'; // <-- CORREÇÃO APLICADA AQUI
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import FreelancerGrid from '../../components/FreeLancerGrid';

// Interfaces
interface Freelancer {
  id: string;
  nome: string;
  profissao: string;
  foto?: string;
  [key: string]: any;
}

interface Profissao {
  id: string;
  nome: string;
  [key: string]: any;
}

export default function ProfissionaisPage() {
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [profissoes, setProfissoes] = useState<Profissao[]>([]);
  const [pageTitle, setPageTitle] = useState('Todos os Freelancers');
  const [loading, setLoading] = useState(true);

  const searchParams = useSearchParams();
  const filtroInicial = searchParams.get('filtro') || 'todos';

  useEffect(() => {
    async function fetchData() {
      try {
        // Busca todos os freelancers do tipo 'tecnico'
        const usersRef = collection(db, 'usuarios');
        const q = query(usersRef, where('tipo', '==', 'tecnico'));
        const freelancersSnapshot = await getDocs(q);
        const freelancersData = freelancersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Freelancer[];
        setFreelancers(freelancersData);

        // Busca todas as profissoes disponíveis
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
    return (
      <div className={styles.pageContainer}>
        <h1 className={styles.pageTitle}>Carregando...</h1>
      </div>
    );
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