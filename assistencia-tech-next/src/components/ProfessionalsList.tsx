'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';
import Link from 'next/link';
import Image from 'next/image';
import styles from './ProfessionalsList.module.css'; // O novo CSS abaixo será usado aqui
import pageStyles from '../app/allProfessionals/allProfessionals.module.css';

interface Freelancer {
  id: string;
  nome: string;
  profissao: string;
  foto?: string;
  descricao?: string;
}

const pluralize = (name: string) => {
  if (name.endsWith('r')) return `${name}es`;
  if (name.endsWith('s')) return name;
  return `${name}s`;
};

function ProfessionalsList() {
  const searchParams = useSearchParams();
  const profissaoQuery = searchParams.get('profissao');
  
  const [professionals, setProfessionals] = useState<Freelancer[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('Todos os Profissionais');

  useEffect(() => {
    const fetchProfessionals = async () => {
      setLoading(true);
      try {
        const professionalsRef = collection(db, 'usuarios');
        let q;

        if (profissaoQuery) {
          const docRef = doc(db, 'profissoes', profissaoQuery);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setTitle(pluralize(docSnap.data().nome));
          } else {
            setTitle('Profissionais não encontrados');
          }
          q = query(professionalsRef, where('tipo', '==', 'tecnico'), where('profissao', '==', profissaoQuery));
        } else {
          setTitle('Todos os Profissionais');
          q = query(professionalsRef, where('tipo', '==', 'tecnico'));
        }

        const querySnapshot = await getDocs(q);
        const fetchedProfessionals = querySnapshot.docs.map(doc => ({
          id: doc.id, ...doc.data()
        })) as Freelancer[];
        
        setProfessionals(fetchedProfessionals);
      } catch (error) {
        console.error("Erro ao buscar profissionais:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfessionals();
  }, [profissaoQuery]);

  if (loading) {
    return <p>Carregando profissionais...</p>;
  }
  
  return (
    <>
      <div className={pageStyles.header}>
        <h1 className={pageStyles.pageTitle}>{title}</h1>
      </div>

      {professionals.length === 0 ? (
         <p>Nenhum profissional encontrado para a busca selecionada.</p>
      ) : (
        <div className={styles.grid}>
          {professionals.map(prof => (
            <Link href={`/profissionais/${prof.id}`} key={prof.id} className={styles.card}>
              <div className={styles.cardImageContainer}>
                  <Image 
                    src={prof.foto || '/images/placeholder.jpg'} 
                    alt={`Foto de ${prof.nome}`}
                    fill
                    className={styles.cardImage}
                  />
              </div>
              <div className={styles.cardContent}>
                  <h3 className={styles.cardTitle}>{prof.nome}</h3>
                  <span className={styles.cardSubtitle}>{prof.profissao}</span>
                  <p className={styles.cardDescription}>{prof.descricao || 'Sem descrição.'}</p>
                  <div className={styles.viewProfileButton}>Ver Perfil</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}

export default ProfessionalsList;