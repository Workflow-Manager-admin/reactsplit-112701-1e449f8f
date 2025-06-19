import React, { useState, useEffect } from 'react';
import './App.css';

// PUBLIC_INTERFACE
function mockSupabaseAuth() {
  // Simulate Supabase Auth API for demonstration (replace with your real client + logic)
  const getUser = () => JSON.parse(localStorage.getItem('user')) || null;
  return {
    signUp: async ({ email, password }) => {
      localStorage.setItem('user', JSON.stringify({ email }));
      return { user: { email } };
    },
    signIn: async ({ email, password }) => {
      localStorage.setItem('user', JSON.stringify({ email }));
      return { user: { email } };
    },
    signOut: async () => {
      localStorage.removeItem('user');
      return {};
    },
    getUser,
  };
}

const auth = mockSupabaseAuth();

const COLORS = {
  primary: "#007bff",
  secondary: "#6c757d",
  accent: "#6610f2"
};

const SECTION = {
  DASHBOARD: 'dashboard',
  GROUP: 'group',
  ACCOUNT: 'account'
};

//
// AUTH VIEWS
// ------------------------------------------

function AuthView({ onAuth }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');

  // PUBLIC_INTERFACE
  async function handleAuth(e) {
    e.preventDefault();
    setErr('');
    try {
      let resp;
      if (isSignUp) {
        resp = await auth.signUp({ email, password });
      } else {
        resp = await auth.signIn({ email, password });
      }
      if (resp && resp.user) {
        onAuth(resp.user);
      } else {
        setErr('Authentication failed');
      }
    } catch (e) {
      setErr('Authentication failed');
    }
  }
  return (
    <div className="auth-container" style={{
      maxWidth: 380, margin: '0 auto',
      marginTop: 150, padding: 32, borderRadius: 8,
      background: '#fff', color: '#222', boxShadow: '0 4px 24px rgba(0,0,0,0.07)'
    }}>
      <h2 style={{ color: COLORS.primary }}>{isSignUp ? "Sign Up" : "Sign In"}</h2>
      <form onSubmit={handleAuth} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <input
          style={inputStyle}
          autoFocus
          type="email"
          placeholder="Email"
          autoComplete="username"
          onChange={e => setEmail(e.target.value)}
          value={email}
        />
        <input
          style={inputStyle}
          type="password"
          placeholder="Password"
          autoComplete={isSignUp ? "new-password" : "current-password"}
          onChange={e => setPassword(e.target.value)}
          value={password}
        />
        {err ? (<div style={{ color: 'red', fontSize: 13 }}>{err}</div>) : null}
        <button
          className="btn"
          type="submit"
          style={{
            background: COLORS.primary,
            marginTop: 8
          }}>
          {isSignUp ? "Create account" : "Sign in"}
        </button>
      </form>
      <div style={{ marginTop: 15, textAlign: 'center' }}>
        <button
          type="button"
          className="btn btn-small btn-secondary"
          style={{
            background: COLORS.secondary,
            color: '#fff',
            fontSize: "0.95rem",
            padding: "5px 16px"
          }}
          onClick={() => setIsSignUp(val => !val)}
        >{isSignUp
          ? "Already have an account? Sign in"
          : "No account? Sign up"}
        </button>
      </div>
    </div>
  );
}

const inputStyle = {
  fontSize: "1rem",
  padding: "10px 12px",
  border: "1px solid #e0e0e0",
  borderRadius: 4,
  outline: "none"
};

//
// MAIN APP SHELL
// ------------------------------------------

