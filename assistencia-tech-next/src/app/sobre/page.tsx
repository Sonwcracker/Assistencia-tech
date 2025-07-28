'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import styles from './Sobre.module.css';
import { IoShieldCheckmarkOutline, IoPeopleOutline, IoRocketOutline, IoSearchOutline, IoCreateOutline, IoNotificationsOutline, IoDocumentTextOutline, IoHappyOutline } from 'react-icons/io5';

export default function SobrePage() {
  const [activeTab, setActiveTab] = useState<'cliente' | 'tecnico'>('cliente');

  const clienteSteps = [
    { icon: <IoSearchOutline />, text: 'Busque pelo serviço ou profissional que você precisa.' },
    { icon: <IoPeopleOutline />, text: 'Analise os perfis, competências e avaliações de outros clientes.' },
    { icon: <IoHappyOutline />, text: 'Entre em contato, solicite um orçamento e contrate com segurança.' }
  ];

  const tecnicoSteps = [
    { icon: <IoCreateOutline />, text: 'Cadastre seu perfil gratuitamente e adicione suas competências.' },
    { icon: <IoNotificationsOutline />, text: 'Receba notificações de novos chamados na sua área de atuação.' },
    { icon: <IoDocumentTextOutline />, text: 'Envie sua proposta, seja contratado e aumente sua renda.' }
  ];

  return (
    <div className={styles.pageContainer}>
      {/* Seção Hero */}
      <section className={`${styles.hero} ${styles.section}`}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Conectando Pessoas, Resolvendo Problemas.</h1>
          <p className={styles.heroSubtitle}>
            Nossa missão é simplificar a contratação de serviços, oferecendo uma plataforma segura,
            eficiente e acessível que valoriza tanto o cliente quanto o profissional.
          </p>
        </div>
      </section>

      {/* Seção Como Funciona */}
      <section className={`${styles.howItWorks} ${styles.section}`}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Como Funciona</h2>
          <div className={styles.tabs}>
            <button
              className={`${styles.tabButton} ${activeTab === 'cliente' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('cliente')}
            >
              Para Clientes
            </button>
            <button
              className={`${styles.tabButton} ${activeTab === 'tecnico' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('tecnico')}
            >
              Para Profissionais
            </button>
          </div>

          <div className={styles.tabContent}>
            <div className={styles.stepsGrid}>
              {(activeTab === 'cliente' ? clienteSteps : tecnicoSteps).map((step, index) => (
                <div key={index} className={styles.stepCard}>
                  <div className={styles.stepIconWrapper}>
                    {step.icon}
                  </div>
                  <h3 className={styles.stepTitle}>Passo {index + 1}</h3>
                  <p className={styles.stepText}>{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Seção de História */}
      <section className={`${styles.history} ${styles.section}`}>
        <div className={`${styles.container} ${styles.historyContainer}`}>
          <div className={styles.historyImage}>
            <Image
              src="/images/logoBranca.png"
              alt="Logo Servify"
              width={500}
              height={500}
              style={{ objectFit: 'contain' }}
            />
          </div>
          <div className={styles.historyContent}>
            <h2 className={styles.historyTitle}>Nossa Jornada</h2>
            <p>
              A Servify nasceu da necessidade de encontrar serviços confiáveis de forma rápida.
              Cansados da incerteza e da dificuldade em achar bons profissionais para tarefas do dia a dia,
              decidimos criar uma solução. Começamos como um pequeno projeto e hoje nos orgulhamos de ser
              a ponte que conecta milhares de clientes a especialistas dedicados em todo o país,
              facilitando a vida e gerando novas oportunidades de trabalho.
            </p>
          </div>
        </div>
      </section>
      {/* Seção de Valores */}
      <section className={`${styles.values} ${styles.section}`}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Nossos Pilares</h2>
          <div className={styles.valuesGrid}>
            <div className={styles.valueCard}>
              <IoShieldCheckmarkOutline className={styles.valueIcon} />
              <h3>Confiança e Segurança</h3>
              <p>Verificamos nossos profissionais e garantimos um ambiente seguro para negociações e pagamentos.</p>
            </div>
            <div className={styles.valueCard}>
              <IoPeopleOutline className={styles.valueIcon} />
              <h3>Valorização Humana</h3>
              <p>Acreditamos no potencial de cada profissional e criamos oportunidades para o crescimento de talentos locais.</p>
            </div>
            <div className={styles.valueCard}>
              <IoRocketOutline className={styles.valueIcon} />
              <h3>Inovação e Simplicidade</h3>
              <p>Usamos a tecnologia para tornar a contratação de serviços tão simples quanto pedir um lanche, sem burocracia.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}