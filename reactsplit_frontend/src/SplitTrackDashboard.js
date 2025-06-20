import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

// --- Utility functions for balances ---
function calculateBalances(currentUserId, members, expenses, splits) {
  // returns a map user_id -> {name/email, netBalance: number}
  const balances = {};
  members.forEach(mem => {
    balances[mem.user_id] = { name: mem.name || mem.email, net: 0 };
  });

  expenses.forEach(exp => {
    // Find splits for this expense
    const expenseSplits = splits.filter(s => s.expense_id === exp.id);
    const creatorId = exp.created_by;
    const amount = exp.amount || 0;
    // By default, expense is split equally among split members
    const individualSplit = expenseSplits.length > 0
      ? amount / expenseSplits.length
      : 0;
    expenseSplits.forEach(split => {
      if (!balances[split.user_id]) return;
      if (split.user_id === creatorId) {
        // If creator also split, they paid up front but also owe their share, nets out below
        balances[creatorId].net += amount - individualSplit;
      } else {
        // Debtor owes their share to creator
        balances[split.user_id].net -= individualSplit;
      }
    });
  });
  return balances;
}

// --- Dashboard Main Component ---
/*
  Shows:
    - List of groups where user is a member
    - Create new group
    - Select group -> see members, expenses, add expense, view balance table
    - Real-time updates via Supabase
    - All UI styled with Bootstrap or matching plain CSS
*/
function SplitTrackDashboard({ user, handleLogout }) {
  const [groups, setGroups] = useState([]);
  const [groupMembers, setGroupMembers] = useState([]); // All members for selected group
  const [expenses, setExpenses] = useState([]);
  const [splits, setSplits] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [loading, setLoading] = useState(false);
  const [groupForm, setGroupForm] = useState({ name: "", inviteEmail: "" });
  const [expenseForm, setExpenseForm] = useState({ desc: "", amount: "", forMembers: [] });
  const [error, setError] = useState("");

  // --- Fetch groups where user is a member ---
  useEffect(() => {
    async function fetchGroups() {
      setLoading(true);
      // 1. Find groups where user is a member (via members table)
      let { data: memberRows, error: err1 } = await supabase
        .from("members")
        .select("group_id")
        .eq("user_id", user.id);
      if (err1) { setError("Failed loading groups."); setLoading(false); return; }
      const groupIds = memberRows.map(m => m.group_id);
      // 2. Get group details
      let { data: groupRows, error: err2 } = await supabase
        .from("groups")
        .select("*")
        .in("id", groupIds);
      if (err2) { setError("Failed loading groups."); setLoading(false); return; }
      setGroups(groupRows);
      setLoading(false);
    }
    fetchGroups();
  }, [user]);

  // --- Fetch group details (members, expenses, splits) on selected group ---
  useEffect(() => {
    if (!selectedGroupId) return;
    setLoading(true);
    async function fetchAllGroupData() {
      // Members
      let { data: memberRows, error: err1 } = await supabase
        .from("members")
        .select("*, users:users!inner(email)")
        .eq("group_id", selectedGroupId);
      if (err1) { setError("Could not load members."); setLoading(false); return; }
      // Attach display email field
      const membersWithEmail = memberRows.map(m => ({
        ...m,
        email: m.users?.email || m.email || "",
      }));

      // Expenses
      let { data: expenseRows, error: err2 } = await supabase
        .from("expenses")
        .select("*")
        .eq("group_id", selectedGroupId)
        .order("created_at", { ascending: true });
      if (err2) { setError("Could not load expenses."); setLoading(false); return; }

      // Splits
      let { data: splitRows, error: err3 } = await supabase
        .from("splits")
        .select("*")
        .in("expense_id", expenseRows.map(e => e.id));
      if (err3) { setError("Could not load splits."); setLoading(false); return; }

      setGroupMembers(membersWithEmail);
      setExpenses(expenseRows);
      setSplits(splitRows);
      setExpenseForm(f => ({...f, forMembers: membersWithEmail.map(m=>m.user_id)})); // Default: all
      setLoading(false);
    }
    fetchAllGroupData();
  }, [selectedGroupId]);

  // --- Real-time subscription hooks for updates (groups/expenses/members/splits) ---
  // Can optionally add Supabase channel subscriptions for real-time
  useEffect(() => {
    // Basic: just refetch on group/expense creation or removal, for now
    // Could add real-time listeners here
  }, [selectedGroupId]);

  // --- Handlers for group creation/join ---
  async function handleCreateGroup(e) {
    e.preventDefault();
    setError("");
    if (!groupForm.name) { setError("Group name required."); return;}
    setLoading(true);
    let { data, error: err } = await supabase
      .from("groups")
      .insert({ name: groupForm.name, created_by: user.id })
      .select();
    if (err || !data) { setError("Could not create group."); setLoading(false); return; }
    const newGroup = data[0];
    // Add user as first member
    await supabase
      .from("members")
      .insert({ group_id: newGroup.id, user_id: user.id, name: user.email });
    setGroups(g => [...g, newGroup]);
    setGroupForm({ name: "", inviteEmail: "" });
    setLoading(false);
  }

  // --- Invite member by email (adds to members table if user exists) ---
  async function handleInviteMember(e) {
    e.preventDefault();
    setError("");
    const email = groupForm.inviteEmail.trim();
    if (!selectedGroupId || !email) { setError("Provide user email."); return; }
    setLoading(true);
    // Lookup user id by email
    let { data: userRows, error: err1 } = await supabase
      .from("users")
      .select("id,email")
      .eq("email", email);
    if (err1 || !userRows.length) {
      setError("No user with this email.");
      setLoading(false); return;
    }
    const memberUserId = userRows[0].id;
    // Insert member if not exists
    let { error: err2 } = await supabase
      .from("members")
      .insert({ group_id: selectedGroupId, user_id: memberUserId, name: email });
    if (err2) {
      setError("Could not add member. Are they already in group?");
      setLoading(false); return;
    }
    setGroupMembers(m => [...m, { user_id: memberUserId, email }]);
    setGroupForm(f => ({ ...f, inviteEmail: "" }));
    setLoading(false);
  }

  // --- Add new expense to group, assign splits among selected members ---
  async function handleAddExpense(e) {
    e.preventDefault();
    setError("");
    if (!expenseForm.desc || !expenseForm.amount) {
      setError("Expense desc & amount required.");
      return;
    }
    setLoading(true);
    // Insert expense
    let { data, error: err1 } = await supabase
      .from("expenses")
      .insert({
        group_id: selectedGroupId,
        created_by: user.id,
        description: expenseForm.desc,
        amount: parseFloat(expenseForm.amount),
      })
      .select();
    if (err1 || !data) {
      setError("Failed to add expense.");
      setLoading(false); return;
    }
    const expenseId = data[0].id;
    // Insert splits for checked users
    const membersForExpense = expenseForm.forMembers;
    await supabase
      .from("splits")
      .insert(membersForExpense.map(uid => ({
        expense_id: expenseId,
        user_id: uid
      })));
    setExpenses(es => [...es, data[0]]);
    setExpenseForm({ desc: "", amount: "", forMembers: groupMembers.map(m=>m.user_id) });
    setLoading(false);
    // Refetch splits too
    let { data: splitRows } = await supabase.from("splits").select("*").in("expense_id", [...expenses.map(e=>e.id), expenseId]);
    setSplits(splitRows);
  }

  // --- UI: Groups list ---
  function GroupsSidebar() {
    return (
      <div className="card bg-dark mb-3" style={{ minWidth: 225, maxWidth: 270, marginBottom: 30, marginRight: 32, flex: "0 0 265px" }}>
        <div className="card-body">
          <h5 className="card-title" style={{color: "var(--base-light)"}}>My Groups</h5>
          <div style={{ margin: "14px 0" }}>
            {groups.map(grp => (
              <button
                key={grp.id}
                className={"btn btn-block w-100 mb-2" + (selectedGroupId === grp.id ? " btn-primary" : "")}
                style={{ background: selectedGroupId === grp.id ? "var(--accent-bright)" : "#23264a", color: "#fff", marginBottom: 8, borderRadius: 7, border: "none", fontWeight: 600,}}
                onClick={() => setSelectedGroupId(grp.id)}
              >
                {grp.name}
              </button>
            ))}
          </div>
          <form onSubmit={handleCreateGroup} style={{marginTop: 10}}>
            <input className="form-control mb-2"
              placeholder="New Group Name"
              value={groupForm.name}
              style={{borderRadius: 6, marginBottom: 6}}
              onChange={e => setGroupForm(f => ({ ...f, name: e.target.value }))} />
            <button className="btn btn-sm btn-block btn-primary" disabled={loading} style={{width: "100%", borderRadius:6}}>Create Group</button>
          </form>
        </div>
      </div>
    );
  }

  // --- UI: Main group area (members, expenses, balances) ---
  function GroupMainArea() {
    if (!selectedGroupId) return <div style={{marginTop: 44, textAlign:"center"}}>Select a group to start!</div>;
    // Balances
    const balances = calculateBalances(user.id, groupMembers, expenses, splits);

    return (
      <div style={{ flex: "1 1 auto", marginLeft: 0, minWidth: 400 }}>
        {/* --- Members --- */}
        <div className="card" style={{marginBottom: 18, borderRadius: 9}}>
          <div className="card-body">
            <h4 style={{marginBottom: 14, color:"var(--split-blue)"}}>Members</h4>
            <ul style={{ listStyle: "none", paddingLeft: 0 }}>
              {groupMembers.map(mem =>
                <li key={mem.user_id} style={{marginBottom: 5}}>
                  <span style={{fontWeight: mem.user_id===user.id?700:500, color:mem.user_id===user.id?"var(--base-light)":"#fff"}}>{mem.email||mem.name}</span>
                </li>
              )}
            </ul>
            <form onSubmit={handleInviteMember} style={{marginTop:10, display:"flex", gap:6, alignItems:"center"}}>
              <input className="form-control"
                type="email"
                placeholder="Invite by email"
                value={groupForm.inviteEmail}
                onChange={e=>setGroupForm(f=>({...f, inviteEmail:e.target.value}))}
                style={{borderRadius:7}}
                required />
              <button className="btn btn-sm btn-primary" disabled={loading} type="submit">Invite</button>
            </form>
          </div>
        </div>

        {/* --- Expenses --- */}
        <div className="card" style={{marginBottom: 18, borderRadius: 9}}>
          <div className="card-body">
            <h4 style={{marginBottom: 14, color:"var(--split-purple)"}}>Expenses</h4>
            <ul style={{ paddingLeft: 0, listStyle: "none" }}>
              {expenses.map(exp =>
                <li key={exp.id} style={{marginBottom:9}}>
                  <b style={{color: "var(--split-blue)"}}>{exp.description}</b>:{' '}
                  <span style={{color: "#ffe27a"}}>${exp.amount.toFixed(2)}</span>{' '}
                  <small>by <span style={{color:"var(--base-light)"}}>{groupMembers.find(m=>m.user_id===exp.created_by)?.email||"you"}</span>
                  </small>
                  <div style={{marginLeft:4, fontSize:".96em",color:"#fff7"}}>
                    Split among {splits.filter(s=>s.expense_id===exp.id).length} 
                    {splits.filter(s=>s.expense_id===exp.id).length === groupMembers.length ? " (all)":""}
                  </div>
                </li>
              )}
            </ul>
            <form onSubmit={handleAddExpense} style={{marginTop: 14, background:"#242367", padding: "12px 16px", borderRadius:8}}>
              <div className="mb-2">
                <input
                  className="form-control mb-2"
                  type="text"
                  placeholder="Expense name"
                  value={expenseForm.desc}
                  style={{display:"inline-block", borderRadius:6, width:"57%"}}
                  onChange={e=>setExpenseForm(f=>({...f, desc:e.target.value}))}
                  required
                />
                <input
                  className="form-control mb-2"
                  type="number"
                  placeholder="Amount"
                  value={expenseForm.amount}
                  min="0.01"
                  step="0.01"
                  style={{display:"inline-block", borderRadius:6, width:"38%", marginLeft: "3%"}}
                  onChange={e=>setExpenseForm(f=>({...f, amount:e.target.value}))}
                  required
                />
              </div>
              <div>
                <span style={{color:"#fff6", fontSize:"1em"}}>Split among:</span>
                <div>
                  {groupMembers.map(mem =>
                    <label key={mem.user_id} style={{marginRight:8, fontWeight:500}}>
                      <input
                        type="checkbox"
                        checked={expenseForm.forMembers.includes(mem.user_id)}
                        onChange={e => {
                          let members = [...expenseForm.forMembers];
                          if(e.target.checked) {
                            members.push(mem.user_id);
                          } else {
                            members = members.filter(u=>u!==mem.user_id);
                          }
                          setExpenseForm(f=>({...f, forMembers: members}));
                        }}
                        style={{marginRight:4}}
                      />
                      <span>{mem.email||mem.name}</span>
                    </label>
                  )}
                </div>
              </div>
              <button className="btn btn-sm btn-success" disabled={loading} style={{marginTop:8}}>
                Add Expense
              </button>
            </form>
          </div>
        </div>

        {/* --- Balances --- */}
        <div className="card">
          <div className="card-body">
            <h4 style={{marginBottom: 9, color:"var(--split-light)"}}>Balances</h4>
            <table className="table table-dark table-striped w-100" style={{borderRadius:10, overflow:"hidden"}}>
              <thead>
                <tr>
                  <th style={{color:"var(--base-light)"}}>Member</th>
                  <th style={{color:"var(--split-purple)",textAlign:"right"}}>Net Balance</th>
                </tr>
              </thead>
              <tbody>
                {groupMembers.map(mem => {
                  const bal = balances[mem.user_id]?.net || 0;
                  return (
                  <tr key={mem.user_id}>
                    <td>{mem.email||mem.name} {mem.user_id===user.id && <span style={{color:"var(--accent-bright)"}}>(You)</span>}</td>
                    <td style={{
                      color: bal >= 0 ? "#47f7ba" : "#fc917e",
                      fontWeight: bal === 0 ? 550 : 700,
                      textAlign: "right",
                    }}>
                      {bal === 0 ? <span>Settled</span>
                        : (bal > 0 ? <>is owed <b>${bal.toFixed(2)}</b></>
                          : <>owes <b>${Math.abs(bal).toFixed(2)}</b></>)}
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{display:"flex", gap: "3.6vw", alignItems:"start", marginTop:44, minHeight: "81vh"}}>
      <GroupsSidebar />
      {error && <div className="alert alert-danger" style={{position:"fixed",top:60,right:30,zIndex:4}}>{error}</div>}
      <GroupMainArea />
      <button
        className="btn btn-sm btn-secondary"
        style={{position:"fixed",top:18,right:16,zIndex:3,padding:"8px 24px",boxShadow:"0 1px 10px #0004"}}
        onClick={handleLogout}
      >Log out</button>
    </div>
  );
}

// PUBLIC_INTERFACE
export default SplitTrackDashboard;
