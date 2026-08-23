# FocusFlow — Complete Beginner's Architecture Guide

If you are a beginner looking to bridge the gap between "I know basic JavaScript" and "I can build and understand a complete React application," you are in the right place. 

This document explains the architecture of FocusFlow from the absolute basics up to complex algorithms and data flows. 

---

## 1. What is FocusFlow?

FocusFlow is a productivity application designed to help users manage tasks, generate study schedules, and execute focus sessions using a Pomodoro timer. 

Technically, FocusFlow is a **Client-Side Single Page Application (SPA)** built with React.

**What does that mean?**
- **React:** A JavaScript library for building user interfaces. It allows us to break the screen down into small, reusable chunks called "Components."
- **Single Page Application (SPA):** In a traditional website, clicking a link forces the browser to download a completely new HTML file from a server, resulting in a white flash. In an SPA, you download one single HTML file (`index.html`). When you click a link, JavaScript instantly replaces the content on the screen without reloading the page. It feels as fast as a native mobile app.
- **Client-Side & No Backend:** FocusFlow does not connect to a database server (like PostgreSQL or Firebase) in the cloud. All logic, routing, and data storage happen purely on your "client" (your web browser).
- **LocalStorage Persistence:** Because there is no backend, we save your data directly to your browser's hard drive using the `localStorage` API. 

---

## 2. Big Picture Architecture

Before we look at code, let's look at how data moves through the application. This is the fundamental architecture of FocusFlow:

```text
1. User interacts with the UI (Clicks "Add Task")
        ↓
2. React Router ensures they are on the right Page (Tasks.jsx)
        ↓
3. The Page calls a function from a Custom Hook (addTask in useTasks.js)
        ↓
4. The Custom Hook updates React State (useState)
        ↓
5. A Side Effect observes the change and saves the data to the hard drive (useEffect → LocalStorage)
        ↓
6. React realizes the state changed and automatically Re-renders the UI
        ↓
7. The User sees the new Task on their screen!
```

Every single feature in FocusFlow (creating tasks, finishing a timer, moving a calendar session) follows this exact loop.

---

## 3. Project Structure

Here is a map of the entire `src/` directory. Each folder has a specific architectural responsibility.

```text
src/
├── main.jsx                 (The Entry Point)
├── App.jsx                  (The Router)
├── index.css                (The Design System)
├── components/              (Reusable UI Elements)
│   ├── ui/                  
│   │   ├── Button.jsx       
│   │   └── Card.jsx         
│   ├── Sidebar.jsx          
│   ├── BottomNav.jsx        
│   └── TopNav.jsx           
├── hooks/                   (The Data Managers)
│   ├── useTasks.js          
│   ├── useFocusSessions.js  
│   ├── usePomodoro.js       
│   └── useStudyPlan.js      
├── layouts/                 (The Structural Wrappers)
│   └── DashboardLayout.jsx  
├── pages/                   (The Smart Screens)
│   ├── Analytics.jsx        
│   ├── Calendar.jsx         
│   ├── Dashboard.jsx        
│   ├── FocusTimer.jsx       
│   ├── StudyPlanner.jsx     
│   └── Tasks.jsx            
└── utils/                   (The Pure Math/Logic)
    ├── analytics.js         
    └── studyScheduler.js    
```

### Important Files Explained

**`src/main.jsx`**
- **What it is:** The first JavaScript file that runs.
- **What it does:** It imports the `<App />` and tells ReactDOM to render it inside the `<div id="root">` found in `index.html`. 

**`src/App.jsx`**
- **What it is:** The Routing Configuration.
- **What it does:** It imports `react-router-dom` and maps URLs to Pages. If the URL is `/timer`, it renders `FocusTimer.jsx`.

**`src/hooks/useTasks.js`**
- **What it is:** A Custom Hook.
- **What it owns:** The `tasks` array state.
- **Who uses it:** `Tasks.jsx`, `Dashboard.jsx`, and `Analytics.jsx`.
- **Why it exists:** To keep data management completely separate from visual rendering.

