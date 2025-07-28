'use client';

import React, { useEffect, useState } from 'react';
import styles from '../chamado.module.css'; // Podemos reutilizar o mesmo CSS
import { collection, getDocs, doc, getDoc, query, where, Timestamp, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import Modal from '@/components/Modal';
import Image from 'next/image';
import { Solicitacao, UserData } from '@/types';

export default function AndamentoPage() {
  const { user } = useAuth();
  const [chamadosEmAndamento, setChamadosEmAndamento] = useState<Solicitacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChamado, setSelectedChamado] = useState<Solicitacao | null>(null);
  const [clienteChamado, setClienteChamado] = useState<UserData | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    if (!user) {
        setLoading(false);
        return;
    };

    const fetchChamados = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, 'solicitacoes'),
          where('tecnico_id', '==', user.uid),
          where('status', '==', 'aceito_tecnico') // Usando o status que definimos para chamados aceitos
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
        setChamadosEmAndamento(chamadosData);

      } catch (error) {
        console.error("Erro ao buscar chamados em andamento:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChamados();
  }, [user]);

  // Função para abrir o modal
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

  // **FUNÇÃO ADICIONADA**
  // Função para marcar o chamado como concluído
  const marcarComoConcluido = async () => {
    if (!selectedChamado) return;
    try {
      const ref = doc(db, 'solicitacoes', selectedChamado.id);
      await updateDoc(ref, {
        status: 'finalizado', // Atualiza o status para 'finalizado'
      });

      // Remove o chamado da lista na tela, para o técnico ver a mudança na hora
      setChamadosEmAndamento(prev => prev.filter(c => c.id !== selectedChamado.id));
      setIsDetailModalOpen(false); // Fecha o modal
      alert('Chamado marcado como concluído!');
    } catch (error) {
      console.error('Erro ao marcar como concluído:', error);
      alert('Erro ao concluir o chamado.');
    }
  };
  
  if (loading) return <p>Carregando seus chamados em andamento...</p>;

  return (
    <>
      <div className={styles.container}>
        <h1>Chamados em Andamento</h1>
        <p>Estes são os serviços que você já aceitou e estão em andamento.</p>
        
        <div className={styles.gridChamados}>
          {chamadosEmAndamento.length > 0 ? (
            chamadosEmAndamento.map(c => (
              <div key={c.id} className={styles.card} onClick={() => openDetailModal(c)}>
                <h3>Cliente: {c.nomeCliente}</h3>
                <p><strong>Serviço:</strong> {c.profissao_solicitada}</p>
                <p>{c.descricao.substring(0, 100)}...</p>
                <span>Aceito em: {c.data_criacao.toLocaleDateString('pt-BR')}</span>
              </div>
            ))
          ) : (
            <p>Nenhum chamado em andamento no momento.</p> 
          )}
        </div>
      </div>

      <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)}>
        {loading && <p>Carregando detalhes...</p>}
        {!loading && selectedChamado && clienteChamado && (
          <div className={styles.modalGrid}>
            <div className={styles.modalLeft}>
              <Image src={clienteChamado.foto || '/images/placeholder.png'} width={80} height={80} alt="foto cliente" className={styles.modalImage}/>
              <h3>{clienteChamado.nome} {clienteChamado.sobrenome}</h3>
              <p className={styles.modalInfo}>{clienteChamado.endereco}</p>
            </div>
            <div className={styles.modalRight}>
              <h2 className={styles.modalTitle}>{selectedChamado.titulo}</h2>
              <p className={styles.modalDescription}>{selectedChamado.descricao}</p>
              
              <div className={styles.actionButtonsContainer}>
                {clienteChamado.telefone && (
                  <a
                    href={`https://wa.me/55${clienteChamado.telefone.replace(/\D/g, '')}?text=${encodeURIComponent(
                      `Olá, ${clienteChamado.nome}! Sou o técnico do seu chamado no Servify e estou entrando em contato.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${styles.actionButton} ${styles.whatsappButton}`}
                  >
                    Entrar em contato pelo WhatsApp
                  </a>
                )}
                <button onClick={marcarComoConcluido} className={`${styles.actionButton} ${styles.concluirButton}`}>
                  Marcar como Concluído
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}