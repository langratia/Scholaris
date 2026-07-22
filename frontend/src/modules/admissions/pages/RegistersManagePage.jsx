import React, { useState, useEffect } from 'react';
import Header from '../../../shared/components/Header';
import { fetchRegisters, createRegister, updateRegisterStatus } from '../api/admissionsApi';
import { Plus, Calendar, Settings, Play, Square, AlertTriangle } from 'lucide-react';

export default function RegistersManagePage() {
  const [registers, setRegisters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    targetCourse: '',
    maxCapacity: 50,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  const loadData = () => {
    setLoading(true);
    fetchRegisters().then(data => {
      setRegisters(data);
      setLoading(false);
    });
  };

  useEffect(() => { loadData(); }, []);

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createRegister({
        ...formData,
        maxCapacity: parseInt(formData.maxCapacity, 10),
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
      });
      setShowModal(false);
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to create register');
    } finally {
      setSubmitting(false);
    }
  };

  const changeStatus = async (id, newStatus) => {
    if (!window.confirm(`Are you sure you want to change the status to ${newStatus}?`)) return;
    try {
      await updateRegisterStatus(id, newStatus);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="animate-fade-in">
      <Header />
      <div className="page-body">
        
        <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 className="page-title">Admission Registers</h1>
            <p className="page-subtitle">Manage intake cycles and open/close admission periods.</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={18} /> New Register
          </button>
        </div>

        <div className="card" style={{ padding: 0 }}>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center' }}>Loading...</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name & Course</th>
                  <th>Timeline</th>
                  <th>Capacity</th>
                  <th>Applications</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {registers.map(reg => (
                  <tr key={reg.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: 'white' }}>{reg.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{reg.targetCourse}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Calendar size={14} color="var(--text-dim)" />
                        {new Date(reg.startDate).toLocaleDateString()} - {new Date(reg.endDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td><strong style={{ color: 'white' }}>{reg.maxCapacity}</strong> slots</td>
                    <td><span style={{ color: 'var(--accent-bright-blue)', fontWeight: 700 }}>{reg._count?.applications || 0}</span></td>
                    <td>
                      <span className={`status-badge ${
                        reg.status === 'GATHERING' ? 'badge-success' : 
                        reg.status === 'DRAFT' ? 'badge-info' : 
                        reg.status === 'DONE' ? 'badge-purple' : 'badge-warning'
                      }`}>
                        {reg.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        {reg.status === 'DRAFT' && (
                          <button className="btn btn-ghost" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }} onClick={() => changeStatus(reg.id, 'GATHERING')}>
                            <Play size={14} color="#34d399" /> Open
                          </button>
                        )}
                        {reg.status === 'GATHERING' && (
                          <button className="btn btn-ghost" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }} onClick={() => changeStatus(reg.id, 'PROCESSING')}>
                            <Square size={14} color="#fbbf24" /> Close
                          </button>
                        )}
                        {reg.status === 'PROCESSING' && (
                          <button className="btn btn-ghost" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }} onClick={() => changeStatus(reg.id, 'DONE')}>
                            <CheckCircle2 size={14} color="#c084fc" /> Finalize
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {registers.length === 0 && (
                  <tr><td colSpan="6" style={{ textAlign: 'center', padding: '3rem' }}>No registers found.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="card modal-content" style={{ maxWidth: '600px', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Create New Admission Register</h2>
              <button onClick={() => setShowModal(false)} className="btn btn-ghost" style={{ padding: '0.5rem' }}>×</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Register Name</label>
                <input required type="text" name="name" className="form-input" placeholder="e.g. Fall 2026 Computer Science" value={formData.name} onChange={handleChange} />
              </div>
              
              <div className="form-grid" style={{ marginBottom: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">Target Course / Grade</label>
                  <input required type="text" name="targetCourse" className="form-input" placeholder="e.g. B.Sc. Computer Science" value={formData.targetCourse} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Maximum Capacity</label>
                  <input required type="number" name="maxCapacity" min="1" className="form-input" value={formData.maxCapacity} onChange={handleChange} />
                </div>
              </div>

              <div className="form-grid" style={{ marginBottom: '2rem' }}>
                <div className="form-group">
                  <label className="form-label">Start Date</label>
                  <input required type="date" name="startDate" className="form-input" value={formData.startDate} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">End Date</label>
                  <input required type="date" name="endDate" className="form-input" value={formData.endDate} onChange={handleChange} />
                </div>
              </div>
              
              <div style={{ background: 'rgba(59,130,246,0.1)', padding: '1rem', borderRadius: 'var(--radius-md)', display: 'flex', gap: '0.75rem', marginBottom: '2rem' }}>
                <AlertTriangle size={20} color="#60a5fa" style={{ flexShrink: 0 }} />
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  New registers are created in <strong>DRAFT</strong> status. You must manually "Open" them to allow students to apply via the public application portal.
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Register'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
