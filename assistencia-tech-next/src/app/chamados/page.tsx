'use client';

import React, { useEffect, useState } from 'react';
import styles from './chamado.module.css';
import { collection, getDocs, doc, getDoc, query, where, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import Modal from '@/components/Modal'; // Componente de modal genérico
import Image from 'next/image';
import { Solicitacao, UserData } from '@/types'; // Suas definições de tipos

export default function NovosChamadosPage() {
  const { user, userData } = useAuth(); // 'user' contém o uid, 'userData' contém os dados do perfil
  const [chamadosDisponiveis, setChamadosDisponiveis] = useState<Solicitacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChamado, setSelectedChamado] = useState<Solicitacao | null>(null);
  const [clienteChamado, setClienteChamado] = useState<UserData | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    // Busca os chamados direcionados a este técnico específico
    if (user && userData?.tipo === 'tecnico') {
      const fetchChamados = async () => {
        setLoading(true);
        try {
          // LÓGICA CORRIGIDA:
          // A consulta busca chamados onde o 'tecnico_id' no documento da solicitação
          // é exatamente igual ao 'uid' do usuário técnico que está logado.
          const q = query(
            collection(db, 'solicitacoes'),
            where('tecnico_id', '==', user.uid), // <-- Consulta por ID do técnico
            where('status', '==', 'aberto')      // <-- E o status está 'aberto'
          );
          
          const snapshot = await getDocs(q);

          // O restante do processo para buscar os dados do cliente continua o mesmo
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
    } else {
      // Se não for um técnico ou não estiver logado, zera a lista e para o loading
      setLoading(false);
      setChamadosDisponiveis([]);
    }
  }, [user, userData]); // Depende de 'user' e 'userData' para re-executar

  // Função para abrir o modal com detalhes
  const openDetailModal = async (chamado: Solicitacao) => {
    setSelectedChamado(chamado);
    // Busca os dados completos do cliente para exibir no modal
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

  // Função para aceitar ou recusar o chamado
  const handleResponse = async (resposta: 'aceito_tecnico' | 'recusado_tecnico') => {
    if (!selectedChamado || !user) return;
    try {
      const ref = doc(db, 'solicitacoes', selectedChamado.id);
      // Atualiza o status do chamado no banco de dados.
      // O ID do técnico já está no chamado, mas podemos confirmar se quisermos.
      await updateDoc(ref, {
        status: resposta,
      });
      // Remove o chamado da lista na tela, pois ele não está mais "em aberto"
      setChamadosDisponiveis(prev => prev.filter(c => c.id !== selectedChamado.id));
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
              // Cada card é clicável para abrir o modal de detalhes
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