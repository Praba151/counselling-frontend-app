import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav style={{
      backgroundColor: '#2C7A7B', padding: '0 24px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      height: '60px', boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
      position: 'sticky', top: 0, zIndex: 1000, flexWrap: 'wrap', gap: '10px'
    }}>
      <Link to="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold', fontSize: '20px' }}>
        Conselling for students 
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <Link to="/" style={{ color: 'rgba(255,255,255,0.88)', textDecoration: 'none', fontSize: '14px' }}>
          Home
        </Link>

        {user && (
          <Link
            to={user.role === 'client' ? '/client-dashboard' : '/counselor-dashboard'}
            style={{ color: 'rgba(255,255,255,0.88)', textDecoration: 'none', fontSize: '14px' }}
          >
            My Dashboard
          </Link>
        )}

        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '13px' }}>
              👤 {user.name} · <strong>{user.role}</strong>
            </span>
            <button onClick={handleLogout}
              style={{ backgroundColor: '#C53030', color: 'white', border: 'none', padding: '7px 16px', borderRadius: '7px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>
              Logout
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link to="/login" style={{ color: 'rgba(255,255,255,0.88)', textDecoration: 'none', fontSize: '14px' }}>Login</Link>
            <Link to="/register" style={{ backgroundColor: 'white', color: '#2C7A7B', padding: '7px 16px', borderRadius: '7px', textDecoration: 'none', fontWeight: 'bold', fontSize: '13px' }}>
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;