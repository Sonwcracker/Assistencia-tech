'use client'

import React, { useEffect, useState } from 'react';
import styles from './servicos.module.css';
import {
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  where,
  Timestamp,
  deleteDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { Solicitacao, UserData } from '@/types';
import Modal from '@/components/Modal';
import Image from 'next/image';
import ConfirmationModal from '@/components/ConfirmationModal';

export default function MinhasSolicitacoesPage() {
  const { user } = useAuth();
  const [solicitacoesAtivas, setSolicitacoesAtivas] = useState<Solicitacao[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados para os Modais
  const [selectedSolicitacao, setSelectedSolicitacao] = useState<Solicitacao | null>(null);
  const [profissionalData, setProfissionalData] = useState<UserData | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [solicitacaoParaCancelar, setSolicitacaoParaCancelar] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchSolicitacoes = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, 'solicitacoes'), 
          where('cliente_id', '==', user.uid),
          where('status', 'in', ['aberto'])
        );
        const snapshot = await getDocs(q);

        const ativasPromises = snapshot.docs.map(async (docSnap) => {
          const data = docSnap.data();
          let nomeProfissional = 'Aguardando aceite';

          if (data.tecnico_id) {
            const tecRef = doc(db, 'usuarios', data.tecnico_id);
            const tecSnap = await getDoc(tecRef);
            if (tecSnap.exists()) {
              nomeProfissional = tecSnap.data().nome;
            }
          }
          
          return {
            id: docSnap.id,
            ...data,
            data_criacao: (data.data_criacao as Timestamp).toDate(),
            nomeProfissional: nomeProfissional,
          } as Solicitacao;
        });

        const ativas = await Promise.all(ativasPromises);
        setSolicitacoesAtivas(ativas);

      } catch (error) {
        console.error('Erro ao buscar solicitações:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSolicitacoes();
  }, [user]);
  
  const handleCardClick = async (solicitacao: Solicitacao) => {
    setSelectedSolicitacao(solicitacao);
    if (solicitacao.tecnico_id) {
        const tecRef = doc(db, 'usuarios', solicitacao.tecnico_id);
        const tecSnap = await getDoc(tecRef);
        if (tecSnap.exists()) {
            setProfissionalData(tecSnap.data() as UserData);
        }
    } else {
        setProfissionalData(null);
    }
    setIsDetailModalOpen(true);
  };

  const openCancelConfirmationModal = (id: string) => {
    setIsDetailModalOpen(false);
    setSolicitacaoParaCancelar(id);
    setIsCancelModalOpen(true);
  };

  const handleCancelarServicoConfirmado = async () => {
    if (solicitacaoParaCancelar) {
      try {
        await deleteDoc(doc(db, 'solicitacoes', solicitacaoParaCancelar));
        setSolicitacoesAtivas(prev => prev.filter(s => s.id !== solicitacaoParaCancelar));
        setSuccessMessage('Solicitação cancelada com sucesso!');
        setIsCancelModalOpen(false);
        setTimeout(() => setSuccessMessage(null), 3000);
      } catch (error) {
        console.error('Erro ao cancelar serviço:', error);
      } finally {
        setSolicitacaoParaCancelar(null);
      }
    }
  };

  const closeCancelModal = () => {
    setIsCancelModalOpen(false);
    setSolicitacaoParaCancelar(null);
  };

  if (loading) return <p>Carregando...</p>;

  return (
    <>
      <div className={styles.container}>
        <h1>Minhas Solicitações Ativas</h1>
        <p>Acompanhe aqui os seus pedidos em aberto e em andamento.</p>

        <div className={styles.section}>
            <h2 className={styles.subtitulo}>Pedidos</h2>
            {solicitacoesAtivas.length === 0 ? (
              <p>Você não possui serviços ativos no momento.</p>
            ) : (
              <div className={styles.gridSolicitacoes}>
                {solicitacoesAtivas.map((s) => (
                  <div key={s.id} className={styles.cardSolicitacao} onClick={() => handleCardClick(s)}>
                    <div className={styles.cardContent}>
                      <p><strong>{s.titulo}</strong></p>
                      <p><strong>Profissão:</strong> {s.profissao_solicitada}</p>
                      <p><strong>Profissional:</strong> {s.nomeProfissional}</p>
                      <p><strong>Status:</strong> <span className={styles.status}>{s.status}</span></p>
                      <p className={styles.data}>Solicitado em: {s.data_criacao.toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
      </div>

      <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)}>
        {selectedSolicitacao && (
            <div className={styles.modalGrid}>
                <div className={styles.modalLeft}>
                    <h3>Profissional</h3>
                    {profissionalData ? (
                        <>
                            <div className={styles.professionalInfo}>
                                <Image src={profissionalData.foto || '/images/placeholder.png'} width={80} height={80} alt="foto profissional" className={styles.modalImage} />
                                <h4>{profissionalData.nome} {profissionalData.sobrenome}</h4>
                                <p className={styles.profissao}>{profissionalData.profissao}</p>
                                <p className={styles.email}>{profissionalData.email}</p>
                            </div>
                        </>
                    ) : (
                        <p>Aguardando aceite de um profissional.</p>
                    )}
                </div>
                <div className={styles.modalRight}>
                    <h2 className={styles.modalTitle}>{selectedSolicitacao.titulo}</h2>
                    <p><strong>Descrição:</strong> {selectedSolicitacao.descricao}</p>
                    <p><strong>Status:</strong> {selectedSolicitacao.status}</p>
                    <div className={styles.botoes}>
                        <button 
                          className={styles.btnCancelarModal} 
                          onClick={() => openCancelConfirmationModal(selectedSolicitacao.id)}
                        >
                          Cancelar Serviço
                        </button>
                    </div>
                </div>
            </div>
        )}
      </Modal>

      <ConfirmationModal
        isOpen={isCancelModalOpen}
        onClose={closeCancelModal}
        onConfirm={handleCancelarServicoConfirmado}
        message="Tem certeza que deseja cancelar este serviço? Esta ação não poderá ser desfeita."
      />

      {successMessage && (
        <div className={styles.successToast}>
          {successMessage}
        </div>
      )}
    </>
  );
}