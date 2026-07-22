import React from 'react';
import { Link } from 'react-router-dom';
import {
  Users, BookOpen, Building2, GraduationCap,
  ClipboardList, TrendingUp, Activity, ArrowUpRight,
  CheckCircle, Zap,
} from 'lucide-react';
import Header from '../../shared/components/Header';

const METRIC_CARDS = [
  {
    key: 'students',
    label: 'Enrolled Students',
    icon: Users,
    colorClass: 'icon-blue',
    gradient: 'linear-gradient(135deg,rgba(41,181,247,0.15),rgba(40,122,231,0.08))',
    accent: '#29B5F7',
    path: '/students',
  },
  {
    key: 'courses',
    label: 'Active Courses',
    icon: BookOpen,
    colorClass: 'icon-purple',
    gradient: 'linear-gradient(135deg,rgba(81,71,235,0.15),rgba(69,39,215,0.08))',
    accent: '#7465F3',
    path: '/courses',
  },
  {
    key: 'departments',
    label: 'Departments',
    icon: Building2,
    colorClass: 'icon-emerald',
    gradient: 'linear-gradient(135deg,rgba(16,185,129,0.15),rgba(5,150,105,0.08))',
    accent: '#10b981',
    path: '/departments',
  },
  {
    key: 'faculty',
    label: 'Faculty Staff',
    icon: GraduationCap,
    colorClass: 'icon-blue',
    gradient: 'linear-gradient(135deg,rgba(40,122,231,0.15),rgba(69,39,215,0.08))',
    accent: '#287AE7',
    path: '/faculty',
  },
];

const QUICK_LINKS = [
  { label: 'Open Admissions',  icon: ClipboardList, path: '/admissions',  color: '#29B5F7' },
  { label: 'Admit Student',    icon: Users,         path: '/students',    color: '#7465F3' },
  { label: 'Add Course',       icon: BookOpen,      path: '/courses',     color: '#10b981' },
  { label: 'Register Faculty', icon: GraduationCap, path: '/faculty',     color: '#f59e0b' },
];

export default function DashboardPage({ studentsCount, coursesCount, departmentsCount, facultyCount }) {
  const counts = { students: studentsCount, courses: coursesCount, departments: departmentsCount, faculty: facultyCount };
  const total = studentsCount + coursesCount + departmentsCount + facultyCount;

  return (
    <div className="animate-fade-in">
      <Header />

      {/* Welcome banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(40,122,231,0.12) 0%, rgba(81,71,235,0.10) 50%, rgba(69,39,215,0.08) 100%)',
        border: '1px solid rgba(40,122,231,0.2)',
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
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
            Welcome back
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
            Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, Admin 👋
          </div>
          <div style={{ color: 'var(--text-muted)', marginTop: '0.3rem', fontSize: '0.9rem' }}>
            Your institution currently has <strong style={{ color: 'white' }}>{studentsCount}</strong> enrolled students across <strong style={{ color: 'white' }}>{departmentsCount}</strong> departments.
          </div>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.6rem',
          padding: '0.7rem 1.2rem',
          background: 'rgba(255,255,255,0.05)',
          border: 'var(--glass-border)',
          borderRadius: '12px',
        }}>
          <Zap size={16} style={{ color: '#f59e0b' }} />
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            System Status: <strong style={{ color: '#34d399' }}>Operational</strong>
          </span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="metrics-grid">
        {METRIC_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.key} to={card.path} style={{ textDecoration: 'none' }}>
              <div className="metric-card" style={{ background: card.gradient, cursor: 'pointer' }}>
                <div className="metric-header">
                  <span className="metric-label">{card.label}</span>
                  <div className={`metric-icon ${card.colorClass}`}>
                    <Icon size={20} strokeWidth={1.75} />
                  </div>
                </div>
                <div className="metric-value">{counts[card.key]}</div>
                <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: card.accent }}>
                  <ArrowUpRight size={13} />
                  <span>View all {card.label.toLowerCase()}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions + System Status */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>

        {/* Quick Actions */}
        <div className="glass-panel" style={{ marginBottom: 0 }}>
          <h2 className="panel-title">
            <Zap size={18} style={{ color: '#f59e0b' }} /> Quick Actions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '0.5rem' }}>
            {QUICK_LINKS.map((ql) => {
              const Icon = ql.icon;
              return (
                <Link key={ql.label} to={ql.path} style={{ textDecoration: 'none' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.85rem 1rem',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '12px',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = `${ql.color}12`; e.currentTarget.style.borderColor = `${ql.color}30`; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: 34, height: 34, borderRadius: '9px', background: `${ql.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon size={16} strokeWidth={1.75} style={{ color: ql.color }} />
                      </div>
                      <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-main)' }}>{ql.label}</span>
                    </div>
                    <ArrowUpRight size={14} style={{ color: 'var(--text-dim)' }} />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* System Status */}
        <div className="glass-panel" style={{ marginBottom: 0 }}>
          <h2 className="panel-title">
            <Activity size={18} style={{ color: '#34d399' }} /> Platform Status
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
            {[
              { label: 'Frontend',      value: 'React 19 + Vite',           status: 'ok', color: '#34d399' },
              { label: 'Backend API',   value: 'Node.js / Express',          status: 'ok', color: '#34d399' },
              { label: 'Database',      value: 'PostgreSQL (Docker)',        status: 'ok', color: '#34d399' },
              { label: 'ORM',           value: 'Prisma 5 + Zod Validation', status: 'ok', color: '#34d399' },
              { label: 'Architecture',  value: 'Domain-Driven Modules',      status: 'ok', color: '#29B5F7' },
            ].map((item) => (
              <div key={item.label} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0.65rem 0',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
              }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{item.label}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={13} style={{ color: item.color }} />
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: item.color }}>{item.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
