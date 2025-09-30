import { Routes, Route } from "react-router-dom";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { HomePage } from "./pages/HomePage";
import { ModerationPage } from "./pages/ModerationPage";
import { AutomationPage } from "./pages/AutomationPage";
import { WelcomePage } from "./pages/WelcomePage";
import { XpPage } from "./pages/XpPage";
import { MusicPage } from "./pages/MusicPage";
import { NotificationsPage } from "./pages/NotificationsPage";
import { SettingsPage } from "./pages/SettingsPage";

const App = () => {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route index element={<HomePage />} />
        <Route path="moderation" element={<ModerationPage />} />
        <Route path="automation" element={<AutomationPage />} />
        <Route path="welcome" element={<WelcomePage />} />
        <Route path="xp" element={<XpPage />} />
        <Route path="music" element={<MusicPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
};

export default App;
