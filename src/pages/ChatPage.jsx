import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const ChatPage = () => {
  const { appointmentId } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [emailOpen, setEmailOpen] = useState(false);
  const [emailText, setEmailText] = useState('');
  const [emailStatus, setEmailStatus] = useState('');
  const socketRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    API.get(`/chat/${appointmentId}`).then(res => {
      const history = res.data.map(m => ({
        roomId: appointmentId,
        sender: m.senderName,
        senderId: m.senderId,
        text: m.text,
        time: new Date(m.createdAt).toLocaleTimeString(),
      }));
      setMessages(history);
    }).catch(() => {});

    socketRef.current = io(SOCKET_URL);
    socketRef.current.emit('join_room', appointmentId);

    socketRef.current.on('receive_message', (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => socketRef.current.disconnect();
  }, [appointmentId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const msgData = {
      roomId: appointmentId,
      sender: user.name,
      senderId: user._id || user.id,
      text: input,
      time: new Date().toLocaleTimeString(),
    };
    socketRef.current.emit('send_message', msgData);
    
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const sendEmailOutsideSession = async () => {
    if (!emailText.trim()) return;
    setEmailStatus('Sending...');
    try {
      await API.post('/email/send', { appointmentId, message: emailText });
      setEmailStatus('✅ Email sent!');
      setEmailText('');
      setTimeout(() => { setEmailOpen(false); setEmailStatus(''); }, 1500);
    } catch (err) {
      setEmailStatus('❌ Failed to send: ' + (err.response?.data?.message || err.message));
    }
  };

  const myId = user._id || user.id;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'Arial', background: '#f4f6f8' }}>
      {/* Header */}
      <div style={{ background: '#2C7A7B', color: 'white', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button onClick={() => window.history.back()}
          style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.5)', color: 'white', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer' }}>
          ← Back
        </button>
        <h3 style={{ margin: 0 }}> Session Chat</h3>
        <span style={{ fontSize: '13px', opacity: 0.8 }}>Room: {appointmentId?.slice(-6)}</span>
        <button onClick={() => setEmailOpen(true)}
          style={{ marginLeft: 'auto', background: 'transparent', border: '1px solid rgba(255,255,255,0.5)', color: 'white', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer' }}>
          ✉️ Email
        </button>
      </div>

      {emailOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: 'white', borderRadius: '10px', padding: '24px', width: '90%', maxWidth: '420px' }}>
            <h3 style={{ marginTop: 0, color: '#2C7A7B' }}>Send an email outside this session</h3>
            <textarea
              value={emailText}
              onChange={(e) => setEmailText(e.target.value)}
              placeholder="Write your message..."
              rows={5}
              style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '6px', boxSizing: 'border-box', resize: 'vertical' }}
            />
            {emailStatus && <p style={{ fontSize: '13px', color: '#555' }}>{emailStatus}</p>}
            <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
              <button onClick={sendEmailOutsideSession} style={{ flex: 1, padding: '10px', background: '#2C7A7B', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                Send Email
              </button>
              <button onClick={() => { setEmailOpen(false); setEmailStatus(''); }} style={{ flex: 1, padding: '10px', background: '#eee', color: '#333', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: '#aaa', marginTop: '60px' }}>
            <p style={{ fontSize: '32px' }}>Chat</p>
            <p>No messages yet. Start the conversation!</p>
          </div>
        )}
        {messages.map((msg, i) => {
          const isMe = msg.senderId === myId;
          return (
            <div key={i} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: '65%', padding: '10px 14px', borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                background: isMe ? '#2C7A7B' : '#fff', color: isMe ? 'white' : '#333',
                boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
              }}>
                {!isMe && <p style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: 'bold', color: '#2C7A7B' }}>{msg.sender}</p>}
                <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.5 }}>{msg.text}</p>
                <p style={{ margin: '4px 0 0', fontSize: '11px', opacity: 0.6, textAlign: 'right' }}>{msg.time}</p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <div style={{ background: '#fff', padding: '16px 20px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message... (Enter to send)"
          rows={2}
          style={{ flex: 1, padding: '10px 14px', border: '1px solid #ddd', borderRadius: '12px', resize: 'none', fontFamily: 'Arial', fontSize: '14px', outline: 'none' }}
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim()}
          style={{ padding: '10px 20px', background: input.trim() ? '#2C7A7B' : '#ccc', color: 'white', border: 'none', borderRadius: '10px', cursor: input.trim() ? 'pointer' : 'not-allowed', fontWeight: 'bold', fontSize: '14px' }}>
          Send ➤
        </button>
      </div>
    </div>
  );
};

export default ChatPage;