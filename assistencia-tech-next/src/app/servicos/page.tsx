'use client'

import React, { useEffect, useState } from 'react';
import styles from './servicos.module.css';
import {
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  where,
  Timestamp,
  deleteDoc,
  addDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface Solicitacao {
  id: string;
  data_criacao: Timestamp;
  profissao_solicitada: string;
  nome: string;
  status: string;
  resposta_tecnico?: string;
  tecnico_id?: string;
}

export default function MinhasSolicitacoesPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [solicitacoesAbertas, setSolicitacoesAbertas] = useState<Solicitacao[]>([]);
  const [solicitacoesFinalizadas, setSolicitacoesFinalizadas] = useState<Solicitacao[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const verificarTipoUsuario = async () => {
      const usuarioRef = doc(db, 'usuarios', user.uid);
      const usuarioSnap = await getDoc(usuarioRef);

      if (usuarioSnap.exists()) {
        const dados = usuarioSnap.data();
        if (dados.tipo !== 'cliente') {
          alert('Acesso restrito à área de clientes.');
          router.push('/');
        }
      }
    };

    verificarTipoUsuario();
  }, [user, router]);

  useEffect(() => {
    if (!user) return;

    const fetchSolicitacoes = async () => {
      try {
        const q = query(collection(db, 'solicitacoes'), where('cliente_id', '==', user.uid));
        const snapshot = await getDocs(q);

        const abertas: Solicitacao[] = [];
        const finalizadas: Solicitacao[] = [];

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

          const solicitacao: Solicitacao = {
            id: docSnap.id,
            data_criacao: data.data_criacao,
            profissao_solicitada: profissao,
            nome: nomeProfissional,
            status: data.status,
            resposta_tecnico: data.resposta_tecnico,
            tecnico_id: data.tecnico_id
          };

          if (data.status === 'aberto') {
            abertas.push(solicitacao);
          } else {
            finalizadas.push(solicitacao);
          }
        }

        setSolicitacoesAbertas(abertas);
        setSolicitacoesFinalizadas(finalizadas);
      } catch (error) {
        console.error('Erro ao buscar solicitações:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSolicitacoes();
  }, [user]);

  const handleCancelarServico = async (id: string, tecnicoId?: string) => {
    const confirmacao = confirm('Tem certeza que deseja cancelar este serviço?');
    if (!confirmacao) return;

    try {
      // Envia notificação ao técnico (caso atribuído)
      if (tecnicoId) {
        await addDoc(collection(db, 'usuarios', tecnicoId, 'notificacoes'), {
          mensagem: 'O cliente cancelou a solicitação antes do aceite.',
          data: new Date(),
          lido: false,
          tipo: 'cancelamento'
        });
      }

      // Remove solicitação
      await deleteDoc(doc(db, 'solicitacoes', id));
      setSolicitacoesAbertas(prev => prev.filter(s => s.id !== id));
    } catch (error) {
      console.error('Erro ao cancelar serviço:', error);
      alert('Erro ao cancelar. Tente novamente.');
    }
  };

  if (loading) return <p>Carregando...</p>;

  return (
    <div className={styles.container}>
      <h1 className={styles.tituloPagina}>Minhas Solicitações</h1>

      <div className={styles.gridDoisBlocos}>
        <div>
          <h2 className={styles.subtitulo}>Pedidos em Aberto</h2>
          {solicitacoesAbertas.length === 0 ? (
            <p className={styles.mensagemVazia}>Você não possui serviços em aberto no momento.</p>
          ) : (
            <div className={styles.gridSolicitacoes}>
              {solicitacoesAbertas.map((s) => (
                <div key={s.id} className={styles.cardSolicitacao}>
                  <p><strong>Data:</strong> {s.data_criacao.toDate().toLocaleDateString('pt-BR')}</p>
                  <p><strong>Profissão:</strong> {s.profissao_solicitada}</p>
                  <p><strong>Profissional:</strong> {s.nome}</p>
                  <p><strong>Status:</strong> <span className={styles.statusAberto}>{s.status}</span></p>
                  {s.resposta_tecnico && (
                    <p><strong>Resposta do Profissional:</strong>{' '}
                      <span className={s.resposta_tecnico === 'aceito' ? styles.respostaAceita : styles.respostaRecusada}>
                        {s.resposta_tecnico === 'aceito' ? 'Profissional aceitou o serviço!' : 'Profissional recusou o serviço.'}
                      </span>
                    </p>
                  )}
                  <button className={styles.btnCancelar} onClick={() => handleCancelarServico(s.id, s.tecnico_id)}>
                    Cancelar serviço
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className={styles.subtitulo}>Pedidos Finalizados</h2>
          {solicitacoesFinalizadas.length === 0 ? (
            <p className={styles.mensagemVazia}>Nenhum pedido finalizado ainda.</p>
          ) : (
            <div className={styles.gridSolicitacoes}>
              {solicitacoesFinalizadas.map((s) => (
                <div key={s.id} className={styles.cardSolicitacao}>
                  <p><strong>Data:</strong> {s.data_criacao.toDate().toLocaleDateString('pt-BR')}</p>
                  <p><strong>Profissão:</strong> {s.profissao_solicitada}</p>
                  <p><strong>Profissional:</strong> {s.nome}</p>
                  <p><strong>Status:</strong> <span className={styles.statusFinalizado}>{s.status}</span></p>
                  {s.resposta_tecnico && (
                    <p><strong>Resposta do Profissional:</strong>{' '}
                      <span className={s.resposta_tecnico === 'aceito' ? styles.respostaAceita : styles.respostaRecusada}>
                        {s.resposta_tecnico === 'aceito' ? 'Profissional aceitou o serviço!' : 'Profissional recusou o serviço.'}
                      </span>
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
