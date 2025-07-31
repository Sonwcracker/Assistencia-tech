import React, { Suspense } from 'react';
import ProfessionContent from '@/components/ProfessionContent';
import styles from './profissionais.module.css';

export default function ProfissionaisPage() {
  return (
    <div className={styles.pageContainer}>
      <Suspense fallback={<div className={styles.loadingState}><h1>Carregando informações da profissão...</h1></div>}>
        <ProfessionContent />
      </Suspense>
    </div>
  );
}