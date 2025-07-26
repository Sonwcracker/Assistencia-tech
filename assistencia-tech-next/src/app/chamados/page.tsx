'use client';

import React, { useEffect, useState } from 'react';
import styles from './chamado.module.css';
import {
  collection,
  doc,
  getDoc,
  query,
  where,
  updateDoc,
  Timestamp,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import Modal from '@/components/Modal';
import Image from 'next/image';
import { Solicitacao, UserData } from '@/types';

export default function NovosChamadosPage() {
  const { user, userData } = useAuth();
  const [chamadosDisponiveis, setChamadosDisponiveis] = useState<Solicitacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChamado, setSelectedChamado] = useState<Solicitacao | null>(null);
  const [clienteChamado, setClienteChamado] = useState<UserData | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    let unsubscribe: Unsubscribe | null = null;

    if (user && userData?.tipo === 'tecnico') {
      const q = query(
        collection(db, 'solicitacoes'),
        where('tecnico_id', '==', user.uid),
        where('status', '==', 'aberto')
      );

      unsubscribe = onSnapshot(q, async (querySnapshot) => {
        const chamadosDataPromises = querySnapshot.docs.map(async (docSnap) => {
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
        setLoading(false);
      }, (error) => {
        console.error('Erro ao escutar chamados:', error);
        setLoading(false);
      });
    } else {
      setLoading(false);
      setChamadosDisponiveis([]);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user, userData]);

  const openDetailModal = async (chamado: Solicitacao) => {
    setSelectedChamado(chamado);
    if (chamado.cliente_id) {
      setLoading(true);
      const clienteRef = doc(db, 'usuarios', chamado.cliente_id);
      const clienteSnap = await getDoc(clienteRef);
      if (clienteSnap.exists()) {
        setClienteChamado(clienteSnap.data() as UserData);
      }
      setLoading(false);
    }
    setIsDetailModalOpen(true);
  };

  const handleResponse = async (resposta: 'aceito_tecnico' | 'recusado_tecnico') => {
    if (!selectedChamado || !user) return;
    try {
      const ref = doc(db, 'solicitacoes', selectedChamado.id);
      await updateDoc(ref, {
        status: resposta,
      });
      setIsDetailModalOpen(false);
      alert(`Chamado ${resposta === 'aceito_tecnico' ? 'aceito' : 'recusado'} com sucesso!`);
    } catch (error) {
      console.error('Erro ao responder chamado:', error);
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
                <button onClick={() => handleResponse('recusado_tecnico')} className={styles.recusar}>Recusar</button>
                <button onClick={() => handleResponse('aceito_tecnico')} className={styles.aceitar}>Aceitar Chamado</button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
