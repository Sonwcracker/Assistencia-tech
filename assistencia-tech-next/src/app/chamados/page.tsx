'use client';

import React, { useEffect, useState } from 'react';
import styles from './chamado.module.css';
// 1. IMPORTAR O onSnapshot e Unsubscribe
import { collection, getDocs, doc, getDoc, query, where, updateDoc, Timestamp, onSnapshot, Unsubscribe } from 'firebase/firestore';
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
    // Variável para guardar a função de "parar de escutar"
    let unsubscribe: Unsubscribe | null = null;

    if (user && userData?.tipo === 'tecnico') {
      // A consulta continua a mesma
      const q = query(
        collection(db, 'solicitacoes'),
        where('tecnico_id', '==', user.uid),
        where('status', '==', 'aberto')
      );

      // 2. SUBSTITUIR a busca única (getDocs) pelo listener em tempo real (onSnapshot)
      // Esta função será chamada uma vez com os dados iniciais e, depois,
      // toda vez que houver uma alteração nos resultados da consulta.
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
        setLoading(false); // Desativa o loading após a primeira carga
      }, (error) => {
        // Função para tratar erros no listener
        console.error("Erro ao escutar chamados:", error);
        setLoading(false);
      });

    } else {
      setLoading(false);
      setChamadosDisponiveis([]);
    }

    // 3. FUNÇÃO DE LIMPEZA (ESSENCIAL)
    // Quando o usuário sai da página, a conexão com o Firestore é encerrada
    // para não consumir recursos desnecessariamente.
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user, userData]); // O useEffect roda novamente se o usuário mudar

  // O resto do seu componente permanece o mesmo
  
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
      // Não precisamos mais remover o item manualmente do estado com 'setChamadosDisponiveis'.
      // O onSnapshot fará isso automaticamente, pois o status do chamado mudou
      // e ele não corresponde mais à consulta (status == 'aberto').
      setIsDetailModalOpen(false);
      alert(`Chamado ${resposta === 'aceito_tecnico' ? 'aceito' : 'recusado'} com sucesso!`);
    } catch (error) {
      console.error("Erro ao responder chamado:", error);
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
                <h3>Cliente: {c.nomeCliente}</h3>
                <p><strong>Serviço:</strong> {c.profissao_solicitada}</p>
                <p>{c.descricao.substring(0, 100)}...</p>
                <span>Aberto em: {c.data_criacao.toLocaleDateString('pt-BR')}</span>
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
              <Image src={clienteChamado.foto || '/images/placeholder.jpg'} width={80} height={80} alt="foto cliente" className={styles.modalImage}/>
              <h3>{clienteChamado.nome} {clienteChamado.sobrenome}</h3>
              <p className={styles.modalInfo}>{clienteChamado.endereco}</p>
            </div>
            <div className={styles.modalRight}>
              <h2>{selectedChamado.profissao_solicitada}</h2>
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