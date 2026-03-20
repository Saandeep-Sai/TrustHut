import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import MapPage from './pages/Map';
import ChatbotPage from './pages/Chatbot';
import PostDetail from './pages/PostDetail';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#060B14', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner" />
    </div>
  );
  if (!user) return <Navigate to="/login" />;
  return children;
}

export default function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#060B14', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }} className="fade-up">
          <div style={{
            width: '48px', height: '48px', borderRadius: '14px', margin: '0 auto 16px',
            background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(59,130,246,0.3)',
          }}>
            <span style={{ color: 'white', fontWeight: 700, fontSize: '14px' }}>TH</span>
          </div>
          <div className="spinner" style={{ margin: '0 auto' }} />
          <p style={{ color: '#475569', fontSize: '12px', marginTop: '12px', fontWeight: 500 }}>Loading TrustHut...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#060B14' }}>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/chatbot" element={<ChatbotPage />} />
          <Route path="/post/:postId" element={<PostDetail />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}
