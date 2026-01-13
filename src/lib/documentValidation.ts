// Utilitários para validação e formatação de CPF/CNPJ

/**
 * Remove caracteres não numéricos
 */
export const cleanDocument = (value: string | null | undefined): string => {
  if (!value) return '';
  return value.replace(/\D/g, '');
};

/**
 * Detecta se é CPF ou CNPJ baseado no tamanho
 */
export const getDocumentType = (value: string): 'cpf' | 'cnpj' | 'unknown' => {
  const cleaned = cleanDocument(value);
  if (cleaned.length <= 11) return 'cpf';
  if (cleaned.length <= 14) return 'cnpj';
  return 'unknown';
};

/**
 * Formata CPF: XXX.XXX.XXX-XX
 */
export const formatCPF = (value: string): string => {
  const cleaned = cleanDocument(value).slice(0, 11);
  
  if (cleaned.length <= 3) return cleaned;
  if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}.${cleaned.slice(3)}`;
  if (cleaned.length <= 9) return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6)}`;
  return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`;
};

/**
 * Formata CNPJ: XX.XXX.XXX/XXXX-XX
 */
export const formatCNPJ = (value: string): string => {
  const cleaned = cleanDocument(value).slice(0, 14);
  
  if (cleaned.length <= 2) return cleaned;
  if (cleaned.length <= 5) return `${cleaned.slice(0, 2)}.${cleaned.slice(2)}`;
  if (cleaned.length <= 8) return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5)}`;
  if (cleaned.length <= 12) return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8)}`;
  return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8, 12)}-${cleaned.slice(12)}`;
};

/**
 * Formata automaticamente baseado no tamanho (CPF ou CNPJ)
 */
export const formatDocument = (value: string): string => {
  const cleaned = cleanDocument(value);
  if (cleaned.length <= 11) return formatCPF(value);
  return formatCNPJ(value);
};

/**
 * Valida dígitos verificadores do CPF
 */
export const validateCPF = (value: string): boolean => {
  const cleaned = cleanDocument(value);
  
  if (cleaned.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais (ex: 111.111.111-11)
  if (/^(\d)\1+$/.test(cleaned)) return false;
  
  // Calcula primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned.charAt(9))) return false;
  
  // Calcula segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned.charAt(10))) return false;
  
  return true;
};

/**
 * Valida dígitos verificadores do CNPJ
 */
export const validateCNPJ = (value: string): boolean => {
  const cleaned = cleanDocument(value);
  
  if (cleaned.length !== 14) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cleaned)) return false;
  
  // Valida primeiro dígito verificador
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleaned.charAt(i)) * weights1[i];
  }
  let remainder = sum % 11;
  const digit1 = remainder < 2 ? 0 : 11 - remainder;
  if (digit1 !== parseInt(cleaned.charAt(12))) return false;
  
  // Valida segundo dígito verificador
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cleaned.charAt(i)) * weights2[i];
  }
  remainder = sum % 11;
  const digit2 = remainder < 2 ? 0 : 11 - remainder;
  if (digit2 !== parseInt(cleaned.charAt(13))) return false;
  
  return true;
};

/**
 * Valida documento (CPF ou CNPJ) automaticamente
 */
export const validateDocument = (value: string): { isValid: boolean; type: 'cpf' | 'cnpj' | 'unknown'; message: string } => {
  const cleaned = cleanDocument(value);
  
  if (cleaned.length === 0) {
    return { isValid: false, type: 'unknown', message: 'Documento é obrigatório' };
  }
  
  if (cleaned.length < 11) {
    return { isValid: false, type: 'cpf', message: `CPF incompleto (${cleaned.length}/11 dígitos)` };
  }
  
  if (cleaned.length === 11) {
    const isValid = validateCPF(value);
    return { 
      isValid, 
      type: 'cpf', 
      message: isValid ? 'CPF válido' : 'CPF inválido (dígitos verificadores incorretos)' 
    };
  }
  
  if (cleaned.length < 14) {
    return { isValid: false, type: 'cnpj', message: `CNPJ incompleto (${cleaned.length}/14 dígitos)` };
  }
  
  if (cleaned.length === 14) {
    const isValid = validateCNPJ(value);
    return { 
      isValid, 
      type: 'cnpj', 
      message: isValid ? 'CNPJ válido' : 'CNPJ inválido (dígitos verificadores incorretos)' 
    };
  }
  
  return { isValid: false, type: 'unknown', message: 'Documento com formato inválido' };
};

// ==========================================
// Utilitários para formatação de telefone
// ==========================================

/**
 * Remove caracteres não numéricos do telefone
 */
export const cleanPhone = (value: string | null | undefined): string => {
  if (!value) return '';
  return value.replace(/\D/g, '');
};

/**
 * Detecta se é telefone fixo ou celular baseado no tamanho
 * Fixo: 10 dígitos (XX) XXXX-XXXX
 * Celular: 11 dígitos (XX) XXXXX-XXXX
 */
export const getPhoneType = (value: string): 'fixo' | 'celular' | 'unknown' => {
  const cleaned = cleanPhone(value);
  if (cleaned.length === 10) return 'fixo';
  if (cleaned.length === 11) return 'celular';
  return 'unknown';
};

