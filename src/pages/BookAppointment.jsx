import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../utils/api';

const loadRazorpay = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const BookAppointment = () => {
  const { counselorId } = useParams();
  const [profile, setProfile] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [sessionType, setSessionType] = useState('');
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    API.get(`/counselors/${counselorId}`)
      .then(res => {
        setProfile(res.data);
        if (res.data?.sessionTypes?.length > 0) setSessionType(res.data.sessionTypes[0]);
      })
      .catch(() => alert('Could not load counselor details.'))
      .finally(() => setLoading(false));
  }, [counselorId]);

  const handleBook = async () => {
    if (!selectedSlot) return alert('Please select a time slot first');
    if (!sessionType) return alert('Please select session type');

    setBooking(true);
    try {
      const loaded = await loadRazorpay();
      if (!loaded) {
        alert('Payment gateway failed to load. Check your internet connection.');
        setBooking(false);
        return;
      }

      const apptRes = await API.post('/appointments/book', {
        counselorId, date: selectedSlot.date, time: selectedSlot.time, sessionType
      });

      const orderRes = await API.post('/payment/create-order', {
        appointmentId: apptRes.data._id, amount: profile.pricePerSession
      });

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderRes.data.amount,
        currency: 'INR',
        name: 'MindBridge Counseling',
        description: `${sessionType} Session`,
        order_id: orderRes.data.orderId,
        handler: async (response) => {
          try {
            await API.post('/payment/verify', {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              appointmentId: apptRes.data._id
            });
            alert(' Booking confirmed! Check your email for details.');
            navigate('/client-dashboard');
          } catch (err) {
            alert('Payment done but verification failed. Please contact support.');
          }
        },
        prefill: { name: 'Client', email: '' },
        theme: { color: '#2C7A7B' },
        modal: { ondismiss: () => alert('Payment cancelled.') }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      alert('Booking failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setBooking(false);
    }
  };

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '60px', fontFamily: 'Arial', color: '#888' }}>
      Loading counselor details...
    </div>
  );

  if (!profile) return (
    <div style={{ textAlign: 'center', padding: '60px', fontFamily: 'Arial', color: '#C53030' }}>
      Counselor not found.
    </div>
  );

  const freeSlots = profile.availableSlots?.filter(s => !s.isBooked) || [];

  return (
    <div style={{ padding: '30px', fontFamily: 'Arial', maxWidth: '620px', margin: '0 auto' }}>
      <div style={{ backgroundColor: '#2C7A7B', color: 'white', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px' }}>{profile.userId?.name}</h2>
            <p style={{ margin: '4px 0 0', opacity: 0.85, fontSize: '14px' }}>
              {profile.expertise?.join(' • ')}
            </p>
          </div>
        </div>
        {profile.bio && (
          <p style={{ marginTop: '14px', opacity: 0.9, fontSize: '14px', lineHeight: 1.6 }}>{profile.bio}</p>
        )}
      </div>
      <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 3px 12px rgba(0,0,0,0.08)' }}>
        <h3 style={{ color: '#2C7A7B', marginTop: 0 }}>Book Your Session</h3>

        <label style={{ fontWeight: 'bold', fontSize: '14px', display: 'block', marginBottom: '6px', color: '#555' }}>
          Session Type
        </label>
        <select value={sessionType} onChange={e => setSessionType(e.target.value)}
          style={{ width: '100%', padding: '11px', marginBottom: '20px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', outline: 'none', backgroundColor: 'white' }}>
          {profile.sessionTypes?.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>

        <label style={{ fontWeight: 'bold', fontSize: '14px', display: 'block', marginBottom: '10px', color: '#555' }}>
          Select Slot ({freeSlots.length} available)
        </label>

        {freeSlots.length === 0 ? (
          <div style={{ backgroundColor: '#FFF5F5', color: '#C53030', padding: '14px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>
            No slots available right now. Please check back later.
          </div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
            {freeSlots.map((slot, i) => (
              <button key={i} onClick={() => setSelectedSlot(slot)}
                style={{
                  padding: '10px 16px', borderRadius: '8px', cursor: 'pointer',
                  border: `2px solid ${selectedSlot === slot ? '#2C7A7B' : '#ddd'}`,
                  backgroundColor: selectedSlot === slot ? '#e0f2f2' : 'white',
                  color: selectedSlot === slot ? '#2C7A7B' : '#444',
                  fontWeight: selectedSlot === slot ? 'bold' : 'normal', fontSize: '13px'
                }}>
                {slot.date}<br />{slot.time}
              </button>
            ))}
          </div>
        )}

        <div style={{ backgroundColor: '#F0FFF4', border: '1px solid #C6F6D5', borderRadius: '8px', padding: '14px 18px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#555', fontWeight: 'bold' }}>Session Fee</span>
          <span style={{ fontSize: '22px', fontWeight: 'bold', color: '#276749' }}>₹{profile.pricePerSession}</span>
        </div>

        <button onClick={handleBook} disabled={booking || freeSlots.length === 0}
          style={{
            width: '100%', padding: '14px', fontSize: '16px', fontWeight: 'bold',
            backgroundColor: (booking || freeSlots.length === 0) ? '#9ec8c8' : '#2C7A7B',
            color: 'white', border: 'none', borderRadius: '8px',
            cursor: (booking || freeSlots.length === 0) ? 'not-allowed' : 'pointer'
          }}>
          {booking ? '⏳ Processing...' : `💳 Book & Pay ₹${profile.pricePerSession}`}
        </button>

        <p style={{ textAlign: 'center', color: '#888', fontSize: '12px', marginTop: '10px' }}>
          Secure payment via Razorpay | UPI, Cards, Net Banking accepted
        </p>
      </div>
    </div>
  );
};

export default BookAppointment;