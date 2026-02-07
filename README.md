# 🦊 Cartoonia - Kids Content Protection App Prototype

A Netflix Kids-style mobile app prototype for filtering and generating safe content for children.

## 🚀 Quick Start

The app is currently running at: **http://localhost:8000**

Simply open this URL in your browser to view the prototype!

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
- Launch filtering process

### 3. **Story Generator Screen** (Higgsfield AI UI)
- Chat-style interface for story creation
- AI-generated story preview
- Modify or validate stories
- Add optional sources (Image, PDF, Audio)
- Select language (Arabe, Français, English)
- Generate video button

### 4. **YouTube Kids Content**
- Curated video grid
- Category tabs (Pour toi, Dessins animés, Éducatif, Musique)
- Video cards with thumbnails and metadata

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
├── index.html      # Main HTML structure (4 screens)
├── styles.css      # Complete design system
├── app.js          # Interactive JavaScript
└── assets/
    └── fox-mascot.jpg  # Mascot character
```

## 🎯 Prototype Notes

This is a **UI prototype only** - no actual functionality is implemented:
- No real YouTube API integration
- No actual Higgsfield AI connection
- No backend filtering logic
- All interactions are visual demonstrations

## 🌐 Browser Compatibility

Works best in modern browsers:
- Chrome/Edge (recommended)
- Firefox
- Safari

## 📝 Next Steps for Full Implementation

1. Integrate YouTube Data API v3
2. Connect Higgsfield AI for story generation
3. Build backend filtering service
4. Add user authentication
5. Implement video player
6. Create Android native app (React Native/Flutter)

---

**Built with ❤️ for safe kids content**
