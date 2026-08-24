# Kharcha — SMS-based Expense Tracker (Pakistan)

Yeh poora project do parts mein hai:
- `backend/` — Node.js + Express + MongoDB API
- `mobile/` — React Native (Expo) app jo Play Store pe jayegi

**Approach:** App koi risky SMS permission nahi maangti. User apne bank/wallet ka
SMS apne aap Messages app se "Share" kare, hamari app usay parse karke transaction
save kar deti hai (confirm karne ke baad). Ye Google Play policy-safe hai.

---

## Part 1: Backend Setup (khud ke computer pe)

1. Node.js install karein (v18 ya usse upar): https://nodejs.org
2. Free MongoDB database banayein: https://www.mongodb.com/cloud/atlas (free tier kaafi hai)
   - Cluster banayein, "Connect" → "Connect your application" se connection string copy karein
3. Terminal mein:
   ```bash
   cd backend
   npm install
   cp .env.example .env
   ```
4. `.env` file open karke apna `MONGO_URI` paste karein aur `JWT_SECRET` mein koi bhi
   random lambi string daal dein (jaise `kharcha_super_secret_2026_xyz`)
5. Local test ke liye:
   ```bash
   npm run dev
   ```
   Browser mein `http://localhost:5000` khol kar dekhein — `{"status":"Kharcha API running"}` dikhna chahiye.

### Backend ko internet pe deploy karna (zaroori hai — phone se localhost accessible nahi hoga)

Free options:
- **Render.com** (recommended, free tier): GitHub pe code push karein, Render pe "New Web Service"
  banayein, repo connect karein, environment variables (`MONGO_URI`, `JWT_SECRET`) daal dein, deploy karein.
- **Railway.app** — similar process.

Deploy hone ke baad aapko ek URL milega jaise `https://kharcha-api.onrender.com`.

---

## Part 2: Mobile App Setup

1. `mobile/services/api.js` file kholein, `BASE_URL` ko apne deployed backend URL se replace karein:
   ```js
   export const BASE_URL = "https://kharcha-api.onrender.com/api";
   ```
2. Terminal mein:
   ```bash
   cd mobile
   npm install
   ```
3. Expo account banayein (free): https://expo.dev/signup
4. EAS CLI install karein:
   ```bash
   npm install -g eas-cli
   eas login
   ```

### Testing karna (development build zaroori hai)

**Important:** `expo-share-intent` (jo Share feature ke liye chahiye) Expo Go app mein
kaam nahi karta — isay test karne ke liye "development build" banani padegi:

```bash
eas build --profile development --platform android
```

Ye cloud pe build hoga (aapke computer pe Android Studio install karne ki zaroorat
nahi), aur ek `.apk` link milega jo aap apne phone pe install karke test kar sakte hain.

---

## Part 3: Play Store ke liye Production Build

1. `mobile/app.json` mein `android.package` ko unique rakhein (jaise `com.talha.kharcha`) —
   ye ek baar set hone ke baad badla nahi ja sakta.
2. App icon aur splash screen `mobile/assets/` folder mein daalein (1024x1024 icon.png,
   adaptive-icon.png waghera — Expo docs follow karein: https://docs.expo.dev/develop/user-interface/app-icons/)
3. Production build banayein:
   ```bash
   eas build --profile production --platform android
   ```
4. Ye ek `.aab` file dega (Android App Bundle) — yehi file Play Store pe upload hoti hai.

---

## Part 4: Google Play Console pe Upload

1. Google Play Console account banayein: https://play.google.com/console (one-time $25 fee)
2. "Create app" → naam, category (Finance), free/paid select karein
3. **Privacy Policy zaroori hai** kyunki app financial data handle karti hai —
   ek simple privacy policy page bana kar (Google "free privacy policy generator" se) uska
   URL Play Console mein daalein
4. Store listing complete karein: screenshots (phone se le sakte hain), short description,
   full description, feature graphic
5. Content rating questionnaire fill karein
6. Data Safety section mein batayein ke app kaunsa data collect karti hai (email, financial
   transactions) aur kyun
7. `.aab` file "Production" ya pehle "Internal Testing" track mein upload karein
   (Internal Testing se pehle khud aur dost test kar sakte hain launch se pehle)
8. Submit for review — Google ka review 1-7 din leta hai

---

## Achi Reviews/Downloads ke liye reminders

- Pehle "Internal Testing" track pe apne 5-10 dost/classmates se test karwayein, bugs fix karein
- Onboarding smooth rakhein — sign up ke foran baad "Share ek SMS karke dekhein" wala demo dikhayein
- Play Store listing mein clearly likhein ke app SMS "read" nahi karti, sirf jo aap manually
  share karte hain wahi process hoti hai — ye trust banata hai
- 7 din consistent use ke baad in-app review prompt dikhayein (random time pe mat mangein)

---

## Project Structure

```
kharcha-app/
├── backend/
│   ├── config/db.js
│   ├── models/User.js, Transaction.js
│   ├── routes/auth.js, transactions.js
│   ├── middleware/auth.js
│   ├── utils/smsParser.js       ← SMS parsing/categorization logic (customize here)
│   └── server.js
└── mobile/
    ├── screens/                  ← Login, Register, Home, AddTransaction, TransactionList
    ├── services/api.js           ← Backend API calls
    ├── context/AuthContext.js    ← Login state management
    └── App.js                    ← Navigation setup
```

## Future improvements (jab MVP chal jaye)

- `utils/smsParser.js` mein aur bank SMS formats add karein jaise real samples milein
- Categorization ko AI API (Claude/GPT) se upgrade karein better accuracy ke liye
- Monthly budget alerts (push notifications)
- Charts/graphs add karein (react-native-chart-kit se)
