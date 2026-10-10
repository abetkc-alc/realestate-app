-- =========================================================
-- 不動産管理アプリ用テーブル定義
-- Supabase の SQL Editor に貼り付けて実行してください
-- =========================================================

-- 物件テーブル
create table if not exists public.properties (
  id         uuid primary key default gen_random_uuid(),
  -- 登録したユーザー（未指定の場合はログイン中のユーザーIDが自動で入る）
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name       text not null check (char_length(name) > 0),   -- 物件名
  rent       integer not null check (rent >= 0),            -- 家賃（円）
  area       text not null,                                 -- エリア名
  layout     text not null,                                 -- 間取り（例：1LDK）
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ユーザーごとの絞り込みを速くするためのインデックス
create index if not exists properties_user_id_idx on public.properties (user_id);

-- 更新時に updated_at を自動で現在時刻にするトリガー
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists properties_set_updated_at on public.properties;
create trigger properties_set_updated_at
  before update on public.properties
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------
-- 権限設定：ログインユーザー（authenticated）のみ操作可能
-- ---------------------------------------------------------
revoke all on public.properties from anon;
grant select, insert, update, delete on public.properties to authenticated;

-- ---------------------------------------------------------
-- RLS（行レベルセキュリティ）
-- ---------------------------------------------------------
alter table public.properties enable row level security;

-- 再実行できるように既存ポリシーを削除してから作成する
drop policy if exists "自分の物件のみ表示" on public.properties;
drop policy if exists "自分の物件のみ登録" on public.properties;
drop policy if exists "自分の物件のみ編集" on public.properties;
drop policy if exists "自分の物件のみ削除" on public.properties;

-- 表示：自分が登録した物件のみ
create policy "自分の物件のみ表示"
  on public.properties for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- 登録：自分のユーザーIDでのみ登録できる
create policy "自分の物件のみ登録"
  on public.properties for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

-- 編集：自分の物件のみ（他人のユーザーIDへの付け替えも禁止）
create policy "自分の物件のみ編集"
  on public.properties for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- 削除：自分の物件のみ
create policy "自分の物件のみ削除"
  on public.properties for delete
  to authenticated
  using ((select auth.uid()) = user_id);
