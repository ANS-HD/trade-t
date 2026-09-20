import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { Flex, Spin } from 'antd'
import { useAuthStore } from '@/stores/auth'
import BasicLayout from '@/layouts/BasicLayout'

const Login = lazy(() => import('@/pages/Login'))
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const SingleAnalysis = lazy(() => import('@/pages/SingleAnalysis'))
const BatchAnalysis = lazy(() => import('@/pages/BatchAnalysis'))
const TaskCenter = lazy(() => import('@/pages/TaskCenter'))
const Reports = lazy(() => import('@/pages/Reports'))
const ReportDetail = lazy(() => import('@/pages/ReportDetail'))
const Favorites = lazy(() => import('@/pages/Favorites'))
const Screening = lazy(() => import('@/pages/Screening'))
const StockDetail = lazy(() => import('@/pages/StockDetail'))
const Settings = lazy(() => import('@/pages/Settings'))
const SystemPage = lazy(() => import('@/pages/SystemPage'))
const About = lazy(() => import('@/pages/About'))
const NotFound = lazy(() => import('@/pages/NotFound'))

function Protected() {
  const token = useAuthStore((state) => state.token)
  const location = useLocation()
  return token ? <BasicLayout /> : <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />
}

export default function App() {
  return (
    <Suspense fallback={<Flex align="center" justify="center" style={{ minHeight: '100vh' }}><Spin size="large" /></Flex>}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<Protected />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/analysis/single" element={<SingleAnalysis />} />
          <Route path="/analysis/batch" element={<BatchAnalysis />} />
          <Route path="/tasks" element={<TaskCenter />} />
          <Route path="/queue" element={<Navigate to="/tasks" replace />} />
          <Route path="/analysis/history" element={<Navigate to="/tasks?tab=completed" replace />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/reports/token" element={<Navigate to="/settings/usage" replace />} />
          <Route path="/reports/view/:id" element={<ReportDetail />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/screening" element={<Screening />} />
          <Route path="/stocks/:code" element={<StockDetail />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/settings/config" element={<Settings mode="config" />} />
          <Route path="/settings/database" element={<SystemPage type="database" />} />
          <Route path="/settings/logs" element={<SystemPage type="operations" />} />
          <Route path="/settings/system-logs" element={<SystemPage type="logs" />} />
          <Route path="/settings/sync" element={<SystemPage type="sync" />} />
          <Route path="/settings/cache" element={<SystemPage type="cache" />} />
          <Route path="/settings/usage" element={<SystemPage type="usage" />} />
          <Route path="/settings/scheduler" element={<SystemPage type="scheduler" />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
