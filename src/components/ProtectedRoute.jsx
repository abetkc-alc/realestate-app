import { Navigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'

// ログイン済みのユーザーだけが表示できるルート
export default function ProtectedRoute({ children }) {
  const { session, loading } = useAuth()

  if (loading) return <p className="loading">読み込み中...</p>

  // 未ログインの場合はログイン画面へリダイレクト
  if (!session) return <Navigate to="/login" replace />

  return children
}
