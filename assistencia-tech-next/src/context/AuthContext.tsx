'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
// 1. Importar o onSnapshot e Unsubscribe
import { doc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { UserData } from '@/types';

// A interface do contexto permanece a mesma
interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Variável para o listener do documento do usuário
    let unsubscribeFromUserDoc: Unsubscribe | null = null;

    // O listener de autenticação (login/logout) continua o mesmo
    const unsubscribeFromAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      
      // Cancela o listener do documento do usuário anterior para evitar memory leaks
      if (unsubscribeFromUserDoc) {
        unsubscribeFromUserDoc();
      }

      if (currentUser) {
        // Se há um usuário logado, cria um novo listener para seu documento
        const userDocRef = doc(db, 'usuarios', currentUser.uid);

        // 2. Substituir getDoc por onSnapshot
        // onSnapshot "escuta" por qualquer mudança no documento do usuário em tempo real
        unsubscribeFromUserDoc = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            setUserData(docSnap.data() as UserData);
          } else {
            setUserData(null);
          }
          setLoading(false);
        }, (error) => {
          console.error("Erro ao escutar dados do usuário:", error);
          setLoading(false);
        });

      } else {
        // Se o usuário fez logout, limpa tudo
        setUserData(null);
        setLoading(false);
      }
    });

    // 3. Função de limpeza geral
    // Garante que ambos os listeners sejam removidos quando o app for fechado
    return () => {
      unsubscribeFromAuth();
      if (unsubscribeFromUserDoc) {
        unsubscribeFromUserDoc();
      }
    };
  }, []);

  const value = { user, userData, loading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};