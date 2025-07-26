'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import styles from './profile.module.css';
import { db } from '@/lib/firebase';
import {
  doc,
  getDoc,
  addDoc,
  collection,
  serverTimestamp,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import Image from 'next/image';
import Link from 'next/link';
import { IoArrowBackOutline, IoMailOutline, IoCallOutline, IoLocationOutline } from 'react-icons/io5';
import { useAuth } from '@/context/AuthContext';
import Modal from '@/components/Modal';

// 1. INTERFACE ATUALIZADA
interface Freelancer {
  nome: string;
  sobrenome: string;
  email: string;
  telefone: string;
  endereco: string;
  descricao: string;
  profissao: string; // <-- CAMPO ADICIONADO
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
  const [formData, setFormData] = useState({ motivo: '', endereco: '', data: '' });

  useEffect(() => {
    async function fetchFreelancer() {
      if (freelancerId) {
        try {
          const docRef = doc(db, 'usuarios', freelancerId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) setFreelancerData(docSnap.data() as Freelancer);
        } catch (error) {
          console.error("Erro ao buscar dados:", error);
        } finally {
          setLoading(false);
        }
      }
    }
    fetchFreelancer();
  }, [freelancerId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!user || !freelancerData) return; // Garante que freelancerData não é nulo

    try {
      // Verifica se já existe uma solicitação aberta
      const q = query(
        collection(db, 'solicitacoes'),
        where('cliente_id', '==', user.uid),
        where('tecnico_id', '==', freelancerId),
        where('status', '==', 'aberto')
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        alert('Você já possui uma solicitação em aberto com este profissional. Finalize-a antes de enviar uma nova.');
        return;
      }

      // 2. CRIAÇÃO DO CHAMADO CORRIGIDA
      await addDoc(collection(db, 'solicitacoes'), {
        cliente_id: user.uid,
        tecnico_id: freelancerId,
        nome: freelancerData.nome, // Usando os dados do perfil
        email: freelancerData.email,
        profissao_solicitada: freelancerData.profissao, // <-- CORREÇÃO PRINCIPAL
        data_criacao: serverTimestamp(),
        data_prevista: formData.data,
        endereco: formData.endereco,
        descricao: formData.motivo,
        status: 'aberto',
        // Os campos abaixo podem precisar de revisão futura, mas não causam o bug atual
        profissional_id: '',
        cep: '',
      });

      alert('Solicitação enviada com sucesso!');
      setIsModalOpen(false);
      setFormData({ motivo: '', endereco: '', data: '' });

    } catch (error) {
      console.error('Erro ao enviar solicitação:', error);
      alert('Erro ao enviar solicitação.');
    }
  };

  const handleContratarClick = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    // A lógica de verificação antes de abrir o modal é boa.
    // O código aqui já está correto.
    try {
      const q = query(
        collection(db, 'solicitacoes'),
        where('cliente_id', '==', user.uid),
        where('tecnico_id', '==', freelancerId),
        where('status', '==', 'aberto')
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        alert('Você já possui uma solicitação em aberto com este profissional. Finalize-a antes de enviar uma nova.');
        return;
      }

      setIsModalOpen(true);
    } catch (error) {
      console.error('Erro ao verificar solicitações:', error);
      alert('Erro ao verificar solicitações.');
    }
  };

  if (loading) return <div className={styles.profileContainer}>Carregando perfil...</div>;
  if (!freelancerData) {
    return (
      <div className={styles.notFound}>
        <h2>Freelancer não encontrado</h2>
        <Link href="/profissionais">Voltar para a lista</Link>
      </div>
    );
  }

  const imagemSrc = freelancerData.foto?.startsWith('http') ? freelancerData.foto : '/images/placeholder.jpg';

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
            <button onClick={handleContratarClick} className={styles.ctaButton}>
              Contratar
            </button>
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
              <div className={styles.infoItem}>
                <IoCallOutline />
                <span>{freelancerData.telefone}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
  <div className={styles.modalContent}>
    <h2>Formulário de Contratação</h2>

    <label>
      Título:
      <input type="text" name="titulo" value={formData.titulo} onChange={handleInputChange} />
    </label>

    <label>
      Motivo:
      <textarea name="motivo" value={formData.motivo} onChange={handleInputChange} />
    </label>

    <label>
      Endereço:
      <input type="text" name="endereco" value={formData.endereco} onChange={handleInputChange} />
    </label>

    <label>
      Data disponível:
      <input type="date" name="data" value={formData.data} onChange={handleInputChange} />
    </label>

    <div className={styles.modalActions}>
      <button className={styles.modalButtonCancel} onClick={() => setIsModalOpen(false)}>Cancelar</button>
      <button className={styles.modalButtonConfirm} onClick={handleSubmit}>Enviar</button>
    </div>
  </div>
</Modal>

    </>
  );
}