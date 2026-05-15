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
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '14px 30px', backgroundColor: '#2C7A7B', color: 'white'
    }}>
      <Link to="/" style={{ color: 'white', textDecoration: 'none', fontSize: '20px', fontWeight: 'bold' }}> Counselling Services
      </Link>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        {!user ? (
          <>
            <Link to="/login" style={{ color: 'white', textDecoration: 'none' }}>Login</Link>
            <Link to="/register" style={{ color: 'white', textDecoration: 'none' }}>Register</Link>
          </>
        ) : (
          <>
            <span style={{ fontSize: '14px' }}>Hi, {user.name} ({user.role})</span>
            <Link to={user.role === 'client' ? '/client-dashboard' : '/counselor-dashboard'}
              style={{ color: 'white', textDecoration: 'none' }}>Dashboard</Link>
            <button onClick={handleLogout} style={{
              background: 'white', color: '#2C7A7B', border: 'none',
              padding: '6px 14px', borderRadius: '6px', cursor: 'pointer'
            }}>Logout</button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;