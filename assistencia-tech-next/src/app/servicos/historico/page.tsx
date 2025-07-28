'use client';
import React, { useEffect, useState } from 'react';
import styles from './Historico.module.css'; // Usará um novo CSS dedicado
import { collection, getDocs, doc, getDoc, query, where, Timestamp, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { Solicitacao } from '@/types';

type StatusFiltro = 'todos' | 'finalizado' | 'cancelado' | 'recusado_tecnico';

export default function HistoricoClientePage() {
  const { user } = useAuth();
  const [todasSolicitacoes, setTodasSolicitacoes] = useState<Solicitacao[]>([]);
  const [solicitacoesFiltradas, setSolicitacoesFiltradas] = useState<Solicitacao[]>([]);
  const [filtroAtivo, setFiltroAtivo] = useState<StatusFiltro>('todos');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchHistorico = async () => {
        setLoading(true);
        try {
            const q = query(
              collection(db, 'solicitacoes'), 
              where('cliente_id', '==', user.uid),
              where('status', 'in', ['finalizado', 'cancelado', 'recusado_tecnico']),
              orderBy('data_criacao', 'desc')
            );
            const snapshot = await getDocs(q);
            
            const historicoPromises = snapshot.docs.map(async (docSnap) => {
              const data = docSnap.data();
              let nomeProfissional = 'Não atribuído';

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
            
            const historico = await Promise.all(historicoPromises);
            setTodasSolicitacoes(historico);
            setSolicitacoesFiltradas(historico); // Mostra todos inicialmente

        } catch (error) {
            console.error('Erro ao buscar histórico:', error);
        } finally {
            setLoading(false);
        }
    };
    fetchHistorico();
  }, [user]);

  // Efeito para filtrar a lista quando a aba ativa muda
  useEffect(() => {
    if (filtroAtivo === 'todos') {
      setSolicitacoesFiltradas(todasSolicitacoes);
    } else {
      const filtrados = todasSolicitacoes.filter(s => s.status === filtroAtivo);
      setSolicitacoesFiltradas(filtrados);
    }
  }, [filtroAtivo, todasSolicitacoes]);

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'finalizado':
        return styles.statusFinalizado;
      case 'recusado_tecnico':
        return styles.statusRecusado;
      case 'cancelado':
        return styles.statusCancelado;
      default:
        return '';
    }
  };
  
  const formatarStatus = (status: string) => {
    if (status === 'recusado_tecnico') return 'Recusado pelo técnico';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (loading) return <p>Carregando histórico...</p>;

  return (
    <div className={styles.container}>
      <h1>Histórico de Solicitações</h1>
      <p>Aqui você pode ver todos os seus serviços que já foram concluídos, cancelados ou recusados.</p>
      
      <div className={styles.filterTabs}>
        <button onClick={() => setFiltroAtivo('todos')} className={filtroAtivo === 'todos' ? styles.activeTab : ''}>Todos</button>
        <button onClick={() => setFiltroAtivo('finalizado')} className={filtroAtivo === 'finalizado' ? styles.activeTab : ''}>Finalizados</button>
        <button onClick={() => setFiltroAtivo('cancelado')} className={filtroAtivo === 'cancelado' ? styles.activeTab : ''}>Cancelados</button>
        <button onClick={() => setFiltroAtivo('recusado_tecnico')} className={filtroAtivo === 'recusado_tecnico' ? styles.activeTab : ''}>Recusados</button>
      </div>

      <div className={styles.historyList}>
        {solicitacoesFiltradas.length > 0 ? (
          solicitacoesFiltradas.map(s => (
            <div key={s.id} className={styles.historyItem}>
              <div className={styles.itemInfo}>
                <span className={styles.itemDate}>{s.data_criacao.toLocaleDateString('pt-BR')}</span>
                <h3 className={styles.itemClient}>Profissão: {s.profissao_solicitada}</h3>
                <p className={styles.itemDescription}>Profissional: {s.nomeProfissional}</p>
              </div>
              <div className={`${styles.itemStatus} ${getStatusClass(s.status)}`}>
                {formatarStatus(s.status)}
              </div>
            </div>
          ))
        ) : (
          <p className={styles.emptyMessage}>Nenhum item encontrado para este filtro.</p>
        )}
      </div>
    </div>
  );
}