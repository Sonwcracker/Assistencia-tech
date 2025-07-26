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
  imagem: string;
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
          nome: doc.data().nome,
          imagem: doc.data().imagem || '',
        }));

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
    setVisibleCount(prev => prev + ITENS_POR_PAGINA);
  };

  const handleVerMenos = () => {
    setVisibleCount(ITENS_POR_PAGINA);
  };

  const isShowingAll = visibleCount >= profissoes.length;

  return (
    <main className={styles.mainContent}>
      <section className={styles.hero}>
        <div className={styles.container}>
          <h2 className={styles.heroTitle}>Contrate os melhores serviços</h2>
          <p className={styles.heroText}>
            Nossa plataforma conecta profissionais de diversas áreas com clientes que precisam de soluções rápidas,
            acessíveis e confiáveis para o dia a dia.
          </p>
          <div className="btn-group">
            <Link href="/sobre" className={styles.navLink}>
              <button className={`${styles.btn} ${styles.btnPrimary}`}>Saber mais</button>
            </Link>
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
                    <Link href={`/profissionais?filtro=${profissao.id}`}>
                      <div className={styles.popularCard}>
                        <figure className={styles.cardImg}>
                          <Image
                            src={profissao.imagem || '/images/placeholder.png'}
                            alt={`Imagem da profissão ${profissao.nome}`}
                            width={200}
                            height={150}
                            className={styles.image}
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

      {/* NOVA SEÇÃO DE VANTAGENS */}
      <section className={styles.vantagensSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Por que escolher nossa plataforma?</h2>
          <p className={styles.sectionText}>
            Veja os principais benefícios que fazem do nosso site a melhor escolha para contratar ou oferecer serviços.
          </p>

          <div className={styles.vantagensGrid}>
            <div className={styles.vantagemItem}>
              <h3>🔒 Segurança</h3>
              <p>Contamos com autenticação segura e verificação de profissionais cadastrados.</p>
            </div>
            <div className={styles.vantagemItem}>
              <h3>📱 Facilidade</h3>
              <p>Encontre profissionais e serviços em poucos cliques, com acesso simples e rápido.</p>
            </div>
            <div className={styles.vantagemItem}>
              <h3>🌎 Alcance Local</h3>
              <p>Conectamos você com profissionais próximos, otimizando tempo e deslocamento.</p>
            </div>
            <div className={styles.vantagemItem}>
              <h3>💬 Avaliações reais</h3>
              <p>Leia opiniões de outros clientes para escolher com confiança e transparência.</p>
            </div>
            <div className={styles.vantagemItem}>
              <h3>📈 Oportunidade para profissionais</h3>
              <p>Divulgue seus serviços, ganhe visibilidade e conquiste novos clientes.</p>
            </div>
            <div className={styles.vantagemItem}>
              <h3>⚙️ Gestão de serviços</h3>
              <p>Organize seus pedidos, receba notificações e acompanhe tudo pela plataforma.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
