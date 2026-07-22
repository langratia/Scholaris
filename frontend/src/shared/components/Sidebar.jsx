import React from 'react';

export default function Sidebar({ currentView, setCurrentView }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'students', label: 'Students', icon: '👥' },
    { id: 'courses', label: 'Courses', icon: '📚' },
    { id: 'departments', label: 'Departments', icon: '🏢' },
    { id: 'faculty', label: 'Faculty', icon: '👨‍🏫' },
  ];

  return (
    <aside className="sidebar">
      <div>
        <div className="brand-container">
          <div className="brand-logo">
            <img src="/logo.png" alt="Scholaris Logo" />
          </div>
          <div className="brand-title">Scholaris</div>
        </div>

        <nav className="nav-group">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-link ${currentView === item.id ? 'active' : ''}`}
              onClick={() => setCurrentView(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="user-badge">
        <div className="avatar-circle">AD</div>
        <div className="user-info">
          <div className="user-name">Admin User</div>
          <div className="user-role">System Administrator</div>
        </div>
      </div>
    </aside>
  );
}