**`src/utils/studyScheduler.js`**
- **What it is:** A Pure JavaScript utility.
- **What it does:** It contains the mathematical algorithm that generates the study schedule. It does NOT use React.

---

## 4. React Fundamentals in FocusFlow

To understand this codebase, you must understand a few core React concepts.

### Components & JSX
A component is a JavaScript function that returns JSX (a syntax that looks like HTML).
*Example in FocusFlow:* `Button.jsx` is a component. We pass it `props` (arguments) like `variant="primary"` to tell it how to look.

### State (`useState`)
State is React's short-term memory. 
*Concept:* If you use a normal variable `let count = 0` and change it to `1`, React will ignore it. If you use `const [count, setCount] = useState(0)` and call `setCount(1)`, React redraws the screen.
*Usage:* We use `useState` in `useTasks.js` to hold the list of tasks.

### Side Effects (`useEffect`)
A component's only job is to calculate HTML based on State. Anything else (fetching data, setting timers, saving to the hard drive) is a "Side Effect."
*Concept:* `useEffect(callback, [dependencies])` runs the callback *after* the component renders, but only if a dependency changed.
*Usage:* We use `useEffect` to save tasks to `localStorage` every time the task array changes.

### Mutable References (`useRef`)
*Concept:* `useRef` holds a value that does *not* trigger a re-render when it changes. It is an escape hatch.
*Usage:* In `usePomodoro.js`, we use `const intervalRef = useRef(null)` to hold the ID of the `setInterval` timer. We don't want the screen to re-render just because we saved an ID, but we need to remember the ID so we can cancel the timer later.

### Derived State
*Concept:* If you have an array of tasks, you do *not* need a separate state variable for `completedTaskCount`. You can just calculate `tasks.filter(t => t.status === 'Done').length` directly in the component. 
*Usage:* The entire `Analytics.jsx` page is derived state. It stores zero data. It just reads existing data and does math on the fly.

---

## 5. Routing Architecture

We use `react-router-dom` to handle navigation.

**The Flow:**
1. The user clicks "Tasks" in the Sidebar.
2. The Sidebar calls `navigate('/tasks')`.
3. The browser URL changes.
4. `App.jsx` sees the change. It looks at this code:
```jsx
<Route element={<DashboardLayout />}>
  <Route path="/tasks" element={<Tasks />} />
</Route>
```
5. It renders `<DashboardLayout />`. Inside that layout is an `<Outlet />`.
6. React Router injects the `<Tasks />` component directly into that Outlet hole.

### The `useNavigate` Bug
During development, the `Dashboard.jsx` page crashed with `ReferenceError: useNav is not defined`.
*Why:* The developer typed `const navigate = useNav()`.
*Fix:* We corrected it to `const navigate = useNavigate();`, the actual hook exported by `react-router-dom`. This highlights the importance of precise imports.

---

## 6. Component Architecture & The Button Bug

We split UI components (Buttons, Cards) away from Pages (Dashboard, Analytics). Reusable components reduce duplication.

However, we encountered a major architectural bug with `Button.jsx`.
*The Bug:* We wrote `<Button style={{ marginTop: '0.5rem' }}>`. The button turned black and lost its padding!
*The Root Cause:* Inside `Button.jsx`, we were blindly spreading props:
```jsx
<button style={{ padding: '1rem', color: 'white' }} {...props} />
```
Because the incoming `props` object contained `{ style: { marginTop: '0.5rem' } }`, it completely overwrote the internal style object. 
*The Fix:* We had to explicitly extract and merge the styles:
```jsx
const Button = ({ style = {}, ...props }) => {
  return <button style={{ ...baseStyle, ...variantStyle, ...style }} {...props} />
}
```

---

## 7. Task Architecture

The Task system revolves around `src/hooks/useTasks.js`.

**The Data Model:**
```javascript
{
  id: "uuid-1234",
  title: "Read Biology Chapter",
  status: "Todo", // 'Todo' | 'In Progress' | 'Done'
  priority: "High", // 'High' | 'Medium' | 'Low'
  dueDate: "2023-11-20",
  createdAt: "2023-11-01T10:00:00.000Z",
  completedAt: null
}
```

