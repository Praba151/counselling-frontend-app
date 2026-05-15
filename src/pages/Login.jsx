import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      const res = await API.post('/auth/login', form);
      login(res.data.user, res.data.token);
      navigate(res.data.user.role === 'client' ? '/client-dashboard' : '/counselor-dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 20px', fontFamily: 'Arial' }}>
      <div style={{ width: '100%', maxWidth: '400px', padding: '30px', border: '1px solid #ddd', borderRadius: '10px' }}>
        <h2 style={{ textAlign: 'center', color: '#2C7A7B', marginBottom: '24px' }}>Login</h2>
        {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
        
        <input placeholder="Email" type="email"
          value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
          style={{ width: '100%', padding: '10px', marginBottom: '14px', border: '1px solid #ccc', borderRadius: '6px', boxSizing: 'border-box' }} />
        
        <input placeholder="Password" type="password"
          value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
          style={{ width: '100%', padding: '10px', marginBottom: '20px', border: '1px solid #ccc', borderRadius: '6px', boxSizing: 'border-box' }} />
        
        <button onClick={handleSubmit} style={{
          width: '100%', padding: '12px', backgroundColor: '#2C7A7B',
          color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px'
        }}>Login</button>
        
        <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px' }}>
          No account? <a href="/register" style={{ color: '#2C7A7B' }}>Register</a>
        </p>
      </div>
    </div>
  );
};

export default Login;