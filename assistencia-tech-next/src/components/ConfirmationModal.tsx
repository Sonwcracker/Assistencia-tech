'use client';
import React from 'react';
import styles from './ConfirmationModal.module.css';
import Modal from './Modal'; // Reutiliza o seu componente base de modal

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, message }) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className={styles.content}>
        <p className={styles.message}>{message}</p>
        <div className={styles.buttons}>
          <button className={styles.cancelButton} onClick={onClose}>Não</button>
          <button className={styles.confirmButton} onClick={onConfirm}>Sim</button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;