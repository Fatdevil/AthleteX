# AthleteX – Smart Training App (Demo)

En superren mobil frontend (Vite + React + TypeScript + Tailwind) som demonstrerar:
- AI‑Coach (chat-overlay)
- Adaptiv onboarding (mål, fitnesstest, utrustning)
- 4‑veckors **personlig plan** (genereras när du trycker **Skapa min plan**)
- Progress‑dashboard (grafer, PR‑brickor, nästa mål)
- Gamification (nivå, XP, badges)
- Socialt flöde + leaderboard

> Den här demon är **helt mockad** på klientsidan – inga backends. Perfekt för GitHub/Vercel‑demo och vidare utveckling.

## 🚀 Kom igång (lokalt)

```bash
# 1) Klona repot
git clone <din-repo-url> athletex-app
cd athletex-app

# 2) Installera
npm install

# 3) Kör dev‑server
npm run dev
# Öppna http://localhost:5173
```

## 🧩 Struktur

```
.
├─ src/
│  ├─ App.tsx        # Hela appen (AI‑coach, onboarding, plan, progress, social)
│  ├─ main.tsx
│  └─ index.css      # Tailwind
├─ index.html
├─ tailwind.config.js
├─ postcss.config.js
├─ vite.config.ts
├─ tsconfig.json
└─ package.json
```

## 🧠 Så funkar planen

- Första gången du öppnar appen visas **onboarding**.
- När du trycker **Skapa min plan** genereras en **4‑veckorsplan (28 dagar)** enligt skissen vi satte:  
  1) Styrka Baslyft, 2) Intervall Rodd, 3) Lätt cykel, 4) Mini‑WOD, 5) Accessory/Core, 6) Mobilitet, 7) Uthållighet.
- Planen sparas i **localStorage**, så den finns kvar vid reload.

## 📦 Pusha till GitHub

```bash
# På din dator i mappen:
git init
git add .
git commit -m "init: AthleteX demo v0.1"
git branch -M main
git remote add origin https://github.com/<ditt-anv>/<ditt-repo>.git
git push -u origin main
```

## ☁️ Deploy till Vercel

1. Skapa ett nytt projekt i Vercel och koppla till ditt GitHub‑repo.
2. Build‑kommando: `npm run build`  
   Output: `dist` (default för Vite)
3. Miljövariabler behövs **inte** för demon.

## 🛠️ Nästa steg

- Koppla verklig träningsdata + backend (ex. Supabase / Firebase).
- Spara loggade pass, PRs och sociala inlägg i databasen.
- Lägg till premium: **hybridcoach** (AI + mänsklig coach).
- Lägg till AR‑teknikcoach (roadmap).

## 📄 Licens

MIT – använd fritt i dina projekt.
