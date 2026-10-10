import { supabase } from './supabaseClient'

// 物件テーブルに対する CRUD 操作をまとめたモジュール
// ※ RLS により、自分が登録した物件以外は取得・更新・削除できない

const TABLE = 'properties'

// 一覧取得（SELECT）：新しい順に並べる
export async function fetchProperties() {
  const { data, error } = await supabase
    .from(TABLE)
    .select('id, name, rent, area, layout, created_at')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

// 新規登録（INSERT）：user_id はDB側の初期値（auth.uid()）で自動設定される
export async function createProperty(property) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert(property)
    .select('id, name, rent, area, layout, created_at')
    .single()
  if (error) throw error
  return data
}

// 更新（UPDATE）
export async function updateProperty(id, property) {
  const { data, error } = await supabase
    .from(TABLE)
    .update(property)
    .eq('id', id)
    .select('id, name, rent, area, layout, created_at')
    .single()
  if (error) throw error
  return data
}

// 削除（DELETE）
export async function deleteProperty(id) {
  const { error } = await supabase.from(TABLE).delete().eq('id', id)
  if (error) throw error
}
