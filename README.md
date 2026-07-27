# VITRA — Software & Cyber Security Studio Website

A complete, responsive, dark-themed website for VITRA, a two-discipline
studio (programming + cyber security). Static front-end, plus a minimal
Express back-end structure ready for future data (no database is wired up).

## Structure

```
vitra/
├── index.html            Home page
├── programming.html       Programming services
├── cybersecurity.html     Cyber security services
├── about.html             About page
├── contact.html            Contact (phone + email, no forms)
├── service.html            Generic "not orderable online" page every service links to
├── robots.txt / sitemap.xml
├── css/
│   └── style.css          Full design system + responsive rules
├── js/
│   ├── translations.js    EN / ES / AR dictionary + language switcher logic
│   └── script.js          Loader, nav, circuit-canvas animation, reveals, cursor
├── assets/
│   └── favicon.svg
└── backend/
    ├── server.js           Express static server
    ├── package.json
    └── routes/services.js  Read-only service catalog endpoint (no DB, no writes)
```

## Running it

**Front-end only** — just open `index.html` in a browser, or serve the
folder with any static file server.

**With the back-end stub:**

```bash
cd backend
npm install
npm start
```

Then visit `http://localhost:3000`.

## Notes

- No login, registration, forms, cookie banners, or user-data collection anywhere.
- Every service card (including the five reserved slots) routes to `service.html`,
  which shows the fixed contact message with phone `01040670952` and email
  `sinowolf1514@gmail.com`.
- Language switching (English / Español / العربية) flips the whole layout to
  RTL for Arabic, including navigation direction and icon mirroring, and
  persists the choice across pages via `localStorage`.
- The five placeholder titles keep the exact requested Arabic strings
  (`!الخانة الأولى^`, etc.) — replace their text and icon in `index.html`
  and `translations.js` once those services are defined.
