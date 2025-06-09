import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import NameEntryScene from './scenes/NameEntryScene';
import { UserProvider } from './components/UserContext';
import Board from './scenes/Board';
import TeamSelectionScene from './scenes/TeamSelectionScene';
import Home from './scenes/Home';

const App: React.FC = () => {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/board/:refinementId/team/:teamName" element={<Board />} />
          <Route path="/team-selection/:refinementId" element={<TeamSelectionScene />} />
          <Route path="/name-entry" element={<NameEntryScene />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </UserProvider>
  );
};

export default App;