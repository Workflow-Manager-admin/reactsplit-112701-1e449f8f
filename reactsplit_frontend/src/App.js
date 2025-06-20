import React, { useEffect } from 'react';
import './App.css';

// PUBLIC_INTERFACE
// Main App component - acts as the primary container for the application.
// Now with Split Track branding, stunning background, and extraordinary visuals.
function App() {
  useEffect(() => {
    document.title = 'Split Track';
  }, []);

  return (
    <div className="app app-bg">
      {/* Stunning background & overlay applied via CSS */}
      <div className="bg-overlay"></div>
      <nav className="navbar navbar-glass">
        <div className="container">
          <div className="logo">
            <span className="logo-symbol">&#x1F39F;</span> {/* Music/track themed Unicode */}
            <span className="logo-text-gradient">Split Track</span>
          </div>
          {/* Navigation could go here */}
        </div>
      </nav>

      {/* Main content area */}
      <main>
        <div className="container">
          <div className="hero hero-premium">
            <div className="subtitle subtitle-glow">Track. Split. Simplify.</div>
            <h1 className="title title-display-glow">
              Welcome to <span className="title-gradient">Split Track</span>
            </h1>
            <div className="description desc-rich">
              <span style={{ fontWeight: 500, color: "var(--base-light)" }}>
                Smart. Beautiful. Effortless.
              </span><br /><br />
              A vibrantly modern tool to manage group expenses, split bills, and keep friendships worry-free.<br /><br />
              <b>What makes Split Track extraordinary?</b>
              <ul className="feature-list">
                <li><span role="img" aria-label="lock">🔑</span> Secure Authentication (Supabase Auth)</li>
                <li><span role="img" aria-label="group">👥</span> Effortless Group Management</li>
                <li><span role="img" aria-label="money">💸</span> Fast, Fair Expense Splitting</li>
                <li><span role="img" aria-label="graph">📊</span> Real-Time Balance Insights</li>
              </ul>
              <span style={{ color: "var(--accent-bright)" }}>
                Experience a new level of clarity in every shared cost.
              </span>
            </div>
            <button className="btn btn-large btn-glow">
              Get Started
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;