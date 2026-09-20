export interface ApiResponse<T = unknown> {
  success: boolean
  data: T
  message?: string
  code?: number
}

export interface User {
  id: string
  username: string
  email?: string
  is_admin?: boolean
  roles?: string[]
}

export interface Task {
  task_id: string
  symbol?: string
  stock_code?: string
  stock_symbol?: string
  stock_name?: string
  status: string
  progress?: number
  current_step?: string
  message?: string
  created_at?: string
  start_time?: string
  completed_at?: string
  error_message?: string
}

export interface Report {
  _id?: string
  id?: string
  analysis_id?: string
  task_id?: string
  stock_symbol?: string
  stock_code?: string
  stock_name?: string
  market_type?: string
  analysis_date?: string
  created_at?: string
  summary?: string
  recommendation?: string
  overall_score?: number
  [key: string]: unknown
}