function App() {
  // State: user, groups, expenses, selected group etc.
  const [user, setUser] = useState(() => auth.getUser());
  // Each group: { id, name, members: [email], expenses: [...] }
  const [groups, setGroups] = useState(() =>
    JSON.parse(localStorage.getItem('groups') || "[]"));
  // For navigation and selection
  const [activeSection, setActiveSection] = useState(SECTION.DASHBOARD);
  const [selectedGroupId, setSelectedGroupId] = useState(null);

  // Persist groups to localStorage (simulate backend/Supabase table)
  useEffect(() => {
    localStorage.setItem('groups', JSON.stringify(groups));
  }, [groups]);

  // PUBLIC_INTERFACE
  function handleLogout() {
    auth.signOut();
    setUser(null);
    setActiveSection(SECTION.DASHBOARD);
  }

  // PUBLIC_INTERFACE
  function handleCreateGroup(name) {
    const id = generateId();
    setGroups([...groups, {
      id,
      name,
      members: [user.email],
      expenses: []
    }]);
    setSelectedGroupId(id);
    setActiveSection(SECTION.GROUP);
  }

  // PUBLIC_INTERFACE
  function handleJoinGroup(groupId, email) {
    setGroups(groups.map(g =>
      g.id === groupId && !g.members.includes(email)
        ? { ...g, members: [...g.members, email] } : g));
  }

  // PUBLIC_INTERFACE
  function handleAddExpense(groupId, expense) {
    setGroups(groups.map(g =>
      g.id === groupId
        ? { ...g, expenses: [...g.expenses, { ...expense, id: generateId() }] }
        : g
    ));
  }

  // PUBLIC_INTERFACE
  function handleRemoveExpense(groupId, expId) {
    setGroups(groups.map(g =>
      g.id === groupId
        ? { ...g, expenses: g.expenses.filter(e => e.id !== expId) }
        : g
    ));
  }

  // Select group for viewing
  function handleSelectGroup(id) {
    setSelectedGroupId(id);
    setActiveSection(SECTION.GROUP);
  }

  // PUBLIC_INTERFACE
  function handleInviteMember(groupId, email) {
    handleJoinGroup(groupId, email);
  }

  // Compute balance sheet for a group
  function getBalanceSheet(group) {
    // PUBLIC_INTERFACE
    // For each member, compute what they paid minus what they owe.
    // For sharing, split each expense evenly across assigned members.
    const members = group.members;
    const memberBalances = {};
    members.forEach(m => memberBalances[m] = 0);

    for (const expense of group.expenses) {
      const share = (expense.amount || 0) / (expense.assignedTo?.length || 1);
      for (const member of expense.assignedTo || []) {
        memberBalances[member] -= share;  // Owes
      }
      memberBalances[expense.paidBy] += expense.amount || 0; // Paid
    }
    return memberBalances;
  }

  if (!user) {
    return <AuthView onAuth={(userObj) => setUser(userObj)} />;
  }

  const group = groups.find(g => g.id === selectedGroupId);

  return (
    <div className="app light">
      <NavBar
        user={user}
        onLogout={handleLogout}
        setActiveSection={setActiveSection}
        activeSection={activeSection}
      />

      <main style={{ marginTop: 72 }}>
        <div className="container" style={{ minHeight: 540 }}>
          {activeSection === SECTION.DASHBOARD && (
            <Dashboard
              user={user}
              groups={groups}
              onSelectGroup={handleSelectGroup}
              onCreateGroup={handleCreateGroup}
            />
          )}
          {activeSection === SECTION.GROUP && group && (
            <GroupDetail
              group={group}
              user={user}
              onBack={() => setActiveSection(SECTION.DASHBOARD)}
              onAddExpense={exp => handleAddExpense(group.id, exp)}
              onRemoveExpense={expId => handleRemoveExpense(group.id, expId)}
              onInvite={email => handleInviteMember(group.id, email)}
              getBalanceSheet={() => getBalanceSheet(group)}
            />
          )}
          {activeSection === SECTION.ACCOUNT && (
            <Account user={user} />
          )}
        </div>
      </main>
    </div>
  );
}

