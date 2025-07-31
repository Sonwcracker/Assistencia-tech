export interface UserData {
  nome: string;
  sobrenome: string;
  email: string;
  telefone: string;
  cpf: string;
  endereco: string;
  tipo: 'cliente' | 'tecnico';
  foto?: string;
  profissao?: string;
  descricao?: string;
  experiencias?: string[];
  competencias?: string[];
}

export interface Solicitacao {
  id: string;
  cliente_id: string;
  nomeCliente?: string;
  tecnico_id?: string;
  nomeProfissional?: string;
  profissao_solicitada: string;
  descricao: string;
  data_criacao: Date;
  titulo: string;
  status: string;
  resposta_tecnico?: 'aceito' | 'recusado';
}

