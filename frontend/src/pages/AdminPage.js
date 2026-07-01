import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { adminAPI } from "../utils/api";

export default function AdminPage() {
  const [dashboard, setDashboard] = useState(null);
  const [voters, setVoters] = useState([]);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("overview");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newElection, setNewElection] = useState({
    title: "",
    description: "",
    electionType: "General",
    startDate: "",
    endDate: "",
    candidates: [
      {
        name: "",
        party: "",
        partySymbol: "🗳️",
        constituency: "All",
        manifesto: "",
      },
    ],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI
      .getDashboard()
      .then((res) => {
        setDashboard(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (tab === "voters") {
      adminAPI.getVoters({ search }).then((res) => setVoters(res.data.voters));
    }
  }, [tab, search]);

  const toggleVoter = async (id) => {
    try {
      const res = await adminAPI.toggleVoter(id);
      toast.success(res.data.message);
      setVoters((prev) =>
        prev.map((v) => (v._id === id ? { ...v, isActive: !v.isActive } : v)),
      );
    } catch {
      toast.error("Error toggling voter.");
    }
  };

  const seedElection = async () => {
    try {
      await adminAPI.seedElection();
      toast.success("Demo election created!");
      const res = await adminAPI.getDashboard();
      setDashboard(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Error.");
    }
  };

  const handleCreateElection = async () => {
    if (!newElection.title || !newElection.startDate || !newElection.endDate) {
      toast.error("Please fill title, start and end date.");
      return;
    }
    if (newElection.candidates.some((c) => !c.name || !c.party)) {
      toast.error("Please fill name and party for all candidates.");
      return;
    }
    try {
      await adminAPI.createElection(newElection);
      toast.success("Election created successfully!");
      setShowCreateForm(false);
      setNewElection({
        title: "",
        description: "",
        electionType: "General",
        startDate: "",
        endDate: "",
        candidates: [
          {
            name: "",
            party: "",
            partySymbol: "🗳️",
            constituency: "All",
            manifesto: "",
          },
        ],
      });
      const res = await adminAPI.getDashboard();
      setDashboard(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Error creating election.");
    }
  };

  const updateCandidate = (i, field, value) => {
    const updated = [...newElection.candidates];
    updated[i][field] = value;
    setNewElection({ ...newElection, candidates: updated });
  };

  const addCandidate = () => {
    setNewElection({
      ...newElection,
      candidates: [
        ...newElection.candidates,
        {
          name: "",
          party: "",
          partySymbol: "🗳️",
          constituency: "All",
          manifesto: "",
        },
      ],
    });
  };

  const removeCandidate = (i) => {
    setNewElection({
      ...newElection,
      candidates: newElection.candidates.filter((_, idx) => idx !== i),
    });
  };

  if (loading)
    return (
      <div className="page-center">
        <div className="spinner"></div>
      </div>
    );

  return (
    <div className="page">
      <div className="container">
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "2rem",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div>
            <h1>Admin Panel</h1>
            <p style={{ color: "var(--text-muted)" }}>
              Manage elections and voters
            </p>
          </div>
          <button className="btn btn-outline" onClick={seedElection}>
            + Seed Demo Election
          </button>
        </div>

        {/* Stats */}
        {dashboard && (
          <div className="grid-4" style={{ marginBottom: "2rem" }}>
            {[
              {
                label: "Total Voters",
                value: dashboard.stats.totalVoters,
                color: "var(--accent)",
              },
              {
                label: "Face Enrolled",
                value: dashboard.stats.registeredFaces,
                color: "var(--success)",
              },
              {
                label: "Active Elections",
                value: dashboard.stats.activeElections,
                color: "var(--warning)",
              },
              {
                label: "Total Votes",
                value: dashboard.stats.totalVotes,
                color: "var(--text)",
              },
            ].map(({ label, value, color }) => (
              <div key={label} className="stat-card">
                <div className="stat-value" style={{ color }}>
                  {value}
                </div>
                <div className="stat-label">{label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            marginBottom: "1.5rem",
            borderBottom: "1px solid var(--border)",
            paddingBottom: "0.5rem",
          }}
        >
          {["overview", "voters", "elections"].map((t) => (
            <button
              key={t}
              className={`btn btn-sm ${tab === t ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setTab(t)}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {tab === "overview" && dashboard && (
          <div className="grid-2">
            <div>
              <h2 style={{ marginBottom: "1rem", fontSize: "1rem" }}>
                Recent Elections
              </h2>
              {dashboard.recentElections.map((e) => (
                <div
                  key={e._id}
                  className="card"
                  style={{ marginBottom: "0.75rem", padding: "1rem" }}
                >
                  <div style={{ fontWeight: "700" }}>{e.title}</div>
                  <div
                    style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}
                  >
                    {e.electionType} · {e.status} · {e.totalVotes} votes
                  </div>
                </div>
              ))}
            </div>
            <div>
              <h2 style={{ marginBottom: "1rem", fontSize: "1rem" }}>
                Recent Registrations
              </h2>
              {dashboard.recentVoters.map((v) => (
                <div
                  key={v._id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px",
                    background: "var(--secondary)",
                    borderRadius: "8px",
                    marginBottom: "0.5rem",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: "600", fontSize: "0.9rem" }}>
                      {v.name}
                    </div>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--text-muted)",
                      }}
                    >
                      {v.constituency}
                    </div>
                  </div>
                  {v.isFaceRegistered ? (
                    <span className="badge badge-success">Face ✓</span>
                  ) : (
                    <span className="badge badge-warning">No Face</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Voters Tab */}
        {tab === "voters" && (
          <div>
            <input
              className="form-input"
              placeholder="Search by name, voter ID, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ marginBottom: "1rem", maxWidth: "400px" }}
            />
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "0.9rem",
                }}
              >
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    {[
                      "Voter ID",
                      "Name",
                      "Email",
                      "Constituency",
                      "Face",
                      "Status",
                      "Action",
                    ].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "10px",
                          textAlign: "left",
                          color: "var(--text-muted)",
                          fontWeight: "600",
                          fontSize: "0.8rem",
                          textTransform: "uppercase",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {voters.map((v) => (
                    <tr
                      key={v._id}
                      style={{ borderBottom: "1px solid var(--border)" }}
                    >
                      <td
                        className="mono"
                        style={{
                          padding: "10px",
                          fontSize: "0.8rem",
                          color: "var(--accent)",
                        }}
                      >
                        {v.voterId}
                      </td>
                      <td style={{ padding: "10px" }}>{v.name}</td>
                      <td
                        style={{ padding: "10px", color: "var(--text-muted)" }}
                      >
                        {v.email}
                      </td>
                      <td
                        style={{ padding: "10px", color: "var(--text-muted)" }}
                      >
                        {v.constituency}
                      </td>
                      <td style={{ padding: "10px" }}>
                        {v.isFaceRegistered ? "✅" : "❌"}
                      </td>
                      <td style={{ padding: "10px" }}>
                        <span
                          className={`badge ${v.isActive ? "badge-success" : "badge-danger"}`}
                        >
                          {v.isActive ? "Active" : "Disabled"}
                        </span>
                      </td>
                      <td style={{ padding: "10px" }}>
                        <button
                          className={`btn btn-sm ${v.isActive ? "btn-danger" : "btn-success"}`}
                          onClick={() => toggleVoter(v._id)}
                        >
                          {v.isActive ? "Disable" : "Enable"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Elections Tab */}
        {tab === "elections" && (
          <div>
            <button
              className="btn btn-primary"
              style={{ marginBottom: "1.5rem" }}
              onClick={() => setShowCreateForm(!showCreateForm)}
            >
              {showCreateForm ? "✕ Cancel" : "+ Create New Election"}
            </button>

            {showCreateForm && (
              <div className="card" style={{ marginBottom: "2rem" }}>
                <h2 style={{ marginBottom: "1.5rem" }}>Create New Election</h2>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Election Title</label>
                    <input
                      className="form-input"
                      placeholder="e.g. State Assembly Election 2025"
                      value={newElection.title}
                      onChange={(e) =>
                        setNewElection({
                          ...newElection,
                          title: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Election Type</label>
                    <select
                      className="form-input"
                      value={newElection.electionType}
                      onChange={(e) =>
                        setNewElection({
                          ...newElection,
                          electionType: e.target.value,
                        })
                      }
                    >
                      <option value="General">General</option>
                      <option value="State">State</option>
                      <option value="Local">Local</option>
                      <option value="By-Election">By-Election</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Start Date & Time</label>
                    <input
                      type="datetime-local"
                      className="form-input"
                      value={newElection.startDate}
                      onChange={(e) =>
                        setNewElection({
                          ...newElection,
                          startDate: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">End Date & Time</label>
                    <input
                      type="datetime-local"
                      className="form-input"
                      value={newElection.endDate}
                      onChange={(e) =>
                        setNewElection({
                          ...newElection,
                          endDate: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Description (optional)</label>
                  <input
                    className="form-input"
                    placeholder="Brief description of this election"
                    value={newElection.description}
                    onChange={(e) =>
                      setNewElection({
                        ...newElection,
                        description: e.target.value,
                      })
                    }
                  />
                </div>

                <h3 style={{ margin: "1.5rem 0 1rem" }}>Candidates</h3>
                {newElection.candidates.map((c, i) => (
                  <div
                    key={i}
                    style={{
                      background: "var(--secondary)",
                      padding: "1rem",
                      borderRadius: "8px",
                      marginBottom: "1rem",
                    }}
                  >
                    <div className="grid-2">
                      <input
                        className="form-input"
                        placeholder="Candidate Name"
                        value={c.name}
                        onChange={(e) =>
                          updateCandidate(i, "name", e.target.value)
                        }
                      />
                      <input
                        className="form-input"
                        placeholder="Party Name"
                        value={c.party}
                        onChange={(e) =>
                          updateCandidate(i, "party", e.target.value)
                        }
                      />
                      <input
                        className="form-input"
                        placeholder="Party Symbol emoji e.g. 🌟"
                        value={c.partySymbol}
                        onChange={(e) =>
                          updateCandidate(i, "partySymbol", e.target.value)
                        }
                      />
                      <input
                        className="form-input"
                        placeholder="Manifesto (optional)"
                        value={c.manifesto}
                        onChange={(e) =>
                          updateCandidate(i, "manifesto", e.target.value)
                        }
                      />
                    </div>
                    {newElection.candidates.length > 1 && (
                      <button
                        className="btn btn-danger btn-sm"
                        style={{ marginTop: "0.5rem" }}
                        onClick={() => removeCandidate(i)}
                      >
                        Remove Candidate
                      </button>
                    )}
                  </div>
                ))}

                <button
                  className="btn btn-outline btn-sm"
                  style={{ marginBottom: "1.5rem" }}
                  onClick={addCandidate}
                >
                  + Add Candidate
                </button>

                <br />
                <button
                  className="btn btn-success btn-lg"
                  onClick={handleCreateElection}
                >
                  ✅ Create Election
                </button>
              </div>
            )}

            {/* Existing Elections List */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              {dashboard?.recentElections.map((e) => (
                <div key={e._id} className="card">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: "700", marginBottom: "4px" }}>
                        {e.title}
                      </div>
                      <div
                        style={{
                          color: "var(--text-muted)",
                          fontSize: "0.85rem",
                        }}
                      >
                        {e.electionType} · {e.candidates?.length} candidates ·{" "}
                        {e.totalVotes} votes
                      </div>
                      <div
                        style={{
                          fontSize: "0.8rem",
                          color: "var(--text-muted)",
                          marginTop: "2px",
                        }}
                      >
                        {new Date(e.startDate).toLocaleDateString()} –{" "}
                        {new Date(e.endDate).toLocaleDateString()}
                      </div>
                    </div>
                    <span
                      className={`badge badge-${e.status === "active" ? "success" : e.status === "upcoming" ? "warning" : "accent"}`}
                    >
                      {e.status?.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
