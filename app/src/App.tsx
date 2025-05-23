import './App.css'
// import RequirementDefinition from './RequerimentDefinition';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import NameEntry from './NameEntry';
import { UserProvider } from './UserContext';
import Board from './Board';
import Home from './Home';
import TeamSelectionScene from './TeamSelectionScene';

const App: React.FC = () => {
  return (
    <UserProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/board/:boardId" element={<Board />} />
            <Route path="/team-selection/:refinementId" element={<TeamSelectionScene />} />
            <Route path="/name-entry" element={<NameEntry />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </UserProvider>
  );
};

export default App;