'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, collection, query, getDocs, orderBy } from 'firebase/firestore';
import styles from './Profissional.module.css';
import { UserData } from '@/types';
import Modal from '@/components/Modal';
import { IoPencil, IoAddCircleOutline } from 'react-icons/io5';

type ProfissaoOption = { id: string; nome: string; };

export default function ProfissionalInfoPage() {
  const { user, userData: initialUserData } = useAuth();
  const [professionalData, setProfessionalData] = useState<Partial<UserData> | null>(null);
  const [originalData, setOriginalData] = useState<Partial<UserData> | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Estados para o modal de competências
  const [profissoesList, setProfissoesList] = useState<ProfissaoOption[]>([]);
  const [isCompetencyModalOpen, setIsCompetencyModalOpen] = useState(false);
  const [availableCompetencies, setAvailableCompetencies] = useState<string[]>([]);
  const [tempCompetencies, setTempCompetencies] = useState<string[]>([]); // Estado temporário para o modal
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (initialUserData) {
      setProfessionalData(initialUserData);
      setOriginalData(initialUserData);
      setLoading(false);
    }
    
    const fetchProfessions = async () => {
      try {
        const q = query(collection(db, 'profissoes'), orderBy('nome'));
        const querySnapshot = await getDocs(q);
        const professions = querySnapshot.docs.map(doc => ({
            id: doc.id,
            nome: doc.data().nome 
        })) as ProfissaoOption[];
        setProfissoesList(professions);
      } catch (error) {
        console.error("Erro ao buscar profissões:", error);
      }
    };
    fetchProfessions();
  }, [initialUserData]);

  useEffect(() => {
    if (professionalData?.profissao) {
      const fetchCompetencies = async () => {
        const docRef = doc(db, "profissoes", professionalData.profissao);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setAvailableCompetencies(docSnap.data().experiencias || []);
        }
      };
      fetchCompetencies();
    }
  }, [professionalData?.profissao]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setProfessionalData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
  
  const handleCompetencyToggle = (competencyName: string) => {
    setTempCompetencies(prev => {
        if (prev.includes(competencyName)) {
            return prev.filter(c => c !== competencyName);
        }
        return [...prev, competencyName];
    });
  };

  const handleSaveCompetencies = () => {
    setProfessionalData(prev => ({ ...prev, competencias: tempCompetencies }));
    setIsCompetencyModalOpen(false);
  };
  
  const openCompetencyModal = () => {
    setTempCompetencies(professionalData?.competencias || []);
    setIsCompetencyModalOpen(true);
  };

  const handleSave = async (fieldName: string) => {
    if (user && professionalData) {
      const docRef = doc(db, 'usuarios', user.uid);
      try {
        await updateDoc(docRef, { [fieldName]: professionalData[fieldName] });
        setEditingField(null);
        setOriginalData(professionalData);
        alert("Informação salva com sucesso!");
      } catch (error) {
        console.error("Erro ao salvar:", error);
        alert("Erro ao salvar informação.");
      }
    }
  };

  const handleCancel = () => {
    setProfessionalData(originalData);
    setEditingField(null);
  };

  const filteredCompetencies = availableCompetencies.filter(comp =>
    comp.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <p>Carregando...</p>;
  if (!professionalData || professionalData.tipo !== 'tecnico') {
    return <p>Acesso negado ou perfil não encontrado.</p>;
  }

  const renderEditableField = (fieldName: keyof UserData, label: string, as: 'select' | 'textarea' = 'input') => {
    const isBeingEdited = editingField === fieldName;
    const currentProfessionName = profissoesList.find(p => p.id === professionalData.profissao)?.nome || 'Não definida';

    return (
      <div className={styles.infoRow}>
        <span className={styles.label}>{label}</span>
        <div className={styles.valueContainer}>
          {isBeingEdited ? (
            <>
              {as === 'select' && (
                <select name="profissao" value={professionalData.profissao || ''} onChange={handleInputChange} className={styles.inputEdit}>
                    <option value="">Selecione sua profissão</option>
                    {profissoesList.map(prof => (
                        <option key={prof.id} value={prof.id}>{prof.nome}</option>
                    ))}
                </select>
              )}
              {as === 'textarea' && (
                <textarea name="descricao" value={professionalData.descricao || ''} onChange={handleInputChange} rows={5} className={styles.inputEdit} />
              )}
            </>
          ) : (
            <span className={styles.value}>
                {fieldName === 'profissao' ? currentProfessionName : (professionalData[fieldName] || 'Nenhuma informação')}
            </span>
          )}
        </div>
        <div className={styles.actionContainer}>
          {isBeingEdited ? (
            <>
              <button type="button" onClick={() => handleSave(fieldName)} className={styles.saveButton}>Salvar</button>
              <button type="button" onClick={handleCancel} className={styles.cancelButton}>Cancelar</button>
            </>
          ) : (
            <button type="button" onClick={() => setEditingField(fieldName)} className={styles.editIcon}>
              <IoPencil />
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <h1>Informações Profissionais</h1>
      <p>Gerencie sua profissão, descrição e competências que aparecem para os clientes.</p>

      <div className={styles.infoCard}>
        <h2>Sua Atuação na Servify</h2>
        {renderEditableField('profissao', 'Profissão Principal', 'select')}
        {renderEditableField('descricao', 'Descrição ("Sobre Mim")', 'textarea')}
        
        <div className={styles.infoRow}>
          <span className={styles.label}>Competências</span>
          <div className={styles.value}>
            <div className={styles.competencyTags}>
              {professionalData.competencias?.length > 0 ? (
                professionalData.competencias.map(comp => (
                  <span key={comp} className={styles.competencyTag}>{comp}</span>
                ))
              ) : (
                <span>Nenhuma competência adicionada.</span>
              )}
            </div>
          </div>
           <div className={styles.actionContainer}>
             <button type="button" onClick={openCompetencyModal} className={styles.editIcon} disabled={!professionalData.profissao}>
                <IoPencil />
            </button>
           </div>
        </div>
      </div>

      <Modal isOpen={isCompetencyModalOpen} onClose={() => setIsCompetencyModalOpen(false)}>
        <div className={styles.modalContent}>
            <h2 className={styles.modalTitle}>Adicionar Competências</h2>
            <input 
                type="text" 
                placeholder="Pesquisar competência..." 
                className={styles.modalSearchInput}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <ul className={styles.competencyList}>
                {filteredCompetencies.map(comp => (
                    <li key={comp} className={styles.competencyItem}>
                        <span>{comp}</span>
                        <button 
                            type="button" 
                            onClick={() => handleCompetencyToggle(comp)}
                            className={tempCompetencies.includes(comp) ? styles.removeBtn : styles.addBtn}
                        >
                            {tempCompetencies.includes(comp) ? 'Remover' : 'Adicionar'}
                        </button>
                    </li>
                ))}
            </ul>
            <div className={styles.modalActions}>
                <button onClick={() => setIsCompetencyModalOpen(false)} className={styles.cancelButton}>Cancelar</button>
                <button onClick={handleSaveCompetencies} className={styles.saveButton}>Salvar Competências</button>
            </div>
        </div>
      </Modal>
    </>
  );
}