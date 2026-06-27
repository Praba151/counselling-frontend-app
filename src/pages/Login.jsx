import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!form.email || !form.password) {
      setError('Please enter both email and password');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await API.post('/auth/login', form);
      login(res.data.user, res.data.token);
      navigate(res.data.user.role === 'client' ? '/client-dashboard' : '/counselor-dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit();
  };

  const inputStyle = {
    width: '100%', padding: '12px 14px', marginBottom: '16px',
    border: '1px solid #ddd', borderRadius: '8px',
    fontSize: '15px', outline: 'none', boxSizing: 'border-box'
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f7f9fc', fontFamily: 'Arial' }}>
      <div style={{ width: '100%', maxWidth: '420px', padding: '40px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.1)' }}>

        <h2 style={{ textAlign: 'center', color: '#2C7A7B', marginBottom: '8px' }}>Welcome Back 👋</h2>
        <p style={{ textAlign: 'center', color: '#888', marginBottom: '28px', fontSize: '14px' }}>
          Login to your MindBridge account
        </p>

        {error && (
          <div style={{ backgroundColor: '#FFF5F5', color: '#C53030', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', textAlign: 'center' }}>
             {error}
          </div>
        )}

        <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#555' }}>Email</label>
        <input
          placeholder="your@email.com"
          type="email"
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
          onKeyDown={handleKeyDown}
          style={{ ...inputStyle, marginTop: '6px' }}
        />

        <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#555' }}>Password</label>
        <input
          placeholder="Enter your password"
          type="password"
          value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })}
          onKeyDown={handleKeyDown}
          style={{ ...inputStyle, marginTop: '6px' }}
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: '100%', padding: '13px',
            backgroundColor: loading ? '#9ec8c8' : '#2C7A7B',
            color: 'white', border: 'none', borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px', fontWeight: 'bold', marginTop: '8px'
          }}
        >
          {loading ? '⏳ Logging in...' : 'Login →'}
        </button>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#666' }}>
          No account?{' '}
          <Link to="/register" style={{ color: '#2C7A7B', fontWeight: 'bold' }}>
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;