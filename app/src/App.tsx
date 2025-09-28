import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import NameEntryScene from './scenes/NameEntryScene';
import { UserProvider } from './components/UserContext';
import Board from './scenes/Board';
import TeamSelectionScene from './scenes/TeamSelectionScene';
import Home from './scenes/Home';
import { Toaster } from 'react-hot-toast';
import Leaderboard from './scenes/Leaderboard';

const App: React.FC = () => {
  return (
    <UserProvider>
      <Router>
        <Toaster position="top-center" />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/board/:refinementId/team/:teamName" element={<Board />} />
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