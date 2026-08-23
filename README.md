# FocusFlow

FocusFlow is a beautiful, client-side productivity application designed to help students and professionals manage their tasks, plan their study sessions with a smart scheduler, and stay on track using a built-in Pomodoro focus timer.

## Key Features

- **Task Management**: Create, edit, and track tasks with urgency and priority.
- **Smart Study Planner**: Input your subjects, deadlines, and available hours, and the app automatically generates a schedule based on a deterministic urgency-priority algorithm.
- **Visual Calendar**: View your generated study sessions in a weekly calendar view. Drag and drop sessions to reschedule them on the fly.
- **Pomodoro Focus Timer**: A built-in focus timer (Focus, Short Break, Long Break) that tracks completed sessions. Automatically triggers a long break after 4 focus sessions.
- **Analytics Dashboard**: Visualize your productivity with charts tracking task completion rates and focus minutes over time.
- **Fully Offline**: All data is persisted securely in your browser's LocalStorage. No account required.

## Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router v6
- **Icons**: React Icons (Feather)
- **Styling**: Vanilla CSS (CSS variables, flexbox/grid layouts, no external UI frameworks)
- **Data Persistence**: Browser LocalStorage

## Architecture & Data Flow

FocusFlow is built with simplicity and readability in mind. It uses standard React hooks (`useState`, `useEffect`) grouped into custom hooks (`useTasks`, `useFocusSessions`, `useStudyPlan`) to manage application state and sync with `localStorage`.

- **Pure Functions**: Calculations like total study time or task completion rates reside in lightweight, pure utilities (e.g., `analytics.js`).
- **No Third-Party State Management**: Everything relies on React's native state mechanisms.
- **No Heavy UI Libraries**: Fully bespoke CSS and component styling relying on `index.css` CSS variables for the color palette, meaning a light mode could easily be implemented later by swapping the root CSS variable definitions.

### Scheduling Algorithm Overview

The Smart Study Planner (`studyScheduler.js`) uses a deterministic greedy algorithm to allocate available study hours to subjects. 

For each subject, it calculates an "Urgency Score":
`Score = (1 / daysUntilDeadline) * priorityWeight * remainingHoursRequired`

The planner iterates day by day from today until the maximum deadline. On each day, it allocates the user's "Available Hours" to the subjects with the highest Urgency Score, ensuring deadlines are prioritized.

### LocalStorage Usage

FocusFlow relies on three primary LocalStorage keys:
- `focusflow_tasks`: Stores all user tasks (Todo, In Progress, Done).
- `focusflow_focus_sessions`: Stores a log of all completed Pomodoro sessions.
- `focusflow_study_plan`: Stores the subjects and generated study sessions.

## Screenshots

*(Placeholder for Screenshots)*

## Getting Started

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/focus-flow.git
   cd focus-flow
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### How to Run Locally

Start the development server:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) to view it in your browser.

### Production Build

To create a production-optimized build:
```bash
npm run build
```
To preview the production build locally:
```bash
npm run preview
```

## Future Improvements

- Light / Dark mode toggle.
- Export/Import data functionality.
- Notifications for the Pomodoro timer.
- Detailed monthly and yearly analytics.
- Direct task linking from calendar study sessions to the Pomodoro timer.
