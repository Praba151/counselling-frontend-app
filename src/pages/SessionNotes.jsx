import { useEffect, useState } from 'react';
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
const cardStyle = { background: '#fff', border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(16,24,40,0.06)' };
const btn = (bg, color = 'white', extra = {}) => ({
  padding: '10px 18px', borderRadius: '8px', border: 'none', fontSize: '14px',
  fontWeight: 600, cursor: 'pointer', background: bg, color, ...extra
});

const SessionNotes = () => {
  const { appointmentId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isCounselor = user?.role === 'counselor';

  const [notes, setNotes] = useState([]);
  const [noteText, setNoteText] = useState('');
  const [file, setFile] = useState(null);
  const [clientId, setClientId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isCounselor) {
      API.get('/appointments/mine').then(res => {
        const appt = res.data.find(a => a._id === appointmentId);
        if (appt) setClientId(appt.clientId?._id || appt.clientId);
      });
    }
    API.get(`/session-notes/${appointmentId}`)
      .then(res => setNotes(res.data))
      .finally(() => setLoading(false));
  }, [appointmentId]);

  const handleSave = async () => {
    const formData = new FormData();
    formData.append('appointmentId', appointmentId);
    formData.append('clientId', clientId);
    formData.append('noteText', noteText);
    if (file) formData.append('file', file);

    try {
      const res = await API.post('/session-notes', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setNotes([...notes, res.data]);
      setNoteText('');
      setFile(null);
    } catch (err) {
      alert('Error saving note: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div style={{ padding: '32px 24px', maxWidth: '700px', margin: '0 auto', fontFamily: "'Segoe UI', Arial, sans-serif", color: TEXT }}>
      <button onClick={() => navigate(-1)} style={{ ...btn('transparent', PRIMARY, { border: `1px solid ${BORDER}` }), marginBottom: '14px', padding: '8px 14px' }}>
        ← Back
      </button>

      <h1 style={{ fontSize: '28px', fontWeight: 700, margin: 0 }}>Session Notes</h1>
      <p style={{ color: MUTED, fontSize: '14px', marginTop: '4px' }}>
        {isCounselor ? 'Visible to you and your client.' : 'Notes shared by your counsellor for this session.'}
      </p>

      {isCounselor && (
        <div style={{ ...cardStyle, margin: '20px 0 30px' }}>
          <textarea
            placeholder="Write your session notes here..."
            value={noteText}
            onChange={e => setNoteText(e.target.value)}
            rows={5}
            style={{ ...inputStyle, marginBottom: '10px', resize: 'vertical' }}
          />
          <input type="file" onChange={e => setFile(e.target.files[0])} style={{ display: 'block', margin: '10px 0', fontSize: '13px' }} />
          <button onClick={handleSave} style={btn(PRIMARY)}>Save Note</button>
        </div>
      )}

      <h2 style={{ fontSize: '20px', fontWeight: 600, marginTop: isCounselor ? 0 : '20px' }}>
        {isCounselor ? 'Previous Notes' : 'Notes from your Counsellor'}
      </h2>

      {loading ? (
        <p style={{ color: MUTED }}>Loading...</p>
      ) : notes.length === 0 ? (
        <p style={{ color: MUTED }}>No notes yet.</p>
      ) : (
        notes.map(note => (
          <div key={note._id} style={{ ...cardStyle, marginTop: '12px', marginBottom: '12px' }}>
            <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{note.noteText}</p>
            {note.fileAttachment && (
              <a href={`${import.meta.env.VITE_API_URL.replace('/api', '')}/uploads/${note.fileAttachment}`}
                target="_blank" rel="noreferrer" style={{ color: PRIMARY, fontSize: '13px', display: 'inline-block', marginTop: '8px' }}>
                View Attachment
              </a>
            )}
            <p style={{ fontSize: '12px', color: MUTED, marginTop: '8px' }}>
              {new Date(note.createdAt).toLocaleString()}
            </p>
          </div>
        ))
      )}
    </div>
  );
};

export default SessionNotes;