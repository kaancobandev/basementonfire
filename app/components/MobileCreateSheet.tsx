'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

/**
 * Mobil "paylaş" alt sayfası (bottom sheet). AppShell'den ayrı bir dosyada ve
 * next/dynamic(ssr:false) ile yüklenir → framer-motion ANA bundle'dan çıkar,
 * yalnızca giriş yapmış kullanıcıda ayrı bir parça olarak (ilk boyamadan sonra)
 * yüklenir. AnimatePresence burada kalır, böylece sheet kapanırken aşağı kayma
 * (exit) animasyonu korunur.
 */
export default function MobileCreateSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="sheet-bg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, pointerEvents: 'none' }}
          transition={{ duration: 0.18 }}
          style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end' }}
          onClick={onClose}
        >
          <motion.div
            key="sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            onClick={e => e.stopPropagation()}
            className="mc-sheet"
            style={{ width: '100%' }}
          >
            <div className="mc-sheet-handle" />
            <p className="mc-sheet-title">Ne paylaşmak istiyorsun?</p>
            <div className="mc-sheet-options">
              <motion.button whileTap={{ scale: 0.97 }} className="mc-option mc-option--new" type="button" onClick={() => { onClose(); router.push('/makale/yeni'); }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                Makale Yaz
                <span className="mc-badge">Yeni</span>
              </motion.button>
              <motion.button whileTap={{ scale: 0.97 }} className="mc-option" type="button" onClick={() => { onClose(); router.push('/gonderi-olustur'); }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                Fotoğraflı / Videolu Gönderi
              </motion.button>
              <motion.button whileTap={{ scale: 0.97 }} className="mc-option" type="button" onClick={() => { onClose(); router.push('/?story=1'); }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
                Hikaye
              </motion.button>
              <motion.button whileTap={{ scale: 0.97 }} className="mc-option" type="button" onClick={() => { onClose(); router.push('/bilgi-karti'); }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>
                Bilgi Kartı
              </motion.button>
            </div>
            <button className="mc-cancel" type="button" onClick={onClose}>İptal</button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
