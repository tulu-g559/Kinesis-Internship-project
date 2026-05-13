import { Link } from "react-router-dom";

function Landing() {
  return (
    <div className="neo-container">
      <div className="neo-hero">
        <h1>Kinesis</h1>
        <p>Data Streaming Platform</p>
      </div>

      <div className="neo-grid">
        <div className="neo-card">
          <span className="neo-badge">Auth</span>
          <h2 style={{ marginTop: '1rem', fontSize: '1.5rem', fontWeight: 900, textTransform: 'uppercase' }}>
            Get Started
          </h2>
          <p style={{ margin: '1rem 0' }}>
            Sign in to access your dashboard and manage your data streams.
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/login" className="neo-btn">
              Login
            </Link>
            <Link to="/register" className="neo-btn neo-btn-secondary">
              Register
            </Link>
          </div>
        </div>

        <div className="neo-card">
          <span className="neo-badge" style={{ background: 'var(--neo-pink)' }}>Info</span>
          <h2 style={{ marginTop: '1rem', fontSize: '1.5rem', fontWeight: 900, textTransform: 'uppercase' }}>
            Features
          </h2>
          <ul style={{ margin: '1rem 0', paddingLeft: '1.5rem', textAlign: 'left' }}>
            <li>Real-time data streaming</li>
            <li>Secure authentication</li>
            <li>Dashboard analytics</li>
            <li>Easy integration</li>
          </ul>
        </div>

        <div className="neo-card">
          <span className="neo-badge" style={{ background: 'var(--neo-purple)', color: 'white' }}>API</span>
          <h2 style={{ marginTop: '1rem', fontSize: '1.5rem', fontWeight: 900, textTransform: 'uppercase' }}>
            Backend
          </h2>
          <p style={{ margin: '1rem 0' }}>
            Connected to local server at <code style={{ background: 'var(--neo-cyan)', padding: '0.2rem 0.5rem' }}>127.0.0.1:5000</code>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Landing;