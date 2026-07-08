# H+ Demo

H+ klinika platformasi demo loyihasi. Bitta Vite/React codebase ichida ikkita alohida ko'rinish bor:

- Patient app: bemor uchun mobil ilova ko'rinishi
- Clinic app: klinika/admin paneli

## Local Ishga Tushirish

```bash
npm install
npm run dev
```

Default holatda patient app ochiladi:

```text
http://localhost:5173/patient
```

Clinic panel:

```text
http://localhost:5173/clinic
```

## Vercel Deploy

Vercel'da shu repo'dan ikkita alohida project yarating.

### 1. Patient App

- Repository: `sharqmovie/Hplus-demo`
- Framework Preset: `Vite`
- Root Directory: `./`
- Build Command: `npm run build`
- Output Directory: `dist`
- Environment Variables:
  - `VITE_APP_TARGET=patient`

Project name misol:

```text
hplus-patient
```

### 2. Clinic App

- Repository: `sharqmovie/Hplus-demo`
- Framework Preset: `Vite`
- Root Directory: `./`
- Build Command: `npm run build`
- Output Directory: `dist`
- Environment Variables:
  - `VITE_APP_TARGET=clinic`

Project name misol:

```text
hplus-clinic
```

`VITE_APP_TARGET=clinic` qo'yilgan project root sahifada klinika panelini ochadi. `VITE_APP_TARGET=patient` yoki env bo'sh bo'lsa patient app ochiladi.
