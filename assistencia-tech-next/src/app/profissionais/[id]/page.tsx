'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import styles from './profile.module.css';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Image from 'next/image';
import Link from 'next/link';
import { IoArrowBackOutline, IoMailOutline, IoCallOutline, IoLocationOutline } from 'react-icons/io5';
import { useAuth } from '@/context/AuthContext';
import Modal from '@/components/Modal';

// Interface para os dados do Freelancer
interface Freelancer {
  nome: string;
  sobrenome: string;
  email: string;
  telefone: string;
  endereco: string;
  descricao: string;
  foto?: string;
  experiencias?: string;
}

export default function FreelancerProfilePage() {
  const router = useRouter();
  const params = useParams();
  const freelancerId = params.id as string;

  const { user } = useAuth();
  const [freelancerData, setFreelancerData] = useState<Freelancer | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function fetchFreelancer() {
      if (freelancerId) {
        try {
          const docRef = doc(db, 'usuarios', freelancerId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setFreelancerData(docSnap.data() as Freelancer);
          }
        } catch (error) {
          console.error("Erro ao buscar dados:", error);
        } finally {
          setLoading(false);
        }
      }
    }
    fetchFreelancer();
  }, [freelancerId]);

  if (loading) {
    return <div className={styles.profileContainer}>Carregando perfil...</div>;
  }

  if (!freelancerData) {
    return (
      <div className={styles.notFound}>
        <h2>Freelancer não encontrado</h2>
        <Link href="/profissionais">Voltar para a lista</Link>
      </div>
    );
  }

  const fotoValida = freelancerData.foto && (freelancerData.foto.startsWith('http') || freelancerData.foto.startsWith('/'));
  const imagemSrc = fotoValida ? freelancerData.foto : '/images/placeholder.jpg';

  const hasTelefone = freelancerData.telefone && freelancerData.telefone.trim() !== '';
  const whatsappLink = hasTelefone 
    ? `https://wa.me/${freelancerData.telefone.replace(/\D/g, '')}` 
    : '';

  const handleOrcamentoClick = () => {
    if (user) {
      window.open(whatsappLink, '_blank');
    } else {
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <div className={styles.profileContainer}>
        <button onClick={() => router.back()} className={styles.backButton}>
          <IoArrowBackOutline />
          <span>Voltar para a lista</span>
        </button>

        <div className={styles.profileCard}>
          <div className={styles.leftColumn}>
            <div className={styles.profileImageWrapper}>
              <Image
                src={imagemSrc}
                alt={`Foto de ${freelancerData.nome}`}
                fill
                style={{ objectFit: 'cover' }}
              />
            </div>
            <h1 className={styles.name}>{freelancerData.nome} {freelancerData.sobrenome}</h1>
            <div className={styles.infoItem}>
              <IoLocationOutline />
              <span>{freelancerData.endereco}</span>
            </div>
            {hasTelefone && (
              <button onClick={handleOrcamentoClick} className={styles.ctaButton}>
                Solicitar Orçamento
              </button>
            )}
          </div>
          <div className={styles.rightColumn}>
            <h2>Sobre Mim</h2>
            <p className={styles.description}>{freelancerData.descricao || "Nenhuma descrição fornecida."}</p>
            <h2>Experiências</h2>
            <p className={styles.experiences}>{freelancerData.experiencias || "Nenhuma experiência informada."}</p>
            <div className={styles.contactInfo}>
              <h3>Informações de Contato</h3>
              <div className={styles.infoItem}>
                <IoMailOutline />
                <a href={`mailto:${freelancerData.email}`}>{freelancerData.email}</a>
              </div>
              {hasTelefone && (
                <div className={styles.infoItem}>
                  <IoCallOutline />
                  <span>{freelancerData.telefone}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className={styles.modalContent}>
          <h2>Login Necessário</h2>
          <p>Você precisa estar logado como cliente para solicitar um orçamento.</p>
          <div className={styles.modalActions}>
            <button onClick={() => setIsModalOpen(false)} className={styles.modalButtonCancel}>
              Cancelar
            </button>
            <button onClick={() => router.push('/login')} className={styles.modalButtonConfirm}>
              Fazer Login
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}