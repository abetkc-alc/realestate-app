import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../lib/AuthContext'
import { createProperty, deleteProperty, fetchProperties, updateProperty } from '../lib/propertiesApi'
import PropertyForm from '../components/PropertyForm'

// 物件一覧画面（ログイン必須）
export default function PropertiesPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  // 編集中の物件（null の場合は新規登録モード）
  const [editing, setEditing] = useState(null)

  // 画面表示時に Supabase から物件一覧を取得する
  useEffect(() => {
    fetchProperties()
      .then(setProperties)
      .catch((err) => setError('物件一覧の取得に失敗しました：' + err.message))
      .finally(() => setLoading(false))
  }, [])

  // 新規登録：登録した物件を一覧の先頭に追加する
  const handleCreate = async (values) => {
    const created = await createProperty(values)
    setProperties((prev) => [created, ...prev])
  }

  // 更新：一覧の該当物件を差し替えて編集モードを終了する
  const handleUpdate = async (values) => {
    const updated = await updateProperty(editing.id, values)
    setProperties((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
    setEditing(null)
  }

  // 削除：確認ダイアログでOKされたら削除する
  const handleDelete = async (property) => {
    if (!window.confirm(`「${property.name}」を削除しますか？`)) return
    try {
      await deleteProperty(property.id)
      setProperties((prev) => prev.filter((p) => p.id !== property.id))
      // 編集中の物件を削除した場合は編集モードも解除する
      if (editing?.id === property.id) setEditing(null)
    } catch (err) {
      setError('削除に失敗しました：' + err.message)
    }
  }

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
          <button onClick={handleLogout} className="secondary-button">ログアウト</button>
        </div>
      </header>

      {/* 新規登録・編集フォーム */}
      <PropertyForm
        initialValues={editing}
        onSubmit={editing ? handleUpdate : handleCreate}
        onCancel={() => setEditing(null)}
      />

      {error && <p className="error page-error">{error}</p>}

      {/* 物件をカード形式で表示 */}
      {loading ? (
        <p className="loading">読み込み中...</p>
      ) : properties.length === 0 ? (
        <p className="empty">登録された物件はまだありません。</p>
      ) : (
        <div className="card-grid">
          {properties.map((p) => (
            <div key={p.id} className={'card' + (editing?.id === p.id ? ' card-editing' : '')}>
              <h2 className="card-title">{p.name}</h2>
              <p className="card-rent">家賃：{p.rent.toLocaleString()}円 / 月</p>
              <p className="card-area">エリア：{p.area}</p>
              <p className="card-area">間取り：{p.layout}</p>
              <div className="card-actions">
                <button
                  className="small-button"
                  onClick={() => {
                    setEditing(p)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                >
                  編集
                </button>
                <button className="small-button danger-button" onClick={() => handleDelete(p)}>
                  削除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
