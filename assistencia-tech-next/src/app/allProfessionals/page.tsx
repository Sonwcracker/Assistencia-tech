import React, { Suspense } from 'react';
import ProfessionalsList from '@/components/ProfessionalsList';
import ProfessionFilter from '@/components/ProfessionFilter';
import styles from './allProfessionals.module.css';

export default function AllProfessionalsPage() {
  return (
    <div className={styles.container}>
      <Suspense fallback={<div className={styles.filterLoading}>Carregando filtro...</div>}>
        <ProfessionFilter />
      </Suspense>
      
      <Suspense fallback={<p>Carregando profissionais...</p>}>
        <ProfessionalsList />
      </Suspense>
    </div>
  );
}