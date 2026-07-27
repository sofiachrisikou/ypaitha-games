# Υπαίθρια Παιχνίδια (ypaitha-games)

Δύο εκπαιδευτικά touchscreen παιχνίδια για εκθεσιακό περίπτερο.
Κάθετη οθόνη **portrait 1080×1920**, μόνο touch, μεγάλα κουμπιά.

## Τεχνολογίες
- React 18 + Vite
- react-router-dom (routing)
- IndexedDB (τοπική αποθήκευση ψήφων, offline-first)
- Firebase Firestore (προαιρετικός συγχρονισμός)

## Εγκατάσταση & εκτέλεση

```bash
npm install
npm run dev
```

Άνοιξε τη διεύθυνση που τυπώνει το Vite (π.χ. http://localhost:5173).
Ο καμβάς είναι πάντα 1080×1920 και κλιμακώνεται για να χωρέσει στην οθόνη.
Για την πραγματική εμπειρία περιπτέρου, βάλε το παράθυρο full-screen σε
κάθετη οθόνη 1080×1920.

Για build παραγωγής:

```bash
npm run build
npm run preview
```

## Δομή
```
src/
├── assets/            # foods (SVG), characters (.riv), sounds
├── components/        # κοινά: Stage, BigButton, ScoreBar, IdleReset, RatingScreen
├── screens/           # Home, Stats
├── games/
│   ├── evzoulis/      # placeholder "σύντομα" (του Άλεξ)
│   └── healthy-hero/  # Αποστολή 1 πλήρης + missions 2/3 placeholders
│       ├── missions/
│       └── data/foods.js
├── hooks/             # useIdleReset
├── services/          # db (IndexedDB), firebase, votes
└── styles/global.css
```

## Χαρακτηριστικά
- **Homepage**: δύο μεγάλες κάρτες (Healthy Hero γαλάζιο/πράσινο, Ευζούλης πορτοκαλί/πράσινο).
- **Healthy Hero – Αποστολή 1** «Γέμισε το σωστό πιάτο»: drag & drop με το δάχτυλο,
  υγιεινά → πράσινη λάμψη + πόντοι, ανθυγιεινά → κοκκινίζουν/κουνιούνται/γυρνάνε πίσω.
  Στα 5 υγιεινά → επιβράβευση.
- **Idle reset**: 20 δευτ. αδράνειας → επιστροφή στο homepage.
- **RatingScreen**: στο τέλος κάθε παιχνιδιού, 4 φατσούλες (1–4). Ψήφος σε IndexedDB
  + συγχρονισμός σε Firebase όταν υπάρχει σύνδεση. 15 δευτ. χωρίς ψήφο → επιστροφή.
- **/stats** (κρυφή σελίδα): σύνολο ψήφων & μέσος όρος ανά παιχνίδι. Πρόσβαση από
  το αόρατο hotspot στην κάτω-αριστερή γωνία του homepage.

## Firebase (προαιρετικό)
Αντίγραψε το `.env.example` σε `.env.local` και συμπλήρωσε τα κλειδιά.
Χωρίς αυτά, το app δουλεύει κανονικά offline μόνο με IndexedDB.
```
