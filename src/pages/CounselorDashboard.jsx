import { useEffect, useState } from 'react';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';
import VideoCall from '../components/VideoCall';
import { useNavigate } from 'react-router-dom';

const CounselorDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [profile, setProfile] = useState({ bio: '', expertise: '', sessionTypes: '', pricePerSession: 500, availableSlots: '' });
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [activeCallUrl, setActiveCallUrl] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/appointments/mine').then(res => setAppointments(res.data));
  }, []);

  const saveProfile = async () => {
    try {
      await API.post('/counselors/profile', {
        ...profile,
        expertise: profile.expertise.split(',').map(s => s.trim()),
        sessionTypes: profile.sessionTypes.split(',').map(s => s.trim()),
        availableSlots: profile.availableSlots.split(',').map(slot => {
          const [date, time] = slot.trim().split(' ');
          return { date, time };
        })
      });
      alert('Profile saved! ');
      setShowProfileForm(false);
    } catch (err) {
      alert('Error saving profile',err);
    }
  };

  const updateStatus = async (id, status) => {
    await API.put(`/appointments/${id}/status`, { status });
    setAppointments(prev => prev.map(a => a._id === id ? { ...a, status } : a));
  };

  const inputStyle = {
    width: '100%', padding: '10px', marginBottom: '10px',
    border: '1px solid #ccc', borderRadius: '6px', boxSizing: 'border-box'
  };

  return (
    <div style={{ padding: '30px', fontFamily: 'Arial' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: '#2C7A7B' }}>Counselor Dashboard — {user.name}</h2>
        <button onClick={() => setShowProfileForm(!showProfileForm)} style={{
          padding: '10px 20px', backgroundColor: '#2C7A7B',
          color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer'
        }}>
          {showProfileForm ? 'Hide Profile Form' : '✏️ Edit My Profile'}
        </button>
      </div>
      {showProfileForm && (
        <div style={{ border: '1px solid #ddd', borderRadius: '10px', padding: '20px', marginBottom: '30px', backgroundColor: '#f0fafa' }}>
          <h3 style={{ color: '#2C7A7B' }}>Update Your Profile</h3>
          <input placeholder="Bio (about yourself)" value={profile.bio}
            onChange={e => setProfile({ ...profile, bio: e.target.value })} style={inputStyle} />
          <input placeholder="Expertise (comma-separated, e.g. Mental Health, Career)"
            value={profile.expertise} onChange={e => setProfile({ ...profile, expertise: e.target.value })} style={inputStyle} />
          <input placeholder="Session Types (comma-separated, e.g. Mental Health, Relationship Advice)"
            value={profile.sessionTypes} onChange={e => setProfile({ ...profile, sessionTypes: e.target.value })} style={inputStyle} />
          <input placeholder="Price per session (₹)" type="number"
            value={profile.pricePerSession} onChange={e => setProfile({ ...profile, pricePerSession: e.target.value })} style={inputStyle} />
          <input placeholder="Available slots (e.g. 2025-01-15 10:00, 2025-01-16 14:00)"
            value={profile.availableSlots} onChange={e => setProfile({ ...profile, availableSlots: e.target.value })} style={inputStyle} />
          <button onClick={saveProfile} style={{
            padding: '10px 24px', backgroundColor: '#38A169',
            color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer'
          }}>Save Profile</button>
        </div>
      )}

      <h3 style={{ color: '#333' }}>Your Appointments</h3>
      {appointments.length === 0 ? (
        <p style={{ color: '#888' }}>No appointments yet.</p>
      ) : (
        appointments.map(appt => (
          <div key={appt._id} style={{
            border: '1px solid #ddd', borderRadius: '10px',
            padding: '16px', marginBottom: '16px', backgroundColor: '#f9f9f9'
          }}>
            <h4>Client: {appt.clientId?.name}</h4>
            <p style={{ fontSize: '14px' }}>📅 {appt.date} at {appt.time} — 🎯 {appt.sessionType}</p>
            <p style={{ fontSize: '14px' }}>Status: <strong>{appt.status}</strong></p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
              {appt.status === 'pending' && (
                <button onClick={() => updateStatus(appt._id, 'confirmed')} style={{
                  padding: '8px 16px', backgroundColor: '#38A169', color: 'white',
                  border: 'none', borderRadius: '6px', cursor: 'pointer'
                }}> Confirm</button>
              )}
              {appt.status !== 'cancelled' && (
                <button onClick={() => updateStatus(appt._id, 'cancelled')} style={{
                  padding: '8px 16px', backgroundColor: '#E53E3E', color: 'white',
                  border: 'none', borderRadius: '6px', cursor: 'pointer'
                }}> Cancel</button>
              )}
              {appt.status === 'confirmed' && appt.videoRoomUrl && (
                <a href={appt.videoRoomUrl} target="_blank" rel="noreferrer">
                  <button style={{ padding: '8px 16px', backgroundColor: '#3182CE', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                    🎥 Join Call
                  </button>
                </a>
              )}
              <button onClick={() => navigate(`/session-notes/${appt._id}`)} style={{
                padding: '8px 16px', backgroundColor: '#805AD5', color: 'white',
                border: 'none', borderRadius: '6px', cursor: 'pointer'
              }}>📝 Session Notes</button>
            </div>
          </div>
        ))
      )}
      {activeCallUrl && (
        <VideoCall
        roomUrl={activeCallUrl}
        onLeave={() => setActiveCallUrl(null)}
        />
        )}
    </div>
  );
};

export default CounselorDashboard;