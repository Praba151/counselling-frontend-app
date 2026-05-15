import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../utils/api';

const BookAppointment = () => {
  const { counselorId } = useParams();
  const [profile, setProfile] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [sessionType, setSessionType] = useState('');
//   const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    API.get(`/counselors/${counselorId}`).then(res => {
      setProfile(res.data);
      if (res.data?.sessionTypes?.length > 0) setSessionType(res.data.sessionTypes[0]);
    });
  }, [counselorId]);

  const handleBook = async () => {
    if (!selectedSlot) return alert('Please select a time slot');
    try {
      const res = await API.post('/appointments/book', {
        counselorId,
        date: selectedSlot.date,
        time: selectedSlot.time,
        sessionType
      });
      const orderRes = await API.post('/payment/create-order', {
        appointmentId: res.data._id,
        amount: profile.pricePerSession
      });
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderRes.data.amount,
        currency: 'INR',
        name: 'MindBridge Counseling',
        description: `Session: ${sessionType}`,
        order_id: orderRes.data.orderId,
        handler: async (response) => {
          await API.post('/payment/verify', {
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
            appointmentId: res.data._id
          });
          alert(' Booking confirmed and payment successful!');
          navigate('/client-dashboard');
        },
        prefill: { name: 'Client', email: 'client@example.com' },
        theme: { color: '#2C7A7B' }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      alert('Booking failed: ' + (err.response?.data?.message || err.message));
    }
  };

  if (!profile) return <p style={{ padding: '30px' }}>Loading...</p>;

  return (
    <div style={{ padding: '30px', fontFamily: 'Arial', maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ color: '#2C7A7B' }}>Book with {profile.userId?.name}</h2>
      <p>{profile.bio}</p>
      <p><strong>Price:</strong> ₹{profile.pricePerSession} / session</p>

      <div style={{ marginTop: '20px' }}>
        <label style={{ fontWeight: 'bold' }}>Select Session Type:</label>
        <select value={sessionType} onChange={e => setSessionType(e.target.value)}
          style={{ display: 'block', marginTop: '8px', padding: '10px', width: '100%', borderRadius: '6px', border: '1px solid #ccc' }}>
          {profile.sessionTypes?.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      <div style={{ marginTop: '20px' }}>
        <label style={{ fontWeight: 'bold' }}>Select Available Slot:</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px' }}>
          {profile.availableSlots?.filter(s => !s.isBooked).map((slot, i) => (
            <button key={i}
              onClick={() => setSelectedSlot(slot)}
              style={{
                padding: '10px 16px', borderRadius: '6px', cursor: 'pointer',
                backgroundColor: selectedSlot === slot ? '#2C7A7B' : 'white',
                color: selectedSlot === slot ? 'white' : '#333',
                border: '1px solid #2C7A7B'
              }}>
              {slot.date} {slot.time}
            </button>
          ))}
        </div>
      </div>

      <button onClick={handleBook} style={{
        marginTop: '30px', padding: '12px 30px', backgroundColor: '#2C7A7B',
        color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer',
        fontSize: '16px', width: '100%'
      }}>
        💳 Book & Pay ₹{profile.pricePerSession}
      </button>
    </div>
  );
};

export default BookAppointment;