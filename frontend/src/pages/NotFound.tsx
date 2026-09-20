import { Button, Result } from 'antd'
import { useNavigate } from 'react-router-dom'

export default function NotFound() {
  const navigate = useNavigate()
  return <Result status="404" title="404" subTitle="页面不存在或已经移动" extra={<Button type="primary" onClick={() => navigate('/dashboard')}>返回仪表板</Button>} />
}