**The Data Flow for `addTask()`:**
1. `Tasks.jsx` passes a new task object to `addTask(newTask)`.
2. `useTasks.js` adds a unique ID and `createdAt` timestamp.
3. It calls `setTasks(prev => [...prev, task])`. (This copies the old array and adds the new task to the end).
4. React detects the state change and re-renders.

---

## 8. LocalStorage Architecture

Because FocusFlow has no backend server, it uses the browser's `localStorage` API. 
LocalStorage is a simple key/value store that only accepts Strings.

**Saving Data (Serialization):**
You cannot save a JavaScript array to LocalStorage directly. You must turn it into a string using `JSON.stringify()`.
```javascript
useEffect(() => {
  localStorage.setItem('focusflow_tasks', JSON.stringify(tasks));
}, [tasks]);
```

**Loading Data (Deserialization):**
When the app boots up, we initialize the `useState` by reading the hard drive.
```javascript
const [tasks, setTasks] = useState(() => {
  const stored = localStorage.getItem('focusflow_tasks');
  return stored ? JSON.parse(stored) : []; // Fallback to empty array!
});
```
*Why the fallback?* If a user visits the app for the very first time, `getItem` returns `null`. `JSON.parse(null)` causes catastrophic errors. The fallback ensures the app boots safely.

---

## 9. Pomodoro Timer Architecture

The Pomodoro timer is the most technically complex React feature in the app. The logic lives inside `src/hooks/usePomodoro.js`.

**The Danger of Multiple Intervals:**
If you start a `setInterval` in React and don't clean it up, starting it a second time will create *two* intervals running simultaneously. Your clock will tick down twice per second!

**The Architecture:**
```javascript
useEffect(() => {
  if (isRunning) {
    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
  }
  
  // The Cleanup Function
  return () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };
}, [isRunning]);
```
*How this works:* Whenever `isRunning` changes (e.g., from True to False when paused), React calls the cleanup function *first*. This destroys the old interval. Then it runs the effect again. This guarantees only one interval ever exists.

**Mode Transitions:**
When `timeLeft` hits zero, a second `useEffect` catches it. It stops the timer, fires a callback to save the session, and looks at a variable called `completedFocusSessions`. If the user has completed 4 sessions, it automatically switches the mode to "Long Break".

*Known Limitation:* Browsers throttle (slow down) JavaScript intervals if you switch to a different tab to save battery. A production fix would involve saving the absolute `Date.now()` timestamp when the timer starts and diffing the time mathematically, rather than relying on 1-second interval ticks.

---

## 10. Focus Session Architecture

When `usePomodoro.js` hits zero, it triggers a callback in `FocusTimer.jsx`. This component then talks to `useFocusSessions.js`.

**The Data Flow:**
1. Timer hits zero.
2. `FocusTimer.jsx` calls `addSession({ durationMinutes: 25, taskId: "optional-id" })`.
3. `useFocusSessions.js` creates an object:
```javascript
{
  id: "uuid-999",
  durationMinutes: 25,
  taskId: "optional-id",
  completedAt: "2023-11-01T12:25:00.000Z"
}
```
4. It appends it to the sessions array and saves to `localStorage` under `focusflow_focus_sessions`.
Analytics can now read this array to calculate total minutes focused!

---

## 11. Smart Study Planner Algorithm

This feature translates raw deadlines into a daily schedule. The heavy lifting is done by a Pure Function inside `src/utils/studyScheduler.js`.

**The Greedy Algorithm:**
A greedy algorithm makes the best possible local choice at every step without worrying about the big picture. 

*The Formula:*
`Urgency Score = (1 / daysUntilDeadline) * priorityWeight * remainingHoursRequired`

