'use client';

import React, { useEffect, useState } from 'react';
import styles from './chamado.module.css';
import { collection, getDocs, doc, getDoc, query, where, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';

interface Chamado {
  id: string;
  nomeCliente: string;
  descricao: string;
  data_criacao: Date;
  status: string;
}

export default function ChamadosTecnico() {
  const { user } = useAuth();
  const [chamados, setChamados] = useState<Chamado[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchChamados = async () => {
      const q = query(collection(db, 'solicitacoes'), where('tecnico_id', '==', user.uid), where('status', '==', 'aberto'));
      const snapshot = await getDocs(q);
      const lista: Chamado[] = [];

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        const clienteRef = doc(db, 'usuarios', data.cliente_id);
        const clienteSnap = await getDoc(clienteRef);
        const nomeCliente = clienteSnap.exists() ? clienteSnap.data().nome : 'Cliente';

        lista.push({
          id: docSnap.id,
          nomeCliente,
          descricao: data.descricao || '',
          data_criacao: data.data_criacao.toDate(),
          status: data.status
        });
      }

      setChamados(lista);
      setLoading(false);
    };

    fetchChamados();
  }, [user]);

  const responderChamado = async (id: string, resposta: 'aceito' | 'recusado') => {
    try {
      const ref = doc(db, 'solicitacoes', id);
      await updateDoc(ref, {
        status: resposta === 'aceito' ? 'aceito_tecnico' : 'recusado_tecnico'
      });

      alert(`Chamado ${resposta === 'aceito' ? 'aceito' : 'recusado'} com sucesso!`);
      setChamados((prev) => prev.filter((c) => c.id !== id));
    } catch (error) {
      console.error('Erro ao atualizar chamado:', error);
    }
  };

  if (loading) return <p>Carregando chamados...</p>;

  return (
    <div className={styles.container}>
      <h1 className={styles.titulo}>Chamados Recebidos</h1>
      {chamados.map((c) => (
        <div key={c.id} className={styles.card}>
          <p><strong>Cliente:</strong> {c.nomeCliente}</p>
          <p><strong>Descrição:</strong> {c.descricao}</p>
          <p><strong>Data:</strong> {c.data_criacao.toLocaleDateString('pt-BR')}</p>
          <div className={styles.botoes}>
            <button className={styles.aceitar} onClick={() => responderChamado(c.id, 'aceito')}>Aceitar Contrato</button>
            <button className={styles.recusar} onClick={() => responderChamado(c.id, 'recusado')}>Não me interessa</button>
          </div>
        </div>
      ))}
    </div>
  );
}
