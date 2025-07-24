'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import styles from './cadastro.module.css';
import { IoPersonOutline, IoBriefcaseOutline, IoCheckmarkCircle, IoCloseCircle, IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5';
import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import ProgressBar from '../../components/ProgressBar';
import { validateCPF } from '../../utils/validators';

// --- DEFINIÇÃO DE TIPOS ---
type FormData = {
    nome: string; sobrenome: string; email: string; senha: string;
    confirmSenha: string; cpf: string; telefone: string;
    cep: string; endereco: string; numero: string; profissao?: string;
    descricao?: string; experiencias?: string;
};
type PasswordValidation = { length: boolean; uppercase: boolean; lowercase: boolean; number: boolean; };

// --- COMPONENTES DAS ETAPAS ---

const PasswordRequirement = ({ label, isValid }: { label: string, isValid: boolean }) => (
    <div className={`${styles.requirement} ${isValid ? styles.valid : ''}`}>
        {isValid ? <IoCheckmarkCircle /> : <IoCloseCircle />}
        <span>{label}</span>
    </div>
);

const Step1_Personal = ({ formData, handleInputChange, passwordValidation, showPassword, toggleShowPassword }: any) => (
    <>
        <div className={styles.formRow}>
            <input name="nome" type="text" placeholder="Nome" value={formData.nome || ''} onChange={handleInputChange} required />
            <input name="sobrenome" type="text" placeholder="Sobrenome" value={formData.sobrenome || ''} onChange={handleInputChange} required />
        </div>
        <input name="email" type="email" placeholder="E-mail" value={formData.email || ''} onChange={handleInputChange} required />
        <div className={styles.passwordWrapper}>
            <input name="senha" type={showPassword ? 'text' : 'password'} placeholder="Crie uma senha" value={formData.senha || ''} onChange={handleInputChange} required />
            <button type="button" onClick={toggleShowPassword} className={styles.eyeButton}>
                {showPassword ? <IoEyeOffOutline /> : <IoEyeOutline />}
            </button>
        </div>
        <div className={styles.passwordRequirements}>
            <PasswordRequirement label="Pelo menos 8 caracteres" isValid={passwordValidation.length} />
            <PasswordRequirement label="Letra maiúscula" isValid={passwordValidation.uppercase} />
            <PasswordRequirement label="Letra minúscula" isValid={passwordValidation.lowercase} />
            <PasswordRequirement label="Um número" isValid={passwordValidation.number} />
        </div>
        <div className={styles.passwordWrapper}>
            <input name="confirmSenha" type={showPassword ? 'text' : 'password'} placeholder="Confirme a senha" value={formData.confirmSenha || ''} onChange={handleInputChange} required />
        </div>
    </>
);

const Step2_ContactAddress = ({ formData, handleInputChange, errors }: any) => (
    <>
        <input name="cpf" type="text" placeholder="CPF" value={formData.cpf || ''} onChange={handleInputChange} required />
        {errors.cpf && <p className={styles.errorMessage}>{errors.cpf}</p>}
        <input name="telefone" type="tel" placeholder="Telefone (ex: 5511987654321)" value={formData.telefone || ''} onChange={handleInputChange} required />
        {errors.telefone && <p className={styles.errorMessage}>{errors.telefone}</p>}
        <input name="cep" type="text" placeholder="CEP" value={formData.cep || ''} onChange={handleInputChange} required />
        <div className={styles.formRow}>
            <input name="endereco" type="text" placeholder="Endereço" value={formData.endereco || ''} onChange={handleInputChange} required className={styles.addressField} />
            <input name="numero" type="text" placeholder="Nº" value={formData.numero || ''} onChange={handleInputChange} required className={styles.numberField} />
        </div>
    </>
);

const Step3_Professional = ({ formData, handleInputChange }: any) => (
    <>
        <select name="profissao" value={formData.profissao || ''} onChange={handleInputChange} required>
            <option value="">Sua principal profissão</option>
            <option value="eletricista">Eletricista</option>
            <option value="encanador">Encanador</option>
            <option value="montador-de-moveis">Montador de Móveis</option>
            <option value="diarista">Diarista</option>
            <option value="baba">Babá</option>
            <option value="cuidador-de-idosos">Cuidador de Idosos</option>
            <option value="marceneiro">Marceneiro</option>
            <option value="pedreiro">Pedreiro</option>
            <option value="pintor">Pintor</option>
        </select>
        <textarea name="descricao" placeholder="Conte um pouco sobre você..." value={formData.descricao || ''} onChange={handleInputChange} required rows={4} />
        <textarea name="experiencias" placeholder="Suas experiências (opcional)" value={formData.experiencias || ''} onChange={handleInputChange} rows={4} />
    </>
);

// --- COMPONENTE DO FORMULÁRIO DE ETAPAS ---
const FormWizard = ({ userType, onRegister }: { userType: 'cliente' | 'tecnico', onRegister: Function }) => {
    const totalSteps = userType === 'cliente' ? 2 : 3;
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<Partial<FormData>>({
        nome: '', sobrenome: '', email: '', senha: '', confirmSenha: '', 
        cpf: '', telefone: '', cep: '', endereco: '', numero: '', 
        profissao: '', descricao: '', experiencias: ''
    });
    const [errors, setErrors] = useState({ cpf: '', telefone: '' });
    const [passwordValidation, setPasswordValidation] = useState<PasswordValidation>({ length: false, uppercase: false, lowercase: false, number: false });
    const [showPassword, setShowPassword] = useState(false);

    const toggleShowPassword = () => setShowPassword(!showPassword);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (name === 'senha') {
            setPasswordValidation({
                length: value.length >= 8, uppercase: /[A-Z]/.test(value),
                lowercase: /[a-z]/.test(value), number: /[0-9]/.test(value),
            });
        }
        if (name === 'cpf') setErrors(prev => ({ ...prev, cpf: validateCPF(value) ? '' : 'CPF inválido.' }));
        if (name === 'telefone') setErrors(prev => ({ ...prev, telefone: /^55\d{10,11}$/.test(value) ? '' : 'Formato inválido. Use 55+DDD+Número.' }));
    };

    const isStepValid = () => {
        if (step === 1) {
            return Object.values(passwordValidation).every(Boolean) &&
                   (formData.senha && formData.senha === formData.confirmSenha);
        }
        if (step === 2) {
            return (
                formData.cpf && validateCPF(formData.cpf) &&
                formData.telefone && /^55\d{10,11}$/.test(formData.telefone) &&
                formData.endereco && formData.endereco.trim() !== '' &&
                formData.numero && formData.numero.trim() !== ''
            );
        }
        if (step === 3 && userType === 'tecnico') {
            return !!formData.profissao && !!formData.descricao && formData.descricao.trim() !== '';
        }
        return false;
    };

    const nextStep = () => { if (isStepValid()) setStep(step + 1); };
    const prevStep = () => setStep(step - 1);
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isStepValid()) {
            onRegister(userType, formData);
        }
    };

    return (
        <div className={styles.formContainer}>
            <h2>{userType === 'cliente' ? 'Criar Conta de Cliente' : 'Seja um Profissional'} <span className={styles.stepIndicator}>(Etapa {step} de {totalSteps})</span></h2>
            <ProgressBar currentStep={step} totalSteps={totalSteps} />
            <form onSubmit={handleSubmit} className={styles.form}>
                {step === 1 &&
                    <Step1_Personal {...{ formData, handleInputChange, passwordValidation, showPassword, toggleShowPassword }} />
                }
                {step === 2 &&
                    <Step2_ContactAddress {...{ formData, handleInputChange, errors }} />
                }
                {step === 3 && userType === 'tecnico' &&
                    <Step3_Professional {...{ formData, handleInputChange }} />
                }
                <div className={styles.stepNav}>
                    {step > 1 && <button type="button" onClick={prevStep} className={styles.prevButton}>Anterior</button>}
                    {step < totalSteps && <button type="button" onClick={nextStep} className={styles.nextButton} disabled={!isStepValid()}>Próximo</button>}
                    {step === totalSteps && <button type="submit" className={styles.submitButton}>Finalizar Cadastro</button>}
                </div>
            </form>
        </div>
    );
};

