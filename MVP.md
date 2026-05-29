# echo.11 — MVP Document
**Version 1.0 · May 2026**
**Creator: Shira Sarid · echo11.space**

---

## What is echo.11?

echo.11 is a free, science-backed Progressive Web App (PWA) offering 22 healing frequencies — binaural beats, solfeggio tones, and original compositions — for sleep, focus, anxiety relief, and nervous system regulation. No signup. No download. No paywall.

**Live:** https://echo11.space  
**Languages:** English · Hebrew (RTL)  
**Platform:** Mobile (iOS/Android) + Desktop via browser

---

## The Idea

The name "echo.11" comes from the idea that the mind echoes back to its natural, resonant frequency. Inspired by the declassified 1983 CIA Gateway Experience document and Monroe Institute research, the app brings professional-grade brainwave entrainment to anyone, for free, in 30 seconds.

---

## MVP Feature Set (v1.0)

### Core Audio Engine
- Web Audio API-based synthesis — no downloaded audio files, works offline
- 22 curated frequencies across 4 modes: Sleep, Healing, Focus, Abundance
- Real-time binaural beat generation (separate L/R oscillators)
- Solfeggio pure tone generation (174 Hz → 963 Hz)
- Volume control, fade in/out on start/stop
- iOS silent-switch bypass via looped silent audio element
- Wake Lock API — screen stays on during session

### Frequency Library
| Category | Count | Examples |
|----------|-------|---------|
| Binaural Beats | 6 | Delta 2 Hz, Theta 6 Hz, Alpha 10 Hz, Beta 18 Hz, Gamma 40 Hz, Schumann 7.83 Hz |
| Solfeggio | 10 | 174, 285, 396, 417, 432, 528, 639, 741, 852, 963 Hz |
| echo.11 Originals | 4 | 111 Hz Echo, Gamma+Love 528/568, Brain Fog 200/214, Misophonia 180/186 |
| Special | 2 | 369 Hz Tesla, 888 Hz Abundance |

### User Experience
- Onboarding flow (3 steps) with headphone detection
- "Today's Frequency" — daily rotating recommendation
- Quick Relief — 3-minute express session for anxiety
- Session timer (3 / 8 / 20 / 60 min or infinite)
- Mode selector (Sleep, Healing, Focus, Abundance, All)
- Search + filter in frequency library
- Consciousness Briefing — in-player real-time guidance
- Binaural strip — educational overlay on frequency science

### Personalization & Progress
- 30-day listening streak tracker
- Daily session history
- Personal mood log
- Animated streak milestones (confetti at 7/14/30/60/90 days)
- Supporter/tip tracking with visual thank-you

### Social & Sharing
- Share App (Web Share API + WhatsApp fallback)
- Quote Card Generator — creates 1080px cards in 4 sizes (1:1, 4:5, 9:16, 16:9)
  - Dark/Light/Warm/Gradient themes
  - Share to Instagram, Pinterest, WhatsApp, LinkedIn, Facebook
  - Native mobile share sheet on iOS/Android
- Visions — 3 free downloadable art prints (WebP, full resolution)

### Monetization
- Tip Jar with 3 suggested USD amounts ($5, $7, $14)
- PayPal.Me integration (no popup blocker issues — anchor.click method)
- Bit (ביט) payment support for Israeli users (configurable via BIT_URL)
- Clear "no account needed — credit/debit card works" messaging
- Supporter status persisted in localStorage with animated celebration

### Legal & Compliance
- Privacy Policy (no personal data collected)
- Terms of Use with medical disclaimer ("Not a Medical Device")
- Accessibility statement
- GDPR / CCPA compliance note
- All at /legal.html

---

## Technical Architecture

| Layer | Technology |
|-------|-----------|
| Frontend | Vanilla JS (no framework), ~3200 lines app.js |
| Audio | Web Audio API (OscillatorNode, GainNode, StereoPannerNode) |
| Offline | Service Worker (network-first for HTML/JS/CSS, cache-first for images) |
| Storage | localStorage (preferences, streak, history), sessionStorage (session state) |
| Analytics | Google Analytics 4 (gtag.js) |
| Fonts | Google Fonts (DM Sans, Spectral) |
| Icons | Lucide SVG sprite (embedded in HTML) |
| Images | WebP primary, JPEG fallback via `<picture>` elements |
| PWA | Web App Manifest, Apple touch icons, theme-color, safe-area-inset |

