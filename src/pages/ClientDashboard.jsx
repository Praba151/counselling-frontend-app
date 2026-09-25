import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';

const PRIMARY = '#2C7A7B';
const MUTED = '#6B7280';
const BORDER = '#E2E8F0';
const TEXT = '#1F2937';

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

const ClientDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const highlightRef = useRef(null);

  useEffect(() => {
    API.get('/appointments/mine').then(res => setAppointments(res.data));
  }, []);

  useEffect(() => {
    if (location.state?.highlightId && highlightRef.current) {
      highlightRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [appointments]);

  return (
    <div style={{ padding: '32px 24px', maxWidth: '1100px', margin: '0 auto', fontFamily: "'Segoe UI', Arial, sans-serif", color: TEXT }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, margin: 0 }}>Welcome, {user.name}</h1>
          <p style={{ color: MUTED, fontSize: '14px' }}>Your sessions, all in one place</p>
        </div>
       
        <button onClick={() => navigate('/')} style={btn(PRIMARY)}>
          Browse Counsellors
        </button>
      </div>

      {appointments.length === 0 ? (
        <div style={{ ...cardStyle, textAlign: 'center', padding: '40px' }}>
          <p style={{ color: MUTED }}>No appointments yet.</p>
          <button onClick={() => navigate('/')} style={{ ...btn(PRIMARY), marginTop: '10px' }}>Find a Counsellor</button>
        </div>
      ) : (
        <div>
          {appointments.map(appt => {
            const s = statusColor[appt.status] || statusColor.pending;
            const justBooked = location.state?.highlightId === appt._id;
            return (
              <div key={appt._id}
                ref={justBooked ? highlightRef : null}
                style={{
                  ...cardStyle, marginBottom: '16px',
                  border: justBooked ? `2px solid ${PRIMARY}` : `1px solid ${BORDER}`
                }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <h3 style={{ margin: '0 0 6px', fontSize: '16px' }}>{appt.counselorId?.name}</h3>
                    <p style={{ color: MUTED, fontSize: '14px', margin: '2px 0' }}>{appt.date} at {appt.time} · {appt.sessionType}</p>
                    <p style={{ color: MUTED, fontSize: '14px', margin: '2px 0' }}>Payment: <strong>{appt.paymentStatus}</strong></p>
                  </div>
                  <span style={{
                    display: 'inline-block', background: s.bg, color: s.color, fontSize: '12px',
                    fontWeight: 600, padding: '4px 10px', borderRadius: '999px'
                  }}>{appt.status}</span>
                </div>

                
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '14px', borderTop: `1px solid ${BORDER}`, paddingTop: '14px' }}>
                  <button onClick={() => navigate(`/session-notes/${appt._id}`)} style={btn('white', PRIMARY, { border: `1px solid ${PRIMARY}` })}>Session Notes</button>
                  <button onClick={() => navigate(`/chat/${appt._id}`)} style={btn('white', PRIMARY, { border: `1px solid ${PRIMARY}` })}>Chat</button>
                  {appt.videoRoomUrl ? (
                    <a href={appt.videoRoomUrl} target="_blank" rel="noreferrer">
                      <button style={btn(PRIMARY)}>Join Video Call</button>
                    </a>
                  ) : (
                    <button disabled title="Video call link will be available once counselor confirms" style={btn('#A0AEC0', 'white', { cursor: 'not-allowed' })}>
                      Join Video Call
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ClientDashboard;