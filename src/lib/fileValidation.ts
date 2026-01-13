// File validation constants and utilities

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
export const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];

export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_VIDEO_SIZE = 500 * 1024 * 1024; // 500MB

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export const validateImageFile = (file: File): ValidationResult => {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Tipo de arquivo inválido. Tipos permitidos: ${ALLOWED_IMAGE_TYPES.map(t => t.split('/')[1].toUpperCase()).join(', ')}`,
    };
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return {
      valid: false,
      error: `Arquivo muito grande. Tamanho máximo: ${MAX_IMAGE_SIZE / (1024 * 1024)}MB`,
    };
  }

  return { valid: true };
};

export const validateVideoFile = (file: File): ValidationResult => {
  if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Tipo de arquivo inválido. Tipos permitidos: ${ALLOWED_VIDEO_TYPES.map(t => t.split('/')[1].toUpperCase()).join(', ')}`,
    };
  }

  if (file.size > MAX_VIDEO_SIZE) {
    return {
      valid: false,
      error: `Arquivo muito grande. Tamanho máximo: ${MAX_VIDEO_SIZE / (1024 * 1024)}MB`,
    };
  }

  return { valid: true };
};

// Sanitize filename to prevent path traversal
export const sanitizeFileName = (fileName: string, folder: string): string => {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  const safeExt = ext.replace(/[^a-z0-9]/g, '');
  return `${folder}/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${safeExt}`;
};
