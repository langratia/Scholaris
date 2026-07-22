import React from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Search } from 'lucide-react';

const PAGE_META = {
  '/dashboard':   { title: 'Institutional Dashboard', subtitle: 'System overview and live metrics' },
  '/admissions':  { title: 'Admissions Registry',     subtitle: 'Campaigns, applications & enrolment pipeline' },
  '/finance':     { title: 'Finance Registry',        subtitle: 'Student billing, invoices and payment collection' },
  '/finance/terms':{ title: 'Fee Terms Setup',        subtitle: 'Define fee structures and installment percentages' },
  '/students':    { title: 'Student Registry',         subtitle: 'Enrolled students and academic profiles' },
  '/courses':     { title: 'Course Catalog',           subtitle: 'Academic courses and instructor assignments' },
  '/departments': { title: 'Departments',              subtitle: 'Institutional academic departments' },
  '/faculty':     { title: 'Faculty Directory',        subtitle: 'Teaching staff and department assignments' },
};

export default function Header({ title, subtitle, actions }) {
  const location = useLocation();
  const meta = PAGE_META[location.pathname] || { title, subtitle };
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="page-header">
      <div>
        {/* Breadcrumb */}
        <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: '0.35rem', letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 600 }}>
          Scholaris &rsaquo; {meta.title}
        </div>
        <h1 className="page-title">{meta.title || title}</h1>
        {(meta.subtitle || subtitle) && (
          <p className="page-subtitle">{meta.subtitle || subtitle}</p>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Date */}
        <div style={{ textAlign: 'right', marginRight: '0.5rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>{dateStr}</div>
        </div>

        {/* Actions slot */}
        {actions}

        {/* Notification bell */}
        <button style={{
          width: 40, height: 40, borderRadius: '10px',
          background: 'rgba(255,255,255,0.04)', border: 'var(--glass-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: 'var(--text-muted)', transition: 'all 0.2s',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'white'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
        >
          <Bell size={16} strokeWidth={1.75} />
        </button>
      </div>
    </div>
  );
}
