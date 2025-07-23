import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './home.module.css';
import { IoTime, IoBriefcase, IoStar } from 'react-icons/io5';

export default function HomePage() {
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
          <h2 className={styles.sectionTitle}>Principais serviços pedidos</h2>
          <p className={styles.sectionText}>Os serviços mais realizados de cada categoria</p>
          <ul className={styles.popularList}>
            <li>
              <Link href="#">
                <div className={styles.popularCard}>
                  <figure className={styles.cardImg}>
                    <Image src="/" alt="Eletricista" width={400} height={250} />
                  </figure>
                  <div className={styles.cardContent}>
                    <h3 className={styles.cardTitle}>Eletricista</h3>
                  </div>
                </div>
              </Link>
            </li>
            <li>
              <Link href="#">
                <div className={styles.popularCard}>
                  <figure className={styles.cardImg}>
                    <Image src="/" alt="Encanador" width={400} height={250} />
                  </figure>
                  <div className={styles.cardContent}>
                    <h3 className={styles.cardTitle}>Encanador</h3>
                  </div>
                </div>
              </Link>
            </li>
            <li>
              <Link href="#">
                <div className={styles.popularCard}>
                  <figure className={styles.cardImg}>
                    <Image src="/" alt="Diarista" width={400} height={250} />
                  </figure>
                  <div className={styles.cardContent}>
                    <h3 className={styles.cardTitle}>Diarista</h3>
                  </div>
                </div>
              </Link>
            </li>
          </ul>
          <button className={`${styles.btn} ${styles.btnPrimary}`} style={{ marginTop: '2rem' }}>
            Outros serviços
          </button>
        </div>
      </section>
    </main>
  );
}