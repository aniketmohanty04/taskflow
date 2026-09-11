import React from 'react';

export default function Navbar({ activeTab, setActiveTab, onNewTask, user, onLogout }) {
  return (
    <nav className="navbar">
      <div className="navbar__inner">
        {/* Brand */}
        <div className="navbar__brand">
          <div className="navbar__brand-icon">☑</div>
          <span className="navbar__brand-text">TO-DO-TRACKER</span>
        </div>

        {/* Tab Navigation */}
        <div className="navbar__tabs">
          <button
            className={`navbar__tab ${activeTab === 'tracker' ? 'active' : ''}`}
            onClick={() => setActiveTab('tracker')}
          >
            📊 Habit Tracker
          </button>
          <button
            className={`navbar__tab ${activeTab === 'tasks' ? 'active' : ''}`}
            onClick={() => setActiveTab('tasks')}
          >
            📋 Task Board
          </button>
        </div>

        {/* Actions & User Profile */}
        <div className="navbar__actions">
          {activeTab === 'tasks' && (
            <button className="btn btn-primary" onClick={onNewTask}>
              + New Task
            </button>
          )}

          {user && (
            <div className="navbar__user">
              <span className="navbar__user-avatar">
                {user.name ? user.name[0].toUpperCase() : 'U'}
              </span>
              <span className="navbar__user-name">{user.name}</span>
              <button
                className="btn btn-outline navbar__logout-btn"
                onClick={onLogout}
                title="Sign Out"
              >
                🚪 Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
