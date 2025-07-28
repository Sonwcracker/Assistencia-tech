'use client';

import React, { useEffect, useState } from 'react';
import styles from './chamado.module.css';
import { collection, getDocs, doc, getDoc, query, where, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import Modal from '@/components/Modal';
import ConfirmationModal from '@/components/ConfirmationModal';
import Image from 'next/image';
import { Solicitacao, UserData } from '@/types';

export default function NovosChamadosPage() {
  const { user, userData } = useAuth();
  const [chamadosDisponiveis, setChamadosDisponiveis] = useState<Solicitacao[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados dos Modais
  const [selectedChamado, setSelectedChamado] = useState<Solicitacao | null>(null);
  const [clienteChamado, setClienteChamado] = useState<UserData | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  // Estados para o fluxo de confirmação
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [actionToConfirm, setActionToConfirm] = useState<'aceito_tecnico' | 'recusado_tecnico' | null>(null);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [infoModalMessage, setInfoModalMessage] = useState('');

  useEffect(() => {
    if (userData?.tipo === 'tecnico' && userData.profissao) {
      const fetchChamados = async () => {
        setLoading(true);
        try {
          const q = query(
            collection(db, 'solicitacoes'),
            where('profissao_solicitada', '==', userData.profissao),
            where('status', '==', 'aberto')
          );
          
          const snapshot = await getDocs(q);

          const chamadosDataPromises = snapshot.docs.map(async (docSnap) => {
            const data = docSnap.data();
            const clienteRef = doc(db, 'usuarios', data.cliente_id);
            const clienteSnap = await getDoc(clienteRef);
            const nomeCliente = clienteSnap.exists() ? clienteSnap.data().nome : 'Cliente Desconhecido';
            
            return {
              id: docSnap.id,
              ...docSnap.data(),
              data_criacao: (data.data_criacao as Timestamp).toDate(),
              nomeCliente: nomeCliente,
            } as Solicitacao;
          });

          const chamadosData = await Promise.all(chamadosDataPromises);
          setChamadosDisponiveis(chamadosData);
        } catch (error) {
          console.error("Erro ao buscar chamados:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchChamados();
    } else if (userData) {
      setLoading(false);
      setChamadosDisponiveis([]);
    }
  }, [userData]);

  const openDetailModal = async (chamado: Solicitacao) => {
    setSelectedChamado(chamado);
    setLoading(true);
    const clienteRef = doc(db, 'usuarios', chamado.cliente_id);
    const clienteSnap = await getDoc(clienteRef);
    if (clienteSnap.exists()) {
      setClienteChamado(clienteSnap.data() as UserData);
    }
    setLoading(false);
    setIsDetailModalOpen(true);
  };

  const handleResponseClick = (resposta: 'aceito_tecnico' | 'recusado_tecnico') => {
    setActionToConfirm(resposta);
    setIsDetailModalOpen(false);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmResponse = async () => {
    if (!selectedChamado || !user || !actionToConfirm) return;
    
    try {
      const ref = doc(db, 'solicitacoes', selectedChamado.id);
      await updateDoc(ref, {
        status: actionToConfirm,
        tecnico_id: user.uid,
        resposta_tecnico: actionToConfirm === 'aceito_tecnico' ? 'aceito' : 'recusado'
      });
      
      setChamadosDisponiveis(prev => prev.filter(c => c.id !== selectedChamado.id));
      setIsConfirmModalOpen(false);
      
      if (actionToConfirm === 'aceito_tecnico') {
        setInfoModalMessage('Chamado aceito com sucesso! Ele foi movido para a aba "Em Andamento". Você já pode entrar em contato com o cliente.');
      } else {
        setInfoModalMessage('Chamado recusado com sucesso.');
      }
      setIsInfoModalOpen(true);

      setTimeout(() => setIsInfoModalOpen(false), 5000);

    } catch (error) {
      console.error("Erro ao responder chamado:", error);
      alert("Ocorreu um erro ao responder o chamado.");
    }
  };

  if (loading && chamadosDisponiveis.length === 0) return <p>Carregando seus chamados...</p>;

  return (
    <>
      <div className={styles.container}>
        <h1>Novos Chamados</h1>
        <p>Estes são os chamados direcionados a você que aguardam uma resposta.</p>

        <div className={styles.gridChamados}>
          {chamadosDisponiveis.length > 0 ? (
            chamadosDisponiveis.map(c => (
              <div key={c.id} className={styles.card} onClick={() => openDetailModal(c)}>
                <h3>{c.titulo}</h3>
                <p>{c.descricao.substring(0, 100)}...</p>
                <span>Aberto por: {c.nomeCliente}</span><br/>
                <span>Data: {c.data_criacao.toLocaleDateString('pt-BR')}</span>
              </div>
            ))
          ) : (
            <p>Nenhum chamado novo no momento.</p>
          )}
        </div>
      </div>

      <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)}>
        {loading && <p>Carregando detalhes...</p>}
        {!loading && selectedChamado && clienteChamado && (
          <div className={styles.modalGrid}>
            <div className={styles.modalLeft}>
              <Image
                src={clienteChamado.foto || '/images/placeholder.jpg'}
                width={80}
                height={80}
                alt="foto cliente"
                className={styles.modalImage}
              />
              <h3>{clienteChamado.nome} {clienteChamado.sobrenome}</h3>
              <p className={styles.modalInfo}>{clienteChamado.endereco}</p>
            </div>
            <div className={styles.modalRight}>
              <h2>{selectedChamado.titulo}</h2>
              <p className={styles.modalDescription}>{selectedChamado.descricao}</p>
              <span className={styles.modalDate}>Solicitado em: {selectedChamado.data_criacao.toLocaleDateString('pt-BR')}</span>
              <div className={styles.botoes}>
                <button onClick={() => handleResponseClick('recusado_tecnico')} className={styles.recusar}>Recusar</button>
                <button onClick={() => handleResponseClick('aceito_tecnico')} className={styles.aceitar}>Aceitar Chamado</button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmResponse}
        message={`Você tem certeza que deseja ${actionToConfirm === 'aceito_tecnico' ? 'aceitar' : 'recusar'} este chamado?`}
      />

      <Modal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)}>
        <div className={styles.infoModalContent}>
          <h3>{actionToConfirm === 'aceito_tecnico' ? 'Sucesso!' : 'Ação Concluída'}</h3>
          <p>{infoModalMessage}</p>
          <button onClick={() => setIsInfoModalOpen(false)} className={styles.aceitar}>Ok</button>
        </div>
      </Modal>
    </>
  );
}