//
// NAVIGATION BAR
// ------------------------------------------
function NavBar({ user, onLogout, setActiveSection, activeSection }) {
  return (
    <nav className="navbar" style={{ background: "#fff", color: "#222" }}>
      <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div className="logo" style={{ color: COLORS.primary }}>
          <span className="logo-symbol" style={{ color: COLORS.accent, marginRight: 6 }}>≡</span>
          ReactSplit
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button
            className={`btn ${activeSection === SECTION.DASHBOARD ? "active" : ""}`}
            style={navBtnStyles(activeSection === SECTION.DASHBOARD)}
            onClick={() => setActiveSection(SECTION.DASHBOARD)}
          >Dashboard</button>
          <button
            className={`btn ${activeSection === SECTION.ACCOUNT ? "active" : ""}`}
            style={navBtnStyles(activeSection === SECTION.ACCOUNT)}
            onClick={() => setActiveSection(SECTION.ACCOUNT)}
          >Account</button>
          <span style={{ fontSize: 15, margin: "0 10px" }}>{user.email}</span>
          <button
            className="btn"
            style={{
              background: COLORS.secondary,
              color: "#fff"
            }}
            onClick={onLogout}
          >Logout</button>
        </div>
      </div>
    </nav>
  );
}
function navBtnStyles(active) {
  return {
    background: active ? COLORS.accent : COLORS.primary,
    color: "#fff"
  };
}

//
// DASHBOARD VIEW -- Lists groups, lets you create a group
// ------------------------------------------
function Dashboard({ user, groups, onSelectGroup, onCreateGroup }) {
  const [field, setField] = useState('');
  //
  // Only display groups user is in.
  //
  const userGroups = groups.filter(g => g.members.includes(user.email));

  function handleSubmit(e) {
    e.preventDefault();
    if (field.trim().length < 2) return;
    onCreateGroup(field.trim());
    setField('');
  }
  return (
    <div>
      <h2 style={{ color: COLORS.primary, marginTop: 18 }}>Your Groups</h2>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {userGroups.length === 0 && (
          <li style={{ margin: "30px 0", color: "#aaa", fontSize: 17 }}>
            No groups yet.
          </li>
        )}
        {userGroups.map(g =>
          <li key={g.id} style={groupCardStyle}>
            <div style={{ flex: 1 }}>
              <span style={{ fontWeight: 600, color: COLORS.accent }}>{g.name}</span>
              <span style={{ marginLeft: 12, color: COLORS.secondary, fontSize: 13 }}>
                {g.members.length} members, {g.expenses.length} expenses
              </span>
            </div>
            <button
              className="btn"
              style={{ background: COLORS.primary, marginLeft: 16 }}
              onClick={() => onSelectGroup(g.id)}
            >Open</button>
          </li>
        )}
      </ul>
      <div style={{ marginTop: 38, maxWidth: 340 }}>
        <h3 style={{ color: COLORS.accent, fontWeight: 500, fontSize: 19 }}>Create Group</h3>
        <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <input
            type="text"
            value={field}
            placeholder="Group Name"
            onChange={e => setField(e.target.value)}
            style={{ ...inputStyle, flex: 1 }}
          />
          <button
            className="btn"
            style={{
              background: COLORS.accent,
              fontWeight: 500
            }}
            disabled={field.trim().length < 2}
            type="submit"
          >Create</button>
        </form>
      </div>
    </div>
  );
}

const groupCardStyle = {
  display: "flex", alignItems: "center", padding: "14px 0",
  borderBottom: "1px solid #f0f0f0"
};

