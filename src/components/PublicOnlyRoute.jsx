import { Navigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'

// 未ログインのユーザー向けのルート（ログイン済みなら物件一覧へ移動）
export default function PublicOnlyRoute({ children }) {
  const { session, loading } = useAuth()

  if (loading) return <p className="loading">読み込み中...</p>

  if (session) return <Navigate to="/properties" replace />

  return children
}
