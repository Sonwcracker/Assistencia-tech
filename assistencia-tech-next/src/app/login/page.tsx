import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './login.module.css';

export default function LoginPage() {
  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        <h2 className={styles.loginTitle}>Entrar na sua conta</h2>
        <form className={styles.loginForm}>
          <div className={styles.inputGroup}>
            <label htmlFor="email">Email</label>
            <input type="email" id="email" className={styles.inputField} placeholder="seu@email.com" required />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="password">Senha</label>
            <input type="password" id="password" className={styles.inputField} placeholder="Sua senha secreta" required />
          </div>
          <button type="submit" className={styles.loginButton}>Entrar</button>
        </form>
        <div className={styles.options}>
          <Link href="/recuperar-senha" className={styles.optionLink}>Esqueceu sua senha?</Link>
          <p className={styles.optionText}>
            Não tem uma conta? <Link href="/cadastro" className={styles.optionLink}>Cadastre-se</Link>
          </p>
        </div>
      </div>
    </div>
  );
}