# Kharcha — SMS-based Expense Tracker (Pakistan)

This project has two parts:
- `backend/` — Node.js + Express + MongoDB API
- `mobile/` — React Native (Expo) app that will be published on the Play Store

**Approach:** The app does not ask for any risky SMS permission. The user shares their
bank/wallet SMS themselves from the Messages app using "Share", and our app parses it and
saves the transaction (after the user confirms). This is compliant with Google Play policy.

---

## Part 1: Backend Setup (on your own computer)

1. Install Node.js (v18 or above): https://nodejs.org
2. Create a free MongoDB database: https://www.mongodb.com/cloud/atlas (the free tier is enough)
   - Create a cluster, then copy the connection string from "Connect" → "Connect your application"
3. In the terminal:
   ```bash
   cd backend
   npm install
   cp .env.example .env
   ```
4. Open the `.env` file and paste your `MONGO_URI`, and put any long random string in
   `JWT_SECRET` (for example `kharcha_super_secret_2026_xyz`)
5. To test locally:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5000` in your browser — you should see `{"status":"Kharcha API running"}`.

### Deploying the backend to the internet (required — localhost is not reachable from your phone)

Free options:
- **Render.com** (recommended, free tier): Push your code to GitHub, create a "New Web Service"
  on Render, connect your repo, add the environment variables (`MONGO_URI`, `JWT_SECRET`), and deploy.
- **Railway.app** — similar process.

After deployment you will get a URL like `https://kharcha-api.onrender.com`.

---

## Part 2: Mobile App Setup

1. Open the `mobile/services/api.js` file and replace `BASE_URL` with your deployed backend URL:
   ```js
   export const BASE_URL = "https://kharcha-api.onrender.com/api";
   ```
2. In the terminal:
   ```bash
   cd mobile
   npm install
   ```
3. Create an Expo account (free): https://expo.dev/signup
4. Install the EAS CLI:
   ```bash
   npm install -g eas-cli
   eas login
   ```

### Testing (a development build is required)

**Important:** `expo-share-intent` (needed for the Share feature) does not work in the
Expo Go app — to test it you will need to create a "development build":

```bash
eas build --profile development --platform android
```

This builds in the cloud (you don't need to install Android Studio on your computer), and
you will get an `.apk` link that you can install on your phone to test.

---

## Part 3: Production Build for the Play Store

1. Keep `android.package` in `mobile/app.json` unique (for example `com.talha.kharcha`) —
   once it is set, it cannot be changed.
2. Add the app icon and splash screen to the `mobile/assets/` folder (a 1024x1024 icon.png,
   adaptive-icon.png, etc. — follow the Expo docs: https://docs.expo.dev/develop/user-interface/app-icons/)
3. Create the production build:
   ```bash
   eas build --profile production --platform android
   ```
4. This gives you an `.aab` file (Android App Bundle) — this is the file that gets uploaded to the Play Store.

---

## Part 4: Uploading to Google Play Console

1. Create a Google Play Console account: https://play.google.com/console (one-time $25 fee)
2. Click "Create app" → choose a name, category (Finance), and free/paid
3. **A Privacy Policy is required** because the app handles financial data —
   create a simple privacy policy page (search Google for "free privacy policy generator") and
   enter its URL in Play Console
4. Complete the store listing: screenshots (you can take them from your phone), short description,
   full description, feature graphic
5. Fill out the content rating questionnaire
6. In the Data Safety section, state what data the app collects (email, financial
   transactions) and why
7. Upload the `.aab` file to the "Production" track, or to "Internal Testing" first
   (with Internal Testing, you and your friends can test before launch)
8. Submit for review — Google's review takes 1-7 days

---

## Reminders for Good Reviews/Downloads

- First, have 5-10 friends/classmates test on the "Internal Testing" track, and fix the bugs
- Keep onboarding smooth — right after sign-up, show a "Try sharing an SMS" demo
- Clearly state in the Play Store listing that the app does not "read" SMS — it only processes
  what you manually share, which builds trust
- Show the in-app review prompt after 7 days of consistent use (don't ask at a random time)

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

## Future Improvements (once the MVP is running)

- Add more bank SMS formats to `utils/smsParser.js` as real samples become available
- Upgrade categorization with an AI API (Claude/GPT) for better accuracy
- Monthly budget alerts (push notifications)
- Add charts/graphs (using react-native-chart-kit)
