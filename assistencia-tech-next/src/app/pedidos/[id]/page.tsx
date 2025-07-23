'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation'; // Hook para pegar parâmetros da URL
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

import styles from './detalhe.module.css'; // Crie este arquivo

// Definindo uma interface para o tipo de dados do pedido
interface Pedido {
  categoria?: string;
  urgencia?: string;
  nomeCliente?: string;
  distancia?: string;
  local?: string;
  descricao?: string;
  garantia?: string;
  coleta?: string;
  dataPrevista?: string;
}

export default function DetalhePedidoPage() {
  const params = useParams(); // { id: 'valor-do-id-na-url' }
  const pedidoId = params.id as string;
  
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (pedidoId) {
      const fetchPedido = async () => {
        const docRef = doc(db, 'pedidos', pedidoId); // Supondo que a coleção se chama 'pedidos'
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setPedido(docSnap.data() as Pedido);
        } else {
          console.log("Nenhum pedido encontrado!");
        }
        setLoading(false);
      };

      fetchPedido();
    }
  }, [pedidoId]); // Roda o efeito sempre que o pedidoId mudar

  if (loading) {
    return <div>Carregando detalhes do pedido...</div>;
  }

  if (!pedido) {
    return (
      <div>
        <p>Pedido não encontrado.</p>
        <Link href="/pedidos">Voltar para pedidos</Link>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Link href="/pedidos" className={styles.voltar}>← Voltar para pedidos</Link>
      <h2 id="categoria">{pedido.categoria}</h2>
      <p id="urgencia" className={styles.urgencia}>{pedido.urgencia}</p>

      <div className={styles.infos}>
        <h3>Informações do Cliente</h3>
        <p><strong>Nome:</strong> <span>{pedido.nomeCliente}</span></p>
        <p><strong>Distância:</strong> <span>{pedido.distancia}</span></p>
        <p><strong>Local:</strong> <span>{pedido.local}</span></p>
      </div>

      <div className={styles.infos}>
        <h3>Detalhes do Pedido</h3>
        <p><strong>Descrição:</strong> <span>{pedido.descricao}</span></p>
        <p><strong>Garantia:</strong> <span>{pedido.garantia}</span></p>
        <p><strong>Coleta:</strong> <span>{pedido.coleta}</span></p>
        <p><strong>Data desejada:</strong> <span>{pedido.dataPrevista}</span></p>
      </div>

      <button id="aceitar-btn">Aceitar pedido</button>
    </div>
  );
}