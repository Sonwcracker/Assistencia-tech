'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import styles from './profile.module.css';
import { db, auth } from '@/lib/firebase';
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
import { signOut } from 'firebase/auth';
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
  profissao: string;
  foto?: string;
  competencias?: string[];
}

export default function FreelancerProfilePage() {
  const router = useRouter();
  const params = useParams();
  const freelancerId = params.id as string;
  const { user, userData } = useAuth(); // Pegamos também o userData para verificar o tipo

  const [freelancerData, setFreelancerData] = useState<Freelancer | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Estados para os modais
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formData, setFormData] = useState({ titulo: '', motivo: '' });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAccountTypeModalOpen, setIsAccountTypeModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isExistingRequestModalOpen, setIsExistingRequestModalOpen] = useState(false);

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
      } else {
          setLoading(false);
      }
    }
    fetchFreelancer();
  }, [freelancerId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!user || !freelancerData) return;
    try {
      await addDoc(collection(db, 'solicitacoes'), {
        cliente_id: user.uid,
        tecnico_id: freelancerId,
        nome: freelancerData.nome,
        email: freelancerData.email,
        profissao_solicitada: freelancerData.profissao,
        titulo: formData.titulo,
        descricao: formData.motivo,
        data_criacao: serverTimestamp(),
        status: 'aberto',
      });
      setIsFormModalOpen(false);
      setFormData({ titulo: '', motivo: '' });
      setIsSuccessModalOpen(true);
      setTimeout(() => setIsSuccessModalOpen(false), 3000);
    } catch (error) {
      console.error('Erro ao enviar solicitação:', error);
      alert('Erro ao enviar solicitação.');
    }
  };

  const handleContratarClick = async () => {
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }
    if (userData?.tipo === 'tecnico') {
      setIsAccountTypeModalOpen(true);
      return;
    }
    try {
      const q = query(
        collection(db, 'solicitacoes'),
        where('cliente_id', '==', user.uid),
        where('tecnico_id', '==', freelancerId),
        where('status', '==', 'aberto')
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        setIsExistingRequestModalOpen(true);
        return;
      }
      setIsFormModalOpen(true);
    } catch (error) {
      console.error('Erro ao verificar solicitações:', error);
      alert('Erro ao verificar solicitações.');
    }
  };
  
  const handleSwitchAccount = () => {
    signOut(auth).then(() => {
        router.push('/login');
    });
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

  const imagemSrc = freelancerData.foto && freelancerData.foto.startsWith('http') ? freelancerData.foto : '/images/placeholder.png';

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
              <Image src={imagemSrc} alt={`Foto de ${freelancerData.nome}`} fill style={{ objectFit: 'cover' }} />
            </div>
            <h1 className={styles.name}>{freelancerData.nome} {freelancerData.sobrenome}</h1>
            <div className={styles.infoItem}>
              <IoLocationOutline />
              <span>{freelancerData.endereco}</span>
            </div>
            <button onClick={handleContratarClick} className={styles.ctaButton}>Contratar</button>
          </div>
          <div className={styles.rightColumn}>
            <h2>Sobre Mim</h2>
            <p className={styles.description}>{freelancerData.descricao || 'Nenhuma descrição fornecida.'}</p>
            <h2>Competências</h2>
            <div className={styles.competenciesContainer}>
                {Array.isArray(freelancerData.competencias) && freelancerData.competencias.length > 0 ? (
                    freelancerData.competencias.map((comp, index) => (
                        <span key={index} className={styles.competencyTag}>{comp}</span>
                    ))
                ) : (
                    <p>Nenhuma competência informada.</p>
                )}
            </div>
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

      <Modal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)}>
        <div className={styles.modalContent}>
          <h2>Formulário de Contratação</h2>
          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
            <label>
              Título do Serviço:
              <input type="text" name="titulo" value={formData.titulo} onChange={handleInputChange} required />
            </label>
            <label>
              Descreva o que você precisa:
              <textarea name="motivo" value={formData.motivo} onChange={handleInputChange} rows={4} required />
            </label>
            <div className={styles.modalActions}>
              <button type="button" className={styles.modalButtonCancel} onClick={() => setIsFormModalOpen(false)}>Cancelar</button>
              <button type="submit" className={styles.modalButtonConfirm}>Enviar Solicitação</button>
            </div>
          </form>
        </div>
      </Modal>

      <Modal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)}>
        <div className={styles.modalContent}>
          <h2>Login Necessário</h2>
          <p>Para contratar um profissional, você precisa fazer login na sua conta.</p>
          <div className={styles.modalActions}>
            <button type="button" className={styles.modalButtonCancel} onClick={() => setIsLoginModalOpen(false)}>Cancelar</button>
            <button type="button" className={styles.modalButtonConfirm} onClick={() => router.push('/login')}>Fazer Login</button>
          </div>
        </div>
      </Modal>
      
      <Modal isOpen={isAccountTypeModalOpen} onClose={() => setIsAccountTypeModalOpen(false)}>
        <div className={styles.modalContent}>
          <h2>Ação não permitida</h2>
          <p>Contas de profissionais não podem contratar serviços. Por favor, troque de conta ou crie uma conta de cliente para continuar.</p>
          <div className={styles.modalActions}>
            <button type="button" className={styles.modalButtonCancel} onClick={() => setIsAccountTypeModalOpen(false)}>Cancelar</button>
            <button type="button" className={styles.modalButtonConfirm} onClick={handleSwitchAccount}>Trocar de Conta</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isExistingRequestModalOpen} onClose={() => setIsExistingRequestModalOpen(false)}>
        <div className={styles.modalContent}>
          <h2>Aviso</h2>
          <p>Você já possui uma solicitação em aberto com este profissional.</p>
          <div className={styles.modalActions}>
            <button type="button" className={styles.modalButtonConfirm} onClick={() => setIsExistingRequestModalOpen(false)}>Ok</button>
          </div>
        </div>
      </Modal>
      
      <Modal isOpen={isSuccessModalOpen} onClose={() => setIsSuccessModalOpen(false)}>
          <div className={styles.modalContent}>
              <h2>Solicitação Enviada!</h2>
              <p>Sua solicitação foi enviada para o profissional. Aguarde o contato dele.</p>
              <div className={styles.modalActions}>
                  <button type="button" className={styles.modalButtonConfirm} onClick={() => setIsSuccessModalOpen(false)}>Ok</button>
              </div>
          </div>
      </Modal>
    </>
  );
}