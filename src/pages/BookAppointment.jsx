import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';

const PRIMARY = '#2C7A7B';
const MUTED = '#6B7280';
const BORDER = '#E2E8F0';
const TEXT = '#1F2937';

const inputStyle = {
  width: '100%', padding: '10px 12px', marginTop: '6px', marginBottom: '16px',
  border: `1px solid ${BORDER}`, borderRadius: '8px', boxSizing: 'border-box', fontSize: '14px'
};
const labelStyle = { fontWeight: 600, fontSize: '13px', color: TEXT };

const getPhotoUrl = (filename) => {
  if (!filename) return null;
  const base = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');
  return `${base}/uploads/${filename}`;
};
const getInitials = (name = '') =>
  name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]?.toUpperCase()).join('') || '?';

const BookAppointment = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [sessionType, setSessionType] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    API.get(`/counselors/${id}`).then(res => {
      setProfile(res.data);
      if (res.data?.sessionTypes?.length > 0) setSessionType(res.data.sessionTypes[0]);
    });
  }, [id]);

  
  const openSlots = useMemo(
    () => (profile?.availableSlots || []).filter(s => !s.isBooked && s.date && s.time),
    [profile]
  );
  const availableDates = useMemo(
    () => [...new Set(openSlots.map(s => s.date))].sort(),
    [openSlots]
  );
  const timesForSelectedDate = useMemo(
    () => openSlots.filter(s => s.date === selectedDate).sort((a, b) => a.time.localeCompare(b.time)),
    [openSlots, selectedDate]
  );

  const formatDateLabel = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  const handleBook = async () => {
    if (!selectedSlot) return alert('Please select a date and time slot');
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
        name: 'Counseling App',
        description: `Session: ${sessionType}`,
        order_id: orderRes.data.orderId,
        handler: async (response) => {
          try {
            await API.post('/payment/verify', {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              appointmentId: res.data._id
            });
            alert('Booking confirmed and payment successful!');
            navigate('/client-dashboard', { state: { highlightId: res.data._id } });
          } catch (verifyErr) {
            alert('Payment succeeded but confirmation failed: ' + (verifyErr.response?.data?.message || verifyErr.message));
          } finally {
            setIsBooking(false);
          }
        },
        modal: { ondismiss: () => setIsBooking(false) },
        prefill: { name: user?.name || '', email: user?.email || '', contact: user?.phone || '' },
        theme: { color: PRIMARY }
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
  const photoUrl = getPhotoUrl(profile.photoUrl);

  return (
    <div style={{ padding: '32px 24px', maxWidth: '620px', margin: '0 auto', fontFamily: "'Segoe UI', Arial, sans-serif", color: TEXT }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px' }}>
        {photoUrl ? (
          <img src={photoUrl} alt={profile.userId?.name} style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover' }} />
        ) : (
          <div style={{
            width: 56, height: 56, borderRadius: '50%', background: '#E6F4F3', color: PRIMARY,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '18px'
          }}>
            {getInitials(profile.userId?.name)}
          </div>
        )}
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, margin: 0 }}>Book with {profile.userId?.name}</h1>
          <p style={{ color: PRIMARY, fontWeight: 700, margin: '2px 0 0' }}>₹{profile.pricePerSession} / session</p>
        </div>
      </div>

      <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(16,24,40,0.06)' }}>
        {!hasSessionTypes ? (
          <p style={{ background: '#FDECEC', color: '#C53030', padding: '12px 16px', borderRadius: '8px', fontSize: '14px' }}>
            This counsellor hasn't set up session types yet. Booking is currently unavailable — please check back later.
          </p>
        ) : (
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Select Session Type</label>
            <select value={sessionType} onChange={e => setSessionType(e.target.value)} style={inputStyle}>
              {profile.sessionTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        )}

        <label style={labelStyle}>Select a Date</label>
        {availableDates.length === 0 ? (
          <p style={{ color: MUTED, fontSize: '14px' }}>No open slots right now — please check back later.</p>
        ) : (
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', margin: '8px 0 20px' }}>
            {availableDates.map(d => (
              <button
                key={d}
                onClick={() => { setSelectedDate(d); setSelectedSlot(null); }}
                style={{
                  padding: '10px 14px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px',
                  border: `1px solid ${PRIMARY}`,
                  background: selectedDate === d ? PRIMARY : '#fff',
                  color: selectedDate === d ? '#fff' : TEXT,
                  fontWeight: 600, textAlign: 'center', minWidth: '86px'
                }}
              >
                {formatDateLabel(d)}
              </button>
            ))}
          </div>
        )}

       
        {selectedDate && (
          <>
            <label style={labelStyle}>Select a Time on {formatDateLabel(selectedDate)}</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', margin: '8px 0' }}>
              {timesForSelectedDate.map((slot, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedSlot(slot)}
                  disabled={isBooking}
                  style={{
                    padding: '10px 16px', borderRadius: '8px',
                    cursor: isBooking ? 'not-allowed' : 'pointer',
                    background: selectedSlot === slot ? PRIMARY : '#fff',
                    color: selectedSlot === slot ? '#fff' : TEXT,
                    border: `1px solid ${PRIMARY}`, opacity: isBooking ? 0.6 : 1, fontWeight: 600
                  }}
                >
                  {slot.time}
                </button>
              ))}
            </div>
          </>
        )}

        <button
          onClick={handleBook}
          disabled={isBooking || !hasSessionTypes || !selectedSlot}
          style={{
            marginTop: '24px', width: '100%', padding: '13px', fontSize: '16px', borderRadius: '8px',
            border: 'none', fontWeight: 600, color: 'white',
            background: (isBooking || !hasSessionTypes || !selectedSlot) ? '#A0AEC0' : PRIMARY,
            cursor: (isBooking || !hasSessionTypes || !selectedSlot) ? 'not-allowed' : 'pointer'
          }}
        >
          {isBooking ? 'Processing...' : `Book & Pay ₹${profile.pricePerSession}`}
        </button>
      </div>
    </div>
  );
};

export default BookAppointment;