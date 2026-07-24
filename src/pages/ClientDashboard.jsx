import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import VideoCall from '../components/VideoCall';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';

const ClientDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [activeCallUrl, setActiveCallUrl] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/appointments/mine').then(res => setAppointments(res.data));
  }, []);

  const statusColor = { pending: '#FFA500', confirmed: '#2C7A7B', completed: '#555', cancelled: 'red' };

  return (
    <div style={{ padding: '30px', fontFamily: 'Arial' }}>
      <h2 style={{ color: '#2C7A7B' }}>Welcome, {user.name} 👋</h2>
      <p>Your upcoming sessions:</p>

      {appointments.length === 0 ? (
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <p style={{ color: '#888' }}>No appointments yet.</p>
          <button onClick={() => navigate('/')} style={{
            padding: '10px 24px', backgroundColor: '#2C7A7B',
            color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer'
          }}>Find a Counselor</button>
        </div>
      ) : (
        <div>
          {appointments.map(appt => (
            <div key={appt._id} style={{
              border: '1px solid #ddd', borderRadius: '10px',
              padding: '16px', marginBottom: '16px', backgroundColor: '#f9f9f9'
            }}>
              <h4 style={{ margin: '0 0 8px', color: '#333' }}>
                Counselor: {appt.counselorId?.name}
              </h4>
              <p style={{ margin: '4px 0', fontSize: '14px' }}>📅 {appt.date} at {appt.time}</p>
              <p style={{ margin: '4px 0', fontSize: '14px' }}>🎯 {appt.sessionType}</p>
              <p style={{ margin: '4px 0', fontSize: '14px' }}>
                Status: <span style={{ color: statusColor[appt.status], fontWeight: 'bold' }}>{appt.status}</span>
              </p>
              <p style={{ margin: '4px 0', fontSize: '14px' }}>
                Payment: <span style={{ fontWeight: 'bold' }}>{appt.paymentStatus}</span>
              </p>
              {appt.status === 'confirmed' && (
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
                  <button
                  onClick={() => navigate(`/chat/${appt._id}`)}
                  style={{ padding: '8px 16px', backgroundColor: '#3182CE', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                    Chat
                  </button>
                  {appt.videoRoomUrl && (
                    <a href={appt.videoRoomUrl} target="_blank" rel="noreferrer">
                      <button style={{ padding: '8px 16px', backgroundColor: '#38A169', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                        Join Video Call
                      </button>
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
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

export default ClientDashboard;