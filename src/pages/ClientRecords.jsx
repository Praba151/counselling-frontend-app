import { useEffect, useState } from 'react';
import API from '../utils/api';

const ClientRecords = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    API.get('/counselors/clients/mine')
      .then(res => setClients(res.data))
      .finally(() => setLoading(false));
  }, []);

  const statusColor = { pending: '#FFA500', confirmed: '#2C7A7B', completed: '#555', cancelled: 'red' };

  return (
    <div style={{ padding: '30px', fontFamily: 'Arial', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ color: '#2C7A7B' }}>👥 Client Records</h2>
      <p style={{ color: '#555' }}>Personal info and session history for every client you've worked with.</p>

      {loading ? (
        <p>Loading...</p>
      ) : clients.length === 0 ? (
        <p style={{ color: '#888' }}>No client records yet.</p>
      ) : (
        clients.map(client => (
          <div key={client._id} style={{
            border: '1px solid #ddd', borderRadius: '10px',
            padding: '18px', marginBottom: '16px', backgroundColor: '#f9f9f9'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: '0 0 4px', color: '#333' }}>{client.name}</h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>📧 {client.email}</p>
                {client.phone && <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>📞 {client.phone}</p>}
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#999' }}>
                  Client since {new Date(client.clientSince).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => setExpandedId(expandedId === client._id ? null : client._id)}
                style={{ padding: '8px 16px', backgroundColor: '#2C7A7B', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                {expandedId === client._id ? 'Hide History' : `Session History (${client.sessions.length})`}
              </button>
            </div>

            {expandedId === client._id && (
              <div style={{ marginTop: '14px', borderTop: '1px solid #ddd', paddingTop: '14px' }}>
                {client.sessions.map(s => (
                  <div key={s._id} style={{ padding: '10px', background: '#fff', borderRadius: '6px', marginBottom: '8px', border: '1px solid #eee' }}>
                    <p style={{ margin: 0, fontSize: '14px' }}>📅 {s.date} at {s.time} — 🎯 {s.sessionType}</p>
                    <p style={{ margin: '4px 0 0', fontSize: '13px' }}>
                      Status: <span style={{ color: statusColor[s.status], fontWeight: 'bold' }}>{s.status}</span>
                      {'  '}| Payment: <strong>{s.paymentStatus}</strong>
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default ClientRecords;