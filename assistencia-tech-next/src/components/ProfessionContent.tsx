'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation'; 
import Link from 'next/link';
import styles from './ProfessionContent.module.css'; // Usaremos um novo CSS para este componente
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';

// Interfaces
interface Freelancer {
  id: string;
  nome: string;
  profissao: string;
  foto?: string;
  descricao?: string;
}

interface Profissao {
  id: string;
  nome: string;
  banner: string;
  descricao: string;
  textoPromocional: string;
  experiencias: string[];
}

export default function ProfessionContent() {
  const [profissao, setProfissao] = useState<Profissao | null>(null);
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [loading, setLoading] = useState(true);

  const searchParams = useSearchParams();
  // Usamos 'babá' como um valor padrão caso o filtro não venha na URL
  const filtro = searchParams.get('filtro') || 'babá';

  useEffect(() => {
    async function fetchData() {
      setLoading(true); // Garante que o loading seja reativado a cada nova busca
      try {
        const docRef = doc(db, 'profissoes', filtro);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfissao({ id: filtro, ...docSnap.data() } as Profissao);
        } else {
          setProfissao(null); // Limpa a profissão se não for encontrada
        }

        const usuariosRef = collection(db, 'usuarios');
        const q = query(usuariosRef, where('tipo', '==', 'tecnico'), where('profissao', '==', filtro));
        const usuariosSnapshot = await getDocs(q);
        const freelancersData = usuariosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Freelancer[];
        setFreelancers(freelancersData);

      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      } finally {
        setLoading(false);
      }
    }

    if (filtro) {
      fetchData();
    }
  }, [filtro]);

  if (loading) return <div className={styles.pageContainer}><h1>Carregando...</h1></div>;
  if (!profissao) return <div className={styles.pageContainer}><h1>Profissão não encontrada.</h1></div>;

  return (
    <>
      <section className={styles.header}>
        <h1>{profissao.nome}</h1>
      </section>
      <div className={styles.descricaoContainer}>
        <p className={styles.descricao}>{profissao.descricao}</p>
        <h2 className={styles.subtitulo}>Sobre a Profissão</h2>
        <p className={styles.textoPromocional}>{profissao.textoPromocional}</p>

        <h3 className={styles.tituloLista}>O que este profissional pode oferecer:</h3>
        <ul className={styles.listaExperiencias}>
          {profissao.experiencias.map((item, index) => (
            <li key={index}>✓ {item}</li>
          ))}
        </ul>
      </div>

      <h2 className={styles.subtitulo}>Profissionais Disponíveis</h2>
      <div className={styles.listaFreelancers}>
        {freelancers.length > 0 ? freelancers.map((freelancer) => (
          <Link
            key={freelancer.id}
            href={`/profissionais/${freelancer.id}`}
            className={styles.cardFreelancer}
          >
            <img
              src={freelancer.foto || '/default-user.png'}
              alt={`Foto de ${freelancer.nome}`}
              className={styles.fotoFreelancer}
            />
            <h4>{freelancer.nome}</h4>
            <p>{freelancer.descricao?.substring(0, 100) || 'Sem descrição fornecida.'}</p>
          </Link>
        )) : <p>Nenhum profissional encontrado para esta categoria.</p>}
      </div>
    </>
  );
}