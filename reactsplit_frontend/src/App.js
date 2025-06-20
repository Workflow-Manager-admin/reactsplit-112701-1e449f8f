import React from 'react';
import './App.css';

/**
 * PUBLIC_INTERFACE
 * Main App component - acts as the primary container for the application.
 */
function App() {
  return (
    <div className="app">
      <nav className="navbar">
        <div className="container">
          <div className="logo">
            <span className="logo-symbol">*</span> ReactSplit
          </div>
          {/* Navigation could go here */}
        </div>
      </nav>

      {/* Main content area */}
      <main>
        <div className="container">
          <div className="hero">
            <div className="subtitle">Expense Splitting Simplified</div>
            <h1 className="title">Welcome to ReactSplit</h1>
            <div className="description">
              A lightweight tool to manage group expenses, calculate balances, and keep your finances fair & simple.<br/><br/>
              <b>Features:</b>
              <ul style={{ textAlign: "left", maxWidth: 420, margin: "1rem auto" }}>
                <li>User Authentication (Supabase Auth)</li>
                <li>Group Management & Invites</li>
                <li>Add, Track, and Split Expenses</li>
                <li>Automatic Balance Calculation</li>
              </ul>
              <span style={{color: "var(--base-light)"}}>Get started by creating your first group!</span>
            </div>
            <button className="btn btn-large">
              Create Group
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;