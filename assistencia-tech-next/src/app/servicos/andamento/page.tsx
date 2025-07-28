'use client';

import React, { useEffect, useState } from 'react';
import styles from '../servicos.module.css'; 
import {
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import Modal from '@/components/Modal';
import Image from 'next/image';
import { Solicitacao, UserData } from '@/types';
import { IoLogoWhatsapp } from 'react-icons/io5'; // Ícone para o botão

export default function EmAndamentoClientePage() {
  const { user } = useAuth();
  const [servicos, setServicos] = useState<Solicitacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [profissional, setProfissional] = useState<UserData | null>(null);
  const [selectedServico, setSelectedServico] = useState<Solicitacao | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    };

    const fetchServicos = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, 'solicitacoes'),
          where('cliente_id', '==', user.uid),
          where('status', 'in', ['em_andamento', 'aceito_tecnico'])
        );

        const snapshot = await getDocs(q);

        const servicosDataPromises = snapshot.docs.map(async (docSnap) => {
          const data = docSnap.data();
          let nomeProfissional = 'Não encontrado';
          if (data.tecnico_id) {
              const profSnap = await getDoc(doc(db, 'usuarios', data.tecnico_id));
              if (profSnap.exists()) nomeProfissional = profSnap.data().nome;
          }
          return {
            id: docSnap.id,
            ...data,
            nomeProfissional,
            data_criacao: (data.data_criacao as Timestamp).toDate(),
          } as Solicitacao;
        });

        const servicosData = await Promise.all(servicosDataPromises);
        setServicos(servicosData);
      } catch (error) {
        console.error("Erro ao buscar serviços em andamento:", error);
      } finally {
        setLoading(false);
      }
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
        <p>Acompanhe os serviços que foram aceitos por um profissional.</p>

        <div className={styles.gridSolicitacoes}>
          {servicos.length > 0 ? (
            servicos.map((s) => (
              <div key={s.id} className={styles.cardSolicitacao} onClick={() => openModal(s)}>
                <p><strong>{s.titulo}</strong></p>
                <p><strong>Profissional:</strong> {s.nomeProfissional}</p>
                <p><strong>Status:</strong> <span className={styles.status}>{s.status}</span></p>
                <p className={styles.data}>Iniciado em: {s.data_criacao.toLocaleDateString('pt-BR')}</p>
              </div>
            ))
          ) : (
            <p>Nenhum serviço em andamento no momento.</p>
          )}
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        {selectedServico && profissional && (
          <div className={styles.modalGrid}>
            <div className={styles.modalLeft}>
              <h3>Profissional</h3>
              <div className={styles.professionalInfo}>
                <Image src={profissional.foto || '/images/placeholder.png'} width={80} height={80} alt="foto profissional" className={styles.modalImage} />
                <h4>{profissional.nome} {profissional.sobrenome}</h4>
                <p className={styles.profissao}>{profissional.profissao}</p>
                <p className={styles.email}>{profissional.email}</p>
              </div>
            </div>
            <div className={styles.modalRight}>
              <h2 className={styles.modalTitle}>{selectedServico.titulo}</h2>
              <p className={styles.modalDescription}><strong>Descrição:</strong> {selectedServico.descricao}</p>
              <div className={styles.botoes}>
                {profissional.telefone && (
                  <a
                    href={`https://wa.me/${profissional.telefone.replace(/\D/g, '')}?text=${encodeURIComponent(
                      `Olá ${profissional.nome}, sou cliente do seu chamado "${selectedServico.titulo}" no Servify.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.whatsappButton}
                  >
                    <IoLogoWhatsapp />
                    Entrar em contato
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}