import GonderiForm from './GonderiForm';

// ESKİDEN dinamikti: getMe()+redirect middleware PROTECTED'ta zaten var (ölü
// kod). ?error= parametresini buraya gönderen hiçbir yer yok (form hataları
// istemcide state ile gösteriliyor) → parametre de kaldırıldı, sayfa statik.
export default function GonderiOlusturPage() {
  return <GonderiForm />;
}
