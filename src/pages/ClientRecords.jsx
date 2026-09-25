import { useEffect, useState } from 'react';
import API from '../utils/api';

const PRIMARY = '#2C7A7B';
const MUTED = '#6B7280';
const BORDER = '#E2E8F0';
const TEXT = '#1F2937';

const cardStyle = { background: '#fff', border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(16,24,40,0.06)' };
const btn = (bg, color = 'white', extra = {}) => ({
  padding: '10px 18px', borderRadius: '8px', border: 'none', fontSize: '14px',
  fontWeight: 600, cursor: 'pointer', background: bg, color, ...extra
});
const statusColor = {
  pending: { bg: '#FFF7E6', color: '#B7791F' },
  confirmed: { bg: '#E6F4F3', color: PRIMARY },
  completed: { bg: '#EDF2F7', color: '#4A5568' },
  cancelled: { bg: '#FDECEC', color: '#C53030' },
};

const ClientRecords = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    API.get('/counselors/clients/mine')
      .then(res => setClients(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ padding: '32px 24px', maxWidth: '820px', margin: '0 auto', fontFamily: "'Segoe UI', Arial, sans-serif", color: TEXT }}>
      <h1 style={{ fontSize: '28px', fontWeight: 700, margin: 0 }}>Client Records</h1>
      <p style={{ color: MUTED, fontSize: '14px', marginBottom: '24px' }}>Personal info and session history for every client you've worked with.</p>

      {loading ? (
        <p style={{ color: MUTED }}>Loading...</p>
      ) : clients.length === 0 ? (
        <p style={{ color: MUTED }}>No client records yet.</p>
      ) : (
        clients.map(client => (
          <div key={client._id} style={{ ...cardStyle, marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ margin: '0 0 4px', fontSize: '16px' }}>{client.name}</h3>
                <p style={{ color: MUTED, fontSize: '14px', margin: 0 }}>{client.email}</p>
                {client.phone && <p style={{ color: MUTED, fontSize: '14px', margin: 0 }}>{client.phone}</p>}
                <p style={{ fontSize: '12px', color: MUTED, margin: '4px 0 0' }}>
                  Client since {new Date(client.clientSince).toLocaleDateString()}
                </p>
              </div>
              <button onClick={() => setExpandedId(expandedId === client._id ? null : client._id)} style={btn('white', PRIMARY, { border: `1px solid ${PRIMARY}` })}>
                {expandedId === client._id ? 'Hide History' : `Session History (${client.sessions.length})`}
              </button>
            </div>

            {expandedId === client._id && (
              <div style={{ marginTop: '14px', borderTop: `1px solid ${BORDER}`, paddingTop: '14px' }}>
                {client.sessions.map(s => {
                  const st = statusColor[s.status] || statusColor.pending;
                  return (
                    <div key={s._id} style={{ padding: '12px', background: '#F7F9FA', borderRadius: '8px', marginBottom: '8px', border: `1px solid ${BORDER}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                        <p style={{ margin: 0, fontSize: '14px' }}>{s.date} at {s.time} · {s.sessionType}</p>
                        <span style={{
                          display: 'inline-block', background: st.bg, color: st.color, fontSize: '12px',
                          fontWeight: 600, padding: '4px 10px', borderRadius: '999px'
                        }}>{s.status}</span>
                      </div>
                      <p style={{ margin: '6px 0 0', fontSize: '13px', color: MUTED }}>Payment: <strong>{s.paymentStatus}</strong></p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default ClientRecords;