import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true, // envia o cookie HttpOnly em todas as requisições
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de resposta: "desempacota" response.data e redireciona em 401
axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status;
    const url: string = error.config?.url ?? '';

    if (status === 401 && !url.includes('/auth/login') && !url.includes('/auth/me')) {
      window.location.href = '/login';
      return Promise.reject(new Error('Sessão expirada. Faça login novamente.'));
    }

    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Erro na requisição';

    return Promise.reject(new Error(message));
  },
);

// Wrapper tipado: o segundo generic <T, T> informa ao TypeScript que o retorno
// real é T (e não AxiosResponse<T>), refletindo o que o interceptor faz em runtime.
export const api = {
  get: <T = any>(url: string) =>
    axiosInstance.get<T, T>(url),

  post: <T = any>(url: string, data?: unknown) =>
    axiosInstance.post<T, T>(url, data),

  put: <T = any>(url: string, data?: unknown) =>
    axiosInstance.put<T, T>(url, data),

  patch: <T = any>(url: string, data?: unknown) =>
    axiosInstance.patch<T, T>(url, data),

  delete: <T = any>(url: string) =>
    axiosInstance.delete<T, T>(url),
};
