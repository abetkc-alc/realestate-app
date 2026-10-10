import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../lib/AuthContext'
import { properties } from '../data/properties'

// 物件一覧画面（ログイン必須）
export default function PropertiesPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  // ログアウトしてログイン画面へ戻る
  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login', { replace: true })
  }

  return (
    <div className="page">
      <header className="header">
        <h1>物件一覧</h1>
        <div className="header-right">
          <span className="user-email">{user?.email}</span>
          <button onClick={handleLogout} className="logout-button">ログアウト</button>
        </div>
      </header>

      {/* 物件をカード形式で表示 */}
      <div className="card-grid">
        {properties.map((p) => (
          <div key={p.id} className="card">
            <h2 className="card-title">{p.name}</h2>
            <p className="card-rent">家賃：{p.rent.toLocaleString()}円 / 月</p>
            <p className="card-area">エリア：{p.area}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
