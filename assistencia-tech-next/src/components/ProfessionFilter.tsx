'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import styles from './ProfessionFilter.module.css';

interface Profissao {
  id: string;
  nome: string;
}

const ProfessionFilter = () => {
  const [professions, setProfessions] = useState<Profissao[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  // Pega o filtro atual da URL ou define 'all' como padrão
  const currentFilter = searchParams.get('profissao') || 'all';

  useEffect(() => {
    // Busca a lista de profissões no banco de dados
    const fetchProfessions = async () => {
      try {
        const q = query(collection(db, 'profissoes'), orderBy('nome'));
        const querySnapshot = await getDocs(q);
        const professionsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          nome: doc.data().nome,
        })) as Profissao[];
        setProfessions(professionsData);
      } catch (error) {
        console.error("Erro ao buscar profissões:", error);
      }
    };
    fetchProfessions();
  }, []);

  // Atualiza a URL quando o usuário seleciona uma nova profissão
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedProfession = e.target.value;
    if (selectedProfession === 'all') {
      router.push('/allProfessionals');
    } else {
      router.push(`/allProfessionals?profissao=${selectedProfession}`);
    }
  };

  return (
    <div className={styles.filterContainer}>
      <label htmlFor="profession-filter" className={styles.filterLabel}>Classificar por:</label>
      <select
        id="profession-filter"
        value={currentFilter}
        onChange={handleFilterChange}
        className={styles.filterSelect}
      >
        <option value="all">Todas as Profissões</option>
        {professions.map(prof => (
          <option key={prof.id} value={prof.id}>
            {prof.nome}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ProfessionFilter;