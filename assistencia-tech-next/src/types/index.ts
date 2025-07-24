export interface UserData {
  nome: string;
  sobrenome: string;
  email: string;
  telefone: string;
  cpf: string;
  endereco: string;
  tipo: 'cliente' | 'tecnico';
  foto?: string;
  // Adicione outros campos de freelancer aqui como opcionais
  profissao?: string;
  descricao?: string;
  experiencias?: string;
}