// --- COMPONENTE PRINCIPAL DA PÁGINA ---
export default function CadastroPage() {
    const [isFreelancer, setIsFreelancer] = useState(false);
    const router = useRouter();

    const handleRegister = async (type: 'cliente' | 'tecnico', formData: Partial<FormData>) => {
        if (!formData.email || !formData.senha) {
            alert("Email e senha são obrigatórios.");
            return;
        }
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.senha);
            const userId = userCredential.user.uid;
            
            // Removemos toda a lógica de imagem daqui
            const { senha, confirmSenha, ...firestoreData } = formData;
            
            await setDoc(doc(db, 'usuarios', userId), {
                ...firestoreData,
                foto: '', // Deixa o campo foto vazio por padrão
                tipo: type
            });
            alert(`Conta de ${type} criada com sucesso!`);
            router.push('/login');
        } catch (error) {
            console.error(error);
            alert('Erro ao criar conta. Verifique se o e-mail já está em uso.');
        }
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.cardWrapper}>
                <div className={`${styles.cardInner} ${isFreelancer ? styles.isFlipped : ''}`}>
                    <div className={styles.cardFaceFront}>
                        <div className={styles.formPanel}>
                            <FormWizard userType="cliente" onRegister={handleRegister} />
                        </div>
                        <div className={`${styles.ctaPanel} ${styles.ctaPanelRight}`}>
                            <IoBriefcaseOutline className={styles.ctaIcon} />
                            <h3>É um Profissional?</h3>
                            <p>Clique aqui para oferecer seus serviços e encontrar novos clientes.</p>
                            <button onClick={() => setIsFreelancer(true)} className={styles.switchButton}>Cadastrar como Freelancer</button>
                        </div>
                    </div>
                    <div className={styles.cardFaceBack}>
                        <div className={`${styles.ctaPanel} ${styles.ctaPanelLeft}`}>
                            <IoPersonOutline className={styles.ctaIcon} />
                            <h3>Precisa de um Serviço?</h3>
                            <p>Volte para se cadastrar como cliente e contratar os melhores profissionais.</p>
                            <button onClick={() => setIsFreelancer(false)} className={styles.switchButton}>Cadastrar como Cliente</button>
                        </div>
                        <div className={styles.formPanel}>
                            <FormWizard userType="tecnico" onRegister={handleRegister} />
                        </div>
                    </div>
                </div>
            </div>
            <p className={styles.loginLink}>
                Já tem uma conta? <Link href="/login">Faça login</Link>
            </p>
        </div>
    );
}