*The Execution:*
Let's say you have 4 hours available today. 
1. The algorithm looks at Math (Due in 3 days, 6 hours left, High Priority). Score: High.
2. It looks at Science (Due in 10 days, 2 hours left, Low Priority). Score: Low.
3. It assigns 1 hour to Math. 
4. It reduces your available hours to 3. It reduces Math's required hours to 5.
5. It recalculates the scores and loops until your 4 hours are spent.
6. It moves to tomorrow and repeats until all required hours for all subjects are scheduled.

It returns a deterministic array of `sessions` mapping subjects to specific dates. `useStudyPlan.js` takes this array and saves it to `localStorage`.

---

## 12. Calendar & Drag-and-Drop Architecture

The `Calendar.jsx` page takes the array generated by the Study Planner and visualizes it in a 7-column grid.

**Native Drag and Drop:**
We did not use a third-party library. We used native HTML5 events.
1. **The Drag:** We added `draggable={true}` to the session cards. On the `onDragStart` event, we secretly copy the session's ID into the `e.dataTransfer` payload.
2. **The Drop Zone:** We added `onDragOver` to the day columns. We explicitly call `e.preventDefault()` here because browsers block dropping by default.
3. **The Drop:** On the `onDrop` event, we read the column's date, extract the session ID from the payload, and call `updateSessionDate(id, newDate)` in the `useStudyPlan` hook.
4. **The Update:** The hook finds the session, changes its date, saves to LocalStorage, and React instantly snaps the card into the new column.

---

## 13. Analytics Architecture

Analytics is purely **Derived State**.

**The Data Flow:**
```text
Tasks Array (from useTasks) + Focus Sessions Array (from useFocusSessions)
        ↓
Passed into Pure Utility Functions (analytics.js)
        ↓
Numbers are crunched using .reduce() and .filter()
        ↓
Rendered to the screen
```

*Example:* To get total focus minutes, we use `reduce`:
```javascript
export const calculateTotalFocusMinutes = (sessions) => {
  return sessions.reduce((total, session) => total + session.durationMinutes, 0);
};
```
Because this happens live during rendering, if you delete a focus session in another tab, the Analytics page immediately corrects itself without any synchronization bugs.

---

## 14. Dashboard Architecture

`Dashboard.jsx` is the Grand Central Station of FocusFlow. It imports `useTasks`, `useFocusSessions`, and `useStudyPlan`. 
It reads the data from all three hooks and renders high-level summary widgets (Urgent Tasks, Today's Focus Time). It acts as a read-only aggregator of the entire application state.

---

## 15. CSS and Design System

We used Vanilla CSS instead of Tailwind.
**Why?** It gives absolute control and teaches fundamental CSS architecture.
We defined **Design Tokens** using CSS Variables in the `:root` selector:
```css
:root {
  --bg-primary: #0f172a;
  --text-primary: #f8fafc;
  --accent-primary: #3b82f6;
}
```
By using `background-color: var(--bg-primary);` everywhere, we ensure perfect visual consistency. 

**Responsive Design:**
On mobile phones, the sidebar takes up too much room. We used CSS Media Queries to completely swap the navigation automatically:
```css
@media (max-width: 768px) {
  .sidebar { display: none; }
  .bottom-nav { display: flex; }
}
```

---

## 16. Architectural Trade-Offs & Interview Prep

**"Why did you use LocalStorage instead of a database?"**
*Answer:* "FocusFlow is designed as a standalone, offline-capable client-side application. LocalStorage eliminated the need for complex backend authentication and latency management. The trade-off is that data cannot sync across devices, but for V1, a zero-latency, private, offline experience was the priority."

**"Why didn't you use Redux for state management?"**
*Answer:* "Redux introduces significant boilerplate. By encapsulating state within custom React Hooks (`useTasks`, `usePomodoro`), we achieved modular, decoupled business logic that is easy to test and maintain without the overhead of a global store."

**"What was the hardest architectural challenge?"**
*Answer:* "Managing the interval lifecycle in the Pomodoro timer. Ensuring the closure inside `setInterval` always had access to fresh state required mastering the functional update pattern (`setTimeLeft(prev => prev - 1)`), and preventing overlapping timers required precise usage of the `useEffect` cleanup function and `useRef` to maintain a mutable reference to the interval ID."
