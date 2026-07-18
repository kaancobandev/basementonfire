-- ════════════════════════════════════════════════════════════════════════
--  ÖZELLİK MIGRATION — 2026-07-19 (12 özelliklik paket)
--  Supabase SQL Editor'de BİR KEZ çalıştır. Tümü idempotent.
--  Kod defansif: bu dosya çalışmadan da site kırılmaz; ilgili özellik uykuda kalır.
-- ════════════════════════════════════════════════════════════════════════

-- ── 1) ARCADE LİDERLİK TABLOSU (game_scores'u koda bağlama) ───────────────
-- Tablo şemada zaten var (player_name, score) ama hangi OYUNA ait olduğu yoktu.
alter table public.game_scores add column if not exists game_key text not null default 'ast';
create index if not exists idx_game_scores_game_score on public.game_scores (game_key, score desc);
-- RLS: tablo anonim-dostu (FK yok) ama yazma/okuma servis rolünden (API) geçer.
alter table public.game_scores enable row level security;


-- ── 2) BİLGİ KARTI BEĞENİSİ (dyk_likes) + bildirim kolonu ─────────────────
-- fact_likes deseninin birebir kopyası; kart üreticisine geri bildirim döngüsü.
create table if not exists public.dyk_likes (
  user_id    bigint not null references public.users(id) on delete cascade,
  dyk_id     bigint not null references public.did_you_know(id) on delete cascade,
  created_at timestamptz default now() not null,
  primary key (user_id, dyk_id)
);
create index if not exists idx_dyk_likes_dyk on public.dyk_likes (dyk_id);
alter table public.dyk_likes enable row level security;

-- Bildirimde bilgi kartı hedefi: post_id quick_facts FK'lı olduğundan ayrı kolon.
alter table public.notifications add column if not exists dyk_id bigint references public.did_you_know(id) on delete cascade;


-- ── 3) OKUMA İLERLEMESİ (article_reads) — koleksiyon rafları ──────────────
-- article_saves deseninin kopyası; makale sonuna ulaşan girişli kullanıcıya
-- otomatik "okundu". Kategori tamamlanınca koleksiyon rozeti (kod tarafında).
create table if not exists public.article_reads (
  user_id      bigint not null references public.users(id) on delete cascade,
  article_slug text not null,
  created_at   timestamptz default now() not null,
  primary key (user_id, article_slug)
);
alter table public.article_reads enable row level security;


-- ── 4) MAKALE SONU MİNİ-QUIZ (article_quiz_answers) ───────────────────────
-- quiz_questions.article_slug kolonu zaten vardı; makalelerdeki gömülü quiz'ler
-- hiçbir yere kaydedilmiyordu. daily_answers deseni: PK ile tekrar XP engellenir.
create table if not exists public.article_quiz_answers (
  user_id        bigint not null references public.users(id) on delete cascade,
  question_id    bigint not null references public.quiz_questions(id) on delete cascade,
  selected_index integer not null,
  is_correct     boolean not null,
  created_at     timestamptz default now() not null,
  primary key (user_id, question_id)
);
alter table public.article_quiz_answers enable row level security;

-- ── 5) GÖNDERİ ANKETLERİ (post_polls) ─────────────────────────────────────
-- Oylar GENEL article_poll_votes tablosunda tutulur (poll_key='post-<id>',
-- choice = seçenek İNDEKSİ) — çerezsiz anonim oy + çift oy koruması kanıtlanmış.
-- Bu tablo yalnız seçenek METİNLERİNİ taşır.
-- NOT: eski polls/poll_options/poll_votes üçlüsü ve cast_poll_vote RPC'si canlı
-- DB'de HİÇ YOKTU (ölçüldü, 2026-07-19) ve hiçbir UI onları çağırmıyordu;
-- o ölü yol koddan kaldırıldı, yeniden oluşturulmasına gerek yok.
create table if not exists public.post_polls (
  post_id    bigint primary key references public.posts(id) on delete cascade,
  options    jsonb not null,
  created_at timestamptz default now() not null
);
alter table public.post_polls enable row level security;


-- ── 6) HİKAYE GÖRÜNTÜLENMESİ (story_views) ────────────────────────────────
-- Hikaye atan kullanıcı sıfır geri bildirim alıyordu. Tepkiler ayrı tablo
-- İSTEMEZ: mevcut DM altyapısından mesaj olarak gider (dm_privacy + engel
-- kontrolüyle), böylece konuşma başlatır.
create table if not exists public.story_views (
  story_id   bigint not null references public.stories(id) on delete cascade,
  viewer_id  bigint not null references public.users(id) on delete cascade,
  created_at timestamptz default now() not null,
  primary key (story_id, viewer_id)
);
create index if not exists idx_story_views_story on public.story_views (story_id, created_at desc);
alter table public.story_views enable row level security;


-- Örnek sorular: dogal-secilim makalesinin GÖMÜLÜ quiz'inden (widgets.tsx) taşındı.
-- Diğer makaleler için aynı biçimde satır ekleyebilirsin; article_slug lib/articles.ts
-- registry'sindeki slug ile birebir aynı olmalı, makale başına ilk 3 aktif soru gösterilir.
insert into public.quiz_questions (question, options, correct_index, explanation, article_slug)
select * from (values
  ('Doğal seçilimde "en uyumlu birey" kimdir?',
   '["En güçlü ve en iri olan","Ortamına en iyi uyup en çok yavru bırakan","En uzun yaşayan","En zeki olan"]'::jsonb,
   1, 'Uyum = ortama uygunluk ve üreme başarısı; kas ya da zekâ şart değil.', 'dogal-secilim'),
  ('Bir popülasyonda hiç çeşitlilik yoksa ne olur?',
   '["Seçilim daha hızlı işler","Doğal seçilim işleyemez — seçecek bir fark yoktur","Mutasyonlar durur","Tüm bireyler ölür"]'::jsonb,
   1, 'Seçilim var olan farklar arasından seçer. Fark yoksa süreç durur.', 'dogal-secilim'),
  ('Mutasyon ile seçilim arasındaki ilişki nedir?',
   '["İkisi de rastgeledir","İkisi de yönlüdür","Mutasyon rastgeledir; seçilim rastgele değildir","Seçilim rastgeledir; mutasyon yönlüdür"]'::jsonb,
   2, 'Mutasyonlar yönsüz oluşur; hangi varyantın yayılacağını ortam belirler.', 'dogal-secilim')
) as v(question, options, correct_index, explanation, article_slug)
where not exists (select 1 from public.quiz_questions where article_slug = 'dogal-secilim');


-- ════════════════════════════════════════════════════════════════════════
--  DOĞRULAMA (opsiyonel): tabloların oluştuğunu gör.
--    select table_name from information_schema.tables
--     where table_schema='public'
--       and table_name in ('dyk_likes','article_reads','article_quiz_answers',
--                          'post_polls','story_views');
--  Kolonlar:
--    select column_name from information_schema.columns
--     where table_name='game_scores' and column_name='game_key';
--    select column_name from information_schema.columns
--     where table_name='notifications' and column_name='dyk_id';
-- ════════════════════════════════════════════════════════════════════════
