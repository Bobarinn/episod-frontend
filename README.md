# ✨ FACELESS - AI Video Generator

A bold, playful web interface for the Faceless Video Generator API. Create stunning short-form videos from text topics with AI.

## 🆕 Latest Updates

- **9:16 Portrait Cards**: Projects now display as beautiful TikTok/Instagram-style cards
- **Live Thumbnails**: Each card shows the generated image from clip 0
- **Auto-refresh**: Projects update automatically every 5 seconds during processing
- **Responsive Grid**: 2-4 columns that adapt to screen size
- **API Integration**: All projects fetched live from `GET /v1/projects`
- **Gradient Overlays**: Text always readable over any thumbnail
- **Hover Animations**: Smooth zoom + play icon reveal

## 🎨 Design

Blends Instagram's mobile-first boldness with Google Whisk's vibrant yellow playfulness:

- **Vibrant yellow** (#FFD60A) dominates like a creative playground
- **Chunky, rounded** UI elements optimized for touch
- **Bold typography**: Outfit (geometric headers) + Plus Jakarta Sans (friendly body)
- **Animated status badges** that pulse during active processes
- **9:16 Portrait Cards**: TikTok/Instagram-style video previews
- **Dynamic Thumbnails**: Generated images as card backgrounds
- **Gradient Overlays**: Ensures text is always readable
- **Hover Effects**: Smooth zoom on thumbnails + play icon reveal
- **Playful micro-interactions** throughout

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Configure API

1. Click the **Settings** (⚙️) button in the top right
2. Enter your API configuration:
   - **Base URL**: `http://localhost:8080` (or your API server URL)
   - **API Key**: Your API key
3. Click **Save Configuration**
4. Click **Test Connection** to verify it works

## 📋 Features

### 1. Create Projects
- Enter any topic (e.g., "The History of Abraham Lincoln")
- Adjust duration with a slider (10-120 seconds)
- Click **Generate Video** to start

### 2. Project Library
- **9:16 Portrait Cards**: Projects displayed as TikTok/Instagram-style cards
- **Thumbnail Previews**: Each card shows clip 0's image as background
- **Real-time Updates**: Auto-refreshes every 5 seconds when projects are processing
- **Status Badges**: Color-coded badges show current status
- **Hover Effects**: Play icon appears on hover, thumbnail zooms smoothly
- **Gradient Overlays**: Text remains readable over any thumbnail
- Click any project card to view full details

### 3. Project Details
- Watch completed videos in a portrait player
- Download final videos
- View individual clips with audio/image/video assets
- Inspect prompts and voice instructions for each clip

### 4. Debug Jobs
- Expand the debug panel to see job execution timeline
- Track progress through each stage
- View error messages if something fails

## 🎨 Status Badge Colors

- **Queued** - Purple (⏱️)
- **Planning** - Blue (🧠)
- **Generating** - Orange, pulsing (✨)
- **Rendering** - Pink, pulsing (🎬)
- **Completed** - Green (✅)
- **Failed** - Red (❌)

## 🛠️ Tech Stack

- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Google Fonts** (Outfit + Plus Jakarta Sans)

## 📁 Project Structure

```
facelessfe/
├── app/
│   ├── layout.tsx       # Root layout with fonts
│   ├── page.tsx         # Main page component
│   └── globals.css      # Global styles + Tailwind
├── components/
│   ├── StatusBadge.tsx      # Animated status badges
│   ├── SettingsPanel.tsx    # API configuration
│   ├── CreateProjectForm.tsx # New project form
│   ├── ProjectCard.tsx      # Project list item
│   ├── ClipCard.tsx         # Individual clip display
│   └── ProjectDetail.tsx    # Full project view
├── lib/
│   └── api.ts           # API client functions
├── tailwind.config.ts   # Tailwind customization
└── package.json
```

## 🔌 API Endpoints Used

- `GET /health` - Health check (no auth)
- `GET /v1/projects` - List all projects (with thumbnails & summaries)
- `POST /v1/projects` - Create new project
- `GET /v1/projects/{id}` - Get full project details
- `GET /v1/projects/{id}/download` - Download video
- `GET /v1/projects/{id}/debug/jobs` - Debug job timeline
- `GET /v1/projects/{projectId}/clips/{clipId}` - Get clip details

## 💾 Local Storage

The app uses localStorage to persist:
- API configuration (base URL + API key)

Projects are fetched live from the API - no local caching.

## 🎯 Usage Tips

1. **Auto-refresh**: Projects automatically refresh every 5 seconds when processing is active
2. **Live data**: All projects are fetched from the API in real-time - always up to date
3. **Portrait format**: Project cards are displayed in 9:16 aspect ratio (perfect for TikTok/Reels)
4. **Thumbnails**: Each project card shows the first clip's generated image as a preview
5. **Responsive grid**: View 2 cards on mobile, 3 on tablet, 4 on desktop
6. **Quick access**: Click any card to view full project details and watch/download videos

## 🏗️ Build for Production

```bash
npm run build
npm start
```

## 🎨 Customization

### Colors

Edit `tailwind.config.ts` to change the color scheme:

```ts
colors: {
  yellow: {
    primary: '#FFD60A',  // Main yellow
    bright: '#F9D71C',   // Bright accent
    dark: '#E6C200',     // Dark yellow
  },
  // ... status colors
}
```

### Fonts

Change fonts in `app/layout.tsx`:

```ts
import { YourFont, AnotherFont } from "next/font/google";
```

### Animations

Adjust animation speeds in `tailwind.config.ts`:

```ts
animation: {
  'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  // ... other animations
}
```

## 🐛 Troubleshooting

### "Connection failed" error
- Verify your API server is running on the correct port
- Check the Base URL in Settings
- Ensure your API key is correct

### Projects not loading
- Check browser console for errors
- Verify API key is set in Settings
- Try refreshing the projects list

### Video not playing
- Ensure the video URL is accessible
- Check if the video has finished rendering
- Try opening the video URL directly in a new tab

## 📝 License

This is a frontend interface for the Faceless Video Generator API.

---

Made with ✨ and bold design choices
# episod-frontend
