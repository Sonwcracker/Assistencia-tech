'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './home.module.css';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { IoShieldCheckmarkOutline, IoFlashOutline, IoMapOutline, IoChatbubblesOutline, IoDiamondOutline, IoTrendingUpOutline } from 'react-icons/io5';

interface Profissao {
  id: string;
  nome: string;
}

const ITENS_INICIAIS = 5; // Mostra 5 botões inicialmente

export default function HomePage() {
  const [profissoes, setProfissoes] = useState<Profissao[]>([]);
  const [visibleCount, setVisibleCount] = useState(ITENS_INICIAIS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getProfissoes = async () => {
      try {
        const profissoesCollection = collection(db, 'profissoes');
        const q = query(profissoesCollection, orderBy('nome'));
        const querySnapshot = await getDocs(q);

        const profissoesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          nome: doc.data().nome,
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
    setVisibleCount(profissoes.length); // Mostra todos
  };

  const handleVerMenos = () => {
    setVisibleCount(ITENS_INICIAIS);
  };

  const isShowingAll = visibleCount >= profissoes.length;

  return (
    <main className={styles.mainContent}>
      <section className={styles.hero}>
        <div className={styles.container}>
          <h1 className={styles.heroTitle}>Encontre o profissional certo para o serviço que você precisa.</h1>
          <p className={styles.heroText}>
            Conectamos você a especialistas qualificados de forma rápida, segura e sem complicações.
          </p>
          <Link href="/allProfessionals" className={`${styles.btn} ${styles.btnHeader}`}>
            Encontrar Profissionais
          </Link>
        </div>
      </section>

      <section className={styles.popular}>
        <div className={styles.container}>
          <p className={styles.sectionSubtitle}>Navegue por Categorias</p>
          <h2 className={styles.sectionTitle}>Serviços Oferecidos</h2>
          
          {loading ? (
            <p>Carregando...</p>
          ) : (
            <>
              <div className={`${styles.botoesProfissoes} ${isShowingAll ? styles.expanded : ''}`}>
                {profissoes.slice(0, visibleCount).map((profissao) => (
                  <Link 
                    key={profissao.id} 
                    href={`/profissionais?filtro=${profissao.id}`} 
                    className={styles.botaoProfissao}
                  >
                    {profissao.nome}
                  </Link>
                ))}
              </div>

              <div className={styles.buttonContainer}>
                {isShowingAll && profissoes.length > ITENS_INICIAIS ? (
                  <button onClick={handleVerMenos} className={`${styles.btn} ${styles.btnSecondary}`}>
                    Ver menos
                  </button>
                ) : !isShowingAll && profissoes.length > ITENS_INICIAIS ? (
                  <button onClick={handleVerMais} className={`${styles.btn} ${styles.btnPrimary}`}>
                    Ver mais serviços
                  </button>
                ) : null}
              </div>
            </>
          )}
        </div>
      </section>

      <section className={styles.vantagensSection}>
        <div className={styles.container}>
          <p className={styles.sectionSubtitle}>Nossos Diferenciais</p>
          <h2 className={styles.sectionTitle}>Por que escolher a Servify?</h2>
          
          <div className={styles.vantagensGrid}>
            <div className={styles.vantagemItem}>
              <IoShieldCheckmarkOutline className={styles.vantagemIcon} />
              <h3>Segurança e Confiança</h3>
              <p>Profissionais verificados e um sistema de avaliações transparente para você contratar com tranquilidade.</p>
            </div>
            <div className={styles.vantagemItem}>
              <IoFlashOutline className={styles.vantagemIcon} />
              <h3>Agilidade</h3>
              <p>Receba orçamentos em minutos e encontre a solução para o seu problema sem burocracia.</p>
            </div>
            <div className={styles.vantagemItem}>
              <IoChatbubblesOutline className={styles.vantagemIcon} />
              <h3>Comunicação Direta</h3>
              <p>Converse diretamente com os profissionais para alinhar todos os detalhes do serviço.</p>
            </div>
            <div className={styles.vantagemItem}>
              <IoDiamondOutline className={styles.vantagemIcon} />
              <h3>Qualidade Garantida</h3>
              <p>Nossa plataforma seleciona os melhores talentos para garantir um serviço de alta qualidade.</p>
            </div>
            <div className={styles.vantagemItem}>
              <IoTrendingUpOutline className={styles.vantagemIcon} />
              <h3>Oportunidade de Crescimento</h3>
              <p>Para profissionais, oferecemos uma vitrine para alcançar mais clientes e expandir seu negócio.</p>
            </div>
            <div className={styles.vantagemItem}>
              <IoMapOutline className={styles.vantagemIcon} />
              <h3>Conexão Local</h3>
              <p>Encontre especialistas na sua região, otimizando tempo e fortalecendo a comunidade local.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}