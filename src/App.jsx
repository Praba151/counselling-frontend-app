import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ClientDashboard from './pages/ClientDashboard';
import CounselorDashboard from './pages/CounselorDashboard';
import BookAppointment from './pages/BookAppointment';
import CounselorProfile from './pages/CounselorProfile';
import SessionNotes from './pages/SessionNotes';
import ProtectedRoute from './components/ProtectedRoute';
import ChatPage from './pages/ChatPage';       

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/client-dashboard" element={
          <ProtectedRoute role="client"><ClientDashboard /></ProtectedRoute>
        } />

        <Route path="/counselor-dashboard" element={
          <ProtectedRoute role="counselor"><CounselorDashboard /></ProtectedRoute>
        } />

        <Route path="/book/:counselorId" element={
          <ProtectedRoute role="client"><BookAppointment /></ProtectedRoute>
        } />

        <Route path="/counselor/:id" element={<CounselorProfile />} />
        <Route path="/session-notes/:appointmentId" element={
          <ProtectedRoute role="counselor"><SessionNotes /></ProtectedRoute>
        } />
        <Route path="/chat/:appointmentId" element={
          <ProtectedRoute><ChatPage /></ProtectedRoute>
        } />

      </Routes>
    </BrowserRouter>
  );
}

export default App;