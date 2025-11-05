import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import NameEntryScene from './scenes/NameEntryScene/NameEntryScene';
import { AuthProvider } from './contexts/AuthContext';
import { LoadingProvider } from './contexts/LoadingContext';
import BoardScene from './scenes/BoardScene/BoardScene';
import TeamSelectionScene from './scenes/TeamSelectionScene/TeamSelectionScene';
import HomeScene from './scenes/HomeScene/HomeScene';
import { Toaster } from 'react-hot-toast';
import LeaderboardScene from './scenes/LeaderboardScene/LeaderboardScene';
import CreationScene from './scenes/CreationScene/CreationScene';
import JoinScene from './scenes/JoinScene/JoinScene';
import { LoadingOverlay } from './components/LoadingOverlay';
import { useGlobalLoading } from './contexts/LoadingContext';
import LoginScene from './scenes/LoginScene/LoginScene';
import RegisterScene from './scenes/RegisterScene/RegisterScene';
import { AppLayout } from './components/AppLayout';
import RouteGuard from './components/RouteGuard';

const AppContent: React.FC = () => {
  const { globalLoading, loadingMessage } = useGlobalLoading();

  return (
    <>
      <Router>
        <Toaster position="top-center" />
        <LoadingOverlay show={globalLoading} message={loadingMessage} />

        <RouteGuard>
          <Routes>
            <Route path="/" element={
              <AppLayout noScroll={true}>
                <HomeScene />
              </AppLayout>
            } />
            <Route path="/session-creation" element={
              <AppLayout>
                <CreationScene />
              </AppLayout>
            } />
            <Route path="/join-a-session/:sessionCode?" element={
              <AppLayout noScroll={true}>
                <JoinScene />
              </AppLayout>
            } />
            <Route path="/board/:refinementId/team/:teamName" element={
              <AppLayout>
                <BoardScene />
              </AppLayout>
            } />
            <Route path="/team-selection/:refinementId" element={
              <AppLayout>
                <TeamSelectionScene />
              </AppLayout>
            } />
            <Route path="/leaderboard/:refinementId" element={
              <AppLayout>
                <LeaderboardScene />
              </AppLayout>
            } />

            <Route path="/login" element={<LoginScene />} />
            <Route path="/register" element={<RegisterScene />} />
            <Route path="/name-entry" element={<NameEntryScene />} />
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