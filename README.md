# Package Stalker 📦

> **Minimal & Sexy** Package Tracking Web Application for Life OS

A beautiful, modern package tracking application that aggregates tracking data from multiple carriers via Track123 API with insightful analytics.

---

## ✨ Features

- 🔍 **Universal Search** - Track any package with auto-carrier detection
- 📊 **Analytics Dashboard** - Monthly stats and courier performance insights
- ⚡ **Real-time Updates** - Instant tracking with detailed timeline
- 🎨 **Dark Glassmorphism UI** - Premium, modern design
- 💾 **Local Storage** - Persistent tracking history
- 📈 **Transit Time Analytics** - Average delivery time per carrier

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env and add your Track123 API key

# Run development server
npm run dev
# Open http://localhost:5173/
```

---

## 🔑 API Configuration

Get your Track123 API key from [Track123.com](https://www.track123.com/)

```env
VITE_TRACK123_API_KEY=your_api_key_here
```

**Note**: The app works with a mock service if no API key is provided (for demo purposes).

---

## 📱 Usage

### 1. Track a Package

- Enter tracking number in the search bar
- Click "Start Stalking"
- Carrier is auto-detected via Track123 API

### 2. View Details

- Click on any tracking card to expand timeline
- See detailed event history with timestamps
- View transit days since order placed

### 3. Analytics Dashboard

- Navigate to "สถิติ" tab
- View monthly package statistics
- See courier distribution and average delivery times

---

## 🏗️ Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS v4 (Dark Glassmorphism)
- **Charts**: Recharts
- **Icons**: Lucide React
- **API**: Track123 Gateway API v2.1
- **Storage**: Local Storage (Supabase-ready)

---

## 📁 Project Structure

```
src/
├── domain/
│   └── types.ts              # Immutable domain models
├── services/
│   ├── track123.service.ts   # Track123 API integration
│   └── storage.service.ts    # Local Storage + Analytics
├── components/
│   ├── TrackingBar.tsx       # Universal search
│   ├── TrackingCard.tsx      # Package card with timeline
│   ├── Timeline.tsx          # Event timeline
│   ├── InsightDashboard.tsx  # Analytics dashboard
│   └── Navigation.tsx        # App navigation
├── App.tsx                   # Main application
└── index.css                 # Design system
```

---

## 🎨 Design System

### Color Palette

```css
--color-primary: #8b5cf6 /* Purple */ --color-secondary: #06b6d4 /* Cyan */
  --color-accent: #f59e0b /* Amber */ --color-bg-dark: #0f172a /* Slate 900 */;
```

### Glassmorphism

- Backdrop blur: 16px
- Border: 1px solid rgba(255,255,255,0.1)
- Background: rgba(255,255,255,0.05)

---

## 🔌 API Integration

Uses **Track123 Gateway API v2.1** with the following endpoints:

| Endpoint        | Method | Purpose                 |
| --------------- | ------ | ----------------------- |
| `/track/import` | POST   | Register new tracking   |
| `/track/query`  | POST   | Get tracking details    |
| `/courier/list` | GET    | List supported carriers |

**Header**: `Track123-Api-Secret: your_api_key`

---

## 📊 Analytics Features

### Monthly Overview

- Total packages tracked this month
- Delivered packages count
- In-transit packages count

### Courier Champion

- Pie chart showing carrier distribution
- Most frequently used carrier highlight
- Average delivery time per carrier

### Transit Days

- Shows days since order placed
- Calculated from Track123 API response
- Displayed on tracking cards and analytics

---

## 🚧 Development

```bash
# Run dev server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Logging

The app includes comprehensive logging for debugging:

- 🚀 Instant track start
- 🔍 Query operations
- 📝 Registration
- ✅ Success
- ❌ Errors

---

## 🔮 Future Enhancements

- [ ] Supabase integration for cloud sync
- [ ] User authentication
- [ ] Spending insights (manual price input)
- [ ] Google AI integration for advanced insights
- [ ] Push notifications for status updates
- [ ] Export tracking history

---

## 📝 License

MIT

---

## 💜 Made for Life OS

Built with love using modern web technologies and best practices.
