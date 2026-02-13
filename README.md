# 🦊 Cartoonia - Kids Content Protection App Prototype

A Netflix Kids-style mobile app prototype for filtering and generating safe content for children.

## 🚀 Quick Start (Prototype)

This repository contains a frontend UI prototype. There is no backend service bundled in this repo.

To view the prototype locally:
- Open `index.html` directly in your browser, or
- Serve the folder with a simple static server (recommended), for example:
  - Python 3: `python -m http.server 8000` then open `http://localhost:8000`
  - Node: `npx http-server .` then open the provided URL

Note: This is a UI prototype — many features are visual placeholders. See "Prototype Notes" below for details.

## 📱 Features

### 1. **Home Screen**
- Personalized greeting
- Child profile selection (Youssef • 6 ans, Lina • 4 ans)
- Two main actions:
  - 🔍 **FILTRER** - Filter existing content
  - 🎨 **GÉNÉRER** - Generate new AI stories

### 2. **Content Filter Screen**
- Select child profile
- Choose platforms (YouTube, TikTok, Dailymotion)
- Set maximum age with interactive slider
- Block specific scenes:
  - Violence physique
  - Mauvais langage
  - Peur / Horreur
  - Consommation
- Add forbidden keywords
- Launch filtering process (visual demo)

### 3. **Story Generator Screen** (Higgsfield AI UI)
- Chat-style interface for story creation
- AI-generated story preview
- Modify or validate stories
- Add optional sources (Image, PDF, Audio)
- Select language (Arabe, Français, English)
- Generate video button (visual demo)

### 4. **YouTube Kids Content**
- Curated video grid (UI mock)
- Category tabs (Pour toi, Dessins animés, Éducatif, Musique)
- Video cards with thumbnails and metadata (placeholders)

## 🔑 YouTube API (Important)

To enable actual YouTube search/content features you must obtain a YouTube Data API v3 key and provide it to the prototype.

1. Get a YouTube Data API v3 key:
   - Follow Google Cloud console instructions to create a project and enable the YouTube Data API v3.
   - Create an API key.

2. Add the key to the app:
   - Create a `config.js` file in the project root (or update your existing one).
   - Example `config.js` (client-side prototype usage):
     ```javascript
     // config.js
     // Replace with your YouTube Data API v3 key
     window.CARTOONIA_CONFIG = {
       YOUTUBE_API_KEY: 'YOUR_API_KEY_HERE'
     };
     ```
   - The app reads `window.CARTOONIA_CONFIG.YOUTUBE_API_KEY`. Without this key, YouTube-related UI remains a placeholder.

3. Security note:
   - API keys embedded in client-side code are visible to users. For production use:
     - Proxy YouTube requests through a backend service that stores the key securely, or
     - Use a restricted key with appropriate HTTP referrers and quotas.
   - Add `config.js` to `.gitignore` if you do not want to commit it.

## 🎨 Design Features

- **Playful Color Scheme**: Orange (#FF8A4C) and Teal (#4ECDC4)
- **Glassmorphism Effects**: Modern frosted glass UI elements
- **Smooth Animations**: Hover effects and micro-interactions
- **Mobile-First**: Optimized for 390px width (iPhone size)
- **Cute Fox Mascot**: Integrated throughout the experience

## 🖱️ Interactive Elements

- ✅ Screen navigation (click action cards, back buttons)
- ✅ Platform toggles
- ✅ Age slider (0-12 years)
- ✅ Checkboxes for scene blocking
- ✅ Profile selection
- ✅ Tab navigation
- ✅ Animated buttons with loading states

## 📂 Project Structure

```
cartoonia/
├── index.html         # Main HTML structure (4 screens)
├── styles.css         # Complete design system
├── app.js             # Interactive JavaScript (prototype UI)
├── config.js*         # Optional — put your YOUTUBE_API_KEY here (see README)
└── assets/
    └── fox-mascot.jpg  # Mascot character
```
* `config.js` is optional for the prototype; required only if you want to enable real YouTube integration.

## 🎯 Prototype Notes

This is a **UI prototype only** — no full backend functionality is implemented by default:
- No real YouTube API integration unless you add a valid API key and implement calls
- No actual Higgsfield AI connection
- No backend filtering logic
- All interactions are visual demonstrations

## 🌐 Browser Compatibility

Works best in modern browsers:
- Chrome/Edge (recommended)
- Firefox
- Safari

## 📝 Next Steps for Full Implementation

1. Integrate YouTube Data API v3 (server-side proxy recommended)
2. Connect Higgsfield AI for story generation
3. Build backend filtering service
4. Add user authentication
5. Implement video player
6. Create Android native app (React Native/Flutter)

---

**Built with ❤️ for safe kids content**
