import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PRIMARY = '#2C7A7B';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const linkStyle = { color: 'white', textDecoration: 'none', fontSize: '14px', opacity: 0.95 };

  return (
    <nav style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '14px 30px', backgroundColor: PRIMARY, color: 'white',
      fontFamily: "'Segoe UI', Arial, sans-serif", boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
    }}>
      <Link to="/" style={{ color: 'white', textDecoration: 'none', fontSize: '19px', fontWeight: 700 }}>
        Counselling Services
      </Link>
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        {!user ? (
          <>
            <Link to="/login" style={linkStyle}>Login</Link>
            <Link to="/register" style={{ ...linkStyle, background: 'rgba(255,255,255,0.15)', padding: '7px 16px', borderRadius: '6px' }}>Register</Link>
          </>
        ) : (
          <>
            <span style={{ fontSize: '13px', opacity: 0.85 }}>Hi, {user.name} ({user.role})</span>
            <Link to={user.role === 'client' ? '/client-dashboard' : '/counselor-dashboard'} style={linkStyle}>
              Dashboard
            </Link>
            
            {user.role === 'client' && <Link to="/profile" style={linkStyle}>My Profile</Link>}
            <button onClick={handleLogout} style={{
              background: 'white', color: PRIMARY, border: 'none', fontWeight: 600,
              padding: '7px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px'
            }}>Logout</button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;