const isProduction = import.meta.env.PROD;
export const API_BASE_URL = isProduction ? 'https://api.ybsportal.site' : 'https://localhost:7096';

export const getFileUrl = (path: string | null | undefined): string => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  
  // Ensure we don't have double slashes
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
};
