const VideoCall = ({ roomUrl, onLeave }) => {
  if (!roomUrl) return (
    <div style={{ textAlign: 'center', padding: '40px', background: '#fff3cd', borderRadius: '10px', margin: '20px 0' }}>
      <p style={{ color: '#856404' }}>⚠️ No video room URL available for this appointment yet.</p>
      <p style={{ color: '#856404', fontSize: '13px' }}>The counselor needs to confirm the appointment first.</p>
    </div>
  );

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      background: 'rgba(0,0,0,0.85)', zIndex: 1000,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{ width: '90%', maxWidth: '900px', background: '#000', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
        <div style={{ background: '#2C7A7B', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'white', fontWeight: 'bold', fontFamily: 'Arial' }}>🎥 Video Session</span>
          <button onClick={onLeave} style={{
            background: '#E53E3E', color: 'white', border: 'none',
            borderRadius: '6px', padding: '6px 16px', cursor: 'pointer', fontWeight: 'bold'
          }}>
            Leave Call
          </button>
        </div>
        <iframe
          src={roomUrl}
          title="Video Call"
          allow="camera; microphone; fullscreen; display-capture"
          style={{ width: '100%', height: '520px', border: 'none' }}
        />
      </div>
    </div>
  );
};

export default VideoCall;