import { Tag } from 'antd'

const statusMap: Record<string, { color: string; text: string }> = {
  pending: { color: 'default', text: '等待中' }, queued: { color: 'default', text: '排队中' },
  running: { color: 'processing', text: '执行中' }, processing: { color: 'processing', text: '执行中' },
  completed: { color: 'success', text: '已完成' }, success: { color: 'success', text: '已完成' },
  failed: { color: 'error', text: '失败' }, cancelled: { color: 'warning', text: '已取消' }
}

export default function StatusTag({ status = 'pending' }: { status?: string }) {
  const item = statusMap[status.toLowerCase()] || { color: 'blue', text: status }
  return <Tag color={item.color}>{item.text}</Tag>
}
