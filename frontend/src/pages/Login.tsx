import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { Alert, Button, Card, Checkbox, Form, Input, Typography, message } from 'antd'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { authApi } from '@/api/services'
import { useAuthStore } from '@/stores/auth'

interface LoginForm { username: string; password: string; remember: boolean }

export default function Login() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const setSession = useAuthStore((state) => state.setSession)

  const submit = async (values: LoginForm) => {
    const result = await authApi.login(values.username, values.password)
    setSession(result.access_token, result.refresh_token || null, result.user)
    message.success('登录成功')
    const redirect = params.get('redirect')
    navigate(redirect?.startsWith('/') ? redirect : '/dashboard', { replace: true })
  }

  return (
    <main className="login-page">
      <section className="login-panel">
        <div className="login-brand">
          <img src="/logo.svg" alt="TradingAgents-CN" />
          <Typography.Title level={1}>TradingAgents-CN</Typography.Title>
          <Typography.Paragraph>多智能体股票分析学习平台</Typography.Paragraph>
        </div>
        <Card className="login-card" bordered={false}>
          <Typography.Title level={3}>欢迎回来</Typography.Title>
          <Typography.Paragraph type="secondary">登录后进入你的分析工作台</Typography.Paragraph>
          <Form<LoginForm> layout="vertical" size="large" initialValues={{ username: 'admin', remember: true }} onFinish={submit}>
            <Form.Item name="username" label="用户名" rules={[{ required: true, message: '请输入用户名' }]}>
              <Input prefix={<UserOutlined />} autoComplete="username" placeholder="用户名" />
            </Form.Item>
            <Form.Item name="password" label="密码" rules={[{ required: true, min: 6, message: '请输入至少 6 位密码' }]}>
              <Input.Password prefix={<LockOutlined />} autoComplete="current-password" placeholder="密码" />
            </Form.Item>
            <Form.Item name="remember" valuePropName="checked"><Checkbox>记住我</Checkbox></Form.Item>
            <Form.Item><Button type="primary" htmlType="submit" block>登录</Button></Form.Item>
          </Form>
          <Alert type="info" showIcon message="首次部署账号由服务端 .env 中的 ADMIN_USERNAME / ADMIN_PASSWORD 配置" />
        </Card>
        <Typography.Paragraph className="login-disclaimer">平台内容由 AI 自动生成，仅供学习研究，不构成投资建议。</Typography.Paragraph>
      </section>
    </main>
  )
}
