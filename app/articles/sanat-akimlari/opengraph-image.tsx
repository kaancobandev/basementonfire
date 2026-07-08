import { articleOgImage, OG_SIZE } from '@/lib/og';

export const alt = "Sanat Akımları: Rönesans'tan Bugüne · Basements";
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function Image() {
  return articleOgImage({
    title: 'Sanat Akımları',
    subtitle: "Rönesans'tan yapay zekâya — 60+ akım, aranabilir harita",
    accent: '#e11d48',
    gradient: 'linear-gradient(135deg, #140310 0%, #6b0f2a 55%, #e11d48 100%)',
  });
}
