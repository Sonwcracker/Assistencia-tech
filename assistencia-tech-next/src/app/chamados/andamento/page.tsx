'use client';

import React, { useEffect, useState } from 'react';
import styles from '../chamado.module.css';
import { collection, getDocs, doc, getDoc, query, where, Timestamp, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import Modal from '@/components/Modal';
import Image from 'next/image';
import { Solicitacao, UserData } from '@/types';

export default function ChamadosAndamentoPage() {
  const { user } = useAuth();
  const [chamados, setChamados] = useState<Solicitacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChamado, setSelectedChamado] = useState<Solicitacao | null>(null);
  const [cliente, setCliente] = useState<UserData | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchChamados = async () => {
      const q = query(
        collection(db, 'solicitacoes'),
        where('tecnico_id', '==', user.uid),
        where('status', '==', 'em_andamento')
      );
      const snapshot = await getDocs(q);

      const chamadosDataPromises = snapshot.docs.map(async (docSnap) => {
        const data = docSnap.data();
        const clienteRef = doc(db, 'usuarios', data.cliente_id);
        const clienteSnap = await getDoc(clienteRef);
        const nomeCliente = clienteSnap.exists() ? clienteSnap.data().nome : 'Cliente';

        return {
          id: docSnap.id,
          nomeCliente,
          ...data,
          data_criacao: (data.data_criacao as Timestamp).toDate(),
        } as Solicitacao;
      });

      const chamadosData = await Promise.all(chamadosDataPromises);
      setChamados(chamadosData);
      setLoading(false);
    };

    fetchChamados();
  }, [user]);

  const openModal = async (chamado: Solicitacao) => {
    setSelectedChamado(chamado);
    const clienteRef = doc(db, 'usuarios', chamado.cliente_id);
    const clienteSnap = await getDoc(clienteRef);
    if (clienteSnap.exists()) {
      setCliente(clienteSnap.data() as UserData);
    }
    setModalOpen(true);
  };

  const marcarComoConcluido = async () => {
    if (!selectedChamado) return;
    try {
      const ref = doc(db, 'solicitacoes', selectedChamado.id);
      await updateDoc(ref, {
        status: 'finalizado',
      });

      setChamados(prev => prev.filter(c => c.id !== selectedChamado.id));
      setModalOpen(false);
      alert('Chamado marcado como concluído!');
    } catch (error) {
      console.error('Erro ao marcar como concluído:', error);
    }
  };

  if (loading) return <p>Carregando chamados em andamento...</p>;

  return (
    <>
      <div className={styles.container}>
        <h1>Chamados em Andamento</h1>
        <p>Estes são os serviços que você já aceitou.</p>

        <div className={styles.gridChamados}>
          {chamados.length > 0 ? (
            chamados.map((c) => (
              <div key={c.id} className={styles.card} onClick={() => openModal(c)}>
                <h3>{c.nomeCliente}</h3>
                <p>{c.descricao.substring(0, 100)}...</p>
                <span>Aceito em: {c.data_criacao.toLocaleDateString('pt-BR')}</span>
              </div>
            ))
          ) : (
            <p>Nenhum chamado em andamento no momento.</p>
          )}
        </div>
      </div>

      {/* MODAL COM DETALHES E BOTÕES */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        {selectedChamado && cliente && (
          <div className={styles.modalGrid}>
            <div className={styles.modalLeft}>
              <Image
                src={cliente.foto || '/images/placeholder.jpg'}
                width={80}
                height={80}
                alt="foto cliente"
                className={styles.modalImage}
              />
              <h3>{cliente.nome} {cliente.sobrenome}</h3>
              <p className={styles.modalInfo}>{cliente.endereco}</p>
              <p className={styles.modalInfo}>Telefone: {cliente.telefone}</p>
            </div>
            <div className={styles.modalRight}>
              <h2>{selectedChamado.profissao_solicitada}</h2>
              <p className={styles.modalDescription}>{selectedChamado.descricao}</p>
              <span className={styles.modalDate}>
                Aceito em: {selectedChamado.data_criacao.toLocaleDateString('pt-BR')}
              </span>

              {/* BOTÃO WHATSAPP */}
              {cliente.telefone && (
                <a
                  href={`https://wa.me/55${cliente.telefone.replace(/\D/g, '')}?text=${encodeURIComponent(
                    'Olá, vi seu pedido no Servify e estou entrando em contato para combinarmos os detalhes.'
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.whatsappButton}
                >
                  Entrar em contato pelo WhatsApp
                </a>
              )}

              {/* BOTÃO CONCLUIR */}
              <button onClick={marcarComoConcluido} className={styles.concluirButton}>
                Marcar como Concluído
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
