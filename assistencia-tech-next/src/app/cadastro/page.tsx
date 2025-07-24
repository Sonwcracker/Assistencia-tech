'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import styles from './cadastro.module.css';
import { IoPersonOutline, IoBriefcaseOutline } from 'react-icons/io5';
import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

export default function CadastroPage() {
  const [isFreelancer, setIsFreelancer] = useState(false);

  const handleClienteSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const nome = (form.elements.namedItem('nome') as HTMLInputElement).value;
    const sobrenome = (form.elements.namedItem('sobrenome') as HTMLInputElement).value;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const telefone = (form.elements.namedItem('telefone') as HTMLInputElement).value;
    const cpf = (form.elements.namedItem('cpf') as HTMLInputElement).value;
    const cep = (form.elements.namedItem('cep') as HTMLInputElement).value;
    const endereco = (form.elements.namedItem('endereco') as HTMLInputElement).value;
    const senha = (form.elements.namedItem('senha') as HTMLInputElement).value;

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      const userId = userCredential.user.uid;

      await setDoc(doc(db, 'usuarios', userId), {
        nome,
        sobrenome,
        email,
        telefone,
        cpf,
        cep,
        endereco,
        tipo: 'cliente',
      });

      alert('Conta criada com sucesso!');
      form.reset();
    } catch (error) {
      console.error(error);
      alert('Erro ao criar conta. Tente novamente.');
    }
  };

  const handleFreelancerSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const nome = (form.elements.namedItem('nome') as HTMLInputElement).value;
    const sobrenome = (form.elements.namedItem('sobrenome') as HTMLInputElement).value;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const telefone = (form.elements.namedItem('telefone') as HTMLInputElement).value;
    const cpf = (form.elements.namedItem('cpf') as HTMLInputElement).value;
    const cep = (form.elements.namedItem('cep') as HTMLInputElement).value;
    const endereco = (form.elements.namedItem('endereco') as HTMLInputElement).value;
    const profissao = (form.elements.namedItem('profissao') as HTMLSelectElement).value;
    const descricao = (form.elements.namedItem('descricao') as HTMLTextAreaElement).value;
    const experiencias = (form.elements.namedItem('experiencias') as HTMLTextAreaElement).value;
    const curriculo = (form.elements.namedItem('curriculo') as HTMLInputElement).value;
    const foto = (form.elements.namedItem('foto') as HTMLInputElement).value;
    const senha = (form.elements.namedItem('senha') as HTMLInputElement).value;

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      const userId = userCredential.user.uid;

      await setDoc(doc(db, 'usuarios', userId), {
        nome,
        sobrenome,
        email,
        telefone,
        cpf,
        cep,
        endereco,
        profissao,
        descricao,
        experiencias,
        curriculo,
        foto,
        tipo: 'tecnico',
      });

      alert('Conta de profissional criada com sucesso!');
      form.reset();
    } catch (error) {
      console.error(error);
      alert('Erro ao criar conta de profissional.');
    }
  };

  const ClientForm = () => (
    <div className={styles.formContainer}>
      <h2>Criar Conta de Cliente</h2>
      <p>Encontre os melhores profissionais para o seu serviço.</p>
      <form className={styles.form} onSubmit={handleClienteSubmit}>
        <input name="nome" type="text" placeholder="Nome" required />
        <input name="sobrenome" type="text" placeholder="Sobrenome" required />
        <input name="email" type="email" placeholder="E-mail" required />
        <input name="telefone" type="tel" placeholder="Telefone" required />
        <input name="cpf" type="text" placeholder="CPF" required />
        <input name="cep" type="text" placeholder="CEP" required />
        <input name="endereco" type="text" placeholder="Endereço" required />
        <input name="senha" type="password" placeholder="Senha" required />
        <button type="submit" className={styles.submitButton}>Cadastrar</button>
      </form>
    </div>
  );

  const FreelancerForm = () => (
    <div className={styles.formContainer}>
      <h2>Seja um Profissional</h2>
      <p>Ofereça seus serviços para milhares de clientes.</p>
      <form className={styles.form} onSubmit={handleFreelancerSubmit}>
        <input name="nome" type="text" placeholder="Nome" required />
        <input name="sobrenome" type="text" placeholder="Sobrenome" required />
        <input name="email" type="email" placeholder="E-mail" required />
        <input name="telefone" type="tel" placeholder="Telefone" required />
        <input name="cpf" type="text" placeholder="CPF" required />
        <input name="cep" type="text" placeholder="CEP" required />
        <input name="endereco" type="text" placeholder="Endereço" required />
        <select name="profissao" required>
          <option value="">Sua principal profissão</option>
          <option value="eletricista">Eletricista</option>
          <option value="encanador">Encanador</option>
          <option value="montador">Montador de Móveis</option>
          <option value="diarista">Diarista</option>
        </select>
        <textarea name="descricao" placeholder="Conte um pouco sobre você" required />
        <textarea name="experiencias" placeholder="Suas experiências anteriores" required />
        <input name="curriculo" type="text" placeholder="Link do currículo (opcional)" />
        <input name="foto" type="text" placeholder="URL da foto de perfil" required />
        <input name="senha" type="password" placeholder="Senha" required />
        <button type="submit" className={styles.submitButton}>Cadastrar</button>
      </form>
    </div>
  );

  return (
    <div className={styles.pageContainer}>
      <div className={styles.cardWrapper}>
        <div className={`${styles.cardInner} ${isFreelancer ? styles.isFlipped : ''}`}>
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
