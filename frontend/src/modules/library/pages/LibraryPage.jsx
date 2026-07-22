import React, { useState, useEffect } from 'react';
import {
  BookOpen, Plus, Search, CheckCircle2, AlertCircle, Bookmark,
  RotateCcw, BookPlus, UserCheck, X, Check, Clock, Tag, MapPin
} from 'lucide-react';
import Header from '../../../shared/components/Header';
import { libraryApi } from '../api/libraryApi';
import { fetchStudents } from '../../core/api/coreApi';

const CATEGORIES = ['ALL', 'Computer Science', 'Mathematics', 'Physics', 'Business', 'Literature', 'General'];

const inputStyle = {
  width: '100%',
  padding: '0.55rem 0.75rem',
  borderRadius: '8px',
  border: '1px solid rgba(255,255,255,0.1)',
  background: 'rgba(255,255,255,0.04)',
  color: 'white',
  fontSize: '0.88rem',
  boxSizing: 'border-box',
};

const labelStyle = {
  fontSize: '0.78rem',
  fontWeight: 600,
  color: 'var(--text-muted)',
  display: 'block',
  marginBottom: '0.35rem',
};

function StatusBadge({ status }) {
  const cfg = {
    ISSUED:   { color: '#60a5fa', bg: 'rgba(96,165,250,0.15)',  label: 'Active Loan' },
    RETURNED: { color: '#34d399', bg: 'rgba(52,211,153,0.15)',  label: 'Returned' },
    OVERDUE:  { color: '#f87171', bg: 'rgba(248,113,113,0.15)',  label: 'Overdue' },
  }[status] || { color: '#94a3b8', bg: 'rgba(148,163,184,0.15)', label: status };

  return (
    <span style={{
      padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem',
      fontWeight: 700, color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.color}30`
    }}>
      {cfg.label}
    </span>
  );
}

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog' | 'circulation'
  const [books, setBooks] = useState([]);
  const [borrows, setBorrows] = useState([]);
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Add Book Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    title: '', author: '', isbn: '', publisher: '', category: 'Computer Science', copies: '3', location: 'Shelf A-1'
  });

  // Issue Book Modal
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [issueForm, setIssueForm] = useState({
    bookId: '', studentId: '', dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [bData, brData, sData, stData] = await Promise.all([
        libraryApi.getBooks(),
        libraryApi.getBorrows(),
        libraryApi.getStats(),
        fetchStudents()
      ]);
      if (bData.success) setBooks(bData.data);
      if (brData.success) setBorrows(brData.data);
      if (sData.success) setStats(sData.data);
      setStudents(stData || []);
    } catch (err) {
      console.error('Failed to load library data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleAddBook = async (e) => {
    e.preventDefault();
    try {
      const res = await libraryApi.createBook({
        ...addForm,
        copies: Number(addForm.copies)
      });
      if (res.success) {
        setShowAddModal(false);
        setAddForm({ title: '', author: '', isbn: '', publisher: '', category: 'Computer Science', copies: '3', location: 'Shelf A-1' });
        loadData();
      }
    } catch (err) {
      alert('Failed to add book: ' + (err.message || 'Check inputs'));
    }
  };

  const handleIssueBook = async (e) => {
    e.preventDefault();
    try {
      const res = await libraryApi.issueBook(issueForm);
      if (res.success) {
        setShowIssueModal(false);
        setIssueForm({ bookId: '', studentId: '', dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0] });
        loadData();
      }
    } catch (err) {
      alert('Failed to issue book: ' + (err.message || 'Check book availability'));
    }
  };

  const handleReturn = async (borrowId) => {
    try {
      const res = await libraryApi.returnBook(borrowId);
      if (res.success) {
        loadData();
      }
    } catch (err) {
      alert('Failed to process return: ' + err.message);
    }
  };

  const filteredBooks = books.filter(b => {
    const matchCat = selectedCategory === 'ALL' || b.category === selectedCategory;
    const term = searchTerm.toLowerCase();
    const matchSearch = !term ||
      b.title.toLowerCase().includes(term) ||
      b.author.toLowerCase().includes(term) ||
      b.isbn.toLowerCase().includes(term);
    return matchCat && matchSearch;
  });

  return (
    <div className="animate-fade-in">
      <Header />

      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(52,211,153,0.14) 0%, rgba(16,185,129,0.06) 100%)',
        border: '1px solid rgba(52,211,153,0.22)',
        borderRadius: '20px',
        padding: '1.75rem 2rem',
        marginBottom: '2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <div>
          <div style={{ fontSize: '0.78rem', color: '#34d399', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.3rem' }}>
            Resource Management
          </div>
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
            Library Suite & Catalog
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem', fontSize: '0.9rem' }}>
            Manage physical book inventory, process student loans, and calculate overdue returns.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.06)' }}
          >
            <BookPlus size={15} /> Add Book
          </button>
          <button
            onClick={() => setShowIssueModal(true)}
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'linear-gradient(135deg,#10b981,#059669)', border: 'none' }}
          >
            <UserCheck size={15} /> Issue Book Desk
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total Titles', value: stats?.totalTitles || 0, color: '#34d399', gradient: 'linear-gradient(90deg,#10b981,#06b6d4)' },
          { label: 'Available Stock', value: stats?.availableCopies || 0, color: '#60a5fa', gradient: 'linear-gradient(90deg,#3b82f6,#8b5cf6)' },
          { label: 'Active Loans', value: stats?.activeBorrows || 0, color: '#fbbf24', gradient: 'linear-gradient(90deg,#f59e0b,#d97706)' },
          { label: 'Overdue Returns', value: stats?.overdueBorrows || 0, color: '#f87171', gradient: 'linear-gradient(90deg,#ef4444,#dc2626)' },
        ].map(st => (
          <div key={st.label} className="card" style={{ position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: st.gradient }} />
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>{st.label}</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: st.color }}>{st.value}</div>
          </div>
        ))}
      </div>

      {/* View Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '1.5rem', gap: '1.5rem' }}>
        <button
          onClick={() => setActiveTab('catalog')}
          style={{
            padding: '0.6rem 0.2rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'catalog' ? '2px solid #34d399' : '2px solid transparent',
            color: activeTab === 'catalog' ? '#34d399' : 'var(--text-muted)',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}
        >
          <BookOpen size={16} /> Book Catalog ({books.length})
        </button>
        <button
          onClick={() => setActiveTab('circulation')}
          style={{
            padding: '0.6rem 0.2rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'circulation' ? '2px solid #34d399' : '2px solid transparent',
            color: activeTab === 'circulation' ? '#34d399' : 'var(--text-muted)',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}
        >
          <RotateCcw size={16} /> Loans & Returns ({borrows.length})
        </button>
      </div>

      {activeTab === 'catalog' ? (
        <>
          {/* Filters & Search */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '0.4rem 0.8rem',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    border: selectedCategory === cat ? '1px solid #34d399' : '1px solid rgba(255,255,255,0.08)',
                    background: selectedCategory === cat ? 'rgba(52,211,153,0.18)' : 'rgba(255,255,255,0.03)',
                    color: selectedCategory === cat ? '#34d399' : 'var(--text-muted)',
                    cursor: 'pointer',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div style={{ position: 'relative', width: '260px' }}>
              <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              <input
                type="text"
                placeholder="Search title, author, ISBN..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ ...inputStyle, paddingLeft: '2.2rem' }}
              />
            </div>
          </div>

          {/* Book Catalog Grid */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>Loading catalog...</div>
          ) : filteredBooks.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <BookOpen size={48} style={{ margin: '0 auto 1rem', opacity: 0.2 }} />
              <h3 style={{ fontWeight: 700, marginBottom: '0.4rem' }}>No books found</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Add a new book or adjust your search filter.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
              {filteredBooks.map(b => (
                <div key={b.id} className="card" style={{ padding: '1.35rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <span style={{ padding: '0.2rem 0.55rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700, color: '#34d399', background: 'rgba(52,211,153,0.12)' }}>
                        {b.category}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontFamily: 'monospace' }}>ISBN: {b.isbn}</span>
                    </div>

                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'white', marginBottom: '0.2rem' }}>{b.title}</h3>
                    <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>by {b.author}</div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                      {b.publisher && <div>Publisher: <span style={{ color: 'white' }}>{b.publisher}</span></div>}
                      {b.location && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <MapPin size={12} /> Shelf Location: <span style={{ color: 'white', fontWeight: 600 }}>{b.location}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ paddingTop: '0.85rem', marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.8rem' }}>
                      Available: <strong style={{ color: b.availableCopies > 0 ? '#34d399' : '#f87171' }}>{b.availableCopies}</strong> / {b.copies}
                    </div>
                    <button
                      disabled={b.availableCopies <= 0}
                      onClick={() => { setIssueForm({ ...issueForm, bookId: String(b.id) }); setShowIssueModal(true); }}
                      style={{ padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600, border: 'none', background: b.availableCopies > 0 ? 'rgba(52,211,153,0.15)' : 'rgba(255,255,255,0.04)', color: b.availableCopies > 0 ? '#34d399' : 'var(--text-dim)', cursor: b.availableCopies > 0 ? 'pointer' : 'not-allowed' }}
                    >
                      Issue
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        /* Loans Table */
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-dim)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Book Title</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Student</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Issued Date</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Due Date</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Status</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Fine Amount</th>
                  <th style={{ padding: '0.85rem 1.25rem', width: '100px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {borrows.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No borrowing records found.
                    </td>
                  </tr>
                ) : (
                  borrows.map(br => {
                    const isOverdue = br.status === 'ISSUED' && new Date() > new Date(br.dueDate);
                    const effectiveStatus = isOverdue ? 'OVERDUE' : br.status;

                    return (
                      <tr key={br.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '0.85rem 1.25rem' }}>
                          <div style={{ fontWeight: 700, color: 'white' }}>{br.book?.title}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>by {br.book?.author} (ISBN: {br.book?.isbn})</div>
                        </td>
                        <td style={{ padding: '0.85rem 1.25rem' }}>
                          <div style={{ fontWeight: 600, color: 'white' }}>{br.student?.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{br.student?.email}</div>
                        </td>
                        <td style={{ padding: '0.85rem 1.25rem', color: 'var(--text-muted)' }}>
                          {new Date(br.issuedAt).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '0.85rem 1.25rem', color: isOverdue ? '#f87171' : 'var(--text-muted)', fontWeight: isOverdue ? 700 : 400 }}>
                          {new Date(br.dueDate).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '0.85rem 1.25rem' }}>
                          <StatusBadge status={effectiveStatus} />
                        </td>
                        <td style={{ padding: '0.85rem 1.25rem', fontWeight: 700, color: br.fineAmount > 0 ? '#f87171' : 'var(--text-dim)' }}>
                          {br.fineAmount > 0 ? `$${br.fineAmount.toFixed(2)}` : '—'}
                        </td>
                        <td style={{ padding: '0.85rem 1.25rem' }}>
                          {br.status !== 'RETURNED' && (
                            <button
                              onClick={() => handleReturn(br.id)}
                              style={{ padding: '0.35rem 0.75rem', borderRadius: '6px', border: '1px solid rgba(52,211,153,0.3)', background: 'rgba(52,211,153,0.12)', color: '#34d399', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                            >
                              <RotateCcw size={13} /> Return
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD BOOK MODAL */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '520px', padding: '1.75rem', position: 'relative' }}>
            <button onClick={() => setShowAddModal(false)} style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
              <X size={18} />
            </button>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.25rem' }}>Add Book to Catalog</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>Register a new physical book record into inventory.</p>

            <form onSubmit={handleAddBook} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Book Title</label>
                <input type="text" required placeholder="e.g. Introduction to Algorithms" value={addForm.title} onChange={e => setAddForm({ ...addForm, title: e.target.value })} style={inputStyle} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Author</label>
                  <input type="text" required placeholder="e.g. Thomas H. Cormen" value={addForm.author} onChange={e => setAddForm({ ...addForm, author: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>ISBN</label>
                  <input type="text" required placeholder="e.g. 978-0262033848" value={addForm.isbn} onChange={e => setAddForm({ ...addForm, isbn: e.target.value })} style={inputStyle} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Category</label>
                  <select value={addForm.category} onChange={e => setAddForm({ ...addForm, category: e.target.value })} style={{ ...inputStyle, background: '#1e293b' }}>
                    {CATEGORIES.filter(c => c !== 'ALL').map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Total Copies</label>
                  <input type="number" min="1" required value={addForm.copies} onChange={e => setAddForm({ ...addForm, copies: e.target.value })} style={inputStyle} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Publisher (Optional)</label>
                  <input type="text" placeholder="e.g. MIT Press" value={addForm.publisher} onChange={e => setAddForm({ ...addForm, publisher: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Shelf Location</label>
                  <input type="text" placeholder="e.g. Rack CS-02" value={addForm.location} onChange={e => setAddForm({ ...addForm, location: e.target.value })} style={inputStyle} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary" style={{ background: 'linear-gradient(135deg,#10b981,#059669)', border: 'none' }}>Add Book</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ISSUE BOOK DESK MODAL */}
      {showIssueModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '480px', padding: '1.75rem', position: 'relative' }}>
            <button onClick={() => setShowIssueModal(false)} style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
              <X size={18} />
            </button>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.25rem' }}>Circulation Desk · Issue Book</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>Issue an available book copy to an enrolled student.</p>

            <form onSubmit={handleIssueBook} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Select Book</label>
                <select required value={issueForm.bookId} onChange={e => setIssueForm({ ...issueForm, bookId: e.target.value })} style={{ ...inputStyle, background: '#1e293b' }}>
                  <option value="">Choose Available Book...</option>
                  {books.filter(b => b.availableCopies > 0).map(b => (
                    <option key={b.id} value={b.id}>{b.title} (Avail: {b.availableCopies})</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Select Student</label>
                <select required value={issueForm.studentId} onChange={e => setIssueForm({ ...issueForm, studentId: e.target.value })} style={{ ...inputStyle, background: '#1e293b' }}>
                  <option value="">Choose Student...</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Due Date</label>
                <input type="date" required value={issueForm.dueDate} onChange={e => setIssueForm({ ...issueForm, dueDate: e.target.value })} style={{ ...inputStyle, background: '#1e293b' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowIssueModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary" style={{ background: 'linear-gradient(135deg,#10b981,#059669)', border: 'none' }}>Issue Book</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
