import { useEffect, useRef } from 'react';
const VideoCall = ({ roomUrl, onLeave }) => {
  const iframeRef = useRef(null);

  useEffect(() => {
    if (iframeRef.current && roomUrl) {
      iframeRef.current.src = roomUrl;
    }
  }, [roomUrl]);

  return (
    <div style={{
      position: 'fixed',     
      top: 0, left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: '#000',
      zIndex: 9999,          
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 20px',
        backgroundColor: '#1a1a1a'
      }}>
        <span style={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }}>
          counselling Video Session
        </span>
        <button
          onClick={onLeave}
          style={{
            padding: '8px 20px',
            backgroundColor: '#E53E3E',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }}>
            Leave Call
        </button>
      </div>
      <iframe
        ref={iframeRef}
        title="Video Call"
        allow="camera; microphone; fullscreen; display-capture; autoplay"
        style={{
          flex: 1,           
          width: '100%',
          border: 'none'
        }}
      />
    </div>
  );
};

export default VideoCall;