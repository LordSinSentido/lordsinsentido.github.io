# Porfolio — Guía para agentes

## Objetivo
Portafolio single-page en inglés que muestra skills, experiencia, proyectos,
educación y contacto. Datos recuperados desde Cloud Firestore. Desplegado en
GitHub Pages. Sin backend propio.

## Stack (NO cambiar sin aprobación previa)
- Framework: **Astro 7** (static-first, TS nativo) — base path `/porfolio`
- Lenguaje: **TypeScript** estricto
- Estilos: **Tailwind CSS 4** (vía `@tailwindcss/vite`)
- Animaciones: **GSAP + ScrollTrigger** (reveal-on-scroll, stagger en cards)
- Datos: **Cloud Firestore** SDK web, fetch client-side; **Firebase Auth** (email/password)
  protege el CRUD; reglas `read:true` / `write:request.auth != null`
- Hosting: **GitHub Pages** vía GitHub Actions
- Contenido: **inglés**

## Estructura de carpetas
```
porfolio/
├── src/
│   ├── components/
│   │   ├── sections/   # Hero, Skills, Experience, Projects, Education, Contact
│   │   ├── ui/         # SectionTitle, Icon
│   │   └── Nav.astro
│   ├── layouts/Layout.astro
│   ├── pages/
│   │   ├── index.astro
│   │   └── admin.astro # login + CRUD de contenido (protegido por Auth)
│   ├── lib/
│   │   ├── firebase.ts # init app + helpers get/getCollection + write (CRUD)
│   │   ├── admin.ts    # esquemas de colecciones, formularios y helpers CRUD
│   │   ├── data.ts     # carga del portfolio público
│   │   ├── render.ts   # renderizado de secciones
│   │   ├── cards.ts    # card compartida (Projects/Education/Certs)
│   │   ├── badge.ts    # chip/badge compartido con tones (neutral/accent/sage/butter/clay/lavender)
│   │   ├── text.ts     # helpers esc/initials/formatPeriod/withBase
│   │   ├── motion.ts   # reveal-on-scroll (GSAP)
│   │   ├── icons.ts
│   │   └── types.ts    # modelos TypeScript (source of truth)
│   └── styles/global.css
├── seed/
│   ├── seed.mjs        # seed script (firebase-admin, requiere service account)
│   └── serviceAccountKey.json # gitignored, NO commitear
├── public/
├── astro.config.mjs    # site + base: '/porfolio'
├── tsconfig.json
├── firebase.json       # configuración CLI (firestore rules)
├── .env.example        # PUBLIC_FIREBASE_* (config web pública)
├── .github/workflows/deploy.yml
└── firestore.rules
```

## Admin (CRUD) y Auth
- La página **`/porfolio/admin`** (`src/pages/admin.astro`) permite editar todo el contenido
  del sitio (profile, skills, experience, projects, education, certifications) desde
  Cloud Firestore, usando formularios generados por `src/lib/admin.ts`.
- Está protegida por **Firebase Auth (email/password)**: sin sesión solo se muestra el
  formulario de login (`signInWithEmailAndPassword`); la sesión se vigila con
  `onAuthStateChanged`.
- Las reglas en `firestore.rules` permiten `read: true` (público) y `write` solo con
  `request.auth != null`. Para restringir a un correo concreto: usar
  `request.auth.token.email == 'tu@email.com'` en la regla de write.
- Pasos manuales en Firebase Console (una vez): habilitar **Email/Password** en Auth,
  crear el usuario admin, y publicar las reglas (`npm run deploy:rules` o pegarlas en
  Firestore → Rules).
- El fetch de escritura no expone claves: usa la misma config pública `PUBLIC_FIREBASE_*`.

## Secciones de la página
1. Nav sticky con active-state por scroll
2. Hero — nombre, rol, tagline, CTAs (Contact / View Work), foto, redes
3. Skills — por categoría
4. Experience — timeline (empresa, rol, periodo, highlights, tech)
5. Projects — grid con imagen, tech, links demo/repo
6. Education & Certifications
7. Contact — email + redes

## Modelos Firestore
- **profile** (doc único `main`): `{ name, role, tagline, bio, photoUrl, heroImageUrl,
  location, email, resumeUrl, social: { github, linkedin, twitter } }`
- **skills** (doc por categoría): `{ category, order, items: [{ name, icon }] }`
- **experience**: `{ company, logoUrl|null, role, location, periodStart, periodEnd|null,
  current, description, highlights[], tech[], order }`
