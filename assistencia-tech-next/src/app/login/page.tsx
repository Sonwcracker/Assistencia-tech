"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from '@/lib/firebase'; 
import styles from "./login.module.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");

    try {
      // 1. Autenticar
      const userCredential = await signInWithEmailAndPassword(auth, email, senha);
      const user = userCredential.user;

      // 2. Buscar dados do Firestore com UID
      const userRef = doc(db, "usuarios", user.uid);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        const dadosUsuario = docSnap.data();
        console.log("Usuário logado:", dadosUsuario);

        // 3. Redirecionar para dashboard
        router.push("/");
      } else {
        setErro("Usuário não encontrado no banco.");
      }

    } catch (error: any) {
      console.error("Erro no login:", error.message);
      setErro("Email ou senha inválidos.");
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        <h2 className={styles.loginTitle}>Entrar na sua conta</h2>

        <form className={styles.loginForm} onSubmit={handleLogin}>
          <div className={styles.inputGroup}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              className={styles.inputField}
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password">Senha</label>
            <input
              type="password"
              id="password"
              className={styles.inputField}
              placeholder="Sua senha secreta"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>

          {erro && <p style={{ color: "red", marginTop: "10px" }}>{erro}</p>}

          <button type="submit" className={styles.loginButton}>Entrar</button>
        </form>

        <div className={styles.options}>
          <Link href="/recuperar-senha" className={styles.optionLink}>
            Esqueceu sua senha?
          </Link>
          <p className={styles.optionText}>
            Não tem uma conta?{" "}
            <Link href="/cadastro" className={styles.optionLink}>
              Cadastre-se
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
