-- ════════════════════════════════════════════════════════════════════
-- GÖÇ ADIMI 10 — YENİ projede çalıştır: auth.users trigger'ını kur.
--
-- NEDEN AYRI BİR DOSYA: `public.handle_new_user()` FONKSİYONU public
-- şemasında olduğu için şema dökümüyle gelir. Ama onu çağıran TRIGGER
-- `auth.users` üzerinde duruyor ve döküm auth şemasının YAPISINI
-- taşımıyor (yeni projede o şema zaten var, üstüne yazılmıyor).
--
-- sql/fix-handle-new-user.sql içindeki CREATE TRIGGER satırı YORUM
-- hâlinde — o dosya yazıldığında trigger zaten mevcuttu. Yeni projede
-- mevcut DEĞİL.
--
-- ⚠ KURULMAZSA NE OLUR: mevcut kullanıcılar şifreleriyle sorunsuz girer,
-- site normal görünür, log temiz kalır — ama HER YENİ KAYIT auth.users'a
-- yazılıp public.users'a YAZILMAZ. Kullanıcı e-postasını onaylar, giriş
-- yapar ve profili olmadığı için uygulama onu tanımaz. Mevcut kullanıcılar
-- çalıştığı için hiçbir alarm çalmaz. Planda "sessiz arıza" olarak
-- işaretlenen maddelerden biri tam olarak budur.
--
-- ÖNCE sql/fix-handle-new-user.sql çalıştırılmış olmalı (fonksiyon şema
-- dökümüyle gelir ama garanti altına almak için tekrar çalıştırmak zararsız,
-- `create or replace`).
--
-- ── DOĞRULANDI (eski projeden okundu, 15.08.2026) ──────────────────
-- Gerçek tanım:
--   CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
--     FOR EACH ROW EXECUTE FUNCTION handle_new_user()
--
-- Aşağıdaki yeniden kurulum bununla aynı — TEK fark, fonksiyon adının
-- `public.` ile nitelenmesi. BU BİLİNÇLİ: fonksiyon `security definer` ve
-- niteliksiz çağrı `search_path`e bağlı çözülüyor. Açıkça yazmak davranışı
-- değiştirmez, o bağımlılığı kaldırır.
--
-- Ayrıca doğrulandı: auth/storage şemalarındaki 21 fonksiyonun tamamı
-- Supabase built-in'i (auth.uid, auth.jwt, storage.foldername, storage.search
-- vb.) — ÖZEL fonksiyon YOK. Ve o iki şemada RLS politikası YOK.
-- Yani bu trigger, iki şemadan taşınacak TEK şey.
-- ════════════════════════════════════════════════════════════════════

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── DOĞRULA: 1 satır dönmeli ───────────────────────────────────────
select t.tgname as trigger_adi, c.relname as tablo, n.nspname as sema
from pg_trigger t
join pg_class c     on c.oid = t.tgrelid
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'auth' and c.relname = 'users'
  and t.tgname = 'on_auth_user_created';