---

## PWA Compliance (Apple / Google)

| Requirement | Status |
|-------------|--------|
| HTTPS | ✅ (via hosting) |
| Web App Manifest | ✅ site.webmanifest with 192+512px PNG icons |
| Service Worker | ✅ sw.js — offline-capable |
| apple-touch-icon | ✅ 180x180px PNG |
| apple-mobile-web-app-capable | ✅ |
| viewport-fit=cover | ✅ |
| safe-area-inset CSS | ✅ All screens |
| Media Session API | ✅ Lock screen controls, next/prev |
| theme-color (dark + light) | ✅ |

---

## SEO & AI Discovery

- JSON-LD Schema: WebApplication, SoftwareApplication, Organization, FAQPage (23 Q&A), ItemList (22 frequencies)
- SEO static catalog (hidden div, indexed by Googlebot before JS)
- Hebrew + English: hreflang alternate links, RTL layout
- AI crawlers explicitly allowed: GPTBot, ClaudeBot, PerplexityBot, Google-Extended, Bingbot, etc.
- robots.txt: explicit Allow for all major crawlers
- sitemap.xml: bilingual, with image metadata

---

## Development Timeline

| Phase | What Was Built |
|-------|---------------|
| Foundation | Web Audio Engine, 22 frequencies, basic player UI |
| UX Polish | Onboarding, modes, timer, library search |
| Progress System | Streaks, history, mood log, consciousness briefing |
| Social | Share app, Quote Card Generator (Canvas API) |
| Monetization | Tip Jar, PayPal integration, Supporter flow |
| SEO | JSON-LD schema, SEO catalog, FAQ, sitemap |
| Share Redesign | Full quote share modal rewrite — 4 sizes, 4 themes, 5 platforms |
| Pre-Launch Audit | Manifest fix, copy protection, FAQ expansion, accessibility (ARIA), Media Session, PayPal Israel |

---

## App Store Submission Notes (Apple)

For Apple App Store submission, echo.11 requires a native wrapper:

**Option A — PWABuilder (recommended)**  
1. Visit https://www.pwabuilder.com/
2. Enter https://echo11.space
3. Select iOS → Generate Package
4. Open in Xcode → Archive → Submit via App Store Connect
5. Cost: Apple Developer Account ($99/year)

**Option B — Capacitor.js**  
Wrap the existing HTML/JS in a native shell with capacitor plugins for better audio performance.

**App Store Required Assets:**
- App icon: 1024×1024 PNG (no alpha, no rounded corners)
- Screenshots: iPhone 6.7" (1290×2796) + 5.5" + iPad 12.9"
- App description (up to 4000 chars — see below)
- Privacy Policy URL: https://echo11.space/legal.html
- Support URL: echo11frequencies@gmail.com
- Category: Health & Fitness > Meditation
- Age rating: 4+

**App Store Short Description (30 chars):**  
22 healing frequencies. Free.

**App Store Long Description:**
echo.11 delivers 22 science-backed healing frequencies — binaural beats, solfeggio tones, and original compositions — inspired by the declassified CIA Gateway Experience (1983) and Monroe Institute research. Tune your nervous system in 30 seconds. No signup. No subscription. No paywall.

Features: Delta sleep waves · Theta meditation · Alpha creativity · Beta focus · Gamma 40Hz MIT research · Full solfeggio scale (396–963 Hz) · 432 Hz Universe · 528 Hz Love frequency · Schumann 7.83 Hz · Misophonia relief · 30-day streak · Quote cards · Dark + Light themes · Hebrew support.

---

## Bit (ביט) — Israeli Payment Configuration

To enable the Bit payment button for Israeli users:
1. Open `app.js`
2. Find: `const BIT_URL = ''`
3. Replace with: `const BIT_URL = 'https://pay.bit.co.il/user/YOUR_PHONE_NUMBER'`
4. The "Pay with Bit" button will automatically appear on all tip sections

---

## Known Limitations (v1.0)

- No backend — all state is localStorage (clears if user clears browser data)
- Video backgrounds (432 Hz, 528 Hz) depend on Midjourney CDN — may expire
- PayPal.Me requires credit card or PayPal account (Bit resolves this for Israel)
- No push notifications (PWA limitation on iOS without native wrapper)
- Streak data not synced across devices

---

*echo.11 © 2026 Shira Sarid · echo11frequencies@gmail.com*
