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
  const [previewFoto, setPreviewFoto] = useState('');

  // Cadastro de cliente
  const handleClienteSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;

    const nome = form.nome.value;
    const sobrenome = form.sobrenome.value;
    const email = form.email.value;
    const telefone = form.telefone.value;
    const cpf = form.cpf.value;
    const cep = form.cep.value;
    const endereco = form.endereco.value;
    const senha = form.senha.value;

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

  // Cadastro de profissional
  const handleFreelancerSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;

    const nome = form.nome.value;
    const sobrenome = form.sobrenome.value;
    const email = form.email.value;
    const telefone = form.telefone.value;
    const cpf = form.cpf.value;
    const cep = form.cep.value;
    const endereco = form.endereco.value;
    const profissao = form.profissao.value;
    const descricao = form.descricao.value;
    const experiencias = form.experiencias.value;
    const curriculo = form.curriculo.value;
    const foto = form.foto.value;
    const senha = form.senha.value;

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
      setPreviewFoto('');
    } catch (error) {
      console.error(error);
      alert('Erro ao criar conta de profissional.');
    }
  };

  // Formulário do cliente
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

  // Formulário do profissional
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
          <option value="montador">Técnico em Informática</option>
          <option value="diarista">Diarista</option>
          <option value="pintor">Babá</option>
          <option value="outro">Cuidador</option>
          <option value="outro">Marceneiro</option>
          <option value="outro">Pedreiro</option>
          <option value="outro">Pintor</option>
        </select>

        <textarea name="descricao" placeholder="Conte um pouco sobre você" required />
        <textarea name="experiencias" placeholder="Suas experiências anteriores" required />
        <input name="curriculo" type="text" placeholder="Link do currículo (opcional)" />

        <input
          name="foto"
          type="text"
          placeholder="URL da foto de perfil"
          required
          onChange={(e) => setPreviewFoto(e.target.value)}
        />
        {previewFoto && (
          <div className={styles.previewContainer}>
            <img src={previewFoto} alt="Prévia da Foto" className={styles.previewImage} />
          </div>
        )}

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
