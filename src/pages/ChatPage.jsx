import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const ChatPage = () => {
  const { appointmentId } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const socketRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
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
    setMessages((prev) => [...prev, msgData]);
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
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
      </div>

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