import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';

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

const CounselorAvatar = ({ name, photoUrl, size = 64 }) => {
  const [broken, setBroken] = useState(false);
  if (photoUrl && !broken) {
    return (
      <img src={photoUrl} alt={name} onError={() => setBroken(true)} style={{
        width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0
      }} />
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: '#E6F4F3', color: PRIMARY, display: 'flex',
      alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: size * 0.34
    }}>
      {getInitials(name)}
    </div>
  );
};

const Home = () => {
  const [counselors, setCounselors] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    API.get('/counselors')
      .then(res => setCounselors(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ padding: '32px 24px', maxWidth: '1100px', margin: '0 auto', fontFamily: "'Segoe UI', Arial, sans-serif" }}>
      {user?.role === 'client' && (
        <div style={{ textAlign: 'right', marginBottom: '10px' }}>
          <button onClick={() => navigate('/client-dashboard')} style={{
            padding: '8px 16px', borderRadius: '8px', border: `1px solid ${PRIMARY}`,
            background: '#fff', color: PRIMARY, fontWeight: 600, fontSize: '13px', cursor: 'pointer'
          }}>
            ← Back to My Sessions
          </button>
        </div>
      )}
      {user?.role === 'counselor' && (
        <div style={{ textAlign: 'right', marginBottom: '10px' }}>
          <button onClick={() => navigate('/counselor-dashboard')} style={{
            padding: '8px 16px', borderRadius: '8px', border: `1px solid ${PRIMARY}`,
            background: '#fff', color: PRIMARY, fontWeight: 600, fontSize: '13px', cursor: 'pointer'
          }}>
            ← Back to My Dashboard
          </button>
        </div>
      )}
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h1 style={{ fontSize: '34px', fontWeight: 700, color: '#1F2937' }}>Welcome to Counselling Services</h1>
        <p style={{ color: MUTED, fontSize: '16px', marginTop: '8px' }}>
          Connect with licensed counsellors for mental health, relationships & career support
        </p>
      </div>

      <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#1F2937', marginBottom: '20px' }}>Our Counsellors</h2>

      {loading ? (
        <p style={{ color: MUTED }}>Loading counsellors…</p>
      ) : counselors.length === 0 ? (
        <p style={{ color: MUTED }}>No counsellors available yet.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {counselors.map((profile) => {
            const photoUrl = getPhotoUrl(profile.photoUrl);
            const tags = [...new Set((profile.sessionTypes || []).map(t => t.trim()).filter(Boolean))];

            return (
              <div key={profile._id} style={{
                background: '#fff', border: `1px solid ${BORDER}`, borderRadius: '12px',
                padding: '24px', boxShadow: '0 1px 3px rgba(16,24,40,0.06)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
                  <CounselorAvatar name={profile.userId?.name} photoUrl={photoUrl} size={64} />
                  <div style={{ minWidth: 0 }}>
                    <h3 style={{
                      margin: 0, color: '#1F2937', fontSize: '18px', fontWeight: 700,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                    }}>
                      {profile.userId?.name}
                    </h3>
                    <p style={{ margin: '2px 0 0', color: PRIMARY, fontWeight: 700, fontSize: '15px' }}>
                      ₹{profile.pricePerSession} <span style={{ color: MUTED, fontWeight: 400, fontSize: '13px' }}>/ session</span>
                    </p>
                  </div>
                </div>

                <p style={{
                  color: MUTED, fontSize: '14px', margin: '0 0 10px',
                  display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
                  overflow: 'hidden', textOverflow: 'ellipsis'
                }}>
                  {profile.bio || 'No bio yet'}
                </p>

                {tags.length > 0 && (
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
                )}

                <button
                  onClick={() => navigate(`/book/${profile.userId?._id}`)}
                  style={{
                    width: '100%', marginTop: '14px', padding: '11px', background: PRIMARY,
                    color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600,
                    fontSize: '14px', cursor: 'pointer'
                  }}>
                  Book Session
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Home;