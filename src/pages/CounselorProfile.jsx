import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../utils/api';

const CounselorProfile = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [appointment, setAppointment] = useState(null); // Tracks existing session if any
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch counselor details
    API.get(`/counselors/${id}`).then(res => setProfile(res.data));

    // Optional: Fetch client's appointments to check if a active booking exists with this counselor
    API.get('/appointments/mine')
      .then(res => {
        const existing = res.data.find(appt => appt.counselorId?._id === id || appt.counselorId === id);
        if (existing) setAppointment(existing);
      })
      .catch(err => console.log('No appointment found or unauthenticated', err));
  }, [id]);

  if (!profile) return <p style={{ padding: '30px' }}>Loading...</p>;

  const cleanList = (arr) => {
    if (!arr || arr.length === 0) return '';
    return [...new Set(arr.map(item => item.trim()))].join(', ');
  };

  return (
    <div style={{ padding: '30px', fontFamily: 'Arial', maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ color: '#2C7A7B', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
        {profile.userId?.name}
      </h2>
      <p style={{ color: '#555', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
        {profile.bio}
      </p>

      <div style={{ marginTop: '20px' }}>
        <p style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
          <strong>Expertise:</strong> {cleanList(profile.expertise)}
        </p>
        <p style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
          <strong>Services:</strong> {cleanList(profile.sessionTypes)}
        </p>
        <p style={{ color: '#2C7A7B', fontSize: '18px' }}>
          <strong>₹{profile.pricePerSession}</strong> / session
        </p>
      </div>

      {/* Action Buttons Section */}
      <div style={{ marginTop: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button 
          onClick={() => navigate(`/book/${id}`)} 
          style={{
            padding: '12px 24px', backgroundColor: '#2C7A7B',
            color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px'
          }}
        >
          Book a Session
        </button>

        {/* Render Chat & Video Call buttons if an active appointment exists */}
        {appointment && (
          <>
            <button
              onClick={() => navigate(`/chat/${appointment._id}`)}
              style={{
                padding: '12px 20px', backgroundColor: '#3182CE', color: 'white',
                border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px'
              }}
            >
              💬 Chat
            </button>

            {appointment.videoRoomUrl ? (
              <a href={appointment.videoRoomUrl} target="_blank" rel="noreferrer">
                <button style={{
                  padding: '12px 20px', backgroundColor: '#38A169', color: 'white',
                  border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px'
                }}>
                   Join Video Call
                </button>
              </a>
            ) : (
              <button
                disabled
                title="Video call link will be available once counselor confirms"
                style={{
                  padding: '12px 20px', backgroundColor: '#a0aec0', color: 'white',
                  border: 'none', borderRadius: '6px', cursor: 'not-allowed', fontSize: '16px'
                }}
              >
                 Join Video Call
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CounselorProfile;