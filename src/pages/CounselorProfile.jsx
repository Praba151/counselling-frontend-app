import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../utils/api';

const CounselorProfile = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    API.get(`/counselors/${id}`).then(res => setProfile(res.data));
  }, [id]);

  if (!profile) return <p style={{ padding: '30px' }}>Loading...</p>;

  return (
    <div style={{ padding: '30px', fontFamily: 'Arial', maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ color: '#2C7A7B' }}>{profile.userId?.name}</h2>
      <p style={{ color: '#555' }}>{profile.bio}</p>
      
      <div style={{ marginTop: '20px' }}>
        <p><strong>Expertise:</strong> {profile.expertise?.join(', ')}</p>
        <p><strong>Services:</strong> {profile.sessionTypes?.join(', ')}</p>
        <p style={{ color: '#2C7A7B', fontSize: '18px' }}><strong>₹{profile.pricePerSession}</strong> / session</p>
      </div>

      <button onClick={() => navigate(`/book/${id}`)} style={{
        marginTop: '20px', padding: '12px 30px', backgroundColor: '#2C7A7B',
        color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px'
      }}>Book a Session</button>
    </div>
  );
};

export default CounselorProfile;