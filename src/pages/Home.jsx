import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';

const expertiseOptions = [
  'All', 'Mental Health', 'Relationship Advice', 'Career Counseling',
  'Family Therapy', 'Stress Management', 'Addiction Recovery',
  'Grief Counseling', 'Child & Adolescent'
];

const Home = () => {
  const [counselors, setCounselors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState({ expertise: '', maxPrice: '' });
  const navigate = useNavigate();

  const fetchCounselors = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (filter.expertise && filter.expertise !== 'All') params.expertise = filter.expertise;
      if (filter.maxPrice) params.maxPrice = filter.maxPrice;

      const res = await API.get('/counselors', { params });
      const data = Array.isArray(res.data) ? res.data : res.data.profiles || [];
      setCounselors(data);
    } catch (err) {
      setError('Could not load counselors. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCounselors();
  }, []);

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', minHeight: '100vh', backgroundColor: '#f7f9fc' }}>
      <div style={{ background: 'linear-gradient(135deg, #2C7A7B, #1a4a6e)', color: 'white', padding: '60px 30px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '12px' }}>Find Your Counselor </h1>
        <p style={{ fontSize: '17px', opacity: 0.88, maxWidth: '550px', margin: '0 auto' }}>
          Connect with licensed counselors for mental health, relationships, career & more. First session from ₹299.
        </p>
      </div>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', padding: '20px 30px', backgroundColor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
        <span style={{ fontWeight: 'bold', color: '#444' }}>Filter:</span>
        <select
          value={filter.expertise}
          onChange={e => setFilter({ ...filter, expertise: e.target.value })}
          style={{ padding: '10px 14px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', outline: 'none', minWidth: '180px', backgroundColor: 'white' }}
        >
          {expertiseOptions.map(opt => (
            <option key={opt} value={opt === 'All' ? '' : opt}>{opt}</option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Max price (₹)"
          value={filter.maxPrice}
          onChange={e => setFilter({ ...filter, maxPrice: e.target.value })}
          style={{ padding: '10px 14px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', outline: 'none', width: '150px' }}
        />
        <button onClick={fetchCounselors}
          style={{ padding: '10px 22px', backgroundColor: '#2C7A7B', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
          Search
        </button>
        <button onClick={() => { setFilter({ expertise: '', maxPrice: '' }); setTimeout(fetchCounselors, 0); }}
          style={{ padding: '10px 22px', backgroundColor: '#718096', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
          Reset
        </button>
      </div>

      <div style={{ maxWidth: '1100px', margin: '30px auto', padding: '0 20px' }}>

        {error && (
          <div style={{ backgroundColor: '#fff5f5', color: '#c53030', padding: '15px 20px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#999' }}>⏳ Loading counselors...</div>
        ) : counselors.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#999' }}>
            <p style={{ fontSize: '40px' }}>🔍</p>
            <p style={{ fontSize: '18px' }}>No counselors found.</p>
            <p style={{ fontSize: '14px' }}>Try different filters or check back later.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '22px' }}>
            {counselors.map((profile) => (
              <div key={profile._id} style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 3px 12px rgba(0,0,0,0.09)' }}>
                <div style={{ backgroundColor: '#2C7A7B', padding: '20px', textAlign: 'center' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#e0f2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', margin: '0 auto 10px', border: '3px solid white' }}>
                  </div>
                  <h3 style={{ color: 'white', margin: '0 0 4px', fontSize: '18px' }}>
                    {profile.userId?.name || 'Counselor'}
                  </h3>
                  {profile.rating > 0 && (
                    <div style={{ color: '#FFD700', fontSize: '14px' }}>
                      {'⭐'.repeat(Math.round(profile.rating))} ({profile.rating.toFixed(1)})
                    </div>
                  )}
                </div>
                <div style={{ padding: '18px' }}>
                  <p style={{ color: '#555', fontSize: '13px', lineHeight: 1.6, minHeight: '45px' }}>
                    {profile.bio ? profile.bio.substring(0, 90) + '...' : 'Experienced counselor ready to help you.'}
                  </p>

                  <div style={{ marginTop: '10px' }}>
                    {profile.expertise?.slice(0, 3).map(e => (
                      <span key={e} style={{ display: 'inline-block', backgroundColor: '#e0f7fa', color: '#006064', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', marginRight: '5px', marginBottom: '5px' }}>
                        {e}
                      </span>
                    ))}
                  </div>

                  {profile.sessionTypes?.length > 0 && (
                    <p style={{ fontSize: '12px', color: '#777', marginTop: '8px' }}>
                      {profile.sessionTypes.join(' • ')}
                    </p>
                  )}

                  <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#2C7A7B', margin: '10px 0 0' }}>
                    ₹{profile.pricePerSession} <span style={{ fontSize: '13px', color: '#888', fontWeight: 'normal' }}>/ session</span>
                  </p>

                  <p style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
                    {profile.availableSlots?.filter(s => !s.isBooked).length || 0} slots available
                  </p>

                  <button
                    onClick={() => navigate(`/book/${profile.userId?._id}`)}
                    style={{ display: 'block', width: '100%', padding: '12px', backgroundColor: '#2C7A7B', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px', marginTop: '14px' }}
                  >
                    Book Session →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;