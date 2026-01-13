# Pace - AI Day Orchestrator

An intelligent day planning system that helps you orchestrate overwhelming days through interaction, negotiation, and encouragement.

![Pace Banner](https://via.placeholder.com/1200x400/0c4a6e/ffffff?text=Pace+-+AI+Day+Orchestrator)

## ✨ Features

### Core Planning Flow
- **Interactive AI-Style Planning**: Answer questions about your energy, mood, and goals
- **Smart Time Windows**: Choose from 3h, 6h, 12h, or 24h planning windows
- **Energy-Aware Scheduling**: Tasks are ordered based on your energy levels
- **Balance Preferences**: Set your ideal work/rest/social/movement ratio

### Task Management
- **Drag & Drop Reordering**: Organize tasks with smooth animations
- **Category-Based Tasks**: Work, Rest, Social, Movement
- **Priority Levels**: High, Medium, Low
- **Progress Tracking**: Visual completion indicators

### Timeline View
- **Wake-to-Sleep Planning**: Full day visualization
- **Time Blocks**: See exactly when each task is scheduled
- **Break Suggestions**: Automatic breaks based on your preferences
- **Interactive Blocks**: Click to expand and manage tasks

### Calendar View
- **Day/Week Views**: Navigate through your plans
- **Progress Indicators**: See completion status at a glance
- **Quick Planning**: Start planning any day from the calendar

### UI/UX Features
- **Glassmorphism Design**: Beautiful frosted glass cards
- **Ambient Backgrounds**: Dynamic gradients that change with time of day
- **Framer Motion Animations**: Smooth, delightful transitions
- **Command Palette (⌘K)**: Quick access to all features
- **Dark/Light Mode**: System-aware theme switching
- **Responsive Design**: Works on desktop, tablet, and mobile

### Encouragement System
- **Progress-Based Messages**: Motivational feedback as you complete tasks
- **Task Completion Celebrations**: Contextual encouragement per task type
- **Time-Aware Greetings**: Morning, afternoon, evening, and night messages

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **State Management**: Zustand with localStorage persistence
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React
- **Date Handling**: date-fns

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd pace

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
src/
├── app/
│   ├── globals.css        # Global styles & Tailwind config
│   ├── layout.tsx         # Root layout with fonts
│   └── page.tsx           # Main application page
├── components/
│   ├── calendar/          # Calendar view components
│   ├── encouragement/     # Encouragement system
│   ├── layout/            # Header, background, command palette
│   ├── planner/           # Planning flow, task input/list
│   ├── providers/         # Theme provider
│   ├── settings/          # Settings dialog
│   ├── timeline/          # Timeline view
│   └── ui/                # Reusable UI components
├── lib/
│   └── utils.ts           # Utility functions
├── store/
│   └── useStore.ts        # Zustand store with persistence
└── types/
    └── index.ts           # TypeScript type definitions
```

## 🎯 Key Concepts

### Planning Flow

The planning flow guides users through creating an optimized day plan:

1. **Date Selection**: Today, tomorrow, or pick a specific day
2. **Time Window**: How many hours are available
3. **Energy Level**: Current energy state affects task ordering
4. **Mood State**: Influences suggestions and pacing
5. **Activity Types**: Which categories to include
6. **Intensity**: How hard to push throughout the day

### Task Scheduling Algorithm

Tasks are scheduled based on:
- Category preferences (work in morning, social in evening)
- Energy levels (demanding tasks when energy is high)
- Break frequency settings (automatic rest periods)
- Duration estimates (fitting tasks into available time)

### Persistence

All data is stored in localStorage:
- Day plans with tasks and time blocks
- User preferences (wake/sleep time, break frequency)
- App settings (theme, notifications, animations)

## 🎨 Design System

### Colors

- **Pace Blue**: Primary brand color
- **Work**: Indigo tones
- **Rest**: Purple tones
- **Social**: Orange tones
- **Movement**: Emerald tones

### Glassmorphism

Cards use backdrop blur with subtle transparency:
```css
.glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
```

### Animations

Powered by Framer Motion:
- Page transitions
- Staggered list animations
- Interactive hover states
- Progress indicators

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘K` | Open command palette |
| `⌘N` | New plan for today |
| `⌘T` | Add quick task |
| `⌘D` | Toggle dark/light mode |
| `⌘,` | Open settings |
| `ESC` | Close dialogs/cancel |

## 🔧 Configuration

### User Preferences

Accessible via Settings:
- Wake/Sleep times
- Break frequency (minutes between breaks)
- Break duration
- Balance preference (work/rest/social/movement ratios)

### App Settings

- Theme (light/dark/system)
- Notifications
- Sound effects
- Animation toggle

## 📱 Responsive Design

- **Desktop**: Full three-column layout
- **Tablet**: Two-column adaptive layout
- **Mobile**: Single-column stack with slide-out menus

## 🧪 Future Enhancements

- [ ] Real-time sync across devices
- [ ] Push notifications
- [ ] Calendar integration (Google, Apple)
- [ ] AI-powered task suggestions
- [ ] Weekly/monthly analytics
- [ ] Collaborative planning
- [ ] Widget support

## 📄 License

MIT License - see LICENSE file for details

---

Built with ❤️ using Next.js 14, TypeScript, and Tailwind CSS
