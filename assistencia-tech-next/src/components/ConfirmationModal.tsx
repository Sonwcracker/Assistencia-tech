import React from 'react';
import styles from './ConfirmationModal.module.css';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, message }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <p>{message}</p>
        <div className={styles.buttons}>
          <button className={styles.cancelButton} onClick={onClose}>Não</button>
          <button className={styles.confirmButton} onClick={onConfirm}>Sim, Cancelar</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;