'use client';
import React, { useEffect, useState } from 'react';
import styles from '../servicos.module.css'; // Reutilizando os estilos
import { collection, getDocs, doc, getDoc, query, where, Timestamp, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { Solicitacao } from '@/types';

export default function HistoricoClientePage() {
  const { user } = useAuth();
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchHistorico = async () => {
        setLoading(true);
        try {
            const q = query(
              collection(db, 'solicitacoes'), 
              where('cliente_id', '==', user.uid),
              where('status', 'in', ['finalizado', 'cancelado']),
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
                cliente_id: data.cliente_id,
                nomeCliente: data.nomeCliente || '',
                nomeProfissional: nomeProfissional,
                profissao_solicitada: data.profissao_solicitada,
                descricao: data.descricao,
                data_criacao: (data.data_criacao as Timestamp).toDate(),
                status: data.status
              } as Solicitacao;
            });
            
            const historico = await Promise.all(historicoPromises);
            setSolicitacoes(historico);

        } catch (error) {
            console.error('Erro ao buscar histórico:', error);
        } finally {
            setLoading(false);
        }
    };
    fetchHistorico();
  }, [user]);

  if (loading) return <p>Carregando histórico...</p>;

  return (
    <div className={styles.container}>
      <h1>Histórico de Solicitações</h1>
      <p>Aqui você pode ver todos os seus serviços que já foram concluídos ou cancelados.</p>
      
      <div className={styles.section}>
        {solicitacoes.length === 0 ? (
          <p>Nenhum item no seu histórico.</p>
        ) : (
          <div className={styles.gridSolicitacoes}>
            {solicitacoes.map(s => (
              <div key={s.id} className={styles.cardSolicitacao}>
                <p><strong>Data:</strong> {s.data_criacao.toLocaleDateString('pt-BR')}</p>
                <p><strong>Profissão:</strong> {s.profissao_solicitada}</p>
                <p><strong>Profissional:</strong> {s.nomeProfissional}</p>
                <p><strong>Status:</strong> <span className={s.status === 'finalizado' ? styles.statusFinalizado : styles.statusCancelado}>{s.status}</span></p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}