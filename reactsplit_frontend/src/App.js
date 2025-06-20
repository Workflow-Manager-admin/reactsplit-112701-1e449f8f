import React, { useEffect, useState } from 'react';
import './App.css';
import { supabase } from './supabaseClient';
import SplitTrackDashboard from "./SplitTrackDashboard";

// PUBLIC_INTERFACE
// Main App component - Now integrates Supabase Auth. Clicking 'Get Started' brings up login/signup.
// Conditionally renders landing or main group/expense UI once authenticated.
function App() {
  const [user, setUser] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [view, setView] = useState('sign_in'); // 'sign_in', 'sign_up', or 'forgotten_password'
  const [authError, setAuthError] = useState('');

  // Auto-detect auth status and keep session.
  useEffect(() => {
    document.title = 'Split Track';

    // On load: check existing session
    supabase.auth.getUser().then(({ data, error }) => {
      if (data?.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    });

    // Listen for login/logout/user changes
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setUser(null);
      } else if (session?.user) {
        setUser(session.user);
        setAuthModalOpen(false);
        setAuthError('');
      }
    });

    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, []);

  // Handle login/signup form
  async function handleAuthSubmit(e) {
    e.preventDefault();
    const email = e.target.elements.email.value;
    const password = e.target.elements.password.value;
    setAuthError('');
    try {
      if (view === 'sign_in') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) setAuthError(error.message);
      } else if (view === 'sign_up') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) setAuthError(error.message);
      }
    } catch (err) {
      setAuthError('Something went wrong. Please try again.');
    }
  }

  // Logout
  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
    setAuthModalOpen(false);
  }

  // (Removed misplaced import, as import must only occur at top level)

  // Modal for login/signup:
  function AuthModal() {
    return (
      <div style={{
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        background: 'rgba(16,18,40,0.78)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          background: '#1A1A2F', borderRadius: 16, padding: '30px 34px', minWidth: 330,
          boxShadow: '0 6px 44px 0 #b16cea25, 0 1.5px 12px 0 #0004', position: 'relative',
        }}>
          <button
            style={{
              position: 'absolute', top: 10, right: 10, fontSize: 22, background: 'none', border: 'none',
              color: '#fae6ff', cursor: 'pointer', opacity: .7,
            }}
            aria-label="Close"
            onClick={() => setAuthModalOpen(false)}
            title="Close"
          >×</button>
          <h3 style={{
            textAlign: 'center', color: 'var(--base-light)', fontWeight: 700, margin: '0 0 18px',
            fontFamily: "'Sora', Arial, sans-serif",
          }}>
            {view === "sign_in" ? "Login to Split Track" : "Create a Split Track Account"}
          </h3>
          <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
            <input
              type="email"
              name="email"
              required
              autoFocus
              placeholder="Email address"
              style={{
                padding: '12px', fontSize: '1rem', borderRadius: 7, border: '1px solid #403080',
                background: '#282944', color: '#fff', marginBottom: 2,
              }}
            />
            <input
              type="password"
              name="password"
              required
              minLength={6}
              placeholder="Password"
              style={{
                padding: '12px', fontSize: '1rem', borderRadius: 7, border: '1px solid #403080',
                background: '#282944', color: '#fff', marginBottom: 0,
              }}
            />
            {authError && (
              <div style={{ color: '#f37c6b', fontSize: 14, marginTop: 2 }}>
                {authError}
              </div>
            )}
            <button className="btn btn-large" type="submit" style={{ marginTop: 6 }}>
              {view === "sign_in" ? "Log In" : "Sign Up"}
            </button>
          </form>
          <div style={{ textAlign: 'center', color: "#fff7", marginTop: 10 }}>
            {view === "sign_in" ?
              <>
                Don't have an account?
                <button onClick={() => { setView('sign_up'); setAuthError(''); }} style={{
                  background: 'none', color: 'var(--accent-bright)', border: 'none', padding: 0, marginLeft: 7, cursor: 'pointer'
                }}>Sign up</button>
              </>
              :
              <>
                Already have an account?
                <button onClick={() => { setView('sign_in'); setAuthError(''); }} style={{
                  background: 'none', color: 'var(--base-light)', border: 'none', padding: 0, marginLeft: 7, cursor: 'pointer'
                }}>Log in</button>
              </>
            }
          </div>
        </div>
      </div>
    );
  }

  // If authenticated, show management UI scaffold (to be expanded); else, show intro/landing
  return (
    <div className="app app-bg">
      {/* Stunning background & overlay applied via CSS */}
      <div className="bg-overlay"></div>
      <nav className="navbar navbar-glass">
        <div className="container">
          <div className="logo">
            <span className="logo-symbol">&#x1F39F;</span>
            <span className="logo-text-gradient">Split Track</span>
          </div>
          {user && (
            <div style={{ color: "#fafaff", fontSize: '1.07em', fontWeight: 500 }}>
              Logged in as <span style={{ color: "var(--base-light)", fontWeight: 600 }}>{user.email}</span>
            </div>
          )}
        </div>
      </nav>
      <main>
        <div className="container">
          {!user ? (
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
              <button className="btn btn-large btn-glow" onClick={() => { setAuthModalOpen(true); setView('sign_in'); }}>
                Get Started
              </button>
              {authModalOpen && <AuthModal />}
            </div>
          ) : (
            <SplitTrackDashboard user={user} handleLogout={handleLogout} />
          )}
        </div>
      </main>
      {/* Ensure modal closes if you click outside (optional, not implemented for brevity) */}
    </div>
  );
}

export default App;