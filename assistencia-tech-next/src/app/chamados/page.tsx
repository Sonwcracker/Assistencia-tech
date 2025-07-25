'use client';

import React, { useEffect, useState } from 'react';
import styles from './chamado.module.css'; // Crie um arquivo CSS com este nome
import { collection, getDocs, doc, getDoc, query, where, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import Modal from '@/components/Modal'; // Componente de modal genérico
import Image from 'next/image';
import { Solicitacao, UserData } from '@/types'; // Suas definições de tipos

export default function NovosChamadosPage() {
  const { user, userData } = useAuth();
  const [chamadosDisponiveis, setChamadosDisponiveis] = useState<Solicitacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChamado, setSelectedChamado] = useState<Solicitacao | null>(null);
  const [clienteChamado, setClienteChamado] = useState<UserData | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    // 1. BUSCA AUTOMÁTICA DE CHAMADOS QUANDO O TÉCNICO LOGA
    if (userData?.tipo === 'tecnico' && userData.profissao) {
      const fetchChamados = async () => {
        setLoading(true);
        try {
          // A consulta busca apenas chamados para a profissão do técnico e com status "aberto"
          const q = query(
            collection(db, 'solicitacoes'),
            where('profissao_solicitada', '==', userData.profissao),
            where('status', '==', 'aberto')
          );
          
          const snapshot = await getDocs(q);

          // Mapeia os resultados para um formato amigável, buscando o nome do cliente
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

  // 3. FUNÇÃO PARA ABRIR O MODAL COM DETALHES
  const openDetailModal = async (chamado: Solicitacao) => {
    setSelectedChamado(chamado);
    setLoading(true);
    // Busca os dados completos do cliente para exibir no modal
    const clienteRef = doc(db, 'usuarios', chamado.cliente_id);
    const clienteSnap = await getDoc(clienteRef);
    if (clienteSnap.exists()) {
      setClienteChamado(clienteSnap.data() as UserData);
    }
    setLoading(false);
    setIsDetailModalOpen(true);
  };

  // 4. FUNÇÃO PARA ACEITAR OU RECUSAR O CHAMADO
  const handleResponse = async (resposta: 'aceito_tecnico' | 'recusado_tecnico') => {
    if (!selectedChamado || !user) return;
    try {
      const ref = doc(db, 'solicitacoes', selectedChamado.id);
      // Atualiza o status do chamado no banco de dados e atribui o ID do técnico
      await updateDoc(ref, {
        status: resposta,
        tecnico_id: user.uid,
      });
      // Remove o chamado da lista na tela, pois ele não está mais "em aberto"
      setChamadosDisponiveis(prev => prev.filter(c => c.id !== selectedChamado.id));
      setIsDetailModalOpen(false);
      alert(`Chamado ${resposta === 'aceito_tecnico' ? 'aceito' : 'recusado'} com sucesso!`);
    } catch (error) {
      console.error("Erro ao responder chamado:", error);
    }
  };

  if (loading && chamadosDisponiveis.length === 0) return <p>Carregando...</p>;

  return (
    <>
      <div className={styles.container}>
        <h1>Novos Chamados</h1>
        <p>Estes são os chamados disponíveis na sua área de atuação.</p>
        
        {/* 2. ÁREA ONDE OS CARDS DOS CHAMADOS SÃO EXIBIDOS */}
        <div className={styles.gridChamados}>
          {chamadosDisponiveis.length > 0 ? (
            chamadosDisponiveis.map(c => (
              // Cada card é clicável para abrir o modal de detalhes
              <div key={c.id} className={styles.card} onClick={() => openDetailModal(c)}>
                <h3>{c.nomeCliente}</h3>
                <p>{c.descricao.substring(0, 100)}...</p>
                <span>{c.data_criacao.toLocaleDateString('pt-BR')}</span>
              </div>
            ))
          ) : (
            <p>Nenhum chamado novo no momento.</p>
          )}
        </div>
      </div>

      {/* 5. MODAL DE DETALHES COM OS BOTÕES DE AÇÃO */}
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
                <button onClick={() => handleResponse('recusado_tecnico')} className={styles.recusar}>Não me interessa</button>
                <button onClick={() => handleResponse('aceito_tecnico')} className={styles.aceitar}>Aceitar Chamado</button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}