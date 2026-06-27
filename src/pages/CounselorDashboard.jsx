import { useEffect, useState } from 'react';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const CounselorDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('pending');
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    bio: '', expertise: '', sessionTypes: '', pricePerSession: 500, availableSlots: ''
  });
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/appointments/mine')
      .then(res => setAppointments(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const saveProfile = async () => {
    setSaving(true);
    try {
      await API.post('/counselors/profile', {
        ...profile,
        expertise: profile.expertise.split(',').map(s => s.trim()).filter(Boolean),
        sessionTypes: profile.sessionTypes.split(',').map(s => s.trim()).filter(Boolean),
        availableSlots: profile.availableSlots.split(',').map(slot => {
          const parts = slot.trim().split(' ');
          return { date: parts[0], time: parts[1] || '09:00' };
        }).filter(s => s.date)
      });
      alert('✅ Profile saved successfully!');
      setShowProfileForm(false);
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await API.put(`/appointments/${id}/status`, { status });
      setAppointments(prev => prev.map(a => a._id === id ? { ...a, status } : a));
    } catch (err) {
      alert('Update failed: ' + err.response?.data?.message);
    }
  };

  const pendingApts   = appointments.filter(a => a.status === 'pending');
  const confirmedApts = appointments.filter(a => a.status === 'confirmed');
  const allActive     = appointments.filter(a => a.status !== 'cancelled');
  const tabMap        = { pending: pendingApts, confirmed: confirmedApts, all: allActive };
  const displayed     = tabMap[tab] || [];

  const totalEarned = appointments
    .filter(a => a.paymentStatus === 'paid')
    .reduce((sum, a) => sum + (a.amount || 0), 0);

  const inputStyle = {
    width: '100%', padding: '10px 12px', marginBottom: '12px',
    border: '1px solid #ddd', borderRadius: '8px',
    fontSize: '14px', outline: 'none', boxSizing: 'border-box'
  };

  return (
    <div style={{ padding: '30px', fontFamily: 'Arial', maxWidth: '950px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ color: '#2C7A7B', margin: 0 }}>Counselor Dashboard</h2>
          <p style={{ color: '#888', margin: '4px 0 0', fontSize: '14px' }}>Welcome, Dr. {user?.name}</p>
        </div>
        <button onClick={() => setShowProfileForm(!showProfileForm)}
          style={{ padding: '10px 20px', backgroundColor: '#2C7A7B', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
          {showProfileForm ? 'Close Form' : '✏️ Edit My Profile'}
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Pending',       value: pendingApts.length,   icon: '🕐', color: '#e65100' },
          { label: 'Confirmed',     value: confirmedApts.length, icon: '✅', color: '#2e7d32' },
          { label: 'Total',         value: allActive.length,     icon: '📅', color: '#2C7A7B' },
          { label: 'Earned',        value: `₹${totalEarned}`,    icon: '💰', color: '#5b21b6' },
        ].map(stat => (
          <div key={stat.label} style={{ backgroundColor: 'white', borderRadius: '10px', padding: '16px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
            <div style={{ fontSize: '26px' }}>{stat.icon}</div>
            <div style={{ fontSize: '22px', fontWeight: 'bold', color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: '12px', color: '#888' }}>{stat.label}</div>
          </div>
        ))}
      </div>
      {showProfileForm && (
        <div style={{ border: '1px solid #ddd', borderRadius: '12px', padding: '24px', marginBottom: '28px', backgroundColor: '#f0fafa' }}>
          <h3 style={{ color: '#2C7A7B', marginTop: 0 }}>Update Your Profile</h3>

          <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#555' }}>Bio</label>
          <textarea value={profile.bio} onChange={e => setProfile({ ...profile, bio: e.target.value })}
            placeholder="Tell clients about your background..." rows={3}
            style={{ ...inputStyle, resize: 'vertical', marginTop: '5px' }} />

          <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#555' }}>Expertise (comma-separated)</label>
          <input placeholder="e.g. Mental Health, Anxiety, Depression" value={profile.expertise}
            onChange={e => setProfile({ ...profile, expertise: e.target.value })}
            style={{ ...inputStyle, marginTop: '5px' }} />

          <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#555' }}>Session Types (comma-separated)</label>
          <input placeholder="e.g. Mental Health, Career Counseling" value={profile.sessionTypes}
            onChange={e => setProfile({ ...profile, sessionTypes: e.target.value })}
            style={{ ...inputStyle, marginTop: '5px' }} />

          <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#555' }}>Price Per Session (₹)</label>
          <input type="number" min="0" value={profile.pricePerSession}
            onChange={e => setProfile({ ...profile, pricePerSession: e.target.value })}
            style={{ ...inputStyle, marginTop: '5px' }} />

          <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#555' }}>Available Slots (comma-separated)</label>
          <input placeholder="e.g. 2025-08-20 10:00, 2025-08-21 14:00" value={profile.availableSlots}
            onChange={e => setProfile({ ...profile, availableSlots: e.target.value })}
            style={{ ...inputStyle, marginTop: '5px' }} />
          <p style={{ fontSize: '12px', color: '#888', marginTop: '-8px' }}>Format: YYYY-MM-DD HH:MM</p>

          <button onClick={saveProfile} disabled={saving}
            style={{ padding: '11px 28px', backgroundColor: saving ? '#9ec8c8' : '#38A169', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
            {saving ? '⏳ Saving...' : ' Save Profile'}
          </button>
        </div>
      )}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {[
          { key: 'pending',   label: ` Pending (${pendingApts.length})` },
          { key: 'confirmed', label: ` Confirmed (${confirmedApts.length})` },
          { key: 'all',       label: ` All (${allActive.length})` }
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{ padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', backgroundColor: tab === t.key ? '#2C7A7B' : '#eee', color: tab === t.key ? 'white' : '#555' }}>
            {t.label}
          </button>
        ))}
      </div>
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>⏳ Loading...</div>
      ) : displayed.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px', backgroundColor: 'white', borderRadius: '12px', color: '#888' }}>
          <p style={{ fontSize: '36px' }}></p>
          <p>No {tab} appointments right now.</p>
        </div>
      ) : (
        displayed.map(appt => (
          <div key={appt._id} style={{ border: '1px solid #e8e8e8', borderRadius: '12px', padding: '20px', marginBottom: '16px', backgroundColor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h4 style={{ margin: '0 0 6px', color: '#333' }}>👤 {appt.clientId?.name}</h4>
                <p style={{ margin: '3px 0', fontSize: '14px', color: '#666' }}> {appt.date} at {appt.time} | 🎯 {appt.sessionType}</p>
                <p style={{ margin: '3px 0', fontSize: '13px', color: '#888' }}> {appt.clientId?.email}</p>
              </div>
              <span style={{
                padding: '5px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold', height: 'fit-content',
                backgroundColor: appt.status === 'confirmed' ? '#D4EDDA' : appt.status === 'pending' ? '#FFF3CD' : '#F8D7DA',
                color: appt.status === 'confirmed' ? '#155724' : appt.status === 'pending' ? '#856404' : '#721C24'
              }}>
                {appt.status}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '14px' }}>
              {appt.status === 'pending' && (
                <button onClick={() => updateStatus(appt._id, 'confirmed')}
                  style={{ padding: '8px 18px', backgroundColor: '#38A169', color: 'white', border: 'none', borderRadius: '7px', cursor: 'pointer', fontWeight: 'bold' }}>
                   Confirm
                </button>
              )}
              {appt.status === 'confirmed' && (
                <>
                  {appt.videoRoomUrl && (
                    <a href={appt.videoRoomUrl} target="_blank" rel="noreferrer">
                      <button style={{ padding: '8px 18px', backgroundColor: '#3182CE', color: 'white', border: 'none', borderRadius: '7px', cursor: 'pointer', fontWeight: 'bold' }}>
                        Join Call
                      </button>
                    </a>
                  )}
                  <button onClick={() => navigate(`/chat/${appt._id}`)}
                    style={{ padding: '8px 18px', backgroundColor: '#6B46C1', color: 'white', border: 'none', borderRadius: '7px', cursor: 'pointer', fontWeight: 'bold' }}>
                    Chat
                  </button>
                  <button onClick={() => navigate(`/session-notes/${appt._id}`)}
                    style={{ padding: '8px 18px', backgroundColor: '#805AD5', color: 'white', border: 'none', borderRadius: '7px', cursor: 'pointer', fontWeight: 'bold' }}>
                    Notes
                  </button>
                  <button onClick={() => updateStatus(appt._id, 'completed')}
                    style={{ padding: '8px 18px', backgroundColor: '#2C7A7B', color: 'white', border: 'none', borderRadius: '7px', cursor: 'pointer', fontWeight: 'bold' }}>
                    ✔️ Mark Complete
                  </button>
                </>
              )}
              {appt.status !== 'cancelled' && appt.status !== 'completed' && (
                <button onClick={() => updateStatus(appt._id, 'cancelled')}
                  style={{ padding: '8px 18px', backgroundColor: '#E53E3E', color: 'white', border: 'none', borderRadius: '7px', cursor: 'pointer', fontWeight: 'bold' }}>
                  Cancel
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default CounselorDashboard;