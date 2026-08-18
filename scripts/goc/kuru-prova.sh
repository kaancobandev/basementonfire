#!/usr/bin/env bash
# ════════════════════════════════════════════════════════════════════
# GÖÇ ADIMI 5 — KURU PROVA: dump → restore → süre ölç.
#
#   ESKI_DB_URL='postgresql://...' YENI_DB_URL='postgresql://...' \
#     bash scripts/goc/kuru-prova.sh
#
# HİÇBİR ŞEY KURULMAZ:
#   · dökümler  → npx ile Supabase CLI (geçici indirir, global kurmaz)
#   · geri yükleme → Docker'daki resmî postgres:17 imajı (--rm)
#
# ⚠ İLK SÜRÜMDE HATA VARDI, DÜZELTİLDİ: ham `pg_dump --role-only` diye bir
# bayrak YOK; o Supabase CLI'ya ait. Ayrıca elle `--schema=auth` vermek
# yanlıştı — yeni projede auth/storage şemaları ZATEN VAR, yapılarını
# üstüne yazmaya çalışmak çakışır. CLI hangi şemanın dahil olacağını
# kendisi biliyor. Komutlar resmî dokümandan birebir alındı:
#   supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore
#
# ⚠ BU BİR PROVA. Site ESKİ projeye bağlı kalır, ortam değişkeni değişmez,
# veri kaybolmaz. Amaç: hataları bakım penceresinden ÖNCE bulmak ve gerçek
# kesinti süresini ÖLÇMEK.
# ════════════════════════════════════════════════════════════════════
set -euo pipefail

: "${ESKI_DB_URL:?ESKI_DB_URL gerekli}"
: "${YENI_DB_URL:?YENI_DB_URL gerekli}"

CIKTI="goc-dokum"
mkdir -p "$CIKTI"
sure() { echo "$(( $(date +%s) - $1 )) sn"; }

echo "── Araclar"
docker run --rm postgres:17 psql --version
echo

# ── DÖKÜMLER — resmî üçlü ──────────────────────────────────────────
T0=$(date +%s)

echo "── 1/4  roller"
t=$(date +%s)
npx -y supabase db dump --db-url "$ESKI_DB_URL" -f "$CIKTI/roles.sql" --role-only
echo "   $(sure $t) · $(wc -c < "$CIKTI/roles.sql") bayt"

echo "── 2/4  sema"
t=$(date +%s)
npx -y supabase db dump --db-url "$ESKI_DB_URL" -f "$CIKTI/schema.sql"
echo "   $(sure $t) · $(wc -c < "$CIKTI/schema.sql") bayt"

echo "── 3/4  veri"
# -x ile dislanan iki tablo dokumanin kendi listesi (vector storage ic tablolari).
t=$(date +%s)
npx -y supabase db dump --db-url "$ESKI_DB_URL" -f "$CIKTI/data.sql" \
  --use-copy --data-only \
  -x "storage.buckets_vectors" -x "storage.vector_indexes"
echo "   $(sure $t) · $(wc -c < "$CIKTI/data.sql") bayt"

# ── GERİ YÜKLEME — TEK transaction, dokumandaki SIRA ───────────────
# roles → schema → SET session_replication_role = replica → data
#
# `session_replication_role = replica` ŞART: veri yüklenirken trigger'ları
# ve FK kontrollerini susturur, yoksa satırlar birbirine bağlı olduğu için
# sıralama hatası verir.
#
# Dosyaları BİRLEŞTİRİP stdin'den veriyoruz: Docker'a klasör bağlamak
# Windows yol dönüşümü yüzünden kırılgan; bu yol o sorunu tamamen atlar.
# --single-transaction: hata olursa HİÇBİR ŞEY yazılmaz, yarım restore olmaz.
echo "── 4/4  yeni projeye geri yukleme (tek transaction)"
t=$(date +%s)
{
  cat "$CIKTI/roles.sql"
  cat "$CIKTI/schema.sql"
  echo "SET session_replication_role = replica;"
  cat "$CIKTI/data.sql"
} | docker run --rm -i postgres:17 psql \
      --single-transaction \
      --variable ON_ERROR_STOP=1 \
      --dbname "$YENI_DB_URL" \
      2> >(tee "$CIKTI/restore.hata.log" >&2)
echo "   $(sure $t)"

echo
echo "════════════════════════════════════════════════"
echo "KURU PROVA BITTI — toplam $(sure $T0)"
echo "Site hala ESKI projede. Hicbir sey degismedi."
echo
echo "Sirada dogrulama:"
echo "  1. sql/goc/98-auth-ozel.sql       → ESKI projede: auth/storage'da ozel ne var?"
echo "  2. sql/goc/99-dogrula.sql         → YENI projede"
echo "  3. node scripts/goc/satir-say.mjs → iki tarafi karsilastir"
echo "════════════════════════════════════════════════"
