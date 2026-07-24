import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'client' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      const res = await API.post('/auth/register', form);
      login(res.data.user, res.data.token);
      navigate(res.data.user.role === 'client' ? '/client-dashboard' : '/counselor-dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  const inputStyle = {
    width: '100%', padding: '10px', marginBottom: '14px',
    border: '1px solid #ccc', borderRadius: '6px', boxSizing: 'border-box'
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 20px', fontFamily: 'Arial' }}>
      <div style={{ width: '100%', maxWidth: '400px', padding: '30px', border: '1px solid #ddd', borderRadius: '10px' }}>
        <h2 style={{ textAlign: 'center', color: '#2C7A7B', marginBottom: '24px' }}>Register</h2>
        {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
        
        <input placeholder="Full Name" value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })} style={inputStyle} />
        
        <input placeholder="Email" type="email" value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })} style={inputStyle} />
        
        <input placeholder="Password" type="password" value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })} style={inputStyle} />
        <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
          style={{ ...inputStyle, backgroundColor: 'white' }}>
          <option value="client">I am a Client</option>
          <option value="counselor">I am a Counselor</option>
        </select>
        
        <button onClick={handleSubmit} style={{
          width: '100%', padding: '12px', backgroundColor: '#2C7A7B',
          color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px'
        }}>Register</button>
      </div>
    </div>
  );
};

export default Register;