//
// GROUP DETAIL -- Expenses & Invite & Balances
// ------------------------------------------
function GroupDetail({ group, user, onBack, onAddExpense, onRemoveExpense, onInvite, getBalanceSheet }) {
  const [adding, setAdding] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [inviteMail, setInviteMail] = useState('');

  const balances = getBalanceSheet();

  return (
    <div>
      <button
        className="btn"
        style={{
          background: COLORS.secondary,
          color: "#fff",
          marginTop: 6,
          marginBottom: 14
        }}
        onClick={onBack}
      >Back</button>
      <h2 style={{ color: COLORS.primary }}>{group.name}</h2>
      <div style={{ color: "#555", marginBottom: 15 }}>
        Members: {group.members.map(m => (
          <span key={m} style={{
            marginRight: 10,
            background: "#f0f2fd",
            color: COLORS.accent,
            padding: "2px 10px",
            borderRadius: "10px",
            fontSize: 14
          }}>{m === user.email ? m + " (you)" : m}</span>
        ))}
      </div>

      <section>
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4
        }}>
          <h3 style={{ color: COLORS.accent, fontWeight: 500 }}>Expenses</h3>
          <button
            className="btn"
            style={{
              background: COLORS.primary,
              fontWeight: 500,
              fontSize: 14,
              padding: "7px 16px"
            }}
            onClick={() => setAdding(v => !v)}
          >Add</button>
        </div>
        {adding && (
          <ExpenseAddForm
            group={group}
            user={user}
            onAdd={exp => {
              onAddExpense(exp);
              setAdding(false);
            }}
            onCancel={() => setAdding(false)}
          />
        )}
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {group.expenses.length === 0 &&
            <li style={{
              color: "#aaa", fontSize: 15,
              margin: "20px 0"
            }}>No expenses yet.</li>}
          {group.expenses.map(exp => (
            <ExpenseItem
              key={exp.id}
              exp={exp}
              user={user}
              group={group}
              onRemove={() => onRemoveExpense(exp.id)}
            />
          ))}
        </ul>
      </section>
      <section style={{ marginTop: 36 }}>
        <h3 style={{ color: COLORS.secondary, fontWeight: 500, fontSize: 18 }}>Balances</h3>
        <BalanceTable balances={balances} currentUser={user.email} />
      </section>

      <section style={{ marginTop: 28 }}>
        <h3 style={{ color: COLORS.primary, fontWeight: 500 }}>Invite member</h3>
        <form style={{ display: "flex", gap: 8, marginTop: 8 }}
          onSubmit={e => {
            e.preventDefault();
            if (inviteMail && /\S+@\S+\.\S+/.test(inviteMail)) {
              onInvite(inviteMail);
              setInviteMail('');
              setInviting(false);
            }
          }}>
          <input
            type="email"
            value={inviteMail}
            placeholder="User's email"
            onChange={e => setInviteMail(e.target.value)}
            style={{ ...inputStyle, flex: 1 }}
          />
          <button
            type="submit"
            className="btn"
            style={{
              background: COLORS.accent,
              fontWeight: 500
            }}
            disabled={!(inviteMail && /\S+@\S+\.\S+/.test(inviteMail))}
          >Invite</button>
        </form>
      </section>
    </div>
  );
}

function ExpenseItem({ exp, user, group, onRemove }) {
  const names = (arr) => arr.map(e => group.members.includes(e) ? e : "[unknown]").join(", ");
  return (
    <li style={{
      marginBottom: 10,
      background: "#fff",
      borderRadius: 6,
      boxShadow: "0 2px 9px -3px #e0e0e0",
      padding: "12px 16px",
      display: "flex",
      alignItems: "center"
    }}>
      <div style={{ flex: 1 }}>
        <div>
          <strong>{exp.description}</strong>
          <span style={{ marginLeft: 16, color: COLORS.secondary, fontSize: 14 }}>
            {exp.amount ? "₤" + exp.amount.toFixed(2) : ""}
          </span>
        </div>
        <div style={{ fontSize: 13, marginTop: 1, color: "#888" }}>
          Paid by: <strong>{exp.paidBy === user.email ? "you" : exp.paidBy}</strong> | Shared by: <span>{names(exp.assignedTo || [])}</span>
        </div>
      </div>
      {exp.paidBy === user.email && (
        <button
          className="btn btn-small"
          style={{
            background: COLORS.secondary,
            color: "#fff",
            fontSize: 13,
            padding: "4px 12px"
          }}
          onClick={onRemove}
        >
          Remove
        </button>
      )}
    </li>
  );
}

