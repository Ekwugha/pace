# Pace - AI Day Orchestrator

An intelligent day-planning system that helps you schedule overwhelming days through smart negotiation and clear tradeoffs.

![Pace](https://via.placeholder.com/1200x400/0c4a6e/ffffff?text=Pace+-+Protect+Your+Work)

## 🎯 Core Philosophy

**Work is ALWAYS protected.**

When your day gets intense, Pace automatically reduces non-essential activities (breaks, phone time, leisure) to protect your work blocks. Sleep is the last to shrink and never goes below 6.5 hours.

## ✨ Key Features

### Intensity-Based Scheduling

Choose your intensity level and Pace adjusts everything else:

| Intensity | Breaks | Phone/Social | Leisure | Sleep |
|-----------|--------|--------------|---------|-------|
| **Low** | Full (20min) | Full (60min) | Full (120min) | 8h |
| **Medium** | Normal (15min) | Limited (30min) | Normal (60min) | 7.5h |
| **High** | Short (10min) | Minimal (15min) | Minimal (30min) | 7h (min 6.5h) |

### Priority System

Activities are protected in this order:

1. **Work** - Deep focus tasks (NEVER reduced)
2. **Essential** - Must-do personal tasks, meals
3. **Breaks** - Can be shortened when needed
4. **Phone/Social** - Can be heavily reduced
5. **Leisure** - First to shrink
6. **Sleep** - Protected minimum of 6.5 hours

### Smart Tradeoff Communication

Pace explains every scheduling decision:

> "🔥 High intensity day activated. Work blocks are fully protected."
> "⏱️ Breaks shortened to maximize productive time."
> "📱 Phone/social time reduced to protect work focus."

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **State**: Zustand with localStorage persistence
- **UI**: Radix UI primitives
- **No AI APIs** - Pure rule-based scheduling engine

## 🚀 Getting Started

```bash
# Clone the repository
git clone https://github.com/yourusername/pace.git
cd pace

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start planning.

## 📖 How It Works

### 1. Add Tasks One by One

No need to assign times. Just add what you need to do:

- **Work tasks** - Deep focus blocks (90-120 min each)
- **Essential tasks** - Things that must happen
- **Movement** - Exercise, walks
- **Phone/Social** - Flexible, can be reduced
- **Leisure** - Free time, hobbies

### 2. Set Your Intensity

- **Low**: Recovery day, full breaks and leisure
- **Medium**: Balanced productivity
- **High**: Maximum output, minimal distractions

### 3. Generate Schedule

Pace creates a structured timeline:

```typescript
[
  { start: "7:00 AM", end: "7:30 AM", label: "Morning Routine", type: "essential" },
  { start: "7:30 AM", end: "9:30 AM", label: "Deep Work Block", type: "work" },
  { start: "9:30 AM", end: "9:40 AM", label: "Break", type: "break" },
  // ... continues through day
]
```

### 4. Execute & Track

Check off blocks as you complete them. The schedule adapts to show your progress.

## 📁 Project Structure

```
src/
├── app/
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main app
├── components/
│   ├── layout/            # Header, background, command palette
│   ├── task-input/        # Task entry interface
│   ├── schedule/          # Timeline display
│   ├── calendar/          # Calendar view
│   └── ui/                # Reusable components
├── lib/
│   ├── utils.ts           # Utilities
│   └── scheduler.ts       # 🔥 Core scheduling engine
├── store/
│   └── useStore.ts        # Zustand state management
└── types/
    └── index.ts           # TypeScript definitions
```

## 🧠 Scheduling Engine

The heart of Pace is the rule-based scheduler (`src/lib/scheduler.ts`):

```typescript
// Core scheduling function
function generateSchedule(
  tasks: Task[],
  config: ScheduleConfig
): ScheduleResult {
  // 1. Calculate required work time (PROTECTED)
  // 2. Calculate breaks needed between work blocks
  // 3. If time is tight, reduce in priority order:
  //    - Breaks (up to 50%)
  //    - Sleep (max 1 hour, never below 6.5h)
  // 4. Allocate remaining time to flexible activities
  // 5. Generate tradeoff messages
}
```

### Key Rules

- Work blocks are 90-120 minutes
- Breaks are automatically inserted between work blocks
- Lunch is scheduled around noon
- Evening wind-down before sleep
- All times are system-assigned (user never sets times)

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘K` | Open command palette |
| `⌘N` | Plan today |
| `⌘D` | Toggle dark/light mode |

## 🎨 UI Features

- **Glassmorphism** - Frosted glass card effects
- **Ambient Background** - Dynamic gradients based on time of day
- **Framer Motion** - Smooth animations throughout
- **Dark Mode** - Easy on the eyes

## 📱 Responsive Design

Works on desktop, tablet, and mobile devices.

## 🔮 Future Enhancements

- [ ] Drag-and-drop block reordering
- [ ] Weekly overview
- [ ] Recurring tasks
- [ ] Calendar sync (Google, Apple)
- [ ] Push notifications
- [ ] Analytics dashboard

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

Built with ❤️ to help you focus on what matters.

**Remember: Your work is always protected.**
