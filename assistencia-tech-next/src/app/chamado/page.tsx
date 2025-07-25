'use client';

import React, { useEffect, useState } from 'react';
import styles from './chamado.module.css';
import { collection, getDocs, doc, getDoc, query, where, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface Chamado {
  id: string;
  nomeCliente: string;
  descricao: string;
  data_criacao: Date;
  status: string;
}

export default function ChamadosTecnico() {
  const { user } = useAuth();
  const router = useRouter();

  const [chamadosAbertos, setChamadosAbertos] = useState<Chamado[]>([]);
  const [chamadosFinalizados, setChamadosFinalizados] = useState<Chamado[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const verificarTipo = async () => {
      const userRef = doc(db, 'usuarios', user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const tipo = userSnap.data().tipo;
        if (tipo !== 'tecnico') {
          alert('Acesso permitido apenas para técnicos.');
          router.push('/');
        }
      }
    };

    verificarTipo();
  }, [user, router]);

  useEffect(() => {
    if (!user) return;

    const fetchChamados = async () => {
      const q = query(collection(db, 'solicitacoes'), where('tecnico_id', '==', user.uid));
      const snapshot = await getDocs(q);

      const abertos: Chamado[] = [];
      const finalizados: Chamado[] = [];

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        const clienteRef = doc(db, 'usuarios', data.cliente_id);
        const clienteSnap = await getDoc(clienteRef);
        const nomeCliente = clienteSnap.exists() ? clienteSnap.data().nome : 'Cliente';

        const chamado: Chamado = {
          id: docSnap.id,
          nomeCliente,
          descricao: data.descricao || '',
          data_criacao: data.data_criacao.toDate(),
          status: data.status
        };

        if (data.status === 'aberto') {
          abertos.push(chamado);
        } else if (data.status === 'aceito_tecnico' || data.status === 'recusado_tecnico') {
          finalizados.push(chamado);
        }
      }

      setChamadosAbertos(abertos);
      setChamadosFinalizados(finalizados);
      setLoading(false);
    };

    fetchChamados();
  }, [user]);

  const responderChamado = async (id: string, resposta: 'aceito' | 'recusado') => {
    try {
      const ref = doc(db, 'solicitacoes', id);
      await updateDoc(ref, {
        status: resposta === 'aceito' ? 'aceito_tecnico' : 'recusado_tecnico',
        resposta_tecnico: resposta
      });

      alert(`Chamado ${resposta === 'aceito' ? 'aceito' : 'recusado'} com sucesso!`);
      setChamadosAbertos((prev) => prev.filter((c) => c.id !== id));
    } catch (error) {
      console.error('Erro ao atualizar chamado:', error);
    }
  };

  if (loading) return <p>Carregando chamados...</p>;

  return (
    <div className={styles.container}>
      <h1 className={styles.titulo}>Meus Chamados</h1>

      <div className={styles.gridChamados}>
        {/* Chamados em Aberto */}
        <div>
          <h2 className={styles.subtitulo}>Chamados em Aberto</h2>
          {chamadosAbertos.length === 0 ? (
            <p className={styles.vazio}>Nenhum chamado em aberto no momento.</p>
          ) : (
            chamadosAbertos.map((c) => (
              <div key={c.id} className={styles.card}>
                <p><strong>Cliente:</strong> {c.nomeCliente}</p>
                <p><strong>Descrição:</strong> {c.descricao}</p>
                <p><strong>Data:</strong> {c.data_criacao.toLocaleDateString('pt-BR')}</p>
                <div className={styles.botoes}>
                  <button className={styles.aceitar} onClick={() => responderChamado(c.id, 'aceito')}>
                    Aceitar Contrato
                  </button>
                  <button className={styles.recusar} onClick={() => responderChamado(c.id, 'recusado')}>
                    Não me interessa
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Chamados Finalizados */}
        <div>
          <h2 className={styles.subtitulo}>Chamados Finalizados</h2>
          {chamadosFinalizados.length === 0 ? (
            <p className={styles.vazio}>Nenhum chamado finalizado ainda.</p>
          ) : (
            chamadosFinalizados.map((c) => (
              <div key={c.id} className={styles.card}>
                <p><strong>Cliente:</strong> {c.nomeCliente}</p>
                <p><strong>Descrição:</strong> {c.descricao}</p>
                <p><strong>Data:</strong> {c.data_criacao.toLocaleDateString('pt-BR')}</p>
                <p><strong>Status:</strong>{' '}
                  <span className={c.status === 'aceito_tecnico' ? styles.respostaAceita : styles.respostaRecusada}>
                    {c.status === 'aceito_tecnico' ? 'Aceito' : 'Recusado'}
                  </span>
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
