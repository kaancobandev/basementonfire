import { NextResponse } from 'next/server';
import { haftalikLig, weekStartTR } from '@/lib/lig';

/**
 * Haftalık ligin CANLI hâli — akıştaki widget için.
 *
 * ⚠ ÖNBELLEKSİZ, bilerek. `/lig` sayfası 5 dakikalık `unstable_cache` ile
 * çalışıyor ve orası doğru: kişiye özel veri yok, sayfa CDN'den dönüyor.
 * Ama widget'ın işi CEVAPTAN HEMEN SONRA yeni sırayı göstermek — 5 dakika
 * beklerse satır hiç kaymaz ve animasyonun anlatacağı bir şey kalmaz.
 *
 * Sıralama mantığı burada DEĞİL, lib/lig.ts'te: iki yüzey aynı kullanıcıya
 * farklı sıra göstermesin.
 *
 * Kimlik gerekmiyor — tablo herkese aynı. Widget'ın "sen" vurgusu istemcide,
 * NavUserContext'ten geliyor.
 */
export const dynamic = 'force-dynamic';

export async function GET() {
  const rows = await haftalikLig(weekStartTR());
  return NextResponse.json(
    { rows },
    // Kenar ya da tarayıcı bunu SAKLAMAMALI: her istek taze sıra demek.
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
