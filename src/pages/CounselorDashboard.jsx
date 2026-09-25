import { useEffect, useState } from 'react';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const PRIMARY = '#2C7A7B';
const MUTED = '#6B7280';
const BORDER = '#E2E8F0';
const TEXT = '#1F2937';

const inputStyle = {
  width: '100%', padding: '10px 12px', marginTop: '6px', marginBottom: '16px',
  border: `1px solid ${BORDER}`, borderRadius: '8px', boxSizing: 'border-box', fontSize: '14px'
};
const labelStyle = { fontWeight: 600, fontSize: '13px', color: TEXT };
const cardStyle = { background: '#fff', border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(16,24,40,0.06)' };

const btn = (bg, color = 'white', extra = {}) => ({
  padding: '10px 18px', borderRadius: '8px', border: 'none', fontSize: '14px',
  fontWeight: 600, cursor: 'pointer', background: bg, color, ...extra
});

const statusColor = {
  pending: { bg: '#FFF7E6', color: '#B7791F' },
  confirmed: { bg: '#E6F4F3', color: PRIMARY },
  completed: { bg: '#EDF2F7', color: '#4A5568' },
  cancelled: { bg: '#FDECEC', color: '#C53030' },
};

const getPhotoUrl = (filename) => {
  if (!filename) return null;
  const base = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');
  return `${base}/uploads/${filename}`;
};

const getInitials = (name = '') =>
  name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]?.toUpperCase()).join('') || '?';

const CounselorDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showProfileForm, setShowProfileForm] = useState(false); 

  // --- Photo upload state ---
  const [photoFile, setPhotoFile] = useState(null);       
  const [photoPreview, setPhotoPreview] = useState(null);  
  const [savedPhotoFilename, setSavedPhotoFilename] = useState(''); 

  const [profile, setProfile] = useState({
    name: '', phone: '', bio: '', expertise: '', sessionTypes: '', pricePerSession: 500,
  });
  const [slots, setSlots] = useState([]);       
  const [bookedSlots, setBookedSlots] = useState([]); 
  const [newSlotDate, setNewSlotDate] = useState('');
  const [newSlotTime, setNewSlotTime] = useState('');

  const { user, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/appointments/mine').then(res => setAppointments(res.data));

    const myId = user?._id || user?.id;
    if (myId) {
      API.get(`/counselors/${myId}`)
        .then(res => {
          const p = res.data;
          if (p) {
            setProfile({
              name: user?.name || '',
              phone: user?.phone || '',
              bio: p.bio || '',
              expertise: (p.expertise || []).join(', '),
              sessionTypes: (p.sessionTypes || []).join(', '),
              pricePerSession: p.pricePerSession || 500,
            });
            setSlots((p.availableSlots || []).filter(s => !s.isBooked));
            setBookedSlots((p.availableSlots || []).filter(s => s.isBooked));
            setSavedPhotoFilename(p.photoUrl || '');
          } else {
            setProfile(prev => ({ ...prev, name: user?.name || '', phone: user?.phone || '' }));
          }
        })
        .catch(() => {
          setProfile(prev => ({ ...prev, name: user?.name || '', phone: user?.phone || '' }));
        })
        .finally(() => setLoadingProfile(false));
    } else {
      setLoadingProfile(false);
    }
  }, []);

  const addSlot = () => {
    if (!newSlotDate || !newSlotTime) {
      alert('Pick both a date and a time before adding the slot.');
      return;
    }
    const exists = slots.some(s => s.date === newSlotDate && s.time === newSlotTime);
    if (exists) {
      alert('That slot is already in your list.');
      return;
    }
    setSlots(prev => [...prev, { date: newSlotDate, time: newSlotTime }].sort((a, b) =>
      (a.date + a.time).localeCompare(b.date + b.time)
    ));
    setNewSlotDate('');
    setNewSlotTime('');
  };

  const removeSlot = (index) => {
    setSlots(prev => prev.filter((_, i) => i !== index));
  };

  const handlePhotoChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setPhotoFile(f);
    setPhotoPreview(URL.createObjectURL(f));
  };

  const saveAll = async () => {
    if (slots.length === 0) {
      alert('Please add at least one available slot before saving.');
      return;
    }
    setSaving(true);
    try {
      
      const authRes = await API.put('/auth/profile', { name: profile.name, phone: profile.phone });
      const token = localStorage.getItem('token');
      login({ ...user, name: authRes.data.name, phone: authRes.data.phone }, token);

      
      const formData = new FormData();
      formData.append('bio', profile.bio);
      formData.append('pricePerSession', profile.pricePerSession);
      profile.expertise.split(',').map(s => s.trim()).filter(Boolean).forEach(v => formData.append('expertise', v));
      profile.sessionTypes.split(',').map(s => s.trim()).filter(Boolean).forEach(v => formData.append('sessionTypes', v));
      formData.append('availableSlots', JSON.stringify([...bookedSlots, ...slots]));
      if (photoFile) formData.append('photo', photoFile);

      const res = await API.post('/counselors/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data?.photoUrl) setSavedPhotoFilename(res.data.photoUrl);
      setPhotoFile(null);
      setPhotoPreview(null);
      alert('Profile saved!');
    } catch (err) {
      alert('Error saving profile: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (id, status) => {
    await API.put(`/appointments/${id}/status`, { status });
    setAppointments(prev => prev.map(a => a._id === id ? { ...a, status } : a));
  };

  const displayedPhoto = photoPreview || getPhotoUrl(savedPhotoFilename);

  return (
    <div style={{ padding: '32px 24px', maxWidth: '1100px', margin: '0 auto', fontFamily: "'Segoe UI', Arial, sans-serif", color: TEXT }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, margin: 0 }}>Counsellor Dashboard</h1>
          <p style={{ color: MUTED, fontSize: '14px' }}>Welcome back, {user.name}</p>
        </div>
        <button onClick={() => navigate('/client-records')} style={btn('white', PRIMARY, { border: `1px solid ${PRIMARY}` })}>
          Client Records
        </button>
      </div>

      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, margin: 0 }}>Your Appointments</h2>
        <button onClick={() => setShowProfileForm(!showProfileForm)} style={btn('white', PRIMARY, { border: `1px solid ${PRIMARY}` })}>
          {showProfileForm ? 'Hide Profile Form' : 'Edit My Profile'}
        </button>
      </div>

      {appointments.length === 0 ? (
        <p style={{ color: MUTED, marginBottom: '24px' }}>No appointments yet.</p>
      ) : (
        <div style={{ marginBottom: '24px' }}>
          {appointments.map(appt => {
            const s = statusColor[appt.status] || statusColor.pending;
            return (
              <div key={appt._id} style={{ ...cardStyle, marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <h3 style={{ margin: '0 0 6px', fontSize: '16px' }}>{appt.clientId?.name}</h3>
                    <p style={{ color: MUTED, fontSize: '14px', margin: '2px 0' }}>{appt.date} at {appt.time} · {appt.sessionType}</p>
                    <p style={{ color: MUTED, fontSize: '14px', margin: '2px 0' }}>Payment: <strong>{appt.paymentStatus}</strong></p>
                  </div>
                  <span style={{
                    display: 'inline-block', background: s.bg, color: s.color, fontSize: '12px',
                    fontWeight: 600, padding: '4px 10px', borderRadius: '999px'
                  }}>{appt.status}</span>
                </div>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '14px' }}>
                  {appt.status === 'pending' && (
                    <button onClick={() => updateStatus(appt._id, 'confirmed')} style={btn('#2F855A')}>Confirm</button>
                  )}
                  {appt.status !== 'cancelled' && (
                    <button onClick={() => updateStatus(appt._id, 'cancelled')} style={btn('#C53030')}>Cancel</button>
                  )}
                  {appt.videoRoomUrl ? (
                    <a href={appt.videoRoomUrl} target="_blank" rel="noreferrer">
                      <button style={btn(PRIMARY)}>Join Video Call</button>
                    </a>
                  ) : (
                    <button disabled title="Video call link not set up yet" style={btn('#A0AEC0', 'white', { cursor: 'not-allowed' })}>
                      Join Video Call
                    </button>
                  )}
                  <button onClick={() => navigate(`/session-notes/${appt._id}`)} style={btn('white', PRIMARY, { border: `1px solid ${PRIMARY}` })}>Session Notes</button>
                  <button onClick={() => navigate(`/chat/${appt._id}`)} style={btn('white', PRIMARY, { border: `1px solid ${PRIMARY}` })}>Chat</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      
      {showProfileForm && (
        <div style={{ ...cardStyle, marginBottom: '28px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, margin: '0 0 4px' }}>My Profile</h2>
          <p style={{ color: MUTED, fontSize: '14px', marginTop: 0, marginBottom: '18px' }}>
            This will show when client browse about you , keep it up to date .
          </p>

          {loadingProfile ? (
            <p style={{ color: MUTED }}>Loading your profile…</p>
          ) : (
            <>
       
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                {displayedPhoto ? (
                  <img src={displayedPhoto} alt="Your profile" style={{
                    width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: `1px solid ${BORDER}`
                  }} />
                ) : (
                  <div style={{
                    width: 72, height: 72, borderRadius: '50%', background: '#E6F4F3', color: PRIMARY,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '24px'
                  }}>
                    {getInitials(profile.name)}
                  </div>
                )}
                <div>
                  <label style={{ ...labelStyle, display: 'block', marginBottom: '6px' }}>Profile photo</label>
                  <input type="file" accept="image/*" onChange={handlePhotoChange} style={{ fontSize: '13px' }} />
                  <p style={{ color: MUTED, fontSize: '12px', margin: '4px 0 0' }}>JPG or PNG. Shown on your public profile & the home page.</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
                <div>
                  <label style={labelStyle}>Full Name</label>
                  <input style={inputStyle} value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Phone Number</label>
                  <input style={inputStyle} value={profile.phone} placeholder="e.g. 9876543210"
                    onChange={e => setProfile({ ...profile, phone: e.target.value })} />
                </div>
              </div>

              <label style={labelStyle}>Bio (about yourself)</label>
              <textarea rows={3} style={{ ...inputStyle, resize: 'vertical' }} value={profile.bio}
                onChange={e => setProfile({ ...profile, bio: e.target.value })} />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
                <div>
                  <label style={labelStyle}>Expertise (comma-separated)</label>
                  <input style={inputStyle} placeholder="Mental Health, Career"
                    value={profile.expertise} onChange={e => setProfile({ ...profile, expertise: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Session Types (comma-separated)</label>
                  <input style={inputStyle} placeholder="1:1 Counselling, Couples"
                    value={profile.sessionTypes} onChange={e => setProfile({ ...profile, sessionTypes: e.target.value })} />
                </div>
              </div>

              <label style={labelStyle}>Price per session (₹)</label>
              <input type="number" style={{ ...inputStyle, maxWidth: '200px' }} value={profile.pricePerSession}
                onChange={e => setProfile({ ...profile, pricePerSession: e.target.value })} />

             
              <label style={{ ...labelStyle, display: 'block', marginTop: '4px' }}>Available Slots</label>
              <p style={{ color: MUTED, fontSize: '13px', margin: '2px 0 10px' }}>Pick a date and time, then add it to your list.</p>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '12px' }}>
                <input type="date" style={{ ...inputStyle, margin: 0, width: 'auto' }} value={newSlotDate}
                  onChange={e => setNewSlotDate(e.target.value)} />
                <input type="time" style={{ ...inputStyle, margin: 0, width: 'auto' }} value={newSlotTime}
                  onChange={e => setNewSlotTime(e.target.value)} />
                <button type="button" onClick={addSlot} style={btn('white', PRIMARY, { border: `1px solid ${PRIMARY}` })}>+ Add Slot</button>
              </div>

              {slots.length === 0 ? (
                <p style={{ color: MUTED, fontSize: '14px' }}>No slots added yet.</p>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
                  {slots.map((s, i) => (
                    <span key={i} style={{
                      display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px',
                      background: '#E6F4F3', color: PRIMARY, padding: '6px 10px', borderRadius: '999px'
                    }}>
                      {s.date} · {s.time}
                      <button onClick={() => removeSlot(i)} title="Remove"
                        style={{ border: 'none', background: 'transparent', color: '#C53030', cursor: 'pointer', fontWeight: 700 }}>×</button>
                    </span>
                  ))}
                </div>
              )}

              <button onClick={saveAll} disabled={saving} style={btn('#2F855A', 'white', { opacity: saving ? 0.7 : 1 })}>
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CounselorDashboard;