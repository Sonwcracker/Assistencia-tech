'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db, storage } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import NextImage from 'next/image';
import styles from './informacoes.module.css';
import { IoPencil, IoCameraOutline, IoCloudUploadOutline } from 'react-icons/io5';
import Modal from '@/components/Modal';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { getCroppedImg } from '@/utils/imageUtils';
import { UserData } from '@/types';

export default function InformacoesPage() {
  const { user } = useAuth();
  const [userData, setUserData] = useState<Partial<UserData> | null>(null);
  const [originalUserData, setOriginalUserData] = useState<Partial<UserData> | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingField, setEditingField] = useState<string | null>(null);
  
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [rawImage, setRawImage] = useState('');
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<Crop>();
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (user) {
      const docRef = doc(db, 'usuarios', user.uid);
      getDoc(docRef).then(docSnap => {
        if (docSnap.exists()) {
          const data = docSnap.data() as UserData;
          setUserData(data);
          setOriginalUserData(data);
        }
      }).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSave = async (fieldName: string) => {
    if (user && userData) {
      const docRef = doc(db, 'usuarios', user.uid);
      try {
        await updateDoc(docRef, { [fieldName]: userData[fieldName] });
        setEditingField(null);
        setOriginalUserData(userData);
        alert('Informação salva com sucesso!');
      } catch (error) {
        console.error("Erro ao salvar:", error);
        alert("Erro ao salvar a informação.");
      }
    }
  };

  const handleCancelEdit = () => {
    setUserData(originalUserData);
    setEditingField(null);
  };
  
  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCrop(undefined);
      const reader = new FileReader();
      reader.addEventListener('load', () => setRawImage(reader.result as string));
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    const newCrop = centerCrop(
      makeAspectCrop({ unit: '%', width: 90 }, 1, width, height),
      width,
      height
    );
    setCrop(newCrop);
  }

  const handlePhotoUpdate = async () => {
    if (!completedCrop || !imgRef.current || !user) {
      alert("A imagem ou a área de corte não estão prontas.");
      return;
    }

    const croppedFile = await getCroppedImg(imgRef.current, completedCrop, 'profile.jpg');
    if (croppedFile) {
      try {
        const storageRef = ref(storage, `profile_pictures/${user.uid}`);
        await uploadBytes(storageRef, croppedFile);
        const imageUrl = await getDownloadURL(storageRef);
        
        const docRef = doc(db, 'usuarios', user.uid);
        await updateDoc(docRef, { foto: imageUrl });

        const updatedData = { ...userData, foto: imageUrl };
        setUserData(updatedData);
        setOriginalUserData(updatedData);
        setIsPhotoModalOpen(false);
        setRawImage('');
        alert('Foto de perfil atualizada com sucesso!');
      } catch (error) {
        console.error("Erro ao atualizar foto:", error);
        alert("Erro ao atualizar a foto.");
      }
    }
  };

  if (loading) return <div>Carregando informações...</div>;
  if (!userData) return <div>Não foi possível carregar os dados.</div>;

  const renderEditableField = (fieldName: keyof UserData, label: string, type: string = 'text') => {
    const isBeingEdited = editingField === fieldName;
    return (
      <div className={styles.infoRow}>
        <span className={styles.label}>{label}</span>
        <div className={styles.valueContainer}>
          {isBeingEdited ? (
            <input type={type} name={fieldName} value={userData[fieldName] || ''} onChange={handleInputChange} className={styles.inputEdit} autoFocus />
          ) : (
            <span>{userData[fieldName]}</span>
          )}
        </div>
        <div className={styles.actionContainer}>
          {isBeingEdited ? (
            <>
              <button type="button" onClick={() => handleSave(fieldName)} className={styles.saveButton}>Salvar</button>
              <button type="button" onClick={handleCancelEdit} className={styles.cancelButton}>Cancelar</button>
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
      <h1>Informações Pessoais</h1>
      <p>Gerencie suas informações de contato e dados pessoais.</p>
      
      <div className={styles.infoCard}>
        <h2>Informações Básicas</h2>
        <div className={styles.infoRow}>
            <span className={styles.label}>Foto de perfil</span>
            <div className={styles.valueContainer}>
                <span>Uma foto de perfil ajuda a personalizar sua conta</span>
                <NextImage className={styles.rowImage} src={userData.foto || '/images/placeholder.jpg'} width={40} height={40} alt="foto" />
            </div>
            <div className={styles.actionContainer}>
                <button type="button" onClick={() => setIsPhotoModalOpen(true)} className={styles.editIcon}>
                    <IoCameraOutline />
                </button>
            </div>
        </div>
        {renderEditableField('nome', 'Nome')}
        <div className={styles.infoRow}>
          <span className={styles.label}>CPF</span>
          <span>{userData.cpf} (não pode ser alterado)</span>
          <div className={styles.actionContainer}></div>
        </div>
      </div>

      <div className={styles.infoCard}>
        <h2>Informações de Contato</h2>
        <div className={styles.infoRow}>
          <span className={styles.label}>E-mail</span>
          <span>{userData.email} (não pode ser alterado)</span>
          <div className={styles.actionContainer}></div>
        </div>
        {renderEditableField('telefone', 'Telefone', 'tel')}
        {renderEditableField('endereco', 'Endereço')}
      </div>

      <Modal isOpen={isPhotoModalOpen} onClose={() => setIsPhotoModalOpen(false)}>
        <h2 className={styles.modalTitle}>Atualizar Foto de Perfil</h2>
        <label htmlFor="foto-upload" className={styles.fileInputLabel}>
            <IoCloudUploadOutline />
            {rawImage ? 'Ajuste o corte da sua foto' : 'Escolher nova foto'}
        </label>
        <input id="foto-upload" type="file" accept="image/*" onChange={onFileSelect} className={styles.fileInput} />
        {rawImage && (
            <div className={styles.cropperContainer}>
                <ReactCrop 
                  crop={crop} 
                  onChange={(_, percentCrop) => setCrop(percentCrop)} 
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={1} 
                  minWidth={100}
                >
                    <img ref={imgRef} src={rawImage} alt="Prévia" onLoad={onImageLoad} />
                </ReactCrop>
            </div>
        )}
        <div className={styles.modalActions}>
            <button onClick={() => setIsPhotoModalOpen(false)} className={styles.cancelButton}>Cancelar</button>
            <button onClick={handlePhotoUpdate} className={styles.saveButton} disabled={!completedCrop}>Salvar Foto</button>
        </div>
      </Modal>
    </>
  );
}