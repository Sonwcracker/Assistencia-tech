export function validateCPF(cpf: string): boolean {
  if (typeof cpf !== 'string') return false;
  cpf = cpf.replace(/[^\d]+/g, '');
  if (cpf.length !== 11 || !!cpf.match(/(\d)\1{10}/)) return false;
  
  const digits = cpf.split('').map(el => +el);

  const calcDigit = (sliceEnd: number): number => {
    let sum = 0;
    for (let i = 0; i < sliceEnd; i++) {
      sum += digits[i] * (sliceEnd + 1 - i);
    }
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };
  
  return calcDigit(9) === digits[9] && calcDigit(10) === digits[10];
}