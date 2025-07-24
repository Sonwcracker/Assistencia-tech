'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential, deleteUser } from 'firebase/auth';
import styles from './seguranca.module.css';
import Modal from '@/components/Modal';
import { useRouter } from 'next/navigation';

export default function SegurancaPage() {
  const { user } = useAuth();
  const router = useRouter();

  // Estados para alteração de senha
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');

  // Estados para exclusão de conta
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteStep, setDeleteStep] = useState(1);
  const [confirmationText, setConfirmationText] = useState('');
  const [passwordForDelete, setPasswordForDelete] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const requiredConfirmationText = "excluir minha conta permanentemente";

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    if (newPassword !== confirmPassword) {
      setMessage('As novas senhas não coincidem.');
      return;
    }
    if (!user || !user.email) return;

    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      setMessage('Senha alterada com sucesso!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setMessage('Erro ao alterar senha. Verifique sua senha atual.');
      console.error(error);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteError('');
    if (!user || !user.email) return;

    try {
      const credential = EmailAuthProvider.credential(user.email, passwordForDelete);
      await reauthenticateWithCredential(user, credential);
      
      // Se a reautenticação for bem-sucedida, exclui o usuário
      await deleteUser(user);
      
      alert('Sua conta foi excluída com sucesso.');
      router.push('/'); // Redireciona para a home
    } catch (error) {
      console.error("Erro ao excluir conta:", error);
      setDeleteError('Senha incorreta. A exclusão foi cancelada.');
    }
  };
  
  const resetDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeleteStep(1);
    setConfirmationText('');
    setPasswordForDelete('');
    setDeleteError('');
  }

  return (
    <>
      <div>
        <h1>Segurança</h1>
        <p>Altere sua senha e gerencie a segurança da sua conta.</p>

        <form onSubmit={handlePasswordChange} className={styles.sectionCard}>
          <h2>Alterar Senha</h2>
          <div className={styles.inputGroup}>
            <label htmlFor="current-password">Senha Atual</label>
            <input id="current-password" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="new-password">Nova Senha</label>
            <input id="new-password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="confirm-password">Confirmar Nova Senha</label>
            <input id="confirm-password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
          </div>
          {message && <p className={styles.message}>{message}</p>}
          <button type="submit" className={styles.saveButton}>Salvar Nova Senha</button>
        </form>

        <div className={styles.deleteSection}>
            <h3>Excluir Conta</h3>
            <p>Esta ação é permanente e resultará na exclusão de todos os seus dados associados à plataforma Servify.</p>
            <button type="button" onClick={() => setIsDeleteModalOpen(true)} className={styles.deleteButton}>Excluir minha conta</button>
        </div>
      </div>

      <Modal isOpen={isDeleteModalOpen} onClose={resetDeleteModal}>
        {deleteStep === 1 && (
          <div className={styles.modalContent}>
            <h2>Você tem certeza?</h2>
            <p>Esta ação é <strong>irreversível</strong>. Todos os seus dados, incluindo perfil, solicitações e histórico, serão excluídos permanentemente.</p>
            <p>Para continuar, digite a frase abaixo:</p>
            <p className={styles.confirmationPhrase}>{requiredConfirmationText}</p>
            <input 
              type="text" 
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              className={styles.modalInput}
            />
            <div className={styles.modalActions}>
              <button onClick={resetDeleteModal} className={styles.cancelButton}>Cancelar</button>
              <button onClick={() => setDeleteStep(2)} className={styles.confirmButton} disabled={confirmationText !== requiredConfirmationText}>Próxima Etapa</button>
            </div>
          </div>
        )}
        {deleteStep === 2 && (
           <div className={styles.modalContent}>
            <h2>Confirmação Final</h2>
            <p>Para sua segurança, por favor, digite sua senha para confirmar a exclusão da sua conta.</p>
            <input 
              type="password"
              value={passwordForDelete}
              onChange={(e) => setPasswordForDelete(e.target.value)}
              className={styles.modalInput}
              placeholder="Sua senha"
            />
            {deleteError && <p className={styles.deleteError}>{deleteError}</p>}
            <div className={styles.modalActions}>
              <button onClick={() => setDeleteStep(1)} className={styles.cancelButton}>Voltar</button>
              <button onClick={handleDeleteAccount} className={styles.deleteButton}>Excluir Conta Permanentemente</button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}