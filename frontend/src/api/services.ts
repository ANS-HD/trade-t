import { api, del, get, post, put, unwrap } from './client'
import type { Report, Task, User } from '@/types'

export interface LoginResult {
  access_token: string
  refresh_token?: string
  user: User
}

export const authApi = {
  login: (username: string, password: string) => post<LoginResult>('/api/auth/login', { username, password }),
  me: () => get<User>('/api/auth/me'),
  logout: () => post('/api/auth/logout')
}

export interface AnalysisPayload {
  symbol: string
  parameters: {
    market_type: string
    analysis_date: string
    research_depth: string
    selected_analysts: string[]
    include_sentiment: boolean
    include_risk: boolean
    language: string
  }
}

export const analysisApi = {
  start: (payload: AnalysisPayload) => post<{ task_id: string; analysis_id?: string }>('/api/analysis/single', payload),
  batch: (payload: { title: string; description?: string; symbols: string[]; parameters: AnalysisPayload['parameters'] }) =>
    post<{ batch_id: string; task_ids: string[]; total_tasks: number }>('/api/analysis/batch', payload),
  tasks: (params?: Record<string, unknown>) => get<{ tasks?: Task[]; items?: Task[]; total?: number } | Task[]>('/api/analysis/tasks', { params }),
  status: (id: string) => get<Task>(`/api/analysis/tasks/${id}/status`),
  result: (id: string) => get<Record<string, unknown>>(`/api/analysis/tasks/${id}/result`),
  cancel: (id: string) => post(`/api/analysis/tasks/${id}/cancel`),
  remove: (id: string) => del(`/api/analysis/tasks/${id}`)
}

export const reportsApi = {
  list: (params?: Record<string, unknown>) => get<{ reports: Report[]; total: number; page: number; page_size: number }>('/api/reports/list', { params }),
  detail: (id: string) => get<Report>(`/api/reports/${id}/detail`),
  remove: (id: string) => del(`/api/reports/${id}`),
  download: async (id: string, format = 'pdf') => {
    const response = await api.get(`/api/reports/${id}/download`, { params: { format }, responseType: 'blob' })
    return response.data as Blob
  }
}

export const favoritesApi = {
  list: () => get<Record<string, unknown>[] | { items?: Record<string, unknown>[] }>('/api/favorites/'),
  add: (payload: Record<string, unknown>) => post('/api/favorites/', payload),
  update: (code: string, payload: Record<string, unknown>) => put(`/api/favorites/${code}`, payload),
  remove: (code: string) => del(`/api/favorites/${code}`),
  sync: () => post('/api/favorites/sync-realtime')
}

export const paperApi = {
  account: () => get<Record<string, unknown>>('/api/paper/account'),
  positions: () => get<{ items: Record<string, unknown>[] }>('/api/paper/positions'),
  orders: () => get<{ items: Record<string, unknown>[] }>('/api/paper/orders'),
  order: (payload: Record<string, unknown>) => post('/api/paper/order', payload),
  reset: () => post('/api/paper/reset?confirm=true')
}

export async function rawGet<T = unknown>(url: string, params?: Record<string, unknown>): Promise<T> {
  return unwrap((await api.get(url, { params })).data)
}
