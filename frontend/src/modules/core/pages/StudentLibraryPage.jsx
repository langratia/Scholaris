import React, { useState, useEffect } from 'react';
import { BookOpen, Search, Clock, CheckCircle2, AlertCircle, MapPin, Bookmark } from 'lucide-react';
import { useStudentPortal } from '../context/StudentPortalContext';
import { libraryApi } from '../../library/api/libraryApi';

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

function LoanStatusBadge({ status }) {
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

export default function StudentLibraryPage() {
  const { student } = useStudentPortal();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const myBorrows = student?.bookBorrows || [];

  useEffect(() => {
    fetchCatalog();
  }, []);

  const fetchCatalog = async () => {
    try {
      setLoading(true);
      const res = await libraryApi.getBooks();
      if (res.success) setBooks(res.data);
    } catch (err) {
      console.error('Failed to fetch library catalog:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = books.filter(b => {
    const matchCat = selectedCategory === 'ALL' || b.category === selectedCategory;
    const term = searchTerm.toLowerCase();
    const matchSearch = !term ||
      b.title.toLowerCase().includes(term) ||
      b.author.toLowerCase().includes(term) ||
      b.isbn.toLowerCase().includes(term);
    return matchCat && matchSearch;
  });

  const activeBorrows = myBorrows.filter(b => b.status === 'ISSUED');

  return (
    <div className="animate-fade-in">
      {/* Page Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
          Digital Library & Catalog
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          Explore campus library books and monitor your active book loans.
        </p>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Currently Borrowed', value: activeBorrows.length, color: '#60a5fa', gradient: 'linear-gradient(90deg,#3b82f6,#8b5cf6)' },
          { label: 'Total Books Read', value: myBorrows.filter(b => b.status === 'RETURNED').length, color: '#34d399', gradient: 'linear-gradient(90deg,#10b981,#06b6d4)' },
          { label: 'Catalog Titles', value: books.length, color: '#fbbf24', gradient: 'linear-gradient(90deg,#f59e0b,#d97706)' },
        ].map(s => (
          <div key={s.label} className="card" style={{ position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: s.gradient }} />
            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>{s.label}</div>
            <div style={{ fontSize: '1.65rem', fontWeight: 800, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Active Loans Section */}
      {myBorrows.length > 0 && (
        <div style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>My Borrowed Books</h2>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-dim)', fontSize: '0.73rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <th style={{ padding: '0.85rem 1.25rem' }}>Book Title</th>
                    <th style={{ padding: '0.85rem 1.25rem' }}>Issued Date</th>
                    <th style={{ padding: '0.85rem 1.25rem' }}>Due Date</th>
                    <th style={{ padding: '0.85rem 1.25rem' }}>Status</th>
                    <th style={{ padding: '0.85rem 1.25rem' }}>Fine / Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {myBorrows.map(br => {
                    const isOverdue = br.status === 'ISSUED' && new Date() > new Date(br.dueDate);
                    const effectiveStatus = isOverdue ? 'OVERDUE' : br.status;

                    return (
                      <tr key={br.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '0.85rem 1.25rem' }}>
                          <div style={{ fontWeight: 700, color: 'white' }}>{br.book?.title}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>by {br.book?.author} (ISBN: {br.book?.isbn})</div>
                        </td>
                        <td style={{ padding: '0.85rem 1.25rem', color: 'var(--text-muted)' }}>
                          {new Date(br.issuedAt).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '0.85rem 1.25rem', color: isOverdue ? '#f87171' : 'var(--text-muted)', fontWeight: isOverdue ? 700 : 400 }}>
                          {new Date(br.dueDate).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '0.85rem 1.25rem' }}>
                          <LoanStatusBadge status={effectiveStatus} />
                        </td>
                        <td style={{ padding: '0.85rem 1.25rem', color: br.fineAmount > 0 ? '#f87171' : 'var(--text-dim)', fontWeight: br.fineAmount > 0 ? 700 : 400 }}>
                          {br.fineAmount > 0 ? `Fine: $${br.fineAmount.toFixed(2)}` : 'No fines'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Catalog Search & Browse */}
      <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Browse Campus Catalog</h2>

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
            placeholder="Search catalog..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ ...inputStyle, paddingLeft: '2.2rem' }}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading catalog...</div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ padding: '3.5rem', textAlign: 'center' }}>
          <BookOpen size={44} style={{ margin: '0 auto 1rem', opacity: 0.2 }} />
          <h3 style={{ fontWeight: 600, marginBottom: '0.4rem' }}>No books matching search</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Try searching with a different title or category.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {filtered.map(b => (
            <div key={b.id} className="card" style={{ padding: '1.35rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <span style={{ padding: '0.2rem 0.55rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700, color: '#34d399', background: 'rgba(52,211,153,0.12)' }}>
                    {b.category}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{b.isbn}</span>
                </div>

                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'white', marginBottom: '0.2rem' }}>{b.title}</h3>
                <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>by {b.author}</div>

                {b.location && (
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <MapPin size={12} /> Shelf Location: <span style={{ color: 'white', fontWeight: 600 }}>{b.location}</span>
                  </div>
                )}
              </div>

              <div style={{ paddingTop: '0.85rem', marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: b.availableCopies > 0 ? '#34d399' : '#f87171', fontWeight: 600 }}>
                  {b.availableCopies > 0 ? `${b.availableCopies} available` : 'Out of stock'}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Contact Librarian to borrow</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
