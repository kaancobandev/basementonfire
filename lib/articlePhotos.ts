// OTOMATİK ÜRETİLDİ — elle düzenleme. Kaynak: public/articles/<slug>/ tarandı.
// Paylaşım stüdyosu (CarouselStudio) hangi fotoğrafların var olduğunu build'de
// bilemez; bu manifest onu istemciye taşır. Yeni görsel eklenince yeniden üret:
//   node scripts/gen-article-photos.cjs   (aşağıdaki mantık)
export const ARTICLE_PHOTOS: Record<string, string[]> = {
  "arcade": [
    "/articles/arcade/donkey-kong-kabin.webp",
    "/articles/arcade/miyamoto-portre.webp",
    "/articles/arcade/oyun-salonu.webp",
    "/articles/arcade/pacman-kabin.webp",
    "/articles/arcade/pong-kabin.webp",
    "/articles/arcade/spacewar-pdp1.webp",
    "/articles/arcade/tennis-for-two-osiloskop.webp",
    "/articles/arcade/toru-iwatani-portre.webp"
  ],
  "augustus": [
    "/articles/augustus/actium-savasi.webp",
    "/articles/augustus/agrippa-portre.webp",
    "/articles/augustus/ankara-augustus-tapinagi.webp",
    "/articles/augustus/ara-pacis.webp",
    "/articles/augustus/augustus-pontifex.webp",
    "/articles/augustus/cicero-portre.webp",
    "/articles/augustus/kalkriese-maskesi.webp",
    "/articles/augustus/res-gestae-yaziti.webp"
  ],
  "ayna-noronlari": [
    "/articles/ayna-noronlari/esneyen-kadin.webp",
    "/articles/ayna-noronlari/f5-premotor-korteks.webp",
    "/articles/ayna-noronlari/heyes-portre.webp",
    "/articles/ayna-noronlari/makak-maymunu.webp",
    "/articles/ayna-noronlari/parma-universitesi.webp",
    "/articles/ayna-noronlari/ramachandran-portre.webp",
    "/articles/ayna-noronlari/rizzolatti-portre.webp"
  ],
  "bagirsak": [
    "/articles/bagirsak/bagirsak-kolonizasyon.webp",
    "/articles/bagirsak/damasio-portre.webp",
    "/articles/bagirsak/e-coli-mikrograf.webp",
    "/articles/bagirsak/kefir-fermente.webp",
    "/articles/bagirsak/laboratuvar-faresi.webp",
    "/articles/bagirsak/miyenterik-pleksus.webp",
    "/articles/bagirsak/serotonin-molekul.webp",
    "/articles/bagirsak/vagus-uyarimi.webp"
  ],
  "bakteriyofaj": [
    "/articles/bakteriyofaj/acinetobacter-sem.webp",
    "/articles/bakteriyofaj/dherelle-portre.webp",
    "/articles/bakteriyofaj/doudna-charpentier.webp",
    "/articles/bakteriyofaj/eliava-enstitusu.webp",
    "/articles/bakteriyofaj/eliava-portre.webp",
    "/articles/bakteriyofaj/faj-ilani.webp",
    "/articles/bakteriyofaj/t4-elektron-mikrograf.webp",
    "/articles/bakteriyofaj/twort-portre.webp"
  ],
  "bilgisayar": [
    "/articles/bilgisayar/anakart.webp",
    "/articles/bilgisayar/cpu-islemci.webp",
    "/articles/bilgisayar/ddr5-bellek.webp",
    "/articles/bilgisayar/gpu-ekran-karti.webp",
    "/articles/bilgisayar/hdd-ic-yapisi.webp",
    "/articles/bilgisayar/ilk-bug-guve.webp",
    "/articles/bilgisayar/ilk-transistor-replika.webp",
    "/articles/bilgisayar/kuvars-kristali.webp"
  ],
  "black-hole": [
    "/articles/black-hole/cygnus-x1.webp",
    "/articles/black-hole/dunya-mavi-bilye.webp",
    "/articles/black-hole/hawking-portre.webp",
    "/articles/black-hole/m87-ilk-fotograf.webp",
    "/articles/black-hole/sagittarius-a.webp",
    "/articles/black-hole/spagettilesme.webp",
    "/articles/black-hole/toplanma-diski.webp",
    "/articles/black-hole/yengec-bulutsusu.webp"
  ],
  "carthage": [
    "/articles/carthage/antonine-hamamlari.webp",
    "/articles/carthage/byrsa-tepesi.webp",
    "/articles/carthage/deniz-mahmuzu.webp",
    "/articles/carthage/hannibal-fil-alpler.webp",
    "/articles/carthage/ports-punik.webp",
    "/articles/carthage/tanit-steli.webp",
    "/articles/carthage/tophet-alani.webp"
  ],
  "cift-yarik": [
    "/articles/cift-yarik/c60-buckyball.webp",
    "/articles/cift-yarik/dalga-havuzu.webp",
    "/articles/cift-yarik/de-broglie-portre.webp",
    "/articles/cift-yarik/feynman-portre.webp",
    "/articles/cift-yarik/girisim-seritleri.webp",
    "/articles/cift-yarik/thomas-young-portre.webp",
    "/articles/cift-yarik/tonomura-elektron-birikimi.webp"
  ],
  "dogal-secilim": [
    "/articles/dogal-secilim/antibiyotik-direnci.webp",
    "/articles/dogal-secilim/biber-guvesi.webp",
    "/articles/dogal-secilim/darwin-portre.webp",
    "/articles/dogal-secilim/ispinoz-gagalari.webp",
    "/articles/dogal-secilim/orak-hucre.webp",
    "/articles/dogal-secilim/tavus-kusu.webp",
    "/articles/dogal-secilim/turlerin-kokeni-kapak.webp",
    "/articles/dogal-secilim/wallace-portre.webp"
  ],
  "doppler": [
    "/articles/doppler/51-pegasi-b.webp",
    "/articles/doppler/buys-ballot.webp",
    "/articles/doppler/christian-doppler.webp",
    "/articles/doppler/doppler-radari.webp",
    "/articles/doppler/doppler-ultrason.webp",
    "/articles/doppler/edwin-hubble.webp",
    "/articles/doppler/radar-tabancasi.webp",
    "/articles/doppler/ses-patlamasi.webp"
  ],
  "dunya": [
    "/articles/dunya/apollo-ay-kayasi.webp",
    "/articles/dunya/ay-yakin-yuz.webp",
    "/articles/dunya/gezegenimsi-disk.webp",
    "/articles/dunya/hadeyan-erimis-dunya.webp",
    "/articles/dunya/kutup-isiklari.webp",
    "/articles/dunya/mars-kuresi.webp",
    "/articles/dunya/mavi-bilye.webp",
    "/articles/dunya/venus-kuresi.webp"
  ],
  "einstein-rosen": [
    "/articles/einstein-rosen/einstein-carmigi.webp",
    "/articles/einstein-rosen/einstein-portre.webp",
    "/articles/einstein-rosen/hawking-portre.webp",
    "/articles/einstein-rosen/kip-thorne.webp",
    "/articles/einstein-rosen/m87-kara-delik.webp",
    "/articles/einstein-rosen/nasa-solucan-deligi.webp",
    "/articles/einstein-rosen/schwarzschild-portre.webp",
    "/articles/einstein-rosen/wheeler-portre.webp"
  ],
  "ekonomi": [
    "/articles/ekonomi/altin-kulce.webp",
    "/articles/ekonomi/benzin-krizi-1974.webp",
    "/articles/ekonomi/boga-ayi-heykeli.webp",
    "/articles/ekonomi/borsa-cokusu-1929.webp",
    "/articles/ekonomi/borsa-salonu.webp",
    "/articles/ekonomi/doviz-banknot.webp",
    "/articles/ekonomi/enflasyon-banknot-1923.webp",
    "/articles/ekonomi/merkez-banka-fed.webp"
  ],
  "endosimbiyoz": [
    "/articles/endosimbiyoz/asgard-arkesi.webp",
    "/articles/endosimbiyoz/braarudosphaera.webp",
    "/articles/endosimbiyoz/kloroplast.webp",
    "/articles/endosimbiyoz/lynn-margulis.webp",
    "/articles/endosimbiyoz/mercan-zooksantella.webp",
    "/articles/endosimbiyoz/mereschkowski.webp",
    "/articles/endosimbiyoz/mitokondri-tem.webp",
    "/articles/endosimbiyoz/nick-lane.webp"
  ],
  "fatih": [
    "/articles/fatih/ayasofya.jpg",
    "/articles/fatih/bellini-portre.jpg",
    "/articles/fatih/gemileri-karadan-yurutmek.jpg",
    "/articles/fatih/istanbulun-fethi.jpg",
    "/articles/fatih/otranto-map-image.jpg",
    "/articles/fatih/rumeli-hisari.jpg",
    "/articles/fatih/sahi-top.png",
    "/articles/fatih/sahni-seman.webp",
    "/articles/fatih/theodosius-surlari.jpg",
    "/articles/fatih/truva-akhilleus.png"
  ],
  "fizik-101": [
    "/articles/fizik-101/ayda-astronot.webp",
    "/articles/fizik-101/hiz-treni.webp",
    "/articles/fizik-101/newton-besigi.webp",
    "/articles/fizik-101/newton-portre.webp",
    "/articles/fizik-101/principia-kapak.webp",
    "/articles/fizik-101/roket-firlatma.webp",
    "/articles/fizik-101/surtunme-kibrit.webp",
    "/articles/fizik-101/uzayda-agirliksizlik.webp"
  ],
  "greece": [
    "/articles/greece/akropolis-panorama.webp",
    "/articles/greece/athena-varvakeion.webp",
    "/articles/greece/iskender-mozaik.webp",
    "/articles/greece/olimpiya-stadyum.webp",
    "/articles/greece/panathenaia-kosu.webp",
    "/articles/greece/parthenon-atina.webp",
    "/articles/greece/sparta-hoplit.webp",
    "/articles/greece/zeus-artemision.webp"
  ],
  "internet": [
    "/articles/internet/ag-karti.webp",
    "/articles/internet/baz-istasyonu.webp",
    "/articles/internet/ethernet-switch.webp",
    "/articles/internet/ev-router.webp",
    "/articles/internet/fiber-optik-kablo.webp",
    "/articles/internet/ixp-anahtar-rafi.webp",
    "/articles/internet/veri-merkezi.webp"
  ],
  "kaligrafi": [
    "/articles/kaligrafi/dort-hazine.webp",
    "/articles/kaligrafi/gutenberg-incil.webp",
    "/articles/kaligrafi/hafiz-osman-hilye.webp",
    "/articles/kaligrafi/kells-chi-rho.webp",
    "/articles/kaligrafi/kufi-kuran.webp",
    "/articles/kaligrafi/lantingji-xu.webp",
    "/articles/kaligrafi/seyh-hamdullah-murakka.webp",
    "/articles/kaligrafi/suleyman-tugra.webp"
  ],
  "kuantum-olumsuzlugu": [
    "/articles/kuantum-olumsuzlugu/cift-yarik-tonomura.webp",
    "/articles/kuantum-olumsuzlugu/mobius-heykeli.webp",
    "/articles/kuantum-olumsuzlugu/schrodinger-mezari.webp",
    "/articles/kuantum-olumsuzlugu/schrodinger-portre.webp",
    "/articles/kuantum-olumsuzlugu/solvay-1927.webp",
    "/articles/kuantum-olumsuzlugu/tegmark-portre.webp"
  ],
  "mol": [
    "/articles/mol/altin-kulcesi.webp",
    "/articles/mol/avogadro-portre.webp",
    "/articles/mol/cannizzaro-portre.webp",
    "/articles/mol/kilogram-prototipi.webp",
    "/articles/mol/periyodik-tablo.webp",
    "/articles/mol/perrin-gamboge-deneyi.webp",
    "/articles/mol/perrin-portre.webp",
    "/articles/mol/silikon-28-kuresi.webp"
  ],
  "newton": [
    "/articles/newton/guney-denizi-balonu.webp",
    "/articles/newton/leibniz-portre.webp",
    "/articles/newton/newton-aniti-westminster.webp",
    "/articles/newton/newton-portre.webp",
    "/articles/newton/newton-teleskobu.webp",
    "/articles/newton/principia-kapak.webp",
    "/articles/newton/prizma-isik-ayrisimi.webp",
    "/articles/newton/woolsthorpe-elma-agaci.webp"
  ],
  "pirus": [
    "/articles/pirus/ambracia-apollon.webp",
    "/articles/pirus/appius-kineas.webp",
    "/articles/pirus/argos-tiyatro.webp",
    "/articles/pirus/dodona-tiyatro.webp",
    "/articles/pirus/iskender-bust.webp",
    "/articles/pirus/pirus-portre.webp",
    "/articles/pirus/savas-filleri.webp"
  ],
  "radyoaktivite": [
    "/articles/radyoaktivite/becquerel-plaka.webp",
    "/articles/radyoaktivite/becquerel-portre.webp",
    "/articles/radyoaktivite/bulut-odasi-alfa.webp",
    "/articles/radyoaktivite/curie-defterleri.webp",
    "/articles/radyoaktivite/curie-laboratuvar.webp",
    "/articles/radyoaktivite/plutonyum-238-pelet.webp",
    "/articles/radyoaktivite/radithor-sise.webp",
    "/articles/radyoaktivite/radyum-kizlari.webp"
  ],
  "rome": [
    "/articles/rome/augustus-prima-porta.webp",
    "/articles/rome/caesar-portre.webp",
    "/articles/rome/forum-romanum.webp",
    "/articles/rome/kapitol-kurdu.webp",
    "/articles/rome/kolezyum.webp",
    "/articles/rome/pantheon-kubbe.webp",
    "/articles/rome/pont-du-gard.webp",
    "/articles/rome/senato-cicero.webp",
    "/articles/rome/via-appia.webp"
  ],
  "sanat-akimlari": [
    "/articles/sanat-akimlari/goya-3-mayis.webp",
    "/articles/sanat-akimlari/hokusai-buyuk-dalga.webp",
    "/articles/sanat-akimlari/horatiuslar-yemini.webp",
    "/articles/sanat-akimlari/kaplumbaga-terbiyecisi.webp",
    "/articles/sanat-akimlari/las-meninas.webp",
    "/articles/sanat-akimlari/malevic-siyah-kare.webp",
    "/articles/sanat-akimlari/monet-izlenim.webp"
  ],
  "sezar": [
    "/articles/sezar/caesar-tusculum.webp",
    "/articles/sezar/cinayet-yeri.webp",
    "/articles/sezar/dictator-perpetuo-sikke.webp",
    "/articles/sezar/eid-mar-sikkesi.webp",
    "/articles/sezar/pompeius-bust.webp",
    "/articles/sezar/rubicon-deresi.webp",
    "/articles/sezar/sezarin-olumu.webp",
    "/articles/sezar/vercingetorix-teslim.webp"
  ],
  "takyon": [
    "/articles/takyon/ay-lazer-olcumu.webp",
    "/articles/takyon/cherenkov-mavi-parilti.webp",
    "/articles/takyon/cngs-notrino-tuneli.webp",
    "/articles/takyon/einstein-patent-ofisi.webp",
    "/articles/takyon/gargamelle-notrino-izi.webp",
    "/articles/takyon/hubble-derin-alan.webp",
    "/articles/takyon/opera-dedektoru.webp",
    "/articles/takyon/ses-bariyeri-koni.webp"
  ],
  "tardigrad": [
    "/articles/tardigrad/aktif-tun-karsilastirma.webp",
    "/articles/tardigrad/beresheet-carpma-noktasi.webp",
    "/articles/tardigrad/beresheet-uzay-araci.webp",
    "/articles/tardigrad/goeze-portre.webp",
    "/articles/tardigrad/spallanzani-portre.webp",
    "/articles/tardigrad/tardigrad-mikroskop.webp",
    "/articles/tardigrad/tardigrad-sem-aktif.webp",
    "/articles/tardigrad/tun-hali-sem.webp"
  ],
  "tibbi": [
    "/articles/tibbi/eter-ilk-ameliyat.webp",
    "/articles/tibbi/fleming-penisilin.webp",
    "/articles/tibbi/imhotep-heykeli.webp",
    "/articles/tibbi/jenner-ilk-asi.webp",
    "/articles/tibbi/leeuwenhoek-mikroskop.webp",
    "/articles/tibbi/phineas-gage.webp",
    "/articles/tibbi/snow-kolera-haritasi.webp",
    "/articles/tibbi/trepanasyon-kafatasi.webp"
  ],
  "turkler": [
    "/articles/turkler/ataturk-harf-devrimi.webp",
    "/articles/turkler/attila-hunlar.webp",
    "/articles/turkler/bilge-kagan-yaziti.webp",
    "/articles/turkler/bozkurt.webp",
    "/articles/turkler/cin-seddi.webp",
    "/articles/turkler/fatih-portre.webp",
    "/articles/turkler/kultigin-basi.webp",
    "/articles/turkler/malazgirt.webp"
  ]
};
