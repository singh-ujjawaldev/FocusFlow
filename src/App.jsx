import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';

import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import StudyPlanner from './pages/StudyPlanner';
import FocusTimer from './pages/FocusTimer';
import Calendar from './pages/Calendar';
import Analytics from './pages/Analytics';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="tasks" element={<Tasks />} />
          {/* Route aliases: both /planner and /study-planner resolve correctly */}
          <Route path="planner" element={<StudyPlanner />} />
          <Route path="study-planner" element={<StudyPlanner />} />
          {/* Route aliases: both /timer and /focus-timer resolve correctly */}
          <Route path="timer" element={<FocusTimer />} />
          <Route path="focus-timer" element={<FocusTimer />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="analytics" element={<Analytics />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
