'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import styles from './cadastro.module.css';
import { IoPersonOutline, IoBriefcaseOutline } from 'react-icons/io5'; // Ícones

// Componente para o formulário de Cliente
const ClientForm = () => (
  <div className={styles.formContainer}>
    <h2>Criar Conta de Cliente</h2>
    <p>Encontre os melhores profissionais para o seu serviço.</p>
    <form className={styles.form}>
      <input type="text" placeholder="Nome completo" required />
      <input type="email" placeholder="E-mail" required />
      <input type="password" placeholder="Senha" required />
      <button type="submit" className={styles.submitButton}>Cadastrar</button>
    </form>
  </div>
);

// Componente para o formulário de Freelancer
const FreelancerForm = () => (
  <div className={styles.formContainer}>
    <h2>Seja um Profissional</h2>
    <p>Ofereça seus serviços para milhares de clientes.</p>
    <form className={styles.form}>
      <input type="text" placeholder="Nome completo" required />
      <input type="email" placeholder="E-mail" required />
      <select required>
        <option value="">Sua principal profissão</option>
        <option value="eletricista">Eletricista</option>
        <option value="encanador">Encanador</option>
        <option value="montador">Montador de Móveis</option>
        <option value="diarista">Diarista</option>
      </select>
      <input type="password" placeholder="Senha" required />
      <button type="submit" className={styles.submitButton}>Cadastrar</button>
    </form>
  </div>
);

export default function CadastroPage() {
  const [isFreelancer, setIsFreelancer] = useState(false);

  return (
    <div className={styles.pageContainer}>
      <div className={styles.cardWrapper}>
        <div className={`${styles.cardInner} ${isFreelancer ? styles.isFlipped : ''}`}>
          
          {/* Frente do Card: Cadastro de Cliente */}
          <div className={styles.cardFaceFront}>
            <div className={styles.formPanel}>
              <ClientForm />
            </div>
            <div className={`${styles.ctaPanel} ${styles.ctaPanelRight}`}>
              <IoBriefcaseOutline className={styles.ctaIcon} />
              <h3>É um Profissional?</h3>
              <p>Clique aqui para oferecer seus serviços e encontrar novos clientes.</p>
              <button onClick={() => setIsFreelancer(true)} className={styles.switchButton}>
                Cadastrar como Freelancer
              </button>
            </div>
          </div>

          {/* Verso do Card: Cadastro de Freelancer */}
          <div className={styles.cardFaceBack}>
            <div className={`${styles.ctaPanel} ${styles.ctaPanelLeft}`}>
              <IoPersonOutline className={styles.ctaIcon} />
              <h3>Precisa de um Serviço?</h3>
              <p>Volte para se cadastrar como cliente e contratar os melhores profissionais.</p>
              <button onClick={() => setIsFreelancer(false)} className={styles.switchButton}>
                Cadastrar como Cliente
              </button>
            </div>
            <div className={styles.formPanel}>
              <FreelancerForm />
            </div>
          </div>

        </div>
      </div>
       <p className={styles.loginLink}>
        Já tem uma conta? <Link href="/login">Faça login</Link>
      </p>
    </div>
  );
}