function ExpenseAddForm({ group, user, onAdd, onCancel }) {
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [assigned, setAssigned] = useState(group.members.slice());
  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        if (!desc.trim() || !amount || isNaN(+amount)) return;
        onAdd({
          description: desc.trim(),
          amount: parseFloat(amount),
          paidBy: user.email,
          assignedTo: assigned.slice()
        });
        setDesc('');
        setAmount('');
        setAssigned(group.members.slice());
      }}
      style={{
        margin: "10px 0 20px 0",
        background: "#f8f9fd",
        borderRadius: 5,
        padding: "13px 16px",
        display: "flex", flexDirection: "column", gap: 8
      }}
    >
      <div style={{ display: "flex", gap: 7 }}>
        <input
          type="text"
          value={desc}
          required
          minLength={2}
          maxLength={60}
          onChange={e => setDesc(e.target.value)}
          placeholder="Expense Description"
          style={{ ...inputStyle, flex: 2 }}
        />
        <input
          type="number"
          min={0.01}
          max={1000000}
          step={0.01}
          value={amount}
          required
          onChange={e => setAmount(e.target.value)}
          placeholder="Amount"
          style={{ ...inputStyle, width: 98 }}
        />
      </div>
      <div>
        <span style={{ fontSize: 13 }}>Shared between:</span>
        <div style={{ display: "flex", gap: 7, marginTop: 5, flexWrap: "wrap" }}>
          {group.members.map(member => (
            <label key={member} style={{
              fontWeight: 500,
              fontSize: 13,
              color: COLORS.primary,
              background: "#eaf6fb",
              padding: "3px 10px",
              borderRadius: 14
            }}>
              <input
                type="checkbox"
                checked={assigned.includes(member)}
                onChange={e => setAssigned(
                  e.target.checked
                    ? [...assigned, member]
                    : assigned.filter(m => m !== member)
                )}
                style={{ marginRight: 5 }}
              />
              {member === user.email ? "you" : member}
            </label>
          ))}
        </div>
      </div>
      <div style={{ marginTop: 11, display: "flex", justifyContent: "flex-end", gap: 9 }}>
        <button type="button"
          className="btn"
          style={{
            background: COLORS.secondary,
            color: "#fff",
            fontSize: 15
          }}
          onClick={onCancel}
        >Cancel</button>
        <button
          type="submit"
          className="btn"
          style={{
            background: COLORS.primary,
            fontWeight: 500
          }}
          disabled={!desc || !amount || isNaN(+amount) || assigned.length === 0}
        >Add Expense</button>
      </div>
    </form>
  );
}

function BalanceTable({ balances, currentUser }) {
  return (
    <table
      style={{
        width: "100%",
        borderCollapse: "collapse",
        marginTop: 6
      }}>
      <thead>
        <tr>
          <th style={thStyle}>User</th>
          <th style={thStyle}>Balance</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(balances).map(([email, balance]) => (
          <tr key={email}>
            <td style={tdStyle}>{email === currentUser ? email + " (you)" : email}</td>
            <td style={{
              ...tdStyle,
              color: balance > 0 ? "#36ab3c" :
                balance < 0 ? "#e64949" :
                "#aaa",
              fontWeight: 600
            }}>
              {balance > 0 ? "Gets " : balance < 0 ? "Owes " : ""}
              ₤{Math.abs(balance).toFixed(2)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
const thStyle = { textAlign: "left", padding: "9px", color: "#201955", background: "#f7f6fe" };
const tdStyle = { padding: "7px 9px", fontSize: 15, borderBottom: "1px solid #f0f0f0" };

// Simple Account screen
function Account({ user }) {
  return (
    <div style={{ marginTop: 44 }}>
      <h2 style={{ color: COLORS.primary }}>Your account</h2>
      <div style={{
        marginTop: 20, fontSize: 18,
        color: "#333", background: "#f5f5fa", borderRadius: 8, padding: 18
      }}>
        <div><strong>Email:</strong> <span>{user.email}</span></div>
      </div>
    </div>
  );
}

// Helpers
function generateId() {
  return Math.random().toString(36).slice(2, 10) + "-" + Date.now();
}

export default App;
