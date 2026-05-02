import React, { useState } from 'react';

export default function Layout({ user, onLogout, navItems, children, color = '#4f46e5' }) {
  const [activeTab, setActiveTab] = useState(navItems[0].key);

  const ActiveComponent = navItems.find(n => n.key === activeTab)?.component;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <div style={{ width: 240, background: color, color: 'white', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '1.5rem', borderBottom: 'rgba(255,255,255,0.1) solid 1px' }}>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.3rem' }}>🏫 School</div>
          <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Portal</div>
        </div>

        <div style={{ padding: '1rem', flex: 1 }}>
          {navItems.map(item => (
            <button key={item.key} onClick={() => setActiveTab(item.key)}
              style={{ width: '100%', padding: '0.7rem 1rem', marginBottom: '0.2rem', border: 'none', borderRadius: 10, cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '0.7rem', fontSize: '0.9rem', fontWeight: 500,
                background: activeTab === item.key ? 'rgba(255,255,255,0.2)' : 'transparent',
                color: 'white', transition: 'background 0.2s' }}>
              <span>{item.icon}</span> {item.label}
            </button>
          ))}
        </div>

        <div style={{ padding: '1rem', borderTop: 'rgba(255,255,255,0.1) solid 1px' }}>
          <div style={{ fontSize: '0.85rem', marginBottom: '0.8rem', opacity: 0.8 }}>
            <div style={{ fontWeight: 600 }}>{user.name}</div>
            <div style={{ fontSize: '0.75rem', opacity: 0.7, textTransform: 'capitalize' }}>{user.role}</div>
          </div>
          <button onClick={onLogout} style={{ width: '100%', padding: '0.5rem', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 8, background: 'transparent', color: 'white', cursor: 'pointer', fontSize: '0.85rem' }}>
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <div style={{ padding: '2rem' }}>
          {ActiveComponent && <ActiveComponent />}
        </div>
      </div>
    </div>
  );
}
