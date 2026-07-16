'use client';

// "ÖLÇ" fiilinin CANLI kanıtı — dört fiilden biri iddiadan KANITA terfi eder.
// Sabit uydurma değil: app/articles/radyoaktivite/data.ts → potasyum-40 (62) +
// karbon-14 (41) + eser (9) = 112 Bq/kg. Türetimi ve kaynağı makalede duruyor.
//
// Etiket "Vücut ağırlığı", "Kaç kilosun?" DEĞİL: tanımadığı bir sitenin ikinci
// şahıs suçlayıcı sorusu sürtünme yaratır; nötr fizik parametresi yaratmaz.
// Varsayılan 70'te sonuç zaten görünür → kimse bir şey girmek zorunda değil.
// Native <input type=range>: ~1KB, bedava a11y + klavye + dokunma, animasyonsuz
// → reduced-motion'da tam işlevli kalır (kanıt animasyona değil etkileşime dayanıyor).

import { useState } from 'react';
import { tr } from '@/lib/format';
import { BQ_PER_KG } from '@/lib/landing';
import s from '../../landing.module.css';

export default function RadioMeter() {
  const [kg, setKg] = useState(70);

  return (
    <div className={s.meterBox}>
      <div className={s.meterRow}>
        <label htmlFor="lp-kg">Vücut ağırlığı</label>
        <input
          id="lp-kg"
          type="range"
          min={35}
          max={140}
          step={1}
          value={kg}
          onChange={(e) => setKg(Number(e.target.value))}
        />
        <span className={s.meterKg}>{kg} kg</span>
      </div>
      <div className={s.meterBq}>{tr(kg * BQ_PER_KG)}</div>
      <p className={s.meterCap}>
        kez radyoaktif bozunma yapıyorsun — her saniye.
        <br />
        {BQ_PER_KG} Bq/kg — potasyum-40 (62) + karbon-14 (41) + eser (9). Hesap tarayıcında; hiçbir yere gitmiyor.
      </p>
    </div>
  );
}
