import axios, { type AxiosError, type AxiosRequestConfig } from 'axios'
import { message } from 'antd'
import { useAuthStore } from '@/stores/auth'
import type { ApiResponse } from '@/types'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 90_000,
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  config.headers['X-Request-ID'] = `${Date.now()}-${crypto.randomUUID?.() ?? Math.random()}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ detail?: string; message?: string }>) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clearSession()
      if (location.pathname !== '/login') location.assign(`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`)
    }
    const reason = error.response?.data?.detail || error.response?.data?.message || error.message || '请求失败'
    message.error(typeof reason === 'string' ? reason : '请求失败')
    return Promise.reject(error)
  }
)

export const unwrap = <T>(payload: ApiResponse<T> | T): T => {
  if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
    const envelope = payload as ApiResponse<T>
    if (!envelope.success) throw new Error(envelope.message || '请求失败')
    return envelope.data
  }
  return payload as T
}

export async function get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  return unwrap((await api.get<ApiResponse<T> | T>(url, config)).data)
}

export async function post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
  return unwrap((await api.post<ApiResponse<T> | T>(url, data, config)).data)
}

export async function put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
  return unwrap((await api.put<ApiResponse<T> | T>(url, data, config)).data)
}

export async function del<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  return unwrap((await api.delete<ApiResponse<T> | T>(url, config)).data)
}
