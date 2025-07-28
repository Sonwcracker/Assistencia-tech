'use client';
import React, { useEffect, useState } from 'react';
import styles from './Historico.module.css';
import { collection, getDocs, doc, getDoc, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { Solicitacao } from '@/types';

// O tipo agora inclui 'finalizado' como uma opção separada
type StatusFiltro = 'todos' | 'aceito_tecnico' | 'recusado_tecnico' | 'finalizado' | 'cancelado';

export default function HistoricoPage() {
  const { user } = useAuth();
  const [todosChamados, setTodosChamados] = useState<Solicitacao[]>([]);
  const [chamadosFiltrados, setChamadosFiltrados] = useState<Solicitacao[]>([]);
  const [filtroAtivo, setFiltroAtivo] = useState<StatusFiltro>('todos');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchChamados = async () => {
      setLoading(true);
      const q = query(
        collection(db, 'solicitacoes'),
        where('tecnico_id', '==', user.uid),
        where('status', 'in', ['aceito_tecnico', 'recusado_tecnico', 'finalizado', 'cancelado']),
        orderBy('data_criacao', 'desc')
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
      setTodosChamados(chamadosData);
      setChamadosFiltrados(chamadosData);
      setLoading(false);
    };

    fetchChamados();
  }, [user]);

  // CORREÇÃO PRINCIPAL ESTÁ AQUI
  useEffect(() => {
    if (filtroAtivo === 'todos') {
      setChamadosFiltrados(todosChamados);
    } else {
      // Filtra pelo status exato selecionado na aba
      const filtrados = todosChamados.filter(c => c.status === filtroAtivo);
      setChamadosFiltrados(filtrados);
    }
  }, [filtroAtivo, todosChamados]);

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'aceito_tecnico':
      case 'finalizado':
        return styles.statusAceito;
      case 'recusado_tecnico':
        return styles.statusRecusado;
      case 'cancelado':
        return styles.statusCancelado;
      default:
        return '';
    }
  };

  const formatarStatus = (status: string) => {
    if (status === 'aceito_tecnico') return 'Aceito';
    if (status === 'recusado_tecnico') return 'Recusado';
    return status.charAt(0).toUpperCase() + status.slice(1); // Deixa a primeira letra maiúscula
  };

  if (loading) return <p>Carregando histórico...</p>;

  return (
    <div className={styles.container}>
      <h1>Histórico de Chamados</h1>
      <p>Veja todos os seus chamados anteriores.</p>

      <div className={styles.filterTabs}>
        <button onClick={() => setFiltroAtivo('todos')} className={filtroAtivo === 'todos' ? styles.activeTab : ''}>Todos</button>
        <button onClick={() => setFiltroAtivo('finalizado')} className={filtroAtivo === 'finalizado' ? styles.activeTab : ''}>Finalizados</button>
        <button onClick={() => setFiltroAtivo('aceito_tecnico')} className={filtroAtivo === 'aceito_tecnico' ? styles.activeTab : ''}>Aceitos</button>
        <button onClick={() => setFiltroAtivo('recusado_tecnico')} className={filtroAtivo === 'recusado_tecnico' ? styles.activeTab : ''}>Recusados</button>
        <button onClick={() => setFiltroAtivo('cancelado')} className={filtroAtivo === 'cancelado' ? styles.activeTab : ''}>Cancelados</button>
      </div>

      <div className={styles.historyList}>
        {chamadosFiltrados.length > 0 ? (
          chamadosFiltrados.map(c => (
            <div key={c.id} className={styles.historyItem}>
              <div className={styles.itemInfo}>
                <span className={styles.itemDate}>{c.data_criacao.toLocaleDateString('pt-BR')}</span>
                <h3 className={styles.itemClient}>Cliente: {c.nomeCliente}</h3>
                <p className={styles.itemDescription}>{c.descricao}</p>
              </div>
              <div className={`${styles.itemStatus} ${getStatusClass(c.status)}`}>
                {formatarStatus(c.status)}
              </div>
            </div>
          ))
        ) : (
          <p className={styles.emptyMessage}>Nenhum chamado encontrado para este filtro.</p>
        )}
      </div>
    </div>
  );
}