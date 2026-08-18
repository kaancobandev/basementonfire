#!/usr/bin/env bash
# ════════════════════════════════════════════════════════════════════
# GÖÇ ADIMI 5 — KURU PROVA: dump → restore → süre ölç.
#
#   bash scripts/goc/kuru-prova.sh
#
# BAĞLANTI DİZELERİ goc-dokum/baglanti.env dosyasından okunur (gitignore'da).
# İçeriği TAM OLARAK iki satır — tırnak yok, baştan boşluk yok:
#
#   ESKI_DB_URL=postgresql://postgres:PAROLA@...:5432/postgres
#   YENI_DB_URL=postgresql://postgres:PAROLA@...:5432/postgres
#
# HİÇBİR ŞEY KURULMAZ: dökümler npx ile Supabase CLI'dan, geri yükleme
# Docker'daki postgres:17 imajından. İkisi de geçici.
#
# ⚠ ÇIKTIDA PAROLA MASKELENİR. Araçlar hata mesajında bağlantı dizesini
# basabiliyor; tüm çıktı `maskele` süzgecinden geçirilir. Bu yüzden gövde
# main() içinde ve TEK BORUYA veriliyor — `exec > >(...)` denendi, script
# bitince tamponu boşaltamayıp çıktıyı YUTUYORDU.
#
# ⚠ BU BİR PROVA. Site ESKİ projeye bağlı kalır, ortam değişkeni değişmez,
# veri kaybolmaz. Amaç: hataları bakım penceresinden ÖNCE bulmak ve gerçek
# kesinti süresini ÖLÇMEK.
#
# Komutlar resmî dokümandan birebir:
#   supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore
# ════════════════════════════════════════════════════════════════════
set -uo pipefail

CIKTI="goc-dokum"
ENVDOSYA="$CIKTI/baglanti.env"
mkdir -p "$CIKTI"

if [[ ! -f "$ENVDOSYA" ]]; then
  echo "HATA: $ENVDOSYA yok. Iki satirlik dosyayi olustur:" >&2
  echo "  ESKI_DB_URL=postgresql://..." >&2
  echo "  YENI_DB_URL=postgresql://..." >&2
  exit 1
fi
set -a; source "$ENVDOSYA"; set +a
: "${ESKI_DB_URL:?ESKI_DB_URL satiri eksik}"
: "${YENI_DB_URL:?YENI_DB_URL satiri eksik}"

# Bagalanti dizesinden parolayi cikar (maskeleme icin).
p_al() { sed -E 's#^[^:]+://[^:]+:([^@]+)@.*#\1#' <<<"$1"; }
P1=$(p_al "$ESKI_DB_URL"); P2=$(p_al "$YENI_DB_URL")
maskele() {
  if [[ -n "$P1" && -n "$P2" && "$P1" != "$P2" ]]; then
    sed -e "s|$P1|***|g" -e "s|$P2|***|g"
  elif [[ -n "$P1" ]]; then
    sed -e "s|$P1|***|g"
  else
    cat
  fi
}

sure() { echo "$(( $(date +%s) - $1 )) sn"; }

main() {
  echo "── Araclar"
  docker run --rm postgres:17 psql --version
  echo

  local T0 t
  T0=$(date +%s)

  echo "── 1/4  roller"
  t=$(date +%s)
  npx -y supabase db dump --db-url "$ESKI_DB_URL" -f "$CIKTI/roles.sql" --role-only || return 1
  echo "   $(sure $t) · $(wc -c < "$CIKTI/roles.sql") bayt"

  echo "── 2/4  sema"
  t=$(date +%s)
  npx -y supabase db dump --db-url "$ESKI_DB_URL" -f "$CIKTI/schema.sql" || return 1
  echo "   $(sure $t) · $(wc -c < "$CIKTI/schema.sql") bayt"

  echo "── 3/4  veri"
  # -x ile dislanan iki tablo dokumanin kendi listesi (vector storage ic tablolari).
  t=$(date +%s)
  npx -y supabase db dump --db-url "$ESKI_DB_URL" -f "$CIKTI/data.sql" \
    --use-copy --data-only \
    -x "storage.buckets_vectors" -x "storage.vector_indexes" || return 1
  echo "   $(sure $t) · $(wc -c < "$CIKTI/data.sql") bayt"

  # ── GERİ YÜKLEME — TEK transaction, dokumandaki SIRA ─────────────
  # roles → schema → SET session_replication_role = replica → data
  #
  # `session_replication_role = replica` ŞART: veri yuklenirken trigger'lari
  # ve FK kontrollerini susturur; 48 birbirine bagli tablo aksi halde
  # sadece sıralama yuzunden patlar.
  #
  # Dosyalar BIRLESTIRILIP stdin'den veriliyor: Docker'a klasor baglamak
  # Windows yol donusumu yuzunden kirilgan, bu yol o sorunu atlar.
  # --single-transaction: hata olursa HICBIR SEY yazilmaz.
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
        --dbname "$YENI_DB_URL" || return 1
  echo "   $(sure $t)"

  echo
  echo "════════════════════════════════════════════════"
  echo "KURU PROVA BITTI — toplam $(sure $T0)"
  echo "Site hala ESKI projede. Hicbir sey degismedi."
  echo "════════════════════════════════════════════════"
}

main 2>&1 | maskele
exit "${PIPESTATUS[0]}"
