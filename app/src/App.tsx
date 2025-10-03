import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import NameEntryScene from './scenes/NameEntryScene';
import { UserProvider } from './components/UserContext';
import BoardScene from './scenes/BoardScene';
import TeamSelectionScene from './scenes/TeamSelectionScene';
import HomeScene from './scenes/HomeScene';
import { Toaster } from 'react-hot-toast';
import Leaderboard from './scenes/Leaderboard';
import CreationScene from './scenes/CreationScene';
import JoinScene from './scenes/JoinScene';

const App: React.FC = () => {
  return (
    <UserProvider>
      <Router>
        <Toaster position="top-center" />
        <Routes>
          <Route path="/" element={<HomeScene />} />
          <Route path="/refinement-creation" element={<CreationScene />} />
          <Route path="/join-a-session/:sessionCode?" element={<JoinScene />} />
          <Route path="/board/:refinementId/team/:teamName" element={<BoardScene />} />
          <Route path="/team-selection/:refinementId" element={<TeamSelectionScene />} />
          <Route path="/name-entry" element={<NameEntryScene />} />
          <Route path="/leaderboard/:refinementId" element={<Leaderboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </UserProvider>
  );
};

export default App;