import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';

const Home = () => {
  const [counselors, setCounselors] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/counselors').then(res =>{
        console.log(res.data);
         setCounselors(res.data)})
         .catch(() => {});
  }, []);

  return (
    <div style={{ padding: '30px', fontFamily: 'Arial' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ color: '#2C7A7B', fontSize: '32px' }}>Welcome to counselling service </h1>
        <p style={{ color: '#555', fontSize: '16px' }}>Connect with licensed counselors for mental health, relationships & career</p>
      </div>

      <h2 style={{ color: '#333', marginBottom: '20px' }}>Our Counselors</h2>
      
      {counselors.length === 0 ? (
        <p style={{ color: '#888' }}>No counselors available yet.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {counselors.map((profile) => (
            <div key={profile._id} style={{
              border: '1px solid #ddd', borderRadius: '10px',
              padding: '20px', backgroundColor: '#f9f9f9'
            }}>
              <h3 style={{ color: '#2C7A7B' }}>{profile.userId?.name}</h3>
              <p style={{ color: '#555', fontSize: '14px' }}>{profile.bio || 'No bio yet'}</p>
              <p style={{ fontSize: '13px' }}>
                <strong>Services:</strong> {profile.sessionTypes?.join(', ') || 'N/A'}
              </p>
              <p style={{ fontSize: '13px', color: '#2C7A7B', fontWeight: 'bold' }}>
                ₹{profile.pricePerSession} / session
              </p>
              <button
                onClick={() => navigate(`/book/${profile.userId?._id}`)}
                style={{
                  marginTop: '10px', padding: '8px 20px',
                  backgroundColor: '#2C7A7B', color: 'white',
                  border: 'none', borderRadius: '6px', cursor: 'pointer', width: '100%'
                }}>
                Book Session
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;