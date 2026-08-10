import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';

const BookAppointment = () => {
  const { id } = useParams();                    
  const [profile, setProfile] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [sessionType, setSessionType] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;

    API.get(`/counselors/${id}`).then(res => {   
      setProfile(res.data);
      if (res.data?.sessionTypes?.length > 0) {
        setSessionType(res.data.sessionTypes[0]);
      }
    });
  }, [id]);

  const handleBook = async () => {
    if (!selectedSlot) return alert('Please select a time slot');
    if (!sessionType) return alert('This counselor has not set up session types yet. Booking is unavailable.');
    if (isBooking) return;

    setIsBooking(true);

    try {
      const res = await API.post('/appointments/book', {
        counselorId: id,                         
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
          alert('Booking confirmed and payment successful!');
          navigate('/client-dashboard');
        },
        modal: {
          ondismiss: () => {
            setIsBooking(false);
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone || ''
        },
        theme: { color: '#2C7A7B' }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      alert('Booking failed: ' + (err.response?.data?.message || err.message));
      setIsBooking(false);
    }
  };

  if (!profile) return <p style={{ padding: '30px' }}>Loading...</p>;

  const hasSessionTypes = profile.sessionTypes?.length > 0;

  return (
    <div style={{ padding: '30px', fontFamily: 'Arial', maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ color: '#2C7A7B' }}>Book with {profile.userId?.name}</h2>
      <p>{profile.bio}</p>
      <p><strong>Price:</strong> ₹{profile.pricePerSession} / session</p>

      {!hasSessionTypes ? (
        <p style={{
          backgroundColor: '#FED7D7', color: '#822727', padding: '12px 16px',
          borderRadius: '6px', fontSize: '14px', marginTop: '20px'
        }}>
           This counselor hasn't set up session types yet. Booking is currently unavailable — please check back later.
        </p>
      ) : (
        <div style={{ marginTop: '20px' }}>
          <label style={{ fontWeight: 'bold' }}>Select Session Type:</label>
          <select
            value={sessionType}
            onChange={e => setSessionType(e.target.value)}
            style={{
              display: 'block',
              marginTop: '8px',
              padding: '10px',
              width: '100%',
              borderRadius: '6px',
              border: '1px solid #ccc'
            }}
          >
            {profile.sessionTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      )}

      <div style={{ marginTop: '20px' }}>
        <label style={{ fontWeight: 'bold' }}>Select Available Slot:</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px' }}>
          {profile.availableSlots?.filter(s => !s.isBooked && s.date && s.time).map((slot, i) => (
            <button
              key={i}
              onClick={() => setSelectedSlot(slot)}
              disabled={isBooking}
              style={{
                padding: '10px 16px',
                borderRadius: '6px',
                cursor: isBooking ? 'not-allowed' : 'pointer',
                backgroundColor: selectedSlot === slot ? '#2C7A7B' : 'white',
                color: selectedSlot === slot ? 'white' : '#333',
                border: '1px solid #2C7A7B',
                opacity: isBooking ? 0.6 : 1
              }}
            >
              {slot.date} {slot.time}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleBook}
        disabled={isBooking || !hasSessionTypes}
        style={{
          marginTop: '30px',
          padding: '12px 30px',
          backgroundColor: (isBooking || !hasSessionTypes) ? '#a0aec0' : '#2C7A7B',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: (isBooking || !hasSessionTypes) ? 'not-allowed' : 'pointer',
          fontSize: '16px',
          width: '100%'
        }}
      >
        {isBooking ? 'Processing...' : `Book & Pay ₹${profile.pricePerSession}`}
      </button>
    </div>
  );
};

export default BookAppointment;