/**
 * Formata telefone automaticamente
 * Fixo: (XX) XXXX-XXXX
 * Celular: (XX) XXXXX-XXXX
 */
export const formatPhone = (value: string): string => {
  const cleaned = cleanPhone(value).slice(0, 11);
  
  if (cleaned.length === 0) return '';
  if (cleaned.length <= 2) return `(${cleaned}`;
  if (cleaned.length <= 6) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
  if (cleaned.length <= 10) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  // Celular: 11 dígitos
  return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
};

// ==========================================
// Utilitários para validação de e-mail
// ==========================================

/**
 * Valida formato de e-mail
 * @param required - Se true, e-mail vazio será considerado inválido
 */
export const validateEmail = (value: string, required: boolean = false): { isValid: boolean; message: string } => {
  if (!value || value.trim() === '') {
    if (required) {
      return { isValid: false, message: 'E-mail é obrigatório' };
    }
    return { isValid: true, message: '' };
  }

  const trimmed = value.trim();
  
  // Regex para validação básica de e-mail
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(trimmed)) {
    // Mensagens específicas para erros comuns
    if (!trimmed.includes('@')) {
      return { isValid: false, message: 'Falta o símbolo @' };
    }
    if (trimmed.indexOf('@') === 0) {
      return { isValid: false, message: 'Falta o nome antes do @' };
    }
    if (trimmed.indexOf('@') === trimmed.length - 1) {
      return { isValid: false, message: 'Falta o domínio após o @' };
    }
    if (!trimmed.includes('.', trimmed.indexOf('@'))) {
      return { isValid: false, message: 'Falta o domínio (ex: .com, .br)' };
    }
    return { isValid: false, message: 'Formato de e-mail inválido' };
  }

  return { isValid: true, message: 'E-mail válido' };
};

/**
 * Valida telefone
 * @param required - Se true, telefone vazio será considerado inválido
 */
export const validatePhone = (value: string, required: boolean = false): { isValid: boolean; message: string } => {
  const cleaned = cleanPhone(value);
  
  if (!cleaned) {
    if (required) {
      return { isValid: false, message: 'Telefone é obrigatório' };
    }
    return { isValid: true, message: '' };
  }
  
  if (cleaned.length < 10) {
    return { isValid: false, message: `Telefone incompleto (${cleaned.length}/10-11 dígitos)` };
  }
  
  if (cleaned.length === 10) {
    return { isValid: true, message: 'Telefone fixo válido' };
  }
  
  if (cleaned.length === 11) {
    return { isValid: true, message: 'Celular válido' };
  }
  
  return { isValid: false, message: 'Telefone inválido' };
};

/**
 * Valida endereço
 * @param required - Se true, endereço vazio será considerado inválido
 */
export const validateAddress = (value: string, required: boolean = false): { isValid: boolean; message: string } => {
  if (!value || value.trim() === '') {
    if (required) {
      return { isValid: false, message: 'Endereço é obrigatório' };
    }
    return { isValid: true, message: '' };
  }
  
  const trimmed = value.trim();
  
  if (trimmed.length < 10) {
    return { isValid: false, message: 'Endereço muito curto' };
  }
  
  return { isValid: true, message: 'Endereço válido' };
};

// ==========================================
// Utilitários para formatação e busca de CEP
// ==========================================

/**
 * Remove caracteres não numéricos do CEP
 */
export const cleanCEP = (value: string | null | undefined): string => {
  if (!value) return '';
  return value.replace(/\D/g, '');
};

/**
 * Formata CEP: XXXXX-XXX
 */
export const formatCEP = (value: string): string => {
  const cleaned = cleanCEP(value).slice(0, 8);
  
  if (cleaned.length <= 5) return cleaned;
  return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
};

/**
 * Valida se o CEP está completo
 */
export const validateCEP = (value: string): { isValid: boolean; isComplete: boolean; message: string } => {
  const cleaned = cleanCEP(value);
  
  if (!cleaned) {
    return { isValid: true, isComplete: false, message: '' };
  }
  
  if (cleaned.length < 8) {
    return { isValid: false, isComplete: false, message: `CEP incompleto (${cleaned.length}/8 dígitos)` };
  }
  
  if (cleaned.length === 8) {
    return { isValid: true, isComplete: true, message: 'CEP válido' };
  }
  
  return { isValid: false, isComplete: false, message: 'CEP inválido' };
};

export interface ViaCEPResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

/**
 * Busca endereço via API ViaCEP
 */
export const fetchAddressByCEP = async (cep: string): Promise<ViaCEPResponse | null> => {
  const cleaned = cleanCEP(cep);
  
  if (cleaned.length !== 8) {
    return null;
  }
  
  try {
    const response = await fetch(`https://viacep.com.br/ws/${cleaned}/json/`);
    const data = await response.json();
    
    if (data.erro) {
      return null;
    }
    
    return data as ViaCEPResponse;
  } catch {
    return null;
  }
};

/**
 * Formata o endereço completo a partir da resposta do ViaCEP
 */
export const formatAddressFromViaCEP = (data: ViaCEPResponse): string => {
  const parts = [
    data.logradouro,
    data.bairro,
    `${data.localidade} - ${data.uf}`,
    data.cep
  ].filter(Boolean);
  
  return parts.join(', ');
};
