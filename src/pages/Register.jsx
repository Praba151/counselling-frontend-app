import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'client' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setError('');
    if (!form.name.trim()) return setError('Please enter your name');
    if (!form.email) return setError('Please enter your email');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    if (form.password !== form.confirmPassword) return setError('Passwords do not match');

    setLoading(true);
    try {
      const { confirmPassword, ...submitData } = form;
      const res = await API.post('/auth/register', submitData);
      login(res.data.user, res.data.token);
      navigate(res.data.user.role === 'client' ? '/client-dashboard' : '/counselor-dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '12px 14px', marginBottom: '16px',
    border: '1px solid #ddd', borderRadius: '8px',
    fontSize: '15px', outline: 'none', boxSizing: 'border-box'
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f7f9fc', fontFamily: 'Arial', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '440px', padding: '40px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.1)' }}>

        <h2 style={{ textAlign: 'center', color: '#2C7A7B', marginBottom: '8px' }}>Create Account 🌟</h2>
        <p style={{ textAlign: 'center', color: '#888', marginBottom: '24px', fontSize: '14px' }}>
          Join MindBridge today
        </p>

        {error && (
          <div style={{ backgroundColor: '#FFF5F5', color: '#C53030', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', textAlign: 'center' }}>
             {error}
          </div>
        )}

        {/* Client or Counselor selection */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          {[
            { value: 'client', label: '👤 I need counseling', desc: 'Find and book sessions' },
            { value: 'counselor', label: '🩺 I am a counselor', desc: 'Offer your services' }
          ].map(opt => (
            <button key={opt.value} type="button"
              onClick={() => setForm({ ...form, role: opt.value })}
              style={{
                flex: 1, padding: '12px 8px',
                border: `2px solid ${form.role === opt.value ? '#2C7A7B' : '#ddd'}`,
                borderRadius: '10px', cursor: 'pointer', textAlign: 'center',
                backgroundColor: form.role === opt.value ? '#e0f2f2' : 'white',
                fontWeight: form.role === opt.value ? 'bold' : 'normal', fontSize: '13px'
              }}>
              <div>{opt.label}</div>
              <div style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>{opt.desc}</div>
            </button>
          ))}
        </div>

        <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#555' }}>Full Name</label>
        <input placeholder="Your full name" value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          style={{ ...inputStyle, marginTop: '5px' }} />

        <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#555' }}>Email Address</label>
        <input placeholder="your@email.com" type="email" value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
          style={{ ...inputStyle, marginTop: '5px' }} />

        <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#555' }}>Password</label>
        <input placeholder="Min 6 characters" type="password" value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })}
          style={{ ...inputStyle, marginTop: '5px' }} />

        <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#555' }}>Confirm Password</label>
        <input placeholder="Repeat your password" type="password" value={form.confirmPassword}
          onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
          style={{ ...inputStyle, marginTop: '5px' }} />

        <button onClick={handleSubmit} disabled={loading}
          style={{
            width: '100%', padding: '13px',
            backgroundColor: loading ? '#9ec8c8' : '#2C7A7B',
            color: 'white', border: 'none', borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px', fontWeight: 'bold'
          }}>
          {loading ? '⏳ Creating account...' : 'Create Account →'}
        </button>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#666' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#2C7A7B', fontWeight: 'bold' }}>Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;