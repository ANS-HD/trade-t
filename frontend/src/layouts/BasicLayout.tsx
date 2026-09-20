import { useEffect, useMemo, useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  AppstoreOutlined, BarChartOutlined, BookOutlined, CreditCardOutlined, DashboardOutlined,
  DatabaseOutlined, FileTextOutlined, HeartOutlined, LogoutOutlined, MenuFoldOutlined,
  MenuUnfoldOutlined, SearchOutlined, SettingOutlined, UnorderedListOutlined, UserOutlined
} from '@ant-design/icons'
import { Avatar, Breadcrumb, Button, Dropdown, Layout, Menu, Space, Tag, Typography, type MenuProps } from 'antd'
import { authApi } from '@/api/services'
import { useAuthStore } from '@/stores/auth'

const { Header, Sider, Content, Footer } = Layout

const items: MenuProps['items'] = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: '仪表板' },
  {
    key: 'analysis', icon: <BarChartOutlined />, label: '股票分析', children: [
      { key: '/analysis/single', label: '单股分析' },
      { key: '/analysis/batch', label: '批量分析' }
    ]
  },
  { key: '/screening', icon: <SearchOutlined />, label: '股票筛选' },
  { key: '/favorites', icon: <HeartOutlined />, label: '我的自选' },
  { key: '/tasks', icon: <UnorderedListOutlined />, label: '任务中心' },
  { key: '/reports', icon: <FileTextOutlined />, label: '分析报告' },
  { key: '/learning', icon: <BookOutlined />, label: '学习中心' },
  { key: '/paper', icon: <CreditCardOutlined />, label: '模拟交易' },
  {
    key: 'settings', icon: <SettingOutlined />, label: '系统设置', children: [
      { key: '/settings', label: '基础设置' },
      { key: '/settings/config', label: '模型与数据源' },
      { key: '/settings/database', icon: <DatabaseOutlined />, label: '数据库' },
      { key: '/settings/cache', label: '缓存管理' },
      { key: '/settings/scheduler', label: '定时任务' },
      { key: '/settings/logs', label: '操作日志' },
      { key: '/settings/system-logs', label: '系统日志' },
      { key: '/settings/sync', label: '数据同步' },
      { key: '/settings/usage', label: '使用统计' }
    ]
  },
  { key: '/about', icon: <BookOutlined />, label: '关于项目' }
]

const titles: Record<string, string> = {
  dashboard: '仪表板', analysis: '股票分析', single: '单股分析', batch: '批量分析', screening: '股票筛选',
  favorites: '我的自选', tasks: '任务中心', reports: '分析报告', view: '报告详情', paper: '模拟交易', stocks: '股票详情', learning: '学习中心',
  settings: '系统设置', config: '模型与数据源', database: '数据库管理', cache: '缓存管理', scheduler: '定时任务',
  logs: '日志', 'system-logs': '系统日志', sync: '数据同步', usage: '使用统计', about: '关于项目'
}

export default function BasicLayout() {
  const [collapsed, setCollapsed] = useState(window.innerWidth < 900)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, clearSession } = useAuthStore()

  useEffect(() => {
    const name = location.pathname.split('/').filter(Boolean).at(-1) || 'dashboard'
    document.title = `${titles[name] || 'TradingAgents-CN'} - TradingAgents-CN`
  }, [location.pathname])

  const crumbs = useMemo(() => location.pathname.split('/').filter(Boolean).map((segment, index, all) => ({
    title: index === all.length - 1 ? (titles[segment] || segment) : <Link to={`/${all.slice(0, index + 1).join('/')}`}>{titles[segment] || segment}</Link>
  })), [location.pathname])

  const logout = async () => {
    try { await authApi.logout() } catch { /* local session still needs clearing */ }
    clearSession()
    navigate('/login', { replace: true })
  }

  return (
    <Layout className="app-shell">
      <Sider collapsible collapsed={collapsed} trigger={null} width={238} className="app-sider">
        <Link className="brand" to="/dashboard">
          <img src="/logo.svg" alt="logo" />
          {!collapsed && <span>TradingAgents</span>}
        </Link>
        <Menu theme="dark" mode="inline" items={items} selectedKeys={[location.pathname]} onClick={({ key }) => key.startsWith('/') && navigate(key)} />
      </Sider>
      <Layout>
        <Header className="app-header">
          <Space size="middle">
            <Button type="text" icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />} onClick={() => setCollapsed(!collapsed)} />
            <Breadcrumb items={crumbs} />
          </Space>
          <Space>
            <Tag color="blue">React + Ant Design</Tag>
            <Dropdown menu={{ items: [
              { key: 'user', icon: <UserOutlined />, label: user?.username || '管理员', disabled: true },
              { type: 'divider' },
              { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', danger: true, onClick: logout }
            ] }}>
              <Button type="text"><Avatar size="small" icon={<UserOutlined />} /> <span className="desktop-only">{user?.username || '管理员'}</span></Button>
            </Dropdown>
          </Space>
        </Header>
        <Content className="app-content"><Outlet /></Content>
        <Footer className="app-footer">TradingAgents-CN · 仅用于学习与研究，不构成投资建议</Footer>
      </Layout>
    </Layout>
  )
}
