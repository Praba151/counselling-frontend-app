import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';

const ClientDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('upcoming');
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await API.get('/appointments/mine');
      setAppointments(res.data);
    } catch (err) {
      setError('Could not load appointments. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await API.delete(`/appointments/${id}`);
      alert('Appointment cancelled.');
      fetchAppointments();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not cancel. Please try again.');
    }
  };

  const upcoming = appointments.filter(a => ['pending', 'confirmed'].includes(a.status));
  const past = appointments.filter(a => ['completed', 'cancelled'].includes(a.status));
  const displayed = tab === 'upcoming' ? upcoming : past;

  const statusColors = {
    pending:   { bg: '#FFF3CD', color: '#856404' },
    confirmed: { bg: '#D4EDDA', color: '#155724' },
    completed: { bg: '#D1ECF1', color: '#0C5460' },
    cancelled: { bg: '#F8D7DA', color: '#721C24' }
  };

  return (
    <div style={{ padding: '30px', fontFamily: 'Arial', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ color: '#2C7A7B', margin: 0 }}>My Dashboard </h2>
          <p style={{ color: '#888', margin: '4px 0 0', fontSize: '14px' }}>Welcome back, {user?.name}</p>
        </div>
        <button onClick={() => navigate('/')}
          style={{ padding: '10px 22px', backgroundColor: '#2C7A7B', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
          + Book New Session
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total Sessions', value: appointments.length },
          { label: 'Upcoming', value: upcoming.length },
          { label: 'Completed', value: appointments.filter(a => a.status === 'completed').length },
        ].map(stat => (
          <div key={stat.label} style={{ backgroundColor: 'white', borderRadius: '10px', padding: '18px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', textAlign: 'center' }}>
            <div style={{ fontSize: '28px' }}>{stat.icon}</div>
            <div style={{ fontSize: '26px', fontWeight: 'bold', color: '#2C7A7B' }}>{stat.value}</div>
            <div style={{ fontSize: '13px', color: '#888' }}>{stat.label}</div>
          </div>
        ))}
      </div >
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        {[
          { key: 'upcoming', label: `Upcoming (${upcoming.length})` },
          { key: 'past', label: `Past (${past.length})` }
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{ padding: '10px 24px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', backgroundColor: tab === t.key ? '#2C7A7B' : '#eee', color: tab === t.key ? 'white' : '#555' }}>
            {t.label}
          </button>
        ))}
      </div>

      {error && (
        <div style={{ backgroundColor: '#FFF5F5', color: '#C53030', padding: '14px', borderRadius: '8px', marginBottom: '16px' }}>
           {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>Loading your appointments...</div>
      ) : displayed.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px', backgroundColor: 'white', borderRadius: '12px', color: '#888' }}>
          <p style={{ fontSize: '36px' }}></p>
          <p style={{ fontSize: '17px' }}>No {tab} appointments.</p>
          {tab === 'upcoming' && (
            <button onClick={() => navigate('/')}
              style={{ marginTop: '12px', padding: '10px 24px', backgroundColor: '#2C7A7B', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
              Find a Counselor
            </button>
          )}
        </div>
      ) : (
        displayed.map(appt => {
          const sc = statusColors[appt.status] || statusColors.pending;
          return (
            <div key={appt._id} style={{ border: '1px solid #e8e8e8', borderRadius: '12px', padding: '20px', marginBottom: '16px', backgroundColor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h4 style={{ margin: '0 0 6px', color: '#333', fontSize: '17px' }}>
                    {appt.counselorId?.name || 'Your Counselor'}
                  </h4>
                  <p style={{ margin: '3px 0', fontSize: '14px', color: '#666' }}>{appt.date} at ⏰ {appt.time}</p>
                  <p style={{ margin: '3px 0', fontSize: '14px', color: '#666' }}>{appt.sessionType}</p>
                  <p style={{ margin: '3px 0', fontSize: '13px', fontWeight: 'bold', color: appt.paymentStatus === 'paid' ? '#2e7d32' : '#e65100' }}>
                    Payment: {appt.paymentStatus === 'paid' ? '✅ Paid' : '⚠️ Unpaid'}
                  </p>
                </div>
                <span style={{ backgroundColor: sc.bg, color: sc.color, padding: '5px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold' }}>
                  {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
                </span>
              </div>
              {appt.status === 'confirmed' && (
                <div style={{ display: 'flex', gap: '10px', marginTop: '14px', flexWrap: 'wrap' }}>
                  <button onClick={() => navigate(`/chat/${appt._id}`)}
                    style={{ padding: '8px 18px', backgroundColor: '#3182CE', color: 'white', border: 'none', borderRadius: '7px', cursor: 'pointer', fontWeight: 'bold' }}>
                    Chat
                  </button>
                  {appt.videoRoomUrl && (
                    <a href={appt.videoRoomUrl} target="_blank" rel="noreferrer">
                      <button style={{ padding: '8px 18px', backgroundColor: '#38A169', color: 'white', border: 'none', borderRadius: '7px', cursor: 'pointer', fontWeight: 'bold' }}>
                        Join Video Call
                      </button>
                    </a>
                  )}
                  <button onClick={() => handleCancel(appt._id)}
                    style={{ padding: '8px 18px', backgroundColor: '#E53E3E', color: 'white', border: 'none', borderRadius: '7px', cursor: 'pointer', fontWeight: 'bold' }}>
                    Cancel
                  </button>
                </div>
              )}
              {appt.status === 'pending' && (
                <div style={{ marginTop: '12px' }}>
                  <button onClick={() => handleCancel(appt._id)}
                    style={{ padding: '8px 18px', backgroundColor: '#E53E3E', color: 'white', border: 'none', borderRadius: '7px', cursor: 'pointer', fontWeight: 'bold' }}>
                    Cancel Appointment
                  </button>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default ClientDashboard;