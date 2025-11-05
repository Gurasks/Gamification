import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import NameEntryScene from './scenes/NameEntryScene';
import { AuthProvider } from './contexts/AuthContext';
import { LoadingProvider } from './contexts/LoadingContext';
import BoardScene from './scenes/BoardScene';
import TeamSelectionScene from './scenes/TeamSelectionScene/TeamSelectionScene';
import HomeScene from './scenes/HomeScene';
import { Toaster } from 'react-hot-toast';
import LeaderboardScene from './scenes/LeaderboardScene/LeaderboardScene';
import CreationScene from './scenes/CreationScene/CreationScene';
import JoinScene from './scenes/JoinScene/JoinScene';
import { LoadingOverlay } from './components/LoadingOverlay';
import { useGlobalLoading } from './contexts/LoadingContext';
import LoginScene from './scenes/LoginScene/LoginScene';
import RegisterScene from './scenes/RegisterScene/RegisterScene';
import Navbar from './components/Navbar';
import RouteGuard from './components/RouteGuard';

const AppContent: React.FC = () => {
  const { globalLoading, loadingMessage } = useGlobalLoading();

  return (
    <>
      <Router>
        <Toaster position="top-center" />
        <LoadingOverlay show={globalLoading} message={loadingMessage} />

        <Navbar />

        <RouteGuard>
          <Routes>
            <Route path="/" element={<HomeScene />} />
            <Route path="/login" element={<LoginScene />} />
            <Route path="/register" element={<RegisterScene />} />
            <Route path="/session-creation" element={<CreationScene />} />
            <Route path="/join-a-session/:sessionCode?" element={<JoinScene />} />
            <Route path="/board/:refinementId/team/:teamName" element={<BoardScene />} />
            <Route path="/team-selection/:refinementId" element={<TeamSelectionScene />} />
            <Route path="/name-entry" element={<NameEntryScene />} />
            <Route path="/leaderboard/:refinementId" element={<LeaderboardScene />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </RouteGuard>
      </Router>
    </>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <LoadingProvider>
        <AppContent />
      </LoadingProvider>
    </AuthProvider>
  );
};

export default App;