#!/usr/bin/env bash
# ════════════════════════════════════════════════════════════════════
# GERÇEK KESİM ADIM 0 — Yeni projeyi geri yüklemeye hazır hâle getir.
#
#   bash scripts/goc/sifirla.sh
#
# NE YAPAR: kuru provanın bıraktığı veriyi siler, AMA proje ayarlarını
# (extension'lar, SMTP, Auth şablonları, yükleme limiti, bucket'lar)
# olduğu gibi bırakır. Kullanıcının seçtiği yol buydu: yeni proje silinip
# baştan açılsa o ayarların hepsi yeniden kurulacak ve her biri yeni bir
# hata ihtimali olacaktı.
#
# ⚠ YALNIZCA YENİ PROJEDE ÇALIŞIR. Eski projeye bağlanmaz, dokunmaz.
#
# ── ÜÇ ŞEMA, ÜÇ FARKLI MUAMELE ────────────────────────────────────
# Döküm üç şemayı da taşıyor (ölçüldü: auth 22 tablo, public 49,
# storage 5 = 76 COPY), yani üçü de temizlenmeli yoksa geri yükleme
# birincil anahtar çakışmasıyla düşer.
#
#   public  → DROP SCHEMA CASCADE + yeniden yarat.
#             ⚠ schema.sql `CREATE SCHEMA public` İÇERMİYOR (ölçüldü) —
#             yani drop'tan sonra şemayı ve yetkilerini ELLE kurmak
#             zorunludur, yoksa geri yükleme "schema does not exist"
#             ile patlar. Yetkiler eski projeden okundu (nspacl).
#
#   auth    → yapı KORUNUR (Supabase yönetiyor), yalnız veri silinir.
#   storage → aynı.
#
# ⚠⚠ TEMİZLENECEK TABLO LİSTESİ data.sql'DEN ÜRETİLİR, elle yazılmaz.
# Sebep: `auth.schema_migrations` gibi dökümde OLMAYAN tablolara
# dokunmak GoTrue'yu bozar. Dökümde ne varsa tam olarak o temizlenir —
# liste kendini dökümle senkron tutar.
#
# ⚠ storage.objects meta verisi silinir ama DOSYALAR S3'te KALIR:
# SQL ile satır silmek nesneyi silmez. Bu bilinçli — 119 dosya zaten
# kopyalandı ve indirme testinden geçti, tekrar kopyalamaya gerek yok.
# ════════════════════════════════════════════════════════════════════
set -uo pipefail

CIKTI="goc-dokum"
ENVDOSYA="$CIKTI/baglanti.env"
DATA="$CIKTI/data.sql"

[[ -f "$ENVDOSYA" ]] || { echo "HATA: $ENVDOSYA yok" >&2; exit 1; }
[[ -f "$DATA" ]]     || { echo "HATA: $DATA yok — once kuru-prova.sh calistir" >&2; exit 1; }

set -a; source "$ENVDOSYA"; set +a
: "${YENI_DB_URL:?YENI_DB_URL yok}"

p_al() { sed -E 's#^[^:]+://[^:]+:([^@]+)@.*#\1#' <<<"$1"; }
P2=$(p_al "$YENI_DB_URL")
maskele() { if [[ -n "$P2" ]]; then sed -e "s|$P2|***|g"; else cat; fi; }

# ── Dokumdeki auth/storage tablolarini cikar ───────────────────────
TABLOLAR=$(grep -oE '^COPY "(auth|storage)"\."[a-zA-Z_0-9]+"' "$DATA" \
           | sed 's/^COPY //' | sort -u | tr '\n' ',' | sed 's/,$//')

if [[ -z "$TABLOLAR" ]]; then
  echo "HATA: data.sql icinde auth/storage tablosu bulunamadi" >&2; exit 1
fi

echo "── Temizlenecek auth/storage tablolari:"
echo "$TABLOLAR" | tr ',' '\n' | sed 's/^/     /'
echo

SQL=$(cat <<EOSQL
begin;

-- Trigger'lari sustur: storage'daki protect_objects_delete /
-- protect_buckets_delete silmeyi engelleyebilir.
set session_replication_role = replica;

-- auth + storage: yapiyi koru, veriyi sil.
truncate table $TABLOLAR restart identity cascade;

-- public: komple sifirla.
drop schema public cascade;
create schema public;

-- Yetkiler eski projeden okundu:
--   pg_database_owner=UC | =U | postgres=U | anon=U | authenticated=U | service_role=U
alter schema public owner to pg_database_owner;
grant usage on schema public to public;
grant usage on schema public to postgres, anon, authenticated, service_role;

set session_replication_role = default;

commit;

select 'public tablo: '||count(*) from pg_tables where schemaname='public';
select 'auth.users  : '||count(*) from auth.users;
select 'storage.obj : '||count(*) from storage.objects;
EOSQL
)

echo "── Sifirlaniyor (tek transaction)"
docker run --rm -i postgres:17 psql -v ON_ERROR_STOP=1 -q "$YENI_DB_URL" <<<"$SQL" 2>&1 | maskele
kod=${PIPESTATUS[0]}

if [[ $kod -ne 0 ]]; then
  echo "✗ SIFIRLAMA BASARISIZ — hicbir sey degismedi (transaction geri sarildi)" >&2
  exit $kod
fi

echo
echo "✓ Sifirlandi. Dosyalar S3'te DURUYOR (yalniz meta veri silindi)."
echo "  Sirada: bash scripts/goc/kuru-prova.sh  (taze dokum + geri yukleme)"
