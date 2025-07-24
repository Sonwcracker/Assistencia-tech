'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './home.module.css';

import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

interface Profissao {
  id: string;
  nome: string;
  imagemUrl: string;
}

const ITENS_POR_PAGINA = 3;

export default function HomePage() {
  const [profissoes, setProfissoes] = useState<Profissao[]>([]);
  const [visibleCount, setVisibleCount] = useState(ITENS_POR_PAGINA);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getProfissoes = async () => {
      try {
        const profissoesCollection = collection(db, 'profissoes');
        const q = query(profissoesCollection, orderBy('nome'));
        const querySnapshot = await getDocs(q);
        
        const profissoesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Profissao[];
        
        setProfissoes(profissoesData);
      } catch (error) {
        console.error("Erro ao buscar profissões:", error);
      } finally {
        setLoading(false);
      }
    };

    getProfissoes();
  }, []);

  const handleVerMais = () => {
    setVisibleCount(prevCount => prevCount + ITENS_POR_PAGINA);
  };

  const handleVerMenos = () => {
    setVisibleCount(ITENS_POR_PAGINA);
  };

  const isShowingAll = visibleCount >= profissoes.length;

  return (
    <main className={styles.mainContent}>
      <section className={styles.hero}>
        <div className={styles.container}>
          <h2 className={styles.heroTitle}>contrate melhores serviços</h2>
          <p className={styles.heroText}>
            Nossa empresa nasce com o propósito de ser a ponte entre profissionais e clientes,
            oferecendo uma plataforma eficiente, segura e acessível para a contratação de serviços gerais.
          </p>
          <div className="btn-group">
            <button className={`${styles.btn} ${styles.btnPrimary}`}>Saber mais</button>
          </div>
        </div>
      </section>

      <section className={styles.popular}>
        <div className={styles.container}>
          <p className={styles.sectionSubtitle}>Encontrar profissionais</p>
          <h2 className={styles.sectionTitle}>Serviços Oferecidos</h2>
          <p className={styles.sectionText}>Serviços separados por categorias</p>
          
          {loading ? (
            <p>Carregando profissões...</p>
          ) : (
            <>
              <ul className={styles.popularList}>
                {profissoes.slice(0, visibleCount).map((profissao) => (
                  <li key={profissao.id}>
                    <Link href={`/servicos/${profissao.id}`}>
                      <div className={styles.popularCard}>
                        <figure className={styles.cardImg}>
                          <Image
                            src={profissao.imagemUrl || '/images/placeholder.png'}
                            alt={profissao.nome}
                            width={200}
                            height={150}
                          />
                        </figure>
                        <div className={styles.cardContent}>
                          <h3 className={styles.cardTitle}>{profissao.nome}</h3>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>

              <div className={styles.buttonContainer}>
                {isShowingAll && profissoes.length > ITENS_POR_PAGINA && (
                  <button onClick={handleVerMenos} className={`${styles.btn} ${styles.btnSecondary}`}>
                    Ver menos
                  </button>
                )}
                
                {!isShowingAll && profissoes.length > 0 && (
                  <button onClick={handleVerMais} className={`${styles.btn} ${styles.btnPrimary}`}>
                    Ver mais serviços
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