- **projects**: `{ title, description, demoUrl|null, repoUrl|null,
  tech[], tags[], featured, order }`
- **education**: `{ institution, degree, periodStart, periodEnd, description, order }`
- **certifications**: `{ name, issuer, year, url|null, imageUrl|null, order }`
- Ordenamiento por `order`; fechas como strings ISO.

## Reglas de implementación
- No exponer claves privadas; las `PUBLIC_FIREBASE_*` son públicas por diseño.
- La config de Firebase se inyecta vía variables de entorno: `.env` local para dev y
  **repo variables** en GitHub Actions para el build de Pages (ver `deploy.yml`).
  NO hardcodear la config en el código.
- Fetch client-side con estado de loading; render de datos reales, no mockups finales.
- Animaciones no deben bloquear el render inicial.
- TypeScript estricto: los modelos en `types.ts` deben coincidir 1:1 con Firestore.
- Imágenes del sitio en `public/images/`; en Firestore se guardan como rutas
  root-relative (`/images/...`) y al renderizar se resuelven con `withBase()`
  (`src/lib/text.ts`), que respeta `import.meta.env.BASE_URL` (base `/porfolio` o `/`).
  NO concatenar `BASE_URL` a mano: usar siempre `withBase()`.
- Desplegar solo cuando `npm run build` y el lint pasen.

## Fases de ejecución
0. Setup: repo GitHub, init Astro+TS+Tailwind, proyecto Firebase, reglas, `.env`
1. `types.ts` + seed de datos de ejemplo en Firestore
2. Layout + navbar + todas las secciones (HTML/Tailwind)
3. `firebase.ts`, helpers de fetch, conectar datos reales
4. GSAP + ScrollTrigger
5. Deploy workflow GitHub Actions → `username.github.io/porfolio`
6. QA: responsive, Lighthouse, accesibilidad

## Commands
- Dev: `npm run dev`  |  Build: `npm run build`  |  Preview: `npm run preview`
- Seed: `npm run seed` (requiere `seed/serviceAccountKey.json`)
- Rules: `npm run deploy:rules` (firebase CLI, requiere login)

## Migración pendiente: `porfolio` → `LordSinSentido.github.io`
Sustituir el portafolio anterior (Vite/React) que vive en el repo `LordSinSentido.github.io`
por esta versión (Astro). El repo destino se sirve en **root** (`https://LordSinSentido.github.io`).

Estado del contexto:
- `~/git/porfolio`: portafolio Astro nuevo, `main`, **sin remote**, base `/porfolio`.
- `~/git/LordSinSentido.github.io`: portafolio viejo (Vite/React), remote
  `git@github.com:LordSinSentido/LordSinSentido.github.io.git`, deploy en root con
  `VITE_FIREBASE_*` desde **secrets**. Ramas: `main`, `develop`, `issue-3`, etc.
- El repo nuevo usa `PUBLIC_FIREBASE_*` desde **repo variables** (`vars.*`).

### Plan
1. **Rama vacía (sin tocar `main`)**: `git switch --orphan next` + `git rm -rf .`
2. **Copiar** `~/git/porfolio/*` → `LordSinSentido.github.io/` excluyendo
   `node_modules`, `.env`, `.git`, `dist`, `seed/serviceAccountKey.json`, `.DS_Store`.
3. **Ajustes para deploy en root**:
   - `astro.config.mjs`: `base: '/porfolio'` → `base: '/'`
   - Reemplazar workflow de deploy por el de Astro (`PUBLIC_FIREBASE_*`); borrar workflow Vite viejo.
   - Borrar residuos del SPA viejo (`index.html`, `404.html`, `vite.config.ts`, `tsconfig.*`,
     `eslint.config.js`, `.prettierrc.json`, `src/` y `public/` viejos).
4. **Commit + push rama `next`**: `git add -A && git commit -m "chore: port new Astro portfolio"`
   → `git push origin next`. Testear preview antes de tocar producción.
5. **Promover a producción** (solo cuando esté listo):
   `git switch main && git merge --allow-unrelated-histories next && git push origin main`.

### Decisiones pendientes
- ¿Las repo variables `PUBLIC_FIREBASE_*` ya existen en `LordSinSentido.github.io` o hay que configurarlas?
- ¿Agregar `404.astro` básico? (Astro es multi-página estático; el `404.html` del SPA viejo no aplica.)
- ¿`~/git/porfolio` queda como fuente de verdad (re-sincronizar luego) o se abandona tras migrar?

