'use client';
import React, { useEffect, useState } from 'react';
import styles from '../chamado.module.css';
import { collection, getDocs, doc, getDoc, query, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { Solicitacao } from '@/types';

export default function ChamadosAndamentoPage() {
  const { user } = useAuth();
  const [chamados, setChamados] = useState<Solicitacao[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <p>Carregando chamados em andamento...</p>;

  return (
    <div className={styles.container}>
      <h1>Chamados em Andamento</h1>
      <p>Estes são os serviços que você já aceitou.</p>

      <div className={styles.gridChamados}>
        {chamados.length > 0 ? (
          chamados.map((c) => (
            <div key={c.id} className={styles.card}>
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
  );
}