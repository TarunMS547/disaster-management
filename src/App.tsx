import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ARESAuthProvider } from './context/AuthContext';
import { SimulationProvider } from './context/SimulationContext';
import { SideRail } from './components/layout/SideRail';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { NewSimulationPage } from './pages/NewSimulationPage';
import { CommandCenterPage } from './pages/CommandCenterPage';
import { EventsTimelinePage } from './pages/EventsTimelinePage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ResourcesPage } from './pages/ResourcesPage';
import { SettingsPage } from './pages/SettingsPage';

// Layout wrapper for all /app routes
const AppLayout: React.FC = () => {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-ares-bg text-ares-text">
      <SideRail />
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <Outlet />
      </main>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ARESAuthProvider>
      <SimulationProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Landing Page */}
            <Route path="/" element={<LandingPage />} />

            {/* Application Workspace Routes */}
            <Route path="/app" element={<AppLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="simulations/new" element={<NewSimulationPage />} />
              <Route path="simulations/:simulationId" element={<CommandCenterPage />} />
              <Route path="simulations/:simulationId/events" element={<EventsTimelinePage />} />
              <Route path="simulations/:simulationId/analytics" element={<AnalyticsPage />} />
              <Route path="resources" element={<ResourcesPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </SimulationProvider>
    </ARESAuthProvider>
  );
};

export default App;
