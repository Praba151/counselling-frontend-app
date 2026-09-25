import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../utils/api';

const PRIMARY = '#2C7A7B';
const MUTED = '#6B7280';
const BORDER = '#E2E8F0';

const getPhotoUrl = (filename) => {
  if (!filename) return null;
  const base = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');
  return `${base}/uploads/${filename}`;
};

const getInitials = (name = '') =>
  name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]?.toUpperCase()).join('') || '?';

const TagRow = ({ items }) => {
  const tags = [...new Set((items || []).map(t => t.trim()).filter(Boolean))];
  if (tags.length === 0) return null;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', margin: '6px 0' }}>
      {tags.map(tag => (
        <span key={tag} style={{
          display: 'inline-block', background: '#E6F4F3', color: PRIMARY,
          fontSize: '12px', fontWeight: 600, padding: '4px 10px',
          borderRadius: '999px', marginRight: '6px', marginBottom: '6px'
        }}>
          {tag}
        </span>
      ))}
    </div>
  );
};

const CounselorProfile = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [appointment, setAppointment] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    API.get(`/counselors/${id}`)
      .then(res => setProfile(res.data))
      .catch(err => console.error('Error fetching counselor profile:', err));

    API.get('/appointments/mine')
      .then(res => {
        const existing = res.data.find(appt => {
          const cId = appt.counselorId?._id?.toString() || appt.counselorId?.toString();
          const userId = appt.counselorId?.userId?._id?.toString() || appt.counselorId?.userId?.toString();
          return cId === id || userId === id;
        });
        if (existing) setAppointment(existing);
      })
      .catch(err => console.error('Appointment fetch failed:', err));
  }, [id]);

  if (!profile) return <p style={{ padding: '30px' }}>Loading...</p>;
  const photoUrl = getPhotoUrl(profile.photoUrl);

  return (
    <div style={{ padding: '32px 24px', maxWidth: '620px', margin: '0 auto', fontFamily: "'Segoe UI', Arial, sans-serif" }}>
      <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '28px', boxShadow: '0 1px 3px rgba(16,24,40,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginBottom: '18px' }}>
          {photoUrl ? (
            <img src={photoUrl} alt={profile.userId?.name} style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
          ) : (
            <div style={{
              width: 80, height: 80, borderRadius: '50%', flexShrink: 0, background: '#E6F4F3', color: PRIMARY,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '26px'
            }}>
              {getInitials(profile.userId?.name)}
            </div>
          )}
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1F2937', margin: 0, wordBreak: 'break-word' }}>{profile.userId?.name}</h1>
            <p style={{ color: PRIMARY, fontWeight: 700, fontSize: '17px', margin: '4px 0 0' }}>
              ₹{profile.pricePerSession} <span style={{ color: MUTED, fontWeight: 400, fontSize: '13px' }}>/ session</span>
            </p>
          </div>
        </div>

        <p style={{ color: MUTED, wordBreak: 'break-word' }}>{profile.bio}</p>

        <div style={{ marginTop: '16px' }}>
          <p style={{ fontWeight: 600, fontSize: '13px', color: '#1F2937', marginBottom: '4px' }}>Expertise</p>
          <TagRow items={profile.expertise} />
          <p style={{ fontWeight: 600, fontSize: '13px', color: '#1F2937', margin: '12px 0 4px' }}>Services</p>
          <TagRow items={profile.sessionTypes} />
        </div>

        <div style={{ marginTop: '24px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={() => navigate(`/book/${id}`)} style={{
            padding: '12px 24px', fontSize: '15px', background: PRIMARY, color: 'white',
            border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer'
          }}>
            Book a Session
          </button>

          {appointment && (
            <>
              <button onClick={() => navigate(`/chat/${appointment._id}`)} style={{
                padding: '12px 20px', fontSize: '15px', background: 'white', color: PRIMARY,
                border: `1px solid ${PRIMARY}`, borderRadius: '8px', fontWeight: 600, cursor: 'pointer'
              }}>
                Chat
              </button>
              {appointment.videoRoomUrl ? (
                <a href={appointment.videoRoomUrl} target="_blank" rel="noreferrer">
                  <button style={{
                    padding: '12px 20px', fontSize: '15px', background: '#2F855A', color: 'white',
                    border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer'
                  }}>Join Video Call</button>
                </a>
              ) : (
                <button disabled title="Video call link will be available once counsellor confirms" style={{
                  padding: '12px 20px', fontSize: '15px', background: '#A0AEC0', color: 'white',
                  border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'not-allowed'
                }}>
                  Join Video Call
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CounselorProfile;