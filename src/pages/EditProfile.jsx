import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';

const EditProfile = () => {
  const { user, login } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [status, setStatus] = useState('');

  const handleSave = async () => {
    setStatus('Saving...');
    try {
      const res = await API.put('/auth/profile', { name, phone });
      const token = localStorage.getItem('token');
      login({ ...user, name: res.data.name, phone: res.data.phone }, token);
      setStatus('✅ Profile updated!');
    } catch (err) {
      setStatus('❌ ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div style={{ padding: '30px', fontFamily: 'Arial', maxWidth: '500px', margin: '0 auto' }}>
      <h2 style={{ color: '#2C7A7B' }}>My Profile</h2>
      <div style={{ border: '1px solid #ddd', borderRadius: '10px', padding: '20px', backgroundColor: '#f0fafa' }}>
        <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Full Name</label>
        <input value={name} onChange={e => setName(e.target.value)}
          style={{ width: '100%', padding: '10px', marginTop: '6px', marginBottom: '14px', border: '1px solid #ccc', borderRadius: '6px', boxSizing: 'border-box' }} />

        <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Phone Number</label>
        <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="e.g. 9876543210"
          style={{ width: '100%', padding: '10px', marginTop: '6px', marginBottom: '14px', border: '1px solid #ccc', borderRadius: '6px', boxSizing: 'border-box' }} />

        <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Email</label>
        <input value={user?.email || ''} disabled
          style={{ width: '100%', padding: '10px', marginTop: '6px', marginBottom: '14px', border: '1px solid #ccc', borderRadius: '6px', boxSizing: 'border-box', backgroundColor: '#eee' }} />

        <button onClick={handleSave} style={{
          padding: '10px 24px', backgroundColor: '#2C7A7B',
          color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer'
        }}>Save Changes</button>
        {status && <p style={{ marginTop: '10px', fontSize: '14px' }}>{status}</p>}
      </div>
    </div>
  );
};

export default EditProfile;