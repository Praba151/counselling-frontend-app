import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import API from '../utils/api';

const SessionNotes = () => {
  const { appointmentId } = useParams();
  const [notes, setNotes] = useState([]);
  const [noteText, setNoteText] = useState('');
  const [file, setFile] = useState(null);
  const [clientId, setClientId] = useState('');

  useEffect(() => {
    API.get('/appointments/mine').then(res => {
      const appt = res.data.find(a => a._id === appointmentId);
      if (appt) setClientId(appt.clientId?._id || appt.clientId);
    });
    API.get(`/session-notes/${appointmentId}`).then(res => setNotes(res.data));
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
      alert('Note saved ✅');
    } catch (err) {
      alert('Error saving note',err);
    }
  };

  return (
    <div style={{ padding: '30px', fontFamily: 'Arial', maxWidth: '700px', margin: '0 auto' }}>
      <h2 style={{ color: '#2C7A7B' }}>📝 Session Notes</h2>
      <div style={{ border: '1px solid #ddd', borderRadius: '10px', padding: '20px', marginBottom: '30px', backgroundColor: '#f0fafa' }}>
        <textarea
          placeholder="Write your session notes here..."
          value={noteText}
          onChange={e => setNoteText(e.target.value)}
          rows={5}
          style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '6px', boxSizing: 'border-box', resize: 'vertical' }}
        />
        <input type="file" onChange={e => setFile(e.target.files[0])}
          style={{ display: 'block', margin: '10px 0' }} />
        <button onClick={handleSave} style={{
          padding: '10px 24px', backgroundColor: '#2C7A7B',
          color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer'
        }}>Save Note</button>
      </div>
      <h3>Previous Notes</h3>
      {notes.length === 0 ? (
        <p style={{ color: '#888' }}>No notes yet.</p>
      ) : (
        notes.map(note => (
          <div key={note._id} style={{
            border: '1px solid #ddd', borderRadius: '8px',
            padding: '16px', marginBottom: '12px', backgroundColor: '#fff'
          }}>
            <p style={{ margin: 0 }}>{note.noteText}</p>
            {note.fileAttachment && (
              <a href={`${import.meta.env.VITE_API_URL.replace('/api', '')}/uploads/${note.fileAttachment}`}
                target="_blank" rel="noreferrer"
                style={{ color: '#2C7A7B', fontSize: '13px' }}>
                📎 View Attachment
              </a>
            )}
            <p style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
              {new Date(note.createdAt).toLocaleString()}
            </p>
          </div>
        ))
      )}
    </div>
  );
};

export default SessionNotes;