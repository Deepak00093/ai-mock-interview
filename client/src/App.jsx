import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import InterviewSetup from './pages/InterviewSetup';
import InterviewSession from './pages/InterviewSession';
import InterviewResults from './pages/InterviewResults';
import InterviewDashboard from './pages/InterviewDashboard';


function App() {

  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect the root URL straight to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/interview/setup" element={<InterviewSetup />} />
        <Route path="/interview/:id" element={<InterviewSession />} />
        <Route path="/interview/results/:id" element={<InterviewDashboard />} />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;
