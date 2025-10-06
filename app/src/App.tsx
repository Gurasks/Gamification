import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import NameEntryScene from './scenes/NameEntryScene';
import { UserProvider } from './components/UserContext';
import { LoadingProvider } from './components/LoadingContext';
import BoardScene from './scenes/BoardScene';
import TeamSelectionScene from './scenes/TeamSelectionScene/TeamSelectionScene';
import HomeScene from './scenes/HomeScene';
import { Toaster } from 'react-hot-toast';
import Leaderboard from './scenes/Leaderboard';
import CreationScene from './scenes/CreationScene/CreationScene';
import JoinScene from './scenes/JoinScene/JoinScene';
import { LoadingOverlay } from './components/LoadingOverlay';
import { useGlobalLoading } from './components/LoadingContext';

const AppContent: React.FC = () => {
  const { globalLoading, loadingMessage } = useGlobalLoading();

  return (
    <>
      <Router>
        <Toaster position="top-center" />
        <LoadingOverlay show={globalLoading} message={loadingMessage} />
        <Routes>
          <Route path="/" element={<HomeScene />} />
          <Route path="/session-creation" element={<CreationScene />} />
          <Route path="/join-a-session/:sessionCode?" element={<JoinScene />} />
          <Route path="/board/:refinementId/team/:teamName" element={<BoardScene />} />
          <Route path="/team-selection/:refinementId" element={<TeamSelectionScene />} />
          <Route path="/name-entry" element={<NameEntryScene />} />
          <Route path="/leaderboard/:refinementId" element={<Leaderboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </>
  );
};

const App: React.FC = () => {
  return (
    <LoadingProvider>
      <UserProvider>
        <AppContent />
      </UserProvider>
    </LoadingProvider>
  );
};

export default App;