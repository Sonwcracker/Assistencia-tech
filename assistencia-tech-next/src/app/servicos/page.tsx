'use client'

import React, { useEffect, useState } from 'react';
import styles from './servicos.module.css';
import { collection, getDocs, doc, getDoc, query, where, Timestamp, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';

interface Solicitacao {
  id: string;
  data_criacao: Timestamp;
  profissao_solicitada: string;
  nome: string;
  status: string;
}

export default function MinhasSolicitacoesPage() {
  const { user } = useAuth();
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchSolicitacoes = async () => {
      try {
        const q = query(collection(db, 'solicitacoes'), where('cliente_id', '==', user.uid));
        const snapshot = await getDocs(q);

        const lista: Solicitacao[] = [];

        for (const docSnap of snapshot.docs) {
          const data = docSnap.data();
          let nomeProfissional = 'Aguardando atribuição';
          let profissao = data.profissao_solicitada;

          if (data.tecnico_id) {
            const usuarioRef = doc(db, 'usuarios', data.tecnico_id);
            const usuarioSnap = await getDoc(usuarioRef);
            if (usuarioSnap.exists()) {
              const usuarioData = usuarioSnap.data();
              nomeProfissional = usuarioData.nome || nomeProfissional;
              profissao = usuarioData.profissao || profissao;
            }
          }

          lista.push({
            id: docSnap.id,
            data_criacao: data.data_criacao,
            profissao_solicitada: profissao,
            nome: nomeProfissional,
            status: data.status
          });
        }

        setSolicitacoes(lista);
      } catch (error) {
        console.error('Erro ao buscar solicitações:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSolicitacoes();
  }, [user]);

  const handleCancelarServico = async (id: string) => {
    const confirmacao = confirm('Tem certeza que deseja cancelar este serviço?');
    if (!confirmacao) return;

    try {
      await deleteDoc(doc(db, 'solicitacoes', id));
      setSolicitacoes(prev => prev.filter(s => s.id !== id));
    } catch (error) {
      console.error('Erro ao cancelar serviço:', error);
      alert('Erro ao cancelar. Tente novamente.');
    }
  };

  if (loading) return <p>Carregando...</p>;

  return (
    <div className={styles.container}>
      <h1 className={styles.tituloPagina}>Minhas Solicitações</h1>
      <div className={styles.listaSolicitacoes}>
        {solicitacoes.map((s) => (
          <div key={s.id} className={styles.cardSolicitacao}>
            <p><strong>Data:</strong> {s.data_criacao.toDate().toLocaleDateString('pt-BR')}</p>
            <p><strong>Profissão:</strong> {s.profissao_solicitada}</p>
            <p><strong>Profissional:</strong> {s.nome}</p>
            <p>
              <strong>Status:</strong>{' '}
              <span className={s.status === 'aberto' ? styles.statusAberto : styles.statusFinalizado}>
                {s.status}
              </span>
            </p>
            {s.status === 'aberto' && (
              <button
                className={styles.btnCancelar}
                onClick={() => handleCancelarServico(s.id)}
              >
                Cancelar serviço
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
