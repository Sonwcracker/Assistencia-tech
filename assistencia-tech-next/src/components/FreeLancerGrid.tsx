'use client';

import React, { useState, useEffect } from 'react';
import styles from '../app/profissionais/profissionais.module.css';
import Image from 'next/image';
import Link from 'next/link';

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

interface Props {
  allFreelancers: Freelancer[];
  allProfessions: Profissao[];
  onFilterChange: (newTitle: string) => void;
  initialFilter: string; 
}

export default function FreelancerGrid({ allFreelancers, allProfessions, onFilterChange, initialFilter }: Props) {
  // O estado inicial agora é definido de forma confiável pelo prop
  const [selectedProfession, setSelectedProfession] = useState(initialFilter);
  const [filteredFreelancers, setFilteredFreelancers] = useState(allFreelancers);

  // Este useEffect é o principal. Ele reage a mudanças no filtro.
  useEffect(() => {
    if (selectedProfession === 'todos') {
      setFilteredFreelancers(allFreelancers);
      onFilterChange('Todos os Freelancers');
    } else {
      const filtered = allFreelancers.filter(f => f.profissao === selectedProfession);
      setFilteredFreelancers(filtered);
      
      const professionName = allProfessions.find(p => p.id === selectedProfession)?.nome || 'Freelancers';
      onFilterChange(professionName);
    }
  }, [selectedProfession, allFreelancers, allProfessions, onFilterChange]);

  return (
    <div className={styles.contentContainer}>
      <div className={styles.filterBar}>
        <label htmlFor="profession-filter">Classificar por:</label>
        <select
          id="profession-filter"
          className={styles.filterSelect}
          value={selectedProfession}
          onChange={(e) => setSelectedProfession(e.target.value)}
        >
          <option value="todos">Todas as Profissões</option>
          {allProfessions.map(prof => (
            <option key={prof.id} value={prof.id}>{prof.nome}</option>
          ))}
        </select>
      </div>

      <div className={styles.grid}>
        {filteredFreelancers.map(freelancer => (
          <Link href={`/profissionais/${freelancer.id}`} key={freelancer.id} className={styles.card}>
            <figure className={styles.cardImageContainer}>
              <Image
                src={freelancer.imagemUrl || '/images/placeholder.jpg'}
                alt={`Foto de ${freelancer.nome}`}
                fill
                style={{ objectFit: 'cover' }}
              />
            </figure>
            <div className={styles.cardContent}>
              <h3 className={styles.cardTitle}>{freelancer.nome}</h3>
              <p className={styles.cardSubtitle}>{freelancer.profissao}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}