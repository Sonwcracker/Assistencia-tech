'use client';

import React, { useEffect, useState } from 'react';
import styles from '../servicos.module.css';
import { collection, getDocs, doc, getDoc, query, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import Modal from '@/components/Modal';
import Image from 'next/image';
import { Solicitacao, UserData } from '@/types';

export default function EmAndamentoClientePage() {
  const { user } = useAuth();
  const [servicos, setServicos] = useState<Solicitacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [profissional, setProfissional] = useState<UserData | null>(null);
  const [selectedServico, setSelectedServico] = useState<Solicitacao | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchServicos = async () => {
      const q = query(
        collection(db, 'solicitacoes'),
        where('cliente_id', '==', user.uid),
        where('status', '==', 'em_andamento')
      );

      const snapshot = await getDocs(q);

      const servicosDataPromises = snapshot.docs.map(async (docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          data_criacao: (data.data_criacao as Timestamp).toDate(),
        } as Solicitacao;
      });

      const servicosData = await Promise.all(servicosDataPromises);
      setServicos(servicosData);
      setLoading(false);
    };

    fetchServicos();
  }, [user]);

  const openModal = async (servico: Solicitacao) => {
    setSelectedServico(servico);
    if (servico.tecnico_id) {
      const profissionalSnap = await getDoc(doc(db, 'usuarios', servico.tecnico_id));
      if (profissionalSnap.exists()) {
        setProfissional(profissionalSnap.data() as UserData);
      }
    }
    setModalOpen(true);
  };

  if (loading) return <p>Carregando serviços em andamento...</p>;

  return (
    <>
      <div className={styles.container}>
        <h1>Serviços em Andamento</h1>
        <p>Acompanhe os serviços que estão em andamento.</p>

        <div className={styles.gridChamados}>
          {servicos.length > 0 ? (
            servicos.map((s) => (
              <div key={s.id} className={styles.card} onClick={() => openModal(s)}>
                <h3>{s.profissao_solicitada}</h3>
                <p>{s.descricao.substring(0, 80)}...</p>
                <span>Iniciado em: {s.data_criacao.toLocaleDateString('pt-BR')}</span>
              </div>
            ))
          ) : (
            <p>Nenhum serviço em andamento no momento.</p>
          )}
        </div>
      </div>

      {/* MODAL COM DETALHES */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        {selectedServico && profissional && (
          <div className={styles.modalGrid}>
            <div className={styles.modalLeft}>
              <Image
                src={profissional.foto || '/images/placeholder.jpg'}
                width={80}
                height={80}
                alt="foto profissional"
                className={styles.modalImage}
              />
              <h3>{profissional.nome} {profissional.sobrenome}</h3>
              <p className={styles.modalInfo}>{profissional.endereco}</p>
              <p className={styles.modalInfo}>Telefone: {profissional.telefone}</p>
            </div>
            <div className={styles.modalRight}>
              <h2>{selectedServico.profissao_solicitada}</h2>
              <p className={styles.modalDescription}>{selectedServico.descricao}</p>
              <span className={styles.modalDate}>
                Iniciado em: {selectedServico.data_criacao.toLocaleDateString('pt-BR')}
              </span>

              {/* BOTÃO WHATSAPP */}
              {profissional.telefone && (
                <a
                  href={`https://wa.me/55${profissional.telefone.replace(/\D/g, '')}?text=${encodeURIComponent(
                    'Olá, estou acompanhando o andamento do serviço que solicitei no Servify e gostaria de conversar com você.'
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.whatsappButton}
                >
                  Entrar em contato pelo WhatsApp
                </a>
              )}

              {/* BOTÃO AVALIAR (placeholder para você implementar) */}
              <button className={styles.concluirButton}>
                Avaliar Profissional
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
