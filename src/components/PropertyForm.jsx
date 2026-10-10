import { useEffect, useState } from 'react'

// 入力欄の初期値
const emptyForm = { name: '', rent: '', area: '', layout: '' }

// 物件の新規登録・編集で共用するフォーム
// initialValues が渡された場合は編集モードになる
export default function PropertyForm({ initialValues, onSubmit, onCancel }) {
  const isEdit = Boolean(initialValues)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // 編集対象が切り替わったらフォームの内容を入れ替える
  useEffect(() => {
    setForm(
      initialValues
        ? {
            name: initialValues.name,
            rent: String(initialValues.rent),
            area: initialValues.area,
            layout: initialValues.layout,
          }
        : emptyForm,
    )
    setError('')
  }, [initialValues])

  // 入力値を state に反映する
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      // 家賃は数値に変換してから保存する
      await onSubmit({
        name: form.name.trim(),
        rent: Number(form.rent),
        area: form.area.trim(),
        layout: form.layout.trim(),
      })
      // 新規登録が成功したらフォームを空に戻す
      if (!isEdit) setForm(emptyForm)
    } catch (err) {
      setError((isEdit ? '更新' : '登録') + 'に失敗しました：' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="property-form">
      <h2>{isEdit ? '物件を編集' : '物件を新規登録'}</h2>
      <div className="property-form-fields">
        <label>
          物件名
          <input name="name" value={form.name} onChange={handleChange} required />
        </label>
        <label>
          家賃（円）
          <input name="rent" type="number" min="0" step="1" value={form.rent} onChange={handleChange} required />
        </label>
        <label>
          エリア名
          <input name="area" value={form.area} onChange={handleChange} required />
        </label>
        <label>
          間取り
          <input name="layout" value={form.layout} onChange={handleChange} placeholder="例：1LDK" required />
        </label>
      </div>
      {error && <p className="error">{error}</p>}
      <div className="property-form-actions">
        <button type="submit" disabled={submitting}>
          {submitting ? '保存中...' : isEdit ? '更新する' : '登録する'}
        </button>
        {isEdit && (
          <button type="button" className="secondary-button" onClick={onCancel}>
            キャンセル
          </button>
        )}
      </div>
    </form>
  )
}
